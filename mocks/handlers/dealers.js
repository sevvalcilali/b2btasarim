// GET/POST /bayiler · GET/PUT /bayiler/{cariNo} · POST /bayiler/toplu(/onizleme) — şartname s.5 (bayi tanım yönetimi),
// s.2 / s.10 Excel ile toplu ekleme
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { subDealersOf, mainCompany, audit, company, companyResponse, includes, authErrors, conditionErrors, counters } from "../rules";
import { latency, error, ruleError, uc, requirePermission, authorized } from "./helpers";
import { csvFromFile, parseTl } from "../csv";

/** Rolün tanımlayıp düzenleyebildiği kayıtlar: ana firma → bayiler; bayi → kendi alt bayileri */
export function managed(caller) {
  const all = store.table("companies");
  if (caller.rol === "ANA_FIRMA") return all.filter((f) => f.tur === "BAYI");
  if (caller.rol === "BAYI") return subDealersOf(caller.firmaId);
  return [];
}

/** Yeni kayıt için yetki ve tür kontrolü. Dönüş: hata cevabı ya da null */
function permissionCheck(caller, kind) {
  const permissionError = requirePermission(caller, "BAYI_TANIM");
  if (permissionError) return permissionError;
  if (caller.rol === "ANA_FIRMA" && kind === "BAYI") return null;
  if (caller.rol === "BAYI" && kind === "ALT_BAYI") {
    return company(caller.firmaId)?.altBayiYetkisi ? null : error(403, "ALT_BAYI_YETKISI_YOK", "Alt bayi tanımlama yetkiniz bulunmuyor. Bu yetki ana firmanın bayi tanımından açılır.");
  }
  return error(403, "YETKI_YOK", "Bu türde kayıt tanımlama yetkiniz yok.");
}

const clear = (g) => ({
  unvan: String(g.unvan || "").trim(),
  cariNo: String(g.cariNo || "").trim(),
  vergiNo: String(g.vergiNo || "").replace(/\D/g, ""),
  telefon: String(g.telefon || "").trim(),
  email: String(g.email || "").trim(),
  adres: String(g.adres || "").trim(),
});

/** Toplu dosyanın bir satırı → BayiGirdisi; boş koşullar tanımlayanın kendi sınırlarıyla dolar */
function rowToInput(s, caller, parent) {
  const installments = String(s.taksitler || "").trim()
    ? String(s.taksitler).split(/[,\s]+/).filter(Boolean).map(Number)
    : parent ? parent.taksitler : [1, 2, 3, 6, 9, 12];
  const limitCents = parseTl(s.islemlimititl ?? s.islemlimiti);
  return {
    tur: caller.rol === "ANA_FIRMA" ? "BAYI" : "ALT_BAYI",
    ...clear({ unvan: s.unvan, cariNo: s.carino, vergiNo: s.vergino, telefon: s.telefon, email: s.email ?? s.eposta, adres: s.adres }),
    vadeProfilId: s.vadeprofilid ? Number(s.vadeprofilid) : parent?.vadeProfilId ?? 1,
    taksitler: installments,
    islemLimitiKurus: limitCents === null ? parent?.islemLimitiKurus ?? 15000000 : limitCents,
    uyeIsyerleri: parent ? parent.uyeIsyerleri : store.table("merchants").map((u) => u.cariNo),
    altBayiYetkisi: caller.rol === "ANA_FIRMA" ? /^(evet|e|1|true)$/i.test(String(s.altbayiyetkisi || "")) : undefined,
    durum: /^pasif$/i.test(String(s.durum || "").trim()) ? "PASIF" : "AKTIF", // ASCII karşılaştırma: tr-TR büyütme i→İ yapar
  };
}

/** Dosyayı okuyup her satırı doğrular; { cevap } (hata) ya da { satirlar } */
async function parseBulk(request, caller) {
  const permissionError = permissionCheck(caller, caller.rol === "ANA_FIRMA" ? "BAYI" : "ALT_BAYI");
  if (permissionError) return { cevap: permissionError };
  const fd = await request.formData().catch(() => null);
  if (!fd) return { cevap: error(400, "GECERSIZ_GOVDE", "Form verisi okunamadı.") };
  const readItem = await csvFromFile(fd);
  if (readItem.hata) return { cevap: ruleError("DOSYA", readItem.hata, { dosya: readItem.hata }) };
  const required = ["unvan", "carino", "vergino", "telefon", "email", "adres"];
  const missing = required.filter((b) => !readItem.basliklar.includes(b));
  if (missing.length) return { cevap: ruleError("BASLIK", `Eksik sütun: ${missing.join(", ")}. Şablonu kullanın.`, { dosya: `Eksik sütun: ${missing.join(", ")}` }) };
  const parent = caller.rol === "BAYI" ? company(caller.firmaId) : null;
  const seen = new Set();
  const rows = readItem.satirlar.map((s, i) => {
    const input = rowToInput(s, caller, parent);
    const errors = { ...authErrors(input), ...conditionErrors(input, parent) };
    if (!errors.cariNo && seen.has(input.cariNo)) errors.cariNo = "Dosyada aynı cari no birden çok kez var.";
    seen.add(input.cariNo);
    return { sira: i + 2, girdi: input, hatalar: errors, gecerli: Object.keys(errors).length === 0 };
  });
  return { satirlar: rows };
}

const bulkSummary = (rows) => ({ toplam: rows.length, gecerli: rows.filter((s) => s.gecerli).length, hatali: rows.filter((s) => !s.gecerli).length, satirlar: rows });

export const dealersHandlers = [
  // Toplu ekleme önizlemesi: dosya doğrulanır, hiçbir kayıt yazılmaz
  http.post(uc("/bayiler/toplu/onizleme"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const { satirlar: rows, cevap: errorResponse } = await parseBulk(request, caller);
    return errorResponse || HttpResponse.json(bulkSummary(rows));
  }),

  // Toplu ekleme: geçerli satırlar kaydedilir, hatalılar atlanır (önizlemede görülmüş olur)
  http.post(uc("/bayiler/toplu"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const { satirlar: rows, cevap: errorResponse } = await parseBulk(request, caller);
    if (errorResponse) return errorResponse;
    const newItems = rows
      .filter((s) => s.gecerli)
      .map(({ girdi: g }) => ({
        firmaId: g.cariNo,
        tur: g.tur,
        unvan: g.unvan,
        cariNo: g.cariNo,
        vergiNo: g.vergiNo,
        telefon: g.telefon,
        email: g.email,
        adres: g.adres,
        vadeProfilId: g.vadeProfilId,
        taksitler: [...g.taksitler].sort((a, b) => a - b),
        islemLimitiKurus: g.islemLimitiKurus,
        ortaklar: [],
        bagliFirmaId: caller.rol === "ANA_FIRMA" ? mainCompany().firmaId : caller.firmaId,
        uyeIsyerleri: g.uyeIsyerleri,
        ...(g.tur === "BAYI" ? { altBayiYetkisi: !!g.altBayiYetkisi } : {}),
        durum: g.durum,
        olusturma: audit(caller),
        sonDegisiklik: audit(caller),
      }));
    if (newItems.length) store.update("companies", (l) => [...l, ...newItems]);
    return HttpResponse.json({ ...bulkSummary(rows), eklenen: newItems.length, atlanan: rows.length - newItems.length, kayitlar: newItems.map(companyResponse) }, { status: 201 });
  }),

  http.get(uc("/bayiler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const s = new URL(request.url).searchParams;
    const kind = s.get("tur") || (caller.rol === "BAYI" ? "ALT_BAYI" : "BAYI");
    const status = s.get("durum");
    const q = (s.get("q") || "").trim();
    if (caller.rol === "ALT_BAYI") return error(403, "YETKI_YOK", "Alt bayinin bayi tanımı yoktur.");
    if (caller.rol === "BAYI" && kind !== "ALT_BAYI") return error(403, "YETKI_YOK", "Bayi yalnızca kendi alt bayilerini görür.");
    const source = kind === "ALT_BAYI" && caller.rol === "ANA_FIRMA" ? store.table("companies").filter((f) => f.tur === "ALT_BAYI") : managed(caller);
    const candidates = source.filter((f) => !q || [f.unvan, f.cariNo, f.vergiNo].some((x) => includes(x, q)));
    const list = candidates.filter((f) => !status || f.durum === status);
    return HttpResponse.json({
      kayitlar: list.map(companyResponse),
      toplam: list.length,
      sayfa: 1,
      boyut: Math.max(list.length, 1),
      sayaclar: counters(candidates, "durum", ["AKTIF", "PASIF"]),
      // ana firma ağdaki alt bayileri yalnızca görüntüler; tanımı bağlı bayi yapar
      duzenlenebilir: !(kind === "ALT_BAYI" && caller.rol === "ANA_FIRMA"),
    });
  }),

  http.get(uc("/bayiler/:cariNo"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const f = managed(caller).find((x) => x.cariNo === decodeURIComponent(params.cariNo));
    return f ? HttpResponse.json(companyResponse(f)) : error(404, "BAYI_YOK", "Bayi bulunamadı ya da kapsamınızda değil.");
  }),

  http.post(uc("/bayiler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const permissionError = permissionCheck(caller, g.tur);
    if (permissionError) return permissionError;
    const auth = clear(g);
    const parent = caller.rol === "BAYI" ? company(caller.firmaId) : null;
    const fields = { ...authErrors(auth), ...conditionErrors(g, parent) };
    if (fields.cariNo?.includes("başka bir kayıtta")) return error(409, "CARI_CAKISMASI", fields.cariNo, { cariNo: fields.cariNo });
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const draft = {
      firmaId: auth.cariNo,
      tur: g.tur,
      ...auth,
      vadeProfilId: g.vadeProfilId,
      taksitler: [...g.taksitler].sort((a, b) => a - b),
      islemLimitiKurus: g.islemLimitiKurus,
      ortaklar: [],
      bagliFirmaId: caller.rol === "ANA_FIRMA" ? mainCompany().firmaId : caller.firmaId,
      uyeIsyerleri: g.uyeIsyerleri,
      ...(g.tur === "BAYI" ? { altBayiYetkisi: !!g.altBayiYetkisi } : {}),
      durum: g.durum,
      olusturma: audit(caller),
      sonDegisiklik: audit(caller),
    };
    store.update("companies", (l) => [...l, draft]);
    return HttpResponse.json(companyResponse(draft), { status: 201 });
  }),

  http.put(uc("/bayiler/:cariNo"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const permissionError = requirePermission(caller, "BAYI_TANIM", ["ANA_FIRMA", "BAYI"]);
    if (permissionError) return permissionError;
    const accountNo = decodeURIComponent(params.cariNo);
    const existing = managed(caller).find((x) => x.cariNo === accountNo);
    if (!existing) return error(404, "BAYI_YOK", "Bayi bulunamadı ya da kapsamınızda değil.");
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const auth = { ...clear(g), cariNo: accountNo }; // cari no değiştirilemez
    const parent = caller.rol === "BAYI" ? company(caller.firmaId) : null;
    const fields = { ...authErrors(auth, { mevcutCariNo: accountNo }), ...conditionErrors(g, parent, { mevcutProfilId: existing.vadeProfilId }) };
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const current = store.replace("companies", "cariNo", accountNo, (f) => ({
      ...f,
      ...auth,
      sonDegisiklik: audit(caller),
      vadeProfilId: g.vadeProfilId,
      taksitler: [...g.taksitler].sort((a, b) => a - b),
      islemLimitiKurus: g.islemLimitiKurus,
      uyeIsyerleri: g.uyeIsyerleri,
      ...(f.tur === "BAYI" ? { altBayiYetkisi: !!g.altBayiYetkisi } : {}),
      durum: g.durum,
    }));
    return HttpResponse.json(companyResponse(current));
  }),
];

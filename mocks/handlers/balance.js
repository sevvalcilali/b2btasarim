// GET /bakiye/ekstre — üst cari karşısındaki bakiye, borç ve hareketler (şartname s.2: Ana Firma / Bayi Bakiye ve Borç).
// POST /bakiye/toplu(/onizleme) — ana firma bayilerinin, bayi alt bayilerinin bakiye / borç / limitini dosyadan yükler (s.2, s.10).
// Hareketler: borç yüklemeleri (tohum) + bu firmanın yaptığı ödemeler, iade ve iptaller (işlem tablosu).
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { company, companySummary, now, dateRange } from "../rules";
import { latency, error, ruleError, uc, requirePermission, authorized } from "./helpers";
import { csvFromFile, parseTl } from "../csv";
import { managed } from "./dealers";


/** İşlem → hareket: ödeme borcu düşürür, iade / iptal geri ekler */
function transactionEntry(t) {
  if (t.durum === "BASARILI") return { tur: "ODEME", tutarKurus: -t.tutarKurus, aciklama: `${t.musteri?.unvan || "Müşteri"} ödemesi · ${t.taksit > 1 ? `${t.taksit} taksit` : "tek çekim"}` };
  if (t.durum === "IADE" || t.durum === "IPTAL") return { tur: t.durum, tutarKurus: t.tutarKurus, aciklama: `${t.musteri?.unvan || "Müşteri"} ${t.durum === "IADE" ? "iadesi" : "iptali"}` };
  return null;
}

/** Dosyayı okuyup satırları doğrular: cari yönetilen bir bayi olmalı, tutarlar ≥ 0, borç limiti aşmamalı */
async function parseBulk(request, caller) {
  const permissionError = requirePermission(caller, "BAYI_TANIM", ["ANA_FIRMA", "BAYI"]);
  if (permissionError) return { cevap: permissionError };
  const fd = await request.formData().catch(() => null);
  if (!fd) return { cevap: error(400, "GECERSIZ_GOVDE", "Form verisi okunamadı.") };
  const readItem = await csvFromFile(fd);
  if (readItem.hata) return { cevap: ruleError("DOSYA", readItem.hata, { dosya: readItem.hata }) };
  if (!readItem.basliklar.includes("carino")) return { cevap: ruleError("BASLIK", "Eksik sütun: cariNo. Şablonu kullanın.", { dosya: "Eksik sütun: cariNo" }) };
  const dealers = managed(caller);
  const seen = new Set();
  const rows = readItem.satirlar.map((s, i) => {
    const accountNo = String(s.carino || "").trim();
    const dealer = dealers.find((f) => f.cariNo === accountNo);
    const existing = (dealer && store.table("balances")[dealer.firmaId]) || { bakiyeKurus: 0, borcKurus: 0, limitKurus: 0 };
    const read = (k, old) => {
      const v = parseTl(s[k]);
      return v === null ? old : v;
    };
    const input = { cariNo: accountNo, unvan: dealer?.unvan || null, bakiyeKurus: read("bakiyetl", existing.bakiyeKurus), borcKurus: read("borctl", existing.borcKurus), limitKurus: read("limittl", existing.limitKurus), aciklama: String(s.aciklama || "").trim() };
    const errors = {};
    if (!dealer) errors.cariNo = "Bu cari no yönettiğiniz bir bayiye ait değil.";
    else if (seen.has(accountNo)) errors.cariNo = "Dosyada aynı cari no birden çok kez var.";
    seen.add(accountNo);
    for (const k of ["bakiyeKurus", "borcKurus", "limitKurus"]) if (!(Number.isInteger(input[k]) && input[k] >= 0)) errors[k] = "Geçerli bir tutar girin (örn. 12.500,00).";
    if (!errors.borcKurus && !errors.limitKurus && input.limitKurus && input.borcKurus > input.limitKurus) errors.borcKurus = "Borç, limiti aşamaz.";
    if (parseTl(s.bakiyetl) === null && parseTl(s.borctl) === null && parseTl(s.limittl) === null) errors.bakiyeKurus = "Bakiye, borç ya da limitten en az birini girin.";
    return { sira: i + 2, girdi: input, eski: dealer ? { ...existing } : null, hatalar: errors, gecerli: Object.keys(errors).length === 0, firmaId: dealer?.firmaId };
  });
  return { satirlar: rows };
}

const bulkSummary = (rows) => ({ toplam: rows.length, gecerli: rows.filter((s) => s.gecerli).length, hatali: rows.filter((s) => !s.gecerli).length, satirlar: rows.map(({ firmaId: companyId, ...s }) => s) });

export const balanceHandlers = [
  http.post(uc("/bakiye/toplu/onizleme"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const { satirlar: rows, cevap: errorResponse } = await parseBulk(request, caller);
    return errorResponse || HttpResponse.json(bulkSummary(rows));
  }),

  http.post(uc("/bakiye/toplu"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const { satirlar: rows, cevap: errorResponse } = await parseBulk(request, caller);
    if (errorResponse) return errorResponse;
    const validItems = rows.filter((s) => s.gecerli);
    store.update("balances", (b) => {
      const draft = { ...b };
      for (const s of validItems) {
        const { bakiyeKurus: balanceCents, borcKurus: debtCents, limitKurus: limitCents } = s.girdi;
        draft[s.firmaId] = { bakiyeKurus: balanceCents, borcKurus: debtCents, limitKurus: limitCents, kullanimYuzde: limitCents ? Math.min(100, Math.round((debtCents / limitCents) * 100)) : 0 };
      }
      return draft;
    });
    // borç artışı ekstreye hareket olarak düşer
    const time = now();
    const entries = validItems
      .filter((s) => s.girdi.borcKurus > (s.eski?.borcKurus || 0))
      .map((s, i) => ({ hareketId: `BH-${Date.now()}-${i}`, firmaId: s.firmaId, tarih: time, aciklama: s.girdi.aciklama || "Toplu borç yüklemesi", tutarKurus: s.girdi.borcKurus - (s.eski?.borcKurus || 0) }));
    if (entries.length) store.update("debtEntries", (l) => [...entries, ...l]);
    return HttpResponse.json({ ...bulkSummary(rows), guncellenen: validItems.length, atlanan: rows.length - validItems.length }, { status: 200 });
  }),

  http.get(uc("/bakiye/ekstre"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const f = company(caller.firmaId);
    if (!f?.bagliFirmaId) return error(403, "YETKI_YOK", "Ana firmanın üst carisi yoktur; firma limiti ana sayfada gösterilir.");
    const range = dateRange(new URL(request.url).searchParams);
    const b = store.table("balances")[caller.firmaId] || { bakiyeKurus: 0, borcKurus: 0, limitKurus: 0, kullanimYuzde: 0 };

    const all = [
      ...store.table("debtEntries").filter((h) => h.firmaId === caller.firmaId).map((h) => ({ hareketId: h.hareketId, tarih: h.tarih, tur: "BORC", aciklama: h.aciklama, islemNo: null, tutarKurus: h.tutarKurus })),
      ...store
        .table("transactions")
        .filter((t) => t.cekimYapanId === caller.firmaId)
        .map((t) => {
          const h = transactionEntry(t);
          return h && { hareketId: `IH-${t.islemNo}`, tarih: t.tarih, islemNo: t.islemNo, ...h };
        })
        .filter(Boolean),
    ].sort((a, b2) => b2.tarih.localeCompare(a.tarih));
    const entries = all.filter((h) => range.icinde(h.tarih));
    const total = (f2) => entries.filter(f2).reduce((t, h) => t + Math.abs(h.tutarKurus), 0);
    return HttpResponse.json({
      ustCari: companySummary(f.bagliFirmaId),
      bakiyeKurus: b.bakiyeKurus,
      borcKurus: b.borcKurus,
      limitKurus: b.limitKurus,
      kullanimYuzde: b.kullanimYuzde,
      sonGuncelleme: now(Date.now() - 35 * 60000),
      aralik: { baslangic: range.baslangic, bitis: range.bitis, gun: range.gun },
      hareketler: entries,
      donemToplami: { borcKurus: total((h) => h.tur === "BORC"), odemeKurus: total((h) => h.tur === "ODEME"), iadeIptalKurus: total((h) => h.tur === "IADE" || h.tur === "IPTAL") },
    });
  }),
];

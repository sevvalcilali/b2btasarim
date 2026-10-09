// GET/POST /vade-farki-profilleri · PUT /vade-farki-profilleri/{id} · GET /uye-isyerleri
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { audit, company, installmentCalc } from "../rules";
import { latency, error, ruleError, uc, requirePermission, authorized } from "./helpers";

const PROFILE_LIMIT = 5; // şartname s.4: en çok 5 profil
const SAMPLE = { tutarKurus: 1000000, taksit: 6 }; // ekrandaki örnek hesap: ₺10.000, 6 taksit

const activeDealersUsing = (id) => store.table("companies").filter((f) => f.vadeProfilId === id && f.tur !== "ANA_FIRMA" && f.durum === "AKTIF");

/** Depodaki profil → sözleşmedeki VadeFarkiProfili (kullanım sayısı ve örnek hesap sunucuda) */
function profileResponse(p) {
  return { ...p, olusturma: p.olusturma ?? null, sonDegisiklik: p.sonDegisiklik ?? null, kullananBayiSayisi: activeDealersUsing(p.id).length, ornek: { ...SAMPLE, vadeFarkiKurus: installmentCalc(SAMPLE.tutarKurus, SAMPLE.taksit, p.oranYuzde).vadeFarkiKurus } };
}

const normalize = (s) => String(s ?? "").trim().toLocaleLowerCase("tr-TR");

/** Profil girdisi doğrulama; mevcut (düzenlenen profil) ad çakışmasını ve aktiften pasife geçişi denetler */
function profileErrors(g, existing) {
  const h = {};
  const existingId = existing?.id;
  const name = String(g.ad ?? "").trim();
  if (!name) h.ad = "Profil adı girin.";
  else if (store.table("maturityProfiles").some((p) => p.id !== existingId && normalize(p.ad) === normalize(name))) h.ad = "Bu adda bir profil zaten var.";
  const rate = Number(g.oranYuzde);
  if (!(Number.isFinite(rate) && rate >= 0 && rate <= 10)) h.oranYuzde = "Aylık oran %0 ile %10 arasında olmalı.";
  if (!["AKTIF", "PASIF"].includes(g.durum)) h.durum = "Durum AKTIF ya da PASIF olmalı.";
  else if (g.durum === "PASIF" && existing && existing.durum !== "PASIF") {
    const n = activeDealersUsing(existingId).length;
    if (n) h.durum = `${n} aktif bayi bu profili kullanıyor; önce bayi tanımlarındaki profili değiştirin.`;
  }
  return h;
}

const clear = (g) => ({ ad: String(g.ad).trim(), oranYuzde: Math.round(Number(g.oranYuzde) * 100) / 100, aciklama: String(g.aciklama ?? "").trim(), durum: g.durum });

export const definitionsHandlers = [
  http.get(uc("/vade-farki-profilleri"), async ({ request }) => {
    await latency();
    const { cevap: response } = authorized(request);
    if (response) return response;
    return HttpResponse.json({ kayitlar: store.table("maturityProfiles").map(profileResponse), sinir: PROFILE_LIMIT });
  }),

  // Yalnız ana firma profil tanımlar (şartname s.4)
  http.post(uc("/vade-farki-profilleri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const permissionError = requirePermission(caller, "AYARLAR", ["ANA_FIRMA"]);
    if (permissionError) return permissionError;
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const profiles = store.table("maturityProfiles");
    if (profiles.length >= PROFILE_LIMIT) return ruleError("PROFIL_SINIRI", `En çok ${PROFILE_LIMIT} vade farkı profili tanımlanabilir.`);
    const fields = profileErrors(g);
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const draft = { id: Math.max(0, ...profiles.map((p) => p.id)) + 1, ...clear(g), olusturma: audit(caller), sonDegisiklik: audit(caller) };
    store.update("maturityProfiles", (l) => [...l, draft]);
    return HttpResponse.json(profileResponse(draft), { status: 201 });
  }),

  http.put(uc("/vade-farki-profilleri/:id"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const permissionError = requirePermission(caller, "AYARLAR", ["ANA_FIRMA"]);
    if (permissionError) return permissionError;
    const id = Number(params.id);
    const existing = store.table("maturityProfiles").find((p) => p.id === id);
    if (!existing) return error(404, "PROFIL_YOK", "Profil bulunamadı.");
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const fields = profileErrors(g, existing);
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const current = store.replace("maturityProfiles", "id", id, (p) => ({ ...p, ...clear(g), sonDegisiklik: audit(caller) }));
    return HttpResponse.json(profileResponse(current));
  }),

  // Bayi / alt bayi yalnızca kendisine açılan üye işyerlerini görür (şartname s.5)
  http.get(uc("/uye-isyerleri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const all = store.table("merchants");
    const open = caller.rol === "ANA_FIRMA" ? null : company(caller.firmaId)?.uyeIsyerleri || [];
    return HttpResponse.json({ kayitlar: all.filter((u) => !open || open.includes(u.cariNo)) });
  }),
];

// GET/POST /kullanicilar · PUT /kullanicilar/{kullaniciId} — şartname s.3: her firma kendi kullanıcılarını yönetir;
// yetki Yönetici / Ödeme / Raporlama. Yalnız Yönetici ekler ve düzenler.
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { audit } from "../rules";
import { latency, error, ruleError, uc, authorized } from "./helpers";

const PERMISSIONS = ["YONETICI", "ODEME", "RAPORLAMA"];
const normalize = (s) => String(s ?? "").trim().toLocaleLowerCase("tr-TR");
const normalizeEmail = (s) => String(s ?? "").trim().toLowerCase(); // e-posta ASCII: tr-TR küçültme I→ı yapar
const companyUsers = (companyId) => store.table("users").filter((k) => k.firmaId === companyId);

const userResponse = (k, caller) => ({
  kullaniciId: k.kullaniciId,
  adSoyad: k.adSoyad,
  email: k.email,
  telefon: k.telefon || "",
  yetki: k.yetki,
  durum: k.durum,
  sonGiris: k.sonGiris ?? null,
  olusturma: k.olusturma ?? null,
  sonDegisiklik: k.sonDegisiklik ?? null,
  kendisi: k.kullaniciId === caller.kullaniciId,
});

const clear = (g) => ({ adSoyad: String(g.adSoyad ?? "").trim(), email: String(g.email ?? "").trim(), telefon: String(g.telefon ?? "").trim(), yetki: g.yetki, durum: g.durum });

/** Girdi doğrulama; mevcut: düzenlenen kayıt (kendi kaydı kuralları) */
function userErrors(g, caller, existing) {
  const h = {};
  if (!g.adSoyad) h.adSoyad = "Ad soyad girin.";
  if (!/^\S+@\S+\.\S+$/.test(g.email)) h.email = "Geçerli bir e-posta girin.";
  else if (store.table("users").some((k) => k.kullaniciId !== existing?.kullaniciId && normalizeEmail(k.email) === normalizeEmail(g.email))) h.email = "Bu e-posta başka bir kullanıcıda kayıtlı.";
  if (g.telefon && g.telefon.replace(/\D/g, "").length < 10) h.telefon = "Geçerli bir telefon girin.";
  if (!PERMISSIONS.includes(g.yetki)) h.yetki = "Yetki seçin.";
  if (!["AKTIF", "PASIF"].includes(g.durum)) h.durum = "Durum AKTIF ya da PASIF olmalı.";
  // Düzenleyen her zaman aktif bir Yönetici olduğundan bu iki kural firmayı yöneticisiz bırakmaz
  if (existing && existing.kullaniciId === caller.kullaniciId) {
    if (g.yetki !== existing.yetki) h.yetki = "Kendi yetkinizi değiştiremezsiniz.";
    if (g.durum !== existing.durum) h.durum = "Kendi hesabınızı pasife alamazsınız.";
  }
  return h;
}

const isAdmin = (caller) => caller.yetki === "YONETICI";

export const usersHandlers = [
  http.get(uc("/kullanicilar"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const s = new URL(request.url).searchParams;
    const status = s.get("durum");
    const q = normalize(s.get("q"));
    const all = companyUsers(caller.firmaId);
    const records = all
      .filter((k) => (!status || k.durum === status) && (!q || normalize(k.adSoyad).includes(q) || normalize(k.email).includes(q)))
      .sort((a, b) => (a.kullaniciId === caller.kullaniciId ? -1 : b.kullaniciId === caller.kullaniciId ? 1 : 0) || a.adSoyad.localeCompare(b.adSoyad, "tr"))
      .map((k) => userResponse(k, caller));
    return HttpResponse.json({
      kayitlar: records,
      toplam: records.length,
      sayaclar: { TUMU: all.length, AKTIF: all.filter((k) => k.durum === "AKTIF").length, PASIF: all.filter((k) => k.durum === "PASIF").length },
      duzenlenebilir: isAdmin(caller),
    });
  }),

  http.post(uc("/kullanicilar"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    if (!isAdmin(caller)) return error(403, "YETKI_YOK", "Kullanıcı tanımını yalnız Yönetici yapar.");
    const body = await request.json().catch(() => null);
    if (!body) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const g = clear(body);
    const fields = userErrors(g, caller, null);
    if (fields.email?.includes("başka bir kullanıcıda")) return error(409, "EPOSTA_CAKISMASI", fields.email, { email: fields.email });
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const order = Math.max(0, ...store.table("users").map((k) => Number(k.kullaniciId.slice(2)))) + 1;
    const draft = { kullaniciId: `K-${String(order).padStart(3, "0")}`, firmaId: caller.firmaId, ...g, sonGiris: null, olusturma: audit(caller), sonDegisiklik: audit(caller) };
    store.update("users", (l) => [...l, draft]);
    return HttpResponse.json(userResponse(draft, caller), { status: 201 });
  }),

  http.put(uc("/kullanicilar/:kullaniciId"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    if (!isAdmin(caller)) return error(403, "YETKI_YOK", "Kullanıcı tanımını yalnız Yönetici yapar.");
    const existing = companyUsers(caller.firmaId).find((k) => k.kullaniciId === params.kullaniciId);
    if (!existing) return error(404, "KULLANICI_YOK", "Kullanıcı bulunamadı ya da firmanızda değil.");
    const body = await request.json().catch(() => null);
    if (!body) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const g = clear(body);
    const fields = userErrors(g, caller, existing);
    if (fields.email?.includes("başka bir kullanıcıda")) return error(409, "EPOSTA_CAKISMASI", fields.email, { email: fields.email });
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const current = store.replace("users", "kullaniciId", existing.kullaniciId, (k) => ({ ...k, ...g, sonDegisiklik: audit(caller) }));
    // oturum kaydı da aynı kişiyse ad / e-posta kabukta güncel görünsün
    if (current.kullaniciId === caller.kullaniciId) store.update("sessions", (o) => ({ ...o, [Object.keys(o).find((t) => o[t].kullaniciId === caller.kullaniciId)]: { ...caller, adSoyad: current.adSoyad, email: current.email } }));
    return HttpResponse.json(userResponse(current, caller));
  }),
];

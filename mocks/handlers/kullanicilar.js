// GET/POST /kullanicilar · PUT /kullanicilar/{kullaniciId} — şartname s.3: her firma kendi kullanıcılarını yönetir;
// yetki Yönetici / Ödeme / Raporlama. Yalnız Yönetici ekler ve düzenler.
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

const YETKILER = ["YONETICI", "ODEME", "RAPORLAMA"];
const kucult = (s) => String(s ?? "").trim().toLocaleLowerCase("tr-TR");
const firmaKullanicilari = (firmaId) => depo.tablo("kullanicilar").filter((k) => k.firmaId === firmaId);

const kullaniciCevabi = (k, kim) => ({
  kullaniciId: k.kullaniciId,
  adSoyad: k.adSoyad,
  email: k.email,
  telefon: k.telefon || "",
  yetki: k.yetki,
  durum: k.durum,
  sonGiris: k.sonGiris ?? null,
  kendisi: k.kullaniciId === kim.kullaniciId,
});

const temizle = (g) => ({ adSoyad: String(g.adSoyad ?? "").trim(), email: String(g.email ?? "").trim(), telefon: String(g.telefon ?? "").trim(), yetki: g.yetki, durum: g.durum });

/** Girdi doğrulama; mevcut: düzenlenen kayıt (kendi kaydı kuralları) */
function kullaniciHatalari(g, kim, mevcut) {
  const h = {};
  if (!g.adSoyad) h.adSoyad = "Ad soyad girin.";
  if (!/^\S+@\S+\.\S+$/.test(g.email)) h.email = "Geçerli bir e-posta girin.";
  else if (depo.tablo("kullanicilar").some((k) => k.kullaniciId !== mevcut?.kullaniciId && kucult(k.email) === kucult(g.email))) h.email = "Bu e-posta başka bir kullanıcıda kayıtlı.";
  if (g.telefon && g.telefon.replace(/\D/g, "").length < 10) h.telefon = "Geçerli bir telefon girin.";
  if (!YETKILER.includes(g.yetki)) h.yetki = "Yetki seçin.";
  if (!["AKTIF", "PASIF"].includes(g.durum)) h.durum = "Durum AKTIF ya da PASIF olmalı.";
  // Düzenleyen her zaman aktif bir Yönetici olduğundan bu iki kural firmayı yöneticisiz bırakmaz
  if (mevcut && mevcut.kullaniciId === kim.kullaniciId) {
    if (g.yetki !== mevcut.yetki) h.yetki = "Kendi yetkinizi değiştiremezsiniz.";
    if (g.durum !== mevcut.durum) h.durum = "Kendi hesabınızı pasife alamazsınız.";
  }
  return h;
}

const yoneticiMi = (kim) => kim.yetki === "YONETICI";

export const kullanicilarHandlers = [
  http.get(uc("/kullanicilar"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const s = new URL(request.url).searchParams;
    const durum = s.get("durum");
    const q = kucult(s.get("q"));
    const hepsi = firmaKullanicilari(kim.firmaId);
    const kayitlar = hepsi
      .filter((k) => (!durum || k.durum === durum) && (!q || kucult(k.adSoyad).includes(q) || kucult(k.email).includes(q)))
      .sort((a, b) => (a.kullaniciId === kim.kullaniciId ? -1 : b.kullaniciId === kim.kullaniciId ? 1 : 0) || a.adSoyad.localeCompare(b.adSoyad, "tr"))
      .map((k) => kullaniciCevabi(k, kim));
    return HttpResponse.json({
      kayitlar,
      toplam: kayitlar.length,
      sayaclar: { TUMU: hepsi.length, AKTIF: hepsi.filter((k) => k.durum === "AKTIF").length, PASIF: hepsi.filter((k) => k.durum === "PASIF").length },
      duzenlenebilir: yoneticiMi(kim),
    });
  }),

  http.post(uc("/kullanicilar"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (!yoneticiMi(kim)) return hata(403, "YETKI_YOK", "Kullanıcı tanımını yalnız Yönetici yapar.");
    const govde = await request.json().catch(() => null);
    if (!govde) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const g = temizle(govde);
    const alanlar = kullaniciHatalari(g, kim, null);
    if (alanlar.email?.includes("başka bir kullanıcıda")) return hata(409, "EPOSTA_CAKISMASI", alanlar.email, { email: alanlar.email });
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const sira = Math.max(0, ...depo.tablo("kullanicilar").map((k) => Number(k.kullaniciId.slice(2)))) + 1;
    const yeni = { kullaniciId: `K-${String(sira).padStart(3, "0")}`, firmaId: kim.firmaId, ...g, sonGiris: null };
    depo.guncelle("kullanicilar", (l) => [...l, yeni]);
    return HttpResponse.json(kullaniciCevabi(yeni, kim), { status: 201 });
  }),

  http.put(uc("/kullanicilar/:kullaniciId"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (!yoneticiMi(kim)) return hata(403, "YETKI_YOK", "Kullanıcı tanımını yalnız Yönetici yapar.");
    const mevcut = firmaKullanicilari(kim.firmaId).find((k) => k.kullaniciId === params.kullaniciId);
    if (!mevcut) return hata(404, "KULLANICI_YOK", "Kullanıcı bulunamadı ya da firmanızda değil.");
    const govde = await request.json().catch(() => null);
    if (!govde) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const g = temizle(govde);
    const alanlar = kullaniciHatalari(g, kim, mevcut);
    if (alanlar.email?.includes("başka bir kullanıcıda")) return hata(409, "EPOSTA_CAKISMASI", alanlar.email, { email: alanlar.email });
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const guncel = depo.degistir("kullanicilar", "kullaniciId", mevcut.kullaniciId, (k) => ({ ...k, ...g }));
    // oturum kaydı da aynı kişiyse ad / e-posta kabukta güncel görünsün
    if (guncel.kullaniciId === kim.kullaniciId) depo.guncelle("oturumlar", (o) => ({ ...o, [Object.keys(o).find((t) => o[t].kullaniciId === kim.kullaniciId)]: { ...kim, adSoyad: guncel.adSoyad, email: guncel.email } }));
    return HttpResponse.json(kullaniciCevabi(guncel, kim));
  }),
];

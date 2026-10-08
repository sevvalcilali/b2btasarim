// Sunucu tarafı kurallar — gerçek backend'in de uygulaması gereken iş mantığı, çalışan kod olarak.
// Şartname: s.3 yetki, s.5 bayi tanımı sınırları, s.7 rol kapsamı, s.8 onay zinciri, s.9 fatura.
import { depo } from "./db/depo";

/** Authorization: Bearer <token> → oturum kaydı, yoksa null. Demo tokenları: demo-<ROL>. */
export function oturum(request) {
  const yetki = request.headers.get("authorization") || "";
  const token = yetki.replace(/^Bearer\s+/i, "").trim();
  return depo.tablo("oturumlar")[token] || null;
}

export const firma = (firmaId) => depo.tablo("firmalar").find((f) => f.firmaId === firmaId) || null;
export const anaFirma = () => depo.tablo("firmalar").find((f) => f.tur === "ANA_FIRMA");
export const altBayileri = (firmaId) => depo.tablo("firmalar").filter((f) => f.tur === "ALT_BAYI" && f.bagliFirmaId === firmaId);

/** Firma özeti — cevaplarda "cekimYapan", "giren", "bagli" gibi alanlar bu biçimde döner */
export function firmaOzeti(firmaId) {
  const f = firma(firmaId);
  return f ? { firmaId: f.firmaId, unvan: f.unvan, tur: f.tur } : null;
}

/**
 * Oturumun görebildiği firmalar (şartname s.7): ana firma hepsini, bayi kendisini ve alt bayilerini,
 * alt bayi yalnızca kendisini görür.
 */
export function kapsam(kim) {
  if (kim.rol === "ANA_FIRMA") return null; // sınırsız
  const ids = new Set([kim.firmaId]);
  if (kim.rol === "BAYI") altBayileri(kim.firmaId).forEach((a) => ids.add(a.firmaId));
  return ids;
}
export const kapsamda = (kim, firmaId) => {
  const k = kapsam(kim);
  return k === null || k.has(firmaId);
};

/** Depodaki firma kaydı → sözleşmedeki Bayi cevabı (vade profili açılmış, bağlı firma özeti, alt bayi sayısı) */
export function firmaCevabi(f) {
  const profil = f.vadeProfilId ? depo.tablo("vadeFarkiProfilleri").find((v) => v.id === f.vadeProfilId) : null;
  return {
    firmaId: f.firmaId,
    tur: f.tur,
    unvan: f.unvan,
    cariNo: f.cariNo,
    vergiNo: f.vergiNo,
    telefon: f.telefon,
    email: f.email,
    adres: f.adres,
    vadeProfilId: f.vadeProfilId ?? null,
    vadeProfil: profil ? { id: profil.id, ad: profil.ad, oranYuzde: profil.oranYuzde } : null,
    taksitler: f.taksitler || [],
    islemLimitiKurus: f.islemLimitiKurus ?? null,
    altBayiYetkisi: f.tur === "BAYI" ? !!f.altBayiYetkisi : undefined,
    altBayiSayisi: f.tur === "BAYI" ? altBayileri(f.firmaId).length : undefined,
    bagli: f.bagliFirmaId ? firmaOzeti(f.bagliFirmaId) : null,
    uyeIsyerleri: f.uyeIsyerleri || [],
    ortaklar: f.ortaklar || [],
    logoRenk: f.logoRenk || null,
    durum: f.durum,
  };
}

const CARI_BICIMI = /^\d{3}\.\d{2}\.\d{3}$/;
const EPOSTA_BICIMI = /^\S+@\S+\.\S+$/;
const rakam = (x) => String(x ?? "").replace(/\D/g, "");

/** Kimlik alanları (bayi, alt bayi ve müşteri ortak). Dönüş: { alanAdi: mesaj } */
export function kimlikHatalari(g, { mevcutCariNo } = {}) {
  const h = {};
  if (!String(g.unvan || "").trim()) h.unvan = "Unvan girin.";
  if (!CARI_BICIMI.test(g.cariNo || "")) h.cariNo = "Cari no 000.00.000 biçiminde olmalı.";
  else if (g.cariNo !== mevcutCariNo && cariKullanimda(g.cariNo)) h.cariNo = "Bu cari no başka bir kayıtta kullanılıyor.";
  if (rakam(g.vergiNo).length !== 10) h.vergiNo = "10 haneli vergi no girin.";
  if (rakam(g.telefon).length < 10) h.telefon = "Geçerli bir telefon girin.";
  if (!EPOSTA_BICIMI.test(g.email || "")) h.email = "Geçerli bir e-posta girin.";
  if (!String(g.adres || "").trim()) h.adres = "Adres girin.";
  return h;
}

export const cariKullanimda = (cariNo) =>
  depo.tablo("firmalar").some((f) => f.cariNo === cariNo) || depo.tablo("musteriler").some((m) => m.cariNo === cariNo) || depo.tablo("uyeIsyerleri").some((u) => u.cariNo === cariNo);

/**
 * Ödeme koşulları (şartname s.5). ust: tanımı yapan firmanın kendi kaydı — alt bayiye verilen sınırlar onu aşamaz;
 * ana firma için ust = null (tüm taksitler ve tüm üye işyerleri açık).
 */
export function kosulHatalari(g, ust) {
  const h = {};
  const izinliTaksit = ust ? ust.taksitler : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const izinliUye = ust ? ust.uyeIsyerleri : depo.tablo("uyeIsyerleri").map((u) => u.cariNo);
  if (!depo.tablo("vadeFarkiProfilleri").some((v) => v.id === g.vadeProfilId)) h.vadeProfilId = "Vade farkı profili seçin.";
  if (!Array.isArray(g.taksitler) || g.taksitler.length === 0) h.taksitler = "En az bir taksit açık olmalı.";
  else if (g.taksitler.some((n) => !izinliTaksit.includes(n))) h.taksitler = "Yalnızca sizin görebildiğiniz taksitler verilebilir.";
  if (!(Number.isInteger(g.islemLimitiKurus) && g.islemLimitiKurus > 0)) h.islemLimitiKurus = "İşlem bazlı ödeme limiti girin.";
  else if (ust?.islemLimitiKurus && g.islemLimitiKurus > ust.islemLimitiKurus) h.islemLimitiKurus = `Kendi limitinizi (₺ ${(ust.islemLimitiKurus / 100).toLocaleString("tr-TR")}) aşamaz.`;
  if (!Array.isArray(g.uyeIsyerleri) || g.uyeIsyerleri.length === 0) h.uyeIsyerleri = "En az bir üye işyeri seçin.";
  else if (g.uyeIsyerleri.some((c) => !izinliUye.includes(c))) h.uyeIsyerleri = "Yalnızca size açık üye işyerleri verilebilir.";
  if (!["AKTIF", "PASIF"].includes(g.durum)) h.durum = "Durum AKTIF ya da PASIF olmalı.";
  return h;
}

/** Sayfalama: { kayitlar, toplam, sayfa, boyut } */
export function sayfala(liste, sorgu) {
  const sayfa = Math.max(1, Number(sorgu.get("sayfa")) || 1);
  const boyut = Math.min(200, Math.max(1, Number(sorgu.get("boyut")) || 50));
  return { kayitlar: liste.slice((sayfa - 1) * boyut, sayfa * boyut), toplam: liste.length, sayfa, boyut };
}

/** Durum sayaçları: { TUMU: n, <durum>: n … } */
export function sayaclar(liste, alan, kodlar) {
  const s = { TUMU: liste.length };
  for (const k of kodlar) s[k] = liste.filter((x) => x[alan] === k).length;
  return s;
}

/** Türkçe duyarsız metin araması */
export const icerir = (metin, aranan) => String(metin ?? "").toLocaleLowerCase("tr-TR").includes(String(aranan).toLocaleLowerCase("tr-TR"));

export const simdi = () => new Date().toISOString();

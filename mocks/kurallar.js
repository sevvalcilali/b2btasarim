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

const ANA_FIRMA_TAKSITLER = [1, 2, 3, 6, 9, 12];

/**
 * Ödeme koşulları (şartname s.4–5): taksitler ve limit oturum firmasının tanımından; vade profili firmanın kendi
 * profili, ana firma bir bayiden tahsilat yapıyorsa o bayinin profili, aksi halde Profil 1.
 */
export function odemeKosullari(kim, musteriTuru, musteriCariNo) {
  const f = firma(kim.firmaId);
  const profiller = depo.tablo("vadeFarkiProfilleri");
  let profilId = f?.vadeProfilId;
  if (kim.rol === "ANA_FIRMA") {
    const bayi = musteriTuru === "BAYI" && musteriCariNo ? depo.tablo("firmalar").find((x) => x.cariNo === musteriCariNo) : null;
    profilId = bayi?.vadeProfilId || 1;
  }
  const profil = profiller.find((p) => p.id === profilId) || profiller[0];
  return {
    taksitler: kim.rol === "ANA_FIRMA" ? ANA_FIRMA_TAKSITLER : f?.taksitler || [1],
    limitKurus: kim.rol === "ANA_FIRMA" ? null : f?.islemLimitiKurus || null,
    profil: { id: profil.id, ad: profil.ad, oranYuzde: profil.oranYuzde },
  };
}

/**
 * Vade farkı — DEMO VARSAYIMI: tutar × aylık oran × (taksit − 1); gerçek formülü backend ekibi belirleyecek.
 * Dönüş kuruş cinsinden tam sayılar.
 */
export function taksitHesabi(tutarKurus, taksit, oranYuzde) {
  const vade = taksit > 1 ? Math.round((tutarKurus * oranYuzde * (taksit - 1)) / 100) : 0;
  const toplam = tutarKurus + vade;
  return { taksit, vadeFarkiKurus: vade, toplamKurus: toplam, aylikKurus: Math.round(toplam / taksit) };
}

/** Müşteri türüne göre müşteri kaydını doğrular; { musteri: {...}, hata? } */
export function musteriCoz(kim, g) {
  const tur = g.musteriTuru;
  if (tur === "BAYI" || tur === "ALT_BAYI") {
    const f = depo.tablo("firmalar").find((x) => x.tur === tur && x.cariNo === g.musteri?.cariNo && x.durum === "AKTIF");
    if (!f) return { hata: { musteriCariNo: "Listeden bir müşteri seçin." } };
    if (tur === "ALT_BAYI" && f.bagliFirmaId !== kim.firmaId) return { hata: { musteriCariNo: "Bu alt bayi size bağlı değil." } };
    return { musteri: { unvan: f.unvan, cariNo: f.cariNo, vergiNo: f.vergiNo } };
  }
  if (tur === "DUZENLI_MUSTERI") {
    const m = depo.tablo("musteriler").find((x) => x.sahipFirmaId === kim.firmaId && x.cariNo === g.musteri?.cariNo);
    if (!m) return { hata: { musteriCariNo: "Listeden bir müşteri seçin." } };
    return { musteri: { unvan: m.unvan, cariNo: m.cariNo, vergiNo: m.vergiNo } };
  }
  if (tur === "KENDI_KARTI") {
    const f = firma(kim.firmaId);
    const sahip = g.kartSahibi;
    if (!sahip || ![f.unvan, ...(f.ortaklar || [])].includes(sahip)) return { hata: { kartSahibi: "Kartın kime ait olduğunu seçin." } };
    return { musteri: { unvan: sahip, cariNo: f.cariNo, vergiNo: f.vergiNo } };
  }
  // DUZENSIZ_MUSTERI, MUSTERI_KARTI: kısıtlı bilgi, tanım oluşturulmaz
  const h = {};
  const ad = String(g.musteri?.unvan || "").trim();
  if (!ad) h.musteriUnvan = "Ad soyad ya da unvan girin.";
  if (String(g.musteri?.telefon || "").replace(/\D/g, "").length < 10) h.musteriTelefon = "Geçerli bir telefon numarası girin.";
  const kimlik = String(g.musteri?.kimlikNo || "").replace(/\D/g, "");
  if (tur === "DUZENSIZ_MUSTERI" && ![10, 11].includes(kimlik.length)) h.musteriKimlikNo = "10 haneli VKN ya da 11 haneli TCKN girin.";
  if (Object.keys(h).length) return { hata: h };
  return { musteri: { unvan: ad, cariNo: null, vergiNo: kimlik || null, telefon: g.musteri.telefon, email: g.musteri.email || null } };
}

/** Tahsilat carisi doğrulaması: oturumun görebildiği cariler arasında olmalı */
export function tahsilatCarileri(kim) {
  const f = firma(kim.firmaId);
  if (kim.rol === "ANA_FIRMA") return { etiket: "Üye İşyeri", kayitlar: depo.tablo("uyeIsyerleri").map((u) => ({ cariNo: u.cariNo, ad: u.ad })) };
  if (kim.rol === "BAYI") {
    const acik = f?.uyeIsyerleri || [];
    return { etiket: "Ana Firma Carisi", kayitlar: depo.tablo("uyeIsyerleri").filter((u) => acik.includes(u.cariNo)).map((u) => ({ cariNo: u.cariNo, ad: u.ad })) };
  }
  const bayi = f?.bagliFirmaId ? firma(f.bagliFirmaId) : null;
  return { etiket: "Bayi Carisi", kayitlar: bayi ? [{ cariNo: bayi.cariNo, ad: bayi.unvan }] : [] };
}

// ---- iptal / iade (şartname s.8) ------------------------------------------------------------------
// Alt bayi → BAYI_ONAYINDA → bayi onaylayıp iletir → ANA_FIRMA_ONAYINDA → ONAYLANDI | REDDEDILDI.
// Bayinin talebi doğrudan ana firma onayına düşer; ana firmanın kendi talebi onay gerektirmeden sonuçlanır.

/** Talep bu oturumun onayını mı bekliyor? */
export function onayimda(kim, t) {
  if (kim.rol === "ANA_FIRMA") return t.durum === "ANA_FIRMA_ONAYINDA";
  if (kim.rol === "BAYI") return t.durum === "BAYI_ONAYINDA" && altBayileri(kim.firmaId).some((a) => a.firmaId === t.girenId);
  return false;
}

/** Depodaki talep → sözleşmedeki Talep cevabı */
export function talepCevabi(t, kim) {
  const islem = depo.tablo("islemler").find((i) => i.islemNo === t.islemNo);
  return {
    talepNo: t.talepNo,
    tarih: t.tarih,
    islemNo: t.islemNo,
    giren: firmaOzeti(t.girenId),
    musteriUnvan: islem?.musteri.unvan || "—",
    islemTutariKurus: islem?.tutarKurus ?? null,
    tutarKurus: t.tutarKurus,
    tur: t.tur,
    aciklama: t.aciklama,
    durum: t.durum,
    onayimda: onayimda(kim, t),
    gecmis: t.gecmis.map((g) => ({ tarih: g.tarih, firma: firmaOzeti(g.firmaId), olay: g.olay, not: g.not || null })),
  };
}

// ---- fatura (şartname s.9) ---------------------------------------------------------------------
/** Fatura gereken işlem: bayi / alt bayi çekimi, kendi kartı olmayan, başarılı */
export const faturaGerekli = (islem) => firma(islem.cekimYapanId)?.tur !== "ANA_FIRMA" && islem.musteriTuru !== "KENDI_KARTI" && islem.durum === "BASARILI";

/** İşlemin fatura kaydı ve durumu (kaydı yoksa BEKLIYOR) */
export function faturaDurumu(islemNo) {
  const kayit = depo.tablo("faturalar").find((f) => f.islemNo === islemNo) || null;
  return { kayit, durum: kayit ? kayit.durum : "BEKLIYOR" };
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

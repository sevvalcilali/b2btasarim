// Sunucu tarafı kurallar — gerçek backend'in de uygulaması gereken iş mantığı, çalışan kod olarak.
// Şartname: s.3 yetki, s.5 bayi tanımı sınırları, s.7 rol kapsamı, s.8 onay zinciri, s.9 fatura.
import { store } from "./db/store";

/** Authorization: Bearer <token> → oturum kaydı, yoksa null. Demo tokenları: demo-<ROL>. */
export function session(request) {
  const permission = request.headers.get("authorization") || "";
  const token = permission.replace(/^Bearer\s+/i, "").trim();
  return store.table("sessions")[token] || null;
}

export const company = (companyId) => store.table("companies").find((f) => f.firmaId === companyId) || null;
export const mainCompany = () => store.table("companies").find((f) => f.tur === "ANA_FIRMA");
export const subDealersOf = (companyId) => store.table("companies").filter((f) => f.tur === "ALT_BAYI" && f.bagliFirmaId === companyId);

/** Firma özeti — cevaplarda "cekimYapan", "giren", "bagli" gibi alanlar bu biçimde döner */
export function companySummary(companyId) {
  const f = company(companyId);
  return f ? { firmaId: f.firmaId, unvan: f.unvan, tur: f.tur } : null;
}

/**
 * Oturumun görebildiği firmalar (şartname s.7): ana firma hepsini, bayi kendisini ve alt bayilerini,
 * alt bayi yalnızca kendisini görür.
 */
export function scopeOf(caller) {
  if (caller.rol === "ANA_FIRMA") return null; // sınırsız
  const ids = new Set([caller.firmaId]);
  if (caller.rol === "BAYI") subDealersOf(caller.firmaId).forEach((a) => ids.add(a.firmaId));
  return ids;
}
export const inScope = (caller, companyId) => {
  const k = scopeOf(caller);
  return k === null || k.has(companyId);
};

/** Depodaki firma kaydı → sözleşmedeki Bayi cevabı (vade profili açılmış, bağlı firma özeti, alt bayi sayısı) */
export function companyResponse(f) {
  const profile = f.vadeProfilId ? store.table("maturityProfiles").find((v) => v.id === f.vadeProfilId) : null;
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
    vadeProfil: profile ? { id: profile.id, ad: profile.ad, oranYuzde: profile.oranYuzde } : null,
    taksitler: f.taksitler || [],
    islemLimitiKurus: f.islemLimitiKurus ?? null,
    altBayiYetkisi: f.tur === "BAYI" ? !!f.altBayiYetkisi : undefined,
    altBayiSayisi: f.tur === "BAYI" ? subDealersOf(f.firmaId).length : undefined,
    bagli: f.bagliFirmaId ? companySummary(f.bagliFirmaId) : null,
    uyeIsyerleri: f.uyeIsyerleri || [],
    ortaklar: f.ortaklar || [],
    logoRenk: f.logoRenk || null,
    durum: f.durum,
    olusturma: f.olusturma ?? null,
    sonDegisiklik: f.sonDegisiklik ?? null,
  };
}

const ACCOUNT_FORMAT = /^\d{3}\.\d{2}\.\d{3}$/;
const EMAIL_FORMAT = /^\S+@\S+\.\S+$/;
const digit = (x) => String(x ?? "").replace(/\D/g, "");

/** Kimlik alanları (bayi, alt bayi ve müşteri ortak). Dönüş: { alanAdi: mesaj } */
export function authErrors(g, { mevcutCariNo: existingAccountNo } = {}) {
  const h = {};
  if (!String(g.unvan || "").trim()) h.unvan = "Unvan girin.";
  if (!ACCOUNT_FORMAT.test(g.cariNo || "")) h.cariNo = "Cari no 000.00.000 biçiminde olmalı.";
  else if (g.cariNo !== existingAccountNo && accountInUse(g.cariNo)) h.cariNo = "Bu cari no başka bir kayıtta kullanılıyor.";
  if (digit(g.vergiNo).length !== 10) h.vergiNo = "10 haneli vergi no girin.";
  if (digit(g.telefon).length < 10) h.telefon = "Geçerli bir telefon girin.";
  if (!EMAIL_FORMAT.test(g.email || "")) h.email = "Geçerli bir e-posta girin.";
  if (!String(g.adres || "").trim()) h.adres = "Adres girin.";
  return h;
}

export const accountInUse = (accountNo) =>
  store.table("companies").some((f) => f.cariNo === accountNo) || store.table("customers").some((m) => m.cariNo === accountNo) || store.table("merchants").some((u) => u.cariNo === accountNo);

/**
 * Ödeme koşulları (şartname s.5). ust: tanımı yapan firmanın kendi kaydı — alt bayiye verilen sınırlar onu aşamaz;
 * ana firma için ust = null (tüm taksitler ve tüm üye işyerleri açık).
 */
export function conditionErrors(g, parent, { mevcutProfilId: existingProfileId } = {}) {
  const h = {};
  const profile = store.table("maturityProfiles").find((v) => v.id === g.vadeProfilId);
  const allowedInstallments = parent ? parent.taksitler : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const allowedMerchant = parent ? parent.uyeIsyerleri : store.table("merchants").map((u) => u.cariNo);
  if (!profile) h.vadeProfilId = "Vade farkı profili seçin.";
  else if (profile.durum === "PASIF" && profile.id !== existingProfileId) h.vadeProfilId = "Pasif profil atanamaz; aktif bir profil seçin."; // mevcut atama korunur
  if (!Array.isArray(g.taksitler) || g.taksitler.length === 0) h.taksitler = "En az bir taksit açık olmalı.";
  else if (g.taksitler.some((n) => !allowedInstallments.includes(n))) h.taksitler = "Yalnızca sizin görebildiğiniz taksitler verilebilir.";
  if (!(Number.isInteger(g.islemLimitiKurus) && g.islemLimitiKurus > 0)) h.islemLimitiKurus = "İşlem bazlı ödeme limiti girin.";
  else if (parent?.islemLimitiKurus && g.islemLimitiKurus > parent.islemLimitiKurus) h.islemLimitiKurus = `Kendi limitinizi (₺ ${(parent.islemLimitiKurus / 100).toLocaleString("tr-TR")}) aşamaz.`;
  if (!Array.isArray(g.uyeIsyerleri) || g.uyeIsyerleri.length === 0) h.uyeIsyerleri = "En az bir üye işyeri seçin.";
  else if (g.uyeIsyerleri.some((c) => !allowedMerchant.includes(c))) h.uyeIsyerleri = "Yalnızca size açık üye işyerleri verilebilir.";
  if (!["AKTIF", "PASIF"].includes(g.durum)) h.durum = "Durum AKTIF ya da PASIF olmalı.";
  return h;
}

const MAIN_COMPANY_INSTALLMENTS = [1, 2, 3, 6, 9, 12];

/**
 * Ödeme koşulları (şartname s.4–5): taksitler ve limit oturum firmasının tanımından; vade profili firmanın kendi
 * profili, ana firma bir bayiden tahsilat yapıyorsa o bayinin profili, aksi halde Profil 1.
 */
export function paymentTerms(caller, customerKind, customerAccountNo) {
  const f = company(caller.firmaId);
  const profiles = store.table("maturityProfiles");
  let profileId = f?.vadeProfilId;
  if (caller.rol === "ANA_FIRMA") {
    const dealer = customerKind === "BAYI" && customerAccountNo ? store.table("companies").find((x) => x.cariNo === customerAccountNo) : null;
    profileId = dealer?.vadeProfilId || 1;
  }
  const profile = profiles.find((p) => p.id === profileId) || profiles[0];
  return {
    taksitler: caller.rol === "ANA_FIRMA" ? MAIN_COMPANY_INSTALLMENTS : f?.taksitler || [1],
    limitKurus: caller.rol === "ANA_FIRMA" ? null : f?.islemLimitiKurus || null,
    profil: { id: profile.id, ad: profile.ad, oranYuzde: profile.oranYuzde },
  };
}

/**
 * Vade farkı — DEMO VARSAYIMI: tutar × aylık oran × (taksit − 1); gerçek formülü backend ekibi belirleyecek.
 * Dönüş kuruş cinsinden tam sayılar.
 */
export function installmentCalc(amountCents, installment, ratePercent) {
  const maturity = installment > 1 ? Math.round((amountCents * ratePercent * (installment - 1)) / 100) : 0;
  const total = amountCents + maturity;
  return { taksit: installment, vadeFarkiKurus: maturity, toplamKurus: total, aylikKurus: Math.round(total / installment) };
}

/** Müşteri türüne göre müşteri kaydını doğrular; { musteri: {...}, hata? } */
export function resolveCustomer(caller, g) {
  const kind = g.musteriTuru;
  if (kind === "BAYI" || kind === "ALT_BAYI") {
    const f = store.table("companies").find((x) => x.tur === kind && x.cariNo === g.musteri?.cariNo && x.durum === "AKTIF");
    if (!f) return { hata: { musteriCariNo: "Listeden bir müşteri seçin." } };
    if (kind === "ALT_BAYI" && f.bagliFirmaId !== caller.firmaId) return { hata: { musteriCariNo: "Bu alt bayi size bağlı değil." } };
    return { musteri: { unvan: f.unvan, cariNo: f.cariNo, vergiNo: f.vergiNo } };
  }
  if (kind === "DUZENLI_MUSTERI") {
    const m = store.table("customers").find((x) => x.sahipFirmaId === caller.firmaId && x.cariNo === g.musteri?.cariNo);
    if (!m) return { hata: { musteriCariNo: "Listeden bir müşteri seçin." } };
    return { musteri: { unvan: m.unvan, cariNo: m.cariNo, vergiNo: m.vergiNo } };
  }
  if (kind === "KENDI_KARTI") {
    const f = company(caller.firmaId);
    const owner = g.kartSahibi;
    if (!owner || ![f.unvan, ...(f.ortaklar || [])].includes(owner)) return { hata: { kartSahibi: "Kartın kime ait olduğunu seçin." } };
    return { musteri: { unvan: owner, cariNo: f.cariNo, vergiNo: f.vergiNo } };
  }
  // DUZENSIZ_MUSTERI, MUSTERI_KARTI: kısıtlı bilgi, tanım oluşturulmaz
  const h = {};
  const name = String(g.musteri?.unvan || "").trim();
  if (!name) h.musteriUnvan = "Ad soyad ya da unvan girin.";
  if (String(g.musteri?.telefon || "").replace(/\D/g, "").length < 10) h.musteriTelefon = "Geçerli bir telefon numarası girin.";
  const auth = String(g.musteri?.kimlikNo || "").replace(/\D/g, "");
  if (kind === "DUZENSIZ_MUSTERI" && ![10, 11].includes(auth.length)) h.musteriKimlikNo = "10 haneli VKN ya da 11 haneli TCKN girin.";
  if (Object.keys(h).length) return { hata: h };
  return { musteri: { unvan: name, cariNo: null, vergiNo: auth || null, telefon: g.musteri.telefon, email: g.musteri.email || null } };
}

/** Tahsilat carisi doğrulaması: oturumun görebildiği cariler arasında olmalı */
export function collectionAccounts(caller) {
  const f = company(caller.firmaId);
  if (caller.rol === "ANA_FIRMA") return { etiket: "Üye İşyeri", kayitlar: store.table("merchants").map((u) => ({ cariNo: u.cariNo, ad: u.ad })) };
  if (caller.rol === "BAYI") {
    const open = f?.uyeIsyerleri || [];
    return { etiket: "Ana Firma Carisi", kayitlar: store.table("merchants").filter((u) => open.includes(u.cariNo)).map((u) => ({ cariNo: u.cariNo, ad: u.ad })) };
  }
  const dealer = f?.bagliFirmaId ? company(f.bagliFirmaId) : null;
  return { etiket: "Bayi Carisi", kayitlar: dealer ? [{ cariNo: dealer.cariNo, ad: dealer.unvan }] : [] };
}

// ---- iptal / iade (şartname s.8) ------------------------------------------------------------------
// Alt bayi → BAYI_ONAYINDA → bayi onaylayıp iletir → ANA_FIRMA_ONAYINDA → ONAYLANDI | REDDEDILDI.
// Bayinin talebi doğrudan ana firma onayına düşer; ana firmanın kendi talebi onay gerektirmeden sonuçlanır.

/** Talep bu oturumun onayını mı bekliyor? */
export function awaitingMyApproval(caller, t) {
  if (caller.rol === "ANA_FIRMA") return t.durum === "ANA_FIRMA_ONAYINDA";
  if (caller.rol === "BAYI") return t.durum === "BAYI_ONAYINDA" && subDealersOf(caller.firmaId).some((a) => a.firmaId === t.girenId);
  return false;
}

/** Depodaki talep → sözleşmedeki Talep cevabı */
export function requestResponse(t, caller) {
  const transaction = store.table("transactions").find((i) => i.islemNo === t.islemNo);
  return {
    talepNo: t.talepNo,
    tarih: t.tarih,
    islemNo: t.islemNo,
    giren: companySummary(t.girenId),
    musteriUnvan: transaction?.musteri.unvan || "—",
    islemTutariKurus: transaction?.tutarKurus ?? null,
    tutarKurus: t.tutarKurus,
    tur: t.tur,
    aciklama: t.aciklama,
    durum: t.durum,
    onayimda: awaitingMyApproval(caller, t),
    gecmis: t.gecmis.map((g) => ({ tarih: g.tarih, firma: companySummary(g.firmaId), olay: g.olay, not: g.not || null })),
  };
}

// ---- fatura (şartname s.9) ---------------------------------------------------------------------
/** Fatura gereken işlem: bayi / alt bayi çekimi, kendi kartı olmayan, başarılı */
export const invoiceRequired = (transaction) => company(transaction.cekimYapanId)?.tur !== "ANA_FIRMA" && transaction.musteriTuru !== "KENDI_KARTI" && transaction.durum === "BASARILI";

/** İşlemin fatura kaydı ve durumu (kaydı yoksa BEKLIYOR) */
export function invoiceStatus(transactionNo) {
  const record = store.table("invoices").find((f) => f.islemNo === transactionNo) || null;
  return { kayit: record, durum: record ? record.durum : "BEKLIYOR" };
}

/** Sayfalama: { kayitlar, toplam, sayfa, boyut } */
export function paginate(list, query) {
  const page = Math.max(1, Number(query.get("sayfa")) || 1);
  const size = Math.min(200, Math.max(1, Number(query.get("boyut")) || 50));
  return { kayitlar: list.slice((page - 1) * size, page * size), toplam: list.length, sayfa: page, boyut: size };
}

/** Durum sayaçları: { TUMU: n, <durum>: n … } */
export function counters(list, field, codes) {
  const s = { TUMU: list.length };
  for (const k of codes) s[k] = list.filter((x) => x[field] === k).length;
  return s;
}

/** Türkçe duyarsız metin araması */
export const includes = (text, searchTerm) => String(text ?? "").toLocaleLowerCase("tr-TR").includes(String(searchTerm).toLocaleLowerCase("tr-TR"));

/** Şu an, tohumla aynı biçimde (+03:00): metin sıralaması ve dönem eşikleri tutarlı kalır. ms ile başka bir an. */
export function now(ms = Date.now()) {
  return new Date(ms + 3 * 3600000).toISOString().replace(/\.\d{3}Z$/, "+03:00");
}

const DAY_MS = 86400000;
const dayText = (ms) => now(ms).slice(0, 10);
const daysAfter = (g, n = 1) => dayText(Date.parse(`${g}T12:00:00+03:00`) + n * DAY_MS);

/**
 * Rapor tarih aralığı: ?baslangic=YYYY-AA-GG&bitis=YYYY-AA-GG (ikisi de dahil). Verilmezse son `varsayilanGun` gün;
 * eski ?donem=7g|30g|90g da kabul edilir. Dönüş: icinde(tarihISO) süzgeci ve aynı uzunluktaki önceki dönem.
 * Karşılaştırma metin üzerinden (tüm tarihler +03:00 biçiminde).
 */
export function dateRange(s, defaultDays = 30) {
  const valid = (x) => /^\d{4}-\d{2}-\d{2}$/.test(x || "");
  let startDate = s.get("baslangic");
  let endDate = s.get("bitis");
  if (!valid(startDate) || !valid(endDate)) {
    const day = { "7g": 7, "30g": 30, "90g": 90 }[s.get("donem")] || defaultDays;
    endDate = dayText(Date.now());
    startDate = daysAfter(endDate, -(day - 1));
  }
  if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
  const day = Math.round((Date.parse(endDate) - Date.parse(startDate)) / DAY_MS) + 1;
  const range = (a, b) => (date) => date >= a && date < daysAfter(b);
  const prevEnd = daysAfter(startDate, -1);
  const prevStart = daysAfter(startDate, -day);
  return { baslangic: startDate, bitis: endDate, gun: day, icinde: range(startDate, endDate), onceki: { baslangic: prevStart, bitis: prevEnd, icinde: range(prevStart, prevEnd) } };
}

/** Denetim izi: kaydı kim, ne zaman oluşturdu / değiştirdi (sözleşme: Denetim) */
export const audit = (caller) => ({ kullaniciId: caller.kullaniciId, adSoyad: caller.adSoyad, tarih: now() });

// Şartname s.3: yetki → açılan ekranlar / işlemler
export const PERMISSION_SCREENS = {
  YONETICI: ["ODEME", "RAPOR", "IPTAL_IADE_GIRIS", "IPTAL_IADE_ONAY", "BAYI_TANIM", "KULLANICI_TANIM", "AYARLAR"],
  ODEME: ["ODEME", "RAPOR", "IPTAL_IADE_GIRIS"],
  RAPORLAMA: ["RAPOR"],
};

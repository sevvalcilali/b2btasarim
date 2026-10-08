// API kod değerleri ↔ ekran etiketleri. Sözleşme kodları (BASARILI, ALT_BAYI …) sabittir; ekrandaki metin buradan değişir.
export const ETIKET = {
  islemDurumu: { BASARILI: "Başarılı", BASARISIZ: "Başarısız", IPTAL: "İptal", IADE: "İade" },
  musteriTuru: {
    BAYI: "Bayi",
    ALT_BAYI: "Alt Bayi",
    DUZENLI_MUSTERI: "Düzenli Müşteri",
    DUZENSIZ_MUSTERI: "Düzensiz Müşteri",
    KENDI_KARTI: "Kendi Kartı",
    MUSTERI_KARTI: "Müşteri Kartı",
  },
  firmaTuru: { ANA_FIRMA: "Ana Firma", BAYI: "Bayi", ALT_BAYI: "Alt Bayi" },
  odemeTipi: { MANUEL: "Manuel", LINK: "Link" },
  kanal: { SMS: "SMS", EPOSTA: "E-posta", LINK: "Sadece link" },
  linkDurumu: { BEKLIYOR: "Bekliyor", ODENDI: "Ödendi", SURESI_DOLDU: "Süresi Doldu", IPTAL_EDILDI: "İptal Edildi" },
  talepTuru: { IADE: "İade", IPTAL: "İptal" },
  talepDurumu: { BAYI_ONAYINDA: "Bayi Onayında", ANA_FIRMA_ONAYINDA: "Ana Firma Onayında", ONAYLANDI: "Onaylandı", REDDEDILDI: "Reddedildi" },
  talepOlayi: { TALEP_GIRILDI: "Talep girildi", ONAYLADI_ILETTI: "Onayladı, ana firma onayına iletti", ONAYLADI: "Onayladı", REDDETTI: "Reddetti" },
  faturaDurumu: { BEKLIYOR: "Bekliyor", YUKLENDI: "Yüklendi", REDDEDILDI: "Reddedildi" },
  kayitDurumu: { AKTIF: "Aktif", PASIF: "Pasif" },
  hareketTuru: { BORC: "Borç", ODEME: "Ödeme", IADE: "İade", IPTAL: "İptal" },
  yetki: { YONETICI: "Yönetici", ODEME: "Ödeme", RAPORLAMA: "Raporlama" },
  // şartname s.3: yetkinin açtığı ekranlar
  yetkiAciklamasi: { YONETICI: "Tüm ekranlar; kullanıcı ve tanım yönetimi", ODEME: "Ödeme alma, iptal / iade talebi ve raporlar", RAPORLAMA: "Yalnızca raporlar" },
};

/** etiket("islemDurumu", "BASARILI") → "Başarılı"; bilinmeyen kod olduğu gibi döner */
export const etiket = (grup, kod) => ETIKET[grup]?.[kod] ?? kod ?? "—";

/** Durum kodu → rozet rengi sınıfı (tüm ekranlarda aynı renk dili) */
export function durumTonu(kod) {
  switch (kod) {
    case "BASARILI":
    case "ONAYLANDI":
    case "ODENDI":
    case "YUKLENDI":
    case "AKTIF":
      return "bg-[var(--success-soft)] text-[var(--success-text)]";
    case "BASARISIZ":
    case "REDDEDILDI":
    case "IPTAL_EDILDI":
      return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
    case "IPTAL":
    case "IADE":
    case "BAYI_ONAYINDA":
    case "BEKLIYOR":
      return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
    case "ANA_FIRMA_ONAYINDA":
      return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
    default:
      return "bg-[var(--soft-2)] text-[var(--muted)]"; // SURESI_DOLDU, PASIF …
  }
}

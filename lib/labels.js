// API kod değerleri ↔ ekran etiketleri. Sözleşme kodları (BASARILI, ALT_BAYI …) sabittir; ekrandaki metin buradan değişir.
export const LABEL = {
  transactionStatus: { BASARILI: "Başarılı", BASARISIZ: "Başarısız", IPTAL: "İptal", IADE: "İade" },
  customerKind: {
    BAYI: "Bayi",
    ALT_BAYI: "Alt Bayi",
    DUZENLI_MUSTERI: "Düzenli Müşteri",
    DUZENSIZ_MUSTERI: "Düzensiz Müşteri",
    KENDI_KARTI: "Kendi Kartı",
    MUSTERI_KARTI: "Müşteri Kartı",
  },
  companyKind: { ANA_FIRMA: "Ana Firma", BAYI: "Bayi", ALT_BAYI: "Alt Bayi" },
  paymentType: { MANUEL: "Manuel", LINK: "Link" },
  channel: { SMS: "SMS", EPOSTA: "E-posta", LINK: "Sadece link" },
  linkStatus: { BEKLIYOR: "Bekliyor", ODENDI: "Ödendi", SURESI_DOLDU: "Süresi Doldu", IPTAL_EDILDI: "İptal Edildi" },
  requestKind: { IADE: "İade", IPTAL: "İptal" },
  requestStatus: { BAYI_ONAYINDA: "Bayi Onayında", ANA_FIRMA_ONAYINDA: "Ana Firma Onayında", ONAYLANDI: "Onaylandı", REDDEDILDI: "Reddedildi" },
  requestEvent: { TALEP_GIRILDI: "Talep girildi", ONAYLADI_ILETTI: "Onayladı, ana firma onayına iletti", ONAYLADI: "Onayladı", REDDETTI: "Reddetti" },
  invoiceStatus: { BEKLIYOR: "Bekliyor", YUKLENDI: "Yüklendi", REDDEDILDI: "Reddedildi" },
  recordStatus: { AKTIF: "Aktif", PASIF: "Pasif" },
  announcementStatus: { YAYINDA: "Yayında", ARSIV: "Arşiv" },
  entryKind: { BORC: "Borç", ODEME: "Ödeme", IADE: "İade", IPTAL: "İptal" },
  permission: { YONETICI: "Yönetici", ODEME: "Ödeme", RAPORLAMA: "Raporlama" },
  // şartname s.3: yetkinin açtığı ekranlar
  permissionDescription: { YONETICI: "Tüm ekranlar; kullanıcı ve tanım yönetimi", ODEME: "Ödeme alma, iptal / iade talebi ve raporlar", RAPORLAMA: "Yalnızca raporlar" },
};

/** etiket("islemDurumu", "BASARILI") → "Başarılı"; bilinmeyen kod olduğu gibi döner */
export const labelOf = (group, code) => LABEL[group]?.[code] ?? code ?? "—";

/** Durum kodu → rozet rengi sınıfı (tüm ekranlarda aynı renk dili) */
export function statusTone(code) {
  switch (code) {
    case "BASARILI":
    case "ONAYLANDI":
    case "ODENDI":
    case "YUKLENDI":
    case "AKTIF":
    case "YAYINDA":
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

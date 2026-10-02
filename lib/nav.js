import { ROLES } from "./roles";

// Navigation is role-aware, mirroring the "PANEL MENÜLERİ" page of the spec.
// Each item: { label, href, icon }. Groups: { label, icon, items: [] }.
export function getNav(role) {
  const odemeAl = {
    label: "Ödeme Al",
    icon: "wallet",
    items: [
      { label: "Manuel Ödeme", href: "/odeme/manuel" },
      { label: "Link ile Ödeme", href: "/odeme/link" },
      { label: "USD / Euro Kur Bilgisi", href: "/odeme/kur" },
    ],
  };

  if (role === ROLES.ANA_FIRMA) {
    return [
      { label: "Ana Sayfa", href: "/dashboard", icon: "home" },
      odemeAl,
      {
        label: "İptal / İade Takip",
        icon: "refund",
        items: [
          { label: "Onay", href: "/iptal-iade/onay" },
          { label: "Takip", href: "/iptal-iade/takip" },
        ],
      },
      {
        label: "Raporlar",
        icon: "report",
        items: [
          { label: "İşlem Detayları", href: "/raporlar/islem-detaylari" },
          { label: "Bayi Özet", href: "/raporlar/bayi-ozet" },
          { label: "Fatura Yükleme Detay", href: "/raporlar/fatura-yukleme" },
        ],
      },
      {
        label: "Bayi Tanım",
        icon: "dealer",
        items: [
          { label: "Tanımlama", href: "/bayi-tanim/tanimlama" },
          { label: "Bayi Liste", href: "/bayi-tanim/liste" },
        ],
      },
      {
        label: "Ayarlar",
        icon: "settings",
        items: [
          { label: "Kullanıcı Tanım", href: "/ayarlar/kullanici" },
          { label: "Vade Farkı Profili", href: "/ayarlar/vade-farki" },
          { label: "Firma Bilgileri", href: "/ayarlar/firma" },
        ],
      },
      { label: "Duyuru", href: "/duyuru", icon: "megaphone" },
    ];
  }

  if (role === ROLES.BAYI) {
    return [
      { label: "Ana Sayfa", href: "/dashboard", icon: "home" },
      odemeAl,
      {
        label: "İptal / İade Takip",
        icon: "refund",
        items: [
          { label: "Onay", href: "/iptal-iade/onay" },
          { label: "Takip", href: "/iptal-iade/takip" },
        ],
      },
      {
        label: "Raporlar",
        icon: "report",
        items: [
          { label: "İşlem Detayları", href: "/raporlar/islem-detaylari" },
          { label: "Alt Bayi Özet", href: "/raporlar/bayi-ozet" },
          { label: "Fatura Yükleme Detay", href: "/raporlar/fatura-yukleme" },
        ],
      },
      {
        label: "Alt Bayi Tanım",
        icon: "dealer",
        items: [
          { label: "Tanımlama", href: "/bayi-tanim/tanimlama" },
          { label: "Alt Bayi Listesi", href: "/bayi-tanim/liste" },
        ],
      },
      {
        label: "Ayarlar",
        icon: "settings",
        items: [
          { label: "Kullanıcı Tanım", href: "/ayarlar/kullanici" },
          { label: "Firma Bilgileri", href: "/ayarlar/firma" },
        ],
      },
    ];
  }

  // ALT_BAYI
  return [
    { label: "Ana Sayfa", href: "/dashboard", icon: "home" },
    odemeAl,
    {
      label: "İptal / İade Takip",
      icon: "refund",
      items: [{ label: "Takip", href: "/iptal-iade/takip" }],
    },
    {
      label: "Raporlar",
      icon: "report",
      items: [
        { label: "İşlem Detayları", href: "/raporlar/islem-detaylari" },
        { label: "Fatura Yükleme Detay", href: "/raporlar/fatura-yukleme" },
      ],
    },
    {
      label: "Ayarlar",
      icon: "settings",
      items: [
        { label: "Kullanıcı Tanım", href: "/ayarlar/kullanici" },
        { label: "Firma Bilgileri", href: "/ayarlar/firma" },
      ],
    },
  ];
}

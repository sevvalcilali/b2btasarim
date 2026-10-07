import { ROLES } from "./roles";

// Navigation is role-aware, mirroring the "PANEL MENÜLERİ" page (slide 2) of the spec.
// Each item: { label, href, icon }. Groups: { label, icon, items: [] }.
// Notes from the spec that are functions inside a screen, not menu items:
//   - Bayi Liste / Alt Bayi Listesi: pay on behalf of a dealer from its cari card
//   - Ana Sayfa (Bayi): Ana Firma Cari Seçimi
//   - Firma Bilgileri stays in the classic merchant panel for Ana Firma (slide 10)
export function getNav(role) {
  const kur = { label: "USD / Euro Kur Bilgisi", href: "/odeme/kur" };

  if (role === ROLES.ANA_FIRMA) {
    return [
      { label: "Ana Sayfa", href: "/dashboard", icon: "home" },
      {
        label: "Ödeme Al",
        icon: "wallet",
        items: [
          { label: "Manuel Ödeme", href: "/odeme/manuel" },
          { label: "Link ile Ödeme", href: "/odeme/link" },
          kur,
        ],
      },
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
          { label: "Bayi Fatura Özet", href: "/raporlar/bayi-fatura-ozet" },
        ],
      },
      {
        label: "Ayarlar",
        icon: "settings",
        items: [
          { label: "Kullanıcı Tanım", href: "/ayarlar/kullanici" },
          { label: "Vade Farkı Profil Tanım", href: "/ayarlar/vade-farki" },
        ],
      },
      {
        label: "Bayi Tanım",
        icon: "dealer",
        items: [
          { label: "Tanımlama", href: "/bayi-tanim/tanimlama" },
          { label: "Bayi Liste", href: "/bayi-tanim/liste" },
          { label: "Alt Bayi Listesi", href: "/bayi-tanim/alt-bayi-liste" },
          { label: "Excel ile Toplu Bayi Ekleme", href: "/bayi-tanim/excel-ekleme" },
          { label: "Toplu Bakiye ve Borç Yükleme", href: "/bayi-tanim/bakiye-borc-yukleme" },
        ],
      },
      { label: "Duyuru", href: "/duyuru", icon: "megaphone" },
    ];
  }

  if (role === ROLES.BAYI) {
    return [
      { label: "Ana Sayfa", href: "/dashboard", icon: "home" },
      {
        label: "Ödeme Al",
        icon: "wallet",
        items: [
          { label: "Manuel Ödeme", href: "/odeme/manuel" },
          { label: "Link ile Ödeme", href: "/odeme/link" },
          kur,
          { label: "Ana Firma Bakiye ve Borç", href: "/odeme/ana-firma-bakiye" },
        ],
      },
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
          { label: "Alt Bayi Fatura Özet", href: "/raporlar/bayi-fatura-ozet" },
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
      {
        label: "Alt Bayi Tanım",
        icon: "dealer",
        items: [
          { label: "Tanımlama", href: "/bayi-tanim/tanimlama" },
          { label: "Alt Bayi Listesi", href: "/bayi-tanim/liste" },
          { label: "Excel ile Toplu Alt Bayi Ekleme", href: "/bayi-tanim/excel-ekleme" },
          { label: "Toplu Bakiye ve Borç Yükleme", href: "/bayi-tanim/bakiye-borc-yukleme" },
        ],
      },
    ];
  }

  // ALT_BAYI
  return [
    { label: "Ana Sayfa", href: "/dashboard", icon: "home" },
    {
      label: "Ödeme Al",
      icon: "wallet",
      items: [
        { label: "Manuel Ödeme", href: "/odeme/manuel" },
        { label: "Link ile Ödeme", href: "/odeme/link" },
        { label: "Bayi Carisi Seçimi", href: "/odeme/bayi-cari" },
        kur,
        { label: "Bayi Bakiye ve Borç", href: "/odeme/bayi-bakiye" },
      ],
    },
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

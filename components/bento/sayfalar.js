// Panel ekranlarının adresleri: ?sayfa=<anahtar> ↔ menüdeki href.

// Hazır ekranlar: ?sayfa=<anahtar> → menüdeki href. Ana Sayfa (/dashboard) parametresizdir.
// Burada olmayan menü öğeleri henüz bir ekrana gitmez.
export const HOME = "/dashboard";

export const SAYFALAR = {
  "manuel-odeme": "/odeme/manuel",
  "link-odeme": "/odeme/link",
  "iptal-iade-onay": "/iptal-iade/onay",
  "iptal-iade-takip": "/iptal-iade/takip",
  "fatura-yukleme": "/raporlar/fatura-yukleme",
  "bayi-ozet": "/raporlar/bayi-ozet",
  "bayi-fatura-ozet": "/raporlar/bayi-fatura-ozet",
  "bayi-tanimlama": "/bayi-tanim/tanimlama",
  "bayi-liste": "/bayi-tanim/liste",
  "alt-bayi-liste": "/bayi-tanim/alt-bayi-liste",
  "islem-detaylari": "/raporlar/islem-detaylari",
};

export const KALICI_PARAMETRELER = ["role", "theme", "menu"];

export const isReady = (href) => href === HOME || Object.values(SAYFALAR).includes(href);

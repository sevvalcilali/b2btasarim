// Static mock data for the frontend-only mockup. No services / no API.

// B2B ağının ana firması — bayi ve alt bayi ekranlarında da logo + isimle görünür
// (spec: ana firmaya özel URL'de bayi ekranına ana üye işyerinin logosu eklenmeli).
export const anaFirma = {
  ad: "Brisa A.Ş.",
  kisa: "Brisa",
  aciklama: "Lastik & Otomotiv Bayi Ağı",
  vergiNo: "1234567890",
};


export const kpis = {
  ANA_FIRMA: [
    { key: "toplam", label: "Toplam İşlem", value: "₺ 4.284.900", count: 1284, tone: "navy" },
    { key: "basarili", label: "Başarılı", value: "₺ 3.960.100", count: 1180, tone: "green" },
    { key: "basarisiz", label: "Başarısız", value: "₺ 210.400", count: 74, tone: "red" },
    { key: "iptal", label: "İptal", value: "₺ 64.200", count: 18, tone: "amber" },
    { key: "iade", label: "İade", value: "₺ 50.200", count: 12, tone: "amber" },
  ],
  BAYI: [
    { key: "toplam", label: "Toplam İşlem", value: "₺ 862.300", count: 268, tone: "navy" },
    { key: "basarili", label: "Başarılı", value: "₺ 804.100", count: 249, tone: "green" },
    { key: "basarisiz", label: "Başarısız", value: "₺ 38.700", count: 12, tone: "red" },
    { key: "iptal", label: "İptal", value: "₺ 12.900", count: 4, tone: "amber" },
    { key: "iade", label: "İade", value: "₺ 6.600", count: 3, tone: "amber" },
  ],
  ALT_BAYI: [
    { key: "toplam", label: "Toplam İşlem", value: "₺ 184.500", count: 61, tone: "navy" },
    { key: "basarili", label: "Başarılı", value: "₺ 171.200", count: 57, tone: "green" },
    { key: "basarisiz", label: "Başarısız", value: "₺ 9.300", count: 3, tone: "red" },
    { key: "iptal", label: "İptal", value: "₺ 2.400", count: 1, tone: "amber" },
    { key: "iade", label: "İade", value: "₺ 1.600", count: 0, tone: "amber" },
  ],
};

export const kurBilgisi = [
  { code: "USD", name: "Amerikan Doları", alis: "34,12", satis: "34,28", change: "+0,18%", up: true },
  { code: "EUR", name: "Euro", alis: "36,84", satis: "37,02", change: "-0,09%", up: false },
  { code: "GBP", name: "İngiliz Sterlini", alis: "43,10", satis: "43,45", change: "+0,22%", up: true },
];

export const islemler = [
  { id: "TRX-90241", tarih: "30.09.2026 14:22", musteri: "Yılmaz Otomotiv", cari: "120.01.045", tutar: "₺ 12.400", taksit: "3", tip: "Manuel", durum: "Başarılı", kart: "**** 4821" },
  { id: "TRX-90240", tarih: "30.09.2026 13:58", musteri: "Demir Ticaret", cari: "120.01.032", tutar: "₺ 3.200", taksit: "Tek Çekim", tip: "Link", durum: "Başarılı", kart: "**** 1190" },
  { id: "TRX-90238", tarih: "30.09.2026 12:41", musteri: "Kaya Lastik", cari: "120.02.011", tutar: "₺ 8.750", taksit: "6", tip: "Manuel", durum: "Başarısız", kart: "**** 7702" },
  { id: "TRX-90235", tarih: "30.09.2026 11:19", musteri: "Aksoy Nakliyat", cari: "120.01.088", tutar: "₺ 24.900", taksit: "9", tip: "Manuel", durum: "Başarılı", kart: "**** 3345" },
  { id: "TRX-90231", tarih: "30.09.2026 10:04", musteri: "Öztürk A.Ş.", cari: "120.03.006", tutar: "₺ 1.980", taksit: "2", tip: "Link", durum: "İptal", kart: "**** 5567" },
  { id: "TRX-90228", tarih: "29.09.2026 17:48", musteri: "Şahin Oto", cari: "120.01.019", tutar: "₺ 6.400", taksit: "Tek Çekim", tip: "Manuel", durum: "İade", kart: "**** 8890" },
  { id: "TRX-90224", tarih: "29.09.2026 16:12", musteri: "Çelik Ltd.", cari: "120.02.044", tutar: "₺ 15.300", taksit: "12", tip: "Manuel", durum: "Başarılı", kart: "**** 2201" },
  { id: "TRX-90219", tarih: "29.09.2026 15:33", musteri: "Arslan Ticaret", cari: "120.01.077", tutar: "₺ 4.150", taksit: "3", tip: "Link", durum: "Başarılı", kart: "**** 6634" },
  { id: "TRX-90214", tarih: "29.09.2026 14:05", musteri: "Yılmaz Otomotiv", cari: "120.01.045", tutar: "₺ 7.820", taksit: "6", tip: "Manuel", durum: "Başarılı", kart: "**** 4821" },
  { id: "TRX-90209", tarih: "29.09.2026 11:47", musteri: "Kaya Lastik", cari: "120.02.011", tutar: "₺ 2.640", taksit: "Tek Çekim", tip: "Link", durum: "Başarısız", kart: "**** 7702" },
  { id: "TRX-90203", tarih: "29.09.2026 09:26", musteri: "Doğan Oto Yedek", cari: "120.03.014", tutar: "₺ 18.600", taksit: "9", tip: "Manuel", durum: "Başarılı", kart: "**** 9015" },
  { id: "TRX-90197", tarih: "28.09.2026 17:12", musteri: "Demir Ticaret", cari: "120.01.032", tutar: "₺ 5.300", taksit: "3", tip: "Link", durum: "Başarılı", kart: "**** 1190" },
  { id: "TRX-90190", tarih: "28.09.2026 15:40", musteri: "Polat Filo Kiralama", cari: "120.02.057", tutar: "₺ 32.750", taksit: "12", tip: "Manuel", durum: "Başarılı", kart: "**** 4470" },
  { id: "TRX-90184", tarih: "28.09.2026 13:21", musteri: "Aksoy Nakliyat", cari: "120.01.088", tutar: "₺ 9.480", taksit: "6", tip: "Manuel", durum: "İptal", kart: "**** 3345" },
  { id: "TRX-90180", tarih: "28.09.2026 10:58", musteri: "Kaya Lastik", cari: "120.02.011", tutar: "₺ 3.100", taksit: "2", tip: "Link", durum: "İade", kart: "**** 7702" },
  { id: "TRX-90172", tarih: "27.09.2026 16:34", musteri: "Güneş Akaryakıt", cari: "120.03.021", tutar: "₺ 11.200", taksit: "Tek Çekim", tip: "Manuel", durum: "Başarılı", kart: "**** 5208" },
  { id: "TRX-90166", tarih: "27.09.2026 14:09", musteri: "Çelik Ltd.", cari: "120.02.044", tutar: "₺ 6.900", taksit: "3", tip: "Link", durum: "Başarısız", kart: "**** 2201" },
  { id: "TRX-90155", tarih: "27.09.2026 10:15", musteri: "Demir Ticaret", cari: "120.01.032", tutar: "₺ 2.750", taksit: "Tek Çekim", tip: "Manuel", durum: "İptal", kart: "**** 1190" },
];

export const bayiler = [
  { id: 1, unvan: "Ankara Lastik Bayi Ltd.", cari: "320.01.001", vergiNo: "1234567890", telefon: "0312 555 12 34", email: "info@ankaralastik.com", ciro: "₺ 862.300", altBayi: 4, vadeProfil: "Profil 2", durum: "Aktif" },
  { id: 2, unvan: "İzmir Oto Merkezi A.Ş.", cari: "320.01.002", vergiNo: "2345678901", telefon: "0232 444 56 78", email: "muhasebe@izmiroto.com", ciro: "₺ 1.240.900", altBayi: 7, vadeProfil: "Profil 1", durum: "Aktif" },
  { id: 3, unvan: "Bursa Lastik Dünyası", cari: "320.01.003", vergiNo: "3456789012", telefon: "0224 333 90 12", email: "satis@bursalastik.com", ciro: "₺ 512.400", altBayi: 2, vadeProfil: "Profil 3", durum: "Aktif" },
  { id: 4, unvan: "Antalya Servis Grup", cari: "320.01.004", vergiNo: "4567890123", telefon: "0242 222 34 56", email: "info@antalyaservis.com", ciro: "₺ 298.700", altBayi: 1, vadeProfil: "Profil 2", durum: "Pasif" },
  { id: 5, unvan: "Konya Perakende Lastik", cari: "320.01.005", vergiNo: "5678901234", telefon: "0332 111 78 90", email: "konya@perakende.com", ciro: "₺ 176.550", altBayi: 0, vadeProfil: "Profil 4", durum: "Aktif" },
];

export const altBayiler = [
  { id: 1, unvan: "Çankaya Oto Servis", cari: "540.02.011", vergiNo: "9988776655", telefon: "0312 987 65 43", email: "cankaya@otoservis.com", ciro: "₺ 184.500", vadeProfil: "Profil 2", durum: "Aktif" },
  { id: 2, unvan: "Keçiören Lastik", cari: "540.02.012", vergiNo: "8877665544", telefon: "0312 876 54 32", email: "kecioren@lastik.com", ciro: "₺ 96.200", vadeProfil: "Profil 3", durum: "Aktif" },
  { id: 3, unvan: "Mamak Ticaret", cari: "540.02.013", vergiNo: "7766554433", telefon: "0312 765 43 21", email: "mamak@ticaret.com", ciro: "₺ 61.800", vadeProfil: "Profil 1", durum: "Pasif" },
];

export const iptalIadeTalepleri = [
  { id: "TLP-4410", islemId: "TRX-90228", tarih: "29.09.2026", talepEden: "Şahin Oto", tutar: "₺ 6.400", tur: "İade", aciklama: "Ürün iadesi", durum: "Onayda" },
  { id: "TLP-4409", islemId: "TRX-90231", tarih: "29.09.2026", talepEden: "Öztürk A.Ş.", tutar: "₺ 1.980", tur: "İptal", aciklama: "Yanlış tutar", durum: "Onayda" },
  { id: "TLP-4402", islemId: "TRX-90180", tarih: "28.09.2026", talepEden: "Kaya Lastik", tutar: "₺ 3.100", tur: "İade", aciklama: "Kısmi iade", durum: "Onaylandı" },
  { id: "TLP-4398", islemId: "TRX-90155", tarih: "27.09.2026", talepEden: "Demir Ticaret", tutar: "₺ 2.750", tur: "İptal", aciklama: "Mükerrer işlem", durum: "Reddedildi" },
  { id: "TLP-4390", islemId: "TRX-90101", tarih: "26.09.2026", talepEden: "Çelik Ltd.", tutar: "₺ 900", tur: "İade", aciklama: "Müşteri talebi", durum: "Üst Onaya İletildi" },
];

export const vadeFarkiProfilleri = [
  { id: 1, ad: "Vade Farkı Profil 1", oran: "1,89%", aciklama: "Standart bayi profili", bayiSayisi: 8, durum: "Aktif" },
  { id: 2, ad: "Vade Farkı Profil 2", oran: "2,45%", aciklama: "Orta segment", bayiSayisi: 12, durum: "Aktif" },
  { id: 3, ad: "Vade Farkı Profil 3", oran: "2,90%", aciklama: "Yüksek risk", bayiSayisi: 5, durum: "Aktif" },
  { id: 4, ad: "Vade Farkı Profil 4", oran: "3,25%", aciklama: "Özel anlaşma", bayiSayisi: 2, durum: "Pasif" },
  { id: 5, ad: "Vade Farkı Profil 5", oran: "3,80%", aciklama: "Kampanya profili", bayiSayisi: 0, durum: "Pasif" },
];

export const kullanicilar = [
  { id: 1, ad: "Mehmet Yılmaz", email: "mehmet.yilmaz@brisa.com", rol: "Yönetici", yetki: "Tüm Ekranlar", durum: "Aktif" },
  { id: 2, ad: "Ayşe Demir", email: "ayse.demir@brisa.com", rol: "Ödeme", yetki: "Ödeme + Raporlar", durum: "Aktif" },
  { id: 3, ad: "Can Kaya", email: "can.kaya@brisa.com", rol: "Raporlama", yetki: "Sadece Raporlar", durum: "Aktif" },
  { id: 4, ad: "Elif Şahin", email: "elif.sahin@brisa.com", rol: "Ödeme", yetki: "Ödeme (İade Hariç)", durum: "Pasif" },
];

export const faturaYuklemeleri = [
  { id: "FTR-2201", islemId: "TRX-90241", musteri: "Yılmaz Otomotiv", tutar: "₺ 12.400", tarih: "30.09.2026", durum: "Yüklendi", dosya: "fatura_90241.pdf" },
  { id: "FTR-2200", islemId: "TRX-90240", musteri: "Demir Ticaret", tutar: "₺ 3.200", tarih: "30.09.2026", durum: "Bekliyor", dosya: "—" },
  { id: "FTR-2198", islemId: "TRX-90235", musteri: "Aksoy Nakliyat", tutar: "₺ 24.900", tarih: "30.09.2026", durum: "Yüklendi", dosya: "fatura_90235.pdf" },
  { id: "FTR-2195", islemId: "TRX-90224", musteri: "Çelik Ltd.", tutar: "₺ 15.300", tarih: "29.09.2026", durum: "Reddedildi", dosya: "fatura_90224.pdf" },
  { id: "FTR-2190", islemId: "TRX-90219", musteri: "Arslan Ticaret", tutar: "₺ 4.150", tarih: "29.09.2026", durum: "Bekliyor", dosya: "—" },
];

export const duyurular = [
  { id: 1, baslik: "+3 Taksit Kampanyası", icerik: "1-31 Ekim tarihleri arasında tüm bayilerde geçerli +3 taksit kampanyası başlamıştır.", hedef: "Bayi + Alt Bayi", tarih: "28.09.2026", durum: "Yayında" },
  { id: 2, baslik: "Sistem Bakımı", icerik: "05 Ekim 03:00-05:00 arası planlı bakım yapılacaktır.", hedef: "Tüm Paneller", tarih: "25.09.2026", durum: "Yayında" },
  { id: 3, baslik: "Yeni Vade Profili", icerik: "Profil 5 kampanya oranları güncellenmiştir.", hedef: "Bayi", tarih: "20.09.2026", durum: "Arşiv" },
];

// Cari (current account) list used in payment "müşteri seçimi" comboboxes.
export const cariler = [
  { cari: "120.01.045", unvan: "Yılmaz Otomotiv", tur: "Düzenli Müşteri" },
  { cari: "120.01.032", unvan: "Demir Ticaret", tur: "Düzenli Müşteri" },
  { cari: "120.02.011", unvan: "Kaya Lastik", tur: "Bayi" },
  { cari: "120.01.088", unvan: "Aksoy Nakliyat", tur: "Düzenli Müşteri" },
  { cari: "540.02.011", unvan: "Çankaya Oto Servis", tur: "Alt Bayi" },
];

export const bakiyeOzet = {
  ANA_FIRMA: { bakiye: "₺ 1.240.500", borc: "₺ 320.800", limit: "₺ 2.000.000", kullanim: 62 },
  BAYI: { bakiye: "₺ 184.200", borc: "₺ 46.500", limit: "₺ 400.000", kullanim: 46 },
  ALT_BAYI: { bakiye: "₺ 38.900", borc: "₺ 12.100", limit: "₺ 100.000", kullanim: 39 },
};

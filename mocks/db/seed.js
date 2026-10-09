// Sahte backend'in başlangıç verisi — HAM biçimde: tutarlar kuruş (tam sayı), tarihler ISO 8601, durum ve türler kod.
// Ekranlar bu dosyayı hiç görmez; veri yalnızca /api/v1 cevaplarıyla ekrana ulaşır. Etiketler: lib/etiketler.js.
// Firma kimliği (firmaId) = cari no. Ana firma 100.00.001; alt bayiler Ankara Lastik Bayi'ye (320.01.001) bağlıdır.
// Üretildi: scratchpad/tohum-uret.mjs ile eski lib/mockData.js'ten; elle düzenlenebilir.

export const firmalar = [
  {
    firmaId: "100.00.001",
    tur: "ANA_FIRMA",
    unvan: "Brisa A.Ş.",
    kisaAd: "Brisa",
    aciklama: "Lastik & Otomotiv Bayi Ağı",
    cariNo: "100.00.001",
    vergiNo: "1790035512",
    telefon: "0216 544 35 00",
    email: "bayim@brisa.com.tr",
    adres: "Alikahya Fatih Mah. Sanayici Cad. No:90 İzmit / Kocaeli",
    logoRenk: "#4F9B7C",
    durum: "AKTIF"
  },
  {
    firmaId: "320.01.001",
    tur: "BAYI",
    unvan: "Ankara Lastik Bayi Ltd.",
    cariNo: "320.01.001",
    vergiNo: "1234567890",
    telefon: "0312 555 12 34",
    email: "info@ankaralastik.com",
    adres: "Ostim OSB 1203. Cad. No:14 Yenimahalle / Ankara",
    vadeProfilId: 2,
    taksitler: [
      1,
      2,
      3,
      6,
      9
    ],
    islemLimitiKurus: 15000000,
    ortaklar: [
      "Murat Aydın",
      "Selin Aydın"
    ],
    altBayiYetkisi: true,
    bagliFirmaId: "100.00.001",
    uyeIsyerleri: [
      "320.00.001",
      "320.00.002"
    ],
    logoRenk: "#C2630F",
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-18T16:40:00+03:00" }
  },
  {
    firmaId: "320.01.002",
    tur: "BAYI",
    unvan: "İzmir Oto Merkezi A.Ş.",
    cariNo: "320.01.002",
    vergiNo: "2345678901",
    telefon: "0232 444 56 78",
    email: "muhasebe@izmiroto.com",
    adres: "Ankara Cad. No:212 Bornova / İzmir",
    vadeProfilId: 1,
    taksitler: [
      1,
      2,
      3,
      6,
      9,
      12
    ],
    islemLimitiKurus: 25000000,
    ortaklar: [
      "Hakan Yıldız"
    ],
    altBayiYetkisi: true,
    bagliFirmaId: "100.00.001",
    uyeIsyerleri: [
      "320.00.001",
      "320.00.002"
    ],
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-18T16:40:00+03:00" }
  },
  {
    firmaId: "320.01.003",
    tur: "BAYI",
    unvan: "Bursa Lastik Dünyası",
    cariNo: "320.01.003",
    vergiNo: "3456789012",
    telefon: "0224 333 90 12",
    email: "satis@bursalastik.com",
    adres: "Yalova Yolu 8. Km No:40 Osmangazi / Bursa",
    vadeProfilId: 3,
    taksitler: [
      1,
      2,
      7
    ],
    islemLimitiKurus: 10000000,
    ortaklar: [
      "Oya Kılıç",
      "Can Kılıç"
    ],
    altBayiYetkisi: true,
    bagliFirmaId: "100.00.001",
    uyeIsyerleri: [
      "320.00.002"
    ],
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-18T16:40:00+03:00" }
  },
  {
    firmaId: "320.01.004",
    tur: "BAYI",
    unvan: "Antalya Servis Grup",
    cariNo: "320.01.004",
    vergiNo: "4567890123",
    telefon: "0242 222 34 56",
    email: "info@antalyaservis.com",
    adres: "Sanayi Sitesi 602 Sk. No:9 Kepez / Antalya",
    vadeProfilId: 2,
    taksitler: [
      1,
      3,
      6
    ],
    islemLimitiKurus: 8000000,
    ortaklar: [
      "Serkan Ateş"
    ],
    altBayiYetkisi: false,
    bagliFirmaId: "100.00.001",
    uyeIsyerleri: [
      "320.00.002"
    ],
    durum: "PASIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-18T16:40:00+03:00" }
  },
  {
    firmaId: "320.01.005",
    tur: "BAYI",
    unvan: "Konya Perakende Lastik",
    cariNo: "320.01.005",
    vergiNo: "5678901234",
    telefon: "0332 111 78 90",
    email: "konya@perakende.com",
    adres: "Fevzi Çakmak Mah. 10520 Sk. No:3 Karatay / Konya",
    vadeProfilId: 3,
    taksitler: [
      1,
      2,
      3
    ],
    islemLimitiKurus: 6000000,
    ortaklar: [
      "Fatma Koç"
    ],
    altBayiYetkisi: false,
    bagliFirmaId: "100.00.001",
    uyeIsyerleri: [
      "320.00.002"
    ],
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-18T16:40:00+03:00" }
  },
  {
    firmaId: "540.02.011",
    tur: "ALT_BAYI",
    unvan: "Çankaya Oto Servis",
    cariNo: "540.02.011",
    vergiNo: "9988776655",
    telefon: "0312 987 65 43",
    email: "cankaya@otoservis.com",
    adres: "Kızılırmak Mah. 1450 Sk. No:7 Çankaya / Ankara",
    vadeProfilId: 2,
    taksitler: [
      1,
      2,
      3,
      6
    ],
    islemLimitiKurus: 5000000,
    ortaklar: [
      "Kemal Er",
      "Derya Er"
    ],
    bagliFirmaId: "320.01.001",
    uyeIsyerleri: [
      "320.00.002"
    ],
    logoRenk: "#6B2E8F",
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-09-18T16:40:00+03:00" }
  },
  {
    firmaId: "540.02.012",
    tur: "ALT_BAYI",
    unvan: "Keçiören Lastik",
    cariNo: "540.02.012",
    vergiNo: "8877665544",
    telefon: "0312 876 54 32",
    email: "kecioren@lastik.com",
    adres: "Kalaba Mah. Fatih Cad. No:88 Keçiören / Ankara",
    vadeProfilId: 3,
    taksitler: [
      1,
      2,
      3
    ],
    islemLimitiKurus: 4000000,
    ortaklar: [
      "Burak Şen"
    ],
    bagliFirmaId: "320.01.001",
    uyeIsyerleri: [
      "320.00.002"
    ],
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-09-18T16:40:00+03:00" }
  },
  {
    firmaId: "540.02.013",
    tur: "ALT_BAYI",
    unvan: "Mamak Ticaret",
    cariNo: "540.02.013",
    vergiNo: "7766554433",
    telefon: "0312 765 43 21",
    email: "mamak@ticaret.com",
    adres: "Tuzluçayır Mah. Natoyolu Cad. No:120 Mamak / Ankara",
    vadeProfilId: 1,
    taksitler: [
      1,
      2
    ],
    islemLimitiKurus: 3000000,
    ortaklar: [
      "Nur Taş"
    ],
    bagliFirmaId: "320.01.001",
    uyeIsyerleri: [
      "320.00.002"
    ],
    durum: "PASIF",
    olusturma: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-03-04T10:15:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-09-18T16:40:00+03:00" }
  }
];

export const uyeIsyerleri = [
  {
    cariNo: "320.00.001",
    ad: "Brisa İş Makinası Lastik",
    firmaId: "100.00.001"
  },
  {
    cariNo: "320.00.002",
    ad: "Brisa Perakende Lastik",
    firmaId: "100.00.001"
  }
];

export const vadeFarkiProfilleri = [
  {
    id: 1,
    ad: "Vade Farkı Profil 1",
    oranYuzde: 1.89,
    aciklama: "Standart bayi profili",
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-01-15T09:30:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-02T14:05:00+03:00" }
  },
  {
    id: 2,
    ad: "Vade Farkı Profil 2",
    oranYuzde: 2.45,
    aciklama: "Orta segment",
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-01-15T09:30:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-02T14:05:00+03:00" }
  },
  {
    id: 3,
    ad: "Vade Farkı Profil 3",
    oranYuzde: 2.9,
    aciklama: "Yüksek risk",
    durum: "AKTIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-01-15T09:30:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-02T14:05:00+03:00" }
  },
  {
    id: 4,
    ad: "Vade Farkı Profil 4",
    oranYuzde: 3.25,
    aciklama: "Özel anlaşma",
    durum: "PASIF",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-01-15T09:30:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-02T14:05:00+03:00" }
  }
];

export const musteriler = [
  {
    musteriId: "M-001",
    sahipFirmaId: "100.00.001",
    unvan: "Aksoy Nakliyat",
    cariNo: "120.01.088",
    vergiNo: "0560372219",
    telefon: "0216 410 22 18",
    email: "finans@aksoynakliyat.com",
    durum: "AKTIF"
  },
  {
    musteriId: "M-002",
    sahipFirmaId: "100.00.001",
    unvan: "Polat Filo Kiralama",
    cariNo: "120.02.057",
    vergiNo: "7230094418",
    telefon: "0212 355 80 40",
    email: "odeme@polatfilo.com",
    durum: "AKTIF"
  },
  {
    musteriId: "M-003",
    sahipFirmaId: "100.00.001",
    unvan: "Ergün İnşaat Makinaları",
    cariNo: "120.02.071",
    vergiNo: "8120067743",
    telefon: "0262 331 45 90",
    email: "muhasebe@ergunmakina.com",
    durum: "AKTIF"
  },
  {
    musteriId: "M-004",
    sahipFirmaId: "320.01.001",
    unvan: "Yılmaz Otomotiv",
    cariNo: "120.01.045",
    vergiNo: "4820193746",
    telefon: "0312 441 18 27",
    email: "info@yilmazotomotiv.com",
    durum: "AKTIF"
  },
  {
    musteriId: "M-005",
    sahipFirmaId: "320.01.001",
    unvan: "Demir Ticaret",
    cariNo: "120.01.032",
    vergiNo: "2950418873",
    telefon: "0312 229 64 05",
    email: "demir@demirticaret.com",
    durum: "AKTIF"
  },
  {
    musteriId: "M-006",
    sahipFirmaId: "320.01.001",
    unvan: "Akın Taşımacılık",
    cariNo: "120.02.083",
    vergiNo: "3360721194",
    telefon: "0312 397 12 70",
    email: "akin@akintasimacilik.com",
    durum: "AKTIF"
  }
];

export const islemler = [
  {
    islemNo: "TRX-90241",
    tarih: "2026-09-30T14:22:00+03:00",
    cekimYapanId: "320.01.001",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Yılmaz Otomotiv",
      cariNo: "120.01.045",
      vergiNo: "4820193746"
    },
    kartSon4: "4821",
    odemeTipi: "MANUEL",
    taksit: 3,
    tutarKurus: 1240000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90240",
    tarih: "2026-09-30T13:58:00+03:00",
    cekimYapanId: "540.02.011",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Demir Ticaret",
      cariNo: "120.01.032",
      vergiNo: "2950418873"
    },
    kartSon4: "1190",
    odemeTipi: "LINK",
    taksit: 1,
    tutarKurus: 320000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90238",
    tarih: "2026-09-30T12:41:00+03:00",
    cekimYapanId: "100.00.001",
    musteriTuru: "BAYI",
    musteri: {
      unvan: "Ankara Lastik Bayi Ltd.",
      cariNo: "320.01.001",
      vergiNo: "1234567890"
    },
    kartSon4: "7702",
    odemeTipi: "MANUEL",
    taksit: 6,
    tutarKurus: 4875000,
    durum: "BASARISIZ"
  },
  {
    islemNo: "TRX-90235",
    tarih: "2026-09-30T11:19:00+03:00",
    cekimYapanId: "100.00.001",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Aksoy Nakliyat",
      cariNo: "120.01.088",
      vergiNo: "0560372219"
    },
    kartSon4: "3345",
    odemeTipi: "MANUEL",
    taksit: 9,
    tutarKurus: 2490000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90231",
    tarih: "2026-09-30T10:04:00+03:00",
    cekimYapanId: "320.01.001",
    musteriTuru: "DUZENSIZ_MUSTERI",
    musteri: {
      unvan: "Öztürk A.Ş.",
      cariNo: "120.03.006",
      vergiNo: "6640981125"
    },
    kartSon4: "5567",
    odemeTipi: "LINK",
    taksit: 2,
    tutarKurus: 198000,
    durum: "IPTAL"
  },
  {
    islemNo: "TRX-90228",
    tarih: "2026-09-29T17:48:00+03:00",
    cekimYapanId: "540.02.012",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Şahin Oto",
      cariNo: "120.01.019",
      vergiNo: "7810253364"
    },
    kartSon4: "8890",
    odemeTipi: "MANUEL",
    taksit: 1,
    tutarKurus: 640000,
    durum: "IADE"
  },
  {
    islemNo: "TRX-90224",
    tarih: "2026-09-29T16:12:00+03:00",
    cekimYapanId: "320.01.002",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Çelik Ltd.",
      cariNo: "120.02.044",
      vergiNo: "1180654432"
    },
    kartSon4: "2201",
    odemeTipi: "MANUEL",
    taksit: 12,
    tutarKurus: 1530000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90219",
    tarih: "2026-09-29T15:33:00+03:00",
    cekimYapanId: "540.02.011",
    musteriTuru: "DUZENSIZ_MUSTERI",
    musteri: {
      unvan: "Arslan Ticaret",
      cariNo: "120.01.077",
      vergiNo: "3925571046"
    },
    kartSon4: "6634",
    odemeTipi: "LINK",
    taksit: 3,
    tutarKurus: 415000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90214",
    tarih: "2026-09-29T14:05:00+03:00",
    cekimYapanId: "100.00.001",
    musteriTuru: "BAYI",
    musteri: {
      unvan: "Bursa Lastik Dünyası",
      cariNo: "320.01.003",
      vergiNo: "3456789012"
    },
    kartSon4: "4471",
    odemeTipi: "MANUEL",
    taksit: 6,
    tutarKurus: 3782000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90209",
    tarih: "2026-09-29T11:47:00+03:00",
    cekimYapanId: "320.01.001",
    musteriTuru: "ALT_BAYI",
    musteri: {
      unvan: "Çankaya Oto Servis",
      cariNo: "540.02.011",
      vergiNo: "9988776655"
    },
    kartSon4: "3092",
    odemeTipi: "LINK",
    taksit: 1,
    tutarKurus: 2264000,
    durum: "BASARISIZ"
  },
  {
    islemNo: "TRX-90203",
    tarih: "2026-09-29T09:26:00+03:00",
    cekimYapanId: "320.01.003",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Doğan Oto Yedek",
      cariNo: "120.03.014",
      vergiNo: "5402219987"
    },
    kartSon4: "9015",
    odemeTipi: "MANUEL",
    taksit: 9,
    tutarKurus: 1860000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90197",
    tarih: "2026-09-28T17:12:00+03:00",
    cekimYapanId: "320.01.001",
    musteriTuru: "KENDI_KARTI",
    musteri: {
      unvan: "Ankara Lastik Bayi Ltd.",
      cariNo: "320.01.001",
      vergiNo: "1234567890"
    },
    kartSon4: "7310",
    odemeTipi: "LINK",
    taksit: 3,
    tutarKurus: 530000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90190",
    tarih: "2026-09-28T15:40:00+03:00",
    cekimYapanId: "100.00.001",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Polat Filo Kiralama",
      cariNo: "120.02.057",
      vergiNo: "7230094418"
    },
    kartSon4: "4470",
    odemeTipi: "MANUEL",
    taksit: 12,
    tutarKurus: 3275000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90184",
    tarih: "2026-09-28T13:21:00+03:00",
    cekimYapanId: "320.01.001",
    musteriTuru: "ALT_BAYI",
    musteri: {
      unvan: "Keçiören Lastik",
      cariNo: "540.02.012",
      vergiNo: "8877665544"
    },
    kartSon4: "5813",
    odemeTipi: "MANUEL",
    taksit: 6,
    tutarKurus: 948000,
    durum: "IPTAL"
  },
  {
    islemNo: "TRX-90180",
    tarih: "2026-09-28T10:58:00+03:00",
    cekimYapanId: "540.02.011",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Kaya Lastik",
      cariNo: "120.02.011",
      vergiNo: "6031187720"
    },
    kartSon4: "7702",
    odemeTipi: "LINK",
    taksit: 2,
    tutarKurus: 310000,
    durum: "IADE"
  },
  {
    islemNo: "TRX-90176",
    tarih: "2026-09-27T18:02:00+03:00",
    cekimYapanId: "540.02.011",
    musteriTuru: "KENDI_KARTI",
    musteri: {
      unvan: "Çankaya Oto Servis",
      cariNo: "540.02.011",
      vergiNo: "9988776655"
    },
    kartSon4: "2486",
    odemeTipi: "MANUEL",
    taksit: 3,
    tutarKurus: 890000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90172",
    tarih: "2026-09-27T16:34:00+03:00",
    cekimYapanId: "100.00.001",
    musteriTuru: "DUZENSIZ_MUSTERI",
    musteri: {
      unvan: "Güneş Akaryakıt",
      cariNo: "120.03.021",
      vergiNo: "4419920031"
    },
    kartSon4: "5208",
    odemeTipi: "MANUEL",
    taksit: 1,
    tutarKurus: 1120000,
    durum: "IPTAL"
  },
  {
    islemNo: "TRX-90166",
    tarih: "2026-09-27T14:09:00+03:00",
    cekimYapanId: "320.01.002",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Çelik Ltd.",
      cariNo: "120.02.044",
      vergiNo: "1180654432"
    },
    kartSon4: "2201",
    odemeTipi: "LINK",
    taksit: 3,
    tutarKurus: 690000,
    durum: "BASARISIZ"
  },
  {
    islemNo: "TRX-90161",
    tarih: "2026-09-27T12:30:00+03:00",
    cekimYapanId: "540.02.012",
    musteriTuru: "DUZENSIZ_MUSTERI",
    musteri: {
      unvan: "Ece Kırtasiye",
      cariNo: "120.04.003",
      vergiNo: "3017745520"
    },
    kartSon4: "9934",
    odemeTipi: "LINK",
    taksit: 1,
    tutarKurus: 145000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90155",
    tarih: "2026-09-27T10:15:00+03:00",
    cekimYapanId: "320.01.001",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Demir Ticaret",
      cariNo: "120.01.032",
      vergiNo: "2950418873"
    },
    kartSon4: "1190",
    odemeTipi: "MANUEL",
    taksit: 1,
    tutarKurus: 275000,
    durum: "IPTAL"
  },
  {
    islemNo: "TRX-90149",
    tarih: "2026-09-26T17:40:00+03:00",
    cekimYapanId: "100.00.001",
    musteriTuru: "BAYI",
    musteri: {
      unvan: "Ankara Lastik Bayi Ltd.",
      cariNo: "320.01.001",
      vergiNo: "1234567890"
    },
    kartSon4: "7702",
    odemeTipi: "MANUEL",
    taksit: 9,
    tutarKurus: 6430000,
    durum: "BASARILI"
  },
  {
    islemNo: "TRX-90142",
    tarih: "2026-09-26T15:05:00+03:00",
    cekimYapanId: "540.02.011",
    musteriTuru: "DUZENLI_MUSTERI",
    musteri: {
      unvan: "Yılmaz Otomotiv",
      cariNo: "120.01.045",
      vergiNo: "4820193746"
    },
    kartSon4: "4821",
    odemeTipi: "MANUEL",
    taksit: 2,
    tutarKurus: 560000,
    durum: "BASARILI"
  },
  // --- Temmuz–Eylül geçmişi (üretildi; dönem karşılaştırması ve 90 günlük raporlar için geçmiş) ---
  {"islemNo": "TRX-89300", "tarih": "2026-07-14T10:30:00+03:00", "cekimYapanId": "320.01.003", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Doğan Oto Yedek", "cariNo": "120.03.014", "vergiNo": "5402219987"}, "kartSon4": "5337", "odemeTipi": "MANUEL", "taksit": 7, "tutarKurus": 1900000, "durum": "BASARILI"},
  {"islemNo": "TRX-89301", "tarih": "2026-07-16T10:40:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "KENDI_KARTI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "9652", "odemeTipi": "MANUEL", "taksit": 9, "tutarKurus": 280000, "durum": "BASARILI"},
  {"islemNo": "TRX-89302", "tarih": "2026-07-16T12:00:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Polat Filo Kiralama", "cariNo": "120.02.057", "vergiNo": "7230094418"}, "kartSon4": "7008", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 2800000, "durum": "BASARILI"},
  {"islemNo": "TRX-89303", "tarih": "2026-07-16T16:50:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "4654", "odemeTipi": "LINK", "taksit": 9, "tutarKurus": 1830000, "durum": "BASARILI"},
  {"islemNo": "TRX-89304", "tarih": "2026-07-17T17:15:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Doğan Oto Yedek", "cariNo": "120.03.014", "vergiNo": "5402219987"}, "kartSon4": "1474", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 1970000, "durum": "BASARILI"},
  {"islemNo": "TRX-89305", "tarih": "2026-07-17T18:05:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "KENDI_KARTI", "musteri": {"unvan": "Çankaya Oto Servis", "cariNo": "540.02.011", "vergiNo": "9988776655"}, "kartSon4": "2319", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 2010000, "durum": "BASARILI"},
  {"islemNo": "TRX-89306", "tarih": "2026-07-17T18:15:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Akın Taşımacılık", "cariNo": "120.02.083", "vergiNo": "3360721194"}, "kartSon4": "1031", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 3340000, "durum": "BASARILI"},
  {"islemNo": "TRX-89307", "tarih": "2026-07-18T09:55:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Doğan Oto Yedek", "cariNo": "120.03.014", "vergiNo": "5402219987"}, "kartSon4": "4265", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 2130000, "durum": "BASARISIZ"},
  {"islemNo": "TRX-89308", "tarih": "2026-07-19T12:45:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "BAYI", "musteri": {"unvan": "İzmir Oto Merkezi A.Ş.", "cariNo": "320.01.002", "vergiNo": "2345678901"}, "kartSon4": "7485", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 8590000, "durum": "BASARILI"},
  {"islemNo": "TRX-89309", "tarih": "2026-07-19T17:45:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENSIZ_MUSTERI", "musteri": {"unvan": "Arslan Ticaret", "cariNo": "120.01.077", "vergiNo": "3925571046"}, "kartSon4": "1451", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 800000, "durum": "BASARILI"},
  {"islemNo": "TRX-89310", "tarih": "2026-07-20T11:10:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Ergün İnşaat Makinaları", "cariNo": "120.02.071", "vergiNo": "8120067743"}, "kartSon4": "9989", "odemeTipi": "LINK", "taksit": 3, "tutarKurus": 940000, "durum": "BASARILI"},
  {"islemNo": "TRX-89311", "tarih": "2026-07-21T13:35:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "3281", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 640000, "durum": "IADE"},
  {"islemNo": "TRX-89312", "tarih": "2026-07-21T17:30:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "BAYI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "4486", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 3770000, "durum": "BASARISIZ"},
  {"islemNo": "TRX-89313", "tarih": "2026-07-22T14:45:00+03:00", "cekimYapanId": "320.01.003", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "3147", "odemeTipi": "MANUEL", "taksit": 7, "tutarKurus": 2290000, "durum": "BASARILI"},
  {"islemNo": "TRX-89314", "tarih": "2026-07-23T09:45:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Polat Filo Kiralama", "cariNo": "120.02.057", "vergiNo": "7230094418"}, "kartSon4": "9219", "odemeTipi": "MANUEL", "taksit": 9, "tutarKurus": 2300000, "durum": "BASARILI"},
  {"islemNo": "TRX-89315", "tarih": "2026-07-24T16:00:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Aksoy Nakliyat", "cariNo": "120.01.088", "vergiNo": "0560372219"}, "kartSon4": "3319", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 1030000, "durum": "BASARILI"},
  {"islemNo": "TRX-89316", "tarih": "2026-07-24T16:35:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "1930", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 690000, "durum": "BASARILI"},
  {"islemNo": "TRX-89317", "tarih": "2026-07-25T18:20:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "6334", "odemeTipi": "LINK", "taksit": 1, "tutarKurus": 710000, "durum": "IPTAL"},
  {"islemNo": "TRX-89318", "tarih": "2026-07-28T15:40:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Aksoy Nakliyat", "cariNo": "120.01.088", "vergiNo": "0560372219"}, "kartSon4": "9325", "odemeTipi": "LINK", "taksit": 3, "tutarKurus": 2460000, "durum": "BASARILI"},
  {"islemNo": "TRX-89319", "tarih": "2026-07-29T17:05:00+03:00", "cekimYapanId": "540.02.012", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Şahin Oto", "cariNo": "120.01.019", "vergiNo": "7810253364"}, "kartSon4": "4319", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 1470000, "durum": "BASARILI"},
  {"islemNo": "TRX-89320", "tarih": "2026-08-03T10:15:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Doğan Oto Yedek", "cariNo": "120.03.014", "vergiNo": "5402219987"}, "kartSon4": "5960", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 3570000, "durum": "BASARILI"},
  {"islemNo": "TRX-89321", "tarih": "2026-08-03T14:05:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Şahin Oto", "cariNo": "120.01.019", "vergiNo": "7810253364"}, "kartSon4": "3248", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 1440000, "durum": "BASARILI"},
  {"islemNo": "TRX-89322", "tarih": "2026-08-06T13:10:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Şahin Oto", "cariNo": "120.01.019", "vergiNo": "7810253364"}, "kartSon4": "7616", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 2780000, "durum": "BASARILI"},
  {"islemNo": "TRX-89323", "tarih": "2026-08-07T18:00:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "1296", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 3750000, "durum": "BASARILI"},
  {"islemNo": "TRX-89324", "tarih": "2026-08-08T12:00:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "BAYI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "2377", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 570000, "durum": "IPTAL"},
  {"islemNo": "TRX-89325", "tarih": "2026-08-10T10:45:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "ALT_BAYI", "musteri": {"unvan": "Çankaya Oto Servis", "cariNo": "540.02.011", "vergiNo": "9988776655"}, "kartSon4": "5237", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 2310000, "durum": "BASARILI"},
  {"islemNo": "TRX-89326", "tarih": "2026-08-10T11:55:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "2186", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 2320000, "durum": "BASARILI"},
  {"islemNo": "TRX-89327", "tarih": "2026-08-10T15:30:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENSIZ_MUSTERI", "musteri": {"unvan": "Öztürk A.Ş.", "cariNo": "120.03.006", "vergiNo": "6640981125"}, "kartSon4": "5332", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 490000, "durum": "BASARILI"},
  {"islemNo": "TRX-89328", "tarih": "2026-08-11T14:45:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "BAYI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "4906", "odemeTipi": "MANUEL", "taksit": 9, "tutarKurus": 8460000, "durum": "BASARILI"},
  {"islemNo": "TRX-89329", "tarih": "2026-08-12T13:00:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "BAYI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "5997", "odemeTipi": "LINK", "taksit": 3, "tutarKurus": 7630000, "durum": "BASARILI"},
  {"islemNo": "TRX-89330", "tarih": "2026-08-14T11:30:00+03:00", "cekimYapanId": "540.02.012", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Şahin Oto", "cariNo": "120.01.019", "vergiNo": "7810253364"}, "kartSon4": "6685", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 1530000, "durum": "BASARILI"},
  {"islemNo": "TRX-89331", "tarih": "2026-08-17T17:35:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "8778", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 2780000, "durum": "BASARILI"},
  {"islemNo": "TRX-89332", "tarih": "2026-08-18T18:50:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "ALT_BAYI", "musteri": {"unvan": "Çankaya Oto Servis", "cariNo": "540.02.011", "vergiNo": "9988776655"}, "kartSon4": "7440", "odemeTipi": "LINK", "taksit": 6, "tutarKurus": 2940000, "durum": "BASARILI"},
  {"islemNo": "TRX-89333", "tarih": "2026-08-19T11:55:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "ALT_BAYI", "musteri": {"unvan": "Çankaya Oto Servis", "cariNo": "540.02.011", "vergiNo": "9988776655"}, "kartSon4": "6694", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 2220000, "durum": "BASARILI"},
  {"islemNo": "TRX-89334", "tarih": "2026-08-19T14:55:00+03:00", "cekimYapanId": "540.02.012", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Şahin Oto", "cariNo": "120.01.019", "vergiNo": "7810253364"}, "kartSon4": "7240", "odemeTipi": "LINK", "taksit": 1, "tutarKurus": 3550000, "durum": "BASARILI"},
  {"islemNo": "TRX-89335", "tarih": "2026-08-19T16:45:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "1059", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 2430000, "durum": "BASARILI"},
  {"islemNo": "TRX-89336", "tarih": "2026-08-20T11:30:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "KENDI_KARTI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "1017", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 1080000, "durum": "BASARILI"},
  {"islemNo": "TRX-89337", "tarih": "2026-08-22T11:35:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Polat Filo Kiralama", "cariNo": "120.02.057", "vergiNo": "7230094418"}, "kartSon4": "9269", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 1420000, "durum": "BASARILI"},
  {"islemNo": "TRX-89338", "tarih": "2026-08-22T16:20:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "9670", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 580000, "durum": "BASARILI"},
  {"islemNo": "TRX-89339", "tarih": "2026-08-22T18:00:00+03:00", "cekimYapanId": "540.02.012", "musteriTuru": "DUZENSIZ_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "3371", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 3310000, "durum": "BASARILI"},
  {"islemNo": "TRX-89340", "tarih": "2026-08-23T18:35:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Doğan Oto Yedek", "cariNo": "120.03.014", "vergiNo": "5402219987"}, "kartSon4": "1263", "odemeTipi": "LINK", "taksit": 9, "tutarKurus": 2730000, "durum": "BASARILI"},
  {"islemNo": "TRX-89341", "tarih": "2026-08-25T16:05:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "8395", "odemeTipi": "LINK", "taksit": 1, "tutarKurus": 2070000, "durum": "BASARILI"},
  {"islemNo": "TRX-89342", "tarih": "2026-08-25T18:00:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "9768", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 2720000, "durum": "BASARILI"},
  {"islemNo": "TRX-89343", "tarih": "2026-08-26T18:45:00+03:00", "cekimYapanId": "540.02.012", "musteriTuru": "DUZENSIZ_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "8542", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 1330000, "durum": "BASARILI"},
  {"islemNo": "TRX-89344", "tarih": "2026-08-27T11:50:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "3415", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 540000, "durum": "BASARILI"},
  {"islemNo": "TRX-89345", "tarih": "2026-08-27T12:10:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "2630", "odemeTipi": "LINK", "taksit": 3, "tutarKurus": 3590000, "durum": "BASARILI"},
  {"islemNo": "TRX-89346", "tarih": "2026-08-28T14:00:00+03:00", "cekimYapanId": "320.01.003", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Doğan Oto Yedek", "cariNo": "120.03.014", "vergiNo": "5402219987"}, "kartSon4": "4264", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 2960000, "durum": "BASARILI"},
  {"islemNo": "TRX-89347", "tarih": "2026-08-30T15:05:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "BAYI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "5401", "odemeTipi": "MANUEL", "taksit": 9, "tutarKurus": 5800000, "durum": "BASARILI"},
  {"islemNo": "TRX-89348", "tarih": "2026-09-01T09:50:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "KENDI_KARTI", "musteri": {"unvan": "Ankara Lastik Bayi Ltd.", "cariNo": "320.01.001", "vergiNo": "1234567890"}, "kartSon4": "3322", "odemeTipi": "LINK", "taksit": 9, "tutarKurus": 610000, "durum": "BASARILI"},
  {"islemNo": "TRX-89349", "tarih": "2026-09-01T10:15:00+03:00", "cekimYapanId": "320.01.003", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "5580", "odemeTipi": "MANUEL", "taksit": 7, "tutarKurus": 2750000, "durum": "BASARILI"},
  {"islemNo": "TRX-89350", "tarih": "2026-09-01T11:40:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "7642", "odemeTipi": "MANUEL", "taksit": 12, "tutarKurus": 750000, "durum": "IPTAL"},
  {"islemNo": "TRX-89351", "tarih": "2026-09-01T14:50:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "1028", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 1840000, "durum": "BASARILI"},
  {"islemNo": "TRX-89352", "tarih": "2026-09-04T11:05:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "KENDI_KARTI", "musteri": {"unvan": "Çankaya Oto Servis", "cariNo": "540.02.011", "vergiNo": "9988776655"}, "kartSon4": "7437", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 480000, "durum": "BASARILI"},
  {"islemNo": "TRX-89353", "tarih": "2026-09-05T13:55:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "BAYI", "musteri": {"unvan": "Bursa Lastik Dünyası", "cariNo": "320.01.003", "vergiNo": "3456789012"}, "kartSon4": "5508", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 8930000, "durum": "BASARILI"},
  {"islemNo": "TRX-89354", "tarih": "2026-09-05T15:40:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "5084", "odemeTipi": "MANUEL", "taksit": 12, "tutarKurus": 910000, "durum": "BASARILI"},
  {"islemNo": "TRX-89355", "tarih": "2026-09-06T14:20:00+03:00", "cekimYapanId": "320.01.002", "musteriTuru": "DUZENSIZ_MUSTERI", "musteri": {"unvan": "Arslan Ticaret", "cariNo": "120.01.077", "vergiNo": "3925571046"}, "kartSon4": "9998", "odemeTipi": "MANUEL", "taksit": 12, "tutarKurus": 490000, "durum": "IPTAL"},
  {"islemNo": "TRX-89356", "tarih": "2026-09-07T14:10:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "3270", "odemeTipi": "LINK", "taksit": 6, "tutarKurus": 3290000, "durum": "BASARILI"},
  {"islemNo": "TRX-89357", "tarih": "2026-09-09T15:00:00+03:00", "cekimYapanId": "320.01.003", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "7797", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 2560000, "durum": "BASARILI"},
  {"islemNo": "TRX-89358", "tarih": "2026-09-10T18:10:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "3741", "odemeTipi": "LINK", "taksit": 6, "tutarKurus": 760000, "durum": "BASARILI"},
  {"islemNo": "TRX-89359", "tarih": "2026-09-11T10:10:00+03:00", "cekimYapanId": "320.01.003", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Doğan Oto Yedek", "cariNo": "120.03.014", "vergiNo": "5402219987"}, "kartSon4": "3287", "odemeTipi": "LINK", "taksit": 2, "tutarKurus": 630000, "durum": "IPTAL"},
  {"islemNo": "TRX-89360", "tarih": "2026-09-11T17:30:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "4917", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 1780000, "durum": "BASARILI"},
  {"islemNo": "TRX-89361", "tarih": "2026-09-13T15:10:00+03:00", "cekimYapanId": "540.02.012", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Şahin Oto", "cariNo": "120.01.019", "vergiNo": "7810253364"}, "kartSon4": "7174", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 1220000, "durum": "BASARILI"},
  {"islemNo": "TRX-89362", "tarih": "2026-09-13T18:50:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "5440", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 620000, "durum": "BASARILI"},
  {"islemNo": "TRX-89363", "tarih": "2026-09-18T10:45:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Polat Filo Kiralama", "cariNo": "120.02.057", "vergiNo": "7230094418"}, "kartSon4": "1528", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 800000, "durum": "BASARISIZ"},
  {"islemNo": "TRX-89364", "tarih": "2026-09-18T13:55:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "KENDI_KARTI", "musteri": {"unvan": "Çankaya Oto Servis", "cariNo": "540.02.011", "vergiNo": "9988776655"}, "kartSon4": "2198", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 150000, "durum": "BASARILI"},
  {"islemNo": "TRX-89365", "tarih": "2026-09-19T11:05:00+03:00", "cekimYapanId": "100.00.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Ergün İnşaat Makinaları", "cariNo": "120.02.071", "vergiNo": "8120067743"}, "kartSon4": "5070", "odemeTipi": "MANUEL", "taksit": 6, "tutarKurus": 2440000, "durum": "BASARILI"},
  {"islemNo": "TRX-89366", "tarih": "2026-09-19T11:20:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "8492", "odemeTipi": "MANUEL", "taksit": 1, "tutarKurus": 530000, "durum": "IADE"},
  {"islemNo": "TRX-89367", "tarih": "2026-09-19T15:30:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "1615", "odemeTipi": "LINK", "taksit": 2, "tutarKurus": 3060000, "durum": "BASARILI"},
  {"islemNo": "TRX-89368", "tarih": "2026-09-21T18:30:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Arslan Ticaret", "cariNo": "120.01.077", "vergiNo": "3925571046"}, "kartSon4": "9592", "odemeTipi": "LINK", "taksit": 1, "tutarKurus": 1680000, "durum": "BASARILI"},
  {"islemNo": "TRX-89369", "tarih": "2026-09-22T16:05:00+03:00", "cekimYapanId": "540.02.011", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Demir Ticaret", "cariNo": "120.01.032", "vergiNo": "2950418873"}, "kartSon4": "6183", "odemeTipi": "LINK", "taksit": 6, "tutarKurus": 1570000, "durum": "BASARILI"},
  {"islemNo": "TRX-89370", "tarih": "2026-09-22T18:50:00+03:00", "cekimYapanId": "320.01.001", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Yılmaz Otomotiv", "cariNo": "120.01.045", "vergiNo": "4820193746"}, "kartSon4": "1356", "odemeTipi": "MANUEL", "taksit": 3, "tutarKurus": 430000, "durum": "IADE"},
  {"islemNo": "TRX-89371", "tarih": "2026-09-25T10:05:00+03:00", "cekimYapanId": "320.01.003", "musteriTuru": "DUZENLI_MUSTERI", "musteri": {"unvan": "Çelik Ltd.", "cariNo": "120.02.044", "vergiNo": "1180654432"}, "kartSon4": "7952", "odemeTipi": "MANUEL", "taksit": 2, "tutarKurus": 1310000, "durum": "BASARILI"}
];

export const odemeLinkleri = [
  {
    linkNo: "LNK-7Q2M4X",
    olusturma: "2026-09-30T15:10:00+03:00",
    sonGecerlilik: "2026-10-03T15:10:00+03:00",
    olusturanId: "100.00.001",
    musteriTuru: "BAYI",
    musteriUnvan: "İzmir Oto Merkezi A.Ş.",
    tutarKurus: 4200000,
    kanal: "EPOSTA",
    durum: "BEKLIYOR"
  },
  {
    linkNo: "LNK-5H8C1R",
    olusturma: "2026-09-30T11:42:00+03:00",
    sonGecerlilik: "2026-10-07T11:42:00+03:00",
    olusturanId: "320.01.001",
    musteriTuru: "DUZENLI_MUSTERI",
    musteriUnvan: "Akın Taşımacılık",
    tutarKurus: 1875000,
    kanal: "SMS",
    durum: "BEKLIYOR"
  },
  {
    linkNo: "LNK-9D3V6K",
    olusturma: "2026-09-29T16:05:00+03:00",
    sonGecerlilik: "2026-09-30T16:05:00+03:00",
    olusturanId: "540.02.011",
    musteriTuru: "MUSTERI_KARTI",
    musteriUnvan: "Erdem Kaya",
    tutarKurus: 240000,
    kanal: "SMS",
    durum: "ODENDI"
  },
  {
    linkNo: "LNK-2B7N8P",
    olusturma: "2026-09-29T10:20:00+03:00",
    sonGecerlilik: "2026-10-02T10:20:00+03:00",
    olusturanId: "100.00.001",
    musteriTuru: "DUZENLI_MUSTERI",
    musteriUnvan: "Polat Filo Kiralama",
    tutarKurus: 2730000,
    kanal: "SMS",
    durum: "ODENDI"
  },
  {
    linkNo: "LNK-4T1Z5W",
    olusturma: "2026-09-28T14:33:00+03:00",
    sonGecerlilik: "2026-09-29T14:33:00+03:00",
    olusturanId: "320.01.001",
    musteriTuru: "ALT_BAYI",
    musteriUnvan: "Keçiören Lastik",
    tutarKurus: 990000,
    kanal: "EPOSTA",
    durum: "SURESI_DOLDU"
  },
  {
    linkNo: "LNK-8G6J3L",
    olusturma: "2026-09-27T17:58:00+03:00",
    sonGecerlilik: "2026-10-04T17:58:00+03:00",
    olusturanId: "540.02.011",
    musteriTuru: "MUSTERI_KARTI",
    musteriUnvan: "Hilal Demir",
    tutarKurus: 115000,
    kanal: "LINK",
    durum: "IPTAL_EDILDI"
  },
  {
    linkNo: "LNK-6F4S9A",
    olusturma: "2026-09-26T09:12:00+03:00",
    sonGecerlilik: "2026-10-26T09:12:00+03:00",
    olusturanId: "100.00.001",
    musteriTuru: "BAYI",
    musteriUnvan: "Bursa Lastik Dünyası",
    tutarKurus: 5500000,
    kanal: "EPOSTA",
    durum: "BEKLIYOR"
  }
];

export const iptalIadeTalepleri = [
  {
    talepNo: "TLP-4418",
    tarih: "2026-10-01T09:40:00+03:00",
    islemNo: "TRX-90241",
    girenId: "320.01.001",
    tur: "IADE",
    tutarKurus: 240000,
    aciklama: "Kısmi iade — 2 adet lastik geri alındı",
    durum: "ANA_FIRMA_ONAYINDA",
    gecmis: [
      {
        tarih: "2026-10-01T09:40:00+03:00",
        firmaId: "320.01.001",
        olay: "TALEP_GIRILDI"
      }
    ]
  },
  {
    talepNo: "TLP-4417",
    tarih: "2026-09-30T18:05:00+03:00",
    islemNo: "TRX-90240",
    girenId: "540.02.011",
    tur: "IPTAL",
    tutarKurus: 320000,
    aciklama: "Mükerrer çekim",
    durum: "BAYI_ONAYINDA",
    gecmis: [
      {
        tarih: "2026-09-30T18:05:00+03:00",
        firmaId: "540.02.011",
        olay: "TALEP_GIRILDI"
      }
    ]
  },
  {
    talepNo: "TLP-4416",
    tarih: "2026-09-30T17:20:00+03:00",
    islemNo: "TRX-90161",
    girenId: "540.02.012",
    tur: "IPTAL",
    tutarKurus: 145000,
    aciklama: "Yanlış müşteriye çekim yapıldı",
    durum: "BAYI_ONAYINDA",
    gecmis: [
      {
        tarih: "2026-09-30T17:20:00+03:00",
        firmaId: "540.02.012",
        olay: "TALEP_GIRILDI"
      }
    ]
  },
  {
    talepNo: "TLP-4415",
    tarih: "2026-09-30T16:30:00+03:00",
    islemNo: "TRX-90224",
    girenId: "320.01.002",
    tur: "IADE",
    tutarKurus: 90000,
    aciklama: "Fiyat farkı iadesi",
    durum: "ANA_FIRMA_ONAYINDA",
    gecmis: [
      {
        tarih: "2026-09-30T16:30:00+03:00",
        firmaId: "320.01.002",
        olay: "TALEP_GIRILDI"
      }
    ]
  },
  {
    talepNo: "TLP-4413",
    tarih: "2026-09-30T11:02:00+03:00",
    islemNo: "TRX-90219",
    girenId: "540.02.011",
    tur: "IPTAL",
    tutarKurus: 415000,
    aciklama: "Müşteri siparişten vazgeçti",
    durum: "ANA_FIRMA_ONAYINDA",
    gecmis: [
      {
        tarih: "2026-09-30T11:02:00+03:00",
        firmaId: "540.02.011",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-30T14:20:00+03:00",
        firmaId: "320.01.001",
        olay: "ONAYLADI_ILETTI"
      }
    ]
  },
  {
    talepNo: "TLP-4411",
    tarih: "2026-09-30T10:15:00+03:00",
    islemNo: "TRX-90231",
    girenId: "320.01.001",
    tur: "IPTAL",
    tutarKurus: 198000,
    aciklama: "Yanlış tutar girildi",
    durum: "ONAYLANDI",
    gecmis: [
      {
        tarih: "2026-09-30T10:15:00+03:00",
        firmaId: "320.01.001",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-30T12:40:00+03:00",
        firmaId: "100.00.001",
        olay: "ONAYLADI"
      }
    ]
  },
  {
    talepNo: "TLP-4410",
    tarih: "2026-09-29T18:10:00+03:00",
    islemNo: "TRX-90228",
    girenId: "540.02.012",
    tur: "IADE",
    tutarKurus: 640000,
    aciklama: "Ürün iadesi",
    durum: "ONAYLANDI",
    gecmis: [
      {
        tarih: "2026-09-29T18:10:00+03:00",
        firmaId: "540.02.012",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-29T19:02:00+03:00",
        firmaId: "320.01.001",
        olay: "ONAYLADI_ILETTI"
      },
      {
        tarih: "2026-09-30T09:15:00+03:00",
        firmaId: "100.00.001",
        olay: "ONAYLADI"
      }
    ]
  },
  {
    talepNo: "TLP-4406",
    tarih: "2026-09-29T12:00:00+03:00",
    islemNo: "TRX-90203",
    girenId: "320.01.003",
    tur: "IADE",
    tutarKurus: 1860000,
    aciklama: "Hatalı ürün",
    durum: "REDDEDILDI",
    gecmis: [
      {
        tarih: "2026-09-29T12:00:00+03:00",
        firmaId: "320.01.003",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-29T15:30:00+03:00",
        firmaId: "100.00.001",
        olay: "REDDETTI",
        not: "Fatura kesilmiş, önce iade faturası yüklenmeli"
      }
    ]
  },
  {
    talepNo: "TLP-4404",
    tarih: "2026-09-28T16:45:00+03:00",
    islemNo: "TRX-90184",
    girenId: "320.01.001",
    tur: "IPTAL",
    tutarKurus: 948000,
    aciklama: "Sipariş iptali",
    durum: "ONAYLANDI",
    gecmis: [
      {
        tarih: "2026-09-28T16:45:00+03:00",
        firmaId: "320.01.001",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-28T17:30:00+03:00",
        firmaId: "100.00.001",
        olay: "ONAYLADI"
      }
    ]
  },
  {
    talepNo: "TLP-4402",
    tarih: "2026-09-28T11:30:00+03:00",
    islemNo: "TRX-90180",
    girenId: "540.02.011",
    tur: "IADE",
    tutarKurus: 310000,
    aciklama: "Ürün iadesi",
    durum: "ONAYLANDI",
    gecmis: [
      {
        tarih: "2026-09-28T11:30:00+03:00",
        firmaId: "540.02.011",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-28T13:05:00+03:00",
        firmaId: "320.01.001",
        olay: "ONAYLADI_ILETTI"
      },
      {
        tarih: "2026-09-28T15:40:00+03:00",
        firmaId: "100.00.001",
        olay: "ONAYLADI"
      }
    ]
  },
  {
    talepNo: "TLP-4400",
    tarih: "2026-09-27T17:00:00+03:00",
    islemNo: "TRX-90172",
    girenId: "100.00.001",
    tur: "IPTAL",
    tutarKurus: 1120000,
    aciklama: "Yanlış karttan çekim",
    durum: "ONAYLANDI",
    gecmis: [
      {
        tarih: "2026-09-27T17:00:00+03:00",
        firmaId: "100.00.001",
        olay: "TALEP_GIRILDI",
        not: "ana firma girişi, onay gerekmedi"
      }
    ]
  },
  {
    talepNo: "TLP-4398",
    tarih: "2026-09-27T11:20:00+03:00",
    islemNo: "TRX-90155",
    girenId: "320.01.001",
    tur: "IPTAL",
    tutarKurus: 275000,
    aciklama: "Mükerrer işlem",
    durum: "ONAYLANDI",
    gecmis: [
      {
        tarih: "2026-09-27T11:20:00+03:00",
        firmaId: "320.01.001",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-27T14:10:00+03:00",
        firmaId: "100.00.001",
        olay: "ONAYLADI"
      }
    ]
  },
  {
    talepNo: "TLP-4396",
    tarih: "2026-09-26T16:00:00+03:00",
    islemNo: "TRX-90142",
    girenId: "540.02.011",
    tur: "IADE",
    tutarKurus: 560000,
    aciklama: "Müşteri talebi",
    durum: "REDDEDILDI",
    gecmis: [
      {
        tarih: "2026-09-26T16:00:00+03:00",
        firmaId: "540.02.011",
        olay: "TALEP_GIRILDI"
      },
      {
        tarih: "2026-09-26T17:45:00+03:00",
        firmaId: "320.01.001",
        olay: "REDDETTI",
        not: "İade süresi geçmiş"
      }
    ]
  }
];

export const faturalar = [
  {
    islemNo: "TRX-90241",
    faturaNo: "ANK2026000000412",
    faturaTarihi: "2026-09-30",
    tutarKurus: 1240000,
    dosyaAdi: "fatura_90241.pdf",
    yukleme: "2026-09-30T16:05:00+03:00",
    durum: "YUKLENDI"
  },
  {
    islemNo: "TRX-90224",
    faturaNo: "IZM2026000001187",
    faturaTarihi: "2026-09-29",
    tutarKurus: 1530000,
    dosyaAdi: "celik_ltd_fatura.pdf",
    yukleme: "2026-09-30T10:12:00+03:00",
    durum: "YUKLENDI"
  },
  {
    islemNo: "TRX-90219",
    faturaNo: "CNK2026000000098",
    faturaTarihi: "2026-09-29",
    tutarKurus: 451000,
    dosyaAdi: "arslan_fatura.jpg",
    yukleme: "2026-09-29T18:40:00+03:00",
    durum: "REDDEDILDI",
    redNedeni: "Fatura tutarı işlem tutarıyla uyuşmuyor"
  },
  {
    islemNo: "TRX-90203",
    faturaNo: "BRS2026000000731",
    faturaTarihi: "2026-09-29",
    tutarKurus: 1860000,
    dosyaAdi: "dogan_oto.pdf",
    yukleme: "2026-09-29T11:30:00+03:00",
    durum: "YUKLENDI"
  },
  {
    islemNo: "TRX-90142",
    faturaNo: "CNK2026000000091",
    faturaTarihi: "2026-09-26",
    tutarKurus: 560000,
    dosyaAdi: "yilmaz_otomotiv.pdf",
    yukleme: "2026-09-26T17:20:00+03:00",
    durum: "YUKLENDI"
  },
  // --- geçmiş işlemlerin yüklenmiş faturaları (üretildi; dönem karşılaştırması ve 90 günlük raporlar için geçmiş) ---
  {"islemNo": "TRX-89300", "faturaNo": "BRS2026124798844", "faturaTarihi": "2026-07-14", "tutarKurus": 1900000, "dosyaAdi": "fatura_89300.pdf", "yukleme": "2026-07-14T15:30:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89303", "faturaNo": "IZM2026978678309", "faturaTarihi": "2026-07-16", "tutarKurus": 1830000, "dosyaAdi": "fatura_89303.pdf", "yukleme": "2026-07-16T18:50:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89304", "faturaNo": "IZM2026307924673", "faturaTarihi": "2026-07-17", "tutarKurus": 1970000, "dosyaAdi": "fatura_89304.pdf", "yukleme": "2026-07-18T20:15:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89309", "faturaNo": "IZM2026756671867", "faturaTarihi": "2026-07-19", "tutarKurus": 800000, "dosyaAdi": "fatura_89309.pdf", "yukleme": "2026-07-20T19:45:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89314", "faturaNo": "IZM2026120084195", "faturaTarihi": "2026-07-23", "tutarKurus": 2300000, "dosyaAdi": "fatura_89314.pdf", "yukleme": "2026-07-25T14:45:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89316", "faturaNo": "CNK2026645153748", "faturaTarihi": "2026-07-24", "tutarKurus": 690000, "dosyaAdi": "fatura_89316.pdf", "yukleme": "2026-07-24T17:35:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89319", "faturaNo": "KEC2026574720684", "faturaTarihi": "2026-07-29", "tutarKurus": 1470000, "dosyaAdi": "fatura_89319.pdf", "yukleme": "2026-07-29T21:05:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89321", "faturaNo": "ANK2026623192278", "faturaTarihi": "2026-08-03", "tutarKurus": 1440000, "dosyaAdi": "fatura_89321.pdf", "yukleme": "2026-08-03T18:05:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89322", "faturaNo": "ANK2026198992583", "faturaTarihi": "2026-08-06", "tutarKurus": 2780000, "dosyaAdi": "fatura_89322.pdf", "yukleme": "2026-08-07T16:10:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89323", "faturaNo": "CNK2026650037437", "faturaTarihi": "2026-08-07", "tutarKurus": 3750000, "dosyaAdi": "fatura_89323.pdf", "yukleme": "2026-08-09T21:00:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89325", "faturaNo": "ANK2026631085639", "faturaTarihi": "2026-08-10", "tutarKurus": 2310000, "dosyaAdi": "fatura_89325.pdf", "yukleme": "2026-08-12T15:45:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89327", "faturaNo": "CNK2026548566738", "faturaTarihi": "2026-08-10", "tutarKurus": 490000, "dosyaAdi": "fatura_89327.pdf", "yukleme": "2026-08-11T20:30:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89332", "faturaNo": "ANK2026467976293", "faturaTarihi": "2026-08-18", "tutarKurus": 2940000, "dosyaAdi": "fatura_89332.pdf", "yukleme": "2026-08-18T20:50:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89333", "faturaNo": "ANK2026771570011", "faturaTarihi": "2026-08-19", "tutarKurus": 2220000, "dosyaAdi": "fatura_89333.pdf", "yukleme": "2026-08-19T12:55:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89334", "faturaNo": "KEC2026360074153", "faturaTarihi": "2026-08-19", "tutarKurus": 3550000, "dosyaAdi": "fatura_89334.pdf", "yukleme": "2026-08-20T19:55:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89335", "faturaNo": "CNK2026447391878", "faturaTarihi": "2026-08-19", "tutarKurus": 2430000, "dosyaAdi": "fatura_89335.pdf", "yukleme": "2026-08-20T21:45:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89337", "faturaNo": "IZM2026528971850", "faturaTarihi": "2026-08-22", "tutarKurus": 1420000, "dosyaAdi": "fatura_89337.pdf", "yukleme": "2026-08-22T13:35:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89338", "faturaNo": "CNK2026518240125", "faturaTarihi": "2026-08-22", "tutarKurus": 580000, "dosyaAdi": "fatura_89338.pdf", "yukleme": "2026-08-24T21:20:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89339", "faturaNo": "KEC2026773592740", "faturaTarihi": "2026-08-22", "tutarKurus": 3310000, "dosyaAdi": "fatura_89339.pdf", "yukleme": "2026-08-24T23:00:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89340", "faturaNo": "IZM2026191366527", "faturaTarihi": "2026-08-23", "tutarKurus": 2730000, "dosyaAdi": "fatura_89340.pdf", "yukleme": "2026-08-25T20:35:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89341", "faturaNo": "ANK2026830857592", "faturaTarihi": "2026-08-25", "tutarKurus": 2070000, "dosyaAdi": "fatura_89341.pdf", "yukleme": "2026-08-25T21:05:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89342", "faturaNo": "ANK2026370790737", "faturaTarihi": "2026-08-25", "tutarKurus": 2720000, "dosyaAdi": "fatura_89342.pdf", "yukleme": "2026-08-25T22:00:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89343", "faturaNo": "KEC2026834113597", "faturaTarihi": "2026-08-26", "tutarKurus": 1330000, "dosyaAdi": "fatura_89343.pdf", "yukleme": "2026-08-26T22:45:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89344", "faturaNo": "IZM2026766955542", "faturaTarihi": "2026-08-27", "tutarKurus": 540000, "dosyaAdi": "fatura_89344.pdf", "yukleme": "2026-08-29T14:50:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89345", "faturaNo": "CNK2026861144359", "faturaTarihi": "2026-08-27", "tutarKurus": 3590000, "dosyaAdi": "fatura_89345.pdf", "yukleme": "2026-08-28T15:10:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89349", "faturaNo": "BRS2026621989554", "faturaTarihi": "2026-09-01", "tutarKurus": 2750000, "dosyaAdi": "fatura_89349.pdf", "yukleme": "2026-09-01T14:15:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89351", "faturaNo": "CNK2026310175441", "faturaTarihi": "2026-09-01", "tutarKurus": 1840000, "dosyaAdi": "fatura_89351.pdf", "yukleme": "2026-09-02T15:50:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89354", "faturaNo": "IZM2026930199614", "faturaTarihi": "2026-09-05", "tutarKurus": 910000, "dosyaAdi": "fatura_89354.pdf", "yukleme": "2026-09-06T17:40:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89357", "faturaNo": "BRS2026536163878", "faturaTarihi": "2026-09-09", "tutarKurus": 2560000, "dosyaAdi": "fatura_89357.pdf", "yukleme": "2026-09-10T18:00:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89358", "faturaNo": "CNK2026971692124", "faturaTarihi": "2026-09-10", "tutarKurus": 760000, "dosyaAdi": "fatura_89358.pdf", "yukleme": "2026-09-10T23:10:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89360", "faturaNo": "ANK2026121562591", "faturaTarihi": "2026-09-11", "tutarKurus": 1780000, "dosyaAdi": "fatura_89360.pdf", "yukleme": "2026-09-13T19:30:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89361", "faturaNo": "KEC2026397980907", "faturaTarihi": "2026-09-13", "tutarKurus": 1220000, "dosyaAdi": "fatura_89361.pdf", "yukleme": "2026-09-13T19:10:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89362", "faturaNo": "CNK2026563681107", "faturaTarihi": "2026-09-13", "tutarKurus": 620000, "dosyaAdi": "fatura_89362.pdf", "yukleme": "2026-09-15T22:50:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89367", "faturaNo": "CNK2026667207488", "faturaTarihi": "2026-09-19", "tutarKurus": 3060000, "dosyaAdi": "fatura_89367.pdf", "yukleme": "2026-09-19T18:30:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89368", "faturaNo": "CNK2026948779167", "faturaTarihi": "2026-09-21", "tutarKurus": 1680000, "dosyaAdi": "fatura_89368.pdf", "yukleme": "2026-09-22T20:30:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89369", "faturaNo": "CNK2026665086391", "faturaTarihi": "2026-09-22", "tutarKurus": 1570000, "dosyaAdi": "fatura_89369.pdf", "yukleme": "2026-09-22T20:05:00+03:00", "durum": "YUKLENDI"},
  {"islemNo": "TRX-89371", "faturaNo": "BRS2026871303373", "faturaTarihi": "2026-09-25", "tutarKurus": 1310000, "dosyaAdi": "fatura_89371.pdf", "yukleme": "2026-09-25T13:05:00+03:00", "durum": "YUKLENDI"}
];

export const panelOzetleri = {
  "100.00.001": {
    bugun: {
      TOPLAM: {
        adet: 1284,
        tutarKurus: 428490000,
        degisimYuzde: 6.4
      },
      BASARILI: {
        adet: 1180,
        tutarKurus: 396010000,
        degisimYuzde: 7.1
      },
      BASARISIZ: {
        adet: 74,
        tutarKurus: 21040000,
        degisimYuzde: -2.3
      },
      IPTAL: {
        adet: 18,
        tutarKurus: 6420000,
        degisimYuzde: 0.8
      },
      IADE: {
        adet: 12,
        tutarKurus: 5020000,
        degisimYuzde: -1.2
      }
    },
    seriler: {
      TOPLAM: [44, 50, 49, 57, 61, 66, 72],
      BASARILI: [40, 52, 47, 60, 58, 71, 76]
    }
  },
  "320.01.001": {
    bugun: {
      TOPLAM: {
        adet: 268,
        tutarKurus: 86230000,
        degisimYuzde: 6.4
      },
      BASARILI: {
        adet: 249,
        tutarKurus: 80410000,
        degisimYuzde: 7.1
      },
      BASARISIZ: {
        adet: 12,
        tutarKurus: 3870000,
        degisimYuzde: -2.3
      },
      IPTAL: {
        adet: 4,
        tutarKurus: 1290000,
        degisimYuzde: 0.8
      },
      IADE: {
        adet: 3,
        tutarKurus: 660000,
        degisimYuzde: -1.2
      }
    },
    seriler: {
      TOPLAM: [44, 50, 49, 57, 61, 66, 72],
      BASARILI: [40, 52, 47, 60, 58, 71, 76]
    }
  },
  "540.02.011": {
    bugun: {
      TOPLAM: {
        adet: 61,
        tutarKurus: 18450000,
        degisimYuzde: 6.4
      },
      BASARILI: {
        adet: 57,
        tutarKurus: 17120000,
        degisimYuzde: 7.1
      },
      BASARISIZ: {
        adet: 3,
        tutarKurus: 930000,
        degisimYuzde: -2.3
      },
      IPTAL: {
        adet: 1,
        tutarKurus: 240000,
        degisimYuzde: 0.8
      },
      IADE: {
        adet: 0,
        tutarKurus: 160000,
        degisimYuzde: -1.2
      }
    },
    seriler: {
      TOPLAM: [44, 50, 49, 57, 61, 66, 72],
      BASARILI: [40, 52, 47, 60, 58, 71, 76]
    }
  }
};

export const bakiyeler = {
  "100.00.001": {
    bakiyeKurus: 124050000,
    borcKurus: 32080000,
    limitKurus: 200000000,
    kullanimYuzde: 62
  },
  "320.01.001": {
    bakiyeKurus: 18420000,
    borcKurus: 4650000,
    limitKurus: 40000000,
    kullanimYuzde: 46
  },
  "540.02.011": {
    bakiyeKurus: 3890000,
    borcKurus: 1210000,
    limitKurus: 10000000,
    kullanimYuzde: 39
  }
};

// Üst cariye borç yüklemeleri (sevkiyat / fatura); ödemeler islemler tablosundan türetilir (bakiye ekstresi)
export const borcHareketleri = [
  { hareketId: "BH-101", firmaId: "320.01.001", tarih: "2026-10-01T09:00:00+03:00", aciklama: "Eylül sevkiyatı — fatura BRS-2026-0912", tutarKurus: 6800000 },
  { hareketId: "BH-102", firmaId: "320.01.001", tarih: "2026-09-16T09:00:00+03:00", aciklama: "Kampanya stoğu — fatura BRS-2026-0871", tutarKurus: 4250000 },
  { hareketId: "BH-103", firmaId: "320.01.001", tarih: "2026-08-28T09:00:00+03:00", aciklama: "Ağustos sevkiyatı — fatura BRS-2026-0790", tutarKurus: 5120000 },
  { hareketId: "BH-201", firmaId: "540.02.011", tarih: "2026-09-29T10:30:00+03:00", aciklama: "Lastik sevkiyatı — fatura ANK-2026-0233", tutarKurus: 1480000 },
  { hareketId: "BH-202", firmaId: "540.02.011", tarih: "2026-09-12T10:30:00+03:00", aciklama: "Jant ve balans — fatura ANK-2026-0219", tutarKurus: 960000 },
  { hareketId: "BH-203", firmaId: "540.02.011", tarih: "2026-08-22T10:30:00+03:00", aciklama: "Ağustos sevkiyatı — fatura ANK-2026-0198", tutarKurus: 1120000 }
];

export const haftalikHacim = [
  {
    gun: "2026-09-28",
    tutarKurus: 51200000
  },
  {
    gun: "2026-09-29",
    tutarKurus: 64400000
  },
  {
    gun: "2026-09-30",
    tutarKurus: 44600000
  },
  {
    gun: "2026-10-01",
    tutarKurus: 75100000
  },
  {
    gun: "2026-10-02",
    tutarKurus: 82600000
  },
  {
    gun: "2026-10-03",
    tutarKurus: 33000000
  },
  {
    gun: "2026-10-04",
    tutarKurus: 23100000
  }
];

export const kurlar = [
  {
    kod: "USD",
    ad: "Amerikan Doları",
    alis: 34.12,
    satis: 34.28,
    degisimYuzde: 0.18
  },
  {
    kod: "EUR",
    ad: "Euro",
    alis: 36.84,
    satis: 37.02,
    degisimYuzde: -0.09
  },
  {
    kod: "GBP",
    ad: "İngiliz Sterlini",
    alis: 43.1,
    satis: 43.45,
    degisimYuzde: 0.22
  }
];

export const kullanicilar = [
  { kullaniciId: "K-001", firmaId: "100.00.001", adSoyad: "Mehmet Yılmaz", email: "mehmet.yilmaz@brisa.com", telefon: "0532 411 20 01", yetki: "YONETICI", durum: "AKTIF", sonGiris: "2026-10-08T08:42:00+03:00", olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-002", firmaId: "100.00.001", adSoyad: "Ayşe Demir", email: "ayse.demir@brisa.com", telefon: "0533 204 18 77", yetki: "ODEME", durum: "AKTIF", sonGiris: "2026-10-07T17:05:00+03:00", olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-003", firmaId: "100.00.001", adSoyad: "Can Kaya", email: "can.kaya@brisa.com", telefon: "0542 318 40 12", yetki: "RAPORLAMA", durum: "AKTIF", sonGiris: "2026-10-02T09:30:00+03:00", olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-004", firmaId: "100.00.001", adSoyad: "Elif Şahin", email: "elif.sahin@brisa.com", telefon: "0536 772 51 90", yetki: "ODEME", durum: "PASIF", sonGiris: "2026-08-19T14:12:00+03:00", olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-101", firmaId: "320.01.001", adSoyad: "Murat Aydın", email: "murat@ankaralastik.com", telefon: "0312 440 11 20", yetki: "YONETICI", durum: "AKTIF", sonGiris: "2026-10-08T09:10:00+03:00", olusturma: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-102", firmaId: "320.01.001", adSoyad: "Selin Koç", email: "selin@ankaralastik.com", telefon: "0532 605 33 41", yetki: "ODEME", durum: "AKTIF", sonGiris: "2026-10-06T11:48:00+03:00", olusturma: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-103", firmaId: "320.01.001", adSoyad: "Burak Öz", email: "burak@ankaralastik.com", telefon: "0544 219 70 05", yetki: "RAPORLAMA", durum: "AKTIF", sonGiris: null, olusturma: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-101", adSoyad: "Murat Aydın", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-201", firmaId: "540.02.011", adSoyad: "Kemal Er", email: "kemal@cankayaotoservis.com", telefon: "0312 231 44 10", yetki: "YONETICI", durum: "AKTIF", sonGiris: "2026-10-07T16:20:00+03:00", olusturma: { kullaniciId: "K-201", adSoyad: "Kemal Er", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-201", adSoyad: "Kemal Er", tarih: "2026-08-21T11:30:00+03:00" } },
  { kullaniciId: "K-202", firmaId: "540.02.011", adSoyad: "Derya Ak", email: "derya@cankayaotoservis.com", telefon: "0535 118 62 34", yetki: "ODEME", durum: "AKTIF", sonGiris: "2026-10-05T10:02:00+03:00", olusturma: { kullaniciId: "K-201", adSoyad: "Kemal Er", tarih: "2026-02-10T09:00:00+03:00" }, sonDegisiklik: { kullaniciId: "K-201", adSoyad: "Kemal Er", tarih: "2026-08-21T11:30:00+03:00" } }
];

export const duyurular = [
  {
    duyuruId: "D-001",
    baslik: "+3 Taksit Kampanyası",
    icerik: "1-31 Ekim tarihleri arasında tüm bayilerde geçerli +3 taksit kampanyası başlamıştır.",
    hedef: [
      "BAYI",
      "ALT_BAYI"
    ],
    tarih: "2026-09-28",
    durum: "YAYINDA",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-01-15T09:30:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-02T14:05:00+03:00" }
  },
  {
    duyuruId: "D-002",
    baslik: "Sistem Bakımı",
    icerik: "05 Ekim 03:00-05:00 arası planlı bakım yapılacaktır.",
    hedef: [
      "BAYI",
      "ALT_BAYI"
    ],
    tarih: "2026-09-25",
    durum: "YAYINDA",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-01-15T09:30:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-02T14:05:00+03:00" }
  },
  {
    duyuruId: "D-003",
    baslik: "Yeni Vade Profili",
    icerik: "Profil 4 özel anlaşma oranları güncellenmiştir.",
    hedef: [
      "BAYI"
    ],
    tarih: "2026-09-20",
    durum: "ARSIV",
    olusturma: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-01-15T09:30:00+03:00" },
    sonDegisiklik: { kullaniciId: "K-001", adSoyad: "Mehmet Yılmaz", tarih: "2026-09-02T14:05:00+03:00" }
  }
];

// Duyuruyu okuyan kullanıcılar (pop-up "Okudum")
export const duyuruOkumalari = [
  { duyuruId: "D-002", kullaniciId: "K-101" },
  { duyuruId: "D-002", kullaniciId: "K-102" },
  { duyuruId: "D-001", kullaniciId: "K-102" }
];

export const oturumlar = {
  "demo-ANA_FIRMA": {
    kullaniciId: "K-001",
    adSoyad: "Mehmet Yılmaz",
    email: "mehmet.yilmaz@brisa.com",
    rol: "ANA_FIRMA",
    firmaId: "100.00.001",
    yetki: "YONETICI",
    aktifUyeIsyeri: "320.00.001"
  },
  "demo-BAYI": {
    kullaniciId: "K-101",
    adSoyad: "Murat Aydın",
    email: "murat@ankaralastik.com",
    rol: "BAYI",
    firmaId: "320.01.001",
    yetki: "YONETICI",
    aktifUyeIsyeri: "320.00.001"
  },
  "demo-ALT_BAYI": {
    kullaniciId: "K-201",
    adSoyad: "Kemal Er",
    email: "kemal@cankayaotoservis.com",
    rol: "ALT_BAYI",
    firmaId: "540.02.011",
    yetki: "YONETICI",
    aktifUyeIsyeri: "320.00.002"
  }
};


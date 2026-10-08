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
    durum: "AKTIF"
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
    durum: "AKTIF"
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
    durum: "AKTIF"
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
    durum: "PASIF"
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
    vadeProfilId: 4,
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
    durum: "AKTIF"
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
    durum: "AKTIF"
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
    durum: "AKTIF"
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
    durum: "PASIF"
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
    durum: "AKTIF"
  },
  {
    id: 2,
    ad: "Vade Farkı Profil 2",
    oranYuzde: 2.45,
    aciklama: "Orta segment",
    durum: "AKTIF"
  },
  {
    id: 3,
    ad: "Vade Farkı Profil 3",
    oranYuzde: 2.9,
    aciklama: "Yüksek risk",
    durum: "AKTIF"
  },
  {
    id: 4,
    ad: "Vade Farkı Profil 4",
    oranYuzde: 3.25,
    aciklama: "Özel anlaşma",
    durum: "PASIF"
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
  }
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
  }
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
  { kullaniciId: "K-001", firmaId: "100.00.001", adSoyad: "Mehmet Yılmaz", email: "mehmet.yilmaz@brisa.com", telefon: "0532 411 20 01", yetki: "YONETICI", durum: "AKTIF", sonGiris: "2026-10-08T08:42:00+03:00" },
  { kullaniciId: "K-002", firmaId: "100.00.001", adSoyad: "Ayşe Demir", email: "ayse.demir@brisa.com", telefon: "0533 204 18 77", yetki: "ODEME", durum: "AKTIF", sonGiris: "2026-10-07T17:05:00+03:00" },
  { kullaniciId: "K-003", firmaId: "100.00.001", adSoyad: "Can Kaya", email: "can.kaya@brisa.com", telefon: "0542 318 40 12", yetki: "RAPORLAMA", durum: "AKTIF", sonGiris: "2026-10-02T09:30:00+03:00" },
  { kullaniciId: "K-004", firmaId: "100.00.001", adSoyad: "Elif Şahin", email: "elif.sahin@brisa.com", telefon: "0536 772 51 90", yetki: "ODEME", durum: "PASIF", sonGiris: "2026-08-19T14:12:00+03:00" },
  { kullaniciId: "K-101", firmaId: "320.01.001", adSoyad: "Murat Aydın", email: "murat@ankaralastik.com", telefon: "0312 440 11 20", yetki: "YONETICI", durum: "AKTIF", sonGiris: "2026-10-08T09:10:00+03:00" },
  { kullaniciId: "K-102", firmaId: "320.01.001", adSoyad: "Selin Koç", email: "selin@ankaralastik.com", telefon: "0532 605 33 41", yetki: "ODEME", durum: "AKTIF", sonGiris: "2026-10-06T11:48:00+03:00" },
  { kullaniciId: "K-103", firmaId: "320.01.001", adSoyad: "Burak Öz", email: "burak@ankaralastik.com", telefon: "0544 219 70 05", yetki: "RAPORLAMA", durum: "AKTIF", sonGiris: null },
  { kullaniciId: "K-201", firmaId: "540.02.011", adSoyad: "Kemal Er", email: "kemal@cankayaotoservis.com", telefon: "0312 231 44 10", yetki: "YONETICI", durum: "AKTIF", sonGiris: "2026-10-07T16:20:00+03:00" },
  { kullaniciId: "K-202", firmaId: "540.02.011", adSoyad: "Derya Ak", email: "derya@cankayaotoservis.com", telefon: "0535 118 62 34", yetki: "ODEME", durum: "AKTIF", sonGiris: "2026-10-05T10:02:00+03:00" }
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
    durum: "YAYINDA"
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
    durum: "YAYINDA"
  },
  {
    duyuruId: "D-003",
    baslik: "Yeni Vade Profili",
    icerik: "Profil 4 özel anlaşma oranları güncellenmiştir.",
    hedef: [
      "BAYI"
    ],
    tarih: "2026-09-20",
    durum: "ARSIV"
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


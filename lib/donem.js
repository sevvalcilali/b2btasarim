// Rapor dönemleri: hazır seçenekler (son 7/30/90 gün, bu ay, geçen ay) ve özel tarih aralığı.
// Sunucuya her zaman ?baslangic=YYYY-AA-GG&bitis=YYYY-AA-GG gider (ikisi de dahil); önceki dönemi sunucu aynı uzunlukta hesaplar.

export const DONEM_SECENEKLERI = [
  ["7g", "Son 7 gün"],
  ["30g", "Son 30 gün"],
  ["90g", "Son 90 gün"],
  ["buAy", "Bu ay"],
  ["gecenAy", "Geçen ay"],
];

/** Yerel tarih → "YYYY-AA-GG" */
export const gunMetni = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** @returns {{ kod: string, baslangic: string, bitis: string }} */
export function donemAraligi(kod, bugun = new Date()) {
  const b = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  const gunOnce = (n) => new Date(b.getFullYear(), b.getMonth(), b.getDate() - n);
  switch (kod) {
    case "7g":
      return { kod, baslangic: gunMetni(gunOnce(6)), bitis: gunMetni(b) };
    case "90g":
      return { kod, baslangic: gunMetni(gunOnce(89)), bitis: gunMetni(b) };
    case "buAy":
      return { kod, baslangic: gunMetni(new Date(b.getFullYear(), b.getMonth(), 1)), bitis: gunMetni(b) };
    case "gecenAy":
      return { kod, baslangic: gunMetni(new Date(b.getFullYear(), b.getMonth() - 1, 1)), bitis: gunMetni(new Date(b.getFullYear(), b.getMonth(), 0)) };
    default:
      return { kod: "30g", baslangic: gunMetni(gunOnce(29)), bitis: gunMetni(b) };
  }
}

/** Özel aralık; sıra tersse düzeltilir */
export const ozelAralik = (baslangic, bitis) => (baslangic <= bitis ? { kod: "ozel", baslangic, bitis } : { kod: "ozel", baslangic: bitis, bitis: baslangic });

/** Sorgu parametreleri (kod gönderilmez) */
export const aralikSorgusu = (a) => (a ? { baslangic: a.baslangic, bitis: a.bitis } : {});

/** "08.10.2026" kısa gün */
export const gunKisaMetni = (iso) => iso.split("-").reverse().join(".");

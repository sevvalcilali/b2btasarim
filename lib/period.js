// Rapor dönemleri: hazır seçenekler (son 7/30/90 gün, bu ay, geçen ay) ve özel tarih aralığı.
// Sunucuya her zaman ?baslangic=YYYY-AA-GG&bitis=YYYY-AA-GG gider (ikisi de dahil); önceki dönemi sunucu aynı uzunlukta hesaplar.

export const PERIOD_OPTIONS = [
  ["7g", "Son 7 gün"],
  ["30g", "Son 30 gün"],
  ["90g", "Son 90 gün"],
  ["buAy", "Bu ay"],
  ["gecenAy", "Geçen ay"],
];

/** Yerel tarih → "YYYY-AA-GG" */
export const dayText = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** @returns {{ kod: string, baslangic: string, bitis: string }} */
export function periodRange(code, today = new Date()) {
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysAgo = (n) => new Date(b.getFullYear(), b.getMonth(), b.getDate() - n);
  switch (code) {
    case "7g":
      return { kod: code, baslangic: dayText(daysAgo(6)), bitis: dayText(b) };
    case "90g":
      return { kod: code, baslangic: dayText(daysAgo(89)), bitis: dayText(b) };
    case "buAy":
      return { kod: code, baslangic: dayText(new Date(b.getFullYear(), b.getMonth(), 1)), bitis: dayText(b) };
    case "gecenAy":
      return { kod: code, baslangic: dayText(new Date(b.getFullYear(), b.getMonth() - 1, 1)), bitis: dayText(new Date(b.getFullYear(), b.getMonth(), 0)) };
    default:
      return { kod: "30g", baslangic: dayText(daysAgo(29)), bitis: dayText(b) };
  }
}

/** Özel aralık; sıra tersse düzeltilir */
export const customRange = (start, end) => (start <= end ? { kod: "ozel", baslangic: start, bitis: end } : { kod: "ozel", baslangic: end, bitis: start });

/** Sorgu parametreleri (kod gönderilmez) */
export const rangeQuery = (a) => (a ? { baslangic: a.baslangic, bitis: a.bitis } : {});

/** "08.10.2026" kısa gün */
export const shortDayText = (iso) => iso.split("-").reverse().join(".");

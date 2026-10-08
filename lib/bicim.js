// Ekranda biçimlendirme. API ham veri döner (kuruş, ISO tarih); gösterim biçimi yalnızca burada belirlenir.

/** 1240000 → "₺ 12.400" · kurusGoster: true → "₺ 12.400,00" */
export function tl(kurus, { kurusGoster = false, isaret = true } = {}) {
  if (kurus === null || kurus === undefined) return "—";
  const n = kurus / 100;
  const s = n.toLocaleString("tr-TR", kurusGoster ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 });
  return isaret ? `₺ ${s}` : s;
}

/** 1240000 → "₺ 12.400,00" */
export const tl2 = (kurus) => tl(kurus, { kurusGoster: true });

/** 3740000000 → "₺ 37,40M" · 82600000 → "₺ 826K" (grafik eksenleri, kısa özetler) */
export function tlKisa(kurus) {
  const n = kurus / 100;
  if (Math.abs(n) >= 1e6) return `₺ ${(n / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}M`;
  if (Math.abs(n) >= 1e3) return `₺ ${Math.round(n / 1e3).toLocaleString("tr-TR")}K`;
  return tl(kurus);
}

/** "12.400,50" (kullanıcı girişi) → 1240050 kuruş; boş / geçersiz → NaN */
export function kurusCoz(metin) {
  const t = String(metin ?? "").replace(/[₺\s.]/g, "").replace(",", ".");
  if (t === "") return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

const gunAy = (d) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
const saat = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** "2026-09-30T14:22:00+03:00" | "2026-09-30" → "30.09.2026" */
export function tarih(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : gunAy(d);
}

/** "2026-09-30T14:22:00+03:00" → "30.09.2026 14:22" */
export function tarihSaat(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : `${gunAy(d)} ${saat(d)}`;
}

/** 91.9 → "%91,9" */
export const yuzde = (n, basamak = 1) => `%${Number(n).toLocaleString("tr-TR", { maximumFractionDigits: basamak })}`;

/** 1284 → "1.284" */
export const sayi = (n) => Number(n ?? 0).toLocaleString("tr-TR");

/** 1 → "Tek çekim" · 6 → "6 taksit" */
export const taksitMetni = (n) => (n === 1 ? "Tek çekim" : `${n} taksit`);

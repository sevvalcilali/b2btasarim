// Ekranda biçimlendirme. API ham veri döner (kuruş, ISO tarih); gösterim biçimi yalnızca burada belirlenir.

/** 1240000 → "₺ 12.400" · kurusGoster: true → "₺ 12.400,00" */
export function tl(cents, { showCents = false, sign = true } = {}) {
  if (cents === null || cents === undefined) return "—";
  const n = cents / 100;
  const s = n.toLocaleString("tr-TR", showCents ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 });
  return sign ? `₺ ${s}` : s;
}

/** 1240000 → "₺ 12.400,00" */
export const tl2 = (cents) => tl(cents, { showCents: true });

/** 3740000000 → "₺ 37,40M" · 82600000 → "₺ 826K" (grafik eksenleri, kısa özetler) */
export function tlShort(cents) {
  const n = cents / 100;
  if (Math.abs(n) >= 1e6) return `₺ ${(n / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}M`;
  if (Math.abs(n) >= 1e3) return `₺ ${Math.round(n / 1e3).toLocaleString("tr-TR")}K`;
  return tl(cents);
}

/** "12.400,50" (kullanıcı girişi) → 1240050 kuruş; boş / geçersiz → NaN */
export function parseCents(text) {
  const t = String(text ?? "").replace(/[₺\s.]/g, "").replace(",", ".");
  if (t === "") return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

/** Yazarken biçimle: "12500,5" → "12.500,5" (en çok 2 ondalık); kurusCoz ile geri çözülür */
export function formatMoneyText(text) {
  const clean = String(text ?? "").replace(/[^\d,]/g, "");
  const [full, ...remaining] = clean.split(",");
  const integer = full.replace(/^0+(?=\d)/, "");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return remaining.length ? `${grouped},${remaining.join("").slice(0, 2)}` : grouped;
}

const dayMonth = (d) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
const time = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** "2026-09-30T14:22:00+03:00" | "2026-09-30" → "30.09.2026" */
export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dayMonth(d);
}

/** "2026-09-30T14:22:00+03:00" → "30.09.2026 14:22" */
export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : `${dayMonth(d)} ${time(d)}`;
}

/** "2026-09-30" → "Sal" */
export const shortDay = (iso) => ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][new Date(iso).getDay()] || "";

/** 91.9 → "%91,9" */
export const formatPercent = (n, digit = 1) => `%${Number(n).toLocaleString("tr-TR", { maximumFractionDigits: digit })}`;

/** 1284 → "1.284" */
export const formatNumber = (n) => Number(n ?? 0).toLocaleString("tr-TR");

/** 1 → "Tek çekim" · 6 → "6 taksit" */
export const installmentText = (n) => (n === 1 ? "Tek çekim" : `${n} taksit`);

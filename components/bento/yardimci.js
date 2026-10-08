// Küçük yardımcılar: tutar ve tarih biçimleri, sayaç animasyonu, eğri yolu, durum renkleri.

import { useEffect, useState } from "react";

export function pillTone(durum) {
  if (durum === "Başarılı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Başarısız") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  return "bg-[var(--warning-soft)] text-[var(--warning-text)]"; // İptal / İade
}

// "₺ 4.284.900" → 4284900
export function parseAmount(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

// Değerleri w×h alana (min–max aralığına) yayıp yumuşak bir eğri yolu üretir.
export function smoothPath(values, w, h, pad) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  return curveThrough(values.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)]));
}

// [x, y] noktalarından geçen yumuşak (yatay teğetli) bir eğri yolu üretir.
export function curveThrough(pts) {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const cx = ((px + x) / 2).toFixed(1);
    d += ` C ${cx} ${py.toFixed(1)}, ${cx} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

// Sayıyı 0'dan hedefe doğru sayarak getirir (hareket azaltma açıksa doğrudan hedef).
function useCountUp(target) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    let raf;
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setVal(target);
        return undefined;
      }
    } catch (e) {
      setVal(target);
      return undefined;
    }
    const start = performance.now();
    const dur = 900;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setVal(0);
    raf = requestAnimationFrame(tick);
    // güvenlik: animasyon karesi gelmese bile (ör. arka plandaki sekme) rakam gerçek değere oturur
    const done = setTimeout(() => setVal(target), dur + 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [target]);
  return val;
}

export function Money({ value }) {
  const v = useCountUp(parseAmount(value));
  return <>₺ {v.toLocaleString("tr-TR")}</>;
}

export function useDismiss(open, close) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);
}

export function TrendArrow({ up }) {
  return (
    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      {up ? <path d="M5 1.5 9 8H1z" /> : <path d="M5 8.5 1 2h8z" />}
    </svg>
  );
}

// "12.400,50" → 12400.5 (boş ya da geçersizse NaN)
export function tutarCoz(metin) {
  const t = metin.replace(/[₺\s.]/g, "").replace(",", ".");
  return t === "" ? NaN : Number(t);
}

export const tl2 = (n) => `₺ ${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const rakamlar = (x) => x.replace(/\D/g, "");

// Date → "07.10.2026 16:20"
export function tarihSaat(d) {
  const iki = (n) => String(n).padStart(2, "0");
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} ${iki(d.getHours())}:${iki(d.getMinutes())}`;
}

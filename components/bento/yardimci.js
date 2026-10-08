// Küçük ekran yardımcıları: sayaç animasyonu, eğri yolu, trend oku, kapatma kısayolu, gecikmeli değer.
// Biçimlendirme (kuruş → ₺, ISO → tarih) lib/bicim.js'te; etiketler lib/etiketler.js'te.

import { useEffect, useState } from "react";

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

/** Kuruş tutarını sayarak gösterir: ₺ 12.400 */
export function Money({ kurus }) {
  const v = useCountUp(Math.round((kurus || 0) / 100));
  return <>₺ {v.toLocaleString("tr-TR")}</>;
}

// Değeri `ms` boyunca değişmeyince döner: arama kutusu her tuşta değil, yazma durunca istek atar.
export function useGecikmeli(deger, ms = 300) {
  const [gecikmeli, setGecikmeli] = useState(deger);
  useEffect(() => {
    if (deger === "") {
      setGecikmeli(""); // temizleme beklemez: eski arama bir an bile gönderilmez
      return undefined;
    }
    const z = setTimeout(() => setGecikmeli(deger), ms);
    return () => clearTimeout(z);
  }, [deger, ms]);
  return deger === "" ? "" : gecikmeli;
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

export const rakamlar = (x) => String(x ?? "").replace(/\D/g, "");

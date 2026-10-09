// Küçük ekran yardımcıları: sayaç animasyonu, eğri yolu, trend oku, kapatma kısayolu, gecikmeli değer.
// Biçimlendirme (kuruş → ₺, ISO → tarih) lib/format.js'te; etiketler lib/labels.js'te.

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
export function useCountUp(target, stop = 900) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    let rafId;
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
    const tick = (now) => {
      const p = Math.min((now - start) / stop, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    setVal(0);
    rafId = requestAnimationFrame(tick);
    // güvenlik: animasyon karesi gelmese bile (ör. arka plandaki sekme) rakam gerçek değere oturur
    const done = setTimeout(() => setVal(target), stop + 150);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(done);
    };
  }, [target, stop]);
  return val;
}

/** Kuruş tutarını sayarak gösterir: ₺ 12.400 */
export function Money({ cents }) {
  const v = useCountUp(Math.round((cents || 0) / 100));
  return <>₺ {v.toLocaleString("tr-TR")}</>;
}

// Değeri `ms` boyunca değişmeyince döner: arama kutusu her tuşta değil, yazma durunca istek atar.
export function useDebounced(value, ms = 300) {
  const [delayed, setDelayed] = useState(value);
  useEffect(() => {
    if (value === "") {
      setDelayed(""); // temizleme beklemez: eski arama bir an bile gönderilmez
      return undefined;
    }
    const z = setTimeout(() => setDelayed(value), ms);
    return () => clearTimeout(z);
  }, [value, ms]);
  return value === "" ? "" : delayed;
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

export const figures = (x) => String(x ?? "").replace(/\D/g, "");

/** Telefon genişliği (md altı, tablo kartlarıyla aynı eşik). Sunucuda ve ilk çizimde false döner. */
export function useIsMobile(query = "(max-width: 767px)") {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia(query);
    } catch (e) {
      return undefined;
    }
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return mobile;
}

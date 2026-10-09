// Tablo yardımcıları: sütun başlığından sıralama (yüklü satırlar üzerinde) ve satır sonu "⋯" eylem menüsü.
// Sayfalı listeler (İşlem Detayları) sıralamayı sunucuya `sira=alan:yon` ile iletir; diğerleri burada sıralar.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import I from "@/components/DesignIcons";
import { FOCUS, GHOST, MENU_ITEM } from "./theme";
import { useDismiss } from "./helpers";

/** null/undefined sona; sayılar sayısal, metinler Türkçe karşılaştırma */
export function karsilastir(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "tr", { numeric: true, sensitivity: "base" });
}

/** Aynı sütuna tekrar tıklayınca yön değişir */
export const siralamaDegistir = (s, alan, ilkYon = "asc") => (s?.alan === alan ? { alan, yon: s.yon === "asc" ? "desc" : "asc" } : { alan, yon: ilkYon });

/**
 * Yüklü satırları ekranda sıralar.
 * @param {any[]} kayitlar
 * @param {Record<string,(k:any)=>any>} alicilar  sütun → değer (bileşen dışında sabit tanımlanmalı)
 * @param {{alan:string, yon:"asc"|"desc"}|null} [varsayilan]
 */
export function useSiralama(kayitlar, alicilar, varsayilan = null) {
  const [siralama, setSiralama] = useState(varsayilan);
  const sirali = useMemo(() => {
    const al = siralama && alicilar[siralama.alan];
    if (!al) return kayitlar;
    const yon = siralama.yon === "asc" ? 1 : -1;
    return [...kayitlar].sort((a, b) => karsilastir(al(a), al(b)) * yon);
  }, [kayitlar, siralama, alicilar]);
  return { sirali, siralama, sirala: (alan) => setSiralama((s) => siralamaDegistir(s, alan, alicilar[alan]?.ilkYon)) };
}

/** Sıralanabilir sütun başlığı; className mevcut th sınıfını alır (hizalama dahil) */
export function SiraliBaslik({ alan, siralama, onSirala, className = "", children }) {
  const aktif = siralama?.alan === alan;
  const yukari = aktif && siralama.yon === "asc";
  return (
    <th scope="col" aria-sort={aktif ? (yukari ? "ascending" : "descending") : "none"} className={className}>
      <button
        type="button"
        onClick={() => onSirala(alan)}
        title={aktif ? (yukari ? "Azalan sırala" : "Artan sırala") : "Sırala"}
        className={`bn-yazdir-koru group inline-flex items-center gap-1 rounded uppercase tracking-wider transition-colors hover:text-[var(--brand-text)] ${aktif ? "text-[var(--brand-text)]" : ""} ${className.includes("text-right") ? "flex-row-reverse" : ""} ${FOCUS}`}
      >
        {children}
        <I name="chevronDown" size={11} className={`transition-transform ${aktif ? (yukari ? "rotate-180" : "") : "opacity-30 group-hover:opacity-70"}`} />
      </button>
    </th>
  );
}

/**
 * Satır sonu eylem menüsü. ogeler: [{ etiket, ikon?, onClick, tonu?: "danger", disabled? }] — null/false öğeler atlanır.
 * Menü gövdeye taşınır (portal) ki tablo kaydırma alanı kırpmasın.
 */
export function EylemMenusu({ etiket = "İşlemler", ogeler }) {
  const [acik, setAcik] = useState(false);
  const [konum, setKonum] = useState(null);
  useDismiss(acik, () => setAcik(false));
  useEffect(() => {
    if (!acik) return undefined;
    const kapat = () => setAcik(false);
    window.addEventListener("scroll", kapat, true);
    window.addEventListener("resize", kapat);
    return () => {
      window.removeEventListener("scroll", kapat, true);
      window.removeEventListener("resize", kapat);
    };
  }, [acik]);
  const root = typeof document !== "undefined" ? document.getElementById("bn-root") : null;
  const ac = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setKonum({ top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) });
    setAcik((a) => !a);
  };
  return (
    <>
      <button type="button" onClick={ac} aria-haspopup="menu" aria-expanded={acik} aria-label={etiket} title={etiket} className={GHOST}>
        <I name="more" size={16} />
      </button>
      {acik &&
        root &&
        createPortal(
          <>
            <div className="fixed inset-0 z-30" onClick={() => setAcik(false)} aria-hidden="true" />
            <div role="menu" aria-label={etiket} style={{ top: konum.top, right: konum.right }} className="bn-pop fixed z-40 w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 [box-shadow:var(--pop-shadow)]">
              {ogeler.filter(Boolean).map((o) => (
                <button
                  key={o.etiket}
                  type="button"
                  role="menuitem"
                  disabled={o.disabled}
                  onClick={() => {
                    setAcik(false);
                    o.onClick();
                  }}
                  className={`${MENU_ITEM} ${o.tonu === "danger" ? "text-[var(--danger-text)] hover:text-[var(--danger-text)]" : ""} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {o.ikon && <I name={o.ikon} size={14} />}
                  {o.etiket}
                </button>
              ))}
            </div>
          </>,
          root
        )}
    </>
  );
}

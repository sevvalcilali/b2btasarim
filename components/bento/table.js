// Tablo yardımcıları: sütun başlığından sıralama (yüklü satırlar üzerinde) ve satır sonu "⋯" eylem menüsü.
// Sayfalı listeler (İşlem Detayları) sıralamayı sunucuya `sira=field:yon` ile iletir; diğerleri burada sıralar.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import I from "@/components/DesignIcons";
import { FOCUS, GHOST, MENU_ITEM } from "./theme";
import { useDismiss } from "./helpers";

/** null/undefined sona; sayılar sayısal, metinler Türkçe karşılaştırma */
export function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "tr", { numeric: true, sensitivity: "base" });
}

/** Aynı sütuna tekrar tıklayınca yön değişir */
export const changeSorting = (s, field, initialDirection = "asc") => (s?.field === field ? { field: field, direction: s.direction === "asc" ? "desc" : "asc" } : { field: field, direction: initialDirection });

/**
 * Yüklü satırları ekranda sıralar.
 * @param {any[]} kayitlar
 * @param {Record<string,(k:any)=>any>} alicilar  sütun → değer (bileşen dışında sabit tanımlanmalı)
 * @param {{field:string, direction:"asc"|"desc"}|null} [varsayilan]
 */
export function useSorting(records, recipients, defaultValue = null) {
  const [sorting, setSorting] = useState(defaultValue);
  const sorted = useMemo(() => {
    const al = sorting && recipients[sorting.field];
    if (!al) return records;
    const direction = sorting.direction === "asc" ? 1 : -1;
    return [...records].sort((a, b) => compare(al(a), al(b)) * direction);
  }, [records, sorting, recipients]);
  return { sorted, sorting, sort: (field) => setSorting((s) => changeSorting(s, field, recipients[field]?.initialDirection)) };
}

/** Sıralanabilir sütun başlığı; className mevcut th sınıfını alır (hizalama dahil) */
export function SortableHeader({ field, sorting, onSort, className = "", children }) {
  const active = sorting?.field === field;
  const up = active && sorting.direction === "asc";
  return (
    <th scope="col" aria-sort={active ? (up ? "ascending" : "descending") : "none"} className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        title={active ? (up ? "Azalan sırala" : "Artan sırala") : "Sırala"}
        className={`bn-yazdir-koru group inline-flex items-center gap-1 rounded uppercase tracking-wider transition-colors hover:text-[var(--brand-text)] ${active ? "text-[var(--brand-text)]" : ""} ${className.includes("text-right") ? "flex-row-reverse" : ""} ${FOCUS}`}
      >
        {children}
        <I name="chevronDown" size={11} className={`transition-transform ${active ? (up ? "rotate-180" : "") : "opacity-30 group-hover:opacity-70"}`} />
      </button>
    </th>
  );
}

/**
 * Satır sonu eylem menüsü. ogeler: [{ etiket, ikon?, onClick, tonu?: "danger", disabled? }] — null/false öğeler atlanır.
 * Menü gövdeye taşınır (portal) ki tablo kaydırma alanı kırpmasın.
 */
export function ActionMenu({ label = "İşlemler", items }) {
  const [open, setOpen] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState(null);
  useDismiss(open, () => setOpen(false));
  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);
  const root = typeof document !== "undefined" ? document.getElementById("bn-root") : null;
  const ac = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setBreadcrumb({ top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) });
    setOpen((a) => !a);
  };
  return (
    <>
      <button type="button" onClick={ac} aria-haspopup="menu" aria-expanded={open} aria-label={label} title={label} className={GHOST}>
        <I name="more" size={16} />
      </button>
      {open &&
        root &&
        createPortal(
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
            <div role="menu" aria-label={label} style={{ top: breadcrumb.top, right: breadcrumb.right }} className="bn-pop fixed z-40 w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 [box-shadow:var(--pop-shadow)]">
              {items.filter(Boolean).map((o) => (
                <button
                  key={o.etiket}
                  type="button"
                  role="menuitem"
                  disabled={o.disabled}
                  onClick={() => {
                    setOpen(false);
                    o.onClick();
                  }}
                  className={`${MENU_ITEM} ${o.tone === "danger" ? "text-[var(--danger-text)] hover:text-[var(--danger-text)]" : ""} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {o.icon && <I name={o.icon} size={14} />}
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

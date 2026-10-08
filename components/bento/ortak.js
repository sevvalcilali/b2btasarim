// Ekranların ortak parçaları: konum satırı, pencere, bildirim, form alanları, müşteri seçici, kopyala düğmesi.

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import I from "@/components/DesignIcons";
import { CARD, FOCUS } from "./tema";

// Ortak pencere (modal): büyütülmüş grafik, iptal/iade talebi, red gerekçesi. Temanın renk değişkenleri için
// sayfanın kök öğesine (#bn-root) taşınır; kart üzerine gelince oluşan transform da sabit konumu bozmaz.
export function Pencere({ baslik, altBaslik, onClose, genislik = "max-w-5xl", children }) {
  const closeRef = useRef(null);
  const baslikId = `bn-pencere-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const root = typeof document !== "undefined" ? document.getElementById("bn-root") : null;
  if (!root) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="bn-fade absolute inset-0 bg-[rgba(15,18,40,0.55)] backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={baslikId}
        className={`bn-pop relative max-h-[calc(100vh-24px)] w-full overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 [box-shadow:var(--pop-shadow)] sm:p-6 ${genislik}`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id={baslikId} className="text-base font-bold text-[var(--fg)] sm:text-lg">
              {baslik}
            </h2>
            {altBaslik && <p className="mt-0.5 text-xs text-[var(--muted)]">{altBaslik}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            title="Kapat (Esc)"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--soft)] text-[var(--fg-2)] ring-1 ring-[var(--border)] transition hover:text-[var(--brand-text)] ${FOCUS}`}
          >
            <I name="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    root
  );
}

// Sayfa başlığının üstündeki konum satırı: Ana Sayfa › grup › ekran
export function Konum({ onHome, yol }) {
  return (
    <nav aria-label="Konum" className="mb-1 flex items-center gap-1 text-[11.5px] font-medium text-[var(--muted)]">
      <button type="button" onClick={onHome} className={`rounded hover:text-[var(--brand-text)] ${FOCUS}`}>
        Ana Sayfa
      </button>
      {yol.map((y, i) => (
        <span key={y} className="contents">
          <I name="chevronRight" size={11} />
          {i === yol.length - 1 ? (
            <span aria-current="page" className="font-semibold text-[var(--fg-2)]">
              {y}
            </span>
          ) : (
            <span>{y}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function inputCls(hata) {
  return `h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] read-only:bg-[var(--soft)] read-only:text-[var(--fg-2)] ${
    hata ? "border-[var(--danger)]" : "border-[var(--border-strong)]"
  }`;
}

export function Alan({ id, etiket, hata, ipucu, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-[12px] font-semibold text-[var(--fg-2)]">
        {etiket}
      </label>
      {children}
      {hata ? (
        <p id={`${id}-hata`} className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
          {hata}
        </p>
      ) : ipucu ? (
        <p className="mt-1 text-[11.5px] text-[var(--muted)]">{ipucu}</p>
      ) : null}
    </div>
  );
}

export function FormBolum({ no, baslik, aciklama, i, children }) {
  return (
    <section style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby={`bn-bolum-${no}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[12px] font-extrabold text-white">{no}</span>
        <div>
          <h2 id={`bn-bolum-${no}`} className="text-sm font-bold text-[var(--fg)]">
            {baslik}
          </h2>
          {aciklama && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{aciklama}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

// Tanımlı müşteriyi unvan, cari no ya da vergi no ile arayıp seçtiren liste kutusu (combobox)
export function MusteriSecici({ id, secenekler, secili, onSec, hata }) {
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState("");
  const [aktif, setAktif] = useState(0);
  const kutuRef = useRef(null);
  const kucuk = (x) => x.toLocaleLowerCase("tr-TR");
  const liste = secenekler.filter((m) => !arama || [m.unvan, m.cari, m.vergiNo].some((f) => kucuk(f).includes(kucuk(arama))));

  useEffect(() => {
    if (!acik) return undefined;
    const disari = (e) => !kutuRef.current?.contains(e.target) && setAcik(false);
    document.addEventListener("mousedown", disari);
    return () => document.removeEventListener("mousedown", disari);
  }, [acik]);

  const sec = (m) => {
    onSec(m);
    setArama("");
    setAcik(false);
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcik(true);
      setAktif((a) => Math.min(a + 1, liste.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktif((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && acik && liste[aktif]) {
      e.preventDefault();
      sec(liste[aktif]);
    } else if (e.key === "Escape") {
      setAcik(false);
    }
  };

  return (
    <div ref={kutuRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={acik}
        aria-controls={`${id}-liste`}
        aria-autocomplete="list"
        aria-activedescendant={acik && liste[aktif] ? `${id}-sec-${aktif}` : undefined}
        aria-invalid={hata ? true : undefined}
        aria-describedby={hata ? `${id}-hata` : undefined}
        value={acik || !secili ? arama : `${secili.unvan} — ${secili.cari}`}
        placeholder="Unvan, cari no ya da vergi no ile arayın"
        onFocus={() => {
          setAcik(true);
          setAktif(0);
        }}
        onChange={(e) => {
          setArama(e.target.value);
          setAktif(0);
          setAcik(true);
        }}
        onKeyDown={onKey}
        className={`${inputCls(hata)} pr-9`}
      />
      <I name="chevronDown" size={15} className="pointer-events-none absolute right-3 top-[13px] text-[var(--muted)]" />
      {acik && (
        <ul
          id={`${id}-liste`}
          role="listbox"
          className="bn-pop absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 [box-shadow:var(--pop-shadow)]"
        >
          {liste.length === 0 ? (
            <li className="px-3 py-2 text-[12.5px] text-[var(--muted)]">Eşleşen kayıt yok</li>
          ) : (
            liste.map((m, i) => (
              <li
                key={m.cari}
                id={`${id}-sec-${i}`}
                role="option"
                aria-selected={secili?.cari === m.cari}
                onMouseDown={(e) => {
                  e.preventDefault();
                  sec(m);
                }}
                onMouseEnter={() => setAktif(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 ${i === aktif ? "bg-[var(--soft)]" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[var(--fg)]">{m.unvan}</span>
                  <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                    {m.cari} · VKN {m.vergiNo}
                  </span>
                </span>
                {secili?.cari === m.cari && <I name="check" size={15} className="shrink-0 text-[var(--brand-text)]" />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function KopyalaDugmesi({ metin, kucuk = false }) {
  const [durum, setDurum] = useState(null); // null | "tamam" | "hata"
  const zaman = useRef(null);
  useEffect(() => () => clearTimeout(zaman.current), []);
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(metin);
      setDurum("tamam");
    } catch (e) {
      setDurum("hata");
    }
    clearTimeout(zaman.current);
    zaman.current = setTimeout(() => setDurum(null), 1600);
  };
  const etiket = durum === "tamam" ? "Kopyalandı" : durum === "hata" ? "Kopyalanamadı" : "Kopyala";
  return (
    <button
      type="button"
      onClick={kopyala}
      aria-live="polite"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold transition ${
        kucuk ? "h-7 px-2.5 text-[11.5px]" : "h-10 px-4 text-[12.5px]"
      } ${durum === "tamam" ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--soft)] text-[var(--brand-text)] hover:bg-[var(--soft-2)]"} ${FOCUS}`}
    >
      <I name={durum === "tamam" ? "check" : "link"} size={kucuk ? 12 : 14} />
      {etiket}
    </button>
  );
}

// Ekranın altında beliren kısa bilgi (toast)
export function Bildirim({ metin, onBitti }) {
  useEffect(() => {
    const z = setTimeout(onBitti, 3500);
    return () => clearTimeout(z);
  }, [metin, onBitti]);
  const root = typeof document !== "undefined" ? document.getElementById("bn-root") : null;
  if (!root) return null;
  return createPortal(
    <div role="status" className="bn-pop fixed inset-x-3 bottom-4 z-50 mx-auto flex max-w-md items-start gap-2.5 rounded-2xl bg-[var(--fg)] px-4 py-3 text-[12.5px] font-semibold text-[var(--bg)] [box-shadow:var(--pop-shadow)]">
      <I name="check" size={16} className="mt-px shrink-0" />
      {metin}
    </div>,
    root
  );
}

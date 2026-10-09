// Ekranların ortak parçaları: konum satırı, pencere, bildirim, form alanları, müşteri seçici, kopyala düğmesi.

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import I from "@/components/DesignIcons";
import { formatDateTime, formatPercent } from "@/lib/format";
import { PERIOD_OPTIONS, periodRange, shortDayText, customRange } from "@/lib/period";
import { TrendArrow } from "./helpers";
import { CARD, FOCUS } from "./theme";

// Ortak pencere (modal): büyütülmüş grafik, iptal/iade talebi, red gerekçesi. Temanın renk değişkenleri için
// sayfanın kök öğesine (#bn-root) taşınır; kart üzerine gelince oluşan transform da sabit konumu bozmaz.
export function Modal({ title, subtitle, onClose, width = "max-w-5xl", children }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // Esc her zaman güncel kapatıcıyı çağırır (içerik değişen pencereler)
  const titleId = `bn-pencere-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
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
        aria-labelledby={titleId}
        className={`bn-pop relative max-h-[calc(100vh-24px)] w-full overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 [box-shadow:var(--pop-shadow)] sm:p-6 ${width}`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-base font-bold text-[var(--fg)] sm:text-lg">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>}
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

// Sağdan açılan detay paneli (çekmece): liste satırının ayrıntısı, listeden ayrılmadan. Pencere ile aynı erişilebilirlik.
export function Drawer({ title, subtitle, onClose, width = "max-w-xl", bottomBar, children }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = `bn-panel-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="bn-fade absolute inset-0 bg-[rgba(15,18,40,0.45)] backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-labelledby={titleId} className={`bn-slide relative flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--surface)] [box-shadow:var(--pop-shadow)] ${width}`}>
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-bold text-[var(--fg)]">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Kapat" title="Kapat (Esc)" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--soft)] text-[var(--fg-2)] ring-1 ring-[var(--border)] transition hover:text-[var(--brand-text)] ${FOCUS}`}>
            <I name="x" size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {bottomBar && <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:justify-end">{bottomBar}</div>}
      </aside>
    </div>,
    root
  );
}

// Rapor dönemi seçici: hazır seçenekler + özel aralık. deger: { kod, baslangic, bitis } ya da null (tumu açıkken "Tümü")
export function DateRange({ value, onChange, all = false }) {
  const [custom, setCustom] = useState(value?.kod === "ozel");
  const code = value ? (custom ? "ozel" : value.kod) : "tumu";
  const cls = (selected) => `inline-flex h-8 items-center rounded-full px-3 text-[12px] transition ${selected ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`;
  const input = "h-8 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[12px] tabular-nums text-[var(--fg)] outline-none focus:border-[var(--brand)]";
  return (
    <div className="flex flex-wrap items-center gap-1">
      <div role="group" aria-label="Dönem" className="flex flex-wrap gap-1">
        {all && (
          <button type="button" aria-pressed={code === "tumu"} onClick={() => { setCustom(false); onChange(null); }} className={cls(code === "tumu")}>
            Tümü
          </button>
        )}
        {PERIOD_OPTIONS.map(([k, name]) => (
          <button key={k} type="button" aria-pressed={code === k} onClick={() => { setCustom(false); onChange(periodRange(k)); }} className={cls(code === k)}>
            {name}
          </button>
        ))}
        <button type="button" aria-pressed={code === "ozel"} onClick={() => { setCustom(true); if (!value) onChange(periodRange("30g")); }} className={cls(code === "ozel")}>
          Özel
        </button>
      </div>
      {custom && value && (
        <div className="flex items-center gap-1 text-[12px] text-[var(--muted)]">
          <label className="sr-only" htmlFor="bn-aralik-bas">Başlangıç</label>
          <input id="bn-aralik-bas" type="date" value={value.baslangic} max={value.bitis} onChange={(e) => e.target.value && onChange(customRange(e.target.value, value.bitis))} className={input} />
          <span aria-hidden="true">–</span>
          <label className="sr-only" htmlFor="bn-aralik-bit">Bitiş</label>
          <input id="bn-aralik-bit" type="date" value={value.bitis} min={value.baslangic} onChange={(e) => e.target.value && onChange(customRange(value.baslangic, e.target.value))} className={input} />
        </div>
      )}
      {value && !custom && (
        <span className="ml-1 text-[11.5px] tabular-nums text-[var(--muted)]">
          {shortDayText(value.baslangic)} – {shortDayText(value.bitis)}
        </span>
      )}
    </div>
  );
}

// Yazdır düğmesi: tarayıcının yazdırma / PDF kaydetme penceresi; kabuk ve düğmeler print CSS ile gizlenir
export function PrintButton({ className = "" }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Yazdır ya da PDF olarak kaydet"
      className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] md:self-auto ${FOCUS} ${className}`}
    >
      <I name="printer" size={14} />
      Yazdır
    </button>
  );
}

// Önceki döneme göre değişim rozeti: ▲ %12 / ▼ %8; önceki 0 ise "yeni", tersi: düşüş iyidir (bekleyen fatura gibi)
export function ChangeBadge({ current, previous, reverse = false, dark = false }) {
  if (previous == null || current == null) return null;
  const s = Number(current);
  const o = Number(previous);
  if (!o && !s) return null;
  const increase = s >= o;
  const good = reverse ? !increase : increase;
  const color = dark ? "bg-white/20 text-white" : good ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-px text-[10.5px] font-bold tabular-nums ${color}`} title="Önceki döneme göre">
      {o ? (
        <>
          <TrendArrow up={increase} />
          {formatPercent(Math.abs(((s - o) / o) * 100), 0)}
        </>
      ) : (
        "yeni"
      )}
    </span>
  );
}

// Denetim izi notu: "Son değişiklik: Ad Soyad · 08.10.2026 14:12" (yoksa oluşturan; ikisi de yoksa görünmez)
export function AuditNote({ record, className = "" }) {
  const change = record?.sonDegisiklik;
  const d = change || record?.olusturma;
  if (!d) return null;
  return (
    <p className={`text-[11px] text-[var(--muted)] ${className}`}>
      {change ? "Son değişiklik" : "Oluşturan"}: <span className="font-semibold text-[var(--fg-2)]">{d.adSoyad}</span> · <span className="tabular-nums">{formatDateTime(d.tarih)}</span>
    </p>
  );
}

// Sayfa başlığının üstündeki konum satırı: Ana Sayfa › grup › ekran
export function Breadcrumb({ onHome, path }) {
  return (
    <nav aria-label="Konum" className="mb-1 flex items-center gap-1 text-[11.5px] font-medium text-[var(--muted)]">
      <button type="button" onClick={onHome} className={`rounded hover:text-[var(--brand-text)] ${FOCUS}`}>
        Ana Sayfa
      </button>
      {path.map((y, i) => (
        <span key={y} className="contents">
          <I name="chevronRight" size={11} />
          {i === path.length - 1 ? (
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

export function inputCls(error) {
  return `h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] read-only:bg-[var(--soft)] read-only:text-[var(--fg-2)] ${
    error ? "border-[var(--danger)]" : "border-[var(--border-strong)]"
  }`;
}

export function Field({ id, label, error, hint, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-[12px] font-semibold text-[var(--fg-2)]">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-hata`} className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11.5px] text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({ no, title, description, i, children }) {
  return (
    <section style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby={`bn-bolum-${no}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[12px] font-extrabold text-white">{no}</span>
        <div>
          <h2 id={`bn-bolum-${no}`} className="text-sm font-bold text-[var(--fg)]">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

// Tanımlı müşteriyi unvan, cari no ya da vergi no ile arayıp seçtiren liste kutusu (combobox)
export function CustomerPicker({ id, options, selected, onSelect, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const small = (x) => x.toLocaleLowerCase("tr-TR");
  const list = options.filter((m) => !search || [m.unvan, m.cariNo, m.vergiNo].some((f) => small(f).includes(small(search))));

  useEffect(() => {
    if (!open) return undefined;
    const outside = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  const select = (m) => {
    onSelect(m);
    setSearch("");
    setOpen(false);
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && list[active]) {
      e.preventDefault();
      select(list[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={`${id}-liste`}
        aria-autocomplete="list"
        aria-activedescendant={open && list[active] ? `${id}-sec-${active}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-hata` : undefined}
        value={open || !selected ? search : `${selected.unvan} — ${selected.cariNo}`}
        placeholder="Unvan, cari no ya da vergi no ile arayın"
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKey}
        className={`${inputCls(error)} pr-9`}
      />
      <I name="chevronDown" size={15} className="pointer-events-none absolute right-3 top-[13px] text-[var(--muted)]" />
      {open && (
        <ul
          id={`${id}-liste`}
          role="listbox"
          className="bn-pop absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 [box-shadow:var(--pop-shadow)]"
        >
          {list.length === 0 ? (
            <li className="px-3 py-2 text-[12.5px] text-[var(--muted)]">Eşleşen kayıt yok</li>
          ) : (
            list.map((m, i) => (
              <li
                key={m.cariNo}
                id={`${id}-sec-${i}`}
                role="option"
                aria-selected={selected?.cariNo === m.cariNo}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(m);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 ${i === active ? "bg-[var(--soft)]" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-[var(--fg)]">{m.unvan}</span>
                  <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                    {m.cariNo} · VKN {m.vergiNo}
                  </span>
                </span>
                {selected?.cariNo === m.cariNo && <I name="check" size={15} className="shrink-0 text-[var(--brand-text)]" />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function CopyButton({ text, small = false }) {
  const [status, setStatus] = useState(null); // null | "tamam" | "hata"
  const time = useRef(null);
  useEffect(() => () => clearTimeout(time.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("tamam");
    } catch (e) {
      setStatus("hata");
    }
    clearTimeout(time.current);
    time.current = setTimeout(() => setStatus(null), 1600);
  };
  const label = status === "tamam" ? "Kopyalandı" : status === "hata" ? "Kopyalanamadı" : "Kopyala";
  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold transition ${
        small ? "h-7 px-2.5 text-[11.5px]" : "h-10 px-4 text-[12.5px]"
      } ${status === "tamam" ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--soft)] text-[var(--brand-text)] hover:bg-[var(--soft-2)]"} ${FOCUS}`}
    >
      <I name={status === "tamam" ? "check" : "link"} size={small ? 12 : 14} />
      {label}
    </button>
  );
}

// Geri alınamayan ya da başkasını etkileyen işlem öncesi onay: arşivleme, pasife alma, talep onayı
export function ConfirmModal({ title, message, confirmLabel = "Onayla", tone = "brand", busy = false, onApprove, onClose }) {
  return (
    <Modal title={title} onClose={onClose} width="max-w-md">
      <p className="text-[13px] leading-relaxed text-[var(--fg-2)]">{message}</p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
          Vazgeç
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${tone === "danger" ? "bg-[var(--danger)]" : "bg-[var(--brand)]"} ${FOCUS}`}
        >
          {busy ? "İşleniyor…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// Ekranın altında beliren kısa bilgi (toast). eylem: { etiket, onClick } — "Geri al" gibi; varsa daha uzun kalır.
export function Notice({ text, onDone, action }) {
  const hasActions = !!action;
  useEffect(() => {
    const z = setTimeout(onDone, hasActions ? 7000 : 3500);
    return () => clearTimeout(z);
  }, [text, onDone, hasActions]);
  const root = typeof document !== "undefined" ? document.getElementById("bn-root") : null;
  if (!root) return null;
  return createPortal(
    <div role="status" className="bn-pop fixed inset-x-3 bottom-4 z-50 mx-auto flex max-w-md items-center gap-2.5 rounded-2xl bg-[var(--fg)] px-4 py-3 text-[12.5px] font-semibold text-[var(--bg)] [box-shadow:var(--pop-shadow)]">
      <I name="check" size={16} className="shrink-0" />
      <span className="flex-1">{text}</span>
      {action && (
        <button
          type="button"
          onClick={() => {
            onDone();
            action.onClick();
          }}
          className={`shrink-0 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold text-[var(--bg)] transition hover:bg-white/25 ${FOCUS}`}
        >
          {action.etiket}
        </button>
      )}
    </div>,
    root
  );
}

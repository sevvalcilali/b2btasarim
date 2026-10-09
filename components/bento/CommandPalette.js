// Komut paleti (⌘K / Ctrl+K, "/"): ekranlara geçiş, işlem ve bayi araması, hızlı eylemler tek kutudan.
// Veri: GET /islemler?q= (işlem no, unvan, cari, vergi no, kart son 4) · GET /bayiler?q= (alt bayi rolünde yok)
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import I from "@/components/DesignIcons";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import { labelOf, statusTone } from "@/lib/labels";
import { formatDateTime, tl } from "@/lib/format";
import { useTransactions } from "@/lib/queries/transactions";
import { useDealers } from "@/lib/queries/dealers";
import { isReady } from "./routes";
import { useDebounced } from "./helpers";
import { FOCUS } from "./theme";

const RECENT_KEY = "nkb-palette-recent";
const MIN_QUERY = 2;

/** Türkçe karakterleri sadeleştirir: "Ödeme" ↔ "odeme" eşleşir. Karakter sayısı korunur (vurgulama için). */
const fold = (s) =>
  String(s ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c]);

function Highlight({ text, query }) {
  const q = fold(query.trim());
  const at = q ? fold(text).indexOf(q) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-sm bg-[var(--brand-soft)] px-px text-[var(--brand-text)]">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

/** Menüdeki hazır ekranlar, grup adıyla düz liste */
function pagesFor(role) {
  const out = [];
  for (const n of getNav(role)) {
    if (n.items) n.items.forEach((s) => isReady(s.href) && out.push({ label: s.label, group: n.label, href: s.href, icon: n.icon }));
    else if (isReady(n.href)) out.push({ label: n.label, group: null, href: n.href, icon: n.icon });
  }
  return out;
}

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function pushRecent(href) {
  try {
    const next = [href, ...readRecent().filter((h) => h !== href)].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch (e) {}
}

export function CommandPalette({ role, isDark, onClose, onNavigate, onRole, onToggleTheme, onLogout }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const listId = `bn-palet-${useId().replace(/:/g, "")}`;

  const q = useDebounced(query.trim(), 200);
  const searching = q.length >= MIN_QUERY;
  const dealerKind = role === ROLES.BAYI ? "ALT_BAYI" : "BAYI";
  const transactions = useTransactions({ q, boyut: 5 }, { enabled: searching });
  const dealers = useDealers({ tur: dealerKind, q }, { enabled: searching && role !== ROLES.ALT_BAYI });
  const fetching = searching && (transactions.isFetching || dealers.isFetching);

  const pages = useMemo(() => pagesFor(role), [role]);
  const [recent, setRecent] = useState([]);
  useEffect(() => setRecent(readRecent()), []);

  // Gruplar: her öğe { id, kind, label, sub?, icon?, run, aside? }
  const groups = useMemo(() => {
    const fq = fold(query.trim());
    const goPage = (p) => () => {
      pushRecent(p.href);
      onNavigate(p.href);
    };
    const pageItem = (p) => ({ id: `p-${p.href}`, kind: "page", label: p.label, sub: p.group, icon: p.icon || "arrowRight", run: goPage(p) });

    const actions = [
      { id: "a-theme", label: isDark ? "Açık moda geç" : "Koyu moda geç", icon: isDark ? "sun" : "moon", run: onToggleTheme, keepOpen: true },
      ...ROLE_ORDER.filter((r) => r !== role).map((r) => ({ id: `a-role-${r}`, label: `Panel tipini değiştir: ${ROLE_META[r].label}`, icon: "user", run: () => onRole(r) })),
      { id: "a-logout", label: "Çıkış yap", icon: "logout", run: onLogout },
    ].map((a) => ({ ...a, kind: "action" }));

    if (!fq) {
      const recentPages = recent.map((h) => pages.find((p) => p.href === h)).filter(Boolean);
      const quick = ["/odeme/manuel", "/odeme/link", "/raporlar/islem-detaylari"].map((h) => pages.find((p) => p.href === h)).filter((p) => p && !recentPages.includes(p));
      return [
        recentPages.length && { title: "Son kullanılanlar", items: recentPages.map(pageItem) },
        quick.length && { title: "Hızlı geçiş", items: quick.map(pageItem) },
        { title: "Eylemler", items: actions },
      ].filter(Boolean);
    }

    const matches = (...xs) => xs.some((x) => fold(x).includes(fq));
    const out = [];
    const pageHits = pages.filter((p) => matches(p.label, p.group));
    if (pageHits.length) out.push({ title: "Ekranlar", items: pageHits.slice(0, 6).map(pageItem) });

    if (searching && transactions.data?.kayitlar?.length) {
      out.push({
        title: "İşlemler",
        items: transactions.data.kayitlar.map((t) => ({
          id: `t-${t.islemNo}`,
          kind: "transaction",
          label: `${t.islemNo} · ${t.musteri.unvan}`,
          sub: `${formatDateTime(t.tarih)} · **** ${t.kart.son4}`,
          icon: t.odemeTipi === "LINK" ? "link" : "wallet",
          aside: { amount: tl(t.tutarKurus), status: t.durum },
          run: () => onNavigate("/raporlar/islem-detaylari", { ara: t.islemNo }),
        })),
      });
    }

    if (searching && dealers.data?.kayitlar?.length) {
      out.push({
        title: role === ROLES.BAYI ? "Alt bayiler" : "Bayiler",
        items: dealers.data.kayitlar.slice(0, 5).map((b) => ({
          id: `d-${b.cariNo}`,
          kind: "dealer",
          label: b.unvan,
          sub: `${b.cariNo} · VKN ${b.vergiNo}${b.durum === "PASIF" ? " · Pasif" : ""}`,
          icon: "dealer",
          run: () => onNavigate("/bayi-tanim/liste", { detay: b.cariNo }),
          secondary: b.durum === "AKTIF" ? { label: "Ödeme Al", run: () => onNavigate("/odeme/manuel", { musteri: b.cariNo }) } : null,
        })),
      });
    }

    const actionHits = actions.filter((a) => matches(a.label));
    if (actionHits.length) out.push({ title: "Eylemler", items: actionHits });
    return out;
  }, [query, searching, transactions.data, dealers.data, pages, recent, role, isDark, onNavigate, onRole, onToggleTheme, onLogout]);

  const flat = groups.flatMap((g) => g.items);
  const current = Math.min(active, Math.max(flat.length - 1, 0));

  const choose = (item, which = "run") => {
    if (!item) return;
    const fn = which === "secondary" ? item.secondary?.run : item.run;
    if (!fn) return;
    if (!item.keepOpen) onCloseRef.current();
    fn();
  };

  useEffect(() => {
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // aktif satır görünür kalsın
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (flat.length ? (Math.min(a, flat.length - 1) + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (flat.length ? (Math.min(a, flat.length - 1) - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(flat[current], (e.metaKey || e.ctrlKey) && flat[current]?.secondary ? "secondary" : "run");
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // altta açık bir pencere varsa o kapanmasın
      onCloseRef.current();
    }
  };

  const root = typeof document !== "undefined" ? document.getElementById("bn-root") : null;
  if (!root) return null;

  const waitingForResults = searching && fetching && !transactions.data && !dealers.data;
  const pendingTyping = query.trim().length >= MIN_QUERY && query.trim() !== q;
  let index = -1;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[10vh] sm:pt-[14vh]">
      <div className="bn-fade absolute inset-0 bg-[rgba(15,18,40,0.5)] backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Komut paleti" className="bn-pop relative flex max-h-[72vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] [box-shadow:var(--pop-shadow)]">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4">
          <I name="search" size={17} className="shrink-0 text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat[current] ? `${listId}-${current}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
            placeholder={role === ROLES.ALT_BAYI ? "İşlem ara ya da ekran adı yazın…" : "İşlem, bayi ara ya da ekran adı yazın…"}
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[var(--fg)] outline-none placeholder:text-[var(--muted)]"
          />
          {(fetching || pendingTyping) && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--brand)] motion-reduce:animate-none" aria-hidden="true" />}
          <kbd className="hidden shrink-0 rounded-md border border-[var(--border-strong)] bg-[var(--soft)] px-1.5 py-0.5 text-[10.5px] font-bold text-[var(--muted)] sm:inline">Esc</kbd>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="Sonuçlar" onMouseDown={(e) => e.preventDefault()} className="flex-1 overflow-y-auto p-2">
          {groups.map((g) => (
            <div key={g.title} role="group" aria-label={g.title} className="mb-1 last:mb-0">
              <p className="px-2.5 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">{g.title}</p>
              {g.items.map((item) => {
                index += 1;
                const i = index;
                const isActive = i === current;
                return (
                  <div
                    key={item.id}
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => active !== i && setActive(i)}
                    onClick={() => choose(item)}
                    className={`group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${isActive ? "bg-[var(--soft)]" : ""}`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${isActive ? "bg-[var(--brand)] text-white" : "bg-[var(--soft)] text-[var(--fg-2)]"}`}>
                      <I name={item.icon} size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-[var(--fg)]">
                        <Highlight text={item.label} query={query} />
                      </span>
                      {item.sub && (
                        <span className="block truncate text-[11px] tabular-nums text-[var(--muted)]">
                          <Highlight text={item.sub} query={query} />
                        </span>
                      )}
                    </span>
                    {item.aside && (
                      <span className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="text-[12.5px] font-bold tabular-nums text-[var(--fg)]">{item.aside.amount}</span>
                        <span className={`rounded-full px-1.5 text-[10px] font-bold ${statusTone(item.aside.status)}`}>{labelOf("transactionStatus", item.aside.status)}</span>
                      </span>
                    )}
                    {item.secondary && (
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          choose(item, "secondary");
                        }}
                        title="Ctrl/⌘ + Enter"
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${isActive ? "bg-[var(--brand)] text-white" : "bg-[var(--soft)] text-[var(--brand-text)] opacity-0 group-hover:opacity-100"} ${FOCUS}`}
                      >
                        {item.secondary.label}
                      </button>
                    )}
                    {isActive && !item.secondary && <I name="enter" size={14} className="shrink-0 text-[var(--muted)]" />}
                  </div>
                );
              })}
            </div>
          ))}

          {flat.length === 0 && (
            <div className="px-4 py-10 text-center">
              {waitingForResults || pendingTyping ? (
                <p className="text-[12.5px] text-[var(--muted)]">Aranıyor…</p>
              ) : (
                <>
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--soft)] text-[var(--muted)]">
                    <I name="search" size={18} />
                  </span>
                  <p className="mt-2 text-[13px] font-semibold text-[var(--fg)]">“{query.trim()}” için sonuç yok</p>
                  <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">
                    {query.trim().length < MIN_QUERY ? "Kayıt aramak için en az 2 karakter yazın." : "İşlem no, unvan, cari no, vergi no ya da kart son 4 hanesiyle deneyin."}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-[var(--border)] bg-[var(--soft)] px-4 py-2 text-[11px] text-[var(--muted)] sm:flex">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> gezin
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> aç
          </span>
          {role !== ROLES.ALT_BAYI && (
            <span className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <Kbd>↵</Kbd> bayiden ödeme al
            </span>
          )}
          <span className="ml-auto flex items-center gap-1">
            <Kbd>Esc</Kbd> kapat
          </span>
        </div>
      </div>
    </div>,
    root
  );
}

function Kbd({ children }) {
  return <kbd className="inline-grid min-w-[18px] place-items-center rounded border border-[var(--border-strong)] bg-[var(--surface)] px-1 text-[10px] font-bold text-[var(--fg-2)]">{children}</kbd>;
}

/** Üst bardaki arama kutusu görünümlü düğme; kısayol ipucu işletim sistemine göre ⌘K / Ctrl K */
export function PaletteTrigger({ onOpen }) {
  const [mac, setMac] = useState(false);
  useEffect(() => {
    try {
      setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    } catch (e) {}
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Ara ve komut çalıştır"
        aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
        className={`group relative ml-1.5 hidden h-8 w-full max-w-[280px] items-center gap-2 rounded-full border border-transparent bg-[var(--soft)] pl-3 pr-1.5 text-left text-[12.5px] text-[var(--muted)] transition hover:border-[var(--border-strong)] md:flex ${FOCUS}`}
      >
        <I name="search" size={14} />
        <span className="flex-1 truncate">İşlem, cari veya ekran ara</span>
        <span className="flex items-center gap-0.5">
          <Kbd>{mac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <button type="button" onClick={onOpen} aria-label="Ara" title="Ara" className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--brand-text)] md:hidden ${FOCUS}`}>
        <I name="search" size={16} />
      </button>
    </>
  );
}

/** ⌘K / Ctrl+K her yerde açar-kapatır; "/" yazı alanı dışındayken açar */
export function usePaletteShortcut(setOpen) {
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target;
        const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
        if (!typing && !document.querySelector('[aria-modal="true"]')) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

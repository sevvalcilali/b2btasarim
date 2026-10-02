import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import I from "@/components/DesignIcons";
import { useRole } from "@/components/RoleContext";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import { kpis, islemler, bakiyeOzet, kurBilgisi, iptalIadeTalepleri, faturaYuklemeleri } from "@/lib/mockData";

// Tasarım 04 — Nova: beyaz zemin üzerinde mavi tonlu kartlar, yüzen ve daraltılabilir sol menü,
// karşılama bandı, mini grafikli KPI'lar, etkileşimli alan grafiği, dağılım halkası, filtreli tablo.

const light = {
  "--bg": "#FFFFFF",
  "--card": "#F4F3FE",
  "--card-2": "#EAE8FD",
  "--input": "#FFFFFF",
  "--fg": "#1E1E1E",
  "--fg-2": "#3A434A",
  "--muted": "#5C6878",
  "--border": "#EAE8FD",
  "--border-strong": "#D4D1FC",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#0C34E7",
  "--chart": "#0C34E7",
  "--side": "#EAE8FD",
  "--side-fg": "#3A434A",
  "--side-hover": "rgba(12,52,231,0.08)",
  "--side-well": "#F4F3FE",
  "--success": "#0EB567",
  "--danger": "#DC204D",
  "--warning": "#F89B3C",
  "--success-text": "#0A8A4E",
  "--danger-text": "#C81C45",
  "--warning-text": "#B45F06",
  "--success-soft": "#E1F5EA",
  "--danger-soft": "#FBE4E9",
  "--warning-soft": "#FEF0E1",
  "--ring": "#0C34E7",
  "--lift-shadow": "0 16px 32px -20px rgba(12,52,231,0.45)",
  "--pop-shadow": "0 14px 36px -12px rgba(12,52,231,0.30), 0 2px 6px rgba(30,30,30,0.06)",
};

const dark = {
  "--bg": "#0B0C10",
  "--card": "#14172A",
  "--card-2": "#1C2040",
  "--input": "#0B0C10",
  "--fg": "#F5F5F6",
  "--fg-2": "#D8D9DB",
  "--muted": "#B0B4B7",
  "--border": "#252A4A",
  "--border-strong": "#353B66",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#D4D1FC",
  "--chart": "#4C63FF",
  "--side": "#14172A",
  "--side-fg": "#D8D9DB",
  "--side-hover": "rgba(255,255,255,0.06)",
  "--side-well": "rgba(255,255,255,0.04)",
  "--success": "#0EB567",
  "--danger": "#DC204D",
  "--warning": "#F89B3C",
  "--success-text": "#35D08A",
  "--danger-text": "#F2617E",
  "--warning-text": "#F5A65B",
  "--success-soft": "rgba(14,181,103,0.16)",
  "--danger-soft": "rgba(220,32,77,0.18)",
  "--warning-soft": "rgba(248,155,60,0.16)",
  "--ring": "#D4D1FC",
  "--lift-shadow": "0 18px 34px -20px rgba(0,0,0,0.9)",
  "--pop-shadow": "0 16px 40px -12px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)",
};

// Giriş ve etkileşim animasyonları. Hareket azaltma tercihinde tamamı kapanır.
const MOTION_CSS = `
@keyframes nv-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes nv-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes nv-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes nv-arc { from { stroke-dasharray: 0 var(--c); } to { stroke-dasharray: var(--len) var(--gap); } }
@keyframes nv-pop { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: none; } }
.nv-rise { animation: nv-rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 55ms); }
.nv-draw { stroke-dasharray: 1; animation: nv-draw 1.1s ease-out backwards; animation-delay: 0.35s; }
.nv-wipe { animation: nv-wipe 1.2s cubic-bezier(0.3, 0.7, 0.2, 1) backwards; animation-delay: 0.3s; }
.nv-arc { animation: nv-arc 0.9s cubic-bezier(0.3, 0.7, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 120ms + 0.35s); }
.nv-pop { animation: nv-pop 0.16s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .nv-rise, .nv-draw, .nv-wipe, .nv-arc, .nv-pop { animation: none; }
}
`;

const DISPLAY = { fontFamily: "'Space Grotesk', 'Inter', sans-serif" };

const WEEK = [
  { d: "Pzt", v: 62, t: "₺ 512K" },
  { d: "Sal", v: 78, t: "₺ 644K" },
  { d: "Çar", v: 54, t: "₺ 446K" },
  { d: "Per", v: 91, t: "₺ 751K" },
  { d: "Cum", v: 100, t: "₺ 826K" },
  { d: "Cmt", v: 40, t: "₺ 330K" },
  { d: "Paz", v: 28, t: "₺ 231K" },
];

// Mock 7 günlük mini seriler + "düne göre" değişimler (good: değişim olumlu mu?)
const KPI_META = {
  toplam: { series: [40, 52, 47, 60, 58, 71, 76], txt: "%6,4", up: true, good: true },
  basarili: { series: [38, 49, 45, 57, 55, 68, 73], txt: "%7,1", up: true, good: true },
  basarisiz: { series: [9, 8, 10, 7, 8, 6, 5], txt: "%2,3", up: false, good: true },
  iptal: { series: [2, 3, 2, 3, 2, 3, 4], txt: "%0,8", up: true, good: false },
  iade: { series: [4, 3, 3, 2, 3, 2, 2], txt: "%1,2", up: false, good: true },
};

const TONE = {
  navy: { chip: "bg-[var(--card-2)] text-[var(--brand-text)]", spark: "text-[var(--chart)]" },
  green: { chip: "bg-[var(--success-soft)] text-[var(--success-text)]", spark: "text-[var(--success)]" },
  red: { chip: "bg-[var(--danger-soft)] text-[var(--danger-text)]", spark: "text-[var(--danger)]" },
  amber: { chip: "bg-[var(--warning-soft)] text-[var(--warning-text)]", spark: "text-[var(--warning)]" },
};

const SEGMENTS = [
  { key: "basarili", label: "Başarılı", color: "var(--success)" },
  { key: "basarisiz", label: "Başarısız", color: "var(--danger)" },
  { key: "iptal", label: "İptal", color: "var(--warning)" },
  { key: "iade", label: "İade", color: "var(--chart)" },
];

const FILTERS = ["Tümü", "Başarılı", "Başarısız", "İptal / İade"];

// Menüde "Yönetim" bölümüne giren öğeler
const MANAGE_ICONS = new Set(["dealer", "settings", "megaphone"]);

const CARD = "rounded-[20px] bg-[var(--card)]";
const LIFT =
  "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:[box-shadow:var(--lift-shadow)] motion-reduce:transform-none";
const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]";
const GHOST = `grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--fg-2)] transition-colors hover:bg-[var(--card)] hover:text-[var(--brand-text)] ${FOCUS}`;
const MENU_ITEM = `flex min-h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[12.5px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--card)] hover:text-[var(--brand-text)] ${FOCUS}`;

function pillTone(durum) {
  if (durum === "Başarılı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Başarısız") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  return "bg-[var(--warning-soft)] text-[var(--warning-text)]"; // İptal / İade
}

// "₺ 4.284.900" → 4284900
function parseAmount(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

// Noktalardan yumuşak (yatay teğetli) bir eğri yolu üretir.
function smoothPath(pts) {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const cx = ((px + x) / 2).toFixed(1);
    d += ` C ${cx} ${py.toFixed(1)}, ${cx} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

function toPoints(values, w, h, pad) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  return values.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)]);
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

function Money({ value }) {
  const v = useCountUp(parseAmount(value));
  return <>₺ {v.toLocaleString("tr-TR")}</>;
}

function Count({ value }) {
  const v = useCountUp(value);
  return <>{v.toLocaleString("tr-TR")}</>;
}

function useDismiss(open, close) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);
}

function Sparkline({ values, className }) {
  const d = smoothPath(toPoints(values, 96, 32, 3));
  return (
    <svg viewBox="0 0 96 32" className={`h-7 w-[84px] shrink-0 ${className}`} fill="none" aria-hidden="true">
      <path className="nv-draw" pathLength="1" d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendArrow({ up }) {
  return (
    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      {up ? <path d="M5 1.5 9 8H1z" /> : <path d="M5 8.5 1 2h8z" />}
    </svg>
  );
}

function Monogram({ onBrand }) {
  return (
    <span
      style={DISPLAY}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${onBrand ? "bg-white text-[#0C34E7]" : "bg-[var(--brand)] text-white"}`}
      aria-hidden="true"
    >
      N
    </span>
  );
}

function WordmarkText() {
  return (
    <div className="min-w-0 leading-none">
      <p className="text-[8.5px] font-semibold tracking-[0.2em] text-[var(--brand-text)]">N KOLAY BAYİM</p>
      <p style={DISPLAY} className="mt-1 text-base font-bold tracking-tight text-[var(--fg)]">
        pay<span className="text-[var(--brand-text)]">{"'n"}</span>kolay
      </p>
    </div>
  );
}

// ---- sol menü ----------------------------------------------------------------------------
// Açılır (akordiyon) grup. Menü daraltılmışsa yalnızca ikon görünür.
function NavGroup({ entry, open, collapsed, onToggle }) {
  const id = `nv-grp-${entry.icon}`;
  const hideLg = collapsed ? "lg:hidden" : "";
  return (
    <div className={`rounded-2xl transition-colors ${open ? `bg-[var(--side-well)] ${collapsed ? "lg:bg-transparent" : ""}` : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        title={entry.label}
        className={`group flex h-10 w-full items-center gap-2.5 rounded-2xl px-3 text-[13px] font-medium transition-colors hover:bg-[var(--side-hover)] ${
          open ? "text-[var(--brand-text)]" : "text-[var(--side-fg)]"
        } ${collapsed ? "lg:justify-center lg:px-0" : ""} ${FOCUS}`}
      >
        <I name={entry.icon} size={17} />
        <span className={`flex-1 text-left ${hideLg}`}>{entry.label}</span>
        <I
          name="chevronRight"
          size={13}
          className={`text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""} ${hideLg}`}
        />
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } ${hideLg}`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-px px-2 pb-2">
            {entry.items.map((i) => (
              <li key={i.href}>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  className={`flex h-[34px] w-full items-center rounded-xl pl-[30px] pr-3 text-left text-[12.5px] text-[var(--side-fg)] transition-colors hover:bg-[var(--side-hover)] hover:text-[var(--brand-text)] ${FOCUS}`}
                >
                  {i.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function NavSection({ label, entries, collapsed, openGroup, onGroup }) {
  if (entries.length === 0) return null;
  return (
    <div>
      <p className={`px-3 pb-1 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] ${collapsed ? "lg:hidden" : ""}`}>
        {label}
      </p>
      {collapsed && <div className="mx-2 my-2 hidden border-t border-[var(--border-strong)] lg:block" aria-hidden="true" />}
      <div className="space-y-0.5">
        {entries.map((entry) =>
          entry.items ? (
            <NavGroup key={entry.label} entry={entry} collapsed={collapsed} open={openGroup === entry.label} onToggle={() => onGroup(entry.label)} />
          ) : (
            <button
              key={entry.label}
              type="button"
              title={entry.label}
              aria-current={entry.href === "/dashboard" ? "page" : undefined}
              className={`flex h-10 w-full items-center gap-2.5 rounded-2xl px-3 text-[13px] transition-colors ${
                entry.href === "/dashboard"
                  ? "bg-[var(--brand)] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(12,52,231,0.8)]"
                  : "font-medium text-[var(--side-fg)] hover:bg-[var(--side-hover)]"
              } ${collapsed ? "lg:justify-center lg:px-0" : ""} ${FOCUS}`}
            >
              <I name={entry.icon} size={17} />
              <span className={collapsed ? "lg:hidden" : ""}>{entry.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function Sidebar({ role, mobileOpen, hidden, onClose, collapsed, setCollapsed, onLogout }) {
  const nav = getNav(role);
  const meta = ROLE_META[role];
  const main = nav.filter((e) => !MANAGE_ICONS.has(e.icon));
  const manage = nav.filter((e) => MANAGE_ICONS.has(e.icon));
  // aynı anda tek grup açık kalır
  const [openGroup, setOpenGroup] = useState("Ödeme Al");
  const hideLg = collapsed ? "lg:hidden" : "";

  const onGroup = (label) => {
    if (collapsed) {
      // daraltılmışken bir gruba tıklanırsa: menüyü genişlet ve grubu aç
      setCollapsed(false);
      setOpenGroup(label);
    } else {
      setOpenGroup((g) => (g === label ? null : label));
    }
  };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-[55] bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Ana menü"
        inert={hidden ? "" : undefined}
        className={`fixed inset-y-0 left-0 z-[60] flex w-[256px] shrink-0 flex-col bg-[var(--side)] transition-[transform,width] duration-300 ease-out motion-reduce:transition-none max-lg:rounded-r-[22px] lg:sticky lg:bottom-auto lg:left-auto lg:top-3 lg:z-30 lg:my-3 lg:ml-3 lg:h-[calc(100vh-24px)] lg:translate-x-0 lg:self-start lg:rounded-[22px] ${
          collapsed ? "lg:w-[68px]" : "lg:w-[256px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`flex h-14 shrink-0 items-center gap-2.5 pl-4 pr-2.5 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          <Monogram />
          <div className={`flex-1 ${hideLg}`}>
            <WordmarkText />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--fg-2)] hover:bg-[var(--side-hover)] lg:hidden ${FOCUS}`}
          >
            <I name="x" size={16} />
          </button>
        </div>

        <nav
          className={`flex-1 overflow-y-auto overscroll-contain px-2.5 pb-2 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--border-strong)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-strong)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 ${
            collapsed ? "lg:px-3.5" : ""
          }`}
        >
          <NavSection label="İşlemler" entries={main} collapsed={collapsed} openGroup={openGroup} onGroup={onGroup} />
          <NavSection label="Yönetim" entries={manage} collapsed={collapsed} openGroup={openGroup} onGroup={onGroup} />
        </nav>

        {/* masaüstü: menüyü daralt / genişlet */}
        <div className={`hidden px-2.5 pb-1 lg:block ${collapsed ? "lg:px-3.5" : ""}`}>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            title={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            className={`flex h-9 w-full items-center gap-2.5 rounded-2xl px-3 text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--side-hover)] hover:text-[var(--brand-text)] ${
              collapsed ? "justify-center px-0" : ""
            } ${FOCUS}`}
          >
            <I name="chevronLeft" size={15} className={`transition-transform duration-300 motion-reduce:transition-none ${collapsed ? "rotate-180" : ""}`} />
            <span className={collapsed ? "hidden" : ""}>Menüyü daralt</span>
          </button>
        </div>

        <div className={`m-2.5 mt-1 flex shrink-0 items-center gap-2.5 rounded-2xl bg-[var(--side-well)] p-2 ${collapsed ? "lg:m-2 lg:justify-center lg:bg-transparent lg:p-1" : ""}`}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white">{meta.short}</span>
          <span className={`min-w-0 flex-1 leading-tight ${hideLg}`}>
            <span className="block truncate text-[12.5px] font-semibold text-[var(--fg)]">{meta.user}</span>
            <span className="block truncate text-[11px] text-[var(--muted)]">{meta.company}</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Çıkış yap"
            title="Çıkış yap"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger-text)] ${hideLg} ${FOCUS}`}
          >
            <I name="logout" size={15} />
          </button>
        </div>
      </aside>
    </>
  );
}

function UserMenu({ meta, isDark, onToggleTheme, onLogout }) {
  const [open, setOpen] = useState(false);
  useDismiss(open, () => setOpen(false));
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Kullanıcı menüsü"
        className={`flex h-9 items-center gap-1.5 rounded-full bg-[var(--card)] pl-1 pr-2 transition-colors hover:bg-[var(--card-2)] ${FOCUS}`}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white">{meta.short}</span>
        <span className="hidden max-w-[150px] truncate text-[12.5px] font-medium text-[var(--fg)] xl:block">{meta.user}</span>
        <I name="chevronDown" size={13} className={`text-[var(--muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="nv-pop absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1.5 [box-shadow:var(--pop-shadow)]"
          >
            <div className="px-2.5 pb-2 pt-1.5">
              <p className="truncate text-[12.5px] font-semibold text-[var(--fg)]">{meta.user}</p>
              <p className="truncate text-[11.5px] text-[var(--muted)]">{meta.company}</p>
            </div>
            <div className="my-1 border-t border-[var(--border)]" />
            <button type="button" role="menuitem" className={MENU_ITEM} onClick={() => setOpen(false)}>
              <I name="building" size={14} />
              Firma Bilgileri
            </button>
            <button
              type="button"
              role="menuitem"
              className={MENU_ITEM}
              onClick={() => {
                onToggleTheme();
                setOpen(false);
              }}
            >
              <I name={isDark ? "sun" : "moon"} size={14} />
              {isDark ? "Açık moda geç" : "Koyu moda geç"}
            </button>
            <div className="my-1 border-t border-[var(--border)]" />
            <button
              type="button"
              role="menuitem"
              className={`${MENU_ITEM} hover:!bg-[var(--danger-soft)] hover:!text-[var(--danger-text)]`}
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <I name="logout" size={14} />
              Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---- pano blokları -----------------------------------------------------------------------
function WelcomeBand({ role, stats }) {
  const meta = ROLE_META[role];
  const toplam = stats.find((s) => s.key === "toplam") || stats[0];
  const basarili = stats.find((s) => s.key === "basarili") || toplam;
  const oran = toplam.count ? (basarili.count / toplam.count) * 100 : 0;
  const usd = kurBilgisi.find((k) => k.code === "USD");
  const eur = kurBilgisi.find((k) => k.code === "EUR");
  const bekleyenOnay = iptalIadeTalepleri.filter((t) => t.durum === "Onayda").length;
  const bekleyenFatura = faturaYuklemeleri.filter((f) => f.durum === "Bekliyor").length;

  const [now, setNow] = useState({ selam: "Hoş geldiniz", tarih: "" });
  useEffect(() => {
    try {
      const d = new Date();
      const h = d.getHours();
      const selam = h < 6 ? "İyi geceler" : h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
      const gun = d.toLocaleDateString("tr-TR", { weekday: "long" });
      const rest = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
      setNow({ selam, tarih: `${gun}, ${rest}` });
    } catch (e) {}
  }, []);

  const facts = [
    usd && { key: "usd", badge: "$", label: "USD / TL", value: usd.satis, sub: usd.change, good: usd.up },
    eur && { key: "eur", badge: "€", label: "EUR / TL", value: eur.satis, sub: eur.change, good: eur.up },
    { key: "onay", icon: "clock", label: "Onay bekleyen", value: `${bekleyenOnay} talep`, sub: "İptal / iade" },
    { key: "fatura", icon: "receipt", label: "Bekleyen fatura", value: `${bekleyenFatura} işlem`, sub: "Yükleme bekliyor" },
  ].filter(Boolean);

  return (
    <section style={{ "--i": 0 }} className={`nv-rise relative overflow-hidden p-5 lg:p-6 ${CARD}`} aria-labelledby="nv-welcome-title">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[var(--brand)] opacity-[0.10] blur-3xl" aria-hidden="true" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:items-center">
        <div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--brand-text)]">
            <I name="calendar" size={13} />
            <span>{now.selam}</span>
            {now.tarih && (
              <>
                <span className="text-[var(--border-strong)]" aria-hidden="true">
                  ·
                </span>
                <span className="text-[var(--muted)]">{now.tarih}</span>
              </>
            )}
          </p>
          <h1 id="nv-welcome-title" style={DISPLAY} className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-[var(--fg)]">
            Ana Sayfa
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-[var(--fg-2)]">
            {meta.company} için bugün <span className="font-semibold text-[var(--fg)]">{toplam.count.toLocaleString("tr-TR")} işlem</span> alındı. Başarı oranı{" "}
            <span className="font-semibold text-[var(--success-text)]">%{oran.toFixed(1).replace(".", ",")}</span>.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-semibold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] active:scale-[0.97] hover:brightness-110 ${FOCUS}`}
            >
              <I name="plus" size={14} />
              Ödeme Al
            </button>
            <button
              type="button"
              className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--input)] px-3.5 text-[12.5px] font-semibold text-[var(--brand-text)] transition active:scale-[0.97] hover:bg-[var(--card-2)] ${FOCUS}`}
            >
              <I name="link" size={14} />
              Link Oluştur
            </button>
            <button
              type="button"
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-[var(--fg-2)] transition active:scale-[0.97] hover:bg-[var(--card-2)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              <I name="download" size={14} />
              Dışa Aktar
            </button>
            {role === ROLES.BAYI && (
              <select
                aria-label="Ana firma cari seçimi"
                defaultValue=""
                className={`h-9 rounded-full border border-[var(--border-strong)] bg-[var(--input)] px-3 text-[12.5px] text-[var(--fg-2)] ${FOCUS}`}
              >
                <option value="">Ana Firma Cari Seçimi</option>
                <option>Brisa A.Ş. — 320.00.001</option>
                <option>Brisa Perakende — 320.00.002</option>
              </select>
            )}
            {role === ROLES.ALT_BAYI && (
              <select
                aria-label="Bayi cari seçimi"
                defaultValue=""
                className={`h-9 rounded-full border border-[var(--border-strong)] bg-[var(--input)] px-3 text-[12.5px] text-[var(--fg-2)] ${FOCUS}`}
              >
                <option value="">Bayi Cari Seçimi</option>
                <option>Ankara Lastik Bayi — 320.01.001</option>
              </select>
            )}
          </div>
        </div>

        {/* bilgi kutuları: kur, onay, fatura */}
        <dl className="grid grid-cols-2 gap-2.5">
          {facts.map((f) => (
            <div key={f.key} className={`flex items-center gap-2.5 rounded-2xl bg-[var(--input)] p-3 ${LIFT}`}>
              <span
                style={DISPLAY}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--card-2)] text-sm font-bold text-[var(--brand-text)]"
                aria-hidden="true"
              >
                {f.badge || <I name={f.icon} size={16} />}
              </span>
              <div className="min-w-0 leading-tight">
                <dt className="truncate text-[11px] text-[var(--muted)]">{f.label}</dt>
                <dd style={DISPLAY} className="mt-0.5 text-[15px] font-bold tabular-nums text-[var(--fg)]">
                  {f.value}
                </dd>
                <dd
                  className={`truncate text-[10.5px] font-medium ${
                    f.good === undefined ? "text-[var(--muted)]" : f.good ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"
                  }`}
                >
                  {f.sub}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function KpiCard({ s, index }) {
  const meta = KPI_META[s.key];
  const featured = s.key === "toplam";
  const tone = TONE[s.tone] || TONE.navy;
  return (
    <div
      style={{ "--i": index }}
      className={`nv-rise rounded-[20px] p-4 ${LIFT} ${featured ? "relative col-span-2 overflow-hidden bg-[#0C34E7] text-white" : "bg-[var(--card)]"}`}
    >
      {featured && <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#D4D1FC] opacity-25 blur-2xl" aria-hidden="true" />}
      <div className="relative flex items-center justify-between gap-2">
        <p className={`text-[12.5px] font-medium ${featured ? "text-white/85" : "text-[var(--fg-2)]"}`}>{s.label}</p>
        <span className={`whitespace-nowrap rounded-full px-1.5 py-px text-[10.5px] font-semibold tabular-nums ${featured ? "bg-white/15 text-white" : tone.chip}`}>
          {s.count} adet
        </span>
      </div>
      <p style={DISPLAY} className={`relative mt-2.5 font-bold leading-none tracking-tight tabular-nums ${featured ? "text-[26px] text-white" : "text-xl text-[var(--fg)]"}`}>
        <Money value={s.value} />
      </p>
      {meta && (
        <div className="relative mt-2 flex items-end justify-between gap-2">
          <p className={`flex flex-wrap items-center gap-x-1 text-[11px] ${featured ? "text-white/75" : "text-[var(--muted)]"}`}>
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                featured ? "text-white" : meta.good ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"
              }`}
            >
              <TrendArrow up={meta.up} />
              {meta.txt}
            </span>
            düne göre
          </p>
          <Sparkline values={meta.series} className={featured ? "text-white" : tone.spark} />
        </div>
      )}
    </div>
  );
}

function VolumeChart() {
  const W = 640;
  const H = 200;
  const values = WEEK.map((x) => x.v);
  const max = Math.max(...values);
  const step = (W - 24) / (values.length - 1);
  const pts = values.map((v, i) => [12 + i * step, H - 12 - (v / max) * (H - 52)]);
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`;
  const maxI = values.indexOf(max);
  // üzerine gelinen gün; boşta en yüksek gün seçilidir
  const [active, setActive] = useState(maxI);
  const ax = (pts[active][0] / W) * 100;
  const ay = (pts[active][1] / H) * 100;

  return (
    <section style={{ "--i": 6 }} className={`nv-rise p-5 lg:col-span-2 ${CARD}`} aria-labelledby="nv-chart-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="nv-chart-title" style={DISPLAY} className="text-[15px] font-bold text-[var(--fg)]">
            Haftalık İşlem Hacmi
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Son 7 gün · toplam ₺ 3,74M</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--success-text)]">
          <TrendArrow up />
          %12,4 geçen haftaya göre
        </span>
      </div>

      <div className="relative mt-5 h-48" onMouseLeave={() => setActive(maxI)}>
        <div className="nv-wipe absolute inset-0">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Haftalık işlem hacmi alan grafiği">
            <defs>
              <linearGradient id="nvFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--chart)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" x2={W} y1={g * H} y2={g * H} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={area} fill="url(#nvFill)" />
            <path d={line} fill="none" stroke="var(--chart)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {pts.map((p, i) => (
            <span
              key={WEEK[i].d}
              aria-hidden="true"
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--card)] bg-[var(--chart)] transition-all duration-200 ${
                i === active ? "h-4 w-4" : "h-2.5 w-2.5"
              }`}
              style={{ left: `${(p[0] / W) * 100}%`, top: `${(p[1] / H) * 100}%` }}
            />
          ))}
        </div>

        {/* seçili gün: kılavuz çizgisi + etiket */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 w-px -translate-x-1/2 bg-[var(--border-strong)] transition-[left,top] duration-200 motion-reduce:transition-none"
          style={{ left: `${ax}%`, top: `${ay}%` }}
        />
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-[var(--fg)] px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-[var(--bg)] transition-[left,top] duration-200 motion-reduce:transition-none"
          style={{ left: `${ax}%`, top: `calc(${ay}% - 12px)` }}
        >
          {WEEK[active].d} · {WEEK[active].t}
        </span>

        {/* gün gün okuma alanları */}
        {pts.map((p, i) => (
          <button
            key={WEEK[i].d}
            type="button"
            aria-label={`${WEEK[i].d}: ${WEEK[i].t}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="absolute inset-y-0 -translate-x-1/2 cursor-default rounded-lg focus:outline-none focus-visible:bg-[var(--side-hover)]"
            style={{ left: `${(p[0] / W) * 100}%`, width: `${(step / W) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative mt-2 h-4 text-[11px]">
        {pts.map((p, i) => (
          <span
            key={WEEK[i].d}
            className={`absolute -translate-x-1/2 transition-colors ${i === active ? "font-semibold text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
            style={{ left: `${(p[0] / W) * 100}%` }}
          >
            {WEEK[i].d}
          </span>
        ))}
      </div>
    </section>
  );
}

function DistributionCard({ stats }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const parts = SEGMENTS.map((seg) => ({ ...seg, count: (stats.find((s) => s.key === seg.key) || {}).count || 0 }));
  const total = parts.reduce((a, p) => a + p.count, 0) || 1;
  let acc = 0;
  const arcs = parts.map((p) => {
    const len = (p.count / total) * C;
    const arc = { ...p, len, offset: acc };
    acc += len;
    return arc;
  });

  return (
    <section style={{ "--i": 7 }} className={`nv-rise flex flex-col p-5 ${CARD}`} aria-labelledby="nv-dist-title">
      <h2 id="nv-dist-title" style={DISPLAY} className="text-[15px] font-bold text-[var(--fg)]">
        İşlem Dağılımı
      </h2>
      <p className="mt-0.5 text-xs text-[var(--muted)]">Duruma göre adet</p>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row lg:flex-col">
        <div className="relative h-[124px] w-[124px] shrink-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label="İşlem durum dağılımı halka grafiği">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--card-2)" strokeWidth="14" />
            {arcs
              .filter((a) => a.len > 0.5)
              .map((a, i) => {
                const len = Math.max(a.len - 2, 0.5);
                return (
                  <circle
                    key={a.key}
                    className="nv-arc"
                    style={{ "--i": i, "--c": C.toFixed(2), "--len": len.toFixed(2), "--gap": (C - len).toFixed(2) }}
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={a.color}
                    strokeWidth="14"
                    strokeDasharray={`${len.toFixed(2)} ${(C - len).toFixed(2)}`}
                    strokeDashoffset={(-a.offset).toFixed(2)}
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p style={DISPLAY} className="text-xl font-bold leading-none tabular-nums text-[var(--fg)]">
                <Count value={total} />
              </p>
              <p className="mt-1 text-[10.5px] font-medium text-[var(--muted)]">işlem</p>
            </div>
          </div>
        </div>

        <ul className="w-full space-y-2 text-[12.5px]">
          {parts.map((p) => (
            <li key={p.key} className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden="true" />
              <span className="flex-1 text-[var(--fg-2)]">{p.label}</span>
              <span className="font-semibold tabular-nums text-[var(--fg)]">{p.count}</span>
              <span className="w-11 text-right text-[11px] tabular-nums text-[var(--muted)]">%{((p.count / total) * 100).toFixed(1).replace(".", ",")}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BalanceCard({ role }) {
  const bakiye = bakiyeOzet[role];
  const R = 46;
  const C = 2 * Math.PI * R;
  const used = (bakiye.kullanim / 100) * C;
  return (
    <section style={{ "--i": 9 }} className={`nv-rise flex flex-col p-5 ${CARD}`} aria-labelledby="nv-balance-title">
      <h2 id="nv-balance-title" style={DISPLAY} className="text-[15px] font-bold text-[var(--fg)]">
        Bakiye ve Borç
      </h2>
      <p className="mt-0.5 text-xs text-[var(--muted)]">{role === ROLES.ANA_FIRMA ? "Firma limiti" : "Üst cari görünümü"}</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full -rotate-90"
            role="progressbar"
            aria-valuenow={bakiye.kullanim}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Limit kullanımı"
          >
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--card-2)" strokeWidth="10" />
            <circle
              className="nv-arc"
              style={{ "--c": C.toFixed(2), "--len": used.toFixed(2), "--gap": (C - used).toFixed(2) }}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="var(--chart)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${used.toFixed(2)} ${(C - used).toFixed(2)}`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p style={DISPLAY} className="text-lg font-bold leading-none tabular-nums text-[var(--fg)]">
                %<Count value={bakiye.kullanim} />
              </p>
              <p className="mt-0.5 text-[9.5px] font-medium text-[var(--muted)]">limit kullanımı</p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[var(--muted)]">Kullanılabilir Bakiye</p>
          <p style={DISPLAY} className="mt-1 text-[22px] font-bold leading-none tracking-tight tabular-nums text-[var(--brand-text)]">
            <Money value={bakiye.bakiye} />
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-[12.5px]">
        <div className="flex items-center justify-between rounded-xl bg-[var(--card-2)] px-3 py-2.5">
          <dt className="text-[var(--fg-2)]">Güncel Borç</dt>
          <dd className="font-semibold tabular-nums text-[var(--danger-text)]">{bakiye.borc}</dd>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-[var(--card-2)] px-3 py-2.5">
          <dt className="text-[var(--fg-2)]">Ödeme Limiti</dt>
          <dd className="font-semibold tabular-nums text-[var(--fg)]">{bakiye.limit}</dd>
        </div>
      </dl>
    </section>
  );
}

function TransactionsCard() {
  const [filter, setFilter] = useState("Tümü");
  const rows = islemler
    .filter((t) => {
      if (filter === "Tümü") return true;
      if (filter === "İptal / İade") return t.durum === "İptal" || t.durum === "İade";
      return t.durum === filter;
    })
    .slice(0, 6);

  return (
    <section style={{ "--i": 8 }} className={`nv-rise overflow-hidden lg:col-span-2 ${CARD}`} aria-labelledby="nv-tx-title">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5">
        <h2 id="nv-tx-title" style={DISPLAY} className="text-[15px] font-bold text-[var(--fg)]">
          Son İşlemler
        </h2>
        <div role="group" aria-label="Durum filtresi" className="flex flex-wrap gap-0.5 rounded-full bg-[var(--card-2)] p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`h-8 rounded-full px-3 text-[11.5px] font-semibold transition-all duration-200 active:scale-95 ${
                filter === f ? "bg-[var(--brand)] text-white" : "text-[var(--fg-2)] hover:text-[var(--brand-text)]"
              } ${FOCUS}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <table className="min-w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th scope="col" className="whitespace-nowrap px-3 py-2">İşlem No</th>
              <th scope="col" className="whitespace-nowrap px-3 py-2">Müşteri</th>
              <th scope="col" className="whitespace-nowrap px-3 py-2">Tarih</th>
              <th scope="col" className="whitespace-nowrap px-3 py-2">Taksit</th>
              <th scope="col" className="whitespace-nowrap px-3 py-2 text-right">Tutar</th>
              <th scope="col" className="whitespace-nowrap px-3 py-2">Durum</th>
            </tr>
          </thead>
          {/* key={filter}: filtre değişince satırlar yeniden belirir */}
          <tbody key={filter}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-[var(--muted)]">
                  Bu filtrede işlem bulunmuyor.
                </td>
              </tr>
            ) : (
              rows.map((t, i) => (
                <tr key={t.id} style={{ "--i": i }} className="nv-rise border-t border-[var(--border-strong)] transition-colors hover:bg-[var(--card-2)]">
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[var(--brand-text)]">{t.id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className="block font-medium text-[var(--fg)]">{t.musteri}</span>
                    <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.cari}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-[var(--fg-2)]">{t.tarih}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[var(--fg-2)]">{t.taksit}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-[var(--fg)]">{t.tutar}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillTone(t.durum)}`}>{t.durum}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PanelView({ role, setRole, isDark, onToggleTheme, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const meta = ROLE_META[role];
  const stats = kpis[role];

  useEffect(() => {
    try {
      const mq = window.matchMedia("(min-width: 1024px)");
      const sync = () => setIsDesktop(mq.matches);
      sync();
      mq.addEventListener("change", sync);
      // ?menu=rail | ?menu=open bağlantıyla menü durumunu zorlar
      const q = new URLSearchParams(window.location.search).get("menu");
      if (q === "rail" || (q !== "open" && localStorage.getItem("nkb-nova-menu") === "rail")) setCollapsedState(true);
      return () => mq.removeEventListener("change", sync);
    } catch (e) {
      return undefined;
    }
  }, []);

  const setCollapsed = (next) => {
    setCollapsedState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try {
        localStorage.setItem("nkb-nova-menu", value ? "rail" : "open");
      } catch (e) {}
      return value;
    });
  };
  const toggleMenu = () => (isDesktop ? setCollapsed((c) => !c) : setMobileOpen((o) => !o));

  return (
    <div className="flex flex-1">
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        hidden={!isDesktop && !mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={onLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col px-4 lg:px-6">
        {/* üst bar */}
        <header className="sticky top-0 z-20 flex h-[60px] shrink-0 items-center gap-1.5 bg-[var(--bg)] sm:gap-2">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isDesktop ? (collapsed ? "Menüyü genişlet" : "Menüyü daralt") : "Menüyü aç"}
            title={isDesktop ? (collapsed ? "Menüyü genişlet" : "Menüyü daralt") : "Menüyü aç"}
            className={GHOST}
          >
            <I name="panel" size={17} />
          </button>
          <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={GHOST}>
            <I name="arrowLeft" size={17} />
          </Link>

          {/* konum */}
          <nav aria-label="Konum" className="ml-1 hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-[12.5px] sm:flex lg:hidden xl:flex">
            <span className="text-[var(--muted)]">{meta.label} Paneli</span>
            <I name="chevronRight" size={12} className="shrink-0 text-[var(--border-strong)]" />
            <span className="font-semibold text-[var(--fg)]">Ana Sayfa</span>
          </nav>

          {/* arama */}
          <label className="relative mx-auto hidden min-w-0 max-w-sm flex-1 lg:block">
            <span className="sr-only">Ara</span>
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <I name="search" size={15} />
            </span>
            <input
              type="search"
              placeholder="İşlem, cari veya müşteri ara"
              className="h-9 w-full rounded-full border border-transparent bg-[var(--card)] pl-10 pr-14 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--border-strong)] focus:border-[var(--brand)] focus:bg-[var(--input)]"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-[var(--input)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
              ⌘K
            </kbd>
          </label>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:ml-0">
            {/* rol değiştirici — menü ve veriler role göre değişir */}
            <div role="group" aria-label="Panel tipi" className="mr-0.5 flex h-9 items-center rounded-full bg-[var(--card)] p-0.5">
              {ROLE_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={`h-8 whitespace-nowrap rounded-full px-2.5 text-[11.5px] transition-all duration-200 active:scale-95 sm:px-3 ${
                    role === r ? "bg-[var(--brand)] font-semibold text-white" : "font-medium text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                  } ${FOCUS}`}
                >
                  {ROLE_META[r].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
              title={isDark ? "Açık mod" : "Koyu mod"}
              className={`${GHOST} hidden sm:grid`}
            >
              <I name={isDark ? "sun" : "moon"} size={16} />
            </button>
            <button type="button" aria-label="Bildirimler" title="Bildirimler" className={`${GHOST} relative hidden sm:grid`}>
              <I name="bell" size={16} />
              <span className="absolute right-2 top-2 flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--danger)] opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--bg)]" />
              </span>
            </button>
            <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />
          </div>
        </header>

        {/* key={role}: rol değişince giriş animasyonları yeniden oynar */}
        <main key={role} className="mx-auto w-full max-w-[1320px] flex-1 pb-8">
          <WelcomeBand role={role} stats={stats} />

          {/* KPI kartları — ikon yok; adet rozeti + değişim + mini grafik */}
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
            {stats.map((s, i) => (
              <KpiCard key={s.key} s={s} index={i + 1} />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <VolumeChart />
            <DistributionCard stats={stats} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <TransactionsCard />
            <BalanceCard role={role} />
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginView({ isDark, onToggleTheme, onLogin }) {
  const inputCls =
    "h-11 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--input)] px-3.5 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]";
  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      {/* küçük kontroller */}
      <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={`${GHOST} absolute left-4 top-4`}>
        <I name="arrowLeft" size={17} />
      </Link>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
        title={isDark ? "Açık mod" : "Koyu mod"}
        className={`${GHOST} absolute right-4 top-4`}
      >
        <I name={isDark ? "sun" : "moon"} size={16} />
      </button>

      <div className="grid w-full max-w-[920px] gap-3 lg:grid-cols-2">
        <form
          style={{ "--i": 0 }}
          className={`nv-rise px-6 py-9 sm:px-9 ${CARD}`}
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <div className="flex items-center gap-2.5">
            <Monogram />
            <WordmarkText />
          </div>
          <h2 style={DISPLAY} className="mt-9 text-[26px] font-bold tracking-tight text-[var(--fg)]">
            Giriş Yap
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Panel bilgilerinizle oturum açın.</p>
          <label className="mt-7 block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--fg-2)]">E-posta adresi</span>
            <input type="email" defaultValue="yonetici@brisa.com" autoComplete="email" className={inputCls} />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--fg-2)]">Şifre</span>
            <input type="password" defaultValue="123456" autoComplete="current-password" className={inputCls} />
          </label>
          <div className="mt-3 flex items-center justify-between text-[12.5px]">
            <label className="flex min-h-[36px] items-center gap-2 text-[var(--fg-2)]">
              <input type="checkbox" className="h-4 w-4 rounded accent-[#0C34E7]" />
              Beni hatırla
            </label>
            <a href="#" onClick={(e) => e.preventDefault()} className={`rounded font-semibold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
              Şifremi unuttum
            </a>
          </div>
          <button
            type="submit"
            className={`mt-5 h-11 w-full rounded-full bg-[var(--brand)] text-[13px] font-semibold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] active:scale-[0.98] hover:brightness-110 ${FOCUS}`}
          >
            Giriş Yap
          </button>
          <p className="mt-5 text-center text-[11.5px] text-[var(--muted)]">Demo mockup — herhangi bir bilgiyle panele geçilir.</p>
        </form>

        <div style={{ "--i": 1 }} className="nv-rise relative hidden flex-col justify-between overflow-hidden rounded-[20px] bg-[#0C34E7] p-9 text-white lg:flex">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D4D1FC] opacity-25 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold tracking-wide">B2B ÖDEME PANELİ</span>
            <h2 style={DISPLAY} className="mt-4 text-[32px] font-bold leading-[1.1] tracking-tight">
              Bayi ağınızı
              <br />
              tek panelden yönetin
            </h2>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/80">
              Ana firma, bayi ve alt bayi hiyerarşisi; manuel ve link ile ödeme, iptal / iade onayları ve raporlar tek yerde.
            </p>
          </div>
          {/* önizleme kartı */}
          <div className="relative mt-8 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] font-medium text-white/75">Bugünkü toplam işlem</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p style={DISPLAY} className="text-[26px] font-bold leading-none tracking-tight tabular-nums">
                {kpis.ANA_FIRMA[0].value}
              </p>
              <Sparkline values={KPI_META.toplam.series} className="text-white" />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/15 pt-3">
              {[
                ["3", "Panel Tipi"],
                ["7/24", "Ödeme"],
                ["5", "Vade Profili"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd style={DISPLAY} className="text-lg font-bold leading-none">
                    {n}
                  </dd>
                  <dd className="mt-1 text-[10.5px] text-white/70">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NovaDesign() {
  const { role, setRole } = useRole();
  const [view, setView] = useState("Panel");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      // ?theme=dark | ?theme=light ve ?view=giris bağlantıyla durumu zorlar (paylaşım / önizleme için)
      const params = new URLSearchParams(window.location.search);
      const q = params.get("theme");
      const s = localStorage.getItem("nkb-theme-nova");
      if (q === "dark" || q === "light") setIsDark(q === "dark");
      else if (s) setIsDark(s === "dark");
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
      if (params.get("view") === "giris") setView("Giriş");
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("nkb-theme-nova", isDark ? "dark" : "light");
    } catch (e) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <>
      <Head>
        <title>Tasarım 04 · Nova — N Kolay Bayim</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
      <div
        style={{ ...(isDark ? dark : light), fontFamily: "'Inter', sans-serif" }}
        className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)] transition-colors"
      >
        {view === "Panel" ? (
          <PanelView role={role} setRole={setRole} isDark={isDark} onToggleTheme={toggleTheme} onLogout={() => setView("Giriş")} />
        ) : (
          <LoginView isDark={isDark} onToggleTheme={toggleTheme} onLogin={() => setView("Panel")} />
        )}
      </div>
    </>
  );
}

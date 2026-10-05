import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import I from "@/components/DesignIcons";
import { useRole } from "@/components/RoleContext";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import CompanyLogo from "@/components/CompanyLogo";
import { kpis, islemler, bakiyeOzet, iptalIadeTalepleri, kurBilgisi, anaFirma } from "@/lib/mockData";

// Tasarım 05 — Klasik: temel /dashboard mockup'ının lacivert kimliği (lacivert menü, renkli KPI
// rakamları, gradyan çubuklar) üzerine kurulu geliştirilmiş hali. Daraltılabilir sol menü,
// ince üst bar, banka kartı görünümlü bakiye, çalışan onay listesi, giriş animasyonları.

const light = {
  "--bg": "#F5F7FB",
  "--surface": "#FFFFFF",
  "--surface-2": "#F8FAFC",
  "--fg": "#1F2333",
  "--fg-2": "#334155",
  "--muted": "#64748B",
  "--border": "#E2E8F0",
  "--border-strong": "#CBD5E1",
  "--brand": "#2B4BF2",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#2B4BF2",
  "--brand-soft": "#EAEFFF",
  "--brand-softer": "#F3F6FF",
  "--navy": "#0F1E8A",
  "--navy-text": "#0F1E8A",
  "--navy-soft": "#EEF0FF",
  "--chart-from": "#0F1E8A",
  "--chart-to": "#2B4BF2",
  "--sidebar": "#0A1568",
  "--sidebar-fg": "#CBD5E1",
  "--sidebar-muted": "#94A3B8",
  "--sidebar-hover": "rgba(255,255,255,0.08)",
  "--sidebar-card": "rgba(255,255,255,0.06)",
  "--sidebar-border": "rgba(255,255,255,0.10)",
  "--sidebar-scroll": "rgba(255,255,255,0.28)",
  "--success": "#16A34A",
  "--danger": "#E5322D",
  "--warning": "#D97706",
  "--success-text": "#15803D",
  "--danger-text": "#DC2626",
  "--warning-text": "#B45309",
  "--success-soft": "#F0FDF4",
  "--danger-soft": "#FEF2F2",
  "--warning-soft": "#FFFBEB",
  "--ring": "#2B4BF2",
  "--shadow": "0 1px 3px rgba(15,30,138,0.06), 0 1px 2px rgba(15,30,138,0.04)",
  "--shadow-hover": "0 2px 4px rgba(15,30,138,0.06), 0 16px 32px -18px rgba(15,30,138,0.35)",
  "--pop-shadow": "0 14px 36px -12px rgba(15,30,138,0.30), 0 2px 6px rgba(15,23,42,0.06)",
};

const dark = {
  "--bg": "#0B0E1A",
  "--surface": "#131832",
  "--surface-2": "#1A2040",
  "--fg": "#F1F5F9",
  "--fg-2": "#CBD5E1",
  "--muted": "#94A3B8",
  "--border": "#26305A",
  "--border-strong": "#35407A",
  "--brand": "#2B4BF2",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#9DB0FF",
  "--brand-soft": "rgba(79,107,255,0.22)",
  "--brand-softer": "rgba(79,107,255,0.10)",
  "--navy": "#2B4BF2",
  "--navy-text": "#C7D2FF",
  "--navy-soft": "rgba(79,107,255,0.16)",
  "--chart-from": "#2B4BF2",
  "--chart-to": "#6F86FF",
  "--sidebar": "#070A16",
  "--sidebar-fg": "#CBD5E1",
  "--sidebar-muted": "#94A3B8",
  "--sidebar-hover": "rgba(255,255,255,0.07)",
  "--sidebar-card": "rgba(255,255,255,0.05)",
  "--sidebar-border": "rgba(255,255,255,0.10)",
  "--sidebar-scroll": "rgba(255,255,255,0.22)",
  "--success": "#22C55E",
  "--danger": "#F87171",
  "--warning": "#FBBF24",
  "--success-text": "#4ADE80",
  "--danger-text": "#F87171",
  "--warning-text": "#FBBF24",
  "--success-soft": "rgba(34,197,94,0.16)",
  "--danger-soft": "rgba(248,113,113,0.16)",
  "--warning-soft": "rgba(251,191,36,0.16)",
  "--ring": "#9DB0FF",
  "--shadow": "0 1px 2px rgba(0,0,0,0.4), 0 12px 28px -18px rgba(0,0,0,0.7)",
  "--shadow-hover": "0 2px 4px rgba(0,0,0,0.5), 0 20px 36px -18px rgba(0,0,0,0.9)",
  "--pop-shadow": "0 16px 40px -12px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)",
};

// Giriş ve etkileşim animasyonları. Hareket azaltma tercihinde tamamı kapanır.
const MOTION_CSS = `
@keyframes kl-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes kl-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes kl-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes kl-pop { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes kl-shine { from { transform: translateX(-120%) skewX(-18deg); } to { transform: translateX(320%) skewX(-18deg); } }
.kl-rise { animation: kl-rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 55ms); }
.kl-grow { transform-origin: bottom; animation: kl-grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 50ms + 200ms); }
.kl-fill { transform-origin: left; animation: kl-fill 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: 0.3s; }
.kl-pop { animation: kl-pop 0.16s ease-out backwards; }
.kl-shine { animation: kl-shine 1.4s ease-out 0.6s backwards; }
@media (prefers-reduced-motion: reduce) {
  .kl-rise, .kl-grow, .kl-fill, .kl-pop { animation: none; }
  .kl-shine { display: none; }
}
`;

// Sol şerit + tona göre renkli değer + adet rozeti (temel StatCard kimliği)
const TONE = {
  navy: { bar: "bg-[var(--navy)]", value: "text-[var(--navy-text)]", chip: "bg-[var(--navy-soft)] text-[var(--navy-text)]", mini: "bg-[var(--navy)]" },
  green: { bar: "bg-[var(--success)]", value: "text-[var(--success-text)]", chip: "bg-[var(--success-soft)] text-[var(--success-text)]", mini: "bg-[var(--success)]" },
  red: { bar: "bg-[var(--danger)]", value: "text-[var(--danger-text)]", chip: "bg-[var(--danger-soft)] text-[var(--danger-text)]", mini: "bg-[var(--danger)]" },
  amber: { bar: "bg-[var(--warning)]", value: "text-[var(--warning-text)]", chip: "bg-[var(--warning-soft)] text-[var(--warning-text)]", mini: "bg-[var(--warning)]" },
};

// Mock 7 günlük mini seriler + "düne göre" değişimler (good: değişim olumlu mu?)
const KPI_META = {
  toplam: { series: [40, 52, 47, 60, 58, 71, 76], txt: "%6,4", up: true, good: true },
  basarili: { series: [38, 49, 45, 57, 55, 68, 73], txt: "%7,1", up: true, good: true },
  basarisiz: { series: [9, 8, 10, 7, 8, 6, 5], txt: "%2,3", up: false, good: true },
  iptal: { series: [2, 3, 2, 3, 2, 3, 4], txt: "%0,8", up: true, good: false },
  iade: { series: [4, 3, 3, 2, 3, 2, 2], txt: "%1,2", up: false, good: true },
};

// Haftalık hacim (bin ₺). Grafik ekseni 0 – 1M.
const WEEK = [
  { d: "Pzt", k: 512 },
  { d: "Sal", k: 644 },
  { d: "Çar", k: 446 },
  { d: "Per", k: 751 },
  { d: "Cum", k: 826 },
  { d: "Cmt", k: 330 },
  { d: "Paz", k: 231 },
];
const AXIS_MAX = 1000;
const AXIS_TICKS = ["1M", "750K", "500K", "250K", "0"];
const PERIODS = ["Bugün", "Bu Hafta", "Bu Ay"];

// Menüde "Yönetim" bölümüne giren öğeler
const MANAGE_ICONS = new Set(["dealer", "settings", "megaphone"]);

const CARD = "rounded-xl bg-[var(--surface)] ring-1 ring-[var(--border)] [box-shadow:var(--shadow)]";
const LIFT = "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-hover)] motion-reduce:transform-none";
const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]";
const SIDE_FOCUS = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";
const GHOST = `grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--brand-softer)] hover:text-[var(--brand-text)] ${FOCUS}`;
const MENU_ITEM = `flex min-h-[34px] w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[12.5px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--brand-softer)] hover:text-[var(--brand-text)] ${FOCUS}`;

function pillTone(durum) {
  if (durum === "Başarılı" || durum === "Onaylandı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Başarısız" || durum === "Reddedildi") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  if (durum === "Üst Onaya İletildi") return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  return "bg-[var(--warning-soft)] text-[var(--warning-text)]"; // İptal / İade / Onayda
}

// "₺ 4.284.900" → 4284900
function parseAmount(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toLocaleUpperCase("tr-TR");
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

function useDismiss(open, close) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);
}

function TrendArrow({ up }) {
  return (
    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      {up ? <path d="M5 1.5 9 8H1z" /> : <path d="M5 8.5 1 2h8z" />}
    </svg>
  );
}

// N Kolay logosu (CDN). Tek renk mavi SVG; lacivert zeminlerde beyaza çevrilir.
const NK_LOGO = "https://cdn.nkolayislem.com.tr/e-full-logo.svg";

function NkLogo({ className = "h-7" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={NK_LOGO} alt="N Kolay" className={`w-auto shrink-0 ${className}`} style={{ filter: "brightness(0) invert(1)" }} />
  );
}

function Monogram() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2B4BF2] text-xs font-extrabold text-white" aria-hidden="true">
      N
    </span>
  );
}

// ---- sol menü ----------------------------------------------------------------------------
// Açılır (akordiyon) grup. Menü daraltılmışsa yalnızca ikon görünür.
function NavGroup({ entry, open, collapsed, onToggle }) {
  const id = `kl-grp-${entry.icon}`;
  const hideLg = collapsed ? "lg:hidden" : "";
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        title={entry.label}
        className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white ${
          open ? "text-white" : "text-[var(--sidebar-fg)]"
        } ${collapsed ? "lg:justify-center lg:px-0" : ""} ${SIDE_FOCUS}`}
      >
        <I name={entry.icon} size={17} />
        <span className={`flex-1 text-left ${hideLg}`}>{entry.label}</span>
        <I
          name="chevronRight"
          size={13}
          className={`opacity-60 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""} ${hideLg}`}
        />
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } ${hideLg}`}
      >
        <div className="overflow-hidden">
          <ul className="mb-1 ml-[20px] mt-0.5 space-y-px border-l border-[var(--sidebar-border)] pl-2.5">
            {entry.items.map((i) => (
              <li key={i.href}>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  className={`flex h-[34px] w-full items-center rounded-md px-2.5 text-left text-[12.5px] text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white ${SIDE_FOCUS}`}
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
      <p className={`px-3 pb-1 pt-4 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--sidebar-muted)] ${collapsed ? "lg:hidden" : ""}`}>
        {label}
      </p>
      {collapsed && <div className="mx-1 my-2.5 hidden border-t border-[var(--sidebar-border)] lg:block" aria-hidden="true" />}
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
              className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] transition-colors ${
                entry.href === "/dashboard"
                  ? "bg-[#2B4BF2] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(43,75,242,0.9)]"
                  : "font-medium text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-hover)] hover:text-white"
              } ${collapsed ? "lg:justify-center lg:px-0" : ""} ${SIDE_FOCUS}`}
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
      {mobileOpen && <div className="fixed inset-0 z-[55] bg-[#0A1568]/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Ana menü"
        inert={hidden ? "" : undefined}
        className={`fixed inset-y-0 left-0 z-[60] flex w-64 shrink-0 flex-col overflow-hidden bg-[var(--sidebar)] transition-[transform,width] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:bottom-auto lg:left-auto lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:self-start ${
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* derinlik için hafif ışıma */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#2B4BF2] opacity-30 blur-3xl" aria-hidden="true" />

        <div className={`relative flex h-14 shrink-0 items-center gap-2.5 pl-4 pr-2.5 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          {/* daraltılmış şeritte yalnızca "N" işareti, açıkken tam logo */}
          {collapsed && (
            <span className="hidden lg:block">
              <Monogram />
            </span>
          )}
          <div className={`flex-1 ${hideLg}`}>
            <NkLogo />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white lg:hidden ${SIDE_FOCUS}`}
          >
            <I name="x" size={16} />
          </button>
        </div>

        {/* ana firma — her rolde göz önünde: beyaz kart, büyük logo */}
        <div className={`relative mx-3 mt-1 flex shrink-0 items-center gap-3 rounded-xl bg-white p-3 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] ${hideLg}`}>
          <CompanyLogo name={anaFirma.ad} size={48} className="shrink-0" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-bold text-[#0F1E8A]">{anaFirma.ad}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-[#64748B]">Ana Firma · B2B Bayi Ağı</p>
          </div>
        </div>
        {/* menü daraltılmışken yalnızca ana firma logosu */}
        {collapsed && (
          <div className="relative mt-1 hidden justify-center lg:flex" title={anaFirma.ad}>
            <CompanyLogo name={anaFirma.ad} size={40} tone="light" />
          </div>
        )}
        {/* bayi / alt bayi girişinde kullanıcının kendi firması */}
        {role !== ROLES.ANA_FIRMA && (
          <div className={`relative mx-3 mt-2 flex shrink-0 items-center gap-2.5 rounded-lg bg-[var(--sidebar-card)] px-2.5 py-2 ring-1 ring-[var(--sidebar-border)] ${hideLg}`}>
            <CompanyLogo name={meta.company} color={meta.logoColor} size={32} tone="light" className="shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[12.5px] font-semibold text-white">{meta.company}</span>
              <span className="block text-[10.5px] leading-snug text-[var(--sidebar-muted)]">
                {meta.label} · {meta.parentNote}
              </span>
            </span>
          </div>
        )}

        <nav
          className={`relative flex-1 overflow-y-auto overscroll-contain px-3 pb-3 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--sidebar-scroll)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--sidebar-scroll)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 ${
            collapsed ? "lg:px-3.5" : ""
          }`}
        >
          <NavSection label="İşlemler" entries={main} collapsed={collapsed} openGroup={openGroup} onGroup={onGroup} />
          <NavSection label="Yönetim" entries={manage} collapsed={collapsed} openGroup={openGroup} onGroup={onGroup} />
        </nav>

        <div className={`relative flex shrink-0 items-center gap-2.5 border-t border-[var(--sidebar-border)] p-3 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#2B4BF2] text-[10px] font-bold text-white">{meta.short}</span>
          <span className={`min-w-0 flex-1 leading-tight ${hideLg}`}>
            <span className="block truncate text-[12.5px] font-semibold text-white">{meta.user}</span>
            <span className="block truncate text-[11px] text-[var(--sidebar-muted)]">Çevrimiçi</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Çıkış yap"
            title="Çıkış yap"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white ${hideLg} ${SIDE_FOCUS}`}
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
        className={`flex h-9 items-center gap-2 rounded-lg pl-1 pr-1.5 transition-colors hover:bg-[var(--brand-softer)] ${FOCUS}`}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-white">{meta.short}</span>
        <span className="hidden max-w-[160px] truncate text-[13px] font-medium text-[var(--fg)] xl:block">{meta.user}</span>
        <I name="chevronDown" size={13} className={`text-[var(--muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="kl-pop absolute right-0 top-full z-40 mt-2 w-56 rounded-xl bg-[var(--surface)] p-1.5 ring-1 ring-[var(--border)] [box-shadow:var(--pop-shadow)]"
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
function KpiCard({ s, index }) {
  const t = TONE[s.tone] || TONE.navy;
  const meta = KPI_META[s.key];
  const max = meta ? Math.max(...meta.series) : 1;
  return (
    <div style={{ "--i": index }} className={`kl-rise relative overflow-hidden px-4 py-3.5 ${CARD} ${LIFT}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${t.bar}`} aria-hidden="true" />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-medium text-[var(--muted)]">{s.label}</p>
        <span className={`whitespace-nowrap rounded-full px-1.5 py-px text-[10.5px] font-semibold tabular-nums ${t.chip}`}>{s.count} adet</span>
      </div>
      <p className={`mt-2 text-[21px] font-extrabold leading-none tracking-tight tabular-nums ${t.value}`}>
        <Money value={s.value} />
      </p>
      {meta && (
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <p className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <span className={`inline-flex items-center gap-0.5 font-semibold ${meta.good ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
              <TrendArrow up={meta.up} />
              {meta.txt}
            </span>
            düne göre
          </p>
          {/* son 7 gün mini çubukları */}
          <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
            {meta.series.map((v, i) => (
              <span key={i} className="flex h-full w-[5px] items-end">
                <span
                  style={{ "--i": i, height: `${Math.max((v / max) * 100, 12)}%` }}
                  className={`kl-grow w-full rounded-full ${t.mini} ${i === meta.series.length - 1 ? "opacity-100" : "opacity-35"}`}
                />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard() {
  const [period, setPeriod] = useState("Bu Hafta");
  const maxK = Math.max(...WEEK.map((w) => w.k));
  const total = WEEK.reduce((a, w) => a + w.k, 0);
  return (
    <section style={{ "--i": 6 }} className={`kl-rise lg:col-span-2 ${CARD}`} aria-labelledby="kl-chart-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5">
        <div>
          <h2 id="kl-chart-title" className="text-[15px] font-semibold text-[var(--navy-text)]">
            Haftalık İşlem Hacmi
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Son 7 gün · toplam ₺ {(total / 1000).toFixed(2).replace(".", ",")}M</p>
        </div>
        <div role="group" aria-label="Dönem" className="flex h-8 items-center rounded-lg bg-[var(--surface-2)] p-0.5 ring-1 ring-[var(--border)]">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`h-7 whitespace-nowrap rounded-md px-2.5 text-[11.5px] transition ${
                period === p ? "bg-[var(--surface)] font-semibold text-[var(--navy-text)] shadow-sm" : "font-medium text-[var(--muted)] hover:text-[var(--fg)]"
              } ${FOCUS}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 p-5">
        <div className="flex h-60 flex-col justify-between text-right text-[10.5px] tabular-nums leading-none text-[var(--muted)]" aria-hidden="true">
          {AXIS_TICKS.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-60">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
              {AXIS_TICKS.map((t, i) => (
                <span key={t} className={`border-t ${i === AXIS_TICKS.length - 1 ? "border-[var(--border-strong)]" : "border-dashed border-[var(--border)]"}`} />
              ))}
            </div>
            <div className="relative flex h-full items-end justify-around gap-2">
              {WEEK.map((w, i) => (
                <div key={w.d} className="group flex h-full flex-1 items-end justify-center">
                  <div className="relative w-full max-w-[38px]" style={{ height: `${(w.k / AXIS_MAX) * 100}%` }}>
                    <div
                      style={{ "--i": i }}
                      className={`kl-grow h-full w-full rounded-t-md bg-[linear-gradient(to_top,var(--chart-from),var(--chart-to))] transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:brightness-110 ${
                        w.k === maxK ? "opacity-100" : "opacity-80"
                      }`}
                    />
                    <span
                      className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--navy)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white transition-all duration-200 ${
                        w.k === maxK ? "opacity-100" : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                      }`}
                    >
                      ₺ {w.k}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-around gap-2 text-[11px] font-medium text-[var(--muted)]">
            {WEEK.map((w) => (
              <span key={w.d} className="flex-1 text-center">
                {w.d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BalanceCard({ role }) {
  const bakiye = bakiyeOzet[role];
  const meta = ROLE_META[role];
  return (
    <section style={{ "--i": 7 }} className={`kl-rise flex flex-col ${CARD}`} aria-labelledby="kl-balance-title">
      <div className="border-b border-[var(--border)] px-5 py-3.5">
        <h2 id="kl-balance-title" className="text-[15px] font-semibold text-[var(--navy-text)]">
          Bakiye ve Borç
        </h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{role === ROLES.ANA_FIRMA ? "Firma limiti" : "Üst cari görünümü"}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {/* banka kartı görünümü */}
        <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#0A1568_0%,#0F1E8A_45%,#2B4BF2_100%)] p-4 text-white [box-shadow:0_14px_28px_-16px_rgba(15,30,138,0.9)]">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#4F6BFF] opacity-40 blur-2xl" aria-hidden="true" />
          <span className="kl-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/10" aria-hidden="true" />
          <div className="relative flex items-center justify-between">
            <span className="h-6 w-8 rounded-[5px] bg-[linear-gradient(135deg,#FDE68A,#D97706)] opacity-90" aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-[0.18em] text-white/80">N KOLAY BAYİM</span>
          </div>
          <p className="relative mt-4 text-[11px] font-medium text-white/70">Kullanılabilir Bakiye</p>
          <p className="relative mt-1 text-[22px] font-extrabold leading-none tracking-tight tabular-nums">
            <Money value={bakiye.bakiye} />
          </p>
          <div className="relative mt-4 flex items-end justify-between gap-2 text-[11px]">
            <span className="truncate font-medium text-white/85">{meta.company}</span>
            <span className="shrink-0 tabular-nums text-white/70">%{bakiye.kullanim} kullanım</span>
          </div>
        </div>

        <dl className="mt-4 space-y-2.5 text-[12.5px]">
          <div className="flex items-center justify-between">
            <dt className="text-[var(--muted)]">Güncel Borç</dt>
            <dd className="font-semibold tabular-nums text-[var(--danger-text)]">{bakiye.borc}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[var(--muted)]">Ödeme Limiti</dt>
            <dd className="font-semibold tabular-nums text-[var(--navy-text)]">{bakiye.limit}</dd>
          </div>
        </dl>

        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex justify-between text-[11px] text-[var(--muted)]">
            <span>Limit Kullanımı</span>
            <span className="font-semibold tabular-nums text-[var(--fg-2)]">%{bakiye.kullanim}</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[var(--brand-soft)]"
            role="progressbar"
            aria-valuenow={bakiye.kullanim}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Limit kullanımı"
          >
            <div className="kl-fill h-full rounded-full bg-[linear-gradient(90deg,var(--chart-from),var(--chart-to))]" style={{ width: `${bakiye.kullanim}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TransactionsCard() {
  return (
    <section style={{ "--i": 8 }} className={`kl-rise overflow-hidden lg:col-span-2 ${CARD}`} aria-labelledby="kl-tx-title">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <div>
          <h2 id="kl-tx-title" className="text-[15px] font-semibold text-[var(--navy-text)]">
            Son İşlemler
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">En güncel 6 işlem</p>
        </div>
        <button
          type="button"
          className={`group inline-flex h-8 items-center gap-1 rounded-lg bg-[var(--brand-soft)] px-3 text-xs font-semibold text-[var(--brand-text)] transition hover:brightness-95 ${FOCUS}`}
        >
          Tümünü Gör
          <I name="chevronRight" size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[12.5px]">
          <thead>
            <tr className="border-y border-[var(--border)] bg-[var(--surface-2)] text-left text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Müşteri</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">İşlem</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Kart</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Taksit</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5 text-right">Tutar</th>
              <th scope="col" className="whitespace-nowrap px-5 py-2.5">Durum</th>
            </tr>
          </thead>
          <tbody>
            {islemler.slice(0, 6).map((t, i) => (
              <tr key={t.id} className={`transition-colors hover:bg-[var(--brand-softer)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                <td className="whitespace-nowrap px-5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--navy-soft)] text-[10px] font-bold text-[var(--navy-text)]" aria-hidden="true">
                      {initials(t.musteri)}
                    </span>
                    <span className="leading-tight">
                      <span className="block font-semibold text-[var(--fg)]">{t.musteri}</span>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.cari}</span>
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-2.5 leading-tight">
                  <span className="block font-medium text-[var(--brand-text)]">{t.id}</span>
                  <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.tarih}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-2.5 leading-tight">
                  <span className="block tabular-nums text-[var(--fg-2)]">{t.kart}</span>
                  <span className="block text-[11px] text-[var(--muted)]">{t.tip}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-2.5 text-[var(--fg-2)]">{t.taksit}</td>
                <td className="whitespace-nowrap px-5 py-2.5 text-right font-semibold tabular-nums text-[var(--fg)]">{t.tutar}</td>
                <td className="whitespace-nowrap px-5 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${pillTone(t.durum)}`}>{t.durum}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Onay bekleyen iptal / iade talepleri. Alt bayi yalnızca kendi taleplerinin durumunu görür.
function ApprovalsCard({ role }) {
  const canApprove = role !== ROLES.ALT_BAYI;
  const talepler = iptalIadeTalepleri.filter((t) => t.durum === "Onayda" || t.durum === "Üst Onaya İletildi").slice(0, 3);
  // bu oturumda verilen kararlar (mockup — kalıcı değildir)
  const [decisions, setDecisions] = useState({});
  const decide = (id, d) => setDecisions((prev) => ({ ...prev, [id]: d }));
  const acik = talepler.filter((t) => !decisions[t.id]).length;

  return (
    <section style={{ "--i": 9 }} className={`kl-rise ${CARD}`} aria-labelledby="kl-approve-title">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-5 py-3.5">
        <h2 id="kl-approve-title" className="text-[15px] font-semibold text-[var(--navy-text)]">
          {canApprove ? "Onay Bekleyenler" : "Taleplerim"}
        </h2>
        <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--warning-text)]">
          {canApprove ? `${acik} açık` : `${talepler.length} talep`}
        </span>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {talepler.map((t) => {
          const d = decisions[t.id];
          return (
            <li key={t.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[12.5px] font-semibold text-[var(--fg)]">{t.talepEden}</p>
                <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
                  {t.tur} · <span className="tabular-nums">{t.tutar}</span> · {t.aciklama}
                </p>
              </div>
              {!canApprove ? (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${pillTone(t.durum)}`}>{t.durum}</span>
              ) : d ? (
                <span className={`kl-pop shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${pillTone(d)}`}>{d}</span>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => decide(t.id, "Onaylandı")}
                    aria-label={`${t.talepEden} talebini onayla`}
                    title="Onayla"
                    className={`grid h-8 w-8 place-items-center rounded-lg bg-[var(--success-soft)] text-[var(--success-text)] transition active:scale-90 hover:brightness-95 ${FOCUS}`}
                  >
                    <I name="check" size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(t.id, "Reddedildi")}
                    aria-label={`${t.talepEden} talebini reddet`}
                    title="Reddet"
                    className={`grid h-8 w-8 place-items-center rounded-lg bg-[var(--danger-soft)] text-[var(--danger-text)] transition active:scale-90 hover:brightness-95 ${FOCUS}`}
                  >
                    <I name="x" size={15} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RatesCard() {
  return (
    <section style={{ "--i": 10 }} className={`kl-rise flex-1 ${CARD}`} aria-labelledby="kl-rates-title">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-5 py-3.5">
        <h2 id="kl-rates-title" className="text-[15px] font-semibold text-[var(--navy-text)]">
          Kur Bilgisi
        </h2>
        <span className="text-[11px] text-[var(--muted)]">Satış</span>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {kurBilgisi.map((k) => (
          <li key={k.code} className="flex items-center gap-3 px-5 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--navy-soft)] text-[10px] font-bold text-[var(--navy-text)]" aria-hidden="true">
              {k.code}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--fg-2)]">{k.name}</span>
            <span className="text-[12.5px] font-semibold tabular-nums text-[var(--fg)]">₺ {k.satis}</span>
            <span className={`w-14 text-right text-[11px] font-semibold tabular-nums ${k.up ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>{k.change}</span>
          </li>
        ))}
      </ul>
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
      if (q === "rail" || (q !== "open" && localStorage.getItem("nkb-klasik-menu") === "rail")) setCollapsedState(true);
      return () => mq.removeEventListener("change", sync);
    } catch (e) {
      return undefined;
    }
  }, []);

  const setCollapsed = (next) => {
    setCollapsedState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try {
        localStorage.setItem("nkb-klasik-menu", value ? "rail" : "open");
      } catch (e) {}
      return value;
    });
  };
  const toggleMenu = () => (isDesktop ? setCollapsed((c) => !c) : setMobileOpen((o) => !o));
  const menuLabel = isDesktop ? (collapsed ? "Menüyü genişlet" : "Menüyü daralt") : "Menüyü aç";

  const selectCls = `h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[12.5px] text-[var(--fg-2)] ${FOCUS}`;

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

      <div className="flex min-w-0 flex-1 flex-col">
        {/* üst bar */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-1.5 border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:gap-2 lg:px-5">
          <button type="button" onClick={toggleMenu} aria-label={menuLabel} title={menuLabel} className={GHOST}>
            <I name="panel" size={17} />
          </button>
          <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={GHOST}>
            <I name="arrowLeft" size={17} />
          </Link>

          {/* dar ekranda menü çekmecede olduğu için ana firma üst barda görünür */}
          <div className="ml-1 flex shrink-0 items-center gap-2 lg:hidden">
            <CompanyLogo name={anaFirma.ad} size={30} className="shrink-0" />
            <span className="hidden text-[13px] font-bold text-[var(--navy-text)] sm:block">{anaFirma.ad}</span>
          </div>

          <label className="relative ml-1.5 hidden min-w-0 max-w-xs flex-1 md:block">
            <span className="sr-only">Ara</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <I name="search" size={15} />
            </span>
            <input
              type="search"
              placeholder="İşlem, cari veya müşteri ara"
              className="h-9 w-full rounded-lg border border-transparent bg-[var(--surface-2)] pl-9 pr-3 text-[12.5px] text-[var(--fg)] outline-none ring-1 ring-[var(--border)] transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:bg-[var(--surface)]"
            />
          </label>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            {/* rol değiştirici — menü ve veriler role göre değişir */}
            <div role="group" aria-label="Panel tipi" className="mr-1 flex h-9 items-center rounded-lg bg-[var(--surface-2)] p-0.5 ring-1 ring-[var(--border)]">
              {ROLE_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={`h-8 whitespace-nowrap rounded-md px-2.5 text-xs transition-all duration-200 active:scale-95 sm:px-3 ${
                    role === r ? "bg-[var(--navy)] font-semibold text-white shadow-sm" : "font-medium text-[var(--muted)] hover:text-[var(--navy-text)]"
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
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />
              </span>
            </button>
            <span className="mx-0.5 hidden h-5 w-px bg-[var(--border-strong)] sm:block" aria-hidden="true" />
            <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />
          </div>
        </header>

        {/* key={role}: rol değişince giriş animasyonları yeniden oynar */}
        <main key={role} className="flex-1 px-4 py-5 lg:px-7 lg:py-6">
          <div className="mx-auto max-w-[1320px]">
            <div className="kl-rise mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--muted)]">
                  {meta.label} Paneli
                  <I name="chevronRight" size={11} />
                  <span className="text-[var(--brand-text)]">Ana Sayfa</span>
                </p>
                <h1 className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-[var(--navy-text)]">Ana Sayfa</h1>
                <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{meta.company} · Bugünkü işlem özeti</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {role === ROLES.BAYI && (
                  <select aria-label="Ana firma cari seçimi" defaultValue="" className={selectCls}>
                    <option value="">Ana Firma Cari Seçimi</option>
                    <option>Brisa A.Ş. — 320.00.001</option>
                    <option>Brisa Perakende — 320.00.002</option>
                  </select>
                )}
                {role === ROLES.ALT_BAYI && (
                  <select aria-label="Bayi cari seçimi" defaultValue="" className={selectCls}>
                    <option value="">Bayi Cari Seçimi</option>
                    <option>Ankara Lastik Bayi — 320.01.001</option>
                  </select>
                )}
                <button
                  type="button"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--navy-text)] ring-1 ring-[var(--border-strong)] transition active:scale-[0.97] hover:bg-[var(--surface-2)] ${FOCUS}`}
                >
                  <I name="download" size={14} />
                  Dışa Aktar
                </button>
                <button
                  type="button"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-[12.5px] font-semibold text-white transition [box-shadow:0_8px_18px_-10px_rgba(43,75,242,0.9)] active:scale-[0.97] hover:brightness-110 ${FOCUS}`}
                >
                  <I name="plus" size={14} />
                  Ödeme Al
                </button>
              </div>
            </div>

            {/* KPI kartları — sol şerit + renkli değer + mini çubuklar */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {stats.map((s, i) => (
                <KpiCard key={s.key} s={s} index={i + 1} />
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <ChartCard />
              <BalanceCard role={role} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <TransactionsCard />
              <div className="flex flex-col gap-3">
                <ApprovalsCard role={role} />
                <RatesCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginView({ isDark, onToggleTheme, onLogin }) {
  const inputCls =
    "h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";
  return (
    <div className="relative flex flex-1 flex-col lg:flex-row">
      {/* küçük kontroller */}
      <Link
        href="/designs"
        aria-label="Tasarımlara dön"
        title="Tasarımlara dön"
        className={`absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white ${SIDE_FOCUS}`}
      >
        <I name="arrowLeft" size={17} />
      </Link>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
        title={isDark ? "Açık mod" : "Koyu mod"}
        className={`${GHOST} absolute right-4 top-4 z-10 max-lg:text-white/80 max-lg:hover:bg-white/10 max-lg:hover:text-white`}
      >
        <I name={isDark ? "sun" : "moon"} size={16} />
      </button>

      {/* marka paneli */}
      <div className="relative overflow-hidden bg-[#0A1568] px-8 pb-12 pt-20 text-white lg:w-1/2 lg:px-14 lg:pb-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(43,75,242,0.55),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(79,107,255,0.4),transparent_40%)]" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:44px_44px]"
          aria-hidden="true"
        />
        <div className="relative flex h-full flex-col justify-between gap-12">
          <div className="flex items-center gap-2.5">
            <NkLogo className="h-9" />
          </div>
          <div className="kl-rise">
            <div className="mb-7 flex items-center gap-4">
              <CompanyLogo name={anaFirma.ad} size={72} tone="light" className="shrink-0 shadow-[0_16px_32px_-14px_rgba(0,0,0,0.6)]" />
              <div className="leading-tight">
                <p className="text-[24px] font-extrabold tracking-tight">{anaFirma.ad}</p>
                <p className="mt-1 text-[13px] text-slate-300">{anaFirma.aciklama}</p>
              </div>
            </div>
            <span className="inline-block rounded-full bg-[#2B4BF2]/25 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#EAEFFF] ring-1 ring-[#2B4BF2]/40">
              B2B ÖDEME PANELİ
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Bayi ağınızı
              <br />
              tek panelden yönetin
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Ana firma, bayi ve alt bayi hiyerarşisi; manuel ve link ile ödeme, iptal / iade onayları, vade farkı profilleri
              ve raporlar tek yerde.
            </p>
            <dl className="mt-8 flex gap-10">
              {[
                ["3", "Panel Tipi"],
                ["7/24", "Ödeme"],
                ["5", "Vade Profili"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-2xl font-extrabold">{n}</dd>
                  <dd className="text-xs text-slate-400">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="text-xs text-slate-400">© 2026 pay{"'"}n kolay · N Kolay Bayim</p>
        </div>
      </div>

      {/* form */}
      <div className="flex flex-1 items-center justify-center bg-[var(--surface)] px-6 py-12">
        <form
          style={{ "--i": 1 }}
          className="kl-rise w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-[var(--navy-text)]">Giriş Yap</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Panel bilgilerinizle oturum açın.</p>
          <label className="mt-8 block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--fg-2)]">E-posta adresi</span>
            <input type="email" defaultValue="yonetici@brisa.com" autoComplete="email" className={inputCls} />
          </label>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-[var(--fg-2)]">Şifre</span>
            <input type="password" defaultValue="123456" autoComplete="current-password" className={inputCls} />
          </label>
          <div className="mt-4 flex items-center justify-between text-[12.5px]">
            <label className="flex min-h-[36px] items-center gap-2 text-[var(--fg-2)]">
              <input type="checkbox" className="h-4 w-4 rounded accent-[#2B4BF2]" />
              Beni hatırla
            </label>
            <a href="#" onClick={(e) => e.preventDefault()} className={`rounded font-semibold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
              Şifremi unuttum
            </a>
          </div>
          <button
            type="submit"
            className={`mt-6 h-11 w-full rounded-lg bg-[var(--navy)] text-[13px] font-semibold text-white transition [box-shadow:0_10px_20px_-12px_rgba(15,30,138,0.9)] active:scale-[0.98] hover:brightness-110 ${FOCUS}`}
          >
            Giriş Yap
          </button>
          <p className="mt-6 text-center text-[11.5px] text-[var(--muted)]">Demo mockup — herhangi bir bilgiyle panele geçilir.</p>
        </form>
      </div>
    </div>
  );
}

export default function KlasikDesign() {
  const { role, setRole } = useRole();
  const [view, setView] = useState("Panel");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      // ?theme=dark | ?theme=light ve ?view=giris bağlantıyla durumu zorlar (paylaşım / önizleme için)
      const params = new URLSearchParams(window.location.search);
      const q = params.get("theme");
      const s = localStorage.getItem("nkb-theme-klasik");
      if (q === "dark" || q === "light") setIsDark(q === "dark");
      else if (s) setIsDark(s === "dark");
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
      if (params.get("view") === "giris") setView("Giriş");
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("nkb-theme-klasik", isDark ? "dark" : "light");
    } catch (e) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <>
      <Head>
        <title>Tasarım 05 · Klasik — N Kolay Bayim</title>
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

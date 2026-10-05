import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Icon from "@/components/Icons";
import { useRole } from "@/components/RoleContext";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import CompanyLogo from "@/components/CompanyLogo";
import { kpis, islemler, bakiyeOzet, anaFirma } from "@/lib/mockData";

// Tasarım 01 — temel /dashboard mockup'ının Figma marka paletiyle geliştirilmiş hali.
// Açılır kapanır sol menü (akordiyon gruplar), ince üst bar, açık / koyu mod.

const light = {
  "--bg": "#F4F3FE",
  "--surface": "#FFFFFF",
  "--surface-2": "#F5F5F6",
  "--fg": "#1E1E1E",
  "--fg-2": "#3A434A",
  "--muted": "#6E7A8A",
  "--border": "#EAE8FD",
  "--border-strong": "#D4D1FC",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#0C34E7",
  "--brand-soft": "#EAE8FD",
  "--brand-softer": "#F4F3FE",
  "--bar": "#D4D1FC",
  "--chart": "#0C34E7",
  "--sidebar": "#0C34E7",
  "--sidebar-fg": "rgba(255,255,255,0.84)",
  "--sidebar-muted": "rgba(255,255,255,0.64)",
  "--sidebar-hover": "rgba(255,255,255,0.10)",
  "--sidebar-active-bg": "#FFFFFF",
  "--sidebar-active-fg": "#0C34E7",
  "--sidebar-card": "rgba(255,255,255,0.10)",
  "--sidebar-border": "rgba(255,255,255,0.16)",
  "--sidebar-scroll": "rgba(255,255,255,0.35)",
  "--sidebar-accent": "#D4D1FC",
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
  "--shadow": "0 1px 2px rgba(12,52,231,0.04), 0 8px 24px -18px rgba(12,52,231,0.22)",
  "--pop-shadow": "0 12px 32px -12px rgba(12,52,231,0.28), 0 2px 6px rgba(30,30,30,0.06)",
};

const dark = {
  "--bg": "#0D0F14",
  "--surface": "#16181D",
  "--surface-2": "#1E2027",
  "--fg": "#F5F5F6",
  "--fg-2": "#D8D9DB",
  "--muted": "#B0B4B7",
  "--border": "#262A31",
  "--border-strong": "#3A434A",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#D4D1FC",
  "--brand-soft": "rgba(12,52,231,0.30)",
  "--brand-softer": "rgba(12,52,231,0.14)",
  "--bar": "rgba(76,99,255,0.32)",
  "--chart": "#4C63FF",
  "--sidebar": "#111319",
  "--sidebar-fg": "rgba(255,255,255,0.74)",
  "--sidebar-muted": "rgba(255,255,255,0.52)",
  "--sidebar-hover": "rgba(255,255,255,0.06)",
  "--sidebar-active-bg": "#0C34E7",
  "--sidebar-active-fg": "#FFFFFF",
  "--sidebar-card": "rgba(255,255,255,0.05)",
  "--sidebar-border": "rgba(255,255,255,0.10)",
  "--sidebar-scroll": "rgba(255,255,255,0.22)",
  "--sidebar-accent": "#D4D1FC",
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
  "--shadow": "0 1px 2px rgba(0,0,0,0.4), 0 12px 28px -18px rgba(0,0,0,0.7)",
  "--pop-shadow": "0 16px 40px -12px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)",
};

const TONE = {
  navy: { bar: "bg-[var(--brand)]", chip: "bg-[var(--brand-soft)] text-[var(--brand-text)]" },
  green: { bar: "bg-[var(--success)]", chip: "bg-[var(--success-soft)] text-[var(--success-text)]" },
  red: { bar: "bg-[var(--danger)]", chip: "bg-[var(--danger-soft)] text-[var(--danger-text)]" },
  amber: { bar: "bg-[var(--warning)]", chip: "bg-[var(--warning-soft)] text-[var(--warning-text)]" },
};

// Mock "düne göre" değişimleri — good: değişim olumlu mu?
const TREND = {
  toplam: { txt: "%6,4", up: true, good: true },
  basarili: { txt: "%7,1", up: true, good: true },
  basarisiz: { txt: "%2,3", up: false, good: true },
  iptal: { txt: "%0,8", up: true, good: false },
  iade: { txt: "%1,2", up: false, good: true },
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

const CARD = "rounded-xl border border-[var(--border)] bg-[var(--surface)] [box-shadow:var(--shadow)]";
const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]";
const SIDE_FOCUS = "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";
// Üst bardaki küçük, çerçevesiz ikon düğmesi
const GHOST = `grid h-8 w-8 shrink-0 place-items-center rounded-lg sm:h-9 sm:w-9 text-[var(--muted)] transition-colors hover:bg-[var(--brand-softer)] hover:text-[var(--brand-text)] ${FOCUS}`;

function pillTone(durum) {
  if (durum === "Başarılı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Başarısız") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  return "bg-[var(--warning-soft)] text-[var(--warning-text)]"; // İptal / İade
}

function Wordmark({ onBrand, compact }) {
  return (
    <div className="leading-none">
      <p
        className={`font-semibold tracking-[0.22em] ${compact ? "text-[8px]" : "text-[9px]"} ${
          onBrand ? "text-[var(--sidebar-accent)]" : "text-[var(--brand-text)]"
        }`}
      >
        N KOLAY BAYİM
      </p>
      <p className={`mt-1 font-bold tracking-tight ${compact ? "text-base" : "text-[19px]"} ${onBrand ? "text-white" : "text-[var(--fg)]"}`}>
        pay
        <span className={onBrand ? "text-[var(--sidebar-accent)]" : "text-[var(--brand-text)]"}>{"'n"}</span>
        kolay
      </p>
    </div>
  );
}

function SunMoon({ isDark }) {
  return isDark ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

// Kenar çubuğu aç / kapat simgesi
function PanelIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16" />
    </svg>
  );
}

function TrendArrow({ up }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      {up ? <path d="M5 1.5 9 8H1z" /> : <path d="M5 8.5 1 2h8z" />}
    </svg>
  );
}

// Sol menüdeki açılır (akordiyon) grup
function NavGroup({ entry, open, onToggle }) {
  const id = `nav-grp-${entry.icon}`;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors ${
          open ? "text-white" : "text-[var(--sidebar-fg)]"
        } hover:bg-[var(--sidebar-hover)] hover:text-white ${SIDE_FOCUS}`}
      >
        <Icon name={entry.icon} size={17} />
        <span className="flex-1 text-left">{entry.label}</span>
        <span className={`opacity-70 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`}>
          <Icon name="chevron" size={13} />
        </span>
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="mb-1 ml-[20px] mt-0.5 space-y-px border-l border-[var(--sidebar-border)] pl-2.5">
            {entry.items.map((i) => (
              <li key={i.href}>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  className={`flex min-h-[34px] w-full items-center rounded-md px-2.5 text-left text-[13px] text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white ${SIDE_FOCUS}`}
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

function Sidebar({ role, desktopOpen, mobileOpen, hidden, onClose, onLogout }) {
  const nav = getNav(role);
  const meta = ROLE_META[role];
  // aynı anda tek grup açık kalır — menü kısa kalır, kaydırma ihtiyacı azalır
  const [openGroup, setOpenGroup] = useState("Ödeme Al");

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-[55] bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Ana menü"
        inert={hidden ? "" : undefined}
        className={`fixed inset-y-0 left-0 z-[60] flex w-64 shrink-0 flex-col bg-[var(--sidebar)] transition-[transform,margin] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:bottom-auto lg:left-auto lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:self-start ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopOpen ? "lg:ml-0" : "lg:-ml-64"}`}
      >
        {/* platform markası */}
        <div className="flex h-14 shrink-0 items-center justify-between pl-5 pr-3">
          <Wordmark onBrand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            title="Menüyü kapat"
            className={`grid h-8 w-8 place-items-center rounded-lg text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white ${SIDE_FOCUS}`}
          >
            <span className="rotate-180">
              <Icon name="chevron" size={15} />
            </span>
          </button>
        </div>

        {/* ana firma — her rolde göz önünde: beyaz kart, büyük logo */}
        <div className="mx-3 mt-1 flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]">
          <CompanyLogo size={48} tone="brand" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-bold text-[#1E1E1E]">{anaFirma.ad}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-[#6E7A8A]">Ana Firma · B2B Bayi Ağı</p>
          </div>
        </div>
        {/* bayi / alt bayi girişinde kullanıcının kendi firması */}
        {role !== ROLES.ANA_FIRMA ? (
          <div className="mx-3 mb-3 mt-2 flex items-center gap-2.5 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-card)] px-2.5 py-2">
            <CompanyLogo name={meta.company} color={meta.logoColor} size={32} tone="light" className="shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[12.5px] font-semibold text-white">{meta.company}</span>
              <span className="block text-[10.5px] leading-snug text-[var(--sidebar-muted)]">
                {meta.label} · {meta.parentNote}
              </span>
            </span>
          </div>
        ) : (
          <div className="mb-3 mt-2" />
        )}

        <nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 pb-3 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--sidebar-scroll)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--sidebar-scroll)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          {nav.map((entry) =>
            entry.items ? (
              <NavGroup
                key={entry.label}
                entry={entry}
                open={openGroup === entry.label}
                onToggle={() => setOpenGroup((g) => (g === entry.label ? null : entry.label))}
              />
            ) : (
              <button
                key={entry.label}
                type="button"
                aria-current={entry.href === "/dashboard" ? "page" : undefined}
                className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors ${
                  entry.href === "/dashboard"
                    ? "bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-fg)] shadow-sm"
                    : "font-medium text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-hover)] hover:text-white"
                } ${SIDE_FOCUS}`}
              >
                <Icon name={entry.icon} size={17} />
                <span>{entry.label}</span>
              </button>
            )
          )}
        </nav>

        <div className="shrink-0 border-t border-[var(--sidebar-border)] p-3">
          <button
            type="button"
            onClick={onLogout}
            className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium text-[var(--sidebar-fg)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white ${SIDE_FOCUS}`}
          >
            <Icon name="logout" size={17} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function UserMenu({ meta, isDark, onToggleTheme, onLogout }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const item = `flex min-h-[36px] w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] text-[var(--fg-2)] transition-colors hover:bg-[var(--brand-softer)] hover:text-[var(--brand-text)] ${FOCUS}`;
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
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-[var(--brand-fg)]">{meta.short}</span>
        <span className="hidden max-w-[160px] truncate text-[13px] font-medium text-[var(--fg)] xl:block">{meta.user}</span>
        <span className={`hidden text-[var(--muted)] transition-transform duration-200 sm:block ${open ? "-rotate-90" : "rotate-90"}`}>
          <Icon name="chevron" size={12} />
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 [box-shadow:var(--pop-shadow)]"
          >
            <div className="px-2.5 pb-2 pt-1.5">
              <p className="truncate text-[13px] font-semibold text-[var(--fg)]">{meta.user}</p>
              <p className="truncate text-xs text-[var(--muted)]">{meta.company}</p>
            </div>
            <div className="my-1 border-t border-[var(--border)]" />
            <button type="button" role="menuitem" className={item} onClick={() => setOpen(false)}>
              <Icon name="building" size={15} />
              Firma Bilgileri
            </button>
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                onToggleTheme();
                setOpen(false);
              }}
            >
              <SunMoon isDark={isDark} />
              {isDark ? "Açık moda geç" : "Koyu moda geç"}
            </button>
            <div className="my-1 border-t border-[var(--border)]" />
            <button
              type="button"
              role="menuitem"
              className={`${item} hover:!bg-[var(--danger-soft)] hover:!text-[var(--danger-text)]`}
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <Icon name="logout" size={15} />
              Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PanelView({ role, setRole, isDark, onToggleTheme, onLogout }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const meta = ROLE_META[role];
  const stats = kpis[role];
  const bakiye = bakiyeOzet[role];
  const maxK = Math.max(...WEEK.map((w) => w.k));
  const weekTotal = WEEK.reduce((a, w) => a + w.k, 0);

  useEffect(() => {
    try {
      const mq = window.matchMedia("(min-width: 1024px)");
      const sync = () => setIsDesktop(mq.matches);
      sync();
      mq.addEventListener("change", sync);
      // ?menu=closed | ?menu=open bağlantıyla menü durumunu zorlar
      const q = new URLSearchParams(window.location.search).get("menu");
      if (q === "closed" || (q !== "open" && localStorage.getItem("nkb-atlas-menu") === "closed")) setDesktopOpen(false);
      return () => mq.removeEventListener("change", sync);
    } catch (e) {
      return undefined;
    }
  }, []);

  const setDesktop = (next) => {
    setDesktopOpen(next);
    try {
      localStorage.setItem("nkb-atlas-menu", next ? "open" : "closed");
    } catch (e) {}
  };
  const toggleMenu = () => (isDesktop ? setDesktop(!desktopOpen) : setMobileOpen((o) => !o));
  const closeMenu = () => (isDesktop ? setDesktop(false) : setMobileOpen(false));
  const menuVisible = isDesktop ? desktopOpen : mobileOpen;

  const selectCls = `h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[13px] text-[var(--fg-2)] ${FOCUS}`;

  return (
    <div className="flex flex-1">
      <Sidebar
        role={role}
        desktopOpen={desktopOpen}
        mobileOpen={mobileOpen}
        hidden={!menuVisible}
        onClose={closeMenu}
        onLogout={onLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* üst bar */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-1.5 border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:gap-2 lg:px-5">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuVisible}
            title={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
            className={GHOST}
          >
            <PanelIcon />
          </button>
          <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={GHOST}>
            <ArrowLeft />
          </Link>

          {/* menü kapalıyken marka üst barda görünür */}
          <div
            className={`overflow-hidden transition-[max-width,opacity,margin] duration-300 motion-reduce:transition-none ${
              desktopOpen ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : "lg:ml-2 lg:max-w-[220px] lg:opacity-100"
            } ml-1 block max-w-[220px] shrink-0`}
            aria-hidden={desktopOpen && isDesktop ? "true" : undefined}
          >
            <div className="flex items-center gap-2.5 whitespace-nowrap">
              <CompanyLogo size={34} tone="brand" className="shrink-0" />
              <span className="hidden leading-tight sm:block">
                <span className="block text-[14px] font-bold text-[var(--fg)]">{anaFirma.ad}</span>
                <span className="block text-[10.5px] text-[var(--muted)]">Ana Firma · N Kolay Bayim</span>
              </span>
            </div>
          </div>

          <label className="relative ml-2 hidden w-full max-w-xs md:block">
            <span className="sr-only">Ara</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <Icon name="search" size={15} />
            </span>
            <input
              type="search"
              placeholder="İşlem, cari veya müşteri ara"
              className="h-9 w-full rounded-lg border border-transparent bg-[var(--brand-softer)] pl-9 pr-3 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--border-strong)] focus:border-[var(--brand)] focus:bg-[var(--surface)]"
            />
          </label>

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            {/* rol değiştirici — menü ve veriler role göre değişir */}
            <div role="group" aria-label="Panel tipi" className="mr-1 flex h-9 items-center rounded-lg bg-[var(--brand-softer)] p-0.5">
              {ROLE_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={`h-8 whitespace-nowrap rounded-md px-2 text-[11px] transition sm:px-3 sm:text-xs ${
                    role === r
                      ? "bg-[var(--surface)] font-semibold text-[var(--brand-text)] shadow-sm"
                      : "font-medium text-[var(--muted)] hover:text-[var(--fg)]"
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
              <SunMoon isDark={isDark} />
            </button>
            <button type="button" aria-label="Bildirimler" title="Bildirimler" className={`${GHOST} relative hidden sm:grid`}>
              <Icon name="bell" size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />
            </button>
            <span className="mx-1 hidden h-5 w-px bg-[var(--border-strong)] sm:block" aria-hidden="true" />
            <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-[1320px]">
            {/* başlık + aksiyonlar */}
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">Ana Sayfa</h1>
                <p className="mt-0.5 text-[13px] text-[var(--muted)]">{meta.company} · Bugünkü işlem özeti</p>
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
                <select aria-label="Dönem" defaultValue="Bugün" className={selectCls}>
                  <option>Bugün</option>
                  <option>Bu Hafta</option>
                  <option>Bu Ay</option>
                </select>
                <button
                  type="button"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
                >
                  <Icon name="download" size={15} />
                  Dışa Aktar
                </button>
                <button
                  type="button"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-[13px] font-semibold text-[var(--brand-fg)] shadow-sm transition hover:opacity-90 ${FOCUS}`}
                >
                  <Icon name="plus" size={15} />
                  Ödeme Al
                </button>
              </div>
            </div>

            {/* KPI kartları — ikon yok; ince renk şeridi + adet rozeti + değişim */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {stats.map((s) => {
                const t = TONE[s.tone] || TONE.navy;
                const tr = TREND[s.key];
                return (
                  <div key={s.key} className={`relative px-4 py-3.5 ${CARD}`}>
                    <span className={`absolute bottom-3.5 left-0 top-3.5 w-[3px] rounded-r-full ${t.bar}`} aria-hidden="true" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] text-[var(--muted)]">{s.label}</p>
                      <span className={`whitespace-nowrap rounded-full px-1.5 py-px text-[10.5px] font-semibold ${t.chip}`}>{s.count} adet</span>
                    </div>
                    <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums text-[var(--fg)]">{s.value}</p>
                    {tr && (
                      <p className="mt-1 flex items-center gap-1 text-[11.5px] text-[var(--muted)]">
                        <span className={`inline-flex items-center gap-0.5 font-semibold ${tr.good ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
                          <TrendArrow up={tr.up} />
                          {tr.txt}
                        </span>
                        düne göre
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* haftalık hacim */}
              <section className={`p-5 lg:col-span-2 ${CARD}`} aria-labelledby="atlas-chart-title">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 id="atlas-chart-title" className="text-[15px] font-semibold text-[var(--fg)]">
                      Haftalık İşlem Hacmi
                    </h2>
                    <p className="mt-0.5 text-[13px] text-[var(--muted)]">
                      Son 7 gün · toplam ₺ {(weekTotal / 1000).toFixed(2).replace(".", ",")}M
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11.5px] text-[var(--muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--chart)]" /> En yüksek gün
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--bar)]" /> Diğer günler
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {/* dikey eksen */}
                  <div className="flex h-44 flex-col justify-between text-right text-[10.5px] tabular-nums leading-none text-[var(--muted)]" aria-hidden="true">
                    {AXIS_TICKS.map((t) => (
                      <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="relative h-44">
                      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
                        {AXIS_TICKS.map((t, i) => (
                          <span key={t} className={`border-t ${i === AXIS_TICKS.length - 1 ? "border-[var(--border-strong)]" : "border-dashed border-[var(--border)]"}`} />
                        ))}
                      </div>
                      <div className="relative flex h-full items-end justify-around gap-2">
                        {WEEK.map((w) => (
                          <div key={w.d} className="group flex h-full flex-1 items-end justify-center">
                            <div
                              className={`relative w-full max-w-[34px] rounded-t-md transition-colors group-hover:bg-[var(--chart)] ${
                                w.k === maxK ? "bg-[var(--chart)]" : "bg-[var(--bar)]"
                              }`}
                              style={{ height: `${(w.k / AXIS_MAX) * 100}%` }}
                            >
                              <span
                                className={`absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tabular-nums text-[var(--fg-2)] transition-opacity ${
                                  w.k === maxK ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                              >
                                ₺ {w.k}K
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-around gap-2 text-[11.5px] text-[var(--muted)]">
                      {WEEK.map((w) => (
                        <span key={w.d} className="flex-1 text-center">
                          {w.d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* bakiye ve borç */}
              <section className={`flex flex-col p-5 ${CARD}`} aria-labelledby="atlas-balance-title">
                <h2 id="atlas-balance-title" className="text-[15px] font-semibold text-[var(--fg)]">
                  Bakiye ve Borç
                </h2>
                <p className="mt-0.5 text-[13px] text-[var(--muted)]">{role === ROLES.ANA_FIRMA ? "Firma limiti" : "Üst cari görünümü"}</p>

                <div className="mt-4 rounded-lg bg-[var(--brand-softer)] p-4">
                  <p className="text-xs text-[var(--muted)]">Kullanılabilir Bakiye</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-[var(--brand-text)]">{bakiye.bakiye}</p>
                </div>

                <dl className="mt-4 space-y-2.5 text-[13px]">
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--muted)]">Güncel Borç</dt>
                    <dd className="font-semibold tabular-nums text-[var(--danger-text)]">{bakiye.borc}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--muted)]">Ödeme Limiti</dt>
                    <dd className="font-semibold tabular-nums text-[var(--fg)]">{bakiye.limit}</dd>
                  </div>
                </dl>

                <div className="mt-auto pt-5">
                  <div className="mb-1.5 flex justify-between text-xs text-[var(--muted)]">
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
                    <div className="h-full rounded-full bg-[var(--chart)]" style={{ width: `${bakiye.kullanim}%` }} />
                  </div>
                </div>
              </section>
            </div>

            {/* son işlemler */}
            <section className={`mt-4 overflow-hidden ${CARD}`} aria-labelledby="atlas-tx-title">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <h2 id="atlas-tx-title" className="text-[15px] font-semibold text-[var(--fg)]">
                    Son İşlemler
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[var(--muted)]">En güncel 6 işlem</p>
                </div>
                <button
                  type="button"
                  className={`inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-[var(--brand-text)] transition hover:bg-[var(--brand-softer)] ${FOCUS}`}
                >
                  Tümünü Gör
                  <Icon name="chevron" size={13} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[13px]">
                  <thead>
                    <tr className="border-y border-[var(--border)] bg-[var(--brand-softer)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      <th scope="col" className="whitespace-nowrap px-5 py-2.5">İşlem No</th>
                      <th scope="col" className="whitespace-nowrap px-5 py-2.5">Tarih</th>
                      <th scope="col" className="whitespace-nowrap px-5 py-2.5">Müşteri</th>
                      <th scope="col" className="whitespace-nowrap px-5 py-2.5">Tip</th>
                      <th scope="col" className="whitespace-nowrap px-5 py-2.5">Taksit</th>
                      <th scope="col" className="whitespace-nowrap px-5 py-2.5 text-right">Tutar</th>
                      <th scope="col" className="whitespace-nowrap px-5 py-2.5">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {islemler.slice(0, 6).map((t, i) => (
                      <tr key={t.id} className={`transition-colors hover:bg-[var(--brand-softer)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                        <td className="whitespace-nowrap px-5 py-3 font-medium text-[var(--brand-text)]">{t.id}</td>
                        <td className="whitespace-nowrap px-5 py-3 tabular-nums text-[var(--muted)]">{t.tarih}</td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="block font-medium text-[var(--fg)]">{t.musteri}</span>
                          <span className="block text-[11.5px] tabular-nums text-[var(--muted)]">{t.cari}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-[var(--fg-2)]">{t.tip}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-[var(--fg-2)]">{t.taksit}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums text-[var(--fg)]">{t.tutar}</td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${pillTone(t.durum)}`}>{t.durum}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginView({ isDark, onToggleTheme, onLogin }) {
  const inputCls =
    "h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";
  return (
    <div className="relative flex flex-1 flex-col lg:flex-row">
      {/* küçük kontroller */}
      <Link
        href="/designs"
        aria-label="Tasarımlara dön"
        title="Tasarımlara dön"
        className={`absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white ${SIDE_FOCUS}`}
      >
        <ArrowLeft />
      </Link>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
        title={isDark ? "Açık mod" : "Koyu mod"}
        className={`${GHOST} absolute right-4 top-4 z-10 max-lg:text-white/80 max-lg:hover:bg-white/10 max-lg:hover:text-white`}
      >
        <SunMoon isDark={isDark} />
      </button>

      {/* marka paneli */}
      <div className="relative overflow-hidden bg-[#0C34E7] px-8 pb-12 pt-20 text-white lg:w-1/2 lg:px-14 lg:pb-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:44px_44px]"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D4D1FC] opacity-20 blur-3xl" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between gap-12">
          <Wordmark onBrand />
          <div>
            {/* ana firma — büyük logo */}
            <div className="mb-7 flex items-center gap-4">
              <CompanyLogo size={72} tone="light" className="shadow-[0_16px_32px_-14px_rgba(0,0,0,0.5)]" />
              <div className="leading-tight">
                <p className="text-[24px] font-bold tracking-tight">{anaFirma.ad}</p>
                <p className="mt-1 text-[13px] text-white/80">{anaFirma.aciklama}</p>
              </div>
            </div>
            <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#EAE8FD]">
              B2B ÖDEME PANELİ
            </span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Bayi ağınızı
              <br />
              tek panelden yönetin
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
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
                  <dd className="text-2xl font-semibold">{n}</dd>
                  <dd className="text-xs text-white/70">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="text-[11px] text-white/60">N Kolay Bayim altyapısı · © 2026 pay{"'"}n kolay</p>
        </div>
      </div>

      {/* form */}
      <div className="flex flex-1 items-center justify-center bg-[var(--surface)] px-6 py-12">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">Giriş Yap</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Panel bilgilerinizle oturum açın.</p>

          <label className="mt-8 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--fg-2)]">E-posta adresi</span>
            <input type="email" defaultValue="yonetici@brisa.com" autoComplete="email" className={inputCls} />
          </label>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--fg-2)]">Şifre</span>
            <input type="password" defaultValue="123456" autoComplete="current-password" className={inputCls} />
          </label>

          <div className="mt-4 flex items-center justify-between text-[13px]">
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
            className={`mt-6 h-11 w-full rounded-lg bg-[var(--brand)] text-sm font-semibold text-[var(--brand-fg)] shadow-sm transition hover:opacity-90 ${FOCUS}`}
          >
            Giriş Yap
          </button>
          <p className="mt-6 text-center text-xs text-[var(--muted)]">Demo mockup — herhangi bir bilgiyle panele geçilir.</p>
        </form>
      </div>
    </div>
  );
}

export default function AtlasDesign() {
  const { role, setRole } = useRole();
  const [view, setView] = useState("Panel");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      // ?theme=dark | ?theme=light ve ?view=giris bağlantıyla durumu zorlar (paylaşım / önizleme için)
      const params = new URLSearchParams(window.location.search);
      const q = params.get("theme");
      const s = localStorage.getItem("nkb-theme-atlas");
      if (q === "dark" || q === "light") setIsDark(q === "dark");
      else if (s) setIsDark(s === "dark");
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
      if (params.get("view") === "giris") setView("Giriş");
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("nkb-theme-atlas", isDark ? "dark" : "light");
    } catch (e) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <>
      <Head>
        <title>Tasarım 01 · Atlas — N Kolay Bayim</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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

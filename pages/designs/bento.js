import { useEffect, useState } from "react";
import Head from "next/head";
import I from "@/components/DesignIcons";
import { useRole } from "@/components/RoleContext";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import CompanyLogo from "@/components/CompanyLogo";
import { kpis, islemler, bakiyeOzet, anaFirma } from "@/lib/mockData";

// N Kolay Bayim paneli — seçilen tasarım: Bento (Tasarım 03). Diğer tasarımlar arsiv/ klasöründe.
// Lavanta zemin üzerinde yüzen yuvarlak paneller, renkli KPI blokları.
// Açılır kapanır sol menü, ince yüzen üst bar, giriş animasyonları, açık / koyu mod.

const light = {
  "--bg": "#F4F3FE",
  "--surface": "#FFFFFF",
  "--soft": "#F4F3FE",
  "--soft-2": "#EAE8FD",
  "--fg": "#1E1E1E",
  "--fg-2": "#3A434A",
  "--muted": "#6E7A8A",
  "--border": "#EAE8FD",
  "--border-strong": "#D4D1FC",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#0C34E7",
  "--brand-soft": "#EAE8FD",
  "--chart-from": "#0C34E7",
  "--chart-to": "#6A7BFF",
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
  "--shadow": "0 1px 2px rgba(12,52,231,0.04), 0 10px 30px -20px rgba(12,52,231,0.30)",
  "--shadow-hover": "0 2px 4px rgba(12,52,231,0.06), 0 18px 36px -18px rgba(12,52,231,0.42)",
  "--pop-shadow": "0 14px 36px -12px rgba(12,52,231,0.30), 0 2px 6px rgba(30,30,30,0.06)",
  "--logo-filter": "none",
};

const dark = {
  "--bg": "#0E1017",
  "--surface": "#181A22",
  "--soft": "#20232E",
  "--soft-2": "#2A2E3C",
  "--fg": "#F5F5F6",
  "--fg-2": "#D8D9DB",
  "--muted": "#B0B4B7",
  "--border": "#272A35",
  "--border-strong": "#3A3F4D",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#A9B6FF",
  "--brand-soft": "rgba(76,99,255,0.22)",
  "--chart-from": "#3D5AFF",
  "--chart-to": "#8AA0FF",
  "--success": "#0EB567",
  "--danger": "#DC204D",
  "--warning": "#F89B3C",
  "--success-text": "#35D08A",
  "--danger-text": "#F2617E",
  "--warning-text": "#F5A65B",
  "--success-soft": "rgba(14,181,103,0.16)",
  "--danger-soft": "rgba(220,32,77,0.18)",
  "--warning-soft": "rgba(248,155,60,0.16)",
  "--ring": "#A9B6FF",
  "--shadow": "0 1px 2px rgba(0,0,0,0.4), 0 12px 28px -18px rgba(0,0,0,0.7)",
  "--shadow-hover": "0 2px 4px rgba(0,0,0,0.5), 0 20px 36px -18px rgba(0,0,0,0.85)",
  "--pop-shadow": "0 16px 40px -12px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)",
  "--logo-filter": "brightness(0) invert(1)",
};

// Giriş ve etkileşim animasyonları. Hareket azaltma tercihinde tamamı kapanır.
const MOTION_CSS = `
@keyframes bn-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes bn-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes bn-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes bn-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes bn-pop { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: none; } }
.bn-rise { animation: bn-rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 55ms); }
.bn-grow { transform-origin: bottom; animation: bn-grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 60ms + 180ms); }
.bn-fill { transform-origin: left; animation: bn-fill 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: 0.3s; }
.bn-draw { stroke-dasharray: 1; animation: bn-draw 1.1s ease-out backwards; animation-delay: 0.35s; }
.bn-pop { animation: bn-pop 0.16s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .bn-rise, .bn-grow, .bn-fill, .bn-draw, .bn-pop { animation: none; }
}
`;

// ---- veri yardımcıları -------------------------------------------------------------------
// Haftalık hacim (bin ₺)
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
const HERO_SERIES = [40, 52, 47, 60, 58, 71, 76];

// Mock "düne göre" değişimleri — good: değişim olumlu mu?
const TREND = {
  toplam: { txt: "%6,4", up: true, good: true },
  basarili: { txt: "%7,1", up: true, good: true },
  basarisiz: { txt: "%2,3", up: false, good: true },
  iptal: { txt: "%0,8", up: true, good: false },
  iade: { txt: "%1,2", up: false, good: true },
};

// Renkli KPI blokları (toplam bloğu ayrı çizilir)
const TILE = {
  basarili: { wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]", fill: "bg-[var(--success)]" },
  basarisiz: { wrap: "bg-[var(--danger-soft)]", ink: "text-[var(--danger-text)]", fill: "bg-[var(--danger)]" },
  iptal: { wrap: "bg-[var(--warning-soft)]", ink: "text-[var(--warning-text)]", fill: "bg-[var(--warning)]" },
  iade: { wrap: "bg-[var(--brand-soft)]", ink: "text-[var(--brand-text)]", fill: "bg-[var(--chart-from)]" },
};

const SEGMENTS = [
  { key: "basarili", label: "Başarılı", fill: "bg-[var(--success)]" },
  { key: "basarisiz", label: "Başarısız", fill: "bg-[var(--danger)]" },
  { key: "iptal", label: "İptal", fill: "bg-[var(--warning)]" },
  { key: "iade", label: "İade", fill: "bg-[var(--chart-from)]" },
];

const QUICK = [
  { label: "Manuel Ödeme", desc: "Kart bilgisiyle tahsilat", icon: "wallet" },
  { label: "Link ile Ödeme", desc: "Ödeme linki oluştur", icon: "link" },
  { label: "Fatura Yükle", desc: "Bekleyen faturaları tamamla", icon: "receipt" },
];

// Menüde "Yönetim" bölümüne giren öğeler
const MANAGE_ICONS = new Set(["dealer", "settings", "megaphone"]);

const CARD =
  "rounded-2xl border border-[var(--border)] bg-[var(--surface)] [box-shadow:var(--shadow)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-hover)] motion-reduce:transform-none";
const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]";
const GHOST = `grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--brand-text)] ${FOCUS}`;
const MENU_ITEM = `flex min-h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[12.5px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--brand-text)] ${FOCUS}`;

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
function smoothPath(values, w, h, pad) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)]);
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

// N Kolay logosu (CDN). Tek renk mavi SVG; koyu ve mavi zeminlerde beyaza çevrilir.
const NK_LOGO = "https://cdn.nkolayislem.com.tr/e-full-logo.svg";

function Logo({ onBrand, compact }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={NK_LOGO}
      alt="N Kolay"
      className={`w-auto shrink-0 ${compact ? "h-6" : "h-7"}`}
      style={{ filter: onBrand ? "brightness(0) invert(1)" : "var(--logo-filter)" }}
    />
  );
}

// ---- sol menü ----------------------------------------------------------------------------
function NavGroup({ entry, open, onToggle }) {
  const id = `bn-grp-${entry.icon}`;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`group flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-semibold transition-colors hover:bg-[var(--soft)] ${
          open ? "text-[var(--brand-text)]" : "text-[var(--fg-2)]"
        } ${FOCUS}`}
      >
        <I name={entry.icon} size={16} className={`transition-colors ${open ? "" : "text-[var(--muted)] group-hover:text-[var(--brand-text)]"}`} />
        <span className="flex-1 text-left">{entry.label}</span>
        <I
          name="chevronRight"
          size={13}
          className={`text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
        />
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="mb-1 ml-[17px] mt-0.5 space-y-px border-l border-[var(--border-strong)] pl-2">
            {entry.items.map((i) => (
              <li key={i.href}>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  className={`flex h-8 w-full items-center rounded-lg px-2.5 text-left text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--brand-text)] ${FOCUS}`}
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

function NavSection({ label, entries, openGroup, setOpenGroup }) {
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="px-2.5 pb-1 pt-3 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <div className="space-y-0.5">
        {entries.map((entry) =>
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
              className={`group flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-semibold transition-colors ${
                entry.href === "/dashboard"
                  ? "bg-[var(--brand)] text-white shadow-[0_8px_16px_-8px_rgba(12,52,231,0.75)]"
                  : "text-[var(--fg-2)] hover:bg-[var(--soft)]"
              } ${FOCUS}`}
            >
              <I
                name={entry.icon}
                size={16}
                className={entry.href === "/dashboard" ? "" : "text-[var(--muted)] transition-colors group-hover:text-[var(--brand-text)]"}
              />
              <span>{entry.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function Sidebar({ role, desktopOpen, mobileOpen, hidden, onClose, onLogout }) {
  const nav = getNav(role);
  const meta = ROLE_META[role];
  const main = nav.filter((e) => !MANAGE_ICONS.has(e.icon));
  const manage = nav.filter((e) => MANAGE_ICONS.has(e.icon));
  // aynı anda tek grup açık kalır
  const [openGroup, setOpenGroup] = useState("Ödeme Al");

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-[55] bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Ana menü"
        inert={hidden ? "" : undefined}
        className={`fixed inset-y-0 left-0 z-[60] flex w-[248px] shrink-0 flex-col border-[var(--border)] bg-[var(--surface)] transition-[transform,margin,opacity] duration-300 ease-out [box-shadow:var(--shadow)] motion-reduce:transition-none max-lg:rounded-r-2xl max-lg:border-r lg:sticky lg:bottom-auto lg:left-auto lg:top-3 lg:z-30 lg:my-3 lg:h-[calc(100vh-24px)] lg:translate-x-0 lg:self-start lg:rounded-2xl lg:border ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopOpen ? "lg:ml-3 lg:opacity-100" : "lg:-ml-[248px] lg:opacity-0"}`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between pl-4 pr-2.5">
          <Logo />
          <button type="button" onClick={onClose} aria-label="Menüyü kapat" title="Menüyü kapat" className={GHOST}>
            <I name="chevronLeft" size={15} />
          </button>
        </div>

        {/* ana firma — her rolde göz önünde: mavi kart, büyük logo */}
        <div className="relative mx-3 mt-1 flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl bg-[#0C34E7] p-3 text-white [box-shadow:0_12px_26px_-14px_rgba(12,52,231,0.8)]">
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#D4D1FC] opacity-30 blur-2xl" aria-hidden="true" />
          <CompanyLogo name={anaFirma.ad} size={48} tone="light" className="relative shrink-0" />
          <div className="relative min-w-0 leading-tight">
            <p className="truncate text-[15px] font-extrabold">{anaFirma.ad}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-white/75">Ana Firma · B2B Bayi Ağı</p>
          </div>
        </div>
        {/* bayi / alt bayi girişinde kullanıcının kendi firması */}
        {role !== ROLES.ANA_FIRMA && (
          <div className="mx-3 mt-2 flex shrink-0 items-center gap-2.5 rounded-xl bg-[var(--soft)] px-2.5 py-2">
            <CompanyLogo name={meta.company} color={meta.logoColor} size={32} className="shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[12.5px] font-bold text-[var(--fg)]">{meta.company}</span>
              <span className="block text-[10.5px] font-medium leading-snug text-[var(--muted)]">
                {meta.label} · {meta.parentNote}
              </span>
            </span>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-3 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--border-strong)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-strong)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          <NavSection label="İşlemler" entries={main} openGroup={openGroup} setOpenGroup={setOpenGroup} />
          <NavSection label="Yönetim" entries={manage} openGroup={openGroup} setOpenGroup={setOpenGroup} />
        </nav>

        {/* kullanıcı */}
        <div className="m-3 mt-0 flex shrink-0 items-center gap-2.5 rounded-xl border border-[var(--border)] p-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-extrabold text-white">
            {meta.short}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[12.5px] font-bold text-[var(--fg)]">{meta.user}</span>
            <span className="block truncate text-[11px] font-medium text-[var(--muted)]">Çevrimiçi</span>
          </span>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Çıkış yap"
            title="Çıkış yap"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger-text)] ${FOCUS}`}
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
        className={`flex h-8 items-center gap-1.5 rounded-full bg-[var(--soft)] pl-0.5 pr-2 transition-colors hover:bg-[var(--soft-2)] ${FOCUS}`}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-extrabold text-white">{meta.short}</span>
        <span className="hidden max-w-[150px] truncate text-[12.5px] font-semibold text-[var(--fg)] xl:block">{meta.user}</span>
        <I name="chevronDown" size={13} className={`text-[var(--muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            className="bn-pop absolute right-0 top-full z-40 mt-2 w-56 origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 [box-shadow:var(--pop-shadow)]"
          >
            <div className="px-2.5 pb-2 pt-1.5">
              <p className="truncate text-[12.5px] font-bold text-[var(--fg)]">{meta.user}</p>
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
function HeroTile({ s }) {
  const tr = TREND.toplam;
  return (
    <div
      style={{ "--i": 0 }}
      className="bn-rise relative overflow-hidden rounded-2xl bg-[#0C34E7] p-4 text-white transition-[transform,box-shadow] duration-200 [box-shadow:0_14px_30px_-16px_rgba(12,52,231,0.75)] hover:-translate-y-0.5 motion-reduce:transform-none col-span-2"
    >
      <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#D4D1FC] opacity-25 blur-2xl" aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-white/85">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/15">
            <I name="trendingUp" size={13} />
          </span>
          {s.label}
        </p>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-bold">{s.count} adet</span>
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[26px] font-extrabold leading-none tracking-tight tabular-nums">
            <Money value={s.value} />
          </p>
          <p className="mt-2 flex items-center gap-1 text-[11.5px] text-white/75">
            <span className="inline-flex items-center gap-0.5 font-bold text-white">
              <TrendArrow up={tr.up} />
              {tr.txt}
            </span>
            düne göre
          </p>
        </div>
        <svg viewBox="0 0 120 40" className="h-10 w-[120px] shrink-0" fill="none" aria-hidden="true">
          <path className="bn-draw" pathLength="1" d={smoothPath(HERO_SERIES, 120, 40, 4)} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function SoftTile({ s, index, total }) {
  const t = TILE[s.key] || TILE.iade;
  const tr = TREND[s.key];
  const pay = total ? (s.count / total) * 100 : 0;
  return (
    <div
      style={{ "--i": index }}
      className={`bn-rise rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none ${t.wrap}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[12.5px] font-semibold ${t.ink}`}>{s.label}</p>
        <span className={`rounded-full bg-[var(--surface)] px-1.5 py-px text-[10.5px] font-bold tabular-nums ${t.ink}`}>{s.count} adet</span>
      </div>
      <p className="mt-2.5 text-[19px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)]">
        <Money value={s.value} />
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface)]" aria-hidden="true">
        <div className={`bn-fill h-full rounded-full ${t.fill}`} style={{ width: `${Math.max(pay, 3)}%` }} />
      </div>
      {tr && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-[var(--muted)]">
          <span className={`inline-flex items-center gap-0.5 font-bold ${tr.good ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
            <TrendArrow up={tr.up} />
            {tr.txt}
          </span>
          düne göre
        </p>
      )}
    </div>
  );
}

function ChartCard() {
  const maxK = Math.max(...WEEK.map((w) => w.k));
  const total = WEEK.reduce((a, w) => a + w.k, 0);
  return (
    <section style={{ "--i": 5 }} className={`bn-rise p-4 lg:col-span-2 ${CARD}`} aria-labelledby="bn-chart-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="bn-chart-title" className="text-sm font-bold text-[var(--fg)]">
            Haftalık İşlem Hacmi
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Son 7 gün · toplam ₺ {(total / 1000).toFixed(2).replace(".", ",")}M</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--success-text)]">
          <TrendArrow up />
          %12,4 geçen haftaya göre
        </span>
      </div>

      <div className="relative mt-6 h-40">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="border-t border-dashed border-[var(--border)]" />
          ))}
          <span className="border-t border-[var(--border-strong)]" />
        </div>
        <div className="relative flex h-full items-end justify-around gap-2">
          {WEEK.map((w, i) => (
            <div key={w.d} className="group flex h-full flex-1 items-end justify-center">
              <div className="relative w-full max-w-[32px]" style={{ height: `${(w.k / AXIS_MAX) * 100}%` }}>
                <div
                  style={{ "--i": i }}
                  className={`bn-grow h-full w-full rounded-t-[10px] bg-[linear-gradient(180deg,var(--chart-to),var(--chart-from))] transition-opacity duration-200 group-hover:opacity-100 ${
                    w.k === maxK ? "opacity-100" : "opacity-45"
                  }`}
                />
                <span
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--fg)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--bg)] transition-all duration-200 ${
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
    </section>
  );
}

function BalanceCard({ role }) {
  const bakiye = bakiyeOzet[role];
  return (
    <section style={{ "--i": 6 }} className={`bn-rise flex flex-col p-4 ${CARD}`} aria-labelledby="bn-balance-title">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="bn-balance-title" className="text-sm font-bold text-[var(--fg)]">
            Bakiye ve Borç
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{role === ROLES.ANA_FIRMA ? "Firma limiti" : "Üst cari görünümü"}</p>
        </div>
        <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[var(--brand-text)]">%{bakiye.kullanim}</span>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-xl bg-[#0C34E7] p-3.5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#D4D1FC] opacity-25 blur-2xl" aria-hidden="true" />
        <p className="relative text-[11px] font-medium text-white/75">Kullanılabilir Bakiye</p>
        <p className="relative mt-1 text-[21px] font-extrabold leading-none tracking-tight tabular-nums">
          <Money value={bakiye.bakiye} />
        </p>
      </div>

      <dl className="mt-3 space-y-2 text-[12.5px]">
        <div className="flex items-center justify-between">
          <dt className="text-[var(--muted)]">Güncel Borç</dt>
          <dd className="font-bold tabular-nums text-[var(--danger-text)]">{bakiye.borc}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[var(--muted)]">Ödeme Limiti</dt>
          <dd className="font-bold tabular-nums text-[var(--fg)]">{bakiye.limit}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex justify-between text-[11px] font-medium text-[var(--muted)]">
          <span>Limit Kullanımı</span>
          <span className="font-bold tabular-nums text-[var(--fg-2)]">%{bakiye.kullanim}</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-[var(--brand-soft)]"
          role="progressbar"
          aria-valuenow={bakiye.kullanim}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Limit kullanımı"
        >
          <div className="bn-fill h-full rounded-full bg-[linear-gradient(90deg,var(--chart-from),var(--chart-to))]" style={{ width: `${bakiye.kullanim}%` }} />
        </div>
      </div>
    </section>
  );
}

function TransactionsCard() {
  return (
    <section style={{ "--i": 7 }} className={`bn-rise overflow-hidden lg:col-span-2 ${CARD} hover:!translate-y-0`} aria-labelledby="bn-tx-title">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 id="bn-tx-title" className="text-sm font-bold text-[var(--fg)]">
            Son İşlemler
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">En güncel 6 işlem</p>
        </div>
        <button
          type="button"
          className={`group inline-flex h-8 items-center gap-1 rounded-full bg-[var(--soft)] px-3 text-xs font-bold text-[var(--brand-text)] transition-colors hover:bg-[var(--soft-2)] ${FOCUS}`}
        >
          Tümünü Gör
          <I name="chevronRight" size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[12.5px]">
          <thead>
            <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
              <th scope="col" className="whitespace-nowrap px-4 py-2">İşlem No</th>
              <th scope="col" className="whitespace-nowrap px-4 py-2">Müşteri</th>
              <th scope="col" className="whitespace-nowrap px-4 py-2">Tarih</th>
              <th scope="col" className="whitespace-nowrap px-4 py-2">Taksit</th>
              <th scope="col" className="whitespace-nowrap px-4 py-2 text-right">Tutar</th>
              <th scope="col" className="whitespace-nowrap px-4 py-2">Durum</th>
            </tr>
          </thead>
          <tbody>
            {islemler.slice(0, 6).map((t, i) => (
              <tr key={t.id} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                <td className="whitespace-nowrap px-4 py-2.5 font-bold text-[var(--brand-text)]">{t.id}</td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className="block font-semibold text-[var(--fg)]">{t.musteri}</span>
                  <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.cari}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-[var(--muted)]">{t.tarih}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[var(--fg-2)]">{t.taksit}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-bold tabular-nums text-[var(--fg)]">{t.tutar}</td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${pillTone(t.durum)}`}>{t.durum}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QuickCard() {
  return (
    <section style={{ "--i": 8 }} className={`bn-rise p-2 ${CARD}`} aria-labelledby="bn-quick-title">
      <h2 id="bn-quick-title" className="px-2 pb-1 pt-2 text-sm font-bold text-[var(--fg)]">
        Hızlı İşlemler
      </h2>
      <ul>
        {QUICK.map((q) => (
          <li key={q.label}>
            <button type="button" className={`group flex h-12 w-full items-center gap-2.5 rounded-xl px-2 text-left transition-colors hover:bg-[var(--soft)] ${FOCUS}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[var(--brand-soft)] text-[var(--brand-text)] transition-colors duration-200 group-hover:bg-[var(--brand)] group-hover:text-white">
                <I name={q.icon} size={15} />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[12.5px] font-bold text-[var(--fg)]">{q.label}</span>
                <span className="block truncate text-[11px] text-[var(--muted)]">{q.desc}</span>
              </span>
              <I
                name="arrowUpRight"
                size={14}
                className="text-[var(--muted)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand-text)]"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DistributionCard({ stats }) {
  const parts = SEGMENTS.map((seg) => ({ ...seg, count: (stats.find((s) => s.key === seg.key) || {}).count || 0 }));
  const total = parts.reduce((a, p) => a + p.count, 0) || 1;
  return (
    <section style={{ "--i": 9 }} className={`bn-rise flex-1 p-4 ${CARD}`} aria-labelledby="bn-dist-title">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="bn-dist-title" className="text-sm font-bold text-[var(--fg)]">
          İşlem Dağılımı
        </h2>
        <p className="text-xs tabular-nums text-[var(--muted)]">{total} işlem</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--soft-2)]" role="img" aria-label="Duruma göre işlem dağılımı">
        <div className="bn-fill flex h-full w-full gap-px">
          {parts
            .filter((p) => p.count > 0)
            .map((p) => (
              <span key={p.key} className={`h-full first:rounded-l-full last:rounded-r-full ${p.fill}`} style={{ width: `${(p.count / total) * 100}%` }} />
            ))}
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${p.fill}`} aria-hidden="true" />
            <span className="flex-1 text-[var(--fg-2)]">{p.label}</span>
            <span className="font-bold tabular-nums text-[var(--fg)]">{p.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PanelView({ role, setRole, isDark, onToggleTheme, onLogout }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const meta = ROLE_META[role];
  const stats = kpis[role];
  const toplam = stats.find((s) => s.key === "toplam") || stats[0];
  const others = stats.filter((s) => s.key !== "toplam");

  useEffect(() => {
    try {
      const mq = window.matchMedia("(min-width: 1024px)");
      const sync = () => setIsDesktop(mq.matches);
      sync();
      mq.addEventListener("change", sync);
      // ?menu=closed | ?menu=open bağlantıyla menü durumunu zorlar
      const q = new URLSearchParams(window.location.search).get("menu");
      if (q === "closed" || (q !== "open" && localStorage.getItem("nkb-bento-menu") === "closed")) setDesktopOpen(false);
      return () => mq.removeEventListener("change", sync);
    } catch (e) {
      return undefined;
    }
  }, []);

  const setDesktop = (next) => {
    setDesktopOpen(next);
    try {
      localStorage.setItem("nkb-bento-menu", next ? "open" : "closed");
    } catch (e) {}
  };
  const toggleMenu = () => (isDesktop ? setDesktop(!desktopOpen) : setMobileOpen((o) => !o));
  const closeMenu = () => (isDesktop ? setDesktop(false) : setMobileOpen(false));
  const menuVisible = isDesktop ? desktopOpen : mobileOpen;

  const selectCls = `h-9 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[12.5px] font-medium text-[var(--fg-2)] ${FOCUS}`;

  return (
    <div className="flex flex-1">
      <Sidebar role={role} desktopOpen={desktopOpen} mobileOpen={mobileOpen} hidden={!menuVisible} onClose={closeMenu} onLogout={onLogout} />

      <div className="flex min-w-0 flex-1 flex-col px-3 lg:px-4">
        {/* yüzen üst bar */}
        <div className="sticky top-0 z-20 bg-[var(--bg)] pt-3">
          <header className="flex h-12 items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-2 [box-shadow:var(--shadow)] sm:gap-1.5">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={menuVisible}
              title={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
              className={GHOST}
            >
              <I name="panel" size={16} />
            </button>

            {/* menü kapalıyken marka üst barda görünür */}
            <div
              className={`ml-1 block max-w-[220px] shrink-0 overflow-hidden transition-[max-width,opacity,margin] duration-300 motion-reduce:transition-none ${
                desktopOpen ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : "lg:ml-1.5 lg:max-w-[220px] lg:opacity-100"
              }`}
              aria-hidden={desktopOpen && isDesktop ? "true" : undefined}
            >
              <div className="flex items-center gap-2.5 whitespace-nowrap">
                <CompanyLogo name={anaFirma.ad} size={32} className="shrink-0" />
                <span className="hidden leading-tight sm:block">
                  <span className="block text-[13.5px] font-extrabold text-[var(--fg)]">{anaFirma.ad}</span>
                  <span className="block text-[10.5px] font-medium text-[var(--muted)]">Ana Firma · N Kolay Bayim</span>
                </span>
              </div>
            </div>

            <label className="relative ml-1.5 hidden w-full max-w-[260px] md:block">
              <span className="sr-only">Ara</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <I name="search" size={14} />
              </span>
              <input
                type="search"
                placeholder="İşlem, cari veya müşteri ara"
                className="h-8 w-full rounded-full border border-transparent bg-[var(--soft)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--border-strong)] focus:border-[var(--brand)] focus:bg-[var(--surface)]"
              />
            </label>

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              {/* rol değiştirici — menü ve veriler role göre değişir */}
              <div role="group" aria-label="Panel tipi" className="mr-0.5 flex h-8 items-center rounded-full bg-[var(--soft)] p-0.5">
                {ROLE_ORDER.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`h-7 rounded-full px-2.5 text-[11.5px] transition-all duration-200 active:scale-95 sm:px-3 ${
                      role === r ? "bg-[var(--brand)] font-bold text-white shadow-sm" : "font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
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
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--danger)] opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />
                </span>
              </button>
              <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />
            </div>
          </header>
        </div>

        {/* key={role}: rol değişince giriş animasyonları yeniden oynar */}
        <main key={role} className="mx-auto w-full max-w-[1280px] flex-1 py-4">
          <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Ana Sayfa</h1>
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
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
              >
                <I name="download" size={14} />
                Dışa Aktar
              </button>
              <button
                type="button"
                className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] active:scale-[0.97] hover:brightness-110 ${FOCUS}`}
              >
                <I name="plus" size={14} />
                Ödeme Al
              </button>
            </div>
          </div>

          {/* KPI bento blokları */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <HeroTile s={toplam} />
            {others.map((s, i) => (
              <SoftTile key={s.key} s={s} index={i + 1} total={toplam.count} />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <ChartCard />
            <BalanceCard role={role} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <TransactionsCard />
            <div className="flex flex-col gap-3">
              <QuickCard />
              <DistributionCard stats={stats} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginView({ isDark, onToggleTheme, onLogin }) {
  const inputCls =
    "h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--soft)] px-3 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:bg-[var(--surface)]";
  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      {/* küçük kontroller */}
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
        title={isDark ? "Açık mod" : "Koyu mod"}
        className={`${GHOST} absolute right-4 top-4 bg-[var(--surface)]`}
      >
        <I name={isDark ? "sun" : "moon"} size={16} />
      </button>

      <div className="bn-rise grid w-full max-w-[880px] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] [box-shadow:var(--pop-shadow)] lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0C34E7] p-8 text-white lg:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#D4D1FC] opacity-30 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#D4D1FC] opacity-15 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <Logo onBrand />
          </div>
          <div className="relative py-10">
            <div className="mb-6 flex items-center gap-3.5">
              <CompanyLogo name={anaFirma.ad} size={64} tone="light" className="shrink-0 shadow-[0_16px_32px_-14px_rgba(0,0,0,0.5)]" />
              <div className="leading-tight">
                <p className="text-[21px] font-extrabold tracking-tight">{anaFirma.ad}</p>
                <p className="mt-1 text-[12.5px] text-white/80">{anaFirma.aciklama}</p>
              </div>
            </div>
            <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-bold tracking-wide">B2B ÖDEME PANELİ</span>
            <h2 className="mt-4 text-[26px] font-extrabold leading-tight tracking-tight">
              Bayi ağınızı
              <br />
              tek panelden yönetin
            </h2>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/80">
              Ana firma, bayi ve alt bayi hiyerarşisi; manuel ve link ile ödeme, iptal / iade onayları ve raporlar tek yerde.
            </p>
            <dl className="mt-6 flex gap-2.5">
              {[
                ["3", "Panel Tipi"],
                ["7/24", "Ödeme"],
                ["5", "Vade Profili"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 px-3 py-2">
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-lg font-extrabold leading-none">{n}</dd>
                  <dd className="mt-1 text-[10.5px] text-white/70">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="relative text-[11px] text-white/60">© 2026 pay{"'"}n kolay · N Kolay Bayim</p>
        </div>

        <form
          className="px-6 py-10 sm:px-10"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <div className="lg:hidden">
            <Logo />
          </div>
          <h2 className="mt-8 text-xl font-extrabold tracking-tight text-[var(--fg)] lg:mt-2">Giriş Yap</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Panel bilgilerinizle oturum açın.</p>
          <label className="mt-7 block">
            <span className="mb-1.5 block text-[12.5px] font-semibold text-[var(--fg-2)]">E-posta adresi</span>
            <input type="email" defaultValue="yonetici@brisa.com" autoComplete="email" className={inputCls} />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[12.5px] font-semibold text-[var(--fg-2)]">Şifre</span>
            <input type="password" defaultValue="123456" autoComplete="current-password" className={inputCls} />
          </label>
          <div className="mt-3 flex items-center justify-between text-[12.5px]">
            <label className="flex min-h-[36px] items-center gap-2 text-[var(--fg-2)]">
              <input type="checkbox" className="h-4 w-4 rounded accent-[#0C34E7]" />
              Beni hatırla
            </label>
            <a href="#" onClick={(e) => e.preventDefault()} className={`rounded font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
              Şifremi unuttum
            </a>
          </div>
          <button
            type="submit"
            className={`mt-5 h-10 w-full rounded-full bg-[var(--brand)] text-[13px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] active:scale-[0.98] hover:brightness-110 ${FOCUS}`}
          >
            Giriş Yap
          </button>
          <p className="mt-5 text-center text-[11.5px] text-[var(--muted)]">Demo mockup — herhangi bir bilgiyle panele geçilir.</p>
        </form>
      </div>
    </div>
  );
}

export default function BentoDesign() {
  const { role, setRole } = useRole();
  const [view, setView] = useState("Panel");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      // ?theme=dark | ?theme=light ve ?view=giris bağlantıyla durumu zorlar (paylaşım / önizleme için)
      const params = new URLSearchParams(window.location.search);
      const q = params.get("theme");
      const s = localStorage.getItem("nkb-theme-bento");
      if (q === "dark" || q === "light") setIsDark(q === "dark");
      else if (s) setIsDark(s === "dark");
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
      if (params.get("view") === "giris") setView("Giriş");
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("nkb-theme-bento", isDark ? "dark" : "light");
    } catch (e) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <>
      <Head>
        <title>N Kolay Bayim</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
      <div
        style={{ ...(isDark ? dark : light), fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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

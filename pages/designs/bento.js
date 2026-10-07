import { Fragment, useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Head from "next/head";
import { useRouter } from "next/router";
import I from "@/components/DesignIcons";
import { useRole } from "@/components/RoleContext";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import CompanyLogo from "@/components/CompanyLogo";
import { kpis, islemler, bakiyeOzet, anaFirma, bayiler, altBayiler, musteriler, vadeFarkiProfilleri, odemeLinkleri, iptalIadeTalepleri } from "@/lib/mockData";

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
@keyframes bn-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes bn-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bn-pop { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: none; } }
.bn-rise { animation: bn-rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 55ms); }
.bn-grow { transform-origin: bottom; animation: bn-grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 60ms + 180ms); }
.bn-fill { transform-origin: left; animation: bn-fill 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: 0.3s; }
.bn-draw { stroke-dasharray: 1; animation: bn-draw 1.1s ease-out backwards; animation-delay: 0.35s; }
.bn-wipe { animation: bn-wipe 1s cubic-bezier(0.3, 0.7, 0.2, 1) backwards; }
.bn-fade { animation: bn-fade 0.18s ease-out backwards; }
.bn-pop { animation: bn-pop 0.16s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .bn-rise, .bn-grow, .bn-fill, .bn-draw, .bn-wipe, .bn-fade, .bn-pop { animation: none; }
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

// Mock "düne göre" değişimleri — good: değişim olumlu mu?
const TREND = {
  toplam: { txt: "%6,4", up: true, good: true },
  basarili: { txt: "%7,1", up: true, good: true },
  basarisiz: { txt: "%2,3", up: false, good: true },
  iptal: { txt: "%0,8", up: true, good: false },
  iade: { txt: "%1,2", up: false, good: true },
};

// Küçük renkli KPI blokları (toplam ve başarılı büyük bloklarda ayrı çizilir)
const TILE = {
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
  { label: "Manuel Ödeme", desc: "Kart bilgisiyle tahsilat", icon: "wallet", href: "/odeme/manuel" },
  { label: "Link ile Ödeme", desc: "Ödeme linki oluştur", icon: "link", href: "/odeme/link" },
  { label: "Fatura Yükle", desc: "Bekleyen faturaları tamamla", icon: "receipt", href: "/raporlar/fatura-yukleme" },
];

// Menüde "Yönetim" bölümüne giren öğeler
const MANAGE_ICONS = new Set(["dealer", "settings", "megaphone"]);

// Hazır ekranlar: ?sayfa=<anahtar> → menüdeki href. Ana Sayfa (/dashboard) parametresizdir.
// Burada olmayan menü öğeleri henüz bir ekrana gitmez.
const HOME = "/dashboard";
const SAYFALAR = {
  "manuel-odeme": "/odeme/manuel",
  "link-odeme": "/odeme/link",
  "iptal-iade-onay": "/iptal-iade/onay",
  "iptal-iade-takip": "/iptal-iade/takip",
  "islem-detaylari": "/raporlar/islem-detaylari",
};
const isReady = (href) => href === HOME || Object.values(SAYFALAR).includes(href);

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

// Şartname (Rapor): ana firma tüm bayi / alt bayi işlemlerini, bayi kendisinin ve alt bayilerinin,
// alt bayi yalnızca kendi işlemlerini görür. (Örnek veride alt bayiler Ankara Lastik Bayi'ye bağlıdır.)
function kapsamda(role, yapan) {
  const firma = ROLE_META[role].company;
  if (role === ROLES.ANA_FIRMA) return true;
  if (role === ROLES.BAYI) return yapan === firma || altBayiler.some((a) => a.unvan === yapan);
  return yapan === firma;
}

function rolIslemleri(role) {
  return islemler.filter((t) => kapsamda(role, t.yapan));
}

// Çekimi yapan firmanın ağdaki yeri
function firmaTuru(ad) {
  if (ad === anaFirma.ad) return "Ana Firma";
  if (bayiler.some((b) => b.unvan === ad)) return "Bayi";
  return "Alt Bayi";
}

// "₺ 4.284.900" → 4284900
function parseAmount(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

// Değerleri w×h alana (min–max aralığına) yayıp yumuşak bir eğri yolu üretir.
function smoothPath(values, w, h, pad) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  return curveThrough(values.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)]));
}

// [x, y] noktalarından geçen yumuşak (yatay teğetli) bir eğri yolu üretir.
function curveThrough(pts) {
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
function NavGroup({ entry, open, onToggle, current, onNavigate, rozetler = {} }) {
  const id = `bn-grp-${entry.icon}`;
  const hasActive = entry.items.some((i) => i.href === current);
  // bekleyen iş sayısı (ör. onay bekleyen iptal / iade); grup kapalıyken başlıkta toplamı görünür
  const rozet = entry.items.reduce((a, i) => a + (rozetler[i.href] || 0), 0);
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`group flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-semibold transition-colors hover:bg-[var(--soft)] ${
          open || hasActive ? "text-[var(--brand-text)]" : "text-[var(--fg-2)]"
        } ${FOCUS}`}
      >
        <I name={entry.icon} size={16} className={`transition-colors ${open || hasActive ? "" : "text-[var(--muted)] group-hover:text-[var(--brand-text)]"}`} />
        <span className="flex-1 text-left">{entry.label}</span>
        {rozet > 0 && !open && (
          <span className="rounded-full bg-[var(--danger)] px-1.5 text-[10.5px] font-bold tabular-nums text-white" aria-label={`${rozet} bekleyen`}>
            {rozet}
          </span>
        )}
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
                  onClick={isReady(i.href) ? () => onNavigate(i.href) : undefined}
                  aria-current={i.href === current ? "page" : undefined}
                  className={`flex h-8 w-full items-center rounded-lg px-2.5 text-left text-[12.5px] transition-colors hover:bg-[var(--soft)] hover:text-[var(--brand-text)] ${
                    i.href === current ? "bg-[var(--soft)] font-bold text-[var(--brand-text)]" : "font-medium text-[var(--muted)]"
                  } ${FOCUS}`}
                >
                  <span className="flex-1">{i.label}</span>
                  {rozetler[i.href] > 0 && (
                    <span className="rounded-full bg-[var(--danger)] px-1.5 text-[10.5px] font-bold tabular-nums text-white" aria-label={`${rozetler[i.href]} bekleyen`}>
                      {rozetler[i.href]}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function NavSection({ label, entries, openGroup, setOpenGroup, current, onNavigate, rozetler }) {
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
              current={current}
              onNavigate={onNavigate}
              rozetler={rozetler}
            />
          ) : (
            <button
              key={entry.label}
              type="button"
              onClick={isReady(entry.href) ? () => onNavigate(entry.href) : undefined}
              aria-current={entry.href === current ? "page" : undefined}
              className={`group flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-semibold transition-colors ${
                entry.href === current
                  ? "bg-[var(--brand)] text-white shadow-[0_8px_16px_-8px_rgba(12,52,231,0.75)]"
                  : "text-[var(--fg-2)] hover:bg-[var(--soft)]"
              } ${FOCUS}`}
            >
              <I
                name={entry.icon}
                size={16}
                className={entry.href === current ? "" : "text-[var(--muted)] transition-colors group-hover:text-[var(--brand-text)]"}
              />
              <span>{entry.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function Sidebar({ role, desktopOpen, mobileOpen, hidden, onClose, onLogout, current, onNavigate, rozetler }) {
  const nav = getNav(role);
  const meta = ROLE_META[role];
  const main = nav.filter((e) => !MANAGE_ICONS.has(e.icon));
  const manage = nav.filter((e) => MANAGE_ICONS.has(e.icon));
  // tüm gruplar kapalı başlar; aynı anda tek grup açık kalır. Açık ekranın grubu kapalıyken de başlığı vurgulanır.
  const [openGroup, setOpenGroup] = useState(null);

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
          <NavSection label="İşlemler" entries={main} openGroup={openGroup} setOpenGroup={setOpenGroup} current={current} onNavigate={onNavigate} rozetler={rozetler} />
          <NavSection label="Yönetim" entries={manage} openGroup={openGroup} setOpenGroup={setOpenGroup} current={current} onNavigate={onNavigate} rozetler={rozetler} />
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
// Büyük bloklar: Toplam ve Başarılı eşit ağırlıkta, panonun ilk satırı.
// Koyu zeminler beyaz yazıda okunurluğu korur (kontrast ≥ 4.5:1).
const BIG = {
  basarili: {
    title: "Başarılı İşlemler",
    icon: "check",
    bg: "bg-[linear-gradient(135deg,#078350,#04603A)] [box-shadow:0_16px_34px_-16px_rgba(4,96,58,0.75)]",
    glow: "bg-[#7CE3B1]",
    series: [40, 52, 47, 60, 58, 71, 76],
  },
  toplam: {
    title: "Toplam İşlem",
    icon: "trendingUp",
    bg: "bg-[linear-gradient(135deg,#0C34E7,#0A23A8)] [box-shadow:0_16px_34px_-16px_rgba(12,52,231,0.75)]",
    glow: "bg-[#D4D1FC]",
    series: [44, 50, 49, 57, 61, 66, 72],
  },
};

// footer: { label, value, bar? } — bar verilirse altta yüzde çubuğu çizilir
function BigTile({ s, index, footer }) {
  const b = BIG[s.key];
  const tr = TREND[s.key];
  const line = smoothPath(b.series, 400, 80, 4);
  return (
    <div
      style={{ "--i": index }}
      className={`bn-rise relative col-span-6 flex flex-col overflow-hidden rounded-2xl p-5 text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 motion-reduce:transform-none sm:col-span-3 lg:p-6 ${b.bg}`}
    >
      <div className={`pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl ${b.glow}`} aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15">
            <I name={b.icon} size={15} />
          </span>
          {b.title}
        </p>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold tabular-nums">
          {s.count.toLocaleString("tr-TR")} adet
        </span>
      </div>

      <p className="relative mt-4 text-[30px] font-extrabold leading-none tracking-tight tabular-nums sm:text-[34px] xl:text-[40px]">
        <Money value={s.value} />
      </p>
      <p className="relative mt-2 flex items-center gap-1 text-[12px] text-white/85">
        <span className="inline-flex items-center gap-0.5 font-bold text-white">
          <TrendArrow up={tr.up} />
          {tr.txt}
        </span>
        düne göre
      </p>

      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="relative mt-auto h-14 w-full pt-3 sm:h-16" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`bn-area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L 396 80 L 4 80 Z`} fill={`url(#bn-area-${s.key})`} />
        <path className="bn-draw" pathLength="1" d={line} stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="relative mt-3 border-t border-white/15 pt-3">
        <div className="flex items-baseline justify-between gap-2 text-[12px]">
          <span className="font-semibold text-white/85">{footer.label}</span>
          <span className="text-[15px] font-extrabold tabular-nums">{footer.value}</span>
        </div>
        {/* çubuk yoksa da yer tutulur; iki büyük bloğun alt satırları hizalı kalır */}
        <div className={`mt-1.5 h-2 overflow-hidden rounded-full bg-white/20 ${footer.bar == null ? "invisible" : ""}`} aria-hidden="true">
          {footer.bar != null && <div className="bn-fill h-full rounded-full bg-white" style={{ width: `${footer.bar}%` }} />}
        </div>
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
      className={`bn-rise col-span-2 rounded-2xl p-3 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none sm:p-4 ${t.wrap}`}
    >
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <p className={`text-[12.5px] font-semibold ${t.ink}`}>{s.label}</p>
        <span className={`shrink-0 whitespace-nowrap rounded-full px-1.5 py-px text-[10.5px] font-bold tabular-nums bg-[var(--surface)] ${t.ink}`}>
          {s.count.toLocaleString("tr-TR")} adet
        </span>
      </div>
      <p className="mt-2.5 text-[16px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px]">
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
          <span className="hidden sm:inline">düne göre</span>
        </p>
      )}
    </div>
  );
}

const CHART_TYPES = [
  { key: "bar", label: "Sütun", icon: "report" },
  { key: "line", label: "Çizgi", icon: "trendingUp" },
];

// Haftalık hacim kartı: kullanıcı sütun ya da çizgi grafiği seçer; seçim tarayıcıda hatırlanır.
// Büyüt düğmesi grafiği ekranın ortasında büyük bir pencerede açar.
function ChartCard() {
  const [type, setType] = useState("bar");
  const [expanded, setExpanded] = useState(false);
  const expandRef = useRef(null);
  const total = WEEK.reduce((a, w) => a + w.k, 0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nkb-bento-chart");
      if (saved === "bar" || saved === "line") setType(saved);
    } catch (e) {}
  }, []);

  const choose = (next) => {
    setType(next);
    try {
      localStorage.setItem("nkb-bento-chart", next);
    } catch (e) {}
  };

  const close = () => {
    setExpanded(false);
    expandRef.current?.focus();
  };

  const subtitle = `Son 7 gün · toplam ₺ ${(total / 1000).toFixed(2).replace(".", ",")}M`;

  return (
    <section style={{ "--i": 5 }} className={`bn-rise p-4 lg:col-span-2 ${CARD}`} aria-labelledby="bn-chart-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="bn-chart-title" className="text-sm font-bold text-[var(--fg)]">
            Haftalık İşlem Hacmi
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TrendBadge />
          <ChartTypeToggle type={type} onChange={choose} />
          <button
            ref={expandRef}
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Grafiği büyüt"
            title="Büyüt"
            className={`grid h-8 w-8 place-items-center rounded-full bg-[var(--soft)] text-[var(--muted)] ring-1 ring-[var(--border)] transition hover:text-[var(--brand-text)] ${FOCUS}`}
          >
            <I name="maximize" size={14} />
          </button>
        </div>
      </div>

      {type === "bar" ? <BarChart /> : <LineChart />}

      {expanded && (
        <Pencere baslik="Haftalık İşlem Hacmi" altBaslik={subtitle} onClose={close}>
          <div className="flex flex-wrap items-center gap-2">
            <TrendBadge />
            <ChartTypeToggle type={type} onChange={choose} />
          </div>
          {type === "bar" ? <BarChart large /> : <LineChart large />}
        </Pencere>
      )}
    </section>
  );
}

function TrendBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--success-text)]">
      <TrendArrow up />
      %12,4 geçen haftaya göre
    </span>
  );
}

function ChartTypeToggle({ type, onChange }) {
  return (
    <div role="group" aria-label="Grafik türü" className="flex items-center rounded-full bg-[var(--soft)] p-0.5 ring-1 ring-[var(--border)]">
      {CHART_TYPES.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onChange(c.key)}
          aria-pressed={type === c.key}
          title={`${c.label} grafik`}
          className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11.5px] transition ${
            type === c.key ? "bg-[var(--surface)] font-bold text-[var(--brand-text)] shadow-sm" : "font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
          } ${FOCUS}`}
        >
          <I name={c.icon} size={13} />
          {c.label}
        </button>
      ))}
    </div>
  );
}

// Ortak pencere (modal): büyütülmüş grafik, iptal/iade talebi, red gerekçesi. Temanın renk değişkenleri için
// sayfanın kök öğesine (#bn-root) taşınır; kart üzerine gelince oluşan transform da sabit konumu bozmaz.
function Pencere({ baslik, altBaslik, onClose, genislik = "max-w-5xl", children }) {
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

// large: büyütülmüş pencerede daha yüksek alan, daha geniş sütunlar ve tüm günlerin tutarı görünür
function BarChart({ large = false }) {
  const maxK = Math.max(...WEEK.map((w) => w.k));
  return (
    <>
      <div className={`relative ${large ? "mt-10 h-[min(52vh,440px)] min-h-[220px]" : "mt-6 h-40"}`}>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="border-t border-dashed border-[var(--border)]" />
          ))}
          <span className="border-t border-[var(--border-strong)]" />
        </div>
        <div className="relative flex h-full items-end justify-around gap-2">
          {WEEK.map((w, i) => (
            <div key={w.d} className="group flex h-full flex-1 items-end justify-center">
              <div className={`relative w-full ${large ? "max-w-[64px]" : "max-w-[32px]"}`} style={{ height: `${(w.k / AXIS_MAX) * 100}%` }}>
                <div
                  style={{ "--i": i }}
                  className={`bn-grow h-full w-full rounded-t-[10px] bg-[linear-gradient(180deg,var(--chart-to),var(--chart-from))] transition-opacity duration-200 group-hover:opacity-100 ${
                    w.k === maxK ? "opacity-100" : "opacity-45"
                  }`}
                />
                <span
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--fg)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--bg)] transition-all duration-200 ${
                    large || w.k === maxK ? "opacity-100" : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
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
    </>
  );
}

// Tasarım 04'teki (Nova) alan grafiği: gün gün okunur; boşta en yüksek gün seçilidir.
function LineChart({ large = false }) {
  const W = 640;
  const H = 200;
  const values = WEEK.map((w) => w.k);
  const max = Math.max(...values);
  const step = (W - 24) / (values.length - 1);
  const pts = values.map((v, i) => [12 + i * step, H - 12 - (v / max) * (H - 52)]);
  const line = curveThrough(pts);
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`;
  const maxI = values.indexOf(max);
  const [active, setActive] = useState(maxI);
  const ax = (pts[active][0] / W) * 100;
  const ay = (pts[active][1] / H) * 100;
  // aynı anda kartta ve pencerede çizildiğinde gradyan kimlikleri çakışmasın
  const fillId = `bn-line-fill-${useId().replace(/:/g, "")}`;

  return (
    <>
      <div className={`relative ${large ? "mt-10 h-[min(52vh,440px)] min-h-[220px]" : "mt-6 h-40"}`} onMouseLeave={() => setActive(maxI)}>
        <div className="bn-wipe absolute inset-0">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Haftalık işlem hacmi çizgi grafiği">
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-from)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--chart-from)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" x2={W} y1={g * H} y2={g * H} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            ))}
            <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--border-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={area} fill={`url(#${fillId})`} />
            <path d={line} fill="none" stroke="var(--chart-from)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {pts.map((p, i) => (
            <span
              key={WEEK[i].d}
              aria-hidden="true"
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--surface)] bg-[var(--chart-from)] transition-all duration-200 ${
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
        {/* uçtaki günlerde etiket kart dışına taşmasın diye içeri hizalanır */}
        <span
          className={`pointer-events-none absolute -translate-y-full whitespace-nowrap rounded-full bg-[var(--fg)] px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-[var(--bg)] transition-[left,top] duration-200 motion-reduce:transition-none ${
            active === 0 ? "-translate-x-2" : active === pts.length - 1 ? "-translate-x-[calc(100%-8px)]" : "-translate-x-1/2"
          }`}
          style={{ left: `${ax}%`, top: `calc(${ay}% - 12px)` }}
        >
          {WEEK[active].d} · ₺ {WEEK[active].k}K
        </span>

        {/* gün gün okuma alanları */}
        {pts.map((p, i) => (
          <button
            key={WEEK[i].d}
            type="button"
            aria-label={`${WEEK[i].d}: ₺ ${WEEK[i].k}K`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="absolute inset-y-0 -translate-x-1/2 cursor-default rounded-lg focus:outline-none focus-visible:bg-[var(--soft)]"
            style={{ left: `${(p[0] / W) * 100}%`, width: `${(step / W) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative mt-2 h-4 text-[11px]">
        {pts.map((p, i) => (
          <span
            key={WEEK[i].d}
            className={`absolute -translate-x-1/2 transition-colors ${i === active ? "font-bold text-[var(--brand-text)]" : "font-medium text-[var(--muted)]"}`}
            style={{ left: `${(p[0] / W) * 100}%` }}
          >
            {WEEK[i].d}
          </span>
        ))}
      </div>
    </>
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

function TransactionsCard({ role, onSeeAll }) {
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
          onClick={onSeeAll}
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
            {rolIslemleri(role).slice(0, 6).map((t, i) => (
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

function QuickCard({ onNavigate }) {
  return (
    <section style={{ "--i": 8 }} className={`bn-rise p-2 ${CARD}`} aria-labelledby="bn-quick-title">
      <h2 id="bn-quick-title" className="px-2 pb-1 pt-2 text-sm font-bold text-[var(--fg)]">
        Hızlı İşlemler
      </h2>
      <ul>
        {QUICK.map((q) => (
          <li key={q.label}>
            <button
              type="button"
              onClick={isReady(q.href) ? () => onNavigate(q.href) : undefined}
              className={`group flex h-12 w-full items-center gap-2.5 rounded-xl px-2 text-left transition-colors hover:bg-[var(--soft)] ${FOCUS}`}
            >
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

// Sayfa başlığının üstündeki konum satırı: Ana Sayfa › grup › ekran
function Konum({ onHome, yol }) {
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

// ---- Raporlar › İşlem Detayları ------------------------------------------------------------
const DURUMLAR = ["Tümü", "Başarılı", "Başarısız", "İptal", "İade"];
const TIPLER = ["Tümü", "Manuel", "Link"];
const MUSTERI_TURLERI = ["Bayi", "Alt Bayi", "Düzenli Müşteri", "Düzensiz Müşteri", "Kendi Kartı"];
const KAPSAM = {
  [ROLES.ANA_FIRMA]: "Tüm bayi ve alt bayi işlemleri",
  [ROLES.BAYI]: "Kendi ve alt bayi işlemleri",
  [ROLES.ALT_BAYI]: "Kendi işlemleri",
};

function musteriTuruTone(tur) {
  if (tur === "Bayi" || tur === "Alt Bayi") return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  if (tur === "Kendi Kartı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (tur === "Düzensiz Müşteri") return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
  return "bg-[var(--soft-2)] text-[var(--fg-2)]";
}

function IslemDetaylari({ role, meta, onHome }) {
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("Tümü");
  const [tip, setTip] = useState("Tümü");
  const [tur, setTur] = useState("Tümü");

  const kaynak = rolIslemleri(role);
  // alt bayi yalnızca kendi işlemlerini gördüğü için "çekim yapan" sütunu ona gösterilmez
  const yapanGoster = role !== ROLES.ALT_BAYI;
  const turler = MUSTERI_TURLERI.filter((m) => kaynak.some((t) => t.musteriTuru === m));

  const kucuk = (x) => x.toLocaleLowerCase("tr-TR");
  const aranan = kucuk(arama.trim());
  // durum sekmelerindeki adetler diğer filtrelere göre güncellenir
  const adaylar = kaynak.filter(
    (t) =>
      (tip === "Tümü" || t.tip === tip) &&
      (tur === "Tümü" || t.musteriTuru === tur) &&
      (!aranan || [t.id, t.musteri, t.cari, t.vergiNo, t.kart, t.yapan].some((f) => kucuk(f).includes(aranan)))
  );
  const satirlar = adaylar.filter((t) => durum === "Tümü" || t.durum === durum);
  const adet = (d) => (d === "Tümü" ? adaylar.length : adaylar.filter((t) => t.durum === d).length);
  const toplamTutar = satirlar.reduce((a, t) => a + parseAmount(t.tutar), 0);
  const basariliTutar = satirlar.filter((t) => t.durum === "Başarılı").reduce((a, t) => a + parseAmount(t.tutar), 0);
  const filtreVar = arama !== "" || durum !== "Tümü" || tip !== "Tümü" || tur !== "Tümü";
  const temizle = () => {
    setArama("");
    setDurum("Tümü");
    setTip("Tümü");
    setTur("Tümü");
  };
  const tl = (n) => `₺ ${n.toLocaleString("tr-TR")}`;
  const selectCls = `h-9 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[12.5px] font-medium text-[var(--fg-2)] ${FOCUS}`;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={onHome} yol={["Raporlar", "İşlem Detayları"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">İşlem Detayları</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {KAPSAM[role]}
          </p>
        </div>
        <button
          type="button"
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] md:self-auto ${FOCUS}`}
        >
          <I name="download" size={14} />
          Dışa Aktar
        </button>
      </div>

      {/* filtrelenen işlemlerin özeti */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "İşlem", value: satirlar.length.toLocaleString("tr-TR"), ink: "text-[var(--brand-text)]", wrap: "bg-[var(--brand-soft)]" },
          { label: "Toplam tutar", value: tl(toplamTutar), ink: "text-[var(--brand-text)]", wrap: "border border-[var(--border)] bg-[var(--surface)]" },
          { label: "Başarılı tutar", value: tl(basariliTutar), ink: "text-[var(--success-text)]", wrap: "bg-[var(--success-soft)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className="mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px]">{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İşlem listesi">
        {/* filtreler */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div role="group" aria-label="Durum" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            {DURUMLAR.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurum(d)}
                aria-pressed={durum === d}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  durum === d ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {d}
                <span
                  className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${
                    durum === d ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {adet(d)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative block sm:w-60">
              <span className="sr-only">İşlem ara</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <I name="search" size={14} />
              </span>
              <input
                type="search"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="İşlem no, unvan, cari, vergi no"
                className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
              />
            </label>
            <select aria-label="Müşteri türü" value={tur} onChange={(e) => setTur(e.target.value)} className={selectCls}>
              <option value="Tümü">Tüm müşteri türleri</option>
              {turler.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select aria-label="Ödeme tipi" value={tip} onChange={(e) => setTip(e.target.value)} className={selectCls}>
              {TIPLER.map((t) => (
                <option key={t} value={t}>
                  {t === "Tümü" ? "Tüm ödeme tipleri" : t === "Link" ? "Link ile ödeme" : "Manuel ödeme"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th scope="col" className={th}>İşlem No</th>
                <th scope="col" className={th}>Tarih</th>
                {yapanGoster && <th scope="col" className={th}>Çekim Yapan</th>}
                <th scope="col" className={th}>Müşteri Türü</th>
                <th scope="col" className={th}>Unvan / Cari No</th>
                <th scope="col" className={th}>Vergi No</th>
                <th scope="col" className={th}>Ödeme</th>
                <th scope="col" className={`${th} text-right`}>Tutar</th>
                <th scope="col" className={th}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((t, i) => (
                <tr key={t.id} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                  <td className={`${td} font-bold text-[var(--brand-text)]`}>{t.id}</td>
                  <td className={`${td} tabular-nums text-[var(--muted)]`}>{t.tarih}</td>
                  {yapanGoster && (
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg-2)]">{t.yapan}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{firmaTuru(t.yapan)}</span>
                    </td>
                  )}
                  <td className={td}>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${musteriTuruTone(t.musteriTuru)}`}>{t.musteriTuru}</span>
                  </td>
                  <td className={td}>
                    <span className="block font-semibold text-[var(--fg)]">{t.musteri}</span>
                    <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.cari}</span>
                  </td>
                  <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{t.vergiNo}</td>
                  <td className={td}>
                    <span className="flex items-center gap-1 tabular-nums text-[var(--fg-2)]">
                      <I name={t.tip === "Link" ? "link" : "wallet"} size={13} className="text-[var(--muted)]" />
                      {t.kart}
                    </span>
                    <span className="block text-[11px] text-[var(--muted)]">
                      {t.tip} · {t.taksit === "Tek Çekim" ? "Tek çekim" : `${t.taksit} taksit`}
                    </span>
                  </td>
                  <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{t.tutar}</td>
                  <td className={td}>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${pillTone(t.durum)}`}>{t.durum}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {satirlar.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--soft)] text-[var(--muted)]">
                <I name="search" size={16} />
              </span>
              <p className="text-[13px] font-bold text-[var(--fg)]">Bu filtrelere uyan işlem yok</p>
              <button type="button" onClick={temizle} className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                Filtreleri temizle
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2.5 text-[11.5px] text-[var(--muted)]">
          <span>
            {kaynak.length} işlemden <b className="font-bold text-[var(--fg-2)]">{satirlar.length}</b> tanesi gösteriliyor
          </span>
          {filtreVar && satirlar.length > 0 && (
            <button type="button" onClick={temizle} className={`rounded-full font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
              Filtreleri temizle
            </button>
          )}
        </div>
      </section>
    </>
  );
}

// ---- Ödeme Al › Manuel Ödeme --------------------------------------------------------------
// Şartname s.6 (tahsilat ekranları), s.5 (taksit sınırı, işlem bazlı limit, ortaklar),
// s.4 (vade farkı profili), s.9 (müşteri kartında fatura beyanı). Mockup: kart bilgisi hiçbir yere gönderilmez.
const MUSTERI_SECENEKLERI = {
  [ROLES.ANA_FIRMA]: ["Bayi", "Düzenli Müşteri", "Düzensiz Müşteri"],
  [ROLES.BAYI]: ["Alt Bayi", "Düzenli Müşteri", "Düzensiz Müşteri", "Kendi Kartı"],
  [ROLES.ALT_BAYI]: ["Müşteri Kartı", "Kendi Kartı"],
};
const TAHSILAT_CARISI = {
  [ROLES.ANA_FIRMA]: "Üye İşyeri",
  [ROLES.BAYI]: "Ana Firma Carisi",
  [ROLES.ALT_BAYI]: "Bayi Carisi",
};
// tanımlı (listeden seçilen) müşteri türleri
const LISTELI = new Set(["Bayi", "Alt Bayi", "Düzenli Müşteri"]);
const ANA_FIRMA_TAKSITLER = [1, 2, 3, 6, 9, 12];

// Rolün kendi bayi / alt bayi kaydı: taksit sınırı, işlem limiti, vade profili, ortaklar
function firmaKaydi(role) {
  const ad = ROLE_META[role].company;
  return bayiler.find((b) => b.unvan === ad) || altBayiler.find((b) => b.unvan === ad) || null;
}

// "Profil 2" → { ad: "Vade Farkı Profil 2", oran: 2.45 }
function vadeProfili(kisaAd) {
  const p = vadeFarkiProfilleri.find((v) => v.ad.endsWith(kisaAd));
  return p ? { ad: p.ad, oran: Number(p.oran.replace("%", "").replace(",", ".")) } : null;
}

// "12.400,50" → 12400.5 (boş ya da geçersizse NaN)
function tutarCoz(metin) {
  const t = metin.replace(/[₺\s.]/g, "").replace(",", ".");
  return t === "" ? NaN : Number(t);
}

const tl2 = (n) => `₺ ${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const rakamlar = (x) => x.replace(/\D/g, "");

function inputCls(hata) {
  return `h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] read-only:bg-[var(--soft)] read-only:text-[var(--fg-2)] ${
    hata ? "border-[var(--danger)]" : "border-[var(--border-strong)]"
  }`;
}

function Alan({ id, etiket, hata, ipucu, className = "", children }) {
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

function FormBolum({ no, baslik, aciklama, i, children }) {
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
function MusteriSecici({ id, secenekler, secili, onSec, hata }) {
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

// Müşteri seçimi — manuel ödeme ve link ile ödeme aynı yapıyı kullanır (şartname s.6)
const BOS_KISI = { ad: "", vkn: "", tel: "", email: "" };

function useMusteriSecimi(role, meta) {
  const turler = MUSTERI_SECENEKLERI[role];
  const kayit = firmaKaydi(role);
  const cariler =
    role === ROLES.ALT_BAYI
      ? bayiler.filter((b) => b.unvan === meta.parent).map((b) => ({ ad: b.unvan, cari: b.cari }))
      : anaFirma.uyeIsyerleri;

  const [tur, setTurDurumu] = useState(turler[0]);
  const [secili, setSecili] = useState(null);
  const [kendi, setKendi] = useState("");
  const [kisi, setKisi] = useState(BOS_KISI);
  const [cari, setCari] = useState(cariler[0]?.cari || "");

  // listeden seçilecek müşteriler
  const secenekler =
    tur === "Bayi"
      ? bayiler.filter((b) => b.durum === "Aktif")
      : tur === "Alt Bayi"
        ? altBayiler.filter((b) => b.durum === "Aktif")
        : musteriler.filter((x) => x.sahip === meta.company);
  // kendi kartı: firmanın kendi unvanı ya da ortakları
  const kendiSecenekleri = [{ ad: meta.company, rol: "Firma unvanı" }, ...(kayit?.ortaklar || []).map((o) => ({ ad: o, rol: "Ortak" }))];
  const kendiKarti = tur === "Kendi Kartı";

  const hatalar = {};
  if (LISTELI.has(tur) && !secili) hatalar.musteri = "Listeden bir müşteri seçin.";
  if (tur === "Düzensiz Müşteri" || tur === "Müşteri Kartı") {
    if (!kisi.ad.trim()) hatalar.ad = "Ad soyad ya da unvan girin.";
    if (rakamlar(kisi.tel).length < 10) hatalar.tel = "Geçerli bir telefon numarası girin.";
  }
  if (tur === "Düzensiz Müşteri" && ![10, 11].includes(rakamlar(kisi.vkn).length)) hatalar.vkn = "10 haneli VKN ya da 11 haneli TCKN girin.";
  if (kendiKarti && !kendi) hatalar.kendi = "Kartın kime ait olduğunu seçin.";

  return {
    turler,
    kayit,
    cariler,
    tur,
    secili,
    setSecili,
    kendi,
    setKendi,
    kisi,
    setKisi,
    cari,
    setCari,
    secenekler,
    kendiSecenekleri,
    kendiKarti,
    hatalar,
    ad: LISTELI.has(tur) ? secili?.unvan : kendiKarti ? kendi : kisi.ad.trim(),
    // link gönderiminde öneri olarak kullanılan iletişim bilgisi
    iletisim: LISTELI.has(tur)
      ? { tel: secili?.telefon || "", email: secili?.email || "" }
      : kendiKarti
        ? { tel: kayit?.telefon || "", email: kayit?.email || "" }
        : { tel: kisi.tel, email: kisi.email },
    cariAdi: cariler.find((c) => c.cari === cari),
    setTur: (t) => {
      setTurDurumu(t);
      setSecili(null);
      setKendi("");
    },
    sifirla: () => {
      setTurDurumu(turler[0]);
      setSecili(null);
      setKendi("");
      setKisi(BOS_KISI);
    },
  };
}

// Taksit sınırı, işlem limiti ve vade profili bayi tanımından gelir; ana firma bayiden tahsilatta o bayinin profilini uygular
function odemeKosullari(kayit, tur, secili) {
  return {
    taksitler: kayit ? kayit.taksitler : ANA_FIRMA_TAKSITLER,
    limit: kayit ? kayit.islemLimiti : null,
    profil: vadeProfili(kayit ? kayit.vadeProfil : tur === "Bayi" && secili ? secili.vadeProfil : "Profil 1"),
  };
}

function vadeHesabi(tutar, n, profil) {
  const vade = tutar > 0 && n > 1 && profil ? (tutar * profil.oran * (n - 1)) / 100 : 0;
  const toplam = tutar + vade;
  return { vade, toplam, aylik: toplam / n };
}

function MusteriBolumu({ role, m, h }) {
  const { turler, tur, setTur, secenekler, secili, setSecili, kisi, setKisi, kendiKarti, kendiSecenekleri, kendi, setKendi, cariler, cari, setCari } = m;
  return (
    <>
      <div role="radiogroup" aria-label="Müşteri türü" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
        {turler.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={tur === t}
            onClick={() => setTur(t)}
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-[12.5px] transition ${
              tur === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
            } ${FOCUS}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LISTELI.has(tur) && (
          <Alan id="bn-musteri" etiket={tur === "Düzenli Müşteri" ? "Tanımlı müşteri" : tur} hata={h("musteri")} className="sm:col-span-2">
            <MusteriSecici key={tur} id="bn-musteri" secenekler={secenekler} secili={secili} onSec={setSecili} hata={h("musteri")} />
          </Alan>
        )}

        {LISTELI.has(tur) && secili && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--soft)] p-3 text-[12px] sm:col-span-2 sm:grid-cols-4">
            {[
              ["Cari No", secili.cari],
              ["Vergi No", secili.vergiNo],
              ["Telefon", secili.telefon],
              ["E-posta", secili.email],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[11px] text-[var(--muted)]">{k}</dt>
                <dd className="truncate font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {(tur === "Düzensiz Müşteri" || tur === "Müşteri Kartı") && (
          <>
            <Alan id="bn-ad" etiket="Ad soyad / Unvan" hata={h("ad")}>
              <input
                id="bn-ad"
                value={kisi.ad}
                onChange={(e) => setKisi({ ...kisi, ad: e.target.value })}
                aria-invalid={h("ad") ? true : undefined}
                autoComplete="name"
                className={inputCls(h("ad"))}
              />
            </Alan>
            {tur === "Düzensiz Müşteri" && (
              <Alan id="bn-vkn" etiket="TCKN / VKN" hata={h("vkn")}>
                <input
                  id="bn-vkn"
                  inputMode="numeric"
                  maxLength={11}
                  value={kisi.vkn}
                  onChange={(e) => setKisi({ ...kisi, vkn: rakamlar(e.target.value) })}
                  aria-invalid={h("vkn") ? true : undefined}
                  className={`${inputCls(h("vkn"))} tabular-nums`}
                />
              </Alan>
            )}
            <Alan id="bn-tel" etiket="Telefon" hata={h("tel")}>
              <input
                id="bn-tel"
                type="tel"
                inputMode="tel"
                placeholder="05XX XXX XX XX"
                value={kisi.tel}
                onChange={(e) => setKisi({ ...kisi, tel: e.target.value })}
                aria-invalid={h("tel") ? true : undefined}
                autoComplete="tel"
                className={`${inputCls(h("tel"))} tabular-nums`}
              />
            </Alan>
            <Alan id="bn-eposta" etiket="E-posta (isteğe bağlı)">
              <input
                id="bn-eposta"
                type="email"
                value={kisi.email}
                onChange={(e) => setKisi({ ...kisi, email: e.target.value })}
                autoComplete="email"
                className={inputCls()}
              />
            </Alan>
            {tur === "Düzensiz Müşteri" && (
              <p className="flex items-start gap-1.5 text-[11.5px] text-[var(--muted)] sm:col-span-2">
                <I name="info" size={13} className="mt-px shrink-0" />
                Düzensiz müşteride bilgiler bu alanlarla sınırlıdır; müşteri tanımı oluşturulmaz.
              </p>
            )}
          </>
        )}

        {kendiKarti && (
          <fieldset className="sm:col-span-2" aria-describedby={h("kendi") ? "bn-kendi-hata" : undefined}>
            <legend className="mb-1 block text-[12px] font-semibold text-[var(--fg-2)]">Kart sahibi</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {kendiSecenekleri.map((o) => (
                <label
                  key={o.ad}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                    kendi === o.ad ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="bn-kendi"
                    value={o.ad}
                    checked={kendi === o.ad}
                    onChange={() => setKendi(o.ad)}
                    aria-invalid={h("kendi") ? true : undefined}
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[12.5px] font-bold text-[var(--fg)]">{o.ad}</span>
                    <span className="block text-[11px] text-[var(--muted)]">{o.rol}</span>
                  </span>
                </label>
              ))}
            </div>
            {h("kendi") && (
              <p id="bn-kendi-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                {h("kendi")}
              </p>
            )}
          </fieldset>
        )}

        <Alan
          id="bn-cari"
          etiket={TAHSILAT_CARISI[role]}
          ipucu={role === ROLES.ANA_FIRMA ? "Ödemenin alınacağı üye işyeri." : "Ödemenin aktarılacağı cari."}
          className="sm:col-span-2"
        >
          <select id="bn-cari" value={cari} onChange={(e) => setCari(e.target.value)} className={inputCls()}>
            {cariler.map((c) => (
              <option key={c.cari} value={c.cari}>
                {c.ad} — {c.cari}
              </option>
            ))}
          </select>
        </Alan>
      </div>
    </>
  );
}

function ManuelOdeme({ role, meta, onNavigate }) {
  const m = useMusteriSecimi(role, meta);
  const { kayit, tur, secili, kendi, kendiKarti, cariAdi } = m;
  const [tutarMetni, setTutarMetni] = useState("");
  const [taksit, setTaksit] = useState(1);
  const [aciklama, setAciklama] = useState("");
  const [kart, setKart] = useState({ isim: "", no: "", skt: "", cvv: "" });
  const [beyan, setBeyan] = useState(false);
  const [denendi, setDenendi] = useState(false);
  const [durum, setDurum] = useState("form"); // form | isleniyor | tamam
  const zamanRef = useRef(null);
  useEffect(() => () => clearTimeout(zamanRef.current), []);

  const { taksitler, limit, profil } = odemeKosullari(kayit, tur, secili);
  const secilenTaksit = taksitler.includes(taksit) ? taksit : 1;

  const tutar = tutarCoz(tutarMetni);
  const gecerliTutar = Number.isFinite(tutar) && tutar > 0;
  const hesap = (n) => vadeHesabi(gecerliTutar ? tutar : 0, n, profil);
  const ozet = hesap(secilenTaksit);

  const kartIsmi = kendiKarti ? kendi : kart.isim;

  // doğrulama (müşteri alanlarının hataları kancadan gelir)
  const hatalar = { ...m.hatalar };
  if (!gecerliTutar) hatalar.tutar = "Tutar girin.";
  else if (limit && tutar > limit) hatalar.tutar = `İşlem bazlı ödeme limiti ₺ ${limit.toLocaleString("tr-TR")}.`;
  if (!kartIsmi.trim()) hatalar.isim = "Kart üzerindeki ismi girin.";
  if (rakamlar(kart.no).length !== 16) hatalar.no = "16 haneli kart numarasını girin.";
  const [ay, yil] = kart.skt.split("/").map((x) => Number(x));
  const simdi = new Date();
  const yy = simdi.getFullYear() % 100;
  if (!(ay >= 1 && ay <= 12 && (yil > yy || (yil === yy && ay >= simdi.getMonth() + 1)))) hatalar.skt = "AA/YY biçiminde geçerli bir tarih girin.";
  if (rakamlar(kart.cvv).length !== 3) hatalar.cvv = "3 haneli güvenlik kodu.";
  if (!kendiKarti && !beyan) hatalar.beyan = "Müşteri kartıyla ödemede beyanı onaylayın.";
  const h = (k) => (denendi ? hatalar[k] : undefined);

  const musteriAdi = m.ad;

  const gonder = (e) => {
    e.preventDefault();
    setDenendi(true);
    if (Object.keys(hatalar).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-manuel [aria-invalid="true"]')?.focus());
      return;
    }
    setDurum("isleniyor");
    zamanRef.current = setTimeout(() => setDurum("tamam"), 900);
  };
  const yeniOdeme = () => {
    m.sifirla();
    setTutarMetni("");
    setTaksit(1);
    setAciklama("");
    setKart({ isim: "", no: "", skt: "", cvv: "" });
    setBeyan(false);
    setDenendi(false);
    setDurum("form");
  };

  const baslik = (
    <div className="bn-rise mb-4 px-1">
      <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", "Manuel Ödeme"]} />
      <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Manuel Ödeme</h1>
      <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{meta.company} · Kart bilgisiyle tahsilat</p>
    </div>
  );

  if (durum === "tamam") {
    const satirlar = [
      ["İşlem No", "TRX-90243"],
      ["Müşteri", `${musteriAdi} · ${tur}`],
      [TAHSILAT_CARISI[role], cariAdi ? `${cariAdi.ad} — ${cariAdi.cari}` : "—"],
      ["Kart", `**** ${rakamlar(kart.no).slice(-4)} · ${kartIsmi}`],
      ["Taksit", secilenTaksit === 1 ? "Tek çekim" : `${secilenTaksit} taksit × ${tl2(ozet.aylik)}`],
      ["Tutar", tl2(tutar)],
      ["Vade farkı", tl2(ozet.vade)],
    ];
    return (
      <>
        {baslik}
        <section className={`bn-pop mx-auto max-w-xl p-5 text-center sm:p-7 ${CARD} hover:!translate-y-0`} aria-live="polite">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success-text)]">
            <I name="check" size={26} strokeWidth={2.4} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-[var(--fg)]">Ödeme alındı</h2>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">Karttan çekilen toplam</p>
          <p className="mt-1 text-[28px] font-extrabold tabular-nums tracking-tight text-[var(--fg)]">{tl2(ozet.toplam)}</p>
          <dl className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] text-left text-[12.5px]">
            {satirlar.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          {!kendiKarti && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] px-3 py-2 text-left text-[12px] font-medium text-[var(--warning-text)]">
              <I name="info" size={15} className="mt-px shrink-0" />
              Bu işlemin faturasını Raporlar › Fatura Yükleme Detay ekranından yüklemeyi unutmayın.
            </p>
          )}
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={yeniOdeme}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}
            >
              <I name="plus" size={15} />
              Yeni Ödeme
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/raporlar/islem-detaylari")}
              className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              İşlem Detayları
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {baslik}
      <form id="bn-manuel" noValidate onSubmit={gonder} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* 1 — müşteri */}
          <FormBolum no={1} i={0} baslik="Müşteri" aciklama="Müşteri türünü seçin; tanımlı müşteriler listeden gelir.">
            <MusteriBolumu role={role} m={m} h={h} />
          </FormBolum>

          {/* 2 — tutar ve taksit */}
          <FormBolum
            no={2}
            i={1}
            baslik="Tutar ve Taksit"
            aciklama={kayit ? "Taksit seçenekleri bayi tanımındaki taksit sınırına göre gösterilir." : "Bayiden tahsilatta o bayinin vade farkı profili uygulanır."}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Alan id="bn-tutar" etiket="Tutar" hata={h("tutar")} ipucu={limit ? `İşlem bazlı ödeme limiti: ₺ ${limit.toLocaleString("tr-TR")}` : undefined}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                  <input
                    id="bn-tutar"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={tutarMetni}
                    onChange={(e) => setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""))}
                    onBlur={() => gecerliTutar && setTutarMetni(tutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                    aria-invalid={h("tutar") ? true : undefined}
                    className={`${inputCls(h("tutar"))} pl-7 text-[15px] font-bold tabular-nums`}
                  />
                </div>
              </Alan>
              <Alan id="bn-aciklama" etiket="Açıklama (isteğe bağlı)">
                <input id="bn-aciklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Örn. Eylül faturası" className={inputCls()} />
              </Alan>
            </div>

            <div role="radiogroup" aria-label="Taksit" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {taksitler.map((n) => {
                const x = hesap(n);
                const secik = secilenTaksit === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={secik}
                    onClick={() => setTaksit(n)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      secik ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                    } ${FOCUS}`}
                  >
                    <span className={`block text-[12.5px] font-bold ${secik ? "text-[var(--brand-text)]" : "text-[var(--fg)]"}`}>
                      {n === 1 ? "Tek Çekim" : `${n} Taksit`}
                    </span>
                    <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--muted)]">
                      {gecerliTutar ? (n === 1 ? tl2(x.toplam) : `${tl2(x.aylik)} / ay`) : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormBolum>

          {/* 3 — kart */}
          <FormBolum no={3} i={2} baslik="Kart Bilgileri" aciklama="Bu bir mockup'tır; kart bilgisi hiçbir yere gönderilmez.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Alan
                id="bn-kart-isim"
                etiket="Kart üzerindeki isim"
                hata={h("isim")}
                ipucu={kendiKarti ? "Kendi kartında seçilen kişiden otomatik gelir, değiştirilemez." : undefined}
                className="col-span-2"
              >
                <div className="relative">
                  <input
                    id="bn-kart-isim"
                    value={kartIsmi}
                    readOnly={kendiKarti}
                    onChange={(e) => setKart({ ...kart, isim: e.target.value })}
                    aria-invalid={h("isim") ? true : undefined}
                    autoComplete="cc-name"
                    className={`${inputCls(h("isim"))} ${kendiKarti ? "pr-9" : ""}`}
                  />
                  {kendiKarti && <I name="lock" size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />}
                </div>
              </Alan>
              <Alan id="bn-kart-no" etiket="Kart numarası" hata={h("no")} className="col-span-2">
                <div className="relative">
                  <I name="card" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    id="bn-kart-no"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={kart.no}
                    onChange={(e) =>
                      setKart({
                        ...kart,
                        no: rakamlar(e.target.value)
                          .slice(0, 16)
                          .replace(/(\d{4})(?=\d)/g, "$1 "),
                      })
                    }
                    aria-invalid={h("no") ? true : undefined}
                    autoComplete="cc-number"
                    className={`${inputCls(h("no"))} pl-9 tabular-nums`}
                  />
                </div>
              </Alan>
              <Alan id="bn-skt" etiket="Son kullanma" hata={h("skt")}>
                <input
                  id="bn-skt"
                  inputMode="numeric"
                  placeholder="AA/YY"
                  value={kart.skt}
                  onChange={(e) => {
                    const r = rakamlar(e.target.value).slice(0, 4);
                    setKart({ ...kart, skt: r.length > 2 ? `${r.slice(0, 2)}/${r.slice(2)}` : r });
                  }}
                  aria-invalid={h("skt") ? true : undefined}
                  autoComplete="cc-exp"
                  className={`${inputCls(h("skt"))} tabular-nums`}
                />
              </Alan>
              <Alan id="bn-cvv" etiket="Güvenlik kodu" hata={h("cvv")}>
                <input
                  id="bn-cvv"
                  inputMode="numeric"
                  placeholder="CVV"
                  value={kart.cvv}
                  onChange={(e) => setKart({ ...kart, cvv: rakamlar(e.target.value).slice(0, 3) })}
                  aria-invalid={h("cvv") ? true : undefined}
                  autoComplete="cc-csc"
                  className={`${inputCls(h("cvv"))} tabular-nums`}
                />
              </Alan>
            </div>
          </FormBolum>
        </div>

        {/* özet + onay */}
        <aside style={{ "--i": 3 }} className={`bn-rise p-4 sm:p-5 lg:sticky lg:top-[76px] ${CARD} hover:!translate-y-0`} aria-label="Ödeme özeti">
          <h2 className="text-sm font-bold text-[var(--fg)]">Ödeme Özeti</h2>
          <dl className="mt-3 space-y-2 text-[12.5px]">
            {[
              ["Müşteri", musteriAdi || "—"],
              ["Müşteri türü", tur],
              [TAHSILAT_CARISI[role], cariAdi ? cariAdi.ad : "—"],
              ["Vade profili", profil ? `${profil.ad.replace("Vade Farkı ", "")} · %${profil.oran.toLocaleString("tr-TR")}` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                <dd className="truncate text-right font-semibold text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-[12.5px]">
            {[
              ["Tutar", gecerliTutar ? tl2(tutar) : "—"],
              ["Taksit", secilenTaksit === 1 ? "Tek çekim" : `${secilenTaksit} × ${gecerliTutar ? tl2(ozet.aylik) : "—"}`],
              ["Vade farkı", gecerliTutar ? tl2(ozet.vade) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5">
            <span className="text-[12px] font-semibold text-[var(--brand-text)]">Karttan çekilecek</span>
            <span className="text-[18px] font-extrabold tabular-nums text-[var(--fg)]">{gecerliTutar ? tl2(ozet.toplam) : "—"}</span>
          </div>

          {!kendiKarti && (
            <div className="mt-3">
              <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[12px] leading-snug ${h("beyan") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
                <input
                  type="checkbox"
                  checked={beyan}
                  onChange={(e) => setBeyan(e.target.checked)}
                  aria-invalid={h("beyan") ? true : undefined}
                  aria-describedby={h("beyan") ? "bn-beyan-hata" : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                />
                <span className="text-[var(--fg-2)]">
                  Kart müşteriye aittir. Kart sahibi ile aramızdaki faturayı <b className="font-bold">Fatura Yükleme</b> ekranından yükleyeceğimi beyan ederim.
                </span>
              </label>
              {h("beyan") && (
                <p id="bn-beyan-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                  {h("beyan")}
                </p>
              )}
            </div>
          )}

          {denendi && Object.keys(hatalar).length > 0 && (
            <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
              {Object.keys(hatalar).length} alanı kontrol edin.
            </p>
          )}

          <button
            type="submit"
            disabled={durum === "isleniyor"}
            className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] text-[13.5px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}
          >
            {durum === "isleniyor" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
                İşleniyor…
              </>
            ) : (
              <>
                <I name="lock" size={15} />
                Ödemeyi Al
              </>
            )}
          </button>
        </aside>
      </form>
    </>
  );
}

// ---- Ödeme Al › Link ile Ödeme ------------------------------------------------------------
// Şartname s.6: link oluşturulurken müşteri türü ve müşteri seçimi manuel ödemeyle aynı yapıda ilerler.
const KANALLAR = ["SMS", "E-posta", "Sadece link"];
const GECERLILIK = [1, 3, 7, 30];
const LINK_ADRESI = "https://link.nkolayislem.com.tr/b2b/";

function linkTone(durum) {
  if (durum === "Ödendi") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Bekliyor") return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  if (durum === "İptal Edildi") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  return "bg-[var(--soft-2)] text-[var(--muted)]"; // Süresi Doldu
}

// Date → "07.10.2026 16:20"
function tarihSaat(d) {
  const iki = (n) => String(n).padStart(2, "0");
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} ${iki(d.getHours())}:${iki(d.getMinutes())}`;
}

function KopyalaDugmesi({ metin, kucuk = false }) {
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

function LinkOdeme({ role, meta, onNavigate }) {
  const m = useMusteriSecimi(role, meta);
  const { kayit, tur, secili, kendiKarti, cariAdi } = m;
  const { taksitler, limit, profil } = odemeKosullari(kayit, tur, secili);

  const [tutarMetni, setTutarMetni] = useState("");
  const [kapali, setKapali] = useState([]); // müşteriye gösterilmeyecek taksitler
  const [gun, setGun] = useState(3);
  const [kanal, setKanal] = useState("SMS");
  const [hedef, setHedef] = useState({ tel: null, email: null }); // null → müşterinin kayıtlı bilgisi önerilir
  const [aciklama, setAciklama] = useState("");
  const [beyan, setBeyan] = useState(false);
  const [denendi, setDenendi] = useState(false);
  const [olusan, setOlusan] = useState(null);
  const [yeniler, setYeniler] = useState([]);
  const listeRef = useRef(null);

  // müşteri değişince gönderim bilgisi yeniden müşteriden önerilir
  useEffect(() => setHedef({ tel: null, email: null }), [m.ad, tur]);
  const tel = hedef.tel ?? m.iletisim.tel;
  const email = hedef.email ?? m.iletisim.email;

  const acikTaksitler = taksitler.filter((n) => !kapali.includes(n));
  const tutar = tutarCoz(tutarMetni);
  const gecerliTutar = Number.isFinite(tutar) && tutar > 0;
  const sonTarih = new Date(Date.now() + gun * 86400000);

  const hatalar = { ...m.hatalar };
  if (!gecerliTutar) hatalar.tutar = "Tutar girin.";
  else if (limit && tutar > limit) hatalar.tutar = `İşlem bazlı ödeme limiti ₺ ${limit.toLocaleString("tr-TR")}.`;
  if (acikTaksitler.length === 0) hatalar.taksit = "En az bir taksit seçeneği açık olmalı.";
  if (kanal === "SMS" && rakamlar(tel).length < 10) hatalar.hedefTel = "Linkin gönderileceği telefonu girin.";
  if (kanal === "E-posta" && !/^\S+@\S+\.\S+$/.test(email)) hatalar.hedefEmail = "Linkin gönderileceği e-postayı girin.";
  if (!kendiKarti && !beyan) hatalar.beyan = "Müşteri kartıyla ödemede beyanı onaylayın.";
  const h = (k) => (denendi ? hatalar[k] : undefined);

  const taksitMetni = (liste) => liste.map((n) => (n === 1 ? "Tek çekim" : `${n}`)).join(", ") + (liste.some((n) => n > 1) ? " taksit" : "");

  const olustur = (e) => {
    e.preventDefault();
    setDenendi(true);
    if (Object.keys(hatalar).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-link [aria-invalid="true"]')?.focus());
      return;
    }
    const id = `LNK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const link = {
      id,
      olusturma: tarihSaat(new Date()),
      sonGecerlilik: tarihSaat(sonTarih),
      yapan: meta.company,
      musteriTuru: tur,
      musteri: m.ad,
      tutar: tl2(tutar),
      kanal,
      durum: "Bekliyor",
      hedef: kanal === "SMS" ? tel : kanal === "E-posta" ? email : null,
      taksitler: acikTaksitler,
      cari: cariAdi,
    };
    setYeniler((l) => [link, ...l]);
    setOlusan(link);
  };
  const yeniLink = () => {
    m.sifirla();
    setTutarMetni("");
    setKapali([]);
    setGun(3);
    setKanal("SMS");
    setAciklama("");
    setBeyan(false);
    setDenendi(false);
    setOlusan(null);
  };

  const satirlar = [...yeniler, ...odemeLinkleri.filter((l) => kapsamda(role, l.yapan))];
  const olusturanGoster = role !== ROLES.ALT_BAYI;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5";

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", "Link ile Ödeme"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Link ile Ödeme</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{meta.company} · Müşteriye ödeme linki gönderin</p>
      </div>

      {olusan ? (
        <section className={`bn-pop mx-auto max-w-xl p-5 text-center sm:p-7 ${CARD} hover:!translate-y-0`} aria-live="polite">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success-text)]">
            <I name="link" size={24} strokeWidth={2.2} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-[var(--fg)]">Ödeme linki oluşturuldu</h2>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">
            {olusan.kanal === "SMS"
              ? `SMS ile ${olusan.hedef} numarasına gönderildi.`
              : olusan.kanal === "E-posta"
                ? `E-posta ile ${olusan.hedef} adresine gönderildi.`
                : "Linki kopyalayıp müşterinize iletebilirsiniz."}
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-1.5 pl-3">
            <span className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold tabular-nums text-[var(--fg)]">
              {LINK_ADRESI}
              {olusan.id.slice(4)}
            </span>
            <KopyalaDugmesi metin={`${LINK_ADRESI}${olusan.id.slice(4)}`} />
          </div>
          <dl className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] text-left text-[12.5px]">
            {[
              ["Link No", olusan.id],
              ["Müşteri", `${olusan.musteri} · ${olusan.musteriTuru}`],
              ["Tutar", olusan.tutar],
              ["Taksit seçenekleri", taksitMetni(olusan.taksitler)],
              [TAHSILAT_CARISI[role], olusan.cari ? `${olusan.cari.ad} — ${olusan.cari.cari}` : "—"],
              ["Son geçerlilik", olusan.sonGecerlilik],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={yeniLink}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}
            >
              <I name="plus" size={15} />
              Yeni Link
            </button>
            <button
              type="button"
              onClick={() => listeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              Linkleri Gör
            </button>
          </div>
        </section>
      ) : (
        <form id="bn-link" noValidate onSubmit={olustur} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <FormBolum no={1} i={0} baslik="Müşteri" aciklama="Manuel ödemeyle aynı: müşteri türünü seçin, tanımlı müşteriler listeden gelir.">
              <MusteriBolumu role={role} m={m} h={h} />
            </FormBolum>

            <FormBolum no={2} i={1} baslik="Tutar ve Taksit" aciklama="Müşteri, ödeme sayfasında yalnızca açık bıraktığınız taksitleri görür.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Alan id="bn-tutar" etiket="Tutar" hata={h("tutar")} ipucu={limit ? `İşlem bazlı ödeme limiti: ₺ ${limit.toLocaleString("tr-TR")}` : undefined}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                    <input
                      id="bn-tutar"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={tutarMetni}
                      onChange={(e) => setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""))}
                      onBlur={() => gecerliTutar && setTutarMetni(tutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                      aria-invalid={h("tutar") ? true : undefined}
                      className={`${inputCls(h("tutar"))} pl-7 text-[15px] font-bold tabular-nums`}
                    />
                  </div>
                </Alan>
                <Alan id="bn-aciklama" etiket="Açıklama (müşteri görür)">
                  <input id="bn-aciklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Örn. Ekim siparişi" className={inputCls()} />
                </Alan>
              </div>

              <fieldset className="mt-4" aria-describedby={h("taksit") ? "bn-taksit-hata" : undefined}>
                <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Müşteriye açık taksitler</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                  {taksitler.map((n) => {
                    const acik = !kapali.includes(n);
                    const x = vadeHesabi(gecerliTutar ? tutar : 0, n, profil);
                    return (
                      <label
                        key={n}
                        className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 transition ${
                          acik ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={acik}
                          onChange={() => setKapali((k) => (acik ? [...k, n] : k.filter((x) => x !== n)))}
                          aria-invalid={h("taksit") ? true : undefined}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                        />
                        <span className="min-w-0 leading-tight">
                          <span className={`block text-[12.5px] font-bold ${acik ? "text-[var(--brand-text)]" : "text-[var(--fg)]"}`}>{n === 1 ? "Tek Çekim" : `${n} Taksit`}</span>
                          <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--muted)]">
                            {gecerliTutar ? (n === 1 ? tl2(x.toplam) : `${tl2(x.aylik)} / ay`) : "—"}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {h("taksit") && (
                  <p id="bn-taksit-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                    {h("taksit")}
                  </p>
                )}
              </fieldset>
            </FormBolum>

            <FormBolum no={3} i={2} baslik="Gönderim" aciklama="Link seçtiğiniz kanaldan müşteriye iletilir; süre dolunca geçersiz olur.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p id="bn-kanal-etiket" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
                    Gönderim kanalı
                  </p>
                  <div role="radiogroup" aria-labelledby="bn-kanal-etiket" className="flex flex-wrap gap-1">
                    {KANALLAR.map((k) => (
                      <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={kanal === k}
                        onClick={() => setKanal(k)}
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${
                          kanal === k ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                        } ${FOCUS}`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p id="bn-sure-etiket" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
                    Geçerlilik süresi
                  </p>
                  <div role="radiogroup" aria-labelledby="bn-sure-etiket" className="flex flex-wrap gap-1">
                    {GECERLILIK.map((g) => (
                      <button
                        key={g}
                        type="button"
                        role="radio"
                        aria-checked={gun === g}
                        onClick={() => setGun(g)}
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${
                          gun === g ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                        } ${FOCUS}`}
                      >
                        {g} gün
                      </button>
                    ))}
                  </div>
                </div>
                {kanal === "SMS" && (
                  <Alan id="bn-hedef-tel" etiket="Gönderilecek telefon" hata={h("hedefTel")} ipucu={m.iletisim.tel ? "Müşterinin kayıtlı telefonu önerildi." : undefined}>
                    <input
                      id="bn-hedef-tel"
                      type="tel"
                      inputMode="tel"
                      placeholder="05XX XXX XX XX"
                      value={tel}
                      onChange={(e) => setHedef({ ...hedef, tel: e.target.value })}
                      aria-invalid={h("hedefTel") ? true : undefined}
                      className={`${inputCls(h("hedefTel"))} tabular-nums`}
                    />
                  </Alan>
                )}
                {kanal === "E-posta" && (
                  <Alan id="bn-hedef-eposta" etiket="Gönderilecek e-posta" hata={h("hedefEmail")} ipucu={m.iletisim.email ? "Müşterinin kayıtlı e-postası önerildi." : undefined}>
                    <input
                      id="bn-hedef-eposta"
                      type="email"
                      value={email}
                      onChange={(e) => setHedef({ ...hedef, email: e.target.value })}
                      aria-invalid={h("hedefEmail") ? true : undefined}
                      className={inputCls(h("hedefEmail"))}
                    />
                  </Alan>
                )}
              </div>
            </FormBolum>
          </div>

          {/* özet + oluştur */}
          <aside style={{ "--i": 3 }} className={`bn-rise p-4 sm:p-5 lg:sticky lg:top-[76px] ${CARD} hover:!translate-y-0`} aria-label="Link özeti">
            <h2 className="text-sm font-bold text-[var(--fg)]">Link Özeti</h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              {[
                ["Müşteri", m.ad || "—"],
                ["Müşteri türü", tur],
                [TAHSILAT_CARISI[role], cariAdi ? cariAdi.ad : "—"],
                ["Vade profili", profil ? `${profil.ad.replace("Vade Farkı ", "")} · %${profil.oran.toLocaleString("tr-TR")}` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                  <dd className="truncate text-right font-semibold text-[var(--fg)]">{v}</dd>
                </div>
              ))}
            </dl>
            <dl className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-[12.5px]">
              {[
                ["Taksit seçenekleri", acikTaksitler.length ? taksitMetni(acikTaksitler) : "—"],
                ["Gönderim", kanal === "SMS" ? tel || "SMS" : kanal === "E-posta" ? email || "E-posta" : "Link kopyalanacak"],
                ["Son geçerlilik", tarihSaat(sonTarih).slice(0, 10)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                  <dd className="truncate text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5">
              <span className="text-[12px] font-semibold text-[var(--brand-text)]">Link tutarı</span>
              <span className="text-[18px] font-extrabold tabular-nums text-[var(--fg)]">{gecerliTutar ? tl2(tutar) : "—"}</span>
            </div>
            <p className="mt-2 text-[11.5px] text-[var(--muted)]">Vade farkı, müşterinin seçtiği taksite göre ödeme sayfasında eklenir.</p>

            {!kendiKarti && (
              <div className="mt-3">
                <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[12px] leading-snug ${h("beyan") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
                  <input
                    type="checkbox"
                    checked={beyan}
                    onChange={(e) => setBeyan(e.target.checked)}
                    aria-invalid={h("beyan") ? true : undefined}
                    aria-describedby={h("beyan") ? "bn-beyan-hata" : undefined}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                  />
                  <span className="text-[var(--fg-2)]">
                    Link müşteri kartıyla ödenecek. Kart sahibi ile aramızdaki faturayı <b className="font-bold">Fatura Yükleme</b> ekranından yükleyeceğimi beyan ederim.
                  </span>
                </label>
                {h("beyan") && (
                  <p id="bn-beyan-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                    {h("beyan")}
                  </p>
                )}
              </div>
            )}

            {denendi && Object.keys(hatalar).length > 0 && (
              <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
                {Object.keys(hatalar).length} alanı kontrol edin.
              </p>
            )}

            <button
              type="submit"
              className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] text-[13.5px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 active:scale-[0.99] ${FOCUS}`}
            >
              <I name="link" size={15} />
              {kanal === "Sadece link" ? "Link Oluştur" : `Link Oluştur ve ${kanal} Gönder`}
            </button>
          </aside>
        </form>
      )}

      {/* son linkler */}
      <section ref={listeRef} style={{ "--i": 4 }} className={`bn-rise mt-3 scroll-mt-20 overflow-hidden ${CARD} hover:!translate-y-0`} aria-labelledby="bn-linkler-title">
        <div className="px-4 py-3">
          <h2 id="bn-linkler-title" className="text-sm font-bold text-[var(--fg)]">
            Son Ödeme Linkleri
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{satirlar.length} link · bekleyen linkleri yeniden kopyalayabilirsiniz</p>
        </div>
        <div className="relative overflow-x-auto">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th scope="col" className={th}>Link No</th>
                <th scope="col" className={th}>Oluşturma / Son Geçerlilik</th>
                {olusturanGoster && <th scope="col" className={th}>Oluşturan</th>}
                <th scope="col" className={th}>Müşteri</th>
                <th scope="col" className={`${th} text-right`}>Tutar</th>
                <th scope="col" className={th}>Kanal</th>
                <th scope="col" className={th}>Durum</th>
                <th scope="col" className={th}>
                  <span className="sr-only">İşlem</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((l, i) => (
                <tr key={l.id} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                  <td className={`${td} font-bold text-[var(--brand-text)]`}>
                    {l.id}
                    {yeniler.includes(l) && <span className="ml-1.5 rounded-full bg-[var(--success-soft)] px-1.5 py-px text-[10px] font-bold text-[var(--success-text)]">Yeni</span>}
                  </td>
                  <td className={`${td} tabular-nums`}>
                    <span className="block text-[var(--fg-2)]">{l.olusturma}</span>
                    <span className="block text-[11px] text-[var(--muted)]">son {l.sonGecerlilik}</span>
                  </td>
                  {olusturanGoster && <td className={`${td} text-[var(--fg-2)]`}>{l.yapan}</td>}
                  <td className={td}>
                    <span className="block font-semibold text-[var(--fg)]">{l.musteri}</span>
                    <span className="block text-[11px] text-[var(--muted)]">{l.musteriTuru}</span>
                  </td>
                  <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{l.tutar}</td>
                  <td className={`${td} text-[var(--fg-2)]`}>{l.kanal}</td>
                  <td className={td}>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${linkTone(l.durum)}`}>{l.durum}</span>
                  </td>
                  <td className={`${td} text-right`}>{l.durum === "Bekliyor" && <KopyalaDugmesi kucuk metin={`${LINK_ADRESI}${l.id.slice(4)}`} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ---- İptal / İade › Onay · Takip ---------------------------------------------------------
// Şartname s.8 (onay zinciri) ve s.7 (takip raporu: onayında olanlar, üst onaya iletilenler, onaylananlar,
// reddedilenler; raporun yanında onay / red). Talepler panel düzeyinde tutulur: rol değiştirerek zincir izlenebilir.
function talepTone(durum) {
  if (durum === "Onaylandı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Reddedildi") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  if (durum === "Bayi Onayında") return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
  return "bg-[var(--brand-soft)] text-[var(--brand-text)]"; // Ana Firma Onayında
}

// Talep bu rolün onayını mı bekliyor?
function onayimda(role, t) {
  if (role === ROLES.ANA_FIRMA) return t.durum === "Ana Firma Onayında";
  if (role === ROLES.BAYI) return t.durum === "Bayi Onayında" && altBayiler.some((a) => a.unvan === t.giren);
  return false;
}

const TAKIP_SEKMELERI = {
  [ROLES.ANA_FIRMA]: [
    { ad: "Tümü", f: () => true },
    { ad: "Onayımda", f: (t) => t.durum === "Ana Firma Onayında" },
    { ad: "Onaylanan", f: (t) => t.durum === "Onaylandı" },
    { ad: "Reddedilen", f: (t) => t.durum === "Reddedildi" },
  ],
  [ROLES.BAYI]: [
    { ad: "Tümü", f: () => true },
    { ad: "Onayımda", f: (t) => t.durum === "Bayi Onayında" },
    { ad: "Üst onaya iletilen", f: (t) => t.durum === "Ana Firma Onayında" },
    { ad: "Onaylanan", f: (t) => t.durum === "Onaylandı" },
    { ad: "Reddedilen", f: (t) => t.durum === "Reddedildi" },
  ],
  [ROLES.ALT_BAYI]: [
    { ad: "Tümü", f: () => true },
    { ad: "Onay bekleyen", f: (t) => t.durum === "Bayi Onayında" || t.durum === "Ana Firma Onayında" },
    { ad: "Onaylanan", f: (t) => t.durum === "Onaylandı" },
    { ad: "Reddedilen", f: (t) => t.durum === "Reddedildi" },
  ],
};

const TALEP_AKISI = {
  [ROLES.ANA_FIRMA]: "Kendi işlemleriniz için girdiğiniz iptal / iade onay gerektirmeden sonuçlanır.",
  [ROLES.BAYI]: "Talebiniz ana firma onayına düşer; sonuçlandığında e-posta ile bilgilendirilirsiniz.",
  [ROLES.ALT_BAYI]: "Talebiniz önce bayinizin, ardından ana firmanın onayına düşer; onaylandığında e-posta ile bilgilendirilirsiniz.",
};

// Ekranın altında beliren kısa bilgi (toast)
function Bildirim({ metin, onBitti }) {
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

function YeniTalep({ role, meta, talepler, onKaydet, onClose }) {
  // talep girilebilecek işlemler: kendi çekimi, başarılı ve açık / onaylanmış talebi olmayan
  const uygun = islemler.filter(
    (t) => t.yapan === meta.company && t.durum === "Başarılı" && !talepler.some((x) => x.islemId === t.id && x.durum !== "Reddedildi")
  );
  const [islemId, setIslemId] = useState(uygun[0]?.id || "");
  const [tur, setTur] = useState("İade");
  const [tutarMetni, setTutarMetni] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [denendi, setDenendi] = useState(false);
  const islem = uygun.find((t) => t.id === islemId);
  const islemTutari = islem ? parseAmount(islem.tutar) : 0;
  const tutar = tur === "İptal" ? islemTutari : tutarCoz(tutarMetni);

  const hatalar = {};
  if (!islem) hatalar.islem = "İşlem seçin.";
  if (tur === "İade" && !(tutar > 0 && tutar <= islemTutari)) hatalar.tutar = `0 ile ₺ ${islemTutari.toLocaleString("tr-TR")} arasında bir tutar girin.`;
  if (!aciklama.trim()) hatalar.aciklama = "Açıklama girin.";
  const h = (k) => (denendi ? hatalar[k] : undefined);

  const kaydet = (e) => {
    e.preventDefault();
    setDenendi(true);
    if (Object.keys(hatalar).length > 0) return;
    onKaydet({ islem, tur, tutar, aciklama: aciklama.trim() });
  };

  return (
    <Pencere baslik="Yeni İptal / İade Talebi" altBaslik={meta.company} onClose={onClose} genislik="max-w-lg">
      {uygun.length === 0 ? (
        <p className="rounded-xl bg-[var(--soft)] px-3 py-3 text-[12.5px] text-[var(--fg-2)]">Talep girilebilecek başarılı bir işleminiz yok.</p>
      ) : (
        <form noValidate onSubmit={kaydet} className="space-y-3">
          <Alan id="bn-talep-islem" etiket="İşlem" hata={h("islem")}>
            <select id="bn-talep-islem" value={islemId} onChange={(e) => setIslemId(e.target.value)} className={inputCls(h("islem"))}>
              {uygun.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.musteri} · {t.tutar}
                </option>
              ))}
            </select>
          </Alan>
          <div>
            <p id="bn-talep-tur" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
              Talep türü
            </p>
            <div role="radiogroup" aria-labelledby="bn-talep-tur" className="flex gap-1">
              {["İade", "İptal"].map((x) => (
                <button
                  key={x}
                  type="button"
                  role="radio"
                  aria-checked={tur === x}
                  onClick={() => setTur(x)}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-[12.5px] transition ${
                    tur === x ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                  } ${FOCUS}`}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <Alan
            id="bn-talep-tutar"
            etiket={tur === "İptal" ? "Tutar (işlemin tamamı)" : "İade tutarı"}
            hata={h("tutar")}
            ipucu={tur === "İade" ? `Kısmi iade yapılabilir; işlem tutarı ₺ ${islemTutari.toLocaleString("tr-TR")}.` : "İptal, işlemin tamamı için yapılır."}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
              <input
                id="bn-talep-tutar"
                inputMode="decimal"
                placeholder="0,00"
                readOnly={tur === "İptal"}
                value={tur === "İptal" ? islemTutari.toLocaleString("tr-TR") : tutarMetni}
                onChange={(e) => setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""))}
                aria-invalid={h("tutar") ? true : undefined}
                className={`${inputCls(h("tutar"))} pl-7 font-bold tabular-nums`}
              />
            </div>
          </Alan>
          <Alan id="bn-talep-aciklama" etiket="Açıklama" hata={h("aciklama")}>
            <textarea
              id="bn-talep-aciklama"
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn. Ürün iadesi"
              aria-invalid={h("aciklama") ? true : undefined}
              className={`${inputCls(h("aciklama"))} h-auto py-2`}
            />
          </Alan>
          <p className="flex items-start gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
            <I name="info" size={14} className="mt-px shrink-0 text-[var(--brand-text)]" />
            {TALEP_AKISI[role]}
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
            >
              Vazgeç
            </button>
            <button type="submit" className={`inline-flex h-10 items-center rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
              {role === ROLES.ANA_FIRMA ? `${tur} Et` : "Talebi Gönder"}
            </button>
          </div>
        </form>
      )}
    </Pencere>
  );
}

function IptalIade({ role, meta, mod, talepler, setTalepler, onNavigate }) {
  const onayModu = mod === "onay" && role !== ROLES.ALT_BAYI; // alt bayinin onay ekranı yoktur
  const firma = meta.company;
  const kapsam = talepler.filter((t) => kapsamda(role, t.giren));
  const sekmeler = TAKIP_SEKMELERI[role];
  const [sekme, setSekme] = useState(0);
  const [acik, setAcik] = useState(null);
  const [redTalep, setRedTalep] = useState(null);
  const [gerekce, setGerekce] = useState("");
  const [gerekceHata, setGerekceHata] = useState(false);
  const [yeni, setYeni] = useState(false);
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);

  const liste = onayModu ? kapsam.filter((t) => onayimda(role, t)) : kapsam.filter(sekmeler[sekme].f);
  const girenGoster = role !== ROLES.ALT_BAYI;

  const guncelle = (id, durum, olay) =>
    setTalepler((l) => l.map((t) => (t.id === id ? { ...t, durum, gecmis: [...t.gecmis, { tarih: tarihSaat(new Date()), kim: firma, olay }] } : t)));

  const onayla = (t) => {
    if (role === ROLES.BAYI) {
      guncelle(t.id, "Ana Firma Onayında", "Onayladı, ana firma onayına iletti");
      setBildirim(`${t.id} onaylandı ve ana firma onayına iletildi.`);
    } else {
      guncelle(t.id, "Onaylandı", "Onayladı");
      setBildirim(`${t.id} onaylandı. ${t.giren} e-posta ile bilgilendirildi.`);
    }
  };
  const reddet = () => {
    if (!gerekce.trim()) {
      setGerekceHata(true);
      return;
    }
    guncelle(redTalep.id, "Reddedildi", `Reddetti: ${gerekce.trim()}`);
    setBildirim(`${redTalep.id} reddedildi. ${redTalep.giren} e-posta ile bilgilendirildi.`);
    setRedTalep(null);
  };
  const talepKaydet = ({ islem, tur, tutar, aciklama }) => {
    const no = Math.max(...talepler.map((t) => Number(t.id.slice(4)))) + 1;
    const anaFirmaMi = role === ROLES.ANA_FIRMA;
    const durum = anaFirmaMi ? "Onaylandı" : role === ROLES.BAYI ? "Ana Firma Onayında" : "Bayi Onayında";
    const talep = {
      id: `TLP-${no}`,
      tarih: tarihSaat(new Date()),
      islemId: islem.id,
      giren: firma,
      musteri: islem.musteri,
      islemTutari: islem.tutar,
      tutar: `₺ ${tutar.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`,
      tur,
      aciklama,
      durum,
      gecmis: [{ tarih: tarihSaat(new Date()), kim: firma, olay: anaFirmaMi ? "Talep girildi — ana firma girişi, onay gerekmedi" : "Talep girildi" }],
    };
    setTalepler((l) => [talep, ...l]);
    setYeni(false);
    setSekme(0);
    setBildirim(anaFirmaMi ? `${talep.id}: ${tur} işlemi tamamlandı.` : `${talep.id} ${durum === "Bayi Onayında" ? "bayi" : "ana firma"} onayına gönderildi.`);
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";
  const sutun = girenGoster ? 7 : 6;

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["İptal / İade Takip", onayModu ? "Onay" : "Takip"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{onayModu ? "İptal / İade Onay" : "İptal / İade Takip"}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {firma} · {onayModu ? "Onayınızda bekleyen talepler" : "Taleplerin onay durumu"}
          </p>
        </div>
        {!onayModu && (
          <button
            type="button"
            onClick={() => setYeni(true)}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Yeni Talep
          </button>
        )}
      </div>

      {role !== ROLES.ALT_BAYI && (
        <p className="bn-rise mb-3 flex items-start gap-2 rounded-2xl bg-[var(--brand-soft)] px-4 py-2.5 text-[12px] font-medium text-[var(--brand-text)]">
          <I name="bell" size={14} className="mt-px shrink-0" />
          {role === ROLES.BAYI
            ? "Alt bayilerinizin talepleri önce sizin onayınıza düşer; onayladığınız talep ana firmaya iletilir. Kendi talepleriniz doğrudan ana firma onayına gider."
            : "Bayi ve alt bayilerin talepleri onayınıza düşer; onayladığınızda talep sonuçlanır."}{" "}
          Onayınıza talep düştüğünde e-posta ile bilgilendirilirsiniz.
        </p>
      )}

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İptal / iade talepleri">
        {!onayModu && (
          <div role="group" aria-label="Durum" className="flex gap-1 overflow-x-auto p-3 sm:p-4">
            {sekmeler.map((s, i) => (
              <button
                key={s.ad}
                type="button"
                onClick={() => setSekme(i)}
                aria-pressed={sekme === i}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  sekme === i ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {s.ad}
                <span
                  className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${sekme === i ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}
                >
                  {kapsam.filter(s.f).length}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="relative overflow-x-auto">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th scope="col" className={th}>Talep</th>
                {girenGoster && <th scope="col" className={th}>Giren</th>}
                <th scope="col" className={th}>İşlem / Müşteri</th>
                <th scope="col" className={th}>Tür</th>
                <th scope="col" className={`${th} text-right`}>Tutar</th>
                <th scope="col" className={th}>Durum</th>
                <th scope="col" className={th}>
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {liste.map((t, i) => {
                const benim = onayimda(role, t);
                const detay = acik === t.id;
                return (
                  <Fragment key={t.id}>
                    <tr className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${benim ? "shadow-[inset_3px_0_0_var(--brand)]" : ""}`}>
                      <td className={td}>
                        <span className="block font-bold text-[var(--brand-text)]">{t.id}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.tarih}</span>
                      </td>
                      {girenGoster && (
                        <td className={td}>
                          <span className="block font-semibold text-[var(--fg-2)]">{t.giren}</span>
                          <span className="block text-[11px] text-[var(--muted)]">{firmaTuru(t.giren)}</span>
                        </td>
                      )}
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{t.musteri}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.islemId}</span>
                      </td>
                      <td className={`${td} font-semibold text-[var(--fg-2)]`}>{t.tur}</td>
                      <td className={`${td} text-right`}>
                        <span className="block font-bold tabular-nums text-[var(--fg)]">{t.tutar}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">işlem {t.islemTutari}</span>
                      </td>
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${talepTone(t.durum)}`}>{t.durum}</span>
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {benim && (
                            <>
                              <button
                                type="button"
                                onClick={() => onayla(t)}
                                className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--success)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}
                              >
                                <I name="check" size={13} strokeWidth={2.4} />
                                {role === ROLES.BAYI ? "Onayla ve İlet" : "Onayla"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRedTalep(t);
                                  setGerekce("");
                                  setGerekceHata(false);
                                }}
                                className={`inline-flex h-8 items-center rounded-full border border-[var(--danger)] px-3 text-[12px] font-bold text-[var(--danger-text)] transition hover:bg-[var(--danger-soft)] ${FOCUS}`}
                              >
                                Reddet
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setAcik(detay ? null : t.id)}
                            aria-expanded={detay}
                            aria-controls={`bn-detay-${t.id}`}
                            aria-label={`${t.id} detayı`}
                            title="Detay ve geçmiş"
                            className={`grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--soft-2)] hover:text-[var(--brand-text)] ${FOCUS}`}
                          >
                            <I name="chevronDown" size={15} className={`transition-transform duration-200 ${detay ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {detay && (
                      <tr id={`bn-detay-${t.id}`} className="bg-[var(--soft)]">
                        <td colSpan={sutun} className="px-4 py-3">
                          <div className="grid gap-3 text-[12px] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Açıklama</p>
                              <p className="mt-1 text-[var(--fg)]">{t.aciklama}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Geçmiş</p>
                              <ol className="mt-1.5 space-y-1.5 border-l-2 border-[var(--border-strong)] pl-3">
                                {t.gecmis.map((g, j) => (
                                  <li key={j} className="relative">
                                    <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-[var(--brand)] ring-2 ring-[var(--soft)]" aria-hidden="true" />
                                    <span className="font-semibold text-[var(--fg)]">{g.kim}</span> <span className="text-[var(--fg-2)]">— {g.olay}</span>
                                    <span className="block text-[11px] tabular-nums text-[var(--muted)]">{g.tarih}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {liste.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success-text)]">
                <I name="check" size={18} />
              </span>
              <p className="text-[13px] font-bold text-[var(--fg)]">{onayModu ? "Onayınızda bekleyen talep yok" : "Bu durumda talep yok"}</p>
              {onayModu && (
                <button
                  type="button"
                  onClick={() => onNavigate("/iptal-iade/takip")}
                  className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}
                >
                  Tüm talepleri gör
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {redTalep && (
        <Pencere baslik={`${redTalep.id} talebini reddet`} altBaslik={`${redTalep.giren} · ${redTalep.tur} · ${redTalep.tutar}`} onClose={() => setRedTalep(null)} genislik="max-w-md">
          <Alan id="bn-gerekce" etiket="Red gerekçesi" hata={gerekceHata && !gerekce.trim() ? "Gerekçe girin; talebi girene e-posta ile iletilir." : undefined}>
            <textarea
              id="bn-gerekce"
              rows={3}
              value={gerekce}
              onChange={(e) => setGerekce(e.target.value)}
              aria-invalid={gerekceHata && !gerekce.trim() ? true : undefined}
              className={`${inputCls(gerekceHata && !gerekce.trim())} h-auto py-2`}
            />
          </Alan>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRedTalep(null)}
              className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
            >
              Vazgeç
            </button>
            <button type="button" onClick={reddet} className={`inline-flex h-10 items-center rounded-full bg-[var(--danger)] px-5 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
              Reddet
            </button>
          </div>
        </Pencere>
      )}

      {yeni && <YeniTalep role={role} meta={meta} talepler={talepler} onKaydet={talepKaydet} onClose={() => setYeni(false)} />}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

// Ana Sayfa: KPI blokları, haftalık hacim, bakiye, son işlemler.
function Dashboard({ role, meta, onNavigate }) {
  const stats = kpis[role];
  const toplam = stats.find((s) => s.key === "toplam") || stats[0];
  const basarili = stats.find((s) => s.key === "basarili");
  const others = stats.filter((s) => s.key !== "basarili" && s.key !== "toplam");
  const ortalama = toplam.count ? parseAmount(toplam.value) / toplam.count : 0;
  const basariOrani = toplam.count ? (basarili.count / toplam.count) * 100 : 0;
  const selectCls = `h-9 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[12.5px] font-medium text-[var(--fg-2)] ${FOCUS}`;

  return (
    <>
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
            onClick={() => onNavigate("/odeme/manuel")}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] active:scale-[0.97] hover:brightness-110 ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Ödeme Al
          </button>
        </div>
      </div>

      {/* KPI bento blokları — üstte eşit iki büyük blok (başarılı, toplam), altta üç küçük blok */}
      <div className="grid grid-cols-6 gap-3">
        <BigTile
          s={basarili}
          index={0}
          footer={{ label: "Başarı oranı", value: `%${basariOrani.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`, bar: basariOrani }}
        />
        <BigTile
          s={toplam}
          index={1}
          footer={{ label: "Ortalama işlem tutarı", value: `₺ ${Math.round(ortalama).toLocaleString("tr-TR")}` }}
        />
        {others.map((s, i) => (
          <SoftTile key={s.key} s={s} index={i + 2} total={toplam.count} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <ChartCard />
        <BalanceCard role={role} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TransactionsCard role={role} onSeeAll={() => onNavigate("/raporlar/islem-detaylari")} />
        <div className="flex flex-col gap-3">
          <QuickCard onNavigate={onNavigate} />
          <DistributionCard stats={stats} />
        </div>
      </div>
    </>
  );
}

function PanelView({ role, setRole, isDark, onToggleTheme, onLogout }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const meta = ROLE_META[role];

  // iptal / iade talepleri panel düzeyinde: rol değiştirerek onay zinciri uçtan uca izlenebilir
  const [talepler, setTalepler] = useState(iptalIadeTalepleri);
  const bekleyenOnay = talepler.filter((t) => kapsamda(role, t.giren) && onayimda(role, t)).length;

  // açık ekran adres çubuğunda (?sayfa=) tutulur: yenileme ve geri tuşu çalışır
  const router = useRouter();
  const slug = typeof router.query.sayfa === "string" ? router.query.sayfa : null;
  const current = SAYFALAR[slug] || HOME;
  const navigate = (href) => {
    const sayfa = Object.keys(SAYFALAR).find((k) => SAYFALAR[k] === href);
    const { sayfa: _eski, ...query } = router.query;
    router.push({ pathname: router.pathname, query: sayfa ? { ...query, sayfa } : query }, undefined, { shallow: true });
    setMobileOpen(false);
  };

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


  return (
    <div className="flex flex-1">
      <Sidebar
        role={role}
        desktopOpen={desktopOpen}
        mobileOpen={mobileOpen}
        hidden={!menuVisible}
        onClose={closeMenu}
        onLogout={onLogout}
        current={current}
        onNavigate={navigate}
        rozetler={{ "/iptal-iade/onay": bekleyenOnay }}
      />

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

        {/* key: rol ya da ekran değişince giriş animasyonları yeniden oynar */}
        <main key={`${role}-${current}`} className="mx-auto w-full max-w-[1280px] flex-1 py-4">
          {current === "/raporlar/islem-detaylari" ? (
            <IslemDetaylari role={role} meta={meta} onHome={() => navigate(HOME)} />
          ) : current === "/odeme/manuel" ? (
            <ManuelOdeme role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/odeme/link" ? (
            <LinkOdeme role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/iptal-iade/onay" || current === "/iptal-iade/takip" ? (
            <IptalIade
              role={role}
              meta={meta}
              mod={current === "/iptal-iade/onay" ? "onay" : "takip"}
              talepler={talepler}
              setTalepler={setTalepler}
              onNavigate={navigate}
            />
          ) : (
            <Dashboard role={role} meta={meta} onNavigate={navigate} />
          )}
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
        id="bn-root"
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

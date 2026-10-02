import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import I from "@/components/DesignIcons";
import { useRole } from "@/components/RoleContext";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import {
  kpis,
  islemler,
  bakiyeOzet,
  iptalIadeTalepleri,
  duyurular,
  kurBilgisi,
  faturaYuklemeleri,
  bayiler,
  altBayiler,
} from "@/lib/mockData";

// Tasarım 06 — Kağıt: broadsheet editoryal. Kutusuz düzen, serif tipografi, ince çizgiler.
// Solda açılır kapanır ana menü (akordiyon), üstte kısayol menüsü. Açık / koyu mod.

const light = {
  "--bg": "#F7F6F3",
  "--fg": "#1E1E1E",
  "--fg-2": "#3A434A",
  "--muted": "#6E7A8A",
  "--rule": "#D8D9DB",
  "--rule-soft": "#EBECED",
  "--rule-strong": "#1E1E1E",
  "--hover": "#EFEEEA",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#0C34E7",
  "--brand-soft": "#EAE8FD",
  "--chart": "#0C34E7",
  "--success": "#0EB567",
  "--danger": "#DC204D",
  "--warning": "#F89B3C",
  "--success-text": "#0A8A4E",
  "--danger-text": "#C81C45",
  "--warning-text": "#B45F06",
  "--ring": "#0C34E7",
  "--pop-shadow": "0 16px 40px -16px rgba(30,30,30,0.35)",
};

const dark = {
  "--bg": "#111214",
  "--fg": "#F5F5F6",
  "--fg-2": "#D8D9DB",
  "--muted": "#B0B4B7",
  "--rule": "#2E3136",
  "--rule-soft": "#232528",
  "--rule-strong": "#F5F5F6",
  "--hover": "#1A1B1F",
  "--brand": "#0C34E7",
  "--brand-fg": "#FFFFFF",
  "--brand-text": "#A9B6FF",
  "--brand-soft": "rgba(76,99,255,0.18)",
  "--chart": "#6A7BFF",
  "--success": "#0EB567",
  "--danger": "#DC204D",
  "--warning": "#F89B3C",
  "--success-text": "#35D08A",
  "--danger-text": "#F2617E",
  "--warning-text": "#F5A65B",
  "--ring": "#A9B6FF",
  "--pop-shadow": "0 16px 40px -12px rgba(0,0,0,0.85)",
};

// Sade giriş animasyonları. Hareket azaltma tercihinde tamamı kapanır.
const MOTION_CSS = `
@keyframes kg-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes kg-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes kg-pop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.kg-rise { animation: kg-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 70ms); }
.kg-wipe { animation: kg-wipe 1.3s cubic-bezier(0.3, 0.7, 0.2, 1) backwards; animation-delay: 0.3s; }
.kg-pop { animation: kg-pop 0.16s ease-out backwards; }
@media (prefers-reduced-motion: reduce) {
  .kg-rise, .kg-wipe, .kg-pop { animation: none; }
}
`;

const SERIF = { fontFamily: "'Newsreader', Georgia, 'Times New Roman', serif", fontWeight: 400 };

const WEEK = [
  { d: "Pzt", v: 62, t: "₺3,26M" },
  { d: "Sal", v: 78, t: "₺4,10M" },
  { d: "Çar", v: 54, t: "₺2,84M" },
  { d: "Per", v: 91, t: "₺4,78M" },
  { d: "Cum", v: 100, t: "₺5,26M" },
  { d: "Cmt", v: 40, t: "₺2,10M" },
  { d: "Paz", v: 28, t: "₺1,47M" },
];
const PERIODS = ["Hafta", "Ay", "Çeyrek"];
const GUN_ADI = { Pzt: "Pazartesi", Sal: "Salı", Çar: "Çarşamba", Per: "Perşembe", Cum: "Cuma", Cmt: "Cumartesi", Paz: "Pazar" };

// Mock "düne göre" değişimleri — good: değişim olumlu mu?
const TREND = {
  toplam: { txt: "%12,4", up: true, good: true },
  basarili: { txt: "%9,8", up: true, good: true },
  basarisiz: { txt: "%3,1", up: false, good: true },
  iptal: { txt: "%1,4", up: true, good: false },
  iade: { txt: "%0,7", up: false, good: true },
};

const DOT = {
  green: "bg-[var(--success)]",
  red: "bg-[var(--danger)]",
  amber: "bg-[var(--warning)]",
  navy: "bg-[var(--brand)]",
};

// Yan menüde "Yönetim" bölümüne giren öğeler
const MANAGE_ICONS = new Set(["dealer", "settings", "megaphone"]);

const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";
const LINK = `inline-flex min-h-[40px] items-center gap-1.5 rounded text-sm font-semibold text-[var(--brand-text)] hover:underline ${FOCUS}`;
const GHOST = `relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] ${FOCUS}`;

function isPending(t) {
  return t.durum === "Onayda" || t.durum === "Üst Onaya İletildi";
}

function durumText(durum) {
  if (durum === "Başarılı" || durum === "Onaylandı") return "text-[var(--success-text)]";
  if (durum === "Başarısız" || durum === "Reddedildi") return "text-[var(--danger-text)]";
  return "text-[var(--warning-text)]"; // İptal / İade
}

// "₺ 4.284.900" → 4284900
function parseAmount(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
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
    const dur = 1000;
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
  return <>₺{v.toLocaleString("tr-TR")}</>;
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
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      {up ? <path d="M5 1.5 9 8H1z" /> : <path d="M5 8.5 1 2h8z" />}
    </svg>
  );
}

function Trend({ t, suffix = "düne göre" }) {
  if (!t) return null;
  return (
    <p className="flex items-center gap-1 text-sm text-[var(--muted)]">
      <span className={`inline-flex items-center gap-1 font-semibold ${t.good ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
        <TrendArrow up={t.up} />
        {t.txt}
      </span>
      {suffix}
    </p>
  );
}

function Wordmark({ compact }) {
  return (
    <div className="shrink-0 leading-none">
      <p className={`font-semibold tracking-[0.22em] text-[var(--brand-text)] ${compact ? "text-[8.5px]" : "text-[9.5px]"}`}>N KOLAY BAYİM</p>
      <p style={SERIF} className={`mt-1 leading-none tracking-tight text-[var(--fg)] ${compact ? "text-[20px]" : "text-[25px]"}`}>
        pay{"'"}nkolay
      </p>
    </div>
  );
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

// ---- yan menü ----------------------------------------------------------------------------
function NavGroup({ entry, open, onToggle, badge }) {
  const id = `kg-grp-${entry.icon}`;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`group flex h-10 w-full items-center gap-3 rounded-md px-2 text-[14px] transition-colors hover:bg-[var(--hover)] ${
          open ? "font-semibold text-[var(--fg)]" : "text-[var(--fg-2)]"
        } ${FOCUS}`}
      >
        <I name={entry.icon} size={16} className={open ? "text-[var(--brand-text)]" : "text-[var(--muted)]"} />
        <span className="flex-1 text-left">
          {entry.label}
          {badge > 0 && <sup className="ml-1 text-[10.5px] font-semibold text-[var(--danger-text)]">{badge}</sup>}
        </span>
        <I name="chevronRight" size={13} className={`text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`} />
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="mb-1.5 ml-[15px] mt-0.5 border-l border-[var(--rule)] pl-3">
            {entry.items.map((i) => (
              <li key={i.href}>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  className={`flex h-[34px] w-full items-center rounded-md px-2 text-left text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] ${FOCUS}`}
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

function NavSection({ label, entries, openGroup, setOpenGroup, bekleyen }) {
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="px-2 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <div className="space-y-px">
        {entries.map((entry) =>
          entry.items ? (
            <NavGroup
              key={entry.label}
              entry={entry}
              open={openGroup === entry.label}
              onToggle={() => setOpenGroup((g) => (g === entry.label ? null : entry.label))}
              badge={entry.icon === "refund" ? bekleyen : 0}
            />
          ) : (
            <button
              key={entry.label}
              type="button"
              aria-current={entry.href === "/dashboard" ? "page" : undefined}
              className={`relative flex h-10 w-full items-center gap-3 rounded-md px-2 text-[14px] transition-colors hover:bg-[var(--hover)] ${
                entry.href === "/dashboard" ? "font-semibold text-[var(--fg)]" : "text-[var(--fg-2)]"
              } ${FOCUS}`}
            >
              {entry.href === "/dashboard" && <span className="absolute inset-y-2 -left-5 w-[2px] bg-[var(--brand)]" aria-hidden="true" />}
              <I name={entry.icon} size={16} className={entry.href === "/dashboard" ? "text-[var(--brand-text)]" : "text-[var(--muted)]"} />
              <span>{entry.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function Sidebar({ role, desktopOpen, mobileOpen, hidden, onClose, onLogout, bekleyen }) {
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
        className={`fixed inset-y-0 left-0 z-[60] flex w-60 shrink-0 flex-col border-r border-[var(--rule)] bg-[var(--bg)] transition-[transform,margin] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:bottom-auto lg:left-auto lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:self-start ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopOpen ? "lg:ml-0" : "lg:-ml-60"}`}
      >
        <div className="mx-5 flex h-16 shrink-0 items-center justify-between border-b-2 border-[var(--rule-strong)]">
          <Wordmark />
          <button type="button" onClick={onClose} aria-label="Menüyü kapat" title="Menüyü kapat" className={`${GHOST} -mr-2 h-8 w-8`}>
            <I name="chevronLeft" size={15} />
          </button>
        </div>

        {/* künye */}
        <div className="mx-5 border-b border-[var(--rule)] py-3">
          <p className="truncate text-[13px] font-semibold text-[var(--fg)]">{meta.company}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{meta.label} Paneli</p>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--rule)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--rule)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          <NavSection label="İşlemler" entries={main} openGroup={openGroup} setOpenGroup={setOpenGroup} bekleyen={bekleyen} />
          <NavSection label="Yönetim" entries={manage} openGroup={openGroup} setOpenGroup={setOpenGroup} bekleyen={bekleyen} />
        </nav>

        <div className="mx-5 flex shrink-0 items-center justify-between gap-2 border-t border-[var(--rule)] py-3">
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold text-[var(--fg)]">{meta.user}</p>
            <p className="text-xs text-[var(--muted)]">Çevrimiçi</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--danger-text)] ${FOCUS}`}
          >
            Çıkış
            <I name="logout" size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}

function UserMenu({ meta, isDark, onToggleTheme, onLogout }) {
  const [open, setOpen] = useState(false);
  useDismiss(open, () => setOpen(false));
  const item = `flex min-h-[38px] w-full items-center gap-2.5 px-3 text-left text-[13px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] ${FOCUS}`;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Kullanıcı menüsü"
        className={`ml-1 flex min-h-[40px] items-center gap-2 rounded-full pr-1 ${FOCUS}`}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand)] text-[11px] font-bold text-[var(--brand-fg)]">{meta.short}</span>
        <span className="hidden max-w-[150px] truncate text-[13px] font-semibold text-[var(--fg)] xl:block">{meta.user}</span>
        <I name="chevronDown" size={13} className={`hidden text-[var(--muted)] transition-transform duration-200 sm:block ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" className="kg-pop absolute right-0 top-full z-40 mt-2 w-56 border border-[var(--rule-strong)] bg-[var(--bg)] py-1 [box-shadow:var(--pop-shadow)]">
            <div className="border-b border-[var(--rule)] px-3 pb-2.5 pt-2">
              <p className="truncate text-[13px] font-semibold text-[var(--fg)]">{meta.user}</p>
              <p className="truncate text-xs text-[var(--muted)]">{meta.company}</p>
            </div>
            <button type="button" role="menuitem" className={item} onClick={() => setOpen(false)}>
              <I name="building" size={14} />
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
              <I name={isDark ? "sun" : "moon"} size={14} />
              {isDark ? "Açık moda geç" : "Koyu moda geç"}
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${item} border-t border-[var(--rule)] hover:!text-[var(--danger-text)]`}
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

// ---- içerik blokları ---------------------------------------------------------------------
function VolumeChart() {
  const [period, setPeriod] = useState("Hafta");
  const W = 720;
  const H = 240;
  const values = WEEK.map((w) => w.v);
  const max = Math.max(...values);
  const step = (W - 24) / (values.length - 1);
  const pts = values.map((v, i) => [12 + i * step, H - 4 - (v / max) * (H - 48)]);
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`;
  const maxI = values.indexOf(max);
  // üzerine gelinen gün; boşta en yüksek gün seçilidir
  const [active, setActive] = useState(maxI);
  const ax = (pts[active][0] / W) * 100;
  const ay = (pts[active][1] / H) * 100;

  return (
    <section style={{ "--i": 1 }} className="kg-rise" aria-labelledby="kg-chart-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 id="kg-chart-title" style={SERIF} className="text-[28px] leading-none text-[var(--fg)]">
            Haftalık hacim
          </h2>
          <p className="text-sm text-[var(--muted)]">Son 7 gün · ₺24,1M</p>
        </div>
        <div role="group" aria-label="Dönem" className="flex gap-4 text-sm">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`min-h-[40px] rounded transition ${
                period === p ? "font-semibold text-[var(--fg)] underline decoration-[var(--brand)] decoration-2 underline-offset-[6px]" : "text-[var(--muted)] hover:text-[var(--fg)]"
              } ${FOCUS}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-8 h-56 border-b border-[var(--rule)]" onMouseLeave={() => setActive(maxI)}>
        <div className="kg-wipe absolute inset-0">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Haftalık işlem hacmi alan grafiği">
            <defs>
              <linearGradient id="kgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--chart)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#kgFill)" />
            <path d={line} fill="none" stroke="var(--chart)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* seçili gün: kılavuz çizgisi, nokta ve tutar */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 w-px -translate-x-1/2 bg-[var(--rule)] transition-[left,top] duration-200 motion-reduce:transition-none"
          style={{ left: `${ax}%`, top: `${ay}%` }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--chart)] bg-[var(--bg)] transition-[left,top] duration-200 motion-reduce:transition-none"
          style={{ left: `${ax}%`, top: `${ay}%` }}
        />
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap pb-3 text-sm font-semibold tabular-nums text-[var(--brand-text)] transition-[left,top] duration-200 motion-reduce:transition-none"
          style={{ left: `${ax}%`, top: `${ay}%` }}
        >
          {WEEK[active].t}
        </span>

        {/* gün gün okuma alanları */}
        {pts.map((p, i) => (
          <button
            key={WEEK[i].d}
            type="button"
            aria-label={`${GUN_ADI[WEEK[i].d]}: ${WEEK[i].t}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="absolute inset-y-0 -translate-x-1/2 cursor-default focus:outline-none focus-visible:bg-[var(--hover)]"
            style={{ left: `${(p[0] / W) * 100}%`, width: `${(step / W) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative mt-3 h-5 text-sm">
        {pts.map((p, i) => (
          <span
            key={WEEK[i].d}
            className={`absolute -translate-x-1/2 transition-colors ${i === active ? "font-semibold text-[var(--fg)]" : "text-[var(--muted)]"}`}
            style={{ left: `${(p[0] / W) * 100}%` }}
          >
            {WEEK[i].d}
          </span>
        ))}
      </div>
    </section>
  );
}

// Onay bekleyen iptal / iade talepleri. Alt bayi yalnızca kendi taleplerinin durumunu görür.
function Approvals({ role }) {
  const canApprove = role !== ROLES.ALT_BAYI;
  const bekleyen = iptalIadeTalepleri.filter(isPending);
  // bu oturumda verilen kararlar (mockup — kalıcı değildir)
  const [decisions, setDecisions] = useState({});
  const acik = bekleyen.filter((t) => !decisions[t.id]).length;
  return (
    <section aria-labelledby="kg-approve-title">
      <h2 id="kg-approve-title" style={SERIF} className="text-[28px] leading-none text-[var(--fg)]">
        {canApprove ? "Onay bekleyen" : "Taleplerim"} <span className="text-[var(--danger-text)]">{canApprove ? acik : bekleyen.length}</span>
      </h2>
      <ul className="mt-5">
        {bekleyen.map((t) => {
          const d = decisions[t.id];
          return (
            <li key={t.id} className="flex items-center justify-between gap-3 border-t border-[var(--rule-soft)] py-2.5 first:border-t-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--fg)]">{t.talepEden}</p>
                <p className="text-xs text-[var(--muted)]">
                  {t.tur} · {t.tutar.replace(/\s/g, "")}
                </p>
              </div>
              {!canApprove ? (
                <span className="shrink-0 text-sm font-semibold text-[var(--warning-text)]">{t.durum}</span>
              ) : d ? (
                <span className={`kg-pop shrink-0 text-sm font-semibold ${durumText(d)}`}>{d}</span>
              ) : (
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setDecisions((prev) => ({ ...prev, [t.id]: "Onaylandı" }))}
                    className={`min-h-[40px] rounded font-semibold text-[var(--brand-text)] hover:underline ${FOCUS}`}
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisions((prev) => ({ ...prev, [t.id]: "Reddedildi" }))}
                    className={`min-h-[40px] rounded text-[var(--muted)] hover:text-[var(--danger-text)] hover:underline ${FOCUS}`}
                  >
                    Reddet
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

// Ciro sıralaması: Ana Firma bayilerini, Bayi alt bayilerini görür.
function Ranking({ role }) {
  if (role === ROLES.ALT_BAYI) return null;
  const isAna = role === ROLES.ANA_FIRMA;
  const rows = [...(isAna ? bayiler : altBayiler)].sort((a, b) => parseAmount(b.ciro) - parseAmount(a.ciro)).slice(0, 4);
  const top = parseAmount(rows[0].ciro) || 1;
  return (
    <section style={{ "--i": 6 }} className="kg-rise mt-16" aria-labelledby="kg-rank-title">
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-[var(--rule-strong)] pb-3">
        <h2 id="kg-rank-title" style={SERIF} className="text-[28px] leading-none text-[var(--fg)]">
          Ciro sıralaması
        </h2>
        <button type="button" className={LINK}>
          {isAna ? "Bayi özet raporu" : "Alt bayi özet raporu"} <span aria-hidden="true">→</span>
        </button>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((b, i) => (
          <li key={b.id} className="border-b border-[var(--rule)] py-5 sm:pr-8 xl:border-b-0 xl:border-l xl:border-[var(--rule)] xl:pl-6 xl:first:border-l-0 xl:first:pl-0">
            <div className="flex items-baseline gap-3">
              <span style={SERIF} className="text-[34px] leading-none text-[var(--rule)]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="min-w-0 truncate text-sm font-semibold text-[var(--fg)]">{b.unvan}</p>
            </div>
            <p style={SERIF} className="mt-3 text-[26px] leading-none tracking-[-0.01em] text-[var(--fg)]">
              {b.ciro.replace(/\s/g, "")}
            </p>
            <div className="mt-3 h-px bg-[var(--rule-soft)]" aria-hidden="true">
              <div className="h-px bg-[var(--brand)]" style={{ width: `${Math.max((parseAmount(b.ciro) / top) * 100, 4)}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {b.vadeProfil}
              {isAna ? ` · ${b.altBayi} alt bayi` : ""} · {b.durum}
            </p>
          </li>
        ))}
      </ol>
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
  const secondary = stats.filter((s) => s.key !== "toplam");
  const bakiye = bakiyeOzet[role];
  const bekleyenSayisi = iptalIadeTalepleri.filter(isPending).length;
  const faturaBekleyen = faturaYuklemeleri.filter((f) => f.durum === "Bekliyor").length;
  const altBayiToplam = bayiler.reduce((a, b) => a + b.altBayi, 0);
  const maxGun = WEEK.reduce((a, b) => (b.v > a.v ? b : a), WEEK[0]);
  const usd = kurBilgisi.find((k) => k.code === "USD");
  const eur = kurBilgisi.find((k) => k.code === "EUR");
  const duyuru = duyurular[0];

  // üst menü: sık kullanılan ekranlara kısayollar (ana gezinme yan menüdedir)
  const shortcuts = [
    { label: "Genel Bakış", active: true },
    { label: "Manuel Ödeme" },
    { label: "Link ile Ödeme" },
    ...(role !== ROLES.ALT_BAYI ? [{ label: "Onay Bekleyenler", badge: bekleyenSayisi }] : []),
    { label: "Fatura Yükleme", badge: faturaBekleyen },
    { label: "Kur Bilgisi" },
  ];

  const [tarih, setTarih] = useState("");
  useEffect(() => {
    try {
      const now = new Date();
      const gun = now.toLocaleDateString("tr-TR", { weekday: "long" });
      const rest = now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
      setTarih(`${gun}, ${rest}`);
      const mq = window.matchMedia("(min-width: 1024px)");
      const sync = () => setIsDesktop(mq.matches);
      sync();
      mq.addEventListener("change", sync);
      // ?menu=closed | ?menu=open bağlantıyla menü durumunu zorlar
      const q = new URLSearchParams(window.location.search).get("menu");
      if (q === "closed" || (q !== "open" && localStorage.getItem("nkb-kagit-menu") === "closed")) setDesktopOpen(false);
      return () => mq.removeEventListener("change", sync);
    } catch (e) {
      return undefined;
    }
  }, []);

  const setDesktop = (next) => {
    setDesktopOpen(next);
    try {
      localStorage.setItem("nkb-kagit-menu", next ? "open" : "closed");
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
        bekleyen={bekleyenSayisi}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* üst bar: menü düğmesi, geri, kısayol menüsü, araçlar */}
        <div className="sticky top-0 z-20 bg-[var(--bg)] px-5 sm:px-8 lg:px-10">
          <header className="mx-auto flex h-16 max-w-[1280px] items-center gap-1.5 border-b-2 border-[var(--rule-strong)]">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={menuVisible}
              title={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
              className={`${GHOST} -ml-2`}
            >
              <I name="panel" size={17} />
            </button>
            <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={GHOST}>
              <I name="arrowLeft" size={17} />
            </Link>

            {/* yan menü kapalıyken marka üst barda görünür */}
            <div
              className={`ml-1 hidden max-w-[150px] overflow-hidden transition-[max-width,opacity,margin] duration-300 motion-reduce:transition-none sm:block ${
                desktopOpen ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : "lg:ml-2 lg:mr-3 lg:max-w-[150px] lg:opacity-100"
              }`}
              aria-hidden={desktopOpen && isDesktop ? "true" : undefined}
            >
              <Wordmark compact />
            </div>

            <nav aria-label="Kısayollar" className="ml-2 hidden min-w-0 flex-1 items-stretch gap-1 self-stretch overflow-x-auto md:flex">
              {shortcuts.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  aria-current={s.active ? "page" : undefined}
                  className={`relative flex shrink-0 items-center whitespace-nowrap px-2.5 text-[14px] transition-colors ${
                    s.active ? "font-semibold text-[var(--fg)]" : "text-[var(--fg-2)] hover:text-[var(--fg)]"
                  } ${FOCUS}`}
                >
                  {s.label}
                  {s.badge > 0 && <sup className="ml-1 text-[10.5px] font-semibold text-[var(--danger-text)]">{s.badge}</sup>}
                  {s.active && <span className="absolute inset-x-2.5 -bottom-[2px] h-[2px] bg-[var(--brand)]" aria-hidden="true" />}
                </button>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button type="button" aria-label="Ara" title="Ara" className={GHOST}>
                <I name="search" size={17} />
              </button>
              <button type="button" aria-label="Bildirimler" title="Bildirimler" className={GHOST}>
                <I name="bell" size={17} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--bg)]" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
                title={isDark ? "Açık mod" : "Koyu mod"}
                className={`${GHOST} hidden sm:grid`}
              >
                <I name={isDark ? "sun" : "moon"} size={17} />
              </button>
              <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />
            </div>
          </header>
        </div>

        <div className="px-5 pb-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1280px]">
            {/* mobil kısayollar (yatay kaydırma) */}
            <nav aria-label="Kısayollar (mobil)" className="flex gap-5 overflow-x-auto border-b border-[var(--rule)] py-3 text-sm md:hidden">
              {shortcuts.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`shrink-0 whitespace-nowrap ${
                    s.active ? "font-semibold text-[var(--fg)] underline decoration-[var(--brand)] decoration-2 underline-offset-[6px]" : "text-[var(--fg-2)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>

            {/* künye satırı */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[var(--rule)] py-3 text-sm">
              <span className="font-semibold text-[var(--fg)]">{meta.company}</span>
              <span className="text-[var(--muted)]">{tarih || "—"}</span>
              <span className="hidden text-[var(--muted)] sm:inline">·</span>
              <span className="text-[var(--muted)]">
                {bayiler.length} bayi, {altBayiToplam} alt bayi
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
                {/* panel tipi — menü ve veriler role göre değişir */}
                <div role="group" aria-label="Panel tipi" className="flex gap-4">
                  {ROLE_ORDER.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      aria-pressed={role === r}
                      className={`min-h-[36px] whitespace-nowrap rounded transition ${
                        role === r ? "font-semibold text-[var(--brand-text)] underline decoration-2 underline-offset-[6px]" : "text-[var(--muted)] hover:text-[var(--fg)]"
                      } ${FOCUS}`}
                    >
                      {ROLE_META[r].label}
                    </button>
                  ))}
                </div>
                <span className="hidden text-[var(--rule)] sm:inline" aria-hidden="true">
                  |
                </span>
                <p className="whitespace-nowrap text-[var(--muted)]">
                  USD <span className="font-semibold tabular-nums text-[var(--fg)]">{usd ? usd.satis : "—"}</span>
                  <span className="ml-4">
                    EUR <span className="font-semibold tabular-nums text-[var(--fg)]">{eur ? eur.satis : "—"}</span>
                  </span>
                </p>
              </div>
            </div>

            {/* key={role}: rol değişince giriş animasyonları yeniden oynar */}
            <main key={role}>
              {/* hero + grafik */}
              <div className="grid grid-cols-1 gap-12 pt-12 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-14">
                <section style={{ "--i": 0 }} className="kg-rise" aria-labelledby="kg-hero-title">
                  <h1 id="kg-hero-title" className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-text)]">
                    BUGÜN · TOPLAM İŞLEM
                  </h1>
                  <p
                    style={SERIF}
                    className="mt-5 text-[52px] leading-[0.95] tracking-[-0.03em] tabular-nums text-[var(--fg)] sm:text-[76px] xl:text-[66px] 2xl:text-[88px]"
                  >
                    <Money value={toplam.value} />
                  </p>
                  <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[var(--fg-2)]">
                    {toplam.count.toLocaleString("tr-TR")} işlem, düne göre{" "}
                    <span className="font-semibold text-[var(--success-text)]">{TREND.toplam.txt} artış</span>. En yüksek hacim{" "}
                    {GUN_ADI[maxGun.d] || maxGun.d} günü {maxGun.t} ile gerçekleşti; {faturaBekleyen} işlemin faturası henüz yüklenmedi.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <button
                      type="button"
                      className={`inline-flex h-12 items-center gap-2 bg-[var(--brand)] px-6 text-[15px] font-semibold text-[var(--brand-fg)] transition active:scale-[0.98] hover:brightness-110 ${FOCUS}`}
                    >
                      <I name="plus" size={16} />
                      Ödeme Al
                    </button>
                    <button type="button" className={LINK}>
                      Dışa aktar
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  {role === ROLES.BAYI && (
                    <p className="mt-6 text-sm text-[var(--muted)]">
                      Ana firma carisi: <span className="font-semibold text-[var(--fg)]">Brisa A.Ş. — 320.00.001</span>
                    </p>
                  )}
                  {role === ROLES.ALT_BAYI && (
                    <p className="mt-6 text-sm text-[var(--muted)]">
                      Bayi carisi: <span className="font-semibold text-[var(--fg)]">Ankara Lastik Bayi — 320.01.001</span>
                    </p>
                  )}
                </section>
                <VolumeChart />
              </div>

              {/* ikincil metrikler — kutusuz, üst çizgili sütunlar */}
              <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
                {secondary.map((s, i) => (
                  <section key={s.key} style={{ "--i": i + 2 }} className="kg-rise border-t border-[var(--rule-strong)] pt-5" aria-label={s.label}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <p className="flex items-center gap-2 text-[var(--fg-2)]">
                        <span className={`h-2.5 w-2.5 rounded-full ${DOT[s.tone] || DOT.navy}`} aria-hidden="true" />
                        {s.label}
                      </p>
                      <p className="whitespace-nowrap text-[var(--muted)]">{s.count.toLocaleString("tr-TR")} adet</p>
                    </div>
                    <p style={SERIF} className="mt-4 text-[30px] leading-none tracking-[-0.02em] tabular-nums text-[var(--fg)] sm:text-[38px] lg:text-[28px] xl:text-[32px] 2xl:text-[40px]">
                      <Money value={s.value} />
                    </p>
                    <div className="mt-3">
                      <Trend t={TREND[s.key]} />
                    </div>
                  </section>
                ))}
              </div>

              {/* alt bölüm */}
              <div className="mt-20 grid grid-cols-1 gap-x-12 gap-y-14 xl:grid-cols-2">
                {/* son işlemler */}
                <section style={{ "--i": 4 }} className="kg-rise" aria-labelledby="kg-tx-title">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 id="kg-tx-title" style={SERIF} className="text-[28px] leading-none text-[var(--fg)]">
                      Son işlemler
                    </h2>
                    <button type="button" className={LINK}>
                      İşlem detayları <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--rule-strong)] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          <th scope="col" className="py-2.5 pr-4">Saat</th>
                          <th scope="col" className="py-2.5 pr-4">Müşteri</th>
                          <th scope="col" className="py-2.5 pr-4">Tür</th>
                          <th scope="col" className="py-2.5 pr-4 text-right">Tutar</th>
                          <th scope="col" className="py-2.5 text-right">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {islemler.slice(0, 5).map((t) => (
                          <tr key={t.id} className="border-b border-[var(--rule-soft)] transition-colors hover:bg-[var(--hover)]">
                            <td className="whitespace-nowrap py-4 pr-4 tabular-nums text-[var(--muted)]">{t.tarih.split(" ")[1]}</td>
                            <td className="whitespace-nowrap py-4 pr-4 font-semibold text-[var(--fg)]">{t.musteri}</td>
                            <td className="whitespace-nowrap py-4 pr-4 text-[var(--fg-2)]">
                              {t.tip} · {t.taksit === "Tek Çekim" ? "Tek çekim" : `${t.taksit} taksit`}
                            </td>
                            <td className="whitespace-nowrap py-4 pr-4 text-right font-semibold tabular-nums text-[var(--fg)]">{t.tutar.replace(/\s/g, "")}</td>
                            <td className={`whitespace-nowrap py-4 text-right font-semibold ${durumText(t.durum)}`}>{t.durum}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <div style={{ "--i": 5 }} className="kg-rise">
                  <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2">
                    {/* bakiye ve borç */}
                    <section aria-labelledby="kg-balance-title">
                      <h2 id="kg-balance-title" style={SERIF} className="text-[28px] leading-none text-[var(--fg)]">
                        Bakiye ve borç
                      </h2>
                      <p style={SERIF} className="mt-6 text-[38px] leading-none tracking-[-0.02em] tabular-nums text-[var(--brand-text)] 2xl:text-[44px]">
                        <Money value={bakiye.bakiye} />
                      </p>
                      <p className="mt-3 text-sm text-[var(--muted)]">Kullanılabilir bakiye</p>
                      <dl className="mt-6 text-sm">
                        <div className="flex items-center justify-between border-t border-[var(--rule)] py-3">
                          <dt className="text-[var(--fg-2)]">Güncel borç</dt>
                          <dd className="font-semibold tabular-nums text-[var(--danger-text)]">{bakiye.borc.replace(/\s/g, "")}</dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--rule)] py-3">
                          <dt className="text-[var(--fg-2)]">Ödeme limiti</dt>
                          <dd className="font-semibold tabular-nums text-[var(--fg)]">{bakiye.limit.replace(/\s/g, "")}</dd>
                        </div>
                        <div className="border-t border-[var(--rule)] py-3">
                          <div className="flex items-center justify-between">
                            <dt className="text-[var(--fg-2)]">Limit kullanımı</dt>
                            <dd className="font-semibold tabular-nums text-[var(--fg)]">%{bakiye.kullanim}</dd>
                          </div>
                          <div className="mt-2.5 h-[3px] bg-[var(--rule-soft)]" aria-hidden="true">
                            <div className="h-full bg-[var(--brand)]" style={{ width: `${bakiye.kullanim}%` }} />
                          </div>
                        </div>
                      </dl>
                    </section>

                    <Approvals role={role} />
                  </div>

                  {/* duyuru taslağı */}
                  {role === ROLES.ANA_FIRMA && duyuru && (
                    <section className="mt-10 flex flex-col gap-4 border-t border-[var(--rule-strong)] pt-6 sm:flex-row sm:items-center" aria-labelledby="kg-ann-title">
                      <span className="grid h-10 w-10 shrink-0 place-items-center text-[var(--danger)]" aria-hidden="true">
                        <I name="megaphone" size={24} strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 id="kg-ann-title" style={SERIF} className="text-[21px] leading-tight text-[var(--fg)]">
                          Duyuru taslağı: {duyuru.baslik}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--muted)]">Pop-up olarak görünecek · {duyuru.hedef}</p>
                      </div>
                      <button type="button" className={`${LINK} shrink-0 whitespace-nowrap`}>
                        Önizle ve gönder <span aria-hidden="true">→</span>
                      </button>
                    </section>
                  )}
                </div>
              </div>

              <Ranking role={role} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginView({ isDark, onToggleTheme, onLogin }) {
  const inputCls =
    "h-12 w-full border-0 border-b border-[var(--rule-strong)] bg-transparent px-0 text-[17px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-b-2 focus:border-[var(--brand)]";
  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
      <header className="flex h-16 items-center gap-2 border-b-2 border-[var(--rule-strong)]">
        <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={`${GHOST} -ml-2`}>
          <I name="arrowLeft" size={17} />
        </Link>
        <Wordmark compact />
        <span className="ml-auto hidden text-xs font-semibold tracking-[0.22em] text-[var(--muted)] sm:block">B2B ÖDEME PANELİ</span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
          title={isDark ? "Açık mod" : "Koyu mod"}
          className={`${GHOST} ml-auto sm:ml-2`}
        >
          <I name={isDark ? "sun" : "moon"} size={17} />
        </button>
      </header>
      <div className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-24">
        <div style={{ "--i": 0 }} className="kg-rise">
          <p className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-text)]">GİRİŞ</p>
          <h2 style={SERIF} className="mt-5 text-[48px] leading-[1] tracking-[-0.03em] text-[var(--fg)] sm:text-[72px]">
            Bayi ağınızı
            <br />
            tek panelden yönetin.
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[var(--fg-2)]">
            Ana firma, bayi ve alt bayi hiyerarşisi; manuel ve link ile ödeme, iptal / iade onayları, vade farkı profilleri ve
            raporlar tek yerde.
          </p>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[var(--rule-strong)] pt-6">
            {[
              ["3", "Panel tipi"],
              ["7/24", "Ödeme"],
              ["5", "Vade profili"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd style={SERIF} className="text-[36px] leading-none text-[var(--fg)]">
                  {n}
                </dd>
                <dd className="mt-1 text-sm text-[var(--muted)]">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <form
          style={{ "--i": 2 }}
          className="kg-rise w-full max-w-sm lg:pt-10"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <label className="block">
            <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-[var(--muted)]">E-POSTA</span>
            <input type="email" defaultValue="yonetici@brisa.com" autoComplete="email" className={inputCls} />
          </label>
          <label className="mt-8 block">
            <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-[var(--muted)]">ŞİFRE</span>
            <input type="password" defaultValue="123456" autoComplete="current-password" className={inputCls} />
          </label>
          <div className="mt-6 flex items-center justify-between text-sm">
            <label className="flex min-h-[40px] items-center gap-2 text-[var(--fg-2)]">
              <input type="checkbox" className="h-4 w-4 accent-[#0C34E7]" />
              Beni hatırla
            </label>
            <a href="#" onClick={(e) => e.preventDefault()} className={LINK}>
              Şifremi unuttum
            </a>
          </div>
          <button
            type="submit"
            className={`mt-8 inline-flex h-12 w-full items-center justify-center bg-[var(--brand)] text-[15px] font-semibold text-[var(--brand-fg)] transition active:scale-[0.98] hover:brightness-110 ${FOCUS}`}
          >
            Giriş Yap
          </button>
          <p className="mt-6 text-xs text-[var(--muted)]">Demo mockup — herhangi bir bilgiyle panele geçilir.</p>
        </form>
      </div>
    </div>
  );
}

export default function KagitDesign() {
  const { role, setRole } = useRole();
  const [view, setView] = useState("Panel");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      // ?theme=dark | ?theme=light ve ?view=giris bağlantıyla durumu zorlar (paylaşım / önizleme için)
      const params = new URLSearchParams(window.location.search);
      const q = params.get("theme");
      const s = localStorage.getItem("nkb-theme-kagit");
      if (q === "dark" || q === "light") setIsDark(q === "dark");
      else if (s) setIsDark(s === "dark");
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
      if (params.get("view") === "giris") setView("Giriş");
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("nkb-theme-kagit", isDark ? "dark" : "light");
    } catch (e) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <>
      <Head>
        <title>Tasarım 06 · Kağıt — N Kolay Bayim</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
      <div
        style={{ ...(isDark ? dark : light), fontFamily: "'IBM Plex Sans', sans-serif" }}
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

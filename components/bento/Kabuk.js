// Panel kabuğu: logo, sol menü (gruplar, bölümler, rozetler) ve kullanıcı menüsü.

import { useState } from "react";
import { ROLES, ROLE_META } from "@/lib/roles";
import { getNav } from "@/lib/nav";
import CompanyLogo from "@/components/CompanyLogo";
import I from "@/components/DesignIcons";
import { SAHTE_BACKEND } from "@/lib/api/istemci";
import { etiket } from "@/lib/etiketler";
import { useDemoVerisiniSifirla, useOturum } from "@/lib/sorgular/oturum";
import { isReady } from "./sayfalar";
import { FOCUS, GHOST, MENU_ITEM } from "./tema";
import { useDismiss } from "./yardimci";

// Menüde "Yönetim" bölümüne giren öğeler
const MANAGE_ICONS = new Set(["dealer", "settings", "megaphone"]);

// N Kolay logosu (CDN). Tek renk mavi SVG; koyu ve mavi zeminlerde beyaza çevrilir.
const NK_LOGO = "https://cdn.nkolayislem.com.tr/e-full-logo.svg";

export function Logo({ onBrand, compact }) {
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

export function Sidebar({ role, desktopOpen, mobileOpen, hidden, onClose, onLogout, current, onNavigate, rozetler }) {
  const nav = getNav(role);
  const meta = ROLE_META[role];
  const main = nav.filter((e) => !MANAGE_ICONS.has(e.icon));
  const manage = nav.filter((e) => MANAGE_ICONS.has(e.icon));
  // tüm gruplar kapalı başlar; aynı anda tek grup açık kalır. Açık ekranın grubu kapalıyken de başlığı vurgulanır.
  const [openGroup, setOpenGroup] = useState(null);
  const oturum = useOturum();
  const anaFirma = oturum.data?.anaFirma;

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
          <CompanyLogo name={anaFirma?.unvan || "N Kolay Bayim"} size={48} tone="light" className="relative shrink-0" />
          <div className="relative min-w-0 leading-tight">
            <p className="truncate text-[15px] font-extrabold">{anaFirma?.unvan || "…"}</p>
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

        {/* kullanıcı — GET /oturum */}
        <div className="m-3 mt-0 flex shrink-0 items-center gap-2.5 rounded-xl border border-[var(--border)] p-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-extrabold text-white">
            {basHarfler(oturum.data?.kullanici.adSoyad) || meta.short}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            {oturum.isPending ? (
              <>
                <span className="block h-3 w-28 animate-pulse rounded bg-[var(--soft-2)] motion-reduce:animate-none" />
                <span className="mt-1.5 block h-2.5 w-16 animate-pulse rounded bg-[var(--soft-2)] motion-reduce:animate-none" />
              </>
            ) : (
              <>
                <span className="block truncate text-[12.5px] font-bold text-[var(--fg)]">{oturum.data?.kullanici.adSoyad || meta.user}</span>
                <span className="block truncate text-[11px] font-medium text-[var(--muted)]">
                  {oturum.isError ? "Oturum alınamadı" : `${etiket("yetki", oturum.data?.kullanici.yetki)} · Çevrimiçi`}
                </span>
              </>
            )}
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

// "Ad Soyad" → "AS"
const basHarfler = (ad) =>
  (ad || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toLocaleUpperCase("tr-TR"))
    .join("");

export function UserMenu({ meta, isDark, onToggleTheme, onLogout }) {
  const [open, setOpen] = useState(false);
  useDismiss(open, () => setOpen(false));
  const oturum = useOturum();
  const sifirla = useDemoVerisiniSifirla();
  const adSoyad = oturum.data?.kullanici.adSoyad || meta.user;
  const firmaUnvan = oturum.data?.firma.unvan || meta.company;
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
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-extrabold text-white">{basHarfler(adSoyad) || meta.short}</span>
        <span className="hidden max-w-[150px] truncate text-[12.5px] font-semibold text-[var(--fg)] xl:block">{adSoyad}</span>
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
              <p className="truncate text-[12.5px] font-bold text-[var(--fg)]">{adSoyad}</p>
              <p className="truncate text-[11.5px] text-[var(--muted)]">{firmaUnvan}</p>
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
            {SAHTE_BACKEND && (
              <button
                type="button"
                role="menuitem"
                className={MENU_ITEM}
                disabled={sifirla.isPending}
                onClick={() => {
                  sifirla.mutate();
                  setOpen(false);
                }}
                title="Sahte backend verisini başlangıç haline döndürür"
              >
                <I name="refund" size={14} />
                {sifirla.isPending ? "Sıfırlanıyor…" : "Demo verisini sıfırla"}
              </button>
            )}
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

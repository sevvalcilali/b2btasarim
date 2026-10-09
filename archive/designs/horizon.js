// ARŞİV — Bento (Tasarım 03) seçildiği için yorum satırına alındı; derlemeye ve sayfalara dahil değildir.
// Eski konumu: pages/designs/horizon.js. Geri almak için satır başlarındaki "// " (boş satırlarda "//") kaldırılıp dosya eski yerine taşınmalı.
//
// import { useEffect, useState } from "react";
// import Head from "next/head";
// import Link from "next/link";
// import Icon from "@/components/Icons";
// import { useRole } from "@/components/RoleContext";
// import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
// import { getNav } from "@/lib/nav";
// import CompanyLogo from "@/components/CompanyLogo";
// import { kpis, islemler, bakiyeOzet, iptalIadeTalepleri, anaFirma } from "@/lib/mockData";
//
// // Tasarım 02 — Horizon: açılır kapanır beyaz sol menü (akordiyon gruplar), ince üst bar,
// // marka mavisi hero bandı ve alan grafiği. Açık / koyu mod.
//
// const light = {
//   "--bg": "#F5F5F6",
//   "--surface": "#FFFFFF",
//   "--surface-2": "#F5F5F6",
//   "--fg": "#1E1E1E",
//   "--fg-2": "#3A434A",
//   "--muted": "#6E7A8A",
//   "--border": "#EBECED",
//   "--border-strong": "#D8D9DB",
//   "--brand": "#0C34E7",
//   "--brand-fg": "#FFFFFF",
//   "--brand-text": "#0C34E7",
//   "--brand-soft": "#EAE8FD",
//   "--brand-softer": "#F4F3FE",
//   "--side": "#FFFFFF",
//   "--side-fg": "#3A434A",
//   "--side-hover": "#F4F3FE",
//   "--side-active-bg": "#EAE8FD",
//   "--side-active-fg": "#0C34E7",
//   "--side-scroll": "#D8D9DB",
//   "--success": "#0EB567",
//   "--danger": "#DC204D",
//   "--warning": "#F89B3C",
//   "--success-text": "#0A8A4E",
//   "--danger-text": "#C81C45",
//   "--warning-text": "#B45F06",
//   "--success-soft": "#E1F5EA",
//   "--danger-soft": "#FBE4E9",
//   "--warning-soft": "#FEF0E1",
//   "--ring": "#0C34E7",
//   "--shadow": "0 1px 2px rgba(30,30,30,0.04), 0 10px 26px -20px rgba(30,30,30,0.20)",
//   "--pop-shadow": "0 14px 36px -14px rgba(30,30,30,0.28), 0 2px 6px rgba(30,30,30,0.06)",
//   "--logo-filter": "none",
// };
//
// const dark = {
//   "--bg": "#0C0D10",
//   "--surface": "#16181D",
//   "--surface-2": "#1E2027",
//   "--fg": "#F5F5F6",
//   "--fg-2": "#D8D9DB",
//   "--muted": "#B0B4B7",
//   "--border": "#262A31",
//   "--border-strong": "#3A434A",
//   "--brand": "#0C34E7",
//   "--brand-fg": "#FFFFFF",
//   "--brand-text": "#D4D1FC",
//   "--brand-soft": "rgba(12,52,231,0.30)",
//   "--brand-softer": "rgba(12,52,231,0.14)",
//   "--side": "#121419",
//   "--side-fg": "#C4C7C9",
//   "--side-hover": "rgba(255,255,255,0.05)",
//   "--side-active-bg": "rgba(12,52,231,0.38)",
//   "--side-active-fg": "#FFFFFF",
//   "--side-scroll": "#3A434A",
//   "--success": "#0EB567",
//   "--danger": "#DC204D",
//   "--warning": "#F89B3C",
//   "--success-text": "#35D08A",
//   "--danger-text": "#F2617E",
//   "--warning-text": "#F5A65B",
//   "--success-soft": "rgba(14,181,103,0.16)",
//   "--danger-soft": "rgba(220,32,77,0.18)",
//   "--warning-soft": "rgba(248,155,60,0.16)",
//   "--ring": "#D4D1FC",
//   "--shadow": "0 1px 2px rgba(0,0,0,0.4), 0 12px 28px -18px rgba(0,0,0,0.7)",
//   "--pop-shadow": "0 16px 40px -12px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)",
//   "--logo-filter": "brightness(0) invert(1)",
// };
//
// // Haftalık hacim (bin ₺)
// const WEEK = [
//   { d: "Pzt", k: 512 },
//   { d: "Sal", k: 644 },
//   { d: "Çar", k: 446 },
//   { d: "Per", k: 751 },
//   { d: "Cum", k: 826 },
//   { d: "Cmt", k: 330 },
//   { d: "Paz", k: 231 },
// ];
// const PERIODS = ["Bugün", "Hafta", "Ay"];
//
// // Mock "geçen haftaya göre" değişimleri — good: değişim olumlu mu?
// const TREND = {
//   toplam: { txt: "%12,4", up: true, good: true },
//   basarili: { txt: "%9,8", up: true, good: true },
//   basarisiz: { txt: "%3,1", up: false, good: true },
//   iptal: { txt: "%1,4", up: true, good: false },
//   iade: { txt: "%0,7", up: false, good: true },
// };
//
// const TONE_BG = {
//   green: "bg-[var(--success)]",
//   red: "bg-[var(--danger)]",
//   amber: "bg-[var(--warning)]",
//   navy: "bg-[var(--brand)]",
// };
//
// const QUICK = [
//   { label: "Manuel Ödeme", desc: "Kart bilgisiyle tahsilat", icon: "wallet" },
//   { label: "Link ile Ödeme", desc: "Ödeme linki oluştur", icon: "link" },
//   { label: "Fatura Yükle", desc: "Bekleyen faturaları tamamla", icon: "upload" },
// ];
//
// const CARD = "rounded-xl border border-[var(--border)] bg-[var(--surface)] [box-shadow:var(--shadow)]";
// const FOCUS =
//   "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]";
// // Üst bardaki küçük, çerçevesiz ikon düğmesi
// const GHOST = `grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--side-hover)] hover:text-[var(--brand-text)] ${FOCUS}`;
// const MENU_ITEM = `flex min-h-[36px] w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] text-[var(--fg-2)] transition-colors hover:bg-[var(--side-hover)] hover:text-[var(--brand-text)] ${FOCUS}`;
// const POPOVER = "absolute top-full z-40 mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 [box-shadow:var(--pop-shadow)]";
//
// function pillTone(durum) {
//   if (durum === "Başarılı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
//   if (durum === "Başarısız") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
//   return "bg-[var(--warning-soft)] text-[var(--warning-text)]"; // İptal / İade
// }
//
// // "₺ 4.284.900" → 4284900
// function parseAmount(value) {
//   return Number(String(value).replace(/[^\d]/g, "")) || 0;
// }
//
// // Haftalık değerlerden yumuşak bir alan grafiği yolu üretir.
// function chartPaths(w = 720, h = 200, pad = 10) {
//   const values = WEEK.map((x) => x.k);
//   const max = Math.max(...values);
//   const stepX = (w - pad * 2) / (values.length - 1);
//   const pts = values.map((v, i) => [pad + i * stepX, h - pad - (v / max) * (h - pad * 2 - 26)]);
//   let line = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
//   for (let i = 1; i < pts.length; i++) {
//     const [px, py] = pts[i - 1];
//     const [x, y] = pts[i];
//     const cx = ((px + x) / 2).toFixed(1);
//     line += ` C ${cx} ${py.toFixed(1)}, ${cx} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
//   }
//   const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${h} L ${pts[0][0].toFixed(1)} ${h} Z`;
//   return { line, area, pts, w, h, maxI: values.indexOf(max) };
// }
//
// // Escape ile kapanan küçük açılır menüler için
// function useDismiss(open, close) {
//   useEffect(() => {
//     if (!open) return undefined;
//     const onKey = (e) => e.key === "Escape" && close();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, close]);
// }
//
// // N Kolay logosu (CDN). Tek renk mavi SVG; koyu ve mavi zeminlerde beyaza çevrilir.
// const NK_LOGO = "https://cdn.nkolayislem.com.tr/e-full-logo.svg";
//
// function Wordmark({ compact, onBrand }) {
//   return (
//     // eslint-disable-next-line @next/next/no-img-element
//     <img
//       src={NK_LOGO}
//       alt="N Kolay"
//       className={`w-auto shrink-0 ${compact ? "h-6" : "h-7"}`}
//       style={{ filter: onBrand ? "brightness(0) invert(1)" : "var(--logo-filter)" }}
//     />
//   );
// }
//
// function SunMoon({ isDark }) {
//   return isDark ? (
//     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//       <circle cx="12" cy="12" r="4" />
//       <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
//     </svg>
//   ) : (
//     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//       <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
//     </svg>
//   );
// }
//
// function ArrowLeft() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//       <path d="M19 12H5M11 6l-6 6 6 6" />
//     </svg>
//   );
// }
//
// // Kenar çubuğu aç / kapat simgesi
// function PanelIcon() {
//   return (
//     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//       <rect x="3" y="4" width="18" height="16" rx="3" />
//       <path d="M9 4v16" />
//     </svg>
//   );
// }
//
// function TrendArrow({ up }) {
//   return (
//     <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
//       {up ? <path d="M5 1.5 9 8H1z" /> : <path d="M5 8.5 1 2h8z" />}
//     </svg>
//   );
// }
//
// // Sol menüdeki açılır (akordiyon) grup
// function NavGroup({ entry, open, onToggle }) {
//   const id = `hz-grp-${entry.icon}`;
//   return (
//     <div>
//       <button
//         type="button"
//         onClick={onToggle}
//         aria-expanded={open}
//         aria-controls={id}
//         className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors hover:bg-[var(--side-hover)] ${
//           open ? "text-[var(--brand-text)]" : "text-[var(--side-fg)]"
//         } ${FOCUS}`}
//       >
//         <Icon name={entry.icon} size={17} />
//         <span className="flex-1 text-left">{entry.label}</span>
//         <span className={`text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`}>
//           <Icon name="chevron" size={13} />
//         </span>
//       </button>
//       <div
//         id={id}
//         className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
//           open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
//         }`}
//       >
//         <div className="overflow-hidden">
//           <ul className="mb-1 mt-0.5 space-y-px pl-[17px]">
//             {entry.items.map((i) => (
//               <li key={i.href}>
//                 <button
//                   type="button"
//                   tabIndex={open ? 0 : -1}
//                   className={`group flex min-h-[34px] w-full items-center gap-3 rounded-md px-3 text-left text-[13px] text-[var(--side-fg)] transition-colors hover:bg-[var(--side-hover)] hover:text-[var(--brand-text)] ${FOCUS}`}
//                 >
//                   <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--border-strong)] transition-colors group-hover:bg-[var(--brand)]" aria-hidden="true" />
//                   {i.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// function Sidebar({ role, desktopOpen, mobileOpen, hidden, onClose, onLogout }) {
//   const nav = getNav(role);
//   const meta = ROLE_META[role];
//   // aynı anda tek grup açık kalır
//   const [openGroup, setOpenGroup] = useState("Raporlar");
//
//   return (
//     <>
//       {mobileOpen && <div className="fixed inset-0 z-[55] bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
//       <aside
//         aria-label="Ana menü"
//         inert={hidden ? "" : undefined}
//         className={`fixed inset-y-0 left-0 z-[60] flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--side)] transition-[transform,margin] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:bottom-auto lg:left-auto lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:self-start ${
//           mobileOpen ? "translate-x-0" : "-translate-x-full"
//         } ${desktopOpen ? "lg:ml-0" : "lg:-ml-64"}`}
//       >
//         <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] pl-5 pr-3">
//           <Wordmark />
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Menüyü kapat"
//             title="Menüyü kapat"
//             className={`grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--side-hover)] hover:text-[var(--brand-text)] ${FOCUS}`}
//           >
//             <span className="rotate-180">
//               <Icon name="chevron" size={15} />
//             </span>
//           </button>
//         </div>
//
//         {/* ana firma — her rolde göz önünde: mavi kart, büyük logo */}
//         <div className="relative mx-3 mt-3 flex shrink-0 items-center gap-3 overflow-hidden rounded-xl bg-[#0C34E7] p-3 text-white [box-shadow:0_12px_26px_-14px_rgba(12,52,231,0.8)]">
//           <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#D4D1FC] opacity-30 blur-2xl" aria-hidden="true" />
//           <CompanyLogo name={anaFirma.ad} size={48} tone="light" className="relative shrink-0" />
//           <div className="relative min-w-0 leading-tight">
//             <p className="truncate text-[15px] font-bold">{anaFirma.ad}</p>
//             <p className="mt-0.5 truncate text-[11px] font-medium text-white/75">Ana Firma · B2B Bayi Ağı</p>
//           </div>
//         </div>
//         {/* bayi / alt bayi girişinde kullanıcının kendi firması */}
//         {role !== ROLES.ANA_FIRMA && (
//           <div className="mx-3 mt-2 flex shrink-0 items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2">
//             <CompanyLogo name={meta.company} color={meta.logoColor} size={32} className="shrink-0" />
//             <span className="min-w-0 leading-tight">
//               <span className="block truncate text-[12.5px] font-semibold text-[var(--fg)]">{meta.company}</span>
//               <span className="block text-[10.5px] leading-snug text-[var(--muted)]">
//                 {meta.label} · {meta.parentNote}
//               </span>
//             </span>
//           </div>
//         )}
//
//         <p className="px-6 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Menü</p>
//         <nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 pb-3 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:var(--side-scroll)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--side-scroll)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
//           {nav.map((entry) =>
//             entry.items ? (
//               <NavGroup
//                 key={entry.label}
//                 entry={entry}
//                 open={openGroup === entry.label}
//                 onToggle={() => setOpenGroup((g) => (g === entry.label ? null : entry.label))}
//               />
//             ) : (
//               <button
//                 key={entry.label}
//                 type="button"
//                 aria-current={entry.href === "/dashboard" ? "page" : undefined}
//                 className={`relative flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors ${
//                   entry.href === "/dashboard"
//                     ? "bg-[var(--side-active-bg)] font-semibold text-[var(--side-active-fg)]"
//                     : "font-medium text-[var(--side-fg)] hover:bg-[var(--side-hover)]"
//                 } ${FOCUS}`}
//               >
//                 {entry.href === "/dashboard" && (
//                   <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-[var(--brand)]" aria-hidden="true" />
//                 )}
//                 <Icon name={entry.icon} size={17} />
//                 <span>{entry.label}</span>
//               </button>
//             )
//           )}
//         </nav>
//
//         {/* kullanıcı + çıkış */}
//         <div className="flex shrink-0 items-center gap-2.5 border-t border-[var(--border)] p-3">
//           <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[11px] font-bold text-[var(--brand-fg)]">
//             {meta.short}
//           </span>
//           <span className="min-w-0 flex-1 leading-tight">
//             <span className="block truncate text-[13px] font-semibold text-[var(--fg)]">{meta.user}</span>
//             <span className="block truncate text-[11.5px] text-[var(--muted)]">Çevrimiçi</span>
//           </span>
//           <button
//             type="button"
//             onClick={onLogout}
//             aria-label="Çıkış yap"
//             title="Çıkış yap"
//             className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger-text)] ${FOCUS}`}
//           >
//             <Icon name="logout" size={16} />
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }
//
// // Konum satırındaki panel tipi seçici — menü ve veriler role göre değişir
// function RoleMenu({ role, setRole }) {
//   const [open, setOpen] = useState(false);
//   useDismiss(open, () => setOpen(false));
//   return (
//     <div className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         aria-haspopup="menu"
//         aria-expanded={open}
//         className={`flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--side-hover)] ${FOCUS}`}
//       >
//         <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
//         {ROLE_META[role].label} Paneli
//         <span className={`text-[var(--muted)] transition-transform duration-200 ${open ? "-rotate-90" : "rotate-90"}`}>
//           <Icon name="chevron" size={11} />
//         </span>
//       </button>
//       {open && (
//         <>
//           <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
//           <div role="menu" aria-label="Panel tipi" className={`${POPOVER} left-0 w-64`}>
//             <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Panel Tipi</p>
//             {ROLE_ORDER.map((r) => (
//               <button
//                 key={r}
//                 type="button"
//                 role="menuitemradio"
//                 aria-checked={role === r}
//                 onClick={() => {
//                   setRole(r);
//                   setOpen(false);
//                 }}
//                 className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-2.5 text-left transition-colors hover:bg-[var(--side-hover)] ${
//                   role === r ? "bg-[var(--brand-softer)]" : ""
//                 } ${FOCUS}`}
//               >
//                 <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--brand-soft)] text-[10px] font-bold text-[var(--brand-text)]">
//                   {ROLE_META[r].short}
//                 </span>
//                 <span className="min-w-0 flex-1 leading-tight">
//                   <span className="block text-[13px] font-semibold text-[var(--fg)]">{ROLE_META[r].label}</span>
//                   <span className="block truncate text-[11.5px] text-[var(--muted)]">{ROLE_META[r].company}</span>
//                 </span>
//                 {role === r && (
//                   <span className="text-[var(--brand-text)]">
//                     <Icon name="check" size={15} />
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
//
// function UserMenu({ meta, isDark, onToggleTheme, onLogout }) {
//   const [open, setOpen] = useState(false);
//   useDismiss(open, () => setOpen(false));
//   return (
//     <div className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         aria-haspopup="menu"
//         aria-expanded={open}
//         aria-label="Kullanıcı menüsü"
//         className={`flex h-9 items-center gap-2 rounded-lg pl-1 pr-1.5 transition-colors hover:bg-[var(--side-hover)] ${FOCUS}`}
//       >
//         <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-[var(--brand-fg)]">{meta.short}</span>
//         <span className="hidden max-w-[160px] truncate text-[13px] font-medium text-[var(--fg)] xl:block">{meta.user}</span>
//         <span className={`hidden text-[var(--muted)] transition-transform duration-200 sm:block ${open ? "-rotate-90" : "rotate-90"}`}>
//           <Icon name="chevron" size={12} />
//         </span>
//       </button>
//       {open && (
//         <>
//           <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
//           <div role="menu" className={`${POPOVER} right-0 w-60`}>
//             <div className="px-2.5 pb-2 pt-1.5">
//               <p className="truncate text-[13px] font-semibold text-[var(--fg)]">{meta.user}</p>
//               <p className="truncate text-xs text-[var(--muted)]">{meta.company}</p>
//             </div>
//             <div className="my-1 border-t border-[var(--border)]" />
//             <button type="button" role="menuitem" className={MENU_ITEM} onClick={() => setOpen(false)}>
//               <Icon name="building" size={15} />
//               Firma Bilgileri
//             </button>
//             <button
//               type="button"
//               role="menuitem"
//               className={MENU_ITEM}
//               onClick={() => {
//                 onToggleTheme();
//                 setOpen(false);
//               }}
//             >
//               <SunMoon isDark={isDark} />
//               {isDark ? "Açık moda geç" : "Koyu moda geç"}
//             </button>
//             <div className="my-1 border-t border-[var(--border)]" />
//             <button
//               type="button"
//               role="menuitem"
//               className={`${MENU_ITEM} hover:!bg-[var(--danger-soft)] hover:!text-[var(--danger-text)]`}
//               onClick={() => {
//                 setOpen(false);
//                 onLogout();
//               }}
//             >
//               <Icon name="logout" size={15} />
//               Çıkış Yap
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
//
// function Hero({ toplam, basarili }) {
//   const [period, setPeriod] = useState("Hafta");
//   const { line, area, pts, w, h, maxI } = chartPaths();
//   const oran = toplam.count ? (basarili.count / toplam.count) * 100 : 0;
//   const ortalama = toplam.count ? Math.round(parseAmount(toplam.value) / toplam.count) : 0;
//   const bekleyen = iptalIadeTalepleri.filter((t) => t.durum === "Onayda").length;
//   const facts = [
//     { label: "Başarı oranı", value: `%${oran.toFixed(1).replace(".", ",")}` },
//     { label: "Ortalama sepet", value: `₺ ${ortalama.toLocaleString("tr-TR")}` },
//     { label: "Onay bekleyen", value: `${bekleyen} talep` },
//   ];
//
//   return (
//     <section className="relative overflow-hidden rounded-2xl bg-[#0C34E7] text-white" aria-labelledby="hz-hero-title">
//       <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#D4D1FC] opacity-25 blur-3xl" aria-hidden="true" />
//       <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#D4D1FC] opacity-10 blur-3xl" aria-hidden="true" />
//
//       <div className="relative grid grid-cols-1 gap-8 p-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:p-7">
//         <div className="flex flex-col justify-center">
//           <h2 id="hz-hero-title" className="text-[13px] font-medium text-white/80">
//             {toplam.label}
//           </h2>
//           <p className="mt-2 text-[38px] font-semibold leading-none tracking-tight tabular-nums">{toplam.value}</p>
//           <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
//             <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-semibold">
//               <TrendArrow up={TREND.toplam.up} />
//               {TREND.toplam.txt}
//             </span>
//             <span className="text-white/75">geçen haftaya göre · {toplam.count} adet işlem</span>
//           </div>
//         </div>
//
//         <div className="min-w-0">
//           <div className="mb-3 flex items-center justify-between gap-3">
//             <p className="text-[13px] font-medium text-white/80">Haftalık İşlem Hacmi</p>
//             <div role="group" aria-label="Dönem" className="flex rounded-lg bg-white/10 p-0.5">
//               {PERIODS.map((p) => (
//                 <button
//                   key={p}
//                   type="button"
//                   onClick={() => setPeriod(p)}
//                   aria-pressed={period === p}
//                   className={`h-7 rounded-md px-2.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
//                     period === p ? "bg-white font-semibold text-[#0C34E7]" : "text-white/80 hover:text-white"
//                   }`}
//                 >
//                   {p}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div className="relative h-40">
//             <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Haftalık işlem hacmi alan grafiği">
//               <defs>
//                 <linearGradient id="hzFill" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.30" />
//                   <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
//                 </linearGradient>
//               </defs>
//               {[0.25, 0.5, 0.75].map((g) => (
//                 <line key={g} x1="0" x2={w} y1={g * h} y2={g * h} stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
//               ))}
//               <path d={area} fill="url(#hzFill)" />
//               <path d={line} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
//             </svg>
//             {pts.map((p, i) => (
//               <span
//                 key={WEEK[i].d}
//                 aria-hidden="true"
//                 className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0C34E7] bg-white ${i === maxI ? "h-3 w-3" : "h-2 w-2"}`}
//                 style={{ left: `${(p[0] / w) * 100}%`, top: `${(p[1] / h) * 100}%` }}
//               />
//             ))}
//             <span
//               className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#0C34E7]"
//               style={{ left: `${(pts[maxI][0] / w) * 100}%`, top: `calc(${(pts[maxI][1] / h) * 100}% - 10px)` }}
//             >
//               ₺ {WEEK[maxI].k}K
//             </span>
//           </div>
//           <div className="mt-2 flex justify-between text-[11.5px] text-white/70">
//             {WEEK.map((d) => (
//               <span key={d.d}>{d.d}</span>
//             ))}
//           </div>
//         </div>
//       </div>
//
//       {/* özet şeridi */}
//       <dl className="relative grid grid-cols-3 divide-x divide-white/15 border-t border-white/15 bg-white/[0.06]">
//         {facts.map((f) => (
//           <div key={f.label} className="px-4 py-3 sm:px-7">
//             <dt className="text-[11.5px] text-white/70">{f.label}</dt>
//             <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">{f.value}</dd>
//           </div>
//         ))}
//       </dl>
//     </section>
//   );
// }
//
// function PanelView({ role, setRole, isDark, onToggleTheme, onLogout }) {
//   const [desktopOpen, setDesktopOpen] = useState(true);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [isDesktop, setIsDesktop] = useState(true);
//   const meta = ROLE_META[role];
//   const stats = kpis[role];
//   const toplam = stats.find((s) => s.key === "toplam") || stats[0];
//   const basarili = stats.find((s) => s.key === "basarili") || toplam;
//   const secondary = stats.filter((s) => s.key !== "toplam");
//   const bakiye = bakiyeOzet[role];
//
//   useEffect(() => {
//     try {
//       const mq = window.matchMedia("(min-width: 1024px)");
//       const sync = () => setIsDesktop(mq.matches);
//       sync();
//       mq.addEventListener("change", sync);
//       // ?menu=closed | ?menu=open bağlantıyla menü durumunu zorlar
//       const q = new URLSearchParams(window.location.search).get("menu");
//       if (q === "closed" || (q !== "open" && localStorage.getItem("nkb-horizon-menu") === "closed")) setDesktopOpen(false);
//       return () => mq.removeEventListener("change", sync);
//     } catch (e) {
//       return undefined;
//     }
//   }, []);
//
//   const setDesktop = (next) => {
//     setDesktopOpen(next);
//     try {
//       localStorage.setItem("nkb-horizon-menu", next ? "open" : "closed");
//     } catch (e) {}
//   };
//   const toggleMenu = () => (isDesktop ? setDesktop(!desktopOpen) : setMobileOpen((o) => !o));
//   const closeMenu = () => (isDesktop ? setDesktop(false) : setMobileOpen(false));
//   const menuVisible = isDesktop ? desktopOpen : mobileOpen;
//
//   const selectCls = `h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[13px] text-[var(--fg-2)] ${FOCUS}`;
//
//   return (
//     <div className="flex flex-1">
//       <Sidebar role={role} desktopOpen={desktopOpen} mobileOpen={mobileOpen} hidden={!menuVisible} onClose={closeMenu} onLogout={onLogout} />
//
//       <div className="flex min-w-0 flex-1 flex-col">
//         {/* üst bar */}
//         <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-1.5 border-b border-[var(--border)] bg-[var(--surface)] px-3 lg:px-5">
//           <button
//             type="button"
//             onClick={toggleMenu}
//             aria-label={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
//             aria-expanded={menuVisible}
//             title={menuVisible ? "Menüyü kapat" : "Menüyü aç"}
//             className={GHOST}
//           >
//             <PanelIcon />
//           </button>
//           <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={GHOST}>
//             <ArrowLeft />
//           </Link>
//
//           {/* menü kapalıyken marka üst barda görünür */}
//           <div
//             className={`ml-1 block max-w-[220px] shrink-0 overflow-hidden transition-[max-width,opacity,margin] duration-300 motion-reduce:transition-none ${
//               desktopOpen ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : "lg:ml-2 lg:max-w-[220px] lg:opacity-100"
//             }`}
//             aria-hidden={desktopOpen && isDesktop ? "true" : undefined}
//           >
//             <div className="flex items-center gap-2.5 whitespace-nowrap">
//               <CompanyLogo name={anaFirma.ad} size={32} className="shrink-0" />
//               <span className="hidden leading-tight sm:block">
//                 <span className="block text-[13.5px] font-bold text-[var(--fg)]">{anaFirma.ad}</span>
//                 <span className="block text-[10.5px] text-[var(--muted)]">Ana Firma · N Kolay Bayim</span>
//               </span>
//             </div>
//           </div>
//
//           <span className="mx-1.5 hidden h-5 w-px bg-[var(--border-strong)] sm:block" aria-hidden="true" />
//
//           {/* konum: panel tipi › sayfa */}
//           <nav aria-label="Konum" className="flex min-w-0 items-center gap-0.5 text-[13px]">
//             <RoleMenu role={role} setRole={setRole} />
//             <span className="hidden text-[var(--muted)] sm:block">
//               <Icon name="chevron" size={12} />
//             </span>
//             <span className="hidden px-2 font-semibold text-[var(--fg)] sm:block">Ana Sayfa</span>
//           </nav>
//
//           <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
//             <label className="relative mr-1 hidden lg:block">
//               <span className="sr-only">Ara</span>
//               <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
//                 <Icon name="search" size={15} />
//               </span>
//               <input
//                 type="search"
//                 placeholder="İşlem, cari veya müşteri ara"
//                 className="h-9 w-64 rounded-lg border border-transparent bg-[var(--surface-2)] pl-9 pr-3 text-[13px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--border-strong)] focus:border-[var(--brand)] focus:bg-[var(--surface)]"
//               />
//             </label>
//             <button
//               type="button"
//               onClick={onToggleTheme}
//               aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
//               title={isDark ? "Açık mod" : "Koyu mod"}
//               className={`${GHOST} hidden sm:grid`}
//             >
//               <SunMoon isDark={isDark} />
//             </button>
//             <button type="button" aria-label="Bildirimler" title="Bildirimler" className={`${GHOST} relative`}>
//               <Icon name="bell" size={17} />
//               <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />
//             </button>
//             <span className="mx-1 hidden h-5 w-px bg-[var(--border-strong)] sm:block" aria-hidden="true" />
//             <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />
//           </div>
//         </header>
//
//         <main className="flex-1 px-4 py-6 lg:px-8 lg:py-7">
//           <div className="mx-auto max-w-[1320px]">
//             <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//               <div>
//                 <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">Ana Sayfa</h1>
//                 <p className="mt-0.5 text-[13px] text-[var(--muted)]">{meta.company} · Bugünkü işlem özeti</p>
//               </div>
//               <div className="flex flex-wrap items-center gap-2">
//                 {role === ROLES.BAYI && (
//                   <select aria-label="Ana firma cari seçimi" defaultValue="" className={selectCls}>
//                     <option value="">Ana Firma Cari Seçimi</option>
//                     <option>Brisa A.Ş. — 320.00.001</option>
//                     <option>Brisa Perakende — 320.00.002</option>
//                   </select>
//                 )}
//                 {role === ROLES.ALT_BAYI && (
//                   <select aria-label="Bayi cari seçimi" defaultValue="" className={selectCls}>
//                     <option value="">Bayi Cari Seçimi</option>
//                     <option>Ankara Lastik Bayi — 320.01.001</option>
//                   </select>
//                 )}
//                 <button
//                   type="button"
//                   className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
//                 >
//                   <Icon name="download" size={15} />
//                   Dışa Aktar
//                 </button>
//                 <button
//                   type="button"
//                   className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 text-[13px] font-semibold text-[var(--brand-fg)] shadow-sm transition hover:opacity-90 ${FOCUS}`}
//                 >
//                   <Icon name="plus" size={15} />
//                   Ödeme Al
//                 </button>
//               </div>
//             </div>
//
//             <Hero toplam={toplam} basarili={basarili} />
//
//             {/* ikincil metrikler — ikon yok; toplam içindeki pay çubuğu */}
//             <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
//               {secondary.map((s) => {
//                 const tr = TREND[s.key];
//                 const pay = toplam.count ? (s.count / toplam.count) * 100 : 0;
//                 return (
//                   <div key={s.key} className={`p-4 ${CARD}`}>
//                     <div className="flex items-center justify-between gap-2">
//                       <p className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
//                         <span className={`h-1.5 w-1.5 rounded-full ${TONE_BG[s.tone] || TONE_BG.navy}`} aria-hidden="true" />
//                         {s.label}
//                       </p>
//                       {tr && (
//                         <span
//                           className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[10.5px] font-semibold ${
//                             tr.good ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--danger-soft)] text-[var(--danger-text)]"
//                           }`}
//                         >
//                           <TrendArrow up={tr.up} />
//                           {tr.txt}
//                         </span>
//                       )}
//                     </div>
//                     <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums text-[var(--fg)]">{s.value}</p>
//                     <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface-2)]" aria-hidden="true">
//                       <div className={`h-full rounded-full ${TONE_BG[s.tone] || TONE_BG.navy}`} style={{ width: `${Math.max(pay, 2)}%` }} />
//                     </div>
//                     <p className="mt-1.5 flex justify-between text-[11.5px] tabular-nums text-[var(--muted)]">
//                       <span>{s.count} adet</span>
//                       <span>Pay %{pay.toFixed(1).replace(".", ",")}</span>
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//
//             {/* tablo + sağ sütun */}
//             <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
//               <section className={`overflow-hidden lg:col-span-2 ${CARD}`} aria-labelledby="hz-tx-title">
//                 <div className="flex items-center justify-between gap-3 px-5 py-3.5">
//                   <div>
//                     <h2 id="hz-tx-title" className="text-[15px] font-semibold text-[var(--fg)]">
//                       Son İşlemler
//                     </h2>
//                     <p className="mt-0.5 text-[13px] text-[var(--muted)]">En güncel 6 işlem</p>
//                   </div>
//                   <button type="button" className={`inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-[var(--brand-text)] transition hover:bg-[var(--brand-softer)] ${FOCUS}`}>
//                     Tümünü Gör
//                     <Icon name="chevron" size={13} />
//                   </button>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-[13px]">
//                     <thead>
//                       <tr className="border-y border-[var(--border)] bg-[var(--surface-2)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
//                         <th scope="col" className="whitespace-nowrap px-5 py-2.5">İşlem No</th>
//                         <th scope="col" className="whitespace-nowrap px-5 py-2.5">Müşteri</th>
//                         <th scope="col" className="whitespace-nowrap px-5 py-2.5">Tarih</th>
//                         <th scope="col" className="whitespace-nowrap px-5 py-2.5">Taksit</th>
//                         <th scope="col" className="whitespace-nowrap px-5 py-2.5 text-right">Tutar</th>
//                         <th scope="col" className="whitespace-nowrap px-5 py-2.5">Durum</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {islemler.slice(0, 6).map((t, i) => (
//                         <tr key={t.id} className={`transition-colors hover:bg-[var(--brand-softer)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
//                           <td className="whitespace-nowrap px-5 py-3 font-medium text-[var(--brand-text)]">{t.id}</td>
//                           <td className="whitespace-nowrap px-5 py-3">
//                             <span className="block font-medium text-[var(--fg)]">{t.musteri}</span>
//                             <span className="block text-[11.5px] tabular-nums text-[var(--muted)]">{t.cari}</span>
//                           </td>
//                           <td className="whitespace-nowrap px-5 py-3 tabular-nums text-[var(--muted)]">{t.tarih}</td>
//                           <td className="whitespace-nowrap px-5 py-3 text-[var(--fg-2)]">{t.taksit}</td>
//                           <td className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums text-[var(--fg)]">{t.tutar}</td>
//                           <td className="whitespace-nowrap px-5 py-3">
//                             <span className={`inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${pillTone(t.durum)}`}>{t.durum}</span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
//
//               <div className="flex flex-col gap-4">
//                 <section className={`p-5 ${CARD}`} aria-labelledby="hz-balance-title">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <h2 id="hz-balance-title" className="text-[15px] font-semibold text-[var(--fg)]">
//                         Bakiye ve Borç
//                       </h2>
//                       <p className="mt-0.5 text-[13px] text-[var(--muted)]">{role === ROLES.ANA_FIRMA ? "Firma limiti" : "Üst cari görünümü"}</p>
//                     </div>
//                     <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--brand-text)]">
//                       %{bakiye.kullanim} kullanım
//                     </span>
//                   </div>
//                   <p className="mt-4 text-xs text-[var(--muted)]">Kullanılabilir Bakiye</p>
//                   <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-[var(--brand-text)]">{bakiye.bakiye}</p>
//                   <div
//                     className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--brand-soft)]"
//                     role="progressbar"
//                     aria-valuenow={bakiye.kullanim}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                     aria-label="Limit kullanımı"
//                   >
//                     <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${bakiye.kullanim}%` }} />
//                   </div>
//                   <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-[13px]">
//                     <div>
//                       <dt className="text-xs text-[var(--muted)]">Güncel Borç</dt>
//                       <dd className="mt-0.5 font-semibold tabular-nums text-[var(--danger-text)]">{bakiye.borc}</dd>
//                     </div>
//                     <div>
//                       <dt className="text-xs text-[var(--muted)]">Ödeme Limiti</dt>
//                       <dd className="mt-0.5 font-semibold tabular-nums text-[var(--fg)]">{bakiye.limit}</dd>
//                     </div>
//                   </dl>
//                 </section>
//
//                 <section className={`flex-1 p-2 ${CARD}`} aria-labelledby="hz-quick-title">
//                   <h2 id="hz-quick-title" className="px-3 pb-1 pt-3 text-[15px] font-semibold text-[var(--fg)]">
//                     Hızlı İşlemler
//                   </h2>
//                   <ul>
//                     {QUICK.map((q) => (
//                       <li key={q.label}>
//                         <button
//                           type="button"
//                           className={`group flex min-h-[52px] w-full items-center gap-3 rounded-lg px-3 text-left transition-colors hover:bg-[var(--brand-softer)] ${FOCUS}`}
//                         >
//                           <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-text)]">
//                             <Icon name={q.icon} size={16} />
//                           </span>
//                           <span className="min-w-0 flex-1 leading-tight">
//                             <span className="block text-[13px] font-semibold text-[var(--fg)]">{q.label}</span>
//                             <span className="block truncate text-[11.5px] text-[var(--muted)]">{q.desc}</span>
//                           </span>
//                           <span className="text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--brand-text)]">
//                             <Icon name="chevron" size={13} />
//                           </span>
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 </section>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
//
// function LoginView({ isDark, onToggleTheme, onLogin }) {
//   const inputCls =
//     "h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";
//   return (
//     <div className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
//       {/* küçük kontroller */}
//       <Link href="/designs" aria-label="Tasarımlara dön" title="Tasarımlara dön" className={`${GHOST} absolute left-4 top-4`}>
//         <ArrowLeft />
//       </Link>
//       <button
//         type="button"
//         onClick={onToggleTheme}
//         aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
//         title={isDark ? "Açık mod" : "Koyu mod"}
//         className={`${GHOST} absolute right-4 top-4`}
//       >
//         <SunMoon isDark={isDark} />
//       </button>
//
//       <div className={`grid w-full max-w-5xl overflow-hidden lg:grid-cols-2 ${CARD} !rounded-2xl`}>
//         <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0C34E7] p-10 text-white lg:flex">
//           <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#D4D1FC] opacity-25 blur-3xl" aria-hidden="true" />
//           <div className="relative">
//             <Wordmark onBrand />
//           </div>
//           <div className="relative py-12">
//             <div className="mb-7 flex items-center gap-4">
//               <CompanyLogo name={anaFirma.ad} size={68} tone="light" className="shrink-0 shadow-[0_16px_32px_-14px_rgba(0,0,0,0.5)]" />
//               <div className="leading-tight">
//                 <p className="text-[22px] font-bold tracking-tight">{anaFirma.ad}</p>
//                 <p className="mt-1 text-[13px] text-white/80">{anaFirma.aciklama}</p>
//               </div>
//             </div>
//             <h2 className="text-3xl font-semibold leading-tight tracking-tight">
//               Bayi ağınızı
//               <br />
//               tek panelden yönetin
//             </h2>
//             <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
//               Ana firma, bayi ve alt bayi hiyerarşisi; manuel ve link ile ödeme, iptal / iade onayları ve raporlar tek
//               çatı altında.
//             </p>
//             <dl className="mt-8 flex gap-8">
//               {[
//                 ["3", "Panel Tipi"],
//                 ["7/24", "Ödeme"],
//                 ["5", "Vade Profili"],
//               ].map(([n, l]) => (
//                 <div key={l}>
//                   <dt className="sr-only">{l}</dt>
//                   <dd className="text-2xl font-semibold">{n}</dd>
//                   <dd className="text-xs text-white/70">{l}</dd>
//                 </div>
//               ))}
//             </dl>
//           </div>
//           <p className="relative text-xs text-white/60">© 2026 pay{"'"}n kolay · N Kolay Bayim</p>
//         </div>
//
//         <form
//           className="px-6 py-12 sm:px-12"
//           onSubmit={(e) => {
//             e.preventDefault();
//             onLogin();
//           }}
//         >
//           <div className="lg:hidden">
//             <Wordmark />
//           </div>
//           <h2 className="mt-8 text-2xl font-semibold tracking-tight text-[var(--fg)] lg:mt-0">Giriş Yap</h2>
//           <p className="mt-1 text-sm text-[var(--muted)]">Panel bilgilerinizle oturum açın.</p>
//           <label className="mt-8 block">
//             <span className="mb-1.5 block text-[13px] font-medium text-[var(--fg-2)]">E-posta adresi</span>
//             <input type="email" defaultValue="yonetici@brisa.com" autoComplete="email" className={inputCls} />
//           </label>
//           <label className="mt-5 block">
//             <span className="mb-1.5 block text-[13px] font-medium text-[var(--fg-2)]">Şifre</span>
//             <input type="password" defaultValue="123456" autoComplete="current-password" className={inputCls} />
//           </label>
//           <div className="mt-4 flex items-center justify-between text-[13px]">
//             <label className="flex min-h-[36px] items-center gap-2 text-[var(--fg-2)]">
//               <input type="checkbox" className="h-4 w-4 rounded accent-[#0C34E7]" />
//               Beni hatırla
//             </label>
//             <a href="#" onClick={(e) => e.preventDefault()} className={`rounded font-semibold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
//               Şifremi unuttum
//             </a>
//           </div>
//           <button type="submit" className={`mt-6 h-11 w-full rounded-lg bg-[var(--brand)] text-sm font-semibold text-[var(--brand-fg)] shadow-sm transition hover:opacity-90 ${FOCUS}`}>
//             Giriş Yap
//           </button>
//           <p className="mt-6 text-center text-xs text-[var(--muted)]">Demo mockup — herhangi bir bilgiyle panele geçilir.</p>
//         </form>
//       </div>
//     </div>
//   );
// }
//
// export default function HorizonDesign() {
//   const { role, setRole } = useRole();
//   const [view, setView] = useState("Panel");
//   const [isDark, setIsDark] = useState(false);
//
//   useEffect(() => {
//     try {
//       // ?theme=dark | ?theme=light ve ?view=giris bağlantıyla durumu zorlar (paylaşım / önizleme için)
//       const params = new URLSearchParams(window.location.search);
//       const q = params.get("theme");
//       const s = localStorage.getItem("nkb-theme-horizon");
//       if (q === "dark" || q === "light") setIsDark(q === "dark");
//       else if (s) setIsDark(s === "dark");
//       else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
//       if (params.get("view") === "giris") setView("Giriş");
//     } catch (e) {}
//   }, []);
//   useEffect(() => {
//     try {
//       localStorage.setItem("nkb-theme-horizon", isDark ? "dark" : "light");
//     } catch (e) {}
//   }, [isDark]);
//
//   const toggleTheme = () => setIsDark((v) => !v);
//
//   return (
//     <>
//       <Head>
//         <title>Tasarım 02 · Horizon — N Kolay Bayim</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//       </Head>
//       <div
//         style={{ ...(isDark ? dark : light), fontFamily: "'IBM Plex Sans', sans-serif" }}
//         className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)] transition-colors"
//       >
//         {view === "Panel" ? (
//           <PanelView role={role} setRole={setRole} isDark={isDark} onToggleTheme={toggleTheme} onLogout={() => setView("Giriş")} />
//         ) : (
//           <LoginView isDark={isDark} onToggleTheme={toggleTheme} onLogin={() => setView("Panel")} />
//         )}
//       </div>
//     </>
//   );
// }

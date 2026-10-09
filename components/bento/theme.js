// Bento teması: açık / koyu renk değişkenleri, giriş animasyonları ve ortak sınıf kalıpları.

export const light = {
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

export const dark = {
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
export const MOTION_CSS = `
@keyframes bn-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes bn-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes bn-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes bn-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes bn-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes bn-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bn-slide { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes bn-pop { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: none; } }
.bn-rise { animation: bn-rise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 55ms); }
.bn-grow { transform-origin: bottom; animation: bn-grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 60ms + 180ms); }
.bn-fill { transform-origin: left; animation: bn-fill 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: 0.3s; }
.bn-draw { stroke-dasharray: 1; animation: bn-draw 1.1s ease-out backwards; animation-delay: 0.35s; }
.bn-wipe { animation: bn-wipe 1s cubic-bezier(0.3, 0.7, 0.2, 1) backwards; }
.bn-fade { animation: bn-fade 0.18s ease-out backwards; }
.bn-pop { animation: bn-pop 0.16s ease-out backwards; }
.bn-slide { animation: bn-slide 0.22s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }
@media (prefers-reduced-motion: reduce) {
  .bn-rise, .bn-grow, .bn-fill, .bn-draw, .bn-wipe, .bn-fade, .bn-pop, .bn-slide { animation: none; }
}
`;

export const CARD =
  "rounded-2xl border border-[var(--border)] bg-[var(--surface)] [box-shadow:var(--shadow)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-hover)] motion-reduce:transform-none";

export const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]";

export const GHOST = `grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--brand-text)] ${FOCUS}`;

export const MENU_ITEM = `flex min-h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[12.5px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--brand-text)] ${FOCUS}`;

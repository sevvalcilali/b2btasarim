// Giriş ekranı.

import { useSession } from "@/lib/queries/session";
import CompanyLogo from "@/components/CompanyLogo";
import I from "@/components/DesignIcons";
import { Logo } from "./Shell";
import { inputCls } from "./shared";
import { FOCUS, GHOST } from "./theme";

export function LoginView({ isDark, onToggleTheme, onLogin }) {
  const mainCompany = useSession().data?.anaFirma;
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
              <CompanyLogo name={mainCompany?.unvan || "N Kolay Bayim"} size={64} tone="light" className="shrink-0 shadow-[0_16px_32px_-14px_rgba(0,0,0,0.5)]" />
              <div className="leading-tight">
                <p className="text-[21px] font-extrabold tracking-tight">{mainCompany?.unvan || "N Kolay Bayim"}</p>
                <p className="mt-1 text-[12.5px] text-white/80">{mainCompany?.aciklama || "B2B Bayi Paneli"}</p>
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

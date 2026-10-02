import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Logo from "@/components/Logo";
import Icon from "@/components/Icons";

export default function Login() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <>
      <Head>
        <title>Giriş Yap — N Kolay Bayim</title>
      </Head>
      <div className="flex min-h-screen">
        {/* Left brand panel — mirrors the N Kolay Bayim login artwork */}
        <div className="relative hidden w-1/2 overflow-hidden bg-navy-900 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(43,75,242,0.55),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(79,107,255,0.4),transparent_40%)]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Logo variant="light" />
            <div>
              <span className="inline-block rounded-full bg-brand-blue/20 px-3 py-1 text-xs font-semibold tracking-wide text-brand-sky ring-1 ring-brand-blue/30">
                B2B ÖDEME PANELİ
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white">
                Bayi ağınızı<br />tek panelden yönetin
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                Ana firma, bayi ve alt bayi hiyerarşisi; manuel & link ile ödeme, iptal / iade
                onayları, vade farkı profilleri ve gerçek zamanlı raporlar.
              </p>
              <div className="mt-8 flex gap-8">
                {[
                  ["3", "Panel Tipi"],
                  ["7/24", "Ödeme"],
                  ["5", "Vade Profili"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-2xl font-extrabold text-white">{n}</p>
                    <p className="text-xs text-slate-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">© 2026 pay'n kolay · N Kolay Bayim</p>
          </div>
        </div>

        {/* Right login form */}
        <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo variant="dark" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900">Giriş Yap</h2>
            <p className="mt-1 text-sm text-slate-500">Panel bilgilerinizle oturum açın.</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">E-posta adresi</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="user" size={18} />
                  </span>
                  <input
                    type="email"
                    defaultValue="yonetici@brisa.com"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Şifre</span>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    defaultValue="123456"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-10 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-navy-800"
                  >
                    <Icon name={showPw ? "x" : "search"} size={18} />
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
                  Beni hatırla
                </label>
                <a href="#" className="font-semibold text-brand-blue hover:underline">
                  Şifremi unuttum
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-navy-800 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Giriş Yap
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Demo mockup — herhangi bir bilgiyle giriş yapabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

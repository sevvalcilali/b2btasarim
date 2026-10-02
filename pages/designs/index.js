import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

const DIRECTIONS = [
  {
    slug: "atlas",
    n: "01",
    name: "Atlas",
    tag: "Açılır Kapanır Sol Menü",
    desc: "Temel panel tasarımının geliştirilmiş hali: marka mavisi, açılır kapanır sol menü (akordiyon gruplar), ince üst bar, ölçekli çubuk grafik. Rol değiştirici menüyü ve verileri günceller. Inter.",
    swatches: ["#0C34E7", "#D4D1FC", "#EAE8FD", "#F4F3FE"],
    accent: "#0C34E7",
    previewBg: "#F4F3FE",
    previewBgDark: "#0D0F14",
  },
  {
    slug: "horizon",
    n: "02",
    name: "Horizon",
    tag: "Beyaz Menü · Hero",
    desc: "Açılır kapanır beyaz sol menü, ince üst bar ve panel tipi seçici; marka mavisi hero bandında toplam işlem, alan grafiği ve özet şeridi. Hızlı işlemler kartı. IBM Plex Sans.",
    swatches: ["#0C34E7", "#F4F3FE", "#0EB567", "#FFFFFF"],
    accent: "#0C34E7",
    previewBg: "#F5F5F6",
    previewBgDark: "#0C0D10",
  },
  {
    slug: "bento",
    n: "03",
    name: "Bento",
    tag: "Yüzen Paneller · Hareketli",
    desc: "Lavanta zeminde yüzen yuvarlak paneller ve renkli KPI blokları. Açılır kapanır profesyonel sol menü, ince üst bar, özel ikon seti, giriş animasyonları ve sayarak gelen rakamlar. Plus Jakarta Sans.",
    swatches: ["#0C34E7", "#EAE8FD", "#0EB567", "#F4F3FE"],
    accent: "#0C34E7",
    previewBg: "#F4F3FE",
    previewBgDark: "#0E1017",
  },
  {
    slug: "nova",
    n: "04",
    name: "Nova",
    tag: "Modern · Hareketli",
    desc: "Beyaz zeminde mavi tonlu kartlar; yüzen, daraltılabilir sol açılır menü. Karşılama bandı (kur, onay, fatura), mini grafikli KPI'lar, gün gün okunan alan grafiği, dağılım halkası ve filtreli tablo. Space Grotesk + Inter.",
    swatches: ["#0C34E7", "#EAE8FD", "#F4F3FE", "#FFFFFF"],
    accent: "#0C34E7",
    previewBg: "#EAE8FD",
    previewBgDark: "#14172A",
  },
  {
    slug: "klasik",
    n: "05",
    name: "Klasik",
    tag: "Lacivert · Geliştirilmiş",
    desc: "İlk mockup'ın lacivert kimliği üzerine: daraltılabilir lacivert menü, ince üst bar, renkli KPI rakamları ve mini çubuklar, banka kartı görünümlü bakiye, çalışan onay listesi, kur kartı ve giriş animasyonları. Inter.",
    swatches: ["#0A1568", "#2B4BF2", "#EAEFFF", "#F8FAFC"],
    accent: "#2B4BF2",
    previewBg: "#F8FAFC",
    previewBgDark: "#0B0E1A",
  },
  {
    slug: "kagit",
    n: "06",
    name: "Kağıt",
    tag: "Broadsheet Editoryal",
    desc: "Kutusuz düzen, serif tipografi ve ince çizgiler. Solda açılır kapanır ana menü, üstte kısayol menüsü; büyük hero rakam, gün gün okunan alan grafiği, çalışan onay listesi, duyuru taslağı ve ciro sıralaması. Newsreader + IBM Plex Sans.",
    swatches: ["#1E1E1E", "#0C34E7", "#D8D9DB", "#F7F6F3"],
    accent: "#0C34E7",
    previewBg: "#F7F6F3",
    previewBgDark: "#111214",
  },
];

const light = {
  "--bg": "#F5F5F6",
  "--surface": "#FFFFFF",
  "--fg": "#1E1E1E",
  "--muted": "#6E7A8A",
  "--border": "#EBECED",
  "--brand": "#0C34E7",
};
const dark = {
  "--bg": "#101114",
  "--surface": "#1A1C22",
  "--fg": "#F5F5F6",
  "--muted": "#B0B4B7",
  "--border": "#2A2D36",
  "--brand": "#4C63FF",
};

export default function DesignsIndex() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nkb-theme-index");
      if (saved) setIsDark(saved === "dark");
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("nkb-theme-index", isDark ? "dark" : "light");
    } catch (e) {}
  }, [isDark]);

  return (
    <>
      <Head>
        <title>Tasarım Yönleri — N Kolay Bayim</title>
      </Head>
      <div
        style={isDark ? dark : light}
        className="min-h-screen bg-[var(--bg)] px-6 py-14 text-[var(--fg)] transition-colors"
        // font stack neutral; each direction page uses its own font
      >
        <div className="mx-auto max-w-6xl" style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
          <header className="mb-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                N Kolay Bayim · B2B Panel
              </p>
              <h1 className="mt-2 text-4xl font-extrabold">6 Tasarım Yönü</h1>
              <p className="mt-3 max-w-2xl text-[var(--muted)]">
                Aynı ekranlar (Giriş + Panel), altı farklı görsel dil ile. Her yön kendi içinde açık/koyu
                moda sahiptir. Tüm mockup&apos;lar servis içermez — yalnızca ön yüz.
              </p>
            </div>
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
          </header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {DIRECTIONS.map((d) => (
              <Link
                key={d.slug}
                href={`/designs/${d.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              >
                <div
                  className="relative h-40 overflow-hidden"
                  style={{ background: isDark ? d.previewBgDark : d.previewBg }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-black opacity-90" style={{ color: d.accent }}>
                      {d.n}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
                    {d.swatches.map((c) => (
                      <span
                        key={c}
                        className="h-6 flex-1 rounded-md ring-1 ring-black/10"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{d.name}</h2>
                    <span className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--muted)] ring-1 ring-[var(--border)]">
                      {d.tag}
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{d.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition group-hover:gap-2">
                    Yönü İncele
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <footer className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
            Mevcut (temel) mockup:{" "}
            <Link href="/login" className="font-semibold text-[var(--fg)] hover:underline">
              /login
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--fg)] ring-1 ring-[var(--border)] transition hover:ring-[var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
      aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
      title={isDark ? "Açık mod" : "Koyu mod"}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

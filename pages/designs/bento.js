import { useEffect, useState } from "react";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { useRole } from "@/components/RoleContext";
import { useOturum } from "@/lib/sorgular/oturum";
import { useRouter } from "next/router";
import Head from "next/head";
import CompanyLogo from "@/components/CompanyLogo";
import I from "@/components/DesignIcons";
import { LoginView } from "@/components/bento/Giris";
import { Sidebar, UserMenu } from "@/components/bento/Kabuk";
import { Dashboard } from "@/components/bento/ekranlar/AnaSayfa";
import { BayiListesi, BayiTanimlama } from "@/components/bento/ekranlar/BayiTanim";
import { FaturaYukleme } from "@/components/bento/ekranlar/FaturaYukleme";
import { BayiOzet } from "@/components/bento/ekranlar/BayiOzet";
import { BayiFaturaOzet } from "@/components/bento/ekranlar/BayiFaturaOzet";
import { VadeFarkiProfilTanim } from "@/components/bento/ekranlar/VadeFarkiProfili";
import { KullaniciTanim } from "@/components/bento/ekranlar/KullaniciTanim";
import { KurBilgisi } from "@/components/bento/ekranlar/KurBilgisi";
import { BakiyeBorc } from "@/components/bento/ekranlar/BakiyeBorc";
import { FirmaBilgileri } from "@/components/bento/ekranlar/FirmaBilgileri";
import { DuyuruYonetimi, DuyuruPenceresi } from "@/components/bento/ekranlar/Duyuru";
import { BayiCariSecimi } from "@/components/bento/ekranlar/CariSecimi";
import { IptalIade } from "@/components/bento/ekranlar/IptalIade";
import { IslemDetaylari } from "@/components/bento/ekranlar/IslemDetaylari";
import { LinkOdeme } from "@/components/bento/ekranlar/LinkOdeme";
import { ManuelOdeme } from "@/components/bento/ekranlar/ManuelOdeme";
import { HOME, SAYFALAR, KALICI_PARAMETRELER } from "@/components/bento/sayfalar";
import { useBekleyenler } from "@/lib/sorgular/panel";
import { light, dark, MOTION_CSS, FOCUS, GHOST } from "@/components/bento/tema";

// N Kolay Bayim paneli — seçilen tasarım: Bento (Tasarım 03). Diğer tasarımlar arsiv/ klasöründe.
// Lavanta zemin üzerinde yüzen yuvarlak paneller, renkli KPI blokları.
// Açılır kapanır sol menü, ince yüzen üst bar, giriş animasyonları, açık / koyu mod.

function PanelView({ role, setRole, isDark, onToggleTheme, onLogout }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [duyurularAcik, setDuyurularAcik] = useState(false);
  // rolün demo meta verisi; firma unvanı GET /oturum'dan gelir (ekranlar meta.company ile başlık yazar)
  const oturum = useOturum();
  const meta = { ...ROLE_META[role], company: oturum.data?.firma.unvan || ROLE_META[role].company };
  const anaFirma = oturum.data?.anaFirma;

  // menü rozetleri — GET /panel/bekleyenler (onay / yükleme sonrası ilgili kancalar yeniler)
  const bekleyenler = useBekleyenler();
  const rozetler = {
    "/iptal-iade/onay": bekleyenler.data?.onayBekleyenTalep || 0,
    "/raporlar/fatura-yukleme": bekleyenler.data?.faturasiBekleyenIslem || 0,
  };

  // açık ekran adres çubuğunda (?sayfa=) tutulur: yenileme ve geri tuşu çalışır
  const router = useRouter();
  const slug = typeof router.query.sayfa === "string" ? router.query.sayfa : null;
  const current = SAYFALAR[slug] || HOME;
  // ek: ekrana özel parametreler (ör. { musteri: "320.01.001" }); bir sonraki geçişte temizlenir
  const navigate = (href, ek = {}) => {
    const sayfa = Object.keys(SAYFALAR).find((k) => SAYFALAR[k] === href);
    const query = Object.fromEntries(KALICI_PARAMETRELER.filter((k) => router.query[k] != null).map((k) => [k, router.query[k]]));
    router.push({ pathname: router.pathname, query: { ...query, ...(sayfa ? { sayfa } : {}), ...ek } }, undefined, { shallow: true });
    setMobileOpen(false);
  };
  const parametre = (k) => (typeof router.query[k] === "string" ? router.query[k] : null);

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
        rozetler={rozetler}
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
                <CompanyLogo name={anaFirma?.unvan || "N Kolay Bayim"} size={32} className="shrink-0" />
                <span className="hidden leading-tight sm:block">
                  <span className="block text-[13.5px] font-extrabold text-[var(--fg)]">{anaFirma?.unvan || "…"}</span>
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
              <button
                type="button"
                onClick={() => setDuyurularAcik(true)}
                aria-label={bekleyenler.data?.okunmamisDuyuru ? `Duyurular, ${bekleyenler.data.okunmamisDuyuru} okunmamış` : "Duyurular"}
                title="Duyurular"
                className={`${GHOST} relative hidden sm:grid`}
              >
                <I name="bell" size={16} />
                {bekleyenler.data?.okunmamisDuyuru > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--danger)] opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />
                  </span>
                )}
              </button>
              <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />
            </div>
          </header>
        </div>

        {duyurularAcik && <DuyuruPenceresi role={role} onClose={() => setDuyurularAcik(false)} />}

        {/* key: rol ya da ekran değişince giriş animasyonları yeniden oynar */}
        <main key={`${role}-${current}`} className="mx-auto w-full max-w-[1280px] flex-1 py-4">
          {current === "/raporlar/islem-detaylari" ? (
            <IslemDetaylari role={role} meta={meta} onHome={() => navigate(HOME)} />
          ) : current === "/odeme/manuel" ? (
            <ManuelOdeme key={parametre("musteri")} role={role} meta={meta} onNavigate={navigate} onerilenCari={parametre("musteri")} />
          ) : current === "/odeme/link" ? (
            <LinkOdeme role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/bayi-tanim/tanimlama" && role !== ROLES.ALT_BAYI ? (
            <BayiTanimlama key={parametre("duzenle")} role={role} meta={meta} duzenleCari={parametre("duzenle")} onNavigate={navigate} />
          ) : (current === "/bayi-tanim/liste" || current === "/bayi-tanim/alt-bayi-liste") && role !== ROLES.ALT_BAYI ? (
            <BayiListesi
              role={role}
              meta={meta}
              tumAltBayiler={current === "/bayi-tanim/alt-bayi-liste"}
              vurgu={parametre("kaydedildi")}
              kayitAdi={parametre("ad")}
              onNavigate={navigate}
            />
          ) : current === "/raporlar/bayi-ozet" && role !== ROLES.ALT_BAYI ? (
            <BayiOzet role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/raporlar/bayi-fatura-ozet" && role !== ROLES.ALT_BAYI ? (
            <BayiFaturaOzet role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/duyuru" && role === ROLES.ANA_FIRMA ? (
            <DuyuruYonetimi meta={meta} onNavigate={navigate} />
          ) : current === "/odeme/bayi-cari" && role === ROLES.ALT_BAYI ? (
            <BayiCariSecimi meta={meta} onNavigate={navigate} />
          ) : current === "/odeme/kur" ? (
            <KurBilgisi meta={meta} onNavigate={navigate} />
          ) : (current === "/odeme/ana-firma-bakiye" && role === ROLES.BAYI) || (current === "/odeme/bayi-bakiye" && role === ROLES.ALT_BAYI) ? (
            <BakiyeBorc role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/ayarlar/firma" && role !== ROLES.ANA_FIRMA ? (
            <FirmaBilgileri role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/ayarlar/kullanici" ? (
            <KullaniciTanim meta={meta} onNavigate={navigate} />
          ) : current === "/ayarlar/vade-farki" && role === ROLES.ANA_FIRMA ? (
            <VadeFarkiProfilTanim meta={meta} onNavigate={navigate} />
          ) : current === "/raporlar/fatura-yukleme" ? (
            <FaturaYukleme role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/iptal-iade/onay" || current === "/iptal-iade/takip" ? (
            <IptalIade
              role={role}
              meta={meta}
              mod={current === "/iptal-iade/onay" ? "onay" : "takip"}
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

import { useEffect, useState } from "react";
import { ROLES, ROLE_META, ROLE_ORDER } from "@/lib/roles";
import { useRole } from "@/components/RoleContext";
import { useSession } from "@/lib/queries/session";
import { useRouter } from "next/router";
import Head from "next/head";
import CompanyLogo from "@/components/CompanyLogo";
import I from "@/components/DesignIcons";
import { LoginView } from "@/components/bento/Login";
import { Sidebar, UserMenu } from "@/components/bento/Shell";
import { CommandPalette, PaletteTrigger, usePaletteShortcut } from "@/components/bento/CommandPalette";
import { Dashboard } from "@/components/bento/screens/Dashboard";
import { DealerList, DealerDefinition } from "@/components/bento/screens/DealerDefinition";
import { InvoiceUpload } from "@/components/bento/screens/InvoiceUpload";
import { DealerSummary } from "@/components/bento/screens/DealerSummary";
import { DealerInvoiceSummary } from "@/components/bento/screens/DealerInvoiceSummary";
import { MaturityProfileDefinition } from "@/components/bento/screens/MaturityProfile";
import { UserDefinition } from "@/components/bento/screens/UserDefinition";
import { ExchangeRates } from "@/components/bento/screens/ExchangeRates";
import { BalanceDebt } from "@/components/bento/screens/BalanceDebt";
import { CompanyInfo } from "@/components/bento/screens/CompanyInfo";
import { AnnouncementManagement, AnnouncementModal } from "@/components/bento/screens/Announcements";
import { DealerAccountSelection } from "@/components/bento/screens/AccountSelection";
import { BulkDealerAdd, BulkBalanceUpload } from "@/components/bento/screens/BulkUpload";
import { CancelRefund } from "@/components/bento/screens/CancelRefund";
import { TransactionDetails } from "@/components/bento/screens/TransactionDetails";
import { LinkPayment } from "@/components/bento/screens/LinkPayment";
import { ManualPayment } from "@/components/bento/screens/ManualPayment";
import { HOME, ROUTES, PERSISTENT_PARAMS } from "@/components/bento/routes";
import { usePendingItems } from "@/lib/queries/panel";
import { light, dark, MOTION_CSS, TABLE_CSS, FOCUS, GHOST } from "@/components/bento/theme";

// N Kolay Bayim paneli — seçilen tasarım: Bento (Tasarım 03). Diğer tasarımlar archive/ klasöründe.
// Lavanta zemin üzerinde yüzen yuvarlak paneller, renkli KPI blokları.
// Açılır kapanır sol menü, ince yüzen üst bar, giriş animasyonları, açık / koyu mod.

function PanelView({ role, setRole, isDark, onToggleTheme, onLogout }) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  usePaletteShortcut(setPaletteOpen);
  // rolün demo meta verisi; firma unvanı GET /oturum'dan gelir (ekranlar meta.company ile başlık yazar)
  const session = useSession();
  const meta = { ...ROLE_META[role], company: session.data?.firma.unvan || ROLE_META[role].company };
  const mainCompany = session.data?.anaFirma;

  // menü rozetleri — GET /panel/bekleyenler (onay / yükleme sonrası ilgili kancalar yeniler)
  const pendingItems = usePendingItems();
  const badges = {
    "/iptal-iade/onay": pendingItems.data?.onayBekleyenTalep || 0,
    "/raporlar/fatura-yukleme": pendingItems.data?.faturasiBekleyenIslem || 0,
  };

  // açık ekran adres çubuğunda (?sayfa=) tutulur: yenileme ve geri tuşu çalışır
  const router = useRouter();
  const slug = typeof router.query.sayfa === "string" ? router.query.sayfa : null;
  const current = ROUTES[slug] || HOME;
  // ek: ekrana özel parametreler (ör. { musteri: "320.01.001" }); bir sonraki geçişte temizlenir
  const navigate = (href, ek = {}) => {
    const page = Object.keys(ROUTES).find((k) => ROUTES[k] === href);
    const query = Object.fromEntries(PERSISTENT_PARAMS.filter((k) => router.query[k] != null).map((k) => [k, router.query[k]]));
    router.push({ pathname: router.pathname, query: { ...query, ...(page ? { sayfa: page } : {}), ...ek } }, undefined, { shallow: true });
    setMobileOpen(false);
  };
  const param = (k) => (typeof router.query[k] === "string" ? router.query[k] : null);

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
        badges={badges}
      />

      <div className="flex min-w-0 flex-1 flex-col px-3 lg:px-4">
        {/* yüzen üst bar */}
        <div className="sticky top-0 z-20 bg-[var(--bg)] pt-3">
          <header className="flex h-12 items-center gap-1 rounded-2xl print:hidden border border-[var(--border)] bg-[var(--surface)] px-2 [box-shadow:var(--shadow)] sm:gap-1.5">
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
              className={`ml-1 hidden max-w-[220px] shrink-0 overflow-hidden sm:block transition-[max-width,opacity,margin] duration-300 motion-reduce:transition-none ${
                desktopOpen ? "lg:ml-0 lg:max-w-0 lg:opacity-0" : "lg:ml-1.5 lg:max-w-[220px] lg:opacity-100"
              }`}
              aria-hidden={desktopOpen && isDesktop ? "true" : undefined}
            >
              <div className="flex items-center gap-2.5 whitespace-nowrap">
                <CompanyLogo name={mainCompany?.unvan || "N Kolay Bayim"} size={32} className="shrink-0" />
                <span className="hidden leading-tight sm:block">
                  <span className="block text-[13.5px] font-extrabold text-[var(--fg)]">{mainCompany?.unvan || "…"}</span>
                  <span className="block text-[10.5px] font-medium text-[var(--muted)]">Ana Firma · N Kolay Bayim</span>
                </span>
              </div>
            </div>

            <PaletteTrigger onOpen={() => setPaletteOpen(true)} />

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              {/* rol değiştirici — menü ve veriler role göre değişir */}
              <div role="group" aria-label="Panel tipi" className="mr-0.5 flex h-8 items-center rounded-full bg-[var(--soft)] p-0.5">
                {ROLE_ORDER.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`h-7 whitespace-nowrap rounded-full px-2.5 text-[11.5px] transition-all duration-200 active:scale-95 sm:px-3 ${
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
                onClick={() => setAnnouncementsOpen(true)}
                aria-label={pendingItems.data?.okunmamisDuyuru ? `Duyurular, ${pendingItems.data.okunmamisDuyuru} okunmamış` : "Duyurular"}
                title="Duyurular"
                className={`${GHOST} relative`}
              >
                <I name="bell" size={16} />
                {pendingItems.data?.okunmamisDuyuru > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--danger)] opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />
                  </span>
                )}
              </button>
              <UserMenu meta={meta} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} onCompanyInfo={role !== ROLES.ANA_FIRMA ? () => navigate("/ayarlar/firma") : null} />
            </div>
          </header>
        </div>

        {announcementsOpen && <AnnouncementModal role={role} onClose={() => setAnnouncementsOpen(false)} />}
        {paletteOpen && (
          <CommandPalette
            role={role}
            isDark={isDark}
            onClose={() => setPaletteOpen(false)}
            onNavigate={navigate}
            onRole={setRole}
            onToggleTheme={onToggleTheme}
            onLogout={onLogout}
          />
        )}

        {/* key: rol ya da ekran değişince giriş animasyonları yeniden oynar */}
        <main key={`${role}-${current}`} className="mx-auto w-full max-w-[1280px] flex-1 py-4">
          {/* yalnız yazdırmada; saat istemcide üretilir (sunucu HTML'iyle fark hidrasyon uyarısı vermesin) */}
          <p className="mb-3 hidden text-[11px] text-[var(--muted)] print:block" suppressHydrationWarning>
            {meta.company} · N Kolay Bayim · yazdırma: {new Date().toLocaleString("tr-TR")}
          </p>
          {current === "/raporlar/islem-detaylari" ? (
            <TransactionDetails key={param("ara")} role={role} meta={meta} initialSearch={param("ara")} onHome={() => navigate(HOME)} />
          ) : current === "/odeme/manuel" ? (
            <ManualPayment key={param("musteri")} role={role} meta={meta} onNavigate={navigate} suggestedAccount={param("musteri")} />
          ) : current === "/odeme/link" ? (
            <LinkPayment role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/bayi-tanim/tanimlama" && role !== ROLES.ALT_BAYI ? (
            <DealerDefinition key={param("duzenle")} role={role} meta={meta} editingAccountNo={param("duzenle")} onNavigate={navigate} />
          ) : (current === "/bayi-tanim/liste" || current === "/bayi-tanim/alt-bayi-liste") && role !== ROLES.ALT_BAYI ? (
            <DealerList
              key={param("detay")}
              role={role}
              meta={meta}
              allSubDealers={current === "/bayi-tanim/alt-bayi-liste"}
              accent={param("kaydedildi")}
              recordName={param("ad")}
              initialDetail={param("detay")}
              onNavigate={navigate}
            />
          ) : current === "/bayi-tanim/excel-ekleme" && role !== ROLES.ALT_BAYI ? (
            <BulkDealerAdd role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/bayi-tanim/bakiye-borc-yukleme" && role !== ROLES.ALT_BAYI ? (
            <BulkBalanceUpload role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/raporlar/bayi-ozet" && role !== ROLES.ALT_BAYI ? (
            <DealerSummary role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/raporlar/bayi-fatura-ozet" && role !== ROLES.ALT_BAYI ? (
            <DealerInvoiceSummary role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/duyuru" && role === ROLES.ANA_FIRMA ? (
            <AnnouncementManagement meta={meta} onNavigate={navigate} />
          ) : current === "/odeme/bayi-cari" && role === ROLES.ALT_BAYI ? (
            <DealerAccountSelection meta={meta} onNavigate={navigate} />
          ) : current === "/odeme/kur" ? (
            <ExchangeRates meta={meta} onNavigate={navigate} />
          ) : (current === "/odeme/ana-firma-bakiye" && role === ROLES.BAYI) || (current === "/odeme/bayi-bakiye" && role === ROLES.ALT_BAYI) ? (
            <BalanceDebt role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/ayarlar/firma" && role !== ROLES.ANA_FIRMA ? (
            <CompanyInfo role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/ayarlar/kullanici" ? (
            <UserDefinition meta={meta} onNavigate={navigate} />
          ) : current === "/ayarlar/vade-farki" && role === ROLES.ANA_FIRMA ? (
            <MaturityProfileDefinition meta={meta} onNavigate={navigate} />
          ) : current === "/raporlar/fatura-yukleme" ? (
            <InvoiceUpload role={role} meta={meta} onNavigate={navigate} />
          ) : current === "/iptal-iade/onay" || current === "/iptal-iade/takip" ? (
            <CancelRefund
              role={role}
              meta={meta}
              mode={current === "/iptal-iade/onay" ? "onay" : "takip"}
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
      <style dangerouslySetInnerHTML={{ __html: MOTION_CSS + TABLE_CSS }} />
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

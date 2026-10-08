// Ana Sayfa: KPI blokları, haftalık hacim grafiği (sütun / çizgi, büyütme), bakiye, son işlemler, hızlı işlemler.

import { useEffect, useId, useRef, useState } from "react";
import { ROLES } from "@/lib/roles";
import { kpis, bakiyeOzet } from "@/lib/mockData";
import I from "@/components/DesignIcons";
import { tl, tarihSaat } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useIslemler } from "@/lib/sorgular/islemler";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { Pencere } from "../ortak";
import { isReady } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { parseAmount, smoothPath, curveThrough, Money, TrendArrow } from "../yardimci";

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

// Son İşlemler — veri: GET /islemler?boyut=6 (rol kapsamı sunucuda)
function TransactionsCard({ onSeeAll }) {
  const sorgu = useIslemler({ boyut: 6 });
  const satirlar = sorgu.data?.kayitlar || [];
  return (
    <section style={{ "--i": 7 }} className={`bn-rise overflow-hidden lg:col-span-2 ${CARD} hover:!translate-y-0`} aria-labelledby="bn-tx-title" aria-busy={sorgu.isFetching}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 id="bn-tx-title" className="text-sm font-bold text-[var(--fg)]">
            Son İşlemler
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{sorgu.data ? `En güncel ${satirlar.length} işlem` : "Yükleniyor…"}</p>
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
      {sorgu.isPending ? (
        <Yukleniyor satir={6} baslik={false} />
      ) : sorgu.isError ? (
        <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
      ) : (
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
              {satirlar.map((t, i) => (
                <tr key={t.islemNo} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                  <td className="whitespace-nowrap px-4 py-2.5 font-bold text-[var(--brand-text)]">{t.islemNo}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className="block font-semibold text-[var(--fg)]">{t.musteri.unvan}</span>
                    <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.musteri.cariNo}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-[var(--muted)]">{tarihSaat(t.tarih)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[var(--fg-2)]">{t.taksit === 1 ? "Tek Çekim" : t.taksit}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right font-bold tabular-nums text-[var(--fg)]">{tl(t.tutarKurus)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(t.durum)}`}>{etiket("islemDurumu", t.durum)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {satirlar.length === 0 && <BosDurum baslik="Henüz işlem yok" />}
        </div>
      )}
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

// Ana Sayfa: KPI blokları, haftalık hacim, bakiye, son işlemler.
export function Dashboard({ role, meta, onNavigate }) {
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
        <TransactionsCard onSeeAll={() => onNavigate("/raporlar/islem-detaylari")} />
        <div className="flex flex-col gap-3">
          <QuickCard onNavigate={onNavigate} />
          <DistributionCard stats={stats} />
        </div>
      </div>
    </>
  );
}

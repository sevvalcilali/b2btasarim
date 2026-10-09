// Ödeme sonucu ekranı parçaları: animasyonlu sonuç işareti, sayarak gelen tutar, dekont kartı ve
// dekontu indirme (PNG), paylaşma (Web Share, yoksa panoya kopyalama), yazdırma. Link ile ödemede link paylaşımı.
import { useEffect, useRef, useState } from "react";
import I from "@/components/DesignIcons";
import { tl2 } from "@/lib/format";
import { useCountUp } from "./helpers";
import { FOCUS } from "./theme";

// Onayda etrafa saçılan noktalar: [x, y, renk]
const BURST = [
  [-46, -30, "var(--success)"],
  [44, -34, "var(--brand)"],
  [-54, 10, "var(--warning)"],
  [56, 8, "var(--success)"],
  [-30, 44, "var(--brand)"],
  [32, 46, "var(--warning)"],
  [0, -56, "var(--success)"],
  [-12, 54, "var(--success)"],
];

/** Sonuç işareti: çember çizilir, içine onay (ya da çarpı) işlenir, halka ve noktalar dağılır */
export function ResultMark({ tone = "success", icon }) {
  const ok = tone === "success";
  const color = ok ? "var(--success)" : "var(--danger)";
  return (
    <div className={`relative mx-auto grid h-[76px] w-[76px] place-items-center ${ok ? "" : "bn-shake"}`} aria-hidden="true">
      {ok && <span className="bn-ring absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 3px ${color}` }} />}
      {ok &&
        BURST.map(([x, y, c], i) => (
          <span key={i} className="bn-burst absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full" style={{ background: c, "--x": `${x}px`, "--y": `${y}px`, animationDelay: `${550 + i * 18}ms` }} />
        ))}
      <span className="absolute inset-0 rounded-full" style={{ background: ok ? "var(--success-soft)" : "var(--danger-soft)" }} />
      <svg viewBox="0 0 76 76" className="relative h-full w-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle className="bn-mark-circle" pathLength="1" cx="38" cy="38" r="34" stroke={color} strokeWidth="3" transform="rotate(-90 38 38)" />
        {icon ? null : ok ? (
          <path className="bn-mark-check" pathLength="1" d="M25 39.5l9 9 17-19" stroke={color} strokeWidth="4.5" />
        ) : (
          <path className="bn-mark-check" pathLength="1" d="M28 28l20 20M48 28 28 48" stroke={color} strokeWidth="4.5" />
        )}
      </svg>
      {icon && (
        <span className="absolute inset-0 grid place-items-center" style={{ color }}>
          <I name={icon} size={28} strokeWidth={2.2} />
        </span>
      )}
    </div>
  );
}

/** Kuruş tutarını kuruş hassasiyetinde sayarak gösterir */
export function CountingAmount({ cents, className = "" }) {
  const v = useCountUp(cents || 0, 1100);
  return (
    <p className={className} aria-label={tl2(cents)}>
      <span aria-hidden="true">{tl2(v)}</span>
    </p>
  );
}

/** Dekont kartı: üstte ve altta tırtıklı kenar, satırlar [etiket, değer] */
export function ReceiptCard({ rows, footer }) {
  const edge = "radial-gradient(circle at 8px 0, transparent 6px, var(--soft) 6.5px) 0 0 / 16px 10px repeat-x";
  return (
    <div className="relative mt-5 text-left">
      <div className="h-2.5 w-full" style={{ background: edge, transform: "scaleY(-1)" }} aria-hidden="true" />
      <div className="bg-[var(--soft)] px-4 py-1">
        <dl className="divide-y divide-dashed divide-[var(--border-strong)] text-[12.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
              <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
            </div>
          ))}
        </dl>
        {footer}
      </div>
      <div className="h-2.5 w-full" style={{ background: edge }} aria-hidden="true" />
    </div>
  );
}

// ---- dekont görseli (PNG) -----------------------------------------------------------------------------------------

async function receiptBlob({ title, company, amount, rows, ok, stamp }) {
  try {
    await document.fonts?.ready;
  } catch (e) {}
  const W = 720;
  const pad = 48;
  const rowH = 46;
  const H = 360 + rows.length * rowH + 64;
  const dpr = 2;
  const c = document.createElement("canvas");
  c.width = W * dpr;
  c.height = H * dpr;
  const g = c.getContext("2d");
  g.scale(dpr, dpr);
  const font = (w, s) => `${w} ${s}px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif`;
  const brand = ok ? "#0C34E7" : "#DC204D";

  g.fillStyle = "#F4F3FE";
  g.fillRect(0, 0, W, H);
  // kart
  g.fillStyle = "#FFFFFF";
  g.beginPath();
  g.roundRect(24, 24, W - 48, H - 48, 28);
  g.fill();
  // üst şerit
  g.save();
  g.beginPath();
  g.roundRect(24, 24, W - 48, 112, [28, 28, 0, 0]);
  g.clip();
  const grad = g.createLinearGradient(24, 24, W - 24, 136);
  grad.addColorStop(0, brand);
  grad.addColorStop(1, ok ? "#3D5AFF" : "#F2617E");
  g.fillStyle = grad;
  g.fillRect(24, 24, W - 48, 112);
  g.restore();
  g.fillStyle = "#FFFFFF";
  g.font = font(800, 24);
  g.fillText(company, pad, 74);
  g.font = font(600, 14);
  g.globalAlpha = 0.85;
  g.fillText("N Kolay Bayim · Ödeme Dekontu", pad, 102);
  g.globalAlpha = 1;
  // sonuç
  g.fillStyle = ok ? "#E1F5EA" : "#FBE4E9";
  g.beginPath();
  g.arc(W / 2, 196, 30, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = ok ? "#0EB567" : "#DC204D";
  g.lineWidth = 5;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  if (ok) {
    g.moveTo(W / 2 - 12, 197);
    g.lineTo(W / 2 - 3, 206);
    g.lineTo(W / 2 + 13, 188);
  } else {
    g.moveTo(W / 2 - 10, 186);
    g.lineTo(W / 2 + 10, 206);
    g.moveTo(W / 2 + 10, 186);
    g.lineTo(W / 2 - 10, 206);
  }
  g.stroke();
  g.textAlign = "center";
  g.fillStyle = "#1E1E1E";
  g.font = font(800, 22);
  g.fillText(title, W / 2, 262);
  if (amount) {
    g.font = font(800, 40);
    g.fillText(amount, W / 2, 312);
  }
  g.textAlign = "left";
  // satırlar
  let y = 360;
  for (const [k, v] of rows) {
    g.strokeStyle = "#D4D1FC";
    g.lineWidth = 1;
    g.setLineDash([5, 5]);
    g.beginPath();
    g.moveTo(pad, y - 30);
    g.lineTo(W - pad, y - 30);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#6E7A8A";
    g.font = font(500, 15);
    g.fillText(k, pad, y);
    g.fillStyle = "#1E1E1E";
    g.font = font(700, 15);
    g.textAlign = "right";
    let text = String(v);
    while (g.measureText(text).width > W - pad * 2 - 180 && text.length > 4) text = `${text.slice(0, -2)}…`;
    g.fillText(text, W - pad, y);
    g.textAlign = "left";
    y += rowH;
  }
  g.fillStyle = "#6E7A8A";
  g.font = font(500, 12.5);
  g.textAlign = "center";
  g.fillText(`Oluşturma: ${stamp} · Bu belge bilgilendirme amaçlıdır.`, W / 2, H - 46);
  return new Promise((res) => c.toBlob(res, "image/png"));
}

const receiptText = ({ title, company, amount, rows }) => [`${company} · ${title}`, amount, ...rows.map(([k, v]) => `${k}: ${v}`)].filter(Boolean).join("\n");

/**
 * Dekont düğmeleri: indir, paylaş, yazdır. receipt: { fileName, title, company, amount, rows, ok }
 * Paylaş: dosya paylaşımı destekleniyorsa PNG ile, değilse metinle; o da yoksa metni panoya kopyalar.
 */
export function ReceiptActions({ receipt }) {
  const [status, setStatus] = useState(null); // null | "kopyalandi" | "hata"
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (s) => {
    setStatus(s);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), 1800);
  };
  const stamp = () => new Date().toLocaleString("tr-TR");

  const download = async () => {
    const blob = await receiptBlob({ ...receipt, stamp: stamp() });
    if (!blob) return flash("hata");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.fileName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const share = async () => {
    const text = receiptText(receipt);
    try {
      if (navigator.share) {
        const blob = await receiptBlob({ ...receipt, stamp: stamp() });
        const file = blob && new File([blob], `${receipt.fileName}.png`, { type: "image/png" });
        if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ title: receipt.title, text, files: [file] });
        else await navigator.share({ title: receipt.title, text });
        return;
      }
    } catch (e) {
      if (e?.name === "AbortError") return; // kullanıcı paylaşım penceresini kapattı
    }
    try {
      await navigator.clipboard.writeText(text);
      flash("kopyalandi");
    } catch (e) {
      flash("hata");
    }
  };

  const btn = `inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`;
  return (
    <div className="mt-4 flex gap-2">
      <button type="button" onClick={download} className={btn}>
        <I name="download" size={14} />
        Dekontu indir
      </button>
      <button type="button" onClick={share} className={btn} aria-live="polite">
        <I name={status === "kopyalandi" ? "check" : "share"} size={14} />
        {status === "kopyalandi" ? "Kopyalandı" : status === "hata" ? "Paylaşılamadı" : "Paylaş"}
      </button>
      <button type="button" onClick={() => window.print()} className={`${btn} hidden sm:inline-flex`}>
        <I name="printer" size={14} />
        Yazdır
      </button>
    </div>
  );
}

/** Ödeme linki paylaşımı: cihazın paylaşım menüsü (varsa), WhatsApp, e-posta */
export function LinkShareActions({ url, customer, amount }) {
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);
  const text = `Merhaba ${customer}, ${amount} tutarındaki ödemenizi bu bağlantıdan yapabilirsiniz: ${url}`;
  const btn = `inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`;
  return (
    <div className="mt-3 flex gap-2">
      {canShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title: "Ödeme linki", text, url }).catch(() => {})}
          className={`inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--brand)] px-3 text-[12.5px] font-bold text-white transition active:scale-[0.97] hover:brightness-110 ${FOCUS}`}
        >
          <I name="share" size={14} />
          Paylaş
        </button>
      )}
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={btn}>
        <I name="message" size={14} />
        WhatsApp
      </a>
      <a href={`mailto:?subject=${encodeURIComponent("Ödeme linkiniz")}&body=${encodeURIComponent(text)}`} className={btn}>
        <I name="mail" size={14} />
        E-posta
      </a>
    </div>
  );
}

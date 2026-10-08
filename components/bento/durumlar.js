// Veri durumları: yükleniyor (iskelet), hata (yeniden dene), boş liste. Her ekran aynı üçünü kullanır.
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { CARD, FOCUS } from "./tema";

const bar = (w, h = "h-3") => `${h} ${w} animate-pulse rounded-md bg-[var(--soft-2)] motion-reduce:animate-none`;

/** Tablo iskeleti: başlık + n satır */
export function Yukleniyor({ satir = 5, baslik = true, className = "" }) {
  return (
    <div className={`p-4 ${className}`} role="status" aria-live="polite" aria-label="Yükleniyor">
      {baslik && <div className={`${bar("w-40", "h-4")} mb-4`} />}
      <div className="space-y-3">
        {Array.from({ length: satir }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={bar("w-24")} />
            <div className={bar("flex-1")} />
            <div className={bar("w-16")} />
            <div className={bar("w-20")} />
          </div>
        ))}
      </div>
      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}

/** Kart içi iskelet: KPI, özet kutuları */
export function YukleniyorKutu({ className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`} role="status" aria-label="Yükleniyor">
      <div className={bar("w-24")} />
      <div className={bar("w-32", "h-6")} />
    </div>
  );
}

/** Hata kutusu: sunucudan gelen mesaj + yeniden dene */
export function HataKutusu({ hata, onTekrar, className = "" }) {
  const yetki = hata instanceof ApiHatasi && hata.yetkiYok;
  return (
    <div role="alert" className={`flex flex-col items-center gap-2 px-4 py-10 text-center ${className}`}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger-text)]">
        <I name={yetki ? "lock" : "info"} size={18} />
      </span>
      <p className="text-[13px] font-bold text-[var(--fg)]">{yetki ? "Bu veriye erişiminiz yok" : "Veri alınamadı"}</p>
      <p className="max-w-sm text-[12px] text-[var(--muted)]">{hata?.message || "Beklenmeyen bir hata oluştu."}</p>
      {onTekrar && !yetki && (
        <button type="button" onClick={onTekrar} className={`mt-1 inline-flex h-8 items-center gap-1 rounded-full bg-[var(--soft)] px-3 text-[12px] font-bold text-[var(--brand-text)] hover:bg-[var(--soft-2)] ${FOCUS}`}>
          Yeniden dene
        </button>
      )}
    </div>
  );
}

/** Boş liste */
export function BosDurum({ baslik, aciklama, ikon = "search", tonu = "soft", children, className = "" }) {
  const renk = tonu === "success" ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--soft)] text-[var(--muted)]";
  return (
    <div className={`flex flex-col items-center gap-2 px-4 py-12 text-center ${className}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-full ${renk}`}>
        <I name={ikon} size={16} />
      </span>
      <p className="text-[13px] font-bold text-[var(--fg)]">{baslik}</p>
      {aciklama && <p className="max-w-sm text-[12px] text-[var(--muted)]">{aciklama}</p>}
      {children}
    </div>
  );
}

/** Kartın tamamını kaplayan durum: yükleniyor → hata → içerik */
export function VeriDurumu({ sorgu, satir = 5, children }) {
  if (sorgu.isPending) return <Yukleniyor satir={satir} />;
  if (sorgu.isError) return <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />;
  return children(sorgu.data);
}

export { CARD };

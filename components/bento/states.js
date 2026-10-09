// Veri durumları: yükleniyor (iskelet), hata (yeniden dene), boş liste. Her ekran aynı üçünü kullanır.
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/error";
import { CARD, FOCUS } from "./theme";

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

/**
 * Boş liste. eylemler: [{ etiket, onClick, ikon?, birincil? }] — ilk kullanımda yol gösterir ("Yeni Bayi", "Excel ile yükle"),
 * filtre sonucunda çıkış verir ("Filtreleri temizle"). null/false öğeler atlanır.
 */
export function BosDurum({ baslik, aciklama, ikon = "search", tonu = "soft", eylemler, children, className = "" }) {
  const renk = tonu === "success" ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--soft)] text-[var(--muted)]";
  const dugmeler = (eylemler || []).filter(Boolean);
  return (
    <div className={`flex flex-col items-center gap-2 px-4 py-12 text-center ${className}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-full ${renk}`}>
        <I name={ikon} size={16} />
      </span>
      <p className="text-[13px] font-bold text-[var(--fg)]">{baslik}</p>
      {aciklama && <p className="max-w-sm text-[12px] text-[var(--muted)]">{aciklama}</p>}
      {dugmeler.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {dugmeler.map((e) => (
            <button
              key={e.etiket}
              type="button"
              onClick={e.onClick}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-bold transition ${
                e.birincil ? "bg-[var(--brand)] text-white hover:brightness-110" : "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--fg-2)] hover:border-[var(--brand)] hover:text-[var(--brand-text)]"
              } ${FOCUS}`}
            >
              {e.ikon && <I name={e.ikon} size={14} />}
              {e.etiket}
            </button>
          ))}
        </div>
      )}
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

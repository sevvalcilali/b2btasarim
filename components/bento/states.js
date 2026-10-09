// Veri durumları: yükleniyor (iskelet), hata (yeniden dene), boş liste. Her ekran aynı üçünü kullanır.
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { CARD, FOCUS } from "./theme";

const bar = (w, h = "h-3") => `${h} ${w} animate-pulse rounded-md bg-[var(--soft-2)] motion-reduce:animate-none`;

/** Tablo iskeleti: başlık + n satır */
export function Loading({ row = 5, title = true, className = "" }) {
  return (
    <div className={`p-4 ${className}`} role="status" aria-live="polite" aria-label="Yükleniyor">
      {title && <div className={`${bar("w-40", "h-4")} mb-4`} />}
      <div className="space-y-3">
        {Array.from({ length: row }, (_, i) => (
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
export function LoadingBox({ className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`} role="status" aria-label="Yükleniyor">
      <div className={bar("w-24")} />
      <div className={bar("w-32", "h-6")} />
    </div>
  );
}

/** Hata kutusu: sunucudan gelen mesaj + yeniden dene */
export function ErrorBox({ error, onRetry, className = "" }) {
  const permission = error instanceof ApiError && error.noPermission;
  return (
    <div role="alert" className={`flex flex-col items-center gap-2 px-4 py-10 text-center ${className}`}>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger-text)]">
        <I name={permission ? "lock" : "info"} size={18} />
      </span>
      <p className="text-[13px] font-bold text-[var(--fg)]">{permission ? "Bu veriye erişiminiz yok" : "Veri alınamadı"}</p>
      <p className="max-w-sm text-[12px] text-[var(--muted)]">{error?.message || "Beklenmeyen bir hata oluştu."}</p>
      {onRetry && !permission && (
        <button type="button" onClick={onRetry} className={`mt-1 inline-flex h-8 items-center gap-1 rounded-full bg-[var(--soft)] px-3 text-[12px] font-bold text-[var(--brand-text)] hover:bg-[var(--soft-2)] ${FOCUS}`}>
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
export function EmptyState({ title, description, icon = "search", tone = "soft", actions, children, className = "" }) {
  const color = tone === "success" ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--soft)] text-[var(--muted)]";
  const buttons = (actions || []).filter(Boolean);
  return (
    <div className={`flex flex-col items-center gap-2 px-4 py-12 text-center ${className}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-full ${color}`}>
        <I name={icon} size={16} />
      </span>
      <p className="text-[13px] font-bold text-[var(--fg)]">{title}</p>
      {description && <p className="max-w-sm text-[12px] text-[var(--muted)]">{description}</p>}
      {buttons.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {buttons.map((e) => (
            <button
              key={e.etiket}
              type="button"
              onClick={e.onClick}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-bold transition ${
                e.primary ? "bg-[var(--brand)] text-white hover:brightness-110" : "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--fg-2)] hover:border-[var(--brand)] hover:text-[var(--brand-text)]"
              } ${FOCUS}`}
            >
              {e.icon && <I name={e.icon} size={14} />}
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
export function DataState({ query, row = 5, children }) {
  if (query.isPending) return <Loading row={row} />;
  if (query.isError) return <ErrorBox error={query.error} onRetry={() => query.refetch()} />;
  return children(query.data);
}

export { CARD };

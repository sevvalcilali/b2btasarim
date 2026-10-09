// Raporlar › Bayi Fatura Özet / Alt Bayi Fatura Özet — şartname s.2 ve s.9: firma başına fatura gereken, yüklenen,
// bekleyen ve reddedilen işlem sayısı ile bekleyen tutar. Veri: GET /raporlar/bayi-fatura-ozet
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { formatNumber, tl, formatPercent } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useDealerInvoiceSummary } from "@/lib/queries/reports";
import { EmptyState, ErrorBox, Loading } from "../states";
import { rangeQuery, periodRange } from "@/lib/period";
import { Breadcrumb, DateRange, ChangeBadge, PrintButton } from "../shared";
import { HOME } from "../routes";
import { SortableHeader, useSorting } from "../table";
import { CARD, FOCUS } from "../theme";

const INVOICE_COLUMNS = {
  firma: (s) => s.firma.unvan,
  gereken: (s) => s.gereken,
  yuklenen: (s) => s.yuklenen,
  bekleyen: (s) => s.bekleyen,
  reddedilen: (s) => s.reddedilen,
  bekleyenKurus: (s) => s.bekleyenKurus,
  tamamlanma: (s) => (s.gereken ? s.yuklenen / s.gereken : null),
  durum: (s) => s.durum,
};

export function DealerInvoiceSummary({ role, meta, onNavigate }) {
  const isSub = role === ROLES.BAYI;
  const title = isSub ? "Alt Bayi Fatura Özet" : "Bayi Fatura Özet";
  const [range, setRange] = useState(() => periodRange("30g"));
  const query = useDealerInvoiceSummary(rangeQuery(range));
  const data = query.data;
  const rows = data?.kayitlar || [];
  const total = data?.toplam;
  const { sorted, sorting, sort } = useSorting(rows, INVOICE_COLUMNS);
  /** Fatura gereken işlem yoksa oran yok (null): çubuk boş, yüzde "—" */
  const completion = (s) => (s.gereken ? (s.yuklenen / s.gereken) * 100 : null);
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={() => onNavigate(HOME)} path={["Raporlar", title]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{title}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {isSub ? "Sizin ve alt bayilerinizin fatura yükleme durumu" : "Bayi ve alt bayi bazında fatura yükleme durumu"}
          </p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
        <button
          type="button"
          onClick={() => onNavigate("/raporlar/fatura-yukleme")}
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] md:self-auto ${FOCUS}`}
        >
          <I name="receipt" size={14} />
          Fatura Yükleme Detay
        </button>
        <PrintButton />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Fatura gereken işlem", value: total ? formatNumber(total.gereken) : "—", change: [total?.gereken, data?.onceki?.gereken], wrap: "bg-[var(--brand-soft)]", ink: "text-[var(--brand-text)]" },
          { label: "Yüklenen", value: total ? formatNumber(total.yuklenen) : "—", change: [total?.yuklenen, data?.onceki?.yuklenen], wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]" },
          { label: "Bekleyen / reddedilen", value: total ? `${formatNumber(total.bekleyen)} / ${formatNumber(total.reddedilen)}` : "—", wrap: "bg-[var(--warning-soft)]", ink: "text-[var(--warning-text)]" },
          { label: "Bekleyen tutar", value: total ? tl(total.bekleyenKurus) : "—", change: [total?.bekleyenKurus, data?.onceki?.bekleyenKurus], reverse: true, wrap: "border border-[var(--border)] bg-[var(--surface)]", ink: "text-[var(--brand-text)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`flex items-center justify-between gap-1 text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>
              {k.label}
              {k.change && <ChangeBadge current={k.change[0]} previous={k.change[1]} reverse={k.reverse} />}
            </p>
            <p className={`mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px] ${query.isFetching ? "opacity-60" : ""}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 4 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label={title} aria-busy={query.isFetching}>
        <div className="p-3 sm:p-4">
          <DateRange value={range} onChange={setRange} />
        </div>

        {query.isPending ? (
          <Loading row={5} title={false} />
        ) : query.isError ? (
          <ErrorBox error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <div className={`relative overflow-x-auto transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <SortableHeader field="firma" sorting={sorting} onSort={sort} className={th}>Firma</SortableHeader>
                  <SortableHeader field="gereken" sorting={sorting} onSort={sort} className={`${th} text-right`}>Gereken</SortableHeader>
                  <SortableHeader field="yuklenen" sorting={sorting} onSort={sort} className={`${th} text-right`}>Yüklenen</SortableHeader>
                  <SortableHeader field="bekleyen" sorting={sorting} onSort={sort} className={`${th} text-right`}>Bekleyen</SortableHeader>
                  <SortableHeader field="reddedilen" sorting={sorting} onSort={sort} className={`${th} text-right`}>Reddedilen</SortableHeader>
                  <SortableHeader field="bekleyenKurus" sorting={sorting} onSort={sort} className={`${th} text-right`}>Bekleyen Tutar</SortableHeader>
                  <SortableHeader field="tamamlanma" sorting={sorting} onSort={sort} className={`${th} min-w-[180px]`}>Tamamlanma</SortableHeader>
                  <SortableHeader field="durum" sorting={sorting} onSort={sort} className={th}>Durum</SortableHeader>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s, i) => {
                  const rate = completion(s);
                  const open = s.bekleyen + s.reddedilen > 0;
                  return (
                    <tr key={s.firma.firmaId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{s.firma.unvan}</span>
                        <span className="block text-[11px] text-[var(--muted)]">
                          {labelOf("companyKind", s.firma.tur)}
                          {s.bagli && s.bagli.tur !== "ANA_FIRMA" ? ` · ${s.bagli.unvan}` : ""}
                        </span>
                      </td>
                      <td className={`${td} text-right tabular-nums text-[var(--fg-2)]`}>{formatNumber(s.gereken)}</td>
                      <td className={`${td} text-right tabular-nums text-[var(--success-text)]`}>{formatNumber(s.yuklenen)}</td>
                      <td className={`${td} text-right tabular-nums ${s.bekleyen ? "font-bold text-[var(--warning-text)]" : "text-[var(--muted)]"}`}>{formatNumber(s.bekleyen)}</td>
                      <td className={`${td} text-right tabular-nums ${s.reddedilen ? "font-bold text-[var(--danger-text)]" : "text-[var(--muted)]"}`}>{formatNumber(s.reddedilen)}</td>
                      <td className={`${td} text-right font-bold tabular-nums ${open ? "text-[var(--fg)]" : "text-[var(--muted)]"}`}>{open ? tl(s.bekleyenKurus) : "—"}</td>
                      <td className={td}>
                        <span className="flex items-center gap-2">
                          <span className="block h-1.5 w-28 overflow-hidden rounded-full bg-[var(--soft-2)]" role="progressbar" aria-valuenow={Math.round(rate ?? 0)} aria-valuemin={0} aria-valuemax={100} aria-label="Fatura tamamlanma oranı">
                            <span className={`bn-fill block h-full rounded-full ${rate === 100 ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} style={{ width: `${rate ?? 0}%` }} />
                          </span>
                          <span className="text-[11px] font-semibold tabular-nums text-[var(--fg-2)]">{rate === null ? "—" : formatPercent(rate, 0)}</span>
                        </span>
                      </td>
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(s.durum)}`}>{labelOf("recordStatus", s.durum)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {total && rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--soft)] font-bold">
                    <td className={`${td} text-[var(--fg)]`}>Toplam · {formatNumber(total.firmaAdet)} firma</td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg)]`}>{formatNumber(total.gereken)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--success-text)]`}>{formatNumber(total.yuklenen)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--warning-text)]`}>{formatNumber(total.bekleyen)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--danger-text)]`}>{formatNumber(total.reddedilen)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg)]`}>{tl(total.bekleyenKurus)}</td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{total.gereken ? formatPercent(completion(total), 0) : "—"}</td>
                    <td className={td} />
                  </tr>
                </tfoot>
              )}
            </table>
            {rows.length === 0 && <EmptyState title="Bu dönemde fatura gereken işlem yok" icon="check" tone="success" actions={[range.kod !== "90g" && { etiket: "Son 90 günü göster", onClick: () => setRange(periodRange("90g")) }]} />}
          </div>
        )}
      </section>
    </>
  );
}

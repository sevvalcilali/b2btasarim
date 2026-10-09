// Raporlar › Bayi Özet / Alt Bayi Özet — şartname s.7: müşteri türü filtresi; işlem adedi, tutar, vade farkı, hesaba
// geçecek tutar; ana firma tüm bayi / alt bayileri, bayi kendisini ve alt bayilerini görür. Veri: GET /raporlar/bayi-ozet
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { formatNumber, tl, tlShort, formatPercent } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useDealerSummary } from "@/lib/queries/reports";
import { EmptyState, ErrorBox, Loading } from "../states";
import { downloadCsv, csvAmount } from "@/lib/export";
import { rangeQuery, periodRange } from "@/lib/period";
import { Breadcrumb, DateRange, ChangeBadge, PrintButton } from "../shared";
import { HOME } from "../routes";
import { SortableHeader, useSorting } from "../table";
import { CARD, FOCUS } from "../theme";


// sütun → sıralama değeri (rapor ekranda sıralanır; tüm satırlar yüklü)
const SUMMARY_COLUMNS = {
  firma: (s) => s.firma.unvan,
  islemAdet: (s) => s.islemAdet,
  ciroKurus: (s) => s.ciroKurus,
  vadeFarkiKurus: (s) => s.vadeFarkiKurus,
  iptalIadeKurus: (s) => s.iptalIadeKurus,
  hesabaGececekKurus: (s) => s.hesabaGececekKurus,
  durum: (s) => s.durum,
};

export function DealerSummary({ role, meta, onNavigate }) {
  const isSub = role === ROLES.BAYI;
  const title = isSub ? "Alt Bayi Özet" : "Bayi Özet";
  const [range, setRange] = useState(() => periodRange("30g"));
  const [customerKind, setCustomerKind] = useState("");
  const query = useDealerSummary({ ...rangeQuery(range), musteriTuru: customerKind || undefined });
  const data = query.data;
  const rows = data?.kayitlar || [];
  const total = data?.toplam;
  const highest = Math.max(1, ...rows.map((s) => s.ciroKurus));
  const { sorted, sorting, sort } = useSorting(rows, SUMMARY_COLUMNS);
  const [search, setSearch] = useState("");
  const q = search.trim().toLocaleLowerCase("tr-TR");
  const visible = q ? sorted.filter((s) => s.firma.unvan.toLocaleLowerCase("tr-TR").includes(q)) : sorted; // ekranda süzme, toplamlar sunucudan
  const successRate = (s) => (s.islemAdet ? (s.basariliAdet / s.islemAdet) * 100 : 0);
  const selectionCls = (active) =>
    `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${active ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={() => onNavigate(HOME)} path={["Raporlar", title]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{title}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {isSub ? "Sizin ve alt bayilerinizin ciro özeti" : "Bayi ve alt bayi bazında ciro özeti"}
          </p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              isSub ? "alt-bayi-ozet" : "bayi-ozet",
              ["Firma", "Tür", "Bağlı Firma", "Vade Profili", "İşlem", "Başarılı", "Başarısız", "Ciro (TL)", "Vade Farkı (TL)", "İptal / İade (TL)", "Hesaba Geçecek (TL)", "Durum"],
              rows.map((s) => [s.firma.unvan, labelOf("companyKind", s.firma.tur), s.bagli?.unvan, s.vadeProfil, s.islemAdet, s.basariliAdet, s.basarisizAdet, csvAmount(s.ciroKurus), csvAmount(s.vadeFarkiKurus), csvAmount(s.iptalIadeKurus), csvAmount(s.hesabaGececekKurus), labelOf("recordStatus", s.durum)])
            )
          }
          disabled={rows.length === 0}
          title="Raporu CSV olarak indirir"
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-50 md:self-auto ${FOCUS}`}
        >
          <I name="download" size={14} />
          Dışa Aktar
        </button>
        <PrintButton />
        </div>
      </div>

      {/* dönem toplamları — sunucudan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "İşlem", value: total ? `${formatNumber(total.islemAdet)} · ${formatNumber(total.basariliAdet)} başarılı` : "—", change: [total?.islemAdet, data?.onceki?.islemAdet], wrap: "bg-[var(--brand-soft)]", ink: "text-[var(--brand-text)]" },
          { label: "Ciro (başarılı)", value: total ? tl(total.ciroKurus) : "—", change: [total?.ciroKurus, data?.onceki?.ciroKurus], wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]" },
          { label: "Vade farkı", value: total ? tl(total.vadeFarkiKurus) : "—", change: [total?.vadeFarkiKurus, data?.onceki?.vadeFarkiKurus], wrap: "border border-[var(--border)] bg-[var(--surface)]", ink: "text-[var(--brand-text)]" },
          { label: "Hesaba geçecek", value: total ? tl(total.hesabaGececekKurus) : "—", change: [total?.hesabaGececekKurus, data?.onceki?.hesabaGececekKurus], wrap: "bg-[linear-gradient(135deg,#0C34E7,#0A23A8)] text-white", ink: "text-white/80", accent: true },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`flex items-center justify-between gap-1 text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>
              {k.label}
              {k.change && <ChangeBadge current={k.change[0]} previous={k.change[1]} dark={k.accent} />}
            </p>
            <p className={`mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums sm:text-[19px] ${k.accent ? "text-white" : "text-[var(--fg)]"} ${query.isFetching ? "opacity-60" : ""}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 4 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label={title} aria-busy={query.isFetching}>
        <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <DateRange value={range} onChange={setRange} />
          <div role="group" aria-label="Müşteri türü" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            <button type="button" onClick={() => setCustomerKind("")} aria-pressed={customerKind === ""} className={selectionCls(customerKind === "")}>
              Tüm müşteri türleri
            </button>
            {(data?.musteriTurleri || []).map((m) => (
              <button key={m} type="button" onClick={() => setCustomerKind(m)} aria-pressed={customerKind === m} className={selectionCls(customerKind === m)}>
                {labelOf("customerKind", m)}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-56">
            <span className="sr-only">Firma ara</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <I name="search" size={14} />
            </span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Firma ara" className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]" />
          </label>
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
                  <SortableHeader field="islemAdet" sorting={sorting} onSort={sort} className={th}>İşlem</SortableHeader>
                  <SortableHeader field="ciroKurus" sorting={sorting} onSort={sort} className={`${th} min-w-[200px]`}>Ciro (başarılı)</SortableHeader>
                  <SortableHeader field="vadeFarkiKurus" sorting={sorting} onSort={sort} className={`${th} text-right`}>Vade Farkı</SortableHeader>
                  <SortableHeader field="iptalIadeKurus" sorting={sorting} onSort={sort} className={`${th} text-right`}>İptal / İade</SortableHeader>
                  <SortableHeader field="hesabaGececekKurus" sorting={sorting} onSort={sort} className={`${th} text-right`}>Hesaba Geçecek</SortableHeader>
                  <SortableHeader field="durum" sorting={sorting} onSort={sort} className={th}>Durum</SortableHeader>
                </tr>
              </thead>
              <tbody>
                {visible.map((s, i) => (
                  <tr key={s.firma.firmaId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{s.firma.unvan}</span>
                      <span className="block text-[11px] text-[var(--muted)]">
                        {labelOf("companyKind", s.firma.tur)}
                        {s.bagli && s.bagli.tur !== "ANA_FIRMA" ? ` · ${s.bagli.unvan}` : ""}
                        {s.vadeProfil ? ` · ${s.vadeProfil}` : ""}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="block font-semibold tabular-nums text-[var(--fg)]">{formatNumber(s.islemAdet)}</span>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                        {formatNumber(s.basariliAdet)} başarılı · {formatPercent(successRate(s), 0)}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="block font-bold tabular-nums text-[var(--fg)]">{tl(s.ciroKurus)}</span>
                      {/* ciro payı: en yüksek ciroya göre */}
                      <span className="mt-1.5 block h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-[var(--soft-2)]" aria-hidden="true">
                        <span className="bn-fill block h-full rounded-full bg-[linear-gradient(90deg,var(--chart-from),var(--chart-to))]" style={{ width: `${Math.max(2, (s.ciroKurus / highest) * 100)}%` }} />
                      </span>
                    </td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg-2)]`}>{tl(s.vadeFarkiKurus)}</td>
                    <td className={`${td} text-right tabular-nums ${s.iptalIadeKurus ? "text-[var(--danger-text)]" : "text-[var(--muted)]"}`}>{s.iptalIadeKurus ? `− ${tl(s.iptalIadeKurus)}` : "—"}</td>
                    <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(s.hesabaGececekKurus)}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(s.durum)}`}>{labelOf("recordStatus", s.durum)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {total && rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--soft)] font-bold">
                    <td className={`${td} text-[var(--fg)]`}>Toplam · {formatNumber(total.firmaAdet)} firma</td>
                    <td className={`${td} tabular-nums text-[var(--fg)]`}>{formatNumber(total.islemAdet)}</td>
                    <td className={`${td} tabular-nums text-[var(--fg)]`}>{tl(total.ciroKurus)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg)]`}>{tl(total.vadeFarkiKurus)}</td>
                    <td className={`${td} text-right tabular-nums ${total.iptalIadeKurus ? "text-[var(--danger-text)]" : "text-[var(--muted)]"}`}>{total.iptalIadeKurus ? `− ${tl(total.iptalIadeKurus)}` : "—"}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--brand-text)]`}>{tl(total.hesabaGececekKurus)}</td>
                    <td className={td} />
                  </tr>
                </tfoot>
              )}
            </table>
            {rows.length > 0 && visible.length === 0 && <EmptyState title="Aramaya uyan firma yok" actions={[{ etiket: "Aramayı temizle", onClick: () => setSearch("") }]} />}
            {rows.length === 0 && (
              <EmptyState title="Bu dönemde işlem yok" description="Dönemi genişletin ya da müşteri türü filtresini kaldırın." actions={[range.kod !== "90g" && { etiket: "Son 90 günü göster", onClick: () => setRange(periodRange("90g")) }, customerKind && { etiket: "Müşteri türü filtresini kaldır", onClick: () => setCustomerKind("") }]} />
            )}
          </div>
        )}

        <p className="flex items-start gap-1.5 border-t border-[var(--border)] px-4 py-2.5 text-[11.5px] text-[var(--muted)]">
          <I name="info" size={13} className="mt-px shrink-0" />
          Hesaba geçecek tutar = başarılı ciro + vade farkı − iptal/iade (demo varsayımı; kesin hesap backend'de). Özet {tlShort(total?.ciroKurus || 0)} ciro üzerinden.
        </p>
      </section>
    </>
  );
}

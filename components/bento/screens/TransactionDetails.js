// Raporlar › İşlem Detayları — veri: GET /islemler (filtre, arama ve rol kapsamı sunucuda)
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { formatNumber, formatDateTime, installmentText, tl } from "@/lib/format";
import { LABEL, statusTone, labelOf } from "@/lib/labels";
import { useTransactions } from "@/lib/queries/transactions";
import { EmptyState, ErrorBox, Loading } from "../states";
import { downloadCsv, csvAmount } from "@/lib/export";
import { SortableHeader, changeSorting } from "../table";
import { rangeQuery, periodLabel } from "@/lib/period";
import { Breadcrumb, DateRange, PrintButton, BottomSheet, FilterButton, ChipGroup, SheetActions } from "../shared";
import { CARD, FOCUS } from "../theme";
import { useDebounced, useIsMobile } from "../helpers";

const STATUS_TABS = ["TUMU", "BASARILI", "BASARISIZ", "IPTAL", "IADE"];

const SCOPE = {
  [ROLES.ANA_FIRMA]: "Tüm bayi ve alt bayi işlemleri",
  [ROLES.BAYI]: "Kendi ve alt bayi işlemleri",
  [ROLES.ALT_BAYI]: "Kendi işlemleri",
};

function customerKindTone(kind) {
  if (kind === "BAYI" || kind === "ALT_BAYI") return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  if (kind === "KENDI_KARTI") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (kind === "DUZENSIZ_MUSTERI" || kind === "MUSTERI_KARTI") return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
  return "bg-[var(--soft-2)] text-[var(--fg-2)]";
}

export function TransactionDetails({ role, meta, onHome, initialSearch }) {
  const [search, setSearch] = useState(initialSearch || "");
  const [status, setStatus] = useState("TUMU");
  const [paymentType, setPaymentType] = useState("");
  const [customerKind, setCustomerKind] = useState("");
  const [range, setRange] = useState(null); // null: tüm geçmiş
  const q = useDebounced(search.trim());
  const [sorting, setSorting] = useState({ field: "tarih", direction: "desc" }); // sayfalı liste: sıralama sunucuda
  const sort = (field) => setSorting((s) => changeSorting(s, field, field === "islemNo" ? "asc" : "desc"));

  const query = useTransactions({ durum: status === "TUMU" ? undefined : status, musteriTuru: customerKind || undefined, odemeTipi: paymentType || undefined, q: q || undefined, ...rangeQuery(range), sira: `${sorting.field}:${sorting.direction}` });
  const data = query.data;
  const rows = data?.kayitlar || [];
  const count = (d) => data?.sayaclar?.[d] ?? "–";

  // alt bayi yalnızca kendi işlemlerini gördüğü için "çekim yapan" sütunu ona gösterilmez
  const showActor = role !== ROLES.ALT_BAYI;
  const hasFilter = search !== "" || status !== "TUMU" || paymentType !== "" || customerKind !== "" || range !== null;
  const clear = () => {
    setSearch("");
    setStatus("TUMU");
    setPaymentType("");
    setCustomerKind("");
    setRange(null);
  };
  // telefonda müşteri türü, ödeme tipi ve dönem alttan açılan çekmecede
  const mobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetCount = (customerKind ? 1 : 0) + (paymentType ? 1 : 0) + (range ? 1 : 0);
  const selectCls = `h-9 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[12.5px] font-medium text-[var(--fg-2)] ${FOCUS}`;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={onHome} path={["Raporlar", "İşlem Detayları"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">İşlem Detayları</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {SCOPE[role]}
          </p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              "islem-detaylari",
              ["İşlem No", "Tarih", "Çekim Yapan", "Müşteri Türü", "Unvan", "Cari No", "Vergi No", "Ödeme", "Taksit", "Tutar (TL)", "Durum"],
              rows.map((t) => [t.islemNo, formatDateTime(t.tarih), t.cekimYapan?.unvan, labelOf("customerKind", t.musteriTuru), t.musteri.unvan, t.musteri.cariNo, t.musteri.vergiNo, LABEL.paymentType[t.odemeTipi], t.taksit, csvAmount(t.tutarKurus), labelOf("transactionStatus", t.durum)])
            )
          }
          disabled={rows.length === 0}
          title="Görünen sayfayı CSV olarak indirir"
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-50 md:self-auto ${FOCUS}`}
        >
          <I name="download" size={14} />
          Dışa Aktar
        </button>
        <PrintButton />
        </div>
      </div>

      {/* filtrelenen işlemlerin özeti — sunucudan (sayfadan bağımsız) */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "İşlem", value: data ? formatNumber(data.toplam) : "—", ink: "text-[var(--brand-text)]", wrap: "bg-[var(--brand-soft)]" },
          { label: "Toplam tutar", value: data ? tl(data.ozet.toplamKurus) : "—", ink: "text-[var(--brand-text)]", wrap: "border border-[var(--border)] bg-[var(--surface)]" },
          { label: "Başarılı tutar", value: data ? tl(data.ozet.basariliKurus) : "—", ink: "text-[var(--success-text)]", wrap: "bg-[var(--success-soft)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className={`mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px] ${query.isFetching ? "opacity-60" : ""}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İşlem listesi" aria-busy={query.isFetching}>
        {/* filtreler */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div role="group" aria-label="Durum" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            {STATUS_TABS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setStatus(d)}
                aria-pressed={status === d}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  status === d ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {d === "TUMU" ? "Tümü" : labelOf("transactionStatus", d)}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${status === d ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {count(d)}
                </span>
              </button>
            ))}
          </div>
          <div className={`flex gap-2 ${mobile ? "items-center" : "flex-col sm:flex-row sm:flex-wrap sm:items-center"}`}>
            <label className="relative block min-w-0 flex-1 sm:w-60 sm:flex-none">
              <span className="sr-only">İşlem ara</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <I name="search" size={14} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İşlem no, unvan, cari, vergi no"
                className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
              />
            </label>
            {mobile ? (
              <FilterButton count={sheetCount} label={range ? periodLabel(range) : "Filtrele"} onClick={() => setSheetOpen(true)} />
            ) : (
              <>
                <select aria-label="Müşteri türü" value={customerKind} onChange={(e) => setCustomerKind(e.target.value)} className={selectCls}>
                  <option value="">Tüm müşteri türleri</option>
                  {(data?.musteriTurleri || []).map((m) => (
                    <option key={m} value={m}>
                      {labelOf("customerKind", m)}
                    </option>
                  ))}
                </select>
                <select aria-label="Ödeme tipi" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={selectCls}>
                  <option value="">Tüm ödeme tipleri</option>
                  <option value="MANUEL">Manuel ödeme</option>
                  <option value="LINK">Link ile ödeme</option>
                </select>
              </>
            )}
          </div>
        </div>
        {!mobile && (
          <div className="border-t border-[var(--border)] px-3 py-2.5 sm:px-4">
            <DateRange value={range} onChange={setRange} all />
          </div>
        )}
        {mobile && sheetOpen && (
          <BottomSheet
            title="Filtreler"
            onClose={() => setSheetOpen(false)}
            bottomBar={
              <SheetActions
                onClear={sheetCount ? () => { setCustomerKind(""); setPaymentType(""); setRange(null); } : null}
                onClose={() => setSheetOpen(false)}
                count={data ? data.toplam : null}
              />
            }
          >
            <fieldset className="mt-1">
              <legend className="mb-2 text-[12px] font-bold text-[var(--fg-2)]">Dönem</legend>
              <DateRange value={range} onChange={setRange} all />
            </fieldset>
            <ChipGroup label="Müşteri türü" value={customerKind} onChange={setCustomerKind} options={[["", "Tümü"], ...(data?.musteriTurleri || []).map((m) => [m, labelOf("customerKind", m)])]} />
            <ChipGroup label="Ödeme tipi" value={paymentType} onChange={setPaymentType} options={[["", "Tümü"], ["MANUEL", "Manuel ödeme"], ["LINK", "Link ile ödeme"]]} />
          </BottomSheet>
        )}

        {query.isPending ? (
          <Loading row={6} title={false} />
        ) : query.isError ? (
          <ErrorBox error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
              <table className="bn-rtable min-w-full text-[12.5px]">
                <thead>
                  <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <SortableHeader field="islemNo" sorting={sorting} onSort={sort} className={th}>İşlem No</SortableHeader>
                    <SortableHeader field="tarih" sorting={sorting} onSort={sort} className={th}>Tarih</SortableHeader>
                    {showActor && <th scope="col" className={th}>Çekim Yapan</th>}
                    <th scope="col" className={th}>Müşteri Türü</th>
                    <th scope="col" className={th}>Unvan / Cari No</th>
                    <th scope="col" className={th}>Vergi No</th>
                    <th scope="col" className={th}>Ödeme</th>
                    <SortableHeader field="tutarKurus" sorting={sorting} onSort={sort} className={`${th} text-right`}>Tutar</SortableHeader>
                    <th scope="col" className={th}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t, i) => (
                    <tr key={t.islemNo} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                      <td data-label="İşlem No" data-card="sub" className={`${td} font-bold text-[var(--brand-text)]`}>{t.islemNo}</td>
                      <td data-label="Tarih" className={`${td} tabular-nums text-[var(--muted)]`}>{formatDateTime(t.tarih)}</td>
                      {showActor && (
                        <td data-label="Çekim Yapan" className={td}>
                          <span className="block font-semibold text-[var(--fg-2)]">{t.cekimYapan?.unvan}</span>
                          <span className="block text-[11px] text-[var(--muted)]">{labelOf("companyKind", t.cekimYapan?.tur)}</span>
                        </td>
                      )}
                      <td data-label="Müşteri Türü" className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${customerKindTone(t.musteriTuru)}`}>{labelOf("customerKind", t.musteriTuru)}</span>
                      </td>
                      <td data-card="title" className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{t.musteri.unvan}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.musteri.cariNo}</span>
                      </td>
                      <td data-label="Vergi No" className={`${td} tabular-nums text-[var(--fg-2)]`}>{t.musteri.vergiNo}</td>
                      <td data-label="Ödeme" className={td}>
                        <span className="flex items-center gap-1 tabular-nums text-[var(--fg-2)]">
                          <I name={t.odemeTipi === "LINK" ? "link" : "wallet"} size={13} className="text-[var(--muted)]" />
                          **** {t.kart.son4}
                        </span>
                        <span className="block text-[11px] text-[var(--muted)]">
                          {LABEL.paymentType[t.odemeTipi]} · {installmentText(t.taksit)}
                        </span>
                      </td>
                      <td data-card="aside" className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(t.tutarKurus)}</td>
                      <td data-label="Durum" data-card="status" className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(t.durum)}`}>{labelOf("transactionStatus", t.durum)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <EmptyState title="Bu filtrelere uyan işlem yok">
                  <button type="button" onClick={clear} className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                    Filtreleri temizle
                  </button>
                </EmptyState>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2.5 text-[11.5px] text-[var(--muted)]">
              <span>
                {formatNumber(data.sayaclar.TUMU)} işlemden <b className="font-bold text-[var(--fg-2)]">{formatNumber(data.toplam)}</b> tanesi gösteriliyor
                {data.toplam > rows.length && ` (ilk ${rows.length})`}
              </span>
              {hasFilter && rows.length > 0 && (
                <button type="button" onClick={clear} className={`rounded-full font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                  Filtreleri temizle
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}

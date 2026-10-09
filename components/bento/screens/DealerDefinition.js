// Bayi Tanım › Liste · Tanımlama — veri: GET/POST /bayiler, GET/PUT /bayiler/{cariNo}, GET /firma,
// GET /vade-farki-profilleri, GET /uye-isyerleri, POST /musteriler (müşteri türü seçilirse).
// Şartname s.5: ana firma bayi, bayi (yetkisi varsa) alt bayi tanımlar; alt bayi tanım yapamaz.
// Listedeki "Ödeme Al", şartname s.2'deki "bayi cari kartından bayi adına ödeme" işlevidir.
import { useCallback, useEffect, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { parseCents, formatNumber, formatDateTime, tl, formatPercent } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useDealer, useUpdateDealer, useCreateDealer, useDealers, useCreateCustomer } from "@/lib/queries/dealers";
import { useTransactions } from "@/lib/queries/transactions";
import { useCompany, useMerchants, useMaturityProfiles } from "@/lib/queries/definitions";
import { EmptyState, ErrorBox, Loading } from "../states";
import { Breadcrumb, Notice, inputCls, Field, FormSection, Drawer, ConfirmModal, AuditNote } from "../shared";
import { ActionMenu, SortableHeader, useSorting } from "../table";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";
import { figures, useDebounced } from "../helpers";

const ALL_INSTALLMENTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const installmentSummary = (l) => l.map((n) => (n === 1 ? "Tek" : n)).join(", ");
const profileName = (p) => (p ? `${p.ad.replace("Vade Farkı ", "")} · ${formatPercent(p.oranYuzde, 2)}` : "—");
/** Liste kaydından PUT /bayiler/{cariNo} gövdesi: yalnız durum değişir, tanım alanları olduğu gibi gider */
const dealerBody = (b, currentStatus) => ({
  tur: b.tur,
  unvan: b.unvan,
  cariNo: b.cariNo,
  vergiNo: b.vergiNo,
  telefon: b.telefon,
  email: b.email,
  adres: b.adres,
  vadeProfilId: b.vadeProfilId,
  taksitler: b.taksitler,
  islemLimitiKurus: b.islemLimitiKurus,
  uyeIsyerleri: b.uyeIsyerleri,
  altBayiYetkisi: b.tur === "BAYI" ? b.altBayiYetkisi : undefined,
  durum: currentStatus,
});
// sütun → sıralama değeri (liste ekranda sıralanır; tüm kayıtlar yüklü)
const DEALER_COLUMNS = {
  unvan: (b) => b.unvan,
  bagli: (b) => b.bagli?.unvan,
  vadeProfil: (b) => b.vadeProfil?.oranYuzde ?? null,
  islemLimitiKurus: (b) => b.islemLimitiKurus,
  altBayiSayisi: (b) => b.altBayiSayisi ?? null,
  durum: (b) => b.durum,
};

export function DealerList({ role, meta, allSubDealers, accent, recordName, initialDetail, onNavigate }) {
  const subList = role === ROLES.BAYI || allSubDealers;
  const title = subList ? "Alt Bayi Listesi" : "Bayi Liste";
  const group = role === ROLES.BAYI ? "Alt Bayi Tanım" : "Bayi Tanım";

  const [search, setSearch] = useState("");
  const [currentStatus, setStatus] = useState("");
  const q = useDebounced(search.trim());
  const query = useDealers({ tur: subList ? "ALT_BAYI" : "BAYI", durum: currentStatus || undefined, q: q || undefined });
  const data = query.data;
  const rows = data?.kayitlar || [];
  const editable = data?.duzenlenebilir ?? !allSubDealers;
  const { sorted, sorting, sort } = useSorting(rows, DEALER_COLUMNS);
  const [detail, setDetail] = useState(initialDetail || null); // sağ panelde açık bayi (cari no); komut paletinden ?detay= ile gelir

  // tanımlamadan dönüşte: kaydedilen satır vurgulanır, kısa bilgi gösterilir
  const [notice, setNotice] = useState(null); // { metin, eylem? }
  const noticeDone = useCallback(() => setNotice(null), []);
  useEffect(() => {
    if (!accent || !data) return;
    const row = data.kayitlar.find((b) => b.cariNo === accent);
    setNotice({ text: row ? `${row.unvan} kaydedildi.` : `${recordName || accent} düzenli müşteri olarak kaydedildi.` });
  }, [accent, recordName, data]);

  // durum değişikliği: pasife alma onay ister, bildirimden geri alınabilir; aktife alma doğrudan
  const update = useUpdateDealer();
  const [toDeactivate, setToDeactivate] = useState(null);
  const changeStatus = async (b, currentStatus) => {
    try {
      await update.mutateAsync({ cariNo: b.cariNo, body: dealerBody(b, currentStatus) });
      setNotice(
        currentStatus === "PASIF"
          ? { text: `${b.unvan} pasife alındı; ödeme ekranlarında görünmez.`, action: { etiket: "Geri al", onClick: () => changeStatus(b, "AKTIF") } }
          : { text: `${b.unvan} yeniden aktif.` }
      );
    } catch (err) {
      setNotice({ text: err?.message || "Durum değiştirilemedi." });
    } finally {
      setToDeactivate(null);
    }
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={() => onNavigate(HOME)} path={[group, title]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{title}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} ·{" "}
            {allSubDealers ? "Ağdaki tüm alt bayiler; tanımlarını bağlı oldukları bayi yapar" : data ? `${formatNumber(data.sayaclar.TUMU)} tanımlı ${subList ? "alt bayi" : "bayi"}` : "Yükleniyor…"}
          </p>
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => onNavigate("/bayi-tanim/tanimlama")}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            {subList ? "Yeni Alt Bayi" : "Yeni Bayi"}
          </button>
        )}
      </div>

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label={title} aria-busy={query.isFetching}>
        <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Durum" className="flex gap-1">
            {[
              ["", "Tümü", "TUMU"],
              ["AKTIF", "Aktif", "AKTIF"],
              ["PASIF", "Pasif", "PASIF"],
            ].map(([value, name, counterKey]) => (
              <button
                key={name}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={currentStatus === value}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  currentStatus === value ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {name}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${currentStatus === value ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {data?.sayaclar?.[counterKey] ?? "–"}
                </span>
              </button>
            ))}
          </div>
          <label className="relative block md:w-72">
            <span className="sr-only">Ara</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <I name="search" size={14} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Unvan, cari no, vergi no"
              className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
            />
          </label>
        </div>

        {query.isPending ? (
          <Loading row={5} title={false} />
        ) : query.isError ? (
          <ErrorBox error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <div className={`relative overflow-x-auto transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
            <table className="bn-rtable min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <SortableHeader field="unvan" sorting={sorting} onSort={sort} className={th}>Unvan / Cari · Vergi No</SortableHeader>
                  <th scope="col" className={th}>İletişim</th>
                  {allSubDealers && <SortableHeader field="bagli" sorting={sorting} onSort={sort} className={th}>Bağlı Bayi</SortableHeader>}
                  <SortableHeader field="vadeProfil" sorting={sorting} onSort={sort} className={th}>Vade Profili</SortableHeader>
                  <th scope="col" className={th}>Taksitler</th>
                  <SortableHeader field="islemLimitiKurus" sorting={sorting} onSort={sort} className={`${th} text-right`}>İşlem Limiti</SortableHeader>
                  {!subList && <SortableHeader field="altBayiSayisi" sorting={sorting} onSort={sort} className={th}>Alt Bayi</SortableHeader>}
                  <SortableHeader field="durum" sorting={sorting} onSort={sort} className={th}>Durum</SortableHeader>
                  <th scope="col" className={th}>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((b, i) => (
                  <tr
                    key={b.cariNo}
                    className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${accent === b.cariNo ? "bg-[var(--success-soft)]" : ""}`}
                  >
                    <td data-card="title" className={td}>
                      <button type="button" onClick={() => setDetail(b.cariNo)} title="Detayı aç" className={`bn-yazdir-koru block rounded text-left font-semibold text-[var(--fg)] hover:text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                        {b.unvan}
                      </button>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                        {b.cariNo} · VKN {b.vergiNo}
                      </span>
                    </td>
                    <td data-label="İletişim" className={td}>
                      <span className="block tabular-nums text-[var(--fg-2)]">{b.telefon}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{b.email}</span>
                    </td>
                    {allSubDealers && <td data-label="Bağlı Bayi" className={`${td} text-[var(--fg-2)]`}>{b.bagli?.unvan}</td>}
                    <td data-label="Vade Profili" className={`${td} tabular-nums text-[var(--fg-2)]`}>{profileName(b.vadeProfil)}</td>
                    <td data-label="Taksitler" className={`${td} tabular-nums text-[var(--fg-2)]`}>{installmentSummary(b.taksitler)}</td>
                    <td data-label="İşlem Limiti" className={`${td} text-right font-semibold tabular-nums text-[var(--fg)]`}>{tl(b.islemLimitiKurus)}</td>
                    {!subList && (
                      <td data-label="Alt Bayi" className={td}>
                        <span className="block font-semibold tabular-nums text-[var(--fg-2)]">{b.altBayiSayisi}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{b.altBayiYetkisi ? "Tanımlayabilir" : "Yetkisi yok"}</span>
                      </td>
                    )}
                    <td data-card="aside" className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(b.durum)}`}>{labelOf("recordStatus", b.durum)}</span>
                    </td>
                    <td data-card="actions" className={`${td} text-right`}>
                      <ActionMenu
                        label={`${b.unvan} işlemleri`}
                        items={[
                          { etiket: "Detay", icon: "panel", onClick: () => setDetail(b.cariNo) },
                          editable && { etiket: "Düzenle", icon: "edit", onClick: () => onNavigate("/bayi-tanim/tanimlama", { duzenle: b.cariNo }) },
                          editable && b.durum === "AKTIF" && { etiket: "Ödeme Al", icon: "wallet", onClick: () => onNavigate("/odeme/manuel", { musteri: b.cariNo }) },
                          editable && (b.durum === "AKTIF" ? { etiket: "Pasife al", icon: "x", tone: "danger", onClick: () => setToDeactivate(b) } : { etiket: "Aktife al", icon: "check", onClick: () => changeStatus(b, "AKTIF") }),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 &&
              (search || currentStatus ? (
                <EmptyState title="Kayıt bulunamadı" description="Arama ya da durum filtresine uyan kayıt yok." actions={[{ etiket: "Filtreleri temizle", onClick: () => { setSearch(""); setStatus(""); } }]} />
              ) : (
                <EmptyState
                  title={allSubDealers ? "Ağda henüz alt bayi yok" : `Henüz ${subList ? "alt bayi" : "bayi"} tanımlı değil`}
                  description={allSubDealers ? "Alt bayileri bağlı oldukları bayiler tanımlar." : "Tek tek tanımlayın ya da Excel şablonuyla toplu ekleyin."}
                  icon="dealer"
                  actions={
                    editable && [
                      { etiket: subList ? "Yeni Alt Bayi" : "Yeni Bayi", icon: "plus", primary: true, onClick: () => onNavigate("/bayi-tanim/tanimlama") },
                      { etiket: "Excel ile Toplu Ekleme", icon: "download", onClick: () => onNavigate("/bayi-tanim/excel-ekleme") },
                    ]
                  }
                />
              ))}
          </div>
        )}
      </section>
      {detail && <DealerDetailPanel accountNo={detail} editable={editable} onClose={() => setDetail(null)} onNavigate={onNavigate} />}
      {toDeactivate && (
        <ConfirmModal
          title={`${toDeactivate.unvan} pasife alınsın mı?`}
          message={`Pasif ${subList ? "alt bayi" : "bayi"} ödeme ekranlarındaki müşteri listesinden kalkar; kayıt ve geçmiş işlemler silinmez. Bildirimdeki "Geri al" ile ya da Düzenle'den yeniden aktif edebilirsiniz.`}
          confirmLabel="Pasife Al"
          tone="danger"
          busy={update.isPending}
          onApprove={() => changeStatus(toDeactivate, "PASIF")}
          onClose={() => setToDeactivate(null)}
        />
      )}
      {notice && <Notice text={notice.text} action={notice.action} onDone={noticeDone} />}
    </>
  );
}

// Sağ panel: bayinin kimliği, koşulları ve son işlemleri — veri: GET /bayiler/{cariNo}, GET /islemler?firmaId=&boyut=5
function DealerDetailPanel({ accountNo, editable, onClose, onNavigate }) {
  const dealer = useDealer(accountNo);
  const transactions = useTransactions({ firmaId: accountNo, boyut: 5 });
  const b = dealer.data;
  const Row = ({ name, children }) => (
    <div className="flex items-start justify-between gap-4 py-1.5 text-[12.5px]">
      <dt className="shrink-0 text-[var(--muted)]">{name}</dt>
      <dd className="text-right font-semibold text-[var(--fg)]">{children}</dd>
    </div>
  );
  const button = (primary) =>
    `inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-[13px] font-bold transition ${primary ? "bg-[var(--brand)] text-white hover:brightness-110" : "border border-[var(--border-strong)] text-[var(--fg-2)] hover:border-[var(--brand)]"} ${FOCUS}`;
  return (
    <Drawer
      title={b?.unvan || "Bayi"}
      subtitle={b ? `${labelOf("companyKind", b.tur)} · ${b.cariNo} · VKN ${b.vergiNo}` : undefined}
      onClose={onClose}
      bottomBar={
        b &&
        editable && (
          <>
            <button type="button" onClick={() => onNavigate("/bayi-tanim/tanimlama", { duzenle: b.cariNo })} className={button(false)}>
              <I name="edit" size={14} />
              Düzenle
            </button>
            {b.durum === "AKTIF" && (
              <button type="button" onClick={() => onNavigate("/odeme/manuel", { musteri: b.cariNo })} className={button(true)}>
                <I name="wallet" size={14} />
                Ödeme Al
              </button>
            )}
          </>
        )
      }
    >
      {dealer.isPending ? (
        <Loading row={6} title={false} />
      ) : dealer.isError ? (
        <ErrorBox error={dealer.error} onRetry={() => dealer.refetch()} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(b.durum)}`}>{labelOf("recordStatus", b.durum)}</span>
            {b.bagli && <span className="text-[11.5px] text-[var(--muted)]">{b.bagli.unvan} ağında</span>}
          </div>
          <section>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">İletişim</h3>
            <dl className="divide-y divide-[var(--border)]">
              <Row name="Telefon"><span className="tabular-nums">{b.telefon}</span></Row>
              <Row name="E-posta">{b.email}</Row>
              <Row name="Adres"><span className="block max-w-[260px]">{b.adres}</span></Row>
            </dl>
          </section>
          <section>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Ödeme Koşulları</h3>
            <dl className="divide-y divide-[var(--border)]">
              <Row name="Vade profili">{profileName(b.vadeProfil)}</Row>
              <Row name="Taksitler"><span className="tabular-nums">{installmentSummary(b.taksitler)}</span></Row>
              <Row name="İşlem limiti"><span className="tabular-nums">{tl(b.islemLimitiKurus)}</span></Row>
              {b.tur === "BAYI" && <Row name="Alt bayi">{formatNumber(b.altBayiSayisi)} · {b.altBayiYetkisi ? "tanımlayabilir" : "yetkisi yok"}</Row>}
              <Row name="Üye işyerleri"><span className="tabular-nums">{b.uyeIsyerleri.join(", ") || "—"}</span></Row>
            </dl>
          </section>
          <section>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Son İşlemler</h3>
            {transactions.isPending ? (
              <Loading row={3} title={false} />
            ) : (transactions.data?.kayitlar || []).length === 0 ? (
              <p className="py-2 text-[12.5px] text-[var(--muted)]">Henüz işlemi yok.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {transactions.data.kayitlar.map((t) => (
                  <li key={t.islemNo} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-[var(--fg)]">{t.musteri.unvan}</span>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.islemNo} · {formatDateTime(t.tarih)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-bold tabular-nums text-[var(--fg)]">{tl(t.tutarKurus)}</span>
                      <span className={`inline-flex rounded-full px-1.5 py-px text-[10.5px] font-bold ${statusTone(t.durum)}`}>{labelOf("transactionStatus", t.durum)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {transactions.data?.toplam > 5 && <p className="mt-1 text-[11.5px] text-[var(--muted)]">Toplam {formatNumber(transactions.data.toplam)} işlem · tümü İşlem Detayları'nda</p>}
          </section>
          <AuditNote record={b} className="border-t border-[var(--border)] pt-3" />
        </div>
      )}
    </Drawer>
  );
}

// Tanımlama: önce gerekli veriler (kendi kayıt, profiller, üye işyerleri, düzenleniyorsa kayıt) yüklenir, sonra form kurulur.
export function DealerDefinition({ role, meta, editingAccountNo, onNavigate }) {
  const isSub = role === ROLES.BAYI; // bayi alt bayi tanımlar
  const group = isSub ? "Alt Bayi Tanım" : "Bayi Tanım";
  const company = useCompany();
  const profiles = useMaturityProfiles();
  const merchants = useMerchants();
  const existing = useDealer(editingAccountNo);
  const queries = [company, profiles, merchants, ...(editingAccountNo ? [existing] : [])];
  const failed = queries.find((s) => s.isError);
  const ready = queries.every((s) => s.isSuccess);

  const title = (
    <div className="bn-rise mb-4 px-1">
      <Breadcrumb onHome={() => onNavigate(HOME)} path={[group, editingAccountNo ? "Düzenle" : "Tanımlama"]} />
      <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{existing.data ? `${existing.data.unvan} — Düzenle` : isSub ? "Alt Bayi Tanımlama" : "Bayi Tanımlama"}</h1>
      <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
        {meta.company} · {isSub ? "Alt bayiye verilen sınırlar kendi sınırlarınızı aşamaz" : "Bayinin ödeme sınırlarını ve göreceği üye işyerlerini belirleyin"}
      </p>
    </div>
  );

  if (failed) {
    return (
      <>
        {title}
        <div className={`${CARD} hover:!translate-y-0`}>
          <ErrorBox error={failed.error} onRetry={() => queries.forEach((s) => s.isError && s.refetch())} />
        </div>
      </>
    );
  }
  if (!ready) {
    return (
      <>
        {title}
        <div className={`max-w-4xl ${CARD} hover:!translate-y-0`}>
          <Loading row={6} />
        </div>
      </>
    );
  }
  if (isSub && !company.data.altBayiYetkisi) {
    return (
      <>
        {title}
        <p className={`bn-rise flex items-start gap-2 p-5 text-[13px] text-[var(--fg-2)] ${CARD} hover:!translate-y-0`}>
          <I name="info" size={16} className="mt-px shrink-0 text-[var(--brand-text)]" />
          Alt bayi tanımlama yetkiniz bulunmuyor. Bu yetki ana firmanın bayi tanımından açılır.
        </p>
      </>
    );
  }
  return (
    <>
      {title}
      <DealerForm
        key={editingAccountNo || "yeni"}
        isSub={isSub}
        record={company.data}
        profiles={profiles.data.kayitlar}
        merchantOptions={merchants.data.kayitlar}
        existing={existing.data || null}
        onNavigate={onNavigate}
      />
    </>
  );
}

const KIND_LABEL = { BAYI: "Bayi", ALT_BAYI: "Alt Bayi", MUSTERI: "Müşteri" };

function DealerForm({ isSub, record, profiles, merchantOptions, existing, onNavigate }) {
  const kindOptions = isSub ? ["ALT_BAYI", "MUSTERI"] : ["BAYI", "MUSTERI"];
  const installmentOptions = isSub ? record.taksitler : ALL_INSTALLMENTS;
  const upperLimit = isSub ? record.islemLimitiKurus : null;
  const activeProfiles = profiles.filter((v) => v.durum === "AKTIF" || v.id === existing?.vadeProfilId);

  const [f, setF] = useState(() => ({
    tur: kindOptions[0],
    unvan: existing?.unvan || "",
    cariNo: existing?.cariNo || "",
    vergiNo: existing?.vergiNo || "",
    telefon: existing?.telefon || "",
    email: existing?.email || "",
    adres: existing?.adres || "",
    vadeProfilId: existing?.vadeProfilId || activeProfiles[0]?.id || 1,
    taksitler: existing?.taksitler || installmentOptions,
    limit: existing ? String(Math.round(existing.islemLimitiKurus / 100)) : "",
    altBayiYetkisi: existing?.altBayiYetkisi ?? false,
    uyeIsyerleri: existing?.uyeIsyerleri || merchantOptions.map((u) => u.cariNo),
    durum: existing?.durum || "AKTIF",
  }));
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const field = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const dealerKind = f.tur !== "MUSTERI";
  const listHref = "/bayi-tanim/liste";

  const create = useCreateDealer();
  const update = useUpdateDealer();
  const createCustomer = useCreateCustomer();
  const sending = create.isPending || update.isPending || createCustomer.isPending;

  // ekran tarafı doğrulama (hızlı geri bildirim) — sunucu aynı kuralları uygular, cevabındaki alan hataları da gösterilir
  const limitCents = parseCents(f.limit);
  const errors = {};
  if (!f.unvan.trim()) errors.unvan = "Unvan girin.";
  if (!/^\d{3}\.\d{2}\.\d{3}$/.test(f.cariNo)) errors.cariNo = "Cari no 000.00.000 biçiminde olmalı.";
  if (figures(f.vergiNo).length !== 10) errors.vergiNo = "10 haneli vergi no girin.";
  if (figures(f.telefon).length < 10) errors.telefon = "Geçerli bir telefon girin.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) errors.email = "Geçerli bir e-posta girin.";
  if (!f.adres.trim()) errors.adres = "Adres girin.";
  if (dealerKind) {
    if (f.taksitler.length === 0) errors.taksitler = "En az bir taksit açık olmalı.";
    if (!(limitCents > 0)) errors.islemLimitiKurus = "İşlem bazlı ödeme limiti girin.";
    else if (upperLimit && limitCents > upperLimit) errors.islemLimitiKurus = `Kendi limitinizi (${tl(upperLimit)}) aşamaz.`;
    if (f.uyeIsyerleri.length === 0) errors.uyeIsyerleri = "En az bir üye işyeri seçin.";
  }
  const h = (k) => serverErrors[k] || (attempted ? errors[k] : undefined);
  const change = (draft) => {
    setF(draft);
    if (Object.keys(serverErrors).length) setServerErrors({}); // kullanıcı düzeltince sunucu hatası silinir
  };

  const save = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setServerMessage(null);
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-bayi-form [aria-invalid="true"]')?.focus());
      return;
    }
    const auth = { unvan: f.unvan.trim(), cariNo: f.cariNo, vergiNo: figures(f.vergiNo), telefon: f.telefon.trim(), email: f.email.trim(), adres: f.adres.trim() };
    try {
      if (!dealerKind) {
        // müşteri türü: tanımlı (düzenli) müşteri olur; ödeme ekranlarında listeden seçilir
        const m = await createCustomer.mutateAsync(auth);
        onNavigate(listHref, { kaydedildi: m.cariNo, ad: m.unvan });
        return;
      }
      const body = {
        tur: f.tur,
        ...auth,
        vadeProfilId: Number(f.vadeProfilId),
        taksitler: [...f.taksitler].sort((a, b) => a - b),
        islemLimitiKurus: limitCents,
        uyeIsyerleri: f.uyeIsyerleri,
        altBayiYetkisi: isSub ? undefined : f.altBayiYetkisi,
        durum: f.durum,
      };
      const savedItem = existing ? await update.mutateAsync({ cariNo: existing.cariNo, body }) : await create.mutateAsync(body);
      onNavigate(listHref, { kaydedildi: savedItem.cariNo });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) {
        setServerErrors(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-bayi-form [aria-invalid="true"]')?.focus());
      } else {
        setServerMessage(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  const selectButton = (selected, onClick, content, key) => (
    <button
      key={key}
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={`inline-flex h-9 min-w-[44px] items-center justify-center rounded-full px-3 text-[12.5px] tabular-nums transition ${
        selected ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
      } ${FOCUS}`}
    >
      {content}
    </button>
  );

  return (
    <form id="bn-bayi-form" noValidate onSubmit={save} className="flex max-w-4xl flex-col gap-3" aria-busy={sending}>
      <FormSection no={1} i={0} title="Kimlik ve İletişim" description="Müşteri türü Müşteri seçilirse kayıt düzenli müşteri olarak tanımlanır.">
        <div role="radiogroup" aria-label="Müşteri türü" className="mb-4 flex gap-1">
          {kindOptions.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={f.tur === t}
              disabled={!!existing && t !== kindOptions[0]}
              onClick={() => change({ ...f, tur: t })}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                f.tur === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
              } ${FOCUS}`}
            >
              {KIND_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="bn-b-unvan" label="Unvan" error={h("unvan")} className="sm:col-span-2">
            <input id="bn-b-unvan" value={f.unvan} onChange={field("unvan")} aria-invalid={h("unvan") ? true : undefined} className={inputCls(h("unvan"))} />
          </Field>
          <Field id="bn-b-cari" label="Cari No" error={h("cariNo")} hint={existing ? "Cari no değiştirilemez." : undefined}>
            <input
              id="bn-b-cari"
              value={f.cariNo}
              readOnly={!!existing}
              onChange={(e) => change({ ...f, cariNo: e.target.value })}
              placeholder={isSub ? "540.02.014" : "320.01.006"}
              aria-invalid={h("cariNo") ? true : undefined}
              className={`${inputCls(h("cariNo"))} tabular-nums`}
            />
          </Field>
          <Field id="bn-b-vkn" label="Vergi No" error={h("vergiNo")}>
            <input
              id="bn-b-vkn"
              inputMode="numeric"
              maxLength={10}
              value={f.vergiNo}
              onChange={(e) => change({ ...f, vergiNo: figures(e.target.value) })}
              aria-invalid={h("vergiNo") ? true : undefined}
              className={`${inputCls(h("vergiNo"))} tabular-nums`}
            />
          </Field>
          <Field id="bn-b-tel" label="Telefon" error={h("telefon")}>
            <input id="bn-b-tel" type="tel" value={f.telefon} onChange={field("telefon")} aria-invalid={h("telefon") ? true : undefined} className={`${inputCls(h("telefon"))} tabular-nums`} />
          </Field>
          <Field id="bn-b-eposta" label="E-posta" error={h("email")}>
            <input id="bn-b-eposta" type="email" value={f.email} onChange={field("email")} aria-invalid={h("email") ? true : undefined} className={inputCls(h("email"))} />
          </Field>
          <Field id="bn-b-adres" label="Adres" error={h("adres")} className="sm:col-span-2">
            <textarea id="bn-b-adres" rows={2} value={f.adres} onChange={field("adres")} aria-invalid={h("adres") ? true : undefined} className={`${inputCls(h("adres"))} h-auto py-2`} />
          </Field>
        </div>
      </FormSection>

      {dealerKind && (
        <FormSection no={2} i={1} title="Ödeme Koşulları" description="Kaldırılan taksitler, tek çekim dahil, ödeme ekranlarında gösterilmez.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="bn-b-profil" label="Vade farkı profili" error={h("vadeProfilId")}>
              <select id="bn-b-profil" value={f.vadeProfilId} onChange={field("vadeProfilId")} aria-invalid={h("vadeProfilId") ? true : undefined} className={inputCls(h("vadeProfilId"))}>
                {activeProfiles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.ad.replace("Vade Farkı ", "")} · {formatPercent(v.oranYuzde, 2)} — {v.aciklama}
                    {v.durum === "PASIF" ? " (pasif)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              id="bn-b-limit"
              label="İşlem bazlı ödeme limiti"
              error={h("islemLimitiKurus")}
              hint={upperLimit ? `Üst sınır: ${tl(upperLimit)} (kendi limitiniz)` : "Tek bir işlemde alınabilecek en yüksek tutar."}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                <input
                  id="bn-b-limit"
                  inputMode="numeric"
                  value={f.limit ? Number(figures(f.limit)).toLocaleString("tr-TR") : ""}
                  onChange={(e) => change({ ...f, limit: figures(e.target.value) })}
                  aria-invalid={h("islemLimitiKurus") ? true : undefined}
                  className={`${inputCls(h("islemLimitiKurus"))} pl-7 font-bold tabular-nums`}
                />
              </div>
            </Field>
            <fieldset className="sm:col-span-2" aria-describedby={h("taksitler") ? "bn-b-taksit-hata" : undefined}>
              <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">
                Görebileceği taksitler {isSub && <span className="font-normal text-[var(--muted)]">— yalnızca sizin görebildiğiniz taksitler arasından</span>}
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {installmentOptions.map((n) =>
                  selectButton(
                    f.taksitler.includes(n),
                    () => change({ ...f, taksitler: f.taksitler.includes(n) ? f.taksitler.filter((x) => x !== n) : [...f.taksitler, n] }),
                    n === 1 ? "Tek Çekim" : n,
                    n
                  )
                )}
              </div>
              {h("taksitler") && (
                <p id="bn-b-taksit-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                  {h("taksitler")}
                </p>
              )}
            </fieldset>
            <fieldset className="sm:col-span-2" aria-describedby={h("uyeIsyerleri") ? "bn-b-uye-hata" : undefined}>
              <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Göreceği ana firma üye işyerleri</legend>
              <div className="flex flex-wrap gap-1.5">
                {merchantOptions.map((u) =>
                  selectButton(
                    f.uyeIsyerleri.includes(u.cariNo),
                    () => change({ ...f, uyeIsyerleri: f.uyeIsyerleri.includes(u.cariNo) ? f.uyeIsyerleri.filter((x) => x !== u.cariNo) : [...f.uyeIsyerleri, u.cariNo] }),
                    `${u.ad} — ${u.cariNo}`,
                    u.cariNo
                  )
                )}
              </div>
              {h("uyeIsyerleri") && (
                <p id="bn-b-uye-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                  {h("uyeIsyerleri")}
                </p>
              )}
            </fieldset>
            {!isSub && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-3 sm:col-span-2">
                <input type="checkbox" role="switch" checked={f.altBayiYetkisi} onChange={(e) => change({ ...f, altBayiYetkisi: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
                <span className="leading-snug">
                  <span className="block text-[12.5px] font-bold text-[var(--fg)]">Alt bayi tanımlayabilir</span>
                  <span className="block text-[11.5px] text-[var(--muted)]">Açıksa bayi kendi alt bayilerini tanımlayabilir.</span>
                </span>
              </label>
            )}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-3 sm:col-span-2">
              <input
                type="checkbox"
                role="switch"
                checked={f.durum === "AKTIF"}
                onChange={(e) => change({ ...f, durum: e.target.checked ? "AKTIF" : "PASIF" })}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
              />
              <span className="leading-snug">
                <span className="block text-[12.5px] font-bold text-[var(--fg)]">Aktif</span>
                <span className="block text-[11.5px] text-[var(--muted)]">Pasif kayıtlar ödeme ekranlarındaki müşteri listesinde görünmez.</span>
              </span>
            </label>
          </div>
        </FormSection>
      )}

      {serverMessage && (
        <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
          {serverMessage}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onNavigate(listHref)}
          className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={sending}
          className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}
        >
          <I name="check" size={15} strokeWidth={2.2} />
          {sending ? "Kaydediliyor…" : existing ? "Değişiklikleri Kaydet" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}

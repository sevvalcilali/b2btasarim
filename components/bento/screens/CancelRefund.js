// İptal / İade › Onay · Takip — şartname s.8 (onay zinciri) ve s.7 (takip raporu).
// Veri: GET /iptal-iade-talepleri?gorunum= · GET …/uygun-islemler · POST … · POST …/{talepNo}/onay · POST …/{talepNo}/red
import { Fragment, useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { parseCents, formatDateTime, tl, formatMoneyText } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useCreateRequest, useApproveRequest, useRejectRequest, useEligibleTransactions, useRequests } from "@/lib/queries/requests";
import { EmptyState, ErrorBox, Loading } from "../states";
import { Breadcrumb, Modal, Notice, inputCls, Field, ConfirmModal } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";

// Rolün takip sekmeleri (sunucu "gorunum" süzgeçleri)
const TRACKING_TABS = {
  [ROLES.ANA_FIRMA]: ["TUMU", "ONAYIMDA", "ONAYLANDI", "REDDEDILDI"],
  [ROLES.BAYI]: ["TUMU", "ONAYIMDA", "UST_ONAYA_ILETILEN", "ONAYLANDI", "REDDEDILDI"],
  [ROLES.ALT_BAYI]: ["TUMU", "ONAY_BEKLEYEN", "ONAYLANDI", "REDDEDILDI"],
};
const TAB_NAME = { TUMU: "Tümü", ONAYIMDA: "Onayımda", UST_ONAYA_ILETILEN: "Üst onaya iletilen", ONAY_BEKLEYEN: "Onay bekleyen", ONAYLANDI: "Onaylanan", REDDEDILDI: "Reddedilen" };

const REQUEST_FLOW = {
  [ROLES.ANA_FIRMA]: "Kendi işlemleriniz için girdiğiniz iptal / iade onay gerektirmeden sonuçlanır.",
  [ROLES.BAYI]: "Talebiniz ana firma onayına düşer; sonuçlandığında e-posta ile bilgilendirilirsiniz.",
  [ROLES.ALT_BAYI]: "Talebiniz önce bayinizin, ardından ana firmanın onayına düşer; onaylandığında e-posta ile bilgilendirilirsiniz.",
};

function NewRequest({ role, meta, onSaved, onClose }) {
  const eligible = useEligibleTransactions();
  const create = useCreateRequest();
  const [transactionNo, setTransactionNo] = useState("");
  const [kind, setKind] = useState("IADE");
  const [amountText, setAmountText] = useState("");
  const [description, setDescription] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const list = eligible.data?.kayitlar || [];
  const chosenNo = transactionNo || list[0]?.islemNo || "";
  const transaction = list.find((t) => t.islemNo === chosenNo);
  const transactionAmount = transaction?.tutarKurus || 0;
  const amountCents = kind === "IPTAL" ? transactionAmount : parseCents(amountText);

  const errors = {};
  if (!transaction) errors.islemNo = "İşlem seçin.";
  if (kind === "IADE" && !(amountCents > 0 && amountCents <= transactionAmount)) errors.tutarKurus = `0 ile ${tl(transactionAmount)} arasında bir tutar girin.`;
  if (!description.trim()) errors.aciklama = "Açıklama girin.";
  const h = (k) => serverErrors[k] || (attempted ? errors[k] : undefined);

  const save = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setServerErrors({});
    setServerMessage(null);
    if (Object.keys(errors).length > 0) return;
    try {
      const request = await create.mutateAsync({ islemNo: transaction.islemNo, tur: kind, tutarKurus: amountCents, aciklama: description.trim() });
      onSaved(request);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) setServerErrors(err.alanlar);
      else setServerMessage(err?.message || "Talep gönderilemedi.");
    }
  };

  return (
    <Modal title="Yeni İptal / İade Talebi" subtitle={meta.company} onClose={onClose} width="max-w-lg">
      {eligible.isPending ? (
        <Loading row={3} title={false} />
      ) : eligible.isError ? (
        <ErrorBox error={eligible.error} onRetry={() => eligible.refetch()} />
      ) : list.length === 0 ? (
        <p className="rounded-xl bg-[var(--soft)] px-3 py-3 text-[12.5px] text-[var(--fg-2)]">Talep girilebilecek başarılı bir işleminiz yok.</p>
      ) : (
        <form noValidate onSubmit={save} className="space-y-3" aria-busy={create.isPending}>
          <Field id="bn-talep-islem" label="İşlem" error={h("islemNo")}>
            <select id="bn-talep-islem" value={chosenNo} onChange={(e) => setTransactionNo(e.target.value)} aria-invalid={h("islemNo") ? true : undefined} className={inputCls(h("islemNo"))}>
              {list.map((t) => (
                <option key={t.islemNo} value={t.islemNo}>
                  {t.islemNo} · {t.musteriUnvan} · {tl(t.tutarKurus)}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <p id="bn-talep-tur" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
              Talep türü
            </p>
            <div role="radiogroup" aria-labelledby="bn-talep-tur" className="flex gap-1">
              {["IADE", "IPTAL"].map((x) => (
                <button
                  key={x}
                  type="button"
                  role="radio"
                  aria-checked={kind === x}
                  onClick={() => setKind(x)}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-[12.5px] transition ${kind === x ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                >
                  {labelOf("requestKind", x)}
                </button>
              ))}
            </div>
          </div>
          <Field
            id="bn-talep-tutar"
            label={kind === "IPTAL" ? "Tutar (işlemin tamamı)" : "İade tutarı"}
            error={h("tutarKurus")}
            hint={kind === "IADE" ? `Kısmi iade yapılabilir; işlem tutarı ${tl(transactionAmount)}.` : "İptal, işlemin tamamı için yapılır."}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
              <input
                id="bn-talep-tutar"
                inputMode="decimal"
                placeholder="0,00"
                readOnly={kind === "IPTAL"}
                value={kind === "IPTAL" ? tl(transactionAmount, { sign: false }) : amountText}
                onChange={(e) => setAmountText(formatMoneyText(e.target.value))}
                aria-invalid={h("tutarKurus") ? true : undefined}
                className={`${inputCls(h("tutarKurus"))} pl-7 font-bold tabular-nums`}
              />
            </div>
          </Field>
          <Field id="bn-talep-aciklama" label="Açıklama" error={h("aciklama")}>
            <textarea id="bn-talep-aciklama" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Örn. Ürün iadesi" aria-invalid={h("aciklama") ? true : undefined} className={`${inputCls(h("aciklama"))} h-auto py-2`} />
          </Field>
          <p className="flex items-start gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
            <I name="info" size={14} className="mt-px shrink-0 text-[var(--brand-text)]" />
            {REQUEST_FLOW[role]}
          </p>
          {serverMessage && (
            <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
              {serverMessage}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
              Vazgeç
            </button>
            <button type="submit" disabled={create.isPending} className={`inline-flex h-10 items-center rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
              {create.isPending ? "Gönderiliyor…" : role === ROLES.ANA_FIRMA ? `${labelOf("requestKind", kind)} Et` : "Talebi Gönder"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function CancelRefund({ role, meta, mode, onNavigate }) {
  const approvalMode = mode === "onay" && role !== ROLES.ALT_BAYI; // alt bayinin onay ekranı yoktur
  const company = meta.company;
  const tabs = TRACKING_TABS[role];
  const [tab, setTab] = useState("TUMU");
  const [open, setOpen] = useState(null);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(null);
  const [draft, setDraft] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);

  const query = useRequests({ gorunum: approvalMode ? "ONAYIMDA" : tab });
  const approve = useApproveRequest();
  const reject = useRejectRequest();
  const list = query.data?.kayitlar || [];
  const counter = (k) => query.data?.sayaclar?.[k] ?? "–";
  const showEnteredBy = role !== ROLES.ALT_BAYI;

  const [approvalTarget, setApprovalTarget] = useState(null); // onay penceresinde bekleyen talep
  const approvedRequest = async (t) => {
    try {
      const result = await approve.mutateAsync(t.talepNo);
      setNotice(`${t.talepNo}: ${result.bildirim}`);
    } catch (err) {
      setNotice(err?.message || "Onay verilemedi.");
    } finally {
      setApprovalTarget(null);
    }
  };
  const requestToReject = async () => {
    setReasonError(null);
    if (!reason.trim()) {
      setReasonError("Gerekçe girin; talebi girene e-posta ile iletilir.");
      return;
    }
    try {
      const result = await reject.mutateAsync({ talepNo: rejectionTarget.talepNo, gerekce: reason.trim() });
      setNotice(`${rejectionTarget.talepNo}: ${result.bildirim}`);
      setRejectionTarget(null);
    } catch (err) {
      setReasonError(err instanceof ApiError && err.alanlar.gerekce ? err.alanlar.gerekce : err?.message || "Red kaydedilemedi.");
    }
  };
  const requestSaved = (request) => {
    setDraft(false);
    setTab("TUMU");
    const isMainCompany = role === ROLES.ANA_FIRMA;
    setNotice(isMainCompany ? `${request.talepNo}: ${labelOf("requestKind", request.tur)} işlemi tamamlandı.` : `${request.talepNo} ${request.durum === "BAYI_ONAYINDA" ? "bayi" : "ana firma"} onayına gönderildi.`);
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";
  const column = showEnteredBy ? 7 : 6;
  const busy = approve.isPending || reject.isPending;

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={() => onNavigate(HOME)} path={["İptal / İade Takip", approvalMode ? "Onay" : "Takip"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{approvalMode ? "İptal / İade Onay" : "İptal / İade Takip"}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {company} · {approvalMode ? "Onayınızda bekleyen talepler" : "Taleplerin onay durumu"}
          </p>
        </div>
        {!approvalMode && (
          <button
            type="button"
            onClick={() => setDraft(true)}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Yeni Talep
          </button>
        )}
      </div>

      {role !== ROLES.ALT_BAYI && (
        <p className="bn-rise mb-3 flex items-start gap-2 rounded-2xl bg-[var(--brand-soft)] px-4 py-2.5 text-[12px] font-medium text-[var(--brand-text)]">
          <I name="bell" size={14} className="mt-px shrink-0" />
          {role === ROLES.BAYI
            ? "Alt bayilerinizin talepleri önce sizin onayınıza düşer; onayladığınız talep ana firmaya iletilir. Kendi talepleriniz doğrudan ana firma onayına gider."
            : "Bayi ve alt bayilerin talepleri onayınıza düşer; onayladığınızda talep sonuçlanır."}{" "}
          Onayınıza talep düştüğünde e-posta ile bilgilendirilirsiniz.
        </p>
      )}

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İptal / iade talepleri" aria-busy={query.isFetching || busy}>
        {!approvalMode && (
          <div role="group" aria-label="Durum" className="flex gap-1 overflow-x-auto p-3 sm:p-4">
            {tabs.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTab(s)}
                aria-pressed={tab === s}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${tab === s ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
              >
                {TAB_NAME[s]}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${tab === s ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{counter(s)}</span>
              </button>
            ))}
          </div>
        )}

        {query.isPending ? (
          <Loading row={5} title={false} />
        ) : query.isError ? (
          <ErrorBox error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <div className={`relative overflow-x-auto transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
            <table className="bn-rtable min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th scope="col" className={th}>Talep</th>
                  {showEnteredBy && <th scope="col" className={th}>Giren</th>}
                  <th scope="col" className={th}>İşlem / Müşteri</th>
                  <th scope="col" className={th}>Tür</th>
                  <th scope="col" className={`${th} text-right`}>Tutar</th>
                  <th scope="col" className={th}>Durum</th>
                  <th scope="col" className={th}>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((t, i) => {
                  const detail = open === t.talepNo;
                  return (
                    <Fragment key={t.talepNo}>
                      <tr className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${t.onayimda ? "shadow-[inset_3px_0_0_var(--brand)]" : ""}`}>
                        <td data-label="Talep" data-card="sub" className={td}>
                          <span className="block font-bold text-[var(--brand-text)]">{t.talepNo}</span>
                          <span className="block text-[11px] tabular-nums text-[var(--muted)]">{formatDateTime(t.tarih)}</span>
                        </td>
                        {showEnteredBy && (
                          <td data-label="Giren" className={td}>
                            <span className="block font-semibold text-[var(--fg-2)]">{t.giren?.unvan}</span>
                            <span className="block text-[11px] text-[var(--muted)]">{labelOf("companyKind", t.giren?.tur)}</span>
                          </td>
                        )}
                        <td data-card="title" className={td}>
                          <span className="block font-semibold text-[var(--fg)]">{t.musteriUnvan}</span>
                          <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.islemNo}</span>
                        </td>
                        <td data-label="Tür" className={`${td} font-semibold text-[var(--fg-2)]`}>{labelOf("requestKind", t.tur)}</td>
                        <td data-card="aside" className={`${td} text-right`}>
                          <span className="block font-bold tabular-nums text-[var(--fg)]">{tl(t.tutarKurus)}</span>
                          <span className="block text-[11px] tabular-nums text-[var(--muted)]">işlem {tl(t.islemTutariKurus)}</span>
                        </td>
                        <td data-label="Durum" data-card="status" className={td}>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(t.durum)}`}>{labelOf("requestStatus", t.durum)}</span>
                        </td>
                        <td data-card="actions" className={`${td} text-right`}>
                          <div className="flex items-center justify-end gap-1.5">
                            {t.onayimda && (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setApprovalTarget(t)}
                                  className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--success)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 disabled:opacity-60 ${FOCUS}`}
                                >
                                  <I name="check" size={13} strokeWidth={2.4} />
                                  {role === ROLES.BAYI ? "Onayla ve İlet" : "Onayla"}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => {
                                    setRejectionTarget(t);
                                    setReason("");
                                    setReasonError(null);
                                  }}
                                  className={`inline-flex h-8 items-center rounded-full border border-[var(--danger)] px-3 text-[12px] font-bold text-[var(--danger-text)] transition hover:bg-[var(--danger-soft)] disabled:opacity-60 ${FOCUS}`}
                                >
                                  Reddet
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setOpen(detail ? null : t.talepNo)}
                              aria-expanded={detail}
                              aria-controls={`bn-detay-${t.talepNo}`}
                              aria-label={`${t.talepNo} detayı`}
                              title="Detay ve geçmiş"
                              className={`grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--soft-2)] hover:text-[var(--brand-text)] ${FOCUS}`}
                            >
                              <I name="chevronDown" size={15} className={`transition-transform duration-200 ${detail ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {detail && (
                        <tr id={`bn-detay-${t.talepNo}`} className="bg-[var(--soft)]">
                          <td data-card="full" colSpan={column} className="px-4 py-3">
                            <div className="grid gap-3 text-[12px] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Açıklama</p>
                                <p className="mt-1 text-[var(--fg)]">{t.aciklama}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Geçmiş</p>
                                <ol className="mt-1.5 space-y-1.5 border-l-2 border-[var(--border-strong)] pl-3">
                                  {t.gecmis.map((g, j) => (
                                    <li key={j} className="relative">
                                      <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-[var(--brand)] ring-2 ring-[var(--soft)]" aria-hidden="true" />
                                      <span className="font-semibold text-[var(--fg)]">{g.firma?.unvan}</span>{" "}
                                      <span className="text-[var(--fg-2)]">
                                        — {labelOf("requestEvent", g.olay)}
                                        {g.not ? `: ${g.not}` : ""}
                                      </span>
                                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">{formatDateTime(g.tarih)}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {list.length === 0 && (
              <EmptyState title={approvalMode ? "Onayınızda bekleyen talep yok" : "Bu durumda talep yok"} icon="check" tone="success">
                {approvalMode && (
                  <button type="button" onClick={() => onNavigate("/iptal-iade/takip")} className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                    Tüm talepleri gör
                  </button>
                )}
              </EmptyState>
            )}
          </div>
        )}
      </section>

      {rejectionTarget && (
        <Modal title={`${rejectionTarget.talepNo} talebini reddet`} subtitle={`${rejectionTarget.giren?.unvan} · ${labelOf("requestKind", rejectionTarget.tur)} · ${tl(rejectionTarget.tutarKurus)}`} onClose={() => setRejectionTarget(null)} width="max-w-md">
          <Field id="bn-gerekce" label="Red gerekçesi" error={reasonError || undefined}>
            <textarea id="bn-gerekce" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={reasonError ? true : undefined} className={`${inputCls(reasonError)} h-auto py-2`} />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setRejectionTarget(null)} className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
              Vazgeç
            </button>
            <button type="button" disabled={reject.isPending} onClick={requestToReject} className={`inline-flex h-10 items-center rounded-full bg-[var(--danger)] px-5 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
              {reject.isPending ? "Kaydediliyor…" : "Reddet"}
            </button>
          </div>
        </Modal>
      )}

      {draft && <NewRequest role={role} meta={meta} onSaved={requestSaved} onClose={() => setDraft(false)} />}
      {approvalTarget && (
        <ConfirmModal
          title={`${approvalTarget.talepNo} talebini onayla`}
          message={
            role === ROLES.BAYI
              ? `${approvalTarget.giren?.unvan} · ${labelOf("requestKind", approvalTarget.tur)} · ${tl(approvalTarget.tutarKurus)}. Onayınız talebi ana firmanın onayına iletir; bu adım geri alınamaz.`
              : `${approvalTarget.giren?.unvan} · ${labelOf("requestKind", approvalTarget.tur)} · ${tl(approvalTarget.tutarKurus)}. Onayladığınızda işlem ${approvalTarget.tur === "IADE" ? "iade edilir" : "iptal edilir"} ve geri alınamaz.`
          }
          confirmLabel={role === ROLES.BAYI ? "Onayla ve İlet" : "Onayla"}
          busy={approve.isPending}
          onApprove={() => approvedRequest(approvalTarget)}
          onClose={() => setApprovalTarget(null)}
        />
      )}
      {notice && <Notice text={notice} onDone={noticeDone} />}
    </>
  );
}

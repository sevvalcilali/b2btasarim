// Raporlar › Fatura Yükleme Detay — şartname s.9 (fatura yükleme, şeklen kontrol, gizlilik), s.10 (link üzerinden yükleme).
// Veri: GET /faturalar?durum= · POST /faturalar (multipart) · POST /faturalar/{islemNo}/hatirlatma · POST /faturalar/{islemNo}/yukleme-linki
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { parseCents, formatNumber, formatDate, formatDateTime, tl, formatMoneyText } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useRemindInvoice, useUploadInvoice, useInvoiceUploadLink, useInvoices } from "@/lib/queries/invoices";
import { EmptyState, ErrorBox, Loading } from "../states";
import { Breadcrumb, Modal, Notice, inputCls, Field } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";

const TABS = [
  ["YUKLENMEMIS", "Yüklenmemiş"],
  ["YUKLENEN", "Yüklenen"],
  ["TUMU", "Tümü"],
];

function UploadInvoice({ row, onUploaded, onClose }) {
  const { islem: transaction } = row;
  const upload = useUploadInvoice();
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [amountText, setAmountText] = useState(tl(transaction.tutarKurus, { showCents: true, sign: false }));
  const [file, setFile] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);

  // hızlı ekran kontrolleri; asıl şeklen kontrol sunucuda (422 → alanlar)
  const errors = {};
  if (!/^[A-Z0-9]{3}\d{13}$/.test(invoiceNo)) errors.faturaNo = "Fatura no 16 karakter olmalı (ör. ANK2026000000412).";
  if (!invoiceDate) errors.faturaTarihi = "Fatura tarihini girin.";
  if (parseCents(amountText) !== transaction.tutarKurus) errors.tutarKurus = `Fatura tutarı işlem tutarıyla (${tl(transaction.tutarKurus)}) aynı olmalı.`;
  if (!file) errors.dosya = "Fatura dosyasını seçin.";
  const h = (k) => serverErrors[k] || (attempted ? errors[k] : undefined);

  const send = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setServerErrors({});
    setServerMessage(null);
    if (Object.keys(errors).length > 0) return;
    try {
      await upload.mutateAsync({ islemNo: transaction.islemNo, faturaNo: invoiceNo, faturaTarihi: invoiceDate, tutarKurus: parseCents(amountText), dosya: file });
      onUploaded(transaction.islemNo);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) setServerErrors(err.alanlar);
      else setServerMessage(err?.message || "Fatura yüklenemedi.");
    }
  };

  return (
    <Modal title="Fatura Yükle" subtitle={`${transaction.islemNo} · ${transaction.musteri.unvan} · ${tl(transaction.tutarKurus)}`} onClose={onClose} width="max-w-lg">
      <form noValidate onSubmit={send} className="space-y-3" aria-busy={upload.isPending}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="bn-f-no" label="Fatura no" error={h("faturaNo")} className="sm:col-span-2">
            <input
              id="bn-f-no"
              value={invoiceNo}
              maxLength={16}
              onChange={(e) => {
                setInvoiceNo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                setServerErrors({});
              }}
              placeholder="ANK2026000000412"
              aria-invalid={h("faturaNo") ? true : undefined}
              className={`${inputCls(h("faturaNo"))} tabular-nums`}
            />
          </Field>
          <Field id="bn-f-tarih" label="Fatura tarihi" error={h("faturaTarihi")}>
            <input
              id="bn-f-tarih"
              type="date"
              value={invoiceDate}
              onChange={(e) => {
                setInvoiceDate(e.target.value);
                setServerErrors({});
              }}
              aria-invalid={h("faturaTarihi") ? true : undefined}
              className={inputCls(h("faturaTarihi"))}
            />
          </Field>
          <Field id="bn-f-tutar" label="Fatura tutarı" error={h("tutarKurus")}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
              <input
                id="bn-f-tutar"
                inputMode="decimal"
                value={amountText}
                onChange={(e) => {
                  setAmountText(formatMoneyText(e.target.value));
                  setServerErrors({});
                }}
                aria-invalid={h("tutarKurus") ? true : undefined}
                className={`${inputCls(h("tutarKurus"))} pl-7 font-bold tabular-nums`}
              />
            </div>
          </Field>
        </div>

        <div>
          <label
            htmlFor="bn-f-dosya"
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--ring)] hover:border-[var(--brand)] hover:bg-[var(--soft)] ${h("dosya") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <I name={file ? "check" : "receipt"} size={18} />
            </span>
            <span className="text-[13px] font-bold text-[var(--fg)]">{file ? file.name : "Fatura dosyasını seçin"}</span>
            <span className="text-[11.5px] text-[var(--muted)]">{file ? `${Math.max(1, Math.round(file.size / 1024)).toLocaleString("tr-TR")} KB · değiştirmek için tıklayın` : "PDF, JPG ya da PNG · en fazla 5 MB"}</span>
            <input
              id="bn-f-dosya"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setServerErrors({});
              }}
              aria-invalid={h("dosya") ? true : undefined}
              aria-describedby={h("dosya") ? "bn-f-dosya-hata" : undefined}
              className="sr-only"
            />
          </label>
          {h("dosya") && (
            <p id="bn-f-dosya-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
              {h("dosya")}
            </p>
          )}
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
          <I name="lock" size={14} className="mt-px shrink-0 text-[var(--brand-text)]" />
          Fatura şeklen kontrol edilip alınır; uygun olmayan fatura alınmaz. Fatura içeriği bayiniz ve ana firma ile paylaşılmaz.
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
          <button type="submit" disabled={upload.isPending} className={`inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            {upload.isPending ? "Yükleniyor…" : "Yükle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Yükleme linkini sunucudan alıp panoya kopyalar (şartname s.10)
function CopyLink({ transactionNo, onNotice }) {
  const link = useInvoiceUploadLink();
  const copy = async () => {
    try {
      const { url } = await link.mutateAsync(transactionNo);
      await navigator.clipboard.writeText(url);
      onNotice("Fatura yükleme linki kopyalandı.");
    } catch (err) {
      onNotice(err?.message || "Link alınamadı.");
    }
  };
  return (
    <button type="button" onClick={copy} disabled={link.isPending} title="Faturayı link üzerinden yükletmek için linki kopyalayın" className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-[var(--soft)] px-2.5 text-[11.5px] font-bold text-[var(--brand-text)] transition hover:bg-[var(--soft-2)] disabled:opacity-60 ${FOCUS}`}>
      <I name="link" size={12} />
      {link.isPending ? "…" : "Kopyala"}
    </button>
  );
}

export function InvoiceUpload({ role, meta, onNavigate }) {
  const company = meta.company;
  const [tab, setTab] = useState("YUKLENMEMIS");
  const [upload, setUpload] = useState(null);
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);
  const query = useInvoices({ durum: tab });
  const remind = useRemindInvoice();
  const data = query.data;
  const rows = data?.kayitlar || [];
  const showActor = role !== ROLES.ALT_BAYI;

  const sendReminder = async (s) => {
    try {
      const result = await remind.mutateAsync(s.islem.islemNo);
      setNotice(`${result.firma.unvan} firmasına ${s.islem.islemNo} için fatura hatırlatması e-postayla gönderildi.`);
    } catch (err) {
      setNotice(err?.message || "Hatırlatma gönderilemedi.");
    }
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Breadcrumb onHome={() => onNavigate(HOME)} path={["Raporlar", "Fatura Yükleme Detay"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Fatura Yükleme Detay</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {company} · {role === ROLES.ANA_FIRMA ? "Bayi ve alt bayilerin fatura durumu" : role === ROLES.BAYI ? "Sizin ve alt bayilerinizin fatura durumu" : "Faturası beklenen işlemleriniz"}
        </p>
      </div>

      <p className="bn-rise mb-3 flex items-start gap-2 rounded-2xl bg-[var(--brand-soft)] px-4 py-2.5 text-[12px] font-medium text-[var(--brand-text)]">
        <I name="info" size={14} className="mt-px shrink-0" />
        {role === ROLES.ANA_FIRMA
          ? "Kendi kartı olmayan bayi ve alt bayi işlemlerinde kart sahibiyle aradaki fatura yüklenmelidir. Faturaların içeriği size gösterilmez; yalnızca durumu izlenir."
          : "Kendi kartınız olmayan işlemlerde kart sahibiyle aranızdaki faturayı yükleyin. Yüklenen fatura şeklen kontrol edilip alınır; içeriği bayinize ve ana firmaya gösterilmez."}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Yüklenmemiş", value: data ? formatNumber(data.ozet.bekleyen) : "—", wrap: "bg-[var(--warning-soft)]", ink: "text-[var(--warning-text)]" },
          { label: "Bekleyen tutar", value: data ? tl(data.ozet.bekleyenKurus) : "—", wrap: "border border-[var(--border)] bg-[var(--surface)]", ink: "text-[var(--brand-text)]" },
          { label: "Yüklenen", value: data ? formatNumber(data.ozet.yuklenen) : "—", wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className="mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px]">{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Fatura listesi" aria-busy={query.isFetching}>
        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div role="group" aria-label="Fatura durumu" className="flex gap-1 overflow-x-auto">
            {TABS.map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => setTab(code)}
                aria-pressed={tab === code}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${tab === code ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
              >
                {name}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${tab === code ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{data?.sayaclar?.[code] ?? "–"}</span>
              </button>
            ))}
          </div>
          {data?.ozet.kendiBekleyen > 0 && <p className="text-[12px] font-semibold text-[var(--warning-text)]">{data.ozet.kendiBekleyen} işleminizin faturası bekleniyor</p>}
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
                  <th scope="col" className={th}>İşlem</th>
                  {showActor && <th scope="col" className={th}>Çekim Yapan</th>}
                  <th scope="col" className={th}>Kart Sahibi / Müşteri</th>
                  <th scope="col" className={`${th} text-right`}>Tutar</th>
                  <th scope="col" className={th}>Fatura</th>
                  <th scope="col" className={th}>Durum</th>
                  <th scope="col" className={th}>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => {
                  const t = s.islem;
                  return (
                    <tr key={t.islemNo} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                      <td className={td}>
                        <span className="block font-bold text-[var(--brand-text)]">{t.islemNo}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{formatDateTime(t.tarih)}</span>
                      </td>
                      {showActor && (
                        <td className={td}>
                          <span className="block font-semibold text-[var(--fg-2)]">{t.cekimYapan?.unvan}</span>
                          <span className="block text-[11px] text-[var(--muted)]">{labelOf("companyKind", t.cekimYapan?.tur)}</span>
                        </td>
                      )}
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{t.musteri.unvan}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{labelOf("customerKind", t.musteriTuru)}</span>
                      </td>
                      <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(t.tutarKurus)}</td>
                      <td className={td}>
                        {!s.fatura ? (
                          <span className="text-[var(--muted)]">—</span>
                        ) : s.fatura.icerikGizli ? (
                          <span className="inline-flex items-center gap-1 text-[var(--muted)]" title="Fatura içeriği yalnızca yükleyen firmaya görünür">
                            <I name="lock" size={12} />
                            İçerik gizli
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1 font-semibold text-[var(--fg-2)]">
                              <I name="receipt" size={13} className="text-[var(--muted)]" />
                              {s.fatura.dosyaAdi}
                            </span>
                            <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                              {s.fatura.faturaNo} · {formatDate(s.fatura.faturaTarihi)}
                            </span>
                          </>
                        )}
                      </td>
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(s.durum)}`}>{labelOf("invoiceStatus", s.durum)}</span>
                        {s.durum === "REDDEDILDI" && s.fatura?.redNedeni && <span className="mt-0.5 block max-w-[220px] whitespace-normal text-[11px] leading-snug text-[var(--danger-text)]">{s.fatura.redNedeni}</span>}
                      </td>
                      <td className={`${td} text-right`}>
                        {s.durum !== "YUKLENDI" &&
                          (s.kendi ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button type="button" onClick={() => setUpload(s)} className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--brand)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}>
                                <I name="receipt" size={13} />
                                {s.durum === "REDDEDILDI" ? "Yeniden Yükle" : "Fatura Yükle"}
                              </button>
                              <CopyLink transactionNo={t.islemNo} onNotice={setNotice} />
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={remind.isPending}
                              onClick={() => sendReminder(s)}
                              className={`inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:opacity-60 ${FOCUS}`}
                            >
                              <I name="bell" size={13} />
                              Hatırlat
                            </button>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <EmptyState title={tab === "YUKLENMEMIS" ? "Yüklenmemiş fatura yok" : "Kayıt yok"} icon="check" tone="success" />}
          </div>
        )}
      </section>

      {upload && (
        <UploadInvoice
          row={upload}
          onUploaded={(transactionNo) => {
            setUpload(null);
            setNotice(`${transactionNo} faturası şeklen kontrol edildi ve alındı.`);
          }}
          onClose={() => setUpload(null)}
        />
      )}
      {notice && <Notice text={notice} onDone={noticeDone} />}
    </>
  );
}

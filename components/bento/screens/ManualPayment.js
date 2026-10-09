// Ödeme Al › Manuel Ödeme. Şartname s.6 (tahsilat ekranları), s.5 (taksit sınırı, işlem bazlı limit, ortaklar),
// s.4 (vade farkı profili), s.9 (müşteri kartında fatura beyanı).
// Veri: GET /odeme/taksit-secenekleri (taksit, limit, vade farkı sunucuda) · POST /odemeler (kart tokenı ile; kart no gönderilmez)
import { useState } from "react";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { tokenizeCard } from "@/lib/api/payments";
import { parseCents, installmentText, tl, tl2, formatPercent, formatMoneyText, formatDateTime } from "@/lib/format";
import { labelOf } from "@/lib/labels";
import { useMakePayment, useInstallmentOptions } from "@/lib/queries/payment";
import { ErrorBox } from "../states";
import { LISTELI, CustomerSection, errorHandler, useCustomerSelection } from "../payment";
import { Breadcrumb, inputCls, Field, FormSection } from "../shared";
import { ActiveAccountNote } from "./AccountSelection";
import { ResultMark, CountingAmount, ReceiptCard, ReceiptActions } from "../PaymentSuccess";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";
import { figures, useDebounced } from "../helpers";

export function ManualPayment({ role, meta, onNavigate, suggestedAccount }) {
  const m = useCustomerSelection(role, suggestedAccount);
  const { tur: kind, selected, kendi: own, ownCard, accountName } = m;
  const [amountText, setAmountText] = useState("");
  const [installment, setInstallment] = useState(null); // null → listenin ilk seçeneği
  const [description, setDescription] = useState("");
  const [card, setCard] = useState({ isim: "", no: "", skt: "", cvv: "" });
  const [declaration, setDeclaration] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const [tokenizing, setTokenizing] = useState(false);
  const [result, setResult] = useState(null);
  const payment = useMakePayment();

  const amountCents = parseCents(amountText);
  const validAmount = Number.isFinite(amountCents) && amountCents > 0;
  // taksit tablosu tutar yazılırken her tuşta değil, yazma durunca istenir
  const delayedAmount = useDebounced(validAmount ? amountCents : "");
  const condition = useInstallmentOptions({ tutarKurus: delayedAmount || undefined, musteriTuru: kind, musteriCariNo: LISTELI.has(kind) ? selected?.cariNo : undefined });
  const installments = condition.data?.taksitler || [];
  const limit = condition.data?.limitKurus || null;
  const profile = condition.data?.vadeProfil || null;
  // bayinin tek çekimi kapalı olabilir: varsayılan, sunucunun açtığı ilk seçenek
  const chosenInstallment = installments.includes(installment) ? installment : installments[0] ?? 1;
  const option = (n) => condition.data?.secenekler.find((s) => s.taksit === n) || { taksit: n, vadeFarkiKurus: 0, toplamKurus: validAmount ? amountCents : 0, aylikKurus: 0 };
  const summary = option(chosenInstallment);

  const cardName = ownCard ? own : card.isim;

  // doğrulama (müşteri alanları kancadan); anahtarlar sunucu alan adlarıyla aynı
  const errors = { ...m.hatalar };
  if (!validAmount) errors.tutarKurus = "Tutar girin.";
  else if (limit && amountCents > limit) errors.tutarKurus = `İşlem bazlı ödeme limiti ${tl(limit)}.`;
  if (!cardName.trim()) errors.kartIsmi = "Kart üzerindeki ismi girin.";
  if (figures(card.no).length !== 16) errors.kartNo = "16 haneli kart numarasını girin.";
  const [month, year] = card.skt.split("/").map((x) => Number(x));
  const now = new Date();
  const yy = now.getFullYear() % 100;
  if (!(month >= 1 && month <= 12 && (year > yy || (year === yy && month >= now.getMonth() + 1)))) errors.sonKullanma = "AA/YY biçiminde geçerli bir tarih girin.";
  if (figures(card.cvv).length !== 3) errors.cvv = "3 haneli güvenlik kodu.";
  if (!ownCard && !declaration) errors.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
  const h = errorHandler(attempted, errors, serverErrors);
  const sending = tokenizing || payment.isPending;

  const send = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setServerMessage(null);
    setServerErrors({});
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-manuel [aria-invalid="true"]')?.focus());
      return;
    }
    try {
      // kart numarası sunucuya gitmez: önce (demo) tokenlaştırılır
      setTokenizing(true);
      const token = await tokenizeCard({ no: card.no, isim: cardName.trim(), sonKullanma: card.skt });
      setTokenizing(false);
      const response = await payment.mutateAsync({
        ...m.body(),
        tutarKurus: amountCents,
        taksit: chosenInstallment,
        aciklama: description.trim() || undefined,
        kart: { token: token.token, son4: token.son4, isim: token.isim },
        faturaBeyani: ownCard ? undefined : declaration,
      });
      setResult(response);
    } catch (err) {
      setTokenizing(false);
      if (err instanceof ApiError && Object.keys(err.alanlar).length) {
        setServerErrors(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-manuel [aria-invalid="true"]')?.focus());
      } else setServerMessage(err?.message || "Ödeme alınamadı.");
    }
  };
  const newPayment = () => {
    m.sifirla();
    setAmountText("");
    setInstallment(null);
    setDescription("");
    setCard({ isim: "", no: "", skt: "", cvv: "" });
    setDeclaration(false);
    setAttempted(false);
    setServerErrors({});
    setServerMessage(null);
    setResult(null);
  };

  const title = (
    <div className="bn-rise mb-4 px-1">
      <Breadcrumb onHome={() => onNavigate(HOME)} path={["Ödeme Al", "Manuel Ödeme"]} />
      <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Manuel Ödeme</h1>
      <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
        {meta.company} · Kart bilgisiyle tahsilat
        <ActiveAccountNote />
      </p>
    </div>
  );

  if (m.hata) {
    return (
      <>
        {title}
        <div className={`${CARD} hover:!translate-y-0`}>
          <ErrorBox error={m.hata} />
        </div>
      </>
    );
  }

  if (result) {
    const successful = result.durum === "BASARILI";
    const rows = [
      ["İşlem No", result.islemNo],
      ["Tarih", formatDateTime(result.tarih)],
      ["Müşteri", `${result.musteri.unvan} · ${labelOf("customerKind", result.musteriTuru)}`],
      [m.accountLabel, result.tahsilatCarisi ? `${result.tahsilatCarisi.ad} — ${result.tahsilatCarisi.cariNo}` : "—"],
      ["Kart", `**** ${result.kart.son4} · ${result.kart.isim}`],
      ["Taksit", result.taksit === 1 ? "Tek çekim" : `${result.taksit} taksit × ${tl2(result.aylikKurus)}`],
      ["Tutar", tl2(result.tutarKurus)],
      ["Vade farkı", tl2(result.vadeFarkiKurus)],
    ];
    return (
      <>
        {title}
        <section className={`bn-pop mx-auto max-w-xl p-5 text-center sm:p-7 ${CARD} hover:!translate-y-0`} aria-live="polite">
          <ResultMark tone={successful ? "success" : "danger"} />
          <h2 className="mt-4 text-lg font-extrabold text-[var(--fg)]">{successful ? "Ödeme alındı" : "Ödeme alınamadı"}</h2>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">{successful ? "Karttan çekilen toplam" : result.redNedeni || "Banka işlemi onaylamadı."}</p>
          {successful && <CountingAmount cents={result.toplamKurus} className="mt-1 text-[32px] font-extrabold tabular-nums tracking-tight text-[var(--fg)]" />}
          <ReceiptCard rows={rows} />
          {result.faturaGerekli && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] px-3 py-2 text-left text-[12px] font-medium text-[var(--warning-text)]">
              <I name="info" size={15} className="mt-px shrink-0" />
              Bu işlemin faturasını Raporlar › Fatura Yükleme Detay ekranından yüklemeyi unutmayın.
            </p>
          )}
          {successful && (
            <ReceiptActions
              receipt={{ fileName: `dekont-${result.islemNo}`, title: "Ödeme alındı", company: meta.company, amount: tl2(result.toplamKurus), rows, ok: true }}
            />
          )}
          <div className="mt-3 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={newPayment} className={`inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 ${FOCUS}`}>
              <I name="plus" size={15} />
              {successful ? "Yeni Ödeme" : "Yeniden Dene"}
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/raporlar/islem-detaylari", { ara: result.islemNo })}
              className={`inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              İşlemi görüntüle
              <I name="arrowRight" size={14} />
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {title}
      <form id="bn-manuel" noValidate onSubmit={send} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start" aria-busy={sending}>
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* 1 — müşteri */}
          <FormSection no={1} i={0} title="Müşteri" description="Müşteri türünü seçin; tanımlı müşteriler listeden gelir.">
            <CustomerSection role={role} m={m} h={h} />
          </FormSection>

          {/* 2 — tutar ve taksit */}
          <FormSection
            no={2}
            i={1}
            title="Tutar ve Taksit"
            description={limit ? "Taksit seçenekleri bayi tanımındaki taksit sınırına göre gösterilir." : "Bayiden tahsilatta o bayinin vade farkı profili uygulanır."}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field id="bn-tutar" label="Tutar" error={h("tutarKurus")} hint={limit ? `İşlem bazlı ödeme limiti: ${tl(limit)}` : undefined}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                  <input
                    id="bn-tutar"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amountText}
                    onChange={(e) => setAmountText(formatMoneyText(e.target.value))}
                    onBlur={() => validAmount && setAmountText(tl(amountCents, { showCents: true, sign: false }))}
                    aria-invalid={h("tutarKurus") ? true : undefined}
                    className={`${inputCls(h("tutarKurus"))} pl-7 text-[15px] font-bold tabular-nums`}
                  />
                </div>
              </Field>
              <Field id="bn-aciklama" label="Açıklama (isteğe bağlı)">
                <input id="bn-aciklama" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Örn. Eylül faturası" className={inputCls()} />
              </Field>
            </div>

            <div role="radiogroup" aria-label="Taksit" aria-busy={condition.isFetching} className={`mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6 transition-opacity ${condition.isFetching ? "opacity-70" : ""}`}>
              {condition.isPending && [1, 2, 3].map((i) => <div key={i} className="h-[62px] animate-pulse rounded-xl bg-[var(--soft)] motion-reduce:animate-none" />)}
              {installments.map((n) => {
                const x = option(n);
                const isSelected = chosenInstallment === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setInstallment(n)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${isSelected ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"} ${FOCUS}`}
                  >
                    <span className={`block text-[12.5px] font-bold ${isSelected ? "text-[var(--brand-text)]" : "text-[var(--fg)]"}`}>{n === 1 ? "Tek Çekim" : `${n} Taksit`}</span>
                    <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--muted)]">{validAmount ? (n === 1 ? tl2(x.toplamKurus) : `${tl2(x.aylikKurus)} / ay`) : "—"}</span>
                  </button>
                );
              })}
            </div>
            {h("taksit") && <p className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">{h("taksit")}</p>}
          </FormSection>

          {/* 3 — kart */}
          <FormSection no={3} i={2} title="Kart Bilgileri" description="Kart numarası sunucuya gönderilmez; ödeme sağlayıcısında tokenlaşır (demo'da taklit edilir).">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field id="bn-kart-isim" label="Kart üzerindeki isim" error={h("kartIsmi")} hint={ownCard ? "Kendi kartında seçilen kişiden otomatik gelir, değiştirilemez." : undefined} className="col-span-2">
                <div className="relative">
                  <input
                    id="bn-kart-isim"
                    value={cardName}
                    readOnly={ownCard}
                    onChange={(e) => setCard({ ...card, isim: e.target.value })}
                    aria-invalid={h("kartIsmi") ? true : undefined}
                    autoComplete="cc-name"
                    className={`${inputCls(h("kartIsmi"))} ${ownCard ? "pr-9" : ""}`}
                  />
                  {ownCard && <I name="lock" size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />}
                </div>
              </Field>
              <Field id="bn-kart-no" label="Kart numarası" error={h("kartNo")} className="col-span-2">
                <div className="relative">
                  <I name="card" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    id="bn-kart-no"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={card.no}
                    onChange={(e) => setCard({ ...card, no: figures(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })}
                    aria-invalid={h("kartNo") ? true : undefined}
                    autoComplete="cc-number"
                    className={`${inputCls(h("kartNo"))} pl-9 tabular-nums`}
                  />
                </div>
              </Field>
              <Field id="bn-skt" label="Son kullanma" error={h("sonKullanma")}>
                <input
                  id="bn-skt"
                  inputMode="numeric"
                  placeholder="AA/YY"
                  value={card.skt}
                  onChange={(e) => {
                    const r = figures(e.target.value).slice(0, 4);
                    setCard({ ...card, skt: r.length > 2 ? `${r.slice(0, 2)}/${r.slice(2)}` : r });
                  }}
                  aria-invalid={h("sonKullanma") ? true : undefined}
                  autoComplete="cc-exp"
                  className={`${inputCls(h("sonKullanma"))} tabular-nums`}
                />
              </Field>
              <Field id="bn-cvv" label="Güvenlik kodu" error={h("cvv")}>
                <input
                  id="bn-cvv"
                  inputMode="numeric"
                  placeholder="CVV"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: figures(e.target.value).slice(0, 3) })}
                  aria-invalid={h("cvv") ? true : undefined}
                  autoComplete="cc-csc"
                  className={`${inputCls(h("cvv"))} tabular-nums`}
                />
              </Field>
            </div>
          </FormSection>
        </div>

        {/* özet + onay */}
        <aside style={{ "--i": 3 }} className={`bn-rise p-4 sm:p-5 lg:sticky lg:top-[76px] ${CARD} hover:!translate-y-0`} aria-label="Ödeme özeti">
          <h2 className="text-sm font-bold text-[var(--fg)]">Ödeme Özeti</h2>
          <dl className="mt-3 space-y-2 text-[12.5px]">
            {[
              ["Müşteri", m.ad || "—"],
              ["Müşteri türü", labelOf("customerKind", kind)],
              [m.accountLabel, accountName ? accountName.ad : "—"],
              ["Vade profili", profile ? `${profile.ad.replace("Vade Farkı ", "")} · ${formatPercent(profile.oranYuzde, 2)}` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                <dd className="truncate text-right font-semibold text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <dl className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-[12.5px]">
            {[
              ["Tutar", validAmount ? tl2(amountCents) : "—"],
              ["Taksit", chosenInstallment === 1 ? "Tek çekim" : `${chosenInstallment} × ${validAmount ? tl2(summary.aylikKurus) : "—"}`],
              ["Vade farkı", validAmount ? tl2(summary.vadeFarkiKurus) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5">
            <span className="text-[12px] font-semibold text-[var(--brand-text)]">Karttan çekilecek</span>
            <span className="text-[18px] font-extrabold tabular-nums text-[var(--fg)]">{validAmount ? tl2(summary.toplamKurus) : "—"}</span>
          </div>

          {!ownCard && (
            <div className="mt-3">
              <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[12px] leading-snug ${h("faturaBeyani") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  aria-invalid={h("faturaBeyani") ? true : undefined}
                  aria-describedby={h("faturaBeyani") ? "bn-beyan-hata" : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                />
                <span className="text-[var(--fg-2)]">
                  Kart müşteriye aittir. Kart sahibi ile aramızdaki faturayı <b className="font-bold">Fatura Yükleme</b> ekranından yükleyeceğimi beyan ederim.
                </span>
              </label>
              {h("faturaBeyani") && (
                <p id="bn-beyan-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                  {h("faturaBeyani")}
                </p>
              )}
            </div>
          )}

          {(serverMessage || (attempted && Object.keys(errors).length > 0)) && (
            <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
              {serverMessage || `${Object.keys(errors).length} alanı kontrol edin.`}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] text-[13.5px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}
          >
            {sending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
                İşleniyor…
              </>
            ) : (
              <>
                <I name="lock" size={15} />
                Ödemeyi Al
              </>
            )}
          </button>
        </aside>
      </form>
    </>
  );
}

export { installmentText };

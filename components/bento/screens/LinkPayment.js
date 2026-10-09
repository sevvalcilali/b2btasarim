// Ödeme Al › Link ile Ödeme. Şartname s.6: müşteri seçimi manuel ödemeyle aynı yapıda ilerler.
// Veri: GET /odeme/taksit-secenekleri · POST /odeme-linkleri · GET /odeme-linkleri
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { parseCents, formatDate, formatDateTime, tl, tl2, formatPercent, formatMoneyText } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useCreatePaymentLink, usePaymentLinks, useInstallmentOptions } from "@/lib/queries/payment";
import { EmptyState, ErrorBox, Loading } from "../states";
import { LISTELI, CustomerSection, errorHandler, useCustomerSelection } from "../payment";
import { Breadcrumb, inputCls, Field, FormSection, CopyButton } from "../shared";
import { ResultMark, CountingAmount, ReceiptCard, LinkShareActions } from "../PaymentSuccess";
import { ActiveAccountNote } from "./AccountSelection";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";
import { figures, useDebounced } from "../helpers";

const CHANNELS = ["SMS", "EPOSTA", "LINK"];
const VALIDITY = [1, 3, 7, 30];
const installmentText = (list) => list.map((n) => (n === 1 ? "Tek çekim" : `${n}`)).join(", ") + (list.some((n) => n > 1) ? " taksit" : "");

export function LinkPayment({ role, meta, onNavigate }) {
  const m = useCustomerSelection(role);
  const { tur: kind, selected, ownCard, accountName } = m;
  const [amountText, setAmountText] = useState("");
  const [closed, setClosed] = useState([]); // müşteriye gösterilmeyecek taksitler
  const [day, setDay] = useState(3);
  const [channel, setChannel] = useState("SMS");
  const [target, setTarget] = useState({ tel: null, email: null }); // null → müşterinin kayıtlı bilgisi önerilir
  const [description, setDescription] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const [created, setCreated] = useState(null);
  const [newItems, setNewItems] = useState([]); // bu oturumda oluşturulan link numaraları ("Yeni" etiketi)
  const listRef = useRef(null);
  const links = usePaymentLinks();
  const create = useCreatePaymentLink();

  // müşteri değişince gönderim bilgisi yeniden müşteriden önerilir
  useEffect(() => setTarget({ tel: null, email: null }), [m.ad, kind]);
  const tel = target.tel ?? m.contact.tel;
  const email = target.email ?? m.contact.email;

  const amountCents = parseCents(amountText);
  const validAmount = Number.isFinite(amountCents) && amountCents > 0;
  const delayedAmount = useDebounced(validAmount ? amountCents : "");
  const condition = useInstallmentOptions({ tutarKurus: delayedAmount || undefined, musteriTuru: kind, musteriCariNo: LISTELI.has(kind) ? selected?.cariNo : undefined });
  const installments = condition.data?.taksitler || [];
  const limit = condition.data?.limitKurus || null;
  const profile = condition.data?.vadeProfil || null;
  const option = (n) => condition.data?.secenekler.find((s) => s.taksit === n) || { toplamKurus: 0, aylikKurus: 0 };
  const openInstallments = installments.filter((n) => !closed.includes(n));
  const dueDate = new Date(Date.now() + day * 86400000);

  const errors = { ...m.hatalar };
  if (!validAmount) errors.tutarKurus = "Tutar girin.";
  else if (limit && amountCents > limit) errors.tutarKurus = `İşlem bazlı ödeme limiti ${tl(limit)}.`;
  if (!condition.data) errors.taksitler = "Taksit seçenekleri yükleniyor; bir an bekleyin.";
  else if (openInstallments.length === 0) errors.taksitler = "En az bir taksit seçeneği açık olmalı.";
  if (channel === "SMS" && figures(tel).length < 10) errors.hedef = "Linkin gönderileceği telefonu girin.";
  if (channel === "EPOSTA" && !/^\S+@\S+\.\S+$/.test(email)) errors.hedef = "Linkin gönderileceği e-postayı girin.";
  if (!ownCard && !declaration) errors.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
  const h = errorHandler(attempted, errors, serverErrors);

  const send = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setServerMessage(null);
    setServerErrors({});
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-link [aria-invalid="true"]')?.focus());
      return;
    }
    try {
      const link = await create.mutateAsync({
        ...m.body(),
        tutarKurus: amountCents,
        taksitler: openInstallments,
        kanal: channel,
        hedef: channel === "SMS" ? tel.trim() : channel === "EPOSTA" ? email.trim() : undefined,
        gecerlilikGun: day,
        aciklama: description.trim() || undefined,
        faturaBeyani: ownCard ? undefined : declaration,
      });
      setNewItems((l) => [link.linkNo, ...l]);
      setCreated(link);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) {
        setServerErrors(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-link [aria-invalid="true"]')?.focus());
      } else setServerMessage(err?.message || "Link oluşturulamadı.");
    }
  };
  const newLink = () => {
    m.sifirla();
    setAmountText("");
    setClosed([]);
    setDay(3);
    setChannel("SMS");
    setDescription("");
    setDeclaration(false);
    setAttempted(false);
    setServerErrors({});
    setServerMessage(null);
    setCreated(null);
  };

  const rows = links.data?.kayitlar || [];
  const showCreatedBy = role !== ROLES.ALT_BAYI;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5";

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Breadcrumb onHome={() => onNavigate(HOME)} path={["Ödeme Al", "Link ile Ödeme"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Link ile Ödeme</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · Müşteriye ödeme linki gönderin
          <ActiveAccountNote />
        </p>
      </div>

      {m.hata ? (
        <div className={`${CARD} hover:!translate-y-0`}>
          <ErrorBox error={m.hata} />
        </div>
      ) : created ? (
        <section className={`bn-pop mx-auto max-w-xl p-5 text-center sm:p-7 ${CARD} hover:!translate-y-0`} aria-live="polite">
          <ResultMark tone="success" />
          <h2 className="mt-4 text-lg font-extrabold text-[var(--fg)]">Ödeme linki oluşturuldu</h2>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">
            {created.kanal === "SMS" ? `SMS ile ${created.hedef} numarasına gönderildi.` : created.kanal === "EPOSTA" ? `E-posta ile ${created.hedef} adresine gönderildi.` : "Linki kopyalayıp müşterinize iletebilirsiniz."}
          </p>
          <CountingAmount cents={created.tutarKurus} className="mt-2 text-[28px] font-extrabold tabular-nums tracking-tight text-[var(--fg)]" />
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-1.5 pl-3">
            <I name="link" size={15} className="shrink-0 text-[var(--muted)]" />
            <span className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold tabular-nums text-[var(--fg)]">{created.url}</span>
            <CopyButton text={created.url} />
          </div>
          <LinkShareActions url={created.url} customer={created.musteriUnvan} amount={tl2(created.tutarKurus)} />
          <ReceiptCard
            rows={[
              ["Link No", created.linkNo],
              ["Müşteri", `${created.musteriUnvan} · ${labelOf("customerKind", created.musteriTuru)}`],
              ["Tutar", tl2(created.tutarKurus)],
              ["Taksit seçenekleri", installmentText(created.taksitler || [])],
              [m.accountLabel, created.tahsilatCarisi ? `${created.tahsilatCarisi.ad} — ${created.tahsilatCarisi.cariNo}` : "—"],
              ["Son geçerlilik", formatDateTime(created.sonGecerlilik)],
            ]}
          />
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={newLink} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}>
              <I name="plus" size={15} />
              Yeni Link
            </button>
            <button
              type="button"
              onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              Linkleri Gör
            </button>
          </div>
        </section>
      ) : (
        <form id="bn-link" noValidate onSubmit={send} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start" aria-busy={create.isPending}>
          <div className="flex flex-col gap-3 lg:col-span-2">
            <FormSection no={1} i={0} title="Müşteri" description="Manuel ödemeyle aynı: müşteri türünü seçin, tanımlı müşteriler listeden gelir.">
              <CustomerSection role={role} m={m} h={h} />
            </FormSection>

            <FormSection no={2} i={1} title="Tutar ve Taksit" description="Müşteri, ödeme sayfasında yalnızca açık bıraktığınız taksitleri görür.">
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
                <Field id="bn-aciklama" label="Açıklama (müşteri görür)">
                  <input id="bn-aciklama" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Örn. Ekim siparişi" className={inputCls()} />
                </Field>
              </div>

              <fieldset className="mt-4" aria-describedby={h("taksitler") ? "bn-taksit-hata" : undefined} aria-busy={condition.isFetching}>
                <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Müşteriye açık taksitler</legend>
                <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6 transition-opacity ${condition.isFetching ? "opacity-70" : ""}`}>
                  {condition.isPending && [1, 2, 3].map((i) => <div key={i} className="h-[62px] animate-pulse rounded-xl bg-[var(--soft)] motion-reduce:animate-none" />)}
                  {installments.map((n) => {
                    const open = !closed.includes(n);
                    const x = option(n);
                    return (
                      <label key={n} className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 transition ${open ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"}`}>
                        <input type="checkbox" checked={open} onChange={() => setClosed((k) => (open ? [...k, n] : k.filter((x) => x !== n)))} aria-invalid={h("taksitler") ? true : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
                        <span className="min-w-0 leading-tight">
                          <span className={`block text-[12.5px] font-bold ${open ? "text-[var(--brand-text)]" : "text-[var(--fg)]"}`}>{n === 1 ? "Tek Çekim" : `${n} Taksit`}</span>
                          <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--muted)]">{validAmount ? (n === 1 ? tl2(x.toplamKurus) : `${tl2(x.aylikKurus)} / ay`) : "—"}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {h("taksitler") && (
                  <p id="bn-taksit-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                    {h("taksitler")}
                  </p>
                )}
              </fieldset>
            </FormSection>

            <FormSection no={3} i={2} title="Gönderim" description="Link seçtiğiniz kanaldan müşteriye iletilir; süre dolunca geçersiz olur.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p id="bn-kanal-etiket" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
                    Gönderim kanalı
                  </p>
                  <div role="radiogroup" aria-labelledby="bn-kanal-etiket" className="flex flex-wrap gap-1">
                    {CHANNELS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={channel === k}
                        onClick={() => setChannel(k)}
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${channel === k ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                      >
                        {labelOf("channel", k)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p id="bn-sure-etiket" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
                    Geçerlilik süresi
                  </p>
                  <div role="radiogroup" aria-labelledby="bn-sure-etiket" className="flex flex-wrap gap-1">
                    {VALIDITY.map((g) => (
                      <button
                        key={g}
                        type="button"
                        role="radio"
                        aria-checked={day === g}
                        onClick={() => setDay(g)}
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${day === g ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                      >
                        {g} gün
                      </button>
                    ))}
                  </div>
                </div>
                {channel === "SMS" && (
                  <Field id="bn-hedef-tel" label="Gönderilecek telefon" error={h("hedef")} hint={m.contact.tel ? "Müşterinin kayıtlı telefonu önerildi." : undefined}>
                    <input id="bn-hedef-tel" type="tel" inputMode="tel" placeholder="05XX XXX XX XX" value={tel} onChange={(e) => setTarget({ ...target, tel: e.target.value })} aria-invalid={h("hedef") ? true : undefined} className={`${inputCls(h("hedef"))} tabular-nums`} />
                  </Field>
                )}
                {channel === "EPOSTA" && (
                  <Field id="bn-hedef-eposta" label="Gönderilecek e-posta" error={h("hedef")} hint={m.contact.email ? "Müşterinin kayıtlı e-postası önerildi." : undefined}>
                    <input id="bn-hedef-eposta" type="email" value={email} onChange={(e) => setTarget({ ...target, email: e.target.value })} aria-invalid={h("hedef") ? true : undefined} className={inputCls(h("hedef"))} />
                  </Field>
                )}
              </div>
            </FormSection>
          </div>

          {/* özet + oluştur */}
          <aside style={{ "--i": 3 }} className={`bn-rise p-4 sm:p-5 lg:sticky lg:top-[76px] ${CARD} hover:!translate-y-0`} aria-label="Link özeti">
            <h2 className="text-sm font-bold text-[var(--fg)]">Link Özeti</h2>
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
                ["Taksit seçenekleri", openInstallments.length ? installmentText(openInstallments) : "—"],
                ["Gönderim", channel === "SMS" ? tel || "SMS" : channel === "EPOSTA" ? email || "E-posta" : "Link kopyalanacak"],
                ["Son geçerlilik", formatDate(dueDate.toISOString())],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                  <dd className="truncate text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5">
              <span className="text-[12px] font-semibold text-[var(--brand-text)]">Link tutarı</span>
              <span className="text-[18px] font-extrabold tabular-nums text-[var(--fg)]">{validAmount ? tl2(amountCents) : "—"}</span>
            </div>
            <p className="mt-2 text-[11.5px] text-[var(--muted)]">Vade farkı, müşterinin seçtiği taksite göre ödeme sayfasında eklenir.</p>

            {!ownCard && (
              <div className="mt-3">
                <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[12px] leading-snug ${h("faturaBeyani") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
                  <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} aria-invalid={h("faturaBeyani") ? true : undefined} aria-describedby={h("faturaBeyani") ? "bn-beyan-hata" : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
                  <span className="text-[var(--fg-2)]">
                    Link müşteri kartıyla ödenecek. Kart sahibi ile aramızdaki faturayı <b className="font-bold">Fatura Yükleme</b> ekranından yükleyeceğimi beyan ederim.
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
              disabled={create.isPending}
              className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] text-[13.5px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}
            >
              <I name="link" size={15} />
              {create.isPending ? "Oluşturuluyor…" : channel === "LINK" ? "Link Oluştur" : `Link Oluştur ve ${labelOf("channel", channel)} Gönder`}
            </button>
          </aside>
        </form>
      )}

      {/* son linkler — GET /odeme-linkleri */}
      <section ref={listRef} style={{ "--i": 4 }} className={`bn-rise mt-3 scroll-mt-20 overflow-hidden ${CARD} hover:!translate-y-0`} aria-labelledby="bn-linkler-title" aria-busy={links.isFetching}>
        <div className="px-4 py-3">
          <h2 id="bn-linkler-title" className="text-sm font-bold text-[var(--fg)]">
            Son Ödeme Linkleri
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{links.data ? `${rows.length} link · bekleyen linkleri yeniden kopyalayabilirsiniz` : "Yükleniyor…"}</p>
        </div>
        {links.isPending ? (
          <Loading row={4} title={false} />
        ) : links.isError ? (
          <ErrorBox error={links.error} onRetry={() => links.refetch()} />
        ) : (
          <div className="relative overflow-x-auto">
            <table className="bn-rtable min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th scope="col" className={th}>Link No</th>
                  <th scope="col" className={th}>Oluşturma / Son Geçerlilik</th>
                  {showCreatedBy && <th scope="col" className={th}>Oluşturan</th>}
                  <th scope="col" className={th}>Müşteri</th>
                  <th scope="col" className={`${th} text-right`}>Tutar</th>
                  <th scope="col" className={th}>Kanal</th>
                  <th scope="col" className={th}>Durum</th>
                  <th scope="col" className={th}>
                    <span className="sr-only">İşlem</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l, i) => (
                  <tr key={l.linkNo} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                    <td data-label="Link No" data-card="sub" className={`${td} font-bold text-[var(--brand-text)]`}>
                      {l.linkNo}
                      {newItems.includes(l.linkNo) && <span className="ml-1.5 rounded-full bg-[var(--success-soft)] px-1.5 py-px text-[10px] font-bold text-[var(--success-text)]">Yeni</span>}
                    </td>
                    <td data-label="Oluşturma / Son Geçerlilik" className={`${td} tabular-nums`}>
                      <span className="block text-[var(--fg-2)]">{formatDateTime(l.olusturma)}</span>
                      <span className="block text-[11px] text-[var(--muted)]">son {formatDateTime(l.sonGecerlilik)}</span>
                    </td>
                    {showCreatedBy && <td data-label="Oluşturan" className={`${td} text-[var(--fg-2)]`}>{l.olusturan?.unvan}</td>}
                    <td data-card="title" className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{l.musteriUnvan}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{labelOf("customerKind", l.musteriTuru)}</span>
                    </td>
                    <td data-card="aside" className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(l.tutarKurus)}</td>
                    <td data-label="Kanal" className={`${td} text-[var(--fg-2)]`}>{labelOf("channel", l.kanal)}</td>
                    <td data-label="Durum" data-card="status" className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${l.durum === "BEKLIYOR" ? "bg-[var(--brand-soft)] text-[var(--brand-text)]" : statusTone(l.durum)}`}>{labelOf("linkStatus", l.durum)}</span>
                    </td>
                    <td data-card="actions" className={`${td} text-right`}>{l.durum === "BEKLIYOR" && <CopyButton small text={l.url} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <EmptyState title="Henüz ödeme linki yok" description="Yukarıdaki formla oluşturduğunuz linkler ve ödeme durumları burada listelenir." icon="link" />}
          </div>
        )}
      </section>
    </>
  );
}

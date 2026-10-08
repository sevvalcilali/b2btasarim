import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/roles";
import { odemeLinkleri } from "@/lib/mockData";
import I from "@/components/DesignIcons";
import { kapsamda } from "../ag";
import { TAHSILAT_CARISI, useMusteriSecimi, odemeKosullari, vadeHesabi, MusteriBolumu } from "../odeme";
import { Konum, inputCls, Alan, FormBolum, KopyalaDugmesi } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { tutarCoz, tl2, rakamlar, tarihSaat } from "../yardimci";

// ---- Ödeme Al › Link ile Ödeme ------------------------------------------------------------
// Şartname s.6: link oluşturulurken müşteri türü ve müşteri seçimi manuel ödemeyle aynı yapıda ilerler.
const KANALLAR = ["SMS", "E-posta", "Sadece link"];

const GECERLILIK = [1, 3, 7, 30];

const LINK_ADRESI = "https://link.nkolayislem.com.tr/b2b/";

function linkTone(durum) {
  if (durum === "Ödendi") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Bekliyor") return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  if (durum === "İptal Edildi") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  return "bg-[var(--soft-2)] text-[var(--muted)]"; // Süresi Doldu
}

export function LinkOdeme({ role, meta, onNavigate }) {
  const m = useMusteriSecimi(role, meta);
  const { kayit, tur, secili, kendiKarti, cariAdi } = m;
  const { taksitler, limit, profil } = odemeKosullari(kayit, tur, secili);

  const [tutarMetni, setTutarMetni] = useState("");
  const [kapali, setKapali] = useState([]); // müşteriye gösterilmeyecek taksitler
  const [gun, setGun] = useState(3);
  const [kanal, setKanal] = useState("SMS");
  const [hedef, setHedef] = useState({ tel: null, email: null }); // null → müşterinin kayıtlı bilgisi önerilir
  const [aciklama, setAciklama] = useState("");
  const [beyan, setBeyan] = useState(false);
  const [denendi, setDenendi] = useState(false);
  const [olusan, setOlusan] = useState(null);
  const [yeniler, setYeniler] = useState([]);
  const listeRef = useRef(null);

  // müşteri değişince gönderim bilgisi yeniden müşteriden önerilir
  useEffect(() => setHedef({ tel: null, email: null }), [m.ad, tur]);
  const tel = hedef.tel ?? m.iletisim.tel;
  const email = hedef.email ?? m.iletisim.email;

  const acikTaksitler = taksitler.filter((n) => !kapali.includes(n));
  const tutar = tutarCoz(tutarMetni);
  const gecerliTutar = Number.isFinite(tutar) && tutar > 0;
  const sonTarih = new Date(Date.now() + gun * 86400000);

  const hatalar = { ...m.hatalar };
  if (!gecerliTutar) hatalar.tutar = "Tutar girin.";
  else if (limit && tutar > limit) hatalar.tutar = `İşlem bazlı ödeme limiti ₺ ${limit.toLocaleString("tr-TR")}.`;
  if (acikTaksitler.length === 0) hatalar.taksit = "En az bir taksit seçeneği açık olmalı.";
  if (kanal === "SMS" && rakamlar(tel).length < 10) hatalar.hedefTel = "Linkin gönderileceği telefonu girin.";
  if (kanal === "E-posta" && !/^\S+@\S+\.\S+$/.test(email)) hatalar.hedefEmail = "Linkin gönderileceği e-postayı girin.";
  if (!kendiKarti && !beyan) hatalar.beyan = "Müşteri kartıyla ödemede beyanı onaylayın.";
  const h = (k) => (denendi ? hatalar[k] : undefined);

  const taksitMetni = (liste) => liste.map((n) => (n === 1 ? "Tek çekim" : `${n}`)).join(", ") + (liste.some((n) => n > 1) ? " taksit" : "");

  const olustur = (e) => {
    e.preventDefault();
    setDenendi(true);
    if (Object.keys(hatalar).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-link [aria-invalid="true"]')?.focus());
      return;
    }
    const id = `LNK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const link = {
      id,
      olusturma: tarihSaat(new Date()),
      sonGecerlilik: tarihSaat(sonTarih),
      yapan: meta.company,
      musteriTuru: tur,
      musteri: m.ad,
      tutar: tl2(tutar),
      kanal,
      durum: "Bekliyor",
      hedef: kanal === "SMS" ? tel : kanal === "E-posta" ? email : null,
      taksitler: acikTaksitler,
      cari: cariAdi,
    };
    setYeniler((l) => [link, ...l]);
    setOlusan(link);
  };
  const yeniLink = () => {
    m.sifirla();
    setTutarMetni("");
    setKapali([]);
    setGun(3);
    setKanal("SMS");
    setAciklama("");
    setBeyan(false);
    setDenendi(false);
    setOlusan(null);
  };

  const satirlar = [...yeniler, ...odemeLinkleri.filter((l) => kapsamda(role, l.yapan))];
  const olusturanGoster = role !== ROLES.ALT_BAYI;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5";

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", "Link ile Ödeme"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Link ile Ödeme</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{meta.company} · Müşteriye ödeme linki gönderin</p>
      </div>

      {olusan ? (
        <section className={`bn-pop mx-auto max-w-xl p-5 text-center sm:p-7 ${CARD} hover:!translate-y-0`} aria-live="polite">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success-text)]">
            <I name="link" size={24} strokeWidth={2.2} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-[var(--fg)]">Ödeme linki oluşturuldu</h2>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">
            {olusan.kanal === "SMS"
              ? `SMS ile ${olusan.hedef} numarasına gönderildi.`
              : olusan.kanal === "E-posta"
                ? `E-posta ile ${olusan.hedef} adresine gönderildi.`
                : "Linki kopyalayıp müşterinize iletebilirsiniz."}
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-1.5 pl-3">
            <span className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold tabular-nums text-[var(--fg)]">
              {LINK_ADRESI}
              {olusan.id.slice(4)}
            </span>
            <KopyalaDugmesi metin={`${LINK_ADRESI}${olusan.id.slice(4)}`} />
          </div>
          <dl className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] text-left text-[12.5px]">
            {[
              ["Link No", olusan.id],
              ["Müşteri", `${olusan.musteri} · ${olusan.musteriTuru}`],
              ["Tutar", olusan.tutar],
              ["Taksit seçenekleri", taksitMetni(olusan.taksitler)],
              [TAHSILAT_CARISI[role], olusan.cari ? `${olusan.cari.ad} — ${olusan.cari.cari}` : "—"],
              ["Son geçerlilik", olusan.sonGecerlilik],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={yeniLink}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}
            >
              <I name="plus" size={15} />
              Yeni Link
            </button>
            <button
              type="button"
              onClick={() => listeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              Linkleri Gör
            </button>
          </div>
        </section>
      ) : (
        <form id="bn-link" noValidate onSubmit={olustur} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <FormBolum no={1} i={0} baslik="Müşteri" aciklama="Manuel ödemeyle aynı: müşteri türünü seçin, tanımlı müşteriler listeden gelir.">
              <MusteriBolumu role={role} m={m} h={h} />
            </FormBolum>

            <FormBolum no={2} i={1} baslik="Tutar ve Taksit" aciklama="Müşteri, ödeme sayfasında yalnızca açık bıraktığınız taksitleri görür.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Alan id="bn-tutar" etiket="Tutar" hata={h("tutar")} ipucu={limit ? `İşlem bazlı ödeme limiti: ₺ ${limit.toLocaleString("tr-TR")}` : undefined}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                    <input
                      id="bn-tutar"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={tutarMetni}
                      onChange={(e) => setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""))}
                      onBlur={() => gecerliTutar && setTutarMetni(tutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                      aria-invalid={h("tutar") ? true : undefined}
                      className={`${inputCls(h("tutar"))} pl-7 text-[15px] font-bold tabular-nums`}
                    />
                  </div>
                </Alan>
                <Alan id="bn-aciklama" etiket="Açıklama (müşteri görür)">
                  <input id="bn-aciklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Örn. Ekim siparişi" className={inputCls()} />
                </Alan>
              </div>

              <fieldset className="mt-4" aria-describedby={h("taksit") ? "bn-taksit-hata" : undefined}>
                <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Müşteriye açık taksitler</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                  {taksitler.map((n) => {
                    const acik = !kapali.includes(n);
                    const x = vadeHesabi(gecerliTutar ? tutar : 0, n, profil);
                    return (
                      <label
                        key={n}
                        className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 transition ${
                          acik ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={acik}
                          onChange={() => setKapali((k) => (acik ? [...k, n] : k.filter((x) => x !== n)))}
                          aria-invalid={h("taksit") ? true : undefined}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                        />
                        <span className="min-w-0 leading-tight">
                          <span className={`block text-[12.5px] font-bold ${acik ? "text-[var(--brand-text)]" : "text-[var(--fg)]"}`}>{n === 1 ? "Tek Çekim" : `${n} Taksit`}</span>
                          <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--muted)]">
                            {gecerliTutar ? (n === 1 ? tl2(x.toplam) : `${tl2(x.aylik)} / ay`) : "—"}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {h("taksit") && (
                  <p id="bn-taksit-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                    {h("taksit")}
                  </p>
                )}
              </fieldset>
            </FormBolum>

            <FormBolum no={3} i={2} baslik="Gönderim" aciklama="Link seçtiğiniz kanaldan müşteriye iletilir; süre dolunca geçersiz olur.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p id="bn-kanal-etiket" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
                    Gönderim kanalı
                  </p>
                  <div role="radiogroup" aria-labelledby="bn-kanal-etiket" className="flex flex-wrap gap-1">
                    {KANALLAR.map((k) => (
                      <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={kanal === k}
                        onClick={() => setKanal(k)}
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${
                          kanal === k ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                        } ${FOCUS}`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p id="bn-sure-etiket" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
                    Geçerlilik süresi
                  </p>
                  <div role="radiogroup" aria-labelledby="bn-sure-etiket" className="flex flex-wrap gap-1">
                    {GECERLILIK.map((g) => (
                      <button
                        key={g}
                        type="button"
                        role="radio"
                        aria-checked={gun === g}
                        onClick={() => setGun(g)}
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${
                          gun === g ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                        } ${FOCUS}`}
                      >
                        {g} gün
                      </button>
                    ))}
                  </div>
                </div>
                {kanal === "SMS" && (
                  <Alan id="bn-hedef-tel" etiket="Gönderilecek telefon" hata={h("hedefTel")} ipucu={m.iletisim.tel ? "Müşterinin kayıtlı telefonu önerildi." : undefined}>
                    <input
                      id="bn-hedef-tel"
                      type="tel"
                      inputMode="tel"
                      placeholder="05XX XXX XX XX"
                      value={tel}
                      onChange={(e) => setHedef({ ...hedef, tel: e.target.value })}
                      aria-invalid={h("hedefTel") ? true : undefined}
                      className={`${inputCls(h("hedefTel"))} tabular-nums`}
                    />
                  </Alan>
                )}
                {kanal === "E-posta" && (
                  <Alan id="bn-hedef-eposta" etiket="Gönderilecek e-posta" hata={h("hedefEmail")} ipucu={m.iletisim.email ? "Müşterinin kayıtlı e-postası önerildi." : undefined}>
                    <input
                      id="bn-hedef-eposta"
                      type="email"
                      value={email}
                      onChange={(e) => setHedef({ ...hedef, email: e.target.value })}
                      aria-invalid={h("hedefEmail") ? true : undefined}
                      className={inputCls(h("hedefEmail"))}
                    />
                  </Alan>
                )}
              </div>
            </FormBolum>
          </div>

          {/* özet + oluştur */}
          <aside style={{ "--i": 3 }} className={`bn-rise p-4 sm:p-5 lg:sticky lg:top-[76px] ${CARD} hover:!translate-y-0`} aria-label="Link özeti">
            <h2 className="text-sm font-bold text-[var(--fg)]">Link Özeti</h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              {[
                ["Müşteri", m.ad || "—"],
                ["Müşteri türü", tur],
                [TAHSILAT_CARISI[role], cariAdi ? cariAdi.ad : "—"],
                ["Vade profili", profil ? `${profil.ad.replace("Vade Farkı ", "")} · %${profil.oran.toLocaleString("tr-TR")}` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                  <dd className="truncate text-right font-semibold text-[var(--fg)]">{v}</dd>
                </div>
              ))}
            </dl>
            <dl className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-[12.5px]">
              {[
                ["Taksit seçenekleri", acikTaksitler.length ? taksitMetni(acikTaksitler) : "—"],
                ["Gönderim", kanal === "SMS" ? tel || "SMS" : kanal === "E-posta" ? email || "E-posta" : "Link kopyalanacak"],
                ["Son geçerlilik", tarihSaat(sonTarih).slice(0, 10)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                  <dd className="truncate text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5">
              <span className="text-[12px] font-semibold text-[var(--brand-text)]">Link tutarı</span>
              <span className="text-[18px] font-extrabold tabular-nums text-[var(--fg)]">{gecerliTutar ? tl2(tutar) : "—"}</span>
            </div>
            <p className="mt-2 text-[11.5px] text-[var(--muted)]">Vade farkı, müşterinin seçtiği taksite göre ödeme sayfasında eklenir.</p>

            {!kendiKarti && (
              <div className="mt-3">
                <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[12px] leading-snug ${h("beyan") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
                  <input
                    type="checkbox"
                    checked={beyan}
                    onChange={(e) => setBeyan(e.target.checked)}
                    aria-invalid={h("beyan") ? true : undefined}
                    aria-describedby={h("beyan") ? "bn-beyan-hata" : undefined}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                  />
                  <span className="text-[var(--fg-2)]">
                    Link müşteri kartıyla ödenecek. Kart sahibi ile aramızdaki faturayı <b className="font-bold">Fatura Yükleme</b> ekranından yükleyeceğimi beyan ederim.
                  </span>
                </label>
                {h("beyan") && (
                  <p id="bn-beyan-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                    {h("beyan")}
                  </p>
                )}
              </div>
            )}

            {denendi && Object.keys(hatalar).length > 0 && (
              <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
                {Object.keys(hatalar).length} alanı kontrol edin.
              </p>
            )}

            <button
              type="submit"
              className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] text-[13.5px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 active:scale-[0.99] ${FOCUS}`}
            >
              <I name="link" size={15} />
              {kanal === "Sadece link" ? "Link Oluştur" : `Link Oluştur ve ${kanal} Gönder`}
            </button>
          </aside>
        </form>
      )}

      {/* son linkler */}
      <section ref={listeRef} style={{ "--i": 4 }} className={`bn-rise mt-3 scroll-mt-20 overflow-hidden ${CARD} hover:!translate-y-0`} aria-labelledby="bn-linkler-title">
        <div className="px-4 py-3">
          <h2 id="bn-linkler-title" className="text-sm font-bold text-[var(--fg)]">
            Son Ödeme Linkleri
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{satirlar.length} link · bekleyen linkleri yeniden kopyalayabilirsiniz</p>
        </div>
        <div className="relative overflow-x-auto">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th scope="col" className={th}>Link No</th>
                <th scope="col" className={th}>Oluşturma / Son Geçerlilik</th>
                {olusturanGoster && <th scope="col" className={th}>Oluşturan</th>}
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
              {satirlar.map((l, i) => (
                <tr key={l.id} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                  <td className={`${td} font-bold text-[var(--brand-text)]`}>
                    {l.id}
                    {yeniler.includes(l) && <span className="ml-1.5 rounded-full bg-[var(--success-soft)] px-1.5 py-px text-[10px] font-bold text-[var(--success-text)]">Yeni</span>}
                  </td>
                  <td className={`${td} tabular-nums`}>
                    <span className="block text-[var(--fg-2)]">{l.olusturma}</span>
                    <span className="block text-[11px] text-[var(--muted)]">son {l.sonGecerlilik}</span>
                  </td>
                  {olusturanGoster && <td className={`${td} text-[var(--fg-2)]`}>{l.yapan}</td>}
                  <td className={td}>
                    <span className="block font-semibold text-[var(--fg)]">{l.musteri}</span>
                    <span className="block text-[11px] text-[var(--muted)]">{l.musteriTuru}</span>
                  </td>
                  <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{l.tutar}</td>
                  <td className={`${td} text-[var(--fg-2)]`}>{l.kanal}</td>
                  <td className={td}>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${linkTone(l.durum)}`}>{l.durum}</span>
                  </td>
                  <td className={`${td} text-right`}>{l.durum === "Bekliyor" && <KopyalaDugmesi kucuk metin={`${LINK_ADRESI}${l.id.slice(4)}`} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

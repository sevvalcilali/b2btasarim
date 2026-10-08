// Ödeme Al › Link ile Ödeme. Şartname s.6: müşteri seçimi manuel ödemeyle aynı yapıda ilerler.
// Veri: GET /odeme/taksit-secenekleri · POST /odeme-linkleri · GET /odeme-linkleri
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { kurusCoz, tarih, tarihSaat, tl, tl2, yuzde, paraMetniBicimle } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useOdemeLinkiOlustur, useOdemeLinkleri, useTaksitSecenekleri } from "@/lib/sorgular/odeme";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { LISTELI, MusteriBolumu, hataBaglayici, useMusteriSecimi } from "../odeme";
import { Konum, inputCls, Alan, FormBolum, KopyalaDugmesi } from "../ortak";
import { AktifCariNotu } from "./CariSecimi";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { rakamlar, useGecikmeli } from "../yardimci";

const KANALLAR = ["SMS", "EPOSTA", "LINK"];
const GECERLILIK = [1, 3, 7, 30];
const taksitMetni = (liste) => liste.map((n) => (n === 1 ? "Tek çekim" : `${n}`)).join(", ") + (liste.some((n) => n > 1) ? " taksit" : "");

export function LinkOdeme({ role, meta, onNavigate }) {
  const m = useMusteriSecimi(role);
  const { tur, secili, kendiKarti, cariAdi } = m;
  const [tutarMetni, setTutarMetni] = useState("");
  const [kapali, setKapali] = useState([]); // müşteriye gösterilmeyecek taksitler
  const [gun, setGun] = useState(3);
  const [kanal, setKanal] = useState("SMS");
  const [hedef, setHedef] = useState({ tel: null, email: null }); // null → müşterinin kayıtlı bilgisi önerilir
  const [aciklama, setAciklama] = useState("");
  const [beyan, setBeyan] = useState(false);
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const [olusan, setOlusan] = useState(null);
  const [yeniler, setYeniler] = useState([]); // bu oturumda oluşturulan link numaraları ("Yeni" etiketi)
  const listeRef = useRef(null);
  const linkler = useOdemeLinkleri();
  const olustur = useOdemeLinkiOlustur();

  // müşteri değişince gönderim bilgisi yeniden müşteriden önerilir
  useEffect(() => setHedef({ tel: null, email: null }), [m.ad, tur]);
  const tel = hedef.tel ?? m.iletisim.tel;
  const email = hedef.email ?? m.iletisim.email;

  const tutarKurus = kurusCoz(tutarMetni);
  const gecerliTutar = Number.isFinite(tutarKurus) && tutarKurus > 0;
  const gecikmeliTutar = useGecikmeli(gecerliTutar ? tutarKurus : "");
  const kosul = useTaksitSecenekleri({ tutarKurus: gecikmeliTutar || undefined, musteriTuru: tur, musteriCariNo: LISTELI.has(tur) ? secili?.cariNo : undefined });
  const taksitler = kosul.data?.taksitler || [];
  const limit = kosul.data?.limitKurus || null;
  const profil = kosul.data?.vadeProfil || null;
  const secenek = (n) => kosul.data?.secenekler.find((s) => s.taksit === n) || { toplamKurus: 0, aylikKurus: 0 };
  const acikTaksitler = taksitler.filter((n) => !kapali.includes(n));
  const sonTarih = new Date(Date.now() + gun * 86400000);

  const hatalar = { ...m.hatalar };
  if (!gecerliTutar) hatalar.tutarKurus = "Tutar girin.";
  else if (limit && tutarKurus > limit) hatalar.tutarKurus = `İşlem bazlı ödeme limiti ${tl(limit)}.`;
  if (!kosul.data) hatalar.taksitler = "Taksit seçenekleri yükleniyor; bir an bekleyin.";
  else if (acikTaksitler.length === 0) hatalar.taksitler = "En az bir taksit seçeneği açık olmalı.";
  if (kanal === "SMS" && rakamlar(tel).length < 10) hatalar.hedef = "Linkin gönderileceği telefonu girin.";
  if (kanal === "EPOSTA" && !/^\S+@\S+\.\S+$/.test(email)) hatalar.hedef = "Linkin gönderileceği e-postayı girin.";
  if (!kendiKarti && !beyan) hatalar.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
  const h = hataBaglayici(denendi, hatalar, sunucuHatalari);

  const gonder = async (e) => {
    e.preventDefault();
    setDenendi(true);
    setSunucuMesaji(null);
    setSunucuHatalari({});
    if (Object.keys(hatalar).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-link [aria-invalid="true"]')?.focus());
      return;
    }
    try {
      const link = await olustur.mutateAsync({
        ...m.govde(),
        tutarKurus,
        taksitler: acikTaksitler,
        kanal,
        hedef: kanal === "SMS" ? tel.trim() : kanal === "EPOSTA" ? email.trim() : undefined,
        gecerlilikGun: gun,
        aciklama: aciklama.trim() || undefined,
        faturaBeyani: kendiKarti ? undefined : beyan,
      });
      setYeniler((l) => [link.linkNo, ...l]);
      setOlusan(link);
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) {
        setSunucuHatalari(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-link [aria-invalid="true"]')?.focus());
      } else setSunucuMesaji(err?.message || "Link oluşturulamadı.");
    }
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
    setSunucuHatalari({});
    setSunucuMesaji(null);
    setOlusan(null);
  };

  const satirlar = linkler.data?.kayitlar || [];
  const olusturanGoster = role !== ROLES.ALT_BAYI;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5";

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", "Link ile Ödeme"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Link ile Ödeme</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · Müşteriye ödeme linki gönderin
          <AktifCariNotu />
        </p>
      </div>

      {m.hata ? (
        <div className={`${CARD} hover:!translate-y-0`}>
          <HataKutusu hata={m.hata} />
        </div>
      ) : olusan ? (
        <section className={`bn-pop mx-auto max-w-xl p-5 text-center sm:p-7 ${CARD} hover:!translate-y-0`} aria-live="polite">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success-text)]">
            <I name="link" size={24} strokeWidth={2.2} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-[var(--fg)]">Ödeme linki oluşturuldu</h2>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">
            {olusan.kanal === "SMS" ? `SMS ile ${olusan.hedef} numarasına gönderildi.` : olusan.kanal === "EPOSTA" ? `E-posta ile ${olusan.hedef} adresine gönderildi.` : "Linki kopyalayıp müşterinize iletebilirsiniz."}
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-1.5 pl-3">
            <span className="min-w-0 flex-1 truncate text-left text-[12.5px] font-semibold tabular-nums text-[var(--fg)]">{olusan.url}</span>
            <KopyalaDugmesi metin={olusan.url} />
          </div>
          <dl className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] text-left text-[12.5px]">
            {[
              ["Link No", olusan.linkNo],
              ["Müşteri", `${olusan.musteriUnvan} · ${etiket("musteriTuru", olusan.musteriTuru)}`],
              ["Tutar", tl2(olusan.tutarKurus)],
              ["Taksit seçenekleri", taksitMetni(olusan.taksitler || [])],
              [m.cariEtiketi, olusan.tahsilatCarisi ? `${olusan.tahsilatCarisi.ad} — ${olusan.tahsilatCarisi.cariNo}` : "—"],
              ["Son geçerlilik", tarihSaat(olusan.sonGecerlilik)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={yeniLink} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}>
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
        <form id="bn-link" noValidate onSubmit={gonder} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start" aria-busy={olustur.isPending}>
          <div className="flex flex-col gap-3 lg:col-span-2">
            <FormBolum no={1} i={0} baslik="Müşteri" aciklama="Manuel ödemeyle aynı: müşteri türünü seçin, tanımlı müşteriler listeden gelir.">
              <MusteriBolumu role={role} m={m} h={h} />
            </FormBolum>

            <FormBolum no={2} i={1} baslik="Tutar ve Taksit" aciklama="Müşteri, ödeme sayfasında yalnızca açık bıraktığınız taksitleri görür.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Alan id="bn-tutar" etiket="Tutar" hata={h("tutarKurus")} ipucu={limit ? `İşlem bazlı ödeme limiti: ${tl(limit)}` : undefined}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                    <input
                      id="bn-tutar"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={tutarMetni}
                      onChange={(e) => setTutarMetni(paraMetniBicimle(e.target.value))}
                      onBlur={() => gecerliTutar && setTutarMetni(tl(tutarKurus, { kurusGoster: true, isaret: false }))}
                      aria-invalid={h("tutarKurus") ? true : undefined}
                      className={`${inputCls(h("tutarKurus"))} pl-7 text-[15px] font-bold tabular-nums`}
                    />
                  </div>
                </Alan>
                <Alan id="bn-aciklama" etiket="Açıklama (müşteri görür)">
                  <input id="bn-aciklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Örn. Ekim siparişi" className={inputCls()} />
                </Alan>
              </div>

              <fieldset className="mt-4" aria-describedby={h("taksitler") ? "bn-taksit-hata" : undefined} aria-busy={kosul.isFetching}>
                <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Müşteriye açık taksitler</legend>
                <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6 transition-opacity ${kosul.isFetching ? "opacity-70" : ""}`}>
                  {kosul.isPending && [1, 2, 3].map((i) => <div key={i} className="h-[62px] animate-pulse rounded-xl bg-[var(--soft)] motion-reduce:animate-none" />)}
                  {taksitler.map((n) => {
                    const acik = !kapali.includes(n);
                    const x = secenek(n);
                    return (
                      <label key={n} className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 transition ${acik ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"}`}>
                        <input type="checkbox" checked={acik} onChange={() => setKapali((k) => (acik ? [...k, n] : k.filter((x) => x !== n)))} aria-invalid={h("taksitler") ? true : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
                        <span className="min-w-0 leading-tight">
                          <span className={`block text-[12.5px] font-bold ${acik ? "text-[var(--brand-text)]" : "text-[var(--fg)]"}`}>{n === 1 ? "Tek Çekim" : `${n} Taksit`}</span>
                          <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--muted)]">{gecerliTutar ? (n === 1 ? tl2(x.toplamKurus) : `${tl2(x.aylikKurus)} / ay`) : "—"}</span>
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
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${kanal === k ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                      >
                        {etiket("kanal", k)}
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
                        className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${gun === g ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                      >
                        {g} gün
                      </button>
                    ))}
                  </div>
                </div>
                {kanal === "SMS" && (
                  <Alan id="bn-hedef-tel" etiket="Gönderilecek telefon" hata={h("hedef")} ipucu={m.iletisim.tel ? "Müşterinin kayıtlı telefonu önerildi." : undefined}>
                    <input id="bn-hedef-tel" type="tel" inputMode="tel" placeholder="05XX XXX XX XX" value={tel} onChange={(e) => setHedef({ ...hedef, tel: e.target.value })} aria-invalid={h("hedef") ? true : undefined} className={`${inputCls(h("hedef"))} tabular-nums`} />
                  </Alan>
                )}
                {kanal === "EPOSTA" && (
                  <Alan id="bn-hedef-eposta" etiket="Gönderilecek e-posta" hata={h("hedef")} ipucu={m.iletisim.email ? "Müşterinin kayıtlı e-postası önerildi." : undefined}>
                    <input id="bn-hedef-eposta" type="email" value={email} onChange={(e) => setHedef({ ...hedef, email: e.target.value })} aria-invalid={h("hedef") ? true : undefined} className={inputCls(h("hedef"))} />
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
                ["Müşteri türü", etiket("musteriTuru", tur)],
                [m.cariEtiketi, cariAdi ? cariAdi.ad : "—"],
                ["Vade profili", profil ? `${profil.ad.replace("Vade Farkı ", "")} · ${yuzde(profil.oranYuzde, 2)}` : "—"],
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
                ["Gönderim", kanal === "SMS" ? tel || "SMS" : kanal === "EPOSTA" ? email || "E-posta" : "Link kopyalanacak"],
                ["Son geçerlilik", tarih(sonTarih.toISOString())],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                  <dd className="truncate text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5">
              <span className="text-[12px] font-semibold text-[var(--brand-text)]">Link tutarı</span>
              <span className="text-[18px] font-extrabold tabular-nums text-[var(--fg)]">{gecerliTutar ? tl2(tutarKurus) : "—"}</span>
            </div>
            <p className="mt-2 text-[11.5px] text-[var(--muted)]">Vade farkı, müşterinin seçtiği taksite göre ödeme sayfasında eklenir.</p>

            {!kendiKarti && (
              <div className="mt-3">
                <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[12px] leading-snug ${h("faturaBeyani") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
                  <input type="checkbox" checked={beyan} onChange={(e) => setBeyan(e.target.checked)} aria-invalid={h("faturaBeyani") ? true : undefined} aria-describedby={h("faturaBeyani") ? "bn-beyan-hata" : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
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

            {(sunucuMesaji || (denendi && Object.keys(hatalar).length > 0)) && (
              <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
                {sunucuMesaji || `${Object.keys(hatalar).length} alanı kontrol edin.`}
              </p>
            )}

            <button
              type="submit"
              disabled={olustur.isPending}
              className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] text-[13.5px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}
            >
              <I name="link" size={15} />
              {olustur.isPending ? "Oluşturuluyor…" : kanal === "LINK" ? "Link Oluştur" : `Link Oluştur ve ${etiket("kanal", kanal)} Gönder`}
            </button>
          </aside>
        </form>
      )}

      {/* son linkler — GET /odeme-linkleri */}
      <section ref={listeRef} style={{ "--i": 4 }} className={`bn-rise mt-3 scroll-mt-20 overflow-hidden ${CARD} hover:!translate-y-0`} aria-labelledby="bn-linkler-title" aria-busy={linkler.isFetching}>
        <div className="px-4 py-3">
          <h2 id="bn-linkler-title" className="text-sm font-bold text-[var(--fg)]">
            Son Ödeme Linkleri
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{linkler.data ? `${satirlar.length} link · bekleyen linkleri yeniden kopyalayabilirsiniz` : "Yükleniyor…"}</p>
        </div>
        {linkler.isPending ? (
          <Yukleniyor satir={4} baslik={false} />
        ) : linkler.isError ? (
          <HataKutusu hata={linkler.error} onTekrar={() => linkler.refetch()} />
        ) : (
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
                  <tr key={l.linkNo} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                    <td className={`${td} font-bold text-[var(--brand-text)]`}>
                      {l.linkNo}
                      {yeniler.includes(l.linkNo) && <span className="ml-1.5 rounded-full bg-[var(--success-soft)] px-1.5 py-px text-[10px] font-bold text-[var(--success-text)]">Yeni</span>}
                    </td>
                    <td className={`${td} tabular-nums`}>
                      <span className="block text-[var(--fg-2)]">{tarihSaat(l.olusturma)}</span>
                      <span className="block text-[11px] text-[var(--muted)]">son {tarihSaat(l.sonGecerlilik)}</span>
                    </td>
                    {olusturanGoster && <td className={`${td} text-[var(--fg-2)]`}>{l.olusturan?.unvan}</td>}
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{l.musteriUnvan}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{etiket("musteriTuru", l.musteriTuru)}</span>
                    </td>
                    <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(l.tutarKurus)}</td>
                    <td className={`${td} text-[var(--fg-2)]`}>{etiket("kanal", l.kanal)}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${l.durum === "BEKLIYOR" ? "bg-[var(--brand-soft)] text-[var(--brand-text)]" : durumTonu(l.durum)}`}>{etiket("linkDurumu", l.durum)}</span>
                    </td>
                    <td className={`${td} text-right`}>{l.durum === "BEKLIYOR" && <KopyalaDugmesi kucuk metin={l.url} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {satirlar.length === 0 && <BosDurum baslik="Henüz ödeme linki yok" aciklama="Yukarıdaki formla oluşturduğunuz linkler ve ödeme durumları burada listelenir." ikon="link" />}
          </div>
        )}
      </section>
    </>
  );
}

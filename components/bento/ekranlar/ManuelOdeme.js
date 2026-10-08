// Ödeme Al › Manuel Ödeme. Şartname s.6 (tahsilat ekranları), s.5 (taksit sınırı, işlem bazlı limit, ortaklar),
// s.4 (vade farkı profili), s.9 (müşteri kartında fatura beyanı).
// Veri: GET /odeme/taksit-secenekleri (taksit, limit, vade farkı sunucuda) · POST /odemeler (kart tokenı ile; kart no gönderilmez)
import { useState } from "react";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { kartTokenla } from "@/lib/api/odemeler";
import { kurusCoz, taksitMetni, tl, tl2, yuzde } from "@/lib/bicim";
import { etiket } from "@/lib/etiketler";
import { useOdemeYap, useTaksitSecenekleri } from "@/lib/sorgular/odeme";
import { HataKutusu } from "../durumlar";
import { LISTELI, MusteriBolumu, hataBaglayici, useMusteriSecimi } from "../odeme";
import { Konum, inputCls, Alan, FormBolum } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { rakamlar, useGecikmeli } from "../yardimci";

export function ManuelOdeme({ role, meta, onNavigate, onerilenCari }) {
  const m = useMusteriSecimi(role, onerilenCari);
  const { tur, secili, kendi, kendiKarti, cariAdi } = m;
  const [tutarMetni, setTutarMetni] = useState("");
  const [taksit, setTaksit] = useState(null); // null → listenin ilk seçeneği
  const [aciklama, setAciklama] = useState("");
  const [kart, setKart] = useState({ isim: "", no: "", skt: "", cvv: "" });
  const [beyan, setBeyan] = useState(false);
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const [tokenlaniyor, setTokenlaniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);
  const odeme = useOdemeYap();

  const tutarKurus = kurusCoz(tutarMetni);
  const gecerliTutar = Number.isFinite(tutarKurus) && tutarKurus > 0;
  // taksit tablosu tutar yazılırken her tuşta değil, yazma durunca istenir
  const gecikmeliTutar = useGecikmeli(gecerliTutar ? tutarKurus : "");
  const kosul = useTaksitSecenekleri({ tutarKurus: gecikmeliTutar || undefined, musteriTuru: tur, musteriCariNo: LISTELI.has(tur) ? secili?.cariNo : undefined });
  const taksitler = kosul.data?.taksitler || [];
  const limit = kosul.data?.limitKurus || null;
  const profil = kosul.data?.vadeProfil || null;
  // bayinin tek çekimi kapalı olabilir: varsayılan, sunucunun açtığı ilk seçenek
  const secilenTaksit = taksitler.includes(taksit) ? taksit : taksitler[0] ?? 1;
  const secenek = (n) => kosul.data?.secenekler.find((s) => s.taksit === n) || { taksit: n, vadeFarkiKurus: 0, toplamKurus: gecerliTutar ? tutarKurus : 0, aylikKurus: 0 };
  const ozet = secenek(secilenTaksit);

  const kartIsmi = kendiKarti ? kendi : kart.isim;

  // doğrulama (müşteri alanları kancadan); anahtarlar sunucu alan adlarıyla aynı
  const hatalar = { ...m.hatalar };
  if (!gecerliTutar) hatalar.tutarKurus = "Tutar girin.";
  else if (limit && tutarKurus > limit) hatalar.tutarKurus = `İşlem bazlı ödeme limiti ${tl(limit)}.`;
  if (!kartIsmi.trim()) hatalar.kartIsmi = "Kart üzerindeki ismi girin.";
  if (rakamlar(kart.no).length !== 16) hatalar.kartNo = "16 haneli kart numarasını girin.";
  const [ay, yil] = kart.skt.split("/").map((x) => Number(x));
  const simdi = new Date();
  const yy = simdi.getFullYear() % 100;
  if (!(ay >= 1 && ay <= 12 && (yil > yy || (yil === yy && ay >= simdi.getMonth() + 1)))) hatalar.sonKullanma = "AA/YY biçiminde geçerli bir tarih girin.";
  if (rakamlar(kart.cvv).length !== 3) hatalar.cvv = "3 haneli güvenlik kodu.";
  if (!kendiKarti && !beyan) hatalar.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
  const h = hataBaglayici(denendi, hatalar, sunucuHatalari);
  const gonderiliyor = tokenlaniyor || odeme.isPending;

  const gonder = async (e) => {
    e.preventDefault();
    setDenendi(true);
    setSunucuMesaji(null);
    setSunucuHatalari({});
    if (Object.keys(hatalar).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-manuel [aria-invalid="true"]')?.focus());
      return;
    }
    try {
      // kart numarası sunucuya gitmez: önce (demo) tokenlaştırılır
      setTokenlaniyor(true);
      const tok = await kartTokenla({ no: kart.no, isim: kartIsmi.trim(), sonKullanma: kart.skt });
      setTokenlaniyor(false);
      const cevap = await odeme.mutateAsync({
        ...m.govde(),
        tutarKurus,
        taksit: secilenTaksit,
        aciklama: aciklama.trim() || undefined,
        kart: { token: tok.token, son4: tok.son4, isim: tok.isim },
        faturaBeyani: kendiKarti ? undefined : beyan,
      });
      setSonuc(cevap);
    } catch (err) {
      setTokenlaniyor(false);
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) {
        setSunucuHatalari(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-manuel [aria-invalid="true"]')?.focus());
      } else setSunucuMesaji(err?.message || "Ödeme alınamadı.");
    }
  };
  const yeniOdeme = () => {
    m.sifirla();
    setTutarMetni("");
    setTaksit(null);
    setAciklama("");
    setKart({ isim: "", no: "", skt: "", cvv: "" });
    setBeyan(false);
    setDenendi(false);
    setSunucuHatalari({});
    setSunucuMesaji(null);
    setSonuc(null);
  };

  const baslik = (
    <div className="bn-rise mb-4 px-1">
      <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", "Manuel Ödeme"]} />
      <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Manuel Ödeme</h1>
      <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{meta.company} · Kart bilgisiyle tahsilat</p>
    </div>
  );

  if (m.hata) {
    return (
      <>
        {baslik}
        <div className={`${CARD} hover:!translate-y-0`}>
          <HataKutusu hata={m.hata} />
        </div>
      </>
    );
  }

  if (sonuc) {
    const basarili = sonuc.durum === "BASARILI";
    const satirlar = [
      ["İşlem No", sonuc.islemNo],
      ["Müşteri", `${sonuc.musteri.unvan} · ${etiket("musteriTuru", sonuc.musteriTuru)}`],
      [m.cariEtiketi, sonuc.tahsilatCarisi ? `${sonuc.tahsilatCarisi.ad} — ${sonuc.tahsilatCarisi.cariNo}` : "—"],
      ["Kart", `**** ${sonuc.kart.son4} · ${sonuc.kart.isim}`],
      ["Taksit", sonuc.taksit === 1 ? "Tek çekim" : `${sonuc.taksit} taksit × ${tl2(sonuc.aylikKurus)}`],
      ["Tutar", tl2(sonuc.tutarKurus)],
      ["Vade farkı", tl2(sonuc.vadeFarkiKurus)],
    ];
    return (
      <>
        {baslik}
        <section className={`bn-pop mx-auto max-w-xl p-5 text-center sm:p-7 ${CARD} hover:!translate-y-0`} aria-live="polite">
          <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${basarili ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--danger-soft)] text-[var(--danger-text)]"}`}>
            <I name={basarili ? "check" : "x"} size={26} strokeWidth={2.4} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-[var(--fg)]">{basarili ? "Ödeme alındı" : "Ödeme alınamadı"}</h2>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">{basarili ? "Karttan çekilen toplam" : sonuc.redNedeni || "Banka işlemi onaylamadı."}</p>
          {basarili && <p className="mt-1 text-[28px] font-extrabold tabular-nums tracking-tight text-[var(--fg)]">{tl2(sonuc.toplamKurus)}</p>}
          <dl className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] text-left text-[12.5px]">
            {satirlar.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          {sonuc.faturaGerekli && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] px-3 py-2 text-left text-[12px] font-medium text-[var(--warning-text)]">
              <I name="info" size={15} className="mt-px shrink-0" />
              Bu işlemin faturasını Raporlar › Fatura Yükleme Detay ekranından yüklemeyi unutmayın.
            </p>
          )}
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={yeniOdeme} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}>
              <I name="plus" size={15} />
              {basarili ? "Yeni Ödeme" : "Yeniden Dene"}
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/raporlar/islem-detaylari")}
              className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              İşlem Detayları
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {baslik}
      <form id="bn-manuel" noValidate onSubmit={gonder} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start" aria-busy={gonderiliyor}>
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* 1 — müşteri */}
          <FormBolum no={1} i={0} baslik="Müşteri" aciklama="Müşteri türünü seçin; tanımlı müşteriler listeden gelir.">
            <MusteriBolumu role={role} m={m} h={h} />
          </FormBolum>

          {/* 2 — tutar ve taksit */}
          <FormBolum
            no={2}
            i={1}
            baslik="Tutar ve Taksit"
            aciklama={limit ? "Taksit seçenekleri bayi tanımındaki taksit sınırına göre gösterilir." : "Bayiden tahsilatta o bayinin vade farkı profili uygulanır."}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Alan id="bn-tutar" etiket="Tutar" hata={h("tutarKurus")} ipucu={limit ? `İşlem bazlı ödeme limiti: ${tl(limit)}` : undefined}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                  <input
                    id="bn-tutar"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={tutarMetni}
                    onChange={(e) => setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""))}
                    onBlur={() => gecerliTutar && setTutarMetni(tl(tutarKurus, { kurusGoster: true, isaret: false }))}
                    aria-invalid={h("tutarKurus") ? true : undefined}
                    className={`${inputCls(h("tutarKurus"))} pl-7 text-[15px] font-bold tabular-nums`}
                  />
                </div>
              </Alan>
              <Alan id="bn-aciklama" etiket="Açıklama (isteğe bağlı)">
                <input id="bn-aciklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Örn. Eylül faturası" className={inputCls()} />
              </Alan>
            </div>

            <div role="radiogroup" aria-label="Taksit" aria-busy={kosul.isFetching} className={`mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6 transition-opacity ${kosul.isFetching ? "opacity-70" : ""}`}>
              {kosul.isPending && [1, 2, 3].map((i) => <div key={i} className="h-[62px] animate-pulse rounded-xl bg-[var(--soft)] motion-reduce:animate-none" />)}
              {taksitler.map((n) => {
                const x = secenek(n);
                const secik = secilenTaksit === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={secik}
                    onClick={() => setTaksit(n)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${secik ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"} ${FOCUS}`}
                  >
                    <span className={`block text-[12.5px] font-bold ${secik ? "text-[var(--brand-text)]" : "text-[var(--fg)]"}`}>{n === 1 ? "Tek Çekim" : `${n} Taksit`}</span>
                    <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--muted)]">{gecerliTutar ? (n === 1 ? tl2(x.toplamKurus) : `${tl2(x.aylikKurus)} / ay`) : "—"}</span>
                  </button>
                );
              })}
            </div>
            {h("taksit") && <p className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">{h("taksit")}</p>}
          </FormBolum>

          {/* 3 — kart */}
          <FormBolum no={3} i={2} baslik="Kart Bilgileri" aciklama="Kart numarası sunucuya gönderilmez; ödeme sağlayıcısında tokenlaşır (demo'da taklit edilir).">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Alan id="bn-kart-isim" etiket="Kart üzerindeki isim" hata={h("kartIsmi")} ipucu={kendiKarti ? "Kendi kartında seçilen kişiden otomatik gelir, değiştirilemez." : undefined} className="col-span-2">
                <div className="relative">
                  <input
                    id="bn-kart-isim"
                    value={kartIsmi}
                    readOnly={kendiKarti}
                    onChange={(e) => setKart({ ...kart, isim: e.target.value })}
                    aria-invalid={h("kartIsmi") ? true : undefined}
                    autoComplete="cc-name"
                    className={`${inputCls(h("kartIsmi"))} ${kendiKarti ? "pr-9" : ""}`}
                  />
                  {kendiKarti && <I name="lock" size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />}
                </div>
              </Alan>
              <Alan id="bn-kart-no" etiket="Kart numarası" hata={h("kartNo")} className="col-span-2">
                <div className="relative">
                  <I name="card" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    id="bn-kart-no"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={kart.no}
                    onChange={(e) => setKart({ ...kart, no: rakamlar(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })}
                    aria-invalid={h("kartNo") ? true : undefined}
                    autoComplete="cc-number"
                    className={`${inputCls(h("kartNo"))} pl-9 tabular-nums`}
                  />
                </div>
              </Alan>
              <Alan id="bn-skt" etiket="Son kullanma" hata={h("sonKullanma")}>
                <input
                  id="bn-skt"
                  inputMode="numeric"
                  placeholder="AA/YY"
                  value={kart.skt}
                  onChange={(e) => {
                    const r = rakamlar(e.target.value).slice(0, 4);
                    setKart({ ...kart, skt: r.length > 2 ? `${r.slice(0, 2)}/${r.slice(2)}` : r });
                  }}
                  aria-invalid={h("sonKullanma") ? true : undefined}
                  autoComplete="cc-exp"
                  className={`${inputCls(h("sonKullanma"))} tabular-nums`}
                />
              </Alan>
              <Alan id="bn-cvv" etiket="Güvenlik kodu" hata={h("cvv")}>
                <input
                  id="bn-cvv"
                  inputMode="numeric"
                  placeholder="CVV"
                  value={kart.cvv}
                  onChange={(e) => setKart({ ...kart, cvv: rakamlar(e.target.value).slice(0, 3) })}
                  aria-invalid={h("cvv") ? true : undefined}
                  autoComplete="cc-csc"
                  className={`${inputCls(h("cvv"))} tabular-nums`}
                />
              </Alan>
            </div>
          </FormBolum>
        </div>

        {/* özet + onay */}
        <aside style={{ "--i": 3 }} className={`bn-rise p-4 sm:p-5 lg:sticky lg:top-[76px] ${CARD} hover:!translate-y-0`} aria-label="Ödeme özeti">
          <h2 className="text-sm font-bold text-[var(--fg)]">Ödeme Özeti</h2>
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
              ["Tutar", gecerliTutar ? tl2(tutarKurus) : "—"],
              ["Taksit", secilenTaksit === 1 ? "Tek çekim" : `${secilenTaksit} × ${gecerliTutar ? tl2(ozet.aylikKurus) : "—"}`],
              ["Vade farkı", gecerliTutar ? tl2(ozet.vadeFarkiKurus) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="text-right font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5">
            <span className="text-[12px] font-semibold text-[var(--brand-text)]">Karttan çekilecek</span>
            <span className="text-[18px] font-extrabold tabular-nums text-[var(--fg)]">{gecerliTutar ? tl2(ozet.toplamKurus) : "—"}</span>
          </div>

          {!kendiKarti && (
            <div className="mt-3">
              <label className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-[12px] leading-snug ${h("faturaBeyani") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
                <input
                  type="checkbox"
                  checked={beyan}
                  onChange={(e) => setBeyan(e.target.checked)}
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

          {(sunucuMesaji || (denendi && Object.keys(hatalar).length > 0)) && (
            <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
              {sunucuMesaji || `${Object.keys(hatalar).length} alanı kontrol edin.`}
            </p>
          )}

          <button
            type="submit"
            disabled={gonderiliyor}
            className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] text-[13.5px] font-bold text-white transition [box-shadow:0_10px_22px_-12px_rgba(12,52,231,0.9)] hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}
          >
            {gonderiliyor ? (
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

export { taksitMetni };

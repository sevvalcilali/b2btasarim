// Ödeme Al › USD / Euro Kur Bilgisi — şartname s.2: gösterge kurları ve TL karşılığı hesabı. Veri: GET /kurlar
import { useState } from "react";
import { tarihSaat, tl2, yuzde } from "@/lib/bicim";
import { useKurlar } from "@/lib/sorgular/kurlar";
import { HataKutusu, YukleniyorKutu } from "../durumlar";
import { Alan, Konum, inputCls } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { TrendArrow } from "../yardimci";

const kur4 = (n) => Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const tutarCoz = (s) => Number(String(s).replace(/\./g, "").replace(",", "."));

export function KurBilgisi({ meta, onNavigate }) {
  const sorgu = useKurlar();
  const kurlar = sorgu.data?.kayitlar || [];
  const [tutar, setTutar] = useState("1.000");
  const [kod, setKod] = useState("USD");
  const secili = kurlar.find((k) => k.kod === kod) || kurlar[0];
  const doviz = tutarCoz(tutar);
  const gecerli = Number.isFinite(doviz) && doviz > 0 && secili;

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", "USD / Euro Kur Bilgisi"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">USD / Euro Kur Bilgisi</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · {sorgu.data ? `${sorgu.data.kaynak} · ${tarihSaat(sorgu.data.guncelleme)}` : "Yükleniyor…"} · Tahsilat TL yapılır; kurlar bilgilendirme amaçlıdır
        </p>
      </div>

      {sorgu.isPending ? (
        <YukleniyorKutu />
      ) : sorgu.isError ? (
        <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Kurlar">
            {kurlar.map((k, i) => {
              const artis = k.degisimYuzde >= 0;
              return (
                <li key={k.kod} style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[12px] font-extrabold text-[var(--brand-text)]">{k.kod}</span>
                      <div>
                        <h2 className="text-sm font-bold text-[var(--fg)]">{k.ad}</h2>
                        <p className="text-[11.5px] text-[var(--muted)]">1 {k.kod} = ₺ {kur4(k.satis)} satış</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${artis ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--danger-soft)] text-[var(--danger-text)]"}`}>
                      <TrendArrow up={artis} />
                      {yuzde(Math.abs(k.degisimYuzde), 2)}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      ["Alış", k.alis],
                      ["Satış", k.satis],
                    ].map(([ad, deger]) => (
                      <div key={ad} className="rounded-xl bg-[var(--soft)] px-3 py-2.5">
                        <dt className="text-[11px] font-semibold text-[var(--muted)]">{ad}</dt>
                        <dd className="mt-0.5 text-[18px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)]">₺ {kur4(deger)}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>

          <section style={{ "--i": kurlar.length }} className={`bn-rise mt-3 p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby="bn-kur-hesap">
            <h2 id="bn-kur-hesap" className="text-sm font-bold text-[var(--fg)]">
              TL karşılığı
            </h2>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">Dövizli tutarı satış kuru ile TL'ye çevirir; ödeme ekranına bu tutarı girersiniz.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <Alan id="bn-kur-tutar" etiket="Döviz tutarı">
                <div className="flex gap-2">
                  <input
                    id="bn-kur-tutar"
                    inputMode="decimal"
                    value={tutar}
                    onChange={(e) => setTutar(e.target.value.replace(/[^\d.,]/g, ""))}
                    className={`${inputCls()} min-w-0 font-bold tabular-nums`}
                  />
                  <select aria-label="Para birimi" value={secili?.kod || ""} onChange={(e) => setKod(e.target.value)} className={`${inputCls()} !w-24 shrink-0 font-bold`}>
                    {kurlar.map((k) => (
                      <option key={k.kod} value={k.kod}>
                        {k.kod}
                      </option>
                    ))}
                  </select>
                </div>
              </Alan>
              <span className="hidden pb-2.5 text-[var(--muted)] sm:block" aria-hidden="true">
                =
              </span>
              <div>
                <p className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">TL karşılığı · satış {secili ? kur4(secili.satis) : "—"}</p>
                <output htmlFor="bn-kur-tutar" className="block h-10 rounded-xl bg-[var(--brand-soft)] px-3 text-[17px] font-extrabold leading-10 tabular-nums text-[var(--brand-text)]">
                  {gecerli ? tl2(Math.round(doviz * secili.satis * 100)) : "—"}
                </output>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {["100", "1.000", "5.000", "10.000"].map((t) => (
                <button key={t} type="button" onClick={() => setTutar(t)} aria-pressed={tutar === t} className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] tabular-nums transition ${tutar === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}>
                  {t}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

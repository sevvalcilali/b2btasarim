// Ödeme Al › USD / Euro Kur Bilgisi — şartname s.2: gösterge kurları ve TL karşılığı hesabı. Veri: GET /kurlar
import { useState } from "react";
import { formatDateTime, tl2, formatPercent } from "@/lib/format";
import { useRates } from "@/lib/queries/rates";
import { ErrorBox, LoadingBox } from "../states";
import { Field, Breadcrumb, inputCls } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";
import { TrendArrow } from "../helpers";

const rate4 = (n) => Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const parseAmount = (s) => Number(String(s).replace(/\./g, "").replace(",", "."));

export function ExchangeRates({ meta, onNavigate }) {
  const query = useRates();
  const rates = query.data?.kayitlar || [];
  const [amount, setAmount] = useState("1.000");
  const [code, setCode] = useState("USD");
  const selected = rates.find((k) => k.kod === code) || rates[0];
  const currency = parseAmount(amount);
  const valid = Number.isFinite(currency) && currency > 0 && selected;

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Breadcrumb onHome={() => onNavigate(HOME)} path={["Ödeme Al", "USD / Euro Kur Bilgisi"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">USD / Euro Kur Bilgisi</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · {query.data ? `${query.data.kaynak} · ${formatDateTime(query.data.guncelleme)}` : "Yükleniyor…"} · Tahsilat TL yapılır; kurlar bilgilendirme amaçlıdır
        </p>
      </div>

      {query.isPending ? (
        <LoadingBox />
      ) : query.isError ? (
        <ErrorBox error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Kurlar">
            {rates.map((k, i) => {
              const increase = k.degisimYuzde >= 0;
              return (
                <li key={k.kod} style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[12px] font-extrabold text-[var(--brand-text)]">{k.kod}</span>
                      <div>
                        <h2 className="text-sm font-bold text-[var(--fg)]">{k.ad}</h2>
                        <p className="text-[11.5px] text-[var(--muted)]">1 {k.kod} = ₺ {rate4(k.satis)} satış</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${increase ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--danger-soft)] text-[var(--danger-text)]"}`}>
                      <TrendArrow up={increase} />
                      {formatPercent(Math.abs(k.degisimYuzde), 2)}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      ["Alış", k.alis],
                      ["Satış", k.satis],
                    ].map(([name, value]) => (
                      <div key={name} className="rounded-xl bg-[var(--soft)] px-3 py-2.5">
                        <dt className="text-[11px] font-semibold text-[var(--muted)]">{name}</dt>
                        <dd className="mt-0.5 text-[18px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)]">₺ {rate4(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>

          <section style={{ "--i": rates.length }} className={`bn-rise mt-3 p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby="bn-kur-hesap">
            <h2 id="bn-kur-hesap" className="text-sm font-bold text-[var(--fg)]">
              TL karşılığı
            </h2>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">Dövizli tutarı satış kuru ile TL'ye çevirir; ödeme ekranına bu tutarı girersiniz.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <Field id="bn-kur-tutar" label="Döviz tutarı">
                <div className="flex gap-2">
                  <input
                    id="bn-kur-tutar"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
                    className={`${inputCls()} min-w-0 font-bold tabular-nums`}
                  />
                  <select aria-label="Para birimi" value={selected?.kod || ""} onChange={(e) => setCode(e.target.value)} className={`${inputCls()} !w-24 shrink-0 font-bold`}>
                    {rates.map((k) => (
                      <option key={k.kod} value={k.kod}>
                        {k.kod}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
              <span className="hidden pb-2.5 text-[var(--muted)] sm:block" aria-hidden="true">
                =
              </span>
              <div>
                <p className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">TL karşılığı · satış {selected ? rate4(selected.satis) : "—"}</p>
                <output htmlFor="bn-kur-tutar" className="block h-10 rounded-xl bg-[var(--brand-soft)] px-3 text-[17px] font-extrabold leading-10 tabular-nums text-[var(--brand-text)]">
                  {valid ? tl2(Math.round(currency * selected.satis * 100)) : "—"}
                </output>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {["100", "1.000", "5.000", "10.000"].map((t) => (
                <button key={t} type="button" onClick={() => setAmount(t)} aria-pressed={amount === t} className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] tabular-nums transition ${amount === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}>
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

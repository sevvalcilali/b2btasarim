// Raporlar › Bayi Fatura Özet / Alt Bayi Fatura Özet — şartname s.2 ve s.9: firma başına fatura gereken, yüklenen,
// bekleyen ve reddedilen işlem sayısı ile bekleyen tutar. Veri: GET /raporlar/bayi-fatura-ozet
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { sayi, tl, yuzde } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useBayiFaturaOzeti } from "@/lib/sorgular/raporlar";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { Konum } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";

const DONEMLER = [
  ["7g", "Son 7 gün"],
  ["30g", "Son 30 gün"],
  ["tumu", "Tümü"],
];

export function BayiFaturaOzet({ role, meta, onNavigate }) {
  const altMi = role === ROLES.BAYI;
  const baslik = altMi ? "Alt Bayi Fatura Özet" : "Bayi Fatura Özet";
  const [donem, setDonem] = useState("30g");
  const sorgu = useBayiFaturaOzeti({ donem });
  const veri = sorgu.data;
  const satirlar = veri?.kayitlar || [];
  const toplam = veri?.toplam;
  /** Fatura gereken işlem yoksa oran yok (null): çubuk boş, yüzde "—" */
  const tamamlanma = (s) => (s.gereken ? (s.yuklenen / s.gereken) * 100 : null);
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["Raporlar", baslik]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{baslik}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {altMi ? "Sizin ve alt bayilerinizin fatura yükleme durumu" : "Bayi ve alt bayi bazında fatura yükleme durumu"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("/raporlar/fatura-yukleme")}
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] md:self-auto ${FOCUS}`}
        >
          <I name="receipt" size={14} />
          Fatura Yükleme Detay
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Fatura gereken işlem", value: toplam ? sayi(toplam.gereken) : "—", wrap: "bg-[var(--brand-soft)]", ink: "text-[var(--brand-text)]" },
          { label: "Yüklenen", value: toplam ? sayi(toplam.yuklenen) : "—", wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]" },
          { label: "Bekleyen / reddedilen", value: toplam ? `${sayi(toplam.bekleyen)} / ${sayi(toplam.reddedilen)}` : "—", wrap: "bg-[var(--warning-soft)]", ink: "text-[var(--warning-text)]" },
          { label: "Bekleyen tutar", value: toplam ? tl(toplam.bekleyenKurus) : "—", wrap: "border border-[var(--border)] bg-[var(--surface)]", ink: "text-[var(--brand-text)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className={`mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px] ${sorgu.isFetching ? "opacity-60" : ""}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 4 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label={baslik} aria-busy={sorgu.isFetching}>
        <div role="group" aria-label="Dönem" className="flex gap-1 p-3 sm:p-4">
          {DONEMLER.map(([kod, ad]) => (
            <button
              key={kod}
              type="button"
              onClick={() => setDonem(kod)}
              aria-pressed={donem === kod}
              className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] transition ${donem === kod ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
            >
              {ad}
            </button>
          ))}
        </div>

        {sorgu.isPending ? (
          <Yukleniyor satir={5} baslik={false} />
        ) : sorgu.isError ? (
          <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
        ) : (
          <div className={`relative overflow-x-auto transition-opacity ${sorgu.isFetching ? "opacity-60" : ""}`}>
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th scope="col" className={th}>Firma</th>
                  <th scope="col" className={`${th} text-right`}>Gereken</th>
                  <th scope="col" className={`${th} text-right`}>Yüklenen</th>
                  <th scope="col" className={`${th} text-right`}>Bekleyen</th>
                  <th scope="col" className={`${th} text-right`}>Reddedilen</th>
                  <th scope="col" className={`${th} text-right`}>Bekleyen Tutar</th>
                  <th scope="col" className={`${th} min-w-[180px]`}>Tamamlanma</th>
                  <th scope="col" className={th}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map((s, i) => {
                  const oran = tamamlanma(s);
                  const acik = s.bekleyen + s.reddedilen > 0;
                  return (
                    <tr key={s.firma.firmaId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{s.firma.unvan}</span>
                        <span className="block text-[11px] text-[var(--muted)]">
                          {etiket("firmaTuru", s.firma.tur)}
                          {s.bagli && s.bagli.tur !== "ANA_FIRMA" ? ` · ${s.bagli.unvan}` : ""}
                        </span>
                      </td>
                      <td className={`${td} text-right tabular-nums text-[var(--fg-2)]`}>{sayi(s.gereken)}</td>
                      <td className={`${td} text-right tabular-nums text-[var(--success-text)]`}>{sayi(s.yuklenen)}</td>
                      <td className={`${td} text-right tabular-nums ${s.bekleyen ? "font-bold text-[var(--warning-text)]" : "text-[var(--muted)]"}`}>{sayi(s.bekleyen)}</td>
                      <td className={`${td} text-right tabular-nums ${s.reddedilen ? "font-bold text-[var(--danger-text)]" : "text-[var(--muted)]"}`}>{sayi(s.reddedilen)}</td>
                      <td className={`${td} text-right font-bold tabular-nums ${acik ? "text-[var(--fg)]" : "text-[var(--muted)]"}`}>{acik ? tl(s.bekleyenKurus) : "—"}</td>
                      <td className={td}>
                        <span className="flex items-center gap-2">
                          <span className="block h-1.5 w-28 overflow-hidden rounded-full bg-[var(--soft-2)]" role="progressbar" aria-valuenow={Math.round(oran ?? 0)} aria-valuemin={0} aria-valuemax={100} aria-label="Fatura tamamlanma oranı">
                            <span className={`bn-fill block h-full rounded-full ${oran === 100 ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} style={{ width: `${oran ?? 0}%` }} />
                          </span>
                          <span className="text-[11px] font-semibold tabular-nums text-[var(--fg-2)]">{oran === null ? "—" : yuzde(oran, 0)}</span>
                        </span>
                      </td>
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(s.durum)}`}>{etiket("kayitDurumu", s.durum)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {toplam && satirlar.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--soft)] font-bold">
                    <td className={`${td} text-[var(--fg)]`}>Toplam · {sayi(toplam.firmaAdet)} firma</td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg)]`}>{sayi(toplam.gereken)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--success-text)]`}>{sayi(toplam.yuklenen)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--warning-text)]`}>{sayi(toplam.bekleyen)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--danger-text)]`}>{sayi(toplam.reddedilen)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg)]`}>{tl(toplam.bekleyenKurus)}</td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{toplam.gereken ? yuzde(tamamlanma(toplam), 0) : "—"}</td>
                    <td className={td} />
                  </tr>
                </tfoot>
              )}
            </table>
            {satirlar.length === 0 && <BosDurum baslik="Bu dönemde fatura gereken işlem yok" ikon="check" tonu="success" />}
          </div>
        )}
      </section>
    </>
  );
}

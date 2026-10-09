// Ödeme Al › Ana Firma Bakiye ve Borç (bayi) / Bayi Bakiye ve Borç (alt bayi) — şartname s.2: üst cari karşısındaki
// kullanılabilir bakiye, güncel borç, limit ve hareketler. Veri: GET /bakiye/ekstre
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import { tarihSaat, tl, yuzde } from "@/lib/format";
import { etiket } from "@/lib/labels";
import { useBakiyeEkstresi } from "@/lib/queries/balance";
import { BosDurum, HataKutusu, Yukleniyor } from "../states";
import { aralikSorgusu, donemAraligi } from "@/lib/period";
import { Konum, TarihAraligi, YazdirDugmesi } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";
import { Money } from "../helpers";

const HAREKET_TONU = {
  BORC: "bg-[var(--warning-soft)] text-[var(--warning-text)]",
  ODEME: "bg-[var(--success-soft)] text-[var(--success-text)]",
  IADE: "bg-[var(--danger-soft)] text-[var(--danger-text)]",
  IPTAL: "bg-[var(--danger-soft)] text-[var(--danger-text)]",
};

export function BakiyeBorc({ role, meta, onNavigate }) {
  const baslik = role === ROLES.ALT_BAYI ? "Bayi Bakiye ve Borç" : "Ana Firma Bakiye ve Borç";
  const [aralik, setAralik] = useState(() => donemAraligi("30g"));
  const sorgu = useBakiyeEkstresi(aralikSorgusu(aralik));
  const veri = sorgu.data;
  const hareketler = veri?.hareketler || [];
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", baslik]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{baslik}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {veri ? `${veri.ustCari.unvan} carisi · güncelleme ${tarihSaat(veri.sonGuncelleme)}` : "Yükleniyor…"}
          </p>
        </div>
        <YazdirDugmesi />
      </div>

      {sorgu.isPending ? (
        <Yukleniyor satir={4} />
      ) : sorgu.isError ? (
        <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <section style={{ "--i": 0 }} className="bn-rise relative overflow-hidden rounded-2xl bg-[#0C34E7] p-4 text-white sm:p-5" aria-label="Kullanılabilir bakiye">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#D4D1FC] opacity-25 blur-2xl" aria-hidden="true" />
              <p className="relative text-[12px] font-medium text-white/75">Kullanılabilir Bakiye</p>
              <p className="relative mt-2 text-[26px] font-extrabold leading-none tracking-tight tabular-nums">
                <Money kurus={veri.bakiyeKurus} />
              </p>
              <p className="relative mt-3 text-[11.5px] text-white/70">{veri.ustCari.unvan} carisinde kullanabileceğiniz tutar</p>
            </section>
            <section style={{ "--i": 1 }} className={`bn-rise p-4 sm:p-5 ${CARD}`} aria-label="Güncel borç">
              <p className="text-[12px] font-semibold text-[var(--danger-text)]">Güncel Borç</p>
              <p className="mt-2 text-[26px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)]">{tl(veri.borcKurus)}</p>
              <p className="mt-3 text-[11.5px] text-[var(--muted)]">Borç yüklemeleri eksi yaptığınız ödemeler</p>
            </section>
            <section style={{ "--i": 2 }} className={`bn-rise p-4 sm:p-5 ${CARD}`} aria-label="Ödeme limiti">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-semibold text-[var(--brand-text)]">Ödeme Limiti</p>
                <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[var(--brand-text)]">{yuzde(veri.kullanimYuzde, 0)}</span>
              </div>
              <p className="mt-2 text-[26px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)]">{tl(veri.limitKurus)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--brand-soft)]" role="progressbar" aria-valuenow={veri.kullanimYuzde} aria-valuemin={0} aria-valuemax={100} aria-label="Limit kullanımı">
                <div className="bn-fill h-full rounded-full bg-[linear-gradient(90deg,var(--chart-from),var(--chart-to))]" style={{ width: `${veri.kullanimYuzde}%` }} />
              </div>
            </section>
          </div>

          <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Hareketler" aria-busy={sorgu.isFetching}>
            <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-sm font-bold text-[var(--fg)]">Hareketler</h2>
              <TarihAraligi deger={aralik} onChange={setAralik} />
            </div>
            {hareketler.length === 0 ? (
              <BosDurum baslik="Bu dönemde hareket yok" ikon="check" tonu="success" eylemler={[aralik.kod !== "90g" && { etiket: "Son 90 günü göster", onClick: () => setAralik(donemAraligi("90g")) }]} />
            ) : (
              <div className={`overflow-x-auto transition-opacity ${sorgu.isFetching ? "opacity-60" : ""}`}>
                <table className="min-w-full text-[12.5px]">
                  <thead>
                    <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      <th scope="col" className={th}>Tarih</th>
                      <th scope="col" className={th}>Açıklama</th>
                      <th scope="col" className={th}>Tür</th>
                      <th scope="col" className={`${th} text-right`}>Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hareketler.map((h, i) => (
                      <tr key={h.hareketId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                        <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{tarihSaat(h.tarih)}</td>
                        <td className={`${td} !whitespace-normal`}>
                          <span className="block font-semibold text-[var(--fg)]">{h.aciklama}</span>
                          {h.islemNo && <span className="block text-[11px] tabular-nums text-[var(--muted)]">{h.islemNo}</span>}
                        </td>
                        <td className={td}>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${HAREKET_TONU[h.tur] || ""}`}>{etiket("hareketTuru", h.tur)}</span>
                        </td>
                        <td className={`${td} text-right font-bold tabular-nums ${h.tutarKurus < 0 ? "text-[var(--success-text)]" : "text-[var(--fg)]"}`}>
                          {h.tutarKurus < 0 ? "−" : "+"}
                          {tl(Math.abs(h.tutarKurus))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--soft)] text-[12px] font-bold">
                      <td className={`${td} text-[var(--fg)]`} colSpan={3}>
                        Dönem toplamı
                      </td>
                      <td className={`${td} text-right tabular-nums`}>
                        <span className="block text-[var(--warning-text)]">+{tl(veri.donemToplami.borcKurus)} borç</span>
                        <span className="block text-[var(--success-text)]">−{tl(veri.donemToplami.odemeKurus)} ödeme</span>
                        {veri.donemToplami.iadeIptalKurus > 0 && <span className="block text-[var(--danger-text)]">+{tl(veri.donemToplami.iadeIptalKurus)} iade / iptal</span>}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

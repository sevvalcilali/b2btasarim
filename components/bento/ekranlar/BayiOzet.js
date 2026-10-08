// Raporlar › Bayi Özet / Alt Bayi Özet — şartname s.7: müşteri türü filtresi; işlem adedi, tutar, vade farkı, hesaba
// geçecek tutar; ana firma tüm bayi / alt bayileri, bayi kendisini ve alt bayilerini görür. Veri: GET /raporlar/bayi-ozet
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { sayi, tl, tlKisa, yuzde } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useBayiOzeti } from "@/lib/sorgular/raporlar";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { Konum } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";

const DONEMLER = [
  ["7g", "Son 7 gün"],
  ["30g", "Son 30 gün"],
  ["tumu", "Tümü"],
];

export function BayiOzet({ role, meta, onNavigate }) {
  const altMi = role === ROLES.BAYI;
  const baslik = altMi ? "Alt Bayi Özet" : "Bayi Özet";
  const [donem, setDonem] = useState("30g");
  const [musteriTuru, setMusteriTuru] = useState("");
  const sorgu = useBayiOzeti({ donem, musteriTuru: musteriTuru || undefined });
  const veri = sorgu.data;
  const satirlar = veri?.kayitlar || [];
  const toplam = veri?.toplam;
  const enYuksek = Math.max(1, ...satirlar.map((s) => s.ciroKurus));
  const basariOrani = (s) => (s.islemAdet ? (s.basariliAdet / s.islemAdet) * 100 : 0);
  const secimCls = (aktif) =>
    `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${aktif ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["Raporlar", baslik]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{baslik}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {altMi ? "Sizin ve alt bayilerinizin ciro özeti" : "Bayi ve alt bayi bazında ciro özeti"}
          </p>
        </div>
        <button
          type="button"
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] md:self-auto ${FOCUS}`}
        >
          <I name="download" size={14} />
          Dışa Aktar
        </button>
      </div>

      {/* dönem toplamları — sunucudan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "İşlem", value: toplam ? `${sayi(toplam.islemAdet)} · ${sayi(toplam.basariliAdet)} başarılı` : "—", wrap: "bg-[var(--brand-soft)]", ink: "text-[var(--brand-text)]" },
          { label: "Ciro (başarılı)", value: toplam ? tl(toplam.ciroKurus) : "—", wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]" },
          { label: "Vade farkı", value: toplam ? tl(toplam.vadeFarkiKurus) : "—", wrap: "border border-[var(--border)] bg-[var(--surface)]", ink: "text-[var(--brand-text)]" },
          { label: "Hesaba geçecek", value: toplam ? tl(toplam.hesabaGececekKurus) : "—", wrap: "bg-[linear-gradient(135deg,#0C34E7,#0A23A8)] text-white", ink: "text-white/80", vurgu: true },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className={`mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums sm:text-[19px] ${k.vurgu ? "text-white" : "text-[var(--fg)]"} ${sorgu.isFetching ? "opacity-60" : ""}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 4 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label={baslik} aria-busy={sorgu.isFetching}>
        <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Dönem" className="flex gap-1">
            {DONEMLER.map(([kod, ad]) => (
              <button key={kod} type="button" onClick={() => setDonem(kod)} aria-pressed={donem === kod} className={secimCls(donem === kod)}>
                {ad}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Müşteri türü" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            <button type="button" onClick={() => setMusteriTuru("")} aria-pressed={musteriTuru === ""} className={secimCls(musteriTuru === "")}>
              Tüm müşteri türleri
            </button>
            {(veri?.musteriTurleri || []).map((m) => (
              <button key={m} type="button" onClick={() => setMusteriTuru(m)} aria-pressed={musteriTuru === m} className={secimCls(musteriTuru === m)}>
                {etiket("musteriTuru", m)}
              </button>
            ))}
          </div>
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
                  <th scope="col" className={th}>İşlem</th>
                  <th scope="col" className={`${th} min-w-[200px]`}>Ciro (başarılı)</th>
                  <th scope="col" className={`${th} text-right`}>Vade Farkı</th>
                  <th scope="col" className={`${th} text-right`}>İptal / İade</th>
                  <th scope="col" className={`${th} text-right`}>Hesaba Geçecek</th>
                  <th scope="col" className={th}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map((s, i) => (
                  <tr key={s.firma.firmaId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{s.firma.unvan}</span>
                      <span className="block text-[11px] text-[var(--muted)]">
                        {etiket("firmaTuru", s.firma.tur)}
                        {s.bagli && s.bagli.tur !== "ANA_FIRMA" ? ` · ${s.bagli.unvan}` : ""}
                        {s.vadeProfil ? ` · ${s.vadeProfil}` : ""}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="block font-semibold tabular-nums text-[var(--fg)]">{sayi(s.islemAdet)}</span>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                        {sayi(s.basariliAdet)} başarılı · {yuzde(basariOrani(s), 0)}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="block font-bold tabular-nums text-[var(--fg)]">{tl(s.ciroKurus)}</span>
                      {/* ciro payı: en yüksek ciroya göre */}
                      <span className="mt-1.5 block h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-[var(--soft-2)]" aria-hidden="true">
                        <span className="bn-fill block h-full rounded-full bg-[linear-gradient(90deg,var(--chart-from),var(--chart-to))]" style={{ width: `${Math.max(2, (s.ciroKurus / enYuksek) * 100)}%` }} />
                      </span>
                    </td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg-2)]`}>{tl(s.vadeFarkiKurus)}</td>
                    <td className={`${td} text-right tabular-nums ${s.iptalIadeKurus ? "text-[var(--danger-text)]" : "text-[var(--muted)]"}`}>{s.iptalIadeKurus ? `− ${tl(s.iptalIadeKurus)}` : "—"}</td>
                    <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(s.hesabaGececekKurus)}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(s.durum)}`}>{etiket("kayitDurumu", s.durum)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {toplam && satirlar.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--soft)] font-bold">
                    <td className={`${td} text-[var(--fg)]`}>Toplam · {sayi(toplam.firmaAdet)} firma</td>
                    <td className={`${td} tabular-nums text-[var(--fg)]`}>{sayi(toplam.islemAdet)}</td>
                    <td className={`${td} tabular-nums text-[var(--fg)]`}>{tl(toplam.ciroKurus)}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--fg)]`}>{tl(toplam.vadeFarkiKurus)}</td>
                    <td className={`${td} text-right tabular-nums ${toplam.iptalIadeKurus ? "text-[var(--danger-text)]" : "text-[var(--muted)]"}`}>{toplam.iptalIadeKurus ? `− ${tl(toplam.iptalIadeKurus)}` : "—"}</td>
                    <td className={`${td} text-right tabular-nums text-[var(--brand-text)]`}>{tl(toplam.hesabaGececekKurus)}</td>
                    <td className={td} />
                  </tr>
                </tfoot>
              )}
            </table>
            {satirlar.length === 0 && <BosDurum baslik="Bu dönemde işlem yok" />}
          </div>
        )}

        <p className="flex items-start gap-1.5 border-t border-[var(--border)] px-4 py-2.5 text-[11.5px] text-[var(--muted)]">
          <I name="info" size={13} className="mt-px shrink-0" />
          Hesaba geçecek tutar = başarılı ciro + vade farkı − iptal/iade (demo varsayımı; kesin hesap backend'de). Özet {tlKisa(toplam?.ciroKurus || 0)} ciro üzerinden.
        </p>
      </section>
    </>
  );
}

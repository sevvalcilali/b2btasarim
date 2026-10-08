// Raporlar › İşlem Detayları — veri: GET /islemler (filtre, arama ve rol kapsamı sunucuda)
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { sayi, tarihSaat, taksitMetni, tl } from "@/lib/bicim";
import { ETIKET, durumTonu, etiket } from "@/lib/etiketler";
import { useIslemler } from "@/lib/sorgular/islemler";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { csvIndir, csvTutar } from "@/lib/disaAktar";
import { SiraliBaslik, siralamaDegistir } from "../tablo";
import { aralikSorgusu } from "@/lib/donem";
import { Konum, TarihAraligi } from "../ortak";
import { CARD, FOCUS } from "../tema";
import { useGecikmeli } from "../yardimci";

const DURUM_SEKMELERI = ["TUMU", "BASARILI", "BASARISIZ", "IPTAL", "IADE"];

const KAPSAM = {
  [ROLES.ANA_FIRMA]: "Tüm bayi ve alt bayi işlemleri",
  [ROLES.BAYI]: "Kendi ve alt bayi işlemleri",
  [ROLES.ALT_BAYI]: "Kendi işlemleri",
};

function musteriTuruTonu(tur) {
  if (tur === "BAYI" || tur === "ALT_BAYI") return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  if (tur === "KENDI_KARTI") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (tur === "DUZENSIZ_MUSTERI" || tur === "MUSTERI_KARTI") return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
  return "bg-[var(--soft-2)] text-[var(--fg-2)]";
}

export function IslemDetaylari({ role, meta, onHome }) {
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("TUMU");
  const [odemeTipi, setOdemeTipi] = useState("");
  const [musteriTuru, setMusteriTuru] = useState("");
  const [aralik, setAralik] = useState(null); // null: tüm geçmiş
  const q = useGecikmeli(arama.trim());
  const [siralama, setSiralama] = useState({ alan: "tarih", yon: "desc" }); // sayfalı liste: sıralama sunucuda
  const sirala = (alan) => setSiralama((s) => siralamaDegistir(s, alan, alan === "islemNo" ? "asc" : "desc"));

  const sorgu = useIslemler({ durum: durum === "TUMU" ? undefined : durum, musteriTuru: musteriTuru || undefined, odemeTipi: odemeTipi || undefined, q: q || undefined, ...aralikSorgusu(aralik), sira: `${siralama.alan}:${siralama.yon}` });
  const veri = sorgu.data;
  const satirlar = veri?.kayitlar || [];
  const adet = (d) => veri?.sayaclar?.[d] ?? "–";

  // alt bayi yalnızca kendi işlemlerini gördüğü için "çekim yapan" sütunu ona gösterilmez
  const yapanGoster = role !== ROLES.ALT_BAYI;
  const filtreVar = arama !== "" || durum !== "TUMU" || odemeTipi !== "" || musteriTuru !== "" || aralik !== null;
  const temizle = () => {
    setArama("");
    setDurum("TUMU");
    setOdemeTipi("");
    setMusteriTuru("");
    setAralik(null);
  };
  const selectCls = `h-9 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[12.5px] font-medium text-[var(--fg-2)] ${FOCUS}`;
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={onHome} yol={["Raporlar", "İşlem Detayları"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">İşlem Detayları</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {KAPSAM[role]}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            csvIndir(
              "islem-detaylari",
              ["İşlem No", "Tarih", "Çekim Yapan", "Müşteri Türü", "Unvan", "Cari No", "Vergi No", "Ödeme", "Taksit", "Tutar (TL)", "Durum"],
              satirlar.map((t) => [t.islemNo, tarihSaat(t.tarih), t.cekimYapan?.unvan, etiket("musteriTuru", t.musteriTuru), t.musteri.unvan, t.musteri.cariNo, t.musteri.vergiNo, ETIKET.odemeTipi[t.odemeTipi], t.taksit, csvTutar(t.tutarKurus), etiket("islemDurumu", t.durum)])
            )
          }
          disabled={satirlar.length === 0}
          title="Görünen sayfayı CSV olarak indirir"
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-50 md:self-auto ${FOCUS}`}
        >
          <I name="download" size={14} />
          Dışa Aktar
        </button>
      </div>

      {/* filtrelenen işlemlerin özeti — sunucudan (sayfadan bağımsız) */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "İşlem", value: veri ? sayi(veri.toplam) : "—", ink: "text-[var(--brand-text)]", wrap: "bg-[var(--brand-soft)]" },
          { label: "Toplam tutar", value: veri ? tl(veri.ozet.toplamKurus) : "—", ink: "text-[var(--brand-text)]", wrap: "border border-[var(--border)] bg-[var(--surface)]" },
          { label: "Başarılı tutar", value: veri ? tl(veri.ozet.basariliKurus) : "—", ink: "text-[var(--success-text)]", wrap: "bg-[var(--success-soft)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className={`mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px] ${sorgu.isFetching ? "opacity-60" : ""}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İşlem listesi" aria-busy={sorgu.isFetching}>
        {/* filtreler */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div role="group" aria-label="Durum" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            {DURUM_SEKMELERI.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurum(d)}
                aria-pressed={durum === d}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  durum === d ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {d === "TUMU" ? "Tümü" : etiket("islemDurumu", d)}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${durum === d ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {adet(d)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative block sm:w-60">
              <span className="sr-only">İşlem ara</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <I name="search" size={14} />
              </span>
              <input
                type="search"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="İşlem no, unvan, cari, vergi no"
                className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
              />
            </label>
            <select aria-label="Müşteri türü" value={musteriTuru} onChange={(e) => setMusteriTuru(e.target.value)} className={selectCls}>
              <option value="">Tüm müşteri türleri</option>
              {(veri?.musteriTurleri || []).map((m) => (
                <option key={m} value={m}>
                  {etiket("musteriTuru", m)}
                </option>
              ))}
            </select>
            <select aria-label="Ödeme tipi" value={odemeTipi} onChange={(e) => setOdemeTipi(e.target.value)} className={selectCls}>
              <option value="">Tüm ödeme tipleri</option>
              <option value="MANUEL">Manuel ödeme</option>
              <option value="LINK">Link ile ödeme</option>
            </select>
          </div>
        </div>
        <div className="border-t border-[var(--border)] px-3 py-2.5 sm:px-4">
          <TarihAraligi deger={aralik} onChange={setAralik} tumu />
        </div>

        {sorgu.isPending ? (
          <Yukleniyor satir={6} baslik={false} />
        ) : sorgu.isError ? (
          <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${sorgu.isFetching ? "opacity-60" : ""}`}>
              <table className="min-w-full text-[12.5px]">
                <thead>
                  <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <SiraliBaslik alan="islemNo" siralama={siralama} onSirala={sirala} className={th}>İşlem No</SiraliBaslik>
                    <SiraliBaslik alan="tarih" siralama={siralama} onSirala={sirala} className={th}>Tarih</SiraliBaslik>
                    {yapanGoster && <th scope="col" className={th}>Çekim Yapan</th>}
                    <th scope="col" className={th}>Müşteri Türü</th>
                    <th scope="col" className={th}>Unvan / Cari No</th>
                    <th scope="col" className={th}>Vergi No</th>
                    <th scope="col" className={th}>Ödeme</th>
                    <SiraliBaslik alan="tutarKurus" siralama={siralama} onSirala={sirala} className={`${th} text-right`}>Tutar</SiraliBaslik>
                    <th scope="col" className={th}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {satirlar.map((t, i) => (
                    <tr key={t.islemNo} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                      <td className={`${td} font-bold text-[var(--brand-text)]`}>{t.islemNo}</td>
                      <td className={`${td} tabular-nums text-[var(--muted)]`}>{tarihSaat(t.tarih)}</td>
                      {yapanGoster && (
                        <td className={td}>
                          <span className="block font-semibold text-[var(--fg-2)]">{t.cekimYapan?.unvan}</span>
                          <span className="block text-[11px] text-[var(--muted)]">{etiket("firmaTuru", t.cekimYapan?.tur)}</span>
                        </td>
                      )}
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${musteriTuruTonu(t.musteriTuru)}`}>{etiket("musteriTuru", t.musteriTuru)}</span>
                      </td>
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{t.musteri.unvan}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.musteri.cariNo}</span>
                      </td>
                      <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{t.musteri.vergiNo}</td>
                      <td className={td}>
                        <span className="flex items-center gap-1 tabular-nums text-[var(--fg-2)]">
                          <I name={t.odemeTipi === "LINK" ? "link" : "wallet"} size={13} className="text-[var(--muted)]" />
                          **** {t.kart.son4}
                        </span>
                        <span className="block text-[11px] text-[var(--muted)]">
                          {ETIKET.odemeTipi[t.odemeTipi]} · {taksitMetni(t.taksit)}
                        </span>
                      </td>
                      <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(t.tutarKurus)}</td>
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(t.durum)}`}>{etiket("islemDurumu", t.durum)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {satirlar.length === 0 && (
                <BosDurum baslik="Bu filtrelere uyan işlem yok">
                  <button type="button" onClick={temizle} className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                    Filtreleri temizle
                  </button>
                </BosDurum>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2.5 text-[11.5px] text-[var(--muted)]">
              <span>
                {sayi(veri.sayaclar.TUMU)} işlemden <b className="font-bold text-[var(--fg-2)]">{sayi(veri.toplam)}</b> tanesi gösteriliyor
                {veri.toplam > satirlar.length && ` (ilk ${satirlar.length})`}
              </span>
              {filtreVar && satirlar.length > 0 && (
                <button type="button" onClick={temizle} className={`rounded-full font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                  Filtreleri temizle
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}

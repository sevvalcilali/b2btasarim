import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { rolIslemleri, firmaTuru } from "../ag";
import { Konum } from "../ortak";
import { CARD, FOCUS } from "../tema";
import { pillTone, parseAmount } from "../yardimci";

// ---- Raporlar › İşlem Detayları ------------------------------------------------------------
const DURUMLAR = ["Tümü", "Başarılı", "Başarısız", "İptal", "İade"];

const TIPLER = ["Tümü", "Manuel", "Link"];

const MUSTERI_TURLERI = ["Bayi", "Alt Bayi", "Düzenli Müşteri", "Düzensiz Müşteri", "Kendi Kartı"];

const KAPSAM = {
  [ROLES.ANA_FIRMA]: "Tüm bayi ve alt bayi işlemleri",
  [ROLES.BAYI]: "Kendi ve alt bayi işlemleri",
  [ROLES.ALT_BAYI]: "Kendi işlemleri",
};

function musteriTuruTone(tur) {
  if (tur === "Bayi" || tur === "Alt Bayi") return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  if (tur === "Kendi Kartı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (tur === "Düzensiz Müşteri") return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
  return "bg-[var(--soft-2)] text-[var(--fg-2)]";
}

export function IslemDetaylari({ role, meta, onHome }) {
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("Tümü");
  const [tip, setTip] = useState("Tümü");
  const [tur, setTur] = useState("Tümü");

  const kaynak = rolIslemleri(role);
  // alt bayi yalnızca kendi işlemlerini gördüğü için "çekim yapan" sütunu ona gösterilmez
  const yapanGoster = role !== ROLES.ALT_BAYI;
  const turler = MUSTERI_TURLERI.filter((m) => kaynak.some((t) => t.musteriTuru === m));

  const kucuk = (x) => x.toLocaleLowerCase("tr-TR");
  const aranan = kucuk(arama.trim());
  // durum sekmelerindeki adetler diğer filtrelere göre güncellenir
  const adaylar = kaynak.filter(
    (t) =>
      (tip === "Tümü" || t.tip === tip) &&
      (tur === "Tümü" || t.musteriTuru === tur) &&
      (!aranan || [t.id, t.musteri, t.cari, t.vergiNo, t.kart, t.yapan].some((f) => kucuk(f).includes(aranan)))
  );
  const satirlar = adaylar.filter((t) => durum === "Tümü" || t.durum === durum);
  const adet = (d) => (d === "Tümü" ? adaylar.length : adaylar.filter((t) => t.durum === d).length);
  const toplamTutar = satirlar.reduce((a, t) => a + parseAmount(t.tutar), 0);
  const basariliTutar = satirlar.filter((t) => t.durum === "Başarılı").reduce((a, t) => a + parseAmount(t.tutar), 0);
  const filtreVar = arama !== "" || durum !== "Tümü" || tip !== "Tümü" || tur !== "Tümü";
  const temizle = () => {
    setArama("");
    setDurum("Tümü");
    setTip("Tümü");
    setTur("Tümü");
  };
  const tl = (n) => `₺ ${n.toLocaleString("tr-TR")}`;
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
          className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition active:scale-[0.97] hover:border-[var(--brand)] hover:text-[var(--brand-text)] md:self-auto ${FOCUS}`}
        >
          <I name="download" size={14} />
          Dışa Aktar
        </button>
      </div>

      {/* filtrelenen işlemlerin özeti */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "İşlem", value: satirlar.length.toLocaleString("tr-TR"), ink: "text-[var(--brand-text)]", wrap: "bg-[var(--brand-soft)]" },
          { label: "Toplam tutar", value: tl(toplamTutar), ink: "text-[var(--brand-text)]", wrap: "border border-[var(--border)] bg-[var(--surface)]" },
          { label: "Başarılı tutar", value: tl(basariliTutar), ink: "text-[var(--success-text)]", wrap: "bg-[var(--success-soft)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className="mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px]">{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İşlem listesi">
        {/* filtreler */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div role="group" aria-label="Durum" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            {DURUMLAR.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurum(d)}
                aria-pressed={durum === d}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  durum === d ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {d}
                <span
                  className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${
                    durum === d ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
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
            <select aria-label="Müşteri türü" value={tur} onChange={(e) => setTur(e.target.value)} className={selectCls}>
              <option value="Tümü">Tüm müşteri türleri</option>
              {turler.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select aria-label="Ödeme tipi" value={tip} onChange={(e) => setTip(e.target.value)} className={selectCls}>
              {TIPLER.map((t) => (
                <option key={t} value={t}>
                  {t === "Tümü" ? "Tüm ödeme tipleri" : t === "Link" ? "Link ile ödeme" : "Manuel ödeme"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th scope="col" className={th}>İşlem No</th>
                <th scope="col" className={th}>Tarih</th>
                {yapanGoster && <th scope="col" className={th}>Çekim Yapan</th>}
                <th scope="col" className={th}>Müşteri Türü</th>
                <th scope="col" className={th}>Unvan / Cari No</th>
                <th scope="col" className={th}>Vergi No</th>
                <th scope="col" className={th}>Ödeme</th>
                <th scope="col" className={`${th} text-right`}>Tutar</th>
                <th scope="col" className={th}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((t, i) => (
                <tr key={t.id} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                  <td className={`${td} font-bold text-[var(--brand-text)]`}>{t.id}</td>
                  <td className={`${td} tabular-nums text-[var(--muted)]`}>{t.tarih}</td>
                  {yapanGoster && (
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg-2)]">{t.yapan}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{firmaTuru(t.yapan)}</span>
                    </td>
                  )}
                  <td className={td}>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${musteriTuruTone(t.musteriTuru)}`}>{t.musteriTuru}</span>
                  </td>
                  <td className={td}>
                    <span className="block font-semibold text-[var(--fg)]">{t.musteri}</span>
                    <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.cari}</span>
                  </td>
                  <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{t.vergiNo}</td>
                  <td className={td}>
                    <span className="flex items-center gap-1 tabular-nums text-[var(--fg-2)]">
                      <I name={t.tip === "Link" ? "link" : "wallet"} size={13} className="text-[var(--muted)]" />
                      {t.kart}
                    </span>
                    <span className="block text-[11px] text-[var(--muted)]">
                      {t.tip} · {t.taksit === "Tek Çekim" ? "Tek çekim" : `${t.taksit} taksit`}
                    </span>
                  </td>
                  <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{t.tutar}</td>
                  <td className={td}>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${pillTone(t.durum)}`}>{t.durum}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {satirlar.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--soft)] text-[var(--muted)]">
                <I name="search" size={16} />
              </span>
              <p className="text-[13px] font-bold text-[var(--fg)]">Bu filtrelere uyan işlem yok</p>
              <button type="button" onClick={temizle} className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                Filtreleri temizle
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2.5 text-[11.5px] text-[var(--muted)]">
          <span>
            {kaynak.length} işlemden <b className="font-bold text-[var(--fg-2)]">{satirlar.length}</b> tanesi gösteriliyor
          </span>
          {filtreVar && satirlar.length > 0 && (
            <button type="button" onClick={temizle} className={`rounded-full font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
              Filtreleri temizle
            </button>
          )}
        </div>
      </section>
    </>
  );
}

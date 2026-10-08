// Raporlar › Fatura Yükleme Detay. Şartname s.9: kendi kartı olmayan bayi / alt bayi işlemlerinde kart sahibi ile
// aradaki fatura yüklenir; yüklenmemişler liste halinde görülür. Yüklenen fatura şeklen kontrol edilip alınır,
// uygun olmayan alınmaz. Fatura içeriği bayiye ve ana firmaya gösterilmez. s.10: fatura link üzerinden de yüklenebilir.
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { rolIslemleri, firmaTuru } from "../ag";
import { Konum, Pencere, Bildirim, inputCls, Alan, KopyalaDugmesi } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { parseAmount, tutarCoz, tarihSaat } from "../yardimci";

const FATURA_LINKI = "https://link.nkolayislem.com.tr/fatura/";
const DOSYA_TURLERI = ["pdf", "jpg", "jpeg", "png"];
const EN_BUYUK_DOSYA = 5 * 1024 * 1024;

// Fatura gereken işlemler: bayi / alt bayi çekimi, kendi kartı olmayan, başarılı
export function faturaGerekenler(role) {
  return rolIslemleri(role).filter((t) => firmaTuru(t.yapan) !== "Ana Firma" && t.musteriTuru !== "Kendi Kartı" && t.durum === "Başarılı");
}

// İşlemin fatura durumu: kaydı yoksa "Bekliyor"
export function faturaDurumu(faturalar, islemId) {
  const kayit = faturalar.find((f) => f.islemId === islemId);
  return { kayit, durum: kayit ? kayit.durum : "Bekliyor" };
}

function faturaTone(durum) {
  if (durum === "Yüklendi") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Reddedildi") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
}

const SEKMELER = [
  { ad: "Yüklenmemiş", f: (d) => d !== "Yüklendi" },
  { ad: "Yüklenen", f: (d) => d === "Yüklendi" },
  { ad: "Tümü", f: () => true },
];

// "29.09.2026 15:33" → Date (gün başlangıcı)
const gunTarihi = (metin) => {
  const [g, a, y] = metin.slice(0, 10).split(".").map(Number);
  return new Date(y, a - 1, g);
};

function FaturaYukle({ islem, onKaydet, onClose }) {
  const islemTutari = parseAmount(islem.tutar);
  const [faturaNo, setFaturaNo] = useState("");
  const [tarih, setTarih] = useState("");
  const [tutarMetni, setTutarMetni] = useState(islemTutari.toLocaleString("tr-TR"));
  const [dosya, setDosya] = useState(null);
  const [denendi, setDenendi] = useState(false);

  // şeklen kontrol: alanlar, fatura no biçimi, tarih, tutar, dosya türü ve boyutu
  const hatalar = {};
  if (!/^[A-Z0-9]{3}\d{13}$/.test(faturaNo)) hatalar.no = "Fatura no 16 karakter olmalı (ör. ANK2026000000412).";
  if (!tarih) hatalar.tarih = "Fatura tarihini girin.";
  else if (new Date(tarih) < gunTarihi(islem.tarih)) hatalar.tarih = "Fatura tarihi işlem tarihinden önce olamaz.";
  if (tutarCoz(tutarMetni) !== islemTutari) hatalar.tutar = `Fatura tutarı işlem tutarıyla (₺ ${islemTutari.toLocaleString("tr-TR")}) aynı olmalı.`;
  const uzanti = dosya?.name.split(".").pop().toLowerCase();
  if (!dosya) hatalar.dosya = "Fatura dosyasını seçin.";
  else if (!DOSYA_TURLERI.includes(uzanti)) hatalar.dosya = "Uygun değil: yalnızca PDF, JPG ya da PNG yüklenebilir.";
  else if (dosya.size > EN_BUYUK_DOSYA) hatalar.dosya = "Uygun değil: dosya en fazla 5 MB olabilir.";
  const h = (k) => (denendi ? hatalar[k] : undefined);

  const kaydet = (e) => {
    e.preventDefault();
    setDenendi(true);
    if (Object.keys(hatalar).length > 0) return;
    const [y, a, g] = tarih.split("-");
    onKaydet({
      islemId: islem.id,
      faturaNo,
      faturaTarihi: `${g}.${a}.${y}`,
      tutar: islem.tutar,
      dosya: dosya.name,
      yukleme: tarihSaat(new Date()),
      durum: "Yüklendi",
    });
  };

  return (
    <Pencere baslik="Fatura Yükle" altBaslik={`${islem.id} · ${islem.musteri} · ${islem.tutar}`} onClose={onClose} genislik="max-w-lg">
      <form noValidate onSubmit={kaydet} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Alan id="bn-f-no" etiket="Fatura no" hata={h("no")} className="sm:col-span-2">
            <input
              id="bn-f-no"
              value={faturaNo}
              maxLength={16}
              onChange={(e) => setFaturaNo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ANK2026000000412"
              aria-invalid={h("no") ? true : undefined}
              className={`${inputCls(h("no"))} tabular-nums`}
            />
          </Alan>
          <Alan id="bn-f-tarih" etiket="Fatura tarihi" hata={h("tarih")}>
            <input id="bn-f-tarih" type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} aria-invalid={h("tarih") ? true : undefined} className={inputCls(h("tarih"))} />
          </Alan>
          <Alan id="bn-f-tutar" etiket="Fatura tutarı" hata={h("tutar")}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
              <input
                id="bn-f-tutar"
                inputMode="decimal"
                value={tutarMetni}
                onChange={(e) => setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""))}
                aria-invalid={h("tutar") ? true : undefined}
                className={`${inputCls(h("tutar"))} pl-7 font-bold tabular-nums`}
              />
            </div>
          </Alan>
        </div>

        <div>
          <label
            htmlFor="bn-f-dosya"
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition hover:border-[var(--brand)] hover:bg-[var(--soft)] ${
              h("dosya") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"
            }`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <I name={dosya ? "check" : "receipt"} size={18} />
            </span>
            <span className="text-[13px] font-bold text-[var(--fg)]">{dosya ? dosya.name : "Fatura dosyasını seçin"}</span>
            <span className="text-[11.5px] text-[var(--muted)]">
              {dosya ? `${Math.max(1, Math.round(dosya.size / 1024)).toLocaleString("tr-TR")} KB · değiştirmek için tıklayın` : "PDF, JPG ya da PNG · en fazla 5 MB"}
            </span>
            <input
              id="bn-f-dosya"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDosya(e.target.files?.[0] || null)}
              aria-invalid={h("dosya") ? true : undefined}
              aria-describedby={h("dosya") ? "bn-f-dosya-hata" : undefined}
              className="sr-only"
            />
          </label>
          {h("dosya") && (
            <p id="bn-f-dosya-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
              {h("dosya")}
            </p>
          )}
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
          <I name="lock" size={14} className="mt-px shrink-0 text-[var(--brand-text)]" />
          Fatura şeklen kontrol edilip alınır; uygun olmayan fatura alınmaz. Fatura içeriği bayiniz ve ana firma ile paylaşılmaz.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
          >
            Vazgeç
          </button>
          <button type="submit" className={`inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            Yükle
          </button>
        </div>
      </form>
    </Pencere>
  );
}

export function FaturaYukleme({ role, meta, faturalar, setFaturalar, onNavigate }) {
  const firma = meta.company;
  const satirlarTum = faturaGerekenler(role).map((t) => ({ ...t, ...faturaDurumu(faturalar, t.id) }));
  const [sekme, setSekme] = useState(0);
  const [yukle, setYukle] = useState(null);
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);

  const satirlar = satirlarTum.filter((t) => SEKMELER[sekme].f(t.durum));
  const yapanGoster = role !== ROLES.ALT_BAYI;
  const bekleyen = satirlarTum.filter((t) => t.durum !== "Yüklendi");
  const kendiBekleyen = bekleyen.filter((t) => t.yapan === firma);
  const bekleyenTutar = bekleyen.reduce((a, t) => a + parseAmount(t.tutar), 0);

  const kaydet = (kayit) => {
    setFaturalar((l) => [...l.filter((f) => f.islemId !== kayit.islemId), kayit]);
    setYukle(null);
    setBildirim(`${kayit.islemId} faturası şeklen kontrol edildi ve alındı.`);
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={["Raporlar", "Fatura Yükleme Detay"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Fatura Yükleme Detay</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {firma} · {role === ROLES.ANA_FIRMA ? "Bayi ve alt bayilerin fatura durumu" : role === ROLES.BAYI ? "Sizin ve alt bayilerinizin fatura durumu" : "Faturası beklenen işlemleriniz"}
        </p>
      </div>

      <p className="bn-rise mb-3 flex items-start gap-2 rounded-2xl bg-[var(--brand-soft)] px-4 py-2.5 text-[12px] font-medium text-[var(--brand-text)]">
        <I name="info" size={14} className="mt-px shrink-0" />
        {role === ROLES.ANA_FIRMA
          ? "Kendi kartı olmayan bayi ve alt bayi işlemlerinde kart sahibiyle aradaki fatura yüklenmelidir. Faturaların içeriği size gösterilmez; yalnızca durumu izlenir."
          : "Kendi kartınız olmayan işlemlerde kart sahibiyle aranızdaki faturayı yükleyin. Yüklenen fatura şeklen kontrol edilip alınır; içeriği bayinize ve ana firmaya gösterilmez."}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Yüklenmemiş", value: bekleyen.length, wrap: "bg-[var(--warning-soft)]", ink: "text-[var(--warning-text)]" },
          { label: "Bekleyen tutar", value: `₺ ${bekleyenTutar.toLocaleString("tr-TR")}`, wrap: "border border-[var(--border)] bg-[var(--surface)]", ink: "text-[var(--brand-text)]" },
          { label: "Yüklenen", value: satirlarTum.length - bekleyen.length, wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className="mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px]">{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Fatura listesi">
        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div role="group" aria-label="Fatura durumu" className="flex gap-1 overflow-x-auto">
            {SEKMELER.map((s, i) => (
              <button
                key={s.ad}
                type="button"
                onClick={() => setSekme(i)}
                aria-pressed={sekme === i}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  sekme === i ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {s.ad}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${sekme === i ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {satirlarTum.filter((t) => s.f(t.durum)).length}
                </span>
              </button>
            ))}
          </div>
          {kendiBekleyen.length > 0 && (
            <p className="text-[12px] font-semibold text-[var(--warning-text)]">
              {kendiBekleyen.length} işleminizin faturası bekleniyor
            </p>
          )}
        </div>

        <div className="relative overflow-x-auto">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th scope="col" className={th}>İşlem</th>
                {yapanGoster && <th scope="col" className={th}>Çekim Yapan</th>}
                <th scope="col" className={th}>Kart Sahibi / Müşteri</th>
                <th scope="col" className={`${th} text-right`}>Tutar</th>
                <th scope="col" className={th}>Fatura</th>
                <th scope="col" className={th}>Durum</th>
                <th scope="col" className={th}>
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((t, i) => {
                const kendi = t.yapan === firma;
                return (
                  <tr key={t.id} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                    <td className={td}>
                      <span className="block font-bold text-[var(--brand-text)]">{t.id}</span>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.tarih}</span>
                    </td>
                    {yapanGoster && (
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg-2)]">{t.yapan}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{firmaTuru(t.yapan)}</span>
                      </td>
                    )}
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{t.musteri}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{t.musteriTuru}</span>
                    </td>
                    <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{t.tutar}</td>
                    <td className={td}>
                      {!t.kayit ? (
                        <span className="text-[var(--muted)]">—</span>
                      ) : kendi ? (
                        <>
                          <span className="flex items-center gap-1 font-semibold text-[var(--fg-2)]">
                            <I name="receipt" size={13} className="text-[var(--muted)]" />
                            {t.kayit.dosya}
                          </span>
                          <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                            {t.kayit.faturaNo} · {t.kayit.faturaTarihi}
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--muted)]" title="Fatura içeriği yalnızca yükleyen firmaya görünür">
                          <I name="lock" size={12} />
                          İçerik gizli
                        </span>
                      )}
                    </td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${faturaTone(t.durum)}`}>{t.durum}</span>
                      {t.durum === "Reddedildi" && t.kayit?.redNedeni && (
                        <span className="mt-0.5 block max-w-[220px] whitespace-normal text-[11px] leading-snug text-[var(--danger-text)]">{t.kayit.redNedeni}</span>
                      )}
                    </td>
                    <td className={`${td} text-right`}>
                      {t.durum !== "Yüklendi" &&
                        (kendi ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setYukle(t)}
                              className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--brand)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}
                            >
                              <I name="receipt" size={13} />
                              {t.durum === "Reddedildi" ? "Yeniden Yükle" : "Fatura Yükle"}
                            </button>
                            <span title="Faturayı link üzerinden yükletmek için linki kopyalayın">
                              <KopyalaDugmesi kucuk metin={`${FATURA_LINKI}${t.id.slice(4)}`} />
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBildirim(`${t.yapan} firmasına ${t.id} için fatura hatırlatması e-postayla gönderildi.`)}
                            className={`inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
                          >
                            <I name="bell" size={13} />
                            Hatırlat
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {satirlar.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success-text)]">
                <I name="check" size={18} />
              </span>
              <p className="text-[13px] font-bold text-[var(--fg)]">{sekme === 0 ? "Yüklenmemiş fatura yok" : "Kayıt yok"}</p>
            </div>
          )}
        </div>
      </section>

      {yukle && <FaturaYukle islem={yukle} onKaydet={kaydet} onClose={() => setYukle(null)} />}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

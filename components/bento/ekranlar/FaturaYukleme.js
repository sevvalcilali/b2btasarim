// Raporlar › Fatura Yükleme Detay — şartname s.9 (fatura yükleme, şeklen kontrol, gizlilik), s.10 (link üzerinden yükleme).
// Veri: GET /faturalar?durum= · POST /faturalar (multipart) · POST /faturalar/{islemNo}/hatirlatma · POST /faturalar/{islemNo}/yukleme-linki
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { kurusCoz, sayi, tarih, tarihSaat, tl } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useFaturaHatirlat, useFaturaYukle, useFaturaYuklemeLinki, useFaturalar } from "@/lib/sorgular/faturalar";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { Konum, Pencere, Bildirim, inputCls, Alan } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";

const SEKMELER = [
  ["YUKLENMEMIS", "Yüklenmemiş"],
  ["YUKLENEN", "Yüklenen"],
  ["TUMU", "Tümü"],
];

function FaturaYukle({ satir, onYuklendi, onClose }) {
  const { islem } = satir;
  const yukle = useFaturaYukle();
  const [faturaNo, setFaturaNo] = useState("");
  const [faturaTarihi, setFaturaTarihi] = useState("");
  const [tutarMetni, setTutarMetni] = useState(tl(islem.tutarKurus, { kurusGoster: true, isaret: false }));
  const [dosya, setDosya] = useState(null);
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);

  // hızlı ekran kontrolleri; asıl şeklen kontrol sunucuda (422 → alanlar)
  const hatalar = {};
  if (!/^[A-Z0-9]{3}\d{13}$/.test(faturaNo)) hatalar.faturaNo = "Fatura no 16 karakter olmalı (ör. ANK2026000000412).";
  if (!faturaTarihi) hatalar.faturaTarihi = "Fatura tarihini girin.";
  if (kurusCoz(tutarMetni) !== islem.tutarKurus) hatalar.tutarKurus = `Fatura tutarı işlem tutarıyla (${tl(islem.tutarKurus)}) aynı olmalı.`;
  if (!dosya) hatalar.dosya = "Fatura dosyasını seçin.";
  const h = (k) => sunucuHatalari[k] || (denendi ? hatalar[k] : undefined);

  const gonder = async (e) => {
    e.preventDefault();
    setDenendi(true);
    setSunucuHatalari({});
    setSunucuMesaji(null);
    if (Object.keys(hatalar).length > 0) return;
    try {
      await yukle.mutateAsync({ islemNo: islem.islemNo, faturaNo, faturaTarihi, tutarKurus: kurusCoz(tutarMetni), dosya });
      onYuklendi(islem.islemNo);
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) setSunucuHatalari(err.alanlar);
      else setSunucuMesaji(err?.message || "Fatura yüklenemedi.");
    }
  };

  return (
    <Pencere baslik="Fatura Yükle" altBaslik={`${islem.islemNo} · ${islem.musteri.unvan} · ${tl(islem.tutarKurus)}`} onClose={onClose} genislik="max-w-lg">
      <form noValidate onSubmit={gonder} className="space-y-3" aria-busy={yukle.isPending}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Alan id="bn-f-no" etiket="Fatura no" hata={h("faturaNo")} className="sm:col-span-2">
            <input
              id="bn-f-no"
              value={faturaNo}
              maxLength={16}
              onChange={(e) => {
                setFaturaNo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                setSunucuHatalari({});
              }}
              placeholder="ANK2026000000412"
              aria-invalid={h("faturaNo") ? true : undefined}
              className={`${inputCls(h("faturaNo"))} tabular-nums`}
            />
          </Alan>
          <Alan id="bn-f-tarih" etiket="Fatura tarihi" hata={h("faturaTarihi")}>
            <input
              id="bn-f-tarih"
              type="date"
              value={faturaTarihi}
              onChange={(e) => {
                setFaturaTarihi(e.target.value);
                setSunucuHatalari({});
              }}
              aria-invalid={h("faturaTarihi") ? true : undefined}
              className={inputCls(h("faturaTarihi"))}
            />
          </Alan>
          <Alan id="bn-f-tutar" etiket="Fatura tutarı" hata={h("tutarKurus")}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
              <input
                id="bn-f-tutar"
                inputMode="decimal"
                value={tutarMetni}
                onChange={(e) => {
                  setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""));
                  setSunucuHatalari({});
                }}
                aria-invalid={h("tutarKurus") ? true : undefined}
                className={`${inputCls(h("tutarKurus"))} pl-7 font-bold tabular-nums`}
              />
            </div>
          </Alan>
        </div>

        <div>
          <label
            htmlFor="bn-f-dosya"
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition hover:border-[var(--brand)] hover:bg-[var(--soft)] ${h("dosya") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <I name={dosya ? "check" : "receipt"} size={18} />
            </span>
            <span className="text-[13px] font-bold text-[var(--fg)]">{dosya ? dosya.name : "Fatura dosyasını seçin"}</span>
            <span className="text-[11.5px] text-[var(--muted)]">{dosya ? `${Math.max(1, Math.round(dosya.size / 1024)).toLocaleString("tr-TR")} KB · değiştirmek için tıklayın` : "PDF, JPG ya da PNG · en fazla 5 MB"}</span>
            <input
              id="bn-f-dosya"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                setDosya(e.target.files?.[0] || null);
                setSunucuHatalari({});
              }}
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
        {sunucuMesaji && (
          <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-semibold text-[var(--danger-text)]">
            {sunucuMesaji}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
            Vazgeç
          </button>
          <button type="submit" disabled={yukle.isPending} className={`inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            {yukle.isPending ? "Yükleniyor…" : "Yükle"}
          </button>
        </div>
      </form>
    </Pencere>
  );
}

// Yükleme linkini sunucudan alıp panoya kopyalar (şartname s.10)
function LinkKopyala({ islemNo, onBildirim }) {
  const link = useFaturaYuklemeLinki();
  const kopyala = async () => {
    try {
      const { url } = await link.mutateAsync(islemNo);
      await navigator.clipboard.writeText(url);
      onBildirim("Fatura yükleme linki kopyalandı.");
    } catch (err) {
      onBildirim(err?.message || "Link alınamadı.");
    }
  };
  return (
    <button type="button" onClick={kopyala} disabled={link.isPending} title="Faturayı link üzerinden yükletmek için linki kopyalayın" className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-[var(--soft)] px-2.5 text-[11.5px] font-bold text-[var(--brand-text)] transition hover:bg-[var(--soft-2)] disabled:opacity-60 ${FOCUS}`}>
      <I name="link" size={12} />
      {link.isPending ? "…" : "Kopyala"}
    </button>
  );
}

export function FaturaYukleme({ role, meta, onNavigate }) {
  const firma = meta.company;
  const [sekme, setSekme] = useState("YUKLENMEMIS");
  const [yukle, setYukle] = useState(null);
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const sorgu = useFaturalar({ durum: sekme });
  const hatirlat = useFaturaHatirlat();
  const veri = sorgu.data;
  const satirlar = veri?.kayitlar || [];
  const yapanGoster = role !== ROLES.ALT_BAYI;

  const hatirlatGonder = async (s) => {
    try {
      const sonuc = await hatirlat.mutateAsync(s.islem.islemNo);
      setBildirim(`${sonuc.firma.unvan} firmasına ${s.islem.islemNo} için fatura hatırlatması e-postayla gönderildi.`);
    } catch (err) {
      setBildirim(err?.message || "Hatırlatma gönderilemedi.");
    }
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
          { label: "Yüklenmemiş", value: veri ? sayi(veri.ozet.bekleyen) : "—", wrap: "bg-[var(--warning-soft)]", ink: "text-[var(--warning-text)]" },
          { label: "Bekleyen tutar", value: veri ? tl(veri.ozet.bekleyenKurus) : "—", wrap: "border border-[var(--border)] bg-[var(--surface)]", ink: "text-[var(--brand-text)]" },
          { label: "Yüklenen", value: veri ? sayi(veri.ozet.yuklenen) : "—", wrap: "bg-[var(--success-soft)]", ink: "text-[var(--success-text)]" },
        ].map((k, i) => (
          <div key={k.label} style={{ "--i": i }} className={`bn-rise rounded-2xl p-3 sm:p-4 ${k.wrap}`}>
            <p className={`text-[11.5px] font-semibold sm:text-[12.5px] ${k.ink}`}>{k.label}</p>
            <p className="mt-1.5 text-[15px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)] sm:text-[19px]">{k.value}</p>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise mt-3 overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Fatura listesi" aria-busy={sorgu.isFetching}>
        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div role="group" aria-label="Fatura durumu" className="flex gap-1 overflow-x-auto">
            {SEKMELER.map(([kod, ad]) => (
              <button
                key={kod}
                type="button"
                onClick={() => setSekme(kod)}
                aria-pressed={sekme === kod}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${sekme === kod ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
              >
                {ad}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${sekme === kod ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{veri?.sayaclar?.[kod] ?? "–"}</span>
              </button>
            ))}
          </div>
          {veri?.ozet.kendiBekleyen > 0 && <p className="text-[12px] font-semibold text-[var(--warning-text)]">{veri.ozet.kendiBekleyen} işleminizin faturası bekleniyor</p>}
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
                {satirlar.map((s, i) => {
                  const t = s.islem;
                  return (
                    <tr key={t.islemNo} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                      <td className={td}>
                        <span className="block font-bold text-[var(--brand-text)]">{t.islemNo}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{tarihSaat(t.tarih)}</span>
                      </td>
                      {yapanGoster && (
                        <td className={td}>
                          <span className="block font-semibold text-[var(--fg-2)]">{t.cekimYapan?.unvan}</span>
                          <span className="block text-[11px] text-[var(--muted)]">{etiket("firmaTuru", t.cekimYapan?.tur)}</span>
                        </td>
                      )}
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{t.musteri.unvan}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{etiket("musteriTuru", t.musteriTuru)}</span>
                      </td>
                      <td className={`${td} text-right font-bold tabular-nums text-[var(--fg)]`}>{tl(t.tutarKurus)}</td>
                      <td className={td}>
                        {!s.fatura ? (
                          <span className="text-[var(--muted)]">—</span>
                        ) : s.fatura.icerikGizli ? (
                          <span className="inline-flex items-center gap-1 text-[var(--muted)]" title="Fatura içeriği yalnızca yükleyen firmaya görünür">
                            <I name="lock" size={12} />
                            İçerik gizli
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1 font-semibold text-[var(--fg-2)]">
                              <I name="receipt" size={13} className="text-[var(--muted)]" />
                              {s.fatura.dosyaAdi}
                            </span>
                            <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                              {s.fatura.faturaNo} · {tarih(s.fatura.faturaTarihi)}
                            </span>
                          </>
                        )}
                      </td>
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(s.durum)}`}>{etiket("faturaDurumu", s.durum)}</span>
                        {s.durum === "REDDEDILDI" && s.fatura?.redNedeni && <span className="mt-0.5 block max-w-[220px] whitespace-normal text-[11px] leading-snug text-[var(--danger-text)]">{s.fatura.redNedeni}</span>}
                      </td>
                      <td className={`${td} text-right`}>
                        {s.durum !== "YUKLENDI" &&
                          (s.kendi ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button type="button" onClick={() => setYukle(s)} className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--brand)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}>
                                <I name="receipt" size={13} />
                                {s.durum === "REDDEDILDI" ? "Yeniden Yükle" : "Fatura Yükle"}
                              </button>
                              <LinkKopyala islemNo={t.islemNo} onBildirim={setBildirim} />
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={hatirlat.isPending}
                              onClick={() => hatirlatGonder(s)}
                              className={`inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:opacity-60 ${FOCUS}`}
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
            {satirlar.length === 0 && <BosDurum baslik={sekme === "YUKLENMEMIS" ? "Yüklenmemiş fatura yok" : "Kayıt yok"} ikon="check" tonu="success" />}
          </div>
        )}
      </section>

      {yukle && (
        <FaturaYukle
          satir={yukle}
          onYuklendi={(islemNo) => {
            setYukle(null);
            setBildirim(`${islemNo} faturası şeklen kontrol edildi ve alındı.`);
          }}
          onClose={() => setYukle(null)}
        />
      )}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

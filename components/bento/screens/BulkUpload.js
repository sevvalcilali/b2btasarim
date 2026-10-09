// Bayi Tanım › Excel ile Toplu Bayi / Alt Bayi Ekleme · Toplu Bakiye ve Borç Yükleme — şartname s.2, s.10.
// Akış: şablonu indir → dosyayı seç → önizle (sunucu satır satır doğrular, yazmaz) → geçerli satırları kaydet.
// Veri: POST /bayiler/toplu(/onizleme), POST /bakiye/toplu(/onizleme) — multipart; sözleşme docs/api/openapi.yaml
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/error";
import { sayi, tl } from "@/lib/format";
import { csvIndir } from "@/lib/export";
import { etiket } from "@/lib/labels";
import { useBakiyeTopluOnizle, useBakiyeTopluYukle } from "@/lib/queries/balance";
import { useBayiTopluEkle, useBayiTopluOnizle } from "@/lib/queries/dealers";
import { BosDurum } from "../states";
import { Konum } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";

const Adim = ({ no, baslik, aciklama, children, i }) => (
  <section style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby={`bn-toplu-${no}`}>
    <div className="mb-3 flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[12px] font-extrabold text-white">{no}</span>
      <div>
        <h2 id={`bn-toplu-${no}`} className="text-sm font-bold text-[var(--fg)]">
          {baslik}
        </h2>
        {aciklama && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{aciklama}</p>}
      </div>
    </div>
    {children}
  </section>
);

/**
 * Ortak toplu yükleme ekranı.
 * @param {object} p
 * @param {string[]} p.yol             konum satırı
 * @param {{ dosyaAdi, basliklar, ornekler }} p.sablon
 * @param {string[]} p.sutunlar        önizleme tablosu başlıkları
 * @param {(satir) => any[]} p.hucreler  önizleme satırı → hücreler
 * @param {object} p.onizle / p.kaydet  useMutation sonuçları (dosya alır)
 * @param {(sonuc) => string} p.sonucMetni
 * @param {{ label, href }} [p.sonrakiAdim]
 */
function TopluYukleme({ meta, onNavigate, yol, aciklama, sablon, sutunlar, hucreler, onizle, kaydet, kaydetEtiketi, sonucMetni, sonrakiAdim, notlar }) {
  const [dosya, setDosya] = useState(null);
  const [onizleme, setOnizleme] = useState(null); // sunucu doğrulaması
  const [sonuc, setSonuc] = useState(null); // kaydet cevabı
  const [hata, setHata] = useState(null);
  const baslik = yol[yol.length - 1];
  const mesgul = onizle.isPending || kaydet.isPending;

  const dosyaSec = (f) => {
    setDosya(f);
    setOnizleme(null);
    setSonuc(null);
    setHata(null);
  };
  const calistir = async (mutasyon, sonra) => {
    setHata(null);
    try {
      sonra(await mutasyon.mutateAsync(dosya));
    } catch (err) {
      setHata(err instanceof ApiHatasi && err.alanlar.dosya ? err.alanlar.dosya : err?.message || "İşlem yapılamadı.");
    }
  };
  const th = "whitespace-nowrap px-3 py-2";
  const td = "px-3 py-2 align-top";
  const satirlar = (sonuc || onizleme)?.satirlar || [];

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={yol} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{baslik}</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · {aciklama}
        </p>
      </div>

      <div className="flex max-w-5xl flex-col gap-3">
        <Adim no={1} i={0} baslik="Şablonu indirin" aciklama="Sütun adlarını değiştirmeden doldurun; Excel'de açıp CSV (noktalı virgül) olarak kaydedin.">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-1" aria-label="Sütunlar">
              {sablon.basliklar.map((b) => (
                <li key={b} className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--fg-2)]">
                  {b}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => csvIndir(sablon.dosyaAdi, sablon.basliklar, sablon.ornekler)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              <I name="download" size={14} />
              Şablonu İndir
            </button>
          </div>
          {notlar && (
            <ul className="mt-3 list-disc space-y-0.5 pl-5 text-[11.5px] text-[var(--muted)]">
              {notlar.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </Adim>

        <Adim no={2} i={1} baslik="Dosyayı seçin ve önizleyin" aciklama="Önizleme her satırı sunucuda doğrular; bu adımda hiçbir kayıt yazılmaz.">
          <label htmlFor="bn-toplu-dosya" className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--ring)] hover:border-[var(--brand)] hover:bg-[var(--soft)] ${hata ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <I name={dosya ? "check" : "download"} size={18} />
            </span>
            <span className="text-[13px] font-bold text-[var(--fg)]">{dosya ? dosya.name : "Excel ya da CSV dosyasını seçin"}</span>
            <span className="text-[11.5px] text-[var(--muted)]">{dosya ? `${Math.max(1, Math.round(dosya.size / 1024)).toLocaleString("tr-TR")} KB · değiştirmek için tıklayın` : ".xlsx ya da .csv · en fazla 2 MB"}</span>
            <input id="bn-toplu-dosya" type="file" accept=".csv,.xlsx,.xls" onChange={(e) => dosyaSec(e.target.files?.[0] || null)} aria-invalid={hata ? true : undefined} aria-describedby={hata ? "bn-toplu-hata" : undefined} className="sr-only" />
          </label>
          {hata && (
            <p id="bn-toplu-hata" role="alert" className="mt-2 rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
              {hata}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={!dosya || mesgul}
              onClick={() => calistir(onizle, (o) => { setOnizleme(o); setSonuc(null); })}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
            >
              <I name="search" size={15} strokeWidth={2.2} />
              {onizle.isPending ? "Doğrulanıyor…" : "Önizle"}
            </button>
          </div>
        </Adim>

        {(onizleme || sonuc) && (
          <Adim no={3} i={2} baslik={sonuc ? "Sonuç" : "Önizleme"} aciklama={sonuc ? sonucMetni(sonuc) : `${sayi(onizleme.gecerli)} geçerli · ${sayi(onizleme.hatali)} hatalı satır. Hatalı satırlar atlanır; düzeltip dosyayı yeniden seçebilirsiniz.`}>
            {satirlar.length === 0 ? (
              <BosDurum baslik="Dosyada kayıt yok" />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="min-w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      <th scope="col" className={th}>Satır</th>
                      {sutunlar.map((s) => (
                        <th key={s} scope="col" className={th}>
                          {s}
                        </th>
                      ))}
                      <th scope="col" className={th}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {satirlar.map((s, i) => (
                      <tr key={s.sira} className={`${i > 0 ? "border-t border-[var(--border)]" : ""} ${s.gecerli ? "" : "bg-[var(--danger-soft)]/40"}`}>
                        <td className={`${td} tabular-nums text-[var(--muted)]`}>{s.sira}</td>
                        {hucreler(s).map((h, j) => (
                          <td key={j} className={`${td} whitespace-nowrap ${j === 0 ? "font-semibold text-[var(--fg)]" : "text-[var(--fg-2)]"}`}>
                            {h ?? "—"}
                          </td>
                        ))}
                        <td className={`${td} min-w-[220px]`}>
                          {s.gecerli ? (
                            <span className="inline-flex rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--success-text)]">{sonuc ? (sonuc.eklenen != null ? "Eklendi" : "Güncellendi") : "Geçerli"}</span>
                          ) : (
                            <ul className="space-y-0.5 text-[11.5px] font-semibold text-[var(--danger-text)]">
                              {Object.entries(s.hatalar).map(([k, m]) => (
                                <li key={k}>{m}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {sonuc ? (
                sonrakiAdim && (
                  <button type="button" onClick={() => onNavigate(sonrakiAdim.href)} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
                    {sonrakiAdim.label}
                    <I name="chevronRight" size={14} />
                  </button>
                )
              ) : (
                <button
                  type="button"
                  disabled={onizleme.gecerli === 0 || mesgul}
                  onClick={() => calistir(kaydet, setSonuc)}
                  className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                >
                  <I name="check" size={15} strokeWidth={2.2} />
                  {kaydet.isPending ? "Kaydediliyor…" : kaydetEtiketi(onizleme.gecerli)}
                </button>
              )}
            </div>
          </Adim>
        )}
      </div>
    </>
  );
}

// ───────────────────────── Excel ile Toplu Bayi / Alt Bayi Ekleme ─────────────────────────
export function TopluBayiEkleme({ role, meta, onNavigate }) {
  const altMi = role === ROLES.BAYI;
  const ad = altMi ? "alt bayi" : "bayi";
  const basliklar = ["unvan", "cariNo", "vergiNo", "telefon", "email", "adres", "vadeProfilId", "taksitler", "islemLimitiTL", ...(altMi ? [] : ["altBayiYetkisi"]), "durum"];
  const ornek = (unvan, cari, vkn, tel, mail, adres) => [unvan, cari, vkn, tel, mail, adres, "", "", "", ...(altMi ? [] : ["Hayır"]), "AKTIF"];
  const ornekler = altMi
    ? [ornek("Etimesgut Lastik", "540.02.021", "5566778899", "0312 244 10 20", "info@etimesgutlastik.com", "Etimesgut / Ankara")]
    : [ornek("Adana Lastik Merkezi", "320.01.021", "5566778899", "0322 455 10 20", "info@adanalastik.com", "Seyhan / Adana"), ornek("Trabzon Oto Lastik", "320.01.022", "6677889900", "0462 321 44 55", "info@trabzonoto.com", "Ortahisar / Trabzon")];
  return (
    <TopluYukleme
      meta={meta}
      onNavigate={onNavigate}
      yol={[altMi ? "Alt Bayi Tanım" : "Bayi Tanım", `Excel ile Toplu ${altMi ? "Alt Bayi" : "Bayi"} Ekleme`]}
      aciklama={`Birden çok ${ad}yi tek dosyayla tanımlayın; kurallar tekil tanımla aynıdır`}
      sablon={{ dosyaAdi: altMi ? "alt-bayi-sablonu" : "bayi-sablonu", basliklar, ornekler }}
      notlar={[
        "vadeProfilId, taksitler (örn. 1,2,3,6) ve islemLimitiTL boş bırakılırsa kendi tanımınızdaki sınırlar uygulanır; üye işyerleri size açık olanların tümüdür.",
        "cariNo 000.00.000 biçiminde ve ağda tek olmalı; vergiNo 10 hane.",
        "Hatalı satırlar kaydedilmez; önizlemede nedenini görüp dosyayı düzeltebilirsiniz.",
      ]}
      sutunlar={["Unvan", "Cari No", "Vergi No", "Telefon", "E-posta", "Vade profili", "Taksitler", "Limit"]}
      hucreler={(s) => [s.girdi.unvan, s.girdi.cariNo, s.girdi.vergiNo, s.girdi.telefon, s.girdi.email, s.girdi.vadeProfilId ? `Profil ${s.girdi.vadeProfilId}` : null, s.girdi.taksitler?.join(", "), s.girdi.islemLimitiKurus ? tl(s.girdi.islemLimitiKurus) : null]}
      onizle={useBayiTopluOnizle()}
      kaydet={useBayiTopluEkle()}
      kaydetEtiketi={(n) => `${sayi(n)} ${ad} ekle`}
      sonucMetni={(r) => `${sayi(r.eklenen)} ${ad} eklendi${r.atlanan ? `, ${sayi(r.atlanan)} hatalı satır atlandı` : ""}.`}
      sonrakiAdim={{ label: altMi ? "Alt Bayi Listesine git" : "Bayi Listesine git", href: "/bayi-tanim/liste" }}
    />
  );
}

// ───────────────────────── Toplu Bakiye ve Borç Yükleme ─────────────────────────
export function TopluBakiyeYukleme({ role, meta, onNavigate }) {
  const altMi = role === ROLES.BAYI;
  const ad = altMi ? "alt bayi" : "bayi";
  return (
    <TopluYukleme
      meta={meta}
      onNavigate={onNavigate}
      yol={[altMi ? "Alt Bayi Tanım" : "Bayi Tanım", "Toplu Bakiye ve Borç Yükleme"]}
      aciklama={`${altMi ? "Alt bayilerinizin" : "Bayilerinizin"} bakiye, borç ve limitini tek dosyayla güncelleyin; borç artışı ekstreye hareket olarak düşer`}
      sablon={{
        dosyaAdi: "bakiye-borc-sablonu",
        basliklar: ["cariNo", "bakiyeTL", "borcTL", "limitTL", "aciklama"],
        ornekler: altMi ? [["540.02.011", "38.900,00", "15.100,00", "100.000,00", "Ekim sevkiyatı"]] : [["320.01.001", "184.200,00", "52.300,00", "400.000,00", "Ekim sevkiyatı — fatura BRS-2026-1003"], ["320.01.002", "", "61.000,00", "", "Ekim sevkiyatı"]],
      }}
      notlar={["Boş bırakılan tutar değişmez; tutarlar TL, ondalık virgülle (12.500,00).", `cariNo yönettiğiniz bir ${ad}ye ait olmalı; borç limiti aşamaz.`]}
      sutunlar={["Firma", "Cari No", "Bakiye", "Borç", "Limit", "Açıklama"]}
      hucreler={(s) => {
        const fark = (yeni, eski) => (s.eski && yeni !== eski ? <span className="block text-[10.5px] text-[var(--muted)]">önce {tl(eski)}</span> : null);
        return [
          s.girdi.unvan,
          s.girdi.cariNo,
          <>
            {Number.isInteger(s.girdi.bakiyeKurus) ? tl(s.girdi.bakiyeKurus) : "—"}
            {fark(s.girdi.bakiyeKurus, s.eski?.bakiyeKurus)}
          </>,
          <>
            {Number.isInteger(s.girdi.borcKurus) ? tl(s.girdi.borcKurus) : "—"}
            {fark(s.girdi.borcKurus, s.eski?.borcKurus)}
          </>,
          <>
            {Number.isInteger(s.girdi.limitKurus) ? tl(s.girdi.limitKurus) : "—"}
            {fark(s.girdi.limitKurus, s.eski?.limitKurus)}
          </>,
          s.girdi.aciklama || null,
        ];
      }}
      onizle={useBakiyeTopluOnizle()}
      kaydet={useBakiyeTopluYukle()}
      kaydetEtiketi={(n) => `${sayi(n)} ${ad} için yükle`}
      sonucMetni={(r) => `${sayi(r.guncellenen)} ${ad} güncellendi${r.atlanan ? `, ${sayi(r.atlanan)} hatalı satır atlandı` : ""}.`}
      sonrakiAdim={{ label: altMi ? "Alt Bayi Listesine git" : "Bayi Listesine git", href: "/bayi-tanim/liste" }}
    />
  );
}

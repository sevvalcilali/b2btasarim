// Manuel ödeme ve link ile ödemenin ortak müşteri bölümü (şartname s.6). Veri: GET /bayiler, GET /musteriler,
// GET /tahsilat-carileri, GET /firma. Taksit, limit ve vade farkı ekranların kendi isteğiyle (/odeme/taksit-secenekleri) gelir.
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { etiket } from "@/lib/etiketler";
import { useBayiler } from "@/lib/sorgular/bayiler";
import { useMusteriler, useTahsilatCarileri } from "@/lib/sorgular/odeme";
import { useFirma } from "@/lib/sorgular/tanimlar";
import { inputCls, Alan, MusteriSecici } from "./ortak";
import { FOCUS } from "./tema";
import { rakamlar } from "./yardimci";

// Rolün seçebildiği müşteri türleri (şartname s.6)
const MUSTERI_SECENEKLERI = {
  [ROLES.ANA_FIRMA]: ["BAYI", "DUZENLI_MUSTERI", "DUZENSIZ_MUSTERI"],
  [ROLES.BAYI]: ["ALT_BAYI", "DUZENLI_MUSTERI", "DUZENSIZ_MUSTERI", "KENDI_KARTI"],
  [ROLES.ALT_BAYI]: ["MUSTERI_KARTI", "KENDI_KARTI"],
};

// tanımlı (listeden seçilen) müşteri türleri
export const LISTELI = new Set(["BAYI", "ALT_BAYI", "DUZENLI_MUSTERI"]);

const BOS_KISI = { ad: "", kimlikNo: "", tel: "", email: "" };

// onerilenCari: listeden "Ödeme Al" ile gelindiğinde müşteri türü ve müşteri hazır seçili gelir
export function useMusteriSecimi(role, onerilenCari) {
  const turler = MUSTERI_SECENEKLERI[role];
  const bayiTuru = turler.find((t) => t === "BAYI" || t === "ALT_BAYI");
  const bayiler = useBayiler({ tur: bayiTuru, durum: "AKTIF" }, { enabled: !!bayiTuru });
  const musteriler = useMusteriler({}, { enabled: turler.includes("DUZENLI_MUSTERI") });
  const cariler = useTahsilatCarileri();
  const firma = useFirma();

  const [tur, setTurDurumu] = useState(turler[0]);
  const [secili, setSecili] = useState(null);
  const [kendi, setKendi] = useState("");
  const [kisi, setKisi] = useState(BOS_KISI);
  const [cari, setCari] = useState("");

  const listeler = {
    BAYI: bayiler.data?.kayitlar,
    ALT_BAYI: bayiler.data?.kayitlar,
    DUZENLI_MUSTERI: musteriler.data?.kayitlar,
  };
  const secenekler = listeler[tur] || [];
  const listeYukleniyor = LISTELI.has(tur) && (tur === "DUZENLI_MUSTERI" ? musteriler.isPending : bayiler.isPending);

  // önerilen cari listelerden birinde bulununca o türe geçilir ve seçilir (bir kez)
  const uygulandi = useRef(false);
  useEffect(() => {
    if (!onerilenCari || uygulandi.current) return;
    for (const t of turler) {
      const kayit = listeler[t]?.find((x) => x.cariNo === onerilenCari);
      if (kayit) {
        uygulandi.current = true;
        setTurDurumu(t);
        setSecili(kayit);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onerilenCari, bayiler.data, musteriler.data]);

  // tahsilat carisi: liste gelince ilk kayıt seçilir
  useEffect(() => {
    if (!cari && cariler.data?.kayitlar?.length) setCari(cariler.data.kayitlar[0].cariNo);
  }, [cariler.data, cari]);

  const kendiKarti = tur === "KENDI_KARTI";
  const kendiSecenekleri = firma.data ? [{ ad: firma.data.unvan, rol: "Firma unvanı" }, ...(firma.data.ortaklar || []).map((o) => ({ ad: o, rol: "Ortak" }))] : [];

  // ekran tarafı doğrulama; anahtarlar sunucu cevabındaki alan adlarıyla aynı
  const hatalar = {};
  if (LISTELI.has(tur) && !secili) hatalar.musteriCariNo = "Listeden bir müşteri seçin.";
  if (tur === "DUZENSIZ_MUSTERI" || tur === "MUSTERI_KARTI") {
    if (!kisi.ad.trim()) hatalar.musteriUnvan = "Ad soyad ya da unvan girin.";
    if (rakamlar(kisi.tel).length < 10) hatalar.musteriTelefon = "Geçerli bir telefon numarası girin.";
  }
  if (tur === "DUZENSIZ_MUSTERI" && ![10, 11].includes(rakamlar(kisi.kimlikNo).length)) hatalar.musteriKimlikNo = "10 haneli VKN ya da 11 haneli TCKN girin.";
  if (kendiKarti && !kendi) hatalar.kartSahibi = "Kartın kime ait olduğunu seçin.";
  if (!cari) hatalar.tahsilatCariNo = "Tahsilat carisi seçin.";

  const cariAdi = cariler.data?.kayitlar.find((c) => c.cariNo === cari) || null;

  return {
    turler,
    tur,
    secili,
    setSecili,
    kendi,
    setKendi,
    kisi,
    setKisi,
    cari,
    setCari,
    cariler: cariler.data?.kayitlar || [],
    cariEtiketi: cariler.data?.etiket || "Tahsilat carisi",
    secenekler,
    listeYukleniyor,
    kendiSecenekleri,
    kendiKarti,
    firma: firma.data || null,
    hatalar,
    yukleniyor: cariler.isPending || firma.isPending,
    hata: cariler.error || firma.error || bayiler.error || musteriler.error || null,
    ad: LISTELI.has(tur) ? secili?.unvan : kendiKarti ? kendi : kisi.ad.trim(),
    // link gönderiminde öneri olarak kullanılan iletişim bilgisi
    iletisim: LISTELI.has(tur)
      ? { tel: secili?.telefon || "", email: secili?.email || "" }
      : kendiKarti
        ? { tel: firma.data?.telefon || "", email: firma.data?.email || "" }
        : { tel: kisi.tel, email: kisi.email },
    cariAdi,
    // ödeme / link isteğinin müşteri kısmı (sözleşme: OdemeGirdisi)
    govde: () => ({
      musteriTuru: tur,
      musteri: LISTELI.has(tur)
        ? { cariNo: secili?.cariNo }
        : kendiKarti
          ? undefined
          : { unvan: kisi.ad.trim(), kimlikNo: rakamlar(kisi.kimlikNo) || undefined, telefon: kisi.tel.trim(), email: kisi.email.trim() || undefined },
      kartSahibi: kendiKarti ? kendi : undefined,
      tahsilatCariNo: cari,
    }),
    setTur: (t) => {
      setTurDurumu(t);
      setSecili(null);
      setKendi("");
    },
    sifirla: () => {
      setTurDurumu(turler[0]);
      setSecili(null);
      setKendi("");
      setKisi(BOS_KISI);
    },
  };
}

export function MusteriBolumu({ role, m, h }) {
  const { turler, tur, setTur, secenekler, listeYukleniyor, secili, setSecili, kisi, setKisi, kendiKarti, kendiSecenekleri, kendi, setKendi, cariler, cariEtiketi, cari, setCari } = m;
  return (
    <>
      <div role="radiogroup" aria-label="Müşteri türü" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
        {turler.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={tur === t}
            onClick={() => setTur(t)}
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-[12.5px] transition ${
              tur === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
            } ${FOCUS}`}
          >
            {etiket("musteriTuru", t)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LISTELI.has(tur) && (
          <Alan
            id="bn-musteri"
            etiket={tur === "DUZENLI_MUSTERI" ? "Tanımlı müşteri" : etiket("musteriTuru", tur)}
            hata={h("musteriCariNo")}
            ipucu={listeYukleniyor ? "Liste yükleniyor…" : undefined}
            className="sm:col-span-2"
          >
            <MusteriSecici key={tur} id="bn-musteri" secenekler={secenekler} secili={secili} onSec={setSecili} hata={h("musteriCariNo")} />
          </Alan>
        )}

        {LISTELI.has(tur) && secili && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--soft)] p-3 text-[12px] sm:col-span-2 sm:grid-cols-4">
            {[
              ["Cari No", secili.cariNo],
              ["Vergi No", secili.vergiNo],
              ["Telefon", secili.telefon],
              ["E-posta", secili.email],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[11px] text-[var(--muted)]">{k}</dt>
                <dd className="truncate font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {(tur === "DUZENSIZ_MUSTERI" || tur === "MUSTERI_KARTI") && (
          <>
            <Alan id="bn-ad" etiket="Ad soyad / Unvan" hata={h("musteriUnvan")}>
              <input id="bn-ad" value={kisi.ad} onChange={(e) => setKisi({ ...kisi, ad: e.target.value })} aria-invalid={h("musteriUnvan") ? true : undefined} autoComplete="name" className={inputCls(h("musteriUnvan"))} />
            </Alan>
            {tur === "DUZENSIZ_MUSTERI" && (
              <Alan id="bn-vkn" etiket="TCKN / VKN" hata={h("musteriKimlikNo")}>
                <input
                  id="bn-vkn"
                  inputMode="numeric"
                  maxLength={11}
                  value={kisi.kimlikNo}
                  onChange={(e) => setKisi({ ...kisi, kimlikNo: rakamlar(e.target.value) })}
                  aria-invalid={h("musteriKimlikNo") ? true : undefined}
                  className={`${inputCls(h("musteriKimlikNo"))} tabular-nums`}
                />
              </Alan>
            )}
            <Alan id="bn-tel" etiket="Telefon" hata={h("musteriTelefon")}>
              <input
                id="bn-tel"
                type="tel"
                inputMode="tel"
                placeholder="05XX XXX XX XX"
                value={kisi.tel}
                onChange={(e) => setKisi({ ...kisi, tel: e.target.value })}
                aria-invalid={h("musteriTelefon") ? true : undefined}
                autoComplete="tel"
                className={`${inputCls(h("musteriTelefon"))} tabular-nums`}
              />
            </Alan>
            <Alan id="bn-eposta" etiket="E-posta (isteğe bağlı)">
              <input id="bn-eposta" type="email" value={kisi.email} onChange={(e) => setKisi({ ...kisi, email: e.target.value })} autoComplete="email" className={inputCls()} />
            </Alan>
            {tur === "DUZENSIZ_MUSTERI" && (
              <p className="flex items-start gap-1.5 text-[11.5px] text-[var(--muted)] sm:col-span-2">
                <I name="info" size={13} className="mt-px shrink-0" />
                Düzensiz müşteride bilgiler bu alanlarla sınırlıdır; müşteri tanımı oluşturulmaz.
              </p>
            )}
          </>
        )}

        {kendiKarti && (
          <fieldset className="sm:col-span-2" aria-describedby={h("kartSahibi") ? "bn-kendi-hata" : undefined}>
            <legend className="mb-1 block text-[12px] font-semibold text-[var(--fg-2)]">Kart sahibi</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {kendiSecenekleri.map((o) => (
                <label
                  key={o.ad}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                    kendi === o.ad ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                  }`}
                >
                  <input type="radio" name="bn-kendi" value={o.ad} checked={kendi === o.ad} onChange={() => setKendi(o.ad)} aria-invalid={h("kartSahibi") ? true : undefined} className="h-4 w-4 accent-[var(--brand)]" />
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[12.5px] font-bold text-[var(--fg)]">{o.ad}</span>
                    <span className="block text-[11px] text-[var(--muted)]">{o.rol}</span>
                  </span>
                </label>
              ))}
            </div>
            {h("kartSahibi") && (
              <p id="bn-kendi-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                {h("kartSahibi")}
              </p>
            )}
          </fieldset>
        )}

        <Alan id="bn-cari" etiket={cariEtiketi} hata={h("tahsilatCariNo")} ipucu={role === ROLES.ANA_FIRMA ? "Ödemenin alınacağı üye işyeri." : "Ödemenin aktarılacağı cari."} className="sm:col-span-2">
          <select id="bn-cari" value={cari} onChange={(e) => setCari(e.target.value)} aria-invalid={h("tahsilatCariNo") ? true : undefined} className={inputCls(h("tahsilatCariNo"))}>
            {cariler.length === 0 && <option value="">Yükleniyor…</option>}
            {cariler.map((c) => (
              <option key={c.cariNo} value={c.cariNo}>
                {c.ad} — {c.cariNo}
              </option>
            ))}
          </select>
        </Alan>
      </div>
    </>
  );
}

/** Sunucudan dönen alan hatalarını (ApiHatasi.alanlar) forma bağlayan yardımcı: h(k) → ekran ya da sunucu hatası */
export function hataBaglayici(denendi, hatalar, sunucuHatalari) {
  return (k) => sunucuHatalari[k] || (denendi ? hatalar[k] : undefined);
}

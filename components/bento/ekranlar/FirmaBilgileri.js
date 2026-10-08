// Ayarlar › Firma Bilgileri — şartname s.10: bayi / alt bayi kendi kimlik, iletişim, ödeme koşulları ve ortaklarını görür;
// iletişim bilgisini Yönetici günceller, tanım alanları üst firmada kalır. Veri: GET /firma, PUT /firma/iletisim,
// GET /uye-isyerleri, GET /oturum (yetki)
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { sayi, tl, yuzde } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useOturum } from "@/lib/sorgular/oturum";
import { useFirma, useFirmaIletisimGuncelle, useUyeIsyerleri } from "@/lib/sorgular/tanimlar";
import { HataKutusu, Yukleniyor } from "../durumlar";
import { hataBaglayici } from "../odeme";
import { Alan, Bildirim, Konum, Pencere, inputCls } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { rakamlar } from "../yardimci";

const taksitOzeti = (l) => l.map((n) => (n === 1 ? "Tek" : n)).join(", ");

function Satir({ ad, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-0.5 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${className}`}>
      <dt className="shrink-0 text-[12px] text-[var(--muted)] sm:w-40">{ad}</dt>
      <dd className="text-[12.5px] font-semibold text-[var(--fg)] sm:text-right">{children}</dd>
    </div>
  );
}

function Kart({ no, baslik, aciklama, i, aksiyon, children }) {
  return (
    <section style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby={`bn-firma-${no}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 id={`bn-firma-${no}`} className="text-sm font-bold text-[var(--fg)]">
            {baslik}
          </h2>
          {aciklama && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{aciklama}</p>}
        </div>
        {aksiyon}
      </div>
      {children}
    </section>
  );
}

export function FirmaBilgileri({ role, meta, onNavigate }) {
  const sorgu = useFirma();
  const uyeler = useUyeIsyerleri();
  const oturum = useOturum();
  const f = sorgu.data;
  const duzenlenebilir = oturum.data?.kullanici.yetki === "YONETICI";
  const ustAdi = role === ROLES.ALT_BAYI ? "bayiniz" : "ana firma";
  const [duzenle, setDuzenle] = useState(false);
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const uyeAdi = (cariNo) => uyeler.data?.kayitlar.find((u) => u.cariNo === cariNo)?.ad || cariNo;

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={["Ayarlar", "Firma Bilgileri"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Firma Bilgileri</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · {f ? `${etiket("firmaTuru", f.tur)} · ${f.bagli ? `${f.bagli.unvan} ağında` : ""}` : "Yükleniyor…"}
        </p>
      </div>

      {sorgu.isPending ? (
        <Yukleniyor satir={6} />
      ) : sorgu.isError ? (
        <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Kart no={1} i={0} baslik="Kimlik" aciklama={`Tanımı ${ustAdi} yapar; değişiklik için ${ustAdi === "bayiniz" ? "bayinize" : "ana firmaya"} başvurun.`}>
            <dl className="divide-y divide-[var(--border)]">
              <Satir ad="Unvan">{f.unvan}</Satir>
              <Satir ad="Cari No"><span className="tabular-nums">{f.cariNo}</span></Satir>
              <Satir ad="Vergi No"><span className="tabular-nums">{f.vergiNo}</span></Satir>
              <Satir ad="Tür">{etiket("firmaTuru", f.tur)}</Satir>
              <Satir ad="Bağlı olduğu firma">{f.bagli ? `${f.bagli.unvan} (${etiket("firmaTuru", f.bagli.tur)})` : "—"}</Satir>
              <Satir ad="Durum">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(f.durum)}`}>{etiket("kayitDurumu", f.durum)}</span>
              </Satir>
            </dl>
          </Kart>

          <Kart
            no={2}
            i={1}
            baslik="İletişim"
            aciklama={duzenlenebilir ? "Ödeme linkleri ve bildirimler bu bilgilerle gönderilir." : "Güncellemek için Yönetici yetkisi gerekir."}
            aksiyon={
              duzenlenebilir && (
                <button type="button" onClick={() => setDuzenle(true)} className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}>
                  <I name="edit" size={13} />
                  Düzenle
                </button>
              )
            }
          >
            <dl className="divide-y divide-[var(--border)]">
              <Satir ad="Telefon"><span className="tabular-nums">{f.telefon}</span></Satir>
              <Satir ad="E-posta">{f.email}</Satir>
              <Satir ad="Adres"><span className="block sm:max-w-xs">{f.adres}</span></Satir>
            </dl>
          </Kart>

          <Kart no={3} i={2} baslik="Ödeme Koşulları" aciklama={`${ustAdi === "bayiniz" ? "Bayinizin" : "Ana firmanın"} bayi tanımında belirlenir; ödeme ekranları bu sınırlarla çalışır.`}>
            <dl className="divide-y divide-[var(--border)]">
              <Satir ad="Vade farkı profili">{f.vadeProfil ? `${f.vadeProfil.ad.replace("Vade Farkı ", "")} · ${yuzde(f.vadeProfil.oranYuzde, 2)} / ay` : "—"}</Satir>
              <Satir ad="Açık taksitler"><span className="tabular-nums">{f.taksitler.length ? taksitOzeti(f.taksitler) : "—"}</span></Satir>
              <Satir ad="İşlem bazlı ödeme limiti"><span className="tabular-nums">{f.islemLimitiKurus ? tl(f.islemLimitiKurus) : "—"}</span></Satir>
              {f.tur === "BAYI" && (
                <>
                  <Satir ad="Alt bayi tanımlayabilir">{f.altBayiYetkisi ? "Evet" : "Hayır"}</Satir>
                  <Satir ad="Alt bayi sayısı"><span className="tabular-nums">{sayi(f.altBayiSayisi)}</span></Satir>
                </>
              )}
              <Satir ad="Üye işyerleri">
                <span className="flex flex-wrap gap-1 sm:justify-end">
                  {f.uyeIsyerleri.length ? f.uyeIsyerleri.map((c) => (
                    <span key={c} className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-2)]">
                      {uyeAdi(c)}
                    </span>
                  )) : "—"}
                </span>
              </Satir>
            </dl>
          </Kart>

          <Kart no={4} i={3} baslik="Ortaklar" aciklama="Şirket ortakları; ödeme ekranında kendi kartı seçeneğinde listelenir.">
            {f.ortaklar.length === 0 ? (
              <p className="text-[12.5px] text-[var(--muted)]">Tanımlı ortak yok.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {f.ortaklar.map((ad) => (
                  <li key={ad} className="flex items-center gap-2.5 py-2 text-[12.5px] font-semibold text-[var(--fg)]">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[10.5px] font-extrabold text-[var(--brand-text)]" aria-hidden="true">
                      {ad
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")
                        .toLocaleUpperCase("tr-TR")}
                    </span>
                    {ad}
                  </li>
                ))}
              </ul>
            )}
          </Kart>
        </div>
      )}

      {duzenle && f && (
        <IletisimFormu
          mevcut={f}
          onClose={() => setDuzenle(false)}
          onKaydedildi={() => {
            setDuzenle(false);
            setBildirim("İletişim bilgileri kaydedildi.");
          }}
        />
      )}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

function IletisimFormu({ mevcut, onClose, onKaydedildi }) {
  const [f, setF] = useState({ telefon: mevcut.telefon || "", email: mevcut.email || "", adres: mevcut.adres || "" });
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const guncelle = useFirmaIletisimGuncelle();

  const hatalar = {};
  if (rakamlar(f.telefon).length < 10) hatalar.telefon = "Geçerli bir telefon girin.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) hatalar.email = "Geçerli bir e-posta girin.";
  if (!f.adres.trim()) hatalar.adres = "Adres girin.";
  const h = hataBaglayici(denendi, hatalar, sunucuHatalari);
  const degistir = (yeni) => {
    setF(yeni);
    if (Object.keys(sunucuHatalari).length) setSunucuHatalari({});
  };

  const kaydet = async (e) => {
    e.preventDefault();
    setDenendi(true);
    setSunucuMesaji(null);
    if (Object.keys(hatalar).length) {
      requestAnimationFrame(() => document.querySelector('#bn-iletisim-form [aria-invalid="true"]')?.focus());
      return;
    }
    try {
      await guncelle.mutateAsync({ telefon: f.telefon.trim(), email: f.email.trim(), adres: f.adres.trim() });
      onKaydedildi();
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) {
        setSunucuHatalari(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-iletisim-form [aria-invalid="true"]')?.focus());
      } else {
        setSunucuMesaji(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  return (
    <Pencere baslik="İletişim bilgilerini düzenle" altBaslik={mevcut.unvan} onClose={onClose} genislik="max-w-md">
      <form id="bn-iletisim-form" noValidate onSubmit={kaydet} className="flex flex-col gap-3" aria-busy={guncelle.isPending}>
        <Alan id="bn-f-tel" etiket="Telefon" hata={h("telefon")}>
          <input id="bn-f-tel" type="tel" value={f.telefon} onChange={(e) => degistir({ ...f, telefon: e.target.value })} aria-invalid={h("telefon") ? true : undefined} className={`${inputCls(h("telefon"))} tabular-nums`} />
        </Alan>
        <Alan id="bn-f-eposta" etiket="E-posta" hata={h("email")}>
          <input id="bn-f-eposta" type="email" value={f.email} onChange={(e) => degistir({ ...f, email: e.target.value })} aria-invalid={h("email") ? true : undefined} className={inputCls(h("email"))} />
        </Alan>
        <Alan id="bn-f-adres" etiket="Adres" hata={h("adres")}>
          <textarea id="bn-f-adres" rows={3} value={f.adres} onChange={(e) => degistir({ ...f, adres: e.target.value })} aria-invalid={h("adres") ? true : undefined} className={`${inputCls(h("adres"))} h-auto py-2`} />
        </Alan>
        {sunucuMesaji && (
          <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
            {sunucuMesaji}
          </p>
        )}
        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
            Vazgeç
          </button>
          <button type="submit" disabled={guncelle.isPending} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            {guncelle.isPending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </Pencere>
  );
}

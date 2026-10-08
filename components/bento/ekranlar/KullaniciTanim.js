// Ayarlar › Kullanıcı Tanım — şartname s.3: her firma kendi kullanıcılarını Yönetici / Ödeme / Raporlama yetkisiyle
// tanımlar; yalnız Yönetici ekler ve düzenler. Veri: GET/POST /kullanicilar, PUT /kullanicilar/{kullaniciId}
import { useCallback, useState } from "react";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { sayi, tarihSaat } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useKullaniciGuncelle, useKullaniciOlustur, useKullanicilar } from "@/lib/sorgular/kullanicilar";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { hataBaglayici } from "../odeme";
import { Alan, Bildirim, Konum, Pencere, inputCls, DenetimNotu } from "../ortak";
import { HOME } from "../sayfalar";
import { SiraliBaslik, useSiralama } from "../tablo";
import { CARD, FOCUS } from "../tema";
import { rakamlar, useGecikmeli } from "../yardimci";

const YETKILER = ["YONETICI", "ODEME", "RAPORLAMA"];
const YETKI_TONU = {
  YONETICI: "bg-[var(--brand-soft)] text-[var(--brand-text)]",
  ODEME: "bg-[var(--success-soft)] text-[var(--success-text)]",
  RAPORLAMA: "bg-[var(--soft-2)] text-[var(--fg-2)]",
};
const KULLANICI_SUTUNLARI = { adSoyad: (k) => k.adSoyad, yetki: (k) => ["YONETICI", "ODEME", "RAPORLAMA"].indexOf(k.yetki), sonGiris: (k) => k.sonGiris, durum: (k) => k.durum };
const basHarfler = (ad) =>
  ad
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toLocaleUpperCase("tr-TR");

export function KullaniciTanim({ meta, onNavigate }) {
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("");
  const q = useGecikmeli(arama.trim());
  const sorgu = useKullanicilar({ durum: durum || undefined, q: q || undefined });
  const veri = sorgu.data;
  const satirlar = veri?.kayitlar || [];
  const duzenlenebilir = veri?.duzenlenebilir ?? false;
  const { sirali, siralama, sirala } = useSiralama(satirlar, KULLANICI_SUTUNLARI);
  const [duzenlenen, setDuzenlenen] = useState(null); // null: kapalı · "yeni" · kullanıcı kaydı
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const kaydedildi = (k, yeniMi) => {
    setDuzenlenen(null);
    setBildirim(yeniMi ? `${k.adSoyad} eklendi; şifre belirleme bağlantısı e-postasına gönderilecek.` : `${k.adSoyad} kaydedildi.`);
  };
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["Ayarlar", "Kullanıcı Tanım"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Kullanıcı Tanım</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {veri ? `${sayi(veri.sayaclar.TUMU)} kullanıcı` : "Yükleniyor…"}
            {veri && !duzenlenebilir ? " · Kullanıcı eklemek ve düzenlemek için Yönetici yetkisi gerekir" : ""}
          </p>
        </div>
        {duzenlenebilir && (
          <button
            type="button"
            onClick={() => setDuzenlenen("yeni")}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Yeni Kullanıcı
          </button>
        )}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {YETKILER.map((y, i) => (
          <div key={y} style={{ "--i": i }} className="bn-rise flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
            <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${YETKI_TONU[y]}`}>{etiket("yetki", y)}</span>
            <span className="text-[11.5px] leading-snug text-[var(--muted)]">{etiket("yetkiAciklamasi", y)}</span>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Kullanıcılar" aria-busy={sorgu.isFetching}>
        <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Durum" className="flex gap-1">
            {[
              ["", "Tümü", "TUMU"],
              ["AKTIF", "Aktif", "AKTIF"],
              ["PASIF", "Pasif", "PASIF"],
            ].map(([deger, ad, sayacAnahtari]) => (
              <button
                key={ad}
                type="button"
                onClick={() => setDurum(deger)}
                aria-pressed={durum === deger}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  durum === deger ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {ad}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${durum === deger ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {veri?.sayaclar?.[sayacAnahtari] ?? "–"}
                </span>
              </button>
            ))}
          </div>
          <label className="relative block md:w-72">
            <span className="sr-only">Ara</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <I name="search" size={14} />
            </span>
            <input
              type="search"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Ad soyad, e-posta"
              className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
            />
          </label>
        </div>

        {sorgu.isPending ? (
          <Yukleniyor satir={4} baslik={false} />
        ) : sorgu.isError ? (
          <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
        ) : satirlar.length === 0 ? (
          <BosDurum baslik="Kullanıcı bulunamadı" aciklama={q || durum ? "Arama ya da durum filtresine uyan kullanıcı yok." : undefined} eylemler={(q || durum) && [{ etiket: "Filtreleri temizle", onClick: () => { setArama(""); setDurum(""); } }]} />
        ) : (
          <div className={`overflow-x-auto transition-opacity ${sorgu.isFetching ? "opacity-60" : ""}`}>
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <SiraliBaslik alan="adSoyad" siralama={siralama} onSirala={sirala} className={th}>Kullanıcı</SiraliBaslik>
                  <th scope="col" className={th}>Telefon</th>
                  <SiraliBaslik alan="yetki" siralama={siralama} onSirala={sirala} className={th}>Yetki</SiraliBaslik>
                  <SiraliBaslik alan="sonGiris" siralama={siralama} onSirala={sirala} className={th}>Son Giriş</SiraliBaslik>
                  <SiraliBaslik alan="durum" siralama={siralama} onSirala={sirala} className={th}>Durum</SiraliBaslik>
                  {duzenlenebilir && <th scope="col" className={`${th} text-right`}>İşlem</th>}
                </tr>
              </thead>
              <tbody>
                {sirali.map((k, i) => (
                  <tr key={k.kullaniciId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                    <td className={td}>
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[11px] font-extrabold text-[var(--brand-text)]" aria-hidden="true">
                          {basHarfler(k.adSoyad)}
                        </span>
                        <span>
                          <span className="block font-semibold text-[var(--fg)]">
                            {k.adSoyad}
                            {k.kendisi && <span className="ml-1.5 rounded-full bg-[var(--soft-2)] px-1.5 py-px text-[10px] font-bold text-[var(--fg-2)]">Siz</span>}
                          </span>
                          <span className="block text-[11px] text-[var(--muted)]">{k.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{k.telefon || "—"}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${YETKI_TONU[k.yetki] || ""}`}>{etiket("yetki", k.yetki)}</span>
                    </td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{k.sonGiris ? tarihSaat(k.sonGiris) : <span className="text-[var(--muted)]">Henüz girmedi</span>}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(k.durum)}`}>{etiket("kayitDurumu", k.durum)}</span>
                    </td>
                    {duzenlenebilir && (
                      <td className={`${td} text-right`}>
                        <button
                          type="button"
                          onClick={() => setDuzenlenen(k)}
                          className={`inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
                        >
                          <I name="edit" size={13} />
                          Düzenle
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {duzenlenen && <KullaniciFormu mevcut={duzenlenen === "yeni" ? null : duzenlenen} onClose={() => setDuzenlenen(null)} onKaydedildi={kaydedildi} />}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

function KullaniciFormu({ mevcut, onClose, onKaydedildi }) {
  const kendisi = !!mevcut?.kendisi;
  const [f, setF] = useState({
    adSoyad: mevcut?.adSoyad || "",
    email: mevcut?.email || "",
    telefon: mevcut?.telefon || "",
    yetki: mevcut?.yetki || "ODEME",
    durum: mevcut?.durum || "AKTIF",
  });
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const olustur = useKullaniciOlustur();
  const guncelle = useKullaniciGuncelle();
  const gonderiliyor = olustur.isPending || guncelle.isPending;

  // ekran tarafı doğrulama; sunucu aynı kuralları ve e-posta tekliği / son yönetici kurallarını uygular
  const hatalar = {};
  if (!f.adSoyad.trim()) hatalar.adSoyad = "Ad soyad girin.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) hatalar.email = "Geçerli bir e-posta girin.";
  if (f.telefon.trim() && rakamlar(f.telefon).length < 10) hatalar.telefon = "Geçerli bir telefon girin.";
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
      requestAnimationFrame(() => document.querySelector('#bn-kullanici-form [aria-invalid="true"]')?.focus());
      return;
    }
    const govde = { adSoyad: f.adSoyad.trim(), email: f.email.trim(), telefon: f.telefon.trim(), yetki: f.yetki, durum: f.durum };
    try {
      onKaydedildi(mevcut ? await guncelle.mutateAsync({ kullaniciId: mevcut.kullaniciId, govde }) : await olustur.mutateAsync(govde), !mevcut);
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) {
        setSunucuHatalari(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-kullanici-form [aria-invalid="true"]')?.focus());
      } else {
        setSunucuMesaji(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  return (
    <Pencere
      baslik={mevcut ? `${mevcut.adSoyad} kaydını düzenle` : "Yeni kullanıcı"}
      altBaslik={mevcut ? (kendisi ? "Kendi yetkinizi ve durumunuzu değiştiremezsiniz." : "Yetki değişikliği bir sonraki girişte geçerli olur.") : "Kullanıcı şifresini e-postasına gelen bağlantıyla belirler."}
      onClose={onClose}
      genislik="max-w-lg"
    >
      <form id="bn-kullanici-form" noValidate onSubmit={kaydet} className="flex flex-col gap-3" aria-busy={gonderiliyor}>
        {mevcut && <DenetimNotu kayit={mevcut} />}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Alan id="bn-k-ad" etiket="Ad soyad" hata={h("adSoyad")} className="sm:col-span-2">
            <input id="bn-k-ad" value={f.adSoyad} onChange={(e) => degistir({ ...f, adSoyad: e.target.value })} aria-invalid={h("adSoyad") ? true : undefined} className={inputCls(h("adSoyad"))} />
          </Alan>
          <Alan id="bn-k-eposta" etiket="E-posta" hata={h("email")} ipucu={mevcut ? undefined : "Giriş adı olarak kullanılır."}>
            <input id="bn-k-eposta" type="email" value={f.email} onChange={(e) => degistir({ ...f, email: e.target.value })} aria-invalid={h("email") ? true : undefined} className={inputCls(h("email"))} />
          </Alan>
          <Alan id="bn-k-tel" etiket="Telefon" hata={h("telefon")}>
            <input id="bn-k-tel" type="tel" value={f.telefon} onChange={(e) => degistir({ ...f, telefon: e.target.value })} aria-invalid={h("telefon") ? true : undefined} className={`${inputCls(h("telefon"))} tabular-nums`} />
          </Alan>
        </div>

        <fieldset aria-describedby={h("yetki") ? "bn-k-yetki-hata" : undefined}>
          <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Yetki</legend>
          <div role="radiogroup" aria-label="Yetki" className="grid grid-cols-1 gap-2">
            {YETKILER.map((y) => {
              const secili = f.yetki === y;
              return (
                <button
                  key={y}
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  disabled={kendisi}
                  onClick={() => degistir({ ...f, yetki: y })}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    secili ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                  } ${FOCUS}`}
                >
                  <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${secili ? "border-[var(--brand)] bg-[var(--brand)]" : "border-[var(--border-strong)]"}`} aria-hidden="true">
                    {secili && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="leading-snug">
                    <span className="block text-[12.5px] font-bold text-[var(--fg)]">{etiket("yetki", y)}</span>
                    <span className="block text-[11.5px] text-[var(--muted)]">{etiket("yetkiAciklamasi", y)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {h("yetki") && (
            <p id="bn-k-yetki-hata" role="alert" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
              {h("yetki")}
            </p>
          )}
        </fieldset>

        <label className={`flex items-start gap-3 rounded-xl border p-3 ${kendisi ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${h("durum") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
          <input type="checkbox" role="switch" disabled={kendisi} checked={f.durum === "AKTIF"} onChange={(e) => degistir({ ...f, durum: e.target.checked ? "AKTIF" : "PASIF" })} aria-invalid={h("durum") ? true : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
          <span className="leading-snug">
            <span className="block text-[12.5px] font-bold text-[var(--fg)]">Aktif</span>
            <span className="block text-[11.5px] text-[var(--muted)]">Pasif kullanıcı panele giremez; firmanın en az bir aktif Yöneticisi olmalıdır.</span>
          </span>
        </label>
        {h("durum") && (
          <p role="alert" className="-mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
            {h("durum")}
          </p>
        )}
        {sunucuMesaji && (
          <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
            {sunucuMesaji}
          </p>
        )}
        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
            Vazgeç
          </button>
          <button type="submit" disabled={gonderiliyor} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            {gonderiliyor ? "Kaydediliyor…" : mevcut ? "Değişiklikleri Kaydet" : "Kaydet"}
          </button>
        </div>
      </form>
    </Pencere>
  );
}

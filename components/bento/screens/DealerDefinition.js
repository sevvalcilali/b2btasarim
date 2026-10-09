// Bayi Tanım › Liste · Tanımlama — veri: GET/POST /bayiler, GET/PUT /bayiler/{cariNo}, GET /firma,
// GET /vade-farki-profilleri, GET /uye-isyerleri, POST /musteriler (müşteri türü seçilirse).
// Şartname s.5: ana firma bayi, bayi (yetkisi varsa) alt bayi tanımlar; alt bayi tanım yapamaz.
// Listedeki "Ödeme Al", şartname s.2'deki "bayi cari kartından bayi adına ödeme" işlevidir.
import { useCallback, useEffect, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/error";
import { kurusCoz, sayi, tarihSaat, tl, yuzde } from "@/lib/format";
import { durumTonu, etiket } from "@/lib/labels";
import { useBayi, useBayiGuncelle, useBayiOlustur, useBayiler, useMusteriOlustur } from "@/lib/queries/dealers";
import { useIslemler } from "@/lib/queries/transactions";
import { useFirma, useUyeIsyerleri, useVadeFarkiProfilleri } from "@/lib/queries/definitions";
import { BosDurum, HataKutusu, Yukleniyor } from "../states";
import { Konum, Bildirim, inputCls, Alan, FormBolum, YanPanel, OnayPenceresi, DenetimNotu } from "../shared";
import { EylemMenusu, SiraliBaslik, useSiralama } from "../table";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";
import { rakamlar, useGecikmeli } from "../helpers";

const TUM_TAKSITLER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const taksitOzeti = (l) => l.map((n) => (n === 1 ? "Tek" : n)).join(", ");
const profilAdi = (p) => (p ? `${p.ad.replace("Vade Farkı ", "")} · ${yuzde(p.oranYuzde, 2)}` : "—");
/** Liste kaydından PUT /bayiler/{cariNo} gövdesi: yalnız durum değişir, tanım alanları olduğu gibi gider */
const bayiGovdesi = (b, durum) => ({
  tur: b.tur,
  unvan: b.unvan,
  cariNo: b.cariNo,
  vergiNo: b.vergiNo,
  telefon: b.telefon,
  email: b.email,
  adres: b.adres,
  vadeProfilId: b.vadeProfilId,
  taksitler: b.taksitler,
  islemLimitiKurus: b.islemLimitiKurus,
  uyeIsyerleri: b.uyeIsyerleri,
  altBayiYetkisi: b.tur === "BAYI" ? b.altBayiYetkisi : undefined,
  durum,
});
// sütun → sıralama değeri (liste ekranda sıralanır; tüm kayıtlar yüklü)
const BAYI_SUTUNLARI = {
  unvan: (b) => b.unvan,
  bagli: (b) => b.bagli?.unvan,
  vadeProfil: (b) => b.vadeProfil?.oranYuzde ?? null,
  islemLimitiKurus: (b) => b.islemLimitiKurus,
  altBayiSayisi: (b) => b.altBayiSayisi ?? null,
  durum: (b) => b.durum,
};

export function BayiListesi({ role, meta, tumAltBayiler, vurgu, kayitAdi, onNavigate }) {
  const altListe = role === ROLES.BAYI || tumAltBayiler;
  const baslik = altListe ? "Alt Bayi Listesi" : "Bayi Liste";
  const grup = role === ROLES.BAYI ? "Alt Bayi Tanım" : "Bayi Tanım";

  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("");
  const q = useGecikmeli(arama.trim());
  const sorgu = useBayiler({ tur: altListe ? "ALT_BAYI" : "BAYI", durum: durum || undefined, q: q || undefined });
  const veri = sorgu.data;
  const satirlar = veri?.kayitlar || [];
  const duzenlenebilir = veri?.duzenlenebilir ?? !tumAltBayiler;
  const { sirali, siralama, sirala } = useSiralama(satirlar, BAYI_SUTUNLARI);
  const [detay, setDetay] = useState(null); // sağ panelde açık bayi (cari no)

  // tanımlamadan dönüşte: kaydedilen satır vurgulanır, kısa bilgi gösterilir
  const [bildirim, setBildirim] = useState(null); // { metin, eylem? }
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  useEffect(() => {
    if (!vurgu || !veri) return;
    const satir = veri.kayitlar.find((b) => b.cariNo === vurgu);
    setBildirim({ metin: satir ? `${satir.unvan} kaydedildi.` : `${kayitAdi || vurgu} düzenli müşteri olarak kaydedildi.` });
  }, [vurgu, kayitAdi, veri]);

  // durum değişikliği: pasife alma onay ister, bildirimden geri alınabilir; aktife alma doğrudan
  const guncelle = useBayiGuncelle();
  const [pasifeAlinacak, setPasifeAlinacak] = useState(null);
  const durumDegistir = async (b, durum) => {
    try {
      await guncelle.mutateAsync({ cariNo: b.cariNo, govde: bayiGovdesi(b, durum) });
      setBildirim(
        durum === "PASIF"
          ? { metin: `${b.unvan} pasife alındı; ödeme ekranlarında görünmez.`, eylem: { etiket: "Geri al", onClick: () => durumDegistir(b, "AKTIF") } }
          : { metin: `${b.unvan} yeniden aktif.` }
      );
    } catch (err) {
      setBildirim({ metin: err?.message || "Durum değiştirilemedi." });
    } finally {
      setPasifeAlinacak(null);
    }
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={[grup, baslik]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{baslik}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} ·{" "}
            {tumAltBayiler ? "Ağdaki tüm alt bayiler; tanımlarını bağlı oldukları bayi yapar" : veri ? `${sayi(veri.sayaclar.TUMU)} tanımlı ${altListe ? "alt bayi" : "bayi"}` : "Yükleniyor…"}
          </p>
        </div>
        {duzenlenebilir && (
          <button
            type="button"
            onClick={() => onNavigate("/bayi-tanim/tanimlama")}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            {altListe ? "Yeni Alt Bayi" : "Yeni Bayi"}
          </button>
        )}
      </div>

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label={baslik} aria-busy={sorgu.isFetching}>
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
              placeholder="Unvan, cari no, vergi no"
              className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
            />
          </label>
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
                  <SiraliBaslik alan="unvan" siralama={siralama} onSirala={sirala} className={th}>Unvan / Cari · Vergi No</SiraliBaslik>
                  <th scope="col" className={th}>İletişim</th>
                  {tumAltBayiler && <SiraliBaslik alan="bagli" siralama={siralama} onSirala={sirala} className={th}>Bağlı Bayi</SiraliBaslik>}
                  <SiraliBaslik alan="vadeProfil" siralama={siralama} onSirala={sirala} className={th}>Vade Profili</SiraliBaslik>
                  <th scope="col" className={th}>Taksitler</th>
                  <SiraliBaslik alan="islemLimitiKurus" siralama={siralama} onSirala={sirala} className={`${th} text-right`}>İşlem Limiti</SiraliBaslik>
                  {!altListe && <SiraliBaslik alan="altBayiSayisi" siralama={siralama} onSirala={sirala} className={th}>Alt Bayi</SiraliBaslik>}
                  <SiraliBaslik alan="durum" siralama={siralama} onSirala={sirala} className={th}>Durum</SiraliBaslik>
                  <th scope="col" className={th}>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sirali.map((b, i) => (
                  <tr
                    key={b.cariNo}
                    className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${vurgu === b.cariNo ? "bg-[var(--success-soft)]" : ""}`}
                  >
                    <td className={td}>
                      <button type="button" onClick={() => setDetay(b.cariNo)} title="Detayı aç" className={`bn-yazdir-koru block rounded text-left font-semibold text-[var(--fg)] hover:text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                        {b.unvan}
                      </button>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                        {b.cariNo} · VKN {b.vergiNo}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="block tabular-nums text-[var(--fg-2)]">{b.telefon}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{b.email}</span>
                    </td>
                    {tumAltBayiler && <td className={`${td} text-[var(--fg-2)]`}>{b.bagli?.unvan}</td>}
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{profilAdi(b.vadeProfil)}</td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{taksitOzeti(b.taksitler)}</td>
                    <td className={`${td} text-right font-semibold tabular-nums text-[var(--fg)]`}>{tl(b.islemLimitiKurus)}</td>
                    {!altListe && (
                      <td className={td}>
                        <span className="block font-semibold tabular-nums text-[var(--fg-2)]">{b.altBayiSayisi}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{b.altBayiYetkisi ? "Tanımlayabilir" : "Yetkisi yok"}</span>
                      </td>
                    )}
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(b.durum)}`}>{etiket("kayitDurumu", b.durum)}</span>
                    </td>
                    <td className={`${td} text-right`}>
                      <EylemMenusu
                        etiket={`${b.unvan} işlemleri`}
                        ogeler={[
                          { etiket: "Detay", ikon: "panel", onClick: () => setDetay(b.cariNo) },
                          duzenlenebilir && { etiket: "Düzenle", ikon: "edit", onClick: () => onNavigate("/bayi-tanim/tanimlama", { duzenle: b.cariNo }) },
                          duzenlenebilir && b.durum === "AKTIF" && { etiket: "Ödeme Al", ikon: "wallet", onClick: () => onNavigate("/odeme/manuel", { musteri: b.cariNo }) },
                          duzenlenebilir && (b.durum === "AKTIF" ? { etiket: "Pasife al", ikon: "x", tonu: "danger", onClick: () => setPasifeAlinacak(b) } : { etiket: "Aktife al", ikon: "check", onClick: () => durumDegistir(b, "AKTIF") }),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {satirlar.length === 0 &&
              (arama || durum ? (
                <BosDurum baslik="Kayıt bulunamadı" aciklama="Arama ya da durum filtresine uyan kayıt yok." eylemler={[{ etiket: "Filtreleri temizle", onClick: () => { setArama(""); setDurum(""); } }]} />
              ) : (
                <BosDurum
                  baslik={tumAltBayiler ? "Ağda henüz alt bayi yok" : `Henüz ${altListe ? "alt bayi" : "bayi"} tanımlı değil`}
                  aciklama={tumAltBayiler ? "Alt bayileri bağlı oldukları bayiler tanımlar." : "Tek tek tanımlayın ya da Excel şablonuyla toplu ekleyin."}
                  ikon="dealer"
                  eylemler={
                    duzenlenebilir && [
                      { etiket: altListe ? "Yeni Alt Bayi" : "Yeni Bayi", ikon: "plus", birincil: true, onClick: () => onNavigate("/bayi-tanim/tanimlama") },
                      { etiket: "Excel ile Toplu Ekleme", ikon: "download", onClick: () => onNavigate("/bayi-tanim/excel-ekleme") },
                    ]
                  }
                />
              ))}
          </div>
        )}
      </section>
      {detay && <BayiDetayPaneli cariNo={detay} duzenlenebilir={duzenlenebilir} onClose={() => setDetay(null)} onNavigate={onNavigate} />}
      {pasifeAlinacak && (
        <OnayPenceresi
          baslik={`${pasifeAlinacak.unvan} pasife alınsın mı?`}
          mesaj={`Pasif ${altListe ? "alt bayi" : "bayi"} ödeme ekranlarındaki müşteri listesinden kalkar; kayıt ve geçmiş işlemler silinmez. Bildirimdeki "Geri al" ile ya da Düzenle'den yeniden aktif edebilirsiniz.`}
          onayEtiketi="Pasife Al"
          tonu="danger"
          mesgul={guncelle.isPending}
          onOnay={() => durumDegistir(pasifeAlinacak, "PASIF")}
          onClose={() => setPasifeAlinacak(null)}
        />
      )}
      {bildirim && <Bildirim metin={bildirim.metin} eylem={bildirim.eylem} onBitti={bildirimBitti} />}
    </>
  );
}

// Sağ panel: bayinin kimliği, koşulları ve son işlemleri — veri: GET /bayiler/{cariNo}, GET /islemler?firmaId=&boyut=5
function BayiDetayPaneli({ cariNo, duzenlenebilir, onClose, onNavigate }) {
  const bayi = useBayi(cariNo);
  const islemler = useIslemler({ firmaId: cariNo, boyut: 5 });
  const b = bayi.data;
  const Satir = ({ ad, children }) => (
    <div className="flex items-start justify-between gap-4 py-1.5 text-[12.5px]">
      <dt className="shrink-0 text-[var(--muted)]">{ad}</dt>
      <dd className="text-right font-semibold text-[var(--fg)]">{children}</dd>
    </div>
  );
  const dugme = (birincil) =>
    `inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-[13px] font-bold transition ${birincil ? "bg-[var(--brand)] text-white hover:brightness-110" : "border border-[var(--border-strong)] text-[var(--fg-2)] hover:border-[var(--brand)]"} ${FOCUS}`;
  return (
    <YanPanel
      baslik={b?.unvan || "Bayi"}
      altBaslik={b ? `${etiket("firmaTuru", b.tur)} · ${b.cariNo} · VKN ${b.vergiNo}` : undefined}
      onClose={onClose}
      altBar={
        b &&
        duzenlenebilir && (
          <>
            <button type="button" onClick={() => onNavigate("/bayi-tanim/tanimlama", { duzenle: b.cariNo })} className={dugme(false)}>
              <I name="edit" size={14} />
              Düzenle
            </button>
            {b.durum === "AKTIF" && (
              <button type="button" onClick={() => onNavigate("/odeme/manuel", { musteri: b.cariNo })} className={dugme(true)}>
                <I name="wallet" size={14} />
                Ödeme Al
              </button>
            )}
          </>
        )
      }
    >
      {bayi.isPending ? (
        <Yukleniyor satir={6} baslik={false} />
      ) : bayi.isError ? (
        <HataKutusu hata={bayi.error} onTekrar={() => bayi.refetch()} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(b.durum)}`}>{etiket("kayitDurumu", b.durum)}</span>
            {b.bagli && <span className="text-[11.5px] text-[var(--muted)]">{b.bagli.unvan} ağında</span>}
          </div>
          <section>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">İletişim</h3>
            <dl className="divide-y divide-[var(--border)]">
              <Satir ad="Telefon"><span className="tabular-nums">{b.telefon}</span></Satir>
              <Satir ad="E-posta">{b.email}</Satir>
              <Satir ad="Adres"><span className="block max-w-[260px]">{b.adres}</span></Satir>
            </dl>
          </section>
          <section>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Ödeme Koşulları</h3>
            <dl className="divide-y divide-[var(--border)]">
              <Satir ad="Vade profili">{profilAdi(b.vadeProfil)}</Satir>
              <Satir ad="Taksitler"><span className="tabular-nums">{taksitOzeti(b.taksitler)}</span></Satir>
              <Satir ad="İşlem limiti"><span className="tabular-nums">{tl(b.islemLimitiKurus)}</span></Satir>
              {b.tur === "BAYI" && <Satir ad="Alt bayi">{sayi(b.altBayiSayisi)} · {b.altBayiYetkisi ? "tanımlayabilir" : "yetkisi yok"}</Satir>}
              <Satir ad="Üye işyerleri"><span className="tabular-nums">{b.uyeIsyerleri.join(", ") || "—"}</span></Satir>
            </dl>
          </section>
          <section>
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Son İşlemler</h3>
            {islemler.isPending ? (
              <Yukleniyor satir={3} baslik={false} />
            ) : (islemler.data?.kayitlar || []).length === 0 ? (
              <p className="py-2 text-[12.5px] text-[var(--muted)]">Henüz işlemi yok.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {islemler.data.kayitlar.map((t) => (
                  <li key={t.islemNo} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-[var(--fg)]">{t.musteri.unvan}</span>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.islemNo} · {tarihSaat(t.tarih)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-bold tabular-nums text-[var(--fg)]">{tl(t.tutarKurus)}</span>
                      <span className={`inline-flex rounded-full px-1.5 py-px text-[10.5px] font-bold ${durumTonu(t.durum)}`}>{etiket("islemDurumu", t.durum)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {islemler.data?.toplam > 5 && <p className="mt-1 text-[11.5px] text-[var(--muted)]">Toplam {sayi(islemler.data.toplam)} işlem · tümü İşlem Detayları'nda</p>}
          </section>
          <DenetimNotu kayit={b} className="border-t border-[var(--border)] pt-3" />
        </div>
      )}
    </YanPanel>
  );
}

// Tanımlama: önce gerekli veriler (kendi kayıt, profiller, üye işyerleri, düzenleniyorsa kayıt) yüklenir, sonra form kurulur.
export function BayiTanimlama({ role, meta, duzenleCari, onNavigate }) {
  const altMi = role === ROLES.BAYI; // bayi alt bayi tanımlar
  const grup = altMi ? "Alt Bayi Tanım" : "Bayi Tanım";
  const firma = useFirma();
  const profiller = useVadeFarkiProfilleri();
  const uyeler = useUyeIsyerleri();
  const mevcut = useBayi(duzenleCari);
  const sorgular = [firma, profiller, uyeler, ...(duzenleCari ? [mevcut] : [])];
  const hatali = sorgular.find((s) => s.isError);
  const hazir = sorgular.every((s) => s.isSuccess);

  const baslik = (
    <div className="bn-rise mb-4 px-1">
      <Konum onHome={() => onNavigate(HOME)} yol={[grup, duzenleCari ? "Düzenle" : "Tanımlama"]} />
      <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{mevcut.data ? `${mevcut.data.unvan} — Düzenle` : altMi ? "Alt Bayi Tanımlama" : "Bayi Tanımlama"}</h1>
      <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
        {meta.company} · {altMi ? "Alt bayiye verilen sınırlar kendi sınırlarınızı aşamaz" : "Bayinin ödeme sınırlarını ve göreceği üye işyerlerini belirleyin"}
      </p>
    </div>
  );

  if (hatali) {
    return (
      <>
        {baslik}
        <div className={`${CARD} hover:!translate-y-0`}>
          <HataKutusu hata={hatali.error} onTekrar={() => sorgular.forEach((s) => s.isError && s.refetch())} />
        </div>
      </>
    );
  }
  if (!hazir) {
    return (
      <>
        {baslik}
        <div className={`max-w-4xl ${CARD} hover:!translate-y-0`}>
          <Yukleniyor satir={6} />
        </div>
      </>
    );
  }
  if (altMi && !firma.data.altBayiYetkisi) {
    return (
      <>
        {baslik}
        <p className={`bn-rise flex items-start gap-2 p-5 text-[13px] text-[var(--fg-2)] ${CARD} hover:!translate-y-0`}>
          <I name="info" size={16} className="mt-px shrink-0 text-[var(--brand-text)]" />
          Alt bayi tanımlama yetkiniz bulunmuyor. Bu yetki ana firmanın bayi tanımından açılır.
        </p>
      </>
    );
  }
  return (
    <>
      {baslik}
      <BayiFormu
        key={duzenleCari || "yeni"}
        altMi={altMi}
        kayit={firma.data}
        profiller={profiller.data.kayitlar}
        uyeSecenekleri={uyeler.data.kayitlar}
        mevcut={mevcut.data || null}
        onNavigate={onNavigate}
      />
    </>
  );
}

const TUR_ETIKETI = { BAYI: "Bayi", ALT_BAYI: "Alt Bayi", MUSTERI: "Müşteri" };

function BayiFormu({ altMi, kayit, profiller, uyeSecenekleri, mevcut, onNavigate }) {
  const turSecenekleri = altMi ? ["ALT_BAYI", "MUSTERI"] : ["BAYI", "MUSTERI"];
  const taksitSecenekleri = altMi ? kayit.taksitler : TUM_TAKSITLER;
  const ustLimit = altMi ? kayit.islemLimitiKurus : null;
  const aktifProfiller = profiller.filter((v) => v.durum === "AKTIF" || v.id === mevcut?.vadeProfilId);

  const [f, setF] = useState(() => ({
    tur: turSecenekleri[0],
    unvan: mevcut?.unvan || "",
    cariNo: mevcut?.cariNo || "",
    vergiNo: mevcut?.vergiNo || "",
    telefon: mevcut?.telefon || "",
    email: mevcut?.email || "",
    adres: mevcut?.adres || "",
    vadeProfilId: mevcut?.vadeProfilId || aktifProfiller[0]?.id || 1,
    taksitler: mevcut?.taksitler || taksitSecenekleri,
    limit: mevcut ? String(Math.round(mevcut.islemLimitiKurus / 100)) : "",
    altBayiYetkisi: mevcut?.altBayiYetkisi ?? false,
    uyeIsyerleri: mevcut?.uyeIsyerleri || uyeSecenekleri.map((u) => u.cariNo),
    durum: mevcut?.durum || "AKTIF",
  }));
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const alan = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const bayiTuru = f.tur !== "MUSTERI";
  const listeHref = "/bayi-tanim/liste";

  const olustur = useBayiOlustur();
  const guncelle = useBayiGuncelle();
  const musteriOlustur = useMusteriOlustur();
  const gonderiliyor = olustur.isPending || guncelle.isPending || musteriOlustur.isPending;

  // ekran tarafı doğrulama (hızlı geri bildirim) — sunucu aynı kuralları uygular, cevabındaki alan hataları da gösterilir
  const limitKurus = kurusCoz(f.limit);
  const hatalar = {};
  if (!f.unvan.trim()) hatalar.unvan = "Unvan girin.";
  if (!/^\d{3}\.\d{2}\.\d{3}$/.test(f.cariNo)) hatalar.cariNo = "Cari no 000.00.000 biçiminde olmalı.";
  if (rakamlar(f.vergiNo).length !== 10) hatalar.vergiNo = "10 haneli vergi no girin.";
  if (rakamlar(f.telefon).length < 10) hatalar.telefon = "Geçerli bir telefon girin.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) hatalar.email = "Geçerli bir e-posta girin.";
  if (!f.adres.trim()) hatalar.adres = "Adres girin.";
  if (bayiTuru) {
    if (f.taksitler.length === 0) hatalar.taksitler = "En az bir taksit açık olmalı.";
    if (!(limitKurus > 0)) hatalar.islemLimitiKurus = "İşlem bazlı ödeme limiti girin.";
    else if (ustLimit && limitKurus > ustLimit) hatalar.islemLimitiKurus = `Kendi limitinizi (${tl(ustLimit)}) aşamaz.`;
    if (f.uyeIsyerleri.length === 0) hatalar.uyeIsyerleri = "En az bir üye işyeri seçin.";
  }
  const h = (k) => sunucuHatalari[k] || (denendi ? hatalar[k] : undefined);
  const degistir = (yeni) => {
    setF(yeni);
    if (Object.keys(sunucuHatalari).length) setSunucuHatalari({}); // kullanıcı düzeltince sunucu hatası silinir
  };

  const kaydet = async (e) => {
    e.preventDefault();
    setDenendi(true);
    setSunucuMesaji(null);
    if (Object.keys(hatalar).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-bayi-form [aria-invalid="true"]')?.focus());
      return;
    }
    const kimlik = { unvan: f.unvan.trim(), cariNo: f.cariNo, vergiNo: rakamlar(f.vergiNo), telefon: f.telefon.trim(), email: f.email.trim(), adres: f.adres.trim() };
    try {
      if (!bayiTuru) {
        // müşteri türü: tanımlı (düzenli) müşteri olur; ödeme ekranlarında listeden seçilir
        const m = await musteriOlustur.mutateAsync(kimlik);
        onNavigate(listeHref, { kaydedildi: m.cariNo, ad: m.unvan });
        return;
      }
      const govde = {
        tur: f.tur,
        ...kimlik,
        vadeProfilId: Number(f.vadeProfilId),
        taksitler: [...f.taksitler].sort((a, b) => a - b),
        islemLimitiKurus: limitKurus,
        uyeIsyerleri: f.uyeIsyerleri,
        altBayiYetkisi: altMi ? undefined : f.altBayiYetkisi,
        durum: f.durum,
      };
      const kaydedilen = mevcut ? await guncelle.mutateAsync({ cariNo: mevcut.cariNo, govde }) : await olustur.mutateAsync(govde);
      onNavigate(listeHref, { kaydedildi: kaydedilen.cariNo });
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) {
        setSunucuHatalari(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-bayi-form [aria-invalid="true"]')?.focus());
      } else {
        setSunucuMesaji(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  const secimDugmesi = (secili, onClick, icerik, key) => (
    <button
      key={key}
      type="button"
      role="checkbox"
      aria-checked={secili}
      onClick={onClick}
      className={`inline-flex h-9 min-w-[44px] items-center justify-center rounded-full px-3 text-[12.5px] tabular-nums transition ${
        secili ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
      } ${FOCUS}`}
    >
      {icerik}
    </button>
  );

  return (
    <form id="bn-bayi-form" noValidate onSubmit={kaydet} className="flex max-w-4xl flex-col gap-3" aria-busy={gonderiliyor}>
      <FormBolum no={1} i={0} baslik="Kimlik ve İletişim" aciklama="Müşteri türü Müşteri seçilirse kayıt düzenli müşteri olarak tanımlanır.">
        <div role="radiogroup" aria-label="Müşteri türü" className="mb-4 flex gap-1">
          {turSecenekleri.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={f.tur === t}
              disabled={!!mevcut && t !== turSecenekleri[0]}
              onClick={() => degistir({ ...f, tur: t })}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                f.tur === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
              } ${FOCUS}`}
            >
              {TUR_ETIKETI[t]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Alan id="bn-b-unvan" etiket="Unvan" hata={h("unvan")} className="sm:col-span-2">
            <input id="bn-b-unvan" value={f.unvan} onChange={alan("unvan")} aria-invalid={h("unvan") ? true : undefined} className={inputCls(h("unvan"))} />
          </Alan>
          <Alan id="bn-b-cari" etiket="Cari No" hata={h("cariNo")} ipucu={mevcut ? "Cari no değiştirilemez." : undefined}>
            <input
              id="bn-b-cari"
              value={f.cariNo}
              readOnly={!!mevcut}
              onChange={(e) => degistir({ ...f, cariNo: e.target.value })}
              placeholder={altMi ? "540.02.014" : "320.01.006"}
              aria-invalid={h("cariNo") ? true : undefined}
              className={`${inputCls(h("cariNo"))} tabular-nums`}
            />
          </Alan>
          <Alan id="bn-b-vkn" etiket="Vergi No" hata={h("vergiNo")}>
            <input
              id="bn-b-vkn"
              inputMode="numeric"
              maxLength={10}
              value={f.vergiNo}
              onChange={(e) => degistir({ ...f, vergiNo: rakamlar(e.target.value) })}
              aria-invalid={h("vergiNo") ? true : undefined}
              className={`${inputCls(h("vergiNo"))} tabular-nums`}
            />
          </Alan>
          <Alan id="bn-b-tel" etiket="Telefon" hata={h("telefon")}>
            <input id="bn-b-tel" type="tel" value={f.telefon} onChange={alan("telefon")} aria-invalid={h("telefon") ? true : undefined} className={`${inputCls(h("telefon"))} tabular-nums`} />
          </Alan>
          <Alan id="bn-b-eposta" etiket="E-posta" hata={h("email")}>
            <input id="bn-b-eposta" type="email" value={f.email} onChange={alan("email")} aria-invalid={h("email") ? true : undefined} className={inputCls(h("email"))} />
          </Alan>
          <Alan id="bn-b-adres" etiket="Adres" hata={h("adres")} className="sm:col-span-2">
            <textarea id="bn-b-adres" rows={2} value={f.adres} onChange={alan("adres")} aria-invalid={h("adres") ? true : undefined} className={`${inputCls(h("adres"))} h-auto py-2`} />
          </Alan>
        </div>
      </FormBolum>

      {bayiTuru && (
        <FormBolum no={2} i={1} baslik="Ödeme Koşulları" aciklama="Kaldırılan taksitler, tek çekim dahil, ödeme ekranlarında gösterilmez.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Alan id="bn-b-profil" etiket="Vade farkı profili" hata={h("vadeProfilId")}>
              <select id="bn-b-profil" value={f.vadeProfilId} onChange={alan("vadeProfilId")} aria-invalid={h("vadeProfilId") ? true : undefined} className={inputCls(h("vadeProfilId"))}>
                {aktifProfiller.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.ad.replace("Vade Farkı ", "")} · {yuzde(v.oranYuzde, 2)} — {v.aciklama}
                    {v.durum === "PASIF" ? " (pasif)" : ""}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan
              id="bn-b-limit"
              etiket="İşlem bazlı ödeme limiti"
              hata={h("islemLimitiKurus")}
              ipucu={ustLimit ? `Üst sınır: ${tl(ustLimit)} (kendi limitiniz)` : "Tek bir işlemde alınabilecek en yüksek tutar."}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                <input
                  id="bn-b-limit"
                  inputMode="numeric"
                  value={f.limit ? Number(rakamlar(f.limit)).toLocaleString("tr-TR") : ""}
                  onChange={(e) => degistir({ ...f, limit: rakamlar(e.target.value) })}
                  aria-invalid={h("islemLimitiKurus") ? true : undefined}
                  className={`${inputCls(h("islemLimitiKurus"))} pl-7 font-bold tabular-nums`}
                />
              </div>
            </Alan>
            <fieldset className="sm:col-span-2" aria-describedby={h("taksitler") ? "bn-b-taksit-hata" : undefined}>
              <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">
                Görebileceği taksitler {altMi && <span className="font-normal text-[var(--muted)]">— yalnızca sizin görebildiğiniz taksitler arasından</span>}
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {taksitSecenekleri.map((n) =>
                  secimDugmesi(
                    f.taksitler.includes(n),
                    () => degistir({ ...f, taksitler: f.taksitler.includes(n) ? f.taksitler.filter((x) => x !== n) : [...f.taksitler, n] }),
                    n === 1 ? "Tek Çekim" : n,
                    n
                  )
                )}
              </div>
              {h("taksitler") && (
                <p id="bn-b-taksit-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                  {h("taksitler")}
                </p>
              )}
            </fieldset>
            <fieldset className="sm:col-span-2" aria-describedby={h("uyeIsyerleri") ? "bn-b-uye-hata" : undefined}>
              <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Göreceği ana firma üye işyerleri</legend>
              <div className="flex flex-wrap gap-1.5">
                {uyeSecenekleri.map((u) =>
                  secimDugmesi(
                    f.uyeIsyerleri.includes(u.cariNo),
                    () => degistir({ ...f, uyeIsyerleri: f.uyeIsyerleri.includes(u.cariNo) ? f.uyeIsyerleri.filter((x) => x !== u.cariNo) : [...f.uyeIsyerleri, u.cariNo] }),
                    `${u.ad} — ${u.cariNo}`,
                    u.cariNo
                  )
                )}
              </div>
              {h("uyeIsyerleri") && (
                <p id="bn-b-uye-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                  {h("uyeIsyerleri")}
                </p>
              )}
            </fieldset>
            {!altMi && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-3 sm:col-span-2">
                <input type="checkbox" role="switch" checked={f.altBayiYetkisi} onChange={(e) => degistir({ ...f, altBayiYetkisi: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
                <span className="leading-snug">
                  <span className="block text-[12.5px] font-bold text-[var(--fg)]">Alt bayi tanımlayabilir</span>
                  <span className="block text-[11.5px] text-[var(--muted)]">Açıksa bayi kendi alt bayilerini tanımlayabilir.</span>
                </span>
              </label>
            )}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-3 sm:col-span-2">
              <input
                type="checkbox"
                role="switch"
                checked={f.durum === "AKTIF"}
                onChange={(e) => degistir({ ...f, durum: e.target.checked ? "AKTIF" : "PASIF" })}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
              />
              <span className="leading-snug">
                <span className="block text-[12.5px] font-bold text-[var(--fg)]">Aktif</span>
                <span className="block text-[11.5px] text-[var(--muted)]">Pasif kayıtlar ödeme ekranlarındaki müşteri listesinde görünmez.</span>
              </span>
            </label>
          </div>
        </FormBolum>
      )}

      {sunucuMesaji && (
        <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
          {sunucuMesaji}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onNavigate(listeHref)}
          className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={gonderiliyor}
          className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}
        >
          <I name="check" size={15} strokeWidth={2.2} />
          {gonderiliyor ? "Kaydediliyor…" : mevcut ? "Değişiklikleri Kaydet" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}

// Duyuru — şartname s.2: ana firma duyuru girer (DuyuruYonetimi, /duyuru); bayi ve alt bayi ekranlarına pop-up düşer
// (DuyuruPopup, ana sayfa); üst bardaki zil tüm duyuruları açar (DuyuruPenceresi).
// Veri: GET/POST /duyurular, PUT /duyurular/{id}, POST /duyurular/{id}/okundu
import { useCallback, useState } from "react";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { sayi, tarih } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useDuyuruGuncelle, useDuyuruOkundu, useDuyuruOlustur, useDuyurular } from "@/lib/sorgular/duyurular";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { hataBaglayici } from "../odeme";
import { Alan, Bildirim, Konum, Pencere, inputCls, OnayPenceresi, DenetimNotu } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";

const HEDEFLER = ["BAYI", "ALT_BAYI"];

const HedefRozetleri = ({ hedef }) => (
  <span className="flex flex-wrap gap-1">
    {hedef.map((r) => (
      <span key={r} className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-2)]">
        {etiket("firmaTuru", r)}
      </span>
    ))}
  </span>
);

// ───────────────────────── Ana firma: Duyuru yönetimi ─────────────────────────
export function DuyuruYonetimi({ meta, onNavigate }) {
  const sorgu = useDuyurular();
  const kayitlar = sorgu.data?.kayitlar || [];
  const duzenlenebilir = sorgu.data?.duzenlenebilir ?? false;
  const guncelle = useDuyuruGuncelle();
  const [duzenlenen, setDuzenlenen] = useState(null); // null · "yeni" · kayıt
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const yayinda = kayitlar.filter((d) => d.durum === "YAYINDA").length;

  const [arsivlenecek, setArsivlenecek] = useState(null); // onay bekleyen arşivleme
  const durumDegistir = async (d) => {
    const durum = d.durum === "YAYINDA" ? "ARSIV" : "YAYINDA";
    try {
      await guncelle.mutateAsync({ duyuruId: d.duyuruId, govde: { baslik: d.baslik, icerik: d.icerik, hedef: d.hedef, durum } });
      // arşivleme geri alınabilir: bildirimdeki "Geri al" duyuruyu yeniden yayına alır
      setBildirim(durum === "YAYINDA" ? { metin: `"${d.baslik}" yeniden yayında.` } : { metin: `"${d.baslik}" arşivlendi.`, eylem: { etiket: "Geri al", onClick: () => durumDegistir({ ...d, durum: "ARSIV" }) } });
    } catch (err) {
      setBildirim({ metin: err?.message || "Güncellenemedi." });
    } finally {
      setArsivlenecek(null);
    }
  };
  const th = "whitespace-nowrap px-4 py-2";
  const td = "px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["Duyuru"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Duyuru</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {sorgu.data ? `${sayi(yayinda)} yayında · ${sayi(kayitlar.length - yayinda)} arşiv` : "Yükleniyor…"} · Yayındaki duyuru bayi ve alt bayi ekranlarına pop-up olarak düşer
          </p>
        </div>
        {duzenlenebilir && (
          <button
            type="button"
            onClick={() => setDuzenlenen("yeni")}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Yeni Duyuru
          </button>
        )}
      </div>

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Duyurular" aria-busy={sorgu.isFetching || guncelle.isPending}>
        {sorgu.isPending ? (
          <Yukleniyor satir={3} baslik={false} />
        ) : sorgu.isError ? (
          <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
        ) : kayitlar.length === 0 ? (
          <BosDurum baslik="Henüz duyuru yok" aciklama="Yayınladığınız duyuru bayi ve alt bayi ekranlarına pop-up olarak düşer." ikon="megaphone" eylemler={duzenlenebilir && [{ etiket: "Yeni Duyuru", ikon: "plus", birincil: true, onClick: () => setDuzenlenen("yeni") }]} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th scope="col" className={`${th} min-w-[280px]`}>Duyuru</th>
                  <th scope="col" className={th}>Hedef</th>
                  <th scope="col" className={th}>Tarih</th>
                  <th scope="col" className={th}>Okunma</th>
                  <th scope="col" className={th}>Durum</th>
                  {duzenlenebilir && <th scope="col" className={`${th} text-right`}>İşlem</th>}
                </tr>
              </thead>
              <tbody>
                {kayitlar.map((d, i) => (
                  <tr key={d.duyuruId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${d.durum === "ARSIV" ? "opacity-70" : ""}`}>
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{d.baslik}</span>
                      <span className="mt-0.5 block max-w-md text-[11.5px] leading-snug text-[var(--muted)]">{d.icerik}</span>
                      <DenetimNotu kayit={d} className="mt-1" />
                    </td>
                    <td className={`${td} whitespace-nowrap`}><HedefRozetleri hedef={d.hedef} /></td>
                    <td className={`${td} whitespace-nowrap tabular-nums text-[var(--fg-2)]`}>{tarih(d.tarih)}</td>
                    <td className={`${td} whitespace-nowrap tabular-nums text-[var(--fg-2)]`}>
                      {sayi(d.okunma.okuyanAdet)} / {sayi(d.okunma.hedefAdet)} kullanıcı
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(d.durum)}`}>{etiket("duyuruDurumu", d.durum)}</span>
                    </td>
                    {duzenlenebilir && (
                      <td className={`${td} whitespace-nowrap text-right`}>
                        <span className="inline-flex gap-1">
                          <button type="button" onClick={() => setDuzenlenen(d)} className={`inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}>
                            <I name="edit" size={13} />
                            Düzenle
                          </button>
                          <button type="button" onClick={() => (d.durum === "YAYINDA" ? setArsivlenecek(d) : durumDegistir(d))} disabled={guncelle.isPending} className={`inline-flex h-8 items-center rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:opacity-60 ${FOCUS}`}>
                            {d.durum === "YAYINDA" ? "Arşivle" : "Yayına Al"}
                          </button>
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {duzenlenen && (
        <DuyuruFormu
          mevcut={duzenlenen === "yeni" ? null : duzenlenen}
          onClose={() => setDuzenlenen(null)}
          onKaydedildi={(d, yeniMi) => {
            setDuzenlenen(null);
            setBildirim({ metin: yeniMi ? (d.durum === "YAYINDA" ? `"${d.baslik}" yayınlandı; hedef ekranlarda pop-up olarak görünecek.` : `"${d.baslik}" arşive kaydedildi.`) : `"${d.baslik}" kaydedildi.` });
          }}
        />
      )}
      {arsivlenecek && (
        <OnayPenceresi
          baslik={`"${arsivlenecek.baslik}" arşivlensin mi?`}
          mesaj="Arşivlenen duyuru bayi ekranlarından kalkar; okunmamış olanlara pop-up açılmaz. Daha sonra yeniden yayına alabilirsiniz."
          onayEtiketi="Arşivle"
          mesgul={guncelle.isPending}
          onOnay={() => durumDegistir(arsivlenecek)}
          onClose={() => setArsivlenecek(null)}
        />
      )}
      {bildirim && <Bildirim metin={bildirim.metin} eylem={bildirim.eylem} onBitti={bildirimBitti} />}
    </>
  );
}

function DuyuruFormu({ mevcut, onClose, onKaydedildi }) {
  const [f, setF] = useState({ baslik: mevcut?.baslik || "", icerik: mevcut?.icerik || "", hedef: mevcut?.hedef || [...HEDEFLER], durum: mevcut?.durum || "YAYINDA" });
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const olustur = useDuyuruOlustur();
  const guncelle = useDuyuruGuncelle();
  const gonderiliyor = olustur.isPending || guncelle.isPending;

  const hatalar = {};
  if (!f.baslik.trim()) hatalar.baslik = "Başlık girin.";
  if (!f.icerik.trim()) hatalar.icerik = "Duyuru metnini girin.";
  if (f.hedef.length === 0) hatalar.hedef = "En az bir hedef seçin.";
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
      requestAnimationFrame(() => document.querySelector('#bn-duyuru-form [aria-invalid="true"]')?.focus());
      return;
    }
    const govde = { baslik: f.baslik.trim(), icerik: f.icerik.trim(), hedef: f.hedef, durum: f.durum };
    try {
      onKaydedildi(mevcut ? await guncelle.mutateAsync({ duyuruId: mevcut.duyuruId, govde }) : await olustur.mutateAsync(govde), !mevcut);
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) {
        setSunucuHatalari(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-duyuru-form [aria-invalid="true"]')?.focus());
      } else {
        setSunucuMesaji(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  return (
    <Pencere baslik={mevcut ? "Duyuruyu düzenle" : "Yeni duyuru"} altBaslik="Yayındaki duyuru hedef rollerin ana sayfasında pop-up olarak açılır; her kullanıcı bir kez okur." onClose={onClose} genislik="max-w-lg">
      <form id="bn-duyuru-form" noValidate onSubmit={kaydet} className="flex flex-col gap-3" aria-busy={gonderiliyor}>
        <Alan id="bn-d-baslik" etiket="Başlık" hata={h("baslik")}>
          <input id="bn-d-baslik" value={f.baslik} onChange={(e) => degistir({ ...f, baslik: e.target.value })} aria-invalid={h("baslik") ? true : undefined} className={inputCls(h("baslik"))} />
        </Alan>
        <Alan id="bn-d-icerik" etiket="Duyuru metni" hata={h("icerik")}>
          <textarea id="bn-d-icerik" rows={4} value={f.icerik} onChange={(e) => degistir({ ...f, icerik: e.target.value })} aria-invalid={h("icerik") ? true : undefined} className={`${inputCls(h("icerik"))} h-auto py-2`} />
        </Alan>
        <fieldset aria-describedby={h("hedef") ? "bn-d-hedef-hata" : undefined}>
          <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Hedef</legend>
          <div className="flex gap-1">
            {HEDEFLER.map((r) => {
              const secili = f.hedef.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  role="checkbox"
                  aria-checked={secili}
                  onClick={() => degistir({ ...f, hedef: secili ? f.hedef.filter((x) => x !== r) : [...f.hedef, r] })}
                  className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${secili ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                >
                  {etiket("firmaTuru", r)}
                </button>
              );
            })}
          </div>
          {h("hedef") && (
            <p id="bn-d-hedef-hata" role="alert" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
              {h("hedef")}
            </p>
          )}
        </fieldset>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-3">
          <input type="checkbox" role="switch" checked={f.durum === "YAYINDA"} onChange={(e) => degistir({ ...f, durum: e.target.checked ? "YAYINDA" : "ARSIV" })} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
          <span className="leading-snug">
            <span className="block text-[12.5px] font-bold text-[var(--fg)]">Yayında</span>
            <span className="block text-[11.5px] text-[var(--muted)]">Kapalıysa duyuru arşivde kalır, bayilere gösterilmez.</span>
          </span>
        </label>
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
            {gonderiliyor ? "Kaydediliyor…" : mevcut ? "Değişiklikleri Kaydet" : f.durum === "YAYINDA" ? "Yayınla" : "Kaydet"}
          </button>
        </div>
      </form>
    </Pencere>
  );
}

// ───────────────────────── Bayi / alt bayi: pop-up ve zil penceresi ─────────────────────────

// Ana sayfada okunmamış duyuruları sırayla açar; "Okudum" sunucuya yazılır (şartname s.2 pop-up)
export function DuyuruPopup() {
  const sorgu = useDuyurular();
  const okundu = useDuyuruOkundu();
  const [kapatilan, setKapatilan] = useState(() => new Set()); // bu oturumda kapatılanlar (sunucu cevabı gelene kadar)
  const okunmamis = (sorgu.data?.kayitlar || []).filter((d) => !d.okundu && !kapatilan.has(d.duyuruId));
  const d = okunmamis[0];
  if (!d) return null;
  const kapat = () => {
    setKapatilan((s) => new Set(s).add(d.duyuruId));
    okundu.mutate(d.duyuruId);
  };
  return (
    <Pencere key={d.duyuruId} baslik={d.baslik} altBaslik={`Ana firma duyurusu · ${tarih(d.tarih)}`} onClose={kapat} genislik="max-w-md">
      <p className="whitespace-pre-line text-[13px] leading-relaxed text-[var(--fg)]">{d.icerik}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[11.5px] text-[var(--muted)]">{okunmamis.length > 1 ? `${okunmamis.length} okunmamış duyuru` : "Son okunmamış duyuru"}</span>
        <button type="button" onClick={kapat} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
          <I name="check" size={15} strokeWidth={2.2} />
          Okudum
        </button>
      </div>
    </Pencere>
  );
}

// Üst bardaki zil: rolün görebildiği tüm duyurular (ana firma: yönetim listesine kısayol)
export function DuyuruPenceresi({ role, onClose }) {
  const sorgu = useDuyurular();
  const okundu = useDuyuruOkundu();
  const kayitlar = (sorgu.data?.kayitlar || []).filter((d) => d.durum === "YAYINDA");
  const anaMi = role === "ANA_FIRMA";
  return (
    <Pencere baslik="Duyurular" altBaslik={anaMi ? "Yayındaki duyurular; düzenlemek için menüden Duyuru ekranını açın." : "Ana firmanın yayındaki duyuruları"} onClose={onClose} genislik="max-w-lg">
      {sorgu.isPending ? (
        <Yukleniyor satir={3} baslik={false} />
      ) : sorgu.isError ? (
        <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
      ) : kayitlar.length === 0 ? (
        <BosDurum baslik="Yayında duyuru yok" ikon="megaphone" />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {kayitlar.map((d) => (
            <li key={d.duyuruId} className="flex items-start gap-3 py-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!anaMi && !d.okundu ? "bg-[var(--brand)]" : "bg-transparent"}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-[13px] font-bold text-[var(--fg)]">{d.baslik}</h3>
                  <span className="text-[11px] tabular-nums text-[var(--muted)]">{tarih(d.tarih)}</span>
                  {!anaMi && !d.okundu && <span className="rounded-full bg-[var(--brand-soft)] px-1.5 py-px text-[10px] font-bold text-[var(--brand-text)]">Yeni</span>}
                </div>
                <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-[var(--fg-2)]">{d.icerik}</p>
                {anaMi ? (
                  <div className="mt-1.5"><HedefRozetleri hedef={d.hedef} /></div>
                ) : (
                  !d.okundu && (
                    <button type="button" onClick={() => okundu.mutate(d.duyuruId)} disabled={okundu.isPending} className={`mt-2 inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:opacity-60 ${FOCUS}`}>
                      <I name="check" size={13} />
                      Okudum
                    </button>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Pencere>
  );
}

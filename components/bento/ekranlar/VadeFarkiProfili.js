// Ayarlar › Vade Farkı Profil Tanım — şartname s.4: ana firma en çok 5 vade farkı profili tanımlar; her bayi / alt bayi
// bir profile bağlanır. Veri: GET/POST /vade-farki-profilleri, PUT /vade-farki-profilleri/{id}
import { useCallback, useState } from "react";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { sayi, tl, yuzde } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useVadeFarkiProfilleri, useVadeFarkiProfiliGuncelle, useVadeFarkiProfiliOlustur } from "@/lib/sorgular/tanimlar";
import { BosDurum, HataKutusu, YukleniyorKutu } from "../durumlar";
import { hataBaglayici } from "../odeme";
import { Alan, Bildirim, Konum, Pencere, inputCls } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";

const kisaAd = (ad) => ad.replace("Vade Farkı ", "");
const oranCoz = (s) => Number(String(s).trim().replace(",", "."));

export function VadeFarkiProfilTanim({ meta, onNavigate }) {
  const sorgu = useVadeFarkiProfilleri();
  const profiller = sorgu.data?.kayitlar || [];
  const sinir = sorgu.data?.sinir ?? 5;
  const doluMu = profiller.length >= sinir;
  const [duzenlenen, setDuzenlenen] = useState(null); // null: kapalı · "yeni" · profil kaydı
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const kaydedildi = (p) => {
    setDuzenlenen(null);
    setBildirim(`${kisaAd(p.ad)} kaydedildi.`);
  };

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["Ayarlar", "Vade Farkı Profil Tanım"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Vade Farkı Profil Tanım</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {sorgu.data ? `${sayi(profiller.length)} / ${sayi(sinir)} profil tanımlı` : "Yükleniyor…"} · Her bayi bir profile bağlanır, oran taksitli ödemelere uygulanır
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 md:items-end">
          <button
            type="button"
            disabled={!sorgu.data || doluMu}
            onClick={() => setDuzenlenen("yeni")}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
          >
            <I name="plus" size={14} strokeWidth={2.4} />
            Yeni Profil
          </button>
          {doluMu && <span className="text-[11px] text-[var(--muted)]">En çok {sinir} profil tanımlanabilir; yenisi için mevcut bir profili düzenleyin.</span>}
        </div>
      </div>

      {sorgu.isPending ? (
        <YukleniyorKutu satir={3} />
      ) : sorgu.isError ? (
        <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
      ) : profiller.length === 0 ? (
        <BosDurum baslik="Henüz profil yok" aciklama="Yeni Profil ile ilk vade farkı profilini tanımlayın." ikon="percent" />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Vade farkı profilleri">
          {profiller.map((p, i) => (
            <li key={p.id} style={{ "--i": i }} className={`bn-rise flex flex-col p-4 sm:p-5 ${CARD}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[13px] font-extrabold tabular-nums text-[var(--brand-text)]">P{p.id}</span>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--fg)]">{kisaAd(p.ad)}</h2>
                    <p className="text-[11.5px] text-[var(--muted)]">{p.aciklama || "Açıklama yok"}</p>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(p.durum)}`}>{etiket("kayitDurumu", p.durum)}</span>
              </div>

              <p className="mt-4 text-[26px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)]">
                {yuzde(p.oranYuzde, 2)}
                <span className="ml-1 text-[12px] font-semibold text-[var(--muted)]">/ ay</span>
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3 text-[12px]">
                <dt className="text-[var(--muted)]">Kullanan bayi</dt>
                <dd className="text-right font-bold tabular-nums text-[var(--fg)]">{sayi(p.kullananBayiSayisi)}</dd>
                <dt className="text-[var(--muted)]">
                  Örnek · {tl(p.ornek.tutarKurus)}, {p.ornek.taksit} taksit
                </dt>
                <dd className="text-right font-bold tabular-nums text-[var(--fg)]">+{tl(p.ornek.vadeFarkiKurus)}</dd>
              </dl>

              <button
                type="button"
                onClick={() => setDuzenlenen(p)}
                className={`mt-4 inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
              >
                <I name="edit" size={14} />
                Düzenle
              </button>
            </li>
          ))}
        </ul>
      )}

      {duzenlenen && <ProfilFormu mevcut={duzenlenen === "yeni" ? null : duzenlenen} onClose={() => setDuzenlenen(null)} onKaydedildi={kaydedildi} />}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

function ProfilFormu({ mevcut, onClose, onKaydedildi }) {
  const [f, setF] = useState({
    ad: mevcut?.ad || "",
    oran: mevcut ? String(mevcut.oranYuzde).replace(".", ",") : "",
    aciklama: mevcut?.aciklama || "",
    durum: mevcut?.durum || "AKTIF",
  });
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const olustur = useVadeFarkiProfiliOlustur();
  const guncelle = useVadeFarkiProfiliGuncelle();
  const gonderiliyor = olustur.isPending || guncelle.isPending;

  // ekran tarafı doğrulama; sunucu aynı kuralları uygular (ad çakışması, kullanılan profili pasife alma)
  const oran = oranCoz(f.oran);
  const hatalar = {};
  if (!f.ad.trim()) hatalar.ad = "Profil adı girin.";
  if (f.oran.trim() === "" || !Number.isFinite(oran) || oran < 0 || oran > 10) hatalar.oranYuzde = "Aylık oran %0 ile %10 arasında olmalı.";
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
      requestAnimationFrame(() => document.querySelector('#bn-profil-form [aria-invalid="true"]')?.focus());
      return;
    }
    const govde = { ad: f.ad.trim(), oranYuzde: Math.round(oran * 100) / 100, aciklama: f.aciklama.trim(), durum: f.durum };
    try {
      onKaydedildi(mevcut ? await guncelle.mutateAsync({ id: mevcut.id, govde }) : await olustur.mutateAsync(govde));
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) {
        setSunucuHatalari(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-profil-form [aria-invalid="true"]')?.focus());
      } else {
        setSunucuMesaji(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  const onizleme = Number.isFinite(oran) && f.oran.trim() !== "" ? Math.round((1000000 * oran * 5) / 100) : null; // ₺10.000 · 6 taksit, sunucudaki örnekle aynı

  return (
    <Pencere baslik={mevcut ? `${kisaAd(mevcut.ad)} profilini düzenle` : "Yeni vade farkı profili"} altBaslik="Oran aylıktır; taksitli ödemelerde vade farkı bu orandan hesaplanır." onClose={onClose} genislik="max-w-md">
      <form id="bn-profil-form" noValidate onSubmit={kaydet} className="flex flex-col gap-3" aria-busy={gonderiliyor}>
        <Alan id="bn-p-ad" etiket="Profil adı" hata={h("ad")}>
          <input id="bn-p-ad" value={f.ad} onChange={(e) => degistir({ ...f, ad: e.target.value })} placeholder="Vade Farkı Profil 6" aria-invalid={h("ad") ? true : undefined} className={inputCls(h("ad"))} />
        </Alan>
        <Alan id="bn-p-oran" etiket="Aylık oran" hata={h("oranYuzde")} ipucu={onizleme !== null ? `Örnek: ${tl(1000000)}, 6 taksit → +${tl(onizleme)} vade farkı` : "Örn. 2,45"}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">%</span>
            <input
              id="bn-p-oran"
              inputMode="decimal"
              value={f.oran}
              onChange={(e) => degistir({ ...f, oran: e.target.value.replace(/[^\d.,]/g, "") })}
              aria-invalid={h("oranYuzde") ? true : undefined}
              className={`${inputCls(h("oranYuzde"))} pl-7 font-bold tabular-nums`}
            />
          </div>
        </Alan>
        <Alan id="bn-p-aciklama" etiket="Açıklama" hata={h("aciklama")}>
          <textarea id="bn-p-aciklama" rows={2} value={f.aciklama} onChange={(e) => degistir({ ...f, aciklama: e.target.value })} placeholder="Hangi bayiler için kullanılacağı" className={`${inputCls(h("aciklama"))} h-auto py-2`} />
        </Alan>
        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${h("durum") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
          <input type="checkbox" role="switch" checked={f.durum === "AKTIF"} onChange={(e) => degistir({ ...f, durum: e.target.checked ? "AKTIF" : "PASIF" })} aria-invalid={h("durum") ? true : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
          <span className="leading-snug">
            <span className="block text-[12.5px] font-bold text-[var(--fg)]">Aktif</span>
            <span className="block text-[11.5px] text-[var(--muted)]">Pasif profil yeni bayi tanımında seçilemez; kullanan aktif bayi varsa pasife alınamaz.</span>
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

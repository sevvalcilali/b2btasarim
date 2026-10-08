// Cari seçimi — şartname s.1–2: ana firmanın altında birden çok üye işyeri vardır; bayi ana sayfada "Ana Firma Cari
// Seçimi", alt bayi menüden "Bayi Carisi Seçimi" ile tahsilatın işleneceği üye işyerini seçer. Seçim oturumda tutulur.
// Veri: GET /uye-isyerleri, GET /oturum (aktifUyeIsyeri), PUT /oturum/aktif-uye-isyeri
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { useAktifUyeIsyeriSec, useOturum } from "@/lib/sorgular/oturum";
import { useUyeIsyerleri } from "@/lib/sorgular/tanimlar";
import { BosDurum, HataKutusu, YukleniyorKutu } from "../durumlar";
import { Bildirim, Konum } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";

/** Ana sayfadaki açılır seçim (bayi ve alt bayi) */
export function CariSecici({ role }) {
  const oturum = useOturum();
  const uyeler = useUyeIsyerleri();
  const sec = useAktifUyeIsyeriSec();
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const etiket = role === ROLES.ALT_BAYI ? "Bayi cari seçimi" : "Ana firma cari seçimi";
  const aktif = oturum.data?.aktifUyeIsyeri?.cariNo || "";
  const secenekler = uyeler.data?.kayitlar || [];

  const degistir = async (cariNo) => {
    try {
      const u = await sec.mutateAsync(cariNo);
      setBildirim(`Tahsilat carisi ${u.ad} (${u.cariNo}) olarak seçildi.`);
    } catch (err) {
      setBildirim(err?.message || "Cari seçilemedi.");
    }
  };

  return (
    <>
      <label className="relative block">
        <span className="sr-only">{etiket}</span>
        <select
          aria-label={etiket}
          value={aktif}
          disabled={!oturum.data || secenekler.length === 0 || sec.isPending}
          onChange={(e) => degistir(e.target.value)}
          className={`h-9 max-w-[260px] rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-3 pr-8 text-[12.5px] font-medium text-[var(--fg-2)] transition hover:border-[var(--brand)] disabled:opacity-60 ${FOCUS}`}
        >
          {!aktif && <option value="">{etiket}</option>}
          {secenekler.map((u) => (
            <option key={u.cariNo} value={u.cariNo}>
              {u.ad} — {u.cariNo}
            </option>
          ))}
        </select>
      </label>
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

/** Ödeme ekranı alt başlığına eklenen not: " · Tahsilat carisi: Brisa Perakende (320.00.002)" */
export function AktifCariNotu() {
  const oturum = useOturum();
  const u = oturum.data?.aktifUyeIsyeri;
  if (!u) return null;
  return (
    <>
      {" · Tahsilat carisi: "}
      <span className="font-semibold text-[var(--fg-2)]">
        {u.ad} <span className="tabular-nums">({u.cariNo})</span>
      </span>
    </>
  );
}

/** Alt bayi menüsü › Bayi Carisi Seçimi: kart listesinden seçim */
export function BayiCariSecimi({ meta, onNavigate }) {
  const oturum = useOturum();
  const uyeler = useUyeIsyerleri();
  const sec = useAktifUyeIsyeriSec();
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const aktif = oturum.data?.aktifUyeIsyeri?.cariNo;
  const secenekler = uyeler.data?.kayitlar || [];

  const secimYap = async (u) => {
    try {
      await sec.mutateAsync(u.cariNo);
      setBildirim(`${u.ad} seçildi; sonraki ödemeler bu cariye işlenir.`);
    } catch (err) {
      setBildirim(err?.message || "Cari seçilemedi.");
    }
  };

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={["Ödeme Al", "Bayi Carisi Seçimi"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Bayi Carisi Seçimi</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · Bayinizin size açtığı üye işyerlerinden tahsilatın işleneceği cariyi seçin; seçim ödeme ekranlarında görünür
        </p>
      </div>

      {uyeler.isPending || oturum.isPending ? (
        <YukleniyorKutu />
      ) : uyeler.isError ? (
        <HataKutusu hata={uyeler.error} onTekrar={() => uyeler.refetch()} />
      ) : secenekler.length === 0 ? (
        <BosDurum baslik="Size açık üye işyeri yok" aciklama="Bayinizin alt bayi tanımınızda en az bir üye işyeri açması gerekir." />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Üye işyerleri">
          {secenekler.map((u, i) => {
            const secili = u.cariNo === aktif;
            return (
              <li key={u.cariNo} style={{ "--i": i }} className={`bn-rise flex items-center gap-3 p-4 sm:p-5 ${CARD} ${secili ? "!border-[var(--brand)]" : ""}`} aria-current={secili ? "true" : undefined}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-[12px] font-extrabold ${secili ? "bg-[var(--brand)] text-white" : "bg-[var(--brand-soft)] text-[var(--brand-text)]"}`} aria-hidden="true">
                  <I name="building" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-[var(--fg)]">{u.ad}</h2>
                  <p className="text-[11.5px] tabular-nums text-[var(--muted)]">Cari no {u.cariNo}</p>
                </div>
                {secili ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--success-text)]">
                    <I name="check" size={12} strokeWidth={2.4} />
                    Seçili
                  </span>
                ) : (
                  <button type="button" onClick={() => secimYap(u)} disabled={sec.isPending} className={`inline-flex h-9 shrink-0 items-center rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition hover:brightness-110 disabled:opacity-60 ${FOCUS}`}>
                    Seç
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

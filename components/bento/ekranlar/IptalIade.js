// İptal / İade › Onay · Takip — şartname s.8 (onay zinciri) ve s.7 (takip raporu).
// Veri: GET /iptal-iade-talepleri?gorunum= · GET …/uygun-islemler · POST … · POST …/{talepNo}/onay · POST …/{talepNo}/red
import { Fragment, useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiHatasi } from "@/lib/api/hata";
import { kurusCoz, tarihSaat, tl, paraMetniBicimle } from "@/lib/bicim";
import { durumTonu, etiket } from "@/lib/etiketler";
import { useTalepOlustur, useTalepOnayla, useTalepReddet, useTalepUygunIslemler, useTalepler } from "@/lib/sorgular/talepler";
import { BosDurum, HataKutusu, Yukleniyor } from "../durumlar";
import { Konum, Pencere, Bildirim, inputCls, Alan, OnayPenceresi } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";

// Rolün takip sekmeleri (sunucu "gorunum" süzgeçleri)
const TAKIP_SEKMELERI = {
  [ROLES.ANA_FIRMA]: ["TUMU", "ONAYIMDA", "ONAYLANDI", "REDDEDILDI"],
  [ROLES.BAYI]: ["TUMU", "ONAYIMDA", "UST_ONAYA_ILETILEN", "ONAYLANDI", "REDDEDILDI"],
  [ROLES.ALT_BAYI]: ["TUMU", "ONAY_BEKLEYEN", "ONAYLANDI", "REDDEDILDI"],
};
const SEKME_ADI = { TUMU: "Tümü", ONAYIMDA: "Onayımda", UST_ONAYA_ILETILEN: "Üst onaya iletilen", ONAY_BEKLEYEN: "Onay bekleyen", ONAYLANDI: "Onaylanan", REDDEDILDI: "Reddedilen" };

const TALEP_AKISI = {
  [ROLES.ANA_FIRMA]: "Kendi işlemleriniz için girdiğiniz iptal / iade onay gerektirmeden sonuçlanır.",
  [ROLES.BAYI]: "Talebiniz ana firma onayına düşer; sonuçlandığında e-posta ile bilgilendirilirsiniz.",
  [ROLES.ALT_BAYI]: "Talebiniz önce bayinizin, ardından ana firmanın onayına düşer; onaylandığında e-posta ile bilgilendirilirsiniz.",
};

function YeniTalep({ role, meta, onKaydedildi, onClose }) {
  const uygun = useTalepUygunIslemler();
  const olustur = useTalepOlustur();
  const [islemNo, setIslemNo] = useState("");
  const [tur, setTur] = useState("IADE");
  const [tutarMetni, setTutarMetni] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [denendi, setDenendi] = useState(false);
  const [sunucuHatalari, setSunucuHatalari] = useState({});
  const [sunucuMesaji, setSunucuMesaji] = useState(null);
  const liste = uygun.data?.kayitlar || [];
  const secilenNo = islemNo || liste[0]?.islemNo || "";
  const islem = liste.find((t) => t.islemNo === secilenNo);
  const islemTutari = islem?.tutarKurus || 0;
  const tutarKurus = tur === "IPTAL" ? islemTutari : kurusCoz(tutarMetni);

  const hatalar = {};
  if (!islem) hatalar.islemNo = "İşlem seçin.";
  if (tur === "IADE" && !(tutarKurus > 0 && tutarKurus <= islemTutari)) hatalar.tutarKurus = `0 ile ${tl(islemTutari)} arasında bir tutar girin.`;
  if (!aciklama.trim()) hatalar.aciklama = "Açıklama girin.";
  const h = (k) => sunucuHatalari[k] || (denendi ? hatalar[k] : undefined);

  const kaydet = async (e) => {
    e.preventDefault();
    setDenendi(true);
    setSunucuHatalari({});
    setSunucuMesaji(null);
    if (Object.keys(hatalar).length > 0) return;
    try {
      const talep = await olustur.mutateAsync({ islemNo: islem.islemNo, tur, tutarKurus, aciklama: aciklama.trim() });
      onKaydedildi(talep);
    } catch (err) {
      if (err instanceof ApiHatasi && Object.keys(err.alanlar).length) setSunucuHatalari(err.alanlar);
      else setSunucuMesaji(err?.message || "Talep gönderilemedi.");
    }
  };

  return (
    <Pencere baslik="Yeni İptal / İade Talebi" altBaslik={meta.company} onClose={onClose} genislik="max-w-lg">
      {uygun.isPending ? (
        <Yukleniyor satir={3} baslik={false} />
      ) : uygun.isError ? (
        <HataKutusu hata={uygun.error} onTekrar={() => uygun.refetch()} />
      ) : liste.length === 0 ? (
        <p className="rounded-xl bg-[var(--soft)] px-3 py-3 text-[12.5px] text-[var(--fg-2)]">Talep girilebilecek başarılı bir işleminiz yok.</p>
      ) : (
        <form noValidate onSubmit={kaydet} className="space-y-3" aria-busy={olustur.isPending}>
          <Alan id="bn-talep-islem" etiket="İşlem" hata={h("islemNo")}>
            <select id="bn-talep-islem" value={secilenNo} onChange={(e) => setIslemNo(e.target.value)} aria-invalid={h("islemNo") ? true : undefined} className={inputCls(h("islemNo"))}>
              {liste.map((t) => (
                <option key={t.islemNo} value={t.islemNo}>
                  {t.islemNo} · {t.musteriUnvan} · {tl(t.tutarKurus)}
                </option>
              ))}
            </select>
          </Alan>
          <div>
            <p id="bn-talep-tur" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
              Talep türü
            </p>
            <div role="radiogroup" aria-labelledby="bn-talep-tur" className="flex gap-1">
              {["IADE", "IPTAL"].map((x) => (
                <button
                  key={x}
                  type="button"
                  role="radio"
                  aria-checked={tur === x}
                  onClick={() => setTur(x)}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-[12.5px] transition ${tur === x ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                >
                  {etiket("talepTuru", x)}
                </button>
              ))}
            </div>
          </div>
          <Alan
            id="bn-talep-tutar"
            etiket={tur === "IPTAL" ? "Tutar (işlemin tamamı)" : "İade tutarı"}
            hata={h("tutarKurus")}
            ipucu={tur === "IADE" ? `Kısmi iade yapılabilir; işlem tutarı ${tl(islemTutari)}.` : "İptal, işlemin tamamı için yapılır."}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
              <input
                id="bn-talep-tutar"
                inputMode="decimal"
                placeholder="0,00"
                readOnly={tur === "IPTAL"}
                value={tur === "IPTAL" ? tl(islemTutari, { isaret: false }) : tutarMetni}
                onChange={(e) => setTutarMetni(paraMetniBicimle(e.target.value))}
                aria-invalid={h("tutarKurus") ? true : undefined}
                className={`${inputCls(h("tutarKurus"))} pl-7 font-bold tabular-nums`}
              />
            </div>
          </Alan>
          <Alan id="bn-talep-aciklama" etiket="Açıklama" hata={h("aciklama")}>
            <textarea id="bn-talep-aciklama" rows={2} value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Örn. Ürün iadesi" aria-invalid={h("aciklama") ? true : undefined} className={`${inputCls(h("aciklama"))} h-auto py-2`} />
          </Alan>
          <p className="flex items-start gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
            <I name="info" size={14} className="mt-px shrink-0 text-[var(--brand-text)]" />
            {TALEP_AKISI[role]}
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
            <button type="submit" disabled={olustur.isPending} className={`inline-flex h-10 items-center rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
              {olustur.isPending ? "Gönderiliyor…" : role === ROLES.ANA_FIRMA ? `${etiket("talepTuru", tur)} Et` : "Talebi Gönder"}
            </button>
          </div>
        </form>
      )}
    </Pencere>
  );
}

export function IptalIade({ role, meta, mod, onNavigate }) {
  const onayModu = mod === "onay" && role !== ROLES.ALT_BAYI; // alt bayinin onay ekranı yoktur
  const firma = meta.company;
  const sekmeler = TAKIP_SEKMELERI[role];
  const [sekme, setSekme] = useState("TUMU");
  const [acik, setAcik] = useState(null);
  const [redTalep, setRedTalep] = useState(null);
  const [gerekce, setGerekce] = useState("");
  const [gerekceHata, setGerekceHata] = useState(null);
  const [yeni, setYeni] = useState(false);
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);

  const sorgu = useTalepler({ gorunum: onayModu ? "ONAYIMDA" : sekme });
  const onayla = useTalepOnayla();
  const reddet = useTalepReddet();
  const liste = sorgu.data?.kayitlar || [];
  const sayac = (k) => sorgu.data?.sayaclar?.[k] ?? "–";
  const girenGoster = role !== ROLES.ALT_BAYI;

  const [onayTalep, setOnayTalep] = useState(null); // onay penceresinde bekleyen talep
  const onayliTalep = async (t) => {
    try {
      const sonuc = await onayla.mutateAsync(t.talepNo);
      setBildirim(`${t.talepNo}: ${sonuc.bildirim}`);
    } catch (err) {
      setBildirim(err?.message || "Onay verilemedi.");
    } finally {
      setOnayTalep(null);
    }
  };
  const reddetTalep = async () => {
    setGerekceHata(null);
    if (!gerekce.trim()) {
      setGerekceHata("Gerekçe girin; talebi girene e-posta ile iletilir.");
      return;
    }
    try {
      const sonuc = await reddet.mutateAsync({ talepNo: redTalep.talepNo, gerekce: gerekce.trim() });
      setBildirim(`${redTalep.talepNo}: ${sonuc.bildirim}`);
      setRedTalep(null);
    } catch (err) {
      setGerekceHata(err instanceof ApiHatasi && err.alanlar.gerekce ? err.alanlar.gerekce : err?.message || "Red kaydedilemedi.");
    }
  };
  const talepKaydedildi = (talep) => {
    setYeni(false);
    setSekme("TUMU");
    const anaFirmaMi = role === ROLES.ANA_FIRMA;
    setBildirim(anaFirmaMi ? `${talep.talepNo}: ${etiket("talepTuru", talep.tur)} işlemi tamamlandı.` : `${talep.talepNo} ${talep.durum === "BAYI_ONAYINDA" ? "bayi" : "ana firma"} onayına gönderildi.`);
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";
  const sutun = girenGoster ? 7 : 6;
  const mesgul = onayla.isPending || reddet.isPending;

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Konum onHome={() => onNavigate(HOME)} yol={["İptal / İade Takip", onayModu ? "Onay" : "Takip"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{onayModu ? "İptal / İade Onay" : "İptal / İade Takip"}</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {firma} · {onayModu ? "Onayınızda bekleyen talepler" : "Taleplerin onay durumu"}
          </p>
        </div>
        {!onayModu && (
          <button
            type="button"
            onClick={() => setYeni(true)}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Yeni Talep
          </button>
        )}
      </div>

      {role !== ROLES.ALT_BAYI && (
        <p className="bn-rise mb-3 flex items-start gap-2 rounded-2xl bg-[var(--brand-soft)] px-4 py-2.5 text-[12px] font-medium text-[var(--brand-text)]">
          <I name="bell" size={14} className="mt-px shrink-0" />
          {role === ROLES.BAYI
            ? "Alt bayilerinizin talepleri önce sizin onayınıza düşer; onayladığınız talep ana firmaya iletilir. Kendi talepleriniz doğrudan ana firma onayına gider."
            : "Bayi ve alt bayilerin talepleri onayınıza düşer; onayladığınızda talep sonuçlanır."}{" "}
          Onayınıza talep düştüğünde e-posta ile bilgilendirilirsiniz.
        </p>
      )}

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İptal / iade talepleri" aria-busy={sorgu.isFetching || mesgul}>
        {!onayModu && (
          <div role="group" aria-label="Durum" className="flex gap-1 overflow-x-auto p-3 sm:p-4">
            {sekmeler.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSekme(s)}
                aria-pressed={sekme === s}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${sekme === s ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
              >
                {SEKME_ADI[s]}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${sekme === s ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{sayac(s)}</span>
              </button>
            ))}
          </div>
        )}

        {sorgu.isPending ? (
          <Yukleniyor satir={5} baslik={false} />
        ) : sorgu.isError ? (
          <HataKutusu hata={sorgu.error} onTekrar={() => sorgu.refetch()} />
        ) : (
          <div className={`relative overflow-x-auto transition-opacity ${sorgu.isFetching ? "opacity-60" : ""}`}>
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th scope="col" className={th}>Talep</th>
                  {girenGoster && <th scope="col" className={th}>Giren</th>}
                  <th scope="col" className={th}>İşlem / Müşteri</th>
                  <th scope="col" className={th}>Tür</th>
                  <th scope="col" className={`${th} text-right`}>Tutar</th>
                  <th scope="col" className={th}>Durum</th>
                  <th scope="col" className={th}>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {liste.map((t, i) => {
                  const detay = acik === t.talepNo;
                  return (
                    <Fragment key={t.talepNo}>
                      <tr className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${t.onayimda ? "shadow-[inset_3px_0_0_var(--brand)]" : ""}`}>
                        <td className={td}>
                          <span className="block font-bold text-[var(--brand-text)]">{t.talepNo}</span>
                          <span className="block text-[11px] tabular-nums text-[var(--muted)]">{tarihSaat(t.tarih)}</span>
                        </td>
                        {girenGoster && (
                          <td className={td}>
                            <span className="block font-semibold text-[var(--fg-2)]">{t.giren?.unvan}</span>
                            <span className="block text-[11px] text-[var(--muted)]">{etiket("firmaTuru", t.giren?.tur)}</span>
                          </td>
                        )}
                        <td className={td}>
                          <span className="block font-semibold text-[var(--fg)]">{t.musteriUnvan}</span>
                          <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.islemNo}</span>
                        </td>
                        <td className={`${td} font-semibold text-[var(--fg-2)]`}>{etiket("talepTuru", t.tur)}</td>
                        <td className={`${td} text-right`}>
                          <span className="block font-bold tabular-nums text-[var(--fg)]">{tl(t.tutarKurus)}</span>
                          <span className="block text-[11px] tabular-nums text-[var(--muted)]">işlem {tl(t.islemTutariKurus)}</span>
                        </td>
                        <td className={td}>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${durumTonu(t.durum)}`}>{etiket("talepDurumu", t.durum)}</span>
                        </td>
                        <td className={`${td} text-right`}>
                          <div className="flex items-center justify-end gap-1.5">
                            {t.onayimda && (
                              <>
                                <button
                                  type="button"
                                  disabled={mesgul}
                                  onClick={() => setOnayTalep(t)}
                                  className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--success)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 disabled:opacity-60 ${FOCUS}`}
                                >
                                  <I name="check" size={13} strokeWidth={2.4} />
                                  {role === ROLES.BAYI ? "Onayla ve İlet" : "Onayla"}
                                </button>
                                <button
                                  type="button"
                                  disabled={mesgul}
                                  onClick={() => {
                                    setRedTalep(t);
                                    setGerekce("");
                                    setGerekceHata(null);
                                  }}
                                  className={`inline-flex h-8 items-center rounded-full border border-[var(--danger)] px-3 text-[12px] font-bold text-[var(--danger-text)] transition hover:bg-[var(--danger-soft)] disabled:opacity-60 ${FOCUS}`}
                                >
                                  Reddet
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setAcik(detay ? null : t.talepNo)}
                              aria-expanded={detay}
                              aria-controls={`bn-detay-${t.talepNo}`}
                              aria-label={`${t.talepNo} detayı`}
                              title="Detay ve geçmiş"
                              className={`grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--soft-2)] hover:text-[var(--brand-text)] ${FOCUS}`}
                            >
                              <I name="chevronDown" size={15} className={`transition-transform duration-200 ${detay ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {detay && (
                        <tr id={`bn-detay-${t.talepNo}`} className="bg-[var(--soft)]">
                          <td colSpan={sutun} className="px-4 py-3">
                            <div className="grid gap-3 text-[12px] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Açıklama</p>
                                <p className="mt-1 text-[var(--fg)]">{t.aciklama}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Geçmiş</p>
                                <ol className="mt-1.5 space-y-1.5 border-l-2 border-[var(--border-strong)] pl-3">
                                  {t.gecmis.map((g, j) => (
                                    <li key={j} className="relative">
                                      <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-[var(--brand)] ring-2 ring-[var(--soft)]" aria-hidden="true" />
                                      <span className="font-semibold text-[var(--fg)]">{g.firma?.unvan}</span>{" "}
                                      <span className="text-[var(--fg-2)]">
                                        — {etiket("talepOlayi", g.olay)}
                                        {g.not ? `: ${g.not}` : ""}
                                      </span>
                                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">{tarihSaat(g.tarih)}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {liste.length === 0 && (
              <BosDurum baslik={onayModu ? "Onayınızda bekleyen talep yok" : "Bu durumda talep yok"} ikon="check" tonu="success">
                {onayModu && (
                  <button type="button" onClick={() => onNavigate("/iptal-iade/takip")} className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}>
                    Tüm talepleri gör
                  </button>
                )}
              </BosDurum>
            )}
          </div>
        )}
      </section>

      {redTalep && (
        <Pencere baslik={`${redTalep.talepNo} talebini reddet`} altBaslik={`${redTalep.giren?.unvan} · ${etiket("talepTuru", redTalep.tur)} · ${tl(redTalep.tutarKurus)}`} onClose={() => setRedTalep(null)} genislik="max-w-md">
          <Alan id="bn-gerekce" etiket="Red gerekçesi" hata={gerekceHata || undefined}>
            <textarea id="bn-gerekce" rows={3} value={gerekce} onChange={(e) => setGerekce(e.target.value)} aria-invalid={gerekceHata ? true : undefined} className={`${inputCls(gerekceHata)} h-auto py-2`} />
          </Alan>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setRedTalep(null)} className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
              Vazgeç
            </button>
            <button type="button" disabled={reddet.isPending} onClick={reddetTalep} className={`inline-flex h-10 items-center rounded-full bg-[var(--danger)] px-5 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
              {reddet.isPending ? "Kaydediliyor…" : "Reddet"}
            </button>
          </div>
        </Pencere>
      )}

      {yeni && <YeniTalep role={role} meta={meta} onKaydedildi={talepKaydedildi} onClose={() => setYeni(false)} />}
      {onayTalep && (
        <OnayPenceresi
          baslik={`${onayTalep.talepNo} talebini onayla`}
          mesaj={
            role === ROLES.BAYI
              ? `${onayTalep.giren?.unvan} · ${etiket("talepTuru", onayTalep.tur)} · ${tl(onayTalep.tutarKurus)}. Onayınız talebi ana firmanın onayına iletir; bu adım geri alınamaz.`
              : `${onayTalep.giren?.unvan} · ${etiket("talepTuru", onayTalep.tur)} · ${tl(onayTalep.tutarKurus)}. Onayladığınızda işlem ${onayTalep.tur === "IADE" ? "iade edilir" : "iptal edilir"} ve geri alınamaz.`
          }
          onayEtiketi={role === ROLES.BAYI ? "Onayla ve İlet" : "Onayla"}
          mesgul={onayla.isPending}
          onOnay={() => onayliTalep(onayTalep)}
          onClose={() => setOnayTalep(null)}
        />
      )}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

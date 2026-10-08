import { Fragment, useCallback, useState } from "react";
import { ROLES, ROLE_META } from "@/lib/roles";
import { islemler } from "@/lib/mockData";
import I from "@/components/DesignIcons";
import { agDeposu, kapsamda, firmaTuru } from "../ag";
import { Konum, Pencere, Bildirim, inputCls, Alan } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { parseAmount, tutarCoz, tarihSaat } from "../yardimci";

// ---- İptal / İade › Onay · Takip ---------------------------------------------------------
// Şartname s.8 (onay zinciri) ve s.7 (takip raporu: onayında olanlar, üst onaya iletilenler, onaylananlar,
// reddedilenler; raporun yanında onay / red). Talepler panel düzeyinde tutulur: rol değiştirerek zincir izlenebilir.
function talepTone(durum) {
  if (durum === "Onaylandı") return "bg-[var(--success-soft)] text-[var(--success-text)]";
  if (durum === "Reddedildi") return "bg-[var(--danger-soft)] text-[var(--danger-text)]";
  if (durum === "Bayi Onayında") return "bg-[var(--warning-soft)] text-[var(--warning-text)]";
  return "bg-[var(--brand-soft)] text-[var(--brand-text)]"; // Ana Firma Onayında
}

// Talep bu rolün onayını mı bekliyor?
export function onayimda(role, t) {
  if (role === ROLES.ANA_FIRMA) return t.durum === "Ana Firma Onayında";
  if (role === ROLES.BAYI) return t.durum === "Bayi Onayında" && agDeposu.al().altBayiler.some((a) => a.unvan === t.giren && a.bagliBayi === ROLE_META[role].company);
  return false;
}

const TAKIP_SEKMELERI = {
  [ROLES.ANA_FIRMA]: [
    { ad: "Tümü", f: () => true },
    { ad: "Onayımda", f: (t) => t.durum === "Ana Firma Onayında" },
    { ad: "Onaylanan", f: (t) => t.durum === "Onaylandı" },
    { ad: "Reddedilen", f: (t) => t.durum === "Reddedildi" },
  ],
  [ROLES.BAYI]: [
    { ad: "Tümü", f: () => true },
    { ad: "Onayımda", f: (t) => t.durum === "Bayi Onayında" },
    { ad: "Üst onaya iletilen", f: (t) => t.durum === "Ana Firma Onayında" },
    { ad: "Onaylanan", f: (t) => t.durum === "Onaylandı" },
    { ad: "Reddedilen", f: (t) => t.durum === "Reddedildi" },
  ],
  [ROLES.ALT_BAYI]: [
    { ad: "Tümü", f: () => true },
    { ad: "Onay bekleyen", f: (t) => t.durum === "Bayi Onayında" || t.durum === "Ana Firma Onayında" },
    { ad: "Onaylanan", f: (t) => t.durum === "Onaylandı" },
    { ad: "Reddedilen", f: (t) => t.durum === "Reddedildi" },
  ],
};

const TALEP_AKISI = {
  [ROLES.ANA_FIRMA]: "Kendi işlemleriniz için girdiğiniz iptal / iade onay gerektirmeden sonuçlanır.",
  [ROLES.BAYI]: "Talebiniz ana firma onayına düşer; sonuçlandığında e-posta ile bilgilendirilirsiniz.",
  [ROLES.ALT_BAYI]: "Talebiniz önce bayinizin, ardından ana firmanın onayına düşer; onaylandığında e-posta ile bilgilendirilirsiniz.",
};

function YeniTalep({ role, meta, talepler, onKaydet, onClose }) {
  // talep girilebilecek işlemler: kendi çekimi, başarılı ve açık / onaylanmış talebi olmayan
  const uygun = islemler.filter(
    (t) => t.yapan === meta.company && t.durum === "Başarılı" && !talepler.some((x) => x.islemId === t.id && x.durum !== "Reddedildi")
  );
  const [islemId, setIslemId] = useState(uygun[0]?.id || "");
  const [tur, setTur] = useState("İade");
  const [tutarMetni, setTutarMetni] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [denendi, setDenendi] = useState(false);
  const islem = uygun.find((t) => t.id === islemId);
  const islemTutari = islem ? parseAmount(islem.tutar) : 0;
  const tutar = tur === "İptal" ? islemTutari : tutarCoz(tutarMetni);

  const hatalar = {};
  if (!islem) hatalar.islem = "İşlem seçin.";
  if (tur === "İade" && !(tutar > 0 && tutar <= islemTutari)) hatalar.tutar = `0 ile ₺ ${islemTutari.toLocaleString("tr-TR")} arasında bir tutar girin.`;
  if (!aciklama.trim()) hatalar.aciklama = "Açıklama girin.";
  const h = (k) => (denendi ? hatalar[k] : undefined);

  const kaydet = (e) => {
    e.preventDefault();
    setDenendi(true);
    if (Object.keys(hatalar).length > 0) return;
    onKaydet({ islem, tur, tutar, aciklama: aciklama.trim() });
  };

  return (
    <Pencere baslik="Yeni İptal / İade Talebi" altBaslik={meta.company} onClose={onClose} genislik="max-w-lg">
      {uygun.length === 0 ? (
        <p className="rounded-xl bg-[var(--soft)] px-3 py-3 text-[12.5px] text-[var(--fg-2)]">Talep girilebilecek başarılı bir işleminiz yok.</p>
      ) : (
        <form noValidate onSubmit={kaydet} className="space-y-3">
          <Alan id="bn-talep-islem" etiket="İşlem" hata={h("islem")}>
            <select id="bn-talep-islem" value={islemId} onChange={(e) => setIslemId(e.target.value)} className={inputCls(h("islem"))}>
              {uygun.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.musteri} · {t.tutar}
                </option>
              ))}
            </select>
          </Alan>
          <div>
            <p id="bn-talep-tur" className="mb-1 text-[12px] font-semibold text-[var(--fg-2)]">
              Talep türü
            </p>
            <div role="radiogroup" aria-labelledby="bn-talep-tur" className="flex gap-1">
              {["İade", "İptal"].map((x) => (
                <button
                  key={x}
                  type="button"
                  role="radio"
                  aria-checked={tur === x}
                  onClick={() => setTur(x)}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-[12.5px] transition ${
                    tur === x ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                  } ${FOCUS}`}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <Alan
            id="bn-talep-tutar"
            etiket={tur === "İptal" ? "Tutar (işlemin tamamı)" : "İade tutarı"}
            hata={h("tutar")}
            ipucu={tur === "İade" ? `Kısmi iade yapılabilir; işlem tutarı ₺ ${islemTutari.toLocaleString("tr-TR")}.` : "İptal, işlemin tamamı için yapılır."}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
              <input
                id="bn-talep-tutar"
                inputMode="decimal"
                placeholder="0,00"
                readOnly={tur === "İptal"}
                value={tur === "İptal" ? islemTutari.toLocaleString("tr-TR") : tutarMetni}
                onChange={(e) => setTutarMetni(e.target.value.replace(/[^\d.,]/g, ""))}
                aria-invalid={h("tutar") ? true : undefined}
                className={`${inputCls(h("tutar"))} pl-7 font-bold tabular-nums`}
              />
            </div>
          </Alan>
          <Alan id="bn-talep-aciklama" etiket="Açıklama" hata={h("aciklama")}>
            <textarea
              id="bn-talep-aciklama"
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn. Ürün iadesi"
              aria-invalid={h("aciklama") ? true : undefined}
              className={`${inputCls(h("aciklama"))} h-auto py-2`}
            />
          </Alan>
          <p className="flex items-start gap-2 rounded-xl bg-[var(--soft)] px-3 py-2 text-[12px] text-[var(--fg-2)]">
            <I name="info" size={14} className="mt-px shrink-0 text-[var(--brand-text)]" />
            {TALEP_AKISI[role]}
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
            >
              Vazgeç
            </button>
            <button type="submit" className={`inline-flex h-10 items-center rounded-full bg-[var(--brand)] px-5 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
              {role === ROLES.ANA_FIRMA ? `${tur} Et` : "Talebi Gönder"}
            </button>
          </div>
        </form>
      )}
    </Pencere>
  );
}

export function IptalIade({ role, meta, mod, talepler, setTalepler, onNavigate }) {
  const onayModu = mod === "onay" && role !== ROLES.ALT_BAYI; // alt bayinin onay ekranı yoktur
  const firma = meta.company;
  const kapsam = talepler.filter((t) => kapsamda(role, t.giren));
  const sekmeler = TAKIP_SEKMELERI[role];
  const [sekme, setSekme] = useState(0);
  const [acik, setAcik] = useState(null);
  const [redTalep, setRedTalep] = useState(null);
  const [gerekce, setGerekce] = useState("");
  const [gerekceHata, setGerekceHata] = useState(false);
  const [yeni, setYeni] = useState(false);
  const [bildirim, setBildirim] = useState(null);
  const bildirimBitti = useCallback(() => setBildirim(null), []);

  const liste = onayModu ? kapsam.filter((t) => onayimda(role, t)) : kapsam.filter(sekmeler[sekme].f);
  const girenGoster = role !== ROLES.ALT_BAYI;

  const guncelle = (id, durum, olay) =>
    setTalepler((l) => l.map((t) => (t.id === id ? { ...t, durum, gecmis: [...t.gecmis, { tarih: tarihSaat(new Date()), kim: firma, olay }] } : t)));

  const onayla = (t) => {
    if (role === ROLES.BAYI) {
      guncelle(t.id, "Ana Firma Onayında", "Onayladı, ana firma onayına iletti");
      setBildirim(`${t.id} onaylandı ve ana firma onayına iletildi.`);
    } else {
      guncelle(t.id, "Onaylandı", "Onayladı");
      setBildirim(`${t.id} onaylandı. ${t.giren} e-posta ile bilgilendirildi.`);
    }
  };
  const reddet = () => {
    if (!gerekce.trim()) {
      setGerekceHata(true);
      return;
    }
    guncelle(redTalep.id, "Reddedildi", `Reddetti: ${gerekce.trim()}`);
    setBildirim(`${redTalep.id} reddedildi. ${redTalep.giren} e-posta ile bilgilendirildi.`);
    setRedTalep(null);
  };
  const talepKaydet = ({ islem, tur, tutar, aciklama }) => {
    const no = Math.max(...talepler.map((t) => Number(t.id.slice(4)))) + 1;
    const anaFirmaMi = role === ROLES.ANA_FIRMA;
    const durum = anaFirmaMi ? "Onaylandı" : role === ROLES.BAYI ? "Ana Firma Onayında" : "Bayi Onayında";
    const talep = {
      id: `TLP-${no}`,
      tarih: tarihSaat(new Date()),
      islemId: islem.id,
      giren: firma,
      musteri: islem.musteri,
      islemTutari: islem.tutar,
      tutar: `₺ ${tutar.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`,
      tur,
      aciklama,
      durum,
      gecmis: [{ tarih: tarihSaat(new Date()), kim: firma, olay: anaFirmaMi ? "Talep girildi — ana firma girişi, onay gerekmedi" : "Talep girildi" }],
    };
    setTalepler((l) => [talep, ...l]);
    setYeni(false);
    setSekme(0);
    setBildirim(anaFirmaMi ? `${talep.id}: ${tur} işlemi tamamlandı.` : `${talep.id} ${durum === "Bayi Onayında" ? "bayi" : "ana firma"} onayına gönderildi.`);
  };

  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";
  const sutun = girenGoster ? 7 : 6;

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

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="İptal / iade talepleri">
        {!onayModu && (
          <div role="group" aria-label="Durum" className="flex gap-1 overflow-x-auto p-3 sm:p-4">
            {sekmeler.map((s, i) => (
              <button
                key={s.ad}
                type="button"
                onClick={() => setSekme(i)}
                aria-pressed={sekme === i}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  sekme === i ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {s.ad}
                <span
                  className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${sekme === i ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}
                >
                  {kapsam.filter(s.f).length}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="relative overflow-x-auto">
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
                const benim = onayimda(role, t);
                const detay = acik === t.id;
                return (
                  <Fragment key={t.id}>
                    <tr className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${benim ? "shadow-[inset_3px_0_0_var(--brand)]" : ""}`}>
                      <td className={td}>
                        <span className="block font-bold text-[var(--brand-text)]">{t.id}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.tarih}</span>
                      </td>
                      {girenGoster && (
                        <td className={td}>
                          <span className="block font-semibold text-[var(--fg-2)]">{t.giren}</span>
                          <span className="block text-[11px] text-[var(--muted)]">{firmaTuru(t.giren)}</span>
                        </td>
                      )}
                      <td className={td}>
                        <span className="block font-semibold text-[var(--fg)]">{t.musteri}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">{t.islemId}</span>
                      </td>
                      <td className={`${td} font-semibold text-[var(--fg-2)]`}>{t.tur}</td>
                      <td className={`${td} text-right`}>
                        <span className="block font-bold tabular-nums text-[var(--fg)]">{t.tutar}</span>
                        <span className="block text-[11px] tabular-nums text-[var(--muted)]">işlem {t.islemTutari}</span>
                      </td>
                      <td className={td}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${talepTone(t.durum)}`}>{t.durum}</span>
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {benim && (
                            <>
                              <button
                                type="button"
                                onClick={() => onayla(t)}
                                className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--success)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}
                              >
                                <I name="check" size={13} strokeWidth={2.4} />
                                {role === ROLES.BAYI ? "Onayla ve İlet" : "Onayla"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRedTalep(t);
                                  setGerekce("");
                                  setGerekceHata(false);
                                }}
                                className={`inline-flex h-8 items-center rounded-full border border-[var(--danger)] px-3 text-[12px] font-bold text-[var(--danger-text)] transition hover:bg-[var(--danger-soft)] ${FOCUS}`}
                              >
                                Reddet
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setAcik(detay ? null : t.id)}
                            aria-expanded={detay}
                            aria-controls={`bn-detay-${t.id}`}
                            aria-label={`${t.id} detayı`}
                            title="Detay ve geçmiş"
                            className={`grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--soft-2)] hover:text-[var(--brand-text)] ${FOCUS}`}
                          >
                            <I name="chevronDown" size={15} className={`transition-transform duration-200 ${detay ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {detay && (
                      <tr id={`bn-detay-${t.id}`} className="bg-[var(--soft)]">
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
                                    <span className="font-semibold text-[var(--fg)]">{g.kim}</span> <span className="text-[var(--fg-2)]">— {g.olay}</span>
                                    <span className="block text-[11px] tabular-nums text-[var(--muted)]">{g.tarih}</span>
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
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success-text)]">
                <I name="check" size={18} />
              </span>
              <p className="text-[13px] font-bold text-[var(--fg)]">{onayModu ? "Onayınızda bekleyen talep yok" : "Bu durumda talep yok"}</p>
              {onayModu && (
                <button
                  type="button"
                  onClick={() => onNavigate("/iptal-iade/takip")}
                  className={`rounded-full text-[12.5px] font-bold text-[var(--brand-text)] hover:underline ${FOCUS}`}
                >
                  Tüm talepleri gör
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {redTalep && (
        <Pencere baslik={`${redTalep.id} talebini reddet`} altBaslik={`${redTalep.giren} · ${redTalep.tur} · ${redTalep.tutar}`} onClose={() => setRedTalep(null)} genislik="max-w-md">
          <Alan id="bn-gerekce" etiket="Red gerekçesi" hata={gerekceHata && !gerekce.trim() ? "Gerekçe girin; talebi girene e-posta ile iletilir." : undefined}>
            <textarea
              id="bn-gerekce"
              rows={3}
              value={gerekce}
              onChange={(e) => setGerekce(e.target.value)}
              aria-invalid={gerekceHata && !gerekce.trim() ? true : undefined}
              className={`${inputCls(gerekceHata && !gerekce.trim())} h-auto py-2`}
            />
          </Alan>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRedTalep(null)}
              className={`inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
            >
              Vazgeç
            </button>
            <button type="button" onClick={reddet} className={`inline-flex h-10 items-center rounded-full bg-[var(--danger)] px-5 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
              Reddet
            </button>
          </div>
        </Pencere>
      )}

      {yeni && <YeniTalep role={role} meta={meta} talepler={talepler} onKaydet={talepKaydet} onClose={() => setYeni(false)} />}
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

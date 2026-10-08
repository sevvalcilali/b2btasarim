import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import { anaFirma, vadeFarkiProfilleri } from "@/lib/mockData";
import I from "@/components/DesignIcons";
import { agDeposu, useAg, firmaKaydi, vadeProfili } from "../ag";
import { Konum, Bildirim, inputCls, Alan, FormBolum } from "../ortak";
import { HOME } from "../sayfalar";
import { CARD, FOCUS } from "../tema";
import { rakamlar } from "../yardimci";

// ---- Bayi Tanım › Liste · Tanımlama ------------------------------------------------------
// Şartname s.5: ana firma bayi, bayi (yetkisi varsa) alt bayi tanımlar; alt bayi tanım yapamaz.
// Listedeki "Ödeme Al", şartname s.2'deki "bayi cari kartından bayi adına ödeme" işlevidir.
const TUM_TAKSITLER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const taksitOzeti = (l) => l.map((n) => (n === 1 ? "Tek" : n)).join(", ");

export function BayiListesi({ role, meta, tumAltBayiler, vurgu, onNavigate }) {
  const { bayiler, altBayiler } = useAg();
  const altListe = role === ROLES.BAYI || tumAltBayiler;
  const kayitlar = role === ROLES.BAYI ? altBayiler.filter((a) => a.bagliBayi === meta.company) : tumAltBayiler ? altBayiler : bayiler;
  const duzenlenebilir = !tumAltBayiler; // ana firma alt bayileri yalnızca görüntüler; tanımı bağlı bayi yapar
  const baslik = tumAltBayiler ? "Alt Bayi Listesi" : role === ROLES.BAYI ? "Alt Bayi Listesi" : "Bayi Liste";
  const grup = role === ROLES.BAYI ? "Alt Bayi Tanım" : "Bayi Tanım";

  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("Tümü");
  // tanımlamadan dönüşte: kaydedilen satır vurgulanır, kısa bilgi gösterilir
  const [bildirim, setBildirim] = useState(() => (vurgu ? `${kayitlar.find((x) => x.cari === vurgu)?.unvan || vurgu} kaydedildi.` : null));
  const bildirimBitti = useCallback(() => setBildirim(null), []);
  const kucuk = (x) => x.toLocaleLowerCase("tr-TR");
  const satirlar = kayitlar.filter(
    (b) => (durum === "Tümü" || b.durum === durum) && (!arama.trim() || [b.unvan, b.cari, b.vergiNo].some((f) => kucuk(f).includes(kucuk(arama.trim()))))
  );
  const profilAdi = (p) => {
    const v = vadeProfili(p);
    return v ? `${p} · %${v.oran.toLocaleString("tr-TR")}` : p;
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
            {meta.company} · {tumAltBayiler ? "Ağdaki tüm alt bayiler; tanımlarını bağlı oldukları bayi yapar" : `${kayitlar.length} tanımlı ${altListe ? "alt bayi" : "bayi"}`}
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

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label={baslik}>
        <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Durum" className="flex gap-1">
            {["Tümü", "Aktif", "Pasif"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurum(d)}
                aria-pressed={durum === d}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  durum === d ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {d}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${durum === d ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {d === "Tümü" ? kayitlar.length : kayitlar.filter((b) => b.durum === d).length}
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

        <div className="relative overflow-x-auto">
          <table className="min-w-full text-[12.5px]">
            <thead>
              <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <th scope="col" className={th}>Unvan / Cari · Vergi No</th>
                <th scope="col" className={th}>İletişim</th>
                {tumAltBayiler && <th scope="col" className={th}>Bağlı Bayi</th>}
                <th scope="col" className={th}>Vade Profili</th>
                <th scope="col" className={th}>Taksitler</th>
                <th scope="col" className={`${th} text-right`}>İşlem Limiti</th>
                {!altListe && <th scope="col" className={th}>Alt Bayi</th>}
                <th scope="col" className={th}>Durum</th>
                {duzenlenebilir && (
                  <th scope="col" className={th}>
                    <span className="sr-only">İşlemler</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {satirlar.map((b, i) => {
                const altSayisi = altBayiler.filter((a) => a.bagliBayi === b.unvan).length;
                return (
                  <tr
                    key={b.cari}
                    className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${vurgu === b.cari ? "bg-[var(--success-soft)]" : ""}`}
                  >
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{b.unvan}</span>
                      <span className="block text-[11px] tabular-nums text-[var(--muted)]">
                        {b.cari} · VKN {b.vergiNo}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="block tabular-nums text-[var(--fg-2)]">{b.telefon}</span>
                      <span className="block text-[11px] text-[var(--muted)]">{b.email}</span>
                    </td>
                    {tumAltBayiler && <td className={`${td} text-[var(--fg-2)]`}>{b.bagliBayi}</td>}
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{profilAdi(b.vadeProfil)}</td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{taksitOzeti(b.taksitler)}</td>
                    <td className={`${td} text-right font-semibold tabular-nums text-[var(--fg)]`}>₺ {b.islemLimiti.toLocaleString("tr-TR")}</td>
                    {!altListe && (
                      <td className={td}>
                        <span className="block font-semibold tabular-nums text-[var(--fg-2)]">{altSayisi}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{b.altBayiYetkisi ? "Tanımlayabilir" : "Yetkisi yok"}</span>
                      </td>
                    )}
                    <td className={td}>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          b.durum === "Aktif" ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--soft-2)] text-[var(--muted)]"
                        }`}
                      >
                        {b.durum}
                      </span>
                    </td>
                    {duzenlenebilir && (
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {b.durum === "Aktif" && (
                            <button
                              type="button"
                              onClick={() => onNavigate("/odeme/manuel", { musteri: b.cari })}
                              title={`${b.unvan} adına cari karttan ödeme al`}
                              className={`inline-flex h-8 items-center gap-1 rounded-full bg-[var(--brand)] px-3 text-[12px] font-bold text-white transition hover:brightness-110 ${FOCUS}`}
                            >
                              <I name="wallet" size={13} />
                              Ödeme Al
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onNavigate("/bayi-tanim/tanimlama", { duzenle: b.cari })}
                            className={`inline-flex h-8 items-center rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
                          >
                            Düzenle
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {satirlar.length === 0 && <p className="px-4 py-10 text-center text-[13px] font-semibold text-[var(--muted)]">Kayıt bulunamadı.</p>}
        </div>
      </section>
      {bildirim && <Bildirim metin={bildirim} onBitti={bildirimBitti} />}
    </>
  );
}

export function BayiTanimlama({ role, meta, duzenleCari, onNavigate }) {
  const ag = useAg();
  const altMi = role === ROLES.BAYI; // bayi alt bayi tanımlar
  const kayit = firmaKaydi(role); // bayinin kendi kaydı: alt bayiye verebileceği sınırlar
  const liste = altMi ? ag.altBayiler : ag.bayiler;
  const mevcut = duzenleCari ? liste.find((b) => b.cari === duzenleCari) : null;
  const turSecenekleri = altMi ? ["Alt Bayi", "Müşteri"] : ["Bayi", "Müşteri"];
  const taksitSecenekleri = altMi ? kayit?.taksitler || [] : TUM_TAKSITLER;
  const uyeSecenekleri = anaFirma.uyeIsyerleri.filter((u) => !altMi || kayit?.uyeIsyerleri.includes(u.cari));
  const ustLimit = altMi ? kayit?.islemLimiti : null;
  const profiller = vadeFarkiProfilleri.filter((v) => v.durum === "Aktif" || v.ad.endsWith(mevcut?.vadeProfil || "-"));

  const [f, setF] = useState(() => ({
    tur: turSecenekleri[0],
    unvan: mevcut?.unvan || "",
    cari: mevcut?.cari || "",
    vergiNo: mevcut?.vergiNo || "",
    telefon: mevcut?.telefon || "",
    email: mevcut?.email || "",
    adres: mevcut?.adres || "",
    vadeProfil: mevcut?.vadeProfil || "Profil 1",
    taksitler: mevcut?.taksitler || taksitSecenekleri,
    limit: mevcut ? String(mevcut.islemLimiti) : "",
    altBayiYetkisi: mevcut?.altBayiYetkisi ?? false,
    uyeIsyerleri: mevcut?.uyeIsyerleri || uyeSecenekleri.map((u) => u.cari),
    durum: mevcut?.durum || "Aktif",
  }));
  const [denendi, setDenendi] = useState(false);
  const alan = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const bayiTuru = f.tur !== "Müşteri";
  const listeHref = "/bayi-tanim/liste";
  const baslik = mevcut ? `${mevcut.unvan} — Düzenle` : altMi ? "Alt Bayi Tanımlama" : "Bayi Tanımlama";
  const grup = altMi ? "Alt Bayi Tanım" : "Bayi Tanım";

  if (altMi && !kayit?.altBayiYetkisi) {
    return (
      <>
        <div className="bn-rise mb-4 px-1">
          <Konum onHome={() => onNavigate(HOME)} yol={[grup, "Tanımlama"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Alt Bayi Tanımlama</h1>
        </div>
        <p className={`bn-rise flex items-start gap-2 p-5 text-[13px] text-[var(--fg-2)] ${CARD} hover:!translate-y-0`}>
          <I name="info" size={16} className="mt-px shrink-0 text-[var(--brand-text)]" />
          Alt bayi tanımlama yetkiniz bulunmuyor. Bu yetki ana firmanın bayi tanımından açılır.
        </p>
      </>
    );
  }

  const tumKayitlar = [...ag.bayiler, ...ag.altBayiler, ...ag.musteriler];
  const limit = Number(rakamlar(f.limit));
  const hatalar = {};
  if (!f.unvan.trim()) hatalar.unvan = "Unvan girin.";
  if (!/^\d{3}\.\d{2}\.\d{3}$/.test(f.cari)) hatalar.cari = "Cari no 000.00.000 biçiminde olmalı.";
  else if (tumKayitlar.some((x) => x.cari === f.cari && x.cari !== mevcut?.cari)) hatalar.cari = "Bu cari no başka bir kayıtta kullanılıyor.";
  if (rakamlar(f.vergiNo).length !== 10) hatalar.vergiNo = "10 haneli vergi no girin.";
  if (rakamlar(f.telefon).length < 10) hatalar.telefon = "Geçerli bir telefon girin.";
  if (!/^\S+@\S+\.\S+$/.test(f.email)) hatalar.email = "Geçerli bir e-posta girin.";
  if (!f.adres.trim()) hatalar.adres = "Adres girin.";
  if (bayiTuru) {
    if (f.taksitler.length === 0) hatalar.taksitler = "En az bir taksit açık olmalı.";
    if (!(limit > 0)) hatalar.limit = "İşlem bazlı ödeme limiti girin.";
    else if (ustLimit && limit > ustLimit) hatalar.limit = `Kendi limitinizi (₺ ${ustLimit.toLocaleString("tr-TR")}) aşamaz.`;
    if (f.uyeIsyerleri.length === 0) hatalar.uyeIsyerleri = "En az bir üye işyeri seçin.";
  }
  const h = (k) => (denendi ? hatalar[k] : undefined);

  const kaydet = (e) => {
    e.preventDefault();
    setDenendi(true);
    if (Object.keys(hatalar).length > 0) {
      requestAnimationFrame(() => document.querySelector('#bn-bayi-form [aria-invalid="true"]')?.focus());
      return;
    }
    const kimlik = { unvan: f.unvan.trim(), cari: f.cari, vergiNo: rakamlar(f.vergiNo), telefon: f.telefon.trim(), email: f.email.trim(), adres: f.adres.trim() };
    if (!bayiTuru) {
      // müşteri türü: tanımlı (düzenli) müşteri olur; ödeme ekranlarında listeden seçilir
      agDeposu.guncelle((a) => ({ ...a, musteriler: [...a.musteriler, { sahip: meta.company, ...kimlik }] }));
      onNavigate(listeHref, { kaydedildi: `${kimlik.unvan} düzenli müşteri olarak` });
      return;
    }
    const bayiAlanlari = {
      vadeProfil: f.vadeProfil,
      taksitler: [...f.taksitler].sort((a, b) => a - b),
      islemLimiti: limit,
      uyeIsyerleri: f.uyeIsyerleri,
      durum: f.durum,
      ...(altMi ? { bagliBayi: meta.company } : { altBayiYetkisi: f.altBayiYetkisi }),
    };
    const anahtar = altMi ? "altBayiler" : "bayiler";
    agDeposu.guncelle((a) => {
      const l = a[anahtar];
      const yeni = mevcut
        ? l.map((b) => (b.cari === mevcut.cari ? { ...b, ...kimlik, ...bayiAlanlari } : b))
        : [...l, { id: Math.max(0, ...l.map((b) => b.id)) + 1, ...kimlik, ...bayiAlanlari, ciro: "₺ 0", ortaklar: [] }];
      return { ...a, [anahtar]: yeni };
    });
    onNavigate(listeHref, { kaydedildi: kimlik.cari });
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
    <>
      <div className="bn-rise mb-4 px-1">
        <Konum onHome={() => onNavigate(HOME)} yol={[grup, mevcut ? "Düzenle" : "Tanımlama"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{baslik}</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · {altMi ? "Alt bayiye verilen sınırlar kendi sınırlarınızı aşamaz" : "Bayinin ödeme sınırlarını ve göreceği üye işyerlerini belirleyin"}
        </p>
      </div>

      <form id="bn-bayi-form" noValidate onSubmit={kaydet} className="flex max-w-4xl flex-col gap-3">
        <FormBolum no={1} i={0} baslik="Kimlik ve İletişim" aciklama="Müşteri türü Müşteri seçilirse kayıt düzenli müşteri olarak tanımlanır.">
          <div role="radiogroup" aria-label="Müşteri türü" className="mb-4 flex gap-1">
            {turSecenekleri.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={f.tur === t}
                disabled={!!mevcut && t !== turSecenekleri[0]}
                onClick={() => setF({ ...f, tur: t })}
                className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  f.tur === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Alan id="bn-b-unvan" etiket="Unvan" hata={h("unvan")} className="sm:col-span-2">
              <input id="bn-b-unvan" value={f.unvan} onChange={alan("unvan")} aria-invalid={h("unvan") ? true : undefined} className={inputCls(h("unvan"))} />
            </Alan>
            <Alan id="bn-b-cari" etiket="Cari No" hata={h("cari")} ipucu={mevcut ? "Cari no değiştirilemez." : undefined}>
              <input
                id="bn-b-cari"
                value={f.cari}
                readOnly={!!mevcut}
                onChange={alan("cari")}
                placeholder={altMi ? "540.02.014" : "320.01.006"}
                aria-invalid={h("cari") ? true : undefined}
                className={`${inputCls(h("cari"))} tabular-nums`}
              />
            </Alan>
            <Alan id="bn-b-vkn" etiket="Vergi No" hata={h("vergiNo")}>
              <input
                id="bn-b-vkn"
                inputMode="numeric"
                maxLength={10}
                value={f.vergiNo}
                onChange={(e) => setF({ ...f, vergiNo: rakamlar(e.target.value) })}
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
              <Alan id="bn-b-profil" etiket="Vade farkı profili">
                <select id="bn-b-profil" value={f.vadeProfil} onChange={alan("vadeProfil")} className={inputCls()}>
                  {profiller.map((v) => {
                    const kisa = v.ad.replace("Vade Farkı ", "");
                    return (
                      <option key={v.id} value={kisa}>
                        {kisa} · %{v.oran.replace("%", "")} — {v.aciklama}
                        {v.durum === "Pasif" ? " (pasif)" : ""}
                      </option>
                    );
                  })}
                </select>
              </Alan>
              <Alan
                id="bn-b-limit"
                etiket="İşlem bazlı ödeme limiti"
                hata={h("limit")}
                ipucu={ustLimit ? `Üst sınır: ₺ ${ustLimit.toLocaleString("tr-TR")} (kendi limitiniz)` : "Tek bir işlemde alınabilecek en yüksek tutar."}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">₺</span>
                  <input
                    id="bn-b-limit"
                    inputMode="numeric"
                    value={f.limit ? Number(rakamlar(f.limit)).toLocaleString("tr-TR") : ""}
                    onChange={(e) => setF({ ...f, limit: rakamlar(e.target.value) })}
                    aria-invalid={h("limit") ? true : undefined}
                    className={`${inputCls(h("limit"))} pl-7 font-bold tabular-nums`}
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
                      () => setF({ ...f, taksitler: f.taksitler.includes(n) ? f.taksitler.filter((x) => x !== n) : [...f.taksitler, n] }),
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
                      f.uyeIsyerleri.includes(u.cari),
                      () => setF({ ...f, uyeIsyerleri: f.uyeIsyerleri.includes(u.cari) ? f.uyeIsyerleri.filter((x) => x !== u.cari) : [...f.uyeIsyerleri, u.cari] }),
                      `${u.ad} — ${u.cari}`,
                      u.cari
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
                  <input
                    type="checkbox"
                    role="switch"
                    checked={f.altBayiYetkisi}
                    onChange={(e) => setF({ ...f, altBayiYetkisi: e.target.checked })}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                  />
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
                  checked={f.durum === "Aktif"}
                  onChange={(e) => setF({ ...f, durum: e.target.checked ? "Aktif" : "Pasif" })}
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

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onNavigate(listeHref)}
            className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}
          >
            Vazgeç
          </button>
          <button type="submit" className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            {mevcut ? "Değişiklikleri Kaydet" : "Kaydet"}
          </button>
        </div>
      </form>
    </>
  );
}

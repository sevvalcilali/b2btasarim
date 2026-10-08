// Manuel ödeme ve link ile ödemenin ortak müşteri bölümü ve ödeme koşulları (şartname s.4–6).

import { useState } from "react";
import { ROLES } from "@/lib/roles";
import { anaFirma } from "@/lib/mockData";
import I from "@/components/DesignIcons";
import { agDeposu, firmaKaydi, vadeProfili } from "./ag";
import { inputCls, Alan, MusteriSecici } from "./ortak";
import { FOCUS } from "./tema";
import { rakamlar } from "./yardimci";

const MUSTERI_SECENEKLERI = {
  [ROLES.ANA_FIRMA]: ["Bayi", "Düzenli Müşteri", "Düzensiz Müşteri"],
  [ROLES.BAYI]: ["Alt Bayi", "Düzenli Müşteri", "Düzensiz Müşteri", "Kendi Kartı"],
  [ROLES.ALT_BAYI]: ["Müşteri Kartı", "Kendi Kartı"],
};

export const TAHSILAT_CARISI = {
  [ROLES.ANA_FIRMA]: "Üye İşyeri",
  [ROLES.BAYI]: "Ana Firma Carisi",
  [ROLES.ALT_BAYI]: "Bayi Carisi",
};

// tanımlı (listeden seçilen) müşteri türleri
const LISTELI = new Set(["Bayi", "Alt Bayi", "Düzenli Müşteri"]);

const ANA_FIRMA_TAKSITLER = [1, 2, 3, 6, 9, 12];

// Müşteri seçimi — manuel ödeme ve link ile ödeme aynı yapıyı kullanır (şartname s.6)
const BOS_KISI = { ad: "", vkn: "", tel: "", email: "" };

// onerilenCari: listeden "Ödeme Al" ile gelindiğinde müşteri türü ve müşteri hazır seçili gelir
export function useMusteriSecimi(role, meta, onerilenCari) {
  const { bayiler, altBayiler, musteriler } = agDeposu.al();
  const turler = MUSTERI_SECENEKLERI[role];
  const kayit = firmaKaydi(role);
  const cariler =
    role === ROLES.ALT_BAYI
      ? bayiler.filter((b) => b.unvan === meta.parent).map((b) => ({ ad: b.unvan, cari: b.cari }))
      : anaFirma.uyeIsyerleri;

  const [baslangic] = useState(() => {
    const aday = [
      ["Bayi", bayiler],
      ["Alt Bayi", altBayiler],
      ["Düzenli Müşteri", musteriler.filter((x) => x.sahip === meta.company)],
    ].find(([t, liste]) => turler.includes(t) && liste.some((x) => x.cari === onerilenCari));
    return aday ? { tur: aday[0], secili: aday[1].find((x) => x.cari === onerilenCari) } : null;
  });
  const [tur, setTurDurumu] = useState(baslangic?.tur || turler[0]);
  const [secili, setSecili] = useState(baslangic?.secili || null);
  const [kendi, setKendi] = useState("");
  const [kisi, setKisi] = useState(BOS_KISI);
  const [cari, setCari] = useState(cariler[0]?.cari || "");

  // listeden seçilecek müşteriler
  const secenekler =
    tur === "Bayi"
      ? bayiler.filter((b) => b.durum === "Aktif")
      : tur === "Alt Bayi"
        ? altBayiler.filter((b) => b.durum === "Aktif" && b.bagliBayi === meta.company)
        : musteriler.filter((x) => x.sahip === meta.company);
  // kendi kartı: firmanın kendi unvanı ya da ortakları
  const kendiSecenekleri = [{ ad: meta.company, rol: "Firma unvanı" }, ...(kayit?.ortaklar || []).map((o) => ({ ad: o, rol: "Ortak" }))];
  const kendiKarti = tur === "Kendi Kartı";

  const hatalar = {};
  if (LISTELI.has(tur) && !secili) hatalar.musteri = "Listeden bir müşteri seçin.";
  if (tur === "Düzensiz Müşteri" || tur === "Müşteri Kartı") {
    if (!kisi.ad.trim()) hatalar.ad = "Ad soyad ya da unvan girin.";
    if (rakamlar(kisi.tel).length < 10) hatalar.tel = "Geçerli bir telefon numarası girin.";
  }
  if (tur === "Düzensiz Müşteri" && ![10, 11].includes(rakamlar(kisi.vkn).length)) hatalar.vkn = "10 haneli VKN ya da 11 haneli TCKN girin.";
  if (kendiKarti && !kendi) hatalar.kendi = "Kartın kime ait olduğunu seçin.";

  return {
    turler,
    kayit,
    cariler,
    tur,
    secili,
    setSecili,
    kendi,
    setKendi,
    kisi,
    setKisi,
    cari,
    setCari,
    secenekler,
    kendiSecenekleri,
    kendiKarti,
    hatalar,
    ad: LISTELI.has(tur) ? secili?.unvan : kendiKarti ? kendi : kisi.ad.trim(),
    // link gönderiminde öneri olarak kullanılan iletişim bilgisi
    iletisim: LISTELI.has(tur)
      ? { tel: secili?.telefon || "", email: secili?.email || "" }
      : kendiKarti
        ? { tel: kayit?.telefon || "", email: kayit?.email || "" }
        : { tel: kisi.tel, email: kisi.email },
    cariAdi: cariler.find((c) => c.cari === cari),
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

// Taksit sınırı, işlem limiti ve vade profili bayi tanımından gelir; ana firma bayiden tahsilatta o bayinin profilini uygular
export function odemeKosullari(kayit, tur, secili) {
  return {
    taksitler: kayit ? kayit.taksitler : ANA_FIRMA_TAKSITLER,
    limit: kayit ? kayit.islemLimiti : null,
    profil: vadeProfili(kayit ? kayit.vadeProfil : tur === "Bayi" && secili ? secili.vadeProfil : "Profil 1"),
  };
}

export function vadeHesabi(tutar, n, profil) {
  const vade = tutar > 0 && n > 1 && profil ? (tutar * profil.oran * (n - 1)) / 100 : 0;
  const toplam = tutar + vade;
  return { vade, toplam, aylik: toplam / n };
}

export function MusteriBolumu({ role, m, h }) {
  const { turler, tur, setTur, secenekler, secili, setSecili, kisi, setKisi, kendiKarti, kendiSecenekleri, kendi, setKendi, cariler, cari, setCari } = m;
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
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LISTELI.has(tur) && (
          <Alan id="bn-musteri" etiket={tur === "Düzenli Müşteri" ? "Tanımlı müşteri" : tur} hata={h("musteri")} className="sm:col-span-2">
            <MusteriSecici key={tur} id="bn-musteri" secenekler={secenekler} secili={secili} onSec={setSecili} hata={h("musteri")} />
          </Alan>
        )}

        {LISTELI.has(tur) && secili && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--soft)] p-3 text-[12px] sm:col-span-2 sm:grid-cols-4">
            {[
              ["Cari No", secili.cari],
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

        {(tur === "Düzensiz Müşteri" || tur === "Müşteri Kartı") && (
          <>
            <Alan id="bn-ad" etiket="Ad soyad / Unvan" hata={h("ad")}>
              <input
                id="bn-ad"
                value={kisi.ad}
                onChange={(e) => setKisi({ ...kisi, ad: e.target.value })}
                aria-invalid={h("ad") ? true : undefined}
                autoComplete="name"
                className={inputCls(h("ad"))}
              />
            </Alan>
            {tur === "Düzensiz Müşteri" && (
              <Alan id="bn-vkn" etiket="TCKN / VKN" hata={h("vkn")}>
                <input
                  id="bn-vkn"
                  inputMode="numeric"
                  maxLength={11}
                  value={kisi.vkn}
                  onChange={(e) => setKisi({ ...kisi, vkn: rakamlar(e.target.value) })}
                  aria-invalid={h("vkn") ? true : undefined}
                  className={`${inputCls(h("vkn"))} tabular-nums`}
                />
              </Alan>
            )}
            <Alan id="bn-tel" etiket="Telefon" hata={h("tel")}>
              <input
                id="bn-tel"
                type="tel"
                inputMode="tel"
                placeholder="05XX XXX XX XX"
                value={kisi.tel}
                onChange={(e) => setKisi({ ...kisi, tel: e.target.value })}
                aria-invalid={h("tel") ? true : undefined}
                autoComplete="tel"
                className={`${inputCls(h("tel"))} tabular-nums`}
              />
            </Alan>
            <Alan id="bn-eposta" etiket="E-posta (isteğe bağlı)">
              <input
                id="bn-eposta"
                type="email"
                value={kisi.email}
                onChange={(e) => setKisi({ ...kisi, email: e.target.value })}
                autoComplete="email"
                className={inputCls()}
              />
            </Alan>
            {tur === "Düzensiz Müşteri" && (
              <p className="flex items-start gap-1.5 text-[11.5px] text-[var(--muted)] sm:col-span-2">
                <I name="info" size={13} className="mt-px shrink-0" />
                Düzensiz müşteride bilgiler bu alanlarla sınırlıdır; müşteri tanımı oluşturulmaz.
              </p>
            )}
          </>
        )}

        {kendiKarti && (
          <fieldset className="sm:col-span-2" aria-describedby={h("kendi") ? "bn-kendi-hata" : undefined}>
            <legend className="mb-1 block text-[12px] font-semibold text-[var(--fg-2)]">Kart sahibi</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {kendiSecenekleri.map((o) => (
                <label
                  key={o.ad}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                    kendi === o.ad ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="bn-kendi"
                    value={o.ad}
                    checked={kendi === o.ad}
                    onChange={() => setKendi(o.ad)}
                    aria-invalid={h("kendi") ? true : undefined}
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[12.5px] font-bold text-[var(--fg)]">{o.ad}</span>
                    <span className="block text-[11px] text-[var(--muted)]">{o.rol}</span>
                  </span>
                </label>
              ))}
            </div>
            {h("kendi") && (
              <p id="bn-kendi-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                {h("kendi")}
              </p>
            )}
          </fieldset>
        )}

        <Alan
          id="bn-cari"
          etiket={TAHSILAT_CARISI[role]}
          ipucu={role === ROLES.ANA_FIRMA ? "Ödemenin alınacağı üye işyeri." : "Ödemenin aktarılacağı cari."}
          className="sm:col-span-2"
        >
          <select id="bn-cari" value={cari} onChange={(e) => setCari(e.target.value)} className={inputCls()}>
            {cariler.map((c) => (
              <option key={c.cari} value={c.cari}>
                {c.ad} — {c.cari}
              </option>
            ))}
          </select>
        </Alan>
      </div>
    </>
  );
}

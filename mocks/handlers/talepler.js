// /iptal-iade-talepleri — şartname s.8 (onay zinciri) ve s.7 (takip raporu)
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { altBayileri, kapsamda, onayimda, simdi, talepCevabi } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

const kapsamdakiTalepler = (kim) =>
  depo
    .tablo("iptalIadeTalepleri")
    .filter((t) => kapsamda(kim, t.girenId))
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));

// Görünüm süzgeçleri — rolün sekmeleri bunlardan oluşur
const GORUNUMLER = {
  TUMU: () => true,
  ONAYIMDA: (t, kim) => onayimda(kim, t),
  UST_ONAYA_ILETILEN: (t) => t.durum === "ANA_FIRMA_ONAYINDA",
  ONAY_BEKLEYEN: (t) => t.durum === "BAYI_ONAYINDA" || t.durum === "ANA_FIRMA_ONAYINDA",
  ONAYLANDI: (t) => t.durum === "ONAYLANDI",
  REDDEDILDI: (t) => t.durum === "REDDEDILDI",
};

/** Talep girilebilecek işlemler: kendi başarılı çekimleri, açık / onaylı talebi olmayanlar */
export const uygunIslemler = (kim) => {
  const talepler = depo.tablo("iptalIadeTalepleri");
  return depo
    .tablo("islemler")
    .filter((t) => t.cekimYapanId === kim.firmaId && t.durum === "BASARILI" && !talepler.some((x) => x.islemNo === t.islemNo && x.durum !== "REDDEDILDI"))
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));
};

export const taleplerHandlers = [
  http.get(uc("/iptal-iade-talepleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const gorunum = new URL(request.url).searchParams.get("gorunum") || "TUMU";
    const kaynak = kapsamdakiTalepler(kim);
    const suzgec = GORUNUMLER[gorunum] || GORUNUMLER.TUMU;
    const liste = kaynak.filter((t) => suzgec(t, kim));
    return HttpResponse.json({
      kayitlar: liste.map((t) => talepCevabi(t, kim)),
      toplam: liste.length,
      sayfa: 1,
      boyut: Math.max(liste.length, 1),
      sayaclar: Object.fromEntries(Object.entries(GORUNUMLER).map(([k, f]) => [k, kaynak.filter((t) => f(t, kim)).length])),
    });
  }),

  http.get(uc("/iptal-iade-talepleri/uygun-islemler"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const liste = uygunIslemler(kim).map((t) => ({ islemNo: t.islemNo, tarih: t.tarih, musteriUnvan: t.musteri.unvan, tutarKurus: t.tutarKurus }));
    return HttpResponse.json({ kayitlar: liste });
  }),

  http.post(uc("/iptal-iade-talepleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const islem = uygunIslemler(kim).find((t) => t.islemNo === g.islemNo);
    const alanlar = {};
    if (!islem) alanlar.islemNo = "Talep girilebilecek bir işlem seçin.";
    if (!["IADE", "IPTAL"].includes(g.tur)) alanlar.tur = "Talep türü İADE ya da İPTAL olmalı.";
    const tutar = g.tur === "IPTAL" && islem ? islem.tutarKurus : g.tutarKurus;
    if (islem && !(Number.isInteger(tutar) && tutar > 0 && tutar <= islem.tutarKurus)) alanlar.tutarKurus = `0 ile ₺ ${(islem.tutarKurus / 100).toLocaleString("tr-TR")} arasında bir tutar girin.`;
    if (!String(g.aciklama || "").trim()) alanlar.aciklama = "Açıklama girin.";
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);

    const anaFirmaMi = kim.rol === "ANA_FIRMA";
    const durum = anaFirmaMi ? "ONAYLANDI" : kim.rol === "BAYI" ? "ANA_FIRMA_ONAYINDA" : "BAYI_ONAYINDA";
    const no = Math.max(...depo.tablo("iptalIadeTalepleri").map((t) => Number(t.talepNo.replace(/\D/g, "")))) + 1;
    const talep = {
      talepNo: `TLP-${no}`,
      tarih: simdi(),
      islemNo: islem.islemNo,
      girenId: kim.firmaId,
      tur: g.tur,
      tutarKurus: tutar,
      aciklama: String(g.aciklama).trim(),
      durum,
      gecmis: [{ tarih: simdi(), firmaId: kim.firmaId, olay: "TALEP_GIRILDI", not: anaFirmaMi ? "Ana firma girişi, onay gerekmedi" : undefined }],
    };
    depo.ekle("iptalIadeTalepleri", talep);
    // ana firmanın kendi talebi anında sonuçlanır: işlem durumu da değişir
    if (anaFirmaMi) depo.degistir("islemler", "islemNo", islem.islemNo, (t) => ({ ...t, durum: g.tur }));
    return HttpResponse.json(talepCevabi(talep, kim), { status: 201 });
  }),

  http.post(uc("/iptal-iade-talepleri/:talepNo/onay"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const t = depo.tablo("iptalIadeTalepleri").find((x) => x.talepNo === params.talepNo);
    if (!t || !kapsamda(kim, t.girenId)) return hata(404, "TALEP_YOK", "Talep bulunamadı.");
    if (!onayimda(kim, t)) return hata(403, "YETKI_YOK", "Bu talep sizin onayınızda değil.");
    const bayiMi = kim.rol === "BAYI";
    const guncel = depo.degistir("iptalIadeTalepleri", "talepNo", t.talepNo, (x) => ({
      ...x,
      durum: bayiMi ? "ANA_FIRMA_ONAYINDA" : "ONAYLANDI",
      gecmis: [...x.gecmis, { tarih: simdi(), firmaId: kim.firmaId, olay: bayiMi ? "ONAYLADI_ILETTI" : "ONAYLADI" }],
    }));
    if (!bayiMi) depo.degistir("islemler", "islemNo", t.islemNo, (x) => ({ ...x, durum: t.tur }));
    return HttpResponse.json({ ...talepCevabi(guncel, kim), bildirim: bayiMi ? "Talep onaylandı ve ana firma onayına iletildi." : "Talep onaylandı; talebi giren firma e-posta ile bilgilendirildi." });
  }),

  http.post(uc("/iptal-iade-talepleri/:talepNo/red"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const t = depo.tablo("iptalIadeTalepleri").find((x) => x.talepNo === params.talepNo);
    if (!t || !kapsamda(kim, t.girenId)) return hata(404, "TALEP_YOK", "Talep bulunamadı.");
    if (!onayimda(kim, t)) return hata(403, "YETKI_YOK", "Bu talep sizin onayınızda değil.");
    const g = await request.json().catch(() => ({}));
    const gerekce = String(g?.gerekce || "").trim();
    if (!gerekce) return kuralHatasi("DOGRULAMA", "Gerekçe girin.", { gerekce: "Gerekçe girin; talebi girene e-posta ile iletilir." });
    const guncel = depo.degistir("iptalIadeTalepleri", "talepNo", t.talepNo, (x) => ({
      ...x,
      durum: "REDDEDILDI",
      gecmis: [...x.gecmis, { tarih: simdi(), firmaId: kim.firmaId, olay: "REDDETTI", not: gerekce }],
    }));
    return HttpResponse.json({ ...talepCevabi(guncel, kim), bildirim: "Talep reddedildi; talebi giren firma e-posta ile bilgilendirildi." });
  }),
];

export { altBayileri };

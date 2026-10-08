// GET /raporlar/bayi-ozet — şartname s.7: müşteri türü filtresi; işlem adet, tutar, vade farkı, hesaba geçecek rakam.
// Ana firma tüm bayi / alt bayileri, bayi kendisini ve alt bayilerini görür; alt bayinin özet raporu yoktur (403).
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { altBayileri, firma, firmaOzeti, kapsamda, taksitHesabi } from "../kurallar";
import { gecikme, hata, uc, yetkili } from "./yardimci";

const GUN = 86400000;
const DONEMLER = { "7g": 7, "30g": 30, tumu: null };

/** İşlemin vade farkı: çekimi yapan firmanın profiliyle (ana firma bayiden çekimde o bayinin profili) */
function vadeFarki(t) {
  if (t.taksit <= 1) return 0;
  const yapan = firma(t.cekimYapanId);
  let profilId = yapan?.vadeProfilId;
  if (yapan?.tur === "ANA_FIRMA") {
    const bayi = t.musteriTuru === "BAYI" ? depo.tablo("firmalar").find((f) => f.cariNo === t.musteri.cariNo) : null;
    profilId = bayi?.vadeProfilId || 1;
  }
  const profil = depo.tablo("vadeFarkiProfilleri").find((p) => p.id === profilId) || depo.tablo("vadeFarkiProfilleri")[0];
  return taksitHesabi(t.tutarKurus, t.taksit, profil.oranYuzde).vadeFarkiKurus;
}

const BOS = () => ({ islemAdet: 0, basariliAdet: 0, basarisizAdet: 0, ciroKurus: 0, vadeFarkiKurus: 0, iptalIadeKurus: 0, hesabaGececekKurus: 0 });

function topla(ozet, t) {
  ozet.islemAdet += 1;
  if (t.durum === "BASARILI") {
    ozet.basariliAdet += 1;
    ozet.ciroKurus += t.tutarKurus;
    ozet.vadeFarkiKurus += vadeFarki(t);
  } else if (t.durum === "BASARISIZ") ozet.basarisizAdet += 1;
  else ozet.iptalIadeKurus += t.tutarKurus; // IPTAL, IADE
  // DEMO VARSAYIMI: hesaba geçecek = başarılı ciro + vade farkı − iptal/iade (asıl hesabı backend belirleyecek)
  ozet.hesabaGececekKurus = ozet.ciroKurus + ozet.vadeFarkiKurus - ozet.iptalIadeKurus;
  return ozet;
}

export const raporlarHandlers = [
  http.get(uc("/raporlar/bayi-ozet"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (kim.rol === "ALT_BAYI") return hata(403, "YETKI_YOK", "Alt bayinin özet raporu yoktur; işlem detaylarını kullanın.");
    const s = new URL(request.url).searchParams;
    const musteriTuru = s.get("musteriTuru");
    const donem = DONEMLER[s.get("donem") || "30g"] === undefined ? "30g" : s.get("donem") || "30g";
    const gunSayisi = DONEMLER[donem];
    const esik = gunSayisi ? new Date(Date.now() - gunSayisi * GUN).toISOString() : null;

    // rapor satırları: ana firma → bayiler + tüm alt bayiler; bayi → kendisi + alt bayileri
    const firmalar =
      kim.rol === "ANA_FIRMA"
        ? depo.tablo("firmalar").filter((f) => f.tur !== "ANA_FIRMA")
        : [firma(kim.firmaId), ...altBayileri(kim.firmaId)].filter(Boolean);
    const islemler = depo.tablo("islemler").filter((t) => kapsamda(kim, t.cekimYapanId) && (!esik || t.tarih >= esik) && (!musteriTuru || t.musteriTuru === musteriTuru));

    const kayitlar = firmalar
      .map((f) => {
        const ozet = islemler.filter((t) => t.cekimYapanId === f.firmaId).reduce(topla, BOS());
        return { firma: firmaOzeti(f.firmaId), bagli: f.bagliFirmaId ? firmaOzeti(f.bagliFirmaId) : null, vadeProfil: f.vadeProfilId ? depo.tablo("vadeFarkiProfilleri").find((p) => p.id === f.vadeProfilId)?.ad.replace("Vade Farkı ", "") : null, durum: f.durum, ...ozet };
      })
      .sort((a, b) => b.ciroKurus - a.ciroKurus);
    const toplam = islemler.reduce(topla, BOS());
    return HttpResponse.json({
      donem,
      kayitlar,
      toplam: { ...toplam, firmaAdet: kayitlar.length },
      musteriTurleri: [...new Set(depo.tablo("islemler").filter((t) => kapsamda(kim, t.cekimYapanId)).map((t) => t.musteriTuru))],
    });
  }),
];

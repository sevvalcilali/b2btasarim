// GET /raporlar/bayi-ozet — şartname s.7: müşteri türü filtresi; işlem adet, tutar, vade farkı, hesaba geçecek rakam.
// Ana firma tüm bayi / alt bayileri, bayi kendisini ve alt bayilerini görür; alt bayinin özet raporu yoktur (403).
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { altBayileri, faturaDurumu, faturaGerekli, firma, firmaOzeti, kapsamda, taksitHesabi, tarihAraligi } from "../kurallar";
import { gecikme, hata, uc, yetkili } from "./yardimci";


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

/** Rolün rapor satırı firmaları ve tarih aralığı (iki özet raporunda ortak) */
function raporKapsami(kim, s) {
  const aralik = tarihAraligi(s);
  const firmalar =
    kim.rol === "ANA_FIRMA"
      ? depo.tablo("firmalar").filter((f) => f.tur !== "ANA_FIRMA")
      : [firma(kim.firmaId), ...altBayileri(kim.firmaId)].filter(Boolean);
  return { aralik, firmalar };
}
const aralikCevabi = (a) => ({ baslangic: a.baslangic, bitis: a.bitis, gun: a.gun, onceki: { baslangic: a.onceki.baslangic, bitis: a.onceki.bitis } });

export const raporlarHandlers = [
  // Şartname s.2 / s.9: bayi başına fatura durumu — gereken, yüklenen, bekleyen, reddedilen; bekleyen tutar
  http.get(uc("/raporlar/bayi-fatura-ozet"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (kim.rol === "ALT_BAYI") return hata(403, "YETKI_YOK", "Alt bayinin fatura özet raporu yoktur; Fatura Yükleme Detay ekranını kullanın.");
    const { aralik, firmalar } = raporKapsami(kim, new URL(request.url).searchParams);
    const kapsamdakiler = depo.tablo("islemler").filter((t) => kapsamda(kim, t.cekimYapanId) && faturaGerekli(t));
    const islemler = kapsamdakiler.filter((t) => aralik.icinde(t.tarih));
    const bos = () => ({ gereken: 0, yuklenen: 0, bekleyen: 0, reddedilen: 0, bekleyenKurus: 0 });
    const topla = (o, t) => {
      const d = faturaDurumu(t.islemNo).durum;
      o.gereken += 1;
      if (d === "YUKLENDI") o.yuklenen += 1;
      else {
        if (d === "REDDEDILDI") o.reddedilen += 1;
        else o.bekleyen += 1;
        o.bekleyenKurus += t.tutarKurus;
      }
      return o;
    };
    const kayitlar = firmalar
      .map((f) => ({
        firma: firmaOzeti(f.firmaId),
        bagli: f.bagliFirmaId ? firmaOzeti(f.bagliFirmaId) : null,
        durum: f.durum,
        ...islemler.filter((t) => t.cekimYapanId === f.firmaId).reduce(topla, bos()),
      }))
      .sort((a, b) => b.bekleyen + b.reddedilen - (a.bekleyen + a.reddedilen) || b.gereken - a.gereken);
    return HttpResponse.json({
      aralik: aralikCevabi(aralik),
      kayitlar,
      toplam: { ...islemler.reduce(topla, bos()), firmaAdet: kayitlar.length },
      onceki: kapsamdakiler.filter((t) => aralik.onceki.icinde(t.tarih)).reduce(topla, bos()), // önceki döneme göre değişim için
    });
  }),

  http.get(uc("/raporlar/bayi-ozet"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (kim.rol === "ALT_BAYI") return hata(403, "YETKI_YOK", "Alt bayinin özet raporu yoktur; işlem detaylarını kullanın.");
    const s = new URL(request.url).searchParams;
    const musteriTuru = s.get("musteriTuru");
    // rapor satırları: ana firma → bayiler + tüm alt bayiler; bayi → kendisi + alt bayileri
    const { aralik, firmalar } = raporKapsami(kim, s);
    // yalnız rapor satırındaki firmaların çekimleri: ana firmanın kendi tahsilatı bayi özetine girmez (toplam = satırların toplamı)
    const satirFirmalari = new Set(firmalar.map((f) => f.firmaId));
    const kapsamdakiler = depo.tablo("islemler").filter((t) => satirFirmalari.has(t.cekimYapanId) && (!musteriTuru || t.musteriTuru === musteriTuru));
    const islemler = kapsamdakiler.filter((t) => aralik.icinde(t.tarih));

    const kayitlar = firmalar
      .map((f) => {
        const ozet = islemler.filter((t) => t.cekimYapanId === f.firmaId).reduce(topla, BOS());
        return { firma: firmaOzeti(f.firmaId), bagli: f.bagliFirmaId ? firmaOzeti(f.bagliFirmaId) : null, vadeProfil: f.vadeProfilId ? depo.tablo("vadeFarkiProfilleri").find((p) => p.id === f.vadeProfilId)?.ad.replace("Vade Farkı ", "") : null, durum: f.durum, ...ozet };
      })
      .sort((a, b) => b.ciroKurus - a.ciroKurus);
    const toplam = islemler.reduce(topla, BOS());
    return HttpResponse.json({
      aralik: aralikCevabi(aralik),
      kayitlar,
      toplam: { ...toplam, firmaAdet: kayitlar.length },
      onceki: kapsamdakiler.filter((t) => aralik.onceki.icinde(t.tarih)).reduce(topla, BOS()),
      musteriTurleri: [...new Set(depo.tablo("islemler").filter((t) => kapsamda(kim, t.cekimYapanId)).map((t) => t.musteriTuru))],
    });
  }),
];

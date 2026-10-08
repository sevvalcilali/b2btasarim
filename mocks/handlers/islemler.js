// GET /islemler — şartname s.7: müşteri türü, cari no, unvan, vergi no; rol kapsamı sunucuda
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { firmaOzeti, icerir, kapsamda, sayaclar, sayfala } from "../kurallar";
import { gecikme, uc, yetkili } from "./yardimci";

const DURUMLAR = ["BASARILI", "BASARISIZ", "IPTAL", "IADE"];

/** Depodaki ham işlem → sözleşmedeki Islem cevabı */
export function islemCevabi(t) {
  return {
    islemNo: t.islemNo,
    tarih: t.tarih,
    cekimYapan: firmaOzeti(t.cekimYapanId),
    musteriTuru: t.musteriTuru,
    musteri: t.musteri,
    kart: { son4: t.kartSon4 },
    odemeTipi: t.odemeTipi,
    taksit: t.taksit,
    tutarKurus: t.tutarKurus,
    durum: t.durum,
    uyeIsyeriCariNo: t.uyeIsyeriCariNo ?? null,
  };
}

/** Oturumun görebildiği işlemler, en yeniden eskiye */
export const kapsamdakiIslemler = (kim) =>
  depo
    .tablo("islemler")
    .filter((t) => kapsamda(kim, t.cekimYapanId))
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));

export const islemlerHandlers = [
  http.get(uc("/islemler"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const s = new URL(request.url).searchParams;
    const durum = s.get("durum");
    const musteriTuru = s.get("musteriTuru");
    const odemeTipi = s.get("odemeTipi");
    const q = (s.get("q") || "").trim();
    const firmaId = s.get("firmaId"); // çekimi yapan firma (bayi detay paneli)
    const [siraAlan, siraYon] = (s.get("sira") || "tarih:desc").split(":");

    const kaynak = kapsamdakiIslemler(kim);
    // durum dışındaki filtreler: durum sekmelerinin sayıları bunların üzerinden hesaplanır
    const adaylar = kaynak.filter(
      (t) =>
        (!firmaId || t.cekimYapanId === firmaId) &&
        (!musteriTuru || t.musteriTuru === musteriTuru) &&
        (!odemeTipi || t.odemeTipi === odemeTipi) &&
        (!q || [t.islemNo, t.musteri.unvan, t.musteri.cariNo, t.musteri.vergiNo, t.kartSon4, firmaOzeti(t.cekimYapanId)?.unvan].some((f) => icerir(f, q)))
    );
    const liste = adaylar.filter((t) => !durum || t.durum === durum);
    // sıralama sunucuda (liste sayfalı): tarih, tutarKurus, islemNo
    const al = { tarih: (t) => t.tarih, tutarKurus: (t) => t.tutarKurus, islemNo: (t) => t.islemNo }[siraAlan] || ((t) => t.tarih);
    liste.sort((a, b) => (al(a) < al(b) ? -1 : al(a) > al(b) ? 1 : 0) * (siraYon === "asc" ? 1 : -1));
    const sayfa = sayfala(liste, s);
    return HttpResponse.json({
      ...sayfa,
      kayitlar: sayfa.kayitlar.map(islemCevabi),
      sayaclar: sayaclar(adaylar, "durum", DURUMLAR),
      // filtreye uyan tüm kayıtların özeti (sayfadan bağımsız)
      ozet: {
        toplamKurus: liste.reduce((a, t) => a + t.tutarKurus, 0),
        basariliKurus: liste.filter((t) => t.durum === "BASARILI").reduce((a, t) => a + t.tutarKurus, 0),
      },
      // kapsamda görülen müşteri türleri (filtre listesi yalnızca bunları sunar)
      musteriTurleri: [...new Set(kaynak.map((t) => t.musteriTuru))],
    });
  }),
];

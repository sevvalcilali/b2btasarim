// GET /bakiye/ekstre — üst cari karşısındaki bakiye, borç ve hareketler (şartname s.2: Ana Firma / Bayi Bakiye ve Borç).
// Hareketler: borç yüklemeleri (tohum) + bu firmanın yaptığı ödemeler, iade ve iptaller (işlem tablosu).
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { firma, firmaOzeti } from "../kurallar";
import { gecikme, hata, uc, yetkili } from "./yardimci";

const GUN = 86400000;
const DONEMLER = { "30g": 30, "90g": 90, tumu: null };

/** İşlem → hareket: ödeme borcu düşürür, iade / iptal geri ekler */
function islemHareketi(t) {
  if (t.durum === "BASARILI") return { tur: "ODEME", tutarKurus: -t.tutarKurus, aciklama: `${t.musteri?.unvan || "Müşteri"} ödemesi · ${t.taksit > 1 ? `${t.taksit} taksit` : "tek çekim"}` };
  if (t.durum === "IADE" || t.durum === "IPTAL") return { tur: t.durum, tutarKurus: t.tutarKurus, aciklama: `${t.musteri?.unvan || "Müşteri"} ${t.durum === "IADE" ? "iadesi" : "iptali"}` };
  return null;
}

export const bakiyeHandlers = [
  http.get(uc("/bakiye/ekstre"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const f = firma(kim.firmaId);
    if (!f?.bagliFirmaId) return hata(403, "YETKI_YOK", "Ana firmanın üst carisi yoktur; firma limiti ana sayfada gösterilir.");
    const s = new URL(request.url).searchParams;
    const donem = DONEMLER[s.get("donem")] === undefined ? "30g" : s.get("donem");
    const esik = DONEMLER[donem] ? new Date(Date.now() - DONEMLER[donem] * GUN).toISOString() : null;
    const b = depo.tablo("bakiyeler")[kim.firmaId] || { bakiyeKurus: 0, borcKurus: 0, limitKurus: 0, kullanimYuzde: 0 };

    const hepsi = [
      ...depo.tablo("borcHareketleri").filter((h) => h.firmaId === kim.firmaId).map((h) => ({ hareketId: h.hareketId, tarih: h.tarih, tur: "BORC", aciklama: h.aciklama, islemNo: null, tutarKurus: h.tutarKurus })),
      ...depo
        .tablo("islemler")
        .filter((t) => t.cekimYapanId === kim.firmaId)
        .map((t) => {
          const h = islemHareketi(t);
          return h && { hareketId: `IH-${t.islemNo}`, tarih: t.tarih, islemNo: t.islemNo, ...h };
        })
        .filter(Boolean),
    ].sort((a, b2) => b2.tarih.localeCompare(a.tarih));
    const hareketler = hepsi.filter((h) => !esik || h.tarih >= esik);
    const toplam = (f2) => hareketler.filter(f2).reduce((t, h) => t + Math.abs(h.tutarKurus), 0);
    return HttpResponse.json({
      ustCari: firmaOzeti(f.bagliFirmaId),
      bakiyeKurus: b.bakiyeKurus,
      borcKurus: b.borcKurus,
      limitKurus: b.limitKurus,
      kullanimYuzde: b.kullanimYuzde,
      sonGuncelleme: new Date(Date.now() - 35 * 60000).toISOString(),
      donem,
      hareketler,
      donemToplami: { borcKurus: toplam((h) => h.tur === "BORC"), odemeKurus: toplam((h) => h.tur === "ODEME"), iadeIptalKurus: toplam((h) => h.tur === "IADE" || h.tur === "IPTAL") },
    });
  }),
];

// GET /bakiye/ekstre — üst cari karşısındaki bakiye, borç ve hareketler (şartname s.2: Ana Firma / Bayi Bakiye ve Borç).
// POST /bakiye/toplu(/onizleme) — ana firma bayilerinin, bayi alt bayilerinin bakiye / borç / limitini dosyadan yükler (s.2, s.10).
// Hareketler: borç yüklemeleri (tohum) + bu firmanın yaptığı ödemeler, iade ve iptaller (işlem tablosu).
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { firma, firmaOzeti, simdi } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkiGerekli, yetkili } from "./yardimci";
import { dosyadanCsv, tlCoz } from "../csv";
import { yonetilenler } from "./bayiler";

const GUN = 86400000;
const DONEMLER = { "30g": 30, "90g": 90, tumu: null };

/** İşlem → hareket: ödeme borcu düşürür, iade / iptal geri ekler */
function islemHareketi(t) {
  if (t.durum === "BASARILI") return { tur: "ODEME", tutarKurus: -t.tutarKurus, aciklama: `${t.musteri?.unvan || "Müşteri"} ödemesi · ${t.taksit > 1 ? `${t.taksit} taksit` : "tek çekim"}` };
  if (t.durum === "IADE" || t.durum === "IPTAL") return { tur: t.durum, tutarKurus: t.tutarKurus, aciklama: `${t.musteri?.unvan || "Müşteri"} ${t.durum === "IADE" ? "iadesi" : "iptali"}` };
  return null;
}

/** Dosyayı okuyup satırları doğrular: cari yönetilen bir bayi olmalı, tutarlar ≥ 0, borç limiti aşmamalı */
async function topluCoz(request, kim) {
  const yetkiHatasi = yetkiGerekli(kim, "BAYI_TANIM", ["ANA_FIRMA", "BAYI"]);
  if (yetkiHatasi) return { cevap: yetkiHatasi };
  const fd = await request.formData().catch(() => null);
  if (!fd) return { cevap: hata(400, "GECERSIZ_GOVDE", "Form verisi okunamadı.") };
  const okunan = await dosyadanCsv(fd);
  if (okunan.hata) return { cevap: kuralHatasi("DOSYA", okunan.hata, { dosya: okunan.hata }) };
  if (!okunan.basliklar.includes("carino")) return { cevap: kuralHatasi("BASLIK", "Eksik sütun: cariNo. Şablonu kullanın.", { dosya: "Eksik sütun: cariNo" }) };
  const bayiler = yonetilenler(kim);
  const gorulen = new Set();
  const satirlar = okunan.satirlar.map((s, i) => {
    const cariNo = String(s.carino || "").trim();
    const bayi = bayiler.find((f) => f.cariNo === cariNo);
    const mevcut = (bayi && depo.tablo("bakiyeler")[bayi.firmaId]) || { bakiyeKurus: 0, borcKurus: 0, limitKurus: 0 };
    const oku = (k, eski) => {
      const v = tlCoz(s[k]);
      return v === null ? eski : v;
    };
    const girdi = { cariNo, unvan: bayi?.unvan || null, bakiyeKurus: oku("bakiyetl", mevcut.bakiyeKurus), borcKurus: oku("borctl", mevcut.borcKurus), limitKurus: oku("limittl", mevcut.limitKurus), aciklama: String(s.aciklama || "").trim() };
    const hatalar = {};
    if (!bayi) hatalar.cariNo = "Bu cari no yönettiğiniz bir bayiye ait değil.";
    else if (gorulen.has(cariNo)) hatalar.cariNo = "Dosyada aynı cari no birden çok kez var.";
    gorulen.add(cariNo);
    for (const k of ["bakiyeKurus", "borcKurus", "limitKurus"]) if (!(Number.isInteger(girdi[k]) && girdi[k] >= 0)) hatalar[k] = "Geçerli bir tutar girin (örn. 12.500,00).";
    if (!hatalar.borcKurus && !hatalar.limitKurus && girdi.limitKurus && girdi.borcKurus > girdi.limitKurus) hatalar.borcKurus = "Borç, limiti aşamaz.";
    if (tlCoz(s.bakiyetl) === null && tlCoz(s.borctl) === null && tlCoz(s.limittl) === null) hatalar.bakiyeKurus = "Bakiye, borç ya da limitten en az birini girin.";
    return { sira: i + 2, girdi, eski: bayi ? { ...mevcut } : null, hatalar, gecerli: Object.keys(hatalar).length === 0, firmaId: bayi?.firmaId };
  });
  return { satirlar };
}

const topluOzet = (satirlar) => ({ toplam: satirlar.length, gecerli: satirlar.filter((s) => s.gecerli).length, hatali: satirlar.filter((s) => !s.gecerli).length, satirlar: satirlar.map(({ firmaId, ...s }) => s) });

export const bakiyeHandlers = [
  http.post(uc("/bakiye/toplu/onizleme"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const { satirlar, cevap: hataCevabi } = await topluCoz(request, kim);
    return hataCevabi || HttpResponse.json(topluOzet(satirlar));
  }),

  http.post(uc("/bakiye/toplu"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const { satirlar, cevap: hataCevabi } = await topluCoz(request, kim);
    if (hataCevabi) return hataCevabi;
    const gecerliler = satirlar.filter((s) => s.gecerli);
    depo.guncelle("bakiyeler", (b) => {
      const yeni = { ...b };
      for (const s of gecerliler) {
        const { bakiyeKurus, borcKurus, limitKurus } = s.girdi;
        yeni[s.firmaId] = { bakiyeKurus, borcKurus, limitKurus, kullanimYuzde: limitKurus ? Math.min(100, Math.round((borcKurus / limitKurus) * 100)) : 0 };
      }
      return yeni;
    });
    // borç artışı ekstreye hareket olarak düşer
    const zaman = simdi();
    const hareketler = gecerliler
      .filter((s) => s.girdi.borcKurus > (s.eski?.borcKurus || 0))
      .map((s, i) => ({ hareketId: `BH-${Date.now()}-${i}`, firmaId: s.firmaId, tarih: zaman, aciklama: s.girdi.aciklama || "Toplu borç yüklemesi", tutarKurus: s.girdi.borcKurus - (s.eski?.borcKurus || 0) }));
    if (hareketler.length) depo.guncelle("borcHareketleri", (l) => [...hareketler, ...l]);
    return HttpResponse.json({ ...topluOzet(satirlar), guncellenen: gecerliler.length, atlanan: satirlar.length - gecerliler.length }, { status: 200 });
  }),

  http.get(uc("/bakiye/ekstre"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const f = firma(kim.firmaId);
    if (!f?.bagliFirmaId) return hata(403, "YETKI_YOK", "Ana firmanın üst carisi yoktur; firma limiti ana sayfada gösterilir.");
    const s = new URL(request.url).searchParams;
    const donem = DONEMLER[s.get("donem")] === undefined ? "30g" : s.get("donem");
    const esik = DONEMLER[donem] ? simdi(Date.now() - DONEMLER[donem] * GUN) : null;
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
      sonGuncelleme: simdi(Date.now() - 35 * 60000),
      donem,
      hareketler,
      donemToplami: { borcKurus: toplam((h) => h.tur === "BORC"), odemeKurus: toplam((h) => h.tur === "ODEME"), iadeIptalKurus: toplam((h) => h.tur === "IADE" || h.tur === "IPTAL") },
    });
  }),
];

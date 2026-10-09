// /faturalar — şartname s.9 (fatura yükleme, şeklen kontrol, gizlilik) ve s.10 (link üzerinden yükleme)
import { http, HttpResponse } from "msw";
import { depo } from "../db/store";
import { faturaDurumu, faturaGerekli, firmaOzeti, kapsamda, simdi } from "../rules";
import { islemCevabi } from "./transactions";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./helpers";

const FATURA_LINKI = "https://link.nkolayislem.com.tr/fatura/";
const DOSYA_TURLERI = ["pdf", "jpg", "jpeg", "png"];
const EN_BUYUK_DOSYA = 5 * 1024 * 1024;

/** Fatura kaydı; içerik yalnızca yükleyen firmaya döner (s.9: bayi ve ana firmaya fatura gösterilmez) */
function faturaCevabi(kayit, kendi) {
  if (!kayit) return null;
  const ortak = { durum: kayit.durum, yukleme: kayit.yukleme, redNedeni: kayit.redNedeni || null };
  return kendi ? { ...ortak, faturaNo: kayit.faturaNo, faturaTarihi: kayit.faturaTarihi, tutarKurus: kayit.tutarKurus, dosyaAdi: kayit.dosyaAdi } : { ...ortak, icerikGizli: true };
}

const satir = (islem, kim) => {
  const { kayit, durum } = faturaDurumu(islem.islemNo);
  const kendi = islem.cekimYapanId === kim.firmaId;
  return { islem: islemCevabi(islem), fatura: faturaCevabi(kayit, kendi), durum, kendi };
};

const DURUM_SUZGECI = { YUKLENMEMIS: (d) => d !== "YUKLENDI", YUKLENEN: (d) => d === "YUKLENDI", TUMU: () => true };

export const faturalarHandlers = [
  http.get(uc("/faturalar"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const durum = new URL(request.url).searchParams.get("durum") || "YUKLENMEMIS";
    const tumu = depo
      .tablo("islemler")
      .filter((t) => kapsamda(kim, t.cekimYapanId) && faturaGerekli(t))
      .sort((a, b) => (a.tarih < b.tarih ? 1 : -1))
      .map((t) => satir(t, kim));
    const liste = tumu.filter((s) => (DURUM_SUZGECI[durum] || DURUM_SUZGECI.TUMU)(s.durum));
    const bekleyen = tumu.filter((s) => s.durum !== "YUKLENDI");
    return HttpResponse.json({
      kayitlar: liste,
      toplam: liste.length,
      sayfa: 1,
      boyut: Math.max(liste.length, 1),
      sayaclar: { YUKLENMEMIS: bekleyen.length, YUKLENEN: tumu.length - bekleyen.length, TUMU: tumu.length },
      ozet: {
        bekleyen: bekleyen.length,
        bekleyenKurus: bekleyen.reduce((a, s) => a + s.islem.tutarKurus, 0),
        yuklenen: tumu.length - bekleyen.length,
        kendiBekleyen: bekleyen.filter((s) => s.kendi).length,
      },
    });
  }),

  // multipart/form-data: islemNo, faturaNo, faturaTarihi (YYYY-AA-GG), tutarKurus, dosya
  http.post(uc("/faturalar"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const fd = await request.formData().catch(() => null);
    if (!fd) return hata(400, "GECERSIZ_GOVDE", "Form verisi okunamadı.");
    const islemNo = String(fd.get("islemNo") || "");
    const islem = depo.tablo("islemler").find((t) => t.islemNo === islemNo);
    if (!islem || islem.cekimYapanId !== kim.firmaId) return hata(404, "ISLEM_YOK", "İşlem bulunamadı ya da size ait değil.");
    if (!faturaGerekli(islem)) return hata(409, "FATURA_GEREKMIYOR", "Bu işlem için fatura gerekmiyor.");

    // şeklen kontrol (s.9): uygun olmayan fatura alınmaz
    const alanlar = {};
    const faturaNo = String(fd.get("faturaNo") || "").toUpperCase();
    const faturaTarihi = String(fd.get("faturaTarihi") || "");
    const tutarKurus = Number(fd.get("tutarKurus"));
    const dosya = fd.get("dosya");
    if (!/^[A-Z0-9]{3}\d{13}$/.test(faturaNo)) alanlar.faturaNo = "Fatura no 16 karakter olmalı (ör. ANK2026000000412).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(faturaTarihi)) alanlar.faturaTarihi = "Fatura tarihini girin.";
    else if (faturaTarihi < islem.tarih.slice(0, 10)) alanlar.faturaTarihi = "Fatura tarihi işlem tarihinden önce olamaz.";
    if (tutarKurus !== islem.tutarKurus) alanlar.tutarKurus = `Fatura tutarı işlem tutarıyla (₺ ${(islem.tutarKurus / 100).toLocaleString("tr-TR")}) aynı olmalı.`;
    const ad = dosya && typeof dosya === "object" ? dosya.name : "";
    const uzanti = ad.split(".").pop().toLowerCase();
    if (!ad) alanlar.dosya = "Fatura dosyasını seçin.";
    else if (!DOSYA_TURLERI.includes(uzanti)) alanlar.dosya = "Uygun değil: yalnızca PDF, JPG ya da PNG yüklenebilir.";
    else if (dosya.size > EN_BUYUK_DOSYA) alanlar.dosya = "Uygun değil: dosya en fazla 5 MB olabilir.";
    if (Object.keys(alanlar).length) return kuralHatasi("SEKLEN_UYGUNSUZ", "Fatura şeklen uygun bulunmadı.", alanlar);

    const kayit = { islemNo, faturaNo, faturaTarihi, tutarKurus, dosyaAdi: ad, yukleme: simdi(), durum: "YUKLENDI" };
    depo.guncelle("faturalar", (l) => [kayit, ...l.filter((f) => f.islemNo !== islemNo)]);
    return HttpResponse.json(faturaCevabi(kayit, true), { status: 201 });
  }),

  http.post(uc("/faturalar/:islemNo/hatirlatma"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const islem = depo.tablo("islemler").find((t) => t.islemNo === params.islemNo);
    if (!islem || !kapsamda(kim, islem.cekimYapanId)) return hata(404, "ISLEM_YOK", "İşlem bulunamadı.");
    if (faturaDurumu(islem.islemNo).durum === "YUKLENDI") return hata(409, "FATURA_YUKLU", "Bu işlemin faturası zaten yüklü.");
    return HttpResponse.json({ gonderildi: true, firma: firmaOzeti(islem.cekimYapanId), kanal: "EPOSTA" });
  }),

  http.post(uc("/faturalar/:islemNo/yukleme-linki"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const islem = depo.tablo("islemler").find((t) => t.islemNo === params.islemNo);
    if (!islem || islem.cekimYapanId !== kim.firmaId) return hata(404, "ISLEM_YOK", "İşlem bulunamadı ya da size ait değil.");
    return HttpResponse.json({ url: `${FATURA_LINKI}${islem.islemNo.slice(4)}`, sonGecerlilik: new Date(Date.now() + 7 * 86400000).toISOString() });
  }),
];

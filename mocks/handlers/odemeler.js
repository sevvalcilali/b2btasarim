// GET /odeme/taksit-secenekleri · POST /odemeler · GET /tahsilat-carileri — şartname s.4, s.5, s.6, s.9
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { firmaOzeti, musteriCoz, odemeKosullari, simdi, tahsilatCarileri, taksitHesabi } from "../kurallar";
import { islemCevabi } from "./islemler";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

// Aynı Idempotency-Key ile gelen ikinci istek ilk cevabı alır (çift çekim olmaz)
const islenmis = new Map();

export const odemelerHandlers = [
  http.get(uc("/tahsilat-carileri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    return HttpResponse.json(tahsilatCarileri(kim));
  }),

  http.get(uc("/odeme/taksit-secenekleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const s = new URL(request.url).searchParams;
    const tutarKurus = Number(s.get("tutarKurus")) || 0;
    const { taksitler, limitKurus, profil } = odemeKosullari(kim, s.get("musteriTuru"), s.get("musteriCariNo"));
    return HttpResponse.json({
      vadeProfil: profil,
      limitKurus,
      taksitler,
      secenekler: taksitler.map((n) => taksitHesabi(tutarKurus, n, profil.oranYuzde)),
    });
  }),

  http.post(uc("/odemeler"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const anahtar = request.headers.get("idempotency-key");
    if (anahtar && islenmis.has(anahtar)) return HttpResponse.json(islenmis.get(anahtar), { status: 201 });
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");

    const alanlar = {};
    const { musteri, hata: musteriHatasi } = musteriCoz(kim, g);
    Object.assign(alanlar, musteriHatasi || {});
    const cariler = tahsilatCarileri(kim).kayitlar;
    const cari = cariler.find((c) => c.cariNo === g.tahsilatCariNo);
    if (!cari) alanlar.tahsilatCariNo = "Tahsilat carisi seçin.";
    const { taksitler, limitKurus, profil } = odemeKosullari(kim, g.musteriTuru, g.musteri?.cariNo);
    if (!(Number.isInteger(g.tutarKurus) && g.tutarKurus > 0)) alanlar.tutarKurus = "Tutar girin.";
    else if (limitKurus && g.tutarKurus > limitKurus) alanlar.tutarKurus = `İşlem bazlı ödeme limiti ₺ ${(limitKurus / 100).toLocaleString("tr-TR")}.`;
    if (!taksitler.includes(g.taksit)) alanlar.taksit = "Bu taksit seçeneği size açık değil.";
    if (!g.kart?.token) alanlar.kartNo = "Kart bilgisi alınamadı.";
    if (!String(g.kart?.isim || "").trim()) alanlar.kartIsmi = "Kart üzerindeki ismi girin.";
    const kendiKarti = g.musteriTuru === "KENDI_KARTI";
    if (!kendiKarti && g.faturaBeyani !== true) alanlar.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);

    // DEMO: son 4 hanesi 0002 olan kart banka tarafından reddedilir (başarısız akışı denemek için)
    const basarisiz = g.kart.son4 === "0002";
    const hesap = taksitHesabi(g.tutarKurus, g.taksit, profil.oranYuzde);
    const sira = Math.max(...depo.tablo("islemler").map((t) => Number(t.islemNo.replace(/\D/g, "")))) + 1;
    const islem = {
      islemNo: `TRX-${sira}`,
      tarih: simdi(),
      cekimYapanId: kim.firmaId,
      musteriTuru: g.musteriTuru,
      musteri: { unvan: musteri.unvan, cariNo: musteri.cariNo || "—", vergiNo: musteri.vergiNo || "—" },
      kartSon4: g.kart.son4,
      odemeTipi: "MANUEL",
      taksit: g.taksit,
      tutarKurus: g.tutarKurus,
      durum: basarisiz ? "BASARISIZ" : "BASARILI",
      aciklama: g.aciklama || null,
      tahsilatCariNo: cari.cariNo,
      kartIsmi: g.kart.isim,
    };
    depo.ekle("islemler", islem);
    const sonuc = {
      ...islemCevabi(islem),
      kart: { son4: g.kart.son4, isim: g.kart.isim },
      tahsilatCarisi: cari,
      vadeFarkiKurus: hesap.vadeFarkiKurus,
      toplamKurus: hesap.toplamKurus,
      aylikKurus: hesap.aylikKurus,
      vadeProfil: profil,
      // s.9: kendi kartı olmayan bayi / alt bayi işlemlerinde fatura yüklenmeli
      faturaGerekli: !basarisiz && !kendiKarti && kim.rol !== "ANA_FIRMA",
      redNedeni: basarisiz ? "Banka onay vermedi (demo: 0002 ile biten kart)." : null,
    };
    if (anahtar) islenmis.set(anahtar, sonuc);
    return HttpResponse.json(sonuc, { status: 201 });
  }),
];

export { firmaOzeti };

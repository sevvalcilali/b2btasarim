// GET/POST /odeme-linkleri — şartname s.6: müşteri seçimi manuel ödemeyle aynı yapıda
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { firmaOzeti, kapsamda, musteriCoz, odemeKosullari, simdi, tahsilatCarileri } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

const LINK_ADRESI = "https://link.nkolayislem.com.tr/b2b/";
const GECERLILIK_GUN = [1, 3, 7, 30];

export const linkCevabi = (l) => ({
  linkNo: l.linkNo,
  url: `${LINK_ADRESI}${l.linkNo.slice(4)}`,
  olusturma: l.olusturma,
  sonGecerlilik: l.sonGecerlilik,
  olusturan: firmaOzeti(l.olusturanId),
  musteriTuru: l.musteriTuru,
  musteriUnvan: l.musteriUnvan,
  tutarKurus: l.tutarKurus,
  kanal: l.kanal,
  hedef: l.hedef || null,
  taksitler: l.taksitler || null,
  tahsilatCarisi: l.tahsilatCarisi || null,
  durum: l.durum,
});

export const linklerHandlers = [
  http.get(uc("/odeme-linkleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const liste = depo
      .tablo("odemeLinkleri")
      .filter((l) => kapsamda(kim, l.olusturanId))
      .sort((a, b) => (a.olusturma < b.olusturma ? 1 : -1));
    return HttpResponse.json({ kayitlar: liste.map(linkCevabi), toplam: liste.length, sayfa: 1, boyut: Math.max(liste.length, 1) });
  }),

  http.post(uc("/odeme-linkleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");

    const alanlar = {};
    const { musteri, hata: musteriHatasi } = musteriCoz(kim, g);
    Object.assign(alanlar, musteriHatasi || {});
    const cari = tahsilatCarileri(kim).kayitlar.find((c) => c.cariNo === g.tahsilatCariNo);
    if (!cari) alanlar.tahsilatCariNo = "Tahsilat carisi seçin.";
    const { taksitler, limitKurus } = odemeKosullari(kim, g.musteriTuru, g.musteri?.cariNo);
    if (!(Number.isInteger(g.tutarKurus) && g.tutarKurus > 0)) alanlar.tutarKurus = "Tutar girin.";
    else if (limitKurus && g.tutarKurus > limitKurus) alanlar.tutarKurus = `İşlem bazlı ödeme limiti ₺ ${(limitKurus / 100).toLocaleString("tr-TR")}.`;
    if (!Array.isArray(g.taksitler) || g.taksitler.length === 0) alanlar.taksitler = "En az bir taksit seçeneği açık olmalı.";
    else if (g.taksitler.some((n) => !taksitler.includes(n))) alanlar.taksitler = "Yalnızca size açık taksitler verilebilir.";
    if (!["SMS", "EPOSTA", "LINK"].includes(g.kanal)) alanlar.kanal = "Gönderim kanalı seçin.";
    if (g.kanal === "SMS" && String(g.hedef || "").replace(/\D/g, "").length < 10) alanlar.hedef = "Linkin gönderileceği telefonu girin.";
    if (g.kanal === "EPOSTA" && !/^\S+@\S+\.\S+$/.test(g.hedef || "")) alanlar.hedef = "Linkin gönderileceği e-postayı girin.";
    if (!GECERLILIK_GUN.includes(g.gecerlilikGun)) alanlar.gecerlilikGun = "Geçerlilik süresi 1, 3, 7 ya da 30 gün olabilir.";
    if (g.musteriTuru !== "KENDI_KARTI" && g.faturaBeyani !== true) alanlar.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);

    const link = {
      linkNo: `LNK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      olusturma: simdi(),
      sonGecerlilik: new Date(Date.now() + g.gecerlilikGun * 86400000).toISOString(),
      olusturanId: kim.firmaId,
      uyeIsyeriCariNo: kim.aktifUyeIsyeri || null,
      musteriTuru: g.musteriTuru,
      musteriUnvan: musteri.unvan,
      tutarKurus: g.tutarKurus,
      kanal: g.kanal,
      hedef: g.kanal === "LINK" ? null : g.hedef,
      taksitler: [...g.taksitler].sort((a, b) => a - b),
      tahsilatCarisi: cari,
      aciklama: g.aciklama || null,
      durum: "BEKLIYOR",
    };
    depo.ekle("odemeLinkleri", link);
    return HttpResponse.json(linkCevabi(link), { status: 201 });
  }),
];

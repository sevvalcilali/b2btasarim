// GET /panel/ozet · /panel/haftalik-hacim · /panel/bakiye
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { gecikme, uc, yetkili } from "./yardimci";

const KALEMLER = ["TOPLAM", "BASARILI", "BASARISIZ", "IPTAL", "IADE"];

export const panelHandlers = [
  http.get(uc("/panel/ozet"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const donem = new URL(request.url).searchParams.get("donem") || "bugun";
    const ozet = depo.tablo("panelOzetleri")[kim.firmaId];
    if (!ozet) return HttpResponse.json({ donem, kalemler: Object.fromEntries(KALEMLER.map((k) => [k, { adet: 0, tutarKurus: 0, degisimYuzde: 0 }])), basariOraniYuzde: 0, ortalamaIslemKurus: 0, seriler: {} });
    const kalemler = Object.fromEntries(KALEMLER.map((k) => [k, { adet: 0, tutarKurus: 0, degisimYuzde: 0, ...ozet.bugun[k] }]));
    const toplam = kalemler.TOPLAM;
    return HttpResponse.json({
      donem,
      kalemler,
      basariOraniYuzde: toplam.adet ? Math.round((kalemler.BASARILI.adet / toplam.adet) * 1000) / 10 : 0,
      ortalamaIslemKurus: toplam.adet ? Math.round(toplam.tutarKurus / toplam.adet) : 0,
      seriler: ozet.seriler || {},
    });
  }),

  http.get(uc("/panel/haftalik-hacim"), async ({ request }) => {
    await gecikme();
    const { cevap } = yetkili(request);
    if (cevap) return cevap;
    const gunler = depo.tablo("haftalikHacim");
    return HttpResponse.json({
      gunler,
      toplamKurus: gunler.reduce((a, g) => a + g.tutarKurus, 0),
      degisimYuzde: 12.4, // geçen haftaya göre — örnek veri
    });
  }),

  // Şartname s.2: bayi "Ana Firma Bakiye ve Borç", alt bayi "Bayi Bakiye ve Borç" görür; ana firma kendi limitini
  http.get(uc("/panel/bakiye"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const b = depo.tablo("bakiyeler")[kim.firmaId] || { bakiyeKurus: 0, borcKurus: 0, limitKurus: 0, kullanimYuzde: 0 };
    return HttpResponse.json({ ...b, gorunum: kim.rol === "ANA_FIRMA" ? "FIRMA_LIMITI" : "UST_CARI" });
  }),
];

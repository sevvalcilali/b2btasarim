// GET /oturum · POST /demo/sifirla
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { anaFirma, firma } from "../kurallar";
import { gecikme, uc, yetkili } from "./yardimci";

// Şartname s.3: yetki → açılan ekranlar
const YETKILER = {
  YONETICI: ["ODEME", "RAPOR", "IPTAL_IADE_GIRIS", "IPTAL_IADE_ONAY", "BAYI_TANIM", "KULLANICI_TANIM", "AYARLAR"],
  ODEME: ["ODEME", "RAPOR", "IPTAL_IADE_GIRIS"],
  RAPORLAMA: ["RAPOR"],
};

export const oturumHandlers = [
  http.get(uc("/oturum"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const f = firma(kim.firmaId);
    const ana = anaFirma();
    const bagli = f.bagliFirmaId ? firma(f.bagliFirmaId) : null;
    return HttpResponse.json({
      kullanici: { kullaniciId: kim.kullaniciId, adSoyad: kim.adSoyad, email: kim.email, yetki: kim.yetki },
      rol: kim.rol,
      firma: {
        firmaId: f.firmaId,
        unvan: f.unvan,
        tur: f.tur,
        cariNo: f.cariNo,
        vergiNo: f.vergiNo,
        logoRenk: f.logoRenk || null,
        bagli: bagli ? { firmaId: bagli.firmaId, unvan: bagli.unvan, tur: bagli.tur } : null,
      },
      anaFirma: { firmaId: ana.firmaId, unvan: ana.unvan, kisaAd: ana.kisaAd, aciklama: ana.aciklama, logoRenk: ana.logoRenk || null },
      yetkiler: YETKILER[kim.yetki] || [],
    });
  }),

  // Yalnızca sahte backend'de vardır; gerçek backend'de karşılığı yoktur.
  http.post(uc("/demo/sifirla"), async () => {
    await gecikme();
    depo.sifirla();
    return new HttpResponse(null, { status: 204 });
  }),
];

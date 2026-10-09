// GET /oturum · PUT /oturum/aktif-uye-isyeri · POST /demo/sifirla
import { http, HttpResponse } from "msw";
import { depo } from "../db/store";
import { YETKI_EKRANLARI, anaFirma, firma } from "../rules";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./helpers";

/** Üye işyeri özeti: tahsilatın işleneceği ana firma carisi (şartname s.1: ana firma altında birden çok üye işyeri) */
const uyeIsyeriOzeti = (cariNo) => {
  const u = depo.tablo("uyeIsyerleri").find((x) => x.cariNo === cariNo);
  return u ? { cariNo: u.cariNo, ad: u.ad } : null;
};
const tokenOku = (request) => (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();

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
      yetkiler: YETKI_EKRANLARI[kim.yetki] || [],
      aktifUyeIsyeri: uyeIsyeriOzeti(kim.aktifUyeIsyeri),
    });
  }),

  // Cari seçimi (bayi: Ana Firma Cari Seçimi, alt bayi: Bayi Carisi Seçimi): sonraki ödemeler bu üye işyerine işlenir
  http.put(uc("/oturum/aktif-uye-isyeri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const acik = kim.rol === "ANA_FIRMA" ? depo.tablo("uyeIsyerleri").map((u) => u.cariNo) : firma(kim.firmaId)?.uyeIsyerleri || [];
    if (!acik.includes(g.cariNo)) return kuralHatasi("CARI_KAPALI", "Bu üye işyeri size açık değil.", { cariNo: "Yalnızca size açık üye işyerleri seçilebilir." });
    depo.guncelle("oturumlar", (o) => ({ ...o, [tokenOku(request)]: { ...kim, aktifUyeIsyeri: g.cariNo } }));
    return HttpResponse.json(uyeIsyeriOzeti(g.cariNo));
  }),

  // Yalnızca sahte backend'de vardır; gerçek backend'de karşılığı yoktur.
  http.post(uc("/demo/sifirla"), async () => {
    await gecikme();
    depo.sifirla();
    return new HttpResponse(null, { status: 204 });
  }),
];

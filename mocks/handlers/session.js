// GET /oturum · PUT /oturum/aktif-uye-isyeri · POST /demo/sifirla
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { PERMISSION_SCREENS, mainCompany, company } from "../rules";
import { latency, error, ruleError, uc, authorized } from "./helpers";

/** Üye işyeri özeti: tahsilatın işleneceği ana firma carisi (şartname s.1: ana firma altında birden çok üye işyeri) */
const merchantSummary = (accountNo) => {
  const u = store.table("merchants").find((x) => x.cariNo === accountNo);
  return u ? { cariNo: u.cariNo, ad: u.ad } : null;
};
const readToken = (request) => (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();

export const sessionHandlers = [
  http.get(uc("/oturum"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const f = company(caller.firmaId);
    const main = mainCompany();
    const linked = f.bagliFirmaId ? company(f.bagliFirmaId) : null;
    return HttpResponse.json({
      kullanici: { kullaniciId: caller.kullaniciId, adSoyad: caller.adSoyad, email: caller.email, yetki: caller.yetki },
      rol: caller.rol,
      firma: {
        firmaId: f.firmaId,
        unvan: f.unvan,
        tur: f.tur,
        cariNo: f.cariNo,
        vergiNo: f.vergiNo,
        logoRenk: f.logoRenk || null,
        bagli: linked ? { firmaId: linked.firmaId, unvan: linked.unvan, tur: linked.tur } : null,
      },
      anaFirma: { firmaId: main.firmaId, unvan: main.unvan, kisaAd: main.kisaAd, aciklama: main.aciklama, logoRenk: main.logoRenk || null },
      yetkiler: PERMISSION_SCREENS[caller.yetki] || [],
      aktifUyeIsyeri: merchantSummary(caller.aktifUyeIsyeri),
    });
  }),

  // Cari seçimi (bayi: Ana Firma Cari Seçimi, alt bayi: Bayi Carisi Seçimi): sonraki ödemeler bu üye işyerine işlenir
  http.put(uc("/oturum/aktif-uye-isyeri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const open = caller.rol === "ANA_FIRMA" ? store.table("merchants").map((u) => u.cariNo) : company(caller.firmaId)?.uyeIsyerleri || [];
    if (!open.includes(g.cariNo)) return ruleError("CARI_KAPALI", "Bu üye işyeri size açık değil.", { cariNo: "Yalnızca size açık üye işyerleri seçilebilir." });
    store.update("sessions", (o) => ({ ...o, [readToken(request)]: { ...caller, aktifUyeIsyeri: g.cariNo } }));
    return HttpResponse.json(merchantSummary(g.cariNo));
  }),

  // Yalnızca sahte backend'de vardır; gerçek backend'de karşılığı yoktur.
  http.post(uc("/demo/sifirla"), async () => {
    await latency();
    store.reset();
    return new HttpResponse(null, { status: 204 });
  }),
];

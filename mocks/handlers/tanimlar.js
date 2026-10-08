// GET /vade-farki-profilleri · GET /uye-isyerleri
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { firma } from "../kurallar";
import { gecikme, uc, yetkili } from "./yardimci";

export const tanimlarHandlers = [
  http.get(uc("/vade-farki-profilleri"), async ({ request }) => {
    await gecikme();
    const { cevap } = yetkili(request);
    if (cevap) return cevap;
    return HttpResponse.json({ kayitlar: depo.tablo("vadeFarkiProfilleri") });
  }),

  // Bayi / alt bayi yalnızca kendisine açılan üye işyerlerini görür (şartname s.5)
  http.get(uc("/uye-isyerleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const hepsi = depo.tablo("uyeIsyerleri");
    const acik = kim.rol === "ANA_FIRMA" ? null : firma(kim.firmaId)?.uyeIsyerleri || [];
    return HttpResponse.json({ kayitlar: hepsi.filter((u) => !acik || acik.includes(u.cariNo)) });
  }),
];

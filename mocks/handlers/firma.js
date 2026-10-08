// GET /firma — oturum firmasının kendi kaydı
import { http, HttpResponse } from "msw";
import { firma, firmaCevabi } from "../kurallar";
import { gecikme, hata, uc, yetkili } from "./yardimci";

export const firmaHandlers = [
  http.get(uc("/firma"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const f = firma(kim.firmaId);
    return f ? HttpResponse.json(firmaCevabi(f)) : hata(404, "FIRMA_YOK", "Firma kaydı bulunamadı.");
  }),
];

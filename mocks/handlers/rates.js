// GET /kurlar — gösterge kurları (şartname s.2: USD / Euro Kur Bilgisi). Kaynak ve sıklık backend'de.
import { http, HttpResponse } from "msw";
import { depo } from "../db/store";
import { simdi } from "../rules";
import { gecikme, uc, yetkili } from "./helpers";

export const kurlarHandlers = [
  http.get(uc("/kurlar"), async ({ request }) => {
    await gecikme();
    const { cevap } = yetkili(request);
    if (cevap) return cevap;
    return HttpResponse.json({ kayitlar: depo.tablo("kurlar"), guncelleme: simdi(Date.now() - 20 * 60000), kaynak: "TCMB gösterge" });
  }),
];

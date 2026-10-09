// GET /kurlar — gösterge kurları (şartname s.2: USD / Euro Kur Bilgisi). Kaynak ve sıklık backend'de.
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { now } from "../rules";
import { latency, uc, authorized } from "./helpers";

export const ratesHandlers = [
  http.get(uc("/kurlar"), async ({ request }) => {
    await latency();
    const { cevap: response } = authorized(request);
    if (response) return response;
    return HttpResponse.json({ kayitlar: store.table("rates"), guncelleme: now(Date.now() - 20 * 60000), kaynak: "TCMB gösterge" });
  }),
];

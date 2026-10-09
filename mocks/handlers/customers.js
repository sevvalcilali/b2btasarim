// GET/POST /musteriler — oturum firmasının tanımlı (düzenli) müşterileri
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { includes, authErrors } from "../rules";
import { latency, error, ruleError, uc, authorized } from "./helpers";

export const customerResponse = (m) => ({ musteriId: m.musteriId, unvan: m.unvan, cariNo: m.cariNo, vergiNo: m.vergiNo, telefon: m.telefon, email: m.email, adres: m.adres || null, durum: m.durum });

export const customersHandlers = [
  http.get(uc("/musteriler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const q = (new URL(request.url).searchParams.get("q") || "").trim();
    const list = store
      .table("customers")
      .filter((m) => m.sahipFirmaId === caller.firmaId && m.durum !== "PASIF" && (!q || [m.unvan, m.cariNo, m.vergiNo].some((x) => includes(x, q))));
    return HttpResponse.json({ kayitlar: list.map(customerResponse), toplam: list.length, sayfa: 1, boyut: Math.max(list.length, 1) });
  }),

  http.post(uc("/musteriler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const fields = authErrors(g);
    if (fields.cariNo?.includes("başka bir kayıtta")) return error(409, "CARI_CAKISMASI", fields.cariNo, { cariNo: fields.cariNo });
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const n = store.table("customers").length + 1;
    const draft = {
      musteriId: `M-${String(n).padStart(3, "0")}`,
      sahipFirmaId: caller.firmaId,
      unvan: String(g.unvan).trim(),
      cariNo: g.cariNo,
      vergiNo: String(g.vergiNo).replace(/\D/g, ""),
      telefon: String(g.telefon).trim(),
      email: String(g.email).trim(),
      adres: String(g.adres || "").trim(),
      durum: "AKTIF",
    };
    store.update("customers", (l) => [...l, draft]);
    return HttpResponse.json(customerResponse(draft), { status: 201 });
  }),
];

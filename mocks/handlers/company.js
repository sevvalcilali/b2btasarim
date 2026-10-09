// GET /firma — oturum firmasının kendi kaydı · PUT /firma/iletisim — bayi / alt bayi kendi iletişim bilgisi (şartname s.10)
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { audit, company, companyResponse } from "../rules";
import { latency, error, ruleError, uc, authorized } from "./helpers";

export const companyHandlers = [
  http.get(uc("/firma"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const f = company(caller.firmaId);
    return f ? HttpResponse.json(companyResponse(f)) : error(404, "FIRMA_YOK", "Firma kaydı bulunamadı.");
  }),

  // Yalnız telefon / e-posta / adres; unvan, cari ve vergi no ile ödeme koşullarını üst firma tanımlar
  http.put(uc("/firma/iletisim"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    if (caller.rol === "ANA_FIRMA") return error(403, "YETKI_YOK", "Ana firma bilgileri klasik panelden yönetilir.");
    if (caller.yetki !== "YONETICI") return error(403, "YETKI_YOK", "Firma bilgilerini yalnız Yönetici günceller.");
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const contact = { telefon: String(g.telefon ?? "").trim(), email: String(g.email ?? "").trim(), adres: String(g.adres ?? "").trim() };
    const fields = {};
    if (contact.telefon.replace(/\D/g, "").length < 10) fields.telefon = "Geçerli bir telefon girin.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) fields.email = "Geçerli bir e-posta girin.";
    if (!contact.adres) fields.adres = "Adres girin.";
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);
    const current = store.replace("companies", "firmaId", caller.firmaId, (f) => ({ ...f, ...contact, sonDegisiklik: audit(caller) }));
    return current ? HttpResponse.json(companyResponse(current)) : error(404, "FIRMA_YOK", "Firma kaydı bulunamadı.");
  }),
];

// GET /firma — oturum firmasının kendi kaydı · PUT /firma/iletisim — bayi / alt bayi kendi iletişim bilgisi (şartname s.10)
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { denetim, firma, firmaCevabi } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

export const firmaHandlers = [
  http.get(uc("/firma"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const f = firma(kim.firmaId);
    return f ? HttpResponse.json(firmaCevabi(f)) : hata(404, "FIRMA_YOK", "Firma kaydı bulunamadı.");
  }),

  // Yalnız telefon / e-posta / adres; unvan, cari ve vergi no ile ödeme koşullarını üst firma tanımlar
  http.put(uc("/firma/iletisim"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (kim.rol === "ANA_FIRMA") return hata(403, "YETKI_YOK", "Ana firma bilgileri klasik panelden yönetilir.");
    if (kim.yetki !== "YONETICI") return hata(403, "YETKI_YOK", "Firma bilgilerini yalnız Yönetici günceller.");
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const iletisim = { telefon: String(g.telefon ?? "").trim(), email: String(g.email ?? "").trim(), adres: String(g.adres ?? "").trim() };
    const alanlar = {};
    if (iletisim.telefon.replace(/\D/g, "").length < 10) alanlar.telefon = "Geçerli bir telefon girin.";
    if (!/^\S+@\S+\.\S+$/.test(iletisim.email)) alanlar.email = "Geçerli bir e-posta girin.";
    if (!iletisim.adres) alanlar.adres = "Adres girin.";
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const guncel = depo.degistir("firmalar", "firmaId", kim.firmaId, (f) => ({ ...f, ...iletisim, sonDegisiklik: denetim(kim) }));
    return guncel ? HttpResponse.json(firmaCevabi(guncel)) : hata(404, "FIRMA_YOK", "Firma kaydı bulunamadı.");
  }),
];

// GET/POST /odeme-linkleri — şartname s.6: müşteri seçimi manuel ödemeyle aynı yapıda
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { companySummary, inScope, resolveCustomer, paymentTerms, now, collectionAccounts } from "../rules";
import { latency, error, ruleError, uc, authorized } from "./helpers";

const LINK_URL = "https://link.nkolayislem.com.tr/b2b/";
const VALIDITY_DAYS = [1, 3, 7, 30];

export const linkResponse = (l) => ({
  linkNo: l.linkNo,
  url: `${LINK_URL}${l.linkNo.slice(4)}`,
  olusturma: l.olusturma,
  sonGecerlilik: l.sonGecerlilik,
  olusturan: companySummary(l.olusturanId),
  musteriTuru: l.musteriTuru,
  musteriUnvan: l.musteriUnvan,
  tutarKurus: l.tutarKurus,
  kanal: l.kanal,
  hedef: l.hedef || null,
  taksitler: l.taksitler || null,
  tahsilatCarisi: l.tahsilatCarisi || null,
  uyeIsyeriCariNo: l.uyeIsyeriCariNo ?? null,
  durum: l.durum,
});

export const linksHandlers = [
  http.get(uc("/odeme-linkleri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const list = store
      .table("paymentLinks")
      .filter((l) => inScope(caller, l.olusturanId))
      .sort((a, b) => (a.olusturma < b.olusturma ? 1 : -1));
    return HttpResponse.json({ kayitlar: list.map(linkResponse), toplam: list.length, sayfa: 1, boyut: Math.max(list.length, 1) });
  }),

  http.post(uc("/odeme-linkleri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");

    const fields = {};
    const { musteri: customer, hata: customerError } = resolveCustomer(caller, g);
    Object.assign(fields, customerError || {});
    const account = collectionAccounts(caller).kayitlar.find((c) => c.cariNo === g.tahsilatCariNo);
    if (!account) fields.tahsilatCariNo = "Tahsilat carisi seçin.";
    const { taksitler: installments, limitKurus: limitCents } = paymentTerms(caller, g.musteriTuru, g.musteri?.cariNo);
    if (!(Number.isInteger(g.tutarKurus) && g.tutarKurus > 0)) fields.tutarKurus = "Tutar girin.";
    else if (limitCents && g.tutarKurus > limitCents) fields.tutarKurus = `İşlem bazlı ödeme limiti ₺ ${(limitCents / 100).toLocaleString("tr-TR")}.`;
    if (!Array.isArray(g.taksitler) || g.taksitler.length === 0) fields.taksitler = "En az bir taksit seçeneği açık olmalı.";
    else if (g.taksitler.some((n) => !installments.includes(n))) fields.taksitler = "Yalnızca size açık taksitler verilebilir.";
    if (!["SMS", "EPOSTA", "LINK"].includes(g.kanal)) fields.kanal = "Gönderim kanalı seçin.";
    if (g.kanal === "SMS" && String(g.hedef || "").replace(/\D/g, "").length < 10) fields.hedef = "Linkin gönderileceği telefonu girin.";
    if (g.kanal === "EPOSTA" && !/^\S+@\S+\.\S+$/.test(g.hedef || "")) fields.hedef = "Linkin gönderileceği e-postayı girin.";
    if (!VALIDITY_DAYS.includes(g.gecerlilikGun)) fields.gecerlilikGun = "Geçerlilik süresi 1, 3, 7 ya da 30 gün olabilir.";
    if (g.musteriTuru !== "KENDI_KARTI" && g.faturaBeyani !== true) fields.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);

    const link = {
      linkNo: `LNK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      olusturma: now(),
      sonGecerlilik: now(Date.now() + g.gecerlilikGun * 86400000),
      olusturanId: caller.firmaId,
      uyeIsyeriCariNo: caller.aktifUyeIsyeri || null,
      musteriTuru: g.musteriTuru,
      musteriUnvan: customer.unvan,
      tutarKurus: g.tutarKurus,
      kanal: g.kanal,
      hedef: g.kanal === "LINK" ? null : g.hedef,
      taksitler: [...g.taksitler].sort((a, b) => a - b),
      tahsilatCarisi: account,
      aciklama: g.aciklama || null,
      durum: "BEKLIYOR",
    };
    store.insert("paymentLinks", link);
    return HttpResponse.json(linkResponse(link), { status: 201 });
  }),
];

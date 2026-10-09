// GET /odeme/taksit-secenekleri · POST /odemeler · GET /tahsilat-carileri — şartname s.4, s.5, s.6, s.9
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { companySummary, resolveCustomer, paymentTerms, now, collectionAccounts, installmentCalc } from "../rules";
import { transactionResponse } from "./transactions";
import { latency, error, ruleError, uc, authorized } from "./helpers";

// Aynı Idempotency-Key ile gelen ikinci istek ilk cevabı alır (çift çekim olmaz)
const processed = new Map();

export const paymentsHandlers = [
  http.get(uc("/tahsilat-carileri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    return HttpResponse.json(collectionAccounts(caller));
  }),

  http.get(uc("/odeme/taksit-secenekleri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const s = new URL(request.url).searchParams;
    const amountCents = Number(s.get("tutarKurus")) || 0;
    const { taksitler: installments, limitKurus: limitCents, profil: profile } = paymentTerms(caller, s.get("musteriTuru"), s.get("musteriCariNo"));
    return HttpResponse.json({
      vadeProfil: profile,
      limitKurus: limitCents,
      taksitler: installments,
      secenekler: installments.map((n) => installmentCalc(amountCents, n, profile.oranYuzde)),
    });
  }),

  http.post(uc("/odemeler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const key = request.headers.get("idempotency-key");
    if (key && processed.has(key)) return HttpResponse.json(processed.get(key), { status: 201 });
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");

    const fields = {};
    const { musteri: customer, hata: customerError } = resolveCustomer(caller, g);
    Object.assign(fields, customerError || {});
    const accounts = collectionAccounts(caller).kayitlar;
    const account = accounts.find((c) => c.cariNo === g.tahsilatCariNo);
    if (!account) fields.tahsilatCariNo = "Tahsilat carisi seçin.";
    const { taksitler: installments, limitKurus: limitCents, profil: profile } = paymentTerms(caller, g.musteriTuru, g.musteri?.cariNo);
    if (!(Number.isInteger(g.tutarKurus) && g.tutarKurus > 0)) fields.tutarKurus = "Tutar girin.";
    else if (limitCents && g.tutarKurus > limitCents) fields.tutarKurus = `İşlem bazlı ödeme limiti ₺ ${(limitCents / 100).toLocaleString("tr-TR")}.`;
    if (!installments.includes(g.taksit)) fields.taksit = "Bu taksit seçeneği size açık değil.";
    if (!g.kart?.token) fields.kartNo = "Kart bilgisi alınamadı.";
    if (!String(g.kart?.isim || "").trim()) fields.kartIsmi = "Kart üzerindeki ismi girin.";
    const ownCard = g.musteriTuru === "KENDI_KARTI";
    if (!ownCard && g.faturaBeyani !== true) fields.faturaBeyani = "Müşteri kartıyla ödemede beyanı onaylayın.";
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);

    // DEMO: son 4 hanesi 0002 olan kart banka tarafından reddedilir (başarısız akışı denemek için)
    const failed = g.kart.son4 === "0002";
    const calc = installmentCalc(g.tutarKurus, g.taksit, profile.oranYuzde);
    const order = Math.max(...store.table("transactions").map((t) => Number(t.islemNo.replace(/\D/g, "")))) + 1;
    const transaction = {
      islemNo: `TRX-${order}`,
      tarih: now(),
      cekimYapanId: caller.firmaId,
      musteriTuru: g.musteriTuru,
      musteri: { unvan: customer.unvan, cariNo: customer.cariNo || "—", vergiNo: customer.vergiNo || "—" },
      kartSon4: g.kart.son4,
      odemeTipi: "MANUEL",
      taksit: g.taksit,
      tutarKurus: g.tutarKurus,
      durum: failed ? "BASARISIZ" : "BASARILI",
      aciklama: g.aciklama || null,
      tahsilatCariNo: account.cariNo,
      uyeIsyeriCariNo: caller.aktifUyeIsyeri || null, // oturumda seçili cari (şartname s.1)
      kartIsmi: g.kart.isim,
    };
    store.insert("transactions", transaction);
    const result = {
      ...transactionResponse(transaction),
      kart: { son4: g.kart.son4, isim: g.kart.isim },
      tahsilatCarisi: account,
      vadeFarkiKurus: calc.vadeFarkiKurus,
      toplamKurus: calc.toplamKurus,
      aylikKurus: calc.aylikKurus,
      vadeProfil: profile,
      // s.9: kendi kartı olmayan bayi / alt bayi işlemlerinde fatura yüklenmeli
      faturaGerekli: !failed && !ownCard && caller.rol !== "ANA_FIRMA",
      redNedeni: failed ? "Banka onay vermedi (demo: 0002 ile biten kart)." : null,
    };
    if (key) processed.set(key, result);
    return HttpResponse.json(result, { status: 201 });
  }),
];

export { companySummary };

// /iptal-iade-talepleri — şartname s.8 (onay zinciri) ve s.7 (takip raporu)
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { subDealersOf, inScope, awaitingMyApproval, now, requestResponse } from "../rules";
import { latency, error, ruleError, uc, authorized } from "./helpers";

const scopedRequests = (caller) =>
  store
    .table("cancelRefundRequests")
    .filter((t) => inScope(caller, t.girenId))
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));

// Görünüm süzgeçleri — rolün sekmeleri bunlardan oluşur
const VIEWS = {
  TUMU: () => true,
  ONAYIMDA: (t, caller) => awaitingMyApproval(caller, t),
  UST_ONAYA_ILETILEN: (t) => t.durum === "ANA_FIRMA_ONAYINDA",
  ONAY_BEKLEYEN: (t) => t.durum === "BAYI_ONAYINDA" || t.durum === "ANA_FIRMA_ONAYINDA",
  ONAYLANDI: (t) => t.durum === "ONAYLANDI",
  REDDEDILDI: (t) => t.durum === "REDDEDILDI",
};

/** Talep girilebilecek işlemler: kendi başarılı çekimleri, açık / onaylı talebi olmayanlar */
export const eligibleTransactions = (caller) => {
  const requests = store.table("cancelRefundRequests");
  return store
    .table("transactions")
    .filter((t) => t.cekimYapanId === caller.firmaId && t.durum === "BASARILI" && !requests.some((x) => x.islemNo === t.islemNo && x.durum !== "REDDEDILDI"))
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));
};

export const requestsHandlers = [
  http.get(uc("/iptal-iade-talepleri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const view = new URL(request.url).searchParams.get("gorunum") || "TUMU";
    const source = scopedRequests(caller);
    const filter = VIEWS[view] || VIEWS.TUMU;
    const list = source.filter((t) => filter(t, caller));
    return HttpResponse.json({
      kayitlar: list.map((t) => requestResponse(t, caller)),
      toplam: list.length,
      sayfa: 1,
      boyut: Math.max(list.length, 1),
      sayaclar: Object.fromEntries(Object.entries(VIEWS).map(([k, f]) => [k, source.filter((t) => f(t, caller)).length])),
    });
  }),

  http.get(uc("/iptal-iade-talepleri/uygun-islemler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const list = eligibleTransactions(caller).map((t) => ({ islemNo: t.islemNo, tarih: t.tarih, musteriUnvan: t.musteri.unvan, tutarKurus: t.tutarKurus }));
    return HttpResponse.json({ kayitlar: list });
  }),

  http.post(uc("/iptal-iade-talepleri"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const g = await request.json().catch(() => null);
    if (!g) return error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const transaction = eligibleTransactions(caller).find((t) => t.islemNo === g.islemNo);
    const fields = {};
    if (!transaction) fields.islemNo = "Talep girilebilecek bir işlem seçin.";
    if (!["IADE", "IPTAL"].includes(g.tur)) fields.tur = "Talep türü İADE ya da İPTAL olmalı.";
    const amount = g.tur === "IPTAL" && transaction ? transaction.tutarKurus : g.tutarKurus;
    if (transaction && !(Number.isInteger(amount) && amount > 0 && amount <= transaction.tutarKurus)) fields.tutarKurus = `0 ile ₺ ${(transaction.tutarKurus / 100).toLocaleString("tr-TR")} arasında bir tutar girin.`;
    if (!String(g.aciklama || "").trim()) fields.aciklama = "Açıklama girin.";
    if (Object.keys(fields).length) return ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields);

    const isMainCompany = caller.rol === "ANA_FIRMA";
    const status = isMainCompany ? "ONAYLANDI" : caller.rol === "BAYI" ? "ANA_FIRMA_ONAYINDA" : "BAYI_ONAYINDA";
    const no = Math.max(...store.table("cancelRefundRequests").map((t) => Number(t.talepNo.replace(/\D/g, "")))) + 1;
    const requestRecord = {
      talepNo: `TLP-${no}`,
      tarih: now(),
      islemNo: transaction.islemNo,
      girenId: caller.firmaId,
      tur: g.tur,
      tutarKurus: amount,
      aciklama: String(g.aciklama).trim(),
      durum: status,
      gecmis: [{ tarih: now(), firmaId: caller.firmaId, olay: "TALEP_GIRILDI", not: isMainCompany ? "Ana firma girişi, onay gerekmedi" : undefined }],
    };
    store.insert("cancelRefundRequests", requestRecord);
    // ana firmanın kendi talebi anında sonuçlanır: işlem durumu da değişir
    if (isMainCompany) store.replace("transactions", "islemNo", transaction.islemNo, (t) => ({ ...t, durum: g.tur }));
    return HttpResponse.json(requestResponse(requestRecord, caller), { status: 201 });
  }),

  http.post(uc("/iptal-iade-talepleri/:talepNo/onay"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const t = store.table("cancelRefundRequests").find((x) => x.talepNo === params.talepNo);
    if (!t || !inScope(caller, t.girenId)) return error(404, "TALEP_YOK", "Talep bulunamadı.");
    if (!awaitingMyApproval(caller, t)) return error(403, "YETKI_YOK", "Bu talep sizin onayınızda değil.");
    const isDealer = caller.rol === "BAYI";
    const current = store.replace("cancelRefundRequests", "talepNo", t.talepNo, (x) => ({
      ...x,
      durum: isDealer ? "ANA_FIRMA_ONAYINDA" : "ONAYLANDI",
      gecmis: [...x.gecmis, { tarih: now(), firmaId: caller.firmaId, olay: isDealer ? "ONAYLADI_ILETTI" : "ONAYLADI" }],
    }));
    if (!isDealer) store.replace("transactions", "islemNo", t.islemNo, (x) => ({ ...x, durum: t.tur }));
    return HttpResponse.json({ ...requestResponse(current, caller), bildirim: isDealer ? "Talep onaylandı ve ana firma onayına iletildi." : "Talep onaylandı; talebi giren firma e-posta ile bilgilendirildi." });
  }),

  http.post(uc("/iptal-iade-talepleri/:talepNo/red"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const t = store.table("cancelRefundRequests").find((x) => x.talepNo === params.talepNo);
    if (!t || !inScope(caller, t.girenId)) return error(404, "TALEP_YOK", "Talep bulunamadı.");
    if (!awaitingMyApproval(caller, t)) return error(403, "YETKI_YOK", "Bu talep sizin onayınızda değil.");
    const g = await request.json().catch(() => ({}));
    const reason = String(g?.gerekce || "").trim();
    if (!reason) return ruleError("DOGRULAMA", "Gerekçe girin.", { gerekce: "Gerekçe girin; talebi girene e-posta ile iletilir." });
    const current = store.replace("cancelRefundRequests", "talepNo", t.talepNo, (x) => ({
      ...x,
      durum: "REDDEDILDI",
      gecmis: [...x.gecmis, { tarih: now(), firmaId: caller.firmaId, olay: "REDDETTI", not: reason }],
    }));
    return HttpResponse.json({ ...requestResponse(current, caller), bildirim: "Talep reddedildi; talebi giren firma e-posta ile bilgilendirildi." });
  }),
];

export { subDealersOf };

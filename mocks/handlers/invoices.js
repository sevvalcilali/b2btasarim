// /faturalar — şartname s.9 (fatura yükleme, şeklen kontrol, gizlilik) ve s.10 (link üzerinden yükleme)
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { invoiceStatus, invoiceRequired, companySummary, inScope, now } from "../rules";
import { transactionResponse } from "./transactions";
import { latency, error, ruleError, uc, authorized } from "./helpers";

const INVOICE_LINK = "https://link.nkolayislem.com.tr/fatura/";
const FILE_KINDS = ["pdf", "jpg", "jpeg", "png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Fatura kaydı; içerik yalnızca yükleyen firmaya döner (s.9: bayi ve ana firmaya fatura gösterilmez) */
function invoiceResponse(record, own) {
  if (!record) return null;
  const shared = { durum: record.durum, yukleme: record.yukleme, redNedeni: record.redNedeni || null };
  return own ? { ...shared, faturaNo: record.faturaNo, faturaTarihi: record.faturaTarihi, tutarKurus: record.tutarKurus, dosyaAdi: record.dosyaAdi } : { ...shared, icerikGizli: true };
}

const row = (transaction, caller) => {
  const { kayit: record, durum: status } = invoiceStatus(transaction.islemNo);
  const own = transaction.cekimYapanId === caller.firmaId;
  return { islem: transactionResponse(transaction), fatura: invoiceResponse(record, own), durum: status, kendi: own };
};

const STATUS_FILTER = { YUKLENMEMIS: (d) => d !== "YUKLENDI", YUKLENEN: (d) => d === "YUKLENDI", TUMU: () => true };

export const invoicesHandlers = [
  http.get(uc("/faturalar"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const status = new URL(request.url).searchParams.get("durum") || "YUKLENMEMIS";
    const all = store
      .table("transactions")
      .filter((t) => inScope(caller, t.cekimYapanId) && invoiceRequired(t))
      .sort((a, b) => (a.tarih < b.tarih ? 1 : -1))
      .map((t) => row(t, caller));
    const list = all.filter((s) => (STATUS_FILTER[status] || STATUS_FILTER.TUMU)(s.durum));
    const pending = all.filter((s) => s.durum !== "YUKLENDI");
    return HttpResponse.json({
      kayitlar: list,
      toplam: list.length,
      sayfa: 1,
      boyut: Math.max(list.length, 1),
      sayaclar: { YUKLENMEMIS: pending.length, YUKLENEN: all.length - pending.length, TUMU: all.length },
      ozet: {
        bekleyen: pending.length,
        bekleyenKurus: pending.reduce((a, s) => a + s.islem.tutarKurus, 0),
        yuklenen: all.length - pending.length,
        kendiBekleyen: pending.filter((s) => s.kendi).length,
      },
    });
  }),

  // multipart/form-data: islemNo, faturaNo, faturaTarihi (YYYY-AA-GG), tutarKurus, dosya
  http.post(uc("/faturalar"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const fd = await request.formData().catch(() => null);
    if (!fd) return error(400, "GECERSIZ_GOVDE", "Form verisi okunamadı.");
    const transactionNo = String(fd.get("islemNo") || "");
    const transaction = store.table("transactions").find((t) => t.islemNo === transactionNo);
    if (!transaction || transaction.cekimYapanId !== caller.firmaId) return error(404, "ISLEM_YOK", "İşlem bulunamadı ya da size ait değil.");
    if (!invoiceRequired(transaction)) return error(409, "FATURA_GEREKMIYOR", "Bu işlem için fatura gerekmiyor.");

    // şeklen kontrol (s.9): uygun olmayan fatura alınmaz
    const fields = {};
    const invoiceNo = String(fd.get("faturaNo") || "").toUpperCase();
    const invoiceDate = String(fd.get("faturaTarihi") || "");
    const amountCents = Number(fd.get("tutarKurus"));
    const file = fd.get("dosya");
    if (!/^[A-Z0-9]{3}\d{13}$/.test(invoiceNo)) fields.faturaNo = "Fatura no 16 karakter olmalı (ör. ANK2026000000412).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) fields.faturaTarihi = "Fatura tarihini girin.";
    else if (invoiceDate < transaction.tarih.slice(0, 10)) fields.faturaTarihi = "Fatura tarihi işlem tarihinden önce olamaz.";
    if (amountCents !== transaction.tutarKurus) fields.tutarKurus = `Fatura tutarı işlem tutarıyla (₺ ${(transaction.tutarKurus / 100).toLocaleString("tr-TR")}) aynı olmalı.`;
    const name = file && typeof file === "object" ? file.name : "";
    const extension = name.split(".").pop().toLowerCase();
    if (!name) fields.dosya = "Fatura dosyasını seçin.";
    else if (!FILE_KINDS.includes(extension)) fields.dosya = "Uygun değil: yalnızca PDF, JPG ya da PNG yüklenebilir.";
    else if (file.size > MAX_FILE_SIZE) fields.dosya = "Uygun değil: dosya en fazla 5 MB olabilir.";
    if (Object.keys(fields).length) return ruleError("SEKLEN_UYGUNSUZ", "Fatura şeklen uygun bulunmadı.", fields);

    const record = { islemNo: transactionNo, faturaNo: invoiceNo, faturaTarihi: invoiceDate, tutarKurus: amountCents, dosyaAdi: name, yukleme: now(), durum: "YUKLENDI" };
    store.update("invoices", (l) => [record, ...l.filter((f) => f.islemNo !== transactionNo)]);
    return HttpResponse.json(invoiceResponse(record, true), { status: 201 });
  }),

  http.post(uc("/faturalar/:islemNo/hatirlatma"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const transaction = store.table("transactions").find((t) => t.islemNo === params.islemNo);
    if (!transaction || !inScope(caller, transaction.cekimYapanId)) return error(404, "ISLEM_YOK", "İşlem bulunamadı.");
    if (invoiceStatus(transaction.islemNo).durum === "YUKLENDI") return error(409, "FATURA_YUKLU", "Bu işlemin faturası zaten yüklü.");
    return HttpResponse.json({ gonderildi: true, firma: companySummary(transaction.cekimYapanId), kanal: "EPOSTA" });
  }),

  http.post(uc("/faturalar/:islemNo/yukleme-linki"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const transaction = store.table("transactions").find((t) => t.islemNo === params.islemNo);
    if (!transaction || transaction.cekimYapanId !== caller.firmaId) return error(404, "ISLEM_YOK", "İşlem bulunamadı ya da size ait değil.");
    return HttpResponse.json({ url: `${INVOICE_LINK}${transaction.islemNo.slice(4)}`, sonGecerlilik: new Date(Date.now() + 7 * 86400000).toISOString() });
  }),
];

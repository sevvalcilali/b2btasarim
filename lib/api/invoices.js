// Fatura yükleme. Sözleşme: docs/api/openapi.yaml → /faturalar
import { apiRequest } from "./client";

/** @param {object} [filtre] { durum: "YUKLENMEMIS"|"YUKLENEN"|"TUMU" } */
export const getInvoices = (filter, signal) => apiRequest("/faturalar", { query: filter, signal });

/**
 * Fatura yükle — multipart/form-data. Şeklen kontrol sunucuda (422: faturaNo, faturaTarihi, tutarKurus, dosya).
 * @param {{ islemNo: string, faturaNo: string, faturaTarihi: string, tutarKurus: number, dosya: File }} g
 */
export function uploadInvoice(g) {
  const fd = new FormData();
  fd.append("islemNo", g.islemNo);
  fd.append("faturaNo", g.faturaNo);
  fd.append("faturaTarihi", g.faturaTarihi);
  fd.append("tutarKurus", String(g.tutarKurus));
  fd.append("dosya", g.dosya);
  return apiRequest("/faturalar", { method: "POST", body: fd });
}

/** Bayi / ana firma, faturası bekleyen işlem için çekimi yapan firmaya e-posta hatırlatması gönderir */
export const remindInvoice = (transactionNo) => apiRequest(`/faturalar/${encodeURIComponent(transactionNo)}/hatirlatma`, { method: "POST" });

/** Faturayı link üzerinden yükletmek için yükleme linki (şartname s.10) */
export const invoiceUploadLink = (transactionNo) => apiRequest(`/faturalar/${encodeURIComponent(transactionNo)}/yukleme-linki`, { method: "POST" });

// İptal / iade talepleri. Sözleşme: docs/api/openapi.yaml → /iptal-iade-talepleri
import { apiRequest } from "./client";

/**
 * @param {object} [filtre]
 * @param {"TUMU"|"ONAYIMDA"|"UST_ONAYA_ILETILEN"|"ONAY_BEKLEYEN"|"ONAYLANDI"|"REDDEDILDI"} [filtre.gorunum]
 */
export const getRequests = (filter, signal) => apiRequest("/iptal-iade-talepleri", { query: filter, signal });

/** Talep girilebilecek işlemler: kendi başarılı çekimleri, açık / onaylı talebi olmayanlar */
export const getEligibleTransactions = (signal) => apiRequest("/iptal-iade-talepleri/uygun-islemler", { signal });

/** @param {object} govde { islemNo, tur: "IADE"|"IPTAL", tutarKurus, aciklama } */
export const createRequest = (body) => apiRequest("/iptal-iade-talepleri", { method: "POST", body });

export const approveRequest = (requestNo) => apiRequest(`/iptal-iade-talepleri/${encodeURIComponent(requestNo)}/onay`, { method: "POST" });

export const rejectRequest = (requestNo, reason) => apiRequest(`/iptal-iade-talepleri/${encodeURIComponent(requestNo)}/red`, { method: "POST", body: { gerekce: reason } });

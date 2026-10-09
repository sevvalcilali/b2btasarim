// Tanımlı (düzenli) müşteriler. Sözleşme: docs/api/openapi.yaml → /musteriler
import { apiRequest } from "./client";

/** Oturum firmasının tanımlı müşterileri; q: unvan, cari no, vergi no */
export const getCustomers = (filter, signal) => apiRequest("/musteriler", { query: filter, signal });

/** @param {object} govde { unvan, cariNo, vergiNo, telefon, email, adres } */
export const createCustomer = (body) => apiRequest("/musteriler", { method: "POST", body });

/**
 * Ödemenin aktarılacağı cariler (şartname s.2, s.6): ana firma üye işyerlerini, bayi kendisine açık üye işyerlerini,
 * alt bayi bağlı olduğu bayinin carisini görür. Cevap: { etiket, kayitlar: [{ cariNo, ad }] }
 */
export const getCollectionAccounts = (signal) => apiRequest("/tahsilat-carileri", { signal });

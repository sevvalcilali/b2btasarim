// Özet raporlar. Sözleşme: docs/api/openapi.yaml → /raporlar/bayi-ozet
import { apiRequest } from "./client";

/**
 * Bayi / alt bayi özeti (şartname s.7): firma başına işlem adedi, ciro, vade farkı, iptal/iade, hesaba geçecek tutar.
 * @param {object} [filtre]
 * @param {string} [filtre.musteriTuru]   BAYI | ALT_BAYI | DUZENLI_MUSTERI | DUZENSIZ_MUSTERI | KENDI_KARTI | MUSTERI_KARTI
 * @param {"7g"|"30g"|"tumu"} [filtre.donem]
 */
export const getDealerSummary = (filter, signal) => apiRequest("/raporlar/bayi-ozet", { query: filter, signal });

/**
 * Bayi / alt bayi fatura özeti (şartname s.2, s.9): firma başına fatura gereken, yüklenen, bekleyen, reddedilen işlem ve bekleyen tutar.
 * @param {object} [filtre] { donem: "7g"|"30g"|"tumu" }
 */
export const getDealerInvoiceSummary = (filter, signal) => apiRequest("/raporlar/bayi-fatura-ozet", { query: filter, signal });

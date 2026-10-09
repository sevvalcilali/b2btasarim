// Tanımlı (düzenli) müşteriler. Sözleşme: docs/api/openapi.yaml → /musteriler
import { istek } from "./client";

/** Oturum firmasının tanımlı müşterileri; q: unvan, cari no, vergi no */
export const musterileriGetir = (filtre, sinyal) => istek("/musteriler", { sorgu: filtre, sinyal });

/** @param {object} govde { unvan, cariNo, vergiNo, telefon, email, adres } */
export const musteriOlustur = (govde) => istek("/musteriler", { yontem: "POST", govde });

/**
 * Ödemenin aktarılacağı cariler (şartname s.2, s.6): ana firma üye işyerlerini, bayi kendisine açık üye işyerlerini,
 * alt bayi bağlı olduğu bayinin carisini görür. Cevap: { etiket, kayitlar: [{ cariNo, ad }] }
 */
export const tahsilatCarileriGetir = (sinyal) => istek("/tahsilat-carileri", { sinyal });

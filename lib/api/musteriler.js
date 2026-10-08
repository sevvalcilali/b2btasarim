// Tanımlı (düzenli) müşteriler. Sözleşme: docs/api/openapi.yaml → /musteriler
import { istek } from "./istemci";

/** Oturum firmasının tanımlı müşterileri; q: unvan, cari no, vergi no */
export const musterileriGetir = (filtre, sinyal) => istek("/musteriler", { sorgu: filtre, sinyal });

/** @param {object} govde { unvan, cariNo, vergiNo, telefon, email, adres } */
export const musteriOlustur = (govde) => istek("/musteriler", { yontem: "POST", govde });

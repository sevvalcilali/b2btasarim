// Oturum firmasının kendi kaydı. Sözleşme: docs/api/openapi.yaml → /firma
import { istek } from "./client";

/** Kendi firma kaydı: taksit sınırı, işlem limiti, vade profili, üye işyerleri, alt bayi yetkisi, ortaklar */
export const firmaGetir = (sinyal) => istek("/firma", { sinyal });

/** Bayi / alt bayi kendi iletişim bilgisini günceller (şartname s.10); tanım alanları üst firmada kalır. @param {{telefon, email, adres}} govde */
export const firmaIletisimGuncelle = (govde) => istek("/firma/iletisim", { yontem: "PUT", govde });

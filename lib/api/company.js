// Oturum firmasının kendi kaydı. Sözleşme: docs/api/openapi.yaml → /firma
import { apiRequest } from "./client";

/** Kendi firma kaydı: taksit sınırı, işlem limiti, vade profili, üye işyerleri, alt bayi yetkisi, ortaklar */
export const getCompany = (signal) => apiRequest("/firma", { signal });

/** Bayi / alt bayi kendi iletişim bilgisini günceller (şartname s.10); tanım alanları üst firmada kalır. @param {{telefon, email, adres}} govde */
export const updateCompanyContact = (body) => apiRequest("/firma/iletisim", { method: "PUT", body });

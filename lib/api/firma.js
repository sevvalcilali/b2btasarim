// Oturum firmasının kendi kaydı. Sözleşme: docs/api/openapi.yaml → /firma
import { istek } from "./istemci";

/** Kendi firma kaydı: taksit sınırı, işlem limiti, vade profili, üye işyerleri, alt bayi yetkisi, ortaklar */
export const firmaGetir = (sinyal) => istek("/firma", { sinyal });

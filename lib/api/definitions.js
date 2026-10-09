// Tanım listeleri. Sözleşme: docs/api/openapi.yaml → /vade-farki-profilleri, /uye-isyerleri
import { apiRequest } from "./client";

/** @returns {{ kayitlar: object[], sinir: number }} profiller (kullanan bayi sayısı ve örnek hesapla), en çok kaç profil tanımlanabileceği */
export const getMaturityProfiles = (signal) => apiRequest("/vade-farki-profilleri", { signal });

/** @param {object} govde  VadeFarkiProfiliGirdisi (ad, oranYuzde, aciklama, durum) — yalnız ana firma */
export const createMaturityProfile = (body) => apiRequest("/vade-farki-profilleri", { method: "POST", body });

export const updateMaturityProfile = (id, body) => apiRequest(`/vade-farki-profilleri/${id}`, { method: "PUT", body });

export const getMerchants = (signal) => apiRequest("/uye-isyerleri", { signal });

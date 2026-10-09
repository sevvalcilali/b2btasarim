// Kullanıcı tanım uçları. Sözleşme: docs/api/openapi.yaml → /kullanicilar
import { apiRequest } from "./client";

/**
 * @param {object} [filtre]
 * @param {"AKTIF"|"PASIF"} [filtre.durum]
 * @param {string} [filtre.q]  ad soyad, e-posta
 */
export const getUsers = (filter, signal) => apiRequest("/kullanicilar", { query: filter, signal });

/** @param {object} govde  KullaniciGirdisi (adSoyad, email, telefon?, yetki, durum) — yalnız Yönetici */
export const createUser = (body) => apiRequest("/kullanicilar", { method: "POST", body });

export const updateUser = (userId, body) => apiRequest(`/kullanicilar/${encodeURIComponent(userId)}`, { method: "PUT", body });

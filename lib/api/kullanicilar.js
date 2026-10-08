// Kullanıcı tanım uçları. Sözleşme: docs/api/openapi.yaml → /kullanicilar
import { istek } from "./istemci";

/**
 * @param {object} [filtre]
 * @param {"AKTIF"|"PASIF"} [filtre.durum]
 * @param {string} [filtre.q]  ad soyad, e-posta
 */
export const kullanicilariGetir = (filtre, sinyal) => istek("/kullanicilar", { sorgu: filtre, sinyal });

/** @param {object} govde  KullaniciGirdisi (adSoyad, email, telefon?, yetki, durum) — yalnız Yönetici */
export const kullaniciOlustur = (govde) => istek("/kullanicilar", { yontem: "POST", govde });

export const kullaniciGuncelle = (kullaniciId, govde) => istek(`/kullanicilar/${encodeURIComponent(kullaniciId)}`, { yontem: "PUT", govde });

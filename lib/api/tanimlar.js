// Tanım listeleri. Sözleşme: docs/api/openapi.yaml → /vade-farki-profilleri, /uye-isyerleri
import { istek } from "./istemci";

/** @returns {{ kayitlar: object[], sinir: number }} profiller (kullanan bayi sayısı ve örnek hesapla), en çok kaç profil tanımlanabileceği */
export const vadeFarkiProfilleriGetir = (sinyal) => istek("/vade-farki-profilleri", { sinyal });

/** @param {object} govde  VadeFarkiProfiliGirdisi (ad, oranYuzde, aciklama, durum) — yalnız ana firma */
export const vadeFarkiProfiliOlustur = (govde) => istek("/vade-farki-profilleri", { yontem: "POST", govde });

export const vadeFarkiProfiliGuncelle = (id, govde) => istek(`/vade-farki-profilleri/${id}`, { yontem: "PUT", govde });

export const uyeIsyerleriGetir = (sinyal) => istek("/uye-isyerleri", { sinyal });

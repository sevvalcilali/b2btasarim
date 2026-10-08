// Tanım listeleri. Sözleşme: docs/api/openapi.yaml → /vade-farki-profilleri, /uye-isyerleri
import { istek } from "./istemci";

/** Vade farkı profilleri (şartname s.4: en çok 5 profil) */
export const vadeFarkiProfilleriGetir = (sinyal) => istek("/vade-farki-profilleri", { sinyal });

/** Ana firmanın üye işyerleri; bayi / alt bayi yalnızca kendisine açılanları görür */
export const uyeIsyerleriGetir = (sinyal) => istek("/uye-isyerleri", { sinyal });

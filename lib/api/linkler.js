// Ödeme linki uçları. Sözleşme: docs/api/openapi.yaml → /odeme-linkleri
import { istek } from "./istemci";

/** Rol kapsamındaki ödeme linkleri, en yeniden eskiye */
export const odemeLinkleriGetir = (sinyal) => istek("/odeme-linkleri", { sinyal });

/** @param {object} govde  OdemeLinkiGirdisi (docs/api/openapi.yaml) */
export const odemeLinkiOlustur = (govde) => istek("/odeme-linkleri", { yontem: "POST", govde });

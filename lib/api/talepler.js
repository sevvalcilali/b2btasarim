// İptal / iade talepleri. Sözleşme: docs/api/openapi.yaml → /iptal-iade-talepleri
import { istek } from "./istemci";

/**
 * @param {object} [filtre]
 * @param {"TUMU"|"ONAYIMDA"|"UST_ONAYA_ILETILEN"|"ONAY_BEKLEYEN"|"ONAYLANDI"|"REDDEDILDI"} [filtre.gorunum]
 */
export const talepleriGetir = (filtre, sinyal) => istek("/iptal-iade-talepleri", { sorgu: filtre, sinyal });

/** Talep girilebilecek işlemler: kendi başarılı çekimleri, açık / onaylı talebi olmayanlar */
export const talepUygunIslemleriGetir = (sinyal) => istek("/iptal-iade-talepleri/uygun-islemler", { sinyal });

/** @param {object} govde { islemNo, tur: "IADE"|"IPTAL", tutarKurus, aciklama } */
export const talepOlustur = (govde) => istek("/iptal-iade-talepleri", { yontem: "POST", govde });

export const talepOnayla = (talepNo) => istek(`/iptal-iade-talepleri/${encodeURIComponent(talepNo)}/onay`, { yontem: "POST" });

export const talepReddet = (talepNo, gerekce) => istek(`/iptal-iade-talepleri/${encodeURIComponent(talepNo)}/red`, { yontem: "POST", govde: { gerekce } });

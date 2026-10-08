// Üst cari bakiye / borç ekstresi. Sözleşme: docs/api/openapi.yaml → /bakiye/ekstre
import { istek } from "./istemci";

/** @param {object} [filtre] { donem: "30g"|"90g"|"tumu" } */
/** Toplu bakiye / borç / limit yükleme (şartname s.2, s.10): önizleme yazmaz; yükle geçerli satırları uygular */
function topluForm(dosya) {
  const fd = new FormData();
  fd.append("dosya", dosya);
  return fd;
}
export const bakiyeTopluOnizle = (dosya) => istek("/bakiye/toplu/onizleme", { yontem: "POST", govde: topluForm(dosya) });
export const bakiyeTopluYukle = (dosya) => istek("/bakiye/toplu", { yontem: "POST", govde: topluForm(dosya) });

export const bakiyeEkstresiGetir = (filtre, sinyal) => istek("/bakiye/ekstre", { sorgu: filtre, sinyal });

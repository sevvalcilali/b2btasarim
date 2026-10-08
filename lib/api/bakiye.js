// Üst cari bakiye / borç ekstresi. Sözleşme: docs/api/openapi.yaml → /bakiye/ekstre
import { istek } from "./istemci";

/** @param {object} [filtre] { donem: "30g"|"90g"|"tumu" } */
export const bakiyeEkstresiGetir = (filtre, sinyal) => istek("/bakiye/ekstre", { sorgu: filtre, sinyal });

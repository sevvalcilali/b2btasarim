// Üst cari bakiye / borç ekstresi. Sözleşme: docs/api/openapi.yaml → /bakiye/ekstre
import { apiRequest } from "./client";

/** @param {object} [filtre] { donem: "30g"|"90g"|"tumu" } */
/** Toplu bakiye / borç / limit yükleme (şartname s.2, s.10): önizleme yazmaz; yükle geçerli satırları uygular */
function bulkForm(file) {
  const fd = new FormData();
  fd.append("dosya", file);
  return fd;
}
export const previewBalanceBulk = (file) => apiRequest("/bakiye/toplu/onizleme", { method: "POST", body: bulkForm(file) });
export const uploadBalanceBulk = (file) => apiRequest("/bakiye/toplu", { method: "POST", body: bulkForm(file) });

export const getBalanceStatement = (filter, signal) => apiRequest("/bakiye/ekstre", { query: filter, signal });

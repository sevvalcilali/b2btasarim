// Bayi / alt bayi uçları. Sözleşme: docs/api/openapi.yaml → /bayiler
import { apiRequest } from "./client";

/**
 * @param {object} [filtre]
 * @param {"BAYI"|"ALT_BAYI"} [filtre.tur]  ana firma: bayileri ya da ağdaki tüm alt bayileri; bayi: yalnız kendi alt bayileri
 * @param {"AKTIF"|"PASIF"} [filtre.durum]
 * @param {string} [filtre.q]               unvan, cari no, vergi no
 */
export const getDealers = (filter, signal) => apiRequest("/bayiler", { query: filter, signal });

export const getDealer = (accountNo, signal) => apiRequest(`/bayiler/${encodeURIComponent(accountNo)}`, { signal });

/** @param {object} govde  BayiGirdisi (tur, unvan, cariNo, vergiNo, telefon, email, adres, vadeProfilId, taksitler, islemLimitiKurus, altBayiYetkisi?, uyeIsyerleri, durum) */
export const createDealer = (body) => apiRequest("/bayiler", { method: "POST", body });

/** Excel / CSV ile toplu ekleme (şartname s.2, s.10): önizleme hiçbir kaydı yazmaz; kaydet geçerli satırları ekler */
function bulkForm(file) {
  const fd = new FormData();
  fd.append("dosya", file);
  return fd;
}
export const previewDealerBulk = (file) => apiRequest("/bayiler/toplu/onizleme", { method: "POST", body: bulkForm(file) });
export const addDealerBulk = (file) => apiRequest("/bayiler/toplu", { method: "POST", body: bulkForm(file) });

export const updateDealer = (accountNo, body) => apiRequest(`/bayiler/${encodeURIComponent(accountNo)}`, { method: "PUT", body });

// Fatura yükleme. Sözleşme: docs/api/openapi.yaml → /faturalar
import { istek } from "./istemci";

/** @param {object} [filtre] { durum: "YUKLENMEMIS"|"YUKLENEN"|"TUMU" } */
export const faturalariGetir = (filtre, sinyal) => istek("/faturalar", { sorgu: filtre, sinyal });

/**
 * Fatura yükle — multipart/form-data. Şeklen kontrol sunucuda (422: faturaNo, faturaTarihi, tutarKurus, dosya).
 * @param {{ islemNo: string, faturaNo: string, faturaTarihi: string, tutarKurus: number, dosya: File }} g
 */
export function faturaYukle(g) {
  const fd = new FormData();
  fd.append("islemNo", g.islemNo);
  fd.append("faturaNo", g.faturaNo);
  fd.append("faturaTarihi", g.faturaTarihi);
  fd.append("tutarKurus", String(g.tutarKurus));
  fd.append("dosya", g.dosya);
  return istek("/faturalar", { yontem: "POST", govde: fd });
}

/** Bayi / ana firma, faturası bekleyen işlem için çekimi yapan firmaya e-posta hatırlatması gönderir */
export const faturaHatirlat = (islemNo) => istek(`/faturalar/${encodeURIComponent(islemNo)}/hatirlatma`, { yontem: "POST" });

/** Faturayı link üzerinden yükletmek için yükleme linki (şartname s.10) */
export const faturaYuklemeLinki = (islemNo) => istek(`/faturalar/${encodeURIComponent(islemNo)}/yukleme-linki`, { yontem: "POST" });

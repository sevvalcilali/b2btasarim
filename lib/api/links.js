// Ödeme linki uçları. Sözleşme: docs/api/openapi.yaml → /odeme-linkleri
import { apiRequest } from "./client";

/** Rol kapsamındaki ödeme linkleri, en yeniden eskiye */
export const getPaymentLinks = (signal) => apiRequest("/odeme-linkleri", { signal });

/** @param {object} govde  OdemeLinkiGirdisi (docs/api/openapi.yaml) */
export const createPaymentLink = (body) => apiRequest("/odeme-linkleri", { method: "POST", body });

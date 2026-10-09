// Ödeme uçları. Sözleşme: docs/api/openapi.yaml → /odeme/taksit-secenekleri, /odemeler
import { idempotencyKey, apiRequest } from "./client";

/**
 * Taksit seçenekleri ve vade farkı — hesap sunucuda (formül backend ekibince netleştirilecek).
 * @param {object} girdi
 * @param {number} [girdi.tutarKurus]      boşsa seçenekler tutarsız (yalnız taksit listesi) döner
 * @param {string} girdi.musteriTuru
 * @param {string} [girdi.musteriCariNo]   ana firma bayiden tahsilatta o bayinin profili uygulanır
 */
export const getInstallmentOptions = (input, signal) => apiRequest("/odeme/taksit-secenekleri", { query: input, signal });

/**
 * Kart tokenlaştırma — DEMO. Gerçek ortamda kart numarası ödeme sağlayıcısının güvenli alanında (SDK / 3D Secure)
 * tokenlaşır ve backend'e yalnızca token gider; bu fonksiyon o adımın yerini tutar. Kart numarası hiçbir isteğe yazılmaz.
 * @returns {Promise<{token: string, son4: string, isim: string, sonKullanma: string}>}
 */
export async function tokenizeCard({ no, isim: name, sonKullanma: expiry }) {
  const digit = String(no).replace(/\D/g, "");
  await new Promise((r) => setTimeout(r, 200));
  return { token: `tok_demo_${digit.slice(-4)}_${Math.random().toString(36).slice(2, 10)}`, son4: digit.slice(-4), isim: name, sonKullanma: expiry };
}

/**
 * Ödeme al. Idempotency-Key çift gönderimi sunucuda tekilleştirir.
 * @param {object} govde  OdemeGirdisi (docs/api/openapi.yaml)
 */
export const makePayment = (body) => apiRequest("/odemeler", { method: "POST", body, basliklar: { "Idempotency-Key": idempotencyKey() } });

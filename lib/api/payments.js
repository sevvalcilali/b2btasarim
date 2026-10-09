// Ödeme uçları. Sözleşme: docs/api/openapi.yaml → /odeme/taksit-secenekleri, /odemeler
import { idempotencyAnahtari, istek } from "./client";

/**
 * Taksit seçenekleri ve vade farkı — hesap sunucuda (formül backend ekibince netleştirilecek).
 * @param {object} girdi
 * @param {number} [girdi.tutarKurus]      boşsa seçenekler tutarsız (yalnız taksit listesi) döner
 * @param {string} girdi.musteriTuru
 * @param {string} [girdi.musteriCariNo]   ana firma bayiden tahsilatta o bayinin profili uygulanır
 */
export const taksitSecenekleriGetir = (girdi, sinyal) => istek("/odeme/taksit-secenekleri", { sorgu: girdi, sinyal });

/**
 * Kart tokenlaştırma — DEMO. Gerçek ortamda kart numarası ödeme sağlayıcısının güvenli alanında (SDK / 3D Secure)
 * tokenlaşır ve backend'e yalnızca token gider; bu fonksiyon o adımın yerini tutar. Kart numarası hiçbir isteğe yazılmaz.
 * @returns {Promise<{token: string, son4: string, isim: string, sonKullanma: string}>}
 */
export async function kartTokenla({ no, isim, sonKullanma }) {
  const rakam = String(no).replace(/\D/g, "");
  await new Promise((r) => setTimeout(r, 200));
  return { token: `tok_demo_${rakam.slice(-4)}_${Math.random().toString(36).slice(2, 10)}`, son4: rakam.slice(-4), isim, sonKullanma };
}

/**
 * Ödeme al. Idempotency-Key çift gönderimi sunucuda tekilleştirir.
 * @param {object} govde  OdemeGirdisi (docs/api/openapi.yaml)
 */
export const odemeYap = (govde) => istek("/odemeler", { yontem: "POST", govde, basliklar: { "Idempotency-Key": idempotencyAnahtari() } });

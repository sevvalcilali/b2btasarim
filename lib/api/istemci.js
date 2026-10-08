// Tek fetch noktası. Her uç nokta fonksiyonu (lib/api/*.js) buradan geçer; ekranlar bu dosyayı hiç görmez.
//
//   NEXT_PUBLIC_API_URL   backend adresi (öntanımlı /api/v1 — sahte backend bu adrese cevap verir)
//   NEXT_PUBLIC_API_MOCK  "false" verilmedikçe sahte backend (MSW) açıktır
//
// Backend'e geçiş: yalnızca bu iki ayar değişir, ekran koduna dokunulmaz.
import { ApiHatasi } from "./hata";

export const TEMEL_ADRES = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "");
export const SAHTE_BACKEND = process.env.NEXT_PUBLIC_API_MOCK !== "false";
const ZAMAN_ASIMI_MS = 15000;

// Kimlik: Authorization başlığına yazılan token. Demo'da rol değiştirici "demo-<ROL>" verir;
// gerçek ortamda giriş akışından gelen token verilir. Rol ve firma sunucuda tokendan çıkarılır.
let kimlik = null;
export function kimlikAyarla(token) {
  kimlik = token || null;
}
export function kimlikBasliklari() {
  return kimlik ? { Authorization: `Bearer ${kimlik}` } : {};
}

// Sahte backend açıkken ilk istek, servis çalışanı hazır olana kadar bekler (mocks/baslat.js bunu ayarlar).
let hazirlik = Promise.resolve();
export function hazirlikBekle(soz) {
  hazirlik = soz.catch(() => {});
}

// Boş / tanımsız sorgu parametrelerini atar, dizileri tekrar eden anahtar yapar.
function sorguDizgesi(sorgu) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sorgu || {})) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)));
    else p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

function zamanAsimiSinyali(sinyal) {
  const zaman = AbortSignal.timeout(ZAMAN_ASIMI_MS);
  if (!sinyal) return zaman;
  return typeof AbortSignal.any === "function" ? AbortSignal.any([sinyal, zaman]) : sinyal;
}

/**
 * @param {string} yol        "/islemler" gibi; TEMEL_ADRES'e eklenir
 * @param {object} [secenek]
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [secenek.yontem]
 * @param {object} [secenek.sorgu]     sorgu parametreleri
 * @param {object|FormData} [secenek.govde]
 * @param {object} [secenek.basliklar]
 * @param {AbortSignal} [secenek.sinyal]
 * @returns {Promise<any>} JSON cevap (204 → null)
 * @throws {ApiHatasi}
 */
export async function istek(yol, { yontem = "GET", sorgu, govde, basliklar, sinyal } = {}) {
  await hazirlik;
  const formMu = typeof FormData !== "undefined" && govde instanceof FormData;
  let cevap;
  try {
    cevap = await fetch(TEMEL_ADRES + yol + sorguDizgesi(sorgu), {
      method: yontem,
      signal: zamanAsimiSinyali(sinyal),
      headers: {
        Accept: "application/json",
        ...(govde !== undefined && !formMu ? { "Content-Type": "application/json" } : {}),
        ...kimlikBasliklari(),
        ...basliklar,
      },
      body: formMu ? govde : govde !== undefined ? JSON.stringify(govde) : undefined,
    });
  } catch (e) {
    if (e?.name === "AbortError" && sinyal?.aborted) throw e; // çağıran iptal etti (ör. ekran değişti)
    throw new ApiHatasi(0, null, e?.name === "TimeoutError" ? "Sunucu zamanında yanıt vermedi." : undefined);
  }
  const veri = cevap.status === 204 ? null : await cevap.json().catch(() => null);
  if (!cevap.ok) throw new ApiHatasi(cevap.status, veri?.hata);
  return veri;
}

// Çift gönderimi (çift tıklama, yeniden deneme) sunucuda tekilleştirmek için
export const idempotencyAnahtari = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

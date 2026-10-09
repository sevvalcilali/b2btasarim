// Tek fetch noktası. Her uç nokta fonksiyonu (lib/api/*.js) buradan geçer; ekranlar bu dosyayı hiç görmez.
//
//   NEXT_PUBLIC_API_URL   backend adresi (öntanımlı /api/v1 — sahte backend bu adrese cevap verir)
//   NEXT_PUBLIC_API_MOCK  "false" verilmedikçe sahte backend (MSW) açıktır
//
// Backend'e geçiş: yalnızca bu iki ayar değişir, ekran koduna dokunulmaz.
import { ApiError } from "./error";

export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "");
export const MOCK_BACKEND = process.env.NEXT_PUBLIC_API_MOCK !== "false";
const TIMEOUT_MS = 15000;

// Kimlik: Authorization başlığına yazılan token. Demo'da rol değiştirici "demo-<ROL>" verir;
// gerçek ortamda giriş akışından gelen token verilir. Rol ve firma sunucuda tokendan çıkarılır.
let auth = null;
export function setAuth(token) {
  auth = token || null;
}
export function authHeaders() {
  return auth ? { Authorization: `Bearer ${auth}` } : {};
}

// Sahte backend açıkken ilk istek, servis çalışanı hazır olana kadar bekler (mocks/start.js bunu ayarlar).
let readiness = Promise.resolve();
export function waitUntilReady(promise) {
  readiness = promise.catch(() => {});
}

// Boş / tanımsız sorgu parametrelerini atar, dizileri tekrar eden anahtar yapar.
function queryString(query) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query || {})) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)));
    else p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

function timeoutSignal(signal) {
  const time = AbortSignal.timeout(TIMEOUT_MS);
  if (!signal) return time;
  return typeof AbortSignal.any === "function" ? AbortSignal.any([signal, time]) : signal;
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
export async function apiRequest(path, { method = "GET", query, body, basliklar: headers, signal } = {}) {
  await readiness;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  let response;
  try {
    response = await fetch(BASE_URL + path + queryString(query), {
      method: method,
      signal: timeoutSignal(signal),
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
        ...authHeaders(),
        ...headers,
      },
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (e?.name === "AbortError" && signal?.aborted) throw e; // çağıran iptal etti (ör. ekran değişti)
    throw new ApiError(0, null, e?.name === "TimeoutError" ? "Sunucu zamanında yanıt vermedi." : undefined);
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data?.hata);
  return data;
}

// Çift gönderimi (çift tıklama, yeniden deneme) sunucuda tekilleştirmek için
export const idempotencyKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

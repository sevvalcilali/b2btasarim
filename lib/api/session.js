// Oturum uçları. Sözleşme: docs/api/openapi.yaml → /oturum
import { apiRequest } from "./client";

/**
 * Giriş yapmış kullanıcı, rolü, firması ve yetkileri.
 * @returns {Promise<{kullanici: object, rol: string, firma: object, anaFirma: object, yetkiler: string[]}>}
 */
export const getSession = (signal) => apiRequest("/oturum", { signal });

/** Cari seçimi: sonraki ödemelerin işleneceği üye işyeri. @returns {Promise<{cariNo, ad}>} */
export const selectActiveMerchant = (accountNo) => apiRequest("/oturum/aktif-uye-isyeri", { method: "PUT", body: { cariNo: accountNo } });

// Yalnızca sahte backend: demo verisini başlangıç haline döndürür.
export const resetDemoData = () => apiRequest("/demo/sifirla", { method: "POST" });

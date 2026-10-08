// Oturum uçları. Sözleşme: docs/api/openapi.yaml → /oturum
import { istek } from "./istemci";

/**
 * Giriş yapmış kullanıcı, rolü, firması ve yetkileri.
 * @returns {Promise<{kullanici: object, rol: string, firma: object, anaFirma: object, yetkiler: string[]}>}
 */
export const oturumGetir = (sinyal) => istek("/oturum", { sinyal });

// Yalnızca sahte backend: demo verisini başlangıç haline döndürür.
export const demoVerisiniSifirla = () => istek("/demo/sifirla", { yontem: "POST" });

// Oturum uçları. Sözleşme: docs/api/openapi.yaml → /oturum
import { istek } from "./client";

/**
 * Giriş yapmış kullanıcı, rolü, firması ve yetkileri.
 * @returns {Promise<{kullanici: object, rol: string, firma: object, anaFirma: object, yetkiler: string[]}>}
 */
export const oturumGetir = (sinyal) => istek("/oturum", { sinyal });

/** Cari seçimi: sonraki ödemelerin işleneceği üye işyeri. @returns {Promise<{cariNo, ad}>} */
export const aktifUyeIsyeriSec = (cariNo) => istek("/oturum/aktif-uye-isyeri", { yontem: "PUT", govde: { cariNo } });

// Yalnızca sahte backend: demo verisini başlangıç haline döndürür.
export const demoVerisiniSifirla = () => istek("/demo/sifirla", { yontem: "POST" });

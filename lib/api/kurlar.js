// Kur bilgisi. Sözleşme: docs/api/openapi.yaml → /kurlar
import { istek } from "./istemci";

/** @returns {{ kayitlar: {kod, ad, alis, satis, degisimYuzde}[], guncelleme: string, kaynak: string }} */
export const kurlariGetir = (sinyal) => istek("/kurlar", { sinyal });

// Kur bilgisi. Sözleşme: docs/api/openapi.yaml → /kurlar
import { apiRequest } from "./client";

/** @returns {{ kayitlar: {kod, ad, alis, satis, degisimYuzde}[], guncelleme: string, kaynak: string }} */
export const getRates = (signal) => apiRequest("/kurlar", { signal });

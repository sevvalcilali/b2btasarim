// İşlem uçları. Sözleşme: docs/api/openapi.yaml → /islemler
import { istek } from "./client";

/**
 * İşlem listesi — filtre ve arama sunucuda, rol kapsamı tokendan.
 * @param {object} [filtre]
 * @param {string} [filtre.durum]       BASARILI | BASARISIZ | IPTAL | IADE
 * @param {string} [filtre.musteriTuru] BAYI | ALT_BAYI | DUZENLI_MUSTERI | DUZENSIZ_MUSTERI | KENDI_KARTI | MUSTERI_KARTI
 * @param {string} [filtre.odemeTipi]   MANUEL | LINK
 * @param {string} [filtre.q]           işlem no, unvan, cari no, vergi no, kart son 4, çekim yapan
 * @param {string} [filtre.firmaId]      çekimi yapan firma (bayi detay paneli)
 * @param {string} [filtre.sira]         "tarih:desc" (varsayılan) · tutarKurus:asc · islemNo:asc …
 * @param {number} [filtre.sayfa]
 * @param {number} [filtre.boyut]
 * @returns {Promise<{kayitlar: object[], toplam: number, sayfa: number, boyut: number, sayaclar: object, ozet: object, musteriTurleri: string[]}>}
 */
export const islemleriGetir = (filtre, sinyal) => istek("/islemler", { sorgu: filtre, sinyal });

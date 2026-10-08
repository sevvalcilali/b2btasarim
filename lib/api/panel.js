// Ana Sayfa uçları. Sözleşme: docs/api/openapi.yaml → /panel/*
import { istek } from "./istemci";

/**
 * KPI özeti: kalem başına adet, tutar, düne göre değişim; başarı oranı, ortalama işlem; mini seriler.
 * @param {"bugun"|"hafta"|"ay"} [donem]
 */
export const panelOzetGetir = (donem = "bugun", sinyal) => istek("/panel/ozet", { sorgu: { donem }, sinyal });

/** Son 7 günün günlük hacmi + toplam + geçen haftaya göre değişim */
export const haftalikHacimGetir = (sinyal) => istek("/panel/haftalik-hacim", { sinyal });

/** Bakiye, borç, limit ve kullanım yüzdesi (rolün gördüğü cari: firma limiti ya da üst cari) */
export const bakiyeGetir = (sinyal) => istek("/panel/bakiye", { sinyal });

/** Menü rozetleri: onayımda bekleyen iptal/iade talebi, faturası bekleyen kendi işlemi */
export const bekleyenlerGetir = (sinyal) => istek("/panel/bekleyenler", { sinyal });

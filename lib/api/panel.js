// Ana Sayfa uçları. Sözleşme: docs/api/openapi.yaml → /panel/*
import { apiRequest } from "./client";

/**
 * KPI özeti: kalem başına adet, tutar, düne göre değişim; başarı oranı, ortalama işlem; mini seriler.
 * @param {"bugun"|"hafta"|"ay"} [donem]
 */
export const getPanelSummary = (period = "bugun", signal) => apiRequest("/panel/ozet", { query: { donem: period }, signal });

/** Son 7 günün günlük hacmi + toplam + geçen haftaya göre değişim */
export const getWeeklyVolume = (signal) => apiRequest("/panel/haftalik-hacim", { signal });

/** Bakiye, borç, limit ve kullanım yüzdesi (rolün gördüğü cari: firma limiti ya da üst cari) */
export const getBalance = (signal) => apiRequest("/panel/bakiye", { signal });

/** Menü rozetleri: onayımda bekleyen iptal/iade talebi, faturası bekleyen kendi işlemi */
export const getPendingItems = (signal) => apiRequest("/panel/bekleyenler", { signal });

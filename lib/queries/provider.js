// Uygulama genelinde tek QueryClient. Varsayılanlar: 30 sn tazelik, odak değişiminde yeniden isteme yok,
// yalnızca sunucu (5xx) ve ağ hatalarında bir kez yeniden deneme — 4xx iş kuralı hataları hemen ekrana düşer.
import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/error";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: (attempt, error) => attempt < 1 && (!(error instanceof ApiError) || error.durum === 0 || error.durum >= 500),
      },
      mutations: { retry: false },
    },
  });
}

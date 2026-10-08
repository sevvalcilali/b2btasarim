// Uygulama genelinde tek QueryClient. Varsayılanlar: 30 sn tazelik, odak değişiminde yeniden isteme yok,
// yalnızca sunucu (5xx) ve ağ hatalarında bir kez yeniden deneme — 4xx iş kuralı hataları hemen ekrana düşer.
import { QueryClient } from "@tanstack/react-query";
import { ApiHatasi } from "@/lib/api/hata";

export function yeniSorguIstemcisi() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: (deneme, hata) => deneme < 1 && (!(hata instanceof ApiHatasi) || hata.durum === 0 || hata.durum >= 500),
      },
      mutations: { retry: false },
    },
  });
}

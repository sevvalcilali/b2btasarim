import { useQuery } from "@tanstack/react-query";
import { bakiyeGetir, bekleyenlerGetir, haftalikHacimGetir, panelOzetGetir } from "@/lib/api/panel";
import { anahtar } from "./anahtarlar";

export const usePanelOzet = (donem = "bugun") =>
  useQuery({ queryKey: anahtar.panelOzet(donem), queryFn: ({ signal }) => panelOzetGetir(donem, signal) });

export const useHaftalikHacim = () => useQuery({ queryKey: anahtar.haftalikHacim, queryFn: ({ signal }) => haftalikHacimGetir(signal) });

export const useBakiye = () => useQuery({ queryKey: anahtar.bakiye, queryFn: ({ signal }) => bakiyeGetir(signal) });

// Menü rozetleri; onay / yükleme sonrası ilgili kancalar bu anahtarı yeniler
export const useBekleyenler = () => useQuery({ queryKey: anahtar.bekleyenler, queryFn: ({ signal }) => bekleyenlerGetir(signal), staleTime: 60 * 1000 });

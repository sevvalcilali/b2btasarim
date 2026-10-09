import { useQuery } from "@tanstack/react-query";
import { getBalance, getPendingItems, getWeeklyVolume, getPanelSummary } from "@/lib/api/panel";
import { queryKeys } from "./keys";

export const usePanelSummary = (period = "bugun") =>
  useQuery({ queryKey: queryKeys.panelSummary(period), queryFn: ({ signal }) => getPanelSummary(period, signal) });

export const useWeeklyVolume = () => useQuery({ queryKey: queryKeys.weeklyVolume, queryFn: ({ signal }) => getWeeklyVolume(signal) });

export const useBalance = () => useQuery({ queryKey: queryKeys.balance, queryFn: ({ signal }) => getBalance(signal) });

// Menü rozetleri; onay / yükleme sonrası ilgili kancalar bu anahtarı yeniler
export const usePendingItems = () => useQuery({ queryKey: queryKeys.pendingItems, queryFn: ({ signal }) => getPendingItems(signal), staleTime: 60 * 1000 });

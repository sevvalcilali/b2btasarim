import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api/transactions";
import { queryKeys } from "./keys";

// Filtre değişince önceki liste ekranda kalır (placeholderData), yeni cevap gelince değişir: sekmeler titremez.
// option: React Query seçenekleri (ör. { enabled } — komut paleti yalnız arama yazılınca ister)
export const useTransactions = (filter, option = {}) =>
  useQuery({
    queryKey: queryKeys.transactions(filter),
    queryFn: ({ signal }) => getTransactions(filter, signal),
    placeholderData: keepPreviousData,
    ...option,
  });

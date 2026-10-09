import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/api/transactions";
import { queryKeys } from "./keys";

// Filtre değişince önceki liste ekranda kalır (placeholderData), yeni cevap gelince değişir: sekmeler titremez.
export const useTransactions = (filter) =>
  useQuery({
    queryKey: queryKeys.transactions(filter),
    queryFn: ({ signal }) => getTransactions(filter, signal),
    placeholderData: keepPreviousData,
  });

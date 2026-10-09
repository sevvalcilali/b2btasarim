import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { islemleriGetir } from "@/lib/api/transactions";
import { anahtar } from "./keys";

// Filtre değişince önceki liste ekranda kalır (placeholderData), yeni cevap gelince değişir: sekmeler titremez.
export const useIslemler = (filtre) =>
  useQuery({
    queryKey: anahtar.islemler(filtre),
    queryFn: ({ signal }) => islemleriGetir(filtre, signal),
    placeholderData: keepPreviousData,
  });

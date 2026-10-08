import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { islemleriGetir } from "@/lib/api/islemler";
import { anahtar } from "./anahtarlar";

// Filtre değişince önceki liste ekranda kalır (placeholderData), yeni cevap gelince değişir: sekmeler titremez.
export const useIslemler = (filtre) =>
  useQuery({
    queryKey: anahtar.islemler(filtre),
    queryFn: ({ signal }) => islemleriGetir(filtre, signal),
    placeholderData: keepPreviousData,
  });

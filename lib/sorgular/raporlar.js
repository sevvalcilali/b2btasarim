import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { bayiOzetiGetir } from "@/lib/api/raporlar";
import { anahtar } from "./anahtarlar";

export const useBayiOzeti = (filtre) =>
  useQuery({ queryKey: anahtar.bayiOzeti(filtre), queryFn: ({ signal }) => bayiOzetiGetir(filtre, signal), placeholderData: keepPreviousData });

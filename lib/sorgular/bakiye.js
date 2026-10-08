import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { bakiyeEkstresiGetir } from "@/lib/api/bakiye";
import { anahtar } from "./anahtarlar";

export const useBakiyeEkstresi = (filtre) =>
  useQuery({ queryKey: anahtar.bakiyeEkstresi(filtre), queryFn: ({ signal }) => bakiyeEkstresiGetir(filtre, signal), placeholderData: keepPreviousData });

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { bayiFaturaOzetiGetir, bayiOzetiGetir } from "@/lib/api/reports";
import { anahtar } from "./keys";

export const useBayiOzeti = (filtre) =>
  useQuery({ queryKey: anahtar.bayiOzeti(filtre), queryFn: ({ signal }) => bayiOzetiGetir(filtre, signal), placeholderData: keepPreviousData });

export const useBayiFaturaOzeti = (filtre) =>
  useQuery({ queryKey: anahtar.bayiFaturaOzeti(filtre), queryFn: ({ signal }) => bayiFaturaOzetiGetir(filtre, signal), placeholderData: keepPreviousData });

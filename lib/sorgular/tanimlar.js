import { useQuery } from "@tanstack/react-query";
import { firmaGetir } from "@/lib/api/firma";
import { uyeIsyerleriGetir, vadeFarkiProfilleriGetir } from "@/lib/api/tanimlar";
import { anahtar } from "./anahtarlar";

const UZUN = 10 * 60 * 1000; // tanımlar seyrek değişir

export const useVadeFarkiProfilleri = () =>
  useQuery({ queryKey: anahtar.vadeFarkiProfilleri, queryFn: ({ signal }) => vadeFarkiProfilleriGetir(signal), staleTime: UZUN });

export const useUyeIsyerleri = () => useQuery({ queryKey: anahtar.uyeIsyerleri, queryFn: ({ signal }) => uyeIsyerleriGetir(signal), staleTime: UZUN });

/** Oturum firmasının kendi kaydı (sınırlar, ortaklar) */
export const useFirma = () => useQuery({ queryKey: anahtar.firma, queryFn: ({ signal }) => firmaGetir(signal) });

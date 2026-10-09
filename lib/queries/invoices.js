import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { faturaHatirlat, faturaYukle, faturaYuklemeLinki, faturalariGetir } from "@/lib/api/invoices";
import { anahtar } from "./keys";

export const useFaturalar = (filtre) =>
  useQuery({ queryKey: anahtar.faturalar(filtre), queryFn: ({ signal }) => faturalariGetir(filtre, signal), placeholderData: keepPreviousData });

export const useFaturaYukle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: faturaYukle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: anahtar.faturalar() });
      qc.invalidateQueries({ queryKey: anahtar.bekleyenler });
    },
  });
};

export const useFaturaHatirlat = () => useMutation({ mutationFn: faturaHatirlat });

export const useFaturaYuklemeLinki = () => useMutation({ mutationFn: faturaYuklemeLinki });

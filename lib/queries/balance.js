import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bakiyeEkstresiGetir, bakiyeTopluOnizle, bakiyeTopluYukle } from "@/lib/api/balance";
import { anahtar } from "./keys";

export const useBakiyeEkstresi = (filtre) =>
  useQuery({ queryKey: anahtar.bakiyeEkstresi(filtre), queryFn: ({ signal }) => bakiyeEkstresiGetir(filtre, signal), placeholderData: keepPreviousData });

export const useBakiyeTopluOnizle = () => useMutation({ mutationFn: bakiyeTopluOnizle });

// Yükleme sonrası bayilerin ana sayfa bakiyesi ve ekstreleri yenilenir
export const useBakiyeTopluYukle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bakiyeTopluYukle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: anahtar.bakiye });
      qc.invalidateQueries({ queryKey: anahtar.bakiyeEkstresi() });
    },
  });
};

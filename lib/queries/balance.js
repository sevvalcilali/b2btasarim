import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBalanceStatement, previewBalanceBulk, uploadBalanceBulk } from "@/lib/api/balance";
import { queryKeys } from "./keys";

export const useBalanceStatement = (filter) =>
  useQuery({ queryKey: queryKeys.balanceStatement(filter), queryFn: ({ signal }) => getBalanceStatement(filter, signal), placeholderData: keepPreviousData });

export const usePreviewBalanceBulk = () => useMutation({ mutationFn: previewBalanceBulk });

// Yükleme sonrası bayilerin ana sayfa bakiyesi ve ekstreleri yenilenir
export const useUploadBalanceBulk = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadBalanceBulk,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.balance });
      qc.invalidateQueries({ queryKey: queryKeys.balanceStatement() });
    },
  });
};

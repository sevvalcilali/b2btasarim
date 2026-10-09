import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDealer, updateDealer, createDealer, addDealerBulk, previewDealerBulk, getDealers } from "@/lib/api/dealers";
import { createCustomer } from "@/lib/api/customers";
import { queryKeys } from "./keys";

export const useDealers = (filter, option = {}) =>
  useQuery({ queryKey: queryKeys.dealers(filter), queryFn: ({ signal }) => getDealers(filter, signal), placeholderData: keepPreviousData, ...option });

export const useDealer = (accountNo) =>
  useQuery({ queryKey: queryKeys.dealer(accountNo), queryFn: ({ signal }) => getDealer(accountNo, signal), enabled: !!accountNo });

// Bayi tanımı değişince: listeler, tekil kayıt, kendi firma kaydı (sınırlar) ve ödeme ekranlarının müşteri listeleri yenilenir
function refreshDealers(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.dealers() });
  qc.invalidateQueries({ queryKey: queryKeys.company });
  qc.invalidateQueries({ queryKey: queryKeys.customers() });
  qc.invalidateQueries({ queryKey: queryKeys.dealerSummary() });
  qc.invalidateQueries({ queryKey: queryKeys.dealerInvoiceSummary() });
}

export const useCreateDealer = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createDealer, onSuccess: () => refreshDealers(qc) });
};

export const useUpdateDealer = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ cariNo: accountNo, body }) => updateDealer(accountNo, body), onSuccess: () => refreshDealers(qc) });
};

export const usePreviewDealerBulk = () => useMutation({ mutationFn: previewDealerBulk });

export const useAddDealerBulk = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: addDealerBulk, onSuccess: () => refreshDealers(qc) });
};

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCustomer, onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers() }) });
};

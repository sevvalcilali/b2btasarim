import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPaymentLink, getPaymentLinks } from "@/lib/api/links";
import { getCustomers, getCollectionAccounts } from "@/lib/api/customers";
import { makePayment, getInstallmentOptions } from "@/lib/api/payments";
import { queryKeys } from "./keys";

export const useCustomers = (filter, option = {}) =>
  useQuery({ queryKey: queryKeys.customers(filter), queryFn: ({ signal }) => getCustomers(filter, signal), ...option });

export const useCollectionAccounts = () => useQuery({ queryKey: queryKeys.collectionAccounts, queryFn: ({ signal }) => getCollectionAccounts(signal), staleTime: 5 * 60 * 1000 });

// Tutar değişince önceki seçenekler yerinde kalır; yeni hesap gelince değişir (kartlar titremez)
export const useInstallmentOptions = (input) =>
  useQuery({
    queryKey: queryKeys.installmentOptions(input),
    queryFn: ({ signal }) => getInstallmentOptions(input, signal),
    enabled: !!input.musteriTuru,
    placeholderData: keepPreviousData,
  });

// Ödeme sonrası: işlem listeleri, panel özeti ve bekleyen faturalar yenilenir
export const useMakePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: makePayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions() });
      qc.invalidateQueries({ queryKey: ["panel"] });
      qc.invalidateQueries({ queryKey: queryKeys.invoices() });
    },
  });
};

export const usePaymentLinks = () => useQuery({ queryKey: queryKeys.paymentLinks(), queryFn: ({ signal }) => getPaymentLinks(signal) });

export const useCreatePaymentLink = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createPaymentLink, onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.paymentLinks() }) });
};

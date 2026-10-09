import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { remindInvoice, uploadInvoice, invoiceUploadLink, getInvoices } from "@/lib/api/invoices";
import { queryKeys } from "./keys";

export const useInvoices = (filter) =>
  useQuery({ queryKey: queryKeys.invoices(filter), queryFn: ({ signal }) => getInvoices(filter, signal), placeholderData: keepPreviousData });

export const useUploadInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices() });
      qc.invalidateQueries({ queryKey: queryKeys.pendingItems });
    },
  });
};

export const useRemindInvoice = () => useMutation({ mutationFn: remindInvoice });

export const useInvoiceUploadLink = () => useMutation({ mutationFn: invoiceUploadLink });

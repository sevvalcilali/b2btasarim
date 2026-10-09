import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDealerInvoiceSummary, getDealerSummary } from "@/lib/api/reports";
import { queryKeys } from "./keys";

export const useDealerSummary = (filter) =>
  useQuery({ queryKey: queryKeys.dealerSummary(filter), queryFn: ({ signal }) => getDealerSummary(filter, signal), placeholderData: keepPreviousData });

export const useDealerInvoiceSummary = (filter) =>
  useQuery({ queryKey: queryKeys.dealerInvoiceSummary(filter), queryFn: ({ signal }) => getDealerInvoiceSummary(filter, signal), placeholderData: keepPreviousData });

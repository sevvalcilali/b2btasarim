import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRequest, approveRequest, rejectRequest, getEligibleTransactions, getRequests } from "@/lib/api/requests";
import { queryKeys } from "./keys";

export const useRequests = (filter) =>
  useQuery({ queryKey: queryKeys.requests(filter), queryFn: ({ signal }) => getRequests(filter, signal), placeholderData: keepPreviousData });

export const useEligibleTransactions = (option = {}) =>
  useQuery({ queryKey: queryKeys.eligibleTransactions, queryFn: ({ signal }) => getEligibleTransactions(signal), ...option });

// Talep değişince: talep listeleri, uygun işlemler, menü rozetleri ve işlem listeleri (iptal/iade durumu) yenilenir
function refreshRequests(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.requests() });
  qc.invalidateQueries({ queryKey: queryKeys.pendingItems });
  qc.invalidateQueries({ queryKey: queryKeys.transactions() });
}

export const useCreateRequest = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createRequest, onSuccess: () => refreshRequests(qc) });
};

export const useApproveRequest = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: approveRequest, onSuccess: () => refreshRequests(qc) });
};

export const useRejectRequest = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ talepNo: requestNo, gerekce: reason }) => rejectRequest(requestNo, reason), onSuccess: () => refreshRequests(qc) });
};

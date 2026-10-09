import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCompany, updateCompanyContact } from "@/lib/api/company";
import { getMerchants, updateMaturityProfile, createMaturityProfile, getMaturityProfiles } from "@/lib/api/definitions";
import { queryKeys } from "./keys";

const LONG = 10 * 60 * 1000; // tanımlar seyrek değişir

export const useMaturityProfiles = () =>
  useQuery({ queryKey: queryKeys.maturityProfiles, queryFn: ({ signal }) => getMaturityProfiles(signal), staleTime: LONG });

// Profil değişince: profil listesi, bayi kayıtları (profil adı/oranı), ödeme ekranlarındaki taksit seçenekleri yenilenir
function refreshProfiles(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.maturityProfiles });
  qc.invalidateQueries({ queryKey: queryKeys.dealers() });
  qc.invalidateQueries({ queryKey: queryKeys.installmentOptions() });
  qc.invalidateQueries({ queryKey: queryKeys.dealerSummary() }); // vade farkı sütunu profil oranından
}

export const useCreateMaturityProfile = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createMaturityProfile, onSuccess: () => refreshProfiles(qc) });
};

export const useUpdateMaturityProfile = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }) => updateMaturityProfile(id, body), onSuccess: () => refreshProfiles(qc) });
};

export const useMerchants = () => useQuery({ queryKey: queryKeys.merchants, queryFn: ({ signal }) => getMerchants(signal), staleTime: LONG });

/** Oturum firmasının kendi kaydı (sınırlar, ortaklar) */
export const useCompany = () => useQuery({ queryKey: queryKeys.company, queryFn: ({ signal }) => getCompany(signal) });

// İletişim değişince kendi kaydı, oturum (kabuk) ve üst firmanın bayi listeleri yenilenir
export const useUpdateCompanyContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCompanyContact,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.company });
      qc.invalidateQueries({ queryKey: queryKeys.session });
      qc.invalidateQueries({ queryKey: queryKeys.dealers() });
    },
  });
};

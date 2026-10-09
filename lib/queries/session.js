import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { selectActiveMerchant, resetDemoData, getSession } from "@/lib/api/session";
import { queryKeys } from "./keys";

export const useSession = () =>
  useQuery({ queryKey: queryKeys.session, queryFn: ({ signal }) => getSession(signal), staleTime: 5 * 60 * 1000 });

// Cari seçimi oturuma yazılır; kabuk ve ödeme ekranları oturumdan okur
export const useSelectActiveMerchant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: selectActiveMerchant,
    onSuccess: (u) => {
      qc.setQueryData(queryKeys.session, (o) => (o ? { ...o, aktifUyeIsyeri: u } : o)); // seçim anında görünsün, geri sıçramasın
      qc.invalidateQueries({ queryKey: queryKeys.session });
    },
  });
};

// Demo verisini sıfırlar ve tüm önbelleği boşaltır; her ekran veriyi yeniden ister.
export const useResetDemoData = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: resetDemoData, onSuccess: () => qc.resetQueries() });
};

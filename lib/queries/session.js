import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aktifUyeIsyeriSec, demoVerisiniSifirla, oturumGetir } from "@/lib/api/session";
import { anahtar } from "./keys";

export const useOturum = () =>
  useQuery({ queryKey: anahtar.oturum, queryFn: ({ signal }) => oturumGetir(signal), staleTime: 5 * 60 * 1000 });

// Cari seçimi oturuma yazılır; kabuk ve ödeme ekranları oturumdan okur
export const useAktifUyeIsyeriSec = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: aktifUyeIsyeriSec,
    onSuccess: (u) => {
      qc.setQueryData(anahtar.oturum, (o) => (o ? { ...o, aktifUyeIsyeri: u } : o)); // seçim anında görünsün, geri sıçramasın
      qc.invalidateQueries({ queryKey: anahtar.oturum });
    },
  });
};

// Demo verisini sıfırlar ve tüm önbelleği boşaltır; her ekran veriyi yeniden ister.
export const useDemoVerisiniSifirla = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: demoVerisiniSifirla, onSuccess: () => qc.resetQueries() });
};

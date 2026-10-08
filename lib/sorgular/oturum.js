import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aktifUyeIsyeriSec, demoVerisiniSifirla, oturumGetir } from "@/lib/api/oturum";
import { anahtar } from "./anahtarlar";

export const useOturum = () =>
  useQuery({ queryKey: anahtar.oturum, queryFn: ({ signal }) => oturumGetir(signal), staleTime: 5 * 60 * 1000 });

// Cari seçimi oturuma yazılır; kabuk ve ödeme ekranları oturumdan okur
export const useAktifUyeIsyeriSec = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: aktifUyeIsyeriSec, onSuccess: () => qc.invalidateQueries({ queryKey: anahtar.oturum }) });
};

// Demo verisini sıfırlar ve tüm önbelleği boşaltır; her ekran veriyi yeniden ister.
export const useDemoVerisiniSifirla = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: demoVerisiniSifirla, onSuccess: () => qc.resetQueries() });
};

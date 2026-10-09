import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { odemeLinkiOlustur, odemeLinkleriGetir } from "@/lib/api/links";
import { musterileriGetir, tahsilatCarileriGetir } from "@/lib/api/customers";
import { odemeYap, taksitSecenekleriGetir } from "@/lib/api/payments";
import { anahtar } from "./keys";

export const useMusteriler = (filtre, secenek = {}) =>
  useQuery({ queryKey: anahtar.musteriler(filtre), queryFn: ({ signal }) => musterileriGetir(filtre, signal), ...secenek });

export const useTahsilatCarileri = () => useQuery({ queryKey: anahtar.tahsilatCarileri, queryFn: ({ signal }) => tahsilatCarileriGetir(signal), staleTime: 5 * 60 * 1000 });

// Tutar değişince önceki seçenekler yerinde kalır; yeni hesap gelince değişir (kartlar titremez)
export const useTaksitSecenekleri = (girdi) =>
  useQuery({
    queryKey: anahtar.taksitSecenekleri(girdi),
    queryFn: ({ signal }) => taksitSecenekleriGetir(girdi, signal),
    enabled: !!girdi.musteriTuru,
    placeholderData: keepPreviousData,
  });

// Ödeme sonrası: işlem listeleri, panel özeti ve bekleyen faturalar yenilenir
export const useOdemeYap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: odemeYap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: anahtar.islemler() });
      qc.invalidateQueries({ queryKey: ["panel"] });
      qc.invalidateQueries({ queryKey: anahtar.faturalar() });
    },
  });
};

export const useOdemeLinkleri = () => useQuery({ queryKey: anahtar.odemeLinkleri(), queryFn: ({ signal }) => odemeLinkleriGetir(signal) });

export const useOdemeLinkiOlustur = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: odemeLinkiOlustur, onSuccess: () => qc.invalidateQueries({ queryKey: anahtar.odemeLinkleri() }) });
};

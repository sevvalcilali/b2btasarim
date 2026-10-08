import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bayiGetir, bayiGuncelle, bayiOlustur, bayileriGetir } from "@/lib/api/bayiler";
import { musteriOlustur } from "@/lib/api/musteriler";
import { anahtar } from "./anahtarlar";

export const useBayiler = (filtre) =>
  useQuery({ queryKey: anahtar.bayiler(filtre), queryFn: ({ signal }) => bayileriGetir(filtre, signal), placeholderData: keepPreviousData });

export const useBayi = (cariNo) =>
  useQuery({ queryKey: anahtar.bayi(cariNo), queryFn: ({ signal }) => bayiGetir(cariNo, signal), enabled: !!cariNo });

// Bayi tanımı değişince: listeler, tekil kayıt, kendi firma kaydı (sınırlar) ve ödeme ekranlarının müşteri listeleri yenilenir
function bayiYenile(qc) {
  qc.invalidateQueries({ queryKey: anahtar.bayiler() });
  qc.invalidateQueries({ queryKey: anahtar.firma });
  qc.invalidateQueries({ queryKey: anahtar.musteriler() });
}

export const useBayiOlustur = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: bayiOlustur, onSuccess: () => bayiYenile(qc) });
};

export const useBayiGuncelle = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ cariNo, govde }) => bayiGuncelle(cariNo, govde), onSuccess: () => bayiYenile(qc) });
};

export const useMusteriOlustur = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: musteriOlustur, onSuccess: () => qc.invalidateQueries({ queryKey: anahtar.musteriler() }) });
};

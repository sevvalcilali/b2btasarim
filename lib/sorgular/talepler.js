import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { talepOlustur, talepOnayla, talepReddet, talepUygunIslemleriGetir, talepleriGetir } from "@/lib/api/talepler";
import { anahtar } from "./anahtarlar";

export const useTalepler = (filtre) =>
  useQuery({ queryKey: anahtar.talepler(filtre), queryFn: ({ signal }) => talepleriGetir(filtre, signal), placeholderData: keepPreviousData });

export const useTalepUygunIslemler = (secenek = {}) =>
  useQuery({ queryKey: anahtar.talepUygunIslemler, queryFn: ({ signal }) => talepUygunIslemleriGetir(signal), ...secenek });

// Talep değişince: talep listeleri, uygun işlemler, menü rozetleri ve işlem listeleri (iptal/iade durumu) yenilenir
function talepYenile(qc) {
  qc.invalidateQueries({ queryKey: anahtar.talepler() });
  qc.invalidateQueries({ queryKey: anahtar.bekleyenler });
  qc.invalidateQueries({ queryKey: anahtar.islemler() });
}

export const useTalepOlustur = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: talepOlustur, onSuccess: () => talepYenile(qc) });
};

export const useTalepOnayla = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: talepOnayla, onSuccess: () => talepYenile(qc) });
};

export const useTalepReddet = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ talepNo, gerekce }) => talepReddet(talepNo, gerekce), onSuccess: () => talepYenile(qc) });
};

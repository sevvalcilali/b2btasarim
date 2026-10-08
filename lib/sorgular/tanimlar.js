import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { firmaGetir, firmaIletisimGuncelle } from "@/lib/api/firma";
import { uyeIsyerleriGetir, vadeFarkiProfiliGuncelle, vadeFarkiProfiliOlustur, vadeFarkiProfilleriGetir } from "@/lib/api/tanimlar";
import { anahtar } from "./anahtarlar";

const UZUN = 10 * 60 * 1000; // tanımlar seyrek değişir

export const useVadeFarkiProfilleri = () =>
  useQuery({ queryKey: anahtar.vadeFarkiProfilleri, queryFn: ({ signal }) => vadeFarkiProfilleriGetir(signal), staleTime: UZUN });

// Profil değişince: profil listesi, bayi kayıtları (profil adı/oranı), ödeme ekranlarındaki taksit seçenekleri yenilenir
function profilYenile(qc) {
  qc.invalidateQueries({ queryKey: anahtar.vadeFarkiProfilleri });
  qc.invalidateQueries({ queryKey: anahtar.bayiler() });
  qc.invalidateQueries({ queryKey: anahtar.taksitSecenekleri() });
  qc.invalidateQueries({ queryKey: anahtar.bayiOzeti() }); // vade farkı sütunu profil oranından
}

export const useVadeFarkiProfiliOlustur = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: vadeFarkiProfiliOlustur, onSuccess: () => profilYenile(qc) });
};

export const useVadeFarkiProfiliGuncelle = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, govde }) => vadeFarkiProfiliGuncelle(id, govde), onSuccess: () => profilYenile(qc) });
};

export const useUyeIsyerleri = () => useQuery({ queryKey: anahtar.uyeIsyerleri, queryFn: ({ signal }) => uyeIsyerleriGetir(signal), staleTime: UZUN });

/** Oturum firmasının kendi kaydı (sınırlar, ortaklar) */
export const useFirma = () => useQuery({ queryKey: anahtar.firma, queryFn: ({ signal }) => firmaGetir(signal) });

// İletişim değişince kendi kaydı, oturum (kabuk) ve üst firmanın bayi listeleri yenilenir
export const useFirmaIletisimGuncelle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: firmaIletisimGuncelle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: anahtar.firma });
      qc.invalidateQueries({ queryKey: anahtar.oturum });
      qc.invalidateQueries({ queryKey: anahtar.bayiler() });
    },
  });
};

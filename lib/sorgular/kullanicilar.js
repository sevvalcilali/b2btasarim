import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kullaniciGuncelle, kullaniciOlustur, kullanicilariGetir } from "@/lib/api/kullanicilar";
import { anahtar } from "./anahtarlar";

export const useKullanicilar = (filtre) =>
  useQuery({ queryKey: anahtar.kullanicilar(filtre), queryFn: ({ signal }) => kullanicilariGetir(filtre, signal), placeholderData: keepPreviousData });

// Kullanıcı değişince liste ve (kendi kaydıysa ad / e-posta) oturum yenilenir
function kullaniciYenile(qc) {
  qc.invalidateQueries({ queryKey: anahtar.kullanicilar() });
  qc.invalidateQueries({ queryKey: anahtar.oturum });
}

export const useKullaniciOlustur = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: kullaniciOlustur, onSuccess: () => kullaniciYenile(qc) });
};

export const useKullaniciGuncelle = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ kullaniciId, govde }) => kullaniciGuncelle(kullaniciId, govde), onSuccess: () => kullaniciYenile(qc) });
};

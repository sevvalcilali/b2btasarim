import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { duyuruGuncelle, duyuruOkundu, duyuruOlustur, duyurulariGetir } from "@/lib/api/announcements";
import { anahtar } from "./keys";

export const useDuyurular = () => useQuery({ queryKey: anahtar.duyurular, queryFn: ({ signal }) => duyurulariGetir(signal), staleTime: 60 * 1000 });

// Duyuru ya da okunma değişince liste ve üst bardaki rozet (bekleyenler) yenilenir
function duyuruYenile(qc) {
  qc.invalidateQueries({ queryKey: anahtar.duyurular });
  qc.invalidateQueries({ queryKey: anahtar.bekleyenler });
}

export const useDuyuruOlustur = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: duyuruOlustur, onSuccess: () => duyuruYenile(qc) });
};

export const useDuyuruGuncelle = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ duyuruId, govde }) => duyuruGuncelle(duyuruId, govde), onSuccess: () => duyuruYenile(qc) });
};

export const useDuyuruOkundu = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: duyuruOkundu, onSuccess: () => duyuruYenile(qc) });
};

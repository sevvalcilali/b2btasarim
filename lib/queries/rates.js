import { useQuery } from "@tanstack/react-query";
import { kurlariGetir } from "@/lib/api/rates";
import { anahtar } from "./keys";

export const useKurlar = () => useQuery({ queryKey: anahtar.kurlar, queryFn: ({ signal }) => kurlariGetir(signal), staleTime: 5 * 60 * 1000 });

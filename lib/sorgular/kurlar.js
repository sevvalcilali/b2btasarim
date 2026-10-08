import { useQuery } from "@tanstack/react-query";
import { kurlariGetir } from "@/lib/api/kurlar";
import { anahtar } from "./anahtarlar";

export const useKurlar = () => useQuery({ queryKey: anahtar.kurlar, queryFn: ({ signal }) => kurlariGetir(signal), staleTime: 5 * 60 * 1000 });

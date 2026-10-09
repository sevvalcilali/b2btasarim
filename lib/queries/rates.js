import { useQuery } from "@tanstack/react-query";
import { getRates } from "@/lib/api/rates";
import { queryKeys } from "./keys";

export const useRates = () => useQuery({ queryKey: queryKeys.rates, queryFn: ({ signal }) => getRates(signal), staleTime: 5 * 60 * 1000 });

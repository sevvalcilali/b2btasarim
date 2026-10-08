import "@/styles/globals.css";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RoleProvider } from "@/components/RoleContext";
import { yeniSorguIstemcisi } from "@/lib/sorgular/saglayici";
import { SAHTE_BACKEND, hazirlikBekle } from "@/lib/api/istemci";
import { sahteBackendBaslat } from "@/mocks/baslat";

// Sahte backend açıkken ilk API isteği, servis çalışanı hazır olana kadar bekletilir.
if (typeof window !== "undefined" && SAHTE_BACKEND) hazirlikBekle(sahteBackendBaslat());

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(yeniSorguIstemcisi);
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <Component {...pageProps} />
      </RoleProvider>
    </QueryClientProvider>
  );
}

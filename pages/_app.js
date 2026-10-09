import "@/styles/globals.css";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RoleProvider } from "@/components/RoleContext";
import { createQueryClient } from "@/lib/queries/provider";
import { MOCK_BACKEND, waitUntilReady } from "@/lib/api/client";
import { startMockBackend } from "@/mocks/start";

// Sahte backend açıkken ilk API isteği, servis çalışanı hazır olana kadar bekletilir.
if (typeof window !== "undefined" && MOCK_BACKEND) waitUntilReady(startMockBackend());

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <Component {...pageProps} />
      </RoleProvider>
    </QueryClientProvider>
  );
}

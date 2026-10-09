import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ROLES } from "@/lib/roles";
import { kimlikAyarla } from "@/lib/api/client";

const RoleContext = createContext(null);

// Demo kimliği: seçili rol, API isteklerine "Bearer demo-<ROL>" olarak gider; sunucu rolü ve firmayı buradan çıkarır.
// Gerçek ortamda bu token giriş akışından gelir ve rol değiştirici gizlenir.
const demoToken = (role) => `demo-${role}`;

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(ROLES.ANA_FIRMA);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  // Kimlik, çocuk bileşenlerin ilk isteğinden önce hazır olsun diye render sırasında ayarlanır (idempotent).
  const sonRol = useRef(null);
  if (sonRol.current !== role) {
    sonRol.current = role;
    kimlikAyarla(demoToken(role));
  }

  // Persist the selected role so the mockup keeps it across navigation.
  // ?role=ana | bayi | altbayi in the URL overrides it (for shareable links).
  useEffect(() => {
    try {
      const fromUrl = { ana: ROLES.ANA_FIRMA, bayi: ROLES.BAYI, altbayi: ROLES.ALT_BAYI }[
        new URLSearchParams(window.location.search).get("role")
      ];
      const saved = localStorage.getItem("nkb-role");
      if (fromUrl) setRoleState(fromUrl);
      else if (saved && ROLES[saved]) setRoleState(saved);
    } catch (e) {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Rol değişince önbellek boşalır: her ekran veriyi yeni kimlikle yeniden ister.
  const ilk = useRef(true);
  useEffect(() => {
    if (ilk.current) {
      ilk.current = false;
      return;
    }
    queryClient.resetQueries();
  }, [role, queryClient]);

  const setRole = (next) => {
    setRoleState(next);
    try {
      localStorage.setItem("nkb-role", next);
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, ready }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

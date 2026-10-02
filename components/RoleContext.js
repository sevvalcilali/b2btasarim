import { createContext, useContext, useEffect, useState } from "react";
import { ROLES } from "@/lib/roles";

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(ROLES.ANA_FIRMA);
  const [ready, setReady] = useState(false);

  // Persist the selected role so the mockup keeps it across navigation.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nkb-role");
      if (saved && ROLES[saved]) setRoleState(saved);
    } catch (e) {
      /* ignore */
    }
    setReady(true);
  }, []);

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

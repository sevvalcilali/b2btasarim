import "@/styles/globals.css";
import { RoleProvider } from "@/components/RoleContext";

export default function App({ Component, pageProps }) {
  return (
    <RoleProvider>
      <Component {...pageProps} />
    </RoleProvider>
  );
}

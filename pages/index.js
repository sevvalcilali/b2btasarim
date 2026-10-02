import { useEffect } from "react";
import { useRouter } from "next/router";

// Entry point → send visitors to the login screen.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}

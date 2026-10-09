// Sahte backend'i (MSW servis çalışanı) tarayıcıda başlatır. Yalnızca NEXT_PUBLIC_API_MOCK "false" değilken çağrılır.
// Eşleşmeyen istekler (Next.js dosyaları, gerçek backend'e bağlanmış uçlar) dokunulmadan geçer; böylece servisler
// hazır oldukça tek tek gerçek backend'e alınabilir.
let startup = null;

export function startMockBackend() {
  if (typeof window === "undefined") return Promise.resolve();
  if (!startup) {
    startup = (async () => {
      const [{ setupWorker }, { handlers }] = await Promise.all([import("msw/browser"), import("./handlers")]);
      const worker = setupWorker(...handlers);
      await worker.start({
        onUnhandledRequest: "bypass",
        quiet: true,
        serviceWorker: { url: "/mockServiceWorker.js" },
      });
    })();
  }
  return startup;
}

// GET /panel/ozet · /panel/haftalik-hacim · /panel/bakiye
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { invoiceStatus, invoiceRequired, inScope, awaitingMyApproval } from "../rules";
import { unreadAnnouncements } from "./announcements";
import { latency, uc, authorized } from "./helpers";

const ITEMS = ["TOPLAM", "BASARILI", "BASARISIZ", "IPTAL", "IADE"];

export const panelHandlers = [
  http.get(uc("/panel/ozet"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const period = new URL(request.url).searchParams.get("donem") || "bugun";
    const summary = store.table("panelSummaries")[caller.firmaId];
    if (!summary) return HttpResponse.json({ donem: period, kalemler: Object.fromEntries(ITEMS.map((k) => [k, { adet: 0, tutarKurus: 0, degisimYuzde: 0 }])), basariOraniYuzde: 0, ortalamaIslemKurus: 0, seriler: {} });
    const items = Object.fromEntries(ITEMS.map((k) => [k, { adet: 0, tutarKurus: 0, degisimYuzde: 0, ...summary.bugun[k] }]));
    const total = items.TOPLAM;
    return HttpResponse.json({
      donem: period,
      kalemler: items,
      basariOraniYuzde: total.adet ? Math.round((items.BASARILI.adet / total.adet) * 1000) / 10 : 0,
      ortalamaIslemKurus: total.adet ? Math.round(total.tutarKurus / total.adet) : 0,
      seriler: summary.seriler || {},
    });
  }),

  http.get(uc("/panel/haftalik-hacim"), async ({ request }) => {
    await latency();
    const { cevap: response } = authorized(request);
    if (response) return response;
    const days = store.table("weeklyVolume");
    return HttpResponse.json({
      gunler: days,
      toplamKurus: days.reduce((a, g) => a + g.tutarKurus, 0),
      degisimYuzde: 12.4, // geçen haftaya göre — örnek veri
    });
  }),

  // Menü rozetleri: onayımda bekleyen talepler (s.8), faturası bekleyen kendi işlemleri (s.9), okunmamış duyuru (s.2)
  http.get(uc("/panel/bekleyenler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    return HttpResponse.json({
      onayBekleyenTalep: store.table("cancelRefundRequests").filter((t) => inScope(caller, t.girenId) && awaitingMyApproval(caller, t)).length,
      faturasiBekleyenIslem: store.table("transactions").filter((t) => t.cekimYapanId === caller.firmaId && invoiceRequired(t) && invoiceStatus(t.islemNo).durum !== "YUKLENDI").length,
      okunmamisDuyuru: unreadAnnouncements(caller).length,
    });
  }),

  // Şartname s.2: bayi "Ana Firma Bakiye ve Borç", alt bayi "Bayi Bakiye ve Borç" görür; ana firma kendi limitini
  http.get(uc("/panel/bakiye"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const b = store.table("balances")[caller.firmaId] || { bakiyeKurus: 0, borcKurus: 0, limitKurus: 0, kullanimYuzde: 0 };
    return HttpResponse.json({ ...b, gorunum: caller.rol === "ANA_FIRMA" ? "FIRMA_LIMITI" : "UST_CARI" });
  }),
];

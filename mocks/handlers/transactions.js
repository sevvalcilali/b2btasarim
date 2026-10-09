// GET /islemler — şartname s.7: müşteri türü, cari no, unvan, vergi no; rol kapsamı sunucuda
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { companySummary, includes, inScope, counters, paginate, dateRange } from "../rules";
import { latency, uc, authorized } from "./helpers";

const STATUSES = ["BASARILI", "BASARISIZ", "IPTAL", "IADE"];

/** Depodaki ham işlem → sözleşmedeki Islem cevabı */
export function transactionResponse(t) {
  return {
    islemNo: t.islemNo,
    tarih: t.tarih,
    cekimYapan: companySummary(t.cekimYapanId),
    musteriTuru: t.musteriTuru,
    musteri: t.musteri,
    kart: { son4: t.kartSon4 },
    odemeTipi: t.odemeTipi,
    taksit: t.taksit,
    tutarKurus: t.tutarKurus,
    durum: t.durum,
    uyeIsyeriCariNo: t.uyeIsyeriCariNo ?? null,
  };
}

/** Oturumun görebildiği işlemler, en yeniden eskiye */
export const scopedTransactions = (caller) =>
  store
    .table("transactions")
    .filter((t) => inScope(caller, t.cekimYapanId))
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));

export const transactionsHandlers = [
  http.get(uc("/islemler"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const s = new URL(request.url).searchParams;
    const status = s.get("durum");
    const customerKind = s.get("musteriTuru");
    const paymentType = s.get("odemeTipi");
    const q = (s.get("q") || "").trim();
    const companyId = s.get("firmaId"); // çekimi yapan firma (bayi detay paneli)
    const [sortField, sortDirection] = (s.get("sira") || "tarih:desc").split(":");
    const range = s.get("baslangic") || s.get("bitis") || s.get("donem") ? dateRange(s) : null; // verilmezse tüm geçmiş

    const source = scopedTransactions(caller);
    // durum dışındaki filtreler: durum sekmelerinin sayıları bunların üzerinden hesaplanır
    const candidates = source.filter(
      (t) =>
        (!companyId || t.cekimYapanId === companyId) &&
        (!range || range.icinde(t.tarih)) &&
        (!customerKind || t.musteriTuru === customerKind) &&
        (!paymentType || t.odemeTipi === paymentType) &&
        (!q || [t.islemNo, t.musteri.unvan, t.musteri.cariNo, t.musteri.vergiNo, t.kartSon4, companySummary(t.cekimYapanId)?.unvan].some((f) => includes(f, q)))
    );
    const list = candidates.filter((t) => !status || t.durum === status);
    // sıralama sunucuda (liste sayfalı): tarih, tutarKurus, islemNo
    const al = { tarih: (t) => t.tarih, tutarKurus: (t) => t.tutarKurus, islemNo: (t) => t.islemNo }[sortField] || ((t) => t.tarih);
    list.sort((a, b) => (al(a) < al(b) ? -1 : al(a) > al(b) ? 1 : 0) * (sortDirection === "asc" ? 1 : -1));
    const page = paginate(list, s);
    return HttpResponse.json({
      ...page,
      kayitlar: page.kayitlar.map(transactionResponse),
      sayaclar: counters(candidates, "durum", STATUSES),
      // filtreye uyan tüm kayıtların özeti (sayfadan bağımsız)
      ozet: {
        toplamKurus: list.reduce((a, t) => a + t.tutarKurus, 0),
        basariliKurus: list.filter((t) => t.durum === "BASARILI").reduce((a, t) => a + t.tutarKurus, 0),
      },
      // kapsamda görülen müşteri türleri (filtre listesi yalnızca bunları sunar)
      musteriTurleri: [...new Set(source.map((t) => t.musteriTuru))],
    });
  }),
];

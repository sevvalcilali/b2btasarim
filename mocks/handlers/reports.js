// GET /raporlar/bayi-ozet — şartname s.7: müşteri türü filtresi; işlem adet, tutar, vade farkı, hesaba geçecek rakam.
// Ana firma tüm bayi / alt bayileri, bayi kendisini ve alt bayilerini görür; alt bayinin özet raporu yoktur (403).
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { subDealersOf, invoiceStatus, invoiceRequired, company, companySummary, inScope, installmentCalc, dateRange } from "../rules";
import { latency, error, uc, authorized } from "./helpers";


/** İşlemin vade farkı: çekimi yapan firmanın profiliyle (ana firma bayiden çekimde o bayinin profili) */
function maturityDiff(t) {
  if (t.taksit <= 1) return 0;
  const actor = company(t.cekimYapanId);
  let profileId = actor?.vadeProfilId;
  if (actor?.tur === "ANA_FIRMA") {
    const dealer = t.musteriTuru === "BAYI" ? store.table("companies").find((f) => f.cariNo === t.musteri.cariNo) : null;
    profileId = dealer?.vadeProfilId || 1;
  }
  const profile = store.table("maturityProfiles").find((p) => p.id === profileId) || store.table("maturityProfiles")[0];
  return installmentCalc(t.tutarKurus, t.taksit, profile.oranYuzde).vadeFarkiKurus;
}

const EMPTY = () => ({ islemAdet: 0, basariliAdet: 0, basarisizAdet: 0, ciroKurus: 0, vadeFarkiKurus: 0, iptalIadeKurus: 0, hesabaGececekKurus: 0 });

function sumBy(summary, t) {
  summary.islemAdet += 1;
  if (t.durum === "BASARILI") {
    summary.basariliAdet += 1;
    summary.ciroKurus += t.tutarKurus;
    summary.vadeFarkiKurus += maturityDiff(t);
  } else if (t.durum === "BASARISIZ") summary.basarisizAdet += 1;
  else summary.iptalIadeKurus += t.tutarKurus; // IPTAL, IADE
  // DEMO VARSAYIMI: hesaba geçecek = başarılı ciro + vade farkı − iptal/iade (asıl hesabı backend belirleyecek)
  summary.hesabaGececekKurus = summary.ciroKurus + summary.vadeFarkiKurus - summary.iptalIadeKurus;
  return summary;
}

/** Rolün rapor satırı firmaları ve tarih aralığı (iki özet raporunda ortak) */
function reportScope(caller, s) {
  const range = dateRange(s);
  const companies =
    caller.rol === "ANA_FIRMA"
      ? store.table("companies").filter((f) => f.tur !== "ANA_FIRMA")
      : [company(caller.firmaId), ...subDealersOf(caller.firmaId)].filter(Boolean);
  return { aralik: range, firmalar: companies };
}
const rangeResponse = (a) => ({ baslangic: a.baslangic, bitis: a.bitis, gun: a.gun, onceki: { baslangic: a.onceki.baslangic, bitis: a.onceki.bitis } });

export const reportsHandlers = [
  // Şartname s.2 / s.9: bayi başına fatura durumu — gereken, yüklenen, bekleyen, reddedilen; bekleyen tutar
  http.get(uc("/raporlar/bayi-fatura-ozet"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    if (caller.rol === "ALT_BAYI") return error(403, "YETKI_YOK", "Alt bayinin fatura özet raporu yoktur; Fatura Yükleme Detay ekranını kullanın.");
    const { aralik: range, firmalar: companies } = reportScope(caller, new URL(request.url).searchParams);
    const scopedItems = store.table("transactions").filter((t) => inScope(caller, t.cekimYapanId) && invoiceRequired(t));
    const transactions = scopedItems.filter((t) => range.icinde(t.tarih));
    const empty = () => ({ gereken: 0, yuklenen: 0, bekleyen: 0, reddedilen: 0, bekleyenKurus: 0 });
    const sumBy = (o, t) => {
      const d = invoiceStatus(t.islemNo).durum;
      o.gereken += 1;
      if (d === "YUKLENDI") o.yuklenen += 1;
      else {
        if (d === "REDDEDILDI") o.reddedilen += 1;
        else o.bekleyen += 1;
        o.bekleyenKurus += t.tutarKurus;
      }
      return o;
    };
    const records = companies
      .map((f) => ({
        firma: companySummary(f.firmaId),
        bagli: f.bagliFirmaId ? companySummary(f.bagliFirmaId) : null,
        durum: f.durum,
        ...transactions.filter((t) => t.cekimYapanId === f.firmaId).reduce(sumBy, empty()),
      }))
      .sort((a, b) => b.bekleyen + b.reddedilen - (a.bekleyen + a.reddedilen) || b.gereken - a.gereken);
    return HttpResponse.json({
      aralik: rangeResponse(range),
      kayitlar: records,
      toplam: { ...transactions.reduce(sumBy, empty()), firmaAdet: records.length },
      onceki: scopedItems.filter((t) => range.onceki.icinde(t.tarih)).reduce(sumBy, empty()), // önceki döneme göre değişim için
    });
  }),

  http.get(uc("/raporlar/bayi-ozet"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    if (caller.rol === "ALT_BAYI") return error(403, "YETKI_YOK", "Alt bayinin özet raporu yoktur; işlem detaylarını kullanın.");
    const s = new URL(request.url).searchParams;
    const customerKind = s.get("musteriTuru");
    // rapor satırları: ana firma → bayiler + tüm alt bayiler; bayi → kendisi + alt bayileri
    const { aralik: range, firmalar: companies } = reportScope(caller, s);
    // yalnız rapor satırındaki firmaların çekimleri: ana firmanın kendi tahsilatı bayi özetine girmez (toplam = satırların toplamı)
    const rowCompanies = new Set(companies.map((f) => f.firmaId));
    const scopedItems = store.table("transactions").filter((t) => rowCompanies.has(t.cekimYapanId) && (!customerKind || t.musteriTuru === customerKind));
    const transactions = scopedItems.filter((t) => range.icinde(t.tarih));

    const records = companies
      .map((f) => {
        const summary = transactions.filter((t) => t.cekimYapanId === f.firmaId).reduce(sumBy, EMPTY());
        return { firma: companySummary(f.firmaId), bagli: f.bagliFirmaId ? companySummary(f.bagliFirmaId) : null, vadeProfil: f.vadeProfilId ? store.table("maturityProfiles").find((p) => p.id === f.vadeProfilId)?.ad.replace("Vade Farkı ", "") : null, durum: f.durum, ...summary };
      })
      .sort((a, b) => b.ciroKurus - a.ciroKurus);
    const total = transactions.reduce(sumBy, EMPTY());
    return HttpResponse.json({
      aralik: rangeResponse(range),
      kayitlar: records,
      toplam: { ...total, firmaAdet: records.length },
      onceki: scopedItems.filter((t) => range.onceki.icinde(t.tarih)).reduce(sumBy, EMPTY()),
      musteriTurleri: [...new Set(store.table("transactions").filter((t) => inScope(caller, t.cekimYapanId)).map((t) => t.musteriTuru))],
    });
  }),
];

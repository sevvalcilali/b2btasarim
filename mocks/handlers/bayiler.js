// GET/POST /bayiler · GET/PUT /bayiler/{cariNo} — şartname s.5 (bayi tanım yönetimi)
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { altBayileri, anaFirma, firma, firmaCevabi, icerir, kimlikHatalari, kosulHatalari, sayaclar } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

/** Rolün tanımlayıp düzenleyebildiği kayıtlar: ana firma → bayiler; bayi → kendi alt bayileri */
function yonetilenler(kim) {
  const hepsi = depo.tablo("firmalar");
  if (kim.rol === "ANA_FIRMA") return hepsi.filter((f) => f.tur === "BAYI");
  if (kim.rol === "BAYI") return altBayileri(kim.firmaId);
  return [];
}

/** Yeni kayıt için yetki ve tür kontrolü. Dönüş: hata cevabı ya da null */
function yetkiKontrolu(kim, tur) {
  if (kim.rol === "ANA_FIRMA" && tur === "BAYI") return null;
  if (kim.rol === "BAYI" && tur === "ALT_BAYI") {
    return firma(kim.firmaId)?.altBayiYetkisi ? null : hata(403, "ALT_BAYI_YETKISI_YOK", "Alt bayi tanımlama yetkiniz bulunmuyor. Bu yetki ana firmanın bayi tanımından açılır.");
  }
  return hata(403, "YETKI_YOK", "Bu türde kayıt tanımlama yetkiniz yok.");
}

const temizle = (g) => ({
  unvan: String(g.unvan || "").trim(),
  cariNo: String(g.cariNo || "").trim(),
  vergiNo: String(g.vergiNo || "").replace(/\D/g, ""),
  telefon: String(g.telefon || "").trim(),
  email: String(g.email || "").trim(),
  adres: String(g.adres || "").trim(),
});

export const bayilerHandlers = [
  http.get(uc("/bayiler"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const s = new URL(request.url).searchParams;
    const tur = s.get("tur") || (kim.rol === "BAYI" ? "ALT_BAYI" : "BAYI");
    const durum = s.get("durum");
    const q = (s.get("q") || "").trim();
    if (kim.rol === "ALT_BAYI") return hata(403, "YETKI_YOK", "Alt bayinin bayi tanımı yoktur.");
    if (kim.rol === "BAYI" && tur !== "ALT_BAYI") return hata(403, "YETKI_YOK", "Bayi yalnızca kendi alt bayilerini görür.");
    const kaynak = tur === "ALT_BAYI" && kim.rol === "ANA_FIRMA" ? depo.tablo("firmalar").filter((f) => f.tur === "ALT_BAYI") : yonetilenler(kim);
    const adaylar = kaynak.filter((f) => !q || [f.unvan, f.cariNo, f.vergiNo].some((x) => icerir(x, q)));
    const liste = adaylar.filter((f) => !durum || f.durum === durum);
    return HttpResponse.json({
      kayitlar: liste.map(firmaCevabi),
      toplam: liste.length,
      sayfa: 1,
      boyut: Math.max(liste.length, 1),
      sayaclar: sayaclar(adaylar, "durum", ["AKTIF", "PASIF"]),
      // ana firma ağdaki alt bayileri yalnızca görüntüler; tanımı bağlı bayi yapar
      duzenlenebilir: !(tur === "ALT_BAYI" && kim.rol === "ANA_FIRMA"),
    });
  }),

  http.get(uc("/bayiler/:cariNo"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const f = yonetilenler(kim).find((x) => x.cariNo === decodeURIComponent(params.cariNo));
    return f ? HttpResponse.json(firmaCevabi(f)) : hata(404, "BAYI_YOK", "Bayi bulunamadı ya da kapsamınızda değil.");
  }),

  http.post(uc("/bayiler"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const yetkiHatasi = yetkiKontrolu(kim, g.tur);
    if (yetkiHatasi) return yetkiHatasi;
    const kimlik = temizle(g);
    const ust = kim.rol === "BAYI" ? firma(kim.firmaId) : null;
    const alanlar = { ...kimlikHatalari(kimlik), ...kosulHatalari(g, ust) };
    if (alanlar.cariNo?.includes("başka bir kayıtta")) return hata(409, "CARI_CAKISMASI", alanlar.cariNo, { cariNo: alanlar.cariNo });
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const yeni = {
      firmaId: kimlik.cariNo,
      tur: g.tur,
      ...kimlik,
      vadeProfilId: g.vadeProfilId,
      taksitler: [...g.taksitler].sort((a, b) => a - b),
      islemLimitiKurus: g.islemLimitiKurus,
      ortaklar: [],
      bagliFirmaId: kim.rol === "ANA_FIRMA" ? anaFirma().firmaId : kim.firmaId,
      uyeIsyerleri: g.uyeIsyerleri,
      ...(g.tur === "BAYI" ? { altBayiYetkisi: !!g.altBayiYetkisi } : {}),
      durum: g.durum,
    };
    depo.guncelle("firmalar", (l) => [...l, yeni]);
    return HttpResponse.json(firmaCevabi(yeni), { status: 201 });
  }),

  http.put(uc("/bayiler/:cariNo"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const cariNo = decodeURIComponent(params.cariNo);
    const mevcut = yonetilenler(kim).find((x) => x.cariNo === cariNo);
    if (!mevcut) return hata(404, "BAYI_YOK", "Bayi bulunamadı ya da kapsamınızda değil.");
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const kimlik = { ...temizle(g), cariNo }; // cari no değiştirilemez
    const ust = kim.rol === "BAYI" ? firma(kim.firmaId) : null;
    const alanlar = { ...kimlikHatalari(kimlik, { mevcutCariNo: cariNo }), ...kosulHatalari(g, ust) };
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const guncel = depo.degistir("firmalar", "cariNo", cariNo, (f) => ({
      ...f,
      ...kimlik,
      vadeProfilId: g.vadeProfilId,
      taksitler: [...g.taksitler].sort((a, b) => a - b),
      islemLimitiKurus: g.islemLimitiKurus,
      uyeIsyerleri: g.uyeIsyerleri,
      ...(f.tur === "BAYI" ? { altBayiYetkisi: !!g.altBayiYetkisi } : {}),
      durum: g.durum,
    }));
    return HttpResponse.json(firmaCevabi(guncel));
  }),
];

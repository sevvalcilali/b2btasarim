// GET/POST /bayiler · GET/PUT /bayiler/{cariNo} · POST /bayiler/toplu(/onizleme) — şartname s.5 (bayi tanım yönetimi),
// s.2 / s.10 Excel ile toplu ekleme
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { altBayileri, anaFirma, firma, firmaCevabi, icerir, kimlikHatalari, kosulHatalari, sayaclar } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";
import { dosyadanCsv, tlCoz } from "../csv";

/** Rolün tanımlayıp düzenleyebildiği kayıtlar: ana firma → bayiler; bayi → kendi alt bayileri */
export function yonetilenler(kim) {
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

/** Toplu dosyanın bir satırı → BayiGirdisi; boş koşullar tanımlayanın kendi sınırlarıyla dolar */
function satirdanGirdi(s, kim, ust) {
  const taksitler = String(s.taksitler || "").trim()
    ? String(s.taksitler).split(/[,\s]+/).filter(Boolean).map(Number)
    : ust ? ust.taksitler : [1, 2, 3, 6, 9, 12];
  const limitKurus = tlCoz(s.islemlimititl ?? s.islemlimiti);
  return {
    tur: kim.rol === "ANA_FIRMA" ? "BAYI" : "ALT_BAYI",
    ...temizle({ unvan: s.unvan, cariNo: s.carino, vergiNo: s.vergino, telefon: s.telefon, email: s.email ?? s.eposta, adres: s.adres }),
    vadeProfilId: s.vadeprofilid ? Number(s.vadeprofilid) : ust?.vadeProfilId ?? 1,
    taksitler,
    islemLimitiKurus: limitKurus === null ? ust?.islemLimitiKurus ?? 15000000 : limitKurus,
    uyeIsyerleri: ust ? ust.uyeIsyerleri : depo.tablo("uyeIsyerleri").map((u) => u.cariNo),
    altBayiYetkisi: kim.rol === "ANA_FIRMA" ? /^(evet|e|1|true)$/i.test(String(s.altbayiyetkisi || "")) : undefined,
    durum: String(s.durum || "AKTIF").trim().toLocaleUpperCase("tr-TR") === "PASIF" ? "PASIF" : "AKTIF",
  };
}

/** Dosyayı okuyup her satırı doğrular; { cevap } (hata) ya da { satirlar } */
async function topluCoz(request, kim) {
  const yetkiHatasi = yetkiKontrolu(kim, kim.rol === "ANA_FIRMA" ? "BAYI" : "ALT_BAYI");
  if (yetkiHatasi) return { cevap: yetkiHatasi };
  const fd = await request.formData().catch(() => null);
  if (!fd) return { cevap: hata(400, "GECERSIZ_GOVDE", "Form verisi okunamadı.") };
  const okunan = await dosyadanCsv(fd);
  if (okunan.hata) return { cevap: kuralHatasi("DOSYA", okunan.hata, { dosya: okunan.hata }) };
  const zorunlu = ["unvan", "carino", "vergino", "telefon", "adres"];
  const eksik = zorunlu.filter((b) => !okunan.basliklar.includes(b));
  if (eksik.length) return { cevap: kuralHatasi("BASLIK", `Eksik sütun: ${eksik.join(", ")}. Şablonu kullanın.`, { dosya: `Eksik sütun: ${eksik.join(", ")}` }) };
  const ust = kim.rol === "BAYI" ? firma(kim.firmaId) : null;
  const gorulen = new Set();
  const satirlar = okunan.satirlar.map((s, i) => {
    const girdi = satirdanGirdi(s, kim, ust);
    const hatalar = { ...kimlikHatalari(girdi), ...kosulHatalari(girdi, ust) };
    if (!hatalar.cariNo && gorulen.has(girdi.cariNo)) hatalar.cariNo = "Dosyada aynı cari no birden çok kez var.";
    gorulen.add(girdi.cariNo);
    return { sira: i + 2, girdi, hatalar, gecerli: Object.keys(hatalar).length === 0 };
  });
  return { satirlar };
}

const topluOzet = (satirlar) => ({ toplam: satirlar.length, gecerli: satirlar.filter((s) => s.gecerli).length, hatali: satirlar.filter((s) => !s.gecerli).length, satirlar });

export const bayilerHandlers = [
  // Toplu ekleme önizlemesi: dosya doğrulanır, hiçbir kayıt yazılmaz
  http.post(uc("/bayiler/toplu/onizleme"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const { satirlar, cevap: hataCevabi } = await topluCoz(request, kim);
    return hataCevabi || HttpResponse.json(topluOzet(satirlar));
  }),

  // Toplu ekleme: geçerli satırlar kaydedilir, hatalılar atlanır (önizlemede görülmüş olur)
  http.post(uc("/bayiler/toplu"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const { satirlar, cevap: hataCevabi } = await topluCoz(request, kim);
    if (hataCevabi) return hataCevabi;
    const yeniler = satirlar
      .filter((s) => s.gecerli)
      .map(({ girdi: g }) => ({
        firmaId: g.cariNo,
        tur: g.tur,
        unvan: g.unvan,
        cariNo: g.cariNo,
        vergiNo: g.vergiNo,
        telefon: g.telefon,
        email: g.email,
        adres: g.adres,
        vadeProfilId: g.vadeProfilId,
        taksitler: [...g.taksitler].sort((a, b) => a - b),
        islemLimitiKurus: g.islemLimitiKurus,
        ortaklar: [],
        bagliFirmaId: kim.rol === "ANA_FIRMA" ? anaFirma().firmaId : kim.firmaId,
        uyeIsyerleri: g.uyeIsyerleri,
        ...(g.tur === "BAYI" ? { altBayiYetkisi: !!g.altBayiYetkisi } : {}),
        durum: g.durum,
      }));
    if (yeniler.length) depo.guncelle("firmalar", (l) => [...l, ...yeniler]);
    return HttpResponse.json({ ...topluOzet(satirlar), eklenen: yeniler.length, atlanan: satirlar.length - yeniler.length, kayitlar: yeniler.map(firmaCevabi) }, { status: 201 });
  }),

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

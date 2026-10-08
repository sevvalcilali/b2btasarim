// GET/POST /duyurular · PUT /duyurular/{id} · POST /duyurular/{id}/okundu — şartname s.2: ana firma duyuru girer,
// bayi / alt bayi ekranlarına pop-up düşer; "Okudum" kullanıcı bazında tutulur.
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { denetim, simdi } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

const HEDEFLER = ["BAYI", "ALT_BAYI"];
const okundu = (duyuruId, kullaniciId) => depo.tablo("duyuruOkumalari").some((o) => o.duyuruId === duyuruId && o.kullaniciId === kullaniciId);
const rolunDuyurulari = (kim) => depo.tablo("duyurular").filter((d) => d.durum === "YAYINDA" && d.hedef.includes(kim.rol));

/** Rozet: oturumdaki kullanıcının okumadığı yayındaki duyurular (ana firma hedef değildir) */
export const okunmamisDuyurular = (kim) => (kim.rol === "ANA_FIRMA" ? [] : rolunDuyurulari(kim).filter((d) => !okundu(d.duyuruId, kim.kullaniciId)));

function okunma(d) {
  const firmaTurleri = new Set(d.hedef);
  const hedefFirmalar = new Set(depo.tablo("firmalar").filter((f) => firmaTurleri.has(f.tur) && f.durum === "AKTIF").map((f) => f.firmaId));
  const hedefAdet = depo.tablo("kullanicilar").filter((k) => hedefFirmalar.has(k.firmaId) && k.durum === "AKTIF").length;
  return { hedefAdet, okuyanAdet: depo.tablo("duyuruOkumalari").filter((o) => o.duyuruId === d.duyuruId).length };
}

const yonetici = (kim) => kim.rol === "ANA_FIRMA" && kim.yetki === "YONETICI";

function duyuruHatalari(g) {
  const h = {};
  if (!g.baslik) h.baslik = "Başlık girin.";
  if (!g.icerik) h.icerik = "Duyuru metnini girin.";
  if (!g.hedef.length) h.hedef = "En az bir hedef seçin.";
  else if (g.hedef.some((r) => !HEDEFLER.includes(r))) h.hedef = "Hedef BAYI ya da ALT_BAYI olmalı.";
  if (!["YAYINDA", "ARSIV"].includes(g.durum)) h.durum = "Durum YAYINDA ya da ARSIV olmalı.";
  return h;
}

const temizle = (g) => ({ baslik: String(g.baslik ?? "").trim(), icerik: String(g.icerik ?? "").trim(), hedef: Array.isArray(g.hedef) ? [...new Set(g.hedef)] : [], durum: g.durum });

async function govdeOku(request, kim) {
  if (!yonetici(kim)) return { cevap: hata(403, "YETKI_YOK", "Duyuruyu yalnız ana firma Yöneticisi girer.") };
  const govde = await request.json().catch(() => null);
  if (!govde) return { cevap: hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.") };
  const g = temizle(govde);
  const alanlar = duyuruHatalari(g);
  return Object.keys(alanlar).length ? { cevap: kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar) } : { g };
}

export const duyurularHandlers = [
  http.get(uc("/duyurular"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const kayitlar =
      kim.rol === "ANA_FIRMA"
        ? depo.tablo("duyurular").map((d) => ({ ...d, okunma: okunma(d) }))
        : rolunDuyurulari(kim).map((d) => ({ ...d, okundu: okundu(d.duyuruId, kim.kullaniciId) }));
    return HttpResponse.json({ kayitlar: [...kayitlar].sort((a, b) => b.tarih.localeCompare(a.tarih)), duzenlenebilir: yonetici(kim) });
  }),

  http.post(uc("/duyurular"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const { g, cevap: hataCevabi } = await govdeOku(request, kim);
    if (hataCevabi) return hataCevabi;
    const sira = Math.max(0, ...depo.tablo("duyurular").map((d) => Number(d.duyuruId.slice(2)))) + 1;
    const yeni = { duyuruId: `D-${String(sira).padStart(3, "0")}`, ...g, tarih: simdi().slice(0, 10), olusturma: denetim(kim), sonDegisiklik: denetim(kim) };
    depo.ekle("duyurular", yeni);
    return HttpResponse.json({ ...yeni, okunma: okunma(yeni) }, { status: 201 });
  }),

  http.put(uc("/duyurular/:duyuruId"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (!depo.tablo("duyurular").some((d) => d.duyuruId === params.duyuruId)) return hata(404, "DUYURU_YOK", "Duyuru bulunamadı.");
    const { g, cevap: hataCevabi } = await govdeOku(request, kim);
    if (hataCevabi) return hataCevabi;
    const guncel = depo.degistir("duyurular", "duyuruId", params.duyuruId, (d) => ({ ...d, ...g, sonDegisiklik: denetim(kim) }));
    return HttpResponse.json({ ...guncel, okunma: okunma(guncel) });
  }),

  http.post(uc("/duyurular/:duyuruId/okundu"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    if (!rolunDuyurulari(kim).some((d) => d.duyuruId === params.duyuruId)) return hata(404, "DUYURU_YOK", "Duyuru bulunamadı ya da size hedeflenmemiş.");
    if (!okundu(params.duyuruId, kim.kullaniciId)) depo.ekle("duyuruOkumalari", { duyuruId: params.duyuruId, kullaniciId: kim.kullaniciId });
    return new HttpResponse(null, { status: 204 });
  }),
];

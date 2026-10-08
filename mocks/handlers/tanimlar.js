// GET/POST /vade-farki-profilleri · PUT /vade-farki-profilleri/{id} · GET /uye-isyerleri
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { firma, taksitHesabi } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkiGerekli, yetkili } from "./yardimci";

const PROFIL_SINIRI = 5; // şartname s.4: en çok 5 profil
const ORNEK = { tutarKurus: 1000000, taksit: 6 }; // ekrandaki örnek hesap: ₺10.000, 6 taksit

const kullananAktifBayiler = (id) => depo.tablo("firmalar").filter((f) => f.vadeProfilId === id && f.tur !== "ANA_FIRMA" && f.durum === "AKTIF");

/** Depodaki profil → sözleşmedeki VadeFarkiProfili (kullanım sayısı ve örnek hesap sunucuda) */
function profilCevabi(p) {
  return { ...p, kullananBayiSayisi: kullananAktifBayiler(p.id).length, ornek: { ...ORNEK, vadeFarkiKurus: taksitHesabi(ORNEK.tutarKurus, ORNEK.taksit, p.oranYuzde).vadeFarkiKurus } };
}

const kucult = (s) => String(s ?? "").trim().toLocaleLowerCase("tr-TR");

/** Profil girdisi doğrulama; mevcut (düzenlenen profil) ad çakışmasını ve aktiften pasife geçişi denetler */
function profilHatalari(g, mevcut) {
  const h = {};
  const mevcutId = mevcut?.id;
  const ad = String(g.ad ?? "").trim();
  if (!ad) h.ad = "Profil adı girin.";
  else if (depo.tablo("vadeFarkiProfilleri").some((p) => p.id !== mevcutId && kucult(p.ad) === kucult(ad))) h.ad = "Bu adda bir profil zaten var.";
  const oran = Number(g.oranYuzde);
  if (!(Number.isFinite(oran) && oran >= 0 && oran <= 10)) h.oranYuzde = "Aylık oran %0 ile %10 arasında olmalı.";
  if (!["AKTIF", "PASIF"].includes(g.durum)) h.durum = "Durum AKTIF ya da PASIF olmalı.";
  else if (g.durum === "PASIF" && mevcut && mevcut.durum !== "PASIF") {
    const n = kullananAktifBayiler(mevcutId).length;
    if (n) h.durum = `${n} aktif bayi bu profili kullanıyor; önce bayi tanımlarındaki profili değiştirin.`;
  }
  return h;
}

const temizle = (g) => ({ ad: String(g.ad).trim(), oranYuzde: Math.round(Number(g.oranYuzde) * 100) / 100, aciklama: String(g.aciklama ?? "").trim(), durum: g.durum });

export const tanimlarHandlers = [
  http.get(uc("/vade-farki-profilleri"), async ({ request }) => {
    await gecikme();
    const { cevap } = yetkili(request);
    if (cevap) return cevap;
    return HttpResponse.json({ kayitlar: depo.tablo("vadeFarkiProfilleri").map(profilCevabi), sinir: PROFIL_SINIRI });
  }),

  // Yalnız ana firma profil tanımlar (şartname s.4)
  http.post(uc("/vade-farki-profilleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const yetkiHatasi = yetkiGerekli(kim, "AYARLAR", ["ANA_FIRMA"]);
    if (yetkiHatasi) return yetkiHatasi;
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const profiller = depo.tablo("vadeFarkiProfilleri");
    if (profiller.length >= PROFIL_SINIRI) return kuralHatasi("PROFIL_SINIRI", `En çok ${PROFIL_SINIRI} vade farkı profili tanımlanabilir.`);
    const alanlar = profilHatalari(g);
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const yeni = { id: Math.max(0, ...profiller.map((p) => p.id)) + 1, ...temizle(g) };
    depo.guncelle("vadeFarkiProfilleri", (l) => [...l, yeni]);
    return HttpResponse.json(profilCevabi(yeni), { status: 201 });
  }),

  http.put(uc("/vade-farki-profilleri/:id"), async ({ request, params }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const yetkiHatasi = yetkiGerekli(kim, "AYARLAR", ["ANA_FIRMA"]);
    if (yetkiHatasi) return yetkiHatasi;
    const id = Number(params.id);
    const mevcut = depo.tablo("vadeFarkiProfilleri").find((p) => p.id === id);
    if (!mevcut) return hata(404, "PROFIL_YOK", "Profil bulunamadı.");
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const alanlar = profilHatalari(g, mevcut);
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const guncel = depo.degistir("vadeFarkiProfilleri", "id", id, (p) => ({ ...p, ...temizle(g) }));
    return HttpResponse.json(profilCevabi(guncel));
  }),

  // Bayi / alt bayi yalnızca kendisine açılan üye işyerlerini görür (şartname s.5)
  http.get(uc("/uye-isyerleri"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const hepsi = depo.tablo("uyeIsyerleri");
    const acik = kim.rol === "ANA_FIRMA" ? null : firma(kim.firmaId)?.uyeIsyerleri || [];
    return HttpResponse.json({ kayitlar: hepsi.filter((u) => !acik || acik.includes(u.cariNo)) });
  }),
];

// GET/POST /musteriler — oturum firmasının tanımlı (düzenli) müşterileri
import { http, HttpResponse } from "msw";
import { depo } from "../db/depo";
import { icerir, kimlikHatalari } from "../kurallar";
import { gecikme, hata, kuralHatasi, uc, yetkili } from "./yardimci";

export const musteriCevabi = (m) => ({ musteriId: m.musteriId, unvan: m.unvan, cariNo: m.cariNo, vergiNo: m.vergiNo, telefon: m.telefon, email: m.email, adres: m.adres || null, durum: m.durum });

export const musterilerHandlers = [
  http.get(uc("/musteriler"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const q = (new URL(request.url).searchParams.get("q") || "").trim();
    const liste = depo
      .tablo("musteriler")
      .filter((m) => m.sahipFirmaId === kim.firmaId && m.durum !== "PASIF" && (!q || [m.unvan, m.cariNo, m.vergiNo].some((x) => icerir(x, q))));
    return HttpResponse.json({ kayitlar: liste.map(musteriCevabi), toplam: liste.length, sayfa: 1, boyut: Math.max(liste.length, 1) });
  }),

  http.post(uc("/musteriler"), async ({ request }) => {
    await gecikme();
    const { kim, cevap } = yetkili(request);
    if (cevap) return cevap;
    const g = await request.json().catch(() => null);
    if (!g) return hata(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.");
    const alanlar = kimlikHatalari(g);
    if (alanlar.cariNo?.includes("başka bir kayıtta")) return hata(409, "CARI_CAKISMASI", alanlar.cariNo, { cariNo: alanlar.cariNo });
    if (Object.keys(alanlar).length) return kuralHatasi("DOGRULAMA", "Bazı alanlar hatalı.", alanlar);
    const n = depo.tablo("musteriler").length + 1;
    const yeni = {
      musteriId: `M-${String(n).padStart(3, "0")}`,
      sahipFirmaId: kim.firmaId,
      unvan: String(g.unvan).trim(),
      cariNo: g.cariNo,
      vergiNo: String(g.vergiNo).replace(/\D/g, ""),
      telefon: String(g.telefon).trim(),
      email: String(g.email).trim(),
      adres: String(g.adres || "").trim(),
      durum: "AKTIF",
    };
    depo.guncelle("musteriler", (l) => [...l, yeni]);
    return HttpResponse.json(musteriCevabi(yeni), { status: 201 });
  }),
];

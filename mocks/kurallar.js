// Sunucu tarafı kurallar — gerçek backend'in de uygulaması gereken iş mantığı, çalışan kod olarak.
// Şartname: s.3 yetki, s.5 bayi tanımı sınırları, s.7 rol kapsamı, s.8 onay zinciri, s.9 fatura.
import { depo } from "./db/depo";

/** Authorization: Bearer <token> → oturum kaydı, yoksa null. Demo tokenları: demo-<ROL>. */
export function oturum(request) {
  const yetki = request.headers.get("authorization") || "";
  const token = yetki.replace(/^Bearer\s+/i, "").trim();
  return depo.tablo("oturumlar")[token] || null;
}

export const firma = (firmaId) => depo.tablo("firmalar").find((f) => f.firmaId === firmaId) || null;
export const anaFirma = () => depo.tablo("firmalar").find((f) => f.tur === "ANA_FIRMA");
export const altBayileri = (firmaId) => depo.tablo("firmalar").filter((f) => f.tur === "ALT_BAYI" && f.bagliFirmaId === firmaId);

/** Firma özeti — cevaplarda "cekimYapan", "giren", "bagli" gibi alanlar bu biçimde döner */
export function firmaOzeti(firmaId) {
  const f = firma(firmaId);
  return f ? { firmaId: f.firmaId, unvan: f.unvan, tur: f.tur } : null;
}

/**
 * Oturumun görebildiği firmalar (şartname s.7): ana firma hepsini, bayi kendisini ve alt bayilerini,
 * alt bayi yalnızca kendisini görür.
 */
export function kapsam(kim) {
  if (kim.rol === "ANA_FIRMA") return null; // sınırsız
  const ids = new Set([kim.firmaId]);
  if (kim.rol === "BAYI") altBayileri(kim.firmaId).forEach((a) => ids.add(a.firmaId));
  return ids;
}
export const kapsamda = (kim, firmaId) => {
  const k = kapsam(kim);
  return k === null || k.has(firmaId);
};

/** Sayfalama: { kayitlar, toplam, sayfa, boyut } */
export function sayfala(liste, sorgu) {
  const sayfa = Math.max(1, Number(sorgu.get("sayfa")) || 1);
  const boyut = Math.min(200, Math.max(1, Number(sorgu.get("boyut")) || 50));
  return { kayitlar: liste.slice((sayfa - 1) * boyut, sayfa * boyut), toplam: liste.length, sayfa, boyut };
}

/** Durum sayaçları: { TUMU: n, <durum>: n … } */
export function sayaclar(liste, alan, kodlar) {
  const s = { TUMU: liste.length };
  for (const k of kodlar) s[k] = liste.filter((x) => x[alan] === k).length;
  return s;
}

/** Türkçe duyarsız metin araması */
export const icerir = (metin, aranan) => String(metin ?? "").toLocaleLowerCase("tr-TR").includes(String(aranan).toLocaleLowerCase("tr-TR"));

export const simdi = () => new Date().toISOString();

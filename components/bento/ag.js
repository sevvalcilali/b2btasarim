// Bayi ağı: paylaşılan bayi / alt bayi / müşteri deposu ve rol bazlı görünürlük kuralları.

import { useSyncExternalStore } from "react";
import { ROLES, ROLE_META } from "@/lib/roles";
import { islemler, anaFirma, vadeFarkiProfilleri, bayiler as ornekBayiler, altBayiler as ornekAltBayiler, musteriler as ornekMusteriler } from "@/lib/mockData";

// ---- bayi ağı deposu ---------------------------------------------------------------------------
// Bayi, alt bayi ve müşteri tanımları panel boyunca paylaşılır: Bayi Tanım'da yapılan değişiklik (ör. taksit sınırı,
// işlem limiti) ödeme ekranlarına da yansır. Sayfa yenilenince örnek veriye döner.
let ag = { bayiler: ornekBayiler, altBayiler: ornekAltBayiler, musteriler: ornekMusteriler };

const agDinleyicileri = new Set();

export const agDeposu = {
  al: () => ag,
  guncelle: (fn) => {
    ag = fn(ag);
    agDinleyicileri.forEach((d) => d());
  },
  abone: (d) => {
    agDinleyicileri.add(d);
    return () => agDinleyicileri.delete(d);
  },
};

export function useAg() {
  return useSyncExternalStore(agDeposu.abone, agDeposu.al, agDeposu.al);
}

// Şartname (Rapor): ana firma tüm bayi / alt bayi işlemlerini, bayi kendisinin ve alt bayilerinin,
// alt bayi yalnızca kendi işlemlerini görür. (Örnek veride alt bayiler Ankara Lastik Bayi'ye bağlıdır.)
export function kapsamda(role, yapan) {
  const firma = ROLE_META[role].company;
  if (role === ROLES.ANA_FIRMA) return true;
  if (role === ROLES.BAYI) return yapan === firma || agDeposu.al().altBayiler.some((a) => a.unvan === yapan && a.bagliBayi === firma);
  return yapan === firma;
}

export function rolIslemleri(role) {
  return islemler.filter((t) => kapsamda(role, t.yapan));
}

// Çekimi yapan firmanın ağdaki yeri
export function firmaTuru(ad) {
  if (ad === anaFirma.ad) return "Ana Firma";
  if (agDeposu.al().bayiler.some((b) => b.unvan === ad)) return "Bayi";
  return "Alt Bayi";
}

// Rolün kendi bayi / alt bayi kaydı: taksit sınırı, işlem limiti, vade profili, ortaklar
export function firmaKaydi(role) {
  const ad = ROLE_META[role].company;
  const { bayiler, altBayiler } = agDeposu.al();
  return bayiler.find((b) => b.unvan === ad) || altBayiler.find((b) => b.unvan === ad) || null;
}

// "Profil 2" → { ad: "Vade Farkı Profil 2", oran: 2.45 }
export function vadeProfili(kisaAd) {
  const p = vadeFarkiProfilleri.find((v) => v.ad.endsWith(kisaAd));
  return p ? { ad: p.ad, oran: Number(p.oran.replace("%", "").replace(",", ".")) } : null;
}

// Handler yardımcıları: adres kalıbı, hata cevabı, gerçekçi gecikme, oturum zorunluluğu.
import { HttpResponse, delay } from "msw";
import { YETKI_EKRANLARI, oturum } from "../rules";

// İstekler hangi adrese giderse gitsin (/api/v1 ya da tam adres) yakalanır.
export const uc = (yol) => `*/api/v1${yol}`;

/** { hata: { kod, mesaj, alanlar? } } + HTTP durumu — sözleşmedeki Hata şeması */
export const hata = (durum, kod, mesaj, alanlar) => HttpResponse.json({ hata: { kod, mesaj, ...(alanlar ? { alanlar } : {}) } }, { status: durum });

/** Ağ gecikmesi benzetimi: 150–450 ms (yükleniyor durumları görünür olsun diye) */
export const gecikme = () => delay(150 + Math.floor(Math.random() * 300));

/**
 * Oturumu doğrular. Dönüş: { kim } ya da { cevap } (401). Kullanım:
 *   const { kim, cevap } = yetkili(request); if (cevap) return cevap;
 */
export function yetkili(request) {
  const kim = oturum(request);
  return kim ? { kim } : { cevap: hata(401, "OTURUM_YOK", "Oturum bulunamadı. Yeniden giriş yapın.") };
}

/**
 * Yetki kontrolü (şartname s.3): roller verilmişse rol onlardan biri olmalı; kullanıcının yetkisi ekranı açmalı. Dönüş: 403 ya da null.
 *   const y = yetkiGerekli(kim, "BAYI_TANIM", ["ANA_FIRMA", "BAYI"]); if (y) return y;
 */
export function yetkiGerekli(kim, ekran, roller) {
  if (roller && !roller.includes(kim.rol)) return hata(403, "YETKI_YOK", "Bu işlem rolünüze kapalı.");
  if (!(YETKI_EKRANLARI[kim.yetki] || []).includes(ekran)) return hata(403, "YETKI_YOK", "Bu işlem için Yönetici yetkisi gerekir.");
  return null;
}

/** 422 — iş kuralı hatası; alanlar: { alanAdi: "mesaj" } forma düşer */
export const kuralHatasi = (kod, mesaj, alanlar) => hata(422, kod, mesaj, alanlar);

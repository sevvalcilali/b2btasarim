// Handler yardımcıları: adres kalıbı, hata cevabı, gerçekçi gecikme, oturum zorunluluğu.
import { HttpResponse, delay } from "msw";
import { PERMISSION_SCREENS, session } from "../rules";

// İstekler hangi adrese giderse gitsin (/api/v1 ya da tam adres) yakalanır.
export const uc = (path) => `*/api/v1${path}`;

/** { hata: { kod, mesaj, alanlar? } } + HTTP durumu — sözleşmedeki Hata şeması */
export const error = (status, code, message, fields) => HttpResponse.json({ hata: { kod: code, mesaj: message, ...(fields ? { alanlar: fields } : {}) } }, { status: status });

/** Ağ gecikmesi benzetimi: 150–450 ms (yükleniyor durumları görünür olsun diye) */
export const latency = () => delay(150 + Math.floor(Math.random() * 300));

/**
 * Oturumu doğrular. Dönüş: { kim } ya da { cevap } (401). Kullanım:
 *   const { kim, cevap } = yetkili(request); if (cevap) return cevap;
 */
export function authorized(request) {
  const caller = session(request);
  return caller ? { kim: caller } : { cevap: error(401, "OTURUM_YOK", "Oturum bulunamadı. Yeniden giriş yapın.") };
}

/**
 * Yetki kontrolü (şartname s.3): roller verilmişse rol onlardan biri olmalı; kullanıcının yetkisi ekranı açmalı. Dönüş: 403 ya da null.
 *   const y = yetkiGerekli(kim, "BAYI_TANIM", ["ANA_FIRMA", "BAYI"]); if (y) return y;
 */
export function requirePermission(caller, screen, roles) {
  if (roles && !roles.includes(caller.rol)) return error(403, "YETKI_YOK", "Bu işlem rolünüze kapalı.");
  if (!(PERMISSION_SCREENS[caller.yetki] || []).includes(screen)) return error(403, "YETKI_YOK", "Bu işlem için Yönetici yetkisi gerekir.");
  return null;
}

/** 422 — iş kuralı hatası; alanlar: { alanAdi: "mesaj" } forma düşer */
export const ruleError = (code, message, fields) => error(422, code, message, fields);

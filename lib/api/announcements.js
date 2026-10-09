// Duyuru uçları. Sözleşme: docs/api/openapi.yaml → /duyurular
import { istek } from "./client";

/** Ana firma: tüm duyurular + okunma; bayi / alt bayi: yayındaki hedefli duyurular + okundu */
export const duyurulariGetir = (sinyal) => istek("/duyurular", { sinyal });

/** @param {object} govde  DuyuruGirdisi (baslik, icerik, hedef: ["BAYI","ALT_BAYI"], durum) */
export const duyuruOlustur = (govde) => istek("/duyurular", { yontem: "POST", govde });

export const duyuruGuncelle = (duyuruId, govde) => istek(`/duyurular/${encodeURIComponent(duyuruId)}`, { yontem: "PUT", govde });

/** Pop-up kapatıldı: oturumdaki kullanıcı için okundu */
export const duyuruOkundu = (duyuruId) => istek(`/duyurular/${encodeURIComponent(duyuruId)}/okundu`, { yontem: "POST" });

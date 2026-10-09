// Duyuru uçları. Sözleşme: docs/api/openapi.yaml → /duyurular
import { apiRequest } from "./client";

/** Ana firma: tüm duyurular + okunma; bayi / alt bayi: yayındaki hedefli duyurular + okundu */
export const getAnnouncements = (signal) => apiRequest("/duyurular", { signal });

/** @param {object} govde  DuyuruGirdisi (baslik, icerik, hedef: ["BAYI","ALT_BAYI"], durum) */
export const createAnnouncement = (body) => apiRequest("/duyurular", { method: "POST", body });

export const updateAnnouncement = (announcementId, body) => apiRequest(`/duyurular/${encodeURIComponent(announcementId)}`, { method: "PUT", body });

/** Pop-up kapatıldı: oturumdaki kullanıcı için okundu */
export const markAnnouncementRead = (announcementId) => apiRequest(`/duyurular/${encodeURIComponent(announcementId)}/okundu`, { method: "POST" });

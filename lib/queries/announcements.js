import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateAnnouncement, markAnnouncementRead, createAnnouncement, getAnnouncements } from "@/lib/api/announcements";
import { queryKeys } from "./keys";

export const useAnnouncements = () => useQuery({ queryKey: queryKeys.announcements, queryFn: ({ signal }) => getAnnouncements(signal), staleTime: 60 * 1000 });

// Duyuru ya da okunma değişince liste ve üst bardaki rozet (bekleyenler) yenilenir
function refreshAnnouncements(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.announcements });
  qc.invalidateQueries({ queryKey: queryKeys.pendingItems });
}

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createAnnouncement, onSuccess: () => refreshAnnouncements(qc) });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ duyuruId: announcementId, body }) => updateAnnouncement(announcementId, body), onSuccess: () => refreshAnnouncements(qc) });
};

export const useMarkAnnouncementRead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: markAnnouncementRead, onSuccess: () => refreshAnnouncements(qc) });
};

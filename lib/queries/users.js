import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateUser, createUser, getUsers } from "@/lib/api/users";
import { queryKeys } from "./keys";

export const useUsers = (filter) =>
  useQuery({ queryKey: queryKeys.users(filter), queryFn: ({ signal }) => getUsers(filter, signal), placeholderData: keepPreviousData });

// Kullanıcı değişince liste ve (kendi kaydıysa ad / e-posta) oturum yenilenir
function refreshUsers(qc) {
  qc.invalidateQueries({ queryKey: queryKeys.users() });
  qc.invalidateQueries({ queryKey: queryKeys.session });
}

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createUser, onSuccess: () => refreshUsers(qc) });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ kullaniciId: userId, body }) => updateUser(userId, body), onSuccess: () => refreshUsers(qc) });
};

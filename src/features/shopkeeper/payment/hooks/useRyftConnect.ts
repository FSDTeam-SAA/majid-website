import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRyftConnectStatus,
  createRyftOnboardingLink,
  saveRyftAccount,
} from "../api/payments.api";

export function useRyftConnectStatus() {
  return useQuery({
    queryKey: ["ryft-connect-status"],
    queryFn: getRyftConnectStatus,
    staleTime: 30000,
  });
}

export function useCreateRyftOnboardingLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: { redirectUrl?: string }) =>
      createRyftOnboardingLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ryft-connect-status"] });
    },
  });
}

export function useSaveRyftAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { accountId: string; status?: string }) =>
      saveRyftAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ryft-connect-status"] });
    },
  });
}

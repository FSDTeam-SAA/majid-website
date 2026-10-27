"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRotaApi,
  saveRotaApi,
  publishRotaApi,
  copyLastWeekApi,
  IRotaResponse,
  IShiftItem,
} from "../api/rota.api";

export const ROTA_QUERY_KEYS = {
  all: ["rota"] as const,
  detail: (shopId: string, weekStartDate: string) =>
    [...ROTA_QUERY_KEYS.all, shopId, weekStartDate] as const,
};

export const useRota = (shopId: string, weekStartDate: string) => {
  return useQuery<IRotaResponse>({
    queryKey: ROTA_QUERY_KEYS.detail(shopId, weekStartDate),
    queryFn: () => getRotaApi({ shopId, weekStartDate }),
    enabled: Boolean(shopId && weekStartDate),
    staleTime: 30000,
  });
};

export const useSaveRota = (shopId: string, weekStartDate: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shifts: IShiftItem[]) =>
      saveRotaApi({
        shopId,
        weekStartDate,
        shifts,
        status: "draft",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ROTA_QUERY_KEYS.detail(shopId, weekStartDate),
      });
      toast.success("Rota draft saved successfully");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save rota draft";
      toast.error(msg);
    },
  });
};

export const usePublishRota = (shopId: string, weekStartDate: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishRotaApi({ shopId, weekStartDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ROTA_QUERY_KEYS.detail(shopId, weekStartDate),
      });
      toast.success("Weekly rota published! Staff can now see their shifts.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to publish rota";
      toast.error(msg);
    },
  });
};

export const useCopyLastWeek = (shopId: string, weekStartDate: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => copyLastWeekApi({ shopId, weekStartDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ROTA_QUERY_KEYS.detail(shopId, weekStartDate),
      });
      toast.success("Previous week's rota shifts copied successfully");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to copy last week's shifts";
      toast.error(msg);
    },
  });
};

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMonthlyWagesSummaryApi,
  getExceptionByIdApi,
  resolveExceptionApi,
  updatePayPeriodStageApi,
  exportWagesCsvApi,
  IPayPeriodSummary,
  IExceptionDetailResponse,
  TPayPeriodStage,
} from "../api/wages.api";

export const WAGES_QUERY_KEYS = {
  all: ["wages"] as const,
  summary: (shopId: string, month: number, year: number) =>
    [...WAGES_QUERY_KEYS.all, "summary", shopId, month, year] as const,
  exception: (id: string) =>
    [...WAGES_QUERY_KEYS.all, "exception", id] as const,
};

export const useWagesSummary = (
  shopId: string,
  month: number,
  year: number,
) => {
  return useQuery<IPayPeriodSummary>({
    queryKey: WAGES_QUERY_KEYS.summary(shopId, month, year),
    queryFn: () => getMonthlyWagesSummaryApi({ shopId, month, year }),
    enabled: Boolean(shopId),
    staleTime: 30000,
  });
};

export const useExceptionDetail = (exceptionId: string) => {
  return useQuery<IExceptionDetailResponse>({
    queryKey: WAGES_QUERY_KEYS.exception(exceptionId),
    queryFn: () => getExceptionByIdApi(exceptionId),
    enabled: Boolean(exceptionId),
    staleTime: 30000,
  });
};

export const useResolveException = (exceptionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      decision: "pay_actual" | "pay_scheduled" | "use_leave" | "unpaid_leave";
      managerReason: string;
      customPaidHours?: number;
    }) => resolveExceptionApi(exceptionId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WAGES_QUERY_KEYS.all });
      toast.success(data?.message || "Manager decision approved successfully!");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to record decision";
      toast.error(msg);
    },
  });
};

export const useUpdateStage = (shopId: string, month: number, year: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stage: TPayPeriodStage) =>
      updatePayPeriodStageApi({ shopId, month, year, stage }),
    onSuccess: (_, stage) => {
      queryClient.invalidateQueries({
        queryKey: WAGES_QUERY_KEYS.summary(shopId, month, year),
      });
      const stageLabels: Record<TPayPeriodStage, string> = {
        draft: "Draft calculation",
        exceptions_resolved: "Exceptions resolved",
        owner_approved: "Owner approved",
        locked: "Pay period locked and ready for payroll",
      };
      toast.success(`Workflow advanced: ${stageLabels[stage]}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update workflow stage";
      toast.error(msg);
    },
  });
};

export const useExportWages = () => {
  return useMutation({
    mutationFn: async ({
      shopId,
      month,
      year,
    }: {
      shopId: string;
      month: number;
      year: number;
    }) => {
      const blob = await exportWagesCsvApi(shopId, month, year);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payroll-wages-${year}-${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success("Payroll CSV exported successfully");
    },
    onError: () => {
      toast.error("Failed to export payroll CSV");
    },
  });
};

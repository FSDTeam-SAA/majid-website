import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addStockDelivery,
  adjustPartStock,
  confirmUseRepairPart,
  getCompatibleParts,
  getRepairPartMovements,
  getRepairParts,
  getSupplierComparison,
  releaseRepairPart,
  reserveRepairPart,
  returnRepairPart,
  searchCatalogue,
} from "../api/repairParts.api";
import { AddDeliveryInput, AdjustStockInput } from "../types";
import { toast } from "sonner";

export const useRepairParts = (params?: {
  shopId?: string;
  category?: string;
  brand?: string;
  modelName?: string;
  modelCode?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["repair-parts", params],
    queryFn: () => getRepairParts(params),
  });
};

export const useDeviceCatalogue = (params: {
  query?: string;
  brand?: string;
  deviceType?: string;
}) => {
  return useQuery({
    queryKey: ["repair-parts-catalogue", params],
    queryFn: () => searchCatalogue(params),
    staleTime: 1000 * 60 * 30, // 30 mins
  });
};

export const useCompatibleParts = (
  params: {
    shopId?: string;
    brand?: string;
    modelName?: string;
    modelCode?: string;
    issue?: string;
    category?: string;
    screenPlacement?: "Inner screen" | "Cover screen";
  },
  enabled = true
) => {
  return useQuery({
    queryKey: ["repair-parts-compatible", params],
    queryFn: () => getCompatibleParts(params),
    enabled: enabled && Boolean(params.brand || params.modelName || params.modelCode || params.issue),
  });
};

export const useAddStockDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddDeliveryInput) => addStockDelivery(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-parts"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-movements"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-compatible"] });
      toast.success("Stock delivery recorded successfully");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to record stock delivery"
      );
    },
  });
};

export const useAdjustPartStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdjustStockInput) => adjustPartStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-parts"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-movements"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-compatible"] });
      toast.success("Stock count adjusted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to adjust stock count");
    },
  });
};

export const useReserveRepairPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reserveRepairPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-parts"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-compatible"] });
      queryClient.invalidateQueries({ queryKey: ["repair-request"] });
      toast.success("Part reserved for repair job");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reserve part");
    },
  });
};

export const useConfirmUseRepairPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmUseRepairPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-parts"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-compatible"] });
      queryClient.invalidateQueries({ queryKey: ["repair-request"] });
      toast.success("Part fitted/used. Stock deducted.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to confirm part usage");
    },
  });
};

export const useReleaseRepairPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseRepairPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-parts"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-compatible"] });
      queryClient.invalidateQueries({ queryKey: ["repair-request"] });
      toast.success("Reservation released");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to release reservation");
    },
  });
};

export const useReturnRepairPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: returnRepairPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-parts"] });
      queryClient.invalidateQueries({ queryKey: ["repair-parts-compatible"] });
      queryClient.invalidateQueries({ queryKey: ["repair-request"] });
      toast.success("Unused part returned to stock");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to return part");
    },
  });
};

export const useRepairPartMovements = (params?: {
  shopId?: string;
  variantId?: string;
  repairRequestId?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: ["repair-parts-movements", params],
    queryFn: () => getRepairPartMovements(params),
  });
};

export const useSupplierComparison = (variantId?: string) => {
  return useQuery({
    queryKey: ["repair-parts-supplier-comparison", variantId],
    queryFn: () => (variantId ? getSupplierComparison(variantId) : null),
    enabled: Boolean(variantId),
  });
};

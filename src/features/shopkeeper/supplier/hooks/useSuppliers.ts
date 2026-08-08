import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveShopId } from "@/features/shopkeeper/shop/store/shopStorage";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSuppliers,
  updateSupplier,
} from "../api/supplier.api";
import type { SupplierInput, SupplierListParams } from "../types";

export const SUPPLIER_KEYS = {
  all: ["suppliers"] as const,
  list: (params: SupplierListParams, shopId?: string | null) =>
    [...SUPPLIER_KEYS.all, "list", params, shopId ?? ""] as const,
  detail: (id: string, shopId?: string | null) =>
    [...SUPPLIER_KEYS.all, "detail", id, shopId ?? ""] as const,
};

export function useSuppliers(params: SupplierListParams = {}) {
  const activeShopId = getActiveShopId();
  return useQuery({
    queryKey: SUPPLIER_KEYS.list(params, activeShopId),
    queryFn: () => getSuppliers(params),
  });
}

export function useSupplier(id?: string) {
  const activeShopId = getActiveShopId();
  return useQuery({
    queryKey: SUPPLIER_KEYS.detail(id || "", activeShopId),
    queryFn: () => getSupplier(id || ""),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SupplierInput) => createSupplier(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<SupplierInput>;
    }) => updateSupplier({ id, input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.all });
    },
  });
}

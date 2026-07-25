import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyInventory,
  getInventoryByCategory,
  getInventoryBySupplier,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createInventory,
  updateInventory,
  deleteInventory,
  createFromBarcode,
  createFromBarcodeBulk,
  createInvoice,
  getMyInvoiceHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersByShopkeeper,
  getShopkeeperCart,
  deleteCartItem,
  deleteAllShopkeeperCartItems,
  importCsvInventory,
} from "../api/inventory.api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  CreateFromBarcodeBulkInput,
  InvoiceHistoryResponse,
  CartListResponse,
  CategoryInput,
  CategoryListResponse,
  CustomersResponse,
} from "../types";

export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  myInventory: () => [...INVENTORY_KEYS.all, "my-inventory"] as const,
  byCategory: (categoryId: string) =>
    [...INVENTORY_KEYS.all, "category", categoryId] as const,
  bySupplier: (supplierId: string) =>
    [...INVENTORY_KEYS.all, "supplier", supplierId] as const,
  shopkeeperCart: (shopkeeperId: string) =>
    [...INVENTORY_KEYS.all, "shopkeeper-cart", shopkeeperId] as const,
};

export const CATEGORY_KEYS = {
  all: ["categories"] as const,
};

export function useMyInventory() {
  return useQuery({
    queryKey: INVENTORY_KEYS.myInventory(),
    queryFn: getMyInventory,
  });
}

export function useInventoryByCategory(categoryId?: string) {
  return useQuery({
    queryKey: INVENTORY_KEYS.byCategory(categoryId || ""),
    queryFn: () => getInventoryByCategory(categoryId || ""),
    enabled: !!categoryId,
  });
}

export function useInventoryBySupplier(supplierId?: string) {
  return useQuery({
    queryKey: INVENTORY_KEYS.bySupplier(supplierId || ""),
    queryFn: () => getInventoryBySupplier(supplierId || ""),
    enabled: !!supplierId,
  });
}

export function useCategories() {
  return useQuery<CategoryListResponse>({
    queryKey: CATEGORY_KEYS.all,
    queryFn: getCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      updateCategory({ id, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInventoryInput) => createInventory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInventoryInput }) =>
      updateInventory({ id, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useCreateFromBarcode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      code: string;
      userId: string;
      imeiNumber?: string;
      purchasePrice?: number;
      currentState?: string;
      image?: File;
      categoryId?: string;
    }) => createFromBarcode(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}
export const useCreateFromBarcodeBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFromBarcodeBulkInput) =>
      createFromBarcodeBulk(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
};

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      shopkeeperId: string;
      type: string;
      invoice: File;
      customerInfo?: string;
      itemsIds?: string[];
      dueAmount?: number;
      discountName?: string;
      discountPercentage?: number;
      discountAmount?: number;
    }) => createInvoice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useMyInvoiceHistory(id: string, enabled = true) {
  return useQuery<InvoiceHistoryResponse>({
    queryKey: [...INVENTORY_KEYS.myInventory(), id],

    queryFn: () => getMyInvoiceHistory(id),

    enabled: !!id && enabled,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      shopkeeperId: string;
      addedBy?: string;
      salesMethod?: string;
      actualSalePrice?: number;
    }) => createCustomer(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers", variables.shopkeeperId],
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
      shopkeeperId,
    }: {
      id: string;
      input: Record<string, unknown>;
      shopkeeperId: string;
    }) => updateCustomer({ id, input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers", variables.shopkeeperId],
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, shopkeeperId }: { id: string; shopkeeperId: string }) =>
      deleteCustomer(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customers", variables.shopkeeperId],
      });
    },
  });
}

export function useCustomersByShopkeeper(shopkeeperId: string) {
  return useQuery<CustomersResponse>({
    queryKey: ["customers", shopkeeperId],
    queryFn: () => getCustomersByShopkeeper(shopkeeperId),
    enabled: !!shopkeeperId,
  });
}

export function useShopkeeperCart(shopkeeperId?: string) {
  return useQuery<CartListResponse>({
    queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId || ""),
    queryFn: () => getShopkeeperCart(shopkeeperId || ""),
    enabled: !!shopkeeperId,
  });
}

export function useDeleteCartItem(shopkeeperId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => deleteCartItem(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId || ""),
      });
    },
  });
}

export function useDeleteAllShopkeeperCartItems(shopkeeperId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAllShopkeeperCartItems(shopkeeperId || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId || ""),
      });
    },
  });
}

export function useImportCsvInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { file: File; userId: string; categoryId?: string }) =>
      importCsvInventory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

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
  addToShopkeeperCart,
  deleteCartItem,
  deleteAllShopkeeperCartItems,
  importCsvInventory,
  searchBarcodeProducts,
} from "../api/inventory.api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  CreateFromBarcodeBulkInput,
  InvoiceHistoryResponse,
  CartItem,
  CartListResponse,
  InventoryItem,
  CategoryInput,
  CategoryListResponse,
  CustomersResponse,
} from "../types";

export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  myInventory: () => [...INVENTORY_KEYS.all, "my-inventory"] as const,
  barcodeSearch: (query: string) =>
    [...INVENTORY_KEYS.all, "barcode-search", query] as const,
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
    staleTime: 1000 * 60,
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

export function useBarcodeProductSearch(query?: string) {
  return useQuery({
    queryKey: INVENTORY_KEYS.barcodeSearch(query || ""),
    queryFn: () => searchBarcodeProducts(query || ""),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCategories() {
  return useQuery<CategoryListResponse>({
    queryKey: CATEGORY_KEYS.all,
    queryFn: getCategories,
    staleTime: 1000 * 60,
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
      images?: string[];
      categoryId?: string;
      sourceImageUrl?: string;
      sourceImageUrls?: string[];
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
      totalAmount?: number;
      dueAmount?: number;
      amountPaid?: number;
      tax?: number;
      paymentMethod?: string;
      paymentStatus?: "paid" | "partial" | "due";
      paymentDetails?: Record<string, string | number | undefined>;
      invoiceNumber?: string;
      currency?: string;
      orderDetails?: Record<string, string | undefined>;
      discountName?: string;
      discountPercentage?: number;
      discountAmount?: number;
      lineItems?: Array<{
        itemId: string;
        quantity: number;
        variantId?: string;
      }>;
    }) => createInvoice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    },
  });
}

export function useMyInvoiceHistory(
  id: string,
  enabled = true,
  page?: number,
  limit?: number,
) {
  return useQuery<InvoiceHistoryResponse>({
    queryKey: [...INVENTORY_KEYS.myInventory(), id, page, limit],

    queryFn: () => getMyInvoiceHistory(id, { page, limit }),

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
    mutationFn: ({ id }: { id: string; shopkeeperId: string }) =>
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
    staleTime: 1000 * 60,
  });
}

export function useShopkeeperCart(shopkeeperId?: string) {
  return useQuery<CartListResponse>({
    queryKey: INVENTORY_KEYS.shopkeeperCart(shopkeeperId || ""),
    queryFn: () => getShopkeeperCart(shopkeeperId || ""),
    enabled: !!shopkeeperId,
    staleTime: 1000 * 30,
  });
}

export function useAddToShopkeeperCart(shopkeeperId?: string) {
  const queryClient = useQueryClient();
  const queryKey = INVENTORY_KEYS.shopkeeperCart(shopkeeperId || "");

  return useMutation({
    mutationFn: ({
      item,
      quantity,
      variantId,
    }: {
      item: InventoryItem;
      quantity: number;
      variantId?: string;
    }) =>
      addToShopkeeperCart({
        shopkeeperId: shopkeeperId || "",
        itemId: item._id,
        quantity,
        variantId,
      }),
    onMutate: ({ item, quantity, variantId }) => {
      // Prevent an in-flight cart fetch from replacing this immediate update.
      void queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<CartListResponse>(queryKey);

      queryClient.setQueryData<CartListResponse>(queryKey, (currentCart) => {
        const currentItems = currentCart?.data || [];
        const existingItem = currentItems.find(
          (cartItem) =>
            cartItem.itemId?._id === item._id &&
            cartItem.variantId === variantId,
        );

        const data = existingItem
          ? currentItems.map((cartItem) =>
              cartItem.itemId?._id === item._id &&
              cartItem.variantId === variantId
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem,
            )
          : [
              {
                _id: `optimistic:${item._id}`,
                shopkeeperId: { _id: shopkeeperId } as CartItem["shopkeeperId"],
                itemId: item,
                quantity,
                variantId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...currentItems,
            ];

        return {
          success: currentCart?.success ?? true,
          message: currentCart?.message ?? "Cart item added",
          statusCode: currentCart?.statusCode ?? 200,
          data,
        };
      });

      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousCart);
    },
    onSuccess: (savedCartItem, { item }) => {
      queryClient.setQueryData<CartListResponse>(queryKey, (currentCart) => {
        if (!currentCart) {
          return {
            success: true,
            message: "Cart item added",
            statusCode: 200,
            data: [savedCartItem],
          };
        }

        const hasItem = currentCart.data.some(
          (cartItem) => cartItem.itemId?._id === item._id,
        );

        return {
          ...currentCart,
          data: hasItem
            ? currentCart.data.map((cartItem) =>
                cartItem.itemId?._id === item._id ? savedCartItem : cartItem,
              )
            : [savedCartItem, ...currentCart.data],
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
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

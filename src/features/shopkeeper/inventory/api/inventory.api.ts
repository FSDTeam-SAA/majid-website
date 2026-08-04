import { api } from "@/lib/api";
import type {
  CreateInventoryInput,
  UpdateInventoryInput,
  InventoryListResponse,
  CreateFromBarcodeBulkInput,
  CartItem,
  InvoiceHistoryResponse,
  CartListResponse,
  CategoryInput,
  CategoryListResponse,
  CategorySingleResponse,
  CustomersResponse,
} from "../types";

const BASE = "/inventory";
const CATEGORY_BASE = "/category";

export const getMyInventory = async (): Promise<InventoryListResponse> => {
  const response = await api.get(`${BASE}/my-inventory`);
  return response.data;
};

export const getInventoryByCategory = async (
  categoryId: string,
): Promise<InventoryListResponse> => {
  const response = await api.get(BASE, { params: { categoryId } });
  return response.data;
};

export const getInventoryBySupplier = async (
  supplierId: string,
): Promise<InventoryListResponse> => {
  const response = await api.get(BASE, { params: { supplierId } });
  return response.data;
};

export const getCategories = async (): Promise<CategoryListResponse> => {
  const response = await api.get(CATEGORY_BASE);
  return response.data;
};

export const createCategory = async (
  input: CategoryInput,
): Promise<CategorySingleResponse> => {
  const formData = new FormData();
  formData.append("name", input.name);

  if (input.image instanceof File) {
    formData.append("image", input.image);
  }

  const response = await api.post(CATEGORY_BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateCategory = async ({
  id,
  input,
}: {
  id: string;
  input: CategoryInput;
}): Promise<CategorySingleResponse> => {
  const formData = new FormData();
  formData.append("name", input.name);

  if (input.image instanceof File) {
    formData.append("image", input.image);
  }

  const response = await api.put(`${CATEGORY_BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`${CATEGORY_BASE}/${id}`);
  return response.data;
};

export const createInventory = async (input: CreateInventoryInput) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;

    if (key === "image" && value instanceof File) {
      formData.append(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    if (key !== "image") {
      formData.append(key, String(value));
    }
  }

  const response = await api.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const searchBarcodeProducts = async (query: string) => {
  const response = await api.get(`/barcode/search`, {
    params: { query },
  });
  return response.data;
};

export const updateInventory = async ({
  id,
  input,
}: {
  id: string;
  input: UpdateInventoryInput;
}) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;

    if (key === "image" && value instanceof File) {
      formData.append(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    if (key !== "image") {
      formData.append(key, String(value));
    }
  }

  const response = await api.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteInventory = async (id: string) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};
export const createFromBarcode = async (input: {
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
}) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "image" && value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.post(`${BASE}/create-from-barcode`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const createFromBarcodeBulk = async (
  input: CreateFromBarcodeBulkInput,
) => {
  const formData = new FormData();
  formData.append("userId", input.userId);
  if (input.categoryId) {
    formData.append("categoryId", input.categoryId);
  }
  input.barcodes.forEach((barcode, index) => {
    formData.append(`barcodes[${index}][code]`, barcode.code);
    formData.append(
      `barcodes[${index}][purchasePrice]`,
      String(barcode.purchasePrice),
    );
    formData.append(
      `barcodes[${index}][expectedPrice]`,
      String(barcode.expectedPrice),
    );
    if (barcode.supplierId)
      formData.append(`barcodes[${index}][supplierId]`, barcode.supplierId);
    formData.append(`barcodes[${index}][quantity]`, String(barcode.quantity));
    formData.append(`barcodes[${index}][currentState]`, barcode.currentState);
    if (barcode.color)
      formData.append(`barcodes[${index}][color]`, barcode.color);
    if (barcode.storage)
      formData.append(`barcodes[${index}][storage]`, barcode.storage);
    if (barcode.image)
      formData.append(`barcodes[${index}][image]`, barcode.image);
    const catId = barcode.categoryId || input.categoryId;
    if (catId) {
      formData.append(`barcodes[${index}][categoryId]`, catId);
    }
  });

  const response = await api.post(
    `${BASE}/create-from-barcode/bulk`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const createInvoice = async (input: {
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
}) => {
  const formData = new FormData();

  formData.append("shopkeeperId", input.shopkeeperId);
  formData.append("type", input.type);
  formData.append("invoice", input.invoice);

  if (input.customerInfo) formData.append("customerInfo", input.customerInfo);
  if (input.totalAmount !== undefined) {
    formData.append("totalAmount", String(input.totalAmount));
  }
  if (input.dueAmount !== undefined) {
    formData.append("dueAmount", String(input.dueAmount));
  }
  if (input.amountPaid !== undefined) {
    formData.append("amountPaid", String(input.amountPaid));
  }
  if (input.tax !== undefined) formData.append("tax", String(input.tax));
  if (input.paymentMethod) {
    formData.append("paymentMethod", input.paymentMethod);
  }
  if (input.paymentStatus) {
    formData.append("paymentStatus", input.paymentStatus);
  }
  if (input.paymentDetails) {
    formData.append("paymentDetails", JSON.stringify(input.paymentDetails));
  }
  if (input.invoiceNumber) {
    formData.append("invoiceNumber", input.invoiceNumber);
  }
  if (input.currency) formData.append("currency", input.currency);
  if (input.orderDetails) {
    formData.append("orderDetails", JSON.stringify(input.orderDetails));
  }
  if (input.discountName) formData.append("discountName", input.discountName);
  if (input.discountPercentage !== undefined) {
    formData.append("discountPercentage", String(input.discountPercentage));
  }
  if (input.discountAmount !== undefined) {
    formData.append("discountAmount", String(input.discountAmount));
  }
  if (input.itemsIds?.length) {
    input.itemsIds.forEach((id: string) => {
      formData.append("itemsIds", id);
    });
  }

  const response = await api.post(`/invoices/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getMyInvoiceHistory = async (
  id: string,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<InvoiceHistoryResponse> => {
  const response = await api.get(`/invoices/shopkeeper/${id}`, { params });

  return response.data;
};

export const createCustomer = async (input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  shopkeeperId: string;
  addedBy?: string;
  salesMethod?: string;
  actualSalePrice?: number;
}) => {
  const response = await api.post(`/customer/create`, input);
  return response.data;
};

export const updateCustomer = async ({
  id,
  input,
}: {
  id: string;
  input: Record<string, unknown>;
}) => {
  const response = await api.put(`/customer/update/${id}`, input);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await api.delete(`/customer/delete/${id}`);
  return response.data;
};

export const getCustomersByShopkeeper = async (
  shopkeeperId: string,
): Promise<CustomersResponse> => {
  const response = await api.get(`/customer/shopkeeper/${shopkeeperId}`);
  return response.data;
};

export const getShopkeeperCart = async (
  shopkeeperId: string,
): Promise<CartListResponse> => {
  const response = await api.get(`/add-to-cart/shopkeeper/${shopkeeperId}`);
  return response.data;
};

export const addToShopkeeperCart = async (input: {
  shopkeeperId: string;
  itemId: string;
  quantity: number;
}): Promise<CartItem> => {
  const response = await api.post(`/add-to-cart/create`, input);
  return response.data.data;
};

export const deleteCartItem = async (cartId: string) => {
  const response = await api.delete(`/add-to-cart/delete/${cartId}`);
  return response.data;
};

export const deleteAllShopkeeperCartItems = async (shopkeeperId: string) => {
  const response = await api.delete(
    `/add-to-cart/delete-all/shopkeeper/${shopkeeperId}`,
  );
  return response.data;
};

export const importCsvInventory = async (input: {
  file: File;
  userId: string;
  categoryId?: string;
}) => {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("userId", input.userId);
  if (input.categoryId) {
    formData.append("categoryId", input.categoryId);
  }

  const response = await api.post(`${BASE}/import-csv`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

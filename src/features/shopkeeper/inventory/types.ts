import { z } from "zod";

export const InventoryVariantSchema = z.object({
  _id: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  expectedPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  color: z.string().optional(),
  storage: z.string().optional(),
  imeiNumber: z.string().optional(),
  currentState: z.enum(["new", "good condition"]),
  supplierId: z.string().optional(),
  image: z
    .object({ public_id: z.string().optional(), url: z.string().optional() })
    .optional(),
  imageFile: z.any().optional(),
});

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const InventoryItemSchema = z.object({
  _id: z.string(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  sourceImageUrl: z.string().optional(),
  sourceImageUrls: z.array(z.string()).optional(),
  itemName: z.string(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  size: z.string().optional(),
  imeiNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  quantity: z.number().optional(),
  purchasePrice: z.number().optional(),
  expectedPrice: z.number(),
  productDetails: z.string().optional(),
  aiDescription: z.string().optional(),
  userId: z.any().optional(),
  supplierId: z.string().optional(),
  storeId: z.string().optional(),
  groupKey: z.string().optional(),
  minStockLevel: z.number().optional(),
  type: z.enum(["inventory", "sold"]).optional(),
  status: z.enum(["inventory", "sold"]).optional(),
  currentState: z.enum(["new", "good condition"]),
  image: z
    .object({
      public_id: z.string().optional(),
      url: z.string().optional(),
    })
    .optional()
    .nullable(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  salePrice: z.number().optional(),
  saleQuantity: z.number().optional(),
  saleMethod: z.string().optional(),
  shopkeeper: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Extended fields for website UI if needed
  specs: z
    .object({
      screen: z.string().optional(),
      battery: z.string().optional(),
      processor: z.string().optional(),
    })
    .optional(),
  variants: z.array(InventoryVariantSchema).optional(),
});

export const InventoryListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  statusCode: z.number(),
  data: z.array(InventoryItemSchema),
  meta: z
    .object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
      totalPages: z.number().optional(),
    })
    .optional(),
});

export const InventorySingleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  statusCode: z.number(),
  data: InventoryItemSchema,
});

export const CreateInventorySchema = z.object({
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  sourceImageUrl: z.string().optional(),
  sourceImageUrls: z.array(z.string()).optional(),
  itemName: z.string().min(1, "Item name is required"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  size: z.string().optional(),
  imeiNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  purchasePrice: z.coerce.number().optional(),
  expectedPrice: z.coerce
    .number()
    .min(0, "Expected price must be non-negative"),
  productDetails: z.string().optional(),
  aiDescription: z.string().optional(),
  supplierId: z.string().optional(),
  storeId: z.string().optional(),
  groupKey: z.string().optional(),
  minStockLevel: z.coerce.number().optional(),
  type: z.enum(["inventory", "sold"]),
  status: z.enum(["inventory", "sold"]),
  currentState: z.enum(["new", "good condition"]),
  userId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  salePrice: z.coerce.number().optional(),
  saleQuantity: z.coerce.number().optional(),
  saleMethod: z.string().optional(),
  image: z.any().optional(), // File or string for update
  variants: z.array(InventoryVariantSchema).optional(),
});

export const UpdateInventorySchema = z.object({
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  sourceImageUrl: z.string().optional(),
  sourceImageUrls: z.array(z.string()).optional(),
  itemName: z.string().min(1, "Item name is required").optional(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  size: z.string().optional(),
  quantity: z.coerce.number().min(1).optional(),
  purchasePrice: z.coerce.number().optional(),
  expectedPrice: z.coerce.number().min(0).optional(),
  productDetails: z.string().optional(),
  aiDescription: z.string().optional(),
  supplierId: z.string().optional(),
  storeId: z.string().optional(),
  groupKey: z.string().optional(),
  minStockLevel: z.coerce.number().optional(),
  type: z.enum(["inventory", "sold"]).optional(),
  status: z.enum(["inventory", "sold"]).optional(),
  currentState: z.enum(["new", "good condition"]).optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  salePrice: z.coerce.number().optional(),
  saleQuantity: z.coerce.number().optional(),
  saleMethod: z.string().optional(),
  image: z.any().optional(),
  variants: z.array(InventoryVariantSchema).optional(),
});

// ─── Sold Product Schemas ──────────────────────────────────────────────────

export const SoldProductSchema = z.object({
  _id: z.string(),
  itemName: z.string(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  size: z.string().optional(),
  imeiNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  quantity: z.number().optional(),
  purchasePrice: z.number().optional(),
  expectedPrice: z.number(),
  productDetails: z.string().optional(),
  aiDescription: z.string().optional(),
  userId: z.any().optional(),
  supplierId: z.string().optional(),
  storeId: z.string().optional(),
  groupKey: z.string().optional(),
  minStockLevel: z.number().optional(),
  type: z.enum(["inventory", "sold"]).optional(),
  status: z.enum(["inventory", "sold"]).optional(),
  currentState: z.enum(["new", "good condition"]).optional(),
  image: z
    .object({
      public_id: z.string().optional(),
      url: z.string().optional(),
    })
    .optional()
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SoldProductListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  statusCode: z.number(),
  data: z.array(SoldProductSchema),
});

export const CreateSoldProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  imeiNumber: z.string().min(1, "IMEI is required"),
  model: z.string().min(1, "Model is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  purchasePrice: z.coerce.number().min(0),
  expectedPrice: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0),
  remainingDue: z.coerce.number().min(0),
  dueDate: z.string().min(1, "Due date is required"),
  image: z.any().optional(),
});

export const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  image: z
    .union([
      z.string(),
      z.object({
        public_id: z.string().optional(),
        url: z.string().optional(),
      }),
    ])
    .optional()
    .nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CategoryListResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  statusCode: z.number().optional(),
  data: z.array(CategorySchema),
});

export const CategorySingleResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  statusCode: z.number().optional(),
  data: CategorySchema,
});

export const CategoryInputSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  image: z.any().optional(),
});

// ================= TYPES =================

export interface InvoiceFile {
  public_id: string;
  url: string;
  resource_type: string;
}

export interface Shopkeeper {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  shopName: string;
  phone: string;
  currency?: string;
  googleReviewPageUrl?: string;
}

export interface InvoiceHistoryItem {
  _id: string;
  invoice: InvoiceFile;
  shopkeeperId: Shopkeeper;
  type: string;
  customerInfo?: Partial<Customer> | string | null;
  itemsIds?: InventoryItem[];
  totalAmount?: number;
  dueAmount?: number;
  amountPaid?: number;
  tax?: number;
  paymentMethod?: "cash" | "card" | "bank" | "due" | string;
  paymentStatus?: "paid" | "partial" | "due";
  paymentDetails?: {
    amountReceived?: number;
    changeGiven?: number;
    cardholderName?: string;
    cardLastFour?: string;
    bankName?: string;
    accountLastFour?: string;
    transactionReference?: string;
    amountPaid?: number;
    dueAmount?: number;
    dueDate?: string;
    notes?: string;
  };
  invoiceNumber?: string;
  currency?: string;
  orderDetails?: {
    checkoutMode?: string;
    marketplace?: string;
    orderNumber?: string;
    deliveryFrom?: string;
    deliveryTo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceHistoryResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: InvoiceHistoryItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface CartItem {
  _id: string;
  shopkeeperId: Shopkeeper;
  itemId: InventoryItem;
  quantity: number;
  variantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartListResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: CartItem[];
}

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;
export type InventorySingleResponse = z.infer<
  typeof InventorySingleResponseSchema
>;
export type CreateInventoryInput = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;
export type CategorySingleResponse = z.infer<
  typeof CategorySingleResponseSchema
>;
export type CategoryInput = z.infer<typeof CategoryInputSchema>;

export type SoldProduct = z.infer<typeof SoldProductSchema>;
export type SoldProductListResponse = z.infer<
  typeof SoldProductListResponseSchema
>;
export type CreateSoldProductInput = z.infer<typeof CreateSoldProductSchema>;

export interface ScanResultData {
  itemName?: string;
  imeiNumber?: string;
}

export interface BulkBarcodeItem {
  code: string;
  purchasePrice: number;
  expectedPrice: number;
  supplierId: string;
  quantity: number;
  currentState: string;
  color: string;
  storage: string;
  image?: File | null;
  categoryId?: string;
}

export interface CreateFromBarcodeBulkInput {
  userId: string;
  barcodes: BulkBarcodeItem[];
  categoryId?: string;
}

export type Customer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  shopkeeperId: string;
  customerId?: string;
  alreadyPaid?: number;
  paymentType?: string;
  // optional fields
  salesMethod?: string;
  actualSalePrice?: number;

  createdAt: string;
  updatedAt: string;
};

export type CustomersResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: Customer[];
};

export type RepairPartCategory =
  | "Battery"
  | "Screen"
  | "Touch / Digitiser"
  | "Charging port"
  | "Back cover"
  | "Flex cable"
  | "Housing"
  | "Camera"
  | "Speaker"
  | "Vibration motor"
  | "Buttons"
  | "Other parts";

export type DeviceType = "Phone" | "Tablet" | "Laptop" | "Other";
export type PartQuality = "TFT" | "OLED" | "Compatible" | "Original";
export type MovementType =
  | "delivery"
  | "adjustment"
  | "reservation"
  | "release"
  | "used"
  | "return"
  | "transfer_out"
  | "transfer_in";

export interface DeviceCatalogItem {
  brand: string;
  deviceType: DeviceType | string;
  modelName: string;
  releaseYear: string;
  modelCode: string;
}

export interface RepairPartVariant {
  _id: string;
  shopkeeperId: string;
  category: RepairPartCategory;
  deviceType: DeviceType;
  brand: string;
  modelName: string;
  modelCode: string;
  releaseYear?: string;
  quality: PartQuality;
  sku: string;
  partName?: string;
  color?: string;
  size?: string;
  position?: "Front" | "Rear" | "Top" | "Bottom";
  buttonType?: "Volume up" | "Volume down" | "Power" | "Other";
  flexSubtype?: string;
  screenPlacement?: "Inner screen" | "Cover screen";
  sellingPrice: number;
  costPrice?: number;
  minStockLevel?: number;
  stock?: {
    onHand: number;
    reserved: number;
    available: number;
  };
  supplierComparison?: {
    cheapestSupplier?: {
      supplierName: string;
      costPrice: number;
      stamp?: string;
      date: string;
    };
    latestPurchase?: {
      supplierName: string;
      costPrice: number;
      stamp?: string;
      date: string;
    };
    pastPurchases?: Array<{
      supplierName: string;
      costPrice: number;
      stamp?: string;
      date: string;
      quantity: number;
    }>;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RepairPartMovement {
  _id: string;
  shopkeeperId: string;
  shopId: {
    _id: string;
    shopName: string;
    storeCode: string;
  };
  variantId: RepairPartVariant;
  type: MovementType;
  quantity: number;
  onHandBefore: number;
  onHandAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  costPrice?: number;
  sellingPrice?: number;
  supplierName?: string;
  supplierStamp?: string;
  reason?: string;
  repairRequestId?: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName?: string;
  };
  createdAt: string;
}

export interface AddDeliveryInput {
  variant: {
    category: RepairPartCategory;
    deviceType: DeviceType;
    brand: string;
    modelName: string;
    modelCode: string;
    releaseYear?: string;
    quality: PartQuality;
    sku?: string;
    partName?: string;
    color?: string;
    size?: string;
    position?: "Front" | "Rear" | "Top" | "Bottom";
    buttonType?: "Volume up" | "Volume down" | "Power" | "Other";
    flexSubtype?: string;
    screenPlacement?: "Inner screen" | "Cover screen";
    sellingPrice: number;
    costPrice?: number;
    minStockLevel?: number;
  };
  deliveryQuantity: number;
  costPrice: number;
  sellingPrice: number;
  supplierId?: string;
  supplierName?: string;
  supplierStamp?: string;
  minStockReminder?: number;
  allocations: Array<{
    shopId: string;
    quantity: number;
  }>;
}

export interface AdjustStockInput {
  variantId: string;
  shopId?: string;
  newQuantity: number;
  reason: string;
}

export interface CompatiblePartResponse {
  variant: RepairPartVariant;
  onHand: number;
  reserved: number;
  available: number;
  sellingPrice: number;
  costPrice?: number;
  supplierComparison?: {
    cheapestSupplier?: {
      supplierName: string;
      costPrice: number;
      stamp?: string;
      date: string;
    };
    latestPurchase?: {
      supplierName: string;
      costPrice: number;
      stamp?: string;
      date: string;
    };
    pastPurchases?: Array<{
      supplierName: string;
      costPrice: number;
      stamp?: string;
      date: string;
    }>;
  };
}

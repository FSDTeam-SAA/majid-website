export interface RiskMeter {
  riskLevel: string;
  score: number;
  label: string;
}

export interface MarketValue {
  amount: number;
  currency: string;
}

export interface AIInsight {
  title: string;
  message: string;
}

export interface CheckItem {
  title: string;
  description: string;
  status: "passed" | "warning" | "failed";
  [key: string]: unknown;
}

export interface TechnicalBreakdown {
  processor?: string;
  batteryHealth?: {
    percentage: number;
    cycleCount: number;
    label: string;
  };
  storage?: {
    total: string;
    free: string;
    label: string;
  };
  modem?: string;
  display?: string;
  warranty?: {
    status: string;
    label: string;
  };
  origin?: {
    country: string;
    modelNumber: string;
    label: string;
  };
  activation?: {
    lockStatus: string;
    simType: string;
    label: string;
  };
  [key: string]: unknown; // for additional fields
}

export interface IMEIResult {
  _id?: string;
  deviceName: string;
  imei: string;
  deviceStatus: string;
  riskMeter: RiskMeter;
  marketValue: MarketValue;
  aiInsight: AIInsight;
  checks: {
    globalBlacklist: CheckItem;
    carrierFinancing: CheckItem;
    hardwareLock: CheckItem;
    partAuthenticity: CheckItem;
  };
  technicalBreakdown: TechnicalBreakdown;
  reportActions: {
    smartInvoiceCreated: boolean;
    pdfCertificateUrl: string | null;
    isPdfGenerated: boolean;
  };
  providerData?: unknown;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  oldGenerated?: boolean;
}

// API Response item (each IMEI check result)
export interface IMEICheckItem {
  imei: string;
  ok: boolean;
  message: string;
  data: IMEIResult | null;
  cached?: boolean;
  serviceId?: number;
  provider?: string;
  rowNumber?: number;
}

// Main API Response for IMEI check (both single and multiple)
export interface IMEICheckApiResponse {
  success: boolean;
  message: string;
  data: IMEICheckItem[];
}

export interface IMEIService {
  _id: string;
  serviceId: number | null;
  name: string;
  price: string;
  priceLabel: string;
  category: string;
  isFree: boolean;
  normalizedName: string;
  currency: string;
}

export interface ServiceCategory {
  category: string;
  services: IMEIService[];
}

export interface ServiceListResponse {
  data: ServiceCategory[];
  meta: {
    totalServices: number;
    totalCategories: number;
  };
}

// ─── Batch IMEI Check Types (for BulkResultView) ───────────────────────────

export interface BatchImeiItemResult {
  rowNumber: number;
  imei: string;
  ok: boolean;
  message: string;
  cached?: boolean;
  serviceId?: number;
  provider?: string;
  data?: IMEIResult;
}

export interface BatchImeiSummary {
  total: number;
  successCount: number;
  failedCount: number;
  sourceFile?: string; // Optional for manual bulk check
}

export interface BatchImeiResponse {
  success: boolean;
  message?: string;
  summary: BatchImeiSummary;
  data: BatchImeiItemResult[];
}
export interface FavouriteProviderResults {
  description?: string;
  model?: string;
  image?: {
    src?: string;
    html?: string;
  };
  imei?: string;
  imei1?: string;
  imei2?: string;
  imei2_number?: string;
  deviceid?: string;
  full_name?: string;
  meid?: string;
  serial_number?: string;
  serial?: string;
  warranty_status?: string;
  warranty_until?: string;
  purchase_date?: string;
  estimated_purchase_date?: string;
  production_date?: string;
  replaced_device?: string;
  simlock?: string;
  simlock_status?: string;
  icloud_lock?: string;
  manufacturer?: string;
  marketing_name?: string;
  operating_system?: string;
  device_configuration?: string;
  model_name?: string;
  material_number?: string;
  basic_material?: string;
  eid?: string;
  applecare_description?: string;
  coverage_start_date?: string;
  coverage_end_date?: string;
  device_activation?: string;
  limited_warranty?: string;
  incidents_available?: string;
  simpolicy_unlock_status?: string;
  initial_activation_policy_description?: string;
  locked_carrier?: string;
  financing_status?: string;
  purchase_country?: string;
  icloud_status?: string;
  mdm_lock?: string;
  carrier?: string;
  model_number?: string;
  do_number?: string;
  sales_buyer_code?: string;
  sales_buyer_name?: string;
  sold_by_country?: string;
  ship_to_country?: string;
  sold_date?: string;
  ship_date?: string;
  knox_guard?: string;
  blacklist_status?: string;
  att_status?: string;
  error_r01?: string;
}

export interface FavouriteIMEIData {
  bundledServiceId: number;
  bundledServiceName: string;
  bundledServiceCategory?: string;
  providerResults: FavouriteProviderResults;
  riskMeter:
    | number
    | {
        score?: number;
        label?: string;
        riskLevel?: string;
      };
  aiInsight: {
    title?: string;
    message?: string;
  };
}

export interface FavouriteIMEIItem {
  imei: string;
  ok: boolean;
  message: string;
  data: FavouriteIMEIData;
}

export interface FavouriteIMEIResponse {
  success: boolean;
  message: string;
  data: FavouriteIMEIItem[];
}

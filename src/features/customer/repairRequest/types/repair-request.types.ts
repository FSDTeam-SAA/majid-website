export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  meta?: ApiMeta;
}

export interface Shopkeeper {
  _id: string;
  shopName: string;
  shopAddress: string;
  totalReviews: number;
  averageRating: number;
}

export interface RepairRequestPayload {
  firstName: string;
  email: string;
  phoneNumber: string;
  price: number;
  deviceModel: string;
  IMEINumber?: string;
  description: string;
  technician?: string;
  status?: string;
  images?: File[];
}

export type RepairRequestStatus =
  | "submitted"
  | "request_submitted"
  | "in_review"
  | "quote_sent"
  | "quote_accepted"
  | "quote_rejected"
  | "approved"
  | "rejected"
  | "repair_in_progress"
  | "completed"
  | "reassigned"
  | "quote-resent";

export interface ShopkeeperNote {
  _id?: string;
  message: string;
  date: string;
  cost?: number;
  estimatedDays?: number;
  status?: string;
  images?: { public_id: string; url: string }[];
}
export interface UserNote {
  _id?: string;
  message: string;
  date: string;
  cost?: number;
  estimatedDays?: number;
  status?: string;
}

export interface ShopkeeperNotePayload {
  message: string;
  date?: string;
  cost?: number;
  estimatedDays?: number;
  images?: File[];
}

export interface RepairRequest {
  technicianFeedback?: string;
  _id: string;
  shopkeeperId:
    | string
    | {
        _id?: string;
        shopName?: string;
        shopAddress?: string;
      };
  userId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName?: string;
        email?: string;
        phone?: string;
        location?: string;
      };
  firstName: string;
  email: string;
  phoneNumber?: string;
  price?: number;
  deviceModel: string;
  IMEINumber?: string;
  description: string;
  technician?: string;
  status: RepairRequestStatus;
  images?: { public_id: string; url: string }[];
  timeline?: unknown[];
  shopkeeperNotes?: ShopkeeperNote[];
  createdAt: string;
  updatedAt: string;
  userNotes?: UserNote[];
  waitingForPartsDays?: number;
  waitingForPartsDescription?: string;
}

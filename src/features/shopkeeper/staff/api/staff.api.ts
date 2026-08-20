import axiosInstance from "@/lib/instance/axios-instance";
import { api } from "@/lib/api";
import { ApiResponse } from "@/features/auth/types/auth.types";

export interface StaffUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  image?: {
    url?: string;
  } | null;
  isVerified?: boolean;
  wageType?: "per-day" | "per-hour";
  wageAmount?: number;
  workingDays?: string[];
  weekendDays?: string[];
  idVerificationStatus?: "pending" | "verified" | "rejected";
  idNumber?: string;
  shopId?: string | { _id: string; shopName: string; shopAddress?: string };
  shop?: { _id: string; shopName: string; shopAddress?: string };
  createdAt?: string;
}

export interface StaffCreationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  shopkeeperId: string;
  shopId?: string;
  wageType?: "per-day" | "per-hour";
  wageAmount?: number;
  workingDays?: string[];
  weekendDays?: string[];
  idVerificationStatus?: "pending" | "verified" | "rejected";
  idNumber?: string;
}

export interface StaffIdVerificationResponse {
  nidNumber: string;
  isValid: boolean;
  message: string;
  processingTime?: number;
}

export const getAllUsersApi = async (): Promise<ApiResponse<StaffUser[]>> => {
  const response = await api.get("/user/all-users");
  return response.data;
};

export const createStaffApi = async (payload: StaffCreationPayload) => {
  const response = await axiosInstance.post("/user/create-staff", payload);
  return response.data;
};

export const verifyStaffIdCardApi = async (payload: {
  frontFile: File;
  backFile?: File | null;
}): Promise<ApiResponse<StaffIdVerificationResponse>> => {
  const formData = new FormData();
  formData.append("nid_front", payload.frontFile);

  if (payload.backFile) {
    formData.append("nid_back", payload.backFile);
  }

  const response = await axiosInstance.post("/ocr/extract-nid", formData);
  return response.data;
};

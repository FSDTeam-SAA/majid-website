import { api } from "@/lib/api";
import {
  ApiResponse,
  RepairRequest,
  RepairRequestPayload,
  Shopkeeper,
} from "../types/repair-request.types";

export const getShopkeepers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  minRating?: number;
  maxRating?: number;
}): Promise<ApiResponse<Shopkeeper[]>> => {
  const response = await api.get("/user/shopkeeper", { params });
  return response.data;
};

export const createRepairRequest = async (
  payload: RepairRequestPayload,
): Promise<ApiResponse<RepairRequest>> => {
  const formData = new FormData();

  formData.append("firstName", payload.firstName);
  formData.append("email", payload.email);
  formData.append("phoneNumber", payload.phoneNumber);
  formData.append("price", payload.price.toString());
  formData.append("deviceModel", payload.deviceModel);
  formData.append("description", payload.description);

  if (payload.technician) {
    formData.append("technician", payload.technician);
  }

  if (payload.status) {
    formData.append("status", payload.status);
  }

  if (payload.IMEINumber) {
    formData.append("IMEINumber", payload.IMEINumber);
  }

  payload.images?.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post("/repair-requests/add", formData);
  return response.data;
};

export const getTechnicians = async (): Promise<ApiResponse<string[]>> => {
  const response = await api.get("/repair-requests/technicians");
  return response.data;
};

export const getMyRepairRequests = async (params?: {
  page?: number;
  limit?: number;
  readyForCollection?: boolean;
}): Promise<ApiResponse<RepairRequest[]>> => {
  const response = await api.get("/repair-requests/my-history", { params });
  return response.data;
};

export const getRepairRequestDetails = async (
  id: string,
): Promise<ApiResponse<RepairRequest>> => {
  const response = await api.get(`/repair-requests/${id}`);
  return response.data;
};

export const updateRepairQuoteStatus = async ({
  id,
  status,
  shopkeeperNotesId,
}: {
  id: string;
  status: "approved" | "rejected";
  shopkeeperNotesId?: string;
}): Promise<ApiResponse<RepairRequest>> => {
  const response = await api.put(`/repair-requests/quote-status/${id}`, {
    status,
    shopkeeperNotesId,
  });
  return response.data;
};

export const getShopkeeperRepairRequests = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<RepairRequest[]>> => {
  const response = await api.get("/repair-requests/shopkeepers-history", {
    params,
  });
  return response.data;
};

export const updateRepairRequestStatusByShopkeeper = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}): Promise<ApiResponse<RepairRequest>> => {
  const response = await api.put(`/repair-requests/update-status/${id}`, {
    status,
  });
  return response.data;
};

export const addRepairRequestNote = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    message: string;
    cost?: number;
    estimatedDays?: number;
    date?: string;
    images?: File[];
  };
}): Promise<ApiResponse<RepairRequest>> => {
  const formData = new FormData();
  formData.append("message", payload.message);
  if (payload.cost) formData.append("cost", payload.cost.toString());
  if (payload.estimatedDays)
    formData.append("estimatedDays", payload.estimatedDays.toString());
  if (payload.date) formData.append("date", payload.date);

  payload.images?.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.put(`/repair-requests/add-note/${id}`, formData);
  return response.data;
};

export const resentRepairRequestNote = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    message: string;
    cost?: number;
    estimatedDays?: number;
  };
}): Promise<ApiResponse<RepairRequest>> => {
  const response = await api.put(`/repair-requests/resent-quote/${id}`, {
    message: payload.message,
    cost: payload.cost,
    estimatedDays: payload.estimatedDays,
  });
  return response.data;
};

export const updateRepairReSentQuoteStatus = async ({
  id,
  status,
  waitingForPartsDays,
  waitingForPartsDescription,
}: {
  id: string;
  status:
    | "inProgress"
    | "quote_sent"
    | "approved"
    | "rejected"
    | "completed"
    | "inReview"
    | "start-work"
    | "waiting-for-parts"
    | "order-assigned"
    | "diagnosing";
  waitingForPartsDays?: number;
  waitingForPartsDescription?: string;
  userNotesId?: string;
}): Promise<ApiResponse<RepairRequest>> => {
  const response = await api.put(`/repair-requests/update-status/${id}`, {
    status,
    waitingForPartsDays,
    waitingForPartsDescription,
  });
  return response.data;
};

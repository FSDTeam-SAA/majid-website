/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/shopkeeper/scanDevice/api/scanDevice.api.ts

import axiosInstance from "@/lib/instance/axios-instance";
import { ApiResponse } from "@/features/auth/types/auth.types";
import {
  BatchImeiResponse,
  IMEICheckApiResponse,
  ServiceListResponse,
  FavouriteIMEIResponse,
} from "../types/scanDevice.types";

export interface ExtractImeiFromImageResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    rawText: string;
    imeiNumbers: string[];
    confidence: string;
    processingTime: number;
  };
}

export const checkIMEIApi = async (
  imei: string | string[],
  serviceId: number = 6,
  generateNew?: boolean, // নতুন প্যারামিটার যোগ করুন
): Promise<IMEICheckApiResponse> => {
  const payload: any = Array.isArray(imei)
    ? { imei, serviceId }
    : { imei, serviceId };

  // যদি generateNew true হয় তাহলে payload এ generate: "new" যোগ করবে
  if (generateNew) {
    payload.generate = "new";
  }

  console.log("📤 API Payload:", payload);

  const response = await axiosInstance.post("/imei/check-v2", payload);
  return response.data;
};

export const checkFavouriteIMEIApi = async (
  imei: string,
  serviceId: number,
  generateNew?: boolean,
): Promise<FavouriteIMEIResponse> => {
  const payload: any = { imei, serviceId };

  if (generateNew) {
    payload.generate = "new";
  }

  console.log("⭐ Favourite API Payload:", payload);

  const response = await axiosInstance.post("/imei/check-v2", payload);
  return response.data;
};

export const checkImeiBatchApi = async (
  file: File,
  serviceId: number = 6,
): Promise<BatchImeiResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("serviceId", String(serviceId));

  const response = await axiosInstance.post("/imei/check-batch", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const extractImeiFromImageApi = async (
  image: File,
): Promise<ExtractImeiFromImageResponse> => {
  const formData = new FormData();
  formData.append("image", image);

  const response = await axiosInstance.post("/ocr/extract-imei", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const saveImeiReportPdfApi = async (
  reportId: string,
  pdf: Blob,
): Promise<void> => {
  const formData = new FormData();
  formData.append("pdf", pdf, `IMEI-Report-${reportId}.pdf`);

  await axiosInstance.post(`/imei/history/${reportId}/pdf`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getServicesApi = async (): Promise<
  ApiResponse<ServiceListResponse["data"]>
> => {
  const response = await axiosInstance.get("/imei/services");
  return response.data;
};

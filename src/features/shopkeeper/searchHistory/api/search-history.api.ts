import { api } from "@/lib/api";
import {
  SearchHistoryParams,
  SearchHistoryReportResponse,
  SearchHistoryResponse,
} from "../types/search-history.types";

export const getSearchHistory = async (
  params?: SearchHistoryParams,
): Promise<SearchHistoryResponse> => {
  const response = await api.get("/imei/history", { params });
  return response.data;
};

export const getSearchHistoryReport = async (
  reportId: string,
): Promise<SearchHistoryReportResponse> => {
  const response = await api.get(`/imei/history/${reportId}`);
  return response.data;
};

export const getSearchHistoryReportPdf = async (
  reportId: string,
): Promise<Blob> => {
  const response = await api.get(`/imei/history/${reportId}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

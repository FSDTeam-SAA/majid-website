import { api } from "@/lib/api";
import {
  SendReviewRequestPayload,
  UpdateReviewStatusPayload,
  AttachCustomerPayload,
  ScoreReview,
} from "../types/scoreReview.types";

export const sendReviewRequest = async (
  invoiceId: string,
  payload: SendReviewRequestPayload,
): Promise<{ success: boolean; message: string; scoreReview: ScoreReview }> => {
  const response = await api.post(
    `/invoices/${invoiceId}/review-request`,
    payload,
  );
  return response.data;
};

export const updateReviewStatus = async (
  invoiceId: string,
  payload: UpdateReviewStatusPayload,
): Promise<{ success: boolean; message: string; scoreReview: ScoreReview }> => {
  const response = await api.patch(
    `/invoices/${invoiceId}/review-status`,
    payload,
  );
  return response.data;
};

export const attachCustomerToInvoice = async (
  invoiceId: string,
  payload: AttachCustomerPayload,
): Promise<{
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}> => {
  const response = await api.patch(`/invoices/${invoiceId}/customer`, payload);
  return response.data;
};

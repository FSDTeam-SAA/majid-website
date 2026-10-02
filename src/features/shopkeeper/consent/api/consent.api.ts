import axiosInstance from "@/lib/instance/axios-instance";
import {
  ApproveConsentPayload,
  ConsentRecord,
  RequestConsentPayload,
} from "../types/consent.types";

export const consentApi = {
  /**
   * Dispatches or creates a customer consent request
   */
  requestConsent: async (
    payload: RequestConsentPayload,
  ): Promise<ConsentRecord> => {
    const res = await axiosInstance.post("/consent/request", payload);
    return res.data?.data;
  },

  /**
   * Fetches latest consent record and status by ID or Reference
   */
  getConsentStatus: async (identifier: string): Promise<ConsentRecord> => {
    const res = await axiosInstance.get(`/consent/status/${identifier}`);
    return res.data?.data;
  },

  /**
   * Verifies 6-digit code
   */
  verifyCode: async (
    identifier: string,
    code: string,
  ): Promise<{ verified: boolean; status: string; reference?: string }> => {
    const res = await axiosInstance.post(`/consent/verify/${identifier}`, {
      code: code.trim(),
    });
    return res.data?.data;
  },

  /**
   * Customer/Shopkeeper confirms declarations and approves consent
   */
  approveConsent: async (
    identifier: string,
    payload: ApproveConsentPayload,
  ): Promise<{
    approved: boolean;
    status: string;
    reference: string;
    approvedAt: string;
    idImageDeleteAfter: string;
    message?: string;
  }> => {
    const res = await axiosInstance.post(
      `/consent/approve/${identifier}`,
      payload,
    );
    return res.data?.data;
  },

  /**
   * Resends verification code to customer
   */
  resendCode: async (
    identifier: string,
  ): Promise<{
    code?: string;
    secureLink?: string;
    maskedDestination?: string;
    emailSent?: boolean;
    expiresAt?: string;
  }> => {
    const res = await axiosInstance.post(`/consent/resend/${identifier}`);
    return res.data?.data;
  },

  /**
   * Declines consent
   */
  declineConsent: async (
    identifier: string,
  ): Promise<{ declined: boolean; status: string; reference: string }> => {
    const res = await axiosInstance.post(`/consent/decline/${identifier}`);
    return res.data?.data;
  },
};

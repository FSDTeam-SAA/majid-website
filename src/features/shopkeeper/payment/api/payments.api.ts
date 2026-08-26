import { api } from "@/lib/api";

export const getMyPayments = async () => {
  const response = await api.get("/payment/my-payments");
  return response.data;
};

export const createPaymentSession = async (data: {
  subscriptionId?: string;
  amount: number;
  currency?: string;
  paymentType?: string;
  shopId?: string;
  recipientUserId?: string;
  subAccountId?: string;
}) => {
  const response = await api.post("/payment/create-payment", data);
  return response.data;
};

// Ryft Connected-Account / Sub-Account Endpoints
export const getRyftConnectStatus = async () => {
  const response = await api.get("/payment/connect/status");
  return response.data;
};

export const createRyftOnboardingLink = async (data?: {
  redirectUrl?: string;
}) => {
  const response = await api.post("/payment/connect/onboard", data || {});
  return response.data;
};

export const saveRyftAccount = async (data: {
  accountId: string;
  status?: string;
}) => {
  const response = await api.post("/payment/connect/save-account", data);
  return response.data;
};

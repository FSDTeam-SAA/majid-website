import { api } from "@/lib/api";

export const getMyPayments = async () => {
  const response = await api.get("/payment/my-payments");
  return response.data;
};

export const createPaymentSession = async (data: {
  subscriptionId: string;
  amount: number;
  currency?: string;
}) => {
  const response = await api.post("/payment/create-payment", data);
  return response.data;
};

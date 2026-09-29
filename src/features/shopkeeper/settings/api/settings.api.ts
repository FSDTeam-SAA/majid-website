import { api } from "@/lib/api";
import { ProfileResponse, RepairProblemDescriptionsResponse } from "../types";

export const getMyProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get("/user/my-profile");
  return response.data;
};

export const updateProfile = async (
  data: FormData | Record<string, unknown>,
): Promise<ProfileResponse> => {
  const response = await api.put("/user/update-profile", data);
  return response.data;
};

export const changePassword = async (data: Record<string, unknown>) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};

export const getMyRepairProblem = async (
  userId: string,
): Promise<RepairProblemDescriptionsResponse> => {
  const response = await api.get(
    `/repair-requests/user/${userId}/descriptions`,
  );
  return response.data;
};

export const detectCurrency = async (): Promise<{
  success: boolean;
  data: { currency: string; symbol: string };
}> => {
  const response = await api.get("/location/currency");
  return response.data;
};

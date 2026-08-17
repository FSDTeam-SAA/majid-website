import { api } from "@/lib/api";
import type {
  CreatePopUpRuleInput,
  UpdatePopUpRuleInput,
  PopUpRulesListResponse,
  PopUpRuleSingleResponse,
  CheckoutRecommendationsResponse,
} from "../types";

const BASE = "/pop-up-rules";

export const getPopUpRules = async (
  params?: Record<string, unknown>,
): Promise<PopUpRulesListResponse> => {
  const response = await api.get(BASE, { params });
  return response.data;
};

export const createPopUpRule = async (
  input: CreatePopUpRuleInput,
): Promise<PopUpRuleSingleResponse> => {
  const response = await api.post(BASE, input);
  return response.data;
};

export const updatePopUpRule = async ({
  id,
  input,
}: {
  id: string;
  input: UpdatePopUpRuleInput;
}): Promise<PopUpRuleSingleResponse> => {
  const response = await api.put(`${BASE}/${id}`, input);
  return response.data;
};

export const deletePopUpRule = async (id: string) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};

export const getCheckoutRecommendations = async (
  categoryIds: string[],
): Promise<CheckoutRecommendationsResponse> => {
  const response = await api.post(`${BASE}/recommendations`, { categoryIds });
  return response.data;
};

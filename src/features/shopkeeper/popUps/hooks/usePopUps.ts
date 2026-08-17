import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPopUpRules,
  createPopUpRule,
  updatePopUpRule,
  deletePopUpRule,
  getCheckoutRecommendations,
} from "../api/popUps.api";
import type { CreatePopUpRuleInput, UpdatePopUpRuleInput } from "../types";

export const usePopUpRules = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["popUpRules", params],
    queryFn: () => getPopUpRules(params),
  });
};

export const useCreatePopUpRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePopUpRuleInput) => createPopUpRule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popUpRules"] });
    },
  });
};

export const useUpdatePopUpRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePopUpRuleInput }) =>
      updatePopUpRule({ id, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popUpRules"] });
    },
  });
};

export const useDeletePopUpRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePopUpRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popUpRules"] });
    },
  });
};

export const useCheckoutRecommendations = (categoryIds: string[]) => {
  return useQuery({
    queryKey: ["checkoutRecommendations", categoryIds],
    queryFn: () => getCheckoutRecommendations(categoryIds),
    enabled: categoryIds.length > 0,
  });
};

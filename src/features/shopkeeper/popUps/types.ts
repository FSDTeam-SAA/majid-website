import type {
  Category,
  InventoryItem,
} from "@/features/shopkeeper/inventory/types";

export interface RecommendedItem {
  itemType: "category" | "inventory";
  itemId: string;
}

export interface PopUpRuleItem {
  itemType: "category" | "inventory";
  itemId:
    | {
        _id?: string;
        name?: string;
        itemName?: string;
      }
    | string;
}

export interface PopUpRule {
  _id: string;
  categoryId: {
    _id: string;
    name: string;
  };
  recommendedItems: PopUpRuleItem[];
  trigger: string;
  status: "active" | "inactive";
  autoPopupReminder: boolean;
  shopkeeperId: string;
  shopId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePopUpRuleInput {
  categoryId: string;
  recommendedItems: RecommendedItem[];
  trigger?: string;
  status?: "active" | "inactive";
  autoPopupReminder?: boolean;
}

export type UpdatePopUpRuleInput = Partial<CreatePopUpRuleInput>;

export interface PopUpRulesListResponse {
  success: boolean;
  message: string;
  data: PopUpRule[];
}

export interface PopUpRuleSingleResponse {
  success: boolean;
  message: string;
  data: PopUpRule;
}

export interface CheckoutRecommendation {
  ruleId: string;
  triggerCategory: Category | { _id: string; name: string };
  autoPopupReminder: boolean;
  suggestedItems: InventoryItem[];
}

export interface CheckoutRecommendationsResponse {
  success: boolean;
  message: string;
  data: CheckoutRecommendation[];
}

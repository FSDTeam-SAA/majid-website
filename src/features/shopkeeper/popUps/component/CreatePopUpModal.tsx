import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreatePopUpRule, useUpdatePopUpRule } from "../hooks/usePopUps";
import {
  useCategories,
  useMyInventory,
} from "../../inventory/hooks/useInventory";
import type { Category, InventoryItem } from "../../inventory/types";
import type { PopUpRule, RecommendedItem } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit?: PopUpRule | null;
}

interface FormProps {
  onClose: () => void;
  ruleToEdit?: PopUpRule | null;
}

function CreatePopUpForm({ onClose, ruleToEdit }: FormProps) {
  const [categoryId, setCategoryId] = useState<string>(() => {
    if (!ruleToEdit) return "";
    return typeof ruleToEdit.categoryId === "object" &&
      ruleToEdit.categoryId?._id
      ? ruleToEdit.categoryId._id
      : (ruleToEdit.categoryId as unknown as string) || "";
  });
  const [trigger, setTrigger] = useState(
    ruleToEdit?.trigger || "show_on_checkout",
  );
  const [autoPopupReminder, setAutoPopupReminder] = useState(
    ruleToEdit ? ruleToEdit.autoPopupReminder : true,
  );

  const [selectedItems, setSelectedItems] = useState<RecommendedItem[]>(() => {
    if (!ruleToEdit?.recommendedItems) return [];
    return ruleToEdit.recommendedItems.map((item) => ({
      itemType: item.itemType,
      itemId:
        typeof item.itemId === "object" && item.itemId && "_id" in item.itemId
          ? (item.itemId as { _id: string })._id
          : String(item.itemId || ""),
    }));
  });

  const { data: categoriesData } = useCategories();
  const { data: inventoryData } = useMyInventory();

  const categories = (categoriesData?.data || []) as Category[];
  const inventory = ((inventoryData?.data || []) as InventoryItem[]).filter(
    (item) => item.type === "inventory",
  );

  const createMutation = useCreatePopUpRule();
  const updateMutation = useUpdatePopUpRule();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Please select a trigger category.");
      return;
    }

    const payload = {
      categoryId,
      trigger,
      autoPopupReminder,
      recommendedItems: selectedItems,
    };

    if (ruleToEdit) {
      updateMutation.mutate(
        { id: ruleToEdit._id, input: payload },
        {
          onSuccess: () => {
            toast.success("Pop-up rule updated successfully.");
            onClose();
          },
          onError: () => {
            toast.error("Failed to update pop-up rule.");
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Pop-up rule created successfully.");
          onClose();
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(
            error.response?.data?.message || "Failed to create pop-up rule.",
          );
        },
      });
    }
  };

  const [searchFilter, setSearchFilter] = useState("");
  const [activeAccessoryTab, setActiveAccessoryTab] = useState<string>("all");

  const ACCESSORY_TABS = [
    { id: "all", label: "All Accessories" },
    { id: "cases", label: "Phone Cases", match: /case|cover/i },
    {
      id: "chargers",
      label: "Chargers & Adapters",
      match: /charger|adapter|power\s*bank/i,
    },
    {
      id: "protectors",
      label: "Screen Protectors",
      match: /protector|screen|glass/i,
    },
    { id: "cables", label: "Aux & Cables", match: /cable|aux|wire/i },
    {
      id: "audio",
      label: "Earphones / Audio",
      match: /earphone|headphone|audio|earbud|airpod/i,
    },
  ];

  // Helper to test if item matches accessory tab
  const filteredAccessories = inventory.filter((item) => {
    const itemName = item.itemName || "";
    const catName =
      item.categoryId &&
      typeof item.categoryId === "object" &&
      "name" in item.categoryId
        ? String((item.categoryId as { name: string }).name)
        : "";
    const combined = `${itemName} ${catName}`.toLowerCase();

    // Tab filter
    if (activeAccessoryTab !== "all") {
      const tabObj = ACCESSORY_TABS.find((t) => t.id === activeAccessoryTab);
      if (tabObj?.match && !tabObj.match.test(combined)) {
        return false;
      }
    }

    // Text search filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return combined.includes(q) || item.sku?.toLowerCase().includes(q);
    }

    return true;
  });

  const toggleInventoryItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const exists = prev.find(
        (i) => i.itemType === "inventory" && i.itemId === itemId,
      );
      if (exists) {
        return prev.filter(
          (i) => !(i.itemType === "inventory" && i.itemId === itemId),
        );
      } else {
        return [...prev, { itemType: "inventory", itemId }];
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = new Set(filteredAccessories.map((i) => i._id));
    setSelectedItems((prev) => {
      const others = prev.filter(
        (i) => !(i.itemType === "inventory" && filteredIds.has(i.itemId)),
      );
      const newItems: RecommendedItem[] = filteredAccessories.map((i) => ({
        itemType: "inventory",
        itemId: i._id,
      }));
      return [...others, ...newItems];
    });
  };

  const handleClearFiltered = () => {
    const filteredIds = new Set(filteredAccessories.map((i) => i._id));
    setSelectedItems((prev) =>
      prev.filter(
        (i) => !(i.itemType === "inventory" && filteredIds.has(i.itemId)),
      ),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4 font-sans">
      {/* 1. Trigger Category */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-800">
          Trigger Category (When customer buys...)
        </Label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#84CC16]"
          required
        >
          <option value="" disabled>
            Select a trigger category (e.g. Phones, Laptops, Devices)
          </option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs font-semibold text-slate-400">
          When an item from this category is placed in checkout, the accessory
          add-on pop-up will appear.
        </p>
      </div>

      {/* 2. Target Recommended Accessories */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold text-slate-800">
            Target Recommended Accessories ({selectedItems.length} selected)
          </Label>
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-[#84CC16] hover:underline cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleClearFiltered}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Quick Accessory Filter Tags */}
        <div className="flex flex-wrap gap-1.5">
          {ACCESSORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveAccessoryTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeAccessoryTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Accessories */}
        <Input
          placeholder="Filter accessories by name or SKU..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="rounded-xl h-10 text-xs bg-slate-50 border-slate-200"
        />

        {/* Accessories Selection List */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 max-h-[260px] overflow-y-auto space-y-2 bg-slate-50/50">
          {filteredAccessories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredAccessories.map((item) => {
                const isSelected = selectedItems.some(
                  (i) => i.itemType === "inventory" && i.itemId === item._id,
                );
                const price = item.expectedPrice ?? item.salePrice ?? 0;
                const catName =
                  item.categoryId &&
                  typeof item.categoryId === "object" &&
                  "name" in item.categoryId
                    ? String((item.categoryId as { name: string }).name)
                    : "Accessory";

                return (
                  <label
                    key={item._id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-[#84CC16]/10 border-[#84CC16] text-slate-900"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleInventoryItem(item._id)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-bold truncate leading-tight"
                        title={item.itemName}
                      >
                        {item.itemName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-400 truncate">
                          {catName}
                        </span>
                        <span className="text-[11px] font-black text-slate-900 dark:text-white">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              No matching accessory products found in inventory.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="autoPopup"
          checked={autoPopupReminder}
          onCheckedChange={(checked) => setAutoPopupReminder(checked === true)}
        />
        <Label
          htmlFor="autoPopup"
          className="font-bold text-xs text-slate-700 cursor-pointer"
        >
          Auto pop-up reminder
          <p className="text-[11px] font-medium text-slate-400">
            Automatically prompt cashier to offer these accessories during
            checkout
          </p>
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#84CC16] hover:bg-[#76b813] text-white rounded-xl font-bold px-6"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Accessory Rule"}
        </Button>
      </div>
    </form>
  );
}

export function CreatePopUpModal({ isOpen, onClose, ruleToEdit }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ruleToEdit ? "Edit Pop-Up Rule" : "Create Pop-Up Rule"}
          </DialogTitle>
        </DialogHeader>
        {isOpen && (
          <CreatePopUpForm
            key={ruleToEdit ? ruleToEdit._id : "create-new"}
            onClose={onClose}
            ruleToEdit={ruleToEdit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

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

  const toggleItem = (itemType: "category" | "inventory", itemId: string) => {
    setSelectedItems((prev) => {
      const exists = prev.find(
        (i) => i.itemType === itemType && i.itemId === itemId,
      );
      if (exists) {
        return prev.filter(
          (i) => !(i.itemType === itemType && i.itemId === itemId),
        );
      } else {
        return [...prev, { itemType, itemId }];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="space-y-3">
        <Label>Select Category</Label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          When an item from this category is added to the cart, the pop-up will
          trigger.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Select Products / Recommended Items</Label>
        <div className="border rounded-md p-4 space-y-4 max-h-[300px] overflow-y-auto">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-slate-500">
              Categories (Recommends random items from category)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <label key={c._id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedItems.some(
                      (i) => i.itemType === "category" && i.itemId === c._id,
                    )}
                    onCheckedChange={() => toggleItem("category", c._id)}
                  />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2 text-slate-500">
              Specific Products
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {inventory.map((i) => (
                <label key={i._id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedItems.some(
                      (item) =>
                        item.itemType === "inventory" && item.itemId === i._id,
                    )}
                    onCheckedChange={() => toggleItem("inventory", i._id)}
                  />
                  <span className="text-sm truncate" title={i.itemName}>
                    {i.itemName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Trigger</Label>
        <Input
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          disabled
          placeholder="Show on checkout"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="autoPopup"
          checked={autoPopupReminder}
          onCheckedChange={(checked) => setAutoPopupReminder(checked === true)}
        />
        <Label htmlFor="autoPopup" className="font-normal cursor-pointer">
          Auto pop-up reminder
          <p className="text-xs text-muted-foreground">
            Automatically show pop-up to staff on checkout
          </p>
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#84CC16] hover:bg-[#76b813] text-white"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Rule"}
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

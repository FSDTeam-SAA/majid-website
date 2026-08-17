"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import { usePopUpRules, useDeletePopUpRule } from "../hooks/usePopUps";
import { CreatePopUpModal } from "./CreatePopUpModal";
import type { PopUpRule } from "../types";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const getItemLabel = (item: PopUpRule["recommendedItems"][number]): string => {
  if (typeof item.itemId === "object" && item.itemId) {
    if ("itemName" in item.itemId && typeof item.itemId.itemName === "string") {
      return item.itemId.itemName;
    }
    if ("name" in item.itemId && typeof item.itemId.name === "string") {
      return item.itemId.name;
    }
  }
  return "Item";
};

export function PopUpsList() {
  const { data: rulesData, isLoading } = usePopUpRules();
  const deleteMutation = useDeletePopUpRule();
  const rules = rulesData?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PopUpRule | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this pop-up rule?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Rule deleted successfully"),
        onError: () => toast.error("Failed to delete rule"),
      });
    }
  };

  const handleEdit = (rule: PopUpRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Checkout Pop Ups
            </h1>
            <p className="text-sm font-bold text-muted-foreground">
              Create rules for what products should be suggested on checkout for
              each category.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingRule(null);
                setIsModalOpen(true);
              }}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-6 text-sm font-black text-white shadow-lg shadow-lime-500/20 transition hover:bg-[#76b813] active:scale-95 cursor-pointer"
            >
              <Plus size={18} strokeWidth={3} />
              Create Pop Up
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-500">
            Loading rules...
          </div>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
              <h3 className="font-bold">
                Pop-Up Rules{" "}
                <span className="ml-2 text-xs bg-slate-200 px-2 py-1 rounded-full">
                  {rules.length} rules
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Recommended Items</th>
                    <th className="px-6 py-4">Trigger</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.length > 0 ? (
                    rules.map((rule) => (
                      <tr
                        key={rule._id}
                        className="border-b hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4 font-bold flex items-center gap-2">
                          <Package size={16} className="text-[#84CC16]" />
                          {rule.categoryId?.name || "Unknown Category"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {rule.recommendedItems?.length > 0 ? (
                              rule.recommendedItems.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 border rounded-md text-xs bg-white text-slate-600 truncate max-w-[120px]"
                                >
                                  {getItemLabel(item)}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">
                                Same Category
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-indigo-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Package size={14} /> Show on checkout
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${rule.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {rule.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                                <MoreVertical
                                  size={16}
                                  className="text-slate-500"
                                />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl"
                            >
                              <DropdownMenuItem
                                onClick={() => handleEdit(rule)}
                                className="cursor-pointer flex items-center gap-2 p-2"
                              >
                                <Edit2 size={14} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(rule._id)}
                                className="cursor-pointer flex items-center gap-2 p-2 text-red-600 focus:bg-red-50"
                              >
                                <Trash2 size={14} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        No pop-up rules created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <CreatePopUpModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ruleToEdit={editingRule}
        />
      </div>
    </div>
  );
}

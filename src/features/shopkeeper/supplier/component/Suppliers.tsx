"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Edit2,
  Mail,
  MapPin,
  MoreVertical,
  NotebookText,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SupplierFormModal } from "./modals/SupplierFormModal";
import { useDeleteSupplier, useSuppliers } from "../hooks/useSuppliers";
import SupplierItemsModal from "./modals/SupplierItemsModal";
import type { Supplier } from "../types";
import { useShop } from "../../shop/store/shop.store";

type ActiveFilter = "active" | "inactive" | "all";

export default function Suppliers() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const deleteSupplierMutation = useDeleteSupplier();
  const { activeShopId } = useShop();

  const supplierParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: searchQuery.trim() || undefined,
      isActive: activeFilter === "all" ? undefined : activeFilter === "active",
      shopId: activeShopId,
    }),
    [activeFilter, page, searchQuery, activeShopId],
  );

  const {
    data: suppliersResponse,
    isLoading,
    isError,
  } = useSuppliers(supplierParams);

  const suppliers = suppliersResponse?.data || [];
  const totalSuppliers = suppliersResponse?.meta?.total ?? suppliers.length;
  const totalPages =
    suppliersResponse?.meta?.totalPage ||
    suppliersResponse?.meta?.totalPages ||
    1;

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    const confirmed = window.confirm(`Deactivate "${supplier.name}" supplier?`);
    if (!confirmed) return;

    await deleteSupplierMutation.mutateAsync(supplier._id, {
      onSuccess: () => {
        toast.success("Supplier deactivated successfully");
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to delete supplier");
      },
    });
  };

  const updateSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const updateActiveFilter = (value: ActiveFilter) => {
    setActiveFilter(value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 font-poppins md:p-10">
        <div className="h-28 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-[28px] bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center font-poppins">
        <h2 className="text-xl font-bold text-red-500">
          Failed to load suppliers
        </h2>
        <p className="text-slate-500">
          Please check your connection or login again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 p-4 font-poppins dark:bg-background md:p-10">
      <div className="flex flex-col gap-5 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-card lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-lime-50 text-[#84CC16] dark:bg-lime-500/10">
            <Truck size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F172A] dark:text-white">
              Suppliers
            </h1>
            <p className="mt-1 text-sm font-bold text-[#64748B] dark:text-slate-300">
              {totalSuppliers} supplier{totalSuppliers !== 1 && "s"} found
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search name, email, phone..."
              className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:ring-[#84CC16] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(event) =>
              updateActiveFilter(event.target.value as ActiveFilter)
            }
            className="h-12 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-black text-slate-600 outline-none transition focus:border-[#84CC16] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>

          <button
            onClick={handleAdd}
            className="flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-6 text-sm font-black text-white shadow-lg shadow-lime-500/20 transition hover:bg-[#76b813] active:scale-95 lg:w-auto"
          >
            <Plus size={18} strokeWidth={3} />
            Add Supplier
          </button>
        </div>
      </div>

      {suppliers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-card cursor-pointer"
              onClick={() => setSelectedSupplier(supplier)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-100 to-lime-50 text-xl font-black text-[#65A30D] dark:from-lime-900/50 dark:to-lime-800/30 dark:text-lime-400">
                    {supplier.name?.charAt(0).toUpperCase() || (
                      <Truck size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-lg font-black text-[#0F172A] dark:text-white">
                      {supplier.name}
                    </h3>
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        supplier.isActive === false
                          ? "bg-red-50 text-red-500 dark:bg-red-950/20"
                          : "bg-lime-50 text-[#65A30D] dark:bg-lime-950/20"
                      }`}
                    >
                      <BadgeCheck size={12} />
                      {supplier.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl border-slate-100 p-2 shadow-xl"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEdit(supplier)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-3 text-xs font-bold"
                      >
                        <Edit2 size={14} />
                        Edit Supplier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(supplier)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-3 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                      >
                        <Trash2 size={14} />
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">
                    {supplier.email || "No email"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <Phone size={16} className="text-slate-400" />
                  <span className="truncate">
                    {supplier.phone || "No phone"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="line-clamp-1 truncate">
                    {supplier.address || "No address"}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700/50">
                <div className="flex items-start gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <NotebookText
                    size={16}
                    className="mt-0.5 shrink-0 text-[#84CC16]"
                  />
                  <p className="line-clamp-2 min-h-10">
                    {supplier.notes || "No notes added for this supplier."}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50 py-24 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Truck className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            No suppliers found
          </h3>
          <p className="mt-2 text-sm font-bold text-slate-500">
            Add your first supplier or adjust the current filters.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="text-sm font-black text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      )}

      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        shopId={activeShopId}
      />

      <SupplierItemsModal
        isOpen={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        supplier={selectedSupplier}
      />
    </div>
  );
}

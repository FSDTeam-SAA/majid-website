"use client";

import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3 font-medium text-muted-foreground">
            Loading suppliers...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 md:p-8">
        <div className="p-6 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
          Failed to load suppliers. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Suppliers
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          View and manage inventory suppliers and product sourcing records.
        </p>
      </div>

      <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-surface border-b border-border/60 py-5 px-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 text-[#84CC16] dark:bg-lime-500/10 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">
                  Supplier Registry
                </CardTitle>
                <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider ml-2">
                  Total: {totalSuppliers}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="pl-10 h-10 rounded-xl border-border bg-background text-sm font-medium"
                />
              </div>

              <select
                value={activeFilter}
                onChange={(e) =>
                  updateActiveFilter(e.target.value as ActiveFilter)
                }
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none transition focus:border-[#84CC16] dark:bg-slate-800"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </select>

              <Button
                onClick={handleAdd}
                className="h-10 px-4 bg-[#84CC16] hover:bg-[#76b813] font-bold text-xs flex items-center justify-center gap-2 rounded-xl shadow-sm text-white shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Add Supplier
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface">
                <TableRow className="hover:bg-transparent">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left">
                    Location
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </th>
                </TableRow>
              </TableHeader>

              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={6}
                      className="h-36 text-center text-muted-foreground font-medium"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Truck className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          No suppliers found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Add your first supplier or adjust the search filter.
                        </p>
                      </div>
                    </td>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow
                      key={supplier._id}
                      onClick={() => setSelectedSupplier(supplier)}
                      className="transition-all hover:bg-slate-50/60 dark:hover:bg-slate-800/50 group border-b border-border/50 cursor-pointer"
                    >
                      {/* Supplier Name & Avatar */}
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-100 text-base font-black text-[#65A30D] dark:bg-lime-900/50 dark:text-lime-400">
                            {supplier.name?.charAt(0).toUpperCase() || (
                              <Truck size={18} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground text-sm flex items-center gap-1.5">
                              {supplier.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium font-mono">
                              ID: #{supplier._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {supplier.email || "No email"}
                          </span>
                          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {supplier.phone || "No phone"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Location / Address */}
                      <TableCell className="px-6 py-4 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1 max-w-[200px]">
                            {supplier.address || "No address"}
                          </span>
                        </span>
                      </TableCell>

                      {/* Notes */}
                      <TableCell className="px-6 py-4 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <NotebookText className="w-3.5 h-3.5 text-[#84CC16] shrink-0" />
                          <span className="line-clamp-1 max-w-[220px]">
                            {supplier.notes || "No notes"}
                          </span>
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            supplier.isActive === false
                              ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                              : "bg-lime-50 text-[#65A30D] border border-lime-100 dark:bg-lime-950/20 dark:border-lime-900/30"
                          }`}
                        >
                          <BadgeCheck size={12} />
                          {supplier.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer rounded-lg text-slate-400 hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl p-1 shadow-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEdit(supplier)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(supplier)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-border bg-surface/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Page {page} of {totalPages} · {totalSuppliers} total supplier
                {totalSuppliers !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

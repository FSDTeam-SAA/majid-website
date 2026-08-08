"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StructuredAddressFields } from "@/components/ui/structured-address-fields";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, NotebookText, Phone, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCreateSupplier, useUpdateSupplier } from "../../hooks/useSuppliers";
import type { Supplier, SupplierInput } from "../../types";

type SupplierFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  shopId?: string | null;
  onCreated?: (supplier: Supplier) => void;
};

export function SupplierFormModal({
  isOpen,
  onClose,
  supplier,
  shopId,
  onCreated,
}: SupplierFormModalProps) {
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const isPending =
    createSupplierMutation.isPending || updateSupplierMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SupplierInput>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });
  const address = useWatch({ control, name: "address" });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
      });
      return;
    }

    reset({
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
  }, [supplier, reset, isOpen]);

  const onSubmit = async (data: SupplierInput) => {
    const payload = {
      ...data,
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      address: data.address?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      shopId: shopId || undefined,
    };

    if (supplier) {
      await updateSupplierMutation.mutateAsync(
        { id: supplier._id, input: payload },
        {
          onSuccess: () => {
            toast.success("Supplier updated successfully");
            onClose();
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(
              err.response?.data?.message || "Failed to update supplier",
            );
          },
        },
      );
      return;
    }

    await createSupplierMutation.mutateAsync(payload, {
      onSuccess: (response) => {
        toast.success("Supplier added successfully");
        if (response.data) {
          onCreated?.(response.data);
        }
        onClose();
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to add supplier");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-border p-0 font-poppins">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-xl font-black text-foreground">
            {supplier ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[75vh] space-y-4 overflow-y-auto p-6"
        >
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Supplier Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Truck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("name", { required: "Supplier name is required" })}
                placeholder="Tech Distributors Ltd"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
            {errors.name && (
              <span className="text-xs font-semibold text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Phone
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("phone")}
                placeholder="+8801712345678"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="info@techdist.com"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
            {errors.email && (
              <span className="text-xs font-semibold text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Address
            </Label>
            <div className="rounded-xl border border-border p-3">
              <StructuredAddressFields
                value={address || ""}
                onChange={(nextAddress) =>
                  setValue("address", nextAddress, { shouldDirty: true })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Notes
            </Label>
            <div className="relative">
              <NotebookText className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
              <Textarea
                {...register("notes")}
                placeholder="Premium electronics supplier"
                className="min-h-24 rounded-xl border-border pl-11 pt-3 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-1/2 cursor-pointer rounded-xl border border-border py-3 text-sm font-black text-muted-foreground transition hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#84CC16] py-3 text-sm font-black text-white shadow-lg shadow-lime-500/10 transition hover:bg-[#76b813] active:scale-95"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {supplier ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

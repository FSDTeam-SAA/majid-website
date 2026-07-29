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
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateCustomer,
  useUpdateCustomer,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useSession } from "next-auth/react";
import type { Customer } from "../../../inventory/types";
import { useCurrency } from "@/hooks/useCurrency";

interface CustomerFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  paymentType?: string;
  alreadyPaid?: number;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null; // If editing
}

export function CustomerFormModal({
  isOpen,
  onClose,
  customer,
}: CustomerFormModalProps) {
  const { currency } = useCurrency();
  const { data: session } = useSession();
  const shopkeeperId = (session?.user as { id?: string })?.id || "";
  const userId = (session?.user as { id?: string })?.id || "";

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const isPending =
    createCustomerMutation.isPending || updateCustomerMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      paymentType: "cash",
      alreadyPaid: 0,
    },
  });
  const address = useWatch({ control, name: "address" });

  useEffect(() => {
    if (customer) {
      setValue("firstName", customer.firstName || "");
      setValue("lastName", customer.lastName || "");
      setValue("email", customer.email || "");
      setValue("phone", customer.phone || "");
      setValue("address", customer.address || "");
      setValue("paymentType", customer.paymentType || "cash");
      setValue("alreadyPaid", customer.alreadyPaid || 0);
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        paymentType: "cash",
        alreadyPaid: 0,
      });
    }
  }, [customer, setValue, reset, isOpen]);

  const onSubmit = async (data: CustomerFormValues) => {
    if (!shopkeeperId) {
      toast.error("Shopkeeper session not found");
      return;
    }

    if (customer) {
      // Update
      const payload = {
        ...data,
        alreadyPaid: Number(data.alreadyPaid) || 0,
      };
      await updateCustomerMutation.mutateAsync(
        {
          id: customer._id,
          input: payload,
          shopkeeperId,
        },
        {
          onSuccess: () => {
            toast.success("Customer updated successfully");
            onClose();
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(
              err.response?.data?.message || "Failed to update customer",
            );
          },
        },
      );
    } else {
      // Create
      const payload = {
        ...data,
        shopkeeperId,
        addedBy: userId,
        alreadyPaid: Number(data.alreadyPaid) || 0,
      };
      await createCustomerMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Customer added successfully");
          onClose();
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to add customer");
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-border p-0 font-poppins">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-xl font-black text-foreground">
            {customer ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-6 max-h-[75vh] overflow-y-auto"
        >
          {/* First Name */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              First Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("firstName", {
                  required: "First name is required",
                })}
                placeholder="John"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
            {errors.firstName && (
              <span className="text-xs font-semibold text-red-500">
                {errors.firstName.message}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("lastName", { required: "Last name is required" })}
                placeholder="Doe"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
            {errors.lastName && (
              <span className="text-xs font-semibold text-red-500">
                {errors.lastName.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="john.doe@example.com"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
            {errors.email && (
              <span className="text-xs font-semibold text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                {...register("phone", { required: "Phone number is required" })}
                placeholder="+1234567890"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
            {errors.phone && (
              <span className="text-xs font-semibold text-red-500">
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <AddressAutocomplete
                {...register("address", { required: "Address is required" })}
                value={address || ""}
                placeholder="123 Main St, City, Country"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
            {errors.address && (
              <span className="text-xs font-semibold text-red-500">
                {errors.address.message}
              </span>
            )}
          </div>

          {/* Payment Type */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Payment Type
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                {...register("paymentType")}
                className="flex h-12 w-full rounded-xl border border-border bg-background px-3 pl-11 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#84CC16] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="cash on delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>

          {/* Already Paid */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Already Paid Amount ({currency})
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="number"
                {...register("alreadyPaid")}
                placeholder="0"
                className="h-12 rounded-xl border-border pl-11 font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-1/2 py-3 border border-border text-muted-foreground font-black text-sm rounded-xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-1/2 items-center justify-center gap-2 py-3 bg-[#84CC16] hover:bg-[#76b813] text-white font-black text-sm rounded-xl transition shadow-lg shadow-lime-500/10 active:scale-95 cursor-pointer"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {customer ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

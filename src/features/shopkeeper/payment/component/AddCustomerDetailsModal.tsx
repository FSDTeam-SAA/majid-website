"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { attachCustomerToInvoice } from "../api/scoreReview.api";
import { toast } from "sonner";

interface AddCustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    _id?: string;
    invoiceNumber?: string;
    [key: string]: unknown;
  } | null;
  onSuccess?: () => void;
}

export const AddCustomerDetailsModal: React.FC<
  AddCustomerDetailsModalProps
> = ({ open, onOpenChange, invoice, onSuccess }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice?._id) return;
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    setIsLoading(true);
    try {
      await attachCustomerToInvoice(invoice._id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      toast.success("Customer details attached successfully");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Failed to attach customer details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[26px] p-6 border-border shadow-2xl hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Add Customer Details
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Attach customer information to invoice #
            {invoice?.invoiceNumber || invoice?._id?.slice(-8).toUpperCase()}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">First Name *</Label>
              <Input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                className="h-9 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Last Name</Label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Smith"
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com (Required to send review requests)"
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7123 456789"
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-9 text-xs font-bold"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !firstName.trim()}
              className="rounded-xl h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Customer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDetailsModal;

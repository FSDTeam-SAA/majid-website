/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  RotateCcw,
  FileText,
  Download,
  Calendar,
  CreditCard,
  Banknote,
} from "lucide-react";
import ReturnInvoiceModal from "@/features/shopkeeper/checkout/component/ReturnInvoiceModal";
import { pdf } from "@react-pdf/renderer";
import CheckoutInvoicePDF from "@/features/shopkeeper/checkout/component/CheckoutInvoicePDF";
import { getShopkeeperDisplayName } from "@/components/shared/shopkeeper/profile-utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function Transactions() {
  const { data: profileData } = useMyProfile();
  const shopkeeper = profileData?.data;
  const shopkeeperId = shopkeeper?._id;

  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const { data: response, isLoading } = useMyInvoiceHistory(
    shopkeeperId || "",
    !!shopkeeperId,
  );
  const { formatCurrency, currency } = useCurrency();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnInvoice, setSelectedReturnInvoice] = useState<
    any | null
  >(null);

  const invoices = useMemo(() => response?.data || [], [response]);

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    if (timeFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      result = result.filter((inv: any) => {
        const invDate = new Date(inv.createdAt);
        if (timeFilter === "today") {
          return invDate >= today;
        } else if (timeFilter === "yesterday") {
          return invDate >= yesterday && invDate < today;
        }
        return true;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return result;
    return result.filter((inv: any) => {
      const c = inv.customerInfo || {};
      const name = `${c.firstName || ""} ${c.lastName || ""}`;
      return [inv._id, inv.paymentMethod, name]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [invoices, searchQuery, timeFilter]);

  const handleGenerateReceipt = async (transaction: any) => {
    try {
      const mappedCart =
        transaction.lineItems?.map((item: any) => ({
          id: item.itemId?._id,
          name: item.itemId?.itemName,
          price: Number(item.itemId?.expectedPrice || 0),
          qty: item.quantity || 1,
          image: item.itemId?.image?.url,
          imeiNumber: item.itemId?.imeiNumber,
          type: "product",
        })) || [];

      if (mappedCart.length === 0 && transaction.itemsIds?.length) {
        transaction.itemsIds.forEach((item: any) => {
          mappedCart.push({
            id: item._id,
            name: item.itemName,
            price: Number(item.expectedPrice || 0),
            qty: 1,
            image: item.image?.url,
            imeiNumber: item.imeiNumber,
            type: "product",
          });
        });
      }

      const total = Number(transaction.totalAmount || 0);
      const amountPaid = Number(transaction.amountPaid || 0);
      const due = Number(transaction.dueAmount || 0);

      const doc = (
        <CheckoutInvoicePDF
          cartItems={mappedCart}
          invoiceNumber={
            transaction.invoiceNumber ||
            transaction._id?.slice(-8).toUpperCase()
          }
          subtotal={total}
          tax={Number(transaction.tax || 0)}
          total={total}
          shopkeeper={shopkeeper}
          customer={transaction.customerInfo}
          paymentMethod={transaction.paymentMethod || "cash"}
          payment={{
            amountPaid,
            dueAmount: due,
            method: transaction.paymentMethod || "cash",
            status: transaction.paymentStatus || "paid",
            details: transaction.paymentDetails || {},
          }}
          currency={transaction.currency || currency}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt_${transaction._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Receipt generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate receipt");
    }
  };

  const getPaymentIcon = (method: string) => {
    const m = (method || "").toLowerCase();
    if (m === "card" || m === "stripe" || m.includes("ryft")) {
      return <CreditCard className="w-5 h-5 text-indigo-500" />;
    }
    return <Banknote className="w-5 h-5 text-emerald-500" />;
  };

  const getPaymentText = (method: string) => {
    const m = (method || "").toLowerCase();
    if (m === "card" || m === "stripe" || m.includes("ryft")) {
      return "Card";
    }
    return "Cash";
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {getShopkeeperDisplayName(shopkeeper) || "Transactions"}
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          View and manage your checkout transactions.
        </p>
      </div>

      <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-surface border-b border-border/60 py-5 px-4 sm:px-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full xl:w-auto">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold">
                  Transactions History
                </CardTitle>
                <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider ml-2 whitespace-nowrap">
                  Total: {filteredInvoices.length}
                </span>
              </div>

              {/* Time Filters */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setTimeFilter("all")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${timeFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeFilter("today")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${timeFilter === "today" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter("yesterday")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${timeFilter === "yesterday" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div className="relative w-full xl:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="pl-9 rounded-xl border-border bg-background h-10 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-[100vw]">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-surface">
                <TableRow className="hover:bg-transparent">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">
                    Invoice ID
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">
                    Generation Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">
                    Actions
                  </th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <td colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Loading transactions...
                        </span>
                      </div>
                    </td>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <td colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <FileText className="mb-3 h-9 w-9 text-slate-300" />
                        <p className="text-sm font-black text-slate-700">
                          No transactions found
                        </p>
                        <p className="mt-1 max-w-xs text-xs font-medium text-slate-500">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </td>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv: any) => {
                    const formattedDate = new Date(
                      inv.createdAt,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });

                    return (
                      <TableRow
                        key={inv._id}
                        className="transition-all hover:bg-slate-50/40 group border-b border-border/50"
                      >
                        {/* Payment Method */}
                        <TableCell className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shadow-sm shrink-0">
                              {getPaymentIcon(inv.paymentMethod)}
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              {getPaymentText(inv.paymentMethod)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Invoice ID */}
                        <TableCell className="px-6 py-5 font-bold text-slate-600 font-mono text-xs whitespace-nowrap">
                          #INV-{inv._id.slice(-8).toUpperCase()}
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-foreground">
                            {inv.customerInfo?.firstName
                              ? `${inv.customerInfo.firstName} ${inv.customerInfo.lastName}`
                              : "Walk-in"}
                          </div>
                        </TableCell>

                        {/* Generation Date */}
                        <TableCell className="px-6 py-5 text-muted-foreground font-bold text-sm whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {formattedDate}
                          </span>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="px-6 py-5 whitespace-nowrap">
                          <span className="text-[16px] font-black text-slate-900 tracking-tight">
                            {formatCurrency(
                              inv.totalAmount || 0,
                              inv.currency || currency,
                            )}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-9 px-3 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm"
                              onClick={() => {
                                setSelectedReturnInvoice(inv);
                                setIsReturnModalOpen(true);
                              }}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Process Refund
                            </Button>

                            <Button
                              size="sm"
                              className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-primary-foreground"
                              onClick={() => handleGenerateReceipt(inv)}
                            >
                              <Download className="w-3.5 h-3.5" />
                              New Receipt
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReturnInvoiceModal
        open={isReturnModalOpen}
        onOpenChange={(nextOpen) => {
          setIsReturnModalOpen(nextOpen);
          if (!nextOpen) setSelectedReturnInvoice(null);
        }}
        shopkeeperId={shopkeeperId}
        initialInvoice={selectedReturnInvoice}
      />
    </div>
  );
}

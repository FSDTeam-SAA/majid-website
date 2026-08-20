/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text, @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import { pdf, Document, Page, Text, View, Image } from "@react-pdf/renderer";
import {
  ArrowRightLeft,
  Calendar,
  FileText,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { getPdfLogoStyles } from "@/lib/logoHelper";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useCreateInvoice,
  useMyInvoiceHistory,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { pdfStyles } from "@/app/shopkeeper/invoice/create-invoice/_components/createInvoice";
import { useCurrency } from "@/hooks/useCurrency";
import { formatCurrency as baseFormatCurrency } from "@/lib/currency";

interface ReturnInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopkeeperId?: string;
  initialInvoice?: any;
  initialCustomer?: any;
}

const RefundInvoicePDF = ({
  customer,
  items,
  total,
  shopkeeper,
  alreadyPaid,
  dueAmount,
  paymentType,
  refundReason,
  returnAction = "refund",
  currencyCode = "GBP",
}: any) => {
  const formatMoney = (val: number) => baseFormatCurrency(val, currencyCode);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.headerBar} />

        <View style={pdfStyles.topSection}>
          {shopkeeper?.image?.url ? (
            (() => {
              const logoStyles = getPdfLogoStyles(
                shopkeeper.logoSettings,
                110,
                42,
              );
              return (
                <View style={logoStyles.container}>
                  <Image src={shopkeeper.image.url} style={logoStyles.image} />
                </View>
              );
            })()
          ) : (
            <Text
              style={[
                pdfStyles.invoiceTitle,
                { textAlign: "left", fontSize: 20 },
              ]}
            >
              {shopkeeper?.shopName || "STORE"}
            </Text>
          )}
          <View style={pdfStyles.invoiceMeta}>
            <Text style={pdfStyles.invoiceTitle}>
              {returnAction === "exchange"
                ? "Exchange Invoice"
                : "Refund Invoice"}
            </Text>
            <Text style={pdfStyles.dateText}>
              Date:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={pdfStyles.infoContainer}>
          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoLabel}>Client Details</Text>
            <Text style={pdfStyles.customerName}>
              {`${customer?.firstName || "Valued"} ${customer?.lastName || "Customer"}`}
            </Text>
            <Text style={pdfStyles.infoText}>
              Email: {customer?.email || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Phone: {customer?.phone || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Address: {customer?.address || "N/A"}
            </Text>
            <Text style={pdfStyles.paymentMethod}>
              {paymentType ? paymentType.toUpperCase() : "N/A"}
            </Text>
          </View>

          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoLabelBlue}>Store Information</Text>
            <Text style={pdfStyles.customerName}>
              {shopkeeper?.shopName || "Store"}
            </Text>
            <Text style={pdfStyles.infoText}>
              {shopkeeper?.shopAddress || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Email: {shopkeeper?.email || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Phone: {shopkeeper?.phone || "N/A"}
            </Text>
          </View>
        </View>

        {refundReason && (
          <View
            style={{
              marginTop: 15,
              padding: 12,
              backgroundColor: "#fff7ed",
              borderLeft: "4px solid #f97316",
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: "#c2410c",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {returnAction === "exchange"
                ? "Exchange Reason / Notes"
                : "Refund Reason / Notes"}
            </Text>
            <Text style={{ fontSize: 9.5, color: "#431407", lineHeight: 1.4 }}>
              {refundReason}
            </Text>
          </View>
        )}

        <View
          style={[pdfStyles.tableHeader, { marginTop: refundReason ? 15 : 20 }]}
        >
          <Text style={pdfStyles.colProduct}>Item Description</Text>
          <Text style={pdfStyles.colId}>IMEI / Model ID</Text>
          <Text style={pdfStyles.colPrice}>Amount</Text>
        </View>

        {items.map((item: any) => (
          <View key={item.id} style={pdfStyles.tableRow}>
            <View style={pdfStyles.colProduct}>
              {item.image && (
                <Image src={item.image} style={pdfStyles.productImg} />
              )}
              <View>
                <Text style={pdfStyles.productText}>{item.name}</Text>
                <Text style={pdfStyles.productSub}>
                  {returnAction === "exchange"
                    ? "Exchanged Item"
                    : "Returned Item"}
                </Text>
              </View>
            </View>
            <Text style={pdfStyles.colId}>{item.imeiNumber || "N/A"}</Text>
            <Text style={pdfStyles.colPrice}>{formatMoney(item.price)}</Text>
          </View>
        ))}

        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalBox}>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
              <Text style={pdfStyles.summaryValue}>{formatMoney(total)}</Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Amount Paid</Text>
              <Text style={pdfStyles.summaryValue}>
                {formatMoney(alreadyPaid)}
              </Text>
            </View>
            <View style={pdfStyles.divider} />
            <View style={pdfStyles.balanceRow}>
              <Text style={pdfStyles.balanceLabel}>Balance Due</Text>
              <Text
                style={[
                  pdfStyles.balanceValue,
                  { color: dueAmount <= 0 ? "#22c55e" : "#ef4444" },
                ]}
              >
                {formatMoney(dueAmount)}
              </Text>
            </View>
            {dueAmount <= 0 ? (
              <Text style={pdfStyles.statusBadgePaid}>FULLY PAID</Text>
            ) : (
              <Text style={pdfStyles.statusBadgeDue}>
                DUE: {formatMoney(dueAmount)}
              </Text>
            )}
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          This is an electronically generated{" "}
          {returnAction === "exchange" ? "exchange" : "refund"} invoice.
        </Text>
      </Page>
    </Document>
  );
};

export default function ReturnInvoiceModal({
  open,
  onOpenChange,
  shopkeeperId,
  initialInvoice,
}: ReturnInvoiceModalProps) {
  const { formatCurrency, currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [returnAction, setReturnAction] = useState<"refund" | "exchange">(
    "refund",
  );
  const shouldLoadInvoices = open;
  const {
    data: response,
    isLoading,
    isError,
  } = useMyInvoiceHistory(shopkeeperId || "", shouldLoadInvoices);
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedRefundItems, setSelectedRefundItems] = useState<string[]>([]);
  const [refundReason, setRefundReason] = useState("");
  const [prevInvoice, setPrevInvoice] = useState<any | null>(null);

  const invoices = useMemo(() => response?.data || [], [response]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const refundableInvoices = invoices.filter(
      (invoice: any) =>
        invoice.type !== "Refunded" && invoice.type !== "Exchanged",
    );

    if (!q) return refundableInvoices;

    return refundableInvoices.filter((invoice: any) => {
      const customer = invoice.customerInfo || {};
      const customerName = `${customer.firstName || ""} ${customer.lastName || ""}`;
      return [
        invoice._id,
        `INV-${invoice._id?.slice(-8)}`,
        customerName,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [invoices, searchQuery]);

  const handleSelectInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);

    const itemIds = (invoice.itemsIds || []).map((item: any) =>
      typeof item === "object" ? item._id : item,
    );
    setSelectedRefundItems(itemIds);
    setRefundReason("");
    setSearchQuery(`#INV-${(invoice._id || "").slice(-8).toUpperCase()}`);
  };

  if (open && initialInvoice && initialInvoice !== prevInvoice) {
    setPrevInvoice(initialInvoice);
    setSelectedInvoice(initialInvoice);
    const itemIds = (initialInvoice.itemsIds || []).map((item: any) =>
      typeof item === "object" ? item._id : item,
    );
    setSelectedRefundItems(itemIds);
    setRefundReason("");
    setSearchQuery(
      `#INV-${(initialInvoice._id || "").slice(-8).toUpperCase()}`,
    );
  } else if (!open && prevInvoice !== null) {
    setPrevInvoice(null);
  }

  const selectedItems = useMemo(() => {
    if (!selectedInvoice) return [];
    const items = selectedInvoice.itemsIds || selectedInvoice.lineItems || [];
    return items.filter((item: any) => {
      const id = item._id || item.itemId?._id || item.id;
      return selectedRefundItems.includes(id);
    });
  }, [selectedInvoice, selectedRefundItems]);

  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum: number, item: any) =>
          sum + Number(item.expectedPrice || item.price || 0),
        0,
      ),
    [selectedItems],
  );

  const toggleRefundItem = (id: string) => {
    setSelectedRefundItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const resetReturnFlow = () => {
    setSelectedInvoice(null);
    setSelectedRefundItems([]);
    setRefundReason("");
    setSearchQuery("");
    setReturnAction("refund");
  };

  const activeCurrency = selectedInvoice?.currency || currency;

  const handleGenerateRefund = async () => {
    if (!selectedInvoice) return;

    if (!selectedItems.length) {
      toast.error("Select at least one item");
      return;
    }

    try {
      const mappedItems = selectedItems.map((item: any) => ({
        id: item._id || item.itemId?._id || item.id,
        name: item.itemName || item.name || item.itemId?.itemName || "Item",
        price: Number(item.expectedPrice || item.price || 0),
        image: item.image?.url || item.itemId?.image?.url,
        imeiNumber: item.imeiNumber || item.itemId?.imeiNumber,
      }));
      const alreadyPaid = Number(
        selectedInvoice.customerInfo?.alreadyPaid ||
          selectedInvoice.amountPaid ||
          0,
      );
      const dueAmount =
        selectedTotal - alreadyPaid <= 0 ? 0 : selectedTotal - alreadyPaid;

      const doc = (
        <RefundInvoicePDF
          customer={selectedInvoice.customerInfo}
          items={mappedItems}
          total={selectedTotal}
          shopkeeper={selectedInvoice.shopkeeperId}
          alreadyPaid={alreadyPaid}
          dueAmount={dueAmount}
          paymentType={
            selectedInvoice.customerInfo?.paymentType ||
            selectedInvoice.paymentMethod ||
            "cash"
          }
          refundReason={refundReason.trim()}
          returnAction={returnAction}
          currencyCode={activeCurrency}
        />
      );

      const blob = await pdf(doc).toBlob();
      const invoiceTypePrefix =
        returnAction === "exchange" ? "exchange_invoice" : "refund_invoice";
      const fileName = `${invoiceTypePrefix}_${selectedInvoice._id}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });

      createInvoice(
        {
          shopkeeperId:
            selectedInvoice.shopkeeperId?._id || selectedInvoice.shopkeeperId,
          customerInfo:
            selectedInvoice.customerInfo?._id || selectedInvoice.customerInfo,
          type: returnAction === "exchange" ? "Exchanged" : "Refunded",
          invoice: file,
          itemsIds: selectedRefundItems,
        },
        {
          onSuccess: () => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            toast.success(
              `${returnAction === "exchange" ? "Exchange" : "Refund"} invoice generated successfully`,
            );
            resetReturnFlow();
            onOpenChange(false);
          },
          onError: () =>
            toast.error(
              `${returnAction === "exchange" ? "Exchange" : "Refund"} generation failed`,
            ),
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetReturnFlow();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[1000px] sm:max-w-[1000px] rounded-[28px] p-0 overflow-hidden bg-white shadow-2xl">
        <DialogHeader className="space-y-4 px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
              <RotateCcw className="h-5 w-5 text-[#84CC16]" />
              Returns & Refunds
            </DialogTitle>

            {/* Action Toggle: Refund vs Exchange */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setReturnAction("refund")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  returnAction === "refund"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refund
              </button>
              <button
                type="button"
                onClick={() => setReturnAction("exchange")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  returnAction === "exchange"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Exchange
              </button>
            </div>
          </div>

          <div className="relative z-20">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Invoice ID, Customer name, phone number, email..."
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold placeholder:text-slate-400"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[76vh] overflow-y-auto bg-slate-50/60 p-6">
          {!selectedInvoice ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Select a Transaction to{" "}
                  {returnAction === "exchange" ? "Exchange" : "Refund"} (
                  {filteredInvoices.length})
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-[#84CC16] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm font-bold text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin text-[#84CC16]" />
                  Loading transactions...
                </div>
              ) : isError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm font-bold text-red-600">
                  Failed to load transaction history.
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <FileText className="mb-2 h-9 w-9 text-slate-300" />
                  <p className="text-sm font-black text-slate-700">
                    No matching invoices found
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500 max-w-xs">
                    Try searching by customer name, phone number, or invoice ID.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredInvoices.map((invoice: any) => {
                    const customer = invoice.customerInfo || {};
                    const customerName = customer.firstName
                      ? `${customer.firstName} ${customer.lastName || ""}`.trim()
                      : "Walk-in Customer";
                    const formattedDate = new Date(
                      invoice.createdAt,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const invoiceAmount = Number(
                      invoice.totalAmount || invoice.amountPaid || 0,
                    );
                    const invCurrency = invoice.currency || currency;

                    return (
                      <div
                        key={invoice._id}
                        onClick={() => handleSelectInvoice(invoice)}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#84CC16] hover:shadow-md hover:shadow-[#84CC16]/5 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-xs font-black text-slate-500">
                              #INV-{invoice._id.slice(-8).toUpperCase()}
                            </span>
                            <h4 className="mt-1 font-black text-sm text-slate-900 truncate">
                              {customerName}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-500 font-medium">
                              {customer.phone && <span>{customer.phone}</span>}
                              {customer.email && (
                                <span className="truncate max-w-[180px]">
                                  {customer.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-slate-900 block">
                              {formatCurrency(invoiceAmount, invCurrency)}
                            </span>
                            <span className="inline-block mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                              {invoice.paymentMethod || "paid"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {formattedDate}
                          </span>
                          <span className="text-[#84CC16] font-black group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            Select Invoice →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Customer Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Customer Details
                  </p>
                  <span className="font-mono text-xs font-black text-slate-500">
                    #INV-{(selectedInvoice._id || "").slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      {selectedInvoice.customerInfo?.firstName
                        ? `${selectedInvoice.customerInfo.firstName} ${selectedInvoice.customerInfo.lastName || ""}`.trim()
                        : "Walk-in Customer"}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
                      <span>
                        Email: {selectedInvoice.customerInfo?.email || "N/A"}
                      </span>
                      <span>
                        Phone: {selectedInvoice.customerInfo?.phone || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3.5 py-2 text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">
                      Original Total
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(
                        selectedInvoice.totalAmount ||
                          selectedInvoice.amountPaid ||
                          0,
                        activeCurrency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Select Items to{" "}
                    {returnAction === "exchange" ? "Exchange" : "Refund"}
                  </p>
                  <span className="text-xs font-bold text-slate-400">
                    {selectedRefundItems.length} of{" "}
                    {selectedInvoice.itemsIds?.length ||
                      selectedInvoice.lineItems?.length ||
                      0}{" "}
                    selected
                  </span>
                </div>

                {selectedInvoice.itemsIds?.length ||
                selectedInvoice.lineItems?.length ? (
                  (selectedInvoice.itemsIds || selectedInvoice.lineItems).map(
                    (rawItem: any) => {
                      const item = rawItem.itemId || rawItem;
                      const itemId = item._id || item.id || rawItem._id;
                      const checked = selectedRefundItems.includes(itemId);
                      const itemPrice = Number(
                        item.expectedPrice || item.price || 0,
                      );

                      return (
                        <div
                          key={itemId}
                          onClick={() => toggleRefundItem(itemId)}
                          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                            checked
                              ? "border-[#84CC16] bg-lime-50/50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleRefundItem(itemId)}
                                className="data-[state=checked]:bg-[#84CC16] data-[state=checked]:border-[#84CC16]"
                              />
                              {item.image?.url && (
                                <img
                                  src={item.image.url}
                                  alt={item.itemName || item.name}
                                  className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-900">
                                  {item.itemName || item.name || "Product Item"}
                                </p>
                                <p className="text-xs font-bold text-slate-500">
                                  IMEI: {item.imeiNumber || "N/A"}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-slate-950 shrink-0">
                              {formatCurrency(itemPrice, activeCurrency)}
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-xs font-bold text-slate-500">
                    No item details available for this transaction.
                  </div>
                )}
              </div>

              {/* Notes & Reason */}
              <div className="space-y-2">
                <Label
                  htmlFor="return-refund-reason"
                  className="text-xs font-black uppercase tracking-wider text-slate-500"
                >
                  {returnAction === "exchange"
                    ? "Exchange Reason / Replacement Notes"
                    : "Refund Reason / Notes"}
                </Label>
                <Textarea
                  id="return-refund-reason"
                  value={refundReason}
                  onChange={(event) => setRefundReason(event.target.value)}
                  placeholder={
                    returnAction === "exchange"
                      ? "Write replacement product details or reason for exchange..."
                      : "Write return/refund reason and details..."
                  }
                  className="min-h-[90px] resize-none rounded-2xl border-slate-200 bg-white text-sm font-medium"
                />
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold shadow-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Action Type</span>
                  <span className="capitalize font-black text-slate-900">
                    {returnAction}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-slate-500">
                  <span>Selected Items</span>
                  <span>{selectedRefundItems.length}</span>
                </div>
                <div className="mt-3 flex justify-between text-base font-black text-slate-950 border-t border-slate-100 pt-3">
                  <span>
                    {returnAction === "exchange"
                      ? "Exchange Value"
                      : "Refund Total"}
                  </span>
                  <span className="text-[#84CC16]">
                    {formatCurrency(selectedTotal, activeCurrency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 rounded-2xl font-black h-12"
                >
                  Change Invoice
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateRefund}
                  disabled={selectedRefundItems.length === 0 || isPending}
                  className="flex-1 rounded-2xl bg-[#84CC16] font-black hover:bg-[#75b213] text-white h-12 shadow-md shadow-[#84CC16]/20"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : returnAction === "exchange" ? (
                    "Generate Exchange Invoice"
                  ) : (
                    "Generate Refund Invoice"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

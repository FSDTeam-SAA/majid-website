/* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text, @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import { pdf, Document, Page, Text, View, Image } from "@react-pdf/renderer";
import {
  Calendar,
  Check,
  FileText,
  Loader2,
  Phone,
  RotateCcw,
  Search,
  User,
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

interface ReturnInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopkeeperId?: string;
}

const currency = (value: number) => `$${Number(value || 0).toFixed(2)}`;

const RefundInvoicePDF = ({
  customer,
  items,
  total,
  shopkeeper,
  alreadyPaid,
  dueAmount,
  paymentType,
  refundReason,
}: any) => (
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
          <Text style={pdfStyles.invoiceTitle}>Refund Invoice</Text>
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
            Refund Reason / Notes
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
              <Text style={pdfStyles.productSub}>Returned Item</Text>
            </View>
          </View>
          <Text style={pdfStyles.colId}>{item.imeiNumber || "N/A"}</Text>
          <Text style={pdfStyles.colPrice}>{currency(item.price)}</Text>
        </View>
      ))}

      <View style={pdfStyles.totalSection}>
        <View style={pdfStyles.totalBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
            <Text style={pdfStyles.summaryValue}>{currency(total)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Amount Paid</Text>
            <Text style={pdfStyles.summaryValue}>{currency(alreadyPaid)}</Text>
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
              {currency(dueAmount)}
            </Text>
          </View>
          {dueAmount <= 0 ? (
            <Text style={pdfStyles.statusBadgePaid}>FULLY PAID</Text>
          ) : (
            <Text style={pdfStyles.statusBadgeDue}>
              DUE: {currency(dueAmount)}
            </Text>
          )}
        </View>
      </View>

      <Text style={pdfStyles.footer}>
        This is an electronically generated refund invoice.
      </Text>
    </Page>
  </Document>
);

export default function ReturnInvoiceModal({
  open,
  onOpenChange,
  shopkeeperId,
}: ReturnInvoiceModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const shouldLoadInvoices = open && searchQuery.trim().length > 0;
  const {
    data: response,
    isLoading,
    isError,
  } = useMyInvoiceHistory(shopkeeperId || "", shouldLoadInvoices);
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedRefundItems, setSelectedRefundItems] = useState<string[]>([]);
  const [refundReason, setRefundReason] = useState("");

  const invoices = useMemo(() => response?.data || [], [response]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const refundableInvoices = invoices.filter(
      (invoice: any) => invoice.type !== "Refunded",
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

  const selectedItems = useMemo(() => {
    if (!selectedInvoice) return [];
    return (selectedInvoice.itemsIds || []).filter((item: any) =>
      selectedRefundItems.includes(item._id),
    );
  }, [selectedInvoice, selectedRefundItems]);

  const selectedTotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum: number, item: any) => sum + Number(item.expectedPrice || 0),
        0,
      ),
    [selectedItems],
  );

  const handleSelectInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setSelectedRefundItems(
      (invoice.itemsIds || []).map((item: any) => item._id),
    );
    setRefundReason("");
    setSearchQuery(`#INV-${invoice._id.slice(-8).toUpperCase()}`);
    setIsSearchResultsOpen(false);
  };

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
    setIsSearchResultsOpen(false);
  };

  const handleGenerateRefund = async () => {
    if (!selectedInvoice) return;

    if (!selectedItems.length) {
      toast.error("Select at least one item");
      return;
    }

    try {
      const mappedItems = selectedItems.map((item: any) => ({
        id: item._id,
        name: item.itemName,
        price: Number(item.expectedPrice || 0),
        image: item.image?.url,
        imeiNumber: item.imeiNumber,
      }));
      const alreadyPaid = Number(
        selectedInvoice.customerInfo?.alreadyPaid || 0,
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
          paymentType={selectedInvoice.customerInfo?.paymentType || "cash"}
          refundReason={refundReason.trim()}
        />
      );

      const blob = await pdf(doc).toBlob();
      const fileName = `refund_invoice_${selectedInvoice._id}.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });

      createInvoice(
        {
          shopkeeperId: selectedInvoice.shopkeeperId._id,
          customerInfo: selectedInvoice.customerInfo?._id,
          type: "Refunded",
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

            toast.success("Refund invoice generated successfully");
            resetReturnFlow();
            onOpenChange(false);
          },
          onError: () => toast.error("Refund generation failed"),
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[1000px] sm:max-w-[1000px] rounded-[28px] p-0 overflow-hidden bg-white">
        <DialogHeader className="space-y-4 px-6 py-5 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
            <RotateCcw className="h-5 w-5 text-[#84CC16]" />
            Return
          </DialogTitle>
          <div className="relative z-50">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setIsSearchResultsOpen(true);
                }
              }}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchResultsOpen(event.target.value.trim().length > 0);
              }}
              placeholder="Search Invoice ID, Customer, number, email..."
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-sm font-bold"
            />
            {isSearchResultsOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
                {isLoading ? (
                  <div className="flex h-28 items-center justify-center gap-2 text-sm font-bold text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading invoices...
                  </div>
                ) : isError ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                    Failed to load invoice history.
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                    <FileText className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                    <p className="text-sm font-black text-slate-700">
                      No invoices found
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Try another invoice id, customer name, phone number, or
                      email.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredInvoices.map((invoice: any) => {
                      const customer = invoice.customerInfo || {};
                      const isSelected = selectedInvoice?._id === invoice._id;
                      return (
                        <button
                          key={invoice._id}
                          onClick={() => handleSelectInvoice(invoice)}
                          className={`w-full rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-[#84CC16] bg-lime-50"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-black text-slate-500">
                                #INV-{invoice._id.slice(-8).toUpperCase()}
                              </p>
                              <p className="mt-1 truncate text-sm font-black text-slate-950">
                                {customer.firstName || "Unknown"}{" "}
                                {customer.lastName || "Customer"}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone || "N/A"}
                                </span>
                                <span>{customer.email || "No email"}</span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              {isSelected && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#84CC16] text-white">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase text-orange-700">
                                {invoice.type}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[76vh] overflow-y-auto bg-slate-50/60 p-6">
          {!selectedInvoice ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
              <User className="mb-3 h-9 w-9 text-slate-300" />
              <p className="text-sm font-black text-slate-700">
                Select an invoice
              </p>
              <p className="mt-1 max-w-xs text-xs font-medium text-slate-500">
                Search by invoice id, customer, phone number, or email. Selected
                invoice details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Customer Information
                </p>
                <p className="mt-2 text-base font-black text-slate-950">
                  {selectedInvoice.customerInfo?.firstName}{" "}
                  {selectedInvoice.customerInfo?.lastName}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {selectedInvoice.customerInfo?.email || "No email"}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {selectedInvoice.customerInfo?.phone || "No phone"}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Select Remaining Items
                </p>
                {selectedInvoice.itemsIds?.length ? (
                  selectedInvoice.itemsIds.map((item: any) => {
                    const checked = selectedRefundItems.includes(item._id);
                    return (
                      <div
                        key={item._id}
                        className={`rounded-2xl border p-3 transition-all ${
                          checked
                            ? "border-orange-300 bg-orange-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleRefundItem(item._id)}
                            />
                            {item.image?.url && (
                              <img
                                src={item.image.url}
                                alt={item.itemName}
                                className="h-12 w-12 rounded-xl object-cover"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-slate-900">
                                {item.itemName}
                              </p>
                              <p className="text-[11px] font-bold text-slate-500">
                                IMEI: {item.imeiNumber || "N/A"}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-black text-slate-950">
                            {currency(item.expectedPrice)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-xs font-bold text-slate-500">
                    No remaining items available for this invoice.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="return-refund-reason"
                  className="text-xs font-black uppercase tracking-wider text-slate-500"
                >
                  Refund Reason / Notes
                </Label>
                <Textarea
                  id="return-refund-reason"
                  value={refundReason}
                  onChange={(event) => setRefundReason(event.target.value)}
                  placeholder="Write return/refund notes..."
                  className="min-h-[90px] resize-none rounded-2xl border-slate-200 bg-white text-sm font-medium"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold">
                <div className="flex justify-between text-slate-500">
                  <span>Selected Items</span>
                  <span>{selectedRefundItems.length}</span>
                </div>
                <div className="mt-2 flex justify-between text-base font-black text-slate-950">
                  <span>Refund Total</span>
                  <span className="text-[#84CC16]">
                    {currency(selectedTotal)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 rounded-2xl font-black"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateRefund}
                  disabled={selectedRefundItems.length === 0 || isPending}
                  className="flex-1 rounded-2xl bg-[#84CC16] font-black hover:bg-[#75b213]"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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

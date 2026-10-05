/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Percent,
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  Search,
  Filter,
  Download,
  Info,
  Settings,
  X,
  FileText,
  CheckCircle,
  Clock,
  ArrowDownRight,
  Loader2,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pdf } from "@react-pdf/renderer";
import CheckoutInvoicePDF from "@/features/shopkeeper/checkout/component/CheckoutInvoicePDF";
import { toast } from "sonner";

export default function TaxSeason() {
  const { data: profileData } = useMyProfile();
  const shopkeeper = profileData?.data;
  const shopkeeperId = shopkeeper?._id;

  const { activeShop } = useShop();
  const { formatCurrency, currency } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState<any | null>(
    null,
  );

  const { data: response, isLoading } = useMyInvoiceHistory(
    shopkeeperId || "",
    !!shopkeeperId,
  );

  const rawInvoices = useMemo(() => response?.data || [], [response]);

  // Tax configuration from active shop
  const shopTaxPercentage = Number(activeShop?.taxPercentage || 0);
  const shopTaxName = (activeShop?.taxName || "Tax").trim();
  const shopTaxIncluded = Boolean(activeShop?.taxIncludedInPrice);
  const isTaxActive = Boolean(activeShop?.taxEnabled && shopTaxPercentage > 0);

  // 1. Filter out purchase invoices (only customer selling invoices)
  const salesInvoices = useMemo(() => {
    return rawInvoices.filter((inv: any) => {
      const type = String(inv.type || "")
        .trim()
        .toLowerCase();
      const isPurchase =
        type === "purchase invoice" ||
        type === "purchase" ||
        type.includes("purchase");
      return !isPurchase;
    });
  }, [rawInvoices]);

  // 2. Compute tax amount and net figures for each selling invoice
  const processedSales = useMemo(() => {
    return salesInvoices.map((inv: any) => {
      const saleTotal = Number(
        inv.totalAmount ?? inv.amountPaid ?? inv.customerInfo?.alreadyPaid ?? 0,
      );

      const hasExplicitTax =
        inv.tax !== undefined && inv.tax !== null && Number(inv.tax) > 0;

      let taxAmount = 0;
      let appliedRate = 0;
      const taxName = inv.taxName || shopTaxName;
      const isIncluded =
        inv.taxIncludedInPrice !== undefined && inv.taxIncludedInPrice !== null
          ? Boolean(inv.taxIncludedInPrice)
          : shopTaxIncluded;

      if (hasExplicitTax) {
        taxAmount = Number(inv.tax);
        appliedRate =
          shopTaxPercentage > 0
            ? shopTaxPercentage
            : saleTotal > 0
              ? Math.round((taxAmount / saleTotal) * 100 * 10) / 10
              : 0;
      } else if (shopTaxPercentage > 0) {
        appliedRate = shopTaxPercentage;
        if (isIncluded) {
          taxAmount = saleTotal - saleTotal / (1 + shopTaxPercentage / 100);
        } else {
          taxAmount = saleTotal * (shopTaxPercentage / 100);
        }
      }

      taxAmount = Math.round(taxAmount * 100) / 100;
      const netAmount = isIncluded
        ? Math.max(0, saleTotal - taxAmount)
        : saleTotal;

      return {
        ...inv,
        saleTotal,
        taxAmount,
        netAmount,
        appliedRate,
        taxName,
        isIncluded,
      };
    });
  }, [salesInvoices, shopTaxPercentage, shopTaxName, shopTaxIncluded]);

  // 3. Apply Time and Search Filters
  const filteredSales = useMemo(() => {
    let result = processedSales;

    if (timeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      result = result.filter((inv: any) => {
        const invDate = new Date(inv.createdAt);
        if (timeFilter === "today") {
          return invDate >= today;
        } else if (timeFilter === "yesterday") {
          return invDate >= yesterday && invDate < today;
        } else if (timeFilter === "month") {
          return invDate >= startOfMonth;
        } else if (timeFilter === "year") {
          return invDate >= startOfYear;
        }
        return true;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return result;

    return result.filter((inv: any) => {
      const c = inv.customerInfo || {};
      const name = `${c.firstName || ""} ${c.lastName || ""}`;
      const invNum = inv.invoiceNumber || "";
      const method = inv.paymentMethod || "";
      return [inv._id, invNum, method, name]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [processedSales, searchQuery, timeFilter]);

  // 4. Calculate Aggregate Metrics
  const summaryMetrics = useMemo(() => {
    const totalTax = filteredSales.reduce(
      (acc: number, item: any) => acc + (item.taxAmount || 0),
      0,
    );
    const totalSales = filteredSales.reduce(
      (acc: number, item: any) => acc + (item.saleTotal || 0),
      0,
    );
    const totalNet = filteredSales.reduce(
      (acc: number, item: any) => acc + (item.netAmount || 0),
      0,
    );

    return {
      totalTax: Math.round(totalTax * 100) / 100,
      totalSales: Math.round(totalSales * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
      count: filteredSales.length,
    };
  }, [filteredSales]);

  // Receipt Generator
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

      const total = Number(
        transaction.saleTotal || transaction.totalAmount || 0,
      );
      const amountPaid = Number(transaction.amountPaid || total);
      const due = Number(transaction.dueAmount || 0);

      const doc = (
        <CheckoutInvoicePDF
          cartItems={mappedCart}
          invoiceNumber={
            transaction.invoiceNumber ||
            transaction._id?.slice(-8).toUpperCase()
          }
          subtotal={transaction.netAmount || total}
          tax={transaction.taxAmount || 0}
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
      link.download = `tax_receipt_${transaction.invoiceNumber || transaction._id}.pdf`;
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
    <div className="p-4 md:p-8 space-y-6 font-poppins min-h-screen bg-background">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[#84CC16]" />
            Tax Season & VAT
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Track sales tax liabilities and tax breakdown for all selling
            transactions.
          </p>
        </div>

        {/* Tax Rate Settings Badge */}
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-[#84CC16]/10 flex items-center justify-center text-[#84CC16]">
            <Percent size={16} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Configured Tax Rate
            </p>
            <p className="text-sm font-black text-foreground">
              {shopTaxPercentage > 0 ? (
                <>
                  {shopTaxPercentage}% {shopTaxName}{" "}
                  <span className="text-xs font-semibold text-muted-foreground">
                    ({shopTaxIncluded ? "Included" : "Excluded"})
                  </span>
                </>
              ) : (
                <span className="text-amber-500">0% (Not set)</span>
              )}
            </p>
          </div>
          <Link
            href="/shopkeeper/settings/invoice"
            className="ml-2 px-3 py-1.5 bg-muted hover:bg-[#84CC16]/10 hover:text-[#84CC16] text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Settings size={13} />
            <span>Configure</span>
          </Link>
        </div>
      </div>

      {/* Tax Alert Banner if Tax is 0% */}
      {shopTaxPercentage === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs font-bold">
              Tax percentage is not configured yet. Your sales transactions
              currently calculate 0% tax.
            </p>
          </div>
          <Link
            href="/shopkeeper/settings/invoice"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap text-center"
          >
            Set Tax Rate in Settings →
          </Link>
        </motion.div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tax Collected */}
        <Card className="rounded-[24px] border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Total Tax Collected
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#84CC16]/10 flex items-center justify-center text-[#84CC16]">
              <Calculator size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-foreground text-[#84CC16]">
              {formatCurrency(summaryMetrics.totalTax, currency)}
            </h3>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              For {timeFilter === "all" ? "all time" : timeFilter} (
              {summaryMetrics.count} invoices)
            </p>
          </div>
        </Card>

        {/* Taxable Gross Sales */}
        <Card className="rounded-[24px] border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Taxable Gross Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Receipt size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {formatCurrency(summaryMetrics.totalSales, currency)}
            </h3>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Total selling volume
            </p>
          </div>
        </Card>

        {/* Net Sales Volume */}
        <Card className="rounded-[24px] border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Net Sales (Excl. Tax)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {formatCurrency(summaryMetrics.totalNet, currency)}
            </h3>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Revenue excluding tax
            </p>
          </div>
        </Card>

        {/* Tax Invoices Count */}
        <Card className="rounded-[24px] border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Sales Invoices
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {summaryMetrics.count}
            </h3>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              Customer sales processed
            </p>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-surface border-b border-border/60 py-5 px-4 sm:px-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full xl:w-auto">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#84CC16]" />
                <CardTitle className="text-lg font-bold">
                  Sales Tax Transactions
                </CardTitle>
                <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider ml-2 whitespace-nowrap">
                  Count: {filteredSales.length}
                </span>
              </div>

              {/* Time Filters */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setTimeFilter("all")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    timeFilter === "all"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeFilter("today")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    timeFilter === "today"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter("yesterday")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    timeFilter === "yesterday"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    timeFilter === "month"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setTimeFilter("year")}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    timeFilter === "year"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  This Year
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full xl:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice # or customer..."
                className="pl-9 rounded-xl border-border bg-background h-10 w-full"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-[100vw]">
            <Table className="min-w-[900px]">
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
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">
                    Sale Total
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">
                    Tax Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">
                    Actions
                  </th>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <td colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-[#84CC16]" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Loading tax transactions...
                        </span>
                      </div>
                    </td>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <td colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <FileText className="mb-3 h-9 w-9 text-slate-300" />
                        <p className="text-sm font-black text-slate-700">
                          No sales tax transactions found
                        </p>
                        <p className="mt-1 max-w-xs text-xs font-medium text-slate-500">
                          Try selecting another time range or adjusting your
                          search.
                        </p>
                      </div>
                    </td>
                  </TableRow>
                ) : (
                  filteredSales.map((inv: any) => {
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
                        className="transition-all hover:bg-slate-50/40 dark:hover:bg-slate-800/40 group border-b border-border/50"
                      >
                        {/* Payment Method */}
                        <TableCell className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
                              {getPaymentIcon(
                                inv.paymentMethod ||
                                  inv.paymentType ||
                                  inv.customerInfo?.paymentType ||
                                  "cash",
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">
                                {getPaymentText(
                                  inv.paymentMethod ||
                                    inv.paymentType ||
                                    inv.customerInfo?.paymentType ||
                                    "cash",
                                )}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {inv.type || "Sale"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Invoice ID */}
                        <TableCell className="px-6 py-5 font-bold text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
                          {inv.invoiceNumber ||
                            `#INV-${inv._id.slice(-8).toUpperCase()}`}
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-foreground">
                            {inv.customerInfo?.firstName
                              ? `${inv.customerInfo.firstName} ${inv.customerInfo.lastName || ""}`
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

                        {/* Sale Total */}
                        <TableCell className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm font-bold text-foreground">
                            {formatCurrency(
                              inv.saleTotal,
                              inv.currency || currency,
                            )}
                          </span>
                        </TableCell>

                        {/* Tax Amount */}
                        <TableCell className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-[16px] font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                              +
                              {formatCurrency(
                                inv.taxAmount,
                                inv.currency || currency,
                              )}
                            </span>
                            {inv.appliedRate > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {inv.appliedRate}% {inv.taxName}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm"
                              onClick={() => setSelectedTaxInvoice(inv)}
                            >
                              <Calculator className="w-3.5 h-3.5 text-[#84CC16]" />
                              Tax Details
                            </Button>

                            <Button
                              size="sm"
                              className="h-9 px-3 bg-[#84CC16] hover:bg-[#84CC16]/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-white"
                              onClick={() => handleGenerateReceipt(inv)}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Receipt
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

      {/* Details Modal */}
      <AnimatePresence>
        {selectedTaxInvoice && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTaxInvoice(null)}
              className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-[32px] shadow-2xl overflow-hidden border border-border p-6 sm:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#84CC16]/10 flex items-center justify-center text-[#84CC16]">
                    <Calculator size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">
                      Tax Breakdown
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground font-mono">
                      Invoice:{" "}
                      {selectedTaxInvoice.invoiceNumber ||
                        selectedTaxInvoice._id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTaxInvoice(null)}
                  className="p-2 hover:bg-muted rounded-xl transition text-muted-foreground hover:text-foreground"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Breakdown Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {selectedTaxInvoice.customerInfo?.firstName
                        ? `${selectedTaxInvoice.customerInfo.firstName} ${selectedTaxInvoice.customerInfo.lastName || ""}`
                        : "Walk-in"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5 uppercase">
                      {selectedTaxInvoice.paymentMethod || "Cash"}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border border-y border-border">
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Gross Sale Total
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(
                        selectedTaxInvoice.saleTotal,
                        selectedTaxInvoice.currency || currency,
                      )}
                    </span>
                  </div>

                  <div className="py-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Net Amount (Excl. Tax)
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(
                        selectedTaxInvoice.netAmount,
                        selectedTaxInvoice.currency || currency,
                      )}
                    </span>
                  </div>

                  <div className="py-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Percent size={14} className="text-[#84CC16]" />
                      Applied Rate
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {selectedTaxInvoice.appliedRate}%{" "}
                      {selectedTaxInvoice.taxName} (
                      {selectedTaxInvoice.isIncluded
                        ? "Tax Included"
                        : "Tax Excluded"}
                      )
                    </span>
                  </div>

                  <div className="py-3.5 flex justify-between items-center bg-[#84CC16]/5 -mx-6 px-6 sm:-mx-8 sm:px-8">
                    <span className="text-base font-black text-foreground">
                      Tax Collected
                    </span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      +
                      {formatCurrency(
                        selectedTaxInvoice.taxAmount,
                        selectedTaxInvoice.currency || currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 h-12 bg-[#84CC16] hover:bg-[#84CC16]/90 text-white font-bold rounded-xl shadow-lg shadow-lime-500/20"
                  onClick={() => handleGenerateReceipt(selectedTaxInvoice)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-6 font-bold rounded-xl"
                  onClick={() => setSelectedTaxInvoice(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

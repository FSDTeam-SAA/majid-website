/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useDashboardOverview } from "./useDashboardOverview";
import { toast } from "sonner";

export interface CashExpenseItem {
  id: string;
  invoiceNumber?: string;
  date: Date;
  amount: number;
  description: string;
  sellerName?: string;
  pdfUrl?: string;
  paymentMethod: string;
}

export interface PeriodCashMetrics {
  cashSales: number;
  cashExpenses: number;
  netCash: number;
  invoiceCount: number;
  expenseCount: number;
}

export function useCashDrawerMetrics(
  shopkeeperId?: string,
  activeShopId?: string | null,
) {
  const {
    cashManagement,
    saveCashManagement,
    isSavingCashManagement,
    refetch: refetchCashManagement,
  } = useDashboardOverview(shopkeeperId, "monthly", activeShopId || undefined);

  // Fetch all invoices for shopkeeper (high limit to compute complete breakdown)
  const {
    data: invoicesResponse,
    isLoading: isInvoicesLoading,
    refetch: refetchInvoices,
  } = useMyInvoiceHistory(shopkeeperId || "", Boolean(shopkeeperId), 1, 1000);

  const invoices = useMemo(
    () => invoicesResponse?.data || [],
    [invoicesResponse],
  );

  const startingDayCash = Number(cashManagement?.startingDayCash || 0);
  const banked = Number(cashManagement?.banked || 0);
  const cashScore = Number(cashManagement?.cashManagementScore ?? 100);
  const aiInsight = cashManagement?.aiInsight || "";

  // Process all invoices
  const {
    todayMetrics,
    yesterdayMetrics,
    lastWeekMetrics,
    lastMonthMetrics,
    allTimeMetrics,
    cashExpensesList,
  } = useMemo(() => {
    // Date boundaries
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday.getTime() - 1);

    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const thirtyDaysAgo = new Date(startOfToday);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    let todaySales = 0;
    let todayExpenses = 0;
    let todaySalesCount = 0;
    let todayExpCount = 0;

    let yestSales = 0;
    let yestExpenses = 0;
    let yestSalesCount = 0;
    let yestExpCount = 0;

    let weekSales = 0;
    let weekExpenses = 0;
    let weekSalesCount = 0;
    let weekExpCount = 0;

    let monthSales = 0;
    let monthExpenses = 0;
    let monthSalesCount = 0;
    let monthExpCount = 0;

    let allSales = 0;
    let allExpenses = 0;
    let allSalesCount = 0;
    let allExpCount = 0;

    const expenses: CashExpenseItem[] = [];

    invoices.forEach((inv: any) => {
      const isPurchase =
        String(inv.type || "")
          .trim()
          .toLowerCase() === "purchase invoice" ||
        String(inv.type || "")
          .trim()
          .toLowerCase() === "purchase";

      const method = String(
        inv.paymentMethod || inv.paymentType || "",
      ).toLowerCase();
      const isCash = method === "cash" || method === "cash on delivery";

      if (!isCash) return;

      const amount = Number(inv.amountPaid ?? inv.totalAmount ?? 0);
      if (amount <= 0 && !isPurchase) return;

      const dateStr = inv.createdAt || inv.updatedAt;
      const invDate = dateStr ? new Date(dateStr) : new Date(0);

      if (isPurchase) {
        // Cash Expense / Stock Purchase
        allExpenses += amount;
        allExpCount += 1;

        if (invDate >= startOfToday && invDate <= endOfToday) {
          todayExpenses += amount;
          todayExpCount += 1;
        } else if (invDate >= startOfYesterday && invDate <= endOfYesterday) {
          yestExpenses += amount;
          yestExpCount += 1;
        }

        if (invDate >= sevenDaysAgo) {
          weekExpenses += amount;
          weekExpCount += 1;
        }

        if (invDate >= thirtyDaysAgo) {
          monthExpenses += amount;
          monthExpCount += 1;
        }

        const itemsList = Array.isArray(inv.itemsIds)
          ? inv.itemsIds
              .map((i: any) => i?.itemName)
              .filter(Boolean)
              .join(", ")
          : "";

        const customer = inv.customerInfo;
        const sellerName = customer
          ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
          : undefined;

        expenses.push({
          id: inv._id,
          invoiceNumber: inv.invoiceNumber,
          date: invDate,
          amount,
          description: itemsList || "Stock Purchase (Device/Stock)",
          sellerName: sellerName || "Walk-in Seller",
          pdfUrl: inv.invoice?.url,
          paymentMethod: method || "cash",
        });
      } else {
        // Cash Sale / Inflow
        allSales += amount;
        allSalesCount += 1;

        if (invDate >= startOfToday && invDate <= endOfToday) {
          todaySales += amount;
          todaySalesCount += 1;
        } else if (invDate >= startOfYesterday && invDate <= endOfYesterday) {
          yestSales += amount;
          yestSalesCount += 1;
        }

        if (invDate >= sevenDaysAgo) {
          weekSales += amount;
          weekSalesCount += 1;
        }

        if (invDate >= thirtyDaysAgo) {
          monthSales += amount;
          monthSalesCount += 1;
        }
      }
    });

    expenses.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      todayMetrics: {
        cashSales: todaySales,
        cashExpenses: todayExpenses,
        netCash: todaySales - todayExpenses,
        invoiceCount: todaySalesCount,
        expenseCount: todayExpCount,
      },
      yesterdayMetrics: {
        cashSales: yestSales,
        cashExpenses: yestExpenses,
        netCash: yestSales - yestExpenses,
        invoiceCount: yestSalesCount,
        expenseCount: yestExpCount,
      },
      lastWeekMetrics: {
        cashSales: weekSales,
        cashExpenses: weekExpenses,
        netCash: weekSales - weekExpenses,
        invoiceCount: weekSalesCount,
        expenseCount: weekExpCount,
      },
      lastMonthMetrics: {
        cashSales: monthSales,
        cashExpenses: monthExpenses,
        netCash: monthSales - monthExpenses,
        invoiceCount: monthSalesCount,
        expenseCount: monthExpCount,
      },
      allTimeMetrics: {
        cashSales: allSales,
        cashExpenses: allExpenses,
        netCash: allSales - allExpenses,
        invoiceCount: allSalesCount,
        expenseCount: allExpCount,
      },
      cashExpensesList: expenses,
    };
  }, [invoices]);

  // Current Available Cash in Drawer Today
  // = Starting Day Float + Today's Cash Sales - Today's Stock Purchases (Expenses) - Today's Banked to Owner
  const availableCashToday = Math.max(
    0,
    startingDayCash +
      todayMetrics.cashSales -
      todayMetrics.cashExpenses -
      banked,
  );

  // Bank cash to owner
  const handleBankCash = async (amount: number) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount to bank");
      return false;
    }
    if (amount > availableCashToday) {
      toast.warning(
        `Amount ($${amount}) is greater than available cash in drawer ($${availableCashToday.toFixed(2)})`,
      );
    }

    try {
      const newBanked = banked + amount;
      const newDrawer = Math.max(0, availableCashToday - amount);

      await saveCashManagement({
        shopkeeperId,
        startingDayCash,
        banked: newBanked,
        cashInDrawer: newDrawer,
      });

      toast.success(
        `Successfully banked cash to owner. Available drawer cash updated.`,
      );
      refetchCashManagement();
      return true;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Failed to bank cash",
      );
      return false;
    }
  };

  // Set or update starting day cash
  const handleSetStartingCash = async (amount: number) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return false;
    }
    if (isNaN(amount) || amount < 0) {
      toast.error("Enter a valid starting cash amount");
      return false;
    }

    try {
      const newDrawer = Math.max(
        0,
        amount + todayMetrics.cashSales - todayMetrics.cashExpenses - banked,
      );

      await saveCashManagement({
        shopkeeperId,
        startingDayCash: amount,
        banked,
        cashInDrawer: newDrawer,
      });

      toast.success("Starting day float updated successfully");
      refetchCashManagement();
      return true;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Failed to update starting float",
      );
      return false;
    }
  };

  // Direct allocation between drawer & bank
  const handleAllocateCash = async (
    targetBanked: number,
    targetDrawer: number,
  ) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return false;
    }

    try {
      await saveCashManagement({
        shopkeeperId,
        startingDayCash,
        banked: Math.max(0, targetBanked),
        cashInDrawer: Math.max(0, targetDrawer),
      });

      toast.success("Cash allocation updated successfully");
      refetchCashManagement();
      return true;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Failed to allocate cash",
      );
      return false;
    }
  };

  return {
    startingDayCash,
    banked,
    cashScore,
    aiInsight,
    availableCashToday,
    todayMetrics,
    yesterdayMetrics,
    lastWeekMetrics,
    lastMonthMetrics,
    allTimeMetrics,
    cashExpensesList,
    isLoading: isInvoicesLoading,
    isSaving: isSavingCashManagement,
    handleBankCash,
    handleSetStartingCash,
    handleAllocateCash,
    refetch: () => {
      refetchCashManagement();
      refetchInvoices();
    },
  };
}

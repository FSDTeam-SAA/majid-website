/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Wrench,
  Search,
  Package,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  X,
  Loader2,
  UserPlus,
  AlertCircle,
  Info,
  PencilLine,
  Tag,
  Banknote,
  Building2,
  Clock3,
  CreditCard,
  Printer,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";

// Hooks
import {
  useCategories,
  useMyInventory,
  useShopkeeperCart,
  useAddToShopkeeperCart,
  useUpdateShopkeeperCartItem,
  useDeleteCartItem,
  useDeleteAllShopkeeperCartItems,
  useCreateInvoice,
  useCustomersByShopkeeper,
  useCreateCustomer,
  useCustomerInvoices,
} from "../../inventory/hooks/useInventory";
import { useGetMyRepairRequests } from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { updateRepairRequestStatusByShopkeeper } from "@/features/customer/repairRequest/api/repair-request.api";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { generateGoogleReviewQrCodeDataUrl } from "@/features/shopkeeper/settings/utils/googleReviewQr";

// PDF Document
import CheckoutInvoicePDF from "./CheckoutInvoicePDF";
import ReturnInvoiceModal from "./ReturnInvoiceModal";
import {
  CheckoutPaymentResult,
  createCheckoutPaymentForm,
  getPaymentMethodLabel,
  validateCheckoutPayment,
} from "./checkoutPayment";
import {
  openThermalReceiptWindow,
  printThermalReceipt,
} from "./thermalReceipt";
import { CheckoutRecommendationsModal } from "./CheckoutRecommendationsModal";
import { useCheckoutRecommendations } from "../../popUps/hooks/usePopUps";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StructuredAddressFields } from "@/components/ui/structured-address-fields";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";

const getInventoryImageUrl = (item: any) =>
  item?.image?.url ||
  item?.images?.[0] ||
  item?.sourceImageUrl ||
  item?.sourceImageUrls?.[0] ||
  "";

const getCartVariant = (cartItem: any) =>
  cartItem?.variantId
    ? cartItem.itemId?.variants?.find(
        (variant: any) => variant._id === cartItem.variantId,
      )
    : undefined;

const getCartPrice = (cartItem: any) =>
  Number(
    getCartVariant(cartItem)?.expectedPrice ??
      cartItem.itemId?.expectedPrice ??
      0,
  );

const BROWSE_PAGE_SIZE = 24;

export default function Checkout() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { currency, currencySymbol, formatCurrency } = useCurrency();
  const { activeShop } = useShop();
  const shopkeeperId = (session?.user as { id?: string })?.id;

  // Data fetching queries
  const { data: profileData } = useMyProfile();
  const { data: categoriesData } = useCategories();
  const { data: inventoryData, isLoading: isInventoryLoading } =
    useMyInventory();
  const { data: cartData, isLoading: isCartLoading } =
    useShopkeeperCart(shopkeeperId);
  const { data: repairRequestsData } = useGetMyRepairRequests(1, 100, true);
  const { data: customersResponse } = useCustomersByShopkeeper(
    shopkeeperId || "",
  );

  // Mutations
  const { mutateAsync: deleteCartItem } = useDeleteCartItem(shopkeeperId);
  const { mutateAsync: deleteAllCartItems } =
    useDeleteAllShopkeeperCartItems(shopkeeperId);
  const { mutateAsync: addToShopkeeperCart } =
    useAddToShopkeeperCart(shopkeeperId);
  const { mutateAsync: updateShopkeeperCartQty } =
    useUpdateShopkeeperCartItem(shopkeeperId);
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const createCustomerMutation = useCreateCustomer();

  // Local States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [checkoutMode, setCheckoutMode] = useState<
    "walk-in" | "repair" | "delivery" | "online" | "return"
  >("walk-in");
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [onlineOrderDetails, setOnlineOrderDetails] = useState({
    marketplace: "",
    orderNumber: "",
  });
  const [deliveryDetails, setDeliveryDetails] = useState({
    from: "",
    deliveryTo: "",
    selectedCartItemIds: [] as string[],
  });
  const [paymentForm, setPaymentForm] = useState(() =>
    createCheckoutPaymentForm(0),
  );
  const [paymentOptionMode, setPaymentOptionMode] = useState<
    "pay-all" | "pay-today" | "custom"
  >("pay-today");
  const [allocationStrategy, setAllocationStrategy] = useState<
    "oldest-first" | "today-first" | "even"
  >("oldest-first");
  const [isManualAllocation, setIsManualAllocation] = useState(false);
  const [manualAllocations, setManualAllocations] = useState<
    Record<string, number>
  >({});
  const [customAmountReceived, setCustomAmountReceived] = useState("");
  const [isDueInvoicesModalOpen, setIsDueInvoicesModalOpen] = useState(false);

  // Local item quantities & selected variant (for Browse Inventory cards)
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Browse Inventory pagination
  const [inventoryPage, setInventoryPage] = useState(1);

  // Repair orders that have been collected (payment completed)
  const [collectedRepairIds, setCollectedRepairIds] = useState<string[]>([]);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [manualPrices, setManualPrices] = useState<Record<string, string>>({});
  const [pulledRepairItem, setPulledRepairItem] = useState<any | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─── Data parsing ─────────────────────────────────────────────────────────
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData],
  );
  const inventoryItems = useMemo(() => {
    return (inventoryData?.data || []).filter(
      (item: any) => item.type === "inventory",
    );
  }, [inventoryData]);

  const cartItems = useMemo(() => cartData?.data || [], [cartData]);

  const cartItemIds = useMemo(
    () => cartItems.map((item: any) => item._id).filter(Boolean),
    [cartItems],
  );

  const repairRequests = useMemo(() => {
    return (repairRequestsData?.data || []).filter(
      (req: any) =>
        (req.status === "completed" || req.status === "approved") &&
        req._id !== pulledRepairItem?.repairRequestId &&
        !collectedRepairIds.includes(req._id),
    );
  }, [repairRequestsData, pulledRepairItem, collectedRepairIds]);

  const customers = useMemo(
    () => customersResponse?.data || [],
    [customersResponse],
  );

  // Filters for Browse Inventory
  const filteredInventory = useMemo(() => {
    let items = inventoryItems;

    // Filter by selected category pill
    if (selectedCategory) {
      if (selectedCategory === "repairing") {
        // filter repairing items (case insensitive currentState or category check)
        items = items.filter(
          (item: any) =>
            item.categoryId?.name?.toLowerCase() === "repairing" ||
            item.categoryId?._id === "repairing" ||
            item.currentState === "repairing",
        );
      } else {
        items = items.filter(
          (item: any) => item.categoryId?._id === selectedCategory,
        );
      }
    }

    // Filter by search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      items = items.filter(
        (item: any) =>
          item.itemName?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.imeiNumber?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q),
      );
    }

    return items;
  }, [inventoryItems, selectedCategory, searchQuery]);

  // Browse Inventory pagination
  const totalInventoryPages = useMemo(
    () => Math.max(1, Math.ceil(filteredInventory.length / BROWSE_PAGE_SIZE)),
    [filteredInventory.length],
  );

  const effectiveInventoryPage = Math.min(inventoryPage, totalInventoryPages);

  const pagedInventory = useMemo(
    () =>
      filteredInventory.slice(
        (effectiveInventoryPage - 1) * BROWSE_PAGE_SIZE,
        effectiveInventoryPage * BROWSE_PAGE_SIZE,
      ),
    [filteredInventory, effectiveInventoryPage],
  );

  // Reset to the first page whenever the filters change
  const handleBrowseCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setInventoryPage(1);
  };

  const handleBrowseSearchChange = (value: string) => {
    setSearchQuery(value);
    setInventoryPage(1);
  };

  // Filtered customer list for combobox
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c: any) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q),
    );
  }, [customers, customerSearchQuery]);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const selectedDeliveryItemIds = useMemo(() => {
    const existingSelectedIds = deliveryDetails.selectedCartItemIds.filter(
      (id) => cartItemIds.includes(id),
    );
    const newCartItemIds = cartItemIds.filter(
      (id) => !existingSelectedIds.includes(id),
    );

    return [...existingSelectedIds, ...newCartItemIds];
  }, [cartItemIds, deliveryDetails.selectedCartItemIds]);

  const orderCartItems = useMemo(() => {
    if (checkoutMode !== "delivery") {
      return pulledRepairItem ? [pulledRepairItem, ...cartItems] : cartItems;
    }

    return cartItems.filter((item: any) =>
      selectedDeliveryItemIds.includes(item._id),
    );
  }, [cartItems, checkoutMode, pulledRepairItem, selectedDeliveryItemIds]);

  const subtotal = useMemo(() => {
    return orderCartItems.reduce((sum, item) => {
      const originalPrice = getCartPrice(item);
      const manualValue = manualPrices[item._id];
      const parsedManual = Number(manualValue);
      let effectivePrice =
        manualValue !== undefined &&
        manualValue !== "" &&
        Number.isFinite(parsedManual)
          ? parsedManual
          : originalPrice;

      if (effectivePrice > originalPrice) {
        effectivePrice = originalPrice;
      }
      if (effectivePrice < 0) {
        effectivePrice = 0;
      }

      return sum + effectivePrice * item.quantity;
    }, 0);
  }, [manualPrices, orderCartItems]);

  const subtotalBeforeDiscount = useMemo(() => {
    return orderCartItems.reduce((sum, item) => {
      const price = getCartPrice(item);
      return sum + price * item.quantity;
    }, 0);
  }, [orderCartItems]);

  const totalDiscount = useMemo(() => {
    return Math.max(0, subtotalBeforeDiscount - subtotal);
  }, [subtotalBeforeDiscount, subtotal]);

  const { tax, totalPayment } = useMemo(() => {
    let computedTax = 0;
    let computedTotalPayment = subtotal;

    if (activeShop?.taxEnabled && activeShop?.taxPercentage) {
      const percentage = activeShop.taxPercentage;
      if (activeShop.taxIncludedInPrice) {
        computedTax = subtotal - subtotal / (1 + percentage / 100);
        computedTotalPayment = subtotal;
      } else {
        computedTax = subtotal * (percentage / 100);
        computedTotalPayment = subtotal + computedTax;
      }
    }

    return {
      tax: computedTax,
      totalPayment: Math.round(computedTotalPayment * 100) / 100,
    };
  }, [subtotal, activeShop]);

  // ─── Customer Invoices & Outstanding Balances ──────────────────────────────
  const { data: customerInvoicesData, refetch: refetchCustomerInvoices } =
    useCustomerInvoices(selectedCustomer?._id, Boolean(selectedCustomer?._id), {
      shopkeeperId,
    });

  const customerInvoices = useMemo(() => {
    return customerInvoicesData?.data?.invoices || [];
  }, [customerInvoicesData]);

  const dueInvoices = useMemo(() => {
    return customerInvoices.filter((inv) => {
      const due = Number(inv.dueAmount);
      return (
        due > 0 ||
        inv.paymentStatus === "due" ||
        inv.paymentStatus === "partial"
      );
    });
  }, [customerInvoices]);

  const previousOutstanding = useMemo(() => {
    return dueInvoices.reduce(
      (sum, inv) => sum + (Number(inv.dueAmount) || 0),
      0,
    );
  }, [dueInvoices]);

  const todayPurchase = totalPayment;
  const payAllTotal = previousOutstanding + todayPurchase;

  const effectiveAmountReceived = useMemo(() => {
    if (paymentOptionMode === "pay-all") {
      return payAllTotal.toFixed(2);
    }
    if (paymentOptionMode === "pay-today") {
      return todayPurchase.toFixed(2);
    }
    return customAmountReceived;
  }, [paymentOptionMode, payAllTotal, todayPurchase, customAmountReceived]);

  const allocationPreview = useMemo(() => {
    const numReceived = Math.max(0, Number(effectiveAmountReceived) || 0);
    const sortedDues = [...dueInvoices].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const rows: Array<{
      id: string;
      invoiceNumber: string;
      previousDue: number;
      applied: number;
      remaining: number;
      isToday?: boolean;
    }> = [];

    if (isManualAllocation) {
      sortedDues.forEach((inv) => {
        const prevDue = Number(inv.dueAmount) || 0;
        const app = Math.min(
          prevDue,
          Math.max(0, manualAllocations[inv._id] ?? 0),
        );
        rows.push({
          id: inv._id,
          invoiceNumber:
            inv.invoiceNumber || `INV-${inv._id.slice(-4).toUpperCase()}`,
          previousDue: prevDue,
          applied: app,
          remaining: Math.max(0, prevDue - app),
        });
      });

      const todayApp = Math.min(
        todayPurchase,
        Math.max(0, manualAllocations["TODAY"] ?? 0),
      );
      rows.push({
        id: "TODAY",
        invoiceNumber: "TODAY'S SALE",
        previousDue: todayPurchase,
        applied: todayApp,
        remaining: Math.max(0, todayPurchase - todayApp),
        isToday: true,
      });
    } else if (allocationStrategy === "today-first") {
      let pool = numReceived;
      const todayApp = Math.min(todayPurchase, pool);
      pool = Math.max(0, pool - todayApp);

      sortedDues.forEach((inv) => {
        const prevDue = Number(inv.dueAmount) || 0;
        const app = Math.min(prevDue, pool);
        pool = Math.max(0, pool - app);
        rows.push({
          id: inv._id,
          invoiceNumber:
            inv.invoiceNumber || `INV-${inv._id.slice(-4).toUpperCase()}`,
          previousDue: prevDue,
          applied: app,
          remaining: Math.max(0, prevDue - app),
        });
      });

      rows.push({
        id: "TODAY",
        invoiceNumber: "TODAY'S SALE",
        previousDue: todayPurchase,
        applied: todayApp,
        remaining: Math.max(0, todayPurchase - todayApp),
        isToday: true,
      });
    } else if (allocationStrategy === "even") {
      const allItems = [
        ...sortedDues.map((inv) => ({
          id: inv._id,
          invoiceNumber:
            inv.invoiceNumber || `INV-${inv._id.slice(-4).toUpperCase()}`,
          due: Number(inv.dueAmount) || 0,
          isToday: false,
        })),
        {
          id: "TODAY",
          invoiceNumber: "TODAY'S SALE",
          due: todayPurchase,
          isToday: true,
        },
      ];
      const totalAll = allItems.reduce((s, x) => s + x.due, 0);
      let pool = numReceived;
      allItems.forEach((item, idx) => {
        const share = totalAll > 0 ? (item.due / totalAll) * numReceived : 0;
        const app =
          idx === allItems.length - 1
            ? Math.min(item.due, pool)
            : Math.min(item.due, Math.round(share * 100) / 100);
        pool = Math.max(0, pool - app);
        rows.push({
          id: item.id,
          invoiceNumber: item.invoiceNumber,
          previousDue: item.due,
          applied: app,
          remaining: Math.max(0, item.due - app),
          isToday: item.isToday,
        });
      });
    } else {
      // Default: oldest-first
      let pool = numReceived;
      sortedDues.forEach((inv) => {
        const prevDue = Number(inv.dueAmount) || 0;
        const app = Math.min(prevDue, pool);
        pool = Math.max(0, pool - app);
        rows.push({
          id: inv._id,
          invoiceNumber:
            inv.invoiceNumber || `INV-${inv._id.slice(-4).toUpperCase()}`,
          previousDue: prevDue,
          applied: app,
          remaining: Math.max(0, prevDue - app),
        });
      });

      const todayApp = Math.min(todayPurchase, pool);
      rows.push({
        id: "TODAY",
        invoiceNumber: "TODAY'S SALE",
        previousDue: todayPurchase,
        applied: todayApp,
        remaining: Math.max(0, todayPurchase - todayApp),
        isToday: true,
      });
    }

    return rows;
  }, [
    effectiveAmountReceived,
    dueInvoices,
    isManualAllocation,
    allocationStrategy,
    manualAllocations,
    todayPurchase,
  ]);

  const totalApplied = useMemo(() => {
    return allocationPreview.reduce((sum, r) => sum + r.applied, 0);
  }, [allocationPreview]);

  const remainingCustomerBalance = useMemo(() => {
    return allocationPreview.reduce((sum, r) => sum + r.remaining, 0);
  }, [allocationPreview]);

  const customerBalanceStatus = useMemo(() => {
    if (remainingCustomerBalance <= 0) return "PAID";
    if (totalApplied > 0) return "PART-PAID";
    return "DUE";
  }, [remainingCustomerBalance, totalApplied]);
  const totalCartCount = useMemo(
    () =>
      orderCartItems.reduce(
        (sum, item: any) => sum + Number(item.quantity || 0),
        0,
      ),
    [orderCartItems],
  );

  const categoryIds = useMemo(() => {
    return Array.from(
      new Set(
        orderCartItems
          .map(
            (item: any) =>
              item?.itemId?.categoryId?._id || item?.itemId?.categoryId,
          )
          .filter(Boolean),
      ),
    ) as string[];
  }, [orderCartItems]);

  const { data: recommendationsData } = useCheckoutRecommendations(categoryIds);
  const checkoutRecommendations = recommendationsData?.data || [];

  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] =
    useState(false);
  const [hasShownRecommendations, setHasShownRecommendations] = useState(false);
  // ─── Cart Action Handlers ──────────────────────────────────────────────────
  const handleAddToCart = async (
    itemId: string,
    qtyToAdd: number,
    variantId?: string,
  ) => {
    if (!shopkeeperId) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    try {
      setAddingItemId(itemId);
      const item = inventoryItems.find(
        (inventoryItem: any) => inventoryItem._id === itemId,
      );
      if (!item) {
        toast.error("This inventory item is no longer available");
        return;
      }

      // The mutation updates the cart cache before the request completes, so
      // the Walk-In order details panel receives the item immediately.
      await addToShopkeeperCart({ item, quantity: qtyToAdd, variantId });

      toast.success("Added to cart");
      // Reset local quantity count
      setLocalQuantities((prev) => ({ ...prev, [itemId]: 1 }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item to cart");
    } finally {
      setAddingItemId(null);
    }
  };

  const handleUpdateCartQty = async (
    cartItemId: string,
    currentQty: number,
    delta: number,
  ) => {
    if (!shopkeeperId) return;

    const targetQty = currentQty + delta;

    if (targetQty <= 0) {
      // Delete item
      try {
        await deleteCartItem(cartItemId);
        toast.success("Item removed from cart");
      } catch {
        toast.error("Failed to remove item");
      }
      return;
    }

    try {
      await updateShopkeeperCartQty({
        cartId: cartItemId,
        quantity: targetQty,
      });
    } catch {
      toast.error("Failed to adjust quantity");
    }
  };

  const handleSetCartQty = async (cartItemId: string, exactQty: number) => {
    if (!shopkeeperId) return;

    if (exactQty <= 0) {
      try {
        await deleteCartItem(cartItemId);
        toast.success("Item removed from cart");
      } catch {
        toast.error("Failed to remove item");
      }
      return;
    }

    try {
      await updateShopkeeperCartQty({
        cartId: cartItemId,
        quantity: exactQty,
      });
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleDeleteCartItem = async (cartItemId: string) => {
    if (cartItemId === pulledRepairItem?._id) {
      setPulledRepairItem(null);
      setManualPrices((prev) => {
        const next = { ...prev };
        delete next[cartItemId];
        return next;
      });
      toast.success("Pulled repair item removed");
      return;
    }

    try {
      await deleteCartItem(cartItemId);
      setManualPrices((prev) => {
        const next = { ...prev };
        delete next[cartItemId];
        return next;
      });
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleClearOrder = async () => {
    if (orderCartItems.length === 0) return;
    if (!confirm("Are you sure you want to clear the current order?")) return;

    try {
      if (cartItems.length > 0) {
        await deleteAllCartItems();
      }
      setSelectedCustomer(null);
      setManualPrices({});
      setPulledRepairItem(null);
      toast.success("Order details cleared");
    } catch {
      toast.error("Failed to clear order");
    }
  };

  // ─── Customer Helpers ──────────────────────────────────────────────────────
  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.firstName || !newCustomer.phone) {
      toast.error("First Name and Phone are required");
      return;
    }
    if (!shopkeeperId) return;

    try {
      const res = await createCustomerMutation.mutateAsync({
        ...newCustomer,
        shopkeeperId,
      });

      if (res?.data) {
        setSelectedCustomer(res.data);
        setIsNewCustomerModalOpen(false);
        setIsCustomerSelectorOpen(false);
        setNewCustomer({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
        });
        toast.success("Customer registered successfully");
      }
    } catch {
      toast.error("Failed to register customer");
    }
  };

  // ─── Ready for Collection Handler ──────────────────────────────────────────
  const handlePullRepairOrder = (req: any) => {
    const matchingCustomer = customers.find(
      (customer: any) =>
        (req.phoneNumber && customer.phone === req.phoneNumber) ||
        (req.email && customer.email === req.email),
    );
    const requestCustomer = {
      ...(matchingCustomer || {}),
      firstName: req.firstName || "Customer",
      lastName: req.lastName || "",
      email: req.email || "",
      phone: req.phoneNumber || "",
      address: req.description || "",
    };

    setSelectedCustomer(requestCustomer);
    setCheckoutMode("repair");
    setPulledRepairItem({
      _id: `repair:${req._id}`,
      quantity: 1,
      type: "repair",
      repairRequestId: req._id,
      customer: requestCustomer,
      itemId: {
        _id: `repair:${req._id}`,
        itemName: `${req.deviceModel || "Device"} Repair`,
        brand: "Repair Service",
        currentState: "new",
        expectedPrice: Number(req.price || 0),
        imeiNumber: req.IMEINumber || "N/A",
        image: req.images?.[0] ? { url: req.images[0].url } : undefined,
      },
    });

    setManualPrices((prev) => {
      const next = { ...prev };
      delete next[`repair:${req._id}`];
      return next;
    });

    toast.success(
      `Pulled Order #${req._id.slice(-8).toUpperCase()} into checkout`,
    );
  };

  // ─── Place Order (Payment, Receipt & Completion) ────────────────────────────
  const handlePlaceOrder = () => {
    if (!hasShownRecommendations && checkoutRecommendations.length > 0) {
      const shouldPopup = checkoutRecommendations.some(
        (r: any) => r.autoPopupReminder,
      );
      if (shouldPopup) {
        setIsRecommendationsModalOpen(true);
        setHasShownRecommendations(true);
        return;
      }
    }

    if (checkoutMode === "return") {
      setIsReturnModalOpen(true);
      return;
    }

    if (orderCartItems.length === 0) {
      toast.error("Cannot place order. Cart is empty!");
      return;
    }
    if (!shopkeeperId) {
      toast.error("Session expired");
      return;
    }
    if (checkoutMode === "online") {
      if (!onlineOrderDetails.marketplace.trim()) {
        toast.error("Marketplace name is required for online orders");
        return;
      }
      if (!onlineOrderDetails.orderNumber.trim()) {
        toast.error("Order number is required for online orders");
        return;
      }
    }
    if (checkoutMode === "delivery") {
      if (!deliveryDetails.from.trim()) {
        toast.error("Delivery from location is required");
        return;
      }
      if (!deliveryDetails.deliveryTo.trim()) {
        toast.error("Delivery to location is required");
        return;
      }
      if (orderCartItems.length === 0) {
        toast.error("Select at least one item for delivery");
        return;
      }
    }

    setPaymentForm(createCheckoutPaymentForm(totalPayment));
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentForm.method === "due" && !selectedCustomer?._id) {
      toast.error(
        "Select a registered customer before recording an amount due",
      );
      return;
    }

    const { error, payment } = validateCheckoutPayment(
      paymentForm,
      totalPayment,
    );

    if (error || !payment) {
      toast.error(error || "Payment details are incomplete");
      return;
    }

    await processCheckout(payment);
  };

  const processCheckout = async (
    payment: CheckoutPaymentResult,
    checkoutAllocations?: Array<{ invoiceId: string; amountApplied: number }>,
    allocationsReceipt?: Array<{
      invoiceNumber: string;
      amountApplied: number;
    }>,
    currentRemainingCustomerBalance?: number,
  ) => {
    if (!shopkeeperId) {
      toast.error("Session expired");
      return;
    }

    const receiptWindow = openThermalReceiptWindow();

    try {
      setIsPlacingOrder(true);
      const transactionDate = new Date();
      const pricedOrderCartItems = orderCartItems.map((cartItem: any) => {
        const originalPrice = getCartPrice(cartItem);
        const manualValue = manualPrices[cartItem._id];
        const parsedManual = Number(manualValue);
        const sellingPrice =
          manualValue !== undefined &&
          manualValue !== "" &&
          Number.isFinite(parsedManual) &&
          parsedManual >= 0
            ? parsedManual
            : originalPrice;

        return {
          ...cartItem,
          sellingPrice,
          originalPrice,
          lineTotal: sellingPrice * cartItem.quantity,
          lineOriginalTotal: originalPrice * cartItem.quantity,
        };
      });
      const invoiceNumber = `INV-${transactionDate
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "")}-${Date.now().toString().slice(-6)}`;
      const onlineOrderMeta =
        checkoutMode === "online"
          ? {
              marketplace: onlineOrderDetails.marketplace.trim(),
              orderNumber: onlineOrderDetails.orderNumber.trim(),
            }
          : null;
      const deliveryOrderMeta =
        checkoutMode === "delivery"
          ? {
              from: deliveryDetails.from.trim(),
              deliveryTo: deliveryDetails.deliveryTo.trim(),
              selectedCartItemIds: deliveryDetails.selectedCartItemIds,
            }
          : null;
      const invoiceType = onlineOrderMeta
        ? `ONLINE Receipt - ${onlineOrderMeta.marketplace} #${onlineOrderMeta.orderNumber}`
        : deliveryOrderMeta
          ? `DELIVERY Receipt - ${deliveryOrderMeta.from} to ${deliveryOrderMeta.deliveryTo}`
          : `${checkoutMode.toUpperCase()} Receipt`;

      // Generate QRCode
      const qrCodeDataUrl = await QRCode.toDataURL(
        JSON.stringify({
          invoiceNumber,
          shopkeeperId,
          total: totalPayment.toFixed(2),
          items: orderCartItems.length,
          payment: payment.method,
          paymentStatus: payment.status,
          dueAmount: payment.dueAmount,
          onlineOrder: onlineOrderMeta,
          deliveryOrder: deliveryOrderMeta,
        }),
        { margin: 1, width: 200 },
      );
      const reviewQrCode = await generateGoogleReviewQrCodeDataUrl(
        profileData?.data?.googleReviewPageUrl,
      );

      // Generate invoice PDF Blob
      const doc = (
        <CheckoutInvoicePDF
          cartItems={pricedOrderCartItems}
          invoiceNumber={invoiceNumber}
          qrCodeDataUrl={qrCodeDataUrl}
          reviewQrCodeDataUrl={reviewQrCode?.qrCodeDataUrl}
          shopkeeper={profileData?.data}
          customer={selectedCustomer}
          paymentMethod={payment.method}
          payment={payment}
          subtotalBeforeDiscount={subtotalBeforeDiscount}
          subtotal={subtotal}
          discount={totalDiscount}
          tax={tax}
          taxName={activeShop?.taxName}
          taxIncludedInPrice={activeShop?.taxIncludedInPrice}
          total={totalPayment}
          currency={currency}
        />
      );

      const blob = await pdf(doc).toBlob();
      const fileName = `${invoiceNumber}-invoice.pdf`;
      const invoiceFile = new File([blob], fileName, {
        type: "application/pdf",
      });

      // Call createInvoice API
      const itemsIds = orderCartItems
        .map((c: any) => c.itemId?._id)
        .filter(
          (id: string) => Boolean(id) && !String(id).startsWith("repair:"),
        );
      await createInvoice({
        shopkeeperId,
        type: invoiceType,
        invoice: invoiceFile,
        customerInfo: selectedCustomer?._id,
        itemsIds,
        lineItems: orderCartItems
          .filter(
            (cartItem: any) =>
              cartItem.itemId?._id &&
              !String(cartItem.itemId._id).startsWith("repair:"),
          )
          .map((cartItem: any) => ({
            itemId: cartItem.itemId._id,
            quantity: Number(cartItem.quantity),
            variantId: cartItem.variantId,
          })),
        totalAmount: totalPayment,
        amountPaid: payment.amountPaid,
        dueAmount: payment.dueAmount,
        tax,
        paymentMethod: payment.method,
        paymentStatus: payment.status,
        paymentDetails: payment.details,
        invoiceNumber,
        currency,
        orderDetails: {
          checkoutMode,
          marketplace: onlineOrderMeta?.marketplace,
          orderNumber: onlineOrderMeta?.orderNumber,
          deliveryFrom: deliveryOrderMeta?.from,
          deliveryTo: deliveryOrderMeta?.deliveryTo,
        },
        discountAmount: totalDiscount,
        allocations: checkoutAllocations,
      });

      const receiptOpened = printThermalReceipt(
        {
          invoiceNumber,
          createdAt: transactionDate,
          shopName: profileData?.data?.shopName || "imoscan Store",
          logoUrl: profileData?.data?.image?.url,
          logoSettings: profileData?.data?.logoSettings,
          shopAddress: profileData?.data?.shopAddress,
          shopPhone: profileData?.data?.phone,
          cashierName:
            [profileData?.data?.firstName, profileData?.data?.lastName]
              .filter(Boolean)
              .join(" ") || "Shopkeeper",
          customerName: selectedCustomer
            ? [selectedCustomer.firstName, selectedCustomer.lastName]
                .filter(Boolean)
                .join(" ")
            : "Walk-in Customer",
          orderNumber: onlineOrderMeta?.orderNumber || invoiceNumber,
          items: pricedOrderCartItems.map((cartItem: any) => ({
            name: cartItem.itemId?.itemName || cartItem.name || "Unknown Item",
            quantity: Number(cartItem.quantity || 0),
            originalPrice: Number(cartItem.originalPrice || 0),
            sellingPrice: Number(cartItem.sellingPrice || 0),
          })),
          subtotalBeforeDiscount,
          discount: totalDiscount,
          total: totalPayment,
          currency,
          payment,
          allocations: allocationsReceipt,
          previousOutstanding,
          remainingCustomerBalance: currentRemainingCustomerBalance,
        },
        receiptWindow,
      );

      // The invoice is already committed at this point. A cart cleanup failure
      // must not make the cashier retry the payment and create a duplicate.
      let cartCleared = true;
      try {
        if (deliveryOrderMeta) {
          await Promise.all(
            orderCartItems.map((cartItem: any) => deleteCartItem(cartItem._id)),
          );
        } else {
          await deleteAllCartItems();
        }
      } catch (cartError) {
        cartCleared = false;
        console.error("Invoice saved, but cart cleanup failed", cartError);
      }

      // Permanently remove the pulled repair order from "Ready for Collection"
      // once payment has been collected. Only do this when the repair order was
      // actually part of the charged order (it is excluded in delivery mode).
      const collectedRepairRequestId = orderCartItems.some(
        (cartItem: any) => cartItem._id === pulledRepairItem?._id,
      )
        ? pulledRepairItem?.repairRequestId
        : undefined;
      if (collectedRepairRequestId) {
        try {
          await updateRepairRequestStatusByShopkeeper({
            id: collectedRepairRequestId,
            status: "completed",
          });
        } catch (collectedError) {
          console.error(
            "Failed to mark repair order as collected",
            collectedError,
          );
        }
        setCollectedRepairIds((prev) => {
          if (prev.includes(collectedRepairRequestId)) return prev;
          return [...prev, collectedRepairRequestId];
        });
        queryClient.invalidateQueries({
          queryKey: ["repair-requests", "my"],
        });
      }

      setSelectedCustomer(null);
      setCustomAmountReceived("");
      setManualAllocations({});
      setIsManualAllocation(false);
      setPaymentOptionMode("pay-today");
      setOnlineOrderDetails({
        marketplace: "",
        orderNumber: "",
      });
      setManualPrices({});
      setPulledRepairItem(null);
      setDeliveryDetails((prev) => ({
        ...prev,
        from: "",
        deliveryTo: "",
        selectedCartItemIds: [],
      }));
      setCheckoutMode("walk-in");
      setIsPaymentModalOpen(false);

      refetchCustomerInvoices();
      queryClient.invalidateQueries({
        queryKey: ["customer-invoices"],
      });

      if (!cartCleared) {
        toast.warning(
          "Invoice saved, but the cart could not be cleared. Remove those items before charging again.",
        );
      } else {
        toast.success(
          receiptOpened
            ? "Order placed. Invoice saved and receipt opened for printing."
            : "Order placed and invoice saved. Allow popups to print the receipt.",
        );
      }
    } catch (_err) {
      console.error(_err);
      receiptWindow?.close();
      toast.error("Failed to process checkout transaction.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleTakePayment = async () => {
    if (orderCartItems.length === 0) {
      toast.error("Cart is empty. Add items or repair orders first.");
      return;
    }

    if (checkoutMode === "delivery") {
      if (!deliveryDetails.from.trim()) {
        toast.error("Delivery from location is required");
        return;
      }
      if (!deliveryDetails.deliveryTo.trim()) {
        toast.error("Delivery to location is required");
        return;
      }
    }

    const numericReceived = Number(effectiveAmountReceived) || 0;
    if (paymentForm.method !== "due" && numericReceived <= 0) {
      toast.error("Please enter a valid amount received.");
      return;
    }

    if (paymentForm.method === "due" && !selectedCustomer?._id) {
      toast.error(
        "Select a registered customer before recording an amount due.",
      );
      return;
    }

    if (paymentForm.method === "card") {
      if (
        !paymentForm.cardLastFour ||
        !/^\d{4}$/.test(paymentForm.cardLastFour)
      ) {
        toast.error("Enter card's last 4 digits");
        return;
      }
      if (!paymentForm.transactionReference.trim()) {
        toast.error("Card transaction reference is required");
        return;
      }
    }

    if (paymentForm.method === "bank") {
      if (!paymentForm.bankName.trim()) {
        toast.error("Bank name is required");
        return;
      }
      if (!paymentForm.transactionReference.trim()) {
        toast.error("Bank transfer reference is required");
        return;
      }
    }

    const todayRow = allocationPreview.find((r) => r.isToday);
    const todayApplied = todayRow
      ? todayRow.applied
      : Math.min(totalPayment, numericReceived);
    const todayRemaining = todayRow
      ? todayRow.remaining
      : Math.max(0, totalPayment - todayApplied);

    const paymentResult: CheckoutPaymentResult = {
      method: paymentForm.method || "cash",
      status:
        todayRemaining <= 0 ? "paid" : todayApplied > 0 ? "partial" : "due",
      amountPaid: todayApplied,
      dueAmount: todayRemaining,
      details: {
        amountReceived: numericReceived,
        changeGiven: Math.max(
          0,
          numericReceived - (previousOutstanding + totalPayment),
        ),
        cardholderName: paymentForm.cardholderName.trim() || undefined,
        cardLastFour: paymentForm.cardLastFour.trim() || undefined,
        bankName: paymentForm.bankName.trim() || undefined,
        accountLastFour: paymentForm.accountLastFour.trim() || undefined,
        transactionReference:
          paymentForm.transactionReference.trim() || undefined,
        dueDate: paymentForm.dueDate || undefined,
        notes: paymentForm.notes.trim() || undefined,
      },
    };

    const previousAllocations = allocationPreview
      .filter((r) => !r.isToday && r.applied > 0)
      .map((r) => ({
        invoiceId: r.id,
        amountApplied: r.applied,
      }));

    const receiptAllocations = allocationPreview
      .filter((r) => !r.isToday && r.applied > 0)
      .map((r) => ({
        invoiceNumber: r.invoiceNumber,
        amountApplied: r.applied,
      }));

    await processCheckout(
      paymentResult,
      previousAllocations,
      receiptAllocations,
      remainingCustomerBalance,
    );
  };

  // Helper to adjust browse card local qty state
  const handleLocalQtyChange = (itemId: string, delta: number) => {
    setLocalQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = current + delta;
      return { ...prev, [itemId]: next < 1 ? 1 : next };
    });
  };

  // Helper to select variant for browse card
  const handleVariantChange = (itemId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [itemId]: variantId }));
  };

  const handlePriceInputChange = (cartItemId: string, value: string) => {
    if (value === "") {
      setManualPrices((prev) => ({ ...prev, [cartItemId]: "" }));
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    setManualPrices((prev) => ({ ...prev, [cartItemId]: value }));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6 max-w-[1600px] mx-auto font-poppins min-h-[calc(100vh-80px)] bg-[#FAF9F6] text-slate-800">
      {/* ─── LEFT PANEL (Inventory & Repair Requests) ─── */}
      <div className="flex-1 space-y-6 min-w-0">
        <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                Checkout
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Review items, adjust prices if needed and collect payment.
              </p>
            </div>
          </div>
        </div>

        {/* Repair Orders Ready for Collection */}
        {repairRequests.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#84CC16]/10 text-[#84CC16]">
                  <Wrench size={16} />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Orders Ready for Collection
                </h2>
                <span className="flex items-center justify-center h-6 min-w-6 px-1.5 text-xs font-black text-white bg-[#84CC16] rounded-full">
                  {repairRequests.length}
                </span>
              </div>
              <button
                onClick={() => router.push("/shopkeeper/repair-requests")}
                className="text-xs font-black text-[#84CC16] hover:underline"
              >
                View Orders
              </button>
            </div>

            <p className="text-xs font-medium text-slate-500 mb-4">
              These repair orders have been completed by technicians. Pull
              orders into checkout for customer payment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repairRequests.slice(0, 4).map((req: any) => (
                <div
                  key={req._id}
                  onClick={() => handlePullRepairOrder(req)}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#84CC16]/40 hover:bg-[#84CC16]/5 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-[#84CC16] transition-colors">
                      <Wrench size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-950 truncate">
                        Order #{req._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 truncate capitalize">
                        {req.deviceModel} ({req.firstName})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Callout 4: Guidance Banner */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-[#84CC16]/10 border border-[#84CC16]/20 rounded-2xl text-xs font-bold text-[#3f6212] shadow-sm">
          <Info className="w-5 h-5 text-[#84CC16] shrink-0" />
          <span>
            Choose a ready repair order or select products below to add them to
            checkout.
          </span>
        </div>

        {/* Browse Inventory */}
        <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Browse Inventory
            </h2>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleBrowseSearchChange(e.target.value)}
                placeholder="Search products, services..."
                className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all"
              />
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleBrowseCategoryChange(null)}
              className={`px-4 py-2 text-xs font-black rounded-full transition-all shrink-0 ${
                selectedCategory === null
                  ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat._id}
                onClick={() => handleBrowseCategoryChange(cat._id)}
                className={`px-4 py-2 text-xs font-black rounded-full transition-all shrink-0 ${
                  selectedCategory === cat._id
                    ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => handleBrowseCategoryChange("repairing")}
              className={`px-4 py-2 text-xs font-black rounded-full transition-all shrink-0 ${
                selectedCategory === "repairing"
                  ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Repairing
            </button>
          </div>

          {/* Product Grid */}
          {isInventoryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : pagedInventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pt-2">
              {pagedInventory.map((item: any) => {
                const qty = localQuantities[item._id] || 1;
                const hasVariants = (item.variants || []).length > 0;
                const selectedVariantId =
                  selectedVariants[item._id] ||
                  (hasVariants ? item.variants[0]?._id : undefined);
                const selectedVariant = hasVariants
                  ? item.variants.find(
                      (v: any) => v._id === selectedVariantId,
                    ) || item.variants[0]
                  : null;

                const displayPrice = selectedVariant
                  ? (selectedVariant.expectedPrice ?? item.expectedPrice)
                  : item.expectedPrice;

                const isOutOfStock = hasVariants
                  ? selectedVariant
                    ? selectedVariant.quantity < 1
                    : true
                  : false;

                const itemImageUrl =
                  selectedVariant?.image?.url || getInventoryImageUrl(item);

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
                  >
                    {/* Item Image */}
                    <div className="relative w-full h-32 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                      {itemImageUrl ? (
                        <Image
                          src={itemImageUrl}
                          alt={item.itemName}
                          fill
                          sizes="(max-width: 639px) calc(100vw - 5rem), (max-width: 767px) 50vw, 33vw"
                          className="object-contain object-center p-3"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-350" />
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 space-y-1">
                      <p className="text-[13px] font-black text-slate-900 leading-snug line-clamp-1">
                        {item.itemName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 capitalize">
                        {item.categoryId?.name || item.brand || "Product"}
                      </p>
                    </div>

                    {/* Compact Variant Selector Dropdown */}
                    {hasVariants && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="uppercase tracking-widest text-slate-400">
                            Variant ({item.variants.length})
                          </span>
                          {selectedVariant && (
                            <span
                              className={
                                selectedVariant.quantity > 0
                                  ? "text-slate-400"
                                  : "text-rose-500 font-black"
                              }
                            >
                              {selectedVariant.quantity > 0
                                ? `${selectedVariant.quantity} left`
                                : "Out of stock"}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <select
                            value={selectedVariant?._id || ""}
                            onChange={(e) =>
                              handleVariantChange(item._id, e.target.value)
                            }
                            className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20 rounded-xl px-3 py-2 pr-8 text-slate-700 appearance-none outline-none transition-all cursor-pointer truncate"
                          >
                            {item.variants.map((v: any) => (
                              <option key={v._id} value={v._id}>
                                {v.color || "Variant"}
                                {v.storage ? ` · ${v.storage}` : ""} —{" "}
                                {formatCurrency(v.expectedPrice || 0)}{" "}
                                {v.quantity < 1
                                  ? "(Out of stock)"
                                  : `(${v.quantity} left)`}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Price and Add Row */}
                    <div className="flex flex-wrap items-center justify-between mt-4 gap-2 pt-2 border-t border-slate-50">
                      <div className="flex-1 min-w-[80px]">
                        <p className="text-[15px] font-black text-slate-900 truncate">
                          {formatCurrency(displayPrice)}
                        </p>
                        {hasVariants && selectedVariant && (
                          <p className="text-[9px] font-bold text-slate-400 truncate">
                            {selectedVariant.color || "Variant"}
                            {selectedVariant.storage
                              ? ` · ${selectedVariant.storage}`
                              : ""}
                          </p>
                        )}
                      </div>

                      {/* Quantity select & Add */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Qty count adjuster */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
                          <button
                            onClick={() => handleLocalQtyChange(item._id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-black">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleLocalQtyChange(item._id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Add Circle button */}
                        <button
                          onClick={() =>
                            handleAddToCart(
                              item._id,
                              qty,
                              hasVariants ? selectedVariant?._id : undefined,
                            )
                          }
                          disabled={addingItemId === item._id || isOutOfStock}
                          title={isOutOfStock ? "Out of stock" : "Add to cart"}
                          className="w-8 h-8 rounded-full bg-[#84CC16] text-white flex items-center justify-center hover:bg-[#74b313] active:scale-95 shadow shadow-lime-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingItemId === item._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Plus size={16} strokeWidth={3} />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Package size={36} className="text-slate-350 mb-3" />
              <p className="text-sm font-black text-slate-700">
                No inventory products found
              </p>
              <p className="text-xs font-medium text-slate-500">
                Create items in the Inventory tab or check filters.
              </p>
            </div>
          )}

          {/* Browse Inventory Pagination */}
          {totalInventoryPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100 mt-6">
              <p className="text-xs font-bold text-slate-500">
                Page {effectiveInventoryPage} of {totalInventoryPages} ·{" "}
                {filteredInventory.length} items
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setInventoryPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={effectiveInventoryPage <= 1}
                  className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalInventoryPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalInventoryPages ||
                      Math.abs(page - effectiveInventoryPage) <= 1,
                  )
                  .reduce<(number | "ellipsis")[]>(
                    (pages, page, index, all) => {
                      if (index > 0 && page - all[index - 1] > 1) {
                        pages.push("ellipsis");
                      }
                      pages.push(page);
                      return pages;
                    },
                    [],
                  )
                  .map((page, index) =>
                    page === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-xs font-black text-slate-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setInventoryPage(page)}
                        className={`h-8 min-w-8 px-2 rounded-lg text-xs font-black transition-colors ${
                          page === effectiveInventoryPage
                            ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                <button
                  onClick={() =>
                    setInventoryPage((prev) =>
                      Math.min(totalInventoryPages, prev + 1),
                    )
                  }
                  disabled={effectiveInventoryPage >= totalInventoryPages}
                  className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL (Checkout POS Sidebar) ─── */}
      <div className="w-full xl:w-[460px] bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm flex flex-col shrink-0 min-h-[calc(100vh-120px)] space-y-4">
        {/* Checkout Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              CHECKOUT
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
              {totalCartCount} item{totalCartCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("browse-inventory-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase text-slate-600 tracking-wider transition-colors"
            >
              RETURN TO BROWSE
            </button>
            <button
              onClick={handleClearOrder}
              disabled={orderCartItems.length === 0}
              className="text-xs font-black text-red-500 hover:text-red-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Checkout Type Selector (Walk-in, Repair, Online, Return) */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          {(["walk-in", "repair", "online", "return"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setCheckoutMode(mode);
                if (mode === "return") {
                  setIsReturnModalOpen(true);
                }
              }}
              className={`py-1.5 px-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                checkoutMode === mode
                  ? "bg-[#84CC16] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <ReturnInvoiceModal
          open={isReturnModalOpen}
          onOpenChange={setIsReturnModalOpen}
          shopkeeperId={shopkeeperId}
        />

        {/* ─── 1. CUSTOMER (AUTO-FILLED) ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#84CC16] text-[10px] font-black text-white">
                1
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                CUSTOMER {selectedCustomer ? "(AUTO-FILLED)" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setPulledRepairItem(null);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                  title="Clear customer"
                >
                  <X size={11} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCustomerSelectorOpen(true)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                title="Change customer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div
            onClick={() => setIsCustomerSelectorOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors">
              <User size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">
                {selectedCustomer
                  ? `${selectedCustomer.firstName} ${selectedCustomer.lastName || ""}`
                  : "Select Customer"}
              </p>
              <p className="text-[10px] font-bold text-slate-400">
                {selectedCustomer
                  ? `Customer ID: ${selectedCustomer.customerId || `CUST-${selectedCustomer._id.slice(-4).toUpperCase()}`}`
                  : "Walk-in Customer (click to choose)"}
              </p>
            </div>
          </div>

          {/* Previous Due Warning Banner */}
          {selectedCustomer && previousOutstanding > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-[#FEFCE8] px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 min-w-0">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <span className="truncate">
                  <span className="font-black text-amber-950">
                    {currencySymbol}
                    {previousOutstanding.toFixed(2)}
                  </span>{" "}
                  due from {dueInvoices.length} previous invoice
                  {dueInvoices.length > 1 ? "s" : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDueInvoicesModalOpen(true);
                }}
                className="text-[10px] font-black uppercase tracking-wider text-amber-800 hover:text-amber-950 underline underline-offset-2 ml-2 shrink-0"
              >
                VIEW DUE INVOICES &gt;
              </button>
            </div>
          )}
        </div>

        {/* ─── 2. TODAY'S CART ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#84CC16] text-[10px] font-black text-white">
                2
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Today&apos;s Cart
              </span>
            </div>
            <span className="text-[10px] font-black text-slate-400">
              {orderCartItems.length} item
              {orderCartItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {isCartLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : orderCartItems.length > 0 ? (
              orderCartItems.map((cartItem: any) => {
                const item = cartItem.itemId;
                const variant = getCartVariant(cartItem);
                const originalPrice = getCartPrice(cartItem);
                const manualValue = manualPrices[cartItem._id];
                const parsedManual = Number(manualValue);
                const sellingPrice =
                  manualValue !== undefined &&
                  manualValue !== "" &&
                  Number.isFinite(parsedManual) &&
                  parsedManual >= 0
                    ? parsedManual
                    : originalPrice;
                const lineTotal = sellingPrice * cartItem.quantity;

                return (
                  <div
                    key={cartItem._id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {item?.images?.[0]?.url ? (
                            <Image
                              src={item.images[0].url}
                              alt={item.itemName || "Item"}
                              width={36}
                              height={36}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <Package size={16} className="text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {item?.itemName || cartItem.name || "Unknown Item"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-500">
                              Qty: {cartItem.quantity}
                            </span>
                            {variant && (
                              <span className="text-[10px] font-bold text-slate-400">
                                • {variant.sku || variant.variantName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-900">
                          {currencySymbol}
                          {lineTotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCartItem(cartItem._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Compact manual price edit input */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-200/50">
                      <span>Price per unit:</span>
                      <div className="flex items-center gap-1">
                        <span>{currencySymbol}</span>
                        <input
                          type="text"
                          value={
                            manualPrices[cartItem._id] !== undefined
                              ? manualPrices[cartItem._id]
                              : originalPrice.toFixed(2)
                          }
                          onChange={(e) =>
                            handlePriceInputChange(cartItem._id, e.target.value)
                          }
                          className="w-14 h-5 px-1 text-right text-[11px] font-black border border-slate-200 rounded bg-white focus:outline-none focus:border-[#84CC16]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-slate-400">
                <ShoppingCart
                  size={20}
                  className="mx-auto mb-1 text-slate-300"
                />
                <p className="text-xs font-bold">Cart is empty</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Select a ready order or choose items from Browse Inventory.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
            <span>Today&apos;s purchase</span>
            <span className="text-sm font-black text-slate-950">
              {currencySymbol}
              {todayPurchase.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ─── Delivery Details / Online Details (when active) ─── */}
        {checkoutMode === "delivery" && (
          <div className="rounded-2xl border border-slate-150 bg-slate-50 p-3 space-y-2 text-xs">
            <p className="font-black text-slate-900">Delivery Details</p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                From
              </label>
              <StructuredAddressFields
                value={deliveryDetails.from}
                onChange={(from) =>
                  setDeliveryDetails((prev) => ({ ...prev, from }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Delivery To
              </label>
              <StructuredAddressFields
                value={deliveryDetails.deliveryTo}
                onChange={(deliveryTo) =>
                  setDeliveryDetails((prev) => ({ ...prev, deliveryTo }))
                }
              />
            </div>
          </div>
        )}

        {checkoutMode === "online" && (
          <div className="mt-4 rounded-2xl border border-slate-150 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-black text-slate-900">
                Online Order Trace
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-500">
                Save marketplace and order details for later invoice history
                lookup.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Marketplace
              </label>
              <Input
                value={onlineOrderDetails.marketplace}
                onChange={(event) =>
                  setOnlineOrderDetails((prev) => ({
                    ...prev,
                    marketplace: event.target.value,
                  }))
                }
                placeholder="eBay, Amazon, Walmart..."
                className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Order Number
              </label>
              <Input
                value={onlineOrderDetails.orderNumber}
                onChange={(event) =>
                  setOnlineOrderDetails((prev) => ({
                    ...prev,
                    orderNumber: event.target.value,
                  }))
                }
                placeholder="Marketplace order ID"
                className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>
          </div>
        )}

        {/* ─── 3. AMOUNT PAYABLE ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#84CC16] text-[10px] font-black text-white">
              3
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Amount Payable
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-bold">
              <span>Previous outstanding</span>
              <span className="font-black text-slate-900">
                {currencySymbol}
                {previousOutstanding.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 font-bold">
              <span>Today&apos;s purchase</span>
              <span className="font-black text-slate-900">
                {currencySymbol}
                {todayPurchase.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs font-black text-slate-900">
                Pay all today
              </span>
              <span className="text-base font-black text-[#84CC16]">
                {currencySymbol}
                {payAllTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-xl p-2">
            <Info size={13} className="text-slate-400 shrink-0" />
            <span>
              Previous invoices remain separate from today&apos;s receipt.
            </span>
          </div>
        </div>

        {/* ─── 4. PAYMENT OPTIONS ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#84CC16] text-[10px] font-black text-white">
              4
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Payment Options
            </span>
          </div>

          {/* 3 Option Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setPaymentOptionMode("pay-all")}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                paymentOptionMode === "pay-all"
                  ? "border-[#84CC16] bg-[#84CC16] text-white shadow-sm shadow-lime-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">
                Pay All
              </span>
              <span
                className={`text-[11px] font-black ${
                  paymentOptionMode === "pay-all"
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {currencySymbol}
                {payAllTotal.toFixed(2)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentOptionMode("pay-today")}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                paymentOptionMode === "pay-today"
                  ? "border-[#84CC16] bg-[#84CC16] text-white shadow-sm shadow-lime-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">
                Pay Today Only
              </span>
              <span
                className={`text-[11px] font-black ${
                  paymentOptionMode === "pay-today"
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {currencySymbol}
                {todayPurchase.toFixed(2)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentOptionMode("custom")}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                paymentOptionMode === "custom"
                  ? "border-[#84CC16] bg-[#84CC16] text-white shadow-sm shadow-lime-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">
                Custom / Partial
              </span>
              <span
                className={`text-[11px] font-black ${
                  paymentOptionMode === "custom"
                    ? "text-white"
                    : "text-slate-500"
                }`}
              >
                Enter amount
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Payment method
              </label>
              <select
                value={paymentForm.method || "cash"}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    method: e.target.value as any,
                  }))
                }
                className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-800 focus:border-[#84CC16] focus:outline-none"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="due">Due / Pay Later</option>
              </select>
            </div>

            {/* Amount Received */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Amount received
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={
                    paymentOptionMode === "custom"
                      ? customAmountReceived
                      : effectiveAmountReceived
                  }
                  onChange={(e) => {
                    setPaymentOptionMode("custom");
                    setCustomAmountReceived(e.target.value);
                  }}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 pl-6 pr-2 text-right text-xs font-black text-slate-900 focus:border-[#84CC16] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Apply payment & edit allocation */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">
                Apply payment
              </span>
              <select
                value={allocationStrategy}
                onChange={(e) => setAllocationStrategy(e.target.value as any)}
                disabled={isManualAllocation}
                className="h-8 flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-1.5 text-[11px] font-bold text-slate-800 focus:border-[#84CC16] focus:outline-none disabled:opacity-60"
              >
                <option value="oldest_first">Oldest dues first</option>
                <option value="today_first">Today&apos;s purchase first</option>
                <option value="pro_rata">Evenly distributed</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsManualAllocation((prev) => !prev)}
              className={`h-8 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors shrink-0 ${
                isManualAllocation
                  ? "border-[#84CC16] bg-[#84CC16]/10 text-[#65a30d]"
                  : "border-slate-200 bg-slate-50 text-blue-600 hover:bg-slate-100"
              }`}
            >
              {isManualAllocation ? "Auto Allocate" : "Edit Allocation"}
            </button>
          </div>
        </div>

        {/* ─── 5. PAYMENT ALLOCATION PREVIEW ─── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#84CC16] text-[10px] font-black text-white">
                5
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Payment Allocation Preview
              </span>
            </div>
            {isManualAllocation && (
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Manual Mode
              </span>
            )}
          </div>

          {/* Allocation Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-2.5 py-1.5">Invoice / Sale</th>
                  <th className="px-2 py-1.5 text-right">Previous due</th>
                  <th className="px-2 py-1.5 text-right">Applied</th>
                  <th className="px-2.5 py-1.5 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {allocationPreview.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.isToday ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                    }
                  >
                    <td className="px-2.5 py-2 font-black text-slate-800">
                      {row.invoiceNumber}
                    </td>
                    <td className="px-2 py-2 text-right text-slate-600">
                      {currencySymbol}
                      {row.previousDue.toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {isManualAllocation ? (
                        <input
                          type="number"
                          step="0.01"
                          max={row.previousDue}
                          min={0}
                          value={
                            manualAllocations[row.id] !== undefined
                              ? manualAllocations[row.id]
                              : row.applied.toFixed(2)
                          }
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setManualAllocations((prev) => ({
                              ...prev,
                              [row.id]: Math.min(
                                row.previousDue,
                                Math.max(0, val),
                              ),
                            }));
                          }}
                          className="w-16 h-6 px-1 text-right text-[11px] font-black border border-slate-200 rounded bg-white focus:outline-none focus:border-[#84CC16]"
                        />
                      ) : (
                        <span className="font-black text-slate-900">
                          {currencySymbol}
                          {row.applied.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-2.5 py-2 text-right font-black ${
                        row.remaining <= 0 ? "text-[#84CC16]" : "text-rose-500"
                      }`}
                    >
                      {currencySymbol}
                      {row.remaining.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Allocation Totals Summary */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-bold">
              <span>Payment received</span>
              <span className="font-black text-slate-900">
                {currencySymbol}
                {Number(effectiveAmountReceived || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-bold">
              <span>Remaining customer balance</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-black ${
                    remainingCustomerBalance <= 0
                      ? "text-[#84CC16]"
                      : "text-rose-600"
                  }`}
                >
                  {currencySymbol}
                  {remainingCustomerBalance.toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    customerBalanceStatus === "PAID"
                      ? "bg-lime-50 text-[#65a30d] border border-lime-200"
                      : customerBalanceStatus === "PART-PAID"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {customerBalanceStatus === "PART-PAID" && (
                    <AlertCircle size={10} className="shrink-0" />
                  )}
                  {customerBalanceStatus}
                </span>
              </div>
            </div>
          </div>

          {/* TAKE PAYMENT ACTION BUTTON */}
          <button
            type="button"
            onClick={handleTakePayment}
            disabled={orderCartItems.length === 0 || isPlacingOrder}
            className="flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#84CC16] text-white py-3 px-4 text-xs font-black shadow-lg shadow-lime-500/20 transition-all hover:bg-[#75b213] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none mt-2 w-full"
          >
            {isPlacingOrder ? (
              <Loader2 className="h-5 w-5 animate-spin my-1" />
            ) : (
              <>
                <span className="text-sm tracking-wide">
                  TAKE {currencySymbol}
                  {Number(effectiveAmountReceived || 0).toFixed(2)} PAYMENT
                </span>
                <span className="text-[10px] font-semibold text-lime-100">
                  Create today&apos;s receipt and record payment allocation
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── DUE INVOICES MODAL ─── */}
      <Dialog
        open={isDueInvoicesModalOpen}
        onOpenChange={setIsDueInvoicesModalOpen}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border-none bg-white p-6 font-poppins sm:max-w-xl">
          <DialogHeader className="border-b border-slate-100 pb-4 text-left">
            <DialogTitle className="text-lg font-black text-slate-950 flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={20} />
              Outstanding Invoices for {selectedCustomer?.firstName}{" "}
              {selectedCustomer?.lastName}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-500">
              Total outstanding balance:{" "}
              <span className="font-black text-rose-600">
                {currencySymbol}
                {previousOutstanding.toFixed(2)}
              </span>{" "}
              across {dueInvoices.length} invoice
              {dueInvoices.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {dueInvoices.map((inv: any) => (
              <div
                key={inv._id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors"
              >
                <div>
                  <p className="text-xs font-black text-slate-900">
                    Invoice #{inv.invoiceId || inv._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500">
                    {new Date(inv.createdAt).toLocaleDateString()} •{" "}
                    {inv.items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-rose-600">
                    {currencySymbol}
                    {(inv.dueBalance ?? inv.subtotal ?? 0).toFixed(2)} Due
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700">
                    {inv.paymentStatus || "UNPAID"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsDueInvoicesModalOpen(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── PAYMENT DIALOG ─── */}
      <Dialog
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          if (!isPlacingOrder) {
            setIsPaymentModalOpen(open);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-none bg-white p-0 font-poppins sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
            <DialogTitle className="flex items-center gap-3 text-xl font-black text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-50 text-[#84CC16]">
                <CreditCard size={19} />
              </span>
              Collect Payment
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-500">
              Select how the customer is paying{" "}
              <span className="font-black text-slate-900">
                {formatCurrency(totalPayment, currency)}
              </span>
              . The payment record will be saved with the customer invoice.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmPayment} className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  id: "cash" as const,
                  label: "Cash",
                  description: "Cash received",
                  icon: Banknote,
                },
                {
                  id: "card" as const,
                  label: "Card",
                  description: "Debit or credit",
                  icon: CreditCard,
                },
                {
                  id: "bank" as const,
                  label: "Bank",
                  description: "Bank transfer",
                  icon: Building2,
                },
                {
                  id: "due" as const,
                  label: "Due",
                  description: "Pay later",
                  icon: Clock3,
                },
              ].map(({ id, label, description, icon: Icon }) => {
                const isSelected = paymentForm.method === id;
                const isDisabled = id === "due" && !selectedCustomer?._id;

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      setPaymentForm((current) => ({
                        ...current,
                        method: id,
                      }))
                    }
                    className={`rounded-2xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-[#84CC16] bg-lime-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-[#84CC16] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="mt-3 block text-sm font-black text-slate-950">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold text-slate-500">
                      {isDisabled ? "Customer required" : description}
                    </span>
                  </button>
                );
              })}
            </div>

            {!paymentForm.method ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center">
                <CreditCard className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs font-black text-slate-600">
                  Choose a payment method to continue
                </p>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {getPaymentMethodLabel(paymentForm.method)} details
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">
                    Only transaction references and last four digits are stored.
                  </p>
                </div>

                {paymentForm.method === "cash" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Cash Received
                      </span>
                      <Input
                        type="number"
                        min={totalPayment}
                        step="0.01"
                        value={paymentForm.amountReceived}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            amountReceived: event.target.value,
                          }))
                        }
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm font-black focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <div className="rounded-xl border border-lime-100 bg-lime-50 px-4 py-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-lime-700">
                        Change
                      </span>
                      <p className="mt-1 text-lg font-black text-lime-700">
                        {formatCurrency(
                          Math.max(
                            0,
                            Number(paymentForm.amountReceived || 0) -
                              totalPayment,
                          ),
                          currency,
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {paymentForm.method === "card" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Cardholder Name
                      </span>
                      <Input
                        value={paymentForm.cardholderName}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            cardholderName: event.target.value,
                          }))
                        }
                        placeholder="Optional"
                        autoComplete="off"
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Card Last 4 *
                      </span>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        value={paymentForm.cardLastFour}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            cardLastFour: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4),
                          }))
                        }
                        placeholder="1234"
                        autoComplete="off"
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <label className="space-y-1.5 sm:col-span-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Transaction / Authorization Reference *
                      </span>
                      <Input
                        value={paymentForm.transactionReference}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            transactionReference: event.target.value,
                          }))
                        }
                        placeholder="Card terminal transaction reference"
                        autoComplete="off"
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                  </div>
                )}

                {paymentForm.method === "bank" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Bank Name *
                      </span>
                      <Input
                        value={paymentForm.bankName}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            bankName: event.target.value,
                          }))
                        }
                        placeholder="Customer's bank"
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Account Last 4
                      </span>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        value={paymentForm.accountLastFour}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            accountLastFour: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4),
                          }))
                        }
                        placeholder="Optional"
                        autoComplete="off"
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <label className="space-y-1.5 sm:col-span-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Transfer Reference *
                      </span>
                      <Input
                        value={paymentForm.transactionReference}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            transactionReference: event.target.value,
                          }))
                        }
                        placeholder="Bank transfer reference"
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                  </div>
                )}

                {paymentForm.method === "due" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Amount Paid Now
                      </span>
                      <Input
                        type="number"
                        min="0"
                        max={Math.max(0, totalPayment - 0.01)}
                        step="0.01"
                        value={paymentForm.amountPaid}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            amountPaid: event.target.value,
                          }))
                        }
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Due Date *
                      </span>
                      <Input
                        type="date"
                        value={paymentForm.dueDate}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            dueDate: event.target.value,
                          }))
                        }
                        className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 sm:col-span-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">
                        Balance Due
                      </span>
                      <p className="mt-1 text-lg font-black text-orange-700">
                        {formatCurrency(
                          Math.max(
                            0,
                            totalPayment - Number(paymentForm.amountPaid || 0),
                          ),
                          currency,
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Payment Note
                  </span>
                  <textarea
                    rows={2}
                    value={paymentForm.notes}
                    onChange={(event) =>
                      setPaymentForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Optional note"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
                  />
                </label>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPlacingOrder}
                onClick={() => setIsPaymentModalOpen(false)}
                className="h-11 rounded-xl px-5 text-xs font-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!paymentForm.method || isPlacingOrder}
                className="h-11 rounded-xl bg-[#84CC16] px-5 text-xs font-black text-white hover:bg-[#75b213]"
              >
                {isPlacingOrder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                {isPlacingOrder ? "Saving Invoice…" : "Confirm & Print Receipt"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── CUSTOMER SELECTOR DIALOG ─── */}
      <CheckoutRecommendationsModal
        isOpen={isRecommendationsModalOpen}
        recommendations={checkoutRecommendations}
        onDismiss={() => {
          setIsRecommendationsModalOpen(false);
          // Proceed to place order
          handlePlaceOrder();
        }}
        onAddSelected={async (items) => {
          try {
            for (const item of items) {
              await handleAddToCart(item._id, 1);
            }
            toast.success("Added recommended items to cart");
            setIsRecommendationsModalOpen(false);
            // After adding, give state time to sync, then proceed
            setTimeout(handlePlaceOrder, 500);
          } catch (e) {
            console.error(e);
            toast.error("Failed to add recommended items");
          }
        }}
      />

      <Dialog
        open={isCustomerSelectorOpen}
        onOpenChange={setIsCustomerSelectorOpen}
      >
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-poppins border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Select Customer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Choose a registered customer or add a new customer to this POS
              receipt.
            </DialogDescription>
          </DialogHeader>

          {/* Search bar & Register Button */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full h-11 pl-10 pr-4 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-[#84CC16] transition-all"
              />
            </div>
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="flex items-center justify-center gap-1.5 h-11 px-4 bg-[#84CC16] text-white rounded-xl text-xs font-black shadow shadow-lime-500/25 hover:bg-[#74b313] transition-all shrink-0"
            >
              <UserPlus size={14} />
              <span>New</span>
            </button>
          </div>

          {/* Customer list container */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar mt-4 space-y-2 pr-1">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c: any) => {
                const isSelected =
                  selectedCustomer && selectedCustomer.phone === c.phone;
                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsCustomerSelectorOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? "bg-[#84CC16]/5 border-[#84CC16]"
                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-600 uppercase">
                        {c.firstName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 leading-tight truncate">
                          {c.firstName} {c.lastName || ""}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">
                          {c.phone || "No phone"} • {c.email || "No email"}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        size={16}
                        className="text-[#84CC16] shrink-0 ml-2"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle
                  size={24}
                  className="mx-auto mb-2 text-slate-300"
                />
                <p className="text-xs font-black">No customers found</p>
                <p className="text-[10px] font-medium mt-1">
                  Register a new customer using the button above.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── REGISTER NEW CUSTOMER DIALOG ─── */}
      <Dialog
        open={isNewCustomerModalOpen}
        onOpenChange={setIsNewCustomerModalOpen}
      >
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 font-poppins border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Register New Customer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Create a customer profile. They will be saved to your dashboard
              list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterCustomer} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  First Name *
                </label>
                <Input
                  required
                  placeholder="First name"
                  value={newCustomer.firstName}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      firstName: e.target.value,
                    })
                  }
                  className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Last Name
                </label>
                <Input
                  placeholder="Last name"
                  value={newCustomer.lastName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, lastName: e.target.value })
                  }
                  className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Phone Number *
              </label>
              <Input
                required
                type="text"
                placeholder="+1 234 567 8900"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Billing Address
              </label>
              <StructuredAddressFields
                required
                value={newCustomer.address}
                onChange={(address) =>
                  setNewCustomer({ ...newCustomer, address })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="rounded-xl h-11 text-xs font-black px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCustomerMutation.isPending}
                className="rounded-xl h-11 bg-[#84CC16] hover:bg-[#74b313] text-white text-xs font-black px-6 shadow shadow-lime-500/20 border-none"
              >
                {createCustomerMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

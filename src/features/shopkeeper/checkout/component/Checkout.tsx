/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Check,
  X,
  Loader2,
  UserPlus,
  AlertCircle,
  FileText,
  PencilLine,
  Tag,
  Sparkles,
  Smartphone,
  X as CloseIcon,
  CheckCircle2,
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
  useDeleteCartItem,
  useDeleteAllShopkeeperCartItems,
  useCreateInvoice,
  useCustomersByShopkeeper,
  useCreateCustomer,
} from "../../inventory/hooks/useInventory";
import { useGetMyRepairRequests } from "@/features/customer/repairRequest/hooks/useRepairRequest";
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

// UI Components
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";

const getInventoryImageUrl = (item: any) =>
  item?.image?.url ||
  item?.images?.[0] ||
  item?.sourceImageUrl ||
  item?.sourceImageUrls?.[0] ||
  "";

export default function Checkout() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currency, currencySymbol, formatCurrency, convertAmount } =
    useCurrency();
  const shopkeeperId = (session?.user as { id?: string })?.id;

  // Data fetching queries
  const { data: profileData } = useMyProfile();
  const { data: categoriesData } = useCategories();
  const { data: inventoryData, isLoading: isInventoryLoading } =
    useMyInventory();
  const { data: cartData, isLoading: isCartLoading } =
    useShopkeeperCart(shopkeeperId);
  const { data: repairRequestsData } = useGetMyRepairRequests();
  const { data: customersResponse } = useCustomersByShopkeeper(
    shopkeeperId || "",
  );

  // Mutations
  const { mutateAsync: deleteCartItem } = useDeleteCartItem(shopkeeperId);
  const { mutateAsync: deleteAllCartItems } =
    useDeleteAllShopkeeperCartItems(shopkeeperId);
  const { mutateAsync: addToShopkeeperCart } =
    useAddToShopkeeperCart(shopkeeperId);
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

  // Local item quantities (for Browse Inventory cards)
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

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
  const [, setDismissedRecommendationKey] = useState<string | null>(null);
  const [selectedRecommendationState, setSelectedRecommendationState] =
    useState<{
      key: string;
      ids: string[];
    }>({ key: "", ids: [] });

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
      (req: any) => req.status === "completed" || req.status === "approved",
    );
  }, [repairRequestsData]);

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
      const originalPrice = convertAmount(
        Number(item.itemId?.expectedPrice || 0),
      );
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
  }, [convertAmount, manualPrices, orderCartItems]);

  const subtotalBeforeDiscount = useMemo(() => {
    return orderCartItems.reduce((sum, item) => {
      const price = convertAmount(Number(item.itemId?.expectedPrice || 0));
      return sum + price * item.quantity;
    }, 0);
  }, [convertAmount, orderCartItems]);

  const totalDiscount = useMemo(() => {
    return Math.max(0, subtotalBeforeDiscount - subtotal);
  }, [subtotalBeforeDiscount, subtotal]);

  const tax = 0;
  // Browser number inputs validate against their exact `min` value. Keep the
  // charged amount at the same two-decimal precision displayed to the cashier.
  const totalPayment = useMemo(
    () => Math.round(subtotal * 100) / 100,
    [subtotal],
  );
  const totalCartCount = useMemo(
    () =>
      orderCartItems.reduce(
        (sum, item: any) => sum + Number(item.quantity || 0),
        0,
      ),
    [orderCartItems],
  );

  const recommendationContext = useMemo(() => {
    const combinedText = orderCartItems
      .map((cartItem: any) =>
        [
          cartItem?.itemId?.itemName,
          cartItem?.itemId?.brand,
          cartItem?.itemId?.categoryId?.name,
          cartItem?.customer?.deviceModel,
        ]
          .filter(Boolean)
          .join(" "),
      )
      .join(" ")
      .toLowerCase();

    if (
      /(iphone|ipad|samsung|galaxy|phone|mobile|motorola|pixel|xiaomi|redmi|repair)/.test(
        combinedText,
      )
    ) {
      return {
        detectedCategory: "Phone",
        keywords: ["screen protector", "case", "charger"],
      };
    }

    if (
      /(laptop|macbook|notebook|thinkpad|dell xps|hp elitebook)/.test(
        combinedText,
      )
    ) {
      return {
        detectedCategory: "Laptop",
        keywords: ["bag", "mouse", "charger"],
      };
    }

    return null;
  }, [orderCartItems]);

  const recommendedAddOns = useMemo(() => {
    if (!recommendationContext) {
      return [];
    }

    const selectedIds = new Set<string>();

    return recommendationContext.keywords
      .map((keyword) => {
        const match = inventoryItems.find((item: any) => {
          if (selectedIds.has(item._id)) {
            return false;
          }

          const haystack = [
            item?.itemName,
            item?.brand,
            item?.categoryId?.name,
            item?.productDetails,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(keyword);
        });

        if (match?._id) {
          selectedIds.add(match._id);
          return {
            id: match._id,
            keyword,
            item: match,
          };
        }

        return null;
      })
      .filter(Boolean) as Array<{
      id: string;
      keyword: string;
      item: any;
    }>;
  }, [inventoryItems, recommendationContext]);

  const recommendationKey = useMemo(() => {
    if (!recommendationContext || recommendedAddOns.length === 0) {
      return "";
    }

    return `${recommendationContext.detectedCategory}:${recommendedAddOns
      .map((addon) => addon.id)
      .join(",")}:${orderCartItems.map((item: any) => item._id).join(",")}`;
  }, [orderCartItems, recommendedAddOns, recommendationContext]);

  const selectedRecommendationIds =
    selectedRecommendationState.key === recommendationKey
      ? selectedRecommendationState.ids
      : recommendedAddOns.map((addon) => addon.id);

  const isRecommendationOpen = false;

  const selectedRecommendationItems = recommendedAddOns.filter((addon) =>
    selectedRecommendationIds.includes(addon.id),
  );

  const selectedRecommendationTotal = selectedRecommendationItems.reduce(
    (sum, addon) => sum + Number(addon.item?.expectedPrice || 0),
    0,
  );

  // ─── Cart Action Handlers ──────────────────────────────────────────────────
  const handleAddToCart = async (itemId: string, qtyToAdd: number) => {
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
      await addToShopkeeperCart({ item, quantity: qtyToAdd });

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
    itemId: string,
    currentQty: number,
    delta: number,
  ) => {
    if (!shopkeeperId) return;

    if (currentQty + delta <= 0) {
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
      const item = inventoryItems.find(
        (inventoryItem: any) => inventoryItem._id === itemId,
      );
      if (!item) {
        toast.error("This inventory item is no longer available");
        return;
      }

      await addToShopkeeperCart({ item, quantity: delta });
    } catch {
      toast.error("Failed to adjust quantity");
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

  const processCheckout = async (payment: CheckoutPaymentResult) => {
    if (!shopkeeperId) {
      toast.error("Session expired");
      return;
    }

    const receiptWindow = openThermalReceiptWindow();

    try {
      setIsPlacingOrder(true);
      const transactionDate = new Date();
      const pricedOrderCartItems = orderCartItems.map((cartItem: any) => {
        const originalPrice = convertAmount(
          Number(cartItem.itemId?.expectedPrice || 0),
        );
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
      });

      const receiptOpened = printThermalReceipt(
        {
          invoiceNumber,
          createdAt: transactionDate,
          shopName: profileData?.data?.shopName || "imoscan Store",
          logoUrl: profileData?.data?.image?.url,
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

      setSelectedCustomer(null);
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
      setIsPaymentModalOpen(false);

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

  // Helper to adjust browse card local qty state
  const handleLocalQtyChange = (itemId: string, delta: number) => {
    setLocalQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = current + delta;
      return { ...prev, [itemId]: next < 1 ? 1 : next };
    });
  };

  // Helper buttons for Services/Products
  const handleAddProductClick = () => {
    setSelectedCategory(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    toast.info("Browse or search inventory items below!");
  };

  const handleAddServiceClick = () => {
    // Find category ID for Repairing
    const repairingCat = categories.find((cat: any) =>
      cat.name?.toLowerCase().includes("repair"),
    );
    if (repairingCat) {
      setSelectedCategory(repairingCat._id);
    } else {
      setSelectedCategory("repairing");
    }
    toast.info("Showing repair services from inventory!");
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

  const handleToggleRecommendation = (id: string) => {
    setSelectedRecommendationState((prev) => {
      const baseIds =
        prev.key === recommendationKey
          ? prev.ids
          : recommendedAddOns.map((addon) => addon.id);

      const nextIds = baseIds.includes(id)
        ? baseIds.filter((existingId) => existingId !== id)
        : [...baseIds, id];

      return {
        key: recommendationKey,
        ids: nextIds,
      };
    });
  };

  const handleDismissRecommendations = () => {
    setDismissedRecommendationKey(recommendationKey);
  };

  const handleAddSelectedRecommendations = async () => {
    const itemsToAdd = selectedRecommendationItems;

    if (itemsToAdd.length === 0) {
      toast.error("Select at least one recommended add-on");
      return;
    }

    try {
      for (const addon of itemsToAdd) {
        await handleAddToCart(addon.id, 1);
      }

      setDismissedRecommendationKey(recommendationKey);
      toast.success("Recommended add-ons added to checkout");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add recommended items");
    }
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, services..."
                className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-all"
              />
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
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
                onClick={() => setSelectedCategory(cat._id)}
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
              onClick={() => setSelectedCategory("repairing")}
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
          ) : filteredInventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
              {filteredInventory.map((item: any) => {
                const qty = localQuantities[item._id] || 1;
                const itemImageUrl = getInventoryImageUrl(item);

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

                    {/* Price and Add Row */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[15px] font-black text-slate-900">
                        {formatCurrency(convertAmount(item.expectedPrice))}
                      </p>

                      {/* Quantity select & Add */}
                      <div className="flex items-center gap-2">
                        {/* Qty count adjuster */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
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
                          onClick={() => handleAddToCart(item._id, qty)}
                          disabled={addingItemId === item._id}
                          className="w-8 h-8 rounded-full bg-[#84CC16] text-white flex items-center justify-center hover:bg-[#74b313] active:scale-95 shadow shadow-lime-500/25 transition-all"
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
        </div>

        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Developer Notes
              </p>
              <h3 className="text-lg font-black text-slate-950">
                Manual discount flow
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm font-medium text-slate-600 md:grid-cols-2">
            <p>Manual discount works by editing the item price directly.</p>
            <p>Discount percentage updates automatically when price changes.</p>
            <p>Each item shows both discount percent and amount saved.</p>
            <p>Total discount is shown separately before final payment.</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-red-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Recommendation Setup Examples
              </p>
              <h3 className="text-lg font-black text-slate-950">
                Category-based add-on reminder
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm font-medium text-slate-600 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-2">
              <p>Phones -&gt; screen protectors, phone cases, chargers</p>
              <p>Laptops -&gt; laptop bags, chargers, mouse</p>
              <p>Repaired devices -&gt; screen protectors, phone cases</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 text-sm">
              The system matches the checkout item category and shows relevant
              add-ons automatically before charging.
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Order Details Sidebar) ─── */}
      <div className="w-full xl:w-[420px] bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col shrink-0 min-h-[calc(100vh-120px)]">
        {/* Order Details Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Order Details
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {totalCartCount} items in list
            </p>
          </div>
          <button
            onClick={handleClearOrder}
            disabled={orderCartItems.length === 0}
            className="text-xs font-black text-red-500 hover:text-red-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Clear Order
          </button>
        </div>

        {/* Checkout Modes (Walk-In, Repair, Delivery, Online, Return) */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl mt-4">
          {(["walk-in", "repair", "delivery", "online", "return"] as const).map(
            (mode) => (
              <button
                key={mode}
                onClick={() => {
                  setCheckoutMode(mode);
                  if (mode === "return") {
                    setIsReturnModalOpen(true);
                  }
                }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  checkoutMode === mode
                    ? "bg-[#84CC16] text-white shadow shadow-lime-500/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ),
          )}
        </div>

        <ReturnInvoiceModal
          open={isReturnModalOpen}
          onOpenChange={setIsReturnModalOpen}
          shopkeeperId={shopkeeperId}
        />

        {/* Customer Select / Card */}
        <div className="mt-4">
          <div
            onClick={() => setIsCustomerSelectorOpen(true)}
            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">
                  Customer {selectedCustomer ? "(Auto-filled)" : ""}
                </p>
                {selectedCustomer ? (
                  <p className="text-sm font-black text-slate-950 truncate">
                    {selectedCustomer.firstName}{" "}
                    {selectedCustomer.lastName || ""}
                  </p>
                ) : (
                  <p className="text-sm font-black text-slate-400">
                    Select Customer
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedCustomer && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCustomer(null);
                    setPulledRepairItem(null);
                  }}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-355 text-slate-500 flex items-center justify-center X"
                >
                  <X size={10} />
                </button>
              )}
              <ChevronRight
                size={16}
                className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Itemized Cart List */}
        <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar space-y-3 mt-6 pr-1">
          {isCartLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : orderCartItems.length > 0 ? (
            orderCartItems.map((cartItem: any) => {
              const item = cartItem.itemId;
              const originalPrice = convertAmount(
                Number(item?.expectedPrice || 0),
              );
              const manualValue = manualPrices[cartItem._id];
              const parsedManual = Number(manualValue);
              const isExceeded =
                manualValue !== undefined &&
                manualValue !== "" &&
                Number.isFinite(parsedManual) &&
                parsedManual > originalPrice;

              let sellingPrice =
                manualValue !== undefined &&
                manualValue !== "" &&
                Number.isFinite(parsedManual)
                  ? parsedManual
                  : originalPrice;

              if (sellingPrice > originalPrice) {
                sellingPrice = originalPrice;
              }
              if (sellingPrice < 0) {
                sellingPrice = 0;
              }

              const discountAmount = Math.max(0, originalPrice - sellingPrice);
              const discountPercent =
                originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
              const hasDiscount = discountAmount > 0.001;

              return (
                <div
                  key={cartItem._id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {item?.image?.url ? (
                          <Image
                            src={item.image.url}
                            alt={item.itemName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package size={16} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate leading-snug">
                          {item?.itemName || "Custom Item"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 truncate">
                          {cartItem.type === "repair"
                            ? "Repair Service"
                            : item?.brand || "Brand"}{" "}
                          - {item?.currentState || "New"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <button
                        onClick={() => handleDeleteCartItem(cartItem._id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                        <button
                          disabled={cartItem.type === "repair"}
                          onClick={() =>
                            handleUpdateCartQty(
                              cartItem._id,
                              item?._id,
                              cartItem.quantity,
                              -1,
                            )
                          }
                          className="w-5.5 h-5.5 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-40"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center text-xs font-black">
                          {cartItem.quantity}
                        </span>
                        <button
                          disabled={cartItem.type === "repair"}
                          onClick={() =>
                            handleUpdateCartQty(
                              cartItem._id,
                              item?._id,
                              cartItem.quantity,
                              1,
                            )
                          }
                          className="w-5.5 h-5.5 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-40"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Single Selling Price Box */}
                  <div
                    className={`mt-4 rounded-xl border px-3.5 py-2.5 shadow-sm transition-all ${
                      isExceeded
                        ? "border-red-500 bg-red-50/50 text-red-700 ring-2 ring-red-500/20"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PencilLine
                          size={12}
                          className={
                            isExceeded ? "text-red-500" : "text-slate-400"
                          }
                        />
                        <p
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            isExceeded ? "text-red-600" : "text-slate-500"
                          }`}
                        >
                          Selling Price
                        </p>
                      </div>
                      {hasDiscount && !isExceeded && (
                        <span className="text-[10px] font-black text-[#84CC16] bg-[#84CC16]/10 px-2 py-0.5 rounded-full border border-[#84CC16]/20">
                          -{discountPercent.toFixed(0)}% Off
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`text-sm font-black ${
                          isExceeded ? "text-red-600" : "text-slate-900"
                        }`}
                      >
                        {currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={manualValue ?? sellingPrice.toFixed(2)}
                        onChange={(e) =>
                          handlePriceInputChange(cartItem._id, e.target.value)
                        }
                        onBlur={(e) => {
                          const nextValue = e.target.value.trim();
                          if (nextValue === "") {
                            setManualPrices((prev) => {
                              const next = { ...prev };
                              delete next[cartItem._id];
                              return next;
                            });
                            return;
                          }

                          const numericValue = Number(nextValue);
                          if (!Number.isFinite(numericValue)) {
                            setManualPrices((prev) => ({
                              ...prev,
                              [cartItem._id]: originalPrice.toFixed(2),
                            }));
                            return;
                          }

                          if (numericValue > originalPrice) {
                            toast.error(
                              `Selling price cannot exceed the original price (${currencySymbol}${originalPrice.toFixed(2)}).`,
                            );
                            setManualPrices((prev) => ({
                              ...prev,
                              [cartItem._id]: originalPrice.toFixed(2),
                            }));
                            return;
                          }

                          if (numericValue < 0) {
                            setManualPrices((prev) => ({
                              ...prev,
                              [cartItem._id]: "0.00",
                            }));
                            return;
                          }

                          setManualPrices((prev) => ({
                            ...prev,
                            [cartItem._id]: numericValue.toFixed(2),
                          }));
                        }}
                        className={`w-full bg-transparent text-sm font-black outline-none ${
                          isExceeded
                            ? "text-red-600 placeholder:text-red-300"
                            : "text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  {isExceeded && (
                    <p className="mt-1.5 text-[11px] font-bold text-red-500 ml-1">
                      Selling price cannot exceed {currencySymbol}
                      {originalPrice.toFixed(2)}
                    </p>
                  )}

                  {hasDiscount && !isExceeded && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-[#FCA5A5] bg-[#FFF7F7] px-3 py-2">
                      <div className="flex items-center gap-2 text-[#65A30D]">
                        <Tag size={14} />
                        <span className="text-xs font-black">Discount</span>
                      </div>
                      <span className="text-xs font-black text-[#65A30D]">
                        {discountPercent.toFixed(
                          discountPercent % 1 === 0 ? 0 : 2,
                        )}
                        % (-
                        {currencySymbol}
                        {(discountAmount * cartItem.quantity).toFixed(2)})
                      </span>
                    </div>
                  )}

                  {/* <div className="mt-3 flex justify-end">
                    <p className="text-sm font-black text-slate-900">
                      Line Total: {currencySymbol}
                      {(sellingPrice * cartItem.quantity).toFixed(2)}
                    </p>
                  </div> */}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <ShoppingCart size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-black">Cart is empty</p>
              <p className="text-[10px] font-medium mt-1">
                Add items from the inventory to sell.
              </p>
            </div>
          )}
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-100 pt-5">
          <button
            onClick={handleAddServiceClick}
            className="flex items-center justify-center gap-1.5 py-3 border border-[#CDE7B0] bg-[#F8FFF0] rounded-2xl text-xs font-black text-[#65A30D] hover:border-[#84CC16] hover:bg-lime-50/40 transition-all active:scale-[0.98]"
          >
            <Plus size={14} className="text-[#84CC16]" strokeWidth={3} />
            Add more items
          </button>
          <button
            onClick={handleAddProductClick}
            className="flex items-center justify-center gap-1.5 py-3 border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:border-[#84CC16] hover:bg-lime-50/20 transition-all active:scale-[0.98]"
          >
            <Plus size={14} className="text-[#84CC16]" strokeWidth={3} />
            Add Product
          </button>
        </div>

        {checkoutMode === "delivery" && (
          <div className="mt-4 rounded-2xl border border-slate-150 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-black text-slate-900">
                Delivery Details
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-500">
                Record local delivery route, delivered items, and completed
                payment.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  From
                </label>
                <AddressAutocomplete
                  value={deliveryDetails.from}
                  onChange={(event) =>
                    setDeliveryDetails((prev) => ({
                      ...prev,
                      from: event.target.value,
                    }))
                  }
                  placeholder="Store, warehouse, pickup address..."
                  className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Delivery To
                </label>
                <AddressAutocomplete
                  value={deliveryDetails.deliveryTo}
                  onChange={(event) =>
                    setDeliveryDetails((prev) => ({
                      ...prev,
                      deliveryTo: event.target.value,
                    }))
                  }
                  placeholder="Customer address or delivery destination"
                  className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Items Being Delivered
                </label>
                <span className="text-[10px] font-black text-slate-400">
                  {selectedDeliveryItemIds.length}/{cartItems.length}
                </span>
              </div>

              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {cartItems.length > 0 ? (
                  cartItems.map((cartItem: any) => {
                    const item = cartItem.itemId;
                    const checked = selectedDeliveryItemIds.includes(
                      cartItem._id,
                    );

                    return (
                      <label
                        key={cartItem._id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                          checked
                            ? "border-[#84CC16] bg-lime-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setDeliveryDetails((prev) => ({
                              ...prev,
                              selectedCartItemIds: checked
                                ? prev.selectedCartItemIds.filter(
                                    (id) => id !== cartItem._id,
                                  )
                                : [...prev.selectedCartItemIds, cartItem._id],
                            }))
                          }
                          className="h-4 w-4 accent-[#84CC16]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-slate-900">
                            {item?.itemName || "Custom Item"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500">
                            Qty {cartItem.quantity} •{" "}
                            {formatCurrency(
                              convertAmount(Number(item?.expectedPrice || 0)),
                            )}
                          </p>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs font-bold text-slate-400">
                    Add items to the cart before creating a delivery.
                  </div>
                )}
              </div>
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

        {/* Calculations / Summary */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2.5 mt-4 text-xs font-bold text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-slate-900 font-black">
              {currencySymbol}
              {subtotalBeforeDiscount.toFixed(2)}
            </span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Total Discount</span>
              <span className="font-black">
                -{currencySymbol}
                {totalDiscount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200/60 pt-2.5 mt-2">
            <span>Total Payment</span>
            <span className="text-[#84CC16]">
              {currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={orderCartItems.length === 0 || isPlacingOrder}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#84CC16] text-white text-sm font-black shadow-lg shadow-lime-500/20 transition-all hover:bg-[#75b213] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none mt-4 w-full"
        >
          {isPlacingOrder ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ShoppingCart size={16} strokeWidth={2.5} />
              <span>Charge Now</span>
            </>
          )}
        </button>
      </div>

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
      <Dialog
        open={isRecommendationOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDismissRecommendations();
          }
        }}
      >
        <DialogContent
          className="w-[min(1320px,calc(100vw-2rem))] max-w-[1320px] rounded-[32px] border border-red-600 bg-white p-0 shadow-2xl"
          showCloseButton={false}
        >
          <div className="p-6 md:p-7">
            <DialogHeader className="flex-row items-start justify-between gap-4 text-left">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EEF9D7] text-[#84CC16]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <DialogTitle className="text-[30px] font-black tracking-tight text-slate-950">
                      Recommended Add-ons
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                      Suggested accessories based on items in this checkout.
                      Please offer these to the customer before charging.
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <DialogClose asChild>
                <button
                  type="button"
                  onClick={handleDismissRecommendations}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                >
                  <CloseIcon size={18} />
                </button>
              </DialogClose>
            </DialogHeader>

            <div className="mt-5 rounded-2xl border border-[#E5F0C7] bg-[#FAFDF2] px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <Smartphone size={16} className="text-slate-500" />
                Detected category:
                <span className="text-[#84CC16]">
                  {recommendationContext?.detectedCategory}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedAddOns.map((addon) => {
                const isSelected = selectedRecommendationIds.includes(addon.id);

                return (
                  <div
                    key={addon.id}
                    className={`flex h-full min-h-[350px] flex-col rounded-[28px] border p-4 transition-all ${
                      isSelected
                        ? "border-[#B8DF78] bg-[#FBFEF5] shadow-sm"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="relative">
                      <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                        {addon.item?.image?.url ? (
                          <Image
                            src={addon.item.image.url}
                            alt={addon.item.itemName}
                            fill
                            className="object-contain p-3"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-slate-300" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleRecommendation(addon.id)}
                        className={`absolute right-3 top-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm ${
                          isSelected
                            ? "border-[#84CC16] bg-[#84CC16] text-white"
                            : "border-slate-200 bg-white text-transparent"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-1 flex-col">
                      <p className="min-h-[84px] text-[17px] font-black leading-[1.35] text-slate-950 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
                        {addon.item?.itemName || addon.keyword}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        {addon.item?.brand ||
                          addon.item?.categoryId?.name ||
                          "Accessory"}
                      </p>
                      <p className="mt-3 text-2xl font-black text-slate-950">
                        {formatCurrency(
                          convertAmount(Number(addon.item?.expectedPrice || 0)),
                        )}
                      </p>
                      <div className="mt-auto pt-4">
                        <button
                          type="button"
                          onClick={() => handleToggleRecommendation(addon.id)}
                          className={`flex w-full items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-black transition-all ${
                            isSelected
                              ? "border-[#DDECB9] bg-white text-[#84CC16]"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {isSelected ? "Added" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDismissRecommendations}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleAddSelectedRecommendations}
                className="h-12 rounded-2xl bg-[#84CC16] px-5 text-sm font-black text-white shadow-lg shadow-lime-500/20 transition-colors hover:bg-[#74b313]"
              >
                Add Selected ({selectedRecommendationItems.length}) -{" "}
                {formatCurrency(convertAmount(selectedRecommendationTotal))}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <AddressAutocomplete
                placeholder="123 Street Name, City"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
                className="rounded-xl h-11 border-slate-200 text-xs font-bold focus-visible:ring-[#84CC16]"
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

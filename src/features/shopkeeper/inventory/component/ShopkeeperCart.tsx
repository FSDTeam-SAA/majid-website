"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Download,
  Loader2,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useDeleteAllShopkeeperCartItems,
  useDeleteCartItem,
  useCreateInvoice,
  useShopkeeperCart,
} from "../hooks/useInventory";
import type { CartItem } from "../types";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import CartInvoicePDF from "./CartInvoicePDF";
import InvoicePreviewModal from "./InvoicePreviewModal";
import { useCurrency } from "@/hooks/useCurrency";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { generateGoogleReviewQrCodeDataUrl } from "@/features/shopkeeper/settings/utils/googleReviewQr";

const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-6)}`;

export default function ShopkeeperCart() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const shopkeeperId = (session?.user as { id?: string })?.id;
  const {
    data: cartData,
    isLoading,
    isError,
  } = useShopkeeperCart(shopkeeperId);
  const { mutate: deleteCartItem, isPending: isDeleting } =
    useDeleteCartItem(shopkeeperId);
  const { mutateAsync: deleteAllCartItems } =
    useDeleteAllShopkeeperCartItems(shopkeeperId);
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { data: profileData } = useMyProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const { currency, formatCurrency } = useCurrency();

  const cartItems = useMemo(() => cartData?.data || [], [cartData]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return cartItems;

    return cartItems.filter((cartItem) => {
      const item = cartItem.itemId;
      return (
        item?.itemName?.toLowerCase().includes(query) ||
        item?.imeiNumber?.toLowerCase().includes(query) ||
        item?.sku?.toLowerCase().includes(query)
      );
    });
  }, [cartItems, searchQuery]);

  const totalQuantity = cartItems.reduce(
    (sum, cartItem) => sum + (cartItem.quantity || 0),
    0,
  );
  const totalValue = cartItems.reduce((sum, cartItem) => {
    const originalPrice = cartItem.itemId?.expectedPrice || 0;
    const price =
      editedPrices[cartItem._id] !== undefined
        ? editedPrices[cartItem._id]
        : originalPrice;
    return sum + price * cartItem.quantity;
  }, 0);

  const handleGenerateInvoice = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setIsGeneratingInvoice(true);
      const invoiceNumber = generateInvoiceNumber();
      const shopkeeper = cartItems[0]?.shopkeeperId;
      const qrCodeDataUrl = await QRCode.toDataURL(
        JSON.stringify({
          invoiceNumber,
          shopkeeperId,
          totalItems: cartItems.length,
          totalValue,
        }),
        { margin: 1, width: 220 },
      );
      const reviewQrCode = await generateGoogleReviewQrCodeDataUrl(
        profileData?.data?.googleReviewPageUrl,
      );

      const blob = await pdf(
        <CartInvoicePDF
          cartItems={cartItems}
          invoiceNumber={invoiceNumber}
          qrCodeDataUrl={qrCodeDataUrl}
          reviewQrCodeDataUrl={reviewQrCode?.qrCodeDataUrl}
          shopkeeper={shopkeeper}
          editedPrices={editedPrices}
        />,
      ).toBlob();
      const fileName = `${invoiceNumber}-cart-invoice.pdf`;
      const invoiceFile = new File([blob], fileName, {
        type: "application/pdf",
      });

      if (!shopkeeperId) {
        toast.error("Session not found");
        return;
      }

      await createInvoice({
        shopkeeperId,
        type: "invoice",
        invoice: invoiceFile,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      await deleteAllCartItems();
      toast.success("Invoice downloaded and cart cleared");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-6 font-poppins">
        <div className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 rounded-[28px] bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-500">Failed to load cart</h2>
        <p className="text-slate-500">
          Please check your connection or login again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-10 font-poppins dark:bg-background">
      <div className="flex flex-col gap-5 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-card md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.back()}
            className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 text-slate-500 transition hover:border-[#84CC16]/50 hover:text-[#84CC16] dark:border-slate-700"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#84CC16]/10 px-3 py-1 text-xs font-black text-[#84CC16]">
              <ShoppingCart size={14} />
              Ready for sale
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F172A] dark:text-white">
              Cart Items
            </h1>
            <p className="mt-1 text-sm font-bold text-[#64748B] dark:text-slate-300">
              {totalQuantity} units in cart ({cartItems.length} models) -{" "}
              {formatCurrency(totalValue, currency)} total value
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryTile label="Models" value={cartItems.length} />
            <SummaryTile label="Units" value={totalQuantity} />
            <SummaryTile
              label="Value"
              value={formatCurrency(totalValue, currency)}
            />
          </div>
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            disabled={cartItems.length === 0 || isGeneratingInvoice}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-5 text-sm font-black text-white shadow-lg shadow-lime-500/20 transition hover:bg-[#76b813] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingInvoice ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Preview Invoice
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0F172A] dark:text-white">
            Selected Products
          </h2>
          <p className="text-sm font-bold text-slate-500">
            Products added from inventory for the next selling step.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search cart items..."
            className="h-12 w-full rounded-xl border border-slate-100 bg-white pl-12 pr-4 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:ring-[#84CC16] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((cartItem, index) => (
            <CartProductCard
              key={cartItem._id}
              cartItem={cartItem}
              index={index}
              isDeleting={isDeleting}
              editedPrice={editedPrices[cartItem._id]}
              onDelete={(cartId) => {
                deleteCartItem(cartId, {
                  onSuccess: () => toast.success("Cart item deleted"),
                  onError: () => toast.error("Failed to delete cart item"),
                });
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            No cart items found
          </h3>
          <p className="text-sm font-bold text-slate-500">
            Add products from inventory to see them here.
          </p>
        </div>
      )}

      <InvoicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        cartItems={cartItems}
        editedPrices={editedPrices}
        setEditedPrices={setEditedPrices}
        onDownload={handleGenerateInvoice}
        isGeneratingInvoice={isGeneratingInvoice}
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-24 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-[#0F172A] dark:text-white">
        {value}
      </p>
    </div>
  );
}

function CartProductCard({
  cartItem,
  index,
  isDeleting,
  onDelete,
  editedPrice,
}: {
  cartItem: CartItem;
  index: number;
  isDeleting: boolean;
  onDelete: (cartId: string) => void;
  editedPrice?: number;
}) {
  const { currency, formatCurrency } = useCurrency();
  const item = cartItem.itemId;
  const originalPrice = item?.expectedPrice || 0;
  const currentPrice = editedPrice !== undefined ? editedPrice : originalPrice;
  const lineTotal = currentPrice * cartItem.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-card"
    >
      <div className="flex gap-5 p-5">
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          {item?.image?.url ? (
            <Image
              src={item.image.url}
              alt={item?.itemName || "Unknown Item"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Package size={40} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-[15px] font-black leading-tight text-[#0F172A] dark:text-white">
              {item?.itemName || "Unknown Item"}
            </h3>
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="rounded-full bg-[#84CC16] px-2.5 py-1 text-[10px] font-black text-white">
                x{cartItem.quantity}
              </span>
              <button
                onClick={() => onDelete(cartItem._id)}
                disabled={isDeleting}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-500/10 cursor-pointer"
                aria-label={`Delete ${item?.itemName || "item"} from cart`}
              >
                <Trash2 size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="space-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <p>IMEI: {item?.imeiNumber || "N/A"}</p>
            <p>Condition: {item?.currentState || "N/A"}</p>
            <p>Added: {new Date(cartItem.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Unit price
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-[#0F172A] dark:text-white">
                  {formatCurrency(currentPrice, currency)}
                </p>
                {originalPrice > currentPrice && (
                  <p className="text-xs font-bold text-slate-400 line-through">
                    {formatCurrency(originalPrice, currency)}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-[#84CC16]/10 px-3 py-2 text-right">
              <div className="flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest text-[#84CC16]">
                <Sparkles size={12} />
                Total
              </div>
              <p className="text-sm font-black text-[#0F172A] dark:text-white">
                {formatCurrency(lineTotal, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

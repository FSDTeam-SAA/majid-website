"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  useShopkeeperCart,
  useDeleteCartItem,
  useDeleteAllShopkeeperCartItems,
} from "../../inventory/hooks/useInventory";
import { ShoppingCart, Trash2, ArrowLeft, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

export default function Cart() {
  const { data: session } = useSession();
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const shopkeeperId = (session?.user as { id?: string })?.id;

  const {
    data: cartData,
    isLoading,
    isError,
  } = useShopkeeperCart(shopkeeperId);
  const { mutate: deleteCartItem } = useDeleteCartItem(shopkeeperId);
  const { mutate: clearCart } = useDeleteAllShopkeeperCartItems(shopkeeperId);

  const cartItems = cartData?.data || [];

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.itemId?.expectedPrice || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const handleDeleteItem = (id: string) => {
    deleteCartItem(id, {
      onSuccess: () => toast.success("Item removed from cart"),
      onError: () => toast.error("Failed to remove item"),
    });
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart(undefined, {
        onSuccess: () => toast.success("Cart cleared"),
        onError: () => toast.error("Failed to clear cart"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#84CC16]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-500">Failed to load cart</h2>
        <p className="text-slate-500">
          Please check your connection or try again.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-card border border-border rounded-xl hover:bg-surface transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                <ShoppingCart
                  className="text-[#84CC16]"
                  size={28}
                  strokeWidth={2.5}
                />
                Your Cart
              </h1>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                {cartItems.length} item{cartItems.length !== 1 && "s"} in your
                cart
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition cursor-pointer"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item._id}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-border flex-shrink-0">
                    {item.itemId?.image?.url ? (
                      <Image
                        src={item.itemId.image.url}
                        alt={item.itemId.itemName || "Item"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={32} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-black text-foreground truncate">
                      {item.itemId?.itemName}
                    </h3>
                    <p className="text-[12px] font-bold text-muted-foreground mt-1">
                      IMEI/SKU:{" "}
                      {item.itemId?.imeiNumber || item.itemId?.sku || "N/A"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-surface border border-border rounded-lg text-xs font-black text-foreground">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="text-lg font-black text-foreground">
                        {formatCurrency(
                          (item.itemId?.expectedPrice || 0) *
                            (item.quantity || 1),
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="lg:w-80">
              <div className="bg-card border border-border rounded-3xl p-6 sticky top-24 shadow-sm">
                <h2 className="text-lg font-black text-foreground mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm font-bold text-muted-foreground">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-muted-foreground">
                    <span>Discount</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex justify-between text-lg font-black text-foreground">
                    <span>Total</span>
                    <span className="text-[#84CC16]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <button className="w-full py-4 bg-[#84CC16] text-white font-black text-[15px] rounded-2xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer uppercase tracking-widest">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-[32px] py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm font-bold text-muted-foreground max-w-sm mb-8">
              Looks like you haven&apos;t added any items to your cart yet. Go
              back to inventory to add items.
            </p>
            <button
              onClick={() => router.push("/shopkeeper/inventory")}
              className="px-8 py-3.5 bg-surface border border-border text-foreground font-black text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Back to Inventory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

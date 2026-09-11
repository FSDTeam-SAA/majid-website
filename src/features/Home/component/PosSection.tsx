"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Users,
  ReceiptText,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  ScanLine,
} from "lucide-react";
import Link from "next/link";

const posCapabilities = [
  "Inventory browsing with category filtering, search, and quick cart actions",
  "Customer selection or instant customer creation during checkout",
  "Walk-in, repair, delivery, online, and return checkout modes",
  "Invoice generation tied to orders, repairs, and payment methods",
];

const posPillars = [
  {
    title: "Inventory to Cart",
    description:
      "Move products from stock to cart with quantity control and live order summary.",
    icon: Package,
    tone: "bg-[#EEFBCC]",
  },
  {
    title: "Customer-Aware Checkout",
    description:
      "Attach customers, repair jobs, delivery details, and payment context before finalizing.",
    icon: Users,
    tone: "bg-[#E1F0FF]",
  },
  {
    title: "Invoice & Payment",
    description:
      "Generate invoices for multiple selling scenarios without leaving the workflow.",
    icon: ReceiptText,
    tone: "bg-[#FFF1F1]",
  },
];

const checkoutModes = ["Walk-in", "Repair", "Delivery", "Online", "Return"];

export default function PosSection() {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-[#0F172A] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)] md:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#84CC16]/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[#3B82F6]/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-[#84CC16]">
                      Counter POS Desk
                    </p>
                    <h3 className="mt-2 text-2xl font-black">
                      Faster counter operations for mobile shops
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
                      Unify walk-in retail sales, repair pickups, customer
                      balances, and thermal receipts in a streamlined counter
                      flow.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                      Cart Value
                    </p>
                    <p className="mt-1 text-2xl font-black">$1,284</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#84CC16]/15 p-3">
                          <ScanLine className="h-5 w-5 text-[#84CC16]" />
                        </div>
                        <div>
                          <p className="text-sm font-black">Browse Inventory</p>
                          <p className="text-xs text-white/55">
                            Search by item, brand, IMEI, or SKU
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-[#84CC16] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#071B28]">
                        In stock
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        "iPhone 14 Pro 256GB",
                        "Display Assembly",
                        "Battery Pack OEM",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {item}
                            </p>
                            <p className="text-xs text-white/50">
                              SKU-10{index + 2} • Ready for checkout
                            </p>
                          </div>
                          <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/70">
                            Add
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-white p-5 text-[#0F172A]">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#E1F0FF] p-3">
                        <Wallet className="h-5 w-5 text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="text-sm font-black">Checkout Summary</p>
                        <p className="text-xs text-slate-500">
                          Multi-mode order processing
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {checkoutModes.map((mode, index) => (
                        <div
                          key={mode}
                          className={`flex items-center justify-between rounded-2xl px-3 py-3 ${
                            index === 1 ? "bg-[#EEFBCC]" : "bg-slate-50"
                          }`}
                        >
                          <span className="text-sm font-semibold">{mode}</span>
                          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                            Mode
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#0F172A] px-4 py-4 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                        Payment Mix
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        Cash, card, online, and COD-ready workflows
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {posPillars.map((item) => (
                    <div
                      key={item.title}
                      className={`${item.tone} rounded-[26px] p-5 text-[#0F172A]`}
                    >
                      <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-black">{item.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <ShoppingCart className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
                Counter & Retail POS
              </span>
            </div>

            <h2 className="max-w-[620px] text-4xl font-black leading-tight text-[#0F172A] md:text-5xl">
              Turn this system into a
              <span className="text-[#3B82F6]"> smarter retail counter </span>
              for sales, repairs, and returns.
            </h2>

            <p className="mt-6 max-w-[610px] text-base leading-7 text-slate-600 md:text-lg">
              Equip your store with integrated inventory control, rapid walk-in
              checkout, customer balance tracking, flexible payment methods, and
              seamless repair collection.
            </p>

            <div className="mt-8 space-y-4">
              {posCapabilities.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-[#3B82F6]/10 p-1">
                    <CheckCircle2 className="h-4 w-4 text-[#3B82F6]" />
                  </div>
                  <p className="text-sm font-medium leading-6 text-slate-700 md:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#3B82F6] px-6 py-3 text-sm font-black text-white transition-transform hover:scale-[1.02]"
              >
                Launch POS Workflow
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                <Users className="h-4 w-4 text-[#84CC16]" />
                Checkout modes linked to customers, repairs, and invoices
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

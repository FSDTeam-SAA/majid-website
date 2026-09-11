"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Store, ArrowUpRight } from "lucide-react";

const buyerFeatures = [
  "Device blacklist / stolen status check",
  "Real-time IMEI verification before buying",
  "AI-based risk analysis (Low / Medium / High)",
  "Accurate market price estimation",
  "Clear understanding of device history & condition",
  "Confidence to make a safe purchase decision",
];

const shopFeatures = [
  "Instant bulk device verification",
  "Detect high-risk / problematic devices quickly",
  "Built-in invoice generation system",
  "Auto-filled device details in invoices",
  "Send invoice via SMS / Email / Print",
  "Build trust with customers using verified reports",
];

export default function ForTheSmartBuyer() {
  return (
    <section className="py-24 bg-[#0F172A]">
      <div className="mx-auto container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For the Smart Buyer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-card rounded-[40px] p-10 md:p-14 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center mb-10 text-white shadow-lg shadow-blue-500/20">
                <ShoppingCart size={28} />
              </div>
              <h3 className="text-3xl font-black text-[#0F172A] dark:text-white mb-4">
                For the Smart Buyer
              </h3>
              <p className="text-[#64748B] text-base leading-relaxed mb-10 max-w-sm dark:text-white">
                Never get scammed again. Verify sellers claims instantly and
                negotiate with confidence using real-time data.
              </p>

              <ul className="space-y-4 mb-12">
                {buyerFeatures.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm font-semibold text-[#334155] dark:text-white"
                  >
                    <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end mt-auto pt-8 border-t border-gray-50">
              <button className="flex items-center gap-2 text-sm font-black text-[#3B82F6] hover:gap-3 transition-all">
                Explore Solutions <ArrowUpRight size={18} />
              </button>
            </div>
          </motion.div>

          {/* Card 2: For Shop Owners */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-card rounded-[40px] p-10 md:p-14 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 bg-[#84CC16] rounded-full flex items-center justify-center mb-10 text-white shadow-lg shadow-lime-500/20">
                <Store size={28} />
              </div>
              <h3 className="text-3xl font-black text-[#0F172A] dark:text-white mb-4">
                For Shop Owners
              </h3>
              <p className="text-[#64748B] text-base leading-relaxed mb-10 max-w-sm dark:text-white">
                Protect your business margins. Automatically generate trade-in
                values and verify inventory legitimacy at scale.
              </p>

              <ul className="space-y-4 mb-12">
                {shopFeatures.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm font-semibold text-[#334155] dark:text-white"
                  >
                    <div className="w-1.5 h-1.5 bg-[#84CC16] rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between mt-auto pt-8 border-t border-gray-50">
              <button className="flex items-center gap-2 text-sm font-black text-[#3B82F6] hover:gap-3 transition-all">
                Explore Enterprise Solutions <ArrowUpRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

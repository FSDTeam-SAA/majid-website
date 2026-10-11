"use client";

import { motion } from "framer-motion";
import {
  TriangleAlert,
  CircleX,
  Shield,
  Ban,
  Lock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function ImportantWarning() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Decor */}
      {/* <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50 blur-[120px] rounded-full opacity-50" />
      </div> */}

      <div className="mx-auto container px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-card rounded-[40px] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          {/* Left Side: Content */}
          <div className="flex-1 w-full">
            {/* Warning Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FFF1F1] text-[#EF4444] dark:bg-card/80 px-4 py-2 rounded-full mb-8 border border-[#FEE2E2]">
              <TriangleAlert className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs font-bold tracking-wide uppercase">
                Important Warning
              </span>
            </div>

            <p className="text-[#64748B] dark:text-white text-lg leading-relaxed mb-10 max-w-xl">
              Every year, millions of stolen and blacklisted devices are sold to
              unsuspecting buyers. Don&apos;t become a victim. A simple IMEI
              check can save you hundreds of dollars and protect you from legal
              issues.
            </p>

            {/* Checklist */}
            <div className="space-y-4 mb-10">
              {[
                "Stolen devices can be seized by authorities",
                "Blacklisted phones cannot connect to networks",
                "Counterfeit devices have no warranty coverage",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CircleX className="w-5 h-5 text-[#EF4444] shrink-0" />
                  <span className="text-[#1E293B] dark:text-white font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link href={`#banner`}>
              <button className="bg-[#84CC16] hover:bg-[#6fa512] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-lime-500/20 transition-all cursor-pointer">
                Check Your Device Now
              </button>
            </Link>
          </div>

          {/* Right Side: Risk Report Card */}
          <div className="flex-1 w-full max-w-md">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-card rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50"
            >
              <div className="flex items-center gap-3 mb-8">
                <Shield className="w-6 h-6 text-[#EF4444]" />
                <h3 className="text-xl font-extrabold text-[#0F172A] dark:text-white">
                  Risk Report
                </h3>
              </div>

              <div className="space-y-4">
                {/* Blacklist Status */}
                <div className="bg-[#FFF1F1] dark:bg-card/80 p-4 rounded-2xl flex items-center justify-between border border-[#FEE2E2]">
                  <div className="flex items-center gap-3">
                    <Ban className="w-5 h-5 text-[#EF4444]" />
                    <span className="font-bold text-[#1E293B] dark:text-white">
                      Blacklist Status
                    </span>
                  </div>
                  <span className="bg-[#EF4444] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Blacklisted
                  </span>
                </div>

                {/* iCloud Lock */}
                <div className="bg-[#FFF1F1] dark:bg-card/80 p-4 rounded-2xl flex items-center justify-between border border-[#FEE2E2]">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#EF4444]" />
                    <span className="font-bold text-[#1E293B]">
                      iCloud Lock
                    </span>
                  </div>
                  <span className="bg-[#EF4444] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Locked
                  </span>
                </div>

                {/* Warranty */}
                <div className="bg-[#F0FDF4] dark:bg-card/80 p-4 rounded-2xl flex items-center justify-between border border-[#DCFCE7]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    <span className="font-bold text-[#1E293B] dark:text-white">
                      Warranty
                    </span>
                  </div>
                  <span className="bg-[#22C55E] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

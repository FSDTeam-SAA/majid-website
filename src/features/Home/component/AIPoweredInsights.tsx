"use client";

import { motion } from "framer-motion";
import { Zap, BadgeCheck, ShieldCheck, AlertCircle } from "lucide-react";

export default function AIPoweredInsights() {
  return (
    <section className="py-24">
      <div className="mx-auto container px-6">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black text-[#0F172A] mb-12"
        >
          AI-Powered Insights
        </motion.h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* 1. Comprehensive Device DNA (Large Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-[#E1F0FF] dark:bg-card p-8 md:p-12 rounded-[32px] flex flex-col justify-between"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-4">
                Comprehensive Device DNA
              </h3>
              <p className="text-[#64748B] dark:text-white text-sm md:text-base max-w-sm mb-8">
                Automated checks cross-reference device registries and records
                to provide an instant health score and ownership profile.
              </p>
            </div>

            {/* Report Mockup Element */}
            <div className="bg-[#BBDDFF]  rounded-2xl p-6 border border-[#99CCFF]">
              <div className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-3">
                Report
              </div>
              <div className="h-2 w-full bg-white/50 rounded-full mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "70%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-[#3B82F6]"
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#3B82F6] uppercase tracking-tighter">
                <span>Model: iPhone 15 Pro</span>
                <span>Region: US/CA</span>
                <span>Carrier: Unlocked</span>
              </div>
            </div>
          </motion.div>

          {/* 2. Response Time (Lime Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#84CC16] p-8 md:p-12 rounded-[32px] text-center flex flex-col items-center justify-center text-white"
          >
            <div className="bg-white/20 p-4 rounded-2xl mb-6">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Rapid Automated Checks</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Automated verification engine delivering instant diagnostic
              insights without waiting for manual database lookups.
            </p>
          </motion.div>

          {/* 3. Warranty & Coverage Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#EEFBCC] p-8 md:p-10 rounded-[32px] text-center flex flex-col items-center"
          >
            <BadgeCheck className="w-10 h-10 text-[#0F172A] mb-6" />
            <h3 className="text-xl font-bold text-[#0F172A] mb-3">
              Warranty & Coverage
            </h3>
            <p className="text-[#64748B] text-sm">
              Verify official manufacturer warranty validity, purchase
              validation, and support coverage status.
            </p>
          </motion.div>

          {/* 4. Blacklist Guard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-[#E1FBFF] p-8 md:p-10 rounded-[32px] text-center flex flex-col items-center"
          >
            <ShieldCheck className="w-10 h-10 text-[#0F172A] mb-6" />
            <h3 className="text-xl font-bold text-[#0F172A] mb-3">
              Blacklist Guard
            </h3>
            <p className="text-[#64748B] text-sm">
              Real-time alerts for lost, stolen, or blocked status across
              international carrier registries.
            </p>
          </motion.div>

          {/* 5. Financial Risk Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-[#FFF1F1] p-8 md:p-10 rounded-[32px] text-center flex flex-col items-center"
          >
            <AlertCircle className="w-10 h-10 text-[#0F172A] mb-6" />
            <h3 className="text-xl font-bold text-[#0F172A] mb-3">
              Financial Risk Score
            </h3>
            <p className="text-[#64748B] text-sm">
              Determine if a device is still under financing or insurance lease
              agreements.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

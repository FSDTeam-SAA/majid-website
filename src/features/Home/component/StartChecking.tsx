"use client";

import { motion } from "framer-motion";

export default function StartChecking() {
  return (
    <section className="relative py-10 overflow-hidden bg-[#F8FAFC] dark:bg-card">
      {/* Background Decorative Waves */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none opacity-10">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[40px] border-[#3B82F6] rounded-full"
            style={{
              width: `${i * 150}px`,
              height: `${i * 150}px`,
              opacity: 1 / (i * 1.5),
            }}
          />
        ))}
      </div>

      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] pointer-events-none opacity-10">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[40px] border-[#3B82F6] rounded-full"
            style={{
              width: `${i * 150}px`,
              height: `${i * 150}px`,
              opacity: 1 / (i * 1.5),
            }}
          />
        ))}
      </div>

      <div className="mx-auto container px-4 sm:px-6 lg:px-8 xl:px-12 relative text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-5xl font-black text-[#0F172A] dark:text-white mb-6 tracking-tight"
        >
          Start Checking Devices with Confidence
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[#64748B] text-sm md:text-lg mb-8 max-w-2xl mx-auto font-medium dark:text-white"
        >
          Get instant IMEI reports, AI-powered insights, and avoid risky
          purchases
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <button className="bg-[#84CC16] text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-lime-500/20 mb-8 cursor-pointer">
            Check Now
          </button>
          <p className="text-[#94A3B8] font-bold text-sm tracking-wide uppercase">
            No subscription required{" "}
            <span className="mx-2 text-gray-300">•</span> Start free
          </p>
        </motion.div>
      </div>
    </section>
  );
}

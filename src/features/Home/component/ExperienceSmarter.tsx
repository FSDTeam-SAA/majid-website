"use client";

import { motion } from "framer-motion";
import {
  Check,
  ShieldCheck,
  TriangleAlert,
  Cpu,
  Battery,
  HardDrive,
  Wifi,
  Smartphone,
  Calendar,
  Globe,
  Unlock,
} from "lucide-react";
import Link from "next/link";

export default function ExperienceSmarter() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="mx-auto container px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left Side: Content */}
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-extrabold text-[#0F172A] dark:text-white leading-tight mb-8"
            >
              Experience <span className="text-[#84CC16]">Smarter</span> <br />
              Device <span className="text-[#3B82F6]">Verification</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#64748B] dark:text-white text-lg mb-10 max-w-lg"
            >
              Make confident decisions when buying or selling devices. Our
              comprehensive reports give you the full picture in seconds.
            </motion.p>

            {/* Checklist */}
            <div className="space-y-5 mb-12">
              {[
                "Instantly verify IMEI and serial numbers",
                "AI-driven risk assessment",
                "Get real-time market value estimates",
                "Protect yourself from scams",
                "Easy-to-read reports even for non-technical users",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="bg-[#F0FDF4] dark:bg-card/80 p-1 border border-gray-50 rounded-full">
                    <Check className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <span className="text-[#1E293B] dark:text-white font-semibold text-lg">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Link href={`#banner`}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#84CC16] hover:bg-[#6fa512] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-lime-500/20 transition-all transform hover:scale-105 active:scale-95"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Right Side: Dashboard Mockup */}
          <div className="flex-1 w-full relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-card rounded-[32px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
            >
              {/* Dashboard Header */}
              <div className="p-8 border-b border-gray-50 flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-1 dark:text-white">
                    iPhone 15 Pro
                  </h3>
                  <p className="text-xs text-[#94A3B8] font-mono dark:text-white">
                    IMEI: 356782084912443
                  </p>

                  {/* Risk Meter */}
                  <div className="mt-6 w-full max-w-[200px]">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-[#94A3B8] uppercase">
                        Risk Meter
                      </span>
                      <span className="text-[#22C55E]">12/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#22C55E] w-[12%]" />
                    </div>
                    <span className="text-[10px] text-[#22C55E] font-bold mt-1 block uppercase">
                      Low Risk
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-[#3B82F6] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                    Clean
                  </span>
                  <div className="text-2xl font-black text-[#0F172A] dark:text-white">
                    $942.00
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-bold uppercase">
                    Market Value
                  </p>
                </div>
              </div>

              {/* Status Cards Grid */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 ">
                <StatusCard
                  icon={<ShieldCheck className="text-[#22C55E]" />}
                  label="Global Blacklist"
                  sub="Not reported stolen"
                  status="check"
                />
                <StatusCard
                  icon={<TriangleAlert className="text-[#EF4444]" />}
                  label="Carrier Financing"
                  sub="Payment plan active"
                  status="alert"
                />
                <StatusCard
                  icon={<Smartphone className="text-[#22C55E]" />}
                  label="Hardware Lock"
                  sub="Find My is OFF"
                  status="check"
                />
                <StatusCard
                  icon={<Check className="text-[#22C55E]" />}
                  label="Hardware Specifications"
                  sub="Verified OEM profile"
                  status="check"
                />
              </div>

              {/* Technical Breakdown */}
              <div className="px-8 pb-8">
                <div className="bg-[#F8FAFC] dark:bg-card/80 dark:border-white rounded-2xl p-6">
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-widest mb-6">
                    Technical Breakdown
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    <TechItem
                      icon={<Cpu />}
                      label="Processor"
                      value="A17 Pro (3nm)"
                    />
                    <TechItem
                      icon={<Battery />}
                      label="Battery Health"
                      value="91% (182 cycles)"
                    />
                    <TechItem
                      icon={<HardDrive />}
                      label="Storage"
                      value="256 GB (84GB Free)"
                    />
                    <TechItem
                      icon={<Wifi />}
                      label="Modem"
                      value="Qualcomm X70 5G"
                    />
                    <TechItem
                      icon={<Smartphone />}
                      label="Display"
                      value="ProMotion LTPO"
                    />
                    <TechItem
                      icon={<Calendar />}
                      label="Warranty"
                      value="Expires Oct 2024"
                    />
                    <TechItem
                      icon={<Globe />}
                      label="Origin"
                      value="USA (Model A2848)"
                    />
                    <TechItem
                      icon={<Unlock />}
                      label="Activation"
                      value="Unlocked (E-SIM)"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Decorative Background Element */}
            <div className="absolute -z-10 -top-10 -right-10 w-full h-full border-2 border-[#84CC16]/20 rounded-[40px] translate-x-4 translate-y-4" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusCard({
  icon,
  label,
  sub,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  status: "check" | "alert";
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 shadow-sm bg-white dark:bg-card/80">
      <div
        className={`p-2 rounded-xl border dark:border-white ${status === "check" ? "bg-[#F0FDF4] dark:bg-card/80 " : "bg-[#FFF1F1] dark:bg-card/80 "}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-[#0F172A] dark:text-white">
          {label}
        </p>
        <p className="text-[10px] text-[#94A3B8] dark:text-white">{sub}</p>
      </div>
      {status === "check" ? (
        <Check className="w-4 h-4 text-[#22C55E]" />
      ) : (
        <TriangleAlert className="w-4 h-4 text-[#EF4444]" />
      )}
    </div>
  );
}

function TechItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1 text-[#94A3B8] dark:text-white">
        {icon && (
          <span className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5">
            {icon}
          </span>
        )}
        <p className="text-[9px] font-bold uppercase">{label}</p>
      </div>
      <p className="text-[11px] font-bold text-[#0F172A] dark:text-white">
        {value}
      </p>
    </div>
  );
}

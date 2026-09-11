"use client";

import { motion } from "framer-motion";
import {
  Wrench,
  ClipboardList,
  MessageSquareQuote,
  ShieldCheck,
  Clock3,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const repairHighlights = [
  "Customer repair request intake with issue notes and image uploads",
  "Shopkeeper timeline for diagnosis, quote, parts waiting, and completion",
  "Technician notes, status changes, and customer-visible repair history",
  "Verified receipt PDF flow with QR-based invoice lookup",
];

const repairFlow = [
  {
    title: "Book & Inspect",
    description:
      "Capture customer info, device model, damage notes, and intake images in one flow.",
    icon: ClipboardList,
    tone: "bg-[#E1F0FF]",
  },
  {
    title: "Quote & Approve",
    description:
      "Send repair quotes, update approval state, and keep both sides aligned on pricing.",
    icon: MessageSquareQuote,
    tone: "bg-[#EEFBCC]",
  },
  {
    title: "Repair & Deliver",
    description:
      "Track technician progress, generate receipts, and close jobs with confidence.",
    icon: ShieldCheck,
    tone: "bg-[#E1FBFF]",
  },
];

const statusSteps = [
  "Order booked",
  "Diagnosing started",
  "Quote sent",
  "Waiting for parts",
  "Repair complete",
];

export default function RepairSection() {
  return (
    <section className="overflow-hidden bg-[#071B28] py-24 text-white">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Wrench className="h-4 w-4 text-[#84CC16]" />
              <span className="text-sm font-bold uppercase tracking-[0.24em] text-white/70">
                Repair Operations
              </span>
            </div>

            <h2 className="max-w-[640px] text-4xl font-black leading-tight md:text-5xl">
              Run a full
              <span className="text-[#84CC16]"> repair workflow </span>
              from intake to verified delivery.
            </h2>

            <p className="mt-6 max-w-[620px] text-base leading-7 text-slate-300 md:text-lg">
              Manage complete repair workflows from initial device intake and
              live status tracking to technician diagnostic notes, customer
              history, and instant receipt generation.
            </p>

            <div className="mt-8 space-y-4">
              {repairHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-[#84CC16]/15 p-1">
                    <CheckCircle2 className="h-4 w-4 text-[#84CC16]" />
                  </div>
                  <p className="text-sm font-medium leading-6 text-slate-200 md:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#84CC16] px-6 py-3 text-sm font-black text-[#071B28] transition-transform hover:scale-[1.02]"
              >
                Start Repair Workflow
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80">
                <Clock3 className="h-4 w-4 text-[#3B82F6]" />
                Live statuses, quotes, notes, receipts
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-6 top-8 h-40 w-40 rounded-full bg-[#84CC16]/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[#3B82F6]/20 blur-3xl" />

            <div className="relative rounded-[36px] border border-white/10 bg-white p-6 text-[#0F172A] shadow-[0_32px_80px_rgba(0,0,0,0.28)] md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#84CC16]">
                    Repair Desk
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    Customer Job Timeline
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Clear stage-by-stage visibility from initial diagnostic
                    inspection to final customer collection.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3 text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Current Status
                  </p>
                  <p className="mt-1 text-lg font-black text-[#0F172A]">
                    Diagnosing
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {repairFlow.map((item) => (
                  <div
                    key={item.title}
                    className={`${item.tone} rounded-[28px] border border-black/5 p-5`}
                  >
                    <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm">
                      <item.icon className="h-5 w-5 text-[#0F172A]" />
                    </div>
                    <h4 className="text-lg font-black text-[#0F172A]">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] bg-[#0F172A] p-6 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">
                      Repair Progress
                    </p>
                    <p className="mt-1 text-lg font-black">
                      Track every handoff with clarity
                    </p>
                  </div>
                  <div className="rounded-full bg-[#84CC16] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#071B28]">
                    4 active jobs
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  {statusSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`rounded-2xl border px-3 py-4 ${
                        index < 3
                          ? "border-[#84CC16]/30 bg-[#84CC16]/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-5 text-white">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/75">
                  <div className="rounded-full border border-white/10 px-3 py-2">
                    Technician note ready
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-2">
                    Quote resend supported
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-2">
                    Receipt PDF + QR verification
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

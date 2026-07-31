"use client";

import Link from "next/link";
import { MessageCircle, Mail, Headphones } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[32px] shadow-sm overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#84CC16]/10 rounded-xl flex items-center justify-center">
              <Headphones size={20} className="text-[#84CC16]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Support
              </h2>
              <p className="text-muted-foreground text-sm font-semibold">
                Get in touch with our team
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4">
          <Link
            href="https://wa.me/447777787771"
            aria-label="Contact support on WhatsApp"
            className="flex items-center gap-4 p-5 rounded-2xl bg-background transition-all hover:bg-[#25D366]/5 group"
          >
            <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center">
              <MessageCircle size={20} className="text-[#25D366]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">
                WhatsApp
              </p>
            </div>
          </Link>

          <Link
            href="mailto:reports@imoscan.com"
            className="flex items-center gap-4 p-5 rounded-2xl bg-background transition-all hover:bg-[#EA4335]/5 group"
          >
            <div className="w-12 h-12 bg-[#EA4335]/10 rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-[#EA4335]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">
                Email
              </p>
              <p className="text-foreground font-black text-lg group-hover:text-[#EA4335] transition truncate">
                reports@imoscan.com
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React from "react";
import InvoiceTemplateSelectorCard from "@/features/shopkeeper/settings/component/InvoiceTemplateSelectorCard";
import LogoAdjustmentCard from "@/features/shopkeeper/settings/component/LogoAdjustmentCard";
import TaxSettingsCard from "@/features/shopkeeper/settings/component/TaxSettingsCard";
import { Calculator, FileText, Image as ImageIcon } from "lucide-react";

export default function InvoiceSettingsPage() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6 font-poppins p-4 md:p-8">
      {/* Quick Jump Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-card border border-border shadow-sm">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground px-3">
          Quick Jump:
        </span>
        <button
          type="button"
          onClick={() => scrollTo("tax-settings")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#84CC16]/10 text-[#84CC16] hover:bg-[#84CC16]/20 transition shadow-sm"
        >
          <Calculator size={15} />
          <span>Tax & VAT Settings</span>
        </button>
        <button
          type="button"
          onClick={() => scrollTo("invoice-templates")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <FileText size={15} />
          <span>Invoice Templates</span>
        </button>
        <button
          type="button"
          onClick={() => scrollTo("logo-adjustment")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <ImageIcon size={15} />
          <span>Logo & Branding</span>
        </button>
      </div>

      {/* Tax Settings Card */}
      <TaxSettingsCard />

      {/* Invoice Template Selector */}
      <div id="invoice-templates">
        <InvoiceTemplateSelectorCard />
      </div>

      {/* Logo Adjustment */}
      <div id="logo-adjustment">
        <LogoAdjustmentCard />
      </div>
    </div>
  );
}

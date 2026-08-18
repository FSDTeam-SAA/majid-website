"use client";

import React from "react";
import LogoAdjustmentCard from "@/features/shopkeeper/settings/component/LogoAdjustmentCard";
import TaxSettingsCard from "@/features/shopkeeper/settings/component/TaxSettingsCard";

export default function InvoiceSettingsPage() {
  return (
    <div className="space-y-6">
      <LogoAdjustmentCard />
      <TaxSettingsCard />
    </div>
  );
}

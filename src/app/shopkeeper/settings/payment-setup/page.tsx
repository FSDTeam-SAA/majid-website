"use client";

import React, { Suspense } from "react";
import PaymentSetupCard from "@/features/shopkeeper/settings/component/PaymentSetupCard";
import { Loader2 } from "lucide-react";

export default function PaymentSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#84CC16]" />
        </div>
      }
    >
      <PaymentSetupCard />
    </Suspense>
  );
}

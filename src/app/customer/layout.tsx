"use client";

import { useState } from "react";
import Header from "@/components/shared/customer/Header";
import Sidebar from "@/components/shared/customer/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
        <SheetContent side="left" className="p-0 w-[300px] border-r-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header setOpenSidebar={setOpenSidebar} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

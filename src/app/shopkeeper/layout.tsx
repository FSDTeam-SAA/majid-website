"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/shared/shopkeeper/Header";
import Sidebar from "@/components/shared/shopkeeper/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ShopProvider } from "@/features/shopkeeper/shop/store/shop.store";

const GUEST_ALLOWED_PATH = "/shopkeeper/scan-device";

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isGuestAllowedPage = pathname === GUEST_ALLOWED_PATH;
  const isAuthenticated = status === "authenticated";

  // Redirect unauthenticated users away from protected pages only
  useEffect(() => {
    if (status === "unauthenticated" && !isGuestAllowedPage) {
      router.push("/auth/login");
    }
  }, [status, isGuestAllowedPage, router]);

  // Show loading spinner ONLY for protected pages while session loads
  // Guest-allowed pages render immediately so scan can start right away
  if (status === "loading" && !isGuestAllowedPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface text-foreground">
      {/* Desktop Sidebar — authenticated only */}
      {isAuthenticated && (
        <div className="hidden lg:block overflow-visible">
          <Sidebar
            collapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          />
        </div>
      )}

      {/* Mobile Sidebar — authenticated only */}
      {isAuthenticated && (
        <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
          <SheetContent
            side="left"
            className="w-[min(300px,calc(100vw-2rem))] border-r-0 p-0"
          >
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ShopProvider>
          <Header setOpenSidebar={setOpenSidebar} />
          <main className="min-w-0 flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </ShopProvider>
      </div>
    </div>
  );
}

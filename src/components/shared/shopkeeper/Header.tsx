"use client";

import NotificationDropdown from "@/features/notifications/component/NotificationDropdown";
import ShopSwitcher from "@/features/shopkeeper/shop/component/ShopSwitcher";
import { ModeToggle } from "../website/ModeToggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Props {
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setOpenSidebar }: Props) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur-md sm:h-20 sm:px-4 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        {isAuthenticated && (
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={() => setOpenSidebar(true)}
          >
            <Menu size={20} />
          </Button>
        )}

        {isAuthenticated && <ShopSwitcher />}

        <div className="flex-1 max-w-xl"></div>
      </div>

      {/* Right */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <ModeToggle />
        {isAuthenticated ? (
          <NotificationDropdown role="shopkeeper" />
        ) : (
          <Link href="/auth/login">
            <Button className="cursor-pointer rounded-full bg-[#84CC16] px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all hover:bg-[#84CC16]/95 sm:px-6 sm:py-2.5 sm:text-sm">
              Login / Sign Up
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

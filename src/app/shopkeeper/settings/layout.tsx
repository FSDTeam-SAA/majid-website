"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User,
  KeyRound,
  Headphones,
  QrCode,
  UsersRound,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
} from "lucide-react";

const tabs = [
  {
    label: "Shopkeeper",
    href: "/shopkeeper/settings/shopkeeper",
    icon: QrCode,
  },
  { label: "Profile", href: "/shopkeeper/settings/profile", icon: User },
  { label: "My Shop", href: "/shopkeeper/settings/my-shop", icon: Store },
  { label: "Staff", href: "/shopkeeper/settings/staff", icon: UsersRound },
  { label: "Password", href: "/shopkeeper/settings/password", icon: KeyRound },
  { label: "Support", href: "/shopkeeper/settings/support", icon: Headphones },
];

const staffTabs = tabs.filter((tab) =>
  ["Profile", "Password", "Support"].includes(tab.label),
);

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const isStaff = session?.user?.role?.toLowerCase() === "staff";
  const visibleTabs = isStaff ? staffTabs : tabs;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Settings Sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-sidebar font-poppins transition-[width] duration-300 overflow-visible lg:flex ${
          collapsed ? "w-[88px]" : "w-[220px]"
        } relative`}
      >
        {/* Nav Items */}
        <nav className="flex-1 space-y-1 px-3 pt-6 pb-4 overflow-y-auto custom-scrollbar">
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                title={collapsed ? tab.label : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-bold transition-all ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-[#84CC16]/10 text-[#84CC16]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {!collapsed && (
                  <span className="tracking-wide">{tab.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-[#84CC16] lg:flex"
          aria-label={
            collapsed ? "Expand settings sidebar" : "Collapse settings sidebar"
          }
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <PanelLeftOpen size={14} />
          ) : (
            <PanelLeftClose size={14} />
          )}
        </button>
      </aside>

      {/* Mobile Tabs (horizontal scroll) */}
      <div className="fixed left-0 right-0 top-16 z-20 block border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
        <nav className="flex overflow-x-auto px-4 py-2">
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all ${
                  isActive
                    ? "bg-[#84CC16]/10 text-[#84CC16]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

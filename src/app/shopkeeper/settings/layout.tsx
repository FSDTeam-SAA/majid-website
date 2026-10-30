"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  KeyRound,
  Headphones,
  QrCode,
  UsersRound,
  PanelLeftClose,
  PanelLeftOpen,
  Store,
  FileText,
  CreditCard,
  Smartphone,
  ChevronDown,
  CalendarDays,
  Wallet,
} from "lucide-react";

export interface SettingsTab {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
  submenu?: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{
      size?: number;
      className?: string;
      strokeWidth?: number;
    }>;
  }>;
}

const tabs: SettingsTab[] = [
  {
    label: "Shopkeeper",
    href: "/shopkeeper/settings/shopkeeper",
    icon: QrCode,
  },
  { label: "Profile", href: "/shopkeeper/settings/profile", icon: User },
  {
    label: "Payment Setup",
    href: "/shopkeeper/settings/payment-setup",
    icon: CreditCard,
  },
  {
    label: "Invoice & Tax",
    href: "/shopkeeper/settings/invoice",
    icon: FileText,
  },
  { label: "My Shop", href: "/shopkeeper/settings/my-shop", icon: Store },
  {
    label: "Staff",
    href: "/shopkeeper/settings/staff",
    icon: UsersRound,
    submenu: [
      {
        label: "Staff Rota",
        href: "/shopkeeper/settings/staff/rota",
        icon: CalendarDays,
      },
      {
        label: "Staff Wages",
        href: "/shopkeeper/settings/staff/wages",
        icon: Wallet,
      },
    ],
  },
  {
    label: "NFC Attendance",
    href: "/shopkeeper/settings/nfc",
    icon: Smartphone,
  },
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
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    Staff: true,
  });
  const { data: session } = useSession();
  const isStaff = session?.user?.role?.toLowerCase() === "staff";
  const visibleTabs = isStaff ? staffTabs : tabs;

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

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
            if (tab.submenu) {
              const isExactActive = pathname === tab.href;
              const isChildActive = tab.submenu.some(
                (sub) =>
                  pathname === sub.href || pathname.startsWith(`${sub.href}/`),
              );
              const isParentActive = isExactActive || isChildActive;
              const isOpen = !collapsed && (openSubmenus[tab.label] ?? true);

              return (
                <div key={tab.label} className="space-y-1">
                  <div
                    className={`flex items-center justify-between rounded-2xl transition-all ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isParentActive
                        ? "bg-[#84CC16]/10 text-[#84CC16]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Link
                      href={tab.href}
                      title={collapsed ? tab.label : undefined}
                      className={`flex flex-1 items-center gap-3 px-3 py-3 text-[13px] font-bold ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <tab.icon
                        size={18}
                        strokeWidth={isParentActive ? 2.5 : 2}
                      />
                      {!collapsed && (
                        <span className="tracking-wide">{tab.label}</span>
                      )}
                    </Link>

                    {!collapsed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubmenu(tab.label);
                        }}
                        className="p-2 mr-1 rounded-lg text-muted-foreground hover:text-[#84CC16] transition-colors cursor-pointer"
                        aria-label={`Toggle ${tab.label} dropdown`}
                        title="Toggle options"
                      >
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={15} />
                        </motion.div>
                      </button>
                    )}
                  </div>

                  {/* Submenu Accordion */}
                  <AnimatePresence>
                    {!collapsed && isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden space-y-1 pl-3 py-1"
                      >
                        {tab.submenu.map((sub) => {
                          const isSubActive =
                            pathname === sub.href ||
                            pathname.startsWith(`${sub.href}/`);
                          return (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-all ${
                                isSubActive
                                  ? "bg-[#84CC16]/15 text-[#84CC16] font-black"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <sub.icon
                                size={15}
                                strokeWidth={isSubActive ? 2.5 : 2}
                              />
                              <span className="tracking-wide">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

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
          className="absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-[#84CC16] lg:flex cursor-pointer"
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
        <nav className="flex overflow-x-auto px-4 py-2 gap-1 custom-scrollbar">
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const isAnySubActive = tab.submenu?.some(
              (sub) =>
                pathname === sub.href || pathname.startsWith(`${sub.href}/`),
            );

            return (
              <div key={tab.href} className="flex shrink-0 items-center gap-1">
                <Link
                  href={tab.href}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all ${
                    isActive || isAnySubActive
                      ? "bg-[#84CC16]/10 text-[#84CC16]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <tab.icon
                    size={16}
                    strokeWidth={isActive || isAnySubActive ? 2.5 : 2}
                  />
                  <span>{tab.label}</span>
                </Link>

                {tab.submenu && (
                  <div className="flex items-center gap-1">
                    {tab.submenu.map((sub) => {
                      const isSubActive =
                        pathname === sub.href ||
                        pathname.startsWith(`${sub.href}/`);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[12px] font-bold transition-all ${
                            isSubActive
                              ? "bg-[#84CC16]/20 text-[#84CC16]"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <sub.icon
                            size={14}
                            strokeWidth={isSubActive ? 2.5 : 2}
                          />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

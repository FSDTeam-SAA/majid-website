"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Scan,
  CreditCard,
  Package,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  FileText,
  SearchCheckIcon,
  User,
  ShoppingCart,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  getShopkeeperDisplayName,
  getShopkeeperImage,
  getShopkeeperSubtitle,
} from "./profile-utils";

const navItems = [
  {
    icon: <Scan size={20} />,
    label: "Scan Device",
    href: "/shopkeeper/scan-device",
    isSpecial: true,
  },
  {
    icon: <SearchCheckIcon size={20} />,
    label: "Search History",
    href: "/shopkeeper/search-history",
  },
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard Overview",
    href: "/shopkeeper/dashboard",
  },
  {
    icon: <Store size={20} />,
    label: "My Shops",
    href: "/shopkeeper/settings/my-shop",
  },
  {
    icon: <CreditCard size={20} />,
    label: "Payment",
    href: "/shopkeeper/payment",
    submenu: [
      { label: "Payment History", href: "/shopkeeper/payment/history" },
      { label: "Pricing Plane", href: "/shopkeeper/payment/add-funds" },
      { label: "Tax Season", href: "/shopkeeper/payment/tax-season" },
    ],
  },
  {
    icon: <FileText size={20} />,
    label: "Invoice",
    href: "/shopkeeper/invoice",
    submenu: [
      { label: "Create Invoice", href: "/shopkeeper/invoice/create-invoice" },
      { label: "View Invoices", href: "/shopkeeper/invoice/invoice-history" },
      {
        label: "Purchase Invoice",
        href: "/shopkeeper/invoice/purchase-invoice",
      },
      {
        label: "Delivery Invoice",
        href: "/shopkeeper/invoice/delivery-invoice",
      },
    ],
  },
  // {
  //   icon: <Tag size={20} />,
  //   label: "Pricing Plane",
  //   href: "/shopkeeper/pricing",
  // },
  {
    icon: <Package size={20} />,
    label: "Inventory",
    href: "/shopkeeper/inventory",
    submenu: [
      { label: "Inventory List", href: "/shopkeeper/inventory" },
      { label: "Supplier", href: "/shopkeeper/inventory/suppliers" },
    ],
  },
  {
    icon: <ShoppingCart size={20} />,
    label: "Checkout",
    href: "/shopkeeper/checkout",
  },
  {
    icon: <User size={20} />,
    label: "Customer",
    href: "/shopkeeper/customer",
  },
  {
    icon: <Wrench size={20} />,
    label: "Repair Requests",
    href: "/shopkeeper/repair-requests",
  },
  {
    icon: <Settings size={20} />,
    label: "Settings",
    href: "/shopkeeper/settings",
  },
];

const getOpenSubmenuFromPath = (pathname: string) =>
  navItems.find((item) => item.submenu && pathname.startsWith(item.href))
    ?.label ?? null;

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(() =>
    getOpenSubmenuFromPath(pathname),
  );
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { data: profileData } = useMyProfile();
  const user = profileData?.data;
  const profileName = getShopkeeperDisplayName(user);
  const profileImage = getShopkeeperImage(user);
  const profileSubtitle = getShopkeeperSubtitle(user);

  const handleLogout = async () => {
    // Clear all storage to ensure no sensitive data remains
    localStorage.clear();
    sessionStorage.clear();

    // Perform next-auth sign out
    await signOut({
      callbackUrl: "/auth/login",
      redirect: true,
    });
  };

  return (
    <>
      <aside
        className={`sticky top-0 flex h-dvh max-w-full flex-col border-r border-border bg-sidebar font-poppins text-sidebar-foreground shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-[width] duration-300 overflow-visible ${
          collapsed ? "w-[88px]" : "w-[min(300px,100vw)]"
        } relative`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-2 p-4 pb-6">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="relative w-[100px] shrink-0 sm:w-[128px] md:h-[50px] md:w-[180px] cursor-pointer">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain "
                />
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive =
              item.href === "/shopkeeper/settings"
                ? pathname.startsWith("/shopkeeper/settings") &&
                  !pathname.startsWith("/shopkeeper/settings/my-shop")
                : pathname.startsWith(item.href);
            const isSubmenuOpen = !collapsed && openSubmenu === item.label;

            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center ${collapsed ? "justify-center px-3" : "gap-3 px-6"} py-4.5 font-black rounded-2xl transition-all mb-4 group ${
                    isActive
                      ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/25"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg group-hover:rotate-12 transition-transform ${
                      isActive
                        ? "bg-white/20"
                        : "text-[#94A3B8] group-hover:text-[#84CC16]"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <span className="text-[15px] font-black tracking-tight uppercase tracking-wider">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <div key={item.label} className="space-y-1">
                {item.submenu ? (
                  <button
                    onClick={() => {
                      if (!collapsed) {
                        setOpenSubmenu(isSubmenuOpen ? null : item.label);
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${collapsed ? "justify-center px-3" : "justify-between px-5"} py-4 rounded-2xl transition-all group relative overflow-hidden ${
                      isActive
                        ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <div
                      className={`flex items-center ${collapsed ? "justify-center" : "gap-4"} relative z-10`}
                    >
                      <span
                        className={`${isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#84CC16] transition-colors"}`}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="text-[15px] font-black tracking-tight">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!collapsed && (
                      <motion.div
                        animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10"
                      >
                        <ChevronDown
                          size={18}
                          className={isActive ? "text-white" : "text-[#94A3B8]"}
                        />
                      </motion.div>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${collapsed ? "justify-center px-3" : "justify-between px-5"} py-4 rounded-2xl transition-all group relative overflow-hidden ${
                      isActive
                        ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <div
                      className={`flex items-center ${collapsed ? "justify-center" : "gap-4"} relative z-10`}
                    >
                      <span
                        className={`${isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#84CC16] transition-colors"}`}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="text-[15px] font-black tracking-tight">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                      />
                    )}
                  </Link>
                )}

                {/* Submenu rendering */}
                <AnimatePresence>
                  {item.submenu && isSubmenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-brand-lime/10 rounded-2xl mt-1 mx-2"
                    >
                      <div className="py-2 flex flex-col">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className={`px-12 py-3 text-[14px] font-bold transition-all mx-2 rounded-xl ${
                              pathname === sub.href
                                ? "bg-card text-[#84CC16] shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 pt-0">
          <div className="bg-surface border border-border rounded-[28px] p-4 flex flex-col gap-4 shadow-sm">
            {user && (
              <Link
                href="/shopkeeper/settings"
                className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-1 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 p-1.5 rounded-2xl transition-all cursor-pointer min-w-0`}
              >
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-white/10 flex-shrink-0">
                  <Image
                    src={profileImage}
                    alt={profileName}
                    fill
                    className="object-cover"
                  />
                </div>
                {!collapsed && (
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-black text-foreground leading-tight">
                      {profileName}
                    </span>
                    <span className="truncate text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      {profileSubtitle}
                    </span>
                  </div>
                )}
              </Link>
            )}

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-card border border-border text-muted-foreground font-black text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group uppercase tracking-widest"
            >
              <LogOut
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}</style>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-[#84CC16] lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={14} />
            ) : (
              <PanelLeftClose size={14} />
            )}
          </button>
        )}
      </aside>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-card rounded-[40px] p-10 shadow-2xl border border-border z-[10000]"
            >
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center ring-8 ring-red-50/50">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <LogOut size={32} className="text-red-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    Confirm Logout
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Are you sure you want to log out of your account? You will
                    need to login again to access your dashboard.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full py-4.5 text-white font-black text-[13px] rounded-2xl bg-red-600 transition-all shadow-xl shadow-gray-200 active:scale-[0.98] uppercase tracking-[0.1em] cursor-pointer"
                  >
                    Yes, Log me out
                  </button>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full py-4.5 bg-card border border-border text-muted-foreground font-black text-[13px] rounded-2xl hover:bg-surface transition-all active:scale-[0.98] uppercase tracking-[0.1em] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

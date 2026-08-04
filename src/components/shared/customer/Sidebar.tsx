// "use client";

// import React, { useState } from "react";
// import {
//   LayoutDashboard,
//   Settings,
//   LogOut,
//   Scan,
//   CreditCard,
//   Mail,
//   ChevronDown,
//   History,
//   HelpCircle,
//   Phone,
// } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import { signOut } from "next-auth/react";
// import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
// import {
//   getShopkeeperDisplayName,
//   getShopkeeperImage,
//   getShopkeeperSubtitle,
// } from "../shopkeeper/profile-utils";

// const navItems = [
//   {
//     icon: <Scan size={20} />,
//     label: "Scan Device",
//     href: "/customer/scan-device",
//     isSpecial: true,
//   },
//   {
//     icon: <LayoutDashboard size={20} />,
//     label: "Dashboard Overview",
//     href: "/customer/dashboard",
//   },
//   {
//     icon: <CreditCard size={20} />,
//     label: "Payment",
//     href: "/customer/payment",
//     submenu: [
//       { label: "Payment History", href: "/customer/payment/history" },
//       { label: "Add funds", href: "/customer/payment/add-funds" },
//     ],
//   },
//   {
//     icon: <Settings size={20} />,
//     label: "Repair Requests",
//     href: "/customer/repair-request",
//   },
//   {
//     icon: <History size={20} />,
//     label: "Repair History",
//     href: "/customer/repair-history",
//   },
//   //  {
//   // icon: <Settings size={20} />,
//   // label: "Settings",
//   // href: "/customer/settings",
//   // },
//   {
//     icon: <Settings size={20} />,
//     label: "Settings",
//     href: "/customer/settings",
//   },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [openSubmenu, setOpenSubmenu] = useState<string | null>("Payment"); // Default open as in screenshot
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const { data: profileData } = useMyProfile();
//   const user = profileData?.data;
//   const profileName = getShopkeeperDisplayName(user);
//   const profileImage = getShopkeeperImage(user);
//   const profileSubtitle = getShopkeeperSubtitle(user);

//   const handleLogout = async () => {
//     // Clear all storage to ensure no sensitive data remains
//     localStorage.clear();
//     sessionStorage.clear();

//     // Perform next-auth sign out
//     await signOut({
//       callbackUrl: "/auth/login",
//       redirect: true,
//     });
//   };

//   return (
//     <>
//       <aside className="w-[300px] bg-card h-screen border-r border-border flex flex-col sticky top-0 font-poppins shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
//         {/* Logo Section */}
//         <div className="p-8 pb-10 flex items-center justify-center">
//           <Link href="/" className="flex items-center gap-1.5 group">
//             <div className="relative w-[100px] shrink-0 sm:w-[128px] md:h-[50px] md:w-[200px] cursor-pointer">
//               <Image
//                 src="/images/logo.png"
//                 alt="Logo"
//                 fill
//                 className="object-contain "
//               />
//             </div>
//           </Link>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
//           {navItems.map((item) => {
//             const isActive = pathname.startsWith(item.href);
//             const isSubmenuOpen = openSubmenu === item.label;

//             if (item.isSpecial) {
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={`flex items-center gap-3 px-6 py-4.5 font-black rounded-2xl transition-all mb-4 group ${
//                     isActive
//                       ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/25"
//                       : "text-muted-foreground hover:bg-surface hover:text-foreground"
//                   }`}
//                 >
//                   <div
//                     className={`p-1.5 rounded-lg group-hover:rotate-12 transition-transform ${
//                       isActive
//                         ? "bg-white/20"
//                         : "text-[#94A3B8] group-hover:text-[#84CC16]"
//                     }`}
//                   >
//                     {item.icon}
//                   </div>
//                   <span className="text-[15px] font-black tracking-tight uppercase tracking-wider">
//                     {item.label}
//                   </span>
//                 </Link>
//               );
//             }

//             return (
//               <div key={item.label} className="space-y-1">
//                 {item.submenu ? (
//                   <button
//                     onClick={() =>
//                       setOpenSubmenu(isSubmenuOpen ? null : item.label)
//                     }
//                     className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
//                       isActive
//                         ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
//                         : "text-muted-foreground hover:bg-surface hover:text-foreground"
//                     }`}
//                   >
//                     <div className="flex items-center gap-4 relative z-10">
//                       <span
//                         className={`${isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#84CC16] transition-colors"}`}
//                       >
//                         {item.icon}
//                       </span>
//                       <span className="text-[15px] font-black tracking-tight">
//                         {item.label}
//                       </span>
//                     </div>

//                     <motion.div
//                       animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
//                       transition={{ duration: 0.2 }}
//                       className="relative z-10"
//                     >
//                       <ChevronDown
//                         size={18}
//                         className={isActive ? "text-white" : "text-[#94A3B8]"}
//                       />
//                     </motion.div>
//                   </button>
//                 ) : (
//                   <Link
//                     href={item.href}
//                     className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
//                       isActive
//                         ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
//                         : "text-muted-foreground hover:bg-surface hover:text-foreground"
//                     }`}
//                   >
//                     <div className="flex items-center gap-4 relative z-10">
//                       <span
//                         className={`${isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#84CC16] transition-colors"}`}
//                       >
//                         {item.icon}
//                       </span>
//                       <span className="text-[15px] font-black tracking-tight">
//                         {item.label}
//                       </span>
//                     </div>

//                     {isActive && (
//                       <motion.div
//                         layoutId="active-pill"
//                         className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
//                       />
//                     )}
//                   </Link>
//                 )}

//                 {/* Submenu rendering */}
//                 <AnimatePresence>
//                   {item.submenu && isSubmenuOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       transition={{ duration: 0.2 }}
//                       className="overflow-hidden bg-brand-lime/10 rounded-2xl mt-1 mx-2"
//                     >
//                       <div className="py-2 flex flex-col">
//                         {item.submenu.map((sub) => (
//                           <Link
//                             key={sub.label}
//                             href={sub.href}
//                             className={`px-12 py-3 text-[14px] font-bold transition-all mx-2 rounded-xl ${
//                               pathname === sub.href
//                                 ? "bg-white text-[#84CC16] shadow-sm"
//                                 : "text-muted-foreground hover:text-foreground hover:translate-x-1"
//                             }`}
//                           >
//                             {sub.label}
//                           </Link>
//                         ))}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             );
//           })}
//         </nav>

//         {/* Support Section - Premium Design */}
//         <div className="mx-4 mb-3 p-5 bg-surface rounded-[24px] border border-border space-y-4">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//               <HelpCircle size={16} className="text-blue-600" />
//             </div>
//             <h3 className="text-[13px] font-black text-foreground uppercase tracking-widest">
//               Support
//             </h3>
//           </div>
//           <div className="space-y-3">
//             <Link
//               href="tel:+447777787771"
//               className="flex items-center gap-3 group transition-transform hover:translate-x-1"
//             >
//               <div className="w-8 h-8 bg-[#25D366]/10 rounded-lg flex items-center justify-center">
//                 <Phone size={14} className="text-[#25D366]" />
//               </div>
//               <span className="text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition">
//                 +447777787771
//               </span>
//             </Link>
//             <Link
//               href="mailto:reports@imoscan.com"
//               className="flex items-center gap-3 group transition-transform hover:translate-x-1"
//             >
//               <div className="w-8 h-8 bg-[#EA4335]/10 rounded-lg flex items-center justify-center">
//                 <Mail size={14} className="text-[#EA4335]" />
//               </div>
//               <span className="text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition truncate">
//                 reports@imoscan.com
//               </span>
//             </Link>
//           </div>
//         </div>

//         {/* User Section */}
//         <div className="p-4 pt-0">
//           <div className="bg-surface border border-border rounded-[28px] p-4 flex flex-col gap-4 shadow-sm">
//             <div className="flex items-center gap-3 px-1">
//               <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-white/10">
//                 <Image
//                   src={profileImage}
//                   alt={profileName}
//                   fill
//                   className="object-cover"
//                 />
//               </div>
//               <div className="flex min-w-0 flex-col">
//                 <span className="truncate text-[14px] font-black text-foreground leading-tight">
//                   {profileName}
//                 </span>
//                 <span className="truncate text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
//                   {profileSubtitle}
//                 </span>
//               </div>
//             </div>

//             <button
//               onClick={() => setShowLogoutModal(true)}
//               className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-card border border-border text-muted-foreground font-black text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group uppercase tracking-widest"
//             >
//               <LogOut
//                 size={16}
//                 className="group-hover:-translate-x-1 transition-transform"
//               />
//               <span>Log out</span>
//             </button>
//           </div>
//         </div>

//         <style jsx global>{`
//           .custom-scrollbar::-webkit-scrollbar {
//             width: 4px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-track {
//             background: transparent;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb {
//             background: #e2e8f0;
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//             background: #cbd5e1;
//           }
//         `}</style>
//       </aside>

//       <AnimatePresence>
//         {showLogoutModal && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setShowLogoutModal(false)}
//               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               className="relative w-full max-w-sm bg-card rounded-[40px] p-10 shadow-2xl border border-border z-[10000]"
//             >
//               <div className="flex flex-col items-center text-center space-y-8">
//                 <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center ring-8 ring-red-50/50">
//                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
//                     <LogOut size={32} className="text-red-600" />
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <h3 className="text-2xl font-black text-foreground tracking-tight">
//                     Confirm Logout
//                   </h3>
//                   <p className="text-sm font-medium text-muted-foreground leading-relaxed">
//                     Are you sure you want to log out of your account? You will
//                     need to login again to access your dashboard.
//                   </p>
//                 </div>

//                 <div className="flex flex-col w-full gap-3 pt-2">
//                   <button
//                     onClick={handleLogout}
//                     className="w-full py-4.5 text-white font-black text-[13px] rounded-2xl bg-red-600 transition-all shadow-xl shadow-gray-200 active:scale-[0.98] uppercase tracking-[0.1em] cursor-pointer"
//                   >
//                     Yes, Log me out
//                   </button>
//                   <button
//                     onClick={() => setShowLogoutModal(false)}
//                     className="w-full py-4.5 bg-card border border-border text-muted-foreground font-black text-[13px] rounded-2xl hover:bg-surface transition-all active:scale-[0.98] uppercase tracking-[0.1em] cursor-pointer"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

"use client";

import React, { useState } from "react";
import {
  Settings,
  LogOut,
  Scan,
  CreditCard,
  Mail,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  SearchCheckIcon,
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
} from "../shopkeeper/profile-utils";

const navItems = [
  {
    icon: <Scan size={20} />,
    label: "Scan Device",
    href: "/customer/scan-device",
    isSpecial: true,
  },
  {
    icon: <SearchCheckIcon size={20} />,
    label: "Scan History",
    href: "/customer/search-history",
  },
  {
    icon: <CreditCard size={20} />,
    label: "Payment",
    href: "/customer/payment",
    submenu: [
      { label: "Payment History", href: "/customer/payment/history" },
      { label: "Add funds", href: "/customer/payment/add-funds" },
    ],
  },
  {
    icon: <Settings size={20} />,
    label: "Settings",
    href: "/customer/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>("Payment");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openSupport, setOpenSupport] = useState(false);

  const { data: profileData } = useMyProfile();

  const user = profileData?.data;

  const profileName = getShopkeeperDisplayName(user);
  const profileImage = getShopkeeperImage(user);
  const profileSubtitle = getShopkeeperSubtitle(user);

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();

    await signOut({
      callbackUrl: "/auth/login",
      redirect: true,
    });
  };

  return (
    <>
      <aside className="w-[300px] bg-card h-screen border-r border-border flex flex-col sticky top-0 font-poppins shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Logo Section */}
        <div className="p-8 pb-10 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-1.5 group">
            <div className="relative w-[100px] shrink-0 sm:w-[128px] md:h-[50px] md:w-[200px] cursor-pointer">
              <Image
                src="/images/logo.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isSubmenuOpen = openSubmenu === item.label;

            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-4.5 font-black rounded-2xl transition-all mb-4 group ${
                    isActive
                      ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/25"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
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

                  <span className="text-[15px] font-black tracking-tight uppercase tracking-wider">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <div key={item.label} className="space-y-1">
                {item.submenu ? (
                  <button
                    onClick={() =>
                      setOpenSubmenu(isSubmenuOpen ? null : item.label)
                    }
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                      isActive
                        ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span
                        className={`${
                          isActive
                            ? "text-white"
                            : "text-[#94A3B8] group-hover:text-[#84CC16] transition-colors"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span className="text-[15px] font-black tracking-tight">
                        {item.label}
                      </span>
                    </div>

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
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                      isActive
                        ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span
                        className={`${
                          isActive
                            ? "text-white"
                            : "text-[#94A3B8] group-hover:text-[#84CC16] transition-colors"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span className="text-[15px] font-black tracking-tight">
                        {item.label}
                      </span>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                      />
                    )}
                  </Link>
                )}

                {/* Submenu */}
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
                                ? "bg-white text-[#84CC16] shadow-sm"
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

        {/* Support Section */}
        <div className="mx-4 mb-3">
          <button
            onClick={() => setOpenSupport(!openSupport)}
            className="w-full p-5 bg-surface rounded-[24px] border border-border flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <HelpCircle size={16} className="text-blue-600" />
              </div>

              <h3 className="text-[13px] font-black text-foreground uppercase tracking-widest">
                Support
              </h3>
            </div>

            <motion.div
              animate={{ rotate: openSupport ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} className="text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openSupport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-5 bg-surface rounded-[24px] border border-border space-y-3">
                  <Link
                    href="https://wa.me/447777787771"
                    aria-label="Contact support on WhatsApp"
                    title="Contact support on WhatsApp"
                    className="flex items-center gap-3 group transition-transform hover:translate-x-1"
                  >
                    <div className="w-8 h-8 bg-[#25D366]/10 rounded-lg flex items-center justify-center">
                      <MessageCircle size={14} className="text-[#25D366]" />
                    </div>

                    <span className="text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition">
                      WhatsApp
                    </span>
                  </Link>

                  <Link
                    href="mailto:reports@imoscan.com"
                    className="flex items-center gap-3 group transition-transform hover:translate-x-1"
                  >
                    <div className="w-8 h-8 bg-[#EA4335]/10 rounded-lg flex items-center justify-center">
                      <Mail size={14} className="text-[#EA4335]" />
                    </div>

                    <span className="text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition truncate">
                      reports@imoscan.com
                    </span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Section */}
        <div className="p-4 pt-0">
          <div className="bg-surface border border-border rounded-[28px] p-4 flex flex-col gap-4 shadow-sm">
            {user && (
              <div className="flex items-center gap-3 px-1">
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-white/10">
                  <Image
                    src={profileImage}
                    alt={profileName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] font-black text-foreground leading-tight">
                    {profileName}
                  </span>

                  <span className="truncate text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    {profileSubtitle}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-card border border-border text-muted-foreground font-black text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group uppercase tracking-widest"
            >
              <LogOut
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />

              <span>Log out</span>
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
      </aside>

      {/* Logout Modal */}
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

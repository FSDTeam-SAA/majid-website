"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Info, Check, Star } from "lucide-react";
import { useState, useMemo } from "react";
import {
  ServiceCategory,
  IMEIService,
} from "../../scanDevice/types/scanDevice.types";

interface ServiceSelectorProps {
  serviceCategories: ServiceCategory[];
  selectedService: IMEIService | null;
  setSelectedService: (service: IMEIService) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  disabled?: boolean;
}

export const ServiceSelector = ({
  serviceCategories,
  selectedService,
  setSelectedService,
  isDropdownOpen,
  setIsDropdownOpen,
  disabled,
}: ServiceSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Reorder categories: put "fevourite" first, then sort others alphabetically
  const orderedCategories = useMemo(() => {
    const favouriteCategory = serviceCategories.find(
      (cat) => cat.category.toLowerCase() === "fevourite",
    );
    const otherCategories = serviceCategories.filter(
      (cat) => cat.category.toLowerCase() !== "fevourite",
    );

    // Sort other categories alphabetically
    const sortedOtherCategories = [...otherCategories].sort((a, b) =>
      a.category.localeCompare(b.category),
    );

    // Return favourite first, then others
    return favouriteCategory
      ? [favouriteCategory, ...sortedOtherCategories]
      : sortedOtherCategories;
  }, [serviceCategories]);

  // Filter categories and services based on search term
  const filteredCategories = orderedCategories
    .map((cat) => ({
      ...cat,
      services: cat.services.filter((svc) =>
        svc.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.services.length > 0);

  // Get total services count
  const totalServices = serviceCategories.reduce(
    (total, cat) => total + cat.services.length,
    0,
  );

  return (
    <div className="relative">
      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block ml-4">
        Select Diagnostic Service
      </span>

      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border border-border bg-card hover:border-[#84CC16]/30 transition-all cursor-pointer group disabled:opacity-50"
      >
        <div className="flex flex-col items-start">
          <span className="text-base font-black text-foreground group-hover:text-[#84CC16] transition-colors">
            {selectedService ? selectedService.name : "Choose Service"}
          </span>
          {selectedService && (
            <span className="text-[11px] font-bold text-[#84CC16] mt-0.5">
              Price: {selectedService.priceLabel}
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 mt-2 z-[100] w-[min(400px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-border bg-muted/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-xl outline-none focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </div>

            {/* Services List */}
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const isFavourite =
                    cat.category.toLowerCase() === "fevourite";

                  return (
                    <div
                      key={cat.category}
                      className={`border-b border-border last:border-0 ${
                        isFavourite ? "bg-amber-50/30 dark:bg-amber-950/20" : ""
                      }`}
                    >
                      {/* Category Header */}
                      <div
                        className={`px-4 py-2 ${
                          isFavourite
                            ? "bg-amber-100/50 dark:bg-amber-950/40"
                            : "bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isFavourite && (
                            <Star
                              size={12}
                              className="text-amber-500 fill-amber-500"
                            />
                          )}
                          <h3
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              isFavourite
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {cat.category}
                          </h3>
                          {isFavourite && (
                            <span className="text-[8px] font-bold text-amber-600 bg-amber-200/50 px-1.5 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Services */}
                      <div className="p-1">
                        {cat.services.map((svc) => {
                          const isApple =
                            cat.category.toLowerCase().includes("apple") ||
                            svc.name.toLowerCase().includes("apple") ||
                            svc.name.toLowerCase().includes("iphone");
                          const isSamsung =
                            cat.category.toLowerCase().includes("samsung") ||
                            svc.name.toLowerCase().includes("samsung");
                          const isSelected = selectedService?._id === svc._id;
                          const isFavouriteService = isFavourite;

                          return (
                            <button
                              key={svc._id}
                              onClick={() => {
                                setSelectedService(svc);
                                setIsDropdownOpen(false);
                                setSearchTerm("");
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                                isSelected
                                  ? "bg-[#84CC16] text-white shadow-sm"
                                  : isFavouriteService
                                    ? "hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                    : "hover:bg-muted"
                              }`}
                            >
                              {/* Icon */}
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : isFavouriteService
                                      ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                                      : isApple
                                        ? "bg-muted text-muted-foreground"
                                        : isSamsung
                                          ? "bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                                          : "bg-green-50 text-green-500 dark:bg-green-950/40 dark:text-green-400"
                                }`}
                              >
                                {isFavouriteService ? (
                                  <Star size={18} className="fill-amber-500" />
                                ) : (
                                  <Info size={18} />
                                )}
                              </div>

                              {/* Service Info */}
                              <div className="flex flex-col items-start flex-1 min-w-0">
                                <span
                                  className={`text-[13px] font-black truncate w-full text-left ${
                                    isSelected
                                      ? "text-white"
                                      : "text-foreground"
                                  }`}
                                >
                                  {svc.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`text-[9px] font-bold uppercase tracking-wider ${
                                      isSelected
                                        ? "text-white/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    ID: {svc.serviceId || "N/A"}
                                  </span>
                                  <div className="w-0.5 h-0.5 rounded-full bg-current opacity-30" />
                                  <span
                                    className={`text-[10px] font-black ${
                                      isSelected
                                        ? "text-white"
                                        : "text-[#84CC16]"
                                    }`}
                                  >
                                    {svc.priceLabel}
                                  </span>
                                </div>
                              </div>

                              {/* Selected Check Icon */}
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  layoutId="selected-check"
                                >
                                  <Check size={16} strokeWidth={3} />
                                </motion.div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium text-sm">
                    No services found for &quot;{searchTerm}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-muted/50 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {totalServices} Services Available
              </span>
              {searchTerm && filteredCategories.length > 0 && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-[10px] font-black text-[#84CC16] uppercase tracking-wider hover:underline"
                >
                  Clear Search
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

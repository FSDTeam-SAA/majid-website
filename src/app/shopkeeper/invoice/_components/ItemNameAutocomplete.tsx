/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchDeviceCatalog } from "@/features/shopkeeper/inventory/data/deviceCatalog";

export interface ItemNameAutocompleteProps {
  value?: string | number | null;
  onChange: (value: string) => void;
  onSelectItem: (item: any) => void;
  inventoryItems: any[];
  error?: boolean;
  placeholder?: string;
  className?: string;
}

export function ItemNameAutocomplete({
  value,
  onChange,
  onSelectItem,
  inventoryItems = [],
  error,
  placeholder = "Select or Type Item Name",
  className,
}: ItemNameAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    const q = String(value ?? "")
      .trim()
      .toLowerCase();
    const seen = new Set<string>();
    const inventoryMatches: any[] = [];

    // 1. Existing inventory items (Top priority)
    for (const item of inventoryItems) {
      if (!item?.itemName) continue;
      const key =
        `${item.itemName}-${item.storage || ""}-${item.color || ""}-${item.currentState || (item as any).condition || ""}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        if (
          !q ||
          String(item.itemName || "")
            .toLowerCase()
            .includes(q)
        ) {
          inventoryMatches.push({
            ...item,
            source: "inventory",
          });
        }
      }
    }

    // 2. Common device catalog suggestions
    const catalogResults = searchDeviceCatalog(q, 35);
    const catalogMatches: any[] = [];
    for (const device of catalogResults) {
      const modelKey = device.itemName.toLowerCase();
      if (!seen.has(modelKey)) {
        seen.add(modelKey);
        catalogMatches.push({
          itemName: device.itemName,
          brand: device.brand,
          storage: device.storages[0] || "",
          availableStorages: device.storages,
          color: device.colors[0] || "",
          availableColors: device.colors,
          condition: device.currentState || "new",
          currentState: device.currentState || "new",
          source: "catalog",
        });
      }
    }

    const maxInventory = q ? 15 : 10;
    const maxCatalog = q ? 20 : 15;
    return [
      ...inventoryMatches.slice(0, maxInventory),
      ...catalogMatches.slice(0, maxCatalog),
    ];
  }, [value, inventoryItems]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          placeholder={placeholder}
          className={`rounded-2xl h-12 pr-10 border-primary bg-background font-bold ${
            error ? "border-red-500 ring-2 ring-red-500/20" : ""
          } ${className || ""}`}
          value={value ?? ""}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
          tabIndex={-1}
          aria-label="Toggle item selection"
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-primary/40 bg-popover shadow-2xl backdrop-blur-md p-1.5 animate-in fade-in-50 zoom-in-95">
          {filteredItems.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>
                  {String(value ?? "").trim()
                    ? "Suggestions"
                    : "Common Devices & Inventory"}
                </span>
                <span className="text-[10px] font-medium text-primary font-mono">
                  {filteredItems.length} suggestions
                </span>
              </div>
              {filteredItems.map((item, idx) => (
                <button
                  key={`${item.source || "item"}-${item._id || idx}-${item.itemName}`}
                  type="button"
                  onClick={() => {
                    onSelectItem(item);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {item.itemName}
                      </span>
                      {item.source === "catalog" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                          <Smartphone size={10} />
                          Catalog
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                          In Inventory
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {item.storage && (
                        <span className="inline-block text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {item.storage}
                        </span>
                      )}
                      {item.availableStorages &&
                        item.availableStorages.length > 1 && (
                          <span className="inline-block text-[9px] font-medium text-muted-foreground/70">
                            (+{item.availableStorages.length - 1} sizes)
                          </span>
                        )}
                      {item.color && (
                        <span className="inline-block text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {item.color}
                        </span>
                      )}
                      {(item.condition || item.currentState) && (
                        <span className="inline-block text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                          {item.condition || item.currentState}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0 opacity-80 group-hover:opacity-100 group-hover:underline">
                    Use Details
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No matching devices found. You can continue typing to add this
              item manually.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

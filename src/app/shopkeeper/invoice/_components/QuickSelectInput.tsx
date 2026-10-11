"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export function dedupeStrings(
  arr: (string | number | undefined | null)[],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    if (!item) continue;
    const trimmed = String(item).trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }
  return result;
}

export interface QuickSelectInputProps {
  value?: string | number | null;
  onChange: (value: string) => void;
  options: (string | number)[];
  preferredOptions?: (string | number)[];
  placeholder?: string;
  listId?: string;
  className?: string;
}

export function QuickSelectInput({
  value,
  onChange,
  options,
  preferredOptions,
  placeholder,
  listId,
  className,
}: QuickSelectInputProps) {
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

  const displayOptions = useMemo(() => {
    const q = String(value ?? "")
      .trim()
      .toLowerCase();
    const allUnique = dedupeStrings([...(preferredOptions || []), ...options]);

    if (!q) return allUnique;

    const matches = allUnique.filter((opt) =>
      String(opt).toLowerCase().includes(q),
    );
    const isExactMatch = allUnique.some(
      (opt) => String(opt).toLowerCase() === q,
    );
    // If exact match with current value, show all options so user can switch between them
    if (isExactMatch) {
      return allUnique;
    }
    return matches.length > 0 ? matches : allUnique;
  }, [value, options, preferredOptions]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          list={listId}
          placeholder={placeholder}
          className={`rounded-2xl h-12 pr-10 border-primary bg-background font-bold ${className || ""}`}
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
          aria-label="Toggle options"
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-primary/40 bg-popover shadow-2xl backdrop-blur-md p-1.5 animate-in fade-in-50 zoom-in-95">
          {displayOptions.length > 0 ? (
            <div className="space-y-0.5">
              {preferredOptions && preferredOptions.length > 0 && (
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Recommended for this model
                </div>
              )}
              {displayOptions.map((opt, idx) => {
                const isSelected =
                  String(opt).toLowerCase() ===
                  String(value ?? "").toLowerCase();
                const isPreferred = preferredOptions?.some(
                  (p) => String(p).toLowerCase() === String(opt).toLowerCase(),
                );

                return (
                  <button
                    key={`quick-opt-${opt}-${idx}`}
                    type="button"
                    onClick={() => {
                      onChange(String(opt));
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-primary/10 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{opt}</span>
                      {isPreferred && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          Model Spec
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-primary shrink-0">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

const padValue = (value: number) => value.toString().padStart(2, "0");

export const getTodayDateValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${padValue(now.getMonth() + 1)}-${padValue(
    now.getDate(),
  )}`;
};

export const getCurrentTimeValue = () => {
  const now = new Date();
  return `${padValue(now.getHours())}:${padValue(now.getMinutes())}`;
};

export const formatInvoiceDateTime = (dateValue: string, timeValue: string) => {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours = 0, minutes = 0] = timeValue.split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface InvoiceDateTimeSectionProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function InvoiceDateTimeSection({
  value,
  onChange,
  className = "",
}: InvoiceDateTimeSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleQuickOption = (option: "now" | "today" | "yesterday") => {
    const now = new Date();
    if (option === "now") {
      onChange(new Date());
    } else if (option === "today") {
      now.setHours(0, 0, 0, 0);
      onChange(now);
    } else if (option === "yesterday") {
      now.setDate(now.getDate() - 1);
      now.setHours(0, 0, 0, 0);
      onChange(now);
    }
  };

  const formatDateForInput = (d: Date) => {
    return `${d.getFullYear()}-${padValue(d.getMonth() + 1)}-${padValue(
      d.getDate(),
    )}`;
  };

  const formatTimeForInput = (d: Date) => {
    return `${padValue(d.getHours())}:${padValue(d.getMinutes())}`;
  };

  const handleDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return;
    const newDate = new Date(value);
    newDate.setFullYear(year, month - 1, day);
    onChange(newDate);
  };

  const handleTimeChange = (timeStr: string) => {
    if (!timeStr) return;
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (hours === undefined || minutes === undefined) return;
    const newDate = new Date(value);
    newDate.setHours(hours, minutes);
    onChange(newDate);
  };

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-xs transition-all hover:border-primary/40 ${className}`}
    >
      {/* Quick Option Buttons */}
      <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 border border-border/50">
        <button
          type="button"
          onClick={() => handleQuickOption("now")}
          className="rounded-lg px-2.5 py-1 text-xs font-bold text-muted-foreground transition-all hover:bg-background hover:text-primary hover:shadow-xs active:scale-95 cursor-pointer"
        >
          Now
        </button>
        <button
          type="button"
          onClick={() => handleQuickOption("today")}
          className="rounded-lg px-2.5 py-1 text-xs font-bold text-muted-foreground transition-all hover:bg-background hover:text-primary hover:shadow-xs active:scale-95 cursor-pointer"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => handleQuickOption("yesterday")}
          className="rounded-lg px-2.5 py-1 text-xs font-bold text-muted-foreground transition-all hover:bg-background hover:text-primary hover:shadow-xs active:scale-95 cursor-pointer"
        >
          Yesterday
        </button>
      </div>

      {/* Date Field Container */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1 shadow-xs transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
        <input
          type="date"
          value={mounted ? formatDateForInput(value) : ""}
          onMouseDown={(e) => e.currentTarget.showPicker?.()}
          onClick={(e) => e.currentTarget.showPicker?.()}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-[130px] bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
        />
      </div>

      {/* Time Field Container */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1 shadow-xs transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
        <input
          type="time"
          value={mounted ? formatTimeForInput(value) : ""}
          onMouseDown={(e) => e.currentTarget.showPicker?.()}
          onClick={(e) => e.currentTarget.showPicker?.()}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="w-[105px] bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
        />
      </div>
    </div>
  );
}

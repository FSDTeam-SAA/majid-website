"use client";

import React, { useState } from "react";
import { Clock, Calendar, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IShiftItem, IRotaStaffMember } from "../api/rota.api";

interface ShiftEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: IShiftItem | null;
  staff: IRotaStaffMember | null;
  dateStr: string;
  onSave: (updatedShift: IShiftItem) => void;
}

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
  isOpen,
  onClose,
  shift,
  staff,
  dateStr,
  onSave,
}) => {
  const [isOff, setIsOff] = useState<boolean>(Boolean(shift?.isOff));
  const [startTime, setStartTime] = useState<string>(
    shift?.startTime && shift.startTime !== "00:00" ? shift.startTime : "09:00",
  );
  const [endTime, setEndTime] = useState<string>(
    shift?.endTime && shift.endTime !== "00:00" ? shift.endTime : "17:00",
  );
  const [note, setNote] = useState<string>(shift?.note || "");

  // Calculate hours between start & end
  const calculateHours = (start: string, end: string): number => {
    if (!start || !end || isOff) return 0;
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    const startMins = sH * 60 + sM;
    let endMins = eH * 60 + eM;
    if (endMins < startMins) endMins += 24 * 60; // Overnight shift
    const diff = (endMins - startMins) / 60;
    return Math.max(0, Math.round(diff * 10) / 10);
  };

  const hours = calculateHours(startTime, endTime);
  const hourlyRate = staff?.hourlyWage || 12;
  const estimatedCost = Math.round(hours * hourlyRate * 100) / 100;

  const formattedDate = dateStr
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(dateStr))
    : "";

  const handleSave = () => {
    const updated: IShiftItem = {
      ...(shift || {}),
      staffId:
        staff?._id ||
        (typeof shift?.staffId === "string"
          ? shift.staffId
          : shift?.staffId?._id) ||
        "",
      date: dateStr,
      startTime: isOff ? "00:00" : startTime,
      endTime: isOff ? "00:00" : endTime,
      hours: isOff ? 0 : hours,
      isOff,
      note: isOff ? note || "Off" : note,
    };
    onSave(updated);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border-border text-foreground rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-[#84CC16]" />
              Edit Shift Schedule
            </DialogTitle>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {formattedDate}
          </p>
        </DialogHeader>

        {/* Staff Profile Row */}
        <div className="flex items-center gap-3 p-3 bg-surface-muted/60 rounded-xl border border-border/60 my-2">
          <div className="w-10 h-10 rounded-full bg-[#84CC16]/20 border border-[#84CC16]/40 flex items-center justify-center font-bold text-[#65A30D] text-sm">
            {staff?.firstName?.[0]}
            {staff?.lastName?.[0] || ""}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-foreground truncate">
              {staff?.firstName} {staff?.lastName || ""}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="font-mono">{staff?.staffId || "STF-4130"}</span>
              <span>•</span>
              <span className="text-[#65A30D] font-semibold">
                £{hourlyRate}/hour
              </span>
            </div>
          </div>
        </div>

        {/* Shift Type Toggle */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">
            Status / Shift Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsOff(false)}
              className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                !isOff
                  ? "bg-[#84CC16] text-white border-[#84CC16] shadow-sm shadow-[#84CC16]/30"
                  : "bg-surface-muted text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Working Shift
            </button>
            <button
              type="button"
              onClick={() => setIsOff(true)}
              className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isOff
                  ? "bg-slate-700 text-white border-slate-700 shadow-sm"
                  : "bg-surface-muted text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <X className="w-3.5 h-3.5" />
              Day Off
            </button>
          </div>
        </div>

        {!isOff ? (
          <div className="space-y-4 pt-1">
            {/* Shift Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="startTime"
                  className="text-xs font-semibold text-foreground"
                >
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-background border-border text-sm font-semibold rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="endTime"
                  className="text-xs font-semibold text-foreground"
                >
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-background border-border text-sm font-semibold rounded-xl"
                />
              </div>
            </div>

            {/* Shift Summary Metrics */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Total Shift Duration
                </span>
                <p className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                  {hours} <span className="text-xs font-normal">hours</span>
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Estimated Shift Cost
                </span>
                <p className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                  £{estimatedCost}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/60 border border-border/80 rounded-xl text-center space-y-1">
            <p className="text-sm font-bold text-foreground">Marked as Off</p>
            <p className="text-xs text-muted-foreground">
              The staff member will not be scheduled for hours on this day.
            </p>
          </div>
        )}

        {/* Note input */}
        <div className="space-y-1.5 pt-1">
          <Label
            htmlFor="shiftNote"
            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            Shift Note (Optional)
          </Label>
          <Input
            id="shiftNote"
            placeholder="e.g. Opening shift, Keyholder, Closing"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-background border-border text-xs rounded-xl"
          />
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-[#84CC16] hover:bg-[#74b513] text-white rounded-xl text-xs font-bold shadow-md shadow-[#84CC16]/20"
          >
            Save Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

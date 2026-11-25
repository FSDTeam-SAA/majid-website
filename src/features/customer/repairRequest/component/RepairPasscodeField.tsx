"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, RotateCcw } from "lucide-react";

export type DevicePasscodeType = "none" | "pin" | "password" | "pattern";

export interface DevicePasscodeInputValue {
  type: DevicePasscodeType;
  value: string;
}

const NODE_COORDS: Record<number, { x: number; y: number }> = {
  1: { x: 20, y: 20 },
  2: { x: 60, y: 20 },
  3: { x: 100, y: 20 },
  4: { x: 20, y: 60 },
  5: { x: 60, y: 60 },
  6: { x: 100, y: 60 },
  7: { x: 20, y: 100 },
  8: { x: 60, y: 100 },
  9: { x: 100, y: 100 },
};

export function parsePatternNodes(raw: string): number[] {
  return raw
    .split("-")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 9);
}

export function PatternGrid({
  nodes,
  interactive = false,
  masked = false,
  size = 120,
  onToggleNode,
}: {
  nodes: number[];
  interactive?: boolean;
  masked?: boolean;
  size?: number;
  onToggleNode?: (node: number) => void;
}) {
  const activeNodes = masked ? [] : nodes;

  return (
    <div
      className="relative rounded-xl border border-border bg-card select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {activeNodes.length >= 2 &&
          activeNodes.slice(0, -1).map((fromNode, idx) => {
            const toNode = activeNodes[idx + 1];
            const from = NODE_COORDS[fromNode];
            const to = NODE_COORDS[toNode];
            if (!from || !to) return null;
            return (
              <line
                key={`${fromNode}-${toNode}-${idx}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })}
      </svg>

      <div className="grid grid-cols-3 grid-rows-3 w-full h-full relative z-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((node) => {
          const orderIdx = activeNodes.indexOf(node);
          const isSelected = orderIdx !== -1;
          return (
            <button
              key={node}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onToggleNode?.(node)}
              className={`flex items-center justify-center ${
                interactive ? "cursor-pointer" : "cursor-default"
              }`}
              aria-label={`Pattern dot ${node}`}
            >
              <span
                className={`rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isSelected
                    ? "w-5 h-5 bg-[#10B981] text-white ring-2 ring-[#10B981]/30"
                    : "w-3 h-3 bg-muted-foreground/30"
                }`}
              >
                {isSelected ? orderIdx + 1 : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RepairPasscodeField({
  value,
  onChange,
}: {
  value: DevicePasscodeInputValue;
  onChange: (next: DevicePasscodeInputValue) => void;
}) {
  const [masked, setMasked] = useState(true);
  const patternNodes = parsePatternNodes(
    value.type === "pattern" ? value.value : "",
  );

  const selectType = (type: DevicePasscodeType) => {
    if (type === value.type) return;
    onChange({ type, value: "" });
  };

  const togglePatternNode = (node: number) => {
    const next = patternNodes.includes(node)
      ? patternNodes.filter((n) => n !== node)
      : [...patternNodes, node];
    onChange({ type: "pattern", value: next.join("-") });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#10B981]" />
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Device Passcode (Optional)
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Encrypted · Technicians only
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "none", label: "None" },
            { id: "pin", label: "PIN" },
            { id: "password", label: "Password" },
            { id: "pattern", label: "Pattern" },
          ] as const
        ).map((item) => {
          const isSel = value.type === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectType(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isSel
                  ? "border-[#10B981] bg-[#10B981]/15 text-[#10B981]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {(value.type === "pin" || value.type === "password") && (
        <div className="relative">
          <input
            type={masked ? "password" : "text"}
            inputMode={value.type === "pin" ? "numeric" : "text"}
            placeholder={
              value.type === "pin"
                ? "Enter numeric PIN (e.g. 1234)"
                : "Enter alphanumeric password"
            }
            value={value.value}
            onChange={(e) => {
              const nextVal =
                value.type === "pin"
                  ? e.target.value.replace(/\D/g, "")
                  : e.target.value;
              onChange({ type: value.type, value: nextVal });
            }}
            className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:border-[#10B981]"
          />
          <button
            type="button"
            onClick={() => setMasked((m) => !m)}
            title={masked ? "Preview passcode" : "Mask passcode"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {masked ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      )}

      {value.type === "pattern" && (
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <PatternGrid
            nodes={patternNodes}
            interactive
            masked={masked}
            size={132}
            onToggleNode={togglePatternNode}
          />
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-foreground">
              Tap dots in order to record the unlock pattern
            </p>
            <p className="text-muted-foreground">
              {patternNodes.length === 0
                ? "No dots selected"
                : masked
                  ? `Pattern recorded (${patternNodes.length} dots)`
                  : `Sequence: ${patternNodes.join("-")}`}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMasked((m) => !m)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:border-[#10B981]"
              >
                {masked ? <Eye size={13} /> : <EyeOff size={13} />}
                {masked ? "Reveal pattern" : "Mask pattern"}
              </button>
              {patternNodes.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ type: "pattern", value: "" })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <RotateCcw size={13} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

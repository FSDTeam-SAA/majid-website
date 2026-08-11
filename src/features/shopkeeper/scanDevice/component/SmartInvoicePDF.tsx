"use client";

import React from "react";
import { BadgeCheck, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";
import { InvoiceFormData } from "./InvoiceModal";
import { formatCurrency as baseFormatCurrency } from "@/lib/currency";

interface SmartInvoicePDFProps {
  data: IMEIResult;
  id: string;
  invoiceData: InvoiceFormData;
  shopkeeperDetails?: {
    shopName: string;
    shopAddress: string;
    phone: string;
    email: string;
    vatId: string;
    logo?: string;
  };
}

type ProviderRow = {
  label: string;
  value: string;
  rawValue: unknown;
};

export const INVOICE_PDF_WIDTH = 750;

const getText = (value: unknown, fallback = "N/A") => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.src === "string") return obj.src;
  }
  return fallback;
};

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeLabel = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const parseProviderData = (data: IMEIResult) => {
  const providerData = data.providerData as { result?: string } | undefined;
  const parsedProviderData = (
    data as unknown as { parsedProviderData?: unknown }
  ).parsedProviderData;
  const parsedRows: ProviderRow[] =
    parsedProviderData && typeof parsedProviderData === "object"
      ? Object.entries(parsedProviderData as Record<string, unknown>)
          .filter(
            ([, value]) =>
              value !== undefined && value !== null && value !== "",
          )
          .map(([label, value]) => ({
            label: formatLabel(label),
            value: getText(value),
            rawValue: value,
          }))
      : [];
  const rawHtml = providerData?.result || "";
  const cleanText = rawHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");

  const htmlRows = cleanText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): ProviderRow | null => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        return {
          label: formatLabel(line.slice(0, colonIndex).trim()),
          value: line.slice(colonIndex + 1).trim(),
          rawValue: line.slice(colonIndex + 1).trim(),
        };
      }
      return null;
    })
    .filter((row): row is ProviderRow => Boolean(row));
  const seen = new Set<string>();
  const rows = [...parsedRows, ...htmlRows].filter((row) => {
    const key = normalizeLabel(row.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (labels: string[], fallback = "N/A") => {
    for (const label of labels) {
      const row = rows.find((item) =>
        normalizeLabel(item.label).includes(normalizeLabel(label)),
      );
      if (row?.value) return row.value;
    }
    return fallback;
  };
};

export const SmartInvoicePDF = React.forwardRef<
  HTMLDivElement,
  SmartInvoicePDFProps
>(({ data, id, invoiceData, shopkeeperDetails }, ref) => {
  const currencyCode = invoiceData.currency || "USD";
  const currency = (amount: number) =>
    baseFormatCurrency(Number(amount || 0), currencyCode);
  const getValue = parseProviderData(data);

  const seller = shopkeeperDetails ?? {
    shopName: "Imoscan",
    shopAddress: "Verified device seller",
    phone: "N/A",
    email: "support@imoscan.com",
    vatId: "N/A",
  };

  const deviceName = getValue(
    ["Device", "Model Name", "Model"],
    data.deviceName,
  );
  const imei = getValue(["IMEI Number", "IMEI"], data.imei);
  const serialNumber = getValue(["Serial Number", "Serial"], "N/A");
  const coverageBenefits = getValue(["Coverage Benefits"], "N/A");
  const warrantyExpiry = getValue(
    ["Warranty Expires", "Coverage End Date"],
    "N/A",
  );
  const warrantyType = getValue(["Warranty Type"], "N/A");
  const purchaseDate = getValue(
    ["Estimated Purchase Date", "Purchase Date"],
    "N/A",
  );
  const activationStatus = getValue(["Activation Status"], "N/A");
  const registrationStatus = getValue(["Registration Status"], "N/A");
  const replacedDevice = getValue(["Replaced Device"], "N/A");
  const openRepair = getValue(["Open Repair"], "N/A");
  const notice = getValue(["Notice"], "");
  const simLock = getValue(["SIM Lock Status", "SIM Lock"], "N/A");
  const blacklist = getValue(["Blacklist Status"], "N/A");
  const invoiceDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const invoiceNo = `INV-${data.imei?.slice(-6) || "000000"}-${new Date().getFullYear()}`;

  const tradeInAmount =
    invoiceData.paymentMethod === "tradein" && invoiceData.tradeInDetails
      ? invoiceData.tradeInDetails.tradeInValue
      : 0;
  const total =
    invoiceData.paymentMethod === "tradein" && invoiceData.tradeInDetails
      ? invoiceData.tradeInDetails.remainingAmount
      : invoiceData.price;

  const paymentLabel =
    invoiceData.paymentMethod === "bank" && invoiceData.bankDetails
      ? `Bank transfer (${invoiceData.bankDetails.maskedNumber})`
      : invoiceData.paymentMethod === "tradein" && invoiceData.tradeInDetails
        ? `Trade-in: ${invoiceData.tradeInDetails.deviceName}`
        : "Cash";

  const colors = {
    ink: "#111827",
    muted: "#6B7280",
    faint: "#F3F4F6",
    line: "#D1D5DB",
    brandSoft: "#F7FEE7",
    brandLine: "#D9F99D",
    brand: "#65A30D",
    success: "#16A34A",
    warning: "#B45309",
  };

  return (
    <div
      ref={ref}
      id={id}
      style={{
        width: `${INVOICE_PDF_WIDTH}px`,
        background: "#ffffff",
        color: colors.ink,
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "42px 46px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `3px solid ${colors.brand}`,
          paddingBottom: "22px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ReceiptText
              size={28}
              color={colors.brand}
              style={{ flexShrink: 0, display: "block" }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 900 }}>
                INVOICE
              </h1>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "10px",
                  color: colors.muted,
                  letterSpacing: "1.4px",
                  fontWeight: 700,
                }}
              >
                VERIFIED DEVICE SALE
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: 900 }}>
            {seller.shopName}
          </p>
          <p
            style={{
              margin: "5px 0 0",
              maxWidth: "250px",
              fontSize: "10px",
              color: colors.muted,
              lineHeight: 1.45,
            }}
          >
            {seller.shopAddress}
          </p>
          <p
            style={{ margin: "6px 0 0", fontSize: "10px", color: colors.muted }}
          >
            {seller.phone} | {seller.email}
          </p>
          {seller.vatId !== "N/A" && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "10px",
                color: colors.muted,
              }}
            >
              VAT/Tax ID: {seller.vatId}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        {[
          ["Customer", invoiceData.customerName],
          ["Phone", invoiceData.customerPhone],
          ["Email", invoiceData.customerEmail || "N/A"],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: `1px solid ${colors.line}`,
              background: colors.brandSoft,
              padding: "9px 10px",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: "8px",
                fontWeight: 900,
                color: colors.muted,
                letterSpacing: "0.9px",
              }}
            >
              {label.toUpperCase()}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "10px",
                fontWeight: 800,
                lineHeight: 1.35,
                wordBreak: "break-word",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 0.75fr",
          gap: "24px",
          marginTop: "18px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <UserRound
              size={14}
              color={colors.brand}
              style={{ flexShrink: 0, display: "block" }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "10px",
                fontWeight: 900,
                color: colors.muted,
                letterSpacing: "1px",
              }}
            >
              BILL TO
            </p>
          </div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 800 }}>
            {invoiceData.customerName}
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "10px",
              color: colors.muted,
              lineHeight: 1.45,
            }}
          >
            {invoiceData.customerAddress}
          </p>
          <p
            style={{ margin: "6px 0 0", fontSize: "10px", color: colors.muted }}
          >
            {invoiceData.customerPhone}
            {invoiceData.customerEmail ? ` | ${invoiceData.customerEmail}` : ""}
          </p>
        </div>

        <div
          style={{
            border: `1px solid ${colors.line}`,
            background: colors.faint,
            padding: "12px 14px",
          }}
        >
          {[
            ["Invoice No.", invoiceNo],
            ["Invoice Date", invoiceDate],
            ["Payment", paymentLabel],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                padding: "5px 0",
                borderBottom:
                  label === "Payment" ? "none" : `1px solid ${colors.line}`,
              }}
            >
              <span style={{ fontSize: "9px", color: colors.muted }}>
                {label}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  textAlign: "right",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "24px",
          border: `1px solid ${colors.line}`,
        }}
      >
        <thead>
          <tr style={{ background: colors.brand }}>
            {["Item", "IMEI / Serial", "Verification", "Qty", "Amount"].map(
              (heading) => (
                <th
                  key={heading}
                  style={{
                    color: "#ffffff",
                    padding: "11px 10px",
                    fontSize: "9px",
                    textAlign: heading === "Amount" ? "right" : "left",
                    letterSpacing: "0.8px",
                  }}
                >
                  {heading.toUpperCase()}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "15px 10px", verticalAlign: "top" }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 900 }}>
                {deviceName}
              </p>
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "9px",
                  color: colors.muted,
                }}
              >
                Warranty: {warrantyExpiry}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "9px",
                  color: colors.muted,
                }}
              >
                Purchase date: {purchaseDate}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "9px",
                  color: colors.muted,
                }}
              >
                Warranty type: {warrantyType}
              </p>
            </td>
            <td
              style={{
                padding: "15px 10px",
                fontSize: "9px",
                fontFamily: "monospace",
                verticalAlign: "top",
                lineHeight: 1.5,
              }}
            >
              IMEI: {imei}
              <br />
              Serial: {serialNumber}
            </td>
            <td style={{ padding: "15px 10px", verticalAlign: "top" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <BadgeCheck
                  size={13}
                  color={colors.success}
                  style={{ flexShrink: 0, display: "block" }}
                />
                <span style={{ fontSize: "9px", fontWeight: 800 }}>
                  AI checked
                </span>
              </div>
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "8px",
                  color: colors.muted,
                }}
              >
                Blacklist: {blacklist}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "8px",
                  color: colors.muted,
                }}
              >
                SIM lock: {simLock}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "8px",
                  color: colors.muted,
                }}
              >
                Activation: {activationStatus}
              </p>
            </td>
            <td
              style={{
                padding: "15px 10px",
                fontSize: "10px",
                fontWeight: 800,
                verticalAlign: "top",
              }}
            >
              1
            </td>
            <td
              style={{
                padding: "15px 10px",
                fontSize: "12px",
                fontWeight: 900,
                textAlign: "right",
                verticalAlign: "top",
              }}
            >
              {currency(invoiceData.price)}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          border: `1px solid ${colors.brandLine}`,
          background: colors.brandSoft,
          padding: "12px 14px",
          marginTop: "14px",
        }}
      >
        <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 900 }}>
          IMEI API Response Summary
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          {[
            ["Coverage", coverageBenefits],
            ["Registration", registrationStatus],
            ["Replaced", replacedDevice],
            ["Open Repair", openRepair],
            ["Risk", `${data.riskMeter?.score ?? 0}/100`],
            ["AI", data.aiInsight?.title || "N/A"],
          ].map(([label, value]) => (
            <div key={label}>
              <p
                style={{
                  margin: "0 0 3px",
                  fontSize: "7px",
                  color: colors.muted,
                  fontWeight: 900,
                  letterSpacing: "0.6px",
                }}
              >
                {label.toUpperCase()}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "9px",
                  fontWeight: 800,
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        {notice && notice !== "N/A" && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: "9px",
              color: colors.warning,
              lineHeight: 1.35,
            }}
          >
            Notice: {notice}
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 240px",
          gap: "28px",
          marginTop: "24px",
        }}
      >
        <div
          style={{
            border: `1px solid ${colors.line}`,
            padding: "14px",
            minHeight: "96px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <ShieldCheck
              size={15}
              color={colors.brand}
              style={{ flexShrink: 0, display: "block" }}
            />
            <p style={{ margin: 0, fontSize: "10px", fontWeight: 900 }}>
              Device Verification Note
            </p>
          </div>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "9px",
              color: colors.muted,
              lineHeight: 1.55,
            }}
          >
            This invoice includes the IMEI verification status available at the
            time of sale. Buyer should match the IMEI on the physical device
            before completing ownership transfer.
          </p>
          <p
            style={{ margin: "8px 0 0", fontSize: "9px", color: colors.muted }}
          >
            Risk score: {data.riskMeter?.score ?? 0}/100 |{" "}
            {data.riskMeter?.label || data.riskMeter?.riskLevel || "N/A"}
          </p>
        </div>

        <div>
          {[
            ["Subtotal", currency(invoiceData.price)],
            ...(tradeInAmount
              ? [["Trade-in Credit", `-${currency(tradeInAmount)}`]]
              : []),
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${colors.line}`,
              }}
            >
              <span style={{ fontSize: "10px", color: colors.muted }}>
                {label}
              </span>
              <span style={{ fontSize: "11px", fontWeight: 800 }}>{value}</span>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: colors.brand,
              color: "#ffffff",
              padding: "13px 12px",
              marginTop: "10px",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 900 }}>TOTAL</span>
            <span style={{ fontSize: "17px", fontWeight: 900 }}>
              {currency(total)}
            </span>
          </div>
          <p
            style={{
              margin: "8px 0 0",
              textAlign: "right",
              color:
                invoiceData.paymentStatus === "unpaid"
                  ? colors.warning
                  : colors.success,
              fontSize: "9px",
              fontWeight: 900,
            }}
          >
            {invoiceData.paymentStatus === "unpaid" ? "UNPAID" : "PAID"}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "36px",
          marginTop: "44px",
          fontSize: "10px",
          color: colors.muted,
        }}
      >
        <div>
          <div
            style={{ borderTop: `1px solid ${colors.ink}`, paddingTop: "8px" }}
          >
            Seller Signature
          </div>
        </div>
        <div>
          <div
            style={{ borderTop: `1px solid ${colors.ink}`, paddingTop: "8px" }}
          >
            Customer Signature
          </div>
        </div>
      </div>

      <p
        style={{
          margin: "26px 0 0",
          textAlign: "center",
          fontSize: "9px",
          color: colors.muted,
        }}
      >
        Thank you for your purchase. Keep this invoice for warranty and resale
        records.
      </p>
    </div>
  );
});

SmartInvoicePDF.displayName = "SmartInvoicePDF";

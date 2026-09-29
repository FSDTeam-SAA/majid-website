/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatCurrency as baseFormatCurrency } from "@/lib/currency";
import { getPdfLogoStyles } from "@/lib/logoHelper";

export interface PurchaseInvoicePdfProps {
  customer?: any;
  items?: any[];
  shopkeeper?: any;
  total?: number | string;
  invoiceDate?: Date | string;
  currency?: string;
  templateId?: string;
}

// ----------------------------------------------------
// DEFAULT PURCHASE RECEIPT STYLES
// ----------------------------------------------------
const defaultStyles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#F8FAFC",
    fontSize: 9,
    color: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 18,
  },
  brandWrap: { flex: 1 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logoFallback: { fontSize: 20, fontWeight: "bold", color: "#84CC16" },
  checkDot: { fontSize: 16, color: "#84CC16", marginLeft: 4 },
  shopAddress: { marginTop: 4, color: "#64748B", fontSize: 8 },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#155E63",
    letterSpacing: 1,
  },
  metaGrid: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metaBlock: { flex: 1 },
  metaLabel: {
    fontSize: 7.5,
    textTransform: "uppercase",
    color: "#94A3B8",
    fontWeight: "bold",
  },
  metaText: { fontSize: 8.5, color: "#1E293B", fontWeight: "bold" },
  metaDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },
  pillRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  customerPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
  },
  shopPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
  },
  pillTitle: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#64748B",
    fontWeight: "bold",
    marginBottom: 4,
  },
  pillName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  pillDetail: { fontSize: 8, color: "#64748B", marginBottom: 1 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#155E63",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  colProduct: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 2, textAlign: "right" },
  productText: { fontSize: 9, fontWeight: "bold", color: "#1E293B" },
  productSub: { fontSize: 7.5, color: "#64748B", marginTop: 1 },
  totalBand: {
    backgroundColor: "#84CC16",
    color: "#0F172A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  totalBandLabel: { fontSize: 11, fontWeight: "bold" },
  totalBandAmount: { fontSize: 15, fontWeight: "bold" },
  footerNote: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    textAlign: "center",
    fontSize: 7.5,
    color: "#94A3B8",
  },
});

export const PurchaseInvoicePdfDocument: React.FC<PurchaseInvoicePdfProps> = ({
  customer,
  items,
  shopkeeper,
  total,
  invoiceDate,
  currency = "USD",
  templateId = "default",
}) => {
  const pdfFormatCurrency = (value: number) => {
    const rawCode = (currency || "USD").toUpperCase();
    const formatted = baseFormatCurrency(value, rawCode);

    if (rawCode === "USD" || formatted.startsWith("$")) {
      return `$${value.toFixed(2)}`;
    }
    if (rawCode === "GBP" || formatted.startsWith("£")) {
      return `£${value.toFixed(2)}`;
    }
    if (rawCode === "EUR" || formatted.startsWith("€")) {
      return `EUR ${value.toFixed(2)}`;
    }
    if (rawCode === "BDT" || formatted.includes("৳")) {
      return `BDT ${value.toFixed(2)}`;
    }
    if (rawCode === "INR" || formatted.includes("₹")) {
      return `INR ${value.toFixed(2)}`;
    }
    if (rawCode === "PKR" || formatted.includes("₨")) {
      return `PKR ${value.toFixed(2)}`;
    }
    if (rawCode === "AED" || formatted.includes("د.إ")) {
      return `AED ${value.toFixed(2)}`;
    }
    if (rawCode === "SAR" || formatted.includes("﷼")) {
      return `SAR ${value.toFixed(2)}`;
    }
    if (rawCode === "AUD") return `A$${value.toFixed(2)}`;
    if (rawCode === "CAD") return `C$${value.toFixed(2)}`;

    return `${rawCode} ${value.toFixed(2)}`;
  };

  const sanitizeText = (txt?: string | null): string => {
    if (!txt) return "";
    return txt
      .replace(/[•·▪►]/g, "|")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, "-")
      .replace(/[^\x00-\xFF]/g, " ");
  };

  const receiptDate = invoiceDate ? new Date(invoiceDate) : new Date();
  const shopName = sanitizeText(shopkeeper?.shopName) || "STORE";
  const contactPhone = sanitizeText(shopkeeper?.phone) || "N/A";
  const shopAddress = sanitizeText(shopkeeper?.shopAddress) || "N/A";
  const customerName =
    sanitizeText(
      [customer?.firstName, customer?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim(),
    ) || "Walk-In Customer";
  const totalVal = Number(total || 0);
  const invNumberStr = `PR-${receiptDate.getFullYear().toString().slice(-2)}${(receiptDate.getMonth() + 1).toString().padStart(2, "0")}`;

  const safeItems = items?.map((item: any) => ({
    ...item,
    name: sanitizeText(item.name || item.model),
    brand: sanitizeText(item.brand),
    storage: sanitizeText(item.storage),
    color: sanitizeText(item.color),
    condition: sanitizeText(item.condition),
    serials: item.serials?.map((s: string) => sanitizeText(s)),
  }));

  // 1. CLASSIC EDITORIAL (Traditional - Ref 1)
  if (templateId === "classic-editorial") {
    return (
      <Document>
        <Page
          size="A4"
          style={{
            padding: 40,
            backgroundColor: "#FFFFFF",
            fontFamily: "Times-Roman",
            fontSize: 9.5,
            color: "#1A1A1A",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottomWidth: 1.5,
              borderBottomColor: "#1A1A1A",
              paddingBottom: 14,
            }}
          >
            <View>
              <Text style={{ fontSize: 10, color: "#333" }}>
                Receipt no. {invNumberStr}
              </Text>
              <Text style={{ fontSize: 10, color: "#333", marginTop: 2 }}>
                {receiptDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#800020",
                  fontFamily: "Times-Bold",
                }}
              >
                {shopName}
              </Text>
              <Text style={{ fontSize: 8.5, color: "#555", marginTop: 2 }}>
                {shopAddress} | {contactPhone}
              </Text>
            </View>
          </View>

          <View style={{ marginVertical: 14 }}>
            <Text
              style={{
                fontSize: 8.5,
                fontWeight: "bold",
                color: "#800020",
                textTransform: "uppercase",
                fontFamily: "Times-Bold",
              }}
            >
              PURCHASED FROM
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: "#111",
                marginTop: 2,
                fontFamily: "Times-Bold",
              }}
            >
              {customerName}
            </Text>
            {customer?.phone ? (
              <Text style={{ fontSize: 8.5, color: "#666", marginTop: 1 }}>
                Phone: {customer.phone}
              </Text>
            ) : null}
          </View>

          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#800020",
              letterSpacing: 2,
              marginBottom: 14,
              fontFamily: "Times-Bold",
            }}
          >
            PURCHASE RECEIPT
          </Text>

          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1.5,
              borderBottomColor: "#1A1A1A",
              paddingBottom: 6,
              fontWeight: "bold",
              fontFamily: "Times-Bold",
            }}
          >
            <Text style={{ width: "10%" }}>Qty</Text>
            <Text style={{ width: "55%" }}>Product / Device</Text>
            <Text style={{ width: "17%", textAlign: "right" }}>Unit Price</Text>
            <Text style={{ width: "18%", textAlign: "right" }}>Total</Text>
          </View>

          {safeItems?.map((item: any, idx: number) => (
            <View
              key={item.id || idx}
              style={{
                flexDirection: "row",
                paddingVertical: 8,
                borderBottomWidth: 0.5,
                borderBottomColor: "#E5E7EB",
                alignItems: "center",
              }}
            >
              <Text style={{ width: "10%" }}>{item.quantity || 1}</Text>
              <View style={{ width: "55%" }}>
                <Text style={{ fontSize: 9.5 }}>
                  {item.name || item.model || "Device"}
                </Text>
                {item.serials?.[0] ? (
                  <Text style={{ fontSize: 7.5, color: "#666" }}>
                    Serial: {item.serials.join(", ")}
                  </Text>
                ) : null}
              </View>
              <Text style={{ width: "17%", textAlign: "right" }}>
                {pdfFormatCurrency(
                  Number(item.price || item.purchasePrice || 0),
                )}
              </Text>
              <Text style={{ width: "18%", textAlign: "right" }}>
                {pdfFormatCurrency(
                  Number(item.price || item.purchasePrice || 0) *
                    (item.quantity || 1),
                )}
              </Text>
            </View>
          ))}

          <View
            style={{
              marginTop: 18,
              alignSelf: "flex-end",
              width: 220,
              borderTopWidth: 1.5,
              borderTopColor: "#1A1A1A",
              paddingTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#800020",
                  fontFamily: "Times-Bold",
                }}
              >
                TOTAL PAID
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: "#800020",
                  fontFamily: "Times-Bold",
                }}
              >
                {pdfFormatCurrency(totalVal)}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 36,
              paddingTop: 12,
              borderTopWidth: 0.5,
              borderTopColor: "#AAA",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#800020",
                fontFamily: "Times-Bold",
              }}
            >
              Thank you
            </Text>
            <Text style={{ fontSize: 8, color: "#666" }}>
              Powered by {shopName || "iMoScan"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 2. WARM MINIMALIST (Traditional - Ref 4)
  if (templateId === "warm-minimal") {
    return (
      <Document>
        <Page
          size="A4"
          style={{
            padding: 24,
            backgroundColor: "#FFFDEB",
            fontSize: 9,
            color: "#1C1917",
          }}
        >
          <View
            style={{
              borderWidth: 1.5,
              borderColor: "#0F172A",
              padding: 28,
              minHeight: "100%",
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  letterSpacing: 2,
                  color: "#0F172A",
                }}
              >
                {shopName.toUpperCase()}
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  letterSpacing: 2,
                  color: "#52525B",
                  marginTop: 3,
                }}
              >
                PURCHASE RECEIPT
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderTopWidth: 0.5,
                borderBottomWidth: 0.5,
                borderColor: "#71717A",
                paddingVertical: 10,
                marginBottom: 18,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: "bold",
                    color: "#0F172A",
                    letterSpacing: 1,
                  }}
                >
                  DATE ISSUED
                </Text>
                <Text style={{ fontSize: 8.5, color: "#333", marginTop: 2 }}>
                  {receiptDate.toLocaleDateString("en-GB")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: "bold",
                    color: "#0F172A",
                    letterSpacing: 1,
                  }}
                >
                  RECEIPT #
                </Text>
                <Text style={{ fontSize: 8.5, color: "#333", marginTop: 2 }}>
                  {invNumberStr}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: "bold",
                    color: "#0F172A",
                    letterSpacing: 1,
                  }}
                >
                  PURCHASED FROM
                </Text>
                <Text style={{ fontSize: 8.5, color: "#333", marginTop: 2 }}>
                  {customerName}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: "#0F172A",
                paddingBottom: 6,
                fontSize: 8,
                fontWeight: "bold",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              <Text style={{ width: "10%" }}>QTY</Text>
              <Text style={{ width: "55%" }}>ITEM / DEVICE</Text>
              <Text style={{ width: "17%", textAlign: "right" }}>
                UNIT PRICE
              </Text>
              <Text style={{ width: "18%", textAlign: "right" }}>TOTAL</Text>
            </View>

            {safeItems?.map((item: any, idx: number) => (
              <View
                key={item.id || idx}
                style={{
                  flexDirection: "row",
                  paddingVertical: 8,
                  borderBottomWidth: 0.5,
                  borderColor: "#D4D4D8",
                  alignItems: "center",
                }}
              >
                <Text style={{ width: "10%" }}>{item.quantity || 1}</Text>
                <View style={{ width: "55%" }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {item.name || item.model || "Device"}
                  </Text>
                  {item.serials?.[0] ? (
                    <Text style={{ fontSize: 7, color: "#71717A" }}>
                      Serial: {item.serials.join(", ")}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ width: "17%", textAlign: "right" }}>
                  {pdfFormatCurrency(
                    Number(item.price || item.purchasePrice || 0),
                  )}
                </Text>
                <Text style={{ width: "18%", textAlign: "right" }}>
                  {pdfFormatCurrency(
                    Number(item.price || item.purchasePrice || 0) *
                      (item.quantity || 1),
                  )}
                </Text>
              </View>
            ))}

            <View
              style={{
                backgroundColor: "#CCFF00",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 4,
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "bold", color: "#0F172A" }}
              >
                TOTAL PAID
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "bold", color: "#0F172A" }}
              >
                {pdfFormatCurrency(totalVal)}
              </Text>
            </View>

            <View
              style={{
                marginTop: 36,
                paddingTop: 12,
                borderTopWidth: 1,
                borderColor: "#0F172A",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  letterSpacing: 2,
                  color: "#0F172A",
                }}
              >
                THANK YOU!
              </Text>
              <Text style={{ marginTop: 6, fontSize: 7.5, color: "#71717A" }}>
                Powered by {shopName || "iMoScan"}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // 3. NEO BOLD (Modern - Ref 2)
  if (templateId === "neo-bold") {
    return (
      <Document>
        <Page
          size="A4"
          style={{
            padding: 24,
            backgroundColor: "#FDF4F5",
            fontSize: 9,
            color: "#0F172A",
          }}
        >
          <View
            style={{
              backgroundColor: "#D4FF32",
              paddingHorizontal: 18,
              paddingVertical: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>
                {shopName}
              </Text>
              <Text
                style={{
                  fontSize: 7,
                  letterSpacing: 1.5,
                  color: "#000",
                  fontWeight: "bold",
                  marginTop: 2,
                }}
              >
                DEVICE BUYBACK & PURCHASE RECEIPT
              </Text>
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: "#000",
                letterSpacing: 1,
              }}
            >
              RECEIPT
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 6,
              padding: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 7.5,
                  fontWeight: "bold",
                  color: "#64748B",
                  textTransform: "uppercase",
                }}
              >
                CUSTOMER
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: "#000",
                  marginTop: 2,
                }}
              >
                {customerName}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 7.5,
                  fontWeight: "bold",
                  color: "#64748B",
                  textTransform: "uppercase",
                }}
              >
                RECEIPT #
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#000",
                  marginTop: 2,
                }}
              >
                {invNumberStr}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 6,
              padding: 10,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: "#E2E8F0",
                paddingBottom: 6,
                fontSize: 8,
                fontWeight: "bold",
                color: "#64748B",
                textTransform: "uppercase",
              }}
            >
              <Text style={{ width: "55%" }}>DESCRIPTION</Text>
              <Text style={{ width: "10%", textAlign: "center" }}>QTY</Text>
              <Text style={{ width: "17%", textAlign: "right" }}>UNIT</Text>
              <Text style={{ width: "18%", textAlign: "right" }}>TOTAL</Text>
            </View>

            {safeItems?.map((item: any, idx: number) => (
              <View
                key={item.id || idx}
                style={{
                  flexDirection: "row",
                  paddingVertical: 7,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#F1F5F9",
                  alignItems: "center",
                }}
              >
                <View style={{ width: "55%" }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {item.name || item.model || "Device"}
                  </Text>
                  {item.serials?.[0] ? (
                    <Text style={{ fontSize: 7, color: "#64748B" }}>
                      Serial: {item.serials.join(", ")}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ width: "10%", textAlign: "center" }}>
                  {item.quantity || 1}
                </Text>
                <Text style={{ width: "17%", textAlign: "right" }}>
                  {pdfFormatCurrency(
                    Number(item.price || item.purchasePrice || 0),
                  )}
                </Text>
                <Text style={{ width: "18%", textAlign: "right" }}>
                  {pdfFormatCurrency(
                    Number(item.price || item.purchasePrice || 0) *
                      (item.quantity || 1),
                  )}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={{
              backgroundColor: "#D4FF32",
              padding: 12,
              borderRadius: 6,
              marginBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "bold", color: "#000" }}>
              TOTAL AMOUNT PAID
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>
              {pdfFormatCurrency(totalVal)}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#D4FF32",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 4,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 9.5, fontWeight: "bold", color: "#000" }}>
              Thank you for trading in with {shopName}.
            </Text>
            <Text style={{ fontSize: 7.5, fontWeight: "bold" }}>
              Powered by {shopName || "iMoScan"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 4. MODERN RETAIL (Modern - Ref 3)
  if (templateId === "modern-retail") {
    return (
      <Document>
        <Page
          size="A4"
          style={{
            padding: 34,
            backgroundColor: "#FFFFFF",
            fontSize: 9,
            color: "#1E293B",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{ fontSize: 28, fontWeight: "bold", color: "#0F172A" }}
              >
                Purchase Receipt
              </Text>
              <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                No. {invNumberStr}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#0F172A" }}
              >
                {shopName}
              </Text>
              <Text style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>
                {shopAddress}
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{ fontSize: 11, fontWeight: "bold", color: "#0F172A" }}
            >
              Purchased from: {customerName}
            </Text>
            <Text style={{ fontSize: 8.5, color: "#64748B", marginTop: 2 }}>
              Date: {receiptDate.toLocaleDateString("en-GB")}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#8EA085",
              color: "#0F172A",
              paddingVertical: 7,
              paddingHorizontal: 10,
              borderRadius: 3,
              fontSize: 8.5,
              fontWeight: "bold",
            }}
          >
            <Text style={{ width: "55%" }}>Description</Text>
            <Text style={{ width: "10%", textAlign: "center" }}>Qty</Text>
            <Text style={{ width: "17%", textAlign: "right" }}>Price</Text>
            <Text style={{ width: "18%", textAlign: "right" }}>Total</Text>
          </View>

          {safeItems?.map((item: any, idx: number) => (
            <View
              key={item.id || idx}
              style={{
                flexDirection: "row",
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#E2E8F0",
                alignItems: "center",
              }}
            >
              <View style={{ width: "55%" }}>
                <Text style={{ fontWeight: "bold" }}>
                  {item.name || item.model || "Device"}
                </Text>
                {item.serials?.[0] ? (
                  <Text style={{ fontSize: 7, color: "#64748B" }}>
                    Serial: {item.serials.join(", ")}
                  </Text>
                ) : null}
              </View>
              <Text style={{ width: "10%", textAlign: "center" }}>
                {item.quantity || 1}
              </Text>
              <Text style={{ width: "17%", textAlign: "right" }}>
                {pdfFormatCurrency(
                  Number(item.price || item.purchasePrice || 0),
                )}
              </Text>
              <Text style={{ width: "18%", textAlign: "right" }}>
                {pdfFormatCurrency(
                  Number(item.price || item.purchasePrice || 0) *
                    (item.quantity || 1),
                )}
              </Text>
            </View>
          ))}

          <View
            style={{
              marginTop: 18,
              alignSelf: "flex-end",
              width: 220,
              borderTopWidth: 1.5,
              borderTopColor: "#8EA085",
              paddingTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "bold", color: "#0F172A" }}
              >
                Total Paid
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "bold", color: "#0F172A" }}
              >
                {pdfFormatCurrency(totalVal)}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#F0FDF4",
              borderWidth: 1,
              borderColor: "#DCFCE7",
              borderRadius: 6,
              padding: 14,
              marginTop: 26,
            }}
          >
            <Text
              style={{ fontSize: 10.5, fontWeight: "bold", color: "#166534" }}
            >
              We buy used and new devices every day.
            </Text>
            <Text style={{ fontSize: 8, color: "#15803D", marginTop: 2 }}>
              Fast diagnostics and prompt payouts at {shopName}.
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 5. NORDIC SLATE (Modern - Ref 5)
  if (templateId === "nordic-modern") {
    return (
      <Document>
        <Page
          size="A4"
          style={{
            padding: 36,
            backgroundColor: "#FFFFFF",
            fontSize: 9,
            color: "#0F172A",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#0F172A" }}
            >
              {shopName}
            </Text>
            <Text style={{ fontSize: 9, color: "#64748B" }}>
              Receipt no. {invNumberStr}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#E2E8F0",
              paddingBottom: 14,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 8,
                  color: "#64748B",
                  fontWeight: "bold",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                SELLER:
              </Text>
              <View
                style={{
                  backgroundColor: "#D9F99D",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 4,
                  marginTop: 3,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "#1A2E05",
                  }}
                >
                  {customerName}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: "#0F172A",
                letterSpacing: 1.5,
              }}
            >
              PURCHASE RECEIPT
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#F1F5F9",
              paddingVertical: 7,
              paddingHorizontal: 10,
              fontSize: 8.5,
              fontWeight: "bold",
              color: "#475569",
              borderRadius: 4,
              flexDirection: "row",
            }}
          >
            <Text style={{ width: "55%" }}>Item</Text>
            <Text style={{ width: "10%", textAlign: "center" }}>Qty</Text>
            <Text style={{ width: "17%", textAlign: "right" }}>Price</Text>
            <Text style={{ width: "18%", textAlign: "right" }}>Total</Text>
          </View>

          {safeItems?.map((item: any, idx: number) => (
            <View
              key={item.id || idx}
              style={{
                flexDirection: "row",
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#F8FAFC",
                alignItems: "center",
              }}
            >
              <View style={{ width: "55%" }}>
                <Text style={{ fontWeight: "bold" }}>
                  {item.name || item.model || "Device"}
                </Text>
                {item.serials?.[0] ? (
                  <Text style={{ fontSize: 7, color: "#64748B" }}>
                    Serial: {item.serials.join(", ")}
                  </Text>
                ) : null}
              </View>
              <Text style={{ width: "10%", textAlign: "center" }}>
                {item.quantity || 1}
              </Text>
              <Text style={{ width: "17%", textAlign: "right" }}>
                {pdfFormatCurrency(
                  Number(item.price || item.purchasePrice || 0),
                )}
              </Text>
              <Text style={{ width: "18%", textAlign: "right" }}>
                {pdfFormatCurrency(
                  Number(item.price || item.purchasePrice || 0) *
                    (item.quantity || 1),
                )}
              </Text>
            </View>
          ))}

          <View
            style={{
              marginTop: 18,
              alignSelf: "flex-end",
              width: 220,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Total Paid</Text>
            <Text
              style={{
                backgroundColor: "#D9F99D",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: "bold",
                color: "#14532D",
              }}
            >
              {pdfFormatCurrency(totalVal)}
            </Text>
          </View>

          <View
            style={{
              marginTop: 36,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 8, color: "#64748B" }}>
              Thank you for trading with {shopName}.
            </Text>
            <Text style={{ fontSize: 8, color: "#64748B" }}>
              Powered by {shopName || "iMoScan"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 6. DEFAULT (CLASSIC TEAL) - Keep exact default style
  const s = defaultStyles;
  const itemCount = items?.length || 0;
  const serialCount =
    items?.reduce(
      (count: number, item: any) => count + Number(item?.serials?.length || 0),
      0,
    ) || 0;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brandWrap}>
            <View style={s.brandRow}>
              {shopkeeper?.image?.url ? (
                (() => {
                  const logoStyles = getPdfLogoStyles(
                    shopkeeper.logoSettings,
                    34,
                    34,
                  );
                  return (
                    <View style={logoStyles.container}>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image
                        src={shopkeeper.image.url}
                        style={logoStyles.image}
                      />
                    </View>
                  );
                })()
              ) : (
                <Text style={s.logoFallback}>{shopName}</Text>
              )}
            </View>
            <Text style={s.shopAddress}>
              {shopAddress} | {contactPhone}
            </Text>
          </View>
          <Text style={s.invoiceTitle}>PURCHASE RECEIPT</Text>
        </View>

        <View style={s.metaGrid}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Date </Text>
            <Text style={s.metaText}>
              {receiptDate.toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={s.metaDivider} />
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Items </Text>
            <Text style={s.metaText}>{itemCount}</Text>
          </View>
          <View style={s.metaDivider} />
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Serials </Text>
            <Text style={s.metaText}>{serialCount}</Text>
          </View>
        </View>

        <View style={s.pillRow}>
          <View style={s.customerPill}>
            <Text style={s.pillTitle}>Customer Details</Text>
            <Text style={s.pillName}>{customerName}</Text>
            <Text style={s.pillDetail}>Phone: {customer?.phone || "N/A"}</Text>
          </View>
          <View style={s.shopPill}>
            <Text style={s.pillTitle}>Shop Information</Text>
            <Text style={s.pillName}>{shopName}</Text>
            <Text style={s.pillDetail}>{shopAddress}</Text>
          </View>
        </View>

        <View style={s.tableHeader}>
          <Text style={s.colProduct}>Product Specifications</Text>
          <Text style={s.colQty}>Qty</Text>
          <Text style={s.colPrice}>Purchase Price</Text>
        </View>

        {safeItems?.map((item: any, index: number) => (
          <View key={item.id || index} style={s.tableRow}>
            <View style={s.colProduct}>
              <Text style={s.productText}>
                {item.name || item.model || "Device"}
              </Text>
              <Text style={s.productSub}>
                {[item.brand, item.storage, item.color]
                  .filter(Boolean)
                  .join(" | ") || "Received Device"}
              </Text>
            </View>
            <Text style={s.colQty}>{item.quantity || 1}</Text>
            <Text style={s.colPrice}>
              {pdfFormatCurrency(Number(item.price || item.purchasePrice || 0))}
            </Text>
          </View>
        ))}

        <View style={s.totalBand}>
          <Text style={s.totalBandLabel}>Total Purchase Value</Text>
          <Text style={s.totalBandAmount}>{pdfFormatCurrency(totalVal)}</Text>
        </View>

        <Text style={s.footerNote}>
          Thank you for choosing {shopName}. This purchase receipt is
          electronically verified and recorded.
        </Text>
      </Page>
    </Document>
  );
};

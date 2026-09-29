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
import { getPdfLogoStyles } from "@/lib/logoHelper";

export interface SalesInvoicePdfProps {
  customer?: any;
  items?: any[];
  total?: number | string;
  shopkeeper?: any;
  alreadyPaid?: number | string;
  dueAmount?: number | string;
  paymentType?: string;
  card?: string;
  InvoiceName?: string;
  customerInfoLabel?: string;
  invoiceDate?: Date | string;
  shopkeeperInfoLabel?: string;
  currency?: string;
  templateId?: string;
}

// ----------------------------------------------------
// 1. DEFAULT (CLASSIC TEAL) STYLES
// ----------------------------------------------------
const defaultStyles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#F8FAFC",
    fontSize: 9,
    color: "#334155",
  },
  paper: {
    backgroundColor: "#FFFFFF",
    padding: 26,
    minHeight: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    objectFit: "contain",
    marginRight: 8,
  },
  logoFallback: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#84CC16",
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#155E63",
    letterSpacing: 2,
  },
  shopAddress: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 8,
  },
  metaGrid: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 14,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: 2,
  },
  metaText: {
    fontSize: 9,
    color: "#1e293b",
    fontWeight: "bold",
  },
  metaDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },
  pillRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  customerPill: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
  },
  paymentPill: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
  },
  pillTitle: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#64748b",
    fontWeight: "bold",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  paymentText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 1,
  },
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
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA",
  },
  colProduct: { flex: 4 },
  colId: { flex: 3 },
  colQuantity: { flex: 1, textAlign: "center" },
  colPrice: { flex: 2, textAlign: "right" },
  productText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
  },
  productSub: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 1,
  },
  totalSection: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 230,
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 8.5,
    color: "#475569",
  },
  amountDue: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: "#155E63",
    fontSize: 11,
    fontWeight: "bold",
    color: "#155E63",
  },
  paymentStatus: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 3,
    color: "#84CC16",
  },
  footer: {
    marginTop: 26,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    textAlign: "center",
    fontSize: 7.5,
    color: "#94a3b8",
    lineHeight: 1.4,
  },
});

// ----------------------------------------------------
// 2. CLASSIC EDITORIAL (TRADITIONAL - REF 1) STYLES
// ----------------------------------------------------
const classicEditorialStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontSize: 9.5,
    color: "#1A1A1A",
    fontFamily: "Times-Roman",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
  },
  metaCol: {
    width: "48%",
  },
  invNumber: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 3,
  },
  invDate: {
    fontSize: 10,
    color: "#333333",
  },
  brandCol: {
    width: "48%",
    alignItems: "flex-end",
  },
  shopTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#800020",
    fontFamily: "Times-Bold",
  },
  shopSubtitle: {
    fontSize: 9,
    color: "#444444",
    marginTop: 2,
  },
  ruleLine: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginVertical: 12,
  },
  billToSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  billToLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#800020",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "Times-Bold",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111111",
    marginTop: 3,
    fontFamily: "Times-Bold",
  },
  customerSub: {
    fontSize: 8.5,
    color: "#555555",
    marginTop: 2,
  },
  largeInvoiceTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#800020",
    letterSpacing: 2,
    marginVertical: 14,
    fontFamily: "Times-Bold",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1A1A1A",
    paddingBottom: 6,
    paddingTop: 6,
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Times-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#D1D5DB",
    alignItems: "center",
  },
  colQty: { width: "10%" },
  colDesc: { width: "55%" },
  colUnit: { width: "17%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  productTitle: {
    fontSize: 9.5,
    color: "#111111",
  },
  productImei: {
    fontSize: 7.5,
    color: "#666666",
    marginTop: 2,
  },
  summaryContainer: {
    marginTop: 18,
    alignSelf: "flex-end",
    width: 220,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 9.5,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Times-Bold",
  },
  balanceDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "bold",
    color: "#800020",
    fontFamily: "Times-Bold",
  },
  badgeAndBarcodeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    gap: 16,
  },
  paidBadge: {
    backgroundColor: "#800020",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Times-Bold",
    letterSpacing: 2,
  },
  barcodeBox: {
    alignItems: "center",
  },
  barcodeSim: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: "bold",
  },
  barcodeText: {
    fontSize: 7,
    marginTop: 2,
    color: "#444444",
  },
  footerSection: {
    marginTop: 36,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#999999",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  thankYouText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#800020",
    fontFamily: "Times-Bold",
  },
  poweredBy: {
    fontSize: 8,
    color: "#666666",
  },
});

// ----------------------------------------------------
// 3. WARM MINIMALIST (TRADITIONAL - REF 4) STYLES
// ----------------------------------------------------
const warmMinimalStyles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#FFFDEB",
    fontSize: 9,
    color: "#1C1917",
  },
  frame: {
    borderWidth: 1.5,
    borderColor: "#0F172A",
    padding: 28,
    minHeight: "100%",
  },
  centerHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 3,
    color: "#0F172A",
  },
  subTitle: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#52525B",
    marginTop: 4,
    textTransform: "uppercase",
  },
  metaStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#71717A",
    paddingVertical: 10,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaVal: {
    fontSize: 9,
    color: "#27272A",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#0F172A",
    paddingBottom: 6,
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#D4D4D8",
    alignItems: "center",
  },
  colQty: { width: "10%" },
  colDesc: { width: "55%" },
  colUnit: { width: "17%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  summaryBox: {
    marginTop: 18,
    alignSelf: "flex-end",
    width: 220,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 8.5,
  },
  totalPillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#CCFF00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 4,
  },
  totalPillText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
  },
  paidPill: {
    backgroundColor: "#D4FF32",
    color: "#0F172A",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginTop: 12,
  },
  thankYouBlock: {
    marginTop: 34,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: "#0F172A",
    alignItems: "center",
  },
  thankYouBig: {
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#0F172A",
  },
  poweredBy: {
    marginTop: 8,
    fontSize: 7.5,
    color: "#71717A",
  },
});

// ----------------------------------------------------
// 4. NEO BOLD (MODERN - REF 2) STYLES
// ----------------------------------------------------
const neoBoldStyles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#FDF4F5",
    fontSize: 9,
    color: "#0F172A",
  },
  topBanner: {
    backgroundColor: "#D4FF32",
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },
  bannerSubtitle: {
    fontSize: 7,
    letterSpacing: 1.5,
    color: "#000000",
    fontWeight: "bold",
    marginTop: 2,
  },
  bannerInvoiceText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaBlock: {
    width: "48%",
  },
  metaSmallLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#64748B",
    textTransform: "uppercase",
  },
  metaBigText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 2,
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748B",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
  },
  colDesc: { width: "55%" },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "17%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  totalHighlightCard: {
    backgroundColor: "#D4FF32",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalBigLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: 0.5,
  },
  totalBigAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000000",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  statusBadgeOrange: {
    backgroundColor: "#FDBA74",
    color: "#7C2D12",
    fontWeight: "bold",
    fontSize: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    letterSpacing: 1,
  },
  statusBadgeGreen: {
    backgroundColor: "#86EFAC",
    color: "#14532D",
    fontWeight: "bold",
    fontSize: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    letterSpacing: 1,
  },
  bottomBanner: {
    backgroundColor: "#D4FF32",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  bottomBannerText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
  },
});

// ----------------------------------------------------
// 5. MODERN RETAIL (MODERN - REF 3) STYLES
// ----------------------------------------------------
const modernRetailStyles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#FFFFFF",
    fontSize: 9,
    color: "#1E293B",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleInvoice: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0F172A",
  },
  invNumber: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  brandRight: {
    alignItems: "flex-end",
  },
  brandName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  brandTagline: {
    fontSize: 7.5,
    letterSpacing: 1.5,
    color: "#64748B",
    marginTop: 2,
  },
  billDateStrip: {
    marginBottom: 16,
  },
  billLine: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
  },
  dateLine: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#8EA085",
    color: "#0F172A",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 3,
    fontSize: 8.5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  colDesc: { width: "55%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "17%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  middleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 18,
  },
  paidBadgeCheck: {
    backgroundColor: "#22C55E",
    color: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    alignSelf: "flex-start",
  },
  summaryBlock: {
    width: 200,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 8.5,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#CBD5E1",
    fontSize: 10,
    fontWeight: "bold",
  },
  promoBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: 6,
    padding: 14,
    marginTop: 26,
  },
  promoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#166534",
  },
  promoSub: {
    fontSize: 8.5,
    color: "#15803D",
    marginTop: 2,
  },
});

// ----------------------------------------------------
// 6. NORDIC SLATE (MODERN - REF 5) STYLES
// ----------------------------------------------------
const nordicStyles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#FFFFFF",
    fontSize: 9,
    color: "#0F172A",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  invNumSmall: {
    fontSize: 9,
    color: "#64748B",
  },
  titleBillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 16,
  },
  billWrap: {
    flex: 1,
  },
  billLabel: {
    fontSize: 8,
    color: "#64748B",
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  customerPill: {
    backgroundColor: "#D9F99D",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 3,
  },
  customerPillText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1A2E05",
  },
  hugeInvoice: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: 2,
  },
  calloutGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalBigCallout: {
    flex: 1,
  },
  totalCalloutLabel: {
    fontSize: 8.5,
    color: "#64748B",
  },
  totalCalloutAmount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 2,
  },
  datesCallout: {
    alignItems: "flex-end",
  },
  dateLine: {
    fontSize: 8.5,
    color: "#334155",
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#475569",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
    alignItems: "center",
  },
  colDesc: { width: "55%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "17%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  summaryArea: {
    alignSelf: "flex-end",
    width: 220,
    marginTop: 16,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  totalGreenPill: {
    backgroundColor: "#D9F99D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
    color: "#14532D",
  },
  footerStrip: {
    marginTop: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#64748B",
  },
});

// ----------------------------------------------------
// MAIN TEMPLATE RENDERER COMPONENT
// ----------------------------------------------------
export const SalesInvoicePdfDocument: React.FC<SalesInvoicePdfProps> = ({
  customer,
  items,
  total,
  shopkeeper,
  alreadyPaid,
  dueAmount,
  paymentType,
  card,
  InvoiceName,
  customerInfoLabel,
  invoiceDate,
  shopkeeperInfoLabel,
  currency = "USD",
  templateId = "default",
}) => {
  const pdfFormatCurrency = (value: number) => {
    const code = (currency || "USD").toUpperCase();
    const formattedNum = Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    switch (code) {
      case "USD":
        return `$${formattedNum}`;
      case "GBP":
        return `£${formattedNum}`;
      case "EUR":
        return `EUR ${formattedNum}`;
      case "BDT":
        return `BDT ${formattedNum}`;
      case "INR":
        return `INR ${formattedNum}`;
      case "PKR":
        return `PKR ${formattedNum}`;
      case "AED":
        return `AED ${formattedNum}`;
      case "SAR":
        return `SAR ${formattedNum}`;
      case "AUD":
        return `A$${formattedNum}`;
      case "CAD":
        return `C$${formattedNum}`;
      default:
        return `${code} ${formattedNum}`;
    }
  };

  const sanitizeText = (text: any): string => {
    if (!text) return "";
    return String(text)
      .replace(/[•·▪►]/g, "|")
      .replace(/[–—]/g, "-")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");
  };

  const safeItems = items?.map((item: any) => ({
    ...item,
    name: sanitizeText(item.name),
    imeiNumber: sanitizeText(item.imeiNumber),
  }));

  const date = invoiceDate ? new Date(invoiceDate) : new Date();
  const balance = Number(dueAmount || 0);
  const paidVal = Number(alreadyPaid || 0);
  const totalVal = Number(total || 0);
  const isPaid = balance <= 0;
  const customerName = sanitizeText(
    `${customer?.firstName || "Valued"} ${customer?.lastName || "Customer"}`.trim(),
  );
  const invNumberStr = `MKD-${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, "0")}`;

  // 1. CLASSIC EDITORIAL (Traditional - Ref 1)
  if (templateId === "classic-editorial") {
    const s = classicEditorialStyles;
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <View style={s.headerRow}>
            <View style={s.metaCol}>
              <Text style={s.invNumber}>Invoice no. {invNumberStr}</Text>
              <Text style={s.invDate}>
                {date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={s.brandCol}>
              <Text style={s.shopTitle}>
                {shopkeeper?.shopName || "Mobile Kit"}
              </Text>
              <Text style={s.shopSubtitle}>
                {shopkeeper?.shopAddress || "Distribution & Services"}
              </Text>
            </View>
          </View>

          <View style={s.ruleLine} />

          <View style={s.billToSection}>
            <Text style={s.billToLabel}>BILL TO</Text>
            <Text style={s.customerName}>{customerName}</Text>
            {customer?.phone && (
              <Text style={s.customerSub}>Phone: {customer.phone}</Text>
            )}
            {customer?.email && (
              <Text style={s.customerSub}>Email: {customer.email}</Text>
            )}
          </View>

          <Text style={s.largeInvoiceTitle}>{InvoiceName || "INVOICE"}</Text>

          <View style={s.tableHeader}>
            <Text style={s.colQty}>Qty</Text>
            <Text style={s.colDesc}>Item description</Text>
            <Text style={s.colUnit}>Unit price</Text>
            <Text style={s.colTotal}>Total</Text>
          </View>

          {safeItems?.map((item: any, idx: number) => (
            <View key={item.id || idx} style={s.tableRow}>
              <Text style={s.colQty}>{item.quantity || 1}</Text>
              <View style={s.colDesc}>
                <Text style={s.productTitle}>{item.name}</Text>
                {item.imeiNumber ? (
                  <Text style={s.productImei}>IMEI: {item.imeiNumber}</Text>
                ) : null}
              </View>
              <Text style={s.colUnit}>
                {pdfFormatCurrency(Number(item.price || 0))}
              </Text>
              <Text style={s.colTotal}>
                {pdfFormatCurrency(
                  Number(item.price || 0) * (item.quantity || 1),
                )}
              </Text>
            </View>
          ))}

          <View style={s.summaryContainer}>
            <View style={s.summaryRow}>
              <Text>Subtotal</Text>
              <Text>{pdfFormatCurrency(totalVal)}</Text>
            </View>
            <View style={s.summaryTotalRow}>
              <Text>Total</Text>
              <Text>{pdfFormatCurrency(totalVal)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text>Paid</Text>
              <Text>{pdfFormatCurrency(paidVal)}</Text>
            </View>
            <View style={s.balanceDueRow}>
              <Text>Balance due</Text>
              <Text>{pdfFormatCurrency(balance)}</Text>
            </View>
          </View>

          <View style={s.badgeAndBarcodeRow}>
            <Text style={s.paidBadge}>{isPaid ? "PAID" : "DUE"}</Text>
            <View style={s.barcodeBox}>
              <Text style={s.barcodeSim}>||| | |||| | ||||| | |||</Text>
              <Text style={s.barcodeText}>{invNumberStr}</Text>
            </View>
          </View>

          <View style={s.footerSection}>
            <View>
              <Text style={{ fontSize: 8, color: "#666", marginBottom: 2 }}>
                Payment: {paymentType ? paymentType.toUpperCase() : "CARD"}
              </Text>
              <Text style={s.thankYouText}>Thank you</Text>
            </View>
            <Text style={s.poweredBy}>
              Powered by {shopkeeper?.shopName || "iMoScan"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 2. WARM MINIMALIST (Traditional - Ref 4)
  if (templateId === "warm-minimal") {
    const s = warmMinimalStyles;
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <View style={s.frame}>
            <View style={s.centerHeader}>
              <Text style={s.brandTitle}>
                {(shopkeeper?.shopName || "MOBILE KIT").toUpperCase()}
              </Text>
              <Text style={s.subTitle}>
                {InvoiceName || "CUSTOMER INVOICE"}
              </Text>
            </View>

            <View style={s.metaStrip}>
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>DATE ISSUED</Text>
                <Text style={s.metaVal}>
                  {date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>INVOICE #</Text>
                <Text style={s.metaVal}>{invNumberStr}</Text>
              </View>
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>ISSUED TO</Text>
                <Text style={s.metaVal}>{customerName}</Text>
              </View>
            </View>

            <View style={s.tableHeader}>
              <Text style={s.colQty}>QTY</Text>
              <Text style={s.colDesc}>ITEM / DEVICE</Text>
              <Text style={s.colUnit}>UNIT PRICE</Text>
              <Text style={s.colTotal}>TOTAL</Text>
            </View>

            {safeItems?.map((item: any, idx: number) => (
              <View key={item.id || idx} style={s.tableRow}>
                <Text style={s.colQty}>{item.quantity || 1}</Text>
                <View style={s.colDesc}>
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  {item.imeiNumber ? (
                    <Text style={{ fontSize: 7, color: "#71717A" }}>
                      IMEI: {item.imeiNumber}
                    </Text>
                  ) : null}
                </View>
                <Text style={s.colUnit}>
                  {pdfFormatCurrency(Number(item.price || 0))}
                </Text>
                <Text style={s.colTotal}>
                  {pdfFormatCurrency(
                    Number(item.price || 0) * (item.quantity || 1),
                  )}
                </Text>
              </View>
            ))}

            <View style={s.summaryBox}>
              <View style={s.summaryRow}>
                <Text>Subtotal</Text>
                <Text>{pdfFormatCurrency(totalVal)}</Text>
              </View>
              <View style={s.totalPillRow}>
                <Text style={s.totalPillText}>Total</Text>
                <Text style={s.totalPillText}>
                  {pdfFormatCurrency(totalVal)}
                </Text>
              </View>
              <View style={s.summaryRow}>
                <Text>Paid</Text>
                <Text>{pdfFormatCurrency(paidVal)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text>Balance due</Text>
                <Text>{pdfFormatCurrency(balance)}</Text>
              </View>
            </View>

            <Text style={s.paidPill}>{isPaid ? "PAID" : "PART PAID"}</Text>

            <View style={s.thankYouBlock}>
              <Text style={s.thankYouBig}>THANK YOU!</Text>
              <Text style={s.poweredBy}>
                Powered by {shopkeeper?.shopName || "iMoScan"}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // 3. NEO BOLD (Modern - Ref 2)
  if (templateId === "neo-bold") {
    const s = neoBoldStyles;
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <View style={s.topBanner}>
            <View>
              <Text style={s.bannerTitle}>
                {shopkeeper?.shopName || "Mobile Kit"}
              </Text>
              <Text style={s.bannerSubtitle}>
                PHONES | ACCESSORIES | TECH SOLUTIONS
              </Text>
            </View>
            <Text style={s.bannerInvoiceText}>{InvoiceName || "INVOICE"}</Text>
          </View>

          <View style={s.card}>
            <View style={s.cardGrid}>
              <View style={s.metaBlock}>
                <Text style={s.metaSmallLabel}>INVOICE #</Text>
                <Text style={s.metaBigText}>{invNumberStr}</Text>
              </View>
              <View style={s.metaBlock}>
                <Text style={s.metaSmallLabel}>DATE</Text>
                <Text style={s.metaBigText}>
                  {date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={s.metaSmallLabel}>CUSTOMER</Text>
              <Text style={s.metaBigText}>{customerName}</Text>
            </View>
          </View>

          <View style={s.tableCard}>
            <View style={s.tableHeader}>
              <Text style={s.colDesc}>DESCRIPTION</Text>
              <Text style={s.colQty}>QTY</Text>
              <Text style={s.colUnit}>UNIT</Text>
              <Text style={s.colTotal}>TOTAL</Text>
            </View>

            {safeItems?.map((item: any, idx: number) => (
              <View key={item.id || idx} style={s.tableRow}>
                <View style={s.colDesc}>
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  {item.imeiNumber ? (
                    <Text style={{ fontSize: 7, color: "#64748B" }}>
                      Serial: {item.imeiNumber}
                    </Text>
                  ) : null}
                </View>
                <Text style={s.colQty}>{item.quantity || 1}</Text>
                <Text style={s.colUnit}>
                  {pdfFormatCurrency(Number(item.price || 0))}
                </Text>
                <Text style={s.colTotal}>
                  {pdfFormatCurrency(
                    Number(item.price || 0) * (item.quantity || 1),
                  )}
                </Text>
              </View>
            ))}
          </View>

          <View style={s.totalHighlightCard}>
            <View style={s.totalRow}>
              <Text style={s.totalBigLabel}>TOTAL AMOUNT</Text>
              <Text style={s.totalBigAmount}>
                {pdfFormatCurrency(totalVal)}
              </Text>
            </View>
          </View>

          <View style={s.statusCard}>
            <View>
              <Text style={s.metaSmallLabel}>PAYMENT STATUS</Text>
              <Text style={isPaid ? s.statusBadgeGreen : s.statusBadgeOrange}>
                {isPaid ? "FULLY PAID" : "PART PAID"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 8, color: "#64748B" }}>
                Paid: {pdfFormatCurrency(paidVal)}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                Balance Due: {pdfFormatCurrency(balance)}
              </Text>
            </View>
          </View>

          <View style={s.bottomBanner}>
            <Text style={s.bottomBannerText}>
              Thank you for shopping with us.
            </Text>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>
              Powered by {shopkeeper?.shopName || "iMoScan"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 4. MODERN RETAIL (Modern - Ref 3)
  if (templateId === "modern-retail") {
    const s = modernRetailStyles;
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <View style={s.topHeader}>
            <View>
              <Text style={s.titleInvoice}>Invoice</Text>
              <Text style={s.invNumber}>No. {invNumberStr}</Text>
            </View>
            <View style={s.brandRight}>
              <Text style={s.brandName}>
                {shopkeeper?.shopName || "Mobile Kit"}
              </Text>
              <Text style={s.brandTagline}>GADGETS | SALES | SUPPORT</Text>
            </View>
          </View>

          <View style={s.billDateStrip}>
            <Text style={s.billLine}>Invoice to: {customerName}</Text>
            <Text style={s.dateLine}>
              Date:{" "}
              {date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>

          <View style={s.tableHeader}>
            <Text style={s.colDesc}>Description</Text>
            <Text style={s.colQty}>Qty</Text>
            <Text style={s.colPrice}>Price</Text>
            <Text style={s.colTotal}>Total</Text>
          </View>

          {safeItems?.map((item: any, idx: number) => (
            <View key={item.id || idx} style={s.tableRow}>
              <View style={s.colDesc}>
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                {item.imeiNumber ? (
                  <Text style={{ fontSize: 7.5, color: "#64748B" }}>
                    IMEI: {item.imeiNumber}
                  </Text>
                ) : null}
              </View>
              <Text style={s.colQty}>{item.quantity || 1}</Text>
              <Text style={s.colPrice}>
                {pdfFormatCurrency(Number(item.price || 0))}
              </Text>
              <Text style={s.colTotal}>
                {pdfFormatCurrency(
                  Number(item.price || 0) * (item.quantity || 1),
                )}
              </Text>
            </View>
          ))}

          <View style={s.middleSection}>
            <View>
              <Text
                style={{ fontSize: 8.5, color: "#64748B", marginBottom: 4 }}
              >
                Payment: {paymentType ? paymentType.toUpperCase() : "CARD"}
              </Text>
              <Text style={s.paidBadgeCheck}>
                {isPaid ? "PAID" : "BALANCE DUE"}
              </Text>
            </View>
            <View style={s.summaryBlock}>
              <View style={s.summaryRow}>
                <Text>Subtotal:</Text>
                <Text>{pdfFormatCurrency(totalVal)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text>Total:</Text>
                <Text style={{ fontWeight: "bold" }}>
                  {pdfFormatCurrency(totalVal)}
                </Text>
              </View>
              <View style={s.summaryRow}>
                <Text>Paid:</Text>
                <Text>{pdfFormatCurrency(paidVal)}</Text>
              </View>
              <View style={s.balanceRow}>
                <Text>Balance due:</Text>
                <Text>{pdfFormatCurrency(balance)}</Text>
              </View>
            </View>
          </View>

          <View style={s.promoBox}>
            <Text style={s.promoTitle}>
              We buy your phone for cash or trade-in towards a new one.
            </Text>
            <Text style={s.promoSub}>
              Ask us for a free instant quote at our counter.
            </Text>
          </View>

          <View style={{ marginTop: 24, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8, color: "#94A3B8" }}>
              Powered by {shopkeeper?.shopName || "iMoScan"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 5. NORDIC SLATE (Modern - Ref 5)
  if (templateId === "nordic-modern") {
    const s = nordicStyles;
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <View style={s.topBar}>
            <View style={s.brandWrap}>
              <Text style={s.brandText}>
                {shopkeeper?.shopName || "Mobile Kit"}
              </Text>
            </View>
            <Text style={s.invNumSmall}>Invoice no. {invNumberStr}</Text>
          </View>

          <View style={s.titleBillRow}>
            <View style={s.billWrap}>
              <Text style={s.billLabel}>BILL TO:</Text>
              <View style={s.customerPill}>
                <Text style={s.customerPillText}>{customerName}</Text>
              </View>
            </View>
            <Text style={s.hugeInvoice}>{InvoiceName || "INVOICE"}</Text>
          </View>

          <View style={s.calloutGrid}>
            <View style={s.totalBigCallout}>
              <Text style={s.totalCalloutLabel}>Invoice total</Text>
              <Text style={s.totalCalloutAmount}>
                {pdfFormatCurrency(totalVal)}
              </Text>
            </View>
            <View style={s.datesCallout}>
              <Text style={s.dateLine}>
                Issue date:{" "}
                {date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Text style={s.dateLine}>
                Payment due:{" "}
                {isPaid
                  ? "Completed"
                  : date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
              </Text>
            </View>
          </View>

          <View style={s.tableHeader}>
            <Text style={s.colDesc}>Item</Text>
            <Text style={s.colQty}>Qty</Text>
            <Text style={s.colPrice}>Price</Text>
            <Text style={s.colTotal}>Total</Text>
          </View>

          {safeItems?.map((item: any, idx: number) => (
            <View key={item.id || idx} style={s.tableRow}>
              <View style={s.colDesc}>
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                {item.imeiNumber ? (
                  <Text style={{ fontSize: 7, color: "#64748B" }}>
                    IMEI: {item.imeiNumber}
                  </Text>
                ) : null}
              </View>
              <Text style={s.colQty}>{item.quantity || 1}</Text>
              <Text style={s.colPrice}>
                {pdfFormatCurrency(Number(item.price || 0))}
              </Text>
              <Text style={s.colTotal}>
                {pdfFormatCurrency(
                  Number(item.price || 0) * (item.quantity || 1),
                )}
              </Text>
            </View>
          ))}

          <View style={s.summaryArea}>
            <View style={s.summaryTotalRow}>
              <Text style={{ fontWeight: "bold" }}>Total</Text>
              <Text style={s.totalGreenPill}>
                {pdfFormatCurrency(totalVal)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 3,
              }}
            >
              <Text>Paid</Text>
              <Text>{pdfFormatCurrency(paidVal)}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Balance due</Text>
              <Text style={{ fontWeight: "bold" }}>
                {pdfFormatCurrency(balance)}
              </Text>
            </View>
          </View>

          <View style={s.footerStrip}>
            <Text style={s.footerText}>Thank you for shopping with us.</Text>
            <Text style={s.footerText}>
              Powered by {shopkeeper?.shopName || "iMoScan"}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // 6. DEFAULT (CLASSIC TEAL) - Keep exact default style
  const pdfStyles = defaultStyles;
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.paper}>
          <View style={pdfStyles.header}>
            <View>
              <View style={pdfStyles.brandRow}>
                {shopkeeper?.image?.url &&
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
                  })()}
                <Text style={pdfStyles.logoFallback}>
                  {shopkeeper?.shopName || "STORE"}
                </Text>
              </View>
              <Text style={pdfStyles.shopAddress}>
                {shopkeeper?.shopAddress || "N/A"} |{" "}
                {shopkeeper?.phone || "N/A"}
              </Text>
            </View>
            <Text style={pdfStyles.invoiceTitle}>
              {InvoiceName || "INVOICE"}
            </Text>
          </View>

          <View style={pdfStyles.metaGrid}>
            <View style={pdfStyles.metaBlock}>
              <Text style={pdfStyles.metaLabel}>Invoice Date</Text>
              <Text style={pdfStyles.metaText}>
                {date.toLocaleDateString("en-GB")} |{" "}
                {date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
            <View style={pdfStyles.metaDivider} />
            <View style={pdfStyles.metaBlock}>
              <Text style={pdfStyles.metaLabel}>
                {shopkeeperInfoLabel || "Store Information"}
              </Text>
              <Text style={pdfStyles.metaText}>
                {shopkeeper?.email || "N/A"}
              </Text>
            </View>
          </View>

          <View style={pdfStyles.pillRow}>
            <View style={pdfStyles.customerPill}>
              <Text style={pdfStyles.pillTitle}>
                {customerInfoLabel || "Customer Details"}
              </Text>
              <Text style={pdfStyles.customerName}>{customerName}</Text>
              <Text style={pdfStyles.detailText}>
                Phone: {customer?.phone || "N/A"}
              </Text>
              <Text style={pdfStyles.detailText}>
                Email: {customer?.email || "N/A"}
              </Text>
              <Text style={pdfStyles.detailText}>
                Address: {customer?.address || "N/A"}
              </Text>
            </View>
            <View style={pdfStyles.paymentPill}>
              <Text style={pdfStyles.pillTitle}>Payment Details</Text>
              <Text style={pdfStyles.paymentText}>
                Method: {paymentType ? paymentType.toUpperCase() : "N/A"}
              </Text>
              <Text style={pdfStyles.detailText}>
                {balance > 0 ? "Status: Payment due" : "Status: Fully paid"}
              </Text>
              {paymentType === "card" && card ? (
                <Text style={pdfStyles.detailText}>Card: **** {card}</Text>
              ) : null}
            </View>
          </View>

          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.colProduct}>Item Description</Text>
            <Text style={pdfStyles.colId}>IMEI / Model</Text>
            <Text style={pdfStyles.colQuantity}>Qty</Text>
            <Text style={pdfStyles.colPrice}>Price</Text>
          </View>
          {safeItems?.map((item: any, index: number) => (
            <View
              key={item.id || index}
              style={
                index % 2 === 1
                  ? [pdfStyles.tableRow, pdfStyles.tableRowAlt]
                  : pdfStyles.tableRow
              }
            >
              <View style={pdfStyles.colProduct}>
                <Text style={pdfStyles.productText}>{item.name}</Text>
                <Text style={pdfStyles.productSub}>
                  {[item.storage, item.color, item.condition]
                    .filter(Boolean)
                    .join(" | ") || "Inventory item"}
                </Text>
              </View>
              <Text style={pdfStyles.colId}>{item.imeiNumber || "N/A"}</Text>
              <Text style={pdfStyles.colQuantity}>{item.quantity || 1}</Text>
              <Text style={pdfStyles.colPrice}>
                {pdfFormatCurrency(Number(item.price || 0))}
              </Text>
            </View>
          ))}

          <View style={pdfStyles.totalSection}>
            <View style={pdfStyles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>{pdfFormatCurrency(totalVal)}</Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text>Amount Paid</Text>
              <Text>{pdfFormatCurrency(paidVal)}</Text>
            </View>
            <View style={pdfStyles.amountDue}>
              <Text>Balance Due</Text>
              <Text>{pdfFormatCurrency(balance)}</Text>
            </View>
            <Text style={pdfStyles.paymentStatus}>
              {balance > 0 ? "PAYMENT DUE" : "FULLY PAID"}
            </Text>
          </View>

          <Text style={pdfStyles.footer}>
            Thank you for choosing {shopkeeper?.shopName || "our store"}. Please
            keep this invoice for your records. {"\n"}
            This is an electronically generated invoice; no signature is
            required.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontSize: 10,
    color: "#334155",
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#84CC16",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    alignItems: "center",
    borderBottom: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
  },
  logo: {
    width: 150,
    height: 40,
    objectFit: "contain",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "right",
    letterSpacing: 2,
  },
  invoiceSub: {
    fontSize: 8,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
    textTransform: "uppercase",
  },
  infoContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 40,
  },
  infoBox: {
    flex: 1,
    border: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  infoLabel: {
    backgroundColor: "#84CC16",
    color: "white",
    padding: 10,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoLabelDark: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 10,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoContent: {
    padding: 15,
    lineHeight: 1.6,
  },
  boldText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  regularText: {
    fontSize: 9,
    color: "#64748b",
  },

  // Table Styles
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: 2,
    borderBottomColor: "#84CC16",
    color: "#475569",
    fontWeight: "bold",
    padding: 12,
    textTransform: "uppercase",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 12,
    alignItems: "center",
  },
  colProduct: {
    width: "50%",
  },
  colQty: {
    width: "15%",
    textAlign: "center",
  },
  colPrice: {
    width: "15%",
    textAlign: "right",
  },
  colTotal: {
    width: "20%",
    textAlign: "right",
  },

  productTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  productSub: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 2,
  },

  totalSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 20,
    borderRadius: 15,
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: 1,
    borderTopColor: "#334155",
  },
  grandTotalLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#ffffff",
    fontWeight: "bold",
  },
  grandTotalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#84CC16",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    color: "#94a3b8",
    fontSize: 8,
    borderTop: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerContent: {
    flex: 1,
    paddingRight: 20,
  },
  thankYou: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "bold",
    marginBottom: 5,
  },
  reviewBlock: {
    alignItems: "center",
    width: 96,
  },
  reviewQr: {
    width: 84,
    height: 84,
  },
  reviewLabel: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
});

export interface SalesInvoicePDFProps {
  data: {
    customerName: string;
    customerEmail?: string;
    customerAddress?: string;
    itemName: string;
    brand?: string;
    color?: string;
    storage?: string;
    salePrice: number;
    saleQuantity: number;
    saleMethod: string;
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    invoiceNumber?: string;
    currency?: string;
    reviewQrCodeDataUrl?: string | null;
  };
}

const SalesInvoicePDF: React.FC<SalesInvoicePDFProps> = ({ data }) => {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const subtotal = data.salePrice * data.saleQuantity;
  const formatPdfCurrency = (value: number) =>
    baseFormatCurrency(value, data.currency || "USD");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />

        {/* Header Section */}
        <View style={styles.topSection}>
          <View>
            <Image src="/images/logo.png" style={styles.logo} />
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceSub}>Date: {date}</Text>
          </View>
        </View>

        {/* Information Grid */}
        <View style={styles.infoContainer}>
          {/* Bill To */}
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <View style={styles.infoContent}>
              <Text style={styles.boldText}>
                {data.customerName || "Walk-in Customer"}
              </Text>
              {data.customerEmail && (
                <Text style={styles.regularText}>{data.customerEmail}</Text>
              )}
              {data.customerAddress && (
                <Text style={styles.regularText}>{data.customerAddress}</Text>
              )}
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.infoBox}>
            <Text style={styles.infoLabelDark}>Transaction Info</Text>
            <View style={styles.infoContent}>
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={[styles.regularText, { width: 80 }]}>Method:</Text>
                <Text
                  style={[
                    styles.regularText,
                    { color: "#1e293b", fontWeight: "bold" },
                  ]}
                >
                  {data.saleMethod}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={[styles.regularText, { width: 80 }]}>Status:</Text>
                <Text
                  style={[
                    styles.regularText,
                    { color: "#059669", fontWeight: "bold" },
                  ]}
                >
                  PAID
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text style={[styles.regularText, { width: 80 }]}>
                  Invoice No:
                </Text>
                <Text style={[styles.regularText, { color: "#1e293b" }]}>
                  {data.invoiceNumber || "#INV-00000"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Product Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.colProduct}>Product Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colPrice}>Unit Price</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.colProduct}>
            <Text style={styles.productTitle}>{data.itemName}</Text>
            <Text style={styles.productSub}>
              {[data.brand, data.color, data.storage]
                .filter(Boolean)
                .join(" | ")}
            </Text>
          </View>
          <Text style={styles.colQty}>{data.saleQuantity}</Text>
          <Text style={styles.colPrice}>
            {formatPdfCurrency(data.salePrice)}
          </Text>
          <Text style={styles.colTotal}>{formatPdfCurrency(subtotal)}</Text>
        </View>

        {/* Total Calculation */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatPdfCurrency(subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (0%)</Text>
              <Text style={styles.totalValue}>{formatPdfCurrency(0)}</Text>
            </View>
            <Image src="/images/logo.png" style={styles.logo} />
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalAmount}>
                {formatPdfCurrency(subtotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.thankYou}>Thank you for your business!</Text>
            <Text style={styles.regularText}>
              Please keep this invoice for your records. If you have any
              questions, feel free to contact us.
            </Text>
            <Text style={[styles.regularText, { marginTop: 10 }]}>
              Generated by Majid Inventory System
            </Text>
          </View>
          {data.reviewQrCodeDataUrl ? (
            <View style={styles.reviewBlock}>
              <Image src={data.reviewQrCodeDataUrl} style={styles.reviewQr} />
              <Text style={styles.reviewLabel}>Scan To Review</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
};

export default SalesInvoicePDF;

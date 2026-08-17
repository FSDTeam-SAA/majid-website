/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { CartItem, Shopkeeper } from "../types";
import { formatCurrency as baseFormatCurrency } from "@/lib/currency";
import { getPdfLogoStyles } from "@/lib/logoHelper";

const colors = {
  teal: "#155E63",
  tealDark: "#164E55",
  orange: "#F97316",
  mint: "#BFE3DD",
  mintLight: "#EAF5F3",
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#F7F3F0",
    fontSize: 9,
    color: colors.slate700,
  },
  paper: {
    backgroundColor: colors.white,
    padding: 26,
    minHeight: "100%",
    borderRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 92,
    height: 28,
    objectFit: "contain",
  },
  brandFallback: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#75A71E",
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#2F9BEF",
    color: colors.white,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
  shopAddress: {
    marginTop: 4,
    color: colors.slate500,
    fontSize: 8,
  },
  invoiceTitle: {
    fontSize: 24,
    color: colors.teal,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  metaGrid: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 14,
  },
  metaBlock: {
    flex: 1,
    gap: 4,
  },
  metaDivider: {
    width: 1,
    backgroundColor: colors.slate200,
    marginHorizontal: 18,
  },
  metaLabel: {
    color: colors.orange,
    fontWeight: "bold",
  },
  metaText: {
    color: colors.slate900,
    fontWeight: "bold",
  },
  pillRow: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  customerPill: {
    width: "44%",
    backgroundColor: colors.orange,
    color: colors.white,
    paddingVertical: 7,
    paddingHorizontal: 12,
    fontWeight: "bold",
  },
  paymentPill: {
    flex: 1,
    backgroundColor: "#C9D3D0",
    color: colors.tealDark,
    paddingVertical: 7,
    paddingHorizontal: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.teal,
    color: colors.white,
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    minHeight: 54,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DDE7E4",
  },
  rowAlt: {
    backgroundColor: colors.mintLight,
  },
  colImage: {
    width: "15%",
  },
  colItem: {
    width: "34%",
    paddingRight: 6,
  },
  colStatus: {
    width: "14%",
  },
  colCondition: {
    width: "17%",
  },
  colQty: {
    width: "8%",
    textAlign: "center",
  },
  colPrice: {
    width: "12%",
    textAlign: "right",
  },
  productImage: {
    width: 38,
    height: 38,
    objectFit: "cover",
    borderRadius: 4,
  },
  productName: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.slate900,
  },
  muted: {
    fontSize: 7,
    color: colors.slate500,
    marginTop: 2,
  },
  statusClean: {
    fontSize: 8,
    color: "#0F766E",
    fontWeight: "bold",
  },
  totals: {
    marginLeft: "55%",
    marginTop: 0,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  amountDue: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.orange,
    color: colors.white,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 18,
    gap: 18,
  },
  qr: {
    width: 88,
    height: 88,
  },
  terms: {
    flex: 1,
  },
  termsTitle: {
    color: colors.teal,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contactBar: {
    marginTop: 16,
    backgroundColor: colors.mint,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.tealDark,
    fontSize: 8,
  },
});

export interface CartInvoicePDFProps {
  cartItems: CartItem[];
  invoiceNumber: string;
  qrCodeDataUrl?: string;
  reviewQrCodeDataUrl?: string | null;
  shopkeeper?: Shopkeeper;
  editedPrices?: Record<string, number>;
}

export default function CartInvoicePDF({
  cartItems,
  invoiceNumber,
  qrCodeDataUrl,
  reviewQrCodeDataUrl,
  shopkeeper,
  editedPrices = {},
}: CartInvoicePDFProps) {
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(invoiceDate.getDate() + 7);

  const originalSubtotal = cartItems.reduce(
    (sum, cartItem) =>
      sum + (cartItem.itemId?.expectedPrice || 0) * cartItem.quantity,
    0,
  );

  const subtotal = cartItems.reduce((sum, cartItem) => {
    const originalPrice = cartItem.itemId?.expectedPrice || 0;
    const price =
      editedPrices[cartItem._id] !== undefined
        ? editedPrices[cartItem._id]
        : originalPrice;
    return sum + price * cartItem.quantity;
  }, 0);

  const totalDiscount =
    originalSubtotal > subtotal ? originalSubtotal - subtotal : 0;
  const amountDue = subtotal;
  const shopName = shopkeeper?.shopName || "imoscan";
  const contactEmail = shopkeeper?.email || "info@companyname.com";
  const contactPhone = shopkeeper?.phone || "+1 234 567 8000";
  const currencyCode = shopkeeper?.currency || "USD";
  const formatCurrency = (value: number) =>
    baseFormatCurrency(value, currencyCode);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.paper}>
          <View style={styles.header}>
            <View>
              <View style={styles.brandRow}>
                {shopkeeper?.image?.url ? (
                  (() => {
                    const logoStyles = getPdfLogoStyles(
                      shopkeeper.logoSettings,
                      34,
                      34,
                    );
                    return (
                      <View style={logoStyles.container}>
                        <Image
                          src={shopkeeper.image.url}
                          style={logoStyles.image}
                        />
                      </View>
                    );
                  })()
                ) : (
                  <Image src="/images/logo.png" style={styles.logo} />
                )}
                <Text style={styles.checkDot}>✓</Text>
              </View>
              <Text style={styles.shopAddress}>
                {shopName} • {contactPhone}
              </Text>
            </View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaBlock}>
              <Text>
                <Text style={styles.metaLabel}>Invoice # </Text>
                <Text style={styles.metaText}>{invoiceNumber}</Text>
              </Text>
              <Text>
                Date:{" "}
                <Text style={styles.metaText}>
                  {invoiceDate.toLocaleDateString("en-GB")}
                </Text>
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaBlock}>
              <Text>Date:</Text>
              <Text style={styles.metaText}>
                {invoiceDate.toLocaleDateString("en-GB")}
              </Text>
            </View>
            <View style={styles.metaBlock}>
              <Text>Due Date:</Text>
              <Text style={styles.metaText}>
                {dueDate.toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>

          <View style={styles.pillRow}>
            <Text style={styles.customerPill}>Customer Details</Text>
            <Text style={styles.paymentPill}>
              Payment Method: Bank Transfer
            </Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.colImage}>IMEI/SN</Text>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colStatus}>Status</Text>
            <Text style={styles.colCondition}>Condition</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
          </View>

          {cartItems.map((cartItem, index) => {
            const item = cartItem.itemId;
            const originalPrice = item?.expectedPrice || 0;
            const price =
              editedPrices[cartItem._id] !== undefined
                ? editedPrices[cartItem._id]
                : originalPrice;
            const lineTotal = price * cartItem.quantity;
            const originalLineTotal = originalPrice * cartItem.quantity;
            const isDiscounted = originalPrice > price;

            return (
              <View
                key={cartItem._id}
                style={
                  index % 2 === 1 ? [styles.row, styles.rowAlt] : styles.row
                }
              >
                <View style={styles.colImage}>
                  {item?.image?.url ? (
                    <Image src={item.image.url} style={styles.productImage} />
                  ) : (
                    <Text style={styles.muted}>No Image</Text>
                  )}
                  <Text style={styles.muted}>
                    {item?.imeiNumber || item?.sku || "N/A"}
                  </Text>
                </View>
                <View style={styles.colItem}>
                  <Text style={styles.productName}>
                    {item?.itemName || "Unknown Item"}
                  </Text>
                  <Text style={styles.muted}>
                    IMEI: {item?.imeiNumber || "N/A"}
                  </Text>
                </View>
                <View style={styles.colStatus}>
                  <Text style={styles.statusClean}>✓ Clean</Text>
                  <Text style={styles.muted}>Verified</Text>
                </View>
                <View style={styles.colCondition}>
                  <Text>{item?.currentState || "N/A"}</Text>
                  <Text style={styles.muted}>Ready to sell</Text>
                </View>
                <View style={styles.colQty}>
                  <Text>{cartItem.quantity}</Text>
                </View>
                <View style={styles.colPrice}>
                  {isDiscounted && (
                    <Text
                      style={[styles.muted, { textDecoration: "line-through" }]}
                    >
                      {formatCurrency(originalLineTotal)}
                    </Text>
                  )}
                  <Text>{formatCurrency(lineTotal)}</Text>
                  {isDiscounted && originalPrice > 0 && (
                    <Text
                      style={{
                        fontSize: 7,
                        color: colors.orange,
                        marginTop: 2,
                        fontWeight: "bold",
                      }}
                    >
                      -{((1 - price / originalPrice) * 100).toFixed(1)}% OFF
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          <View style={styles.totals}>
            {totalDiscount > 0 && (
              <View style={styles.totalLine}>
                <Text>Total Discount</Text>
                <Text style={{ color: colors.orange }}>
                  -{formatCurrency(totalDiscount)}
                </Text>
              </View>
            )}
            <View style={styles.totalLine}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.amountDue}>
              <Text>Amount Due:</Text>
              <Text>{formatCurrency(amountDue)}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View>
              {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qr} />}
              <Text style={[styles.muted, { textAlign: "center" }]}>
                Scan for Records
              </Text>
            </View>
            {reviewQrCodeDataUrl ? (
              <View>
                <Image src={reviewQrCodeDataUrl} style={styles.qr} />
                <Text style={[styles.muted, { textAlign: "center" }]}>
                  Scan To Review
                </Text>
              </View>
            ) : null}
            <View style={styles.terms}>
              <Text style={styles.termsTitle}>Terms & Conditions</Text>
              <Text style={styles.muted}>
                ID details securely verified and stored with consent. Please
                keep this invoice for warranty, resale, and payment records.
              </Text>
            </View>
          </View>

          <View style={styles.contactBar}>
            <Text>{contactPhone}</Text>
            <Text>{contactEmail}</Text>
            <Text>ID details securely verified</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

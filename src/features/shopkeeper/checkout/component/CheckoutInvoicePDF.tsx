/* eslint-disable jsx-a11y/alt-text, @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  CheckoutPaymentResult,
  getPaymentMethodLabel,
} from "./checkoutPayment";

const colors = {
  teal: "#155E63",
  tealDark: "#164E55",
  orange: "#84CC16", // matches the brand lime/green
  mint: "#BFE3DD",
  mintLight: "#EAF5F3",
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#F8FAFC",
    fontSize: 9,
    color: colors.slate700,
  },
  paper: {
    backgroundColor: colors.white,
    padding: 26,
    minHeight: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.slate200,
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoFallback: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#84CC16",
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#84CC16",
    color: colors.white,
    textAlign: "center",
    fontSize: 10,
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
    color: colors.slate500,
    fontWeight: "bold",
  },
  metaText: {
    color: colors.slate900,
    fontWeight: "bold",
  },
  pillRow: {
    flexDirection: "row",
    marginBottom: 14,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  customerPill: {
    width: "50%",
    backgroundColor: colors.slate100,
    color: colors.slate900,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  customerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.slate500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.slate900,
  },
  customerDetail: {
    fontSize: 8,
    color: colors.slate500,
    marginTop: 2,
  },
  paymentPill: {
    flex: 1,
    backgroundColor: colors.white,
    color: colors.slate700,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: colors.slate200,
  },
  paymentTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.slate500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#84CC16",
    textTransform: "uppercase",
  },
  paymentDetail: {
    fontSize: 8,
    color: colors.slate500,
    marginTop: 3,
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
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    alignItems: "center",
  },
  rowAlt: {
    backgroundColor: "#F8FAFC",
  },
  colItem: {
    width: "45%",
    paddingRight: 6,
  },
  colCondition: {
    width: "20%",
  },
  colQty: {
    width: "15%",
    textAlign: "center",
  },
  colPrice: {
    width: "20%",
    textAlign: "right",
  },
  productName: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.slate900,
  },
  muted: {
    fontSize: 7.5,
    color: colors.slate500,
    marginTop: 2,
  },
  totals: {
    marginLeft: "50%",
    marginTop: 15,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  amountDue: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#84CC16",
    color: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    marginTop: 24,
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    paddingTop: 14,
  },
  qr: {
    width: 72,
    height: 72,
  },
  terms: {
    flex: 1,
  },
  termsTitle: {
    color: colors.teal,
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 9,
  },
  contactBar: {
    marginTop: 16,
    backgroundColor: colors.slate100,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.slate500,
    fontSize: 8,
    borderRadius: 6,
  },
});

export interface CheckoutInvoicePDFProps {
  cartItems: any[];
  invoiceNumber: string;
  qrCodeDataUrl?: string;
  reviewQrCodeDataUrl?: string | null;
  shopkeeper?: any;
  customer?: any;
  paymentMethod: string;
  payment?: CheckoutPaymentResult;
  subtotalBeforeDiscount?: number;
  subtotal: number;
  discount?: number;
  discountAmount?: number;
  discountPercentage?: number;
  discountLabel?: string;
  tax: number;
  total: number;
  currency?: string;
}

const formatCurrency = (value: number, currencyCode: string = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export default function CheckoutInvoicePDF({
  cartItems,
  invoiceNumber,
  qrCodeDataUrl,
  reviewQrCodeDataUrl,
  shopkeeper,
  customer,
  paymentMethod,
  payment,
  subtotalBeforeDiscount,
  subtotal,
  discount,
  discountAmount = 0,
  discountPercentage,
  discountLabel,
  tax,
  total,
  currency = "USD",
}: CheckoutInvoicePDFProps) {
  const invoiceDate = new Date();

  const shopName = shopkeeper?.shopName || "imoscan Store";
  const contactEmail = shopkeeper?.email || "info@imoscan.com";
  const contactPhone = shopkeeper?.phone || "N/A";
  const shopAddress = shopkeeper?.shopAddress || "N/A";
  const paymentLabel = getPaymentMethodLabel(payment?.method || paymentMethod);
  const paymentStatus =
    payment?.status === "partial"
      ? "PARTIALLY PAID"
      : payment?.status === "due"
        ? "PAYMENT DUE"
        : "FULLY PAID";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.paper}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.brandRow}>
                <Text style={styles.logoFallback}>{shopName}</Text>
                <Text style={styles.checkDot}>✓</Text>
              </View>
              <Text style={styles.shopAddress}>
                {shopAddress} • {contactPhone}
              </Text>
            </View>
            <Text style={styles.invoiceTitle}>RECEIPT</Text>
          </View>

          {/* Metadata */}
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
              <Text style={styles.metaLabel}>Served by:</Text>
              <Text style={styles.metaText}>
                {shopkeeper?.firstName} {shopkeeper?.lastName}
              </Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>
                {payment?.method === "due" ? "Due Date:" : "Payment Status:"}
              </Text>
              <Text style={styles.metaText}>
                {payment?.method === "due"
                  ? String(payment.details.dueDate || "N/A")
                  : "Paid"}
              </Text>
            </View>
          </View>

          {/* Customer & Payment Info */}
          <View style={styles.pillRow}>
            <View style={styles.customerPill}>
              <Text style={styles.customerTitle}>Customer Details</Text>
              {customer ? (
                <>
                  <Text style={styles.customerName}>
                    {customer.firstName} {customer.lastName}
                  </Text>
                  <Text style={styles.customerDetail}>
                    Phone: {customer.phone || "N/A"}
                  </Text>
                  <Text style={styles.customerDetail}>
                    Email: {customer.email || "N/A"}
                  </Text>
                  {customer.address && (
                    <Text style={styles.customerDetail}>
                      Address: {customer.address}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.customerName}>Walk-In Customer</Text>
              )}
            </View>
            <View style={styles.paymentPill}>
              <Text style={styles.paymentTitle}>Payment Details</Text>
              <Text style={styles.paymentText}>Method: {paymentLabel}</Text>
              <Text style={styles.paymentDetail}>Status: {paymentStatus}</Text>
              {payment?.method === "card" && (
                <Text style={styles.paymentDetail}>
                  Card: •••• {payment.details.cardLastFour} · Ref:{" "}
                  {payment.details.transactionReference}
                </Text>
              )}
              {payment?.method === "bank" && (
                <Text style={styles.paymentDetail}>
                  Bank: {payment.details.bankName} · Ref:{" "}
                  {payment.details.transactionReference}
                </Text>
              )}
              {payment?.method === "cash" && (
                <Text style={styles.paymentDetail}>
                  Received:{" "}
                  {formatCurrency(
                    Number(payment.details.amountReceived || 0),
                    currency,
                  )}{" "}
                  · Change:{" "}
                  {formatCurrency(
                    Number(payment.details.changeGiven || 0),
                    currency,
                  )}
                </Text>
              )}
              {payment?.method === "due" && (
                <>
                  <Text style={styles.paymentDetail}>
                    Paid: {formatCurrency(payment.amountPaid, currency)} · Due:{" "}
                    {formatCurrency(payment.dueAmount, currency)}
                  </Text>
                  <Text style={styles.paymentDetail}>
                    Due date: {String(payment.details.dueDate || "N/A")}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Table */}
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item Description</Text>
            <Text style={styles.colCondition}>Condition</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
          </View>

          {cartItems.map((cartItem, index) => {
            const item = cartItem.itemId;
            const price =
              cartItem.sellingPrice ??
              cartItem.price ??
              item?.expectedPrice ??
              0;
            const lineTotal = cartItem.lineTotal ?? price * cartItem.quantity;

            return (
              <View
                key={cartItem._id || index}
                style={
                  index % 2 === 1 ? [styles.row, styles.rowAlt] : styles.row
                }
              >
                <View style={styles.colItem}>
                  <Text style={styles.productName}>
                    {item?.itemName || cartItem.name || "Unknown Item"}
                  </Text>
                  <Text style={styles.muted}>
                    IMEI: {item?.imeiNumber || item?.sku || "N/A"}
                  </Text>
                </View>
                <View style={styles.colCondition}>
                  <Text>{item?.currentState || "Service"}</Text>
                </View>
                <View style={styles.colQty}>
                  <Text>{cartItem.quantity}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text>{formatCurrency(lineTotal, currency)}</Text>
                </View>
              </View>
            );
          })}

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalLine}>
              <Text>Subtotal</Text>
              <Text>
                {formatCurrency(subtotalBeforeDiscount ?? subtotal, currency)}
              </Text>
            </View>
            {!!discount && discount > 0 && (
              <View style={styles.totalLine}>
                <Text>Total Discount</Text>
                <Text>-{formatCurrency(discount, currency)}</Text>
              </View>
            )}
            {!!discount && discount > 0 && (
              <View style={styles.totalLine}>
                <Text>Discounted Subtotal</Text>
                <Text>{formatCurrency(subtotal, currency)}</Text>
              </View>
            )}
            {discountAmount > 0 ? (
              <View style={styles.totalLine}>
                <Text>
                  Discount{" "}
                  {discountPercentage ? `(${discountPercentage}%)` : ""}
                  {discountLabel ? ` • ${discountLabel}` : ""}
                </Text>
                <Text>-{formatCurrency(discountAmount, currency)}</Text>
              </View>
            ) : null}
            {tax > 0 && (
              <View style={styles.totalLine}>
                <Text>Tax</Text>
                <Text>{formatCurrency(tax, currency)}</Text>
              </View>
            )}
            <View style={styles.amountDue}>
              <Text>Grand Total:</Text>
              <Text>{formatCurrency(total, currency)}</Text>
            </View>
            {payment && payment.dueAmount > 0 && (
              <>
                <View style={styles.totalLine}>
                  <Text>Paid Now</Text>
                  <Text>{formatCurrency(payment.amountPaid, currency)}</Text>
                </View>
                <View style={styles.totalLine}>
                  <Text>Balance Due</Text>
                  <Text>{formatCurrency(payment.dueAmount, currency)}</Text>
                </View>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View>
              {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qr} />}
              <Text
                style={[styles.muted, { textAlign: "center", marginTop: 2 }]}
              >
                Scan Receipt
              </Text>
            </View>
            {reviewQrCodeDataUrl ? (
              <View>
                <Image src={reviewQrCodeDataUrl} style={styles.qr} />
                <Text
                  style={[styles.muted, { textAlign: "center", marginTop: 2 }]}
                >
                  Scan To Review
                </Text>
              </View>
            ) : null}
            <View style={styles.terms}>
              <Text style={styles.termsTitle}>
                Thank you for your purchase!
              </Text>
              <Text style={styles.muted}>
                Please keep this receipt for warranty and records. All item
                conditions were verified at the counter by both customer and
                store technician.
              </Text>
            </View>
          </View>

          <View style={styles.contactBar}>
            <Text>{contactPhone}</Text>
            <Text>{contactEmail}</Text>
            <Text>imoscan POS Terminal</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

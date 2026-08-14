/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { StructuredAddressFields } from "@/components/ui/structured-address-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  User,
  Package,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  Building2,
  Clock3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { pdf } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  useCreateInvoice,
  useMyInventory,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { useCurrency } from "@/hooks/useCurrency";
import {
  useCreateInvoiceUser,
  useMyInvoiceGet,
} from "@/features/shopkeeper/inventory/hooks/useInvoiceGenaretor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItemsCard } from "../../_components/inventoryItemsCard";
import { InvoiceDateTimeSection } from "../../_components/InvoiceDateTimeSection";

const INVENTORY_PAGE_SIZE = 10;

const createInvoicePdfStyles = StyleSheet.create({
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
  metaDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 18,
  },
  metaLabel: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  metaText: {
    color: "#0F172A",
    fontWeight: "bold",
  },
  pillRow: {
    flexDirection: "row",
    marginBottom: 14,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  customerPill: {
    width: "50%",
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  paymentPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
  },
  pillTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
  },
  detailText: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
  },
  paymentText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#84CC16",
    textTransform: "uppercase",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#155E63",
    color: "#FFFFFF",
    fontWeight: "bold",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#F8FAFC",
  },
  colProduct: {
    width: "45%",
    paddingRight: 6,
  },
  colId: {
    width: "20%",
  },
  colQuantity: {
    width: "15%",
    textAlign: "center",
  },
  colPrice: {
    width: "20%",
    textAlign: "right",
  },
  productText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
  },
  productSub: {
    fontSize: 7.5,
    color: "#64748B",
    marginTop: 2,
  },
  totalSection: {
    marginLeft: "50%",
    marginTop: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  summaryLabel: {
    color: "#334155",
  },
  amountDue: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#84CC16",
    color: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "bold",
  },
  paymentStatus: {
    marginTop: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: "#155E63",
    textAlign: "right",
  },
  footer: {
    marginTop: 24,
    color: "#64748B",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 14,
    lineHeight: 1.4,
  },
});

// Kept exported because invoice history and return receipts use this legacy
// style set. The custom invoice above intentionally has its own layout.
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 45,
    backgroundColor: "#ffffff",
    fontSize: 9,
    color: "#334155",
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#0d9488",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    marginTop: 10,
  },
  logo: { width: 130, objectFit: "contain" },
  invoiceMeta: { textAlign: "right" },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: { fontSize: 9, color: "#64748b" },
  infoContainer: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 35,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  infoLabel: {
    color: "#0d9488",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoLabelBlue: {
    color: "#1e293b",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  infoText: { color: "#475569", lineHeight: 1.5, marginBottom: 2 },
  paymentMethod: {
    marginTop: 8,
    fontSize: 8,
    color: "#0f172a",
    fontWeight: "bold",
    backgroundColor: "#e2e8f0",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    color: "#0f172a",
    fontWeight: "bold",
    paddingBottom: 8,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  colProduct: {
    width: "55%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colId: { width: "20%", textAlign: "center", color: "#64748b" },
  colPrice: {
    width: "25%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#0f172a",
  },
  productImg: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  productText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  productSub: { fontSize: 7.5, color: "#94a3b8" },
  totalSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: 16,
    borderRadius: 8,
    width: 250,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  summaryValue: { fontSize: 10, fontWeight: "bold", color: "#ffffff" },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 8 },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  balanceValue: { fontSize: 14, fontWeight: "bold", color: "#22c55e" },
  statusBadgePaid: {
    backgroundColor: "#16a34a",
    color: "white",
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  statusBadgeDue: {
    backgroundColor: "#dc2626",
    color: "white",
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 45,
    right: 45,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 7.5,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
    lineHeight: 1.4,
  },
});

export const InvoicePDF = ({
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
}: any) => {
  const pdfFormatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currency || "USD").toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };
  const date = invoiceDate ? new Date(invoiceDate) : new Date();
  const balance = Number(dueAmount || 0);
  const pdfStyles = createInvoicePdfStyles;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.paper}>
          <View style={pdfStyles.header}>
            <View>
              <View style={pdfStyles.brandRow}>
                {shopkeeper?.image?.url && (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={shopkeeper.image.url} style={pdfStyles.logo} />
                )}
                <Text style={pdfStyles.logoFallback}>
                  {shopkeeper?.shopName || "STORE"}
                </Text>
              </View>
              <Text style={pdfStyles.shopAddress}>
                {shopkeeper?.shopAddress || "N/A"} •{" "}
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
                {date.toLocaleDateString("en-GB")} •{" "}
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
              <Text style={pdfStyles.customerName}>
                {`${customer?.firstName || "Valued"} ${customer?.lastName || "Customer"}`}
              </Text>
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
                <Text style={pdfStyles.detailText}>Card: •••• {card}</Text>
              ) : null}
            </View>
          </View>

          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.colProduct}>Item Description</Text>
            <Text style={pdfStyles.colId}>IMEI / Model</Text>
            <Text style={pdfStyles.colQuantity}>Qty</Text>
            <Text style={pdfStyles.colPrice}>Price</Text>
          </View>
          {items?.map((item: any, index: number) => (
            <View
              key={item.id}
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
                    .join(" • ") || "Inventory item"}
                </Text>
              </View>
              <Text style={pdfStyles.colId}>{item.imeiNumber || "N/A"}</Text>
              <Text style={pdfStyles.colQuantity}>1</Text>
              <Text style={pdfStyles.colPrice}>
                {pdfFormatCurrency(Number(item.price || 0))}
              </Text>
            </View>
          ))}

          <View style={pdfStyles.totalSection}>
            <View style={pdfStyles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>{pdfFormatCurrency(Number(total || 0))}</Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text>Amount Paid</Text>
              <Text>{pdfFormatCurrency(Number(alreadyPaid || 0))}</Text>
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

export default function CreateInvoice() {
  const { data: inventoryData, isLoading, isError } = useMyInventory();
  const { data: profileData } = useMyProfile();
  const { currency, formatCurrency } = useCurrency();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const seesion = useSession();
  const shopkeeper = seesion.data?.user.id;
  const { mutateAsync: createInvoiceUserAsync } = useCreateInvoiceUser();
  const getInvoiceUser = useMyInvoiceGet(shopkeeper || "223423423");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());

  const [invoiceItems, setInvoiceItems] = useState<any[]>([
    {
      id: "",
      name: "",
      storage: "",
      color: "",
      condition: "",
      imeiNumber: "",
      quantity: 1,
      price: "",
    },
  ]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const customers = useMemo(
    () => getInvoiceUser?.data?.data || [],
    [getInvoiceUser?.data?.data],
  );

  const [paymentType, setPaymentType] = useState("cash");
  const [alreadyPaid, setAlreadyPaid] = useState<number>(0);

  const items = useMemo(() => {
    return (inventoryData?.data || []).filter(
      (item: any) => item.type === "inventory",
    );
  }, [inventoryData]);

  const allDevices = useMemo(() => {
    return (
      items.map((item: any) => ({
        id: item._id,
        name: item.itemName,
        price: item.expectedPrice,
        image: item.image?.url || "/placeholder.png",
        imeiNumber: item.imeiNumber,
        storage: item.storage,
        color: item.color,
        condition: item.condition || item.currentState,
      })) || []
    );
  }, [items]);

  const filteredCustomers = useMemo(() => {
    const query = customerSearchQuery.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((existingCustomer: any) =>
      [
        existingCustomer.firstName,
        existingCustomer.lastName,
        existingCustomer.email,
        existingCustomer.phone,
        existingCustomer.customerId,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [customers, customerSearchQuery]);

  const selectedDevicesData = invoiceItems;

  const totalPrice = invoiceItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );

  // Balanced calculation state handler logic
  const dueAmount = useMemo(() => {
    const calculatedDue = totalPrice - alreadyPaid;
    return calculatedDue < 0 ? 0 : calculatedDue;
  }, [totalPrice, alreadyPaid]);

  const handleCreateInvoice = async () => {
    if (!selectedDevicesData.length) return;

    try {
      let finalCustomerId = selectedCustomerId;

      if (!selectedCustomerId) {
        const customerResponse = await createInvoiceUserAsync({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          shopkeeperId: shopkeeper || "223423423",
          paymentType: paymentType,
          alreadyPaid: alreadyPaid,
        });

        finalCustomerId = customerResponse?.data?._id;

        if (!finalCustomerId) {
          toast.error("Customer creation failed");
          return;
        }
      }

      // Generate PDF
      const doc = (
        <InvoicePDF
          customer={customer}
          items={selectedDevicesData}
          total={totalPrice}
          shopkeeper={profileData?.data}
          alreadyPaid={alreadyPaid}
          dueAmount={dueAmount}
          paymentType={paymentType}
          invoiceDate={invoiceDate}
          currency={currency}
        />
      );

      const blob = await pdf(doc).toBlob();

      const file = new File(
        [blob],
        `invoice_${customer.firstName || "gadget"}.pdf`,
        {
          type: "application/pdf",
        },
      );

      // Create invoice after customer creation
      createInvoice(
        {
          shopkeeperId: shopkeeper || "223423423",
          customerInfo: finalCustomerId,
          type: "Custom invoice",
          invoice: file,
          itemsIds: invoiceItems.map((i) => i.id).filter(Boolean),
          dueAmount: totalPrice,
        },
        {
          onSuccess: () => {
            toast.success("Invoice added successfully");
          },
          onError: () => {
            toast.error("Addition failed");
          },
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="px-4 py-8 md:px-8 lg:px-10 font-poppins min-h-screen bg-background">
      <div className="mx-auto space-y-8">
        {/* Header Content */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Invoice Generator
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Selected Items: {invoiceItems.filter((i) => i.name).length}
            </p>
          </div>

          <InvoiceDateTimeSection
            value={invoiceDate}
            onChange={setInvoiceDate}
          />
        </div>

        {/* Input Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card border border-border rounded-[28px] p-8 shadow-sm space-y-6">
            <div className="flex justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <User size={20} />
                </div>
                <p className="text-xl font-black text-foreground">
                  Customer Information
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Select Existing Customer
                </label>

                <Select
                  value={selectedCustomerId}
                  onValueChange={(value) => {
                    setSelectedCustomerId(value);
                    setCustomerSearchQuery("");

                    const selectedCustomer = customers.find(
                      (customer: any) => customer._id === value,
                    );

                    if (selectedCustomer) {
                      setCustomer({
                        firstName: selectedCustomer.firstName || "",
                        lastName: selectedCustomer.lastName || "",
                        email: selectedCustomer.email || "",
                        phone: selectedCustomer.phone || "",
                        address: selectedCustomer.address || "",
                      });

                      setPaymentType(selectedCustomer.paymentType || "cash");
                      setAlreadyPaid(selectedCustomer.alreadyPaid || 0);
                    }
                  }}
                >
                  <SelectTrigger
                    className="
        h-14
        w-full
        rounded-2xl
        border border-slate-200
        bg-white
        px-4
        text-sm
        font-semibold
        text-slate-700
        shadow-sm
        transition-all
        duration-200
        hover:border-orange-300
        hover:shadow-md
        focus:ring-2
        focus:ring-orange-500/20
        focus:border-orange-500
        dark:bg-slate-900
        dark:border-slate-700
        dark:text-white
      "
                  >
                    <SelectValue placeholder="Choose customer" />
                  </SelectTrigger>

                  <SelectContent
                    className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
        dark:bg-slate-900
        dark:border-slate-700
      "
                  >
                    <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={customerSearchQuery}
                          onChange={(event) =>
                            setCustomerSearchQuery(event.target.value)
                          }
                          onKeyDown={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                          placeholder="Search customers..."
                          className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm font-medium dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                    </div>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer: any) => (
                        <SelectItem
                          key={customer._id}
                          value={customer._id}
                          className="
            cursor-pointer
            rounded-xl
            py-3
            text-sm
            font-medium
            text-slate-700
            transition-all
            focus:bg-orange-50
            focus:text-orange-600
            dark:text-slate-200
            dark:focus:bg-slate-800
          "
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {customer.firstName} {customer.lastName}
                            </span>

                            <span className="text-xs text-slate-400">
                              {customer.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-center text-sm font-medium text-slate-500">
                        No customers found.
                      </p>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  First Name
                </label>
                <Input
                  value={customer.firstName}
                  className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                  placeholder="Mehedi Hasan Shishir"
                  onChange={(e) =>
                    setCustomer({ ...customer, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  {" "}
                  Last Name
                </label>
                <Input
                  value={customer.lastName}
                  className="rounded-2xl h-12 border-primary bg-background font-bold focus-visible:ring-primary"
                  placeholder="Last Name"
                  onChange={(e) =>
                    setCustomer({ ...customer, lastName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Email Address
                </label>
                <Input
                  value={customer.email}
                  type="email"
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="shishir@example.com"
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Phone
                </label>
                <Input
                  value={customer.phone}
                  type="text"
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="+880 1XXX XXXXXX"
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Billing Address
                </label>
                <StructuredAddressFields
                  required
                  value={customer.address}
                  onChange={(address) => setCustomer({ ...customer, address })}
                />
              </div>
            </div>
          </div>

          {/* Shop Card */}
          <div className="bg-card rounded-[28px] p-8 text-foreground flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-sky-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileData?.data?.image?.url}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {profileData?.data?.shopName || "N/A"}
                </h2>
                <p className="text-lg text-slate-300">
                  {profileData?.data?.email || "N/A"}
                </p>
                <p className="text-lg text-slate-300">
                  {profileData?.data?.phone || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Store Address
                </p>
                <p className="text-sm font-bold">
                  {profileData?.data?.shopAddress || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <datalist id="inventory-names-list">
          {allDevices.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </datalist>
        <div className="bg-card border border-border rounded-[28px] p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-black">Invoice Items</h2>
              <p className="text-sm text-muted-foreground">
                Add products to this invoice.
              </p>
            </div>
            <Button
              onClick={() =>
                setInvoiceItems([
                  ...invoiceItems,
                  {
                    id: "",
                    name: "",
                    storage: "",
                    color: "",
                    condition: "",
                    imeiNumber: "",
                    quantity: 1,
                    price: "",
                  },
                ])
              }
              className="rounded-2xl"
            >
              <Plus size={16} className="mr-2" /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {invoiceItems.map((item, index) => (
              <div
                key={index}
                className="border rounded-3xl p-6 bg-muted/20 space-y-4 relative group"
              >
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() =>
                    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
                  }
                  disabled={invoiceItems.length === 1}
                >
                  <Trash2 size={16} />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      list="inventory-names-list"
                      placeholder="Select or Type Item Name"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const found = allDevices.find((d) => d.name === val);
                        const next = [...invoiceItems];
                        if (found) {
                          next[index] = {
                            ...next[index],
                            id: found.id,
                            name: found.name,
                            storage: found.storage || "",
                            color: found.color || "",
                            condition: found.condition || "",
                            price: found.price || 0,
                            imeiNumber: found.imeiNumber || "",
                          };
                        } else {
                          next[index] = { ...next[index], name: val };
                        }
                        setInvoiceItems(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      Storage / Memory
                    </label>
                    <Input
                      placeholder="Select or Type Storage"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.storage || ""}
                      onChange={(e) => {
                        const next = [...invoiceItems];
                        next[index] = {
                          ...next[index],
                          storage: e.target.value,
                        };
                        setInvoiceItems(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      Color
                    </label>
                    <Input
                      placeholder="Select or Type Color"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.color || ""}
                      onChange={(e) => {
                        const next = [...invoiceItems];
                        next[index] = { ...next[index], color: e.target.value };
                        setInvoiceItems(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      Condition
                    </label>
                    <Input
                      placeholder="Select or Type Condition"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.condition || ""}
                      onChange={(e) => {
                        const next = [...invoiceItems];
                        next[index] = {
                          ...next[index],
                          condition: e.target.value,
                        };
                        setInvoiceItems(next);
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      IMEI Number or Serial Number
                    </label>
                    <Input
                      placeholder="Type IMEI Number or Serial Number"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.imeiNumber || ""}
                      onChange={(e) => {
                        const next = [...invoiceItems];
                        next[index] = {
                          ...next[index],
                          imeiNumber: e.target.value,
                        };
                        setInvoiceItems(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min={1}
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...invoiceItems];
                        next[index] = {
                          ...next[index],
                          quantity: Math.max(1, Number(e.target.value)),
                        };
                        setInvoiceItems(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      Price Per Unit ({currency})
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.price ?? ""}
                      onChange={(e) => {
                        const next = [...invoiceItems];
                        next[index] = { ...next[index], price: e.target.value };
                        setInvoiceItems(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-6 flex justify-between items-center bg-card border border-border p-6 rounded-[32px] shadow-2xl">
          <div className="flex items-center gap-6 px-4">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <Package size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Total Amount Due
              </p>
              <p className="text-3xl font-black text-foreground tracking-tighter">
                {formatCurrency(totalPrice, currency)}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={invoiceItems.filter((i) => i.name).length === 0}
            className="bg-primary hover:bg-primary/90 h-16 px-10 text-sm font-black rounded-full shadow-lg flex items-center gap-3 uppercase tracking-wider"
          >
            Create Invoice
          </Button>
        </div>
      </div>

      <Dialog
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setIsPaymentModalOpen(open);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-none bg-white p-0 font-poppins sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
            <DialogTitle className="flex items-center gap-3 text-xl font-black text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-50 text-[#84CC16]">
                <CreditCard size={19} />
              </span>
              Collect Payment
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-500">
              Select how the customer is paying{" "}
              <span className="font-black text-slate-900">
                {formatCurrency(totalPrice, currency)}
              </span>
              . The payment record will be saved with the customer invoice.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsPaymentModalOpen(false);
              handleCreateInvoice();
            }}
            className="space-y-5 p-6"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  id: "cash",
                  label: "Cash",
                  description: "Cash received",
                  icon: Banknote,
                },
                {
                  id: "card",
                  label: "Card",
                  description: "Debit or credit",
                  icon: CreditCard,
                },
                {
                  id: "bank",
                  label: "Bank",
                  description: "Bank transfer",
                  icon: Building2,
                },
                {
                  id: "due",
                  label: "Due",
                  description: "Pay later",
                  icon: Clock3,
                },
              ].map(({ id, label, description, icon: Icon }) => {
                const isSelected = paymentType === id;
                const isDisabled = id === "due" && !selectedCustomerId;

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setPaymentType(id)}
                    className={`rounded-2xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-[#84CC16] bg-lime-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-[#84CC16] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="mt-3 block text-sm font-black text-slate-950">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold text-slate-500">
                      {isDisabled ? "Customer required" : description}
                    </span>
                  </button>
                );
              })}
            </div>

            {!paymentType ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center">
                <CreditCard className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs font-black text-slate-600">
                  Choose a payment method to continue
                </p>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}{" "}
                    details
                  </p>
                </div>

                {paymentType === "cash" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Cash Received
                      </span>
                      <Input
                        type="number"
                        min={totalPrice}
                        step="0.01"
                        value={alreadyPaid}
                        onChange={(event) =>
                          setAlreadyPaid(Number(event.target.value))
                        }
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm font-black focus-visible:ring-[#84CC16]"
                      />
                    </label>
                    <div className="rounded-xl border border-lime-100 bg-lime-50 px-4 py-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-lime-700">
                        Change
                      </span>
                      <p className="mt-1 text-lg font-black text-lime-700">
                        {formatCurrency(
                          Math.max(0, Number(alreadyPaid || 0) - totalPrice),
                          currency,
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="h-12 rounded-xl px-6 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !paymentType}
                className="h-12 rounded-xl bg-[#84CC16] px-8 font-black text-white hover:bg-[#75b213]"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Print Receipt
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

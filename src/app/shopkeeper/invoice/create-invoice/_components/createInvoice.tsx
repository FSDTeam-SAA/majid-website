/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { User, Package, Loader2, Search, Calendar, Clock } from "lucide-react";
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

// --- Ultra-Modern PDF Styles (Premium Layout) ---
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 45,
    backgroundColor: "#ffffff",
    fontSize: 9,
    color: "#334155", // Slate 700
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#0d9488", // Premium Teal
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    marginTop: 10,
  },
  logo: {
    width: 130,
    objectFit: "contain",
  },
  invoiceMeta: {
    textAlign: "right",
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a", // Dark Slate
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 9,
    color: "#64748b",
  },
  infoContainer: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 35,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8fafc", // Very soft gray/blue
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
  infoText: {
    color: "#475569",
    lineHeight: 1.5,
    marginBottom: 2,
  },
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
  // Modern Table Styling
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
  colId: {
    width: "20%",
    textAlign: "center",
    color: "#64748b",
  },
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
  productSub: {
    fontSize: 7.5,
    color: "#94a3b8",
  },
  // Summary Section
  totalSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    backgroundColor: "#0f172a", // Premium Dark Background
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
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 8,
  },
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
  balanceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#22c55e", // Light Green text for amount
  },
  statusBadgePaid: {
    backgroundColor: "#16a34a", // Emerald Green
    color: "white",
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  statusBadgeDue: {
    backgroundColor: "#dc2626", // Crisp Red
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
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Decorative Top Bar */}
        <View style={pdfStyles.headerBar} />

        {/* Brand Header */}
        <View style={pdfStyles.topSection}>
          {shopkeeper?.image?.url ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={shopkeeper.image.url} style={pdfStyles.logo} />
          ) : (
            <Text
              style={[
                pdfStyles.invoiceTitle,
                { textAlign: "left", fontSize: 20 },
              ]}
            >
              {shopkeeper?.shopName || "STORE"}
            </Text>
          )}
          <View style={pdfStyles.invoiceMeta}>
            <Text style={pdfStyles.invoiceTitle}>
              {InvoiceName ? InvoiceName : "INVOICE"}
            </Text>
            <Text style={pdfStyles.dateText}>
              Date:{" "}
              {(invoiceDate
                ? new Date(invoiceDate)
                : new Date()
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={pdfStyles.dateText}>
              Time:{" "}
              {(invoiceDate
                ? new Date(invoiceDate)
                : new Date()
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
        </View>

        {/* Information Cards */}
        <View style={pdfStyles.infoContainer}>
          {/* Customer Card */}
          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoLabel}>
              {customerInfoLabel || "Client Details"}
            </Text>
            <Text style={pdfStyles.customerName}>
              {`${customer?.firstName || "Valued"} ${customer?.lastName || "Customer"}`}
            </Text>
            <Text style={pdfStyles.infoText}>
              Email: {customer?.email || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Phone: {customer?.phone || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Address: {customer?.address || "N/A"}
            </Text>
            <Text
              style={[
                pdfStyles.infoText,
                { fontSize: 7.5, color: "#94a3b8", marginTop: 4 },
              ]}
            >
              ID: {customer?.customerId || "N/A"}
            </Text>

            <Text style={pdfStyles.paymentMethod}>
              PAYMENT METHOD: {paymentType ? paymentType.toUpperCase() : "N/A"}
              {paymentType === "card" && card ? ` •••• ${card}` : ""}
            </Text>
          </View>

          {/* Store Card */}
          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoLabelBlue}>
              {shopkeeperInfoLabel || "Store Information"}
            </Text>
            <Text style={pdfStyles.customerName}>
              {shopkeeper?.shopName || "Gadget Galaxy"}
            </Text>
            <Text style={pdfStyles.infoText}>
              {shopkeeper?.shopAddress || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Email: {shopkeeper?.email || "N/A"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Phone: {shopkeeper?.phone || "N/A"}
            </Text>
          </View>
        </View>

        {/* Modern Product Table */}
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.colProduct}>Item Description</Text>
          <Text style={pdfStyles.colId}>IMEI / Model ID</Text>
          <Text style={pdfStyles.colPrice}>Amount</Text>
        </View>

        {items?.map((item: any) => (
          <View key={item.id} style={pdfStyles.tableRow}>
            <View style={pdfStyles.colProduct}>
              {item.image && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={item.image} style={pdfStyles.productImg} />
              )}
              <View>
                <Text style={pdfStyles.productText}>{item.name}</Text>
                <Text style={pdfStyles.productSub}>
                  Brand New • Official Local Warranty
                </Text>
              </View>
            </View>
            <Text style={pdfStyles.colId}>{item.imeiNumber || "N/A"}</Text>
            <Text style={pdfStyles.colPrice}>
              {pdfFormatCurrency(item.price || 0)}
            </Text>
          </View>
        ))}

        {/* Calculations & Status section */}
        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalBox}>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
              <Text style={pdfStyles.summaryValue}>
                {pdfFormatCurrency(total || 0)}
              </Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Amount Paid</Text>
              <Text style={pdfStyles.summaryValue}>
                {pdfFormatCurrency(alreadyPaid || 0)}
              </Text>
            </View>

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.balanceRow}>
              <Text style={pdfStyles.balanceLabel}>Balance Due</Text>
              <Text
                style={[
                  pdfStyles.balanceValue,
                  { color: dueAmount <= 0 ? "#22c55e" : "#ef4444" },
                ]}
              >
                {pdfFormatCurrency(dueAmount || 0)}
              </Text>
            </View>

            {dueAmount <= 0 ? (
              <Text style={pdfStyles.statusBadgePaid}>FULLY PAID</Text>
            ) : (
              <Text style={pdfStyles.statusBadgeDue}>
                DUE: {pdfFormatCurrency(dueAmount || 0)}
              </Text>
            )}
          </View>
        </View>

        {/* Minimalist Footer */}
        <Text style={pdfStyles.footer}>
          Thank you for choosing Gadget Galaxy! We appreciate your business.{" "}
          {"\n"}
          This is an electronically generated invoice, official signature is not
          required.
        </Text>
      </Page>
    </Document>
  );
};

export default function CreateInvoice() {
  const { data: inventoryData, isLoading, isError } = useMyInventory();
  const { data: profileData } = useMyProfile();
  const { currency, formatCurrency } = useCurrency();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const [searchQuery, setSearchQuery] = useState("");
  const seesion = useSession();
  const shopkeeper = seesion.data?.user.id;
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const { mutateAsync: createInvoiceUserAsync } = useCreateInvoiceUser();
  const getInvoiceUser = useMyInvoiceGet(shopkeeper || "223423423");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const handleQuickOption = (option: "now" | "today" | "yesterday") => {
    const now = new Date();
    if (option === "now") {
      setInvoiceDate(new Date());
    } else if (option === "today") {
      now.setHours(0, 0, 0, 0);
      setInvoiceDate(now);
    } else if (option === "yesterday") {
      now.setDate(now.getDate() - 1);
      now.setHours(0, 0, 0, 0);
      setInvoiceDate(now);
    }
  };

  const updateDatePart = (part: "day" | "month" | "year", value: number) => {
    const d = new Date(invoiceDate);
    if (part === "day") d.setDate(value);
    if (part === "month") d.setMonth(value);
    if (part === "year") d.setFullYear(value);
    setInvoiceDate(d);
  };

  const updateTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const d = new Date(invoiceDate);
    d.setHours(hours, minutes);
    setInvoiceDate(d);
  };

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    paymentType: "",
    alreadyPaid: 0,
    customerId: "",
  });

  const customers = getInvoiceUser?.data?.data || [];

  // Custom Dynamic Input Payment states
  const [paymentType, setPaymentType] = useState("cash");
  const [alreadyPaid, setAlreadyPaid] = useState<number>(0);

  const toggleDevice = (id: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const items = useMemo(() => {
    return (inventoryData?.data || []).filter(
      (item: any) => item.type === "inventory",
    );
  }, [inventoryData]);

  const filteredDevices = useMemo(() => {
    return items.filter(
      (item: any) =>
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.imeiNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const devices = useMemo(() => {
    return (
      filteredDevices.map((item: any) => ({
        id: item._id,
        name: item.itemName,
        price: item.expectedPrice,
        image: item.image?.url || "/placeholder.png",
        imeiNumber: item.imeiNumber,
      })) || []
    );
  }, [filteredDevices]);

  const selectedDevicesData = useMemo(
    () => devices.filter((device) => selectedDeviceIds.includes(device.id)),
    [devices, selectedDeviceIds],
  );

  const totalPrice = selectedDevicesData.reduce((sum, d) => sum + d.price, 0);

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
          customerId: customer.customerId,
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
          itemsIds: selectedDeviceIds,
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Invoice Generator
          </h1>
          <div className="hidden md:flex gap-4 items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Selected Items: {selectedDeviceIds.length}
            </span>
          </div>
        </div>

        {/* Invoice Date & Time Section */}
        <div className="bg-card border border-border rounded-[28px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
            <p className="text-xl font-black text-foreground">
              Invoice Date & Time
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Date
              </label>
              <div className="flex items-center gap-2 rounded-2xl h-12 border border-primary bg-background px-4 font-bold text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span>
                  {invoiceDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Time
              </label>
              <div className="flex items-center gap-2 rounded-2xl h-12 border border-primary bg-background px-4 font-bold text-sm">
                <Clock size={16} className="text-muted-foreground" />
                <span>
                  {invoiceDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Quick Options
              </label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuickOption("now")}
                  className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickOption("today")}
                  className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickOption("yesterday")}
                  className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Or Select Manually
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <select
                  value={invoiceDate.getDate()}
                  onChange={(e) =>
                    updateDatePart("day", Number(e.target.value))
                  }
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={invoiceDate.getMonth()}
                  onChange={(e) =>
                    updateDatePart("month", Number(e.target.value))
                  }
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {months.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={invoiceDate.getFullYear()}
                  onChange={(e) =>
                    updateDatePart("year", Number(e.target.value))
                  }
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="time"
                  value={`${String(invoiceDate.getHours()).padStart(2, "0")}:${String(invoiceDate.getMinutes()).padStart(2, "0")}`}
                  onChange={(e) => updateTime(e.target.value)}
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
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
                        paymentType: selectedCustomer.paymentType || "cash",
                        alreadyPaid: selectedCustomer.alreadyPaid || 0,
                        customerId: selectedCustomer.customerId || "",
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
                    {customers.map((customer: any) => (
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
                    ))}
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
                <AddressAutocomplete
                  value={customer.address}
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="Dhaka, Bangladesh"
                  onChange={(e) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                />
              </div>

              {/* Payment Select UI Field Implementation */}
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Payment Type
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="flex w-full rounded-2xl h-12 border border-primary bg-background px-3 py-2 text-sm font-bold shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>

              {/* Already Paid Input Box Field */}
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Already Paid
                </label>
                <Input
                  type="number"
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="0.00"
                  value={alreadyPaid}
                  onChange={(e) => setAlreadyPaid(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Customer ID
                </label>
                <Input
                  type="number"
                  className="rounded-2xl h-12 border-primary bg-background font-bold"
                  placeholder="0.00"
                  value={customer.customerId || ""}
                  onChange={(e) =>
                    setCustomer({ ...customer, customerId: e.target.value })
                  }
                />
              </div>
              {/* Conditional Card field wrapper layer */}
              {/* {paymentType === "card" && (
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    Card Number
                  </label>
                  <Input
                    type="text"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    value={customer.card}
                    onChange={(e) =>
                      setCustomer({ ...customer, card: e.target.value })
                    }
                  />
                </div>
              )} */}
            </div>

            {/* Calculations Status Grid view matching original structure style */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-border">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                  Sub-Total Amount
                </span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-200">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                  Remaining Due
                </span>
                <span
                  className={`text-lg font-black ${dueAmount === 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {formatCurrency(dueAmount)}
                </span>
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

        <InventoryItemsCard shopkeeperId={shopkeeper} />

        {/* Search Field */}
        <div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 w-full bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-white rounded-xl font-bold text-sm focus:ring-[#84CC16] focus:border-[#84CC16] outline-none transition"
            />
          </div>
        </div>

        {/* Device Table */}
        <div className="rounded-[32px] border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-surface text-xs font-black uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-8 py-6 w-20">Select</th>
                <th className="px-8 py-6">Product Details</th>
                <th className="px-8 py-6 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-8 py-6 text-center text-sm font-bold text-muted-foreground"
                  >
                    Loading inventory data...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-8 py-6 text-center text-sm font-bold text-destructive"
                  >
                    Failed to fetch products.
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-8 py-6 text-center text-sm font-bold text-muted-foreground"
                  >
                    No devices match search criteria.
                  </td>
                </tr>
              ) : (
                devices.map((device) => {
                  const isSelected = selectedDeviceIds.includes(device.id);
                  return (
                    <tr
                      key={device.id}
                      className={`group transition-all hover:bg-slate-50/50 cursor-pointer ${
                        isSelected ? "bg-orange-50/40" : ""
                      }`}
                      onClick={() => toggleDevice(device.id)}
                    >
                      <td
                        className="px-8 py-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          className="h-6 w-6 rounded-lg border-primary focus:ring-primary"
                          checked={isSelected}
                          onCheckedChange={() => toggleDevice(device.id)}
                        />
                      </td>

                      <td className="px-8 py-6 flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={device.image}
                          className="w-12 h-12 rounded-2xl object-cover"
                          alt={device.name}
                        />
                        <div>
                          <p className="font-black text-foreground">
                            {device.name}
                          </p>
                          <p className="text-xs font-bold text-muted-foreground">
                            #DEV-{device.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right font-black text-lg">
                        {formatCurrency(device.price || 0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
                {formatCurrency(totalPrice)}
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreateInvoice}
            disabled={selectedDeviceIds.length === 0 || isPending}
            className="bg-primary hover:bg-primary/90 h-16 px-10 text-sm font-black rounded-full shadow-lg flex items-center gap-3 uppercase tracking-wider"
          >
            Send Invoice {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

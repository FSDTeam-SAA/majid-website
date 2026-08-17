/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { StructuredAddressFields } from "@/components/ui/structured-address-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { User, Package, Loader2, Search, Trash2, Plus } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
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
import { InvoicePDF } from "../../create-invoice/_components/createInvoice";
import { InventoryItemsCard } from "../../_components/inventoryItemsCard";
import { InvoiceDateTimeSection } from "../../_components/InvoiceDateTimeSection";
import { CollectPaymentModal } from "../../_components/CollectPaymentModal";
import {
  createCheckoutPaymentForm,
  validateCheckoutPayment,
  CheckoutPaymentForm,
  CheckoutPaymentResult,
} from "@/features/shopkeeper/checkout/component/checkoutPayment";

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

export default function DeliveryInvoice() {
  const { data: inventoryData, isLoading, isError } = useMyInventory();
  const { data: profileData } = useMyProfile();
  const { currency, formatCurrency } = useCurrency();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
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

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    customerId: "",
  });

  const customers = getInvoiceUser?.data?.data || [];

  const [paymentType, setPaymentType] = useState("cash");
  const [alreadyPaid, setAlreadyPaid] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<CheckoutPaymentForm>(() =>
    createCheckoutPaymentForm(0),
  );

  const allDevices = useMemo(() => {
    return (
      (inventoryData?.data || []).map((item: any) => ({
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
  }, [inventoryData]);

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

  const handleInitiateInvoice = () => {
    if (invoiceItems.filter((i) => i.name).length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setPaymentForm((prev) => ({
      ...createCheckoutPaymentForm(totalPrice),
      method: prev.method || "cash",
    }));
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      paymentForm.method === "due" &&
      !selectedCustomerId &&
      !customer.firstName &&
      !customer.phone
    ) {
      toast.error("Select or enter a customer before recording an amount due");
      return;
    }

    const { error, payment } = validateCheckoutPayment(paymentForm, totalPrice);

    if (error || !payment) {
      toast.error(error || "Payment details are incomplete");
      return;
    }

    await handleProcessInvoice(payment);
  };

  const handleProcessInvoice = async (payment: CheckoutPaymentResult) => {
    if (!selectedDevicesData.length) return;

    const finalPaymentType = payment.method;
    const finalAlreadyPaid = payment.amountPaid;
    const finalDueAmount = payment.dueAmount;

    setPaymentType(finalPaymentType);
    setAlreadyPaid(finalAlreadyPaid);

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
          paymentType: finalPaymentType,
          alreadyPaid: finalAlreadyPaid,
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
          alreadyPaid={finalAlreadyPaid}
          dueAmount={finalDueAmount}
          paymentType={finalPaymentType}
          InvoiceName="DELIVERY INVOICE"
          customerInfoLabel="Deliver To"
          shopkeeperInfoLabel="Deliver From"
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
          type: "delivery Note",
          invoice: file,
          itemsIds: invoiceItems.map((i) => i.id).filter(Boolean),
          dueAmount: finalDueAmount,
        },
        {
          onSuccess: () => {
            setIsPaymentModalOpen(false);
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
              Delivery Invoice
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
                <p className="text-xl font-black text-foreground">Deliver To</p>
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
                        customerId: selectedCustomer.customerId || "",
                      });

                      setPaymentType(
                        selectedCustomer.paymentType === "cash"
                          ? "cash on delivery"
                          : selectedCustomer.paymentType || "cash on delivery",
                      );
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
                  Delivery Address
                </label>
                <StructuredAddressFields
                  required
                  value={customer.address}
                  onChange={(address) => setCustomer({ ...customer, address })}
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
                  Deliver From
                </p>
                <p className="text-sm font-bold">
                  {profileData?.data?.shopAddress || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <datalist id="inventory-names-list">
          {allDevices.map((d: any) => (
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
                        const found = allDevices.find(
                          (d: any) => d.name === val,
                        );
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
                {formatCurrency(totalPrice)}
              </p>
            </div>
          </div>

          <Button
            onClick={handleInitiateInvoice}
            disabled={
              invoiceItems.filter((i) => i.name).length === 0 || isPending
            }
            className="bg-primary hover:bg-primary/90 h-16 px-10 text-sm font-black rounded-full shadow-lg flex items-center gap-3 uppercase tracking-wider"
          >
            Send Invoice {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </div>

      <CollectPaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        totalAmount={totalPrice}
        currency={currency}
        formatCurrency={formatCurrency}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        onConfirm={handleConfirmPayment}
        isPending={isPending}
        isDueDisabled={
          !selectedCustomerId && !customer.firstName && !customer.phone
        }
        confirmButtonText="Confirm & Print Receipt"
      />
    </div>
  );
}

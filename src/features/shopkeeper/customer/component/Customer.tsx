"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BadgePercent,
  Calendar,
  CreditCard,
  Download,
  Edit2,
  Eye,
  FileText,
  Filter,
  Grid2X2,
  History,
  Loader2,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCustomersByShopkeeper,
  useDeleteCustomer,
  useMyInvoiceHistory,
} from "../../inventory/hooks/useInventory";
import type { Customer, InvoiceHistoryItem } from "../../inventory/types";
import { CustomerFormModal } from "./modals/CustomerFormModal";
import { useCurrency } from "@/hooks/useCurrency";

type CustomerInvoice = InvoiceHistoryItem & {
  customerInfo?: Partial<Customer> | string | null;
  dueAmount?: number;
};

type CustomerDiscountRecord = {
  _id: string;
  discountName: string;
  percentage: number;
  usageLimit: number;
  validFrom: string;
  until?: string | null;
  shopkeeperId: string;
  status: "active" | "inactive";
  customerId: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerDiscountResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: CustomerDiscountRecord[];
};

type CustomerDiscount = {
  id: string;
  customerId: string;
  title: string;
  percentage: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  trackUsage: boolean;
  createdAt: string;
  status: "active" | "inactive";
};

type DiscountForm = {
  title: string;
  percentage: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  trackUsage: boolean;
};

type CustomerDiscountPayload = {
  discountName: string;
  percentage: number;
  usageLimit?: number;
  validFrom: string;
  until?: string;
  shopkeeperId?: string;
  status?: "active" | "inactive";
  customerId: string;
};

type EmailForm = {
  subject: string;
  description: string;
};

type CustomerEmailPayload = {
  customerIds: string[];
  subject: string;
  description: string;
};

const CUSTOMER_DISCOUNT_BASE = "/customer-discounts";
const CUSTOMER_EMAIL_BASE = "/customer/send-email";

const getCustomerDiscountsByCustomerId = async (
  customerId: string,
): Promise<CustomerDiscountResponse> => {
  const response = await api.get(
    `${CUSTOMER_DISCOUNT_BASE}/customer/${customerId}`,
  );

  return response.data;
};

const createCustomerDiscountRequest = async (
  payload: CustomerDiscountPayload,
) => {
  const response = await api.post(`${CUSTOMER_DISCOUNT_BASE}/create`, payload);

  return response.data;
};

const deleteCustomerDiscountRequest = async (id: string) => {
  const response = await api.delete(`${CUSTOMER_DISCOUNT_BASE}/delete/${id}`);

  return response.data;
};

const mapDiscountRecordToUi = (
  discount: CustomerDiscountRecord,
): CustomerDiscount => ({
  id: discount._id,
  customerId: discount.customerId,
  title: discount.discountName,
  percentage: discount.percentage,
  usageLimit: discount.usageLimit ?? 1,
  usedCount: 0,
  validFrom: new Date(discount.validFrom).toISOString().slice(0, 10),
  validUntil: discount.until
    ? new Date(discount.until).toISOString().slice(0, 10)
    : "",
  trackUsage: (discount.usageLimit ?? 1) > 1,
  createdAt: discount.createdAt,
  status: discount.status,
});

const createDefaultEmailForm = (): EmailForm => ({
  subject: "",
  description: "",
});

const sendCustomerEmailRequest = async (payload: CustomerEmailPayload) => {
  const response = await api.post(CUSTOMER_EMAIL_BASE, payload);

  return response.data;
};

const createDefaultDiscountForm = (): DiscountForm => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  return {
    title: "Loyal Customer Discount",
    percentage: "10",
    usageLimit: "1",
    validFrom: today.toISOString().slice(0, 10),
    validUntil: nextMonth.toISOString().slice(0, 10),
    trackUsage: true,
  };
};

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatInvoiceAmount = (amount?: number, currency = "USD") => {
  if (amount === undefined || amount === null) return "N/A";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

const getInvoicePaymentDetail = (invoice: CustomerInvoice) => {
  const details = invoice.paymentDetails;

  if (invoice.paymentMethod === "card" && details?.cardLastFour) {
    return `•••• ${details.cardLastFour}${
      details.transactionReference
        ? ` · Ref ${details.transactionReference}`
        : ""
    }`;
  }

  if (invoice.paymentMethod === "bank") {
    return [details?.bankName, details?.transactionReference]
      .filter(Boolean)
      .join(" · ");
  }

  if (invoice.paymentMethod === "cash" && details?.amountReceived != null) {
    return `Received ${formatInvoiceAmount(
      details.amountReceived,
      invoice.currency,
    )} · Change ${formatInvoiceAmount(
      details.changeGiven || 0,
      invoice.currency,
    )}`;
  }

  if (invoice.paymentMethod === "due" && details?.dueDate) {
    return `Due ${formatDate(details.dueDate)}`;
  }

  return "";
};

const getInitial = (customer: Customer) =>
  customer.firstName?.charAt(0).toUpperCase() ||
  customer.lastName?.charAt(0).toUpperCase() ||
  "C";

export default function Customer() {
  const { formatCurrency } = useCurrency();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const shopkeeperId = (session?.user as { id?: string })?.id;
  const {
    data: customersResponse,
    isLoading,
    isError,
  } = useCustomersByShopkeeper(shopkeeperId || "");
  const { data: invoicesResponse, isLoading: isInvoicesLoading } =
    useMyInvoiceHistory(shopkeeperId || "", !!shopkeeperId);
  const deleteCustomerMutation = useDeleteCustomer();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [discountCustomer, setDiscountCustomer] = useState<Customer | null>(
    null,
  );
  const [discountForm, setDiscountForm] = useState<DiscountForm>(() =>
    createDefaultDiscountForm(),
  );
  const [discountView, setDiscountView] = useState<"add" | "list">("add");
  const [emailRecipients, setEmailRecipients] = useState<Customer[]>([]);
  const [emailForm, setEmailForm] = useState<EmailForm>(() =>
    createDefaultEmailForm(),
  );
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const customerDiscountsQuery = useQuery({
    queryKey: ["customer-discounts", discountCustomer?._id || ""],
    queryFn: () =>
      getCustomerDiscountsByCustomerId(discountCustomer?._id || ""),
    enabled: !!discountCustomer?._id,
  });

  const createCustomerDiscountMutation = useMutation({
    mutationFn: createCustomerDiscountRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customer-discounts", discountCustomer?._id || ""],
      });
    },
  });

  const deleteCustomerDiscountMutation = useMutation({
    mutationFn: deleteCustomerDiscountRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customer-discounts", discountCustomer?._id || ""],
      });
    },
  });

  const sendCustomerEmailMutation = useMutation({
    mutationFn: sendCustomerEmailRequest,
    onSuccess: (data) => {
      toast.success(data?.message || "Email sent successfully");
      setEmailRecipients([]);
      setEmailForm(createDefaultEmailForm());
      setSelectedCustomerIds([]);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to send email");
    },
  });

  const customers = useMemo(
    () => customersResponse?.data || [],
    [customersResponse],
  );

  const invoices = useMemo<CustomerInvoice[]>(
    () => (invoicesResponse?.data || []) as CustomerInvoice[],
    [invoicesResponse],
  );

  const getCustomerInvoices = useCallback(
    (customer: Customer) =>
      invoices.filter((invoice) => {
        const customerInfo = invoice.customerInfo;

        if (!customerInfo || typeof customerInfo === "string") {
          return customerInfo === customer._id;
        }

        return (
          customerInfo._id === customer._id ||
          customerInfo.email === customer.email ||
          customerInfo.phone === customer.phone ||
          customerInfo.customerId === customer.customerId
        );
      }),
    [invoices],
  );

  const customerRows = useMemo(() => {
    return customers.map((customer) => {
      const customerInvoices = getCustomerInvoices(customer);
      const sortedInvoices = [...customerInvoices].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return {
        customer,
        invoices: customerInvoices,
        lastInvoice: sortedInvoices[0],
        totalSpent: customer.alreadyPaid || 0,
      };
    });
  }, [customers, getCustomerInvoices]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return customerRows;

    const query = searchQuery.toLowerCase();
    return customerRows.filter(({ customer }) => {
      const name = `${customer.firstName || ""} ${customer.lastName || ""}`;

      return (
        name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.customerId?.toLowerCase().includes(query)
      );
    });
  }, [customerRows, searchQuery]);

  const selectedCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        selectedCustomerIds.includes(customer._id),
      ),
    [customers, selectedCustomerIds],
  );

  const selectedCustomersWithEmail = useMemo(
    () => selectedCustomers.filter((customer) => Boolean(customer.email)),
    [selectedCustomers],
  );

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every(({ customer }) =>
      selectedCustomerIds.includes(customer._id),
    );

  const selectedCustomerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return getCustomerInvoices(selectedCustomer);
  }, [getCustomerInvoices, selectedCustomer]);

  const selectedDiscounts = useMemo(() => {
    const apiDiscounts = customerDiscountsQuery.data?.data || [];

    return apiDiscounts
      .map(mapDiscountRecordToUi)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [customerDiscountsQuery.data]);

  const repeatCustomers = customerRows.filter(
    ({ invoices: customerInvoices }) => customerInvoices.length > 1,
  ).length;
  const totalSpent = customerRows.reduce((sum, row) => sum + row.totalSpent, 0);
  const thisMonthInvoices = invoices.filter((invoice) => {
    const createdAt = new Date(invoice.createdAt);
    const now = new Date();

    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  }).length;

  const handleDelete = async (customer: Customer) => {
    if (!shopkeeperId) return;

    await deleteCustomerMutation.mutateAsync(
      { id: customer._id, shopkeeperId },
      {
        onSuccess: () => toast.success("Customer deleted successfully"),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(
            err.response?.data?.message || "Failed to delete customer",
          );
        },
      },
    );
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenDiscounts = (customer: Customer, view: "add" | "list") => {
    setDiscountCustomer(customer);
    setDiscountView(view);
    setDiscountForm(createDefaultDiscountForm());
  };

  const handleOpenEmail = (customer: Customer) => {
    setEmailRecipients([customer]);
    setEmailForm(createDefaultEmailForm());
  };

  const handleOpenBulkEmail = () => {
    if (!selectedCustomerIds.length) {
      toast.error("Select at least one customer first");
      return;
    }

    setEmailRecipients(selectedCustomers);
    setEmailForm(createDefaultEmailForm());
  };

  const handleSubmitEmail = () => {
    if (!emailRecipients.length) return;

    const customerIds = emailRecipients.map((customer) => customer._id);

    if (!customerIds.length) {
      toast.error("No valid recipients were selected");
      return;
    }

    if (!emailForm.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!emailForm.description.trim()) {
      toast.error("Description is required");
      return;
    }

    sendCustomerEmailMutation.mutate({
      customerIds,
      subject: emailForm.subject.trim(),
      description: emailForm.description.trim(),
    });
  };

  const handleAddDiscount = () => {
    if (!discountCustomer) return;

    const percentage = Number(discountForm.percentage);
    const usageLimit = Number(discountForm.usageLimit);

    if (!discountForm.title.trim()) {
      toast.error("Discount title is required");
      return;
    }

    if (!percentage || percentage <= 0 || percentage > 100) {
      toast.error("Percentage must be between 1 and 100");
      return;
    }

    if (!usageLimit || usageLimit < 1) {
      toast.error("Usage limit must be at least 1");
      return;
    }

    if (!discountForm.validFrom || !discountForm.validUntil) {
      toast.error("Validity dates are required");
      return;
    }

    if (discountForm.validFrom > discountForm.validUntil) {
      toast.error("Valid until date must be after valid from date");
      return;
    }

    const payload: CustomerDiscountPayload = {
      discountName: discountForm.title.trim(),
      percentage,
      usageLimit,
      validFrom: new Date(discountForm.validFrom).toISOString(),
      until: discountForm.validUntil
        ? new Date(discountForm.validUntil).toISOString()
        : undefined,
      shopkeeperId,
      status: "active",
      customerId: discountCustomer._id,
    };

    createCustomerDiscountMutation.mutate(payload, {
      onSuccess: () => {
        setDiscountForm(createDefaultDiscountForm());
        setDiscountView("list");
        toast.success("Discount added for this customer");
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to add discount");
      },
    });
  };

  const handleDeleteDiscount = (discountId: string) => {
    deleteCustomerDiscountMutation.mutate(discountId, {
      onSuccess: () => {
        toast.success("Discount removed");
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to delete discount");
      },
    });
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download invoice");
    }
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomerIds((current) =>
      current.includes(customerId)
        ? current.filter((id) => id !== customerId)
        : [...current, customerId],
    );
  };

  const toggleVisibleCustomers = (checked: boolean) => {
    const visibleCustomerIds = filteredRows.map(({ customer }) => customer._id);

    setSelectedCustomerIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...visibleCustomerIds]));
      }

      return current.filter((id) => !visibleCustomerIds.includes(id));
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-5 p-4 font-poppins md:p-8">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse border-b border-slate-200 last:border-b-0 dark:border-slate-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center font-poppins">
        <h2 className="text-xl font-bold text-red-500">
          Failed to load customers
        </h2>
        <p className="text-slate-500">
          Please check your connection or login again.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Customers",
      value: customers.length,
      helper: "All time",
      icon: Users,
      color: "text-lime-600",
      bg: "bg-lime-50",
    },
    {
      label: "Total Invoices",
      value: invoices.length,
      helper: `${formatCurrency(totalSpent)} tracked`,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "This Month",
      value: thisMonthInvoices,
      helper: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Repeat Customers",
      value: repeatCustomers,
      helper: `${customers.length ? Math.round((repeatCustomers / customers.length) * 100) : 0}% of total`,
      icon: UserCheck,
      color: "text-fuchsia-600",
      bg: "bg-fuchsia-50",
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 font-poppins md:p-8 dark:bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">
            Manage your customers, view invoices and customer details
          </p>
        </div>

        <Button
          onClick={handleAdd}
          className="h-10 rounded-lg bg-[#84CC16] px-5 text-xs font-black text-white shadow-sm hover:bg-[#76b813] lg:self-start"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-card"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg} ${stat.color} dark:bg-slate-800`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {stat.helper}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-card xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-950 dark:text-white">
            Customer List
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            {filteredRows.length} customer{filteredRows.length !== 1 && "s"}{" "}
            showing
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {selectedCustomerIds.length > 0 && (
            <Button
              type="button"
              onClick={handleOpenBulkEmail}
              className="h-10 rounded-lg bg-[#84CC16] px-4 text-xs font-black text-white hover:bg-[#76b813]"
            >
              <Send className="h-4 w-4" />
              Send Email ({selectedCustomerIds.length})
            </Button>
          )}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customers by name, email, phone..."
              className="h-10 w-full rounded-lg border border-slate-100 bg-slate-50 pl-11 pr-4 text-xs font-bold outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-slate-100 px-4 text-xs font-black text-slate-600 dark:border-slate-700"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-slate-100 text-slate-500 dark:border-slate-700"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredRows.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-card"
        >
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label="Select all customers"
                    checked={allVisibleSelected}
                    onChange={(event) =>
                      toggleVisibleCustomers(event.target.checked)
                    }
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Customer
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Contact
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Invoices
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Last Invoice
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Total Spent
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map(
                ({
                  customer,
                  invoices: customerInvoices,
                  lastInvoice,
                  totalSpent,
                }) => (
                  <TableRow
                    key={customer._id}
                    className="border-slate-100 hover:bg-slate-50/70 dark:border-slate-700/70 dark:hover:bg-slate-800/60"
                  >
                    <TableCell className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label={`Select ${customer.firstName} ${customer.lastName}`}
                        checked={selectedCustomerIds.includes(customer._id)}
                        onChange={() => toggleCustomerSelection(customer._id)}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex min-w-52 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                          {getInitial(customer)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="block max-w-56 truncate text-left text-sm font-black text-slate-950 underline-offset-4 hover:text-[#84CC16] hover:underline dark:text-white"
                          >
                            {customer.firstName} {customer.lastName}
                          </button>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">
                              {customer.customerId || "No ID"}
                            </span>
                            {customer.paymentType && (
                              <span className="rounded-full bg-lime-50 px-2 py-0.5 text-[10px] font-black uppercase text-lime-700">
                                {customer.paymentType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="max-w-72 space-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <p className="truncate">{customer.email || "N/A"}</p>
                        <p className="truncate">{customer.phone || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {customerInvoices.length}
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        Total invoices
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {formatDate(lastInvoice?.createdAt)}
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        {lastInvoice ? lastInvoice.type : "No invoices"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="text-sm font-black text-slate-950 dark:text-white">
                        {formatCurrency(totalSpent)}
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        {customerInvoices.length} invoice
                        {customerInvoices.length !== 1 && "s"}
                      </p>
                    </TableCell>
                    <TableCell
                      className="px-4 py-3 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                          className="h-8 rounded-lg border-lime-100 px-3 text-xs font-black text-[#84CC16] hover:bg-lime-50"
                        >
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 text-slate-400 transition hover:bg-slate-50 hover:text-foreground dark:border-slate-700 dark:hover:bg-slate-800">
                              <MoreVertical size={15} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-xl border-slate-100 p-2 shadow-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => handleOpenEmail(customer)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg p-2.5 text-xs font-bold"
                            >
                              <Send size={14} />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleOpenDiscounts(customer, "list")
                              }
                              className="flex cursor-pointer items-center gap-2 rounded-lg p-2.5 text-xs font-bold"
                            >
                              <BadgePercent size={14} />
                              See Discounts
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSelectedCustomer(customer)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg p-2.5 text-xs font-bold"
                            >
                              <FileText size={14} />
                              View Invoices
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(customer)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg p-2.5 text-xs font-bold"
                            >
                              <Edit2 size={14} />
                              Customer Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(customer)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg p-2.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                            >
                              <Trash2 size={14} />
                              Delete Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-24 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            No customers found
          </h3>
          <p className="mt-2 text-sm font-bold text-slate-500">
            {searchQuery
              ? "We couldn't find any customers matching your search."
              : "You haven't added any customers yet."}
          </p>
        </div>
      )}

      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
      />

      <Dialog
        open={emailRecipients.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setEmailRecipients([]);
            setEmailForm(createDefaultEmailForm());
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-50 text-[#84CC16] dark:bg-lime-500/10">
                <Mail size={18} />
              </span>
              Send Email
            </DialogTitle>
          </DialogHeader>

          {emailRecipients.length > 0 && (
            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-sm font-black text-slate-950 dark:text-white">
                  Sending to {emailRecipients.length} customer
                  {emailRecipients.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-3 max-h-32 space-y-2 overflow-y-auto">
                  {emailRecipients.map((recipient) => (
                    <div
                      key={recipient._id}
                      className="rounded-xl bg-white px-3 py-2 dark:bg-slate-900/60"
                    >
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {recipient.firstName} {recipient.lastName}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {recipient.email || "No email"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Recipient Email
                </span>
                <input
                  type="email"
                  value={selectedCustomersWithEmail
                    .map((customer) => customer.email)
                    .filter(Boolean)
                    .join(", ")}
                  readOnly
                  placeholder="No email available"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-bold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Subject
                </span>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(event) =>
                    setEmailForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  placeholder="Enter email subject"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Description
                </span>
                <textarea
                  value={emailForm.description}
                  onChange={(event) =>
                    setEmailForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={7}
                  placeholder="Write your message..."
                  className="mt-2 min-h-36 w-full resize-y rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-bold leading-relaxed outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-700 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg text-xs font-black"
                  onClick={() => {
                    setEmailRecipients([]);
                    setEmailForm(createDefaultEmailForm());
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitEmail}
                  disabled={
                    !emailRecipients.some((customer) =>
                      Boolean(customer.email),
                    ) || sendCustomerEmailMutation.isPending
                  }
                  className="rounded-lg bg-[#84CC16] text-xs font-black text-white hover:bg-[#76b813] disabled:opacity-60"
                >
                  {sendCustomerEmailMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!discountCustomer}
        onOpenChange={(open) => {
          if (!open) setDiscountCustomer(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl p-0 sm:max-w-4xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-50 text-[#84CC16] dark:bg-lime-500/10">
                <BadgePercent size={18} />
              </span>
              Customer Discounts
            </DialogTitle>
          </DialogHeader>

          {discountCustomer && (
            <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-6">
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    {discountCustomer.firstName} {discountCustomer.lastName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {discountCustomer.email || "No email"} •{" "}
                    {discountCustomer.phone || "No phone"}
                  </p>
                </div>
                <div className="flex rounded-lg border border-slate-100 bg-white p-1 dark:border-slate-700 dark:bg-card">
                  <button
                    type="button"
                    onClick={() => setDiscountView("add")}
                    className={`h-8 rounded-md px-3 text-xs font-black transition ${
                      discountView === "add"
                        ? "bg-[#84CC16] text-white"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Add Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountView("list")}
                    className={`h-8 rounded-md px-3 text-xs font-black transition ${
                      discountView === "list"
                        ? "bg-[#84CC16] text-white"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    See Discounts ({selectedDiscounts.length})
                  </button>
                </div>
              </div>

              {discountView === "add" ? (
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div className="rounded-2xl border border-slate-100 p-5 dark:border-slate-700">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Discount Name
                        </span>
                        <input
                          type="text"
                          value={discountForm.title}
                          onChange={(event) =>
                            setDiscountForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="mt-2 h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder="VIP customer discount"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Percentage
                        </span>
                        <div className="relative mt-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={discountForm.percentage}
                            onChange={(event) =>
                              setDiscountForm((current) => ({
                                ...current,
                                percentage: event.target.value,
                              }))
                            }
                            className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 pr-9 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                            %
                          </span>
                        </div>
                      </label>

                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Usage Limit
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={discountForm.usageLimit}
                          onChange={(event) =>
                            setDiscountForm((current) => ({
                              ...current,
                              usageLimit: event.target.value,
                            }))
                          }
                          className="mt-2 h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Valid From
                        </span>
                        <input
                          type="date"
                          value={discountForm.validFrom}
                          onChange={(event) =>
                            setDiscountForm((current) => ({
                              ...current,
                              validFrom: event.target.value,
                            }))
                          }
                          className="mt-2 h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Valid Until
                        </span>
                        <input
                          type="date"
                          value={discountForm.validUntil}
                          onChange={(event) =>
                            setDiscountForm((current) => ({
                              ...current,
                              validUntil: event.target.value,
                            }))
                          }
                          className="mt-2 h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-[#84CC16] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </label>

                      <label className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={discountForm.trackUsage}
                          onChange={(event) =>
                            setDiscountForm((current) => ({
                              ...current,
                              trackUsage: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span>
                          <span className="block text-sm font-black text-slate-900 dark:text-white">
                            Track usages
                          </span>
                          <span className="block text-xs font-semibold text-slate-500">
                            Keep count each time this customer uses the
                            discount.
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg text-xs font-black"
                        onClick={() =>
                          setDiscountForm(createDefaultDiscountForm())
                        }
                      >
                        Reset
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddDiscount}
                        className="rounded-lg bg-[#84CC16] text-xs font-black text-white hover:bg-[#76b813]"
                      >
                        <BadgePercent className="h-4 w-4" />
                        Add Discount
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-lime-100 bg-lime-50 p-5 dark:border-lime-500/20 dark:bg-lime-500/10">
                    <p className="text-xs font-black uppercase tracking-wider text-lime-700 dark:text-lime-300">
                      Preview
                    </p>
                    <p className="mt-4 text-4xl font-black text-lime-700 dark:text-lime-300">
                      {discountForm.percentage || 0}%
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">
                      {discountForm.title || "Customer Discount"}
                    </p>
                    <div className="mt-5 space-y-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-2">
                        <History className="h-4 w-4 text-lime-600" />
                        Limit: {discountForm.usageLimit || 0} use
                        {discountForm.usageLimit === "1" ? "" : "s"}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-lime-600" />
                        {formatDate(discountForm.validFrom)} -{" "}
                        {formatDate(discountForm.validUntil)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : selectedDiscounts.length > 0 ? (
                <div className="space-y-3">
                  {selectedDiscounts.map((discount) => {
                    const isUsedUp = discount.usedCount >= discount.usageLimit;
                    const isExpired = todayDate
                      ? discount.validUntil < todayDate
                      : false;

                    return (
                      <div
                        key={discount.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-card"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime-50 text-lg font-black text-lime-700 dark:bg-lime-500/10 dark:text-lime-300">
                              {discount.percentage}%
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-950 dark:text-white">
                                {discount.title}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                Valid {formatDate(discount.validFrom)} -{" "}
                                {formatDate(discount.validUntil)}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  Used {discount.usedCount}/
                                  {discount.usageLimit}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                                    isExpired || isUsedUp
                                      ? "bg-red-50 text-red-600"
                                      : "bg-lime-50 text-lime-700"
                                  }`}
                                >
                                  {isExpired
                                    ? "Expired"
                                    : isUsedUp
                                      ? "Limit reached"
                                      : "Active"}
                                </span>
                                {discount.trackUsage && (
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                                    Tracking enabled
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDiscount(discount.id)}
                              className="rounded-lg text-xs font-black text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-800/50">
                  <BadgePercent className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    No discounts added yet
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Create a customer-specific discount from Add Discount.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setDiscountView("add")}
                    className="mt-4 rounded-lg bg-[#84CC16] text-xs font-black text-white hover:bg-[#76b813]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Discount
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedCustomer}
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl p-0 sm:max-w-5xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-50 text-[#84CC16] dark:bg-lime-500/10">
                <UserCheck size={18} />
              </span>
              Customer Details
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Name
                  </span>
                  <p className="mt-1 text-base font-black text-slate-900 dark:text-white">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    ID: {selectedCustomer.customerId || "N/A"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Email
                  </span>
                  <p className="mt-1 break-all text-sm font-bold text-slate-700 dark:text-slate-200">
                    {selectedCustomer.email || "No email"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Phone
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {selectedCustomer.phone || "No phone"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Already Paid
                  </span>
                  <p className="mt-1 text-base font-black text-[#84CC16]">
                    {formatCurrency(selectedCustomer.alreadyPaid || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700 md:col-span-2 xl:col-span-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Address
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {selectedCustomer.address || "No address"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Payment Type
                  </span>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-black capitalize text-slate-900 dark:text-white">
                    <CreditCard className="h-4 w-4 text-[#84CC16]" />
                    {selectedCustomer.paymentType || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#84CC16]" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Invoice History
                    </h3>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Total: {selectedCustomerInvoices.length}
                  </span>
                </div>

                {isInvoicesLoading ? (
                  <div className="flex h-32 items-center justify-center gap-2 text-sm font-bold text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading invoices...
                  </div>
                ) : selectedCustomerInvoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-white dark:bg-card">
                        <TableRow>
                          <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500">
                            Invoice ID
                          </TableHead>
                          <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500">
                            Type
                          </TableHead>
                          <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500">
                            Date
                          </TableHead>
                          <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500">
                            Payment
                          </TableHead>
                          <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500">
                            Amount
                          </TableHead>
                          <TableHead className="px-5 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomerInvoices.map((invoice) => (
                          <TableRow key={invoice._id}>
                            <TableCell className="px-5 py-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                              {invoice.invoiceNumber ||
                                `INV-${invoice._id.slice(-8).toUpperCase()}`}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                                {invoice.type || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-sm font-bold text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {formatDate(invoice.createdAt)}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="min-w-36">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-700">
                                    {invoice.paymentMethod || "Not recorded"}
                                  </span>
                                  {invoice.paymentStatus && (
                                    <span
                                      className={`text-[10px] font-black uppercase ${
                                        invoice.paymentStatus === "paid"
                                          ? "text-lime-600"
                                          : "text-orange-600"
                                      }`}
                                    >
                                      {invoice.paymentStatus}
                                    </span>
                                  )}
                                </div>
                                {getInvoicePaymentDetail(invoice) && (
                                  <p className="mt-1 max-w-60 break-words text-[10px] font-semibold text-slate-500">
                                    {getInvoicePaymentDetail(invoice)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <p className="text-sm font-black text-slate-900 dark:text-white">
                                {formatInvoiceAmount(
                                  invoice.totalAmount,
                                  invoice.currency,
                                )}
                              </p>
                              {!!invoice.dueAmount && invoice.dueAmount > 0 && (
                                <p className="mt-1 text-[10px] font-black text-orange-600">
                                  Due{" "}
                                  {formatInvoiceAmount(
                                    invoice.dueAmount,
                                    invoice.currency,
                                  )}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl text-xs font-bold"
                                  onClick={() =>
                                    window.open(
                                      invoice.invoice.url,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="rounded-xl text-xs font-bold"
                                  onClick={() =>
                                    handleDownload(
                                      invoice.invoice.url,
                                      `${invoice.invoiceNumber || `invoice_${invoice._id.slice(-6)}`}.pdf`,
                                    )
                                  }
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center text-center">
                    <FileText className="mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-bold text-slate-500">
                      No invoices found for this customer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

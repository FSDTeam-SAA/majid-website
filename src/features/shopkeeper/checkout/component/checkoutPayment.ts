export type CheckoutPaymentMethod = "cash" | "card" | "bank" | "due";
export type CheckoutPaymentStatus = "paid" | "partial" | "due";

export interface CheckoutPaymentForm {
  method: CheckoutPaymentMethod | null;
  amountReceived: string;
  cardholderName: string;
  cardLastFour: string;
  bankName: string;
  accountLastFour: string;
  transactionReference: string;
  amountPaid: string;
  dueDate: string;
  notes: string;
}

export interface CheckoutPaymentResult {
  method: CheckoutPaymentMethod;
  status: CheckoutPaymentStatus;
  amountPaid: number;
  dueAmount: number;
  details: Record<string, string | number | undefined>;
}

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const createCheckoutPaymentForm = (
  total: number,
): CheckoutPaymentForm => ({
  method: null,
  amountReceived: total.toFixed(2),
  cardholderName: "",
  cardLastFour: "",
  bankName: "",
  accountLastFour: "",
  transactionReference: "",
  amountPaid: "0.00",
  dueDate: "",
  notes: "",
});

export const getPaymentMethodLabel = (
  method?: CheckoutPaymentMethod | string | null,
) => {
  switch (method) {
    case "cash":
      return "Cash";
    case "card":
      return "Card";
    case "bank":
      return "Bank Transfer";
    case "due":
      return "Pay Later / Due";
    default:
      return method || "Not recorded";
  }
};

export interface ValidateCheckoutPaymentOptions {
  amountPaidForToday?: number;
  totalReceived?: number;
  allocations?: Array<{ invoiceId: string; amountApplied: number }>;
  allowPartial?: boolean;
}

export const validateCheckoutPayment = (
  form: CheckoutPaymentForm,
  total: number,
  options?: ValidateCheckoutPaymentOptions,
): { error?: string; payment?: CheckoutPaymentResult } => {
  if (!form.method) {
    return { error: "Select how the customer is paying" };
  }

  const normalizedTotal = roundMoney(total);

  if (form.method === "cash") {
    const amountReceived = Number(form.amountReceived);

    if (!Number.isFinite(amountReceived) || amountReceived < 0) {
      return {
        error: "Enter a valid amount received",
      };
    }

    if (!options?.allowPartial && amountReceived < normalizedTotal) {
      return {
        error: "Cash received must be equal to or greater than the total",
      };
    }

    const todayPaid =
      options?.amountPaidForToday !== undefined
        ? roundMoney(
            Math.min(normalizedTotal, Math.max(0, options.amountPaidForToday)),
          )
        : roundMoney(Math.min(normalizedTotal, amountReceived));
    const dueAmount = roundMoney(Math.max(0, normalizedTotal - todayPaid));
    const status: CheckoutPaymentStatus =
      dueAmount <= 0 ? "paid" : todayPaid > 0 ? "partial" : "due";

    return {
      payment: {
        method: "cash",
        status,
        amountPaid: todayPaid,
        dueAmount,
        details: {
          amountReceived: roundMoney(amountReceived),
          changeGiven: roundMoney(
            Math.max(
              0,
              amountReceived - (options?.totalReceived ?? normalizedTotal),
            ),
          ),
          notes: form.notes.trim() || undefined,
        },
      },
    };
  }

  if (form.method === "card") {
    if (!/^\d{4}$/.test(form.cardLastFour)) {
      return { error: "Enter the card's last 4 digits" };
    }

    if (!form.transactionReference.trim()) {
      return { error: "Card transaction reference is required" };
    }

    const todayPaid =
      options?.amountPaidForToday !== undefined
        ? roundMoney(
            Math.min(normalizedTotal, Math.max(0, options.amountPaidForToday)),
          )
        : normalizedTotal;
    const dueAmount = roundMoney(Math.max(0, normalizedTotal - todayPaid));
    const status: CheckoutPaymentStatus =
      dueAmount <= 0 ? "paid" : todayPaid > 0 ? "partial" : "due";

    return {
      payment: {
        method: "card",
        status,
        amountPaid: todayPaid,
        dueAmount,
        details: {
          cardholderName: form.cardholderName.trim() || undefined,
          cardLastFour: form.cardLastFour,
          transactionReference: form.transactionReference.trim(),
          notes: form.notes.trim() || undefined,
        },
      },
    };
  }

  if (form.method === "bank") {
    if (!form.bankName.trim()) {
      return { error: "Bank name is required" };
    }

    if (form.accountLastFour && !/^\d{4}$/.test(form.accountLastFour.trim())) {
      return { error: "Bank account last 4 must contain exactly 4 digits" };
    }

    if (!form.transactionReference.trim()) {
      return { error: "Bank transfer reference is required" };
    }

    const todayPaid =
      options?.amountPaidForToday !== undefined
        ? roundMoney(
            Math.min(normalizedTotal, Math.max(0, options.amountPaidForToday)),
          )
        : normalizedTotal;
    const dueAmount = roundMoney(Math.max(0, normalizedTotal - todayPaid));
    const status: CheckoutPaymentStatus =
      dueAmount <= 0 ? "paid" : todayPaid > 0 ? "partial" : "due";

    return {
      payment: {
        method: "bank",
        status,
        amountPaid: todayPaid,
        dueAmount,
        details: {
          bankName: form.bankName.trim(),
          accountLastFour: form.accountLastFour.trim() || undefined,
          transactionReference: form.transactionReference.trim(),
          notes: form.notes.trim() || undefined,
        },
      },
    };
  }

  const amountPaid = roundMoney(Number(form.amountPaid));

  if (!Number.isFinite(amountPaid) || amountPaid < 0) {
    return { error: "Amount paid must be zero or more" };
  }

  if (amountPaid >= normalizedTotal) {
    return {
      error: "Use Cash, Card, or Bank when the full amount is being paid",
    };
  }

  if (!form.dueDate) {
    return { error: "Due date is required for a due payment" };
  }

  const dueAmount = roundMoney(normalizedTotal - amountPaid);

  return {
    payment: {
      method: "due",
      status: amountPaid > 0 ? "partial" : "due",
      amountPaid,
      dueAmount,
      details: {
        amountPaid,
        dueAmount,
        dueDate: form.dueDate,
        notes: form.notes.trim() || undefined,
      },
    },
  };
};

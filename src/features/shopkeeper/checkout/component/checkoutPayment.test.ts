import {
  createCheckoutPaymentForm,
  validateCheckoutPayment,
} from "./checkoutPayment";
import { buildThermalReceiptHtml } from "./thermalReceipt";

describe("checkout payment", () => {
  it("calculates cash change", () => {
    const form = {
      ...createCheckoutPaymentForm(350),
      method: "cash" as const,
      amountReceived: "400",
    };

    expect(validateCheckoutPayment(form, 350).payment).toMatchObject({
      method: "cash",
      status: "paid",
      amountPaid: 350,
      dueAmount: 0,
      details: {
        amountReceived: 400,
        changeGiven: 50,
      },
    });
  });

  it("records a partial due payment and remaining balance", () => {
    const form = {
      ...createCheckoutPaymentForm(350),
      method: "due" as const,
      amountPaid: "100",
      dueDate: "2026-08-15",
    };

    expect(validateCheckoutPayment(form, 350).payment).toMatchObject({
      method: "due",
      status: "partial",
      amountPaid: 100,
      dueAmount: 250,
      details: {
        dueDate: "2026-08-15",
      },
    });
  });

  it("requires safe card reference information", () => {
    const form = {
      ...createCheckoutPaymentForm(350),
      method: "card" as const,
      cardLastFour: "12",
      transactionReference: "",
    };

    expect(validateCheckoutPayment(form, 350).error).toBe(
      "Enter the card's last 4 digits",
    );
  });
});

describe("thermal receipt", () => {
  it("renders a 58mm receipt and escapes customer-provided text", () => {
    const html = buildThermalReceiptHtml({
      invoiceNumber: "INV-000125",
      createdAt: new Date("2026-07-14T21:07:00Z"),
      shopName: "Eclat Tech",
      customerName: "<script>alert(1)</script>",
      items: [
        {
          name: "USB-C Charger 20W",
          quantity: 2,
          originalPrice: 20,
          sellingPrice: 15,
        },
      ],
      subtotalBeforeDiscount: 40,
      discount: 10,
      total: 30,
      currency: "GBP",
      payment: {
        method: "cash",
        status: "paid",
        amountPaid: 30,
        dueAmount: 0,
        details: {
          amountReceived: 40,
          changeGiven: 10,
        },
      },
    });

    expect(html).toContain("@page { size: 58mm auto");
    expect(html).toContain("USB-C Charger 20W");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("Payment Method:");
  });
});

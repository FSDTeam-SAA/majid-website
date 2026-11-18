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
      logoUrl: "https://cdn.example.com/eclat-tech-logo.png",
      cashierName: "Ada Lovelace",
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
    expect(html).toContain('src="https://cdn.example.com/eclat-tech-logo.png"');
    expect(html).toContain("Served by:");
    expect(html).not.toContain("Cashier:");
  });

  it("renders device identifiers (IMEI, Serial, UPC/EAN) directly beneath item name", () => {
    const html = buildThermalReceiptHtml({
      invoiceNumber: "INV-20261116-140706",
      createdAt: new Date("2026-11-16T18:02:00Z"),
      shopName: "Mobile Kit Distribution",
      cashierName: "Muhammad MAJID",
      customerName: "Mobilise",
      items: [
        {
          name: "Bell Apple iPhone 17 Pro Max",
          quantity: 1,
          originalPrice: 799,
          sellingPrice: 620,
          imei: "357035755150302",
          serial: "F2LZX12345",
          upcEan: "195949012345",
        },
      ],
      subtotalBeforeDiscount: 799,
      discount: 179,
      total: 620,
      currency: "GBP",
      payment: {
        method: "cash",
        status: "paid",
        amountPaid: 620,
        dueAmount: 0,
        details: {
          amountReceived: 620,
          changeGiven: 0,
        },
      },
    });

    expect(html).toContain("Bell Apple iPhone 17 Pro Max");
    expect(html).toContain("IMEI: <b>357035755150302</b>");
    expect(html).toContain("Serial: <b>F2LZX12345</b>");
    expect(html).toContain("UPC/EAN: <b>195949012345</b>");
  });
});

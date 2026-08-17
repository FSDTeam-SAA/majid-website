import {
  CheckoutPaymentResult,
  getPaymentMethodLabel,
} from "./checkoutPayment";

export interface ThermalReceiptItem {
  name: string;
  quantity: number;
  originalPrice: number;
  sellingPrice: number;
}

export interface ThermalReceiptPayload {
  invoiceNumber: string;
  createdAt: Date;
  shopName: string;
  logoUrl?: string;
  logoSettings?: {
    zoom?: number;
    x?: number;
    y?: number;
    fit?: "contain" | "cover" | "fill" | "none";
    backgroundColor?: string;
  };
  shopAddress?: string;
  shopPhone?: string;
  cashierName?: string;
  customerName?: string;
  orderNumber?: string;
  items: ThermalReceiptItem[];
  subtotalBeforeDiscount: number;
  discount: number;
  total: number;
  currency: string;
  payment: CheckoutPaymentResult;
  website?: string;
}

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatMoney = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

const buildBarcode = (value: string) => {
  const encoded = `*${value.toUpperCase().replace(/[^A-Z0-9-]/g, "")}*`;
  const bars: string[] = [];

  for (const [characterIndex, character] of Array.from(encoded).entries()) {
    const code = character.charCodeAt(0);

    for (let bit = 0; bit < 4; bit += 1) {
      const isWide = ((code >> bit) & 1) === 1;
      const isTall = (characterIndex + bit) % 4 !== 0;
      bars.push(
        `<i style="width:${isWide ? 1.5 : 0.7}px;height:${isTall ? 34 : 28}px"></i>`,
      );
    }
  }

  return `<div class="barcode" aria-label="Receipt reference ${escapeHtml(value)}">${bars.join("")}</div>`;
};

const buildPaymentDetails = (
  payment: CheckoutPaymentResult,
  currency: string,
) => {
  const details = payment.details;
  const rows: string[] = [];

  if (payment.method === "cash") {
    rows.push(
      `<div><span>Cash received</span><b>${escapeHtml(
        formatMoney(Number(details.amountReceived || 0), currency),
      )}</b></div>`,
      `<div><span>Change</span><b>${escapeHtml(
        formatMoney(Number(details.changeGiven || 0), currency),
      )}</b></div>`,
    );
  }

  if (payment.method === "card") {
    rows.push(
      `<div><span>Card</span><b>•••• ${escapeHtml(details.cardLastFour)}</b></div>`,
      `<div><span>Reference</span><b>${escapeHtml(details.transactionReference)}</b></div>`,
    );
  }

  if (payment.method === "bank") {
    rows.push(
      `<div><span>Bank</span><b>${escapeHtml(details.bankName)}</b></div>`,
      `<div><span>Reference</span><b>${escapeHtml(details.transactionReference)}</b></div>`,
    );
  }

  if (payment.method === "due") {
    rows.push(
      `<div><span>Paid now</span><b>${escapeHtml(
        formatMoney(payment.amountPaid, currency),
      )}</b></div>`,
      `<div><span>Balance due</span><b>${escapeHtml(
        formatMoney(payment.dueAmount, currency),
      )}</b></div>`,
      `<div><span>Due date</span><b>${escapeHtml(details.dueDate)}</b></div>`,
    );
  }

  return rows.join("");
};

export const buildThermalReceiptHtml = (payload: ThermalReceiptPayload) => {
  const date = payload.createdAt.toLocaleDateString("en-GB");
  const time = payload.createdAt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const itemRows = payload.items
    .map((item) => {
      const originalLineTotal = item.originalPrice * item.quantity;
      const lineTotal = item.sellingPrice * item.quantity;
      const discountPercentage =
        originalLineTotal > 0
          ? Math.max(
              0,
              ((originalLineTotal - lineTotal) / originalLineTotal) * 100,
            )
          : 0;

      return `
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-row">
          <span>${escapeHtml(item.quantity)}</span>
          <span>${escapeHtml(formatMoney(item.sellingPrice, payload.currency))}</span>
          <span>${discountPercentage.toFixed(1)}%</span>
          <b>${escapeHtml(formatMoney(lineTotal, payload.currency))}</b>
        </div>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(payload.invoiceNumber)} receipt</title>
    <style>
      @page { size: 58mm auto; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #050505; }
      body {
        width: 58mm;
        padding: 3mm 2.5mm 5mm;
        font-family: "Courier New", Courier, monospace;
        font-size: 9px;
        line-height: 1.32;
      }
      .center { text-align: center; }
      .brand {
        margin: 0 0 2px;
        color: #101010;
        font-family: Arial, sans-serif;
        font-size: 19px;
        font-weight: 900;
        letter-spacing: -1px;
      }
      .logo {
        display: block;
        width: auto;
        max-width: 47mm;
        max-height: 12mm;
        margin: 0 auto 3px;
        object-fit: contain;
      }
      .brand .mark { color: #84cc16; }
      .shop { margin-top: 5px; font-size: 11px; font-weight: 900; }
      .muted { color: #333; }
      .rule { overflow: hidden; margin: 7px 0; white-space: nowrap; }
      .rule::before { content: "------------------------------------------------"; }
      .meta div, .totals div, .payment div {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
      }
      .meta span, .payment span { white-space: nowrap; }
      .meta b, .payment b { text-align: right; overflow-wrap: anywhere; }
      .table-head, .item-row {
        display: grid;
        grid-template-columns: 26px 1fr 37px 1fr;
        gap: 3px;
        align-items: end;
      }
      .table-head { font-weight: 900; }
      .item-heading { margin-bottom: 1px; font-weight: 900; }
      .table-head span:not(:first-child), .item-row span:not(:first-child),
      .item-row b { text-align: right; }
      .item-name { margin-top: 6px; font-weight: 900; overflow-wrap: anywhere; }
      .totals { font-size: 9.5px; }
      .totals .grand { margin-top: 4px; font-size: 12px; font-weight: 900; }
      .totals .grand b { color: #5d950b; }
      .payment { margin-top: 7px; }
      .thanks { margin: 10px 0 7px; font-weight: 900; }
      .barcode {
        height: 36px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        gap: .7px;
        overflow: hidden;
      }
      .barcode i { display: block; flex: 0 0 auto; background: #000; }
      .reference { margin-top: 2px; font-size: 8px; letter-spacing: 1px; }
      @media screen {
        body { margin: 12px auto; box-shadow: 0 5px 28px rgba(0,0,0,.16); }
      }
      @media print {
        body { box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <header class="center">
      ${
        payload.logoUrl
          ? (() => {
              const zoom = payload.logoSettings?.zoom ?? 1;
              const x = payload.logoSettings?.x ?? 0;
              const y = payload.logoSettings?.y ?? 0;
              const fit = payload.logoSettings?.fit ?? "contain";
              const bg =
                payload.logoSettings?.backgroundColor &&
                payload.logoSettings.backgroundColor !== "transparent"
                  ? `background-color: ${escapeHtml(payload.logoSettings.backgroundColor)};`
                  : "";
              return `
                <div class="logo-wrapper" style="width: auto; max-width: 48mm; max-height: 16mm; overflow: hidden; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px; border-radius: 4px; ${bg}">
                  <img class="logo" src="${escapeHtml(payload.logoUrl)}" alt="${escapeHtml(payload.shopName)}" style="display: block; max-width: 100%; max-height: 100%; object-fit: ${escapeHtml(fit)}; transform: translate(${x}%, ${y}%) scale(${zoom});" onerror="this.closest('.logo-wrapper').style.display='none';var b=this.closest('header').querySelector('.brand');if(b)b.style.display='block';" />
                </div>
              `;
            })()
          : ""
      }
      <div class="brand"${payload.logoUrl ? ' style="display:none"' : ""}>imo<span class="mark">scan✓</span></div>
      <div class="shop">${escapeHtml(payload.shopName)}</div>
      ${payload.shopAddress ? `<div class="muted">${escapeHtml(payload.shopAddress)}</div>` : ""}
      ${payload.shopPhone ? `<div class="muted">Tel: ${escapeHtml(payload.shopPhone)}</div>` : ""}
    </header>

    <div class="rule"></div>
    <section class="meta">
      <div><span>Receipt #:</span><b>${escapeHtml(payload.invoiceNumber)}</b></div>
      <div><span>Date:</span><b>${escapeHtml(date)}</b></div>
      <div><span>Time:</span><b>${escapeHtml(time)}</b></div>
      <div><span>Served by:</span><b>${escapeHtml(payload.cashierName || "Shopkeeper")}</b></div>
    </section>

    <div class="rule"></div>
    <section class="meta">
      <div><span>Customer:</span><b>${escapeHtml(payload.customerName || "Walk-in Customer")}</b></div>
      <div><span>Order #:</span><b>${escapeHtml(payload.orderNumber || payload.invoiceNumber)}</b></div>
    </section>

    <div class="rule"></div>
    <div class="item-heading">Item</div>
    <div class="table-head">
      <span>Qty</span><span>Price</span><span>Disc%</span><span>Total</span>
    </div>
    ${itemRows}

    <div class="rule"></div>
    <section class="totals">
      <div><span>Items Total (Before)</span><b>${escapeHtml(
        formatMoney(payload.subtotalBeforeDiscount, payload.currency),
      )}</b></div>
      <div><span>Total Discount</span><b>-${escapeHtml(
        formatMoney(payload.discount, payload.currency),
      )}</b></div>
      <div class="grand"><span>Grand Total</span><b>${escapeHtml(
        formatMoney(payload.total, payload.currency),
      )}</b></div>
    </section>

    <section class="payment">
      <div><span>Payment Method:</span><b>${escapeHtml(
        getPaymentMethodLabel(payload.payment.method),
      )}</b></div>
      ${buildPaymentDetails(payload.payment, payload.currency)}
    </section>

    <div class="thanks center">Thank you for your business!</div>
    ${buildBarcode(payload.invoiceNumber)}
    <div class="reference center">${escapeHtml(payload.invoiceNumber)}</div>
    <div class="center muted">${escapeHtml(payload.website || "www.imoscan.com")}</div>
  </body>
</html>`;
};

export const openThermalReceiptWindow = () => {
  const receiptWindow = window.open(
    "",
    "_blank",
    "popup=yes,width=420,height=760",
  );

  if (receiptWindow) {
    receiptWindow.document.write(
      "<!doctype html><title>Preparing receipt…</title><p style='font-family:sans-serif;padding:24px'>Preparing receipt…</p>",
    );
  }

  return receiptWindow;
};

export const printThermalReceipt = (
  payload: ThermalReceiptPayload,
  receiptWindow: Window | null,
) => {
  const target =
    receiptWindow && !receiptWindow.closed
      ? receiptWindow
      : window.open("", "_blank", "popup=yes,width=420,height=760");

  if (!target) {
    return false;
  }

  try {
    target.document.open();
    target.document.write(buildThermalReceiptHtml(payload));
    target.document.close();
    target.focus();
    target.setTimeout(() => target.print(), 250);
  } catch {
    return false;
  }

  return true;
};

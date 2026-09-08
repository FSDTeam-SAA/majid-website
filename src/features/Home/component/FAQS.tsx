"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Search,
  ShieldCheck,
  Store,
  Wrench,
} from "lucide-react";

type Faq = { question: string; answer: string };
type Group = { title: string; icon: typeof Store; items: Faq[] };

const FAQ_GROUPS: Group[] = [
  {
    title: "About imoscan",
    icon: Store,
    items: [
      {
        question: "What is imoscan?",
        answer:
          "imoscan is an all-in-one retail-management platform for gadget stores, mobile-phone shops and repair centres. It brings together EPOS, inventory, repairs, trade-ins, invoices, IMEI checks, payments, staff management and reporting.",
      },
      {
        question: "Who can use imoscan?",
        answer:
          "imoscan is designed for gadget stores, electronics retailers, repair centres, device-buying and trade-in businesses, accessory shops and other inventory-based retailers.",
      },
      {
        question: "Can I manage more than one shop?",
        answer:
          "Yes. Multi-store businesses can manage authorised locations from one account and review sales, payments, expenses, stock, staff activity and overall performance.",
      },
      {
        question: "What devices can I use?",
        answer:
          "imoscan can be accessed on compatible computers, tablets and mobile devices. Android payment-terminal availability depends on the supported terminal and provider.",
      },
      {
        question: "Does imoscan require an internet connection?",
        answer:
          "Yes. A stable connection is required for account synchronisation, cloud services, device checks, card payments and other online features.",
      },
    ],
  },
  {
    title: "EPOS and inventory",
    icon: Store,
    items: [
      {
        question: "Does imoscan include an EPOS system?",
        answer:
          "Yes. EPOS tools can process sales, apply authorised discounts, link customers, record supported payment methods and produce invoices or receipts.",
      },
      {
        question: "Can I add products by scanning them?",
        answer:
          "Yes. Scan a barcode or IMEI, or search for a product. imoscan can suggest product details, specifications, images and buying or selling prices. You remain in control and must review every field before saving.",
      },
      {
        question: "Can imoscan manage inventory?",
        answer:
          "Yes. Authorised users can add, update, transfer and sell stock while monitoring quantities, purchase costs, selling prices, expected profit and low-stock levels.",
      },
      {
        question: "Can I transfer stock between stores?",
        answer:
          "Yes. Multi-store businesses can record transfers between authorised locations and maintain a clear transfer history.",
      },
    ],
  },
  {
    title: "IMEI, repairs and trade-ins",
    icon: Wrench,
    items: [
      {
        question: "What can an IMEI or serial-number check show?",
        answer:
          "Depending on the device and provider, a check may include blacklist status, lost-or-stolen reports, finance indicators, activation details, carrier information and device-management indicators.",
      },
      {
        question: "Are device-check results guaranteed?",
        answer:
          "No. Provider coverage and update times vary, and a device's status may change. Results should support—not replace—the shop's inspection, evidence and judgement.",
      },
      {
        question: "Can I manage repairs through imoscan?",
        answer:
          "Yes. A shop can manage a repair from booking to completion, including the fault, technician, condition, evidence photographs, parts, progress, payment and warranty information.",
      },
      {
        question: "Does imoscan support device trade-ins?",
        answer:
          "Yes. Shops can record the seller, device, IMEI or serial number, condition, agreed value, verification information and consent evidence.",
      },
      {
        question: "How long is an original ID image kept?",
        answer:
          "An original identity-document image can be deleted earlier by the shop and is automatically deleted no later than 28 days after capture. A separate transaction record may remain where there is a lawful reason to keep it.",
      },
    ],
  },
  {
    title: "Payments and reports",
    icon: Store,
    items: [
      {
        question: "Can imoscan accept card payments?",
        answer:
          "imoscan can connect with supported providers and terminals. Availability, pricing and approval depend on the provider's terms and merchant checks.",
      },
      {
        question: "Does imoscan store complete card details?",
        answer:
          "Complete card details are normally handled by the authorised payment provider. imoscan may receive limited transaction information, such as payment status, card type and last four digits.",
      },
      {
        question: "Can customers split a payment?",
        answer:
          "Where enabled, imoscan can record split payments using cash, card or other supported methods.",
      },
      {
        question: "What reports are available?",
        answer:
          "Depending on the plan and enabled features, reports may cover sales, transactions, cash, card payments, refunds, discounts, expenses, inventory performance and staff activity.",
      },
    ],
  },
  {
    title: "Privacy, security and support",
    icon: ShieldCheck,
    items: [
      {
        question: "Who controls information entered by a shop?",
        answer:
          "The shop normally controls its customer and business information. imoscan processes it to provide the Services and does not sell it or use shop customer records for its own marketing.",
      },
      {
        question: "How does imoscan protect information?",
        answer:
          "imoscan uses safeguards designed to protect information, including secure connections, controlled access, permissions, authentication and activity monitoring. Shops must also protect their devices, logins and staff access.",
      },
      {
        question: "Is customer information used to train public AI models?",
        answer:
          "No. imoscan does not use identifiable shop customer records to train public or general-purpose AI models.",
      },
      {
        question:
          "Can a customer request access to or deletion of information?",
        answer:
          "Yes. The customer should normally contact the shop that collected the information. Rights depend on the circumstances and legal retention duties; imoscan can assist with a valid request where required.",
      },
      {
        question: "How can I contact imoscan?",
        answer:
          "Use the website contact form, in-app support or email reports@imoscan.com.",
      },
    ],
  },
];

export default function FAQS() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const filteredGroups = useMemo(
    () =>
      FAQ_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.question} ${item.answer}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      })).filter((group) => group.items.length),
    [query],
  );

  return (
    <section className="min-h-screen bg-background px-4 pb-20 pt-28 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#84CC16]/30 bg-[#84CC16]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#84CC16]">
            <HelpCircle size={15} /> Help centre
          </span>
          <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Everything you need to know about imoscan, from stock and repairs to
            payments, privacy and support.
          </p>
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your question..."
              className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
            />
          </div>
        </div>
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.title}
                className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-7"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#84CC16]/10 text-[#84CC16]">
                    <Icon size={20} />
                  </span>
                  <h2 className="text-xl font-bold">{group.title}</h2>
                </div>
                <div className="divide-y divide-border/70">
                  {group.items.map((item) => {
                    const id = `${group.title}-${item.question}`;
                    const isOpen = open === id;
                    return (
                      <div key={id}>
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : id)}
                          className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold transition hover:text-[#84CC16] sm:text-base"
                        >
                          <span>{item.question}</span>
                          <ChevronDown
                            size={19}
                            className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180 text-[#84CC16]" : ""}`}
                          />
                        </button>
                        {isOpen && (
                          <p className="-mt-1 max-w-4xl pb-5 pr-8 text-sm leading-7 text-muted-foreground">
                            {item.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!filteredGroups.length && (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No matching questions found. Try another search.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

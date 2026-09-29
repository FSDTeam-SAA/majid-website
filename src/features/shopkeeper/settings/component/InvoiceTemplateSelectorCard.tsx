"use client";

import React, { useState } from "react";
import {
  Check,
  Eye,
  Loader2,
  Palette,
  FileText,
  BookmarkCheck,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import {
  useMyProfile,
  useUpdateProfile,
} from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  INVOICE_TEMPLATES,
  InvoiceTemplateDefinition,
  InvoiceTemplateCategory,
} from "@/features/shopkeeper/invoice/templates/templateConfig";
import { SalesInvoicePdfDocument } from "@/features/shopkeeper/invoice/templates/SalesInvoiceRenderer";
import { PurchaseInvoicePdfDocument } from "@/features/shopkeeper/invoice/templates/PurchaseInvoiceTemplateRenderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function InvoiceTemplateSelectorCard() {
  const { data: profileData } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const user = profileData?.data;

  const currentSavedTemplateId = user?.invoiceTemplate || "default";
  const [selectedCategory, setSelectedCategory] =
    useState<InvoiceTemplateCategory>("All");
  const [previewTemplate, setPreviewTemplate] =
    useState<InvoiceTemplateDefinition | null>(null);
  const [previewTab, setPreviewTab] = useState<"sales" | "purchase">("sales");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filter templates by category
  const filteredTemplates = INVOICE_TEMPLATES.filter(
    (tpl: InvoiceTemplateDefinition) => {
      if (selectedCategory === "All") return true;
      return tpl.category === selectedCategory;
    },
  );

  const handleSelectTemplate = async (templateId: string) => {
    const target = INVOICE_TEMPLATES.find(
      (t: InvoiceTemplateDefinition) => t.id === templateId,
    );
    try {
      await updateProfileMutation.mutateAsync({
        invoiceTemplate: templateId,
      });
      toast.success(
        `Invoice design updated to "${target?.name || templateId}"!`,
        {
          description:
            "This design will now automatically apply to your Sales and Purchase invoices.",
        },
      );
    } catch {
      toast.error("Failed to update invoice template. Please try again.");
    }
  };

  // Sample data for previewing template
  const sampleShopkeeper = {
    shopName: user?.shopName || "Mobile Kit Distribution",
    shopAddress: user?.shopAddress || "124 High Street, London, UK",
    phone: user?.phone || "+44 20 7946 0912",
    email: user?.email || "info@mobilekit.co.uk",
    logoSettings: user?.logoSettings,
    image: user?.image,
  };

  const sampleCustomer = {
    firstName: "Catherine",
    lastName: "Earnshaw",
    phone: "+44 7700 900145",
    email: "catherine.e@example.com",
    address: "74 Yorkshire Way, Leeds",
  };

  const sampleSalesItems = [
    {
      id: "item-1",
      name: "iPhone 17 Pro 256GB",
      imeiNumber: "123456789012345",
      quantity: 1,
      price: 850,
      storage: "256GB",
      color: "Space Gray",
      condition: "Brand New",
    },
    {
      id: "item-2",
      name: "Protective Silicone Case",
      quantity: 1,
      price: 20,
      storage: "",
      color: "Black",
      condition: "New",
    },
    {
      id: "item-3",
      name: "Premium Screen Protector",
      quantity: 1,
      price: 15,
      storage: "",
      color: "Clear",
      condition: "New",
    },
  ];

  const samplePurchaseItems = [
    {
      id: "p-1",
      name: "iPhone 16 Pro Max",
      model: "A3106",
      brand: "Apple",
      storage: "512GB",
      color: "Natural Titanium",
      quantity: 1,
      purchasePrice: 620,
      serials: ["F2LM90184719"],
    },
    {
      id: "p-2",
      name: "Samsung Galaxy S24 Ultra",
      model: "SM-S928B",
      brand: "Samsung",
      storage: "256GB",
      color: "Titanium Gray",
      quantity: 1,
      purchasePrice: 480,
      serials: ["358941298412411"],
    },
  ];

  const handleOpenPdfWindow = async (tpl: InvoiceTemplateDefinition) => {
    setIsGeneratingPdf(true);
    try {
      const doc =
        previewTab === "sales" ? (
          <SalesInvoicePdfDocument
            customer={sampleCustomer}
            items={sampleSalesItems}
            shopkeeper={sampleShopkeeper}
            total={885}
            alreadyPaid={885}
            dueAmount={0}
            paymentType="card"
            currency="GBP"
            templateId={tpl.id}
          />
        ) : (
          <PurchaseInvoicePdfDocument
            customer={sampleCustomer}
            items={samplePurchaseItems}
            shopkeeper={sampleShopkeeper}
            total={1100}
            currency="GBP"
            templateId={tpl.id}
          />
        );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      toast.error("Could not render preview PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Palette className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Invoice Template Designs
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select a predefined design for all Sales and Purchase invoices.
            Smart Invoices remain unchanged.
          </p>
        </div>

        {/* Category Filters */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
          {(["All", "Modern", "Traditional"] as InvoiceTemplateCategory[]).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {cat === "All" ? "All Designs" : cat}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((tpl: InvoiceTemplateDefinition) => {
          const isCurrentActive = currentSavedTemplateId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all ${
                isCurrentActive
                  ? "border-teal-500 bg-teal-50/20 ring-2 ring-teal-500/30 dark:border-teal-500 dark:bg-teal-950/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              }`}
            >
              {/* Card Top / Visual Representation */}
              <div className="p-5">
                {/* Header row in card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {tpl.name}
                      </h3>
                      {tpl.badge && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tpl.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        tpl.category === "Traditional"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                      }`}
                    >
                      {tpl.category}
                    </span>
                  </div>

                  {isCurrentActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      Active
                    </span>
                  ) : null}
                </div>

                {/* Mini Visual Preview Layout */}
                <div
                  className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-inner transition-transform group-hover:scale-[1.01] dark:border-slate-700"
                  style={{
                    backgroundColor: tpl.backgroundColor || "#FFFFFF",
                  }}
                >
                  {/* Mini Header Bar */}
                  <div
                    className="flex h-7 items-center justify-between rounded px-2"
                    style={{
                      backgroundColor:
                        tpl.headerColor || tpl.primaryColor || "#0F172A",
                      color:
                        tpl.id === "neo-bold"
                          ? "#000000"
                          : tpl.headerColor === "#FFFDEB"
                            ? "#0F172A"
                            : "#FFFFFF",
                    }}
                  >
                    <span className="text-[9px] font-bold truncate">
                      {tpl.id === "warm-minimal"
                        ? "MOBILE KIT"
                        : "STORE / LOGO"}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider">
                      INVOICE
                    </span>
                  </div>

                  {/* Mini Meta / Pill rows */}
                  <div className="mt-2 flex gap-1.5">
                    <div className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800" />
                    <div
                      className="h-3 w-1/3 rounded"
                      style={{
                        backgroundColor: tpl.accentColor || "#E2E8F0",
                        opacity: 0.6,
                      }}
                    />
                  </div>

                  {/* Mini Table Rows */}
                  <div className="mt-2 space-y-1">
                    <div
                      className="h-2 rounded"
                      style={{
                        backgroundColor: tpl.primaryColor || "#CBD5E1",
                        opacity: 0.25,
                      }}
                    />
                    <div className="h-2 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-2 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>

                  {/* Mini Total Band */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-1.5 dark:border-slate-700">
                    <span
                      className="rounded px-1.5 py-0.5 text-[8px] font-bold"
                      style={{
                        backgroundColor: tpl.accentColor || "#10B981",
                        color:
                          tpl.id === "neo-bold" ||
                          tpl.id === "nordic-modern" ||
                          tpl.id === "warm-minimal"
                            ? "#000000"
                            : "#FFFFFF",
                      }}
                    >
                      PAID
                    </span>
                    <span className="text-[10px] font-bold text-slate-800">
                      £885.00
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3.5 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                  {tpl.description}
                </p>

                {/* Color Swatches */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-slate-400">
                    Palette:
                  </span>
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: tpl.primaryColor }}
                    title={`Primary: ${tpl.primaryColor}`}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: tpl.accentColor }}
                    title={`Accent: ${tpl.accentColor}`}
                  />
                  {tpl.backgroundColor && (
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-xs"
                      style={{ backgroundColor: tpl.backgroundColor }}
                      title={`Background: ${tpl.backgroundColor}`}
                    />
                  )}
                </div>
              </div>

              {/* Actions Bottom Bar */}
              <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="flex-1 text-xs"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isCurrentActive || updateProfileMutation.isPending}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`flex-1 text-xs font-semibold ${
                    isCurrentActive
                      ? "bg-slate-200 text-slate-500 cursor-default hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Applied
                    </>
                  ) : updateProfileMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Apply Design"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Live Preview Modal */}
      <Dialog
        open={Boolean(previewTemplate)}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-2xl sm:max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {previewTemplate?.name}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      previewTemplate?.category === "Traditional"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    {previewTemplate?.category}
                  </span>
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  {previewTemplate?.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Mode Switcher: Sales Invoice vs Purchase Invoice */}
          <div className="mt-2 flex items-center justify-between border-b pb-3">
            <div className="inline-flex rounded-md bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setPreviewTab("sales")}
                className={`rounded px-3 py-1 text-xs font-semibold transition-all ${
                  previewTab === "sales"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                <FileText className="mr-1.5 inline-block h-3.5 w-3.5" />
                Sales Invoice Format
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("purchase")}
                className={`rounded px-3 py-1 text-xs font-semibold transition-all ${
                  previewTab === "purchase"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                <ShoppingBag className="mr-1.5 inline-block h-3.5 w-3.5" />
                Purchase Receipt Format
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isGeneratingPdf}
              onClick={() =>
                previewTemplate && handleOpenPdfWindow(previewTemplate)
              }
              className="text-xs"
            >
              {isGeneratingPdf ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="mr-1.5 h-3.5 w-3.5" />
              )}
              Open Full PDF
            </Button>
          </div>

          {/* Realistic Visual Preview Container */}
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div
              className="mx-auto max-w-xl rounded-lg border border-slate-300 p-6 shadow-md"
              style={{
                backgroundColor: previewTemplate?.backgroundColor || "#FFFFFF",
                fontFamily: previewTemplate?.fontFamily || "inherit",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between rounded p-3"
                style={{
                  backgroundColor:
                    previewTemplate?.headerColor ||
                    previewTemplate?.primaryColor ||
                    "#155E63",
                  color:
                    previewTemplate?.id === "neo-bold"
                      ? "#000000"
                      : previewTemplate?.headerColor === "#FFFDEB"
                        ? "#0F172A"
                        : "#FFFFFF",
                }}
              >
                <div>
                  <h4 className="text-base font-bold">
                    {sampleShopkeeper.shopName}
                  </h4>
                  <p className="text-[10px] opacity-80">
                    {sampleShopkeeper.shopAddress}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold uppercase tracking-wider">
                    {previewTab === "sales" ? "INVOICE" : "PURCHASE RECEIPT"}
                  </span>
                  <p className="text-[10px] opacity-80">No. MKD-2026-001</p>
                </div>
              </div>

              {/* Customer Strip */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded border border-slate-200 bg-white/70 p-2.5 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {previewTab === "sales" ? "BILL TO" : "PURCHASED FROM"}
                  </span>
                  <p className="font-bold text-slate-800">
                    {sampleCustomer.firstName} {sampleCustomer.lastName}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {sampleCustomer.phone}
                  </p>
                </div>

                <div className="rounded border border-slate-200 bg-white/70 p-2.5 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    DATE & PAYMENT
                  </span>
                  <p className="font-bold text-slate-800">
                    {new Date().toLocaleDateString("en-GB")}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Status:{" "}
                    <span className="font-semibold text-emerald-600">Paid</span>
                  </p>
                </div>
              </div>

              {/* Sample Table */}
              <div className="mt-4 overflow-hidden rounded border border-slate-200 dark:border-slate-700">
                <div
                  className="grid grid-cols-12 px-3 py-2 text-[11px] font-bold uppercase"
                  style={{
                    backgroundColor: previewTemplate?.primaryColor || "#0F172A",
                    color: "#FFFFFF",
                  }}
                >
                  <span className="col-span-1">Qty</span>
                  <span className="col-span-6">Description</span>
                  <span className="col-span-2 text-right">Unit</span>
                  <span className="col-span-3 text-right">Total</span>
                </div>

                {(previewTab === "sales"
                  ? sampleSalesItems
                  : samplePurchaseItems
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-center border-t border-slate-100 bg-white/80 px-3 py-2 text-xs text-slate-800"
                  >
                    <span className="col-span-1 font-semibold">1</span>
                    <span className="col-span-6 font-medium">{item.name}</span>
                    <span className="col-span-2 text-right text-slate-600">
                      £{"price" in item ? item.price : item.purchasePrice}
                    </span>
                    <span className="col-span-3 text-right font-bold">
                      £{"price" in item ? item.price : item.purchasePrice}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary Bar */}
              <div className="mt-4 flex items-center justify-between rounded p-2.5">
                <span
                  className="rounded px-2.5 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: previewTemplate?.accentColor || "#10B981",
                    color:
                      previewTemplate?.id === "neo-bold" ||
                      previewTemplate?.id === "nordic-modern" ||
                      previewTemplate?.id === "warm-minimal"
                        ? "#000000"
                        : "#FFFFFF",
                  }}
                >
                  PAID IN FULL
                </span>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Total: </span>
                  <span className="text-lg font-bold text-slate-900">
                    £{previewTab === "sales" ? "885.00" : "1,100.00"}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400">
                Thank you for choosing {sampleShopkeeper.shopName}.
              </div>
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {currentSavedTemplateId === previewTemplate?.id ? (
                <span className="font-semibold text-teal-600">
                  ✓ Currently active template
                </span>
              ) : (
                "Click apply to set this as your default invoice template"
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={
                  currentSavedTemplateId === previewTemplate?.id ||
                  updateProfileMutation.isPending
                }
                onClick={async () => {
                  if (previewTemplate) {
                    await handleSelectTemplate(previewTemplate.id);
                    setPreviewTemplate(null);
                  }
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                {currentSavedTemplateId === previewTemplate?.id ? (
                  "Applied"
                ) : updateProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save as Preferred Template"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

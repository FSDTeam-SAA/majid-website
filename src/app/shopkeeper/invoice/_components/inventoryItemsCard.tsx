/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  ScanLine,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { BrowserMultiFormatReader } from "@zxing/library";
import { createWorker } from "tesseract.js";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCategories,
  useCreateInventory,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useCurrency } from "@/hooks/useCurrency";

const emptyInventoryItem = {
  name: "",
  storage: "",
  color: "",
  condition: "",
  quantity: 1,
  // Keep this empty so a user can enter a price without a forced leading zero.
  expectedPrice: "",
  serials: [] as string[],
};

export function InventoryItemsCard({
  shopkeeperId,
}: {
  shopkeeperId?: string;
}) {
  const { currency, formatCurrency } = useCurrency();
  const { data: categoriesData } = useCategories();
  const { mutateAsync: createInventory, isPending: isCreatingInventory } =
    useCreateInventory();

  const [items, setItems] = useState<any[]>([{ ...emptyInventoryItem }]);
  const [scanInputs, setScanInputs] = useState<{ [key: number]: string }>({});
  const [isParsingFile, setIsParsingFile] = useState<{
    [key: number]: boolean;
  }>({});
  const [activeCameraStream, setActiveCameraStream] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      codeReaderRef.current?.reset();
    };
  }, []);

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyInventoryItem, serials: [] }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    if (activeCameraStream[index]) {
      stopCameraScanning(index);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const updatePrimarySerial = (itemIndex: number, value: string) => {
    const trimmedValue = value.trim();

    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;

        const nextSerials = [...item.serials];

        if (trimmedValue) {
          nextSerials[0] = trimmedValue;
        } else if (nextSerials.length > 0) {
          nextSerials.shift();
        }

        return {
          ...item,
          serials: nextSerials,
          quantity:
            nextSerials.length > Number(item.quantity || 1)
              ? nextSerials.length
              : item.quantity,
        };
      }),
    );
  };

  const appendSerial = (itemIndex: number, code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;

        if (item.serials.includes(trimmedCode)) {
          toast.error(`Code "${trimmedCode}" already exists inside item list.`);
          return item;
        }

        const serials = [...item.serials, trimmedCode];
        return {
          ...item,
          serials,
          quantity:
            serials.length > Number(item.quantity || 1)
              ? serials.length
              : item.quantity,
        };
      }),
    );
    toast.success(`Code "${trimmedCode}" appended smoothly to stack!`);
  };

  const handleScanKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemIndex: number,
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    appendSerial(itemIndex, scanInputs[itemIndex] || "");
    setScanInputs((prev) => ({ ...prev, [itemIndex]: "" }));
  };

  const removeSerial = (itemIndex: number, serialIndex: number) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              serials: item.serials.filter(
                (_: string, currentIndex: number) =>
                  currentIndex !== serialIndex,
              ),
            }
          : item,
      ),
    );
  };

  const startCameraScanning = async (itemIndex: number) => {
    if (!codeReaderRef.current) return;

    setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: true }));
    toast.loading("Accessing media devices hardware...", {
      id: `invoice-cam-${itemIndex}`,
    });

    setTimeout(async () => {
      try {
        const videoElement = videoRefs.current[itemIndex];
        if (!videoElement) throw new Error("Video node element missing");

        codeReaderRef.current?.decodeFromVideoDevice(
          null,
          videoElement,
          (result, error) => {
            if (result) {
              const matchedCodeText = result.getText()?.trim();
              if (matchedCodeText) {
                appendSerial(itemIndex, matchedCodeText);
                stopCameraScanning(itemIndex);
              }
            }
            if (error && error.name !== "NotFoundException") {
              console.debug("ZXing processing frame tick error:", error);
            }
          },
        );
        toast.dismiss(`invoice-cam-${itemIndex}`);
        toast.success("Camera viewfinder active.");
      } catch {
        toast.dismiss(`invoice-cam-${itemIndex}`);
        toast.error("Failed to connect camera.");
        setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: false }));
      }
    }, 300);
  };

  const stopCameraScanning = (itemIndex: number) => {
    codeReaderRef.current?.reset();
    setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: false }));
  };

  const toggleCameraScanner = (itemIndex: number) => {
    if (activeCameraStream[itemIndex]) {
      stopCameraScanning(itemIndex);
      return;
    }

    items.forEach((_, index) => {
      if (activeCameraStream[index]) stopCameraScanning(index);
    });
    startCameraScanning(itemIndex);
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile((prev) => ({ ...prev, [itemIndex]: true }));
    const loadingToastId = toast.loading(
      `Reading item document asset "${file.name}"...`,
    );

    try {
      const imageUrl = URL.createObjectURL(file);

      try {
        const zxingResult =
          await codeReaderRef.current?.decodeFromImageUrl(imageUrl);
        const zxingText = zxingResult?.getText()?.trim();
        if (zxingText) {
          appendSerial(itemIndex, zxingText);
          toast.dismiss(loadingToastId);
          setIsParsingFile((prev) => ({ ...prev, [itemIndex]: false }));
          if (fileInputRefs.current[itemIndex]) {
            fileInputRefs.current[itemIndex]!.value = "";
          }
          URL.revokeObjectURL(imageUrl);
          return;
        }
      } catch (error) {
        console.debug("Fallback to Tesseract raw engine loop.", error);
      }

      const worker = await createWorker("eng");
      const ret = await worker.recognize(imageUrl);
      const fullExtractedRawText = ret.data.text;
      await worker.terminate();

      URL.revokeObjectURL(imageUrl);
      const parsedMatchArray = fullExtractedRawText.match(/[A-Z0-9]{8,18}/g);

      if (parsedMatchArray && parsedMatchArray.length > 0) {
        appendSerial(itemIndex, parsedMatchArray[0]);
        toast.dismiss(loadingToastId);
      } else {
        toast.dismiss(loadingToastId);
        toast.error("Failed to extract legible codes.");
      }
    } catch {
      toast.dismiss(loadingToastId);
      toast.error("Engine failed processing targets matrix layout.");
    } finally {
      setIsParsingFile((prev) => ({ ...prev, [itemIndex]: false }));
      if (fileInputRefs.current[itemIndex]) {
        fileInputRefs.current[itemIndex]!.value = "";
      }
    }
  };

  const total = useMemo(
    () =>
      items.reduce(
        (acc, item) =>
          acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1),
        0,
      ),
    [items],
  );

  const isFormValid = useMemo(() => {
    return (
      !!selectedCategoryId &&
      items.length > 0 &&
      items.every((item) => item.name && item.serials.length > 0)
    );
  }, [items, selectedCategoryId]);

  const handleAddToInventory = async () => {
    if (!selectedCategoryId) {
      toast.error("Please select a category name");
      return;
    }

    if (!isFormValid) {
      toast.error(
        "Please add item name and at least one barcode/serial for every item",
      );
      return;
    }

    try {
      await Promise.all(
        items.map((item) =>
          createInventory({
            itemName: item.name,
            color: item.color || undefined,
            storage: item.storage || undefined,
            imeiNumber: item.serials?.join(", ") || undefined,
            quantity: Number(item.quantity || 1),
            purchasePrice: Number(item.expectedPrice || 0),
            expectedPrice: Number(item.expectedPrice || 0),
            productDetails: item.serials?.length
              ? `Serials: ${item.serials.join(", ")}`
              : undefined,
            categoryId: selectedCategoryId,
            type: "inventory",
            status: "inventory",
            currentState:
              item.condition?.toLowerCase() === "good condition"
                ? "good condition"
                : "new",
            userId: shopkeeperId || "",
          }),
        ),
      );

      toast.success("Items added to inventory successfully");
      setItems([{ ...emptyInventoryItem, serials: [] }]);
      setScanInputs({});
    } catch {
      toast.error("Failed to add items to inventory");
    }
  };

  return (
    <Card className="rounded-[28px] border-0 shadow-sm">
      <CardContent className="p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black">Items</h2>
            <p className="text-sm text-muted-foreground">
              Add missing invoice devices directly into inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-2xl border bg-background px-4 py-2 text-sm font-bold">
              <Package size={16} />
              {items.length} Items
            </div>
            <Button onClick={addItem} className="rounded-2xl">
              <Plus size={16} className="mr-2" /> Add Item
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="invoice-inventory-category"
            className="ml-1 text-sm font-bold text-muted-foreground"
          >
            Category Name
          </Label>
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger
              id="invoice-inventory-category"
              className="h-12 w-full rounded-2xl border-primary bg-background font-bold"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoriesData?.data?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-5">
          {items.map((item, itemIndex) => {
            const currentItemRowTotal =
              Number(item.expectedPrice || 0) * Number(item.quantity || 1);

            return (
              <div
                key={itemIndex}
                className="border rounded-3xl p-6 bg-muted/20 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black">
                      Device #{itemIndex + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Specification logging state control
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-2xl"
                    onClick={() => removeItem(itemIndex)}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    placeholder="Item Name (Required)"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(itemIndex, "name", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Storage / Memory (e.g., 256GB)"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={item.storage || ""}
                    onChange={(e) =>
                      updateItem(itemIndex, "storage", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Color"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={item.color || ""}
                    onChange={(e) =>
                      updateItem(itemIndex, "color", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Condition"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={item.condition || ""}
                    onChange={(e) =>
                      updateItem(itemIndex, "condition", e.target.value)
                    }
                  />
                  <Input
                    placeholder="IMEI Number or Serial Number"
                    className="rounded-2xl h-12 border-primary bg-background font-bold md:col-span-2"
                    value={item.serials[0] || ""}
                    onChange={(e) =>
                      updatePrimarySerial(itemIndex, e.target.value)
                    }
                  />
                  <div>
                    <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min={1}
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          itemIndex,
                          "quantity",
                          Math.max(1, Number(e.target.value)),
                        )
                      }
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
                      value={item.expectedPrice ?? ""}
                      onChange={(e) =>
                        updateItem(itemIndex, "expectedPrice", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    Item Calculation Subtotal:
                  </span>
                  <span className="text-lg font-black text-primary font-mono">
                    {formatCurrency(currentItemRowTotal, currency)}
                  </span>
                </div>

                {item.name ? (
                  <div className="border-t pt-5 border-dashed border-muted-foreground/40 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-black text-foreground flex items-center gap-2">
                          <ScanLine className="w-5 h-5 text-primary" />
                          Universal Processing Scanner Hub
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Type + Enter, engage active web camera tracking, or
                          drop attachment image.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <Button
                          type="button"
                          variant={
                            activeCameraStream[itemIndex]
                              ? "default"
                              : "outline"
                          }
                          className="rounded-xl h-9 text-xs font-bold gap-1.5"
                          onClick={() => toggleCameraScanner(itemIndex)}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {activeCameraStream[itemIndex]
                            ? "Close Camera"
                            : "Open Camera Stream"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl h-9 text-xs font-bold gap-1.5"
                          disabled={isParsingFile[itemIndex]}
                          onClick={() =>
                            fileInputRefs.current[itemIndex]?.click()
                          }
                        >
                          {isParsingFile[itemIndex] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          Attach Receipt/Image
                        </Button>
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[itemIndex] = el;
                          }}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleAttachmentUpload(e, itemIndex)}
                        />
                      </div>
                    </div>

                    {activeCameraStream[itemIndex] && (
                      <div className="relative w-full h-56 rounded-2xl bg-black border border-primary overflow-hidden flex flex-col items-center justify-center">
                        <video
                          ref={(el) => {
                            videoRefs.current[itemIndex] = el;
                          }}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-64 h-36 border-2 border-dashed border-primary rounded-xl relative flex items-center justify-center bg-black/10">
                            <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] absolute top-1/2 left-0 animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <Input
                        className="rounded-2xl h-12 pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
                        placeholder="Scan/Type code here and press Enter..."
                        value={scanInputs[itemIndex] || ""}
                        onChange={(e) =>
                          setScanInputs((prev) => ({
                            ...prev,
                            [itemIndex]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => handleScanKeyDown(e, itemIndex)}
                      />
                      <div className="absolute left-4 top-3.5 text-muted-foreground">
                        <ScanLine className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          Active Registers Log:
                        </span>
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                          {item.serials.length} Stored Ledger Nodes
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border rounded-2xl bg-background/50">
                        {item.serials.length === 0 && (
                          <p className="text-xs text-muted-foreground/60 italic p-1">
                            No identifiers cached inside streaming log grid yet.
                          </p>
                        )}
                        {item.serials.map(
                          (serial: string, serialIndex: number) => (
                            <div
                              key={serialIndex}
                              className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border px-3 py-1.5 rounded-xl group transition-all"
                            >
                              <span className="text-muted-foreground">
                                #{serialIndex + 1}:
                              </span>
                              <span className="text-foreground tracking-tight">
                                {serial}
                              </span>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                                onClick={() =>
                                  removeSerial(itemIndex, serialIndex)
                                }
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 border border-dashed rounded-2xl bg-zinc-50/50">
                    <p className="text-xs text-muted-foreground/80 font-bold">
                      Please define the baseline Item Name first to unlock
                      advanced tools.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 border-t pt-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
              Inventory Add Total
            </p>
            <p className="text-2xl font-black text-primary font-mono">
              {formatCurrency(total, currency)}
            </p>
          </div>
          <Button
            disabled={!isFormValid || isCreatingInventory}
            onClick={handleAddToInventory}
            className="h-14 rounded-2xl text-sm font-black uppercase tracking-wider"
          >
            Add To Inventory
            {isCreatingInventory && <Loader2 className="ml-2 animate-spin" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

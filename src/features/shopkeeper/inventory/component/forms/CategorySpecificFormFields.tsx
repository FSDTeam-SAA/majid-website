"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface CategoryFormAttributes {
  // Common / Phone / Tablet
  color?: string;
  storage?: string;
  screenSize?: string;
  batteryHealth?: string;
  condition?: string;
  connectivity?: "Wi-Fi" | "Cellular";
  imeiNumber?: string;
  serialNumber?: string;

  // Laptops
  processor?: string;
  ram?: string;
  gpu?: string;

  // Consoles & Games
  gamingItemType?: "Console" | "Game";
  edition?: string;
  platform?: string;
  includedAccessories?: string;

  // Accessories Subtypes
  accessorySubtype?:
    "Smart watches" | "Earphones" | "Headphones" | "Cables" | "Chargers";
  watchItemType?: "Smart watch" | "Watch case" | "Watch strap";
  strapType?: string;
  watchSize?: string;
  compatibleWatchModel?: string;
  audioConnection?: "Wireless" | "Wired" | "Both";
  wiredConnector?: string;
  audioCompatibility?: string;
  cableType?: string;
  cableLength?: string;
  cableMaterial?: string;
  maxWatts?: string;
  chargerType?: "Home" | "Car";
  portType?: "USB-C" | "USB-A" | "Mixed";
  numberOfPorts?: number | string;

  // Care
  careSubtype?: "Screen protectors" | "Camera protectors" | "Protective cases";
  forDevice?: "Phone" | "Tablet" | "Laptop";
  compatibleBrand?: string;
  fitsModel?: string;
  careMaterial?: string;
  careFinish?: string;

  // Vapes
  vapeType?: "Vape device" | "Pod" | "Coil" | "E-liquid" | "Accessory";
  flavour?: string;
  nicotineStrength?: string;
  nicotineType?: string;
  vgPgRatio?: string;
  bottleVolume?: string;
  podCapacity?: string;
  coilResistance?: string;

  // Toys
  toyType?: string;
  modelOrSetNumber?: string;

  // Cameras & Drones
  cameraProductType?: "Body" | "Kit" | "Lens" | "Accessory";
  cameraType?: string;
  lensIncluded?: "Yes" | "No";
  lensModel?: string;
  lensMount?: string;
  focalLength?: string;
  maxAperture?: string;
  shutterCount?: string;
  droneProductType?:
    | "Drone"
    | "Kit"
    | "Battery"
    | "Controller"
    | "Propellers"
    | "Other accessory";
  dronePackage?: string;
  controllerIncluded?: "Yes" | "No";
  batteriesCount?: string | number;
  flightHours?: string;
  batteryCondition?: string;

  // Health & Beauty
  beautyProductType?:
    | "Skincare"
    | "Haircare"
    | "Makeup"
    | "Fragrance"
    | "Grooming device"
    | "Beauty device"
    | "Accessory";
  periodAfterOpening?: string;
  packagingCondition?: "Sealed" | "Open" | "Damaged";
  beautyForm?: string;
  beautyVolume?: string;
  beautySkinOrHairType?: string;
  shadeCode?: string;
  fragranceConcentration?: string;
  powerSource?: string;

  // Speakers
  speakerType?: string;
  audioConnections?: string[];
  powerOption?: "Mains" | "Rechargeable battery" | "Both";
  includedItems?: string[];
  ratedOutputWatts?: string;

  // Packs & Batches
  stockUnit?: "single" | "pack";
  itemsPerPack?: number;
  batchNumber?: string;
  expiryDate?: string;
}

interface CategorySpecificFormFieldsProps {
  categoryKey?: string;
  categoryName?: string;
  values: CategoryFormAttributes;
  onChange: (field: keyof CategoryFormAttributes, value: unknown) => void;
}

export function CategorySpecificFormFields({
  categoryKey = "",
  categoryName = "",
  values,
  onChange,
}: CategorySpecificFormFieldsProps) {
  const normKey = (categoryKey || categoryName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const isPhone = normKey.includes("phone");
  const isTablet = normKey.includes("tablet") || normKey.includes("ipad");
  const isLaptop = normKey.includes("laptop") || normKey.includes("macbook");
  const isMacBook = normKey.includes("macbook");
  const isGaming = normKey.includes("gaming") || normKey.includes("console");
  const isAccessories = normKey.includes("accessor");
  const isCare =
    normKey.includes("care") ||
    normKey.includes("protector") ||
    normKey.includes("case");
  const isVapes = normKey.includes("vape");
  const isToys = normKey.includes("toy");
  const isCameras = normKey.includes("camera") && !normKey.includes("drone");
  const isDrones = normKey.includes("drone");
  const isHealthBeauty =
    normKey.includes("health") || normKey.includes("beauty");
  const isSpeakers = normKey.includes("speaker");

  // ─── 1. PHONES (iPhones & Android) ──────────────────────────────────────────
  if (isPhone) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Colour
          </Label>
          <Input
            placeholder="e.g. Space Black, Titanium Gray, Pink"
            value={values.color || ""}
            onChange={(e) => onChange("color", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Storage
          </Label>
          <Select
            value={values.storage || "128 GB"}
            onValueChange={(val) => onChange("storage", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue placeholder="Select storage" />
            </SelectTrigger>
            <SelectContent>
              {["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Battery health (%){" "}
            <span className="text-slate-400 font-normal">(or Unknown)</span>
          </Label>
          <Input
            placeholder="e.g. 98 or Unknown"
            value={values.batteryHealth || ""}
            onChange={(e) => onChange("batteryHealth", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Physical Condition
          </Label>
          <Select
            value={values.condition || "Like New"}
            onValueChange={(val) => onChange("condition", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {["Brand New", "Like New", "Excellent", "Good", "Fair"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 md:col-span-2">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            IMEI Number <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="15-digit IMEI number"
            value={values.imeiNumber || ""}
            onChange={(e) => onChange("imeiNumber", e.target.value)}
            className="mt-1 h-11 rounded-xl font-mono text-xs"
          />
        </div>
      </div>
    );
  }

  // ─── 2. TABLETS (iPads & Android Tablets) ──────────────────────────────────
  if (isTablet) {
    const isCellular = values.connectivity === "Cellular";
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Connectivity
          </Label>
          <div className="flex gap-3 mt-1.5">
            {(["Wi-Fi", "Cellular"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange("connectivity", type)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  (values.connectivity || "Wi-Fi") === type
                    ? "border-[#84CC16] bg-[#84CC16]/10 text-slate-900 dark:text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Storage
          </Label>
          <Select
            value={values.storage || "128 GB"}
            onValueChange={(val) => onChange("storage", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue placeholder="Select storage" />
            </SelectTrigger>
            <SelectContent>
              {["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Screen size
          </Label>
          <Input
            placeholder="e.g. 11-inch, 12.9-inch"
            value={values.screenSize || ""}
            onChange={(e) => onChange("screenSize", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Colour
          </Label>
          <Input
            placeholder="e.g. Space Gray, Silver, Starlight"
            value={values.color || ""}
            onChange={(e) => onChange("color", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Condition
          </Label>
          <Select
            value={values.condition || "Like New"}
            onValueChange={(val) => onChange("condition", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {["Brand New", "Like New", "Excellent", "Good", "Fair"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Serial number
          </Label>
          <Input
            placeholder="Device serial number"
            value={values.serialNumber || ""}
            onChange={(e) => onChange("serialNumber", e.target.value)}
            className="mt-1 h-11 rounded-xl font-mono text-xs"
          />
        </div>

        {isCellular && (
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              IMEI (Cellular Model)
            </Label>
            <Input
              placeholder="15-digit IMEI"
              value={values.imeiNumber || ""}
              onChange={(e) => onChange("imeiNumber", e.target.value)}
              className="mt-1 h-11 rounded-xl font-mono text-xs"
            />
          </div>
        )}
      </div>
    );
  }

  // ─── 3. LAPTOPS (Windows & MacBooks) ─────────────────────────────────────────
  if (isLaptop) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isMacBook ? "Apple chip / Processor" : "Processor (CPU)"}
          </Label>
          <Input
            placeholder={
              isMacBook
                ? "e.g. M3 Pro, M2, M1"
                : "e.g. Intel Core i7-13700H, Ryzen 7"
            }
            value={values.processor || ""}
            onChange={(e) => onChange("processor", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isMacBook ? "Unified memory (RAM)" : "Installed RAM"}
          </Label>
          <Select
            value={values.ram || "16 GB"}
            onValueChange={(val) => onChange("ram", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue placeholder="Select RAM" />
            </SelectTrigger>
            <SelectContent>
              {["8 GB", "16 GB", "24 GB", "32 GB", "64 GB", "128 GB"].map(
                (r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Storage (SSD)
          </Label>
          <Select
            value={values.storage || "512 GB SSD"}
            onValueChange={(val) => onChange("storage", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue placeholder="Select storage" />
            </SelectTrigger>
            <SelectContent>
              {[
                "256 GB SSD",
                "512 GB SSD",
                "1 TB SSD",
                "2 TB SSD",
                "4 TB SSD",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            GPU
          </Label>
          <Input
            placeholder={
              isMacBook
                ? "Integrated 14-core GPU / Apple Silicon"
                : "e.g. RTX 4070, Integrated, Iris Xe"
            }
            value={values.gpu || ""}
            onChange={(e) => onChange("gpu", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Screen size
          </Label>
          <Input
            placeholder="e.g. 14.2-inch, 15.6-inch, 16-inch"
            value={values.screenSize || ""}
            onChange={(e) => onChange("screenSize", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Colour
          </Label>
          <Input
            placeholder="e.g. Space Black, Silver, Midnight"
            value={values.color || ""}
            onChange={(e) => onChange("color", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Condition
          </Label>
          <Select
            value={values.condition || "Like New"}
            onValueChange={(val) => onChange("condition", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {["Brand New", "Like New", "Excellent", "Good", "Fair"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Serial number
          </Label>
          <Input
            placeholder="Serial number on bottom chassis"
            value={values.serialNumber || ""}
            onChange={(e) => onChange("serialNumber", e.target.value)}
            className="mt-1 h-11 rounded-xl font-mono text-xs"
          />
        </div>
      </div>
    );
  }

  // ─── 4. GAMING CONSOLES & GAMES ────────────────────────────────────────────
  if (isGaming) {
    const isGame = values.gamingItemType === "Game";
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Gaming Item Type
          </Label>
          <div className="flex gap-3 mt-1.5">
            {(["Console", "Game"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange("gamingItemType", t)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  (values.gamingItemType || "Console") === t
                    ? "border-[#84CC16] bg-[#84CC16]/10 text-slate-900 dark:text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {isGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Platform
              </Label>
              <Select
                value={values.platform || "PlayStation 5"}
                onValueChange={(val) => onChange("platform", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "PlayStation 5",
                    "PlayStation 4",
                    "Xbox Series X/S",
                    "Xbox One",
                    "Nintendo Switch",
                    "PC",
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Edition
              </Label>
              <Input
                placeholder="e.g. Standard, Deluxe, Collector's"
                value={values.edition || ""}
                onChange={(e) => onChange("edition", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Console Edition / Type
              </Label>
              <Input
                placeholder="e.g. Disc Edition, Digital Edition, Slim, OLED"
                value={values.edition || ""}
                onChange={(e) => onChange("edition", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Internal Storage
              </Label>
              <Input
                placeholder="e.g. 825 GB, 1 TB, 2 TB"
                value={values.storage || ""}
                onChange={(e) => onChange("storage", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Condition
              </Label>
              <Select
                value={values.condition || "Like New"}
                onValueChange={(val) => onChange("condition", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {["Brand New", "Like New", "Excellent", "Good", "Fair"].map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Serial number
              </Label>
              <Input
                placeholder="Console serial number"
                value={values.serialNumber || ""}
                onChange={(e) => onChange("serialNumber", e.target.value)}
                className="mt-1 h-11 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── 5. ACCESSORIES SUBTYPES ──────────────────────────────────────────────
  if (isAccessories) {
    const sub = values.accessorySubtype || "Smart watches";
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Accessory Subtype
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1.5">
            {(
              [
                "Smart watches",
                "Earphones",
                "Headphones",
                "Cables",
                "Chargers",
              ] as const
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange("accessorySubtype", t)}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                  sub === t
                    ? "border-[#84CC16] bg-[#84CC16]/10 text-slate-900 dark:text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {sub === "Smart watches" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Watch Item Type
              </Label>
              <Select
                value={values.watchItemType || "Smart watch"}
                onValueChange={(val) => onChange("watchItemType", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Smart watch", "Watch case", "Watch strap"].map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Watch Size / Fit
              </Label>
              <Input
                placeholder="e.g. 41mm, 45mm, 49mm"
                value={values.watchSize || ""}
                onChange={(e) => onChange("watchSize", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            {values.watchItemType === "Watch strap" && (
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Strap Material
                </Label>
                <Select
                  value={values.strapType || "Silicone"}
                  onValueChange={(val) => onChange("strapType", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Silicone", "Braided", "Leather", "Metal"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Colour
              </Label>
              <Input
                placeholder="e.g. Midnight, Starlight"
                value={values.color || ""}
                onChange={(e) => onChange("color", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Serial number (Optional)
              </Label>
              <Input
                placeholder="Watch serial"
                value={values.serialNumber || ""}
                onChange={(e) => onChange("serialNumber", e.target.value)}
                className="mt-1 h-11 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        )}

        {(sub === "Earphones" || sub === "Headphones") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Connection
              </Label>
              <Select
                value={values.audioConnection || "Wireless"}
                onValueChange={(val) => onChange("audioConnection", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Wireless", "Wired", "Both"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {values.audioConnection === "Wired" && (
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Connector Type
                </Label>
                <Select
                  value={values.wiredConnector || "3.5 mm"}
                  onValueChange={(val) => onChange("wiredConnector", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["3.5 mm", "USB-C", "Lightning", "Other"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Colour
              </Label>
              <Input
                placeholder="e.g. White, Black, Silver"
                value={values.color || ""}
                onChange={(e) => onChange("color", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Compatibility
              </Label>
              <Input
                placeholder="e.g. Universal, iOS, Android"
                value={values.audioCompatibility || ""}
                onChange={(e) => onChange("audioCompatibility", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </div>
        )}

        {sub === "Cables" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cable Type
              </Label>
              <Select
                value={values.cableType || "USB-C to USB-C"}
                onValueChange={(val) => onChange("cableType", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "USB-C to USB-C",
                    "USB-C to Lightning",
                    "USB-A to USB-C",
                    "USB-A to Micro-USB",
                    "USB-A to Lightning",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Length
              </Label>
              <Input
                placeholder="e.g. 1m, 2m, 3m"
                value={values.cableLength || "1m"}
                onChange={(e) => onChange("cableLength", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Material
              </Label>
              <Select
                value={values.cableMaterial || "Braided"}
                onValueChange={(val) => onChange("cableMaterial", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Braided", "Silicone", "PVC"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Max Supported Watts
              </Label>
              <Input
                placeholder="e.g. 60W, 100W, 240W"
                value={values.maxWatts || ""}
                onChange={(e) => onChange("maxWatts", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </div>
        )}

        {sub === "Chargers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Charger Type
              </Label>
              <Select
                value={values.chargerType || "Home"}
                onValueChange={(val) => onChange("chargerType", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Home", "Car"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Port Type
              </Label>
              <Select
                value={values.portType || "USB-C"}
                onValueChange={(val) => onChange("portType", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["USB-C", "USB-A", "Mixed"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Number of Ports
              </Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={values.numberOfPorts || 1}
                onChange={(e) =>
                  onChange("numberOfPorts", Number(e.target.value))
                }
                className="mt-1 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Total Output (Watts)
              </Label>
              <Input
                placeholder="e.g. 20W, 30W, 65W, 100W"
                value={values.maxWatts || ""}
                onChange={(e) => onChange("maxWatts", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── 6. CARE (Protectors & Cases) ──────────────────────────────────────────
  if (isCare) {
    const sub = values.careSubtype || "Screen protectors";
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Care Product Type
          </Label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {(
              [
                "Screen protectors",
                "Camera protectors",
                "Protective cases",
              ] as const
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange("careSubtype", t)}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                  sub === t
                    ? "border-[#84CC16] bg-[#84CC16]/10 text-slate-900 dark:text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              For Device
            </Label>
            <Select
              value={values.forDevice || "Phone"}
              onValueChange={(val) => onChange("forDevice", val)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
                {sub === "Protective cases" && (
                  <SelectItem value="Laptop">Laptop</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Compatible Device Brand
            </Label>
            <Input
              placeholder="e.g. Apple, Samsung, Google"
              value={values.compatibleBrand || ""}
              onChange={(e) => onChange("compatibleBrand", e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Fits Model
            </Label>
            <Input
              placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra"
              value={values.fitsModel || ""}
              onChange={(e) => onChange("fitsModel", e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>

          {sub === "Screen protectors" && (
            <>
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Material
                </Label>
                <Select
                  value={values.careMaterial || "Tempered glass"}
                  onValueChange={(val) => onChange("careMaterial", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Tempered glass", "Film", "Hydrogel"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Finish
                </Label>
                <Select
                  value={values.careFinish || "Clear"}
                  onValueChange={(val) => onChange("careFinish", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Clear", "Privacy", "Matte"].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {sub === "Camera protectors" && (
            <>
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Type
                </Label>
                <Select
                  value={values.careMaterial || "Glass"}
                  onValueChange={(val) => onChange("careMaterial", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Glass", "Lens rings", "Other"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Finish
                </Label>
                <Select
                  value={values.careFinish || "Clear"}
                  onValueChange={(val) => onChange("careFinish", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Clear", "Coloured"].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {sub === "Protective cases" && (
            <>
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Material
                </Label>
                <Select
                  value={values.careMaterial || "Silicone"}
                  onValueChange={(val) => onChange("careMaterial", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Silicone", "TPU", "Hard shell", "Leather", "Other"].map(
                      (m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Colour
                </Label>
                <Input
                  placeholder="e.g. Clear, Matte Black"
                  value={values.color || ""}
                  onChange={(e) => onChange("color", e.target.value)}
                  className="mt-1 h-11 rounded-xl"
                />
              </div>
            </>
          )}

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Stock Unit
            </Label>
            <Select
              value={values.stockUnit || "single"}
              onValueChange={(val) => onChange("stockUnit", val)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="pack">Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {values.stockUnit === "pack" && (
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Items per pack
              </Label>
              <Input
                type="number"
                min={1}
                value={values.itemsPerPack || 1}
                onChange={(e) =>
                  onChange("itemsPerPack", Number(e.target.value))
                }
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── 7. VAPES ─────────────────────────────────────────────────────────────
  if (isVapes) {
    const sub = values.vapeType || "E-liquid";
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Vape Product Type
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1.5">
            {(
              ["Vape device", "Pod", "Coil", "E-liquid", "Accessory"] as const
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange("vapeType", t)}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                  sub === t
                    ? "border-[#84CC16] bg-[#84CC16]/10 text-slate-900 dark:text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sub === "E-liquid" && (
            <>
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Flavour
                </Label>
                <Input
                  placeholder="e.g. Blue Raspberry, Strawberry Ice"
                  value={values.flavour || ""}
                  onChange={(e) => onChange("flavour", e.target.value)}
                  className="mt-1 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nicotine Strength (mg/ml)
                </Label>
                <Select
                  value={values.nicotineStrength || "10 mg"}
                  onValueChange={(val) => onChange("nicotineStrength", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["0 mg", "3 mg", "6 mg", "10 mg", "20 mg"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bottle Volume (ml)
                </Label>
                <Input
                  placeholder="e.g. 10ml, 50ml, 100ml"
                  value={values.bottleVolume || "10ml"}
                  onChange={(e) => onChange("bottleVolume", e.target.value)}
                  className="mt-1 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  VG/PG Ratio
                </Label>
                <Select
                  value={values.vgPgRatio || "50/50"}
                  onValueChange={(val) => onChange("vgPgRatio", val)}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["50/50", "70/30", "80/20", "Other"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {sub === "Pod" && (
            <>
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pod Capacity (ml)
                </Label>
                <Input
                  placeholder="e.g. 2ml"
                  value={values.podCapacity || "2ml"}
                  onChange={(e) => onChange("podCapacity", e.target.value)}
                  className="mt-1 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Coil Resistance (ohms)
                </Label>
                <Input
                  placeholder="e.g. 0.8 ohm, 1.2 ohm"
                  value={values.coilResistance || ""}
                  onChange={(e) => onChange("coilResistance", e.target.value)}
                  className="mt-1 h-11 rounded-xl"
                />
              </div>
            </>
          )}

          {sub === "Coil" && (
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Resistance (ohms)
              </Label>
              <Input
                placeholder="e.g. 0.6 ohm, 0.8 ohm"
                value={values.coilResistance || ""}
                onChange={(e) => onChange("coilResistance", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Batch Number
            </Label>
            <Input
              placeholder="e.g. BR240501"
              value={values.batchNumber || ""}
              onChange={(e) => onChange("batchNumber", e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Expiry / Best-before date
            </Label>
            <Input
              type="date"
              value={values.expiryDate || ""}
              onChange={(e) => onChange("expiryDate", e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Stock Unit
            </Label>
            <Select
              value={values.stockUnit || "single"}
              onValueChange={(val) => onChange("stockUnit", val)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="pack">Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {values.stockUnit === "pack" && (
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Items per pack
              </Label>
              <Input
                type="number"
                min={1}
                value={values.itemsPerPack || 1}
                onChange={(e) =>
                  onChange("itemsPerPack", Number(e.target.value))
                }
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── 8. SPEAKERS ──────────────────────────────────────────────────────────
  if (isSpeakers) {
    const audioConns = values.audioConnections || ["Bluetooth"];
    const toggleAudio = (conn: string) => {
      const exists = audioConns.includes(conn);
      const updated = exists
        ? audioConns.filter((c) => c !== conn)
        : [...audioConns, conn];
      onChange("audioConnections", updated);
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Speaker Type
            </Label>
            <Select
              value={values.speakerType || "Portable"}
              onValueChange={(val) => onChange("speakerType", val)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Portable",
                  "Home",
                  "Smart speaker",
                  "Soundbar",
                  "Party",
                  "Other",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Connection Mode
            </Label>
            <Select
              value={values.audioConnection || "Wireless"}
              onValueChange={(val) => onChange("audioConnection", val)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Wireless", "Wired", "Both"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Power Source
            </Label>
            <Select
              value={values.powerOption || "Rechargeable battery"}
              onValueChange={(val) => onChange("powerOption", val)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Rechargeable battery", "Mains", "Both"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Rated Output (W)
            </Label>
            <Input
              placeholder="e.g. 30W, 50W, 100W"
              value={values.ratedOutputWatts || ""}
              onChange={(e) => onChange("ratedOutputWatts", e.target.value)}
              className="mt-1 h-11 rounded-xl"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Audio Connections
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {["Bluetooth", "Wi-Fi", "AUX", "USB audio", "Optical", "HDMI"].map(
              (conn) => {
                const checked = audioConns.includes(conn);
                return (
                  <button
                    key={conn}
                    type="button"
                    onClick={() => toggleAudio(conn)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                      checked
                        ? "border-[#84CC16] bg-[#84CC16]/10 text-slate-900 dark:text-white"
                        : "border-border bg-card text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {conn}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Condition
            </Label>
            <Select
              value={values.condition || "New"}
              onValueChange={(val) => onChange("condition", val)}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["New", "Like New", "Good condition", "Fair"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Serial number (Optional)
            </Label>
            <Input
              placeholder="Speaker serial"
              value={values.serialNumber || ""}
              onChange={(e) => onChange("serialNumber", e.target.value)}
              className="mt-1 h-11 rounded-xl font-mono text-xs"
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── 9. TOYS ──────────────────────────────────────────────────────────────
  if (isToys) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Toy Type
          </Label>
          <Input
            placeholder="e.g. Action figure, Building blocks, Plush"
            value={values.toyType || ""}
            onChange={(e) => onChange("toyType", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Model or Set Number
          </Label>
          <Input
            placeholder="e.g. Set #75192, Model A123"
            value={values.modelOrSetNumber || ""}
            onChange={(e) => onChange("modelOrSetNumber", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Colour or Variant
          </Label>
          <Input
            placeholder="e.g. Blue, Series 2"
            value={values.color || ""}
            onChange={(e) => onChange("color", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>
      </div>
    );
  }

  // ─── 10. CAMERAS & DRONES ─────────────────────────────────────────────────
  if (isCameras || isDrones) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isCameras && (
          <>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Type
              </Label>
              <Select
                value={values.cameraProductType || "Body"}
                onValueChange={(val) => onChange("cameraProductType", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Body", "Kit", "Lens", "Accessory"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Camera Type
              </Label>
              <Select
                value={values.cameraType || "Mirrorless"}
                onValueChange={(val) => onChange("cameraType", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Mirrorless",
                    "DSLR",
                    "Compact",
                    "Action",
                    "Instant",
                    "Other",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lens Mount
              </Label>
              <Input
                placeholder="e.g. Sony E-mount, Canon RF, Nikon Z"
                value={values.lensMount || ""}
                onChange={(e) => onChange("lensMount", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Shutter Count
              </Label>
              <Input
                placeholder="e.g. 15,200 or Unknown"
                value={values.shutterCount || ""}
                onChange={(e) => onChange("shutterCount", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </>
        )}

        {isDrones && (
          <>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Type
              </Label>
              <Select
                value={values.droneProductType || "Drone"}
                onValueChange={(val) => onChange("droneProductType", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Drone",
                    "Kit",
                    "Battery",
                    "Controller",
                    "Propellers",
                    "Other accessory",
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Package Edition
              </Label>
              <Select
                value={values.dronePackage || "Standard kit"}
                onValueChange={(val) => onChange("dronePackage", val)}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Drone only", "Standard kit", "Combo", "Other"].map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Batteries Included Count
              </Label>
              <Input
                type="number"
                min={0}
                value={values.batteriesCount || 1}
                onChange={(e) =>
                  onChange("batteriesCount", Number(e.target.value))
                }
                className="mt-1 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Flight Hours
              </Label>
              <Input
                placeholder="e.g. 12 hrs or Unknown"
                value={values.flightHours || ""}
                onChange={(e) => onChange("flightHours", e.target.value)}
                className="mt-1 h-11 rounded-xl"
              />
            </div>
          </>
        )}

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Condition
          </Label>
          <Select
            value={values.condition || "Like New"}
            onValueChange={(val) => onChange("condition", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Brand New", "Like New", "Excellent", "Good", "Fair"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Serial number
          </Label>
          <Input
            placeholder="Serial number"
            value={values.serialNumber || ""}
            onChange={(e) => onChange("serialNumber", e.target.value)}
            className="mt-1 h-11 rounded-xl font-mono text-xs"
          />
        </div>
      </div>
    );
  }

  // ─── 11. HEALTH & BEAUTY ──────────────────────────────────────────────────
  if (isHealthBeauty) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Product Type
          </Label>
          <Select
            value={values.beautyProductType || "Skincare"}
            onValueChange={(val) => onChange("beautyProductType", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Skincare",
                "Haircare",
                "Makeup",
                "Fragrance",
                "Grooming device",
                "Beauty device",
                "Accessory",
              ].map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Volume / Weight
          </Label>
          <Input
            placeholder="e.g. 50ml, 100g"
            value={values.beautyVolume || ""}
            onChange={(e) => onChange("beautyVolume", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Period After Opening (PAO)
          </Label>
          <Select
            value={values.periodAfterOpening || "12M"}
            onValueChange={(val) => onChange("periodAfterOpening", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["6M", "12M", "24M", "36M", "N/A"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Packaging Condition
          </Label>
          <Select
            value={values.packagingCondition || "Sealed"}
            onValueChange={(val) => onChange("packagingCondition", val)}
          >
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Sealed", "Open", "Damaged"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Batch Number
          </Label>
          <Input
            placeholder="Batch code on packaging"
            value={values.batchNumber || ""}
            onChange={(e) => onChange("batchNumber", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Expiry Date
          </Label>
          <Input
            type="date"
            value={values.expiryDate || ""}
            onChange={(e) => onChange("expiryDate", e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>
      </div>
    );
  }

  // ─── Default fallback: generic colour, condition, and optional serial ─────
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Colour / Variant
        </Label>
        <Input
          placeholder="Colour or variant"
          value={values.color || ""}
          onChange={(e) => onChange("color", e.target.value)}
          className="mt-1 h-11 rounded-xl"
        />
      </div>

      <div>
        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Serial number (Optional)
        </Label>
        <Input
          placeholder="Serial number if serialized"
          value={values.serialNumber || ""}
          onChange={(e) => onChange("serialNumber", e.target.value)}
          className="mt-1 h-11 rounded-xl font-mono text-xs"
        />
      </div>
    </div>
  );
}

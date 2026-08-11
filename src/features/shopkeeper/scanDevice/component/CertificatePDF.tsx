"use client";

import React from "react";
import QRCode from "react-qr-code";
import { Calendar, CheckCircle2, Shield, TriangleAlert } from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";

interface CertificatePDFProps {
  data: IMEIResult;
  id: string;
  providerName?: string;
  serviceId?: number;
}

type ProviderRow = {
  label: string;
  value: string;
  rawValue: unknown;
};

export const CERTIFICATE_PDF_WIDTH = 800;
export const CERTIFICATE_PDF_HEIGHT = 1450;

const colors = {
  ink: "#172033",
  muted: "#64748B",
  line: "#E2E8F0",
  panel: "#F8FAFC",
  primary: "#84CC16",
  primaryDark: "#65A30D",
  blue: "#2563EB",
  yellow: "#FDE68A",
  yellowSoft: "#FFFBEB",
  yellowLine: "#FACC15",
  warning: "#D97706",
};

function getText(value: unknown, fallback = "N/A") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.src === "string") return obj.src;
  }
  return fallback;
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
}

function getParsedRows(data: IMEIResult): ProviderRow[] {
  const parsedProviderData = (
    data as unknown as { parsedProviderData?: unknown }
  ).parsedProviderData;

  if (!parsedProviderData || typeof parsedProviderData !== "object") return [];

  return Object.entries(parsedProviderData as Record<string, unknown>)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([label, value]) => ({
      label: formatLabel(label),
      value: getText(value),
      rawValue: value,
    }));
}

function getHtmlRows(data: IMEIResult): ProviderRow[] {
  const providerData = data.providerData as { result?: string } | undefined;
  const cleanText = stripHtml(providerData?.result || "");

  return cleanText
    .split("\n")
    .map((line): ProviderRow | null => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      const colonIndex = trimmed.indexOf(":");
      if (colonIndex <= 0) return null;

      return {
        label: formatLabel(trimmed.slice(0, colonIndex)),
        value: trimmed.slice(colonIndex + 1).trim(),
        rawValue: trimmed.slice(colonIndex + 1).trim(),
      };
    })
    .filter((row): row is ProviderRow => Boolean(row));
}

function getAllProviderRows(data: IMEIResult) {
  const seen = new Set<string>();

  return [...getParsedRows(data), ...getHtmlRows(data)].filter((row) => {
    const key = normalizeLabel(row.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findValue(rows: ProviderRow[], labels: string[], fallback = "N/A") {
  for (const label of labels) {
    const row = rows.find((item) =>
      normalizeLabel(item.label).includes(normalizeLabel(label)),
    );
    if (row?.value) return row.value;
  }
  return fallback;
}

function getDeviceImage(rows: ProviderRow[]) {
  const row = rows.find((item) => {
    if (normalizeLabel(item.label) === "image") return true;
    if (
      item.rawValue &&
      typeof item.rawValue === "object" &&
      typeof (item.rawValue as { src?: unknown }).src === "string"
    ) {
      return true;
    }
    return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(item.value);
  });

  if (!row) return "";

  if (row.rawValue && typeof row.rawValue === "object") {
    const raw = row.rawValue as { src?: string; html?: string };
    if (raw.src) return raw.src;
    const htmlMatch = raw.html?.match(/src=["']([^"']+)["']/i);
    if (htmlMatch?.[1]) return htmlMatch[1];
  }

  const htmlMatch = row.value.match(/src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];

  return row.value;
}

function getRenderableImageSrc(src: string) {
  if (!src || src.startsWith("data:") || src.startsWith("/")) return src;

  try {
    const url = new URL(src);
    if (!["http:", "https:"].includes(url.protocol)) return src;
    return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  } catch {
    return src;
  }
}

function riskText(score: number) {
  if (score <= 25) return "LOW";
  if (score <= 60) return "LOW - MEDIUM";
  return "HIGH";
}

export const CertificatePDF = React.forwardRef<
  HTMLDivElement,
  CertificatePDFProps
>(({ data, id, providerName, serviceId }, ref) => {
  const rows = getAllProviderRows(data);
  const deviceImage = getDeviceImage(rows);
  const renderableDeviceImage = getRenderableImageSrc(deviceImage);
  const imei = findValue(rows, ["IMEI Number", "IMEI"], data.imei);
  const imei2 = findValue(rows, ["IMEI2", "IMEI 2"], "");
  const deviceName = findValue(
    rows,
    ["Device", "Model Name", "Model"],
    data.deviceName,
  );
  const serialNumber = findValue(rows, ["Serial Number", "Serial"], "N/A");
  const eid = findValue(rows, ["EID"], "N/A");
  const warrantyType = findValue(rows, ["Warranty Type"], "N/A");
  const warrantyExpires = findValue(
    rows,
    ["Warranty Expires", "Coverage End Date"],
    "N/A",
  );
  const purchaseDate = findValue(
    rows,
    ["Estimated Purchase Date", "Purchase Date"],
    "N/A",
  );
  const activationStatus = findValue(rows, ["Activation Status"], "N/A");
  const registrationStatus = findValue(rows, ["Registration Status"], "N/A");
  const carrierStatus = findValue(
    rows,
    ["Carrier Status", "Locked Carrier"],
    "N/A",
  );
  const simLock = findValue(
    rows,
    ["SIM Lock Status", "SIM Lock", "Simlock"],
    "N/A",
  );
  const blacklist = findValue(rows, ["Blacklist Status"], "N/A");
  const replacedDevice = findValue(rows, ["Replaced Device"], "N/A");
  const openRepair = findValue(rows, ["Open Repair"], "N/A");
  const coverageBenefits = findValue(rows, ["Coverage Benefits"], "N/A");
  const notice = findValue(rows, ["Notice"], "");

  const riskScore = data.riskMeter?.score ?? 0;
  const riskLabel = data.riskMeter?.label || riskText(riskScore);
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const baseSummaryItems: [string, string][] = (
    [
      ["Activation Status", activationStatus],
      [
        "Warranty Status",
        `${warrantyType}${warrantyExpires !== "N/A" ? ` (${warrantyExpires})` : ""}`,
      ],
      ["Estimated Purchase Date", purchaseDate],
      ["Carrier Status", carrierStatus],
      ["SIM Lock", simLock],
      ["Registration Status", registrationStatus],
      ["Blacklist Status", blacklist],
      ["Replaced Device", replacedDevice],
      ["Open Repair", openRepair],
      ["Coverage Benefits", coverageBenefits],
    ] as [string, string][]
  ).filter(([, value]) => value && value !== "N/A" && value !== "");

  const PRIORITY_KEYWORDS = [
    "icloud",
    "fmi",
    "mdm",
    "activation lock",
    "lost mode",
    "mi activation",
    "knox",
    "carrier",
    "sim lock",
    "simlock",
    "unlock",
    "blacklist",
    "warranty",
    "coverage",
    "purchase date",
    "activation status",
    "replaced",
    "refurbished",
    "demo",
    "repair",
    "loaner",
    "registration",
    "mac address",
  ];

  const EXCLUDED_KEYWORDS = [
    "image",
    "device",
    "imei",
    "serial",
    "eid",
    "notice",
  ];

  const baseLabelsUsed = new Set(
    [
      "activation status",
      "warranty type",
      "warranty expires",
      "coverage end date",
      "estimated purchase date",
      "purchase date",
      "carrier status",
      "locked carrier",
      "sim lock status",
      "sim lock",
      "simlock",
      "registration status",
      "blacklist status",
      "replaced device",
      "open repair",
      "coverage benefits",
    ].map(normalizeLabel),
  );

  const additionalPriorityItems = rows
    .filter((row) => {
      const lowerLabel = row.label.toLowerCase();
      const normalized = normalizeLabel(row.label);

      if (baseLabelsUsed.has(normalized)) return false;
      if (EXCLUDED_KEYWORDS.some((kw) => lowerLabel.includes(kw))) return false;

      return PRIORITY_KEYWORDS.some((kw) => lowerLabel.includes(kw));
    })
    .map((row) => [row.label, row.value] as [string, string]);

  let summaryItems = [...baseSummaryItems, ...additionalPriorityItems].slice(
    0,
    12,
  );

  if (summaryItems.length === 0) {
    const fallbackItems = rows
      .filter((row) => {
        const lowerLabel = row.label.toLowerCase();
        if (
          [
            "image",
            "device",
            "imei number",
            "imei",
            "imei2",
            "serial number",
            "eid",
            "notice",
          ].includes(lowerLabel)
        )
          return false;
        if (EXCLUDED_KEYWORDS.some((kw) => lowerLabel.includes(kw)))
          return false;
        return true;
      })
      .slice(0, 6)
      .map((row) => [row.label, row.value] as [string, string]);

    summaryItems = fallbackItems;
  }

  const summaryItemLabels = new Set(
    summaryItems.map(([label]) => normalizeLabel(label)),
  );

  const riskPoints = [
    `${activationStatus !== "N/A" ? `Activation status: ${activationStatus}` : "Activation data reviewed"}`,
    `${blacklist !== "N/A" ? `Blacklist status: ${blacklist}` : "Blacklist signal reviewed"}`,
    `${simLock !== "N/A" ? `SIM lock status: ${simLock}` : "SIM lock signal reviewed"}`,
    `${openRepair !== "N/A" ? `Open repair: ${openRepair}` : "Repair history signal reviewed"}`,
  ];

  const additionalRows = rows.filter((row) => {
    const lowerLabel = row.label.toLowerCase();
    const normalized = normalizeLabel(row.label);

    if (summaryItemLabels.has(normalized)) return false;
    if (
      [
        "image",
        "device",
        "imei number",
        "imei",
        "imei2",
        "serial number",
        "eid",
        "notice",
      ].includes(lowerLabel)
    )
      return false;

    return true;
  });

  return (
    <div
      ref={ref}
      id={id}
      style={{
        width: `${CERTIFICATE_PDF_WIDTH}px`,
        minHeight: `${CERTIFICATE_PDF_HEIGHT}px`,
        background: "#ffffff",
        color: colors.ink,
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "42px 48px",
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 120px",
          alignItems: "start",
          marginBottom: "24px",
        }}
      >
        <div />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Imoscan logo"
              style={{
                height: "52px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>
          <h1
            style={{
              margin: "14px 0 6px",
              fontSize: "25px",
              fontWeight: 900,
              color: colors.ink,
            }}
          >
            Device Verification Certificate
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: colors.muted }}>
            Check before you buy
          </p>
        </div>
        <div style={{ justifySelf: "end" }}>
          <QRCode value={`https://imoscan.com/report/${imei}`} size={96} />
        </div>
      </div>

      <Section title="Device Details">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "26px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              border: `1px solid ${colors.line}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              overflow: "hidden",
            }}
          >
            {renderableDeviceImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={renderableDeviceImage}
                alt="Device"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{
                  maxWidth: "104px",
                  maxHeight: "104px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Shield size={48} color={colors.primary} />
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr",
              rowGap: "13px",
              columnGap: "18px",
              fontSize: "12px",
            }}
          >
            <Detail label="Device" value={deviceName} />
            <Detail label="IMEI" value={imei} mono />
            {imei2 && <Detail label="IMEI 2" value={imei2} mono />}
            <Detail label="Serial Number" value={serialNumber} mono />
            {eid !== "N/A" && <Detail label="EID" value={eid} mono />}
          </div>
        </div>
      </Section>

      <Section title="Verification Summary">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "30px",
            rowGap: "16px",
          }}
        >
          {summaryItems.map(([label, value]) => (
            <SummaryItem
              key={`${label}-${value}`}
              label={label}
              value={value}
            />
          ))}
        </div>
      </Section>

      <div
        style={{
          border: `1px solid ${colors.yellowLine}`,
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: colors.yellow,
            padding: "14px 20px",
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          Risk Analysis (AI Powered)
        </div>
        <div style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CheckCircle2
              size={18}
              color="#F97316"
              style={{ marginRight: "12px", flexShrink: 0, display: "block" }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 900,
                marginRight: "12px",
                lineHeight: "18px",
              }}
            >
              Overall Risk Level:
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: colors.yellowLine,
                borderRadius: "999px",
                padding: "4px 14px",
                fontSize: "10px",
                fontWeight: 900,
                color: "#92400E",
                lineHeight: 1,
              }}
            >
              {riskLabel.toUpperCase()} ({riskScore}/100)
            </span>
          </div>

          <p
            style={{
              margin: "22px 0 12px",
              fontSize: "12px",
              color: colors.muted,
              fontWeight: 700,
            }}
          >
            Explanation:
          </p>

          <div style={{ display: "grid", gap: "10px" }}>
            {riskPoints.map((point) => (
              <RiskPoint key={point} text={point} />
            ))}
            {notice && notice !== "N/A" && <WarningPoint text={notice} />}
            {replacedDevice !== "N/A" && (
              <WarningPoint text={`Replaced device: ${replacedDevice}`} />
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginTop: "18px",
            }}
          >
            <Shield
              size={14}
              color={colors.blue}
              style={{
                marginRight: "10px",
                flexShrink: 0,
                marginTop: "2px",
                display: "block",
              }}
            />
            <strong style={{ fontSize: "12px", lineHeight: "18px" }}>
              Conclusion:{" "}
              {data.aiInsight?.message ||
                "Review all verification details before purchase."}
            </strong>
          </div>
        </div>

        <div
          style={{
            background: colors.yellowSoft,
            borderTop: `1px solid ${colors.yellowLine}`,
            padding: "18px 24px",
            display: "grid",
            gap: "12px",
          }}
        >
          <WarningPoint text="Always match IMEI / serials with the physical device before purchase." />
          <WarningPoint text="Boxes that are sealed and status says ACTIVATED should be reviewed carefully." />
        </div>
      </div>

      {additionalRows.length > 0 && (
        <Section title="Additional Insight">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 22px",
            }}
          >
            {additionalRows.map((row, index) => (
              <div key={`${row.label}-${index}`}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 900,
                    color: colors.muted,
                    marginBottom: "4px",
                  }}
                >
                  {row.label}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    lineHeight: 1.45,
                    wordBreak: "break-word",
                  }}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "34px",
          alignItems: "center",
          color: colors.muted,
          fontSize: "11px",
          marginTop: "18px",
        }}
      >
        <span
          style={{
            display: "flex",
            gap: "7px",
            alignItems: "center",
            lineHeight: "14px",
          }}
        >
          <Shield
            size={12}
            color={colors.primary}
            style={{ flexShrink: 0, display: "block" }}
          />
          Report ID: IMO-{String(imei).slice(-8)}
        </span>
        <span
          style={{
            display: "flex",
            gap: "7px",
            alignItems: "center",
            lineHeight: "14px",
          }}
        >
          <Calendar
            size={12}
            color={colors.blue}
            style={{ flexShrink: 0, display: "block" }}
          />
          Generated On: {reportDate}
        </span>
      </div>

      {(providerName || serviceId) && (
        <p
          style={{
            margin: "10px 0 0",
            textAlign: "center",
            color: colors.muted,
            fontSize: "10px",
          }}
        >
          {providerName && `Provider: ${providerName}`}
          {providerName && serviceId && " | "}
          {serviceId && `Service ID: ${serviceId}`}
        </p>
      )}
    </div>
  );
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          background: "#F1F5F9",
          borderBottom: `1px solid ${colors.line}`,
          padding: "14px 20px",
          fontSize: "13px",
          fontWeight: 800,
        }}
      >
        {title}
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <>
      <div style={{ fontWeight: 900, color: colors.ink, lineHeight: 1.4 }}>
        {label}:
      </div>
      <div
        style={{
          color: colors.ink,
          fontFamily: mono ? "monospace" : "Arial, Helvetica, sans-serif",
          wordBreak: "break-word",
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <CheckCircle2
        size={15}
        color={colors.blue}
        style={{
          marginRight: "10px",
          flexShrink: 0,
          marginTop: "1px",
          display: "block",
        }}
      />
      <div>
        <div style={{ fontSize: "12px", fontWeight: 900, lineHeight: "17px" }}>
          {label}:
        </div>
        <div
          style={{
            fontSize: "11px",
            color: colors.ink,
            lineHeight: 1.4,
            marginTop: "2px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function RiskPoint({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <CheckCircle2
        size={13}
        color={colors.blue}
        style={{
          marginRight: "10px",
          flexShrink: 0,
          marginTop: "1.5px",
          display: "block",
        }}
      />
      <span style={{ fontSize: "11px", lineHeight: "16px" }}>{text}</span>
    </div>
  );
}

function WarningPoint({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <TriangleAlert
        size={13}
        color={colors.warning}
        style={{
          marginRight: "10px",
          flexShrink: 0,
          marginTop: "1.5px",
          display: "block",
        }}
      />
      <span style={{ fontSize: "11px", lineHeight: "16px", color: "#92400E" }}>
        {text}
      </span>
    </div>
  );
}

CertificatePDF.displayName = "CertificatePDF";

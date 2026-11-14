import {
  CommonLabelData,
  PrintOptions,
  PrintResult,
  PrinterBrand,
  PrintingProtocol,
} from "../types";
import { PrinterAdapter } from "./PrinterAdapter";

export class DymoPrinterAdapter extends PrinterAdapter {
  readonly brand: PrinterBrand = "DYMO";
  readonly defaultProtocol: PrintingProtocol = "browser";
  readonly description =
    "DYMO LabelWriter 450 Turbo / 450 / 550 (Direct Browser Print & DYMO Connect XML format)";

  async print(
    data: CommonLabelData,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    try {
      const printerName = "DYMO LabelWriter 450 Turbo";

      // 1. If verified serviceEndpoint is available, attempt direct print to DYMO service
      if (options?.serviceEndpoint) {
        try {
          const endpoint = options.serviceEndpoint.replace(
            /(GetPrinters|StatusConnected)/i,
            "PrintLabel",
          );
          const params = new URLSearchParams();
          params.append("printerName", printerName);
          params.append(
            "printParamsXml",
            `<LabelWriterPrintParams><Copies>${options?.copies || 1}</Copies></LabelWriterPrintParams>`,
          );
          params.append("labelXml", this.generateRawCommands(data));
          params.append("labelSetXml", "");

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 1200);
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (res.ok) {
            return {
              success: true,
              protocol: "browser",
              message: `Label sent directly to ${printerName} via DYMO Connect Web Service`,
            };
          }
        } catch {
          // Fall through to browser print engine
        }
      }

      // 2. Trigger browser print engine via Windows driver
      if (options?.triggerBrowserPrint) {
        options.triggerBrowserPrint();
        return {
          success: true,
          protocol: "browser",
          message: `Label sent to ${printerName} print engine (${this.getWidthCss(data)} x ${this.getHeightCss(data)})`,
        };
      }

      // Fallback: window.print
      window.print();
      return {
        success: true,
        protocol: "browser",
        message: `Triggered system print dialog for ${printerName}`,
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to dispatch print job to DYMO printer";
      return {
        success: false,
        protocol: "browser",
        message: errMsg,
      };
    }
  }

  /**
   * Generates standard DYMO DieCutLabel XML format for DYMO Connect SDK
   */
  generateRawCommands(data: CommonLabelData): string {
    const isBarcodeQR = data.barcodeFormat === "QR Code";
    const widthInTwips = Math.round(
      (data.unit === "inch" ? data.labelWidth : data.labelWidth / 25.4) * 1440,
    );
    const heightInTwips = Math.round(
      (data.unit === "inch" ? data.labelHeight : data.labelHeight / 25.4) *
        1440,
    );

    const priceText =
      data.fields.price && data.price !== undefined
        ? `${data.currencySymbol || "£"}${data.price.toFixed(2)}`
        : "";
    const titleText = data.fields.itemName ? data.itemName : "";

    return `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>${data.template.label_name.replace(/[^a-zA-Z0-9]/g, "_")}</Id>
  <PaperName>${data.template.label_name}</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="${widthInTwips}" Height="${heightInTwips}" Rx="180" Ry="180" />
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>ITEM_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>${titleText}</String>
          <Attributes>
            <Font Family="Arial" Size="10" Bold="True" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="150" Y="120" Width="${Math.max(100, widthInTwips - 300)}" Height="450" />
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>PRICE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>${priceText}</String>
          <Attributes>
            <Font Family="Arial" Size="14" Bold="True" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="150" Y="580" Width="${Math.max(100, widthInTwips - 300)}" Height="350" />
  </ObjectInfo>
  <ObjectInfo>
    <${isBarcodeQR ? "QRCodeObject" : "BarcodeObject"}>
      <Name>BARCODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <Text>${data.barcode}</Text>
      <Type>${isBarcodeQR ? "QRCode" : "Code128"}</Type>
      <Size>Medium</Size>
      <TextPosition>${isBarcodeQR ? "None" : "Bottom"}</TextPosition>
    </${isBarcodeQR ? "QRCodeObject" : "BarcodeObject"}>
    <Bounds X="150" Y="950" Width="${Math.max(100, widthInTwips - 300)}" Height="${Math.max(200, heightInTwips - 1050)}" />
  </ObjectInfo>
</DieCutLabel>`;
  }
}

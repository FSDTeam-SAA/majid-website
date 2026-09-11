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
    "DYMO LabelWriter (Direct Browser Print & DYMO Connect XML format)";

  async print(
    data: CommonLabelData,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    try {
      if (options?.triggerBrowserPrint) {
        options.triggerBrowserPrint();
        return {
          success: true,
          protocol: "browser",
          message: `Label sent to DYMO print engine (${this.getWidthCss(data)} x ${this.getHeightCss(data)})`,
        };
      }

      // Fallback: window.print
      window.print();
      return {
        success: true,
        protocol: "browser",
        message: "Triggered system print dialog for DYMO printer",
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
      <Text>${data.fields.itemName ? data.itemName : ""}</Text>
    </TextObject>
    <TextObject>
      <Name>PRICE</Name>
      <Text>${data.fields.price && data.price !== undefined ? `${data.currencySymbol || "£"}${data.price.toFixed(2)}` : ""}</Text>
    </TextObject>
    <${isBarcodeQR ? "QRCodeObject" : "BarcodeObject"}>
      <Name>BARCODE</Name>
      <BarcodeType>${isBarcodeQR ? "QRCode" : "Code128"}</BarcodeType>
      <Text>${data.barcode}</Text>
    </${isBarcodeQR ? "QRCodeObject" : "BarcodeObject"}>
  </ObjectInfo>
</DieCutLabel>`;
  }
}

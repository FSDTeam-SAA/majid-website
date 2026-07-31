/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Fallback dimensions. The final PDF uses each rendered element's real size.
const CERTIFICATE_PDF_WIDTH = 800;
const CERTIFICATE_PDF_HEIGHT = 1100;

const CERTIFICATE_SCALE = 2;
const MAX_SINGLE_PAGE_HEIGHT = 1600;

type PdfOutputOptions = {
  download?: boolean;
  onPdfReady?: (pdf: Blob) => Promise<void> | void;
};

export const useCertificateDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const waitForDomUpdate = (ms: number = 500) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const waitForImages = async (element: HTMLElement) => {
    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      images.map((image) => {
        if (image.complete) return Promise.resolve();

        return new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }),
    );
  };

  const createCaptureClone = (element: HTMLElement) => {
    const width =
      Math.ceil(element.scrollWidth || element.offsetWidth) ||
      CERTIFICATE_PDF_WIDTH;
    const height =
      Math.ceil(element.scrollHeight || element.offsetHeight) ||
      CERTIFICATE_PDF_HEIGHT;
    const wrapper = document.createElement("div");

    wrapper.style.position = "fixed";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.width = `${width}px`;
    wrapper.style.minHeight = `${height}px`;
    wrapper.style.background = "#ffffff";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "-9999";
    wrapper.style.overflow = "visible";

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.margin = "0";
    clone.style.transform = "none";
    clone.style.position = "relative";
    clone.style.left = "0";
    clone.style.top = "0";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    return { wrapper, clone, width, height };
  };

  const addCanvasToPdf = (
    pdf: jsPDF | null,
    canvas: HTMLCanvasElement,
    pageWidth: number,
    pageHeight: number,
  ) => {
    const shouldPaginate = pageHeight > MAX_SINGLE_PAGE_HEIGHT;
    const pdfPageHeight = shouldPaginate
      ? CERTIFICATE_PDF_HEIGHT
      : pageHeight || CERTIFICATE_PDF_HEIGHT;
    const targetWidth = pageWidth || CERTIFICATE_PDF_WIDTH;
    const canvasPageHeight = Math.floor(
      (pdfPageHeight * canvas.width) / targetWidth,
    );
    const totalPages = shouldPaginate
      ? Math.ceil(canvas.height / canvasPageHeight)
      : 1;

    let nextPdf = pdf;

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const sourceY = pageIndex * canvasPageHeight;
      const sourceHeight = shouldPaginate
        ? Math.min(canvasPageHeight, canvas.height - sourceY)
        : canvas.height;
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sourceHeight;

      const context = slice.getContext("2d");
      if (!context) throw new Error("Could not prepare PDF page");

      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceHeight,
        0,
        0,
        canvas.width,
        sourceHeight,
      );

      const renderedHeight = (sourceHeight * targetWidth) / canvas.width;
      const currentPageHeight = shouldPaginate
        ? pdfPageHeight
        : renderedHeight || pdfPageHeight;

      if (!nextPdf) {
        nextPdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [targetWidth, currentPageHeight],
        });
      } else {
        nextPdf.addPage([targetWidth, currentPageHeight], "portrait");
      }

      nextPdf.addImage(
        slice.toDataURL("image/png", 1.0),
        "PNG",
        0,
        0,
        targetWidth,
        renderedHeight,
      );
    }

    return nextPdf;
  };

  const savePdf = (pdf: jsPDF, filename: string) => {
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadCertificatePdf = useCallback(
    async (
      elementIds: string[],
      filename: string,
      onProgress?: (progress: number) => void,
      options?: PdfOutputOptions,
    ) => {
      if (elementIds.length === 0) {
        setError("No certificate elements found");
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      try {
        // ইমেজ লোড হওয়ার জন্য পর্যাপ্ত সময় দিন
        await waitForDomUpdate(500);

        let pdf: jsPDF | null = null;
        let successCount = 0;
        const failedElementIds: string[] = [];

        for (let index = 0; index < elementIds.length; index++) {
          const elementId = elementIds[index];
          const element = document.getElementById(elementId);

          if (!element) {
            failedElementIds.push(elementId);
            console.error(`PDF element not found: ${elementId}`);
            continue;
          }

          const { wrapper, clone, width, height } = createCaptureClone(element);

          try {
            await waitForDomUpdate(100);
            await waitForImages(clone);

            const pageWidth =
              Math.ceil(clone.scrollWidth || clone.offsetWidth || width) ||
              CERTIFICATE_PDF_WIDTH;
            const pageHeight =
              Math.ceil(clone.scrollHeight || clone.offsetHeight || height) ||
              CERTIFICATE_PDF_HEIGHT;

            const canvas = await html2canvas(clone, {
              scale: CERTIFICATE_SCALE,
              useCORS: true,
              allowTaint: false,
              logging: false,
              backgroundColor: "#ffffff",
              imageTimeout: 15000,
              width: pageWidth,
              height: pageHeight,
              windowWidth: pageWidth,
              windowHeight: pageHeight,
            });

            pdf = addCanvasToPdf(pdf, canvas, pageWidth, pageHeight);
            successCount++;

            const progress = Math.round(
              ((index + 1) / elementIds.length) * 100,
            );
            setDownloadProgress(progress);
            onProgress?.(progress);
          } catch (err) {
            console.error(`Error capturing ${elementId}:`, err);
            failedElementIds.push(elementId);
          } finally {
            wrapper.remove();
          }
        }

        if (successCount === 0 || !pdf) {
          throw new Error(
            failedElementIds.length > 0
              ? `Generation failed. Missing or failed elements: ${failedElementIds.join(", ")}`
              : "Generation failed",
          );
        }

        const pdfBlob = pdf.output("blob");
        await options?.onPdfReady?.(pdfBlob);

        if (options?.download !== false) {
          savePdf(pdf, filename);
        }
      } catch (err: any) {
        setError(err.message || "Failed to generate PDF");
        throw err;
      } finally {
        setIsDownloading(false);
        setDownloadProgress(0);
      }
    },
    [],
  );

  return { isDownloading, downloadProgress, error, downloadCertificatePdf };
};

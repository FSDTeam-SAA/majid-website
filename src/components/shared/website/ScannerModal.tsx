"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Position the IMEI inside the frame, then capture an image.",
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVideoAddedRef = useRef<boolean>(false);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log("🛑 Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const getOcrUrl = () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    return `${apiUrl.replace(/\/$/, "")}/ocr/extract-imei`;
  };

  const extractImeiNumbers = (data: unknown) => {
    const response = data as {
      data?: { imeiNumbers?: unknown; imei?: unknown };
      imeiNumbers?: unknown;
      imei?: unknown;
      result?: unknown;
    };

    const candidates: unknown[] = [];

    if (Array.isArray(response.data?.imeiNumbers)) {
      candidates.push(...response.data.imeiNumbers);
    }
    if (Array.isArray(response.imeiNumbers)) {
      candidates.push(...response.imeiNumbers);
    }
    candidates.push(response.data?.imei, response.imei, response.result);

    const imeis = candidates
      .flatMap((value) => {
        if (typeof value !== "string") return [];
        const direct = value.replace(/\D/g, "");
        const matches = value.match(/\d{14,16}/g) ?? [];
        return [direct, ...matches];
      })
      .filter((value) => value.length >= 14 && value.length <= 16);

    return Array.from(new Set(imeis));
  };

  // Capture current camera frame and keep it until user extracts.
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("❌ Video or canvas not ready");
      toast.error("Camera is not ready yet");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== 4) {
      console.log("❌ Video not ready, readyState:", video.readyState);
      toast.error("Camera is still loading");
      return;
    }

    console.log("📸 Capturing frame...");

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("❌ Failed to get canvas context");
      return;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error("Failed to create image"));
        },
        "image/jpeg",
        0.8,
      );
    });

    console.log("📸 Image captured, size:", blob.size);
    setCapturedImage(blob);
    setStatusMessage("Image captured. Click Extract IMEI to send it.");

    setCapturedPreview((previousPreview) => {
      if (previousPreview) URL.revokeObjectURL(previousPreview);
      return URL.createObjectURL(blob);
    });
    toast.success("Image captured");
  }, []);

  // Send captured image to OCR
  const extractFromCapturedImage = useCallback(async () => {
    if (!capturedImage) {
      toast.error("Capture an image first");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("image", capturedImage, "imei-frame.jpg");

    try {
      setIsExtracting(true);
      setStatusMessage("Extracting IMEI from captured image...");
      const fullUrl = getOcrUrl();

      console.log("📤 API Configuration:", {
        fullUrl: fullUrl,
        env: process.env.NEXT_PUBLIC_API_URL,
        imageSize: capturedImage.size,
      });
      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error(
          "❌ API returned error:",
          response.status,
          response.statusText,
        );
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 OCR Response:", data);

      const imeiNumbers = extractImeiNumbers(data);

      if (imeiNumbers.length > 0) {
        console.log("✅ IMEI Detected:", imeiNumbers);
        toast.success(
          imeiNumbers.length === 1
            ? "IMEI detected!"
            : `${imeiNumbers.length} IMEIs detected!`,
        );
        stopCamera();
        onScan(imeiNumbers.join("\n"));
        onClose();
        return;
      }

      console.warn("⚠️ No IMEI found in response");
      setStatusMessage("No IMEI found. Capture a clearer image and try again.");
      toast.error("No IMEI found in the image");
    } catch (err) {
      console.error("❌ API Error:", err);
      setStatusMessage("Extraction failed. Please try again.");
      toast.error("Failed to extract IMEI");
    } finally {
      setIsExtracting(false);
    }
  }, [capturedImage, onScan, onClose, stopCamera]);

  // Start camera
  const startCamera = useCallback(async () => {
    console.log("🚀 Starting camera...");
    setIsInitializing(true);

    try {
      // Get container FIRST
      const container = document.getElementById(
        "video-container",
      ) as HTMLDivElement;
      if (!container) {
        console.error("❌ Container not found");
        toast.error("Container not found");
        setIsInitializing(false);
        onClose();
        return;
      }
      containerRef.current = container;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("✅ Stream acquired");
      streamRef.current = stream;

      // Create video element if not exists
      if (!videoRef.current) {
        videoRef.current = document.createElement("video");
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("autoplay", "true");
        videoRef.current.setAttribute("muted", "true");
        console.log("✅ Video element created");
      }

      // Add video to DOM BEFORE assigning stream
      if (!isVideoAddedRef.current) {
        container.innerHTML = "";
        container.appendChild(videoRef.current);
        videoRef.current.style.width = "100%";
        videoRef.current.style.height = "100%";
        videoRef.current.style.objectFit = "cover";
        videoRef.current.style.display = "block";
        isVideoAddedRef.current = true;
        console.log("✅ Video added to DOM");
      }

      // Assign stream
      videoRef.current.srcObject = stream;
      console.log("✅ Stream assigned to video");

      // Wait for metadata to load
      await new Promise<void>((resolve) => {
        if (!videoRef.current) {
          console.warn("⚠️ Video element lost");
          resolve();
          return;
        }

        const onLoadedMetadata = () => {
          console.log("✅ Video metadata loaded");
          videoRef.current?.removeEventListener(
            "loadedmetadata",
            onLoadedMetadata,
          );
          resolve();
        };

        if (videoRef.current.readyState >= 1) {
          // Already has metadata
          console.log("✅ Metadata already loaded");
          resolve();
        } else {
          videoRef.current.addEventListener("loadedmetadata", onLoadedMetadata);
          // Timeout after 5 seconds
          setTimeout(() => {
            console.warn("⚠️ Metadata load timeout");
            videoRef.current?.removeEventListener(
              "loadedmetadata",
              onLoadedMetadata,
            );
            resolve();
          }, 5000);
        }
      });

      // Play video
      await videoRef.current.play();
      console.log("✅ Video playing");

      console.log("✅ Camera started successfully");
      setIsInitializing(false);
      setStatusMessage(
        "Position the IMEI inside the frame, then capture an image.",
      );
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      console.error("❌ Camera error:", error);
      setIsInitializing(false);
      const errorMsg =
        error?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : error?.name === "NotFoundError"
            ? "No camera found on this device."
            : "Failed to start camera";
      toast.error(errorMsg);
      onClose();
    }
  }, [onClose]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCapturedImage(null);

      setStatusMessage(
        "Position the IMEI inside the frame, then capture an image.",
      );
      setCapturedPreview((previousPreview) => {
        if (previousPreview) URL.revokeObjectURL(previousPreview);
        return null;
      });

      // Create canvas if not exists
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }

      // Add a small delay to ensure DOM is rendered
      const timeoutId = setTimeout(() => {
        const container = document.getElementById(
          "video-container",
        ) as HTMLDivElement;
        if (container) {
          console.log("✅ Container found, starting camera");
          containerRef.current = container;
          startCamera();
        } else {
          console.error("❌ Container not found in DOM");
          toast.error("Camera container not found");
          onClose();
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        stopCamera();
      };
    }
  }, [isOpen, startCamera, stopCamera, onClose]);

  useEffect(() => {
    return () => {
      if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    };
  }, [capturedPreview]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-[32px] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Camera className="text-primary w-6 h-6" />
            </div>
            Scan IMEI / Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-square w-full bg-black overflow-hidden">
          <div id="video-container" className="w-full h-full" />

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center space-y-4 z-20">
              <RefreshCw className="w-12 h-12 animate-spin text-primary" />
              <p className="font-bold text-lg">Initializing Camera...</p>
              <p className="text-sm text-white/60">
                Please allow camera access if prompted
              </p>
            </div>
          )}

          {/* Scanning Frame */}
          {!isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40"
                style={{
                  clipPath:
                    "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, calc(50% - 140px) calc(50% - 140px), calc(50% + 140px) calc(50% - 140px), calc(50% + 140px) calc(50% + 140px), calc(50% - 140px) calc(50% + 140px), calc(50% - 140px) calc(50% - 140px))",
                }}
              />
              <div className="w-[280px] h-[280px] border-2 border-primary/50 rounded-2xl" />
            </div>
          )}

          {capturedPreview && (
            <div
              role="img"
              aria-label="Captured IMEI preview"
              className="absolute bottom-4 right-4 z-20 h-20 w-20 overflow-hidden rounded-xl border-2 border-white bg-cover bg-center shadow-lg"
              style={{ backgroundImage: `url(${capturedPreview})` }}
            />
          )}
        </div>

        <div className="p-6 bg-muted/30">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border">
            <p className="text-[13px] text-muted-foreground font-semibold text-center leading-relaxed">
              {statusMessage}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={captureImage}
              disabled={isInitializing || isExtracting}
              className="h-14 rounded-2xl"
            >
              <ImagePlus className="mr-2 h-5 w-5" />
              Capture
            </Button>
            <Button
              type="button"
              onClick={extractFromCapturedImage}
              disabled={!capturedImage || isExtracting}
              variant="secondary"
              className="h-14 rounded-2xl"
            >
              {isExtracting ? (
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Extract
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="mt-4 w-full h-14 rounded-2xl"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

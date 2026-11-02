"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ScanFace,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaffUser } from "../api/staff.api";
import { useUpdateStaffReferenceFace } from "../hooks/useStaff";

interface EnrollReferenceFaceModalProps {
  staff: StaffUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollReferenceFaceModal({
  staff,
  isOpen,
  onClose,
}: EnrollReferenceFaceModalProps) {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const updateReferenceFaceMutation = useUpdateStaffReferenceFace();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const requestCameraStream = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Camera API is not supported in this browser. Please use a modern browser (Chrome, Edge) or use 'Upload File'.",
      );
      setIsCameraActive(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Attempt with ideal resolution constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });
      } catch {
        // Fallback to basic video request if resolution or facingMode constraint fails
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      setCameraError(null);
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      const error = err as { name?: string; message?: string };
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setCameraError(
          "Camera access is blocked by your browser. Click the lock/settings icon next to the URL in your address bar, allow Camera, and click 'Retry Camera'.",
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setCameraError(
          "No webcam device found on this computer. You can click 'Upload File' above to register a photo instead.",
        );
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        setCameraError(
          "Webcam is currently in use by another app or browser tab. Please close other camera applications and retry.",
        );
      } else {
        setCameraError(
          error.message ||
            "Camera access denied or unavailable. You can upload an image file instead.",
        );
      }
      setIsCameraActive(false);
    }
  }, []);

  const startCamera = useCallback(() => {
    void requestCameraStream();
  }, [requestCameraStream]);

  useEffect(() => {
    let isCancelled = false;

    if (!isOpen || mode !== "camera" || capturedImage) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    const init = async () => {
      await Promise.resolve();
      if (!isCancelled) {
        await requestCameraStream();
      }
    };

    void init();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, mode, capturedImage, requestCameraStream]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (.jpg, .png)");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    if (mode === "camera") {
      startCamera();
    }
  };

  const handleSave = async () => {
    if (!staff || (!staff._id && !staff.id)) {
      toast.error("Invalid staff profile");
      return;
    }
    const staffId = (staff._id || staff.id) as string;

    if (!capturedImage && !selectedFile) {
      toast.error("Please take a photo or select an image file first");
      return;
    }

    try {
      await updateReferenceFaceMutation.mutateAsync({
        staffId,
        payload: selectedFile
          ? { file: selectedFile }
          : { photoUrl: capturedImage || undefined },
      });
      handleClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setSelectedFile(null);
    setCameraError(null);
    onClose();
  };

  const staffName = staff
    ? `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
      staff.name ||
      "Staff Member"
    : "Staff Member";
  const existingFace = staff?.referenceFaceUrl || staff?.image?.url;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-3xl border-border bg-background shadow-2xl">
        <DialogHeader className="text-left space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/15 text-[#65A30D]">
              <ScanFace className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                Biometric Face Registration
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-muted-foreground">
                Register master reference photo for{" "}
                <span className="text-foreground font-bold">{staffName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Existing reference face status */}
        {existingFace && !capturedImage && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#84CC16]">
                <Image
                  src={existingFace}
                  alt="Current face"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Currently Enrolled
                </p>
                <p className="text-[11px] text-[#65A30D] font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active reference face
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-muted-foreground px-2 py-1 rounded-md bg-muted">
              Replacing will update
            </span>
          </div>
        )}

        {/* Mode selector */}
        <div className="flex gap-2 p-1 rounded-2xl bg-surface border border-border">
          <button
            type="button"
            onClick={() => {
              setMode("camera");
              setCapturedImage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "camera"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Take Photo
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("upload");
              stopCamera();
              setCapturedImage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </button>
        </div>

        {/* Camera / Preview Area */}
        <div className="relative flex flex-col items-center justify-center rounded-3xl overflow-hidden bg-slate-950 p-4 border border-border/40 aspect-[4/3] max-h-[290px]">
          {capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-[#84CC16] shadow-xl">
                <Image
                  src={capturedImage}
                  alt="Captured face"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="absolute bottom-1 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/90 text-foreground text-xs font-bold hover:bg-background shadow-lg transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retake
              </button>
            </div>
          ) : mode === "camera" ? (
            cameraError ? (
              <div className="text-center p-4 max-w-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-destructive leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex gap-2 justify-center pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl font-bold text-xs"
                    onClick={startCamera}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Retry Camera
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl font-bold text-xs bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black"
                    onClick={() => {
                      setMode("upload");
                      setCameraError(null);
                    }}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    Upload File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl transform -scale-x-100"
                />
                {/* Circular Alignment Overlay */}
                <div className="relative z-10 w-44 h-44 rounded-full border-2 border-dashed border-[#84CC16]/80 flex items-center justify-center pointer-events-none shadow-[0_0_40px_rgba(132,204,22,0.2)]">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#84CC16] bg-black/60 px-2 py-0.5 rounded-full">
                    Align Face Here
                  </span>
                </div>
              </div>
            )
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border/80 rounded-2xl cursor-pointer hover:border-[#84CC16]/60 transition-colors p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs font-bold text-foreground">
                Click to upload face photo
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                PNG, JPG or JPEG up to 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-2xl font-bold text-xs h-11"
            onClick={handleClose}
          >
            Cancel
          </Button>

          {mode === "camera" && !capturedImage ? (
            <Button
              type="button"
              className="flex-1 rounded-2xl font-black text-xs h-11 bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 shadow-md gap-1.5"
              onClick={handleCapture}
              disabled={!isCameraActive}
            >
              <Camera className="h-4 w-4" />
              Capture Face
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 rounded-2xl font-black text-xs h-11 bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 shadow-md gap-1.5"
              onClick={handleSave}
              disabled={
                (!capturedImage && !selectedFile) ||
                updateReferenceFaceMutation.isPending
              }
            >
              {updateReferenceFaceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Reference Face
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

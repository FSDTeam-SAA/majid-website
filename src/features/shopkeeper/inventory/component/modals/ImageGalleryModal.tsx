import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUploadedImages } from "../../hooks/useInventory";
import Image from "next/image";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  onSelect,
}: ImageGalleryModalProps) {
  const { data: images, isLoading } = useUploadedImages();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-[28px] border-border p-0">
        <DialogHeader className="border-b border-border px-6 py-5 text-left bg-card">
          <DialogTitle className="text-xl font-black text-foreground">
            Image Gallery
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            Select an image from your previously uploaded images.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : images && images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {images.map((img: { url: string; public_id: string }) => (
                <div
                  key={img.public_id || img.url}
                  onClick={() => setSelectedImage(img.url)}
                  className={cn(
                    "relative aspect-square cursor-pointer rounded-2xl overflow-hidden border-2 transition-all",
                    selectedImage === img.url
                      ? "border-[#84CC16] ring-4 ring-[#84CC16]/20"
                      : "border-transparent hover:border-slate-300",
                  )}
                >
                  <Image
                    src={img.url}
                    alt="Uploaded image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {selectedImage === img.url && (
                    <div className="absolute inset-0 bg-[#84CC16]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-slate-100 p-6 mb-4 dark:bg-slate-800">
                <Image
                  src="/empty-images.svg"
                  alt="No images"
                  width={64}
                  height={64}
                  className="opacity-50"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <h3 className="text-lg font-black text-foreground">
                No previous images found
              </h3>
              <p className="text-sm font-medium text-muted-foreground mt-2 max-w-sm">
                Images you upload for categories and items will appear here for
                easy reuse.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 rounded-xl px-5 text-sm font-black text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedImage}
            className="flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-5 text-sm font-black text-white transition hover:bg-[#76b813] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Select Image
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

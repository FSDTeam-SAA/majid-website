/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { format } from "date-fns";
import {
  Loader2,
  Smartphone,
  User,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Phone,
  ImagePlus,
} from "lucide-react";
import { useState } from "react";
import {
  useAddRepairRequestNote,
  useRepairRequestDetails,
  useUpdateRepairRequestStatusByShopkeeper,
  useUpdateResentRepairQuoteStatus,
} from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import RepairOfferModal from "@/features/customer/repairHistory/component/RepairOfferModal";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useMyProfile } from "../../settings/hooks/useSettings";
import { RepairRequestFormModal } from "@/features/customer/repairRequest/component/RepairRequestFormModal";

const timelineSteps = [
  {
    id: "order_booked",
    label: "Order Booked",
    description: "Your order has been successfully created",
    statuses: ["inProgress"],
  },
  {
    id: "order_assigned",
    label: "Order Assigned",
    description: "A technician has been assigned",
    statuses: ["order-assigned"],
  },
  {
    id: "reassigned",
    label: "Reassigned",
    description: "The repair has been reassigned for another issue",
    statuses: ["reassigned"],
  },
  {
    id: "diagnosing",
    label: "Diagnosing Started",
    description: "Technician is diagnosing the issue",
    statuses: ["diagnosing"],
  },
  {
    id: "quote_sent",
    label: "Quote Sent",
    description: "A quote has been sent for the repair",
    statuses: ["quote_sent"],
  },
  {
    id: "repairing",
    label: "Repairing Started",
    description: "Device is being repaired",
    statuses: ["start-work"],
  },
  {
    id: "waiting_parts",
    label: "Waiting for Parts",
    description: "Repair is paused until parts arrive",
    statuses: ["waiting-for-parts"],
  },
  {
    id: "completed",
    label: "Repair Complete",
    description: "Repair has been successfully completed",
    statuses: ["completed"],
  },
];

export default function RepairRequestDetails({ id }: { id: string }) {
  const { data: detailsData, isLoading, refetch } = useRepairRequestDetails(id);
  const updateStatus = useUpdateRepairRequestStatusByShopkeeper();
  const session = useSession();
  const { data: profileData } = useMyProfile();
  const { currency, formatCurrency } = useCurrency();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const updateResentQuote = useUpdateResentRepairQuoteStatus();
  const addRepairNote = useAddRepairRequestNote();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const token = session.data?.accessToken;

  const [lightbox, setLightbox] = useState<{
    urls: string[];
    index: number;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] bg-background items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const request = detailsData?.data;

  if (!request) {
    return (
      <div className="flex h-[80vh] items-center justify-center font-bold text-lg text-muted-foreground">
        Repair request not found.
      </div>
    );
  }

  const generateInvoicePDF = async () => {
    if (!request) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 220],
    });

    const shopkeeper = profileData?.data;
    const shopName = shopkeeper?.shopName || "Repair Shop";
    const shopOwner = [shopkeeper?.firstName, shopkeeper?.lastName]
      .filter(Boolean)
      .join(" ");
    const receiptDate = new Date();
    const orderId = request._id.toUpperCase();
    const price = Number(request.price || 0);
    const qrLink = `${window.location.origin}/my-invoice/${request._id}`;
    const qrDataUrl = await QRCode.toDataURL(qrLink, {
      width: 700,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // Receipt background
    doc.setFillColor(7, 29, 40);
    doc.rect(0, 0, 100, 220, "F");

    // Verified icon
    doc.setFillColor(13, 62, 69);
    doc.circle(50, 14, 7, "F");
    doc.setFillColor(52, 211, 153);
    doc.circle(50, 14, 3.5, "F");
    doc.setDrawColor(7, 73, 65);
    doc.setLineWidth(0.8);
    doc.line(48.2, 14, 49.5, 15.3);
    doc.line(49.5, 15.3, 52.2, 12.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("Receipt Verified", 50, 28, { align: "center" });

    doc.setDrawColor(31, 54, 64);
    doc.setLineDashPattern([1.2, 1.2], 0);
    doc.line(10, 35, 90, 35);

    const rows: Array<[string, string]> = [
      ["Order ID", orderId],
      ["Date", format(receiptDate, "MMM dd, yyyy")],
      ["Time", format(receiptDate, "hh:mm a")],
      ["Shop Name", shopName],
      ["Shop Owner", shopOwner || "N/A"],
      ["Address", shopkeeper?.shopAddress || "N/A"],
      ["Email", shopkeeper?.email || "N/A"],
      ["Phone", shopkeeper?.phone || shopkeeper?.whatsappNumber || "N/A"],
      ["Price", formatCurrency(price)],
    ];

    let rowY = 44;
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(label, 10, rowY);

      doc.setFontSize(8);
      doc.setTextColor(241, 245, 249);
      const valueLines = doc.splitTextToSize(value, 55);
      doc.text(valueLines, 90, rowY, { align: "right" });
      rowY += Math.max(9, valueLines.length * 4 + 4);
    });

    doc.setLineDashPattern([1.2, 1.2], 0);
    doc.setDrawColor(31, 54, 64);
    doc.line(10, rowY - 2, 90, rowY - 2);

    // Large verification QR code
    const qrY = rowY + 4;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(7, qrY, 86, 82, 3, 3, "F");
    doc.addImage(qrDataUrl, "PNG", 12, qrY + 3, 76, 76);

    doc.save(`Receipt_${request.deviceModel}_${orderId}.pdf`);
  };

  const currentStatus = request?.status;

  const currentStepIndex = timelineSteps.findIndex((step) =>
    step.statuses.includes(currentStatus),
  );

  const isCompletedStatus = currentStatus === "completed";

  const handleStatusUpdate = (status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      await addRepairNote.mutateAsync({
        id,
        payload: {
          message:
            uploadNote.trim() || "Photo uploaded for this repair request",
          images: [selectedImage],
        },
      });

      setSelectedImage(null);
      setImagePreview(null);
      setUploadNote("");
      await refetch();
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleGenerateTechnicianFeedback = async () => {
    setIsGeneratingFeedback(true);

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://187.77.187.56:4897";
      const response = await axios.post(
        `${baseURL}/repair-requests/technician-feedback/${id}`,
        {}, // request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        await refetch();
      }
    } catch (error: any) {
      console.error(
        "Error generating technician feedback:",
        error?.response?.data || error,
      );
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <>
      <div className="px-4 py-8 md:px-8 lg:px-10 font-poppins min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Device Information Card */}
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-foreground">
                    Device Information
                  </h3>
                  <button
                    className="rounded-full cursor-pointer bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                    onClick={generateInvoicePDF}
                  >
                    Invoice
                  </button>
                </div>
                <div className="bg-surface rounded-3xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm text-muted-foreground">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-foreground leading-tight">
                        {request.deviceModel}
                      </h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {request.description.slice(0, 40)}...
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-1.5 bg-[#DCFCE7] text-[#16A34A] rounded-full text-xs font-black uppercase tracking-wider">
                    {request.status.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 pt-2">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                      Request ID
                    </p>
                    <p className="text-sm font-black text-foreground">
                      #{request._id.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                      Submitted
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {format(
                        new Date(request.createdAt),
                        "MMM dd, yyyy · hh:mm a",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                      Shop
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {typeof request.shopkeeperId === "object"
                        ? request.shopkeeperId.shopName
                        : "Your Shop"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative border-l-2 border-border dark:border-yellow-400 ml-4 space-y-8 pb-4">
                {timelineSteps.map((step, index) => {
                  const isCompleted =
                    isCompletedStatus || index < currentStepIndex;

                  const isActive =
                    !isCompletedStatus && index === currentStepIndex;

                  let dotStyle = "bg-muted border-border text-muted-foreground"; // pending default

                  if (isCompleted) {
                    dotStyle = "bg-primary border-primary text-white shadow-sm";
                  } else if (isActive) {
                    dotStyle =
                      "bg-blue-500 border-blue-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]";
                  }

                  return (
                    <div key={step.id} className="relative pl-8">
                      {/* DOT */}
                      <div
                        className={`absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${dotStyle}`}
                      >
                        {isCompleted && <CheckCircle2 size={12} />}

                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}

                        {!isCompleted && !isActive && (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                        )}
                      </div>

                      {/* CONTENT */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h4
                            className={`text-base font-bold ${
                              isCompleted || isActive
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </h4>

                          {isActive && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                              Active
                            </span>
                          )}

                          {!isCompleted && !isActive && (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Pending
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Issue Description Card */}
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-foreground">
                  Issue Description
                </h3>
                <div className="bg-surface rounded-2xl p-6 min-h-[140px]">
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                    {request.description}
                  </p>
                </div>
              </div>

              {/* Technician Feedback Section - Only shows when status is completed */}
              {request.status === "completed" && (
                <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-foreground">
                        Technician Feedback
                      </h3>
                    </div>
                    {!(request as any).technicianFeedback && (
                      <Button
                        onClick={handleGenerateTechnicianFeedback}
                        disabled={isGeneratingFeedback}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-10 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                      >
                        {isGeneratingFeedback ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Generate AI Feedback"
                        )}
                      </Button>
                    )}
                  </div>

                  {(request as any).technicianFeedback ? (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {(request as any).technicianFeedback}
                          </p>
                          <p className="text-xs text-muted-foreground mt-3">
                            🤖 AI-generated feedback based on repair completion
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface rounded-2xl p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Click the button above to generate AI-powered technician
                        feedback for this completed repair.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Issue Description Card */}
              {/* <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-foreground">
                  Issue Description
                </h3>
                <div className="bg-surface rounded-2xl p-6 min-h-[140px]">
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                    {request.description}
                  </p>
                </div>
              </div> */}

              {/* Customer Details Card */}
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-foreground">
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Name
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {request.firstName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Phone
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {request.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Email
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {request.email}
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-muted-foreground">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Location
                      </p>
                      <p className="text-sm font-black text-foreground leading-none">
                        {typeof request.userId === "object"
                          ? request.userId.location
                          : "Lahore, Pakistan"}
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>
              {/* Status Actions Section */}
              {(request.status === "submitted" ||
                request.status === "request_submitted") && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <Button
                    onClick={() => handleStatusUpdate("in_review")}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-green-500/20"
                    disabled={updateStatus.isPending}
                  >
                    In Review
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-red-500/20"
                    disabled={updateStatus.isPending}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {request.status === "approved" && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Next Step
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Customer has approved the quote. Start the repair when
                      ready.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStatusUpdate("repair_in_progress")}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-purple-500/20 shrink-0"
                    disabled={updateStatus.isPending}
                  >
                    Start Repair
                  </Button>
                </div>
              )}

              {request.status === "repair_in_progress" && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Repair Active
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Click below once all hardware work is finished.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStatusUpdate("completed")}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-green-500/20 shrink-0"
                    disabled={updateStatus.isPending}
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}

              {request.status === "quote_accepted" && (
                <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Quote Accepted
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Mark the repair as completed when all work is finished.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStatusUpdate("completed")}
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-green-500/20 shrink-0"
                    disabled={updateStatus.isPending}
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}

              {/* Sent Notes & Quotes History */}
              {request.shopkeeperNotes &&
                request.shopkeeperNotes.length > 0 && (
                  <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-foreground">
                        Notes & Quotes History
                      </h3>
                      <span className="px-3 py-1 bg-surface rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {request.shopkeeperNotes.length} Entries
                      </span>
                    </div>
                    <div className="space-y-4">
                      {request.shopkeeperNotes
                        .slice()
                        .reverse()
                        .map((note, idx) => (
                          <div
                            key={note._id || idx}
                            className="bg-surface rounded-2xl p-5 border border-border/50 space-y-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  {format(
                                    new Date(note.date),
                                    "MMM dd, hh:mm a",
                                  )}
                                </span>
                              </div>
                              {(note.cost || note.estimatedDays) && (
                                <div className="flex items-center gap-3">
                                  {note.cost && (
                                    <span className="text-sm font-black text-foreground">
                                      {"$"}
                                      {formatCurrency(note.cost)}
                                    </span>
                                  )}
                                  {note.estimatedDays && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase">
                                      {note.estimatedDays} Days
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                              {note.message}
                            </p>
                            {note.images && note.images.length > 0 && (
                              <div className="flex gap-2 pt-2">
                                {note.images.map((img, i) => (
                                  <div
                                    key={i}
                                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-border"
                                  >
                                    <Image
                                      src={img.url}
                                      alt="Note proof"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {request.waitingForPartsDays &&
                request.waitingForPartsDescription && (
                  <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-foreground">
                        Waiting For Parts Details
                      </h3>

                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {request.waitingForPartsDays} Days
                      </span>
                    </div>

                    <div className="bg-surface rounded-2xl p-6 border border-border/50 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Clock3 className="w-5 h-5 text-blue-600" />
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-foreground">
                            Parts Currently Unavailable
                          </h4>

                          <p className="text-xs font-medium text-muted-foreground">
                            Estimated waiting time:{" "}
                            {request.waitingForPartsDays} days
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-card border border-border p-5">
                        <p className="text-sm leading-relaxed font-medium text-foreground/80">
                          {request.waitingForPartsDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upload Evidence Photo */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">
                      Upload Evidence Photo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Attach a picture to this repair request.
                    </p>
                  </div>
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-center transition hover:border-primary hover:bg-primary/5">
                  <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {selectedImage ? selectedImage.name : "Choose image"}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, or WEBP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setSelectedImage(file);
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      } else {
                        setImagePreview(null);
                      }
                    }}
                  />
                </label>

                {imagePreview && (
                  <div className="relative h-40 overflow-hidden rounded-2xl border border-border">
                    <Image
                      src={imagePreview}
                      alt="Selected preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <textarea
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  placeholder="Optional note for this photo"
                  className="min-h-20 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <Button
                  onClick={handleImageUpload}
                  disabled={!selectedImage || addRepairNote.isPending}
                  className="w-full rounded-full bg-primary text-primary-foreground font-black"
                >
                  {addRepairNote.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Upload Photo
                </Button>
              </div>

              {/* Approval Required */}

              <div className="rounded-3xl border border-yellow-200 bg-yellow-50/50 p-6 shadow-sm dark:bg-yellow-900/10 dark:border-yellow-900/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-black text-foreground">
                    Change Repair Status
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      updateResentQuote.mutate({
                        id: id!,
                        status: "order-assigned",
                      });
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#EF4444] hover:text-white font-bold h-11"
                  >
                    Order Assigned
                  </Button>

                  <Button
                    onClick={() => {
                      updateResentQuote.mutate({
                        id: id!,
                        status: "diagnosing",
                      });
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#84CC16] hover:text-white font-bold h-11"
                  >
                    Diagnosing
                  </Button>

                  <Button
                    onClick={() => {
                      updateResentQuote.mutate({
                        id: id!,
                        status: "start-work",
                      });
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#F59E0B] hover:text-white font-bold h-11"
                  >
                    Repairing Device
                  </Button>

                  <Button
                    onClick={() => {
                      setShowOfferModal(true);
                    }}
                    variant="outline"
                    className="flex-1 cursor-pointer rounded-full !bg-[#3B82F6] hover:text-white font-bold h-11"
                  >
                    Waiting for Parts
                  </Button>

                  <RepairOfferModal
                    isOpen={showOfferModal}
                    onClose={() => setShowOfferModal(false)}
                    id={id}
                  />

                  <Button
                    className="flex-1 rounded-full font-bold h-11 cursor-pointer !bg-[#84CC16] text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={() => setIsConfirmOpen(true)}
                    // disabled={updateResentQuote.isPending}
                  >
                    Completed
                  </Button>

                  {isCompletedStatus && (
                    <Button
                      className="flex-1 rounded-full font-bold h-11 cursor-pointer !bg-[#2216cc] text-primary-foreground shadow-lg shadow-primary/20"
                      onClick={() => setIsReassignModalOpen(true)}
                    >
                      Reassigned
                    </Button>
                  )}

                  <RepairRequestFormModal
                    shopkeeper={null}
                    isOpen={isReassignModalOpen}
                    onClose={() => setIsReassignModalOpen(false)}
                    mode="reassign"
                    repairRequest={request}
                  />

                  {isConfirmOpen && (
                    <AlertDialog
                      open={isConfirmOpen}
                      onOpenChange={setIsConfirmOpen}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-amber-600 flex items-center gap-2">
                            Attention Required!
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-gray-700 pt-2 font-medium">
                            Make sure to collect the device IMEI or serial
                            number
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel
                            className=" hover:text-foreground"
                            onClick={() => setIsConfirmOpen(false)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-[#84CC16] hover:bg-[#6da812] text-white"
                            onClick={async () => {
                              setIsConfirmOpen(false);
                              // First update status to completed
                              await updateResentQuote.mutateAsync({
                                id,
                                status: "completed",
                              });
                              // Then generate technician feedback
                              await handleGenerateTechnicianFeedback();
                            }}
                          >
                            Yes, Collected & Complete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          {/* Navigation: Prev */}
          {lightbox.urls.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(
                  (prev) =>
                    prev && {
                      ...prev,
                      index:
                        (prev.index - 1 + prev.urls.length) % prev.urls.length,
                    },
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={lightbox.urls[lightbox.index]}
                alt={`Proof ${lightbox.index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation: Next */}
          {lightbox.urls.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(
                  (prev) =>
                    prev && {
                      ...prev,
                      index: (prev.index + 1) % prev.urls.length,
                    },
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Counter & Close */}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            {lightbox.urls.length > 1 && (
              <span className="text-white/60 text-xs font-bold tabular-nums">
                {lightbox.index + 1} / {lightbox.urls.length}
              </span>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// // "use client";

// // import React from "react";
// // import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
// // import { useSession } from "next-auth/react";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Download, Eye, FileText, Calendar, Store, Phone } from "lucide-react";

// // // Invoice Item matching the API response structure
// // interface InvoiceItem {
// //   _id: string;
// //   invoice: {
// //     public_id: string;
// //     url: string;
// //     resource_type: string;
// //   };
// //   shopkeeperId: {
// //     _id: string;
// //     firstName: string;
// //     lastName: string;
// //     email: string;
// //     role: string;
// //     shopName: string;
// //     phone: string;
// //   };
// //   type: string;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // const InvoiceHistoryPage = () => {
// //   const session = useSession();
// //   const id = session.data?.user?.id;

// //   // Fetching data using your custom hook
// //   const {
// //     data: response,
// //     isLoading,
// //     isError,
// //   } = useMyInvoiceHistory(id as string);

// //   // Safely extract the data array from backend response envelope
// //   const invoices: InvoiceItem[] = response?.data || [];

// //   if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-[400px]">
// //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
// //         <span className="ml-3 font-medium text-muted-foreground">
// //           Loading invoice history...
// //         </span>
// //       </div>
// //     );
// //   }

// //   if (isError) {
// //     return (
// //       <div className="p-6 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
// //         Failed to load invoice history. Please try again later.
// //       </div>
// //     );
// //   }

// //   // Helper to handle force download via dynamic anchor trigger
// //   const handleDownload = async (url: string, filename: string) => {
// //     try {
// //       const response = await fetch(url);

// //       const blob = await response.blob();

// //       const blobUrl = window.URL.createObjectURL(blob);

// //       const link = document.createElement("a");

// //       link.href = blobUrl;
// //       link.download = filename;

// //       document.body.appendChild(link);

// //       link.click();

// //       document.body.removeChild(link);

// //       window.URL.revokeObjectURL(blobUrl);
// //     } catch (error) {
// //       console.error("Download failed:", error);
// //     }
// //   };
// //   return (
// //     <div className="p-4 md:p-8  space-y-6">
// //       {/* Page Header section matching layout weight */}
// //       <div className="flex flex-col gap-1">
// //         <h1 className="text-3xl font-black tracking-tight text-foreground">
// //           Invoice Registry
// //         </h1>
// //         <p className="text-sm font-medium text-muted-foreground">
// //           View and manage all system-generated and custom distribution receipts.
// //         </p>
// //       </div>

// //       <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
// //         <CardHeader className="bg-surface border-b border-border/60 py-5 px-6">
// //           <div className="flex items-center justify-between">
// //             <div className="flex items-center gap-2">
// //               <FileText className="w-5 h-5 text-primary" />
// //               <CardTitle className="text-lg font-bold">
// //                 Billing History
// //               </CardTitle>
// //             </div>
// //             <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider">
// //               Total Records: {invoices.length}
// //             </span>
// //           </div>
// //         </CardHeader>
// //         <CardContent className="p-0">
// //           <div className="overflow-x-auto">
// //             <Table>
// //               <TableHeader className="bg-surface ">
// //                 <TableRow className="hover:bg-transparent">
// //                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
// //                     Invoice ID
// //                   </th>
// //                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
// //                     Merchant / Shop
// //                   </th>
// //                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
// //                     Classification
// //                   </th>
// //                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
// //                     Generation Date
// //                   </th>
// //                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
// //                     Actions
// //                   </th>
// //                 </TableRow>
// //               </TableHeader>
// //               <TableBody>
// //                 {invoices.length === 0 ? (
// //                   <TableRow>
// //                     <td
// //                       colSpan={5}
// //                       className="h-32 text-center text-muted-foreground font-medium"
// //                     >
// //                       No invoices recorded in this account history.
// //                     </td>
// //                   </TableRow>
// //                 ) : (
// //                   invoices.map((item) => {
// //                     const shopkeeper = item.shopkeeperId;
// //                     const formattedDate = new Date(
// //                       item.createdAt,
// //                     ).toLocaleDateString("en-US", {
// //                       year: "numeric",
// //                       month: "short",
// //                       day: "numeric",
// //                     });

// //                     return (
// //                       <TableRow
// //                         key={item._id}
// //                         className="transition-all hover:bg-slate-50/40 group border-b border-border/50"
// //                       >
// //                         {/* Column 1: DB ID representation */}
// //                         <TableCell className="px-6 py-5 font-bold text-slate-600 font-mono text-xs">
// //                           #INV-{item._id.slice(-8).toUpperCase()}
// //                         </TableCell>

// //                         {/* Column 2: Profile info derived from populating shopkeeperId */}
// //                         <TableCell className="px-6 py-5">
// //                           <div className="flex flex-col gap-0.5">
// //                             <span className="font-black text-foreground flex items-center gap-1.5 text-sm">
// //                               <Store className="w-3.5 h-3.5 text-sky-500" />
// //                               {shopkeeper?.shopName || "Unknown Merchant"}
// //                             </span>
// //                             <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
// //                               <Phone className="w-3.5 h-3.5" />
// //                               {shopkeeper?.phone || "N/A"}
// //                             </span>
// //                           </div>
// //                         </TableCell>

// //                         {/* Column 3: Type category logic */}
// //                         <TableCell className="px-6 py-5">
// //                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
// //                             {item.type}
// //                           </span>
// //                         </TableCell>

// //                         {/* Column 4: Processed ISO Timestamp */}
// //                         <TableCell className="px-6 py-5 text-muted-foreground font-bold text-sm">
// //                           <span className="flex items-center gap-1.5">
// //                             <Calendar className="w-3.5 h-3.5 text-slate-400" />
// //                             {formattedDate}
// //                           </span>
// //                         </TableCell>

// //                         {/* Column 5: Action anchors containing the View & Download components */}
// //                         <TableCell
// //                           className="px-6 py-5 text-right"
// //                           onClick={(e) => e.stopPropagation()}
// //                         >
// //                           <div className="flex items-center justify-end gap-2">
// //                             {/* View Button - Opens direct link inside native browser context */}
// //                             <Button
// //                               size="sm"
// //                               variant="outline"
// //                               className="h-9 px-3 border  hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-foreground"
// //                               onClick={() =>
// //                                 window.open(
// //                                   item.invoice.url,
// //                                   "_blank",
// //                                   "noopener,noreferrer",
// //                                 )
// //                               }
// //                             >
// //                               <Eye className="w-3.5 h-3.5" />
// //                               View
// //                             </Button>

// //                             {/* Download Action Component */}
// //                             <Button
// //                               size="sm"
// //                               className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-primary-foreground"
// //                               onClick={async () =>
// //                                 await handleDownload(
// //                                   item.invoice.url,
// //                                   `invoice_${item._id.slice(-6)}.pdf`,
// //                                 )
// //                               }
// //                             >
// //                               <Download className="w-3.5 h-3.5" />
// //                               Download
// //                             </Button>
// //                           </div>
// //                         </TableCell>
// //                       </TableRow>
// //                     );
// //                   })
// //                 )}
// //               </TableBody>
// //             </Table>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default InvoiceHistoryPage;

// "use client";

// import React, { useState } from "react";

// import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";

// import { useSession } from "next-auth/react";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Button } from "@/components/ui/button";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// import {
//   Download,
//   Eye,
//   FileText,
//   Calendar,
//   Store,
//   Phone,
//   RotateCcw,
//   Loader2,
// } from "lucide-react";

// import { Checkbox } from "@/components/ui/checkbox";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import { pdf } from "@react-pdf/renderer";

// import { toast } from "sonner";

// import { useCreateInvoice } from "@/features/shopkeeper/inventory/hooks/useInventory";
// import { InvoicePDF } from "../create-invoice/_components/createInvoice";
// import { InvoiceHistoryItem } from "@/features/shopkeeper/inventory/types";

// // Invoice Item matching the API response structure
// interface InvoiceItem {
//   _id: string;

//   invoice: {
//     public_id: string;
//     url: string;
//     resource_type: string;
//   };

//   shopkeeperId: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     role: string;
//     shopName: string;
//     phone: string;

//     image?: {
//       url: string;
//     };

//     shopAddress?: string;
//   };

//   type: string;

//   customerInfo: {
//     _id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     address: string;
//     customerId?: string;
//     paymentType?: string;
//     alreadyPaid?: number;
//   };

//   itemsIds: {
//     _id: string;
//     itemName: string;
//     imeiNumber: string;
//     expectedPrice: number;

//     image?: {
//       url: string;
//     };
//   }[];

//   createdAt: string;
//   updatedAt: string;
// }

// const InvoiceHistoryPage = () => {
//   const session = useSession();

//   const id = session.data?.user?.id;

//   // Fetching data using your custom hook
//   const {
//     data: response,
//     isLoading,
//     isError,
//   } = useMyInvoiceHistory(id as string);

//   const { mutate: createInvoice, isPending } = useCreateInvoice();

//   // Safely extract the data array from backend response envelope
//   const invoices: InvoiceHistoryItem[] = response?.data || [];

//   const [refundModal, setRefundModal] = useState(false);

//   const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(
//     null,
//   );

//   const [selectedRefundItems, setSelectedRefundItems] = useState<string[]>([]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />

//         <span className="ml-3 font-medium text-muted-foreground">
//           Loading invoice history...
//         </span>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="p-6 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
//         Failed to load invoice history. Please try again later.
//       </div>
//     );
//   }

//   // Helper to handle force download via dynamic anchor trigger
//   const handleDownload = async (url: string, filename: string) => {
//     try {
//       const response = await fetch(url);

//       const blob = await response.blob();

//       const blobUrl = window.URL.createObjectURL(blob);

//       const link = document.createElement("a");

//       link.href = blobUrl;

//       link.download = filename;

//       document.body.appendChild(link);

//       link.click();

//       document.body.removeChild(link);

//       window.URL.revokeObjectURL(blobUrl);
//     } catch (error) {
//       console.error("Download failed:", error);
//     }
//   };

//   const handleOpenRefund = (invoice: InvoiceItem) => {
//     setSelectedInvoice(invoice);

//     setSelectedRefundItems(invoice.itemsIds.map((item) => item._id));

//     setRefundModal(true);
//   };

//   const toggleRefundItem = (id: string) => {
//     setSelectedRefundItems((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
//     );
//   };

//   const handleRefundInvoice = async () => {
//     if (!selectedInvoice) return;

//     try {
//       const remainingItems = selectedInvoice.itemsIds.filter((item) =>
//         selectedRefundItems.includes(item._id),
//       );

//       if (!remainingItems.length) {
//         toast.error("Select at least one item");

//         return;
//       }

//       const mappedItems = remainingItems.map((item) => ({
//         id: item._id,
//         name: item.itemName,
//         price: item.expectedPrice,
//         image: item.image?.url,
//         imeiNumber: item.imeiNumber,
//       }));

//       const totalPrice = mappedItems.reduce((sum, item) => sum + item.price, 0);

//       const alreadyPaid = selectedInvoice.customerInfo?.alreadyPaid || 0;

//       const dueAmount =
//         totalPrice - alreadyPaid <= 0 ? 0 : totalPrice - alreadyPaid;

//       // Generate Refund PDF
//       const doc = (
//         <InvoicePDF
//           customer={selectedInvoice.customerInfo}
//           items={mappedItems}
//           total={totalPrice}
//           shopkeeper={selectedInvoice.shopkeeperId}
//           alreadyPaid={alreadyPaid}
//           dueAmount={dueAmount}
//           InvoiceName="Refund Invoice"
//           paymentType={selectedInvoice.customerInfo?.paymentType || "cash"}
//         />
//       );

//       const blob = await pdf(doc).toBlob();

//       const file = new File(
//         [blob],
//         `refund_invoice_${selectedInvoice._id}.pdf`,
//         {
//           type: "application/pdf",
//         },
//       );

//       createInvoice(
//         {
//           shopkeeperId: selectedInvoice.shopkeeperId._id,

//           customerInfo: selectedInvoice.customerInfo._id,

//           type: "Refunded",

//           invoice: file,

//           itemsIds: selectedRefundItems,
//         },
//         {
//           onSuccess: () => {
//             toast.success("Refund invoice generated successfully");

//             setRefundModal(false);

//             setSelectedInvoice(null);

//             setSelectedRefundItems([]);
//           },

//           onError: () => {
//             toast.error("Refund generation failed");
//           },
//         },
//       );
//     } catch (error) {
//       console.error(error);

//       toast.error("Something went wrong");
//     }
//   };

//   return (
//     <div className="p-4 md:p-8 space-y-6">
//       {/* Page Header */}
//       <div className="flex flex-col gap-1">
//         <h1 className="text-3xl font-black tracking-tight text-foreground">
//           Invoice Registry
//         </h1>

//         <p className="text-sm font-medium text-muted-foreground">
//           View and manage all system-generated and custom distribution receipts.
//         </p>
//       </div>

//       <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
//         <CardHeader className="bg-surface border-b border-border/60 py-5 px-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <FileText className="w-5 h-5 text-primary" />

//               <CardTitle className="text-lg font-bold">
//                 Billing History
//               </CardTitle>
//             </div>

//             <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider">
//               Total Records: {invoices.length}
//             </span>
//           </div>
//         </CardHeader>

//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader className="bg-surface">
//                 <TableRow className="hover:bg-transparent">
//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Invoice ID
//                   </th>

//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Merchant / Shop
//                   </th>

//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Classification
//                   </th>

//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
//                     Generation Date
//                   </th>

//                   <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
//                     Actions
//                   </th>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {invoices.length === 0 ? (
//                   <TableRow>
//                     <td
//                       colSpan={5}
//                       className="h-32 text-center text-muted-foreground font-medium"
//                     >
//                       No invoices recorded in this account history.
//                     </td>
//                   </TableRow>
//                 ) : (
//                   invoices.map((item) => {
//                     const shopkeeper = item.shopkeeperId;

//                     const formattedDate = new Date(
//                       item.createdAt,
//                     ).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "short",
//                       day: "numeric",
//                     });

//                     return (
//                       <TableRow
//                         key={item._id}
//                         className="transition-all hover:bg-slate-50/40 group border-b border-border/50"
//                       >
//                         {/* Invoice ID */}
//                         <TableCell className="px-6 py-5 font-bold text-slate-600 font-mono text-xs">
//                           #INV-
//                           {item._id.slice(-8).toUpperCase()}
//                         </TableCell>

//                         {/* Shop Info */}
//                         <TableCell className="px-6 py-5">
//                           <div className="flex flex-col gap-0.5">
//                             <span className="font-black text-foreground flex items-center gap-1.5 text-sm">
//                               <Store className="w-3.5 h-3.5 text-sky-500" />

//                               {shopkeeper?.shopName || "Unknown Merchant"}
//                             </span>

//                             <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
//                               <Phone className="w-3.5 h-3.5" />

//                               {shopkeeper?.phone || "N/A"}
//                             </span>
//                           </div>
//                         </TableCell>

//                         {/* Type */}
//                         <TableCell className="px-6 py-5">
//                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
//                             {item.type}
//                           </span>
//                         </TableCell>

//                         {/* Date */}
//                         <TableCell className="px-6 py-5 text-muted-foreground font-bold text-sm">
//                           <span className="flex items-center gap-1.5">
//                             <Calendar className="w-3.5 h-3.5 text-slate-400" />

//                             {formattedDate}
//                           </span>
//                         </TableCell>

//                         {/* Actions */}
//                         <TableCell
//                           className="px-6 py-5 text-right"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <div className="flex items-center justify-end gap-2">
//                             {/* View */}
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               className="h-9 px-3 border hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-foreground"
//                               onClick={() =>
//                                 window.open(
//                                   item.invoice.url,
//                                   "_blank",
//                                   "noopener,noreferrer",
//                                 )
//                               }
//                             >
//                               <Eye className="w-3.5 h-3.5" />
//                               View
//                             </Button>

//                             {/* Download */}
//                             <Button
//                               size="sm"
//                               className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-primary-foreground"
//                               onClick={async () =>
//                                 await handleDownload(
//                                   item.invoice.url,
//                                   `invoice_${item._id.slice(-6)}.pdf`,
//                                 )
//                               }
//                             >
//                               <Download className="w-3.5 h-3.5" />
//                               Download
//                             </Button>

//                             {/* Refund */}
//                             {item.type === "Custom invoice" && (
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 className="h-9 px-3 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm"
//                                 onClick={() =>
//                                   handleOpenRefund(item as InvoiceItem)
//                                 }
//                               >
//                                 <RotateCcw className="w-3.5 h-3.5" />
//                                 Refund
//                               </Button>
//                             )}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* REFUND MODAL */}
//       <Dialog open={refundModal} onOpenChange={setRefundModal}>
//         <DialogContent className="max-w-3xl rounded-[28px] p-0 overflow-hidden">
//           <DialogHeader className="px-6 py-5 border-b">
//             <DialogTitle className="text-xl font-black">
//               Refund Invoice
//             </DialogTitle>
//           </DialogHeader>

//           <div className="p-6 space-y-6">
//             {/* CUSTOMER */}
//             <div className="bg-slate-50 rounded-2xl p-5 border">
//               <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-3">
//                 Customer Information
//               </h3>

//               <div className="space-y-1">
//                 <p className="font-black text-lg">
//                   {selectedInvoice?.customerInfo?.firstName}{" "}
//                   {selectedInvoice?.customerInfo?.lastName}
//                 </p>

//                 <p className="text-sm text-muted-foreground">
//                   {selectedInvoice?.customerInfo?.email}
//                 </p>

//                 <p className="text-sm text-muted-foreground">
//                   {selectedInvoice?.customerInfo?.phone}
//                 </p>
//               </div>
//             </div>

//             {/* ITEMS */}
//             <div className="space-y-4">
//               <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
//                 Select Remaining Items
//               </h3>

//               <div className="space-y-3">
//                 {selectedInvoice?.itemsIds?.map((item) => {
//                   const checked = selectedRefundItems.includes(item._id);

//                   return (
//                     <div
//                       key={item._id}
//                       className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
//                         checked
//                           ? "border-orange-300 bg-orange-50"
//                           : "border-border"
//                       }`}
//                     >
//                       <div className="flex items-center gap-4">
//                         <Checkbox
//                           checked={checked}
//                           onCheckedChange={() => toggleRefundItem(item._id)}
//                         />

//                         <img
//                           src={item.image?.url}
//                           alt={item.itemName}
//                           className="w-14 h-14 rounded-2xl object-cover"
//                         />

//                         <div>
//                           <p className="font-black text-sm">{item.itemName}</p>

//                           <p className="text-xs text-muted-foreground font-medium">
//                             IMEI: {item.imeiNumber}
//                           </p>
//                         </div>
//                       </div>

//                       <p className="font-black text-lg">
//                         ${item.expectedPrice}
//                       </p>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* FOOTER */}
//             <div className="flex justify-end gap-3 pt-4 border-t">
//               <Button
//                 variant="outline"
//                 className="rounded-xl"
//                 onClick={() => setRefundModal(false)}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 onClick={handleRefundInvoice}
//                 disabled={selectedRefundItems.length === 0 || isPending}
//                 className="rounded-xl font-black"
//               >
//                 Generate Refund Invoice
//                 {isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default InvoiceHistoryPage;

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState } from "react";
import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Eye,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";

import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { useCreateInvoice } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { InvoiceHistoryItem } from "@/features/shopkeeper/inventory/types";
import { pdfStyles } from "../create-invoice/_components/createInvoice";
import { useCurrency } from "@/hooks/useCurrency";
import { formatCurrency as baseFormatCurrency } from "@/lib/currency";
import { getPdfLogoStyles } from "@/lib/logoHelper";

interface InvoiceItem {
  _id: string;
  invoice: {
    public_id: string;
    url: string;
    resource_type: string;
  };
  shopkeeperId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    shopName: string;
    phone: string;
    image?: {
      url: string;
    };
    shopAddress?: string;
  };
  type: string;
  customerInfo: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    customerId?: string;
    paymentType?: string;
    alreadyPaid?: number;
  };
  itemsIds: {
    _id: string;
    itemName: string;
    imeiNumber: string;
    expectedPrice: number;
    image?: {
      url: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

const InvoicePDF = ({
  customer,
  items,
  total,
  shopkeeper,
  alreadyPaid,
  dueAmount,
  paymentType,
  card,
  InvoiceName,
  isCustomRefund,
  refundReason,
  currency = "USD",
}: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Decorative Top Bar */}
      <View style={pdfStyles.headerBar} />

      {/* Brand Header */}
      <View style={pdfStyles.topSection}>
        {shopkeeper?.image?.url ? (
          (() => {
            const logoStyles = getPdfLogoStyles(
              shopkeeper.logoSettings,
              110,
              42,
            );
            return (
              <View style={logoStyles.container}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={shopkeeper.image.url} style={logoStyles.image} />
              </View>
            );
          })()
        ) : (
          <Text
            style={[
              pdfStyles.invoiceTitle,
              { textAlign: "left", fontSize: 20 },
            ]}
          >
            {shopkeeper?.shopName || "STORE"}
          </Text>
        )}
        <View style={pdfStyles.invoiceMeta}>
          <Text style={pdfStyles.invoiceTitle}>
            {InvoiceName ? InvoiceName : "INVOICE"}
          </Text>
          <Text style={pdfStyles.dateText}>
            Date:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Information Cards */}
      <View style={pdfStyles.infoContainer}>
        {/* Customer Card */}
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoLabel}>Client Details</Text>
          <Text style={pdfStyles.customerName}>
            {`${customer?.firstName || "Valued"} ${customer?.lastName || "Customer"}`}
          </Text>
          <Text style={pdfStyles.infoText}>
            Email: {customer?.email || "N/A"}
          </Text>
          <Text style={pdfStyles.infoText}>
            Phone: {customer?.phone || "N/A"}
          </Text>
          <Text style={pdfStyles.infoText}>
            Address: {customer?.address || "N/A"}
          </Text>
          <Text
            style={[
              pdfStyles.infoText,
              { fontSize: 7.5, color: "#94a3b8", marginTop: 4 },
            ]}
          >
            ID: {customer?.customerId || "N/A"}
          </Text>

          <Text style={pdfStyles.paymentMethod}>
            {paymentType ? paymentType.toUpperCase() : "N/A"}
            {paymentType === "card" && card ? ` •••• ${card}` : ""}
          </Text>
        </View>

        {/* Store Card */}
        <View style={pdfStyles.infoBox}>
          <Text style={pdfStyles.infoLabelBlue}>Store Information</Text>
          <Text style={pdfStyles.customerName}>
            {shopkeeper?.shopName || "Gadget Galaxy"}
          </Text>
          <Text style={pdfStyles.infoText}>
            {shopkeeper?.shopAddress || "N/A"}
          </Text>
          <Text style={pdfStyles.infoText}>
            Email: {shopkeeper?.email || "N/A"}
          </Text>
          <Text style={pdfStyles.infoText}>
            Phone: {shopkeeper?.phone || "N/A"}
          </Text>
        </View>
      </View>

      {/* Refund Context / Notes Section */}
      {refundReason && (
        <View
          style={{
            marginTop: 15,
            padding: 12,
            backgroundColor: "#fff7ed",
            borderLeft: "4px solid #f97316",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              color: "#c2410c",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Refund Reason / Notes
          </Text>
          <Text style={{ fontSize: 9.5, color: "#431407", lineHeight: 1.4 }}>
            {refundReason}
          </Text>
        </View>
      )}

      {/* Modern Product Table */}
      <View
        style={[pdfStyles.tableHeader, { marginTop: refundReason ? 15 : 20 }]}
      >
        <Text style={pdfStyles.colProduct}>Item Description</Text>
        <Text style={pdfStyles.colId}>IMEI / Model ID</Text>
        <Text style={pdfStyles.colPrice}>Amount</Text>
      </View>

      {items && items.length > 0
        ? items.map((item: any) => (
            <View key={item.id} style={pdfStyles.tableRow}>
              <View style={pdfStyles.colProduct}>
                {item.image && (
                  <Image src={item.image} style={pdfStyles.productImg} />
                )}
                <View>
                  <Text style={pdfStyles.productText}>{item.name}</Text>
                  <Text style={pdfStyles.productSub}>
                    Brand New • Official Local Warranty
                  </Text>
                </View>
              </View>
              <Text style={pdfStyles.colId}>{item.imeiNumber || "N/A"}</Text>
              <Text style={pdfStyles.colPrice}>
                {baseFormatCurrency(item.price || 0, currency)}
              </Text>
            </View>
          ))
        : isCustomRefund && (
            <View style={pdfStyles.tableRow}>
              <View style={pdfStyles.colProduct}>
                <View>
                  <Text style={pdfStyles.productText}>
                    Custom Refund Settlement
                  </Text>
                  <Text style={pdfStyles.productSub}>
                    Independent Financial Adjustment
                  </Text>
                </View>
              </View>
              <Text style={pdfStyles.colId}>N/A</Text>
              <Text style={pdfStyles.colPrice}>
                {baseFormatCurrency(total || 0, currency)}
              </Text>
            </View>
          )}

      {/* Calculations & Status section */}
      <View style={pdfStyles.totalSection}>
        <View style={pdfStyles.totalBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
            <Text style={pdfStyles.summaryValue}>
              {baseFormatCurrency(total || 0, currency)}
            </Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Amount Paid</Text>
            <Text style={pdfStyles.summaryValue}>
              {baseFormatCurrency(alreadyPaid || 0, currency)}
            </Text>
          </View>

          <View style={pdfStyles.divider} />

          <View style={pdfStyles.balanceRow}>
            <Text style={pdfStyles.balanceLabel}>Balance Due</Text>
            <Text
              style={[
                pdfStyles.balanceValue,
                { color: dueAmount <= 0 ? "#22c55e" : "#ef4444" },
              ]}
            >
              {baseFormatCurrency(dueAmount || 0, currency)}
            </Text>
          </View>

          {dueAmount <= 0 ? (
            <Text style={pdfStyles.statusBadgePaid}>FULLY PAID</Text>
          ) : (
            <Text style={pdfStyles.statusBadgeDue}>
              DUE: {baseFormatCurrency(dueAmount || 0, currency)}
            </Text>
          )}
        </View>
      </View>

      {/* Minimalist Footer */}
      <Text style={pdfStyles.footer}>
        Thank you for choosing Gadget Galaxy! We appreciate your business.{" "}
        {"\n"}
        This is an electronically generated invoice, official signature is not
        required.
      </Text>
    </Page>
  </Document>
);

const InvoiceHistoryPage = () => {
  const session = useSession();
  const id = session.data?.user?.id;
  const { currency, formatCurrency } = useCurrency();
  const [page, setPage] = useState(1);

  const {
    data: response,
    isLoading,
    isError,
  } = useMyInvoiceHistory(id as string, true, page, 10);

  const { mutate: createInvoice, isPending } = useCreateInvoice();

  const invoices: InvoiceHistoryItem[] = response?.data || [];
  const totalPages = Math.max(response?.meta?.totalPage || 1, 1);

  const [refundModal, setRefundModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(
    null,
  );
  const [selectedRefundItems, setSelectedRefundItems] = useState<string[]>([]);

  // Custom Refund States
  const [isCustomRefund, setIsCustomRefund] = useState(false);
  const [customRefundAmount, setCustomRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 font-medium text-muted-foreground">
          Loading invoice history...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
        Failed to load invoice history. Please try again later.
      </div>
    );
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleOpenRefund = (invoice: InvoiceItem) => {
    setSelectedInvoice(invoice);
    setSelectedRefundItems(invoice.itemsIds.map((item) => item._id));
    setIsCustomRefund(false);
    setCustomRefundAmount("");
    setRefundReason("");
    setRefundModal(true);
  };

  const toggleRefundItem = (id: string) => {
    if (isCustomRefund) return;
    setSelectedRefundItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleRefundInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      let mappedItems: any[] = [];
      let totalPrice = 0;

      if (isCustomRefund) {
        const parsedAmount = parseFloat(customRefundAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          toast.error("Please enter a valid custom refund amount");
          return;
        }
        totalPrice = parsedAmount;
        mappedItems = [];
      } else {
        const remainingItems = selectedInvoice.itemsIds.filter((item) =>
          selectedRefundItems.includes(item._id),
        );

        if (!remainingItems.length) {
          toast.error("Select at least one item");
          return;
        }

        mappedItems = remainingItems.map((item) => ({
          id: item._id,
          name: item.itemName,
          price: item.expectedPrice,
          image: item.image?.url,
          imeiNumber: item.imeiNumber,
        }));

        totalPrice = mappedItems.reduce((sum, item) => sum + item.price, 0);
      }

      const alreadyPaid = selectedInvoice.customerInfo?.alreadyPaid || 0;
      const dueAmount =
        totalPrice - alreadyPaid <= 0 ? 0 : totalPrice - alreadyPaid;

      // Generate Refund PDF
      const doc = (
        <InvoicePDF
          customer={selectedInvoice.customerInfo}
          items={mappedItems}
          total={totalPrice}
          shopkeeper={selectedInvoice.shopkeeperId}
          alreadyPaid={alreadyPaid}
          dueAmount={dueAmount}
          InvoiceName="Refund Invoice"
          paymentType={selectedInvoice.customerInfo?.paymentType || "cash"}
          isCustomRefund={isCustomRefund}
          refundReason={refundReason.trim()}
          currency={currency}
        />
      );

      const blob = await pdf(doc).toBlob();
      const file = new File(
        [blob],
        `refund_invoice_${selectedInvoice._id}.pdf`,
        { type: "application/pdf" },
      );

      createInvoice(
        {
          shopkeeperId: selectedInvoice.shopkeeperId._id,
          customerInfo: selectedInvoice.customerInfo._id,
          type: "Refunded",
          invoice: file,
          itemsIds: isCustomRefund ? [] : selectedRefundItems,
        },
        {
          onSuccess: () => {
            toast.success("Refund invoice generated successfully");
            setRefundModal(false);
            setSelectedInvoice(null);
            setSelectedRefundItems([]);
            setCustomRefundAmount("");
            setIsCustomRefund(false);
            setRefundReason("");
          },
          onError: () => {
            toast.error("Refund generation failed");
          },
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Invoice Registry
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          View and manage all system-generated and custom distribution receipts.
        </p>
      </div>

      <Card className="rounded-[28px] border p-0 border-border bg-card overflow-hidden shadow-sm">
        <CardHeader className="bg-surface border-b border-border/60 py-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold">
                Billing History
              </CardTitle>
            </div>
            <span className="text-xs font-black text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full uppercase tracking-wider">
              Total Records: {response?.meta?.total || invoices.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface">
                <TableRow className="hover:bg-transparent">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Invoice ID
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Classification
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Generation Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </th>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground font-medium"
                    >
                      No invoices recorded in this account history.
                    </td>
                  </TableRow>
                ) : (
                  invoices.map((item) => {
                    const customer =
                      typeof item.customerInfo === "object"
                        ? item.customerInfo
                        : null;
                    const formattedDate = new Date(
                      item.createdAt,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <TableRow
                        key={item._id}
                        className="transition-all hover:bg-slate-50/40 group border-b border-border/50"
                      >
                        <TableCell className="px-6 py-5 font-bold text-slate-600 font-mono text-xs">
                          #INV-{item._id.slice(-8).toUpperCase()}
                        </TableCell>

                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black text-foreground flex items-center gap-1.5 text-sm">
                              <User className="w-3.5 h-3.5 text-sky-500" />
                              {customer?.firstName || "Walk-in Customer"}{" "}
                              {customer?.lastName || ""}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {customer?.phone || "N/A"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            {item.type}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-5 text-muted-foreground font-bold text-sm">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </span>
                        </TableCell>

                        <TableCell
                          className="px-6 py-5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 border hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-foreground"
                              onClick={() =>
                                window.open(
                                  item.invoice.url,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>

                            <Button
                              size="sm"
                              className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm text-primary-foreground"
                              onClick={async () =>
                                await handleDownload(
                                  item.invoice.url,
                                  `invoice_${item._id.slice(-6)}.pdf`,
                                )
                              }
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </Button>

                            {item.type === "Custom invoice" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-9 px-3 font-bold text-xs flex items-center gap-1.5 rounded-xl shadow-sm"
                                onClick={() =>
                                  handleOpenRefund(item as InvoiceItem)
                                }
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Refund
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {response?.meta && (
            <div className="flex flex-col gap-3 border-t border-border bg-surface/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Page {page} of {totalPages} · {response.meta.total} total
                invoices
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  disabled={page === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* REFUND MODAL */}
      <Dialog open={refundModal} onOpenChange={setRefundModal}>
        <DialogContent className="max-w-3xl rounded-[28px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b">
            <DialogTitle className="text-xl font-black">
              Refund Invoice
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* CUSTOMER */}
            <div className="bg-slate-50 rounded-2xl p-5 border">
              <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-3">
                Customer Information
              </h3>
              <div className="space-y-1">
                <p className="font-black text-lg">
                  {selectedInvoice?.customerInfo?.firstName}{" "}
                  {selectedInvoice?.customerInfo?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedInvoice?.customerInfo?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedInvoice?.customerInfo?.phone}
                </p>
              </div>
            </div>

            {/* TOGGLE FOR CUSTOM REFUND */}
            <div className="flex items-center space-x-3 p-2 bg-slate-50/50 border rounded-2xl">
              <Checkbox
                id="custom-refund-toggle"
                checked={isCustomRefund}
                onCheckedChange={(checked) => setIsCustomRefund(!!checked)}
              />
              <Label
                htmlFor="custom-refund-toggle"
                className="text-sm font-bold cursor-pointer select-none"
              >
                Issue a Custom Refund Amount (Independent of Line Items)
              </Label>
            </div>

            {/* ITEMS / CUSTOM AMOUNT WRAPPER */}
            {!isCustomRefund ? (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                  Select Remaining Items
                </h3>
                <div className="space-y-3">
                  {selectedInvoice?.itemsIds?.map((item) => {
                    const checked = selectedRefundItems.includes(item._id);
                    return (
                      <div
                        key={item._id}
                        className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                          checked
                            ? "border-orange-300 bg-orange-50"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleRefundItem(item._id)}
                          />
                          {item.image?.url && (
                            <img
                              src={item.image.url}
                              alt={item.itemName}
                              className="w-14 h-14 rounded-2xl object-cover"
                            />
                          )}
                          <div>
                            <p className="font-black text-sm">
                              {item.itemName}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              IMEI: {item.imeiNumber}
                            </p>
                          </div>
                        </div>
                        <p className="font-black text-lg">
                          {formatCurrency(item.expectedPrice)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* CUSTOM REFUND AMOUNT FIELD */
              <div className="space-y-2 bg-orange-50/40 border border-orange-100 rounded-2xl p-5">
                <Label
                  htmlFor="custom-amount"
                  className="text-sm font-black uppercase tracking-wider text-orange-800"
                >
                  Custom Refund Amount ({currency})
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter specific amount to refund (e.g., 10)"
                  value={customRefundAmount}
                  onChange={(e) => setCustomRefundAmount(e.target.value)}
                  className="rounded-xl font-bold bg-background border-border"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This execution will bypass item list compilation inside the
                  generated refund summary.
                </p>
              </div>
            )}

            {/* REFUND REASON / CONTEXT FIELD (Always stays accessible for both custom and regular flow) */}
            <div className="space-y-2 pt-2">
              <Label
                htmlFor="refund-reason"
                className="text-sm font-black uppercase tracking-wider text-muted-foreground"
              >
                Refund Reason / Notes
              </Label>
              <Textarea
                id="refund-reason"
                placeholder="Write reason (e.g., Refunded because customer was overcharged)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="rounded-xl font-medium border-border min-h-[90px] resize-none"
              />
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setRefundModal(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleRefundInvoice}
                disabled={
                  (!isCustomRefund && selectedRefundItems.length === 0) ||
                  (isCustomRefund && !customRefundAmount) ||
                  isPending
                }
                className="rounded-xl font-black"
              >
                Generate Refund Invoice
                {isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceHistoryPage;

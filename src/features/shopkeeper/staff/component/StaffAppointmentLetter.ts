import jsPDF from "jspdf";

export interface StaffAppointmentDetails {
  fullName: string;
  staffId: string;
  email: string;
  phone?: string;
  jobRole: string;
  storeName: string;
  storeAddress?: string;
  wageType: string;
  wageAmount: number | string;
  workingDays: string[];
  weekendDays: string[];
  pinCode?: string;
  addressLine1?: string;
  townCity?: string;
  county?: string;
  postcode?: string;
}

export function generateStaffAppointmentLetter(
  details: StaffAppointmentDetails,
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [132, 204, 22]; // #84cc16
  const darkColor = [30, 41, 59]; // slate-800
  const mutedColor = [100, 116, 139]; // slate-500

  // Header Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 8, "F");

  // Company Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("MOBILISE RETAIL", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text("Smarter Retail. Stronger Teams.", 20, 31);
  doc.text("Official Appointment & Access Credentials Letter", 20, 36);

  // Date & Reference
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(9);
  doc.text(`Date: ${today}`, 150, 25);
  doc.text(`Reference: ${details.staffId}`, 150, 30);
  doc.text(`Status: Active`, 150, 35);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);

  // Recipient details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("STAFF APPOINTMENT RECORD", 20, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Dear ${details.fullName},`, 20, 60);

  doc.setFontSize(9.5);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(
    `We are delighted to confirm your appointment and system registration at ${details.storeName}.`,
    20,
    67,
  );
  doc.text(
    "Please find your employment details, operational schedule, and EPOS access credentials below.",
    20,
    72,
  );

  // Section 1: Staff Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 78, 170, 42, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 78, 170, 42, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("1. Employee & Store Information", 25, 86);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Staff ID:`, 25, 93);
  doc.setFont("helvetica", "bold");
  doc.text(details.staffId, 55, 93);

  doc.setFont("helvetica", "normal");
  doc.text(`Assigned Store:`, 25, 99);
  doc.setFont("helvetica", "bold");
  doc.text(details.storeName, 55, 99);

  doc.setFont("helvetica", "normal");
  doc.text(`Designation / Role:`, 25, 105);
  doc.setFont("helvetica", "bold");
  doc.text(details.jobRole, 60, 105);

  doc.setFont("helvetica", "normal");
  doc.text(`Email:`, 110, 93);
  doc.setFont("helvetica", "bold");
  doc.text(details.email, 125, 93);

  doc.setFont("helvetica", "normal");
  doc.text(`Phone:`, 110, 99);
  doc.setFont("helvetica", "bold");
  doc.text(details.phone || "N/A", 125, 99);

  if (details.postcode) {
    doc.setFont("helvetica", "normal");
    doc.text(`Address:`, 110, 105);
    doc.setFont("helvetica", "bold");
    const addressStr = [
      details.addressLine1,
      details.townCity,
      details.postcode,
    ]
      .filter(Boolean)
      .join(", ");
    doc.text(addressStr.slice(0, 30), 125, 105);
  }

  // Section 2: Wage & Working Schedule
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 126, 170, 42, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 126, 170, 42, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("2. Wage Rate & Work Schedule", 25, 134);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Wage Basis:`, 25, 141);
  doc.setFont("helvetica", "bold");
  doc.text(
    details.wageType === "per-hour" ? "Hourly Pay" : "Daily Pay",
    55,
    141,
  );

  doc.setFont("helvetica", "normal");
  doc.text(`Rate of Pay:`, 25, 147);
  doc.setFont("helvetica", "bold");
  doc.text(
    `£${Number(details.wageAmount || 0).toFixed(2)} ${details.wageType === "per-hour" ? "/ hour" : "/ day"}`,
    55,
    147,
  );

  doc.setFont("helvetica", "normal");
  doc.text(`Working Days:`, 25, 153);
  doc.setFont("helvetica", "bold");
  doc.text(details.workingDays.join(", ") || "Mon - Fri", 55, 153);

  doc.setFont("helvetica", "normal");
  doc.text(`Scheduled Days Off:`, 25, 159);
  doc.setFont("helvetica", "bold");
  doc.text(details.weekendDays.join(", ") || "Sat, Sun", 62, 159);

  // Section 3: EPOS Till Login & Security
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 174, 170, 44, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 174, 170, 44, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("3. Till Login Credentials & Biometric NFC Attendance", 25, 182);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Use your Staff ID and PIN to switch staff at the checkout till. This identifies you on customer receipts.",
    25,
    189,
  );

  // PIN Box Highlight
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(25, 194, 75, 16, 2, 2, "F");
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(25, 194, 75, 16, 2, 2, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text(`Staff Login ID:`, 30, 200);
  doc.setFont("helvetica", "bold");
  doc.text(details.staffId, 55, 200);

  doc.setFont("helvetica", "normal");
  doc.text(`EPOS PIN:`, 30, 206);
  doc.setFont("helvetica", "bold");
  doc.text(details.pinCode ? details.pinCode : "•••• (Secured)", 55, 206);

  // NFC & Face Notice
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(
    "NFC & Face ID attendance verification is enabled for your shifts.",
    105,
    200,
  );
  doc.text("Clock in / out with store terminal or mobile app.", 105, 205);

  // Notice & Confidentiality
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(
    "Confidential: Do not share your EPOS PIN. All activities at the till are logged and auditable.",
    20,
    228,
  );

  // Signatures
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  doc.line(25, 255, 80, 255);
  doc.text("Store Manager / Owner Signature", 25, 260);

  doc.line(130, 255, 185, 255);
  doc.text("Employee Acceptance Signature", 130, 260);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(
    "Mobilise Retail Solutions Ltd • Registered in England & Wales",
    20,
    280,
  );
  doc.text(`Generated on ${today} • System ID: ${details.staffId}`, 130, 280);

  const filename = `Mobilise_Staff_Letter_${details.staffId}.pdf`;
  doc.save(filename);
}

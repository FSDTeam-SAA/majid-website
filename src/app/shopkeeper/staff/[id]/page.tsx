import { Metadata } from "next";
import { StaffAttendanceRecord } from "@/features/shopkeeper/staff/component/StaffAttendanceRecord";

export const metadata: Metadata = {
  title: "Staff Attendance & Wage Record | Shopkeeper Dashboard",
  description:
    "View detailed staff monthly attendance logs, calculate gross wages, and manage leave balance.",
};

export default async function StaffAttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaffAttendanceRecord staffId={id} />;
}

import { Metadata } from "next";
import { StaffRotaView } from "@/features/shopkeeper/rota/components/StaffRotaView";

export const metadata: Metadata = {
  title: "Staff Rota | Shopkeeper Dashboard",
  description:
    "Plan and publish weekly staff shifts, monitor coverage, and manage rota costs.",
};

export default function SettingsStaffRotaPage() {
  return <StaffRotaView />;
}

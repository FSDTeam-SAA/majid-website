import { Metadata } from "next";
import { WagesDashboard } from "@/features/shopkeeper/wages/components/WagesDashboard";

export const metadata: Metadata = {
  title: "Staff Wages & Pay Periods | Shopkeeper Dashboard",
  description:
    "Review employee hours, resolve attendance exceptions, and approve pay periods.",
};

export default function SettingsStaffWagesPage() {
  return <WagesDashboard />;
}

import { redirect } from "next/navigation";

export const metadata = {
  title: "Staff Wages & Pay Periods | Shopkeeper Dashboard",
  description:
    "Review employee hours, resolve attendance exceptions, and approve pay periods.",
};

export default function WagesPage() {
  redirect("/shopkeeper/settings/staff/wages");
}

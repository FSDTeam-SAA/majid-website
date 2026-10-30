import { redirect } from "next/navigation";

export const metadata = {
  title: "Staff Rota | Shopkeeper Dashboard",
  description:
    "Plan and publish weekly staff shifts, monitor coverage, and manage rota costs.",
};

export default function RotaPage() {
  redirect("/shopkeeper/settings/staff/rota");
}

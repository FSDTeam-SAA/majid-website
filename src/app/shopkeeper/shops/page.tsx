import { redirect } from "next/navigation";

export const metadata = {
  title: "My Shops | Shopkeeper Dashboard",
  description: "Manage your shops and add new ones.",
};

export default function ShopsPage() {
  redirect("/shopkeeper/settings/my-shop");
}

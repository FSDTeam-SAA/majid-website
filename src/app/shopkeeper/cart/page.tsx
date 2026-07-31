import { redirect } from "next/navigation";

export const metadata = {
  title: "Checkout | Shopkeeper Dashboard",
  description: "Shopkeeper checkout and order processing",
};

export default function CartPage() {
  redirect("/shopkeeper/checkout");
}

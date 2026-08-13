import Transactions from "@/features/shopkeeper/payment/component/Transactions";

export const metadata = {
  title: "Transactions | Shopkeeper Dashboard",
  description: "View and manage your checkout transactions.",
};

export default function TransactionsPage() {
  return <Transactions />;
}

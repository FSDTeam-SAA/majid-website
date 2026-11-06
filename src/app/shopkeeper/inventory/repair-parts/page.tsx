import { RepairPartsInventory } from "@/features/shopkeeper/repairParts/component/RepairPartsInventory";

export const metadata = {
  title: "Repair Parts Inventory | Shopkeeper",
  description: "Manage repair spare parts, deliveries, and stock adjustments",
};

export default function RepairPartsPage() {
  return <RepairPartsInventory />;
}

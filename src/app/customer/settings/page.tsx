import Settings from "@/features/shopkeeper/settings/component/Settings";

export const metadata = {
  title: "Account Settings | Customer Dashboard",
  description: "Manage your profile information and account security settings.",
};

export default function SettingsPage() {
  return <Settings showSubscriptionSummary />;
}

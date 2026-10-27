import { Metadata } from "next";
import { NfcAttendanceSettings } from "@/features/shopkeeper/settings/components/NfcAttendanceSettings";

export const metadata: Metadata = {
  title: "NFC Store Beacon Setup | Shopkeeper Settings",
  description:
    "Configure revocable NFC store beacon link, download counter QR codes, and assign Area Managers.",
};

export default function NfcSettingsPage() {
  return <NfcAttendanceSettings />;
}

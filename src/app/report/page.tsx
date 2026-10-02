import type { Metadata } from "next";
import Navbar from "@/components/shared/website/Navbar";
import Footer from "@/components/shared/website/Footer";
import DeviceReportVerification from "@/features/report/component/DeviceReportVerification";

export const metadata: Metadata = {
  title: "Device Verification & Certificate Lookup | IMOSCAN",
  description:
    "Verify official device certificates, IMEI blacklist status, iCloud lock, and hardware authenticity in real time.",
};

export default function GeneralReportPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <DeviceReportVerification />
      </main>
      <Footer />
    </div>
  );
}

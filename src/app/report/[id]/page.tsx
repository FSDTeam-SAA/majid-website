import type { Metadata } from "next";
import Navbar from "@/components/shared/website/Navbar";
import Footer from "@/components/shared/website/Footer";
import DeviceReportVerification from "@/features/report/component/DeviceReportVerification";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Device Verification Certificate - ${id} | IMOSCAN`,
    description: `Official Imoscan verification report and certificate for IMEI / Serial ${id}. Verify blacklist, iCloud status, warranty, and carrier lock.`,
  };
}

export default function DeviceReportPage() {
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

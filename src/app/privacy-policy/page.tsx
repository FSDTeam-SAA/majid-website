import type { Metadata } from "next";

import Footer from "@/components/shared/website/Footer";
import Navbar from "@/components/shared/website/Navbar";
import PrivacyPolicy from "@/features/Home/component/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | IMOSCAN",
  description:
    "Read the IMOSCAN Privacy Policy to understand how we collect, process, protect, and retain personal data across our device intelligence platform and services.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 md:pt-28">
        <PrivacyPolicy />
      </main>
      <Footer />
    </div>
  );
}

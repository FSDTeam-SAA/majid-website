import type { Metadata } from "next";
import Navbar from "@/components/shared/website/Navbar";
import Footer from "@/components/shared/website/Footer";
import TermsConditions from "@/features/Home/component/TermsConditions";

export const metadata: Metadata = {
  title: "Terms and Conditions | IMOSCAN",
  description:
    "Review the Terms and Conditions governing access and use of the IMOSCAN platform, IMEI intelligence, software, and commercial services.",
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 pt-20 md:pt-28 pb-16">
        <TermsConditions />
      </main>
      <Footer />
    </div>
  );
}

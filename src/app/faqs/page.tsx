import type { Metadata } from "next";
import Footer from "@/components/shared/website/Footer";
import Navbar from "@/components/shared/website/Navbar";
import FAQS from "@/features/Home/component/FAQS";

export const metadata: Metadata = {
  title: "FAQs | IMOSCAN",
  description:
    "Find answers about imoscan, including EPOS, inventory, repairs, trade-ins, payments, security and support.",
};

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FAQS />
      <Footer />
    </div>
  );
}

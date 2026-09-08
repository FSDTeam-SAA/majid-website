import type { Metadata } from "next";
import Footer from "@/components/shared/website/Footer";
import Navbar from "@/components/shared/website/Navbar";
import About from "@/features/Home/component/About";

export const metadata: Metadata = {
  title: "About imoscan | IMOSCAN",
  description:
    "Learn how imoscan helps gadget retailers and repair businesses manage their day-to-day operations.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <About />
      <Footer />
    </div>
  );
}

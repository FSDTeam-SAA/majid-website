import type { Metadata } from "next";
import Footer from "@/components/shared/website/Footer";
import Navbar from "@/components/shared/website/Navbar";
import ContactUs from "@/features/Home/component/ContactUs";

export const metadata: Metadata = {
  title: "Contact Us | IMOSCAN",
  description:
    "Contact the imoscan team about services, privacy, cookies, app tracking or support.",
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ContactUs />
      <Footer />
    </div>
  );
}

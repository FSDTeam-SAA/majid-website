"use client";

import { Facebook, Twitter, Linkedin, Link2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-background pt-24 pb-12 border-t border-border">
      <div className="mx-auto container px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link href="/">
              <div className="relative h-12 w-[200px] mb-8 cursor-pointer">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  quality={100}
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
              AI-powered IMEI & device intelligence platform providing real-time
              data for global mobile ecosystems.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-8">
              Company
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-[#84CC16] transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-sm text-muted-foreground hover:text-[#84CC16] transition"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#84CC16] transition"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-8">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/faqs"
                  className="text-sm text-muted-foreground hover:text-[#84CC16] transition"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="text-sm text-muted-foreground hover:text-[#84CC16] transition"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-[#84CC16] transition"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-8">
              Connect
            </h4>
            <div className="flex flex-wrap gap-3 mb-6">
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Linkedin size={18} />} />
              <SocialIcon icon={<Link2 size={18} />} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-muted-foreground">
            © 2026 Imoscan AI. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="/privacy-policy"
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition uppercase tracking-widest"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-conditions"
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition uppercase tracking-widest"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition uppercase tracking-widest"
            >
              Cookie Settings..
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <Link
      href="#"
      className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border shadow-sm text-muted-foreground hover:border-[#84CC16] hover:text-[#84CC16] transition-all"
    >
      {icon}
    </Link>
  );
}

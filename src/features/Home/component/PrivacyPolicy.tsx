"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Scale,
  Database,
  Layers,
  ClipboardList,
  Camera,
  Sparkles,
  Share2,
  Globe,
  Clock,
  Lock,
  UserCheck,
  Mail,
  Cookie,
  Baby,
  History,
  PhoneCall,
  FileText,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Search,
  Copy,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Printer,
  ShieldAlert,
  Server,
  Key,
} from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  num: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: "section-1", num: "01", title: "Who we are", icon: Building2 },
  {
    id: "section-2",
    num: "02",
    title: "Our data-protection role",
    icon: Scale,
  },
  {
    id: "section-3",
    num: "03",
    title: "Information we may process",
    icon: Database,
  },
  {
    id: "section-4",
    num: "04",
    title: "Where information comes from",
    icon: Layers,
  },
  {
    id: "section-5",
    num: "05",
    title: "Why we use information",
    icon: ClipboardList,
  },
  {
    id: "section-6",
    num: "06",
    title: "Customer records & ID documents",
    icon: Camera,
  },
  { id: "section-7", num: "07", title: "AI-assisted features", icon: Sparkles },
  {
    id: "section-8",
    num: "08",
    title: "Who we share information with",
    icon: Share2,
  },
  { id: "section-9", num: "09", title: "International transfers", icon: Globe },
  { id: "section-10", num: "10", title: "Retention periods", icon: Clock },
  { id: "section-11", num: "11", title: "Security & storage", icon: Lock },
  { id: "section-12", num: "12", title: "Your rights", icon: UserCheck },
  {
    id: "section-13",
    num: "13",
    title: "Marketing communications",
    icon: Mail,
  },
  {
    id: "section-14",
    num: "14",
    title: "Cookies & similar technologies",
    icon: Cookie,
  },
  { id: "section-15", num: "15", title: "Children's privacy", icon: Baby },
  {
    id: "section-16",
    num: "16",
    title: "Changes to this Policy",
    icon: History,
  },
  { id: "section-17", num: "17", title: "Contact us", icon: PhoneCall },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string>("section-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Scrollspy & Scroll-to-top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = SECTIONS.map((sec) =>
        document.getElementById(sec.id),
      );

      const scrollPos = window.scrollY + 180;
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.num.includes(q) ||
        sec.id.includes(q),
    );
  }, [searchQuery]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
      setIsMobileMenuOpen(false);
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Section link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSharePage = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Privacy Policy link copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("reports@imoscan.com");
    toast.success("Email copied: reports@imoscan.com");
  };

  return (
    <div>
      <div className="relative mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/50 to-background p-6 shadow-sm backdrop-blur-md sm:p-10 md:p-12 mb-10">
          {/* Ambient Gradient Glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#84CC16]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground transition">
                Home
              </Link>
              <ChevronRight size={14} />
              <span className="text-foreground">Privacy Policy</span>
            </nav>

            {/* Badge & Last Updated */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#84CC16]/30 bg-[#84CC16]/10 px-3 py-1 text-xs font-bold text-[#84CC16]">
                <ShieldCheck size={14} />
                Official Privacy Document
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Calendar size={13} />
                Last updated: 3 September 2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>

            <p className="max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              This Policy explains how personal information is collected,
              processed, protected, and used through the imoscan website,
              applications, payment-terminal features, and related device
              intelligence services operated by IMOSCAN LTD.
            </p>
          </div>
        </div>

        {/* Mobile Quick Navigation Accordion */}
        <div className="block lg:hidden mb-8">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="flex w-full items-center justify-between text-left font-bold text-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#84CC16]/10 text-[#84CC16]">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-bold">
                  Table of Contents ({SECTIONS.length} Sections)
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform duration-200 ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isMobileMenuOpen && (
              <div className="mt-4 max-h-72 space-y-1 overflow-y-auto border-t border-border pt-3">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    type="button"
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                      activeSection === section.id
                        ? "bg-[#84CC16]/10 text-[#84CC16]"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono text-[11px] opacity-70">
                      {section.num}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Sticky Sidebar (Table of Contents) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Table of Contents
                </h3>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-mono font-bold text-muted-foreground">
                  17 Sections
                </span>
              </div>

              {/* Live Search Filter */}
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Filter sections (e.g. AI, Rights, Cookies)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground/60 focus:border-[#84CC16] focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Navigation Section Links */}
              <nav className="max-h-[calc(100vh-320px)] space-y-1 overflow-y-auto pr-1">
                {filteredSections.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No matching sections found.
                  </p>
                ) : (
                  filteredSections.map((section) => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        type="button"
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#84CC16]/15 text-[#84CC16] font-bold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`font-mono text-[11px] shrink-0 ${
                            isActive
                              ? "text-[#84CC16]"
                              : "text-muted-foreground/70 group-hover:text-foreground"
                          }`}
                        >
                          {section.num}
                        </span>
                        <Icon
                          size={15}
                          className={`shrink-0 transition-colors ${
                            isActive
                              ? "text-[#84CC16]"
                              : "text-muted-foreground/70 group-hover:text-foreground"
                          }`}
                        />
                        <span className="truncate">{section.title}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#84CC16] shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </nav>

              {/* Sidebar Data Protection Callout */}
              <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-xs font-bold text-foreground mb-1">
                  Data Protection Inquiries?
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  Reach out directly to our designated compliance desk regarding
                  GDPR, rights requests, or processor arrangements.
                </p>
                <a
                  href="mailto:reports@imoscan.com"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-2 text-xs font-bold text-[#84CC16] transition hover:bg-[#84CC16] hover:text-black"
                >
                  <Mail size={13} />
                  reports@imoscan.com
                </a>
              </div>
            </div>
          </aside>

          {/* Right Content Area (17 Sections) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Who we are */}
            <article
              id="section-1"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    01
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    1. Who we are
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-1")}
                  type="button"
                  aria-label="Copy link to Section 1"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-1" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  imoscan is a retail, inventory, repair, trade-in and
                  payment-management platform operated by{" "}
                  <strong className="text-foreground font-semibold">
                    IMOSCAN LTD
                  </strong>
                  , trading as{" "}
                  <strong className="text-[#84CC16] font-bold">imoscan</strong>.
                </p>

                <div className="rounded-2xl border border-border/80 bg-muted/30 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        Company Number
                      </span>
                      <span className="text-sm font-bold text-foreground font-mono">
                        17165483 (England & Wales)
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        Registered Office
                      </span>
                      <span className="text-xs sm:text-sm text-foreground">
                        Unit 22 Mkd Larie Walk, Romford, Romford, United
                        Kingdom, RM1 3RL
                      </span>
                    </div>
                  </div>
                </div>

                <p>
                  This Policy explains how personal information is collected,
                  processed, protected, and used through the imoscan website,
                  web applications, payment-terminal features, and related
                  services.
                </p>
              </div>
            </article>

            {/* 2. Our data-protection role */}
            <article
              id="section-2"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    02
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Scale size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    2. Our data-protection role
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-2")}
                  type="button"
                  aria-label="Copy link to Section 2"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-2" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Depending on your relationship with imoscan, we act in
                  different data-protection capacities:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-[#84CC16]/30 bg-[#84CC16]/5 p-5">
                    <div className="flex items-center gap-2 text-[#84CC16] font-bold text-sm mb-2">
                      <ShieldCheck size={18} />
                      Data Controller
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      imoscan is normally a <strong>controller</strong> for
                      account registration, subscriptions, security, support,
                      service communications, platform operations, and direct
                      marketing.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 text-foreground font-bold text-sm mb-2">
                      <Server size={18} className="text-[#84CC16]" />
                      Data Processor
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      When a shop uses imoscan to record details about
                      customers, staff, repairs, purchases, trade-ins, or
                      warranties, the shop acts as controller and imoscan acts
                      as its <strong>processor</strong>.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 text-foreground font-bold text-sm mb-2">
                      <Key size={18} className="text-primary" />
                      Separate Controllers
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Payment providers, banking partners, identity-verification
                      networks, and external integrations act as{" "}
                      <strong>separate controllers</strong> under their own
                      respective privacy notices.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs sm:text-sm text-foreground">
                  <strong className="font-semibold text-[#84CC16]">
                    Customer Record Inquiries:{" "}
                  </strong>
                  If a shop entered your information, please contact that shop
                  first. The shop determines why information is processed and
                  how long records are retained. imoscan assists shops with
                  verified data requests where required.
                </div>
              </div>
            </article>

            {/* 3. Information we may process */}
            <article
              id="section-3"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    03
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Database size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    3. Information we may process
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-3")}
                  type="button"
                  aria-label="Copy link to Section 3"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-3" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Depending on the platform features and services enabled, we
                  may process the following categories of data:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: "Contact & Identity",
                      desc: "Name, email address, telephone number, and postal address.",
                    },
                    {
                      title: "Business & Staff",
                      desc: "Shop details, legal entity info, staff accounts, roles, and assigned permissions.",
                    },
                    {
                      title: "Authentication & Security",
                      desc: "Login credentials, password hashes, 2FA tokens, and audit session logs.",
                    },
                    {
                      title: "Trade-in & Orders",
                      desc: "Purchase, sale, trade-in, repair, customer collection, and warranty histories.",
                    },
                    {
                      title: "Device Intelligence",
                      desc: "Device make, model, condition, IMEI, serial number, diagnostic reports, and photos.",
                    },
                    {
                      title: "Identity Documents",
                      desc: "Identity-document images for lawful verification, trade-in, or fraud prevention.",
                    },
                    {
                      title: "Signatures & Proofs",
                      desc: "Customer signatures, legal consent records, repair waivers, and transaction evidence.",
                    },
                    {
                      title: "Billing & Transactions",
                      desc: "Invoices, refund records, payment status, and tokenized card info (last 4 digits).",
                    },
                    {
                      title: "Fulfilment & Location",
                      desc: "Delivery recipient details, courier status, and location info when enabled.",
                    },
                    {
                      title: "Communications & Logs",
                      desc: "Support inquiries, IP address, device telemetry, error logs, and cookie data.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-border/80 bg-background/50 p-3.5"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#84CC16]/15 text-[#84CC16] mt-0.5">
                        <CheckCircle2 size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground mb-0.5">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secure Payment Processing Callout */}
                <div className="rounded-2xl border border-[#84CC16]/30 bg-[#84CC16]/5 p-4 flex items-start gap-3">
                  <Lock size={18} className="text-[#84CC16] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-foreground">
                    <strong>Card Details Protection: </strong>
                    Complete payment card numbers are collected and processed
                    directly by our authorized PCI-DSS certified payment
                    gateways and terminal acquirers. Full card details are never
                    stored on imoscan servers.
                  </p>
                </div>
              </div>
            </article>

            {/* 4. Where information comes from */}
            <article
              id="section-4"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    04
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Layers size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    4. Where information comes from
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-4")}
                  type="button"
                  aria-label="Copy link to Section 4"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-4" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  We gather information through several distinct channels across
                  the platform lifecycle:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                      Directly From You
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      When you register an account, purchase a subscription,
                      submit support tickets, or communicate directly with our
                      team.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                      From Shops Using imoscan
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      When a retailer, repair shop, or trade-in partner logs
                      your device, issues a receipt, or enters customer details
                      on your behalf.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                      Automated Device Telemetry
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Automatically when accessing our applications, including
                      IP addresses, device identifiers, session cookies, and
                      diagnostics.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
                      Authorised Third Parties
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      From authorized payment gateways, IMEI blacklist/whitelist
                      registries, carrier databases, address lookup APIs, and
                      fraud providers.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 5. Why we use information */}
            <article
              id="section-5"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    05
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ClipboardList size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    5. Why we use information
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-5")}
                  type="button"
                  aria-label="Copy link to Section 5"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-5" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Under UK GDPR and applicable data protection legislation, we
                  must identify a lawful basis for each purpose of processing
                  when acting as a controller:
                </p>
                {/* Responsive Lawful Basis Table */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-foreground font-bold">
                          <th className="py-3 px-4">Processing Purpose</th>
                          <th className="py-3 px-4">Normal Lawful Basis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {[
                          {
                            purpose: "Create and operate accounts",
                            basis: "Performance of a contract",
                          },
                          {
                            purpose:
                              "Provide subscriptions and requested features",
                            basis: "Performance of a contract",
                          },
                          {
                            purpose:
                              "Process billing and maintain financial records",
                            basis: "Contract & Legal obligation",
                          },
                          {
                            purpose:
                              "Protect accounts & prevent fraud, misuse or unauthorized access",
                            basis: "Legitimate interests & Legal obligation",
                          },
                          {
                            purpose:
                              "Provide support and essential service communications",
                            basis: "Contract & Legitimate interests",
                          },
                          {
                            purpose:
                              "Diagnose faults, improve reliability & usability",
                            basis: "Legitimate interests",
                          },
                          {
                            purpose:
                              "Establish, exercise or defend legal claims",
                            basis: "Legitimate interests & Legal obligation",
                          },
                          {
                            purpose: "Send optional marketing communications",
                            basis:
                              "Consent or legitimate interests (where permitted)",
                          },
                          {
                            purpose:
                              "Use non-essential cookies or similar technologies",
                            basis: "Consent",
                          },
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-foreground">
                              {row.purpose}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center rounded-lg bg-[#84CC16]/10 px-2.5 py-1 text-xs font-semibold text-[#84CC16]">
                                {row.basis}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                - cloud-hosting, database, backup and security providers; -
                payment processors, acquiring banks and terminal providers; -
                IMEI, serial-number, device-history and diagnostic providers; -
                identity-verification and fraud-prevention providers; - email,
                SMS, notification and communication providers; - AI providers
                when an AI-assisted feature is requested; - analytics,
                monitoring and crash-reporting providers; - address, map and
                delivery providers; - professional advisers, insurers and
                auditors; - regulators, law-enforcement bodies or courts where
                required; and - a buyer, investor or successor involved in a
                proposed or completed business sale or reorganisation.
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Our legitimate interests include maintaining a reliable and
                  secure infrastructure, protecting users and businesses against
                  fraud, enhancing software features, and enforcing legal
                  contracts. When imoscan acts solely as a processor, the shop
                  remains responsible for identifying and documenting its own
                  lawful basis.
                </p>
              </div>
            </article>

            {/* 6. Customer records and identity documents */}
            <article
              id="section-6"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    06
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Camera size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    6. Customer records & identity documents
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-6")}
                  type="button"
                  aria-label="Copy link to Section 6"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-6" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  imoscan processes shop customer information solely to deliver
                  the specific features configured by the shop.{" "}
                  <strong className="text-foreground">
                    imoscan does not sell personal information or use shop
                    customer data for our own marketing campaigns.
                  </strong>
                </p>

                {/* Prominent 28-Day Deletion Guarantee */}
                <div className="rounded-2xl border border-[#84CC16]/40 bg-[#84CC16]/10 p-5">
                  <div className="flex items-start gap-3">
                    <Clock
                      className="text-[#84CC16] shrink-0 mt-0.5"
                      size={22}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">
                        Strict 28-Day Automated Image Purge
                      </h4>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                        An original identity-document image may be captured for
                        lawful trade-in verification, second-hand dealer
                        requirements, or anti-fraud protocols. The shop may
                        delete the image earlier, and imoscan automatically
                        purges it{" "}
                        <strong>no later than 28 days after capture</strong>.
                        After purge, the raw image is permanently unrecoverable.
                      </p>
                    </div>
                  </div>
                </div>

                <p>
                  Following document image deletion, essential transactional
                  records may remain stored in text format, including the
                  customer&apos;s name, telephone number, email, device
                  identification, repair invoice, and warranty history.
                </p>

                <p>
                  Shops may utilize these operational records to manage
                  warranties, handle inquiries, issue receipts, and deter
                  fraudulent claims. Shops may send direct marketing or special
                  promotions only where they have obtained compliant opt-in
                  consent or satisfy another statutory exemption, with an active
                  unsubscribe mechanism included in every message.
                </p>
              </div>
            </article>

            {/* 7. AI-assisted features */}
            <article
              id="section-7"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    07
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    7. AI-assisted features
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-7")}
                  type="button"
                  aria-label="Copy link to Section 7"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-7" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  imoscan leverages modern artificial intelligence algorithms to
                  streamline device diagnostics, evaluate physical condition or
                  market value, flag potential operational risks, suggest
                  catalog fields, and draft communication summaries.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-[#84CC16]" />
                      Decision Support Only
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      AI outputs serve as assistive decision support. imoscan
                      does not utilize automated algorithms to make final
                      decisions with legal or similarly significant effects.
                      Final decisions should be reviewed by authorized staff.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-1.5 flex items-center gap-1.5">
                      <Lock size={15} className="text-[#84CC16]" />
                      No Public Model Training
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      imoscan never uses identifiable customer records or
                      confidential trade data to train public or foundational
                      third-party AI models. Strict contractual and technical
                      data-isolation safeguards are enforced.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 8. Who we share information with */}
            <article
              id="section-8"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    08
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Share2 size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    8. Who we share information with
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-8")}
                  type="button"
                  aria-label="Copy link to Section 8"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-8" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  We only share personal data with trusted partners and
                  third-party vendors where strictly necessary to execute our
                  services:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Cloud hosting, database, and offsite backup providers",
                    "Payment gateways, acquiring banks, and terminal operators",
                    "IMEI blacklist/whitelist, carrier, and diagnostic providers",
                    "Identity-verification and fraud-prevention bureaus",
                    "Transactional email, SMS, and push notification relays",
                    "AI processing endpoints for requested smart tasks",
                    "Application performance, telemetry, and error loggers",
                    "Address autocomplete, geolocation, and courier APIs",
                    "Professional advisers, legal counsel, and certified auditors",
                    "Statutory regulators, law-enforcement, or courts where required",
                    "Prospective purchasers or corporate successors under NDA",
                  ].map((recipient, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/70 bg-background/50 p-3 text-xs text-foreground/90 flex items-start gap-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#84CC16] shrink-0 mt-1.5" />
                      <span>{recipient}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-4 text-xs sm:text-sm text-foreground">
                  <strong className="font-semibold text-[#84CC16]">
                    Strict Commercial Confidentiality:{" "}
                  </strong>
                  We do not sell personal data or permit third-party providers
                  to market to shop records. To safeguard proprietary
                  arrangements, imoscan does not publish a complete public
                  directory of vendors; verified business customers may request
                  further details where necessary for compliance.
                </div>
              </div>
            </article>

            {/* 9. International transfers */}
            <article
              id="section-9"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    09
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Globe size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    9. International transfers
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-9")}
                  type="button"
                  aria-label="Copy link to Section 9"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-9" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Certain third-party cloud and infrastructure providers may
                  store or process data outside the United Kingdom and the
                  European Economic Area.
                </p>
                <p>
                  When cross-border transfers occur, we implement lawful
                  transfer safeguards recognized under UK data protection laws,
                  including:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    "UK Adequacy Regulations recognizing recipient territory standards",
                    "The UK International Data Transfer Agreement (IDTA)",
                    "The UK Addendum to EU Standard Contractual Clauses (SCCs)",
                  ].map((mechanism, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-border bg-background p-3 text-xs text-foreground/90"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-[#84CC16] shrink-0 mt-0.5"
                      />
                      <span>{mechanism}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You may contact our privacy desk at any time to obtain
                  information on specific transfer safeguards applicable to your
                  data.
                </p>
              </div>
            </article>

            {/* 10. Retention */}
            <article
              id="section-10"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    10
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Clock size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    10. Retention
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-10")}
                  type="button"
                  aria-label="Copy link to Section 10"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-10" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  We retain personal information only for as long as necessary
                  to fulfill contractual obligations, defend legal claims,
                  prevent fraud, and satisfy statutory tax and reporting
                  requirements:
                </p>
                {/* Retention Table */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-foreground font-bold">
                          <th className="py-3 px-4">Information Type</th>
                          <th className="py-3 px-4">
                            Typical Retention Period
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {[
                          {
                            type: "Original identity-document images",
                            period:
                              "Up to 28 days after capture; automatic purge",
                          },
                          {
                            type: "imoscan account & profile data",
                            period:
                              "While active + limited period after closure for disputes/fraud",
                          },
                          {
                            type: "Subscription, invoice & financial records",
                            period:
                              "Normally up to six years after relevant financial year (statutory)",
                          },
                          {
                            type: "Shop customer, repair & warranty records",
                            period:
                              "Governed by individual shop settings & instructions",
                          },
                          {
                            type: "Customer support communications",
                            period:
                              "As long as reasonably required to resolve & maintain history",
                          },
                          {
                            type: "Security, audit & application logs",
                            period:
                              "Limited rolling window based on operational & safety criteria",
                          },
                          {
                            type: "Automated database backups",
                            period:
                              "Rotated and purged according to rolling disaster backup schedule",
                          },
                          {
                            type: "Marketing opt-ins and preferences",
                            period:
                              "Until consent is withdrawn, unsubscribe clicked, or record stale",
                          },
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-foreground">
                              {row.type}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              <span className="font-mono text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded">
                                {row.period}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                **Right to object: ** You have the right to object at any time
                to the use of your personal information for direct marketing. If
                you object, that marketing will stop.
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Anonymized or aggregated diagnostic data that cannot identify
                  an individual may be retained indefinitely to benchmark
                  platform reliability, improve accuracy, and train diagnostic
                  intelligence.
                </p>
              </div>
            </article>

            {/* 11. Security */}
            <article
              id="section-11"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    11
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    11. Security
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-11")}
                  type="button"
                  aria-label="Copy link to Section 11"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-11" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  We enforce rigorous technical, organizational, and physical
                  safeguards designed to prevent accidental loss, unauthorized
                  destruction, alteration, or unlawful access to personal data:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "TLS 1.3 encryption in transit and AES-256 data encryption at rest",
                    "Role-based access controls (RBAC) with least-privilege scoping",
                    "Multi-factor authentication (MFA) and cryptographic credential hashing",
                    "Continuous vulnerability monitoring, automated backups, and incident response",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-background/60 p-3 text-xs sm:text-sm text-foreground/90"
                    >
                      <ShieldCheck
                        size={16}
                        className="text-[#84CC16] shrink-0"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-4 text-xs sm:text-sm text-foreground">
                  <strong className="font-semibold text-[#84CC16]">
                    Merchant Responsibility:{" "}
                  </strong>
                  Shops and businesses are directly responsible for maintaining
                  strong unique passwords, safeguarding POS terminals, properly
                  provisioning staff permissions, and reporting any compromised
                  devices immediately.
                </div>
              </div>
            </article>

            {/* 12. Your rights */}
            <article
              id="section-12"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    12
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserCheck size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    12. Your rights
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-12")}
                  type="button"
                  aria-label="Copy link to Section 12"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-12" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Under applicable UK data protection legislation, you possess
                  explicit rights regarding your personal information:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      title: "Right of Access",
                      desc: "Obtain confirmation and copy of your personal data processed by us.",
                    },
                    {
                      title: "Right to Rectification",
                      desc: "Request correction of inaccurate, outdated, or incomplete records.",
                    },
                    {
                      title: "Right to Erasure",
                      desc: "Request deletion of records where retention grounds no longer apply.",
                    },
                    {
                      title: "Right to Restriction",
                      desc: "Request suspension of data processing pending dispute review.",
                    },
                    {
                      title: "Right to Data Portability",
                      desc: "Receive certain machine-readable exports of provided data.",
                    },
                    {
                      title: "Right to Human Review",
                      desc: "Request human review of automated decisions where applicable.",
                    },
                  ].map((r, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/80 bg-background/50 p-3.5"
                    >
                      <h4 className="text-xs font-bold text-foreground mb-1">
                        {r.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Prominent Right to Object Highlight */}
                <div className="rounded-2xl border border-[#84CC16]/40 bg-[#84CC16]/10 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <ShieldAlert
                      className="text-[#84CC16] shrink-0 mt-0.5"
                      size={20}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">
                        Absolute Right to Object to Direct Marketing
                      </h4>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                        You have the absolute legal right to object at any time
                        to the processing of your personal information for
                        direct marketing purposes. If you object, marketing will
                        stop immediately without charge.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Regulatory Recourse Card (ICO) */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                      Regulatory Complaint Recourse
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      If you believe your data has been handled improperly, you
                      have the right to lodge a complaint with the UK
                      Information Commissioner&apos;s Office (ICO).
                    </p>
                  </div>
                  <a
                    href="https://ico.org.uk/make-a-complaint/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
                  >
                    ICO Complaints
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </article>

            {/* 13. Marketing */}
            <article
              id="section-13"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    13
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    13. Marketing
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-13")}
                  type="button"
                  aria-label="Copy link to Section 13"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-13" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  imoscan may communicate marketing updates, platform
                  enhancements, and promotional offers only where you have
                  explicitly opted in or where an applicable soft opt-in
                  exemption applies under PECR regulations. You may withdraw
                  consent at any time via the unsubscribe link in any message or
                  by contacting our team.
                </p>
                <div className="rounded-2xl border border-border bg-muted/20 p-4 text-xs sm:text-sm text-foreground">
                  <strong className="font-semibold text-[#84CC16]">
                    Non-Marketing Service Notifications:{" "}
                  </strong>
                  Mandatory operational notices—such as security advisories,
                  billing receipts, account status updates, or legal policy
                  revisions—are non-marketing communications and continue to be
                  dispatched as necessary.
                </div>
              </div>
            </article>

            {/* 14. Cookies and similar technologies */}
            <article
              id="section-14"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    14
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Cookie size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    14. Cookies and similar technologies
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-14")}
                  type="button"
                  aria-label="Copy link to Section 14"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-14" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  We use strictly essential technical cookies required for
                  authentication, security session tracking, and load balancing
                  across our platform.
                </p>
                <p>
                  Non-essential cookies (such as analytics, telemetry, or
                  marketing pixels) are deployed only after you provide
                  affirmative consent through our cookie banner or preference
                  manager. You can adjust your consent choices at any time
                  through our footer controls.
                </p>
              </div>
            </article>

            {/* 15. Children */}
            <article
              id="section-15"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    15
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Baby size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    15. Children
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-15")}
                  type="button"
                  aria-label="Copy link to Section 15"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-15" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  imoscan business accounts and commercial POS features are
                  strictly not intended for individuals under 18 years of age.
                </p>
                <p>
                  If a shop records information relating to a child (for example
                  during an in-store device repair), that shop remains solely
                  responsible for ensuring a verified parental lawful basis and
                  issuing suitable child-friendly privacy disclosures under the
                  Age-Appropriate Design Code.
                </p>
              </div>
            </article>

            {/* 16. Changes to this Policy */}
            <article
              id="section-16"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    16
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <History size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    16. Changes to this Policy
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-16")}
                  type="button"
                  aria-label="Copy link to Section 16"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-16" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  We may periodically update this Privacy Policy to reflect
                  modifications to our platform architecture, statutory legal
                  requirements, or integration partners.
                </p>
                <p>
                  Material revisions will be communicated prominently through
                  website announcements, in-app notifications, or account email
                  alerts prior to taking effect. The latest revised date at the
                  top of this page indicates when current terms took effect.
                </p>
              </div>
            </article>

            {/* 17. Contact us */}
            <article
              id="section-17"
              className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                    17
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PhoneCall size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    17. Contact us
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyLink("section-17")}
                  type="button"
                  aria-label="Copy link to Section 17"
                  className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
                >
                  {copiedId === "section-17" ? (
                    <Check size={16} className="text-[#84CC16]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-sm sm:text-base text-muted-foreground">
                  If you have questions, feedback, or wish to exercise your data
                  protection rights under UK GDPR, please reach out through our
                  official channels:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Company info */}
                  <div className="rounded-2xl border border-border bg-muted/30 p-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[#84CC16] mb-3">
                      <Building2 size={18} />
                    </div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Company Entity
                    </h4>
                    <p className="text-sm font-bold text-foreground">
                      IMOSCAN LTD
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Trading as imoscan
                    </p>
                    <p className="text-xs font-mono text-[#84CC16] mt-2">
                      Company No: 17165483
                    </p>
                  </div>

                  {/* Registered Office */}
                  <div className="rounded-2xl border border-border bg-muted/30 p-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[#84CC16] mb-3">
                      <MapPin size={18} />
                    </div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Registered Office
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      Unit 22 Mkd Larie Walk, Romford, Romford, United Kingdom,
                      RM1 3RL
                    </p>
                  </div>

                  {/* Email Desk */}
                  <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[#84CC16] mb-3">
                        <Mail size={18} />
                      </div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Data Privacy Desk
                      </h4>
                      <a
                        href="mailto:reports@imoscan.com"
                        className="text-sm font-bold text-[#84CC16] hover:underline block break-all"
                      >
                        reports@imoscan.com
                      </a>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleCopyEmail}
                        type="button"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                      >
                        <Copy size={13} />
                        Copy Email
                      </button>
                      <a
                        href="mailto:reports@imoscan.com"
                        className="inline-flex items-center justify-center rounded-xl bg-[#84CC16] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#76b813]"
                      >
                        Send Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Floating Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            type="button"
            aria-label="Scroll back to top"
            className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#84CC16] text-black shadow-lg shadow-lime-500/30 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  Users,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Camera,
  SearchCheck,
  Sparkles,
  Tag,
  Receipt,
  ExternalLink,
  Scale,
  Clock,
  EyeOff,
  Ban,
  AlertTriangle,
  History,
  Gavel,
  Mail,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Printer,
  Share2,
  Check,
  ChevronRight,
  ArrowUp,
  Search,
  Copy,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  num: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: "section-1", num: "01", title: "About these Terms", icon: FileText },
  { id: "section-2", num: "02", title: "Business use", icon: Briefcase },
  {
    id: "section-3",
    num: "03",
    title: "Accounts and authorised users",
    icon: Users,
  },
  {
    id: "section-4",
    num: "04",
    title: "Trials, subscriptions and charges",
    icon: CreditCard,
  },
  {
    id: "section-5",
    num: "05",
    title: "Renewal and cancellation",
    icon: RefreshCw,
  },
  {
    id: "section-6",
    num: "06",
    title: "Your responsibilities",
    icon: CheckCircle2,
  },
  { id: "section-7", num: "07", title: "Acceptable use", icon: ShieldAlert },
  {
    id: "section-8",
    num: "08",
    title: "Customer data and data protection",
    icon: Lock,
  },
  {
    id: "section-9",
    num: "09",
    title: "Identity-document images",
    icon: Camera,
  },
  {
    id: "section-10",
    num: "10",
    title: "Device checks and third-party data",
    icon: SearchCheck,
  },
  {
    id: "section-11",
    num: "11",
    title: "AI-assisted features",
    icon: Sparkles,
  },
  {
    id: "section-12",
    num: "12",
    title: "Suggested product details and prices",
    icon: Tag,
  },
  {
    id: "section-13",
    num: "13",
    title: "Payments and terminals",
    icon: Receipt,
  },
  {
    id: "section-14",
    num: "14",
    title: "Third-party services",
    icon: ExternalLink,
  },
  { id: "section-15", num: "15", title: "Intellectual property", icon: Scale },
  {
    id: "section-16",
    num: "16",
    title: "Availability, maintenance and changes",
    icon: Clock,
  },
  { id: "section-17", num: "17", title: "Confidentiality", icon: EyeOff },
  {
    id: "section-18",
    num: "18",
    title: "Suspension and termination",
    icon: Ban,
  },
  { id: "section-19", num: "19", title: "Liability", icon: AlertTriangle },
  {
    id: "section-20",
    num: "20",
    title: "Changes to these Terms",
    icon: History,
  },
  { id: "section-21", num: "21", title: "Governing law", icon: Gavel },
  { id: "section-22", num: "22", title: "Contact us", icon: Mail },
];

export default function TermsConditions() {
  const [activeSection, setActiveSection] = useState<string>("section-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Monitor scroll for scrollspy and scroll-to-top button
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
    toast.success("Page link copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("reports@imoscan.com");
    toast.success("Email copied: reports@imoscan.com");
  };

  return (
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
            <span className="text-foreground">Terms & Conditions</span>
          </nav>

          {/* Badge & Title */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#84CC16]/30 bg-[#84CC16]/10 px-3 py-1 text-xs font-bold text-[#84CC16]">
              <ShieldCheck size={14} />
              Official Legal Agreement
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Calendar size={13} />
              Last reviewed: 7 September 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-4">
            Terms and Conditions
          </h1>

          <p className="max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
            These Terms and Conditions govern access to and use of the imoscan
            website, applications, software, payment-terminal features, and
            related device intelligence services provided by IMOSCAN LTD.
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
                22 Sections
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
                placeholder="Filter sections (e.g. AI, Refund, ID)..."
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

            {/* Sidebar Support Callout */}
            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-foreground mb-1">
                Questions about these terms?
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Our legal and compliance team is available to assist enterprise
                and shopkeeper partners.
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

        {/* Right Content Area (22 Sections) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. About these Terms */}
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
                  <FileText size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  1. About these Terms
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
                These Terms and Conditions (the{" "}
                <strong className="text-foreground font-semibold">Terms</strong>
                ) govern access to and use of the imoscan website, applications,
                software, payment-terminal features and related services
                (together, the{" "}
                <strong className="text-foreground font-semibold">
                  Services
                </strong>
                ).
              </p>
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4">
                <p className="text-xs sm:text-sm text-foreground">
                  The Services are provided by{" "}
                  <strong className="font-bold">IMOSCAN LTD</strong>, trading as{" "}
                  <strong className="font-bold text-[#84CC16]">imoscan</strong>,
                  a company registered in England and Wales under company number{" "}
                  <strong className="font-bold">17165483</strong>. Our
                  registered office is Unit 22 Mkd Larie Walk, Romford, Romford,
                  United Kingdom, RM1 3RL.
                </p>
              </div>
              <p>
                By creating an account, starting a trial, buying a subscription
                or using the Services, you agree to these Terms. If you use
                imoscan for a business, you confirm that you have authority to
                accept these Terms on its behalf.
              </p>
            </div>
          </article>

          {/* 2. Business use */}
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
                  <Briefcase size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  2. Business use
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
                imoscan is designed primarily for retailers, gadget stores,
                repair centres, trade-in businesses and other commercial users.
                Business account holders must be at least 18 years old and
                legally able to enter into a contract.
              </p>
              <p>
                If imoscan offers services that consumers can buy directly,
                separate consumer terms should be displayed before purchase.
                Nothing in these Terms removes legal rights that cannot lawfully
                be excluded.
              </p>
            </div>
          </article>

          {/* 3. Accounts and authorised users */}
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
                  <Users size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  3. Accounts and authorised users
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
                You must provide accurate account information and keep it
                current. You are responsible for protecting login details,
                choosing authorised staff, assigning suitable permissions and
                activity carried out through your users&apos; accounts. Tell us
                promptly if you suspect unauthorised access or a security
                incident.
              </p>
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-foreground font-medium text-sm">
                Accounts and login details must not be sold, transferred or
                shared outside your organisation without our written permission.
              </div>
            </div>
          </article>

          {/* 4. Trials, subscriptions and charges */}
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
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  4. Trials, subscriptions and charges
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
                The plan, features, usage limits, subscription period and
                charges that apply will be shown on the Pricing page, in an
                order form or during checkout. A signed order form takes
                priority if it conflicts with these Terms.
              </p>

              <p className="font-semibold text-foreground text-sm">
                Unless stated otherwise:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Subscription charges are billed in advance;",
                  "Usage-based charges are billed according to actual use;",
                  "Prices exclude VAT and other applicable taxes;",
                  "A trial may be limited by time, features or usage; and",
                  "Unused trial access or promotional credit has no cash value.",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-background/50 p-3 text-xs sm:text-sm text-muted-foreground"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-[#84CC16] shrink-0 mt-0.5"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p>
                You authorise Imoscan and its payment provider to collect
                charges using your selected payment method. Keep your billing
                details current. We may restrict paid features if an undisputed
                amount remains overdue after reasonable notice.
              </p>
            </div>
          </article>

          {/* 5. Renewal and cancellation */}
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
                  <RefreshCw size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  5. Renewal and cancellation
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
                An automatically renewing subscription renews for the period
                shown at checkout unless either party cancels before the renewal
                date. Renewal pricing will be the price notified for the next
                term.
              </p>
              <p>
                You may cancel through the account settings or by contacting us.
                Cancellation stops future renewals but normally does not create
                a refund for a period that has already started, except where
                required by law or stated in an order form.
              </p>
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs sm:text-sm text-foreground">
                <strong className="font-semibold text-[#84CC16]">
                  Record Export:{" "}
                </strong>
                Before closing an account, export any records you are required
                to keep. We may retain limited information after closure for
                security, fraud prevention, dispute resolution, accounting or
                legal obligations.
              </div>
            </div>
          </article>

          {/* 6. Your responsibilities */}
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
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  6. Your responsibilities
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
                You are responsible for your business and for information,
                instructions and decisions made through your account. You must:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Keep product, customer, repair, warranty, tax and transaction records accurate;",
                  "Comply with consumer, tax, employment, marketing and data-protection laws;",
                  "Provide receipts, notices, warranties and cancellation rights where required;",
                  "Have a lawful basis before collecting or using personal information;",
                  "Check information generated or suggested by Imoscan before relying on it; and",
                  "Maintain suitable internet access, devices and other equipment.",
                ].map((resp, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-background/50 p-3 text-xs sm:text-sm text-foreground/90"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#84CC16]/15 text-[#84CC16] mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* 7. Acceptable use */}
          <article
            id="section-7"
            className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
          >
            <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                  07
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <ShieldAlert size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  7. Acceptable use
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
              <p className="font-semibold text-foreground">
                You must not use the Services to:
              </p>

              {/* Prohibited List in Warning Container */}
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    "Break the law, facilitate fraud or handle goods you know or reasonably suspect are stolen;",
                    "Collect identity documents or personal information without a lawful and necessary purpose;",
                    "Infringe another person's privacy, intellectual-property or other rights;",
                    "Upload malware or bypass the security of the Services;",
                    "Access another account, system or dataset without permission;",
                    "Scrape, copy, reverse-engineer or resell the Services, except where law does not permit that restriction;",
                    "Make misleading claims to customers based on imoscan outputs; or",
                    "Submit unlawful, abusive, discriminatory or harmful material.",
                  ].map((prohibited, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90"
                    >
                      <Ban
                        size={15}
                        className="text-destructive shrink-0 mt-0.5"
                      />
                      <span>{prohibited}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p>
                We may investigate suspected misuse and restrict access where
                reasonably necessary to protect users, imoscan or third parties.
              </p>
            </div>
          </article>

          {/* 8. Customer data and data protection */}
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
                  <Lock size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  8. Customer data and data protection
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
                As between you and imoscan, you retain control of the business
                and customer information submitted through your account (
                <strong className="text-foreground font-semibold">
                  Customer Data
                </strong>
                ).
              </p>
              <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-xs sm:text-sm text-foreground">
                  <strong>Role Definitions: </strong>
                  For account administration, billing, security, support and
                  imoscan&apos;s own operations, imoscan normally acts as a{" "}
                  <span className="text-[#84CC16] font-semibold">
                    controller
                  </span>
                  . When imoscan handles Customer Data solely on your
                  instructions, you normally act as{" "}
                  <span className="text-[#84CC16] font-semibold">
                    controller
                  </span>{" "}
                  and imoscan acts as{" "}
                  <span className="text-[#84CC16] font-semibold">
                    processor
                  </span>
                  .
                </p>
              </div>
              <p>
                You instruct imoscan to process Customer Data as necessary to
                provide and secure the Services. Where required, our Data
                Processing Agreement forms part of our contract. You are
                responsible for providing privacy information to your customers
                and handling their data-protection requests. We will provide
                reasonable assistance where required.
              </p>
            </div>
          </article>

          {/* 9. Identity-document images */}
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
                  <Camera size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  9. Identity-document images
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
                Where enabled, a shop may capture an identity-document image for
                a lawful trade-in, verification or fraud-prevention purpose.
                Only necessary information should be collected.
              </p>

              {/* Prominent Auto-Deletion Callout Box */}
              <div className="rounded-2xl border border-[#84CC16]/40 bg-[#84CC16]/10 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Clock className="text-[#84CC16] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">
                      Strict 28-Day Automated Purge Policy
                    </h4>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      An original identity-document image stored through imoscan
                      may be deleted earlier by the shop and will be{" "}
                      <strong>
                        deleted automatically no later than 28 days after
                        capture
                      </strong>
                      . The feature must not be used as a permanent
                      identity-document archive.
                    </p>
                  </div>
                </div>
              </div>

              <p>
                After the image is deleted, a separate record may remain,
                including the customer&apos;s name, contact details, device
                information and transaction, repair or warranty history, subject
                to the shop&apos;s lawful retention requirements.
              </p>
            </div>
          </article>

          {/* 10. Device checks and third-party data */}
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
                  <SearchCheck size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  10. Device checks and third-party data
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
                IMEI, serial-number, device-history, diagnostic and market
                information may come from third parties. Coverage and update
                frequency vary by provider, device, network, country and check
                type.
              </p>
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs sm:text-sm text-foreground">
                <strong className="font-semibold text-[#84CC16]">
                  Decision-Support Only:{" "}
                </strong>
                Results are decision-support information. They do not guarantee
                that a device is genuine, unencumbered, fully functional, not
                stolen or suitable for purchase. A status may change after a
                check. You must review the evidence and make your own decision.
              </div>
            </div>
          </article>

          {/* 11. AI-assisted features */}
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
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  11. AI-assisted features
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
                imoscan may use artificial intelligence to explain device
                information, identify possible risks, suggest product details or
                prices, draft communications and prepare summaries.
              </p>

              {/* AI Advisory Callout Box */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Sparkles
                    className="text-[#84CC16] shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">
                      Human Review Requirement
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      AI output may be incomplete, inaccurate or out of date. It
                      is a recommendation, not professional advice or a final
                      decision. An authorised person must review important
                      outputs, especially decisions involving fraud, trade-in
                      refusal, customer treatment or price.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* 12. Suggested product details and prices */}
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
                  <Tag size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  12. Suggested product details and prices
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
                Product descriptions, images, specifications and suggested
                prices may be generated or obtained from external sources.
                Availability and accuracy are not guaranteed, and market
                conditions can change quickly.
              </p>
              <p>
                You must review every field before saving or publishing a
                product. You are responsible for the final description, image
                rights, price, taxes and information shown to customers.
              </p>
            </div>
          </article>

          {/* 13. Payments and terminals */}
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
                  <Receipt size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  13. Payments and terminals
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
                Payment processing, merchant onboarding, terminals, settlement,
                refunds and chargebacks may be supplied by an authorised
                third-party payment provider. Availability is subject to that
                provider&apos;s terms, pricing, supported countries, risk checks
                and approval.
              </p>
              <p>
                The payment provider may act as an independent controller.
                Imoscan is not a bank, card issuer or acquiring bank. You remain
                responsible for customer refunds, disputes, chargebacks and
                payment instructions, except where the provider&apos;s terms
                state otherwise.
              </p>
            </div>
          </article>

          {/* 14. Third-party services */}
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
                  <ExternalLink size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  14. Third-party services
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
                The Services may connect to third-party products, data or
                websites. Separate terms and privacy notices may apply. We are
                not responsible for a third party&apos;s independent service,
                decisions or availability, although we remain responsible for
                our own legal obligations when selecting and managing
                processors.
              </p>
            </div>
          </article>

          {/* 15. Intellectual property */}
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
                  <Scale size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  15. Intellectual property
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
                imoscan and its licensors own the Services, including the
                software, design, databases, branding and documentation. Subject
                to these Terms and applicable charges, we grant you a limited,
                non-exclusive, non-transferable right to use the Services for
                internal business operations during your subscription.
              </p>
              <p>
                You retain ownership of material you lawfully upload and grant
                imoscan the limited rights needed to host, process, transmit and
                display it to provide the Services. We may use feedback without
                restriction or payment, but will not identify you publicly
                without permission.
              </p>
            </div>
          </article>

          {/* 16. Availability, maintenance and changes */}
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
                  <Clock size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  16. Availability, maintenance and changes
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
                We aim to provide a reliable service but do not promise
                uninterrupted or error-free access. Maintenance, security work,
                provider outages and events outside our reasonable control may
                affect availability.
              </p>
              <p>
                We may update the Services for security, legal or technical
                reasons or to add or remove features. We will give reasonable
                notice where a material change is likely to significantly
                disadvantage an active paid customer, unless urgent legal or
                security reasons prevent this.
              </p>
            </div>
          </article>

          {/* 17. Confidentiality */}
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
                  <EyeOff size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  17. Confidentiality
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

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>
                Each party must protect the other&apos;s confidential
                information and use it only for the contract. This does not
                apply to information that is public through no breach, was
                already lawfully known, is received lawfully from another source
                or must be disclosed by law.
              </p>
            </div>
          </article>

          {/* 18. Suspension and termination */}
          <article
            id="section-18"
            className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
          >
            <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                  18
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <Ban size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  18. Suspension and termination
                </h2>
              </div>
              <button
                onClick={() => handleCopyLink("section-18")}
                type="button"
                aria-label="Copy link to Section 18"
                className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
              >
                {copiedId === "section-18" ? (
                  <Check size={16} className="text-[#84CC16]" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>
                We may suspend or terminate access if you materially breach
                these Terms, fail to pay undisputed charges, create a security
                risk, use the Services unlawfully or expose imoscan or another
                person to serious harm. Where appropriate, we will give notice
                and a reasonable opportunity to correct the issue.
              </p>
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs sm:text-sm text-foreground">
                Either party may terminate as stated in the applicable plan or
                order form. Provisions intended to continue after termination —
                including payment, confidentiality, intellectual property,
                liability and governing law — will remain in effect.
              </div>
            </div>
          </article>

          {/* 19. Liability */}
          <article
            id="section-19"
            className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
          >
            <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                  19
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  19. Liability
                </h2>
              </div>
              <button
                onClick={() => handleCopyLink("section-19")}
                type="button"
                aria-label="Copy link to Section 19"
                className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
              >
                {copiedId === "section-19" ? (
                  <Check size={16} className="text-[#84CC16]" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>
                Nothing in these Terms excludes or limits liability where doing
                so would be unlawful, including liability for death or personal
                injury caused by negligence, fraud or fraudulent
                misrepresentation.
              </p>
              <p>
                Subject to that statement, neither party will be liable for
                indirect or consequential loss, loss of profit, loss of
                anticipated savings or loss of goodwill arising from business
                use of the Services.
              </p>

              {/* Liability Cap Box */}
              <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
                <h4 className="text-sm font-bold text-foreground mb-1">
                  12-Month Liability Cap
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  imoscan&apos;s total liability arising out of or connected
                  with the Services in any 12-month period will not exceed the
                  fees paid or payable by you for the Services during that
                  period.
                </p>
              </div>

              <p>
                imoscan is not responsible for loss caused by inaccurate
                information supplied by you, decisions made without appropriate
                review, unlawful use, unsupported equipment or a third-party
                service outside our reasonable control.
              </p>
            </div>
          </article>

          {/* 20. Changes to these Terms */}
          <article
            id="section-20"
            className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
          >
            <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                  20
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <History size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  20. Changes to these Terms
                </h2>
              </div>
              <button
                onClick={() => handleCopyLink("section-20")}
                type="button"
                aria-label="Copy link to Section 20"
                className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
              >
                {copiedId === "section-20" ? (
                  <Check size={16} className="text-[#84CC16]" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>
                We may update these Terms to reflect changes to the Services,
                law or security requirements. We will notify account holders of
                material changes by email, through the Services or on our
                website. Changes take effect on the stated date. If a material
                change significantly disadvantages you, you may cancel before it
                takes effect, subject to any order form.
              </p>
            </div>
          </article>

          {/* 21. Governing law */}
          <article
            id="section-21"
            className="scroll-mt-32 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition hover:border-[#84CC16]/40"
          >
            <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 border border-[#84CC16]/20 px-2.5 py-1 rounded-lg">
                  21
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Gavel size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  21. Governing law
                </h2>
              </div>
              <button
                onClick={() => handleCopyLink("section-21")}
                type="button"
                aria-label="Copy link to Section 21"
                className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
              >
                {copiedId === "section-21" ? (
                  <Check size={16} className="text-[#84CC16]" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              <p>
                These Terms and related disputes are governed by the laws of
                England and Wales. The courts of England and Wales will have
                exclusive jurisdiction, except where mandatory law provides
                otherwise.
              </p>
            </div>
          </article>

          {/* 22. Contact us */}
          <article
            id="section-22"
            className="scroll-mt-32 rounded-3xl border-2 border-[#84CC16]/40 bg-card p-6 sm:p-8 shadow-lg transition"
          >
            <div className="flex items-start justify-between gap-4 mb-5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-black bg-[#84CC16] px-2.5 py-1 rounded-lg">
                  22
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#84CC16]/20 text-[#84CC16]">
                  <Mail size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  22. Contact us
                </h2>
              </div>
              <button
                onClick={() => handleCopyLink("section-22")}
                type="button"
                aria-label="Copy link to Section 22"
                className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
              >
                {copiedId === "section-22" ? (
                  <Check size={16} className="text-[#84CC16]" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-sm sm:text-base text-muted-foreground">
                If you have questions, notices, or require formal legal
                clarifications regarding these Terms, please reach out to us
                using our registered details below:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Company info */}
                <div className="rounded-2xl border border-border bg-muted/30 p-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[#84CC16] mb-3">
                    <Building2 size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Company Registered
                  </h4>
                  <p className="text-sm font-bold text-foreground">
                    IMOSCAN LTD
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Trading as Imoscan
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
                      Legal Desk Email
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
  );
}

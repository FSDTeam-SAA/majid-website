import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function ContactUs() {
  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-32 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#84CC16]/30 bg-[#84CC16]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#84CC16]">
            <Mail size={15} /> Contact us
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            We’re here to help.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            For questions about cookies, app tracking, privacy choices or any
            imoscan service, get in touch with our team.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-9">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/10 text-[#84CC16]">
                <Building2 size={23} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">IMOSCAN LTD</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trading as imoscan
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="mt-1 shrink-0 text-[#84CC16]" size={19} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Registered office
                  </p>
                  <p className="mt-2 leading-7">
                    Unit 22 MKD, Laurie Walk,
                    <br />
                    Romford, United Kingdom, RM1 3RL
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck
                  className="mt-1 shrink-0 text-[#84CC16]"
                  size={19}
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Company number
                  </p>
                  <p className="mt-2 font-mono font-semibold">17165483</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[#84CC16]/30 bg-[#84CC16]/5 p-6 sm:p-9">
            <Mail className="mb-6 text-[#84CC16]" size={28} />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email our team
            </p>
            <h2 className="mt-2 text-2xl font-bold">reports@imoscan.com</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Send us your question and we’ll route it to the right team.
            </p>
            <a
              href="mailto:reports@imoscan.com"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#84CC16] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#76b813]"
            >
              Send an email <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-bold">Privacy and complaints</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            If you have a concern about how information is handled, contact us
            first. You may also complain to the Information Commissioner’s
            Office through their official complaints service.
          </p>
          <a
            href="https://ico.org.uk/make-a-complaint/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#84CC16] hover:underline"
          >
            Visit the ICO complaints service <ArrowUpRight size={15} />
          </a>
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Looking for quick answers?{" "}
          <Link
            href="/faqs"
            className="font-semibold text-[#84CC16] hover:underline"
          >
            Browse our FAQs
          </Link>
        </p>
      </div>
    </main>
  );
}

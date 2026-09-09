import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Cpu,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Device intelligence",
    text: "IMEI and serial-number checks, device insights and risk indicators in one clear workflow.",
  },
  {
    icon: BarChart3,
    title: "Retail operations",
    text: "EPOS, inventory, invoices, payments and business reporting built for busy stores.",
  },
  {
    icon: Wrench,
    title: "Repair management",
    text: "Track every repair from booking and diagnosis through approval, completion and collection.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible by design",
    text: "Clear records, controlled access and practical safeguards for customer and business data.",
  },
];

const commitments = [
  "Clear and accurate service information",
  "Transparent pricing and subscription conditions",
  "Accessible customer support",
  "Continuous improvement from real business feedback",
];

export default function About() {
  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#84CC16]/10 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#84CC16]/30 bg-[#84CC16]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#84CC16]">
              <Building2 size={15} /> About imoscan
            </span>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Practical technology for modern retail.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              imoscan is a UK-based technology and EPOS platform designed for
              mobile phone shops, gadget retailers, electronics businesses and
              device repair centres.
            </p>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              We bring device checks, sales, inventory, repairs, customer
              records, invoicing, payments and reporting together so independent
              businesses can work with greater clarity and control.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#84CC16] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#76b813]"
              >
                Talk to our team <ArrowRight size={16} />
              </Link>
              <Link
                href="/faqs"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:border-[#84CC16]"
              >
                Explore FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#84CC16]/10 text-[#84CC16]">
                <Icon size={20} />
              </div>
              <h2 className="mb-2 font-bold">{title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#84CC16]">
              Our story
            </p>
            <h2 className="text-3xl font-black sm:text-4xl">
              Built from real retail experience.
            </h2>
            <p className="mt-6 leading-7 text-muted-foreground">
              imoscan was founded by Muhammad Majid, a UK retail business owner
              with first-hand experience in the mobile phone and gadget
              industry. The platform grew from the everyday challenges of
              managing stock, device checks, repairs, invoices, customers and
              payments across disconnected systems.
            </p>
            <p className="mt-4 leading-7 text-muted-foreground">
              Every feature is shaped around practical workflows—from serving
              customers and adding inventory to managing repairs, monitoring
              performance and overseeing multiple locations.
            </p>
          </div>
          <div className="rounded-3xl border border-[#84CC16]/30 bg-[#84CC16]/5 p-7">
            <Cpu className="mb-5 text-[#84CC16]" size={28} />
            <h3 className="text-xl font-bold">One connected workspace</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              imoscan helps teams reduce repetitive administration, keep records
              organised and deliver a faster, more professional customer
              experience.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "EPOS and inventory",
                "Device reports and risk insights",
                "Repairs and customer updates",
                "Payments and business reporting",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-semibold"
                >
                  <Check size={16} className="text-[#84CC16]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#84CC16]">
              Our commitment
            </p>
            <h2 className="text-3xl font-black">
              Technology businesses can trust.
            </h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              We take privacy, responsible data handling and transparent
              communication seriously. imoscan is operated by IMOSCAN LTD,
              registered in England and Wales.
            </p>
          </div>
          <div className="grid gap-3">
            {commitments.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold"
              >
                <Check size={17} className="shrink-0 text-[#84CC16]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
          <h2 className="text-3xl font-black">
            Ready to make your workflow simpler?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
            Discover how imoscan can help your shop stay organised, move faster
            and serve customers better.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#84CC16] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#76b813]"
          >
            Contact imoscan <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

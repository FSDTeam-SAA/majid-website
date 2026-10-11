import {
  Search,
  HelpCircle,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";

const steps = [
  {
    title: "Scan IMEI / Serial",
    description:
      "Quickly scan or enter the device's IMEI or serial number to start the check.",
    icon: Search,
    bgColor: "bg-[#EEFBCC]",
  },
  {
    title: "View Device Info",
    description:
      "Get full details on the device model, specification, and warranty status.",
    icon: HelpCircle,
    bgColor: "bg-[#E1F0FF]",
  },
  {
    title: "Check Blacklist Status",
    description:
      "Instantly see if the device is reported lost, stolen, financed, or blacklisted.",
    icon: AlertCircle,
    bgColor: "bg-[#F1EAFF]",
  },
  {
    title: "See Market Value",
    description:
      "Get the real-time market value so you know how much the device is worth.",
    icon: CircleDollarSign,
    bgColor: "bg-[#E1FBFF]",
  },
];

export default function VerifyAnyDevices() {
  return (
    <section className="bg-background py-10 lg:py-[90px]">
      <div className="mx-auto w-full max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Heading Area */}
        <div className="mb-12 text-center lg:mb-12">
          <p className="mb-3 text-2xl font-extrabold leading-none text-primary">
            4 Steps to
          </p>
          <h2 className="text-4xl font-black leading-none text-foreground md:text-5xl">
            Verify Any Devices
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${step.bgColor} flex h-[340px] flex-col items-center rounded-[32px] px-12 pt-[71px] text-center transition-transform duration-300 hover:scale-[1.02] border border-transparent dark:border-border`}
            >
              {/* Icon Circle */}
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
                <step.icon className="h-8 w-8 text-foreground" />
              </div>

              {/* Text Content */}
              <h3 className="mb-4 text-[22px] font-extrabold leading-[1.2] text-foreground dark:text-card">
                {step.title}
              </h3>
              <p className="max-w-[266px] text-base leading-[1.2] text-muted-foreground dark:text-card/80">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

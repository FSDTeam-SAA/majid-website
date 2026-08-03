import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock } from "lucide-react";

const FEATURES = [
  {
    title: "Global Database",
    desc: "Verified against 140+ global carrier and stolen device registries.",
    icon: ShieldCheck,
    color: "bg-[#E0EEFF] dark:bg-sky-950/50",
  },
  {
    title: "Instant Results",
    desc: "Neural processing ensures reports are generated in under 12 seconds.",
    icon: Zap,
    color: "bg-[#F0E8FF] dark:bg-violet-950/50",
  },
  {
    title: "Private & Secure",
    desc: "End-to-end encrypted scans with zero data retention for unpaid tiers.",
    icon: Lock,
    color: "bg-[#F0FDCF] dark:bg-lime-950/50",
  },
];

export const FeaturesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-10 mt-8">
      {FEATURES.map((feature, i) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className={`${feature.color} p-8 rounded-[32px] space-y-4 hover:scale-[1.02] transition-transform cursor-default`}
        >
          <div className="w-10 h-10 flex items-center">
            <feature.icon size={20} className="text-foreground" />
          </div>
          <h3 className="text-xl font-black text-foreground tracking-tight">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
            {feature.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Users, Banknote, Zap } from "lucide-react";

export function ImpactWall() {
  const globalImpact = useQuery(api.actions_api.getGlobalImpact);

  const metrics = [
    {
      label: "Actions",
      value: globalImpact?.totalActions ?? 0,
      prefix: "",
      icon: Users,
      color: "text-red-500",
      bgGlow: "from-red-500/20 to-transparent",
    },
    {
      label: "Months",
      value: globalImpact?.totalMonthsPledged ?? 0,
      prefix: "",
      icon: Zap,
      color: "text-amber-400",
      bgGlow: "from-amber-400/20 to-transparent",
    },
    {
      label: "Revenue",
      value: globalImpact?.totalRevenueWithheld ?? 0,
      prefix: "€",
      icon: Banknote,
      color: "text-emerald-400",
      bgGlow: "from-emerald-400/20 to-transparent",
    },
  ];

  return (
    <section className="relative w-full bg-slate-950 pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[600px] h-[200px] md:h-[300px] bg-red-600/10 rounded-full blur-[100px] md:blur-[120px] animate-glow" />
      </div>

      <div className="container mx-auto px-5 md:px-6 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-10 md:mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-widest mb-5 md:mb-6">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live Impact
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-4">
            Hit them where
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              it hurts.
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-xl max-w-md md:max-w-xl mx-auto leading-relaxed px-2">
            Every cancellation counts. Track the collective economic pressure in
            real-time.
          </p>
        </div>

        {/* Metric Cards — stack on mobile, row on desktop */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto stagger-children">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="group relative glass rounded-2xl p-4 md:p-6 hover:scale-[1.02] transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${metric.bgGlow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-between mb-2 md:mb-4">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                      {metric.label}
                    </span>
                    <Icon className="h-4 w-4 md:h-5 md:w-5 hidden md:block opacity-60" />
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl md:text-5xl font-black counter-value ${metric.color}`}
                  >
                    {metric.prefix}
                    {metric.value.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

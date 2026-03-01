"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  ImageOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function RecentActions() {
  const actions = useQuery(api.actions_api.getRecentActions);

  if (!actions || actions.length === 0) return null;

  return (
    <section className="w-full py-10 md:py-20 bg-white">
      <div className="container mx-auto px-5 md:px-6">
        <div className="mb-8 md:mb-12 animate-fade-up">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Fil communautaire
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Actions récentes
          </h2>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:snap-none -mx-5 px-5 md:mx-0 md:px-0">
          {actions.map((action: any) => (
            <Card
              key={action._id}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl active:scale-[0.98] snap-start shrink-0 w-[280px] md:w-auto"
            >
              {/* Proof Image Area */}
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

                <Badge
                  className={`absolute top-3 left-3 z-20 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-0 ${
                    action.status === "verified" ?
                      "bg-emerald-500/90 text-white"
                    : "bg-amber-500/90 text-white"
                  }`}
                >
                  {action.status === "verified" ?
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Vérifié
                    </span>
                  : <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> En attente
                    </span>
                  }
                </Badge>

                {action.isCustomAction && (
                  <Badge className="absolute top-3 right-3 z-20 rounded-full px-2 py-1 text-[10px] font-bold border-0 bg-amber-400/90 text-amber-900">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    Perso
                  </Badge>
                )}

                {action.proofUrl ?
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={action.proofUrl}
                    alt="Preuve"
                    className="absolute inset-0 w-full h-full object-cover blur-[3px] group-hover:blur-0 transition-all duration-500 scale-105 group-hover:scale-100"
                  />
                : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 z-0">
                    <ImageOff className="h-8 w-8 mb-2 opacity-40" />
                    <span className="text-[11px] uppercase tracking-widest font-semibold opacity-50">
                      Anonyme
                    </span>
                  </div>
                }
              </div>

              {/* Card Body */}
              <CardContent className="p-4 md:p-4 bg-white">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="text-red-500">{action.actionType}</span>
                    {action.targetName}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {`${action.impactMultiplier} mois · €${action.computedImpact.toLocaleString()}`}
                  </p>
                  <p className="text-[11px] text-slate-300 pt-0.5">
                    {formatDistanceToNow(action._creationTime, {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

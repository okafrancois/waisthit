"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Target,
  Users,
  Banknote,
  CheckCircle2,
  Clock,
  ImageOff,
} from "lucide-react";
import Link from "next/link";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as Id<"campaigns">;

  const campaign = useQuery(api.actions_api.getCampaign, { id: campaignId });
  const actions = useQuery(api.actions_api.getCampaignActions, { campaignId });

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="w-full bg-slate-950/80 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors h-12 px-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-black text-xl tracking-tighter text-white">
              Waist<span className="text-red-500">Hit</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Campaign Hero */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[600px] h-[200px] md:h-[300px] bg-red-600/10 rounded-full blur-[100px] md:blur-[120px] animate-glow" />
        </div>

        <div className="container mx-auto px-5 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 md:mb-6">
            <Target className="h-5 w-5 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">
              {campaign.type === "paid_subscription" ?
                "Paid Subscription"
              : "Social Follower"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-3 md:mb-4">
            {campaign.targetName}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-lg mx-auto mb-8 md:mb-12 px-2">
            {campaign.title}
          </p>

          {/* Impact Stats — 3-col on all sizes */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto stagger-children">
            <div className="glass rounded-2xl p-4 md:p-6">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-red-500 mx-auto mb-2 opacity-60" />
              <div className="text-xl sm:text-2xl md:text-3xl font-black counter-value text-red-400">
                {campaign.metrics.totalVerifiedActions.toLocaleString()}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest mt-1">
                Participants
              </div>
            </div>
            <div className="glass rounded-2xl p-4 md:p-6">
              <Banknote className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 mx-auto mb-2 opacity-60" />
              <div className="text-xl sm:text-2xl md:text-3xl font-black counter-value text-emerald-400">
                €{campaign.metrics.totalImpactValue.toLocaleString()}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest mt-1">
                Withheld
              </div>
            </div>
            <div className="glass rounded-2xl p-4 md:p-6">
              <Banknote className="h-4 w-4 md:h-5 md:w-5 text-amber-400 mx-auto mb-2 opacity-60" />
              <div className="text-xl sm:text-2xl md:text-3xl font-black counter-value text-amber-400">
                €{campaign.estimatedValue.toFixed(0)}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest mt-1">
                Per Action
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions list */}
      <section className="py-10 md:py-16 bg-slate-900/50">
        <div className="container mx-auto px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Submitted Actions
              {actions && (
                <span className="text-slate-500 font-normal text-base md:text-lg ml-2">
                  ({actions.length})
                </span>
              )}
            </h2>
            <Link href="/#submit" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 font-bold shadow-lg shadow-red-600/20 h-12 text-base">
                Join This Movement
              </Button>
            </Link>
          </div>

          {!actions || actions.length === 0 ?
            <div className="text-center py-12 md:py-16 border border-dashed border-white/10 rounded-2xl">
              <p className="text-slate-500 text-base">
                No actions submitted yet.
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Be the first to make an impact!
              </p>
            </div>
          : <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0 stagger-children">
              {actions.map((action: any) => (
                <Card
                  key={action._id}
                  className="overflow-hidden border-0 bg-slate-800/50 rounded-2xl active:bg-slate-800 transition-colors"
                >
                  <div className="aspect-video bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <Badge
                      className={`absolute top-3 left-3 z-20 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-0 ${
                        action.status === "verified" ?
                          "bg-emerald-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {action.status === "verified" ?
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      : <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      }
                    </Badge>
                    {action.proofUrl ?
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={action.proofUrl}
                        alt="Proof"
                        className="absolute inset-0 w-full h-full object-cover opacity-75"
                      />
                    : <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <ImageOff className="h-8 w-8 opacity-40" />
                      </div>
                    }
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        <span className="text-red-400">
                          {action.actionType === "cancelled" && "Cancelled"}
                          {action.actionType === "paused" && "Paused"}
                          {action.actionType === "unfollowed" && "Unfollowed"}
                        </span>
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(action._creationTime, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      {action.actionType === "unfollowed" ?
                        "Social impact"
                      : `${action.impactMultiplier} months · €${action.computedImpact.toLocaleString()}`
                      }
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        </div>
      </section>
    </main>
  );
}

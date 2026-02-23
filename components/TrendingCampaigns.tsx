"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, AlertCircle, Target } from "lucide-react";
import Link from "next/link";

export function TrendingCampaigns() {
  const campaigns = useQuery(api.actions_api.getTrendingCampaigns);

  if (!campaigns) {
    return (
      <section className="w-full py-10 md:py-16 bg-slate-50">
        <div className="container mx-auto px-5">
          <div className="space-y-4 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse bg-slate-200 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-10 md:py-20 bg-slate-50">
      <div className="container mx-auto px-5 md:px-6">
        <div className="mb-8 md:mb-12 animate-fade-up">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Trending Now
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Active Movements
              </h2>
              <p className="text-slate-500 text-sm md:text-base mt-1 max-w-md">
                Join the campaigns making the biggest economic impact.
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:flex gap-2 rounded-full border-slate-300 min-h-[44px]"
            >
              Browse All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {campaigns.length === 0 ?
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl animate-fade-in">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">
              No campaigns yet.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Be the first to start a movement.
            </p>
          </div>
        : <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0 stagger-children">
            {campaigns.map((campaign: any) => (
              <Card
                key={campaign._id}
                className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl active:scale-[0.98]"
              >
                {/* Top banner */}
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Target className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 md:mb-3 text-red-400 opacity-60" />
                  <h4 className="font-black text-lg md:text-2xl uppercase tracking-wider truncate relative z-10">
                    {campaign.targetName}
                  </h4>
                </div>

                <CardContent className="p-5 md:pt-6 bg-white">
                  <h5 className="font-semibold text-base md:text-lg text-slate-900 line-clamp-1 mb-4">
                    {campaign.title}
                  </h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-medium">
                        Participants
                      </span>
                      <span className="font-black text-slate-900 text-lg counter-value">
                        {campaign.metrics.totalVerifiedActions.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-medium">
                        Impact
                      </span>
                      <span className="font-black text-emerald-600 text-lg counter-value">
                        €{campaign.metrics.totalImpactValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-white px-5 pb-5 md:pb-6">
                  <Link href={`/campaign/${campaign._id}`} className="w-full">
                    <Button className="w-full h-12 md:h-11 rounded-full bg-slate-900 hover:bg-red-600 active:bg-red-700 transition-colors duration-300 font-bold tracking-wide text-base md:text-sm">
                      Join Movement <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        }

        {/* Mobile browse all button */}
        <div className="mt-6 md:hidden">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full border-slate-300 font-bold text-base"
          >
            Browse All Campaigns <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

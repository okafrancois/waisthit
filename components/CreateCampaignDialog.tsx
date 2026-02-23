"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Lock } from "lucide-react";

export function CreateCampaignDialog() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [targetName, setTargetName] = useState("");
  const [type, setType] = useState<"paid_subscription" | "social_follower">(
    "paid_subscription",
  );
  const [estimatedValue, setEstimatedValue] = useState("");

  const createCampaign = useMutation(api.actions_api.createCampaign);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      toast.error("You must be signed in to create a campaign.");
      return;
    }
    setLoading(true);
    try {
      await createCampaign({
        title,
        targetName,
        type,
        estimatedValue: parseFloat(estimatedValue) || 0,
      });
      toast.success("Campaign created! 🎯", {
        description: `${targetName} is now on the wall.`,
      });
      setOpen(false);
      setTitle("");
      setTargetName("");
      setEstimatedValue("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-full h-12 px-5 text-sm font-bold border border-white/10 transition-all">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">New Campaign</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl border-slate-200 p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">
            Start a Movement
          </DialogTitle>
          <DialogDescription className="text-sm">
            Create a boycott campaign. Others will join and submit their
            actions.
          </DialogDescription>
        </DialogHeader>

        {!session?.user ?
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Lock className="h-7 w-7 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                Sign in required
              </p>
              <p className="text-sm text-slate-500 mt-1">
                You need an account to create campaigns.
              </p>
            </div>
          </div>
        : <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. DAZN, Canal+, Creator X"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                required
                className="h-14 rounded-2xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Campaign Title <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Cancel DAZN Subscriptions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-14 rounded-2xl text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Type
                </Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="h-14 rounded-2xl text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="paid_subscription"
                      className="py-3 text-base"
                    >
                      Subscription
                    </SelectItem>
                    <SelectItem
                      value="social_follower"
                      className="py-3 text-base"
                    >
                      Social Follow
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Value (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="19.99"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  required
                  className="h-14 rounded-2xl text-base"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full font-bold h-14 text-base transition-colors"
            >
              {loading ?
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Creating...
                </span>
              : "Create Campaign"}
            </Button>
          </form>
        }
      </DialogContent>
    </Dialog>
  );
}

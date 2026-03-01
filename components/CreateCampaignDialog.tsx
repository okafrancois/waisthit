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
import { Plus, Loader2, Lock, X, Zap, Info } from "lucide-react";

const CAMPAIGN_TYPE_OPTIONS = [
  {
    value: "desabonnement" as const,
    label: "Désabonnement",
    description: "Les participants résilient un abonnement payant",
    presets: [
      { label: "J'ai résilié mon abo", impactValue: 0 },
      { label: "J'ai mis en pause", impactValue: 0 },
    ],
  },
  {
    value: "unfollow" as const,
    label: "Unfollow",
    description: "Les participants se désabonnent sur les réseaux sociaux",
    presets: [
      { label: "Unfollow sur Instagram", impactValue: 0 },
      { label: "Unfollow sur TikTok", impactValue: 0 },
      { label: "Désabonné YouTube", impactValue: 0 },
    ],
  },
  {
    value: "boycott" as const,
    label: "Boycott",
    description: "Les participants cessent d'acheter un produit/service",
    presets: [
      { label: "J'ai arrêté d'acheter", impactValue: 0 },
      { label: "Je boycotte le service", impactValue: 0 },
    ],
  },
];

type ActionTypeEntry = { label: string; impactValue: number };

export function CreateCampaignDialog() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [targetName, setTargetName] = useState("");
  const [campaignType, setCampaignType] = useState<
    "desabonnement" | "unfollow" | "boycott"
  >("desabonnement");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [actionTypes, setActionTypes] = useState<ActionTypeEntry[]>(
    CAMPAIGN_TYPE_OPTIONS[0].presets,
  );
  const [newActionLabel, setNewActionLabel] = useState("");

  const createCampaign = useMutation(api.actions_api.createCampaign);

  function handleCampaignTypeChange(
    value: "desabonnement" | "unfollow" | "boycott",
  ) {
    setCampaignType(value);
    const option = CAMPAIGN_TYPE_OPTIONS.find((o) => o.value === value);
    if (option) {
      setActionTypes(
        option.presets.map((p) => ({
          ...p,
          impactValue: parseFloat(estimatedValue) || 0,
        })),
      );
    }
  }

  function addAction() {
    const label = newActionLabel.trim();
    if (!label) return;
    if (actionTypes.some((a) => a.label.toLowerCase() === label.toLowerCase()))
      return;
    setActionTypes([
      ...actionTypes,
      { label, impactValue: parseFloat(estimatedValue) || 0 },
    ]);
    setNewActionLabel("");
  }

  function removeAction(index: number) {
    setActionTypes(actionTypes.filter((_, i) => i !== index));
  }

  function updateActionImpact(index: number, value: string) {
    const updated = [...actionTypes];
    updated[index] = { ...updated[index], impactValue: parseFloat(value) || 0 };
    setActionTypes(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Tu dois être connecté pour créer un mouvement.");
      return;
    }
    if (actionTypes.length === 0) {
      toast.error("Ajoute au moins un type d'action.");
      return;
    }
    setLoading(true);
    try {
      await createCampaign({
        title,
        targetName,
        campaignType,
        actionTypes,
        estimatedValue: parseFloat(estimatedValue) || 0,
      });
      toast.success("Mouvement créé ! 🎯", {
        description: `${targetName} est maintenant sur le mur.`,
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Échec de la création du mouvement.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setTargetName("");
    setEstimatedValue("");
    setCampaignType("desabonnement");
    setActionTypes(CAMPAIGN_TYPE_OPTIONS[0].presets);
    setNewActionLabel("");
  }

  const selectedOption = CAMPAIGN_TYPE_OPTIONS.find(
    (o) => o.value === campaignType,
  );
  const estVal = parseFloat(estimatedValue) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-full h-12 px-5 text-sm font-bold border border-white/10 transition-all">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nouveau</span>
          <span className="sm:hidden">Nouveau</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-3xl border-slate-200 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">
            Lancer un Mouvement
          </DialogTitle>
          <DialogDescription className="text-sm">
            Crée une campagne de boycott. D&apos;autres rejoindront et
            soumettront leurs actions.
          </DialogDescription>
        </DialogHeader>

        {!session?.user ?
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Lock className="h-7 w-7 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                Connexion requise
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Tu dois avoir un compte pour créer un mouvement.
              </p>
            </div>
          </div>
        : <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Target Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cible <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Le nom de l'entreprise, créateur ou service visé"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                required
                className="h-14 rounded-2xl text-base"
              />
            </div>

            {/* Campaign Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Titre du mouvement <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Un titre clair pour mobiliser (ex: Stop DAZN)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-14 rounded-2xl text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Campaign Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Type
                </Label>
                <Select
                  value={campaignType}
                  onValueChange={(v: any) => handleCampaignTypeChange(v)}
                >
                  <SelectTrigger className="h-14 rounded-2xl text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="py-3"
                      >
                        <div>
                          <div className="font-semibold text-sm">
                            {opt.label}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOption && (
                  <p className="text-[11px] text-slate-400 leading-tight mt-1">
                    {selectedOption.description}
                  </p>
                )}
              </div>

              {/* Estimated Value */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Valeur (€) <span className="text-red-500">*</span>
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
                <p className="text-[11px] text-slate-400 leading-tight mt-1">
                  Combien €/mois la cible perd par participant
                </p>
              </div>
            </div>

            {/* Action Types */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Actions possibles <span className="text-red-500">*</span>
              </Label>
              <p className="text-[11px] text-slate-400 leading-tight -mt-1">
                Les actions que les participants pourront réaliser. Ils pourront
                aussi en proposer de nouvelles.
              </p>

              {/* Existing action chips */}
              <div className="space-y-2">
                {actionTypes.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 group"
                  >
                    <span className="flex-1 text-sm font-medium text-slate-700 truncate pl-1">
                      {action.label}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={action.impactValue || ""}
                      onChange={(e) =>
                        updateActionImpact(index, e.target.value)
                      }
                      placeholder="€"
                      className="w-20 h-9 rounded-lg text-sm text-center min-h-0 p-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="flex-shrink-0 w-8 h-8 min-h-0 rounded-full bg-slate-200 hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new action */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: J'ai résilié mon abo, Unfollow sur Insta..."
                  value={newActionLabel}
                  onChange={(e) => setNewActionLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAction();
                    }
                  }}
                  className="flex-1 h-11 rounded-xl text-sm min-h-0"
                />
                <Button
                  type="button"
                  onClick={addAction}
                  variant="outline"
                  className="h-11 min-h-0 rounded-xl px-3 border-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Impact Recap */}
            {targetName && estVal > 0 && actionTypes.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Récap d&apos;impact
                  </span>
                </div>
                <div className="space-y-1.5">
                  {actionTypes.slice(0, 3).map((action, i) => {
                    const val = action.impactValue || estVal;
                    return (
                      <p
                        key={i}
                        className="text-sm text-slate-600 leading-snug"
                      >
                        Si{" "}
                        <span className="font-bold text-slate-800">
                          100 personnes
                        </span>{" "}
                        font &quot;{action.label}&quot;,{" "}
                        <span className="font-bold text-red-600">
                          {targetName}
                        </span>{" "}
                        perdra{" "}
                        <span className="font-black text-red-600">
                          ~{(val * 100).toLocaleString()}€
                        </span>
                      </p>
                    );
                  })}
                  {actionTypes.length > 3 && (
                    <p className="text-xs text-slate-400">
                      +{actionTypes.length - 3} autres actions...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Les participants pourront aussi proposer leurs propres actions
                personnalisées pour enrichir le mouvement.
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading || actionTypes.length === 0}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full font-bold h-14 text-base transition-colors"
            >
              {loading ?
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Création...
                </span>
              : "Créer le mouvement"}
            </Button>
          </form>
        }
      </DialogContent>
    </Dialog>
  );
}

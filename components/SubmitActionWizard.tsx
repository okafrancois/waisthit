"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Camera,
  UploadCloud,
  Send,
  Loader2,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const formSchema = z.object({
  campaignId: z.string().min(1, { message: "Choisis un mouvement" }),
  actionType: z.string().min(1, { message: "Choisis une action" }),
  isCustomAction: z.boolean(),
  customActionLabel: z.string().optional(),
  impactMonths: z.string().optional(),
});

interface SubmitActionWizardProps {
  /** Pre-select a campaign — hides the campaign dropdown */
  campaignId?: string;
  /** Optional callback after successful submission */
  onSuccess?: () => void;
}

export function SubmitActionWizard({
  campaignId: preselectedCampaignId,
  onSuccess,
}: SubmitActionWizardProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Only fetch campaigns if no preselected campaign
  const campaigns = useQuery(
    api.actions_api.getCampaigns,
    preselectedCampaignId ? "skip" : {},
  );
  const generateUploadUrl = useMutation(api.actions_api.generateUploadUrl);
  const submitAction = useMutation(api.actions_api.submitAction);

  // If preselected, fetch that specific campaign
  const preselectedCampaign = useQuery(
    api.actions_api.getCampaign,
    preselectedCampaignId ?
      { id: preselectedCampaignId as Id<"campaigns"> }
    : "skip",
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignId: preselectedCampaignId || "",
      actionType: "",
      isCustomAction: false,
      customActionLabel: "",
      impactMonths: "1",
    },
  });

  // Sync preselectedCampaignId into form when it changes
  useEffect(() => {
    if (preselectedCampaignId) {
      form.setValue("campaignId", preselectedCampaignId);
    }
  }, [preselectedCampaignId, form]);

  const selectedCampaignId = form.watch("campaignId");
  const isCustomAction = form.watch("isCustomAction");

  const selectedCampaign = useMemo(() => {
    if (preselectedCampaignId && preselectedCampaign) {
      return preselectedCampaign;
    }
    if (!campaigns || !selectedCampaignId) return null;
    return campaigns.find((c: any) => c._id === selectedCampaignId) ?? null;
  }, [
    campaigns,
    selectedCampaignId,
    preselectedCampaignId,
    preselectedCampaign,
  ]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const finalActionType =
      values.isCustomAction && values.customActionLabel ?
        values.customActionLabel
      : values.actionType;

    if (!finalActionType || finalActionType === "__custom__") {
      toast.error("Choisis ou propose une action.");
      return;
    }

    setIsSubmitting(true);
    try {
      let proofStorageId: Id<"_storage"> | undefined = undefined;

      if (selectedFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        if (!result.ok) throw new Error("Failed to upload proof");
        const { storageId } = await result.json();
        proofStorageId = storageId;
      }

      await submitAction({
        campaignId: values.campaignId as Id<"campaigns">,
        actionType: finalActionType,
        isCustomAction: values.isCustomAction,
        impactMultiplier: parseInt(values.impactMonths || "1", 10),
        proofStorageId,
      });

      setIsSubmitted(true);
      toast.success("Action soumise ! 🔥");
      onSuccess?.();

      // Reset after a brief success state
      setTimeout(() => {
        form.reset({
          campaignId: preselectedCampaignId || "",
          actionType: "",
          isCustomAction: false,
          customActionLabel: "",
          impactMonths: "1",
        });
        setSelectedFile(null);
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Quelque chose n'a pas fonctionné. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="w-full max-w-lg mx-auto px-1">
        <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">
            Action enregistrée !
          </h3>
          <p className="text-slate-400 text-sm">
            Merci pour ta participation. Ton impact compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-1">
      <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl border border-white/10">
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
            Soumets ton
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              {" "}
              action
            </span>
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            Pas de compte requis. 100% anonyme.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Campaign Select — only shown when NOT preselected */}
            {!preselectedCampaignId && (
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Mouvement
                    </FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("actionType", "");
                        form.setValue("isCustomAction", false);
                        form.setValue("customActionLabel", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-base focus:border-red-500 transition-colors">
                          <SelectValue placeholder="Choisis un mouvement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaigns?.map((c: any) => (
                          <SelectItem
                            key={c._id}
                            value={c._id}
                            className="py-3 text-base"
                          >
                            {c.title} ({c.targetName})
                          </SelectItem>
                        ))}
                        {!campaigns?.length && (
                          <SelectItem value="none" disabled>
                            Aucun mouvement disponible
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Action Type — dynamic from selected campaign */}
            {selectedCampaign && (
              <FormField
                control={form.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Ton action
                    </FormLabel>
                    <Select
                      onValueChange={(v) => {
                        if (v === "__custom__") {
                          form.setValue("isCustomAction", true);
                          form.setValue("actionType", "__custom__");
                        } else {
                          form.setValue("isCustomAction", false);
                          form.setValue("customActionLabel", "");
                          field.onChange(v);
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-base focus:border-red-500 transition-colors">
                          <SelectValue placeholder="Qu'est-ce que tu as fait ?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedCampaign.actionTypes?.map(
                          (at: any, i: number) => (
                            <SelectItem
                              key={i}
                              value={at.label}
                              className="py-3 text-base"
                            >
                              {at.label}
                            </SelectItem>
                          ),
                        )}
                        <SelectItem
                          value="__custom__"
                          className="py-3 text-base"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            Proposer une action personnalisée
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Custom action text input */}
            {isCustomAction && (
              <FormField
                control={form.control}
                name="customActionLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Décris ton action
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: J'ai signalé le contenu, J'ai quitté le groupe..."
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-base focus:border-amber-500 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500 text-xs">
                      Ton action sera ajoutée au mouvement pour que
                      d&apos;autres la reprennent !
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Impact Months */}
            <FormField
              control={form.control}
              name="impactMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Depuis combien de mois ?
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-base focus:border-red-500 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500 text-xs">
                    Multiplie l&apos;impact de ton action
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Area */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                Preuve (optionnel)
              </span>
              <label
                htmlFor={`dropzone-file-${preselectedCampaignId || "general"}`}
                className={`flex flex-col items-center justify-center w-full min-h-[100px] border-2 ${
                  selectedFile ?
                    "border-red-500/50 bg-red-500/10"
                  : "border-white/10 bg-white/5"
                } border-dashed rounded-2xl cursor-pointer hover:bg-white/10 active:bg-white/15 transition-all duration-300`}
              >
                <div className="flex flex-col items-center justify-center py-5">
                  {selectedFile ?
                    <>
                      <UploadCloud className="w-7 h-7 mb-2 text-red-400" />
                      <p className="text-sm text-red-300 font-semibold truncate max-w-[220px]">
                        {selectedFile.name}
                      </p>
                    </>
                  : <>
                      <Camera className="w-7 h-7 mb-2 text-slate-500" />
                      <p className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-400">
                          Appuie
                        </span>{" "}
                        pour uploader une capture d&apos;écran
                      </p>
                    </>
                  }
                </div>
                <input
                  id={`dropzone-file-${preselectedCampaignId || "general"}`}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 active:to-red-800 text-white font-bold tracking-wide h-14 text-base shadow-lg shadow-red-600/25 transition-all duration-300 hover:shadow-red-600/40"
            >
              {isSubmitting ?
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Envoi...
                </span>
              : <span className="flex items-center gap-2">
                  <Send className="h-5 w-5" /> Soumettre anonymement
                </span>
              }
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

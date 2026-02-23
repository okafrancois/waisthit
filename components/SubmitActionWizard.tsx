"use client";

import { useState } from "react";
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
import { Camera, UploadCloud, Send, Loader2 } from "lucide-react";

const formSchema = z.object({
  campaignId: z.string().min(1, { message: "Select a campaign" }),
  actionType: z.enum(["cancelled", "paused", "unfollowed"]),
  impactMonths: z.string().optional(),
});

export function SubmitActionWizard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const campaigns = useQuery(api.actions_api.getCampaigns);
  const generateUploadUrl = useMutation(api.actions_api.generateUploadUrl);
  const submitAction = useMutation(api.actions_api.submitAction);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignId: "",
      actionType: "cancelled",
      impactMonths: "1",
    },
  });

  const actionType = form.watch("actionType");

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
        actionType: values.actionType,
        impactMultiplier:
          values.actionType === "unfollowed" ?
            1
          : parseInt(values.impactMonths || "1", 10),
        proofStorageId,
      });

      toast.success("Action submitted! 🔥", {
        description: "Your proof is pending verification.",
      });
      form.reset();
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-up px-1">
      <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl border border-white/10">
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
            Submit Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              {" "}
              Action
            </span>
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            No account required. 100% anonymous.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="campaignId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Movement
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-base focus:border-red-500 transition-colors">
                        <SelectValue placeholder="Select a campaign" />
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
                          No campaigns available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <FormField
                control={form.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Action
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-base focus:border-red-500 transition-colors">
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="cancelled"
                          className="py-3 text-base"
                        >
                          Cancelled
                        </SelectItem>
                        <SelectItem value="paused" className="py-3 text-base">
                          Paused
                        </SelectItem>
                        <SelectItem
                          value="unfollowed"
                          className="py-3 text-base"
                        >
                          Unfollowed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impactMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Months
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        disabled={actionType === "unfollowed"}
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white text-base focus:border-red-500 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Upload Area — generous touch target */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                Proof (Optional)
              </span>
              <label
                htmlFor="dropzone-file"
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
                          Tap
                        </span>{" "}
                        to upload a screenshot
                      </p>
                    </>
                  }
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
              </label>
              <FormDescription className="text-slate-500 text-xs mt-2">
                Screenshots are private and reviewed for verification only.
              </FormDescription>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !campaigns?.length}
              className="w-full rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 active:to-red-800 text-white font-bold tracking-wide h-14 text-base shadow-lg shadow-red-600/25 transition-all duration-300 hover:shadow-red-600/40"
            >
              {isSubmitting ?
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Uploading...
                </span>
              : <span className="flex items-center gap-2">
                  <Send className="h-5 w-5" /> Submit Anonymously
                </span>
              }
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

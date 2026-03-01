"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, signOut, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { LogIn, UserPlus, LogOut } from "lucide-react";

export function AuthDialog({ children }: { children?: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn.username({
        username: loginUsername,
        password: loginPassword,
      });
      toast.success("Bon retour !");
      setOpen(false);
    } catch {
      toast.error("Identifiants incorrects. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp.email({
        email: `${signupUsername}@boya.local`,
        password: signupPassword,
        name: signupName || signupUsername,
        username: signupUsername,
      });
      toast.success("Compte créé ! Bienvenue sur Boya.");
      setOpen(false);
    } catch {
      toast.error("Inscription échouée. Ce pseudo est peut-être déjà pris.");
    } finally {
      setLoading(false);
    }
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400 hidden md:block font-medium truncate max-w-[120px]">
          {session.user.name || "Utilisateur"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await signOut();
            toast.success("Déconnecté.");
          }}
          className="text-slate-400 hover:text-red-500 h-12 w-12 rounded-full"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            className="gap-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full h-12 px-4 text-sm"
          >
            <LogIn className="h-5 w-5" />
            <span className="hidden sm:inline">Connexion</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl border-slate-200 p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Bo<span className="text-red-600">ya</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Connecte-toi pour suivre ton impact. Ou soumets anonymement.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 rounded-full h-12">
            <TabsTrigger
              value="login"
              className="rounded-full gap-1.5 text-sm font-bold h-10"
            >
              <LogIn className="h-4 w-4" /> Connexion
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-full gap-1.5 text-sm font-bold h-10"
            >
              <UserPlus className="h-4 w-4" /> Inscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="login-username"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Pseudo
                </Label>
                <Input
                  id="login-username"
                  placeholder="Ton identifiant"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  className="h-14 rounded-2xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="login-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Mot de passe
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl text-base"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-red-600 active:bg-red-700 rounded-full font-bold transition-colors duration-300 h-14 text-base"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="signup-name"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Nom affiché
                </Label>
                <Input
                  id="signup-name"
                  placeholder="Comment tu veux apparaître"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="h-14 rounded-2xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="signup-username"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Pseudo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signup-username"
                  placeholder="Choisis un identifiant unique"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                  className="h-14 rounded-2xl text-base"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="signup-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 8 caractères"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-14 rounded-2xl text-base"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full font-bold transition-colors h-14 text-base"
              >
                {loading ? "Création en cours..." : "Créer un compte"}
              </Button>
              <p className="text-center text-xs text-slate-400">
                L'email est optionnel. Tu peux toujours soumettre des actions
                anonymement.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

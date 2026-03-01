import { ImpactWall } from "@/components/ImpactWall";
import { TrendingCampaigns } from "@/components/TrendingCampaigns";
import { RecentActions } from "@/components/RecentActions";
import { SubmitActionWizard } from "@/components/SubmitActionWizard";
import { AuthDialog } from "@/components/AuthDialog";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* ====== Sticky Navigation — mobile-optimized ====== */}
      <header className="w-full bg-slate-950/80 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="font-black text-xl md:text-2xl tracking-tighter text-white cursor-pointer">
            Bo<span className="text-red-500">ya</span>
          </div>
          {/* Desktop nav links only */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-400">
            <a
              href="#submit"
              className="hover:text-white transition-colors duration-200"
            >
              Soumettre
            </a>
            <a
              href="#campaigns"
              className="hover:text-white transition-colors duration-200"
            >
              Mouvements
            </a>
            <a
              href="#feed"
              className="hover:text-white transition-colors duration-200"
            >
              Fil d'actu
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <AuthDialog />
            <CreateCampaignDialog />
            <a href="#submit">
              <Button className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-full h-10 md:h-11 px-4 md:px-5 text-sm shadow-lg shadow-red-600/20">
                Soumettre
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* ====== Hero + Impact Wall ====== */}
      <ImpactWall />

      {/* ====== CTA - Submit Action ====== */}
      <section
        id="submit"
        className="w-full py-12 md:py-24 bg-slate-950 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[300px] md:w-[500px] h-[200px] md:h-[300px] bg-red-600/5 rounded-full blur-[80px] md:blur-[100px]" />
        </div>

        <div className="container mx-auto px-5 relative z-10">
          <div className="text-center mb-8 md:mb-12 animate-fade-up">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">
              Prêt à faire ton
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                {" "}
                impact
              </span>
              ?
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">
              Chaque résiliation compte. Soumets la tienne pour renforcer la
              pression collective.
            </p>
            <ArrowDown className="h-5 w-5 text-red-500 mx-auto mt-4 animate-bounce" />
          </div>
          <SubmitActionWizard />
        </div>
      </section>

      {/* ====== Trending Campaigns ====== */}
      <div id="campaigns">
        <TrendingCampaigns />
      </div>

      {/* ====== Recent Actions Feed ====== */}
      <div id="feed">
        <RecentActions />
      </div>

      {/* ====== Footer ====== */}
      <footer className="w-full py-8 md:py-10 bg-slate-950 text-slate-500 border-t border-white/5 safe-bottom">
        <div className="container mx-auto px-5 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="font-black text-xl tracking-tighter text-white/30">
            Bo<span className="text-red-500/50">ya</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            © {new Date().getFullYear()} Boya. Frappe au portefeuille.
          </p>
          <div className="flex gap-6 text-xs text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors py-2">
              À propos
            </a>
            <a href="#" className="hover:text-slate-400 transition-colors py-2">
              Confidentialité
            </a>
            <a href="#" className="hover:text-slate-400 transition-colors py-2">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

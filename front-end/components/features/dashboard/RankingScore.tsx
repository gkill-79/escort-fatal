'use client';

import { TrendingUp, Clock, Calendar, Zap, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RankingScoreProps {
  score: number;
  lastActivityAt: string | Date;
  calendarUpdatedAt: string | Date;
  averageResponseTime: number;
}

export function RankingScore({ score, lastActivityAt, calendarUpdatedAt, averageResponseTime }: RankingScoreProps) {
  const percentage = Math.min(Math.round((score / 200) * 100), 100);
  
  // Logic for Tips
  const now = new Date();
  const tips = [];

  const hoursSinceActivity = (now.getTime() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceActivity > 6) {
    tips.push({
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      text: "Connectez-vous pour remonter en tête de liste (+50 pts)",
      action: "En ligne"
    });
  }

  const daysSinceCalendar = (now.getTime() - new Date(calendarUpdatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCalendar > 1) {
    tips.push({
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      text: "Mettez à jour vos dispos aujourd'hui (+30 pts)",
      action: "Agenda"
    });
  }

  if (averageResponseTime > 15) {
    tips.push({
      icon: <Clock className="w-4 h-4 text-green-400" />,
      text: "Répondez plus vite à vos clients (+40 pts)",
      action: "Réactivité"
    });
  }

  const getStatus = () => {
    if (percentage > 80) return { label: "Excellente", color: "text-green-400", bg: "bg-green-500" };
    if (percentage > 50) return { label: "Bonne", color: "text-blue-400", bg: "bg-blue-500" };
    if (percentage > 25) return { label: "Moyenne", color: "text-yellow-400", bg: "bg-yellow-500" };
    return { label: "Faible", color: "text-red-400", bg: "bg-red-500" };
  };

  const status = getStatus();

  return (
    <div className="bg-dark-800/50 border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
      {/* Background Glow */}
      <div className={cn("absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000", status.bg)} />

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        
        {/* Gauge Section */}
        <div className="relative flex-shrink-0">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-dark-700"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * percentage) / 100}
              strokeLinecap="round"
              className={cn("transition-all duration-1000 ease-out", status.color)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{score}</span>
            <span className="text-[10px] font-bold text-dark-400 uppercase tracking-tighter">Score Ranking</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-grow space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <TrendingUp className="w-5 h-5 text-brand-400" />
               <h3 className="text-xl font-bold text-white tracking-tight">Visibilité de mon profil</h3>
            </div>
            <p className="text-sm text-dark-400">
              Votre profil est actuellement jugé à <span className={cn("font-bold", status.color)}>{status.label}</span> visibilité. 
              Plus votre score est haut, plus vous apparaissez en tête des recherches.
            </p>
          </div>

          {/* Tips List */}
          <div className="grid grid-cols-1 gap-3">
            {tips.length > 0 ? (
              tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-3 bg-dark-900/50 border border-white/5 p-3 rounded-2xl hover:bg-dark-900 transition-colors group cursor-default">
                  <div className="p-2 bg-white/5 rounded-lg">
                    {tip.icon}
                  </div>
                  <span className="text-xs font-medium text-dark-200">{tip.text}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/10 p-4 rounded-2xl">
                 <ShieldCheck className="w-5 h-5 text-green-400" />
                 <p className="text-xs font-medium text-green-300">Votre profil est parfaitement optimisé ! Gardez ce rythme pour dominer le classement.</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-dark-500 bg-white/5 px-3 py-1.5 rounded-full w-fit">
            <Info className="w-3 h-3" />
            Le score est recalculé toutes les 15 minutes.
          </div>
        </div>

      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
  );
}

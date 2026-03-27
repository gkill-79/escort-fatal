"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

const DAYS_OF_WEEK = [
  { id: 1, label: "Lundi" },
  { id: 2, label: "Mardi" },
  { id: 3, label: "Mercredi" },
  { id: 4, label: "Jeudi" },
  { id: 5, label: "Vendredi" },
  { id: 6, label: "Samedi" },
  { id: 0, label: "Dimanche" },
];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Record<number, { active: boolean, startHour: number, endHour: number }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize defaults
  useEffect(() => {
    const defaults: any = {};
    DAYS_OF_WEEK.forEach(day => {
      defaults[day.id] = { active: false, startHour: 10, endHour: 22 };
    });
    setSchedule(defaults);
    // Ideally, fetch the existing availability from the server on mount here.
  }, []);

  const handleToggle = (day: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day]?.active }
    }));
  };

  const handleChange = (day: number, field: "startHour" | "endHour", val: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: parseInt(val, 10) }
    }));
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setIsSuccess(false);

    // Map to API format
    const availabilities = [];
    for (const [day, data] of Object.entries(schedule)) {
      if (data.active) {
        availabilities.push({
          dayOfWeek: parseInt(day, 10),
          startHour: data.startHour,
          endHour: data.endHour
        });
      }
    }

    try {
      const res = await fetch("/api/profiles/me/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilities }),
      });

      if (!res.ok) throw new Error("API Error");

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde de l'emploi du temps.");
    } finally {
      setIsLoading(false);
    }
  };

  if (Object.keys(schedule).length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Vos Disponibilités</h1>
        <p className="text-dark-400 mt-1">Gérez vos jours et heures de travail sur la plateforme. Utile pour être affiché "En Ligne" au bon moment.</p>
      </div>

      <div className="bg-dark-800/80 border border-white/5 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-sm">
        
        {isSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Horaires enregistrés avec succès !
          </div>
        )}

        <div className="space-y-4 mb-8">
          {DAYS_OF_WEEK.map(day => (
            <div key={day.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all ${schedule[day.id]?.active ? "bg-dark-900 border-brand-500/30" : "bg-dark-950 border-white/5"}`}>
              
              <div className="flex items-center sm:w-1/3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={schedule[day.id]?.active || false}
                    onChange={() => handleToggle(day.id)}
                    className="w-5 h-5 rounded border-white/20 text-brand-500 bg-dark-800 focus:ring-offset-dark-900 focus:ring-brand-500" 
                  />
                  <span className={`font-medium ${schedule[day.id]?.active ? "text-white" : "text-dark-400"}`}>
                    {day.label}
                  </span>
                </label>
              </div>

              {schedule[day.id]?.active ? (
                <div className="flex items-center gap-3 flex-1">
                  <Clock className="w-4 h-4 text-brand-500 hidden sm:block" />
                  <select 
                     value={schedule[day.id].startHour} 
                     onChange={(e) => handleChange(day.id, "startHour", e.target.value)}
                     className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                  >
                     {[...Array(24)].map((_, i) => <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>)}
                  </select>
                  <span className="text-dark-400 text-sm">à</span>
                  <select 
                     value={schedule[day.id].endHour} 
                     onChange={(e) => handleChange(day.id, "endHour", e.target.value)}
                     className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                  >
                     {[...Array(24)].map((_, i) => <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>)}
                  </select>
                </div>
              ) : (
                <div className="text-dark-500 text-sm italic sm:pl-7">Indisponible (Repos)</div>
              )}

            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/10 text-right">
          <Button onClick={onSubmit} size="lg" disabled={isLoading} className="min-w-[200px]">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sauvegarder mon planning"}
          </Button>
        </div>

      </div>
    </div>
  );
}

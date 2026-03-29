import { Metadata } from "next";
import { Radar } from "@/components/features/radar/Radar";

export const metadata: Metadata = {
  title: "Radar Actif — Escorte Fatal",
  description: "Trouvez les escortes les plus proches de vous en temps réel grâce à notre radar géo-spatial ultra-précis.",
};

export default function RadarPage() {
  return (
    <main className="min-h-screen bg-dark-950">
      <Radar />
    </main>
  );
}

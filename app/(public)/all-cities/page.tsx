import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MapPin, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Annuaire des Villes — Escorte Fatal",
  description: "Trouvez une escorte dans votre département ou votre ville, partout en France.",
};

export const revalidate = 3600; // Cache for 1 hour

export default async function AllCitiesPage() {
  // Fetch active departments that actually contain cities with active profiles
  const departments = await prisma.department.findMany({
    where: {
      cities: {
        some: { profileCount: { gt: 0 } }
      }
    },
    include: {
      cities: {
        where: { profileCount: { gt: 0 } },
        orderBy: { name: "asc" },
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="min-h-screen">
      
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="relative py-12 lg:py-16 border-b border-white/5 bg-dark-900/50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
              <MapPin className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-white tracking-tight">Annuaire des Villes</h1>
              <p className="text-dark-400 mt-1">Recherchez par département en France</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Directory Content ──────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          
          {departments.length === 0 ? (
             <div className="py-20 text-center bg-dark-800/50 rounded-3xl border border-white/5">
                <AlertCircle className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                <h3 className="text-xl text-white font-bold">Aucune ville active</h3>
                <p className="text-dark-400 mt-2">Revenez plus tard lorsqu'une escorte publiera une annonce locale.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((dept: any) => (
                <div key={dept.id} className="bg-dark-800 border border-white/10 rounded-3xl overflow-hidden p-6 hover:border-brand-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                       <span className="text-brand-400">{dept.code}</span>
                       {dept.name}
                    </h2>
                  </div>
                  
                  <ul className="space-y-2">
                    {dept.cities.map((city: any) => (
                      <li key={city.id}>
                        <Link 
                           href={`/escorts?cityId=${city.id}`} 
                           className="flex items-center justify-between group py-2"
                        >
                          <span className="text-dark-300 group-hover:text-white transition-colors flex items-center gap-2">
                             <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-brand-500 transition-colors" />
                             {city.name}
                          </span>
                          <span className="text-xs bg-dark-900 border border-white/10 px-2.5 py-1 rounded-full text-dark-400 group-hover:border-brand-500/50 group-hover:text-brand-300 transition-colors">
                            {formatCount(city.profileCount)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

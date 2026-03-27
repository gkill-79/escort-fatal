"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api-client";

const profileSettingsSchema = z.object({
  bio: z.string().max(1000, "La bio ne doit pas dépasser 1000 caractères").optional().nullable(),
  age: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  hairColor: z.string().optional().nullable(),
  priceFrom: z.string().optional().nullable(),
  priceTo: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  services: z.array(z.string()).optional(),
  acceptsChat: z.boolean().optional().default(true),
});

type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

interface ProfileSettingsFormProps {
  defaultValues: any;
  cities?: any[];
  departments?: any[];
}

const AVAILABLE_SERVICES = [
  { id: "GFE", label: "Girlfriend Experience (GFE)" },
  { id: "ESCORT", label: "Escorting Standard" },
  { id: "OUTCALL", label: "Déplacement (Outcall)" },
  { id: "INCALL", label: "Réception (Incall)" },
  { id: "MASSAGE", label: "Massages" },
  { id: "WEBCAM", label: "Webcam / Virtuel" },
  { id: "VIRTUAL", label: "Services Virtuels (Vente de contenus)" },
  { id: "FETISH", label: "Fétichisme" },
  { id: "DOMINATION", label: "Domination" },
  { id: "BDSM", label: "BDSM" },
];

export function ProfileSettingsForm({ defaultValues, cities, departments }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      bio: defaultValues.bio || "",
      age: defaultValues.age ? String(defaultValues.age) : "",
      height: defaultValues.height ? String(defaultValues.height) : "",
      nationality: defaultValues.nationality || "",
      hairColor: defaultValues.hairColor || "",
      priceFrom: defaultValues.priceFrom ? String(defaultValues.priceFrom) : "",
      priceTo: defaultValues.priceTo ? String(defaultValues.priceTo) : "",
      phone: defaultValues.phone || "",
      cityId: defaultValues.cityId ? String(defaultValues.cityId) : "",
      departmentId: defaultValues.departmentId ? String(defaultValues.departmentId) : "",
      services: defaultValues.services ? defaultValues.services.map((s: any) => s.type) : [],
    },
  });

  const onSubmit = async (data: ProfileSettingsFormValues) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);

    try {
      // Pass both userId (from defaultValues) and data
      const res = await fetchApi("/profiles/me", {
        method: "PATCH",
        body: JSON.stringify({ 
          userId: defaultValues.userId, 
          data: data 
        }),
      });

      if (!res.ok) {
        throw new Error("Une erreur est survenue lors de la sauvegarde.");
      }

      setIsSuccess(true);
      router.refresh();
      
      // Hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}
      
      {isSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm">
          Profil mis à jour avec succès !
        </div>
      )}

      {/* Bio */}
      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Biographie Principale</label>
        <textarea
          {...register("bio")}
          rows={5}
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="Décrivez-vous en quelques mots..."
        />
        {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
      </div>

      {/* Services Proposés */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white pb-2 border-b border-white/10">Prestations & Services</h3>
        <p className="text-sm text-dark-300 mb-3">Sélectionnez toutes les prestations que vous proposez :</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
           {AVAILABLE_SERVICES.map(service => (
             <label key={service.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-dark-900 cursor-pointer hover:border-brand-500/50 transition-colors">
                <input 
                  type="checkbox" 
                  value={service.id} 
                  {...register("services")}
                  className="w-4 h-4 rounded border-white/20 text-brand-500 bg-dark-950 focus:ring-brand-500 focus:ring-2 focus:ring-offset-dark-900"
                />
                <span className="text-sm text-dark-100">{service.label}</span>
             </label>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Caractéristiques Physiques */}
        <div className="space-y-5">
          <h3 className="text-lg font-medium text-white pb-2 border-b border-white/10">Caractéristiques</h3>
          
          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Âge (ans)</label>
            <input
              {...register("age")}
              type="number"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Ex: 25"
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Taille (cm)</label>
            <input
              {...register("height")}
              type="number"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Ex: 170"
            />
          </div>
          
          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Nationalité</label>
            <input
              {...register("nationality")}
              type="text"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Ex: Française"
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Couleur des cheveux</label>
            <input
              {...register("hairColor")}
              type="text"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Ex: Brune, Blonde..."
            />
          </div>
        </div>

        {/* Contact et Localisation */}
        <div className="space-y-5">
           <h3 className="text-lg font-medium text-white pb-2 border-b border-white/10">Contact & Situation</h3>
           
           <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Numéro de Téléphone</label>
            <input
              {...register("phone")}
              type="tel"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Ex: 06 12 34 56 78"
            />
          </div>

          <div>
             <label className="block text-sm text-dark-300 font-medium mb-1.5">Département</label>
             <select 
               {...register("departmentId")}
               className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
             >
               <option value="">Sélectionnez un département</option>
               {departments?.map(d => (
                 <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-sm text-dark-300 font-medium mb-1.5">Ville Principale</label>
             <select 
               {...register("cityId")}
               className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
             >
               <option value="">Sélectionnez une ville</option>
               {cities?.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Tarifs de base */}
        <div className="space-y-5">
          <h3 className="text-lg font-medium text-white pb-2 border-b border-white/10">Tarification</h3>
          <p className="text-xs text-dark-400 mb-2">Définissez une fourchette de prix public pour donner une estimation à vos clients.</p>
          
          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Prix minimum (€)</label>
            <input
              {...register("priceFrom")}
              type="number"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Prix maximum (€)</label>
            <input
              {...register("priceTo")}
              type="number"
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="500"
            />
          </div>
        </div>
      </div>

      {/* Messagerie Privée */}
      <div className="space-y-5">
         <h3 className="text-lg font-medium text-white pb-2 border-b border-white/10">Messagerie Privée</h3>
         <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-dark-900">
           <label className="relative inline-flex items-center cursor-pointer shrink-0">
             <input type="checkbox" className="sr-only peer" {...register("acceptsChat")} />
             <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
           </label>
           <div>
             <span className="block text-sm font-medium text-white">Accepter de nouveaux messages</span>
             <span className="block text-xs text-dark-400">Si activé, le bouton "Message" apparaîtra sur votre profil (Chaque message reçu est facturé 1 crédit à l'expéditeur).</span>
           </div>
         </div>
      </div>

      <div className="pt-6 border-t border-white/10 text-right">
        <Button type="submit" size="lg" disabled={isLoading} className="min-w-[200px]">
          {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>

    </form>
  );
}

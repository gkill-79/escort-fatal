import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSettingsForm } from "@/components/features/dashboard/ProfileSettingsForm";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ESCORT") {
    redirect("/login");
  }

  // Fetch escort's profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return <div>Erreur : Profil introuvable. Veuillez contacter le support.</div>;
  }

  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });

  // Decrypt phone if it exists
  const { decrypt } = await import("@/lib/encryption");
  const phone = profile.phoneEncrypted ? decrypt(profile.phoneEncrypted) : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Informations Générales</h1>
        <p className="text-dark-400 mt-1">Mettez à jour vos informations publiques affichées sur votre profil.</p>
      </div>

      <div className="bg-dark-800/80 border border-white/5 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-sm">
        <ProfileSettingsForm 
           defaultValues={{ ...profile, phone }} 
           cities={cities} 
           departments={departments} 
        />
      </div>
    </div>
  );
}

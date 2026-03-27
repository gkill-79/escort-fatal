import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/queries/profiles";
import { ProfileDetail } from "@/components/features/profiles/ProfileDetail";
import { ProfileComments } from "@/components/features/profiles/ProfileComments";
import { auth } from "@/lib/auth";
import { fetchApi } from "@/lib/api-client";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) {
    return { title: "Profil introuvable" };
  }

  return {
    title: `${profile.name} — Escorte Fatal`,
    description: profile.bio || `Découvrez le profil de ${profile.name} sur Escorte Fatal.`,
  };
}

export default async function EscortProfilePage({ params }: Props) {
  const profile = await getProfileBySlug(params.slug);
  const session = await auth();

  if (!profile) {
    notFound();
  }

  let isFollowing = false;
  if (session?.user?.id) {
    try {
      const res = await fetchApi(`/v2/profiles/is-following?profileId=${profile.id}`, {
        headers: { "x-user-id": session.user.id }
      });
      isFollowing = res.isFollowing;
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }

  return (
    <div className="min-h-screen">
      
      {/* Background styling for the profile page */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-brand-900/20 to-transparent -z-10" />

      {/* Main Container */}
      <div className="pt-8 pb-10">
        <ProfileDetail 
          profile={profile as any} 
          isFollowing={isFollowing}
          currentUserId={session?.user?.id} 
        />
      </div>

      <div className="pb-20 border-t border-white/5 pt-10">
         <ProfileComments 
           profileId={profile.id} 
           comments={profile.comments as any} 
           currentUserId={session?.user?.id} 
         />
      </div>
    </div>
  );
}

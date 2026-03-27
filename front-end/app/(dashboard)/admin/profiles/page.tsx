import { fetchApi } from "@/lib/api-client";
import { updateProfileStatus } from "../actions";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminProfilesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let profiles: any[] = [];
  try {
    profiles = await fetchApi("/admin/profiles/pending", {
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });
  } catch (error) {
    console.error("Error fetching admin profiles:", error);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profils en attente</h1>
      <div className="grid gap-6">
        {profiles.length === 0 ? (
          <p className="text-slate-400">Aucun profil en attente de modération.</p>
        ) : (
          profiles.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{p.name}</h2>
                  <span className="text-slate-500 text-sm">User: {p.user?.username}</span>
                </div>
                <p className="text-slate-400 mt-2 line-clamp-2">{p.bio}</p>
                <div className="flex gap-3 mt-6">
                  <form action={updateProfileStatus.bind(null, p.id, 'APPROVED')}>
                    <Button type="submit" className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">Approuver</Button>
                  </form>
                  <form action={updateProfileStatus.bind(null, p.id, 'REJECTED')}>
                    <Button type="submit" variant="destructive" className="bg-red-500 text-white font-bold hover:bg-red-600">Refuser</Button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

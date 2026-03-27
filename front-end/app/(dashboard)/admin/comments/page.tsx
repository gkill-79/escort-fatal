import { fetchApi } from "@/lib/api-client";
import { approveComment, deleteComment } from "../actions";
import { formatTimeAgo } from "@/lib/utils";
import { Check, Trash2, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminCommentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let pendingComments: any[] = [];
  try {
    pendingComments = await fetchApi("/admin/comments/pending", {
      headers: { 
        "x-user-id": session.user.id,
        "x-user-role": session.user.role
      }
    });
  } catch (error) {
    console.error("Error fetching admin comments:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Modération des Avis</h1>
        <p className="text-dark-400 mt-1">
          {pendingComments.length} avis en attente d'approbation.
        </p>
      </div>

      {pendingComments.length === 0 ? (
        <div className="bg-dark-800/50 border border-white/5 rounded-2xl p-12 text-center text-dark-300">
          <Star className="w-12 h-12 mx-auto text-dark-600 mb-4" />
          <p>Aucun commentaire en attente pour le moment !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingComments.map((comment: any) => (
            <div key={comment.id} className="bg-dark-800 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-medium">{comment.author?.username}</span>
                  <span className="text-dark-500 text-xs">— {formatTimeAgo(new Date(comment.createdAt))}</span>
                  <div className="flex bg-dark-900 border border-white/5 rounded-full px-2 py-0.5 items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-yellow-400 font-bold">{comment.rating}</span>
                  </div>
                </div>

                <p className="text-dark-200 text-sm italic mb-4">"{comment.content}"</p>

                <div className="text-xs text-dark-400 flex items-center gap-1">
                  Ciblant <Link href={`/escorts/${comment.profile?.slug}`} target="_blank" className="text-brand-400 hover:underline flex items-center gap-1">
                    {comment.profile?.name} <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <form action={approveComment.bind(null, comment.id)}>
                  <Button type="submit" variant="outline" className="text-green-400 border-green-500/30 hover:bg-green-500/10 hover:text-green-300">
                    <Check className="w-4 h-4 mr-2" /> Approuver
                  </Button>
                </form>

                <form action={deleteComment.bind(null, comment.id)}>
                  <Button type="submit" variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300">
                    <Trash2 className="w-4 h-4 mr-2" /> Rejeter
                  </Button>
                </form>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

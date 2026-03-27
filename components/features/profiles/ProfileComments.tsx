import { CommentForm } from "./CommentForm";
import { Star, MessageCircle } from "lucide-react";
import { formatTimeAgo, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  rating: number | null;
  createdAt: Date;
  author: {
    username: string;
    avatarUrl: string | null;
  };
}

interface ProfileCommentsProps {
  profileId: string;
  comments: Comment[];
  currentUserId?: string | null;
}

export function ProfileComments({ profileId, comments, currentUserId }: ProfileCommentsProps) {
  const average = comments.length > 0
    ? comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length
    : 0;

  return (
    <div className="mt-12 max-w-[1200px] mx-auto px-4">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-brand-500" />
        <h2 className="text-2xl font-bold text-white">Avis des membres</h2>
        <span className="bg-dark-800 text-dark-300 text-sm font-medium px-3 py-1 rounded-full">
          {comments.length}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Colonne gauche (Liste des avis) */}
        <div className="flex-1 space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-dark-800/30 rounded-2xl border border-white/5">
              <Star className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-300 text-lg font-medium">Aucun avis pour le moment.</p>
              <p className="text-dark-500 text-sm">Soyez le premier à partager votre expérience !</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-dark-800/50 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center font-bold text-dark-300 uppercase overflow-hidden shrink-0">
                      {comment.author.avatarUrl ? (
                        <Image src={comment.author.avatarUrl} alt={comment.author.username} width={40} height={40} className="object-cover" />
                      ) : (
                        comment.author.username.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{comment.author.username}</div>
                      <div className="text-xs text-dark-400">{formatTimeAgo(new Date(comment.createdAt))}</div>
                    </div>
                  </div>
                  
                  {comment.rating && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4",
                            star <= (comment.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-dark-700"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Colonne droite (Stats globales & Formulaire) */}
        <div className="lg:w-[400px] shrink-0 space-y-6">
          
          {comments.length > 0 && (
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 p-6 rounded-2xl border border-white/5 text-center">
              <div className="text-5xl font-black text-white mb-2">{average.toFixed(1)}</div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= Math.round(average) ? "text-yellow-400 fill-yellow-400" : "text-dark-700"
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-dark-400">Basé sur {comments.length} avis vérifiés</div>
            </div>
          )}

          {currentUserId ? (
            <CommentForm profileId={profileId} />
          ) : (
            <div className="bg-brand-500/10 border border-brand-500/20 p-6 rounded-2xl text-center">
              <h3 className="text-brand-400 font-bold mb-2">Partagez votre avis</h3>
              <p className="text-sm text-dark-300 mb-4">Vous devez posséder un compte membre pour évaluer cette escort.</p>
              <Link href="/login">
                <button className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-6 rounded-xl transition w-full">
                  Se connecter
                </button>
              </Link>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}

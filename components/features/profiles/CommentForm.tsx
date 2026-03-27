"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const commentSchema = z.object({
  rating: z.number().min(1, "Veuillez sélectionner une note").max(5),
  content: z.string().min(5, "Votre avis doit contenir au moins 5 caractères").max(1000),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  profileId: string;
}

export function CommentForm({ profileId }: CommentFormProps) {
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { rating: 0, content: "" },
  });

  const selectedRating = watch("rating");

  const onSubmit = async (data: CommentFormValues) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          content: data.content,
          rating: data.rating,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Une erreur est survenue.");
      }

      setIsSuccess(true);
      reset(); // Clear form
      router.refresh(); // Refresh page to show the new comment implicitly
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-center">
        <p className="font-bold text-lg mb-1">Merci pour votre avis !</p>
        <p className="text-sm">Votre commentaire a été publié avec succès. Il a contribué à la note globale de l&apos;escorte.</p>
        <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4 border-green-500/50 text-green-400 hover:bg-green-500/20">
          Laisser un autre avis
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-dark-800/50 border border-white/5 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Laissez votre avis</h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* Note interactive */}
      <div className="mb-5">
        <label className="block text-sm text-dark-300 font-medium mb-2">Votre note</label>
        <div className="flex gap-1" onMouseLeave={() => setHoveredStar(null)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = hoveredStar ? star <= hoveredStar : star <= selectedRating;
            return (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoveredStar(star)}
                onClick={() => setValue("rating", star, { shouldValidate: true })}
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    isActive ? "text-yellow-400 fill-yellow-400" : "text-dark-600"
                  )}
                />
              </button>
            );
          })}
        </div>
        {errors.rating && <p className="text-red-400 text-xs mt-2">{errors.rating.message}</p>}
      </div>

      {/* Commentaire texte */}
      <div className="mb-4">
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Votre expérience</label>
        <textarea
          {...register("content")}
          rows={4}
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
          placeholder="Racontez votre expérience aux autres membres..."
        />
        {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? "Publication..." : "Publier l'avis"}
        </Button>
      </div>
    </form>
  );
}

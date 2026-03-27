"use client";

import { useState, useTransition } from "react";
import { formatTimeAgo } from "@/lib/utils";
import { Ban, CheckCircle, Coins, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toggleUserBan, updateChatCredits, deleteUser } from "../actions";
import { toast } from "react-hot-toast";
import type { User } from "@prisma/client";

type UserRowData = Pick<
  User,
  "id" | "username" | "email" | "role" | "isActive" | "chatCredits" | "createdAt"
>;

function getActionError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Une erreur est survenue pendant l'action admin.";
}

export default function UserRow({ user }: { user: UserRowData }) {
  const [isPending, startTransition] = useTransition();
  const [credits, setCredits] = useState(user.chatCredits.toString());

  const handleBanToggle = () => {
    startTransition(async () => {
      try {
        await toggleUserBan(user.id, user.isActive);
        toast.success(user.isActive ? "Compte suspendu." : "Compte réactivé.");
      } catch (error: unknown) {
        toast.error(getActionError(error));
      }
    });
  };

  const handleUpdateCredits = () => {
    const val = Math.max(0, parseInt(credits, 10));
    if (!isNaN(val)) {
      startTransition(async () => {
        try {
          await updateChatCredits(user.id, val);
          setCredits(val.toString());
          toast.success("Crédits mis à jour.");
        } catch (error: unknown) {
          toast.error(getActionError(error));
        }
      });
    } else {
      toast.error("Veuillez entrer un nombre valide.");
    }
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce compte ?")) {
      startTransition(async () => {
        try {
          await deleteUser(user.id);
          toast.success("Compte supprimé.");
        } catch (error: unknown) {
          toast.error(getActionError(error));
        }
      });
    }
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center shrink-0 border border-white/10">
            {user.role === "ESCORT" ? "💃" : user.role === "ADMIN" ? "👑" : "👤"}
          </div>
          <div>
            <div className="text-white font-medium text-sm">{user.username}</div>
            <div className="text-dark-400 text-xs font-mono">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
          user.role === "ADMIN" ? "bg-purple-500/10 text-purple-400" :
          user.role === "ESCORT" ? "bg-brand-500/10 text-brand-400" :
          "bg-blue-500/10 text-blue-400"
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {user.isActive ? (
          <span className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded w-max">
            <CheckCircle className="w-3 h-3" /> Actif
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-400 text-xs font-medium bg-red-500/10 px-2 py-1 rounded w-max">
            <Ban className="w-3 h-3" /> Banni
          </span>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-dark-900 border border-white/10 rounded-lg overflow-hidden w-24">
            <div className="px-2 text-yellow-500 bg-dark-800 border-r border-white/10 py-1.5 h-full">
              <Coins className="w-4 h-4" />
            </div>
            <input 
              type="number" 
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full bg-transparent text-white text-sm px-2 py-1 focus:outline-none focus:bg-white/5"
            />
          </div>
          {credits !== user.chatCredits.toString() && (
             <Button 
               size="sm" 
               variant="outline" 
               disabled={isPending}
               onClick={handleUpdateCredits}
               className="text-[10px] h-8 px-2 border-brand-500/50 text-brand-400 hover:bg-brand-500 hover:text-white"
             >
               Sauver
             </Button>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-400">
        {formatTimeAgo(new Date(user.createdAt))}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          {user.role !== "ADMIN" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleBanToggle}
              className={`h-8 w-8 p-0 rounded-full border ${user.isActive ? "border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white" : "border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white"}`}
              title={user.isActive ? "Suspendre" : "Réactiver"}
            >
              {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </Button>
          )}
          {user.role !== "ADMIN" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
              className="h-8 w-8 p-0 border border-dark-600 text-dark-400 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-full transition-colors"
              title="Supprimer définitivement"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

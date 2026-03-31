import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatLayout } from "@/components/features/chat/ChatLayout";

export const metadata = {
  title: "Messagerie — Escorte Fatal",
};

export default async function MessagesPage({ searchParams }: { searchParams: { room?: string } }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="h-[calc(100vh-100px)] -mt-6 -mx-4 md:-mx-8 rounded-xl md:rounded-3xl overflow-hidden bg-dark-900 border border-white/5 shadow-2xl shadow-black/50">
      <ChatLayout 
        currentUserId={session.user.id} 
        initialRoomId={searchParams.room} 
      />
    </div>
  );
}

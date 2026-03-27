import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-dark-400 mb-6">Cette page n&apos;existe pas.</p>
      <Link href="/">
        <Button>Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}

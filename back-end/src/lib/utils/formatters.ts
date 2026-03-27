export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + " M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".", ",") + " k";
  return n.toLocaleString("fr-FR");
}

export function formatPriceRange(from?: number | null, to?: number | null): string {
  if (from == null && to == null) return "—";
  if (from != null && to != null && from === to) return `${from} €`;
  if (from != null && to != null) return `${from} – ${to} €`;
  if (from != null) return `À partir de ${from} €`;
  if (to != null) return `Jusqu'à ${to} €`;
  return "—";
}

export function formatTimeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "À l'instant";
  if (s < 3600) return `Il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `Il y a ${Math.floor(s / 3600)} h`;
  if (s < 2592000) return `Il y a ${Math.floor(s / 86400)} j`;
  return date.toLocaleDateString("fr-FR");
}

export function formatServiceLabel(type: string): string {
  const labels: Record<string, string> = {
    GFE: "Girlfriend Experience",
    BDSM: "BDSM",
    WEBCAM: "Webcam",
    MASSAGE: "Massage",
    DOMINATION: "Domination",
    OUTCALL: "Déplacement",
    INCALL: "À domicile",
    VIRTUAL: "Virtuel",
    ESCORT: "Escorte",
    FETISH: "Fétichisme",
  };
  return labels[type] ?? type;
}

export function formatHeight(cm: number): string {
  if (cm >= 100) return `${(cm / 100).toFixed(2).replace(".", ",")} m`;
  return `${cm} cm`;
}

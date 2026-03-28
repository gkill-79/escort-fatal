// Strict blacklist (to be enriched).
const BLACKLISTED_TERMS = [
  'tarif', 'prix pour', 'mineur', 'viol', 'drogue', 'cc', 'coke', 'bareback', 'sans capote'
];

/**
 * Preemptive NLP Check to block illegal/prohibited content before DB insertion.
 * Placeholder for real NLP API (AWS Comprehend, Moderation API, etc.)
 */
export async function checkNlpPreemptive(text: string): Promise<{ isSafe: boolean; reason?: string }> {
  if (!text) return { isSafe: true };
  
  const normalizedText = text.toLowerCase();
  
  // 1. Basic Regex/Term Detection
  for (const term of BLACKLISTED_TERMS) {
    if (normalizedText.includes(term.toLowerCase())) {
      return { 
        isSafe: false, 
        reason: `Contient des termes non conformes aux CGU (Code: NLP-101)` 
      };
    }
  }

  // 2. Future expansion: Call AI Moderation API
  // const mlResult = await moderationApi.check(text);
  // if (mlResult.flagged) return { isSafe: false, reason: "Bloqué par l'algorithme sémantique" };

  return { isSafe: true };
}

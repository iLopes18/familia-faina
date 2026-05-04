export const calculateMatriculaYear = (entryYear: number | null | string, conclusionYear?: number | null | string): number => {
  const entry = Number(entryYear);
  if (!entry || isNaN(entry)) return 1;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (8 is September)
  
  // Standard calculation: 1st year until September of next year.
  // In October becomes 2nd year.
  let matriculaYear = (currentYear - entry) + (currentMonth >= 9 ? 1 : 0);
  
  // If user has a conclusion year defined
  if (conclusionYear) {
    const conclusion = Number(conclusionYear);
    if (!isNaN(conclusion)) {
      const delta = conclusion - entry;
      
      // If we have already reached or passed the point of conclusion
      const hasReachedConclusion = currentYear > conclusion || (currentYear === conclusion && currentMonth >= 6); // Assuming June end

      if (hasReachedConclusion) {
        // Apply user's specific Delta rules for concluded members
        if (delta === 0) return 1; // Sem nós, sem traje
        if (delta === 1) return 1.5; // Com traje, 0 nós (1.5 > 1 but < 2)
        if (delta === 2) return 2; // Com traje, 2 nós
        if (delta === 3) return 3; // Com traje, 3 nós
        if (delta === 4) return 4; // Com traje, 4 nós
        if (delta >= 5) return 5; // Com traje, todos os nós e rede
      } else {
        // If still in uni, cap it at the future conclusion power
        const maxDelta = delta;
        // This is a bit tricky: if current calculation exceeds what they will have at conclusion, cap it.
        // But for now, user mainly defined what happens when they leave.
        // We'll cap the standard calculation to not exceed the potential finish state.
        if (maxDelta === 1 && matriculaYear > 1) matriculaYear = 1.5;
        else if (maxDelta >= 2) matriculaYear = Math.min(matriculaYear, maxDelta);
        else if (maxDelta === 0) matriculaYear = 1;
      }
    }
  }

  return Math.max(1, matriculaYear);
};

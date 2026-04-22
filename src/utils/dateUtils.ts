export const calculateMatriculaYear = (entryYear: number | null | string): number => {
  const entry = Number(entryYear);
  if (!entry || isNaN(entry)) return 1;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (9 is October)
  
  // Rule from user: 
  // Entrance 2024 is 1st year until September 2025.
  // In October 2025 it becomes 2nd year.
  // Math: 
  // Oct 2024 (Entry 2024): (2024 - 2024) + 1 = 1
  // Sept 2025 (Entry 2024): (2025 - 2024) + 0 = 1
  // Oct 2025 (Entry 2024): (2025 - 2024) + 1 = 2
  
  const matriculaYear = (currentYear - entry) + (currentMonth >= 9 ? 1 : 0);
  return Math.max(1, matriculaYear);
};

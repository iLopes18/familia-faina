import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const ALUVIÃO_COLORS: Record<string, string> = {
  "Bioquímica": "#87CEEB",
  "Química": "#87CEEB",
  "Biotecnologia": "#87CEEB",
  "Matemática": "#87CEEB",
  "Engenharia Mecânica": "#F97316",
  "Educação básica": "#FBCFE8",
  "Administração Pública": "#1E3A8A",
  "Enfermagem": "#22C55E",
  "Fisioterapia": "#22C55E",
  "Terapia da fala": "#22C55E",
  "Imagem médica e radioterapia": "#22C55E",
  "Engenharia Informática": "#22C55E",
  "Engenharia Física": "#EAB308",
  "Física": "#EAB308",
  "Medicina": "#EAB308",
  "Engenharia de Computadores e Informática": "#EAB308",
  "Design": "#EF4444",
  "Economia": "#EF4444",
  "Engenharia Eletrotécnica e de Computadores": "#000000",
  "Engenharia Aeroespacial": "#000000"
};

/**
 * Gets the Aluvião t-shirt color for a given course.
 * Normalize course names for matching.
 */
export const getAluviãoColor = (courseName?: string): string => {
  if (!courseName) return "#E2E8F0"; // Default gray
  
  const normalized = courseName.trim().toLowerCase();
  
  for (const [course, color] of Object.entries(ALUVIÃO_COLORS)) {
    if (normalized.includes(course.toLowerCase())) {
      return color;
    }
  }
  
  return "#E2E8F0"; // Default gray
};

/**
 * Utility to seed courses to Firestore if needed (can be called from a dev console or specific page)
 */
export const seedCourses = async () => {
  const cursosRef = collection(db, "cursos");
  // This is a simplified version, usually you'd check if they exist first
  // or use a more robust migration script.
  console.log("Seeding courses...");
};

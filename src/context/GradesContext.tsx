import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Grade } from "@/types";

interface GradesContextValue {
  grades: Grade[];
  addGrade: (subjectId: string, name: string, value: number) => void;
  updateGrade: (
    id: string,
    patch: Partial<Pick<Grade, "name" | "value">>,
  ) => void;
  removeGrade: (id: string) => void;
  removeGradesFor: (subjectId: string) => void;
  importGrades: (grades: Grade[]) => void;
  clearGrades: () => void;
  averageFor: (subjectId: string) => number | null;
}

const GradesContext = createContext<GradesContextValue | null>(null);

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Notas por disciplina, persistidas em localStorage. A média é calculada
 *  em memória (média aritmética simples das notas da disciplina). */
export function GradesProvider({ children }: { children: ReactNode }) {
  const [grades, setGrades] = useLocalStorage<Grade[]>("grades", []);

  const addGrade = useCallback(
    (subjectId: string, name: string, value: number) => {
      const id = uid("grd");
      setGrades((prev) => [
        ...prev,
        { id, subjectId, name, value, createdAt: Date.now() },
      ]);
    },
    [setGrades],
  );

  const updateGrade = useCallback(
    (id: string, patch: Partial<Pick<Grade, "name" | "value">>) => {
      setGrades((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      );
    },
    [setGrades],
  );

  const removeGrade = useCallback(
    (id: string) => {
      setGrades((prev) => prev.filter((g) => g.id !== id));
    },
    [setGrades],
  );

  const removeGradesFor = useCallback(
    (subjectId: string) => {
      setGrades((prev) => prev.filter((g) => g.subjectId !== subjectId));
    },
    [setGrades],
  );

  const importGrades = useCallback(
    (incoming: Grade[]) => {
      setGrades(incoming ?? []);
    },
    [setGrades],
  );

  const clearGrades = useCallback(() => setGrades([]), [setGrades]);

  const averageFor = useCallback(
    (subjectId: string) => {
      const list = grades.filter((g) => g.subjectId === subjectId);
      if (list.length === 0) return null;
      const sum = list.reduce((acc, g) => acc + g.value, 0);
      return sum / list.length;
    },
    [grades],
  );

  const value = useMemo(
    () => ({
      grades,
      addGrade,
      updateGrade,
      removeGrade,
      removeGradesFor,
      importGrades,
      clearGrades,
      averageFor,
    }),
    [
      grades,
      addGrade,
      updateGrade,
      removeGrade,
      removeGradesFor,
      importGrades,
      clearGrades,
      averageFor,
    ],
  );

  return (
    <GradesContext.Provider value={value}>{children}</GradesContext.Provider>
  );
}

export function useGrades(): GradesContextValue {
  const ctx = useContext(GradesContext);
  if (!ctx)
    throw new Error("useGrades deve ser usado dentro de GradesProvider");
  return ctx;
}
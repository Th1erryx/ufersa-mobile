import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { Capacitor } from "@capacitor/core";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { fileStorage, blobUrl, revokeBlobUrl } from "@/lib/fileStorage";
import type { Material, MaterialCategory } from "@/types";

export interface MaterialDraft {
  file: File;
  title?: string;
  category: MaterialCategory;
}

interface MaterialsContextValue {
  materials: Material[];
  addMaterials: (subjectId: string, drafts: MaterialDraft[]) => Promise<void>;
  updateMaterial: (
    id: string,
    patch: Partial<Pick<Material, "title" | "category">>,
  ) => void;
  removeMaterial: (id: string) => Promise<void>;
  openMaterial: (id: string, contentType?: string) => Promise<void>;
  shareMaterial: (id: string) => Promise<void>;
  togglePin: (id: string) => void;
  moveMaterial: (id: string, direction: -1 | 1) => void;
  importMaterials: (
    items: { material: Material; base64: string | null }[],
  ) => Promise<void>;
  clearMaterials: () => Promise<void>;
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null);

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/** Metadados dos materiais em localStorage; binário dos arquivos em disco
 *  (Capacitor) ou IndexedDB (web). A lista alimenta a seção de materiais
 *  de cada disciplina. */
export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useLocalStorage<Material[]>(
    "materials",
    [],
  );

  /** Materiais legados (v1.1) não têm categoria; normaliza para 'other'. */
  const normalized = useMemo(
    () =>
      materials.map((m) => ({
        ...m,
        category: m.category ?? ("other" as const),
      })),
    [materials],
  );

  const addMaterials = useCallback(
    async (subjectId: string, drafts: MaterialDraft[]) => {
      if (drafts.length === 0) return;
      const created: Material[] = [];
      for (const draft of drafts) {
        if (draft.file.size > MAX_FILE_SIZE) {
          console.warn("Skipping file larger than limit", draft.file.name);
          continue;
        }
        const id = uid("mat");
        await fileStorage.save(id, draft.file);
        const dot = draft.file.name.lastIndexOf(".");
        const extension =
          dot >= 0 ? draft.file.name.slice(dot + 1).toLowerCase() : "";
        created.push({
          id,
          subjectId,
          name: draft.file.name,
          extension,
          size: draft.file.size,
          createdAt: Date.now(),
          category: draft.category,
          title: draft.title?.trim() || undefined,
        });
      }
      setMaterials((prev) => [...prev, ...created]);
    },
    [setMaterials],
  );

  const updateMaterial = useCallback(
    (id: string, patch: Partial<Pick<Material, "title" | "category">>) => {
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      );
    },
    [setMaterials],
  );

  const removeMaterial = useCallback(
    async (id: string) => {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      await fileStorage.remove(id);
    },
    [setMaterials],
  );

  const openMaterial = useCallback(async (id: string, contentType?: string) => {
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { FileOpener } = await import("@capacitor-community/file-opener");
      const { uri } = await Filesystem.getUri({
        path: `materials/${id}`,
        directory: Directory.Data,
      });
      await FileOpener.open({
        filePath: uri,
        contentType: contentType ?? "application/octet-stream",
      });
      return;
    }
    const blob = await fileStorage.load(id);
    const url = blobUrl(blob);
    // open blob URL in new tab without granting access to window.opener
    window.open(url, "_blank", "noopener");
    setTimeout(() => revokeBlobUrl(url), 60_000);
  }, []);

  const shareMaterial = useCallback(async (id: string) => {
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");
      const { uri } = await Filesystem.getUri({
        path: `materials/${id}`,
        directory: Directory.Data,
      });
      await Share.share({ url: uri });
      return;
    }
    const blob = await fileStorage.load(id);
    const url = blobUrl(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "";
    anchor.click();
    setTimeout(() => revokeBlobUrl(url), 60_000);
  }, []);

  const togglePin = useCallback(
    (id: string) => {
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)),
      );
    },
    [setMaterials],
  );

  const moveMaterial = useCallback(
    (id: string, direction: -1 | 1) => {
      setMaterials((prev) => {
        const index = prev.findIndex((m) => m.id === id);
        if (index < 0) return prev;
        const moving = prev[index];
        let target = index + direction;
        while (
          target >= 0 &&
          target < prev.length &&
          (prev[target].subjectId !== moving.subjectId ||
            (!moving.pinned && prev[target].pinned))
        ) {
          target += direction;
        }
        if (target < 0 || target >= prev.length) return prev;
        const next = prev.slice();
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    },
    [setMaterials],
  );

  const importMaterials = useCallback(
    async (items: { material: Material; base64: string | null }[]) => {
      for (const item of items) {
        if (item.base64) {
          const b64 = item.base64.slice(item.base64.indexOf(",") + 1);
          // Reject extremely large imported binaries
          if (b64.length > MAX_FILE_SIZE * 1.5) {
            console.warn(
              "Skipping imported material larger than limit",
              item.material.id,
            );
            continue;
          }
          const binary = atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++)
            bytes[i] = binary.charCodeAt(i);
          const file = new File([bytes], item.material.name, {
            type: "application/octet-stream",
          });
          await fileStorage.save(item.material.id, file);
        }
      }
      setMaterials((prev) => {
        const next = prev.filter(
          (m) => !items.some((i) => i.material.id === m.id),
        );
        return [...items.map((i) => i.material), ...next];
      });
    },
    [setMaterials],
  );

  const clearMaterials = useCallback(async () => {
    for (const material of materials) {
      await fileStorage.remove(material.id);
    }
    setMaterials([]);
  }, [materials, setMaterials]);

  const value = useMemo(
    () => ({
      materials: normalized,
      addMaterials,
      updateMaterial,
      removeMaterial,
      openMaterial,
      shareMaterial,
      togglePin,
      moveMaterial,
      importMaterials,
      clearMaterials,
    }),
    [
      normalized,
      addMaterials,
      updateMaterial,
      removeMaterial,
      openMaterial,
      shareMaterial,
      togglePin,
      moveMaterial,
      importMaterials,
      clearMaterials,
    ],
  );

  return (
    <MaterialsContext.Provider value={value}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials(): MaterialsContextValue {
  const ctx = useContext(MaterialsContext);
  if (!ctx)
    throw new Error("useMaterials deve ser usado dentro de MaterialsProvider");
  return ctx;
}

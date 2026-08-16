import { Capacitor } from "@capacitor/core";
import { fileStorage } from "@/lib/fileStorage";
import type {
  Material,
  QuickLink,
  ScheduleEntry,
  Subject,
  ThemePreference,
} from "@/types";

export interface BackupPayload {
  version: 1;
  exportedAt: number;
  schedule: { subjects: Subject[]; entries: ScheduleEntry[] };
  profile: { name?: string; ra?: string; course?: string; period?: string; photo?: string };
  qrCode: string;
  campus: string;
  theme: ThemePreference;
  notifications: { classes: boolean; exams: boolean; ru: boolean };
  links: QuickLink[];
  materials: { material: Material; base64: string | null }[];
}

export interface BackupDeps {
  subjects: Subject[];
  entries: ScheduleEntry[];
  profile: BackupPayload["profile"];
  qrCode: string;
  campusId: string;
  theme: ThemePreference;
  notifications: BackupPayload["notifications"];
  links: QuickLink[];
  materials: Material[];
}

const blobToBase64 = (blob: Blob) =>
  new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });

/** Monta o JSON de backup completo (grade, perfil, QR, campus, tema,
 *  notificações e materiais com seus binários). */
export async function buildBackup(deps: BackupDeps): Promise<BackupPayload> {
  const materials = await Promise.all(
    deps.materials.map(async (material) => {
      try {
        const blob = await fileStorage.load(material.id);
        const base64 = await blobToBase64(blob);
        return { material, base64 };
      } catch {
        return { material, base64: null };
      }
    }),
  );
  return {
    version: 1,
    exportedAt: Date.now(),
    schedule: { subjects: deps.subjects, entries: deps.entries },
    profile: deps.profile,
    qrCode: deps.qrCode,
    campus: deps.campusId,
    theme: deps.theme,
    notifications: deps.notifications,
    links: deps.links,
    materials,
  };
}

/** Exporta o backup: compartilha arquivo no nativo; baixa no navegador. */
export async function exportBackup(payload: BackupPayload): Promise<void> {
  const json = JSON.stringify(payload);
  const filename = `ufersa-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } =
      await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ files: [uri], title: "Backup UFERSA Mobile" });
    return;
  }
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export interface RestoreTargets {
  applySchedule: (data: {
    subjects: Subject[];
    entries: ScheduleEntry[];
  }) => void;
  applyProfile: (p: BackupPayload["profile"]) => void;
  applyQrCode: (v: string) => void;
  applyCampus: (id: string) => void;
  applyTheme: (t: ThemePreference) => void;
  applyNotifications: (n: Partial<BackupPayload["notifications"]>) => void;
  applyLinks: (links: QuickLink[]) => void;
  applyMaterials: (
    materials: { material: Material; base64: string | null }[],
  ) => Promise<void>;
}

/** Restaura o backup no estado atual do app (incluindo binários dos materiais). */
export async function restoreBackup(
  json: string,
  targets: RestoreTargets,
): Promise<void> {
  let payload: BackupPayload;
  try {
    payload = JSON.parse(json) as BackupPayload;
  } catch (e) {
    throw new Error("Arquivo de backup inválido.");
  }
  if (payload.version !== 1 || !payload.schedule) {
    throw new Error("Arquivo de backup inválido.");
  }
  targets.applySchedule(payload.schedule);
  targets.applyProfile(payload.profile ?? {});
  if (payload.qrCode !== undefined) targets.applyQrCode(payload.qrCode);
  if (payload.campus) targets.applyCampus(payload.campus);
  if (payload.theme) targets.applyTheme(payload.theme);
  targets.applyNotifications({
    ...DEFAULT_RESTORE_NOTIFICATIONS,
    ...(payload.notifications ?? {}),
  });
  if (payload.links !== undefined) targets.applyLinks(payload.links);
  const MAX_BASE64 = 50 * 1024 * 1024 * 1.5; // heuristic limit on base64 length
  const materials = (payload.materials ?? [])
    .map((m) => {
      if (!m?.material?.id) return null;
      if (typeof m.base64 === "string") {
        const b64 = m.base64.slice(m.base64.indexOf(",") + 1);
        if (b64.length > MAX_BASE64) return { material: m.material, base64: null };
      }
      return m;
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);
  await targets.applyMaterials(materials);
}

const DEFAULT_RESTORE_NOTIFICATIONS = {
  classes: true,
  exams: true,
  ru: true,
} as const;

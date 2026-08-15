import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { Capacitor } from '@capacitor/core'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { fileStorage, blobUrl, revokeBlobUrl } from '@/lib/fileStorage'
import type { Material } from '@/types'

interface MaterialsContextValue {
  materials: Material[]
  addMaterial: (subjectId: string, file: File) => Promise<void>
  removeMaterial: (id: string) => Promise<void>
  openMaterial: (id: string) => Promise<void>
  shareMaterial: (id: string) => Promise<void>
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null)

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/** Metadados dos materiais em localStorage; binário dos arquivos em disco
 *  (Capacitor) ou IndexedDB (web). A lista alimenta a seção de materiais
 *  de cada disciplina. */
export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useLocalStorage<Material[]>('materials', [])

  const addMaterial = useCallback(
    async (subjectId: string, file: File) => {
      const id = uid('mat')
      await fileStorage.save(id, file)
      const dot = file.name.lastIndexOf('.')
      const extension = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : ''
      setMaterials((prev) => [
        ...prev,
        {
          id,
          subjectId,
          name: file.name,
          extension,
          size: file.size,
          createdAt: Date.now(),
        },
      ])
    },
    [setMaterials],
  )

  const removeMaterial = useCallback(
    async (id: string) => {
      setMaterials((prev) => prev.filter((m) => m.id !== id))
      await fileStorage.remove(id)
    },
    [setMaterials],
  )

  const openMaterial = useCallback(async (id: string) => {
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      const { FileOpener } = await import('@capacitor-community/file-opener')
      const { uri } = await Filesystem.getUri({
        path: `materials/${id}`,
        directory: Directory.Data,
      })
      await FileOpener.open({ filePath: uri })
      return
    }
    const blob = await fileStorage.load(id)
    const url = blobUrl(blob)
    window.open(url, '_blank')
    setTimeout(() => revokeBlobUrl(url), 60_000)
  }, [])

  const shareMaterial = useCallback(async (id: string) => {
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      const { Share } = await import('@capacitor/share')
      const { uri } = await Filesystem.getUri({
        path: `materials/${id}`,
        directory: Directory.Data,
      })
      await Share.share({ url: uri })
      return
    }
    const blob = await fileStorage.load(id)
    const url = blobUrl(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = ''
    anchor.click()
    setTimeout(() => revokeBlobUrl(url), 60_000)
  }, [])

  const value = useMemo(
    () => ({ materials, addMaterial, removeMaterial, openMaterial, shareMaterial }),
    [materials, addMaterial, removeMaterial, openMaterial, shareMaterial],
  )

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>
}

export function useMaterials(): MaterialsContextValue {
  const ctx = useContext(MaterialsContext)
  if (!ctx) throw new Error('useMaterials deve ser usado dentro de MaterialsProvider')
  return ctx
}
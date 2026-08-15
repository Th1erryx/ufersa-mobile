import { Capacitor } from '@capacitor/core'

/** Camada de armazenamento de arquivos dos materiais.
 *  No APK (Capacitor) grava em disco real via Filesystem; no navegador/PWA
 *  usa IndexedDB. Módulos nativos são importados dinamicamente para não
 *  inflar o bundle web. */

interface FileStore {
  save(id: string, file: File): Promise<void>
  load(id: string): Promise<Blob>
  remove(id: string): Promise<void>
}

const SUBDIR = 'materials'

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const base64ToBlob = (base64: string, type: string): Blob => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

const nativeStore: FileStore = {
  async save(id, file) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    const base64 = await fileToBase64(file)
    await Filesystem.writeFile({
      path: `${SUBDIR}/${id}`,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    })
  },
  async load(id) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    const { data } = await Filesystem.readFile({
      path: `${SUBDIR}/${id}`,
      directory: Directory.Data,
    })
    return base64ToBlob(data as string, 'application/octet-stream')
  },
  async remove(id) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    try {
      await Filesystem.deleteFile({ path: `${SUBDIR}/${id}`, directory: Directory.Data })
    } catch {
      /* arquivo inexistente */
    }
  },
}

const OLD_DB = 'ufersa-pocket-files'
const DB_NAME = 'ufersa-mobile-files'

const openIdb = (name = DB_NAME) =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(SUBDIR)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

/** Copia os arquivos do banco antigo (ufersa-pocket-files) para o atual. */
function migrateLegacyFiles(): void {
  const openOld = indexedDB.open(OLD_DB, 1)
  openOld.onsuccess = () => {
    const oldDb = openOld.result
    if (!oldDb.objectStoreNames.contains(SUBDIR)) {
      oldDb.close()
      return
    }
    const tx = oldDb.transaction(SUBDIR, 'readonly')
    const store = tx.objectStore(SUBDIR)
    const keysReq = store.getAllKeys()
    keysReq.onsuccess = () => {
      const keys = (keysReq.result as IDBValidKey[]).slice()
      if (keys.length === 0) {
        oldDb.close()
        return
      }
      const entries: [IDBValidKey, unknown][] = []
      let toRead = keys.length
      const writeToNew = () => {
        oldDb.close()
        openIdb().then((newDb) => {
          let pending = entries.length
          const done = () => {
            if (--pending === 0) {
              newDb.close()
              try {
                indexedDB.deleteDatabase(OLD_DB)
              } catch {
                /* ignorado */
              }
            }
          }
          for (const [key, value] of entries) {
            const putTx = newDb.transaction(SUBDIR, 'readwrite')
            putTx.objectStore(SUBDIR).put(value, key)
            putTx.oncomplete = () => done()
            putTx.onerror = () => done()
          }
        })
      }
      for (const key of keys) {
        const getReq = store.get(key)
        getReq.onsuccess = () => {
          if (getReq.result !== undefined) entries.push([key, getReq.result])
          if (--toRead === 0) {
            if (entries.length === 0) {
              oldDb.close()
            } else {
              writeToNew()
            }
          }
        }
        getReq.onerror = () => {
          if (--toRead === 0) oldDb.close()
        }
      }
    }
    keysReq.onerror = () => oldDb.close()
  }
  openOld.onerror = () => {
    /* banco antigo inexistente */
  }
}

migrateLegacyFiles()

const idbStore: FileStore = {
  async save(id, file) {
    const db = await openIdb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SUBDIR, 'readwrite')
      tx.objectStore(SUBDIR).put(file, id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
  async load(id) {
    const db = await openIdb()
    return new Promise<Blob>((resolve, reject) => {
      const tx = db.transaction(SUBDIR, 'readonly')
      const request = tx.objectStore(SUBDIR).get(id)
      request.onsuccess = () => resolve(request.result as Blob)
      request.onerror = () => reject(request.error)
    })
  },
  async remove(id) {
    const db = await openIdb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SUBDIR, 'readwrite')
      tx.objectStore(SUBDIR).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
}

const store: FileStore = Capacitor.isNativePlatform() ? nativeStore : idbStore

export const fileStorage = store

/** Abre um Blob para preview em navegadores (object URL). */
export function blobUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url)
}
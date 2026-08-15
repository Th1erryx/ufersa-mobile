/** Wrappers seguros em volta do localStorage (falham silenciosamente). */

const OLD_PREFIX = 'ufersa-pocket:'
const PREFIX = 'ufersa-mobile:'

let migrated = false

/** Migra chaves do prefixo antigo (ufersa-pocket:) para o atual. */
function migrateLegacyKeys(): void {
  if (migrated) return
  migrated = true
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(OLD_PREFIX)) keys.push(key)
    }
    for (const key of keys) {
      const next = PREFIX + key.slice(OLD_PREFIX.length)
      if (localStorage.getItem(next) === null) {
        localStorage.setItem(next, localStorage.getItem(key) ?? '')
      }
      localStorage.removeItem(key)
    }
  } catch {
    /* migração indisponível */
  }
}

migrateLegacyKeys()

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* armazenamento indisponível */
  }
}

export function loadString(key: string, fallback: string): string {
  try {
    return localStorage.getItem(PREFIX + key) ?? fallback
  } catch {
    return fallback
  }
}

export function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value)
  } catch {
    /* armazenamento indisponível */
  }
}
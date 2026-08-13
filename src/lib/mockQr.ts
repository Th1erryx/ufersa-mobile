/** Gera um QR Code fake determinístico (para fins de demonstração).
 *  Estrutura inspirada em um QR real: padrões de localização, timing
 *  e módulos de dados pseudo-aleatórios, porém sem conteúdo codificado. */

export const QR_SIZE = 25

/** PRNG determinístico a partir de uma string. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function isFinderZone(x: number, y: number): boolean {
  return (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8)
}

function buildFinder(x0: number, y0: number, grid: number[][]): void {
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const border = x === 0 || x === 6 || y === 0 || y === 6
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
      grid[y0 + y][x0 + x] = border || core ? 1 : 0
    }
  }
  for (let i = 0; i < 8; i++) {
    if (grid[y0 + 7] !== undefined) grid[y0 + 7][x0 + i] = 0
    if (grid[y0 + i] !== undefined) grid[y0 + i][x0 + 7] = 0
  }
}

/** Matriz 0/1 de um QR fake. */
export function buildMockMatrix(seed = 'UFERSA-POCKET'): number[][] {
  const grid = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(0))
  const rand = seededRandom(seed)

  buildFinder(0, 0, grid)
  buildFinder(QR_SIZE - 7, 0, grid)
  buildFinder(0, QR_SIZE - 7, grid)

  for (let y = 8; y < QR_SIZE - 8; y++) grid[y][6] = y % 2 === 0 ? 1 : 0
  for (let x = 8; x < QR_SIZE - 8; x++) grid[6][x] = x % 2 === 0 ? 1 : 0

  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (isFinderZone(x, y) || grid[y][x] !== 0) continue
      grid[y][x] = rand() > 0.52 ? 1 : 0
    }
  }

  return grid
}

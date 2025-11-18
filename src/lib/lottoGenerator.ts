// src/lib/lottoGenerator.ts
/**
 * Funzioni per generare numeri del Lotto.
 * - generateUniqueNumbers: genera `count` numeri unici nell'intervallo min..max
 * - generateForWheels: dato un array di nomi di ruote, restituisce una mappa nome -> numbers[]
 */

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateUniqueNumbers(count = 6, min = 1, max = 90): number[] {
  if (count > (max - min + 1)) {
    throw new Error("count maggiore del range disponibile");
  }
  const s = new Set<number>();
  while (s.size < count) {
    s.add(randInt(min, max));
  }
  return Array.from(s).sort((a, b) => a - b);
}

/**
 * generateForWheels
 * riceve: wheels: string[], count: number
 * ritorna: Record<wheelName, number[]>
 */
export function generateForWheels(wheels: string[], count = 6): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const w of wheels) {
    out[w] = generateUniqueNumbers(count, 1, 90);
  }
  return out;
}

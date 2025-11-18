// src/lib/scratchGenerator.ts
import { scratchByPrice } from "../data/scratchcards";

/** utilità: numero intero random inclusivo */
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Estrae n elementi RANDOM con RIPETIZIONE da un array (se arr vuoto -> []) */
export function sampleWithReplacement<T>(arr: T[], n: number): T[] {
  const out: T[] = [];
  if (!arr || arr.length === 0 || n <= 0) return out;
  for (let i = 0; i < n; i++) {
    const idx = randInt(0, arr.length - 1);
    out.push(arr[idx]);
  }
  return out;
}

/** Estrae n elementi RANDOM senza ripetizione (mantengo la vecchia funzione se serve altrove) */
export function sampleWithoutReplacement<T>(arr: T[], n: number): T[] {
  const pool = arr.slice();
  const out: T[] = [];
  if (!arr || arr.length === 0 || n <= 0) return out;
  n = Math.min(n, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = randInt(0, pool.length - 1);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

/**
 * generateScratchSelection - versione aggiornata che permette ripetizioni.
 *
 * - pricesSelected: array di prezzi (es ["2","3"]) ; se vuoto => pesca da tutte le categorie
 * - totalRequested: numero totale di gratta e vinci da estrarre
 *
 * Comportamento:
 * - se pricesSelected è vuoto:
 *     crea un pool unificato (con info price + name) e pesca totalRequested volte
 *     **con ripetizione**, poi raggruppa i risultati per prezzo.
 * - se ci sono categorie selezionate:
 *     per ogni singolo pick (da 1 a totalRequested) scegli random una categoria
 *     fra le selezionate (uniforme), poi estrai 1 elemento **con ripetizione**
 *     dalla lista della categoria scelta. Alla fine raggruppa per categoria.
 *
 * Ritorna: { ok: boolean, message?: string, result?: Record<string, string[]> }
 */
export function generateScratchSelection(
  pricesSelected: string[],
  totalRequested: number
): { ok: boolean; message?: string; result?: Record<string, string[]> } {
  if (totalRequested <= 0) return { ok: false, message: "Richiesto almeno 1 gratta e vinci" };

  // ---- CASO: nessuna categoria selezionata -> un pool unico ----
  if (!pricesSelected || pricesSelected.length === 0) {
    const unified: { price: string; name: string }[] = [];
    for (const price of Object.keys(scratchByPrice)) {
      for (const item of scratchByPrice[price]) {
        unified.push({ price, name: item });
      }
    }
    if (unified.length === 0) return { ok: false, message: "Nessun gratta e vinci disponibile" };

    // Pesca totalRequested elementi CON ripetizione dal pool unificato
    const picks = sampleWithReplacement(unified, totalRequested);

    // Raggruppa per prezzo
    const out: Record<string, string[]> = {};
    for (const p of picks) {
      out[p.price] = out[p.price] ?? [];
      out[p.price].push(p.name);
    }
    return { ok: true, result: out };
  }

  // ---- CASO: ci sono categorie selezionate ----
  // pulisco la lista di categorie reali (escludo quelle non presenti)
  const categories = pricesSelected.filter(p => Array.isArray(scratchByPrice[p]) && scratchByPrice[p].length > 0);
  if (categories.length === 0) return { ok: false, message: "Le categorie scelte non contengono gratta e vinci" };

  // Inizializzo risultato vuoto
  const result: Record<string, string[]> = {};
  for (const c of categories) result[c] = [];

  // Per ogni singolo pick scegli una categoria a caso (tra quelle selezionate)
  for (let i = 0; i < totalRequested; i++) {
    const pickCat = categories[randInt(0, categories.length - 1)];
    const pool = scratchByPrice[pickCat] ?? [];
    // se la pool è vuota (non dovrebbe) skippo
    if (pool.length === 0) continue;
    // estrai 1 con ripetizione
    const chosen = pool[randInt(0, pool.length - 1)];
    result[pickCat].push(chosen);
  }

  return { ok: true, result };
}

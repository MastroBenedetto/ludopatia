import React, {useCallback, useState} from "react";
import "./superenalotto.css"

/**
 * SuperenalottoPage aggiornato:
 * - scegli quanti numeri generare (1..8)
 * - mains = min(count, 6)
 * - specials = max(0, count - 6)  -> 0,1,2  (Jolly, SuperStar)
 * - tutti i numeri sono univoci (nessun doppione)
 * - range numeri 1..90
 */

type GenResult = {
  mains: number[];         // up to 6 numeri principali (ordinati)
  special1?: number;       // Jolly (se presente)
  special2?: number;       // SuperStar (se presente)
};

const MIN_NUM = 1;
const MAX_NUM = 90;

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export default function SuperenalottoPage() {
  // default 6, ora minimo 1
  const [count, setCount] = useState<number>(6);
  const [result, setResult] = useState<GenResult | null>(null);

  const generate = useCallback(() => {
    // normalize requested count and cap in [1,8]
    let requested = Math.floor(count);
    if (isNaN(requested)) requested = 1;
    requested = Math.max(1, Math.min(8, requested));

    // Defensive: non possibile chiedere > 90 numeri distinti
    if (requested > MAX_NUM) requested = MAX_NUM;

    const mainCount = Math.min(requested, 6);
    const specialCount = Math.max(0, requested - 6); // 0..2

    // pool 1..90
    const pool: number[] = Array.from({ length: MAX_NUM }, (_, i) => i + 1);

    // helper pick unique n numeri (rimuove dall'array mutabile)
    const pickUnique = (arr: number[], n: number): number[] => {
      const out: number[] = [];
      for (let i = 0; i < n; i++) {
        if (arr.length === 0) break;
        const idx = randInt(0, arr.length - 1);
        out.push(arr[idx]);
        arr.splice(idx, 1);
      }
      return out;
    };

    const working = pool.slice();

    // estraggo i main (unici) e li ordino
    const mains = pickUnique(working, mainCount).sort((a, b) => a - b);

    // poi estraggo gli speciali dalla remaining pool (nessun doppione)
    let special1: number | undefined = undefined;
    let special2: number | undefined = undefined;
    if (specialCount >= 1) {
      const specials = pickUnique(working, specialCount);
      if (specials.length >= 1) special1 = specials[0];
      if (specials.length >= 2) special2 = specials[1];
    }

    setResult({ mains, special1, special2 });
  }, [count]);

  const handleClear = () => setResult(null);

  return (
    <main className="se">
      <section className="se__wrap container">
        <h1 className="se__title">Generatore Superenalotto (esteso)</h1>

        <div className="se__controls card">
          <label className="se__label">
            Quanti numeri vuoi generare?
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="se__select"
            >
              {/* 1..8 */}
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7 (6 + Jolly)</option>
              <option value={8}>8 (6 + Jolly + SuperStar)</option>
            </select>
          </label>

          <div className="se__actions">
            <button className="se__btn se__btn--ghost" onClick={generate}>Genera</button>
            <button className="se__btn se__btn--ghost" onClick={handleClear}>Pulisci</button>
          </div>
        </div>

        {/* Risultati */}
        <div className="se__resultArea">
          <div className="se__board" role="list" aria-label="Numeri generati">
            {Array.from({ length: 6 }).map((_, i) => {
              const val = result?.mains[i];
              return (
                <div key={i} className={`se__num${val === undefined ? " is-empty" : ""}`} aria-live="polite">
                  {val === undefined ? "--" : String(val)}
                </div>
              );
            })}
          </div>

          <div className="se__specials">
            {result?.special1 !== undefined && (
              <div className="se__specialCard">
                <div className="se__specialLabel">Jolly</div>
                <div className="se__specialNum">{result.special1}</div>
              </div>
            )}

            {result?.special2 !== undefined && (
              <div className="se__specialCard">
                <div className="se__specialLabel">SuperStar</div>
                <div className="se__specialNum">{result.special2}</div>
              </div>
            )}
          </div>
        </div>

        <p className="se__note">
          I numeri sono estratti casualmente da 1 a 90, senza duplicati tra numeri principali e speciali.
        </p>
      </section>
    </main>
  );
}


/**
 * 
 * useState — come funziona davvero

Cosa fa: ti dà uno stato dentro il componente + la funzione per aggiornarlo.
Firma semplificata:

const [value, setValue] = useState<T>(initialValue)


Nel tuo caso:

const [numbers, setNumbers] = useState<number[] | null>(null)


All’inizio numbers è null → mostri “--”.

Quando clicchi, fai setNumbers([...]) → React ri-renderizza il componente e al posto dei “--” appaiono i numeri.

Cose importanti:

L’aggiornamento non è immediato: React può raggruppare più setState (batching). Dopo setNumbers(...) il valore aggiornato lo vedi al render successivo.

Se devi aggiornare in base al valore precedente, usa la forma funzionale:

setNumbers(prev => {
  // calcola il nuovo valore usando prev
  return nuovoValore
})


Mai mutare lo stato “in place” (es. numbers.push(...)). Crea nuovi array/oggetti.

Ogni setNumbers provoca un nuovo render (se il valore cambia).

3) useCallback — quando serve e a cosa ti è utile

Cosa fa: “memorizza” la riferimento di una funzione tra i render, finché le dipendenze non cambiano.
Firma:

const memoFn = useCallback(fn, [deps...])


Nel tuo file:

const generateNumbers = useCallback((): number[] => {
  const s = new Set<number>()
  while (s.size < 6) s.add(randInt(1, 90))
  return Array.from(s).sort((a,b) => a - b)
}, [])


Dipendenze [] → la funzione ha sempre lo stesso riferimento.

Utile se passi questa funzione come prop a un figlio memoizzato (React.memo), oppure dentro un useEffect/useMemo che dipende dalla funzione.

Se la usi solo localmente (come nel tuo esempio) e non la passi a figli, useCallback non è strettamente necessario (puoi scrivere una function normale). Non sbagli ad usarlo, ma non porta benefici concreti qui.

Attenzione agli “stale closures”:
Se dentro la funzione usi stato/props, mettili nelle dipendenze. Esempio:

const [count, setCount] = useState(0)

const inc = useCallback(() => {
  setCount(c => c + 1) // forma funzionale = niente dipendenze obbligatorie
}, [])


Oppure, se ti serve leggere count “così com’è”:

const inc = useCallback(() => {
  setCount(count + 1)
}, [count]) // dipende da count


Regola pratica:

Usa useCallback quando serve davvero a evitare re-render/ri-calcoli in figli memoizzati o in effetti che dipendono dalla funzione.

Altrimenti, funzione normale.
 * 
 */
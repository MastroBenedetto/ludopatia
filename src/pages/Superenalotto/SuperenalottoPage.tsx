import  { useCallback, useEffect, useRef, useState } from "react";
import "./superenalotto.css";



const MAX_NUM = 90;
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export default function SuperenalottoPage() {
  const [count, setCount] = useState<number>(6);
  const [displayedMains, setDisplayedMains] = useState<(number | null)[]>(
    () => Array(6).fill(null)
  );
  const [displayedSpecials, setDisplayedSpecials] = useState<(number | null)[]>(
    () => []
  );
  const [loading, setLoading] = useState(false);

  // ref per tenere traccia di tutti i timeout così li possiamo pulire
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  // utility: pick n unique numbers from pool (mutates pool)
  const pickUniqueFromPool = (pool: number[], n: number) => {
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      if (pool.length === 0) break;
      const idx = randInt(0, pool.length - 1);
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return out;
  };

  const handleGenerate = useCallback(() => {
    // normalizza richieste 1..8
    let requested = Math.floor(count || 1);
    requested = Math.max(1, Math.min(8, requested));
    if (requested > MAX_NUM) requested = MAX_NUM;

    const mainCount = Math.min(requested, 6);
    const specialCount = Math.max(0, requested - 6); // 0..2

    // preparazione pool
    const pool = Array.from({ length: MAX_NUM }, (_, i) => i + 1);

    // calcolo numeri finali subito (ma li mostro uno ad uno)
    const mains = pickUniqueFromPool(pool, mainCount).sort((a, b) => a - b);
    const specials = pickUniqueFromPool(pool, specialCount);

    // RESET UI
    setDisplayedMains(Array(6).fill(null));
    setDisplayedSpecials(Array(specialCount).fill(null));
    setLoading(true);

    // pulisci timeouts precedenti
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];

    // reveal one-by-one: delay base (ms)
    const baseDelay = 350; // tempo tra i reveal dei numeri principali
    const initialDelay = 220; // piccolo offset iniziale

    // reveal mains one by one in their positions: we reveal only the first mainCount slots
    for (let i = 0; i < mainCount; i++) {
      const delay = initialDelay + i * baseDelay;
      const t = window.setTimeout(() => {
        setDisplayedMains(prev => {
          const copy = prev.slice();
          copy[i] = mains[i];
          return copy;
        });
      }, delay);
      timeoutsRef.current.push(t);
    }

    // reveal specials after mains done
    if (specialCount > 0) {
      const specialsStart = initialDelay + mainCount * baseDelay + 260; // small gap after mains
      for (let j = 0; j < specialCount; j++) {
        const delay = specialsStart + j * 400;
        const t = window.setTimeout(() => {
          setDisplayedSpecials(prev => {
            const copy = prev.slice();
            copy[j] = specials[j];
            return copy;
          });
        }, delay);
        timeoutsRef.current.push(t);
      }
      // end loading after last special
      const endDelay = specialsStart + (specialCount - 1) * 400 + 500;
      const tend = window.setTimeout(() => {
        setLoading(false);
      }, endDelay);
      timeoutsRef.current.push(tend);
    } else {
      // no specials: end loading after last main reveal
      const endDelay = initialDelay + (mainCount - 1) * baseDelay + 500;
      const tend = window.setTimeout(() => {
        setLoading(false);
      }, endDelay);
      timeoutsRef.current.push(tend);
    }
  }, [count]);

  const handleClear = () => {
    // pulisci timeout e reset UI
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    setDisplayedMains(Array(6).fill(null));
    setDisplayedSpecials([]);
    setLoading(false);
  };

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
            <button className="se__btn se__btn--ghost" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generando…" : "Genera"}
            </button>
            <button className="se__btn se__btn--ghost" onClick={handleClear} disabled={loading === true && displayedMains.every(v => v === null) === false}>
              Pulisci
            </button>
          </div>
        </div>

        {/* Risultati */}
        <div className="se__resultArea">
          <div className="se__board" role="list" aria-label="Numeri generati">
            {displayedMains.map((val, i) => (
              <div
                key={i}
                className={`se__num ${val === null ? "is-empty" : "is-visible"}`}
                aria-live="polite"
              >
                {val === null ? "--" : String(val)}
              </div>
            ))}
          </div>

          <div className="se__specials" aria-live="polite">
            {displayedSpecials.map((val, i) => (
              <div className="se__specialCard" key={i}>
                <div className="se__specialLabel">{i === 0 ? "Jolly" : "SuperStar"}</div>
                <div className={`se__specialNum ${val === null ? "" : "is-visible"}`}>{val === null ? "--" : val}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="se__note">
          I numeri sono estratti casualmente da 1 a 90, senza duplicati tra principali e speciali.
        </p>
      </section>
    </main>
  );
}

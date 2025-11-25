// src/pages/Superenalotto/SuperenalottoPage.tsx
import  { useCallback, useEffect, useRef, useState } from "react";
import "./superenalotto.css";


// API response shape
type ApiResponse = { numeri: string[] } | { error?: string };

const MAX_NUM = 90;
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export default function SuperenalottoPage() {
  const [count, setCount] = useState<number>(6);

  // displayed numbers reveal state (as before)
  const [displayedMains, setDisplayedMains] = useState<(number | null)[]>(
    () => Array(6).fill(null)
  );
  const [displayedSpecials, setDisplayedSpecials] = useState<(number | null)[]>(
    () => []
  );
  const [loading, setLoading] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  // nuova parte: numeri estratti oggi da API
  const [drawLoading, setDrawLoading] = useState<boolean>(true);
  const [todayDraw, setTodayDraw] = useState<number[] | null>(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  // fetch dei numeri estratti oggi da endpoint vercel python
  useEffect(() => {
    let canceled = false;
    setDrawLoading(true);
    setTodayDraw(null);

    fetch("/api/superenalotto")
      .then(async (res) => {
        if (!res.ok) {
          // non mostrare errori all'utente: silenziosamente skip
          throw new Error(`HTTP ${res.status}`);
        }
        // proviamo a parsare JSON; se fallisce viene catturato e silenziato
        const text = await res.text();
        try {
          const json = JSON.parse(text) as ApiResponse;
          return json;
        } catch (e) {
          // risposta non JSON (es. HTML) -> non vogliamo mostrare errori in UI
          console.warn("API /api/superenalotto non ha restituito JSON valido:", e);
          throw new Error("Invalid JSON");
        }
      })
      .then((json) => {
        if (canceled) return;
        if ((json as any).numeri && Array.isArray((json as any).numeri)) {
          // normalizza in numeri
          const nums = (json as ApiResponse & { numeri: string[] }).numeri
            .map((s) => Number(String(s).trim()))
            .filter((n) => !Number.isNaN(n));
          if (nums.length > 0) setTodayDraw(nums);
        }
      })
      .catch((err) => {
        // silenzioso: non mostriamo messaggi all'utente.
        // log in console per debugging developer, ma non impostiamo stato errore visibile.
        console.debug("fetch /api/superenalotto failed (silenced):", err?.message || err);
      })
      .finally(() => {
        if (!canceled) setDrawLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, []); // esegui solo al mount

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
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    // reveal one-by-one: delay base (ms)
    const baseDelay = 350; // tempo tra i reveal dei numeri principali
    const initialDelay = 220; // piccolo offset iniziale

    // reveal mains one by one in their positions
    for (let i = 0; i < mainCount; i++) {
      const delay = initialDelay + i * baseDelay;
      const t = window.setTimeout(() => {
        setDisplayedMains((prev) => {
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
          setDisplayedSpecials((prev) => {
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
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    setDisplayedMains(Array(6).fill(null));
    setDisplayedSpecials([]);
    setLoading(false);
  };

  // helper: render today's draw nicely
  const renderTodayDraw = () => {
    // Show the draw only if we have data (todayDraw non-null and array length>0)
    if (!todayDraw || !Array.isArray(todayDraw) || todayDraw.length === 0) return null;

    // if there are >=6 numbers, mostro primi 6 come principali e gli eventuali extra come speciali
    const mains = todayDraw.slice(0, 6);
    const extras = todayDraw.slice(6);

    return (
      <div className="se__drawBlock">
        <div className="se__drawNumbers">
          {mains.map((n, i) => (
            <div key={`dmain-${i}`} className="se__drawNum">{n}</div>
          ))}
        </div>

        {extras.length > 0 && (
          <div className="se__drawExtras">
            {extras.map((n, i) => (
              <div key={`dextra-${i}`} className="se__drawExtraCard">
                <div className="se__drawExtraLabel">{i === 0 ? "Jolly" : "SuperStar"}</div>
                <div className="se__drawNum se__drawNum--special">{n}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
            <button className="se__btn" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generando…" : "Genera"}
            </button>
            <button className="se__btn se__btn--ghost" onClick={handleClear}>Pulisci</button>
          </div>
        </div>

        {/* Risultati (reveal sequenziale) */}
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

          <p className="se__note">I numeri sono estratti casualmente da 1 a 90, senza duplicati tra principali e speciali.</p>

          {/* Nuova sezione: estrazione odierna */}
          { /* Mostriamo la sezione solo se abbiamo realmente dei numeri (todayDraw non null e non vuoto) */ }
          {todayDraw && todayDraw.length > 0 && (
            <section className="se__todayDraw">
              <h3 className="se__drawTitle">Numeri estratti oggi</h3>
              {renderTodayDraw()}
              <div style={{ marginTop: 8, color: "var(--color-muted)", fontSize: 13 }}>
                Dati forniti da <code>/api/superenalotto</code> (endpoint serverless).
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
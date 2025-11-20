// src/pages/Lotto/LottoPage.tsx
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import "@/pages/Lotto/lotto.css"; // assicurati il path corrisponda al tuo alias / struttura

import { wheelsList } from "../../data/wheels";
import { generateForWheels } from "../../lib/lottoGenerator";



/**
 * LottoPage con reveal sequenziale:
 * - genera risultati per le ruote scelte usando generateForWheels
 * - mostra i numeri per ruota uno ad uno con delay
 * - gestisce cleanup dei timeouts
 */

export default function LottoPage() {
  // modalità: "all" = tutte le ruote, "custom" = selezione manuale
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(wheelsList.map((w) => [w, false]))
  );

  // numero di numeri per ruota (configurabile)
  const [count, setCount] = useState<number>(6);

  // risultati finali (generati subito), ma non mostrati tutti subito
  const [finalResults, setFinalResults] = useState<Record<string, number[]> | null>(null);

  // risultati parziali mostrati: per ogni ruota array di (number|null) lunghezza = count
  const [displayedResults, setDisplayedResults] = useState<Record<string, (number | null)[]> | null>(null);

  const [loading, setLoading] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    // cleanup all timeouts on unmount
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  // lista delle ruote scelte (memo)
  const chosenWheels = useMemo(() => {
    if (mode === "all") return wheelsList.slice();
    return wheelsList.filter((w) => selected[w]);
  }, [mode, selected]);

  const toggleWheel = (wheel: string) => {
    setSelected((prev) => ({ ...prev, [wheel]: !prev[wheel] }));
  };

  const selectAllCustom = (on: boolean) => {
    const obj = Object.fromEntries(wheelsList.map((w) => [w, on]));
    setSelected(obj);
  };

  const handleClear = useCallback(() => {
    // clear timeouts
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    setLoading(false);
    setFinalResults(null);
    setDisplayedResults(null);
  }, []);

  const handleGenerate = useCallback(() => {
    if (chosenWheels.length === 0) {
      alert("Se scegli 'Seleziona ruote' devi selezionarne almeno una.");
      return;
    }

    setLoading(true);
    setFinalResults(null);
    setDisplayedResults(null);

    // pulisco eventuali timeouts precedenti
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    // genero TUTTI i risultati (logica pura)
    const out = generateForWheels(chosenWheels, count);
    setFinalResults(out);

    // inizializzo displayedResults con null placeholder per ogni ruota
    const initialDisplayed: Record<string, (number | null)[]> = {};
    for (const w of Object.keys(out)) {
      initialDisplayed[w] = Array(count).fill(null);
    }
    setDisplayedResults(initialDisplayed);

    // reveal sequenziale:
    // per ogni ruota (in ordine di chosenWheels), reveal dei numeri uno ad uno
    const wheelBaseDelay = 350; // ms between numbers within a wheel
    const wheelGap = 220; // ms gap between finishing a wheel and starting next
    const initialDelay = 200; // small delay before first reveal

    let accumulated = initialDelay;

    for (let wi = 0; wi < chosenWheels.length; wi++) {
      const wheelName = chosenWheels[wi];
      const nums = out[wheelName] ?? [];

      for (let ni = 0; ni < nums.length; ni++) {
        const revealDelay = accumulated + ni * wheelBaseDelay;

        // schedule reveal of number ni for wheel wheelName
        const tid = window.setTimeout(() => {
          setDisplayedResults((prev) => {
            if (!prev) return prev;
            const copy: Record<string, (number | null)[]> = { ...prev };
            const arr = copy[wheelName] ? copy[wheelName].slice() : Array(count).fill(null);
            arr[ni] = nums[ni];
            copy[wheelName] = arr;
            return copy;
          });
        }, revealDelay);

        timeoutsRef.current.push(tid);
      }

      // after finishing numbers for this wheel, add gap before next wheel
      accumulated += nums.length * wheelBaseDelay + wheelGap;
    }

    // end loading after all reveals scheduled + small buffer
    const endTid = window.setTimeout(() => {
      setLoading(false);
    }, accumulated + 300);
    timeoutsRef.current.push(endTid);
  }, [chosenWheels, count]);

  // helper per conteggio totale mostrato
  const totalShown = displayedResults
    ? Object.values(displayedResults).reduce((s, arr) => s + arr.filter(Boolean).length, 0)
    : 0;

  return (
    <main className="lotto">
      <section className="lotto__wrap container">
        <h1>Generatore Lotto per ruote</h1>

        <div className="lotto__form card">
          <div className="lotto__row">
            <label className="lotto__radio">
              <input
                type="radio"
                name="mode"
                value="all"
                checked={mode === "all"}
                onChange={() => setMode("all")}
                disabled={loading}
              />
              Tutte le ruote
            </label>

            <label className="lotto__radio">
              <input
                type="radio"
                name="mode"
                value="custom"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
                disabled={loading}
              />
              Seleziona ruote
            </label>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 14, color: "var(--color-muted)" }}>Numeri per ruota</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={loading}>
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
              </select>
            </div>
          </div>

          {mode === "custom" && (
            <>
              <div className="lotto__row" style={{ justifyContent: "space-between" }}>
                <div style={{ color: "var(--color-muted)" }}>Seleziona le ruote desiderate</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="lotto__btn" onClick={() => selectAllCustom(true)} disabled={loading}>
                    Seleziona tutte
                  </button>
                  <button type="button" className="lotto__btn" onClick={() => selectAllCustom(false)} disabled={loading}>
                    Deseleziona tutte
                  </button>
                </div>
              </div>

              <div className="lotto__checkboxes">
                {wheelsList.map((w) => (
                  <label key={w} className="lotto__wheel">
                    <input
                      type="checkbox"
                      checked={!!selected[w]}
                      onChange={() => toggleWheel(w)}
                      disabled={loading}
                    />
                    <span>{w}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="lotto__actions">
            <button className="lotto__btn" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generando…" : "Genera"}
            </button>
            <button className="lotto__btn" onClick={handleClear} disabled={loading && totalShown === 0}>
              Pulisci
            </button>
          </div>
        </div>

        {/* Risultati */}
        {displayedResults && (
          <div style={{ width: "100%", maxWidth: 1000 }}>
            <div style={{ color: "var(--color-muted)", textAlign: "right", marginBottom: 8 }}>
              Totale numeri rivelati: {totalShown}
            </div>

            <div className="lotto__resultGrid">
              {Object.entries(displayedResults).map(([wheel, arr]) => (
                <div className="lotto__wheelResult" key={wheel}>
                  <div className="lotto__wheelName">{wheel}</div>
                  <div className="lotto__numbers" aria-live="polite">
                    {arr.map((n, i) => (
                      <div key={i} className={`lotto__num ${n === null ? "is-empty" : "is-visible"}`}>
                        {n === null ? "--" : n}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
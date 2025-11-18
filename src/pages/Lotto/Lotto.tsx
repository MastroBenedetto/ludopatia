// src/pages/Lotto/LottoPage.tsx
import React, { useMemo, useState } from "react";
import "@/pages/Lotto/lotto.css"; // assicurati il path corrisponda al tuo alias / struttura

import { wheelsList } from "../../data/wheels";
import { generateForWheels } from "../../lib/lottoGenerator";

/**
 * LottoPage
 * - radio: "Tutte le ruote" o "Seleziona ruote"
 * - se "Seleziona ruote": checkbox per ogni ruota
 * - pulsante "Genera" -> usa generateForWheels() per ottenere risultati
 * - mostra lista risultati città -> 6 numeri
 */

export default function LottoPage() {
  // modalità: "all" = tutte le ruote, "custom" = selezione manuale
  const [mode, setMode] = useState<"all" | "custom">("all");
  // ruote selezionate in modalità custom (set di nomi)
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(wheelsList.map((w) => [w, false]))
  );

  // risultati generati: mappa wheel -> numbers
  const [results, setResults] = useState<Record<string, number[]> | null>(null);

  // numero di numeri da generare per ruota (opzionale)
  const [count, setCount] = useState<number>(6);

  // Lista delle ruote scelte (memoizzata)
  const chosenWheels = useMemo(() => {
    if (mode === "all") return wheelsList.slice(); // copia
    // custom -> filtra quelle true
    return wheelsList.filter((w) => selected[w]);
  }, [mode, selected]);

  // toggle singola ruota
  const toggleWheel = (wheel: string) => {
    setSelected((prev) => ({ ...prev, [wheel]: !prev[wheel] }));
  };

  // seleziona o deseleziona tutte (solo in custom)
  const selectAllCustom = (on: boolean) => {
    const obj = Object.fromEntries(wheelsList.map((w) => [w, on]));
    setSelected(obj);
  };

  // genera risultati usando la funzione esterna
  const handleGenerate = () => {
    if (chosenWheels.length === 0) {
      alert("Se scegli 'Seleziona ruote' devi selezionarne almeno una.");
      return;
    }
    const out = generateForWheels(chosenWheels, count);
    setResults(out);
    // scroll to results (opzionale)
    setTimeout(() => {
      const el = document.querySelector(".lotto__resultGrid");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  // reset risultati
  const handleClear = () => setResults(null);

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
              />
              Seleziona ruote
            </label>

            {/* numero di numeri per ruota (sempre 6 per il Lotto ma lo lasciamo configurabile) */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ fontSize: 14, color: "var(--color-muted)" }}>Numeri per ruota</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
              </select>
            </div>
          </div>

          {/* Se siamo in modalità custom mostro le checkbox */}
          {mode === "custom" && (
            <>
              <div className="lotto__row" style={{ justifyContent: "space-between" }}>
                <div style={{ color: "var(--color-muted)" }}>Seleziona le ruote desiderate</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="lotto__btn" onClick={() => selectAllCustom(true)}>
                    Seleziona tutte
                  </button>
                  <button type="button" className="lotto__btn" onClick={() => selectAllCustom(false)}>
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
                    />
                    <span>{w}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Azioni */}
          <div className="lotto__actions">
            <button className="lotto__btn" onClick={handleGenerate}>Genera</button>
            <button className="lotto__btn" onClick={handleClear}>Pulisci</button>
          </div>
        </div>

        {/* Risultati (se generati) */}
        {results && (
          <div className="lotto__resultGrid">
            {Object.entries(results).map(([wheel, nums]) => (
              <div className="lotto__wheelResult" key={wheel}>
                <div className="lotto__wheelName">{wheel}</div>
                <div className="lotto__numbers" aria-live="polite">
                  {nums.map((n) => (
                    <div className="lotto__num" key={n}>{n}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

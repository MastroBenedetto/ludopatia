// src/pages/Scratch/ScratchPage.tsx
import  { useState } from "react";
import "@/pages/GrattaEVinci/GrattaEVinci.css";

import { scratchByPrice, scratchPrices } from "../../data/scratchcards";
import { generateScratchSelection } from "../../lib/scratchGenerator";
/**
 * ScratchPage (aggiornata)
 * - visualizza risultati raggruppati per prezzo
 * - per ogni gratta e vinci mostra "count - nome" (es. "5 - Giro Vincente")
 * - non mostra il prezzo accanto al nome
 */

export default function ScratchPage() {
  const [selectedPrices, setSelectedPrices] = useState<Record<string, boolean>>(
    () => Object.fromEntries(scratchPrices.map(p => [p, false]))
  );
  const [total, setTotal] = useState<number>(3);
  const [results, setResults] = useState<Record<string, string[]> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const togglePrice = (price: string) => {
    setSelectedPrices(prev => ({ ...prev, [price]: !prev[price] }));
  };

  const handleGenerate = () => {
    setMessage(null);
    const selectedList = Object.entries(selectedPrices).filter(([, v]) => v).map(([k]) => k);
    const res = generateScratchSelection(selectedList, total);
    if (!res.ok) {
      setMessage(res.message ?? "Errore");
      setResults(null);
      return;
    }
    setResults(res.result ?? null);
  };

  const handleClear = () => {
    setResults(null);
    setMessage(null);
  };

  const anySelected = Object.values(selectedPrices).some(Boolean);

  // Helper: dato results: Record<price, string[]>
  // ritorna Record<price, Array<[nome, count]>> con i nomi aggregati e loro conteggio
  const aggregateResults = (r: Record<string, string[]>): Record<string, Array<[string, number]>> => {
    const out: Record<string, Array<[string, number]>> = {};
    for (const [price, list] of Object.entries(r)) {
      const counts = new Map<string, number>();
      for (const name of list) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
      // converto in array [name, count] e ordino per count desc (opzionale)
      const arr = Array.from(counts.entries()).map(([name, cnt]) => [name, cnt] as [string, number]);
      arr.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      out[price] = arr;
    }
    return out;
  };

  // totale effettivo mostrato (somma occorrenze)
  const totalShown = results ? Object.values(results).reduce((s, arr) => s + arr.length, 0) : 0;

  return (
    <main className="scratch">
      <section className="scratch__wrap container">
        <h1>Gratta e Vinci — generatore</h1>

        <div className="scratch__form card">
          <div className="scratch__row">
            <div style={{ fontWeight: 700 }}>Seleziona fasce di prezzo (opzionale)</div>
            <div style={{ color: "var(--color-muted)" }}>
              {anySelected ? "I gratta saranno presi dalle categorie selezionate" : "Nessuna categoria selezionata = pescaggio da tutte le categorie"}
            </div>
          </div>

          <div className="scratch__checkboxes">
            {scratchPrices.map((p) => (
              <label key={p} className="scratch__price">
                <input
                  type="checkbox"
                  checked={!!selectedPrices[p]}
                  onChange={() => togglePrice(p)}
                />
                <span>{p} €</span>
                <small style={{ color: "var(--color-muted)", marginLeft: 8 }}>
                  ({(scratchByPrice[p] ?? []).length})
                </small>
              </label>
            ))}
          </div>

          <div className="scratch__row" style={{ alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "var(--color-muted)" }}>Quanti gratta e vinci vuoi?</span>
              <input
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(Math.max(1, Number(e.target.value)))}
                style={{ width: 100, padding: "8px 10px", borderRadius: 8 }}
              />
            </label>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="scratch__btn" onClick={handleGenerate}>Genera</button>
              <button className="scratch__btn" onClick={handleClear}>Pulisci</button>
            </div>
          </div>
        </div>

        {message && <div className="scratch__message card">{message}</div>}

        {/* risultati aggregati */}
        {results && (
          <>
            <div style={{ width: "100%", maxWidth: 980, textAlign: "right", color: "var(--color-muted)", marginBottom: 8 }}>
              Totale estratti: {Object.values(results).reduce((s, arr) => s + arr.length, 0)}
            </div>

            <div className="scratch__resultGrid">
              {Object.entries(aggregateResults(results)).map(([price, pairs]) => (
                <div className="scratch__priceResult card" key={price}>
                  <div className="scratch__priceHeader">
                    <strong>{price} €</strong>
                    <span className="scratch__count">({pairs.reduce((s, [, c]) => s + c, 0)})</span>
                  </div>

                  <ul>
                    {pairs.map(([name, count]) => (
                      <li key={name}>
                        <strong>{count}</strong> - {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
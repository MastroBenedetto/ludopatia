import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/pages/Lotto/lotto.css";
import { wheelsList } from "../../data/wheels";
import { generateForWheels } from "../../lib/lottoGenerator";

/**
 * LottoPage v2
 *
 * - "Generazione randomica" collapsible (default closed)
 *   -> contiene la UI di generazione e reveal sequenziale (come prima)
 *
 * - "Estrazioni passate" collapsible (default closed)
 *   -> al open: fetch /api/calendario-lotto?month=YYYY/MM (es: 2025/11)
 *   -> mostra i giorni ricevuti come bottoni
 *   -> click su giorno -> fetch /api/lotto?anno=YYYY&mese=MM&giorno=DD
 *   -> visualizza estrazione con reveal sequenziale per ogni ruota (ruota dopo ruota)
 *
 * Note: errori fetch sono silenziati in UI (log in console), cleanup dei timeout e abort controller usati.
 */

// helper per formattare mese come 'YYYY/MM' e per query params
const pad2 = (n: number) => String(n).padStart(2, "0");
const monthKey = (y: number, m: number) => `${y}/${pad2(m)}`;

export default function LottoPage() {
  // --- GENERAZIONE (esistente) ---
  const [genOpen, setGenOpen] = useState<boolean>(false);

  const [mode, setMode] = useState<"all" | "custom">("all");
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(wheelsList.map((w) => [w, false]))
  );
  const [count, setCount] = useState<number>(6);

  // risultati generazione (final + displayed)
  const [finalResults, setFinalResults] = useState<Record<string, number[]> | null>(null);
  const [displayedResults, setDisplayedResults] = useState<Record<string, (number | null)[]> | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  // --- ESTRAZIONI PASSATE ---
  const [pastOpen, setPastOpen] = useState<boolean>(false);

  // current month/year default: system date
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState<number>(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(now.getMonth() + 1); // 1..12

  // calendario giorni -> array di numeri (days)
  const [monthDays, setMonthDays] = useState<number[] | null>(null);
  const [calLoading, setCalLoading] = useState(false);

  // estrazione selezionata e sua visualizzazione (final + displayed)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [drawResult, setDrawResult] = useState<any | null>(null);
  const [displayedDraw, setDisplayedDraw] = useState<Record<string, (number | null)[]> | null>(null);
  const [drawLoading, setDrawLoading] = useState(false);

  // timeouts + abort controllers cleanup
  const timeoutsRef = useRef<number[]>([]);
  const calAbortRef = useRef<AbortController | null>(null);
  const drawAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
      if (calAbortRef.current) calAbortRef.current.abort();
      if (drawAbortRef.current) drawAbortRef.current.abort();
    };
  }, []);

  // helper: clear timeouts
  const clearTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  // helper: toggle wheel selection (generation)
  const toggleWheel = (wheel: string) => {
    setSelected((prev) => ({ ...prev, [wheel]: !prev[wheel] }));
  };
  const selectAllCustom = (on: boolean) => {
    const obj = Object.fromEntries(wheelsList.map((w) => [w, on]));
    setSelected(obj);
  };

  // chosen wheels memo
  const chosenWheels = useMemo(() => {
    if (mode === "all") return wheelsList.slice();
    return wheelsList.filter((w) => selected[w]);
  }, [mode, selected]);

  // -----------------
  // GENERAZIONE: unchanged logic but wrapped in collapsible
  // -----------------
  const handleGenClear = () => {
    clearTimeouts();
    setGenLoading(false);
    setFinalResults(null);
    setDisplayedResults(null);
  };

  const handleGenerate = useCallback(() => {
    if (chosenWheels.length === 0) {
      alert("Se scegli 'Seleziona ruote' devi selezionarne almeno una.");
      return;
    }

    setGenLoading(true);
    setFinalResults(null);
    setDisplayedResults(null);
    clearTimeouts();

    // genera risultati subito (logica pure)
    const out = generateForWheels(chosenWheels, count);
    setFinalResults(out);

    // init displayed placeholders
    const initialDisplayed: Record<string, (number | null)[]> = {};
    for (const w of Object.keys(out)) initialDisplayed[w] = Array(count).fill(null);
    setDisplayedResults(initialDisplayed);

    // reveal sequenziale per ogni ruota
    const wheelBaseDelay = 300;
    const wheelGap = 180;
    const initialDelay = 200;
    let accumulated = initialDelay;

    for (let wi = 0; wi < chosenWheels.length; wi++) {
      const wheelName = chosenWheels[wi];
      const nums = out[wheelName] ?? [];
      for (let ni = 0; ni < nums.length; ni++) {
        const revealDelay = accumulated + ni * wheelBaseDelay;
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
      accumulated += nums.length * wheelBaseDelay + wheelGap;
    }

    const endTid = window.setTimeout(() => {
      setGenLoading(false);
    }, accumulated + 200);
    timeoutsRef.current.push(endTid);
  }, [chosenWheels, count]);

  // -----------------
  // ESTRAZIONI PASSATE: fetch calendar when opened or month changes
  // -----------------
  useEffect(() => {
    // only fetch when pastOpen true
    if (!pastOpen) return;

    // abort previous
    if (calAbortRef.current) {
      calAbortRef.current.abort();
      calAbortRef.current = null;
    }
    const ac = new AbortController();
    calAbortRef.current = ac;

    const key = monthKey(calendarYear, calendarMonth);
    setCalLoading(true);
    setMonthDays(null);

    // endpoint: /api/calendario-lotto?month=YYYY/MM  (assunto)
    // user said call "/api/calendario-lotto" with "2025/11" - we'll pass as query ?month=YYYY/MM
    fetch(`/api/calendario-lotto?month=${encodeURIComponent(key)}`, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // expect an array of numbers
        if (Array.isArray(json)) {
          setMonthDays(json.filter((d) => typeof d === "number"));
        } else if (Array.isArray((json as any).days)) {
          setMonthDays((json as any).days);
        } else {
          // if API returns as { days: [...] } or raw array. otherwise try tolerant parsing
          if (Array.isArray(json?.result)) setMonthDays(json.result);
          else {
            // fallback: silent
            console.debug("calendario response unexpected", json);
            setMonthDays(null);
          }
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.debug("calendario fetch failed (silenced):", err?.message || err);
        setMonthDays(null);
      })
      .finally(() => {
        setCalLoading(false);
        calAbortRef.current = null;
      });

    return () => {
      if (calAbortRef.current) {
        calAbortRef.current.abort();
        calAbortRef.current = null;
      }
    };
  }, [pastOpen, calendarYear, calendarMonth]);

  // -----------------
  // When user selects a day: fetch /api/lotto?anno=YYYY&mese=MM&giorno=DD
  // then display with reveal sequential per ruota
  // -----------------
  const handlePickDay = useCallback((day: number) => {
    // reset previous draw display/timeouts
    clearTimeouts();
    if (drawAbortRef.current) {
      drawAbortRef.current.abort();
      drawAbortRef.current = null;
    }
    setSelectedDay(day);
    setDrawResult(null);
    setDisplayedDraw(null);
    setDrawLoading(true);

    const ac = new AbortController();
    drawAbortRef.current = ac;

    const y = calendarYear;
    const m = calendarMonth;
    const d = day;

    fetch(`/api/lotto?anno=${y}&mese=${pad2(m)}&giorno=${pad2(d)}`, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json;
      })
      .then((json) => {
        // expected shape as you provided: { esito: "OK", estrazione: [...] , numeriVincenti: [...], ... }
        setDrawResult(json);

        // prepare displayedDraw placeholders: one array per ruota with same length as numbers in payload
        const byWheel: Record<string, (number | null)[]> = {};
        const extr = json?.estrazione ?? [];
        for (const r of extr) {
          byWheel[r.ruota] = Array((r.numeri?.length ?? 5)).fill(null);
        }
        setDisplayedDraw(byWheel);

        // schedule reveal sequential per ruota
        const wheelBaseDelay = 300;
        const wheelGap = 220;
        const initialDelay = 200;
        let acc = initialDelay;

        for (let wi = 0; wi < extr.length; wi++) {
          const wheelObj = extr[wi];
          const wheelName = wheelObj.ruota;
          const nums: number[] = wheelObj.numeri ?? [];
          for (let ni = 0; ni < nums.length; ni++) {
            const revealDelay = acc + ni * wheelBaseDelay;
            const tid = window.setTimeout(() => {
              setDisplayedDraw((prev) => {
                if (!prev) return prev;
                const copy = { ...prev };
                const arr = copy[wheelName] ? copy[wheelName].slice() : Array(nums.length).fill(null);
                arr[ni] = nums[ni];
                copy[wheelName] = arr;
                return copy;
              });
            }, revealDelay);
            timeoutsRef.current.push(tid);
          }
          acc += nums.length * wheelBaseDelay + wheelGap;
        }

        // end loading after all reveals
        const tend = window.setTimeout(() => {
          setDrawLoading(false);
        }, acc + 200);
        timeoutsRef.current.push(tend);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.debug("fetch lotto failed (silenced):", err?.message || err);
        setDrawResult(null);
        setDisplayedDraw(null);
        setDrawLoading(false);
      })
      .finally(() => {
        drawAbortRef.current = null;
      });
  }, [calendarYear, calendarMonth]);

  // UI: render calendar days as grid of buttons
  const renderCalendar = () => {
    if (!pastOpen) return null;
    if (calLoading) return <div className="lotto__smallInfo">Caricamento date…</div>;
    if (!monthDays || monthDays.length === 0) return <div className="lotto__smallInfo">Nessuna estrazione disponibile per questo mese.</div>;

    return (
      <div className="lotto__calendar">
        {monthDays.map((d) => (
          <button
            key={d}
            className={`lotto__dayBtn ${selectedDay === d ? "is-selected" : ""}`}
            onClick={() => handlePickDay(d)}
            disabled={drawLoading}
          >
            {d}
          </button>
        ))}
      </div>
    );
  };

  // UI: render draw result block (if drawResult exists)
  const renderDrawResult = () => {
    if (!drawResult) return null;
    const extr = drawResult.estrazione ?? [];
    const numeriVincenti: number[] = drawResult.numeriVincenti ?? [];
    const numeroSpeciale = drawResult.numeroSpeciale;
    const simbolotti = drawResult.simbolotti;
    const overtime = drawResult.numeriEstrattiOvertime ?? [];

    return (
      <div className="lotto__drawResult">
        <h4>Estrazione del {calendarYear}-{pad2(calendarMonth)}-{pad2(selectedDay ?? 0)}</h4>

        <div className="lotto__resultGrid">
          {extr.map((r: any) => (
            <div key={r.ruota} className="lotto__wheelResult">
              <div className="lotto__wheelName">{r.ruotaExtended} <small>({r.ruota})</small></div>
              <div className="lotto__numbers">
                {(displayedDraw?.[r.ruota] ?? Array(r.numeri.length).fill(null)).map((n: number | null, i: number) => (
                  <div key={i} className={`lotto__num ${n === null ? "is-empty" : "is-visible"}`}>
                    {n === null ? "--" : n}
                  </div>
                ))}
              </div>
              {typeof r.numeroOro !== "undefined" && (
                <div className="lotto__meta">Numero Oro: <strong>{r.numeroOro}</strong></div>
              )}
            </div>
          ))}
        </div>

        <div className="lotto__extras">
          {numeriVincenti && numeriVincenti.length > 0 && (
            <div className="lotto__extraBlock">
              <h5>Numeri vincenti (aggregato)</h5>
              <div className="lotto__numbers lotto__numbers--inline">
                {numeriVincenti.map((n: number) => (
                  <div key={n} className="lotto__num is-visible">{n}</div>
                ))}
              </div>
            </div>
          )}

          {typeof numeroSpeciale !== "undefined" && numeroSpeciale !== null && (
            <div className="lotto__extraBlock">
              <h5>Numero speciale</h5>
              <div className="lotto__num is-visible">{numeroSpeciale}</div>
            </div>
          )}

          {simbolotti && (
            <div className="lotto__extraBlock">
              <h5>Simbolotti ({simbolotti.ruota})</h5>
              <div className="lotto__numbers lotto__numbers--inline">
                {simbolotti.simbolotti.map((s: number) => (
                  <div key={s} className="lotto__num is-visible">{s}</div>
                ))}
              </div>
            </div>
          )}

          {overtime && overtime.length > 0 && (
            <div className="lotto__extraBlock">
              <h5>Numeri estratti overtime</h5>
              <div className="lotto__numbers lotto__numbers--inline">
                {overtime.map((n: number) => (
                  <div key={n} className="lotto__num is-visible">{n}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // small helpers to change month
  const prevMonth = () => {
    let m = calendarMonth - 1;
    let y = calendarYear;
    if (m < 1) {
      m = 12;
      y = y - 1;
    }
    setCalendarMonth(m);
    setCalendarYear(y);
    setSelectedDay(null);
    setMonthDays(null);
  };
  const nextMonth = () => {
    let m = calendarMonth + 1;
    let y = calendarYear;
    if (m > 12) {
      m = 1;
      y = y + 1;
    }
    setCalendarMonth(m);
    setCalendarYear(y);
    setSelectedDay(null);
    setMonthDays(null);
  };

  return (
    <main className="lotto">
      <section className="lotto__wrap container">
        <h1>Generatore Lotto</h1>

        {/* COLLAPSIBLE: Generazione randomica */}
        <div className="lotto__panel">
          <button className="lotto__panelHeader" onClick={() => setGenOpen((s) => !s)} aria-expanded={genOpen}>
            <span>Generazione randomica</span>
            <span className={`lotto__chev ${genOpen ? "open" : ""}`}>▾</span>
          </button>

          {genOpen && (
            <div className="lotto__panelBody">
              <div className="lotto__form card">
                <div className="lotto__row">
                  <label className="lotto__radio">
                    <input type="radio" name="mode" value="all" checked={mode === "all"} onChange={() => setMode("all")} disabled={genLoading}/>
                    Tutte le ruote
                  </label>

                  <label className="lotto__radio">
                    <input type="radio" name="mode" value="custom" checked={mode === "custom"} onChange={() => setMode("custom")} disabled={genLoading}/>
                    Seleziona ruote
                  </label>

                  <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                    <label style={{ fontSize: 14, color: "var(--color-muted)" }}>Numeri per ruota</label>
                    <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={genLoading}>
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
                        <button type="button" className="lotto__btn" onClick={() => selectAllCustom(true)} disabled={genLoading}>Seleziona tutte</button>
                        <button type="button" className="lotto__btn" onClick={() => selectAllCustom(false)} disabled={genLoading}>Deseleziona tutte</button>
                      </div>
                    </div>

                    <div className="lotto__checkboxes">
                      {wheelsList.map((w) => (
                        <label key={w} className="lotto__wheel">
                          <input type="checkbox" checked={!!selected[w]} onChange={() => toggleWheel(w)} disabled={genLoading}/>
                          <span>{w}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                <div className="lotto__actions">
                  <button className="lotto__btn" onClick={handleGenerate} disabled={genLoading}>
                    {genLoading ? "Generando…" : "Genera"}
                  </button>
                  <button className="lotto__btn" onClick={handleGenClear} disabled={genLoading && !displayedResults}>
                    Pulisci
                  </button>
                </div>
              </div>

              {/* displayedResults */}
              {displayedResults && (
                <div style={{ width: "100%", maxWidth: 1000 }}>
                  <div style={{ color: "var(--color-muted)", textAlign: "right", marginBottom: 8 }}>
                    Totale numeri rivelati: {Object.values(displayedResults).reduce((s, arr) => s + arr.filter(Boolean).length, 0)}
                  </div>

                  <div className="lotto__resultGrid">
                    {Object.entries(displayedResults).map(([wheel, arr]) => (
                      <div className="lotto__wheelResult" key={wheel}>
                        <div className="lotto__wheelName">{wheel}</div>
                        <div className="lotto__numbers" aria-live="polite">
                          {arr.map((n, i) => (
                            <div key={i} className={`lotto__num ${n === null ? "is-empty" : "is-visible"}`}>{n === null ? "--" : n}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLLAPSIBLE: Estrazioni passate */}
        <div className="lotto__panel" style={{ marginTop: 18 }}>
          <button className="lotto__panelHeader" onClick={() => setPastOpen((s) => !s)} aria-expanded={pastOpen}>
            <span>Estrazioni passate</span>
            <span className={`lotto__chev ${pastOpen ? "open" : ""}`}>▾</span>
          </button>

          {pastOpen && (
            <div className="lotto__panelBody">
              <div className="lotto__calendarWrap card">
                <div className="lotto__calendarHeader">
                  <button onClick={prevMonth} className="lotto__smallBtn">◀</button>
                  <div className="lotto__monthLabel">{calendarYear} / {pad2(calendarMonth)}</div>
                  <button onClick={nextMonth} className="lotto__smallBtn">▶</button>
                </div>

                {renderCalendar()}
              </div>

              {/* Draw result */}
              <div style={{ marginTop: 16 }}>
                {drawLoading && <div className="lotto__smallInfo">Caricamento estrazione…</div>}
                {renderDrawResult()}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

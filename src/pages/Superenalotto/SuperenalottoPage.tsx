import React, {useCallback, useState} from "react";
import "./superenalotto.css"


export default function SuperenalottoPage(){
    const [numbers, setNumbers] = useState<number[] | null> (null);

    // funzione helper: intero random [min, max] inclusivo

    const randInt = (min: number, max:  number) =>
        Math.floor(Math.random() *(max - min + 1)) + min;

    const generateNumbers = useCallback((): number[] =>{
        const s = new Set<number>();
        while (s.size < 6){
            s.add(randInt(1, 99));

        }
        return Array.from(s);
    }, []);

    const handleGenerate = () =>{
        const nums = generateNumbers();
        setNumbers(nums);
    }

    const getCellValue = (index: number) =>
        numbers ? String(numbers[index]) : "--";

    return (
        <main className="se" >
            <section className = "se__wrap container">
                <h1 className="se__title"> generatore di 6 numeri</h1>

                <div className="se__board" role="list" aria-label="Numeri generati">
                { Array.from({ length: 6}).map((_ , i) =>{
                    const isEmpity = !numbers;
                    return(
                        <div
                        key={i}
                        role="listitem"
                        className={'se__num${isEmpty ?" is-empty" : ""}'}
                        aria-live="polite" >
                        
                        <h1>{getCellValue(i)}</h1>
                        </div>
                    );
                })}
                </div>

                <div className=" se__actions">
                    <button type="button" className="se__btn" onClick={handleGenerate}>
                            Genera Numeri
                    </button>
                </div>

                <p className="se__nome">
                     Questo è un esercizio didattico. Il gioco d’azzardo può causare
                    dipendenza: gioca responsabilmente o evita di giocare.
                    Ovviamente se vincete fatemi una donazione GRAZIE
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
// src/data/scratchcards.ts
// Elenco "semplificato" di gratta e vinci divisi per fascia di prezzo.
// Esporta un oggetto price -> array di titoli (string[]).
// Aggiungi/ modifica i nomi qui: la UI prende tutto da questo file.

export const scratchByPrice: Record<string, string[]> = {
  "1": [
    "Piccolo Fortuna",
    "Sorriso",
    "Mini Chance",
    "Un Euro, Un Sogno"
  ],
  "2": [
    "Doppia Fortuna",
    "Giro Vincente",
    "Lucky Two",
    "Doppio Sorriso",
    "Due e Vai"
  ],
  "3": [
    "Tripletta",
    "Super 3",
    "TriChance",
    "3X Fortuna"
  ],
  "5": [
    "Jackpot",
    "Mega 5",
    "Cinquina",
    "5 Stelle"
  ],
  "10": [
    "Oro",
    "Fortuna Top",
    "Maxi 10"
  ],
  "20": [
    "Premium",
    "Super Oro",
    "Top Prize"
  ]
};

// Exporta anche l'elenco ordinato delle fasce di prezzo (utile per la UI)
export const scratchPrices = Object.keys(scratchByPrice).sort((a,b) => Number(a)-Number(b));

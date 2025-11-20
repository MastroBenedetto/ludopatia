// src/data/scratchcards.ts
// Elenco "semplificato" di gratta e vinci divisi per fascia di prezzo.
// Esporta un oggetto price -> array di titoli (string[]).
// Aggiungi/ modifica i nomi qui: la UI prende tutto da questo file.

// src/data/scratchcardsFull.ts
// Lista gratta e vinci per fascia di prezzo fornita dall'utente.
// Key = prezzo (string), value = array di nomi (string[])

export const scratchByPrice: Record<string, string[]> = {
  "0.50": [
    "Testa o Croce",
    "Lucky Park",
    "Ocean Party",
    "Xmas Baubles",
    "Tris Deluxe",
    "Pozioni Spettrali",
    "Coco Beach",
    "Un Cuore Tira l’Altro",
    "Il Peso della Ricchezza",
    "Scala Reale",
    "Gioca Più Testa o Croce"
  ],
  "1": [
    "Monetine Fortunate",
    "Ultra Goleadoro",
    "La Casa Stregata",
    "Nuovo Portafortuna Linea PLUS",
    "Mini Battaglia Navale Linea PLUS",
    "I Simboli del Miliardario Linea PLUS",
    "Il Villaggio degli Elfi",
    "Banana Colors",
    "Sette e Mezzo Linea PLUS",
    "Il Bottino di Halloween",
    "Grande Mangia Piccolo",
    "Space Solitaire",
    "Portafortuna",
    "Sette e Mezzo",
    "Gioca Più 7 e Mezzo"
  ],
  "2": [
    "Buongiorno",
    "Fai Scopa New Linea PLUS",
    "Lucky 7’s",
    "I Simboli del Miliardario 2 Linea PLUS",
    "Bounty Town",
    "Color Cubes",
    "Nuovo 10x Linea PLUS",
    "Mini Doppia Sfida Linea PLUS",
    "Golden Eggs",
    "Wheel of Fortune",
    "Dado 7 Linea PLUS",
    "La Fortezza Ricca",
    "Pop & Win",
    "Alla Conquista dell’Impero",
    "Batti il Banco",
    "Numeri Spettacolari",
    "Fai Scopa New",
    "2019"
  ],
  "3": [
    "Mama Non M’Ama Linea PLUS",
    "Super Portafortuna Linea PLUS",
    "Super Sette e Mezzo Linea PLUS",
    "Multistar",
    "Numeri Fortunati",
    "Cuccioli d'Oro",
    "Gioca Più Numeri Fortunati New"
  ],
  "5": [
    "La Star",
    "Nuovo 20x",
    "Numerissimi Linea PLUS",
    "Sfida al Campionato Re-Play",
    "Super Biliardo",
    "Club Elegance",
    "Thunder Legend",
    "Tutto per Tutto Linea PLUS",
    "Nuovo Il Miliardario Linea PLUS",
    "Nuovo 20x Linea PLUS",
    "Nuovo Doppia Sfida Linea PLUS",
    "Battaglia Navale Linea PLUS",
    "Nuovo Miliardario",
    "Prendi Tutto",
    "Speed Cash",
    "Il Miliardario",
    "Forza 100 200",
    "New Tutto per Tutto",
    "Area Gold",
    "Gioca più Il Miliardario"
  ],
  "10": [
    "Turbo Cash Linea PLUS",
    "Silver Privé",
    "Bonus Tutto per Tutto Linea PLUS",
    "Nuovo Il Miliardario MEGA Linea PLUS",
    "Nuovo 50x Linea PLUS",
    "Nuovo Mega Miliardario",
    "Nuovo 50X",
    "Bonus Tutto per Tutto",
    "Gioca Più Mega Miliardario New",
    "Gioca Più Super Numerissimi"
  ],
  "15": [
    "La Grande Occasione"
  ],
  "20": [
    "Nuovo 100x",
    "Nuovo Il Miliardario MAXI Linea PLUS",
    "Nuovo 100x Linea PLUS",
    "Golden Privé",
    "Il Miliardario Maxi",
    "Maxi Miliardario New"
  ],
  "25": [
    "Vinci in Grande",
    "Edizione Speciale VIP"
  ]
};


// Exporta anche l'elenco ordinato delle fasce di prezzo (utile per la UI)
export const scratchPrices = Object.keys(scratchByPrice).sort((a,b) => Number(a)-Number(b));

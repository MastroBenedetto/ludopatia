// App.tsx
// -------------------------------------------------------------
// Questo file definisce la "cornice" dell'app React:
// - inizializza il router (BrowserRouter)
// - rende la NavBar una volta sola (resta fissa su tutte le pagine)
// - mappa gli URL (path) alle pagine (Routes/Route)
// - gestisce una rotta di fallback (404 -> redirect alla Home)
// -------------------------------------------------------------

import React from "react";

// BrowserRouter: abilita il "client-side routing" usando la History API del browser.
// Routes/Route: dichiarano la tabella di routing (path -> quale componente rendere).
// Navigate: componente per navigare/redirect in modo dichiarativo.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// CSS globali (variabili, base, ecc.)
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./router/ProtectedRoute";

// Componenti/pagine dell'app
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./pages/Home/HomePage";
import SuperenalottoPage from "./pages/Superenalotto/SuperenalottoPage";
import Lotto from "./pages/Lotto/Lotto";

export default function App() {
  return (
    <AuthProvider>
       {/* // 1) <BrowserRouter> avvolge l'intera app e abilita il routing SPA.
        //    - Usa la History API (pushState/replaceState) per cambiare URL senza ricaricare.
        //    - Alternativa: <HashRouter> se il tuo hosting NON supporta il fallback delle SPA
        //      (es: GitHub Pages) e non puoi configurare le "rewrite" lato server.
        //    - Opzione utile: <BrowserRouter basename="/mio-sotto-percorso"> se deployi la SPA
        //      sotto una sottocartella (es: sito.it/app/).*/}
      <BrowserRouter>
        {/*
          2) <NavBar /> è fuori da <Routes> perché deve restare SEMPRE visibile.
            Così non viene rimontata cambiando pagina e mantiene eventuale stato interno.
        */}
        <NavBar />

        {/*
          3) <Routes> contiene le nostre "rotte".
            Funziona come uno "switch": rende SOLO il <Route> che matcha l'URL corrente.
        */}
        <Routes>
          {/*
            3.1) Route per la Home.
                path="/" -> rende <HomePage />.
                NOTA: in React Router v6 il match è "esatto" per default (non serve exact).
          */}
          <Route path="/" element={<HomePage />} />

          {/*
            3.2) Route per /superenalotto (placeholder per ora).
                In futuro qui metteremo la logica/UX del generatore.
          */}
          <Route path="/superenalotto" element={<SuperenalottoPage />} />

          <Route path="/lotto" element={ <ProtectedRoute> <Lotto /></ProtectedRoute>} />


          {/*
            3.3) Rotta "catch-all": se nessun path precedente matcha,
                facciamo un redirect verso la Home.

                <Navigate to="/" replace />
                - to="/"   -> destinazione
                - replace -> sostituisce la voce corrente nella history (utile per 404),
                            così il "Back" non torna alla pagina inesistente.
          */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

/* ------------------------- APPROFONDIMENTI RAPIDI ---------------------------

A) Perché il router nel frontend?
   - In una SPA (Single Page Application), cambiare pagina non ricarica l'HTML.
     React "sostituisce" solo il contenuto centrale in base all'URL.
   - Vantaggi: velocità, transizioni fluide, stato preservato.
   - Svantaggi: serve un hosting configurato per servire SEMPRE index.html
     (fallback), così gli URL "profondi" non fanno 404 lato server.

B) BrowserRouter vs HashRouter
   - BrowserRouter: URL "puliti" (/superenalotto). Richiede rewrite lato server:
     qualsiasi richiesta non gestita deve tornare index.html.
   - HashRouter: URL con # (/#/superenalotto). Non richiede rewrite ma è meno elegante.
   - Se pubblichi su hosting statici senza fallback (o non vuoi configurare),
     HashRouter è la scorciatoia.

C) Dove metto elementi che voglio fissi?
   - Fuori da <Routes>: NavBar, Footer, Sidebar, ecc.
   - Dentro le pagine (HomePage/SuperenalottoPage) metti solo il contenuto specifico.

D) Come si evidenzia il link attivo in navbar?
   - In NavBar.tsx usiamo <NavLink>. React Router passa "isActive",
     che noi convertiamo in classe CSS "is-active".
   - Così lo stili facilmente nel CSS (vedi navbar.css).

E) Come aggiungo nuove pagine?
   1) Crea la cartella: src/pages/NuovaPagina/{NuovaPagina.tsx, css opzionale}
   2) Aggiungi un <Route path="/nuova" element={<NuovaPagina />} />
   3) Aggiungi un <NavLink to="/nuova">Nuova</NavLink> nella NavBar.

F) Problema classico in produzione: 404 ricaricando una pagina profonda
   - Soluzione: configura il server per fare fallback su index.html
     (es. in Netlify: _redirects; in Vercel: rewrites; in Nginx/Apache: regole apposite).
   - Se non puoi, usa HashRouter.

G) Tip: "Scroll to top" al cambio pagina
   - Di default il browser NON scrolla in alto quando cambia rotta in una SPA.
   - Puoi aggiungere un piccolo componente che ascolta la location e fa window.scrollTo(0,0).
   - Lo monterai qui in App, subito sotto <BrowserRouter>. (Lo facciamo quando vuoi.)

---------------------------------------------------------------------------- */

import React from "react";
import "@/styles/pages/home.css"


/**
 * HomePage – solo contenuto base, senza menù.
 * Slogan: "Ludopatia, portami via" (ironico per esercizio didattico).
 * Nota: in futuro qui aggiungeremo CTA e sezioni dinamiche.
 */

export default function HomePage(){
    return ( 
        <main className="home">
            <section className="home__hero container">
                <div className="home__hero-card card">
                    <h1 className="home__title"> Ludopatia, portami via  </h1>
                    <p className="home__subtitle">
                        un piccolo progetto didattico per imparare React. Niente inviti al gioco anzi,
                        qui promuoviamo consapevolezza e prevenzione, tranne se non vincete, in tal caso mi aspetto grandi donazioni. 
                    </p>

                    <div className="home__badges">
                        <span className="home__badge"> Didattico</span>
                        <span className="home__badge home__badge--accent"> No-gioco</span>
                        <span className="home__badge"> Consapevolezza</span>
                    </div>

                    <div className="home__disclaimer">
                        <p><strong> Avviso serio:</strong> il gioco d’azzardo può causare dipendenza,
                        problemi economici e psicologici. Questo sito è un esercizio tecnico.
                        Se senti di averne bisogno, chiedi aiuto a professionisti e servizi di supporto e soprattutto.</p>
                        
                        <strong> Per aiutarti dai i soldi a me che li tengo io così non li giochi </strong> 
                    </div>
                </div>
            </section>

            <section className="home__sections container">
                <article className="home__section card">
                    <h2 className="home__section-title"> Cosa troverai qui</h2>
                    <p className="home__section-text">
                        Un sito “solo frontend” per imparare React in modo pulito e ordinato, con pagine chiare
                        e CSS separato. Partiamo dalla Home, poi aggiungeremo funzioni come:
                    </p>
                    <ul className="home_list">
                        <li>Generatore numeri Lotto/Superenalotto (random) – solo dimostrativo.</li>
                        <li>“Consiglio” (randomico) di un gratta e vinci – solo per esercizio.</li>
                        <li>Altre pagine informative, componenti e routing.</li>
                    </ul>
                </article>
                
                <article className="home__section card">
                    <h2 className="home__section-title"> Perche questo stile</h2>
                    <p className="home__section-text">
                         Manteniamo la struttura semplice, “alla vecchia HTML”: pagine in cartelle dedicate,
                         CSS separati, classi chiare. Così il TSX resta leggibile e impari le basi senza fronzoli.
                    </p>

                </article>
            </section>
        </main>
    );
}
/* =====================================================================
   tur.js - rundvisningens stop i sc8.6

   Selve rundvisningen ligger i ../../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#scene", titel: "Laboratoriet", tekst: "Klik på genstandene for at bruge dem. Flaskerne, vejebåden, kolben og affaldsbægeret trækkes derhen, hvor de skal bruges. Hanen på buretten åbnes og lukkes med et klik." },
    { sel: ".skifter", titel: "Tilskuerioner", tekst: "Viser også de ioner i zoomboblen, der ikke deltager i reaktionen." },
    { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinene får flueben, efterhånden som du når dem. Hint hjælper med det trin, du er ved." },
    { sel: "#maal-kort", titel: "Beregning", tekst: "Vejningen og aflæsningerne af buretten skrives ind her. Til sidst beregner du jernindholdet." },
    { sel: "#serie-kort", titel: "Tegneserie", tekst: "Låses op, når jernindholdet er beregnet. Den viser forsøget, fejlene undervejs og resultaterne." },
    { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når du har fundet jernindholdet i et forsøg med svovlsyre." },
    { sel: "#nytknap", titel: "Nyt forsøg", tekst: "Starter forfra. Resultaterne bliver stående, så forsøgene kan sammenlignes." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

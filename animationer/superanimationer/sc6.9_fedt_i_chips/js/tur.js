/* =====================================================================
   tur.js - rundvisningens stop i sc6.9

   Selve rundvisningen ligger i ../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#scene", titel: "Laboratoriet", tekst: "Klik på genstandene for at bruge dem. Flaskerne, vejebåden, bægerglasset og petriskålen trækkes derhen, hvor de skal bruges. Pistillen og glasstaven bevæges med musen." },
    { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinene får flueben, efterhånden som du når dem. Hint hjælper med det trin, du er ved." },
    { sel: "#maal-kort", titel: "Måleskema", tekst: "Vejningerne skrives ind her. Til sidst beregner du fedtindholdet." },
    { sel: "#iagttagelser-kort", titel: "Iagttagelser", tekst: "Det, du ser undervejs, bliver skrevet her." },
    { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når du har fundet fedtindholdet i chipsene." },
    { sel: "#nytknap", titel: "Nyt forsøg", tekst: "Starter forfra med nye chips. Resultaterne bliver stående, så forsøgene kan sammenlignes." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

/* =====================================================================
   tur.js - rundvisningens stop i sc2.6

   Selve rundvisningen ligger i ../../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#scene", titel: "Stinkskabet", tekst: "Klik på genstandene for at bruge dem. Tag fat i kolben for at ryste den, og klik på proppen for at tage den af." },
    { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinene får flueben, efterhånden som du når dem. Hint hjælper med det trin, du er ved." },
    { sel: "#iagttagelser-kort", titel: "Iagttagelser", tekst: "Det, du ser undervejs, bliver skrevet her." },
    { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når begge tests er lavet." },
    { sel: "#teoriknap", titel: "Teori", tekst: "Reaktionsskemaerne og sikkerheden bag forsøget." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

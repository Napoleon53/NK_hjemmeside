/* =====================================================================
   tur.js - rundvisningens stop i sc2.7

   Selve rundvisningen ligger i ../../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#scene", titel: "Laboratoriebordet", tekst: "Klik på genstandene for at bruge dem. Hvert klik på et glas med stof er en spatelspids." },
    { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinene får flueben, efterhånden som du når dem. Hint hjælper med det trin, du er ved." },
    { sel: "#serie-kort", titel: "Tegneserie", tekst: "Når forsøget er slut, kan du se det opsummeret som en tegneserie med dine målinger og opløselighedskurven." },
    { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når der er tre målinger." },
    { sel: "#forfraknap", titel: "Start forfra", tekst: "Starter forsøget forfra med et tomt bægerglas." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

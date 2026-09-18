/* =====================================================================
   tur.js - rundvisningens stop i sc6.8

   Selve rundvisningen ligger i ../../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#scene", titel: "Stinkskabet", tekst: "Klik på genstandene for at bruge dem. Klik på et glas for at vælge det, og tag fat i det for at ryste." },
    { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinene får flueben, efterhånden som du når dem. Hint hjælper med det trin, du er ved." },
    { sel: "#serie-kort", titel: "Tegneserie", tekst: "Når forsøget er slut, kan du se det opsummeret som en tegneserie med resultaterne for de to glas." },
    { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når begge glas er testet med pH-papir og AgNO₃." },
    { sel: "#forfraknap", titel: "Start forfra", tekst: "Starter forsøget forfra med tomme glas." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

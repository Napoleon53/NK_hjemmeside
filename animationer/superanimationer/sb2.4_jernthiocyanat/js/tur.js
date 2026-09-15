/* =====================================================================
   tur.js - rundvisningens stop i sb2.4

   Selve rundvisningen ligger i ../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#scene", titel: "Laboratoriebordet", tekst: "Alt udstyr kan tages med musen og slippes der, hvor det skal bruges. Et klik bruger det på det valgte glas." },
    { sel: "#stationer", titel: "Del 1 og del 2", tekst: "Skift mellem de syv glas og fortyndingsforsøget." },
    { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinene får flueben, efterhånden som du når dem. Hint hjælper med det trin, du er ved." },
    { sel: "#visning-knap", titel: "Billede og ovenfra", tekst: "I del 1 tager du et billede af glassene, og i del 2 ser du bægerglassene ovenfra. Her noterer du, hvad du ser." },
    { sel: "#serie-kort", titel: "Tegneserie", tekst: "Når begge dele er gjort, kan du se forsøget som en tegneserie med resultatskemaet til sidst." },
    { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når der er taget billede af glas 1 til 7." },
    { sel: "#forfraknap", titel: "Start forfra", tekst: "Starter hele forsøget forfra." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

/* =====================================================================
   tur.js - rundvisningens stop i sc1.3

   Selve rundvisningen ligger i ../../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#glas-kort", titel: "Fyld glasset", tekst: "Luk H₂ og O₂ ind i måleglasset. Du kan også klikke direkte på trykflaskerne. Glasset rummer 6 streger." },
    { sel: "#scene", titel: "Antænd", tekst: "Træk det fyldte glas hen til flammen, eller tryk Antænd. Genfyld glasset sætter det tilbage i karret." },
    { sel: "#resultat", titel: "Lydstyrken", tekst: "Hver blanding får sin søjle. Test alle syv blandinger." },
    { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når alle syv blandinger er testet." },
    { sel: "#teoriknap", titel: "Teori", tekst: "Reaktionsskemaet og forklaringen på knaldet." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

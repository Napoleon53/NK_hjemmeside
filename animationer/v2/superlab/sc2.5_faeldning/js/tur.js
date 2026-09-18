/* =====================================================================
   tur.js - rundvisningens stop i sc2.5

   Selve rundvisningen ligger i ../../laboratoriet/js/rundvisning.js.
   Hvert stop er en CSS-selector plus titel og tekst; findes elementet
   ikke lige nu, springes stoppet over.
   ===================================================================== */
NK.Rundvisning.tur([
    { sel: "#scene", titel: "Dryp", tekst: "Klik på en dråbeflaske og derefter på et felt. Hvert felt skal have én dråbe af opløsningen over søjlen og én af opløsningen ud for rækken." },
    { sel: "#skema-kort", titel: "Skemaet", tekst: "Viser, hvad der er sket i hvert felt. Klik på et felt for at se det i luppen." },
    { sel: "#scene", titel: "Luppen", tekst: "Træk luppen hen over en dråbe. Cirklen viser ionerne i dråben." },
    { sel: "#opgave-kort", titel: "Reaktionsskema", tekst: "Vælg de to ioner, der danner bundfaldet, og sæt koefficienterne. Et forkert svar giver et hint." },
    { sel: "#sidevalg", titel: "Frit forsøg", tekst: "Skift mellem skemaet og et frit forsøg, hvor Na₂S og Fe(NO₃)₃ også kan bruges." },
    { sel: "#frit-kort", titel: "Tungtopløselige salte", tekst: "Markér alle de tungtopløselige salte, og tjek svaret." },
    { sel: "#teoriknap", titel: "Teori", tekst: "Kort om fældning og tilskuerioner." },
    { sel: "#introknap", titel: "Om forsøget", tekst: "Hvad forsøget undersøger, og forløbet i korte træk." }
]);

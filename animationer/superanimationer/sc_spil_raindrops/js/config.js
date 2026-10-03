/* =====================================================================
   IONREGN: ALT, DER KAN SKRUES PÅ, STÅR HER
   ---------------------------------------------------------------------
   Tal i takter er 1-baserede: takt 1 begynder på første slag i musikken.
   Ret tal her, gem filen og genindlæs siden. Kør _selvtest.html bagefter.
   ===================================================================== */
var CONFIG = {

    /* ---- Musik og tempo ------------------------------------------- */
    BPM: 140,                 // slag pr. minut
    OFFSET_MS: 64,            // tid fra lydfilens start til første slag (takt 1, slag 1), i filens egen tid
    MUSIC_URL: "Fast_music.mp3", // lydfil i mappen; tom ("") = metronom
                              // (filen hentes kun, når siden ligger på nettet eller en server;
                              //  fra harddisken vælger man den selv med Vælg lydfil)
    MUSIC_BPM: 144,           // lydfilens eget tempo; spillet afspiller den i BPM
                              // (Fast_music.mp3 går i 144 og spilles derfor 3 % langsommere)
                              // sæt den til samme tal som BPM, når musikken går i 140
    SLAG_PR_TAKT: 4,
    FALD_SLAG: 8,             // ionerne falder i 2 takter i alle faser
    METRONOM_SLUT_TAKT: 104,  // uden musik slutter spillet efter denne takt

    /* ---- Faser (takter) -------------------------------------------
       moenster:  "ingen"  ingen ioner
                  "hver2"  en ion på slag 1 og 3
                  "hver"   en ion på hvert slag
                  "par"    en ion på hvert slag og af og til et ottendedelspar på slag 4
       maal:      "formel" målet vises som formel, "navn" som navn, null = frit
       til: null  betyder: til musikken slutter */
    FASER: [
        { id: "intro", nr: 0, navn: "Intro",      fra: 1,  til: 8,    moenster: "ingen", maal: null },
        { id: "n1",    nr: 1, navn: "Opvarmning", fra: 9,  til: 40,   moenster: "hver2", maal: "formel", andel: 0.6,
          ioner: ["Na", "K", "Li", "Mg", "Ca", "Cl", "Br", "F", "O"] },
        { id: "n2",    nr: 2, navn: "Navnet",     fra: 41, til: 72,   moenster: "hver",  maal: "navn",   andel: 0.5,
          ioner: ["Na", "K", "Li", "Mg", "Ca", "Al", "Fe2", "Fe3",
                  "Cl", "Br", "F", "I", "O", "S", "N"] },
        { id: "n3",    nr: 3, navn: "Frit fald",  fra: 73, til: null, moenster: "par",   maal: null,
          ioner: ["Na", "K", "Li", "Mg", "Ca", "Al", "Fe2", "Fe3", "NH4",
                  "Cl", "Br", "F", "I", "O", "S", "N", "OH", "NO3", "SO4", "CO3", "PO4"] }
    ],
    OTTENDEDELSPAR: 0.3,      // chance pr. takt for et par på slag 4 (mønster "par")
    LUFT: { med: 8, uden: 1 },// i hver fase: 8 takter med ioner, så 1 takt uden

    /* ---- Fangst ---------------------------------------------------- */
    VINDUE_MS: { perfekt: 60, god: 120 },
    TASTER: ["d", "f", "j", "k"],

    /* ---- Kolben ---------------------------------------------------- */
    MAKS_IONER: 5,            // ingen forbindelse kræver mere end 5 ioner
    MAKS_LADNING: 6,          // niveau 3: ladning over ±6 er en fejl

    /* ---- Point, combo og systemintegritet -------------------------- */
    POINT: { perfekt: 300, god: 100, forbindelse: 1000, bonus4: 1000, bonus5: 2000 },
    COMBO: { pr: 3, maks: 4 },          // x2 efter 3 forbindelser i træk, x3 efter 6, x4 efter 9
    INTEGRITET: { forkert: 15, miss: 3, forbindelse: 5 }   // procentpoint
};

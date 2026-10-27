/* =====================================================================
   data.js - stofferne, løbevæskerne, opgaverne og teksterne

   Tallene har en kilde:
     * Rf-vaerdierne er bogens figurer i Kemibogen B8.6 (aflæst i SVG-
       filerne): acetylsalicylsyre 0,60, paracetamol 0,38, koffein 0,15,
       ibuprofen 0,75 (opgave B8.6.7), caroten 0,92, klorofyl a 0,55,
       klorofyl b 0,45, lutein 0,25 (opgave B8.6.mad.2), de tre
       farvestoffer 0,30, 0,55 og 0,75 (B8.6.mad.1) og koffein 0,45 i
       en mere polær løbevæske (B8.6.mad.3).
     * eps er Snyders eluentstyrke paa kiselgel: heptan 0,00,
       ethylethanoat 0,48, propanon 0,53. Blandingerne er regnet med
       Snyders formel for to vaesker (alfa = 0,6) og rumfangsforholdet.
     * Den anden Rf-vaerdi for hvert stof (fx i ren heptan) er valgt, saa
       stoffet opfoerer sig, som det goer i et skoleforsoeg. Se README.

   Teksterne er korte (graenserne i js/fane.js): et gaet hoejst 60 tegn,
   et spoergsmaal 105, et svar 34, en opgave 120, et hint 100 og
   forklaringen til det rigtige svar 180. Hver tekst naevner selv den
   bane, plet eller flaske, den handler om.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Løbevæskerne ----------------------------------------------------
       propanon: molbrøken af propanon (til luppen paa fane 1). */
    var LOEB = {
        heptan:   { navn: "heptan", kort: "heptan", eps: 0.00, propanon: 0 },
        hp91:     { navn: "heptan og propanon (9 : 1)", kort: "9 : 1", eps: 0.27, propanon: 0.18 },
        hp73:     { navn: "heptan og propanon (7 : 3)", kort: "7 : 3", eps: 0.41, propanon: 0.46 },
        propanon: { navn: "propanon", kort: "propanon", eps: 0.53, propanon: 1 },
        eta:      { navn: "ethylethanoat", kort: "ethylethanoat", eps: 0.48 },
        he11:     { navn: "heptan og ethylethanoat (1 : 1)", kort: "1 : 1", eps: 0.41 },
        ee91:     { navn: "ethylethanoat og ethanol (9 : 1)", kort: "9 : 1", eps: 0.55 },
        farve:    { navn: "ethanol og vand (1 : 1)", kort: "ethanol og vand", eps: 0.80 }
    };
    Object.keys(LOEB).forEach(function (id) { LOEB[id].id = id; });

    /* Flaskerne paa fane 1, fra upolær til polær */
    var FLASKER = ["heptan", "hp91", "hp73", "propanon"];

    /* ----- Stofferne ---------------------------------------------------------
       farve: stoffets farve i dagslys (null = farveløst). uv: ses som en
       moerk plet i UV-lys. rf: Rf-vaerdier i en eller to løbevæsker; de
       andre regnes af js/model.js. */
    var STOF = {
        /* Farvestofferne i spinat og gulerod (fane 1) */
        caroten:   { navn: "caroten", farve: "#e8902a", uv: true, rf: { heptan: 0.80, hp73: 0.92 } },
        klorofylA: { navn: "klorofyl a", farve: "#2a8f7d", uv: true, rf: { hp73: 0.55, propanon: 0.90 } },
        klorofylB: { navn: "klorofyl b", farve: "#9cbf3b", uv: true, rf: { hp73: 0.45, propanon: 0.86 } },
        lutein:    { navn: "lutein", farve: "#e2cb34", uv: true, rf: { hp73: 0.25, propanon: 0.80 } },
        /* Blaek fra en kuglepen (paaskeaegget paa fane 1) */
        blaek1:    { navn: "blåt blæk", farve: "#3346c9", uv: true, rf: { hp73: 0.62 } },
        blaek2:    { navn: "violet blæk", farve: "#8a3cc4", uv: true, rf: { hp73: 0.80 } },

        /* Farvestofferne i chokoladelinser (fane 3) */
        roedt:     { navn: "det røde farvestof", farve: "#d6323a", uv: true, rf: { farve: 0.30 } },
        gult:      { navn: "det gule farvestof", farve: "#e3b81c", uv: true, rf: { farve: 0.55 } },
        blaat:     { navn: "det blå farvestof", farve: "#2f6fd0", uv: true, rf: { farve: 0.75 } },

        /* Laegemidler og startstoffer: farveløse, ses i UV-lys */
        acetylsalicylsyre: { navn: "acetylsalicylsyre", farve: null, uv: true, rf: { eta: 0.60, he11: 0.30 } },
        paracetamol: { navn: "paracetamol", farve: null, uv: true, rf: { eta: 0.38, he11: 0.12 } },
        koffein:     { navn: "koffein", farve: null, uv: true, rf: { eta: 0.15, ee91: 0.45 } },
        ibuprofen:   { navn: "ibuprofen", farve: null, uv: true, rf: { eta: 0.75, he11: 0.52 } },
        naproxen:    { navn: "naproxen", farve: null, uv: true, rf: { eta: 0.75, he11: 0.34 } },
        salicylsyre: { navn: "salicylsyre", farve: null, uv: true, rf: { eta: 0.76, he11: 0.42 } },
        aminofenol:  { navn: "4-aminofenol", farve: null, uv: true, rf: { eta: 0.22, he11: 0.06 } },
        kaffeA:      { navn: "et andet stof i kaffe", farve: null, uv: true, rf: { ee91: 0.10 } },
        kaffeB:      { navn: "et andet stof i kaffe", farve: null, uv: true, rf: { ee91: 0.70 } },
        energi:      { navn: "et andet stof i energidrikken", farve: null, uv: true, rf: { ee91: 0.25 } }
    };
    Object.keys(STOF).forEach(function (id) { STOF[id].id = id; });

    /* =====================================================================
       FANE 1: TOVTRAEKNINGEN
       Pladen har to baner: gulerod og spinat. Delene: gaet, forsoeg (fanen
       melder, naar pladen er loebet), spm (svar, der vaelges og sendes
       ind) og opgave (klik i scenen eller vaelg en flaske og send ind).
       ===================================================================== */
    var SPINAT_BANER = [
        { navn: "gulerod", pletter: [{ stof: "caroten", mgd: 1 }] },
        { navn: "spinat", pletter: [
            { stof: "caroten", mgd: 0.55 }, { stof: "klorofylA", mgd: 1 },
            { stof: "klorofylB", mgd: 0.7 }, { stof: "lutein", mgd: 0.75 }] }
    ];

    var PLADEN = [
        {
            id: "spinat", navn: "Spinat på pladen", loeb: "hp73",
            dele: [
                { slags: "gaet",
                  intro: "På TLC-pladen er der en plet af gulerod og en plet af grønt spinatudtræk. Løbevæsken er heptan og propanon (7 : 3).",
                  tekst: "Hvad sker der med den grønne plet fra spinat?",
                  svar: [{ t: "Den løber op som én grøn plet" }, { t: "Den deles i flere farvede pletter", ok: true }, { t: "Den bliver på startlinjen" }] },
                { slags: "forsoeg", tekst: "Klik på TLC-pladen for at stille den i karret, og se pletterne løbe op.", om: ["plade"],
                  hint: ["Klik på TLC-pladen over karret. Den sænkes ned i løbevæsken, og låget kommer på."],
                  set: "Den grønne plet blev delt i flere farvede pletter." },
                { slags: "spm", tekst: "Hvor mange farvestoffer viser banen med spinat?", om: ["bane:1"],
                  svar: [{ t: "Ét", f: "Tæl pletterne i banen med spinat. Hver farvet plet er et farvestof." },
                         { t: "To", f: "Tæl pletterne i banen med spinat helt fra startlinjen til væskefronten." },
                         { t: "Fire", ok: true }],
                  hint: ["Hver plet i banen med spinat er et farvestof. Tæl dem."],
                  godt: "Spinat indeholder mindst fire farvestoffer. Pladen har skilt den grønne blanding ad." },
                { slags: "spm", tekst: "Gulerod indeholder kun caroten. Hvilken plet i banen med spinat er caroten?", om: ["bane:0", "bane:1"],
                  svar: [{ t: "Den øverste orange plet", ok: true },
                         { t: "Den nederste gule plet", f: "Caroten fra gulerod er løbet næsten op til væskefronten. Find pletten fra spinat i samme højde." },
                         { t: "Den blågrønne plet", f: "Den blågrønne plet er ikke løbet lige så langt som caroten fra gulerod." }],
                  hint: ["Se, hvor langt pletten fra gulerod er løbet. Find pletten fra spinat i samme højde."] }
            ],
            loest: "Den orange plet fra spinat er løbet lige så langt som caroten fra gulerod. Det kan være det samme stof."
        },
        {
            id: "faser", navn: "Stationær og mobil fase", loeb: "hp73", koert: true,
            dele: [
                { slags: "opgave", maal: "plade",
                  tekst: "Den stationære fase står stille. Klik på den stationære fase i karret, og tryk Indsend svar.",
                  hint: ["Den stationære fase er det faste stof, som stofferne vandrer hen over.", "Det er det tynde, hvide lag på TLC-pladen."],
                  godt: "Den stationære fase er laget på TLC-pladen: kiselgel, et hvidt pulver af SiO₂ med OH-grupper på overfladen." },
                { slags: "opgave", maal: "loeb",
                  tekst: "Den mobile fase bevæger sig. Klik på den mobile fase i karret, og tryk Indsend svar.",
                  hint: ["Den mobile fase er den væske, der suges op gennem laget på pladen.", "Det er løbevæsken i bunden af karret."] }
            ],
            loest: "Den mobile fase er løbevæsken. Den suges op gennem laget på pladen og tager stofferne med sig."
        },
        {
            id: "lup", navn: "Hvem holder fast?", loeb: "hp73", koert: true,
            dele: [
                { slags: "spm", om: ["lup"],
                  tekst: "Luppen viser caroten og lutein på pladen. Hvorfor løber lutein kortere end caroten?",
                  svar: [{ t: "Hydrogenbindinger til pladen", ok: true },
                         { t: "Lutein er et tungere molekyle", f: "Lutein og caroten vejer næsten det samme. Se i luppen, hvad luteins OH-grupper gør." },
                         { t: "Lutein opløses bedst i løbevæsken", f: "Et stof, der opløses godt i løbevæsken, følger med og løber langt. Det gør caroten." }],
                  hint: ["Se i luppen, hvilke molekyler der sidder fast på pladen, og hvilke der følger med væsken.", "Lutein har en OH-gruppe i hver ende. Caroten har ingen."] }
            ],
            loest: "Luteins OH-grupper danner hydrogenbindinger til pladens OH-grupper. Lutein sidder fast det meste af tiden og løber kort."
        },
        {
            id: "heptan", navn: "Ren heptan", loeb: "heptan", fra: "hp73",
            dele: [
                { slags: "gaet",
                  intro: "Karret fyldes med ren heptan i stedet for 7 : 3. Heptan er upolær.",
                  tekst: "Hvor ender pletterne fra spinat?",
                  svar: [{ t: "Alle løber længere end før" }, { t: "Caroten løber, resten bliver nede", ok: true }, { t: "Alle bliver på startlinjen" }] },
                { slags: "forsoeg", tekst: "Klik på flasken med heptan, og stil så den nye TLC-plade i karret.", om: ["flaske:heptan", "plade"],
                  hint: ["Klik på flasken med heptan til venstre. Klik så på TLC-pladen over karret."],
                  set: "Caroten løb næsten lige så langt som før. Lutein og klorofyl blev ved startlinjen." },
                { slags: "spm", om: ["bane:1"],
                  tekst: "Hvorfor bliver lutein og klorofyl ved startlinjen, når løbevæsken er ren heptan?",
                  svar: [{ t: "Heptan kan ikke trække dem løs", ok: true },
                         { t: "Heptan løber ikke op ad pladen", f: "Væskefronten nåede toppen. Heptan løb fint, men tog ikke de polære stoffer med." },
                         { t: "Pletterne var for små", f: "Caroten fra den samme plet løb fint. Det er stofferne, der er forskellige." }],
                  hint: ["Heptan er upolær. Lutein og klorofyl er polære og holder fast på den polære plade."] }
            ],
            loest: "Heptan er upolær og sætter sig ikke på pladens OH-grupper. Lutein og klorofyl bliver siddende på den polære plade."
        },
        {
            id: "propanon", navn: "Ren propanon", loeb: "propanon", fra: "hp73",
            dele: [
                { slags: "gaet",
                  intro: "Karret fyldes med ren propanon. Propanon er mere polær end heptan.",
                  tekst: "Hvor ender pletterne fra spinat?",
                  svar: [{ t: "Alle løber næsten op til fronten", ok: true }, { t: "De løber som med 7 : 3" }, { t: "Alle bliver på startlinjen" }] },
                { slags: "forsoeg", tekst: "Klik på flasken med propanon, og stil så den nye TLC-plade i karret.", om: ["flaske:propanon", "plade"],
                  hint: ["Klik på flasken med propanon til venstre. Klik så på TLC-pladen over karret."],
                  set: "Alle fire farvestoffer løb næsten op til væskefronten og blev ikke skilt ad." },
                { slags: "spm", om: ["lup"],
                  tekst: "Luppen viser pladen med propanon. Hvorfor løber lutein langt, når løbevæsken er propanon?",
                  svar: [{ t: "Propanon sidder på OH-grupperne", ok: true },
                         { t: "Propanon gør lutein upolær", f: "Lutein er det samme molekyle med de samme OH-grupper. Se i luppen, hvor propanon sidder." },
                         { t: "Propanon fjerner OH-grupperne", f: "Molekylerne ændrer sig ikke. Se i luppen, hvor propanonmolekylerne sidder." }],
                  hint: ["Se i luppen, hvad der sidder på pladens OH-grupper.", "Propanon har et O-atom, som danner hydrogenbinding til pladens OH-grupper."] }
            ],
            loest: "Propanon er polær og sætter sig selv på pladens OH-grupper. Lutein har færre steder at holde fast og følger med væsken."
        },
        {
            id: "vaelg", navn: "Find den bedste løbevæske", loeb: "heptan", vaelg: true,
            dele: [
                { slags: "opgave", om: ["flasker"],
                  tekst: "Find den løbevæske, der skiller de fire farvestoffer fra spinat bedst ad. Kør en plade, og tryk Indsend svar.",
                  hint: ["Kør en plade med hver løbevæske, og se, hvor de fire pletter fra spinat ender.",
                         "Den bedste løbevæske giver fire pletter, der ikke rører hinanden og ikke ligger ved startlinjen eller fronten."] }
            ],
            fejl: {
                heptan: "Med heptan blev lutein og klorofyl ved startlinjen. Løbevæsken skal være mere polær.",
                hp91: "Med 9 : 1 ligger lutein og klorofyl klumpet sammen lige over startlinjen. Prøv med mere propanon.",
                propanon: "Med propanon ligger alle pletter klumpet sammen ved væskefronten. Løbevæsken er for polær."
            },
            rigtig: "hp73",
            loest: "Med 7 : 3 ligger de fire pletter spredt på pladen. Man prøver sig frem, til pletterne er skilt ad."
        }
    ];

    /* Delene i karret, man kan klikke paa i opgaven Stationær og mobil fase */
    var DELE = {
        laag: { navn: "låget", f: "Låget holder på dampen, så løbevæsken ikke fordamper. Det er ikke en fase." },
        plade: { navn: "TLC-pladen", f: "TLC-pladen står stille. Laget på den er den stationære fase." },
        loeb: { navn: "løbevæsken", f: "Løbevæsken bevæger sig op ad pladen. Den er den mobile fase." },
        start: { navn: "startlinjen", f: "Startlinjen er blyantsstregen, hvor prøverne sættes. Den er ikke en fase." },
        front: { navn: "væskefronten", f: "Væskefronten viser, hvor langt løbevæsken er nået. Den er ikke en fase." },
        pletter: { navn: "pletterne", f: "Pletterne er stofferne, der bliver skilt ad. De er ikke en fase." }
    };

    /* =====================================================================
       FANE 2: RF-VAERDIEN
       Pladerne er toerre og ligger paa bordet med blyantsringe om
       pletterne. z er plettens hoejde over startlinjen i cm, front er
       væskefrontens. nul: hvor linealens 0 staar ("start" eller "kant").
       Delene: felt (tal, der sendes ind), spm og opgave (traek pletten).
       ===================================================================== */
    var RF = [
        {
            id: "en", navn: "Én plet",
            plade: { front: 5.0, nul: "start", pletter: [{ z: 1.9 }] },
            dele: [
                { slags: "felt", id: "front", om: ["front"], stille: true,
                  tekst: "Aflæs på linealen, hvor langt væskefronten er løbet fra startlinjen.",
                  felter: [{ id: "a", foer: "Væskefronten er løbet", efter: "cm", ret: 5.0 }],
                  hint: ["Væskefronten er den øverste blyantsstreg. Linealens 0 er ud for startlinjen.",
                         "Hold musen over pladen. Den gule streg og luppen ved linealen hjælper med at aflæse."],
                  godt: "Væskefronten er løbet 5,0 cm." },
                { slags: "felt", id: "plet", om: ["plet:0"], stille: true,
                  tekst: "Aflæs, hvor langt pletten er løbet fra startlinjen. Mål til midten af pletten.",
                  felter: [{ id: "a", foer: "Pletten er løbet", efter: "cm", ret: 1.9, plet: 0 }],
                  hint: ["Find midten af pletten inde i blyantsringen. Aflæs linealen ud for midten.",
                         "Hold musen over midten af pletten, og aflæs linealen ved den gule streg."],
                  godt: "Pletten er løbet 1,9 cm." },
                { slags: "spm", id: "formel", stille: true,
                  tekst: "Hvordan regnes Rf-værdien for pletten?",
                  svar: [{ t: "plettens afstand / væskefrontens afstand", ok: true, broek: ["plettens afstand", "væskefrontens afstand"] },
                         { t: "væskefrontens afstand / plettens afstand", broek: ["væskefrontens afstand", "plettens afstand"],
                           f: "Så bliver Rf større end 1. Pletten løber aldrig længere end fronten, så plettens afstand står øverst." },
                         { t: "væskefrontens afstand − plettens afstand",
                           f: "Rf er en brøk, ikke en forskel. Den siger, hvor stor en del af frontens vej pletten er løbet." }],
                  hint: ["Rf-værdien siger, hvor stor en del af væskefrontens vej pletten er løbet."],
                  godt: "Rf = plettens afstand / væskefrontens afstand." },
                { slags: "felt", id: "regn", regn: true,
                  tekst: "Sæt tallene ind i brøken, og regn Rf-værdien ud.",
                  felter: [{ id: "t", ret: 1.9 }, { id: "n", ret: 5.0 }, { id: "r", ret: 0.38, rf: true }],
                  hint: ["Plettens afstand står over brøkstregen, og væskefrontens afstand står under.",
                         "Regn 1,9 cm divideret med 5,0 cm, og skriv svaret med to decimaler."] }
            ],
            loest: "Rf-værdien er 0,38. Den har ingen enhed, fordi cm står både over og under brøkstregen og går ud."
        },
        {
            id: "tre", navn: "Tre pletter",
            plade: { front: 5.0, nul: "start", pletter: [{ z: 1.2 }, { z: 2.6 }, { z: 4.3 }], numre: true },
            dele: [
                { slags: "felt", id: "front", om: ["front"], stille: true,
                  tekst: "Aflæs på linealen, hvor langt væskefronten er løbet fra startlinjen.",
                  felter: [{ id: "a", foer: "Væskefronten er løbet", efter: "cm", ret: 5.0 }],
                  hint: ["Væskefronten er den øverste blyantsstreg. Linealens 0 er ud for startlinjen."],
                  godt: "Væskefronten er løbet 5,0 cm." },
                { slags: "felt", id: "rf1", om: ["plet:0"], stille: true,
                  tekst: "Find Rf-værdien for plet 1, den nederste plet.",
                  felter: [{ id: "a", foer: "Plet 1 er løbet", efter: "cm", ret: 1.2, plet: 0 }, { id: "r", foer: "Rf =", ret: 0.24, rf: true }],
                  hint: ["Aflæs linealen ud for midten af plet 1.", "Rf = plettens afstand / væskefrontens afstand. Væskefronten er løbet 5,0 cm."],
                  godt: "Plet 1 har Rf-værdien 0,24." },
                { slags: "felt", id: "rf2", om: ["plet:1"], stille: true,
                  tekst: "Find Rf-værdien for plet 2, den midterste plet.",
                  felter: [{ id: "a", foer: "Plet 2 er løbet", efter: "cm", ret: 2.6, plet: 1 }, { id: "r", foer: "Rf =", ret: 0.52, rf: true }],
                  hint: ["Aflæs linealen ud for midten af plet 2.", "Rf = plettens afstand / væskefrontens afstand. Væskefronten er løbet 5,0 cm."],
                  godt: "Plet 2 har Rf-værdien 0,52." },
                { slags: "felt", id: "rf3", om: ["plet:2"], stille: true,
                  tekst: "Find Rf-værdien for plet 3, den øverste plet.",
                  felter: [{ id: "a", foer: "Plet 3 er løbet", efter: "cm", ret: 4.3, plet: 2 }, { id: "r", foer: "Rf =", ret: 0.86, rf: true }],
                  hint: ["Aflæs linealen ud for midten af plet 3.", "Rf = plettens afstand / væskefrontens afstand. Væskefronten er løbet 5,0 cm."],
                  godt: "Plet 3 har Rf-værdien 0,86." },
                { slags: "spm", om: ["pletter"],
                  tekst: "Hvilken plet kommer fra det stof, der hænger bedst fast på pladen?",
                  svar: [{ t: "Plet 1", ok: true },
                         { t: "Plet 2", f: "Plet 2 er hverken løbet kortest eller længst." },
                         { t: "Plet 3", f: "Plet 3 er løbet længst. Et stof, der hænger fast på pladen, løber kort." }],
                  hint: ["Et stof, der hænger fast på pladen, kommer ikke så langt med løbevæsken."] }
            ],
            loest: "Plet 1 har den laveste Rf-værdi. Stoffet hænger bedst fast på den polære plade og er det mest polære af de tre stoffer."
        },
        {
            id: "kant", navn: "Linealen ved kanten",
            plade: { front: 4.8, nul: "kant", pletter: [{ z: 2.4 }] },
            dele: [
                { slags: "felt", id: "front", om: ["front", "kant"], stille: true,
                  tekst: "Linealens 0 er ud for pladens kant. Hvor langt er væskefronten løbet fra startlinjen?",
                  felter: [{ id: "a", foer: "Væskefronten er løbet", efter: "cm", ret: 4.8, kant: 6.3 }],
                  hint: ["Startlinjen er ikke ud for 0 på linealen. Aflæs både startlinjen og væskefronten.",
                         "Væskefronten er ud for 6,3 cm og startlinjen ud for 1,5 cm. Træk dem fra hinanden."],
                  godt: "Væskefronten er løbet 6,3 cm − 1,5 cm = 4,8 cm fra startlinjen." },
                { slags: "felt", id: "rf", om: ["plet:0"],
                  tekst: "Find Rf-værdien for pletten. Husk at måle fra startlinjen.",
                  felter: [{ id: "a", foer: "Pletten er løbet", efter: "cm", ret: 2.4, kant: 3.9, plet: 0 }, { id: "r", foer: "Rf =", ret: 0.50, rf: true }],
                  hint: ["Aflæs linealen ud for midten af pletten, og træk 1,5 cm fra.",
                         "Pletten er løbet 2,4 cm. Rf = plettens afstand / væskefrontens afstand."] }
            ],
            loest: "Rf-værdien er 0,50. Afstandene måles altid fra startlinjen, fordi det er dér, pletterne starter."
        },
        {
            id: "lang", navn: "Den lange plade",
            plade: { front: 7.5, nul: "start", pletter: [{ z: 3.0, skjult: true }] },
            dele: [
                { slags: "opgave", id: "placer", om: ["bane"],
                  tekst: "Stof X har Rf-værdien 0,40. Væskefronten er løbet 7,5 cm. Træk pletten derhen, hvor stof X ender, og tryk Indsend svar.",
                  ret: 3.0,
                  hint: ["Plettens afstand = Rf · væskefrontens afstand.", "Plettens afstand = 0,40 · 7,5 cm = 3,0 cm. Træk pletten op til 3,0 cm på linealen."],
                  godt: "Stof X ender 0,40 · 7,5 cm = 3,0 cm over startlinjen." },
                { slags: "spm",
                  tekst: "Pletten fra stof X er løbet længere end på en kort plade. Har stof X fået en ny Rf-værdi?",
                  svar: [{ t: "Nej, Rf er stadig 0,40", ok: true },
                         { t: "Ja, Rf er blevet større", f: "Pletten løb længere, men væskefronten løb også længere. Forholdet er det samme." },
                         { t: "Ja, Rf er blevet mindre", f: "Pletten løb 0,40 af væskefrontens vej, præcis som før." }],
                  hint: ["Rf er et forhold mellem to afstande. Begge afstande er blevet længere."] }
            ],
            loest: "Rf-værdien afhænger af pladen og løbevæsken, ikke af hvor langt fronten løber. Derfor kan Rf bruges til at genkende et stof."
        },
        {
            id: "graense", navn: "Kan det være en Rf-værdi?",
            plade: { front: 5.0, nul: "start", pletter: [{ z: 1.9 }] },
            dele: [
                { slags: "spm", multi: true,
                  tekst: "Hvilke af tallene kan være en Rf-værdi? Vælg alle, der passer.",
                  svar: [{ t: "0,45", ok: true },
                         { t: "1,6", f: "En Rf-værdi kan ikke være større end 1. Pletten løber aldrig længere end væskefronten." },
                         { t: "0,90", ok: true },
                         { t: "3,2 cm", f: "En Rf-værdi har ingen enhed. cm står både over og under brøkstregen og går ud." }],
                  mangler: "Der er flere af tallene, der kan være en Rf-værdi.",
                  hint: ["En plet løber aldrig længere end væskefronten.", "En Rf-værdi er et tal mellem 0 og 1 uden enhed."],
                  godt: "En Rf-værdi er et tal mellem 0 og 1 uden enhed." },
                { slags: "spm",
                  tekst: "En elev regner Rf-værdien for en plet ud til 2,6. Hvad har eleven gjort forkert?",
                  svar: [{ t: "Byttet om på de to afstande", ok: true },
                         { t: "Målt fra pladens kant", f: "Måler man begge afstande fra kanten, bliver brøken stadig mindre end 1." },
                         { t: "Glemt enheden", f: "En Rf-værdi har ingen enhed. Tallet 2,6 er for stort uanset enheden." }],
                  hint: ["En Rf-værdi over 1 betyder, at det største tal står over brøkstregen."] }
            ],
            loest: "Eleven har divideret væskefrontens afstand med plettens afstand. Plettens afstand skal stå øverst, så Rf ligger mellem 0 og 1."
        }
    ];

    /* =====================================================================
       FANE 3: LAES PLADEN
       Pladen staar over karret med prøverne paa startlinjen. Eleven stiller
       den i karret, og naar den er loebet, kommer den op paa visningen til
       hoejre (i UV-kassen, hvis stofferne er farveløse). Et forsoeg har trin:
       "koer" (stil pladen i karret) og "uv" (taend UV-lampen).
       ===================================================================== */
    function b(navn, pletter, kort) { return { navn: navn, kort: kort || navn, pletter: pletter }; }
    function p(stof, mgd) { return { stof: stof, mgd: mgd === undefined ? 1 : mgd }; }

    var LAES = [
        {
            id: "linser", navn: "Chokoladelinser", loeb: "farve", uv: false,
            baner: [b("rød linse", [p("roedt")]), b("gul linse", [p("gult")]), b("blå linse", [p("blaat")]),
                    b("grøn linse", [p("gult", 0.8), p("blaat", 0.8)]), b("brun linse", [p("roedt", 0.7), p("gult", 0.7), p("blaat", 0.7)])],
            dele: [
                { slags: "forsoeg", trin: ["koer"], om: ["plade"],
                  tekst: "På pladen er farven fra fem chokoladelinser. Klik på TLC-pladen for at stille den i karret.",
                  hint: ["Klik på TLC-pladen over karret."],
                  set: "Farvestofferne er farvede, så pletterne kan ses uden UV-lampe." },
                { slags: "spm", multi: true, om: ["visning"],
                  tekst: "Hvilke chokoladelinser er farvet med en blanding af farvestoffer? Vælg alle, der passer.",
                  svar: [{ t: "Rød", f: "Banen med den røde linse har én plet. Den er farvet med ét farvestof." },
                         { t: "Gul", f: "Banen med den gule linse har én plet. Den er farvet med ét farvestof." },
                         { t: "Blå", f: "Banen med den blå linse har én plet. Den er farvet med ét farvestof." },
                         { t: "Grøn", ok: true }, { t: "Brun", ok: true }],
                  mangler: "Der er flere linser, hvis bane har mere end én plet.",
                  hint: ["Et rent farvestof giver én plet. En blanding giver flere pletter i samme bane."],
                  godt: "Den grønne og den brune linse giver flere pletter. De er farvet med en blanding." },
                { slags: "spm", multi: true, om: ["bane:4"],
                  tekst: "Hvilke farvestoffer er der i den brune chokoladelinse? Vælg alle, der passer.",
                  svar: [{ t: "Det røde", ok: true }, { t: "Det gule", ok: true }, { t: "Det blå", ok: true },
                         { t: "Et brunt farvestof", f: "Der er ingen brun plet. Den brune farve er en blanding af andre farver." }],
                  mangler: "Banen med den brune linse har tre pletter. Find et farvestof til hver.",
                  hint: ["Sammenlign højden af hver plet fra den brune linse med pletterne fra den røde, gule og blå linse."] }
            ],
            loest: "Den brune linse giver tre pletter i samme højde som det røde, det gule og det blå farvestof. Brun er en blanding af alle tre."
        },
        {
            id: "tablet", navn: "Hovedpinetabletten", loeb: "eta", uv: true,
            baner: [b("acetylsalicylsyre", [p("acetylsalicylsyre")]), b("paracetamol", [p("paracetamol")]),
                    b("koffein", [p("koffein")]), b("hovedpinetablet", [p("acetylsalicylsyre"), p("koffein", 0.6)])],
            dele: [
                { slags: "forsoeg", trin: ["koer"], om: ["plade"],
                  tekst: "På pladen er tre kendte stoffer og en opløst hovedpinetablet. Klik på TLC-pladen for at stille den i karret.",
                  hint: ["Klik på TLC-pladen over karret."] },
                { slags: "spm", om: ["visning"],
                  tekst: "TLC-pladen er tør, men der ses ingen pletter. Hvad skal du gøre?",
                  svar: [{ t: "Se på pladen i UV-lys", ok: true },
                         { t: "Køre pladen en gang til", f: "Stofferne er løbet fint. De er bare farveløse, så pletterne kan ikke ses i dagslys." },
                         { t: "Sætte større pletter", f: "Store pletter flyder sammen. Stofferne er der, men de er farveløse." }],
                  hint: ["De fleste lægemidler er farveløse."],
                  godt: "Laget på pladen lyser grønt i UV-lys. Stoffer med en benzenring absorberer lyset og ses som mørke pletter." },
                { slags: "forsoeg", trin: ["uv"], om: ["lampe"],
                  tekst: "Klik på UV-lampen for at tænde den over TLC-pladen.",
                  hint: ["Klik på UV-lampen i kassen til højre."] },
                { slags: "spm", multi: true, om: ["bane:3"],
                  tekst: "Hvilke stoffer er der i hovedpinetabletten i bane 4? Vælg alle, der passer.",
                  svar: [{ t: "Acetylsalicylsyre", ok: true },
                         { t: "Paracetamol", f: "Bane 4 har ingen plet i samme højde som paracetamol i bane 2." },
                         { t: "Koffein", ok: true }],
                  mangler: "Bane 4 har to pletter. Find et kendt stof til hver af dem.",
                  hint: ["Sammenlign højden af pletterne i bane 4 med pletterne i bane 1, 2 og 3."] }
            ],
            loest: "Bane 4 har en plet i samme højde som acetylsalicylsyre og en i samme højde som koffein. Tabletten indeholder ikke paracetamol."
        },
        {
            id: "reaktion", navn: "Er reaktionen færdig?", loeb: "eta", uv: true,
            baner: [b("salicylsyre", [p("salicylsyre")]),
                    b("efter 5 min", [p("salicylsyre", 0.8), p("acetylsalicylsyre", 0.45)]),
                    b("efter 15 min", [p("salicylsyre", 0.3), p("acetylsalicylsyre", 0.85)]),
                    b("efter 30 min", [p("acetylsalicylsyre")])],
            dele: [
                { slags: "forsoeg", trin: ["koer", "uv"], om: ["plade", "lampe"],
                  tekst: "Salicylsyre reagerer til acetylsalicylsyre. Bane 2, 3 og 4 er prøver efter 5, 15 og 30 minutter. Kør pladen, og tænd UV-lampen.",
                  hint: ["Klik på TLC-pladen over karret. Når pladen er løbet, klikker du på UV-lampen."] },
                { slags: "spm", om: ["bane:1"],
                  tekst: "Bane 1 er salicylsyre. Hvilken plet i bane 2 kommer fra produktet?",
                  svar: [{ t: "Den nederste plet", ok: true },
                         { t: "Den øverste plet", f: "Den øverste plet i bane 2 er i samme højde som salicylsyre i bane 1." }],
                  hint: ["Produktet er et nyt stof. Det giver en plet, som bane 1 ikke har."],
                  godt: "Den nederste plet er ny. Den kommer fra acetylsalicylsyre, som er dannet ved reaktionen." },
                { slags: "spm", om: ["bane:1", "bane:2", "bane:3"],
                  tekst: "Hvornår er reaktionen færdig?",
                  svar: [{ t: "Efter 5 minutter", f: "Bane 2 har stadig en stor plet i samme højde som salicylsyre." },
                         { t: "Efter 15 minutter", f: "Bane 3 har stadig en svag plet i samme højde som salicylsyre." },
                         { t: "Efter 30 minutter", ok: true }],
                  hint: ["Reaktionen er færdig, når pletten fra startstoffet salicylsyre er væk."] }
            ],
            loest: "Efter 30 minutter er pletten fra salicylsyre væk. Al salicylsyre har reageret, og reaktionen er forløbet fuldstændig."
        },
        {
            id: "rent", navn: "Er produktet rent?", loeb: "eta", uv: true,
            baner: [b("4-aminofenol", [p("aminofenol")]), b("paracetamol", [p("paracetamol")]),
                    b("dit produkt", [p("paracetamol"), p("aminofenol", 0.5)]), b("omkrystalliseret", [p("paracetamol")])],
            dele: [
                { slags: "forsoeg", trin: ["koer", "uv"], om: ["plade", "lampe"],
                  tekst: "Paracetamol fremstilles af 4-aminofenol. Bane 3 er dit produkt. Kør pladen, og tænd UV-lampen.",
                  hint: ["Klik på TLC-pladen over karret. Når pladen er løbet, klikker du på UV-lampen."] },
                { slags: "spm", om: ["bane:2"],
                  tekst: "Er dit produkt i bane 3 rent paracetamol?",
                  svar: [{ t: "Ja, en plet er ud for paracetamol", f: "Bane 3 har to pletter. Et rent stof giver kun én plet." },
                         { t: "Nej, der er også 4-aminofenol", ok: true },
                         { t: "Nej, det er slet ikke paracetamol", f: "Den øverste plet i bane 3 er i samme højde som paracetamol i bane 2." }],
                  hint: ["Et rent stof giver én plet. Sammenlign pletterne i bane 3 med bane 1 og 2."],
                  godt: "Den nederste plet i bane 3 er i samme højde som 4-aminofenol. Produktet indeholder rester af startstoffet." },
                { slags: "spm", om: ["bane:3"],
                  tekst: "Bane 4 er produktet, efter det er renset ved omkrystallisation. Hvad viser bane 4?",
                  svar: [{ t: "Produktet er rent nu", ok: true },
                         { t: "Produktet er stadig urent", f: "Bane 4 har kun én plet, og den er i samme højde som paracetamol." },
                         { t: "Paracetamol er forsvundet", f: "Pletten i bane 4 er i samme højde som paracetamol i bane 2." }],
                  hint: ["Tæl pletterne i bane 4."] }
            ],
            loest: "Efter omkrystallisationen giver produktet én plet i samme højde som paracetamol. Pladen viser ingen urenheder."
        },
        {
            id: "pille", navn: "Pillen fra nettet", loeb: "eta", uv: true, loeb2: "he11",
            baner: [b("ibuprofen fra apoteket", [p("ibuprofen")], "ibuprofen"), b("pillen fra nettet", [p("naproxen")], "pillen")],
            dele: [
                { slags: "forsoeg", trin: ["koer", "uv"], om: ["plade", "lampe"],
                  tekst: "En pille fra nettet skulle være ibuprofen. Kør pladen med ethylethanoat, og tænd UV-lampen.",
                  hint: ["Klik på TLC-pladen over karret. Når pladen er løbet, klikker du på UV-lampen."] },
                { slags: "spm", om: ["visning"],
                  tekst: "Pletten fra pillen og pletten fra ibuprofen er løbet lige langt. Er pillen ibuprofen?",
                  svar: [{ t: "Ja, helt sikkert", f: "To forskellige stoffer kan godt løbe lige langt i én løbevæske." },
                         { t: "Måske. Prøv en anden løbevæske", ok: true },
                         { t: "Nej", f: "Pletterne er løbet lige langt, så pillen kan godt være ibuprofen." }],
                  hint: ["Kan to forskellige stoffer løbe lige langt?"],
                  godt: "To stoffer kan løbe lige langt i én løbevæske. Løber de også lige langt i en anden, er det meget sandsynligt det samme stof." },
                { slags: "forsoeg", trin: ["koer"], ny: true, om: ["plade"],
                  tekst: "Karret har nu heptan og ethylethanoat (1 : 1). Klik på den nye TLC-plade for at stille den i karret.",
                  hint: ["Klik på den nye TLC-plade over karret. UV-lampen er stadig tændt."] },
                { slags: "spm", om: ["visning"],
                  tekst: "Hvad viser den nye TLC-plade med heptan og ethylethanoat (1 : 1)?",
                  svar: [{ t: "Pillen er ikke ibuprofen", ok: true },
                         { t: "Pillen er ibuprofen", f: "På den nye plade er pletten fra pillen løbet kortere end ibuprofen." },
                         { t: "Pillen er ikke ren", f: "Pillen giver kun én plet på begge plader." }],
                  hint: ["Sammenlign de to baner på den nye plade."] }
            ],
            loest: "Med den nye løbevæske løber pillen og ibuprofen forskelligt langt. Pillen indeholdt naproxen, et andet smertestillende stof."
        },
        {
            id: "drikke", navn: "Koffein i drikke", loeb: "ee91", uv: true,
            baner: [b("koffein", [p("koffein")]),
                    b("kaffe", [p("kaffeA", 0.7), p("koffein"), p("kaffeB", 0.6)]),
                    b("cola", [p("koffein", 0.3)]),
                    b("energidrik", [p("energi", 0.6), p("koffein", 0.75)]),
                    b("koffeinfri kaffe", [p("kaffeA", 0.7), p("kaffeB", 0.6)], "koffeinfri")],
            dele: [
                { slags: "forsoeg", trin: ["koer", "uv"], om: ["plade", "lampe"],
                  tekst: "Koffeinen er trukket ud af fire drikke. Kør pladen, og tænd UV-lampen.",
                  hint: ["Klik på TLC-pladen over karret. Når pladen er løbet, klikker du på UV-lampen."] },
                { slags: "spm", multi: true, om: ["visning"],
                  tekst: "Hvilke drikke indeholder koffein? Vælg alle, der passer.",
                  svar: [{ t: "Kaffe", ok: true }, { t: "Cola", ok: true }, { t: "Energidrik", ok: true },
                         { t: "Koffeinfri kaffe", f: "Bane 5 med koffeinfri kaffe har ingen plet i samme højde som koffein i bane 1." }],
                  mangler: "Se efter en plet i samme højde som koffein i bane 2 til 5. Også en svag plet tæller.",
                  hint: ["Find de baner, der har en plet i samme højde som koffein i bane 1."],
                  godt: "Kaffe, cola og energidrik har en plet i samme højde som koffein." },
                { slags: "spm", om: ["bane:2"],
                  tekst: "Pletten fra cola er svag. Kan TLC-pladen vise, hvor mange mg koffein der er i cola?",
                  svar: [{ t: "Nej, kun hvilke stoffer der er", ok: true },
                         { t: "Ja, ud fra plettens størrelse", f: "En svag plet tyder på mindre koffein, men TLC viser ikke, hvor meget der er." },
                         { t: "Ja, ud fra Rf-værdien", f: "Rf-værdien siger, hvilket stof det er, ikke hvor meget der er af det." }],
                  hint: ["TLC er en kvalitativ metode."] }
            ],
            loest: "TLC er en kvalitativ metode: den viser, hvilke stoffer der er i en prøve. Hvor meget koffein der er, måles med en kvantitativ metode."
        }
    ];

    /* Naar alle opgaver paa en fane er loest */
    var FAERDIG = {
        p: "Fane 1 er klaret. Fortsæt med Rf-værdien.",
        r: "Fane 2 er klaret. Fortsæt med Læs pladen.",
        l: "Du har læst alle seks TLC-plader."
    };

    /* Fejlene i et felt paa fane 2 (felt.ret er det rigtige tal) */
    var FELTFEJL = {
        tom: "Skriv et tal i feltet.",
        ikkeTal: "Skriv kun et tal, fx 2,5.",
        kant: "Det tal er målt fra pladens kant. Mål fra startlinjen.",
        top: "Du har målt til toppen af pletten. Mål til midten.",
        bund: "Du har målt til bunden af pletten. Mål til midten.",
        front: "Aflæs linealen ud for den øverste blyantsstreg.",
        plet: "Aflæs linealen ud for midten af pletten.",
        omvendt: "Rf kan ikke være større end 1. Plettens afstand står over brøkstregen.",
        rf: "Regn plettens afstand divideret med væskefrontens afstand, og skriv to decimaler.",
        taeller: "Plettens afstand står over brøkstregen.",
        naevner: "Væskefrontens afstand står under brøkstregen.",
        byttet: "Tallene er byttet om. Plettens afstand står over brøkstregen."
    };

    /* Paaskeaegget: tre klik paa startlinjen paa fane 1 */
    var PAASKE = {
        kuglepen: "Startlinjen er nu tegnet med kuglepen. Kør en ny plade, og se, hvad blækket gør.",
        set: "Blækket fra kuglepennen er en blanding af farvestoffer, som løber med op ad pladen. Derfor tegnes startlinjen med blyant."
    };

    NK.Data = {
        LOEB: LOEB,
        FLASKER: FLASKER,
        STOF: STOF,
        SPINAT_BANER: SPINAT_BANER,
        PLADEN: PLADEN,
        DELE: DELE,
        RF: RF,
        LAES: LAES,
        FAERDIG: FAERDIG,
        FELTFEJL: FELTFEJL,
        PAASKE: PAASKE,

        /* Et tal med dansk komma og d decimaler */
        dk: function (v, d) {
            d = d === undefined ? 1 : d;
            return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace(".", ",").replace("-", "−");
        },

        /* Det, eleven har skrevet, som tal (dansk komma, cm og mellemrum er i orden).
           Giver null, naar der ikke staar et tal. */
        tal: function (s) {
            s = String(s || "").trim().replace(/cm$/i, "").replace(/\s+/g, "").replace(",", ".").replace("−", "-");
            if (!s) return null;
            if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
            return parseFloat(s);
        },

        Stort: function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
    };
}());

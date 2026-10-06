/* =====================================================================
   data.js - tallene og alle tekster

   Tallene er figur 8.1 i kapitel 8-alternativ (Befolkningens fordeling
   paa erhverv, pct.), aflaest af den genskabte figur i elevteksten.
   Figuren har tal for seks aar. Raekkefoelgen i TAL foelger AAR.

   Alt, eleven laeser, staar her, saa det kan rettes ét sted.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var AAR = [1940, 1950, 1960, 1970, 1981, 1989];

    /* sektor: p = primaer, s = sekundaer, t = tertiaer, u = uden for sektorerne */
    var ERHVERV = [
        {
            id: "landbrug", navn: "Landbrug mv.", kort: "landbruget", sektor: "p",
            tal: [31.5, 26.7, 19.4, 10.8, 7.6, 5.3],
            daekker: "Landbrug, gartneri, skovbrug og fiskeri.",
            rigtig: "Landbrug, skovbrug og fiskeri skaffer råvarerne.",
            forkert: {
                s: "Landbruget dyrker og høster. Det laver ikke råvarerne om til færdige varer.",
                t: "Landbruget dyrker og høster. Det er hverken handel eller service."
            },
            hint: ["Landbrug mv. dyrker jorden, fælder træer og fanger fisk.", "Korn, mælk, træ og fisk er råvarer."]
        },
        {
            id: "industri", navn: "Håndværk og industri", kort: "håndværk og industri", sektor: "s",
            tal: [22.5, 24.6, 25.5, 24.6, 18.4, 19.3],
            daekker: "Fabrikker og værksteder, fx smede, bagere og tekstilarbejdere.",
            rigtig: "Håndværk og industri forarbejder råvarer til varer.",
            forkert: {
                p: "Håndværk og industri skaffer ikke råvarerne. De får dem udefra.",
                t: "Håndværk og industri laver varerne. De sælger dem ikke videre."
            },
            hint: ["Håndværk og industri får råvarer ind og sender varer ud.", "At lave råvarer om til varer hedder forarbejdning."]
        },
        {
            id: "byggeri", navn: "Bygge- og anlægsvirksomhed", kort: "byggeriet", sektor: "s",
            tal: [6.3, 5.9, 6.7, 8.7, 7.6, 6.5],
            daekker: "Fx murere, tømrere og arbejdere på veje og broer.",
            rigtig: "Byggeriet gør materialer til huse, veje og broer. Det er forarbejdning.",
            forkert: {
                p: "Byggeriet skaffer ikke råvarer. Det bruger mursten, træ og beton.",
                t: "Byggeriet laver noget nyt af materialer: huse, veje og broer."
            },
            hint: ["Byggeriet bruger mursten, træ og beton.", "Et hus er lavet af materialer, ligesom en vare er lavet af råvarer."]
        },
        {
            id: "handel", navn: "Handel og omsætning", kort: "handlen", sektor: "t",
            tal: [10.9, 11.9, 13.3, 13.8, 13.7, 13.5],
            daekker: "Fx købmænd, butikker og grossister.",
            rigtig: "Butikker og grossister sælger varerne videre.",
            forkert: {
                p: "Handlen skaffer ikke råvarer. Den sælger varer videre.",
                s: "Handlen laver ikke varerne. Den sælger dem videre."
            },
            hint: ["Købmanden laver ikke selv det, der står på hylderne.", "Den, der sælger varer videre, hører til handel og service."]
        },
        {
            id: "transport", navn: "Transportvirksomhed", kort: "transporten", sektor: "t",
            tal: [4.9, 5.9, 6.7, 6.7, 6.7, 6.6],
            daekker: "Fx jernbaner, skibsfart, busser og vognmænd.",
            rigtig: "Transport flytter varer og mennesker. Det er service.",
            forkert: {
                p: "Transporten skaffer ikke råvarer. Den flytter varer og mennesker.",
                s: "Transporten laver ikke nye varer. Den flytter varer og mennesker."
            },
            hint: ["Et tog flytter varer og mennesker, men det laver ikke noget nyt.", "At flytte noget for andre er service."]
        },
        {
            id: "administration", navn: "Administration, liberale erhverv", kort: "administrationen", sektor: "t",
            tal: [5.6, 8.0, 9.7, 17.9, 25.5, 38.2],
            daekker: "Fx offentlige kontorer, skoler og sygehuse samt læger og advokater.",
            rigtig: "Kontorer, skoler, sygehuse, læger og advokater leverer service.",
            forkert: {
                p: "Kontorer, skoler og sygehuse skaffer ikke råvarer.",
                s: "Kontorer, skoler og sygehuse laver ikke varer."
            },
            hint: ["Her arbejder fx lærere, sygeplejersker, kontorfolk, læger og advokater.", "De laver ikke varer. De hjælper og betjener andre."]
        },
        {
            id: "service", navn: "Diverse servicevirksomhed", kort: "servicefagene", sektor: "t",
            tal: [14.3, 11.8, 12.9, 12.7, 14.8, 7.6],
            daekker: "Fx hushjælp, frisører og rengøring.",
            rigtig: "Hushjælp, frisører og rengøring betjener kunder.",
            forkert: {
                p: "Hushjælp, frisører og rengøring skaffer ikke råvarer.",
                s: "Hushjælp, frisører og rengøring laver ikke varer. De betjener kunder."
            },
            hint: ["Her arbejder fx hushjælp, frisører og rengøringsfolk.", "Ordet service står i navnet."]
        },
        {
            id: "uoplyst", navn: "Uoplyst", kort: "uoplyst", sektor: "u",
            tal: [1.9, 1.9, 2.8, 2.8, 2.7, 0.6],
            daekker: "Personer, hvor man ikke ved, hvad de levede af. De kan ikke placeres i en sektor."
        }
    ];

    var SEKTORER = [
        { id: "p", navn: "Primær sektor", kort: "den primære sektor", def: "skaffer råvarer" },
        { id: "s", navn: "Sekundær sektor", kort: "den sekundære sektor", def: "forarbejder råvarer til varer" },
        { id: "t", navn: "Tertiær sektor", kort: "den tertiære sektor", def: "handel og service" }
    ];

    /* ----- Opgaverne ----------------------------------------------------
       type "sorter":  erhvervene traekkes ned i sektorerne
       type "gaet":    svarknapper, derefter skal skyderen til et aar
       type "find":    skyderen stilles, og eleven trykker Tjek
       type "vaelg":   svarknapper med forklaring til hvert svar
       {navne} i teksterne udfyldes af js/forloeb.js med modellens tal.
       Starten (to korte linjer og knappen Videre) staar i TEKST.intro.     */
    var OPGAVER = [
        {
            id: "sorter", type: "sorter",
            titel: "Sortér erhvervene i sektorer",
            tekst: "Træk hvert erhverv ned i den sektor, det hører til.",
            start: "Begynd med {navn}: træk rækken ned i en sektor.",
            faerdig: "Alle erhverv er sorteret. Tallet til højre er sektorens sum."
        },
        {
            id: "gaet", type: "gaet",
            titel: "Gæt: landbruget i 1989",
            tekst: "I 1940 hører {l1940} af 100 til landbruget. Gæt, hvor mange det er i 1989.",
            valg: [25, 15, 5],
            maalAar: 1989,
            spoerg: "Hvor mange af de 100 hører til landbruget i 1989?",
            start: "Gæt først. Bagefter trækker du årsskyderen til 1989 og ser svaret.",
            laast: "Gæt først. Så kommer årsskyderen frem.",
            efterGaet: "Træk årsskyderen helt til 1989, og se, om du gættede rigtigt.",
            ramt: "Du gættede rigtigt. I 1989 hører {l1989} af 100 til landbruget.",
            ikkeRamt: "Du gættede {gaet}. I 1989 hører kun {l1989} af 100 til landbruget."
        },
        {
            id: "overhaler", type: "find",
            titel: "Industrien overhaler landbruget",
            tekst: "Find det første år, hvor der er flere i håndværk og industri end i landbruget.",
            start: "Træk i årsskyderen, og tryk Tjek, når du har fundet året.",
            hint: [
                "Se på rækkerne Landbrug mv. og Håndværk og industri. Den længste række har flest personer.",
                "Skiftet sker mellem 1950 og 1960. Træk et år ad gangen med piletasterne."
            ],
            svar: {
                ok: "I {aar} går håndværk og industri forbi landbruget: {a} mod {b}.",
                foer: "I {aar} er landbruget stadig størst: {b} mod {a}.",
                lige: "I {aar} står de lige: {a} mod {b}. Find det første år, hvor industrien er størst.",
                efter: "I {aar} er industrien størst, men det var den også året før. Find det første år."
            },
            forklaring: "I 1960 var industrieksporten for første gang større end landbrugseksporten."
        },
        {
            id: "halvdel", type: "find",
            titel: "Halvdelen i den tertiære sektor",
            tekst: "Find det første år, hvor mere end halvdelen hører til den tertiære sektor.",
            start: "Halvdelen er 50 af 100. Summen står til højre i overskriften Tertiær sektor.",
            hint: [
                "Find det første år, hvor summen i den tertiære sektor er 51 eller mere.",
                "Skiftet sker mellem 1960 og 1970. Træk et år ad gangen med piletasterne."
            ],
            svar: {
                ok: "Fra {aar} hører mere end halvdelen til den tertiære sektor: {a} af 100.",
                foer: "I {aar} er der {a} af 100 i den tertiære sektor. Det er ikke over halvdelen.",
                efter: "I {aar} er der {a} af 100, men året før var det også over halvdelen. Find det første år."
            },
            forklaring: "Væksten ligger især i Administration, liberale erhverv: offentlige kontorer, skoler og sygehuse."
        },
        {
            id: "hvorfor", type: "vaelg",
            titel: "Forklar faldet i landbruget",
            tekst: "Hvorfor kunne landbruget producere mere med færre ansatte?",
            start: "Vælg den forklaring, teksten giver.",
            valg: [
                { tekst: "Maskiner og kunstgødning", rigtig: true,
                  svar: "Maskinerne gjorde karle og piger overflødige, og kunstgødning gav større høst. De søgte arbejde i byerne." },
                { tekst: "Mindre produktion",
                  svar: "Landbruget producerede mere end før, selv om færre arbejdede der." },
                { tekst: "Medlemskabet af EF",
                  svar: "Danmark kom først med i EF i 1973. Vandringen fra landbruget var i gang længe før." }
            ],
            hint: ["Læs afsnittet Fra land til by i teksten. Hvad gjorde karle og piger overflødige?"]
        }
    ];

    var TEKST = {
        /* Starten: figuren alene, foer sektorerne og opgaven kommer frem */
        intro: {
            maerke: "Start",
            tekst: "100 personer viser, hvad befolkningen levede af i 1940.",
            besked: "Hver række er et erhverv. Tallet viser, hvor mange af de 100 der hører til erhvervet.",
            knap: "Videre →"
        },
        usorteret: "Erhvervene i 1940",
        slipHer: "slip her",
        afHundrede: "af 100",
        valgt: "Klik på den sektor, erhvervet hører til.",
        vaelgFoerst: "Vælg først et erhverv i det øverste felt. Træk det ned, eller klik på det.",
        ikkeBaand: "Slip erhvervet over en af de tre sektorer.",
        uoplystFast: "Uoplyst bliver stående. Man ved ikke, hvad de levede af, så de hører ikke til nogen sektor.",
        tjek: "Tjek år {aar}",
        slut: "Alle opgaver er løst. Fra 1940 til 1989 går landbruget fra {l1940} til {l1989} af 100, og den tertiære sektor går fra {t1940} til {t1989}.",
        slutFri: "Træk selv i årsskyderen, og se personerne flytte.",
        fri: "Træk i årsskyderen, eller brug piletasterne.",
        kurveNote: "Kurven viser de år, du har været forbi."
    };

    NK.Data = {
        AAR: AAR,
        ERHVERV: ERHVERV,
        SEKTORER: SEKTORER,
        OPGAVER: OPGAVER,
        TEKST: TEKST,
        FOERSTE: AAR[0],
        SIDSTE: AAR[AAR.length - 1]
    };
}());

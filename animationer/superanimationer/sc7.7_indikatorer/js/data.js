/* =====================================================================
   data.js - indikatorerne, opgaverne og proeverne

   Alt, der kan staa som data, staar her. Farverne og farveskiftene er
   de samme som i Kemibogens figur over fem indikatorer i afsnit 7.3
   (indikatorer() i Kemibogen/vaerktoej/lav_figurer.py): samme
   farvekoder og samme pH, hvor farven skifter.

   En indikator har:
     stop      farven ved en raekke pH-vaerdier; ind imellem blandes der
               lineaert (som gradienten i bogens figur). "#ffffff" er
               farveloes: glasset ser ud som rent vand.
     farver    farvens navn i omraader: { til, navn }, hvor pH <= til.
               Det sidste omraade gaar til uendelig. Navnene ved hele pH
               er de samme som farver_ved() i bogens figur (derfor 7,9 og
               ikke 8 for lakmus: ved pH 8 er lakmus blaa).
     tolk      fane 2: de omraader, eleven vaelger mellem, naar proeven
               har faaet en farve: { fra, til, farve, tekst }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};
    var UEND = 99;

    D.PH_MIN = -1;
    D.PH_MAKS = 15;

    D.INDIKATORER = [
        {
            id: "lakmus", navn: "Lakmus", kort: "lakmus", stor: "Lakmus", gen: "lakmus'",
            stop: [[0, "#d9534f"], [5, "#d9534f"], [8, "#3b6fd9"], [14, "#3b6fd9"]],
            farver: [{ til: 5, navn: "rød" }, { til: 7.9, navn: "violet" }, { til: UEND, navn: "blå" }],
            tolk: [
                { fra: -UEND, til: 5, farve: "rød", tekst: "pH under 5" },
                { fra: 5, til: 8, farve: "violet", tekst: "pH mellem 5 og 8" },
                { fra: 8, til: UEND, farve: "blå", tekst: "pH over 8" }
            ]
        },
        {
            id: "btb", navn: "Bromthymolblåt (BTB)", kort: "BTB", stor: "BTB", gen: "BTB's",
            stop: [[0, "#f2c94c"], [6.0, "#f2c94c"], [6.8, "#5aa469"], [7.6, "#2f6fde"], [14, "#2f6fde"]],
            farver: [{ til: 6, navn: "gul" }, { til: 7.5, navn: "grøn" }, { til: UEND, navn: "blå" }],
            tolk: [
                { fra: -UEND, til: 6, farve: "gul", tekst: "pH under 6" },
                { fra: 6, til: 7.6, farve: "grøn", tekst: "pH mellem 6 og 7,6" },
                { fra: 7.6, til: UEND, farve: "blå", tekst: "pH over 7,6" }
            ]
        },
        {
            id: "thymol", navn: "Thymolblåt", kort: "thymolblåt", stor: "Thymolblåt", gen: "thymolblåts",
            stop: [[0, "#d9534f"], [1.2, "#d9534f"], [2.8, "#f2c94c"], [8.0, "#f2c94c"], [8.8, "#5aa469"], [9.6, "#2f6fde"], [14, "#2f6fde"]],
            farver: [{ til: 1.2, navn: "rød" }, { til: 2.7, navn: "orange" }, { til: 8, navn: "gul" }, { til: 9.5, navn: "grøn" }, { til: UEND, navn: "blå" }],
            tolk: [
                { fra: -UEND, til: 1.2, farve: "rød", tekst: "pH under 1,2" },
                { fra: 1.2, til: 2.8, farve: "orange", tekst: "pH mellem 1,2 og 2,8" },
                { fra: 2.8, til: 8, farve: "gul", tekst: "pH mellem 2,8 og 8" },
                { fra: 8, til: 9.6, farve: "grøn", tekst: "pH mellem 8 og 9,6" },
                { fra: 9.6, til: UEND, farve: "blå", tekst: "pH over 9,6" }
            ]
        },
        {
            id: "phph", navn: "Phenolphthalein", kort: "phenolphthalein", stor: "Phenolphthalein", gen: "phenolphthaleins",
            stop: [[-1, "#e0503a"], [0, "#ffffff"], [8.2, "#ffffff"], [10, "#e84a9c"], [12, "#e84a9c"], [13, "#ffffff"], [14, "#ffffff"]],
            farver: [{ til: -0.01, navn: "rød" }, { til: 8.2, navn: "farveløs" }, { til: 9.5, navn: "svagt lyserød" },
                     { til: 12.5, navn: "lyserød" }, { til: 12.9, navn: "svagt lyserød" }, { til: UEND, navn: "farveløs" }],
            /* Proeverne paa fane 2 ligger mellem pH 2 og 11, saa den roede farve
               under pH 0 og den farveloese over pH 13 er ikke med her */
            tolk: [
                { fra: -UEND, til: 8.2, farve: "farveløs", tekst: "pH under 8,2" },
                { fra: 8.2, til: 10, farve: "svagt lyserød", tekst: "pH mellem 8,2 og 10" },
                { fra: 10, til: UEND, farve: "lyserød", tekst: "pH over 10" }
            ]
        },
        {
            id: "kaal", navn: "Rødkålssaft", kort: "rødkålssaft", stor: "Rødkålssaft", gen: "rødkålssaftens",
            stop: [[0, "#d6336c"], [2.5, "#d6336c"], [6, "#8e4ec6"], [8, "#3b6fd9"], [10.5, "#2e9e4f"], [13, "#e2c12f"], [14, "#e2c12f"]],
            farver: [{ til: 2.5, navn: "rød" }, { til: 4.5, navn: "rødviolet" }, { til: 6.5, navn: "violet" }, { til: 7.5, navn: "blåviolet" },
                     { til: 8.5, navn: "blå" }, { til: 9.5, navn: "blågrøn" }, { til: 11.5, navn: "grøn" }, { til: 12.5, navn: "gulgrøn" },
                     { til: UEND, navn: "gul" }],
            tolk: []
        }
    ];

    /* Rækkefølgen paa farvekortet: som i bogens figur */
    D.KORT_ORDEN = ["lakmus", "btb", "thymol", "phph", "kaal"];

    /* Farvenavnet i bestemt form: "den grønne del" */
    D.BESTEMT = {
        "rød": "røde", "gul": "gule", "grøn": "grønne", "blå": "blå", "violet": "violette", "orange": "orange",
        "farveløs": "farveløse", "svagt lyserød": "svagt lyserøde", "lyserød": "lyserøde"
    };

    /* Vand uden indikator, og den farve et farveloest glas faar */
    D.VAND = "#e4eef5";

    /* =================================================================
       FANE 1: FARVESKIFTET
       Syv glas med kendt pH. Hver opgave er én indikator, der dryppes i
       alle glas. Opgave 1 og 5 begynder med et gaet (gratis), og alle
       ender med ét spoergsmaal, der bedoemmes ved Indsend svar.
       ================================================================= */
    D.GLAS_PH = [0, 2, 4, 6, 8, 10, 12];

    D.SKIFT = [
        {
            ind: "btb",
            /* Glassene med pH 0 og 12 har BTB fra start */
            forud: [0, 12],
            gaet: {
                tekst: "BTB er gul i glasset med pH 0 og blå i glasset med pH 12. Hvilken farve tror du, BTB får i glasset med pH 4?",
                svar: ["gul", "grøn", "blå"], ph: 4, slags: "farve"
            },
            forsoeg: "Dryp BTB i de fem glas i midten. Klik på dråbeflasken eller på knappen.",
            spm: {
                tekst: "Ved hvilken pH skifter BTB farve?",
                svar: ["mellem pH 2 og 4", "mellem pH 6 og 8", "mellem pH 10 og 12"],
                rigtig: [1],
                fejl: [
                    "Glassene med pH 2 og pH 4 er begge gule. Find to glas ved siden af hinanden, der har hver sin farve.",
                    "",
                    "Glassene med pH 10 og pH 12 er begge blå. Find to glas ved siden af hinanden, der har hver sin farve."
                ],
                hint: ["Find de to glas ved siden af hinanden, hvor farven skifter fra gul til blå.",
                       "Glasset med pH 6 er gult, og glasset med pH 8 er blåt."],
                forkl: "BTB er gul op til pH 6 og blå fra pH 7,6. Omkring pH 7 er den grøn. Farven skifter kun ét sted."
            }
        },
        {
            ind: "phph",
            forsoeg: "Phenolphthalein bruges, når man titrerer. Dryp phenolphthalein i de syv glas.",
            spm: {
                tekst: "Phenolphthalein er farveløs i en prøve. Hvad ved du så om prøvens pH?",
                svar: ["Prøven er sur", "Prøven er neutral", "pH er 8 eller lavere"],
                rigtig: [2],
                fejl: [
                    "Phenolphthalein er også farveløs i glasset med pH 8, og det er basisk.",
                    "Phenolphthalein er farveløs i alle glas fra pH 0 til pH 8. Farveløs viser ikke, at prøven er neutral.",
                    ""
                ],
                hint: ["Se på alle de glas, hvor phenolphthalein er farveløs. Hvilken pH har de?",
                       "Glassene med pH 0 til pH 8 er farveløse. Kun glassene med pH 10 og 12 er lyserøde."],
                forkl: "Phenolphthalein er farveløs op til pH 8,2 og lyserød fra pH 10. Farveløs viser kun, at pH er 8 eller lavere."
            }
        },
        {
            ind: "lakmus",
            forsoeg: "Lakmus laves af laver og er en af de ældste indikatorer. Dryp lakmus i de syv glas.",
            spm: {
                tekst: "Lakmus er rød i en prøve. Hvad ved du så om prøvens pH?",
                svar: ["pH er 2", "pH er under 5", "pH er over 8"],
                rigtig: [1],
                fejl: [
                    "Lakmus er også rød i glassene med pH 0 og pH 4. Rød viser ikke et bestemt tal.",
                    "",
                    "Over pH 8 er lakmus blå. Se på glassene med pH 10 og pH 12."
                ],
                hint: ["Se på alle de glas, hvor lakmus er rød. Hvilken pH har de?",
                       "Lakmus er rød i glassene med pH 0, 2 og 4 og violet i glasset med pH 6."],
                forkl: "Lakmus er rød under pH 5, violet mellem pH 5 og 8 og blå over pH 8. Rød viser kun, at pH er under 5."
            }
        },
        {
            ind: "thymol",
            forsoeg: "Dryp thymolblåt i de syv glas, og se godt efter.",
            spm: {
                tekst: "Thymolblåt skifter farve to steder. Vælg begge steder, og tryk Indsend svar.",
                svar: ["omkring pH 2", "omkring pH 5", "omkring pH 9", "omkring pH 12"],
                rigtig: [0, 2],
                fejl: [
                    "",
                    "Glassene med pH 4 og pH 6 er begge gule. Thymolblåt skifter ikke farve dér.",
                    "",
                    "Glassene med pH 10 og pH 12 er begge blå. Thymolblåt skifter ikke farve dér."
                ],
                halv: "Det ene sted er rigtigt. Thymolblåt skifter farve ét sted mere.",
                hint: ["Gå fra glasset med pH 0 mod højre, og stop, hver gang farven skifter.",
                       "Farven skifter fra rød over orange til gul og senere fra gul til blå."],
                forkl: "Thymolblåt er rød under pH 1,2, gul fra pH 2,8 til 8 og blå over pH 9,6. Den skifter farve to gange."
            }
        },
        {
            ind: "kaal",
            gaet: {
                tekst: "Rødkålssaft er saften fra kogt rødkål. Hvor mange forskellige farver tror du, den får i de syv glas?",
                svar: ["1 farve", "2 farver", "5 eller flere"], slags: "antal"
            },
            forsoeg: "Dryp rødkålssaft i de syv glas.",
            spm: {
                tekst: "Rødkålssaft er grøn i en prøve. Hvad ved du så om prøvens pH?",
                svar: ["pH er under 7", "pH er omkring 10", "pH er over 13"],
                rigtig: [1],
                fejl: [
                    "Under pH 7 er rødkålssaft rød eller violet. Se på glassene med pH 0 til 6.",
                    "",
                    "Ved pH 13 er rødkålssaft gul. Se på enden af rødkålssaftens bjælke på farvekortet."
                ],
                hint: ["Find det glas, hvor rødkålssaft er grøn. Hvilken pH står under glasset?",
                       "Rødkålssaft er grøn i glasset med pH 10."],
                forkl: "Rødkålssaft skifter farve mange gange. Grøn er den kun omkring pH 10, så én farve giver pH ret præcist."
            }
        }
    ];

    D.SKIFT_FAERDIG = "Alle fem indikatorer står på farvekortet.";

    /* =================================================================
       FANE 2: DEN UKENDTE PROEVE
       Hverdagsting med deres pH. Vaerdierne er de samme som i sc7.2
       (pH-skalaen), undtagen saebevand (9,0 her, 9,5 i sc7.2) og
       maskinopvask, som ikke er i sc7.2. Ingen af dem ligger naermere
       end 0,3 fra et sted, hvor en indikator skifter farve, saa farven
       i glasset er tydelig.
       ================================================================= */
    D.TING = {
        citron: { navn: "citronsaft", stor: "Citronsaft", ph: 2.3 },
        oel: { navn: "øl", stor: "Øl", ph: 4.5 },
        maelk: { navn: "mælk", stor: "Mælk", ph: 6.7 },
        saebe: { navn: "sæbevand", stor: "Sæbevand", ph: 9.0 },
        opvask: { navn: "maskinopvask", stor: "Maskinopvask", ph: 11.0 }
    };

    /* De fire indikatorer, der kan bruges paa fane 2 (raekkefoelgen paa kortet) */
    D.PROEVE_IND = ["lakmus", "btb", "thymol", "phph"];

    D.RUNDER = [
        { bogstav: "A", ting: ["citron", "maelk", "opvask"], hemmelig: "maelk" },
        { bogstav: "B", ting: ["oel", "maelk", "opvask"], hemmelig: "opvask" },
        { bogstav: "C", ting: ["citron", "oel", "opvask"], hemmelig: "citron" },
        { bogstav: "D", ting: ["maelk", "saebe", "opvask"], hemmelig: "saebe" },
        { bogstav: "E", ting: ["citron", "oel", "maelk", "saebe"], hemmelig: "oel" }
    ];

    D.PROEVE_FAERDIG = "Alle fem prøver er fundet.";

    /* ----- Smaa hjaelpere ---------------------------------------------------- */
    D.UEND = UEND;

    D.ind = function (id) {
        for (var i = 0; i < D.INDIKATORER.length; i++) if (D.INDIKATORER[i].id === id) return D.INDIKATORER[i];
        return null;
    };

    /* Et tal med dansk komma og hoejst én decimal: 6.7 -> "6,7", 11 -> "11" */
    D.tal = function (v) {
        var r = Math.round(v * 10) / 10;
        return (r < 0 ? "−" : "") + String(Math.abs(r)).replace(".", ",");
    };

    D.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* "a, b og c" */
    D.liste = function (ord) {
        if (ord.length <= 1) return ord.join("");
        return ord.slice(0, -1).join(", ") + " og " + ord[ord.length - 1];
    };

    /* "a, b eller c" */
    D.listeEller = function (ord) {
        if (ord.length <= 1) return ord.join("");
        return ord.slice(0, -1).join(", ") + " eller " + ord[ord.length - 1];
    };

    /* Saenkede tal som HTML (<sub>), som er lettere at laese end tegnene ₀-₉ */
    var SAENKET = "₀₁₂₃₄₅₆₇₈₉";
    D.sub = function (html) {
        return String(html).replace(/[₀-₉]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET.indexOf(c); }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());

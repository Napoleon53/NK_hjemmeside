/* =====================================================================
   data.js - tallene og teksterne i sc5.12 Hvor meget er et mol?

   Alt, eleven kan laese, staar her. Kemien er tal, ikke kode: et gaet
   er én ting (et ark, en draabe, et molekyle) med sin stoerrelse, og
   1 mol af tingen er stoerrelsen ganget med 6,02 · 10²³. Stigen tegner
   tierpotenserne, og turen op ad den er altid lige lang: 23,8
   tierpotenser, fra 1 stk. til 1 mol.

   STIGER   de tre stiger (laengde i m, rumfang i m³, tid i s) med de
            kendte ting, der staar paa dem (vaerdi, tekst og ikon)
   GAET     fane 1: otte gaet med fire svar hver, sorteret fra mindst til
            stoerst. ret er det rigtige svar. Det rigtige svar er ikke
            altid det stoerste (det var brugerens krav). Kun ting, man kan
            forholde sig til (brugeren 23. okt. 2026: diamanten,
            vandmolekylerne og luften var kedelige og umulige at gaette paa;
            de er afloest af vingummibamserne og sandet).
   OPGAVER  fane 2: seks opgaver, hvor mol bruges som et antal. De
            forkerte svar er de fejl, elever laver (divideret i stedet
            for ganget, ganget potensen, kun tallet foran potensen).
            Tallene har kun de cifre, der er noedvendige (brugeren 23. okt.
            2026: eleverne er daarlige til at regne): 1,8 · 10²⁴, 2 mol,
            0,5 mol. Kun 6,02 · 10²³ har tre cifre, som i bogen.

   Kilder og overslag staar i mappens README. Selvtesten regner hvert
   gaet efter: det rigtige svar skal vaere det, der ligger naermest
   1 mol af tingen paa stigen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var NA = 6.02e23;

    /* ----- Stigerne -------------------------------------------------------
       v er i stigens enhed. vis er teksten under navnet. */
    var STIGER = {
        laengde: {
            enhed: "m",
            maerker: [
                { n: "Et carbonatom", v: 1.5e-10, vis: "0,15 nm bredt", i: "atom" },
                { n: "Et virus", v: 1e-7, vis: "0,1 µm bredt", i: "virus" },
                { n: "En bakterie", v: 2e-6, vis: "2 µm lang", i: "bakterie" },
                { n: "Et ark papir", v: 1e-4, vis: "0,1 mm tykt", i: "ark" },
                { n: "Et menneske", v: 1.7, vis: "1,7 m", i: "menneske" },
                { n: "Rundetårn", v: 35, vis: "35 m", i: "taarn" },
                { n: "Mount Everest", v: 8849, vis: "8,8 km", i: "bjerg" },
                { n: "Rumstationen ISS", v: 4.2e5, vis: "420 km oppe", i: "iss" },
                { n: "Månen", v: 3.84e8, vis: "384 000 km væk", i: "maane" },
                { n: "Solen", v: 1.5e11, vis: "150 mio. km væk", i: "sol" },
                { n: "Pluto", v: 5.9e12, vis: "5,9 mia. km væk", i: "pluto" },
                { n: "Nærmeste stjerne", v: 4.0e16, vis: "4,2 lysår væk", i: "stjerne" },
                { n: "Mælkevejens midte", v: 2.5e20, vis: "26 000 lysår væk", i: "galakse" },
                { n: "Andromedagalaksen", v: 2.4e22, vis: "2,5 mio. lysår væk", i: "andromeda" }
            ]
        },
        rumfang: {
            enhed: "m³",
            maerker: [
                { n: "Et carbonatom", v: 5.7e-30, vis: "i en diamant", i: "atom" },
                { n: "Et vandmolekyle", v: 3.0e-29, vis: "H₂O", i: "h2o" },
                { n: "Et virus", v: 5e-22, vis: "0,1 µm bredt", i: "virus" },
                { n: "En bakterie", v: 1e-18, vis: "1 µm³", i: "bakterie" },
                { n: "Et sandkorn", v: 1e-10, vis: "0,1 mm³", i: "sandkorn" },
                { n: "En dråbe", v: 5e-8, vis: "0,05 mL", i: "draabe" },
                { n: "En vingummibamse", v: 2e-6, vis: "2 cm³", i: "bamse" },
                { n: "En spilleterning", v: 4.1e-6, vis: "4 cm³", i: "terning" },
                { n: "En spiseskefuld", v: 1.5e-5, vis: "15 mL", i: "ske" },
                { n: "En fodbold", v: 5.6e-3, vis: "5,6 L", i: "fodbold" },
                { n: "En badebold", v: 2.4e-2, vis: "24 L", i: "badebold" },
                { n: "Et badekar", v: 0.2, vis: "200 L", i: "badekar" },
                { n: "En sandkasse", v: 1, vis: "1 m³", i: "sandkasse" },
                { n: "Et klasselokale", v: 200, vis: "200 m³", i: "klasse" },
                { n: "Et svømmebassin", v: 2500, vis: "50 m langt", i: "bassin" },
                { n: "En zeppeliner", v: 2e5, vis: "200 000 m³", i: "zeppeliner" },
                { n: "Esrum Sø", v: 2.3e8, vis: "0,23 km³", i: "soe" },
                { n: "Danmark dækket 1 m højt", v: 4.3e10, vis: "43 km³", i: "dannebrog" },
                { n: "Østersøen", v: 2.17e13, vis: "21 700 km³", i: "hav" },
                { n: "Middelhavet", v: 3.75e15, vis: "3,8 mio. km³", i: "hav" },
                { n: "Alle verdenshave", v: 1.335e18, vis: "1,3 mia. km³", i: "verdenshav" },
                { n: "Månen", v: 2.19e19, vis: "2,2 · 10¹⁹ m³", i: "maane" },
                { n: "Jorden", v: 1.08e21, vis: "1,1 · 10²¹ m³", i: "jord" },
                { n: "Solen", v: 1.41e27, vis: "1,4 · 10²⁷ m³", i: "sol" }
            ]
        },
        tid: {
            enhed: "s",
            maerker: [
                { n: "Et sekund", v: 1, vis: "1 s", i: "stopur" },
                { n: "En time", v: 3600, vis: "3600 s", i: "ur" },
                { n: "Et døgn", v: 86400, vis: "86 400 s", i: "doegn" },
                { n: "Et år", v: 3.16e7, vis: "3,2 · 10⁷ s", i: "kalender" },
                { n: "Et menneskeliv", v: 2.5e9, vis: "80 år", i: "menneske" },
                { n: "Vikingetiden", v: 3.8e10, vis: "1200 år siden", i: "vikingeskib" },
                { n: "Pyramiderne", v: 1.4e11, vis: "4500 år siden", i: "pyramide" },
                { n: "Dinosaurerne uddør", v: 2.1e15, vis: "66 mio. år siden", i: "dino" },
                { n: "Jorden bliver dannet", v: 1.4e17, vis: "4,5 mia. år siden", i: "jord" },
                { n: "Universet begynder", v: 4.35e17, vis: "13,8 mia. år siden", i: "bigbang" }
            ]
        }
    };

    /* ----- Fane 1: gaettene -----------------------------------------------
       en      stoerrelsen af ét stk. i stigens enhed
       et      teksten ved bunden af soejlen (1 ark)
       ting    ordet for tingene i taelleren (Antal ark: …)
       fyld    hvordan soejlen ser ud (js/stige.js)
       svar    fire svar fra mindst til stoerst, v er stedet paa stigen
       ret     det rigtige svar (fra 0)
       hint    det, eleven kan regne et overslag med
       forkl   forklaringen paa det groenne (eller blaa) kort */
    var GAET = [
        {
            id: "papir", et: "1 ark", titel: "Papirstakken", stige: "laengde", en: 1e-4,
            ting: "ark", fyld: "papir", top: "ark",
            intro: "Ét ark A4-papir er 0,1 mm tykt.",
            spm: "Vi stabler 1 mol papirark. Hvor høj bliver stakken?",
            svar: [
                { t: "Op til loftet", v: 2.5 },
                { t: "Ud til Månen", v: 3.84e8 },
                { t: "Ud til Solen", v: 1.5e11 },
                { t: "Langt ud i Mælkevejen", v: 6.02e19 }
            ],
            ret: 3,
            hint: "500 ark er 5 cm høje. Månen er 3,8 · 10⁸ m væk, og et lysår er 9,5 · 10¹⁵ m.",
            forkl: "1 mol ark à 0,1 mm giver en stak på 6 · 10¹⁹ m. Lyset er 6400 år om at nå toppen."
        },
        {
            id: "bamser", et: "1 vingummibamse", titel: "Vingummibamserne", stige: "rumfang", en: 2e-6,
            ting: "vingummibamser", fyld: "slik", top: "bamse",
            intro: "En vingummibamse fylder ca. 2 cm³.",
            spm: "Vi samler 1 mol vingummibamser. Hvor meget slik bliver det?",
            svar: [
                { t: "En fyldt slikbutik", v: 300 },
                { t: "Esrum Sø fuld af slik", v: 2.3e8 },
                { t: "Alle verdenshave", v: 1.2e18 },
                { t: "Hele Jorden", v: 1.08e21 }
            ],
            ret: 2,
            hint: "2 cm³ er 2 · 10⁻⁶ m³. Alle verdenshave rummer 1,3 · 10¹⁸ m³.",
            forkl: "1 mol vingummibamser fylder 1,2 · 10¹⁸ m³, næsten lige så meget som alle verdenshave. Det er ca. 170 millioner tons slik til hvert menneske."
        },
        {
            id: "taelle", et: "1 sekund", titel: "Tæl til 1 mol", stige: "tid", en: 1,
            ting: "sekunder", fyld: "tid", top: "timeglas",
            intro: "Du tæller ét tal i sekundet, dag og nat, uden pause.",
            spm: "Hvor lang tid tager det at tælle til 1 mol?",
            svar: [
                { t: "Et menneskeliv", v: 2.5e9 },
                { t: "Universets alder", v: 4.35e17 },
                { t: "En million gange universets alder", v: 6.02e23 },
                { t: "En billion gange universets alder", v: 4.35e29 }
            ],
            ret: 2,
            hint: "Et år har ca. 3 · 10⁷ sekunder. Universet er 1,4 · 10¹⁰ år gammelt.",
            forkl: "1 mol sekunder er 1,9 · 10¹⁶ år. Universet er 1,4 · 10¹⁰ år gammelt, så du skal tælle mere end en million gange universets alder."
        },
        {
            id: "sand", et: "1 sandkorn", titel: "Sandet", stige: "rumfang", en: 1e-10,
            ting: "sandkorn", fyld: "sand", top: "sandkorn",
            intro: "Et sandkorn fylder ca. 0,1 mm³.",
            spm: "Vi samler 1 mol sandkorn. Hvor meget sand bliver det?",
            svar: [
                { t: "En sandkasse", v: 1 },
                { t: "Danmark dækket 1 km højt", v: 4.3e13 },
                { t: "Alle verdenshave", v: 1.335e18 },
                { t: "Hele Jorden", v: 1.08e21 }
            ],
            ret: 1,
            hint: "0,1 mm³ er 10⁻¹⁰ m³. Danmark har et areal på 4,3 · 10¹⁰ m².",
            forkl: "1 mol sandkorn fylder 6 · 10¹³ m³. Det kan dække hele Danmark med 1,4 km sand, 8 gange så højt som Møllehøj."
        },
        {
            id: "draaber", et: "1 dråbe", titel: "Vanddråberne", stige: "rumfang", en: 5e-8,
            ting: "dråber", fyld: "vand", top: "draabe",
            intro: "En dråbe vand fylder 0,05 mL.",
            spm: "Vi samler 1 mol vanddråber. Hvor meget vand bliver det?",
            svar: [
                { t: "Østersøen", v: 2.17e13 },
                { t: "Middelhavet 8 gange", v: 3.01e16 },
                { t: "Alle verdenshave", v: 1.335e18 },
                { t: "Alle verdenshave 100 gange", v: 1.335e20 }
            ],
            ret: 1,
            hint: "1 m³ vand er 20 millioner dråber. Middelhavet rummer 3,8 · 10¹⁵ m³.",
            forkl: "1 mol dråber er 3 · 10¹⁶ m³ vand. Det er nok til at fylde Middelhavet 8 gange, eller 2 % af alle verdenshave."
        },
        {
            id: "raekke", et: "1 carbonatom", titel: "Atomer på række", stige: "laengde", en: 1.54e-10,
            ting: "carbonatomer", fyld: "kulstof", top: "atom",
            intro: "Et carbonatom er 0,15 nm bredt. Atomerne lægges på én lang række.",
            spm: "Hvor lang bliver en række af 1 mol carbonatomer?",
            svar: [
                { t: "1 meter", v: 1 },
                { t: "Ud til Månen", v: 3.84e8 },
                { t: "Ud forbi Pluto", v: 9.27e13 },
                { t: "Til den nærmeste stjerne", v: 4.0e16 }
            ],
            ret: 2,
            hint: "0,15 nm er 1,5 · 10⁻¹⁰ m. Pluto er 5,9 · 10¹² m væk.",
            forkl: "1 mol carbonatomer på række bliver 9 · 10¹³ m lang, 15 gange så langt som til Pluto. Og atomerne vejer kun 12 g."
        },
        {
            id: "fodbolde", et: "1 fodbold", titel: "Fodboldene", stige: "rumfang", en: 5.6e-3,
            ting: "fodbolde", fyld: "fodbold", top: "fodbold",
            intro: "En fodbold fylder 5,6 L.",
            spm: "Hvor meget fylder 1 mol fodbolde?",
            svar: [
                { t: "Et fodboldstadion", v: 1e6 },
                { t: "Danmark dækket 1 m højt", v: 4.3e10 },
                { t: "Månen", v: 2.19e19 },
                { t: "Tre jordkloder", v: 3.37e21 }
            ],
            ret: 3,
            hint: "5,6 L er 5,6 · 10⁻³ m³. Jorden fylder 1,1 · 10²¹ m³.",
            forkl: "1 mol fodbolde fylder 3,4 · 10²¹ m³. Det er tre gange så meget som hele Jorden."
        },
        {
            id: "muldvarpe", et: "1 muldvarp", titel: "Muldvarpene", stige: "rumfang", en: 1e-4,
            ting: "muldvarpe", fyld: "muldvarp", top: "muldvarp",
            intro: "På engelsk hedder både mol og muldvarp mole. En muldvarp fylder 0,1 L.",
            spm: "Vi samler 1 mol muldvarpe i én stor klump. Hvor stor bliver klumpen?",
            svar: [
                { t: "Et svømmebassin", v: 2500 },
                { t: "Esrum Sø", v: 2.3e8 },
                { t: "Større end Månen", v: 6.02e19 },
                { t: "Større end Jorden", v: 3e21 }
            ],
            ret: 2,
            hint: "0,1 L er 10⁻⁴ m³. Månen fylder 2,2 · 10¹⁹ m³.",
            forkl: "1 mol muldvarpe fylder 6 · 10¹⁹ m³, næsten tre gange så meget som Månen. Godt, at mol mest bruges om atomer."
        }
    ];

    /* Titlerne efter antal rigtige gaet (fjollede med vilje) */
    var TITLER = [
        { fra: 0, t: "Mol-lærling" },
        { fra: 3, t: "Moltæller" },
        { fra: 5, t: "Molekspert" },
        { fra: 7, t: "Molmester" },
        { fra: 8, t: "Avogadros arving" }
    ];

    /* ----- Fane 2: mol som et antal -----------------------------------------
       scene   det, laerredet viser (js/sim_tael.js)
       svar    fire svar i den raekkefoelge, de staar paa kortet. ok er det
               rigtige; f er forklaringen til et forkert svar
       hint    et eller to hint, saa Vis svaret */
    var OPGAVER = [
        {
            id: "dusin", titel: "3 dusin æg", scene: "bakker", antal: 3,
            spm: "En bakke med 1 dusin æg har 12 æg. Hvor mange æg er der i 3 dusin?",
            svar: [
                { t: "4 æg", f: "Du har divideret 12 med 3. Der er 3 bakker med 12 æg i hver, så gang." },
                { t: "36 æg", ok: true },
                { t: "15 æg", f: "Du har lagt 3 og 12 sammen. Der er 3 bakker med 12 æg i hver, så gang." },
                { t: "312 æg", f: "Du har skrevet 3 og 12 efter hinanden. Gang i stedet: 3 · 12." }
            ],
            hint: ["Der er 3 bakker, og hver bakke har 12 æg."],
            forkl: "3 dusin er 3 · 12 = 36 æg. Et mol bruges på samme måde, bare med 6,02 · 10²³ i stedet for 12."
        },
        {
            id: "molaeg", titel: "3 mol æg", scene: "saekke", antal: 3,
            spm: "1 mol æg er 6,02 · 10²³ æg. Hvor mange æg er der i 3 mol æg?",
            svar: [
                { t: "6,0 · 10²³ æg", f: "Det er antallet af æg i 1 mol æg. Der er 3 mol, så gang med 3." },
                { t: "2,0 · 10²³ æg", f: "Du har divideret med 3. 3 mol æg er flere æg end 1 mol, så gang med 3." },
                { t: "6,0 · 10⁶⁹ æg", f: "Du har ganget potensen med 3. Gang i stedet tallet foran potensen med 3." },
                { t: "1,8 · 10²⁴ æg", ok: true }
            ],
            hint: ["Regn som med dusin: antal æg = 3 · 6,02 · 10²³."],
            forkl: "3 · 6,02 · 10²³ = 18 · 10²³ = 1,8 · 10²⁴ æg. Kommaet flytter én plads, og potensen bliver én større."
        },
        {
            id: "vand", titel: "Fra antal til mol", scene: "bunke", antal: 1.2e24, n: 2, ting: "H₂O",
            spm: "Hvor mange mol er 1,2 · 10²⁴ vandmolekyler?",
            svar: [
                { t: "0,5 mol", f: "Du har divideret 6,02 · 10²³ med antallet. Divider antallet af molekyler med 6,02 · 10²³." },
                { t: "2 mol", ok: true },
                { t: "1,2 mol", f: "Du har kun taget tallet foran potensen. Divider hele antallet med 6,02 · 10²³." },
                { t: "7,2 · 10⁴⁷ mol", f: "Du har ganget med 6,02 · 10²³. Divider i stedet, for molekylerne skal deles i portioner på 1 mol." }
            ],
            hint: ["Del vandmolekylerne i sække med 6,02 · 10²³ i hver. Hvor mange sække bliver fulde?", "n = antal / 6,02 · 10²³"],
            forkl: "n = 1,2 · 10²⁴ / 6,02 · 10²³ = 2 mol. Vandmolekylerne fylder 2 sække med 1 mol i hver."
        },
        {
            id: "halv", titel: "Under 1 mol", scene: "bunke", antal: 3e23, n: 0.5, ting: "C",
            spm: "Hvor mange mol er 3 · 10²³ carbonatomer?",
            svar: [
                { t: "2 mol", f: "Du har divideret 6,02 · 10²³ med antallet. Der er færre carbonatomer end i 1 mol, så svaret er under 1." },
                { t: "3 mol", f: "Du har kun taget tallet foran potensen. Divider hele antallet med 6,02 · 10²³." },
                { t: "0,5 mol", ok: true },
                { t: "1,8 · 10⁴⁷ mol", f: "Du har ganget med 6,02 · 10²³. Divider i stedet, for atomerne skal deles i portioner på 1 mol." }
            ],
            hint: ["3 · 10²³ er cirka halvt så mange som 6,02 · 10²³.", "n = antal / 6,02 · 10²³"],
            forkl: "n = 3 · 10²³ / 6,02 · 10²³ = 0,5 mol. Carbonatomerne fylder en halv sæk."
        },
        {
            id: "h2o", titel: "Atomer i molekyler", scene: "split",
            spm: "Et H₂O-molekyle har 2 H-atomer. Hvor mange mol H-atomer er der i 1 mol H₂O?",
            svar: [
                { t: "2 mol", ok: true },
                { t: "1 mol", f: "1 mol er antallet af O-atomer i 1 mol H₂O. Hvert H₂O-molekyle har 2 H-atomer." },
                { t: "3 mol", f: "3 mol er alle atomerne i 1 mol H₂O, både H og O. Kortet spørger kun om H-atomerne." },
                { t: "0,5 mol", f: "Hvert H₂O-molekyle har 2 H-atomer, så der er flere H-atomer end molekyler." }
            ],
            hint: ["1 H₂O-molekyle har 2 H-atomer. Så har 1 dusin H₂O-molekyler 2 dusin H-atomer."],
            forkl: "Hvert H₂O-molekyle har 2 H-atomer og 1 O-atom. Så har 1 mol H₂O 2 mol H-atomer og 1 mol O-atomer."
        },
        {
            id: "mennesker", titel: "Mol mennesker", scene: "mennesker",
            spm: "Der er ca. 8 · 10⁹ mennesker på Jorden. Hvor mange mol mennesker er det?",
            svar: [
                { t: "1 mol", f: "1 mol er 6,02 · 10²³ stk. Der er langt færre mennesker end det, så svaret er under 1 mol." },
                { t: "8 · 10⁹ mol", f: "8 · 10⁹ er antallet af mennesker, ikke antal mol. Divider med 6,02 · 10²³." },
                { t: "1 · 10⁻¹⁴ mol", ok: true },
                { t: "5 · 10³³ mol", f: "Du har ganget med 6,02 · 10²³. Divider i stedet, for menneskene skal deles i portioner på 1 mol." }
            ],
            hint: ["n = antal / 6,02 · 10²³. Der er langt færre end 1 mol mennesker."],
            forkl: "n = 8 · 10⁹ / 6,02 · 10²³ = 1 · 10⁻¹⁴ mol. Mol er alt for stort til mennesker. Det er lavet til atomer og molekyler."
        }
    ];

    /* Faerdig-teksterne efter den sidste opgave */
    var FAERDIG = {
        g: "1 mol af ting fra hverdagen er ufatteligt meget. 1 mol atomer eller molekyler kan du holde i hånden.",
        t: "Alle seks opgaver er løst. Et mol er et antal ligesom et dusin: 1 mol er 6,02 · 10²³ stk."
    };

    NK.Data = {
        NA: NA,
        STIGER: STIGER,
        GAET: GAET,
        TITLER: TITLER,
        OPGAVER: OPGAVER,
        FAERDIG: FAERDIG,
        /* Hele tallet skrevet ud, som det staar i panelet */
        MOL_LANG: "602 000 000 000 000 000 000 000"
    };
}());

/* =====================================================================
   data.js - luftreguleringen, opgaverne og teksterne

   Et maal (opgave) har sine dele i raekkefoelge i listen dele (se
   js/fane.js). En del er et forsoeg (type "forsoeg": eleven goer noget i
   scenen, evt. med Indsend svar) eller et spoergsmaal (type "spm", evt.
   med flere rigtige svar: flere: true). Hver del har tekst, hint og evt.
   om: det, delen handler om, som faar en rolig gul ring i scenen
   ("braender", "ske", "luft", "lup", "tavle").

   Fane 1 (Braenderen) er skrevet her. Fane 2 (Afstem) bygges af
   forbraendingerne i D.A_REAKTIONER: trinnene C, H og O (og et
   spoergsmaal om hele tal, naar O₂ faar et halvt tal) regnes af formlen,
   saa teksterne altid passer med skemaet.

   Graenser, som selvtesten taeller: et spoergsmaal 105, et svar 34, et
   forsoeg 95, et hint 100, forklaringen til et forkert svar 110 og til
   det rigtige 160.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Luftreguleringen ---------------------------------------------------------------
       Fem trin fra lukket til helt aaben. gul: hvor meget af flammen der er
       gul (1 = hele flammen, 0 = ingen gul spids). sod: hvor hurtigt skeen
       bliver sort. kul: det, carbonatomerne bliver til i luppens fem pladser
       til carbon (CO₂, CO, sod eller ingenting). Luppen har desuden altid
       otte vandmolekyler. Den blaa flamme soder ikke fra trin 3. Pladserne
       aendres saa lidt som muligt fra trin til trin, saa luppen ikke
       blafrer, naar luften stilles. */
    D.LUFT = [
        { navn: "lukket", gul: 1, sod: 1, kul: ["CO2", "CO", "sod", "CO", "sod"] },
        { navn: "lidt åben", gul: 0.78, sod: 0.75, kul: ["CO2", "CO", "sod", "CO2", "sod"] },
        { navn: "halvt åben", gul: 0.4, sod: 0.4, kul: ["CO2", "CO", "sod", "CO2", "CO2"] },
        { navn: "næsten åben", gul: 0, sod: 0, kul: ["CO2", "CO2", null, "CO2", "CO2"] },
        { navn: "helt åben", gul: 0, sod: 0, kul: ["CO2", "CO2", null, "CO2", "CO2"] }
    ];
    D.VAND = 8;
    D.BLAA_FRA = 3;          /* fra dette trin soder flammen ikke */

    /* Det, luppen viser ved luftreguleringen pos: antal af hver slags */
    D.iLuppen = function (pos) {
        var n = { CO2: 0, CO: 0, sod: 0, H2O: D.VAND };
        D.LUFT[pos].kul.forEach(function (t) { if (t) n[t]++; });
        return n;
    };

    D.soder = function (pos) { return D.LUFT[pos].sod > 0; };

    /* ----- Fane 1: braenderen ------------------------------------------------------------- */
    D.B_MAAL = [
        {
            id: "gul", navn: "Den gule flamme",
            start: { taendt: false, luft: 0 }, lup: false,
            dele: [
                {
                    type: "forsoeg", maal: "sod", direkte: true, om: ["braender", "ske"],
                    tekst: "Luftreguleringen er lukket. Tænd brænderen, og hold den kolde ske ind i flammen.",
                    set: "Skeen blev sort i den gule flamme.",
                    hint: [
                        "Klik på brænderen for at tænde den.",
                        "Klik derefter på skeen. Den holdes ind i flammen et øjeblik og kommer selv tilbage.",
                        "Tænd brænderen, klik på skeen, og se på skeen, når den er tilbage."
                    ]
                },
                {
                    type: "spm", om: ["ske"],
                    tekst: "Hvad består det sorte lag på skeen af?",
                    svar: [
                        { t: "Jern fra skeen",
                          f: "Skeen er af stål og brænder ikke i flammen. Det sorte kommer fra gassen, methan, CH₄." },
                        { t: "Carbon fra methan", ok: true },
                        { t: "Carbondioxid fra flammen",
                          f: "Carbondioxid er en farveløs gas. Det sorte lag på skeen er et fast stof." }
                    ],
                    hint: [
                        "Gassen i brænderen er methan, CH₄. Hvilke grundstoffer er der i methan?",
                        "Det sorte lag er et fast stof. Det er hverken metal fra skeen eller en gas.",
                        "Det sorte lag er sod, og sod er rent carbon, C, fra methan."
                    ]
                }
            ],
            loest: "Det sorte lag er sod, som er rent carbon, C, fra methan. Små sodpartikler gløder i flammen, og det er dem, der gør flammen gul."
        },
        {
            id: "blaa", navn: "Den blå flamme",
            start: { taendt: true, luft: 0 }, lup: false,
            dele: [
                {
                    type: "forsoeg", maal: "blaa", indsend: true, direkte: true, om: ["luft"],
                    tekst: "Stil luftreguleringen, så flammen ikke soder. Prøv med skeen, og tryk Indsend svar.",
                    set: "Med luftreguleringen åben er flammen blå, og skeen bliver ikke sort.",
                    hint: [
                        "Træk knappen på luftreguleringen mod højre. Jo længere til højre, jo mere luft kommer der ind.",
                        "Klik på skeen. Bliver den sort, soder flammen stadig.",
                        "Flammen soder ikke, når den er blå uden en gul spids. Tryk derefter Indsend svar."
                    ]
                },
                {
                    type: "spm", om: ["luft"],
                    tekst: "Hvorfor soder flammen ikke, når luftreguleringen er åben?",
                    svar: [
                        { t: "Luften blæser soden væk",
                          f: "Luften blandes med gassen inde i røret. Skeen viser, at der slet ikke dannes sod." },
                        { t: "Der kommer mindre methan ud",
                          f: "Der kommer lige så meget methan ud. Det, der ændrer sig, er luften, der blandes med gassen." },
                        { t: "Der er dioxygen nok til alt carbon", ok: true }
                    ],
                    hint: [
                        "Hvilket stof i luften er det, der reagerer med methan i en forbrænding?",
                        "Med luftreguleringen åben kommer der dioxygen ind i gassen, før den brænder.",
                        "Med nok dioxygen bliver alt carbon fra methan til carbondioxid, og der er intet tilbage til sod."
                    ]
                }
            ],
            loest: "Luft indeholder dioxygen. Med luftreguleringen åben er der dioxygen nok til, at alt carbon fra methan bliver til carbondioxid."
        },
        {
            id: "blaa_lup", navn: "Luppen over den blå flamme",
            start: { taendt: true, blaa: true }, lup: true,
            dele: [
                {
                    type: "spm", flere: true, om: ["lup"],
                    tekst: "Luppen viser, hvad der kommer op fra den blå flamme. Hvilke stoffer er det? Vælg alle, der passer.",
                    svar: [
                        { t: "CO₂, carbondioxid", ok: true },
                        { t: "CO, carbonmonoxid",
                          f: "CO er ét C og ét O. Der er ingen molekyler med kun to kugler i luppen over den blå flamme." },
                        { t: "C, sod",
                          f: "Sod er en klump af mange C-kugler. Der er ingen klumper i luppen over den blå flamme." },
                        { t: "H₂O, vand", ok: true }
                    ],
                    mangler: "Der er flere stoffer i luppen. Find både molekyler med et C og molekyler med H.",
                    hint: [
                        "Kuglerne har bogstaver: C er carbon, O er oxygen, og H er hydrogen.",
                        "Der er to slags molekyler i luppen: tre kugler på række og en O med to H.",
                        "O, C og O på række er CO₂. En O med to H er H₂O."
                    ]
                }
            ],
            loest: "Over den blå flamme er der kun carbondioxid og vand. Forbrændingen er fuldstændig, for alt carbon bliver til CO₂ og alt hydrogen til H₂O."
        },
        {
            id: "gul_lup", navn: "Luppen over den gule flamme",
            start: { taendt: true, blaa: true }, lup: true,
            dele: [
                {
                    type: "forsoeg", maal: "gul", indsend: true, direkte: true, om: ["luft"],
                    tekst: "Stil luftreguleringen, så flammen soder mest, og tryk Indsend svar.",
                    set: "Med luftreguleringen lukket er flammen gul og soder mest.",
                    hint: [
                        "Jo mindre luft der kommer ind ved luftreguleringen, jo mere soder flammen.",
                        "Træk knappen på luftreguleringen helt til venstre.",
                        "Flammen soder mest med luftreguleringen lukket. Tryk derefter Indsend svar."
                    ]
                },
                {
                    type: "spm", flere: true, om: ["lup"],
                    tekst: "Hvilke stoffer i luppen over den gule flamme var der ikke over den blå flamme? Vælg alle, der passer.",
                    svar: [
                        { t: "CO₂, carbondioxid",
                          f: "Carbondioxid var der også over den blå flamme." },
                        { t: "CO, carbonmonoxid", ok: true },
                        { t: "C, sod", ok: true },
                        { t: "H₂O, vand",
                          f: "Vand var der også over den blå flamme. Alt hydrogen bliver til vand i begge flammer." }
                    ],
                    mangler: "Der er flere nye stoffer i luppen. Se efter molekyler med to kugler og klumper af C-kugler.",
                    hint: [
                        "Over den blå flamme var der kun CO₂ og H₂O. Se efter noget andet i luppen.",
                        "Find molekyler med kun ét C og ét O og klumper med mange C og intet O.",
                        "CO er carbonmonoxid, og klumperne af C er sod."
                    ]
                }
            ],
            loest: "Med for lidt dioxygen er forbrændingen ufuldstændig. Nogle carbonatomer får kun ét oxygenatom (CO) eller intet (sod, C)."
        },
        {
            id: "kulilte", navn: "Den giftige gas",
            start: { taendt: true, luft: 0 }, lup: true,
            dele: [
                {
                    type: "spm", om: ["lup"],
                    tekst: "En gul, sodende flamme er farlig i et lukket rum. Hvilket stof fra den gule flamme er en giftig gas?",
                    svar: [
                        { t: "CO₂, carbondioxid",
                          f: "Carbondioxid er ikke giftig i små mængder, og den dannes også i den blå flamme." },
                        { t: "CO, carbonmonoxid", ok: true },
                        { t: "C, sod",
                          f: "Sod er et fast stof, som sætter sig på skeen. Det er ikke en gas." },
                        { t: "H₂O, vand",
                          f: "Vand er ikke giftigt, og det dannes også i den blå flamme." }
                    ],
                    hint: [
                        "Den giftige gas dannes kun, når der er for lidt dioxygen. Se i luppen over den gule flamme.",
                        "Over den gule flamme er der to stoffer, som ikke var over den blå. Det ene er et fast stof.",
                        "Carbonmonoxid, CO, er en giftig gas, der hverken kan ses eller lugtes."
                    ]
                }
            ],
            loest: "Carbonmonoxid kaldes også kulilte. Den binder sig til de røde blodlegemer, så de ikke kan transportere dioxygen. Grill derfor aldrig indendørs."
        }
    ];

    /* Fejl og svar paa klik paa fane 1 */
    D.forLidtLuft = function (pos) {
        return pos <= 1 ? "Flammen er stadig gul og soder. Åbn mere for luften med luftreguleringen."
            : "Flammen har stadig en gul spids, og der dannes stadig lidt sod. Åbn lidt mere for luften.";
    };
    D.forMegetLuft = "Flammen soder mere, jo mindre luft der kommer ind. Luk luftreguleringen mere.";
    D.taendFoerst = "Tænd brænderen først. Klik på brænderen.";
    D.braenderTaendt = "Brænderen brænder. Luften stilles med knappen på luftreguleringen.";
    D.luftLaast = "Opgave 1 handler om flammen med luftreguleringen lukket. Tænd brænderen, og prøv med skeen.";
    D.skeIkkeSort = "Skeen kom ud af flammen uden sod. Med luftreguleringen lukket bliver flammen gul og soder.";
    D.LUP_NAVN = {
        CO2: "Carbondioxid, CO₂: ét carbonatom med to oxygenatomer.",
        H2O: "Vand, H₂O: ét oxygenatom med to hydrogenatomer.",
        CO: "Carbonmonoxid, CO: ét carbonatom med kun ét oxygenatom. Carbonmonoxid er en giftig gas.",
        sod: "Sod: en klump af carbonatomer uden oxygen. Sod er rent carbon, C."
    };
    D.lupSpm = "Se på bogstaverne på kuglerne: C er carbon, O er oxygen, og H er hydrogen.";

    /* Panelet paa fane 1: det, eleven har fundet ud af om de to flammer */
    D.FLAMMER = [
        { id: "gul", navn: "Gul flamme", linjer: [
            { t: "Luftreguleringen", v: "lukket", efter: "gul" },
            { t: "Sod på skeen", v: "ja", efter: "gul" },
            { t: "I luppen", v: "CO₂, H₂O, CO og C", efter: "gul_lup" },
            { t: "Forbrændingen", v: "ufuldstændig", efter: "gul_lup" }
        ] },
        { id: "blaa", navn: "Blå flamme", linjer: [
            { t: "Luftreguleringen", v: "åben", efter: "blaa" },
            { t: "Sod på skeen", v: "nej", efter: "blaa" },
            { t: "I luppen", v: "CO₂ og H₂O", efter: "blaa_lup" },
            { t: "Forbrændingen", v: "fuldstændig", efter: "blaa_lup" }
        ] }
    ];

    /* ----- Fane 2: afstem forbraendingen -----------------------------------------------------
       Braendstoffet er et carbonhydrid CnHm. Produktet med carbon er CO₂
       (fuldstaendig) eller CO (for lidt dioxygen). Trinnene er C, H og O, og
       faar O₂ et halvt tal, kommer et spoergsmaal om hele tal til sidst. */
    D.STOF = {
        CH4: { f: "CH₄", navn: "methan", C: 1, H: 4 },
        C2H6: { f: "C₂H₆", navn: "ethan", C: 2, H: 6 },
        C3H8: { f: "C₃H₈", navn: "propan", C: 3, H: 8 },
        C4H10: { f: "C₄H₁₀", navn: "butan", C: 4, H: 10 },
        C5H12: { f: "C₅H₁₂", navn: "pentan", C: 5, H: 12 },
        C7H16: { f: "C₇H₁₆", navn: "heptan", C: 7, H: 16 },
        C8H18: { f: "C₈H₁₈", navn: "octan", C: 8, H: 18 },
        O2: { f: "O₂", navn: "dioxygen", O: 2 },
        CO2: { f: "CO₂", navn: "carbondioxid", C: 1, O: 2 },
        CO: { f: "CO", navn: "carbonmonoxid", C: 1, O: 1 },
        H2O: { f: "H₂O", navn: "vand", H: 2, O: 1 }
    };

    D.A_REAKTIONER = [
        { id: "methan", navn: "Methan i brænderen", titel: "Fuldstændig forbrænding af methan", br: "CH4", cp: "CO2" },
        { id: "propan", navn: "Propan i gasgrillen", titel: "Fuldstændig forbrænding af propan", br: "C3H8", cp: "CO2" },
        { id: "pentan", navn: "Pentan i benzin", titel: "Fuldstændig forbrænding af pentan", br: "C5H12", cp: "CO2" },
        { id: "ethan", navn: "Ethan", titel: "Fuldstændig forbrænding af ethan", br: "C2H6", cp: "CO2", rul: 1 },
        { id: "co", navn: "Methan med for lidt dioxygen", titel: "Ufuldstændig forbrænding af methan", br: "CH4", cp: "CO", rul: 2 }
    ];

    /* Et tal med halve, som eleven skriver det: 3½, ½, 7 */
    D.halv = function (k) {
        var hel = Math.floor(k + 1e-9), rest = k - hel > 0.25;
        if (!rest) return String(hel);
        return (hel ? String(hel) : "") + "½";
    };

    /* Facit for en forbraending: koefficienterne foer og efter hele tal */
    D.facit = function (r) {
        var b = D.STOF[r.br], p = D.STOF[r.cp];
        var kC = b.C / p.C, kH = b.H / 2;
        var oEfter = kC * p.O + kH;
        var kO = oEfter / 2;
        var halv = Math.abs(kO - Math.round(kO)) > 0.25;
        return { br: 1, O2: kO, cp: kC, H2O: kH, oEfter: oEfter, oCp: kC * p.O, oVand: kH, halv: halv };
    };

    /* Skemaet som tekst: koefficienten 1 skrives ikke */
    D.skemaTekst = function (r, k) {
        var b = D.STOF[r.br], p = D.STOF[r.cp];
        function led(n, f) { return (n === 1 ? "" : D.halv(n) + " ") + f; }
        return led(k.br, b.f) + " + " + led(k.O2, "O₂") + " → " + led(k.cp, p.f) + " + " + led(k.H2O, "H₂O");
    };

    function atomer(n, ord) { return n + " " + ord + (n === 1 ? "atom" : "atomer"); }

    /* Svarene i en anden raekkefoelge, saa det rigtige ikke altid staar foerst */
    function rul(liste, n) { return liste.slice(n).concat(liste.slice(0, n)); }

    function lavMaal(r) {
        var b = D.STOF[r.br], p = D.STOF[r.cp], k = D.facit(r);
        var n = k.halv ? 4 : 3, dele = [];
        var hel = { br: 2, O2: k.O2 * 2, cp: k.cp * 2, H2O: k.H2O * 2 };
        var slutSkema = D.skemaTekst(r, k.halv ? hel : { br: 1, O2: k.O2, cp: k.cp, H2O: k.H2O });
        dele.push({
            type: "forsoeg", trin: "C", stof: "cp", indsend: true, chip: "Trin 1 af " + n, om: ["tavle"],
            tekst: "Afstem carbon. Hvilket tal skal stå foran " + p.f + "? Brug pilene, og tryk Indsend svar.",
            rigtigt: b.f + " har " + atomer(b.C, "carbon") + ", og hvert " + p.f + " har 1. Derfor skal der stå " + k.cp + " foran " + p.f + ".",
            hint: [
                "Tæl carbonatomerne i " + b.f + ". Hvert " + p.f + " har ét carbonatom.",
                b.f + " har " + atomer(b.C, "carbon") + ", så der skal være " + atomer(b.C, "carbon") + " efter pilen.",
                "Der skal stå " + k.cp + " foran " + p.f + "."
            ]
        });
        dele.push({
            type: "forsoeg", trin: "H", stof: "H2O", indsend: true, chip: "Trin 2 af " + n, om: ["tavle"],
            tekst: "Afstem hydrogen. Hvilket tal skal stå foran H₂O?",
            rigtigt: b.f + " har " + atomer(b.H, "hydrogen") + ", og hvert H₂O har 2. Derfor skal der stå " + b.H + " : 2 = " + k.H2O + " foran H₂O.",
            hint: [
                "Tæl hydrogenatomerne i " + b.f + ". Hvert H₂O har 2 hydrogenatomer.",
                "Der er " + b.H + " hydrogenatomer, og hvert H₂O har 2. Regn " + b.H + " : 2.",
                "Der skal stå " + k.H2O + " foran H₂O."
            ]
        });
        var oTekst = "Efter pilen er der " + k.oCp + " oxygenatomer i " + p.f + " og " + k.oVand + " i H₂O, i alt " + k.oEfter + ".";
        dele.push({
            type: "forsoeg", trin: "O", stof: "O2", indsend: true, chip: "Trin 3 af " + n, om: ["tavle"],
            tekst: "Afstem oxygen til sidst. Hvilket tal skal stå foran O₂?",
            rigtigt: oTekst + " Hvert O₂ har 2, så der skal stå " + D.halv(k.O2) + " foran O₂." + (k.halv ? "" : " Nu er skemaet afstemt."),
            hint: [
                "Tæl oxygenatomerne efter pilen i både " + p.f + " og H₂O.",
                oTekst + " Hvert O₂ har 2 oxygenatomer.",
                k.halv ? "Der skal stå " + D.halv(k.O2) + " foran O₂. Brug knappen ½." : "Der skal stå " + k.O2 + " foran O₂."
            ]
        });
        if (k.halv) {
            var op = Math.ceil(k.O2);
            dele.push({
                type: "spm", chip: "Trin 4 af 4", om: ["tavle"],
                tekst: "Der står " + D.halv(k.O2) + " foran O₂. Hvad gør du, så alle tal i skemaet bliver hele tal?",
                svar: rul([
                    { t: "Ganger alle tal med 2", ok: true },
                    { t: "Runder op til " + op + " O₂",
                      f: "Med " + op + " O₂ er der " + (2 * op) + " oxygenatomer før pilen og " + k.oEfter + " efter, så skemaet passer ikke længere." },
                    { t: "Ganger kun O₂ med 2",
                      f: "Med " + k.oEfter + " O₂ er der " + (2 * k.oEfter) + " oxygenatomer før pilen, men stadig kun " + k.oEfter + " efter." }
                ], r.rul || 0),
                hint: [
                    "Der findes ikke halve molekyler, så skemaet skal skrives med hele tal.",
                    "Ganger du kun ét af tallene, passer skemaet ikke længere.",
                    "Gang alle fire tal med 2, så " + D.halv(k.O2) + " bliver til " + hel.O2 + "."
                ]
            });
        }
        return {
            id: r.id, navn: r.navn, r: r, k: k, hel: hel, dele: dele,
            loest: k.halv ? "Der findes ikke halve molekyler, så alle tal ganges med 2: " + slutSkema + "." : "Skemaet er afstemt: " + slutSkema + "."
        };
    }

    D.A_MAAL = D.A_REAKTIONER.map(lavMaal);

    /* Fejl ved Indsend svar i et trin paa fane 2. k: elevens tal, m: maalet */
    D.aFejl = function (trin, k, m) {
        var b = D.STOF[m.r.br], p = D.STOF[m.r.cp], f = m.k;
        if (trin === "C") {
            return "Med " + D.halv(k) + " " + p.f + " er der " + D.halv(k) + " carbonatom" + (k === 1 ? "" : "er") + " efter pilen, men " + b.f + " har " + b.C + ".";
        }
        if (trin === "H") {
            if (k === b.H) return "Hvert H₂O har 2 hydrogenatomer, så " + k + " H₂O har " + (2 * k) + ". " + b.f + " har kun " + b.H + ".";
            return "Med " + D.halv(k) + " H₂O er der " + D.halv(2 * k) + " hydrogenatomer efter pilen, men " + b.f + " har " + b.H + ".";
        }
        if (Math.abs(k - f.oEfter) < 0.01) return "Hvert O₂ har 2 oxygenatomer, så " + D.halv(k) + " O₂ har " + D.halv(2 * k) + ". Efter pilen er der " + f.oEfter + ".";
        if (Math.abs(2 * k - f.oCp) < 0.01) return "Husk også oxygenatomerne i H₂O. Efter pilen er der " + f.oCp + " i " + p.f + " og " + f.oVand + " i H₂O.";
        return "Med " + D.halv(k) + " O₂ er der " + D.halv(2 * k) + " oxygenatomer før pilen, men " + f.oEfter + " efter.";
    };
    /* ----- Fane 2, oevet: hele skemaet paa én gang -----------------------------------------
       Eleven skriver alle fire tal direkte, uden kugler og uden trin. Et tomt
       felt taeller som 1, som i et reaktionsskema, hvor 1 ikke skrives. Tallene
       skal vaere de mindste hele tal. */
    D.O_REAKTIONER = [
        { id: "o-propan", navn: "Propan", titel: "Fuldstændig forbrænding af propan", br: "C3H8", cp: "CO2" },
        { id: "o-butan", navn: "Butan i en lighter", titel: "Fuldstændig forbrænding af butan", br: "C4H10", cp: "CO2" },
        { id: "o-heptan", navn: "Heptan", titel: "Fuldstændig forbrænding af heptan", br: "C7H16", cp: "CO2" },
        { id: "o-octan", navn: "Octan i benzin", titel: "Fuldstændig forbrænding af octan", br: "C8H18", cp: "CO2" },
        { id: "o-ethan", navn: "Ethan", titel: "Fuldstændig forbrænding af ethan", br: "C2H6", cp: "CO2" },
        { id: "o-co", navn: "Propan med for lidt dioxygen", titel: "Ufuldstændig forbrænding af propan", br: "C3H8", cp: "CO" }
    ];

    function lavOevet(r) {
        var b = D.STOF[r.br], p = D.STOF[r.cp], k = D.facit(r);
        var hel = k.halv ? { br: 2, O2: k.O2 * 2, cp: k.cp * 2, H2O: k.H2O * 2 } : { br: 1, O2: k.O2, cp: k.cp, H2O: k.H2O };
        return {
            id: r.id, navn: r.navn, r: r, k: k, hel: hel, oevet: true,
            dele: [{
                type: "forsoeg", oevet: true, indsend: true, chip: "Øvet", om: ["tavle"],
                tekst: "Afstem reaktionsskemaet. Skriv tallene foran stofferne, og tryk Indsend svar.",
                hint: [
                    "Afstem i rækkefølgen C, H og O: først tallet foran " + p.f + ", så foran H₂O og til sidst foran O₂.",
                    b.f + " har " + b.C + " C og " + b.H + " H. Det giver " + k.cp + " " + p.f + " og " + k.H2O + " H₂O.",
                    "Efter pilen er der " + k.oEfter + " oxygenatomer, så der skal stå " + D.halv(k.O2) + " O₂." + (k.halv ? " Gang så alle tal med 2." : "")
                ]
            }],
            loest: "Skemaet er afstemt: " + D.skemaTekst(r, hel) + "."
        };
    }
    D.O_MAAL = D.O_REAKTIONER.map(lavOevet);

    /* Fejl i det oevede skema: det foerste grundstof, der ikke passer, i
       raekkefoelgen C, H, O, eller tal, der kan forkortes */
    D.oFejl = function (k, m) {
        var b = D.STOF[m.r.br], p = D.STOF[m.r.cp];
        var C = [k.br * b.C, k.cp * p.C], H = [k.br * b.H, 2 * k.H2O], O = [2 * k.O2, k.cp * p.O + k.H2O];
        if (C[0] !== C[1]) return "Carbon passer ikke: " + C[0] + " carbonatomer før pilen og " + C[1] + " efter.";
        if (H[0] !== H[1]) return "Hydrogen passer ikke: " + H[0] + " hydrogenatomer før pilen og " + H[1] + " efter.";
        if (O[0] !== O[1]) return "Oxygen passer ikke: " + O[0] + " oxygenatomer før pilen og " + O[1] + " efter.";
        return "Skemaet passer, men alle tallene kan deles med " + [k.br, k.O2, k.cp, k.H2O].reduce(NK.gcd) + ". Brug de mindste hele tal.";
    };
    D.oHeleTal = "Skriv hele tal i felterne, fx 3 eller 13. Der findes ikke halve molekyler.";
    D.oTomt = "Skriv tallene foran stofferne i felterne først.";

    /* ----- Fejringen, naar alle skemaer er afstemt (som medaljen i sb3.3) ------------------- */
    D.MEDALJE = function (stjerner, ialt) {
        if (stjerner >= ialt) return { id: "guld", navn: "Guld", tekst: "Alle " + ialt + " skemaer uden fejl og uden at se svaret." };
        if (stjerner >= Math.ceil(ialt * 2 / 3)) return { id: "soelv", navn: "Sølv", tekst: stjerner + " af " + ialt + " skemaer uden fejl og uden at se svaret." };
        return { id: "bronze", navn: "Bronze", tekst: stjerner + " af " + ialt + " skemaer uden fejl og uden at se svaret." };
    };

    /* Den store tekst oeverst paa tavlen i trinnene (Uoevet) */
    D.TRIN_TAVLE = {
        C: "Kig kun på carbonatomerne, C",
        H: "Kig kun på hydrogenatomerne, H",
        O: "Kig kun på oxygenatomerne, O",
        hel: "Gør alle tal til hele tal",
        afstemt: "Skemaet er afstemt"
    };

    D.vaelgTal = function (stofF) { return "Vælg tallet foran " + stofF + " med pilene over og under feltet."; };
    D.raekkefoelge = {
        C: "Rækkefølgen er C, H og O. Afstem carbon først med tallet foran ",
        H: "Carbon er afstemt. Nu afstemmes hydrogen med tallet foran H₂O.",
        O: "Oxygen afstemmes til sidst med tallet foran O₂.",
        braend: "Tallet foran brændstoffet bliver 1, til alle tal ganges med 2."
    };

    D.FAERDIG = {
        b: "Alle fem opgaver om brænderen er løst. På fane 2 afstemmer du forbrændingen.",
        a: "Alle fem forbrændinger er afstemt.",
        o: "Alle seks skemaer er afstemt."
    };

    NK.Data = D;
}());

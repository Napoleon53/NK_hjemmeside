/* =====================================================================
   data.js - opgaverne og teksterne paa de tre faner

   Et maal (opgave) har sine dele i raekkefoelge: forsoeg > spm > spm2
   (se js/fane.js; der er ingen gaet i denne animation). Hver del har
   tekst, hint og evt. om: det, delen handler om, som faar en rolig gul
   ring i scenen ("baand", "lup", "ox", "red", "samlet", "maerker",
   "sb", "rx", "kort"). Et forsoeg med indsend: false har ingen Indsend
   svar, fordi eleven kun skal se noget ske.

   Graenser, som selvtesten taeller: et spoergsmaal 105, et svar 34, et
   forsoeg 95, et hint 100, forklaringen til et forkert svar 110 og til
   det rigtige 160.

   Ord og farver som i Kemibogens afsnit 8.1 og 7.1: elektroner og hydroner
   "overfoeres", dioxygen om stoffet O2, oxygen om atomet, oxidation orange,
   reduktion blaa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ================================================================
       Fane 1: Magnesium braender
       ================================================================ */
    D.B_MAAL = [
        {
            id: "brand", navn: "Magnesium brænder",
            forsoeg: {
                om: ["baand"], indsend: false,
                tekst: "Klik på magnesiumbåndet for at antænde det, og se i luppen, hvad der sker med atomerne.",
                set: "Båndet brændte med et skarpt, hvidt lys. Tilbage i skålen ligger et hvidt pulver af magnesiumoxid.",
                hint: [
                    "Klik på enden af det grå magnesiumbånd, som tangen holder.",
                    "Det gule skilt sidder ved enden af magnesiumbåndet. Klik dér.",
                    "Klik på enden af magnesiumbåndet. Luppen viser atomerne, mens båndet brænder."
                ]
            },
            spm: {
                om: ["lup"],
                tekst: "Hvor blev elektronerne overført fra og til, mens magnesium brændte?",
                svar: [
                    { t: "Fra magnesium til oxygen", ok: true },
                    { t: "Fra oxygen til magnesium",
                      f: "Se i luppen igen. De blå elektroner forlader magnesiumatomerne og ender ved oxygenatomerne." },
                    { t: "Fra magnesium ud i luften",
                      f: "Elektroner kan ikke forsvinde. I luppen ender hver elektron ved et oxygenatom." }
                ],
                hint: [
                    "Tryk på Brænder under luppen, og følg de blå elektroner.",
                    "Elektronerne starter ved de grå magnesiumatomer. Se, hvor de ender.",
                    "Elektronerne forlader magnesiumatomerne og ender ved oxygenatomerne."
                ]
            },
            loest: "Hvert magnesiumatom afgav 2 elektroner, og hvert oxygenatom optog 2. Derfor består magnesiumoxid af ionerne Mg²⁺ og O²⁻."
        },
        {
            id: "oxidation", navn: "Oxidation",
            spm: {
                om: ["lup"],
                tekst: "At afgive elektroner kaldes en oxidation. Hvilket stof oxideres, når magnesium brænder?",
                svar: [
                    { t: "Magnesium", ok: true },
                    { t: "Dioxygen",
                      f: "Dioxygen optager elektronerne i luppen. En oxidation er at afgive elektroner." },
                    { t: "Magnesiumoxid",
                      f: "Magnesiumoxid er produktet. Se i luppen, hvilket stof der afgiver elektronerne." }
                ],
                hint: [
                    "Tryk på Brænder under luppen. Hvilke atomer afgiver de blå elektroner?",
                    "Elektronerne forlader magnesiumatomerne.",
                    "Magnesium afgiver elektroner, så det er magnesium, der oxideres."
                ]
            },
            spm2: {
                om: ["lup"],
                tekst: "Hvordan ændrer ladningen på et magnesiumatom sig, når det oxideres?",
                svar: [
                    { t: "Den stiger fra 0 til +2", ok: true },
                    { t: "Den falder fra 0 til −2",
                      f: "Elektroner er negative. Når atomet afgiver 2 elektroner, har det 2 flere protoner end elektroner." },
                    { t: "Den bliver ved med at være 0",
                      f: "Atomet havde lige mange protoner og elektroner. Efter at have afgivet 2 elektroner er det en ion." }
                ],
                hint: [
                    "Tryk på Efter under luppen, og se ladningen på magnesiumionen.",
                    "Et magnesiumatom har ingen ladning. Magnesiumionen har ladningen +2.",
                    "Ladningen stiger fra 0 til +2, fordi atomet har afgivet 2 negative elektroner."
                ]
            },
            godt: "Magnesium afgiver elektroner til oxygen, og derfor er det magnesium, der oxideres.",
            loest: "En oxidation er at afgive elektroner. Magnesium oxideres, og ladningen stiger fra 0 til +2."
        },
        {
            id: "reduktion", navn: "Reduktion",
            spm: {
                om: ["lup"],
                tekst: "At optage elektroner kaldes en reduktion. Hvilket stof reduceres, når magnesium brænder?",
                svar: [
                    { t: "Dioxygen", ok: true },
                    { t: "Magnesium",
                      f: "Magnesium afgiver elektroner og oxideres. En reduktion er at optage elektroner." },
                    { t: "Magnesiumoxid",
                      f: "Magnesiumoxid er produktet. Se i luppen, hvilket stof der optager elektronerne." }
                ],
                hint: [
                    "Tryk på Brænder under luppen. Hvilke atomer optager de blå elektroner?",
                    "Elektronerne ender ved oxygenatomerne, som kommer fra dioxygen i luften.",
                    "Oxygen optager elektroner, så det er dioxygen, der reduceres."
                ]
            },
            spm2: {
                om: ["lup"],
                tekst: "Hvor mange elektroner optager ét dioxygenmolekyle, O₂?",
                svar: [
                    { t: "4 elektroner", ok: true },
                    { t: "2 elektroner",
                      f: "Hvert oxygenatom optager 2 elektroner, og der er 2 oxygenatomer i et dioxygenmolekyle." },
                    { t: "1 elektron",
                      f: "Oxidionen har ladningen −2, så hvert oxygenatom har optaget 2 elektroner." }
                ],
                hint: [
                    "Tryk på Brænder under luppen, og tæl de elektroner, der ender ved de to oxygenatomer.",
                    "Hvert oxygenatom optager 2 elektroner. Hvor mange oxygenatomer er der i O₂?",
                    "Et dioxygenmolekyle har 2 oxygenatomer, som hver optager 2 elektroner. Det er 4 i alt."
                ]
            },
            godt: "Oxygen optager de elektroner, magnesium afgiver, og derfor er det dioxygen, der reduceres.",
            loest: "En reduktion er at optage elektroner. Hvert oxygenatom optager 2, så et dioxygenmolekyle optager 4, og ladningen på hvert oxygenatom falder fra 0 til −2."
        },
        {
            id: "samtidig", navn: "Altid samtidig",
            spm: {
                om: ["lup"],
                tekst: "Kan magnesium oxideres, uden at et andet stof samtidig bliver reduceret?",
                svar: [
                    { t: "Nej, elektronerne skal optages", ok: true },
                    { t: "Ja, elektronerne går op i røg",
                      f: "Elektroner kan ikke forsvinde. De elektroner, magnesium afgiver, skal optages af et andet stof." },
                    { t: "Ja, når der ingen luft er",
                      f: "Uden dioxygen er der intet stof til at optage elektronerne, og så brænder magnesium ikke." }
                ],
                hint: [
                    "Hvor bliver elektronerne af i luppen, når magnesium afgiver dem?",
                    "Elektronerne kan ikke forsvinde. I luppen ender de hos oxygen.",
                    "Når ét stof afgiver elektroner, må et andet stof samtidig optage dem."
                ]
            },
            loest: "Elektroner kan ikke forsvinde, så en oxidation og en reduktion sker altid samtidig. Den samlede reaktion kaldes en redoxreaktion."
        }
    ];

    /* ================================================================
       Fane 2: Delreaktioner

       To reaktioner paa arket. Hver delreaktion har en raekke med et
       felt til e⁻ paa hver side af pilen. rigtig: siden ("v" eller "h")
       og antallet af elektroner for ét atom eller molekyle. gange: tallet
       foran delreaktionen, naar der afgives lige saa mange elektroner,
       som der optages.
       ================================================================ */
    /* Felterne i en delreaktion: navn (stoffet), atom (atomets navn i
       "magnesiumatomet"), stof og ion (foer og efter pilen), ionK (tallet
       foran ionen), q (ladningsaendringen for ét atom), rigtig (siden og
       antallet af elektroner for ét atom eller molekyle) og gange (tallet
       foran delreaktionen i den afstemte reaktion). metalion: stoffet foer
       pilen er en metalion, der bliver til et metal. */
    function rk(ord, samlet, ox, red, stoffer) {
        /* pladserne til reduktions- og oxidationsmidlet sidder under de to stoffer foer pilen */
        samlet = samlet.map(function (d) { var k = {}; Object.keys(d).forEach(function (n) { k[n] = d[n]; }); return k; });
        samlet[0].middel = "ox";
        samlet[2].middel = "red";
        ox.rigtig = { side: "h", n: ox.q };
        red.rigtig = { side: "v", n: red.q * red.ionK };
        return { ord: ord, samlet: samlet, ox: ox, red: red, stoffer: stoffer };
    }
    function oxR(navn, stof, q, gange) { return { navn: navn, atom: navn, stof: stof, ion: stof + "^{" + (q > 1 ? q : "") + "+}", ionK: 1, q: q, gange: gange }; }
    function x2(navn, atom, stof, ion, q, ionNavn, gange) { return { navn: navn, atom: atom, stof: stof, ion: ion, ionK: 2, q: q, ionNavn: ionNavn, gange: gange }; }
    function mIon(navn, atom, stof, ion, q, gange) { return { navn: navn, atom: atom, stof: stof, ion: ion, ionK: 1, q: q, metalion: true, gange: gange }; }
    function S(k, f, middel) { return { k: k, f: f, middel: middel }; }
    var PLUS = { t: "+" }, PIL = { pil: true };
    var O2 = function (g) { return x2("dioxygen", "oxygen", "O_2", "O^{2−}", 2, "oxidioner", g); };
    var CL2 = function (g) { return x2("dichlor", "chlor", "Cl_2", "Cl^−", 1, "chloridioner", g); };

    D.REAK = {
        mg: rk("Magnesium + dioxygen → magnesiumoxid", [S(2, "Mg", "ox"), PLUS, S(1, "O_2", "red"), PIL, S(2, "MgO")],
            oxR("magnesium", "Mg", 2, 2), O2(1)),
        fe: rk("Jern + dioxygen → jern(III)oxid", [S(4, "Fe", "ox"), PLUS, S(3, "O_2", "red"), PIL, S(2, "Fe_2O_3")],
            oxR("jern", "Fe", 3, 4), O2(3)),
        /* Ekstraopgaverne: let */
        mgcl: rk("Magnesium + dichlor → magnesiumchlorid", [S(1, "Mg"), PLUS, S(1, "Cl_2"), PIL, S(1, "MgCl_2")],
            oxR("magnesium", "Mg", 2, 1), CL2(1), { ox: "Magnesium", red: "Dichlor", prod: "Magnesiumchlorid" }),
        nacl: rk("Natrium + dichlor → natriumchlorid", [S(2, "Na"), PLUS, S(1, "Cl_2"), PIL, S(2, "NaCl")],
            oxR("natrium", "Na", 1, 2), CL2(1), { ox: "Natrium", red: "Dichlor", prod: "Natriumchlorid" }),
        zncu: rk("Zink + kobber(II)ioner → zink(II)ioner + kobber", [S(1, "Zn"), PLUS, S(1, "Cu^{2+}"), PIL, S(1, "Zn^{2+}"), PLUS, S(1, "Cu")],
            oxR("zink", "Zn", 2, 1), mIon("kobber(II)ionen", "kobber", "Cu^{2+}", "Cu", 2, 1), { ox: "Zink", red: "Kobber(II)ioner", prod: "Kobber" }),
        cao: rk("Calcium + dioxygen → calciumoxid", [S(2, "Ca"), PLUS, S(1, "O_2"), PIL, S(2, "CaO")],
            oxR("calcium", "Ca", 2, 2), O2(1), { ox: "Calcium", red: "Dioxygen", prod: "Calciumoxid" }),
        /* middel */
        lio: rk("Lithium + dioxygen → lithiumoxid", [S(4, "Li"), PLUS, S(1, "O_2"), PIL, S(2, "Li_2O")],
            oxR("lithium", "Li", 1, 4), O2(1), { ox: "Lithium", red: "Dioxygen", prod: "Lithiumoxid" }),
        kbr: rk("Kalium + dibrom → kaliumbromid", [S(2, "K"), PLUS, S(1, "Br_2"), PIL, S(2, "KBr")],
            oxR("kalium", "K", 1, 2), x2("dibrom", "brom", "Br_2", "Br^−", 1, "bromidioner", 1), { ox: "Kalium", red: "Dibrom", prod: "Kaliumbromid" }),
        cuag: rk("Kobber + sølv(I)ioner → kobber(II)ioner + sølv", [S(1, "Cu"), PLUS, S(2, "Ag^+"), PIL, S(1, "Cu^{2+}"), PLUS, S(2, "Ag")],
            oxR("kobber", "Cu", 2, 1), mIon("sølv(I)ionen", "sølv", "Ag^+", "Ag", 1, 2), { ox: "Kobber", red: "Sølv(I)ioner", prod: "Sølv" }),
        zno: rk("Zink + dioxygen → zink(II)oxid", [S(2, "Zn"), PLUS, S(1, "O_2"), PIL, S(2, "ZnO")],
            oxR("zink", "Zn", 2, 2), O2(1), { ox: "Zink", red: "Dioxygen", prod: "Zink(II)oxid" }),
        /* svaer */
        alo: rk("Aluminium + dioxygen → aluminiumoxid", [S(4, "Al"), PLUS, S(3, "O_2"), PIL, S(2, "Al_2O_3")],
            oxR("aluminium", "Al", 3, 4), O2(3), { ox: "Aluminium", red: "Dioxygen", prod: "Aluminiumoxid" }),
        alcl: rk("Aluminium + dichlor → aluminiumchlorid", [S(2, "Al"), PLUS, S(3, "Cl_2"), PIL, S(2, "AlCl_3")],
            oxR("aluminium", "Al", 3, 2), CL2(3), { ox: "Aluminium", red: "Dichlor", prod: "Aluminiumchlorid" }),
        fecl: rk("Jern + dichlor → jern(III)chlorid", [S(2, "Fe"), PLUS, S(3, "Cl_2"), PIL, S(2, "FeCl_3")],
            oxR("jern", "Fe", 3, 2), CL2(3), { ox: "Jern", red: "Dichlor", prod: "Jern(III)chlorid" }),
        alcu: rk("Aluminium + kobber(II)ioner → aluminiumioner + kobber", [S(2, "Al"), PLUS, S(3, "Cu^{2+}"), PIL, S(2, "Al^{3+}"), PLUS, S(3, "Cu")],
            oxR("aluminium", "Al", 3, 2), mIon("kobber(II)ionen", "kobber", "Cu^{2+}", "Cu", 2, 3), { ox: "Aluminium", red: "Kobber(II)ioner", prod: "Kobber" })
    };

    /* Formel-markup til tekst: "Mg^{2+}" -> Mg²⁺, "O_2" -> O₂, "e^−" -> e⁻.
       Lærredet tegner samme markup med rigtig hævet og sænket skrift. */
    var HAEV = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "−": "⁻", "-": "⁻" };
    var SAENK = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
    D.uni = function (s) {
        return String(s).replace(/([_^])(\{([^}]*)\}|(.))/g, function (m, slags, x, gruppe, tegn) {
            var t = gruppe !== undefined ? gruppe : tegn, tabel = slags === "^" ? HAEV : SAENK;
            return t.split("").map(function (c) { return tabel[c] || c; }).join("");
        });
    };

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function elek(n) { return n === 1 ? "1 elektron" : n + " elektroner"; }
    D.elek = elek;

    /* Forklaringen til en forkert delreaktion. e = { v: antal til venstre, h: antal til hoejre } */
    D.eFejl = function (reak, raekke, e) {
        var r = D.REAK[reak][raekke], ok = r.rigtig;
        if (e.v > 0 && e.h > 0) return "Elektronerne skal kun stå på den ene side af pilen i delreaktionen for " + r.navn + ".";
        var side = e.v > 0 ? "v" : "h", n = e.v + e.h;
        if (side !== ok.side) {
            return raekke === "ox" ?
                stort(r.navn) + " afgiver elektronerne. De bliver et produkt og skal stå til højre for pilen." :
                stort(r.navn) + " optager elektronerne. De skal stå sammen med " + D.uni(r.stof) + " til venstre for pilen.";
        }
        if (n !== ok.n) {
            if (raekke === "ox") {
                return D.uni(r.ion) + " har ladningen +" + r.q + ", så " + r.atom + "atomet har afgivet " + elek(r.q) + ". Du har skrevet " + n + ".";
            }
            if (r.metalion) {
                return D.uni(r.stof) + " har ladningen +" + r.q + " og bliver til " + r.atom + " uden ladning. Ionen optager " + elek(r.q) + ".";
            }
            if (n === r.q) return "Hvert " + r.atom + "atom optager " + elek(r.q) + ", og der er 2 " + r.atom + "atomer i " + D.uni(r.stof) + ".";
            return "Der dannes 2 " + r.ionNavn + ", " + D.uni(r.ion) + ", som hver har optaget " + elek(r.q) + ". Du har skrevet " + n + ".";
        }
        return "";
    };

    /* Forklaringen til forkerte tal foran delreaktionerne. g = { ox, red } (0 er intet tal, altsaa 1) */
    D.gangeFejl = function (reak, g) {
        var r = D.REAK[reak], a = (g.ox || 1) * r.ox.rigtig.n, b = (g.red || 1) * r.red.rigtig.n;
        if (a !== b) return "Der afgives " + elek(a) + ", men der optages " + elek(b) + ". Sæt tal foran, så tallene bliver ens.";
        if ((g.ox || 1) !== r.ox.gange) return "Elektronerne passer, men tallene kan være mindre. Brug de mindste tal, der passer.";
        return "";
    };

    /* Delreaktionerne skrevet ud som tekst (til hint og forklaringer) */
    D.delTekst = function (reak, raekke, gange) {
        var r = D.REAK[reak][raekke], g = gange || 1, n = r.rigtig.n * g;
        var k = function (t) { return t > 1 ? t + " " : ""; };
        var e = n + " e⁻";
        return raekke === "ox" ?
            k(g) + D.uni(r.stof) + " → " + k(g * r.ionK) + D.uni(r.ion) + " + " + e :
            k(g) + D.uni(r.stof) + " + " + e + " → " + k(g * r.ionK) + D.uni(r.ion);
    };

    function eHint(reak) {
        var r = D.REAK[reak].ox, q = r.rigtig.n, ion = D.uni(r.ion);
        return [
            ion + " har ladningen +" + q + ". Hvor mange elektroner har et " + r.navn + "atom afgivet?",
            stort(r.navn) + " afgiver elektronerne, så de bliver et produkt og står til højre for pilen.",
            "Træk " + q + " e⁻ ind til højre for pilen: " + D.uni(r.stof) + " → " + ion + " + " + q + " e⁻."
        ];
    }

    D.D_MAAL = [
        {
            id: "mg", navn: "Magnesium afgiver", reak: "mg", foer: [], aktiv: ["ox"], brikker: ["e"],
            forsoeg: {
                om: ["ox"],
                tekst: "Træk elektroner, e⁻, ind i delreaktionen for magnesium, så den passer med ionen Mg²⁺.",
                hint: eHint("mg")
            },
            loest: "Magnesium afgiver 2 elektroner og bliver til Mg²⁺. Elektronerne står til højre for pilen, fordi de bliver afgivet."
        },
        {
            id: "o2", navn: "Dioxygen optager", reak: "mg", foer: ["ox"], aktiv: ["red"], brikker: ["e"],
            forsoeg: {
                om: ["red"],
                tekst: "Træk e⁻ ind i delreaktionen for dioxygen. Hvert oxygenatom bliver til en oxidion, O²⁻.",
                hint: [
                    "Dioxygen optager elektronerne. Står de så sammen med O₂ eller sammen med O²⁻?",
                    "Hvert oxygenatom optager 2 elektroner, og et dioxygenmolekyle har 2 oxygenatomer.",
                    "Træk 4 e⁻ ind til venstre for pilen: O₂ + 4 e⁻ → 2 O²⁻."
                ]
            },
            loest: "Dioxygen optager 4 elektroner, 2 til hvert oxygenatom. Elektronerne står til venstre for pilen, fordi de bliver optaget."
        },
        {
            id: "lige", navn: "Lige mange elektroner", reak: "mg", foer: ["ox", "red"], aktiv: [], brikker: [],
            spm: {
                om: ["ox", "red"],
                tekst: "Et magnesiumatom afgiver 2 e⁻, og ét O₂ optager 4 e⁻. Hvor mange magnesiumatomer går der på ét O₂?",
                svar: [
                    { t: "2 magnesiumatomer", ok: true },
                    { t: "1 magnesiumatom",
                      f: "Ét magnesiumatom afgiver kun 2 elektroner, men der skal afgives lige så mange, som ét O₂ optager, altså 4." },
                    { t: "4 magnesiumatomer",
                      f: "4 magnesiumatomer afgiver 8 elektroner, men et dioxygenmolekyle optager kun 4." }
                ],
                hint: [
                    "Der skal afgives lige så mange elektroner, som dioxygen optager.",
                    "Et dioxygenmolekyle optager 4 elektroner. Hvor mange magnesiumatomer afgiver tilsammen 4?",
                    "2 magnesiumatomer afgiver tilsammen 4 elektroner, lige så mange som dioxygen optager."
                ]
            },
            loest: "Der skal afgives lige så mange elektroner, som der optages. Derfor reagerer 2 magnesiumatomer med ét dioxygenmolekyle."
        },
        {
            id: "navne", navn: "Oxidation og reduktion", reak: "mg", foer: ["ox", "red", "gange"], aktiv: [], brikker: ["oxidation", "reduktion"],
            forsoeg: {
                om: ["maerker"],
                tekst: "Træk mærkaterne Oxidation og Reduktion hen foran de to delreaktioner, og indsend.",
                hint: [
                    "En oxidation er at afgive elektroner, og en reduktion er at optage elektroner.",
                    "Magnesium afgiver elektroner i den øverste delreaktion. Dioxygen optager dem i den nederste.",
                    "Oxidation står foran delreaktionen for magnesium og Reduktion foran den for dioxygen."
                ]
            },
            loest: "Den øverste delreaktion er en oxidation, fordi magnesium afgiver elektroner. Den nederste er en reduktion, fordi dioxygen optager dem."
        },
        {
            id: "midler", navn: "Reduktionsmiddel og oxidationsmiddel", reak: "mg", foer: ["ox", "red", "gange", "navne"], aktiv: [],
            brikker: ["reduktionsmiddel", "oxidationsmiddel"],
            forsoeg: {
                om: ["samlet"],
                tekst: "Et reduktionsmiddel afgiver elektroner, og et oxidationsmiddel optager dem. Sæt mærkaterne på.",
                hint: [
                    "Hvilket stof i reaktionsskemaet øverst afgiver elektronerne, Mg eller O₂?",
                    "Magnesium afgiver elektronerne, så magnesium er reduktionsmidlet.",
                    "Reduktionsmiddel står under Mg, og Oxidationsmiddel står under O₂."
                ]
            },
            loest: "Magnesium er reduktionsmidlet, fordi det afgiver elektroner og reducerer dioxygen. Dioxygen er oxidationsmidlet, fordi det optager dem."
        },
        {
            id: "fe", navn: "Håndvarmeren", reak: "fe", foer: [], aktiv: ["ox", "red"], brikker: ["e"],
            forsoeg: {
                om: ["ox", "red"],
                tekst: "I en håndvarmer ruster jern til jern(III)oxid af Fe³⁺ og O²⁻. Skriv begge delreaktioner med e⁻.",
                set: "Jern afgiver 3 elektroner pr. atom, og dioxygen optager 4 pr. molekyle. Begge delreaktioner er rigtige.",
                hint: [
                    "Fe³⁺ har ladningen +3. Hvor mange elektroner har et jernatom afgivet?",
                    "Jern afgiver 3 elektroner til højre for pilen. Dioxygen optager 4 til venstre som ved magnesium.",
                    "Fe → Fe³⁺ + 3 e⁻ og O₂ + 4 e⁻ → 2 O²⁻."
                ]
            },
            spm: {
                om: ["ox", "red"],
                tekst: "Et jernatom afgiver 3 e⁻, og ét O₂ optager 4 e⁻. Hvor mange jernatomer går der på 3 dioxygenmolekyler?",
                svar: [
                    { t: "4 jernatomer", ok: true },
                    { t: "3 jernatomer",
                      f: "3 jernatomer afgiver 9 elektroner, men 3 dioxygenmolekyler optager 12." },
                    { t: "12 jernatomer",
                      f: "3 dioxygenmolekyler optager 12 elektroner, men hvert jernatom afgiver 3 af dem." }
                ],
                hint: [
                    "Hvor mange elektroner optager 3 dioxygenmolekyler tilsammen?",
                    "3 dioxygenmolekyler optager 12 elektroner. Hvor mange jernatomer afgiver 12, når hvert afgiver 3?",
                    "4 jernatomer afgiver 12 elektroner, lige så mange som 3 dioxygenmolekyler optager."
                ]
            },
            spm2: {
                om: ["samlet"],
                tekst: "Hvilket stof er reduktionsmidlet i håndvarmeren?",
                svar: [
                    { t: "Jern", ok: true },
                    { t: "Dioxygen",
                      f: "Dioxygen optager elektronerne. Reduktionsmidlet er det stof, der afgiver dem." },
                    { t: "Jern(III)oxid",
                      f: "Jern(III)oxid er produktet. Reduktionsmidlet er et af de stoffer, der reagerer." }
                ],
                hint: [
                    "Reduktionsmidlet er det stof, der afgiver elektronerne.",
                    "I den øverste delreaktion afgiver jern 3 elektroner pr. atom.",
                    "Jern afgiver elektronerne, så jern er reduktionsmidlet."
                ]
            },
            godt: "Der skal afgives lige så mange elektroner, som der optages. 4 jernatomer afgiver 12, og 3 dioxygenmolekyler optager 12.",
            loest: "Jern afgiver elektronerne og er reduktionsmidlet. Der overføres 12 elektroner fra 4 jernatomer til 3 dioxygenmolekyler."
        }
    ];

    /* ----- Ekstraopgaverne paa fane 2 ---------------------------------------------------
       Tre svaerhedsgrader med fire reaktioner hver (i tilfaeldig raekkefoelge).
       Let: elektronerne i begge delreaktioner (tallene foran kommer af sig
       selv). Middel: ogsaa tallene foran. Svaer: tal, der skal ganges paa
       begge delreaktioner, og hvilket stof der er reduktions- eller
       oxidationsmidlet. Mindre stilladsering end opgave 1 til 6: hintene er
       de samme for alle reaktioner. */
    function eDel(id, sidst) {
        var r = D.REAK[id], ox = r.ox, red = r.red;
        var h2 = red.metalion ?
            D.uni(red.stof) + " bliver til " + red.atom + " uden ladning. Elektronerne står sammen med " + D.uni(red.stof) + " til venstre for pilen." :
            "Hvert " + red.atom + "atom optager " + elek(red.q) + ", og " + D.uni(red.stof) + " har 2. Elektronerne står til venstre for pilen.";
        return {
            type: "forsoeg", reak: id, trin: "e", om: ["ox", "red"],
            tekst: "Træk e⁻ ind i begge delreaktioner, så de passer med ionernes ladninger, og indsend.",
            set: sidst ? "Begge delreaktioner er rigtige. Med tallene foran afgives og optages " + elek(ox.rigtig.n * ox.gange) + "." : "Begge delreaktioner er rigtige.",
            hint: [
                D.uni(ox.ion) + " har ladningen +" + ox.q + ". Hvor mange elektroner har et " + ox.atom + "atom afgivet?",
                h2,
                D.delTekst(id, "ox") + " og " + D.delTekst(id, "red") + "."
            ]
        };
    }
    function gDel(id) {
        var r = D.REAK[id], ox = r.ox, red = r.red;
        var a = ox.gange, b = red.gange;
        var h3 = (a > 1 ? "Sæt " + a + " foran delreaktionen for " + ox.navn : "Lad delreaktionen for " + ox.navn + " være") +
            (b > 1 ? ", og sæt " + b + " foran den for " + red.navn + "." : ", og sæt intet tal foran den for " + red.navn + ".");
        return {
            type: "forsoeg", reak: id, trin: "gange", om: ["ox", "red"],
            tekst: "Sæt tal foran delreaktionerne, så der afgives lige så mange e⁻, som der optages.",
            set: "Der afgives og optages " + elek(ox.rigtig.n * a) + ", og reaktionen står øverst på arket.",
            hint: [
                "Et " + ox.atom + "atom afgiver " + elek(ox.rigtig.n) + ", og " + D.uni(red.stof) + " optager " + elek(red.rigtig.n) + ". Gør tallene ens.",
                "Find det mindste tal, som både " + ox.rigtig.n + " og " + red.rigtig.n + " går op i.",
                h3
            ]
        };
    }
    function mDel(id, spoerg) {
        var st = D.REAK[id].stoffer, red = spoerg === "red";
        var svar = [
            { t: st.ox, ok: red, f: st.ox + " afgiver elektronerne og er reduktionsmidlet. Oxidationsmidlet optager elektroner." },
            { t: st.red, ok: !red, f: st.red + " optager elektronerne og er oxidationsmidlet. Reduktionsmidlet afgiver elektroner." },
            { t: st.prod, f: st.prod + " er et produkt. " + (red ? "Reduktionsmidlet" : "Oxidationsmidlet") + " er et af de stoffer, der reagerer." }
        ];
        svar.forEach(function (x) { if (x.ok) delete x.f; });
        var svaret = red ? st.ox + " afgiver elektronerne, så " + st.ox.toLowerCase() + " er reduktionsmidlet." :
            st.red + " optager elektronerne, så " + st.red.toLowerCase() + " er oxidationsmidlet.";
        return {
            type: "spm", reak: id, om: ["ox", "red"],
            tekst: red ? "Hvilket stof er reduktionsmidlet i reaktionen?" : "Hvilket stof er oxidationsmidlet i reaktionen?",
            svar: svar,
            hint: [
                red ? "Reduktionsmidlet er det stof, der afgiver elektroner." : "Oxidationsmidlet er det stof, der optager elektroner.",
                red ? "Se efter den delreaktion, hvor elektronerne står til højre for pilen." : "Se efter den delreaktion, hvor elektronerne står til venstre for pilen.",
                svaret
            ],
            godt: svaret
        };
    }
    function ekstra(id, navn, reaktioner, slags, loest) {
        var dele = [];
        NK.bland(reaktioner.slice()).forEach(function (r, i) {
            if (slags === "let") { dele.push(eDel(r, true)); return; }
            dele.push(eDel(r, false));
            dele.push(gDel(r));
            if (slags === "svaer") dele.push(mDel(r, i % 2 ? "ox" : "red"));
        });
        return { id: id, navn: navn, chip: navn, ekstra: true, slags: slags, dele: dele, loest: loest };
    }
    D.D_MAAL.push(
        ekstra("let", "Let", ["mgcl", "nacl", "zncu", "cao"], "let",
            "Alle fire reaktioner er løst. I den mellemsvære sætter du også selv tallene foran delreaktionerne."),
        ekstra("middel", "Middel", ["lio", "kbr", "cuag", "zno"], "middel",
            "Alle fire reaktioner er løst. I den svære skal begge delreaktioner ganges."),
        ekstra("svaer", "Svær", ["alo", "alcl", "fecl", "alcu"], "svaer",
            "Alle fire reaktioner er løst. Du kan skrive delreaktioner og finde reduktions- og oxidationsmidlet.")
    );

    /* Mærkaterne paa fane 2 og 3. farve: oxidation orange og reduktion blaa
       som i bogen. Midlerne er sorte, saa farven ikke afsloerer pladsen. */
    D.BRIKKER = {
        e:                { tekst: "e^−" },
        oxidation:        { tekst: "Oxidation", farve: "ox" },
        reduktion:        { tekst: "Reduktion", farve: "red" },
        reduktionsmiddel: { tekst: "Reduktionsmiddel" },
        oxidationsmiddel: { tekst: "Oxidationsmiddel" },
        syre:             { tekst: "Syre" },
        base:             { tekst: "Base" }
    };

    /* Forkerte mærkater paa fane 2: { plads: brik } -> forklaring */
    D.navneFejl = function (paa) {
        if (paa.ox === "reduktion" || paa.red === "oxidation") {
            return "Magnesium afgiver elektroner i den øverste delreaktion. At afgive elektroner er en oxidation.";
        }
        return "";
    };
    D.midlerFejl = function (paa) {
        /* paa.ox: under det stof, der oxideres (Mg), paa.red: under det, der reduceres (O₂) */
        if (paa.ox === "oxidationsmiddel" || paa.red === "reduktionsmiddel") {
            return "Navnene kan virke omvendte. Magnesium afgiver elektroner og reducerer dioxygen, så det er reduktionsmidlet.";
        }
        return "";
    };

    /* ================================================================
       Fane 3: Syre/base og redox
       ================================================================ */
    D.SORTER = [
        { id: "nh3", f: "NH_3 + HCl → NH_4^+ + Cl^−", slags: "sb",
          fejl: "NH₃ får et H mere og bliver til NH₄⁺. HCl afgiver en hydron, så det er en syre/base-reaktion." },
        { id: "zn", f: "Zn + Cu^{2+} → Zn^{2+} + Cu", slags: "rx",
          fejl: "Zink bliver til Zn²⁺, og Cu²⁺ bliver til kobber. Ladningerne ændrer sig, fordi der overføres elektroner." },
        { id: "eddike", f: "CH_3COOH + OH^− → CH_3COO^− + H_2O", slags: "sb",
          fejl: "OH⁻ får et H mere og bliver til H₂O. Eddikesyre afgiver en hydron, så det er en syre/base-reaktion." },
        { id: "na", f: "2 Na + Cl_2 → 2 NaCl", slags: "rx",
          fejl: "NaCl består af Na⁺ og Cl⁻. Natrium afgiver elektroner til dichlor, så det er en redoxreaktion." }
    ];

    D.S_MAAL = [
        {
            id: "overfoer", navn: "Det, der overføres",
            forsoeg: {
                om: ["sb", "rx"], indsend: false,
                tekst: "Klik på begge lupper, og se, hvad der bliver overført i hver af de to reaktioner.",
                set: "I syre/base-reaktionen blev en hydron, H⁺, overført. I redoxreaktionen blev elektroner, e⁻, overført.",
                hint: [
                    "Klik på den venstre lup med HCl og den højre lup med magnesium.",
                    "Den lup, der har et gult skilt, har ikke vist sin reaktion endnu. Klik på den.",
                    "Klik på begge lupper. Når begge reaktioner er vist, kommer spørgsmålet."
                ]
            },
            spm: {
                om: ["sb"],
                tekst: "Hvad blev overført fra HCl til H₂O i syre/base-reaktionen?",
                svar: [
                    { t: "En hydron, H⁺", ok: true },
                    { t: "Et hydrogenatom, H",
                      f: "Hydrogenatomets elektron blev hos chlor, så chloridionen er negativ. Kun hydronen blev overført." },
                    { t: "Elektroner, e⁻",
                      f: "Elektroner bliver overført i redoxreaktionen. I den venstre lup blev det orange H overført." }
                ],
                hint: [
                    "Klik på den venstre lup igen, og følg det orange H.",
                    "Den lille orange prik er hydrogenatomets elektron. Den bliver hos chlor.",
                    "Det, der blev overført, er en hydron, H⁺, altså et hydrogenatom uden sin elektron."
                ]
            },
            loest: "I en syre/base-reaktion overføres en hydron, H⁺, fra syren til basen. I en redoxreaktion overføres elektroner, e⁻."
        },
        {
            id: "giver", navn: "Den, der afgiver",
            forsoeg: {
                om: ["maerker"],
                tekst: "Træk de fire mærkater hen under de stoffer, de passer til, og indsend.",
                set: "Alle fire mærkater sidder rigtigt. Under hver mærkat står nu, hvad stoffet afgiver eller optager.",
                hint: [
                    "Syren og reduktionsmidlet afgiver noget. Basen og oxidationsmidlet optager det.",
                    "HCl afgiver en hydron, og magnesium afgiver elektroner.",
                    "Syre under HCl, Base under H₂O, Reduktionsmiddel under Mg og Oxidationsmiddel under O₂."
                ]
            },
            spm: {
                om: ["maerker"],
                tekst: "Et reduktionsmiddel er ikke en syre, men de to har én ting til fælles. Hvad er det?",
                svar: [
                    { t: "Begge afgiver en partikel", ok: true },
                    { t: "Begge optager en partikel",
                      f: "Det er basen og oxidationsmidlet, der optager en partikel. Se, hvad HCl og magnesium gør i lupperne." },
                    { t: "Begge indeholder hydrogen",
                      f: "Magnesium indeholder ikke hydrogen. Se, hvad HCl og magnesium gør i lupperne." }
                ],
                hint: [
                    "Se på HCl i den venstre lup og på magnesium i den højre.",
                    "HCl afgiver en hydron, og magnesium afgiver elektroner.",
                    "Syren og reduktionsmidlet afgiver begge en partikel: en hydron eller elektroner."
                ]
            },
            godt: "Syren HCl afgiver en hydron til basen, og reduktionsmidlet magnesium afgiver elektroner til oxidationsmidlet.",
            loest: "Syren afgiver en hydron, og reduktionsmidlet afgiver elektroner. Basen optager hydronen, og oxidationsmidlet optager elektronerne."
        },
        {
            id: "sorter", navn: "Sortér reaktionerne",
            forsoeg: {
                om: ["kort"],
                tekst: "Træk hver reaktion hen i den rigtige boks, syre/base-reaktion eller redoxreaktion. Indsend.",
                hint: [
                    "Får et stof et H mere efter pilen, er der overført en hydron.",
                    "Bliver et atom uden ladning til en ion, er der overført elektroner.",
                    "NH₃ og eddikesyre reagerer i syre/base-reaktioner. Zink og natrium reagerer i redoxreaktioner."
                ]
            },
            loest: "I en syre/base-reaktion får basen et H mere. I en redoxreaktion bliver atomer til ioner eller omvendt, fordi elektroner overføres."
        }
    ];

    /* Forkerte mærkater paa fane 3. paa: { hcl, h2o, mg, o2 } -> brik */
    D.giverFejl = function (paa) {
        var sb = ["syre", "base"], rx = ["reduktionsmiddel", "oxidationsmiddel"];
        if (rx.indexOf(paa.hcl) >= 0 || rx.indexOf(paa.h2o) >= 0) {
            return "Reduktionsmiddel og oxidationsmiddel er navne i redoxreaktionen, hvor elektroner overføres.";
        }
        if (sb.indexOf(paa.mg) >= 0 || sb.indexOf(paa.o2) >= 0) {
            return "Syre og base er navne i syre/base-reaktionen, hvor en hydron overføres.";
        }
        if (paa.hcl === "base" || paa.h2o === "syre") {
            return "Syren afgiver hydronen. I den venstre lup afgiver HCl sin hydron til H₂O.";
        }
        if (paa.mg === "oxidationsmiddel" || paa.o2 === "reduktionsmiddel") {
            return "Reduktionsmidlet afgiver elektronerne. I den højre lup afgiver magnesium elektroner til oxygen.";
        }
        return "";
    };

    D.FAERDIG = {
        b: "Alle fire opgaver er løst. På fane 2 skriver du oxidationen og reduktionen som delreaktioner.",
        d: "Alle seks opgaver er løst. Vil du træne mere, så vælg en ekstraopgave nederst i listen. Fane 3 sammenligner redox med syre/base.",
        s: "Alle tre opgaver er løst."
    };

    /* Forklaringen efter et rigtigt svar, naar der kommer et spoergsmaal mere,
       hoerer til spoergsmaalet (fane.js laeser del.godt) */
    [D.B_MAAL, D.D_MAAL, D.S_MAAL].forEach(function (liste) {
        liste.forEach(function (o) { if (o.godt && o.spm) o.spm.godt = o.godt; });
    });

    NK.Data = D;
}());

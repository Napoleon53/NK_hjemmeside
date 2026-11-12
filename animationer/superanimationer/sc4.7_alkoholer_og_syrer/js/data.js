/* =====================================================================
   data.js - stofferne, opgaverne og teksterne

   MODELLEN. Eleven bygger et molekyle af en kaede med n carbonatomer
   (0 til 8) og en gruppe for enden: H (alkan), OH (alkohol) eller COOH
   (carboxylsyre). Carbonatomet i COOH taeller med, saa en syre har
   n + 1 carbonatomer i alt (hoejst 8). Med n = 0 staar der kun et H
   foran gruppen: H−H er dihydrogen, H−OH er vand (to paaskeaeg) og
   H−COOH er methansyre. Glycerol er et fast molekyle til fane 3.

   D.stof(g, n) giver alt om stoffet: navn, stofklasse, kogepunkt,
   tilstand ved 20 °C og opløselighed i vand. Opløseligheden regnes af
   bogens tommelfingerregel (afsnit 3.4 og 4.5): der skal 4 carbonatomer
   til at ophaeve virkningen af én polaer gruppe. Faerre end 4 pr. gruppe:
   ét lag. Praecis 4: paa graensen, kun delvist. Flere: to lag.

   Kogepunkterne er ved 1 atm fra CRC Handbook of Chemistry and Physics,
   afrundet til hele grader. Alkanerne er de samme som i bogens figur
   kogepunkter (4.1) og i sc4.1, og ethan, ethanol, propan og methansyre
   er de samme som i afsnit 4.5 og opgaverne til 4.5.

   Et maal (opgave) har sine dele i listen dele (se js/fane.js): et
   forsoeg (eleven bygger, evt. med Indsend svar) eller et spoergsmaal.
   Graenser, som selvtesten taeller: et spoergsmaal 105, et svar 34, et
   forsoeg 95, et hint 100, forklaringen til et forkert svar 110 og til
   det rigtige 160.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne ------------------------------------------------------------------- */
    D.MAKS_C = 8;
    D.STAMME = ["", "meth", "eth", "prop", "but", "pent", "hex", "hept", "oct"];

    /* Kogepunkt i °C efter antal carbonatomer i alt (indeks 1 til 8) */
    D.KP = {
        H: [null, -162, -89, -42, -1, 36, 69, 98, 126],
        OH: [null, 65, 78, 97, 118, 138, 158, 176, 195],
        COOH: [null, 101, 118, 141, 164, 186, 205, 223, 239]
    };

    D.KLASSE = { H: "alkan", OH: "alkohol", COOH: "carboxylsyre" };
    D.GRUPPE_NAVN = { H: "ingen gruppe", OH: "hydroxygruppe", COOH: "carboxylgruppe" };

    /* Navne, eleverne kender fra bogens tabeller i 4.5 */
    D.KENDT = {
        alkohol1: "træsprit",
        alkohol2: "alkoholen i øl og vin",
        carboxylsyre1: "myresyre",
        carboxylsyre2: "eddikesyre",
        carboxylsyre4: "smørsyre"
    };

    D.STUE = 20;   /* stuetemperatur, °C */

    /* Den hoejeste kaede, gruppen tillader: syren har et carbonatom i COOH */
    D.maksN = function (g) { return g === "COOH" ? D.MAKS_C - 1 : D.MAKS_C; };

    /* Opløseligheden efter tommelfingerreglen: "ja", "delvist" eller "nej" */
    D.oploeselig = function (C, polaere) {
        if (!polaere) return "nej";
        var pr = C / polaere;
        if (pr < 4) return "ja";
        if (pr === 4) return "delvist";
        return "nej";
    };

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    D.stort = stort;

    D.stof = function (g, n) {
        if (g === "glycerol") {
            return {
                id: "glycerol", g: "glycerol", n: 3, C: 3, navn: "glycerol", klasse: "alkohol",
                stamme: "", del2: "", endelse: "", polaere: 3, kp: 290, opl: "ja", tilstand: "væske",
                kendt: "tre OH-grupper", organisk: true
            };
        }
        var s = { g: g, n: n, organisk: true, kendt: "" };
        if (n === 0 && g === "H") {
            s.id = "dihydrogen"; s.C = 0; s.navn = "dihydrogen"; s.klasse = "ikke organisk";
            s.polaere = 0; s.kp = -253; s.opl = "nej"; s.organisk = false;
        } else if (n === 0 && g === "OH") {
            s.id = "vand"; s.C = 0; s.navn = "vand"; s.klasse = "ikke organisk";
            s.polaere = 1; s.kp = 100; s.opl = "vand"; s.organisk = false;
        } else {
            var C = n + (g === "COOH" ? 1 : 0);
            s.C = C;
            s.klasse = D.KLASSE[g];
            s.id = s.klasse + C;
            s.stamme = D.STAMME[C];
            s.del2 = "an";
            if (g === "H") s.endelse = "";
            else if (g === "OH") s.endelse = C <= 2 ? "ol" : "-1-ol";
            else s.endelse = "syre";
            s.navn = s.stamme + s.del2 + s.endelse;
            s.polaere = g === "H" ? 0 : 1;
            s.kp = D.KP[g][C];
            s.opl = D.oploeselig(C, s.polaere);
            s.kendt = D.KENDT[s.id] || "";
        }
        s.tilstand = s.kp < D.STUE ? "gas" : "væske";
        s.Navn = stort(s.navn);
        return s;
    };

    /* Alle de stoffer, eleven kan bygge (til selvtesten og skemaerne) */
    D.alle = function () {
        var ud = [];
        ["H", "OH", "COOH"].forEach(function (g) {
            for (var n = 0; n <= D.maksN(g); n++) ud.push(D.stof(g, n));
        });
        return ud;
    };

    /* Teksten under glasset paa fane 3 */
    D.OPL_TEKST = {
        ja: ["Ét lag", "Stofferne blandes."],
        delvist: ["Kun delvist", "To lag, men noget opløses."],
        nej: ["To lag", "Stofferne blandes ikke."],
        gas: ["En gas", "Den bobler ud af vandet."],
        vand: ["Ét lag", "Vand blandes med vand."]
    };
    D.oplNoegle = function (s) {
        if (s.opl === "vand") return "vand";
        if (s.tilstand === "gas") return "gas";
        return s.opl;
    };

    /* ----- Opgaverne -------------------------------------------------------------------
       start: molekylet, opgaven begynder med. laast: eleven kan ikke bygge om.
       En del kan have:
         maal      hvad et forsoeg uden Indsend svar venter paa (se sim.js)
         indsend   Indsend svar sender molekylet; tjek(s) giver null, naar det
                   er rigtigt, og ellers forklaringen til det forkerte svar
         svarStof  det molekyle, Vis svaret bygger
         styr      det, eleven maa roere: "gruppe" og "laengde"
         skjul     det, der er skjult, til delen er klaret: "navn", "glas"
         om        det, delen handler om, som faar en rolig gul ring:
                   "kaede", "hylde", "navn", "termo", "lup", "glas" */

    /* Fejl, naar eleven har bygget noget andet end en bestemt stofklasse */
    function forkertKlasse(s, klasse) {
        if (s.id === "vand") return "Uden carbonatomer er H og OH blot vand. Gør kæden længere med +.";
        if (s.id === "dihydrogen") return "Uden carbonatomer er H og H blot dihydrogen. Gør kæden længere med +.";
        if (klasse === "carboxylsyre") {
            return s.g === "OH" ? "Molekylet har en OH-gruppe og er en alkohol. En carboxylsyre har gruppen COOH."
                : "Molekylet har ingen gruppe og er en alkan. Træk COOH-gruppen hen på kæden.";
        }
        if (klasse === "alkohol") {
            return s.g === "COOH" ? "Molekylet har gruppen COOH og er en carboxylsyre. En alkohol har en OH-gruppe."
                : "Molekylet har ingen gruppe og er en alkan. Træk OH-gruppen hen på kæden.";
        }
        return "Opgaven handler om alkaner uden gruppe. Træk −H hen på kæden i stedet for " + (s.g === "OH" ? "OH." : "COOH.");
    }

    /* Fejl, naar en carboxylsyre har det forkerte antal carbonatomer */
    function syreFejl(s, C) {
        if (s.C === C + 1) return "Syren har " + s.C + " carbonatomer, for carbonatomet i COOH tæller med. Gør kæden ét carbonatom kortere.";
        if (s.C > C) return "Syren har " + s.C + " carbonatomer i alt, også det i COOH. Gør kæden kortere.";
        return "Syren har kun " + s.C + " carbonatom" + (s.C === 1 ? "" : "er") + " i alt. Gør kæden længere.";
    }

    D.N_MAAL = [
        {
            id: "ol", navn: "Endelsen -ol", start: { g: "H", n: 2 },
            dele: [
                {
                    type: "forsoeg", maal: "ol_laengder", styr: ["gruppe", "laengde"], om: ["hylde", "kaede"],
                    tekst: "Træk OH-gruppen hen på kæden, og gør kæden længere med +. Se, hvordan navnet ændrer sig.",
                    set: "Navnet følger kædens længde, men ender hele tiden på -ol.",
                    hint: [
                        "OH-gruppen ligger på hylden under kæden. Træk den hen til enden af kæden.",
                        "Klik på + under kæden for at gøre den længere. Prøv tre forskellige længder.",
                        "Sæt OH-gruppen på, og klik på + to gange."
                    ]
                },
                {
                    type: "spm", om: ["navn"],
                    tekst: "Hvad fortæller endelsen -ol i navnet på et stof?",
                    svar: [
                        { t: "Stoffet har en OH-gruppe", ok: true },
                        { t: "Stoffet er en olie",
                          f: "Olie har ingen OH-gruppe. Endelsen -ol viser, at stoffet har en OH-gruppe." },
                        { t: "Kæden har ét carbonatom",
                          f: "Første del af navnet, for eksempel meth, eth og prop, viser antallet af carbonatomer." }
                    ],
                    hint: [
                        "Se på navnet, mens OH-gruppen sidder på kæden, og når −H sidder der.",
                        "Navnet ender på -ol, så længe OH-gruppen sidder på kæden, uanset kædens længde.",
                        "Endelsen -ol viser, at stoffet har en OH-gruppe."
                    ]
                }
            ],
            loest: "En alkohol har en OH-gruppe, og navnet på en alkohol ender på -ol. OH-gruppen kaldes en hydroxygruppe."
        },
        {
            id: "syre", navn: "Endelsen -syre", start: { g: "H", n: 2 },
            dele: [
                {
                    type: "forsoeg", maal: "cooh", styr: ["gruppe"], om: ["hylde", "kaede"],
                    tekst: "Kæden har 2 carbonatomer. Træk COOH-gruppen hen på kæden, og se på navnet.",
                    set: "Med COOH-gruppen på kæden med 2 carbonatomer hedder stoffet propansyre.",
                    hint: [
                        "COOH-gruppen ligger på hylden under kæden.",
                        "Træk COOH-gruppen hen til enden af kæden, eller klik på den på hylden.",
                        "Klik på COOH-gruppen på hylden."
                    ]
                },
                {
                    type: "spm", om: ["kaede"],
                    tekst: "Kæden havde 2 carbonatomer. Hvorfor hedder syren propansyre og ikke ethansyre?",
                    svar: [
                        { t: "Carbonatomet i COOH tæller med", ok: true },
                        { t: "-syre tæller ét carbonatom ekstra",
                          f: "Endelsen -syre viser kun gruppen. Tæl alle carbonatomer i molekylet, også det i COOH." },
                        { t: "Oxygenatomerne tæller med",
                          f: "Første del af navnet tæller kun carbonatomer. Se efter carbonatomet i COOH-gruppen." }
                    ],
                    hint: [
                        "Prop betyder 3 carbonatomer. Tæl carbonatomerne på tegningen.",
                        "COOH-gruppen har sit eget carbonatom, det med dobbeltbindingen til O.",
                        "Carbonatomet i COOH tæller med i navnet, så der er 3 i alt."
                    ]
                }
            ],
            loest: "En carboxylsyre har en COOH-gruppe, og navnet ender på -syre. COOH-gruppen kaldes en carboxylgruppe, og carbonatomet i den tæller med i navnet."
        },
        {
            id: "smoer", navn: "Byg smørsyre", start: { g: "H", n: 2 },
            dele: [
                {
                    type: "forsoeg", indsend: true, styr: ["gruppe", "laengde"], skjul: ["navn"], om: ["kaede"],
                    svarStof: { g: "COOH", n: 3 },
                    tekst: "Smørsyre giver harsk smør en grim lugt og hedder butansyre. Byg butansyre, og indsend.",
                    set: "Butansyre har 4 carbonatomer, 3 i kæden og 1 i COOH-gruppen.",
                    tjek: function (s) {
                        if (s.klasse !== "carboxylsyre") return forkertKlasse(s, "carboxylsyre");
                        return s.C === 4 ? null : syreFejl(s, 4);
                    },
                    hint: [
                        "But betyder 4 carbonatomer i alt. Tabellen i panelet viser første del af navnene.",
                        "Carbonatomet i COOH tæller med, så kæden før COOH skal have 3 carbonatomer.",
                        "Sæt COOH-gruppen på en kæde med 3 carbonatomer, og indsend."
                    ]
                }
            ],
            loest: "Butansyre har 4 carbonatomer, 3 i kæden og 1 i COOH-gruppen. Første del af navnet tæller dem alle."
        },
        {
            id: "navngiv", navn: "Hvad hedder alkoholen?", start: { g: "OH", n: 3 }, laast: true,
            dele: [
                {
                    type: "spm", skjul: ["navn"], om: ["kaede"],
                    tekst: "Tegningen viser en alkohol. Hvad hedder stoffet?",
                    svar: [
                        { t: "propan-1-ol", ok: true },
                        { t: "butan-1-ol",
                          f: "Tæl carbonatomerne igen. OH-gruppen har intet carbonatom, så der er kun 3." },
                        { t: "propansyre",
                          f: "Molekylet har en OH-gruppe og ikke COOH. Det er en alkohol, og navnet ender på -ol." },
                        { t: "propan",
                          f: "Propan er alkanen uden OH-gruppe. Med OH-gruppen ender navnet på -ol." }
                    ],
                    hint: [
                        "Tæl carbonatomerne. Tabellen i panelet viser første del af navnet.",
                        "Der er 3 carbonatomer, så første del er prop. En alkohol ender på -ol.",
                        "Stoffet hedder propan-1-ol."
                    ]
                },
                {
                    type: "spm", om: ["kaede"],
                    tekst: "Hvad viser tallet 1 i navnet propan-1-ol?",
                    svar: [
                        { t: "OH sidder på carbonatom 1", ok: true },
                        { t: "Molekylet har én OH-gruppe",
                          f: "Tallet viser ikke antallet af OH-grupper. Det viser, hvilket carbonatom OH-gruppen sidder på." },
                        { t: "Kæden har ét carbonatom",
                          f: "Kæden har 3 carbonatomer, som prop viser. Tallet viser, hvor OH-gruppen sidder." }
                    ],
                    hint: [
                        "I en kæde med 3 eller flere carbonatomer kan OH-gruppen sidde forskellige steder.",
                        "Carbonatomerne nummereres fra den ende, OH-gruppen sidder i.",
                        "Tallet 1 viser, at OH-gruppen sidder på carbonatom 1 for enden af kæden."
                    ]
                }
            ],
            loest: "Tallet viser, hvilket carbonatom OH-gruppen sidder på. I propan-2-ol sidder den på det midterste carbonatom."
        },
        {
            id: "myre", navn: "Byg myresyre", start: { g: "H", n: 2 },
            dele: [
                {
                    type: "forsoeg", indsend: true, styr: ["gruppe", "laengde"], skjul: ["navn"], om: ["kaede"],
                    svarStof: { g: "COOH", n: 0 },
                    tekst: "Myresyre hedder methansyre og har kun 1 carbonatom. Byg methansyre, og indsend.",
                    set: "I methansyre sidder der kun et hydrogenatom før COOH-gruppen. Formlen er HCOOH.",
                    tjek: function (s) {
                        if (s.klasse !== "carboxylsyre") return forkertKlasse(s, "carboxylsyre");
                        return s.C === 1 ? null : syreFejl(s, 1);
                    },
                    hint: [
                        "Methansyre har 1 carbonatom i alt, og det sidder i COOH-gruppen.",
                        "Gør kæden kortere med −, til der ikke er noget carbonatom før COOH-gruppen.",
                        "Sæt COOH-gruppen på, og klik på −, til der kun står H før COOH."
                    ]
                }
            ],
            loest: "Methansyre, HCOOH, har kun carbonatomet i COOH-gruppen. Den findes i myrer og brændenælder."
        }
    ];

    D.K_MAAL = [
        {
            id: "tre", navn: "Tre stoffer med 2 C", start: { g: "H", n: 2 },
            dele: [
                {
                    type: "forsoeg", maal: "tre_c2", styr: ["gruppe", "laengde"], om: ["hylde", "termo"],
                    svarStof: { g: "COOH", n: 1 },
                    tekst: "Byg ethan, ethanol og ethansyre. Se kogepunktet på termometeret for hvert stof.",
                    set: "Ethan koger ved −89 °C, ethanol ved 78 °C og ethansyre ved 118 °C.",
                    hint: [
                        "Ethan har −H for enden. Ethanol har en OH-gruppe, og ethansyre har en COOH-gruppe.",
                        "Ethansyre har 2 carbonatomer i alt. Kæden før COOH skal have 1 carbonatom.",
                        "Byg −H og OH på en kæde med 2 carbonatomer og COOH på en kæde med 1."
                    ]
                },
                {
                    type: "spm", om: ["termo"],
                    tekst: "Alle tre stoffer har 2 carbonatomer. Hvorfor koger ethanol og ethansyre ved højere temperatur?",
                    svar: [
                        { t: "Polære grupper holder dem sammen", ok: true },
                        { t: "De har flere carbonatomer",
                          f: "Alle tre stoffer har 2 carbonatomer. Forskellen er gruppen for enden af kæden." },
                        { t: "Oxygen gør molekylerne tunge",
                          f: "Propan vejer næsten det samme som ethanol, men koger ved −42 °C. Det er gruppen, der gør forskellen." }
                    ],
                    hint: [
                        "Ethan har ingen gruppe. Ethanol og ethansyre har en gruppe med oxygen.",
                        "OH og COOH er polære grupper, fordi oxygen har en høj elektronegativitet.",
                        "De polære grupper får molekylerne til at holde bedre fast i hinanden."
                    ]
                }
            ],
            loest: "OH og COOH er polære grupper. De får molekylerne til at holde bedre fast i hinanden, så stoffet koger ved en højere temperatur."
        },
        {
            id: "lup", navn: "Luppen over ethanol", start: { g: "OH", n: 2 }, laast: true,
            dele: [
                {
                    type: "spm", om: ["lup"],
                    tekst: "Luppen viser molekylerne i flydende ethanol. Hvad viser de stiplede linjer mellem OH-grupperne?",
                    svar: [
                        { t: "H i én OH tiltrækker O i en anden", ok: true },
                        { t: "Bindinger inde i et molekyle",
                          f: "Bindingerne inde i et molekyle ses ikke i kuglemodellen. De stiplede linjer går mellem to molekyler." },
                        { t: "Elektroner, der flytter",
                          f: "Elektronerne bliver i molekylerne. Linjen viser, at H i én OH-gruppe tiltrækker O i en anden." }
                    ],
                    hint: [
                        "Se, hvilke to atomer hver stiplet linje går imellem.",
                        "Linjen går fra H i én OH-gruppe til O i en OH-gruppe på et andet molekyle.",
                        "H i OH-gruppen er positiv, og O er negativ, så de tiltrækker hinanden."
                    ]
                }
            ],
            loest: "Den stiplede linje viser en hydrogenbinding. H i en OH-gruppe er positiv (δ+), og O er negativ (δ−), så to OH-grupper tiltrækker hinanden."
        },
        {
            id: "vaeske", navn: "Gas eller væske", start: { g: "H", n: 1 },
            dele: [
                {
                    type: "forsoeg", indsend: true, styr: ["gruppe", "laengde"], om: ["termo"],
                    svarStof: { g: "H", n: 5 },
                    tekst: "Byg den korteste alkan, der er en væske ved 20 °C, og indsend.",
                    set: "Pentan koger ved 36 °C og er en væske ved 20 °C. Butan koger ved −1 °C og er en gas.",
                    tjek: function (s) {
                        if (s.klasse !== "alkan") return forkertKlasse(s, "alkan");
                        if (s.C < 5) return D.stort(s.navn) + " koger ved " + D.grader(s.kp) + ", så ved 20 °C er den en gas.";
                        if (s.C > 5) return D.stort(s.navn) + " er en væske ved 20 °C, men der findes en kortere alkan, som også er det.";
                        return null;
                    },
                    hint: [
                        "En alkan har −H for enden. Gør kæden længere, og se på termometeret.",
                        "Et stof er en væske ved 20 °C, når kogepunktet er over 20 °C.",
                        "Pentan med 5 carbonatomer er den korteste alkan, der er en væske."
                    ]
                },
                {
                    type: "spm", om: ["lup"],
                    tekst: "Hvorfor stiger kogepunktet, når kæden bliver længere?",
                    svar: [
                        { t: "Kontaktfladen bliver større", ok: true },
                        { t: "Der kommer flere OH-grupper",
                          f: "Alkanen har ingen OH-gruppe. Se på de orange flader mellem kæderne i luppen." },
                        { t: "Molekylet bliver mere polært",
                          f: "Kæden er upolær. Se på de orange flader, hvor kæderne rører hinanden i luppen." }
                    ],
                    hint: [
                        "Se på de orange flader i luppen, hvor to kæder rører hinanden.",
                        "Gør kæden længere, så bliver de orange flader længere.",
                        "Jo længere kæden er, jo større er fladen, hvor molekylerne rører hinanden."
                    ]
                }
            ],
            loest: "Jo længere kæden er, jo større er fladen, hvor to molekyler rører hinanden, og jo bedre holder de fast i hinanden."
        },
        {
            id: "samme", navn: "Samme kogepunkt", start: { g: "COOH", n: 1 },
            dele: [
                {
                    type: "forsoeg", indsend: true, styr: ["gruppe", "laengde"], om: ["termo"],
                    svarStof: { g: "OH", n: 4 },
                    tekst: "Ethansyre koger ved 118 °C. Byg den alkohol, der koger ved samme temperatur, og indsend.",
                    set: "Butan-1-ol koger ved 118 °C ligesom ethansyre, men har 4 carbonatomer.",
                    tjek: function (s) {
                        if (s.klasse !== "alkohol") return forkertKlasse(s, "alkohol");
                        if (s.kp === 118) return null;
                        return D.stort(s.navn) + " koger ved " + D.grader(s.kp) + ". Gør kæden " + (s.kp < 118 ? "længere." : "kortere.");
                    },
                    hint: [
                        "Sæt OH-gruppen på kæden, og gør kæden længere, mens du ser på termometeret.",
                        "Ethanol koger ved 78 °C. Alkoholen skal have en længere kæde.",
                        "Butan-1-ol med 4 carbonatomer koger ved 118 °C."
                    ]
                },
                {
                    type: "spm", om: ["lup"], lupSammen: { g: "COOH", n: 1 },
                    tekst: "Butan-1-ol har 4 carbonatomer og ethansyre kun 2. Hvorfor koger de ved samme temperatur?",
                    svar: [
                        { t: "COOH holder stærkere fast end OH", ok: true },
                        { t: "Syrer koger altid ved 118 °C",
                          f: "Propansyre koger ved 141 °C. Se i luppen, hvor mange stiplede linjer der er mellem to syremolekyler." },
                        { t: "Ethansyre har den længste kæde",
                          f: "Ethansyre har 2 carbonatomer og butan-1-ol 4. Se på de stiplede linjer i luppen." }
                    ],
                    hint: [
                        "Luppen viser begge stoffer. Tæl de stiplede linjer mellem to molekyler i hvert stof.",
                        "To molekyler ethansyre har to stiplede linjer imellem sig, to molekyler butan-1-ol kun én.",
                        "COOH-gruppen holder stærkere fast end OH-gruppen, så alkoholen skal have en længere kæde."
                    ]
                }
            ],
            loest: "To molekyler ethansyre holder fast i hinanden med to hydrogenbindinger, to alkoholmolekyler med én. Alkoholen skal derfor have en længere kæde."
        }
    ];

    D.V_MAAL = [
        {
            id: "lag", navn: "To lag", start: { g: "OH", n: 2 },
            dele: [
                {
                    type: "forsoeg", maal: "to_lag", styr: ["laengde"], om: ["kaede", "glas"],
                    svarStof: { g: "OH", n: 5 },
                    tekst: "Gør kæden på ethanol længere og længere. Se på glasset med vand, til der bliver to lag.",
                    set: "Med 5 carbonatomer i pentan-1-ol bliver der to lag. Butan-1-ol med 4 ligger på grænsen.",
                    hint: [
                        "Klik på + under kæden. Glasset viser, om alkoholen blandes med vand.",
                        "Ét lag betyder, at stofferne blandes. To lag betyder, at stofferne ikke blandes.",
                        "Gør kæden 5 carbonatomer lang."
                    ]
                },
                {
                    type: "spm", om: ["lup"],
                    tekst: "Hvorfor kan ethanol blandes med vand, når octan-1-ol ikke kan?",
                    svar: [
                        { t: "Den lange kæde er upolær", ok: true },
                        { t: "Octan-1-ol har ingen OH-gruppe",
                          f: "Begge alkoholer har én OH-gruppe. Forskellen er kæden, som er upolær." },
                        { t: "Octan-1-ol er tungere end vand",
                          f: "Octan-1-ol lægger sig øverst, så densiteten er lavere end vands. Det er kæden, der gør forskellen." }
                    ],
                    hint: [
                        "Begge alkoholer har én OH-gruppe. Se på kæden i luppen.",
                        "Vandmolekylerne holder sig væk fra kæden, fordi den er upolær.",
                        "Én OH-gruppe kan ikke holde en lang, upolær kæde i vandet."
                    ]
                }
            ],
            loest: "Vandmolekylerne tiltrækker OH-gruppen, men ikke den upolære kæde. Én OH-gruppe kan ikke holde en lang kæde i vandet."
        },
        {
            id: "lupvand", navn: "Luppen i vand", start: { g: "OH", n: 2 }, laast: true,
            dele: [
                {
                    type: "spm", om: ["lup"],
                    tekst: "Luppen viser ét molekyle ethanol i vand. Hvor går der stiplede linjer til vandmolekylerne?",
                    svar: [
                        { t: "Kun ved OH-gruppen", ok: true },
                        { t: "Langs hele kæden",
                          f: "Kæden er upolær og tiltrækker ikke vandmolekylerne. Se, hvor de stiplede linjer sidder." },
                        { t: "Der er ingen",
                          f: "Se igen på OH-gruppen for enden af molekylet. Derfra går der stiplede linjer til vandet." }
                    ],
                    hint: [
                        "De stiplede linjer viser, hvor et vandmolekyle tiltrækker ethanolmolekylet.",
                        "Kæden er upolær, men OH-gruppen er polær.",
                        "De stiplede linjer sidder kun ved OH-gruppen."
                    ]
                }
            ],
            loest: "OH-gruppen danner hydrogenbindinger til vandmolekylerne. Rundt om den upolære kæde holder vandmolekylerne sig væk."
        },
        {
            id: "laengst", navn: "Den længste alkohol", start: { g: "OH", n: 1 },
            dele: [
                {
                    type: "forsoeg", indsend: true, styr: ["gruppe", "laengde"], skjul: ["glas"], om: ["kaede"],
                    svarStof: { g: "OH", n: 3 },
                    tekst: "Byg den længste alkohol, der kan blandes helt med vand, og indsend.",
                    set: "Propan-1-ol kan blandes helt med vand. Butan-1-ol med 4 carbonatomer ligger på grænsen.",
                    tjek: function (s) {
                        if (s.klasse !== "alkohol") return forkertKlasse(s, "alkohol");
                        if (s.C < 3) return D.stort(s.navn) + " kan blandes med vand, men kæden kan godt være længere.";
                        if (s.C === 4) return "Butan-1-ol har 4 carbonatomer og ligger på grænsen. Den opløses kun delvist.";
                        if (s.C > 4) return D.stort(s.navn) + " giver to lag. Kæden er for lang til én OH-gruppe.";
                        return null;
                    },
                    hint: [
                        "Der skal 4 carbonatomer til at ophæve virkningen af én polær gruppe.",
                        "Med 4 carbonatomer ligger alkoholen på grænsen, så den skal have færre.",
                        "Propan-1-ol med 3 carbonatomer er den længste."
                    ]
                }
            ],
            loest: "Én OH-gruppe kan holde 3 carbonatomer i vandet. Ved 4 carbonatomer ligger alkoholen på grænsen."
        },
        {
            id: "syrelag", navn: "En syre i to lag", start: { g: "COOH", n: 1 },
            dele: [
                {
                    type: "forsoeg", indsend: true, styr: ["gruppe", "laengde"], skjul: ["glas"], om: ["kaede"],
                    svarStof: { g: "COOH", n: 4 },
                    tekst: "Byg en carboxylsyre, der ikke kan opløses i vand, og indsend.",
                    tjek: function (s) {
                        if (s.klasse !== "carboxylsyre") return forkertKlasse(s, "carboxylsyre");
                        if (s.C < 4) return D.stort(s.navn) + " kan blandes med vand. Gør kæden længere.";
                        if (s.C === 4) return "Butansyre har 4 carbonatomer og ligger på grænsen. Gør kæden længere.";
                        return null;
                    },
                    setFn: function (s) {
                        return D.stort(s.navn) + " har " + s.C + " carbonatomer og kun én polær gruppe, så der bliver to lag.";
                    },
                    hint: [
                        "COOH er én polær gruppe. Tæl alle carbonatomer, også det i COOH.",
                        "Med 4 carbonatomer ligger syren på grænsen. Syren skal have flere carbonatomer.",
                        "Pentansyre med 5 carbonatomer kan ikke opløses i vand."
                    ]
                }
            ],
            loest: "COOH-gruppen er én polær gruppe ligesom OH. Fra 5 carbonatomer kan syren ikke opløses i vand."
        },
        {
            id: "glycerol", navn: "Glycerol", start: { g: "glycerol", n: 3 }, laast: true,
            dele: [
                {
                    type: "spm", skjul: ["glas"], om: ["kaede"],
                    tekst: "Glycerol har 3 carbonatomer og 3 OH-grupper. Kan glycerol blandes med vand?",
                    svar: [
                        { t: "Ja, i alle forhold", ok: true },
                        { t: "Nej, der bliver to lag",
                          f: "Der er 3 polære grupper til kun 3 carbonatomer. Én gruppe kan holde op til 3 carbonatomer." },
                        { t: "Kun delvist",
                          f: "Et stof ligger på grænsen ved 4 carbonatomer pr. polær gruppe, men glycerol har kun 1 pr. gruppe." }
                    ],
                    hint: [
                        "Tæl carbonatomerne pr. OH-gruppe.",
                        "Glycerol har 1 carbonatom pr. OH-gruppe. Grænsen går ved 4.",
                        "Glycerol kan blandes med vand i alle forhold."
                    ]
                }
            ],
            loest: "Glycerol har 1 carbonatom pr. OH-gruppe. Alle tre OH-grupper danner hydrogenbindinger til vandmolekylerne."
        }
    ];

    /* ----- Svar paa klik ------------------------------------------------------------------ */
    /* Naar gruppen er laast, og naar kaedens laengde er laast */
    D.gruppeLaast = "Gruppen er valgt i denne opgave. Gør kæden længere eller kortere med + og −.";
    D.laengdeLaast = "Kæden har en fast længde i denne opgave. Træk en gruppe hen på kæden.";
    D.alleLaast = "Molekylet er bygget i denne opgave. Svar på spørgsmålet på kortet.";
    D.kortest = "Kæden kan ikke blive kortere.";
    D.laengst = "Kæden kan ikke blive længere her. Den længste har 8 carbonatomer i alt.";
    D.trakForbi = "Slip gruppen ved enden af kæden, hvor den gule ring er.";
    D.PAASKE = {
        vand: "Uden carbonatomer er H−OH vand. Vand er ikke et organisk stof, men har også en OH-gruppe.",
        dihydrogen: "Uden carbonatomer er H−H dihydrogen, en gas, der koger ved −253 °C."
    };

    /* Et kogepunkt som tekst: −89 °C */
    D.grader = function (t) { return (t < 0 ? "−" + Math.abs(t) : String(t)) + " °C"; };

    D.FAERDIG = {
        n: "Alle fem opgaver om navnene er løst. På fane 2 undersøger du kogepunkterne.",
        k: "Alle fire opgaver om kogepunkterne er løst. På fane 3 kommer stofferne i vand.",
        v: "Alle fem opgaver om stofferne i vand er løst."
    };

    NK.Data = D;
}());

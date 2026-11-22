/* =====================================================================
   sim_en.js - fane 1: elektronegativitet

   To atomer deler ét elektronpar. Scenen viser tovtraekningen:

     elektronparret  ligger midt imellem, naar atomerne traekker lige
                     haardt, og glider mod det, der traekker haardest.
                     Ved ΔEN = 2,0 eller mere tager det atom det helt.
     elektronskyen   er tykkest ved det atom, der traekker haardest.
     δ+ og δ−        ved en polaer binding; + og − ved ioner.

   Runde T8 (22. nov. 2026, Niels' ja til forslagene efter REGELSAET):
   panelet er vaek (REGELSAET 2, 3). Opgaverne staar i raekken oeverst
   (js/en_opgaver.js), ΔEN-skalaen staar centreret lige under kortet
   (REGELSAET 37), det periodiske system staar i scenen til venstre, og
   tavlen med regnestykket staar paa et lyst papir til hoejre (REGELSAET
   27-29). Det, et trin spoerger om, er skjult, til det er besvaret.
   Bindinger skrives som i Kemibogen med en lang streg: H−Cl.

   Et klik i tabellen saetter atomet paa pladsen med den gule ring. I byg-
   opgaverne og i den fri leg hopper ringen saa til det andet atom, og et
   klik paa et atom i scenen flytter ringen. Et metal kan kun saettes
   sammen med N, O, F eller Cl (D.tilladt i data.js).

   Hvor langt parret glider, er ΔEN / 2 (hoejst 0,92 for en polaer
   binding). Det er en tegning af tovtraekningen, ikke en beregning af
   elektrontaetheden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var PLUS = "#f39a8f";
    var MINUS = "#8fcaf0";
    var GUL = "#f2c53d";
    var LEX = "Lexend, 'Segoe UI', sans-serif";
    var SKALA_MAKS = 3.5;
    var SPRITE_KUGLE = 128 / 120;     /* atomspritet er 128 bredt, kuglen 120 */
    var STREG = "−";                  /* bindingen som i Kemibogen: H−Cl */

    /* De grundstoffer, der ikke er med, staar som tomme felter, saa
       tabellen ligner det periodiske system. De svarer ogsaa paa klik. */
    var KOLONNER = [1, 2, 13, 14, 15, 16, 17];
    var TOMME = {
        "2-2": ["Be", "beryllium"], "2-13": ["B", "bor"],
        "3-2": ["Mg", "magnesium"], "3-13": ["Al", "aluminium"], "3-14": ["Si", "silicium"], "3-15": ["P", "phosphor"], "3-16": ["S", "svovl"],
        "4-2": ["Ca", "calcium"], "4-13": ["Ga", "gallium"], "4-14": ["Ge", "germanium"], "4-15": ["As", "arsen"], "4-16": ["Se", "selen"], "4-17": ["Br", "brom"]
    };

    function en(el) { return D.GRUNDSTOFFER[el].en; }
    function navn(el) { return D.GRUNDSTOFFER[el].navn; }
    function binding(a, b) { return a + STREG + b; }
    function har(a, b, el) { return a === el || b === el; }
    function tal(v) { return NK.tal(v, 1); }
    function html(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    /* Det atom, der traekker haardest, og det andet (lige: i raekkefoelge) */
    function hoejLav(a, b) {
        var hoej = en(a) >= en(b) ? a : b;
        return [hoej, hoej === a ? b : a];
    }

    /* "3,0 − 2,1 = 0,9": den stoerste minus den mindste */
    function regning(a, b) {
        var hl = hoejLav(a, b);
        return tal(en(hl[0])) + " − " + tal(en(hl[1])) + " = " + tal(D.dEN(a, b));
    }

    /* "ΔEN = EN(Cl) − EN(H) = 3,0 − 2,1 = 0,9" */
    function fuldRegning(a, b) {
        var hl = hoejLav(a, b);
        return "ΔEN = EN(" + hl[0] + ") − EN(" + hl[1] + ") = " + regning(a, b) + ".";
    }

    /* Farven i tabellen: blaa ved lav elektronegativitet, gennem lilla til
       roed ved hoej, saa man kan se den stige mod fluor. */
    function enFarve(v, lys) {
        var t = NK.klamp((v - 0.8) / 3.2, 0, 1);
        var hue = Math.round(228 + 140 * t) % 360;
        return "hsl(" + hue + ", " + (lys ? "72%, 64%" : (40 + 18 * t) + "%, " + (26 + 8 * t) + "%") + ")";
    }

    /* Forklaringen til et forkert ΔEN i feltet */
    function fejlDEN(a, b) {
        return function (v) {
            var d = D.dEN(a, b), sum = en(a) + en(b);
            if (Math.abs(v + d) < 1e-6) return "ΔEN er aldrig negativ. Træk den mindste elektronegativitet fra den største.";
            if (Math.abs(v - sum) < 1e-6) return "Du har lagt elektronegativiteterne sammen. ΔEN er forskellen mellem dem.";
            return "Aflæs elektronegativiteten under hvert atom, og træk den mindste fra den største.";
        };
    }

    /* Svarene til "Hvilken slags binding er ...?" i fast raekkefoelge */
    function typeSvar(rigtig) {
        var nej = {
            upolaer: "En upolær binding har en ΔEN under 0,5.",
            polaer: "En polær binding har en ΔEN fra 0,5 til under 2,0.",
            ion: "En ionbinding kræver, at ΔEN er 2,0 eller mere."
        };
        return D.TYPE_ORDEN.map(function (t) {
            return { t: D.TYPER[t].knap, ok: t === rigtig, nej: nej[t] };
        });
    }

    var HINT_SKALA = ["Se på ΔEN-skalaen under kortet.", "Grænserne er 0,5 og 2,0."];

    function parEr(s, a, b) { return s.par[0] === a && s.par[1] === b; }

    /* ----- Opgaverne ------------------------------------------------------------
       Seks opgaver i fast raekkefoelge som Kemibogens eksempler i 3.3
       (REGELSAET 11-18). skjul: det, der er skjult, mens trinet staar
       uloest (se NK.EnOpgaver.skjult). spoerger: den linje paa tavlen,
       der har "?" og gul ramme. */
    var OPGAVER = [
        {
            id: "hcl", navn: "Hydrogenchlorid", par: ["H", "Cl"],
            trin: [
                {
                    type: "valg", skjul: ["skift", "skala", "tavle", "tabel"],
                    tekst: "Tallet under hvert atom er atomets elektronegativitet (EN).",
                    spm: "Hvilket atom i bindingen H−Cl trækker hårdest i elektronparret?",
                    svar: [
                        { t: "H", nej: "H har den mindste elektronegativitet, 2,1. Det atom, der har den største elektronegativitet, trækker hårdest." },
                        { t: "Cl", ok: true },
                        { t: "De trækker lige hårdt", nej: "Det gør de kun, når de har samme elektronegativitet. Her har Cl 3,0 og H 2,1." }
                    ],
                    hint: ["Elektronegativitet er et mål for, hvor kraftigt et atom trækker i de fælles elektroner.",
                        "Se på tallene under atomerne. Hvilket tal er størst?",
                        "Cl har 3,0, og H har 2,1."],
                    slut: "Cl har den største elektronegativitet, 3,0. Derfor ligger elektronparret tættest på Cl."
                },
                {
                    type: "valg", skjul: ["skala", "tavle", "tabel"],
                    tekst: "Cl er blevet δ−, og H er blevet δ+.",
                    spm: "Hvad betyder δ− ved Cl i bindingen H−Cl?",
                    svar: [
                        { t: "Cl har fået en hel elektron", nej: "Så ville Cl være ionen Cl⁻. I H−Cl deles elektronparret stadig. Det ligger bare tættest på Cl." },
                        { t: "Cl har mistet elektroner", nej: "Det er omvendt. Elektronparret ligger tættest på Cl, så Cl har lidt flere elektroner omkring sig." },
                        { t: "Cl er delvist negativ", ok: true }
                    ],
                    hint: ["δ er det græske bogstav delta.",
                        "δ betyder delvist, og − betyder negativ.",
                        "Elektronparret ligger tættest på Cl, men H og Cl deler det stadig."],
                    slut: "δ betyder delvist. Cl er delvist negativ, fordi elektronparret ligger tættest på Cl. H er delvist positiv."
                },
                {
                    type: "valg", skjul: ["dEN", "type", "tabel"], spoerger: "dEN",
                    spm: "Hvor stor er forskellen i elektronegativitet (ΔEN) i bindingen H−Cl?",
                    svar: [
                        { t: "0,9", ok: true },
                        { t: "5,1", nej: "Du har lagt elektronegativiteterne sammen. ΔEN er forskellen mellem dem." },
                        { t: "−0,9", nej: "ΔEN er aldrig negativ. Træk den mindste elektronegativitet fra den største." }
                    ],
                    hint: ["ΔEN er forskellen mellem de to atomers elektronegativitet.",
                        "Træk den mindste elektronegativitet fra den største.",
                        "Cl har 3,0, og H har 2,1."],
                    slut: "ΔEN = EN(Cl) − EN(H) = 3,0 − 2,1 = 0,9. Pilen på ΔEN-skalaen viser 0,9."
                },
                {
                    type: "valg", skjul: ["type", "tabel"], spoerger: "type",
                    spm: "Hvilken slags binding er H−Cl, når ΔEN er 0,9?",
                    svar: typeSvar("polaer"),
                    hint: HINT_SKALA.concat(["0,9 ligger mellem 0,5 og 2,0."]),
                    slut: "0,9 ligger mellem 0,5 og 2,0, så H−Cl er en polær binding."
                }
            ]
        },
        {
            id: "hc", navn: "Carbon og hydrogen", par: ["H", "Cl"],
            trin: [
                {
                    type: "handling", el: "C", slot: 1, skjul: ["skift", "dEN", "type"],
                    tekst: "Det periodiske system til venstre viser elektronegativiteten for hvert atom.",
                    spm: "Klik på C i det periodiske system for at skifte Cl ud med C.",
                    maal: function (s) { return parEr(s, "H", "C"); },
                    hint: ["C står i anden række i det periodiske system.", "Feltet med C har en gul ramme."],
                    visSvar: function (s) { s.saetPar("H", "C"); }
                },
                {
                    type: "felt", skjul: ["skift", "dEN", "type"], spoerger: "dEN", pre: "ΔEN =", facit: 0.4, navn: "ΔEN",
                    spm: "Hvor stor er forskellen i elektronegativitet (ΔEN) i bindingen H−C?",
                    fejl: fejlDEN("H", "C"),
                    hint: ["ΔEN er forskellen mellem de to atomers elektronegativitet.",
                        "Elektronegativiteten står under hvert atom og i det periodiske system.",
                        "C har 2,5, og H har 2,1. Træk den mindste fra den største."],
                    slut: "ΔEN = EN(C) − EN(H) = 2,5 − 2,1 = 0,4."
                },
                {
                    type: "valg", skjul: ["skift", "type"], spoerger: "type",
                    spm: "Hvilken slags binding er H−C, når ΔEN er 0,4?",
                    svar: [
                        { t: "Upolær", ok: true },
                        { t: "Polær", nej: "H og C er forskellige atomer, men ΔEN er under 0,5. Så er bindingen upolær." },
                        { t: "Ionbinding", nej: "En ionbinding kræver, at ΔEN er 2,0 eller mere." }
                    ],
                    hint: HINT_SKALA.concat(["0,4 er under 0,5."]),
                    slut: "0,4 er under 0,5, så H−C er en upolær binding. Elektronparret ligger næsten i midten."
                }
            ]
        },
        {
            id: "nacl", navn: "Køkkensalt", par: ["H", "C"],
            trin: [
                {
                    type: "handling", el: "Cl", slot: 1, skjul: ["skift", "dEN", "type"],
                    tekst: "Køkkensalt er natriumchlorid. Byg bindingen mellem natrium og chlor.",
                    spm: "Klik på Cl i det periodiske system for at skifte C ud med Cl.",
                    maal: function (s) { return s.par[1] === "Cl"; },
                    hint: ["Cl står i tredje række, yderst til højre.", "Feltet med Cl har en gul ramme."],
                    visSvar: function (s) { s.saetPar(s.par[0], "Cl"); }
                },
                {
                    type: "handling", el: "Na", slot: 0, skjul: ["skift", "dEN", "type"],
                    spm: "Klik på Na i det periodiske system for at skifte H ud med Na.",
                    maal: function (s) { return parEr(s, "Na", "Cl"); },
                    hint: ["Na står i tredje række, yderst til venstre.", "Feltet med Na har en gul ramme."],
                    visSvar: function (s) { s.saetPar("Na", "Cl"); }
                },
                {
                    type: "felt", skjul: ["skift", "dEN", "type"], spoerger: "dEN", pre: "ΔEN =", facit: 2.1, navn: "ΔEN",
                    spm: "Hvor stor er forskellen i elektronegativitet (ΔEN) i bindingen Na−Cl?",
                    fejl: fejlDEN("Na", "Cl"),
                    hint: ["ΔEN er forskellen mellem de to atomers elektronegativitet.",
                        "Elektronegativiteten står under hvert atom og i det periodiske system.",
                        "Cl har 3,0, og Na har 0,9. Træk den mindste fra den største."],
                    slut: "ΔEN = EN(Cl) − EN(Na) = 3,0 − 0,9 = 2,1."
                },
                {
                    type: "valg", skjul: ["skift", "type"],
                    spm: "Hvad sker der med elektronparret i Na−Cl, når ΔEN er 2,1?",
                    svar: [
                        { t: "Det deles ligeligt", nej: "Sådan er det kun, når ΔEN er under 0,5." },
                        { t: "Cl tager det helt", ok: true },
                        { t: "Det ligger tættest på Cl", nej: "Sådan er det i en polær binding, hvor ΔEN er under 2,0." }
                    ],
                    hint: ["Se på ΔEN-skalaen under kortet.",
                        "Ved en ΔEN på 2,0 eller mere er bindingen en ionbinding.",
                        "I en ionbinding tager det ene atom elektronerne helt."],
                    slut: "ΔEN er 2,0 eller mere, så Cl tager elektronparret helt. Der dannes ionerne Na⁺ og Cl⁻. Bindingen er en ionbinding."
                }
            ]
        },
        {
            id: "cplus", navn: "Byg: carbon bliver δ+", par: ["C", "H"],
            trin: [
                {
                    type: "byg", slot: 1,
                    tekst: "Klik på et atom i det periodiske system for at skifte H ud.",
                    spm: "Byg en binding, hvor carbon bliver δ+.",
                    ok: function (a, b) { return har(a, b, "C") && D.bindingstype(a, b) === "polaer" && D.staerkest(a, b) !== "C"; },
                    fejl: function (a, b) {
                        if (!har(a, b, "C")) return "Carbon skal være med.";
                        if (a === b) return "C−C er upolær. Sæt et andet atom på carbon.";
                        return binding(a, b) + " er upolær. Vælg et atom, der trækker hårdere end carbon.";
                    },
                    hint: ["Det atom, der trækker hårdest i elektronparret, bliver δ−. Det andet bliver δ+.",
                        "Carbon har elektronegativiteten 2,5. Find et atom, der har mindst 0,5 mere.",
                        "N, O, F og Cl trækker alle hårdere end carbon."],
                    visSvar: function (s) { s.saetPar("C", "O"); },
                    slut: function (s) {
                        var a = s.par[0], b = s.par[1], andet = a === "C" ? b : a;
                        return "I " + binding(a, b) + " trækker " + andet + " hårdere end carbon (" + tal(en(andet)) + " mod 2,5). Derfor bliver carbon δ+.";
                    }
                }
            ]
        },
        {
            id: "hf", navn: "Byg: mest polær med H", par: ["H", "Cl"],
            trin: [
                {
                    type: "byg", slot: 1,
                    tekst: "Klik på et atom i det periodiske system for at skifte Cl ud.",
                    spm: "Byg den mest polære binding, der har hydrogen med.",
                    ok: function (a, b) { return har(a, b, "H") && har(a, b, "F"); },
                    fejl: function (a, b) {
                        if (!har(a, b, "H")) return "Hydrogen skal være med.";
                        if (a === b) return "H−H er upolær.";
                        return binding(a, b) + " har ΔEN = " + tal(D.dEN(a, b)) + ". Der findes en binding med hydrogen, der er mere polær.";
                    },
                    hint: ["Jo større ΔEN er, jo mere polær er bindingen.",
                        "Find det atom, der har den største elektronegativitet.",
                        "Det atom står øverst til højre i det periodiske system."],
                    visSvar: function (s) { s.saetPar("H", "F"); },
                    slut: "Fluor har den største elektronegativitet, 4,0. Derfor er H−F den mest polære binding med hydrogen. ΔEN = 4,0 − 2,1 = 1,9."
                }
            ]
        },
        {
            id: "fire", navn: "Den mest polære", par: ["H", "H"],
            trin: [
                {
                    type: "valg", skjul: ["skala", "tavle"],
                    tekst: "Elektronegativiteten står i det periodiske system.",
                    spm: "Hvilken af bindingerne C−H, N−H, O−H og H−Cl er mest polær?",
                    svar: [
                        { t: "C−H", nej: "C−H har ΔEN = 2,5 − 2,1 = 0,4. Den er upolær." },
                        { t: "N−H", nej: "N−H har ΔEN = 3,0 − 2,1 = 0,9. En af de andre har en større forskel." },
                        { t: "O−H", ok: true },
                        { t: "H−Cl", nej: "H−Cl har ΔEN = 3,0 − 2,1 = 0,9. En af de andre har en større forskel." }
                    ],
                    hint: ["Jo større ΔEN er, jo mere polær er bindingen.",
                        "Hydrogen er med i alle fire. Find det andet atom, der har den største elektronegativitet.",
                        "C har 2,5, N har 3,0, O har 3,5, og Cl har 3,0."],
                    efter: function (s) { s.saetPar("O", "H"); },
                    slut: "O−H har den største forskel i elektronegativitet. ΔEN = 3,5 − 2,1 = 1,4."
                }
            ]
        }
    ];

    /* ----- Simulationen --------------------------------------------------------- */
    NK.SimEN = function () {
        this.laerred = new NK.Laerred(NK.el("en-laerred"));
        this.scene = this.laerred.canvas.parentNode;
        this.par = OPGAVER[0].par.slice();
        this.slot = 1;
        this.aendringer = 0;
        this.tid = 0;
        this.pop = [0, 0];
        this.hover = -1;
        this.geo = null;
        this.lay = null;
        this.vist = { skift: 0, adskil: 0, dEN: D.dEN(this.par[0], this.par[1]) };
        this.OPGAVER = OPGAVER;
        this.e = { pt: NK.el("en-pt"), tabel: NK.el("en-tabel"), tavle: NK.el("en-tavle"), boble: NK.el("en-boble") };
        this._bygTabel();
        this._bindMus();
        this.opgaver = new NK.EnOpgaver(this, OPGAVER);
        this.vist.skift = this.maalSkift();
        this.vist.adskil = this.maalAdskil();
    };

    var P = NK.SimEN.prototype;

    P.skjult = function (del) { return !!this.opgaver && this.opgaver.skjult(del); };

    /* ----- Parret ---------------------------------------------------------- */
    P.type = function () { return D.bindingstype(this.par[0], this.par[1]); };

    /* Hvor langt elektronparret er glidet: −1 helt til venstre, +1 helt
       til hoejre. Mens kortet spoerger om det, staar det i midten. */
    P.maalSkift = function () {
        if (this.skjult("skift")) return 0;
        var a = this.par[0], b = this.par[1];
        var staerk = D.staerkest(a, b);
        if (!staerk) return 0;
        var s = this.type() === "ion" ? 1 : Math.min(D.dEN(a, b) / 2, 0.92);
        return staerk === a ? -s : s;
    };

    P.maalAdskil = function () {
        return !this.skjult("skift") && this.type() === "ion" ? 1 : 0;
    };

    /* En kort besked i kortets nederste raekke */
    P.besked = function (tekst) {
        var o = this.opgaver;
        o.saetBesked(html(tekst), "peger");
        window.clearTimeout(this._ur);
        this._ur = window.setTimeout(function () {
            if (o.besked && o.besked.klasse === "peger") o.saetBesked("", "");
        }, 3500);
    };

    /* Saetter begge atomer paa én gang (opgaverne og selvtesten). */
    P.saetPar = function (a, b) {
        if (this.par[0] !== a) this.pop[0] = 1;
        if (this.par[1] !== b) this.pop[1] = 1;
        this.par = [a, b];
        this.aendringer++;
        if (this.celler) this.opdaterTabel();
    };

    /* Et klik i tabellen: atomet kommer ind paa pladsen med ringen. */
    P.vaelg = function (el) {
        var o = this.opgaver;
        if (!o.tillad(el)) {
            var t = o.trin();
            if (o.tabelAktiv() && t && t.type === "handling") this.besked("Klik på " + t.el + " i det periodiske system.");
            else o.spaer();
            return false;
        }
        var andet = this.par[1 - this.slot];
        var ok = D.tilladt(el, andet);
        if (ok !== true) { this.besked(ok); return false; }
        if (this.par[this.slot] !== el) {
            this.par[this.slot] = el;
            this.pop[this.slot] = 1;
            this.aendringer++;
        }
        /* I den fri leg hopper ringen til det andet atom. I byg-opgaverne
           bliver den paa det atom, kortet siger, der skal skiftes ud. */
        if (o.tilstand === "resultat") this.slot = 1 - this.slot;
        o.klikket();
        this.opdaterTabel();
        return true;
    };

    /* ----- Tabellen i scenen ------------------------------------------------ */
    /* Bygger det lille periodiske system i vaert. Uden klik bliver felterne
       ikke knapper, men en figur at aflaese (fane 2). */
    function bygTabel(vaert, klik, tomKlik) {
        var efterPlads = {}, celler = {};
        D.EN_ORDEN.forEach(function (el) {
            var g = D.GRUNDSTOFFER[el];
            efterPlads[g.periode + "-" + g.gruppe] = el;
        });
        for (var periode = 1; periode <= 4; periode++) {
            KOLONNER.forEach(function (gruppe) {
                var noegle = periode + "-" + gruppe;
                var el = efterPlads[noegle];
                var tom = TOMME[noegle];
                var b;
                if (el || tom) {
                    b = document.createElement(klik ? "button" : "div");
                    if (klik) b.type = "button";
                }
                if (el) {
                    b.className = "pt-felt";
                    b.setAttribute("data-el", el);
                    b.title = D.stort(navn(el));
                    b.style.backgroundColor = enFarve(en(el));
                    b.style.borderColor = enFarve(en(el), true);
                    b.innerHTML = '<span class="pt-symbol"></span><span class="pt-en"></span>';
                    b.querySelector(".pt-symbol").textContent = el;
                    b.querySelector(".pt-en").textContent = tal(en(el));
                    if (klik) b.addEventListener("click", function () { klik(el); });
                    celler[el] = b;
                } else if (tom) {
                    b.className = "pt-felt tom";
                    b.title = D.stort(tom[1]);
                    b.textContent = tom[0];
                    if (tomKlik) b.addEventListener("click", function () { tomKlik(tom); });
                } else {
                    b = document.createElement("span");
                    b.className = "pt-hul";
                }
                vaert.appendChild(b);
            });
        }
        return celler;
    }

    P._bygTabel = function () {
        var mig = this;
        this.celler = bygTabel(this.e.tabel, function (el) { mig.vaelg(el); }, function (tom) {
            if (mig.opgaver.tabelAktiv()) mig.besked(D.stort(tom[1]) + " er ikke med her. Brug de farvede felter.");
            else mig.opgaver.spaer();
        });
    };

    /* Tabellen foelger opgaven: skjult (stiplet plads), en figur at
       aflaese, kun ét felt i brug, eller hele tabellen i brug. */
    P.opdaterTabel = function () {
        var mig = this, o = this.opgaver;
        if (!o) return;
        var andet = this.par[1 - this.slot];
        var aktiv = o.tabelAktiv();
        var peg = o.opfordring();
        this.e.pt.classList.toggle("plads", o.skjult("tabel"));
        this.e.pt.classList.toggle("laast", !aktiv);
        this.e.tabel.classList.toggle("opfordring", peg === "tabel");
        Object.keys(this.celler).forEach(function (el) {
            var c = mig.celler[el];
            c.classList.toggle("valgt", mig.par.indexOf(el) >= 0);
            c.classList.toggle("spaerret", aktiv && (!o.tillad(el) || D.tilladt(el, andet) !== true));
            c.classList.toggle("opfordring", peg === el);
            c.setAttribute("aria-pressed", mig.par.indexOf(el) >= 0 ? "true" : "false");
        });
        this.visBoble(peg);
    };

    /* Boblen ved det, kortet beder eleven klikke paa (REGELSAET 20) */
    P.visBoble = function (peg) {
        var b = this.e.boble;
        var maal = peg === "tabel" ? this.e.pt : (peg ? this.celler[peg] : null);
        if (!maal || !this.e.pt.offsetWidth) { b.hidden = true; return; }
        var tekst = peg === "tabel" ? "Klik: et atom" : "Klik: " + peg;
        if (b.textContent !== tekst) b.textContent = tekst;
        var rs = this.scene.getBoundingClientRect(), r = maal.getBoundingClientRect();
        b.style.left = Math.round(Math.max(60, r.left - rs.left + r.width / 2)) + "px";
        b.style.top = Math.round(r.top - rs.top - 12) + "px";
        b.hidden = false;
    };

    /* ----- Tavlen: regnestykket paa et lyst papir (REGELSAET 27-29) ---------- */
    P.opdaterTavle = function () {
        var o = this.opgaver, a = this.par[0], b = this.par[1];
        var plads = o.skjult("tavle");
        var spm = o.spoergerOm();
        var h;
        if (plads) {
            h = '<div class="tv-plads">Regnestykket</div>';
        } else {
            h = '<div class="tv-hoved">Bindingen ' + binding(a, b) + "</div>";
            if (!o.skjult("dEN")) {
                var hl = hoejLav(a, b);
                h += '<div class="tv-linje"><div class="tv-navn">Forskellen i elektronegativitet</div>' +
                    '<div class="tv-regn">ΔEN = EN(' + hl[0] + ") − EN(" + hl[1] + ")</div>" +
                    '<div class="tv-regn">ΔEN = ' + regning(a, b) + "</div></div>";
            } else if (spm === "dEN") {
                h += '<div class="tv-linje spm"><div class="tv-navn">Forskellen i elektronegativitet</div><div class="tv-regn">ΔEN = ?</div></div>';
            }
            if (!o.skjult("type")) {
                var t = this.type();
                h += '<div class="tv-linje"><div class="tv-navn">Bindingen er</div><div class="tv-regn tv-type ' + t + '">' + D.TYPER[t].navn + "</div></div>";
            } else if (spm === "type") {
                h += '<div class="tv-linje spm"><div class="tv-navn">Bindingen er</div><div class="tv-regn">?</div></div>';
            }
        }
        if (h !== this._tavle) {
            this._tavle = h;
            this.e.tavle.innerHTML = h;
            this.e.tavle.classList.toggle("plads", plads);
        }
    };

    /* ----- Musen: klik paa et atom i scenen ------------------------------------ */
    P._punkt = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    P.atomVed = function (x, y) {
        var g = this.geo;
        if (!g) return -1;
        for (var i = 0; i < 2; i++) {
            if (Math.hypot(x - g.x[i], y - g.y) <= Math.max(g.R[i] + 6, 20)) return i;
        }
        return -1;
    };

    P._bindMus = function () {
        var mig = this;
        var cvs = this.laerred.canvas;
        cvs.addEventListener("pointerdown", function (e) {
            var p = mig._punkt(e);
            var i = mig.atomVed(p.x, p.y);
            if (i < 0) return;
            if (mig.opgaver.ringFri()) {
                mig.slot = i;
                mig.opdaterTabel();
            } else {
                mig.opgaver.spaer();
            }
        });
        cvs.addEventListener("pointermove", function (e) {
            var p = mig._punkt(e);
            mig.hover = mig.atomVed(p.x, p.y);
            cvs.style.cursor = mig.hover >= 0 && mig.opgaver.ringFri() ? "pointer" : "default";
        });
        cvs.addEventListener("pointerleave", function () { mig.hover = -1; });
    };

    /* ----- Maal ------------------------------------------------------------------ */
    /* Kortet staar under opgaveraekken og har en fast plads (REGELSAET 4) */
    NK.kortTopEn = function () {
        return (window.innerHeight <= 720 ? 42 : 46) + NK.kortZone() + 10;
    };

    /* Scenens opbygning: skalaen under kortet, tabellen til venstre,
       atomerne i midten og tavlen til hoejre. Samlet i midten paa en stor
       skaerm (REGELSAET 32). */
    P.layout = function () {
        var b = this.laerred.b, h = this.laerred.h;
        var T = NK.kortTopEn();
        var cw = Math.min(b - 32, 1260), x0 = (b - cw) / 2;
        var sw = Math.min(cw - 80, 820);
        var barY = T + 30;
        var A0 = barY + 26 + 44, A1 = h - 14;
        var ptB = NK.klamp(cw * 0.23, 286, 340), tvB = NK.klamp(cw * 0.19, 232, 290);
        var mx0 = x0 + ptB + 24, mx1 = x0 + cw - tvB - 24;
        var U = NK.klamp(Math.min((mx1 - mx0) / 5.2, (A1 - A0 - 80) / 2.4), 34, 112);
        var cy = A0 + Math.max(U * 1.1, (A1 - A0 - 60) / 2);
        this.lay = { T: T, x0: x0, cw: cw, sx0: b / 2 - sw / 2, sx1: b / 2 + sw / 2, barY: barY,
            A0: A0, A1: A1, ptB: ptB, tvB: tvB, mx0: mx0, mx1: mx1, U: U, cy: cy };

        var pt = this.e.pt, tv = this.e.tavle;
        pt.style.width = ptB + "px";
        pt.style.left = Math.round(x0) + "px";
        /* Tabellen og tavlen har samme overkant, og tavlen vokser nedad */
        var top = Math.round(Math.max(A0, cy - pt.offsetHeight / 2));
        pt.style.top = top + "px";
        tv.style.width = tvB + "px";
        tv.style.left = Math.round(x0 + cw - tvB) + "px";
        tv.style.top = top + "px";
    };

    /* ----- Faelles graenseflade -------------------------------------------------- */
    P.tilpas = function () {
        var ny = this.laerred.tilpas();
        this.top = NK.saetKortZone(this.laerred.canvas);
        if (ny || !this.lay || this._hoejde !== window.innerHeight) {
            this._hoejde = window.innerHeight;
            this.layout();
        }
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.opgaver.opdater(dt);
        this.vist.skift = NK.mod(this.vist.skift, this.maalSkift(), 5, dt);
        this.vist.adskil = NK.mod(this.vist.adskil, this.maalAdskil(), 5, dt);
        this.vist.dEN = NK.mod(this.vist.dEN, D.dEN(this.par[0], this.par[1]), 7, dt);
        this.pop[0] = Math.max(0, this.pop[0] - dt * 3);
        this.pop[1] = Math.max(0, this.pop[1] - dt * 3);
        this.opdaterTabel();
        this.opdaterTavle();
    };

    /* Atomernes plads og stoerrelse paa laerredet */
    P.geometri = function () {
        if (!this.lay) this.layout();
        var L = this.lay, U = L.U;
        var s = this.vist.skift, ad = this.vist.adskil;
        var R = [0, 1].map(function (i) {
            var g = D.GRUNDSTOFFER[this.par[i]];
            var r = U * (0.5 + g.r);
            /* Ionerne: den positive mister sin yderste skal, den negative vokser */
            var negativ = i === 0 ? s < 0 : s > 0;
            if (ad > 0.001) r *= negativ ? 1 + 0.14 * ad : 1 - 0.28 * ad;
            return r * (1 + 0.12 * Math.sin(this.pop[i] * Math.PI));
        }, this);
        var gab = U * (0.95 + 0.85 * ad);
        var afst = R[0] + R[1] + gab;
        var midt = (L.mx0 + L.mx1) / 2 + (R[0] - R[1]) / 2;
        this.geo = { U: U, y: L.cy, x: [midt - afst / 2, midt + afst / 2], R: R };
        return this.geo;
    };

    function sky(ctx, x, y, r, alfa) {
        if (alfa < 0.01) return;
        var g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
        g.addColorStop(0, "rgba(92, 172, 240, " + alfa.toFixed(3) + ")");
        g.addColorStop(0.6, "rgba(92, 172, 240, " + (alfa * 0.45).toFixed(3) + ")");
        g.addColorStop(1, "rgba(92, 172, 240, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    /* Parret glider fra midten af mellemrummet mod overfladen af det atom,
       der traekker haardest. Ved ioner ender det inde i den negative ion. */
    P.parPlads = function (g) {
        var s = this.vist.skift;
        var sL = g.x[0] + g.R[0], sR = g.x[1] - g.R[1];
        var m = (sL + sR) / 2;
        var ind = 0.12 + 0.38 * this.vist.adskil;
        var maal = s < 0 ? g.x[0] + g.R[0] * (1 - ind) : g.x[1] - g.R[1] * (1 - ind);
        return m + Math.abs(s) * (maal - m);
    };

    P.tegnAtom = function (ctx, i, g) {
        var el = this.par[i];
        var R = g.R[i], x = g.x[i], y = g.y;
        var s = R * SPRITE_KUGLE;
        NK.Sprites.tegn(ctx, "atom_" + el, x - s, y - s, 2 * s, 2 * s);
        var fs = NK.klamp(R * 0.6, 16, 42);
        var moerk = D.GRUNDSTOFFER[el].moerkTekst;
        NK.tekst(ctx, el, x, y + 1, {
            font: "600 " + Math.round(fs) + "px " + LEX, justering: "center", linje: "middle",
            farve: moerk ? "#2b2f36" : "#ffffff", kant: !moerk, kantFarve: "rgba(0, 0, 0, 0.4)", kantBredde: Math.max(2, fs * 0.12)
        });
        /* Elektronegativiteten og navnet under atomet */
        NK.etiket(ctx, "EN " + tal(en(el)), x, y + R + 24, { font: "500 16px " + LEX, hoejde: 28, kant: "rgba(255, 255, 255, 0.2)" });
        NK.tekst(ctx, navn(el), x, y + R + 54, { font: "400 14px " + LEX, justering: "center", linje: "middle", farve: "#aab1bb" });

        /* Ringen om det atom, et klik i tabellen skifter ud */
        if (i === this.slot && this.opgaver.tabelAktiv()) {
            ctx.save();
            ctx.setLineDash([7, 6]);
            ctx.strokeStyle = GUL;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, R + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (i === this.hover && this.opgaver.ringFri()) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, R + 7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    };

    P.tegnLadning = function (ctx, g) {
        var s = this.vist.skift, ad = this.vist.adskil;
        if (Math.abs(s) < 0.05 || this.skjult("skift")) return;
        for (var i = 0; i < 2; i++) {
            var negativ = i === 0 ? s < 0 : s > 0;
            var x = g.x[i] + g.R[i] * 0.72 + 6, y = g.y - g.R[i] * 0.72 - 6;
            if (ad > 0.5) {
                /* Ioner: en hel ladning i en lille cirkel */
                ctx.save();
                ctx.globalAlpha = NK.klamp((ad - 0.5) * 2, 0, 1);
                ctx.fillStyle = "rgba(14, 14, 20, 0.9)";
                ctx.strokeStyle = negativ ? MINUS : PLUS;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(x + 6, y + 2, 17, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                NK.tekst(ctx, negativ ? "−" : "+", x + 6, y + 3, { font: "500 26px " + LEX, justering: "center", linje: "middle", farve: negativ ? MINUS : PLUS });
                ctx.restore();
            } else if (this.type() === "polaer") {
                NK.tekst(ctx, negativ ? "δ−" : "δ+", x, y, {
                    font: "500 22px " + LEX, justering: "left", linje: "middle",
                    farve: negativ ? MINUS : PLUS, kant: true, kantBredde: 4
                });
            }
        }
    };

    P.tegnPar = function (ctx, g) {
        var px = this.parPlads(g);
        var r = NK.klamp(g.U * 0.075, 5, 8);
        ctx.save();
        ctx.fillStyle = GUL;
        ctx.strokeStyle = "rgba(60, 40, 0, 0.7)";
        ctx.lineWidth = 1.5;
        [-1, 1].forEach(function (t) {
            ctx.beginPath();
            ctx.arc(px, g.y + t * r * 1.35, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
    };

    /* Skalaen for ΔEN lige under kortet (REGELSAET 37). Er den skjult, staar
       en stiplet plads med navnet (REGELSAET 13). */
    P.tegnSkala = function (ctx) {
        var L = this.lay;
        var x0 = L.sx0 + 46, x1 = L.sx1 - 10;
        var y = L.barY, hh = 26;
        if (this.skjult("skala")) {
            ctx.save();
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = 1.5;
            NK.rundtRekt(ctx, L.sx0, y - 18, L.sx1 - L.sx0, hh + 40, 8);
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "ΔEN-skalaen", (L.sx0 + L.sx1) / 2, y + hh / 2 + 1, { font: "400 15px " + LEX, justering: "center", linje: "middle", farve: "#7c838d" });
            return;
        }
        function xAf(v) { return x0 + (x1 - x0) * v / SKALA_MAKS; }
        var zoner = [[0, D.POLAER_GRAENSE, "upolaer"], [D.POLAER_GRAENSE, D.ION_GRAENSE, "polaer"], [D.ION_GRAENSE, SKALA_MAKS, "ion"]];
        var FARVE = { upolaer: "63, 174, 114", polaer: "230, 137, 42", ion: "224, 84, 70" };
        var t = this.type();
        var typeSkjult = this.skjult("type"), denSkjult = this.skjult("dEN");
        zoner.forEach(function (z) {
            var a = xAf(z[0]), c = xAf(z[1]);
            var aktiv = !typeSkjult && !denSkjult && z[2] === t;
            ctx.fillStyle = "rgba(" + FARVE[z[2]] + ", " + (aktiv ? 0.42 : 0.16) + ")";
            ctx.fillRect(a, y, c - a, hh);
            ctx.strokeStyle = "rgba(" + FARVE[z[2]] + ", 0.7)";
            ctx.lineWidth = 1;
            ctx.strokeRect(a + 0.5, y + 0.5, c - a - 1, hh - 1);
            NK.tekst(ctx, D.TYPER[z[2]].navn, (a + c) / 2, y + hh / 2 + 1, {
                font: "500 14px " + LEX, justering: "center", linje: "middle", farve: D.TYPER[z[2]].farve
            });
        });
        NK.tekst(ctx, "ΔEN", x0 - 10, y + hh / 2 + 1, { font: "500 15px " + LEX, justering: "right", linje: "middle", farve: "#c8ced6" });
        for (var v = 0; v <= SKALA_MAKS + 1e-9; v += 0.5) {
            var x = xAf(v);
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(x - 0.5, y + hh, 1, 5);
            NK.tekst(ctx, tal(v), x, y + hh + 16, { font: "400 13.5px " + LEX, justering: "center", linje: "middle", farve: "#9aa1ab" });
        }
        if (denSkjult) {
            NK.etiket(ctx, "ΔEN = ?", (x0 + x1) / 2, y - 16, { font: "500 15px " + LEX, farve: GUL, hoejde: 26 });
            return;
        }
        var xm = xAf(NK.klamp(this.vist.dEN, 0, SKALA_MAKS));
        ctx.save();
        ctx.fillStyle = GUL;
        ctx.strokeStyle = "rgba(10, 10, 16, 0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xm, y + 2);
        ctx.lineTo(xm - 9, y - 11);
        ctx.lineTo(xm + 9, y - 11);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        var lx = NK.klamp(xm, x0 + 50, x1 - 50);
        NK.etiket(ctx, "ΔEN = " + tal(D.dEN(this.par[0], this.par[1])), lx, y - 24, { font: "500 15px " + LEX, farve: GUL, hoejde: 26 });
    };

    P.tegn = function () {
        var ctx = this.laerred.ctx;
        var b = this.laerred.b, h = this.laerred.h;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, b, h);
        var g = this.geometri();
        var glod = ctx.createRadialGradient(b / 2, g.y, 0, b / 2, g.y, Math.min(b, h) * 0.55);
        glod.addColorStop(0, "rgba(61, 158, 224, 0.06)");
        glod.addColorStop(1, "rgba(61, 158, 224, 0)");
        ctx.fillStyle = glod;
        ctx.fillRect(0, 0, b, h);

        /* Elektronskyen: tykkest ved det atom, der traekker haardest */
        var s = this.vist.skift;
        var w = [0.5 - 0.5 * s, 0.5 + 0.5 * s];
        sky(ctx, g.x[0], g.y, g.R[0] * 1.75, 0.62 * w[0]);
        sky(ctx, g.x[1], g.y, g.R[1] * 1.75, 0.62 * w[1]);
        sky(ctx, this.parPlads(g), g.y, g.U * 1.15, 0.38 * (1 - 0.6 * this.vist.adskil));

        this.tegnAtom(ctx, 0, g);
        this.tegnAtom(ctx, 1, g);
        this.tegnPar(ctx, g);
        this.tegnLadning(ctx, g);
        this.tegnSkala(ctx);
    };

    /* Tasten R og Start forfra: den aabne opgave forfra */
    P.nulstil = function () { this.opgaver.forfra(); };

    P.skiftVinkelmaaler = function () { /* ingen vinkelmaaler her */ };

    NK.SimEN.regning = regning;
    NK.SimEN.bygTabel = bygTabel;
    NK.SimEN.fuldRegning = fuldRegning;
}());

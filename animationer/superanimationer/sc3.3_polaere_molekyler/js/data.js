/* =====================================================================
   data.js - grundstoffer, bindinger, molekyler og tekster for sc3.3

   GRUNDSTOFFER: elektronegativitet (en), valenselektroner (v), radius i
   kugle-stang-modellen (r), farve og pladsen i det lille periodiske
   system paa fane 1 (periode, gruppe). Elektronegativiteterne er
   Paulings vaerdier med én decimal, de samme tal som den gamle c3.3.

   Graenserne for bindingerne (som c3.3 og laerebogen):
     ΔEN under 0,5            upolaer
     ΔEN fra 0,5 op til 2,0   polaer
     ΔEN 2,0 eller mere       ionbinding

   Et metal saettes kun sammen med N, O, F eller Cl. Saa giver
   graensen paa 2,0 altid ioner, som den skal (se D.tilladt).

   MOLEKYLER: de samme elleve molekyler som sc3.2. Frie elektronpar,
   traek og polaritet regnes ud af klargoer() nedenfor, saa de ikke kan
   komme i modstrid med atomerne.

   Teksterne til teoriboksen og Kemichaels praesentation staar nederst.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    var V = NK.V;
    var D = {};
    NK.Data = D;

    var GRAD = Math.PI / 180;

    D.GRUNDSTOFFER = {
        H:  { navn: "hydrogen", en: 2.1, v: 1, r: 0.25, farve: "#e4e8ee", moerkTekst: true, periode: 1, gruppe: 1 },
        Li: { navn: "lithium",  en: 1.0, v: 1, r: 0.5,  farve: "#c28ae6", metal: true, periode: 2, gruppe: 1 },
        C:  { navn: "carbon",   en: 2.5, v: 4, r: 0.36, farve: "#3b414b", periode: 2, gruppe: 14 },
        N:  { navn: "nitrogen", en: 3.0, v: 5, r: 0.35, farve: "#3464d6", periode: 2, gruppe: 15 },
        O:  { navn: "oxygen",   en: 3.5, v: 6, r: 0.34, farve: "#d93a2a", periode: 2, gruppe: 16 },
        F:  { navn: "fluor",    en: 4.0, v: 7, r: 0.32, farve: "#a6d64a", periode: 2, gruppe: 17 },
        Na: { navn: "natrium",  en: 0.9, v: 1, r: 0.55, farve: "#9a5cd8", metal: true, periode: 3, gruppe: 1 },
        Cl: { navn: "chlor",    en: 3.0, v: 7, r: 0.46, farve: "#34ad48", periode: 3, gruppe: 17 },
        K:  { navn: "kalium",   en: 0.8, v: 1, r: 0.62, farve: "#7a45c2", metal: true, periode: 4, gruppe: 1 }
    };
    D.EN_ORDEN = ["H", "Li", "C", "N", "O", "F", "Na", "Cl", "K"];

    /* ----- Bindingen mellem to atomer ------------------------------------- */
    D.POLAER_GRAENSE = 0.5;
    D.ION_GRAENSE = 2.0;

    /* Forskellen i elektronegativitet, afrundet til én decimal, saa 3,0 - 2,5
       giver praecis 0,5 og ikke 0,49999. */
    D.dEN = function (a, b) {
        return Math.round(Math.abs(D.GRUNDSTOFFER[a].en - D.GRUNDSTOFFER[b].en) * 10) / 10;
    };

    D.bindingstype = function (a, b) {
        var d = D.dEN(a, b);
        return d >= D.ION_GRAENSE ? "ion" : d >= D.POLAER_GRAENSE ? "polaer" : "upolaer";
    };

    D.TYPER = {
        upolaer: { navn: "upolær",     knap: "Upolær",     farve: "#7ee0a8" },
        polaer:  { navn: "polær",      knap: "Polær",      farve: "#f2b06a" },
        ion:     { navn: "ionbinding", knap: "Ionbinding", farve: "#f0918a" }
    };
    D.TYPE_ORDEN = ["upolaer", "polaer", "ion"];

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    D.stort = stort;

    /* Kan de to atomer saettes sammen paa fane 1? true, eller en tekst,
       der siger hvorfor ikke. */
    D.tilladt = function (a, b) {
        var A = D.GRUNDSTOFFER[a], B = D.GRUNDSTOFFER[b];
        if (A.metal && B.metal) return "To metaller deler ikke et elektronpar. Sæt et metal sammen med N, O, F eller Cl.";
        var metal = A.metal ? A : B.metal ? B : null;
        var andet = A.metal ? b : a;
        if (metal && (andet === "H" || andet === "C")) {
            return stort(metal.navn) + " og " + D.GRUNDSTOFFER[andet].navn + " sættes ikke sammen her. Sæt et metal sammen med N, O, F eller Cl.";
        }
        return true;
    };

    /* Det atom, der trækker hårdest (bliver δ− eller den negative ion),
       eller null, hvis de trækker lige hårdt. */
    D.staerkest = function (a, b) {
        var ea = D.GRUNDSTOFFER[a].en, eb = D.GRUNDSTOFFER[b].en;
        return ea === eb ? null : ea > eb ? a : b;
    };

    /* Alle tilladte par af to forskellige atomer. Bruges af opgaverne. */
    D.par = function () {
        var liste = [];
        D.EN_ORDEN.forEach(function (a, i) {
            D.EN_ORDEN.slice(i + 1).forEach(function (b) {
                if (D.tilladt(a, b) === true) liste.push([a, b]);
            });
        });
        return liste;
    };

    /* Frastoedningen mellem elektronparrene (samme tal som sc3.2). Bruges
       kun til at placere de frie elektronpar i molekylerne. */
    D.FRASTOED = { n: 2, LB: 1.221, LL: 1.401, kraft: 30, daempning: 6 };

    /* ----- Fane 3: vaeskerne i vandstraaleforsoeget --------------------------
       pol er, hvor kraftigt en ladet stav trækker i strålen (vand = 1).
       Tallene er ikke maalte, men raekkefoelgen passer med forsoeget. */
    D.VAESKER = {
        vand:    { navn: "vand",    formel: "H2O",    pol: 1,    farve: "rgba(150, 205, 245, 0.75)", polaer: true },
        ethanol: { navn: "ethanol", formel: "C2H5OH", pol: 0.55, farve: "rgba(190, 220, 240, 0.7)", polaer: true },
        heptan:  { navn: "heptan",  formel: "C7H16",  pol: 0.02, farve: "rgba(240, 232, 190, 0.75)", polaer: false }
    };
    D.VAESKE_ORDEN = ["vand", "ethanol", "heptan"];

    /* ----- Hjaelpere til koordinaterne -------------------------------------- */
    /* Retning med polarvinkel fra +y og azimut i xz-planen fra +z (grader). */
    function retn(polar, azimut) {
        var t = polar * GRAD, f = azimut * GRAD;
        return [Math.sin(t) * Math.sin(f), Math.cos(t), Math.sin(t) * Math.cos(f)];
    }

    var TETRA = Math.acos(-1 / 3) / GRAD;                                  /* 109,47° */
    var PYRAMIDE = Math.acos(-Math.sqrt((1 + 2 * Math.cos(107 * GRAD)) / 3)) / GRAD; /* H-N-H = 107° */

    function paa(fra, retning, laengde) {
        return V.plus(fra, V.gange(V.enhed(retning), laengde));
    }

    var O0 = [0, 0, 0];

    /* ----- Molekylerne -------------------------------------------------------- */
    D.MOLEKYLER = [
        {
            id: "H2O", navn: "vand", form: "vinklet", centrum: 0, vinkel: [1, 0, 2],
            atomer: [
                { el: "O", p: O0, prik: [0, 0] },
                { el: "H", p: paa(O0, [Math.sin(52.25 * GRAD), -Math.cos(52.25 * GRAD), 0], 0.96), prik: [1, 0] },
                { el: "H", p: paa(O0, [-Math.sin(52.25 * GRAD), -Math.cos(52.25 * GRAD), 0], 0.96), prik: [-1, 0] }
            ],
            bindinger: [[0, 1, 1], [0, 2, 1]],
            hintPol: "O-H-bindingerne er polære. Peger de to træk samme vej, eller ophæver de hinanden?",
            svarPol: "Molekylet er vinklet, så trækkene i de to O-H-bindinger ophæver ikke hinanden. Vand er polært."
        },
        {
            id: "NH3", navn: "ammoniak", form: "pyramide", centrum: 0, vinkel: [1, 0, 2],
            atomer: [
                { el: "N", p: O0, prik: [0, 0] },
                { el: "H", p: paa(O0, retn(PYRAMIDE, 0), 1.01), prik: [0, 1] },
                { el: "H", p: paa(O0, retn(PYRAMIDE, 120), 1.01), prik: [1, 0] },
                { el: "H", p: paa(O0, retn(PYRAMIDE, 240), 1.01), prik: [-1, 0] }
            ],
            bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
            hintPol: "N-H-bindingerne er polære. Hvilken vej peger de tre træk?",
            svarPol: "Alle tre træk peger op mod N og ophæver ikke hinanden. Ammoniak er polært."
        },
        {
            id: "CH4", navn: "methan", form: "tetraeder", centrum: 0, vinkel: [1, 0, 2],
            atomer: [
                { el: "C", p: O0, prik: [0, 0] },
                { el: "H", p: paa(O0, [0, 1, 0], 1.09), prik: [0, -1] },
                { el: "H", p: paa(O0, retn(TETRA, 0), 1.09), prik: [0, 1] },
                { el: "H", p: paa(O0, retn(TETRA, 120), 1.09), prik: [1, 0] },
                { el: "H", p: paa(O0, retn(TETRA, 240), 1.09), prik: [-1, 0] }
            ],
            bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
            hintPol: "Find forskellen i elektronegativitet mellem C og H i tabellen.",
            svarPol: "Forskellen er kun 0,4, så C-H-bindingerne er upolære, og der er intet træk. Methan er upolært."
        },
        {
            id: "CO2", navn: "carbondioxid", form: "lineaer", centrum: 1, vinkel: [0, 1, 2],
            atomer: [
                { el: "O", p: [-1.16, 0, 0], prik: [-1, 0] },
                { el: "C", p: O0, prik: [0, 0] },
                { el: "O", p: [1.16, 0, 0], prik: [1, 0] }
            ],
            bindinger: [[1, 0, 2], [1, 2, 2]],
            hintPol: "C=O-bindingerne er polære. Drej molekylet, og se, hvilken vej de to træk peger.",
            svarPol: "De to træk er lige store og peger modsat. De ophæver hinanden, så CO₂ er upolært."
        },
        {
            id: "HCN", navn: "blåsyre", form: "lineaer", centrum: 1, vinkel: [0, 1, 2],
            atomer: [
                { el: "H", p: [-1.06, 0, 0], prik: [-1, 0] },
                { el: "C", p: O0, prik: [0, 0] },
                { el: "N", p: [1.16, 0, 0], prik: [1, 0] }
            ],
            bindinger: [[1, 0, 1], [1, 2, 3]],
            hintPol: "Kun én af bindingerne er polær. Er der noget, der kan ophæve dens træk?",
            svarPol: "Trækket i C≡N-bindingen ophæves ikke af noget. HCN er polært."
        },
        {
            id: "CH2O", navn: "formaldehyd", form: "plan", centrum: 0, vinkel: [2, 0, 3],
            atomer: [
                { el: "C", p: O0, prik: [0, 0] },
                { el: "O", p: [0, 1.21, 0], prik: [0, -1] },
                { el: "H", p: paa(O0, [Math.sin(60 * GRAD), -0.5, 0], 1.09), prik: [0.85, 0.7] },
                { el: "H", p: paa(O0, [-Math.sin(60 * GRAD), -0.5, 0], 1.09), prik: [-0.85, 0.7] }
            ],
            bindinger: [[0, 1, 2], [0, 2, 1], [0, 3, 1]],
            hintPol: "C=O-bindingen er polær, men C-H-bindingerne er det ikke.",
            svarPol: "Trækket mod O ophæves ikke af noget. Formaldehyd er polært."
        },
        {
            id: "C2H4", navn: "ethen", form: "plan", centrum: 0, vinkel: [2, 0, 3],
            atomer: [
                { el: "C", p: [-0.67, 0, 0], prik: [-0.5, 0] },
                { el: "C", p: [0.67, 0, 0], prik: [0.5, 0] },
                { el: "H", p: paa([-0.67, 0, 0], [-0.5, Math.sin(60 * GRAD), 0], 1.09), prik: [-1.15, -0.75] },
                { el: "H", p: paa([-0.67, 0, 0], [-0.5, -Math.sin(60 * GRAD), 0], 1.09), prik: [-1.15, 0.75] },
                { el: "H", p: paa([0.67, 0, 0], [0.5, Math.sin(60 * GRAD), 0], 1.09), prik: [1.15, -0.75] },
                { el: "H", p: paa([0.67, 0, 0], [0.5, -Math.sin(60 * GRAD), 0], 1.09), prik: [1.15, 0.75] }
            ],
            bindinger: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
            hintPol: "Find forskellen i elektronegativitet for hver slags binding i tabellen.",
            svarPol: "Hverken C=C eller C-H er polære, så der er intet træk. Ethen er upolært."
        },
        {
            id: "C2H2", navn: "ethyn", form: "lineaer", centrum: 1, vinkel: [0, 1, 2],
            atomer: [
                { el: "H", p: [-1.66, 0, 0], prik: [-1.5, 0] },
                { el: "C", p: [-0.6, 0, 0], prik: [-0.5, 0] },
                { el: "C", p: [0.6, 0, 0], prik: [0.5, 0] },
                { el: "H", p: [1.66, 0, 0], prik: [1.5, 0] }
            ],
            bindinger: [[1, 0, 1], [1, 2, 3], [2, 3, 1]],
            hintPol: "Find forskellen i elektronegativitet for hver slags binding i tabellen.",
            svarPol: "Hverken C≡C eller C-H er polære, så der er intet træk. Ethyn er upolært."
        },
        {
            id: "CCl4", navn: "tetrachlormethan", form: "tetraeder", centrum: 0, vinkel: [1, 0, 2],
            atomer: [
                { el: "C", p: O0, prik: [0, 0] },
                { el: "Cl", p: paa(O0, [0, 1, 0], 1.77), prik: [0, -1] },
                { el: "Cl", p: paa(O0, retn(TETRA, 0), 1.77), prik: [0, 1] },
                { el: "Cl", p: paa(O0, retn(TETRA, 120), 1.77), prik: [1, 0] },
                { el: "Cl", p: paa(O0, retn(TETRA, 240), 1.77), prik: [-1, 0] }
            ],
            bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
            hintPol: "Alle fire C-Cl-bindinger er polære. Drej molekylet, og se, hvordan trækkene peger.",
            svarPol: "De fire træk er lige store og peger symmetrisk ud fra carbon. De ophæver hinanden, så CCl₄ er upolært."
        },
        {
            id: "CH3Cl", navn: "chlormethan", form: "tetraeder", centrum: 0, vinkel: [2, 0, 3],
            atomer: [
                { el: "C", p: O0, prik: [0, 0] },
                { el: "Cl", p: paa(O0, [0, 1, 0], 1.77), prik: [1, 0] },
                { el: "H", p: paa(O0, retn(TETRA, 0), 1.09), prik: [0, 1] },
                { el: "H", p: paa(O0, retn(TETRA, 120), 1.09), prik: [0, -1] },
                { el: "H", p: paa(O0, retn(TETRA, 240), 1.09), prik: [-1, 0] }
            ],
            bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
            hintPol: "Sammenlign med CCl₄. Hvad sker der, når tre af chloratomerne er skiftet ud med H?",
            svarPol: "Kun C-Cl-bindingen er polær, og intet ophæver dens træk. Chlormethan er polært."
        },
        {
            id: "HCl", navn: "hydrogenchlorid", form: "lineaer", centrum: null, vinkel: null,
            atomer: [
                { el: "Cl", p: [0.64, 0, 0], prik: [0, 0] },
                { el: "H", p: [-0.63, 0, 0], prik: [-1, 0] }
            ],
            bindinger: [[0, 1, 1]],
            hintPol: "Find forskellen i elektronegativitet mellem H og Cl i tabellen.",
            svarPol: "Forskellen er 0,9, så bindingen er polær, og der er ingen andre bindinger til at ophæve trækket. HCl er polært."
        }
    ];

    /* ----- Frie elektronpar, traek og polaritet regnes ud ------------------- */
    function frieRetninger(mol, i, naboer, antal) {
        if (!antal) return [];
        var a0 = mol.atomer[i].p;
        var bind = naboer.map(function (nb) { return V.enhed(V.minus(mol.atomer[nb.atom].p, a0)); });
        var plan = [0, 0, 1];

        if (bind.length === 1) {
            var a = V.gange(bind[0], -1);
            if (antal === 1) return [a];
            var q = V.kryds(plan, a);
            q = V.laengde(q) < 1e-3 ? V.vinkelret(a) : V.enhed(q);
            if (antal === 2) {
                return [-1, 1].map(function (t) {
                    return V.enhed(V.plus(V.gange(a, Math.cos(60 * GRAD)), V.gange(q, t * Math.sin(60 * GRAD))));
                });
            }
            var q2 = V.kryds(a, q);
            return [0, 120, 240].map(function (fi) {
                var tv = V.plus(V.gange(q, Math.cos(fi * GRAD)), V.gange(q2, Math.sin(fi * GRAD)));
                return V.enhed(V.plus(V.gange(a, Math.cos(70.53 * GRAD)), V.gange(tv, Math.sin(70.53 * GRAD))));
            });
        }

        /* Centralatom: bindingerne staar fast, og parrene finder selv
           deres plads med samme frastoedning som fane 1. */
        var sum = [0, 0, 0];
        bind.forEach(function (b) { sum = V.plus(sum, b); });
        var grupper = bind.map(function (b) { return { type: "binding", u: b, fast: true }; });
        for (var k = 0; k < antal; k++) {
            var start = V.plus(V.gange(sum, -1), V.gange(plan, antal === 1 ? 0 : (k ? 0.6 : -0.6)));
            grupper.push({ type: "fri", u: V.enhed(V.laengde(start) < 1e-3 ? V.vinkelret(bind[0]) : start) });
        }
        NK.Frastoed.ligevaegt(grupper, 2500);
        return grupper.filter(function (g) { return g.type === "fri"; }).map(function (g) { return g.u; });
    }

    function klargoer(mol) {
        mol.formel = NK.formel(mol.id);

        /* Molekylets midte i origo, saa det drejer om sig selv. */
        var midt = [0, 0, 0];
        mol.atomer.forEach(function (a) { midt = V.plus(midt, a.p); });
        midt = V.gange(midt, 1 / mol.atomer.length);
        mol.atomer.forEach(function (a) { a.p = V.minus(a.p, midt); });

        mol.naboer = mol.atomer.map(function () { return []; });
        mol.bindinger.forEach(function (b) {
            mol.naboer[b[0]].push({ atom: b[1], orden: b[2] });
            mol.naboer[b[1]].push({ atom: b[0], orden: b[2] });
        });

        mol.frieAntal = mol.atomer.map(function (a, i) {
            if (a.el === "H") return 0;
            var sum = mol.naboer[i].reduce(function (s, nb) { return s + nb.orden; }, 0);
            return Math.max(0, (D.GRUNDSTOFFER[a.el].v - sum) / 2);
        });

        mol.frie = [];
        mol.atomer.forEach(function (a, i) {
            frieRetninger(mol, i, mol.naboer[i], mol.frieAntal[i]).forEach(function (u) {
                mol.frie.push({ atom: i, u: u, lille: mol.naboer[i].length === 1 });
            });
        });

        /* Traek: fra det mindst til det mest elektronegative atom i hver
           polaer binding. Summen afgoer, om molekylet er polaert. */
        mol.traek = [];
        mol.delta = mol.atomer.map(function () { return 0; });
        var samlet = [0, 0, 0];
        mol.bindinger.forEach(function (b) {
            var A = mol.atomer[b[0]], B = mol.atomer[b[1]];
            var dEN = D.dEN(A.el, B.el);
            if (dEN < D.POLAER_GRAENSE) return;
            var plus = D.GRUNDSTOFFER[A.el].en < D.GRUNDSTOFFER[B.el].en ? b[0] : b[1];
            var minus = plus === b[0] ? b[1] : b[0];
            var u = V.enhed(V.minus(mol.atomer[minus].p, mol.atomer[plus].p));
            mol.traek.push({ plus: plus, minus: minus, dEN: dEN });
            mol.delta[plus] = 1;
            mol.delta[minus] = -1;
            samlet = V.plus(samlet, V.gange(u, dEN));
        });
        mol.samletTraek = samlet;
        mol.polaer = V.laengde(samlet) > 0.05;

        mol.vinkelGrader = mol.vinkel ? V.vinkel(
            V.minus(mol.atomer[mol.vinkel[0]].p, mol.atomer[mol.vinkel[1]].p),
            V.minus(mol.atomer[mol.vinkel[2]].p, mol.atomer[mol.vinkel[1]].p)) : null;

        var radius = 0;
        mol.atomer.forEach(function (a) { radius = Math.max(radius, V.laengde(a.p) + D.GRUNDSTOFFER[a.el].r); });
        mol.frie.forEach(function (fp) {
            var a = mol.atomer[fp.atom];
            radius = Math.max(radius, V.laengde(V.plus(a.p, V.gange(fp.u, D.GRUNDSTOFFER[a.el].r * 0.35 + 0.8 * (fp.lille ? 0.72 : 1)))));
        });
        mol.radius = radius;

        /* Modellen, som model3d.js tegner. */
        mol.model = {
            atomer: mol.atomer,
            bindinger: mol.bindinger.map(function (b) { return { a: b[0], b: b[1], orden: b[2] }; }),
            frie: mol.frie
        };
    }

    D.klargoer = function () {
        D.MOLEKYLER.forEach(klargoer);
    };

    D.molekyle = function (id) {
        for (var i = 0; i < D.MOLEKYLER.length; i++) if (D.MOLEKYLER[i].id === id) return D.MOLEKYLER[i];
        return null;
    };


    /* ----- Teoriboksen ------------------------------------------------------ */
    D.TEORI = [
        { h: "Elektronegativitet",
          p: ["Elektronegativitet er et tal for, hvor hårdt et atom trækker i elektronparrene i sine bindinger.",
              "Den stiger mod højre i en periode og op ad en hovedgruppe. Fluor har den største, 4,0."] },

        { h: "Tre slags bindinger",
          p: ["<b>ΔEN under 0,5:</b> upolær binding. Atomerne deler elektronparret lige.",
              "<b>ΔEN fra 0,5 op til 2,0:</b> polær binding. Elektronparret ligger tættest på det mest elektronegative atom, der bliver δ−. Det andet atom bliver δ+.",
              "<b>ΔEN på 2,0 eller mere:</b> ionbinding. Det ene atom tager elektronerne helt, og der dannes ioner."] },

        { h: "δ+ og δ−",
          p: ["δ betyder en lille smule. Atomerne i en polær binding har en lille ladning, ikke en hel. Molekylet som helhed er neutralt."] },

        { h: "Polære molekyler",
          p: ["Et molekyle er polært, når trækkene i bindingerne ikke ophæver hinanden. Så har molekylet en positiv og en negativ ende.",
              "CO₂ og CCl₄ har polære bindinger, men er symmetriske og derfor upolære."] },

        { h: "Vandstrålen og den ladede stav",
          p: ["En plastikstav, der gnides med uld, bliver negativ. En glasstav bliver positiv.",
              "Molekylerne i en polær væske drejer, så den modsat ladede ende vender mod staven, og trækkes hen mod den. Derfor bøjer strålen mod staven, uanset om den er positiv eller negativ.",
              "Heptan består kun af C og H og er upolært. Molekylerne drejer sig ikke, og strålen løber lige ned."] },

        { h: "Modellerne",
          p: ["Elektronskyen på fane 1 viser, hvor elektronerne oftest er. Kugle-stang-modellen på fane 2 er ikke målfast. Elektronegativiteterne er Paulings værdier med én decimal."] }
    ];

    /* ----- Kemichael praesenterer fanerne -----------------------------------
       To eller tre replikker paa hoejst ca. 60 tegn. Mens han siger linjen
       peg, peger han paa det, den handler om (js/laerer.js). */
    D.INTRO = {
        "fane-en": { peg: 1, linjer: [
            "Tovtrækning. To atomer deler ét elektronpar.",
            "Vælg de to atomer i tabellen herovre.",
            "Det mest elektronegative atom vinder. Hver gang."
        ] },
        "fane-polaritet": { peg: 1, linjer: [
            "Nu trækker alle bindinger i et molekyle på én gang.",
            "Vælg et molekyle herovre, og drej det.",
            "Symmetri ophæver det hele. Næsten poetisk."
        ] },
        "fane-vand": { peg: 1, linjer: [
            "Laboratoriet. Tre haner, to stave og en uldklud.",
            "Resultaterne skriver sig selv i skemaet herovre.",
            "Heptanhanen findes kun i animationer. Jeg har spurgt."
        ] }
    };
}());

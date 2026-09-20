/* =====================================================================
   data.js - grundstoffer, molekyler og tekster for sc3.2

   GRUNDSTOFFER: valenselektroner (v), elektronegativitet (en, samme
   tal som c3.3), radius i kugle-stang-modellen (r) og i kalotte-
   modellen (rk).

   MOLEKYLER: hvert molekyle har atomer med en plads i rummet (p) og i
   prikformlen (prik), bindinger [atom, atom, orden] og det atom, formen
   og vinklen gaelder for (centrum, vinkel). Frie elektronpar, traek og
   polaritet regnes ud af klargoer() nedenfor, saa de ikke kan komme i
   modstrid med atomerne.

   Teksterne til teoriboksen staar nederst.
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
        H:  { navn: "hydrogen", v: 1, en: 2.1, r: 0.25, rk: 0.96, farve: "#e4e8ee", moerkTekst: true },
        C:  { navn: "carbon",   v: 4, en: 2.5, r: 0.36, rk: 1.36, farve: "#3b414b" },
        N:  { navn: "nitrogen", v: 5, en: 3.0, r: 0.35, rk: 1.24, farve: "#3464d6" },
        O:  { navn: "oxygen",   v: 6, en: 3.5, r: 0.34, rk: 1.22, farve: "#d93a2a" },
        Cl: { navn: "chlor",    v: 7, en: 3.0, r: 0.46, rk: 1.4,  farve: "#34ad48" }
    };

    /* En binding er polaer fra denne forskel i elektronegativitet (som c3.3). */
    D.POLAER_GRAENSE = 0.5;

    /* Frastoedningen paa fane 1. n er eksponenten i kraftloven, LB og LL
       styrken mellem et frit par og en binding og mellem to frie par
       (binding-binding = 1). Kalibreret, saa NH3 = 107,0° og H2O = 104,5°. */
    D.FRASTOED = { n: 2, LB: 1.221, LL: 1.401, kraft: 30, daempning: 6 };

    /* ----- Formerne ---------------------------------------------------------- */
    D.FORMER = {
        lineaer:   { navn: "lineær",    knap: "Lineær" },
        vinklet:   { navn: "vinklet",   knap: "Vinklet" },
        plan:      { navn: "plan",      knap: "Plan" },
        pyramide:  { navn: "pyramide",  knap: "Pyramide" },
        tetraeder: { navn: "tetraeder", knap: "Tetraeder" }
    };
    D.FORM_ORDEN = ["lineaer", "vinklet", "plan", "pyramide", "tetraeder"];

    /* Formen af atomerne omkring et centralatom med dette antal bindinger
       (en dobbeltbinding er én) og frie elektronpar. */
    D.form = function (bindinger, frie) {
        if (bindinger < 1) return null;
        if (bindinger === 1) return "lineaer";
        if (bindinger === 2) return bindinger + frie === 2 ? "lineaer" : "vinklet";
        if (bindinger === 3) return bindinger + frie === 3 ? "plan" : "pyramide";
        return "tetraeder";
    };

    /* ----- Fane 4: vaeskerne i vandstraaleforsoeget --------------------------
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
            hintForm: "Tæl elektronparrene omkring O i prikformlen. Hvor mange er bindinger, og hvor mange er frie?",
            svarForm: "O har to bindinger og to frie elektronpar. De fire par peger mod hjørnerne af et tetraeder, men kun de to H-atomer ses, så molekylet er vinklet.",
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
            hintForm: "Drej molekylet, så N vender opad. Ligger de tre H-atomer i samme plan som N?",
            svarForm: "N har tre bindinger og ét frit elektronpar. Det frie par skubber H-atomerne ned, så atomerne danner en pyramide med N i toppen.",
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
            hintForm: "Carbon har fire bindinger og ingen frie elektronpar. Hvordan kommer fire elektronpar længst væk fra hinanden?",
            svarForm: "Fire bindinger og ingen frie elektronpar giver et tetraeder med 109,5° mellem bindingerne.",
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
            hintForm: "En dobbeltbinding peger kun i én retning. Hvor mange retninger har carbonatomet?",
            svarForm: "Carbon har to dobbeltbindinger og ingen frie elektronpar. De to retninger ligger 180° fra hinanden, så molekylet er lineært.",
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
            hintForm: "Carbon har en enkeltbinding og en tripelbinding. Hvor mange retninger er det?",
            svarForm: "Carbon har to retninger og ingen frie elektronpar. Molekylet er lineært.",
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
            hintForm: "Carbon har to enkeltbindinger og én dobbeltbinding. Hvor mange retninger er det?",
            svarForm: "Tre retninger og ingen frie elektronpar på carbon giver en plan trekant med 120° mellem bindingerne.",
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
            hintForm: "Se på ét carbonatom ad gangen. Hvor mange retninger har det?",
            svarForm: "Hvert carbonatom har tre retninger og ingen frie elektronpar. Alle seks atomer ligger i samme plan med 120° mellem bindingerne.",
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
            hintForm: "Hvert carbonatom har en enkeltbinding og en tripelbinding. Hvor mange retninger er det?",
            svarForm: "Hvert carbonatom har to retninger, der ligger 180° fra hinanden. Alle fire atomer ligger på en ret linje.",
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
            hintForm: "Tæl kun elektronparrene omkring carbon. De frie elektronpar sidder på chloratomerne.",
            svarForm: "Carbon har fire bindinger og ingen frie elektronpar. Molekylet er et tetraeder.",
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
            hintForm: "Carbon har fire enkeltbindinger, selvom de ikke går til ens atomer.",
            svarForm: "Fire bindinger og ingen frie elektronpar på carbon giver et tetraeder.",
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
            hintForm: "Hvor mange atomer er der i molekylet?",
            svarForm: "To atomer ligger altid på en linje. HCl er lineært.",
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
            var dEN = Math.abs(D.GRUNDSTOFFER[A.el].en - D.GRUNDSTOFFER[B.el].en);
            if (dEN < D.POLAER_GRAENSE - 1e-9) return;
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
        { h: "Elektronpar frastøder hinanden",
          p: ["Elektronparrene omkring et centralatom er alle negative og frastøder hinanden. De placerer sig så langt fra hinanden som muligt.",
              "Både bindende og frie elektronpar tæller med."] },

        { h: "En dobbeltbinding er én retning",
          p: ["Elektronparrene i en dobbelt- eller tripelbinding sidder mellem de samme to atomer og peger samme vej. De tæller som <b>én retning</b>, når formen bestemmes."] },

        { h: "Fem former",
          p: ["<b>2 retninger:</b> lineær, 180°. Fx CO₂ og HCN.",
              "<b>3 retninger:</b> plan, 120°. Fx CH₂O.",
              "<b>4 retninger:</b> tetraeder, 109,5°. Fx CH₄.",
              "<b>3 bindinger og 1 frit par:</b> pyramide, 107°. Fx NH₃.",
              "<b>2 bindinger og 2 frie par:</b> vinklet, 104,5°. Fx H₂O."] },

        { h: "Frie elektronpar fylder mere",
          p: ["Et frit elektronpar sidder tættere på atomet og skubber lidt mere end en binding. Derfor er vinklen 107° i NH₃ og 104,5° i H₂O og ikke 109,5°."] },

        { h: "Formen er atomernes placering",
          p: ["De frie elektronpar bestemmer, hvor atomerne sidder, men de indgår ikke i formens navn. I NH₃ peger de fire elektronpar mod hjørnerne af et tetraeder, men atomerne danner en pyramide."] },

        { h: "Polære molekyler",
          p: ["En binding er polær, når forskellen i elektronegativitet er mindst 0,5. Elektronerne trækkes mod det mest elektronegative atom, der bliver δ−.",
              "Et molekyle er polært, når trækkene i bindingerne ikke ophæver hinanden. CO₂ og CCl₄ har polære bindinger, men er symmetriske og derfor upolære."] },

        { h: "Vandstrålen og den ladede stav",
          p: ["En plastikstav, der gnides med uld, bliver negativ. En glasstav bliver positiv.",
              "Molekylerne i en polær væske drejer, så den modsat ladede ende vender mod staven, og trækkes hen mod den. Derfor bøjer strålen mod staven, uanset om den er positiv eller negativ.",
              "Heptan består kun af C og H og er upolært. Molekylerne drejer sig ikke, og strålen løber lige ned."] },

        { h: "Modellerne",
          p: ["Kugle-stang-modellen viser bindingerne og vinklerne. Kalotte-modellen viser, hvor meget plads atomerne fylder. Ingen af dem er målfaste."] }
    ];
}());

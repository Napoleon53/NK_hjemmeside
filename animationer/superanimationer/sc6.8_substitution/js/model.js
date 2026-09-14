/* =====================================================================
   model.js - kemien og tallene bag forsoeget

   To reagensglas med bromvand og hexan. Hexan er upolaert og laegger
   sig oven paa vandet. Naar glasset rystes, vandrer det upolaere Br2 op
   i hexanlaget (ekstraktion). I lys spaltes Br2, og der sker en
   substitution:

     C6H14 + Br2  ->  C6H13Br + HBr          (kun i lys)

   HBr er polaert og gaar ned i vandfasen, hvor det er en staerk syre:

     HBr + H2O  ->  H3O+ + Br-

   Vandfasen paavises med pH-papir (H3O+) og AgNO3 (Br-):

     Ag+ + Br-  ->  AgBr(s)                  (lysegult bundfald)

   Glasset i moerke er kontrol: der sker ingenting.

   Et glas beskrives med tre tal, alle som broekdel af det Br2, der
   blev haeldt i: brVand (i vandfasen), brHex (i hexanlaget) og
   reageret (omdannet til HBr og bromhexan).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var STOFFER = {
        "C6H14":   { atomer: { C: 6, H: 14 }, q: 0, fase: "l" },
        "Br2":     { atomer: { Br: 2 }, q: 0, fase: "aq" },
        "C6H13Br": { atomer: { C: 6, H: 13, Br: 1 }, q: 0, fase: "l" },
        "HBr":     { atomer: { H: 1, Br: 1 }, q: 0, fase: "aq" },
        "H2O":     { atomer: { H: 2, O: 1 }, q: 0, fase: "l" },
        "H3O+":    { atomer: { H: 3, O: 1 }, q: 1, fase: "aq" },
        "Br-":     { atomer: { Br: 1 }, q: -1, fase: "aq" },
        "Ag+":     { atomer: { Ag: 1 }, q: 1, fase: "aq" },
        "NO3-":    { atomer: { N: 1, O: 3 }, q: -1, fase: "aq" },
        "AgBr":    { atomer: { Ag: 1, Br: 1 }, q: 0, fase: "s" }
    };

    /* Formlerne, som de skrives paa skaermen. Ladningen bygges altid med
       ladningHaevet, saa ±1 bliver + og −. */
    var GRUNDFORMEL = {
        "C6H14": "C₆H₁₄", "Br2": "Br₂", "C6H13Br": "C₆H₁₃Br", "HBr": "HBr", "H2O": "H₂O",
        "H3O+": "H₃O", "Br-": "Br", "Ag+": "Ag", "NO3-": "NO₃", "AgBr": "AgBr"
    };

    function formel(navn, medFase) {
        var s = STOFFER[navn];
        return GRUNDFORMEL[navn] + NK.ladningHaevet(s.q) + (medFase ? "(" + s.fase + ")" : "");
    }

    var REAKTIONER = {
        substitution: { venstre: [[1, "C6H14"], [1, "Br2"]], hoejre: [[1, "C6H13Br"], [1, "HBr"]] },
        syre:         { venstre: [[1, "HBr"], [1, "H2O"]], hoejre: [[1, "H3O+"], [1, "Br-"]] },
        faeldning:    { venstre: [[1, "Ag+"], [1, "Br-"]], hoejre: [[1, "AgBr"]] }
    };

    function regnskab(side) {
        var atomer = {}, q = 0;
        side.forEach(function (led) {
            var s = STOFFER[led[1]];
            for (var a in s.atomer) {
                if (Object.prototype.hasOwnProperty.call(s.atomer, a)) atomer[a] = (atomer[a] || 0) + led[0] * s.atomer[a];
            }
            q += led[0] * s.q;
        });
        return { atomer: atomer, q: q };
    }

    /* Er reaktionsskemaet afstemt i baade atomer og ladning? */
    function afstemt(rx) {
        var v = regnskab(rx.venstre), h = regnskab(rx.hoejre);
        var ok = v.q === h.q;
        var navne = Object.keys(v.atomer).concat(Object.keys(h.atomer));
        navne.forEach(function (a) { if ((v.atomer[a] || 0) !== (h.atomer[a] || 0)) ok = false; });
        return ok;
    }

    function ligning(rx, medFase) {
        function side(liste) {
            return liste.map(function (led) {
                return (led[0] > 1 ? led[0] + " " : "") + formel(led[1], medFase);
            }).join(" + ");
        }
        return side(rx.venstre) + " → " + side(rx.hoejre);
    }

    /* Partikelmodellen i zoomboblen */
    var MAENGDE = { BR2: 6, HEXAN: 8, VAND: 12, AG_PR_DRAABE: 2, DRAABER: 3 };

    /* Lysets styrke under lampen, i lokalets lys og i folien. k er
       reaktionens hastighed pr. sekund ved fuldt lys. */
    var LYS = { lampe: 1, rum: 0.03, folie: 0, k: 0.15, faerdig: 0.95, begyndt: 0.15 };

    /* Fordeling af Br2 mellem vand og hexan. Naesten alt ender i hexanen.
       ryst er farten ved fuld rystning, diffusion uden rystning. */
    var FORDELING = { ryst: 1.1, diffusion: 0.015, ligevaegt: 0.97, faerdig: 0.9 };

    /* Rystning med musen: FULD er den fart (tegneenheder pr. sekund), der
       giver fuld rystning. Rystes der voldsommere end KNUS_FART i
       KNUS_TID sekunder, springer proppen af. Anden gang skal der mere
       til, og efter MAKS_UHELD uheld sker det ikke mere. */
    var RYST = { FULD: 900, KNUS_FART: [2300, 2900], KNUS_TID: [0.7, 0.9], MAKS_UHELD: 2 };

    /* Vaeguret: minutter pr. sekund og starttidspunkt */
    var UR = { minPerSek: 0.5, start: 10 * 60 + 5 };

    var FARVE = {
        bromvand:  { r: 222, g: 118, b: 28, a: 0.85 },
        bromHexan: { r: 232, g: 96, b: 18, a: 0.9 },
        hexan:     { r: 236, g: 242, b: 246, a: 0.22 },
        vand:      { r: 168, g: 212, b: 238, a: 0.3 },
        bundfald:  { r: 250, g: 243, b: 200, a: 0.95 },
        papir:     { r: 243, g: 231, b: 160, a: 1 },
        pyt:       { r: 222, g: 118, b: 28, a: 0.9 }
    };

    /* Universalindikatorens farver, pH 1 til 14 */
    var PH_SKALA = [
        [215, 38, 43], [226, 83, 43], [236, 125, 44], [242, 165, 49], [242, 207, 58], [201, 212, 59],
        [109, 178, 75], [58, 159, 126], [43, 143, 163], [42, 99, 176], [63, 63, 156], [94, 45, 132],
        [74, 31, 102], [74, 31, 102]
    ];

    function pHFarve(pH) {
        var v = NK.klamp(pH, 1, 14) - 1;
        var i = Math.min(12, Math.floor(v)), t = v - i;
        var a = PH_SKALA[i], b = PH_SKALA[i + 1];
        return { r: NK.lerp(a[0], b[0], t), g: NK.lerp(a[1], b[1], t), b: NK.lerp(a[2], b[2], t), a: 1 };
    }

    /* pH i vandfasen ud fra, hvor stor en del af Br2 der er omdannet
       til HBr. Uden reaktion er vandfasen naesten neutral. */
    function pH(reageret) {
        return NK.klamp(6 - 4.3 * NK.klamp(reageret, 0, 1), 1.7, 6);
    }

    function pHTekst(pHVaerdi) {
        if (pHVaerdi <= 2.5) return "sur";
        if (pHVaerdi <= 4.5) return "svagt sur";
        return "næsten neutral";
    }

    /* Hvor meget Br2 der er tilbage i alt, som broekdel */
    function br2Tilbage(g) {
        return g.brHex + g.brVand;
    }

    function fordelt(g) {
        var t = br2Tilbage(g);
        return t > 0.001 ? g.brHex / t : 1;
    }

    /* Hexanlagets og vandlagets farver ud fra Br2 i hvert lag */
    function hexanFarve(g) {
        return NK.blandFarve(FARVE.hexan, FARVE.bromHexan, NK.klamp(g.brHex * 1.15, 0, 1));
    }

    function vandFarve(g) {
        return NK.blandFarve(FARVE.vand, FARVE.bromvand, NK.klamp(g.brVand * 1.1, 0, 1));
    }

    function farveTekst(g) {
        var t = br2Tilbage(g);
        if (!g.brom) return "";
        if (t < 0.05) return "farveløs";
        if (t < 0.5) return "svagt orange";
        return "orange";
    }

    /* Tidens gang i ét glas. ryst: 0-1, lys: 0-1. */
    function skridt(g, dt, ryst, lys) {
        if (!g.brom) return;
        if (g.hexan) {
            var maal = FORDELING.ligevaegt * br2Tilbage(g);
            if (g.brHex < maal) {
                var flyt = Math.min(maal - g.brHex, g.brVand * (ryst * FORDELING.ryst + FORDELING.diffusion) * dt);
                g.brHex += flyt;
                g.brVand -= flyt;
            }
            var d = g.brHex * (1 - Math.exp(-LYS.k * lys * dt));
            g.brHex -= d;
            g.reageret += d;
        }
        if (g.brHex < 0) g.brHex = 0;
        if (g.brVand < 0) g.brVand = 0;
    }

    NK.Model = {
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        MAENGDE: MAENGDE,
        LYS: LYS,
        FORDELING: FORDELING,
        RYST: RYST,
        UR: UR,
        FARVE: FARVE,
        formel: formel,
        afstemt: afstemt,
        ligning: ligning,
        pH: pH,
        pHFarve: pHFarve,
        pHTekst: pHTekst,
        br2Tilbage: br2Tilbage,
        fordelt: fordelt,
        hexanFarve: hexanFarve,
        vandFarve: vandFarve,
        farveTekst: farveTekst,
        skridt: skridt
    };
}());

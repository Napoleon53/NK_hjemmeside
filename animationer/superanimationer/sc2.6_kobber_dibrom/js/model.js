/* =====================================================================
   model.js - kemien bag forsoeget

   Kolben:   Cu(s) + Br2(aq) -> Cu2+(aq) + 2 Br-(aq)
   Glas med NH3:     Cu2+ + 4 NH3 -> [Cu(NH3)4]2+     (moerkeblaa)
   Glas med AgNO3:   Ag+ + Br-    -> AgBr(s)          (lysegult bundfald)

   Kobber er i overskud, saa al Br2 reagerer, og der bliver kobber
   tilbage i kolben. Partikelmodellen i zoomboblen bruger tallene i
   MAENGDE: 6 Br2 giver 6 Cu2+ og 12 Br-. Hvert reagensglas faar
   halvdelen, altsaa 3 Cu2+ og 6 Br-. En draabe NH3 er 4 molekyler,
   en draabe AgNO3 er 2 Ag+ og 2 NO3-, saa begge tests kraever 3 draaber.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var STOFFER = {
        "Cu":          { atomer: { Cu: 1 }, q: 0, fase: "s" },
        "Br2":         { atomer: { Br: 2 }, q: 0, fase: "aq" },
        "Cu2+":        { atomer: { Cu: 1 }, q: 2, fase: "aq" },
        "Br-":         { atomer: { Br: 1 }, q: -1, fase: "aq" },
        "NH3":         { atomer: { N: 1, H: 3 }, q: 0, fase: "aq" },
        "Cu(NH3)4 2+": { atomer: { Cu: 1, N: 4, H: 12 }, q: 2, fase: "aq" },
        "Ag+":         { atomer: { Ag: 1 }, q: 1, fase: "aq" },
        "NO3-":        { atomer: { N: 1, O: 3 }, q: -1, fase: "aq" },
        "AgBr":        { atomer: { Ag: 1, Br: 1 }, q: 0, fase: "s" }
    };

    /* Formlerne, som de skrives paa skaermen. Ladningen bygges altid med
       ladningHaevet, saa ±1 bliver + og −. */
    var GRUNDFORMEL = {
        "Cu": "Cu", "Br2": "Br₂", "Cu2+": "Cu", "Br-": "Br", "NH3": "NH₃",
        "Cu(NH3)4 2+": "[Cu(NH₃)₄]", "Ag+": "Ag", "NO3-": "NO₃", "AgBr": "AgBr"
    };

    function formel(navn, medFase) {
        var s = STOFFER[navn];
        return GRUNDFORMEL[navn] + NK.ladningHaevet(s.q) + (medFase ? "(" + s.fase + ")" : "");
    }

    var REAKTIONER = {
        syntese:   { venstre: [[1, "Cu"], [1, "Br2"]], hoejre: [[1, "Cu2+"], [2, "Br-"]] },
        kompleks:  { venstre: [[1, "Cu2+"], [4, "NH3"]], hoejre: [[1, "Cu(NH3)4 2+"]] },
        faeldning: { venstre: [[1, "Ag+"], [1, "Br-"]], hoejre: [[1, "AgBr"]] }
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

    var MAENGDE = {
        BR2: 6,
        NH3_PR_DRAABE: 4,
        AG_PR_DRAABE: 2,
        MAKS_DRAABER: 6,
        TABE_CHANCE: 0.03
    };
    MAENGDE.CU2_PR_GLAS = MAENGDE.BR2 / 2;
    MAENGDE.BR_PR_GLAS = MAENGDE.BR2;

    /* ----- Farverne ----------------------------------------------------- */
    var FARVE = {
        bromvand:    { r: 214, g: 110, b: 22, a: 0.82 },
        kobberbromid:{ r: 104, g: 186, b: 190, a: 0.5 },
        kompleks:    { r: 30, g: 58, b: 190, a: 0.9 },
        bundfald:    { r: 236, g: 226, b: 158, a: 0.95 },
        thiosulfat:  { r: 206, g: 222, b: 230, a: 0.3 }
    };

    /* brAndel: den del af Br2, der endnu ikke har reageret (1 til 0). */
    function kolbeFarve(brAndel) {
        return NK.blandFarve(FARVE.kobberbromid, FARVE.bromvand, brAndel);
    }

    /* kompleksAndel: den del af Cu2+, der har faaet sine 4 NH3. */
    function nh3Farve(kompleksAndel) {
        return NK.blandFarve(FARVE.kobberbromid, FARVE.kompleks, Math.pow(NK.klamp(kompleksAndel, 0, 1), 0.8));
    }

    NK.Model = {
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        MAENGDE: MAENGDE,
        FARVE: FARVE,
        formel: formel,
        afstemt: afstemt,
        ligning: ligning,
        kolbeFarve: kolbeFarve,
        nh3Farve: nh3Farve
    };
}());

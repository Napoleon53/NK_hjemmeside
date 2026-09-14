/* =====================================================================
   model.js - kemien og tallene bag forsoeget

   Pb(NO3)2 og KI opløses i 100 mL vand. Pb2+ og I- danner et
   tungtopløseligt, gult bundfald. K+ og NO3- er tilskuerioner:

     Pb2+(aq) + 2 I-(aq)  ->  PbI2(s)
     Pb(NO3)2 + 2 KI      ->  PbI2 + 2 KNO3            (samlet)

   Opløseligheden af PbI2 stiger kraftigt med temperaturen. Bundfaldet
   forsvinder ved opvarmning og kommer igen som glinsende krystaller ved
   afkoeling (gyldne regn). Den temperatur, hvor det sidste bundfald
   forsvinder, giver et punkt paa opløselighedskurven.

   M(Pb(NO3)2) = 331,2 g/mol er naesten praecis 2 * M(KI) = 332,0 g/mol.
   Samme masse af de to stoffer giver derfor stofmaengdeforholdet 1 : 2.

   Opløseligheden er en eksponentiel tilpasning til tabelvaerdierne
   0,044 g ved 0 °C, 0,069 g ved 20 °C og 0,41 g ved 100 °C pr. 100 mL.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var STOFFER = {
        "Pb(NO3)2": { atomer: { Pb: 1, N: 2, O: 6 }, q: 0, fase: "s" },
        "KI":       { atomer: { K: 1, I: 1 }, q: 0, fase: "s" },
        "Pb2+":     { atomer: { Pb: 1 }, q: 2, fase: "aq" },
        "NO3-":     { atomer: { N: 1, O: 3 }, q: -1, fase: "aq" },
        "K+":       { atomer: { K: 1 }, q: 1, fase: "aq" },
        "I-":       { atomer: { I: 1 }, q: -1, fase: "aq" },
        "PbI2":     { atomer: { Pb: 1, I: 2 }, q: 0, fase: "s" },
        "KNO3":     { atomer: { K: 1, N: 1, O: 3 }, q: 0, fase: "aq" }
    };

    /* Formlerne, som de skrives paa skaermen. Ladningen bygges altid med
       ladningHaevet, saa ±1 bliver + og −. */
    var GRUNDFORMEL = {
        "Pb(NO3)2": "Pb(NO₃)₂", "KI": "KI", "Pb2+": "Pb", "NO3-": "NO₃", "K+": "K",
        "I-": "I", "PbI2": "PbI₂", "KNO3": "KNO₃"
    };

    function formel(navn, medFase) {
        var s = STOFFER[navn];
        return GRUNDFORMEL[navn] + NK.ladningHaevet(s.q) + (medFase ? "(" + s.fase + ")" : "");
    }

    var REAKTIONER = {
        faeldning: { venstre: [[1, "Pb2+"], [2, "I-"]], hoejre: [[1, "PbI2"]] },
        samlet:    { venstre: [[1, "Pb(NO3)2"], [2, "KI"]], hoejre: [[1, "PbI2"], [2, "KNO3"]] },
        oploesPb:  { venstre: [[1, "Pb(NO3)2"]], hoejre: [[1, "Pb2+"], [2, "NO3-"]] },
        oploesKI:  { venstre: [[1, "KI"]], hoejre: [[1, "K+"], [1, "I-"]] }
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

    /* ----- Tallene ------------------------------------------------------ */
    var MOLMASSE = { "Pb(NO3)2": 331.2, "KI": 166.0, "PbI2": 461.0 };

    /* Vandet i baegerglasset: volumen, stuetemperatur og kogepunkt */
    var VAND = { mL: 100, stue: 20, kog: 100 };

    /* Opløseligheden s(T) = a * e^(k*T) i g PbI2 pr. 100 mL vand */
    var OPL = { a: 0.044, k: 0.0223 };

    /* En spatelspids er ca. 0,05 g. Der kan hoejst komme 0,30 g
       Pb(NO3)2 i alt i glasset, og KI maa hoejst afvige 0,02 g fra
       Pb(NO3)2 i samme tilsaetning. */
    var SPATEL = { gram: 0.05, spredning: 0.0015, maksPb: 0.30, forskel: 0.02 };

    /* Varmepladen: opvarmning i °C pr. sekund ved fuld varme, afkoeling
       mod stuetemperaturen pr. sekund og pladens tidskonstant i sekunder
       (pladen er varm lidt tid, efter at der er slukket). */
    var VARME = { fart: 2.6, koeling: 0.02, tau: 2.2 };

    /* Hvor hurtigt bundfaldet naermer sig ligevaegten pr. sekund, og den
       mindste fart i g pr. sekund, saa det sidste bundfald faktisk
       forsvinder. */
    var BUNDFALD = { oploes: 2.4, oploesUden: 0.5, krystal: 1.4, blanding: 6, min: 0.004 };

    /* Paaskeaegget: klikker eleven mindst KLIK[n] gange paa et stofglas
       inden for TID sekunder, mens spatlen er i gang, bliver der spildt.
       Efter MAKS_UHELD uheld sker det ikke mere. */
    var SPILD = { KLIK: [4, 6], TID: 1.6, MAKS_UHELD: 2 };

    /* Vaeguret: minutter pr. sekund og starttidspunkt */
    var UR = { minPerSek: 0.25, start: 9 * 60 + 40 };

    /* Partikelmodellen: 0,05 g Pb(NO3)2 giver 1 Pb2+ og 2 NO3-, og
       0,05 g KI giver 2 K+ og 2 I-. */
    var MIKRO = { gramPrEnhed: 0.05 };

    var FARVE = {
        vand:     { r: 168, g: 212, b: 238, a: 0.28 },
        pbi2:     { r: 252, g: 196, b: 24, a: 0.95 },
        pulverPb: { r: 244, g: 243, b: 238, a: 1 },
        pulverKI: { r: 250, g: 250, b: 252, a: 1 }
    };

    function oploeselighed(T) {
        return OPL.a * Math.exp(OPL.k * T);
    }

    /* Den temperatur, hvor g gram PbI2 pr. 100 mL netop kan opløses */
    function maetningsTemp(g) {
        return Math.log(g / OPL.a) / OPL.k;
    }

    /* Den masse PbI2, der kan dannes. Stoffet i underskud bestemmer. */
    function pbi2Masse(pb, ki) {
        return Math.min(pb / MOLMASSE["Pb(NO3)2"], ki / (2 * MOLMASSE.KI)) * MOLMASSE.PbI2;
    }

    /* Temperaturen i glasset. effekt: pladens varme 0-1. */
    function skridtTemp(b, dt, effekt) {
        b.T += (effekt * VARME.fart - VARME.koeling * (b.T - VAND.stue)) * dt;
        if (b.T > VAND.kog) b.T = VAND.kog;
        b.koger = effekt * VARME.fart > VARME.koeling * (VAND.kog - VAND.stue) && b.T >= VAND.kog - 0.05;
    }

    /* Bundfaldet i glasset, b.fast i gram, naermer sig ligevaegten. */
    function ligevaegt(b) {
        return Math.max(0, pbi2Masse(b.pb, b.ki) - oploeselighed(b.T) * VAND.mL / 100);
    }

    function skridtBundfald(b, dt, omroert) {
        var lig = ligevaegt(b), k;
        if (b.fast > lig) {
            k = omroert ? BUNDFALD.oploes : BUNDFALD.oploesUden;
            b.fast = Math.max(lig, b.fast - Math.max(k * (b.fast - lig), BUNDFALD.min) * dt);
        } else if (b.fast < lig) {
            k = b.blanding > 0 ? BUNDFALD.blanding : BUNDFALD.krystal;
            b.fast = Math.min(lig, b.fast + Math.max(k * (lig - b.fast), BUNDFALD.min) * dt);
        }
    }

    /* Tal med dansk komma: komma(0.1, 2) giver "0,10" */
    function komma(x, dec) {
        return x.toFixed(dec === undefined ? 2 : dec).replace(".", ",");
    }

    NK.Model = {
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        MOLMASSE: MOLMASSE,
        VAND: VAND,
        OPL: OPL,
        SPATEL: SPATEL,
        VARME: VARME,
        BUNDFALD: BUNDFALD,
        SPILD: SPILD,
        UR: UR,
        MIKRO: MIKRO,
        FARVE: FARVE,
        formel: formel,
        afstemt: afstemt,
        ligning: ligning,
        oploeselighed: oploeselighed,
        maetningsTemp: maetningsTemp,
        pbi2Masse: pbi2Masse,
        skridtTemp: skridtTemp,
        ligevaegt: ligevaegt,
        skridtBundfald: skridtBundfald,
        komma: komma
    };
}());

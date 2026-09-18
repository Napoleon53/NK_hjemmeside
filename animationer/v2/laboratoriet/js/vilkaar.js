/* =====================================================================
   vilkaar.js - en betingelse over bordets tilstand, skrevet som data

   Et vilkaar er et objekt, der kan vaere sandt eller falsk om bordet lige
   nu. Det er det sprog, et forsoegs trin er skrevet i - og senere det
   samme sprog, en laast doer i spillet er skrevet i. Forskellen er kun,
   hvad der sker, naar vilkaaret bliver sandt.

       { beholder: "glas2", stof: "FeSCN2+", over: 2 }
       { alleAf: ["glas1","glas2","glas3"], V: { over: 2.5 } }
       { alle: [ { beholder: "glas5", T: { over: 50 } }, { flag: "maalt" } ] }

   Vilkaaret maa ikke vide, hvordan eleven kom frem til tilstanden. Det
   spoerger kun, hvad der staar paa bordet, saa et trin kan naas ad flere
   veje - og saa et gemt spil kan spille sig selv tilbage.

   ----- Sammensaetning -----------------------------------------------
     { alle: [v, v, ...] }      alle skal vaere sande
     { nogen: [v, v, ...] }     mindst ét skal vaere sandt
     { ikke: v }                v skal vaere falsk
     en liste [v, v, ...]       det samme som alle

   ----- Verden -------------------------------------------------------
     { flag: "navn" }           verdenstilstanden har flaget sat

   ----- Elevens journal (journal.js) ----------------------------------
     { journal: "billede", faerdig: true }          alle poster svaret
     { journal: "billede", rigtige: { over: 4 } }   antal rigtige
     { journal: "billede", forkerte: 0 }            ingen forkerte
     { journal: "billede", post: "glas1" }          posten er svaret
     { journal: "billede", post: "glas1", rigtig: true }

   ----- Hvilken beholder ---------------------------------------------
     { beholder: "glas1", ... }             proeven gaelder det ene glas
     { alleAf: ["glas1", "glas2"], ... }    den skal gaelde dem alle
     { nogenAf: ["glas1", "glas2"], ... }   den skal gaelde mindst ét

   ----- Proever paa en beholder ---------------------------------------
     stof: "FeSCN2+", over: 2   koncentration i mM (opløst) eller
                                stofmaengde i mmol (fast stof)
     V: { over: 2.5 }           rumfang i mL
     T: { over: 50 }            temperatur i grader
     pH: { under: 3 }           pH
     tom: true                  ingenting i den
     koger: true                den koger
     staarI: "vandbad"          den staar i eller paa den navngivne genstand
     iStativ: true              den staar i et stativ
     lysere: "glas7"            den ser lysere ud end det andet glas
     moerkere: "glas7"          ... moerkere
     mindst: 0.03               hvor stor forskellen skal vaere (0-1)

   Et tal i stedet for et objekt betyder "over": V: 2.5 er V: { over: 2.5 }.
   Baade over og under kan staa sammen: T: { over: 60, under: 90 }.

   ----- Noednoedudgangen ----------------------------------------------
     { proev: function (bord, verden) { return ...; } }

   Den er der, fordi der altid er ét forsoeg, der vil noget saerligt. Skal
   den samme proev bruges to gange, hoerer den til her i stedet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var St = NK.Stof;
    var B = NK.Beholder;

    /* Hvor lys vaesken ser ud gennem glasset (0 = sort, 1 = hvid).
       Den samme graasteorning, oejet laver, naar to glas sammenlignes. */
    function lysstyrke(gg) {
        if (!gg) return 1;
        var f = B.farve(gg);
        if (!f) return 1;
        return (0.2126 * f.r + 0.7152 * f.g + 0.0722 * f.b) / 255;
    }

    /* Et tal maales mod { over, under } - eller mod et bart tal, som
       betyder "over". */
    function passer(vaerdi, krav) {
        if (krav === undefined || krav === null) return true;
        if (typeof krav === "number") return vaerdi > krav;
        if (krav.over !== undefined && !(vaerdi > krav.over)) return false;
        if (krav.under !== undefined && !(vaerdi < krav.under)) return false;
        if (krav.mindst !== undefined && !(vaerdi >= krav.mindst)) return false;
        if (krav.hoejst !== undefined && !(vaerdi <= krav.hoejst)) return false;
        return true;
    }

    /* Maengden af et stof i en beholder: mM for oploest, mmol for fast */
    function maengde(gg, navn) {
        var o = B.samlet(gg);
        var s = St.STOFFER[navn];
        if (!s) return 0;
        if (s.fase === "s") return (o.n[navn] || 0) / 1000;
        return St.konc(o, navn);
    }

    /* Proeverne, der gaelder én beholder */
    function proevBeholder(v, gg, bord) {
        if (!gg) return false;
        if (v.tom !== undefined && B.tom(gg) !== !!v.tom) return false;
        if (v.koger !== undefined && !!gg.koger !== !!v.koger) return false;
        if (v.stof !== undefined) {
            var krav = v.over !== undefined || v.under !== undefined || v.mindst !== undefined || v.hoejst !== undefined
                ? { over: v.over, under: v.under, mindst: v.mindst, hoejst: v.hoejst }
                : { over: 0 };
            if (!passer(maengde(gg, v.stof), krav)) return false;
        }
        if (v.V !== undefined && !passer(B.volumen(gg), v.V)) return false;
        if (v.T !== undefined && !passer(B.samlet(gg).T, v.T)) return false;
        if (v.pH !== undefined) {
            var ph = St.pH(B.samlet(gg));
            if (ph === null || !passer(ph, v.pH)) return false;
        }
        if (v.staarI !== undefined) {
            var maal = bord.g[v.staarI];
            if (!maal) return false;
            if (gg.paa !== maal && !(gg.sted && gg.sted.stativ === maal) && gg.i !== maal) return false;
        }
        if (v.iStativ !== undefined && !!(gg.sted && gg.sted.stativ) !== !!v.iStativ) return false;
        if (v.lysere !== undefined) {
            var a = bord.g[v.lysere];
            if (!a || lysstyrke(gg) < lysstyrke(a) + (v.mindst === undefined ? 0.02 : v.mindst)) return false;
        }
        if (v.moerkere !== undefined) {
            var b2 = bord.g[v.moerkere];
            if (!b2 || lysstyrke(gg) > lysstyrke(b2) - (v.mindst === undefined ? 0.02 : v.mindst)) return false;
        }
        return true;
    }

    /* Proeverne paa en journal (journal.js):
         { journal: "billede", faerdig: true }         alle kraevede poster svaret
         { journal: "billede", rigtige: { over: 4 } }  antal rigtige
         { journal: "billede", forkerte: 0 }           antal forkerte
         { journal: "billede", post: "glas1" }         posten er svaret
         { journal: "billede", post: "glas1", rigtig: true } ... og rigtigt */
    function proevJournal(v) {
        var j = NK.Journal && NK.Journal.find(v.journal);
        if (!j) return false;
        if (v.post !== undefined) {
            var p = j.post(v.post);
            if (!p) return false;
            if (v.rigtig !== undefined && j.rigtig(v.post) !== v.rigtig) return false;
            if (v.svar !== undefined && p.svar !== v.svar) return false;
            return true;
        }
        if (v.faerdig !== undefined && j.faerdig() !== !!v.faerdig) return false;
        if (v.rigtige !== undefined && !passer(j.antalRigtige(), v.rigtige)) return false;
        if (v.forkerte !== undefined && !passer(j.antalForkerte(), v.forkerte === 0 ? { hoejst: 0 } : v.forkerte)) return false;
        if (v.noterede !== undefined && !passer(j.antal(), v.noterede)) return false;
        return true;
    }

    /* bord er et NK.Bord (eller det aktive bord i et NK.Rum).
       verden er valgfri og har flag(navn). */
    function opfyldt(v, bord, verden) {
        if (v === undefined || v === null) return true;
        if (typeof v === "boolean") return v;
        if (typeof v === "function") return !!v(bord, verden);
        if (Array.isArray(v)) return v.every(function (x) { return opfyldt(x, bord, verden); });

        if (v.alle !== undefined && !v.alle.every(function (x) { return opfyldt(x, bord, verden); })) return false;
        if (v.nogen !== undefined && !v.nogen.some(function (x) { return opfyldt(x, bord, verden); })) return false;
        if (v.ikke !== undefined && opfyldt(v.ikke, bord, verden)) return false;
        if (v.flag !== undefined && !(verden && verden.flag(v.flag))) return false;
        if (v.proev !== undefined && !v.proev(bord, verden)) return false;

        if (v.journal !== undefined && !proevJournal(v)) return false;

        if (v.beholder !== undefined) return proevBeholder(v, bord.g[v.beholder], bord);
        if (v.alleAf !== undefined) {
            return v.alleAf.every(function (navn) { return proevBeholder(v, bord.g[navn], bord); });
        }
        if (v.nogenAf !== undefined) {
            return v.nogenAf.some(function (navn) { return proevBeholder(v, bord.g[navn], bord); });
        }
        return true;
    }

    /* De beholdernavne, et vilkaar naevner. Bruges af oevelsestjekket til
       at opdage et trin, der peger paa et glas, som ikke staar paa bordet. */
    function naevnte(v, ud) {
        ud = ud || [];
        if (!v || typeof v !== "object") return ud;
        if (Array.isArray(v)) { v.forEach(function (x) { naevnte(x, ud); }); return ud; }
        ["alle", "nogen"].forEach(function (n) { if (v[n]) naevnte(v[n], ud); });
        if (v.ikke) naevnte(v.ikke, ud);
        if (v.beholder) ud.push(v.beholder);
        if (v.alleAf) v.alleAf.forEach(function (n) { ud.push(n); });
        if (v.nogenAf) v.nogenAf.forEach(function (n) { ud.push(n); });
        ["staarI", "lysere", "moerkere"].forEach(function (n) { if (v[n]) ud.push(v[n]); });
        return ud;
    }

    /* De stofnavne, et vilkaar naevner */
    function naevnteStoffer(v, ud) {
        ud = ud || [];
        if (!v || typeof v !== "object") return ud;
        if (Array.isArray(v)) { v.forEach(function (x) { naevnteStoffer(x, ud); }); return ud; }
        ["alle", "nogen"].forEach(function (n) { if (v[n]) naevnteStoffer(v[n], ud); });
        if (v.ikke) naevnteStoffer(v.ikke, ud);
        if (v.stof) ud.push(v.stof);
        return ud;
    }

    NK.Vilkaar = {
        opfyldt: opfyldt,
        lysstyrke: lysstyrke,
        maengde: maengde,
        passer: passer,
        naevnte: naevnte,
        naevnteStoffer: naevnteStoffer
    };
}());

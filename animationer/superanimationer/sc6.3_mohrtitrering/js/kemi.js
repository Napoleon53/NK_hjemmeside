/* =====================================================================
   kemi.js - modellen: chlorid i havvand titreret med soelvnitrat (Mohr)

   Ingen DOM og ingen tegning. En proeve er { m, p, vand, c, clVand, sted, ind }:
     m       havvandets masse i gram (1,00 g)
     p       masseprocent NaCl i havvandet (alt chlorid regnet som NaCl)
     vand    vand i kolben, mL (20 mL demineraliseret vand)
     c       koncentrationen af AgNO₃, mol/L (0,050 M)
     clVand  chlorid i vandet, mol/L (0 for demineraliseret vand)
     sted    hvor havvandet er hentet (kun til teksten)
     ind     indikatoren, "dcf" eller "chromat" (uden den: den valgte)

   To indikatorer (K.indikator, valgt oeverst i animationen, 18. okt.
   2026): "dcf" er dichlorfluorescein, som bruges i skolen i dag og i
   Kemibogen, og "chromat" er kaliumchromat, som Mohr brugte.

   Med kaliumchromat (K.N_CR) faelder Ag⁺ foerst AgCl og foerst derefter
   roedbrunt Ag₂CrO₄, fordi [Ag⁺] skal op paa ca. 1,9 · 10⁻⁵ M, foer
   Ag₂CrO₄ kan dannes. Det sker lige efter aekvivalenspunktet. [Ag⁺]
   findes af massebalancen for soelv med de to opløselighedsprodukter;
   venstre minus hoejre vokser med [Ag⁺], saa nulpunktet findes ved
   halvering paa log-skala (som pH i sc7.4).

   Med dichlorfluorescein er der intet chromat. Indikatoren saetter sig
   paa bundfaldet, naar Ag⁺ er i overskud ([Ag⁺] > [Cl⁻]), og saa bliver
   bundfaldet lyserødt. Farven regnes af overskuddet [Ag⁺] - [Cl⁻].

   Tallene: M(NaCl) = 58,44 g/mol, Ks(AgCl) = 1,8 · 10⁻¹⁰ M²,
   Ks(Ag₂CrO₄) = 1,1 · 10⁻¹² M³ (Databogen, 25 °C).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    K.M_NACL = 58.44;          /* g/mol */
    K.M_CL = 35.45;            /* g/mol, kun til at genkende en fejl */
    K.M_AGNO3 = 169.87;        /* g/mol, kun til at genkende en fejl */
    K.M_AGCL = 143.32;         /* g/mol, kun til at genkende en fejl */
    K.KS_AGCL = 1.8e-10;
    K.KS_AG2CRO4 = 1.1e-12;

    K.C_AG = 0.050;            /* mol/L soelvnitrat */
    K.PROEVE = 1.00;           /* g havvand */
    K.VAND = 20;               /* mL demineraliseret vand i kolben */
    K.CL_POSTEVAND = 50e-3 / K.M_CL;  /* 50 mg Cl⁻ pr. liter postevand, mol/L */
    K.N_CR = 1.0e-4;           /* mol chromat i kolben (indikatoren) */
    K.V_IND = 1;               /* mL indikatoropløsning */
    K.DRAABE = 0.05;           /* mL pr. draabe */
    K.BURET = 25;              /* mL, burettens inddeling */
    K.FIGURER = 8;             /* figurer i luppen: 1 figur = 1/8 af chloridet */

    /* Indikatoren: "dcf" (dichlorfluorescein) eller "chromat" (kaliumchromat).
       Saettes af app.js (NK.saetIndikator) og husker brugerens valg. */
    K.INDIKATORER = ["dcf", "chromat"];
    K.indikator = "dcf";

    /* Havvand fra seks steder. p er masseprocent NaCl regnet af
       saliniteten (promille) med alt chlorid som NaCl: 0,0912 · S.
       Afrundede overfladevaerdier. */
    K.STEDER = [
        { sted: "Vesterhavet", p: 3.10 },
        { sted: "Skagerrak", p: 2.75 },
        { sted: "Kattegat", p: 2.00 },
        { sted: "Lillebælt", p: 1.50 },
        { sted: "Middelhavet", p: 3.45 },
        { sted: "Det Røde Hav", p: 3.65 }
    ];

    /* En ny proeve: et sted og en masseprocent lidt omkring stedets.
       Med p og sted givet er proeven fast (selvtesten og fane 3). */
    K.nyProeve = function (p, sted) {
        if (p === undefined) {
            var s = NK.tilfaeldig(K.STEDER);
            sted = s.sted;
            p = Math.round((s.p + NK.r(-0.08, 0.08)) * 100) / 100;
        }
        return { m: K.PROEVE, p: p, vand: K.VAND, c: K.C_AG, clVand: 0, sted: sted || "Vesterhavet", ind: K.indikator };
    };

    /* Stofmaengden af chlorid i havvandet (= NaCl), mol */
    K.nNaCl = function (pr) {
        return pr.m * pr.p / 100 / K.M_NACL;
    };

    /* Alt chlorid i kolben: havvandet og det, vandet har med, mol */
    K.nCl = function (pr) {
        return K.nNaCl(pr) + (pr.clVand || 0) * pr.vand / 1000;
    };

    /* Forbruget ved aekvivalenspunktet, mL */
    K.vAek = function (pr) {
        return K.nCl(pr) / pr.c * 1000;
    };

    /* Masseprocenten regnet ud af et forbrug, som eleven ville regne den
       (med den koncentration og masse, eleven tror, der er) */
    K.procent = function (v, c, m) {
        return v / 1000 * c * K.M_NACL / m * 100;
    };

    /* Kolbens rumfang i liter. Havvandets eget rumfang regnes som 1 mL
       pr. gram. */
    K.rumfang = function (pr, v) {
        return (pr.vand + pr.m + K.V_IND + v) / 1000;
    };

    /* Tilstanden i kolben, naar v mL soelvnitrat er tilsat:
       { ag, cl, nAgCl, nCro, nClFri, nAgFri, vt, ind } med [Ag⁺] og [Cl⁻]
       i mol/L og stofmaengderne i mol. ind er indikatoren (proevens
       pr.ind eller den valgte); med dichlorfluorescein er der intet
       chromat, og nCro er 0. */
    K.tilstand = function (pr, v) {
        var ind = pr.ind || K.indikator;
        var nCl = K.nCl(pr), nCr = ind === "chromat" ? K.N_CR : 0;
        var nAg = pr.c * Math.max(0, v) / 1000;
        var vt = K.rumfang(pr, Math.max(0, v));
        if (nAg <= 0) return { ag: 0, cl: nCl / vt, nAgCl: 0, nCro: 0, nClFri: nCl, nAgFri: 0, vt: vt, ind: ind };
        var ks1 = K.KS_AGCL, ks2 = K.KS_AG2CRO4;
        /* f(a) = alt soelv i opløsning og i bundfaldene minus det tilsatte */
        function f(a) {
            var cl = Math.min(nCl / vt, ks1 / a);
            var cr = Math.min(nCr / vt, ks2 / (a * a));
            return a * vt + (nCl - cl * vt) + 2 * (nCr - cr * vt) - nAg;
        }
        var lo = 1e-20, hi = 1;
        for (var i = 0; i < 90; i++) {
            var mid = Math.sqrt(lo * hi);
            if (f(mid) > 0) hi = mid; else lo = mid;
        }
        var a = Math.sqrt(lo * hi);
        var clF = Math.min(nCl / vt, ks1 / a), crF = Math.min(nCr / vt, ks2 / (a * a));
        /* Rester paa 10⁻²⁰ mol fra kommatallene regnes som 0 */
        var nAgCl = nCl - clF * vt, nCro = nCr - crF * vt;
        if (nAgCl < nCl * 1e-9) nAgCl = 0;
        if (nCro <= nCr * 1e-9) nCro = 0;
        return { ag: a, cl: clF, nAgCl: nAgCl, nCro: nCro, nClFri: clF * vt, nAgFri: a * vt, vt: vt, ind: ind };
    };

    /* Hvor tydelig omslagsfarven er for oejet: 0 ingen, 1 staerk.
       Kaliumchromat: regnet af [Ag₂CrO₄] i kolben. Den foerste draabe
       efter omslaget giver svagt roedbrun, en halv mL for meget giver
       moerk roedbrun.
       Dichlorfluorescein: regnet af overskuddet af Ag⁺, [Ag⁺] - [Cl⁻].
       Foer aekvivalenspunktet er det 0. Den foerste draabe efter giver
       svagt lyserød, og 1 mL for meget giver kraftigt lyserød. */
    K.X0 = 6e-5;               /* mol/L Ag₂CrO₄ */
    K.E0 = 2.5e-4;             /* mol/L Ag⁺ i overskud */
    K.styrke = function (t) {
        var x = t.ind === "dcf" ? (t.ag - t.cl) / K.E0 : t.nCro / t.vt / K.X0;
        if (!(x > 0)) return 0;
        return NK.klamp(1 - Math.exp(-Math.sqrt(x)), 0, 1);
    };

    K.farveStyrke = function (pr, v) {
        return K.styrke(K.tilstand(pr, v));
    };

    /* Hvor uklar kolben er af hvidt AgCl: 0 klar, 1 alt chlorid faeldet */
    K.uklarhed = function (pr, t) {
        var n = K.nCl(pr);
        return n > 0 ? NK.klamp(t.nAgCl / n, 0, 1) : 0;
    };

    /* Det foerste rumfang, hvor kolben er synligt roedbrun (styrke 0,04) */
    K.vOmslag = function (pr) {
        var lo = K.vAek(pr), hi = lo + 3;
        for (var i = 0; i < 40; i++) {
            var mid = (lo + hi) / 2;
            if (K.farveStyrke(pr, mid) >= 0.04) hi = mid; else lo = mid;
        }
        return hi;
    };

    /* Farverne for hver indikator (rgb): start er opløsningen med
       indikatoren, maelk er den med hvidt AgCl, slut er omslagsfarven, og
       sky er den sky, der kommer, hvor draaben rammer (inderst og midt).
       Kaliumchromat: gul, citrongul maelk og roedbrun. Dichlorfluorescein:
       gulgroen, lys gulgroen maelk og lyserød (som i Kemibogens figurer). */
    K.FARVER = {
        chromat: { start: [242, 206, 58], maelk: [238, 228, 170], slut: [186, 92, 52],
                   sky: [[176, 72, 38], [214, 140, 90]] },
        dcf: { start: [204, 226, 86], maelk: [232, 240, 196], slut: [232, 120, 170],
               sky: [[222, 88, 150], [240, 166, 200]] }
    };

    /* Vaeskens farve i kolben (css): opløsningen med indikatoren, hvid af
       AgCl og omslagsfarven. uklar og styrke er 0-1, ind er indikatoren
       (ellers den valgte). */
    K.kolbeFarve = function (uklar, styrke, alfa, ind) {
        var F = K.FARVER[ind || K.indikator] || K.FARVER.chromat;
        var u = NK.klamp(uklar, 0, 1), s = NK.klamp(styrke, 0, 1);
        var r = NK.lerp(F.start[0], F.maelk[0], u), g = NK.lerp(F.start[1], F.maelk[1], u), b = NK.lerp(F.start[2], F.maelk[2], u);
        r = NK.lerp(r, F.slut[0], s); g = NK.lerp(g, F.slut[1], s); b = NK.lerp(b, F.slut[2], s);
        var a = alfa === undefined ? NK.lerp(0.42, 0.72, Math.max(u, s)) : alfa;
        return "rgba(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ", " + a + ")";
    };

    /* Ordene for farverne: start (opløsningen med indikatoren) og
       omslagsfarven svagt, almindeligt og kraftigt */
    K.ORD = {
        chromat: { start: "gul", svag: "svagt rødbrun", farve: "rødbrun", kraftig: "mørk rødbrun" },
        dcf: { start: "gulgrøn", svag: "svagt lyserød", farve: "lyserød", kraftig: "kraftigt lyserød" }
    };

    /* Kolbens farve beskrevet i ord */
    K.farveOrd = function (styrke, uklar, ind) {
        var o = K.ORD[ind || K.indikator] || K.ORD.chromat;
        if (styrke < 0.04) return uklar > 0.02 ? o.start + " og uklar" : o.start;
        if (styrke < 0.45) return o.svag;
        if (styrke < 0.9) return o.farve;
        return o.kraftig;
    };

    /* ----- Tal i tekst ---------------------------------------------------------- */
    /* Et rumfang med to decimaler: 10,65 */
    K.mL = function (v) {
        return NK.tal2(v);
    };

    /* En masseprocent med to decimaler: 3,11 */
    K.pct = function (p) {
        return NK.tal2(p);
    };

    /* En koncentration med tre decimaler: 0,050 og 0,100 */
    K.c = function (c) {
        return c.toFixed(3).replace(".", ",");
    };

    /* En stofmaengde i potensform med fire betydende cifre: 5,325 · 10⁻⁴ */
    K.mol = function (n, cifre) {
        return NK.potens(n, cifre || 4);
    };

    /* En masse med fire betydende cifre: 0,03112 */
    K.gram = function (m, cifre) {
        return NK.betydende(m, cifre || 4);
    };

    NK.Kemi = K;
}());

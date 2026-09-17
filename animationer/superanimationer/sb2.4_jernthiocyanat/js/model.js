/* =====================================================================
   model.js - kemien og tallene bag forsoeget

   Jern(III)thiocyanat-ligevaegten:

     Fe3+(aq) + SCN-(aq)  <=>  FeSCN2+(aq)        (komplekset er roedt)

   En oploesning beskrives med stofmaengder i µmol og volumen i mL. Saa
   er µmol/mL det samme som mM:
     V          volumen (mL)
     fe         jern(III) i alt, frit og bundet i komplekset
     fe2        jern(II), som ascorbinsyre har dannet
     scn        thiocyanat i alt, frit og bundet (det faeldede er trukket fra)
     ag         frie soelvioner
     agscn      faeldet AgSCN(s)
     vitc       ascorbinsyre, der endnu ikke har reageret
     farvestof  frugtfarven i del 2
     x          komplekset FeSCN2+. Foelger ligevaegten med en kort forsinkelse
     T          temperatur i °C

   Indgrebene:
     Ag+(aq) + SCN-(aq)  ->  AgSCN(s)                         (hvidt bundfald)
     2 Fe3+ + C6H8O6  ->  2 Fe2+ + C6H6O6 + 2 H+              (ascorbinsyre)
   K afhaenger af temperaturen (van 't Hoff). Reaktionen mod hoejre er
   exoterm, saa K bliver mindre ved opvarmning og stoerre ved afkoeling.

   En beholder (baegerglas eller reagensglas) har en blandet oploesning
   (sol), et lag, der endnu ikke er blandet (lag), og fast stof, der
   endnu ikke er oploest (fast). Draaber lander i laget i toppen; fast
   stof oploeses i bunden. Laget blandes ind ved diffusion, rystning
   eller omroering. Haeldes der fra en beholder, tages laget foerst.

   Stamoploesningen er lavet som i vejledningen: 20 mL 0,10 M Fe(NO3)3 og
   20 mL 0,10 M KSCN i 800 mL vand.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var STOFFER = {
        "Fe3+":    { atomer: { Fe: 1 }, q: 3, fase: "aq" },
        "Fe2+":    { atomer: { Fe: 1 }, q: 2, fase: "aq" },
        "SCN-":    { atomer: { S: 1, C: 1, N: 1 }, q: -1, fase: "aq" },
        "FeSCN2+": { atomer: { Fe: 1, S: 1, C: 1, N: 1 }, q: 2, fase: "aq" },
        "Ag+":     { atomer: { Ag: 1 }, q: 1, fase: "aq" },
        "AgSCN":   { atomer: { Ag: 1, S: 1, C: 1, N: 1 }, q: 0, fase: "s" },
        "C6H8O6":  { atomer: { C: 6, H: 8, O: 6 }, q: 0, fase: "aq" },
        "C6H6O6":  { atomer: { C: 6, H: 6, O: 6 }, q: 0, fase: "aq" },
        "H+":      { atomer: { H: 1 }, q: 1, fase: "aq" },
        "K+":      { atomer: { K: 1 }, q: 1, fase: "aq" },
        "NO3-":    { atomer: { N: 1, O: 3 }, q: -1, fase: "aq" },
        "H2O":     { atomer: { H: 2, O: 1 }, q: 0, fase: "l" }
    };

    /* Formlerne, som de skrives paa skaermen. Ladningen bygges altid med
       ladningHaevet, saa ±1 bliver + og −. */
    var GRUNDFORMEL = {
        "Fe3+": "Fe", "Fe2+": "Fe", "SCN-": "SCN", "FeSCN2+": "FeSCN", "Ag+": "Ag", "AgSCN": "AgSCN",
        "C6H8O6": "C₆H₈O₆", "C6H6O6": "C₆H₆O₆", "H+": "H", "K+": "K", "NO3-": "NO₃", "H2O": "H₂O"
    };

    function formel(navn, medFase) {
        var s = STOFFER[navn];
        return GRUNDFORMEL[navn] + NK.ladningHaevet(s.q) + (medFase ? "(" + s.fase + ")" : "");
    }

    var REAKTIONER = {
        ligevaegt: { venstre: [[1, "Fe3+"], [1, "SCN-"]], hoejre: [[1, "FeSCN2+"]], pil: "⇌" },
        faeldning: { venstre: [[1, "Ag+"], [1, "SCN-"]], hoejre: [[1, "AgSCN"]] },
        reduktion: { venstre: [[2, "Fe3+"], [1, "C6H8O6"]], hoejre: [[2, "Fe2+"], [1, "C6H6O6"], [2, "H+"]] }
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
        return side(rx.venstre) + " " + (rx.pil || "→") + " " + side(rx.hoejre);
    }

    /* ----- Tallene -------------------------------------------------------- */

    /* En draabe er 0,05 mL af en 0,1 M oploesning: 5 µmol */
    var DRAABE = { mL: 0.05, umol: 5 };

    /* Stamoploesningen: c(Fe(NO3)3) og c(KSCN) i mM */
    var STAM = { c: 2 / 0.84 };

    var MAENGDE = {
        KOLBE_BAEGER: 30,    /* mL fra kolben i baegerglasset i del 1 */
        KOLBE_BAEGER2: 40,   /* mL fra kolben i et baegerglas i del 2: naesten halvt op */
        KOLBE_GLAS: 3,       /* mL fra kolben direkte i et reagensglas */
        BAEGER_GLAS: 3,      /* mL fra baegerglasset i et reagensglas: et par mL */
        KSCN_FLASKE: 2,      /* mL 0,1 M KSCN pr. haeldning */
        KSCN_MM: 100,        /* µmol pr. mL i flasken */
        FARVE: 40,           /* mL frugtfarve pr. haeldning */
        VAND_BAEGER: 10,     /* mL vand pr. klik i et baegerglas */
        VAND_GLAS: 2,
        GLAS_MAKS: 17,
        BAEGER_MAKS: 100,
        LAG_GLAS: 1.2,       /* mL oploesning, et indgreb blandes med */
        LAG_BAEGER: 5
    };

    /* Fast stof: µmol pr. spatelspids (ascorbinsyre: nogle faa korn), og
       hvor hurtigt det oploeses pr. sekund uden og med omroering */
    var FAST = { fe: 30, scn: 60, vitc: 10, oploes: 0.22, roer: 3.0 };

    /* Ascorbinsyrens reduktion af Fe3+ pr. sekund */
    var REDUKTION = { k: 1.2 };

    /* Frugtfarvens koncentration i mM (et modeltal) */
    var FARVESTOF = { mM: 0.12 };

    /* K ved 20 °C i M^-1, reaktionsentalpien i J/mol, og hvor hurtigt
       komplekset foelger ligevaegten (pr. sekund) */
    var LIGEVAEGT = { K20: 140, T0: 20, dH: -20000, R: 8.314, fart: 3 };

    /* Blandingens fart pr. sekund: diffusion, fuld rystning og omroering */
    var BLAND = { diffusion: 0.05, ryst: 3.2, roer: 3.5 };

    /* Temperaturerne og hvor hurtigt et glas naar dem (tidskonstant i s).
       Et glas taeller som varmt over varm og som koldt under kold. */
    var TEMP = { stue: 20, vandbad: 80, isbad: 0, tauBad: 3.5, tauIs: 4.5, tauLuft: 25, varm: 60, kold: 8 };

    /* Lysvejen i cm gennem et reagensglas og et baegerglas fra siden.
       Ovenfra er lysvejen vaeskesoejlens hoejde: V delt med tvaersnittet
       (cm²) af et reagensglas eller et 100 mL baegerglas. */
    var LYSVEJ = { glas: 1.4, baeger: 4, tvaersnit: 1.54, baegerTvaersnit: 19.6 };

    /* Absorbans pr. mM og cm i roed, groen og blaa. FeSCN2+ absorberer
       blaagroent lys og ser roedt ud; Fe3+ er svagt gult, Fe2+ naesten
       farveloest, og frugtfarven er blaa. */
    var ABS = {
        fescn:     { r: 0.45, g: 4.6, b: 6.2 },
        fe:        { r: 0, g: 0.012, b: 0.07 },
        fe2:       { r: 0.004, g: 0, b: 0.004 },
        farvestof: { r: 2.4, g: 0.9, b: 0.08 }
    };

    /* Sammenligning: fra siden forholdet mellem c(FeSCN2+) i to glas, ovenfra
       forholdet mellem den samlede absorbans */
    var VURDER = { moerkere: 1.25, lysere: 0.8, ovenfraMoerkere: 1.15, ovenfraLysere: 0.87 };

    /* Fordobling i del 2: forholdet mellem de to volumener */
    var FORDOBLING = { min: 1.8, maks: 2.25 };

    /* Rystning med musen: FULD er den fart (tegneenheder pr. sekund), der
       giver fuld rystning. Rystes der voldsommere end SPILD_FART i
       SPILD_TID sekunder, sproejter indholdet ud. Knappen Ryst glasset
       spilder aldrig. */
    var RYST = { FULD: 900, SPILD_FART: 1500, SPILD_TID: 0.7 };

    /* Partikelmodellen i zoomboblen: partikler pr. mM. K er forstaerket,
       saa der kan ses komplekser; det er et modelbillede, ikke et regnskab. */
    /* Faa og store kugler: hver partikel er én kugle med formlen paa, og
       den skal kunne laeses. Derfor er tallene lavere end koncentrationen
       alene ville give. */
    var MIKRO = {
        PR_MM: 5, FORSTAERK: 4, MAKS: 18, MAKS_AG: 12, MAKS_AGSCN: 14, MAKS_FE2: 16, MAKS_VITC: 6,
        PR_MM_FARVE: 70, MAKS_FARVE: 16, VAND: 14
    };

    /* Bundfaldet synker (pr. sekund) og hvirvles op ved rystning */
    var BUNDFALD = { synk: 0.22, hvirvl: 2.5 };

    var FARVE = {
        vand:     { r: 196, g: 224, b: 242, a: 0.26 },
        bundfald: { r: 246, g: 247, b: 244, a: 0.96 },
        badVand:  { r: 170, g: 210, b: 236, a: 0.24 },
        fast: {
            fe:   { r: 214, g: 195, b: 230, a: 1 },
            scn:  { r: 244, g: 248, b: 250, a: 1 },
            vitc: { r: 246, g: 244, b: 232, a: 1 }
        }
    };

    /* ----- Ligevaegten ------------------------------------------------------ */
    function K(T) {
        var L = LIGEVAEGT;
        return L.K20 * Math.exp(-L.dH / L.R * (1 / (T + 273.15) - 1 / (L.T0 + 273.15)));
    }

    /* c(FeSCN2+) i ligevaegt (mM) ud fra c(Fe3+) og c(SCN-) i alt (a og b) og
       K i mM^-1. Loesningen til x = K (a - x)(b - x), skrevet saa den er
       stabil ogsaa for smaa tal. */
    function ligevaegtsKonc(k, a, b) {
        if (a <= 0 || b <= 0 || k <= 0) return 0;
        var s = k * (a + b) + 1;
        var d = s * s - 4 * k * k * a * b;
        return 2 * k * a * b / (s + Math.sqrt(Math.max(0, d)));
    }

    var FELTER = ["V", "fe", "fe2", "scn", "ag", "agscn", "vitc", "farvestof", "x"];

    function nyOpl() {
        return { V: 0, fe: 0, fe2: 0, scn: 0, ag: 0, agscn: 0, vitc: 0, farvestof: 0, x: 0, T: TEMP.stue };
    }

    function kopiOpl(o) {
        var ud = { T: o.T };
        FELTER.forEach(function (k) { ud[k] = o[k] || 0; });
        return ud;
    }

    /* Komplekset i ligevaegt (µmol) */
    function xLigevaegt(o) {
        if (o.V <= 0) return 0;
        return ligevaegtsKonc(K(o.T) / 1000, o.fe / o.V, o.scn / o.V) * o.V;
    }

    function klampX(o) {
        o.x = NK.klamp(o.x, 0, Math.max(0, Math.min(o.fe, o.scn)));
    }

    function stamOpl(V) {
        var o = nyOpl();
        o.V = V;
        o.fe = STAM.c * V;
        o.scn = STAM.c * V;
        o.x = xLigevaegt(o);
        return o;
    }

    function farveOpl(V) {
        var o = nyOpl();
        o.V = V;
        o.farvestof = FARVESTOF.mM * V;
        return o;
    }

    function vandOpl(V) {
        var o = nyOpl();
        o.V = V;
        return o;
    }

    function kscnOpl(V) {
        var o = nyOpl();
        o.V = V;
        o.scn = MAENGDE.KSCN_MM * V;
        return o;
    }

    /* AgNO3 0,1 M, som den staar i draabeflasken */
    function agOpl(V) {
        var o = nyOpl();
        o.V = V;
        o.ag = DRAABE.umol / DRAABE.mL * V;
        return o;
    }

    /* Ag+ faelder SCN-. Returnerer, hvor meget der blev faeldet (µmol). */
    function faeld(o) {
        var p = Math.min(o.ag, o.scn);
        if (p <= 1e-9) return 0;
        o.ag -= p;
        o.scn -= p;
        o.agscn += p;
        klampX(o);
        return p;
    }

    /* Ascorbinsyren reducerer Fe3+ til Fe2+ */
    function reducer(o, dt) {
        var r = Math.min(o.fe, 2 * o.vitc) * (1 - Math.exp(-REDUKTION.k * dt));
        if (r <= 1e-9) return;
        o.fe -= r;
        o.fe2 += r;
        o.vitc -= r / 2;
        klampX(o);
    }

    /* En draabe AgNO3 */
    function tilsaetDraabe(o) {
        var vFoer = o.V;
        o.V += DRAABE.mL;
        o.ag += DRAABE.umol;
        o.T = vFoer > 0 ? (o.T * vFoer + TEMP.stue * DRAABE.mL) / o.V : TEMP.stue;
        faeld(o);
    }

    /* Tager mL ud af oploesningen. Returnerer delen og traekker den fra. */
    function del(o, mL) {
        var ud = nyOpl();
        if (o.V <= 0 || mL <= 0) return ud;
        var f = Math.min(1, mL / o.V);
        FELTER.forEach(function (k) { ud[k] = o[k] * f; o[k] -= ud[k]; });
        ud.T = o.T;
        if (f >= 1) FELTER.forEach(function (k) { o[k] = 0; });
        return ud;
    }

    /* Blander delen d ind i oploesningen til */
    function bland(til, d) {
        if (d.V <= 0 && d.agscn <= 0) return;
        var V = til.V + d.V;
        til.T = V > 0 ? (til.T * til.V + d.T * d.V) / V : d.T;
        FELTER.forEach(function (k) { til[k] += d[k] || 0; });
        faeld(til);
        klampX(til);
    }

    /* ----- Beholdere -------------------------------------------------------- */
    function beholder(lagMl) {
        return { sol: nyOpl(), lag: null, lagMl: lagMl, lagBund: false, bund: 0, fast: { fe: 0, scn: 0, vitc: 0 } };
    }

    function volumen(b) {
        return b.sol.V + (b.lag ? b.lag.V : 0);
    }

    function fastIalt(b) {
        return b.fast.fe + b.fast.scn + b.fast.vitc;
    }

    /* Hele den oploeste del, som om den var blandet */
    function samlet(b) {
        var o = kopiOpl(b.sol);
        if (b.lag) bland(o, kopiOpl(b.lag));
        return o;
    }

    function toem(b) {
        b.sol = nyOpl();
        b.lag = null;
        b.lagBund = false;
        b.bund = 0;
        b.fast = { fe: 0, scn: 0, vitc: 0 };
    }

    function nytLag(b, bund) {
        if (b.lag) return;
        b.lag = del(b.sol, Math.min(b.lagMl, b.sol.V * 0.4));
        b.lagBund = !!bund;
    }

    /* En draabe AgNO3 lander i toppen af beholderen */
    function draabe(b) {
        if (b.sol.V < 0.05 && !b.lag) {
            tilsaetDraabe(b.sol);
            return;
        }
        nytLag(b, false);
        tilsaetDraabe(b.lag);
    }

    /* En spatelspids fast stof synker til bunds */
    function spatelspids(b, stof) {
        b.fast[stof] += FAST[stof];
    }

    /* En vaeske haeldes i. Er der kun lidt, haeldes den i laget. */
    function haeldI(b, d) {
        bland(b.sol, d);
    }

    /* Tager mL ud fra toppen: foerst det ublandede lag, saa resten */
    function udtag(b, mL) {
        var ud = nyOpl();
        if (volumen(b) <= 0 || mL <= 0) return ud;
        if (b.lag && !b.lagBund) {
            var fraLag = del(b.lag, Math.min(mL, b.lag.V));
            bland(ud, fraLag);
            mL -= fraLag.V;
            if (b.lag.V < 0.001) b.lag = null;
        }
        if (mL > 1e-6) bland(ud, del(b.sol, mL));
        if (b.lag && b.lagBund && b.sol.V < 0.001) {
            bland(ud, del(b.lag, Math.min(mL, b.lag.V)));
            if (b.lag.V < 0.001) b.lag = null;
        }
        var agscn = b.sol.agscn + (b.lag ? b.lag.agscn : 0);
        b.bund = Math.min(b.bund, agscn);
        return ud;
    }

    /* Tidens gang i en beholder.
       s = { T: omgivelsernes temperatur, tau, bland: blandingens fart,
             roer: der roeres eller rystes, ryst } */
    function skridt(b, dt, s) {
        /* Fast stof oploeses i bunden */
        if (fastIalt(b) > 0 && volumen(b) > 0.05) {
            var fart = FAST.oploes + (s.roer ? FAST.roer : 0);
            ["fe", "scn", "vitc"].forEach(function (k) {
                if (b.fast[k] <= 0) return;
                var d = b.fast[k] < 0.05 ? b.fast[k] : b.fast[k] * (1 - Math.exp(-fart * dt));
                b.fast[k] -= d;
                nytLag(b, true);
                b.lag[k] += d;
            });
            if (b.lag) faeld(b.lag);
        }
        [b.sol, b.lag].forEach(function (o) {
            if (!o || o.V <= 0) return;
            o.T = s.T + (o.T - s.T) * Math.exp(-dt / s.tau);
            reducer(o, dt);
            var xl = xLigevaegt(o);
            o.x = xl + (o.x - xl) * Math.exp(-LIGEVAEGT.fart * dt);
            klampX(o);
        });
        if (b.lag && fastIalt(b) <= 0) {
            var f = 1 - Math.exp(-(s.bland || 0) * dt);
            bland(b.sol, del(b.lag, b.lag.V * f));
            if (b.lag.V < 0.02) {
                bland(b.sol, b.lag);
                b.lag = null;
                b.lagBund = false;
            }
        } else if (b.lag && s.bland > BLAND.diffusion + 0.01) {
            /* Roeres der, mens noget stadig oploeses, blandes det alligevel */
            bland(b.sol, del(b.lag, b.lag.V * (1 - Math.exp(-s.bland * dt))));
        }
        var agscn = b.sol.agscn + (b.lag ? b.lag.agscn : 0);
        b.bund += (agscn - b.bund) * (1 - Math.exp(-BUNDFALD.synk * dt));
        if (s.ryst > 0.01) b.bund *= Math.exp(-BUNDFALD.hvirvl * s.ryst * dt);
        b.bund = NK.klamp(b.bund, 0, agscn);
    }

    /* ----- Farver ------------------------------------------------------------ */
    function absorbans(o, lysvej) {
        if (!o || o.V <= 0) return null;
        var cx = o.x / o.V, cfe = Math.max(0, o.fe - o.x) / o.V, cfe2 = o.fe2 / o.V, cfv = o.farvestof / o.V;
        function kanal(k) {
            return (ABS.fescn[k] * cx + ABS.fe[k] * cfe + ABS.fe2[k] * cfe2 + ABS.farvestof[k] * cfv) * lysvej;
        }
        return { r: kanal("r"), g: kanal("g"), b: kanal("b") };
    }

    /* Oploesningens farve set gennem lysvejen (cm) mod hvidt lys */
    function farve(o, lysvej) {
        var A = absorbans(o, lysvej);
        if (!A) return null;
        var tr = Math.pow(10, -A.r), tg = Math.pow(10, -A.g), tb = Math.pow(10, -A.b);
        var moerke = 1 - (tr + tg + tb) / 3;
        var farvet = { r: 252 * tr, g: 246 * tg, b: 240 * tb, a: NK.klamp(0.34 + 0.62 * moerke, 0, 0.94) };
        return NK.blandFarve(FARVE.vand, farvet, NK.klamp(moerke * 4, 0, 1));
    }

    function glasFarve(o) { return farve(o, LYSVEJ.glas); }
    function baegerFarve(o) { return farve(o, LYSVEJ.baeger); }
    function oppefraFarve(o) { return o && o.V > 0 ? farve(o, o.V / LYSVEJ.tvaersnit) : null; }
    function baegerOppefraFarve(o) { return o && o.V > 0 ? farve(o, o.V / LYSVEJ.baegerTvaersnit) : null; }

    function farveNavn(o) {
        var A = absorbans(o, LYSVEJ.glas);
        if (!A) return "";
        if (o.farvestof > 0 && ABS.farvestof.r * o.farvestof / o.V * LYSVEJ.glas > A.g * 0.5) return A.r > 0.3 ? "blå" : "lyseblå";
        if (A.g < 0.05) return A.b > 0.05 ? "svagt gul" : "farveløs";
        if (A.g < 0.3) return "svagt orange";
        if (A.g < 0.8) return "orange";
        if (A.g < 1.6) return "rødorange";
        if (A.g < 2.6) return "rød";
        return "rødbrun";
    }

    /* ----- Sammenligning --------------------------------------------------- */
    function koncX(o) {
        return o && o.V > 0 ? o.x / o.V : 0;
    }

    /* Er glasset moerkere eller lysere end referencen, set fra siden? */
    function sammenlign(o, ref) {
        if (!o || !ref || o.V <= 0 || ref.V <= 0) return null;
        var a = koncX(o), b = koncX(ref);
        if (b < 1e-4) return a > 0.004 ? "mørkere" : "som referencen";
        var r = a / b;
        if (r > VURDER.moerkere) return "mørkere";
        if (r < VURDER.lysere) return "lysere";
        return "som referencen";
    }

    function sumA(A) {
        return A ? A.r + A.g + A.b : 0;
    }

    /* Er baegerglasset a moerkere eller lysere end b, set ovenfra? */
    function sammenlignOvenfra(a, b) {
        if (!a || !b || a.V <= 0 || b.V <= 0) return null;
        var A = sumA(absorbans(a, a.V / LYSVEJ.baegerTvaersnit));
        var B = sumA(absorbans(b, b.V / LYSVEJ.baegerTvaersnit));
        if (B < 1e-3) return A > 0.02 ? "mørkere" : "som det andet glas";
        var r = A / B;
        if (r > VURDER.ovenfraMoerkere) return "mørkere";
        if (r < VURDER.ovenfraLysere) return "lysere";
        return "som det andet glas";
    }

    /* Retningen, som ligevaegten forskydes, ud fra farveaendringen */
    function forskydning(rel) {
        if (rel === "mørkere") return "⟶";
        if (rel === "lysere") return "⟵";
        return "ingen";
    }

    /* ----- Partikelmodellen -------------------------------------------------- */
    /* Hvor mange af hver slags partikler boblen skal vise */
    function mikroMaal(b) {
        var o = samlet(b);
        var ud = { fe: 0, scn: 0, fescn: 0, fe2: 0, vitc: 0, ag: 0, agscn: 0, farvestof: 0, vand: 0 };
        if (o.V < 0.01) return ud;
        var s = MIKRO.PR_MM;
        var cFe = o.fe / o.V, cS = o.scn / o.V;
        var xp = ligevaegtsKonc(K(o.T) / 1000 * MIKRO.FORSTAERK, cFe, cS);
        /* De frie ioner rundes hver for sig. Rundes totalen foerst og
           komplekset traekkes fra, forsvinder forskellen mellem glassene i
           afrundingen, naar der er faa kugler. */
        var nX = Math.round(xp * s);
        if (nX === 0 && cFe > 0 && cS > 0 && xp * s > 0.25) nX = 1;
        ud.fe = Math.min(MIKRO.MAKS, Math.round((cFe - xp) * s));
        ud.scn = Math.min(MIKRO.MAKS, Math.round((cS - xp) * s));
        ud.fescn = Math.min(MIKRO.MAKS, nX);
        ud.fe2 = Math.min(MIKRO.MAKS_FE2, Math.round(o.fe2 / o.V * s));
        ud.vitc = Math.min(MIKRO.MAKS_VITC, Math.round(o.vitc / o.V * s));
        ud.ag = Math.min(MIKRO.MAKS_AG, Math.round(o.ag / o.V * s));
        ud.agscn = Math.min(MIKRO.MAKS_AGSCN, Math.round(o.agscn / o.V * s));
        ud.farvestof = Math.min(MIKRO.MAKS_FARVE, Math.round(o.farvestof / o.V * MIKRO.PR_MM_FARVE));
        ud.vand = MIKRO.VAND;
        return ud;
    }

    NK.Model = {
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        DRAABE: DRAABE,
        STAM: STAM,
        MAENGDE: MAENGDE,
        FAST: FAST,
        REDUKTION: REDUKTION,
        FARVESTOF: FARVESTOF,
        LIGEVAEGT: LIGEVAEGT,
        BLAND: BLAND,
        TEMP: TEMP,
        LYSVEJ: LYSVEJ,
        VURDER: VURDER,
        FORDOBLING: FORDOBLING,
        RYST: RYST,
        MIKRO: MIKRO,
        FARVE: FARVE,
        formel: formel,
        afstemt: afstemt,
        ligning: ligning,
        K: K,
        ligevaegtsKonc: ligevaegtsKonc,
        nyOpl: nyOpl,
        kopiOpl: kopiOpl,
        stamOpl: stamOpl,
        farveOpl: farveOpl,
        vandOpl: vandOpl,
        kscnOpl: kscnOpl,
        agOpl: agOpl,
        xLigevaegt: xLigevaegt,
        faeld: faeld,
        reducer: reducer,
        tilsaetDraabe: tilsaetDraabe,
        del: del,
        bland: bland,
        beholder: beholder,
        volumen: volumen,
        fastIalt: fastIalt,
        samlet: samlet,
        toem: toem,
        draabe: draabe,
        spatelspids: spatelspids,
        haeldI: haeldI,
        udtag: udtag,
        skridt: skridt,
        absorbans: absorbans,
        farve: farve,
        glasFarve: glasFarve,
        baegerFarve: baegerFarve,
        oppefraFarve: oppefraFarve,
        baegerOppefraFarve: baegerOppefraFarve,
        farveNavn: farveNavn,
        koncX: koncX,
        sammenlign: sammenlign,
        sammenlignOvenfra: sammenlignOvenfra,
        forskydning: forskydning,
        mikroMaal: mikroMaal
    };
}());

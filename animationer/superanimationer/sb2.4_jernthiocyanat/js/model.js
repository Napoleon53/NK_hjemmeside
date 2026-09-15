/* =====================================================================
   model.js - kemien og tallene bag forsoeget

   Jern(III)thiocyanat-ligevaegten:

     Fe3+(aq) + SCN-(aq)  <=>  FeSCN2+(aq)        (komplekset er roedt)

   En oploesning beskrives med stofmaengder i µmol og volumen i mL. Saa
   er µmol/mL det samme som mM:
     V      volumen (mL)
     fe     jern(III) i alt, frit og bundet i komplekset
     scn    thiocyanat i alt, frit og bundet (det faeldede er trukket fra)
     ag     frie soelvioner
     agscn  faeldet AgSCN(s)
     x      komplekset FeSCN2+. Foelger ligevaegten med en kort forsinkelse
     T      temperatur i °C

   Ag+ fjerner SCN- som et hvidt, meget tungtoploeseligt bundfald:
     Ag+(aq) + SCN-(aq)  ->  AgSCN(s)

   K afhaenger af temperaturen (van 't Hoff). Reaktionen mod hoejre er
   exoterm, saa K bliver mindre ved opvarmning og stoerre ved afkoeling.

   En beholder (baegerglasset eller et reagensglas) har en blandet
   oploesning (sol) og et lag i toppen, der endnu ikke er blandet (lag).
   Draaberne lander i laget og blandes ind ved diffusion, rystning eller
   omroering. Haeldes der fra en beholder, tages laget foerst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var STOFFER = {
        "Fe3+":    { atomer: { Fe: 1 }, q: 3, fase: "aq" },
        "SCN-":    { atomer: { S: 1, C: 1, N: 1 }, q: -1, fase: "aq" },
        "FeSCN2+": { atomer: { Fe: 1, S: 1, C: 1, N: 1 }, q: 2, fase: "aq" },
        "Ag+":     { atomer: { Ag: 1 }, q: 1, fase: "aq" },
        "AgSCN":   { atomer: { Ag: 1, S: 1, C: 1, N: 1 }, q: 0, fase: "s" },
        "K+":      { atomer: { K: 1 }, q: 1, fase: "aq" },
        "NO3-":    { atomer: { N: 1, O: 3 }, q: -1, fase: "aq" },
        "H2O":     { atomer: { H: 2, O: 1 }, q: 0, fase: "l" }
    };

    /* Formlerne, som de skrives paa skaermen. Ladningen bygges altid med
       ladningHaevet, saa ±1 bliver + og −. */
    var GRUNDFORMEL = {
        "Fe3+": "Fe", "SCN-": "SCN", "FeSCN2+": "FeSCN", "Ag+": "Ag", "AgSCN": "AgSCN",
        "K+": "K", "NO3-": "NO₃", "H2O": "H₂O"
    };

    function formel(navn, medFase) {
        var s = STOFFER[navn];
        return GRUNDFORMEL[navn] + NK.ladningHaevet(s.q) + (medFase ? "(" + s.fase + ")" : "");
    }

    var REAKTIONER = {
        ligevaegt: { venstre: [[1, "Fe3+"], [1, "SCN-"]], hoejre: [[1, "FeSCN2+"]], pil: "⇌" },
        faeldning: { venstre: [[1, "Ag+"], [1, "SCN-"]], hoejre: [[1, "AgSCN"]] }
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

    var MAENGDE = {
        VAND_BAEGER: 30,     /* mL pr. klik paa sproejteflasken i baegerglasset */
        VAND_GLAS: 2,        /* mL pr. klik i et reagensglas */
        FORDEL: 5,           /* mL i hvert reagensglas */
        GLAS_MAKS: 17,       /* saa meget kan et reagensglas rumme */
        BAEGER_MAKS: 100,
        LAG_GLAS: 1.2,       /* mL oploesning, en draabe blandes med i toppen */
        LAG_BAEGER: 5,
        ANBEFALET: 4         /* draaber af hver i stamoploesningen */
    };

    /* K ved 20 °C i M^-1, reaktionsentalpien i J/mol, og hvor hurtigt
       komplekset foelger ligevaegten (pr. sekund) */
    var LIGEVAEGT = { K20: 140, T0: 20, dH: -20000, R: 8.314, fart: 3 };

    /* Blandingens fart pr. sekund: diffusion, fuld rystning og omroering */
    var BLAND = { diffusion: 0.03, ryst: 3.2, roer: 3.5 };

    /* Temperaturerne og hvor hurtigt et glas naar dem (tidskonstant i s).
       Et glas taeller som varmt over varm og som koldt under kold. */
    var TEMP = { stue: 20, vandbad: 80, isbad: 0, tauBad: 3.5, tauIs: 4.5, tauLuft: 25, varm: 60, kold: 8 };

    /* Lysvejen i cm gennem et reagensglas fra siden og gennem
       baegerglasset. Ovenfra er lysvejen vaeskesoejlens hoejde: V delt med
       glassets tvaersnit (cm²). */
    var LYSVEJ = { glas: 1.4, baeger: 4, tvaersnit: 1.54 };

    /* Absorbans pr. mM og cm i roed, groen og blaa. FeSCN2+ absorberer
       blaagroent lys og ser roedt ud; Fe3+ er svagt gult. */
    var ABS = {
        fescn: { r: 0.45, g: 4.6, b: 6.2 },
        fe:    { r: 0, g: 0.012, b: 0.07 }
    };

    /* Sammenligning med referencen: forholdet mellem c(FeSCN2+) i glasset
       og i referencen */
    var VURDER = { moerkere: 1.25, lysere: 0.8 };

    /* Stamoploesningen: for moerk og for lys (mM FeSCN2+ i ligevaegt), og
       hvornaar glassene er saa forskellige, at der ikke var roert om */
    var STAM = { moerk: 0.28, lys: 0.008, ujaevn: 2.5 };

    /* Rystning med musen: FULD er den fart (tegneenheder pr. sekund), der
       giver fuld rystning. Rystes der voldsommere end SPILD_FART i
       SPILD_TID sekunder, sproejter indholdet ud. Knappen Ryst glasset
       spilder aldrig. */
    var RYST = { FULD: 900, SPILD_FART: 1500, SPILD_TID: 0.7 };

    /* Partikelmodellen i zoomboblen: partikler pr. mM. K er forstaerket,
       saa der kan ses komplekser; det er et modelbillede, ikke et regnskab. */
    var MIKRO = { PR_MM: 8, FORSTAERK: 12, MAKS: 22, MAKS_AG: 10, MAKS_AGSCN: 12, VAND: 12 };

    /* Bundfaldet synker (pr. sekund) og hvirvles op ved rystning */
    var BUNDFALD = { synk: 0.22, hvirvl: 2.5 };

    var FARVE = {
        vand:     { r: 196, g: 224, b: 242, a: 0.26 },
        bundfald: { r: 246, g: 247, b: 244, a: 0.96 },
        badVand:  { r: 170, g: 210, b: 236, a: 0.24 },
        pyt:      { r: 222, g: 110, b: 80, a: 0.85 }
    };

    /* ----- Ligevaegten ------------------------------------------------------ */
    function K(T) {
        var L = LIGEVAEGT;
        return L.K20 * Math.exp(-L.dH / L.R * (1 / (T + 273.15) - 1 / (L.T0 + 273.15)));
    }

    /* c(FeSCN2+) i ligevaegt (mM) ud fra c(Fe) og c(SCN) i alt (a og b) og
       K i mM^-1. Loesningen til x = K (a - x)(b - x), skrevet saa den er
       stabil ogsaa for smaa tal. */
    function ligevaegtsKonc(k, a, b) {
        if (a <= 0 || b <= 0 || k <= 0) return 0;
        var s = k * (a + b) + 1;
        var d = s * s - 4 * k * k * a * b;
        return 2 * k * a * b / (s + Math.sqrt(Math.max(0, d)));
    }

    function nyOpl() {
        return { V: 0, fe: 0, scn: 0, ag: 0, agscn: 0, x: 0, T: TEMP.stue };
    }

    var FELTER = ["V", "fe", "scn", "ag", "agscn", "x"];

    function kopiOpl(o) {
        return { V: o.V, fe: o.fe, scn: o.scn, ag: o.ag, agscn: o.agscn, x: o.x, T: o.T };
    }

    /* Komplekset i ligevaegt (µmol) */
    function xLigevaegt(o) {
        if (o.V <= 0) return 0;
        return ligevaegtsKonc(K(o.T) / 1000, o.fe / o.V, o.scn / o.V) * o.V;
    }

    function klampX(o) {
        o.x = NK.klamp(o.x, 0, Math.max(0, Math.min(o.fe, o.scn)));
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

    /* stof: "fe", "scn" eller "ag". antal draaber. */
    function tilsaet(o, stof, antal) {
        var n = antal === undefined ? 1 : antal;
        var vFoer = o.V;
        o.V += n * DRAABE.mL;
        if (stof === "fe") o.fe += n * DRAABE.umol;
        else if (stof === "scn") o.scn += n * DRAABE.umol;
        else if (stof === "ag") o.ag += n * DRAABE.umol;
        o.T = vFoer > 0 ? (o.T * vFoer + TEMP.stue * n * DRAABE.mL) / o.V : TEMP.stue;
        faeld(o);
    }

    function tilsaetVand(o, mL) {
        o.T = o.V > 0 ? (o.T * o.V + TEMP.stue * mL) / (o.V + mL) : TEMP.stue;
        o.V += mL;
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
        FELTER.forEach(function (k) { til[k] += d[k]; });
        faeld(til);
        klampX(til);
    }

    /* ----- Beholdere -------------------------------------------------------- */
    function beholder(lagMl) {
        return { sol: nyOpl(), lag: null, lagMl: lagMl, bund: 0 };
    }

    function volumen(b) {
        return b.sol.V + (b.lag ? b.lag.V : 0);
    }

    /* Hele indholdet, som om det var blandet */
    function samlet(b) {
        var o = kopiOpl(b.sol);
        if (b.lag) bland(o, kopiOpl(b.lag));
        return o;
    }

    function toem(b) {
        b.sol = nyOpl();
        b.lag = null;
        b.bund = 0;
    }

    /* En draabe lander i toppen af beholderen */
    function draabe(b, stof) {
        if (b.sol.V < 0.05 && !b.lag) {
            tilsaet(b.sol, stof, 1);
            return;
        }
        if (!b.lag) b.lag = del(b.sol, Math.min(b.lagMl, b.sol.V * 0.4));
        tilsaet(b.lag, stof, 1);
    }

    function vandI(b, mL) {
        tilsaetVand(b.sol, mL);
    }

    /* Tager mL ud fra toppen: foerst det ublandede lag, saa resten */
    function udtag(b, mL) {
        var ud = nyOpl();
        if (volumen(b) <= 0 || mL <= 0) return ud;
        if (b.lag) {
            var fraLag = del(b.lag, Math.min(mL, b.lag.V));
            bland(ud, fraLag);
            mL -= fraLag.V;
            if (b.lag.V < 0.001) b.lag = null;
        }
        if (mL > 1e-6) bland(ud, del(b.sol, mL));
        var agscn = b.sol.agscn + (b.lag ? b.lag.agscn : 0);
        b.bund = Math.min(b.bund, agscn);
        return ud;
    }

    function haeldI(b, d) {
        bland(b.sol, d);
    }

    /* Tidens gang i en beholder.
       s = { T: omgivelsernes temperatur, tau, bland: blandingens fart, ryst } */
    function skridt(b, dt, s) {
        [b.sol, b.lag].forEach(function (o) {
            if (!o || o.V <= 0) return;
            o.T = s.T + (o.T - s.T) * Math.exp(-dt / s.tau);
            var xl = xLigevaegt(o);
            o.x = xl + (o.x - xl) * Math.exp(-LIGEVAEGT.fart * dt);
            klampX(o);
        });
        if (b.lag) {
            var f = 1 - Math.exp(-(s.bland || 0) * dt);
            bland(b.sol, del(b.lag, b.lag.V * f));
            if (b.lag.V < 0.02) {
                bland(b.sol, b.lag);
                b.lag = null;
            }
        }
        var agscn = b.sol.agscn + (b.lag ? b.lag.agscn : 0);
        b.bund += (agscn - b.bund) * (1 - Math.exp(-BUNDFALD.synk * dt));
        if (s.ryst > 0.01) b.bund *= Math.exp(-BUNDFALD.hvirvl * s.ryst * dt);
        b.bund = NK.klamp(b.bund, 0, agscn);
    }

    /* ----- Farver ------------------------------------------------------------ */
    function absorbans(o, lysvej) {
        if (!o || o.V <= 0) return null;
        var cx = o.x / o.V, cfe = Math.max(0, o.fe - o.x) / o.V;
        return {
            r: (ABS.fescn.r * cx + ABS.fe.r * cfe) * lysvej,
            g: (ABS.fescn.g * cx + ABS.fe.g * cfe) * lysvej,
            b: (ABS.fescn.b * cx + ABS.fe.b * cfe) * lysvej
        };
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

    function farveNavn(o) {
        var A = absorbans(o, LYSVEJ.glas);
        if (!A) return "";
        var a = A.g;
        if (a < 0.05) return "farveløs";
        if (a < 0.2) return "svagt orange";
        if (a < 0.45) return "orange";
        if (a < 0.9) return "rødorange";
        if (a < 1.6) return "rød";
        return "mørkerød";
    }

    /* ----- Sammenligning --------------------------------------------------- */
    function koncX(o) {
        return o && o.V > 0 ? o.x / o.V : 0;
    }

    /* Er glasset moerkere eller lysere end referencen? */
    function sammenlign(o, ref) {
        if (!o || !ref || o.V <= 0 || ref.V <= 0) return null;
        var a = koncX(o), b = koncX(ref);
        if (b < 1e-4) return a > 0.004 ? "mørkere" : "som referencen";
        var r = a / b;
        if (r > VURDER.moerkere) return "mørkere";
        if (r < VURDER.lysere) return "lysere";
        return "som referencen";
    }

    function forskydning(rel) {
        if (rel === "mørkere") return "mod højre";
        if (rel === "lysere") return "mod venstre";
        return "ingen";
    }

    /* Stamoploesningen, naar den fordeles */
    function stamVurdering(o) {
        if (!o || o.V <= 0) return "tom";
        if (o.agscn > 0.5) return "soelv";
        if (o.fe <= 0 || o.scn <= 0) return "farveloes";
        var c = xLigevaegt(o) / o.V;
        if (c > STAM.moerk) return "moerk";
        if (c < STAM.lys) return "lys";
        return "ok";
    }

    /* ----- Partikelmodellen -------------------------------------------------- */
    /* Hvor mange af hver slags partikler boblen skal vise */
    function mikroMaal(b) {
        var o = samlet(b);
        var ud = { fe: 0, scn: 0, fescn: 0, ag: 0, agscn: 0, vand: 0 };
        if (o.V < 0.01) return ud;
        var s = MIKRO.PR_MM;
        var cFe = o.fe / o.V, cS = o.scn / o.V;
        var nFe = Math.min(MIKRO.MAKS, Math.round(cFe * s));
        var nS = Math.min(MIKRO.MAKS, Math.round(cS * s));
        var xp = ligevaegtsKonc(K(o.T) / 1000 * MIKRO.FORSTAERK, cFe, cS);
        var nX = Math.min(Math.round(xp * s), nFe, nS);
        if (nX === 0 && nFe > 0 && nS > 0 && xp * s > 0.25) nX = 1;
        ud.fe = nFe - nX;
        ud.scn = nS - nX;
        ud.fescn = nX;
        ud.ag = Math.min(MIKRO.MAKS_AG, Math.round(o.ag / o.V * s));
        ud.agscn = Math.min(MIKRO.MAKS_AGSCN, Math.round(o.agscn / o.V * s));
        ud.vand = MIKRO.VAND;
        return ud;
    }

    NK.Model = {
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        DRAABE: DRAABE,
        MAENGDE: MAENGDE,
        LIGEVAEGT: LIGEVAEGT,
        BLAND: BLAND,
        TEMP: TEMP,
        LYSVEJ: LYSVEJ,
        VURDER: VURDER,
        STAM: STAM,
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
        xLigevaegt: xLigevaegt,
        faeld: faeld,
        tilsaet: tilsaet,
        tilsaetVand: tilsaetVand,
        del: del,
        bland: bland,
        beholder: beholder,
        volumen: volumen,
        samlet: samlet,
        toem: toem,
        draabe: draabe,
        vandI: vandI,
        udtag: udtag,
        haeldI: haeldI,
        skridt: skridt,
        farve: farve,
        glasFarve: glasFarve,
        baegerFarve: baegerFarve,
        oppefraFarve: oppefraFarve,
        farveNavn: farveNavn,
        koncX: koncX,
        sammenlign: sammenlign,
        forskydning: forskydning,
        stamVurdering: stamVurdering,
        mikroMaal: mikroMaal
    };
}());

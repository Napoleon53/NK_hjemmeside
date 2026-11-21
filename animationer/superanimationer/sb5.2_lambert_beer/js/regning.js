/* =====================================================================
   regning.js - regnestykkerne paa fane 3: facit, tjek og hint

   Hvert trin regnes i to skridt (regelsaettet regel 14, 21. nov. 2026,
   som Beregningen i sc5.7):

       c = A / (ε · l)                     1. formlen: tre knapper paa kortet
         = 0,611 / (4,70 mM⁻¹·cm⁻¹ · 1,00 cm)   (tavlen saetter tallene ind)
         = 0,130 mM                        2. tallet i et felt paa kortet

   Her er kun tallene og teksterne. Kortet og tavlen er i js/sim_regn.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var LB = NK.LB;
    var R = {};

    /* ----- Opgavens tal og facit ----------------------------------------------------- */
    function regn(id, v) {
        if (id === "A") return v.eps * v.l * v.c;
        if (id === "c") return v.A / (v.eps * v.l);
        if (id === "eps") return v.A / (v.l * v.c);
        if (id === "epsA") return v.a / v.l;
        if (id === "n") return v.c * v.V;
        if (id === "m") return v.n * v.M;
        return NaN;
    }

    /* Tallene med tre betydende cifre, som de staar paa tavlen */
    R.tekst = function (v) { return NK.betydende(v, 3); };

    /* { tal: { bogstav: { v, tekst } }, facit: [{ bogstav, v, tekst }] }.
       Resultatet af et trin bliver et tal, de naeste trin kan bruge. */
    R.vaerdier = function (o) {
        if (o._vaerdier) return o._vaerdier;
        var tal = {}, raa = {};
        Object.keys(o.tal).forEach(function (b) {
            var v = parseFloat(o.tal[b].replace(",", "."));
            tal[b] = { v: v, tekst: o.tal[b], givet: true };
            raa[b] = v;
        });
        var facit = o.trin.map(function (id) {
            var b = D.TRIN[id].maal;
            var v = regn(id, raa);
            var t = R.tekst(v);
            /* Det naeste trin regner videre med tallet, som det staar */
            raa[b] = parseFloat(t.replace(",", "."));
            tal[b] = { v: raa[b], tekst: t, givet: false };
            return { bogstav: b, v: v, tekst: t };
        });
        o._vaerdier = { tal: tal, facit: facit };
        return o._vaerdier;
    };

    R.enhed = function (b) { return D.BOGSTAV[b] ? D.BOGSTAV[b].enhed : ""; };
    R.vis = function (b) { return D.BOGSTAV[b] ? D.BOGSTAV[b].vis : b; };

    /* "4,70 mM⁻¹·cm⁻¹", "0,611" */
    R.talMedEnhed = function (b, tekst) {
        var e = R.enhed(b);
        return tekst + (e ? " " + e : "");
    };

    /* ----- Formlen -------------------------------------------------------------------- */
    /* Formlen som HTML i formens form med bogstaverne eller tallene */
    R.formHTML = function (sk, dele) {
        if (sk === "**") return dele[0] + " · " + dele[1];
        if (sk === "***") return dele[0] + " · " + dele[1] + " · " + dele[2];
        if (sk === "/") return '<span class="vbroek"><span>' + dele[0] + "</span><span>" + dele[1] + "</span></span>";
        return '<span class="vbroek"><span>' + dele[0] + "</span><span>" + dele[1] + " · " + dele[2] + "</span></span>";
    };

    /* Den rigtige formel (bogstaverne i den raekkefoelge, de staar i D.TRIN) */
    R.facitBogstaver = function (id) {
        var t = D.TRIN[id];
        return t.top.concat(t.bund);
    };

    R.formelHTML = function (id, bogst) {
        var t = D.TRIN[id];
        var b = bogst || R.facitBogstaver(id);
        return R.formHTML(t.form, b.map(R.vis));
    };

    /* Formlen paa én linje som tekst: "c = A / (ε · l)" */
    R.formelTekst = function (id) {
        var t = D.TRIN[id], v = t.top.map(R.vis), u = t.bund.map(R.vis);
        var hoejre;
        if (t.form === "/") hoejre = v[0] + " / " + u[0];
        else if (t.form === "/**") hoejre = v[0] + " / (" + u.join(" · ") + ")";
        else hoejre = v.join(" · ");
        return R.vis(t.maal) + " = " + hoejre;
    };

    /* ----- Resultatet --------------------------------------------------------------------- */
    /* De fejl, der kan regnes ud: hvad eleven sikkert har tastet */
    function fejlVaerdier(id, v) {
        var ud = [];
        if (id === "c") {
            ud.push({ v: v.A * v.eps * v.l, b: "Du har ganget. c står alene, når A divideres med ε · l." });
            ud.push({ v: v.eps * v.l / v.A, b: "Brøken er vendt. A skal stå over brøkstregen." });
            if (v.l !== 1) {
                ud.push({ v: v.A / v.eps, b: "Du har kun divideret med ε. l = " + R.talMedEnhed("l", NK.dk(v.l, v.l < 1 ? 3 : 2)) + " skal også med under brøkstregen." });
                ud.push({ v: v.A / v.eps * v.l, b: "Resultatet svarer til A / ε · l tastet uden parentes, så lommeregneren har ganget med l. Sæt parentes om ε · l." });
            }
        } else if (id === "eps") {
            ud.push({ v: v.A * v.l * v.c, b: "Du har ganget. ε står alene, når A divideres med l · c." });
            ud.push({ v: v.l * v.c / v.A, b: "Brøken er vendt. A skal stå over brøkstregen." });
            ud.push({ v: v.A / v.l * v.c, b: "Resultatet svarer til A / l · c tastet uden parentes, så lommeregneren har ganget med c. Sæt parentes om l · c." });
            if (v.l !== 1) ud.push({ v: v.A / v.c, b: "Du har kun divideret med c. l skal også med under brøkstregen." });
        } else if (id === "epsA") {
            ud.push({ v: v.a * v.l, b: "Du har ganget. ε = a / l, så hældningen skal divideres med l." });
            ud.push({ v: v.l / v.a, b: "Brøken er vendt. a skal stå over brøkstregen." });
        } else if (id === "A") {
            ud.push({ v: v.eps * v.c, b: "l mangler. A = ε · l · c." });
            ud.push({ v: v.c / (v.eps * v.l), b: "Der skal ganges: A = ε · l · c." });
            ud.push({ v: v.eps * v.l / v.c, b: "Der skal ganges: A = ε · l · c." });
        } else if (id === "n") {
            ud.push({ v: v.c / v.V, b: "Der skal ganges: n = c · V." });
            ud.push({ v: v.V / v.c, b: "Der skal ganges: n = c · V." });
        } else if (id === "m") {
            ud.push({ v: v.n / v.M, b: "Der skal ganges: m = n · M." });
            ud.push({ v: v.M / v.n, b: "Der skal ganges: m = n · M." });
        }
        return ud;
    }

    var ENHED_FORKLARING = {
        A: "A har ingen enhed: mM⁻¹·cm⁻¹ · cm · mM = 1.",
        c: "c får enheden mM, fordi A ikke har nogen enhed, og 1 / (mM⁻¹·cm⁻¹ · cm) = mM.",
        eps: "ε har enheden mM⁻¹·cm⁻¹. Den står efter feltet.",
        n: "n får enheden mmol: mM · L = mmol/L · L = mmol.",
        m: "m får enheden mg: mmol · g/mol = mg."
    };
    R.ENHED_FORKLARING = ENHED_FORKLARING;

    /* i: trinnets nummer. Svar: { ok } eller { tom, besked } */
    R.tjekRes = function (o, i, raa) {
        var id = o.trin[i], b = D.TRIN[id].maal;
        var V = R.vaerdier(o), f = V.facit[i].v;
        var v = {};
        Object.keys(V.tal).forEach(function (k) { v[k] = V.tal[k].v; });
        /* Trinnets egne tal er dem, der staar foer trinnet */
        var s = LB.laes(raa);
        if (s.tom) return { tom: true, besked: "Regn resultatet ud, og skriv tallet i feltet." };
        if (s.tal === null) return { besked: "Skriv resultatet som et tal" + (R.enhed(b) && b !== "eps" ? " med enhed, fx 0,130 mM." : ", fx 0,735.") };
        var om = LB.omregn(b === "eps" ? "eps" : b, s);
        if (om.enhed === "forkert") {
            return { besked: (b === "A" ? "" : "Enheden passer ikke. ") + ENHED_FORKLARING[b] };
        }
        if (om.enhed === "" && b !== "A" && b !== "eps") {
            if (LB.ens(s.tal, f, 0.012)) return { besked: "Tallet er rigtigt. Skriv enheden efter tallet: " + R.enhed(b) + "." };
            return { besked: "Skriv resultatet med enhed. " + ENHED_FORKLARING[b] };
        }
        if (LB.ens(om.v, f, 0.012)) return { ok: true };
        /* Enheden er skrevet, men 1000 gange forkert */
        if (om.faktor && om.faktor !== 1 && LB.ens(s.tal, f, 0.012)) {
            return { besked: "Tallet passer, men enheden er forkert. " + ENHED_FORKLARING[b] };
        }
        var fejl = fejlVaerdier(id, v);
        for (var k = 0; k < fejl.length; k++) if (LB.ens(om.v, fejl[k].v, 0.012)) return { besked: fejl[k].b };
        if (LB.ens(om.v, f, 0.05)) return { besked: "Tæt på. Tjek afrundingen. Regn med tallene, som de står, og afrund først til sidst." };
        return { besked: "Ikke rigtigt. Regn mellemregningen ud på lommeregneren igen." };
    };

    R.facitTekst = function (o, i) {
        var V = R.vaerdier(o), b = D.TRIN[o.trin[i]].maal;
        return R.talMedEnhed(b, V.facit[i].tekst);
    };

    /* Mellemregningen med tal og enheder (tal: teksterne i felternes
       raekkefoelge, ellers facit) */
    R.talHTML = function (o, i, bogst, tal) {
        var id = o.trin[i], t = D.TRIN[id], V = R.vaerdier(o);
        var b = bogst || R.facitBogstaver(id);
        var dele = b.map(function (x, j) { return tal && tal[j] ? tal[j] : R.talMedEnhed(x, V.tal[x].tekst); });
        return R.formHTML(t.form, dele);
    };

    /* Hele regnestykket paa én linje */
    R.linjeHTML = function (o, i, bogst, tal) {
        var id = o.trin[i], t = D.TRIN[id];
        return R.vis(t.maal) + " = " + R.formelHTML(id, bogst) + " = " + R.talHTML(o, i, bogst, tal) + " = <b>" + R.facitTekst(o, i) + "</b>";
    };

    /* ----- Hint --------------------------------------------------------------------------- */
    var FORMEL_HINT = {
        A: ["Du kender ε, l og c og skal finde absorbansen A.", "Lambert-Beers lov giver A direkte: A = ε · …", "A = ε · l · c."],
        c: ["Du kender A, ε og l og skal finde koncentrationen c.", "Isolér c i A = ε · l · c: c = A / …", "c = A / (ε · l)."],
        eps: ["Du kender A, l og c og skal finde ε.", "Isolér ε i A = ε · l · c: ε = A / …", "ε = A / (l · c)."],
        epsA: ["Du kender hældningen a og kuvettebredden l og skal finde ε.", "Standardkurven er A = a · c, og Lambert-Beers lov er A = ε · l · c. Derfor er a = ε · l.", "ε = a / l."],
        n: ["Du kender koncentrationen c og rumfanget V og skal finde stofmængden n.", "n = c · …", "n = c · V."],
        m: ["Du kender stofmængden n og molarmassen M og skal finde massen m.", "m = n · …", "m = n · M."]
    };
    R.formelHint = function (id) { return FORMEL_HINT[id]; };

    /* Resultatet: tasterne, enheden og begyndelsen af tallet */
    R.resHint = function (o, i) {
        var id = o.trin[i], t = D.TRIN[id], V = R.vaerdier(o);
        var b = R.facitBogstaver(id).map(function (x) { return V.tal[x].tekst; });
        var taster;
        if (t.form === "/**") taster = b[0] + " / (" + b[1] + " · " + b[2] + ")";
        else if (t.form === "/") taster = b[0] + " / " + b[1];
        else taster = b.join(" · ");
        var f = V.facit[i].v;
        var start = NK.betydende(f, 2);
        return ["Tast " + taster + " på lommeregneren." + (t.form === "/**" ? " Husk parentesen om det, der står under brøkstregen." : ""),
            ENHED_FORKLARING[t.maal],
            "Resultatet begynder med " + start.replace(/(\d)$/, "$1") + "…"];
    };

    NK.Regn = R;
}());

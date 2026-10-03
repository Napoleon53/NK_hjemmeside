/* =====================================================================
   regning.js - regnestykkerne paa fane 3: facit, tjek og hint

   Hvert trin regnes i tre skridt, som eleverne skal skrive det
   (moenstret fra sc5.1 og sc4.3):

       c = A / (ε · l)                     1. formlen: formens skabelon og
                                              et bogstav i hvert felt
         = 0,611 / (4,70 mM⁻¹·cm⁻¹ · 1,00 cm)   2. tallene ind
         = 0,130 mM                        3. resultatet med enhed

   Her er kun tallene og teksterne. Felterne og tavlen er i
   js/sim_regn.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var LB = NK.LB;
    var R = {};

    R.ANTAL = { "**": 2, "***": 3, "/": 2, "/**": 3 };

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

    /* De bogstaver, der er i opgaven: tallene og det, der skal findes */
    R.bogstaver = function (o) {
        var ud = {};
        Object.keys(o.tal).forEach(function (b) { ud[b] = 1; });
        o.trin.forEach(function (id) {
            var t = D.TRIN[id];
            ud[t.maal] = 1;
            t.top.concat(t.bund).forEach(function (b) { ud[b] = 1; });
        });
        return ud;
    };

    /* Knapperne med bogstaver under tavlen: altid A, ε, l og c, og
       de andre, opgaven bruger */
    R.knapBogstaver = function (o) {
        var har = R.bogstaver(o);
        return ["A", "eps", "l", "c", "a", "n", "V", "m", "M"].filter(function (b) {
            return ["A", "eps", "l", "c"].indexOf(b) >= 0 || har[b];
        });
    };

    /* Det, eleven skriver i et bogstavfelt, laest som et bogstav */
    R.bogstav = function (raa, o) {
        var s = String(raa || "").trim();
        if (!s) return "";
        var har = R.bogstaver(o);
        if (/^(ε|ϵ|Є|e|E|eps|epsilon|Eps|Epsilon)$/.test(s)) return "eps";
        if (s === "A") return "A";
        if (s === "a") return har.a ? "a" : "A";
        if (s === "l" || s === "L") return "l";
        if (s === "c" || s === "C") return "c";
        if (s === "n" || s === "N") return "n";
        if (s === "V" || s === "v") return "V";
        if (s === "m") return "m";
        if (s === "M") return "M";
        return "?" + s;
    };

    /* ----- Formlen -------------------------------------------------------------------- */
    function smaeltSammen(liste) { return liste.slice().sort().join(","); }

    /* Formlen som HTML i den skabelon, eleven valgte, med elevens bogstaver */
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

    R.SK_NAVN = { "**": "□ · □", "***": "□ · □ · □", "/": "□ / □", "/**": "□ / (□ · □)" };

    /* bogst: elevens bogstaver (allerede laest med R.bogstav).
       Svar: { ok } eller { tom, besked, felt } */
    R.tjekFormel = function (id, sk, bogst) {
        var t = D.TRIN[id];
        var n = R.ANTAL[sk];
        var tomme = [];
        for (var i = 0; i < n; i++) if (!bogst[i]) tomme.push(i);
        if (tomme.length === n) return { tom: true, besked: "Skriv et bogstav i hvert felt. Du kan også klikke på bogstaverne under tavlen.", felt: 0 };
        for (i = 0; i < n; i++) {
            if (bogst[i] && bogst[i].charAt(0) === "?") {
                return { besked: "Bogstavet " + bogst[i].slice(1) + " bruges ikke her. Bogstaverne står under tavlen.", felt: i };
            }
            if (bogst[i] === t.maal) {
                return { besked: R.vis(t.maal) + " er det, du skal finde. Det står alene på venstre side og skal ikke stå i formlen.", felt: i };
            }
        }
        if (tomme.length) return { tom: true, besked: "Der mangler et bogstav i et felt.", felt: tomme[0] };
        var navn = D.BOGSTAV[t.maal].navn;
        if (sk !== t.form) {
            var deler = t.form === "/" || t.form === "/**";
            var elevDeler = sk === "/" || sk === "/**";
            if (deler && !elevDeler) return { besked: "Formlen for " + navn + " er en brøk. Der skal divideres. Vælg en anden form." };
            if (!deler && elevDeler) return { besked: "Formlen for " + navn + " er et gangestykke. Der skal ikke divideres. Vælg en anden form." };
            if (t.form === "/**") return { besked: "Under brøkstregen skal der stå to bogstaver ganget sammen. Vælg formen □ / (□ · □)." };
            if (t.form === "/") return { besked: "Formlen har ét bogstav over og ét under brøkstregen. Vælg formen □ / □." };
            if (t.form === "***") return { besked: "Formlen for " + navn + " har tre bogstaver ganget sammen. Vælg formen □ · □ · □." };
            return { besked: "Formlen for " + navn + " har to bogstaver ganget sammen. Vælg formen □ · □." };
        }
        if (sk === "**" || sk === "***") {
            if (smaeltSammen(bogst.slice(0, n)) === smaeltSammen(t.top)) return { ok: true };
            var mangler = t.top.filter(function (b) { return bogst.indexOf(b) < 0; });
            return { besked: "Formlen passer ikke. " + (mangler.length ? R.vis(mangler[0]) + " mangler." : "") };
        }
        var top = [bogst[0]], bund = bogst.slice(1, n);
        if (top[0] === t.top[0] && smaeltSammen(bund) === smaeltSammen(t.bund)) return { ok: true };
        if (t.bund.indexOf(top[0]) >= 0 && bund.indexOf(t.top[0]) >= 0) {
            return { besked: "Brøken er vendt. " + R.vis(t.top[0]) + " skal stå over brøkstregen.", felt: 0 };
        }
        if (top[0] !== t.top[0]) return { besked: R.vis(top[0]) + " skal ikke stå over brøkstregen.", felt: 0 };
        var forkert = bund.filter(function (b) { return t.bund.indexOf(b) < 0; })[0];
        return { besked: R.vis(forkert || bund[0]) + " skal ikke stå under brøkstregen.", felt: bund.indexOf(forkert) + 1 };
    };

    /* ----- Tallene ind ------------------------------------------------------------------ */
    /* Hvilket bogstav et tal hoerer til (ingen enhed: kun tallet) */
    function hvemEr(vaerdier, v, undtagen) {
        var hvem = null;
        Object.keys(vaerdier.tal).forEach(function (b) {
            if (b !== undtagen && LB.ens(v, vaerdier.tal[b].v, 0.006)) hvem = b;
        });
        return hvem;
    }

    /* Et tal i mellemregningen. b: det bogstav, der staar i feltet.
       Svar: { ok, tekst } eller { tom, besked } */
    R.tjekTal = function (o, b, raa) {
        var V = R.vaerdier(o);
        var s = LB.laes(raa);
        if (s.tom) return { tom: true, besked: "Skriv tallet for " + R.vis(b) + " i feltet." };
        if (s.tal === null) return { besked: "Skriv et tal, fx 0,611. Brug komma eller punktum." };
        var om = LB.omregn(b, s);
        var forventet = V.tal[b].v;
        if (om.enhed === "forkert") {
            return { besked: R.vis(b) + " har enheden " + (R.enhed(b) || "ingen enhed") + ". Skriv tallet med den enhed eller uden enhed." };
        }
        if (LB.ens(om.v, forventet, 0.006)) return { ok: true, tekst: R.talMedEnhed(b, V.tal[b].tekst) };
        if (om.faktor && om.faktor !== 1 && LB.ens(s.tal, forventet, 0.006)) {
            return { besked: "Tallet passer, men enheden ikke: " + R.vis(b) + " = " + R.talMedEnhed(b, V.tal[b].tekst) + "." };
        }
        if (b === "V" && LB.ens(s.tal, forventet * 1000, 0.006)) {
            return { besked: "V skal stå i liter, fordi c er i mM = mmol/L: " + NK.dk(forventet * 1000, 0) + " mL = " + V.tal.V.tekst + " L." };
        }
        var hvem = hvemEr(V, s.tal, b);
        if (hvem) return { besked: NK.html(s.raa.trim()) + " er " + R.vis(hvem) + ". Her skal " + R.vis(b) + " stå." };
        return { besked: "Det tal er ikke " + R.vis(b) + ". Find " + R.vis(b) + " i opgavens tal øverst på tavlen." };
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
                ud.push({ v: v.A / v.eps * v.l, b: "Det ligner A / ε · l uden parentes. Så ganger lommeregneren med l. Sæt parentes om ε · l." });
            }
        } else if (id === "eps") {
            ud.push({ v: v.A * v.l * v.c, b: "Du har ganget. ε står alene, når A divideres med l · c." });
            ud.push({ v: v.l * v.c / v.A, b: "Brøken er vendt. A skal stå over brøkstregen." });
            ud.push({ v: v.A / v.l * v.c, b: "Det ligner A / l · c uden parentes. Så ganger lommeregneren med c. Sæt parentes om l · c." });
            if (v.l !== 1) ud.push({ v: v.A / v.c, b: "Du har kun divideret med c. l skal også med under brøkstregen." });
        } else if (id === "epsA") {
            ud.push({ v: v.a * v.l, b: "Du har ganget. ε = a / l: hældningen divideres med l." });
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
        c: "c får enheden mM: A har ingen enhed, og 1 / (mM⁻¹·cm⁻¹ · cm) = mM.",
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
        if (s.tom) return { tom: true, besked: "Regn resultatet ud, og skriv det i feltet." };
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
            return { besked: "Tallet passer, men enheden ikke. " + ENHED_FORKLARING[b] };
        }
        var fejl = fejlVaerdier(id, v);
        for (var k = 0; k < fejl.length; k++) if (LB.ens(om.v, fejl[k].v, 0.012)) return { besked: fejl[k].b };
        if (LB.ens(om.v, f, 0.05)) return { besked: "Tæt på. Tjek afrundingen: regn med tallene, som de står, og afrund først til sidst." };
        return { besked: "Ikke rigtigt. Tast mellemregningen på lommeregneren igen." };
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
        A: ["Du kender ε, l og c og skal finde absorbansen A.", "Lambert-Beers lov giver A direkte: A = ε · …", "A = ε · l · c. Vælg formen □ · □ · □."],
        c: ["Du kender A, ε og l og skal finde koncentrationen c.", "Isolér c i A = ε · l · c: c = A / …", "c = A / (ε · l). Vælg formen □ / (□ · □)."],
        eps: ["Du kender A, l og c og skal finde ε.", "Isolér ε i A = ε · l · c: ε = A / …", "ε = A / (l · c). Vælg formen □ / (□ · □)."],
        epsA: ["Du kender hældningen a og kuvettebredden l og skal finde ε.", "Standardkurven er A = a · c, og Lambert-Beers lov er A = ε · l · c. Så er a = ε · l.", "ε = a / l. Vælg formen □ / □."],
        n: ["Du kender koncentrationen c og rumfanget V og skal finde stofmængden n.", "n = c · …", "n = c · V. Vælg formen □ · □."],
        m: ["Du kender stofmængden n og molarmassen M og skal finde massen m.", "m = n · …", "m = n · M. Vælg formen □ · □."]
    };
    R.formelHint = function (id) { return FORMEL_HINT[id]; };

    /* Tallene: hvad der gaar hvorhen. bogst: elevens bogstaver, ok: de
       felter, der allerede er rigtige */
    R.talHint = function (o, i, bogst, ok) {
        var V = R.vaerdier(o);
        var j = 0;
        while (j < bogst.length && ok[j]) j++;
        var b = bogst[Math.min(j, bogst.length - 1)];
        return ["Sæt tallene fra opgavens tal ind i stedet for bogstaverne. Du kan klikke på tallene under tavlen.",
            R.vis(b) + " = " + R.talMedEnhed(b, V.tal[b].tekst) + ".",
            R.vis(D.TRIN[o.trin[i]].maal) + " = " + R.talHTML(o, i, bogst)];
    };

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

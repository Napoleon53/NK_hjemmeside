/* =====================================================================
   afst.js - modellen: formler, atomregnskab, dommen og hintene

   Alt her er regnet ud af formlerne og tallene foran dem. Intet kender
   facit, bortset fra svarTekst, som kun bruges ved Vis svaret.

     NK.Afst.laes("Al2(SO4)3")   -> { Al: 2, S: 3, O: 12 }
     NK.Afst.regnskab(r, p, cr, cp) -> [{ e, v, h }] i den orden, atomerne
                                       foerst optraeder i skemaet
     NK.Afst.fejl / hint          -> teksten til en fejl og til Giv hint
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var A = {};

    /* ----- Formler ------------------------------------------------------------- */
    /* Laeser en formel med parenteser. Giver ogsaa raekkefoelgen, atomerne
       optraeder i, saa regnskabet kan staa i skemaets orden. */
    A.laesMedOrden = function (f) {
        var i = 0, s = String(f);
        var orden = [];
        function tal() {
            var m = /^\d+/.exec(s.slice(i));
            if (!m) return 1;
            i += m[0].length;
            return parseInt(m[0], 10);
        }
        function gruppe() {
            var ud = {};
            while (i < s.length && s[i] !== ")") {
                var del;
                if (s[i] === "(") {
                    i++;
                    del = gruppe();
                    i++;                       /* ")" */
                } else {
                    var m = /^[A-Z][a-z]?/.exec(s.slice(i));
                    if (!m) throw new Error("Kan ikke læse formlen " + f);
                    i += m[0].length;
                    del = {};
                    del[m[0]] = 1;
                    if (orden.indexOf(m[0]) < 0) orden.push(m[0]);
                }
                var n = tal();
                for (var e in del) ud[e] = (ud[e] || 0) + del[e] * n;
            }
            return ud;
        }
        return { antal: gruppe(), orden: orden };
    };

    A.laes = function (f) { return A.laesMedOrden(f).antal; };

    /* Formlen som tegn med haevede og saenkede tal: Al₂(SO₄)₃ */
    A.skriv = function (f) { return NK.formel(f); };

    /* En simpel formel uden parenteser delt i symboler og tal:
       "C3H8" -> [{ s: "C", n: 3 }, { s: "H", n: 8 }] (fane 1) */
    A.dele = function (f) {
        var ud = [], re = /([A-Z][a-z]?)(\d*)/g, m;
        while ((m = re.exec(f)) && m[0]) ud.push({ s: m[1], n: m[2] ? parseInt(m[2], 10) : 1 });
        return ud;
    };

    A.saml = function (dele) {
        return dele.map(function (d) { return d.s + (d.n > 1 ? d.n : ""); }).join("");
    };

    /* ----- Regnskabet ------------------------------------------------------------ */
    A.regnskab = function (r, p, cr, cp) {
        var orden = [], v = {}, h = {};
        function tael(formler, koef, ud) {
            formler.forEach(function (f, i) {
                var l = A.laesMedOrden(f);
                l.orden.forEach(function (e) { if (orden.indexOf(e) < 0) orden.push(e); });
                for (var e in l.antal) ud[e] = (ud[e] || 0) + l.antal[e] * koef[i];
            });
        }
        tael(r, cr, v);
        tael(p, cp, h);
        return orden.map(function (e) { return { e: e, v: v[e] || 0, h: h[e] || 0 }; });
    };

    A.gaarOp = function (rows) {
        return rows.every(function (x) { return x.v === x.h; });
    };

    A.faellesDivisor = function (koef) {
        return koef.reduce(function (g, k) { return NK.gcd(g, k); }, 0);
    };

    /* Dommen: ok, eller hvad der er galt */
    A.dom = function (r, p, cr, cp) {
        var rows = A.regnskab(r, p, cr, cp);
        var op = A.gaarOp(rows);
        var g = A.faellesDivisor(cr.concat(cp));
        return { rows: rows, gaarOp: op, divisor: g, ok: op && g === 1 };
    };

    /* ----- Tekster ------------------------------------------------------------------- */
    function F(f) { return A.skriv(f); }

    A.ligning = function (r, p, cr, cp) {
        function side(fs, ks) {
            return fs.map(function (f, i) { return (ks[i] > 1 ? ks[i] + " " : "") + F(f); }).join(" + ");
        }
        return side(r, cr) + " → " + side(p, cp);
    };

    /* Det rene grundstof med ét slags atom (O2, H2, Cl2) paa en side */
    function rent(formler, e) {
        for (var i = 0; i < formler.length; i++) {
            var a = A.laes(formler[i]);
            var k = Object.keys(a);
            if (k.length === 1 && k[0] === e && a[e] > 1) return i;
        }
        return -1;
    }

    /* Mangler der et ulige antal atomer af e paa den side, hvor e kun
       kommer to ad gangen (O2)? Saa skal alle de andre tal ganges med 2. */
    A.ulige = function (r, p, cr, cp, rows) {
        var bad = rows.filter(function (x) { return x.v !== x.h; });
        if (bad.length !== 1) return null;
        var e = bad[0].e;
        var i = rent(r, e), j = rent(p, e);
        if (i >= 0 && j < 0) {
            var n = A.laes(r[i])[e];
            var andre = bad[0].v - n * cr[i];
            var skal = bad[0].h - andre;
            if (skal > 0 && skal % n) return { e: e, skal: skal, f: r[i], side: "før", rent: i };
        }
        if (j >= 0 && i < 0) {
            var n2 = A.laes(p[j])[e];
            var andre2 = bad[0].h - n2 * cp[j];
            var skal2 = bad[0].v - andre2;
            if (skal2 > 0 && skal2 % n2) return { e: e, skal: skal2, f: p[j], side: "efter", rent: r.length + j };
        }
        return null;
    };

    function uligeTekst(u) {
        return "Der skal " + u.skal + " " + u.e + " " + u.side + " pilen, men " + F(u.f) +
            " giver dem to ad gangen. Gang alle de andre tal med 2 først.";
    }

    /* Beskeden, naar eleven tjekker, og det ikke er rigtigt */
    A.fejl = function (r, p, cr, cp) {
        var d = A.dom(r, p, cr, cp);
        if (d.gaarOp) {
            return "Atomerne passer, men alle tallene kan deles med " + d.divisor + ". Brug de mindste hele tal.";
        }
        var u = A.ulige(r, p, cr, cp, d.rows);
        if (u) return "Kun " + u.e + " passer ikke. " + uligeTekst(u);
        var bad = d.rows.filter(function (x) { return x.v !== x.h; });
        var dele = bad.slice(0, 2).map(function (x) { return x.v + " " + x.e + " før pilen og " + x.h + " efter"; });
        return "Det går ikke op. Der er " + dele.join(", og ") + "." +
            (bad.length > 2 ? " Der er flere, der ikke passer." : "");
    };

    /* ----- Hintet: en trappe -----------------------------------------------------
       Tre trin, der hver giver ét skridt mere. Trin 1 siger, hvilket atom man
       skal se paa, og hvorfor. Trin 2 taeller det. Trin 3 siger, hvilket tal
       der skal rettes. Eleven kan stoppe efter hvert trin.

       Giver { e, trin: [...] }. e er det atom, hintet handler om; scenen og
       regnskabet fremhaever det. */
    function ordraekke(liste) {
        return liste.join(", ").replace(/, ([^,]*)$/, " og $1");
    }

    function stofferMed(formler, e) {
        return formler.filter(function (f) { return A.laes(f)[e]; });
    }

    /* Det atom, der er nemmest at gaa videre med: det, der staar i faerrest
       stoffer. O og H venter, for de staar tit i flere. */
    A.naesteAtom = function (rows, r, p) {
        var bedst = null;
        rows.forEach(function (x) {
            if (x.v === x.h) return;
            var point = stofferMed(r, x.e).length + stofferMed(p, x.e).length +
                (x.e === "O" ? 2 : 0) + (x.e === "H" ? 1 : 0);
            if (!bedst || point < bedst.point) bedst = { x: x, point: point };
        });
        return bedst ? bedst.x : null;
    };

    A.hintTrin = function (r, p, cr, cp) {
        var d = A.dom(r, p, cr, cp);
        var alle = r.concat(p), k = cr.concat(cp);

        /* Det gaar op, men tallene kan forkortes */
        if (d.gaarOp && d.divisor > 1) {
            return { e: null, trin: [
                "Atomerne passer nu. Se på tallene foran stofferne.",
                "Alle tallene kan deles med " + d.divisor + ". Et reaktionsskema skrives altid med de mindste hele tal.",
                "Del alle tallene med " + d.divisor + ": " +
                    A.ligning(r, p, cr.map(function (v) { return v / d.divisor; }), cp.map(function (v) { return v / d.divisor; })) + "."
            ] };
        }
        if (d.gaarOp) return { e: null, trin: ["Det går op. Der er lige mange af hvert atom på begge sider."] };

        /* Der mangler et halvt O2: alle de andre tal skal ganges med 2 */
        var u = A.ulige(r, p, cr, cp, d.rows);
        if (u) {
            var dele = [];
            alle.forEach(function (f, i) { if (i !== u.rent) dele.push(2 * k[i] + " foran " + F(f)); });
            return { e: u.e, trin: [
                "Kun " + u.e + " passer ikke. Tæl " + u.e + " på hver side.",
                "Der skal " + u.skal + " " + u.e + " " + u.side + " pilen, men " + F(u.f) + " giver dem to ad gangen. " +
                    "Intet helt tal foran " + F(u.f) + " giver " + u.skal + ".",
                "Gang derfor alle de andre tal med 2: sæt " + ordraekke(dele) + ". Tæl så " + u.e + " igen."
            ] };
        }

        /* Det almindelige: ét atom ad gangen */
        var x = A.naesteAtom(d.rows, r, p);
        var side = x.v < x.h ? "før" : "efter";
        var fs = side === "før" ? r : p;
        var her = [];
        fs.forEach(function (f, i) { if (A.laes(f)[x.e]) her.push(i); });
        var unik = stofferMed(r, x.e).length === 1 && stofferMed(p, x.e).length === 1;

        var trin1 = "Tæl " + x.e + ".";
        if (unik) trin1 += " " + x.e + " står kun i ét stof på hver side, så det er nemmest at begynde der.";
        else if (x.e !== "O" && x.e !== "H") trin1 += " Tag O og H til sidst, for de står i flere stoffer.";

        var trin2 = "Der er " + x.v + " " + x.e + " før pilen og " + x.h + " efter. Der mangler " +
            Math.abs(x.v - x.h) + " " + x.e + " " + side + " pilen.";

        var trin3;
        if (her.length === 1) {
            var f = fs[her[0]], n = A.laes(f)[x.e], maal = side === "før" ? x.h : x.v;
            if (maal % n === 0) {
                trin3 = "Sæt " + (maal / n) + " foran " + F(f) + ", så der bliver " + maal + " " + x.e + " " + side +
                    " pilen. Tæl så det næste atom.";
            } else {
                trin3 = "Der skal " + maal + " " + x.e + " " + side + " pilen, men " + F(f) + " giver " + n +
                    " ad gangen. Ret et af de andre tal først.";
            }
        } else {
            trin3 = "Sæt et større tal foran " + fs.filter(function (f, i) { return her.indexOf(i) >= 0; }).map(F).join(" eller ") +
                ", og tæl " + x.e + " igen.";
        }
        return { e: x.e, trin: [trin1, trin2, trin3] };
    };

    /* Vis svaret: skemaet og et regnskab, der viser, at det passer */
    A.svarTekst = function (o) {
        var cr = o.facit.slice(0, o.r.length), cp = o.facit.slice(o.r.length);
        var rows = A.regnskab(o.r, o.p, cr, cp);
        return A.ligning(o.r, o.p, cr, cp) + ". Så er der " +
            rows.map(function (x) { return x.v + " " + x.e; }).join(", ").replace(/, ([^,]*)$/, " og $1") +
            " på hver side.";
    };

    /* ----- Tallene, eleven skriver paa fane 2 -------------------------------------
       Tomt felt: 1, som i bogen. Giver et tal, 0, "broek" eller NaN. */
    A.laesTal = function (s) {
        var t = String(s || "").replace(/\s+/g, "");
        if (!t) return 1;
        if (/^\d+$/.test(t)) return parseInt(t, 10);
        if (/^\d+([.,]\d+|\/\d+)$/.test(t)) return "broek";
        return NaN;
    };

    NK.Afst = A;
}());

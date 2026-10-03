/* =====================================================================
   tavle.js - saetter en loesning op paa tavlen

   Tavlen har fire raekker med 12, 14, 14 og 12 felter, som i skabelonen.
   Alt regnes i et gitter paa 14 kolonner; raekke 1 og 4 bruger kolonne
   2 til 13. Hver linje centreres for sig.

   Ordene fyldes paa linjerne ét ad gangen. Et ord, der er laengere end
   linjen, deles ved en bindestreg. / i teksten tvinger et linjeskift.
   En linje staar i raekke 2, to linjer i raekke 2 og 3, tre linjer i
   raekke 1 til 3 (eller 2 til 4, hvis den foerste linje er for lang),
   og fire linjer bruger hele tavlen.

   Kun bogstaverne A til Å kan gaettes. Tal og tegn (- , . ' ? !) staar
   fremme fra starten.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tavle = {};

    T.KOLONNER = 14;
    T.RAEKKER = [12, 14, 14, 12];
    T.START = [1, 0, 0, 1];
    T.BOGSTAVER = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ";

    /* De raekker, en loesning med n linjer bruger */
    var OPSTILLINGER = [
        [1],
        [1, 2],
        [0, 1, 2],
        [1, 2, 3],
        [0, 1, 2, 3]
    ];

    var SAENKET = "₀₁₂₃₄₅₆₇₈₉", HAEVET = "⁰¹²³⁴⁵⁶⁷⁸⁹";

    /* Store bogstaver, danske tegn bevaret, accenter fjernet
       (é bliver E), sænkede og hævede tal bliver almindelige. */
    T.normaliser = function (s) {
        s = String(s || "").replace(/[₀-₉]/g, function (c) { return String(SAENKET.indexOf(c)); })
            .replace(/[⁰¹²³⁴-⁹]/g, function (c) { return String(HAEVET.indexOf(c)); })
            .replace(/[⁺⁻]/g, "");
        s = s.toLocaleUpperCase("da-DK");
        var ud = "";
        for (var i = 0; i < s.length; i++) {
            var c = s[i];
            if ("ÆØÅ".indexOf(c) >= 0) { ud += c; continue; }
            if (c === "Ä") { ud += "Æ"; continue; }
            if (c === "Ö") { ud += "Ø"; continue; }
            ud += c.normalize ? c.normalize("NFD").replace(/[̀-ͯ]/g, "") : c;
        }
        return ud.replace(/[‐-―−]/g, "-").replace(/[‘’´`]/g, "'").replace(/\s+/g, " ")
            .replace(/\s*\/\s*/g, "/").trim();
    };

    T.erBogstav = function (c) { return c.length === 1 && T.BOGSTAVER.indexOf(c) >= 0; };

    /* Fylder ordene paa linjer med de givne bredder. Giver linjerne, eller
       null, hvis de ikke kan vaere der. */
    function fyld(segmenter, bredder) {
        var linjer = [];
        for (var s = 0; s < segmenter.length; s++) {
            var ord = segmenter[s].split(" ").filter(function (o) { return o; });
            var aktuel = null;
            for (var o = 0; o < ord.length; o++) {
                var rest = ord[o];
                while (rest) {
                    if (linjer.length >= bredder.length) return null;
                    var b = bredder[linjer.length];
                    if (aktuel === null) {
                        if (rest.length <= b) {
                            aktuel = rest;
                            rest = "";
                        } else {
                            var snit = rest.lastIndexOf("-", b - 1);
                            if (snit <= 0) return null;
                            linjer.push(rest.slice(0, snit + 1));
                            rest = rest.slice(snit + 1);
                        }
                    } else if (aktuel.length + 1 + rest.length <= b) {
                        aktuel += " " + rest;
                        rest = "";
                    } else {
                        linjer.push(aktuel);
                        aktuel = null;
                    }
                }
            }
            if (aktuel !== null) {
                if (linjer.length >= bredder.length) return null;
                linjer.push(aktuel);
            }
        }
        return linjer;
    }

    /* Et forslag til, hvor et for langt ord kan deles */
    function delForslag(ord) {
        var m = Math.ceil(ord.length / 2);
        return ord.slice(0, m) + "-" + ord.slice(m);
    }

    /* Giver { linjer, celler, bogstaver, antal, fejl }.
       celler: [{ r, k, tegn, bogstav }] med k i 14-gitteret.
       antal: hvor mange felter hvert bogstav fylder. */
    T.opstil = function (tekst) {
        var ren = T.normaliser(tekst);
        var ud = { tekst: ren, linjer: [], celler: [], antal: {}, fejl: null };
        if (!ren.replace(/[\s\/]/g, "")) { ud.fejl = "Løsningen er tom."; return ud; }

        var segmenter = ren.split("/").filter(function (s) { return s.trim(); });
        var laengste = "";
        segmenter.join(" ").split(/[ ]+/).forEach(function (o) {
            o.split("-").forEach(function (del, i, alle) {
                var d = del + (i < alle.length - 1 ? "-" : "");
                if (d.length > laengste.length) laengste = d;
            });
        });
        if (laengste.length > T.KOLONNER) {
            var helt = segmenter.join(" ").split(" ").filter(function (o) { return o.indexOf(laengste.replace(/-$/, "")) >= 0; })[0] || laengste;
            ud.fejl = "Ordet " + helt + " har " + helt.length + " tegn, men en række har plads til " + T.KOLONNER
                + ". Del det med en bindestreg, hvor det giver mening, fx " + delForslag(helt) + ".";
            return ud;
        }

        var linjer = null, raekker = null;
        for (var i = 0; i < OPSTILLINGER.length && !linjer; i++) {
            var r = OPSTILLINGER[i];
            var l = fyld(segmenter, r.map(function (x) { return T.RAEKKER[x]; }));
            if (l && l.length === r.length) { linjer = l; raekker = r; }
        }
        if (!linjer) {
            ud.fejl = "Løsningen kan ikke være på tavlens fire rækker (12, 14, 14 og 12 felter). Gør den kortere.";
            return ud;
        }

        ud.linjer = linjer;
        linjer.forEach(function (linje, n) {
            var raekke = raekker[n];
            var venstre = Math.floor((T.KOLONNER - linje.length) / 2);
            for (var j = 0; j < linje.length; j++) {
                var c = linje[j];
                if (c === " ") continue;
                var b = T.erBogstav(c);
                ud.celler.push({ r: raekke, k: venstre + j, tegn: c, bogstav: b });
                if (b) ud.antal[c] = (ud.antal[c] || 0) + 1;
            }
        });
        if (!Object.keys(ud.antal).length) ud.fejl = "Løsningen har ingen bogstaver at gætte.";
        return ud;
    };

    /* Findes et felt i raekke r, kolonne k (14-gitteret)? */
    T.findes = function (r, k) {
        return k >= T.START[r] && k < T.START[r] + T.RAEKKER[r];
    };
}());

/* =====================================================================
   model.js - kemien og tallene, adskilt fra tegningen

   NK.Model   Lambert-Beers lov for en kuvette: A er summen af hvert
              stofs a · c ved boelgelaengden (a = ε · l, l = 1,00 cm).
              Farven paa vaesken regnes af de samme stoffer, saa en
              blanding af gult og blaat bliver groen af sig selv.
   NK.Tal     elevens tal: dansk komma, potenser og enheder bagefter,
              og tal skrevet med et fast antal decimaler eller cifre.
   NK.Formel  elevens bogstaver i formlen (c_foer, V_efter, A, a ...)
              og dommen over en formel skrevet i en skabelon.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* ===================================================================
       MODELLEN
       =================================================================== */
    var M = {};

    /* Det, der faktisk opsuger lys i kuvetten: nitrit er farveloes og
       bliver kun til azofarvestof i takt med reaktionen (frem 0-1). */
    M.farvestoffer = function (indhold, frem) {
        var ud = {};
        Object.keys(indhold || {}).forEach(function (s) {
            var c = indhold[s];
            if (!c) return;
            if (s === "nitrit") {
                var f = frem === undefined ? 1 : frem;
                if (f > 0) ud.azo = (ud.azo || 0) + c * f;
            } else {
                ud[s] = (ud[s] || 0) + c;
            }
        });
        return ud;
    };

    /* A for et indhold ved lambda, uden baggrund og uden afrunding */
    M.absorbans = function (indhold, lambda, frem) {
        var st = M.farvestoffer(indhold, frem);
        var A = 0;
        Object.keys(st).forEach(function (s) {
            var a = D.STOFFER[s].a[lambda] || 0;
            A += a * st[s];
        });
        return A;
    };

    /* Hvert stofs del af A ved lambda (til zoomboblen og til det
       stablede bidrag paa grafen) */
    M.bidrag = function (indhold, lambda, frem) {
        var st = M.farvestoffer(indhold, frem);
        var ud = {};
        Object.keys(st).forEach(function (s) { ud[s] = (D.STOFFER[s].a[lambda] || 0) * st[s]; });
        return ud;
    };

    /* Det, displayet viser: tre decimaler. */
    M.rund = function (A) {
        return Math.round(A * 1000 + (A >= 0 ? 1e-9 : -1e-9)) / 1000;
    };

    M.transmittans = function (A) {
        return Math.pow(10, -A);
    };

    /* Farven paa vaesken: hvidt lys, hvor hvert stof tager sin del af
       roedt, groent og blaat. Giver [r, g, b, alfa]. */
    M.farve = function (indhold, frem, faktor) {
        var st = M.farvestoffer(indhold, frem);
        var abs = [0, 0, 0];
        Object.keys(st).forEach(function (s) {
            var k = D.STOFFER[s].kanal;
            for (var i = 0; i < 3; i++) abs[i] += k[i] * st[s] * (faktor || 1);
        });
        var T = abs.map(function (x) { return Math.pow(10, -x); });
        var mindst = Math.min(T[0], T[1], T[2]);
        return [Math.round(255 * T[0]), Math.round(255 * T[1]), Math.round(255 * T[2]), 0.16 + 0.76 * (1 - mindst)];
    };

    M.rgba = function (f, gange) {
        return "rgba(" + f[0] + "," + f[1] + "," + f[2] + "," + (f[3] * (gange === undefined ? 1 : gange)).toFixed(3) + ")";
    };

    /* Bedste rette linje gennem (0, 0): a = Σ c·A / Σ c² */
    M.haeldning = function (punkter) {
        var t = 0, n = 0;
        punkter.forEach(function (p) { t += p.c * p.A; n += p.c * p.c; });
        return n > 0 ? t / n : 0;
    };

    NK.Model = M;

    /* ===================================================================
       TAL
       =================================================================== */
    var T = {};

    /* "0,520", "0.52", "5,00·10^-5", "5,00 · 10⁻⁵", "2,6e4" og "18 µM"
       bliver til tal. Det, der staar efter tallet (en enhed), springes
       over. Ikke et tal: NaN. */
    T.laes = function (s) {
        var t = NK.ascii(s).replace(/\s+/g, "").replace(/,/g, ".");
        if (!t) return NaN;
        t = t.replace(/[·*x×]10\^?([+-]?\d+)/i, "e$1");
        var m = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(t);
        if (!m) return NaN;
        return parseFloat(m[0]);
    };

    /* Med et fast antal decimaler og dansk komma: 0,520 */
    T.dk = function (v, dec) {
        if (!isFinite(v)) return "–";
        var s = Math.abs(v).toFixed(dec).replace(".", ",");
        return (v < 0 && parseFloat(s.replace(",", ".")) !== 0 ? "−" : "") + s;
    };

    /* Med n betydende cifre: 0,0260 og 18,0 */
    T.bet = function (v, n) {
        if (!isFinite(v)) return "–";
        if (v === 0) return "0";
        return (v < 0 ? "−" : "") + NK.betydende(Math.abs(v), n || 3);
    };

    /* Absorbans: altid tre decimaler, som displayet */
    T.A = function (v) { return T.dk(v, 3); };

    /* Er v naer m? rel er den relative tolerance. */
    T.naer = function (v, m, rel) {
        if (!isFinite(v) || !isFinite(m)) return false;
        if (m === 0) return Math.abs(v) < 1e-9;
        return Math.abs(v - m) <= Math.abs(m) * (rel || 0.01);
    };

    NK.Tal = T;

    /* ===================================================================
       FORMLEN
       =================================================================== */
    var F = {};

    var ALIAS = {
        c: "c",
        cfoer: "c_foer", cfor: "c_foer", c1: "c_foer", cstam: "c_foer", cstamoploesning: "c_foer", cnano2: "c_foer",
        cefter: "c_efter", c2: "c_efter", ckolbe: "c_efter", ckuvette: "c_efter", cmaalekolbe: "c_efter",
        v: "V",
        vfoer: "V_foer", vfor: "V_foer", v1: "V_foer", vstam: "V_foer", vnano2: "V_foer", vpipette: "V_foer", vsodavand: "V_foer",
        vefter: "V_efter", v2: "V_efter", vtotal: "V_efter", vtot: "V_efter", vkolbe: "V_efter", vmaalekolbe: "V_efter", vialt: "V_efter",
        el: "a", le: "a", "εl": "a", "lε": "a",
        t: "T", i: "I", i0: "I0"
    };

    /* Elevens bogstav som id: "A", "a", "c", "c_foer" ... eller "?x" */
    F.norm = function (s) {
        var raa = String(s || "").trim();
        if (!raa) return "";
        if (raa === "A" || raa === "a") return raa;
        var t = NK.ascii(raa).toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[_()\[\]{}·*×.]/g, "")
            .replace(/ø/g, "oe").replace(/å/g, "aa").replace(/æ/g, "ae")
            .replace(/₀/g, "0");
        if (t === "e") return "?e";
        if (ALIAS.hasOwnProperty(t)) return ALIAS[t];
        return "?" + raa;
    };

    /* Et bogstav som HTML: c_foer -> c<sub>før</sub> */
    F.vis = function (id) {
        var m = /^([A-Za-z]+)_(\w+)$/.exec(id);
        if (!m) return NK.html(id);
        var sub = m[2] === "foer" ? "før" : m[2];
        return '<span class="sym">' + m[1] + "<sub>" + sub + "</sub></span>";
    };

    /* Skabelonerne og antallet af felter i hver */
    F.SKABELONER = {
        broek:      { felter: 2, tegn: "□ / □", navn: "brøk" },
        gange:      { felter: 2, tegn: "□ · □", navn: "gange" },
        gangebroek: { felter: 3, tegn: "□ · □ / □", navn: "gange over brøkstreg" },
        minus:      { felter: 2, tegn: "□ − □", navn: "minus" }
    };

    /* Dommen over en formel. sk: den valgte skabelon. felter: elevens
       bogstaver (normaliserede). spec: { sk, felter }. I gangebroek maa
       de to i taelleren byttes, og i gange maa de to byttes.
       Giver { ok } eller { ok: false, slags, felt } */
    F.dom = function (sk, felter, spec) {
        var n = F.SKABELONER[sk].felter;
        for (var i = 0; i < n; i++) {
            if (!felter[i]) return { ok: false, slags: "tom", felt: i };
        }
        for (i = 0; i < n; i++) {
            if (felter[i].charAt(0) === "?") return { ok: false, slags: "ukendt", felt: i, raa: felter[i].slice(1) };
        }
        var e = spec.felter;
        if (sk === spec.sk) {
            if (sk === "broek" || sk === "minus") {
                if (felter[0] === e[0] && felter[1] === e[1]) return { ok: true };
                if (felter[0] === e[1] && felter[1] === e[0]) return { ok: false, slags: "vendt" };
            } else if (sk === "gange") {
                if ((felter[0] === e[0] && felter[1] === e[1]) || (felter[0] === e[1] && felter[1] === e[0])) return { ok: true };
            } else if (sk === "gangebroek") {
                var t = [felter[0], felter[1]].sort().join("|");
                var te = [e[0], e[1]].sort().join("|");
                if (t === te && felter[2] === e[2]) return { ok: true };
                /* Rumfangene byttet om: V_foer og V_efter har byttet plads */
                var ombyt = function (x) { return x === "V_foer" ? "V_efter" : (x === "V_efter" ? "V_foer" : x); };
                var t2 = [ombyt(felter[0]), ombyt(felter[1])].sort().join("|");
                if (t2 === te && ombyt(felter[2]) === e[2]) return { ok: false, slags: "rumfang" };
                /* c foer og efter byttet om */
                var ombytC = function (x) { return x === "c_foer" ? "c_efter" : (x === "c_efter" ? "c_foer" : x); };
                var t3 = [ombytC(felter[0]), ombytC(felter[1])].sort().join("|");
                if (t3 === te && felter[2] === e[2]) return { ok: false, slags: "cbyttet" };
            }
        }
        /* Stort og lille a byttet om */
        var har = {}, skal = {};
        felter.slice(0, n).forEach(function (x) { har[x] = (har[x] || 0) + 1; });
        e.forEach(function (x) { skal[x] = (skal[x] || 0) + 1; });
        if ((har.a || 0) > (skal.a || 0) && (har.A || 0) < (skal.A || 0)) return { ok: false, slags: "smaaA", felt: felter.indexOf("a") };
        if ((har.A || 0) > (skal.A || 0) && (har.a || 0) < (skal.a || 0)) return { ok: false, slags: "stortA", felt: felter.indexOf("A") };
        /* Et bogstav, der slet ikke hoerer til i formlen */
        var mulige = {};
        e.forEach(function (x) { mulige[x] = 1; });
        for (i = 0; i < n; i++) {
            if (felter[i] === "c" && (mulige.c_foer || mulige.c_efter)) return { ok: false, slags: "hvilkenC", felt: i };
            if (felter[i] === "V" && (mulige.V_foer || mulige.V_efter)) return { ok: false, slags: "hvilkenV", felt: i };
            if (felter[i] === "a" && mulige.A && !mulige.a) return { ok: false, slags: "smaaA", felt: i };
            if (!mulige[felter[i]]) return { ok: false, slags: "fremmed", felt: i };
        }
        if (sk !== spec.sk) return { ok: false, slags: "form" };
        return { ok: false, slags: "andet" };
    };

    NK.Formel = F;
}());

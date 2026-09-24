/* =====================================================================
   tjek.js - tjekker elevens svar og finder den fejl, der er lavet

   Hver funktion giver { ok, tom, besked, note } tilbage:
     ok     svaret godkendes
     tom    der er ikke skrevet noget
     besked forklaringen paa et forkert svar, der passer til fejlen
     note   en bemaerkning ved et godkendt svar (fx en stavemaade)

   Navne: store og smaa bogstaver er ligegyldige, og en slaafejl i et
   langt navn godkendes med en bemaerkning. Symboler: store og smaa
   bogstaver taeller (NA er ikke Na). Elektronstruktur: tallene kan
   skilles ad med komma, mellemrum eller punktum.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tj = {};

    function tom(besked) { return { tom: true, besked: besked }; }
    function ok(note) { return { ok: true, note: note || "" }; }
    function nej(besked) { return { ok: false, besked: besked }; }

    function talform(n, ental, flertal) { return n + " " + (n === 1 ? ental : flertal); }

    /* Afstand mellem to ord, hvor to bogstaver, der har byttet plads,
       koster ét (Damerau-Levenshtein, den begraensede udgave) */
    function afstand(a, b) {
        var m = a.length, n = b.length, d = [], i, j;
        for (i = 0; i <= m; i++) { d[i] = [i]; }
        for (j = 0; j <= n; j++) { d[0][j] = j; }
        for (i = 1; i <= m; i++) {
            for (j = 1; j <= n; j++) {
                var c = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
                if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
                }
            }
        }
        return d[m][n];
    }
    Tj.afstand = afstand;

    /* Et navn skrevet sammen med smaa bogstaver. "ae", "oe" og "aa"
       goeres ikke om, for de er ogsaa almindelige bogstavpar. */
    function rens(s) {
        return String(s || "").toLowerCase().replace(/[\s.\-]+/g, "").trim();
    }
    Tj.rens = rens;

    /* Hvor stor en slaafejl, der godkendes: ingen i korte navne */
    function tilladt(navn) { return navn.length >= 8 ? 2 : (navn.length >= 5 ? 1 : 0); }

    /* Engelske navne, der ikke er de danske */
    var ENGELSK = {
        sodium: "Na", potassium: "K", iron: "Fe", copper: "Cu", sulfur: "S", sulphur: "S",
        silicon: "Si", chlorine: "Cl", fluorine: "F", bromine: "Br", boron: "B",
        phosphorus: "P", arsenic: "As", selenium: "Se", manganese: "Mn", chromium: "Cr",
        zinc: "Zn", nickel: "Ni", aluminum: "Al", tin: null, silver: null, gold: null, lead: null
    };

    /* Engelske stavemaader, der ligger saa taet paa det danske, at de
       godkendes med en bemaerkning */
    var NAER = { zinc: "Zn", nickel: "Ni", aluminum: "Al", titanium: "Ti", chromium: "Cr" };

    var IONNAVNE = {
        hydrid: "H", oxid: "O", nitrid: "N", fluorid: "F", chlorid: "Cl", bromid: "Br",
        sulfid: "S", phosphid: "P", iodid: "I", carbid: "C"
    };

    /* Alle navne i montren og de kendte uden for den: navn -> symbol */
    var ALLE_NAVNE = {};
    D.GRUNDSTOFFER.forEach(function (g) {
        ALLE_NAVNE[g.navn] = g.s;
        g.alt.forEach(function (a) { ALLE_NAVNE[a] = g.s; });
    });
    D.UDENFOR.forEach(function (u) { ALLE_NAVNE[u.navn] = u.s; });

    function navnPaa(s) {
        var g = D.grundstof(s);
        if (g) return g.navn;
        for (var i = 0; i < D.UDENFOR.length; i++) if (D.UDENFOR[i].s === s) return D.UDENFOR[i].navn;
        return "";
    }

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* Et symbol, der findes, uanset store og smaa bogstaver */
    function findSymbol(raa) {
        var r = raa.toLowerCase();
        var alle = D.GRUNDSTOFFER.map(function (g) { return g.s; }).concat(D.UDENFOR.map(function (u) { return u.s; }));
        for (var i = 0; i < alle.length; i++) if (alle[i].toLowerCase() === r) return alle[i];
        return null;
    }

    /* ----- Navnet ud fra symbolet ------------------------------------------ */
    Tj.navn = function (raa, g) {
        var r = rens(raa);
        if (!r) return tom("Skriv navnet på " + g.s + " i feltet.");
        if (r === g.navn || g.alt.indexOf(r) >= 0) {
            if (g.alt.indexOf(r) >= 0 && r === "titanium") return ok("På dansk hedder det titan.");
            return ok(g.alt.indexOf(r) >= 0 ? "Rigtigt. Navnet i kemi er " + g.navn + "." : "");
        }
        if (/^[0-9]+$/.test(r)) return nej("Skriv navnet med bogstaver.");

        /* Symbolet i stedet for navnet */
        if (r.length <= 2) {
            var sym = findSymbol(r);
            if (sym === g.s) return nej("Det er symbolet. Skriv navnet.");
            if (sym) return nej("Skriv navnet på " + g.s + ", ikke et symbol.");
        }

        if (r === "flour" && g.s === "F") return ok("Flour er mel på engelsk. Grundstoffet staves fluor.");
        if (NAER[r] === g.s) return ok("På dansk staves det " + g.navn + ".");

        /* Et andet grundstofs navn */
        if (ALLE_NAVNE[r] && ALLE_NAVNE[r] !== g.s) {
            var andet = ALLE_NAVNE[r];
            return nej(stort(r) + " har symbolet " + andet + (D.grundstof(andet) ? "." : " og står længere nede i det periodiske system."));
        }
        if (ENGELSK.hasOwnProperty(r)) {
            return nej(stort(r) + " er engelsk. Det danske navn står på navnetavlen i udstillingen.");
        }
        if (IONNAVNE[r]) {
            return nej(stort(r) + " er navnet på en ion. Skriv grundstoffets navn.");
        }
        if (/ion$/.test(r) && r.length > 4) return nej("Skriv grundstoffets navn, ikke ionens.");

        /* En slaafejl i det rigtige navn */
        var navne = [g.navn].concat(g.alt);
        for (var i = 0; i < navne.length; i++) {
            var n = navne[i];
            var tae = afstand(r, n);
            if (tae > 0 && tae <= tilladt(n)) {
                /* ... men ikke, hvis det ligger lige saa taet paa et andet navn */
                var bedreAndet = Object.keys(ALLE_NAVNE).some(function (x) {
                    return ALLE_NAVNE[x] !== g.s && afstand(r, x) <= tae;
                });
                if (!bedreAndet) return ok("Staves " + n + ".");
            }
        }
        /* Taet paa et andet grundstofs navn */
        var naermest = null;
        Object.keys(ALLE_NAVNE).forEach(function (x) {
            if (ALLE_NAVNE[x] === g.s) return;
            var t = afstand(r, x);
            if (t <= tilladt(x) && (!naermest || t < naermest.t)) naermest = { navn: x, t: t };
        });
        if (naermest) {
            var s2 = ALLE_NAVNE[naermest.navn];
            return nej("Det ligner " + naermest.navn + ", og det har symbolet " + s2 + ".");
        }
        return nej("Det er ikke navnet på " + g.s + ". Navnet står på navnetavlen i udstillingen.");
    };

    /* ----- Symbolet ud fra navnet -------------------------------------------- */
    Tj.symbol = function (raa, g) {
        var r = String(raa || "").replace(/\s+/g, "");
        if (!r) return tom("Skriv symbolet for " + g.navn + " i feltet.");
        if (r === g.s) return ok();
        var latin = D.LATIN[g.s] ? " Symbolet kommer af det latinske navn " + D.LATIN[g.s] + "." : "";

        if (r.toLowerCase() === g.s.toLowerCase()) {
            return nej(g.s.length === 1
                ? "Symbolet skrives med stort bogstav."
                : "Et symbol skrives med stort første bogstav og lille andet.");
        }
        if (r === "0" && g.s === "O") return nej("Det er et nul. Symbolet er et bogstav.");
        if (/^[0-9]+$/.test(r)) return nej("Skriv symbolet med bogstaver.");
        var rl = rens(r);
        if (rl === g.navn || g.alt.indexOf(rl) >= 0) return nej("Det er navnet. Skriv symbolet.");
        if (r.length > 2) {
            if (ALLE_NAVNE[rl]) return nej("Skriv symbolet, ikke et navn." + latin);
            return nej("Et symbol har ét eller to bogstaver." + latin);
        }

        /* Et andet symbol, der findes */
        var sym = findSymbol(r);
        if (sym && sym !== g.s) {
            var navn = navnPaa(sym);
            var skrevet = sym === r ? sym : r;
            var tekst = (sym === r ? sym + " er " + navn + "." : skrevet + " er ikke et symbol, men " + sym + " er " + navn + ".");
            if (!D.grundstof(sym)) tekst = sym + " er " + navn + " og står længere nede i det periodiske system.";
            return nej(tekst + latin);
        }

        if (latin) return nej(r + " er ikke et symbol." + latin);
        if (r.charAt(0).toUpperCase() === g.s.charAt(0) && g.s.length === 2) {
            return nej(r + " er ikke et symbol. Første bogstav er rigtigt.");
        }
        return nej(r + " er ikke et grundstofsymbol.");
    };

    /* ----- Elektronstrukturen ---------------------------------------------- */

    /* Tallene i det, eleven har skrevet. En tom plads mellem to kommaer
       taeller ikke. Er der bogstaver i, giver den null. */
    Tj.laesStruktur = function (raa) {
        var s = NK.ascii(raa || "").trim();
        if (!s) return [];
        if (/[^0-9,;.\s\/\-]/.test(s)) return null;
        return (s.match(/[0-9]+/g) || []).map(function (t) { return parseInt(t, 10); });
    };

    Tj.struktur = function (raa, g) {
        var liste = Tj.laesStruktur(raa);
        if (liste === null) return nej("Skriv kun tal med komma imellem.");
        if (!liste.length) return tom("Skriv antallet af elektroner i hver skal, med komma imellem.");
        var rigtig = g.skaller;
        if (liste.join(",") === rigtig.join(",")) return ok();

        var sum = liste.reduce(function (a, b) { return a + b; }, 0);
        var yderst = rigtig[rigtig.length - 1];
        if (liste.indexOf(0) >= 0) return nej("En skal uden elektroner skrives ikke med.");

        if (liste.length === 1 && liste[0] === g.z && g.z > 2) {
            return nej(g.z + " er alle elektronerne. Fordel dem i skaller, fra den inderste.");
        }
        if (sum !== g.z) {
            if (liste.length === 1 && liste[0] === yderst) {
                return nej("Det er kun den yderste skal. Skriv alle skallerne, fra den inderste.");
            }
            if (sum < g.z) return nej("Du har fordelt " + talform(sum, "elektron", "elektroner") + ". " + g.Navn + " har " + g.z + ".");
            return nej("Du har fordelt " + sum + " elektroner. " + g.Navn + " har kun " + g.z + ".");
        }

        if (liste.slice().reverse().join(",") === rigtig.join(",")) {
            return nej("Skallerne skrives indefra. 1. skal står først.");
        }
        if (liste[0] > 2) return nej("1. skal kan højst rumme 2 elektroner.");
        if (liste.length > 1 && liste[1] > 8) return nej("2. skal kan højst rumme 8 elektroner.");
        if (liste.length > 3 && liste[2] > 18) return nej("3. skal kan højst rumme 18 elektroner.");
        if (liste.length > 1 && liste[liste.length - 1] > 8) {
            return nej("Den yderste skal kan højst have 8 elektroner. Resten går i en ny skal.");
        }
        if (liste.length !== g.periode) {
            return nej(g.Navn + " står i " + g.periode + ". periode, så der er " + talform(g.periode, "skal", "skaller") + ".");
        }
        for (var i = 0; i < liste.length - 1; i++) {
            var loft = D.skalLoft(i, g.z);
            if (liste[i] < loft) {
                return nej((i + 1) + ". skal skal være fuld (" + loft + "), før " + (i + 2) + ". skal får flere.");
            }
        }
        return nej("Ikke helt. Se på pladsen: " + D.pladsTekst(g) + ".");
    };

    /* ----- Atomer i en formel --------------------------------------------- */
    function heltal(raa) {
        var s = NK.ascii(raa || "").replace(/\s+/g, "");
        if (!s) return { tom: true };
        if (!/^[0-9]+$/.test(s)) return { fejl: true };
        return { v: parseInt(s, 10) };
    }

    /* Alle atomled i formlen med det tal, der staar efter dem */
    function atomled(struktur) {
        var ud = [];
        (function gaa(liste) {
            liste.forEach(function (l) {
                if (l.gruppe) { gaa(l.gruppe); return; }
                ud.push(l);
            });
        }(struktur));
        return ud;
    }

    Tj.antal = function (raa, fo, felt) {
        var t = heltal(raa);
        if (t.tom) return tom(felt === "ialt" ? "Skriv det samlede antal atomer." : "Skriv antallet af " + felt + "-atomer.");
        if (t.fejl) return nej("Skriv et helt tal.");
        var v = t.v;
        if (felt === "ialt") return antalIalt(v, fo);

        var rigtig = fo.antal[felt];
        if (v === rigtig) return ok();
        if (v === 0) return nej(felt + " står i formlen, så der er mindst ét.");

        var fk = D.forekomster(fo, felt);
        var udenGange = 0, iGruppe = false;
        fk.forEach(function (o) { udenGange += o.led.n; if (o.gange > 1) iGruppe = true; });
        if (iGruppe && v === udenGange) {
            return nej("Tallet efter parentesen gælder alt indeni. Du har kun talt én parentes.");
        }
        if (fk.length > 1) {
            for (var k = 0; k < fk.length; k++) {
                if (v === fk[k].led.n * fk[k].gange) {
                    return nej(felt + " står " + fk.length + " steder i formlen. Du har kun talt det ene.");
                }
            }
        }

        /* Tallet efter en parentes, der ikke omslutter atomet */
        var ude = fk.every(function (o) { return o.gange === 1; });
        var grupper = fo.struktur.filter(function (l) { return l.gruppe && l.n > 1; });
        if (ude && grupper.some(function (gr) { return gr.n === v || gr.n * rigtig === v; })) {
            return nej("Tallet efter parentesen gælder kun det, der står i parentesen. " + felt + " står uden for.");
        }

        /* Et tal, der hoerer til et andet symbol */
        var led = atomled(fo.struktur);
        for (var i = 0; i < led.length; i++) {
            if (led[i].s !== felt && led[i].harTal && led[i].n === v) {
                var egen = fk[0].led;
                return nej("Tallet " + v + " står efter " + led[i].s + " og gælder kun " + led[i].s + "." +
                    (egen.harTal ? "" : " Står der intet tal efter " + felt + ", er der ét."));
            }
        }

        /* Tallene ganget sammen */
        var produkt = fk.some(function (o) {
            return led.some(function (l) { return l !== o.led && l.harTal && l.n * o.led.n * o.gange === v; });
        });
        if (produkt) return nej("Tallene ganges ikke sammen. Kun tallet efter en parentes ganger.");

        return nej("Ikke rigtigt. Find alle steder, hvor " + felt + " står, og se på tallet lige efter.");
    };

    function antalIalt(v, fo) {
        if (v === fo.ialt) return ok();
        if (fo.q && (v === fo.ialt + Math.abs(fo.q) || v === fo.ialt + 1)) {
            return nej("Ladningen " + NK.ladningHaevet(fo.q) + " er ikke et atom. Tæl kun atomerne.");
        }
        if (v === fo.orden.length) {
            return nej("Det er antallet af grundstoffer. Tæl alle atomerne.");
        }
        var skrevet = 0;
        atomled(fo.struktur).forEach(function (l) { skrevet += l.n; });
        if (v === skrevet && skrevet !== fo.ialt) {
            return nej("Husk at gange med tallet efter parentesen.");
        }
        return nej("Læg tallene sammen: " + fo.orden.map(function (s) { return fo.antal[s]; }).join(" + ") + ".");
    }

    NK.Tjek = Tj;
}());

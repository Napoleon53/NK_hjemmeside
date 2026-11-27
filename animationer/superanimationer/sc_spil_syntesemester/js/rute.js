/* =====================================================================
   rute.js - den korteste syntese (lag 3)

   En tilstand er hylden: de stoffer, eleven har (udgangsstofferne og
   alt, der er lavet). Et trin er et kort paa ét stof paa hylden, eller
   en kondensation af to stoffer paa hylden. Produkterne kommer paa
   hylden. Bredde-foerst-soegning giver det mindste antal trin, til
   maalet staar paa hylden.

   Reaktionerne gemmes (NK.Reaktion.anvend har sin egen hukommelse), saa
   soegningen er hurtig, selv om mange tilstande proeves.

   NK.Rute.korteste(hylde, maal)  { par, rute: [trin] } eller null
   NK.Rute.trin(hylde)            alle trin fra hylden
   Et trin er { kort, fra, partner, valg, nye: [navne], produkt }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var R = NK.Reaktion;
    var K = NK.Kemi;

    var ENKELT = ["br2", "h2", "hbr", "vand", "h2so4", "base", "mild", "kraftig"];
    var MAKS_C = 9;
    var MAKS_DYBDE = 6;

    function trin(hylde) {
        var har = {};
        hylde.forEach(function (n) { har[n] = true; });
        var ud = [];
        hylde.forEach(function (n) {
            var s = K.stof(n);
            if (!s) return;
            ENKELT.forEach(function (k) {
                var r = R.anvend(s, k);
                if (r.ingen) return;
                r.valg.forEach(function (v, i) {
                    var nye = v.produkter.filter(function (p) {
                        return p.klasse !== "andet" && p.antalC <= MAKS_C && !har[p.navn];
                    }).map(function (p) { return p.navn; });
                    if (!nye.length) return;
                    ud.push({ kort: k, fra: n, partner: null, valg: i, nye: nye, produkt: v.produkter[0].navn });
                });
            });
        });
        /* Kondensation: en syre og en alkohol eller amin paa hylden */
        hylde.forEach(function (a) {
            var sa = K.stof(a);
            if (!sa || sa.klasse !== "syre") return;
            hylde.forEach(function (b) {
                var sb = K.stof(b);
                if (!sb || (sb.klasse !== "alkohol" && sb.klasse !== "amin")) return;
                var r = R.anvend(sa, "kond", sb);
                if (r.ingen) return;
                var p = r.valg[0].produkter[0];
                if (har[p.navn] || p.antalC > MAKS_C) return;
                ud.push({ kort: "kond", fra: a, partner: b, valg: 0, nye: [p.navn], produkt: p.navn });
            });
        });
        return ud;
    }

    function noegle(hylde) { return hylde.slice().sort().join("|"); }

    function korteste(hylde, maal, maksDybde) {
        maksDybde = maksDybde || MAKS_DYBDE;
        if (hylde.indexOf(maal) >= 0) return { par: 0, rute: [] };
        var set = {};
        set[noegle(hylde)] = true;
        var lag = [{ hylde: hylde.slice(), rute: [] }];
        for (var d = 1; d <= maksDybde; d++) {
            var naeste = [];
            for (var i = 0; i < lag.length; i++) {
                var t = lag[i];
                var mulige = trin(t.hylde);
                for (var j = 0; j < mulige.length; j++) {
                    var m = mulige[j];
                    var ny = t.hylde.concat(m.nye);
                    var rute = t.rute.concat([m]);
                    if (m.nye.indexOf(maal) >= 0) return { par: d, rute: rute };
                    var k = noegle(ny);
                    if (set[k]) continue;
                    set[k] = true;
                    naeste.push({ hylde: ny, rute: rute });
                }
            }
            lag = naeste;
            if (!lag.length) break;
        }
        return null;
    }

    /* ----- Kaeden (lag 3, Niels 27. nov. 2026) -----------------------------------
       Eleven skriver ruten som et reaktionsskema: hvert kort virker paa det
       sidste stof i kaeden. Ved en kondensation er partneren et stof, der
       allerede staar i kaeden, eller et af de andre udgangsstoffer (lageret).
       Hydrolysens andet stof kommer paa lageret. En tilstand er det sidste
       stof og det, der kan bruges som partner. */
    function kaedeTrin(nu, har) {
        var ud = [];
        var s = K.stof(nu);
        if (!s) return ud;
        var nyHar = har.indexOf(nu) >= 0 ? har : har.concat([nu]);
        ENKELT.forEach(function (k) {
            var r = R.anvend(s, k);
            if (r.ingen) return;
            r.valg.forEach(function (v, i) {
                var ok = v.produkter.every(function (p) { return p.klasse !== "andet" && p.antalC <= MAKS_C; });
                if (!ok) return;
                v.produkter.forEach(function (p) {
                    var andre = v.produkter.filter(function (x) { return x !== p; }).map(function (x) { return x.navn; });
                    ud.push({ kort: k, fra: nu, partner: null, valg: i, til: p.navn,
                              har: nyHar.concat(andre.filter(function (x) { return nyHar.indexOf(x) < 0; })) });
                });
            });
        });
        har.forEach(function (pn) {
            if (pn === nu) return;
            var r = R.anvend(s, "kond", K.stof(pn));
            if (r.ingen) return;
            var p = r.valg[0].produkter[0];
            if (p.antalC > MAKS_C) return;
            ud.push({ kort: "kond", fra: nu, partner: pn, valg: 0, til: p.navn, har: nyHar });
        });
        return ud;
    }

    function kaedeFra(nu, har, maal, maksDybde) {
        maksDybde = maksDybde || 7;
        if (nu === maal) return { par: 0, rute: [] };
        var set = {};
        function noeg(n, h) { return n + "#" + h.slice().sort().join("|"); }
        set[noeg(nu, har)] = true;
        var lag = [{ nu: nu, har: har.slice(), rute: [] }];
        for (var d = 1; d <= maksDybde; d++) {
            var naeste = [];
            for (var i = 0; i < lag.length; i++) {
                var t = lag[i], mulige = kaedeTrin(t.nu, t.har);
                for (var j = 0; j < mulige.length; j++) {
                    var m = mulige[j], rute = t.rute.concat([m]);
                    if (m.til === maal) return { par: d, rute: rute };
                    var k = noeg(m.til, m.har);
                    if (set[k]) continue;
                    set[k] = true;
                    naeste.push({ nu: m.til, har: m.har, rute: rute });
                }
            }
            lag = naeste;
            if (!lag.length) break;
        }
        return null;
    }

    /* Den korteste kaede fra udgangsstofferne: det foerste er kaedens start */
    function kaede(start, maal) { return kaedeFra(start[0], start.slice(1), maal); }

    NK.Rute = { trin: trin, korteste: korteste, kaede: kaede, kaedeFra: kaedeFra, ENKELT: ENKELT };
}());

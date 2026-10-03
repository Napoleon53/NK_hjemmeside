/* =====================================================================
   bibliotek.js - de saet, man kan vaelge imellem

   Noeglen til et saet er
     "i:<navn>"   et indbygget saet fra data.js
     "e:<id>"     et eget saet, gemt i denne browser

   Det valgte saet huskes. Et link med #ioner vaelger et indbygget saet,
   og et link med #kort=... har selve saettet i sig; det gemmes blandt de
   egne og vaelges.

   Rekorderne (vendespil og parring) hoerer til saettet og gemmes under et
   fingeraftryk af teksten, saa en rettelse i saettet ikke arver en rekord
   fra en anden udgave.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Tekstformat;

    var EGNE = "nk-kemikort-egne";
    var VALGT = "nk-kemikort-valgt";
    var REKORD = "nk-kemikort-rekord";
    var ONLINE = "https://kemiformler.dk/animationer/superanimationer/sc_spil9_kemikort/index.html";

    var B = NK.Bibliotek = {};
    var cache = {};

    function egne() {
        var l = NK.hent(EGNE, []);
        return Array.isArray(l) ? l.filter(function (x) { return x && x.id && typeof x.tekst === "string"; }) : [];
    }

    function normal(tekst) {
        return String(tekst || "").replace(/\r/g, "").split("\n")
            .map(function (l) { return l.trim(); })
            .filter(function (l) { return l; }).join("\n");
    }

    B.tekst = function (noegle) {
        var m = /^([ie]):(.+)$/.exec(noegle || "");
        if (!m) return null;
        if (m[1] === "i") {
            var i = D.INDBYGGEDE.filter(function (x) { return x.noegle === m[2]; })[0];
            return i ? i.tekst : null;
        }
        var e = egne().filter(function (x) { return x.id === m[2]; })[0];
        return e ? e.tekst : null;
    };

    B.findes = function (noegle) { return B.tekst(noegle) !== null; };
    B.indbygget = function (noegle) { return /^i:/.test(noegle || ""); };

    /* Saettet, klar til brug, eller null hvis teksten har fejl. */
    B.saet = function (noegle) {
        var t = B.tekst(noegle);
        if (t === null) return null;
        if (cache[noegle] && cache[noegle].tekst === t) return cache[noegle].saet;
        var r = F.fraTekst(t);
        cache[noegle] = { tekst: t, saet: r.saet };
        return r.saet;
    };

    B.liste = function () {
        var ud = D.INDBYGGEDE.map(function (x) {
            return { noegle: "i:" + x.noegle, navn: F.fraTekst(x.tekst).udkast.navn, indbygget: true };
        });
        egne().forEach(function (x) {
            ud.push({ noegle: "e:" + x.id, navn: F.fraTekst(x.tekst).udkast.navn, indbygget: false });
        });
        return ud;
    };

    B.valgt = function () {
        var v = NK.hent(VALGT, null);
        return v && B.saet(v) ? v : "i:" + D.STANDARD;
    };

    B.vaelg = function (noegle) {
        if (B.findes(noegle)) NK.gem(VALGT, noegle);
    };

    /* Gemmer et eget saet. Uden id laves et nyt. Giver noeglen. */
    B.gem = function (tekst, id) {
        var l = egne();
        var fundet = id ? l.filter(function (x) { return x.id === id; })[0] : null;
        if (!fundet) {
            var ens = l.filter(function (x) { return normal(x.tekst) === normal(tekst); })[0];
            if (ens) return "e:" + ens.id;
            fundet = { id: "e" + NK.fingeraftryk(tekst + Date.now()) };
            l.push(fundet);
        }
        fundet.tekst = tekst;
        NK.gem(EGNE, l);
        return "e:" + fundet.id;
    };

    B.slet = function (noegle) {
        var m = /^e:(.+)$/.exec(noegle || "");
        if (!m) return false;
        NK.gem(EGNE, egne().filter(function (x) { return x.id !== m[1]; }));
        if (NK.hent(VALGT, null) === noegle) NK.glem(VALGT);
        return true;
    };

    /* Er teksten den samme som et indbygget saet? Giver dets noegle. */
    B.somIndbygget = function (tekst) {
        var i = D.INDBYGGEDE.filter(function (x) { return normal(x.tekst) === normal(tekst); })[0];
        return i ? "i:" + i.noegle : null;
    };

    /* Linket, der deler et saet. Fra harddisken peger det paa kemiformler.dk. */
    B.link = function (tekst) {
        var rod = /^https?:$/.test(window.location.protocol)
            ? window.location.href.replace(/#.*$/, "") : ONLINE;
        return rod + "#kort=" + F.tilLink(tekst);
    };

    /* Laeser linket. Giver noeglen til det valgte saet, eller null. */
    B.fraHash = function (hash) {
        var h = String(hash || "").replace(/^#/, "");
        var m = /^kort=(.+)$/.exec(h);
        if (m) {
            var t = F.fraLink(m[1]);
            if (t && F.fraTekst(t).saet) return B.somIndbygget(t) || B.gem(t);
            return null;
        }
        h = h.toLowerCase().split("&")[0];
        var i = D.INDBYGGEDE.filter(function (x) { return x.noegle === h; })[0];
        return i ? "i:" + i.noegle : null;
    };

    /* ----- Rekorder ---------------------------------------------------- */
    function aftryk(noegle) {
        return NK.fingeraftryk(normal(B.tekst(noegle) || noegle));
    }

    B.rekord = function (noegle, spil) {
        var alle = NK.hent(REKORD, {});
        var r = alle[spil + ":" + aftryk(noegle)];
        return typeof r === "number" ? r : null;
    };

    /* Gemmer tiden, hvis den er bedre end den gemte. Giver true, hvis det
       blev en ny rekord. */
    B.nyRekord = function (noegle, spil, ms) {
        var alle = NK.hent(REKORD, {});
        var n = spil + ":" + aftryk(noegle);
        if (typeof alle[n] === "number" && alle[n] <= ms) return false;
        alle[n] = ms;
        NK.gem(REKORD, alle);
        return true;
    };
}());

/* =====================================================================
   lyd.js - baggrundsmusikken

   Én lydfil pr. svaerhedsgrad (D.MUSIK i js/data.js); en svaerhedsgrad
   uden linje dér har ingen musik. Musikken spiller under opgaverne og
   paa kortet Rigtigt, og den staar stille sammen med spillet (pause,
   regler, rundvisning og en fane, der ikke kan ses). Den slaas til og
   fra med knappen i toplinjen eller M, og valget huskes i browseren.
   Objektet hedder NK.Spillyd, fordi Kemichael (kemichael.js) bruger
   NK.Lyd, hvis det findes.

   Lydfilen er et loop, der er bygget periodisk (se README, Musikken):
   den begynder `start` sekunder foer loopets begyndelse og slutter med
   en kopi af loopets foerste sekunder. Web Audio springer `laengde`
   tilbage fra loopets slutning, og fordi halen er magen til
   begyndelsen, kan springet ikke hoeres, heller ikke naar browserens
   mp3-afkoder forskyder lyden nogle millisekunder.

   Aabnes siden fra harddisken (file://), kan filen ikke hentes til Web
   Audio. Saa spilles den af et <audio>-element, der selv springer
   tilbage; det kan give et lille hak ved springet. Findes filen ikke,
   er der ingen musik, og spillet koerer som foer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var NOEGLE = "nk-pacman-lyd";
    var HTTP = /^https?:$/.test(window.location.protocol);

    var ctx = null;
    var til = NK.hent(NOEGLE, true) !== false;
    var spor = {};          /* pr. svaerhedsgrad: { m, status, buffer, element } */
    var oensket = null;     /* den svaerhedsgrad, hvis musik skal spille nu */
    var stille = false;     /* staar spillet stille? */
    var aktiv = null;       /* det, der spiller: { noegle, m, kilde, gain } eller { noegle, m, element } */
    var ur = 0;
    var lyttere = [];

    function lav() {
        if (ctx) return ctx;
        var A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ctx = new A(); } catch (e) { ctx = null; }
        return ctx;
    }

    function intet() { /* venter paa et klik eller et tastetryk */ }

    /* ----- Hent filen ---------------------------------------------------- */
    function hent(noegle) {
        var m = D.MUSIK[noegle];
        if (!m || spor[noegle]) return;
        var s = spor[noegle] = { m: m, status: "henter", buffer: null, element: null };
        var c = HTTP && window.fetch ? lav() : null;
        if (!c) { medElement(s); return; }
        window.fetch(m.fil).then(function (r) {
            if (!r.ok) throw new Error("status " + r.status);
            return r.arrayBuffer();
        }).then(function (ab) {
            return new Promise(function (ok, fejl) {
                var p = c.decodeAudioData(ab, ok, fejl);
                if (p && p.then) p.then(ok, fejl);
            });
        }).then(function (buffer) {
            s.buffer = buffer;
            s.status = "klar";
            foelg();
        }, function () { medElement(s); });
    }

    function medElement(s) {
        if (typeof window.Audio !== "function") { s.status = "fejl"; return; }
        var a = new window.Audio();
        a.preload = "auto";
        a.addEventListener("canplay", function () {
            if (s.status === "klar") return;
            s.status = "klar";
            foelg();
        });
        a.addEventListener("error", function () { s.status = "fejl"; });
        /* Naar den alligevel loeber ud over halen: forfra fra loopets begyndelse */
        a.addEventListener("ended", function () {
            if (!aktiv || aktiv.element !== a) return;
            a.currentTime = s.m.start;
            var p = a.play();
            if (p && p.then) p.then(null, intet);
        });
        a.src = s.m.fil;
        s.element = a;
    }

    /* ----- Start, stop og stilstand ------------------------------------ */
    function start(noegle) {
        var s = spor[noegle], m = s.m;
        if (s.buffer) {
            var k = ctx.createBufferSource(), g = ctx.createGain();
            k.buffer = s.buffer;
            k.loop = true;
            k.loopStart = m.start;
            k.loopEnd = m.start + m.laengde;
            g.gain.value = m.styrke;
            k.connect(g);
            g.connect(ctx.destination);
            k.start(0, m.start);
            aktiv = { noegle: noegle, m: m, kilde: k, gain: g };
        } else {
            try { s.element.currentTime = m.start; } catch (e) { /* ikke klar til at spole */ }
            s.element.volume = NK.klamp(m.styrke, 0, 1);
            aktiv = { noegle: noegle, m: m, element: s.element };
        }
    }

    function stop() {
        var a = aktiv;
        aktiv = null;
        clearTimeout(ur);
        if (!a) return;
        if (a.element) { a.element.pause(); return; }
        try {
            if (ctx.state === "running") {
                /* toner ud, saa den ikke klippes midt i en boelge */
                a.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
                a.kilde.stop(ctx.currentTime + 0.4);
            } else {
                a.kilde.stop();
                a.kilde.disconnect();
            }
        } catch (e) { /* allerede stoppet */ }
    }

    function holdStille(st) {
        if (aktiv.element) {
            var e = aktiv.element;
            if (st) { if (!e.paused) e.pause(); }
            else if (e.paused) { var p = e.play(); if (p && p.then) p.then(null, intet); }
            return;
        }
        var g = aktiv.gain.gain, nu = ctx.currentTime;
        clearTimeout(ur);
        if (st) {
            /* skru hurtigt ned, og stands saa uret, saa musikken fortsaetter samme sted */
            g.setTargetAtTime(0, nu, 0.012);
            ur = setTimeout(function () { if (stille && ctx.state === "running") ctx.suspend(); }, 70);
        } else {
            if (ctx.state !== "running") { var r = ctx.resume(); if (r && r.then) r.then(null, intet); }
            g.cancelScheduledValues(nu);
            g.setTargetAtTime(aktiv.m.styrke, nu, 0.03);
        }
    }

    /* Faar det, der spiller, til at passe med det, der oenskes */
    function foelg() {
        var s = oensket ? spor[oensket] : null;
        var vil = til && s && s.status === "klar" ? oensket : null;
        if (aktiv && aktiv.noegle !== vil) stop();
        if (vil && !aktiv) start(vil);
        if (aktiv) holdStille(stille);
    }

    /* <audio> kan ikke selv springe tilbage midt i filen */
    function spring() {
        if (!aktiv || !aktiv.element || aktiv.element.paused) return;
        var e = aktiv.element, m = aktiv.m;
        if (e.currentTime >= m.start + m.laengde + 0.25) e.currentTime -= m.laengde;
    }

    NK.Spillyd = {
        til: function () { return til; },
        findes: function (noegle) { return !!(noegle && D.MUSIK[noegle]); },
        skift: function () {
            til = !til;
            NK.gem(NOEGLE, til);
            if (til && oensket) hent(oensket);
            foelg();
            lyttere.forEach(function (f) { f(til); });
            return til;
        },
        /* Hent musikken, foer spillet starter (kaldes ved valg af svaerhedsgrad) */
        forbered: function (noegle) { if (til && D.MUSIK[noegle]) hent(noegle); },
        /* Kaldes hvert billede. noegle: svaerhedsgraden, hvis musik skal
           spille nu, ellers null. stil: staar spillet stille? */
        saet: function (noegle, stil) {
            noegle = noegle && D.MUSIK[noegle] ? noegle : null;
            stil = !!stil;
            if (noegle === oensket && stil === stille) { spring(); return; }
            oensket = noegle;
            stille = stil;
            if (oensket && til) hent(oensket);
            foelg();
        },
        /* Browseren lader foerst lyden starte efter et klik eller et tastetryk */
        vaek: function () {
            if (!aktiv || stille) return;
            if (aktiv.element) { if (aktiv.element.paused) holdStille(false); }
            else if (ctx.state !== "running") holdStille(false);
        },
        tilstand: function () {
            var s = oensket ? spor[oensket] : null;
            return {
                til: til, oensket: oensket, stille: stille, status: s ? s.status : null,
                spiller: !!aktiv, maade: aktiv ? (aktiv.element ? "audio" : "webaudio") : null,
                ur: ctx ? ctx.state : null
            };
        },
        vedAendring: function (f) { lyttere.push(f); }
    };
}());

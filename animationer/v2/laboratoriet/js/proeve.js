/* =====================================================================
   proeve.js - en mus til selvtesterne (udviklervaerktoej)

   Sender rigtige pointer-haendelser til bordets laerred i scenens
   koordinater, saa en proeve kan goere det, en elev goer med musen: tage
   fat, baere, holde stille, slippe og klikke. Haendelserne gaar samme vej
   som musens (tilBord, ned, flyt, op), saa det er den vej, der proeves,
   og ikke motorens funktioner kaldt direkte.

   Tiden styres af proeven: hver haendelse faar et tidsstempel fra et
   proeveur, og mellem to skridt koeres bordet 1/60 s frem. Saa ser bordet
   den fart, musen har i proeven, og ikke den fart, haendelserne sendes
   med (ellers ville al bevaegelse se ud som rystelser).

   Brug fra en selvtest, der har forsoeget i en iframe:

       var mus = NKProeve.mus(NK.bord);
       mus.tag("ag");                        tag fat midt paa genstanden
       mus.baer({ x: 400, y: 300 }, 0.5);    ankeret derhen paa 0,5 s
       mus.hold(1);                          hold stille i 1 s
       mus.slip();
       mus.klik("ag");                       klik midt paa genstanden

   valg.tik(dt) kan erstatte bord.opdater(dt), hvis forsoeget skal have
   mere med, naar tiden gaar. Alle punkter er i scenens koordinater.

   Indgaar ikke i forsoegene; kun selvtesterne og _vinduer.html laeser den.
   ===================================================================== */
(function (rod) {
    "use strict";

    var SKRIDT = 1 / 60;      /* s mellem to musebevaegelser */
    var FART = 400;           /* enheder/s, naar intet andet er sagt */

    function mus(bord, valg) {
        valg = valg || {};
        var c = bord.canvas;
        var vin = c.ownerDocument.defaultView;
        var NK = vin.NK;
        var ur = vin.performance.now();
        var her = { x: 0, y: 0 };
        var nede = false;
        var tik = valg.tik || function (dt) { bord.opdater(dt); };

        /* Scenen -> skaermen: det omvendte af bord.tilBord */
        function skaerm(pt) {
            var rect = c.getBoundingClientRect();
            var sk = NK.Scene.skala(bord.laerred.b, bord.laerred.h);
            return { x: rect.left + sk.dx + pt.x * sk.s, y: rect.top + sk.dy + pt.y * sk.s };
        }

        function send(type, pt) {
            var s = skaerm(pt);
            var ev = new vin.PointerEvent(type, {
                bubbles: true, cancelable: true, composed: true,
                pointerId: 1, pointerType: "mouse", isPrimary: true,
                clientX: s.x, clientY: s.y,
                button: type === "pointermove" ? -1 : 0,
                buttons: nede ? 1 : 0
            });
            try { Object.defineProperty(ev, "timeStamp", { value: ur }); } catch (e) { /* gammel browser */ }
            her = { x: pt.x, y: pt.y };
            c.dispatchEvent(ev);
        }

        function vent(sek) {
            var n = Math.max(0, Math.round(sek / SKRIDT));
            for (var i = 0; i < n; i++) { ur += SKRIDT * 1000; tik(SKRIDT); }
        }

        /* Et punkt paa genstanden: fx, fy er broekdele af dens rektangel */
        function paa(navn, fx, fy) {
            var gg = bord.g[navn];
            if (!gg) throw new Error("proeve.js: ingen genstand " + navn);
            var r = bord.rekt(gg, 0);
            return { x: r.x + r.b * (fx === undefined ? 0.5 : fx), y: r.y + r.h * (fy === undefined ? 0.5 : fy) };
        }

        function punkt(p) { return typeof p === "string" ? paa(p) : p; }

        var api = {
            /* Hvor bordet ser musen, naar den staar i pt (skal vaere pt) */
            bordetSer: function (pt) {
                var s = skaerm(pt);
                return bord.tilBord({ clientX: s.x, clientY: s.y });
            },
            her: function () { return { x: her.x, y: her.y }; },
            paa: paa,

            /* Flyt musen til pt paa sek sekunder (uden sek: med FART) */
            til: function (pt, sek) {
                pt = punkt(pt);
                var fra = her;
                var L = Math.hypot(pt.x - fra.x, pt.y - fra.y);
                if (sek === undefined) sek = L / FART;
                var n = Math.max(1, Math.round(sek / SKRIDT));
                for (var i = 1; i <= n; i++) {
                    var k = i / n;
                    ur += SKRIDT * 1000;
                    send("pointermove", { x: fra.x + (pt.x - fra.x) * k, y: fra.y + (pt.y - fra.y) * k });
                    tik(SKRIDT);
                }
                return api;
            },
            /* Saet musen et sted uden at bevaege den derhen (ingen fart) */
            stil: function (pt) { pt = punkt(pt); ur += SKRIDT * 1000; send("pointermove", pt); return api; },
            ned: function (pt) {
                if (pt !== undefined) api.stil(pt);
                nede = true;
                send("pointerdown", her);
                return api;
            },
            op: function () {
                nede = false;
                send("pointerup", her);
                return api;
            },
            hold: function (sek) { vent(sek); return api; },

            /* Tag fat i genstanden; true, hvis bordet nu holder den */
            tag: function (navn, fx, fy) {
                api.ned(paa(navn, fx, fy));
                return !!(bord.holdt && bord.holdt.navn === navn);
            },
            /* Baer det, der holdes, saa dets anker (staaende) kommer til pt */
            baer: function (pt, sek) {
                var h = bord.holdt;
                if (!h) throw new Error("proeve.js: der holdes ikke noget");
                /* Foerst et lille ryk, saa baeringen er begyndt: en vendt
                   flaske rettes op, naar man tager den, og saa sidder den
                   anderledes i haanden (holdt.dx, dy) */
                if (!h.flyttet) api.til({ x: her.x, y: her.y - 10 }, 0.05);
                h = bord.holdt;
                if (!h) throw new Error("proeve.js: der holdes ikke noget");
                return api.til({ x: pt.x + h.dx, y: pt.y + h.dy }, sek);
            },
            slip: function () { return api.op(); },
            klik: function (p) {
                api.stil(punkt(p));
                nede = true; send("pointerdown", her);
                ur += 80;
                nede = false; send("pointerup", her);
                return api;
            }
        };
        return api;
    }

    var Proeve = { mus: mus, SKRIDT: SKRIDT };
    rod.NKProeve = Proeve;
    if (rod.NK) rod.NK.Proeve = Proeve;
}(window));

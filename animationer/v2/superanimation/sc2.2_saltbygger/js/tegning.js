/* =====================================================================
   tegning.js - tegner én ion i laerredet

   Farven fortaeller ladningen (roed = positiv, blaa = negativ), og
   formen fortaeller, hvad ionen er lavet af. En sammensat ion tegnes
   som sine atomer holdt sammen af bindinger - den flytter sig og
   drejer som én enhed, ogsaa naar den svoemmer rundt i vand.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Atomernes radius i forhold til én binding. */
    var RADIUS = { H: 0.27, O: 0.4, N: 0.42, C: 0.42, S: 0.5, P: 0.5 };

    var FARVE = {
        kat: { midt: ["#ff9f92", "#c23a2d"], ligand: ["#ffc7bf", "#d8675a"], H: ["#fff3f1", "#e2aaa2"],
               Htekst: "#5a2520", binding: "rgba(255, 196, 186, 0.8)", ladning: "#ff9f92", glorie: "224, 84, 70" },
        an:  { midt: ["#93d2ff", "#1c68a6"], ligand: ["#bfe4ff", "#3a8fd0"], H: ["#f1f9ff", "#a3cbea"],
               Htekst: "#173a5c", binding: "rgba(176, 218, 250, 0.8)", ladning: "#93d2ff", glorie: "61, 158, 224" }
    };
    NK.FARVE = FARVE;

    /* Atomerne centreret om (0, 0) og ionens udstraekning. Regnes kun
       én gang pr. ion. */
    NK.ionGeo = function (ion) {
        if (ion._geo) return ion._geo;
        var kilde = ion.sammensat ? ion.atomer : [[ion.formel, 0, 0]];
        var atomer = [], i, a;
        for (i = 0; i < kilde.length; i++) {
            a = kilde[i];
            /* Enkle ioner: positive er mindre end negative, som i virkeligheden. */
            var r = ion.sammensat ? (RADIUS[a[0]] || 0.45) : (ion.q > 0 ? 0.6 : 0.74);
            atomer.push({ s: a[0], x: a[1], y: a[2], r: r, bind: a.length > 3 ? a[3] : -1, midt: i === 0 });
        }
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (i = 0; i < atomer.length; i++) {
            a = atomer[i];
            minX = Math.min(minX, a.x - a.r); maxX = Math.max(maxX, a.x + a.r);
            minY = Math.min(minY, a.y - a.r); maxY = Math.max(maxY, a.y + a.r);
        }
        var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, R = 0;
        for (i = 0; i < atomer.length; i++) {
            a = atomer[i];
            a.x -= cx; a.y -= cy;
            R = Math.max(R, Math.sqrt(a.x * a.x + a.y * a.y) + a.r);
        }
        ion._geo = { atomer: atomer, halvB: (maxX - minX) / 2, halvH: (maxY - minY) / 2, R: R };
        return ion._geo;
    };

    function kugle(c, x, y, r, farver) {
        var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, farver[0]);
        g.addColorStop(1, farver[1]);
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(0, 0, 0, 0.35)";
        c.lineWidth = 1;
        c.stroke();
    }

    /* Den forenklede tegning: én kugle i ionens farve, med formlen
       skrevet henover - samme radius (geo.R), farve og ladningsmaerke
       som den detaljerede tegning, saa den passer ind samme steder. */
    function tegnKugleIon(c, ion, x, y, s, opt, geo, f) {
        var r = geo.R * s;
        c.save();
        c.globalAlpha = opt.alpha === undefined ? 1 : opt.alpha;

        if (opt.glorie) {
            c.fillStyle = "rgba(" + f.glorie + ", 0.10)";
            c.beginPath();
            c.arc(x, y, r + 5, 0, Math.PI * 2);
            c.fill();
            c.setLineDash([4, 4]);
            c.strokeStyle = "rgba(" + f.glorie + ", 0.55)";
            c.lineWidth = 1.2;
            c.stroke();
            c.setLineDash([]);
        }

        kugle(c, x, y, r, f.midt);

        /* Formlen skal kunne staa inden i kuglen - skrumper skriften,
           hvis den ellers ville stikke ud over kanten. */
        var fs = r * 0.62;
        c.font = "700 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif";
        var bredde = c.measureText(ion.formel).width;
        var loft = r * 1.7;
        if (bredde > loft) fs *= loft / bredde;
        NK.tekst(c, ion.formel, x, y + fs * 0.04, {
            font: "700 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif",
            justering: "center", linje: "middle", farve: "#ffffff"
        });

        if (opt.ladning) {
            NK.tekst(c, NK.ladningstekst(ion.q), x + r * 0.74, y - r * 0.74, {
                font: "700 " + Math.max(11, s * 0.52).toFixed(1) + "px 'Segoe UI', sans-serif",
                justering: "left", linje: "bottom", farve: f.ladning, kant: true
            });
        }
        c.restore();
    }

    /* Tegn ionen med centrum i (x, y). s er pixels pr. binding.
       opt: vinkel (radianer), alpha, glorie (stiplet ring om en
       sammensat ion), ladning (en lille "2−" ved siden af), enkel
       (tegn en sammensat ion som én kugle med formlen skrevet paa -
       man skal ikke forstaa lewisstrukturen for at forstaa, at NO₃⁻
       er ÉN ion, der hverken deler sig eller aendrer sig i vandet). */
    NK.tegnIon = function (c, ion, x, y, s, opt) {
        opt = opt || {};
        var geo = NK.ionGeo(ion);
        var f = ion.q > 0 ? FARVE.kat : FARVE.an;

        if (opt.enkel && ion.sammensat) {
            tegnKugleIon(c, ion, x, y, s, opt, geo, f);
            return;
        }

        var v = opt.vinkel || 0;
        var cos = Math.cos(v), sin = Math.sin(v);
        var pos = [], i, a;
        for (i = 0; i < geo.atomer.length; i++) {
            a = geo.atomer[i];
            pos.push({ x: x + (a.x * cos - a.y * sin) * s, y: y + (a.x * sin + a.y * cos) * s });
        }

        c.save();
        c.globalAlpha = opt.alpha === undefined ? 1 : opt.alpha;

        if (opt.glorie && ion.sammensat) {
            var gr = geo.R * s + 5;
            c.fillStyle = "rgba(" + f.glorie + ", 0.10)";
            c.beginPath();
            c.arc(x, y, gr, 0, Math.PI * 2);
            c.fill();
            c.setLineDash([4, 4]);
            c.strokeStyle = "rgba(" + f.glorie + ", 0.55)";
            c.lineWidth = 1.2;
            c.stroke();
            c.setLineDash([]);
        }

        /* Bindingerne under atomerne. */
        c.strokeStyle = f.binding;
        c.lineCap = "round";
        c.lineWidth = Math.max(1.5, s * 0.16);
        for (i = 0; i < geo.atomer.length; i++) {
            a = geo.atomer[i];
            if (a.bind < 0) continue;
            c.beginPath();
            c.moveTo(pos[a.bind].x, pos[a.bind].y);
            c.lineTo(pos[i].x, pos[i].y);
            c.stroke();
        }

        /* De ydre atomer foerst, centralatomet til sidst. */
        for (i = geo.atomer.length - 1; i >= 0; i--) {
            a = geo.atomer[i];
            var r = a.r * s;
            var farver = a.s === "H" ? f.H : (a.midt ? f.midt : f.ligand);
            kugle(c, pos[i].x, pos[i].y, r, farver);
            if (r >= 5) {
                var fs = r * (a.s.length > 1 ? 0.92 : 1.12);
                NK.tekst(c, a.s, pos[i].x, pos[i].y + fs * 0.04, {
                    font: "700 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif",
                    justering: "center", linje: "middle",
                    farve: a.s === "H" ? f.Htekst : "#ffffff"
                });
            }
        }

        if (opt.ladning) {
            var lr = ion.sammensat ? geo.R * s + 3 : geo.atomer[0].r * s;
            NK.tekst(c, NK.ladningstekst(ion.q), x + lr * 0.74, y - lr * 0.74, {
                font: "700 " + Math.max(11, s * 0.52).toFixed(1) + "px 'Segoe UI', sans-serif",
                justering: "left", linje: "bottom", farve: f.ladning, kant: true
            });
        }
        c.restore();
    };
}());

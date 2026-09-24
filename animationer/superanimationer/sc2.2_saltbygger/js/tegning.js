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
    var RADIUS = { H: 0.27, O: 0.4, N: 0.42, C: 0.42, S: 0.5, P: 0.5, Cl: 0.5, Cr: 0.52, Mn: 0.52, As: 0.52 };

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

    /* Vandfanens tegning: én kugle med formlen skrevet paa, ogsaa for
       en sammensat ion. Man skal ikke kende atomerne for at se, at
       NO₃⁻ er ÉN ion, der hverken deler sig eller aendrer sig i vandet.
       r er radius i pixels. opt: alpha, ladning (en lille "2−" ved
       siden af), glorie (stiplet ring om en sammensat ion, som den
       stiplede kant paa hylden). */
    NK.tegnKugle = function (c, ion, x, y, r, opt) {
        opt = opt || {};
        var f = ion.q > 0 ? FARVE.kat : FARVE.an;
        c.save();
        c.globalAlpha = opt.alpha === undefined ? 1 : opt.alpha;

        if (opt.glorie && ion.sammensat) {
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

        /* Formlen skal kunne staa inden i kuglen. Skriften skrumper,
           hvis den ellers ville stikke ud over kanten. */
        var fs = r * (ion.formel.length > 2 ? 0.66 : 0.9);
        c.font = "700 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif";
        var bredde = c.measureText(ion.formel).width;
        var loft = r * 1.7;
        if (bredde > loft) fs *= loft / bredde;
        NK.tekst(c, ion.formel, x, y + fs * 0.04, {
            font: "700 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif",
            justering: "center", linje: "middle", farve: "#ffffff"
        });

        if (opt.ladning) {
            NK.tekst(c, NK.ladningstekst(ion.q), x + r * 0.72, y - r * 0.72, {
                font: "700 " + Math.max(12, r * 0.62).toFixed(1) + "px 'Segoe UI', sans-serif",
                justering: "left", linje: "bottom", farve: f.ladning, kant: true
            });
        }
        c.restore();
    };

    /* Tegn ionen med centrum i (x, y) med alle atomerne. s er pixels
       pr. binding. opt: vinkel (radianer), alpha, glorie (stiplet ring
       om en sammensat ion), ladning (en lille "2−" ved siden af). */
    NK.tegnIon = function (c, ion, x, y, s, opt) {
        opt = opt || {};
        var geo = NK.ionGeo(ion);
        var f = ion.q > 0 ? FARVE.kat : FARVE.an;

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

    /* ----- Plakaterne paa vaeggen (fane 3), som i sc2.3 -------------------
       slags "pt" (det periodiske system) eller "ioner" (sammensatte
       ioner). v.lys: gul ramme (musen over eller hintet peger), v.vinkel:
       plakaten haenger lidt skaevt. */
    var PT_FARVE = { m: "#9fb8d8", i: "#9fd8a9", h: "#d8d39f", a: "#c7a9dd" };

    NK.tegnPlakat = function (ctx, x, y, b, h, slags, v) {
        var D = NK.Data;
        v = v || {};
        ctx.save();
        ctx.translate(x + b / 2, y);
        ctx.rotate(v.vinkel || 0);
        ctx.translate(-(x + b / 2), -y);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#ece7da";
        ctx.fillRect(x, y, b, h);
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lys, 0, 1) + ")";
            ctx.lineWidth = 3;
            ctx.strokeRect(x - 3, y - 3, b + 6, h + 6);
        }
        ctx.fillStyle = "#d94a3a";
        ctx.beginPath();
        ctx.arc(x + b / 2, y + 7, 4, 0, Math.PI * 2);
        ctx.fill();

        var titel = slags === "pt" ? "Det periodiske system" : "Sammensatte ioner";
        ctx.fillStyle = "#2b2f38";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, titel, b - 14, 13, 9, "700");
        ctx.fillText(titel, x + b / 2, y + 22);

        var ix = x + 8, iy = y + 34, ib = b - 16, ih = h - 42;
        if (slags === "pt") {
            var celle = Math.min(ib / 18, ih / 6);
            var ox = ix + (ib - celle * 18) / 2, oy = iy + (ih - celle * 6) / 2;
            D.GRUNDSTOFFER.forEach(function (g) {
                var cx = ox + (g.soejle - 1) * celle, cy = oy + (g.periode - 1) * celle;
                ctx.fillStyle = v.fremhaev === g.s ? "#f2c53d" : PT_FARVE[g.slags];
                ctx.fillRect(cx + 0.5, cy + 0.5, celle - 1, celle - 1);
            });
        } else {
            var linjer = D.PLAKAT_IONER.map(function (id) { return D.ion(id); });
            var lh = ih / linjer.length;
            var px = NK.klamp(lh * 0.7, 7, 13);
            var bredest = function (s) {
                var m = 0;
                linjer.forEach(function (ion) {
                    ctx.font = "700 " + s + "px 'Segoe UI', sans-serif";
                    var b1 = ctx.measureText(D.ionTekst(ion)).width;
                    ctx.font = "600 " + s + "px 'Segoe UI', sans-serif";
                    m = Math.max(m, b1 + ctx.measureText(D.ionNavn(ion)).width + 10);
                });
                return m;
            };
            while (px >= 10 && bredest(px) > ib - 4) px -= 0.5;
            linjer.forEach(function (ion, i) {
                var ly = iy + lh * (i + 0.5);
                if (px >= 10) {
                    ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
                    ctx.textAlign = "left";
                    ctx.fillStyle = ion.q > 0 ? "#a8382a" : "#1f5f96";
                    ctx.fillText(D.ionTekst(ion), ix + 2, ly);
                    ctx.font = "600 " + px + "px 'Segoe UI', sans-serif";
                    ctx.fillStyle = v.fremhaev === ion.id ? "#8a6a00" : "#4a4f5a";
                    ctx.textAlign = "right";
                    ctx.fillText(D.ionNavn(ion), ix + ib - 2, ly);
                } else {
                    ctx.fillStyle = "rgba(43, 47, 56, 0.35)";
                    ctx.fillRect(ix + 2, ly - 1.5, ib * 0.3, 3);
                    ctx.fillRect(ix + ib * 0.45, ly - 1.5, ib * 0.5, 3);
                }
            });
        }
        ctx.restore();
    };
}());

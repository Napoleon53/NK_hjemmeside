/* =====================================================================
   glas.js - reagensglassene med de to test (fane 1 og 3)

   Glasset er sprites/reagensglas_tom.svg (60 x 200). Vaesken, skyen af
   bundfald, kornene, der falder til bunds, soelvspejlet og vandbadet
   tegnes her under og omkring det. De faerdige glas staar hver for sig i
   sprites/ (reagensglas_dnph, _dnph_bundfald, _tollens, _soelvspejl) og
   bruges i teorien.

   NK.Glas.tilstand(test, res, t) giver glassets udseende t sekunder efter,
   at testen er sat i gang (t < 0: ikke sat i gang endnu):
     test   "dnph" eller "tollens"
     res    { dnph, tollens, farve }: true, "meget" eller "lidt" (eller
            false/null), og bundfaldets farve ("gul" eller "orange")
   NK.Glas.tegn(ctx, r, til, korn) tegner glasset i rammen r { x, y, b, h }.
   NK.Glas.pipette(ctx, r, t) tegner plastpipetten og draaben over glasset.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var GF = D.GLASFARVE;

    var TOM = new Image();
    TOM.src = "sprites/reagensglas_tom.svg";
    var PIPETTE = new Image();
    PIPETTE.src = "sprites/plastpipette.svg";

    var VARIGHED = 4.2;            /* sekunder, til glasset er faerdigt */

    function hex(h) {
        h = h.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
    function bland(a, b, t) {
        var x = hex(a), y = hex(b);
        return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(x[i] + (y[i] - x[i]) * t); }).join(",") + ")";
    }
    function blandHex(a, b, t) {
        var x = hex(a), y = hex(b);
        return "#" + [0, 1, 2].map(function (i) {
            var v = Math.round(x[i] + (y[i] - x[i]) * t).toString(16);
            return v.length < 2 ? "0" + v : v;
        }).join("");
    }

    /* Kornene i bundfaldet: samme moenster hver gang (ingen tilfaeldighed),
       saa glasset ser ens ud, naar fanen tegnes igen */
    function korn(n) {
        var ud = [], s = 7;
        function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
        for (var i = 0; i < (n || 46); i++) ud.push({ x: r(), y0: r() * 0.85, v: 0.18 + r() * 0.3, st: 0.8 + r() * 0.8 });
        return ud;
    }
    var KORN = korn(46);

    function mild(t, a, b) { return NK.blod(NK.klamp((t - a) / (b - a), 0, 1)); }

    function tilstand(test, res, t) {
        var til = { farve: test === "dnph" ? GF.dnph : GF.tollens, sky: 0, skyFarve: null, bundfald: 0,
            bundfaldFarve: null, korn: null, spejl: 0, bad: 0, faerdig: t >= VARIGHED };
        if (t === null || t === undefined || t < 0) return til;
        if (test === "dnph") {
            var p = res.dnph;
            if (!p) return til;
            /* Meget: uklart glas med et tykt lag og korn, der bliver ved med at
               svaeve. Lidt (husholdningssprit): naesten klart og et tyndt lag */
            var lidt = p === "lidt", f = res.farve === "orange" ? "orange" : "gul";
            var op = mild(t, 0.7, 1.4), ned = mild(t, 1.4, 3.6);
            til.skyFarve = GF.sky[f];
            til.bundfaldFarve = GF.bundfald[f];
            til.sky = op * (lidt ? 0.14 : 0.85) * (1 - (lidt ? 0.6 : 0.45) * ned);
            til.bundfald = ned * (lidt ? 0.022 : 0.18);
            if (t > 0.9) til.korn = { tid: t - 0.9, andel: lidt ? 0.18 : 1, svaev: !lidt };
            return til;
        }
        /* Tollens' test: glasset staar i et varmt vandbad i et minut */
        til.bad = Math.min(mild(t, 0.8, 1.2), 1 - mild(t, 3.6, 4.1));
        if (res.tollens) {
            var lidtS = res.tollens === "lidt";
            til.spejl = mild(t, 1.5, 3.4) * (lidtS ? 0.45 : 1);
            til.farve = blandHex(GF.tollens, "#b9bfc6", mild(t, 1.3, 2.4) * (lidtS ? 0.4 : 1));
        }
        return til;
    }

    /* Et reagensglas med vaeske. r er rammen om hele glasset (sprite 60 x 200) */
    function tegn(ctx, r, til) {
        var sx = r.b / 60, sy = r.h / 200;
        if (!(r.b > 6) || !(r.h > 20)) return;
        var x0 = r.x + 13 * sx + 1, x1 = r.x + 47 * sx - 1, cx = r.x + 30 * sx, cy = r.y + 172 * sy, rad = Math.max(1, 17 * sx - 1);
        var top = r.y + 92 * sy, bund = cy + rad, hoejde = bund - top;

        /* Vandbadet bag glasset */
        if (til.bad > 0) {
            ctx.save();
            ctx.globalAlpha = til.bad * 0.55;
            ctx.fillStyle = GF.vand;
            NK.rundtRekt(ctx, r.x - 10 * sx, r.y + r.h * 0.5, r.b + 20 * sx, r.h * 0.56, 6);
            ctx.fill();
            ctx.restore();
        }

        function vaeske() {
            ctx.beginPath();
            ctx.moveTo(x0, top);
            ctx.lineTo(x1, top);
            ctx.lineTo(x1, cy);
            ctx.arc(cx, cy, rad, 0, Math.PI);
            ctx.closePath();
        }
        ctx.save();
        vaeske();
        var g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, bland(til.farve, "#000000", 0.1));
        g.addColorStop(0.45, til.farve);
        g.addColorStop(1, bland(til.farve, "#000000", 0.1));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.clip();
        /* Skyen: bundfaldet svaever i vaesken */
        if (til.sky > 0 && til.skyFarve) {
            ctx.globalAlpha = til.sky;
            ctx.fillStyle = til.skyFarve;
            ctx.fillRect(x0 - 2, top - 2, x1 - x0 + 4, hoejde + 4);
            ctx.globalAlpha = 1;
        }
        /* Kornene, der falder til bunds */
        if (til.korn && til.bundfaldFarve) {
            var graense = 1 - til.bundfald - 0.01;
            ctx.fillStyle = til.bundfaldFarve;
            var n = Math.round(KORN.length * til.korn.andel);
            for (var i = 0; i < n; i++) {
                var k = KORN[i], y = k.y0 + k.v * til.korn.tid;
                /* Hvert tredje korn svaever, saa glasset forbliver uklart */
                if (til.korn.svaev && i % 3 === 0) y = Math.min(k.y0 * 0.9 + 0.05, graense - 0.02) + 0.03 * Math.sin(til.korn.tid * 0.9 + i);
                if (y > graense) continue;
                ctx.beginPath();
                ctx.arc(x0 + 2 + k.x * (x1 - x0 - 4), top + y * hoejde, Math.max(1.1, sx * k.st * 1.5), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        /* Bundfaldet i bunden */
        if (til.bundfald > 0 && til.bundfaldFarve) {
            var yb = bund - hoejde * til.bundfald;
            ctx.fillStyle = til.bundfaldFarve;
            ctx.beginPath();
            ctx.moveTo(x0 - 2, yb + 2);
            ctx.quadraticCurveTo(cx, yb - 3, x1 + 2, yb + 2);
            ctx.lineTo(x1 + 2, bund + 2);
            ctx.lineTo(x0 - 2, bund + 2);
            ctx.closePath();
            ctx.fill();
        }
        /* Soelvspejlet: blankt soelv paa glasset, saa langt op som vaesken */
        if (til.spejl > 0) {
            ctx.globalAlpha = til.spejl;
            var s = ctx.createLinearGradient(x0, 0, x1, 0);
            s.addColorStop(0, "#5f666e");
            s.addColorStop(0.18, "#9aa1a9");
            s.addColorStop(0.32, "#f4f6f8");
            s.addColorStop(0.48, "#a7aeb6");
            s.addColorStop(0.75, "#6f767e");
            s.addColorStop(1, "#4c5259");
            ctx.fillStyle = s;
            ctx.fillRect(x0 - 2, top - 3 * sy, x1 - x0 + 4, hoejde + 6);
            /* To smaa glimt */
            if (til.spejl > 0.7) {
                ctx.globalAlpha = (til.spejl - 0.7) / 0.3;
                glimt(ctx, r.x + 40 * sx, r.y + 117 * sy, 5 * sx);
                glimt(ctx, r.x + 22 * sx, r.y + 153 * sy, 3.6 * sx);
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
        if (TOM.complete && TOM.naturalWidth) ctx.drawImage(TOM, r.x, r.y, r.b, r.h);

        /* Vandbadets forside, saa glasset staar i vandet */
        if (til.bad > 0) {
            ctx.save();
            ctx.globalAlpha = til.bad * 0.28;
            ctx.fillStyle = GF.vand;
            NK.rundtRekt(ctx, r.x - 10 * sx, r.y + r.h * 0.5, r.b + 20 * sx, r.h * 0.56, 6);
            ctx.fill();
            ctx.restore();
        }
    }

    function glimt(ctx, x, y, s) {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s * 0.28, y - s * 0.28);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x + s * 0.28, y + s * 0.28);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x - s * 0.28, y + s * 0.28);
        ctx.lineTo(x - s, y);
        ctx.lineTo(x - s * 0.28, y - s * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* Plastpipetten over glasset og draaben, der falder i. Kun de foerste
       sekunder efter, at testen er sat i gang */
    function pipette(ctx, r, t) {
        if (t === null || t === undefined || t < 0 || t > 1.2) return;
        var sy = r.h / 200, ph = r.h * 0.55, pb = ph * 30 / 120;
        var spids = { x: r.x + r.b / 2, y: r.y + 30 * sy };
        var alfa = Math.min(mild(t, 0, 0.18), 1 - mild(t, 0.85, 1.2));
        ctx.save();
        ctx.globalAlpha = alfa;
        if (PIPETTE.complete && PIPETTE.naturalWidth) ctx.drawImage(PIPETTE, spids.x - pb / 2, spids.y - ph, pb, ph);
        ctx.restore();
        if (t > 0.22 && t < 0.72) {
            var u = (t - 0.22) / 0.5, y = spids.y + u * u * (r.y + 92 * sy - spids.y), d = Math.max(2.2, r.b * 0.06);
            ctx.save();
            ctx.fillStyle = "#cfe0ee";
            ctx.strokeStyle = "#7d8896";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(spids.x, y - d * 1.6);
            ctx.quadraticCurveTo(spids.x + d, y, spids.x, y + d);
            ctx.quadraticCurveTo(spids.x - d, y, spids.x, y - d * 1.6);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    NK.Glas = { tilstand: tilstand, tegn: tegn, pipette: pipette, VARIGHED: VARIGHED, blandHex: blandHex };
}());

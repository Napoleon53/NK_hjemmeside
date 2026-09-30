/* =====================================================================
   stige.js - stigen forneden i scenen

   En vandret akse fra 10⁻⁹ til 10⁹. Ét trin er én plads for kommaet, og
   en enhed staar ved sin egen tierpotens: cm ligger to trin fra m, og
   cm² ligger fire trin fra m², fordi forstavelsen staar i anden potens.
   Derfor er afstanden paa aksen altid lige saa mange pladser, som kommaet
   skal flyttes.

   Forstavelsernes tierpotenser er skjulte, til eleven har faaet hintet
   eller svaret: stigen er et kort under opgaven og en tabel bagefter.
   Buen mellem to enheder baerer relationen (1 km = 1000 m) og kommer
   samtidig med tierpotenserne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tal;

    var MIN_E = -9, MAKS_E = 9;
    var MARGIN = 46;
    var BUE_TID = 0.55;

    var F_AKSE = "#4d4e5e";
    var F_TIK = "#3f4050";
    var F_CHIP = "#22222d";
    var F_CHIP_KANT = "#45455a";
    var F_TEKST = "#aab1bb";
    var F_MAT = "#767c8a";
    var F_BLAA = "#3d9ee0";
    var F_GROEN = "#3fae72";
    var F_GUL = "#f2c53d";

    var GRUNDLINJE = "Et trin er én plads for kommaet";

    function Stige() {
        this.punkter = null;
        this.afsloer = false;
        this.loest = false;
        this.visMaal = true;
        this.visBue = false;
        this.t = 1;
    }

    var P = Stige.prototype;

    /* Kaldes ved hver ny opgave og hver gang tilstanden skifter.
       tilstand: { afsloer, loest } */
    P.saet = function (opg, tilstand) {
        tilstand = tilstand || {};
        var nye = opg ? T.stigePunkter(opg) : null;
        var gammel = this.punkter;
        var skift = !gammel || !nye || gammel.fra !== nye.fra || gammel.til !== nye.til ||
            gammel.fraTekst !== nye.fraTekst || gammel.tilTekst !== nye.tilTekst;
        this.punkter = nye;
        this.afsloer = !!tilstand.afsloer;
        this.loest = !!tilstand.loest;
        var aabent = this.afsloer || this.loest;
        this.visMaal = !!nye && (!nye.skjulMaal || aabent);
        var bue = !!nye && !!nye.bue && this.visMaal;
        if (skift) this.t = bue ? 0 : 1;
        else if (bue && !this.visBue) this.t = 0;
        this.visBue = bue;
    };

    P.opdater = function (dt) {
        if (this.visBue && this.t < 1) this.t = Math.min(1, this.t + dt / BUE_TID);
    };

    P.faerdig = function () { this.t = 1; };

    P.x = function (e, b) {
        var trin = (b - 2 * MARGIN) / (MAKS_E - MIN_E);
        return MARGIN + (e - MIN_E) * trin;
    };

    /* ----- Tegningen -------------------------------------------------- */
    P.tegn = function (ctx, b, h) {
        if (b < 240 || h < 70) return;
        /* Under aksen skal der vaere plads til chippen (20), navnet (16) og
           tierpotensen (16). Pladsen til tierpotensen staar tom, til den
           kommer frem, saa aksen ikke hopper, naar hintet gives. Er der
           ikke plads til navnet, falder det ud. */
        this.visNavne = h - 100 >= 50;
        var under = 48 + (this.visNavne ? 16 : 0);
        var y = Math.round(Math.min(h - under, h - 44));
        var trin = (b - 2 * MARGIN) / (MAKS_E - MIN_E);
        var e, x;

        ctx.save();

        /* Aksen med et tik for hver tierpotens */
        ctx.strokeStyle = F_AKSE;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(MARGIN - 12, y);
        ctx.lineTo(b - MARGIN + 12, y);
        ctx.stroke();

        for (e = MIN_E; e <= MAKS_E; e++) {
            x = this.x(e, b);
            var navngivet = harForstavelse(e);
            ctx.strokeStyle = navngivet ? F_AKSE : F_TIK;
            ctx.lineWidth = navngivet ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(x, y - (navngivet ? 5 : 3));
            ctx.lineTo(x, y + (navngivet ? 7 : 4));
            ctx.stroke();
        }

        /* Forstavelserne under aksen */
        var lys = this.lysende();
        for (var i = 0; i < T.STIGE.length; i++) {
            var f = T.STIGE[i];
            this.tegnChip(ctx, f, T.FORSTAVELSER[f], this.x(T.FORSTAVELSER[f], b), y + 12, trin, lys[f]);
        }

        /* Opgavens enheder over aksen */
        if (this.punkter) this.tegnOpgave(ctx, b, y);

        /* Reglen staar i hjoernet, hvor hverken naale eller bue kommer */
        NK.tekst(ctx, GRUNDLINJE, MARGIN - 12, 15, {
            font: "600 12px 'Segoe UI', sans-serif", justering: "left", farve: F_MAT
        });

        ctx.restore();
    };

    function harForstavelse(e) {
        for (var i = 0; i < T.STIGE.length; i++) {
            if (T.FORSTAVELSER[T.STIGE[i]] === e) return true;
        }
        return false;
    }

    /* Forstavelsen paa opgavens mærker lyser: true er maalet, "svag" er
       udgangspunktet */
    P.lysende = function () {
        var ud = {}, p = this.punkter;
        if (!p || p.ingenLys) return ud;
        var mig = this;
        T.STIGE.forEach(function (f) {
            var fe = T.FORSTAVELSER[f];
            if (mig.visMaal && fe === p.til) ud[f] = true;
            else if (fe === p.fra) ud[f] = ud[f] || "svag";
        });
        return ud;
    };

    P.tegnChip = function (ctx, f, fe, x, y, trin, lys) {
        var navn = f === "" ? "" : T.NAVNE[f];
        var vis = f === "" ? "1" : f;
        var bred = Math.max(21, Math.min(trin - 3, 32));
        var hoej = 20;

        NK.rundtRekt(ctx, x - bred / 2, y, bred, hoej, 5);
        ctx.fillStyle = lys === true ? "rgba(242, 197, 61, 0.22)" : F_CHIP;
        ctx.fill();
        ctx.strokeStyle = lys === true ? F_GUL : (lys ? "#5d6070" : F_CHIP_KANT);
        ctx.lineWidth = lys === true ? 1.6 : 1;
        ctx.stroke();
        NK.tekst(ctx, vis, x, y + hoej / 2 + 1, {
            font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: lys === true ? "#ffffff" : (f === "" ? F_MAT : F_TEKST)
        });

        var linje2 = y + hoej + 13;
        var plads = trin >= 38 && this.visNavne;
        if (plads && navn) {
            NK.tekst(ctx, navn, x, linje2, {
                font: "600 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: lys === true ? F_GUL : F_MAT
            });
        }
        if (this.afsloer || this.loest) {
            NK.tekst(ctx, "10" + NK.haevet(T.eksTekst(fe)), x, plads && navn ? linje2 + 16 : linje2, {
                font: "600 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: lys === true ? "#ffffff" : F_MAT
            });
        }
    };

    P.tegnOpgave = function (ctx, b, y) {
        var p = this.punkter;
        var x0 = this.x(p.fra, b);
        var x1 = this.x(p.til, b);
        var eet = p.fra === p.til;

        if (this.visBue && !eet) this.tegnBue(ctx, x0, x1, y, p);
        this.tegnNaal(ctx, x0, y, p.fraTekst, eet ? F_GUL : F_BLAA);
        if (this.visMaal && !eet) this.tegnNaal(ctx, x1, y, p.tilTekst, this.loest ? F_GROEN : F_GUL);
    };

    P.tegnBue = function (ctx, x0, x1, y, p) {
        var t = this.t;
        var top = y - 44;
        var xm = x0 + (x1 - x0) * t;
        var farve = this.loest ? F_GROEN : F_GUL;

        ctx.strokeStyle = farve;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y - 21);
        ctx.quadraticCurveTo((x0 + xm) / 2, top, xm, y - 21);
        ctx.stroke();

        var retning = x1 > x0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(xm, y - 19);
        ctx.lineTo(xm - retning * 7, y - 27);
        ctx.lineTo(xm + retning * 2, y - 29);
        ctx.closePath();
        ctx.fillStyle = farve;
        ctx.fill();

        /* Antallet af trin staar altid, relationen kun naar den er givet */
        if (t < 0.55) return;
        var n = Math.abs(p.til - p.fra);
        var tekst = (this.afsloer || this.loest) && p.relation ? p.relation : n + (n === 1 ? " trin" : " trin");
        NK.tekst(ctx, tekst, (x0 + x1) / 2, top - 7, {
            font: "700 13px 'Segoe UI', sans-serif", justering: "center", farve: farve,
            kant: true, kantFarve: "rgba(15, 15, 22, 0.9)"
        });
    };

    P.tegnNaal = function (ctx, x, y, tekst, farve) {
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 17);
        ctx.lineTo(x, y - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - 19, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = farve;
        ctx.fill();
        NK.tekst(ctx, tekst, x, y - 27, {
            font: "700 13px 'Segoe UI', sans-serif", justering: "center", farve: farve,
            kant: true, kantFarve: "rgba(15, 15, 22, 0.9)"
        });
    };

    NK.Stige = Stige;
}());

/* =====================================================================
   stige.js - tierpotens-stigen paa fane 1

   Stigen er en lodret tallinje i tierpotenser: hvert trin er 10 gange
   stoerre end trinet under. Til hoejre staar kendte ting (Rundetaarn,
   Maanen, et badekar), til venstre de fire svar som flag (A til D).
   Soejlen i midten er tingene, der laegges sammen: den begynder ved
   ét stk. og vokser til 1 mol. Turen er altid 23,8 tierpotenser lang,
   fordi 1 mol er 6,02 · 10²³ stk.

   Kameraet har to tal: c (tierpotensen midt i billedet) og p (pixels pr.
   tierpotens). Taet paa er p ca. 110, saa der er plads til navnene;
   i overblikket er hele turen og alle fire svar paa skaermen paa én gang.

   NK.Stige har ingen tilstand ud over kameraet og blinket ved de ting,
   soejlen lige er kommet forbi. Fanen (js/sim_gaet.js) siger, hvor
   soejlen er, og hvad der skal vises.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function log10(v) { return Math.log(v) / Math.LN10; }

    /* Et fast "tilfaeldigt" tal mellem 0 og 1 ud fra to heltal, saa
       stjernerne og slikket staar samme sted hvert billede. */
    function hash(a, b) {
        var s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
        return s - Math.floor(s);
    }

    function blandFarve(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }

    function farveAf(stops, L) {
        if (L <= stops[0][0]) return stops[0][1];
        for (var i = 1; i < stops.length; i++) {
            if (L <= stops[i][0]) {
                var t = (L - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
                return blandFarve(stops[i - 1][1], stops[i][1], t);
            }
        }
        return stops[stops.length - 1][1];
    }

    function rgb(f, a) {
        return "rgba(" + Math.round(f[0]) + "," + Math.round(f[1]) + "," + Math.round(f[2]) + "," + (a === undefined ? 1 : a) + ")";
    }

    /* Baggrunden efter stigen: mikroverdenen er moerk og blaagroen, et
       menneske staar under en blaa himmel, og rummet er sort. */
    var HIMMEL = {
        laengde: [[-11, [12, 22, 30]], [-4, [20, 40, 56]], [-1.5, [44, 96, 140]], [1.5, [70, 140, 205]], [3.6, [58, 110, 178]], [4.9, [22, 34, 78]], [5.8, [7, 8, 16]]],
        rumfang: [[-30, [12, 24, 30]], [-17, [16, 30, 40]], [-6, [24, 36, 54]], [3, [26, 38, 60]], [12, [14, 20, 42]], [20, [8, 10, 22]]],
        tid: [[0, [30, 22, 44]], [9, [24, 18, 38]], [16, [14, 10, 26]]]
    };

    /* Taerskel for stjerner paa himlen (kun laengdestigen) */
    var RUMMET = 5.2;

    NK.Stige = function () {
        this.c = 0;
        this.p = 110;
        this.view = { x: 0, y: 0, b: 1, h: 1 };
        this.sporX = 0;
        this.yc = 0;
        this.blink = {};
    };

    var P = NK.Stige.prototype;

    /* Stigen tegnes i hele scenen, ogsaa bag kortet, men det, eleven skal
       se, holdes under fri (kortets bund). */
    P.saetView = function (x, y, b, h, fri) {
        this.view = { x: x, y: y, b: b, h: h };
        this.fri = fri === undefined ? y : fri;
        this.friH = y + h - this.fri;
        /* Stigen staar lidt til venstre for midten: flagene har plads til
           venstre, og de kendte ting har plads til navn og tal til hoejre. */
        this.sporX = Math.round(x + Math.max(250, Math.min(b * 0.44, b - 300)));
        this.yc = this.fri + this.friH * 0.55;
    };

    /* En hoejde i den frie del: 0 er kortets bund, 1 er scenens bund */
    P.friY = function (t) { return this.fri + this.friH * t; };

    P.yAf = function (L) { return this.yc - (L - this.c) * this.p; };
    P.LAf = function (y) { return this.c + (this.yc - y) / this.p; };

    /* p taet paa: plads til ca. 4 tierpotenser i hoejden */
    P.pTaet = function () { return NK.klamp(this.friH / 4.2, 78, 120); };

    /* Kameraet, der viser [Lmin, Lmax] med lidt luft */
    P.overblik = function (Lmin, Lmax) {
        var top = this.fri + 58, bund = this.view.y + this.view.h - 24;
        var p = (bund - top) / Math.max(0.5, Lmax - Lmin);
        var c = Lmin + (bund - this.yc) / p;
        return { c: c, p: p };
    };

    /* Kameraet, der har punktet L i hoejden y */
    P.cFor = function (L, y, p) { return L - (this.yc - y) / p; };

    P.saetKamera = function (k) { this.c = k.c; this.p = k.p; };

    /* ----- Tegning ----------------------------------------------------------- */
    P.tegnBaggrund = function (ctx, tema, tid) {
        var v = this.view, stops = HIMMEL[tema] || HIMMEL.rumfang;
        /* En glidende overgang med et farvestop for hver 20. pixel */
        var g = ctx.createLinearGradient(0, v.y, 0, v.y + v.h);
        var n = Math.max(8, Math.ceil(v.h / 20));
        for (var i = 0; i <= n; i++) {
            g.addColorStop(i / n, rgb(farveAf(stops, this.LAf(v.y + v.h * i / n))));
        }
        ctx.fillStyle = g;
        ctx.fillRect(v.x, v.y, v.b, v.h);
        if (tema !== "laengde") return;
        /* Stjerner der, hvor himlen er sort. De sidder fast paa stigen. */
        var Ltop = this.LAf(v.y), Lbund = this.LAf(v.y + v.h);
        if (Ltop < RUMMET) return;
        var fra = Math.floor(Math.max(Lbund, RUMMET - 1)), til = Math.ceil(Ltop);
        var pr = Math.max(3, Math.round(this.p / 5));
        for (var d = fra; d <= til; d++) {
            for (var j = 0; j < pr; j++) {
                var L = d + hash(d, j);
                if (L < RUMMET) continue;
                var sy = this.yAf(L);
                if (sy < v.y || sy > v.y + v.h) continue;
                var sx = v.x + hash(j, d * 3 + 1) * v.b;
                var lys = NK.klamp((L - RUMMET) / 0.8, 0, 1) * (0.45 + 0.55 * hash(d + 7, j));
                lys *= 0.75 + 0.25 * Math.sin(tid * 2 + j);
                ctx.fillStyle = "rgba(255, 255, 255, " + lys.toFixed(3) + ")";
                ctx.fillRect(sx, sy, hash(j, d) > 0.85 ? 2 : 1.3, hash(j, d) > 0.85 ? 2 : 1.3);
            }
        }
    };

    /* Afstanden mellem to tierpotenser, der har tal paa: 1, 2, 5 eller 10 */
    P.tierTrin = function () {
        var trin = [1, 2, 5, 10];
        for (var i = 0; i < trin.length; i++) if (trin[i] * this.p >= 24) return trin[i];
        return 10;
    };

    P.tegnStige = function (ctx, enhed) {
        var v = this.view, x = this.sporX;
        var Ltop = this.LAf(v.y), Lbund = this.LAf(v.y + v.h);
        var k = this.tierTrin();
        ctx.save();
        /* De to vanger */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 24, v.y); ctx.lineTo(x - 24, v.y + v.h);
        ctx.moveTo(x + 24, v.y); ctx.lineTo(x + 24, v.y + v.h);
        ctx.stroke();
        /* Trinene: ét for hver tierpotens, saa laenge de ikke staar for taet */
        var hvert = this.p >= 10 ? 1 : k;
        for (var d = Math.floor(Lbund); d <= Math.ceil(Ltop); d++) {
            var y = this.yAf(d);
            if (y < v.y - 2 || y > v.y + v.h + 2) continue;
            if (d % hvert === 0) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(x - 24, y); ctx.lineTo(x + 24, y); ctx.stroke();
            }
            if (d % k === 0) {
                NK.tekst(ctx, "10" + NK.haevet(d) + " " + enhed, x - 32, y, {
                    font: "600 13px 'Segoe UI', sans-serif", justering: "right", linje: "middle",
                    farve: "rgba(235, 240, 248, 0.86)", kant: true, kantBredde: 3, kantFarve: "rgba(8, 10, 16, 0.75)"
                });
            }
        }
        ctx.restore();
    };

    /* De kendte ting til hoejre for stigen. Taet paa faar alle navn og
       tal; i overblikket faar de, der ikke kan staa uden at overlappe,
       kun et lille ikon eller ingenting. */
    P.tegnMaerker = function (ctx, maerker, tid, vigtige) {
        var v = this.view, x = this.sporX + 62;
        var s = NK.klamp(this.p * 0.55, 18, 52);
        var mig = this;
        var liste = maerker.map(function (m) {
            return { m: m, y: mig.yAf(log10(m.v)), vigtig: vigtige ? vigtige(m) : 0 };
        }).filter(function (e) { return e.y > v.y - s && e.y < v.y + v.h + s; });
        /* De vigtige foerst, saa de faar pladsen, hvis der er trangt */
        liste.sort(function (a, b) { return b.vigtig - a.vigtig; });
        var ikonY = [], tekstY = [];
        function fri(arr, y, afst) {
            for (var i = 0; i < arr.length; i++) if (Math.abs(arr[i] - y) < afst) return false;
            return true;
        }
        var tegnes = [];
        liste.forEach(function (e) {
            if (!fri(ikonY, e.y, s * 0.8)) return;
            ikonY.push(e.y);
            var navn = fri(tekstY, e.y, 34);
            if (navn) tekstY.push(e.y);
            tegnes.push({ e: e, navn: navn });
        });
        tegnes.forEach(function (t) {
            var e = t.e, m = e.m;
            var b = mig.blink[m.n];
            var glod = b !== undefined ? NK.klamp(1 - (tid - b) / 1.2, 0, 1) : 0;
            /* Den lille streg fra stigen hen til tingen */
            ctx.strokeStyle = "rgba(255, 255, 255, " + (0.22 + glod * 0.6).toFixed(2) + ")";
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(mig.sporX + 26, e.y); ctx.lineTo(x - s / 2 - 4, e.y); ctx.stroke();
            if (glod > 0) {
                ctx.fillStyle = "rgba(255, 223, 107, " + (glod * 0.45).toFixed(3) + ")";
                ctx.beginPath(); ctx.arc(x, e.y, s * (0.62 + (1 - glod) * 0.4), 0, Math.PI * 2); ctx.fill();
            }
            NK.Ikon.tegn(ctx, m.i, x, e.y, s);
            if (!t.navn) return;
            var tx = x + s / 2 + 10;
            var stor = mig.p >= 60;
            NK.tekst(ctx, m.n, tx, e.y + (stor ? -3 : 1), {
                font: "700 " + (stor ? 15 : 13) + "px 'Segoe UI', sans-serif", linje: stor ? "alphabetic" : "middle",
                farve: glod > 0.05 ? "#ffe9a6" : "#ffffff", kant: true, kantBredde: 3.5, kantFarve: "rgba(8, 10, 16, 0.8)"
            });
            if (stor) {
                NK.tekst(ctx, m.vis, tx, e.y + 14, {
                    font: "600 12.5px 'Segoe UI', sans-serif", linje: "alphabetic",
                    farve: "rgba(225, 232, 240, 0.9)", kant: true, kantBredde: 3, kantFarve: "rgba(8, 10, 16, 0.8)"
                });
            }
        });
    };

    /* Soejlen fra ét stk. til toppen, med tingens udseende */
    P.tegnSoejle = function (ctx, fyld, Lfra, Ltop, tid) {
        var v = this.view, x = this.sporX, b = 30;
        var y0 = Math.min(this.yAf(Lfra), v.y + v.h + 20);
        var y1 = Math.max(this.yAf(Ltop), v.y - 20);
        if (y0 - y1 < 1) return;
        ctx.save();
        NK.rundtRekt(ctx, x - b / 2, y1, b, y0 - y1, 5);
        ctx.clip();
        var L0 = x - b / 2, i, y;
        switch (fyld) {
        case "papir":
            ctx.fillStyle = "#f4f0e6"; ctx.fillRect(L0, y1, b, y0 - y1);
            ctx.fillStyle = "rgba(170, 160, 140, 0.55)";
            for (y = y0 - 3; y > y1; y -= 3) ctx.fillRect(L0, y, b, 1);
            break;
        case "tid":
            ctx.fillStyle = vandretG(ctx, L0, b, "#f6d27a", "#c68f22"); ctx.fillRect(L0, y1, b, y0 - y1);
            ctx.fillStyle = "rgba(120, 80, 20, 0.35)";
            for (i = 0; (y0 - i * 5) > y1; i++) ctx.fillRect(L0 + hash(i, 2) * (b - 2), y0 - i * 5, 2, 2);
            break;
        case "vand":
            ctx.fillStyle = vandretG(ctx, L0, b, "#7cc4ff", "#1f6aa8"); ctx.fillRect(L0, y1, b, y0 - y1);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            for (i = 0; i < 40; i++) {
                var by = y0 - ((tid * 40 + i * 37) % Math.max(40, y0 - y1));
                if (by < y1) continue;
                ctx.beginPath(); ctx.arc(L0 + 5 + hash(i, 4) * (b - 10), by, 1.6 + hash(i, 5) * 1.6, 0, Math.PI * 2); ctx.fill();
            }
            break;
        case "kulstof":
            ctx.fillStyle = "#2c3036"; ctx.fillRect(L0, y1, b, y0 - y1);
            for (y = y0 - 13; y > y1 - 13; y -= 24) kugleLille(ctx, x, y, 11, "#b3bac3", "#3a4048");
            break;
        case "fodbold":
            ctx.fillStyle = "#f2f3f5"; ctx.fillRect(L0, y1, b, y0 - y1);
            ctx.fillStyle = "#1e232a";
            for (i = 0; (y0 - i * 12) > y1 - 12; i++) {
                ctx.beginPath(); ctx.arc(L0 + (i % 2 ? 9 : 21), y0 - i * 12 - 6, 3.5, 0, Math.PI * 2); ctx.fill();
            }
            break;
        case "slik":
            ctx.fillStyle = "#2a1a22"; ctx.fillRect(L0, y1, b, y0 - y1);
            var SLIK = ["#e53935", "#fdd835", "#43a047", "#fb8c00", "#ffffff", "#8e24aa"];
            for (i = 0; (y0 - i * 10) > y1 - 10; i++) {
                ctx.fillStyle = SLIK[Math.floor(hash(i, 8) * SLIK.length)];
                ctx.globalAlpha = 0.85;
                ctx.beginPath(); ctx.ellipse(L0 + (i % 2 ? 9 : 21), y0 - i * 10 - 5, 6, 5.5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(L0 + (i % 2 ? 21 : 9), y0 - i * 10 - 3, 4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            break;
        case "sand":
            ctx.fillStyle = vandretG(ctx, L0, b, "#f6dfa4", "#c9a35a"); ctx.fillRect(L0, y1, b, y0 - y1);
            ctx.fillStyle = "rgba(140, 100, 40, 0.4)";
            for (i = 0; (y0 - i * 3) > y1; i++) ctx.fillRect(L0 + hash(i, 12) * (b - 2), y0 - i * 3, 1.6, 1.6);
            break;
        case "muldvarp":
            ctx.fillStyle = vandretG(ctx, L0, b, "#7b6a5c", "#3a2e27"); ctx.fillRect(L0, y1, b, y0 - y1);
            ctx.strokeStyle = "rgba(30, 22, 18, 0.55)";
            ctx.lineWidth = 1;
            for (i = 0; (y0 - i * 6) > y1; i++) {
                var fx = L0 + 3 + hash(i, 6) * (b - 8);
                ctx.beginPath(); ctx.moveTo(fx, y0 - i * 6); ctx.lineTo(fx + 4, y0 - i * 6 - 4); ctx.stroke();
            }
            break;
        default:
            ctx.fillStyle = "#cccccc"; ctx.fillRect(L0, y1, b, y0 - y1);
        }
        /* Lys fra venstre og en moerk kant til hoejre */
        var lys = ctx.createLinearGradient(L0, 0, L0 + b, 0);
        lys.addColorStop(0, "rgba(255, 255, 255, 0.28)");
        lys.addColorStop(0.35, "rgba(255, 255, 255, 0)");
        lys.addColorStop(1, "rgba(0, 0, 0, 0.28)");
        ctx.fillStyle = lys;
        ctx.fillRect(L0, y1, b, y0 - y1);
        ctx.restore();
        NK.rundtRekt(ctx, x - b / 2, y1, b, y0 - y1, 5);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
        ctx.stroke();
    };

    function vandretG(ctx, x, b, a, c) {
        var g = ctx.createLinearGradient(x, 0, x + b, 0);
        g.addColorStop(0, a);
        g.addColorStop(1, c);
        return g;
    }

    function kugleLille(ctx, x, y, r, lys, mork) {
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, lys);
        g.addColorStop(1, mork);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    /* Tingen oeverst paa soejlen og en pille med tallet over den */
    P.tegnTop = function (ctx, ikon, Ltop, pille, farve) {
        var v = this.view, x = this.sporX, y = this.yAf(Ltop);
        if (y < v.y - 60 || y > v.y + v.h + 60) return;
        var s = 40;
        NK.Ikon.tegn(ctx, ikon, x, y - s / 2 + 4, s);
        if (!pille) return;
        ctx.save();
        ctx.font = "800 15px 'Segoe UI', sans-serif";
        var b = NK.tekstBredde(ctx, pille) + 24, h = 28;
        var px = NK.klamp(x - b / 2, v.x + 6, v.x + v.b - b - 6);
        var py = Math.max(v.y + 4, y - s - h - 6);
        NK.rundtRekt(ctx, px, py, b, h, 14);
        ctx.fillStyle = farve === "groen" ? "#17402c" : "#1d2230";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = farve === "groen" ? "#5fcf92" : "rgba(255, 255, 255, 0.55)";
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, pille, px + b / 2, py + h / 2 + 1, {
            font: "800 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: farve === "groen" ? "#c9f5da" : "#ffffff"
        });
    };

    /* Hvor flagene skal staa: hvert flag peger paa sin plads paa stigen,
       men flagene skubbes fra hinanden, saa de ikke overlapper. */
    P.flagPladser = function (svar, hoejde) {
        var v = this.view, mig = this;
        var top = this.fri + 24, bund = v.y + v.h - 20;
        var liste = svar.map(function (s, i) { return { i: i, yRigtig: mig.yAf(log10(s.v)), y: 0, h: hoejde(i) }; });
        liste.forEach(function (e) { e.y = NK.klamp(e.yRigtig, top, bund); });
        liste.sort(function (a, b) { return b.yRigtig - a.yRigtig; });
        function afst(a, b) { return (a.h + b.h) / 2 + 6; }
        /* Nedefra og op: hvert flag over det forrige, saa op- og nedefra igen */
        for (var k = 0; k < 3; k++) {
            for (var i = 1; i < liste.length; i++) {
                if (liste[i - 1].y - liste[i].y < afst(liste[i - 1], liste[i])) liste[i].y = liste[i - 1].y - afst(liste[i - 1], liste[i]);
            }
            for (i = liste.length - 1; i >= 0; i--) {
                if (liste[i].y < top) liste[i].y = top;
                if (i < liste.length - 1 && liste[i].y - liste[i + 1].y < afst(liste[i], liste[i + 1])) liste[i + 1].y = liste[i].y - afst(liste[i], liste[i + 1]);
            }
        }
        var ud = [];
        liste.forEach(function (e) { ud[e.i] = e; });
        return ud;
    };

    /* De fire svar som flag til venstre for stigen.
       tilstand(i) giver: "" (et svar), "valgt", "ret", "forkert", "mat".
       dit er det svar, eleven valgte (-1: intet endnu). ekstra er en
       linje mere under det rigtige svar (1 mol: 6,0 · 10¹⁹ m). */
    P.tegnFlag = function (ctx, svar, tilstand, kunSynlige, dit, ekstra) {
        var v = this.view, mig = this;
        var hoejre = this.sporX - 92;
        var pladser = this.flagPladser(svar, function (i) { return ekstra && tilstand(i) === "ret" ? 50 : 30; });
        var BOGST = ["A", "B", "C", "D"];
        svar.forEach(function (s, i) {
            var p = pladser[i];
            if (kunSynlige && (p.yRigtig < v.y - 10 || p.yRigtig > v.y + v.h + 10)) return;
            var t = tilstand(i);
            var farve = { "": "#f2c53d", valgt: "#f2c53d", ret: "#3fae72", forkert: "#e05446", mat: "#7e8590" }[t];
            var fyld = { "": "rgba(37, 33, 26, 0.92)", valgt: "rgba(78, 64, 20, 0.95)", ret: "rgba(23, 64, 44, 0.95)", forkert: "rgba(70, 26, 22, 0.92)", mat: "rgba(30, 32, 40, 0.85)" }[t];
            ctx.save();
            ctx.font = "700 14px 'Segoe UI', sans-serif";
            var maxB = Math.max(80, hoejre - (v.x + 14) - 40);
            var tekst = s.t;
            while (NK.tekstBredde(ctx, tekst) > maxB && tekst.length > 4) tekst = tekst.slice(0, -2) + "…";
            var linje2 = ekstra && t === "ret" ? ekstra : "";
            var b = NK.tekstBredde(ctx, tekst) + 44, h = linje2 ? 50 : 30;
            if (linje2) {
                ctx.font = "800 14px 'Segoe UI', sans-serif";
                b = Math.max(b, NK.tekstBredde(ctx, linje2) + 24);
            }
            var x = hoejre - b, y = p.y - h / 2;
            /* Stregen fra flaget hen til svarets plads paa stigen */
            ctx.strokeStyle = farve;
            ctx.globalAlpha = t === "mat" ? 0.45 : 0.85;
            ctx.lineWidth = t === "ret" ? 2.5 : 1.6;
            ctx.setLineDash(t === "ret" ? [] : [5, 4]);
            ctx.beginPath();
            ctx.moveTo(hoejre, p.y);
            ctx.lineTo(hoejre + 18, p.y);
            ctx.lineTo(mig.sporX - 26, p.yRigtig);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
            ctx.fillStyle = farve;
            ctx.beginPath(); ctx.arc(mig.sporX - 26, p.yRigtig, t === "ret" ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
            NK.rundtRekt(ctx, x, y, b, h, 8);
            ctx.fillStyle = fyld;
            ctx.fill();
            ctx.lineWidth = t === "valgt" || t === "ret" || t === "forkert" ? 2.5 : 1.6;
            ctx.strokeStyle = farve;
            ctx.stroke();
            var ly = linje2 ? p.y - 10 : p.y;
            ctx.fillStyle = farve;
            ctx.beginPath(); ctx.arc(x + 15, ly, 10, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            NK.tekst(ctx, BOGST[i], x + 15, ly + 1, { font: "800 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: t === "mat" ? "#1d1e26" : (t === "" || t === "valgt" ? "#33290a" : "#ffffff") });
            NK.tekst(ctx, tekst, x + 32, ly + 1, { font: "700 14px 'Segoe UI', sans-serif", linje: "middle", farve: t === "mat" ? "#aab1bb" : "#ffffff" });
            if (linje2) NK.tekst(ctx, linje2, x + 12, p.y + 13, { font: "800 14px 'Segoe UI', sans-serif", linje: "middle", farve: "#9af0c0" });
            if (i === dit && t !== "") {
                NK.tekst(ctx, "Dit gæt", x - 8, p.y + 1, { font: "700 12px 'Segoe UI', sans-serif", justering: "right", linje: "middle", farve: farve, kant: true, kantBredde: 3, kantFarve: "rgba(8, 10, 16, 0.8)" });
            }
        });
    };

    NK.Stige.log10 = log10;
}());

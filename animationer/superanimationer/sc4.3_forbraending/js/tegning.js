/* =====================================================================
   tegning.js - det, begge faner tegner ens

   Kuglemodellerne som i Kemibogens figurer (forbraending-methan,
   propan-afstem-trin og forbraending-flammer): carbon er en moerkegraa
   kugle, oxygen roed og hydrogen hvid og mindre, og hvert atom har sit
   bogstav paa. T.molekyle tegner CO₂, CO, H₂O, O₂, CH₄, alkanerne og en
   klump sod. Desuden bordet, luppens ramme, tavlen, den gule ring og
   det gule skilt fra sc4.6.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    T.GUL = "#f2c53d";
    T.BLAEK = "#1f2430";         /* skriften paa den lyse tavle */

    /* ----- Atomerne -------------------------------------------------------------------
       r er radius for C og O. H er mindre (0,62 r), som i bogens figurer. */
    var ATOM = {
        C: { lys: "#8b929c", mid: "#4b515a", moerk: "#2b2f35", kant: "#1d2025", bogstav: "#ffffff", r: 1 },
        O: { lys: "#f6a08c", mid: "#e0533f", moerk: "#a5301f", kant: "#7d2316", bogstav: "#ffffff", r: 1 },
        H: { lys: "#ffffff", mid: "#e4e8ec", moerk: "#a9b1ba", kant: "#7c8590", bogstav: "#2a3340", r: 0.62 }
    };
    T.ATOM = ATOM;

    T.atom = function (ctx, s, x, y, r, alfa) {
        var a = ATOM[s], rr = r * a.r;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        var g = ctx.createRadialGradient(x - rr * 0.38, y - rr * 0.42, rr * 0.1, x, y, rr);
        g.addColorStop(0, a.lys);
        g.addColorStop(0.55, a.mid);
        g.addColorStop(1, a.moerk);
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = Math.max(0.8, rr * 0.08);
        ctx.strokeStyle = a.kant;
        ctx.stroke();
        if (rr >= 5.5) {
            ctx.font = font("700", Math.round(rr * (s === "H" ? 1.05 : 0.95)));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = a.bogstav;
            ctx.fillText(s, x, y + rr * 0.06);
        }
        ctx.restore();
    };

    /* ----- Molekylernes form ------------------------------------------------------------
       Atomerne i enheder af r, med midten i (0, 0). H staar foerst, saa de
       tegnes bag carbon og oxygen. */
    function kaede(n) {
        var ud = [], i, x0 = -(n - 1) * 1.55 / 2;
        for (i = 0; i < n; i++) {
            ud.push(["H", x0 + i * 1.55, -1.2]);
            ud.push(["H", x0 + i * 1.55, 1.2]);
        }
        ud.push(["H", x0 - 1.25, 0]);
        ud.push(["H", x0 + (n - 1) * 1.55 + 1.25, 0]);
        for (i = 0; i < n; i++) ud.push(["C", x0 + i * 1.55, 0]);
        return ud;
    }

    var FORM = {
        O2: [["O", -0.82, 0], ["O", 0.82, 0]],
        O: [["O", 0, 0]],
        CO2: [["O", -1.62, 0], ["C", 0, 0], ["O", 1.62, 0]],
        CO: [["C", -0.82, 0], ["O", 0.82, 0]],
        H2O: [["H", -0.98, 0.7], ["H", 0.98, 0.7], ["O", 0, -0.12]],
        CH4: [["H", -0.95, -0.95], ["H", 0.95, -0.95], ["H", -0.95, 0.95], ["H", 0.95, 0.95], ["C", 0, 0]],
        C2H6: kaede(2),
        C3H8: kaede(3),
        C5H12: kaede(5),
        sod: [["C", 0, 0], ["C", 1.62, 0], ["C", -1.62, 0], ["C", 0.81, -1.4], ["C", -0.81, -1.4], ["C", 0.81, 1.4], ["C", -0.81, 1.4]]
    };
    T.FORM = FORM;

    /* Molekylets kasse i enheder af r: bredde og hoejde */
    T.kasse = function (type) {
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        FORM[type].forEach(function (a) {
            var rr = ATOM[a[0]].r;
            minX = Math.min(minX, a[1] - rr); maxX = Math.max(maxX, a[1] + rr);
            minY = Math.min(minY, a[2] - rr); maxY = Math.max(maxY, a[2] + rr);
        });
        return { b: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
    };

    /* Et molekyle med midten i (x, y), drejet vink radianer */
    T.molekyle = function (ctx, type, x, y, r, vink, alfa) {
        var form = FORM[type], k = T.kasse(type);
        var c = Math.cos(vink || 0), s = Math.sin(vink || 0);
        var atomer = form.map(function (a) {
            var dx = (a[1] - k.cx) * r, dy = (a[2] - k.cy) * r;
            return { s: a[0], x: x + dx * c - dy * s, y: y + dx * s + dy * c };
        });
        /* H bagest; i sod tegnes de bageste kugler foerst */
        atomer.forEach(function (a) { if (a.s === "H") T.atom(ctx, "H", a.x, a.y, r, alfa); });
        atomer.forEach(function (a) { if (a.s !== "H") T.atom(ctx, a.s, a.x, a.y, r, alfa); });
    };

    /* Et halvt dioxygenmolekyle: ét O-atom og en stiplet ring, hvor det andet
       skulle have siddet (der findes ikke halve molekyler) */
    T.halvO2 = function (ctx, x, y, r, alfa) {
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#c0561b";
        ctx.beginPath();
        ctx.arc(x + 0.82 * r, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        T.atom(ctx, "O", x - 0.82 * r, y, r, alfa);
    };

    /* ----- Det faelles (fra sc4.6) -------------------------------------------------------- */

    /* Bordet: en plade, tingene staar paa, og forkanten ned til scenens bund */
    T.bord = function (ctx, W, y, Hs) {
        ctx.fillStyle = "#3b3e4a";
        ctx.fillRect(0, y, W, 5);
        var g = ctx.createLinearGradient(0, y + 5, 0, Hs);
        g.addColorStop(0, "#262832");
        g.addColorStop(1, "#1d1e26");
        ctx.fillStyle = g;
        ctx.fillRect(0, y + 5, W, Math.max(0, Hs - y - 5));
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(0, y, W, 1);
    };

    /* Rammen om luppens vindue og de to stiplede streger hen til det lille
       felt over flammen, som vinduet viser forstoerret */
    T.zoomRamme = function (ctx, R, fra, fremhaev) {
        ctx.save();
        if (fra) {
            ctx.setLineDash([6, 5]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(214, 160, 20, 0.75)";
            ctx.beginPath();
            ctx.moveTo(fra.x + fra.b, fra.y);
            ctx.lineTo(R.x, R.y + 12);
            ctx.moveTo(fra.x + fra.b, fra.y + fra.h);
            ctx.lineTo(R.x, R.y + R.h - 12);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#c99400";
            ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        }
        if (fremhaev) {
            NK.rundtRekt(ctx, R.x - 4, R.y - 4, R.b + 8, R.h + 8, 15);
            ctx.lineWidth = 6;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.28)";
            ctx.stroke();
        }
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.fillStyle = "#191a22";
        ctx.fill();
        ctx.lineWidth = fremhaev ? 4 : 3;
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#7d6a2c";
        ctx.stroke();
        ctx.restore();
    };

    /* Den lyse tavle, reaktionsskemaet staar paa paa fane 2 */
    T.tavle = function (ctx, R) {
        ctx.save();
        NK.rundtRekt(ctx, R.x + 3, R.y + 5, R.b, R.h, 12);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fill();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.fillStyle = "#f7f4ec";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#cfc8b6";
        ctx.stroke();
        ctx.restore();
    };

    /* En rolig gul ring om det, opgaven eller spoergsmaalet handler om
       (intet indforstaaet). Ringen, der pulserer (T.ring), betyder "brug mig nu".
       farve: en moerkere gul til ringe paa den lyse tavle */
    T.omRing = function (ctx, x, y, b, h, farve) {
        ctx.save();
        NK.rundtRekt(ctx, x - 9, y - 9, b + 18, h + 18, 16);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    T.ring = function (ctx, x, y, b, h, tid, radius) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 4.2);
        ctx.save();
        NK.rundtRekt(ctx, x - 4 - puls * 3, y - 4 - puls * 3, b + 8 + puls * 6, h + 8 + puls * 6, radius || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * puls) + ")";
        ctx.stroke();
        ctx.restore();
    };

    /* Et lille gult skilt med en spids, der peger ned paa tingen */
    T.skilt = function (ctx, tekst, x, y, minX, maxX) {
        ctx.save();
        ctx.font = font("700", 14);
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        var top = y - h;
        NK.rundtRekt(ctx, vx, top, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 1); ctx.lineTo(x + 7, y - 1); ctx.lineTo(x, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, top + h / 2 + 0.5);
        ctx.restore();
        return { x: vx, y: top, b: b, h: h + 8 };
    };

    /* En knap tegnet paa laerredet (Vis luppen, pilene paa tavlen) */
    T.knap = function (ctx, R, tekst, valg) {
        valg = valg || {};
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, valg.radius || 8);
        ctx.fillStyle = valg.bund || (valg.over ? "#3d4152" : "#2d3040");
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = valg.kant || "#5a6074";
        ctx.stroke();
        ctx.font = font(valg.vaegt || "700", valg.px || 14);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valg.farve || "#eef1f5";
        ctx.fillText(tekst, R.x + R.b / 2, R.y + R.h / 2 + 0.5);
        ctx.restore();
    };

    T.inde = function (R, pt, luft) {
        luft = luft || 0;
        return !!R && !!pt && pt.x >= R.x - luft && pt.x <= R.x + R.b + luft && pt.y >= R.y - luft && pt.y <= R.y + R.h + luft;
    };

    /* Den stoerste skrift (mellem stoerst og mindst), hvor teksten kan vaere i bredden b */
    T.passer = function (ctx, tekst, b, vaegt, stoerst, mindst) {
        for (var s = stoerst; s > mindst; s -= 0.5) {
            ctx.font = font(vaegt, s);
            if (ctx.measureText(tekst).width <= b) return s;
        }
        return mindst;
    };

    NK.Tegn = T;
}());

/* =====================================================================
   tegning.js - det, fanerne tegner paa laerredet

   Vaeggen, de to bakker paa fane 1, atomerne som kugler, de tomme
   pladser i produkterne og pilen. Funktionerne tegner én ting et
   bestemt sted og husker intet selv.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Vaeggen (Kemichaels baand tegner gulvet) ---------------------------- */
    T.vaeg = function (ctx, W, bund) {
        var g = ctx.createLinearGradient(0, 0, 0, bund);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1d1f27");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, bund);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, bund);
    };

    /* ----- En bakke med overskrift ----------------------------------------------- */
    T.bakke = function (ctx, r, titel, lys) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        NK.rundtRekt(ctx, r.x + 2, r.y + 4, r.b, r.h, 14);
        ctx.fill();
        var g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
        g.addColorStop(0, "#2d303b");
        g.addColorStop(1, "#262833");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 14);
        ctx.fill();
        ctx.lineWidth = lys ? 2.5 : 1.5;
        ctx.strokeStyle = lys || "#454859";
        ctx.stroke();
        ctx.font = font("700", 13);
        ctx.fillStyle = "#8d93a3";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillText(titel.toUpperCase(), r.x + 14, r.y + 10);
        ctx.restore();
    };

    /* ----- Reaktionspilen mellem bakkerne ----------------------------------------- */
    T.pil = function (ctx, x0, x1, y, farve) {
        ctx.save();
        ctx.strokeStyle = farve || "#8d93a3";
        ctx.fillStyle = farve || "#8d93a3";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1 - 10, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x1 - 16, y - 10);
        ctx.lineTo(x1 - 16, y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* ----- Stemplet, naar reaktionen gik op ---------------------------------------
       u er 0 til 1 og popper det frem; over 1 staar det stille. */
    T.stempel = function (ctx, x, y, tekst, u) {
        var k = NK.klamp(u, 0.05, 1.08);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(k, k);
        ctx.font = font("800", 17);
        var b = ctx.measureText(tekst).width + 30, h = 34;
        ctx.fillStyle = "rgba(20, 44, 32, 0.95)";
        NK.rundtRekt(ctx, -b / 2, -h / 2, b, h, 9);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#5fcf92";
        ctx.stroke();
        ctx.fillStyle = "#8ff0b4";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, 0, 1);
        ctx.restore();
    };

    /* ----- Et atom som kugle ---------------------------------------------------------
       lys: en ring om kuglen (fremhaevet i regnskabet); roed: tilovers */
    T.atom = function (ctx, e, x, y, r, valg) {
        var a = D.ATOM[e] || D.ATOM.H;
        valg = valg || {};
        ctx.save();
        if (valg.alfa !== undefined) ctx.globalAlpha *= valg.alfa;
        if (valg.lys) {
            ctx.beginPath();
            ctx.arc(x, y, r + 3 + valg.lys * 3, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, lysere(a.farve));
        g.addColorStop(1, a.farve);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = a.kant;
        ctx.stroke();
        if (valg.roed) {
            ctx.beginPath();
            ctx.arc(x, y, r + 3, 0, Math.PI * 2);
            ctx.strokeStyle = "#ff6b5c";
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }
        if (r >= 8) {
            ctx.fillStyle = a.tekst;
            ctx.font = font("700", Math.max(9, Math.round(r * (e.length > 1 ? 0.8 : 0.95))));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(e, x, y + r * 0.04);
        }
        ctx.restore();
    };

    /* En tom plads i et produkt: en stiplet ring med symbolet */
    T.plads = function (ctx, e, x, y, r, valg) {
        var a = D.ATOM[e] || D.ATOM.H;
        valg = valg || {};
        ctx.save();
        if (valg.lys) {
            ctx.beginPath();
            ctx.arc(x, y, r + 3 + valg.lys * 3, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = valg.mangler ? "rgba(224, 84, 70, 0.14)" : "rgba(255, 255, 255, 0.035)";
        ctx.fill();
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = valg.mangler ? 2.2 : 1.6;
        ctx.strokeStyle = valg.mangler ? "#ff6b5c" : (valg.spoegelse ? "#5d6272" : a.farve);
        ctx.globalAlpha *= valg.mangler ? 1 : 0.85;
        ctx.stroke();
        ctx.setLineDash([]);
        if (r >= 8) {
            ctx.fillStyle = valg.mangler ? "#ff9d92" : (valg.spoegelse ? "rgba(160, 166, 180, 0.5)" : "rgba(220, 225, 232, 0.7)");
            ctx.font = font("700", Math.max(9, Math.round(r * (e.length > 1 ? 0.75 : 0.9))));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(e, x, y + r * 0.04);
        }
        ctx.restore();
    };

    function lysere(hex) {
        var n = parseInt(hex.slice(1), 16);
        var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        r = Math.round(r + (255 - r) * 0.45);
        g = Math.round(g + (255 - g) * 0.45);
        b = Math.round(b + (255 - b) * 0.45);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    NK.Tegn = T;
}());

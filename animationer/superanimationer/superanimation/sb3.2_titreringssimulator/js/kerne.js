/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sb3.2
   Defineres i det globale objekt NK. Ingen moduler og ingen fetch:
   filen skal ogsaa virke, naar index.html aabnes direkte fra
   harddisken (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* ----- Global tidsstyring ------------------------------------- */
    NK.tid = {
        skala: 1.0       /* 0,5x - 1x - 3x - 10x */
    };

    /* ----- Smaa hjaelpere ------------------------------------------ */
    NK.el = function (id) {
        return document.getElementById(id);
    };

    NK.klamp = function (v, lav, hoej) {
        return v < lav ? lav : (v > hoej ? hoej : v);
    };

    NK.lerp = function (a, b, t) {
        return a + (b - a) * t;
    };

    /* Tal med dansk decimalkomma og tusindtalsseparator. */
    NK.tal = function (v, decimaler) {
        if (!isFinite(v)) return "-";
        if (decimaler === undefined) decimaler = 0;
        var negativ = v < 0;
        var s = Math.abs(v).toFixed(decimaler);
        var dele = s.split(".");
        dele[0] = dele[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return (negativ ? "-" : "") + dele.join(",");
    };

    /* Videnskabelig notation med dansk komma: 1,7·10⁻⁵ */
    var HAEVET = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
    NK.videnskabelig = function (v, decimaler) {
        if (!isFinite(v) || v <= 0) return "-";
        if (decimaler === undefined) decimaler = 1;
        var e = Math.floor(Math.log(v) / Math.LN10);
        var m = v / Math.pow(10, e);
        if (m >= 9.95) { m /= 10; e += 1; }
        var eks = String(e).replace(/./g, function (c) { return HAEVET[c] || c; });
        return NK.tal(m, decimaler) + "·10" + eks;
    };

    /* Laeser et tal skrevet med dansk komma ELLER punktum. */
    NK.laesTal = function (s) {
        if (typeof s === "number") return s;
        s = String(s || "").trim().replace(/\s/g, "").replace(",", ".");
        var v = parseFloat(s);
        return isFinite(v) ? v : NaN;
    };

    /* Paent trin til akser: 1, 2, 5 gange en tierpotens. */
    NK.paenTrin = function (omtrent) {
        if (!(omtrent > 0)) return 1;
        var p = Math.pow(10, Math.floor(Math.log(omtrent) / Math.LN10));
        var n = omtrent / p;
        var trin = n <= 1 ? 1 : (n <= 2 ? 2 : (n <= 5 ? 5 : 10));
        return trin * p;
    };

    /* ----- Tekst-opdatering med cache ------------------------------ */
    var tekstCache = {};
    NK.saetTekst = function (id, tekst) {
        if (tekstCache[id] === tekst) return;
        var e = NK.el(id);
        if (!e) return;
        e.textContent = tekst;
        tekstCache[id] = tekst;
    };

    /* ----- Laerred: canvas med korrekt skarphed paa alle skaerme ----- */
    NK.Laerred = function (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.b = 1;   /* bredde i CSS-pixels */
        this.h = 1;   /* hoejde i CSS-pixels */
        this._dpr = 0;
    };

    NK.Laerred.prototype.tilpas = function () {
        var r = this.canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var b = Math.max(1, Math.round(r.width));
        var h = Math.max(1, Math.round(r.height));
        if (b === this.b && h === this.h && dpr === this._dpr) return false;
        this.b = b;
        this.h = h;
        this._dpr = dpr;
        this.canvas.width = Math.round(b * dpr);
        this.canvas.height = Math.round(h * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
    };

    /* ----- Tegnehjaelpere ------------------------------------------ */
    NK.rundtRekt = function (ctx, x, y, b, h, r) {
        var m = Math.min(r, b / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + m, y);
        ctx.lineTo(x + b - m, y);
        ctx.quadraticCurveTo(x + b, y, x + b, y + m);
        ctx.lineTo(x + b, y + h - m);
        ctx.quadraticCurveTo(x + b, y + h, x + b - m, y + h);
        ctx.lineTo(x + m, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - m);
        ctx.lineTo(x, y + m);
        ctx.quadraticCurveTo(x, y, x + m, y);
        ctx.closePath();
    };

    /* Tekst, evt. med moerk kant saa den kan laeses paa enhver baggrund. */
    NK.tekst = function (ctx, tekst, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = opt.font || "600 13px 'Segoe UI', sans-serif";
        ctx.textAlign = opt.justering || "left";
        ctx.textBaseline = opt.linje || "alphabetic";
        if (opt.kant) {
            ctx.lineWidth = opt.kantBredde || 3.5;
            ctx.strokeStyle = opt.kantFarve || "rgba(10, 10, 16, 0.8)";
            ctx.lineJoin = "round";
            ctx.strokeText(tekst, x, y);
        }
        ctx.fillStyle = opt.farve || "#ffffff";
        ctx.fillText(tekst, x, y);
        ctx.restore();
    };
}());

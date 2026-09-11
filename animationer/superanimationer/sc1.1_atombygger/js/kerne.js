/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sc1.1

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch:
   mappen skal ogsaa virke, naar index.html aabnes direkte fra
   harddisken (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* ----- Global tidsstyring --------------------------------------- */
    /* Der er ingen fartvaelger i denne superanimation - elektronerne
       staar fast, saa alt koerer altid ved normal hastighed. */
    NK.tid = {
        skala: 1.0
    };

    /* ----- Smaa hjaelpere -------------------------------------------- */
    NK.el = function (id) {
        return document.getElementById(id);
    };

    NK.klamp = function (v, lav, hoej) {
        return v < lav ? lav : (v > hoej ? hoej : v);
    };

    NK.lerp = function (a, b, t) {
        return a + (b - a) * t;
    };

    /* Blod bevaegelse mod et maal, uafhaengigt af billedraten. */
    NK.mod = function (nu, maal, hastighed, dt) {
        var t = 1 - Math.exp(-hastighed * dt);
        return nu + (maal - nu) * t;
    };

    /* Tal med dansk decimalkomma. */
    NK.tal = function (v, decimaler) {
        if (!isFinite(v)) return "-";
        if (decimaler === undefined) decimaler = 0;
        var negativ = v < 0;
        var s = Math.abs(v).toFixed(decimaler);
        var dele = s.split(".");
        dele[0] = dele[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return (negativ ? "-" : "") + dele.join(",");
    };

    /* ----- Haevet og saenket skrift ---------------------------------- */
    var HAEVET = {
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        "+": "⁺", "-": "⁻"
    };
    var SAENKET = {
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
        "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
    };

    NK.haevet = function (s) {
        return String(s).split("").map(function (c) { return HAEVET[c] || c; }).join("");
    };

    NK.saenket = function (s) {
        return String(s).split("").map(function (c) { return SAENKET[c] || c; }).join("");
    };

    /* Ladningen som tal, saadan som den staar i bogen: 0, 1+, 2-.
       Det haevede symbol efter et grundstof (Na⁺) er ladningHaevet. */
    NK.ladningstekst = function (q) {
        if (q === 0) return "0";
        return Math.abs(q) + (q > 0 ? "+" : "−");
    };

    /* Samme, men som haevet skrift til brug efter et symbol: Na⁺, O²⁻ */
    NK.ladningHaevet = function (q) {
        if (q === 0) return "";
        var stoerrelse = Math.abs(q);
        return (stoerrelse === 1 ? "" : NK.haevet(stoerrelse)) + (q > 0 ? "⁺" : "⁻");
    };

    /* ----- Tekst-opdatering med cache -------------------------------- */
    var tekstCache = {};
    NK.saetTekst = function (id, tekst) {
        if (tekstCache[id] === tekst) return;
        var e = NK.el(id);
        if (!e) return;
        e.textContent = tekst;
        tekstCache[id] = tekst;
    };

    var klasseCache = {};
    NK.saetKlasse = function (id, klasse) {
        if (klasseCache[id] === klasse) return;
        var e = NK.el(id);
        if (!e) return;
        e.className = klasse;
        klasseCache[id] = klasse;
    };

    /* ----- Laerred: canvas med korrekt skarphed paa alle skaerme ------ */
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

    NK.Laerred.prototype.ryd = function (farve) {
        var c = this.ctx;
        c.clearRect(0, 0, this.b, this.h);
        if (farve) {
            c.fillStyle = farve;
            c.fillRect(0, 0, this.b, this.h);
        }
    };

    /* ----- Tegnehjaelpere -------------------------------------------- */
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
            ctx.strokeStyle = opt.kantFarve || "rgba(10, 10, 16, 0.85)";
            ctx.lineJoin = "round";
            ctx.strokeText(tekst, x, y);
        }
        ctx.fillStyle = opt.farve || "#ffffff";
        ctx.fillText(tekst, x, y);
        ctx.restore();
    };

    /* Et lille skaer omkring en partikel - bruges baade om kernen og
       om de enkelte elektroner. */
    NK.skaer = function (ctx, x, y, r, farve, styrke) {
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, farve);
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.globalAlpha = styrke === undefined ? 1 : styrke;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    };
}());

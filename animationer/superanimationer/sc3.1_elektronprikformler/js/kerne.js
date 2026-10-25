/* =====================================================================
   kerne.js - faelles hjaelpefunktioner (som sb4.4)

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch:
   mappen skal ogsaa virke, naar index.html aabnes direkte fra
   harddisken (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

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

    /* S-kurve paa tallet 0-1: glidende start og stop. */
    NK.blod = function (t) {
        t = NK.klamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    };

    NK.r = function (a, b) {
        return a + Math.random() * (b - a);
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

    /* ----- Hukommelse i browseren -------------------------------------
       Kun til elevens egne bekvemmeligheder (loeste molekyler og
       stjerner). Kan localStorage ikke bruges, virker alt andet stadig. */
    NK.hent = function (noegle, standard) {
        try {
            var s = window.localStorage.getItem(noegle);
            return s ? JSON.parse(s) : standard;
        } catch (e) {
            return standard;
        }
    };

    NK.gem = function (noegle, vaerdi) {
        try { window.localStorage.setItem(noegle, JSON.stringify(vaerdi)); } catch (e) { /* ingen hukommelse */ }
    };

    /* ----- Tekst-opdatering med cache -------------------------------- */
    /* Kaldes gerne hvert billede - DOM'en roeres kun, naar teksten
       faktisk skifter. */
    var tekstCache = {};
    NK.saetTekst = function (id, tekst) {
        if (tekstCache[id] === tekst) return;
        var e = NK.el(id);
        if (!e) return;
        e.textContent = tekst;
        tekstCache[id] = tekst;
    };

    var htmlCache = {};
    NK.saetHTML = function (id, html) {
        if (htmlCache[id] === html) return;
        var e = NK.el(id);
        if (!e) return;
        e.innerHTML = html;
        htmlCache[id] = html;
    };

    /* Tekst, der skal ind i innerHTML, uden at < og & driller. */
    NK.html = function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    /* Stort begyndelsesbogstav: "oxygen" -> "Oxygen" */
    NK.stort = function (s) {
        s = String(s);
        return s.charAt(0).toUpperCase() + s.slice(1);
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

    /* Musens plads i laerredets egne koordinater. */
    NK.Laerred.prototype.punkt = function (e) {
        var r = this.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    /* ----- Tegnehjaelpere -------------------------------------------- */
    NK.rundtRekt = function (ctx, x, y, b, h, r) {
        var m = Math.max(0, Math.min(r, b / 2, h / 2));
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
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
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
}());

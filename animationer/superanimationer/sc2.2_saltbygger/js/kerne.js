/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sc2.2

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch:
   mappen skal ogsaa virke, naar index.html aabnes direkte fra
   harddisken (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* ----- Global tidsstyring --------------------------------------- */
    NK.tid = { skala: 1.0 };

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

    /* Stoerste faelles divisor - bruges til at forkorte forhold. */
    NK.gcd = function (a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { var t = a % b; a = b; b = t; }
        return a;
    };

    NK.tilfaeldig = function (liste) {
        return liste[Math.floor(Math.random() * liste.length)];
    };

    /* En blandet kopi af listen (Fisher-Yates). */
    NK.bland = function (liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
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

    /* Ladningen som tal, saadan som den staar i bogen: 0, 1+, 2- */
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

    /* Samlet ladning med fortegn foran: +2, −1, 0 */
    NK.fortegn = function (q) {
        if (q === 0) return "0";
        return (q > 0 ? "+" : "−") + Math.abs(q);
    };

    /* ----- Tekst-opdatering med cache -------------------------------- */
    /* Kaldes gerne hvert billede - DOM'en roeres kun, naar teksten
       faktisk skifter. Brug samme funktion til samme element hele
       tiden, ellers passer cachen ikke. */
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

    /* Flere tekststykker i hver sin farve, samlet centreret om x.
       dele: [{ t: "2 Na⁺", farve: "#f39a8f" }, { t: " + " }, ...] */
    NK.tekstDele = function (ctx, dele, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = opt.font || "600 16px 'Segoe UI', sans-serif";
        ctx.textBaseline = opt.linje || "middle";
        ctx.textAlign = "left";
        var i, bredde = 0;
        for (i = 0; i < dele.length; i++) bredde += ctx.measureText(dele[i].t).width;
        var cx = x - bredde / 2;
        for (i = 0; i < dele.length; i++) {
            if (opt.kant) {
                ctx.lineWidth = opt.kantBredde || 4;
                ctx.strokeStyle = "rgba(10, 10, 16, 0.9)";
                ctx.lineJoin = "round";
                ctx.strokeText(dele[i].t, cx, y);
            }
            ctx.fillStyle = dele[i].farve || opt.farve || "#f2f3f5";
            ctx.fillText(dele[i].t, cx, y);
            cx += ctx.measureText(dele[i].t).width;
        }
        ctx.restore();
        return bredde;
    };

    /* Et ladningsmaerke: en lille cirkel med et plus eller et minus,
       tegnet som streger, saa det er skarpt i alle stoerrelser. */
    NK.ladningsprik = function (ctx, x, y, r, positiv, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha === undefined ? 1 : alpha;
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        if (positiv) { g.addColorStop(0, "#ff9a8c"); g.addColorStop(1, "#c63b2e"); }
        else { g.addColorStop(0, "#8fd0ff"); g.addColorStop(1, "#1f6fae"); }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1.6, r * 0.24);
        ctx.lineCap = "round";
        var a = r * 0.5;
        ctx.beginPath();
        ctx.moveTo(x - a, y);
        ctx.lineTo(x + a, y);
        if (positiv) {
            ctx.moveTo(x, y - a);
            ctx.lineTo(x, y + a);
        }
        ctx.stroke();
        ctx.restore();
    };
}());

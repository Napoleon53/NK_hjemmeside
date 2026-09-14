/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sc2.5

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch:
   mappen skal ogsaa virke, naar index.html aabnes direkte fra
   harddisken (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    NK.el = function (id) {
        return document.getElementById(id);
    };

    NK.klamp = function (v, lav, hoej) {
        return v < lav ? lav : (v > hoej ? hoej : v);
    };

    NK.lerp = function (a, b, t) {
        return a + (b - a) * t;
    };

    /* S-kurve paa tallet 0-1: glidende start og stop. */
    NK.blod = function (t) {
        t = NK.klamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    };

    /* Blod bevaegelse mod et maal, uafhaengigt af billedraten. */
    NK.mod = function (nu, maal, hastighed, dt) {
        return nu + (maal - nu) * (1 - Math.exp(-hastighed * dt));
    };

    NK.gcd = function (a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { var t = a % b; a = b; b = t; }
        return a;
    };

    NK.bland = function (liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };

    /* Tilfaeldige tal, der altid er de samme for den samme kerne, saa
       bundfaldet i et felt ikke flimrer fra billede til billede. */
    NK.froe = function (kerne) {
        var s = (kerne * 9301 + 49297) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    };

    /* ----- Haevet og saenket skrift ---------------------------------- */
    var HAEVET = {
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
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

    /* Ladningen som haevet skrift efter et symbol: Na⁺, SO₄²⁻.
       En ion med ladning 1 faar kun fortegnet, aldrig "1+". */
    NK.ladningHaevet = function (q) {
        if (q === 0) return "";
        var stoerrelse = Math.abs(q);
        return (stoerrelse === 1 ? "" : NK.haevet(stoerrelse)) + (q > 0 ? "⁺" : "⁻");
    };

    /* Samlet ladning med fortegn foran: +3, −2, 0 */
    NK.fortegn = function (q) {
        if (q === 0) return "0";
        return (q > 0 ? "+" : "−") + Math.abs(q);
    };

    /* ----- DOM-opdatering med cache ----------------------------------- */
    var tekstCache = {};
    NK.saetTekst = function (id, tekst) {
        if (tekstCache[id] === tekst) return;
        var e = NK.el(id);
        if (!e) return;
        e.textContent = tekst;
        tekstCache[id] = tekst;
    };

    /* ----- Laerred: canvas med korrekt skarphed paa alle skaerme ------ */
    NK.Laerred = function (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.b = 1;
        this.h = 1;
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

    /* Glemmer stoerrelsen, saa naeste tilpas() saetter laerredet op paa ny.
       Det nulstiller ogsaa alt, hvad der er gemt med save() og clip(). */
    NK.Laerred.prototype.nulstil = function () {
        this._dpr = 0;
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

    /* Tekst, evt. med moerk kant, saa den kan laeses paa enhver baggrund.
       opt.maks: teksten skrumper, til den kan vaere i den bredde. */
    NK.tekst = function (ctx, tekst, x, y, opt) {
        opt = opt || {};
        ctx.save();
        var str = opt.str || 13;
        var vaegt = opt.vaegt || 600;
        ctx.font = vaegt + " " + str + "px 'Segoe UI', sans-serif";
        if (opt.maks) {
            while (str > 7 && ctx.measureText(tekst).width > opt.maks) {
                str -= 0.5;
                ctx.font = vaegt + " " + str + "px 'Segoe UI', sans-serif";
            }
        }
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

    /* Et blødt lysskaer. */
    NK.skaer = function (ctx, x, y, r, farve, styrke) {
        if (r <= 0) return;
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, farve);
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.save();
        ctx.globalAlpha = styrke === undefined ? 1 : styrke;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    NK.rgba = function (rgb, a) {
        return "rgba(" + Math.round(rgb[0]) + ", " + Math.round(rgb[1]) + ", " + Math.round(rgb[2]) + ", " + a + ")";
    };
}());

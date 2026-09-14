/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sc2.6

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

    NK.r = function (a, b) {
        return a + Math.random() * (b - a);
    };

    NK.bland = function (liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };

    /* ----- Kemisk notation ------------------------------------------- */
    var HAEVET = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "−": "⁻" };
    var SAENKET = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };

    NK.haevet = function (s) {
        return String(s).split("").map(function (c) { return HAEVET[c] || c; }).join("");
    };

    NK.saenket = function (s) {
        return String(s).split("").map(function (c) { return SAENKET[c] || c; }).join("");
    };

    /* Ladningen, som den staar i bogen: 0, +, 2−.
       En ion med ladning 1 hedder ikke "1+", men bare "+". */
    NK.ladningstekst = function (q) {
        if (q === 0) return "0";
        var stoerrelse = Math.abs(q);
        return (stoerrelse === 1 ? "" : stoerrelse) + (q > 0 ? "+" : "−");
    };

    /* Samme, men haevet til brug efter et symbol: Ag⁺, Cu²⁺ */
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

    /* ----- Farver ------------------------------------------------------ */
    NK.blandFarve = function (a, b, t) {
        t = NK.klamp(t, 0, 1);
        return {
            r: NK.lerp(a.r, b.r, t),
            g: NK.lerp(a.g, b.g, t),
            b: NK.lerp(a.b, b.b, t),
            a: NK.lerp(a.a === undefined ? 1 : a.a, b.a === undefined ? 1 : b.a, t)
        };
    };

    NK.css = function (f, alfa) {
        var a = (f.a === undefined ? 1 : f.a) * (alfa === undefined ? 1 : alfa);
        return "rgba(" + Math.round(f.r) + ", " + Math.round(f.g) + ", " + Math.round(f.b) + ", " + a.toFixed(3) + ")";
    };

    /* ----- Positurer ------------------------------------------------------
       En positur er { x, y, v }: hvor ankerpunktet staar paa tegnebordet,
       og hvor meget genstanden er drejet om det. */
    NK.tilVerden = function (p, anker, lx, ly) {
        var c = Math.cos(p.v), s = Math.sin(p.v);
        var dx = lx - anker.x, dy = ly - anker.y;
        return { x: p.x + dx * c - dy * s, y: p.y + dx * s + dy * c };
    };

    NK.tilLokal = function (p, anker, wx, wy) {
        var c = Math.cos(-p.v), s = Math.sin(-p.v);
        var dx = wx - p.x, dy = wy - p.y;
        return { x: dx * c - dy * s + anker.x, y: dx * s + dy * c + anker.y };
    };

    /* ----- Polygoner og vaeskeniveau ---------------------------------- */
    NK.polyAreal = function (pts) {
        var a = 0;
        for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            a += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
        }
        return Math.abs(a / 2);
    };

    /* Den del af polygonen, der ligger under linjen y (stoerre y). */
    NK.klipUnder = function (pts, y) {
        var ud = [];
        for (var i = 0; i < pts.length; i++) {
            var a = pts[i], b = pts[(i + 1) % pts.length];
            var aInde = a.y >= y, bInde = b.y >= y;
            if (aInde) ud.push(a);
            if (aInde !== bInde) {
                var t = (y - a.y) / (b.y - a.y);
                ud.push({ x: a.x + (b.x - a.x) * t, y: y });
            }
        }
        return ud;
    };

    /* Vandret vaeskeoverflade: den hoejde paa tegnebordet, hvor netop
       arealet 'areal' af beholderens inderside ligger under overfladen.
       Virker for enhver haeldning, saa vaesken altid lægger sig vandret. */
    NK.vaeskeNiveau = function (verdenPts, areal) {
        var lav = Infinity, hoej = -Infinity;
        for (var i = 0; i < verdenPts.length; i++) {
            lav = Math.min(lav, verdenPts[i].y);
            hoej = Math.max(hoej, verdenPts[i].y);
        }
        if (areal <= 0) return hoej;
        var a = lav, b = hoej;
        for (var n = 0; n < 18; n++) {
            var m = (a + b) / 2;
            if (NK.polyAreal(NK.klipUnder(verdenPts, m)) > areal) a = m; else b = m;
        }
        return (a + b) / 2;
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

    NK.polySti = function (ctx, pts) {
        ctx.beginPath();
        for (var i = 0; i < pts.length; i++) {
            if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
            else ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();
    };

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

    NK.kugle = function (ctx, x, y, r, lys, moerk) {
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, lys);
        g.addColorStop(1, moerk);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    };
}());

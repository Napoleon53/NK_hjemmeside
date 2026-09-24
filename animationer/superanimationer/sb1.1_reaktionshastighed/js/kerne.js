/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sb1.1

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch:
   mappen skal ogsaa virke, naar index.html aabnes direkte fra
   harddisken (file://). Samme kerne som sc2.4 plus talformatering.
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

    /* Blod S-kurve fra 0 til 1. */
    NK.blod = function (t) {
        t = NK.klamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    };

    /* Tilfaeldighed gaar altid gennem NK.tilf, saa selvtesten kan
       udskifte den med en fast talraekke. */
    NK.tilf = function () {
        return Math.random();
    };

    NK.gcd = function (a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { var t = b; b = a % b; a = t; }
        return a || 1;
    };

    /* Blander en kopi af listen. */
    NK.bland = function (liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(NK.tilf() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };

    NK.tilfaeldig = function (liste) {
        return liste[Math.floor(NK.tilf() * liste.length)];
    };

    /* ----- Til Kemichael (../../v2/kemichael/kemichael.js) ------------- */
    /* Blod bevaegelse mod et maal, uafhaengigt af billedraten. */
    NK.mod = function (nu, maal, hastighed, dt) {
        return nu + (maal - nu) * (1 - Math.exp(-hastighed * dt));
    };

    NK.r = function (a, b) {
        return a + Math.random() * (b - a);
    };

    /* En positur er { x, y, v }: hvor ankerpunktet staar, og hvor meget
       genstanden er drejet om det. */
    NK.tilVerden = function (p, anker, lx, ly) {
        var c = Math.cos(p.v), s = Math.sin(p.v);
        var dx = lx - anker.x, dy = ly - anker.y;
        return { x: p.x + dx * c - dy * s, y: p.y + dx * s + dy * c };
    };

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

    /* Hukommelse i browseren: kun til, om Kemichael har praesenteret en
       fane. Kan localStorage ikke bruges, virker alt andet stadig. */
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

    /* DOM'en roeres kun, naar indholdet faktisk skifter, saa de kan
       kaldes i hvert billede. */
    NK.saetTekst = function (id, tekst) {
        var e = NK.el(id);
        if (e && e.textContent !== tekst) e.textContent = tekst;
    };

    NK.saetHTML = function (id, html) {
        var e = NK.el(id);
        if (e && e.__html !== html) { e.innerHTML = html; e.__html = html; }
    };

    NK.saetKlasse = function (id, klasse) {
        var e = NK.el(id);
        if (e && e.className !== klasse) e.className = klasse;
    };

    /* Goer tekst sikker at saette ind som HTML. */
    NK.html = function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };

    /* ----- Haevet og saenket skrift ---------------------------------- */
    var HAEVET = {
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        "+": "⁺", "-": "⁻", "−": "⁻"
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

    /* ----- Tal med dansk komma ----------------------------------------- */
    /* Et tal med et fast antal decimaler: 0,25. Minus er et rigtigt minus. */
    NK.tal = function (v, dec) {
        var s = Math.abs(v).toFixed(dec === undefined ? 2 : dec).replace(".", ",");
        return (v < 0 && parseFloat(s.replace(",", ".")) !== 0 ? "−" : "") + s;
    };

    /* Et tal i videnskabelig notation med et antal betydende cifre:
       1,1·10⁻⁵. Tal mellem 0,1 og 1000 skrives uden tierpotens. */
    NK.sci = function (v, cifre) {
        cifre = cifre || 2;
        if (v === 0 || !isFinite(v)) return "0";
        var a = Math.abs(v);
        var e = Math.floor(Math.log10(a));
        var m = a / Math.pow(10, e);
        /* Afrundingen kan give 10,0: saa en tierpotens mere */
        if (parseFloat(m.toFixed(cifre - 1)) >= 10) { m /= 10; e += 1; }
        var fortegn = v < 0 ? "−" : "";
        if (e >= -1 && e <= 2) {
            var dec = Math.max(0, cifre - 1 - e);
            return fortegn + a.toFixed(dec).replace(".", ",");
        }
        return fortegn + m.toFixed(cifre - 1).replace(".", ",") + "·10" + NK.haevet(String(e).replace("-", "−"));
    };

    /* Faktoren mellem to tal skrevet kort: 2, 4, 9, 1,5 */
    NK.faktor = function (f) {
        var r = Math.round(f);
        if (Math.abs(f - r) < 0.03 * Math.max(1, r)) return String(r);
        return NK.tal(f, 1);
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

    NK.Laerred.prototype.ryd = function () {
        this.ctx.clearRect(0, 0, this.b, this.h);
    };

    /* Musens plads i laerredets egne koordinater. */
    NK.Laerred.prototype.punkt = function (e) {
        var r = this.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    /* Tekst, evt. med moerk kant, saa den kan laeses paa enhver baggrund. */
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

    /* En runding paa pladsen (x, y), som man kan traekke i. */
    NK.greb = function (ctx, x, y, farve, aktiv) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, aktiv ? 9 : 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#14141a";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = farve;
        ctx.stroke();
        if (aktiv) {
            ctx.beginPath();
            ctx.arc(x, y, 14, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.55)";
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Paene tal til akser: 1, 2 eller 5 gange en tierpotens. */
    NK.paentTrin = function (spaend, antal) {
        var raa = spaend / Math.max(1, antal);
        var e = Math.pow(10, Math.floor(Math.log10(raa)));
        var m = raa / e;
        return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
    };
}());

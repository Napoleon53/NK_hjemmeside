/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sb2.0
   Defineres i det globale objekt NK, saa alle sim-filer kan bruge dem.
   Ingen moduler og ingen fetch: filen skal ogsaa virke, naar index.html
   aabnes direkte fra harddisken (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* ----- Global tidsstyring ------------------------------------- */
    NK.tid = {
        skala: 1.0,      // 0,5x - 1x - 3x
        pause: false
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

    /* Traekker en vaerdi blidt mod et maal - uafhaengigt af billedrate. */
    NK.mod = function (nuvaerende, maal, hastighed, dt) {
        return nuvaerende + (maal - nuvaerende) * (1 - Math.exp(-hastighed * dt));
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

    /* Deterministisk pseudo-tilfaeldig generator, saa fx traeer og huse
       staar samme sted hver gang i stedet for at flimre. */
    NK.froe = function (start) {
        var s = start >>> 0;
        return function () {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
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

    /* ----- Lærred: canvas med korrekt skarphed paa alle skaerme ----- */
    NK.Laerred = function (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.b = 1;   // bredde i CSS-pixels
        this.h = 1;   // hoejde i CSS-pixels
        this._dpr = 0;
    };

    /* Tilpasser bufferen til elementets faktiske stoerrelse ganget med
       skaermens pixelforhold. Returnerer true hvis noget aendrede sig. */
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
        // Alt tegnearbejde sker herefter i CSS-pixels.
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

    /* Tekst med moerk kant, saa den kan laeses paa enhver baggrund. */
    NK.tekst = function (ctx, tekst, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = opt.font || "600 13px 'Segoe UI', sans-serif";
        ctx.textAlign = opt.justering || "left";
        ctx.textBaseline = opt.linje || "alphabetic";
        if (opt.kant !== false) {
            ctx.lineWidth = opt.kantBredde || 3.5;
            ctx.strokeStyle = opt.kantFarve || "rgba(10, 10, 16, 0.75)";
            ctx.lineJoin = "round";
            ctx.strokeText(tekst, x, y);
        }
        ctx.fillStyle = opt.farve || "#ffffff";
        ctx.fillText(tekst, x, y);
        ctx.restore();
    };

    /* ----- Hastighedsmaalere (bjaelkerne i sidepanelet) ------------- */
    NK.saetMaaler = function (idFyld, idVaerdi, vaerdi, maks, decimaler, enhed) {
        var f = NK.el(idFyld);
        if (f) f.style.width = (NK.klamp(vaerdi / (maks || 1), 0, 1) * 100).toFixed(1) + "%";
        NK.saetTekst(idVaerdi, NK.tal(vaerdi, decimaler) + (enhed ? " " + enhed : ""));
    };

    /* ----- Y mod K -------------------------------------------------
       Markoeren placeres logaritmisk: K ligger altid midt i sporet, og
       hver halvdel daekker en faktor 10. Saa virker den bade for K = 0,02
       og K = 40 uden at markoeren klistrer til kanten. */
    NK.saetYK = function (idMaerke, idY, idK, Y, K, decimaler) {
        var brok;
        if (!isFinite(Y) || Y <= 0) brok = 0;
        else if (!isFinite(K) || K <= 0) brok = 1;
        else brok = 0.5 + 0.5 * NK.klamp(Math.log(Y / K) / Math.LN10, -1, 1);

        var m = NK.el(idMaerke);
        if (m) m.style.left = (brok * 100).toFixed(1) + "%";

        if (idY) NK.saetTekst(idY, isFinite(Y) ? NK.tal(Y, decimaler) : "-");
        if (idK) NK.saetTekst(idK, NK.tal(K, decimaler));
    };

    /* ----- Ligevaegtsmaerkat ---------------------------------------
       Taender naar de to hastigheder er inden for et par procent af
       hinanden - altsaa naar frem og tilbage koerer lige hurtigt. */
    NK.saetBadge = function (id, vFrem, vTilbage, tolerance) {
        var stoerst = Math.max(vFrem, vTilbage);
        var ligevaegt = stoerst > 1e-9 &&
            Math.abs(vFrem - vTilbage) / stoerst < (tolerance || 0.05);
        var e = NK.el(id);
        if (e) e.classList.toggle("aktiv", ligevaegt);
        return ligevaegt;
    };
}());

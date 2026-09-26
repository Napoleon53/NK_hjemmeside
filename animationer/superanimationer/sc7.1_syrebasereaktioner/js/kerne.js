/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sc7.1 (samme fil som i
   sc6.6, sc6.1 og sc4.2; potensform og betydende cifre bruges ikke her)

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

    /* S-kurve paa tallet 0-1: glidende start og stop. */
    NK.blod = function (t) {
        t = NK.klamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    };

    /* Kommer lidt for langt og falder tilbage: til ting, der popper frem. */
    NK.pop = function (t) {
        t = NK.klamp(t, 0, 1);
        var c = 1.70158, u = t - 1;
        return 1 + (c + 1) * u * u * u + c * u * u;
    };

    NK.r = function (a, b) {
        return a + Math.random() * (b - a);
    };

    /* ----- Positurer (bruges af ../../v2/kemichael/kemichael.js) --------------
       En positur er { x, y, v }: hvor ankerpunktet staar, og hvor meget
       genstanden er drejet om det. */
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

    /* En formel med almindelige tal, fx "Al2(SO4)3", skrevet med
       saenkede tal: Al₂(SO₄)₃ */
    NK.formel = function (s) {
        return String(s).replace(/\d+/g, function (m) { return NK.saenket(m); });
    };

    /* Ladningen som haevet skrift efter et symbol. En ladning paa 1
       skrives kun med fortegnet, som i bogen: Na⁺, O²⁻, aldrig Na¹⁺ */
    NK.ladningHaevet = function (q) {
        if (q === 0) return "";
        var stoerrelse = Math.abs(q);
        return (stoerrelse === 1 ? "" : NK.haevet(stoerrelse)) + (q > 0 ? "⁺" : "⁻");
    };

    /* Samme ladning skrevet som almindelig tekst: 3+, 2−, + og − */
    NK.ladningstekst = function (q) {
        if (q === 0) return "0";
        var stoerrelse = Math.abs(q);
        return (stoerrelse === 1 ? "" : String(stoerrelse)) + (q > 0 ? "+" : "−");
    };

    /* En samlet ladning med fortegn foran: +6, −6, 0 */
    NK.fortegn = function (q) {
        if (q === 0) return "0";
        return (q > 0 ? "+" : "−") + Math.abs(q);
    };

    /* ----- Indtastning: det, eleven skriver, lavet om til ASCII -------
       Saa kan man skrive baade "SO42-", "SO₄²⁻" og "SO4 2−". */
    var TIL_ASCII = {
        "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
        "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
        "⁺": "+", "⁻": "-", "−": "-", "–": "-", "—": "-", "‐": "-", "＋": "+"
    };

    NK.ascii = function (s) {
        return String(s || "").split("").map(function (c) { return TIL_ASCII[c] || c; }).join("");
    };

    /* ----- Hukommelse i browseren -------------------------------------
       Kun til elevens egne bekvemmeligheder (loeste glas, rekorden).
       Kan localStorage ikke bruges, virker alt andet stadig. */
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

    /* Tekst, der skal ind i innerHTML, uden at < og & driller. */
    NK.html = function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

    /* Den stoerste skrift (i px), hvor teksten kan vaere i bredden b.
       Skriften bliver sat paa ctx, saa den kan bruges med det samme. */
    NK.passendeSkrift = function (ctx, tekst, b, stoerst, mindst, vaegt) {
        var s = stoerst;
        vaegt = vaegt || "600";
        while (s > mindst) {
            ctx.font = vaegt + " " + s + "px 'Segoe UI', sans-serif";
            if (ctx.measureText(tekst).width <= b) break;
            s -= 0.5;
        }
        ctx.font = vaegt + " " + s + "px 'Segoe UI', sans-serif";
        return s;
    };

    /* ----- Tal med dansk komma -------------------------------------------
       Masserne regnes i hundrededele (heltal), saa 2 · 1,01 + 16,00 giver
       praecis 18,02 og aldrig 18,019999. */
    NK.komma = function (hundrededele) {
        var n = Math.round(hundrededele);
        var fortegn = n < 0 ? "−" : "";
        n = Math.abs(n);
        var hel = Math.floor(n / 100), rest = n % 100;
        return fortegn + hel + "," + (rest < 10 ? "0" : "") + rest;
    };

    /* Et kommatal med to decimaler, fx 0.8 -> "0,80" */
    NK.tal2 = function (v) {
        return NK.komma(Math.round(v * 100));
    };

    /* Afrunding, hvor 1,505 bliver til 1,51 og ikke 1,50, selv om
       kommatallet i maskinen er 1,50499999... */
    function rund(v) {
        return Math.round(v * (1 + 1e-12));
    }

    function eksponent(v) {
        return Math.floor(Math.log(Math.abs(v)) / Math.LN10 + 1e-12);
    }

    /* Et tal i potensform med dansk komma: 1,81 · 10²⁴ */
    NK.potens = function (v, cifre) {
        cifre = cifre || 3;
        if (!v) return "0";
        var e = eksponent(v);
        var f = Math.pow(10, cifre - 1);
        var m = rund(v / Math.pow(10, e) * f) / f;
        if (Math.abs(m) >= 10) { m /= 10; e++; }
        return m.toFixed(cifre - 1).replace(".", ",") + " · 10" + NK.haevet(e);
    };

    /* Et tal med cifre betydende cifre (standard 3), uden potens:
       15,8875 -> "15,9", 196,97 -> "197", 0,0500 -> "0,0500" */
    NK.betydende = function (v, cifre) {
        cifre = cifre || 3;
        if (!v) return "0";
        var e = eksponent(v);
        var dec = cifre - 1 - e;
        if (dec >= 0) {
            var r = rund(v * Math.pow(10, dec)) / Math.pow(10, dec);
            /* 9,996 bliver til 10,0 og har saa et ciffer for meget */
            if (eksponent(r) > e && dec > 0) dec--;
            return r.toFixed(dec).replace(".", ",");
        }
        var g = Math.pow(10, -dec);
        return String(rund(v / g) * g);
    };
}());

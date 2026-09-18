/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for sc3.2

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
        return nu + (maal - nu) * (1 - Math.exp(-hastighed * dt));
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

    /* ----- Kemisk notation ------------------------------------------- */
    var SAENKET = {
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
        "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
    };

    NK.saenket = function (s) {
        return String(s).split("").map(function (c) { return SAENKET[c] || c; }).join("");
    };

    /* "CH3Cl" -> "CH₃Cl" */
    NK.formel = function (s) {
        return String(s).replace(/\d+/g, function (m) { return NK.saenket(m); });
    };

    /* Tal med dansk decimalkomma. */
    NK.tal = function (v, decimaler) {
        if (!isFinite(v)) return "-";
        var negativ = v < 0;
        var s = Math.abs(v).toFixed(decimaler || 0);
        return (negativ ? "−" : "") + s.replace(".", ",");
    };

    /* En vinkel afrundet til naermeste halve grad: 109,5°, 107°, 180° */
    NK.grader = function (v) {
        var r = Math.round(v * 2) / 2;
        return NK.tal(r, r % 1 ? 1 : 0) + "°";
    };

    /* ----- Tekst-opdatering med cache -------------------------------- */
    /* Kaldes gerne hvert billede. DOM'en roeres kun, naar teksten
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

    var klasseCache = {};
    NK.saetKlasse = function (id, klasse) {
        if (klasseCache[id] === klasse) return;
        var e = NK.el(id);
        if (!e) return;
        e.className = klasse;
        klasseCache[id] = klasse;
    };

    /* ----- Vektorer i rummet: [x, y, z] -------------------------------
       x mod hoejre, y opad, z ud mod beskueren. */
    var V = {
        plus: function (a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
        minus: function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
        gange: function (a, k) { return [a[0] * k, a[1] * k, a[2] * k]; },
        prik: function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
        kryds: function (a, b) {
            return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        },
        laengde: function (a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); },
        enhed: function (a) {
            var l = V.laengde(a);
            return l < 1e-12 ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l];
        },
        /* Vinklen mellem to retninger i grader. */
        vinkel: function (a, b) {
            var c = V.prik(V.enhed(a), V.enhed(b));
            return Math.acos(NK.klamp(c, -1, 1)) * 180 / Math.PI;
        },
        /* En enhedsvektor vinkelret paa a. */
        vinkelret: function (a) {
            var hjaelp = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
            return V.enhed(V.kryds(a, hjaelp));
        }
    };
    NK.V = V;

    /* ----- Drejninger: 3x3-matricer som liste med 9 tal (raekkevis) ---- */
    NK.M3 = {
        enhed: function () { return [1, 0, 0, 0, 1, 0, 0, 0, 1]; },
        gange: function (a, b) {
            var m = [];
            for (var r = 0; r < 3; r++) {
                for (var c = 0; c < 3; c++) {
                    m[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
                }
            }
            return m;
        },
        anvend: function (m, v) {
            return [
                m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
                m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
                m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
            ];
        },
        transponer: function (m) {
            return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
        },
        omX: function (a) {
            var c = Math.cos(a), s = Math.sin(a);
            return [1, 0, 0, 0, c, -s, 0, s, c];
        },
        omY: function (a) {
            var c = Math.cos(a), s = Math.sin(a);
            return [c, 0, s, 0, 1, 0, -s, 0, c];
        },
        /* Mange smaa drejninger efter hinanden giver afrundingsfejl;
           her rettes matricen op, saa den stadig er en ren drejning. */
        ortonormer: function (m) {
            var r0 = V.enhed([m[0], m[1], m[2]]);
            var r1 = [m[3], m[4], m[5]];
            r1 = V.enhed(V.minus(r1, V.gange(r0, V.prik(r0, r1))));
            var r2 = V.kryds(r0, r1);
            return r0.concat(r1, r2);
        }
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

    /* En etiket med moerk, afrundet baggrund. */
    NK.etiket = function (ctx, tekst, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = opt.font || "700 14px 'Segoe UI', sans-serif";
        var b = ctx.measureText(tekst).width + 12;
        var h = opt.hoejde || 22;
        ctx.fillStyle = opt.bund || "rgba(14, 14, 20, 0.86)";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 6);
        ctx.fill();
        if (opt.kant) {
            ctx.strokeStyle = opt.kant;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.fillStyle = opt.farve || "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 1);
        ctx.restore();
    };
}());

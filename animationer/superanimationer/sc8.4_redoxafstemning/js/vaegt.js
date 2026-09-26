/* =====================================================================
   vaegt.js - elektronvægten i scenen

   Venstre skål er det, der oxideres (afgiver elektroner), højre skål
   det, der reduceres (optager elektroner). Hver brik er én enhed af
   stoffet. Over brikkerne til venstre sidder de elektroner, den afgiver
   (gule prikker), og over brikkerne til højre de pladser, elektronerne
   skal hen (ringe). Vægten tipper mod den side, der har flest.

   Vægten følger trinene (NK.Niveau.prototype.vaegtData):
     fase 0  skålene er tomme med et spørgsmålstegn
     fase 1  én brik på hver skål; elektronerne er ukendte
     fase 3  koefficienterne: brikkerne følger felterne, og plus og
             minus på bordkanten ændrer koefficienten foran reaktanten
     fase 4  afstemt: elektronerne flyver fra venstre til højre én gang
   Tallene under skålene er regnet af modellen: 5 · 1 e⁻ = 5 e⁻.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var FARVE = { v: "#6cb6ff", h: "#f0a35e" };
    var BRIK = { v: "rgba(61, 158, 224, 0.28)", h: "rgba(230, 137, 42, 0.26)" };
    var KANT = { v: "rgba(108, 182, 255, 0.85)", h: "rgba(240, 163, 94, 0.85)" };
    var GUL = "#f2c53d";

    function Vaegt() {
        this.vinkel = 0;
        this.tid = 0;
        this.knapper = [];
        this.lay = null;
        this.data = null;
    }

    var P = Vaegt.prototype;

    P.layout = function (W, H) {
        var s = NK.klamp(Math.min(W / 880, H / 380), 0.62, 1.3);
        var bordH = NK.klamp(H * 0.11, 30, 54);
        var bund = H - bordH;
        var cx = W > 640 ? W * 0.6 : W * 0.57;
        var postH = NK.klamp(H * 0.56, 100, 310);
        var Lb = NK.klamp(W * 0.23, 105, 260);
        this.lay = {
            W: W, H: H, s: s, bund: bund, bordH: bordH, cx: cx,
            top: bund - postH, Lb: Lb,
            snor: NK.klamp(H * 0.17, 36, 90),
            panB: NK.klamp(Lb * 0.95, 100, 230),
            kop: { x: W - 44 * s, y: bund }
        };
        return this.lay;
    };

    /* Skålens midte (bunden, hvor brikkerne står) */
    P.skaal = function (side) {
        var l = this.lay, c = Math.cos(this.vinkel), sn = Math.sin(this.vinkel);
        var ende = side === "v" ? { x: l.cx - l.Lb * c, y: l.top - l.Lb * sn } : { x: l.cx + l.Lb * c, y: l.top + l.Lb * sn };
        return { ex: ende.x, ey: ende.y, x: ende.x, y: ende.y + l.snor };
    };

    /* ----- Brikkerne på en skål ------------------------------------------ */
    P.brikker = function (ctx, side) {
        var d = this.data, l = this.lay, s = l.s;
        if (!d || d.fase === 0) return { liste: [], over: 0 };
        var p = d[side], n = d.fase >= 3 ? p.antal : 1;
        var fs = 14 * s;
        ctx.font = "700 " + fs + "px 'Segoe UI', sans-serif";
        var tb = ctx.measureText(p.tekst).width;
        var visE = d.fase >= 3;
        var afst = 7 * s;
        var cw = Math.max(tb + 14 * s, (visE ? p.ePr : 1) * afst + 8 * s), ch = 21 * s, prik = 9 * s, gab = 4 * s;
        var raekkeH = ch + prik + 3 * s;
        var pr = Math.max(1, Math.floor((l.panB - 10 * s + gab) / (cw + gab)));
        var maks = pr * 4, vis = Math.min(n, maks);
        var sk = this.skaal(side), liste = [];
        for (var i = 0; i < vis; i++) {
            var r = Math.floor(i / pr), c = i % pr, iR = Math.min(pr, vis - r * pr);
            var x0 = sk.x - (iR * cw + (iR - 1) * gab) / 2;
            var x = x0 + c * (cw + gab), y = sk.y - 4 * s - (r + 1) * raekkeH + prik + 3 * s;
            var prikker = [];
            if (visE) {
                var bredde = (p.ePr - 1) * afst;
                for (var j = 0; j < p.ePr; j++) prikker.push({ x: x + cw / 2 - bredde / 2 + j * afst, y: y - 5.5 * s });
            }
            liste.push({ x: x, y: y, b: cw, h: ch, prikker: prikker });
        }
        return { liste: liste, over: n - vis, fs: fs };
    };

    /* ----- Tilstand ----------------------------------------------------- */
    P.opdater = function (dt, niv, W, H) {
        this.tid += dt;
        if (!this.lay || this.lay.W !== W || this.lay.H !== H) this.layout(W, H);
        var d = niv ? niv.vaegtData() : null;
        this.data = d;
        var maal = 0;
        if (d && d.fase >= 3 && (d.v.antal || d.h.antal)) {
            var diff = d.h.antal * d.h.ePr - d.v.antal * d.v.ePr;
            if (diff) maal = (diff > 0 ? 1 : -1) * NK.klamp(0.05 + 0.012 * Math.abs(diff), 0.05, 0.2);
            if (Math.max(d.v.antal, d.h.antal) >= NK.Data.OVERVAEGT_GRAENSE) maal = (d.v.antal * d.v.ePr > d.h.antal * d.h.ePr ? -1 : 1) * 0.27;
        }
        this.vinkel = NK.mod(this.vinkel, maal, 3.2, dt);
        if (niv && niv.eFlyv < 5) niv.eFlyv += dt;
    };

    /* ----- Tegning ------------------------------------------------------- */
    P.tegn = function (L, kop) {
        var ctx = L.ctx, l = this.lay, d = this.data;
        if (!l) return;
        var s = l.s, mig = this;

        /* Væggen og bordet */
        var g = ctx.createLinearGradient(0, 0, 0, l.bund);
        g.addColorStop(0, "#191921");
        g.addColorStop(1, "#15151b");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, l.W, l.H);
        ctx.fillStyle = "#2b2b35";
        ctx.fillRect(0, l.bund, l.W, l.bordH);
        ctx.fillStyle = "#3d3d4b";
        ctx.fillRect(0, l.bund, l.W, 3);

        /* Foden og stangen */
        ctx.fillStyle = "#8a909b";
        ctx.beginPath();
        ctx.moveTo(l.cx - 46 * s, l.bund);
        ctx.lineTo(l.cx + 46 * s, l.bund);
        ctx.lineTo(l.cx + 30 * s, l.bund - 12 * s);
        ctx.lineTo(l.cx - 30 * s, l.bund - 12 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#a9afb9";
        ctx.fillRect(l.cx - 5 * s, l.top, 10 * s, l.bund - 12 * s - l.top);

        /* Viseren: lige eller skæv */
        var kendt = d && d.fase >= 3 && d.v.antal > 0 && d.h.antal > 0;
        var ens = kendt && d.v.antal * d.v.ePr === d.h.antal * d.h.ePr;
        var by = l.top + NK.klamp((l.bund - l.top) * 0.42, 34 * s, 90 * s);
        ctx.beginPath();
        ctx.arc(l.cx, by, 13 * s, 0, Math.PI * 2);
        ctx.fillStyle = kendt ? (ens ? "#2b7d51" : "#6d3a33") : "#3d3d4b";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = kendt ? (ens ? "#3fae72" : "#e05446") : "#5a5a68";
        ctx.stroke();
        NK.tekst(ctx, kendt ? (ens ? "=" : "≠") : "?", l.cx, by + 1, { font: "700 " + (17 * s) + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });

        /* Snore og skåle */
        ["v", "h"].forEach(function (side) {
            var sk = mig.skaal(side), b = l.panB / 2;
            ctx.strokeStyle = "rgba(200, 206, 214, 0.55)";
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(sk.ex, sk.ey); ctx.lineTo(sk.x - b * 0.92, sk.y - 2 * s);
            ctx.moveTo(sk.ex, sk.ey); ctx.lineTo(sk.x + b * 0.92, sk.y - 2 * s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(sk.x - b, sk.y - 3 * s);
            ctx.quadraticCurveTo(sk.x, sk.y + 20 * s, sk.x + b, sk.y - 3 * s);
            ctx.closePath();
            ctx.fillStyle = "#8a909b";
            ctx.fill();
            ctx.fillStyle = "#b8bec8";
            ctx.fillRect(sk.x - b, sk.y - 4 * s, 2 * b, 2.5 * s);
        });

        /* Vægtstangen */
        var c = Math.cos(this.vinkel), sn = Math.sin(this.vinkel);
        ctx.strokeStyle = "#c3c9d2";
        ctx.lineWidth = 7 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(l.cx - l.Lb * c, l.top - l.Lb * sn);
        ctx.lineTo(l.cx + l.Lb * c, l.top + l.Lb * sn);
        ctx.stroke();
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.arc(l.cx, l.top, 7 * s, 0, Math.PI * 2);
        ctx.fillStyle = "#e3e6ea";
        ctx.fill();

        this.tegnIndhold(ctx);
        this.tegnKnapper(ctx);

        if (kop && !kop.skjult && !kop.iHaand && NK.Sprites.klar("kaffekop")) {
            NK.Sprites.tegn(ctx, "kaffekop", l.kop.x - 21 * s, l.kop.y - 40 * s + 2, 42 * s, 40 * s);
        }
    };

    P.tegnIndhold = function (ctx) {
        var d = this.data, l = this.lay, s = l.s, mig = this;
        var bv = this.brikker(ctx, "v"), bh = this.brikker(ctx, "h");
        /* Elektronerne flyver kun, når koefficienterne er fundet (fase 4) */
        var flyv = d && d.fase === 4 ? d.eFlyv : 0;
        var fra = [], til = [];
        bv.liste.forEach(function (b) { b.prikker.forEach(function (p) { fra.push(p); }); });
        bh.liste.forEach(function (b) { b.prikker.forEach(function (p) { til.push(p); }); });
        var N = d && d.fase === 4 ? Math.min(fra.length, til.length) : 0, forsink = Math.min(0.06, 0.7 / Math.max(1, N));
        function t(i) { return NK.klamp((flyv - 0.2 - i * forsink) / 0.55, 0, 1); }

        ["v", "h"].forEach(function (side) {
            var sk = mig.skaal(side), bb = side === "v" ? bv : bh;
            if (!d || d.fase === 0) {
                NK.tekst(ctx, "?", sk.x, sk.y - 16 * s, { font: "700 " + (30 * s) + "px 'Segoe UI', sans-serif", justering: "center", farve: "rgba(200, 206, 214, 0.35)" });
            }
            bb.liste.forEach(function (b, bi) {
                NK.rundtRekt(ctx, b.x, b.y, b.b, b.h, 5 * s);
                ctx.fillStyle = BRIK[side];
                ctx.fill();
                ctx.lineWidth = 1.3;
                ctx.strokeStyle = KANT[side];
                ctx.stroke();
                NK.tekst(ctx, d[side].tekst, b.x + b.b / 2, b.y + b.h / 2 + 1, { font: "700 " + bb.fs + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
                if (d.fase === 1) {
                    NK.tekst(ctx, "? e⁻", b.x + b.b / 2, b.y - 5 * s, { font: "700 " + (12.5 * s) + "px 'Segoe UI', sans-serif", justering: "center", farve: GUL });
                }
            });
            /* Elektronerne: gule prikker til venstre, ringe til højre */
            var nr = 0;
            bb.liste.forEach(function (b) {
                b.prikker.forEach(function (p) {
                    var i = nr++;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3.2 * s, 0, Math.PI * 2);
                    if (side === "v") {
                        if (i < N && t(i) > 0) return;
                        ctx.fillStyle = GUL;
                        ctx.fill();
                    } else if (i < N && t(i) >= 1) {
                        ctx.fillStyle = GUL;
                        ctx.fill();
                    } else {
                        ctx.lineWidth = 1.4;
                        ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
                        ctx.stroke();
                    }
                });
            });
            if (bb.over > 0) {
                NK.tekst(ctx, "+" + bb.over + " mere", sk.x, sk.y + 26 * s, { font: "700 " + (13 * s) + "px 'Segoe UI', sans-serif", justering: "center", farve: "#f0918a" });
            }
            mig.tegnEtiket(ctx, side, sk);
        });

        /* Elektronerne på vej */
        for (var i = 0; i < N; i++) {
            var k = t(i);
            if (k <= 0 || k >= 1) continue;
            var a = fra[i], b = til[i], mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y, l.top) - 50 * s;
            var u = 1 - k, x = u * u * a.x + 2 * u * k * mx + k * k * b.x, y = u * u * a.y + 2 * u * k * my + k * k * b.y;
            ctx.beginPath();
            ctx.arc(x, y, 3.6 * s, 0, Math.PI * 2);
            ctx.fillStyle = GUL;
            ctx.shadowColor = "rgba(242, 197, 61, 0.8)";
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    };

    /* Under skålen: hvem og hvor mange elektroner */
    P.tegnEtiket = function (ctx, side, sk) {
        var d = this.data, l = this.lay, s = l.s;
        var ord = side === "v" ? "afgiver" : "optager";
        var linje1 = !d || d.fase === 0 ? ord + " e⁻" : d[side].tekst + " " + ord;
        var y = sk.y + 30 * s;
        NK.tekst(ctx, linje1, sk.x, y, { font: "700 " + Math.max(12.5, 13 * s) + "px 'Segoe UI', sans-serif", justering: "center", farve: FARVE[side] });
        if (d && d.fase >= 3) {
            var p = d[side];
            /* Tomt felt: tom skål, og kun hvor meget én enhed giver */
            var tekst = p.antal ? p.antal + " · " + p.ePr + " e⁻ = " + p.antal * p.ePr + " e⁻" : p.ePr + " e⁻ pr. " + p.tekst;
            NK.tekst(ctx, tekst, sk.x, y + 19 * s, { font: "700 " + Math.max(13, 15 * s) + "px 'Segoe UI', sans-serif", justering: "center", farve: "#f2f3f5", kant: true });
        }
    };

    /* Plus og minus på bordkanten, kun mens koefficienterne skrives */
    P.tegnKnapper = function (ctx) {
        var d = this.data, l = this.lay, s = l.s, mig = this;
        this.knapper = [];
        if (!d || d.fase !== 3) return;
        var y = l.bund + l.bordH / 2, r = NK.klamp(l.bordH * 0.36, 11, 16);
        ["v", "h"].forEach(function (side) {
            var x = l.cx + (side === "v" ? -1 : 1) * l.Lb;
            [-1, 1].forEach(function (dd) {
                var kx = x + dd * (r + 6 * s);
                var over = mig.overKnap && mig.overKnap.side === side && mig.overKnap.d === dd;
                ctx.beginPath();
                ctx.arc(kx, y, r, 0, Math.PI * 2);
                ctx.fillStyle = over ? "#47475a" : "#333340";
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = FARVE[side];
                ctx.stroke();
                NK.tekst(ctx, dd > 0 ? "+" : "−", kx, y + 1, { font: "700 " + (r * 1.3) + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
                mig.knapper.push({ x: kx, y: y, r: r + 3, side: side, d: dd });
            });
        });
    };

    /* ----- Musen --------------------------------------------------------- */
    P.knapVed = function (x, y) {
        for (var i = 0; i < this.knapper.length; i++) {
            var k = this.knapper[i];
            if (Math.abs(x - k.x) <= k.r && Math.abs(y - k.y) <= k.r) return k;
        }
        return null;
    };

    P.kopVed = function (x, y, kop) {
        var l = this.lay;
        if (!l || !kop || kop.skjult || kop.iHaand) return false;
        return Math.abs(x - l.kop.x) < 24 * l.s && y < l.kop.y + 4 && y > l.kop.y - 44 * l.s;
    };

    P.skaalVed = function (x, y) {
        var l = this.lay;
        if (!l) return null;
        var sider = ["v", "h"];
        for (var i = 0; i < 2; i++) {
            var sk = this.skaal(sider[i]);
            if (Math.abs(x - sk.x) < l.panB / 2 + 8 && y > sk.y - 120 * l.s && y < sk.y + 50 * l.s) return sider[i];
        }
        return null;
    };

    NK.Vaegt = Vaegt;
}());

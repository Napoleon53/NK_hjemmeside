/* =====================================================================
   graf.js - de to smaa laerreder i panelet paa fane 1

   NK.Kurve:  stofmaengderne i kolben mod tilsat soelvnitrat: Cl⁻ i
              opløsning, AgCl og Ag₂CrO₄ (som "ion-fordelingen" i den
              gamle c5.5). Tegnes i takt med, at draaberne rammer kolben.
   NK.Aflaes: luppen paa buretten ved menisken. Den viser inddelingen
              med 0,1 mL mellem stregerne, saa eleven selv kan aflaese
              (samme som sc7.4).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SKRIFT = "'Segoe UI', sans-serif";
    function font(v, px) { return v + " " + px + "px " + SKRIFT; }

    var SERIER = [
        { noegle: "cl", navn: "Cl⁻", farve: "#4cc47f" },
        { noegle: "agcl", navn: "AgCl", farve: "#e9ecef" },
        { noegle: "cro", navn: "Ag₂CrO₄", farve: "#d0643a" }
    ];

    /* ----- Kurven ----------------------------------------------------------------------
       Punkterne er { v, cl, agcl, cro } med v i mL og stofmaengderne i mmol. */
    function Kurve(canvas) {
        this.L = new NK.Laerred(canvas);
        this.punkter = [];
        this.X_MAKS = 15;
        this.Y_MAKS = 0.6;
        this.over = null;
        var mig = this;
        canvas.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e), bedst = null, bd = 24 * 24;
            mig.punkter.forEach(function (q, i) {
                SERIER.forEach(function (s) {
                    var dx = mig.x(q.v) - p.x, dy = mig.y(q[s.noegle]) - p.y, d = dx * dx + dy * dy;
                    if (d < bd) { bd = d; bedst = { i: i, s: s }; }
                });
            });
            mig.over = bedst;
            canvas.style.cursor = bedst ? "crosshair" : "default";
        });
        canvas.addEventListener("pointerleave", function () { mig.over = null; });
    }

    var PK = Kurve.prototype;

    /* Akserne passer til proeven: x til halvanden gang forbruget, y til
       stofmaengden af chlorid (mmol), rundet op */
    PK.nulstil = function (vAek, nCl) {
        this.punkter = [];
        this.over = null;
        if (vAek) this.X_MAKS = NK.klamp(Math.ceil(vAek * 1.5 / 5) * 5, 10, 25);
        if (nCl) this.Y_MAKS = Math.max(0.2, Math.ceil(nCl * 1000 * 1.25 * 10) / 10);
    };

    PK.tilfoej = function (v, cl, agcl, cro) {
        var p = { v: v, cl: cl * 1000, agcl: agcl * 1000, cro: cro * 1000 };
        var sidste = this.punkter[this.punkter.length - 1];
        if (sidste && Math.abs(sidste.v - v) < 1e-6) { this.punkter[this.punkter.length - 1] = p; return; }
        this.punkter.push(p);
    };

    PK.ramme = function () {
        var W = this.L.b, H = this.L.h;
        return { l: 40, r: W - 10, t: 10, b: H - 30 };
    };
    PK.x = function (v) { var r = this.ramme(); return r.l + (r.r - r.l) * NK.klamp(v, 0, this.X_MAKS) / this.X_MAKS; };
    PK.y = function (n) {
        var r = this.ramme();
        return r.b - (r.b - r.t) * NK.klamp(n, 0, this.Y_MAKS) / this.Y_MAKS;
    };

    PK.tegn = function () {
        this.L.tilpas();
        var ctx = this.L.ctx, r = this.ramme(), mig = this;
        this.L.ryd("#15161c");
        ctx.save();
        /* Gitter */
        var xTrin = this.X_MAKS > 15 ? 5 : (this.X_MAKS > 10 ? 3 : 2);
        var yTrin = this.Y_MAKS > 0.4 ? 0.2 : 0.1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var v = 0; v <= this.X_MAKS + 1e-9; v += xTrin) { var x = Math.round(this.x(v)) + 0.5; ctx.moveTo(x, r.t); ctx.lineTo(x, r.b); }
        for (var n = 0; n <= this.Y_MAKS + 1e-9; n += yTrin) { var y = Math.round(this.y(n)) + 0.5; ctx.moveTo(r.l, y); ctx.lineTo(r.r, y); }
        ctx.stroke();
        /* Akser */
        ctx.strokeStyle = "#8a919b";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(r.l + 0.5, r.t);
        ctx.lineTo(r.l + 0.5, r.b + 0.5);
        ctx.lineTo(r.r, r.b + 0.5);
        ctx.stroke();
        ctx.fillStyle = "#c8ced6";
        ctx.font = font("600", 12);
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (v = 0; v <= this.X_MAKS + 1e-9; v += xTrin) ctx.fillText(String(Math.round(v)), this.x(v), r.b + 4);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (n = 0; n <= this.Y_MAKS + 1e-9; n += yTrin) ctx.fillText(n < 1e-9 ? "0" : NK.komma(Math.round(n * 100)).replace(/0$/, ""), r.l - 5, this.y(n));
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText("mL AgNO₃", r.r, r.b + 29);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("mmol", r.l + 5, r.t);

        /* Forklaringen oeverst til hoejre */
        ctx.font = font("700", 12);
        var lx = r.r - 6, ly = r.t + 2;
        for (var i = SERIER.length - 1; i >= 0; i--) {
            var s = SERIER[i], b = ctx.measureText(s.navn).width;
            ctx.fillStyle = s.farve;
            ctx.textAlign = "right";
            ctx.fillText(s.navn, lx, ly);
            ctx.fillRect(lx - b - 16, ly + 6, 11, 3);
            lx -= b + 26;
        }

        /* Kurverne */
        if (this.punkter.length > 1) {
            SERIER.forEach(function (s) {
                ctx.strokeStyle = s.farve;
                ctx.lineWidth = 2.2;
                ctx.lineJoin = "round";
                ctx.beginPath();
                mig.punkter.forEach(function (p, k) {
                    if (k === 0) ctx.moveTo(mig.x(p.v), mig.y(p[s.noegle]));
                    else ctx.lineTo(mig.x(p.v), mig.y(p[s.noegle]));
                });
                ctx.stroke();
            });
        }
        var sidste = this.punkter[this.punkter.length - 1];
        if (this.punkter.length > 1) {
            SERIER.forEach(function (s) {
                ctx.fillStyle = s.farve;
                ctx.strokeStyle = "#15161c";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(mig.x(sidste.v), mig.y(sidste[s.noegle]), 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        } else {
            ctx.fillStyle = "#7e8590";
            ctx.font = font("italic 400", 12);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Kurverne tegnes, når der løber sølvnitrat ned.", (r.l + r.r) / 2, (r.t + r.b) / 2 + 8);
        }

        /* Aflaesning af et punkt under musen */
        var o = this.over, p = o && this.punkter[o.i];
        if (p) {
            var px = this.x(p.v), py = this.y(p[o.s.noegle]);
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = o.s.farve;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(r.l, py); ctx.lineTo(px, py); ctx.lineTo(px, r.b);
            ctx.stroke();
            ctx.setLineDash([]);
            var t = NK.tal2(p.v) + " mL · " + o.s.navn + " " + NK.betydende(p[o.s.noegle], 3) + " mmol";
            ctx.font = font("700", 12);
            var bb = ctx.measureText(t).width + 12;
            var bx = px + 10 + bb > r.r ? px - bb - 10 : px + 10, by = py - 26 < r.t ? py + 6 : py - 26;
            bx = Math.max(2, bx);
            ctx.fillStyle = "rgba(20, 20, 28, 0.95)";
            NK.rundtRekt(ctx, bx, by, bb, 20, 5);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(t, bx + 6, by + 10.5);
        }
        ctx.restore();
    };

    NK.Kurve = Kurve;

    /* ----- Luppen paa buretten -----------------------------------------------------
       Viser buretten omkring menisken: 1,8 mL i hoejden. De lange streger
       er hele mL med tallet, de mellemlange 0,5 mL, de korte 0,1 mL.
       Buretten taeller oppefra, saa tallene vokser nedad. */
    function Aflaes(canvas) {
        this.L = new NK.Laerred(canvas);
    }

    Aflaes.prototype.tegn = function (v, opt) {
        opt = opt || {};
        this.L.tilpas();
        var ctx = this.L.ctx, W = this.L.b, H = this.L.h;
        var prML = H / 1.8, cy = H / 2;
        function y(m) { return cy + (m - v) * prML; }
        ctx.save();
        /* Baggrunden bag glasset */
        ctx.fillStyle = "#e9eef2";
        ctx.fillRect(0, 0, W, H);
        /* Roeret: vaeggene og vaesken under menisken */
        var x0 = W * 0.2, x1 = W * 0.8;
        var tom = v >= 26.5;
        if (!tom) {
            ctx.fillStyle = "rgba(160, 200, 232, 0.55)";
            ctx.fillRect(x0, cy, x1 - x0, H - cy);
            /* Menisken: bunden ved niveauet, kanterne hoejere oppe */
            var hv = 0.16 * prML;
            ctx.fillStyle = "rgba(160, 200, 232, 0.55)";
            ctx.beginPath();
            ctx.moveTo(x0, cy - hv);
            ctx.quadraticCurveTo((x0 + x1) / 2, cy + hv, x1, cy - hv);
            ctx.lineTo(x1, cy);
            ctx.lineTo(x0, cy);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#2f5f86";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x0, cy - hv);
            ctx.quadraticCurveTo((x0 + x1) / 2, cy + hv, x1, cy - hv);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(x0 + 6, 0, 5, H);
        ctx.strokeStyle = "#8ea3b4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, 0); ctx.lineTo(x0, H);
        ctx.moveTo(x1, 0); ctx.lineTo(x1, H);
        ctx.stroke();

        /* Inddelingen */
        ctx.strokeStyle = "#1c1f26";
        ctx.fillStyle = "#1c1f26";
        ctx.font = font("700", 15);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        var fra = Math.floor((v - 1.1) * 10), til = Math.ceil((v + 1.1) * 10);
        for (var i = fra; i <= til; i++) {
            if (i < 0 || i > 260) continue;
            var m = i / 10, yy = Math.round(y(m)) + 0.5;
            var hel = i % 10 === 0, halv = i % 5 === 0;
            var l = hel ? (x1 - x0) * 0.62 : (halv ? (x1 - x0) * 0.4 : (x1 - x0) * 0.24);
            ctx.lineWidth = hel ? 2 : 1.2;
            ctx.beginPath();
            ctx.moveTo(x0, yy);
            ctx.lineTo(x0 + l, yy);
            ctx.stroke();
            if (hel && m <= 25) ctx.fillText(String(Math.round(m)), x0 + l + 8, yy);
        }
        ctx.restore();
        if (opt.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.5 + 0.5 * opt.lys) + ")";
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, W - 4, H - 4);
            ctx.restore();
        }
    };

    NK.Aflaes = Aflaes;
}());

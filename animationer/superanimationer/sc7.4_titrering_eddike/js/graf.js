/* =====================================================================
   graf.js - de to smaa laerreder i panelet paa fane 1

   NK.Kurve:  titreringskurven, pH mod tilsat NaOH, der tegnes i takt
              med, at draaberne rammer kolben (som i den gamle c7.4).
              Datatabellen til Excel bygges af de samme punkter.
   NK.Aflaes: luppen paa buretten ved menisken. Den viser inddelingen
              med 0,1 mL mellem stregerne, saa eleven selv kan aflaese.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SKRIFT = "'Segoe UI', sans-serif";
    function font(v, px) { return v + " " + px + "px " + SKRIFT; }

    /* ----- Titreringskurven --------------------------------------------------------- */
    function Kurve(canvas) {
        this.L = new NK.Laerred(canvas);
        this.punkter = [];         /* [{ v, ph }] */
        this.X_MAKS = 25;
        this.Y_MIN = 2;
        this.Y_MAKS = 13;
        this.aek = null;           /* vises ikke; kun til selvtesten */
        this.over = -1;
        var mig = this;
        canvas.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e), bedst = -1, bd = 24 * 24;
            mig.punkter.forEach(function (q, i) {
                var dx = mig.x(q.v) - p.x, dy = mig.y(q.ph) - p.y, d = dx * dx + dy * dy;
                if (d < bd) { bd = d; bedst = i; }
            });
            mig.over = bedst;
            canvas.style.cursor = bedst >= 0 ? "crosshair" : "default";
        });
        canvas.addEventListener("pointerleave", function () { mig.over = -1; });
    }

    var PK = Kurve.prototype;

    PK.nulstil = function () {
        this.punkter = [];
        this.over = -1;
    };

    PK.tilfoej = function (v, ph) {
        var sidste = this.punkter[this.punkter.length - 1];
        if (sidste && Math.abs(sidste.v - v) < 1e-6) { sidste.ph = ph; return; }
        this.punkter.push({ v: v, ph: ph });
    };

    PK.ramme = function () {
        var W = this.L.b, H = this.L.h;
        return { l: 34, r: W - 10, t: 10, b: H - 30 };
    };
    PK.x = function (v) { var r = this.ramme(); return r.l + (r.r - r.l) * v / this.X_MAKS; };
    PK.y = function (ph) {
        var r = this.ramme();
        return r.b - (r.b - r.t) * (NK.klamp(ph, this.Y_MIN, this.Y_MAKS) - this.Y_MIN) / (this.Y_MAKS - this.Y_MIN);
    };

    PK.tegn = function () {
        this.L.tilpas();
        var ctx = this.L.ctx, r = this.ramme(), mig = this;
        this.L.ryd("#15161c");
        ctx.save();
        /* Gitter */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var v = 0; v <= this.X_MAKS; v += 5) { var x = Math.round(this.x(v)) + 0.5; ctx.moveTo(x, r.t); ctx.lineTo(x, r.b); }
        for (var ph = this.Y_MIN; ph <= this.Y_MAKS; ph += 1) { var y = Math.round(this.y(ph)) + 0.5; ctx.moveTo(r.l, y); ctx.lineTo(r.r, y); }
        ctx.stroke();
        /* Phenolphthaleins omslag som et lyserødt baand */
        ctx.fillStyle = "rgba(232, 58, 150, 0.12)";
        ctx.fillRect(r.l, this.y(10), r.r - r.l, this.y(8.2) - this.y(10));
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
        for (v = 0; v <= this.X_MAKS; v += 5) ctx.fillText(String(v), this.x(v), r.b + 4);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (ph = 3; ph <= this.Y_MAKS; ph += 2) ctx.fillText(String(ph), r.l - 5, this.y(ph));
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText("mL NaOH", r.r, r.b + 29);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("pH", r.l + 5, r.t);

        /* Kurven */
        if (this.punkter.length > 1) {
            ctx.strokeStyle = "#5aa9e6";
            ctx.lineWidth = 2.2;
            ctx.lineJoin = "round";
            ctx.beginPath();
            this.punkter.forEach(function (p, i) {
                if (i === 0) ctx.moveTo(mig.x(p.v), mig.y(p.ph));
                else ctx.lineTo(mig.x(p.v), mig.y(p.ph));
            });
            ctx.stroke();
        }
        var sidste = this.punkter[this.punkter.length - 1];
        if (sidste) {
            ctx.fillStyle = "#e6892a";
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.x(sidste.v), this.y(sidste.ph), 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillStyle = "#7e8590";
            ctx.font = font("italic 400", 12);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Kurven tegnes, når der løber NaOH ned.", (r.l + r.r) / 2, (r.t + r.b) / 2);
        }

        /* Aflaesning af et punkt under musen */
        var p = this.punkter[this.over];
        if (p) {
            var px = this.x(p.v), py = this.y(p.ph);
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = "#e6892a";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(r.l, py); ctx.lineTo(px, py); ctx.lineTo(px, r.b);
            ctx.stroke();
            ctx.setLineDash([]);
            var t = NK.tal2(p.v) + " mL · pH " + NK.tal2(p.ph);
            ctx.font = font("700", 12);
            var bb = ctx.measureText(t).width + 12;
            var bx = px + 10 + bb > r.r ? px - bb - 10 : px + 10, by = py - 26 < r.t ? py + 6 : py - 26;
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

    /* Raekkerne i datatabellen: en vaerdi for hvert trin (mL) og det sidste punkt */
    PK.tabel = function (trin) {
        var ud = [], p = this.punkter;
        if (!p.length) return ud;
        var sidste = p[p.length - 1];
        function naermest(v) {
            var bedst = null, bd = 1e9;
            p.forEach(function (q) { var d = Math.abs(q.v - v); if (d < bd) { bd = d; bedst = q; } });
            return bd <= 0.03 ? bedst : null;
        }
        for (var v = 0; v <= sidste.v + 1e-9; v += trin) {
            var q = naermest(v);
            if (q) ud.push([Math.round(v * 100) / 100, q.ph]);
        }
        var s = ud[ud.length - 1];
        if (!s || Math.abs(s[0] - sidste.v) > 0.01) ud.push([sidste.v, sidste.ph]);
        return ud;
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

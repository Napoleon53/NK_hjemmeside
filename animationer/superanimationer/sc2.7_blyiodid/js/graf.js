/* =====================================================================
   graf.js - grafen i panelet

   Vandret: temperaturen 0-100 °C. Lodret: g PbI2 pr. 100 mL vand, 0 til
   0,45. Maalingerne er gule punkter med nummer. Er Pb(NO3)2 og KI i
   glasset, og er temperaturen ikke noteret endnu, vises et hult punkt
   ved den aktuelle temperatur. Den blaa opløselighedskurve med
   tabelvaerdierne kommer frem, naar der er tre maalinger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;

    var Y_MAKS = 0.45;
    var PAD = { v: 36, h: 10, o: 16, n: 24 };

    NK.Graf = function (canvas) {
        this.laerred = new NK.Laerred(canvas);
        this.kurveAlfa = 0;
    };

    var G = NK.Graf.prototype;

    G.omraade = function () {
        var L = this.laerred;
        return { x0: PAD.v, x1: L.b - PAD.h, y0: PAD.o, y1: L.h - PAD.n };
    };

    G.tilX = function (T) {
        var o = this.omraade();
        return o.x0 + (o.x1 - o.x0) * NK.klamp(T, 0, 100) / 100;
    };

    G.tilY = function (g) {
        var o = this.omraade();
        return o.y1 - (o.y1 - o.y0) * NK.klamp(g, 0, Y_MAKS) / Y_MAKS;
    };

    /* v = { maalinger, T, aktuel (g eller null), visKurve } */
    G.tegn = function (v, dt) {
        var L = this.laerred;
        L.tilpas();
        var ctx = L.ctx;
        var o = this.omraade();
        var i, x, y;
        this.kurveAlfa = NK.mod(this.kurveAlfa, v.visKurve ? 1 : 0, 2, dt || 0);
        ctx.clearRect(0, 0, L.b, L.h);

        /* Gitter og akser */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (i = 0; i <= 100; i += 20) { x = Math.round(this.tilX(i)) + 0.5; ctx.moveTo(x, o.y0); ctx.lineTo(x, o.y1); }
        for (i = 0; i <= 4; i++) { y = Math.round(this.tilY(i / 10)) + 0.5; ctx.moveTo(o.x0, y); ctx.lineTo(o.x1, y); }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.moveTo(o.x0 + 0.5, o.y0 - 4);
        ctx.lineTo(o.x0 + 0.5, o.y1 + 0.5);
        ctx.lineTo(o.x1 + 2, o.y1 + 0.5);
        ctx.stroke();

        var skrift = { font: "600 10px 'Segoe UI', sans-serif", farve: "#9fa6af", linje: "middle" };
        for (i = 0; i <= 100; i += 20) {
            NK.tekst(ctx, String(i), this.tilX(i), o.y1 + 9, { font: skrift.font, farve: skrift.farve, linje: "middle", justering: "center" });
        }
        for (i = 0; i <= 4; i++) {
            NK.tekst(ctx, i === 0 ? "0" : M.komma(i / 10, 1), o.x0 - 5, this.tilY(i / 10), { font: skrift.font, farve: skrift.farve, linje: "middle", justering: "right" });
        }
        NK.tekst(ctx, "°C", o.x1, o.y1 + 19, { font: "600 10px 'Segoe UI', sans-serif", farve: "#c8ced6", linje: "middle", justering: "right" });
        NK.tekst(ctx, "g PbI₂ pr. 100 mL", o.x0 + 4, 7, { font: "600 10px 'Segoe UI', sans-serif", farve: "#c8ced6", linje: "middle" });

        /* Opløselighedskurven */
        if (this.kurveAlfa > 0.01) {
            ctx.save();
            ctx.globalAlpha = this.kurveAlfa;
            ctx.beginPath();
            o = this.omraade();
            ctx.rect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
            ctx.clip();
            ctx.strokeStyle = "#3d9ee0";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            for (i = 0; i <= 100; i += 2) {
                x = this.tilX(i);
                y = o.y1 - (o.y1 - o.y0) * M.oploeselighed(i) / Y_MAKS;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = this.kurveAlfa;
            NK.tekst(ctx, "Tabelværdier", this.tilX(58), this.tilY(M.oploeselighed(58)) - 11, { font: "700 10px 'Segoe UI', sans-serif", farve: "#7cc1f0", linje: "middle", justering: "right" });
            ctx.restore();
        }

        /* Den aktuelle temperatur */
        x = Math.round(this.tilX(v.T)) + 0.5;
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.35)";
        ctx.beginPath();
        ctx.moveTo(x, o.y0);
        ctx.lineTo(x, o.y1);
        ctx.stroke();
        ctx.setLineDash([]);

        if (v.aktuel !== null && v.aktuel !== undefined) {
            ctx.strokeStyle = "#f2c53d";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(this.tilX(v.T), this.tilY(v.aktuel), 4.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        /* Maalingerne */
        for (i = 0; i < v.maalinger.length; i++) {
            var m = v.maalinger[i];
            x = this.tilX(m.T);
            y = this.tilY(m.pbi2);
            ctx.fillStyle = "#f2c53d";
            ctx.strokeStyle = "#2b2b36";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            NK.tekst(ctx, String(m.nr), x, y + 0.5, { font: "800 8px 'Segoe UI', sans-serif", farve: "#2a1d04", linje: "middle", justering: "center" });
        }
        ctx.restore();
    };
}());

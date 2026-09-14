/* =====================================================================
   graf.js - grafen med maalingerne

   Vandret: temperaturen 0-100 °C. Lodret: g PbI2 pr. 100 mL vand, 0 til
   0,45. Maalingerne er gule punkter med nummer, og den blaa kurve er
   opløseligheden efter tabelvaerdierne. Grafen tegnes i tegneseriens
   sidste rude.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;

    var Y_MAKS = 0.45;
    var PAD = { v: 36, h: 12, o: 18, n: 26 };

    /* v = { maalinger, visKurve } */
    function tegn(ctx, b, h, v) {
        var o = { x0: PAD.v, x1: b - PAD.h, y0: PAD.o, y1: h - PAD.n };
        var i, x, y;
        function tilX(T) { return o.x0 + (o.x1 - o.x0) * NK.klamp(T, 0, 100) / 100; }
        function tilY(g) { return o.y1 - (o.y1 - o.y0) * NK.klamp(g, 0, Y_MAKS) / Y_MAKS; }

        ctx.save();
        ctx.fillStyle = "#1c2027";
        ctx.fillRect(0, 0, b, h);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (i = 0; i <= 100; i += 20) { x = Math.round(tilX(i)) + 0.5; ctx.moveTo(x, o.y0); ctx.lineTo(x, o.y1); }
        for (i = 0; i <= 4; i++) { y = Math.round(tilY(i / 10)) + 0.5; ctx.moveTo(o.x0, y); ctx.lineTo(o.x1, y); }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.moveTo(o.x0 + 0.5, o.y0 - 4);
        ctx.lineTo(o.x0 + 0.5, o.y1 + 0.5);
        ctx.lineTo(o.x1 + 2, o.y1 + 0.5);
        ctx.stroke();

        var font = "600 10px 'Segoe UI', sans-serif";
        for (i = 0; i <= 100; i += 20) NK.tekst(ctx, String(i), tilX(i), o.y1 + 9, { font: font, farve: "#9fa6af", linje: "middle", justering: "center" });
        for (i = 0; i <= 4; i++) NK.tekst(ctx, i === 0 ? "0" : M.komma(i / 10, 1), o.x0 - 5, tilY(i / 10), { font: font, farve: "#9fa6af", linje: "middle", justering: "right" });
        NK.tekst(ctx, "°C", o.x1, o.y1 + 20, { font: font, farve: "#c8ced6", linje: "middle", justering: "right" });
        NK.tekst(ctx, "g PbI₂ pr. 100 mL", o.x0 + 4, 8, { font: font, farve: "#c8ced6", linje: "middle" });

        if (v.visKurve) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
            ctx.clip();
            ctx.strokeStyle = "#3d9ee0";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            for (i = 0; i <= 100; i += 2) {
                x = tilX(i);
                y = o.y1 - (o.y1 - o.y0) * M.oploeselighed(i) / Y_MAKS;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "Tabelværdier", tilX(56), tilY(M.oploeselighed(56)) - 12, { font: "700 10px 'Segoe UI', sans-serif", farve: "#7cc1f0", linje: "middle", justering: "right" });
        }

        for (i = 0; i < v.maalinger.length; i++) {
            var m = v.maalinger[i];
            x = tilX(m.T);
            y = tilY(m.pbi2);
            ctx.fillStyle = "#f2c53d";
            ctx.strokeStyle = "#1c2027";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            NK.tekst(ctx, String(m.nr), x, y + 0.5, { font: "800 8px 'Segoe UI', sans-serif", farve: "#2a1d04", linje: "middle", justering: "center" });
        }
        ctx.restore();
    }

    NK.Graf = { tegn: tegn };
}());

/* =====================================================================
   graf.js - grafen med maalingerne

   Vandret: temperaturen 0-100 °C. Lodret: opløselighedsproduktet Ko for
   PbI2 i enheden 10⁻⁷ M³. Maalingerne er gule punkter med nummer: den
   noterede temperatur og reaktionsbroeken i glasset, som er elevens Ko.
   Den blaa kurve er Ko efter tabelvaerdierne. Aksen gaar til 10, 20
   eller 30 efter det stoerste punkt. Grafen tegnes i tegneseriens sidste
   rude.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;

    var ENHED = 1e-7;
    var PAD = { v: 30, h: 12, o: 18, n: 26 };

    /* Aksens top: 10, 20 eller 30 gange 10⁻⁷ M³ */
    function aksetop(maalinger) {
        var stoerst = 0;
        maalinger.forEach(function (m) { stoerst = Math.max(stoerst, m.Y / ENHED); });
        return stoerst > 18 ? 30 : (stoerst > 9 ? 20 : 10);
    }

    /* v = { maalinger, visKurve } */
    function tegn(ctx, b, h, v) {
        var o = { x0: PAD.v, x1: b - PAD.h, y0: PAD.o, y1: h - PAD.n };
        var top = aksetop(v.maalinger), skridt = top / 5;
        var i, x, y;
        function tilX(T) { return o.x0 + (o.x1 - o.x0) * NK.klamp(T, 0, 100) / 100; }
        function tilY(k) { return o.y1 - (o.y1 - o.y0) * NK.klamp(k, 0, top) / top; }

        ctx.save();
        ctx.fillStyle = "#1c2027";
        ctx.fillRect(0, 0, b, h);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (i = 0; i <= 100; i += 20) { x = Math.round(tilX(i)) + 0.5; ctx.moveTo(x, o.y0); ctx.lineTo(x, o.y1); }
        for (i = 0; i <= 5; i++) { y = Math.round(tilY(i * skridt)) + 0.5; ctx.moveTo(o.x0, y); ctx.lineTo(o.x1, y); }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.moveTo(o.x0 + 0.5, o.y0 - 4);
        ctx.lineTo(o.x0 + 0.5, o.y1 + 0.5);
        ctx.lineTo(o.x1 + 2, o.y1 + 0.5);
        ctx.stroke();

        var font = "600 10px 'Segoe UI', sans-serif";
        for (i = 0; i <= 100; i += 20) NK.tekst(ctx, String(i), tilX(i), o.y1 + 9, { font: font, farve: "#9fa6af", linje: "middle", justering: "center" });
        for (i = 0; i <= 5; i++) NK.tekst(ctx, String(i * skridt), o.x0 - 5, tilY(i * skridt), { font: font, farve: "#9fa6af", linje: "middle", justering: "right" });
        NK.tekst(ctx, "°C", o.x1, o.y1 + 20, { font: font, farve: "#c8ced6", linje: "middle", justering: "right" });
        NK.tekst(ctx, "Kₒ i 10⁻⁷ M³", o.x0 + 4, 8, { font: font, farve: "#c8ced6", linje: "middle" });

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
                y = o.y1 - (o.y1 - o.y0) * (M.ko(i) / ENHED) / top;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
            /* Teksten staar til venstre for kurven, hvor den er naaet halvt op */
            var tT = M.maetningsTempY(top * 0.5 * ENHED);
            NK.tekst(ctx, "Tabelværdier", tilX(tT) - 8, tilY(top * 0.5) - 6, { font: "700 10px 'Segoe UI', sans-serif", farve: "#7cc1f0", linje: "middle", justering: "right" });
        }

        for (i = 0; i < v.maalinger.length; i++) {
            var m = v.maalinger[i];
            x = tilX(m.T);
            y = tilY(m.Y / ENHED);
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

    NK.Graf = { tegn: tegn, aksetop: aksetop };
}());

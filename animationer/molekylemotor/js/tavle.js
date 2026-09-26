/* =====================================================================
   tavle.js - scenen: en mørk væg med et whiteboard, en tom bakke og et
   papir, der kan hænge på tavlen

   Tegnes i kode, ikke som sprite, fordi tavlen skal have scenens
   størrelse. Der er intet glasudstyr i denne animation.

   NK.Tavle.layout(W, H) giver:
     tavle   { x, y, b, h }  den hvide flade
     bakke   { x, y, b, h }  hylden under tavlen
     kop     { x, y }        kaffekoppens bund: koppen staar i scenens
                             nederste hoejre hjoerne, saa kun en fjerdedel
                             kan ses (den oeverste venstre del)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function layout(W, H) {
        var kant = Math.round(NK.klamp(W * 0.018, 10, 22));
        var bakkeH = Math.round(NK.klamp(H * 0.035, 10, 16));
        var bund = Math.round(NK.klamp(H * 0.05, 18, 34));
        var tavle = { x: kant, y: kant, b: W - 2 * kant, h: H - kant - bakkeH - bund };
        var bakke = { x: kant - 6, y: tavle.y + tavle.h, b: tavle.b + 12, h: bakkeH };
        return {
            W: W, H: H, kant: kant, tavle: tavle, bakke: bakke,
            /* Spritet er 42 x 40 med bunden i y og ankeret 18 fra venstre:
               halvdelen i bredden og halvdelen i hoejden er uden for scenen */
            kop: { x: W - 3, y: H + 20 }
        };
    }

    /* udsnit (tegnebraettet): { ox, oy, trin } i pixels. Prikkerne foelger
       saa med, naar tavlen flyttes og zoomes. Uden udsnit staar de fast. */
    function tegn(ctx, lay, udsnit) {
        var W = lay.W, H = lay.H, t = lay.tavle, b = lay.bakke;
        /* Vaeggen */
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#23232c");
        g.addColorStop(1, "#18181f");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        /* Rammen */
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#a9afb8";
        NK.rundtRekt(ctx, t.x - 6, t.y - 6, t.b + 12, t.h + 12, 6);
        ctx.fill();
        ctx.restore();
        var gr = ctx.createLinearGradient(0, t.y - 6, 0, t.y + t.h + 6);
        gr.addColorStop(0, "#d3d7dd");
        gr.addColorStop(0.5, "#aab0b9");
        gr.addColorStop(1, "#c6cad1");
        ctx.fillStyle = gr;
        NK.rundtRekt(ctx, t.x - 6, t.y - 6, t.b + 12, t.h + 12, 6);
        ctx.fill();
        /* Den hvide flade med et svagt skaer */
        var fl = ctx.createLinearGradient(t.x, t.y, t.x + t.b, t.y + t.h);
        fl.addColorStop(0, "#fbfcfb");
        fl.addColorStop(0.55, "#f4f6f5");
        fl.addColorStop(1, "#eef1f0");
        ctx.fillStyle = fl;
        ctx.fillRect(t.x, t.y, t.b, t.h);
        /* Prikkerne */
        ctx.fillStyle = "rgba(120, 132, 150, 0.22)";
        var trin = udsnit ? Math.max(10, udsnit.trin) : 26;
        var x0 = t.x + trin / 2, y0 = t.y + trin / 2;
        if (udsnit) {
            x0 = t.x + (((udsnit.ox - t.x) % trin) + trin) % trin;
            y0 = t.y + (((udsnit.oy - t.y) % trin) + trin) % trin;
        }
        for (var y = y0; y < t.y + t.h; y += trin) {
            for (var x = x0; x < t.x + t.b; x += trin) {
                ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        }
        /* Bakken */
        var gb = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
        gb.addColorStop(0, "#c7ccd3");
        gb.addColorStop(1, "#80868f");
        ctx.fillStyle = gb;
        NK.rundtRekt(ctx, b.x, b.y, b.b, b.h, 3);
        ctx.fill();
    }

    /* Et papir, der haenger paa tavlen med to magneter */
    function papir(ctx, r) {
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#fffefa";
        ctx.fillRect(r.x, r.y, r.b, r.h);
        ctx.restore();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.b - 1, r.h - 1);
        [r.x + 16, r.x + r.b - 16].forEach(function (mx) {
            ctx.beginPath();
            ctx.arc(mx, r.y + 4, 7, 0, Math.PI * 2);
            ctx.fillStyle = "#c2453a";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mx - 2, r.y + 2, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fill();
        });
    }

    NK.Tavle = { layout: layout, tegn: tegn, papir: papir };
}());

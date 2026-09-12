/* =====================================================================
   tegning.js - de tre ting, begge faner tegner: en ion, et vandmolekyle
   og et baegerglas.

   Farvesproget er det samme hele vejen igennem:
     positiv ion  = varm roed      negativ ion = kold blaa
     oxygen (δ−)  = roed           hydrogen (δ+) = lys graa
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    NK.Tegn = T;

    T.OXYGEN   = "#e05446";
    T.HYDROGEN = "#e6ebf0";

    /* ----- Ionen ------------------------------------------------------- */
    /* r er radius i pixels. Teksten krymper selv, til den kan vaere inde
       i cirklen - SO₄²⁻ fylder mere end Na⁺. */
    T.ion = function (ctx, x, y, ion, r, opt) {
        opt = opt || {};
        var positiv = ion.q > 0;
        var alpha = opt.alpha === undefined ? 1 : opt.alpha;

        ctx.save();
        ctx.globalAlpha = alpha;

        var g = ctx.createRadialGradient(x - r * 0.36, y - r * 0.4, r * 0.1, x, y, r);
        if (positiv) { g.addColorStop(0, "#ff9c8e"); g.addColorStop(1, "#b6362a"); }
        else         { g.addColorStop(0, "#8ed0ff"); g.addColorStop(1, "#1a6099"); }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = Math.max(1, r * 0.09);
        ctx.strokeStyle = opt.fremhaev
            ? "#f2c53d"
            : (positiv ? "rgba(255, 190, 180, 0.55)" : "rgba(170, 215, 250, 0.55)");
        ctx.stroke();

        if (r >= 8) {
            var tekst = ion.formel + NK.ladningHaevet(ion.q);
            var stoerrelse = r * 0.80;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            do {
                ctx.font = "600 " + stoerrelse.toFixed(1) + "px 'Segoe UI', sans-serif";
                if (ctx.measureText(tekst).width <= r * 1.72) break;
                stoerrelse -= 0.8;
            } while (stoerrelse > 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(tekst, x, y + r * 0.03);
        }
        ctx.restore();
    };

    /* Den vandskal, der lukker sig om en ion, naar den er kommet fri.
       Tegnes som et svagt skaer plus nogle faa smaa vandmolekyler. */
    T.vandskal = function (ctx, x, y, r, fase, antal) {
        var i, vinkel;
        ctx.save();
        var g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.05);
        g.addColorStop(0, "rgba(150, 200, 240, 0.20)");
        g.addColorStop(1, "rgba(150, 200, 240, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        for (i = 0; i < antal; i++) {
            vinkel = fase + i * (Math.PI * 2 / antal);
            T.vand(ctx,
                x + Math.cos(vinkel) * r * 1.52,
                y + Math.sin(vinkel) * r * 1.52,
                vinkel + Math.PI / 2,
                r * 0.030,
                { alpha: 0.5 });
        }
    };

    /* ----- Vandmolekylet ------------------------------------------------ */
    /* Tegnes om (0,0) med oxygen i midten og de to hydrogener nedad.
       δ−-enden peger altsaa "opad" i molekylets eget koordinatsystem, og
       vinklen i T.vand drejer hele molekylet.
       T.vendMod giver den vinkel, der vender den rigtige ende ind mod en
       ion - det er hele pointen med polariteten. */
    T.vendMod = function (fraX, fraY, ionX, ionY, positivIon) {
        var v = Math.atan2(ionY - fraY, ionX - fraX);
        return positivIon ? v + Math.PI / 2 : v - Math.PI / 2;
    };

    T.vand = function (ctx, x, y, vinkel, skala, opt) {
        opt = opt || {};
        var oR = 12 * skala;
        var hR = 7 * skala;
        var hx = 12.4 * skala;      /* ~104° mellem bindingerne */
        var hy = 16.2 * skala;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vinkel);
        ctx.globalAlpha = opt.alpha === undefined ? 1 : opt.alpha;

        ctx.strokeStyle = "rgba(226, 234, 242, 0.55)";
        ctx.lineWidth = Math.max(1, 2.6 * skala);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-hx, hy);
        ctx.moveTo(0, 0); ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.fillStyle = T.HYDROGEN;
        ctx.beginPath();
        ctx.arc(-hx, hy, hR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx, hy, hR, 0, Math.PI * 2);
        ctx.fill();

        /* De smaa molekyler faar en flad farve: der er mange af dem paa
           skaermen, og en farveovergang pr. stk. koster for meget. */
        if (skala >= 0.6) {
            var g = ctx.createRadialGradient(-oR * 0.3, -oR * 0.35, oR * 0.1, 0, 0, oR);
            g.addColorStop(0, "#f08b80");
            g.addColorStop(1, "#bf3628");
            ctx.fillStyle = g;
        } else {
            ctx.fillStyle = T.OXYGEN;
        }
        ctx.beginPath();
        ctx.arc(0, 0, oR, 0, Math.PI * 2);
        ctx.fill();

        /* δ-maerkerne staar kun paa de store molekyler - ellers bliver
           billedet til stoej. */
        if (opt.delta && skala >= 0.85) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "600 " + (10 * skala).toFixed(1) + "px 'Segoe UI', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("δ−", 0, 0);
            ctx.fillStyle = "#3a3a47";
            ctx.font = "600 " + (8 * skala).toFixed(1) + "px 'Segoe UI', sans-serif";
            ctx.fillText("δ+", -hx, hy);
            ctx.fillText("δ+", hx, hy);
        }
        ctx.restore();
    };

    /* ----- Baegerglasset ------------------------------------------------- */
    /* x, y, b, h er glassets indvendige maal. vandTop er y-vaerdien for
       vandoverfladen. farve toner vandet, saa fx CuSO₄ kan farve det blaat. */
    T.glas = function (ctx, x, y, b, h, vandTop, farve, klarhed) {
        var bund = y + h;

        ctx.save();

        /* Vandet */
        var v = ctx.createLinearGradient(0, vandTop, 0, bund);
        v.addColorStop(0, "rgba(58, 110, 150, 0.30)");
        v.addColorStop(1, "rgba(30, 66, 96, 0.46)");
        ctx.fillStyle = v;
        ctx.fillRect(x, vandTop, b, bund - vandTop);

        if (farve && klarhed > 0.01) {
            ctx.globalAlpha = NK.klamp(klarhed, 0, 1) * 0.55;
            ctx.fillStyle = farve;
            ctx.fillRect(x, vandTop, b, bund - vandTop);
            ctx.globalAlpha = 1;
        }

        /* Overfladen */
        ctx.strokeStyle = "rgba(180, 220, 250, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, vandTop);
        ctx.lineTo(x + b, vandTop);
        ctx.stroke();

        /* Selve glasset: to sider og en bund, aabent foroven */
        ctx.strokeStyle = "rgba(200, 220, 240, 0.42)";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x, bund - 10);
        ctx.quadraticCurveTo(x, bund, x + 10, bund);
        ctx.lineTo(x + b - 10, bund);
        ctx.quadraticCurveTo(x + b, bund, x + b, bund - 10);
        ctx.lineTo(x + b, y - 14);
        ctx.stroke();

        /* Et enkelt lysglimt ned ad venstre side */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x + 12, vandTop + 22);
        ctx.lineTo(x + 12, bund - 26);
        ctx.stroke();

        ctx.restore();
    };
}());

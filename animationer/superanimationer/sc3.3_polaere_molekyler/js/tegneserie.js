/* =====================================================================
   tegneserie.js - vandstraaleforsoeget opsummeret som en tegneserie

   Bag knappen i panelet paa fane 3, som laases op, naar skemaet er
   udfyldt. Hver rude er et lille laerred tegnet med vand_tegning.js og
   en kort tekst. Resultatskemaet fra panelet staar i sidste rude.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.VandTegning;
    var M = T.MAAL;

    var B = 300, H = 300;
    var UDSNIT = { x: 150, y: 76, b: 500, h: 474 };

    function udsving(v) {
        var p = D.VAESKER[v].pol;
        return p >= 0.8 ? 58 : p >= 0.3 ? 26 : 0;
    }

    function rude(container, nr, tekst, tegn) {
        var div = document.createElement("div");
        div.className = "rude";
        var canvas = document.createElement("canvas");
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(B * dpr);
        canvas.height = Math.round(H * dpr);
        var ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        T.vaeg(ctx, B, H);
        tegn(ctx);
        div.appendChild(canvas);
        var p = document.createElement("p");
        var sp = document.createElement("span");
        sp.className = "nr";
        sp.textContent = String(nr);
        p.appendChild(sp);
        p.appendChild(document.createTextNode(tekst));
        div.appendChild(p);
        container.appendChild(div);
    }

    /* Et udsnit af scenen omkring hanerne og vasken. */
    function scene(ctx, fn) {
        var s = Math.min(B / UDSNIT.b, H / UDSNIT.h);
        ctx.save();
        ctx.translate((B - UDSNIT.b * s) / 2 - UDSNIT.x * s, (H - UDSNIT.h * s) / 2 - UDSNIT.y * s);
        ctx.scale(s, s);
        T.bord(ctx);
        T.vask(ctx);
        fn(ctx);
        ctx.restore();
    }

    function stav(id, tip, ladning) {
        var s = NK.SimVandstraale.STAVE[id];
        return { sprite: s.sprite, tegn: s.tegn, tip: tip, vinkel: 16 * Math.PI / 180, ladning: ladning };
    }

    /* Straale af vaesken v med en ladet stav ved siden af. */
    function forsoegsbillede(ctx, v, stavId) {
        scene(ctx, function (c) {
            var d = udsving(v);
            var x0 = T.hane(v).x;
            T.haner(c, v, null);
            T.straale(c, T.boejetStraale(v, d), D.VAESKER[v].farve);
            var y = 372;
            var t = (y - M.TUD_Y) / (M.VASK.top - M.TUD_Y);
            T.stav(c, stav(stavId, { x: x0 + d * t * t + 34, y: y }, 1));
        });
    }

    NK.Tegneserie = {
        byg: function (sim, container) {
            container.innerHTML = "";
            var nr = 0;

            rude(container, ++nr, "Hanen åbnes. Strålen løber lige ned i vasken.", function (ctx) {
                scene(ctx, function (c) {
                    T.haner(c, "vand", null);
                    T.straale(c, T.boejetStraale("vand", 0), D.VAESKER.vand.farve);
                });
            });

            rude(container, ++nr, "Stavene gnides med uldkluden. Plastikstaven bliver negativ, og glasstaven bliver positiv.", function (ctx) {
                NK.Sprites.tegn(ctx, "uldklud", 60, 150, 180, 67);
                T.stav(ctx, { sprite: "plastikstav", tegn: -1, tip: { x: 40, y: 175 }, vinkel: -0.08, ladning: 1 });
                T.stav(ctx, { sprite: "glasstav", tegn: 1, tip: { x: 70, y: 262 }, vinkel: -0.05, ladning: 1 });
                T.gnister(ctx, [{ x: 120, y: 160, liv: 1 }, { x: 170, y: 150, liv: 0.8 }, { x: 205, y: 166, liv: 0.6 }]);
            });

            var TEKST = {
                vand: "Vand: strålen bøjer tydeligt mod den ladede stav.",
                ethanol: "Ethanol: strålen bøjer lidt mod staven.",
                heptan: "Heptan: strålen løber lige ned, selvom staven holdes lige så tæt på."
            };
            D.VAESKE_ORDEN.forEach(function (v) {
                rude(container, ++nr, TEKST[v], function (ctx) { forsoegsbillede(ctx, v, "plastik"); });
            });

            rude(container, ++nr, "Glasstaven er positiv, men vandstrålen bøjer også mod den.", function (ctx) {
                forsoegsbillede(ctx, "vand", "glas");
            });

            rude(container, ++nr, "Vandmolekylerne drejer, så den modsat ladede ende vender mod staven. Derfor trækkes vandet mod både en negativ og en positiv stav.", function (ctx) {
                [[80, -1, "negativ stav"], [220, 1, "positiv stav"]].forEach(function (l) {
                    ctx.save();
                    ctx.translate(l[0], 128);
                    ctx.scale(0.54, 0.54);
                    T.lup(ctx, 0, 0, 118, "vand", l[1], 1, 0, 1, false);
                    ctx.restore();
                    NK.tekst(ctx, l[2], l[0], 222, { font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: l[1] < 0 ? "#8fcaf0" : "#f39a8f" });
                });
            });

            var sidste = document.createElement("div");
            sidste.className = "rude";
            var overskrift = document.createElement("p");
            var nrSpan = document.createElement("span");
            nrSpan.className = "nr";
            nrSpan.textContent = String(++nr);
            overskrift.appendChild(nrSpan);
            overskrift.appendChild(document.createTextNode("Resultater: bøjer strålen mod staven?"));
            sidste.appendChild(overskrift);
            sidste.appendChild(NK.SimVandstraale.resultatTabel(sim));
            container.appendChild(sidste);
        }
    };
}());

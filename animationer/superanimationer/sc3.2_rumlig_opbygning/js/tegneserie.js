/* =====================================================================
   tegneserie.js - vandstraaleforsoeget opsummeret som en tegneserie

   Bag knappen i panelet paa fane 4, som laases op, naar forsoeget er
   slut. Hver rude er et lille laerred tegnet med vand_tegning.js og en
   kort tekst. Ruderne bruger elevens egne resultater: hvilken stav der
   blev brugt til hver vaeske, og om heptan ligger oven paa vandet i
   baegerglasset. Resultatskemaet staar i sidste rude.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.VandTegning;
    var M = T.MAAL;

    var B = 300, H = 300;
    var UDSNIT = { x: 240, y: 14, b: 380, h: 536 };

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function afboejning(v) {
        var p = D.VAESKER[v].pol;
        return p >= 0.8 ? "bøjer tydeligt" : p >= 0.3 ? "bøjer lidt" : "løber lige ned";
    }

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

    /* Et udsnit af scenen omkring buretten og baegerglasset. */
    function scene(ctx, fn) {
        var s = Math.min(B / UDSNIT.b, H / UDSNIT.h);
        ctx.save();
        ctx.translate((B - UDSNIT.b * s) / 2 - UDSNIT.x * s, (H - UDSNIT.h * s) / 2 - UDSNIT.y * s);
        ctx.scale(s, s);
        T.bord(ctx);
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
            var indhold = { vand: 0, ethanol: 0, heptan: 0 };
            indhold[v] = 40;
            T.burette(c, 16, v, true);
            T.straale(c, T.boejetStraale(d), D.VAESKER[v].farve);
            T.baeger(c, indhold);
            var y = 372;
            var t = (y - M.TIP.y) / (M.BAEGER.top - M.TIP.y);
            T.stav(c, stav(stavId, { x: M.TIP.x + d * t * t + 34, y: y }, 1));
        });
    }

    function resultatTabel(sim) {
        var tabel = document.createElement("table");
        tabel.className = "resultater";
        var hoved = document.createElement("tr");
        ["", "Plastikstav (−)", "Glasstav (+)"].forEach(function (t) {
            var th = document.createElement("th");
            th.textContent = t;
            hoved.appendChild(th);
        });
        tabel.appendChild(hoved);
        D.VAESKE_ORDEN.forEach(function (v) {
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            th.textContent = stort(D.VAESKER[v].navn);
            tr.appendChild(th);
            ["plastik", "glas"].forEach(function (id) {
                var td = document.createElement("td");
                td.textContent = sim.resultater[v][id] ? afboejning(v) : "ikke testet";
                if (!sim.resultater[v][id]) td.className = "ikke";
                tr.appendChild(td);
            });
            tabel.appendChild(tr);
        });
        return tabel;
    }

    NK.Tegneserie = {
        resultatTabel: resultatTabel,

        byg: function (sim, container) {
            container.innerHTML = "";
            var nr = 0;
            var r = sim.resultater;

            rude(container, ++nr, "Buretten fyldes, og hanen åbnes. Strålen løber lige ned i bægerglasset.", function (ctx) {
                scene(ctx, function (c) {
                    T.burette(c, 24, "vand", true);
                    T.straale(c, T.boejetStraale(0), D.VAESKER.vand.farve);
                    T.baeger(c, { vand: 30 });
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
                var stavId = r[v].plastik ? "plastik" : "glas";
                rude(container, ++nr, TEKST[v], function (ctx) { forsoegsbillede(ctx, v, stavId); });
            });

            if (r.vand.plastik && r.vand.glas) {
                rude(container, ++nr, "Glasstaven er positiv, men vandstrålen bøjer også mod den.", function (ctx) {
                    forsoegsbillede(ctx, "vand", "glas");
                });
            }

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

            var vandig = sim.baeger.vand + sim.baeger.ethanol;
            if (sim.baeger.heptan > 0.5 && vandig > 0.5) {
                rude(container, ++nr, "I bægerglasset ligger heptan oven på vand og ethanol. Polære og upolære væsker blandes ikke.", function (ctx) {
                    ctx.save();
                    ctx.translate(B / 2 - 390 * 2, H / 2 - 490 * 2);
                    ctx.scale(2, 2);
                    T.bord(ctx);
                    T.baeger(ctx, sim.baeger);
                    ctx.restore();
                });
            }

            var sidste = document.createElement("div");
            sidste.className = "rude";
            var overskrift = document.createElement("p");
            var nrSpan = document.createElement("span");
            nrSpan.className = "nr";
            nrSpan.textContent = String(++nr);
            overskrift.appendChild(nrSpan);
            overskrift.appendChild(document.createTextNode("Resultater: bøjer strålen mod staven?"));
            sidste.appendChild(overskrift);
            sidste.appendChild(resultatTabel(sim));
            container.appendChild(sidste);
        }
    };
}());

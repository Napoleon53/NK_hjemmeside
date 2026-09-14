/* =====================================================================
   tegneserie.js - forsoeget opsummeret som en tegneserie

   Bag knappen Tegneserie, som laases op, naar forsoeget er slut. Hver
   rude er et lille laerred, tegnet med de samme funktioner som scenen,
   og en kort tekst. Ruderne bruger elevens egne resultater: hvilket
   glas der stod i lys, pH-vaerdierne og bundfaldet. Var der et uheld,
   faar det sin egen rude.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;

    var B = 300, H = 214;
    var GLAS_Y = 24;

    function glasObj(x, brHex, brVand, opt) {
        opt = opt || {};
        var g = { brom: true, brHex: brHex, brVand: brVand };
        return {
            p: { x: x, y: GLAS_Y, v: 0 },
            vandAreal: S.VAND_AREAL, hexAreal: opt.udenHexan ? 0 : S.HEX_AREAL,
            vandFarve: M.vandFarve(g), hexFarve: M.hexanFarve(g),
            bundfald: opt.bundfald || 0, uklar: 0, boelge: opt.boelge || 0,
            folie: opt.folie || 0, fremhaev: false, nr: opt.nr || 0, valgt: false,
            strimmel: opt.strimmel || null
        };
    }

    function tekst(ctx, t, x, y, opt) {
        NK.tekst(ctx, t, x, y, { font: (opt && opt.font) || "700 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: (opt && opt.farve) || "#dfe5ec" });
    }

    function pil(ctx, x, y, retning) {
        ctx.save();
        ctx.strokeStyle = "#f2c53d";
        ctx.fillStyle = "#f2c53d";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - 14 * retning, y);
        ctx.lineTo(x + 10 * retning, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 14 * retning, y);
        ctx.lineTo(x + 6 * retning, y - 5);
        ctx.lineTo(x + 6 * retning, y + 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function rude(container, nr, tekstStr, tegn) {
        var div = document.createElement("div");
        div.className = "rude";
        var canvas = document.createElement("canvas");
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(B * dpr);
        canvas.height = Math.round(H * dpr);
        var ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#262b33");
        g.addColorStop(1, "#1a1e25");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, B, H);
        ctx.fillStyle = "#3b404b";
        ctx.fillRect(0, GLAS_Y + 160, B, 16);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(0, GLAS_Y + 160, B, 1.5);
        tegn(ctx);
        div.appendChild(canvas);
        var p = document.createElement("p");
        var sp = document.createElement("span");
        sp.className = "nr";
        sp.textContent = String(nr);
        p.appendChild(sp);
        p.appendChild(document.createTextNode(tekstStr));
        div.appendChild(p);
        container.appendChild(div);
    }

    function stripObj(x, farve) {
        return { p: { x: x, y: GLAS_Y + 72, v: 0 }, farve: farve, dyp: 0.5, alfa: 1 };
    }

    function pHTekst(gl) {
        if (gl.ph === null) return "ikke testet";
        return "pH ≈ " + Math.round(gl.ph) + " (" + M.pHTekst(gl.ph) + ")";
    }

    NK.Tegneserie = {
        byg: function (f, container) {
            container.innerHTML = "";
            var g1 = f.g.glas1, g2 = f.g.glas2;
            var lys = g1.lysTid >= g2.lysTid ? g1 : g2;
            var moerk = lys === g1 ? g2 : g1;
            var vX = 105, hX = 195;
            var nr = 0;

            rude(container, ++nr, "Bromvand er orange. Hexan er farveløst og lægger sig oven på vandet, fordi det ikke blandes med vand og har lavere densitet.", function (ctx) {
                S.tegnReagensglas(ctx, glasObj(vX, 0, 1, { nr: 1 }), 0);
                S.tegnReagensglas(ctx, glasObj(hX, 0, 1, { nr: 2 }), 0);
                tekst(ctx, "hexan", 40, GLAS_Y + 50, { farve: "#c8ced6" });
                tekst(ctx, "bromvand", 40, GLAS_Y + 120, { farve: "#f0a060" });
            });

            rude(container, ++nr, "Efter rystning er den orange farve flyttet op i hexanlaget. Br₂ er upolært og opløses bedst i det upolære hexan.", function (ctx) {
                S.tegnReagensglas(ctx, glasObj(vX, 0.97, 0.03, { nr: 1, boelge: 2 }), 0.4);
                S.tegnReagensglas(ctx, glasObj(hX, 0.97, 0.03, { nr: 2, boelge: 2 }), 0.9);
                pil(ctx, vX - 40, GLAS_Y + 20, -1);
                pil(ctx, hX + 40, GLAS_Y + 20, 1);
                tekst(ctx, M.formel("Br2"), 40, GLAS_Y + 60, { farve: "#f0a060" });
                pil(ctx, 40, GLAS_Y + 80, 1);
            });

            rude(container, ++nr, "Glas " + lys.nr + " står under lampen, og glas " + moerk.nr + " er pakket ind i alufolie som kontrolforsøg. Kun lyset er forskelligt.", function (ctx) {
                ctx.save();
                ctx.translate(vX, 0);
                ctx.scale(0.5, 0.5);
                S.tegnStorLampe(ctx, 0, 30, 1, 0);
                ctx.restore();
                S.tegnReagensglas(ctx, glasObj(vX, 0.97, 0.03, { nr: lys.nr }), 0);
                S.tegnReagensglas(ctx, glasObj(hX, 0.97, 0.03, { nr: moerk.nr, folie: 1 }), 0);
                tekst(ctx, "lys", vX, GLAS_Y + 178, { farve: "#f2c53d" });
                tekst(ctx, "mørke", hX, GLAS_Y + 178, { farve: "#c8ced6" });
            });

            rude(container, ++nr, "I lyset forsvinder farven: " + M.ligning(M.REAKTIONER.substitution) + ". I mørket sker der ingenting, og glas " + moerk.nr + " er stadig orange.", function (ctx) {
                S.tegnReagensglas(ctx, glasObj(vX, 0.02, 0.01, { nr: lys.nr }), 0);
                S.tegnReagensglas(ctx, glasObj(hX, 0.97, 0.03, { nr: moerk.nr }), 0);
                tekst(ctx, "farveløs", vX, GLAS_Y + 178, { farve: "#c8ced6" });
                tekst(ctx, "orange", hX, GLAS_Y + 178, { farve: "#f0a060" });
            });

            rude(container, ++nr, "pH-papir i vandfasen: glas " + lys.nr + " " + pHTekst(lys) + ", glas " + moerk.nr + " " + pHTekst(moerk) + ". " + M.ligning(M.REAKTIONER.syre) + ".", function (ctx) {
                var f1 = lys.phFarve || M.pHFarve(M.pH(lys.reageret));
                var f2 = moerk.phFarve || M.pHFarve(M.pH(moerk.reageret));
                S.tegnReagensglas(ctx, glasObj(vX, 0.02, 0.01, { nr: lys.nr, strimmel: stripObj(vX, f1) }), 0);
                S.tegnReagensglas(ctx, glasObj(hX, 0.97, 0.03, { nr: moerk.nr, strimmel: stripObj(hX, f2) }), 0);
                tekst(ctx, lys.ph === null ? "" : "pH ≈ " + Math.round(lys.ph), vX, GLAS_Y + 178, { farve: NK.css(f1) });
                tekst(ctx, moerk.ph === null ? "" : "pH ≈ " + Math.round(moerk.ph), hX, GLAS_Y + 178, { farve: NK.css(f2) });
            });

            var bund1 = lys.reageret > 0.5, bund2 = moerk.reageret > 0.5;
            rude(container, ++nr, "AgNO₃ i vandfasen: " + (bund1 ? "lysegult bundfald i glas " + lys.nr : "intet bundfald i glas " + lys.nr) + ", " + (bund2 ? "bundfald i glas " + moerk.nr : "ingen forandring i glas " + moerk.nr) + ". " + M.ligning(M.REAKTIONER.faeldning) + ".", function (ctx) {
                S.tegnReagensglas(ctx, glasObj(vX, 0.02, 0.01, { nr: lys.nr, bundfald: bund1 ? 1 : 0, udenHexan: false }), 0);
                S.tegnReagensglas(ctx, glasObj(hX, 0.97, 0.03, { nr: moerk.nr, bundfald: bund2 ? 1 : 0 }), 0);
                S.tegnDraaber(ctx, [{ x: vX, y: GLAS_Y - 8, r: 3.4, liv: 1, farveloes: true }, { x: hX, y: GLAS_Y - 8, r: 3.4, liv: 1, farveloes: true }]);
                tekst(ctx, M.formel("Ag+") + " + " + M.formel("NO3-"), 40, GLAS_Y + 8, { farve: "#c8ced6", font: "700 11px 'Segoe UI', sans-serif" });
                tekst(ctx, bund1 ? "AgBr(s)" : "intet", vX, GLAS_Y + 178, { farve: bund1 ? "#fff0b0" : "#c8ced6" });
                tekst(ctx, bund2 ? "AgBr(s)" : "intet", hX, GLAS_Y + 178, { farve: bund2 ? "#fff0b0" : "#c8ced6" });
            });

            rude(container, ++nr, "Forskellen mellem de to glas skyldes lyset. Lyset spalter Br₂, og et Br-atom erstatter et H-atom i hexan: en substitution. HBr i vandfasen viser det.", function (ctx) {
                ctx.save();
                ctx.translate(150, 0);
                ctx.scale(0.5, 0.5);
                S.tegnStorLampe(ctx, 0, 30, 1, 0);
                ctx.restore();
                tekst(ctx, "hν", 150, GLAS_Y + 40, { farve: "#ffe58a", font: "700 16px 'Segoe UI', sans-serif" });
                tekst(ctx, M.ligning(M.REAKTIONER.substitution), 150, GLAS_Y + 90, { farve: "#7ee0a8", font: "700 14px 'Segoe UI', sans-serif" });
                tekst(ctx, "kun i lys", 150, GLAS_Y + 118, { farve: "#c8ced6" });
                tekst(ctx, "i mørke: ingen reaktion", 150, GLAS_Y + 140, { farve: "#c8ced6" });
            });

            [g1, g2].forEach(function (gl) {
                if (!f.iagttaget["uheld" + gl.nr]) return;
                rude(container, ++nr, "Uheld: proppen sprang af glas " + gl.nr + " under voldsom rystning, og indholdet blev tørret op. Glasset blev fyldt igen.", function (ctx) {
                    S.tegnReagensglas(ctx, glasObj(vX, 0, 0, { nr: gl.nr, udenHexan: true }), 0);
                    NK.Sprites.tegnPositur(ctx, "prop", { x: vX + 46, y: GLAS_Y - 4, v: 0.9 }, S.ANKER.prop);
                    ctx.fillStyle = NK.css(M.FARVE.bromvand, 1);
                    ctx.beginPath();
                    ctx.ellipse(hX, GLAS_Y + 162, 46, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    S.tegnDraaber(ctx, [{ x: vX + 30, y: GLAS_Y + 10, r: 2.6, liv: 1, farve: M.FARVE.bromvand }, { x: vX + 44, y: GLAS_Y + 26, r: 2.2, liv: 1, farve: M.FARVE.bromvand }, { x: vX + 20, y: GLAS_Y - 6, r: 2.4, liv: 1, farve: M.FARVE.bromvand }]);
                    tekst(ctx, "pop", vX + 50, GLAS_Y + 40, { farve: "#f0918a" });
                });
            });
        }
    };
}());

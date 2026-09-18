/* =====================================================================
   graf.js - soejlediagrammet under scenen

   Én soejle for hver af de syv blandinger, der kan testes med et fuldt
   glas (0 : 6 til 6 : 0). En blanding, der ikke er testet endnu, staar
   som en stiplet plads med et spoergsmaalstegn. Den seneste maaling
   faar en gul kant et par sekunder, saa knaldet og soejlen haenger
   sammen. Naar alle syv er testet, bliver den kraftigste soejle gul.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;
    var S = NK.Scene;

    NK.Graf = function (canvas) {
        this.laerred = new NK.Laerred(canvas);
        this.vist = {};
    };

    NK.Graf.prototype.tilpas = function () {
        return this.laerred.tilpas();
    };

    NK.Graf.prototype.opdater = function (dt, resultater) {
        for (var h = 0; h <= M.MAKS; h++) {
            var maal = resultater[h] === undefined ? 0 : resultater[h];
            var nu = this.vist[h] || 0;
            this.vist[h] = resultater[h] === undefined ? 0 : NK.mod(nu, maal, 7, dt);
        }
    };

    NK.Graf.prototype.tegn = function (f) {
        var L = this.laerred;
        var ctx = L.ctx;
        var res = f.resultater;
        var alle = f.antalTestet() === M.BLANDINGER.length;
        ctx.clearRect(0, 0, L.b, L.h);

        var venstre = 14, hoejre = 14, top = 26, bund = 30;
        var plotB = L.b - venstre - hoejre;
        var plotH = L.h - top - bund;
        var basis = top + plotH;
        var felt = plotB / M.BLANDINGER.length;
        var soejle = Math.min(64, felt * 0.6);

        /* Hjaelpelinjer ved 25, 50, 75 og 100 % */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        for (var g = 1; g <= 4; g++) {
            var gy = Math.round(basis - plotH * g / 4) + 0.5;
            ctx.beginPath();
            ctx.moveTo(venstre, gy);
            ctx.lineTo(venstre + plotB, gy);
            ctx.stroke();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.beginPath();
        ctx.moveTo(venstre, basis + 0.5);
        ctx.lineTo(venstre + plotB, basis + 0.5);
        ctx.stroke();
        ctx.restore();

        var bedst = -1, bedstVaerdi = -1;
        for (var k = 0; k <= M.MAKS; k++) {
            if (res[k] !== undefined && res[k] > bedstVaerdi) { bedstVaerdi = res[k]; bedst = k; }
        }

        for (var h = 0; h <= M.MAKS; h++) {
            var o = M.MAKS - h;
            var cx = venstre + felt * (h + 0.5);
            var x = cx - soejle / 2;
            var testet = res[h] !== undefined;

            if (!testet) {
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
                NK.rundtRekt(ctx, x + 0.5, top + 0.5, soejle - 1, plotH - 1, 5);
                ctx.stroke();
                ctx.restore();
                NK.tekst(ctx, "?", cx, top + plotH / 2, {
                    font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                    farve: "rgba(255, 255, 255, 0.3)"
                });
            } else {
                var hoejde = Math.max(3, plotH * (this.vist[h] || 0) / 100);
                var erBedst = alle && h === bedst;
                var gr = ctx.createLinearGradient(0, basis - hoejde, 0, basis);
                if (erBedst) {
                    gr.addColorStop(0, "#f7d774");
                    gr.addColorStop(1, "#c99a1e");
                } else {
                    gr.addColorStop(0, "#5cb3ec");
                    gr.addColorStop(1, "#2a76ac");
                }
                ctx.fillStyle = gr;
                NK.rundtRekt(ctx, x, basis - hoejde, soejle, hoejde, Math.min(5, hoejde / 2));
                ctx.fill();

                var alder = f.tid - f.senesteTid;
                if (h === f.senesteH && alder < 3) {
                    ctx.save();
                    ctx.globalAlpha = 1 - alder / 3;
                    ctx.strokeStyle = "#f2c53d";
                    ctx.lineWidth = 2.5;
                    NK.rundtRekt(ctx, x - 3, basis - hoejde - 3, soejle + 6, hoejde + 6, 6);
                    ctx.stroke();
                    ctx.restore();
                }

                if (erBedst) {
                    NK.tekst(ctx, "Kraftigst", cx, basis - hoejde - 8, {
                        font: "700 13px 'Segoe UI', sans-serif", justering: "center", farve: "#f2c53d"
                    });
                }
            }

            /* Blandingen under soejlen: H2-tal og O2-tal i hver sin farve */
            ctx.save();
            ctx.font = "700 14px 'Segoe UI', sans-serif";
            ctx.textBaseline = "middle";
            var tH = String(h), tS = " : ", tO = String(o);
            var bH = ctx.measureText(tH).width, bS = ctx.measureText(tS).width, bO = ctx.measureText(tO).width;
            var lx = cx - (bH + bS + bO) / 2, ly = basis + bund / 2 + 2;
            ctx.fillStyle = S.FARVE.h2;
            ctx.fillText(tH, lx, ly);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fillText(tS, lx + bH, ly);
            ctx.fillStyle = S.FARVE.o2;
            ctx.fillText(tO, lx + bH + bS, ly);
            ctx.restore();
        }
    };
}());

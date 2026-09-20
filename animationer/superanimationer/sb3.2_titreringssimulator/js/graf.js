/* =====================================================================
   graf.js - de to grafer i sb3.2

   NK.Kurve      titrerkurven:  pH mod tilsat volumen
   NK.Fordeling  fordelingsdiagram:  broekdel mod pH

   Begge tegner sig selv ud fra et tilstands-objekt, der gives med i
   tegn(). De husker ingenting selv, saa den samme graf kan bruges to
   steder med forskellige data.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var GITTER = "rgba(255, 255, 255, 0.07)";
    var GITTER_STAERK = "rgba(255, 255, 255, 0.2)";
    var AKSETEKST = "#8d95a1";

    /* ================================================================
       TITRERKURVEN
       ================================================================ */

    /* opt: { kompakt: mindre marginer og skrift } */
    NK.Kurve = function (canvas, opt) {
        this.l = new NK.Laerred(canvas);
        this.opt = opt || {};
        this.omraade = null;      /* saettes ved hver tegning, bruges af musen */
    };

    NK.Kurve.prototype.tilpas = function () {
        return this.l.tilpas();
    };

    /* Regner musens position om til (V, pH). Returnerer null uden for
       selve plottet. */
    NK.Kurve.prototype.fraSkaerm = function (x, y) {
        var o = this.omraade;
        if (!o) return null;
        if (x < o.venstre - 4 || x > o.hoejre + 4 || y < o.top - 4 || y > o.bund + 4) return null;
        return {
            V: (x - o.venstre) / (o.hoejre - o.venstre) * o.Vmaks,
            pH: o.pHTop - (y - o.top) / (o.bund - o.top) * (o.pHTop - o.pHBund)
        };
    };

    /* t = {
         Vmaks, kurver, dpH, aekv, halv, indikator, punkter, nu,
         visAekv, visHalv, visIndikator, markoer
       } */
    NK.Kurve.prototype.tegn = function (t) {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var kompakt = !!this.opt.kompakt;
        var i, j, k;

        ctx.clearRect(0, 0, b, h);

        var venstre = kompakt ? 34 : 48;
        var top = kompakt ? 10 : 18;
        var bund = h - (kompakt ? 22 : 34);
        var hoejre = b - ((t.dpH && !kompakt) ? 46 : (kompakt ? 10 : 16));
        if (hoejre - venstre < 40 || bund - top < 30) return;

        var Vmaks = t.Vmaks > 0 ? t.Vmaks : 1;
        var pHBund = 0, pHTop = 14;

        this.omraade = {
            venstre: venstre, hoejre: hoejre, top: top, bund: bund,
            Vmaks: Vmaks, pHBund: pHBund, pHTop: pHTop
        };

        function xTil(V) { return venstre + NK.klamp(V / Vmaks, -0.05, 1.05) * (hoejre - venstre); }
        function yTil(pH) { return bund - NK.klamp((pH - pHBund) / (pHTop - pHBund), -0.05, 1.05) * (bund - top); }

        /* ----- Bund ------------------------------------------------- */
        ctx.fillStyle = "#15151c";
        ctx.fillRect(venstre, top, hoejre - venstre, bund - top);

        /* ----- Indikatorens omslagsinterval som vandret baand ------- */
        if (t.visIndikator && t.indikator && t.indikator.lav !== undefined) {
            var yA = yTil(t.indikator.hoej), yB = yTil(t.indikator.lav);
            ctx.fillStyle = t.indikator.farve || "rgba(230, 137, 42, 0.16)";
            ctx.fillRect(venstre, yA, hoejre - venstre, yB - yA);
            if (!kompakt) {
                NK.tekst(ctx, t.indikator.navn, hoejre - 6, (yA + yB) / 2, {
                    font: "600 10px 'Segoe UI', sans-serif",
                    justering: "right", linje: "middle",
                    farve: "rgba(255, 255, 255, 0.6)"
                });
            }
        }

        /* ----- Gitter ----------------------------------------------- */
        ctx.font = (kompakt ? "9px" : "10px") + " 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        for (i = 0; i <= 14; i += 2) {
            var y = Math.round(yTil(i)) + 0.5;
            ctx.strokeStyle = (i === 0 || i === 14) ? GITTER_STAERK : GITTER;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(venstre, y);
            ctx.lineTo(hoejre, y);
            ctx.stroke();
            ctx.fillStyle = AKSETEKST;
            ctx.fillText(String(i), venstre - 5, y);
        }
        /* pH = 7 markeres, saa man kan se det neutrale */
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = "rgba(63, 174, 114, 0.35)";
        ctx.beginPath();
        ctx.moveTo(venstre, Math.round(yTil(7)) + 0.5);
        ctx.lineTo(hoejre, Math.round(yTil(7)) + 0.5);
        ctx.stroke();
        ctx.restore();

        var trin = NK.paenTrin(Vmaks / (kompakt ? 4 : 8));
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (var V = 0; V <= Vmaks + 1e-9; V += trin) {
            var x = Math.round(xTil(V)) + 0.5;
            ctx.strokeStyle = V === 0 ? GITTER_STAERK : GITTER;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bund);
            ctx.stroke();
            ctx.fillStyle = AKSETEKST;
            ctx.fillText(NK.tal(V, trin < 1 ? 1 : 0), x, bund + 4);
        }

        /* ----- Aksenavne -------------------------------------------- */
        if (!kompakt) {
            NK.tekst(ctx, "Tilsat titrator (mL)", (venstre + hoejre) / 2, h - 4, {
                font: "600 10px 'Segoe UI', sans-serif",
                justering: "center", linje: "bottom", farve: AKSETEKST
            });
            ctx.save();
            ctx.translate(11, (top + bund) / 2);
            ctx.rotate(-Math.PI / 2);
            NK.tekst(ctx, "pH", 0, 0, {
                font: "600 10px 'Segoe UI', sans-serif",
                justering: "center", linje: "middle", farve: AKSETEKST
            });
            ctx.restore();
        }

        /* ----- Halvtitrerpunkter (pKs aflaeses her) ----------------- */
        if (t.visHalv && t.halv) {
            for (i = 0; i < t.halv.length; i++) {
                var hp = t.halv[i];
                if (hp.V > Vmaks) continue;
                var hx = xTil(hp.V), hy = yTil(hp.pH);
                ctx.save();
                ctx.setLineDash([2, 3]);
                ctx.strokeStyle = "rgba(155, 107, 214, 0.75)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(hx, bund);
                ctx.lineTo(hx, hy);
                ctx.lineTo(venstre, hy);
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = "#9b6bd6";
                ctx.beginPath();
                ctx.arc(hx, hy, 3, 0, Math.PI * 2);
                ctx.fill();
                if (!kompakt) {
                    NK.tekst(ctx, "pKs = " + NK.tal(hp.pKa, 2), hx + 5, hy - 6, {
                        font: "600 10px 'Segoe UI', sans-serif",
                        farve: "#c4a4ee", kant: true
                    });
                }
            }
        }

        /* ----- Aekvivalenspunkter ----------------------------------- */
        if (t.visAekv && t.aekv) {
            for (i = 0; i < t.aekv.length; i++) {
                var ae = t.aekv[i];
                if (ae.V > Vmaks) continue;
                var ax = xTil(ae.V), ay = yTil(ae.pH);
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(ax, top);
                ctx.lineTo(ax, bund);
                ctx.stroke();
                ctx.restore();
                ctx.fillStyle = "#f2c53d";
                ctx.beginPath();
                ctx.arc(ax, ay, kompakt ? 3.5 : 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#15151c";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                if (!kompakt) {
                    NK.tekst(ctx, "Æ" + ae.nr, ax + 6, top + 10, {
                        font: "700 11px 'Segoe UI', sans-serif",
                        farve: "#f2c53d", kant: true
                    });
                }
            }
        }

        /* ----- Den afledte, dpH/dV, paa hoejre akse ----------------- */
        if (t.dpH && t.dpH.v && t.dpH.v.length > 1) {
            var maks = 0;
            for (i = 0; i < t.dpH.v.length; i++) if (t.dpH.v[i] > maks) maks = t.dpH.v[i];
            if (maks > 0) {
                var dTop = NK.paenTrin(maks * 1.15);
                ctx.save();
                ctx.beginPath();
                ctx.rect(venstre, top, hoejre - venstre, bund - top);
                ctx.clip();
                ctx.beginPath();
                for (i = 0; i < t.dpH.v.length; i++) {
                    var dx = xTil(t.dpH.V[i]);
                    var dy = bund - NK.klamp(t.dpH.v[i] / dTop, 0, 1) * (bund - top);
                    if (i === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
                }
                ctx.strokeStyle = "rgba(224, 84, 70, 0.85)";
                ctx.lineWidth = 1.6;
                ctx.lineJoin = "round";
                ctx.stroke();
                ctx.restore();

                if (!kompakt) {
                    ctx.textAlign = "left";
                    ctx.textBaseline = "middle";
                    ctx.font = "10px 'Segoe UI', sans-serif";
                    for (i = 0; i <= 2; i++) {
                        var dv = dTop * i / 2;
                        ctx.fillStyle = "rgba(224, 84, 70, 0.8)";
                        ctx.fillText(NK.tal(dv, dTop < 10 ? 1 : 0), hoejre + 5, bund - (i / 2) * (bund - top));
                    }
                    ctx.save();
                    ctx.translate(b - 6, (top + bund) / 2);
                    ctx.rotate(Math.PI / 2);
                    NK.tekst(ctx, "dpH/dV", 0, 0, {
                        font: "600 10px 'Segoe UI', sans-serif",
                        justering: "center", linje: "middle", farve: "rgba(224, 84, 70, 0.8)"
                    });
                    ctx.restore();
                }
            }
        }

        /* ----- Selve kurverne --------------------------------------- */
        ctx.save();
        ctx.beginPath();
        ctx.rect(venstre - 1, top - 1, hoejre - venstre + 2, bund - top + 2);
        ctx.clip();
        for (k = 0; t.kurver && k < t.kurver.length; k++) {
            var ku = t.kurver[k];
            if (!ku.V || ku.V.length < 2) continue;
            ctx.beginPath();
            for (i = 0; i < ku.V.length; i++) {
                var kx = xTil(ku.V[i]), ky = yTil(ku.pH[i]);
                if (i === 0) ctx.moveTo(kx, ky); else ctx.lineTo(kx, ky);
            }
            ctx.strokeStyle = ku.farve;
            ctx.lineWidth = ku.bredde || (kompakt ? 2 : 2.6);
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.globalAlpha = ku.svag ? 0.45 : 1;
            if (ku.stiplet) ctx.setLineDash([5, 4]); else ctx.setLineDash([]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }

        /* ----- Maalte punkter (elevens aflaesninger) ---------------- */
        if (t.punkter) {
            for (i = 0; i < t.punkter.length; i++) {
                ctx.beginPath();
                ctx.arc(xTil(t.punkter[i].V), yTil(t.punkter[i].pH), kompakt ? 1.8 : 2.4, 0, Math.PI * 2);
                ctx.fillStyle = t.punktFarve || "#3d9ee0";
                ctx.fill();
            }
        }

        /* ----- Hvor er vi lige nu? ---------------------------------- */
        if (t.nu) {
            var nx = xTil(t.nu.V), ny = yTil(t.nu.pH);
            ctx.save();
            ctx.setLineDash([2, 3]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nx, top);
            ctx.lineTo(nx, bund);
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
            ctx.arc(nx, ny, kompakt ? 4 : 5.5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#e05446";
            ctx.stroke();
        }

        /* ----- Musemarkoer ------------------------------------------ */
        if (t.markoer) {
            var mx = xTil(t.markoer.V);
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, 0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mx, top);
            ctx.lineTo(mx, bund);
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
            ctx.arc(mx, yTil(t.markoer.pH), 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "#f2c53d";
            ctx.fill();
        }
        ctx.restore();

        /* ----- Signaturforklaring ----------------------------------- */
        if (!kompakt && t.kurver) {
            var lx = venstre + 8;
            var ly = top + 10;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = "600 10px 'Segoe UI', sans-serif";
            for (k = 0; k < t.kurver.length; k++) {
                if (!t.kurver[k].navn) continue;
                var bredde = ctx.measureText(t.kurver[k].navn).width;
                if (lx + bredde + 22 > hoejre) break;
                ctx.strokeStyle = t.kurver[k].farve;
                ctx.lineWidth = 2.4;
                ctx.globalAlpha = t.kurver[k].svag ? 0.5 : 1;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx + 13, ly);
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#c8ced6";
                ctx.fillText(t.kurver[k].navn, lx + 17, ly);
                lx += 17 + bredde + 13;
            }
        }
    };

    /* ================================================================
       FORDELINGSDIAGRAM:  broekdel af hver form mod pH
       ================================================================ */
    NK.Fordeling = function (canvas) {
        this.l = new NK.Laerred(canvas);
        this.omraade = null;
    };

    NK.Fordeling.prototype.tilpas = function () {
        return this.l.tilpas();
    };

    NK.Fordeling.prototype.fraSkaerm = function (x, y) {
        var o = this.omraade;
        if (!o) return null;
        if (x < o.venstre - 4 || x > o.hoejre + 4) return null;
        return { pH: (x - o.venstre) / (o.hoejre - o.venstre) * 14 };
    };

    /* t = { stof, farver, pHNu, stablet, visPKa } */
    NK.Fordeling.prototype.tegn = function (t) {
        var ctx = this.l.ctx;
        var b = this.l.b;
        var h = this.l.h;
        var i, j;

        ctx.clearRect(0, 0, b, h);
        if (!t.stof) return;

        var venstre = 44, top = 16, bund = h - 34, hoejre = b - 14;
        if (hoejre - venstre < 40 || bund - top < 30) return;
        this.omraade = { venstre: venstre, hoejre: hoejre, top: top, bund: bund };

        function xTil(pH) { return venstre + NK.klamp(pH / 14, 0, 1) * (hoejre - venstre); }
        function yTil(f) { return bund - NK.klamp(f, 0, 1) * (bund - top); }

        ctx.fillStyle = "#15151c";
        ctx.fillRect(venstre, top, hoejre - venstre, bund - top);

        /* Gitter */
        ctx.font = "10px 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        for (i = 0; i <= 4; i++) {
            var y = Math.round(yTil(i / 4)) + 0.5;
            ctx.strokeStyle = (i === 0) ? GITTER_STAERK : GITTER;
            ctx.beginPath();
            ctx.moveTo(venstre, y);
            ctx.lineTo(hoejre, y);
            ctx.stroke();
            ctx.fillStyle = AKSETEKST;
            ctx.fillText(NK.tal(i * 25, 0) + " %", venstre - 5, y);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (i = 0; i <= 14; i += 2) {
            var x = Math.round(xTil(i)) + 0.5;
            ctx.strokeStyle = i === 0 ? GITTER_STAERK : GITTER;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bund);
            ctx.stroke();
            ctx.fillStyle = AKSETEKST;
            ctx.fillText(String(i), x, bund + 4);
        }
        NK.tekst(ctx, "pH", (venstre + hoejre) / 2, h - 4, {
            font: "600 10px 'Segoe UI', sans-serif",
            justering: "center", linje: "bottom", farve: AKSETEKST
        });

        /* Beregn alle kurver en gang */
        var N = Math.max(60, Math.min(360, Math.round(hoejre - venstre)));
        var n = t.stof.pKa.length;
        var data = [];
        for (i = 0; i <= N; i++) {
            data.push(NK.Kemi.fraktioner(i / N * 14, t.stof));
        }

        /* pKs-linjer: her krydser to nabo-former hinanden */
        if (t.visPKa !== false) {
            for (j = 0; j < n; j++) {
                var px = Math.round(xTil(t.stof.pKa[j])) + 0.5;
                if (t.stof.pKa[j] < 0 || t.stof.pKa[j] > 14) continue;
                ctx.save();
                ctx.setLineDash([3, 3]);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px, top);
                ctx.lineTo(px, bund);
                ctx.stroke();
                ctx.restore();
                NK.tekst(ctx, "pKs" + (n > 1 ? String(j + 1) : ""), px + 3, top + 8, {
                    font: "600 9px 'Segoe UI', sans-serif",
                    farve: "rgba(255, 255, 255, 0.5)"
                });
            }
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(venstre, top, hoejre - venstre, bund - top);
        ctx.clip();

        if (t.stablet) {
            /* Stablet areal: formerne lagt oven paa hinanden til 100 % */
            for (j = n; j >= 0; j--) {
                ctx.beginPath();
                for (i = 0; i <= N; i++) {
                    var sum = 0;
                    for (var m = j; m <= n; m++) sum += data[i][m];
                    var sx = xTil(i / N * 14);
                    var sy = yTil(sum);
                    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
                }
                ctx.lineTo(hoejre, bund);
                ctx.lineTo(venstre, bund);
                ctx.closePath();
                ctx.fillStyle = t.farver[j % t.farver.length];
                ctx.fill();
            }
        } else {
            for (j = 0; j <= n; j++) {
                /* svag udfyldning */
                ctx.beginPath();
                for (i = 0; i <= N; i++) {
                    var fx = xTil(i / N * 14), fy = yTil(data[i][j]);
                    if (i === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
                }
                ctx.lineTo(hoejre, bund);
                ctx.lineTo(venstre, bund);
                ctx.closePath();
                ctx.globalAlpha = 0.13;
                ctx.fillStyle = t.farver[j % t.farver.length];
                ctx.fill();
                ctx.globalAlpha = 1;

                ctx.beginPath();
                for (i = 0; i <= N; i++) {
                    var lx2 = xTil(i / N * 14), ly2 = yTil(data[i][j]);
                    if (i === 0) ctx.moveTo(lx2, ly2); else ctx.lineTo(lx2, ly2);
                }
                ctx.strokeStyle = t.farver[j % t.farver.length];
                ctx.lineWidth = 2.4;
                ctx.lineJoin = "round";
                ctx.stroke();
            }
        }

        /* Hvor er blandingen lige nu? */
        if (isFinite(t.pHNu)) {
            var nx = Math.round(xTil(t.pHNu)) + 0.5;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(nx, top);
            ctx.lineTo(nx, bund);
            ctx.stroke();
            var f = NK.Kemi.fraktioner(t.pHNu, t.stof);
            for (j = 0; j <= n; j++) {
                ctx.beginPath();
                ctx.arc(nx, yTil(f[j]), 3.6, 0, Math.PI * 2);
                ctx.fillStyle = t.farver[j % t.farver.length];
                ctx.fill();
                ctx.strokeStyle = "#15151c";
                ctx.lineWidth = 1.4;
                ctx.stroke();
            }
            NK.tekst(ctx, "pH = " + NK.tal(t.pHNu, 2), nx + 5, top + 8, {
                font: "700 11px 'Segoe UI', sans-serif", farve: "#ffffff", kant: true
            });
        }
        ctx.restore();

        /* Navne paa formerne */
        var navne = t.stof.former;
        if (navne && navne.length === n + 1) {
            var lx = venstre + 6, ly = bund - 10;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = "700 11px 'Segoe UI', sans-serif";
            for (j = n; j >= 0; j--) {
                var navn = navne[n - j];
                var w = ctx.measureText(navn).width;
                if (lx + w + 20 > hoejre) { lx = venstre + 6; ly -= 15; }
                ctx.fillStyle = t.farver[j % t.farver.length];
                NK.rundtRekt(ctx, lx, ly - 4.5, 9, 9, 2);
                ctx.fill();
                ctx.fillStyle = "#c8ced6";
                ctx.fillText(navn, lx + 13, ly);
                lx += 13 + w + 12;
            }
        }
    };
}());

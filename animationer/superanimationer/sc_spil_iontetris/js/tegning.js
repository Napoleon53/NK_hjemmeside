/* =====================================================================
   tegning.js - tegner brættet, brikkerne, gem og koeen

   Kun tegning: alt, der tegnes, kommer fra spillet (spil.js) og brættet
   (braet.js). Layoutet regnes ud fra laerredets stoerrelse hver gang,
   saa brættet altid fylder hoejden.

   Ioner tegnes i deres egen farve (blaa for plus, roed for minus) med
   symbolet midt paa brikken. Kanten om en brik viser, hvor den slutter,
   saa to Cl⁻ ved siden af hinanden kan taelles. Stenene er graa med
   prikker og har intet symbol. Salt lyser op, smuldrer
   og drysser ned som pulver, mens formlen svaever op.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Kemi = NK.Kemi;
    var Braet = NK.Braet;

    var SIDE = 4.8;     /* bredden af gem og koeen, i celler (smalt: 3,4) */
    var LUFT = 0.7;     /* luften mellem dem og brættet, i celler */

    function layout(b, h) {
        var side = b < 700 ? 3.4 : SIDE, luft = b < 700 ? 0.4 : LUFT;
        var s = Math.floor(Math.min((h - 30) / D.HOEJDE, (b - 24) / (D.BREDDE + 2 * (side + luft))));
        s = NK.klamp(s, 12, 46);
        var bw = D.BREDDE * s, bh = D.HOEJDE * s;
        var x0 = Math.round((b - bw) / 2), y0 = Math.round((h - bh) / 2);
        return {
            s: s, x0: x0, y0: y0, bw: bw, bh: bh,
            gem: { x: Math.round(x0 - (luft + side) * s), y: y0, b: Math.round(side * s), h: Math.round(4.3 * s) },
            naeste: { x: Math.round(x0 + bw + luft * s), y: y0, b: Math.round(side * s), h: Math.round((1.3 + 3.1 * D.NAESTE) * s) }
        };
    }

    /* ----- Farver ------------------------------------------------------------ */
    function hex(f) {
        var n = parseInt(f.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    /* Blander to farver (#rrggbb) og giver en ny #rrggbb */
    function bland(a, b, t) {
        var x = hex(a), y = hex(b), ud = "#";
        for (var i = 0; i < 3; i++) {
            var v = Math.round(x[i] + (y[i] - x[i]) * t);
            ud += (v < 16 ? "0" : "") + v.toString(16);
        }
        return ud;
    }

    var saltFarver = {};
    function saltFarve(s) {
        var n = s.kat.id + "-" + s.an.id;
        if (!saltFarver[n]) saltFarver[n] = bland(bland("#eef1f5", s.kat.farve, 0.2), s.an.farve, 0.1);
        return saltFarver[n];
    }

    /* ----- Celler ------------------------------------------------------------
       samme(dx, dy): hoerer nabocellen til samme brik (eller samme salt)?
       Siderne uden nabo faar en kant. */
    function tegnCelle(ctx, px, py, s, farve, samme, lys) {
        var k = Math.max(1, Math.round(s * 0.06));
        var v = samme(-1, 0) ? 0 : 1, oe = samme(0, -1) ? 0 : 1, h = samme(1, 0) ? 0 : 1, n = samme(0, 1) ? 0 : 1;
        ctx.fillStyle = farve;
        ctx.fillRect(px + v, py + oe, s - v - h, s - oe - n);
        /* lys kant foroven og til venstre, skygge forneden og til hoejre */
        ctx.fillStyle = lys ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)";
        if (oe) ctx.fillRect(px + v, py + 1, s - v - h, k);
        if (v) ctx.fillRect(px + 1, py + oe, k, s - oe - n);
        ctx.fillStyle = lys ? "rgba(40,48,60,0.28)" : "rgba(0,0,0,0.32)";
        if (n) ctx.fillRect(px + v, py + s - 1 - k, s - v - h, k);
        if (h) ctx.fillRect(px + s - 1 - k, py + oe, k, s - oe - n);
    }

    var GLIMT = {
        salt:  { fyld: "rgba(63, 174, 114, 0.22)", kant: "rgba(126, 224, 168, 0.95)" }
    };

    function tekst(ctx, t, x, y, str, farve, kant) {
        NK.tekst(ctx, t, x, y, {
            font: "700 " + str + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: farve || "#ffffff", kant: kant !== false, kantBredde: Math.max(2.5, str * 0.22),
            kantFarve: "rgba(12, 12, 18, 0.7)"
        });
    }

    /* En brik for sig (den faldende, skyggen, gem og koeen) */
    function tegnBrik(ctx, form, rot, ion, px, py, s, valg) {
        valg = valg || {};
        var F = Braet.FORMER[form], cs = F.stillinger[rot];
        var har = {};
        cs.forEach(function (p) { har[p[0] + "," + p[1]] = true; });
        var i = F.sten ? { farve: STEN } : Kemi.ion(ion);
        var mx = 0, my = 0;
        cs.forEach(function (p) {
            var x = px + p[0] * s, y = py + p[1] * s;
            mx += x + s / 2; my += y + s / 2;
            if (valg.klip !== undefined && p[1] * s + py < valg.klip - 0.5) return;
            if (valg.skygge) {
                /* Let: groen, hvis brikken bliver til salt dér */
                var gl = GLIMT[valg.glimt] || null;
                ctx.fillStyle = gl ? gl.fyld : "rgba(255, 255, 255, 0.07)";
                ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
                ctx.strokeStyle = gl ? gl.kant : i.farve;
                ctx.globalAlpha = gl ? 1 : 0.6;
                ctx.lineWidth = gl ? 2.5 : 1.5;
                ctx.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3);
                ctx.globalAlpha = 1;
                return;
            }
            tegnCelle(ctx, x, y, s, i.farve, function (dx, dy) { return !!har[(p[0] + dx) + "," + (p[1] + dy)]; });
            if (F.sten) stenPrik(ctx, x, y, s);
            if (valg.laas) {
                ctx.fillStyle = "rgba(255,255,255," + (0.28 * valg.laas).toFixed(3) + ")";
                ctx.fillRect(x, y, s, s);
            }
        });
        mx /= cs.length; my /= cs.length;
        if (valg.skygge) {
            if (valg.formel) tekst(ctx, valg.formel, mx, my, Math.max(13, Math.round(s * 0.46)), "#b9f3d0");
            return;
        }
        if (F.sten || (valg.klip !== undefined && my < valg.klip)) return;
        tekst(ctx, Kemi.ionTekst(i), mx, my, Math.max(13, Math.round(s * (valg.lille ? 0.56 : 0.44))));
    }

    /* Stenene: graa med et par prikker, saa de ligner sten og ikke ioner */
    var STEN = "#6f747e";
    function stenPrik(ctx, px, py, s) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.arc(px + s * 0.3, py + s * 0.35, s * 0.07, 0, Math.PI * 2);
        ctx.arc(px + s * 0.66, py + s * 0.68, s * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
        ctx.beginPath();
        ctx.arc(px + s * 0.7, py + s * 0.3, s * 0.06, 0, Math.PI * 2);
        ctx.arc(px + s * 0.34, py + s * 0.72, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ----- Brættet ------------------------------------------------------------ */
    function tegnBraet(ctx, spil, lay) {
        var B = spil.braet, s = lay.s, x0 = lay.x0, y0 = lay.y0;
        var top = D.SKJULT;

        /* Baggrund med et svagt gitter */
        ctx.fillStyle = "#101016";
        NK.rundtRekt(ctx, x0 - 3, y0 - 3, lay.bw + 6, lay.bh + 6, 6);
        ctx.fill();
        ctx.strokeStyle = "#1c1c25";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var gx = 1; gx < D.BREDDE; gx++) { ctx.moveTo(x0 + gx * s + 0.5, y0); ctx.lineTo(x0 + gx * s + 0.5, y0 + lay.bh); }
        for (var gy = 1; gy < D.HOEJDE; gy++) { ctx.moveTo(x0, y0 + gy * s + 0.5); ctx.lineTo(x0 + lay.bw, y0 + gy * s + 0.5); }
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, y0, lay.bw, lay.bh);
        ctx.clip();

        /* De lagte celler */
        var etiketter = {}, x, y;
        for (y = top; y < B.H; y++) {
            for (x = 0; x < B.B; x++) {
                var c = B.g[y][x];
                if (!c) continue;
                var st = B.stykker[c.id];
                var px = x0 + x * s, py = y0 + (y - top) * s;
                if (st.salt) {
                    /* Saltet lyser op og smuldrer til pulver (spil.ryddes) */
                    var R = spil.ryddes, t = R && R.fase === "pulver" ? NK.klamp(R.ur / D.PULVER_TID, 0, 1) : 0;
                    var ind = (1 - t) * s * 0.35;
                    ctx.save();
                    ctx.globalAlpha = 0.25 + 0.75 * t;
                    ctx.fillStyle = bland(saltFarve(st), "#ffffff", 0.5 * (1 - t));
                    NK.rundtRekt(ctx, px + 1 + ind / 2, py + 1 + ind / 2, s - 2 - ind, s - 2 - ind, 3);
                    ctx.fill();
                    ctx.restore();
                } else if (st.sten) {
                    tegnCelle(ctx, px, py, s, STEN, (function (xx, yy, id) {
                        return function (dx, dy) { var n = B.celle(xx + dx, yy + dy); return !!n && n.id === id; };
                    }(x, y, c.id)), false);
                    stenPrik(ctx, px, py, s);
                } else {
                    tegnCelle(ctx, px, py, s, st.ion.farve, (function (xx, yy, id) {
                        return function (dx, dy) { var n = B.celle(xx + dx, yy + dy); return !!n && n.id === id; };
                    }(x, y, c.id)), false);
                    var ni = "i" + c.id;
                    (etiketter[ni] = etiketter[ni] || { salt: false, tekst: Kemi.ionTekst(st.ion), celler: [] }).celler.push({ x: x, y: y });
                }
            }
        }

        /* Symbolerne paa ionerne */
        Object.keys(etiketter).forEach(function (n) {
            var e = etiketter[n], p = midtICelle(e.celler);
            tekst(ctx, e.tekst, x0 + (p.x + 0.5) * s, y0 + (p.y - top + 0.5) * s, Math.max(13, Math.round(s * 0.44)));
        });

        /* Skyggen og den faldende brik */
        var a = spil.aktiv;
        if (a && spil.tilstand !== "slut") {
            if (spil.skyggeY > a.y) {
                var g = spil.glimt;
                tegnBrik(ctx, a.form, a.rot, a.ion, x0 + a.x * s, y0 + (spil.skyggeY - top) * s, s, {
                    skygge: true, glimt: g ? "salt" : null, formel: g ? g.formel : null
                });
            }
            var laas = spil.paaJorden() ? NK.klamp(spil.laasUr / D.LAAS, 0, 1) : 0;
            tegnBrik(ctx, a.form, a.rot, a.ion, x0 + a.x * s, y0 + (a.y - top) * s, s, { laas: laas, klip: y0 });
        }

        /* Fulde raekker blinker, foer de forsvinder */
        spil.effekter.forEach(function (e) {
            if (e.art !== "raekke") return;
            var t = NK.klamp(e.ur / e.maks, 0, 1);
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.85 * t).toFixed(3) + ")";
            ctx.fillRect(x0, y0 + (e.y - top) * s, lay.bw, s);
        });

        /* Pulveret drysser ned og falmer (kornene regnes i celler) */
        spil.effekter.forEach(function (e) {
            if (e.art !== "pulver") return;
            var t = NK.klamp(e.ur / e.maks, 0, 1), gaaet = e.maks - e.ur;
            e.korn.forEach(function (k) {
                var kx = k.x + k.vx * gaaet, ky = k.y + k.vy * gaaet + 4.5 * gaaet * gaaet;
                var v = Math.round(255 * k.lys);
                ctx.fillStyle = "rgba(" + v + "," + v + "," + Math.min(255, v + 8) + "," + (0.9 * t).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(x0 + kx * s, y0 + (ky - top) * s, Math.max(1.2, k.r * s), 0, Math.PI * 2);
                ctx.fill();
            });
        });

        /* Slut: brættet bliver graat nedefra */
        if (spil.tilstand === "slut") {
            var n = Math.min(D.HOEJDE, Math.floor(spil.slutUr / 0.9 * D.HOEJDE));
            ctx.fillStyle = "rgba(20, 20, 26, 0.72)";
            ctx.fillRect(x0, y0 + lay.bh - n * s, lay.bw, n * s);
        }
        /* Vundet: brættet lyser guld op nedefra */
        if (spil.tilstand === "vundet") {
            var nv = Math.min(D.HOEJDE, Math.floor(spil.slutUr / 0.9 * D.HOEJDE));
            ctx.fillStyle = "rgba(242, 197, 61, 0.16)";
            ctx.fillRect(x0, y0 + lay.bh - nv * s, lay.bw, nv * s);
        }
        if (spil.tilstand === "pause") {
            ctx.fillStyle = "rgba(12, 12, 18, 0.72)";
            ctx.fillRect(x0, y0, lay.bw, lay.bh);
        }
        ctx.restore();

        /* Tallene over ionerne, der venter (Let og Middel) */
        if (spil.N.maerker && spil.tilstand !== "klar") {
            spil.ventende.forEach(function (g) {
                if (!g.top) return;
                var t = (g.q > 0 ? "+" : (g.q < 0 ? "−" : "")) + Math.abs(g.q);
                var bx = x0 + (g.top.x + 0.5) * s, by = y0 + (g.top.y - top) * s - 2;
                maerke(ctx, t, bx, by, g.q > 0 ? "#93c9ff" : (g.q < 0 ? "#ffa99f" : "#d6d6de"), s);
            });
        }

        /* Formlerne og pointene svaever op fra saltet */
        spil.effekter.forEach(function (e) {
            if (e.art !== "tekst") return;
            var t = NK.klamp(e.ur / e.maks, 0, 1);
            var px = x0 + (e.x + 0.5) * s, py = y0 + (e.y - top + 0.5) * s - (1 - t) * s * 1.4;
            ctx.save();
            ctx.globalAlpha = Math.min(1, t * 2.2);
            tekst(ctx, e.tekst, px, py, Math.max(16, Math.round(s * 0.62)), e.ny ? "#f2c53d" : "#ffffff");
            ctx.restore();
        });

        /* Rammen */
        ctx.strokeStyle = "#3a3a47";
        ctx.lineWidth = 2;
        NK.rundtRekt(ctx, x0 - 3, y0 - 3, lay.bw + 6, lay.bh + 6, 6);
        ctx.stroke();
    }

    /* Midten af en gruppe celler, flyttet ind i den naermeste af dem */
    function midtICelle(celler) {
        var sx = 0, sy = 0;
        celler.forEach(function (c) { sx += c.x; sy += c.y; });
        var m = { x: sx / celler.length, y: sy / celler.length };
        var bedst = celler[0], afst = 1e9;
        celler.forEach(function (c) {
            var d = (c.x - m.x) * (c.x - m.x) + (c.y - m.y) * (c.y - m.y);
            if (d < afst) { afst = d; bedst = c; }
        });
        /* Ligger midten inde i en celle, bruges den; ellers midten af den naermeste */
        return afst <= 0.25 ? m : bedst;
    }

    function maerke(ctx, t, x, y, farve, s) {
        var str = Math.max(13, Math.round(s * 0.4));
        ctx.save();
        ctx.font = "700 " + str + "px 'Segoe UI', sans-serif";
        var b = ctx.measureText(t).width + 12, h = str + 6;
        var by = Math.max(y - h + 4, 2);
        ctx.fillStyle = "rgba(14, 14, 20, 0.9)";
        NK.rundtRekt(ctx, x - b / 2, by, b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = farve;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(t, x, by + h / 2 + 1);
        ctx.restore();
    }

    /* ----- Gem og koeen ---------------------------------------------------- */
    function boks(ctx, r, titel, s) {
        ctx.fillStyle = "#18181f";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fill();
        ctx.strokeStyle = "#33333f";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        NK.tekst(ctx, titel, r.x + r.b / 2, r.y + Math.max(14, s * 0.55), {
            font: "700 " + Math.max(13, Math.round(s * 0.4)) + "px 'Segoe UI', sans-serif",
            justering: "center", linje: "middle", farve: "#9fa6af"
        });
    }

    /* Brikken midt i et felt, skaleret ned */
    function tegnLille(ctx, b, cx, cy, sm, alfa) {
        var cs = Braet.FORMER[b.form].stillinger[0];
        var minX = 9, maxX = -9, minY = 9, maxY = -9;
        cs.forEach(function (p) { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
        var px = cx - ((minX + maxX + 1) / 2) * sm, py = cy - ((minY + maxY + 1) / 2) * sm;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha = alfa;
        tegnBrik(ctx, b.form, 0, b.ion, px, py, sm, { lille: true });
        ctx.restore();
    }

    function tegnSider(ctx, spil, lay) {
        var s = lay.s, sm = Math.round(s * 0.7);
        boks(ctx, lay.gem, "GEM", s);
        if (spil.gemt) tegnLille(ctx, spil.gemt, lay.gem.x + lay.gem.b / 2, lay.gem.y + lay.gem.h * 0.58, sm, spil.gemtBrugt ? 0.35 : 1);
        boks(ctx, lay.naeste, "NÆSTE", s);
        if (spil.tilstand === "klar") return;
        spil.koe.forEach(function (b, i) {
            tegnLille(ctx, b, lay.naeste.x + lay.naeste.b / 2, lay.naeste.y + (1.3 + 3.1 * i + 1.45) * s, sm, i === 0 ? 1 : 0.8);
        });
    }

    function tegn(L, spil) {
        var ctx = L.ctx;
        var lay = layout(L.b, L.h);
        ctx.clearRect(0, 0, L.b, L.h);
        tegnSider(ctx, spil, lay);
        tegnBraet(ctx, spil, lay);
        return lay;
    }

    NK.Tegning = { tegn: tegn, layout: layout, tegnBrik: tegnBrik };
}());

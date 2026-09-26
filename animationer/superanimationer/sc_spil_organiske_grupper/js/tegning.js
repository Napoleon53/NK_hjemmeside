/* =====================================================================
   tegning.js - tegner scenen: spandene, molekylerne, hjaelperne og
   gnisterne

   Scenen er D.HOEJDE (900) enheder hoej, som den gamle paa en stor
   skaerm, og skaleres til laerredet (se skala nedenfor). Bredden er det,
   der er plads til. Faldtiden er den samme paa alle skaerme.

   NK.Tegning.tegn(laerred, spil) tegner og giver layoutet i pixels
   tilbage: { k, spandY, spandH }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Kemi = NK.Kemi;
    var FONT = "'Segoe UI', Tahoma, sans-serif";

    function skrift(ctx, tekst, maks, stoerst, mindst) {
        var s = stoerst;
        ctx.font = "700 " + s + "px " + FONT;
        while (s > mindst && ctx.measureText(tekst).width > maks) {
            s -= 1;
            ctx.font = "700 " + s + "px " + FONT;
        }
        return s;
    }

    /* ----- Spandene ----------------------------------------------------- */
    function tegnSpande(ctx, sp, dim) {
        var H = sp.H;
        sp.spande.forEach(function (s) {
            /* Banen over spanden: svag, staerkere mens et molekyle holdes over den */
            var g = ctx.createLinearGradient(0, 0, 0, H - s.h);
            g.addColorStop(0, "rgba(255,255,255,0)");
            g.addColorStop(1, s.over ? Kemi.lys(s.farve, 0).replace("rgb", "rgba").replace(")", ",0.22)") : "rgba(255,255,255,0.03)");
            ctx.fillStyle = g;
            ctx.fillRect(s.x + 2, 0, s.b - 4, H - s.h);

            var y0 = H - s.h - s.puls, x0 = s.x + 5, b = s.b - 10;
            ctx.save();
            ctx.globalAlpha = dim ? 0.55 : 1;
            /* Spanden: lidt smallere forneden */
            ctx.beginPath();
            ctx.moveTo(x0 + 3, y0 + 8);
            ctx.lineTo(x0 + b - 3, y0 + 8);
            ctx.lineTo(x0 + b - 12, H + 2);
            ctx.lineTo(x0 + 12, H + 2);
            ctx.closePath();
            ctx.fillStyle = s.farve;
            ctx.globalAlpha *= s.over ? 1 : 0.82;
            ctx.fill();
            ctx.globalAlpha = dim ? 0.55 : 1;
            /* Kanten */
            NK.rundtRekt(ctx, x0, y0, b, 12, 5);
            ctx.fillStyle = Kemi.lys(s.farve, s.over ? 0.55 : 0.3);
            ctx.fill();
            if (s.over) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(x0 + 3, y0 + 8);
                ctx.lineTo(x0 + b - 3, y0 + 8);
                ctx.lineTo(x0 + b - 12, H + 2);
                ctx.lineTo(x0 + 12, H + 2);
                ctx.closePath();
                ctx.stroke();
            }
            var navn = D.KLASSER[s.klasse].navn;
            skrift(ctx, navn, b - 26, 22, 13);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(0,0,0,0.35)";
            ctx.strokeText(navn, x0 + b / 2, y0 + 48);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(navn, x0 + b / 2, y0 + 48);
            ctx.restore();
        });
    }

    /* ----- Molekylerne ----------------------------------------------------- */
    function tegnMolekyle(ctx, sp, t) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rot);
        if (t.blink !== undefined && sp.tilstand === "livTabt") {
            var taendt = Math.floor((D.LIV_PAUSE - sp.livUr) / 0.15) % 2 === 0;
            if (taendt) {
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(t.hb, t.hh) + 12, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 71, 87, 0.35)";
                ctx.fill();
            }
        }
        if (t.trukket) {
            ctx.shadowColor = "rgba(255,255,255,0.9)";
            ctx.shadowBlur = 14;
            ctx.scale(1.1, 1.1);
        }
        Kemi.tegn(ctx, t.m, NK.Spil.VIS);
        ctx.restore();
    }

    function tegnHint(ctx, sp, t) {
        var s = null;
        for (var i = 0; i < sp.spande.length; i++) if (sp.spande[i].klasse === t.m.klasse) s = sp.spande[i];
        if (!s) return;
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = s.farve;
        ctx.setLineDash([5, 10]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(s.x + s.b / 2, sp.H - 100);
        ctx.stroke();
        ctx.restore();
    }

    /* ----- Hjaelperne og kaffen ---------------------------------------------- */
    var HJAELP_FARVE = { enzym: "#ffd700", pause: "#54a0ff", inhibitor: "#00d2d3" };
    var HJAELP_NAVN = { enzym: "katalysator", pause: "+1 pause", inhibitor: "inhibitor" };

    function tegnHjaelper(ctx, t) {
        var farve = HJAELP_FARVE[t.slags];
        ctx.save();
        ctx.translate(t.x, t.y);
        var k = 1 + Math.sin(t.puls) * 0.08;
        ctx.save();
        ctx.rotate(t.rot);
        ctx.scale(k, k);
        ctx.shadowColor = farve;
        ctx.shadowBlur = 25;
        ctx.fillStyle = farve;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        var i;
        if (t.slags === "enzym") {
            /* Enzymet med sit aktive sted: en cirkel med et hak */
            var mund = 0.35 * Math.PI;
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 32, mund, Math.PI * 2 - mund);
            ctx.closePath();
        } else if (t.slags === "pause") {
            NK.rundtRekt(ctx, -35, -23, 70, 46, 6);
        } else {
            for (i = 0; i < 6; i++) {
                var v = i * Math.PI / 3;
                if (i === 0) ctx.moveTo(Math.cos(v) * 30, Math.sin(v) * 30); else ctx.lineTo(Math.cos(v) * 30, Math.sin(v) * 30);
            }
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#121212";
        ctx.strokeStyle = "#121212";
        if (t.slags === "enzym") {
            /* Lyn */
            ctx.beginPath();
            ctx.moveTo(-10, -2); ctx.lineTo(2, -16); ctx.lineTo(0, -3); ctx.lineTo(9, -3);
            ctx.lineTo(-3, 13); ctx.lineTo(-1, 0); ctx.closePath();
            ctx.fill();
        } else if (t.slags === "pause") {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "700 15px " + FONT;
            ctx.fillText("+1", 0, -8);
            ctx.font = "700 13px " + FONT;
            ctx.fillText("pause", 0, 9);
        } else {
            /* Snefnug: inhibitoren bremser */
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.beginPath();
            for (i = 0; i < 3; i++) {
                var a = i * Math.PI / 3 + Math.PI / 2;
                ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
                ctx.lineTo(-Math.cos(a) * 14, -Math.sin(a) * 14);
            }
            ctx.stroke();
        }
        ctx.restore();
        NK.tekst(ctx, HJAELP_NAVN[t.slags], 0, 52, { font: "700 16px " + FONT, justering: "center", kant: true, farve: farve });
        ctx.restore();
    }

    function tegnKaffe(ctx, t, tid) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(Math.sin(t.rot) * 0.25);
        ctx.fillStyle = "#f4f1ea";
        ctx.strokeStyle = "#2b2b33";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-17, -14); ctx.lineTo(17, -14); ctx.lineTo(13, 16); ctx.lineTo(-13, 16); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.arc(19, 0, 7, -Math.PI / 2, Math.PI / 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#f4f1ea";
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, -14, 16, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#6b4226";
        ctx.fill();
        /* Damp */
        ctx.strokeStyle = "rgba(230,230,235,0.7)";
        ctx.lineWidth = 2;
        for (var i = -1; i <= 1; i++) {
            ctx.beginPath();
            for (var y = 0; y < 18; y += 2) {
                var x = i * 8 + Math.sin(y * 0.4 + tid * 4 + i) * 3;
                if (y === 0) ctx.moveTo(x, -20 - y); else ctx.lineTo(x, -20 - y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    function tegnPartikler(ctx, sp) {
        sp.partikler.forEach(function (p) {
            ctx.globalAlpha = Math.max(0, p.liv) * (p.damp ? 0.5 : 1);
            ctx.fillStyle = p.farve;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.damp ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    /* ----- Hele scenen ------------------------------------------------------------
       Pixels pr. enhed. Scenen er 900 enheder hoej, men paa et lavt laerred
       ned til D.MIN_HOEJDE (saa molekylerne ikke bliver for smaa). spil.js
       ganger faldet med H / 900, saa faldtiden er den samme. Er laerredet
       smalt, bestemmer bredden (mindst D.MIN_BREDDE enheder). */
    function skala(L) {
        var H = NK.klamp(L.h / 0.85, D.MIN_HOEJDE, D.HOEJDE);
        var k = L.h / H;
        if (L.b / k < D.MIN_BREDDE) k = L.b / D.MIN_BREDDE;
        return k;
    }

    function tegn(L, sp) {
        var ctx = L.ctx;
        var k = skala(L);
        sp.saetStoerrelse(L.b / k, L.h / k);
        ctx.save();
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, L.b, L.h);
        ctx.scale(k, k);

        var dim = sp.tilstand === "klar" || sp.tilstand === "slut";
        tegnSpande(ctx, sp, dim);
        sp.ting.forEach(function (t) { if (t.art === "mol" && t.hint && !t.trukket) tegnHint(ctx, sp, t); });
        sp.ting.forEach(function (t) { if (t.art === "mol" && !t.trukket) tegnMolekyle(ctx, sp, t); });
        sp.ting.forEach(function (t) { if (t.art === "kaffe") tegnKaffe(ctx, t, sp.tid); });
        sp.ting.forEach(function (t) { if (t.art === "hjaelp") tegnHjaelper(ctx, t); });
        if (sp.trukket) tegnMolekyle(ctx, sp, sp.trukket);
        tegnPartikler(ctx, sp);
        ctx.restore();

        /* Pausen skjuler molekylerne; foer start og efter slut er scenen daempet */
        if (sp.tilstand === "pause") {
            ctx.fillStyle = "rgba(14, 14, 20, 0.93)";
            ctx.fillRect(0, 0, L.b, L.h);
        } else if (sp.tilstand === "mester") {
            ctx.fillStyle = "rgba(14, 14, 20, 0.55)";
            ctx.fillRect(0, 0, L.b, L.h);
        }
        return { k: k, spandY: (sp.H - D.SPAND_HOEJDE) * k, spandH: D.SPAND_HOEJDE * k };
    }

    /* Fra et punkt paa laerredet (pixels) til scenens enheder */
    function tilEnheder(L, sp, px, py) {
        var k = skala(L);
        return { x: px / k, y: py / k };
    }

    NK.Tegning = { tegn: tegn, tilEnheder: tilEnheder };
}());

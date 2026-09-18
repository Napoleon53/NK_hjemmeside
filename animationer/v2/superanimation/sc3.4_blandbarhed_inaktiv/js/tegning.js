/* =====================================================================
   tegning.js - bordet og glasudstyret

   Alt tegnes paa et fast tegnebord paa 1000 x 600 enheder, som skaleres
   og centreres i laerredet (NK.Brat). Bordpladen ligger i y = 500, som
   er den hoejde, ../../kemichael/kemichael.js er tegnet til.

   Intet her kender til kemien. Funktionerne faar maal og farver og
   tegner. Hvad der staar hvor, staar i de to sim-filer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    NK.Tegn = T;

    T.BREDDE = 1000;
    T.HOEJDE = 600;
    T.BORD = 500;

    /* Reagensglassets maal. maks er rumfanget i mL. */
    T.RG = { b: 54, h: 178, vaeg: 4, rund: 25, maks: 12, halsY: 10 };

    /* ------------------------------------------------------------------
       BRAT: tegnebordet skaleret ind i laerredet
       ------------------------------------------------------------------ */
    NK.Brat = function (L) {
        var s = Math.min(L.b / T.BREDDE, L.h / T.HOEJDE);
        return {
            s: s,
            dx: (L.b - T.BREDDE * s) / 2,
            dy: (L.h - T.HOEJDE * s) / 2
        };
    };

    /* Fra pixels i laerredet til tegnebordets enheder. */
    NK.tilBord = function (br, px, py) {
        return { x: (px - br.dx) / br.s, y: (py - br.dy) / br.s };
    };

    /* ------------------------------------------------------------------
       FARVER
       ------------------------------------------------------------------ */
    function rgb(hex) {
        var n = parseInt(hex.slice(1), 16);
        return [n >> 16, (n >> 8) & 255, n & 255];
    }
    T.rgb = rgb;

    function toTegn(v) {
        var s = NK.klamp(Math.round(v), 0, 255).toString(16);
        return s.length < 2 ? "0" + s : s;
    }

    /* Giver altid en #rrggbb-streng tilbage, saa resultatet kan blandes
       igen og sendes videre til medAlfa(). */
    T.blandFarve = function (a, b, t) {
        var x = rgb(a), y = rgb(b);
        return "#" + toTegn(NK.lerp(x[0], y[0], t)) +
                     toTegn(NK.lerp(x[1], y[1], t)) +
                     toTegn(NK.lerp(x[2], y[2], t));
    };

    T.medAlfa = function (hex, a) {
        var c = rgb(hex);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    };

    /* ------------------------------------------------------------------
       BAGGRUND OG BORDPLADE
       ------------------------------------------------------------------ */
    T.rum = function (ctx, b, h) {
        var g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#1c2029");
        g.addColorStop(0.72, "#171a21");
        g.addColorStop(1, "#101318");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, b, h);

        /* Fliser paa vaeggen, svagt antydet */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
        ctx.lineWidth = 1;
        for (var y = 60; y < T.BORD - 20; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(b, y);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Bordpladen med forkanten, og gulvet nedenfor. Det, der tabes ud
       over kanten, lander paa gulvet. */
    T.GULV = 558;

    T.bord = function (ctx, b) {
        var y = T.BORD;

        /* Gulvet */
        var gg = ctx.createLinearGradient(0, T.GULV, 0, T.HOEJDE);
        gg.addColorStop(0, "#22262e");
        gg.addColorStop(1, "#171a20");
        ctx.fillStyle = gg;
        ctx.fillRect(0, T.GULV, b, T.HOEJDE - T.GULV);

        /* Bordets forkant */
        var g = ctx.createLinearGradient(0, y, 0, T.GULV);
        g.addColorStop(0, "#3a3f49");
        g.addColorStop(0.1, "#2c313a");
        g.addColorStop(1, "#1e222a");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, b, T.GULV - y);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(b, y);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, T.GULV);
        ctx.lineTo(b, T.GULV);
        ctx.stroke();
    };

    /* En skygge under en genstand paa bordet. */
    T.skygge = function (ctx, x, y, b) {
        ctx.save();
        var g = ctx.createRadialGradient(x, y, 1, x, y, b);
        g.addColorStop(0, "rgba(0, 0, 0, 0.42)");
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, b, b * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ------------------------------------------------------------------
       REAGENSGLASSET

       Stien er glassets inderside: lige sider og en halvrund bund.
       Lagene faar besked om, hvor de starter og slutter i mL, og
       klippes ind i stien, saa vaesken foelger den runde bund.
       ------------------------------------------------------------------ */
    T.rgSti = function (ctx, x, top, inder) {
        var RG = T.RG;
        var halvB = (inder ? RG.b - 2 * RG.vaeg : RG.b) / 2;
        var r = inder ? RG.rund - RG.vaeg : RG.rund;
        var bund = top + RG.h - (inder ? RG.vaeg : 0);
        ctx.beginPath();
        ctx.moveTo(x - halvB, top);
        ctx.lineTo(x - halvB, bund - r);
        ctx.arc(x, bund - r, r, Math.PI, 0, true);
        ctx.lineTo(x + halvB, top);
    };

    /* Hvor hoejt staar vaesken, naar der er mL i glasset?
       Indersiden er en cylinder med en halvkugleformet bund. Rumfanget
       regnes i tegneenheder og skaleres bagefter, saa maks mL svarer til
       et fyldt glas. */
    T.rgNiveau = function (mL) {
        var RG = T.RG;
        if (!(mL > 0)) return 0;
        var r = RG.b / 2 - RG.vaeg;
        var indreH = RG.h - RG.vaeg;
        var kugleV = 2 / 3 * Math.PI * r * r * r;
        var cylinderH = indreH - r;
        var samlet = kugleV + Math.PI * r * r * cylinderH;
        var oensket = NK.klamp(mL / RG.maks, 0, 1) * samlet;

        if (oensket <= kugleV) {
            /* I den runde bund: hoejden findes ved at proeve sig frem.
               Kuglekalottens rumfang er π·hh²·(r − hh/3). */
            var lav = 0, hoej = r, hh;
            for (var i = 0; i < 24; i++) {
                hh = (lav + hoej) / 2;
                if (Math.PI * hh * hh * (r - hh / 3) < oensket) lav = hh; else hoej = hh;
            }
            return hh;
        }
        return r + (oensket - kugleV) / (Math.PI * r * r);
    };

    /* Glasset med sine lag. lag er en liste nedefra og op:
         { farve, mL, uklar }   uklar 0-1 goer laget maelket (emulsion)
       Klippet sker mod indersiden, saa vaesken ikke gaar uden for glasset. */
    T.reagensglas = function (ctx, x, top, lag, opt) {
        opt = opt || {};
        var RG = T.RG;
        var bund = top + RG.h;

        ctx.save();

        /* Vaesken */
        if (lag && lag.length) {
            ctx.save();
            T.rgSti(ctx, x, top + RG.vaeg, true);
            ctx.clip();
            var underMl = 0;
            for (var i = 0; i < lag.length; i++) {
                var y0 = bund - RG.vaeg - T.rgNiveau(underMl + lag[i].mL);
                var y1 = bund - RG.vaeg - T.rgNiveau(underMl);
                T.vaeskeLag(ctx, x, y0, y1, lag[i], RG.b / 2);
                underMl += lag[i].mL;
            }
            ctx.restore();

            /* Overfladen paa det oeverste lag */
            var topY = bund - RG.vaeg - T.rgNiveau(underMl);
            ctx.strokeStyle = "rgba(220, 238, 255, 0.5)";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x - RG.b / 2 + RG.vaeg, topY);
            ctx.lineTo(x + RG.b / 2 - RG.vaeg, topY);
            ctx.stroke();
        }

        /* Selve glasset */
        ctx.strokeStyle = opt.valgt ? "rgba(242, 197, 61, 0.92)" : "rgba(198, 216, 236, 0.5)";
        ctx.lineWidth = opt.valgt ? 3.4 : 2.6;
        ctx.lineJoin = "round";
        T.rgSti(ctx, x, top, false);
        ctx.stroke();

        /* Randen foroven */
        ctx.beginPath();
        ctx.ellipse(x, top, RG.b / 2, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(10, 14, 20, 0.5)";
        ctx.fill();

        /* Lysglimt ned ad venstre side */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - RG.b / 2 + 12, top + 26);
        ctx.lineTo(x - RG.b / 2 + 12, bund - 40);
        ctx.stroke();

        ctx.restore();
    };

    /* Ét vaeskelag mellem to hoejder. uklar giver det maelkede skaer,
       en emulsion har. */
    T.vaeskeLag = function (ctx, x, y0, y1, lag, halvB) {
        if (y1 <= y0) return;
        ctx.save();
        var g = ctx.createLinearGradient(x - halvB, 0, x + halvB, 0);
        var f = lag.farve;
        g.addColorStop(0, T.medAlfa(f, 0.92));
        g.addColorStop(0.35, T.medAlfa(f, 0.66));
        g.addColorStop(1, T.medAlfa(f, 0.95));
        ctx.fillStyle = g;
        ctx.fillRect(x - halvB, y0, halvB * 2, y1 - y0);

        if (lag.uklar > 0.01) {
            ctx.globalAlpha = lag.uklar * 0.62;
            ctx.fillStyle = "#e8eef5";
            ctx.fillRect(x - halvB, y0, halvB * 2, y1 - y0);
        }
        ctx.restore();
    };

    /* ------------------------------------------------------------------
       STATIVET TIL REAGENSGLAS
       ------------------------------------------------------------------ */
    T.stativ = function (ctx, st) {
        var i;
        ctx.save();

        /* Ben */
        ctx.fillStyle = "#3c424d";
        [st.x0 + 14, st.x1 - 14].forEach(function (bx) {
            ctx.fillRect(bx - 5, st.ribbe + 6, 10, T.BORD - st.ribbe - 6);
        });

        /* Fodpladen */
        ctx.fillStyle = "#2f343d";
        NK.rundtRekt(ctx, st.x0, T.BORD - 12, st.x1 - st.x0, 12, 3);
        ctx.fill();

        /* Ribben med hullerne */
        var g = ctx.createLinearGradient(0, st.ribbe - 4, 0, st.ribbe + 14);
        g.addColorStop(0, "#565d69");
        g.addColorStop(1, "#343943");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, st.x0, st.ribbe - 4, st.x1 - st.x0, 18, 4);
        ctx.fill();

        ctx.fillStyle = "#14171c";
        for (i = 0; i < st.huller.length; i++) {
            ctx.beginPath();
            ctx.ellipse(st.huller[i], st.ribbe + 3, T.RG.b / 2 + 3, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Nummeret under hvert hul. */
    T.stativNumre = function (ctx, st) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = "700 15px 'Segoe UI', sans-serif";
        ctx.fillStyle = "rgba(180, 192, 208, 0.75)";
        for (var i = 0; i < st.huller.length; i++) {
            ctx.fillText(String(i + 1), st.huller[i], T.BORD + 8);
        }
        ctx.restore();
    };

    /* ------------------------------------------------------------------
       FLASKEN

       En reagensflaske med skulder, hals, prop og etiket. Tegnes om sit
       ankerpunkt (midt for bunden), saa den kan haelde.
       ------------------------------------------------------------------ */
    T.FL = { b: 62, h: 122, hals: 22, halsH: 26, skulder: 24 };

    T.flaskeSti = function (ctx) {
        var F = T.FL;
        var hb = F.b / 2, hh = F.hals / 2;
        var kropTop = -F.h + F.halsH;
        ctx.beginPath();
        ctx.moveTo(-hb, -6);
        ctx.lineTo(-hb, kropTop + F.skulder);
        ctx.quadraticCurveTo(-hb, kropTop, -hh, kropTop);
        ctx.lineTo(-hh, -F.h);
        ctx.lineTo(hh, -F.h);
        ctx.lineTo(hh, kropTop);
        ctx.quadraticCurveTo(hb, kropTop, hb, kropTop + F.skulder);
        ctx.lineTo(hb, -6);
        ctx.quadraticCurveTo(hb, 0, hb - 6, 0);
        ctx.lineTo(-hb + 6, 0);
        ctx.quadraticCurveTo(-hb, 0, -hb, -6);
        ctx.closePath();
    };

    /* p er positur { x, y, v }: hvor bunden staar, og hvor meget flasken
       haelder. v er 0, naar den staar op. */
    T.flaske = function (ctx, p, v, opt) {
        opt = opt || {};
        var F = T.FL;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v || 0);

        /* Glasset med vaesken i */
        T.flaskeSti(ctx);
        ctx.save();
        ctx.clip();
        var g = ctx.createLinearGradient(-F.b / 2, 0, F.b / 2, 0);
        g.addColorStop(0, T.medAlfa(v.farve, 0.8));
        g.addColorStop(0.36, T.medAlfa(v.farve, 0.42));
        g.addColorStop(1, T.medAlfa(v.farve, 0.85));
        ctx.fillStyle = g;
        ctx.fillRect(-F.b / 2, -F.h + F.halsH + 6, F.b, F.h);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(-F.b / 2, -F.h, F.b, F.h);
        ctx.restore();

        ctx.strokeStyle = opt.fremhaev ? "rgba(242, 197, 61, 0.95)" : "rgba(200, 216, 234, 0.52)";
        ctx.lineWidth = opt.fremhaev ? 3 : 2.2;
        ctx.lineJoin = "round";
        T.flaskeSti(ctx);
        ctx.stroke();

        /* Proppen */
        ctx.fillStyle = "#59606c";
        NK.rundtRekt(ctx, -F.hals / 2 - 3, -F.h - 11, F.hals + 6, 13, 3);
        ctx.fill();

        /* Etiketten */
        var eb = F.b - 12, eh = 42, ex = -eb / 2, ey = -F.h + F.halsH + 22;
        ctx.fillStyle = "rgba(238, 242, 247, 0.93)";
        NK.rundtRekt(ctx, ex, ey, eb, eh, 3);
        ctx.fill();
        ctx.fillStyle = v.farve;
        ctx.fillRect(ex, ey, eb, 4);

        ctx.fillStyle = "#23262d";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "700 13px 'Segoe UI', sans-serif";
        ctx.fillText(v.formel, 0, ey + 19);
        ctx.font = "600 11px 'Segoe UI', sans-serif";
        ctx.fillStyle = "#565d69";
        ctx.fillText(v.kort, 0, ey + 33);

        ctx.restore();
    };

    /* Tuden: hvor straalen kommer ud, naar flasken haelder. */
    T.flaskeTud = function (p) {
        var F = T.FL;
        var c = Math.cos(p.v || 0), s = Math.sin(p.v || 0);
        var lx = F.hals / 2, ly = -F.h;
        return { x: p.x + lx * c - ly * s, y: p.y + lx * s + ly * c };
    };

    /* ------------------------------------------------------------------
       STRAALEN OG DRAABERNE
       ------------------------------------------------------------------ */
    T.straale = function (ctx, x0, y0, x1, y1, farve, bredde) {
        ctx.save();
        ctx.strokeStyle = T.medAlfa(farve, 0.8);
        ctx.lineWidth = bredde || 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.2, y0 + (y1 - y0) * 0.55, x1, y1);
        ctx.stroke();
        ctx.restore();
    };

    T.draabe = function (ctx, x, y, r, farve, alfa) {
        ctx.save();
        ctx.globalAlpha = alfa === undefined ? 1 : alfa;
        ctx.fillStyle = T.medAlfa(farve, 0.9);
        ctx.beginPath();
        ctx.moveTo(x, y - r * 1.5);
        ctx.quadraticCurveTo(x + r, y - r * 0.2, x + r * 0.72, y + r * 0.5);
        ctx.arc(x, y + r * 0.35, r * 0.8, 0.35, Math.PI - 0.35);
        ctx.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 1.5);
        ctx.fill();
        ctx.restore();
    };

    /* ------------------------------------------------------------------
       BAEGERGLASSET (bruges som affaldsglas og som modtageglas)
       ------------------------------------------------------------------ */
    T.baegerglas = function (ctx, x0, x1, top, bund, lag, opt) {
        opt = opt || {};
        ctx.save();

        if (lag && lag.length) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0 + 3, top, x1 - x0 - 6, bund - top - 3);
            ctx.clip();
            var under = 0, samlet = 0, i;
            for (i = 0; i < lag.length; i++) samlet += lag[i].mL;
            var hoejde = (bund - 4 - top - 8) * NK.klamp(samlet / (opt.maks || 40), 0, 1);
            for (i = 0; i < lag.length; i++) {
                var h0 = bund - 4 - hoejde * (under + lag[i].mL) / Math.max(samlet, 0.001);
                var h1 = bund - 4 - hoejde * under / Math.max(samlet, 0.001);
                T.vaeskeLag(ctx, (x0 + x1) / 2, h0, h1, lag[i], (x1 - x0) / 2);
                under += lag[i].mL;
            }
            ctx.restore();
        }

        ctx.strokeStyle = opt.fremhaev ? "rgba(242, 197, 61, 0.95)" : "rgba(198, 216, 236, 0.46)";
        ctx.lineWidth = opt.fremhaev ? 3.2 : 2.6;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0, top);
        ctx.lineTo(x0, bund - 10);
        ctx.quadraticCurveTo(x0, bund, x0 + 10, bund);
        ctx.lineTo(x1 - 10, bund);
        ctx.quadraticCurveTo(x1, bund, x1, bund - 10);
        ctx.lineTo(x1, top + 8);
        ctx.quadraticCurveTo(x1, top - 1, x1 + 7, top - 7);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse((x0 + x1) / 2, top, (x1 - x0) / 2, 4, 0, 0, Math.PI, true);
        ctx.stroke();

        if (opt.etiket) {
            ctx.fillStyle = "rgba(170, 182, 198, 0.8)";
            ctx.font = "600 13px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(opt.etiket, (x0 + x1) / 2, bund + 8);
        }
        ctx.restore();
    };

    /* ------------------------------------------------------------------
       ZOOMBOBLEN

       En rund rude med en tyk kant og to smaa streger ud mod det, der
       zoomes ind paa. Indholdet klippes til cirklen af kalderen.
       ------------------------------------------------------------------ */
    T.boble = function (ctx, cx, cy, r, mod) {
        ctx.save();
        if (mod) {
            ctx.strokeStyle = "rgba(160, 178, 200, 0.25)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 7]);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(mod.x, mod.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        var g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
        g.addColorStop(0, "#1a2430");
        g.addColorStop(1, "#0d1219");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    T.bobleKant = function (ctx, cx, cy, r) {
        ctx.save();
        ctx.strokeStyle = "rgba(190, 208, 228, 0.42)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.13)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 5, Math.PI * 0.85, Math.PI * 1.55);
        ctx.stroke();
        ctx.restore();
    };
}());

/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet og bordet (fane 1), strukturformlerne med frie elektronpar og
   ladninger, hydronen, reaktionsskemaet med parrene (det ene par over
   formlerne, det andet under, som i bogen), tavlen, brikkerne og
   pladserne (fane 2 og 3). Funktionerne tegner én ting et bestemt sted
   og husker intet selv; fanerne bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Mol;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver ------------------------------------------------------------- */
    function rgb(hex) {
        var h = hex.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    function rgba(hex, a) {
        var c = rgb(hex);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }
    T.rgba = rgba;

    T.GUL = "#f2c53d";
    T.PAR_A = "#6cb6ff";        /* syren og dens korresponderende base */
    T.PAR_B = "#c79bf2";        /* basen og dens korresponderende syre */
    T.TEKST = "#e6ebf1";
    T.PAR_FARVE = { syre: T.PAR_A, kb: T.PAR_A, base: T.PAR_B, ks: T.PAR_B };

    var GRUNDSTOF = {
        H: "#e6ebf1", C: "#e6ebf1", O: "#ff7b72", N: "#79b8ff", Cl: "#7ee0a8",
        Br: "#e59a72", F: "#b8e986", P: "#f0a04b", S: "#f2d15c"
    };
    T.grundstofFarve = function (s) { return GRUNDSTOF[s] || "#c9d1d9"; };

    /* ----- Rummet og bordet (som sc6.6) --------------------------------------- */
    T.rum = function (ctx, W, H, gulvY) {
        var g = ctx.createLinearGradient(0, 0, 0, gulvY);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1b1d24");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, gulvY);
        ctx.fillStyle = "#121318";
        ctx.fillRect(0, gulvY, W, H - gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(0, gulvY, W, 2);
    };

    T.bord = function (ctx, x0, x1, y, gulv) {
        var plade = 12;
        ctx.fillStyle = "#2a2e37";
        ctx.fillRect(x0, y + plade, x1 - x0, gulv - y - plade);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 1;
        var doer = Math.max(120, (x1 - x0) / 6);
        for (var x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.beginPath();
            ctx.moveTo(Math.round(x) + 0.5, y + plade + 6);
            ctx.lineTo(Math.round(x) + 0.5, gulv);
            ctx.stroke();
        }
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Strukturformlerne ------------------------------------------------------
       Et atom fylder en ellipse om bogstaverne. Bindinger stopper ved den,
       og de frie par ligger lige uden for den. */
    T.molMaal = function (b) {
        return {
            b: b,
            px: NK.klamp(b * 0.4, 14, 42),
            lw: NK.klamp(b * 0.045, 1.8, 3.2),
            prik: NK.klamp(b * 0.045, 2, 3.6),
            pAfst: b * 0.1
        };
    };

    function atomTekst(a) { return a.gruppe ? NK.formel(a.s) : a.s; }

    /* Ellipsens radius i retningen v */
    function ellipseR(rx, ry, v) {
        var c = Math.cos(v) / rx, s = Math.sin(v) / ry;
        return 1 / Math.sqrt(c * c + s * s);
    }

    T.atomRadier = function (ctx, a, mm) {
        ctx.save();
        ctx.font = font("700", mm.px);
        var hb = ctx.measureText(atomTekst(a)).width / 2;
        ctx.restore();
        return { rx: hb + mm.px * 0.22, ry: mm.px * 0.62 };
    };

    T.atomPx = function (m, i, ox, oy, b) {
        var a = m.atomer[i];
        return { x: ox + a.x * b, y: oy + a.y * b };
    };

    /* Stedet for det frie par i retningen v paa atom i (pixels) */
    T.parPx = function (ctx, m, i, v, ox, oy, mm) {
        var a = m.atomer[i], r = T.atomRadier(ctx, a, mm);
        var d = ellipseR(r.rx, r.ry, v) + mm.b * 0.1;
        return { x: ox + a.x * mm.b + Math.cos(v) * d, y: oy + a.y * mm.b + Math.sin(v) * d };
    };

    function prikPar(ctx, x, y, v, mm, farve) {
        var nx = -Math.sin(v) * mm.pAfst / 2, ny = Math.cos(v) * mm.pAfst / 2;
        ctx.fillStyle = farve;
        ctx.beginPath();
        ctx.arc(x + nx, y + ny, mm.prik, 0, Math.PI * 2);
        ctx.arc(x - nx, y - ny, mm.prik, 0, Math.PI * 2);
        ctx.fill();
    }

    /* Ladningen i en lille ring, der hvor der er mest plads */
    function ladningsRing(ctx, x, y, q, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa;
        var farve = q > 0 ? "#ff9f93" : "#8cc8ff";
        ctx.fillStyle = "rgba(14, 16, 22, 0.85)";
        ctx.strokeStyle = farve;
        ctx.lineWidth = Math.max(1.4, r * 0.16);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        var s = r * 0.52;
        ctx.lineWidth = Math.max(1.6, r * 0.2);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.lineTo(x + s, y);
        if (q > 0) { ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); }
        ctx.stroke();
        if (Math.abs(q) > 1) {
            ctx.font = font("700", Math.round(r * 1.1));
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = farve;
            ctx.fillText(String(Math.abs(q)), x + r * 1.05, y - r * 0.6);
        }
        ctx.restore();
    }

    function vinkelAfst(a, b) {
        var d = Math.abs(M.norm(a) - M.norm(b));
        return Math.min(d, Math.PI * 2 - d);
    }

    /* Tegner molekylet m med nulpunkt i (ox, oy) og b pixels pr. binding.
       o (alt valgfrit):
         lysH       H, musen er over (gul ring)
         lysPar     { atom, v }: det frie par, hydronen lander paa
         ryst       { h, t }: et fast H, der ryster
         spor       { atom, v, t }: bindingen, der lige er blevet til et par
         nyH        { h, t }: et H, der lige er kommet til
         ladAlfa    ladningsringene (0-1) */
    T.molekyle = function (ctx, m, ox, oy, b, o) {
        o = o || {};
        var mm = T.molMaal(b);
        var radier = m.atomer.map(function (a) { return a.vaek ? null : T.atomRadier(ctx, a, mm); });
        function pos(i) {
            var a = m.atomer[i], x = ox + a.x * b, y = oy + a.y * b;
            if (o.ryst && o.ryst.h === i) x += Math.sin(o.ryst.t * 40) * b * 0.08 * (1 - o.ryst.t / 0.45);
            return { x: x, y: y };
        }
        ctx.save();
        ctx.lineCap = "round";

        /* Bindingerne */
        m.bind.forEach(function (bd) {
            var A = m.atomer[bd.a], B = m.atomer[bd.b];
            if (A.vaek || B.vaek) return;
            var p = pos(bd.a), q = pos(bd.b);
            var v = Math.atan2(q.y - p.y, q.x - p.x);
            var r1 = ellipseR(radier[bd.a].rx, radier[bd.a].ry, v);
            var r2 = ellipseR(radier[bd.b].rx, radier[bd.b].ry, v + Math.PI);
            var ux = Math.cos(v), uy = Math.sin(v);
            var alfa = 1;
            if (o.nyH && (o.nyH.h === bd.a || o.nyH.h === bd.b)) alfa = NK.klamp(o.nyH.t / 0.3, 0, 1);
            ctx.strokeStyle = rgba("#c9d1d9", alfa);
            ctx.lineWidth = mm.lw;
            var skift = bd.o > 1 ? [-1, 1] : [0];
            skift.forEach(function (s) {
                var nx = -uy * s * b * 0.055, ny = ux * s * b * 0.055;
                ctx.beginPath();
                ctx.moveTo(p.x + ux * r1 + nx, p.y + uy * r1 + ny);
                ctx.lineTo(q.x - ux * r2 + nx, q.y - uy * r2 + ny);
                ctx.stroke();
            });
        });

        /* Sporet af en binding, der lige er blevet til et frit par */
        if (o.spor && o.spor.t < 0.4) {
            var sp = pos(o.spor.atom), k = 1 - o.spor.t / 0.4;
            var r0 = ellipseR(radier[o.spor.atom].rx, radier[o.spor.atom].ry, o.spor.v);
            ctx.strokeStyle = rgba("#c9d1d9", k * 0.8);
            ctx.lineWidth = mm.lw;
            ctx.beginPath();
            ctx.moveTo(sp.x + Math.cos(o.spor.v) * r0, sp.y + Math.sin(o.spor.v) * r0);
            ctx.lineTo(sp.x + Math.cos(o.spor.v) * (r0 + b * 0.55 * k), sp.y + Math.sin(o.spor.v) * (r0 + b * 0.55 * k));
            ctx.stroke();
        }

        /* Atomerne, de frie par og ladningerne */
        m.atomer.forEach(function (a, i) {
            if (a.vaek) return;
            var p = pos(i);
            var alfa = o.nyH && o.nyH.h === i ? NK.klamp(o.nyH.t / 0.2, 0.3, 1) : 1;
            if (o.lysH === i) {
                ctx.fillStyle = "rgba(242, 197, 61, 0.2)";
                ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, b * 0.34, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.save();
            ctx.globalAlpha *= alfa;
            ctx.font = font("700", a.gruppe ? mm.px * 0.9 : mm.px);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = a.gruppe ? "#c9d1d9" : T.grundstofFarve(a.s);
            ctx.fillText(atomTekst(a), p.x, p.y + mm.px * 0.04);
            ctx.restore();

            var par = M.parVinkler(m, i);
            par.forEach(function (v) {
                var r = ellipseR(radier[i].rx, radier[i].ry, v) + b * 0.1;
                var x = p.x + Math.cos(v) * r, y = p.y + Math.sin(v) * r;
                var lys = o.lysPar && o.lysPar.atom === i && vinkelAfst(o.lysPar.v, v) < 0.01;
                if (lys) {
                    ctx.fillStyle = "rgba(242, 197, 61, 0.28)";
                    ctx.beginPath();
                    ctx.arc(x, y, b * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                var nyt = o.spor && o.spor.atom === i && vinkelAfst(o.spor.v, v) < 0.9;
                ctx.save();
                if (nyt) ctx.globalAlpha *= NK.klamp(o.spor.t / 0.3, 0, 1);
                prikPar(ctx, x, y, v, mm, lys ? "#fff1b8" : T.GUL);
                ctx.restore();
            });

            /* Ladningen midt i det stoerste hul mellem bindinger og par,
               helst oppe til hoejre, og lidt laengere ude end parrene */
            if (a.q && (o.ladAlfa === undefined || o.ladAlfa > 0)) {
                var optaget = M.naboer(m, i).map(function (n) { return n.v; }).concat(par);
                var bedst = null;
                for (var k2 = 0; k2 < 48; k2++) {
                    var v2 = -Math.PI / 4 + k2 * Math.PI / 24;
                    var afst = Math.min.apply(null, optaget.map(function (u) { return vinkelAfst(u, v2); }).concat([Math.PI]));
                    var pris = afst - vinkelAfst(v2, -Math.PI / 4) * 0.02;
                    if (!bedst || pris > bedst.pris + 1e-6) bedst = { v: v2, pris: pris };
                }
                var rr = ellipseR(radier[i].rx, radier[i].ry, bedst.v) + b * (par.length >= 3 ? 0.36 : 0.26);
                ladningsRing(ctx, p.x + Math.cos(bedst.v) * rr, p.y + Math.sin(bedst.v) * rr, a.q,
                    NK.klamp(b * 0.15, 7, 12), o.ladAlfa === undefined ? 1 : o.ladAlfa);
            }
        });
        ctx.restore();
    };

    /* ----- Hydronen: H⁺ uden elektroner ------------------------------------------ */
    T.hydron = function (ctx, x, y, r, alfa, lys) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa === undefined ? 1 : alfa, 0, 1);
        ctx.shadowColor = "rgba(242, 197, 61, 0.7)";
        ctx.shadowBlur = lys ? 16 : 8;
        ctx.fillStyle = "rgba(242, 197, 61, 0.22)";
        ctx.strokeStyle = T.GUL;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = font("700", Math.round(r * 0.95));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("H⁺", x, y + r * 0.04);
        ctx.restore();
    };

    /* ----- Reaktionsskemaet -----------------------------------------------------------
       felter: [{ tekst, b }] for de fire formler (b: kolonnens bredde).
       Giver midten af hver kolonne og pilens og plussernes pladser. */
    T.skemaPlacer = function (ctx, felter, fs, midtX) {
        ctx.save();
        ctx.font = font("600", fs);
        var plus = ctx.measureText(" + ").width, pil = ctx.measureText("  ⟶  ").width;
        ctx.restore();
        var bredder = felter.map(function (f) { return f.b; });
        var ialt = bredder[0] + plus + bredder[1] + pil + bredder[2] + plus + bredder[3];
        var x = midtX - ialt / 2, ud = { x: [], tegn: [], ialt: ialt };
        [0, 1, 2, 3].forEach(function (i) {
            ud.x.push(x + bredder[i] / 2);
            x += bredder[i];
            if (i < 3) {
                var bb = i === 1 ? pil : plus;
                ud.tegn.push({ x: x + bb / 2, t: i === 1 ? "⟶" : "+" });
                x += bb;
            }
        });
        return ud;
    };

    T.formelTekst = function (ctx, tekst, x, y, fs, farve, alfa, vaegt) {
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.font = font(vaegt || "600", fs);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve || T.TEKST;
        ctx.fillText(tekst, x, y);
        ctx.restore();
    };

    T.tekstBredde = function (ctx, tekst, fs, vaegt) {
        ctx.save();
        ctx.font = font(vaegt || "600", fs);
        var b = ctx.measureText(tekst).width;
        ctx.restore();
        return b;
    };

    /* En klamme mellem to kolonner: over (retning -1) eller under (+1) */
    T.klamme = function (ctx, x1, x2, y, dybde, farve, alfa, lw) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.strokeStyle = farve;
        ctx.lineWidth = lw || 2.2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x1, y + dybde);
        ctx.lineTo(x2, y + dybde);
        ctx.lineTo(x2, y);
        ctx.stroke();
        ctx.restore();
    };

    /* Parrene i et skema. x: kolonnernes midte; maerker: "syre", "base",
       "kb" eller "ks" for hver kolonne; y: formlernes linje.
       Syren og dens korresponderende base faar en klamme over formlerne,
       basen og dens korresponderende syre en klamme under maerkerne.
       v: { maerker: skriv maerkerne under formlerne, under: hvor den
       nederste klamme starter (standard y + 1,3 fs) } */
    T.par = function (ctx, x, maerker, y, fs, alfa, v) {
        v = v || {};
        var ia = maerker.indexOf("syre"), ikb = maerker.indexOf("kb");
        var ib = maerker.indexOf("base"), iks = maerker.indexOf("ks");
        var lfs = NK.klamp(fs * 0.5, 13, 17);
        if (v.maerker) {
            maerker.forEach(function (mk, i) {
                if (!mk) return;
                T.formelTekst(ctx, NK.Syrebase.MAERKE_TEKST[mk], x[i], y + fs * 0.95, lfs, T.PAR_FARVE[mk], alfa, "600");
            });
        }
        var lw = NK.klamp(fs * 0.075, 1.8, 2.8);
        var under = v.under === undefined ? y + fs * 1.3 : v.under;
        if (ia >= 0 && ikb >= 0) T.klamme(ctx, x[ia], x[ikb], y - fs * 0.75, -fs * 0.42, T.PAR_A, alfa, lw);
        if (ib >= 0 && iks >= 0) T.klamme(ctx, x[ib], x[iks], under, fs * 0.42, T.PAR_B, alfa, lw);
    };

    /* ----- Tavlen (fane 2 og 3) ------------------------------------------------------- */
    T.tavle = function (ctx, R) {
        var ramme = NK.klamp(R.b * 0.012, 8, 13);
        ctx.save();
        ctx.fillStyle = "#6b4a2e";
        NK.rundtRekt(ctx, R.x - ramme, R.y - ramme, R.b + 2 * ramme, R.h + 2 * ramme, 8);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(R.x - ramme, R.y - ramme, R.b + 2 * ramme, 2);
        var g = ctx.createLinearGradient(R.x, R.y, R.x, R.y + R.h);
        g.addColorStop(0, "#27493b");
        g.addColorStop(1, "#1d372c");
        ctx.fillStyle = g;
        ctx.fillRect(R.x, R.y, R.b, R.h);
        /* Kridtstoev fra forrige time */
        ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
        for (var i = 0; i < 7; i++) {
            var fx = R.x + R.b * ((i * 0.37 + 0.11) % 1), fy = R.y + R.h * ((i * 0.53 + 0.2) % 1);
            ctx.beginPath();
            ctx.ellipse(fx, fy, R.b * 0.09, R.h * 0.035, -0.1, 0, Math.PI * 2);
            ctx.fill();
        }
        /* Kridtholderen */
        var ty = R.y + R.h + ramme;
        ctx.fillStyle = "#5a3d25";
        ctx.fillRect(R.x - ramme - 6, ty - 2, R.b + 2 * ramme + 12, 10);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(R.x - ramme - 6, ty + 8, R.b + 2 * ramme + 12, 3);
        ctx.fillStyle = "#f1eee6";
        ctx.fillRect(R.x + R.b * 0.72, ty - 6, 26, 5);
        ctx.fillStyle = "#f2d18a";
        ctx.fillRect(R.x + R.b * 0.72 + 34, ty - 6, 18, 5);
        ctx.restore();
    };

    /* En brik (magnet) med tekst. v: { farve (kant), lys, ok, alfa, fs } */
    T.brik = function (ctx, r, tekst, v) {
        v = v || {};
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = v.loeftet ? 14 : 5;
        ctx.shadowOffsetY = v.loeftet ? 6 : 2;
        ctx.fillStyle = v.ok ? "#e3f6ea" : (v.lys ? "#fffaf0" : "#f1ece0");
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 7);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.lineWidth = v.lys || v.ok ? 2.5 : 1.5;
        ctx.strokeStyle = v.ok ? "#2b9a5a" : (v.farve || (v.lys ? "#c89b1d" : "#b9b09b"));
        ctx.stroke();
        if (v.farve) {
            ctx.fillStyle = v.farve;
            NK.rundtRekt(ctx, r.x + 5, r.y + 5, 5, r.h - 10, 2);
            ctx.fill();
        }
        var fs = v.fs || 20, dele = String(tekst).split("\n");
        ctx.font = font("700", fs);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1c2128";
        dele.forEach(function (t, i) {
            ctx.fillText(t, r.x + r.b / 2 + (v.farve ? 3 : 0), r.y + r.h / 2 + 1 + (i - (dele.length - 1) / 2) * fs * 1.05);
        });
        ctx.restore();
    };

    /* En tom plads paa tavlen (stiplet kridt) */
    T.plads = function (ctx, r, v) {
        v = v || {};
        ctx.save();
        if (v.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, 0.14)";
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 7);
            ctx.fill();
        }
        if (v.roed) {
            ctx.fillStyle = "rgba(224, 84, 70, " + (0.35 * v.roed) + ")";
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 7);
            ctx.fill();
        }
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.95)" : "rgba(236, 240, 232, 0.55)";
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 6]);
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 7);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Smaating (som sc6.6) ----------------------------------------------------------- */
    T.buePil = function (ctx, x0, y0, x1, y1, tid, kx, ky) {
        var mx = kx !== undefined ? kx : (x0 + x1) / 2;
        var my = ky !== undefined ? ky : Math.min(y0, y1) - Math.abs(x1 - x0) * 0.25 - 20;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 7]);
        ctx.lineDashOffset = -((tid || 0) * 30 % 15);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(mx, my, x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        var vx = x1 - mx, vy = y1 - my, l = Math.sqrt(vx * vx + vy * vy) || 1;
        vx /= l; vy /= l;
        ctx.fillStyle = "rgba(242, 197, 61, 0.95)";
        ctx.beginPath();
        ctx.moveTo(x1 + vx * 4, y1 + vy * 4);
        ctx.lineTo(x1 - vx * 12 - vy * 7, y1 - vy * 12 + vx * 7);
        ctx.lineTo(x1 - vx * 12 + vy * 7, y1 - vy * 12 - vx * 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    T.stjerne = function (ctx, x, y, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.beginPath();
        for (var i = 0; i < 10; i++) {
            var v = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
            ctx.lineTo(x + Math.cos(v) * rr, y + Math.sin(v) * rr);
        }
        ctx.closePath();
        ctx.fillStyle = "#f2c53d";
        ctx.fill();
        ctx.strokeStyle = "#8a6510";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

    /* Et punkt paa en bue fra (x0, y0) til (x1, y1), der loefter sig h */
    T.bue = function (x0, y0, x1, y1, h, t) {
        var k = NK.blod(t);
        return { x: NK.lerp(x0, x1, k), y: NK.lerp(y0, y1, k) - Math.sin(Math.PI * k) * h };
    };

    NK.Tegn = T;
}());

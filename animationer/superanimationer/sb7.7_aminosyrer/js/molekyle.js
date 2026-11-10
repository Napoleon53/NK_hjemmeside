/* =====================================================================
   molekyle.js - en aminosyre som formel i bogens stil

   Bogens figurer b7-amfoion og b7-aminosyrer-syv: "H₂N—CH—COOH" paa en
   linje med sidekaeden under det midterste CH. Gruppen med hydronen er
   roed, gruppen uden hydronen blaa, og resten er moerkt. En ladet gruppe
   faar en bloed roed eller blaa gloed (som bogens ioner).

   M.tekst(ctx, s, x, y, fs, farve, just)   en formel med saenkede tal og
       haevede ladninger: "H_3N", "^+H_3N", "COO^-". Giver en kasse.
   M.tegn(ctx, aa, tilst, x, y, fs, opt)    hele aminosyren med CH i (x, y).
       tilst siger for hver gruppe (amino, carboxyl, side), om den har sin
       hydron (1) eller ej (0). Giver kasserne for grupperne og hydronen
       i −COOH (til traekket paa fane 1).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = {};
    var FONT = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    M.FONT = FONT;

    function skrift(fs, vaegt) { return (vaegt || 700) + " " + fs + "px " + FONT; }

    /* "^+H_3N" -> [{t:"+", sup}, {t:"H"}, {t:"3", sub}, {t:"N"}] */
    function dele(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var c = s.charAt(i);
            if (c === "_" || c === "^") {
                var j = i + 1, run = "";
                if (c === "_") { while (j < s.length && /[0-9a-z]/.test(s.charAt(j))) { run += s.charAt(j); j++; } }
                else { run = s.charAt(j); j++; }
                ud.push({ t: run.replace("-", "−"), sub: c === "_", sup: c === "^" });
                i = j;
            } else {
                ud.push({ t: c });
                i++;
            }
        }
        return ud;
    }

    function maalDele(ctx, d, fs) {
        var b = 0;
        d.forEach(function (x) {
            ctx.font = skrift(x.sub || x.sup ? fs * 0.66 : fs);
            x.w = ctx.measureText(x.t).width;
            x.x = b;
            b += x.w;
        });
        return b;
    }

    M.bredde = function (ctx, s, fs) {
        ctx.save();
        var b = maalDele(ctx, dele(s), fs);
        ctx.restore();
        return b;
    };

    /* Skriver formlen; just er "left", "right" eller "center" om x. y er
       midten af bogstaverne. Giver kassen og delene (til at finde et H). */
    M.tekst = function (ctx, s, x, y, fs, farve, just, opt) {
        opt = opt || {};
        var d = dele(s);
        ctx.save();
        var b = maalDele(ctx, d, fs);
        var x0 = just === "right" ? x - b : (just === "center" ? x - b / 2 : x);
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        d.forEach(function (del, i) {
            ctx.font = skrift(del.sub || del.sup ? fs * 0.66 : fs);
            ctx.fillStyle = (opt.farver && opt.farver[i]) || farve;
            var dy = del.sub ? fs * 0.3 : (del.sup ? -fs * 0.38 : 0);
            ctx.fillText(del.t, x0 + del.x, y + dy + fs * 0.04);
            del.ax = x0 + del.x;
        });
        ctx.restore();
        return { x: x0, y: y - fs * 0.62, w: b, h: fs * 1.24, cx: x0 + b / 2, cy: y, dele: d };
    };

    /* En binding som en kort streg */
    function streg(ctx, x1, y1, x2, y2, fs, farve) {
        ctx.save();
        ctx.strokeStyle = farve || D.FARVE.blaek;
        ctx.lineWidth = Math.max(1.6, fs * 0.1);
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();
    }

    /* En bloed gloed bag en ladet gruppe */
    M.gloed = function (ctx, k, q, styrke) {
        if (!k || !q) return;
        var a = styrke === undefined ? 1 : styrke;
        if (a < 0.01) return;
        ctx.save();
        var r = Math.max(k.w, k.h) * 0.75;
        var g = ctx.createRadialGradient(k.cx, k.cy, r * 0.1, k.cx, k.cy, r);
        var f = q > 0 ? "169, 50, 38" : "29, 78, 216";
        g.addColorStop(0, "rgba(" + f + ", " + (0.22 * a) + ")");
        g.addColorStop(1, "rgba(" + f + ", 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(k.cx, k.cy, k.w * 0.5 + k.h * 0.6, k.h * 1.05, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Formlerne for grupperne. venstre: gruppen staar til venstre for CH,
       saa aminogruppen skrives ⁺H₃N og H₂N som i bogen. */
    M.gruppe = function (slags, har, venstre) {
        if (slags === "amino") return venstre ? (har ? "^+H_3N" : "H_2N") : (har ? "NH_3^+" : "NH_2");
        return har ? "COOH" : "COO^-";
    };
    M.gruppeLadning = function (slags, har) {
        if (slags === "amino") return har ? 1 : 0;
        return har ? 0 : -1;
    };

    /* Hele aminosyren. opt:
         orangeH    hydronen i −COOH er orange (fane 1)
         utenH      carboxylgruppen staar som −COO⁻, mens hydronen er paa vej
         gloed      gloed bag de ladede grupper (0-1)
         mork       farven paa CH og sidekaeden */
    M.tegn = function (ctx, aa, tilst, x, y, fs, opt) {
        opt = opt || {};
        var F = D.FARVE, mork = opt.mork || F.blaek;
        var g = fs * 0.2, L = fs * 1.15, rad = fs * 1.75;
        var kasser = {};
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;

        /* Maal foerst, saa gloeden kan ligge bagest */
        var harA = tilst.amino, harC = tilst.carboxyl && !opt.utenH;
        var sA = M.gruppe("amino", harA, true), sC = M.gruppe("carboxyl", harC);
        var wCH = M.bredde(ctx, "CH", fs);
        var xA = x - wCH / 2 - g - L - g, xC = x + wCH / 2 + g + L + g;
        var wA = M.bredde(ctx, sA, fs), wC = M.bredde(ctx, sC, fs);
        var kA = { x: xA - wA, y: y - fs * 0.62, w: wA, h: fs * 1.24, cx: xA - wA / 2, cy: y };
        var kC = { x: xC, y: y - fs * 0.62, w: wC, h: fs * 1.24, cx: xC + wC / 2, cy: y };
        var gl = opt.gloed === undefined ? 1 : opt.gloed;
        M.gloed(ctx, kA, M.gruppeLadning("amino", harA), gl);
        M.gloed(ctx, kC, M.gruppeLadning("carboxyl", harC), gl);

        /* Sidekaeden: raekkerne under CH */
        var side = sideRaekker(aa, tilst);
        var sideK = null;
        if (side.gruppe) {
            var ys = y + rad * side.raekker.length;
            var wS = M.bredde(ctx, side.gruppe, fs);
            sideK = { x: x - wS / 2, y: ys - fs * 0.62, w: wS, h: fs * 1.24, cx: x, cy: ys };
            M.gloed(ctx, sideK, side.q, gl);
        }

        /* Rygraden */
        kasser.amino = M.tekst(ctx, sA, xA, y, fs, harA ? F.syre : F.base, "right");
        streg(ctx, xA + g, y, x - wCH / 2 - g, y, fs, mork);
        var kCH = M.tekst(ctx, "CH", x, y, fs, mork, "center");
        streg(ctx, x + wCH / 2 + g, y, xC - g, y, fs, mork);
        var farverC = null;
        if (harC && opt.orangeH) farverC = { 3: F.hydron };
        kasser.carboxyl = M.tekst(ctx, sC, xC, y, fs, harC ? F.syre : F.base, "left", { farver: farverC });
        if (harC) {
            var dH = kasser.carboxyl.dele[3];
            kasser.hydron = { x: dH.ax - 3, y: y - fs * 0.62, w: dH.w + 6, h: fs * 1.24, cx: dH.ax + dH.w / 2, cy: y };
        }

        /* Sidekaeden */
        var yy = y, forrige = kCH;
        side.raekker.forEach(function (r, i) {
            var yN = y + rad * (i + 1);
            streg(ctx, x, forrige.y + forrige.h - fs * 0.12, x, yN - fs * 0.5, fs, mork);
            if (r.gruppe) {
                kasser.side = M.tekst(ctx, r.t, x, yN, fs, r.har ? F.syre : F.base, "center");
                forrige = kasser.side;
            } else if (r.gren) {
                /* Valin: H₃C—CH—CH₃ */
                var kM = M.tekst(ctx, "CH", x, yN, fs, mork, "center");
                streg(ctx, x - wCH / 2 - g, yN, x - wCH / 2 - g - L * 0.9, yN, fs, mork);
                M.tekst(ctx, "H_3C", x - wCH / 2 - 2 * g - L * 0.9, yN, fs, mork, "right");
                streg(ctx, x + wCH / 2 + g, yN, x + wCH / 2 + g + L * 0.9, yN, fs, mork);
                M.tekst(ctx, "CH_3", x + wCH / 2 + 2 * g + L * 0.9, yN, fs, mork, "left");
                forrige = kM;
            } else {
                forrige = M.tekst(ctx, r.t, x, yN, fs, mork, "center");
            }
            yy = yN;
        });
        ctx.restore();

        var bund = yy + fs * 0.65;
        var bredest = Math.max(kasser.carboxyl.x + kasser.carboxyl.w, x + (side.raekker.length && side.raekker[0].gren ? wCH / 2 + 2 * g + L * 0.9 + M.bredde(ctx, "CH_3", fs) : 0));
        var venstreKant = Math.min(kasser.amino.x, side.raekker.length && side.raekker[0].gren ? x - wCH / 2 - 2 * g - L * 0.9 - M.bredde(ctx, "H_3C", fs) : 1e9);
        kasser.hele = { x: venstreKant, y: y - fs * 0.62, w: bredest - venstreKant, h: bund - (y - fs * 0.62) };
        kasser.CH = kCH;
        return kasser;
    };

    /* Raekkerne i sidekaeden for valin, asparaginsyre og lysin */
    function sideRaekker(aa, tilst) {
        if (aa.side === "val") return { raekker: [{ gren: true }] };
        if (aa.side === "asp") {
            var hc = tilst.side;
            return { raekker: [{ t: "CH_2" }, { t: M.gruppe("carboxyl", hc), gruppe: true, har: hc }],
                     gruppe: M.gruppe("carboxyl", hc), q: M.gruppeLadning("carboxyl", hc) };
        }
        if (aa.side === "lys") {
            var ha = tilst.side;
            return { raekker: [{ t: "CH_2" }, { t: "CH_2" }, { t: "CH_2" }, { t: "CH_2" }, { t: M.gruppe("amino", ha), gruppe: true, har: ha }],
                     gruppe: M.gruppe("amino", ha), q: M.gruppeLadning("amino", ha) };
        }
        return { raekker: [] };
    }

    /* Hoejden af formlen under CH (i fs), saa fanerne kan placere den */
    M.hoejde = function (aa) {
        var n = aa.side === "val" ? 1 : (aa.side === "asp" ? 2 : (aa.side === "lys" ? 5 : 0));
        return 1.24 + 1.75 * n;
    };
    /* Bredden (i fs) af den bredeste form */
    M.breddeFs = function (ctx, aa) {
        var fs = 20, g = fs * 0.2, L = fs * 1.15;
        var wCH = M.bredde(ctx, "CH", fs);
        var b = M.bredde(ctx, "^+H_3N", fs) + 2 * (2 * g + L) + wCH + M.bredde(ctx, "COOH", fs);
        return b / fs;
    };

    NK.Mol = M;
}());

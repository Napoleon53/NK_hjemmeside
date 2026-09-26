/* =====================================================================
   tegning.js - udstyret paa scenen

   Cylinderen med stemplet og molekylerne, manometeret, varmepladen,
   gasflasken med slangen og hanen, hylden med lodderne, skiltene,
   grafen i panelet og tavlen paa fane 2. Funktionerne tegner kun det,
   de faar at vide; tallene kommer fra js/gas.js.

   Geometrien for cylinderen:
     g = { x, y, b, h, vaeg, bund }
     x, y: oeverste venstre hjoerne af cylinderen (kanten foroven)
     b: bredden udvendig, h: hoejden fra kanten ned til bunden indvendig
     Indvendig: fra x + vaeg til x + b - vaeg, bunden ligger i y + h.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var MAAL = NK.Sprites.MAAL;
    var Tg = {};

    var FONT = "'Segoe UI', sans-serif";

    /* Et tal paa en skala uden overfloedige nuller: 10, 2,5, 0,1 */
    function kortTal(v) {
        if (Math.abs(v) < 1e-9) return "0";
        return NK.betydende(v, 3).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
    }
    Tg.kortTal = kortTal;

    /* ----- Rummet ------------------------------------------------------------ */
    Tg.baggrund = function (ctx, W, H, bordY, baandY) {
        var g = ctx.createLinearGradient(0, 0, 0, bordY);
        g.addColorStop(0, "#1c1d25");
        g.addColorStop(1, "#16171d");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, bordY);
        /* Laboratoriebordet, som udstyret staar paa */
        var b = ctx.createLinearGradient(0, bordY, 0, baandY);
        b.addColorStop(0, "#3a3b45");
        b.addColorStop(0.08, "#2c2d36");
        b.addColorStop(1, "#23242c");
        ctx.fillStyle = b;
        ctx.fillRect(0, bordY, W, baandY - bordY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        ctx.fillRect(0, bordY, W, 1.5);
    };

    /* ----- Cylinderen ------------------------------------------------------------
       s: { hoejde (stemplets underside over bunden, px), stempelH,
            partikler, laast, lodder, lodB, vedStop, varme 0-1, kulde 0-1,
            skala: { maks, skjult }, lys: { stempel, top } } */
    Tg.indre = function (g) {
        return { x: g.x + g.vaeg, b: g.b - 2 * g.vaeg, bund: g.y + g.h, top: g.y };
    };

    Tg.cylinder = function (ctx, g, s) {
        var ind = Tg.indre(g);
        var pY = ind.bund - s.hoejde;
        ctx.save();

        /* Foden */
        var fod = ctx.createLinearGradient(0, ind.bund, 0, ind.bund + g.bund);
        fod.addColorStop(0, "#9aa1ab");
        fod.addColorStop(1, "#5d646e");
        ctx.fillStyle = fod;
        NK.rundtRekt(ctx, g.x - 8, ind.bund, g.b + 16, g.bund, 4);
        ctx.fill();
        ctx.strokeStyle = "#3b4048";
        ctx.lineWidth = 1;
        ctx.stroke();

        /* Glassets bagside */
        ctx.fillStyle = "rgba(170, 200, 235, 0.05)";
        ctx.fillRect(ind.x, ind.top, ind.b, ind.bund - ind.top);

        /* Gassen under stemplet, farvet efter temperaturen */
        var gas = ctx.createLinearGradient(0, pY, 0, ind.bund);
        var v = s.varme || 0, k = s.kulde || 0;
        gas.addColorStop(0, "rgba(" + Math.round(120 + 110 * v) + ", " + Math.round(170 - 40 * v + 30 * k) + ", " + Math.round(235 - 120 * v) + ", " + (0.08 + 0.05 * v + 0.05 * k).toFixed(3) + ")");
        gas.addColorStop(1, "rgba(" + Math.round(120 + 130 * v) + ", " + Math.round(170 - 30 * v + 30 * k) + ", " + Math.round(235 - 140 * v) + ", " + (0.13 + 0.12 * v + 0.06 * k).toFixed(3) + ")");
        ctx.fillStyle = gas;
        ctx.fillRect(ind.x, pY, ind.b, s.hoejde);

        /* Skalaen paa glasset (bag molekylerne) */
        if (s.skala) Tg.skala(ctx, g, s.skala, s.pxPrL);

        /* Molekylerne og glimtene, klippet til gassen */
        if (s.partikler) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(ind.x, pY, ind.b, s.hoejde);
            ctx.clip();
            Tg.partikler(ctx, s.partikler, ind.x, ind.bund);
            ctx.restore();
        }

        /* Stemplet */
        var sh = s.stempelH;
        var st = ctx.createLinearGradient(0, pY - sh, 0, pY);
        st.addColorStop(0, "#c9ced6");
        st.addColorStop(0.5, "#9aa1ab");
        st.addColorStop(1, "#6c737d");
        ctx.fillStyle = st;
        NK.rundtRekt(ctx, ind.x + 1, pY - sh, ind.b - 2, sh, 3);
        ctx.fill();
        ctx.strokeStyle = s.lys && s.lys.stempel ? "#f2c53d" : "#3b4048";
        ctx.lineWidth = s.lys && s.lys.stempel ? 2 : 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(20, 22, 26, 0.55)";
        ctx.fillRect(ind.x + 2, pY - sh * 0.72, ind.b - 4, 2);
        ctx.fillRect(ind.x + 2, pY - sh * 0.36, ind.b - 4, 2);

        /* Lodderne paa stemplet */
        var lodB = s.lodB, lodH = lodB * MAAL.lod.h / MAAL.lod.b;
        for (var i = 0; i < (s.lodder || 0); i++) {
            NK.Sprites.tegn(ctx, "lod", ind.x + ind.b / 2 - lodB / 2, pY - sh - (i + 1) * (lodH - 1), lodB, lodH);
        }
        if (s.lys && s.lys.top) {
            ctx.fillStyle = "rgba(242, 197, 61, 0.22)";
            var hh = (s.lodder || 0) * (lodH - 1) + lodH + 6;
            NK.rundtRekt(ctx, ind.x + 4, pY - sh - hh, ind.b - 8, hh, 6);
            ctx.fill();
        }

        /* Glasvaeggene */
        var vg = ctx.createLinearGradient(g.x, 0, g.x + g.vaeg, 0);
        vg.addColorStop(0, "rgba(215, 232, 250, 0.55)");
        vg.addColorStop(1, "rgba(170, 200, 235, 0.18)");
        ctx.fillStyle = vg;
        ctx.fillRect(g.x, g.y, g.vaeg, g.h);
        var hg = ctx.createLinearGradient(g.x + g.b - g.vaeg, 0, g.x + g.b, 0);
        hg.addColorStop(0, "rgba(170, 200, 235, 0.18)");
        hg.addColorStop(1, "rgba(215, 232, 250, 0.5)");
        ctx.fillStyle = hg;
        ctx.fillRect(g.x + g.b - g.vaeg, g.y, g.vaeg, g.h);
        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        ctx.fillRect(ind.x + 5, g.y + 8, 3, g.h - 16);
        ctx.strokeStyle = "rgba(210, 228, 248, 0.7)";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(g.x + 0.5, g.y, g.b - 1, g.h);
        /* Kanten foroven */
        ctx.fillStyle = "rgba(220, 235, 250, 0.75)";
        ctx.fillRect(g.x - 3, g.y - 3, g.vaeg + 6, 4);
        ctx.fillRect(g.x + g.b - g.vaeg - 3, g.y - 3, g.vaeg + 6, 4);

        /* Stoppet: to knaster lige under kanten */
        ctx.fillStyle = s.vedStop ? "#e6892a" : "#5d646e";
        ctx.fillRect(ind.x, g.y + 1, 7, 6);
        ctx.fillRect(ind.x + ind.b - 7, g.y + 1, 7, 6);

        /* Laasen: to kloer, der holder stemplet */
        if (s.laast) Tg.laas(ctx, g, pY, sh);

        /* Rim, naar det er koldt */
        if (k > 0.02) {
            ctx.globalAlpha = Math.min(1, k) * 0.6;
            ctx.fillStyle = "#e8f6ff";
            for (var j = 0; j < 14; j++) {
                var fy = g.y + g.h * ((j * 0.37) % 1);
                ctx.fillRect(g.x + 1, fy, g.vaeg - 1, 3 + (j % 3));
                ctx.fillRect(g.x + g.b - g.vaeg, g.y + g.h * ((j * 0.53 + 0.2) % 1), g.vaeg - 1, 2 + (j % 4));
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    };

    Tg.partikler = function (ctx, P, x0, bund) {
        var r = P.r;
        P.glimt.forEach(function (gl) {
            ctx.strokeStyle = "rgba(255, 240, 200, " + (gl.a * 0.55 * Math.min(1.2, gl.s)).toFixed(3) + ")";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(x0 + gl.x, bund - gl.y, r + 2 + (1 - gl.a) * 5, 0, Math.PI * 2);
            ctx.stroke();
        });
        P.liste.forEach(function (p) {
            var a = NK.klamp(p.a, 0, 1);
            ctx.fillStyle = p.ind > 0 ? "rgba(255, 255, 255, " + a + ")" : "rgba(214, 236, 255, " + (0.9 * a).toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(x0 + p.x, bund - p.y, r, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    /* Skalaen i liter langs glassets venstre side, nedefra */
    Tg.skala = function (ctx, g, sk, pxPrL) {
        var ind = Tg.indre(g);
        var trin = sk.trin, stor = sk.stor;
        ctx.save();
        if (sk.skjult) {
            /* Malertape over skalaen: tallet kommer, naar det er regnet */
            ctx.fillStyle = "rgba(233, 214, 160, 0.92)";
            ctx.fillRect(ind.x + 2, g.y + 10, 24, g.h - 20);
            ctx.fillStyle = "#6b5a2c";
            ctx.font = "700 16px " + FONT;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", ind.x + 14, g.y + g.h / 2);
            ctx.restore();
            return;
        }
        ctx.strokeStyle = "rgba(235, 242, 250, 0.75)";
        ctx.fillStyle = "rgba(235, 242, 250, 0.9)";
        ctx.lineWidth = 1;
        ctx.font = "600 12px " + FONT;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        var antal = Math.round(sk.maks / trin);
        for (var i = 1; i <= antal; i++) {
            var V = i * trin;
            var y = Math.round(ind.bund - V * pxPrL) + 0.5;
            var erStor = Math.abs(V / stor - Math.round(V / stor)) < 1e-6;
            ctx.beginPath();
            ctx.moveTo(ind.x, y);
            ctx.lineTo(ind.x + (erStor ? 12 : 6), y);
            ctx.stroke();
            if (erStor) NK.tekst(ctx, kortTal(V), ind.x + 15, y, { font: "600 12px " + FONT, linje: "middle", kant: true, kantBredde: 3 });
        }
        NK.tekst(ctx, "L", ind.x + 15, g.y + 16, { font: "700 12px " + FONT, linje: "middle", kant: true, kantBredde: 3, farve: "#f2c53d" });
        ctx.restore();
    };

    Tg.laas = function (ctx, g, pY, sh) {
        var ind = Tg.indre(g);
        ctx.save();
        [ind.x - g.vaeg - 5, ind.x + ind.b - 5].forEach(function (x, i) {
            var y = pY - sh - 4;
            ctx.fillStyle = "#f2c53d";
            ctx.strokeStyle = "#5a4418";
            ctx.lineWidth = 1;
            NK.rundtRekt(ctx, x, y, g.vaeg + 10, sh + 8, 3);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#2a2f36";
            for (var s = 0; s < 3; s++) ctx.fillRect(x + 2 + s * 5 + (i ? 0 : 1), y + 2, 2.5, sh + 4);
        });
        /* Haengelaasen ved venstre vaeg (til hoejre staar skiltet med volumen) */
        var lx = g.x - 16, ly = pY - sh / 2;
        ctx.strokeStyle = "#c9ced6";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(lx, ly - 5, 6, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = "#f2c53d";
        NK.rundtRekt(ctx, lx - 9, ly - 5, 18, 14, 3);
        ctx.fill();
        ctx.fillStyle = "#5a4418";
        ctx.fillRect(lx - 1.5, ly, 3, 5);
        ctx.restore();
    };

    /* ----- Manometeret ------------------------------------------------------------
       m: { cx, cy, r } midten og radius af skiven. s: { p, maks, skjult, lys } */
    Tg.manometerStr = function (m) {
        var k = m.r / MAAL.manometer.r;
        return { k: k, x: m.cx - MAAL.manometer.cx * k, y: m.cy - MAAL.manometer.cy * k,
                 b: MAAL.manometer.b * k, h: MAAL.manometer.h * k, bund: m.cy + (MAAL.manometer.bund - MAAL.manometer.cy) * k };
    };

    function vinkel(p, maks) {
        var t = NK.klamp(p / maks, -0.02, 1.04);
        return (135 + 270 * t) * Math.PI / 180;
    }

    Tg.manometer = function (ctx, m, s) {
        var st = Tg.manometerStr(m);
        ctx.save();
        if (s.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, 0.2)";
            ctx.beginPath();
            ctx.arc(m.cx, m.cy, m.r * 1.35, 0, Math.PI * 2);
            ctx.fill();
        }
        NK.Sprites.tegn(ctx, "manometer", st.x, st.y, st.b, st.h);
        var r = m.r;
        /* Streger og tal */
        var stor = s.stor, lille = s.lille;
        ctx.strokeStyle = "#2a2f36";
        ctx.fillStyle = "#1f2328";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var fs = NK.klamp(r * 0.26, 12, 15);
        ctx.font = "700 " + fs + "px " + FONT;
        var antal = Math.round(s.maks / lille);
        for (var i = 0; i <= antal; i++) {
            var p = i * lille, a = vinkel(p, s.maks);
            var erStor = Math.abs(p / stor - Math.round(p / stor)) < 1e-6;
            var r1 = r * (erStor ? 0.78 : 0.86), r2 = r * 0.96;
            ctx.lineWidth = erStor ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(m.cx + Math.cos(a) * r1, m.cy + Math.sin(a) * r1);
            ctx.lineTo(m.cx + Math.cos(a) * r2, m.cy + Math.sin(a) * r2);
            ctx.stroke();
            if (erStor && !s.skjult) {
                var rt = r * 0.58;
                ctx.fillText(kortTal(p), m.cx + Math.cos(a) * rt, m.cy + Math.sin(a) * rt);
            }
        }
        ctx.font = "600 " + Math.max(12, fs - 2) + "px " + FONT;
        ctx.fillStyle = "#5a6270";
        ctx.fillText("bar", m.cx, m.cy + r * 0.62);
        if (s.skjult) {
            ctx.fillStyle = "#b8861a";
            ctx.font = "800 " + Math.round(r * 0.6) + "px " + FONT;
            ctx.fillText("?", m.cx, m.cy - r * 0.05);
        } else {
            /* Viseren */
            var av = vinkel(s.p, s.maks);
            ctx.strokeStyle = "#c0392b";
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(m.cx - Math.cos(av) * r * 0.16, m.cy - Math.sin(av) * r * 0.16);
            ctx.lineTo(m.cx + Math.cos(av) * r * 0.84, m.cy + Math.sin(av) * r * 0.84);
            ctx.stroke();
            ctx.fillStyle = "#2a2f36";
            ctx.beginPath();
            ctx.arc(m.cx, m.cy, r * 0.09, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* ----- Varmepladen -------------------------------------------------------------
       pl: { x, y, b } (hoejden foelger spritet). s: { varme, kulde, tekst,
       knapper, lys: "koel" | "varm" | null } */
    Tg.pladeStr = function (pl) {
        var k = pl.b / MAAL.varmeplade.b, M = MAAL.varmeplade;
        return {
            k: k, h: M.h * k,
            koel: { x: pl.x + M.koelX * k, y: pl.y + M.knapY * k, r: M.knapR * k },
            varm: { x: pl.x + M.varmX * k, y: pl.y + M.knapY * k, r: M.knapR * k },
            disp: { x: pl.x + M.dispV * k, y: pl.y + M.dispTop * k, b: (M.dispH - M.dispV) * k, h: (M.dispBund - M.dispTop) * k },
            plade: { x: pl.x + M.pladeV * k, y: pl.y + M.pladeTop * k, b: (M.pladeH - M.pladeV) * k, h: 10 * k }
        };
    };

    Tg.plade = function (ctx, pl, s) {
        var st = Tg.pladeStr(pl);
        ctx.save();
        NK.Sprites.tegn(ctx, "varmeplade", pl.x, pl.y, pl.b, st.h);
        var p = st.plade;
        if (s.varme > 0.01) {
            var g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
            g.addColorStop(0, "rgba(255, 120, 40, " + (0.85 * s.varme).toFixed(3) + ")");
            g.addColorStop(1, "rgba(200, 40, 20, " + (0.7 * s.varme).toFixed(3) + ")");
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, p.x, p.y, p.b, p.h, 3);
            ctx.fill();
            /* Varmen stiger op mod cylinderen */
            ctx.fillStyle = "rgba(255, 110, 40, " + (0.18 * s.varme).toFixed(3) + ")";
            ctx.fillRect(p.x + p.b * 0.1, p.y - 8, p.b * 0.8, 8);
        }
        if (s.kulde > 0.01) {
            ctx.fillStyle = "rgba(200, 235, 255, " + (0.8 * s.kulde).toFixed(3) + ")";
            NK.rundtRekt(ctx, p.x, p.y, p.b, p.h, 3);
            ctx.fill();
        }
        /* Displayet med temperaturen */
        var d = st.disp;
        ctx.fillStyle = s.tekstFarve || "#7ee0a8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, s.tekst, d.b - 8, NK.klamp(d.h * 0.62, 12, 17), 11, "700");
        ctx.fillText(s.tekst, d.x + d.b / 2, d.y + d.h / 2 + 1);
        /* Knapperne: koel og varm */
        [["koel", "−", "#3d9ee0"], ["varm", "+", "#e05446"]].forEach(function (kn) {
            var c = st[kn[0]];
            ctx.fillStyle = s.knapper ? kn[2] : "#9aa1ab";
            if (s.lys === kn[0]) {
                ctx.fillStyle = kn[0] === "varm" ? "#ff7a6b" : "#6fc0ff";
            }
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
            if (s.knapper) {
                ctx.fillStyle = "#ffffff";
                ctx.font = "800 " + Math.round(c.r * 1.5) + "px " + FONT;
                ctx.fillText(kn[1], c.x, c.y + 1);
            }
        });
        ctx.restore();
    };

    /* ----- Gasflasken, slangen og hanen ------------------------------------------------ */
    Tg.flaskeStr = function (fl) {
        var M = MAAL.gasflaske, k = fl.h / M.h;
        return { k: k, b: M.b * k, dyse: { x: fl.x + M.dyseX * k, y: fl.y + M.dyseY * k },
                 hjul: { x: fl.x + M.hjulX * k, y: fl.y + M.hjulY * k },
                 etiket: { x: fl.x + M.etiketV * k, y: fl.y + M.etiketTop * k, b: (M.etiketH - M.etiketV) * k, h: (M.etiketBund - M.etiketTop) * k } };
    };

    Tg.flaske = function (ctx, fl, s) {
        var st = Tg.flaskeStr(fl);
        ctx.save();
        if (s.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, 0.18)";
            NK.rundtRekt(ctx, fl.x - 8, fl.y - 8, st.b + 16, fl.h + 12, 12);
            ctx.fill();
        }
        NK.Sprites.tegn(ctx, "gasflaske", fl.x, fl.y, st.b, fl.h);
        if (s.utenEtiket) { ctx.restore(); return; }
        var e = st.etiket;
        ctx.fillStyle = "#f6f1dc";
        NK.rundtRekt(ctx, e.x, e.y, e.b, e.h, 4);
        ctx.fill();
        ctx.fillStyle = "#2a2f36";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, "GAS", e.b - 6, NK.klamp(e.h * 0.34, 12, 20), 11, "800");
        ctx.fillText("GAS", e.x + e.b / 2, e.y + e.h * 0.36);
        NK.passendeSkrift(ctx, "+0,25 mol", e.b - 6, NK.klamp(e.h * 0.24, 12, 14), 11, "600");
        ctx.fillStyle = "#5a6270";
        ctx.fillText("+0,25 mol", e.x + e.b / 2, e.y + e.h * 0.72);
        ctx.restore();
    };

    /* Et roer eller en slange langs punkterne */
    Tg.roer = function (ctx, pkt, bredde, farve, kant) {
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        pkt.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
        ctx.strokeStyle = kant || "#1d2024";
        ctx.lineWidth = bredde + 2;
        ctx.stroke();
        ctx.strokeStyle = farve;
        ctx.lineWidth = bredde;
        ctx.stroke();
        ctx.restore();
    };

    /* Hanen, der lukker gas ud: h: { x, y, r }, s: { lys, aaben } */
    Tg.hane = function (ctx, h, s) {
        ctx.save();
        if (s.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, 0.25)";
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.r * 2.1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#b9bfc8";
        ctx.strokeStyle = "#3b4048";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        /* Haandtaget: vandret er lukket, lodret er aabent */
        ctx.translate(h.x, h.y);
        ctx.rotate(s.aaben ? -Math.PI / 2 : 0);
        ctx.fillStyle = "#d0463a";
        NK.rundtRekt(ctx, -h.r * 0.4, -h.r * 2.2, h.r * 0.8, h.r * 2.2, h.r * 0.3);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Hylden med lodderne ---------------------------------------------------------
       hy: { x, y, b } (y er hyldens overside), antal lodder og deres bredde */
    Tg.hylde = function (ctx, hy, antal, lodB, lys) {
        var lodH = lodB * MAAL.lod.h / MAAL.lod.b;
        ctx.save();
        if (lys) {
            ctx.fillStyle = "rgba(242, 197, 61, 0.2)";
            NK.rundtRekt(ctx, hy.x - 4, hy.y - Math.max(1, antal) * lodH - 10, hy.b + 8, Math.max(1, antal) * lodH + 18, 6);
            ctx.fill();
        }
        /* Konsollen og braettet */
        ctx.fillStyle = "#6b4a2b";
        ctx.fillRect(hy.x + hy.b * 0.5 - 3, hy.y + 6, 6, 18);
        ctx.fillStyle = "#8a6238";
        NK.rundtRekt(ctx, hy.x, hy.y, hy.b, 7, 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(hy.x + 2, hy.y + 1, hy.b - 4, 1.5);
        for (var i = 0; i < antal; i++) {
            NK.Sprites.tegn(ctx, "lod", hy.x + hy.b / 2 - lodB / 2, hy.y - (i + 1) * (lodH - 1), lodB, lodH);
        }
        ctx.restore();
    };

    /* ----- Skilte ---------------------------------------------------------------------
       Et lille skilt med tekst. slags: "" (hvidt), "ukendt" (gult med ?),
       "fundet" (groent) eller "moerk" (til tal paa scenen). Med W holdes
       skiltet inden for scenens bredde. */
    Tg.skilt = function (ctx, x, y, tekst, slags, just, W) {
        ctx.save();
        ctx.font = "700 14px " + FONT;
        var b = ctx.measureText(tekst).width + 16, h = 24;
        var x0 = just === "hoejre" ? x - b : (just === "midt" ? x - b / 2 : x);
        if (W) x0 = NK.klamp(x0, 4, Math.max(4, W - b - 4));
        var bund = { "": "#f6f1dc", ukendt: "#fbe7a1", fundet: "#dff5e8", moerk: "rgba(16, 18, 24, 0.82)" }[slags || ""];
        var kant = { "": "#8e97a5", ukendt: "#d9a21b", fundet: "#3fae72", moerk: "rgba(255, 255, 255, 0.25)" }[slags || ""];
        ctx.fillStyle = bund;
        NK.rundtRekt(ctx, x0, y - h / 2, b, h, 6);
        ctx.fill();
        ctx.strokeStyle = kant;
        ctx.lineWidth = slags === "ukendt" ? 2 : 1.2;
        ctx.stroke();
        ctx.fillStyle = slags === "moerk" ? "#f2f3f5" : "#1f2328";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x0 + 8, y + 1);
        ctx.restore();
        return { x: x0, y: y - h / 2, b: b, h: h };
    };

    /* ----- Grafen paa scenen -------------------------------------------------------------
       r: { x, y, b, h } kortet. st: { n, T, V, p, vMaks, pMaks, spor: [{ V, p }], kurve } */
    Tg.graf = function (ctx, r, st) {
        ctx.save();
        ctx.fillStyle = "rgba(12, 13, 18, 0.72)";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = "700 12px " + FONT;
        ctx.fillStyle = "#f2c53d";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText("TRYK OG VOLUMEN", r.x + 10, r.y + 13);
        ctx.translate(r.x + 4, r.y + 24);
        var W = r.b - 8, H = r.h - 28;
        var v0 = 36, h0 = 36, top = 20, bund = H - 18;
        var b = W - v0 - h0, h = bund - top;
        function X(V) { return v0 + NK.klamp(V / st.vMaks, 0, 1.02) * b; }
        function Y(p) { return bund - NK.klamp(p / st.pMaks, 0, 1.04) * h; }
        /* Forklaringen til den stiplede kurve oeverst til hoejre */
        ctx.font = "600 12px " + FONT;
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(242, 197, 61, 0.9)";
        ctx.fillText("- - - samme n og T", W - 2, 6);
        ctx.font = "600 12px " + FONT;
        ctx.textBaseline = "middle";
        /* Gitter og akser */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#a9b0ba";
        ctx.textAlign = "center";
        for (var V = 0; V <= st.vMaks + 1e-9; V += 10) {
            ctx.beginPath();
            ctx.moveTo(Math.round(X(V)) + 0.5, top);
            ctx.lineTo(Math.round(X(V)) + 0.5, bund);
            ctx.stroke();
            if (b >= 190 || V % 20 === 0) ctx.fillText(String(V), X(V), bund + 11);
        }
        ctx.textAlign = "right";
        for (var p = 0; p <= st.pMaks + 1e-9; p += 2) {
            ctx.beginPath();
            ctx.moveTo(v0, Math.round(Y(p)) + 0.5);
            ctx.lineTo(v0 + b, Math.round(Y(p)) + 0.5);
            ctx.stroke();
            ctx.fillText(String(p), v0 - 6, Y(p));
        }
        ctx.strokeStyle = "#7e8590";
        ctx.beginPath();
        ctx.moveTo(v0, top);
        ctx.lineTo(v0, bund);
        ctx.lineTo(v0 + b, bund);
        ctx.stroke();
        ctx.fillStyle = "#c8ced6";
        ctx.textAlign = "right";
        ctx.fillText("V / L", W - 2, bund);
        ctx.textAlign = "left";
        ctx.fillText("p / bar", 2, 8);
        /* Kurven for samme n og T */
        if (st.kurve) {
            var nRT = st.n * NK.Data.R * st.T;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.75)";
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            var start = true;
            for (var i = 0; i <= 120; i++) {
                var Vk = Math.max(0.3, st.vMaks * i / 120), pk = nRT / Vk;
                if (pk > st.pMaks * 1.04) continue;
                if (start) { ctx.moveTo(X(Vk), Y(pk)); start = false; } else ctx.lineTo(X(Vk), Y(pk));
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
        /* Sporet og punktet */
        var spor = st.spor || [];
        for (var j = 1; j < spor.length; j++) {
            ctx.strokeStyle = "rgba(111, 192, 255, " + (0.12 + 0.6 * j / spor.length).toFixed(3) + ")";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(X(spor[j - 1].V), Y(spor[j - 1].p));
            ctx.lineTo(X(spor[j].V), Y(spor[j].p));
            ctx.stroke();
        }
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#3d9ee0";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(X(st.V), Y(st.p), 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Tavlen paa fane 2 ------------------------------------------------------------- */
    Tg.tavle = function (ctx, t) {
        ctx.save();
        ctx.fillStyle = "#6b4a2b";
        NK.rundtRekt(ctx, t.x - 8, t.y - 8, t.b + 16, t.h + 16, 6);
        ctx.fill();
        var g = ctx.createLinearGradient(t.x, t.y, t.x + t.b, t.y + t.h);
        g.addColorStop(0, "#27463a");
        g.addColorStop(1, "#1d372d");
        ctx.fillStyle = g;
        ctx.fillRect(t.x, t.y, t.b, t.h);
        /* Lidt udvisket kridt */
        var v = ctx.createRadialGradient(t.x + t.b * 0.35, t.y + t.h * 0.3, 10, t.x + t.b * 0.35, t.y + t.h * 0.3, t.b * 0.7);
        v.addColorStop(0, "rgba(255, 255, 255, 0.05)");
        v.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = v;
        ctx.fillRect(t.x, t.y, t.b, t.h);
        /* Kridthylden */
        ctx.fillStyle = "#5a3d22";
        ctx.fillRect(t.x - 4, t.y + t.h + 2, t.b + 8, 8);
        ctx.fillStyle = "#f4f1e8";
        ctx.fillRect(t.x + t.b * 0.72, t.y + t.h + 0.5, 22, 4);
        ctx.restore();
    };

    NK.Tegn = Tg;
}());

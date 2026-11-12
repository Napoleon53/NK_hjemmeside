/* =====================================================================
   scene.js - skilletragten, luppen og log D-kurven (alle tre faner)

   Tegnet efter bogens figurer b8-fordeling-octanol (stativ, skilletragt
   med octan-1-ol over vand, luppen ved graensen mellem lagene),
   b8-membran (kuglerne HA og A⁻) og b8-logd-syre-base (kurven).

   S.tragt(ctx, k, opt)      skilletragten i stativet. k = { x, y, s } er
                             kassen (enheder: 262 bred, 486 hoej).
                             opt: vinkel, blandet (0-1), ph, lupPunkt
   S.lupPunkt(k)             graensen mellem lagene, hvor luppen ser
   S.Lup                     luppen med de 20 molekyler: pladser, flytning,
                             omrystning og tegning
   S.graf...                 akserne, kroppens omraader, kurverne,
                             markoeren, punkterne og haeldningen
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegning;
    var S = {};
    var FONT = T.FONT;
    var F = D.FARVE;

    /* ----- Skilletragten ----------------------------------------------------------
       Profilen r(v) er den indvendige halve bredde. Halsen ender ved v = 64,
       skulderen er bredest ved v = 150, og keglen ender ved hanen (v = 334).
       Lagene har samme rumfang, saa graensen ligger lige under skulderen. */
    var TR = { midt: 100, top: 64, skulder: 150, bund: 334, over: 96, U0: -62, B: 262, H: 486 };
    TR.r = function (v) {
        if (v < TR.top) return 12;
        if (v <= TR.skulder) return 12 + 74 * Math.sin((v - TR.top) / (TR.skulder - TR.top) * Math.PI / 2);
        if (v <= TR.bund) return 5 + 81 * Math.pow(1 - (v - TR.skulder) / (TR.bund - TR.skulder), 1.2);
        return 5;
    };
    (function () {
        var rum = {}, sum = 0, v;
        for (v = TR.bund; v >= TR.top; v--) { var r = TR.r(v); sum += r * r; rum[v] = sum; }
        var halv = rum[TR.over] / 2;
        for (v = TR.bund; v >= TR.top; v--) if (rum[v] >= halv) { TR.graense = v; break; }
    })();
    S.TRAGT = TR;

    var OCT = [243, 226, 166], VAND = [207, 228, 245], BLAND = [226, 230, 205];
    function blandFarve(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
    function rgb(c, a) { return "rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + (a === undefined ? 1 : a) + ")"; }

    /* Kassen til en hoejde og bredde */
    S.tragtKasse = function (x, y, b, h) {
        var s = Math.min(b / TR.B, h / TR.H);
        return { x: x + (b - TR.B * s) / 2, y: y + (h - TR.H * s), s: s, b: TR.B * s, h: TR.H * s };
    };
    function XU(k, u) { return k.x + (u - TR.U0) * k.s; }
    function YV(k, v) { return k.y + v * k.s; }

    /* Det punkt paa graensen, luppen ser paa */
    S.lupPunkt = function (k) { return { x: XU(k, TR.midt + 34), y: YV(k, TR.graense), r: 12 * k.s }; };

    /* Glasset i tragten (til klik) */
    S.iTragt = function (k, pt) {
        if (!k || !pt) return false;
        return pt.x > XU(k, 2) && pt.x < XU(k, 198) && pt.y > YV(k, 6) && pt.y < YV(k, 360);
    };

    S.tragt = function (ctx, k, opt) {
        opt = opt || {};
        var s = k.s, m = opt.blandet || 0;
        function X(u) { return XU(k, u); }
        function Y(v) { return YV(k, v); }

        /* Stativet: fod, stang og klemme */
        ctx.save();
        var gf = ctx.createLinearGradient(0, Y(468), 0, Y(486));
        gf.addColorStop(0, "#59606b");
        gf.addColorStop(1, "#2f343b");
        ctx.fillStyle = gf;
        NK.rundtRekt(ctx, X(-62), Y(468), 236 * s, 18 * s, 4 * s);
        ctx.fill();
        var gs = ctx.createLinearGradient(X(-46), 0, X(-34), 0);
        gs.addColorStop(0, "#8d949e");
        gs.addColorStop(0.45, "#d7dbe0");
        gs.addColorStop(1, "#7d848e");
        ctx.fillStyle = gs;
        ctx.fillRect(X(-46), Y(14), 11 * s, 456 * s);
        ctx.restore();

        /* Baegerglasset under hanen */
        ctx.save();
        ctx.strokeStyle = "#8b98a7";
        ctx.lineWidth = Math.max(1.4, 2.6 * s);
        ctx.lineJoin = "round";
        ctx.fillStyle = "rgba(225, 236, 245, 0.45)";
        ctx.beginPath();
        ctx.moveTo(X(52), Y(414));
        ctx.lineTo(X(56), Y(418));
        ctx.lineTo(X(56), Y(466));
        ctx.lineTo(X(150), Y(466));
        ctx.lineTo(X(150), Y(414));
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        /* Klemmen: arm fra stangen og en ring om keglen */
        var vR = 292, rR = TR.r(vR) + 7;
        ctx.save();
        ctx.fillStyle = "#3b4048";
        NK.rundtRekt(ctx, X(-52), Y(vR - 13), 24 * s, 26 * s, 4 * s);
        ctx.fill();
        ctx.fillStyle = "#9aa2ad";
        ctx.fillRect(X(-28), Y(vR - 3), (TR.midt - rR + 28) * s, 6 * s);
        ctx.restore();

        /* Selve tragten, drejet om midten, naar den rystes */
        var cx = X(TR.midt), cy = Y(200);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(opt.vinkel || 0);
        ctx.translate(-cx, -cy);

        function indre() {
            ctx.beginPath();
            for (var v = TR.top; v <= TR.bund; v += 2) ctx.lineTo(X(TR.midt - TR.r(v)), Y(v));
            for (var v2 = TR.bund; v2 >= TR.top; v2 -= 2) ctx.lineTo(X(TR.midt + TR.r(v2)), Y(v2));
            ctx.closePath();
        }
        /* Lagene */
        ctx.save();
        indre();
        ctx.clip();
        var cO = blandFarve(OCT, BLAND, m), cV = blandFarve(VAND, BLAND, m);
        var go = ctx.createLinearGradient(0, Y(TR.over), 0, Y(TR.graense));
        go.addColorStop(0, rgb(blandFarve(cO, [255, 255, 255], 0.25)));
        go.addColorStop(1, rgb(cO));
        ctx.fillStyle = go;
        ctx.fillRect(X(0), Y(TR.over), 200 * s, (TR.graense - TR.over) * s);
        var gv = ctx.createLinearGradient(0, Y(TR.graense), 0, Y(TR.bund));
        gv.addColorStop(0, rgb(cV));
        gv.addColorStop(1, rgb(blandFarve(cV, [170, 200, 228], 0.5)));
        ctx.fillStyle = gv;
        ctx.fillRect(X(0), Y(TR.graense), 200 * s, (TR.bund + 2 - TR.graense) * s);
        /* Draaber, mens lagene er blandet */
        if (m > 0.02) {
            var draaber = opt.draaber || [];
            draaber.forEach(function (d) {
                var v = TR.over + (TR.bund - 10 - TR.over) * d.v, rr = TR.r(v) * 0.85;
                ctx.beginPath();
                ctx.arc(X(TR.midt + d.u * rr), Y(v), d.r * s, 0, Math.PI * 2);
                ctx.fillStyle = d.oct ? rgb(OCT, 0.85 * m) : rgb(VAND, 0.85 * m);
                ctx.fill();
            });
        }
        /* Graensen og overfladen */
        ctx.strokeStyle = "rgba(60, 90, 120, " + (0.55 * (1 - m)).toFixed(3) + ")";
        ctx.lineWidth = Math.max(1, 1.6 * s);
        ctx.beginPath(); ctx.moveTo(X(0), Y(TR.graense)); ctx.lineTo(X(200), Y(TR.graense)); ctx.stroke();
        ctx.strokeStyle = "rgba(160, 130, 40, 0.6)";
        ctx.beginPath(); ctx.moveTo(X(0), Y(TR.over)); ctx.lineTo(X(200), Y(TR.over)); ctx.stroke();
        ctx.restore();

        /* Glasset: kanten og glansen */
        ctx.save();
        ctx.strokeStyle = "#6f7d8c";
        ctx.lineWidth = Math.max(1.6, 3 * s);
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(X(TR.midt - 13), Y(34));
        for (var v3 = TR.top; v3 <= TR.bund; v3 += 2) ctx.lineTo(X(TR.midt - TR.r(v3) - 2.5), Y(v3));
        ctx.lineTo(X(TR.midt - 6.5), Y(TR.bund + 14));
        ctx.moveTo(X(TR.midt + 6.5), Y(TR.bund + 14));
        for (var v4 = TR.bund; v4 >= TR.top; v4 -= 2) ctx.lineTo(X(TR.midt + TR.r(v4) + 2.5), Y(v4));
        ctx.lineTo(X(TR.midt + 13), Y(34));
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = Math.max(2, 5 * s);
        ctx.lineCap = "round";
        ctx.beginPath();
        for (var v5 = 100; v5 <= 196; v5 += 3) ctx.lineTo(X(TR.midt - TR.r(v5) + 14), Y(v5));
        ctx.stroke();
        /* Proppen */
        ctx.fillStyle = "#e6eaee";
        ctx.strokeStyle = "#8b96a3";
        ctx.lineWidth = Math.max(1.2, 2 * s);
        ctx.beginPath();
        ctx.moveTo(X(84), Y(10)); ctx.lineTo(X(116), Y(10)); ctx.lineTo(X(112), Y(40)); ctx.lineTo(X(88), Y(40)); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#d5dbe1";
        NK.rundtRekt(ctx, X(80), Y(4), 40 * s, 10 * s, 3 * s);
        ctx.fill(); ctx.stroke();
        /* Hanen og roeret */
        ctx.fillStyle = "rgba(225, 236, 245, 0.8)";
        ctx.strokeStyle = "#6f7d8c";
        ctx.lineWidth = Math.max(1.2, 2.2 * s);
        NK.rundtRekt(ctx, X(95), Y(TR.bund + 12), 10 * s, 84 * s, 3 * s);
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(X(100), Y(TR.bund + 26), 10 * s, 0, Math.PI * 2);
        ctx.fillStyle = "#eef2f6"; ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#2f7fc1";
        ctx.strokeStyle = "#1d5a8c";
        NK.rundtRekt(ctx, X(100), Y(TR.bund + 21), 42 * s, 10 * s, 4 * s);
        ctx.fill(); ctx.stroke();
        ctx.restore();

        /* Navnene paa lagene */
        if (m < 0.5) {
            var fsN = NK.klamp(15 * s, 11, 16), a = 1 - m * 2;
            ctx.save();
            ctx.globalAlpha = a;
            NK.tekst(ctx, "octan-1-ol", X(TR.midt - 6), Y((TR.over + TR.graense) / 2) + 1, { font: "800 " + fsN + "px " + FONT, farve: F.octanolTekst, justering: "center", linje: "middle" });
            NK.tekst(ctx, "vand", X(TR.midt), Y(TR.graense + 30), { font: "800 " + fsN + "px " + FONT, farve: F.vandTekst, justering: "center", linje: "middle" });
            if (opt.ph !== undefined && opt.ph !== null) {
                var t = "pH " + D.komma1(opt.ph), fsP = NK.klamp(13 * s, 11, 14);
                ctx.font = "800 " + fsP + "px " + FONT;
                var tb = ctx.measureText(t).width + 12, th = fsP + 9, ty = Y(TR.graense + 58);
                ctx.fillStyle = "#2a3342";
                NK.rundtRekt(ctx, X(TR.midt) - tb / 2, ty - th / 2, tb, th, 5);
                ctx.fill();
                NK.tekst(ctx, t, X(TR.midt), ty + 1, { font: "800 " + fsP + "px " + FONT, farve: "#ffffff", justering: "center", linje: "middle" });
            }
            ctx.restore();
        }
        ctx.restore();

        /* Ringen i klemmen foran glasset */
        ctx.save();
        ctx.strokeStyle = "#7f8792";
        ctx.lineWidth = Math.max(1.6, 3 * s);
        ctx.beginPath();
        ctx.ellipse(X(TR.midt), Y(vR), rR * s, 5 * s, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();

        /* Den lille cirkel ved graensen, som luppen forstoerrer */
        if (opt.lupPunkt !== false && m < 0.3) {
            var p = S.lupPunkt(k);
            ctx.save();
            ctx.strokeStyle = "rgba(42, 51, 66, 0.75)";
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    };

    /* De stiplede linjer fra cirklen i tragten til luppen */
    S.lupLinjer = function (ctx, p, lup) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(93, 104, 120, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.r); ctx.lineTo(lup.cx - lup.R * 0.17, lup.cy - lup.R * 0.985);
        ctx.moveTo(p.x, p.y + p.r); ctx.lineTo(lup.cx - lup.R * 0.17, lup.cy + lup.R * 0.985);
        ctx.stroke();
        ctx.restore();
    };

    /* =====================================================================
       Luppen: en cirkel med octan-1-ol foroven og vand forneden. De to
       halvdele er lige store rumfang, saa antallet af kugler i hver
       halvdel svarer til koncentrationen. Hvert molekyle har en rang:
       de laveste er i octanol, saa de uladede i vand og til sidst ionerne.
       ===================================================================== */
    function Lup() {
        this.mol = [];
        this.cx = 0; this.cy = 0; this.R = 100; this.r = 12;
        this.plads = { o: [], v: [] };
        this.blandet = 0;
        this.ryster = false;
    }

    /* Et fast, men tilfaeldigt udseende, raekkefoelge (samme hver gang) */
    function blandFast(liste, frø) {
        var a = liste.slice(), x = frø;
        for (var i = a.length - 1; i > 0; i--) {
            x = (x * 1103515245 + 12345) % 2147483648;
            var j = x % (i + 1), t = a[i];
            a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    Lup.prototype.pladserFor = function (R, r) {
        var d = 2 * r + 5, ud = { o: [], v: [] };
        ["o", "v"].forEach(function (h) {
            var fortegn = h === "o" ? -1 : 1;
            for (var j = 0; j < 20; j++) {
                var dy = fortegn * (r + 6 + j * d * 0.87);
                if (Math.abs(dy) > R - r - 5) break;
                for (var i = -12; i <= 12; i++) {
                    var dx = i * d + (j % 2 ? d / 2 : 0);
                    if (Math.sqrt(dx * dx + dy * dy) <= R - r - 6) ud[h].push({ dx: dx, dy: dy });
                }
            }
            ud[h] = blandFast(ud[h], h === "o" ? 7 : 19);
        });
        return ud;
    };

    Lup.prototype.geometri = function (cx, cy, R) {
        var nyStr = Math.abs(R - this.R) > 0.5 || !this.plads.o.length;
        this.cx = cx; this.cy = cy; this.R = R;
        if (!nyStr) return;
        var r = NK.klamp(R * 0.09, 10, 17), p = this.pladserFor(R, r);
        while ((p.o.length < D.ANTAL_MOL || p.v.length < D.ANTAL_MOL) && r > 8) { r -= 0.5; p = this.pladserFor(R, r); }
        this.r = r;
        this.plads = p;
        /* Alle molekyler faar nye pladser i den samme halvdel */
        var mig = this;
        this.optaget = { o: [], v: [] };
        this.mol.forEach(function (m) { m.slot = -1; });
        this.mol.forEach(function (m) {
            m.slot = mig.ledig(m.halv);
            mig.optaget[m.halv][m.slot] = true;
            var pl = mig.plads[m.halv][m.slot];
            m.x = pl.dx; m.y = pl.dy;
        });
    };

    Lup.prototype.ledig = function (h) {
        var liste = this.plads[h];
        for (var i = 0; i < liste.length; i++) if (!this.optaget[h][i]) return i;
        return 0;
    };

    /* n molekyler, alle i vandet (foer omrystningen) eller i en fordeling */
    Lup.prototype.nulstil = function (fordeling) {
        var n = D.ANTAL_MOL, ranger = blandFast(Array.apply(null, { length: n }).map(function (x, i) { return i; }), 31);
        this.mol = [];
        this.optaget = { o: [], v: [] };
        for (var i = 0; i < n; i++) this.mol.push({ rang: ranger[i], halv: "v", ion: false, slot: -1, x: 0, y: 0, blink: 0, fase: (i * 2.39) % 6.28, vx: 0, vy: 0, vt: 0 });
        var mig = this;
        this.mol.forEach(function (m) { m.slot = mig.ledig("v"); mig.optaget.v[m.slot] = true; });
        this.saetFordeling(fordeling || { oct: 0, u: n, ion: 0 }, true);
    };

    /* Fordelingen { oct, u, ion }: rangen afgoer, hvor hvert molekyle er */
    Lup.prototype.saetFordeling = function (f, stille) {
        var mig = this;
        this.f = f;
        this.mol.forEach(function (m) {
            var halv = m.rang < f.oct ? "o" : "v", ion = m.rang >= f.oct + f.u;
            if (halv !== m.halv) {
                mig.optaget[m.halv][m.slot] = false;
                m.halv = halv;
                m.slot = mig.ledig(halv);
                mig.optaget[halv][m.slot] = true;
                if (!stille) m.blink = Math.max(m.blink, 0.3);
            }
            if (ion !== m.ion) { m.ion = ion; if (!stille) m.blink = 0.7; }
            if (stille) { var pl = mig.plads[m.halv][m.slot] || { dx: 0, dy: 0 }; m.x = pl.dx; m.y = pl.dy; }
        });
    };

    Lup.prototype.antal = function () {
        var n = { oct: 0, u: 0, ion: 0 };
        this.mol.forEach(function (m) { if (m.halv === "o") n.oct++; else if (m.ion) n.ion++; else n.u++; });
        return n;
    };

    Lup.prototype.opdater = function (dt) {
        var mig = this, R = this.R - this.r - 6;
        this.mol.forEach(function (m) {
            m.fase += dt * 1.2;
            if (m.blink > 0) m.blink = Math.max(0, m.blink - dt);
            var tx, ty;
            if (mig.ryster) {
                /* Under omrystningen vandrer molekylerne frit i hele luppen */
                m.vt -= dt;
                if (m.vt <= 0) {
                    var v = Math.random() * Math.PI * 2, a = Math.sqrt(Math.random()) * R;
                    m.vx = Math.cos(v) * a; m.vy = Math.sin(v) * a; m.vt = NK.r(0.25, 0.5);
                }
                tx = m.vx; ty = m.vy;
                m.x = NK.mod(m.x, tx, 7, dt);
                m.y = NK.mod(m.y, ty, 7, dt);
            } else {
                var pl = mig.plads[m.halv][m.slot] || { dx: 0, dy: 0 };
                m.x = NK.mod(m.x, pl.dx, 4.5, dt);
                m.y = NK.mod(m.y, pl.dy, 4.5, dt);
            }
        });
    };

    /* Er alle molekyler naaet hen paa deres pladser? */
    Lup.prototype.iRo = function () {
        var mig = this;
        return this.mol.every(function (m) {
            var pl = mig.plads[m.halv][m.slot] || { dx: 0, dy: 0 };
            return Math.abs(m.x - pl.dx) < 1.5 && Math.abs(m.y - pl.dy) < 1.5;
        });
    };

    /* opt: stof (navnene paa kuglerne), orange (fane 1), ph (i navnet paa
       vandet), ukendt (det ukendte stof i fane 3) */
    Lup.prototype.tegn = function (ctx, opt) {
        opt = opt || {};
        var cx = this.cx, cy = this.cy, R = this.R, m = this.blandet, r = this.r;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.beginPath(); ctx.arc(cx, cy, R + 5, 0, Math.PI * 2);
        ctx.fillStyle = "#3d4652";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
        var cO = blandFarve(OCT, BLAND, m), cV = blandFarve(VAND, BLAND, m);
        var go = ctx.createLinearGradient(0, cy - R, 0, cy);
        go.addColorStop(0, rgb(blandFarve(cO, [255, 255, 255], 0.35)));
        go.addColorStop(1, rgb(cO));
        ctx.fillStyle = go;
        ctx.fillRect(cx - R, cy - R, 2 * R, R);
        var gv = ctx.createLinearGradient(0, cy, 0, cy + R);
        gv.addColorStop(0, rgb(cV));
        gv.addColorStop(1, rgb(blandFarve(cV, [255, 255, 255], 0.35)));
        ctx.fillStyle = gv;
        ctx.fillRect(cx - R, cy, 2 * R, R);
        ctx.strokeStyle = "rgba(60, 90, 120, " + (0.6 * (1 - m)).toFixed(3) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();

        var stof = opt.stof;
        this.mol.forEach(function (mo) {
            var x = cx + mo.x + Math.sin(mo.fase) * 1.4, y = cy + mo.y + Math.cos(mo.fase * 0.8) * 1.2;
            var slags, tekst = "", skjult = !!opt.ukendt;
            if (opt.orange || !stof || stof.slags === "neutral") slags = "orange";
            else if (mo.ion) { slags = skjult ? "ukendtIon" : (stof.slags === "syre" ? "anion" : "kation"); tekst = skjult ? stof.skjultIon : stof.ion; }
            else { slags = skjult ? "ukendt" : "uladet"; tekst = skjult ? stof.skjultU : stof.u; }
            T.kugle(ctx, x, y, r, slags, tekst);
            if (mo.blink > 0) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, mo.blink / 0.5) * 0.5;
                ctx.strokeStyle = F.hydron;
                ctx.lineWidth = 2.2;
                ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }
        });
        ctx.restore();

        /* Kanten og glansen */
        ctx.save();
        ctx.strokeStyle = "#3d4652";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, R + 1, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, R - 6, Math.PI * 1.08, Math.PI * 1.38); ctx.stroke();
        ctx.restore();

        /* Navnene over og under luppen */
        var fs = NK.klamp(R * 0.095, 12, 15);
        NK.tekst(ctx, "octan-1-ol", cx, cy - R - 18, { font: "800 " + fs + "px " + FONT, farve: F.octanolTekst, justering: "center", linje: "middle" });
        var vt = "vand" + (opt.ph !== undefined && opt.ph !== null ? ", pH " + D.komma1(opt.ph) : "");
        NK.tekst(ctx, vt, cx, cy + R + 19, { font: "800 " + fs + "px " + FONT, farve: F.vandTekst, justering: "center", linje: "middle" });
    };

    S.Lup = Lup;

    /* =====================================================================
       Grafen: log D som funktion af pH (bogens b8-logd-kurve). g er
       { x0, x1, y0, y1 } for selve fladen. Aksen gaar fra −5 til 3.
       ===================================================================== */
    S.X = function (g, ph) { return g.x0 + (g.x1 - g.x0) * ph / 14; };
    S.Y = function (g, v) { return g.y1 - (g.y1 - g.y0) * (v - D.Y_MIN) / (D.Y_MAX - D.Y_MIN); };
    S.ANTAL_BIN = Math.round(14 / D.PH_SKRIDT) + 1;
    S.bin = function (ph) { return NK.klamp(Math.round(ph / D.PH_SKRIDT), 0, S.ANTAL_BIN - 1); };

    var AKSE = "#556766";

    S.akser = function (ctx, g) {
        ctx.save();
        var gr = ctx.createLinearGradient(0, g.y0, 0, g.y1);
        gr.addColorStop(0, "#f7fbfb");
        gr.addColorStop(1, "#edf3f2");
        ctx.fillStyle = gr;
        ctx.fillRect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
        ctx.strokeStyle = "#d5e2e0";
        ctx.lineWidth = 1;
        for (var v = D.Y_MIN + 1; v <= D.Y_MAX; v++) {
            if (v === 0) continue;
            ctx.beginPath(); ctx.moveTo(g.x0, S.Y(g, v)); ctx.lineTo(g.x1, S.Y(g, v)); ctx.stroke();
        }
        ctx.restore();
    };

    /* Akselinjerne, tallene og navnene (tegnes oven paa kurverne) */
    S.akseTekst = function (ctx, g) {
        ctx.save();
        ctx.strokeStyle = "#3c4a49";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(g.x0, S.Y(g, 0)); ctx.lineTo(g.x1, S.Y(g, 0)); ctx.stroke();
        ctx.strokeStyle = AKSE;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(g.x0, g.y0 - 6); ctx.lineTo(g.x0, g.y1); ctx.lineTo(g.x1 + 4, g.y1); ctx.stroke();
        ctx.restore();
        for (var v = D.Y_MIN; v <= D.Y_MAX; v++) {
            NK.tekst(ctx, String(v).replace("-", "−"), g.x0 - 8, S.Y(g, v), { font: "600 12px " + FONT, farve: AKSE, justering: "right", linje: "middle" });
        }
        var trin = g.x1 - g.x0 < 330 ? 2 : 1;
        for (var p = 0; p <= 14; p += trin) {
            NK.tekst(ctx, String(p), S.X(g, p), g.y1 + 13, { font: "600 12px " + FONT, farve: AKSE, justering: "center", linje: "middle" });
        }
        NK.tekst(ctx, "pH", (g.x0 + g.x1) / 2, g.y1 + 31, { font: "600 13px " + FONT, farve: AKSE, justering: "center", linje: "middle", kant: true, kantFarve: "#f4f6f5", kantBredde: 6 });
        ctx.save();
        ctx.translate(g.x0 - 34, (g.y0 + g.y1) / 2);
        ctx.rotate(-Math.PI / 2);
        NK.tekst(ctx, "log D", 0, 0, { font: "700 13px " + FONT, farve: AKSE, justering: "center", linje: "middle" });
        ctx.restore();
    };

    /* Kroppens omraader som farvede baand med navnet over grafen */
    S.krop = function (ctx, g) {
        D.KROP.forEach(function (z, i) {
            var x0 = S.X(g, z.fra), x1 = S.X(g, z.til);
            ctx.save();
            ctx.fillStyle = z.farve;
            ctx.fillRect(x0, g.y0, x1 - x0, g.y1 - g.y0);
            ctx.restore();
            var xm = (x0 + x1) / 2;
            if (z.navn === "tyndtarm") xm -= 4;
            if (z.navn === "blod") xm += 10;
            NK.tekst(ctx, z.navn, xm, g.y0 - 10 - (i === 2 ? 0 : 0), { font: "800 12px " + FONT, farve: z.tekst, justering: z.navn === "blod" ? "left" : "center", linje: "middle" });
        });
    };

    /* En kurve. besoegt er listen over de pH-trin, skyderen har vaeret
       paa (null tegner hele kurven) */
    S.kurve = function (ctx, g, stof, besoegt, opt) {
        opt = opt || {};
        ctx.save();
        ctx.beginPath(); ctx.rect(g.x0, g.y0 - 2, g.x1 - g.x0 + 2, g.y1 - g.y0 + 2); ctx.clip();
        ctx.globalAlpha = opt.alfa === undefined ? 1 : opt.alfa;
        ctx.strokeStyle = opt.farve || stof.farve;
        ctx.lineWidth = opt.bredde || 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        if (opt.stiplet) ctx.setLineDash([6, 5]);
        ctx.beginPath();
        var tegner = false;
        for (var b = 0; b < S.ANTAL_BIN; b++) {
            if (besoegt && !besoegt[b]) { tegner = false; continue; }
            for (var k = 0; k < 4; k++) {
                if (k > 0 && (b === S.ANTAL_BIN - 1 || (besoegt && !besoegt[b + 1]))) break;
                var ph = (b + k / 4) * D.PH_SKRIDT, x = S.X(g, ph), y = S.Y(g, Math.max(D.Y_MIN - 0.4, D.logD(stof, ph)));
                if (!tegner) { ctx.moveTo(x, y); tegner = true; } else ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.restore();
    };

    /* Navnet paa en kurve ved den vandrette del */
    S.kurveNavn = function (ctx, g, stof, tekst, opt) {
        opt = opt || {};
        var syre = stof.slags === "syre";
        var x = syre ? g.x0 + 8 : g.x1 - 8, y = S.Y(g, stof.logP) + (opt.under ? 14 : -14);
        NK.tekst(ctx, tekst, x, y, { font: "800 13px " + FONT, farve: opt.farve || stof.farve, justering: syre ? "left" : "right", linje: "middle", kant: true, kantFarve: "#f4f8f8", kantBredde: 5 });
    };

    /* Den stiplede streg ved skyderens pH og prikken paa kurven */
    S.markoer = function (ctx, g, stof, ph, yBund, vis) {
        var x = S.X(g, ph);
        ctx.save();
        ctx.strokeStyle = "rgba(42, 51, 66, 0.55)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(x, g.y0); ctx.lineTo(x, yBund); ctx.stroke();
        ctx.restore();
        if (vis) S.prik(ctx, g, stof, ph);
    };

    /* Prikken paa kurven ved skyderens pH (en lille pil under aksen) */
    S.prik = function (ctx, g, stof, ph) {
        var x = S.X(g, ph), v = D.logD(stof, ph);
        ctx.save();
        if (v >= D.Y_MIN) {
            ctx.beginPath(); ctx.arc(x, S.Y(g, v), 6, 0, Math.PI * 2);
            ctx.fillStyle = stof.farve;
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            /* Under aksen: en lille pil nedad */
            ctx.fillStyle = stof.farve;
            ctx.beginPath(); ctx.moveTo(x - 6, g.y1 - 12); ctx.lineTo(x + 6, g.y1 - 12); ctx.lineTo(x, g.y1 - 2); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    };

    /* Et punkt med en tekst (som bogens "blod: −2,7") */
    S.punkt = function (ctx, g, ph, v, tekst) {
        var x = S.X(g, ph), y = S.Y(g, v);
        ctx.save();
        var gr = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 7);
        gr.addColorStop(0, "#7fd1c4");
        gr.addColorStop(1, F.prik);
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        var hoejre = x < (g.x0 + g.x1) / 2 + 40;
        NK.tekst(ctx, tekst, x + (hoejre ? 12 : -12), y + 1, { font: "800 13px " + FONT, farve: F.prik, justering: hoejre ? "left" : "right", linje: "middle", kant: true, kantFarve: "#f4f8f8", kantBredde: 5 });
    };

    /* Den stiplede streg ved pH = pKₛ */
    S.pks = function (ctx, g, pks) {
        var x = S.X(g, pks);
        ctx.save();
        ctx.strokeStyle = "rgba(42, 51, 66, 0.7)";
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(x, g.y0); ctx.lineTo(x, g.y1); ctx.stroke();
        ctx.restore();
        var t = "pH = pK_s = " + D.komma1(pks), b = T.formelBredde(ctx, t, 12.5, 700);
        ctx.save();
        ctx.fillStyle = "rgba(247, 251, 251, 0.92)";
        NK.rundtRekt(ctx, x + 3, g.y0 + 3, b + 8, 19, 4);
        ctx.fill();
        ctx.restore();
        T.formel(ctx, t, x + 7, g.y0 + 12, 12.5, "#3c4a49", "left", 700);
    };

    /* Trekanten, der viser, at log D falder 1 for hver pH-enhed */
    S.haeldning = function (ctx, g, stof, ph1) {
        var ph2 = ph1 + 1, x1 = S.X(g, ph1), x2 = S.X(g, ph2), y1 = S.Y(g, D.logD(stof, ph1)), y2 = S.Y(g, D.logD(stof, ph2));
        ctx.save();
        ctx.strokeStyle = "#2a3342";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "1 pH", (x1 + x2) / 2, y1 - 10, { font: "800 12px " + FONT, farve: "#2a3342", justering: "center", linje: "middle", kant: true, kantFarve: "#f4f8f8", kantBredde: 4 });
        NK.tekst(ctx, "−1", x2 + 6, (y1 + y2) / 2, { font: "800 13px " + FONT, farve: "#2a3342", justering: "left", linje: "middle", kant: true, kantFarve: "#f4f8f8", kantBredde: 4 });
    };

    NK.Scene = S;
}());

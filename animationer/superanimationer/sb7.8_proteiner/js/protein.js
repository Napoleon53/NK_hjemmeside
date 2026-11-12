/* =====================================================================
   protein.js - et lille protein som i bogens figurer (b7-proteinstruktur
   og b7-denaturering): en α-helix over et β-foldeblad med to strenge og
   fire bindinger mellem sidekaederne (b7-sidekaede-bindinger).

   Koordinaterne er i enheder omkring proteinets midte; view = { cx, cy, s }
   giver pixels. Kaeden er en liste af punkter i raekkefoelge fra N-enden:
   halen, spiralen, loekken, streng 1, vendingen, streng 2 og halen.

   tilst (det, tegningen skal vise):
     dy        spiralens forskydning i y (fane 2: foer den er foldet ned)
     d         0 foldet, 1 helt foldet ud (denatureret)
     svag      0-1: hvor meget der er tilbage af de svage bindinger
     ss        disulfidbroen er dannet
     aspQ      ladningen paa −COO⁻ / −COOH i asparaginsyre (−1 eller 0)
     lysQ      ladningen paa −NH₃⁺ / −NH₂ i lysin (+1 eller 0)
     ryst      amplituden af varmebevaegelsen (enheder)
     tid       tiden (til rystelsen)
     gul       den binding, kortet spoerger om (indeks), eller null
     nr        vis numrene ved bindingerne
     farve     "orange" for den anden kaede (kvaternaer struktur)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegning;
    var Pr = {};

    /* ----- Formen ----------------------------------------------------------------- */
    var G = {
        HX0: -3.6, HL: 7.2, NT: 8, HY: -1.7, HR: 0.48, AX: 0.42,   /* spiralen */
        S1Y: 0.42, S2Y: 1.32, SX: 3.6,                             /* strengene */
        ROER: 0.15, PIL: 0.27,
        DY0: -1.25                                                /* spiralen, foer den er foldet ned */
    };
    Pr.G = G;
    /* Bindingerne sidder under spiralens nederste punkter nr. 0, 2, 5 og 7 */
    var KX = [0, 2, 5, 7].map(function (k) { return G.HX0 + (k + 0.5) * G.HL / G.NT; });
    Pr.KX = KX;

    /* ----- Kaeden som punkter (foldet) ---------------------------------------------- */
    function bezier(p0, p1, p2, p3, n, type, ud, medFoerste) {
        for (var i = medFoerste ? 0 : 1; i <= n; i++) {
            var t = i / n, u = 1 - t;
            ud.push({ x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
                      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y, z: 0, type: type });
        }
    }

    var NH = 16 * G.NT;                    /* punkter i spiralen */
    var NSTRENG = 32;                      /* punkter i hver streng: bindingerne rammer et punkt praecist */
    function helixPunkt(t, dy) {
        var phi = 2 * Math.PI * G.NT * t;
        return { x: G.HX0 + G.HL * t - G.AX * Math.sin(phi), y: G.HY + dy - G.HR * Math.cos(phi), z: -Math.sin(phi), type: "helix", phi: phi };
    }

    /* Indeksene, hvor delene begynder (samme for alle dy) */
    var IDX = {};

    function foldet(dy) {
        var ud = [];
        var h0 = helixPunkt(0, dy), h1 = helixPunkt(1, dy);
        /* Halen ved N-enden */
        bezier({ x: -4.35, y: G.HY + dy - 0.95 }, { x: -4.1, y: G.HY + dy - 0.2 }, { x: h0.x - 0.6, y: h0.y - 0.35 }, h0, 8, "hale", ud, true);
        IDX.helix = ud.length - 1;
        for (var i = 1; i <= NH; i++) ud.push(helixPunkt(i / NH, dy));
        IDX.helixSlut = ud.length - 1;
        /* Loekken fra spiralen ned til streng 1 */
        var s1a = { x: G.SX, y: G.S1Y };
        bezier(h1, { x: h1.x + 0.9, y: h1.y - 0.2 }, { x: s1a.x + 1.0, y: s1a.y - 0.1 }, s1a, 14, "loekke", ud);
        IDX.s1 = ud.length - 1;
        var NS = NSTRENG;
        for (i = 1; i <= NS; i++) ud.push({ x: G.SX - 2 * G.SX * i / NS, y: G.S1Y, z: 0, type: "s1" });
        IDX.s1Slut = ud.length - 1;
        /* Vendingen til venstre */
        bezier({ x: -G.SX, y: G.S1Y }, { x: -G.SX - 0.7, y: G.S1Y }, { x: -G.SX - 0.7, y: G.S2Y }, { x: -G.SX, y: G.S2Y }, 10, "vending", ud);
        IDX.s2 = ud.length - 1;
        for (i = 1; i <= NS; i++) ud.push({ x: -G.SX + 2 * G.SX * i / NS, y: G.S2Y, z: 0, type: "s2" });
        IDX.s2Slut = ud.length - 1;
        /* Halen ved C-enden */
        bezier({ x: G.SX, y: G.S2Y }, { x: G.SX + 0.6, y: G.S2Y + 0.05 }, { x: G.SX + 0.75, y: G.S2Y + 0.6 }, { x: G.SX + 0.25, y: G.S2Y + 0.7 }, 8, "hale", ud);
        return ud;
    }
    var REF = foldet(0);
    Pr.N = REF.length;

    /* Hvor bindingernes sidekaeder sidder i kaeden */
    var ANKER = KX.map(function (x, j) {
        var k = [0, 2, 5, 7][j];
        var oppe = IDX.helix + Math.round((k + 0.5) / G.NT * NH);
        var nede = IDX.s1 + Math.round((G.SX - x) / (2 * G.SX) * NSTRENG);
        return { oppe: oppe, nede: nede };
    });
    Pr.ANKER = ANKER;

    /* ----- Den udfoldede kaede (denatureret) ----------------------------------------------
       Tre dele: fra N-enden til cystein i spiralen, en stor bue tilbage til
       cystein i streng 1 (disulfidbroen holder de to sammen), og resten. */
    function catmull(pts, n) {
        /* glat kurve gennem pts, n punkter jaevnt fordelt efter laengden */
        var fine = [];
        for (var i = 0; i < pts.length - 1; i++) {
            var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
            for (var j = 0; j < 20; j++) {
                var t = j / 20, t2 = t * t, t3 = t2 * t;
                fine.push({
                    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
                    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
                });
            }
        }
        fine.push(pts[pts.length - 1]);
        var l = [0];
        for (i = 1; i < fine.length; i++) l.push(l[i - 1] + Math.hypot(fine[i].x - fine[i - 1].x, fine[i].y - fine[i - 1].y));
        var ud = [], tot = l[l.length - 1], m = 0;
        for (i = 0; i < n; i++) {
            var s = n === 1 ? 0 : tot * i / (n - 1);
            while (m < l.length - 2 && l[m + 1] < s) m++;
            var f = (s - l[m]) / Math.max(1e-9, l[m + 1] - l[m]);
            ud.push({ x: fine[m].x + (fine[m + 1].x - fine[m].x) * f, y: fine[m].y + (fine[m + 1].y - fine[m].y) * f, z: 0 });
        }
        return ud;
    }

    var Q = { x: -2.6, y: -0.55 };
    var Q2 = { x: Q.x + REF[ANKER[0].nede].x - REF[ANKER[0].oppe].x, y: Q.y + REF[ANKER[0].nede].y - REF[ANKER[0].oppe].y };
    var DEL1 = [{ x: -4.3, y: -2.3 }, { x: -3.5, y: -1.75 }, { x: -4.2, y: -0.9 }, { x: -3.3, y: -0.2 }, Q];
    var DEL2 = [Q, { x: -1.9, y: -1.4 }, { x: -2.6, y: -2.25 }, { x: -1.3, y: -2.35 }, { x: -0.6, y: -1.3 }, { x: 0.3, y: -2.2 },
                { x: 1.4, y: -1.6 }, { x: 2.3, y: -2.35 }, { x: 3.6, y: -1.9 }, { x: 3.0, y: -0.9 }, { x: 4.3, y: -0.4 },
                { x: 4.0, y: 0.8 }, { x: 2.8, y: 0.2 }, { x: 1.9, y: 1.1 }, { x: 0.7, y: 0.1 }, { x: -0.4, y: 0.9 },
                { x: -1.4, y: -0.1 }, { x: -1.6, y: 1.0 }, Q2];
    var DEL3 = [Q2, { x: -3.6, y: 1.9 }, { x: -2.2, y: 2.1 }, { x: -0.8, y: 1.6 }, { x: 0.6, y: 2.1 }, { x: 2.0, y: 1.7 }, { x: 3.4, y: 2.15 }, { x: 4.4, y: 1.6 }];
    var COIL = (function () {
        var a = ANKER[0].oppe, b = ANKER[0].nede;
        var p1 = catmull(DEL1, a + 1), p2 = catmull(DEL2, b - a + 1), p3 = catmull(DEL3, Pr.N - b);
        return p1.concat(p2.slice(1), p3.slice(1));
    }());
    Pr.COIL = COIL;

    /* ----- Kaedens punkter ved en tilstand ------------------------------------------------- */
    function blod(t) { t = NK.klamp(t, 0, 1); return t * t * (3 - 2 * t); }

    Pr.punkter = function (tilst) {
        var dy = tilst.dy || 0, d = blod(tilst.d || 0), a = tilst.ryst || 0, tid = tilst.tid || 0;
        var F0 = dy ? foldet(dy) : REF;
        return F0.map(function (p, i) {
            var c = COIL[i];
            var x = p.x + (c.x - p.x) * d, y = p.y + (c.y - p.y) * d;
            if (a > 0) {
                x += a * (0.6 * Math.sin(tid * 7.1 + i * 0.23) + 0.4 * Math.sin(tid * 11.3 + i * 0.41));
                y += a * (0.6 * Math.sin(tid * 8.3 + i * 0.29 + 1.3) + 0.4 * Math.sin(tid * 12.7 + i * 0.17 + 2.1));
            }
            return { x: x, y: y, z: (p.z || 0) * (1 - d), type: p.type };
        });
    };

    function px(v, p) { return { x: v.cx + p.x * v.s, y: v.cy + p.y * v.s }; }
    Pr.px = px;

    /* ----- Sidekaederne som kugler ------------------------------------------------------------
       Hver gruppe tegnes fra sit ankerpunkt i kaeden. oppe: gruppen haenger
       ned fra spiralen; nede: den peger op fra streng 1. Lokale enheder. */
    var R = { C: 0.105, H: 0.07, O: 0.11, N: 0.11, S: 0.135 };
    Pr.R = R;

    function gruppe(id, op) {
        /* op = +1: nedad (oppe i spiralen), −1: opad (nede i strengen). Giver atomer og bindinger. */
        var A = [], B = [];
        function a(el, x, y, extra) { var o = { el: el, x: x, y: y * op }; if (extra) for (var k in extra) o[k] = extra[k]; A.push(o); return A.length - 1; }
        function b(i, j) { B.push([i, j]); }
        var c0 = a("C", 0, 0.24);
        b(-1, c0);
        if (id === "cys") {
            var s = a("S", 0, 0.62, { rolle: "S" });
            b(c0, s);
            var h = a("H", 0.16 * op, 0.82, { rolle: "SH" });
            b(s, h);
        } else if (id === "ser") {
            var o = a("O", -0.04 * op, 0.47, { rolle: "O" });
            b(c0, o);
            var ho = a("H", 0.1 * op, 0.6, { rolle: "HO" });
            b(o, ho);
            a("H", -0.2, 0.2); b(c0, A.length - 1);
        } else if (id === "lys") {
            var n = a("N", 0, 0.56, { rolle: "N" });
            b(c0, n);
            var h1 = a("H", -0.2, 0.68, { rolle: "NH" }), h2 = a("H", 0.2, 0.68, { rolle: "NH" }), h3 = a("H", 0.06, 0.79, { rolle: "NH3" });
            b(n, h1); b(n, h2); b(n, h3);
        } else if (id === "asp") {
            var cc = a("C", 0, 0.5);
            b(c0, cc);
            var o1 = a("O", -0.2, 0.68, { rolle: "O1" }), o2 = a("O", 0.2, 0.68, { rolle: "O2" });
            b(cc, o1); b(cc, o2);
            var hh = a("H", 0.34, 0.82, { rolle: "COOH" });
            b(o2, hh);
        } else if (id === "val") {
            var m1 = a("C", -0.24, 0.5), m2 = a("C", 0.24, 0.5);
            b(c0, m1); b(c0, m2);
            [[-0.38, 0.62], [-0.18, 0.7], [-0.36, 0.38], [0.38, 0.62], [0.18, 0.7], [0.36, 0.38]].forEach(function (q, j) {
                a("H", q[0], q[1]); b(j < 3 ? m1 : m2, A.length - 1);
            });
        } else if (id === "ala") {
            [[-0.17, 0.36], [0.17, 0.36], [0, 0.46]].forEach(function (q) { a("H", q[0], q[1]); b(c0, A.length - 1); });
        }
        return { atomer: A, bindinger: B };
    }
    var GRUPPER = {};
    D.KONTAKTER.forEach(function (k) {
        GRUPPER[k.oppe + "+"] = GRUPPER[k.oppe + "+"] || gruppe(k.oppe, 1);
        GRUPPER[k.nede + "-"] = GRUPPER[k.nede + "-"] || gruppe(k.nede, -1);
    });

    /* Tegner en gruppe ved ankeret (pixels). skjul(atom) siger, om et atom er vaek. */
    function tegnGruppe(ctx, g, anker, s, skjul) {
        var P = g.atomer.map(function (at) { return { x: anker.x + at.x * s, y: anker.y + at.y * s }; });
        g.bindinger.forEach(function (bb) {
            var a = bb[0] < 0 ? anker : P[bb[0]], b = P[bb[1]];
            if (bb[0] >= 0 && skjul && skjul(g.atomer[bb[0]])) return;
            if (skjul && skjul(g.atomer[bb[1]])) return;
            T.pind(ctx, a, b, R.C * s);
        });
        /* Bagerst foerst: H, saa de store atomer */
        g.atomer.forEach(function (at, i) { if (at.el === "H" && !(skjul && skjul(at))) T.atom(ctx, P[i].x, P[i].y, R.H * s, "H"); });
        g.atomer.forEach(function (at, i) { if (at.el !== "H" && !(skjul && skjul(at))) T.atom(ctx, P[i].x, P[i].y, R[at.el] * s, at.el); });
        return P;
    }

    /* ----- Hele proteinet ------------------------------------------------------------------- */
    Pr.tegn = function (ctx, tilst, v) {
        var s = v.s, d = blod(tilst.d || 0), svag = tilst.svag === undefined ? 1 : tilst.svag;
        var pkt = Pr.punkter(tilst);
        var P = pkt.map(function (p) { return px(v, p); });
        var orange = tilst.farve === "orange";
        var farver = orange ? { moerk: "#9a3412", farve: "#ea7a2e", lys: "#fbc79a" } : {};
        var pilFarver = orange ? { moerk: "#9a3412", farve: "#f0a066", lys: "#fde0c4" } : {};
        var b = G.ROER * s;
        var strengA = NK.klamp(1 - d * 3, 0, 1);

        /* Bagerste del af spiralen foerst, lysere */
        var lob = [];
        function kor(liste, alfa, opt2) { if (liste.length > 1) T.roer(ctx, liste, b, Object.assign({ alfa: alfa }, opt2)); }
        for (var i = 0; i < pkt.length; i++) {
            if (pkt[i].z < -0.05) { if (!lob.length && i > 0) lob.push(P[i - 1]); lob.push(P[i]); }
            else { if (lob.length) { lob.push(P[i]); kor(lob, 1, orange ? { moerk: "#b45a24", farve: "#f2a46c", lys: "#fde0c4" } : { moerk: "#2f7d74", farve: "#6cc0b2", lys: "#c6ece5" }); } lob = []; }
        }
        kor(lob, 1, orange ? { moerk: "#b45a24", farve: "#f2a46c", lys: "#fde0c4" } : { moerk: "#2f7d74", farve: "#6cc0b2", lys: "#c6ece5" });

        /* Strengene som pile, saa laenge proteinet er foldet */
        if (strengA > 0.01) {
            T.strengPil(ctx, px(v, { x: G.SX, y: pkt[IDX.s1].y }), px(v, { x: -G.SX - 0.05, y: pkt[IDX.s1].y }), G.PIL * s, Object.assign({ alfa: strengA }, pilFarver));
            T.strengPil(ctx, px(v, { x: -G.SX, y: pkt[IDX.s2].y }), px(v, { x: G.SX + 0.05, y: pkt[IDX.s2].y }), G.PIL * s, Object.assign({ alfa: strengA }, pilFarver));
            /* Hydrogenbindingerne mellem strengene */
            if (svag > 0.01 && !tilst.udenBladH) {
                [-2.4, -0.8, 0.8, 2.4].forEach(function (x) {
                    var a = px(v, { x: x, y: G.S1Y + G.PIL * 0.62 }), c = px(v, { x: x, y: G.S2Y - G.PIL * 0.62 });
                    T.hprikker(ctx, a, c, { r: Math.max(1.6, s * 0.028), alfa: strengA * svag });
                });
            }
        }
        /* Forreste del af kaeden: alt andet end strengene (dem tegnes ogsaa,
           naar pilene toner ud) */
        var run = [], runType = null;
        function slutRun() {
            if (run.length > 1) {
                var alfa = (runType === "s1" || runType === "s2") ? 1 - strengA : 1;
                if (alfa > 0.01) T.roer(ctx, run, b, Object.assign({ alfa: alfa }, farver));
            }
            run = [];
        }
        for (i = 0; i < pkt.length; i++) {
            var front = pkt[i].z >= -0.05;
            var ty = (pkt[i].type === "s1" || pkt[i].type === "s2") ? pkt[i].type : "x";
            if (!front || ty !== runType) {
                if (front && run.length) run.push(P[i]);
                slutRun();
                runType = ty;
            }
            if (front) run.push(P[i]);
        }
        slutRun();

        /* Sidekaederne og bindingerne */
        var kasser = [];
        if (!tilst.udenSider) {
            D.KONTAKTER.forEach(function (k, j) {
                var aO = P[ANKER[j].oppe], aN = P[ANKER[j].nede];
                var tilA = aO;
                var gO = GRUPPER[k.oppe + "+"], gN = GRUPPER[k.nede + "-"];
                var dannet = (tilst.dannet ? tilst.dannet[j] : 1) * svag;
                var gul = tilst.gul === j;
                /* Det gule felt om den binding, kortet spoerger om */
                var x0 = Math.min(aO.x, aN.x) - 0.42 * s, x1 = Math.max(aO.x, aN.x) + 0.42 * s;
                var y0 = Math.min(aO.y, aN.y) + 0.12 * s, y1 = Math.max(aO.y, aN.y) - 0.12 * s;
                var kasse = { x: x0, y: y0, w: x1 - x0, h: Math.max(10, y1 - y0), cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, j: j };
                kasser.push(kasse);
                if (gul) T.gulRamme(ctx, kasse.x, kasse.y, kasse.w, kasse.h, 10);
                else if (tilst.valgt && tilst.valgt[j]) T.valgRamme(ctx, { x: kasse.x + 6, y: kasse.y + 6, w: kasse.w - 12, h: kasse.h - 12 }, tilst.valgt[j] === "forkert" ? T.FORKERT : T.VALG, true);
                /* Gloeder og skyer bag kuglerne */
                var nO = { x: aO.x, y: aO.y + 0.56 * s }, oN = { x: aN.x, y: aN.y - 0.62 * s };
                if (k.id === "ion") {
                    var lq = tilst.lysQ === undefined ? 1 : tilst.lysQ, aq = tilst.aspQ === undefined ? -1 : tilst.aspQ;
                    T.gloed(ctx, nO.x, nO.y, 0.42 * s, lq, 1);
                    T.gloed(ctx, oN.x, oN.y, 0.45 * s, aq, 1);
                }
                if (k.id === "london" && dannet > 0.01) {
                    T.sky(ctx, (aO.x + aN.x) / 2, (aO.y + aN.y) / 2, 0.62 * s, 0.75 * s, dannet);
                }
                tegnGruppe(ctx, gO, tilA, s, function (at) {
                    if (at.rolle === "SH") return !!tilst.ss;
                    if (at.rolle === "NH3") return (tilst.lysQ === undefined ? 1 : tilst.lysQ) === 0;
                    return false;
                });
                tegnGruppe(ctx, gN, aN, s, function (at) {
                    if (at.rolle === "SH") return !!tilst.ss;
                    if (at.rolle === "COOH") return (tilst.aspQ === undefined ? -1 : tilst.aspQ) !== 0;
                    return false;
                });
                /* Selve bindingen */
                if (k.id === "ss" && tilst.ss) {
                    var sO = { x: aO.x, y: aO.y + 0.62 * s }, sN = { x: aN.x, y: aN.y - 0.62 * s };
                    T.pind(ctx, sO, sN, R.S * s);
                    T.atom(ctx, sO.x, sO.y, R.S * s, "S");
                    T.atom(ctx, sN.x, sN.y, R.S * s, "S");
                }
                if (k.id === "hbind" && dannet > 0.01) {
                    var hO = { x: aO.x + 0.1 * s, y: aO.y + 0.6 * s }, oO = { x: aN.x + 0.04 * s, y: aN.y - 0.47 * s };
                    var dxh = oO.x - hO.x, dyh = oO.y - hO.y, lh = Math.hypot(dxh, dyh);
                    if (lh > R.H * s + R.O * s + 2) {
                        T.hprikker(ctx, { x: hO.x + dxh / lh * R.H * s * 1.3, y: hO.y + dyh / lh * R.H * s * 1.3 },
                            { x: oO.x - dxh / lh * R.O * s * 1.2, y: oO.y - dyh / lh * R.O * s * 1.2 }, { r: Math.max(1.5, s * 0.026), alfa: dannet });
                    }
                }
                if (k.id === "ion") {
                    var lq2 = tilst.lysQ === undefined ? 1 : tilst.lysQ, aq2 = tilst.aspQ === undefined ? -1 : tilst.aspQ;
                    var fsQ = Math.max(13, 0.3 * s);
                    if (lq2) T.tegnLadning(ctx, nO.x + 0.36 * s, nO.y - 0.08 * s, lq2, fsQ);
                    if (aq2) T.tegnLadning(ctx, oN.x + 0.42 * s, oN.y + 0.06 * s, aq2, fsQ);
                }
                if (tilst.nr) {
                    var nx = kasse.x + 4, ny = kasse.cy;
                    ctx.save();
                    ctx.beginPath(); ctx.arc(nx, ny, 9, 0, Math.PI * 2);
                    ctx.fillStyle = gul ? "#f2c53d" : "#ffffff";
                    ctx.fill();
                    ctx.strokeStyle = gul ? "#b8901a" : "#8a8270";
                    ctx.lineWidth = 1.4;
                    ctx.stroke();
                    ctx.restore();
                    NK.tekst(ctx, String(j + 1), nx, ny + 1, { font: "800 12px " + T.FONT, farve: "#3a2c00", justering: "center", linje: "middle" });
                }
            });
        }
        return { P: P, kasser: kasser };
    };

    /* Spiralens kasse i pixels (til traekket i fane 2) */
    Pr.helixKasse = function (dy, v) {
        var a = px(v, { x: G.HX0 - 0.6, y: G.HY + dy - G.HR - 0.25 }), b = px(v, { x: G.HX0 + G.HL + 0.5, y: G.HY + dy + G.HR + 0.2 });
        return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    };

    /* Proteinets omrids i enheder (til layoutet) */
    Pr.omrids = function (dy) {
        return { x0: -4.5, x1: 4.75, y0: G.HY + Math.min(0, dy || 0) - 1.05, y1: G.S2Y + 0.85 };
    };

    /* Hvor ionbindingens grupper er (til hydronen i fane 3) */
    Pr.ionPunkter = function (tilst, v) {
        var pkt = Pr.punkter(tilst), j = 1;
        var aO = px(v, pkt[ANKER[j].oppe]), aN = px(v, pkt[ANKER[j].nede]);
        return { lys: { x: aO.x, y: aO.y + 0.56 * v.s }, asp: { x: aN.x + 0.2 * v.s, y: aN.y - 0.68 * v.s } };
    };

    /* ----- En stor α-helix (fane 2, trin 2): fra lige kaede (w = 0) til snoet (w = 1) ------ */
    /* Spiralen bliver kortere i begge ender, saa den bliver staaende midt paa tavlen */
    Pr.SPIRAL_KORT = 0.45;
    Pr.spiral = function (x0, yc, laengde, w, nt) {
        var A = laengde * (1 - Pr.SPIRAL_KORT * w), r = laengde * 0.068 * Math.sin(w * Math.PI / 2), ax = r * 0.72;
        var xs = x0 + laengde * Pr.SPIRAL_KORT * w / 2;
        var ud = [], n = nt * 24;
        for (var i = 0; i <= n; i++) {
            var t = i / n, phi = 2 * Math.PI * nt * t;
            ud.push({ x: xs + A * t - ax * Math.sin(phi), y: yc - r * Math.cos(phi), z: -Math.sin(phi), phi: phi });
        }
        return { pkt: ud, A: A, r: r, ax: ax, x0: xs };
    };

    NK.Protein = Pr;
}());

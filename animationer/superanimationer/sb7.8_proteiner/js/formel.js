/* =====================================================================
   formel.js - strukturformler i bogens stil (b7-peptidbinding,
   b7-peptidkaede og b7-hbinding-kaeder)

   Et molekyle er { atomer: [...], bindinger: [...] } med koordinater i
   bindingslaengder (L = 1). Kaeden er en zigzag som i bogen: carbonatomer
   uden bogstav i hjoernerne, og grupperne skrevet som H₂N, OH og SH.
   I kliktrinnene kan H-atomerne staa hver for sig.

   F.tekst(ctx, s, x, y, fs, farve, just)   tekst med saenkede tal: "H_2N"
   F.kaede(rester, opt)       en peptidkaede (eller én aminosyre)
   F.strenge()                to stykker kaede side om side (fane 2)
   F.tegn(ctx, mol, pos, fs, opt)  tegner molekylet; pos(atom) giver
                              atomets plads i pixels
   F.atomVed / F.bindingVed   hvad musen peger paa
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = {};
    var FONT = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    F.FONT = FONT;
    var C30 = Math.cos(Math.PI / 6);          /* 0,866: zigzaggens skridt i x */

    function skrift(fs, vaegt) { return (vaegt || 700) + " " + fs + "px " + FONT; }

    /* "H_2N" -> [{t:"H"}, {t:"2", sub}, {t:"N"}] */
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

    function maal(ctx, d, fs) {
        var b = 0;
        d.forEach(function (x) {
            ctx.font = skrift(x.sub || x.sup ? fs * 0.68 : fs);
            x.w = ctx.measureText(x.t).width;
            x.x = b;
            b += x.w;
        });
        return b;
    }

    /* Tekst med saenkede tal. anker: indekset paa det tegn, der skal staa
       midt over x (ellers styrer just). Giver kassen. */
    F.tekst = function (ctx, s, x, y, fs, farve, just, anker) {
        var d = dele(s);
        ctx.save();
        var b = maal(ctx, d, fs), x0;
        if (anker !== undefined && anker !== null && d[anker]) x0 = x - d[anker].x - d[anker].w / 2;
        else x0 = just === "right" ? x - b : (just === "center" ? x - b / 2 : x);
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = farve;
        d.forEach(function (del) {
            ctx.font = skrift(del.sub || del.sup ? fs * 0.68 : fs);
            var dy = del.sub ? fs * 0.3 : (del.sup ? -fs * 0.38 : 0);
            ctx.fillText(del.t, x0 + del.x, y + dy + fs * 0.04);
        });
        ctx.restore();
        return { x: x0, y: y - fs * 0.62, w: b, h: fs * 1.24, cx: x0 + b / 2, cy: y };
    };

    F.bredde = function (ctx, s, fs) {
        ctx.save();
        var b = maal(ctx, dele(s), fs);
        ctx.restore();
        return b;
    };

    /* Det tegn i etiketten, der staar paa atomets plads (N i H₂N, O i OH og HO) */
    function ankerIndeks(lab, el) {
        var d = dele(lab);
        for (var i = 0; i < d.length; i++) if (d[i].t === el) return i;
        return 0;
    }

    /* =====================================================================
       En peptidkaede som zigzag. rester er en liste af id'er (ala, gly,
       ser, cys). opt:
         eksplicit   H-atomerne i aminogruppen og OH-gruppen staar hver for sig
         paritet     0: kaedens foerste N staar i et oevre hjoerne, 1: nedre
         start       hvilket hjoerne kaeden begynder i (forskyder x)
         aabenN, aabenC  kaeden fortsaetter (stiplet streg i stedet for
                     endegruppen)
       Atomernes id: r0N, r0Ca, r0C, r0O (=O), r1H (H paa N), r0Ha og r0Hb
       (H i aminogruppen), r1OH og r1HO (OH-gruppen og dens H), r0S1, r0S2
       (sidekaeden). rest og rolle siger, hvad atomet er.
       ===================================================================== */
    F.kaede = function (rester, opt) {
        opt = opt || {};
        var par = opt.paritet || 0, k0 = opt.start || 0;
        var mol = { atomer: [], bindinger: [], rester: rester.slice(), ind: {} };
        function hj(k) { return { x: (k0 + k) * C30, y: ((k + par) % 2 === 0) ? 0 : 0.5 }; }
        function op(k) { return ((k + par) % 2 === 0) ? -1 : 1; }        /* vaek fra zigzaggen: op (−1) i et oevre hjoerne */
        function atom(id, el, p, lab, extra) {
            var a = { id: id, el: el, x: p.x, y: p.y, lab: lab === undefined ? el : lab };
            a.vis = a.lab !== "";
            if (a.vis) a.anker = ankerIndeks(a.lab, el);
            if (extra) for (var k in extra) a[k] = extra[k];
            mol.atomer.push(a);
            mol.ind[id] = a;
            return a;
        }
        function bind(a, b, orden, extra) {
            var bb = { id: a + "-" + b, a: a, b: b, orden: orden || 1 };
            if (extra) for (var k in extra) bb[k] = extra[k];
            mol.bindinger.push(bb);
            return bb;
        }
        var n = rester.length;
        rester.forEach(function (rid, i) {
            var kN = 3 * i, kA = kN + 1, kC = kN + 2;
            var pN = hj(kN), pA = hj(kA), pC = hj(kC);
            var forste = i === 0, sidste = i === n - 1;
            /* Nitrogenatomet */
            if (forste && !opt.aabenN) {
                if (opt.eksplicit) {
                    atom("r0N", "N", pN, "N", { rest: 0, rolle: "aminoN" });
                    var dA = { x: pA.x - pN.x, y: pA.y - pN.y };
                    /* de to andre retninger, 120 grader fra bindingen til Cα */
                    var v1 = rot(dA, 2 * Math.PI / 3), v2 = rot(dA, -2 * Math.PI / 3);
                    atom("r0Ha", "H", { x: pN.x + v1.x * 0.66, y: pN.y + v1.y * 0.66 }, "H", { rest: 0, rolle: "aminoH" });
                    atom("r0Hb", "H", { x: pN.x + v2.x * 0.66, y: pN.y + v2.y * 0.66 }, "H", { rest: 0, rolle: "aminoH" });
                    bind("r0N", "r0Ha"); bind("r0N", "r0Hb");
                } else {
                    atom("r0N", "N", pN, "H_2N", { rest: 0, rolle: "aminoN" });
                }
            } else {
                atom("r" + i + "N", "N", pN, "N", { rest: i, rolle: "peptidN" });
                atom("r" + i + "H", "H", { x: pN.x, y: pN.y + op(kN) * 0.62 }, "H", { rest: i, rolle: "peptidH" });
                bind("r" + i + "N", "r" + i + "H");
                if (forste) atom("r0Nx", "X", { x: pN.x - C30, y: hj(kN - 1).y }, "", { rest: 0, rolle: "aaben" });
            }
            /* Cα og sidekaeden */
            atom("r" + i + "Ca", "C", pA, "", { rest: i, rolle: "Ca" });
            bind("r" + i + "N", "r" + i + "Ca");
            if (forste && opt.aabenN) bind("r0Nx", "r0N", 1, { stiplet: true });
            sidekaede(rid, i, pA, op(kA));
            /* Carbonylgruppen */
            atom("r" + i + "C", "C", pC, "", { rest: i, rolle: "C" });
            bind("r" + i + "Ca", "r" + i + "C");
            atom("r" + i + "O", "O", { x: pC.x, y: pC.y + op(kC) * 1.0 }, "O", { rest: i, rolle: "dobbeltO" });
            bind("r" + i + "C", "r" + i + "O", 2);
            if (!sidste) {
                bind("r" + i + "C", "r" + (i + 1) + "N", 1, { peptid: true });
            } else if (opt.aabenC) {
                atom("r" + i + "Cx", "X", hj(kC + 1), "", { rest: i, rolle: "aaben" });
                bind("r" + i + "C", "r" + i + "Cx", 1, { stiplet: true });
            } else {
                var pO = hj(kC + 1);
                if (opt.eksplicit) {
                    atom("r" + i + "OH", "O", pO, "O", { rest: i, rolle: "hydroxylO" });
                    var vH = { x: C30, y: op(kC + 1) === -1 ? 0.5 : -0.5 };
                    atom("r" + i + "HO", "H", { x: pO.x + vH.x * 0.66, y: pO.y + vH.y * 0.66 }, "H", { rest: i, rolle: "hydroxylH" });
                    bind("r" + i + "OH", "r" + i + "HO");
                } else {
                    atom("r" + i + "OH", "O", pO, "OH", { rest: i, rolle: "hydroxylO" });
                }
                bind("r" + i + "C", "r" + i + "OH");
            }
        });
        /* Bindingerne til de naeste N kommer foerst nu, hvor atomerne findes */
        mol.bindinger.forEach(function (b) { if (!mol.ind[b.b] || !mol.ind[b.a]) b.mangler = true; });
        mol.bindinger = mol.bindinger.filter(function (b) { return !b.mangler; });

        function sidekaede(rid, i, pA, retn) {
            var p1 = { x: pA.x, y: pA.y + retn * 1.0 };
            if (rid === "gly") return;
            if (rid === "ala") {
                atom("r" + i + "S1", "C", p1, "", { rest: i, rolle: "R" });
                bind("r" + i + "Ca", "r" + i + "S1");
                return;
            }
            if (rid === "ser" || rid === "cys") {
                atom("r" + i + "S1", "C", p1, "", { rest: i, rolle: "R" });
                bind("r" + i + "Ca", "r" + i + "S1");
                var p2 = { x: p1.x + C30, y: p1.y + retn * 0.5 };
                atom("r" + i + "S2", rid === "ser" ? "O" : "S", p2, rid === "ser" ? "OH" : "SH", { rest: i, rolle: "R" });
                bind("r" + i + "S1", "r" + i + "S2");
            }
        }
        return mol;
    };

    function rot(v, a) {
        var c = Math.cos(a), s = Math.sin(a);
        return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
    }

    /* Molekylets kasse i bindingslaengder (bogstaverne regnes med lidt luft) */
    F.kasse = function (mol, ekstra) {
        var e = ekstra === undefined ? 0.45 : ekstra;
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        mol.atomer.forEach(function (a) {
            var bx = a.vis && a.lab.length > 1 ? 0.35 * a.lab.replace(/[_^]/g, "").length : 0;
            x0 = Math.min(x0, a.x - e - (a.lab.charAt(0) !== a.el ? bx : 0));
            x1 = Math.max(x1, a.x + e + (a.lab.charAt(0) === a.el ? bx : 0));
            y0 = Math.min(y0, a.y - e);
            y1 = Math.max(y1, a.y + e);
        });
        return { x: x0, y: y0, b: x1 - x0, h: y1 - y0 };
    };

    /* =====================================================================
       To stykker kaede side om side som i bogens b7-hbinding-kaeder.
       Kaede 0 oeverst: N C C N C C N C C (H og O peger ned, R op).
       Kaede 1 nederst: C C N C C N C C N (O og H peger op, R ned).
       Atomerne har koordinater i bindingslaengder; de to kaeder er 2,3 fra
       hinanden. par: de seks par (H og O lige over for hinanden).
       ===================================================================== */
    F.strenge = function () {
        var mol = { atomer: [], bindinger: [], ind: {}, par: [] };
        var OVER = ["N", "C", "C", "N", "C", "C", "N", "C", "C"];
        var UNDER = ["C", "C", "N", "C", "C", "N", "C", "C", "N"];
        var AFST = 2.3;
        function atom(id, el, x, y, lab, extra) {
            var a = { id: id, el: el, x: x, y: y, lab: lab, vis: true, anker: 0 };
            if (extra) for (var k in extra) a[k] = extra[k];
            mol.atomer.push(a);
            mol.ind[id] = a;
            return a;
        }
        function bind(a, b, orden, extra) {
            var bb = { id: a + "-" + b, a: a, b: b, orden: orden || 1 };
            if (extra) for (var k in extra) bb[k] = extra[k];
            mol.bindinger.push(bb);
        }
        [OVER, UNDER].forEach(function (raekke, s) {
            var y = s === 0 ? 0 : AFST, ud = s === 0 ? 1 : -1;      /* ud: retningen mod den anden kaede */
            raekke.forEach(function (el, i) {
                var id = "k" + s + "a" + i;
                atom(id, el, i, y, el, { kaede: s, rolle: "ryg" });
                if (i > 0) bind("k" + s + "a" + (i - 1), id);
                /* Hvad sidder paa atomet? N har H mod den anden kaede,
                   Cα har R vaek fra den anden kaede, og carbonylgruppens
                   C har =O mod den anden kaede. */
                if (el === "N") {
                    atom("k" + s + "h" + i, "H", i, y + ud * 0.62, "H", { kaede: s, rolle: "H", farve: D.FARVE.H });
                    bind(id, "k" + s + "h" + i);
                } else if (erCaPos(s, i)) {
                    atom("k" + s + "r" + i, "R", i, y - ud * 0.62, "R", { kaede: s, rolle: "R", farve: D.FARVE.orange });
                    bind(id, "k" + s + "r" + i);
                } else {
                    atom("k" + s + "o" + i, "O", i, y + ud * 0.62, "O", { kaede: s, rolle: "O", farve: D.FARVE.O });
                    bind(id, "k" + s + "o" + i, 2);
                }
            });
            /* Stiplede ender: kaeden fortsaetter */
            atom("k" + s + "v", "X", -0.75, y, "", { kaede: s, rolle: "aaben", vis: false });
            atom("k" + s + "h", "X", raekke.length - 1 + 0.75, y, "", { kaede: s, rolle: "aaben", vis: false });
            bind("k" + s + "v", "k" + s + "a0", 1, { stiplet: true });
            bind("k" + s + "a" + (raekke.length - 1), "k" + s + "h", 1, { stiplet: true });
        });
        /* Cα er det andet atom i hver gruppe paa tre: i kaede 0 er rækkefølgen
           N, Cα, C=O; i kaede 1 er den C=O, Cα, N. */
        function erCaPos(s, i) { return s === 0 ? i % 3 === 1 : i % 3 === 1; }
        /* Parrene: H og O lige over for hinanden */
        for (var i = 0; i < OVER.length; i++) {
            var a = mol.ind["k0h" + i] || mol.ind["k0o" + i], b = mol.ind["k1h" + i] || mol.ind["k1o" + i];
            if (a && b && a.el !== b.el) mol.par.push(a.el === "H" ? [a.id, b.id] : [b.id, a.id]);
        }
        mol.afst = AFST;
        return mol;
    };

    /* =====================================================================
       Tegningen. pos(atom) -> { x, y } i pixels. opt:
         farve(atom)      atomets farve (ellers blæk)
         alfa(atom)       0-1
         bindFarve(b)     bindingens farve
         bindAlfa(b)      0-1
         bredde           stregbredden
       Atomer med alfa 0 og bindinger til dem tegnes ikke.
       ===================================================================== */
    F.tegn = function (ctx, mol, pos, fs, opt) {
        opt = opt || {};
        var bl = opt.bredde || Math.max(1.6, fs * 0.11);
        var P = {};
        mol.atomer.forEach(function (a) { P[a.id] = pos(a); });
        function alfa(a) { return opt.alfa ? opt.alfa(a) : 1; }
        function gab(a) {
            if (!a.vis) return 0;
            return fs * (a.el === "H" ? 0.42 : 0.5);
        }
        mol.bindinger.forEach(function (b) {
            var A = mol.ind[b.a], B = mol.ind[b.b];
            if (!A || !B) return;
            var aA = Math.min(alfa(A), alfa(B)) * (opt.bindAlfa ? opt.bindAlfa(b) : 1);
            if (aA < 0.01) return;
            var p = P[b.a], q = P[b.b];
            var dx = q.x - p.x, dy = q.y - p.y, l = Math.sqrt(dx * dx + dy * dy);
            if (l < 1) return;
            var ux = dx / l, uy = dy / l;
            var g1 = gab(A), g2 = gab(B);
            if (g1 + g2 > l - 2) return;
            var x1 = p.x + ux * g1, y1 = p.y + uy * g1, x2 = q.x - ux * g2, y2 = q.y - uy * g2;
            ctx.save();
            ctx.globalAlpha *= aA;
            ctx.strokeStyle = (opt.bindFarve && opt.bindFarve(b)) || D.FARVE.blaek;
            ctx.lineWidth = bl;
            ctx.lineCap = "round";
            if (b.stiplet) ctx.setLineDash([bl * 2.2, bl * 2.2]);
            if (b.orden === 2) {
                var ox = -uy * fs * 0.13, oy = ux * fs * 0.13;
                ctx.beginPath(); ctx.moveTo(x1 + ox, y1 + oy); ctx.lineTo(x2 + ox, y2 + oy); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x1 - ox, y1 - oy); ctx.lineTo(x2 - ox, y2 - oy); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            }
            ctx.restore();
        });
        mol.atomer.forEach(function (a) {
            if (!a.vis) return;
            var aA = alfa(a);
            if (aA < 0.01) return;
            var p = P[a.id];
            ctx.save();
            ctx.globalAlpha *= aA;
            F.tekst(ctx, a.lab, p.x, p.y, fs, (opt.farve && opt.farve(a)) || a.farve || D.FARVE.blaek, null, a.anker);
            ctx.restore();
        });
        return P;
    };

    /* Det atom (blandt dem, filter godtager), der er naermest pt inden for r */
    F.atomVed = function (mol, P, pt, r, filter) {
        var bedst = null, bd = r * r;
        mol.atomer.forEach(function (a) {
            if (!a.vis || (filter && !filter(a))) return;
            var p = P[a.id];
            if (!p) return;
            var d = (p.x - pt.x) * (p.x - pt.x) + (p.y - pt.y) * (p.y - pt.y);
            if (d < bd) { bd = d; bedst = a; }
        });
        return bedst;
    };

    /* Den binding, der er naermest pt inden for tol (afstand til stykket) */
    F.bindingVed = function (mol, P, pt, tol, filter) {
        var bedst = null, bd = tol;
        mol.bindinger.forEach(function (b) {
            if (b.stiplet || (filter && !filter(b))) return;
            var p = P[b.a], q = P[b.b];
            if (!p || !q) return;
            var d = afstandTilStykke(pt, p, q);
            if (d < bd) { bd = d; bedst = b; }
        });
        return bedst;
    };

    function afstandTilStykke(pt, p, q) {
        var dx = q.x - p.x, dy = q.y - p.y, l2 = dx * dx + dy * dy;
        var t = l2 ? NK.klamp(((pt.x - p.x) * dx + (pt.y - p.y) * dy) / l2, 0.12, 0.88) : 0;
        var x = p.x + dx * t, y = p.y + dy * t;
        return Math.sqrt((pt.x - x) * (pt.x - x) + (pt.y - y) * (pt.y - y));
    }
    F.afstandTilStykke = afstandTilStykke;

    F.C30 = C30;
    NK.Formel = F;
}());

/* =====================================================================
   molekyle.js - molekylerne som zigzagformler

   Et molekyle er atomer med koordinater (i bindingslaengder) og bindinger
   med orden 1 eller 2. C-atomer har ingen etiket, som i bogen. Mappen
   har sin egen lille tegning i stedet for molekylemotoren, fordi flere
   af molekylerne har to ringe eller sammensatte ringe (indigo, Allura
   rød), og fordi eleven skal kunne klikke paa de enkelte dobbeltbindinger.

   NK.Mol.konjugering(mol) finder de konjugerede systemer: to
   dobbeltbindinger er konjugerede, naar en enkeltbinding forbinder et
   atom i den ene med et atom i den anden. Et system er alle de
   dobbeltbindinger, der haenger sammen paa den maade. Det stoerste system
   er chromoforen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var GRAD = Math.PI / 180;

    /* ----- Molekylet ------------------------------------------------------ */
    function Mol() {
        this.atomer = [];
        this.bindinger = [];
    }

    Mol.prototype.atom = function (x, y, lbl, opt) {
        var a = { x: x, y: y, lbl: lbl || "" };
        if (opt) for (var k in opt) a[k] = opt[k];
        this.atomer.push(a);
        return this.atomer.length - 1;
    };

    /* c: midten af den ring, bindingen sidder i (den indre streg vender derind) */
    Mol.prototype.bind = function (a, b, o, c) {
        this.bindinger.push({ a: a, b: b, o: o || 1, c: c || null });
        return this.bindinger.length - 1;
    };

    /* Et nyt atom én bindingslaengde fra atomet fra i retningen v (grader,
       0 er mod hoejre, 90 er nedad) */
    Mol.prototype.gaa = function (fra, v, o, lbl, opt) {
        var A = this.atomer[fra];
        var i = this.atom(A.x + Math.cos(v * GRAD), A.y + Math.sin(v * GRAD), lbl, opt);
        this.bind(fra, i, o);
        return i;
    };

    /* En zigzagkaede: bindingerne skiftevis i retningen vA og vB */
    Mol.prototype.kaede = function (fra, vA, vB, ordner) {
        var ud = [], cur = fra;
        for (var k = 0; k < ordner.length; k++) {
            cur = this.gaa(cur, k % 2 === 0 ? vA : vB, ordner[k]);
            ud.push(cur);
        }
        return ud;
    };

    Mol.prototype.naboer = function (i) {
        var ud = [];
        this.bindinger.forEach(function (b) {
            if (b.a === i) ud.push(b.b);
            else if (b.b === i) ud.push(b.a);
        });
        return ud;
    };

    /* Retningen (grader) ud fra atomet, hvor der er mest plads */
    Mol.prototype.udad = function (i) {
        var A = this.atomer[i], mig = this;
        var vinkler = this.naboer(i).map(function (j) {
            var B = mig.atomer[j];
            return Math.atan2(B.y - A.y, B.x - A.x) / GRAD;
        });
        if (!vinkler.length) return -90;
        if (vinkler.length === 1) return vinkler[0] + 180;
        var bedst = 0, bedstAfst = -1;
        for (var v = 0; v < 360; v += 5) {
            var mindst = 999;
            vinkler.forEach(function (w) {
                var d = Math.abs(((v - w) % 360 + 540) % 360 - 180);
                if (d < mindst) mindst = d;
            });
            if (mindst > bedstAfst + 0.01) { bedstAfst = mindst; bedst = v; }
        }
        return bedst;
    };

    /* En sidegruppe (methyl uden etiket, eller en etiket som "OH") */
    Mol.prototype.side = function (i, lbl, drej, o) {
        return this.gaa(i, this.udad(i) + (drej || 0), o || 1, lbl);
    };

    /* En ring paa n atomer. fra er det foerste ringatom, og ringens midte
       ligger i retningen v fra det. ordner[k] er bindingen mellem ringatom
       k og k+1. Gaar rundt med uret. */
    Mol.prototype.ring = function (fra, v, ordner, n) {
        n = n || 6;
        var A = this.atomer[fra];
        var R = 1 / (2 * Math.sin(Math.PI / n));
        var cx = A.x + Math.cos(v * GRAD) * R, cy = A.y + Math.sin(v * GRAD) * R;
        var start = Math.atan2(A.y - cy, A.x - cx);
        var idx = [fra], k;
        for (k = 1; k < n; k++) {
            var t = start + k * 2 * Math.PI / n;
            idx.push(this.atom(cx + R * Math.cos(t), cy + R * Math.sin(t)));
        }
        for (k = 0; k < n; k++) this.bind(idx[k], idx[(k + 1) % n], ordner[k], { x: cx, y: cy });
        return idx;
    };

    /* Drej hele molekylet (grader) */
    Mol.prototype.drej = function (v) {
        var c = Math.cos(v * GRAD), s = Math.sin(v * GRAD);
        function rot(p) { var x = p.x, y = p.y; p.x = x * c - y * s; p.y = x * s + y * c; }
        this.atomer.forEach(rot);
        this.bindinger.forEach(function (b) { if (b.c) rot(b.c); });
        return this;
    };

    Mol.prototype.kopi = function () {
        var m = new Mol();
        m.atomer = this.atomer.map(function (a) { var b = {}; for (var k in a) b[k] = a[k]; return b; });
        m.bindinger = this.bindinger.map(function (b) { return { a: b.a, b: b.b, o: b.o, c: b.c ? { x: b.c.x, y: b.c.y } : null, br: b.br }; });
        m.navn = this.navn;
        return m;
    };

    Mol.prototype.dobbelte = function () {
        var ud = [];
        this.bindinger.forEach(function (b, i) { if (b.o === 2) ud.push(i); });
        return ud;
    };

    /* Brom adderes til dobbeltbindingen bi: den bliver enkelt, og hvert
       C-atom faar et Br, der peger derhen, hvor der er plads */
    Mol.prototype.addérBrom = function (bi) {
        var b = this.bindinger[bi];
        if (!b || b.o !== 2) return false;
        b.o = 1;
        b.br = true;
        var mig = this;
        [b.a, b.b].forEach(function (i) { mig.gaa(i, mig.udad(i), 1, "Br", { br: true }); });
        return true;
    };

    /* ----- Konjugeringen ---------------------------------------------------- */
    function konjugering(mol) {
        var B = mol.bindinger;
        var dob = mol.dobbelte();
        var far = {};
        dob.forEach(function (i) { far[i] = i; });
        function rod(i) { while (far[i] !== i) { far[i] = far[far[i]]; i = far[i]; } return i; }
        function forén(i, j) { var a = rod(i), b = rod(j); if (a !== b) far[a] = b; }

        /* For hvert atom: den dobbeltbinding, det sidder i */
        var iDob = {};
        dob.forEach(function (i) { iDob[B[i].a] = i; iDob[B[i].b] = i; });

        var forbinder = [];   /* enkeltbindinger mellem to dobbeltbindinger */
        B.forEach(function (b, i) {
            if (b.o !== 1) return;
            var da = iDob[b.a], db = iDob[b.b];
            if (da === undefined || db === undefined || da === db) return;
            forén(da, db);
            forbinder.push(i);
        });

        var grupper = {};
        dob.forEach(function (i) {
            var r = rod(i);
            (grupper[r] = grupper[r] || []).push(i);
        });
        var systemer = Object.keys(grupper).map(function (k) {
            return { dob: grupper[k].sort(function (a, b) { return a - b; }), enkelt: [] };
        });
        systemer.sort(function (a, b) { return b.dob.length - a.dob.length || a.dob[0] - b.dob[0]; });
        var afBinding = {};
        systemer.forEach(function (s, si) { s.dob.forEach(function (i) { afBinding[i] = si; }); });
        forbinder.forEach(function (i) {
            var si = afBinding[iDob[B[i].a]];
            systemer[si].enkelt.push(i);
        });
        return {
            systemer: systemer,
            afBinding: afBinding,
            stoerst: systemer.length ? systemer[0].dob.length : 0,
            antalDob: dob.length
        };
    }

    /* Rækkefølgen af dobbeltbindingerne langs et system (fra den ene ende),
       saa "nr. 3 fra enden" giver mening i en kaede */
    function langs(mol, system) {
        var B = mol.bindinger, set = {};
        system.dob.forEach(function (i) { set[i] = true; });
        var nabo = {};
        system.dob.forEach(function (i) { nabo[i] = []; });
        system.enkelt.forEach(function (si) {
            var s = B[si], da = null, db = null;
            system.dob.forEach(function (i) {
                if (B[i].a === s.a || B[i].b === s.a) da = i;
                if (B[i].a === s.b || B[i].b === s.b) db = i;
            });
            if (da !== null && db !== null) { nabo[da].push(db); nabo[db].push(da); }
        });
        var start = system.dob.filter(function (i) { return nabo[i].length <= 1; })[0];
        if (start === undefined) return system.dob.slice();
        var ud = [start], set2 = {};
        set2[start] = true;
        var cur = start;
        while (true) {
            var n = nabo[cur].filter(function (j) { return !set2[j]; })[0];
            if (n === undefined) break;
            ud.push(n);
            set2[n] = true;
            cur = n;
        }
        return ud.length === system.dob.length ? ud : system.dob.slice();
    }

    /* ----- Tegningen ---------------------------------------------------------- */
    function ramme(mol) {
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        mol.atomer.forEach(function (a) {
            var px = a.lbl ? 0.25 * Math.max(1, a.lbl.length) : 0;
            x0 = Math.min(x0, a.x - px); x1 = Math.max(x1, a.x + px);
            y0 = Math.min(y0, a.y); y1 = Math.max(y1, a.y);
        });
        return { x0: x0, y0: y0, x1: x1, y1: y1 };
    }

    /* Den skala og forskydning, der faar molekylet til at passe i rektanglet */
    function pasning(mol, r, maks) {
        var f = ramme(mol);
        var b = Math.max(0.5, f.x1 - f.x0 + 0.9), h = Math.max(0.5, f.y1 - f.y0 + 0.9);
        var s = Math.min(r.b / b, r.h / h, maks || 60);
        return {
            s: s,
            ox: r.x + r.b / 2 - (f.x0 + f.x1) / 2 * s,
            oy: r.y + r.h / 2 - (f.y0 + f.y1) / 2 * s
        };
    }

    function P(vis, a) { return { x: vis.ox + a.x * vis.s, y: vis.oy + a.y * vis.s }; }

    /* Etiketter, der vender mod venstre, skrives baglaens som i bogen */
    var BAGLAENS = {
        "OH": "HO", "SO₃⁻": "⁻O₃S", "OCH₃": "H₃CO", "N(CH₃)₂": "(H₃C)₂N", "CH₃": "H₃C", "NH": "HN", "Br": "Br"
    };

    /* Hvor etiketten skal staa: tegnet, der er bundet, skal sidde paa atomet */
    function etiket(mol, i) {
        var a = mol.atomer[i];
        var tekst = a.lbl;
        var naboer = mol.naboer(i);
        var ank = "midt";
        if (tekst.length > 1 && naboer.length === 1) {
            var n = mol.atomer[naboer[0]];
            if (n.x > a.x + 0.3) { ank = "hoejre"; tekst = BAGLAENS[tekst] || tekst; }
            else ank = "venstre";
        }
        return { tekst: tekst, ank: ank };
    }

    /* opt: farve, baand { bi: css },
       marker { bi: css }, over (bi), roed { bi: 0-1 }, lysAtom { ai: true },
       bredde (stregens tykkelse) */
    function tegn(ctx, mol, vis, opt) {
        opt = opt || {};
        var s = vis.s;
        var farve = opt.farve || "#e9eee9";
        var A = mol.atomer, B = mol.bindinger;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        /* Baand under bindingerne: det konjugerede system, det markerede */
        function baand(bi, css, tyk) {
            var b = B[bi];
            var p = P(vis, A[b.a]), q = P(vis, A[b.b]);
            ctx.strokeStyle = css;
            ctx.lineWidth = tyk;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
        }
        var k;
        if (opt.baand) for (k in opt.baand) baand(+k, opt.baand[k], s * 0.62);
        if (opt.roed) for (k in opt.roed) if (opt.roed[k] > 0) baand(+k, "rgba(224, 84, 70," + (0.75 * opt.roed[k]) + ")", s * 0.62);
        if (opt.over !== undefined && opt.over !== null && B[opt.over]) baand(opt.over, "rgba(255, 255, 255, 0.16)", s * 0.62);
        if (opt.marker) for (k in opt.marker) baand(+k, opt.marker[k], s * 0.4);

        /* Bindingerne. Ved et atom med etiket stopper stregen foer bogstavet. */
        var tyk = opt.bredde || Math.max(1.6, s * 0.075);
        var fs = Math.max(11, s * 0.5);
        var luft = fs * 0.58;
        ctx.strokeStyle = farve;
        ctx.lineWidth = tyk;
        B.forEach(function (b) {
            var p = P(vis, A[b.a]), q = P(vis, A[b.b]);
            var dx0 = q.x - p.x, dy0 = q.y - p.y, L0 = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
            if (A[b.a].lbl) { p = { x: p.x + dx0 / L0 * luft, y: p.y + dy0 / L0 * luft }; }
            if (A[b.b].lbl) { q = { x: q.x - dx0 / L0 * luft, y: q.y - dy0 / L0 * luft }; }
            var dx = q.x - p.x, dy = q.y - p.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
            var nx = -dy / L, ny = dx / L;
            ctx.beginPath();
            if (b.o === 2 && b.c) {
                /* I en ring: kanten og en kortere streg inde i ringen */
                var c = P(vis, b.c);
                var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
                var tegnN = ((c.x - mx) * nx + (c.y - my) * ny) > 0 ? 1 : -1;
                var d = s * 0.16 * tegnN, kort = 0.16;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.moveTo(p.x + dx * kort + nx * d, p.y + dy * kort + ny * d);
                ctx.lineTo(q.x - dx * kort + nx * d, q.y - dy * kort + ny * d);
            } else if (b.o === 2) {
                var d2 = s * 0.085;
                ctx.moveTo(p.x + nx * d2, p.y + ny * d2);
                ctx.lineTo(q.x + nx * d2, q.y + ny * d2);
                ctx.moveTo(p.x - nx * d2, p.y - ny * d2);
                ctx.lineTo(q.x - nx * d2, q.y - ny * d2);
            } else {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
            }
            ctx.stroke();
        });

        /* Etiketterne */
        ctx.font = "700 " + fs + "px 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        A.forEach(function (a, i) {
            if (!a.lbl) return;
            var p = P(vis, a);
            var e = etiket(mol, i);
            var bundet = e.tekst === "Br" ? "Br" : (e.ank === "hoejre" ? e.tekst.slice(-1) : e.tekst.charAt(0));
            var wb = ctx.measureText(bundet).width;
            var w = ctx.measureText(e.tekst).width;
            var x0;
            if (e.ank === "venstre") x0 = p.x - wb / 2;
            else if (e.ank === "hoejre") x0 = p.x + wb / 2 - w;
            else x0 = p.x - w / 2;
            var tf = a.br ? "#f0a35c" : (opt.lysAtom && opt.lysAtom[i] ? "#f2c53d" : (a.lbl === "O" || a.lbl === "OH" ? "#ff9d94" : (a.lbl.charAt(0) === "N" ? "#9fd3f7" : farve)));
            ctx.fillStyle = tf;
            ctx.textAlign = "left";
            ctx.fillText(e.tekst, x0, p.y + fs * 0.04);
            /* H paa et N i en ring: under eller over bogstavet */
            if (a.h) {
                var dyH = a.h === "ned" ? fs * 0.95 : -fs * 0.95;
                ctx.textAlign = "center";
                ctx.fillText("H", p.x, p.y + dyH + fs * 0.04);
            }
        });

        /* Atomer, der lyser i et hint (uden etiket): en lille ring */
        if (opt.lysAtom) {
            ctx.strokeStyle = "#f2c53d";
            ctx.lineWidth = 2.5;
            for (k in opt.lysAtom) {
                var a2 = A[+k];
                if (!a2 || a2.lbl) continue;
                var p2 = P(vis, a2);
                ctx.beginPath();
                ctx.arc(p2.x, p2.y, s * 0.22, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    /* Den binding, der er naermest punktet (kun dobbeltbindinger, hvis
       kunDobbelt), eller null */
    function bindingVed(mol, vis, pt, kunDobbelt, medBrom) {
        var bedst = null, bedstD = Math.max(10, vis.s * 0.3);
        mol.bindinger.forEach(function (b, i) {
            if (kunDobbelt && b.o !== 2 && !(medBrom && b.br)) return;
            var p = P(vis, mol.atomer[b.a]), q = P(vis, mol.atomer[b.b]);
            var dx = q.x - p.x, dy = q.y - p.y, L2 = dx * dx + dy * dy || 1;
            var t = NK.klamp(((pt.x - p.x) * dx + (pt.y - p.y) * dy) / L2, 0, 1);
            var ex = p.x + dx * t - pt.x, ey = p.y + dy * t - pt.y;
            var d = Math.sqrt(ex * ex + ey * ey);
            if (d < bedstD) { bedstD = d; bedst = i; }
        });
        return bedst;
    }

    /* Midten af en binding i pixels */
    function midt(mol, vis, bi) {
        var b = mol.bindinger[bi];
        var p = P(vis, mol.atomer[b.a]), q = P(vis, mol.atomer[b.b]);
        return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    }

    /* ----- Molekylerne ---------------------------------------------------------- */
    var BYG = {};

    /* H(CH=CH)nH: n konjugerede dobbeltbindinger i en lige kaede */
    BYG.polyen = function (n) {
        var m = new Mol();
        var a = m.atom(0, 0);
        var ordner = [];
        for (var k = 0; k < 2 * n - 1; k++) ordner.push(k % 2 === 0 ? 2 : 1);
        m.kaede(a, -30, 30, ordner);
        return m;
    };

    /* CH2=CH-CH2-CH=CH2 */
    BYG.pentadien = function () {
        var m = new Mol();
        m.kaede(m.atom(0, 0), -30, 30, [2, 1, 1, 2]);
        return m;
    };

    BYG.benzen = function () {
        var m = new Mol();
        m.ring(m.atom(0, 0), 0, [2, 1, 2, 1, 2, 1]);
        return m;
    };

    /* To benzenringe forbundet af X=X: stilben (C) eller azobenzen (N) */
    function toRinge(m, x, hoejre) {
        var c1 = m.atom(0, 0);
        m.ring(c1, 180, [2, 1, 2, 1, 2, 1]);
        var a = m.gaa(c1, 0, 1, x);
        var b = m.gaa(a, 60, 2, x);
        var c2 = m.gaa(b, 0, 1);
        var r = m.ring(c2, 0, [2, 1, 2, 1, 2, 1]);
        if (hoejre) m.gaa(r[3], 0, 1, hoejre);
        return m;
    }

    BYG.stilben = function () { return toRinge(new Mol(), "", null); };
    BYG.smoergult = function () { return toRinge(new Mol(), "N", "N(CH₃)₂"); };

    /* Lycopen, C40H56: 13 dobbeltbindinger, de 11 i midten konjugerede */
    BYG.lycopen = function () {
        var m = new Mol();
        var a0 = m.atom(0, 0);
        var ordner = [1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1];
        var k = [a0].concat(m.kaede(a0, -30, 30, ordner));
        [1, 5, 9, 13, 18, 22, 26, 30].forEach(function (i) { m.side(k[i], ""); });
        return m;
    };

    /* beta-caroten, C40H56: ring - 9 dobbeltbindinger i kaeden - ring */
    BYG.betacaroten = function () {
        var m = new Mol();
        var c6 = m.atom(0, 0);
        var ordner = [];
        for (var i = 0; i < 19; i++) ordner.push(i % 2 === 0 ? 1 : 2);
        var k = [c6].concat(m.kaede(c6, -30, 30, ordner));
        [3, 7, 12, 16].forEach(function (j) { m.side(k[j], ""); });
        function ionring(fra, v) {
            var r = m.ring(fra, v, [2, 1, 1, 1, 1, 1]);
            m.side(r[1], "");
            var u = m.udad(r[5]);
            m.gaa(r[5], u - 32, 1);
            m.gaa(r[5], u + 32, 1);
        }
        ionring(c6, 150);
        ionring(k[19], -30);
        return m;
    };

    /* Indigo: to ringsystemer med N-H og C=O og en C=C i midten */
    BYG.indigo = function () {
        var m = new Mol();
        var R5 = 1 / (2 * Math.sin(Math.PI / 5));
        function halv(fortegn) {
            /* fortegn 1: venstre halvdel, -1: hoejre (spejlet gennem midten) */
            function pt(x, y) { return { x: x * fortegn, y: y * fortegn }; }
            var cx = -0.5 - R5;
            var v = [];
            for (var k = 0; k < 5; k++) {
                var t = k * 72 * GRAD;
                v.push(pt(cx + R5 * Math.cos(t), R5 * Math.sin(t)));
            }
            var c2 = m.atom(v[0].x, v[0].y);
            var n1 = m.atom(v[1].x, v[1].y, "N", { h: fortegn > 0 ? "ned" : "op" });
            var c7a = m.atom(v[2].x, v[2].y);
            var c3a = m.atom(v[3].x, v[3].y);
            var c3 = m.atom(v[4].x, v[4].y);
            var c5 = pt(cx, 0);
            m.bind(c2, n1, 1, c5);
            m.bind(n1, c7a, 1, c5);
            m.bind(c3a, c3, 1, c5);
            m.bind(c3, c2, 1, c5);
            var o = pt(v[4].x * fortegn + Math.cos(288 * GRAD), v[4].y * fortegn + Math.sin(288 * GRAD));
            m.bind(c3, m.atom(o.x, o.y, "O"), 2);
            /* benzenringen paa kanten c7a-c3a */
            var bx = v[2].x * fortegn - Math.cos(30 * GRAD);
            var bc = pt(bx, 0);
            var p4 = pt(bx, -1), p5 = pt(bx - Math.cos(30 * GRAD), -0.5), p6 = pt(bx - Math.cos(30 * GRAD), 0.5), p7 = pt(bx, 1);
            var c4 = m.atom(p4.x, p4.y), c5a = m.atom(p5.x, p5.y), c6 = m.atom(p6.x, p6.y), c7 = m.atom(p7.x, p7.y);
            m.bind(c7a, c3a, 2, bc);
            m.bind(c3a, c4, 1, bc);
            m.bind(c4, c5a, 2, bc);
            m.bind(c5a, c6, 1, bc);
            m.bind(c6, c7, 2, bc);
            m.bind(c7, c7a, 1, bc);
            return c2;
        }
        var v2 = halv(1), h2 = halv(-1);
        m.bind(v2, h2, 2);
        return m;
    };

    /* Allura rød (E129): naphthalen - N=N - benzenring */
    BYG.allura = function () {
        var m = new Mol();
        var h = Math.cos(30 * GRAD);
        /* naphthalen med den faelles binding lodret i midten */
        var c8a = m.atom(0, -0.5), c4a = m.atom(0, 0.5);
        var c1 = m.atom(-h, -1), c2 = m.atom(-2 * h, -0.5), c3 = m.atom(-2 * h, 0.5), c4 = m.atom(-h, 1);
        var c5 = m.atom(h, 1), c6 = m.atom(2 * h, 0.5), c7 = m.atom(2 * h, -0.5), c8 = m.atom(h, -1);
        var V = { x: -h, y: 0 }, H = { x: h, y: 0 };
        m.bind(c8a, c1, 1, V); m.bind(c1, c2, 2, V); m.bind(c2, c3, 1, V); m.bind(c3, c4, 2, V); m.bind(c4, c4a, 1, V);
        m.bind(c4a, c8a, 2, null);
        m.bind(c4a, c5, 1, H); m.bind(c5, c6, 2, H); m.bind(c6, c7, 1, H); m.bind(c7, c8, 2, H); m.bind(c8, c8a, 1, H);
        m.gaa(c2, 210, 1, "SO₃⁻");
        m.gaa(c6, 30, 1, "OH");
        /* azogruppen ned fra C5 og benzenringen under den */
        var na = m.gaa(c5, 90, 1, "N");
        var nb = m.gaa(na, 30, 2, "N");
        var d1 = m.gaa(nb, 90, 1);
        var r = m.ring(d1, 90, [2, 1, 2, 1, 2, 1]);
        m.side(r[1], "OCH₃");
        m.side(r[3], "SO₃⁻");
        m.side(r[4], "");
        m.drej(-90);
        return m;
    };

    function byg(id, n) {
        var m = BYG[id](n);
        m.id = id;
        return m;
    }

    NK.Mol = {
        Mol: Mol,
        byg: byg,
        konjugering: konjugering,
        langs: langs,
        pasning: pasning,
        P: P,
        tegn: tegn,
        bindingVed: bindingVed,
        midt: midt
    };
}());

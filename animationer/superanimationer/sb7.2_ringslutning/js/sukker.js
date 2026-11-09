/* =====================================================================
   sukker.js - sukkermolekylerne: fischerprojektion, kaeden paa siden,
   den boejede kaede og ringen (haworthformlen), og glidningen mellem dem

   Tegnestilen er bogens (figurerne i afsnit B7.2): ringens oxygenatom
   bagest til hoejre, carbonatom 1 yderst til hoejre, numrene med uret,
   den tykke kant mod laeseren og ingen hydrogenatomer paa ringen.

   Alle maal er i enheder; S.tegn ganger med view.s (pixels pr. enhed).
   Et molekyle har emner (atomer og grupper som "OH" og "CH₂OH") og
   bindinger. Hver ramme (K0, K0r, K1 ...) giver alle emner en plads, en
   tekst og en synlighed og alle bindinger en orden, en stil og en
   tykkelse. S.mellem blander to rammer:
     "rot"    kaeden vippes 90 grader med uret (fischer -> paa siden);
              det, der pegede til hoejre, peger ned
     "polar"  kaeden kruller sig om midten (paa siden -> boejet)
     "lin"    lige linjer (boejet -> ring, og alt i fane 2)

   Rammerne for en aldose (glucose):
     K0   fischerprojektion; aldehydgruppen er H, C og =O oeverst
     K0r  kaeden ligger paa siden: carbonatom 1 til hoejre
     K1   kaeden er boejet: O5 er naer carbonatom 1 (stiplet), =O peger ned
     K1m  midt i drejningen af aldehydgruppen (fra K1 til K1b)
     K1b  aldehydgruppen er drejet: =O peger op
     K2   ringen er lukket: alfa (OH paa carbonatom 1 peger ned)
     K2b  ringen er lukket: beta (OH paa carbonatom 1 peger op)
   For en ketose (fructose) er der K0, K0r, K1 og K2 (alfa), ring med fem atomer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = {};

    var INK = "#1d2433";
    var HO_DX = 0.30;         /* fra O til H, naar "OH" er to emner */
    var TYND = 0.036, TYK = 0.10;

    /* Ringens hjoerner (bogens haworthformel) */
    var R6 = { 1: [1.05, 0], 2: [0.52, 0.56], 3: [-0.52, 0.56], 4: [-1.05, 0], 5: [-0.52, -0.56], O: [0.52, -0.56] };
    var R5 = { 2: [1.0, 0], 3: [0.58, 0.64], 4: [-0.58, 0.64], 5: [-1.0, 0], O: [0, -0.52] };
    S.R6 = R6;
    S.R5 = R5;

    /* ----- Pladserne for grupperne paa ringen ------------------------------------
       ret er "op" eller "ned". Grupper, der peger op fra de forreste
       carbonatomer, staar inde i ringen (kortere streg), som i bogen. */
    function ringSub(keto, k, ret) {
        var r = keto ? R5 : R6, c = r[k], op = ret === "op";
        var fremme = keto ? (k === 3 || k === 4) : (k === 2 || k === 3);
        var dy = op ? (fremme ? -0.52 : -0.64) : 0.62;
        var t = "OH", an = 0, dx = 0;
        if (!keto && k === 4) { t = "HO"; an = 1; }
        if (!keto && k === 5) { t = "CH₂OH"; an = 0; }
        if (keto && k === 5) { t = "HOCH₂"; an = 2; }
        /* Inde i ringen med seks atomer staar gruppen paa carbonatom 2 som "HO",
           saa den ikke roerer kanten ved carbonatom 1 */
        if (!keto && k === 2 && op) { t = "HO"; an = 1; }
        /* Inde i ringen med fem atomer staar gruppen paa carbonatom 3 som "HO" */
        if (keto && k === 3 && op) { t = "HO"; an = 1; }
        /* Carbonatom 2 i fructose: gruppen, der peger ned, staar skraat ud til hoejre */
        if (keto && k === 2 && !op) { dx = 0.32; dy = 0.5; }
        return { x: c[0] + dx, y: c[1] + dy, t: t, an: an };
    }
    S.ringSub = ringSub;

    /* Fischerprojektionen: carbonatom k staar i hoejden k - 3,5 */
    function fy(k) { return k - 3.5; }
    var SIDE = 0.95;
    function fischerSub(k, side) {
        /* side "H" (hoejre) eller "V" (venstre) */
        if (side === "H") return { x: SIDE, y: fy(k), t: "OH", an: 0 };
        return { x: -SIDE, y: fy(k), t: "HO", an: 1 };
    }
    S.fischerSub = fischerSub;
    S.fy = fy;

    function rotPunkt(x, y) { return { x: -y, y: x }; }

    /* Nummerets plads ved et carbonatom i en ring: lidt ud fra ringens midte */
    function ringNr(keto, k) {
        var r = keto ? R5 : R6, c = r[k];
        var l = Math.sqrt(c[0] * c[0] + c[1] * c[1]) || 1;
        var dx = c[0] / l * 0.24, dy = c[1] / l * 0.2;
        if (Math.abs(c[1]) < 0.05) { dx = c[0] > 0 ? 0.24 : -0.24; dy = -0.02; }
        return { dx: dx, dy: dy };
    }

    /* =====================================================================
       Modellen for et sukker. sider: { k: "H" | "V" } for de carbonatomer,
       der har en OH-gruppe og et H (glucose: 2 H, 3 V, 4 H, 5 H).
       ===================================================================== */
    S.model = function (id, sider, keto) {
        var M = { id: id, keto: !!keto, emner: [], bind: [], rammer: {} };
        var fra = keto ? 3 : 2;           /* foerste carbonatom med OH og H */
        var k;

        function emne(e) { M.emner.push(e); }
        function bind(a, b) { M.bind.push({ id: a + "-" + b, a: a, b: b }); }

        for (k = 1; k <= 6; k++) emne("C" + k);
        if (keto) { emne("O2"); }
        else { emne("O1"); emne("H1"); }
        for (k = fra; k <= 5; k++) {
            emne(k === 5 ? "O5" : "O" + k);
            emne("H" + k + "c");             /* hydrogenatomet paa carbonatomet */
        }
        emne("H5");                          /* hydrogenatomet i OH-gruppen paa carbonatom 5 */

        for (k = 1; k <= 5; k++) bind("C" + k, "C" + (k + 1));
        if (keto) bind("C2", "O2"); else { bind("C1", "O1"); bind("C1", "H1"); }
        for (k = fra; k <= 5; k++) { bind("C" + k, "O" + k); bind("C" + k, "H" + k + "c"); }
        bind("O5", keto ? "C2" : "C1");     /* ringens nye binding */
        bind("O5", "H5");                    /* kun som streg, naar H staar over O (fructose) */
        /* Vaertene: et emne foelger sit carbonatom, naar kaeden kruller sig */
        M.vaert = { C6: "C5" };
        if (keto) { M.vaert.O2 = "C2"; M.vaert.C1 = "C2"; } else { M.vaert.O1 = "C1"; M.vaert.H1 = "C1"; }
        for (k = fra; k <= 5; k++) { M.vaert["O" + k] = "C" + k; M.vaert["H" + k + "c"] = "C" + k; }
        M.lukker = keto ? "C2" : "C1";
        M.carbonyl = keto ? "O2" : "O1";
        M.ringBind = "O5-" + M.lukker;

        /* ----- K0: fischerprojektionen ---------------------------------------- */
        var K0 = { it: {}, b: {}, n: {} };
        for (k = 1; k <= 6; k++) K0.it["C" + k] = { x: 0, y: fy(k), t: "C", an: 0, a: 1 };
        K0.it.C6 = { x: 0, y: fy(6), t: "CH₂OH", an: 0, a: 1 };
        if (keto) {
            K0.it.C1 = { x: 0, y: fy(1), t: "CH₂OH", an: 0, a: 1 };
            K0.it.O2 = { x: SIDE, y: fy(2), t: "O", an: 0, a: 1 };
        } else {
            K0.it.H1 = { x: -0.62, y: fy(1) - 0.62, t: "H", an: 0, a: 1 };
            K0.it.O1 = { x: 0.62, y: fy(1) - 0.62, t: "O", an: 0, a: 1 };
        }
        for (k = fra; k <= 5; k++) {
            var s = sider[k], o = fischerSub(k, s);
            if (k === 5) o = { x: s === "H" ? SIDE : -SIDE, y: fy(5), t: "O", an: 0 };
            o.a = 1;
            K0.it["O" + k] = o;
            K0.it["H" + k + "c"] = { x: s === "H" ? -SIDE : SIDE, y: fy(k), t: "H", an: 0, a: 1 };
        }
        K0.it.H5 = { p: "O5", dx: sider[5] === "H" ? HO_DX : -HO_DX, dy: 0, t: "H", an: 0, a: 1 };
        M.bind.forEach(function (b) { K0.b[b.id] = { o: 1, s: 0, w: TYND, a: 1 }; });
        K0.b[M.ringBind].a = 0;
        K0.b["O5-H5"].a = 0;
        if (keto) K0.b["C2-O2"].o = 2; else K0.b["C1-O1"].o = 2;
        for (k = 1; k <= 6; k++) K0.n[k] = { dx: -0.3, dy: -0.34 };
        K0.n[6] = { dx: -0.36, dy: -0.02 };
        if (keto) K0.n[1] = { dx: -0.36, dy: -0.02 };
        else K0.n[1] = { dx: -0.34, dy: 0.1 };
        M.rammer.K0 = K0;

        /* ----- K0r: kaeden paa siden (drejet 90 grader med uret) ------------------ */
        var K0r = kopi(K0);
        Object.keys(K0r.it).forEach(function (id) {
            var e = K0r.it[id];
            if (e.p) return;
            var r = rotPunkt(e.x, e.y);
            e.x = r.x; e.y = r.y;
            if (e.t === "HO") { e.t = "OH"; e.an = 0; }
        });
        K0r.it.C6.t = "HOH₂C"; K0r.it.C6.an = 4;
        if (!keto) { K0r.it.H1.x = 3.12; K0r.it.H1.y = -0.62; K0r.it.O1.x = 3.12; K0r.it.O1.y = 0.62; }
        for (k = 1; k <= 6; k++) K0r.n[k] = { dx: -0.3, dy: -0.34 };
        K0r.n[6] = { dx: 0.02, dy: -0.36 };
        if (keto) K0r.n[1] = { dx: 0.02, dy: -0.36 };
        M.rammer.K0r = K0r;

        /* ----- K1: kaeden er boejet, og O5 er naer carbonatomet i C=O ----------- */
        var K1 = kopi(K0r), R = keto ? R5 : R6;
        for (k = keto ? 2 : 1; k <= 5; k++) { K1.it["C" + k].x = R[k][0]; K1.it["C" + k].y = R[k][1]; K1.it["C" + k].a = 0; }
        for (k = fra; k <= 4; k++) {
            var op = sider[k] === "V";
            var oh = ringSub(keto, k, op ? "op" : "ned"), hh = ringSub(keto, k, op ? "ned" : "op");
            K1.it["O" + k] = { x: oh.x, y: oh.y, t: oh.t, an: oh.an, a: 1 };
            K1.it["H" + k + "c"] = { x: hh.x, y: hh.y, t: "H", an: 0, a: 0 };
            K1.b["C" + k + "-H" + k + "c"].a = 0;
        }
        /* carbonatom 5: CH2OH op, O5 ind i ringen, H ned (skjult) */
        var c6 = ringSub(keto, 5, "op");
        K1.it.C6 = { x: c6.x, y: c6.y, t: c6.t, an: c6.an, a: 1 };
        K1.it.O5 = { x: R.O[0], y: R.O[1], t: "O", an: 0, a: 1 };
        var h5 = ringSub(keto, 5, "ned");
        K1.it.H5c = { x: h5.x, y: keto ? h5.y : R[5][1] + 0.5, t: "H", an: 0, a: 0 };
        K1.b["C5-H5c"].a = 0;
        K1.it.H5 = { p: "O5", dx: keto ? -HO_DX : HO_DX, dy: 0, t: "H", an: 0, a: 1 };
        if (keto) {
            var c1 = ringSub(true, 2, "op"), o2 = ringSub(true, 2, "ned");
            K1.it.C1 = { x: c1.x, y: c1.y, t: "CH₂OH", an: 0, a: 1 };
            K1.it.O2 = { x: o2.x, y: o2.y, t: "O", an: 0, a: 1 };
            /* H staar over O5 med en lille streg, saa den stiplede linje er fri */
            K1.it.H5 = { p: "O5", dx: 0.2, dy: -0.36, t: "H", an: 0, a: 1 };
            K1.b["O5-H5"].a = 1;
        } else {
            K1.it.O1 = { x: 1.40, y: 0.46, t: "O", an: 0, a: 1 };
            K1.it.H1 = { x: 1.40, y: -0.46, t: "H", an: 0, a: 1 };
        }
        /* Den tykke kant mod laeseren */
        var fremme = keto ? [["C2", "C3"], ["C3", "C4"], ["C4", "C5"]] : [["C1", "C2"], ["C2", "C3"], ["C3", "C4"]];
        fremme.forEach(function (p) { K1.b[p[0] + "-" + p[1]].w = TYK; });
        for (k = 1; k <= 6; k++) {
            if (k === 6 || (keto && k === 1)) continue;
            K1.n[k] = ringNr(keto, k);
        }
        K1.n[6] = { dx: -0.3, dy: 0.02 };
        if (keto) { K1.n[6] = { dx: -0.02, dy: -0.36 }; K1.n[1] = { dx: -0.3, dy: 0.02 }; }
        M.rammer.K1 = K1;

        /* ----- K1d: den stiplede linje viser, hvor ringen lukker sig ------------- */
        var K1d = kopi(K1);
        K1d.b[M.ringBind] = { o: 1, s: 1, w: TYND, a: 1 };
        M.rammer.K1d = K1d;

        /* ----- K2: ringen er lukket (alfa: den nye OH-gruppe peger ned) ---------- */
        var K2 = kopi(K1d);
        K2.b[M.ringBind] = { o: 1, s: 0, w: TYND, a: 1 };
        if (keto) {
            K2.b["C2-O2"].o = 1;
            K2.it.H5 = { p: "O2", dx: HO_DX, dy: 0, t: "H", an: 0, a: 1 };
            K2.b["O5-H5"].a = 0;
        } else {
            K2.b["C1-O1"].o = 1;
            K2.it.O1 = { x: R6[1][0], y: R6[1][1] + 0.62, t: "O", an: 0, a: 1 };
            K2.it.H1 = { x: R6[1][0], y: R6[1][1] - 0.62, t: "H", an: 0, a: 0 };
            K2.b["C1-H1"].a = 0;
            K2.it.H5 = { p: "O1", dx: HO_DX, dy: 0, t: "H", an: 0, a: 1 };
        }
        M.rammer.K2 = K2;

        if (!keto) {
            /* ----- K1m og K1b: aldehydgruppen drejer, saa =O peger op ---------------- */
            var K1m = kopi(K1d);
            K1m.it.O1 = { x: 1.84, y: -0.02, t: "O", an: 0, a: 1 };
            K1m.it.H1 = { x: 1.18, y: -0.36, t: "H", an: 0, a: 1 };
            M.rammer.K1m = K1m;
            var K1b = kopi(K1d);
            K1b.it.O1 = { x: 1.40, y: -0.46, t: "O", an: 0, a: 1 };
            K1b.it.H1 = { x: 1.40, y: 0.46, t: "H", an: 0, a: 1 };
            M.rammer.K1b = K1b;
            var K2b = kopi(K2);
            K2b.it.O1 = { x: R6[1][0], y: R6[1][1] - 0.64, t: "O", an: 0, a: 1 };
            K2b.it.H1 = { x: R6[1][0], y: R6[1][1] + 0.62, t: "H", an: 0, a: 0 };
            M.rammer.K2b = K2b;
        }
        return M;
    };

    function kopi(F) { return JSON.parse(JSON.stringify(F)); }
    S.kopi = kopi;

    /* ----- Absolut plads for et emne i en ramme (H5 sidder paa sit O) --------- */
    function abs(F, id) {
        var e = F.it[id];
        if (!e) return null;
        if (e.p) {
            var p = abs(F, e.p);
            return { x: p.x + e.dx, y: p.y + e.dy };
        }
        return { x: e.x, y: e.y };
    }
    S.abs = abs;

    /* Vinklen gaar den korte vej rundt */
    function vinkelLerp(a, b, u) {
        var d = b - a;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        return a + d * u;
    }

    /* =====================================================================
       S.mellem: tilstanden mellem ramme A og B (u fra 0 til 1)
       skift: hvornaar teksten skifter (standard 0,5); pr. emne i sent
       ===================================================================== */
    S.mellem = function (A, B, u, maade, sent, vaert) {
        var T = { it: {}, b: {}, n: {} };
        sent = sent || {};
        vaert = maade === "polar" ? (vaert || {}) : {};
        var ids = Object.keys(B.it);
        /* Det, der forsvinder, mens kaeden kruller sig, er vaek efter de foerste 20 %
           (eleven kan standse kaeden midt i boejningen, naar ringen lukkes med musen) */
        function alfa(x, y) {
            if (maade === "polar" && y < x) return NK.lerp(x, y, Math.min(1, u * 5));
            return NK.lerp(x, y, u);
        }
        /* Foerst carbonatomerne (og det andet uden vaert og foraelder), saa
           grupperne, der foelger deres carbonatom, og til sidst H5 */
        var foerst = ids.filter(function (id) { return !vaert[id]; });
        var efter = ids.filter(function (id) { return !!vaert[id]; });
        foerst.concat(efter).forEach(function (id) {
            var a = A.it[id], b = B.it[id];
            if (!a) a = b;
            if (a.p || b.p) return;
            var x, y;
            if (vaert[id] && !A.it[vaert[id]].p) {
                /* Gruppen drejer om sit carbonatom: vinkel og laengde blandes */
                var h = vaert[id], ha = A.it[h], hb = B.it[h], ht = T.it[h];
                var ax = a.x - ha.x, ay = a.y - ha.y, bx = b.x - hb.x, by = b.y - hb.y;
                var la = Math.sqrt(ax * ax + ay * ay), lb = Math.sqrt(bx * bx + by * by);
                var vv0 = vinkelLerp(Math.atan2(ay, ax), Math.atan2(by, bx), u), ll = NK.lerp(la, lb, u);
                x = ht.x + ll * Math.cos(vv0); y = ht.y + ll * Math.sin(vv0);
                var sk0 = sent[id] !== undefined ? sent[id] : 0.5;
                var bt0 = u >= sk0 ? b : a;
                T.it[id] = { x: x, y: y, t: bt0.t, an: bt0.an, a: alfa(a.a, b.a) };
                return;
            }
            if (maade === "rot") {
                var v = Math.PI / 2 * u, c = Math.cos(v), s = Math.sin(v);
                x = a.x * c - a.y * s; y = a.x * s + a.y * c;
                /* Grupper, hvis plads blev rettet efter drejningen (H1, O1), glider paa plads */
                var r = rotPunkt(a.x, a.y);
                x += (b.x - r.x) * u; y += (b.y - r.y) * u;
            } else if (maade === "polar") {
                var ra = Math.sqrt(a.x * a.x + a.y * a.y), rb = Math.sqrt(b.x * b.x + b.y * b.y);
                var va = Math.atan2(a.y, a.x), vb = Math.atan2(b.y, b.x);
                var rr = NK.lerp(ra, rb, u), vv = vinkelLerp(va, vb, u);
                x = rr * Math.cos(vv); y = rr * Math.sin(vv);
            } else {
                x = NK.lerp(a.x, b.x, u); y = NK.lerp(a.y, b.y, u);
            }
            var sk = sent[id] !== undefined ? sent[id] : 0.5;
            var bt = u >= sk ? b : a;
            T.it[id] = { x: x, y: y, t: bt.t, an: bt.an, a: alfa(a.a, b.a) };
        });
        ids.forEach(function (id) {
            var a = A.it[id], b = B.it[id];
            if (!a) a = b;
            if (!(a.p || b.p)) return;
            var pa = abs(A, id), pb = abs(B, id), x, y;
            if (a.p && b.p && a.p === b.p) {
                var par = T.it[a.p];
                x = par.x + NK.lerp(a.dx, b.dx, u); y = par.y + NK.lerp(a.dy, b.dy, u);
            } else {
                x = NK.lerp(pa.x, pb.x, u); y = NK.lerp(pa.y, pb.y, u);
            }
            var bt = u >= 0.5 ? b : a;
            T.it[id] = { x: x, y: y, t: bt.t, an: bt.an, a: alfa(a.a, b.a) };
        });
        Object.keys(B.b).forEach(function (id) {
            var a = A.b[id] || B.b[id], b = B.b[id];
            T.b[id] = { o: NK.lerp(a.o, b.o, u), s: NK.lerp(a.s, b.s, u), w: NK.lerp(a.w, b.w, u), a: alfa(a.a, b.a) };
        });
        Object.keys(B.n).forEach(function (k) {
            var a = A.n[k] || B.n[k], b = B.n[k];
            /* Skifter gruppens tekst sent (C6), springer nummeret med, saa det ikke glider hen over teksten */
            var skN = sent["C" + k];
            if (skN !== undefined && maade !== "lin") { var nb = u >= skN ? b : a; T.n[k] = { dx: nb.dx, dy: nb.dy }; return; }
            T.n[k] = { dx: NK.lerp(a.dx, b.dx, u), dy: NK.lerp(a.dy, b.dy, u) };
        });
        return T;
    };

    /* En ramme som tilstand (alle pladser absolutte) */
    S.tilstand = function (F) { return S.mellem(F, F, 1, "lin"); };

    /* =====================================================================
       Tegningen
       ===================================================================== */
    var FONT = "'Segoe UI', sans-serif";
    S.FONT = FONT;
    S.INK = INK;

    /* Tegnene i en gruppe: [{ c, sub }] */
    function dele(t) {
        var ud = [];
        for (var i = 0; i < t.length; i++) {
            var c = t.charAt(i), j = "₀₁₂₃₄₅₆₇₈₉".indexOf(c);
            ud.push(j >= 0 ? { c: String(j), sub: true } : { c: c, sub: false });
        }
        return ud;
    }

    /* Maaler og (hvis tegn) tegner en gruppe, saa ankertegnet staar midt paa (x, y).
       Giver kassen om hele gruppen og midten af hvert tegn. */
    S.gruppe = function (ctx, t, an, x, y, f, farve, tegnDen, vaegt) {
        var d = dele(t), b = [], i, sum = 0, foer = 0;
        vaegt = vaegt || "600";
        for (i = 0; i < d.length; i++) {
            ctx.font = vaegt + " " + (d[i].sub ? f * 0.68 : f) + "px " + FONT;
            b.push(ctx.measureText(d[i].c).width);
        }
        for (i = 0; i < d.length; i++) { if (i < an) foer += b[i]; sum += b[i]; }
        var x0 = x - foer - b[an] / 2, cx = x0, midter = [];
        for (i = 0; i < d.length; i++) {
            midter.push({ x: cx + b[i] / 2, y: y, c: d[i].c });
            if (tegnDen) {
                ctx.font = vaegt + " " + (d[i].sub ? f * 0.68 : f) + "px " + FONT;
                ctx.fillStyle = farve;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText(d[i].c, cx, d[i].sub ? y + f * 0.28 : y + f * 0.04);
            }
            cx += b[i];
        }
        return { x: x0, y: y - f * 0.58, w: sum, h: f * 1.16, midter: midter };
    };

    function skjult(e) { return !e || e.a < 0.02 || !e.t; }

    /* view: { cx, cy, s }. opt: farve { id: farve }, bindFarve { bindId: farve },
       numre { k: true } eller true, numFarve, skjul { id: true }.
       Giver kasserne om emnerne i skaermkoordinater. */
    S.tegn = function (ctx, M, T, view, opt) {
        opt = opt || {};
        var s = view.s, f = NK.klamp(s * 0.36, 11, 30);
        var P = function (p) { return { x: view.cx + p.x * s, y: view.cy + p.y * s }; };
        var kasser = {};
        var farve = opt.farve || {}, bf = opt.bindFarve || {}, skjul = opt.skjul || {};
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        /* H i en OH-gruppe, der er to emner (H5 ved siden af sit O), saettes
           lige op ad O'et efter skriftens egne bredder */
        if (T.it.H5) {
            ctx.font = "600 " + f + "px " + FONT;
            var dd = (ctx.measureText("O").width + ctx.measureText("H").width) / 2 / s;
            ["O5", "O1", "O2"].forEach(function (o) {
                var eo = T.it[o], eh = T.it.H5;
                if (!eo || !eh) return;
                var dx = eh.x - eo.x, dy = eh.y - eo.y;
                if (Math.abs(dy) < 0.02 && Math.abs(Math.abs(dx) - HO_DX) < 0.03) {
                    T = { it: Object.assign({}, T.it), b: T.b, n: T.n };
                    T.it.H5 = Object.assign({}, eh, { x: eo.x + (dx > 0 ? dd : -dd) });
                }
            });
        }

        /* Kasserne foerst (de bruges til at korte bindingerne af) */
        Object.keys(T.it).forEach(function (id) {
            var e = T.it[id];
            if (skjult(e) || skjul[id]) return;
            var p = P(e);
            kasser[id] = S.gruppe(ctx, e.t, e.an, p.x, p.y, f, INK, false);
            kasser[id].cx = p.x; kasser[id].cy = p.y;
        });

        /* Bindingerne */
        M.bind.forEach(function (bd) {
            var st = T.b[bd.id];
            if (!st || st.a < 0.02) return;
            var ea = T.it[bd.a], eb = T.it[bd.b];
            if (!ea || !eb || skjul[bd.a] || skjul[bd.b]) return;
            var a = P(ea), b = P(eb);
            var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy);
            if (l < 1) return;
            var ux = dx / l, uy = dy / l;
            var ra = skjult(ea) ? 0 : f * 0.52 * NK.klamp(ea.a, 0, 1);
            var rb = skjult(eb) ? 0 : f * 0.52 * NK.klamp(eb.a, 0, 1);
            if (ra + rb > l - 4) return;
            var x1 = a.x + ux * ra, y1 = a.y + uy * ra, x2 = b.x - ux * rb, y2 = b.y - uy * rb;
            var w = Math.max(1.6, st.w * s);
            ctx.strokeStyle = bf[bd.id] || INK;
            /* Stiplet og fast blandes ved at tegne begge med hver sin synlighed */
            var fast = st.a * (1 - st.s), stip = st.a * st.s;
            if (stip > 0.02) {
                ctx.save();
                ctx.globalAlpha = stip;
                ctx.setLineDash([Math.max(3, s * 0.07), Math.max(4, s * 0.08)]);
                ctx.lineWidth = Math.max(1.6, TYND * s);
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                ctx.restore();
            }
            if (fast > 0.02) {
                ctx.save();
                ctx.globalAlpha = fast;
                ctx.lineWidth = w;
                var dob = NK.klamp(st.o - 1, 0, 1);
                var off = s * 0.06 * dob;
                var nx = -uy, ny = ux;
                ctx.beginPath(); ctx.moveTo(x1 - nx * off, y1 - ny * off); ctx.lineTo(x2 - nx * off, y2 - ny * off); ctx.stroke();
                if (dob > 0.02) {
                    ctx.globalAlpha = fast * dob;
                    var k1 = 0.12;
                    ctx.beginPath();
                    ctx.moveTo(x1 + nx * off + ux * l * k1 * 0, y1 + ny * off);
                    ctx.lineTo(x2 + nx * off, y2 + ny * off);
                    ctx.stroke();
                }
                ctx.restore();
            }
        });

        /* Teksten */
        Object.keys(T.it).forEach(function (id) {
            var e = T.it[id];
            if (skjult(e) || skjul[id]) return;
            var p = P(e);
            ctx.save();
            ctx.globalAlpha = NK.klamp(e.a, 0, 1);
            /* En lys plet bag teksten, saa streger ikke skaerer bogstaverne */
            S.gruppe(ctx, e.t, e.an, p.x, p.y, f, farve[id] || INK, true);
            ctx.restore();
        });

        /* Numrene */
        if (opt.numre) {
            Object.keys(T.n).forEach(function (k) {
                if (opt.numre !== true && !opt.numre[k]) return;
                var e = T.it["C" + k];
                if (!e) return;
                /* En CH₂OH-gruppe, der ikke er tegnet, faar intet nummer */
                if ((k === "6" || (M.keto && k === "1")) && e.a < 0.5) return;
                var p = P(e), n = T.n[k];
                var egen = opt.numTekst && opt.numTekst[k];
                NK.tekst(ctx, egen || String(k), p.x + n.dx * s, p.y + n.dy * s,
                    { font: (egen ? "800 " + Math.round(f * 0.78) : "600 " + Math.round(f * 0.6)) + "px " + FONT,
                      farve: egen ? (opt.numFarve || "#2f6fde") : "#4b5565", justering: "center", linje: "middle" });
            });
        }
        ctx.restore();
        return kasser;
    };

    /* Skaermpladsen for et emne i en tilstand */
    S.punkt = function (T, id, view) {
        var e = T.it[id];
        if (!e) return null;
        return { x: view.cx + e.x * view.s, y: view.cy + e.y * view.s };
    };

    /* Midten af tegnet c (fx "O") i en gruppe, i skaermkoordinater */
    S.tegnMidt = function (kasse, c) {
        if (!kasse) return null;
        for (var i = 0; i < kasse.midter.length; i++) if (kasse.midter[i].c === c) return kasse.midter[i];
        return { x: kasse.cx, y: kasse.cy };
    };

    S.TYND = TYND;
    S.TYK = TYK;
    S.HO_DX = HO_DX;
    NK.Sukker = S;
}());

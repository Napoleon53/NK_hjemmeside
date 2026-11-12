/* =====================================================================
   formel.js - strukturformlen paa pladen, som i Kemibogens figurer

   To stilarter, som eleven skifter imellem:
     "alle"    stregformel med alle atomer (bogens funktionelle-grupper
               i 4.5): H−C−C−O−H med H over og under hvert carbonatom.
               Den funktionelle gruppe staar i en groen ramme.
     "zigzag"  zigzagformel (bogens alkoholer-syrer i 4.5): carbonatomerne
               er knaek og ender, og kun H paa oxygen skrives (OH).
               Gruppens bogstaver er groenne.

   NK.Formel.graf(stof, stil) giver atomerne (med plads i enheder af en
   bindingslaengde), bindingerne og grupperne. NK.Formel.tegn tegner
   grafen i et felt. Molekylet staar altid med gruppen til hoejre.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SKRIFT = "'Segoe UI', sans-serif";

    var BLAEK = "#1f2430";
    var GROEN = "#0f766e";
    var GROEN_BUND = "rgba(15, 118, 110, 0.09)";

    /* ----- Grafen ----------------------------------------------------------------------- */
    function Graf() { this.atomer = []; this.bindinger = []; this.grupper = []; this.tekst = null; }
    Graf.prototype.atom = function (s, x, y, valg) {
        var a = { s: s, x: x, y: y };
        if (valg) for (var k in valg) if (Object.prototype.hasOwnProperty.call(valg, k)) a[k] = valg[k];
        this.atomer.push(a);
        return this.atomer.length - 1;
    };
    Graf.prototype.bind = function (a, b, orden) { this.bindinger.push({ a: a, b: b, orden: orden || 1 }); };

    /* Stregformel med alle atomer */
    function alle(stof) {
        var G = new Graf(), n = stof.n, g = stof.g, i;
        if (g === "glycerol") {
            /* HO−CH₂−CH(OH)−CH₂−OH */
            var c = [];
            for (i = 0; i < 3; i++) c.push(G.atom("C", i, 0));
            G.bind(c[0], c[1]); G.bind(c[1], c[2]);
            var o1 = G.atom("O", -1, 0, { gr: true }), h1 = G.atom("H", -2, 0, { gr: true });
            G.bind(c[0], o1); G.bind(o1, h1);
            var o2 = G.atom("O", 1, -1, { gr: true }), h2 = G.atom("H", 1, -2, { gr: true });
            G.bind(c[1], o2); G.bind(o2, h2);
            var o3 = G.atom("O", 3, 0, { gr: true }), h3 = G.atom("H", 4, 0, { gr: true });
            G.bind(c[2], o3); G.bind(o3, h3);
            [[0, -1], [0, 1], [1, 1], [2, -1], [2, 1]].forEach(function (p) {
                G.bind(c[p[0]], G.atom("H", p[0], p[1]));
            });
            G.grupper = [[o1, h1], [o2, h2], [o3, h3]];
            return G;
        }
        if (n === 0) {
            /* H foran gruppen: H−H, H−O−H og H−COOH */
            var h0 = G.atom("H", 0, 0);
            if (g === "H") { G.bind(h0, G.atom("H", 1, 0)); return G; }
            if (g === "OH") {
                var ov = G.atom("O", 1, 0, { gr: true }), hv = G.atom("H", 2, 0, { gr: true });
                G.bind(h0, ov); G.bind(ov, hv);
                G.grupper = [[ov, hv]];
                return G;
            }
            return gruppe(G, h0, 1, "COOH");
        }
        var kaede = [];
        for (i = 0; i < n; i++) {
            kaede.push(G.atom("C", i, 0));
            if (i > 0) G.bind(kaede[i - 1], kaede[i]);
            G.bind(kaede[i], G.atom("H", i, -1));
            G.bind(kaede[i], G.atom("H", i, 1));
        }
        G.bind(kaede[0], G.atom("H", -1, 0));
        return gruppe(G, kaede[n - 1], n, g);
    }

    /* Gruppen for enden: x er den foerste plads efter kaeden */
    function gruppe(G, sidste, x, g) {
        if (g === "H") {
            var h = G.atom("H", x, 0, { ende: true });
            G.bind(sidste, h);
            G.ende = [h];
            return G;
        }
        if (g === "OH") {
            var o = G.atom("O", x, 0, { gr: true }), ho = G.atom("H", x + 1, 0, { gr: true });
            G.bind(sidste, o); G.bind(o, ho);
            G.grupper = [[o, ho]];
            G.ende = [o, ho];
            return G;
        }
        var c = G.atom("C", x, 0, { gr: true });
        var od = G.atom("O", x, -1, { gr: true });
        var oe = G.atom("O", x + 1, 0, { gr: true });
        var hs = G.atom("H", x + 2, 0, { gr: true });
        G.bind(sidste, c); G.bind(c, od, 2); G.bind(c, oe); G.bind(oe, hs);
        G.grupper = [[c, od, oe, hs]];
        G.ende = [c, od, oe, hs];
        return G;
    }

    /* Zigzagformel. Carbonatomerne er knaek uden bogstav. Et knaek opad har
       y = −0,5 og et nedad y = 0. Carboxylcarbonatomet staar altid oppe, saa
       =O peger lige op som i bogen. */
    var DX = Math.sqrt(3) / 2;
    function zigzag(stof) {
        var G = new Graf(), n = stof.n, g = stof.g, i;
        if (g === "glycerol") {
            /* HO/\/OH med OH op fra det midterste carbonatom */
            var ho = G.atom("O", 0, 0, { gr: true, etiket: "HO" });
            var c = [G.atom("C", DX, -0.5), G.atom("C", 2 * DX, 0), G.atom("C", 3 * DX, -0.5)];
            var om = G.atom("O", 2 * DX, 1, { gr: true, etiket: "OH" });
            var oh = G.atom("O", 4 * DX, 0, { gr: true, etiket: "OH" });
            G.bind(ho, c[0]); G.bind(c[0], c[1]); G.bind(c[1], c[2]); G.bind(c[2], oh); G.bind(c[1], om);
            G.grupper = [[ho], [om], [oh]];
            return G;
        }
        if (n === 0) {
            if (g === "H") { G.tekst = "H₂"; return G; }
            if (g === "OH") { G.tekst = "H₂O"; G.grupper = []; return G; }
            /* H−C(=O)−OH */
            var hh = G.atom("H", 0, 0, { etiket: "H" });
            var cs = G.atom("C", DX, -0.5, { gr: true });
            var od0 = G.atom("O", DX, -1.5, { gr: true, etiket: "O" });
            var oe0 = G.atom("O", 2 * DX, 0, { gr: true, etiket: "OH" });
            G.bind(hh, cs); G.bind(cs, od0, 2); G.bind(cs, oe0);
            G.grupper = [[cs, od0, oe0]];
            G.ende = [cs, od0, oe0];
            return G;
        }
        if (g === "H" && n === 1) { G.tekst = "CH₄"; G.ende = []; return G; }
        /* Hvor skal kaeden begynde (op eller ned), saa det sidste knaek passer? */
        var opSidst = g === "COOH";
        /* Plads j (0, 1, 2 ...) er oppe, naar (j + start) er ulige */
        var start = 0;
        if (opSidst && ((n + start) % 2 === 0)) start = 1;
        function y(j) { return (j + start) % 2 === 1 ? -0.5 : 0; }
        var kaede = [];
        for (i = 0; i < n; i++) {
            kaede.push(G.atom("C", i * DX, y(i)));
            if (i > 0) G.bind(kaede[i - 1], kaede[i]);
        }
        var sidste = kaede[n - 1];
        if (g === "H") { G.ende = [sidste]; return G; }
        if (g === "OH") {
            var o = G.atom("O", n * DX, y(n), { gr: true, etiket: "OH" });
            G.bind(sidste, o);
            G.grupper = [[o]];
            G.ende = [o];
            return G;
        }
        var cc = G.atom("C", n * DX, y(n), { gr: true });
        var od = G.atom("O", n * DX, y(n) - 1, { gr: true, etiket: "O" });
        var oe = G.atom("O", (n + 1) * DX, y(n + 1), { gr: true, etiket: "OH" });
        G.bind(sidste, cc); G.bind(cc, od, 2); G.bind(cc, oe);
        G.grupper = [[cc, od, oe]];
        G.ende = [cc, od, oe];
        return G;
    }

    function graf(stof, stil) { return stil === "zigzag" ? zigzag(stof) : alle(stof); }

    /* Grafens kasse i enheder (bogstaverne regnes som en halv enhed brede) */
    function kasse(G) {
        if (!G.atomer.length) return { x0: -0.6, x1: 0.6, y0: -0.4, y1: 0.4 };
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        G.atomer.forEach(function (a) {
            var bx = a.etiket && a.etiket.length > 1 ? 0.5 : 0.28;
            var vx0 = a.etiket === "HO" ? 0.5 : bx, vx1 = a.etiket === "HO" ? 0.28 : bx;
            x0 = Math.min(x0, a.x - vx0); x1 = Math.max(x1, a.x + vx1);
            y0 = Math.min(y0, a.y - 0.3); y1 = Math.max(y1, a.y + 0.3);
        });
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
    }

    /* Skala og plads, saa grafen staar midt i feltet R. maksSkala i px pr. enhed. */
    function placer(G, R, maksSkala) {
        var k = kasse(G);
        var s = Math.min((R.b - 16) / Math.max(0.1, k.x1 - k.x0), (R.h - 12) / Math.max(0.1, k.y1 - k.y0), maksSkala);
        var ox = R.x + R.b / 2 - (k.x0 + k.x1) / 2 * s;
        var oy = R.y + R.h / 2 - (k.y0 + k.y1) / 2 * s;
        return { s: s, ox: ox, oy: oy, k: k };
    }

    function px(p, a) { return { x: p.ox + a.x * p.s, y: p.oy + a.y * p.s }; }

    /* Har atomet et bogstav paa tegningen? */
    function harBogstav(a, stil) { return stil !== "zigzag" || a.s !== "C" || !!a.etiket; }

    /* Den firkant, gruppen (eller enden af en alkan) fylder, i px */
    function gruppeRekt(G, p, idx, stil) {
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        idx.forEach(function (i) {
            var a = G.atomer[i], q = px(p, a);
            var halvB = (a.etiket && a.etiket.length > 1 ? 0.62 : 0.3) * p.s;
            if (stil === "zigzag" && a.s === "C" && !a.etiket) halvB = 0.12 * p.s;
            var vx0 = a.etiket === "HO" ? halvB * 1.05 : halvB * (a.etiket === "OH" ? 0.42 : 1);
            var vx1 = a.etiket === "OH" ? halvB * 1.05 : halvB * (a.etiket === "HO" ? 0.42 : 1);
            x0 = Math.min(x0, q.x - vx0); x1 = Math.max(x1, q.x + vx1);
            y0 = Math.min(y0, q.y - 0.3 * p.s); y1 = Math.max(y1, q.y + 0.3 * p.s);
        });
        return { x: x0, y: y0, b: x1 - x0, h: y1 - y0 };
    }

    /* ----- Tegningen ----------------------------------------------------------------------
       valg: stil, maksSkala, alfa, skjulGruppe (rammen tegnes ikke), ring
       (enden lyser gult: her kan en gruppe slippes). Giver pladsen tilbage
       (p) og enden i px, saa pladen kan finde maalet for traekket. */
    function tegn(ctx, stof, R, valg) {
        valg = valg || {};
        var stil = valg.stil || "alle";
        var G = graf(stof, stil);
        var p = placer(G, R, valg.maksSkala || 46);
        var s = p.s;
        ctx.save();
        if (valg.alfa !== undefined) ctx.globalAlpha *= valg.alfa;

        if (G.tekst) {
            ctx.font = "700 " + Math.round(Math.min(46, R.h * 0.42)) + "px " + SKRIFT;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = stof.g === "OH" ? GROEN : BLAEK;
            ctx.fillText(G.tekst, R.x + R.b / 2, R.y + R.h / 2);
            ctx.restore();
            var tb = Math.min(46, R.h * 0.42) * 1.6;
            return { p: p, ende: { x: R.x + R.b / 2 - tb / 2, y: R.y + R.h / 2 - tb / 3, b: tb, h: tb * 0.66 }, graf: G };
        }

        var skrift = Math.max(13, Math.min(30, s * 0.5));
        if (stil === "zigzag") skrift = Math.max(14, Math.min(30, s * 0.42));

        /* Rammen om hver gruppe (kun i stregformlen, som bogens figur) */
        if (stil !== "zigzag" && !valg.skjulGruppe) {
            G.grupper.forEach(function (idx) {
                var r = gruppeRekt(G, p, idx, stil);
                var luft = 0.18 * s;
                NK.rundtRekt(ctx, r.x - luft, r.y - luft * 0.7, r.b + 2 * luft, r.h + 1.4 * luft, Math.max(6, s * 0.2));
                ctx.fillStyle = GROEN_BUND;
                ctx.fill();
                ctx.lineWidth = 1.6;
                ctx.strokeStyle = GROEN;
                ctx.stroke();
            });
        }

        /* Bindingerne: afkortet ved et bogstav */
        var afk = skrift * 0.62;
        ctx.lineCap = "round";
        G.bindinger.forEach(function (bd) {
            var A = G.atomer[bd.a], B = G.atomer[bd.b];
            var a = px(p, A), b = px(p, B);
            var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            var ux = dx / l, uy = dy / l;
            var ka = harBogstav(A, stil) ? afk * (A.etiket === "OH" && ux < 0 ? 0.9 : 1) : 0;
            var kb = harBogstav(B, stil) ? afk : 0;
            if (B.etiket === "HO" || A.etiket === "HO") { if (A.etiket === "HO") ka = afk; }
            var x1 = a.x + ux * ka, y1 = a.y + uy * ka, x2 = b.x - ux * kb, y2 = b.y - uy * kb;
            ctx.strokeStyle = (A.gr && B.gr) ? GROEN : BLAEK;
            ctx.lineWidth = Math.max(1.8, s * 0.055);
            if (bd.orden === 2) {
                var ox = -uy * s * 0.07, oy = ux * s * 0.07;
                ctx.beginPath();
                ctx.moveTo(x1 + ox, y1 + oy); ctx.lineTo(x2 + ox, y2 + oy);
                ctx.moveTo(x1 - ox, y1 - oy); ctx.lineTo(x2 - ox, y2 - oy);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        });

        /* Bogstaverne */
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        G.atomer.forEach(function (A) {
            if (!harBogstav(A, stil)) return;
            var q = px(p, A);
            ctx.font = "700 " + Math.round(skrift) + "px " + SKRIFT;
            ctx.fillStyle = A.gr ? GROEN : BLAEK;
            if (A.etiket === "OH") {
                var bO = ctx.measureText("O").width;
                ctx.textAlign = "center";
                ctx.fillText("O", q.x, q.y + 1);
                ctx.textAlign = "left";
                ctx.fillText("H", q.x + bO / 2, q.y + 1);
                ctx.textAlign = "center";
            } else if (A.etiket === "HO") {
                var bO2 = ctx.measureText("O").width;
                ctx.fillText("O", q.x, q.y + 1);
                ctx.textAlign = "right";
                ctx.fillText("H", q.x - bO2 / 2, q.y + 1);
                ctx.textAlign = "center";
            } else {
                ctx.fillText(A.etiket || A.s, q.x, q.y + 1);
            }
        });
        ctx.restore();

        var ende = null;
        if (G.ende && G.ende.length) ende = gruppeRekt(G, p, G.ende, stil);
        return { p: p, ende: ende, graf: G };
    }

    NK.Formel = { graf: graf, tegn: tegn, kasse: kasse, placer: placer, BLAEK: BLAEK, GROEN: GROEN };
}());

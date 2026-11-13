/* =====================================================================
   lup.js - mikroniveauet i lupperne

   NK.MgLup: overfladen af magnesiumbaandet og luften, som i bogens figur
   mg-trin (8.1). To magnesiumatomer og ét dioxygenmolekyle. Hvert
   magnesiumatom har sine 2 yderste elektroner tegnet som smaa blaa kugler
   (de andre elektroner er ikke tegnet). Forloebet har tiden t:

     0,0 - 1,2   dioxygenmolekylet deles, og de to oxygenatomer kommer ned
                 over hvert sit magnesiumatom
     1,2 - 3,6   elektronerne overfoeres i en blaa bue fra magnesium til
                 oxygen, 2 til hvert oxygenatom ("2 e⁻" ved buen)
     3,4 - 4,4   atomerne bliver til ioner: Mg²⁺ roed og mindre, O²⁻ blaa
                 og stoerre (elektronerne er nu en del af oxidionen)
     4,4 - 5,4   ionerne lægger sig i et iongitter, og metallet forsvinder
     T_SLUT      efter: iongitteret som i bogens mg-trin-3

   NK.HclLup: syre/base-reaktionen HCl + H₂O, som i bogens figur 7.2. Det
   hydrogenatom, der overfoeres, er orange, og dets elektron (den lille
   orange prik) bliver hos chlor. Hydronen H⁺ er mindre end atomet.

     0,0 - 0,6   ro
     0,6 - 2,2   hydronen overfoeres i en orange bue fra HCl til H₂O
     1,8 - 2,8   Cl bliver til Cl⁻ (blaa), H₂O til H₃O⁺ (roed)
     H_SLUT      efter

   Positionerne er i enheder af luppens radius (MgLup) eller halve hoejde
   (HclLup), saa luppen kan tegnes i alle stoerrelser.

   Elektronprikker (opt.prikker, kontakten paa fane 3, brugeren 13. nov.
   2026): de yderste elektroner som smaa prikker i par inden i kuglerne,
   saa de ikke roerer naboerne. Oxygen har 6 (i dioxygen er 4 af dem
   faelles), magnesium 2 (dem, der overfoeres), og bagefter har O²⁻ 8 og
   Mg²⁺ ingen. I saltsyre-luppen har chlor og oxygen 8, og hydrogenatomets
   egen elektron er orange og bliver hos chlor. Uden prikker er den
   elektron en lille orange kugle, og de overfoerte elektroner fra
   magnesium er blaa kugler med minus.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Tg = NK.Tegn;
    var F = Tg.FARVE;

    function blod(t) { t = NK.klamp(t, 0, 1); return t * t * (3 - 2 * t); }
    function del(t, a, b) { return NK.klamp((t - a) / (b - a), 0, 1); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    /* ----- Elektronprikkerne ----------------------------------------------------- */
    function prik(ctx, x, y, r, farve) {
        ctx.save();
        var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, farve === "o" ? "#ffd29a" : "#a9c4ff");
        g.addColorStop(1, farve === "o" ? "#c8650e" : "#1f4bb0");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    /* De to prikker i et par: midten (mx, my), retningen v ud fra kernen, afstanden d mellem dem */
    function parPunkter(mx, my, v, d) {
        var px = -Math.sin(v) * d / 2, py = Math.cos(v) * d / 2;
        return [{ x: mx + px, y: my + py }, { x: mx - px, y: my - py }];
    }
    /* Et par inden i en kugle: centrum (x, y), radius r, vinkel v */
    function parIKugle(x, y, r, v) {
        return parPunkter(x + Math.cos(v) * r * 0.78, y + Math.sin(v) * r * 0.78, v, r * 0.34);
    }
    var OP = -Math.PI / 2, NED = Math.PI / 2, VE = Math.PI, HO = 0;

    /* ================================================================ */
    var MG = {
        T_SLUT: 5.6,
        mg: [{ x: -0.31, y: 0.40 }, { x: 0.31, y: 0.40 }], rMg: 0.27,
        mgKant: [{ x: -0.93, y: 0.40 }, { x: 0.93, y: 0.40 }, { x: -0.62, y: 0.93 }, { x: 0, y: 0.93 }, { x: 0.62, y: 0.93 }],
        o2: [{ x: -0.13, y: -0.56 }, { x: 0.13, y: -0.56 }], rO: 0.16,
        oNed: [{ x: -0.31, y: -0.34 }, { x: 0.31, y: -0.34 }],
        rMg2: 0.19, rO2: 0.27,
        /* efter: et iongitter, hvor de to midterste par er dem fra reaktionen */
        gitter: 0.25,
        overflade: 0.16
    };

    /* Elektron j (0 eller 1) paa magnesiumatom i: hvor den sidder foer og efter */
    function eStart(i, j) {
        var m = MG.mg[i], v = -Math.PI / 2 + (j ? 0.42 : -0.42);
        return { x: m.x + Math.cos(v) * MG.rMg * 0.98, y: m.y + Math.sin(v) * MG.rMg * 0.98 };
    }
    function eSlut(i, j) {
        var o = MG.oNed[i], v = Math.PI / 2 + (j ? -0.5 : 0.5);
        return { x: o.x + Math.cos(v) * MG.rO * 1.05, y: o.y + Math.sin(v) * MG.rO * 1.05 };
    }
    function eTid(j) { return 1.2 + j * 0.85; }   /* elektron j begynder; turen tager 1,4 s */
    var E_TUR = 1.4;

    /* Buens bugt: elektronerne fra det venstre atom bugter ud til venstre */
    function eBuk(i) { return i === 0 ? 0.13 : -0.13; }

    /* t: tiden i forloebet. cx, cy: midten, R: enheden i pixels.
       opt.metal: tegn metallet (fane 1: baandet; fane 3 ogsaa).
       opt.etiketter: "2 e⁻" ved buerne. opt.halv: luppens halve bredde i
       enheder af R (1 for den runde lup, mere for et bredt vindue) */
    function tegnMg(ctx, cx, cy, R, t, opt) {
        opt = opt || {};
        var halv = opt.halv || 1;
        function P(p) { return { x: cx + p.x * R, y: cy + p.y * R }; }
        var omdan = blod(del(t, 3.4, 4.4));      /* atomer -> ioner */
        var pr = NK.klamp(R * 0.024, 2.4, 6);   /* elektronprikkernes radius */
        var gitter = blod(del(t, 4.4, 5.4));     /* reaktionen -> iongitteret */
        var reak = 1 - gitter;

        /* Metallet: en graa flade under overfladen med flere magnesiumatomer */
        if (reak > 0.01) {
            ctx.save();
            ctx.globalAlpha *= reak;
            var ys = cy + MG.overflade * R;
            var g = ctx.createLinearGradient(0, ys, 0, cy + R);
            g.addColorStop(0, "#c9d0d8");
            g.addColorStop(1, "#aeb6c1");
            ctx.fillStyle = g;
            ctx.fillRect(cx - R * (halv + 0.1), ys, R * 2 * (halv + 0.1), R * 1.1);
            ctx.strokeStyle = "#8e98a5";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - R * (halv + 0.1), ys);
            ctx.lineTo(cx + R * (halv + 0.1), ys);
            ctx.stroke();
            MG.mgKant.forEach(function (p) {
                var q = P(p);
                Tg.partikel(ctx, q.x, q.y, MG.rMg * R, F.atom, "Mg", 0.9);
            });
            /* et bredt vindue faar flere atomer i metallet */
            for (var n = 2; n * 0.62 - 0.31 < halv + 0.3; n++) {
                [-1, 1].forEach(function (side) {
                    var q1 = P({ x: side * (n * 0.62 - 0.31), y: 0.40 }), q2 = P({ x: side * n * 0.62, y: 0.93 });
                    Tg.partikel(ctx, q1.x, q1.y, MG.rMg * R, F.atom, "Mg", 0.9);
                    Tg.partikel(ctx, q2.x, q2.y, MG.rMg * R, F.atom, "Mg", 0.9);
                });
            }
            ctx.restore();
        }

        /* Iongitteret efter: et skakbræt af Mg²⁺ og O²⁻ */
        if (gitter > 0.01) {
            ctx.save();
            ctx.globalAlpha *= gitter;
            var a = MG.gitter;
            var nx = Math.ceil(halv / (2 * a)) + 1;
            for (var ix = -nx; ix <= nx + 1; ix++) {
                for (var iy = -2; iy <= 3; iy++) {
                    var x = (ix - 0.5) * 2 * a, y = (iy - 0.5) * 2 * a;
                    if (halv <= 1 && Math.hypot(x, y) > 1.35) continue;
                    if (Math.abs(x) > halv + 0.35 || Math.abs(y) > 1.35) continue;
                    var plus = ((ix + iy) % 2 + 2) % 2 === 0;
                    var midt = (ix === 0 || ix === 1) && (iy === 0 || iy === 1);
                    var q = P({ x: x, y: y });
                    if (plus) Tg.partikel(ctx, q.x, q.y, MG.rMg2 * R, F.plus, "Mg^{2+}", midt ? 1 : 0.8);
                    else {
                        Tg.partikel(ctx, q.x, q.y, MG.rO2 * R, F.minus, "O^{2−}", midt ? 1 : 0.8);
                        if (opt.prikker) [OP, VE, HO, NED].forEach(function (v) {
                            parIKugle(q.x, q.y, MG.rO2 * R, v).forEach(function (pp) { prik(ctx, pp.x, pp.y, pr, "b"); });
                        });
                    }
                }
            }
            ctx.restore();
        }
        if (reak <= 0.01) return;

        ctx.save();
        ctx.globalAlpha *= reak;
        /* Magnesiumatomerne -> magnesiumioner */
        MG.mg.forEach(function (m, i) {
            var q = P(m);
            var r = lerp(MG.rMg, MG.rMg2, omdan) * R;
            var farve = Tg.blandHex(F.atom, F.plus, omdan);
            Tg.partikel(ctx, q.x, q.y, r, farve, omdan > 0.5 ? "Mg^{2+}" : "Mg");
            void i;
        });
        /* Oxygenatomerne: foerst samlet i dioxygen, saa ned over magnesium */
        var ned = blod(del(t, 0.2, 1.2));
        [0, 1].forEach(function (i) {
            var p = { x: lerp(MG.o2[i].x, MG.oNed[i].x, ned), y: lerp(MG.o2[i].y, MG.oNed[i].y, ned) };
            var q = P(p);
            var r = lerp(MG.rO, MG.rO2, omdan) * R;
            var farve = Tg.blandHex(F.atom, F.minus, omdan);
            Tg.partikel(ctx, q.x, q.y, r, farve, omdan > 0.5 ? "O^{2−}" : "O");
            if (opt.prikker) oPrikker(ctx, i, q, r, ned, P, pr);
        });
        /* Buerne og elektronerne */
        var er = Math.max(4, R * 0.055);
        [0, 1].forEach(function (i) {
            var a0 = P(eStart(i, 0)), b0 = P(eSlut(i, 0));
            var vis = del(t, 1.0, 1.4) * (1 - del(t, 3.6, 4.2));
            if (vis > 0.01) {
                var a = P({ x: MG.mg[i].x, y: MG.mg[i].y - MG.rMg * 1.02 });
                var b = P({ x: MG.oNed[i].x, y: MG.oNed[i].y + MG.rO * 1.25 });
                Tg.buePil(ctx, a, b, eBuk(i) * R, Tg.E, Math.max(2, R * 0.02), 1, 0.85 * vis);
                if (opt.etiketter !== false) {
                    var k = Tg.buePunkt(a, b, eBuk(i) * R, 0.5);
                    var side = i === 0 ? -1 : 1;
                    ctx.save();
                    ctx.globalAlpha *= vis;
                    Tg.formel(ctx, "2 e^−", k.x + side * R * 0.17, k.y, Math.round(NK.klamp(R * 0.085, 11, 22)), { farve: Tg.E });
                    ctx.restore();
                }
            }
            void a0; void b0;
            [0, 1].forEach(function (j) {
                var s = del(t, eTid(j), eTid(j) + E_TUR);
                var fra = P(eStart(i, j)), til = P(eSlut(i, j));
                if (opt.prikker) {
                    /* prikkerne ender som det fjerde par nederst i oxidionen */
                    var o = P(MG.oNed[i]), rNu = lerp(MG.rO, MG.rO2, omdan) * R;
                    til = parIKugle(o.x, o.y, s < 1 ? MG.rO * R : rNu, NED)[j];
                    var pp = s <= 0 ? fra : (s >= 1 ? til : Tg.buePunkt(fra, til, eBuk(i) * R * 1.1, blod(s)));
                    prik(ctx, pp.x, pp.y, pr, "b");
                    return;
                }
                var p = s <= 0 ? fra : Tg.buePunkt(fra, til, eBuk(i) * R * 1.1, blod(s));
                var alfa = 1 - del(t, 3.6, 4.2);
                if (alfa > 0.01) Tg.elektron(ctx, p.x, p.y, er, alfa);
            });
        });
        ctx.restore();
    }

    /* Oxygenatom i's egne 6 yderste elektroner. I dioxygen (ned = 0) er 2 par
       ude paa ydersiden og 2 prikker i hvert af de to faelles par mellem
       atomerne; som frit atom (ned = 1) 3 par: oppe, ude og inde. Det fjerde
       par nederst kommer fra magnesium. q: atomets midte, r: radius i pixels */
    function oPrikker(ctx, i, q, r, ned, P, pr) {
        var ud = i === 0 ? VE : HO, ind = i === 0 ? HO : VE, side = i === 0 ? -1 : 1;
        var i2 = P(MG.o2[i]), rO = MG.rO;
        /* i dioxygen, i pixels i forhold til atomets plads i dioxygen */
        var lp1 = parIKugle(i2.x, i2.y, r, ud + 1.15 * side);
        var lp2 = parIKugle(i2.x, i2.y, r, ud - 1.15 * side);
        var midtX = P({ x: 0, y: 0 }).x + side * r * 0.17, dy = r * 0.42;
        var A = [lp1[0], lp1[1], lp2[0], lp2[1], { x: midtX, y: i2.y - dy }, { x: midtX, y: i2.y + dy }];
        /* som frit atom, i forhold til atomets plads nu */
        var top = parIKugle(q.x, q.y, r, OP), u = parIKugle(q.x, q.y, r, ud), ii = parIKugle(q.x, q.y, r, ind);
        var B = [top[0], top[1], u[0], u[1], ii[0], ii[1]];
        void rO;
        A.forEach(function (a, k) {
            prik(ctx, lerp(a.x, B[k].x, ned), lerp(a.y, B[k].y, ned), pr, "b");
        });
    }

    /* Hvor maa man klikke (fane 3): hele luppen. Fase-tekst til luppen */
    function fase(t) {
        if (t <= 0.001) return "foer";
        if (t >= MG.T_SLUT) return "efter";
        return "braender";
    }

    NK.MgLup = { tegn: tegnMg, T_SLUT: MG.T_SLUT, fase: fase, MG: MG };

    /* ================================================================ */
    var HC = {
        H_SLUT: 3.0,
        cl: { x: -0.62, y: 0.02 }, rCl: 0.30,
        h: { x: -0.26, y: 0.02 }, rH: 0.16, rHyd: 0.125,
        o: { x: 0.48, y: 0.06 }, rO: 0.26,
        hv: [{ x: 0.66, y: 0.32 }, { x: 0.30, y: 0.33 }], rHv: 0.15,
        hNy: { x: 0.40, y: -0.22 }
    };

    function tegnHcl(ctx, cx, cy, u, t, opt) {
        opt = opt || {};
        function P(p) { return { x: cx + p.x * u, y: cy + p.y * u }; }
        var tur = blod(del(t, 0.6, 2.2));
        var ion = blod(del(t, 1.8, 2.8));
        /* Vandmolekylet -> oxoniumionen (O bliver roed) */
        HC.hv.forEach(function (h) { var q = P(h); Tg.partikel(ctx, q.x, q.y, HC.rHv * u, F.h, "H"); });
        var qo = P(HC.o);
        Tg.partikel(ctx, qo.x, qo.y, HC.rO * u, Tg.blandHex(F.atom, F.plus, ion), "O");
        /* Chlor -> chloridion (blaa) */
        var qc = P(HC.cl);
        Tg.partikel(ctx, qc.x, qc.y, HC.rCl * u, Tg.blandHex(F.atom, F.minus, ion), "Cl");
        /* Hydrogenatomets elektron: bliver hos chlor */
        var ex = P({ x: HC.cl.x + HC.rCl * 0.98, y: HC.cl.y - 0.02 });
        /* Hydrogenatomet / hydronen paa vej */
        var a = P(HC.h), b = P(HC.hNy);
        var pa = Tg.buePunkt(a, b, -0.55 * u, tur);
        var r = lerp(HC.rH, HC.rHyd, del(t, 0.6, 0.9)) * u;
        var pr = NK.klamp(u * 0.028, 2.2, 5);
        if (tur > 0.02 && tur < 0.98) {
            Tg.buePil(ctx, P({ x: HC.h.x, y: HC.h.y - HC.rH * 1.2 }), P({ x: HC.hNy.x - 0.08, y: HC.hNy.y - 0.12 }), -0.5 * u, Tg.HYDRON, Math.max(2, u * 0.022), 1, 0.85);
            if (opt.etiketter !== false) {
                var k = Tg.buePunkt(a, b, -0.55 * u, 0.5);
                Tg.formel(ctx, "H^+", k.x, k.y - u * 0.16, Math.round(NK.klamp(u * 0.11, 11, 22)), { farve: Tg.HYDRON });
            }
        }
        /* Det, der overfoeres, er en hydron, H⁺ (brugeren 13. nov. 2026). Den er
           mindre end hydrogenatomet, og naar den sidder paa vandet, er den et H i H₃O⁺ */
        if (opt.prikker) vandPrikker(ctx, P, u, tur, pr);
        Tg.partikel(ctx, pa.x, pa.y, r, F.hydron, tur > 0.01 && tur < 0.97 ? "H^+" : "H", 1, "#4a2506");
        if (opt.prikker) chlorPrikker(ctx, P, u, tur, pr);
        else Tg.kugle(ctx, ex.x, ex.y, Math.max(3, u * 0.035), F.hydron);
        /* Navnene under partiklerne: foer og efter reaktionen */
        if (opt.navne !== false) {
            var px = Math.round(NK.klamp(u * 0.12, 11, 20)), y = cy + u * 0.62;
            if (ion < 0.5) {
                Tg.formel(ctx, "HCl", cx + (HC.cl.x + HC.h.x) / 2 * u, y, px, { farve: "#3a4250" });
                Tg.formel(ctx, "H_2O", qo.x, y, px, { farve: "#3a4250" });
            } else {
                Tg.formel(ctx, "Cl^−", qc.x, y, px, { farve: Tg.RED });
                Tg.formel(ctx, "H_3O^+", qo.x, y, px, { farve: "#b0402a" });
            }
        }
    }

    /* Elektronparrene i HCl og H₂O. Bindingsparret mellem Cl og H har chlors
       egen elektron (blaa) og hydrogenatomets (orange); det bliver hos chlor.
       Vandets ledige par paa den side, hydronen kommer fra, bliver til
       bindingen til hydronen. */
    function chlorPrikker(ctx, P, u, tur, pr) {
        var c = P(HC.cl), rc = HC.rCl * u;
        [VE, OP, NED].forEach(function (v) { parIKugle(c.x, c.y, rc, v).forEach(function (p) { prik(ctx, p.x, p.y, pr, "b"); }); });
        var bind = parPunkter(c.x + rc * 0.9, c.y, HO, rc * 0.34), hjem = parIKugle(c.x, c.y, rc, HO);
        prik(ctx, lerp(bind[0].x, hjem[0].x, tur), lerp(bind[0].y, hjem[0].y, tur), pr, "b");
        prik(ctx, lerp(bind[1].x, hjem[1].x, tur), lerp(bind[1].y, hjem[1].y, tur), pr, "o");
    }

    function vandPrikker(ctx, P, u, tur, pr) {
        var o = P(HC.o), ro = HC.rO * u;
        function mod(h) { var q = P(h); return Math.atan2(q.y - o.y, q.x - o.x); }
        [mod(HC.hv[0]), mod(HC.hv[1])].forEach(function (v) {
            parPunkter(o.x + Math.cos(v) * ro * 0.9, o.y + Math.sin(v) * ro * 0.9, v, ro * 0.34).forEach(function (p) { prik(ctx, p.x, p.y, pr, "b"); });
        });
        var vNy = mod(HC.hNy);
        parPunkter(o.x + Math.cos(vNy) * ro * lerp(0.78, 0.9, tur), o.y + Math.sin(vNy) * ro * lerp(0.78, 0.9, tur), vNy, ro * 0.34).forEach(function (p) { prik(ctx, p.x, p.y, pr, "b"); });
        parIKugle(o.x, o.y, ro, -0.35).forEach(function (p) { prik(ctx, p.x, p.y, pr, "b"); });
    }

    function faseHcl(t) {
        if (t <= 0.001) return "foer";
        if (t >= HC.H_SLUT) return "efter";
        return "braender";
    }

    NK.HclLup = { tegn: tegnHcl, H_SLUT: HC.H_SLUT, fase: faseHcl, HC: HC };
}());

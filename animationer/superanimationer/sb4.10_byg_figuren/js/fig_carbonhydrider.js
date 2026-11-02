/* =====================================================================
   fig_carbonhydrider.js - figuren til B4.1 Carbonhydriders reaktioner

   Fem kort med reaktionsskemaer i zigzagformler som bogens figurer:
   substitution i propan (b4-substitution), addition af dibrom til
   but-2-en (b4-addition-fire), elimination af vand fra propan-2-ol
   (b4-elimination), dibrom og benzen (b4-benzen-substitution) og
   polyaddition af ethen. Kortenes titler er reaktionstyperne som i
   bogens b4-tre-reaktionstyper; bogens forklaringer under titlerne er
   taget af. Pladserne for stofferne sidder over molekylerne.
   Ni af afsnittets ti fagord i tre lag. makromolekyle er udeladt (se
   NK.UDELADT i data.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var KS = { x: 14, y: 26, b: 558, h: 196 }, KA = { x: 588, y: 26, b: 558, h: 196 };
    var KE = { x: 14, y: 248, b: 558, h: 196 }, KB = { x: 588, y: 248, b: 558, h: 196 };
    var KP = { x: 14, y: 470, b: 1132, h: 196 };
    var L = 34, MY = 112, NY = 176, SY = 54;            /* molekylerne, navnene og pladserne i et kort */
    function my(k) { return k.y + MY; }

    /* Kort S: propan + Br₂ → 1-brompropan + HBr */
    var S_PROPAN = ORG.zz(KS.x + 42, my(KS) + 8, 3, L, -30);
    var S_BROM = ORG.zz(KS.x + 300, my(KS) + 8, 4, L, -30);
    var S_PIL = [KS.x + 205, KS.x + 272];
    /* Kort A: but-2-en + Br₂ → 2,3-dibrombutan */
    var A_BUTEN = ORG.zz(KA.x + 70, my(KA) + 8, 4, L, -30);
    var A_DIBROM = ORG.zz(KA.x + 345, my(KA) + 8, 4, L, -30);
    var A_PIL = [KA.x + 252, KA.x + 318];
    /* Kort E: propan-2-ol → propen + H₂O */
    var E_C = [KE.x + 95, my(KE) - 4];
    var E_PROPEN = ORG.zz(KE.x + 292, my(KE) + 8, 3, L, -30);
    var E_PIL = [KE.x + 168, KE.x + 252];
    /* Kort B: benzen + Br₂ → brombenzen + HBr */
    var B_BENZEN = [KB.x + 110, my(KB) + 6], B_BROM = [KB.x + 375, my(KB) + 12], R6 = 26;
    var B_PIL = [KB.x + 232, KB.x + 312];
    /* Kort P: n CH₂=CH₂ → polyethen */
    var P_ETHEN = [KP.x + 260, my(KP)];
    var P_PIL = [KP.x + 380, KP.x + 470];
    var P_KAEDE = ORG.zz(KP.x + 520, my(KP) + 8, 15, 30, -30);
    var P_MIDT = (P_KAEDE[0][0] + P_KAEDE[14][0]) / 2;

    function boksOm(P, ekstraTop, ekstraBund) {
        var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        return [x0 - 16, y0 - 16 - (ekstraTop || 0), x1 - x0 + 32, y1 - y0 + 32 + (ekstraTop || 0) + (ekstraBund || 0)];
    }
    var BOKS_BROM = boksOm(S_BROM, 12, 0);
    BOKS_BROM[2] += 14;
    var BOKS_BUTEN = boksOm(A_BUTEN, 0, 0);
    var BOKS_BENZEN = [B_BENZEN[0] - R6 - 12, B_BENZEN[1] - R6 - 12, 2 * R6 + 24, 2 * R6 + 24];
    var BOKS_KAEDE = boksOm(P_KAEDE, 0, 0);
    BOKS_KAEDE[0] -= 22; BOKS_KAEDE[2] += 44;

    /* Kortets titel sidder paa overkanten; side er "v", "m" eller "h", saa
       titlen ikke staar lige over en plads inde i kortet */
    function titel(id, k, side, dele, fejl) {
        var x = side === "v" ? k.x + 118 : (side === "h" ? k.x + k.b - 118 : k.x + k.b / 2);
        return { id: id, ord: [id], x: x, y: k.y, maal: [x, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18], tom: true }], fejl: fejl };
    }
    function over(id, x, k, boks, dele, fejl) {
        return { id: id, ord: [id], x: x, y: k.y + SY, maal: [x, boks[1] - 2], dele: dele,
            omr: [{ r: [boks[0], boks[1], boks[2], boks[3], 12] }], fejl: fejl };
    }

    NK.FIGURER.carbonhydrider = {
        vb: [1160, 680],
        lag: [
            { navn: "Substitution og addition", pladser: ["substitution", "halogenalkan", "addition", "umættet"],
              ros: "Ved en substitution bliver et H skiftet ud med Br. Et umættet stof reagerer ved addition, og to stoffer bliver til ét." },
            { navn: "Elimination og benzen", pladser: ["elimination", "aromatisk"],
              ros: "Ved en elimination dannes C=C, og ét stof bliver til to. Benzen er aromatisk og reagerer ved substitution." },
            { navn: "Plast", pladser: ["polyaddition", "monomer", "polymer"],
              ros: "Ved polyaddition bliver tusindvis af monomerer sat sammen til én polymer." }
        ],
        pladser: [
            titel("substitution", KS, "v", ["pilS"], {
                addition: "<b>addition</b> åbner en dobbeltbinding. Propan har kun enkeltbindinger, og et H bliver skiftet ud med Br.",
                elimination: "<b>elimination</b> danner en dobbeltbinding, og ét stof bliver til to. Her bliver to stoffer til to nye.",
                polyaddition: "<b>polyaddition</b> sætter tusindvis af molekyler sammen. Her bliver et H i propan skiftet ud med Br.",
                halogenalkan: "<b>halogenalkan</b> er et stof. Kortets titel er navnet på reaktionen, hvor et H bliver skiftet ud med Br." }),
            over("halogenalkan", BOKS_BROM[0] + BOKS_BROM[2] / 2, KS, BOKS_BROM, ["brom"], {
                substitution: "<b>substitution</b> er navnet på reaktionen. Pladsen peger på stoffet, hvor et H er skiftet ud med Br.",
                umættet: "<b>umættet</b> siges om et stof med C=C. Stoffet her har kun enkeltbindinger og et Br på kæden.",
                aromatisk: "<b>aromatisk</b> siges om et stof med en benzenring. Pladsen peger på en kæde med et Br.",
                polymer: "<b>polymer</b> er en lang kæde af tusindvis af små molekyler. Pladsen peger på et lille stof med et Br." }),
            titel("addition", KA, "h", ["pilA"], {
                substitution: "<b>substitution</b> skifter et atom ud. Her åbner dobbeltbindingen sig, og to stoffer bliver til ét.",
                elimination: "<b>elimination</b> danner en dobbeltbinding. Her forsvinder dobbeltbindingen, og to stoffer bliver til ét.",
                polyaddition: "<b>polyaddition</b> sætter tusindvis af alkenmolekyler sammen. Her sætter ét Br₂ sig på én dobbeltbinding.",
                umættet: "<b>umættet</b> siges om et stof. Kortets titel er navnet på reaktionen, hvor dobbeltbindingen åbner sig." }),
            over("umættet", BOKS_BUTEN[0] + BOKS_BUTEN[2] / 2, KA, BOKS_BUTEN, ["buten"], {
                monomer: "<b>monomer</b> er et lille molekyle, der sættes sammen i tusindvis. Her reagerer but-2-en med ét Br₂.",
                aromatisk: "<b>aromatisk</b> siges om et stof med en benzenring. But-2-en er en kæde med en dobbeltbinding.",
                halogenalkan: "<b>halogenalkan</b> har Cl eller Br på kæden. Pladsen peger på stoffet med en dobbeltbinding.",
                addition: "<b>addition</b> er navnet på reaktionen. Pladsen peger på stoffet med dobbeltbindingen." }),

            titel("elimination", KE, "m", ["pilE"], {
                addition: "<b>addition</b> åbner en dobbeltbinding. Her dannes en dobbeltbinding, og ét stof bliver til to.",
                substitution: "<b>substitution</b> skifter et atom ud. Her fjernes OH og H fra nabocarbonatomer, og der dannes C=C.",
                polyaddition: "<b>polyaddition</b> sætter tusindvis af molekyler sammen. Her bliver ét stof til to, og der dannes C=C." }),
            over("aromatisk", B_BENZEN[0], KB, BOKS_BENZEN, ["benzen"], {
                umættet: "<b>umættet</b> siges om alkener og alkyner, der let adderer. Benzen har en særlig stabil ring og reagerer ved substitution.",
                substitution: "<b>substitution</b> er navnet på en reaktion. Pladsen peger på stoffet med benzenringen.",
                halogenalkan: "<b>halogenalkan</b> har Cl eller Br på en kæde. Pladsen peger på benzen, der er en ring uden brom.",
                monomer: "<b>monomer</b> sættes sammen til en lang kæde. Pladsen peger på benzen, der reagerer med ét Br₂." }),

            titel("polyaddition", KP, "h", ["pilP"], {
                addition: "<b>addition</b> passer på én dobbeltbinding. Her åbner tusindvis af dobbeltbindinger sig, og ethen bliver til én kæde.",
                polymer: "<b>polymer</b> er kæden, der dannes. Kortets titel er navnet på reaktionen.",
                monomer: "<b>monomer</b> er det lille molekyle. Kortets titel er navnet på reaktionen.",
                substitution: "<b>substitution</b> skifter et atom ud. Her bliver tusindvis af ethenmolekyler sat sammen til én kæde." }),
            over("monomer", P_ETHEN[0], KP, [P_ETHEN[0] - 72, my(KP) - 20, 144, 40], ["ethen"], {
                umættet: "<b>umættet</b> passer også på ethen. Pladsen spørger om ethens rolle: det lille molekyle, der sættes sammen i tusindvis.",
                polymer: "<b>polymer</b> er den lange kæde. Pladsen peger på det lille molekyle, der sættes sammen.",
                polyaddition: "<b>polyaddition</b> er navnet på reaktionen. Pladsen peger på det lille molekyle." }),
            over("polymer", P_MIDT, KP, BOKS_KAEDE, ["kaede"], {
                monomer: "<b>monomer</b> er det lille molekyle før pilen. Pladsen peger på den lange kæde efter pilen.",
                polyaddition: "<b>polyaddition</b> er navnet på reaktionen. Pladsen peger på den lange kæde, der dannes.",
                halogenalkan: "<b>halogenalkan</b> har Cl eller Br på kæden. Den lange kæde her har kun C og H." })
        ],

        tegn: function (api) {
            ORG.defs();
            function kort(g, k) { ORG.kortB(g, k.x, k.y, k.b, k.h); }
            function kaede(g, P, o) {
                o = o || {};
                var at = P.map(function (p, i) { return o.lab && o.lab[i] ? [p[0], p[1], o.lab[i][0], o.lab[i][1]] : [p[0], p[1]]; });
                var bi = [];
                for (var i = 0; i < P.length - 1; i++) bi.push([i, i + 1, (o.dobbelt || []).indexOf(i) >= 0 ? 2 : 1, (o.dobbelt || []).indexOf(i) >= 0 ? 1 : 0,
                    o.bfarve && o.bfarve[i] ? o.bfarve[i] : null]);
                (o.gren || []).forEach(function (gr) { at.push([gr[1][0], gr[1][1], gr[2], gr[3]]); bi.push([gr[0], at.length - 1, 1, 0, gr[4]]); });
                return ORG.skelet(g, at, bi);
            }
            var TEAL = { farve: F.accent };

            /* ----- Lag 1: substitution og addition ------------------------------ */
            api.del("baseS", {
                lag: 0, auto: true,
                fuld: function (g) {
                    kort(g, KS);
                    kaede(g, S_PROPAN);
                    ORG.plus(g, KS.x + 130, my(KS));
                    ORG.f(g, KS.x + 172, my(KS), "Br_2");
                    ORG.plus(g, KS.x + 440, my(KS));
                    ORG.f(g, KS.x + 495, my(KS), "HBr");
                    ORG.navn(g, S_PROPAN[1][0], KS.y + NY, "propan");
                    ORG.navn(g, BOKS_BROM[0] + BOKS_BROM[2] / 2, KS.y + NY, "1-brompropan");
                }
            });
            api.del("pilS", {
                lag: 0,
                fuld: function (g) { return { p: ORG.reaktionspil(g, S_PIL[0], S_PIL[1], my(KS), { over: "lys" }) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("brom", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    kaede(gg, S_BROM, { lab: { 3: ["Br", { anker: "start", farve: F.accent }] }, bfarve: { 2: F.accent } });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("baseA", {
                lag: 0, auto: true,
                fuld: function (g) {
                    kort(g, KA);
                    ORG.plus(g, KA.x + 188, my(KA));
                    ORG.f(g, KA.x + 222, my(KA), "Br_2");
                    kaede(g, A_DIBROM, { gren: [[1, [A_DIBROM[1][0], A_DIBROM[1][1] - L], "Br", TEAL, F.accent], [2, [A_DIBROM[2][0], A_DIBROM[2][1] + L], "Br", TEAL, F.accent]] });
                    ORG.navn(g, BOKS_BUTEN[0] + BOKS_BUTEN[2] / 2, KA.y + NY, "but-2-en");
                    ORG.navn(g, (A_DIBROM[0][0] + A_DIBROM[3][0]) / 2, KA.y + NY + 4, "2,3-dibrombutan");
                }
            });
            api.del("pilA", {
                lag: 0,
                fuld: function (g) { return { p: ORG.reaktionspil(g, A_PIL[0], A_PIL[1], my(KA)) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("buten", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); kaede(gg, A_BUTEN, { dobbelt: [1], bfarve: { 1: F.accent } }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: elimination og benzen ---------------------------------- */
            api.del("baseE", {
                lag: 1, auto: true,
                fuld: function (g) {
                    kort(g, KE);
                    ORG.skelet(g, [[E_C[0], E_C[1]], [E_C[0] - L * 0.866, E_C[1] + L / 2], [E_C[0] + L * 0.866, E_C[1] + L / 2], [E_C[0], E_C[1] - L, "OH", { anker: "start", farve: F.accent }]],
                        [[0, 1], [0, 2], [0, 3, 1, 0, F.accent]]);
                    kaede(g, E_PROPEN, { dobbelt: [0], bfarve: { 0: F.accent } });
                    ORG.plus(g, KE.x + 395, my(KE));
                    ORG.f(g, KE.x + 448, my(KE), "H_2O");
                    ORG.navn(g, E_C[0], KE.y + NY, "propan-2-ol");
                    ORG.navn(g, E_PROPEN[1][0], KE.y + NY, "propen");
                    ORG.navn(g, KE.x + 448, KE.y + NY, "vand");
                }
            });
            api.del("pilE", {
                lag: 1,
                fuld: function (g) { return { p: ORG.reaktionspil(g, E_PIL[0], E_PIL[1], my(KE), { over: "katalysator", under: "varme" }) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("baseB", {
                lag: 1, auto: true,
                fuld: function (g) {
                    kort(g, KB);
                    ORG.plus(g, KB.x + 170, my(KB));
                    ORG.f(g, KB.x + 205, my(KB), "Br_2");
                    ORG.reaktionspil(g, B_PIL[0], B_PIL[1], my(KB), { over: "katalysator" });
                    var P = ORG.ring(g, B_BROM[0], B_BROM[1], R6, { dobbelt: [0, 2, 4] });
                    ORG.skelet(g, [[P[0][0], P[0][1]], [P[0][0], P[0][1] - L, "Br", TEAL]], [[0, 1, 1, 0, F.accent]]);
                    ORG.plus(g, KB.x + 445, my(KB));
                    ORG.f(g, KB.x + 500, my(KB), "HBr");
                    ORG.navn(g, B_BENZEN[0], KB.y + NY, "benzen");
                    ORG.navn(g, B_BROM[0], KB.y + NY, "brombenzen");
                }
            });
            api.del("benzen", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); ORG.ring(gg, B_BENZEN[0], B_BENZEN[1], R6, { dobbelt: [0, 2, 4] }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 3: polyaddition -------------------------------------------- */
            api.del("baseP", {
                lag: 2, auto: true,
                fuld: function (g) {
                    kort(g, KP);
                    ORG.navn(g, P_ETHEN[0], KP.y + NY, "ethen");
                    ORG.navn(g, P_MIDT, KP.y + NY, "polyethen", "plast til poser og flasker");
                }
            });
            api.del("ethen", {
                lag: 2,
                fuld: function (g) { return { t: ORG.f(g, P_ETHEN[0], P_ETHEN[1], "n CH_2=CH_2") }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });
            api.del("pilP", {
                lag: 2,
                fuld: function (g) { return { p: ORG.reaktionspil(g, P_PIL[0], P_PIL[1], my(KP)) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("kaede", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    kaede(gg, P_KAEDE);
                    var a = P_KAEDE[0], b = P_KAEDE[14];
                    [[a, -1], [b, 1]].forEach(function (e) {
                        SV.el("line", { x1: e[0][0] + e[1] * 4, y1: e[0][1], x2: e[0][0] + e[1] * 22, y2: e[0][1], stroke: F.blaek, "stroke-width": 2.6, "stroke-dasharray": "1 6", "stroke-linecap": "round" }, gg);
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });
        }
    };
}());

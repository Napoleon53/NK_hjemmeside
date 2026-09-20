/* =====================================================================
   beholder.js - det, en beholder paa bordet kan: rumme, blande, haelde

   En beholder er en genstand (fra bord.js) med
     indhold   den blandede oploesning (NK.Stof)
     lag       et lag, der endnu ikke er blandet ind: det, der lige er
               haeldt eller dryppet i (oeverst), eller det, der er
               oploest fra fast stof i bunden (lagBund)
     bund      hvor meget bundfaldet har lagt sig (0-1); rystning
               hvirvler det op igen
     niveau    vaeskens overflade paa tegnebordet, sat af tegningen
     flager    glinsende krystaller af et fast stof med glimmer (PbI2,
               »den gyldne regn«, K3): { u, v } er broekdele af glassets
               bredde og vaeskens hoejde, saa tegningen kan saette dem ind
   Alt fast stof ligger i oploesningens n som stoffer med fase "s".
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Stof = NK.Stof;
    var B = {};
    NK.Beholder = B;

    B.BLAND = { diffusion: 0.06, ryst: 3, roer: 4, bobler: 1.5, lagMaks: 3 };
    B.TEMP = { stue: 20, tauLuft: 40, tauVarme: 10, kog: 100 };

    /* Glinsende krystaller (K3, som den gamle sc2.7): et fast stof med
       glimmer ses som flager, der daler ned gennem vaesken og glimter, saa
       de foerste krystaller kan ses, laenge foer der er et bundfald. 5
       flager fra den foerste krystal, én mere pr. 2,5 mg, hoejst 80. Under
       omroering hvirvler de rundt; i ro daler de til bunds. Kun til
       tegningen: kemien staar i indholdet. */
    B.opdaterFlager = function (gg, dt, urolig) {
        var o = gg.indhold, m = 0, n = 0, farve = null;
        if (o && o.V > 0.5) {
            Stof.faste(o).forEach(function (f) {
                if (!f.stof.glimmer) return;
                n += f.umol;
                m += f.umol * (f.stof.M || 0) * 1e-6;
                farve = farve || f.stof.farve;
            });
        }
        /* Under 0,5 µmol er der intet fast stof (som fastIalt) */
        var antal = n >= 0.5 ? Math.min(80, 5 + Math.round(m * 400)) : 0;
        if (!antal && !(gg.flager && gg.flager.length)) return;
        var fl = gg.flager = gg.flager || [], r = NK.r, i, f, levende = 0;
        if (farve) gg.flageFarve = farve;
        for (i = 0; i < fl.length; i++) if (!fl[i].doed) levende++;
        for (; levende < antal; levende++) {
            fl.push({ u: r(0.1, 0.9), v: r(0.12, 0.9), a: r(0, 6.28), s: r(0.016, 0.032), alfa: 0,
                      fart: r(1.5, 4.5), fase: r(0, 6.28), vv: r(0.1, 0.22), ru: r(0.08, 0.38), th: r(0, 6.28), vmaal: r(0.05, 0.9) });
        }
        for (i = fl.length - 1; i >= 0 && levende > antal; i--) if (!fl[i].doed) { fl[i].doed = true; levende--; }
        var bund = 0.02 + 0.04 * (gg.bund || 0);
        for (i = fl.length - 1; i >= 0; i--) {
            f = fl[i];
            if (f.doed) {
                f.alfa -= dt * 2.5;
                if (f.alfa <= 0.02) { fl.splice(i, 1); continue; }
            } else f.alfa = Math.min(1, f.alfa + dt * 2);
            if (urolig) {
                f.th += dt * 4;
                f.u = NK.mod(f.u, 0.5 + f.ru * Math.sin(f.th), 6, dt);
                if (Math.random() < dt * 0.5) f.vmaal = r(0.05, 0.9);
                f.v = NK.mod(f.v, f.vmaal, 1.5, dt);
                f.a += dt * 3;
            } else if (f.v > bund) {
                f.v = Math.max(bund, f.v - f.vv * dt);
                f.u = NK.klamp(f.u + Math.sin(f.fase + f.v * 9) * 0.03 * dt, 0.06, 0.94);
                f.a += dt * 0.8;
            }
        }
    };

    B.er = function (gg) {
        return !!(gg && gg.kan && gg.kan.holder && gg.indhold);
    };

    B.volumen = function (gg) {
        if (!gg.indhold) return 0;
        return gg.indhold.V + (gg.lag ? gg.lag.V : 0);
    };

    B.fastIalt = function (gg) {
        return (gg.indhold ? Stof.fastIalt(gg.indhold) : 0) + (gg.lag ? Stof.fastIalt(gg.lag) : 0);
    };

    B.tom = function (gg) {
        return B.volumen(gg) < 0.05 && B.fastIalt(gg) < 0.5;
    };

    /* Hele indholdet, som om det var blandet (kopi) */
    B.samlet = function (gg) {
        var o = Stof.kopi(gg.indhold);
        if (gg.lag) Stof.bland(o, Stof.kopi(gg.lag));
        return o;
    };

    B.toem = function (gg) {
        gg.indhold = Stof.ny(gg.indhold ? gg.indhold.T : B.TEMP.stue);
        gg.lag = null;
        gg.lagBund = false;
        gg.bund = 0;
    };

    /* Vaeske kommer i. Haeldes der (blandet = true), blander straalen det
       meste ind med det samme. Dryppes der, lander draaben i et lag i
       toppen sammen med lidt af det, der var i forvejen, og reagerer
       der, til laget blandes ind ved diffusion, rystning eller omroering. */
    B.haeldI = function (gg, d, blandet) {
        if (d.V <= 0 && Stof.fastIalt(d) <= 0) return;
        if (blandet || gg.indhold.V < 0.5 || (gg.lag && gg.lagBund)) {
            if (gg.lag && !gg.lagBund) { Stof.bland(gg.indhold, gg.lag); gg.lag = null; }
            Stof.bland(gg.indhold, d);
            return;
        }
        if (!gg.lag) {
            gg.lag = Stof.del(gg.indhold, Math.min(B.BLAND.lagMaks, gg.indhold.V * 0.4));
            gg.lagBund = false;
        }
        Stof.bland(gg.lag, d);
        if (gg.lag.V > gg.indhold.V * 0.8) {
            Stof.bland(gg.indhold, gg.lag);
            gg.lag = null;
        }
    };

    /* Fast stof lander i bunden og oploeses i et lag dernede */
    B.tilsaetFast = function (gg, navn, umol) {
        if (gg.indhold.V < 0.5) { Stof.tilsaet(gg.indhold, navn, umol); return; }
        if (gg.lag && !gg.lagBund) { Stof.bland(gg.indhold, gg.lag); gg.lag = null; }
        if (!gg.lag) {
            gg.lag = Stof.del(gg.indhold, Math.min(B.BLAND.lagMaks, gg.indhold.V * 0.3));
            gg.lagBund = true;
        }
        Stof.tilsaet(gg.lag, navn, umol);
    };

    /* Tager mL ud fra toppen: foerst laget i toppen, saa resten */
    B.udtag = function (gg, mL) {
        var ud = Stof.ny(gg.indhold.T);
        if (B.volumen(gg) <= 0 || mL <= 0) return ud;
        if (gg.lag && !gg.lagBund) {
            var fraLag = Stof.del(gg.lag, Math.min(mL, gg.lag.V));
            Stof.bland(ud, fraLag);
            mL -= fraLag.V;
            if (gg.lag.V < 0.001) gg.lag = null;
        }
        if (mL > 1e-6) Stof.bland(ud, Stof.del(gg.indhold, mL));
        if (gg.lag && gg.lagBund && gg.indhold.V < 0.001 && mL > 1e-6) {
            Stof.bland(ud, Stof.del(gg.lag, Math.min(mL, gg.lag.V)));
            if (gg.lag.V < 0.001) gg.lag = null;
        }
        return ud;
    };

    /* Alt indhold tages ud (til affald, vask eller en pyt) */
    B.udtagAlt = function (gg) {
        var ud = B.samlet(gg);
        B.toem(gg);
        return ud;
    };

    /* Lysvejen gennem beholderen, i reagensglas-enheder (vejlaengde 1).
       Fra siden er den glassets egen, og den staar fast. Ovenfra er den
       vaeskens dybde, og den vokser altsaa med rumfanget: derfor ser en
       ren fortynding ens ud ovenfra og lysere fra siden.
       Se NK.Udstyr.vejOvenfra. */
    B.lysvej = function (gg, retning) {
        if (retning === "ovenfra") return NK.Udstyr.vejOvenfra(gg.type, B.volumen(gg));
        return gg.type.vejlaengde || 1;
    };

    /* Farven af vaesken, set gennem denne beholder.
       retning: "ovenfra" for kigget ned i glasset, ellers gennem siden. */
    B.farve = function (gg, retning) {
        if (!gg.indhold || B.volumen(gg) < 0.02) return null;
        return Stof.farve(B.samlet(gg), B.lysvej(gg, retning)) || Stof.VAND;
    };

    /* Tidens gang i beholderen.
       s = { T: omgivelsernes temperatur, tau, ryst (0-1), roer (bool),
             effekt: W fra en varmeplade med effekt (K3) }
       Med effekt varmes vaesken af pladens effekt i stedet for at naerme
       sig pladens temperatur: dT/dt = P/(V·c), saa 100 mL paa en plade med
       1100 W stiger 2,6 °C i sekundet, og et lille glas stiger hurtigere.
       Imens afgiver den varme til luften som ellers (tau). */
    B.skridt = function (gg, dt, s, reaktioner) {
        var o = gg.indhold;
        if (!o) return;
        var blandFart = B.BLAND.diffusion + (s.ryst || 0) * B.BLAND.ryst + (s.roer ? B.BLAND.roer : 0);
        [o, gg.lag].forEach(function (x) {
            if (!x) return;
            if (x.V > 0) x.T = s.T + (x.T - s.T) * Math.exp(-dt / (s.tau || B.TEMP.tauLuft));
            if (s.effekt && x === o && x.V > 0.05) x.T += s.effekt * dt / (x.V * Stof.VARMEKAP);
            Stof.skridt(x, dt, reaktioner, s);
        });
        /* Gas fra laget samles i beholderens gas. Bobler roerer rundt. */
        if (gg.lag && gg.lag.gas) {
            var g = Stof.tapGas(gg.lag);
            o.gas = o.gas || {};
            for (var navn in g) {
                if (!Object.prototype.hasOwnProperty.call(g, navn)) continue;
                o.gas[navn] = (o.gas[navn] || 0) + g[navn];
                if (g[navn] > 0.01) blandFart += B.BLAND.bobler;
            }
        }
        if (o.gas) {
            for (var gn in o.gas) if (Object.prototype.hasOwnProperty.call(o.gas, gn) && o.gas[gn] > 0.01) { blandFart += B.BLAND.bobler; break; }
        }
        if (gg.lag) {
            var f = 1 - Math.exp(-blandFart * dt);
            if (gg.lagBund && Stof.fastIalt(gg.lag) > 0.5) f *= 0.3;
            Stof.bland(o, Stof.del(gg.lag, gg.lag.V * f));
            if (gg.lag.V < 0.02 && Stof.fastIalt(gg.lag) < 0.5) {
                Stof.bland(o, gg.lag);
                gg.lag = null;
                gg.lagBund = false;
            }
        }
        /* Bundfaldet laegger sig, naar der er ro */
        var urolig = (s.ryst || 0) > 0.15 || s.roer;
        gg.bund = urolig ? Math.max(0, (gg.bund || 0) - dt * 2) : Math.min(1, (gg.bund || 0) + dt * 0.25);
        B.opdaterFlager(gg, dt, urolig);
        /* Kogning: damp og fordampning */
        gg.koger = o.V > 0.1 && o.T >= B.TEMP.kog - 0.5;
        if (gg.koger) {
            var vaek = Math.min(o.V, dt * 0.15);
            var V0 = o.V;
            o.V -= vaek;
            if (o.V < 0.05) { o.V = 0; o.n = {}; }
            else if (V0 > 0) {
                /* Stofmaengderne bliver; kun vandet gaar */
            }
        }
    };

    /* Massen i gram: glasset selv, vandet (1 g/mL) og stofferne (µmol · M) */
    B.masse = function (gg) {
        var m = gg.type.masse || 0;
        if (!gg.indhold) return m;
        var o = B.samlet(gg);
        m += o.V;
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            var st = Stof.STOFFER[s];
            if (st && st.M) m += o.n[s] * st.M * 1e-6;
        }
        return m;
    };

    /* Aabningen paa tegnebordet: ankeret sidder i aabningens midte */
    B.aabning = function (gg) {
        return { x: gg.p.x, y: gg.p.y };
    };

    /* Punktet, vaesken loeber fra, naar beholderen haelder */
    B.tudVerden = function (gg) {
        var t = gg.type.tud || { x: gg.anker.x, y: gg.anker.y };
        return NK.tilVerden(gg.p, gg.anker, t.x, t.y);
    };

    /* Positur for gg, saa tuden staar lidt over aabningen paa maal.
       Tuden i lokale koordinater drejes med tud.v om ankeret. */
    B.haeldPositur = function (gg, maal, over) {
        var o = B.aabning(maal);
        var t = gg.type.tud || { x: gg.anker.x, y: gg.anker.y, v: -1.6 };
        var v = t.v, co = Math.cos(v), si = Math.sin(v);
        var dx = t.x - gg.anker.x, dy = t.y - gg.anker.y;
        var loeft = over === undefined ? 14 : over;
        return { x: o.x + 4 - (dx * co - dy * si), y: o.y - loeft - (dx * si + dy * co), v: v };
    };

    /* Positur, hvor en genstand haenger lige over aabningen (draabeflaske,
       sproejteflaske, spatel, stav) */
    B.overAabning = function (gg, maal, dx, dy, v) {
        var o = B.aabning(maal);
        return { x: o.x + (dx || 0), y: o.y + (dy === undefined ? -20 : dy), v: v || 0 };
    };

    /* Loeber beholderen over? Returnerer det, der loeb over, eller null. */
    B.overloeb = function (gg) {
        var maks = gg.type.maks || 100;
        var V = B.volumen(gg);
        if (V <= maks) return null;
        return B.udtag(gg, V - maks + Math.max(1, maks * 0.06));
    };
}());

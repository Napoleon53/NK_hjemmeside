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

    /* Farven af vaesken, set gennem denne beholder */
    B.farve = function (gg) {
        if (!gg.indhold || B.volumen(gg) < 0.02) return null;
        return Stof.farve(B.samlet(gg), gg.type.vejlaengde || 1) || Stof.VAND;
    };

    /* Tidens gang i beholderen.
       s = { T: omgivelsernes temperatur, tau, ryst (0-1), roer (bool) } */
    B.skridt = function (gg, dt, s, reaktioner) {
        var o = gg.indhold;
        if (!o) return;
        var blandFart = B.BLAND.diffusion + (s.ryst || 0) * B.BLAND.ryst + (s.roer ? B.BLAND.roer : 0);
        [o, gg.lag].forEach(function (x) {
            if (!x) return;
            if (x.V > 0) x.T = s.T + (x.T - s.T) * Math.exp(-dt / (s.tau || B.TEMP.tauLuft));
            Stof.skridt(x, dt, reaktioner);
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

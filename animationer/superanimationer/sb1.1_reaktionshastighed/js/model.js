/* =====================================================================
   model.js - kemien og tallene, adskilt fra tegningen

   Ingen DOM og ingen tegning. Kan koeres for sig selv i konsollen.

   NK.Model.bromat   fane 1: bogens reaktion
                     5 Br⁻ + BrO₃⁻ + 6 H⁺ → 3 Br₂ + 3 H₂O
   NK.Model.udtryk   fane 3: starthastighed og forloeb ud fra et
                     hastighedsudtryk v = k·[A]^m·[B]^n
   Fane 2 har ingen formel: dér er hastigheden det, partiklerne selv
   goer (js/sim_sammenstoed.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Fane 1 --------------------------------------------------------
       Br⁻ og H⁺ er i stort overskud, saa kun [BrO₃⁻] aendrer sig maerkbart,
       og hastighedsudtrykket v = k·[Br⁻]·[BrO₃⁻]·[H⁺]² bliver til
       v(BrO₃⁻) = K·[BrO₃⁻] med K = k·[Br⁻]·[H⁺]². Saa falder [BrO₃⁻]
       eksponentielt, og [Br₂] = 3·(startværdi − [BrO₃⁻]).
       K = 0,0116 s⁻¹ er taget fra den gamle b1.1, hvor den var tilpasset
       bogens eksempel (Basiskemi B s. 7-13). */
    var K = 0.0116;               /* s⁻¹ */
    var BRO3_START = 1.00e-3;     /* M */

    var bromat = {
        K: K,
        BRO3_START: BRO3_START,
        BR2_SLUT: 3 * BRO3_START,
        T_MAKS: 500,              /* s, grafens tidsakse */
        Y_MAKS: 3.5e-3,           /* M, grafens koncentrationsakse */
        KOEF: { br2: 3, bro3: 1 },

        bro3: function (t) { return BRO3_START * Math.exp(-K * t); },
        br2: function (t) { return 3 * BRO3_START * (1 - Math.exp(-K * t)); },

        /* d[stof]/dt: positiv for Br₂, negativ for BrO₃⁻ */
        haeldning: function (stof, t) {
            var d = K * BRO3_START * Math.exp(-K * t);
            return stof === "br2" ? 3 * d : -d;
        },

        konc: function (stof, t) {
            return stof === "br2" ? this.br2(t) : this.bro3(t);
        },

        /* Reaktionshastigheden er altid positiv: minus foran for en
           reaktant. v(Br₂) = 3·v(BrO₃⁻). */
        v: function (stof, t) {
            return Math.abs(this.haeldning(stof, t));
        },

        /* Gennemsnitshastigheden fra t1 til t2 (sekantens hældning,
           med fortegnet vendt for en reaktant). */
        gennemsnit: function (stof, t1, t2) {
            if (t2 === t1) return this.v(stof, t1);
            var h = (this.konc(stof, t2) - this.konc(stof, t1)) / (t2 - t1);
            return stof === "br2" ? h : -h;
        }
    };

    /* ----- Fane 3 --------------------------------------------------------
       En reaktion R har:
         reaktanter  [{ id, koef }]
         produkt     { id, koef }   det stof, hastigheden maales paa
         orden       { id: eksponent }
         k           hastighedskonstanten
       Forloebet regnes med reaktionens fremskridt x (mol/L "reaktions-
       enheder"): reaktant i har c0 − koef·x, produktet koef·x, og
       dx/dt = v(produkt)/koef(produkt). */
    function starthastighed(R, c0) {
        var v = R.k;
        R.reaktanter.forEach(function (r) { v *= Math.pow(c0[r.id], R.orden[r.id]); });
        return v;
    }

    function hastighedVed(R, c0, x) {
        var v = R.k;
        for (var i = 0; i < R.reaktanter.length; i++) {
            var r = R.reaktanter[i];
            var c = Math.max(0, c0[r.id] - r.koef * x);
            v *= Math.pow(c, R.orden[r.id]);
        }
        return v;
    }

    /* Produktets koncentration til tiden t1, t2, ... (runge-kutta).
       Giver en liste af { t, c } med n + 1 punkter fra 0 til T. */
    function forloeb(R, c0, T, n) {
        n = n || 160;
        var kp = R.produkt.koef;
        var xMaks = Infinity;
        R.reaktanter.forEach(function (r) { xMaks = Math.min(xMaks, c0[r.id] / r.koef); });
        function f(x) { return x >= xMaks ? 0 : hastighedVed(R, c0, x) / kp; }
        var ud = [{ t: 0, c: 0 }];
        var x = 0, h = T / n, under = 8;
        for (var i = 1; i <= n; i++) {
            for (var j = 0; j < under; j++) {
                var dt = h / under;
                var k1 = f(x), k2 = f(x + dt * k1 / 2), k3 = f(x + dt * k2 / 2), k4 = f(x + dt * k3);
                x = Math.min(xMaks, x + dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6);
            }
            ud.push({ t: i * h, c: kp * x });
        }
        return ud;
    }

    /* Tidsaksen for en opgave: grundforsoeget (alle startkoncentrationer
       0,10 M) naar ca. en tredjedel af vejen. Afrundet til et paent tal. */
    function tidsakse(R, grund) {
        var xMaks = Infinity;
        R.reaktanter.forEach(function (r) { xMaks = Math.min(xMaks, grund[r.id] / r.koef); });
        var maal = 0.33 * xMaks * R.produkt.koef;
        var T = 1;
        /* Fordobl T, til produktet er naaet maalet */
        for (var i = 0; i < 40; i++) {
            var f = forloeb(R, grund, T, 60);
            if (f[f.length - 1].c >= maal) break;
            T *= 2;
        }
        var paene = [1, 1.5, 2, 3, 4, 5, 6, 8, 10];
        var e = Math.pow(10, Math.floor(Math.log10(T)));
        for (var j = 0; j < paene.length; j++) {
            if (paene[j] * e >= T * 0.75) return paene[j] * e;
        }
        return 10 * e;
    }

    NK.Model = {
        bromat: bromat,
        udtryk: {
            starthastighed: starthastighed,
            hastighedVed: hastighedVed,
            forloeb: forloeb,
            tidsakse: tidsakse
        }
    };
}());

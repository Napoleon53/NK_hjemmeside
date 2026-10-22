/* =====================================================================
   kemi.js - modellen bag syntesen af Salenvir

   Alt, eleven ser i kolben, i tragten, paa urglasset og i
   smeltepunktsapparatet, regnes her. Tegningen (js/tegning.js og
   js/sim.js) spoerger kun, hvad der ER.

   Stofmaengder i mmol, masser i g, rumfang i mL, temperatur i °C og
   tid i minutter (laboratoriets ur, ikke skaermens).

   Forenklingerne staar i README.md. De vigtigste:
     * Reaktionens fart: r = k(T) · min(n(sal)/2, n(en)) med
       k(75 °C) = 0,35 pr. min, og k fordobles for hver 15 °C.
     * Opløseligheden af Salenvir i ethanol er et skøn, valgt saa alt er
       opløst ved 75 °C, og saa en filtrering ved stuetemperatur og i
       isbad giver et udbytte paa 80-90 %.
     * Ethanolen i de vaade krystaller fordamper eksponentielt.
     * Smeltepunktet falder med ethanol og salicylaldehyd i proeven.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Stofdata --------------------------------------------------------
       Massefylder ved 20 °C og molare masser (CRC Handbook). Salenvir er
       salen, N,N'-bis(salicyliden)ethylendiamin; smeltepunktet 127-128 °C
       er vejledningens. */
    var STOF = {
        sal:    { navn: "salicylaldehyd", M: 122.12, rho: 1.167 },
        en:     { navn: "ethylendiamin", M: 60.10, rho: 0.899 },
        salen:  { navn: "Salenvir", M: 268.31, smp: [127.0, 128.0] },
        ethanol: { navn: "ethanol", rho: 0.789, kp: 78.3, cp: 2.44, hfor: 846 }
    };

    var STUE = 21;           /* stuetemperatur */
    var PLADE_SAT = 100;     /* magnetomroererens varme, naar den er taendt */

    /* Opskriften */
    var OPSKRIFT = { sal: 1.4, ethanol: 100, en: 0.5 };

    /* mL af et stof til mmol */
    function mmol(stof, mL) { return mL * STOF[stof].rho / STOF[stof].M * 1000; }

    /* Opløseligheden af Salenvir i ethanol i g pr. 100 mL (skøn, se README) */
    function oploeselighed(T) {
        return 0.12 * Math.exp(0.0444 * (T - 5));
    }

    /* Reaktionens hastighedskonstant pr. min */
    function k(T) {
        return 0.35 * Math.pow(2, (T - 75) / 15);
    }

    /* ----- Kolben --------------------------------------------------------- */
    function nyKolbe() {
        return {
            magnet: false,
            vSal: 0, vEn: 0, vEth: 0,       /* i kolben nu (mL) */
            tilsat: { sal: 0, en: 0, ethanol: 0 },   /* tilsat i alt (mL) */
            nSal: 0, nEn: 0,                /* tilbage (mmol) */
            nSal0: 0, nEn0: 0,              /* tilsat i alt (mmol) */
            nSalen: 0,                      /* dannet i alt (mmol) */
            mKryst: 0,                      /* krystaller i kolben (g) */
            mUd: 0,                         /* Salenvir, der er haeldt ud af kolben (g) */
            T: STUE,
            enVedT: null,                   /* temperaturen, da ethylendiamin kom i */
            tEn: null,                      /* uret, da ethylendiamin kom i */
            enHurtigt: false,
            kog: 0                          /* hvor kraftigt det koger, 0-1 */
        };
    }

    /* Rumfanget af vaesken i kolben (mL) */
    function rumfang(K) {
        var v = K.vEth + K.vSal + K.vEn;
        /* Det, der er haeldt ud, er vaek: vEth holdes nede i haeld() */
        return Math.max(0, v);
    }

    function mSalenIAlt(K) { return K.nSalen * STOF.salen.M / 1000 - K.mUd; }

    function mOploest(K) { return Math.max(0, mSalenIAlt(K) - K.mKryst); }

    /* Hvor stor en del af det, der kan reagere, der har reageret (0-1) */
    function omsat(K) {
        var max = Math.min(K.nSal0 / 2, K.nEn0);
        if (max <= 0) return 0;
        return NK.klamp(K.nSalen / max, 0, 1);
    }

    /* Er den begraensende reaktant brugt op (under 3 % tilbage)? */
    function faerdig(K) {
        var max = Math.min(K.nSal0 / 2, K.nEn0);
        if (max <= 0) return false;
        return Math.min(K.nSal / 2, K.nEn) < 0.03 * max;
    }

    /* Er der saa meget salicylaldehyd, at noget bliver tilovers? */
    function overskudSal(K) {
        return K.nSal0 > 2 * K.nEn0 * 1.06;
    }

    /* Et tidsskridt for kolben. sted: "plade", "isbad", "bord", "tragt" */
    function opdaterKolbe(K, dt, sted, plade, omroerer) {
        if (dt <= 0) return;
        var V = rumfang(K);
        /* Temperaturen */
        var maal = STUE, a = 0.03;
        if (sted === "plade") { maal = plade.T; a = V > 0 ? 0.13 : 0.5; }
        else if (sted === "isbad") { maal = 2; a = 0.42; }
        if (V <= 0.01) { K.T = maal === 2 ? 2 : (sted === "plade" ? plade.T : STUE); K.kog = 0; }
        else {
            var nyT = K.T + (maal - K.T) * (1 - Math.exp(-a * dt));
            K.kog = 0;
            if (nyT > STOF.ethanol.kp && K.vEth > 0.5) {
                /* Ethanolen koger: overskuddet af varme fordamper ethanol */
                var C = V * STOF.ethanol.rho * STOF.ethanol.cp;      /* J/K */
                var varme = (nyT - STOF.ethanol.kp) * C;              /* J */
                var mlUd = varme / STOF.ethanol.hfor / STOF.ethanol.rho;
                K.vEth = Math.max(0, K.vEth - mlUd);
                K.kog = NK.klamp((maal - STOF.ethanol.kp) / 20, 0.15, 1);
                nyT = STOF.ethanol.kp;
            }
            K.T = nyT;
        }

        /* Reaktionen */
        if (K.nSal > 0 && K.nEn > 0 && V > 1) {
            var faktor = (omroerer && K.magnet) ? 1 : 0.5;
            var mulig = Math.min(K.nSal / 2, K.nEn);
            var d = mulig * (1 - Math.exp(-k(K.T) * faktor * dt));
            K.nSalen += d;
            K.nSal -= 2 * d;
            K.nEn -= d;
        }

        /* Krystallerne: naermer sig ligevaegten med opløseligheden */
        var mAlt = mSalenIAlt(K);
        var ligevaegt = Math.max(0, mAlt - oploeselighed(K.T) * K.vEth / 100);
        if (V <= 0.5) ligevaegt = mAlt;
        K.mKryst += (ligevaegt - K.mKryst) * (1 - Math.exp(-1.6 * dt));
        K.mKryst = NK.klamp(K.mKryst, 0, Math.max(0, mAlt));
    }

    /* Tilsaet et stof (mL). Ethylendiamin husker temperaturen. */
    function tilsaet(K, stof, mL, ur) {
        if (mL <= 0) return;
        K.tilsat[stof] += mL;
        if (stof === "sal") { K.vSal += mL; K.nSal += mmol("sal", mL); K.nSal0 += mmol("sal", mL); }
        else if (stof === "en") {
            if (K.enVedT === null) { K.enVedT = K.T; K.tEn = ur; }
            K.vEn += mL; K.nEn += mmol("en", mL); K.nEn0 += mmol("en", mL);
        }
        else if (stof === "ethanol") { K.vEth += mL; }
    }

    /* Haeld en del af kolben ud. andel 0-1 af vaesken; krystallerne foelger
       med i andelen krAndel. Giver det, der kom ud. */
    function haeldUd(K, andel, krAndel) {
        var V = rumfang(K);
        if (V <= 0) return { mL: 0, mKryst: 0, mOploest: 0 };
        andel = NK.klamp(andel, 0, 1);
        var ud = {
            mL: V * andel,
            mKryst: K.mKryst * krAndel,
            mOploest: mOploest(K) * andel,
            T: K.T
        };
        /* Stofferne i vaesken foelger med vaesken */
        var f = 1 - andel;
        K.vEth *= f; K.vSal *= f; K.vEn *= f;
        K.nSal *= f; K.nEn *= f;
        K.mKryst -= ud.mKryst;
        K.mUd += ud.mKryst + ud.mOploest;
        if (rumfang(K) < 0.05) { K.vEth = 0; K.vSal = 0; K.vEn = 0; }
        return ud;
    }

    /* ----- Tragten og filtreringen ------------------------------------------- */
    function nyTragt() {
        return {
            vaad: false,        /* filtrerpapiret er fugtet */
            mL: 0,              /* vaeske, der staar i tragten */
            mKryst: 0,          /* krystaller paa papiret (g) */
            gennem: 0,          /* krystaller, der er loebet under papiret (g) */
            w: 0,               /* g ethanol pr. g krystaller i filterkagen */
            filtrat: 0,         /* mL i sugekolben */
            filtratSalen: 0,    /* g Salenvir opløst i filtratet */
            filtrT: null,       /* temperaturen, da kolben blev haeldt i */
            aSal: null          /* salicylaldehyd tilbage, da der blev filtreret */
        };
    }

    var TRAGT_MAX = 60;     /* mL, der kan staa i tragten */

    /* Kolbens indhold kommer i tragten */
    function iTragt(Tr, ud) {
        Tr.mL += ud.mL;
        var tab = Tr.vaad ? 0 : 0.05;       /* ufugtet papir: noget loeber under */
        Tr.mKryst += ud.mKryst * (1 - tab);
        Tr.gennem += ud.mKryst * tab;
        Tr.filtratSalen += ud.mOploest + ud.mKryst * tab;
        if (Tr.mKryst > 0.01) Tr.w = Math.max(Tr.w, 0.9);
    }

    function opdaterTragt(Tr, dt, sug) {
        if (dt <= 0) return;
        if (Tr.mL > 0) {
            var fart = sug ? 90 : 2.5;      /* mL pr. min */
            var d = Math.min(Tr.mL, fart * dt);
            Tr.mL -= d;
            Tr.filtrat += d;
        }
        if (Tr.mL <= 0.01 && Tr.mKryst > 0.01) {
            /* Suget traekker ethanolen ud af filterkagen */
            var bund = sug ? 0.22 : 0.55;
            var hast = sug ? 2.2 : 0.05;
            if (Tr.w > bund) Tr.w = bund + (Tr.w - bund) * Math.exp(-hast * dt);
        }
    }

    /* ----- Urglasset og toerringen ---------------------------------------------- */
    function nytUrglas(masse) {
        return { tom: masse, mKryst: 0, w: 0, vejetTom: false, initialer: true };
    }

    /* Krystallerne toerrer: under lampen hurtigt, ellers langsomt */
    function opdaterUrglas(U, dt, underLampe) {
        if (dt <= 0 || U.mKryst <= 0) return;
        var tau = underLampe ? 2.4 : 35;
        U.w *= Math.exp(-dt / tau);
        if (U.w < 1e-5) U.w = 0;
    }

    function urglasMasse(U) {
        return U.tom + U.mKryst * (1 + U.w);
    }

    /* ----- Smeltepunktet ---------------------------------------------------------
       Ethanol og salicylaldehyd i proeven saenker smeltepunktet og goer
       intervallet bredere. u er andelen af urenheder. */
    function smeltepunkt(w, u, skub) {
        skub = skub || 0;
        var start = STOF.salen.smp[0] - 120 * w - 60 * u + skub;
        var slut = STOF.salen.smp[1] - 30 * w - 20 * u + skub * 0.5;
        if (slut < start + 0.6) slut = start + 0.6;
        return { start: start, slut: slut };
    }

    /* Urenheden i krystallerne: salicylaldehyd, der ikke naaede at reagere,
       sidder i krystallerne. Skylning fjerner det meste. */
    function urenhed(aSal, skyllet) {
        return 0.25 * NK.klamp(aSal, 0, 1) * (skyllet ? 0.4 : 1);
    }

    /* ----- TLC -------------------------------------------------------------------
       Rf-vaerdierne (skøn, i samme raekkefoelge som i vejledningens figur):
       salicylaldehyd 0,62, Salenvir 0,38. Ethylendiamin bliver ved
       startlinjen og ses ikke i UV-lys. */
    var RF = { sal: 0.62, salen: 0.38 };

    /* Pletterne fra en proeve af kolben: styrke 0-1 */
    function tlcProeve(K) {
        var ref = mmol("sal", OPSKRIFT.sal);
        var pl = [];
        var a = K.nSal / ref;
        var p = K.nSalen / (ref / 2);
        if (a > 0.04) pl.push({ stof: "sal", rf: RF.sal, styrke: NK.klamp(0.25 + 0.75 * a, 0, 1) });
        if (p > 0.04) pl.push({ stof: "salen", rf: RF.salen, styrke: NK.klamp(0.25 + 0.75 * p, 0, 1) });
        return pl;
    }

    function tlcReference() {
        return [{ stof: "sal", rf: RF.sal, styrke: 0.8 }];
    }

    /* ----- Udbyttet ------------------------------------------------------------ */
    function teoretisk(K) {
        var n = Math.min(K.nSal0 / 2, K.nEn0);
        return n * STOF.salen.M / 1000;
    }

    NK.Kemi = {
        STOF: STOF,
        STUE: STUE,
        PLADE_SAT: PLADE_SAT,
        OPSKRIFT: OPSKRIFT,
        TRAGT_MAX: TRAGT_MAX,
        RF: RF,
        mmol: mmol,
        oploeselighed: oploeselighed,
        k: k,
        nyKolbe: nyKolbe,
        rumfang: rumfang,
        mSalenIAlt: mSalenIAlt,
        mOploest: mOploest,
        omsat: omsat,
        faerdig: faerdig,
        overskudSal: overskudSal,
        opdaterKolbe: opdaterKolbe,
        tilsaet: tilsaet,
        haeldUd: haeldUd,
        nyTragt: nyTragt,
        iTragt: iTragt,
        opdaterTragt: opdaterTragt,
        nytUrglas: nytUrglas,
        opdaterUrglas: opdaterUrglas,
        urglasMasse: urglasMasse,
        smeltepunkt: smeltepunkt,
        urenhed: urenhed,
        tlcProeve: tlcProeve,
        tlcReference: tlcReference,
        teoretisk: teoretisk
    };
}());

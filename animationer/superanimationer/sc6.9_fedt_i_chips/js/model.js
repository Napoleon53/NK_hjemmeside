/* =====================================================================
   model.js - kemien og tallene bag forsoeget

   Fedtet i chipsene er upolaert. Heptan er ogsaa upolaert og opløser
   fedtet; vand er polaert og opløser kun saltet. Hvor meget der
   ekstraheres, afhaenger af, hvor godt chipsene er knust, og hvor
   laenge der er roert:

     roergrad   = 1 - exp(-(0,3 + 0,7 · knust) · tid / tau)
     fedt opløst = midlets evne · (0,85 + 0,15 · knust) · roergrad

   Ved filtreringen bliver en del af opløsningen i filteret og i
   chipsresterne (FILTER.tilbage). Skylles der efter med opløsnings-
   middel, er det kun FILTER.efterSkyl. Krummer, der springer ud af
   morteren, er tabt.

   Resultatet regnes som i laboratoriet ud fra de tre vejninger:
     fedtindhold = (m(glas med fedt) - m(tomt glas)) / m(chips) · 100 %
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Indhold pr. gram chips, som paa posens varedeklaration */
    var CHIPS = { fedt: 0.34, salt: 0.013, deklaration: 34 };

    var AFVEJ = { min: 4.5, max: 5.5, chipMin: 0.34, chipMax: 0.66 };

    var MIDLER = {
        heptan: {
            id: "heptan", navn: "Heptan", formel: "C₇H₁₆", polaer: false,
            fedt: 0.97, salt: 0, braendbar: true, inddampTid: 9,
            farve: { r: 236, g: 242, b: 246, a: 0.2 }
        },
        vand: {
            id: "vand", navn: "Vand", formel: "H₂O", polaer: true,
            fedt: 0, salt: 0.95, braendbar: false, inddampTid: 14,
            farve: { r: 168, g: 212, b: 238, a: 0.3 }
        }
    };

    /* knust: 0-1. Pistillens samlede vej (tegneenheder) giver fuld
       knusning; under min kan chipsene ikke haeldes over. */
    var KNUS = { min: 0.5, vej: 2600, voldsom: 2600, krummeMasse: 0.02, maksKrummer: 8, amok: 3200, amokTid: 0.8, spildMasse: 0.03 };

    /* tid: roeretid i sekunder. Uden roering sker der kun lidt (diffusion). */
    var ROER = { tau: 1.5, min: 0.5, faerdig: 0.95, diffusion: 0.04, fuld: 450 };

    var FILTER = { tilbage: 0.12, efterSkyl: 0.02 };

    /* Massen af en tom petriskaal i glas */
    var SKAAL = { min: 31.5, max: 38.5 };

    var BRAND = { tid: 1.6 };

    /* Opløsningsmidlet i baegerglasset, maalt som areal paa tegnebordet */
    var VOLUMEN = 1450;

    var FARVE = {
        fedt:     { r: 244, g: 200, b: 64, a: 0.95 },
        heptan:   MIDLER.heptan.farve,
        vand:     MIDLER.vand.farve,
        uklart:   { r: 214, g: 206, b: 180, a: 0.55 },
        salt:     { r: 245, g: 245, b: 240, a: 1 }
    };

    function roerGrad(knust, tid) {
        var fart = (0.3 + 0.7 * NK.klamp(knust, 0, 1)) / ROER.tau;
        return 1 - Math.exp(-fart * Math.max(0, tid));
    }

    function ekstraktion(midl, knust, tid) {
        var g = roerGrad(knust, tid);
        return {
            fedt: midl.fedt * (0.85 + 0.15 * NK.klamp(knust, 0, 1)) * g,
            salt: midl.salt * g
        };
    }

    function opsamlet(andel, skyllet) {
        return andel * (1 - (skyllet ? FILTER.efterSkyl : FILTER.tilbage));
    }

    /* Massen af det, der er tilbage i glasset efter inddampningen */
    function rest(p) {
        var e = ekstraktion(p.midl, p.knust, p.tid);
        var m = Math.max(0, p.mChips - p.mTab);
        return {
            fedt: m * CHIPS.fedt * opsamlet(e.fedt, p.skyllet),
            salt: m * CHIPS.salt * opsamlet(e.salt, p.skyllet)
        };
    }

    function afrund(x, d) {
        var f = Math.pow(10, d === undefined ? 2 : d);
        return Math.round(x * f) / f;
    }

    /* Dansk talformat: 4,87 */
    function komma(x, d) {
        return afrund(x, d).toFixed(d === undefined ? 2 : d).replace(".", ",").replace(/^-(0,0*)$/, "$1");
    }

    function fedtprocent(mChips, mB, mBF) {
        return (mBF - mB) / mChips * 100;
    }

    function tal(tekst) {
        var s = String(tekst || "").replace(/%/g, "").replace(/\s/g, "").replace(",", ".");
        if (!/^[-+]?\d*\.?\d+$/.test(s)) return NaN;
        return parseFloat(s);
    }

    /* Tjekker elevens fedtindhold. slags fortaeller, hvilken fejl der
       sandsynligvis er begaaet, saa hintet kan passe til den. */
    function tjek(svar, mChips, mB, mBF) {
        var v = tal(svar);
        if (isNaN(v)) return { slags: "tom" };
        var rigtig = fedtprocent(mChips, mB, mBF);
        var mF = mBF - mB;
        function naer(x, tol) { return Math.abs(v - x) <= tol; }
        if (naer(rigtig, Math.max(0.15, Math.abs(rigtig) * 0.01))) return { slags: "rigtig", vaerdi: rigtig };
        if (naer(rigtig / 100, Math.max(0.0051, rigtig / 100 * 0.02))) return { slags: "broek" };
        if (naer(mF, 0.02)) return { slags: "gram" };
        if (naer(mBF / mChips * 100, 3)) return { slags: "baeger" };
        if (naer(mBF / mChips, 0.05) || naer(mB / mChips * 100, 3)) return { slags: "baeger" };
        if (mF > 0.001 && (naer(mChips / mF * 100, Math.max(2, mChips / mF)) || naer(mChips / mF, 0.1))) return { slags: "omvendt" };
        return { slags: "andet" };
    }

    NK.Model = {
        CHIPS: CHIPS,
        AFVEJ: AFVEJ,
        MIDLER: MIDLER,
        KNUS: KNUS,
        ROER: ROER,
        FILTER: FILTER,
        SKAAL: SKAAL,
        BRAND: BRAND,
        VOLUMEN: VOLUMEN,
        FARVE: FARVE,
        roerGrad: roerGrad,
        ekstraktion: ekstraktion,
        opsamlet: opsamlet,
        rest: rest,
        afrund: afrund,
        komma: komma,
        fedtprocent: fedtprocent,
        tal: tal,
        tjek: tjek
    };
}());

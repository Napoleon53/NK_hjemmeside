/* =====================================================================
   model.js - kemien: thiosulfat og syre

       S₂O₃²⁻(aq) + 2 H₃O⁺(aq) → S(s) + SO₂(aq) + 3 H₂O(l)

   Svovlet danner smaa korn, der spreder lyset. Krydset under glasset
   forsvinder, naar lyset gennem vaesken er svaekket til GRAENSE af det,
   det var. Hvor meget der svaekkes, afhaenger af svovlet i vaesken og
   af, hvor langt lyset gaar gennem den (vaeskens hoejde, altsaa det
   samlede rumfang i glasset):

       kontrast = exp(−TAU · [S] / S_KRYDS · V / V_REF)

   Med 50 mL i glasset er krydset vaek, naar [S] = S_KRYDS = 1,5 mM.
   Det er den samme maengde svovl hver gang, og derfor er 1/Δt et maal
   for hastigheden.

   Hastigheden: syren protonerer thiosulfat til HS₂O₃⁻ (pKs ≈ 1,7), og
   det er den, der henfalder. Det giver

       v = k · [S₂O₃²⁻] · [H₃O⁺] / ([H₃O⁺] + KS)

   Foerste orden i thiosulfat, og kun en lille afhaengighed af syren,
   naar der er syre nok (som i skoleforsoeg). k foelger Arrhenius med
   EA = 50 kJ/mol, saa hastigheden omtrent fordobles pr. 10 °C.

   Forloebet regnes med RK4 og gemmes som en tabel, saa tegning og
   selvtest slaar op i de samme tal. Forenklingerne staar i README.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var M = {
        C_THIO: 0.30,      /* M, Na₂S₂O₃ i flasken (0,15 M foer 24.09.2026: fane 1 var for langsom) */
        C_SYRE: 1.0,       /* M, HCl i flasken */
        KS: 0.02,          /* M, syrestyrken for HS₂O₃⁻ (pKs ≈ 1,7) */
        EA: 50000,         /* J/mol */
        R: 8.314,          /* J/(mol·K) */
        T_REF: 20,         /* °C */
        K_REF: 7.5e-4,     /* s⁻¹ ved 20 °C: [S₂O₃²⁻] = 0,12 M og [H₃O⁺] = 0,10 M giver ca. 20 s */
        S_KRYDS: 1.5e-3,   /* M svovl, naar krydset er vaek med 50 mL i glasset */
        V_REF: 50,         /* mL */
        V_GLAS: 100,       /* mL, baegerglasset */
        GRAENSE: 0.05,     /* kontrasten, hvor krydset regnes for vaek */
        MAKS_TID: 600,     /* s: saa laenge venter uret, hvis krydset ikke forsvinder */
        SKRIDT: 1500       /* skridt i tabellen over forloebet */
    };
    M.TAU = Math.log(1 / M.GRAENSE);

    /* Flaskernes koncentration som tekst, saa tallet kun staar ét sted */
    M.THIO_TEKST = NK.tal(M.C_THIO, 2) + " M";
    M.SYRE_TEKST = NK.tal(M.C_SYRE, 1) + " M";

    /* En blanding af rumfangene (mL) med koncentrationerne i glasset */
    M.blanding = function (vThio, vSyre, vVand) {
        var v = vThio + vSyre + vVand;
        return {
            vThio: vThio, vSyre: vSyre, vVand: vVand, v: v,
            c: v > 0 ? M.C_THIO * vThio / v : 0,
            h: v > 0 ? M.C_SYRE * vSyre / v : 0
        };
    };

    /* Hastighedskonstanten ved T °C */
    M.k = function (T) {
        return M.K_REF * Math.exp(-M.EA / M.R * (1 / (T + 273.15) - 1 / (M.T_REF + 273.15)));
    };

    /* Hastigheden i M/s: saa hurtigt dannes svovl */
    M.hastighed = function (c, h, T) {
        if (c <= 0 || h <= 0) return 0;
        return M.k(T) * c * h / (h + M.KS);
    };

    /* Den maengde svovl, der skjuler krydset med v mL i glasset */
    M.svovlVedKryds = function (v) {
        return M.S_KRYDS * M.V_REF / v;
    };

    /* Hvor meget af krydsets sorte, der ses gennem vaesken (1 = alt) */
    M.kontrast = function (S, v) {
        if (!(v > 0)) return 1;
        return Math.exp(-M.TAU * (S / M.S_KRYDS) * (v / M.V_REF));
    };

    /* Forloebet i en blanding ved T °C. Tabellen gaar til tSlut, som er
       tre gange den tid, krydset er om at forsvinde (hoejst MAKS_TID). */
    M.forloeb = function (bl, T) {
        var sKryds = M.svovlVedKryds(bl.v);
        var v0 = M.hastighed(bl.c, bl.h, T);
        var skoen = v0 > 0 ? sKryds / v0 : Infinity;
        var tSlut = isFinite(skoen) ? Math.min(M.MAKS_TID, Math.max(3 * skoen, 5)) : M.MAKS_TID;
        var n = M.SKRIDT, dt = tSlut / n;
        var S = new Array(n + 1), C = new Array(n + 1), H = new Array(n + 1);
        var c = bl.c, h = bl.h, s = 0;
        function f(cc, hh) { return M.hastighed(Math.max(cc, 0), Math.max(hh, 0), T); }
        S[0] = 0; C[0] = c; H[0] = h;
        var tKryds = Infinity;
        for (var i = 1; i <= n; i++) {
            /* RK4: c falder med v, h med 2v, og S vokser med v */
            var k1 = f(c, h);
            var k2 = f(c - k1 * dt / 2, h - k1 * dt);
            var k3 = f(c - k2 * dt / 2, h - k2 * dt);
            var k4 = f(c - k3 * dt, h - 2 * k3 * dt);
            var d = (k1 + 2 * k2 + 2 * k3 + k4) / 6 * dt;
            c -= d; h -= 2 * d; s += d;
            S[i] = s; C[i] = c; H[i] = h;
            if (tKryds === Infinity && s >= sKryds) {
                /* lineaert mellem de to sidste skridt */
                tKryds = (i - 1 + (sKryds - S[i - 1]) / (s - S[i - 1])) * dt;
            }
        }

        function slaaOp(tabel, t) {
            if (!(t > 0)) return tabel[0];
            var x = t / dt;
            if (x >= n) return tabel[n];
            var i0 = Math.floor(x), r = x - i0;
            return tabel[i0] + (tabel[i0 + 1] - tabel[i0]) * r;
        }

        return {
            bl: bl, T: T, tSlut: tSlut,
            sKryds: sKryds,
            dtKryds: tKryds,           /* s; Infinity, hvis krydset ikke forsvinder */
            svovl: function (t) { return slaaOp(S, t); },
            thio: function (t) { return slaaOp(C, t); },
            syre: function (t) { return slaaOp(H, t); },
            kontrast: function (t) { return M.kontrast(slaaOp(S, t), bl.v); }
        };
    };

    /* Den tid, krydset er om at forsvinde (s) */
    M.tidTilKryds = function (vThio, vSyre, vVand, T) {
        return M.forloeb(M.blanding(vThio, vSyre, vVand), T === undefined ? M.T_REF : T).dtKryds;
    };

    /* En maaling med uret: den rigtige tid med lidt spredning, som naar
       man selv trykker (± 3 %). tilf er NK.tilf, saa selvtesten kan
       udskifte den. */
    M.maaling = function (dtKryds) {
        if (!isFinite(dtKryds)) return Infinity;
        return dtKryds * (1 + (NK.tilf() - 0.5) * 0.06);
    };

    NK.Model = M;
}());

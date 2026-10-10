/* =====================================================================
   svar.js - bedoemmer det ord, eleven har skrevet

   Eleven skal kunne noegleordet, ikke stave det fejlfrit. Derfor:
     - store og smaa bogstaver, mellemrum, bindestreger og punktummer
       taeller ikke, og ae/oe/aa er det samme som de danske bogstaver
     - en foranstillet artikel (den, det, de, en, et) taeller ikke
     - smaa stavefejl taales: ingen i ord paa op til 4 bogstaver, én
       i ord paa 5-7 og to i laengere ord. To ombyttede bogstaver er
       én fejl.

   Raekkefoelgen: foerst de svar, der har deres egen forklaring
   (naesten), saa de rigtige uden stavefejl, saa de rigtige med.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    function normaliser(tekst) {
        var s = String(tekst === undefined || tekst === null ? "" : tekst).toLowerCase();
        s = s.replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa");
        if (s.normalize) s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
        s = s.replace(/[.'’´`\-]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
        s = s.replace(/^(den|det|de|en|et) (?=.)/, "");
        return s.replace(/ /g, "");
    }

    /* Antal rettelser fra a til b: indsaet, slet, erstat eller byt to nabobogstaver. */
    function afstand(a, b) {
        var la = a.length, lb = b.length, i, j, pris;
        if (!la) return lb;
        if (!lb) return la;
        var d = [];
        for (i = 0; i <= la; i++) { d.push([i]); }
        for (j = 1; j <= lb; j++) { d[0][j] = j; }
        for (i = 1; i <= la; i++) {
            for (j = 1; j <= lb; j++) {
                pris = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + pris);
                if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
                }
            }
        }
        return d[la][lb];
    }

    function taales(laengde) {
        return laengde <= 4 ? 0 : (laengde <= 7 ? 1 : 2);
    }

    /* Giver { tom, rigtig, praecis, naesten }. naesten er forklaringen til et
       svar, der er forkert, men taet paa. praecis er falsk, naar svaret kun
       er rigtigt, fordi en stavefejl er taalt. */
    function bedoem(opgave, tekst) {
        var svar = normaliser(tekst), i, j, ord;
        if (!svar) return { tom: true, rigtig: false, praecis: false, naesten: null };

        var naesten = opgave.naesten || [];
        for (i = 0; i < naesten.length; i++) {
            for (j = 0; j < naesten[i].ord.length; j++) {
                if (normaliser(naesten[i].ord[j]) === svar) return { tom: false, rigtig: false, praecis: false, naesten: naesten[i].t };
            }
        }

        var godtag = [opgave.svar].concat(opgave.godtag || []);
        for (i = 0; i < godtag.length; i++) {
            if (normaliser(godtag[i]) === svar) return { tom: false, rigtig: true, praecis: true, naesten: null };
        }
        for (i = 0; i < godtag.length; i++) {
            ord = normaliser(godtag[i]);
            if (taales(ord.length) > 0 && afstand(svar, ord) <= taales(ord.length)) return { tom: false, rigtig: true, praecis: false, naesten: null };
        }
        return { tom: false, rigtig: false, praecis: false, naesten: null };
    }

    NK.Svar = { normaliser: normaliser, afstand: afstand, taales: taales, bedoem: bedoem };
}());

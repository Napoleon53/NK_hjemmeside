/* =====================================================================
   mineraler.js - de otte sten i udstillingen, tegnet som SVG

   NK.Mineraler[id] er en SVG-tekst (120 × 90). Hver sten har den
   farve og form, den har i en samling: pyrit i gyldne terninger,
   svovl i gule krystaller, haematit som mørke nyrer, malakit med
   grønne bånd. Magnetit har en clips siddende, for den er magnetisk.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function poly(p, farve, ekstra) {
        return '<polygon points="' + p + '" fill="' + farve + '"' + (ekstra || "") + "/>";
    }

    /* En terning set skraat fra oven: top, venstre og hoejre flade */
    function terning(x, y, s, top, venstre, hoejre) {
        var a = 0.87 * s, b = 0.5 * s;
        function pt(l) { return l.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
        return poly(pt([[x, y - b], [x + a, y], [x, y + b], [x - a, y]]), top) +
            poly(pt([[x - a, y], [x, y + b], [x, y + b + s], [x - a, y + s]]), venstre) +
            poly(pt([[x + a, y], [x, y + b], [x, y + b + s], [x + a, y + s]]), hoejre);
    }

    function skygge(b) {
        return '<ellipse cx="60" cy="80" rx="' + (b || 44) + '" ry="6" fill="rgba(0,0,0,0.38)"/>';
    }

    function svg(indhold) {
        return '<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + indhold + "</svg>";
    }

    /* En graa sten, som krystallerne sidder paa */
    function moder(farve, moerk) {
        return poly("14,78 22,60 44,52 78,50 100,58 108,76 86,82 34,82", farve) +
            poly("14,78 22,60 44,52 50,64 34,82", moerk);
    }

    var M = {};

    /* Svovl: klare gule krystaller paa en lys sten */
    M.svovl = svg(skygge() + moder("#b9b3a6", "#8f897d") +
        poly("40,20 54,34 46,58 30,54 26,34", "#f6e24a") + poly("40,20 54,34 46,58", "#d9bd22") + poly("40,20 26,34 30,54", "#fff07a") +
        poly("66,14 82,30 76,56 58,52 54,30", "#f3d936") + poly("66,14 82,30 76,56", "#c9a814") + poly("66,14 54,30 58,52", "#fbea66") +
        poly("86,36 98,46 92,64 80,60 78,46", "#f0d22c") + poly("86,36 98,46 92,64", "#bf9d10") +
        poly("50,40 62,48 56,66 44,62", "#f8e455") + poly("50,40 62,48 56,66", "#d2b41c"));

    /* Zinkblende: mørkebrune, harpiksblanke krystaller */
    M.zinkblende = svg(skygge() + moder("#9c958b", "#77716a") +
        poly("28,56 36,30 56,22 72,34 70,60 46,68", "#3b2a22") + poly("36,30 56,22 52,44 40,48", "#6d4429") + poly("56,22 72,34 62,46 52,44", "#2a1d18") +
        poly("52,44 62,46 70,60 46,68 40,48", "#4a3023") +
        poly("64,40 84,30 98,44 92,64 72,66", "#33241d") + poly("84,30 98,44 86,50 74,44", "#7a4d2c") + poly("74,44 86,50 92,64 72,66", "#241a15") +
        poly("42,32 50,28 48,36", "#d49a5a") + poly("80,36 88,36 84,42", "#c98a4a"));

    /* Cinnober: klart roed masse paa en lys sten */
    M.cinnober = svg(skygge() + moder("#c2bdb4", "#9a958c") +
        poly("26,58 34,36 52,26 70,30 78,48 66,64 40,68", "#c4202b") + poly("34,36 52,26 56,42 42,48", "#e4483f") + poly("52,26 70,30 68,44 56,42", "#a3151f") +
        poly("56,42 68,44 78,48 66,64 40,68 42,48", "#b01a25") +
        poly("70,44 86,38 98,50 94,66 76,68", "#cc2630") + poly("86,38 98,50 88,54 78,48", "#ea5a4c") +
        poly("38,40 46,36 44,44", "#ff8d7a"));

    /* Pyrit: gyldne terninger, vokset ind i hinanden */
    M.pyrit = svg(skygge() + moder("#8d8f8c", "#6b6d6a") +
        terning(46, 34, 24, "#f7e08a", "#cfa744", "#9a7626") +
        terning(78, 44, 18, "#f3d776", "#c69c3c", "#8f6c22") +
        terning(62, 22, 12, "#fbe9a0", "#d6b04e", "#a17d2a") +
        '<g stroke="rgba(120,88,20,0.45)" stroke-width="0.8">' +
        '<line x1="30" y1="42" x2="42" y2="49"/><line x1="30" y1="50" x2="42" y2="57"/><line x1="50" y1="52" x2="62" y2="45"/>' +
        '<line x1="50" y1="60" x2="62" y2="53"/><line x1="82" y1="60" x2="90" y2="55"/></g>' +
        poly("40,26 46,23 52,26 46,29", "rgba(255,255,255,0.55)"));

    /* Haematit: mørke, blanke nyrer med et roedligt skaer */
    M.haematit = svg('<defs><radialGradient id="hm" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#b98a84"/><stop offset="0.35" stop-color="#6b3a36"/><stop offset="1" stop-color="#2c1716"/></radialGradient></defs>' +
        skygge() +
        '<ellipse cx="60" cy="66" rx="42" ry="14" fill="#3a1f1d"/>' +
        '<circle cx="38" cy="52" r="20" fill="url(#hm)"/><circle cx="66" cy="44" r="24" fill="url(#hm)"/><circle cx="88" cy="58" r="16" fill="url(#hm)"/>' +
        '<circle cx="52" cy="62" r="13" fill="url(#hm)"/><circle cx="76" cy="66" r="11" fill="url(#hm)"/>' +
        '<path d="M22 72 q14 6 30 4" stroke="#a5352a" stroke-width="2.5" fill="none" stroke-linecap="round"/>');

    /* Magnetit: sorte oktaedre og en clips, der haenger fast */
    M.magnetit = svg(skygge() + moder("#77777a", "#58585b") +
        poly("44,18 64,44 44,70 24,44", "#2b2d33") + poly("44,18 64,44 44,48", "#4a4d55") + poly("44,18 24,44 44,48", "#3a3c43") + poly("24,44 44,48 44,70", "#1c1d22") +
        poly("78,28 96,50 78,72 60,50", "#26282d") + poly("78,28 96,50 78,54", "#454850") + poly("78,28 60,50 78,54", "#34363c") + poly("60,50 78,54 78,72", "#17181c") +
        '<path d="M88 30 l10 -12 a4 4 0 0 1 6 5 l-12 14 a2.6 2.6 0 0 1 -4 -3 l9 -11" fill="none" stroke="#c9d2da" stroke-width="1.6" stroke-linecap="round"/>');

    /* Gips: klare, hvide blade */
    M.gips = svg(skygge() + moder("#a9a59c", "#85817a") +
        poly("30,62 42,16 54,20 48,66", "#eef4f6", ' opacity="0.95"') + poly("42,16 54,20 50,40 40,34", "#ffffff") +
        poly("50,64 70,22 82,30 66,70", "#dfe8ec", ' opacity="0.92"') + poly("70,22 82,30 76,44 66,38", "#f7fbfc") +
        poly("70,66 92,40 100,50 84,72", "#cfdbe0", ' opacity="0.9"') +
        '<g stroke="rgba(120,140,150,0.5)" stroke-width="0.7"><line x1="36" y1="56" x2="46" y2="24"/><line x1="58" y1="60" x2="74" y2="30"/></g>');

    /* Malakit: groen, med baand som aarringe */
    M.malakit = svg('<defs><clipPath id="mk"><path d="M20 66 q-4 -26 20 -36 q10 -14 30 -8 q24 0 30 22 q6 16 -8 24 q-30 10 -60 6 q-10 -2 -12 -8z"/></clipPath></defs>' +
        skygge() +
        '<g clip-path="url(#mk)"><rect x="0" y="0" width="120" height="90" fill="#14613b"/>' +
        '<g fill="none" stroke-width="5">' +
        '<ellipse cx="46" cy="52" rx="34" ry="28" stroke="#2fa56a"/><ellipse cx="46" cy="52" rx="24" ry="19" stroke="#0f5a36"/><ellipse cx="46" cy="52" rx="14" ry="11" stroke="#49c483"/>' +
        '<ellipse cx="46" cy="52" rx="5" ry="4" stroke="#1f7a4d"/>' +
        '<ellipse cx="88" cy="46" rx="26" ry="22" stroke="#37b073"/><ellipse cx="88" cy="46" rx="16" ry="13" stroke="#0f5a36"/><ellipse cx="88" cy="46" rx="7" ry="6" stroke="#5ad192"/>' +
        "</g></g>" +
        '<path d="M34 34 q10 -8 22 -6" stroke="rgba(255,255,255,0.35)" stroke-width="2" fill="none" stroke-linecap="round"/>');

    NK.Mineraler = M;
}());

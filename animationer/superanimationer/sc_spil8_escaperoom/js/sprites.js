/* =====================================================================
   sprites.js - tingene i rummene som SVG

   Lys, skarp stil: lyse vaegge, moerke konturer og ingen filtre (et
   SVG-filter bliver til et billede og kan se sloeret ud paa skaermen).
   Skygger er flade ellipser. Glas staar foran lys vaeg, saa svage
   farver kan ses.

   Rummets ramme (vaeg, bord, doer, tavle) tegnes i scenens koordinater
   (viewBox 0 0 1600 900; bordpladen i y = 580, gulvet i y = 740).
   Tingene tegnes om deres eget nulpunkt (bund, midt) og saettes paa
   plads med S.paa(x, y, skala, tegning). _sprites.html viser dem alene.
   ===================================================================== */
(function () {
    "use strict";

    var S = NK.Sprites = {};
    var h = NK.html;
    var K = "#27303f";           /* konturen */
    var SKRIFT = 'font-family="Lexend, Segoe UI, sans-serif"';
    var taeller = 0;
    function id(p) { taeller++; return p + taeller; }

    /* ----- Farver ---------------------------------------------------- */
    function hexRgb(x) {
        x = x.replace("#", "");
        return [parseInt(x.substr(0, 2), 16), parseInt(x.substr(2, 2), 16), parseInt(x.substr(4, 2), 16)];
    }
    function rgbHex(c) {
        return "#" + c.map(function (v) { return ("0" + Math.round(NK.klamp(v, 0, 255)).toString(16)).slice(-2); }).join("");
    }
    /* Blander a og b: t = 0 giver a, t = 1 giver b. */
    S.bland = function (a, b, t) {
        var x = hexRgb(a), y = hexRgb(b);
        return rgbHex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; }));
    };
    S.rgb = function (c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a === undefined ? 1 : a) + ")"; };

    S.paa = function (x, y, k, tegning) {
        return '<g transform="translate(' + x + " " + y + ") scale(" + (k || 1) + ')">' + tegning + "</g>";
    };
    function skygge(b) { return '<ellipse cx="0" cy="2" rx="' + (b / 2 + 8) + '" ry="7" fill="#1b2230" fill-opacity="0.16"/>'; }

    /* ----- Faelles defs ---------------------------------------------- */
    S.defs = function () {
        function lin(navn, retning, stop) {
            return '<linearGradient id="' + navn + '" ' + retning + ">" + stop.map(function (s) {
                return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : "") + "/>";
            }).join("") + "</linearGradient>";
        }
        var vand = 'x1="0" x2="1" y1="0" y2="0"', lod = 'x1="0" x2="0" y1="0" y2="1"';
        return "<defs>" +
            lin("g-glas", vand, [[0, "#ffffff", 0.9], [0.22, "#ffffff", 0.35], [0.7, "#dcebf5", 0.3], [1, "#b9cfde", 0.55]]) +
            lin("g-glans", vand, [[0, "#ffffff", 0.55], [0.3, "#ffffff", 0], [1, "#000000", 0.12]]) +
            lin("g-bordplade", lod, [[0, "#566277"], [1, "#3b4557"]]) +
            lin("g-skab", lod, [[0, "#d5dce6"], [1, "#b9c3d0"]]) +
            lin("g-trae", lod, [[0, "#b58352"], [1, "#8c5f38"]]) +
            lin("g-metal", vand, [[0, "#9aa3ae"], [0.45, "#f1f3f6"], [1, "#8a939e"]]) +
            lin("g-metal-v", lod, [[0, "#e6e9ee"], [1, "#a3abb6"]]) +
            lin("g-guld", 'x1="0" y1="0" x2="1" y2="1"', [[0, "#fff3b0"], [0.35, "#f6cd2b"], [0.75, "#d19a12"], [1, "#f7dc6f"]]) +
            lin("g-gulv", lod, [[0, "#d9c7a8"], [1, "#c3ae8b"]]) +
            lin("g-tavle", 'x1="0" x2="1" y1="0" y2="1"', [[0, "#2f5d49"], [1, "#234838"]]) +
            lin("g-doerlys", lod, [[0, "#fff6cf"], [1, "#f3d98a"]]) +
            '<radialGradient id="g-voks" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#ef6a5e"/><stop offset="0.7" stop-color="#b72a20"/>' +
            '<stop offset="1" stop-color="#7c1711"/></radialGradient>' +
            "</defs>";
    };

    /* ----- Rummet ------------------------------------------------------ */
    /* Lys vaeg tonet af rummets farve, panel forneden og traegulv. Det
       hele gaar langt ud over billedet, saa ingen skaerm faar kanter. */
    S.vaeg = function (farve) {
        var vaeg = S.bland("#f2f4f6", farve, 0.14), panel = S.bland("#e1e6eb", farve, 0.24), liste = S.bland("#c9d0d8", farve, 0.3);
        var s = '<rect x="-1200" y="-600" width="4000" height="1340" fill="' + vaeg + '"/>' +
            '<rect x="-1200" y="470" width="4000" height="270" fill="' + panel + '"/>' +
            '<rect x="-1200" y="462" width="4000" height="10" fill="' + liste + '"/>' +
            '<rect x="-1200" y="740" width="4000" height="700" fill="url(#g-gulv)"/>';
        for (var g = -6; g < 15; g++) {
            var gx = -200 + g * 250;
            s += '<line x1="' + (800 + (gx - 800) * 0.6) + '" y1="740" x2="' + (800 + (gx - 800) * 1.7) + '" y2="1100" stroke="#8f7a5a" stroke-opacity="0.45" stroke-width="2"/>';
        }
        s += '<rect x="-1200" y="726" width="4000" height="14" fill="' + S.bland("#8d97a4", farve, 0.25) + '"/>' +
            '<line x1="-1200" y1="740" x2="2800" y2="740" stroke="' + K + '" stroke-opacity="0.55" stroke-width="2"/>';
        return s;
    };

    /* Bordet: moerk plade i y 580 til 606 og lyst skab ned til gulvet. */
    S.bord = function (x1, x2) {
        var b = x2 - x1;
        var s = '<rect x="' + (x1 + 14) + '" y="604" width="' + (b - 28) + '" height="136" fill="url(#g-skab)" stroke="' + K + '" stroke-width="3"/>';
        var n = Math.max(1, Math.round((b - 28) / 280)), d = (b - 28) / n;
        for (var i = 0; i < n; i++) {
            var lx = x1 + 14 + i * d;
            if (i > 0) s += '<line x1="' + lx + '" y1="604" x2="' + lx + '" y2="740" stroke="' + K + '" stroke-opacity="0.6" stroke-width="2"/>';
            s += '<rect x="' + (lx + d / 2 - 24) + '" y="620" width="48" height="8" rx="4" fill="url(#g-metal)" stroke="' + K + '" stroke-width="1.5"/>';
        }
        s += '<rect x="' + x1 + '" y="580" width="' + b + '" height="26" rx="4" fill="url(#g-bordplade)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + (x1 + 6) + '" y="584" width="' + (b - 12) + '" height="4" rx="2" fill="#fff" fill-opacity="0.22"/>';
        return s;
    };

    /* Doeren i rummets farve. aaben: doerbladet er drejet ind. */
    S.doer = function (x, y, b, hoejde, farve, nr, aaben) {
        var moerk = S.bland(farve, "#10151f", 0.45), lys = S.bland(farve, "#ffffff", 0.18);
        var s = '<rect x="' + (x - 18) + '" y="' + (y - 18) + '" width="' + (b + 36) + '" height="' + (hoejde + 18) + '" fill="' + moerk + '" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + hoejde + '" fill="url(#g-doerlys)"/>';
        var p1 = hoejde * 0.34, p2 = hoejde * 0.4;
        var blad = '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + hoejde + '" fill="' + farve + '" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + (x + 26) + '" y="' + (y + 28) + '" width="' + (b - 52) + '" height="' + p1 + '" rx="4" fill="' + lys + '" stroke="' + moerk + '" stroke-width="3"/>' +
            '<rect x="' + (x + 26) + '" y="' + (y + hoejde * 0.5) + '" width="' + (b - 52) + '" height="' + p2 + '" rx="4" fill="' + lys + '" stroke="' + moerk + '" stroke-width="3"/>' +
            '<circle cx="' + (x + b / 2) + '" cy="' + (y + 28 + p1 / 2) + '" r="34" fill="#fff" stroke="' + K + '" stroke-width="3"/>' +
            '<text x="' + (x + b / 2) + '" y="' + (y + 28 + p1 / 2 + 14) + '" text-anchor="middle" font-size="40" font-weight="700" fill="' + K + '" ' + SKRIFT + ">" + h(nr) + "</text>" +
            '<rect x="' + (x + 16) + '" y="' + (y + hoejde * 0.44) + '" width="46" height="12" rx="6" fill="url(#g-metal)" stroke="' + K + '" stroke-width="2"/>' +
            '<circle cx="' + (x + 24) + '" cy="' + (y + hoejde * 0.44 + 6) + '" r="10" fill="url(#g-metal)" stroke="' + K + '" stroke-width="2"/>';
        return s + '<g class="doerblad' + (aaben ? " aaben" : "") + '">' + blad + "</g>";
    };

    /* Kodelaasen ved doeren (70 x 118). Groen skaerm, naar den er aaben. */
    S.kodelaas = function (x, y, aaben) {
        var s = '<rect x="' + x + '" y="' + y + '" width="70" height="118" rx="8" fill="url(#g-metal-v)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + (x + 9) + '" y="' + (y + 9) + '" width="52" height="24" rx="3" fill="' + (aaben ? "#1f7a46" : "#1d2430") + '" stroke="' + K + '" stroke-width="1.5"/>' +
            '<text x="' + (x + 35) + '" y="' + (y + 27) + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + (aaben ? "#d9ffe6" : "#ff8f80") + '" font-family="Consolas, monospace">' + (aaben ? "ÅBEN" : "• • •") + "</text>";
        for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) {
            s += '<rect x="' + (x + 10 + c * 18) + '" y="' + (y + 42 + r * 18) + '" width="14" height="13" rx="2.5" fill="#4a5568" stroke="' + K + '" stroke-width="1"/>';
        }
        return s;
    };

    /* ----- Tavlen og kridt ---------------------------------------------- */
    S.tavle = function (x, y, b, hoejde, indhold) {
        return '<rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="' + (b + 28) + '" height="' + (hoejde + 28) + '" rx="5" fill="url(#g-trae)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + hoejde + '" fill="url(#g-tavle)" stroke="' + K + '" stroke-width="2"/>' +
            '<rect x="' + (x - 10) + '" y="' + (y + hoejde + 14) + '" width="' + (b + 20) + '" height="12" rx="2" fill="#7a5230" stroke="' + K + '" stroke-width="2"/>' +
            '<rect x="' + (x + 34) + '" y="' + (y + hoejde + 7) + '" width="30" height="8" rx="3" fill="#ffffff" stroke="' + K + '" stroke-width="1"/>' +
            '<rect x="' + (x + 74) + '" y="' + (y + hoejde + 8) + '" width="18" height="7" rx="3" fill="#f6b8b0" stroke="' + K + '" stroke-width="1"/>' +
            (indhold || "");
    };
    S.kridt = function (x, y, tekst, str, anker, vaegt) {
        return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anker || "start") + '" font-size="' + (str || 30) +
            '" font-weight="' + (vaegt || 500) + '" fill="#ffffff" ' + SKRIFT + ">" + h(tekst) + "</text>";
    };

    /* Skilt ved en ting. type: "aktiv" (det trin, I er ved), "loest",
       "bonus" eller ingenting. */
    S.skilt = function (x, y, tekst, type) {
        var aktiv = type === "aktiv", loest = type === "loest", bonus = type === "bonus";
        var vist = (loest ? "✓ " : bonus ? "★ " : "") + tekst;
        var str = aktiv ? 25 : 23, b = Math.round(vist.length * str * 0.6 + 36), hh = aktiv ? 48 : 44;
        var fyld = bonus ? K : aktiv ? "#ffd43b" : loest ? "#d8f1e1" : "#fff4c7";
        var kant = bonus ? "#f1c40f" : aktiv ? K : loest ? "#2b7d51" : "#9a7b14";
        var farve = bonus ? "#ffe07a" : loest ? "#1f5a3a" : "#33290a";
        var s = '<g class="skilt">';
        if (aktiv) s += '<rect x="' + (x - b / 2 - 6) + '" y="' + (y - hh / 2 - 6) + '" width="' + (b + 12) + '" height="' + (hh + 12) + '" rx="16" fill="none" stroke="#ffd43b" stroke-width="5"/>';
        s += '<rect x="' + (x - b / 2) + '" y="' + (y - hh / 2) + '" width="' + b + '" height="' + hh + '" rx="11" fill="' + fyld + '" stroke="' + kant + '" stroke-width="' + (aktiv || bonus ? 3.5 : 2.5) + '"/>' +
            '<text x="' + x + '" y="' + (y + str * 0.35) + '" text-anchor="middle" font-size="' + str + '" font-weight="600" fill="' + farve + '" ' + SKRIFT + ">" + h(vist) + "</text></g>";
        return s;
    };

    /* ----- Glas og flasker (nulpunkt: bund, midt) ---------------------- */
    function vaeskeI(form, x0, bredde, top, vaeske, alfa) {
        var k = id("kl");
        return '<clipPath id="' + k + '"><path d="' + form + '"/></clipPath>' +
            '<rect x="' + x0 + '" y="' + top + '" width="' + bredde + '" height="' + (-top + 4) + '" fill="' + S.rgb(vaeske, alfa || 0.92) + '" clip-path="url(#' + k + ')"/>' +
            '<line x1="' + x0 + '" y1="' + top + '" x2="' + (x0 + bredde) + '" y2="' + top + '" stroke="' + K + '" stroke-opacity="0.5" stroke-width="1.5" clip-path="url(#' + k + ')"/>';
    }

    /* Reagensglas. lag: [{ farve, andel }] fra bunden (andel af hoejden).
       fast: [r,g,b] krystaller paa bunden. */
    S.reagensglas = function (hoejde, lag, fast) {
        var b = 36, r = b / 2;
        var form = "M" + (-r) + " " + (-hoejde) + " L" + (-r) + " " + (-r) + " A" + r + " " + r + " 0 0 0 " + r + " " + (-r) + " L" + r + " " + (-hoejde) + " Z";
        var s = skygge(b), bund = 0;
        (lag || []).forEach(function (l) {
            /* tegn fra toppen af laget og ned; det nederste lag ligger oeverst i z-orden sidst */
            bund += l.andel;
        });
        var top = bund;
        (lag || []).slice().reverse().forEach(function (l) {
            s += vaeskeI(form, -r, b, -hoejde * top, l.farve);
            top -= l.andel;
        });
        if (fast) {
            [[-8, -6], [0, -4], [8, -7], [-3, -11], [5, -12]].forEach(function (p) {
                s += '<rect x="' + (p[0] - 3) + '" y="' + (p[1] - 3) + '" width="6" height="6" transform="rotate(20 ' + p[0] + " " + p[1] + ')" fill="' + S.rgb(fast) + '" stroke="' + K + '" stroke-width="1"/>';
            });
        }
        s += '<path d="' + form + '" fill="url(#g-glas)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + (-r - 4) + '" y="' + (-hoejde - 5) + '" width="' + (b + 8) + '" height="9" rx="4" fill="#eef5fa" stroke="' + K + '" stroke-width="2.5"/>' +
            '<line x1="' + (-r + 7) + '" y1="' + (-hoejde + 14) + '" x2="' + (-r + 7) + '" y2="' + (-r - 4) + '" stroke="#fff" stroke-opacity="0.9" stroke-width="3" stroke-linecap="round"/>';
        return s;
    };

    /* Draabeflaske i brunt glas med pipette og etiket (54 x 128). */
    S.draabeflaske = function (etiket) {
        return skygge(54) +
            '<rect x="-27" y="-84" width="54" height="84" rx="10" fill="#9a5a26" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="-21" y="-78" width="8" height="66" rx="4" fill="#fff" fill-opacity="0.3"/>' +
            '<rect x="-11" y="-104" width="22" height="22" rx="3" fill="#39414f" stroke="' + K + '" stroke-width="2.5"/>' +
            '<path d="M-8 -104 Q0 -142 8 -104 Z" fill="#ffffff" stroke="' + K + '" stroke-width="2.5"/>' +
            '<rect x="-23" y="-62" width="46" height="34" rx="3" fill="#ffffff" stroke="' + K + '" stroke-width="2"/>' +
            '<text x="0" y="-39" text-anchor="middle" font-size="' + (etiket.length > 4 ? 11 : etiket.length > 2 ? 14 : 16) + '" font-weight="700" fill="' + K + '" ' + SKRIFT + ">" + h(etiket) + "</text>";
    };

    /* Draabeplade af hvidt porcelaen set skraat oppefra. fyld[r][c]:
       { vaeske: [r,g,b], bundfald: [r,g,b] eller null } for de broende,
       der er dryppet i. Nulpunkt: bund, venstre. */
    S.draabeplade = function (raekker, soejler, fyld) {
        var b = soejler * 54 + 36, hh = raekker * 17 + 20;
        var s = '<polygon points="20,' + (-hh) + " " + (b - 20) + "," + (-hh) + " " + b + ",-10 0,-10" + '" fill="#ffffff" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="0" y="-11" width="' + b + '" height="11" rx="2" fill="#dfe3e8" stroke="' + K + '" stroke-width="3"/>';
        for (var r = 0; r < raekker; r++) {
            var k = 0.8 + 0.2 * r / Math.max(1, raekker - 1), ry = -hh + 13 + r * 17;
            for (var c = 0; c < soejler; c++) {
                var cx = b / 2 + (c - (soejler - 1) / 2) * 54 * k, rx = 17 * k;
                var f = fyld && fyld[r] && fyld[r][c];
                s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + ry + '" rx="' + rx.toFixed(1) + '" ry="5.5" fill="' + (f ? S.rgb(f.vaeske) : "#e9edf1") + '" stroke="' + K + '" stroke-opacity="0.7" stroke-width="1.5"/>';
                if (f && f.bundfald) {
                    s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + (ry + 0.5) + '" rx="' + (rx * 0.62).toFixed(1) + '" ry="3.4" fill="' + S.rgb(f.bundfald) + '" stroke="' + K + '" stroke-width="1"/>';
                }
            }
        }
        return s;
    };

    /* Reagensflaske med skruelaag. vaeske [r,g,b] eller null. */
    S.flaske = function (b, hoejde, etiket, vaeske, laagFarve) {
        var hals = b * 0.42, x = 0, y = 0;
        var krop = "M" + (x - b / 2) + " " + (y - 12) + " Q" + (x - b / 2) + " " + y + " " + (x - b / 2 + 12) + " " + y + " L" + (x + b / 2 - 12) + " " + y +
            " Q" + (x + b / 2) + " " + y + " " + (x + b / 2) + " " + (y - 12) + " L" + (x + b / 2) + " " + (y - hoejde * 0.7) +
            " Q" + (x + b / 2) + " " + (y - hoejde * 0.82) + " " + (x + hals / 2) + " " + (y - hoejde * 0.86) + " L" + (x + hals / 2) + " " + (y - hoejde) +
            " L" + (x - hals / 2) + " " + (y - hoejde) + " L" + (x - hals / 2) + " " + (y - hoejde * 0.86) +
            " Q" + (x - b / 2) + " " + (y - hoejde * 0.82) + " " + (x - b / 2) + " " + (y - hoejde * 0.7) + " Z";
        var s = skygge(b);
        if (vaeske) s += vaeskeI(krop, -b / 2, b, -hoejde * 0.64, vaeske);
        s += '<path d="' + krop + '" fill="url(#g-glas)" stroke="' + K + '" stroke-width="3"/>' +
            '<line x1="' + (-b / 2 + 9) + '" y1="' + (-hoejde * 0.68) + '" x2="' + (-b / 2 + 9) + '" y2="-16" stroke="#fff" stroke-opacity="0.9" stroke-width="4" stroke-linecap="round"/>' +
            '<rect x="' + (-hals / 2 - 5) + '" y="' + (-hoejde - 18) + '" width="' + (hals + 10) + '" height="22" rx="4" fill="' + (laagFarve || "#2f5fa8") + '" stroke="' + K + '" stroke-width="3"/>';
        if (etiket !== null && etiket !== undefined) {
            var eb = b * 0.8, eh = hoejde * 0.3;
            s += '<rect x="' + (-eb / 2) + '" y="' + (-hoejde * 0.56) + '" width="' + eb + '" height="' + eh + '" rx="3" fill="#ffffff" stroke="' + K + '" stroke-width="2"/>';
            if (etiket) {
                s += '<text x="0" y="' + (-hoejde * 0.56 + eh * 0.66) + '" text-anchor="middle" font-size="' + Math.min(26, eb / Math.max(3, etiket.length) * 1.45).toFixed(1) +
                    '" font-weight="700" fill="' + K + '" ' + SKRIFT + ">" + h(etiket) + "</text>";
            } else {
                s += '<line x1="' + (-eb / 2 + 8) + '" y1="' + (-hoejde * 0.56 + eh * 0.38) + '" x2="' + (eb / 2 - 8) + '" y2="' + (-hoejde * 0.56 + eh * 0.38) + '" stroke="' + K + '" stroke-opacity="0.45" stroke-width="2.5"/>' +
                    '<line x1="' + (-eb / 2 + 8) + '" y1="' + (-hoejde * 0.56 + eh * 0.68) + '" x2="' + (eb / 2 - 20) + '" y2="' + (-hoejde * 0.56 + eh * 0.68) + '" stroke="' + K + '" stroke-opacity="0.45" stroke-width="2.5"/>';
            }
        }
        return s;
    };

    /* Erlenmeyerkolbe. bobler: der dannes gas. */
    S.kolbe = function (b, hoejde, vaeske, fyld, bobler) {
        var hals = b * 0.3;
        var form = "M" + (-hals / 2) + " " + (-hoejde) + " L" + (-hals / 2) + " " + (-hoejde * 0.68) + " L" + (-b / 2) + " -8" +
            " Q" + (-b / 2) + " 0 " + (-b / 2 + 10) + " 0 L" + (b / 2 - 10) + " 0 Q" + (b / 2) + " 0 " + (b / 2) + " -8" +
            " L" + (hals / 2) + " " + (-hoejde * 0.68) + " L" + (hals / 2) + " " + (-hoejde) + " Z";
        var s = skygge(b), top = -hoejde * (fyld || 0.36);
        if (vaeske) s += vaeskeI(form, -b / 2, b, top, vaeske);
        if (bobler) {
            [[-18, 0.3], [4, 0.55], [20, 0.25], [-6, 0.75], [12, 0.85], [-22, 0.6]].forEach(function (p) {
                s += '<circle cx="' + p[0] + '" cy="' + (top * p[1] - 4) + '" r="' + (3 + p[1] * 3) + '" fill="#fff" stroke="' + K + '" stroke-width="1.3"/>';
            });
        }
        s += '<path d="' + form + '" fill="url(#g-glas)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + (-hals / 2 - 5) + '" y="' + (-hoejde - 6) + '" width="' + (hals + 10) + '" height="9" rx="4" fill="#eef5fa" stroke="' + K + '" stroke-width="2.5"/>' +
            '<line x1="' + (-b / 2 + 16) + '" y1="-14" x2="' + (-hals / 2 + 5) + '" y2="' + (-hoejde * 0.66) + '" stroke="#fff" stroke-opacity="0.9" stroke-width="4" stroke-linecap="round"/>';
        return s;
    };

    /* Prop, slange og gassproejte til kolben (nulpunkt: kolbens munding).
       ude: 0 til 1, hvor langt stemplet er skubbet ud. */
    S.gassproejte = function (ude) {
        var e = 20 + 90 * (ude || 0);
        return '<path d="M0 -4 L0 -40 Q0 -60 20 -60 L70 -60" fill="none" stroke="' + K + '" stroke-width="9" stroke-linecap="round"/>' +
            '<path d="M0 -4 L0 -40 Q0 -60 20 -60 L70 -60" fill="none" stroke="#f0b24a" stroke-width="4" stroke-linecap="round"/>' +
            '<rect x="-13" y="-10" width="26" height="16" rx="3" fill="#8a5a3a" stroke="' + K + '" stroke-width="2.5"/>' +
            '<rect x="70" y="-80" width="170" height="40" rx="6" fill="url(#g-glas)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="' + (70 + e) + '" y="-76" width="10" height="32" fill="#39414f"/>' +
            '<rect x="' + (80 + e) + '" y="-65" width="' + (190 - e) + '" height="10" fill="url(#g-metal)" stroke="' + K + '" stroke-width="2"/>' +
            '<rect x="' + (270) + '" y="-78" width="10" height="36" rx="3" fill="#39414f" stroke="' + K + '" stroke-width="2"/>';
    };

    /* Stativ med burette. Nulpunkt: stativets fod, midt under buretten.
       laengde: burettens roer. tomt: 0 til 1, hvor stor en del der er
       loebet ud. */
    S.burette = function (laengde, vaeske, tomt) {
        var bund = -150, top = bund - laengde, b = 24;
        var vt = top + 26 + (laengde - 60) * (tomt || 0) * 0.6;
        var s = '<rect x="-95" y="-14" width="190" height="16" rx="5" fill="#4a5568" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="-80" y="' + (top - 20) + '" width="11" height="' + (-top + 8) + '" fill="url(#g-metal)" stroke="' + K + '" stroke-width="2.5"/>' +
            '<rect x="-82" y="' + (top + 90) + '" width="78" height="13" rx="4" fill="#4a5568" stroke="' + K + '" stroke-width="2.5"/>';
        if (vaeske) s += '<rect x="' + (-b / 2 + 2) + '" y="' + vt + '" width="' + (b - 4) + '" height="' + (bund - vt) + '" fill="' + S.rgb(vaeske, 0.95) + '"/>';
        s += '<rect x="' + (-b / 2) + '" y="' + top + '" width="' + b + '" height="' + laengde + '" rx="4" fill="url(#g-glas)" stroke="' + K + '" stroke-width="3"/>';
        for (var i = 0; i <= 10; i++) {
            var ly = top + 26 + i * (laengde - 60) / 10;
            s += '<line x1="' + (-b / 2 + 2) + '" y1="' + ly + '" x2="' + (-b / 2 + (i % 5 === 0 ? 14 : 9)) + '" y2="' + ly + '" stroke="' + K + '" stroke-width="2"/>';
        }
        s += '<rect x="-5" y="' + bund + '" width="10" height="40" fill="#eef5fa" stroke="' + K + '" stroke-width="2.5"/>' +
            '<rect x="-22" y="' + (bund + 12) + '" width="44" height="12" rx="5" fill="#2f6fd0" stroke="' + K + '" stroke-width="2.5"/>' +
            '<path d="M-4 ' + (bund + 40) + " L0 " + (bund + 56) + " L4 " + (bund + 40) + ' Z" fill="#eef5fa" stroke="' + K + '" stroke-width="2"/>';
        return s;
    };

    /* Laboratorievaegt med display. metal: symbolet, hvis metallet ligger
       paa vaegten. (240 bred) */
    S.vaegt = function (display, metal) {
        var s = skygge(240) +
            '<rect x="-120" y="-70" width="240" height="70" rx="10" fill="#f5f6f8" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="-92" y="-92" width="184" height="18" rx="5" fill="url(#g-metal)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="-68" y="-54" width="136" height="40" rx="5" fill="#16321f" stroke="' + K + '" stroke-width="2.5"/>' +
            '<text x="58" y="-24" text-anchor="end" font-size="28" font-weight="700" fill="#8dffaa" font-family="Consolas, monospace">' + h(display) + "</text>" +
            '<circle cx="-96" cy="-34" r="8" fill="#d8443a" stroke="' + K + '" stroke-width="2"/><circle cx="96" cy="-34" r="8" fill="#9aa3ae" stroke="' + K + '" stroke-width="2"/>';
        if (metal) s += S.paa(0, -92, 1, S.vejebaad(metal));
        return s;
    };
    /* Vejebaad med metallet (nulpunkt: bund, midt). */
    S.vejebaad = function (metal) {
        var s = '<path d="M-58 0 L-46 -22 L46 -22 L58 0 Z" fill="#ffffff" stroke="' + K + '" stroke-width="2.5"/>';
        var y = -20;
        if (metal === "Mg") {
            s += '<path d="M-34 ' + y + ' q 12 -20 24 0 t 24 0 t 24 0" fill="none" stroke="' + K + '" stroke-width="7" stroke-linecap="round"/>' +
                '<path d="M-34 ' + y + ' q 12 -20 24 0 t 24 0 t 24 0" fill="none" stroke="#d5d9df" stroke-width="3.5" stroke-linecap="round"/>';
        } else if (metal === "Al") {
            s += '<path d="M-32 ' + y + ' l 14 -14 l 10 9 l 12 -11 l 8 13 l 12 -7 l 8 10 Z" fill="#e8ebef" stroke="' + K + '" stroke-width="2"/>';
        } else if (metal === "Zn") {
            [[-26, 0], [-12, -4], [2, 0], [16, -3], [28, 0], [-4, -11], [10, -12]].forEach(function (p) {
                s += '<circle cx="' + p[0] + '" cy="' + (y + p[1] - 2) + '" r="7" fill="#aab2bb" stroke="' + K + '" stroke-width="1.8"/>';
            });
        } else {
            s += '<path d="M-36 ' + y + " Q-20 " + (y - 22) + " 0 " + (y - 18) + " Q22 " + (y - 22) + " 36 " + y + ' Z" fill="#565b63" stroke="' + K + '" stroke-width="2"/>';
        }
        return s;
    };

    /* Vejrstation med termometer og barometer (nulpunkt: oeverst, venstre; 220 x 270). */
    S.vejrstation = function (tTekst, pTekst) {
        return '<rect x="0" y="0" width="220" height="270" rx="12" fill="url(#g-trae)" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="28" y="24" width="20" height="150" rx="10" fill="#ffffff" stroke="' + K + '" stroke-width="2.5"/>' +
            '<rect x="35" y="80" width="6" height="100" fill="#e0483a"/>' +
            '<circle cx="38" cy="186" r="15" fill="#e0483a" stroke="' + K + '" stroke-width="2.5"/>' +
            '<circle cx="138" cy="84" r="58" fill="#ffffff" stroke="' + K + '" stroke-width="3"/>' +
            '<circle cx="138" cy="84" r="50" fill="none" stroke="#9aa3ae" stroke-width="2" stroke-dasharray="3 9"/>' +
            '<line x1="138" y1="84" x2="164" y2="46" stroke="' + K + '" stroke-width="4" stroke-linecap="round"/>' +
            '<circle cx="138" cy="84" r="6" fill="' + K + '"/>' +
            '<rect x="66" y="160" width="140" height="42" rx="5" fill="#16321f" stroke="' + K + '" stroke-width="2.5"/>' +
            '<text x="196" y="190" text-anchor="end" font-size="26" font-weight="700" fill="#8dffaa" font-family="Consolas, monospace">' + h(tTekst) + "</text>" +
            '<rect x="20" y="212" width="186" height="42" rx="5" fill="#16321f" stroke="' + K + '" stroke-width="2.5"/>' +
            '<text x="196" y="242" text-anchor="end" font-size="26" font-weight="700" fill="#8dffaa" font-family="Consolas, monospace">' + h(pTekst) + "</text>";
    };

    /* Hylde paa vaeggen (nulpunkt: oeverst, venstre). */
    S.hylde = function (b) {
        return '<path d="M34 16 l0 34 l30 -34 Z" fill="#7a5230" stroke="' + K + '" stroke-width="2.5"/>' +
            '<path d="M' + (b - 34) + ' 16 l0 34 l-30 -34 Z" fill="#7a5230" stroke="' + K + '" stroke-width="2.5"/>' +
            '<rect x="0" y="0" width="' + b + '" height="18" rx="3" fill="url(#g-trae)" stroke="' + K + '" stroke-width="3"/>';
    };

    /* Bonusskrinet: moerkt skrin med guldkant og stjerne (130 x 104). */
    S.skrin = function (guld) {
        return skygge(130) +
            '<rect x="-65" y="-84" width="130" height="84" rx="8" fill="#2c3545" stroke="' + K + '" stroke-width="3"/>' +
            '<path d="M-65 -76 Q-65 -108 -30 -108 L30 -108 Q65 -108 65 -76 Z" fill="#39445a" stroke="' + K + '" stroke-width="3"/>' +
            '<rect x="-65" y="-80" width="130" height="10" fill="url(#g-guld)" stroke="' + K + '" stroke-width="2"/>' +
            '<rect x="-14" y="-88" width="28" height="30" rx="5" fill="url(#g-guld)" stroke="' + K + '" stroke-width="2.5"/>' +
            '<circle cx="0" cy="-74" r="4.5" fill="' + K + '"/>' +
            '<polygon points="0,-48 6,-34 21,-33 9,-23 13,-8 0,-16 -13,-8 -9,-23 -21,-33 -6,-34" fill="' + (guld ? "url(#g-guld)" : "#f6cd2b") + '" stroke="' + K + '" stroke-width="2"/>';
    };

    /* Aaben notesbog (bruges ikke i rummene nu, men vises i _sprites). */

    /* Plakat med et lille periodisk system (nulpunkt: oeverst, venstre). */
    S.plakat = function (b) {
        var c = (b - 28) / 18, hh = c * 9.6 + 64;
        var s = '<rect x="0" y="0" width="' + b + '" height="' + hh + '" fill="#ffffff" stroke="' + K + '" stroke-width="3"/>' +
            '<text x="' + (b / 2) + '" y="36" text-anchor="middle" font-size="24" font-weight="700" fill="' + K + '" ' + SKRIFT + ">Det periodiske system</text>";
        S.pladser().forEach(function (p) {
            var px = 14 + (p.kol - 1) * c, py = 52 + (p.raekke - 1) * c + (p.raekke > 7 ? c * 0.6 : 0);
            s += '<rect x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" width="' + (c - 1.5).toFixed(1) + '" height="' + (c - 1.5).toFixed(1) + '" fill="' + p.farve + '" stroke="' + K + '" stroke-opacity="0.35" stroke-width="1"/>';
        });
        return s;
    };

    /* Pladsen for hvert grundstof: raekke 1-7 og to f-raekker (8, 9). */
    var PLADSER = null;
    S.pladser = function () {
        if (PLADSER) return PLADSER;
        PLADSER = [];
        var D = NK.D;
        function farve(Z, kol, raekke) {
            if (raekke > 7) return "#d5c4f2";
            if (kol === 18) return "#bfe6cb";
            if (kol <= 2 && Z !== 1) return "#f6b3ae";
            if (kol >= 3 && kol <= 12) return "#b1d8f4";
            return "#f8dc97";
        }
        for (var Z = 1; Z <= 118; Z++) {
            var kol, raekke;
            if (Z === 1) { raekke = 1; kol = 1; }
            else if (Z === 2) { raekke = 1; kol = 18; }
            else if (Z <= 18) {
                raekke = Z <= 10 ? 2 : 3;
                var i = Z - (raekke === 2 ? 3 : 11);
                kol = i < 2 ? i + 1 : i + 11;
            } else if (Z <= 54) { raekke = Z <= 36 ? 4 : 5; kol = Z - (raekke === 4 ? 18 : 36); }
            else {
                var start = Z <= 86 ? 55 : 87;
                raekke = Z <= 86 ? 6 : 7;
                var j = Z - start;
                if (j <= 2) kol = j + 1;
                else if (j <= 16) { raekke = raekke === 6 ? 8 : 9; kol = j + 1; }
                else kol = j - 13;
            }
            PLADSER.push({ Z: Z, sym: D.SYMBOLER[Z - 1], kol: kol, raekke: raekke, farve: farve(Z, kol, raekke) });
        }
        return PLADSER;
    };

    /* ----- Noegler og segl ------------------------------------------------ */
    /* En noegle med hovedet til venstre, ca. 80 x 32. */
    S.noegle = function (x, y, fyld, kant, skala) {
        var k = skala || 1;
        return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')">' +
            '<circle cx="16" cy="16" r="14" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2.5"/>' +
            '<circle cx="16" cy="16" r="5.5" fill="' + kant + '"/>' +
            '<rect x="28" y="12" width="48" height="8" rx="2" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2"/>' +
            '<rect x="56" y="18" width="7" height="12" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2"/>' +
            '<rect x="67" y="18" width="7" height="9" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2"/></g>';
    };

    /* Voksseglet med et maerke (nulpunkt: midten). brudt: revnet og mat. */
    S.segl = function (maerke, brudt) {
        if (brudt) {
            return '<path d="M-44 -6 Q-46 -40 -8 -44 L -2 -8 L -14 10 L -6 44 Q-44 40 -44 -6 Z" fill="#c9a9a4" stroke="' + K + '" stroke-width="2.5"/>' +
                '<path d="M8 -44 Q46 -40 44 0 Q42 40 4 44 L 10 12 L -2 -8 Z" fill="#c9a9a4" stroke="' + K + '" stroke-width="2.5" transform="translate(10 4) rotate(7)"/>';
        }
        return '<path d="M0 -46 Q20 -48 32 -36 Q48 -26 44 -4 Q50 18 34 34 Q18 50 -4 45 Q-28 48 -38 30 Q-50 12 -44 -10 Q-42 -36 -18 -44 Q-10 -48 0 -46 Z" fill="url(#g-voks)" stroke="' + K + '" stroke-width="3"/>' +
            '<circle r="30" fill="none" stroke="#5a0f0a" stroke-opacity="0.6" stroke-width="3"/>' + maerke;
    };
    S.SEGLMAERKER = {
        million: '<text y="12" text-anchor="middle" font-size="34" font-weight="700" fill="#4a0b07" font-family="Georgia, serif">M</text>',
        syregalgen: '<text y="10" text-anchor="middle" font-size="26" font-weight="700" fill="#4a0b07" ' + SKRIFT + ">pH</text>",
        pacman: '<path d="M0 0 L18 -12 A21 21 0 1 0 18 12 Z" fill="#4a0b07"/>',
        organisk: '<polygon points="0,-20 17,-10 17,10 0,20 -17,10 -17,-10" fill="none" stroke="#4a0b07" stroke-width="4"/>'
    };

    /* ----- Molekyler som kugle-og-pind i en kasse paa 200 x 150 --------- */
    S.molekyle = function (t, b, hh) {
        var D = NK.D;
        var s = '<svg viewBox="0 0 200 150" width="' + (b || 170) + '" height="' + (hh || 128) + '" aria-hidden="true">';
        t.b.forEach(function (bd) {
            var a = t.a[bd[0]], c = t.a[bd[1]], type = bd[2];
            var dx = c[1] - a[1], dy = c[2] - a[2], l = Math.sqrt(dx * dx + dy * dy), nx = -dy / l, ny = dx / l;
            if (type === "k") {
                s += '<polygon points="' + a[1] + "," + a[2] + " " + (c[1] + nx * 7) + "," + (c[2] + ny * 7) + " " + (c[1] - nx * 7) + "," + (c[2] - ny * 7) + '" fill="' + K + '"/>';
            } else if (type === "s") {
                s += '<line x1="' + a[1] + '" y1="' + a[2] + '" x2="' + c[1] + '" y2="' + c[2] + '" stroke="' + K + '" stroke-width="3.5" stroke-dasharray="4 4"/>';
            } else {
                for (var i = 0; i < type; i++) {
                    var o = (i - (type - 1) / 2) * 7;
                    s += '<line x1="' + (a[1] + nx * o) + '" y1="' + (a[2] + ny * o) + '" x2="' + (c[1] + nx * o) + '" y2="' + (c[2] + ny * o) + '" stroke="' + K + '" stroke-width="3.5"/>';
                }
            }
        });
        (t.f || []).forEach(function (fp) {
            var a = t.a[fp[0]], r = D.ATOM[a[0]].r + 9, v = fp[1] * Math.PI / 180;
            var cx = a[1] + Math.cos(v) * r, cy = a[2] + Math.sin(v) * r, px = -Math.sin(v) * 4.5, py = Math.cos(v) * 4.5;
            s += '<circle cx="' + (cx + px) + '" cy="' + (cy + py) + '" r="3" fill="' + K + '"/><circle cx="' + (cx - px) + '" cy="' + (cy - py) + '" r="3" fill="' + K + '"/>';
        });
        t.a.forEach(function (a) {
            var at = D.ATOM[a[0]];
            s += '<circle cx="' + a[1] + '" cy="' + a[2] + '" r="' + at.r + '" fill="' + at.farve + '" stroke="' + K + '" stroke-width="2.5"/>' +
                '<circle cx="' + (a[1] - at.r * 0.32) + '" cy="' + (a[2] - at.r * 0.36) + '" r="' + (at.r * 0.28) + '" fill="#fff" fill-opacity="0.5"/>' +
                '<text x="' + a[1] + '" y="' + (a[2] + 6) + '" text-anchor="middle" font-size="' + (a[0].length > 1 ? 15 : 18) + '" font-weight="700" fill="' +
                (at.moerkTekst ? K : "#fff") + '" ' + SKRIFT + ">" + a[0] + "</text>";
        });
        return s + "</svg>";
    };

    S.KONTUR = K;
}());

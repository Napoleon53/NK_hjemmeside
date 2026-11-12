/* =====================================================================
   sprites.js - tingene i rummene som SVG

   Hver funktion giver et stykke SVG som tekst i scenens koordinater
   (viewBox 0 0 1600 900). Vaeggen gaar til y = 720, bordpladen ligger
   i y = 540. _sprites.html viser dem alene.
   ===================================================================== */
(function () {
    "use strict";

    var S = NK.Sprites = {};
    var h = NK.html;

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

    /* ----- Faelles defs ---------------------------------------------- */
    S.defs = function () {
        return '<defs>' +
            '<linearGradient id="g-glas" x1="0" x2="1" y1="0" y2="0">' +
            '<stop offset="0" stop-color="#fff" stop-opacity="0.38"/><stop offset="0.18" stop-color="#fff" stop-opacity="0.1"/>' +
            '<stop offset="0.7" stop-color="#fff" stop-opacity="0.04"/><stop offset="0.88" stop-color="#fff" stop-opacity="0.26"/>' +
            '<stop offset="1" stop-color="#fff" stop-opacity="0.08"/></linearGradient>' +
            '<linearGradient id="g-vaeske" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.18"/>' +
            '<stop offset="0.35" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.25"/></linearGradient>' +
            '<linearGradient id="g-bordplade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4b5160"/><stop offset="1" stop-color="#30343e"/></linearGradient>' +
            '<linearGradient id="g-skab" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3a3530"/><stop offset="1" stop-color="#2a2622"/></linearGradient>' +
            '<linearGradient id="g-trae" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7a5636"/><stop offset="1" stop-color="#553a24"/></linearGradient>' +
            '<linearGradient id="g-metal" x1="0" x2="1"><stop offset="0" stop-color="#7d848e"/><stop offset="0.45" stop-color="#dfe3e8"/>' +
            '<stop offset="1" stop-color="#6f767f"/></linearGradient>' +
            '<linearGradient id="g-metal-v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c9ced5"/><stop offset="1" stop-color="#7a818b"/></linearGradient>' +
            '<linearGradient id="g-guld" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.35" stop-color="#f1c40f"/>' +
            '<stop offset="0.7" stop-color="#b8860b"/><stop offset="1" stop-color="#f7dc6f"/></linearGradient>' +
            '<linearGradient id="g-jern" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b5bac0"/><stop offset="0.5" stop-color="#6c7178"/>' +
            '<stop offset="1" stop-color="#9aa0a7"/></linearGradient>' +
            '<linearGradient id="g-gulv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2e241b"/><stop offset="1" stop-color="#16110d"/></linearGradient>' +
            '<linearGradient id="g-tavle" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2b4236"/><stop offset="1" stop-color="#1c2c24"/></linearGradient>' +
            '<linearGradient id="g-doer" x1="0" x2="1"><stop offset="0" stop-color="#3d3b42"/><stop offset="1" stop-color="#2a292f"/></linearGradient>' +
            '<radialGradient id="g-lys" cx="0.5" cy="0" r="0.75"><stop offset="0" stop-color="#ffefc8" stop-opacity="0.2"/>' +
            '<stop offset="1" stop-color="#ffefc8" stop-opacity="0"/></radialGradient>' +
            '<radialGradient id="g-doerlys" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stop-color="#ffe7a8"/><stop offset="1" stop-color="#7a5a26"/></radialGradient>' +
            '<radialGradient id="g-voks" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#e2574c"/><stop offset="0.7" stop-color="#a5241b"/>' +
            '<stop offset="1" stop-color="#6e140e"/></radialGradient>' +
            '<radialGradient id="g-kugle" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/>' +
            '<stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></radialGradient>' +
            '<filter id="f-skygge" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.45"/></filter>' +
            '<filter id="f-glod" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>' +
            '</defs>';
    };

    /* ----- Rummet ------------------------------------------------------ */
    /* Vaeg, gulv og lampe. farve er rummets farve, som toner vaeggen. */
    S.vaeg = function (farve) {
        var vaeg = S.bland("#1d2029", farve, 0.13), under = S.bland("#16181f", farve, 0.1);
        /* Vaeggen og gulvet gaar langt ud over billedet, saa en bred eller
           hoej skaerm ikke faar sorte kanter. */
        var s = '<rect x="-1200" y="-600" width="4000" height="1320" fill="' + vaeg + '"/>';
        for (var x = -1100; x < 2800; x += 200) s += '<line x1="' + x + '" y1="-600" x2="' + x + '" y2="470" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>';
        s += '<rect x="-1200" y="470" width="4000" height="250" fill="' + under + '"/>' +
            '<rect x="-1200" y="466" width="4000" height="6" fill="#000" fill-opacity="0.25"/>';
        s += '<rect x="-1200" y="720" width="4000" height="700" fill="url(#g-gulv)"/>';
        for (var g = -4; g < 13; g++) {
            var gx = -200 + g * 250;
            s += '<line x1="' + (800 + (gx - 800) * 0.55) + '" y1="720" x2="' + (800 + (gx - 800) * 1.6) + '" y2="1100" stroke="#000" stroke-opacity="0.28" stroke-width="2"/>';
        }
        s += '<rect x="-1200" y="706" width="4000" height="14" fill="#0e0f13" fill-opacity="0.85"/>';
        /* Lampen og lyskeglen */
        s += '<polygon points="760,52 840,52 1180,720 420,720" fill="url(#g-lys)"/>' +
            '<line x1="800" y1="0" x2="800" y2="34" stroke="#111" stroke-width="3"/>' +
            '<path d="M762 56 Q800 26 838 56 Z" fill="#2c2f36" stroke="#111" stroke-width="2"/>' +
            '<ellipse cx="800" cy="57" rx="22" ry="5" fill="#fff4cf" opacity="0.9"/>';
        return s;
    };

    /* Bordet: plade i y 540 til 562 og skab ned til gulvet. */
    S.bord = function (x1, x2) {
        var b = x2 - x1;
        var s = '<g filter="url(#f-skygge)">' +
            '<rect x="' + (x1 + 10) + '" y="560" width="' + (b - 20) + '" height="152" fill="url(#g-skab)"/>' +
            '<rect x="' + x1 + '" y="540" width="' + b + '" height="22" rx="3" fill="url(#g-bordplade)"/>' +
            '<rect x="' + x1 + '" y="540" width="' + b + '" height="3" fill="#fff" fill-opacity="0.12"/></g>';
        var n = Math.max(1, Math.round((b - 20) / 260)), d = (b - 20) / n;
        for (var i = 0; i < n; i++) {
            var lx = x1 + 10 + i * d;
            s += '<rect x="' + (lx + 8) + '" y="574" width="' + (d - 16) + '" height="124" rx="3" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="2"/>' +
                '<rect x="' + (lx + d / 2 - 20) + '" y="584" width="40" height="6" rx="3" fill="url(#g-metal)"/>';
        }
        return s;
    };

    /* Doeren med karm i rummets farve. aaben: doerbladet er drejet ind. */
    S.doer = function (x, y, b, hoejde, farve, nr, aaben) {
        var karm = S.bland(farve, "#000000", 0.35);
        var s = '<rect x="' + (x - 16) + '" y="' + (y - 16) + '" width="' + (b + 32) + '" height="' + (hoejde + 16) + '" rx="4" fill="' + karm + '"/>' +
            '<rect x="' + (x - 16) + '" y="' + (y - 16) + '" width="' + (b + 32) + '" height="' + (hoejde + 16) + '" rx="4" fill="none" stroke="' + farve + '" stroke-width="4"/>' +
            '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + hoejde + '" fill="url(#g-doerlys)"/>';
        var blad = '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + hoejde + '" fill="url(#g-doer)" stroke="#15151a" stroke-width="2"/>' +
            '<rect x="' + (x + 24) + '" y="' + (y + 30) + '" width="' + (b - 48) + '" height="' + (hoejde * 0.36) + '" rx="3" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="3"/>' +
            '<rect x="' + (x + 24) + '" y="' + (y + hoejde * 0.5) + '" width="' + (b - 48) + '" height="' + (hoejde * 0.42) + '" rx="3" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="3"/>' +
            '<circle cx="' + (x + b / 2) + '" cy="' + (y + hoejde * 0.22) + '" r="26" fill="' + farve + '" stroke="#111" stroke-width="2"/>' +
            '<text x="' + (x + b / 2) + '" y="' + (y + hoejde * 0.22 + 10) + '" text-anchor="middle" font-size="28" font-weight="700" fill="#111">' + h(nr) + '</text>' +
            '<rect x="' + (x + 18) + '" y="' + (y + hoejde * 0.47) + '" width="12" height="44" rx="5" fill="url(#g-metal)"/>' +
            '<rect x="' + (x + 14) + '" y="' + (y + hoejde * 0.47 + 16) + '" width="38" height="10" rx="5" fill="url(#g-metal)"/>';
        s += '<g class="doerblad' + (aaben ? " aaben" : "") + '">' + blad + '</g>';
        return s;
    };

    /* Kodelaasen ved doeren. Groen lampe, naar den er aaben. */
    S.kodelaas = function (x, y, aaben) {
        var s = '<rect x="' + x + '" y="' + y + '" width="62" height="104" rx="7" fill="url(#g-metal-v)" stroke="#2a2d33" stroke-width="2"/>' +
            '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="46" height="18" rx="3" fill="#0f1612"/>' +
            '<text x="' + (x + 31) + '" y="' + (y + 22) + '" text-anchor="middle" font-size="12" fill="' + (aaben ? "#66e39a" : "#e46a5c") + '" font-family="Consolas, monospace">' + (aaben ? "ÅBEN" : "• • •") + '</text>';
        for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) {
            s += '<rect x="' + (x + 9 + c * 15) + '" y="' + (y + 34 + r * 15) + '" width="12" height="11" rx="2" fill="#3a3e46"/>';
        }
        s += '<circle cx="' + (x + 31) + '" cy="' + (y + 98) + '" r="0" fill="none"/>';
        return s;
    };

    /* ----- Tavlen og kridt -------------------------------------------- */
    S.tavle = function (x, y, b, hoejde, indhold) {
        return '<g filter="url(#f-skygge)"><rect x="' + (x - 12) + '" y="' + (y - 12) + '" width="' + (b + 24) + '" height="' + (hoejde + 24) + '" rx="4" fill="url(#g-trae)"/>' +
            '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + hoejde + '" fill="url(#g-tavle)"/></g>' +
            '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (b - 12) + '" height="' + (hoejde - 12) + '" fill="none" stroke="#fff" stroke-opacity="0.04" stroke-width="6"/>' +
            '<rect x="' + (x - 8) + '" y="' + (y + hoejde + 10) + '" width="' + (b + 16) + '" height="10" rx="2" fill="#4a321f"/>' +
            '<rect x="' + (x + 30) + '" y="' + (y + hoejde + 5) + '" width="26" height="6" rx="3" fill="#f2f0e6"/>' +
            '<rect x="' + (x + 66) + '" y="' + (y + hoejde + 6) + '" width="16" height="5" rx="2" fill="#f3c9c4"/>' +
            (indhold || "");
    };
    S.kridt = function (x, y, tekst, str, anker, vaegt) {
        return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anker || "start") + '" font-size="' + (str || 30) +
            '" font-weight="' + (vaegt || 400) + '" fill="#eef1e6" fill-opacity="0.92" font-family="Lexend, Segoe UI, sans-serif">' + h(tekst) + '</text>';
    };

    /* Gult skilt ved en ting: et klik paa skiltet goer det samme som paa tingen. */
    S.skilt = function (x, y, tekst) {
        var b = Math.round(tekst.length * 13.4 + 34);
        return '<g class="skilt"><rect x="' + (x - b / 2) + '" y="' + (y - 22) + '" width="' + b + '" height="44" rx="11" fill="#f6d66b" stroke="#8a6d12" stroke-width="2"/>' +
            '<text x="' + x + '" y="' + (y + 8) + '" text-anchor="middle" font-size="23" font-weight="600" fill="#3b2f08" font-family="Lexend, Segoe UI, sans-serif">' + h(tekst) + '</text></g>';
    };

    /* ----- Glas og flasker -------------------------------------------- */
    /* Reagensglas: bund i (x, y), hoejde hoejde, vaeske [r,g,b] eller null. */
    S.reagensglas = function (x, y, hoejde, vaeske, fyld) {
        var b = 26, top = y - hoejde, r = b / 2;
        var form = 'M' + (x - r) + ' ' + top + ' L' + (x - r) + ' ' + (y - r) + ' A' + r + ' ' + r + ' 0 0 0 ' + (x + r) + ' ' + (y - r) + ' L' + (x + r) + ' ' + top + ' Z';
        var s = '';
        if (vaeske) {
            var vt = y - hoejde * (fyld || 0.45);
            s += '<clipPath id="kl-rg' + Math.round(x) + '"><path d="' + form + '"/></clipPath>' +
                '<rect x="' + (x - r) + '" y="' + vt + '" width="' + b + '" height="' + (y - vt) + '" fill="' + S.rgb(vaeske, 0.85) + '" clip-path="url(#kl-rg' + Math.round(x) + ')"/>' +
                '<rect x="' + (x - r) + '" y="' + vt + '" width="' + b + '" height="' + (y - vt) + '" fill="url(#g-vaeske)" clip-path="url(#kl-rg' + Math.round(x) + ')"/>' +
                '<ellipse cx="' + x + '" cy="' + vt + '" rx="' + r + '" ry="3" fill="#fff" fill-opacity="0.25"/>';
        }
        s += '<path d="' + form + '" fill="url(#g-glas)" stroke="#d8e4ee" stroke-opacity="0.75" stroke-width="2"/>' +
            '<rect x="' + (x - r - 3) + '" y="' + (top - 4) + '" width="' + (b + 6) + '" height="7" rx="3" fill="#dfe8ef" fill-opacity="0.7"/>';
        return s;
    };

    /* Draabeflaske i brunt glas med hvid pipette og etiket. */
    S.draabeflaske = function (x, y, etiket) {
        return '<g filter="url(#f-skygge)"><rect x="' + (x - 22) + '" y="' + (y - 70) + '" width="44" height="70" rx="9" fill="#6b3a16"/>' +
            '<rect x="' + (x - 22) + '" y="' + (y - 70) + '" width="44" height="70" rx="9" fill="url(#g-glas)"/>' +
            '<rect x="' + (x - 9) + '" y="' + (y - 86) + '" width="18" height="18" rx="3" fill="#2b2b2f"/>' +
            '<path d="M' + (x - 7) + ' ' + (y - 86) + ' Q' + x + ' ' + (y - 118) + ' ' + (x + 7) + ' ' + (y - 86) + ' Z" fill="#f3f1ea"/></g>' +
            '<rect x="' + (x - 19) + '" y="' + (y - 50) + '" width="38" height="28" rx="3" fill="#f7f4ea"/>' +
            '<text x="' + x + '" y="' + (y - 31) + '" text-anchor="middle" font-size="' + (etiket.length > 4 ? 10.5 : 13) + '" font-weight="700" fill="#222" font-family="Lexend, Segoe UI, sans-serif">' + h(etiket) + '</text>';
    };

    /* Draabeplade af hvidt porcelaen, der ligger paa bordet (set skraat
       oppefra): raekker x soejler brønde, venstre kant i x, bund i y. */
    /* fyld[r][c]: { vaeske: [r,g,b], bundfald: [r,g,b] eller null } for
       de brønde, der er dryppet i; resten er tomme. */
    S.draabeplade = function (x, y, raekker, soejler, fyld) {
        var b = soejler * 42 + 30, hh = raekker * 13 + 16;
        var s = '<g filter="url(#f-skygge)"><polygon points="' + (x + 16) + ',' + (y - hh) + ' ' + (x + b - 16) + ',' + (y - hh) + ' ' + (x + b) + ',' + (y - 8) + ' ' + x + ',' + (y - 8) +
            '" fill="#f2f1ec" stroke="#c9c6bc" stroke-width="2"/>' +
            '<rect x="' + x + '" y="' + (y - 9) + '" width="' + b + '" height="9" rx="2" fill="#dcd9cf"/></g>';
        for (var r = 0; r < raekker; r++) {
            var k = 0.82 + 0.18 * r / Math.max(1, raekker - 1), ry = y - hh + 10 + r * 13;
            for (var c = 0; c < soejler; c++) {
                var cx = x + b / 2 + (c - (soejler - 1) / 2) * 42 * k, rx = 13 * k;
                var f = fyld && fyld[r] && fyld[r][c];
                s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + ry + '" rx="' + rx.toFixed(1) + '" ry="4" fill="' + (f ? S.rgb(f.vaeske, 0.9) : "#d6d3ca") + '" stroke="#b3b0a6" stroke-width="1.2"/>';
                if (f && f.bundfald) {
                    s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + (ry + 0.5) + '" rx="' + (rx * 0.62).toFixed(1) + '" ry="2.6" fill="' + S.rgb(f.bundfald) + '" stroke="#6b6458" stroke-opacity="0.5" stroke-width="0.8"/>';
                }
            }
        }
        return s;
    };

    /* Reagensflaske med skruelaag. vaeske [r,g,b] eller null. */
    S.flaske = function (x, y, b, hoejde, etiket, vaeske, laagFarve) {
        var hals = b * 0.42, s = '';
        var krop = 'M' + (x - b / 2) + ' ' + (y - 10) + ' Q' + (x - b / 2) + ' ' + y + ' ' + (x - b / 2 + 10) + ' ' + y + ' L' + (x + b / 2 - 10) + ' ' + y +
            ' Q' + (x + b / 2) + ' ' + y + ' ' + (x + b / 2) + ' ' + (y - 10) + ' L' + (x + b / 2) + ' ' + (y - hoejde * 0.72) +
            ' Q' + (x + b / 2) + ' ' + (y - hoejde * 0.82) + ' ' + (x + hals / 2) + ' ' + (y - hoejde * 0.86) + ' L' + (x + hals / 2) + ' ' + (y - hoejde) +
            ' L' + (x - hals / 2) + ' ' + (y - hoejde) + ' L' + (x - hals / 2) + ' ' + (y - hoejde * 0.86) +
            ' Q' + (x - b / 2) + ' ' + (y - hoejde * 0.82) + ' ' + (x - b / 2) + ' ' + (y - hoejde * 0.72) + ' Z';
        var id = "kl-fl" + Math.round(x) + "-" + Math.round(y);
        if (vaeske) {
            var vt = y - hoejde * 0.62;
            s += '<clipPath id="' + id + '"><path d="' + krop + '"/></clipPath>' +
                '<rect x="' + (x - b / 2) + '" y="' + vt + '" width="' + b + '" height="' + (y - vt) + '" fill="' + S.rgb(vaeske, 0.8) + '" clip-path="url(#' + id + ')"/>' +
                '<rect x="' + (x - b / 2) + '" y="' + vt + '" width="' + b + '" height="' + (y - vt) + '" fill="url(#g-vaeske)" clip-path="url(#' + id + ')"/>';
        }
        s += '<path d="' + krop + '" fill="url(#g-glas)" stroke="#d8e4ee" stroke-opacity="0.7" stroke-width="2"/>' +
            '<rect x="' + (x - hals / 2 - 4) + '" y="' + (y - hoejde - 16) + '" width="' + (hals + 8) + '" height="18" rx="3" fill="' + (laagFarve || "#2f4f8a") + '"/>';
        if (etiket) {
            var eb = b * 0.78;
            s += '<rect x="' + (x - eb / 2) + '" y="' + (y - hoejde * 0.55) + '" width="' + eb + '" height="' + (hoejde * 0.3) + '" rx="3" fill="#f7f4ea"/>' +
                '<text x="' + x + '" y="' + (y - hoejde * 0.55 + hoejde * 0.19) + '" text-anchor="middle" font-size="' + Math.min(20, eb / Math.max(3, etiket.length) * 1.4).toFixed(1) +
                '" font-weight="700" fill="#222" font-family="Lexend, Segoe UI, sans-serif">' + h(etiket) + '</text>';
        }
        return s;
    };

    /* Erlenmeyerkolbe med bund i (x, y). */
    S.kolbe = function (x, y, b, hoejde, vaeske, fyld) {
        var hals = b * 0.3, id = "kl-ko" + Math.round(x);
        var form = 'M' + (x - hals / 2) + ' ' + (y - hoejde) + ' L' + (x - hals / 2) + ' ' + (y - hoejde * 0.7) + ' L' + (x - b / 2) + ' ' + (y - 6) +
            ' Q' + (x - b / 2) + ' ' + y + ' ' + (x - b / 2 + 8) + ' ' + y + ' L' + (x + b / 2 - 8) + ' ' + y + ' Q' + (x + b / 2) + ' ' + y + ' ' + (x + b / 2) + ' ' + (y - 6) +
            ' L' + (x + hals / 2) + ' ' + (y - hoejde * 0.7) + ' L' + (x + hals / 2) + ' ' + (y - hoejde) + ' Z';
        var s = '';
        if (vaeske) {
            var vt = y - hoejde * (fyld || 0.35);
            s += '<clipPath id="' + id + '"><path d="' + form + '"/></clipPath>' +
                '<rect x="' + (x - b / 2) + '" y="' + vt + '" width="' + b + '" height="' + (y - vt) + '" fill="' + S.rgb(vaeske, 0.75) + '" clip-path="url(#' + id + ')"/>' +
                '<rect x="' + (x - b / 2) + '" y="' + vt + '" width="' + b + '" height="' + (y - vt) + '" fill="url(#g-vaeske)" clip-path="url(#' + id + ')"/>';
        }
        s += '<path d="' + form + '" fill="url(#g-glas)" stroke="#d8e4ee" stroke-opacity="0.75" stroke-width="2"/>' +
            '<rect x="' + (x - hals / 2 - 4) + '" y="' + (y - hoejde - 5) + '" width="' + (hals + 8) + '" height="7" rx="3" fill="#dfe8ef" fill-opacity="0.7"/>';
        return s;
    };

    /* Stativ med burette; bunden af stativet staar paa bordet (y = 540). */
    S.burette = function (x, top, bund, vaeske) {
        var s = '', id = "kl-bu" + Math.round(x), b = 18;
        var tut = bund + 34;
        if (vaeske) {
            s += '<rect x="' + (x - b / 2 + 2) + '" y="' + (top + 26) + '" width="' + (b - 4) + '" height="' + (bund - top - 26) + '" fill="' + S.rgb(vaeske, 0.8) + '"/>' +
                '<rect x="' + (x - b / 2 + 2) + '" y="' + (top + 26) + '" width="' + (b - 4) + '" height="' + (bund - top - 26) + '" fill="url(#g-vaeske)"/>';
        }
        s += '<rect x="' + (x - b / 2) + '" y="' + top + '" width="' + b + '" height="' + (bund - top) + '" rx="3" fill="url(#g-glas)" stroke="#d8e4ee" stroke-opacity="0.75" stroke-width="2"/>';
        for (var i = 0; i <= 10; i++) {
            var ly = top + 30 + i * (bund - top - 50) / 10;
            s += '<line x1="' + (x - b / 2) + '" y1="' + ly + '" x2="' + (x - b / 2 + (i % 5 === 0 ? 10 : 6)) + '" y2="' + ly + '" stroke="#e8f0f6" stroke-opacity="0.8" stroke-width="1.5"/>';
        }
        /* Hanen og tuden */
        s += '<rect x="' + (x - 4) + '" y="' + bund + '" width="8" height="34" fill="url(#g-glas)" stroke="#d8e4ee" stroke-opacity="0.6"/>' +
            '<rect x="' + (x - 16) + '" y="' + (bund + 10) + '" width="32" height="9" rx="4" fill="#2d6fb3"/>' +
            '<path d="M' + (x - 3) + ' ' + tut + ' L' + x + ' ' + (tut + 12) + ' L' + (x + 3) + ' ' + tut + ' Z" fill="#d8e4ee" fill-opacity="0.7"/>';
        return s;
    };
    S.stativ = function (x, top) {
        return '<rect x="' + (x - 70) + '" y="528" width="140" height="14" rx="4" fill="#2c2f36" stroke="#15161a" stroke-width="2"/>' +
            '<rect x="' + (x - 55) + '" y="' + top + '" width="8" height="' + (530 - top) + '" fill="url(#g-metal)"/>' +
            '<rect x="' + (x - 55) + '" y="' + (top + 70) + '" width="50" height="10" rx="3" fill="#3a3e46"/>' +
            '<rect x="' + (x - 14) + '" y="' + (top + 64) + '" width="10" height="22" rx="3" fill="#3a3e46"/>';
    };

    /* Laboratorievaegt med display og en vejebaad med metal. */
    S.vaegt = function (x, y, display, metal) {
        var s = '<g filter="url(#f-skygge)"><rect x="' + (x - 110) + '" y="' + (y - 62) + '" width="220" height="62" rx="10" fill="#e9ebee" stroke="#9aa0a8" stroke-width="2"/>' +
            '<rect x="' + (x - 82) + '" y="' + (y - 84) + '" width="164" height="16" rx="4" fill="url(#g-metal)"/>' +
            '<rect x="' + (x - 60) + '" y="' + (y - 46) + '" width="120" height="34" rx="4" fill="#163021" stroke="#0b1710" stroke-width="2"/></g>' +
            '<text x="' + (x + 52) + '" y="' + (y - 21) + '" text-anchor="end" font-size="24" fill="#7dfa9c" font-family="Consolas, monospace">' + h(display) + '</text>' +
            '<circle cx="' + (x - 88) + '" cy="' + (y - 28) + '" r="7" fill="#c0392b"/><circle cx="' + (x + 86) + '" cy="' + (y - 28) + '" r="7" fill="#7f8c8d"/>';
        /* Vejebaaden */
        s += '<path d="M' + (x - 54) + ' ' + (y - 84) + ' L' + (x - 44) + ' ' + (y - 102) + ' L' + (x + 44) + ' ' + (y - 102) + ' L' + (x + 54) + ' ' + (y - 84) + ' Z" fill="#f4f4f0" stroke="#bdbcb5" stroke-width="1.5"/>';
        s += S.metalstykker(x, y - 98, metal);
        return s;
    };
    S.metalstykker = function (x, y, metal) {
        var s = '';
        if (metal === "Mg") {
            s += '<path d="M' + (x - 34) + ' ' + y + ' q 12 -18 24 0 t 24 0 t 24 0" fill="none" stroke="#c9ccd2" stroke-width="4" stroke-linecap="round"/>';
        } else if (metal === "Al") {
            s += '<path d="M' + (x - 30) + ' ' + y + ' l 14 -12 l 10 8 l 12 -10 l 8 12 l 12 -6 l 6 8 Z" fill="#dfe3e8" stroke="#9aa0a8"/>';
        } else if (metal === "Zn") {
            [[-26, 0], [-12, -4], [2, 0], [16, -3], [28, 0], [-4, -10], [10, -11]].forEach(function (p) {
                s += '<circle cx="' + (x + p[0]) + '" cy="' + (y + p[1]) + '" r="6" fill="#9ea6ae" stroke="#5f666e"/>';
            });
        } else {
            s += '<ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="34" ry="7" fill="#4a4d52"/><ellipse cx="' + x + '" cy="' + (y - 5) + '" rx="20" ry="5" fill="#5d6066"/>';
        }
        return s;
    };

    /* Vejrstation med termometer og barometer. */
    S.vejrstation = function (x, y, tTekst, pTekst) {
        return '<g filter="url(#f-skygge)"><rect x="' + x + '" y="' + y + '" width="200" height="240" rx="10" fill="url(#g-trae)"/></g>' +
            '<rect x="' + (x + 12) + '" y="' + (y + 12) + '" width="176" height="216" rx="6" fill="none" stroke="#000" stroke-opacity="0.3" stroke-width="2"/>' +
            /* termometer */
            '<rect x="' + (x + 30) + '" y="' + (y + 28) + '" width="16" height="150" rx="8" fill="#f1f3f4" stroke="#999" stroke-width="1.5"/>' +
            '<rect x="' + (x + 35) + '" y="' + (y + 78) + '" width="6" height="104" fill="#d33a2c"/>' +
            '<circle cx="' + (x + 38) + '" cy="' + (y + 186) + '" r="13" fill="#d33a2c" stroke="#999" stroke-width="1.5"/>' +
            /* barometer */
            '<circle cx="' + (x + 128) + '" cy="' + (y + 86) + '" r="52" fill="#f6f2e6" stroke="url(#g-metal)" stroke-width="7"/>' +
            '<line x1="' + (x + 128) + '" y1="' + (y + 86) + '" x2="' + (x + 150) + '" y2="' + (y + 50) + '" stroke="#222" stroke-width="3" stroke-linecap="round"/>' +
            '<circle cx="' + (x + 128) + '" cy="' + (y + 86) + '" r="5" fill="#222"/>' +
            /* aflaesningerne */
            '<rect x="' + (x + 62) + '" y="' + (y + 152) + '" width="122" height="30" rx="4" fill="#163021"/>' +
            '<text x="' + (x + 176) + '" y="' + (y + 174) + '" text-anchor="end" font-size="19" fill="#7dfa9c" font-family="Consolas, monospace">' + h(tTekst) + '</text>' +
            '<rect x="' + (x + 62) + '" y="' + (y + 188) + '" width="122" height="30" rx="4" fill="#163021"/>' +
            '<text x="' + (x + 176) + '" y="' + (y + 210) + '" text-anchor="end" font-size="19" fill="#7dfa9c" font-family="Consolas, monospace">' + h(pTekst) + '</text>';
    };

    /* Aaben notesbog paa bordet. */
    S.notesbog = function (x, y) {
        var s = '<g filter="url(#f-skygge)"><path d="M' + (x - 130) + ' ' + (y - 6) + ' L' + (x - 118) + ' ' + (y - 96) + ' L' + x + ' ' + (y - 90) + ' L' + x + ' ' + y + ' Z" fill="#f4efe0"/>' +
            '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - 90) + ' L' + (x + 118) + ' ' + (y - 96) + ' L' + (x + 130) + ' ' + (y - 6) + ' Z" fill="#efe9d8"/></g>' +
            '<line x1="' + x + '" y1="' + (y - 90) + '" x2="' + x + '" y2="' + y + '" stroke="#b9ae92" stroke-width="2"/>';
        for (var i = 0; i < 6; i++) {
            var ly = y - 80 + i * 12;
            s += '<line x1="' + (x - 112) + '" y1="' + ly + '" x2="' + (x - 12) + '" y2="' + (ly + 1) + '" stroke="#5b6b8c" stroke-opacity="0.45" stroke-width="1.5"/>' +
                '<line x1="' + (x + 12) + '" y1="' + (ly + 1) + '" x2="' + (x + 112) + '" y2="' + ly + '" stroke="#5b6b8c" stroke-opacity="0.45" stroke-width="1.5"/>';
        }
        s += '<rect x="' + (x + 70) + '" y="' + (y - 4) + '" width="70" height="6" rx="3" transform="rotate(-12 ' + (x + 105) + ' ' + y + ')" fill="#2b5ca8"/>';
        return s;
    };

    /* Hylde paa vaeggen. */
    S.hylde = function (x, y, b) {
        return '<rect x="' + x + '" y="' + y + '" width="' + b + '" height="14" rx="2" fill="url(#g-trae)" filter="url(#f-skygge)"/>' +
            '<path d="M' + (x + 30) + ' ' + (y + 14) + ' l 0 30 l 26 -30 Z" fill="#3a2a1c"/>' +
            '<path d="M' + (x + b - 30) + ' ' + (y + 14) + ' l 0 30 l -26 -30 Z" fill="#3a2a1c"/>';
    };

    /* Plakat med et lille periodisk system (kun farvede felter). */
    S.plakat = function (x, y, b) {
        var c = (b - 24) / 18, hh = c * 9.6 + 56;
        var s = '<g filter="url(#f-skygge)"><rect x="' + x + '" y="' + y + '" width="' + b + '" height="' + hh + '" fill="#f6f3ea"/></g>' +
            '<text x="' + (x + b / 2) + '" y="' + (y + 30) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#2a2f3a" font-family="Lexend, Segoe UI, sans-serif">Det periodiske system</text>';
        NK.Sprites.pladser().forEach(function (p) {
            var px = x + 12 + (p.kol - 1) * c, py = y + 44 + (p.raekke - 1) * c + (p.raekke > 7 ? c * 0.6 : 0);
            s += '<rect x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" width="' + (c - 1.2).toFixed(1) + '" height="' + (c - 1.2).toFixed(1) + '" fill="' + p.farve + '"/>';
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
            if (raekke > 7) return "#cbb8ee";
            if (kol === 18) return "#b9e1c5";
            if (kol <= 2 && Z !== 1) return "#f2a7a2";
            if (kol >= 3 && kol <= 12) return "#a6d1f0";
            return "#f6d58b";
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

    /* ----- Noegler, segl og den gyldne doer -------------------------- */
    /* En noegle med hovedet til venstre, ca. 80 x 32. */
    S.noegle = function (x, y, fyld, kant, skala) {
        var k = skala || 1;
        return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' +
            '<circle cx="16" cy="16" r="14" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2.5"/>' +
            '<circle cx="16" cy="16" r="5.5" fill="#0d0e12" fill-opacity="0.75"/>' +
            '<rect x="28" y="12" width="48" height="8" rx="2" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2"/>' +
            '<rect x="56" y="18" width="7" height="12" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2"/>' +
            '<rect x="67" y="18" width="7" height="9" fill="' + fyld + '" stroke="' + kant + '" stroke-width="2"/></g>';
    };

    /* Voksseglet med et maerke. brudt: revnet og mat. */
    S.segl = function (x, y, maerke, brudt) {
        var s = '<g transform="translate(' + x + ' ' + y + ')">';
        if (brudt) {
            s += '<path d="M-44 -6 Q-46 -40 -8 -44 L -2 -8 L -14 10 L -6 44 Q-44 40 -44 -6 Z" fill="#6c3a35" opacity="0.85"/>' +
                '<path d="M8 -44 Q46 -40 44 0 Q42 40 4 44 L 10 12 L -2 -8 Z" fill="#6c3a35" opacity="0.85" transform="translate(8 4) rotate(6)"/>';
        } else {
            s += '<path d="M0 -46 Q20 -48 32 -36 Q48 -26 44 -4 Q50 18 34 34 Q18 50 -4 45 Q-28 48 -38 30 Q-50 12 -44 -10 Q-42 -36 -18 -44 Q-10 -48 0 -46 Z" fill="url(#g-voks)" filter="url(#f-skygge)"/>' +
                '<circle r="30" fill="none" stroke="#5a0f0a" stroke-opacity="0.55" stroke-width="3"/>' + maerke;
        }
        return s + '</g>';
    };
    S.SEGLMAERKER = {
        million: '<text y="12" text-anchor="middle" font-size="34" font-weight="700" fill="#5a0f0a" fill-opacity="0.75" font-family="Georgia, serif">M</text>',
        syregalgen: '<text y="10" text-anchor="middle" font-size="26" font-weight="700" fill="#5a0f0a" fill-opacity="0.75" font-family="Lexend, Segoe UI, sans-serif">pH</text>',
        pacman: '<path d="M0 0 L18 -12 A21 21 0 1 0 18 12 Z" fill="#5a0f0a" fill-opacity="0.7"/>',
        organisk: '<polygon points="0,-20 17,-10 17,10 0,20 -17,10 -17,-10" fill="none" stroke="#5a0f0a" stroke-opacity="0.75" stroke-width="4"/>'
    };

    /* ----- Molekyler som kugle-og-pind i en kasse paa 200 x 150 ------- */
    S.molekyle = function (t, b, hh) {
        var D = NK.D;
        var s = '<svg viewBox="0 0 200 150" width="' + (b || 170) + '" height="' + (hh || 128) + '" aria-hidden="true">' +
            '<defs><radialGradient id="g-kugle-m" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.6"/>' +
            '<stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/></radialGradient></defs>';
        t.b.forEach(function (bd) {
            var a = t.a[bd[0]], c = t.a[bd[1]], type = bd[2];
            var dx = c[1] - a[1], dy = c[2] - a[2], l = Math.sqrt(dx * dx + dy * dy), nx = -dy / l, ny = dx / l;
            if (type === "k") {
                s += '<polygon points="' + a[1] + ',' + a[2] + ' ' + (c[1] + nx * 7) + ',' + (c[2] + ny * 7) + ' ' + (c[1] - nx * 7) + ',' + (c[2] - ny * 7) + '" fill="#9aa1ab"/>';
            } else if (type === "s") {
                s += '<line x1="' + a[1] + '" y1="' + a[2] + '" x2="' + c[1] + '" y2="' + c[2] + '" stroke="#9aa1ab" stroke-width="3" stroke-dasharray="4 4"/>';
            } else {
                var n = type, afst = 6;
                for (var i = 0; i < n; i++) {
                    var o = (i - (n - 1) / 2) * afst;
                    s += '<line x1="' + (a[1] + nx * o) + '" y1="' + (a[2] + ny * o) + '" x2="' + (c[1] + nx * o) + '" y2="' + (c[2] + ny * o) + '" stroke="#9aa1ab" stroke-width="3"/>';
                }
            }
        });
        (t.f || []).forEach(function (fp) {
            var a = t.a[fp[0]], r = D.ATOM[a[0]].r + 9, v = fp[1] * Math.PI / 180;
            var cx = a[1] + Math.cos(v) * r, cy = a[2] + Math.sin(v) * r, px = -Math.sin(v) * 4, py = Math.cos(v) * 4;
            s += '<circle cx="' + (cx + px) + '" cy="' + (cy + py) + '" r="2.6" fill="#e7c24a"/><circle cx="' + (cx - px) + '" cy="' + (cy - py) + '" r="2.6" fill="#e7c24a"/>';
        });
        t.a.forEach(function (a) {
            var at = D.ATOM[a[0]];
            s += '<circle cx="' + a[1] + '" cy="' + a[2] + '" r="' + at.r + '" fill="' + at.farve + '"/>' +
                '<circle cx="' + a[1] + '" cy="' + a[2] + '" r="' + at.r + '" fill="url(#g-kugle-m)"/>' +
                '<text x="' + a[1] + '" y="' + (a[2] + 5) + '" text-anchor="middle" font-size="' + (a[0].length > 1 ? 13 : 15) + '" font-weight="700" fill="' +
                (at.moerkTekst ? "#1d2433" : "#fff") + '" font-family="Lexend, Segoe UI, sans-serif">' + a[0] + '</text>';
        });
        return s + '</svg>';
    };
}());

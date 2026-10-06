/* =====================================================================
   scener.js - tegningerne over haeftet (fane 2 og 3)

   Fane 2: en klippe med pyrit ved en bæk. Vandet foelger skemaerne:
   klart (trin 0), svagt groent af Fe²⁺ og surt (trin 1, svovlet er
   oxideret) og rustroedt af Fe(OH)₃ (trin 2, jernet er oxideret).

   Fane 3: en risteovn med zinkblende eller cinnober paa risten, og en
   regnsky over en statue af marmor. Trin 0 er foer reaktionen, trin 1
   efter.

   Tegningerne er SVG, og alt, der skifter, styres af data-opgave og
   data-trin paa strimlen (css/stil.css, afsnittet STRIMLEN). Tallene
   paa pH-maaleren er valgt, saa retningen kan ses; se README.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function terning(x, y, s, top, venstre, hoejre) {
        var a = 0.87 * s, b = 0.5 * s;
        function pt(l) { return l.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
        return '<polygon points="' + pt([[x, y - b], [x + a, y], [x, y + b], [x - a, y]]) + '" fill="' + top + '"/>' +
            '<polygon points="' + pt([[x - a, y], [x, y + b], [x, y + b + s], [x - a, y + s]]) + '" fill="' + venstre + '"/>' +
            '<polygon points="' + pt([[x + a, y], [x, y + b], [x, y + b + s], [x + a, y + s]]) + '" fill="' + hoejre + '"/>';
    }

    function guld(x, y, s) { return terning(x, y, s, "#f7e08a", "#cfa744", "#9a7626"); }

    /* En lille etiket med en formel */
    function maerke(x, y, tekst, klasse) {
        var b = 14 + tekst.length * 9.5;
        return '<g class="sc-maerke ' + (klasse || "") + '" transform="translate(' + x + " " + y + ')">' +
            '<rect x="' + (-b / 2) + '" y="-13" width="' + b + '" height="26" rx="13"/>' +
            '<text x="0" y="5.5" text-anchor="middle">' + tekst + "</text></g>";
    }

    /* ----- Fane 2: klippen og baekken ------------------------------------------- */
    function flod() {
        var s = '<svg viewBox="0 0 1000 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
        s += '<defs><linearGradient id="sc-himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb9d6"/><stop offset="1" stop-color="#d8e4dc"/></linearGradient></defs>';
        s += '<rect width="1000" height="220" fill="url(#sc-himmel)"/>';
        /* Bakkerne bagved: roed jord som i Andalusien */
        s += '<path d="M0 120 Q160 70 330 108 T640 96 T1000 112 V220 H0z" fill="#b98a62"/>';
        s += '<path d="M0 142 Q220 104 430 136 T820 126 T1000 138 V220 H0z" fill="#9c6c48"/>';
        /* Bredden og baekken */
        s += '<path d="M0 168 H1000 V220 H0z" fill="#6f5238"/>';
        s += '<path class="sc-vand" d="M250 170 Q420 158 600 168 T1000 162 V214 Q760 222 520 214 T250 216z"/>';
        s += '<path class="sc-glimt" d="M330 180 q40 -6 80 0 M560 188 q50 -6 100 0 M780 178 q40 -5 80 0" />';
        /* Sten paa bunden: de bliver roedbrune af Fe(OH)₃ */
        s += '<g class="sc-bundsten"><ellipse cx="430" cy="206" rx="34" ry="8"/><ellipse cx="610" cy="209" rx="44" ry="8"/><ellipse cx="830" cy="205" rx="38" ry="8"/></g>';
        s += '<g class="sc-rust fra2"><ellipse cx="430" cy="204" rx="34" ry="6"/><ellipse cx="610" cy="207" rx="44" ry="6"/><ellipse cx="830" cy="203" rx="38" ry="6"/><ellipse cx="520" cy="212" rx="26" ry="4"/><ellipse cx="720" cy="212" rx="30" ry="4"/></g>';
        /* Klippen med pyrit */
        s += '<path d="M0 220 V86 L60 58 L150 50 L238 84 L286 150 L300 220z" fill="#6f7072"/>';
        s += '<path d="M0 86 L60 58 L150 50 L170 96 L90 120 L0 112z" fill="#8a8b8d"/>';
        s += '<path d="M170 96 L238 84 L286 150 L300 220 L200 220z" fill="#5a5b5d"/>';
        s += guld(108, 118, 30) + guld(164, 146, 22) + guld(72, 160, 18) + guld(214, 176, 16) + guld(136, 182, 14);
        s += '<text class="sc-navn" x="20" y="212">Pyrit, FeS₂</text>';
        /* Luft og regn rammer klippen */
        s += maerke(290, 40, "O₂", "luft") + maerke(372, 64, "H₂O", "luft");
        s += '<path class="sc-pil" d="M268 54 L226 84 M348 80 L272 118"/>';
        s += '<g class="sc-regn"><line x1="330" y1="16" x2="322" y2="34"/><line x1="408" y1="26" x2="400" y2="44"/><line x1="452" y1="10" x2="444" y2="28"/><line x1="240" y1="8" x2="232" y2="26"/></g>';
        /* Det, der er i vandet */
        s += '<g class="fra1">' + maerke(470, 186, "SO₄²⁻", "ion") + maerke(700, 192, "H⁺", "syre") + maerke(900, 184, "SO₄²⁻", "ion") + "</g>";
        s += '<g class="kun1">' + maerke(585, 180, "Fe²⁺", "jern2") + maerke(800, 190, "Fe²⁺", "jern2") + "</g>";
        s += '<g class="fra2">' + maerke(585, 180, "H⁺", "syre") + maerke(800, 188, "Fe(OH)₃", "jern3") + maerke(360, 190, "H⁺", "syre") + "</g>";
        /* pH-maaleren */
        s += '<g transform="translate(872 40)"><rect class="sc-ph" x="0" y="0" width="112" height="62" rx="9"/>' +
            '<text class="sc-ph-navn" x="56" y="20" text-anchor="middle">pH i vandet</text>' +
            '<text class="sc-ph-tal kun0" x="56" y="50" text-anchor="middle">ca. 7</text>' +
            '<text class="sc-ph-tal kun1" x="56" y="50" text-anchor="middle">ca. 3</text>' +
            '<text class="sc-ph-tal kun2 surt" x="56" y="50" text-anchor="middle">ca. 2</text></g>';
        return s + "</svg>";
    }

    /* ----- Fane 3: risteovnen og regnen ------------------------------------------ */
    function ovn() {
        var s = '<svg viewBox="0 0 1000 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
        s += '<rect width="1000" height="220" fill="#23232b"/>';
        s += '<rect y="186" width="1000" height="34" fill="#3a332c"/>';

        /* --- Ovnen (zinkblende og cinnober) --- */
        s += '<g class="o-ovn">';
        /* Skorstenen og murvaerket */
        s += '<rect x="356" y="0" width="60" height="60" fill="#5d3a2c"/>';
        s += '<path d="M250 190 V72 Q250 50 276 50 H496 Q522 50 522 72 V190z" fill="#7a4a36"/>';
        s += '<g stroke="rgba(0,0,0,0.28)" stroke-width="2"><line x1="250" y1="84" x2="522" y2="84"/><line x1="250" y1="118" x2="522" y2="118"/><line x1="250" y1="152" x2="522" y2="152"/>' +
            '<line x1="300" y1="50" x2="300" y2="84"/><line x1="470" y1="50" x2="470" y2="84"/><line x1="276" y1="84" x2="276" y2="118"/><line x1="496" y1="84" x2="496" y2="118"/></g>';
        /* Ovnrummet med rist og flammer */
        s += '<path d="M296 186 V104 Q296 84 316 84 H456 Q476 84 476 104 V186z" fill="#17120f"/>';
        s += '<g class="sc-flamme"><path d="M318 186 q8 -34 22 -20 q4 -30 20 -12 q8 -34 22 -8 q10 -26 20 -4 q12 -22 20 2 q10 -16 14 42z" fill="#e8762a"/>' +
            '<path d="M336 186 q8 -22 18 -10 q6 -22 18 -6 q10 -20 20 -2 q12 -14 18 18z" fill="#f6c343"/></g>';
        s += '<rect x="300" y="146" width="172" height="5" fill="#8d8f93"/>';
        s += '<g stroke="#6c6e72" stroke-width="3"><line x1="320" y1="146" x2="320" y2="160"/><line x1="352" y1="146" x2="352" y2="160"/><line x1="386" y1="146" x2="386" y2="160"/><line x1="420" y1="146" x2="420" y2="160"/><line x1="452" y1="146" x2="452" y2="160"/></g>';
        /* Stenen paa risten: zinkblende (brun), cinnober (roed) */
        s += '<g class="o-zink kun0"><polygon points="346,146 354,120 380,110 408,118 420,146" fill="#3b2a22"/><polygon points="354,120 380,110 384,128 362,134" fill="#6d4429"/><polygon points="384,128 408,118 420,146 390,146" fill="#2a1d18"/></g>';
        s += '<g class="o-zink kun1"><polygon points="346,146 354,124 380,116 408,122 420,146" fill="#e9ecee"/><polygon points="354,124 380,116 384,132 362,136" fill="#ffffff"/><polygon points="384,132 408,122 420,146 390,146" fill="#c9d0d5"/></g>';
        s += '<g class="o-cinnober kun0"><polygon points="346,146 354,120 380,110 408,118 420,146" fill="#c4202b"/><polygon points="354,120 380,110 384,128 362,134" fill="#e4483f"/><polygon points="384,128 408,118 420,146 390,146" fill="#a3151f"/></g>';
        s += '<g class="o-cinnober kun1"><polygon points="352,146 360,134 382,130 404,136 414,146" fill="#5a544e"/></g>';
        s += '<g class="o-zink">' + '<text class="sc-navn kun0" x="250" y="212">Zinkblende, ZnS</text><text class="sc-navn kun1" x="250" y="212">Zinkoxid, ZnO</text></g>';
        s += '<g class="o-cinnober">' + '<text class="sc-navn" x="250" y="212">Cinnober, HgS</text></g>';
        /* Luften ind */
        s += maerke(170, 120, "O₂", "luft") + '<path class="sc-pil" d="M198 124 L288 132"/>';
        /* Gassen op gennem skorstenen */
        s += '<g class="fra1"><circle class="sc-roeg" cx="386" cy="26" r="20"/><circle class="sc-roeg" cx="414" cy="14" r="16"/><circle class="sc-roeg" cx="366" cy="10" r="14"/>' + maerke(470, 24, "SO₂", "gas") + "</g>";
        /* Kviksoelvet samles i en skaal */
        s += '<g class="o-cinnober"><path d="M600 150 q60 60 120 0z" fill="#7f8891"/><rect x="596" y="146" width="128" height="6" rx="3" fill="#a9b2ba"/>' +
            '<path d="M522 110 Q580 96 640 140" fill="none" stroke="#5d3a2c" stroke-width="12" stroke-linecap="round"/>' +
            '<g class="fra1"><ellipse cx="660" cy="168" rx="38" ry="9" fill="#dfe5ea"/><ellipse cx="648" cy="165" rx="14" ry="3" fill="#ffffff"/>' +
            '<circle cx="640" cy="150" r="5" fill="#dfe5ea"/><circle cx="640" cy="148.5" r="1.6" fill="#ffffff"/></g>' +
            '<text class="sc-navn fra1" x="610" y="212">Kviksølv, Hg</text></g>';
        s += "</g>";

        /* --- Regnen (Sur regn) --- */
        s += '<g class="o-regn">';
        s += '<rect width="1000" height="186" fill="#5d6f80"/>';
        s += '<rect y="186" width="1000" height="34" fill="#4a5a44"/>';
        s += '<g fill="#9aa5ae"><circle cx="360" cy="52" r="34"/><circle cx="410" cy="38" r="40"/><circle cx="470" cy="50" r="36"/><circle cx="520" cy="60" r="26"/><rect x="340" y="56" width="200" height="30" rx="15"/></g>';
        s += maerke(270, 46, "SO₂", "gas") + maerke(600, 46, "H₂O", "luft");
        s += '<path class="sc-pil" d="M300 50 L336 56 M572 50 L548 58"/>';
        s += '<g class="sc-regn stor"><line x1="372" y1="96" x2="364" y2="120"/><line x1="412" y1="100" x2="404" y2="124"/><line x1="452" y1="96" x2="444" y2="120"/><line x1="492" y1="102" x2="484" y2="126"/><line x1="392" y1="134" x2="384" y2="158"/><line x1="472" y1="136" x2="464" y2="160"/></g>';
        s += '<g class="fra1">' + maerke(432, 150, "H₂SO₃", "syre") + "</g>";
        /* En buste af marmor paa en sokkel. Efter regnen er den tæret. */
        s += '<g transform="translate(700 0)"><rect x="-42" y="166" width="84" height="22" fill="#c4c7c4"/><rect x="-32" y="150" width="64" height="18" fill="#d6d8d5"/>' +
            '<path d="M-48 150 q2 -34 30 -42 h36 q28 8 30 42z" fill="#e6e8e5"/><rect x="-9" y="90" width="18" height="22" fill="#d9dbd8"/>' +
            '<ellipse cx="0" cy="72" rx="19" ry="23" fill="#e6e8e5"/><path d="M-19 68 q19 -24 38 0 q-5 -22 -19 -22 q-14 0 -19 22z" fill="#cfd1ce"/>' +
            '<g class="fra1" fill="#a3a6a3"><circle cx="-7" cy="74" r="3"/><circle cx="9" cy="84" r="2.5"/><circle cx="-22" cy="128" r="3.5"/><circle cx="6" cy="134" r="3"/><circle cx="24" cy="122" r="2.5"/><circle cx="-4" cy="118" r="2"/></g></g>';
        s += '<text class="sc-navn" x="752" y="212">Marmor, CaCO₃</text>';
        s += "</g>";
        return s + "</svg>";
    }

    /* Trinnet i tegningen: foer og efter opgaven */
    var TRIN = {
        p: { svovl: [0, 1], jern: [1, 2], sum: [2, 2], tinto: [2, 2] },
        r: { zink: [0, 1], cinnober: [0, 1], regn: [0, 1] }
    };

    NK.Scener = {
        byg: function (el, navn) {
            el.innerHTML = navn === "p" ? flod() : ovn();
        },
        saet: function (el, navn, id, faerdig) {
            var t = (TRIN[navn] || {})[id] || [0, 0];
            el.setAttribute("data-opgave", id);
            el.setAttribute("data-trin", String(t[faerdig ? 1 : 0]));
        },
        trin: function (navn, id, faerdig) {
            var t = (TRIN[navn] || {})[id] || [0, 0];
            return t[faerdig ? 1 : 0];
        }
    };
}());

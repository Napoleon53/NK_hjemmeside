/* =====================================================================
   scener.js - saetter tingene sammen til rummene

   NK.Scener.tegn(hvad, sag, tilstand) giver hele scenens SVG. Tingene,
   man kan klikke paa, er <g class="spor" data-spor="...">; app.js
   aabner kortet. Hoejst fire ting pr. rum, kodelaasen medregnet.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D, S = NK.Sprites, h = NK.html;
    var Sc = NK.Scener = {};

    /* Reaktionsskemaet som tekst. blanke: "__" foran hvert stof i stedet
       for koefficienten. tilstande: med (s), (g) osv. */
    Sc.skemaTekst = function (reak, blanke, tilstande) {
        var i = 0;
        function led(f) {
            var k = reak.k[i++];
            var navn = tilstande ? f : f.replace(/\([a-z]+\)$/, "");
            var pre = blanke ? "__ " : (k === 1 ? "" : k + " ");
            return pre + NK.formel(navn);
        }
        var v = reak.v.map(led).join(" + ");
        var hh = reak.h.map(led).join(" + ");
        return v + " → " + hh;
    };

    function kridtLinje(x, y, b, tekst, maks) {
        var str = Math.min(maks || 34, (b - 40) / (tekst.length * 0.56));
        return S.kridt(x, y, tekst, Math.round(str), "middle");
    }

    function ramme(farve, indhold) {
        return '<svg class="scenetegning" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Rummet">' +
            S.defs() + S.vaeg(farve) + indhold + '</svg>';
    }

    /* En ting, man kan klikke paa: et usynligt felt, tegningen og det gule
       skilt. Et klik paa skiltet goer det samme. */
    function spor(id, navn, felt, indhold, skilt, set) {
        return '<g class="spor' + (set ? " set" : "") + '" data-spor="' + id + '" tabindex="0" role="button" aria-label="' + h(navn) + '">' +
            '<rect class="spor-felt" x="' + felt[0] + '" y="' + felt[1] + '" width="' + felt[2] + '" height="' + felt[3] + '" fill="#fff" fill-opacity="0"/>' +
            indhold + S.skilt(skilt[0], skilt[1], navn) + '</g>';
    }

    /* Doeren og kodelaasen er én ting. */
    function doerOgLaas(nr, aaben) {
        var farve = D.FARVE[nr];
        return spor("laas", "Kodelås", [1140, 140, 380, 580],
            S.doer(1250, 160, 230, 560, farve, nr, aaben) + S.kodelaas(1160, 380, aaben),
            [1191, 344]);
    }

    function set(t, rum, id) { return !!(t && t.set && t.set[rum + ":" + id]); }

    /* ----- Rum 1 ------------------------------------------------------- */
    function rum1(r, t, aaben) {
        var x = D.LAB_IONER[r.x];
        var proeve = x.opl || [214, 228, 238];
        var tavle = S.tavle(90, 90, 540, 270,
            S.kridt(360, 150, "Afstem skemaet", 26, "middle", 300) +
            kridtLinje(360, 240, 540, Sc.skemaTekst(r.reaktion, true, false), 36));
        /* Dråbepladen viser de dryp, gruppen har lavet (række for række som kortet) */
        var fyld = r.kendte.concat(["x"]).map(function (id) {
            var ion = id === "x" ? r.x : id;
            return D.LAB_REAGENSER.map(function (re) {
                if (!(t && t.lab && t.lab[id + "-" + re.id])) return null;
                var res = D.LAB[ion][re.id];
                return { vaeske: D.LAB_IONER[ion].opl || [214, 228, 238], bundfald: res ? res.farve : null };
            });
        });
        var lab = S.draabeplade(270, 540, 5, 4, fyld) +
            '<rect x="170" y="506" width="70" height="34" rx="4" fill="url(#g-trae)"/>' +
            S.reagensglas(205, 524, 118, proeve, 0.5) +
            '<rect x="191" y="440" width="28" height="22" rx="3" fill="#f7f4ea"/>' +
            '<text x="205" y="457" text-anchor="middle" font-size="16" font-weight="700" fill="#222" font-family="Lexend, Segoe UI, sans-serif">X</text>' +
            S.draabeflaske(520, 540, "NaCl") + S.draabeflaske(580, 540, "KI") +
            S.draabeflaske(640, 540, "Na₂SO₄") + S.draabeflaske(700, 540, "NaOH");
        return spor("tavle", "Tavlen", [70, 70, 580, 330], tavle, [360, 400], set(t, 1, "tavle")) +
            spor("ps", "Det periodiske system", [720, 100, 360, 300], S.plakat(720, 100, 360), [900, 372], set(t, 1, "ps")) +
            S.bord(60, 1100) +
            spor("lab", "Prøve X", [150, 400, 600, 300], lab, [440, 612], set(t, 1, "lab")) +
            doerOgLaas(1, aaben);
    }

    /* ----- Rum 2 ------------------------------------------------------- */
    function rum2(r, t, aaben) {
        var formler = r.molekyler.map(function (m, i) {
            return S.kridt(90 + (i + 0.5) * 108, 250, m.formel, Math.min(34, Math.round(96 / (m.formel.length * 0.58))), "middle");
        }).join("");
        var tavle = S.tavle(90, 90, 540, 270,
            S.kridt(360, 150, "Hvilke er polære?", 26, "middle", 300) + formler);
        var flaske = S.hylde(730, 330, 360) +
            '<rect x="770" y="250" width="22" height="80" fill="#5b3a6e"/><rect x="794" y="262" width="18" height="68" fill="#2f5a7a"/><rect x="814" y="256" width="24" height="74" fill="#7a4a2a"/>' +
            S.flaske(960, 330, 96, 160, r.streg.formel, [210, 225, 235], "#8a1f1f");
        return spor("tavle", "Tavlen", [70, 70, 580, 330], tavle, [360, 400], set(t, 2, "tavle")) +
            spor("flaske", "Flasken", [900, 150, 130, 190], flaske, [960, 400], set(t, 2, "flaske")) +
            S.bord(60, 1100) +
            spor("notesbog", "Notesbogen", [270, 430, 300, 260], S.notesbog(420, 540), [420, 612], set(t, 2, "notesbog")) +
            S.kolbe(760, 540, 90, 120, [200, 220, 235], 0.3) + S.reagensglas(860, 532, 90, [230, 236, 240], 0.3) +
            doerOgLaas(2, aaben);
    }

    /* ----- Rum 3 ------------------------------------------------------- */
    function rum3(r, t, aaben) {
        var met = r.metal;
        var tavle = S.tavle(90, 90, 540, 270,
            kridtLinje(360, 165, 540, met.skema, 30) +
            S.kridt(360, 235, "M(" + met.sym + ") = " + NK.komma(met.M, 2) + " g/mol", 28, "middle", 300) +
            S.kridt(360, 290, "R = 0,08314 L · bar / (mol · K)", 26, "middle", 300));
        var vaegt = S.vaegt(330, 540, NK.komma(r.m, 2) + " g", met.sym) +
            S.flaske(560, 540, 84, 150, "2 M HCl", [226, 236, 240], "#2f4f8a");
        return spor("tavle", "Tavlen", [70, 70, 580, 330], tavle, [360, 400], set(t, 3, "tavle")) +
            spor("vejr", "Vejrstationen", [700, 100, 200, 260], S.vejrstation(700, 100, r.t + " °C", NK.komma(r.p, 3) + " bar"), [800, 382], set(t, 3, "vejr")) +
            S.bord(60, 1100) +
            spor("vaegt", "Vægten", [200, 370, 420, 300], vaegt, [400, 612], set(t, 3, "vaegt")) +
            doerOgLaas(3, aaben);
    }

    /* ----- Rum 4 og 5: titreringen ------------------------------------- */
    /* Flasken paa bordet hoerer til kolben i rum 4 (syren) og til
       buretten i rum 5 (permanganatet). */
    function titrering(nr, t, tavleIndhold, buretteVaeske, kolbeVaeske, flaskeEtiket, flaskeVaeske, laag, flaskeTil, aaben) {
        var bx = 820;
        var flaske = '<rect x="960" y="380" width="100" height="160" fill="#fff" fill-opacity="0"/>' +
            S.flaske(1010, 540, 80, 140, flaskeEtiket, flaskeVaeske, laag);
        var burette = S.burette(bx, 120, 400, buretteVaeske) + (flaskeTil === "burette" ? flaske : "");
        var kolbe = S.kolbe(bx, 540, 120, 112, kolbeVaeske, 0.36) + (flaskeTil === "kolbe" ? flaske : "");
        return spor("tavle", "Tavlen", [70, 70, 580, 330], S.tavle(90, 90, 540, 270, tavleIndhold), [360, 400], set(t, nr, "tavle")) +
            S.bord(60, 1100) +
            S.stativ(bx, 110) +
            spor("burette", "Buretten", [790, 100, 60, 350], burette, [930, 250], set(t, nr, "burette")) +
            spor("kolbe", "Kolben", [750, 430, 140, 112], kolbe, [bx, 612], set(t, nr, "kolbe")) +
            doerOgLaas(nr, aaben);
    }
    function rum4(r, t, aaben) {
        var skema = r.syre.formel + " + " + r.base.formel + " → " + r.base.kation + NK.formel(r.syre.anion) + " + H₂O";
        return titrering(4, t,
            kridtLinje(360, 175, 540, skema, 34) +
            S.kridt(360, 260, "pH = ?", 40, "middle", 300),
            [222, 234, 242], [246, 205, 222], r.syre.formel + " ?", [226, 236, 240], "#7a2a2a", "kolbe", aaben);
    }
    function rum5(r, t, aaben) {
        var red = r.redox;
        var kolbe = red.id === "fe" ? [214, 196, 226] : [222, 204, 232];
        /* Skemaet er langt: venstre side paa én linje, hoejre side paa den naeste */
        var dele = red.skema.replace(/\((aq|l|g)\)/g, "").split("→");
        return titrering(5, t,
            kridtLinje(360, 150, 540, dele[0].trim() + " →", 30) +
            kridtLinje(360, 200, 540, dele[1].trim(), 30) +
            S.kridt(360, 280, "c(" + red.stof + ") = ?", 36, "middle", 300),
            [118, 34, 120], kolbe, "KMnO₄", [118, 34, 120], "#3b1d4a", "burette", aaben);
    }

    /* ----- Den gyldne doer --------------------------------------------- */
    Sc.SEGLPLADS = { million: [676, 446], syregalgen: [924, 446], pacman: [676, 598], organisk: [924, 598] };
    function guld(t, aaben) {
        var s = '<rect x="0" y="0" width="1600" height="720" fill="#2a2414" fill-opacity="0.35"/>' +
            '<ellipse cx="800" cy="420" rx="360" ry="330" fill="#f1c40f" opacity="0.08" filter="url(#f-glod)"/>' +
            '<path d="M596 720 L596 220 Q596 116 800 108 Q1004 116 1004 220 L1004 720 Z" fill="#3a2e10" stroke="#f1c40f" stroke-width="6"/>';
        if (aaben) {
            s += '<path d="M620 720 L620 226 Q620 136 800 130 Q980 136 980 226 L980 720 Z" fill="url(#g-doerlys)"/>';
        } else {
            s += '<path d="M620 720 L620 226 Q620 136 800 130 Q980 136 980 226 L980 720 Z" fill="url(#g-guld)" stroke="#7a5a08" stroke-width="3"/>' +
                '<path d="M650 700 L650 236 Q650 166 800 160 Q950 166 950 236 L950 700 Z" fill="none" stroke="#7a5a08" stroke-opacity="0.55" stroke-width="4"/>' +
                '<rect x="660" y="262" width="280" height="76" rx="10" fill="#5a4208" fill-opacity="0.35"/>';
            for (var i = 0; i < 5; i++) {
                var kx = 688 + i * 56;
                s += '<circle cx="' + kx + '" cy="292" r="12" fill="#1a1407"/><rect x="' + (kx - 4) + '" y="296" width="8" height="18" fill="#1a1407"/>' +
                    S.noegle(kx - 16, 262, "url(#g-guld)", "#7a5a08", 0.45);
            }
            D.SEGL.forEach(function (sg) {
                var p = Sc.SEGLPLADS[sg.id], brudt = !!(t && t.segl && t.segl[sg.id]);
                s += spor("segl-" + sg.id, sg.spil, [p[0] - 105, p[1] - 52, 210, 150],
                    S.segl(p[0], p[1], S.SEGLMAERKER[sg.id], brudt), [p[0], p[1] + 76], brudt);
            });
        }
        return s;
    }

    /* ----- Startskaermen: gangen med fem doere ------------------------ */
    function start() {
        var s = '';
        for (var i = 1; i <= 5; i++) {
            var x = 70 + (i - 1) * 300;
            s += S.doer(x + 40, 250, 170, 470, D.FARVE[i], i, false);
        }
        return s;
    }

    Sc.tegn = function (hvad, sag, t) {
        var loest = function (n) { return t && t.naaet > n; };
        if (hvad === "start") return ramme("#3a4150", start());
        if (hvad === "guld") return ramme(D.FARVE[6], guld(t, false));
        if (hvad === "guld-aaben") return ramme(D.FARVE[6], guld(t, true));
        var r = sag.rum[hvad];
        var f = [null, rum1, rum2, rum3, rum4, rum5][hvad];
        return ramme(D.FARVE[hvad], f(r, t, loest(hvad)));
    };
}());

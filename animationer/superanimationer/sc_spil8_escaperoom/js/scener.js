/* =====================================================================
   scener.js - saetter tingene sammen til rummene

   NK.Scener.tegn(hvad, sag, tilstand) giver hele scenens SVG. Tingene,
   man kan klikke paa, er <g class="spor" data-spor="...">; app.js
   aabner kortet. Skiltet ved den ting, det naeste trin handler om, er
   fremhaevet ("aktiv"), og loeste trin faar et groent skilt med flueben.
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
        return reak.v.map(led).join(" + ") + " → " + reak.h.map(led).join(" + ");
    };

    /* Det foerste trin, der ikke er loest (antal trin, hvis alle er). */
    Sc.trinNr = function (r, t, rum) {
        for (var i = 0; i < r.trin.length; i++) if (!(t && t.trin && t.trin[rum + ":" + r.trin[i].id])) return i;
        return r.trin.length;
    };

    function kridtLinje(x, y, b, tekst, maks) {
        var str = Math.min(maks || 40, (b - 50) / (tekst.length * 0.56));
        return S.kridt(x, y, tekst, Math.round(str), "middle");
    }

    function ramme(farve, indhold) {
        return '<svg class="scenetegning" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Rummet">' +
            S.defs() + S.vaeg(farve) + indhold + "</svg>";
    }

    /* En ting, man kan klikke paa: et usynligt felt, tegningen og skiltet. */
    function spor(id, navn, felt, indhold, skilt, type) {
        return '<g class="spor' + (type ? " " + type : "") + '" data-spor="' + id + '" tabindex="0" role="button" aria-label="' + h(navn) + '">' +
            '<rect class="spor-felt" x="' + felt[0] + '" y="' + felt[1] + '" width="' + felt[2] + '" height="' + felt[3] + '" fill="#fff" fill-opacity="0"/>' +
            indhold + S.skilt(skilt[0], skilt[1], navn, type) + "</g>";
    }

    /* Rummets faelles ramme: giver typen til hvert trins skilt, doeren med
       kodelaasen og bonusskrinet. */
    function rumRamme(nr, r, t) {
        var nu = Sc.trinNr(r, t, nr), aaben = !!(t && t.naaet > nr), guld = !!(t && t.guld && t.guld[nr]);
        return {
            aaben: aaben,
            type: function (trinId) {
                for (var i = 0; i < r.trin.length; i++) {
                    if (r.trin[i].id === trinId) return i < nu ? "loest" : (i === nu && !aaben ? "aktiv" : "");
                }
                return "";
            },
            doer: function () {
                var type = aaben ? "loest" : nu >= r.trin.length ? "aktiv" : "";
                return spor("laas", "Kodelås", [1170, 150, 390, 600],
                    S.doer(1290, 170, 230, 570, D.FARVE[nr], nr, aaben) + S.kodelaas(1195, 400, aaben), [1230, 364], type);
            },
            bonus: function () {
                return spor("bonus", guld ? "Bonus løst" : "Bonusrute", [1000, 460, 150, 130], S.paa(1075, 580, 1, S.skrin(guld)), [1075, 664], "bonus");
            }
        };
    }
    function har(t, noegle) { return !!(t && t.handl && t.handl[noegle]); }

    /* ----- Rum 1 --------------------------------------------------------- */
    function rum1(r, t) {
        var R = rumRamme(1, r, t);
        var x = D.LAB_IONER[r.x], proeve = x.opl || [214, 230, 244];
        var tavle = S.tavle(70, 60, 600, 300,
            S.kridt(370, 130, "Afstem skemaet", 30, "middle", 400) +
            kridtLinje(370, 245, 600, Sc.skemaTekst(r.reaktion, true, false), 46));
        /* Draabepladen viser de dryp, gruppen har lavet (raekke for raekke som kortet) */
        var fyld = r.kendte.concat(["x"]).map(function (id) {
            var ion = id === "x" ? r.x : id;
            return D.LAB_REAGENSER.map(function (re) {
                if (!(t && t.lab && t.lab[id + "-" + re.id])) return null;
                var res = D.LAB[ion][re.id];
                return { vaeske: D.LAB_IONER[ion].opl || [214, 230, 244], bundfald: res ? res.farve : null };
            });
        });
        var lab = S.paa(140, 580, 1, S.reagensglas(150, [{ farve: proeve, andel: 0.5 }]) +
                '<rect x="-17" y="-128" width="34" height="30" rx="3" fill="#fff" stroke="' + S.KONTUR + '" stroke-width="2"/>' +
                '<text x="0" y="-105" text-anchor="middle" font-size="22" font-weight="700" fill="' + S.KONTUR + '" font-family="Lexend, Segoe UI, sans-serif">X</text>') +
            S.paa(210, 580, 1, S.draabeplade(5, 4, fyld)) +
            D.LAB_REAGENSER.map(function (re, i) { return S.paa(535 + i * 68, 580, 1, S.draabeflaske(re.formel)); }).join("");
        return spor("tavle", "Tavlen", [50, 40, 640, 350], tavle, [370, 410], R.type("afstem")) +
            spor("ps", "Det periodiske system", [770, 60, 380, 270], S.paa(770, 60, 1, S.plakat(380)), [960, 356], R.type("z")) +
            S.bord(40, 1170) +
            spor("lab", "Dråbepladen", [100, 410, 690, 180], lab, [430, 664], R.type("ion")) +
            R.bonus() + R.doer();
    }

    /* ----- Rum 2 --------------------------------------------------------- */
    function rum2(r, t) {
        var R = rumRamme(2, r, t);
        var formler = r.molekyler.map(function (m, i) {
            return S.kridt(70 + (i + 0.5) * 120, 260, m.formel, Math.min(40, Math.round(108 / (m.formel.length * 0.58))), "middle");
        }).join("");
        var tavle = S.tavle(70, 60, 600, 300, S.kridt(370, 135, "Hvilke er polære?", 30, "middle", 400) + formler);
        var flaske = S.paa(790, 330, 1, S.hylde(330)) +
            '<rect x="820" y="236" width="26" height="94" fill="#7d5aa6" stroke="' + S.KONTUR + '" stroke-width="2.5"/>' +
            '<rect x="848" y="250" width="22" height="80" fill="#3f7fb5" stroke="' + S.KONTUR + '" stroke-width="2.5"/>' +
            S.paa(1000, 330, 1, S.flaske(124, 210, r.streg.formel, [220, 232, 242], "#c0392b"));
        var vaesker = r.stoffer.map(function (st, i) {
            return S.paa(125 + i * 104, 580, 1, st.fast
                ? S.flaske(84, 120, "", st.farve, "#6b7280")
                : S.flaske(84, 150, "", st.farve, st.navn === "vand" ? "#2f6fd0" : "#6b7280"));
        }).join("") +
            '<rect x="735" y="552" width="70" height="28" rx="4" fill="url(#g-trae)" stroke="' + S.KONTUR + '" stroke-width="2.5"/>' +
            S.paa(770, 566, 1, S.reagensglas(150, []));
        return spor("tavle", "Tavlen", [50, 40, 640, 350], tavle, [370, 410], R.type("polaer")) +
            spor("flaske", "Flasken", [930, 100, 140, 240], flaske, [1000, 396], R.type("streger")) +
            S.bord(40, 1170) +
            spor("bland", "Væskerne", [70, 400, 760, 190], vaesker, [430, 664], R.type("bland")) +
            R.bonus() + R.doer();
    }

    /* ----- Rum 3 --------------------------------------------------------- */
    function rum3(r, t) {
        var R = rumRamme(3, r, t);
        var met = r.metal, vejet = har(t, "3:vej"), haeldt = har(t, "3:gas");
        var tavle = S.tavle(70, 60, 600, 300,
            kridtLinje(370, 150, 600, met.skema, 34) +
            S.kridt(370, 230, "M(" + met.sym + ") = " + NK.komma(met.M, 2) + " g/mol", 32, "middle") +
            S.kridt(370, 300, "R = 0,08314 L · bar / (mol · K)", 28, "middle", 400));
        var vaegt = S.paa(250, 580, 1.1, S.vaegt(vejet && !haeldt ? NK.komma(r.m, 2) + " g" : "0,00 g", vejet && !haeldt ? met.sym : null)) +
            (vejet ? "" : S.paa(440, 580, 1.1, S.vejebaad(met.sym)));
        var kolbe = S.paa(640, 580, 1, S.kolbe(150, 160, [222, 234, 244], 0.42, haeldt)) + S.paa(640, 420, 0.8, S.gassproejte(haeldt ? 0.8 : 0)) +
            '<rect x="606" y="486" width="68" height="30" rx="3" fill="#fff" stroke="' + S.KONTUR + '" stroke-width="2"/>' +
            '<text x="640" y="508" text-anchor="middle" font-size="19" font-weight="700" fill="' + S.KONTUR + '" font-family="Lexend, Segoe UI, sans-serif">HCl</text>';
        return spor("info", "Tavlen", [50, 40, 640, 350], tavle, [370, 410], "") +
            spor("vejr", "Vejrstationen", [900, 40, 220, 280], S.paa(900, 40, 1, S.vejrstation(r.t + " °C", NK.komma(r.p, 3) + " bar")), [1010, 346], R.type("rumfang")) +
            S.bord(40, 1170) +
            spor("vaegt", "Vægten", [100, 430, 410, 160], vaegt, [290, 664], R.type("vej")) +
            spor("kolbe", "Kolben", [550, 330, 320, 260], kolbe, [640, 664], R.type("gas")) +
            R.bonus() + R.doer();
    }

    /* ----- Rum 4 og 5: titreringen ---------------------------------------- */
    function ur() {
        return '<circle cx="950" cy="190" r="70" fill="#fff" stroke="' + S.KONTUR + '" stroke-width="4"/>' +
            '<line x1="950" y1="190" x2="950" y2="140" stroke="' + S.KONTUR + '" stroke-width="5" stroke-linecap="round"/>' +
            '<line x1="950" y1="190" x2="986" y2="208" stroke="' + S.KONTUR + '" stroke-width="5" stroke-linecap="round"/>' +
            '<circle cx="950" cy="190" r="6" fill="' + S.KONTUR + '"/>';
    }
    function titrering(nr, r, t, tavleIndhold, tavleTrin, buretteVaeske, kolbeFoer, kolbeEfter, flaskeEtiket, flaskeVaeske, laag, flaskeTil) {
        var R = rumRamme(nr, r, t), titreret = har(t, nr + ":titrer"), bx = 500;
        var flaske = '<rect x="700" y="400" width="120" height="180" fill="#fff" fill-opacity="0"/>' + S.paa(760, 580, 1, S.flaske(100, 165, flaskeEtiket, flaskeVaeske, laag));
        var burette = S.paa(bx, 580, 1, S.burette(300, buretteVaeske, titreret ? 1 : 0)) + (flaskeTil === "burette" ? flaske : "");
        var kolbe = S.paa(bx, 566, 1, S.kolbe(124, 112, titreret ? kolbeEfter : kolbeFoer, 0.4)) + (flaskeTil === "kolbe" ? flaske : "");
        return spor("tavle", "Tavlen", [50, 40, 640, 350], S.tavle(70, 60, 600, 300, tavleIndhold), [370, 410], R.type(tavleTrin)) +
            ur() + S.bord(40, 1170) +
            spor("burette", "Buretten", [400, 110, 140, 340], burette, [640, 260], R.type("titrer")) +
            spor("kolbe", "Kolben", [430, 452, 140, 130], kolbe, [500, 664], R.type("konc")) +
            R.bonus() + R.doer();
    }
    function rum4(r, t) {
        var skema = r.syre.formel + " + " + r.base.formel + " → " + r.base.kation + NK.formel(r.syre.anion) + " + H₂O";
        return titrering(4, r, t,
            kridtLinje(370, 170, 600, skema, 40) + S.kridt(370, 280, "pH = ?", 50, "middle"), "ph",
            [226, 236, 246], [226, 236, 246], [250, 190, 214], r.syre.formel + " ?", [226, 236, 246], "#b3261e", "kolbe");
    }
    function rum5(r, t) {
        var red = r.redox;
        /* Skemaet er langt: venstre side paa én linje, hoejre side paa den naeste */
        var dele = red.skema.replace(/\((aq|l|g)\)/g, "").split("→");
        return titrering(5, r, t,
            kridtLinje(370, 140, 600, dele[0].trim() + " →", 36) + kridtLinje(370, 200, 600, dele[1].trim(), 36) +
            S.kridt(370, 300, "n(" + red.stof + ") = ?", 42, "middle"), "forhold",
            [128, 40, 132], red.id === "fe" ? [214, 236, 214] : [226, 236, 246], [226, 190, 232], "KMnO₄", [128, 40, 132], "#4a2060", "burette");
    }

    /* ----- Den gyldne doer ------------------------------------------------- */
    Sc.SEGLPLADS = { million: [676, 446], syregalgen: [924, 446], pacman: [676, 598], organisk: [924, 598] };
    function guld(t, aaben) {
        var K = S.KONTUR;
        var s = '<path d="M590 740 L590 220 Q590 108 800 100 Q1010 108 1010 220 L1010 740 Z" fill="#8a6a12" stroke="' + K + '" stroke-width="4"/>';
        if (aaben) {
            s += '<path d="M618 740 L618 226 Q618 136 800 130 Q982 136 982 226 L982 740 Z" fill="url(#g-doerlys)" stroke="' + K + '" stroke-width="3"/>';
        } else {
            s += '<path d="M618 740 L618 226 Q618 136 800 130 Q982 136 982 226 L982 740 Z" fill="url(#g-guld)" stroke="' + K + '" stroke-width="3"/>' +
                '<path d="M648 716 L648 236 Q648 166 800 160 Q952 166 952 236 L952 716 Z" fill="none" stroke="#8a6a12" stroke-width="4"/>' +
                '<rect x="660" y="258" width="280" height="84" rx="10" fill="#fff3b0" stroke="' + K + '" stroke-width="3"/>';
            for (var i = 0; i < 5; i++) {
                var kx = 688 + i * 56;
                s += '<circle cx="' + kx + '" cy="298" r="12" fill="' + K + '"/><rect x="' + (kx - 4) + '" y="302" width="8" height="20" fill="' + K + '"/>' +
                    S.noegle(kx - 18, 264, "#f6cd2b", K, 0.45);
            }
            D.SEGL.forEach(function (sg) {
                var p = Sc.SEGLPLADS[sg.id], brudt = !!(t && t.segl && t.segl[sg.id]);
                s += spor("segl-" + sg.id, sg.spil, [p[0] - 105, p[1] - 52, 210, 150],
                    S.paa(p[0], p[1], 1, S.segl(S.SEGLMAERKER[sg.id], brudt)), [p[0], p[1] + 76], brudt ? "loest" : "");
            });
        }
        return s;
    }

    /* ----- Startskaermen: gangen med fem doere ---------------------------- */
    function start() {
        var s = "";
        for (var i = 1; i <= 5; i++) s += S.doer(110 + (i - 1) * 300, 270, 180, 470, D.FARVE[i], i, false);
        return s;
    }

    Sc.tegn = function (hvad, sag, t) {
        if (hvad === "start") return ramme("#7d8ea3", start());
        if (hvad === "guld") return ramme(D.FARVE[6], guld(t, false));
        if (hvad === "guld-aaben") return ramme(D.FARVE[6], guld(t, true));
        var f = [null, rum1, rum2, rum3, rum4, rum5][hvad];
        return ramme(D.FARVE[hvad], f(sag.rum[hvad], t));
    };
}());

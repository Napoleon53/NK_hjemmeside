/* =====================================================================
   udstyr.js - kataloget over laboratoriets udstyr

   Hver type udstyr har ét sted, hvad den er, og hvad den kan:
     sprite            navn i NK.Sprites (fil, b, h registreres her) eller
                       null, naar genstanden tegnes i koden
     anker             ankerpunktet i spritets egne koordinater: for
                       beholdere aabningens midte, saa en positur { x, y, v }
                       drejer glasset om aabningen, naar der haeldes
     kan               egenskaber, som bordet afgoer moeder efter:
                         holder     rummer vaeske og fast stof
                         haelder    kan haelde sit indhold i noget andet
                         drypper    giver draaber (draabeflaske)
                         sproejter  giver en sjat vand (sproejteflaske)
                         pulver     fast stof, der tages med spatlen
                         spatel     baerer en spatelspids
                         roerer     roerer rundt (glasstav)
                         maaler     maaler temperatur (termometer)
                         varmer     varmer det, der staar paa den
                         stoette    holder glas i huller (stativ)
                         affald     tager imod alt, der haeldes i
                         vask       tager imod alt, der haeldes i
                         papir      toerrer pytter op
                         fast       kan ikke tages op (staar fast paa bordet)
     indre             indersiden som polygon i spritets koordinater
     mlPrAreal         areal i tegneenheder pr. mL
     maks              rumfang i mL, foer det loeber over
     tud               hvor vaesken forlader beholderen, naar den haelder,
                       og hvor meget den haelder (radianer)
     haeldMl           hvor meget en haeldning giver (0 = alt)
     vejlaengde        lysvej i forhold til et reagensglas (til farven)
     etiket            feltet til etiketten paa flasker og pulverglas
     pulverfelt        feltet, hvor pulveret ligger i et pulverglas
     omrids            sti i spritets koordinater til et moerkt omrids,
                       saa glasset ogsaa ses mod en lys baggrund
     huller            x-positioner (i spritets koordinater) for glas i et
                       stativ, og hulY: hvor glassets aabning staar
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function pts(liste) { return liste.map(function (p) { return { x: p[0], y: p[1] }; }); }

    var GLAS_INDRE = (function () {
        var l = [[6, 4], [24, 4], [24, 143]];
        for (var i = 1; i < 12; i++) {
            var v = Math.PI * i / 12;
            l.push([15 + 9 * Math.cos(v), 143 + 9 * Math.sin(v)]);
        }
        l.push([6, 143]);
        return pts(l);
    }());

    var BAEGER100_INDRE = pts([[6, 6], [66, 6], [66, 100], [62, 104], [10, 104], [6, 100]]);
    var BAEGER250_INDRE = pts([[8, 8], [104, 8], [104, 121], [99, 126], [13, 126], [8, 121]]);
    var KOLBE_INDRE = pts([[37.8, 4], [37.8, 41.6], [8.3, 113.3], [8.6, 119.5], [14.1, 123.5], [81.9, 123.5], [87.4, 119.5], [87.7, 113.3], [58.2, 41.6], [58.2, 4]]);
    var MAALEGLAS_INDRE = pts([[8, 12], [36, 12], [36, 208], [33, 212], [11, 212], [8, 208]]);
    var FLASKE_INDRE = pts([[5, 34], [37, 34], [37, 92], [32, 97], [10, 97], [5, 92]]);
    var PULVER_INDRE = pts([[4, 12], [34, 12], [34, 47], [31, 49], [7, 49], [4, 47]]);

    var TYPER = {
        reagensglas: {
            sprite: "reagensglas", fil: "reagensglas.svg", b: 30, h: 160,
            anker: { x: 15, y: 2 },
            kan: { holder: true, haelder: true },
            indre: GLAS_INDRE, mlPrAreal: 146, maks: 17, haeldMl: 0,
            tud: { x: 4, y: 3, v: -2.0 },
            vejlaengde: 1, titel: "reagensglasset",
            omrids: function (ctx) {
                ctx.moveTo(3, 3);
                ctx.lineTo(3, 143);
                ctx.arc(15, 143, 12, Math.PI, 0, true);
                ctx.lineTo(27, 3);
            }
        },
        baeger100: {
            sprite: "baeger100", fil: "baegerglas_100.svg", b: 72, h: 110,
            anker: { x: 36, y: 4 },
            kan: { holder: true, haelder: true },
            indre: BAEGER100_INDRE, mlPrAreal: 54, maks: 100, haeldMl: 20,
            tud: { x: 1, y: 3.5, v: -1.15 },
            vejlaengde: 2, titel: "bægerglasset", valgtMaerke: { x: 60, y: -8 },
            omrids: function (ctx) {
                ctx.moveTo(3, 4);
                ctx.lineTo(3, 101);
                ctx.quadraticCurveTo(3, 109, 11, 109);
                ctx.lineTo(61, 109);
                ctx.quadraticCurveTo(69, 109, 69, 101);
                ctx.lineTo(69, 4);
            }
        },
        baeger250: {
            sprite: "baeger250", fil: "baegerglas.svg", b: 112, h: 132,
            anker: { x: 56, y: 6 },
            kan: { holder: true, haelder: true },
            indre: BAEGER250_INDRE, mlPrAreal: 43, maks: 250, haeldMl: 25,
            tud: { x: 3, y: 6, v: -1.1 },
            vejlaengde: 3, titel: "det store bægerglas", valgtMaerke: { x: 96, y: -8 },
            omrids: function (ctx) {
                ctx.moveTo(4, 6);
                ctx.lineTo(4, 122);
                ctx.quadraticCurveTo(4, 130, 12, 130);
                ctx.lineTo(100, 130);
                ctx.quadraticCurveTo(108, 130, 108, 122);
                ctx.lineTo(108, 6);
            }
        },
        kolbe: {
            sprite: "kolbe", fil: "kolbe.svg", b: 96, h: 128,
            anker: { x: 48, y: 2.5 },
            kan: { holder: true, haelder: true },
            indre: KOLBE_INDRE, mlPrAreal: NK.polyAreal(KOLBE_INDRE) / 270, maks: 250, haeldMl: 25,
            tud: { x: 40, y: 3, v: -1.95 },
            vejlaengde: 3, titel: "kolben",
            omrids: function (ctx) {
                ctx.moveTo(35.2, 3.8);
                ctx.lineTo(35.2, 41);
                ctx.lineTo(5.1, 114);
                ctx.quadraticCurveTo(2.6, 126.7, 14, 126.7);
                ctx.lineTo(82, 126.7);
                ctx.quadraticCurveTo(93.4, 126.7, 90.9, 114);
                ctx.lineTo(60.8, 41);
                ctx.lineTo(60.8, 3.8);
            }
        },
        maaleglas: {
            sprite: "maaleglas", fil: "maaleglas.svg", b: 44, h: 220,
            anker: { x: 22, y: 4 },
            kan: { holder: true, haelder: true },
            indre: MAALEGLAS_INDRE, mlPrAreal: NK.polyAreal(MAALEGLAS_INDRE) / 100, maks: 100, haeldMl: 10,
            tud: { x: 4, y: 5, v: -1.3 },
            vejlaengde: 1.4, titel: "måleglasset",
            omrids: function (ctx) {
                ctx.moveTo(6, 6);
                ctx.lineTo(6, 210);
                ctx.quadraticCurveTo(6, 215, 11, 215);
                ctx.lineTo(33, 215);
                ctx.quadraticCurveTo(38, 215, 38, 210);
                ctx.lineTo(38, 6);
            }
        },
        flaske: {
            sprite: "flaske", fil: "flaske.svg", b: 42, h: 100,
            anker: { x: 21, y: 3 },
            kan: { holder: true, haelder: true, flaske: true },
            indre: FLASKE_INDRE, mlPrAreal: NK.polyAreal(FLASKE_INDRE) / 250, maks: 250, haeldMl: 10,
            tud: { x: 15, y: 3, v: -1.9 },
            vejlaengde: 1.5, titel: "flasken",
            etiket: { x: 6, y: 61, b: 30, h: 23 }
        },
        draabeflaske: {
            sprite: "draabeflaske", fil: "draabeflaske.svg", b: 46, h: 110,
            anker: { x: 23, y: 0 },
            kan: { holder: true, drypper: true, flaske: true },
            indre: pts([[6, 44], [40, 44], [40, 104], [36, 108], [10, 108], [6, 104]]), mlPrAreal: 30, maks: 60, haeldMl: 0,
            tud: { x: 23, y: 0, v: 0 },
            vejlaengde: 1, titel: "dråbeflasken",
            etiket: { x: 5, y: 60, b: 36, h: 32 }, skjulIndhold: true
        },
        sproejteflaske: {
            sprite: "sproejteflaske", fil: "sproejteflaske.svg", b: 46, h: 120,
            anker: { x: 44, y: 9 },
            kan: { holder: true, sproejter: true },
            indre: pts([[4, 30], [42, 30], [42, 116], [38, 119], [8, 119], [4, 116]]), mlPrAreal: 6, maks: 500, haeldMl: 10,
            tud: { x: 44, y: 9, v: 0.55 },
            vejlaengde: 1, titel: "sprøjteflasken", skjulIndhold: true
        },
        pulverglas: {
            sprite: "pulverglas", fil: "pulverglas.svg", b: 38, h: 52,
            anker: { x: 19, y: 4 },
            kan: { holder: true, pulver: true },
            indre: PULVER_INDRE, mlPrAreal: 20, maks: 30, haeldMl: 0,
            vejlaengde: 1, titel: "pulverglasset",
            etiket: { x: 5, y: 17.5, b: 28, h: 10.5 }, pulverfelt: { x0: 4, x1: 34, y: 49, top: 31 }, skjulIndhold: true
        },
        spatel: {
            sprite: "spatel", fil: "spatel.svg", b: 96, h: 12,
            anker: { x: 12, y: 6 },
            kan: { spatel: true },
            titel: "spatlen", ske: { x: 12, y: 3.5 }
        },
        glasstav: {
            sprite: null, b: 8, h: 130,
            anker: { x: 0, y: 0 },
            kan: { roerer: true },
            laengde: 130, titel: "glasstaven"
        },
        termometer: {
            sprite: null, b: 14, h: 120,
            anker: { x: 0, y: 0 },
            kan: { maaler: true },
            laengde: 120, titel: "termometeret"
        },
        stativ: {
            sprite: "stativ", fil: "stativ8.svg", b: 362, h: 100,
            anker: { x: 0, y: 0 },
            kan: { stoette: true, fast: true },
            huller: [34, 76, 118, 160, 202, 244, 286, 328], hulY: -54,
            titel: "stativet"
        },
        varmeplade: {
            sprite: "varmeplade", fil: "varmeplade.svg", b: 180, h: 72,
            anker: { x: 0, y: 0 },
            kan: { varmer: true, fast: true },
            plade: { x0: 20, x1: 160, y: 4 }, temperatur: 250,
            titel: "varmepladen"
        },
        affaldsdunk: {
            sprite: "affaldsdunk", fil: "affaldsdunk.svg", b: 90, h: 130,
            anker: { x: 45, y: 12 },
            kan: { affald: true, fast: true },
            etiket: { x: 12, y: 46, b: 66, h: 40 },
            titel: "affaldsdunken"
        },
        vask: {
            sprite: "vask", fil: "vask.svg", b: 110, h: 160,
            anker: { x: 55, y: 90 },
            kan: { vask: true, fast: true },
            titel: "vasken"
        },
        koekkenrulle: {
            sprite: "koekkenrulle", fil: "koekkenrulle.svg", b: 72, h: 44,
            anker: { x: 36, y: 22 },
            kan: { papir: true },
            titel: "køkkenrullen"
        }
    };

    /* Sprites registreres, saa NK.Sprites.start() henter dem */
    Object.keys(TYPER).forEach(function (navn) {
        var t = TYPER[navn];
        t.navn = navn;
        t.kan = t.kan || {};
        if (t.sprite && t.fil) NK.Sprites.tilfoej(t.sprite, { fil: t.fil, b: t.b, h: t.h });
    });
    NK.Sprites.tilfoej("haand", { fil: "haand.svg", b: 96, h: 84 });
    NK.Sprites.tilfoej("lup", { fil: "lup.svg", b: 40, h: 40 });
    /* Kost og fejeblad til laereren, naar et glas er knust */
    NK.Sprites.tilfoej("kost", { fil: "kost.svg", b: 130, h: 56 });
    NK.Sprites.tilfoej("fejeblad", { fil: "fejeblad.svg", b: 120, h: 54 });

    /* Det, der er af glas, knuses, hvis det tabes paa gulvet eller
       rystes ekstremt voldsomt */
    ["reagensglas", "baeger100", "baeger250", "kolbe", "maaleglas", "flaske", "glasstav", "termometer"].forEach(function (n) { TYPER[n].glas = true; });

    NK.Udstyr = {
        TYPER: TYPER,
        HAAND_ANKER: { x: 40, y: 46 },

        type: function (navn) {
            if (!TYPER[navn]) throw new Error("ukendt udstyr: " + navn);
            return TYPER[navn];
        },

        /* Et forsoeg kan tilfoeje sit eget udstyr (med egne sprites) */
        tilfoej: function (navn, t) {
            t.navn = navn;
            t.kan = t.kan || {};
            if (t.sprite && t.fil) NK.Sprites.tilfoej(t.sprite, { fil: t.fil, b: t.b, h: t.h, mappe: t.mappe });
            TYPER[navn] = t;
            return t;
        }
    };
}());

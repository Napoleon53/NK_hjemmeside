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
     mlPrAreal         areal i tegneenheder pr. mL. UDLEDES af indersiden og
                       maks, saa vaesken staar praecis til kanten, naar
                       beholderen er fuld. Skrives kun i typen for vinduer.
     maks              rumfang i mL, foer det loeber over. For aabent
                       glasudstyr er det rumfanget af den tegnede form
                       (se _geometri.html); for vinduer et rigtigt tal.
     vindue            indersiden er kun et kig ind i beholderen, ikke hele
                       dens rum (flasker og pulverglas med etiket). Saa
                       udledes rumfanget ikke af tegningen.
     rund              false for det, der ikke er et omdrejningslegeme
                       (vejebaaden). Saa maales det ikke.
     tud               hvor vaesken forlader beholderen, naar den haelder,
                       og hvor meget den haelder (radianer)
     haeldMl           hvor meget en haeldning giver (0 = alt)
     vejlaengde        lysvej i forhold til et reagensglas (til farven).
                       UDLEDES af indersidens bredde og LYSVEJ_DAEMPNING
     etiket            feltet til etiketten paa flasker og pulverglas
     pulverfelt        feltet, hvor pulveret ligger i et pulverglas
     omrids            sti i spritets koordinater til et moerkt omrids,
                       saa glasset ogsaa ses mod en lys baggrund
     huller            x-positioner (i spritets koordinater) for glas i et
                       stativ, og hulY: hvor glassets aabning staar.
                       bundY: stativets (eller badets) bund. Et glas, der
                       er for kort til at naa den fra hullet eller kanten
                       (et reagensglas tegnet i mindre maalestok), synker
                       ned, til indersidens bund staar dér, som et rigtigt
                       glas i et rigtigt stativ
     streger           inddelingen paa glasudstyr: { hver, smaa, til, lang,
                       kort, luft | x, str, tekst: "venstre"|"hoejre",
                       navn: { x, y, str } }. Stregerne og rumfanget
                       (»600 mL«) staar ikke i spriten, men tegnes af
                       tegning.js der, hvor vaesken naar op til ved det
                       rumfang (NK.Udstyr.streger), saa de altid passer til
                       det, motoren regner. hver: mL mellem stregerne med
                       tal; smaa: mellem de korte; til: den oeverste streg
                       (ellers den stoerste under 85 % af maks); lang, kort:
                       stregernes laengde; luft: afstand til indersidens
                       hoejre side, eller x: fast venstre ende; str:
                       skriftens stoerrelse; navn: hvor rumfanget staar;
                       nominel: rumfanget, der staar paa glasset, hvis det
                       ikke er maks (maaleglasset: 100 mL, men der er luft
                       over den oeverste streg, saa maks er til kanten).
                       Alt i spritets enheder foer skalering
     traefBund         de nederste enheder af tegningen, som musen ikke
                       rammer (reagensglasset: bunden staar nede i stativet,
                       og det, der stilles foran det, skal ikke ramme det)
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

    var BAEGER_LILLE_INDRE = pts([[6, 6], [66, 6], [66, 100], [62, 104], [10, 104], [6, 100]]);
    var BAEGER_STOR_INDRE = pts([[8, 8], [104, 8], [104, 121], [99, 126], [13, 126], [8, 121]]);
    var KOLBE_INDRE = pts([[37.8, 4], [37.8, 41.6], [8.3, 113.3], [8.6, 119.5], [14.1, 123.5], [81.9, 123.5], [87.4, 119.5], [87.7, 113.3], [58.2, 41.6], [58.2, 4]]);
    var MAALEGLAS_INDRE = pts([[7, 8], [37, 8], [37, 197], [34, 200], [10, 200], [7, 197]]);
    var FLASKE_INDRE = pts([[5, 34], [37, 34], [37, 92], [32, 97], [10, 97], [5, 92]]);
    var PULVER_INDRE = pts([[4, 12], [34, 12], [34, 47], [31, 49], [7, 49], [4, 47]]);

    /* Det store baegerglas og badet deler sprite og inddeling */
    var STREGER_STOR = { hver: 100, smaa: 50, lang: 14, kort: 8, luft: 8, str: 6, navn: { x: 40, y: 118, str: 6 } };

    var TYPER = {
        reagensglas: {
            sprite: "reagensglas", fil: "reagensglas.svg", b: 30, h: 160,
            anker: { x: 15, y: 2 }, traefBund: 24,
            kan: { holder: true, haelder: true },
            indre: GLAS_INDRE, maks: 30, haeldMl: 0,
            tud: { x: 4, y: 3, v: -2.0 },
            vejlaengde: 1, titel: "reagensglasset",
            omrids: function (ctx) {
                ctx.moveTo(3, 3);
                ctx.lineTo(3, 143);
                ctx.arc(15, 143, 12, Math.PI, 0, true);
                ctx.lineTo(27, 3);
            }
        },
        baegerLille: {
            sprite: "baegerLille", fil: "baegerglas_100.svg", b: 72, h: 110,
            anker: { x: 36, y: 4 },
            streger: { hver: 50, smaa: 25, lang: 12, kort: 7, luft: 4, str: 6, navn: { x: 30, y: 99, str: 5.6 } },
            kan: { holder: true, haelder: true },
            indre: BAEGER_LILLE_INDRE, maks: 250, haeldMl: 20,
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
        baegerStor: {
            sprite: "baegerStor", fil: "baegerglas.svg", b: 112, h: 132,
            anker: { x: 56, y: 6 },
            streger: STREGER_STOR,
            kan: { holder: true, haelder: true },
            indre: BAEGER_STOR_INDRE, maks: 600, haeldMl: 25,
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
        /* Et bad: et stort baegerglas, der staar fast, og som man saetter
           reagensglas ned i. Glasset i badet tager badets temperatur.
           Uden mere: det er bare et baegerglas med vand, saa et bad paa en
           varmeplade bliver et rigtigt vandbad, naar pladen taendes. Med
           holdT i opstillingen holdes badet paa en fast temperatur (is,
           der fyldes efter, eller en termostat). */
        bad: {
            sprite: "baegerStor", fil: "baegerglas.svg", b: 112, h: 132,
            anker: { x: 56, y: 6 },
            streger: STREGER_STOR,
            kan: { holder: true, haelder: false, bad: true, fast: true },
            indre: BAEGER_STOR_INDRE, maks: 600, haeldMl: 0,
            vejlaengde: 3, titel: "badet", valgtMaerke: { x: 96, y: -8 },
            plade: { x0: 14, x1: 98, y: 20 },
            /* Her staar et reagensglas' bund i badet (et glas i fuld
               stoerrelse naar den fra kanten; et kortere synker ned til
               den, saa indholdet kommer ned i vandet) */
            bundY: 108,
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
            streger: { hver: 50, lang: 7.7, x: 41, str: 5.1, tekst: "hoejre", bred: 0.9, navn: { x: 48, y: 119, str: 4.8 } },
            kan: { holder: true, haelder: true },
            indre: KOLBE_INDRE, maks: 200, haeldMl: 40,
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
            streger: { hver: 20, smaa: 10, til: 100, nominel: 100, lang: 12, kort: 8, luft: 4, str: 4.6, bred: 0.8, navn: { x: 22, y: 196, str: 4.4 } },
            kan: { holder: true, haelder: true },
            indre: MAALEGLAS_INDRE, maks: 110, haeldMl: 10,
            tud: { x: 2, y: 3.5, v: -1.3 },
            vejlaengde: 1.3, titel: "måleglasset",
            omrids: function (ctx) {
                ctx.moveTo(5, 6);
                ctx.lineTo(5, 202);
                ctx.moveTo(39, 202);
                ctx.lineTo(39, 6);
            }
        },
        flaske: {
            sprite: "flaske", fil: "flaske.svg", b: 42, h: 100,
            anker: { x: 21, y: 3 },
            kan: { holder: true, haelder: true, flaske: true },
            vindue: true,
            indre: FLASKE_INDRE, mlPrAreal: NK.polyAreal(FLASKE_INDRE) / 250, maks: 250, haeldMl: 10,
            tud: { x: 15, y: 3, v: -1.9 },
            vejlaengde: 1.5, titel: "flasken",
            etiket: { x: 6, y: 61, b: 30, h: 23 }
        },
        draabeflaske: {
            sprite: "draabeflaske", fil: "draabeflaske.svg", b: 46, h: 110,
            anker: { x: 23, y: 0 },
            kan: { holder: true, drypper: true, flaske: true },
            vindue: true,
            indre: pts([[6, 44], [40, 44], [40, 104], [36, 108], [10, 108], [6, 104]]), mlPrAreal: 30, maks: 60, haeldMl: 0,
            tud: { x: 23, y: 0, v: 0 },
            vejlaengde: 1, titel: "dråbeflasken",
            etiket: { x: 5, y: 60, b: 36, h: 32 }, skjulIndhold: true
        },
        sproejteflaske: {
            sprite: "sproejteflaske", fil: "sproejteflaske.svg", b: 46, h: 120,
            anker: { x: 44, y: 9 },
            kan: { holder: true, sproejter: true },
            vindue: true,
            indre: pts([[4, 30], [42, 30], [42, 116], [38, 119], [8, 119], [4, 116]]), mlPrAreal: 6, maks: 500, haeldMl: 10,
            tud: { x: 44, y: 9, v: 0.55 },
            vejlaengde: 1, titel: "sprøjteflasken", skjulIndhold: true
        },
        pulverglas: {
            sprite: "pulverglas", fil: "pulverglas.svg", b: 38, h: 52,
            anker: { x: 19, y: 4 },
            kan: { holder: true, pulver: true },
            vindue: true,
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
            huller: [34, 76, 118, 160, 202, 244, 286, 328], hulY: -54, bundY: 88,
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
        },
        /* Maaleudstyr */
        vaegt: {
            sprite: "vaegt", fil: "vaegt.svg", b: 140, h: 62,
            anker: { x: 0, y: 0 },
            kan: { vaegt: true, fast: true },
            plade: { x0: 30, x1: 110, y: 0 }, display: { x: 22, y: 30, b: 70, h: 20 },
            titel: "vægten"
        },
        vejebaad: {
            sprite: "vejebaad", fil: "vejebaad.svg", b: 64, h: 14,
            anker: { x: 32, y: 2 },
            kan: { holder: true, haelder: true },
            /* Vejebaaden er en rektangulaer skaal, ikke et omdrejningslegeme */
            rund: false,
            indre: pts([[4, 3], [60, 3], [58, 12], [6, 12]]), mlPrAreal: 100, maks: 4, haeldMl: 0,
            tud: { x: 4, y: 3, v: -1.4 },
            vejlaengde: 0.3, titel: "vejebåden", masse: 1.5
        },
        braender: {
            sprite: "braender", fil: "braender.svg", b: 50, h: 75,
            anker: { x: 0, y: 0 },
            kan: { varmer: true, flamme: true, fast: true },
            plade: { x0: -8, x1: 58, y: -25 }, temperatur: 600, flammePunkt: { x: 25, y: 7 },
            titel: "brænderen"
        },
        podetraad: {
            sprite: null, b: 8, h: 90,
            anker: { x: 0, y: 0 },
            kan: { dypper: true },
            laengde: 90, titel: "podetråden"
        },
        phmeter: {
            sprite: null, b: 16, h: 100,
            anker: { x: 0, y: 0 },
            kan: { maaler: true, ph: true },
            laengde: 100, titel: "pH-meteret"
        },
        /* Lugen: et gennemraekningsskab mellem to rum. Det, der stilles paa
           hylden, sendes til det andet rum med et klik (NK.Rum) */
        luge: {
            sprite: "luge", fil: "luge.svg", b: 170, h: 160,
            anker: { x: 0, y: 0 },
            kan: { luge: true, fast: true },
            plade: { x0: 24, x1: 146, y: 128 }, skilt: { x: 40, y: 10, b: 90, h: 12 }, knap: { x: 159, y: 70 },
            titel: "lugen"
        }
    };

    /* Glassets egen masse i gram, til vaegten */
    var MASSE = { reagensglas: 15, baegerLille: 50, baegerStor: 100, bad: 100, kolbe: 120, maaleglas: 80, flaske: 150, draabeflaske: 20, sproejteflaske: 30, pulverglas: 40, vejebaad: 1.5 };
    Object.keys(MASSE).forEach(function (n) { TYPER[n].masse = MASSE[n]; });

    /* Sprites registreres, saa NK.Sprites.start() henter dem */
    Object.keys(TYPER).forEach(function (navn) {
        var t = TYPER[navn];
        t.navn = navn;
        t.kan = t.kan || {};
        if (t.sprite && t.fil) NK.Sprites.tilfoej(t.sprite, { fil: t.fil, b: t.b, h: t.h });
    });
    NK.Sprites.tilfoej("haand", { fil: "haand.svg", b: 96, h: 84 });
    NK.Sprites.tilfoej("lup", { fil: "lup.svg", b: 40, h: 40 });
    /* Kost og fejeblad til laereren, naar et glas er knust; trefoden til braenderen */
    NK.Sprites.tilfoej("kost", { fil: "kost.svg", b: 130, h: 56 });
    NK.Sprites.tilfoej("fejeblad", { fil: "fejeblad.svg", b: 120, h: 54 });
    NK.Sprites.tilfoej("trefod", { fil: "trefod.svg", b: 70, h: 100 });

    /* Det, der er af glas, knuses, hvis det tabes paa gulvet eller
       rystes ekstremt voldsomt */
    ["reagensglas", "baegerLille", "baegerStor", "kolbe", "maaleglas", "flaske", "glasstav", "termometer", "phmeter"].forEach(function (n) { TYPER[n].glas = true; });

    /* ----- Udstyr i mindre maalestok ---------------------------------------
       En genstand i opstillingen kan faa en skala, og saa bruger den en
       skaleret udgave af sin type. Det er et rent tegnemaal: rumfanget
       (maks), lysvejen, massen og temperaturen er de samme, saa kemien er
       uaendret. Et bægerglas i halv stoerrelse er stadig et 100 mL
       bægerglas, og vaesken staar lige saa hoejt i det. Derfor ganges
       mlPrAreal med skala², saa den mindre inderside svarer til de samme mL.

       Nye maal i en type skal skrives ind i listerne herunder, ellers
       bliver de ikke skaleret med. */
    var SKALA_TAL = ["b", "h", "hulY", "bundY", "laengde", "traefBund"];
    var SKALA_PUNKTER = ["anker", "tud", "ske", "flammePunkt", "valgtMaerke", "knap", "lampe"];
    var SKALA_REKTER = ["etiket", "display", "skilt"];

    function skaleret(t, k) {
        if (!(k > 0) || k === 1) return t;
        var ud = {}, n;
        for (n in t) if (Object.prototype.hasOwnProperty.call(t, n)) ud[n] = t[n];
        SKALA_TAL.forEach(function (f) { if (typeof t[f] === "number") ud[f] = t[f] * k; });
        SKALA_PUNKTER.forEach(function (f) { if (t[f]) ud[f] = { x: t[f].x * k, y: t[f].y * k, v: t[f].v }; });
        SKALA_REKTER.forEach(function (f) { if (t[f]) ud[f] = { x: t[f].x * k, y: t[f].y * k, b: t[f].b * k, h: t[f].h * k }; });
        if (t.pulverfelt) ud.pulverfelt = { x0: t.pulverfelt.x0 * k, x1: t.pulverfelt.x1 * k, y: t.pulverfelt.y * k, top: t.pulverfelt.top * k };
        if (t.plade) ud.plade = { x0: t.plade.x0 * k, x1: t.plade.x1 * k, y: t.plade.y * k };
        if (t.huller) ud.huller = t.huller.map(function (x) { return x * k; });
        if (t.indre) ud.indre = t.indre.map(function (q) { return { x: q.x * k, y: q.y * k }; });
        if (typeof t.mlPrAreal === "number") ud.mlPrAreal = t.mlPrAreal * k * k;
        if (t.omrids) ud.omrids = function (ctx) { ctx.save(); ctx.scale(k, k); t.omrids(ctx); ctx.restore(); };
        ud.skala = k;
        ud.grund = t;
        return ud;
    }

    /* ----- Glassets geometri ------------------------------------------------
       Alt glasudstyr er omdrejningslegemer: en silhuet, drejet om sin egen
       lodrette akse. Derfor er baade rumfanget og lysvejen givet af den
       tegnede inderside og ét tal - hvor mange tegneenheder der gaar paa en
       centimeter. De behoever ikke staa som frie tal, der kan komme til at
       modsige hinanden og tegningen.

         rumfang   V = integral pi (w/2)^2 dy / SKALA^3
         lysvej    w / SKALA, altsaa indersidens bredde i cm

       SKALA er sat, saa reagensglassets inderside bliver 1,6 cm bred, som
       et rigtigt 16 mm reagensglas. Det er det udstyr, der er tegnet mest
       trofast, og alt andet maales mod det.

       Et udstyr, der ikke er et omdrejningslegeme (vejebaaden er en
       rektangulaer skaal), saettes med rund: false og maales ikke. */
    var SKALA = 10.7;

    /* Indersidens venstre og hoejre side ved hoejden y, eller null */
    function kanter(poly, y) {
        var xs = [], i, a, b;
        for (i = 0; i < poly.length; i++) {
            a = poly[i];
            b = poly[(i + 1) % poly.length];
            if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
                xs.push(a.x + (y - a.y) / (b.y - a.y) * (b.x - a.x));
            }
        }
        if (xs.length < 2) return null;
        return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs) };
    }

    /* Indersidens bredde ved hoejden y */
    function bredde(poly, y) {
        var k = kanter(poly, y);
        return k ? k.x1 - k.x0 : 0;
    }

    var husketMaal = {};

    /* { V, A, wMid, wMax, h } i tegneenheder, plus V_mL og vejlaengde_cm */
    function maal(t) {
        if (!t.indre) return null;
        if (husketMaal[t.navn]) return husketMaal[t.navn];
        var ys = t.indre.map(function (p) { return p.y; });
        var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        var n = 400, dy = (y1 - y0) / n, V = 0, A = 0, wSum = 0, wN = 0, wMax = 0, i, y, w;
        for (i = 0; i < n; i++) {
            y = y0 + dy * (i + 0.5);
            w = bredde(t.indre, y);
            V += Math.PI * w * w / 4 * dy;
            A += w * dy;
            if (w > 0.5) { wSum += w; wN++; if (w > wMax) wMax = w; }
        }
        var m = {
            V: V, A: A, h: y1 - y0,
            wMid: wN ? wSum / wN : 0, wMax: wMax,
            V_mL: V / (SKALA * SKALA * SKALA),
            vej_cm: (wN ? wSum / wN : 0) / SKALA
        };
        husketMaal[t.navn] = m;
        return m;
    }

    /* Lysvejen, som geometrien giver den, i reagensglas-enheder.
       Bruges ikke af tegningen endnu: den staar som tal i typerne, saa en
       aendring af farvedybden er en beslutning og ikke en bivirkning. */
    /* Dæmpningen af lysvejen. Den rene geometri giver et 600 mL bægerglas
       en vej paa 5,6 reagensglas, og saa staar en almindelig skoleopløsning
       naesten sort i det. Det er fysisk rigtigt - saadan ser den ogsaa ud i
       virkeligheden - men en animation skal kunne aflaeses. Vejen trykkes
       derfor sammen mod reagensglassets:

           vej = 1 + (geometri - 1) * DAEMPNING

       0,45 er valgt, fordi den rammer de haandsatte tal, bordene blev
       bygget med (baegerglas 2,0 og 3,0), naesten praecist. Det er den
       eneste knap paa farvedybden: skru paa den ene og faa hele
       laboratoriet med, i stedet for syv frie tal, der kan komme til at
       modsige hinanden. */
    var LYSVEJ_DAEMPNING = 0.45;

    /* Reagensglassets inderside i cm. Den er baade det, SKALA er sat
       efter, og den enhed, lysvejen maales i: vejlaengde 1 betyder vejen
       gennem et reagensglas. */
    var REF_CM = 1.6;

    function lysvej(t) {
        var m = maal(t);
        if (!m || t.rund === false) return t.vejlaengde || 1;
        return 1 + (m.vej_cm / REF_CM - 1) * LYSVEJ_DAEMPNING;
    }

    /* ----- Lysvejen ovenfra -------------------------------------------------
       Ses der NED i et glas, gaar lyset gennem vaeskens dybde og ikke
       gennem glassets bredde. Det er ikke en detalje. Fortyndes et glas
       til det dobbelte rumfang, halveres koncentrationen, men dybden
       fordobles, og de to ophaever hinanden: et farvestof, der bare bliver
       fortyndet, staar praecis lige saa kraftigt ovenfra. Bliver
       blandingen alligevel lysere, er der blevet faerre farvede
       molekyler - og saa har ligevaegten flyttet sig. Det er hele pointen
       i en fortyndingsproeve, og den kan kun ses ovenfra.

       Dybden maales paa tegningen paa samme maade som inddelingen:
       overfladen ved V mL er NK.vaeskeNiveau af indersiden, og bunden er
       indersidens laveste punkt. Saa kan vejen ovenfra ikke komme til at
       modsige hverken stregerne eller den vaeske, tegning.js tegner, og
       den passer af sig selv til enhver form - ogsaa kolben, der er
       bredest forneden.

       Her daempes der IKKE. Daempningen fra siden trykker vejen mod 1, og
       den ville braekke det hele: en ren fortynding ville aendre farven
       ovenfra, og saa var proeven ingenting vaerd. Vejen ovenfra er et
       forhold mellem to laengder, og det forhold skal staa. */
    function vejOvenfra(t, V) {
        /* Maalene er de samme i mindre maalestok (se skaleret) */
        var g = t.grund || t;
        if (!g.indre || !g.mlPrAreal || !(V > 0)) return 0;
        var bund = -Infinity;
        for (var i = 0; i < g.indre.length; i++) bund = Math.max(bund, g.indre[i].y);
        var top = NK.vaeskeNiveau(g.indre, V * g.mlPrAreal);
        return Math.max(0, bund - top) / SKALA / REF_CM;
    }

    /* ----- Inddelingen -----------------------------------------------------
       En streg for V mL staar i den hoejde, vaesken naar op til, naar der
       er V mL i glasset. Den regnes paa samme maade, som tegning.js tegner
       vaesken: arealet af indersiden under stregen er V * mlPrAreal
       (NK.vaeskeNiveau). Saa passer stregerne altid til det, motoren
       regner, ogsaa hvis maks eller tegningen aendres, og aflaeser eleven
       100 mL, er der 100 mL. Giver [{ mL, y, x0, x1, tal }] i spritets
       koordinater (typens skala er regnet med); tal: stregen har et tal. */
    var husketStreger = {};

    function streger(t) {
        var s = t.streger;
        if (!s || !t.indre || !t.mlPrAreal || !t.maks) return [];
        var noegle = t.navn + "|" + (t.skala || 1);
        if (husketStreger[noegle]) return husketStreger[noegle];
        var k = t.skala || 1, ud = [];
        var til = s.til || Math.floor(t.maks * 0.85 / s.hver) * s.hver;
        var trin = s.smaa || s.hver;
        for (var n = 1; n * trin <= til + 1e-9; n++) {
            var V = n * trin;
            var y = NK.vaeskeNiveau(t.indre, V * t.mlPrAreal);
            var kant = kanter(t.indre, y) || { x0: 0, x1: t.b };
            var tal = Math.abs(V / s.hver - Math.round(V / s.hver)) < 1e-6;
            var L = (tal ? s.lang : (s.kort || s.lang)) * k;
            var x0 = s.x !== undefined ? s.x * k : kant.x1 - s.luft * k - L;
            ud.push({ mL: V, y: y, x0: x0, x1: x0 + L, tal: tal });
        }
        husketStreger[noegle] = ud;
        return ud;
    }

    /* ----- Maalene udledes af tegningen -------------------------------------
       mlPrAreal og vejlaengde stod foer som frie tal i hver type. De
       beskriver begge den samme tegnede form, saa de kan udledes af den, og
       saa kan de ikke komme til at modsige hverken tegningen eller
       hinanden. mlPrAreal saettes, saa vaesken staar praecis til kanten ved
       maks, og vejlaengden af indersidens bredde.

       En beholder med vindue: true er undtaget for rumfangets vedkommende:
       flasker og pulverglas har en etiket over det meste af sig, saa den
       tegnede inderside er et kig ind i beholderen og ikke hele dens rum.
       Deres maks staar derfor stadig som et tal. */
    Object.keys(TYPER).forEach(function (navn) {
        var t = TYPER[navn];
        if (!t.indre || !t.maks) return;
        var m = maal(t);
        if (!t.vindue && t.rund !== false) t.mlPrAreal = m.A / t.maks;
        if (t.rund !== false) t.vejlaengde = lysvej(t);
    });

    NK.Udstyr = {
        TYPER: TYPER,
        HAAND_ANKER: { x: 40, y: 46 },
        SKALA: SKALA,
        REF_CM: REF_CM,
        maal: maal,
        streger: streger,
        kanter: kanter,
        lysvej: lysvej,
        vejOvenfra: vejOvenfra,
        skaleret: skaleret,

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

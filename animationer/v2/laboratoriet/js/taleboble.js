/* =====================================================================
   taleboble.js - taleboblen som eget lag

   Boblen er ikke en del af figuren. Den er en kanal: den ved, hvor munden
   er, hvor scenen slutter, og hvad replikken handler om - og finder selv
   ud af, hvor den skal staa. Figuren siger kun, *hvad* der siges.

   Stilen staar ét sted (STIL), saa to personers bobler adskiller sig ved
   en farve og aldrig ved et nyt layout.

     NK.Taleboble.tegn(ctx, tekst, alfa, anker, valg)
       anker          { x, y }  munden i verdenskoordinater
       valg.hoved     { op, side, ned }  hvor langt der er fra munden til
                      hovedets kant opad, til siden og nedad. Boblen holder
                      sig uden for hovedet, og halen ender ved dets kant i
                      stedet for at gaa hen over ansigtet
       valg.afstand   i stedet for hoved: hvor langt fra ankeret boblen
                      mindst skal staa (standard 100); halen ender saa i
                      selve ankeret
       valg.side      foretrukken side: "over" (standard), "hoejre",
                      "venstre" eller "under". Er der ikke plads, vendes den
       valg.undgaa    et rektangel { x, y, b, h } eller en liste af dem, som
                      boblen ikke maa daekke: det, replikken handler om
       valg.graenser  { x, y, b, h }; standard er scenen (NK.Scene)
       valg.stil      overskriver enkelte felter i STIL, fx { bund: "…" }

   Skriften holder en mindste stoerrelse paa skaermen (STIL.minSkaerm):
   er et bredt bord zoomet langt ud, vokser hele boblen med samme faktor,
   saa den ser ens ud og stadig kan laeses. Det er svaret paa, om boblen
   skulle flyttes til DOM for laesbarhedens skyld: det skulle den ikke.

     NK.Taleboble.maal(ctx, tekst, f)         linjer og maal (f = forstoerrelse)
     NK.Taleboble.placer(m, anker, R, valg)   ren geometri uden at tegne; giver
                                          { side, x, y, b, h, hale }
     NK.Taleboble.sidst                       den seneste placering, til
                                          selvtest og _taleboble.html
     NK.Taleboble.rammer(pt)                  ligger pt i den seneste boble?
                                          (S14: et klik paa boblen springer
                                          videre; figuren spoerger, om
                                          boblen staar lige nu)

   Der er ingen koe og ingen prioritet her endnu. Med én taler ligger det
   i figurens egne scener (kemichael.js, laerer.js); laget faar det, naar
   der er en taler mere. Lav aldrig en ramme for noget, der kun er set
   én gang.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var STIL = {
        skrift: 17,                        /* px i tegneenheder foer forstoerrelse */
        vaegt: 700,
        familie: "'Segoe UI', sans-serif",
        linje: 21,                         /* linjeafstand */
        maksBredde: 360,                   /* tekstbredde, foer der brydes */
        polsterX: 14,
        polsterY: 8.5,
        radius: 12,
        hale: 8,                           /* halens halve bredde ved boblen */
        streg: 2,
        kant: 8,                           /* mindste afstand til scenens kant */
        luft: 6,                           /* afstand til det, der skal undgaas */
        bund: "#fffdf6",
        ramme: "#2a2f36",
        tekst: "#1f2328",
        minSkaerm: 14,                     /* skriften mindst saa mange px paa skaermen */
        maksForstoer: 1.6
    };

    var SIDER = ["over", "hoejre", "venstre", "under"];

    function blandet(a, b) {
        var ud = {};
        Object.keys(a).forEach(function (k) { ud[k] = a[k]; });
        if (b) Object.keys(b).forEach(function (k) { ud[k] = b[k]; });
        return ud;
    }

    function font(s, f) {
        return s.vaegt + " " + (s.skrift * f) + "px " + s.familie;
    }

    /* ----- Forstoerrelse -------------------------------------------------
       Hvor mange skaerm-px én tegneenhed fylder, laeses af lærredets
       transformation; devicePixelRatio er lagt ind i den af NK.Laerred og
       trækkes ud igen. Kan den ikke laeses, er faktoren 1. */
    function forstoerrelse(ctx, s) {
        var px = 1;
        try {
            if (ctx.getTransform) {
                var m = ctx.getTransform();
                px = Math.sqrt(m.a * m.a + m.b * m.b) / (window.devicePixelRatio || 1);
            }
        } catch (e) { px = 1; }
        if (!(px > 0)) return 1;
        return NK.klamp(s.minSkaerm / (s.skrift * px), 1, s.maksForstoer);
    }

    /* ----- Maaling -------------------------------------------------------- */
    function bryd(ctx, tekst, maks) {
        if (ctx.measureText(tekst).width <= maks) return [tekst];
        var ord = tekst.split(" "), linjer = [], nu = "";
        for (var i = 0; i < ord.length; i++) {
            var proev = nu ? nu + " " + ord[i] : ord[i];
            if (nu && ctx.measureText(proev).width > maks) { linjer.push(nu); nu = ord[i]; }
            else nu = proev;
        }
        if (nu) linjer.push(nu);
        return linjer;
    }

    function maal(ctx, tekst, f, stil) {
        var s = stil || STIL;
        f = f || 1;
        ctx.save();
        ctx.font = font(s, f);
        var linjer = bryd(ctx, tekst || "", s.maksBredde * f);
        var bred = 0;
        linjer.forEach(function (l) { bred = Math.max(bred, ctx.measureText(l).width); });
        ctx.restore();
        return {
            linjer: linjer,
            b: bred + 2 * s.polsterX * f,
            h: 2 * s.polsterY * f + linjer.length * s.linje * f
        };
    }

    /* ----- Placering ------------------------------------------------------ */
    function snit(a, b) {
        var x0 = Math.max(a.x, b.x), y0 = Math.max(a.y, b.y);
        var x1 = Math.min(a.x + a.b, b.x + b.b), y1 = Math.min(a.y + a.h, b.y + b.h);
        return x1 > x0 && y1 > y0 ? (x1 - x0) * (y1 - y0) : 0;
    }

    function klem(r, R) {
        return {
            x: NK.klamp(r.x, R.x, Math.max(R.x, R.x + R.b - r.b)),
            y: NK.klamp(r.y, R.y, Math.max(R.y, R.y + R.h - r.h)),
            b: r.b, h: r.h
        };
    }

    /* m: maal fra maal(); anker: munden; R: graenserne; valg: side,
       afstand, undgaa, f, stil. Proever siderne i foretrukken raekkefoelge
       og tager den foerste, der hverken gaar uden for graenserne eller
       daekker noget - ellers den, der goer det mindst. */
    function placer(m, anker, R, valg) {
        valg = valg || {};
        var s = valg.stil || STIL;
        var f = valg.f || 1;
        var luft = s.luft * f, kant = s.kant * f, radius = s.radius * f, hale = s.hale * f;
        var hoved = valg.hoved || null;
        var afstand = hoved ? hoved.op + 2 * luft : (valg.afstand === undefined ? 100 : valg.afstand);
        var afstandNed = hoved ? (hoved.ned === undefined ? hoved.op : hoved.ned) + 2 * luft : afstand;
        var afstandSide = hoved ? hoved.side + 2 * luft
            : (valg.afstandSide === undefined ? Math.max(40, afstand * 0.6) : valg.afstandSide);
        var undgaa = !valg.undgaa ? [] : (Array.isArray(valg.undgaa) ? valg.undgaa : [valg.undgaa]);
        var R2 = { x: R.x + kant, y: R.y + kant, b: Math.max(1, R.b - 2 * kant), h: Math.max(1, R.h - 2 * kant) };
        var sider = valg.side ? [valg.side].concat(SIDER.filter(function (x) { return x !== valg.side; })) : SIDER;

        function grund(side) {
            if (side === "over") return { x: anker.x - m.b / 2, y: anker.y - afstand - m.h, b: m.b, h: m.h };
            if (side === "under") return { x: anker.x - m.b / 2, y: anker.y + afstandNed, b: m.b, h: m.h };
            if (side === "hoejre") return { x: anker.x + afstandSide, y: anker.y - m.h / 2, b: m.b, h: m.h };
            return { x: anker.x - afstandSide - m.b, y: anker.y - m.h / 2, b: m.b, h: m.h };
        }

        /* To slags pris. Den haarde: areal uden for scenen, areal oven paa
           det, der skal undgaas, og hvor langt boblen er skubbet ind i det
           frirum om ankeret, som afstanden kraever (hovedet). Den bloede:
           hvor skaevt halen kommer til at sidde, og hvor langt nede paa
           listen af sider vi er. Den haarde afgoer; den bloede skiller
           dem ad, der er lige gode. Tal under EPS er afrundingsstoej. */
        var EPS = 0.5;
        function haard(r, side) {
            var udenfor = Math.max(0, r.b * r.h - snit(r, R2));
            var daekker = 0;
            undgaa.forEach(function (u) { daekker += snit(r, u); });
            var ind = 0;
            if (side === "over") ind = Math.max(0, (r.y + r.h) - (anker.y - afstand)) * r.b;
            else if (side === "under") ind = Math.max(0, (anker.y + afstandNed) - r.y) * r.b;
            else if (side === "hoejre") ind = Math.max(0, (anker.x + afstandSide) - r.x) * r.h;
            else ind = Math.max(0, (r.x + r.b) - (anker.x - afstandSide)) * r.h;
            return udenfor * 4 + daekker * 2 + ind * 2;
        }
        function bloed(r, side, nr) {
            var skaev;
            if (side === "over" || side === "under") skaev = Math.abs(NK.klamp(anker.x, r.x + radius + hale, r.x + r.b - radius - hale) - anker.x);
            else skaev = Math.abs(NK.klamp(anker.y, r.y + radius + hale, r.y + r.h - radius - hale) - anker.y);
            return skaev + nr * 60;
        }

        var bedst = null;
        for (var i = 0; i < sider.length; i++) {
            var side = sider[i];
            var g = grund(side);
            var kandidater = [klem(g, R2)];
            /* Glid fri af det, der skal undgaas, langs den frie akse */
            undgaa.forEach(function (u) {
                if (side === "over" || side === "under") {
                    kandidater.push(klem({ x: u.x - m.b - luft, y: g.y, b: m.b, h: m.h }, R2));
                    kandidater.push(klem({ x: u.x + u.b + luft, y: g.y, b: m.b, h: m.h }, R2));
                } else {
                    kandidater.push(klem({ x: g.x, y: u.y - m.h - luft, b: m.b, h: m.h }, R2));
                    kandidater.push(klem({ x: g.x, y: u.y + u.h + luft, b: m.b, h: m.h }, R2));
                }
            });
            for (var k = 0; k < kandidater.length; k++) {
                var h1 = haard(kandidater[k], side), b1 = bloed(kandidater[k], side, i);
                if (!bedst || h1 < bedst.haard - EPS || (Math.abs(h1 - bedst.haard) <= EPS && b1 < bedst.bloed)) {
                    bedst = { side: side, r: kandidater[k], haard: h1 < EPS ? 0 : h1, bloed: b1 };
                }
            }
        }

        /* Halen: foden paa boblens kant, spidsen ved hovedets kant (eller i
           selve ankeret, naar der ikke er oplyst et hoved) */
        var r = bedst.r, h, spids = { x: anker.x, y: anker.y };
        if (bedst.side === "over") {
            h = { x: NK.klamp(anker.x, r.x + radius + hale, r.x + r.b - radius - hale), y: r.y + r.h };
            if (hoved) spids.y = anker.y - hoved.op + 2;
        } else if (bedst.side === "under") {
            h = { x: NK.klamp(anker.x, r.x + radius + hale, r.x + r.b - radius - hale), y: r.y };
            if (hoved) spids.y = anker.y + (hoved.ned === undefined ? hoved.op : hoved.ned) - 2;
        } else if (bedst.side === "hoejre") {
            h = { x: r.x, y: NK.klamp(anker.y, r.y + radius + hale, r.y + r.h - radius - hale) };
            if (hoved) spids.x = anker.x + hoved.side - 2;
        } else {
            h = { x: r.x + r.b, y: NK.klamp(anker.y, r.y + radius + hale, r.y + r.h - radius - hale) };
            if (hoved) spids.x = anker.x - hoved.side + 2;
        }

        return { side: bedst.side, x: r.x, y: r.y, b: r.b, h: r.h, hale: h, spids: spids, anker: { x: anker.x, y: anker.y }, pris: bedst.haard, skaev: bedst.bloed };
    }

    /* ----- Tegning ---------------------------------------------------------- */
    function tegnPlacering(ctx, p, m, alfa, f, s) {
        var hale = s.hale * f;
        ctx.save();
        ctx.globalAlpha = NK.klamp(alfa, 0, 1);
        ctx.fillStyle = s.bund;
        ctx.strokeStyle = s.ramme;
        ctx.lineWidth = s.streg * f;
        ctx.lineJoin = "round";
        NK.rundtRekt(ctx, p.x, p.y, p.b, p.h, s.radius * f);
        ctx.fill();
        ctx.stroke();

        /* Halen: to punkter paa boblens kant og spidsen i ankeret. Fyldet
           tegnes en anelse ind over rammen, saa de smelter sammen, og kun
           de to skraa sider streges op. */
        var a = p.spids || p.anker, hx = p.hale.x, hy = p.hale.y, ind = 1, p1, p2, q1, q2;
        if (p.side === "over") { p1 = [hx - hale, hy - ind]; p2 = [hx + hale, hy - ind]; q1 = [hx - hale, hy]; q2 = [hx + hale, hy]; }
        else if (p.side === "under") { p1 = [hx - hale, hy + ind]; p2 = [hx + hale, hy + ind]; q1 = [hx - hale, hy]; q2 = [hx + hale, hy]; }
        else if (p.side === "hoejre") { p1 = [hx + ind, hy - hale]; p2 = [hx + ind, hy + hale]; q1 = [hx, hy - hale]; q2 = [hx, hy + hale]; }
        else { p1 = [hx - ind, hy - hale]; p2 = [hx - ind, hy + hale]; q1 = [hx, hy - hale]; q2 = [hx, hy + hale]; }
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(a.x, a.y);
        ctx.lineTo(p2[0], p2[1]);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(q1[0], q1[1]);
        ctx.lineTo(a.x, a.y);
        ctx.lineTo(q2[0], q2[1]);
        ctx.stroke();

        var fnt = font(s, f);
        m.linjer.forEach(function (l, i) {
            NK.tekst(ctx, l, p.x + p.b / 2, p.y + s.polsterY * f + s.linje * f * (i + 0.5) + 1, {
                font: fnt, justering: "center", linje: "middle", farve: s.tekst
            });
        });
        ctx.restore();
    }

    function tegn(ctx, tekst, alfa, anker, valg) {
        if (!tekst || !(alfa > 0.01) || !anker) return null;
        valg = valg || {};
        var s = valg.stil ? blandet(STIL, valg.stil) : STIL;
        var f = valg.f || forstoerrelse(ctx, s);
        var m = maal(ctx, tekst, f, s);
        var S = NK.Scene || {};
        var R = valg.graenser || { x: 0, y: 0, b: S.BREDDE || 1120, h: S.HOEJDE || 600 };
        var p = placer(m, anker, R, { side: valg.side, hoved: valg.hoved, afstand: valg.afstand, afstandSide: valg.afstandSide, undgaa: valg.undgaa, f: f, stil: s });
        tegnPlacering(ctx, p, m, alfa, f, s);
        NK.Taleboble.sidst = { side: p.side, x: p.x, y: p.y, b: p.b, h: p.h, hale: p.hale, f: f, linjer: m.linjer.length, pris: p.pris };
        return p;
    }

    function rammer(pt) {
        var r = NK.Taleboble.sidst;
        return !!(r && pt && pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h);
    }

    NK.Taleboble = {
        STIL: STIL,
        SIDER: SIDER,
        maal: maal,
        placer: placer,
        forstoerrelse: forstoerrelse,
        tegn: tegn,
        rammer: rammer,
        sidst: null
    };
}());

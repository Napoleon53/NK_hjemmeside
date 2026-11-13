/* =====================================================================
   kugler.js - kuglemodellerne i luppen

   Samme kugler som i Kemibogens figurer og sc4.3 (T.atom i
   js/tegning.js): carbon moerkegraa, oxygen roed og hydrogen hvid og
   0,62 gange saa stor. Kaeden ligger vandret med H over og under hvert
   carbonatom, som i bogens figur kogepunkt-kontakt (4.1), og gruppen
   sidder til hoejre.

   NK.Kugler.model(stof) giver atomerne i enheder af r (radius for C og
   O). Hvert atom har s ("C", "O", "H") og x, y, og H og O i en polaer
   gruppe er maerket: giv (H, der kan give en hydrogenbinding) og tag
   (O, der kan tage imod). kaede er x-spaendet for carbonkaeden, som
   bruges til kontaktfladen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var CC = 1.55;    /* afstand mellem to carbonatomer */
    var CH = 1.2;     /* H over og under et carbonatom */
    var HB = 2.65;    /* H til O i en hydrogenbinding (centrum til centrum) */
    var HB_MAKS = 2.9;

    function model(stof) {
        var A = [], n = stof.n, g = stof.g, i;
        function at(s, x, y, ekstra) {
            var a = { s: s, x: x, y: y };
            if (ekstra) for (var k in ekstra) if (Object.prototype.hasOwnProperty.call(ekstra, k)) a[k] = ekstra[k];
            A.push(a);
            return a;
        }
        if (g === "glycerol") {
            for (i = 0; i < 3; i++) at("C", i * CC, 0);
            at("H", 0, -CH); at("H", 0, CH); at("H", CC, CH); at("H", 2 * CC, -CH); at("H", 2 * CC, CH);
            /* OH paa alle tre carbonatomer */
            at("O", -1.6, 0, { tag: true }); at("H", -1.6 - 0.9, -0.72, { giv: true });
            at("O", CC, -1.6, { tag: true }); at("H", CC + 0.72, -1.6 - 0.9, { giv: true });
            at("O", 2 * CC + 1.6, 0, { tag: true }); at("H", 2 * CC + 1.6 + 0.9, 0.72, { giv: true });
            return { atomer: A, kaede: [0, 2 * CC] };
        }
        if (n === 0) {
            if (g === "H") { at("H", -0.5, 0); at("H", 0.5, 0); return { atomer: A, kaede: null }; }
            if (g === "OH") {
                at("O", 0, 0, { tag: true });
                at("H", -0.98, 0.7, { giv: true }); at("H", 0.98, 0.7, { giv: true });
                return { atomer: A, kaede: null };
            }
            /* HCOOH: H paa carbonatomet i stedet for en kaede */
            at("H", -1.25, 0);
            carboxyl(at, 0);
            return { atomer: A, kaede: null };
        }
        for (i = 0; i < n; i++) {
            at("C", i * CC, 0);
            at("H", i * CC, -CH);
            at("H", i * CC, CH);
        }
        at("H", -1.25, 0);
        var x = (n - 1) * CC;
        if (g === "H") at("H", x + 1.25, 0);
        else if (g === "OH") {
            at("O", x + 1.6, 0, { tag: true });
            at("H", x + 1.6 + 0.9, 0.72, { giv: true });
        } else carboxyl(at, x + CC);
        return { atomer: A, kaede: [0, (n - 1) * CC] };
    }

    /* COOH med carbonatomet i (x, 0): =O oppe til hoejre, OH nede til hoejre */
    function carboxyl(at, x) {
        at("C", x, 0, { gruppe: true });
        at("O", x + 0.78, -1.3, { tag: true, dobbelt: true });
        at("O", x + 0.78, 1.3, { tag: true });
        at("H", x + 0.78 + 1.05, 1.36, { giv: true });
    }

    /* Molekylet drejet 180 grader og flyttet (tx, ty) */
    function vend(m, tx, ty) {
        return {
            atomer: m.atomer.map(function (a) {
                var b = {}; for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) b[k] = a[k];
                b.x = tx - a.x; b.y = ty - a.y;
                return b;
            }),
            kaede: m.kaede ? [tx - m.kaede[1], tx - m.kaede[0]] : null
        };
    }

    /* Molekylet spejlet i en lodret linje og flyttet: x bliver tx − x */
    function spejl(m, tx, ty) {
        return {
            atomer: m.atomer.map(function (a) {
                var b = {}; for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) b[k] = a[k];
                b.x = tx - a.x; b.y = a.y + ty;
                return b;
            }),
            kaede: m.kaede ? [tx - m.kaede[1], tx - m.kaede[0]] : null,
            dy: ty
        };
    }

    function flyt(m, tx, ty) {
        return {
            atomer: m.atomer.map(function (a) {
                var b = {}; for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) b[k] = a[k];
                b.x = a.x + tx; b.y = a.y + ty;
                return b;
            }),
            kaede: m.kaede ? [m.kaede[0] + tx, m.kaede[1] + tx] : null
        };
    }

    function find(m, test) {
        for (var i = 0; i < m.atomer.length; i++) if (test(m.atomer[i])) return m.atomer[i];
        return null;
    }

    /* To molekyler hoved mod hoved: A med gruppen til hoejre og B vendt, saa
       gruppen peger mod A. En alkohol giver én hydrogenbinding (H i A til O i
       B), en carboxylsyre to (H i hver til =O i den anden). En alkan ligger
       blot ende mod ende. */
    function par(stof) {
        var m = model(stof), A = m, B, T;
        var H = find(m, function (a) { return a.giv; });
        if (stof.g === "COOH" && stof.n >= 0) {
            var Od = find(m, function (a) { return a.dobbelt; });
            T = { x: H.x + HB + Od.x, y: H.y + Od.y };
        } else if (stof.g === "OH" || stof.g === "glycerol") {
            /* B er spejlet (ikke drejet), saa kun H i A peger mod O i B, og
               H i B peger vaek: én hydrogenbinding pr. par */
            var O = find(m, function (a) { return a.tag && a.x > 0; }) || find(m, function (a) { return a.tag; });
            var Hg = find(m, function (a) { return a.giv && a.x > O.x; }) || H;
            var mx = Hg.x + HB + O.x, my = Hg.y - O.y;
            return [A, spejl(m, mx, my)];
        } else {
            var Hend = m.atomer.reduce(function (b, a) { return a.x > b.x ? a : b; }, m.atomer[0]);
            T = { x: 2 * Hend.x + 1.5, y: 0 };
        }
        B = vend(m, T.x, T.y);
        return [A, B];
    }

    /* Hydrogenbindingerne mellem molekylerne: et H, der kan give, og et O,
       der kan tage imod, i to forskellige molekyler og hoejst 2,9 r fra
       hinanden (centrum til centrum) */
    function hBindinger(molekyler) {
        var ud = [];
        molekyler.forEach(function (m, i) {
            m.atomer.forEach(function (h) {
                if (!h.giv) return;
                molekyler.forEach(function (m2, j) {
                    if (i === j) return;
                    m2.atomer.forEach(function (o) {
                        if (!o.tag) return;
                        var d = Math.sqrt((o.x - h.x) * (o.x - h.x) + (o.y - h.y) * (o.y - h.y));
                        if (d < HB_MAKS) ud.push({ h: h, o: o });
                    });
                });
            });
        });
        return ud;
    }

    function kasse(molekyler) {
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        molekyler.forEach(function (m) {
            m.atomer.forEach(function (a) {
                var r = a.s === "H" ? 0.62 : 1;
                x0 = Math.min(x0, a.x - r); x1 = Math.max(x1, a.x + r);
                y0 = Math.min(y0, a.y - r); y1 = Math.max(y1, a.y + r);
            });
        });
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
    }

    /* ----- Tegning ------------------------------------------------------------------- */
    /* Molekylerne med (ox, oy) som nulpunkt og r px pr. enhed. H paa carbon
       bagest, H i en polaer gruppe forrest, saa det kan ses, hvilket H der
       giver hydrogenbindingen. */
    function tegnMolekyler(ctx, molekyler, ox, oy, r, alfa) {
        var T = NK.Tegn;
        molekyler.forEach(function (m) {
            m.atomer.forEach(function (a) { if (a.s === "H" && !a.giv) T.atom(ctx, "H", ox + a.x * r, oy + a.y * r, r, alfa); });
        });
        molekyler.forEach(function (m) {
            m.atomer.forEach(function (a) { if (a.s !== "H") T.atom(ctx, a.s, ox + a.x * r, oy + a.y * r, r, alfa); });
        });
        molekyler.forEach(function (m) {
            m.atomer.forEach(function (a) { if (a.s === "H" && a.giv) T.atom(ctx, "H", ox + a.x * r, oy + a.y * r, r, alfa); });
        });
    }

    var HB_FARVE = "#7fe0d2";

    /* En stiplet hydrogenbinding fra kanten af H til kanten af O */
    function tegnHBinding(ctx, h, o, ox, oy, r, alfa) {
        var hx = ox + h.x * r, hy = oy + h.y * r, qx = ox + o.x * r, qy = oy + o.y * r;
        var dx = qx - hx, dy = qy - hy, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / l, uy = dy / l;
        var a1 = 0.62 * r + 1, a2 = r + 1;
        if (l <= a1 + a2 + 2) { a1 = l * 0.2; a2 = l * 0.2; }
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        ctx.lineCap = "round";
        ctx.setLineDash([Math.max(3, r * 0.3), Math.max(3, r * 0.24)]);
        ctx.lineWidth = Math.max(2.5, r * 0.26);
        ctx.strokeStyle = HB_FARVE;
        ctx.beginPath();
        ctx.moveTo(hx + ux * a1, hy + uy * a1);
        ctx.lineTo(qx - ux * a2, qy - uy * a2);
        ctx.stroke();
        ctx.restore();
    }

    /* Kontaktfladen mellem to kaeder, som det gyldne baand i bogens figur
       kogepunkt-kontakt (4.1): fra x0 til x1 i hoejden y (enheder) */
    function tegnKontakt(ctx, x0, x1, y, ox, oy, r, alfa) {
        if (x1 <= x0) return;
        var X0 = ox + (x0 - 0.5) * r, X1 = ox + (x1 + 0.5) * r, Y = oy + y * r;
        var h = Math.max(4, r * 0.34);
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        NK.rundtRekt(ctx, X0 - 3, Y - h / 2 - 3, X1 - X0 + 6, h + 6, h / 2 + 3);
        ctx.fillStyle = "rgba(245, 166, 35, 0.22)";
        ctx.fill();
        var gr = ctx.createLinearGradient(0, Y - h / 2, 0, Y + h / 2);
        gr.addColorStop(0, "#ffd36b");
        gr.addColorStop(0.5, "#f5a623");
        gr.addColorStop(1, "#d9861a");
        NK.rundtRekt(ctx, X0, Y - h / 2, X1 - X0, h, h / 2);
        ctx.fillStyle = gr;
        ctx.globalAlpha *= 0.85;
        ctx.fill();
        ctx.restore();
    }

    NK.Kugler = {
        model: model, par: par, vend: vend, spejl: spejl, flyt: flyt, hBindinger: hBindinger, kasse: kasse,
        tegnMolekyler: tegnMolekyler, tegnHBinding: tegnHBinding, tegnKontakt: tegnKontakt,
        HB_FARVE: HB_FARVE, CC: CC, HB: HB, HB_MAKS: HB_MAKS
    };
}());

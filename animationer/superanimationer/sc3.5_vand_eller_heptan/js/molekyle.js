/* =====================================================================
   molekyle.js - strukturformlerne: laeses fra tekst, tegnes som i bogen

   NK.Molekyle.laes(stof)        { atomer, bindinger } ud fra stof.mol
   NK.Molekyle.grupper(mol)      de polaere grupper: COOH, OH, H2O, C=O og
                                 NH2, hver som en liste af atomnumre
   NK.Molekyle.plan(mol, rekt)   hvor formlen staar paa kortet (pixels)
   NK.Molekyle.tegn(ctx, mol, plan, valg)
   NK.Molekyle.atomVed(mol, plan, x, y)

   Koordinaterne er i bindingslaengder: to tegn i teksten er 1. En
   skraa binding er da sqrt(2) lang; stof.skraa kan trække den ind (vand).
   Molekylet laeses én gang pr. stof og gemmes (cache).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = {};
    var cache = {};

    var SKRAA = { "/": [[-1, 1], [1, -1]], "\\": [[-1, -1], [1, 1]] };

    function laesTekst(linjer, skraa) {
        var atomer = [], bindinger = [], ved = {};
        linjer.forEach(function (l, r) {
            for (var c = 0; c < l.length; c++) {
                if (/[A-Z]/.test(l[c])) {
                    ved[c + "," + r] = atomer.length;
                    atomer.push({ el: l[c], x: c / 2, y: r / 2 });
                }
            }
        });
        function atom(c, r) {
            var i = ved[c + "," + r];
            if (i === undefined) throw new Error("molekyle: binding uden atom ved " + c + "," + r);
            return i;
        }
        linjer.forEach(function (l, r) {
            for (var c = 0; c < l.length; c++) {
                var t = l[c], a, b;
                if (t === "-" || t === "=") { a = atom(c - 1, r); b = atom(c + 1, r); }
                else if (t === "|" || t === "\"") { a = atom(c, r - 1); b = atom(c, r + 1); }
                else if (SKRAA[t]) { a = atom(c + SKRAA[t][0][0], r + SKRAA[t][0][1]); b = atom(c + SKRAA[t][1][0], r + SKRAA[t][1][1]); }
                else continue;
                bindinger.push({ a: a, b: b, n: (t === "=" || t === "\"") ? 2 : 1, skraa: !!SKRAA[t] });
            }
        });
        var mol = { atomer: atomer, bindinger: bindinger };
        if (skraa) traekSkraaInd(mol, skraa);
        return mol;
    }

    /* Den mindste ende af en skraa binding flyttes ind mod den anden, saa
       bindingen faar laengden L. Kun i kaeder (ikke ringe). */
    function traekSkraaInd(mol, L) {
        mol.bindinger.forEach(function (bd) {
            if (!bd.skraa) return;
            var sa = side(mol, bd.a, bd), sb = side(mol, bd.b, bd);
            if (sa.indexOf(bd.b) >= 0) return;
            var flyt = sa.length <= sb.length ? sa : sb;
            var fra = flyt === sa ? bd.b : bd.a, til = flyt === sa ? bd.a : bd.b;
            var A = mol.atomer[fra], B = mol.atomer[til];
            var dx = B.x - A.x, dy = B.y - A.y, l = Math.sqrt(dx * dx + dy * dy);
            var f = (L - l) / l;
            flyt.forEach(function (i) { mol.atomer[i].x += dx * f; mol.atomer[i].y += dy * f; });
        });
    }

    /* Atomerne, man kan naa fra i uden at gaa over bindingen uden */
    function side(mol, i, uden) {
        var set = [i], k = 0;
        while (k < set.length) {
            var n = set[k++];
            mol.bindinger.forEach(function (bd) {
                if (bd === uden) return;
                var j = bd.a === n ? bd.b : (bd.b === n ? bd.a : -1);
                if (j >= 0 && set.indexOf(j) < 0) set.push(j);
            });
        }
        return set;
    }

    M.laes = function (stof) {
        if (!cache[stof.id]) cache[stof.id] = laesTekst(stof.mol, stof.skraa);
        return cache[stof.id];
    };

    M.laesTekst = laesTekst;

    function naboer(mol, i) {
        var ud = [];
        mol.bindinger.forEach(function (bd) {
            if (bd.a === i) ud.push({ j: bd.b, n: bd.n });
            else if (bd.b === i) ud.push({ j: bd.a, n: bd.n });
        });
        return ud;
    }
    M.naboer = naboer;

    /* ----- De polaere grupper ---------------------------------------------
       COOH  et C med et =O og et O-H (C'et er med i gruppen)
       H2O   et O med to H og intet C: hele vandmolekylet
       OH    et O med ét H
       C=O   et O med dobbeltbinding til et C
       NH2   et N med sine H
       Hver gruppe: { slags, atomer } */
    M.grupper = function (mol) {
        var ud = [], brugt = {};
        function el(i) { return mol.atomer[i].el; }
        mol.atomer.forEach(function (a, i) {
            if (a.el !== "C") return;
            var dO = -1, sO = -1, sH = -1;
            naboer(mol, i).forEach(function (nb) {
                if (el(nb.j) !== "O") return;
                if (nb.n === 2) dO = nb.j;
                else {
                    var h = naboer(mol, nb.j).filter(function (x) { return el(x.j) === "H"; });
                    if (h.length === 1) { sO = nb.j; sH = h[0].j; }
                }
            });
            if (dO >= 0 && sO >= 0) {
                ud.push({ slags: "COOH", atomer: [i, dO, sO, sH] });
                brugt[i] = brugt[dO] = brugt[sO] = brugt[sH] = true;
            }
        });
        mol.atomer.forEach(function (a, i) {
            if (a.el !== "O" || brugt[i]) return;
            var nb = naboer(mol, i);
            var h = nb.filter(function (x) { return el(x.j) === "H"; }).map(function (x) { return x.j; });
            var c2 = nb.filter(function (x) { return el(x.j) === "C" && x.n === 2; });
            if (h.length === 2 && nb.length === 2) ud.push({ slags: "H2O", atomer: [i].concat(h) });
            else if (h.length === 1) ud.push({ slags: "OH", atomer: [i, h[0]] });
            else if (c2.length === 1) ud.push({ slags: "C=O", atomer: [c2[0].j, i] });
            else return;
            ud[ud.length - 1].atomer.forEach(function (j) { brugt[j] = true; });
        });
        mol.atomer.forEach(function (a, i) {
            if (a.el !== "N" || brugt[i]) return;
            var h = naboer(mol, i).filter(function (x) { return el(x.j) === "H"; }).map(function (x) { return x.j; });
            ud.push({ slags: "NH2", atomer: [i].concat(h) });
        });
        return ud;
    };

    M.GRUPPENAVN = { "COOH": "COOH", "H2O": "H₂O", "OH": "OH", "C=O": "C=O", "NH2": "NH₂" };

    M.antalC = function (mol) {
        return mol.atomer.filter(function (a) { return a.el === "C"; }).length;
    };

    /* Sumformlen som { C: 6, H: 12, O: 6 } (til selvtesten) */
    M.taelAtomer = function (mol) {
        var t = {};
        mol.atomer.forEach(function (a) { t[a.el] = (t[a.el] || 0) + 1; });
        return t;
    };

    M.graense = function (mol) {
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        mol.atomer.forEach(function (a) {
            x0 = Math.min(x0, a.x); x1 = Math.max(x1, a.x);
            y0 = Math.min(y0, a.y); y1 = Math.max(y1, a.y);
        });
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
    };

    /* ----- Placering paa kortet ---------------------------------------------
       u: en bindingslaengde i pixels. Formlen faar hoejst uMaks, saa smaa
       molekyler ikke bliver kaempestore. */
    M.plan = function (mol, rekt, uMaks) {
        var g = M.graense(mol);
        var b = g.x1 - g.x0, h = g.y1 - g.y0;
        var u = Math.min(uMaks || 48, rekt.b / (b + 1.3), rekt.h / (h + 1.3));
        return {
            u: u,
            ox: rekt.x + rekt.b / 2 - (g.x0 + g.x1) / 2 * u,
            oy: rekt.y + rekt.h / 2 - (g.y0 + g.y1) / 2 * u
        };
    };

    M.px = function (plan, a) {
        return { x: plan.ox + a.x * plan.u, y: plan.oy + a.y * plan.u };
    };

    M.atomVed = function (mol, plan, x, y) {
        var bedst = -1, d0 = plan.u * 0.55;
        mol.atomer.forEach(function (a, i) {
            var p = M.px(plan, a), d = Math.sqrt((p.x - x) * (p.x - x) + (p.y - y) * (p.y - y));
            if (d < d0) { d0 = d; bedst = i; }
        });
        return bedst;
    };

    /* En boble om en gruppe atomer: cirkler om atomerne og tykke streger
       langs bindingerne imellem dem. Foerst kanten, saa fyldet ovenpaa,
       saa boblerne flyder sammen til én form. */
    function boble(ctx, mol, plan, atomer, fyld, kant, r) {
        var inde = {};
        atomer.forEach(function (i) { inde[i] = true; });
        var bindinger = mol.bindinger.filter(function (bd) { return inde[bd.a] && inde[bd.b]; });
        [[kant, r + 1.6], [fyld, r]].forEach(function (lag) {
            ctx.fillStyle = lag[0];
            ctx.strokeStyle = lag[0];
            ctx.lineCap = "round";
            ctx.lineWidth = lag[1] * 2;
            bindinger.forEach(function (bd) {
                var p = M.px(plan, mol.atomer[bd.a]), q = M.px(plan, mol.atomer[bd.b]);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.stroke();
            });
            atomer.forEach(function (i) {
                var p = M.px(plan, mol.atomer[i]);
                ctx.beginPath();
                ctx.arc(p.x, p.y, lag[1], 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    M.BLAA = { fyld: "#cfe6f8", kant: "#3d9ee0" };
    M.GUL = { fyld: "#f6e7b8", kant: "#d6a332" };

    /* valg:
         grupper    listen fra M.grupper
         markeret   { gruppenummer: true } - de blaa bobler
         facit      true: ogsaa carbonkaeden faar sin (gule) boble
         blink      { atom, t } - et atom, der lige er klikket paa (0-1)
         lys        0-1: alle grupper lyser svagt (hintet peger) */
    M.tegn = function (ctx, mol, plan, valg) {
        valg = valg || {};
        var u = plan.u, r = u * 0.4;
        var grupper = valg.grupper || [];
        ctx.save();

        if (valg.facit) {
            var iGruppe = {};
            grupper.forEach(function (g) { g.atomer.forEach(function (i) { iGruppe[i] = true; }); });
            var resten = [];
            mol.atomer.forEach(function (a, i) { if (!iGruppe[i] && (a.el === "C" || a.el === "H" || a.el === "I")) resten.push(i); });
            if (resten.length) boble(ctx, mol, plan, resten, M.GUL.fyld, M.GUL.kant, r);
        }
        grupper.forEach(function (g, k) {
            if (valg.facit || (valg.markeret && valg.markeret[k])) boble(ctx, mol, plan, g.atomer, M.BLAA.fyld, M.BLAA.kant, r);
        });

        /* Et klik paa et upolaert atom: en graa ring, der toner ud */
        if (valg.blink && valg.blink.t > 0) {
            var bp = M.px(plan, mol.atomer[valg.blink.atom]);
            ctx.globalAlpha = valg.blink.t;
            ctx.fillStyle = "#d9dde2";
            ctx.strokeStyle = "#8a929c";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bp.x, bp.y, r * (1.25 - 0.25 * valg.blink.t), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        /* Bindingerne: stregen standser et stykke fra bogstavet */
        var luft = u * 0.29;
        ctx.strokeStyle = "#1d2129";
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(1.4, u * 0.055);
        mol.bindinger.forEach(function (bd) {
            var p = M.px(plan, mol.atomer[bd.a]), q = M.px(plan, mol.atomer[bd.b]);
            var dx = q.x - p.x, dy = q.y - p.y, l = Math.sqrt(dx * dx + dy * dy);
            var ex = dx / l, ey = dy / l;
            var x0 = p.x + ex * luft, y0 = p.y + ey * luft, x1 = q.x - ex * luft, y1 = q.y - ey * luft;
            var forskyd = bd.n === 2 ? [-u * 0.075, u * 0.075] : [0];
            forskyd.forEach(function (f) {
                ctx.beginPath();
                ctx.moveTo(x0 - ey * f, y0 + ex * f);
                ctx.lineTo(x1 - ey * f, y1 + ex * f);
                ctx.stroke();
            });
        });

        /* Atomerne som bogstaver */
        ctx.fillStyle = "#1d2129";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "600 " + Math.max(12, u * 0.5).toFixed(1) + "px 'Segoe UI', sans-serif";
        mol.atomer.forEach(function (a) {
            var p = M.px(plan, a);
            ctx.fillText(a.el, p.x, p.y + u * 0.02);
        });
        ctx.restore();
    };

    NK.Molekyle = M;
}());

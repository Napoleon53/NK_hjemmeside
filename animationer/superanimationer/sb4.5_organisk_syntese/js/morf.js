/* =====================================================================
   morf.js - tavlen: reaktionen med strukturformler

   Tavlen viser det, der er i kolben, og det, der sker, naar man trykker
   Start. Molekylerne tegnes af molekylemotoren (NK.Layout og
   NK.Struktur) i zigzag som i bogen. Atomerne har farve efter, hvor de
   kommer fra: syren er orange, alkoholen blaa og ilten fra
   permanganaten lilla. Saa kan man se, hvilke atomer der bliver til
   vand, og hvilke dele af esterens navn der kommer fra hvad.

   En plan er en raekke billeder (frames) af de samme atomer. Mellem to
   billeder glider atomerne fra den ene plads til den anden; en binding,
   der kun findes i det ene billede, forsvinder eller kommer midt i
   bevaegelsen. De reagerende H-atomer er rigtige atomer (ikke "OH" som
   tekst), saa de kan flytte sig for sig selv.

   NK.Tavlen(canvas)  .vis(spec)  .opdater(dt)  .tegn()  .faerdig()
   spec: { type: "tom" | "foer" | "udfald", a, b, udfald }
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var FONT = "'Segoe UI', Tahoma, sans-serif";

    var FARVE = {
        syre: "#f7b267",
        alk: "#8fd0ff",
        ox: "#d9a8ff",
        hvid: "#e9eee9",
        svag: "#9fb1a9",
        roed: "#ff8a7d",
        gul: "#f5dd8a",
        groen: "#8ff0b4"
    };

    /* ----- Molekyler med koordinater ----------------------------------------- */
    function lag(mol) {
        NK.Layout.zigzag(mol, NK.Navn.analyser(mol));
    }

    function spejl(mol) {
        mol.atomer.forEach(function (a) { a.x = -a.x; });
    }

    function boks(mol) {
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        mol.atomer.forEach(function (a) {
            x0 = Math.min(x0, a.x); x1 = Math.max(x1, a.x);
            y0 = Math.min(y0, a.y); y1 = Math.max(y1, a.y);
        });
        if (!isFinite(x0)) { x0 = y0 = x1 = y1 = 0; }
        /* plads til bogstaverne */
        x0 -= 0.55; x1 += 0.55; y0 -= 0.45; y1 += 0.45;
        return { x0: x0, y0: y0, x1: x1, y1: y1, b: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
    }

    function atomX(mol, id) { return mol.atom(id).x; }

    /* Et H som rigtigt atom paa O (eller C), lagt i den frie retning */
    function medH(mol, id) {
        var h = mol.tilfoej("H", 0, 0);
        mol.bind(id, h.id, 1);
        return h.id;
    }

    /* H paa et O lagt efter layoutet: i zigzag (60 grader ud fra bindingen),
       paa den side, hvor der er mest luft. Motorens layout kan ellers
       lægge det inde i en benzenring. */
    function saetH(mol, h, o) {
        var O = mol.atom(o), H = mol.atom(h);
        var d = { x: 0, y: 0 };
        mol.naboer(o).forEach(function (id) {
            if (id === h) return;
            var n = mol.atom(id);
            d.x += O.x - n.x; d.y += O.y - n.y;
        });
        var l = Math.sqrt(d.x * d.x + d.y * d.y) || 1;
        d.x /= l; d.y /= l;
        var bedst = -1, valgt = null;
        [60, -60, 0].forEach(function (g) {
            var r = g * Math.PI / 180;
            var c = { x: O.x + d.x * Math.cos(r) - d.y * Math.sin(r), y: O.y + d.x * Math.sin(r) + d.y * Math.cos(r) };
            var min = Infinity;
            mol.atomer.forEach(function (a) {
                if (a.id === h || a.id === o) return;
                var dx = a.x - c.x, dy = a.y - c.y;
                min = Math.min(min, Math.sqrt(dx * dx + dy * dy));
            });
            if (min > bedst + 0.05) { bedst = min; valgt = c; }
        });
        H.x = valgt.x;
        H.y = valgt.y;
    }

    /* Kopi af et stofs molekyle; kort fra stoffets id til kopiens id */
    function kopiAf(mol) {
        var m = new NK.Molekyle();
        var kort = K.kopierInd(m, mol, null);
        return { mol: m, k: kort };
    }

    /* ----- Placering paa tavlen ---------------------------------------------------
       En raekke er en liste af emner: { mol, bx } eller { tekst, b } (px).
       Den centreres i bredden; hvert emne faar sin midte cx. */
    var PLUS_B = 34;

    function placerRaekke(emner, venstre, bredde, s) {
        var mellem = 10;
        var ialt = 0;
        emner.forEach(function (e, i) {
            e.bpx = e.mol ? e.bx.b * s : e.b;
            ialt += e.bpx + (i ? mellem : 0);
        });
        var x = venstre + (bredde - ialt) / 2;
        emner.forEach(function (e) {
            e.cx = x + e.bpx / 2;
            x += e.bpx + mellem;
        });
    }

    /* Atomernes pladser i px for et molekyle med midte (cx, cy) */
    function pladser(mol, bx, cx, cy, s, praefiks, ud, alfa) {
        mol.atomer.forEach(function (a) {
            ud[praefiks + a.id] = { x: cx + (a.x - bx.cx) * s, y: cy + (a.y - bx.cy) * s, a: alfa === undefined ? 1 : alfa };
        });
    }

    function bindinger(mol, praefiks, ud) {
        mol.bindinger.forEach(function (bd) { ud.push([praefiks + bd.a, praefiks + bd.b, bd.orden]); });
    }

    /* ----- Tegning af ét billede ----------------------------------------------------
       atomer: { noegle: { el, farve, h } } og pos: { noegle: { x, y, a } } */
    function rgba(hex, a) {
        var n = parseInt(hex.slice(1), 16);
        return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + NK.klamp(a, 0, 1).toFixed(3) + ")";
    }

    function tegnBillede(ctx, atomer, pos, bd, s, alfaAlt, lys) {
        var m = new NK.Molekyle();
        var id = {}, fast = {}, farve = {};
        Object.keys(pos).forEach(function (k) {
            var p = pos[k];
            if (!atomer[k] || p.a <= 0.01) return;
            var a = m.tilfoej(atomer[k].el, p.x / s, p.y / s);
            id[k] = a.id;
            fast[a.id] = atomer[k].h;
            farve[a.id] = rgba(atomer[k].farve, p.a * alfaAlt);
        });
        var bFarve = [];
        bd.forEach(function (b) {
            if (!id[b[0]] || !id[b[1]]) return;
            var x = m.bind(id[b[0]], id[b[1]], b[2]);
            if (!x) return;
            var fa = atomer[b[0]].farve, fb = atomer[b[1]].farve;
            var aa = Math.min(pos[b[0]].a, pos[b[1]].a) * alfaAlt * (b[3] === undefined ? 1 : b[3]);
            bFarve.push({ bd: x, f: fa === fb ? rgba(fa, aa) : rgba(FARVE.gul, aa) });
        });
        /* Hydrogen, der ikke er tegnet, er det samme hele vejen: et O, der
           mister sin binding midt i bevaegelsen, faar ikke et H for meget */
        m.implicitH = function (aid) { return fast[aid] || 0; };
        var g = NK.Struktur.geometri(m, {
            skala: s,
            stil: "zigzag",
            farve: rgba(FARVE.hvid, alfaAlt),
            skrift: Math.max(14, Math.round(s * 0.42)),
            linje: Math.max(1.8, s * 0.06),
            atomFarve: function (aid) { return farve[aid] || null; },
            bindingFarve: function (b) {
                for (var i = 0; i < bFarve.length; i++) if (bFarve[i].bd === b) return bFarve[i].f;
                return null;
            }
        });
        if (lys) lys(m, id);
        NK.Struktur.tegnGeo(ctx, g);
    }

    /* ----- Tekst paa tavlen ------------------------------------------------------------ */
    function tekst(ctx, t, x, y, farve, str, vaegt, just) {
        ctx.font = (vaegt || "700") + " " + (str || 16) + "px " + FONT;
        ctx.textAlign = just || "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve;
        ctx.fillText(t, x, y);
    }

    /* Et navn i flere farver: [{ t, f }] centreret om x */
    function farvetNavn(ctx, dele, x, y, str, alfa) {
        ctx.font = "700 " + str + "px " + FONT;
        var b = 0;
        dele.forEach(function (d) { b += ctx.measureText(d.t).width; });
        var xx = x - b / 2;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        dele.forEach(function (d) {
            ctx.fillStyle = rgba(d.f, alfa);
            ctx.fillText(d.t, xx, y);
            xx += ctx.measureText(d.t).width;
        });
    }

    /* Tekst paa pilen med tavlens farve bag, saa stregen ikke gaar igennem */
    function etiket(ctx, t, x, y, farve, str) {
        ctx.font = "700 " + (str || 15) + "px " + FONT;
        var b = ctx.measureText(t).width + 10, h = (str || 15) + 8;
        ctx.fillStyle = "#1f2b27";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 5);
        ctx.fill();
        tekst(ctx, t, x, y, farve, str);
    }

    function pil(ctx, x, y0, y1, farve) {
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1 - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 8, y1 - 11);
        ctx.lineTo(x + 8, y1 - 11);
        ctx.lineTo(x, y1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* ----- Planerne ------------------------------------------------------------------
       En plan: { atomer, billeder: [{ pos, bd }], forloeb: [{ fra, til, t0, t1 }],
       spoegelser: [{ billede, t0 }], lys: [{ noegler, t0, t1 }], pynt(ctx, t) }  */

    function farveAf(stof, rolle) {
        if (rolle) return FARVE[rolle];
        if (!stof) return FARVE.hvid;
        if (stof.klasse === "syre") return FARVE.syre;
        if (stof.klasse === "alkohol") return FARVE.alk;
        if (stof.klasse === "ox") return FARVE.ox;
        return FARVE.hvid;
    }

    /* Plads og skala: venstre margen til pilene */
    function ramme(W, H) {
        var venstre = 78, hoejre = 18;
        return { x: venstre, b: Math.max(60, W - venstre - hoejre), W: W, H: H };
    }

    /* En raekkes hoejde i bindingslaengder (det hoejeste molekyle) */
    function hoejde(r) {
        var h = 0;
        r.forEach(function (e) { if (e.mol) h = Math.max(h, e.bx.h); });
        return h || 1;
    }

    /* Skalaen (px pr. binding): hver raekke skal kunne vaere i bredden, og
       raekkerne tilsammen i den lodrette plads, der er tilbage, naar
       titlen, navnene og pilene har faaet deres */
    function skalaFor(raekker, R, lodret) {
        var s = 46;
        raekker.forEach(function (r) {
            var enh = 0, px = 0;
            r.forEach(function (e, i) {
                if (e.mol) enh += e.bx.b; else px += e.b;
                if (i) px += 10;
            });
            if (enh > 0) s = Math.min(s, (R.b - px) / enh);
        });
        var sum = 0;
        raekker.forEach(function (r) { sum += hoejde(r); });
        if (lodret > 0) s = Math.min(s, lodret / sum);
        return Math.max(12, s);
    }

    /* Et stof som emne i en raekke: molekylet (kopi med koordinater) eller
       teksten KMnO₄ */
    function emneAf(stof, rolle) {
        if (!stof) return null;
        if (stof.klasse === "ox" || !stof.mol) {
            return { tekst: stof.formel, b: 96, farve: farveAf(stof, rolle), navn: stof.navn, stof: stof };
        }
        var k = kopiAf(stof.mol);
        lag(k.mol);
        return { mol: k.mol, bx: boks(k.mol), farve: farveAf(stof, rolle), navn: stof.navn, stof: stof };
    }

    /* Saml en raekke af emner med plus imellem */
    function medPlus(emner) {
        var ud = [];
        emner.forEach(function (e, i) {
            if (!e) return;
            if (ud.length) ud.push({ tekst: "+", b: PLUS_B, plus: true });
            ud.push(e);
        });
        return ud;
    }

    /* Billedet af en raekke molekyler (de faste, ikke-bevaegelige) */
    function raekkeBillede(raekke, y, s, praefiks, atomer, pos, bd, alfa) {
        raekke.forEach(function (e, i) {
            if (!e.mol) return;
            var p = praefiks + i + ":";
            e.mol.atomer.forEach(function (a) {
                atomer[p + a.id] = { el: a.el, farve: e.farve, h: e.mol.implicitH(a.id) };
            });
            pladser(e.mol, e.bx, e.cx, y, s, p, pos, alfa);
            bindinger(e.mol, p, bd);
        });
    }

    function navneUnder(ctx, raekke, y, s, alfa, str) {
        raekke.forEach(function (e) {
            if (e.plus || !e.navn) return;
            var hh = e.mol ? e.bx.h * s / 2 : 16;
            var f = e.navnFarve || e.farve;
            if (e.dele) farvetNavn(ctx, e.dele, e.cx, y + hh + 14, str || 16, alfa);
            else tekst(ctx, e.navn, e.cx, y + hh + 14, rgba(f, alfa), str || 16);
        });
    }

    function tekstEmner(ctx, raekke, y, alfa) {
        raekke.forEach(function (e) {
            if (e.mol) return;
            if (e.plus) tekst(ctx, "+", e.cx, y, rgba(FARVE.hvid, alfa), 26, "600");
            else tekst(ctx, e.tekst, e.cx, y, rgba(e.farve, alfa), 24, "700");
        });
    }

    /* ----- Foer Start: det, der er i kolben -------------------------------------------- */
    function planFoer(spec, W, H) {
        var R = ramme(W, H);
        var raekke = medPlus([emneAf(spec.a), emneAf(spec.b)]);
        var s = skalaFor([raekke], R, H * 0.42);
        var y = H * 0.34;
        placerRaekke(raekke, R.x, R.b, s);
        var atomer = {}, pos = {}, bd = [];
        raekkeBillede(raekke, y, s, "f", atomer, pos, bd, 1);
        return {
            s: s, atomer: atomer, billeder: [{ pos: pos, bd: bd }], forloeb: [], varighed: 0.4,
            pynt: function (ctx, t) {
                var a = NK.klamp(t / 0.3, 0, 1);
                tekstEmner(ctx, raekke, y, a);
                navneUnder(ctx, raekke, y, s, a);
                var yP = H * 0.62;
                pil(ctx, 40, y - 8, yP + 30, rgba(FARVE.svag, 0.6 * a));
                tekst(ctx, spec.b ? "?" : "", W / 2 + 20, H * 0.76, rgba(FARVE.svag, a), 34, "700");
            }
        };
    }

    /* ----- Esteren ----------------------------------------------------------------------- */
    function planEster(u, W, H) {
        var m = u.morf;
        var R = ramme(W, H);
        /* Syren med H paa OH, O til hoejre */
        var A = kopiAf(m.syre.mol), oA = A.k[m.so.o], cA = A.k[m.so.c];
        lag(A.mol);
        if (atomX(A.mol, oA) < atomX(A.mol, cA)) spejl(A.mol);
        var hA = medH(A.mol, oA);
        saetH(A.mol, hA, oA);
        /* Alkoholen med H paa OH, O til venstre */
        var B = kopiAf(m.alk.mol), oB = B.k[m.ao.o], cB = B.k[m.ao.c];
        lag(B.mol);
        if (atomX(B.mol, oB) > atomX(B.mol, cB)) spejl(B.mol);
        var hB = medH(B.mol, oB);
        saetH(B.mol, hB, oB);
        /* Esteren */
        var E = new NK.Molekyle();
        var udA = {}; udA[oA] = true; udA[hA] = true;
        var udB = {}; udB[hB] = true;
        var eA = K.kopierInd(E, A.mol, udA), eB = K.kopierInd(E, B.mol, udB);
        E.bind(eA[cA], eB[oB], 1);
        lag(E);
        if (atomX(E, eA[cA]) > atomX(E, eB[oB])) spejl(E);
        /* Vandet: O fra syren, H fra syren og H fra alkoholen */
        var Wm = new NK.Molekyle();
        var wO = Wm.tilfoej("O", 0, 0), wH1 = Wm.tilfoej("H", -0.82, 0.58), wH2 = Wm.tilfoej("H", 0.82, 0.58);
        var bxW = boks(Wm);

        var eSyre = { mol: A.mol, bx: boks(A.mol), farve: FARVE.syre, navn: m.syre.navn };
        var eAlk = { mol: B.mol, bx: boks(B.mol), farve: FARVE.alk, navn: m.alk.navn };
        var eEst = { mol: E, bx: boks(E), farve: FARVE.hvid, navn: m.produkt.navn };
        var eVand = { mol: Wm, bx: bxW, farve: FARVE.hvid, navn: "vand" };
        var r1 = medPlus([eSyre, eAlk]), r2 = medPlus([eEst, eVand]);
        /* Lodret: titel 30, navne under raekke 1 30, pil 24, navn, trivialnavn og duft 66 */
        var s = skalaFor([r1, r2], R, H - 150);
        var y1 = 30 + hoejde(r1) * s / 2;
        var y2 = H - 66 - hoejde(r2) * s / 2;
        placerRaekke(r1, R.x, R.b, s);
        placerRaekke(r2, R.x, R.b, s);

        /* Atomerne: a = syren, b = alkoholen */
        var atomer = {};
        A.mol.atomer.forEach(function (a) { atomer["a" + a.id] = { el: a.el, farve: FARVE.syre, h: A.mol.implicitH(a.id) }; });
        B.mol.atomer.forEach(function (a) { atomer["b" + a.id] = { el: a.el, farve: FARVE.alk, h: B.mol.implicitH(a.id) }; });

        /* Billede 0: syre + alkohol */
        var p0 = {}, b0 = [];
        pladser(A.mol, eSyre.bx, eSyre.cx, y1, s, "a", p0);
        pladser(B.mol, eAlk.bx, eAlk.cx, y1, s, "b", p0);
        bindinger(A.mol, "a", b0);
        bindinger(B.mol, "b", b0);

        /* Billede 1: vandet er dannet midt imellem */
        var p1 = {}, k;
        for (k in p0) p1[k] = { x: p0[k].x, y: p0[k].y, a: 1 };
        var xV = r1[1].cx, yV = (y1 + y2) / 2 - 0.2 * s;
        p1["a" + oA] = { x: xV, y: yV, a: 1 };
        p1["a" + hA] = { x: xV - 0.82 * s, y: yV + 0.58 * s, a: 1 };
        p1["b" + hB] = { x: xV + 0.82 * s, y: yV + 0.58 * s, a: 1 };
        var b1 = b0.filter(function (b) {
            var ab = [b[0], b[1]].sort().join("|");
            return ab !== ["a" + cA, "a" + oA].sort().join("|") && ab !== ["b" + oB, "b" + hB].sort().join("|");
        });
        b1.push(["a" + oA, "b" + hB, 1]);

        /* Billede 2: esteren og vandet nederst */
        var p2 = {};
        var tilbageA = {}, tilbageB = {};
        Object.keys(eA).forEach(function (x) { tilbageA[eA[x]] = "a" + x; });
        Object.keys(eB).forEach(function (x) { tilbageB[eB[x]] = "b" + x; });
        function noegleE(id) { return tilbageA[id] || tilbageB[id]; }
        E.atomer.forEach(function (a) {
            p2[noegleE(a.id)] = { x: eEst.cx + (a.x - eEst.bx.cx) * s, y: y2 + (a.y - eEst.bx.cy) * s, a: 1 };
        });
        function vandPos(atom) { return { x: eVand.cx + (atom.x - bxW.cx) * s, y: y2 + (atom.y - bxW.cy) * s, a: 1 }; }
        p2["a" + oA] = vandPos(wO);
        p2["a" + hA] = vandPos(wH1);
        p2["b" + hB] = vandPos(wH2);
        var b2 = [];
        E.bindinger.forEach(function (bd) { b2.push([noegleE(bd.a), noegleE(bd.b), bd.orden]); });
        b2.push(["a" + oA, "a" + hA, 1], ["a" + oA, "b" + hB, 1]);

        /* Navnet: alkoholens del blaa, syrens del orange */
        var dele = K.navneDele(m.produkt, m.syre).map(function (d) { return { t: d.t, f: d.k === "syre" ? FARVE.syre : FARVE.alk }; });
        eEst.dele = dele;

        var T = { lys0: 0.5, lys1: 2.0, k1a: 2.0, k1b: 3.0, k2a: 3.2, k2b: 4.6 };
        var duft = m.produkt.duft && !m.produkt.medicin ? (m.produkt.ikon ? m.produkt.ikon + " " : "") + "dufter af " + m.produkt.duft : "";
        return {
            s: s, atomer: atomer,
            billeder: [{ pos: p0, bd: b0 }, { pos: p1, bd: b1 }, { pos: p2, bd: b2 }],
            forloeb: [{ fra: 0, til: 1, t0: T.k1a, t1: T.k1b }, { fra: 1, til: 2, t0: T.k2a, t1: T.k2b }],
            spoegelse: { billede: 0, t0: T.k2a, t1: T.k2b, alfa: 0.32 },
            lys: [{ noegler: ["a" + oA, "a" + hA, "b" + hB], t0: T.lys0, t1: T.k1b }],
            varighed: T.k2b + 0.6,
            titel: u.phenol ? "Ester af ringens OH" : "Esterdannelse",
            pynt: function (ctx, t) {
                var a0 = NK.klamp(t / 0.4, 0, 1);
                tekstEmner(ctx, r1, y1, a0 * (t > T.k2a ? 1 - 0.68 * NK.klamp((t - T.k2a) / 1, 0, 1) : 1));
                navneUnder(ctx, r1, y1, s, t > T.k2a ? 1 - 0.6 * NK.klamp((t - T.k2a) / 1, 0, 1) : a0);
                var a2 = NK.klamp((t - T.k2b + 0.2) / 0.5, 0, 1);
                if (a2 > 0) {
                    tekstEmner(ctx, r2, y2, a2);
                    navneUnder(ctx, r2, y2, s, a2, 17);
                    pil(ctx, 40, y1 - 10, y2 + 10, rgba(FARVE.hvid, 0.85 * a2));
                    etiket(ctx, "H⁺", 40, (y1 + y2) / 2 - 22, rgba(FARVE.gul, a2), 15);
                    etiket(ctx, "varme", 40, (y1 + y2) / 2 + 10, rgba(FARVE.gul, a2), 14);
                    var yN = y2 + eEst.bx.h * s / 2 + 14;
                    if (m.produkt.trivial) tekst(ctx, "(" + m.produkt.trivial + ")", eEst.cx, yN + 21, rgba(FARVE.svag, a2), 15, "600");
                    if (duft) tekst(ctx, duft, eEst.cx, yN + (m.produkt.trivial ? 44 : 26), rgba(FARVE.groen, a2), 15, "600");
                }
                /* Mens H'erne lyser: hvad der sker */
                if (t > T.lys0 && t < T.k2a) {
                    var al = NK.klamp((t - T.lys0) / 0.4, 0, 1) * NK.klamp((T.k2a - t) / 0.3, 0, 1);
                    tekst(ctx, "OH + H bliver til vand", W / 2 + 20, (y1 + y2) / 2 + 0.9 * s + 18, rgba(FARVE.gul, al), 15, "600");
                }
            }
        };
    }

    /* ----- Oxidationen ----------------------------------------------------------------------- */
    function planOx(u, W, H) {
        var m = u.morf;
        var R = ramme(W, H);
        var A = kopiAf(m.alk.mol), o = A.k[m.ao.o], c = A.k[m.ao.c];
        var hC = A.mol.implicitH(c);
        var hC1 = medH(A.mol, c);
        var hC2 = hC >= 2 ? medH(A.mol, c) : null;
        lag(A.mol);
        if (atomX(A.mol, o) < atomX(A.mol, c)) spejl(A.mol);
        var hO = medH(A.mol, o);
        saetH(A.mol, hO, o);

        /* Aldehyd eller keton: uden hO og hC1, C=O */
        var D1 = new NK.Molekyle();
        var ud1 = {}; ud1[hO] = true; ud1[hC1] = true;
        var d = K.kopierInd(D1, A.mol, ud1);
        D1.binding(d[c], d[o]).orden = 2;
        lag(D1);
        if (atomX(D1, d[o]) < atomX(D1, d[c])) spejl(D1);

        /* Syren: et nyt O mellem C og hC2 */
        var S1 = null, sK = null, sNyO = null;
        if (!m.keton && hC2) {
            S1 = new NK.Molekyle();
            sK = K.kopierInd(S1, D1, null);
            var bd = S1.binding(sK[d[c]], sK[d[hC2]]);
            S1.fjernBinding(bd);
            sNyO = S1.tilfoej("O", 0, 0).id;
            S1.bind(sK[d[c]], sNyO, 1);
            S1.bind(sNyO, sK[d[hC2]], 1);
            lag(S1);
            if (atomX(S1, sK[d[o]]) < atomX(S1, sK[d[c]]) && atomX(S1, sNyO) < atomX(S1, sK[d[c]])) spejl(S1);
        }

        var Wm = new NK.Molekyle();
        var wO = Wm.tilfoej("O", 0, 0), wH1 = Wm.tilfoej("H", -0.82, 0.58), wH2 = Wm.tilfoej("H", 0.82, 0.58);
        var bxW = boks(Wm);

        var eAlk = { mol: A.mol, bx: boks(A.mol), farve: FARVE.alk, navn: m.alk.navn };
        var eO1 = { tekst: "O", b: 40, farve: FARVE.ox };
        var eD = { mol: D1, bx: boks(D1), farve: FARVE.hvid, navn: m.keton ? m.produkt.navn : m.mellem };
        var eVand = { mol: Wm, bx: bxW, farve: FARVE.hvid, navn: "vand" };
        var eS = S1 ? { mol: S1, bx: boks(S1), farve: FARVE.hvid, navn: m.produkt.navn } : null;
        var r1 = [eAlk, { tekst: "", b: 60 }];
        var r2 = medPlus([eD, eVand]);
        var r3 = eS ? [eS] : [{ tekst: "", b: 10 }];
        /* Tre raekker: titel 30, navne 26 under hver, og resten fordelt
           mellem raekkerne */
        var s = skalaFor([r1, r2, r3], R, H - 140);
        var h1 = hoejde(r1) * s, h2 = hoejde(r2) * s, h3 = (S1 ? hoejde(r3) : 1) * s;
        var mellem = Math.max(10, (H - 30 - h1 - h2 - h3 - 3 * 26) / 2);
        var y1 = 30 + h1 / 2;
        var y2 = y1 + h1 / 2 + 26 + mellem + h2 / 2;
        var y3 = y2 + h2 / 2 + 26 + mellem + h3 / 2;
        placerRaekke(r1, R.x, R.b, s);
        placerRaekke(r2, R.x, R.b, s);
        placerRaekke(r3, R.x, R.b, s);

        var atomer = {};
        A.mol.atomer.forEach(function (a) { atomer["a" + a.id] = { el: a.el, farve: FARVE.alk, h: A.mol.implicitH(a.id) }; });
        atomer.o1 = { el: "O", farve: FARVE.ox, h: 0 };
        atomer.o2 = { el: "O", farve: FARVE.ox, h: 0 };

        var xOud = R.x + R.b - 20;
        /* Billede 0: alkoholen; O fra permanganaten til hoejre */
        var p0 = {}, b0 = [];
        pladser(A.mol, eAlk.bx, eAlk.cx, y1, s, "a", p0);
        bindinger(A.mol, "a", b0);
        p0.o1 = { x: xOud, y: y1, a: 1 };
        p0.o2 = { x: xOud, y: y2, a: 0 };

        /* Billede 1: aldehyd (keton) og vand */
        var tilbage = {};
        Object.keys(d).forEach(function (x) { tilbage[d[x]] = "a" + x; });
        var p1 = {};
        D1.atomer.forEach(function (a) {
            p1[tilbage[a.id]] = { x: eD.cx + (a.x - eD.bx.cx) * s, y: y2 + (a.y - eD.bx.cy) * s, a: 1 };
        });
        function vandPos(atom) { return { x: eVand.cx + (atom.x - bxW.cx) * s, y: y2 + (atom.y - bxW.cy) * s, a: 1 }; }
        p1.o1 = vandPos(wO);
        p1["a" + hO] = vandPos(wH1);
        p1["a" + hC1] = vandPos(wH2);
        var b1 = [];
        D1.bindinger.forEach(function (x) { b1.push([tilbage[x.a], tilbage[x.b], x.orden]); });
        b1.push(["o1", "a" + hO, 1], ["o1", "a" + hC1, 1]);
        /* det andet O venter til hoejre for aldehydet */
        var cPos = p1["a" + c];
        p1.o2 = { x: xOud, y: y2 - 1.4 * s, a: 0 };

        var p2 = {}, k;
        for (k in p1) p2[k] = { x: p1[k].x, y: p1[k].y, a: p1[k].a };
        p2.o2 = { x: Math.min(xOud, cPos.x + 2.6 * s), y: cPos.y - 1.3 * s, a: 1 };

        var billeder = [{ pos: p0, bd: b0 }, { pos: p1, bd: b1 }, { pos: p2, bd: b1 }];
        var forloeb = [{ fra: 0, til: 1, t0: 1.8, t1: 3.0 }, { fra: 1, til: 2, t0: 3.3, t1: 4.0 }];
        var lys = [{ noegler: ["a" + hO, "a" + hC1], t0: 0.5, t1: 3.0 }];
        var spoegelser = [{ billede: 0, t0: 1.8, t1: 3.0, alfa: 0.3,
            kun: A.mol.atomer.map(function (a) { return "a" + a.id; }) }];
        var slut = 4.6;

        if (S1) {
            /* Billede 3: syren nederst */
            var tilbageS = {};
            Object.keys(sK).forEach(function (x) { tilbageS[sK[x]] = tilbage[+x]; });
            tilbageS[sNyO] = "o2";
            var p3 = {};
            for (k in p2) p3[k] = { x: p2[k].x, y: p2[k].y, a: p2[k].a };
            S1.atomer.forEach(function (a) {
                p3[tilbageS[a.id]] = { x: eS.cx + (a.x - eS.bx.cx) * s, y: y3 + (a.y - eS.bx.cy) * s, a: 1 };
            });
            var b3 = b1.filter(function (b) { return b[0] === "o1" || b[1] === "o1"; });
            S1.bindinger.forEach(function (x) { b3.push([tilbageS[x.a], tilbageS[x.b], x.orden]); });
            billeder.push({ pos: p3, bd: b3 });
            forloeb.push({ fra: 2, til: 3, t0: 4.5, t1: 5.7 });
            lys.push({ noegler: ["o2"], t0: 4.0, t1: 5.7 });
            spoegelser.push({ billede: 1, t0: 4.5, t1: 5.7, alfa: 0.3, kun: Object.keys(tilbage).map(function (x) { return tilbage[x]; }) });
            slut = 6.2;
        } else {
            /* Ketonen: O'et proever, men preller af */
            var p3k = {};
            for (k in p2) p3k[k] = { x: p2[k].x, y: p2[k].y, a: p2[k].a };
            p3k.o2 = { x: cPos.x + 0.9 * s, y: cPos.y - 1.0 * s, a: 1 };
            var p4k = {};
            for (k in p2) p4k[k] = { x: p2[k].x, y: p2[k].y, a: p2[k].a };
            p4k.o2 = { x: xOud, y: y2 - 1.5 * s, a: 0 };
            billeder.push({ pos: p3k, bd: b1 }, { pos: p4k, bd: b1 });
            forloeb.push({ fra: 2, til: 3, t0: 4.3, t1: 4.9 }, { fra: 3, til: 4, t0: 5.0, t1: 5.8 });
            slut = 6.0;
        }

        return {
            s: s, atomer: atomer, billeder: billeder, forloeb: forloeb, spoegelser: spoegelser, lys: lys,
            varighed: slut, titel: "Oxidation",
            pynt: function (ctx, t) {
                var a0 = NK.klamp(t / 0.4, 0, 1);
                var f1 = t > 1.8 ? 1 - 0.6 * NK.klamp((t - 1.8) / 1, 0, 1) : a0;
                navneUnder(ctx, [eAlk], y1, s, f1);
                if (t < 1.8) tekst(ctx, "fra KMnO₄", xOud, y1 + 26, rgba(FARVE.ox, a0), 14, "600");
                var a1 = NK.klamp((t - 2.8) / 0.5, 0, 1);
                if (a1 > 0) {
                    tekstEmner(ctx, r2, y2, a1);
                    var f2 = S1 && t > 4.5 ? 1 - 0.6 * NK.klamp((t - 4.5) / 1, 0, 1) : a1;
                    eD.navn = m.keton ? m.produkt.navn + " (keton)" : m.mellem + " (aldehyd)";
                    navneUnder(ctx, r2, y2, s, f2);
                    pil(ctx, 40, y1 - 4, y2 + 4, rgba(FARVE.hvid, 0.85 * a1));
                    etiket(ctx, "+ O", 40, (y1 + y2) / 2, rgba(FARVE.ox, a1), 16);
                }
                if (S1) {
                    var a3 = NK.klamp((t - 5.5) / 0.5, 0, 1);
                    if (a3 > 0) {
                        eS.navn = m.produkt.navn + " (carboxylsyre)";
                        navneUnder(ctx, r3, y3, s, a3, 17);
                        pil(ctx, 40, y2 + 4, y3 + 4, rgba(FARVE.hvid, 0.85 * a3));
                        etiket(ctx, "+ O", 40, (y2 + y3) / 2, rgba(FARVE.ox, a3), 16);
                    }
                } else {
                    var ak = NK.klamp((t - 4.8) / 0.4, 0, 1);
                    if (ak > 0) {
                        tekst(ctx, "✗", cPos.x + 0.9 * s, cPos.y - 1.9 * s, rgba(FARVE.roed, ak), 26);
                        tekst(ctx, "C-atomet med O har intet H. Her stopper det.", R.x + R.b / 2, y3, rgba(FARVE.roed, ak), 16, "600");
                    }
                }
            }
        };
    }

    /* ----- Ingen reaktion, eller der mangler noget ------------------------------------- */
    function planStatisk(u, W, H) {
        var R = ramme(W, H);
        var r1 = medPlus([emneAf(u.a), emneAf(u.b)]);
        var r2 = [];
        var co2 = null;
        if (u.slags === "co2" && !u.mangler.length) {
            var c = NK.Smiles.laes("O=C=O");
            lag(c);
            var w = NK.Smiles.laes("O");
            lag(w);
            r2 = medPlus([{ mol: c, bx: boks(c), farve: FARVE.hvid, navn: "carbondioxid" }, { mol: w, bx: boks(w), farve: FARVE.hvid, navn: "vand" }]);
            co2 = true;
        } else if (u.slags === "ether" && u.produkt) {
            var e = emneAf(u.produkt);
            var w2 = NK.Smiles.laes("O");
            lag(w2);
            r2 = medPlus([e, { mol: w2, bx: boks(w2), farve: FARVE.hvid, navn: "vand" }]);
        }
        var s = skalaFor(r2.length ? [r1, r2] : [r1], R, r2.length ? H - 140 : H * 0.42);
        var y1 = r2.length ? 30 + hoejde(r1) * s / 2 : H * 0.3;
        var y2 = r2.length ? H - 44 - hoejde(r2) * s / 2 : H * 0.72;
        placerRaekke(r1, R.x, R.b, s);
        if (r2.length) placerRaekke(r2, R.x, R.b, s);
        var atomer = {}, pos = {}, bd = [];
        raekkeBillede(r1, y1, s, "r", atomer, pos, bd, 1);
        if (r2.length) raekkeBillede(r2, y2, s, "p", atomer, pos, bd, 1);
        var mangler = u.mangler && u.mangler.length && u.mulig;
        var tekster = { hplus: "svovlsyre (H⁺)", varme: "varme" };
        return {
            s: s, atomer: atomer, billeder: [{ pos: pos, bd: bd }], forloeb: [], varighed: 0.6,
            titel: mangler ? "Der mangler noget" : (r2.length ? (co2 ? "Oxidation" : "Påskeæg") : "Ingen reaktion"),
            pynt: function (ctx, t) {
                var a = NK.klamp(t / 0.4, 0, 1);
                tekstEmner(ctx, r1, y1, a);
                navneUnder(ctx, r1, y1, s, a);
                if (r2.length) {
                    tekstEmner(ctx, r2, y2, a);
                    navneUnder(ctx, r2, y2, s, a);
                    pil(ctx, 40, y1 - 10, y2 + 10, rgba(FARVE.hvid, 0.85 * a));
                    return;
                }
                pil(ctx, 40, y1 - 10, y2 + 10, rgba(mangler ? FARVE.gul : FARVE.roed, 0.75 * a));
                if (mangler) {
                    var liste = u.mangler.map(function (x) { return tekster[x]; }).join(" og ");
                    tekst(ctx, "Mangler: " + liste, R.x + R.b / 2, y2 - 10, rgba(FARVE.gul, a), 18);
                    tekst(ctx, "Blandingen står stadig i kolben.", R.x + R.b / 2, y2 + 20, rgba(FARVE.svag, a), 15, "600");
                } else {
                    tekst(ctx, "✗  ingen reaktion", R.x + R.b / 2, y2, rgba(FARVE.roed, a), 20);
                }
            }
        };
    }

    /* ----- Tavlen ------------------------------------------------------------------------------- */
    function Tavlen(canvas) {
        this.L = new NK.Laerred(canvas);
        this.spec = { type: "tom" };
        this.plan = null;
        this.t = 0;
        this.noegle = "";
    }

    var P = Tavlen.prototype;

    P.vis = function (spec) {
        this.spec = spec || { type: "tom" };
        this.t = 0;
        this.plan = null;
        this.noegle = "";
    };

    P.faerdig = function () {
        return !this.plan || this.t >= (this.plan.varighed || 0);
    };

    /* Spring til slutningen (selvtest og skaermbilleder) */
    P.spring = function () {
        this.byg();
        if (this.plan) this.t = this.plan.varighed + 1;
    };

    P.byg = function () {
        var W = this.L.b, H = this.L.h;
        var n = W + "x" + H;
        if (this.plan && this.noegle === n) return;
        this.noegle = n;
        var sp = this.spec;
        try {
            if (sp.type === "foer") this.plan = planFoer(sp, W, H);
            else if (sp.type === "udfald") {
                var u = sp.udfald;
                if (u.morf && u.morf.type === "ester" && !u.mangler.length && u.produkt) this.plan = planEster(u, W, H);
                else if (u.morf && u.morf.type === "ox" && !u.mangler.length && u.produkt) this.plan = planOx(u, W, H);
                else this.plan = planStatisk(u, W, H);
            } else this.plan = null;
        } catch (e) {
            if (window.console) console.error("sb4.5 tavlen:", e);
            this.plan = null;
        }
    };

    P.opdater = function (dt) {
        this.t += dt;
    };

    P.tilpas = function () {
        if (this.L.tilpas()) this.noegle = "";
    };

    function blod(t) { return NK.blod(t); }

    /* Billedet til tiden t */
    function nu(plan, t) {
        var f = plan.forloeb;
        if (!f.length || t <= f[0].t0) return { pos: plan.billeder[f.length ? f[0].fra : 0].pos, bd: plan.billeder[f.length ? f[0].fra : 0].bd };
        for (var i = 0; i < f.length; i++) {
            var x = f[i];
            if (t < x.t0) return plan.billeder[x.fra];
            if (t <= x.t1) {
                var u = blod((t - x.t0) / (x.t1 - x.t0));
                var A = plan.billeder[x.fra], B = plan.billeder[x.til];
                var pos = {}, k;
                for (k in A.pos) {
                    var a = A.pos[k], b = B.pos[k] || a;
                    pos[k] = { x: NK.lerp(a.x, b.x, u), y: NK.lerp(a.y, b.y, u), a: NK.lerp(a.a, b.a, u) };
                }
                /* Bindinger: dem i begge, de gamle til midten, de nye fra midten */
                var nA = {}, nB = {}, bd = [];
                A.bd.forEach(function (b) { nA[[b[0], b[1]].sort().join("|")] = b; });
                B.bd.forEach(function (b) { nB[[b[0], b[1]].sort().join("|")] = b; });
                for (k in nA) {
                    if (nB[k]) bd.push(u < 0.5 ? nA[k] : nB[k]);
                    else if (u < 0.45) bd.push([nA[k][0], nA[k][1], nA[k][2], 1 - u / 0.45]);
                }
                for (k in nB) if (!nA[k] && u > 0.55) bd.push([nB[k][0], nB[k][1], nB[k][2], (u - 0.55) / 0.45]);
                return { pos: pos, bd: bd };
            }
        }
        return plan.billeder[f[f.length - 1].til];
    }

    P.tegnBraet = function (ctx, W, H, titel) {
        var g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, "#22302b");
        g.addColorStop(1, "#1b2622");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        if (titel) {
            ctx.font = "700 13px " + FONT;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = FARVE.svag;
            ctx.fillText(titel.toUpperCase(), 14, 10);
        }
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, W = L.b, H = L.h;
        this.byg();
        var plan = this.plan;
        this.tegnBraet(ctx, W, H, plan ? plan.titel : "");
        if (!plan) {
            tekst(ctx, "Læg to stoffer i kolben.", W / 2, H / 2 - 12, rgba(FARVE.svag, 0.9), 17, "600");
            tekst(ctx, "Her på tavlen kan du se, hvad der sker med molekylerne.", W / 2, H / 2 + 16, rgba(FARVE.svag, 0.7), 14, "600");
            return;
        }
        var t = this.t;
        /* Spoegelserne: det, der var foer, svagt */
        (plan.spoegelser || (plan.spoegelse ? [plan.spoegelse] : [])).forEach(function (sp) {
            if (t < sp.t0) return;
            var a = sp.alfa * NK.klamp((t - sp.t0) / Math.max(0.1, sp.t1 - sp.t0), 0, 1);
            var bil = plan.billeder[sp.billede];
            var pos = bil.pos;
            if (sp.kun) {
                pos = {};
                sp.kun.forEach(function (k) { if (bil.pos[k]) pos[k] = bil.pos[k]; });
            }
            tegnBillede(ctx, plan.atomer, pos, bil.bd, plan.s, a);
        });
        var b = nu(plan, t);
        var aInd = NK.klamp(t / 0.35, 0, 1);
        /* De atomer, der skal flytte sig, lyser */
        (plan.lys || []).forEach(function (l) {
            if (t < l.t0 || t > l.t1) return;
            var puls = 0.55 + 0.45 * Math.sin((t - l.t0) * 6);
            var al = NK.klamp((t - l.t0) / 0.3, 0, 1) * NK.klamp((l.t1 - t) / 0.3, 0, 1);
            l.noegler.forEach(function (k) {
                var p = b.pos[k];
                if (!p || p.a < 0.05) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, plan.s * 0.42, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(242, 197, 61, " + (0.32 * puls * al).toFixed(3) + ")";
                ctx.fill();
            });
        });
        tegnBillede(ctx, plan.atomer, b.pos, b.bd, plan.s, aInd);
        if (plan.pynt) {
            ctx.save();
            plan.pynt(ctx, t);
            ctx.restore();
        }
    };

    NK.Tavlen = Tavlen;
    NK.Tavlen.FARVE = FARVE;
}());

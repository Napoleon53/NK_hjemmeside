/* =====================================================================
   struktur.js - tegner et molekyle som i bogen

   To stile:
     "zigzag"  C-atomerne er knaek og ender og tegnes ikke. Andre atomer
               staar med symbol og deres H: OH, NH₂, Cl. Dobbeltbindingens
               anden streg sidder paa indersiden af kaeden eller ringen.
     "alle"    alle atomer med symbol, ogsaa H-atomerne, som i en
               strukturformel. H, der ikke er tegnet, saettes i de frie
               retninger (NK.Layout.hRetninger).

   geometri(mol, valg) laver stregerne og teksterne i pixels. Det samme
   bruges af tegn (canvas) og svg (billede til rapporten), saa skaermen
   og det gemte billede altid er ens.

   valg:
     skala        pixels pr. bindingslaengde
     ox, oy       hvor molekylets (0, 0) staar paa laerredet
     stil         "zigzag" eller "alle"
     farve        stregernes og teksternes farve
     linje        stregbredde (standard efter skala)
     skrift       skriftstoerrelse i px (standard efter skala, mindst 12)
     atomFarve(id), bindingFarve(bd)   farve paa enkelte dele, eller null
     lokanter     { id: nummer } smaa numre ved kaedens atomer
     visC(id)     sand: skriv C ved atomet ogsaa i zigzag (fanen Zigzag)
     objekter     pile og plus fra tegnebraettet: { type: "pil"|"lig"|"plus",
                  x, y, over, under } i bindingslaengder
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var GRAD = Math.PI / 180;
    var FONT = "'Segoe UI', Arial, sans-serif";

    var maaleCtx = null;
    function bredde(tekst, font) {
        if (!maaleCtx) maaleCtx = document.createElement("canvas").getContext("2d");
        maaleCtx.font = font;
        return maaleCtx.measureText(tekst).width;
    }

    /* Grundstoffer, der skriver H foran sig, naar de staar alene: H₂O, HCl */
    var H_FORAN = { O: true, S: true, F: true, Cl: true, Br: true, I: true };

    function hTekst(h) { return h ? "H" + (h > 1 ? NK.saenket(h) : "") : ""; }

    /* Tal lige efter et bogstav bliver saenket: H2SO4 -> H₂SO₄. "25 °C" og
       "2 mol" bliver staaende. */
    function formelTekst(t) {
        return String(t || "").trim().replace(/([A-Za-z\)\]])(\d+)/g, function (m, a, d) { return a + NK.saenket(d); });
    }

    /* En pils laengde i bindingslaengder: mindst 2,4, og altid plads til teksten */
    function pilLaengde(o, s) {
        s = s || 44;
        var fs = NK.klamp(s * 0.36, 12, 30);
        var f = "600 " + Math.max(13, fs * 0.8) + "px " + FONT;
        var b = Math.max(bredde(formelTekst(o.over), f), bredde(formelTekst(o.under), f));
        return Math.max(2.4, (b + s * 0.7) / s);
    }

    function geometri(mol, v) {
        v = v || {};
        var s = v.skala || 44;
        var ox = v.ox || 0, oy = v.oy || 0;
        var stil = v.stil || "zigzag";
        var farve = v.farve || "#1d2433";
        var fs = v.skrift || NK.klamp(s * 0.36, 12, 30);
        var lw = v.linje || NK.klamp(s * 0.05, 1.4, 3.4);
        var font = "600 " + fs + "px " + FONT;
        var fontLille = "600 " + Math.max(12, fs * 0.72) + "px " + FONT;
        var P = {}, etiket = {}, indre = {};
        var linjer = [], tekster = [], billeder = [];

        mol.atomer.forEach(function (a) { P[a.id] = { x: ox + a.x * s, y: oy + a.y * s }; });

        /* ----- Etiketterne ------------------------------------------------- */
        mol.atomer.forEach(function (a) {
            var nb = mol.naboer(a.id);
            var vis = stil === "alle" || a.el !== "C" || !nb.length || (v.visC && v.visC(a.id)) || a.q;
            if (!vis) return;
            var h = stil === "alle" || a.el === "H" ? 0 : mol.implicitH(a.id);
            if (v.visC && v.visC(a.id) && a.el === "C" && nb.length) h = 0;
            var sym = a.el, hT = hTekst(h);
            /* H til venstre, naar bindingerne gaar mod hoejre (HO-, H₂N-) */
            var foran = false;
            if (h) {
                /* Alene: H₂O og HCl, men OH⁻ (en negativ ion) */
                if (!nb.length) foran = !!H_FORAN[a.el] && !(a.q < 0);
                else {
                    var sx = 0;
                    nb.forEach(function (n) { var b = mol.atom(n); sx += b.x - a.x; });
                    foran = sx / nb.length > 0.3;
                }
            }
            var wSym = bredde(sym, font);
            var tekst = foran ? hT + sym : sym + hT;
            var x = P[a.id].x, juster = "center";
            if (hT) {
                if (foran) { x = P[a.id].x + wSym / 2; juster = "right"; }
                else { x = P[a.id].x - wSym / 2; juster = "left"; }
            }
            var farveA = (v.atomFarve && v.atomFarve(a.id)) || farve;
            etiket[a.id] = { r: Math.max(fs * 0.52, wSym / 2 + fs * 0.14) };
            var bT = bredde(tekst, font);
            tekster.push({ x: x, y: P[a.id].y, t: tekst, font: font, farve: farveA, juster: juster,
                b: bT, h: fs });
            /* Ladningen haevet efter atomet, som i bogen: O⁻, NH₄⁺. Staar der
               H efter symbolet, kommer den efter H; ellers i det skraa hjoerne,
               der er laengst fra bindingerne (og H-atomerne, naar alle vises) */
            if (a.q) {
                var qT = NK.ladningstekst(a.q);
                var fl = "600 " + Math.max(12, fs * 0.8) + "px " + FONT;
                var bQ = bredde(qT, fl);
                if (juster === "left" || (!nb.length && stil !== "alle")) {
                    var hoejre = juster === "left" ? x + bT : (juster === "right" ? x : P[a.id].x + bT / 2);
                    tekster.push({ x: hoejre + fs * 0.04, y: P[a.id].y - fs * 0.5, t: qT, font: fl, farve: farveA, juster: "left", b: bQ, h: fs * 0.72 });
                } else {
                    var optaget = nb.map(function (n) { var b = mol.atom(n); return Math.atan2(b.y - a.y, b.x - a.x); });
                    if (stil === "alle") optaget = optaget.concat(NK.Layout.hRetninger(mol, a.id, mol.implicitH(a.id)).map(function (vk) { return vk * GRAD; }));
                    /* Oppe til hoejre, oppe til venstre, nede til hoejre, nede til
                       venstre: det foerste med god luft, ellers det med mest */
                    var bedst = null, bedstAfst = -1;
                    [-45, -135, 45, 135].some(function (g) {
                        var vq = g * GRAD, mind = Math.PI;
                        optaget.forEach(function (o) {
                            var dv = Math.abs(((vq - o) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
                            mind = Math.min(mind, dv);
                        });
                        if (mind > bedstAfst + 0.2) { bedstAfst = mind; bedst = vq; }
                        return mind >= 70 * GRAD;
                    });
                    var rq = Math.max(fs * 0.62, wSym / 2 + fs * 0.3);
                    tekster.push({ x: P[a.id].x + Math.cos(bedst) * rq, y: P[a.id].y + Math.sin(bedst) * rq, t: qT, font: fl, farve: farveA,
                        juster: "center", b: bQ, h: fs * 0.72 });
                }
            }
        });

        /* ----- Bindingerne ------------------------------------------------- */
        function streg(x1, y1, x2, y2, f, b) {
            linjer.push({ x1: x1, y1: y1, x2: x2, y2: y2, farve: f, b: b || lw });
        }

        mol.bindinger.forEach(function (bd) {
            var A = P[bd.a], B = P[bd.b];
            if (!A || !B) return;
            var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy);
            if (L < 1e-6) return;
            var ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
            var ra = etiket[bd.a] ? etiket[bd.a].r : 0, rb = etiket[bd.b] ? etiket[bd.b].r : 0;
            if (ra + rb > L - 2) return;
            var x1 = A.x + ux * ra, y1 = A.y + uy * ra, x2 = B.x - ux * rb, y2 = B.y - uy * rb;
            var f = (v.bindingFarve && v.bindingFarve(bd)) || farve;

            if (bd.orden === 1) { streg(x1, y1, x2, y2, f); return; }
            if (bd.orden === 3) {
                var d3 = s * 0.13;
                streg(x1, y1, x2, y2, f);
                streg(x1 + nx * d3, y1 + ny * d3, x2 + nx * d3, y2 + ny * d3, f);
                streg(x1 - nx * d3, y1 - ny * d3, x2 - nx * d3, y2 - ny * d3, f);
                return;
            }
            /* Dobbeltbinding: paa hvilken side ligger resten af molekylet? */
            var side = 0;
            if (stil === "zigzag" && !etiket[bd.a] && !etiket[bd.b]) {
                [[bd.a, bd.b], [bd.b, bd.a]].forEach(function (par) {
                    mol.naboer(par[0]).forEach(function (n) {
                        if (n === par[1]) return;
                        var C = P[n];
                        var k = dx * (C.y - A.y) - dy * (C.x - A.x);
                        side += k > 0 ? 1 : (k < 0 ? -1 : 0);
                    });
                });
            }
            var sgn = side > 0 ? 1 : (side < 0 ? -1 : 0);
            if (sgn) {
                var d = s * 0.17, kort = s * 0.14;
                /* Den indre streg optager plads ved begge atomer (til numrene) */
                indre[bd.a] = (indre[bd.a] || []).concat(Math.atan2(uy * kort + ny * d * sgn, ux * kort + nx * d * sgn));
                indre[bd.b] = (indre[bd.b] || []).concat(Math.atan2(-uy * kort + ny * d * sgn, -ux * kort + nx * d * sgn));
                streg(x1, y1, x2, y2, f);
                streg(x1 + nx * d * sgn + ux * kort, y1 + ny * d * sgn + uy * kort,
                    x2 + nx * d * sgn - ux * kort, y2 + ny * d * sgn - uy * kort, f);
            } else {
                var d2 = s * 0.085;
                streg(x1 + nx * d2, y1 + ny * d2, x2 + nx * d2, y2 + ny * d2, f);
                streg(x1 - nx * d2, y1 - ny * d2, x2 - nx * d2, y2 - ny * d2, f);
            }
        });

        /* ----- H-atomerne, naar alle atomer vises -------------------------- */
        if (stil === "alle") {
            var rH = Math.max(fs * 0.5, bredde("H", font) / 2 + fs * 0.12);
            var hl = s * (v.hLaengde || 0.64);
            mol.atomer.forEach(function (a) {
                if (a.el === "H") return;
                var h = mol.implicitH(a.id);
                if (!h) return;
                var ra = etiket[a.id] ? etiket[a.id].r : 0;
                var f = (v.atomFarve && v.atomFarve(a.id)) || farve;
                NK.Layout.hRetninger(mol, a.id, h).forEach(function (vk) {
                    var ux = Math.cos(vk * GRAD), uy = Math.sin(vk * GRAD);
                    var hx = P[a.id].x + ux * hl, hy = P[a.id].y + uy * hl;
                    if (hl - ra - rH > 2) streg(P[a.id].x + ux * ra, P[a.id].y + uy * ra, hx - ux * rH, hy - uy * rH, f);
                    tekster.push({ x: hx, y: hy, t: "H", font: font, farve: f, juster: "center", b: bredde("H", font), h: fs });
                });
            });
        }

        /* ----- Numrene paa kaeden ------------------------------------------- */
        if (v.lokanter) {
            /* I det stoerste frie hul ved atomet. Indersiden af kaedens vinkel
               foretraekkes, hvor der aldrig sidder en sidegruppe, men ikke
               naar dobbeltbindingens indre streg sidder der. */
            Object.keys(v.lokanter).forEach(function (k) {
                var id = +k, a = mol.atom(id);
                if (!a) return;
                var sx = 0, sy = 0, optaget = [];
                var kn = mol.naboer(id).filter(function (n) { return v.lokanter[n] !== undefined; });
                kn.forEach(function (n) { var b = mol.atom(n); var l0 = Math.hypot(b.x - a.x, b.y - a.y) || 1; sx += (b.x - a.x) / l0; sy += (b.y - a.y) / l0; });
                mol.naboer(id).forEach(function (n) { var b = mol.atom(n); optaget.push(Math.atan2(b.y - a.y, b.x - a.x)); });
                /* Med alle atomer sidder H-atomerne ogsaa i vejen */
                if (stil === "alle" && mol.implicitH(id)) {
                    NK.Layout.hRetninger(mol, id, mol.implicitH(id)).forEach(function (vk) {
                        var r = vk * GRAD;
                        optaget.push(r > Math.PI ? r - 2 * Math.PI : r);
                    });
                }
                var nIndre = (indre[id] || []).length;
                optaget = optaget.concat(indre[id] || []).sort(function (p, q) { return p - q; });
                var ind = Math.hypot(sx, sy) > 0.2 && kn.length >= 2 ? Math.atan2(sy, sx) : null;
                var bedst = null;
                if (!optaget.length) bedst = -Math.PI / 2;
                else {
                    var score = -1;
                    optaget.forEach(function (st, j) {
                        var slut = j + 1 < optaget.length ? optaget[j + 1] : optaget[0] + 2 * Math.PI;
                        var gab = slut - st, midt = st + gab / 2;
                        var sc = gab;
                        if (ind !== null && !nIndre) {
                            var dv = Math.abs(((ind - midt) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
                            if (dv < gab / 2) sc += 2.3;
                        }
                        if (sc > score + 1e-6) { score = sc; bedst = midt; }
                    });
                }
                var ux = Math.cos(bedst), uy = Math.sin(bedst);
                var afst = etiket[id] ? etiket[id].r + fs * 0.5 : fs * 0.95;
                tekster.push({ x: P[id].x + ux * afst, y: P[id].y + uy * afst, t: String(v.lokanter[k]),
                    font: fontLille, farve: v.lokantFarve || "#8a93a3", juster: "center",
                    b: bredde(String(v.lokanter[k]), fontLille), h: fs * 0.72 });
            });
        }

        /* ----- Pile og plus (tegnebraettet) ---------------------------------- */
        if (v.objekter && v.objekter.length) {
            var oFont = "600 " + Math.max(13, fs * 0.8) + "px " + FONT;
            var plusFont = "600 " + Math.round(fs * 1.35) + "px " + FONT;
            v.objekter.forEach(function (o) {
                var cx = ox + o.x * s, cy = oy + o.y * s;
                if (o.type === "klister") {
                    /* Et klistermærke fra Kemichaels skuffe (klistermaerker.js) */
                    var k = NK.Skuffe && NK.Skuffe.klister(o.navn);
                    if (!k) return;
                    var bb = k.bredde * (o.skala || 1) * s, hh = bb * k.h / k.b;
                    billeder.push({ x: cx - bb / 2, y: cy - hh / 2, b: bb, h: hh, navn: o.navn });
                    return;
                }
                if (o.type === "plus") {
                    tekster.push({ x: cx, y: cy, t: "+", font: plusFont, farve: farve, juster: "center", b: bredde("+", plusFont), h: fs * 1.35 });
                    return;
                }
                var L = pilLaengde(o, s) * s, x1 = cx - L / 2, x2 = cx + L / 2;
                var hl = s * 0.24, hv = 0.45;
                if (o.type === "lig") {
                    var d = s * 0.08;
                    streg(x1, cy - d, x2, cy - d, farve);
                    streg(x2, cy - d, x2 - hl * Math.cos(hv), cy - d - hl * Math.sin(hv), farve);
                    streg(x1, cy + d, x2, cy + d, farve);
                    streg(x1, cy + d, x1 + hl * Math.cos(hv), cy + d + hl * Math.sin(hv), farve);
                } else {
                    streg(x1, cy, x2, cy, farve);
                    streg(x2, cy, x2 - hl * Math.cos(hv), cy - hl * Math.sin(hv), farve);
                    streg(x2, cy, x2 - hl * Math.cos(hv), cy + hl * Math.sin(hv), farve);
                }
                [["over", -1], ["under", 1]].forEach(function (f) {
                    var t = formelTekst(o[f[0]]);
                    if (!t) return;
                    tekster.push({ x: cx, y: cy + f[1] * s * 0.36, t: t, font: oFont, farve: farve, juster: "center",
                        b: bredde(t, oFont), h: Math.max(13, fs * 0.8) });
                });
            });
        }

        /* ----- Graenserne ----------------------------------------------------- */
        var x0 = Infinity, y0 = Infinity, x1b = -Infinity, y1b = -Infinity;
        function med(x, y) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1b = Math.max(x1b, x); y1b = Math.max(y1b, y); }
        linjer.forEach(function (l) { med(l.x1, l.y1); med(l.x2, l.y2); });
        tekster.forEach(function (t) {
            var xa = t.juster === "left" ? t.x : (t.juster === "right" ? t.x - t.b : t.x - t.b / 2);
            med(xa, t.y - t.h * 0.6);
            med(xa + t.b, t.y + t.h * 0.6);
        });
        mol.atomer.forEach(function (a) { med(P[a.id].x, P[a.id].y); });
        billeder.forEach(function (bi) { med(bi.x, bi.y); med(bi.x + bi.b, bi.y + bi.h); });
        if (!isFinite(x0)) { x0 = y0 = x1b = y1b = 0; }
        return { linjer: linjer, tekster: tekster, billeder: billeder, P: P, x0: x0, y0: y0, x1: x1b, y1: y1b, lw: lw, fs: fs };
    }

    /* ----- Canvas ---------------------------------------------------------------- */
    function tegnGeo(ctx, g) {
        ctx.save();
        ctx.lineCap = "round";
        g.linjer.forEach(function (l) {
            ctx.strokeStyle = l.farve;
            ctx.lineWidth = l.b;
            ctx.beginPath();
            ctx.moveTo(l.x1, l.y1);
            ctx.lineTo(l.x2, l.y2);
            ctx.stroke();
        });
        ctx.textBaseline = "middle";
        g.tekster.forEach(function (t) {
            ctx.font = t.font;
            ctx.fillStyle = t.farve;
            ctx.textAlign = t.juster;
            ctx.fillText(t.t, t.x, t.y + t.h * 0.04);
        });
        /* Klistermaerkerne ligger oven paa stregerne */
        (g.billeder || []).forEach(function (bi) {
            var img = NK.Skuffe && NK.Skuffe.billede(bi.navn);
            if (img) ctx.drawImage(img, bi.x, bi.y, bi.b, bi.h);
        });
        ctx.restore();
    }

    function tegn(ctx, mol, v) {
        var g = geometri(mol, v);
        tegnGeo(ctx, g);
        return g;
    }

    /* ----- Rammen om et billede --------------------------------------------------------
       ekstra.undertekst er en tekst midt under det hele eller en liste
       [{ x, t }] med et navn under hvert molekyle (x i bindingslaengder). */
    function ramme(g, v, ekstra, padStd) {
        var pad = ekstra.pad === undefined ? padStd : ekstra.pad;
        var uFs = Math.max(13, g.fs * 0.9), uFont = "600 " + uFs + "px " + FONT;
        var x0 = g.x0 - pad, x1 = g.x1 + pad, y0 = g.y0 - pad, y1 = g.y1 + pad;
        var under = [], u = ekstra.undertekst;
        if (u && u.length) {
            var y = g.y1 + pad + uFs * 0.8;
            var bund = y1;
            (typeof u === "string" ? [{ t: u }] : u).forEach(function (n) {
                var w = bredde(n.t, uFont);
                var cx = n.x === undefined || n.x === null ? (g.x0 + g.x1) / 2 : (v.ox || 0) + n.x * (v.skala || 44);
                /* Med y (molekylets bund i bindingslaengder) staar navnet lige under molekylet */
                var cy = n.y === undefined || n.y === null ? y : (v.oy || 0) + n.y * (v.skala || 44) + uFs * 0.9;
                x0 = Math.min(x0, cx - w / 2 - pad);
                x1 = Math.max(x1, cx + w / 2 + pad);
                bund = Math.max(bund, cy + uFs * 0.7 + pad);
                under.push({ x: cx, y: cy, t: n.t });
            });
            y1 = bund;
        }
        return { x0: x0, y0: y0, b: x1 - x0, h: y1 - y0, uFs: uFs, uFont: uFont, under: under };
    }

    /* ----- SVG -----------------------------------------------------------------------
       ekstra: { pad, baggrund, undertekst, metadata: { id, tekst } }. metadata
       kommer med i filen som <metadata id="..."> (tegnebraettets tegning) */
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    function svg(mol, v, ekstra) {
        ekstra = ekstra || {};
        var g = geometri(mol, v);
        var r = ramme(g, v, ekstra, 12);
        var d = [];
        d.push('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="' + [r.x0, r.y0, r.b, r.h].map(function (t) { return +t.toFixed(2); }).join(" ") +
            '" width="' + Math.round(r.b) + '" height="' + Math.round(r.h) + '">');
        if (ekstra.metadata) d.push('<metadata id="' + esc(ekstra.metadata.id) + '">' + esc(ekstra.metadata.tekst) + '</metadata>');
        if (ekstra.baggrund) d.push('<rect x="' + r.x0.toFixed(2) + '" y="' + r.y0.toFixed(2) + '" width="' + r.b.toFixed(2) + '" height="' + r.h.toFixed(2) + '" fill="' + ekstra.baggrund + '"/>');
        d.push('<g stroke-linecap="round">');
        g.linjer.forEach(function (l) {
            d.push('<line x1="' + l.x1.toFixed(2) + '" y1="' + l.y1.toFixed(2) + '" x2="' + l.x2.toFixed(2) + '" y2="' + l.y2.toFixed(2) +
                '" stroke="' + l.farve + '" stroke-width="' + l.b.toFixed(2) + '"/>');
        });
        d.push("</g>");
        function tekst(x, y, str, farve, anker, t) {
            d.push('<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" font-family="Segoe UI, Arial, sans-serif" font-weight="600" font-size="' +
                str + '" fill="' + farve + '" text-anchor="' + anker + '" dominant-baseline="central">' + esc(t) + "</text>");
        }
        g.tekster.forEach(function (t) {
            var m = /^600 ([\d.]+)px/.exec(t.font);
            tekst(t.x, t.y + t.h * 0.04, m ? m[1] : 16, t.farve, t.juster === "left" ? "start" : (t.juster === "right" ? "end" : "middle"), t.t);
        });
        r.under.forEach(function (u) { tekst(u.x, u.y, r.uFs.toFixed(1), v.farve || "#1d2433", "middle", u.t); });
        (g.billeder || []).forEach(function (bi) {
            var adr = NK.Skuffe ? NK.Skuffe.dataAdresse(bi.navn) : "";
            if (adr) d.push('<image x="' + bi.x.toFixed(2) + '" y="' + bi.y.toFixed(2) + '" width="' + bi.b.toFixed(2) + '" height="' + bi.h.toFixed(2) +
                '" href="' + adr.replace(/"/g, "%22") + '" xlink:href="' + adr.replace(/"/g, "%22") + '"/>');
        });
        d.push("</svg>");
        return d.join("");
    }

    /* ----- Et billede til rapporten: hvid baggrund, sort streg, hoej oploesning ---- */
    function billede(mol, v, ekstra) {
        ekstra = ekstra || {};
        var g = geometri(mol, v);
        var r = ramme(g, v, ekstra, 14);
        var faktor = ekstra.faktor || 3;
        var c = document.createElement("canvas");
        c.width = Math.ceil(r.b * faktor);
        c.height = Math.ceil(r.h * faktor);
        var ctx = c.getContext("2d");
        ctx.scale(faktor, faktor);
        ctx.fillStyle = ekstra.baggrund || "#ffffff";
        ctx.fillRect(0, 0, r.b, r.h);
        ctx.translate(-r.x0, -r.y0);
        tegnGeo(ctx, g);
        ctx.font = r.uFont;
        ctx.fillStyle = v.farve || "#1d2433";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        r.under.forEach(function (u) { ctx.fillText(u.t, u.x, u.y); });
        return c;
    }

    NK.Struktur = {
        geometri: geometri,
        tegnGeo: tegnGeo,
        tegn: tegn,
        svg: svg,
        billede: billede,
        pilLaengde: pilLaengde,
        formelTekst: formelTekst,
        FONT: FONT
    };
}());

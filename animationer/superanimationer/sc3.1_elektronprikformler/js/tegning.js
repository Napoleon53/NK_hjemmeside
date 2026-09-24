/* =====================================================================
   tegning.js - alt der tegnes: elektronprikformlerne, stregformel-
   panelet og sejrskonfetti.

   Et atom tegnes som i laerebogen: grundstofsymbolet med
   valenselektronerne på fire sider, hoejst to på hver side. Frie atomer
   faar én elektron på hver side, foer de parres, saa de uparrede
   elektroner - dem der kan indgaa i bindinger - kan ses. Et bundet atom
   drejer sine fire sider, saa bindingerne ligger på hver sin side, og de
   frie elektroner fylder resten saa symmetrisk som muligt.

   Funktionerne til placering af elektroner bruger ikke canvas, saa
   _lav_sprites.js kan tegne sprites med nøjagtig de samme regler.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var FONT_PX = 32;
    var PRIK_R = 3.2;
    var PAR_AFSTAND = 4.6;        /* halv afstand mellem de to prikker i et par */
    var KOLONNE = 9;              /* afstand mellem prikparrene i en dobbelt- eller tripelbinding */
    var AFSTAND_TIL_SYMBOL = 8;
    var KVART = Math.PI / 2;
    var HEL = Math.PI * 2;
    var MAKS_SKAEVHED = 40 * Math.PI / 180;

    NK.BINDINGSLAENGDE = 78;
    NK.SYMBOL_FONT = FONT_PX;
    NK.PRIK_R = PRIK_R;

    NK.symbolHalvdel = function (symbol) {
        return { b: FONT_PX * (symbol.length > 1 ? 0.52 : 0.37), h: FONT_PX * 0.36 };
    };

    /* Frie elektroner fordelt på par og uparrede. Et frit atom har
       min(v, 8 - v) uparrede elektroner; hver bindingsorden bruger én. */
    NK.frieElektroner = function (z, bindingssum) {
        var v = NK.ELEMENTER[z].v;
        var frie = Math.max(0, v - bindingssum);
        var enlige = Math.max(0, Math.min(v, 8 - v) - bindingssum);
        if ((frie - enlige) % 2) enlige++;
        return { frie: frie, par: (frie - enlige) / 2, enlige: enlige };
    };

    /* Hvor mange elektroner ses omkring atomet lige nu, og hvor mange
       skal der til for oktet- (eller duet-) reglen. Har atomet a.frie,
       er det tegnet med netop saa mange frie elektroner (Kemichaels
       tegninger paa fanen Find fejlen); ellers regnes de ud. */
    NK.atomStatus = function (state, a) {
        var bindingssum = 0;
        state.bindinger.forEach(function (b) {
            if (b.s === a || b.t === a) bindingssum += b.orden;
        });
        var frie = a.frie !== undefined ? a.frie : NK.frieElektroner(a.z, bindingssum).frie;
        var nu = frie + 2 * bindingssum;
        var maal = (a.z === 1) ? 2 : 8;
        return { nu: nu, maal: maal, stabil: nu === maal, frie: frie, bindingssum: bindingssum };
    };

    /* ----- Placering af de frie elektroner ------------------------------ */
    function vinkelForskel(a, b) {
        var d = Math.abs(a - b) % HEL;
        return d > Math.PI ? HEL - d : d;
    }

    /* Alle måder at give n bindinger hver sin af de fire sider. */
    var TILDELINGER = [[[]]];
    function udvid(forrige) {
        var ud = [];
        forrige.forEach(function (perm) {
            for (var k = 0; k < 4; k++) if (perm.indexOf(k) < 0) ud.push(perm.concat(k));
        });
        return ud;
    }
    for (var n = 1; n <= 4; n++) TILDELINGER[n] = udvid(TILDELINGER[n - 1]);

    /* Drej de fire sider, saa bindingerne rammer hver sin side med mindst
       mulig skaevhed. null, hvis bindingerne ligger for taet til det. */
    function tilpasKryds(vinkler) {
        var nb = vinkler.length;
        if (nb === 0) return { phi: 0, pladser: [] };
        if (nb > 4) return null;
        var bedst = null;
        for (var g = 0; g < 90; g++) {
            var phi = g * Math.PI / 180;
            var perms = TILDELINGER[nb];
            for (var p = 0; p < perms.length; p++) {
                var maks = 0, sum = 0;
                for (var i = 0; i < nb; i++) {
                    var d = vinkelForskel(vinkler[i], phi + perms[p][i] * KVART);
                    if (d > maks) maks = d;
                    sum += d;
                }
                var score = maks * 1000 + sum;
                if (!bedst || score < bedst.score) bedst = { score: score, maks: maks, phi: phi, pladser: perms[p] };
            }
        }
        return bedst.maks <= MAKS_SKAEVHED ? bedst : null;
    }

    function arrangementer(n, par, enlige) {
        var ud = [];
        (function byg(pre, p, e, t) {
            if (pre.length === n) { ud.push(pre); return; }
            if (p > 0) byg(pre.concat("P"), p - 1, e, t);
            if (e > 0) byg(pre.concat("S"), p, e - 1, t);
            if (t > 0) byg(pre.concat("E"), p, e, t - 1);
        }([], par, enlige, n - par - enlige));
        return ud;
    }

    /* Fordel par (P), uparrede (S) og tomme sider (E) på de frie sider.
       Foretrukket: spejlsymmetri om en akse gennem atomet; derefter
       uparrede elektroner vandret, saa et frit O ser ud som i bogen. */
    function fordelIKryds(kryds, par, enlige) {
        var frieSider = [0, 1, 2, 3].filter(function (k) { return kryds.pladser.indexOf(k) < 0; });
        if (par + enlige > frieSider.length) return null;
        var bedst = null;
        arrangementer(frieSider.length, par, enlige).forEach(function (arr) {
            var indhold = ["B", "B", "B", "B"];
            frieSider.forEach(function (k, i) { indhold[k] = arr[i]; });

            /* Spejling i aksen phi + m*45° sender side k over i side m - k. */
            var asym = 4;
            for (var m = 0; m < 4; m++) {
                var fejl = 0;
                for (var k = 0; k < 4; k++) if (indhold[k] !== indhold[(m - k + 4) % 4]) fejl++;
                if (fejl < asym) asym = fejl;
            }

            var vandret = 0;
            frieSider.forEach(function (k, i) {
                if (arr[i] !== "S") return;
                var v = kryds.phi + k * KVART;
                vandret += Math.cos(v) * Math.cos(v) + 0.1 * Math.cos(v) + 0.01 * Math.sin(v);
            });

            var score = asym * 10 - vandret;
            if (!bedst || score < bedst.score) bedst = { score: score, indhold: indhold };
        });

        var domaener = [];
        bedst.indhold.forEach(function (t, k) {
            if (t === "P" || t === "S") domaener.push({ vinkel: kryds.phi + k * KVART, antal: t === "P" ? 2 : 1 });
        });
        return domaener;
    }

    /* Noedloesning, naar bindingerne ikke passer på fire sider: læg
       elektronerne jævnt i de største huller mellem bindingerne. */
    function fordelIHuller(vinkler, par, enlige) {
        var sorteret = vinkler.map(function (v) { return ((v % HEL) + HEL) % HEL; })
            .sort(function (a, b) { return a - b; });
        var huller = sorteret.map(function (v, i) {
            var naeste = i + 1 < sorteret.length ? sorteret[i + 1] : sorteret[0] + HEL;
            return { start: v, laengde: naeste - v, antal: 0 };
        });
        for (var i = 0; i < par + enlige; i++) {
            var valgt = huller[0];
            huller.forEach(function (h) {
                if (h.laengde / (h.antal + 2) > valgt.laengde / (valgt.antal + 2)) valgt = h;
            });
            valgt.antal++;
        }
        var domaener = [];
        huller.forEach(function (h) {
            for (var j = 1; j <= h.antal; j++) {
                domaener.push({ vinkel: h.start + h.laengde * j / (h.antal + 1), antal: domaener.length < par ? 2 : 1 });
            }
        });
        return domaener;
    }

    /* frie (frivillig): tegn netop saa mange frie elektroner, parret
       saa vidt muligt, i stedet for dem, atomet selv har tilbage. */
    NK.elektronDomaener = function (z, bindingsvinkler, bindingssum, frie) {
        var fe = frie !== undefined
            ? { par: Math.floor(frie / 2), enlige: frie % 2 }
            : NK.frieElektroner(z, bindingssum);
        if (fe.par + fe.enlige === 0) return [];
        var kryds = tilpasKryds(bindingsvinkler);
        return (kryds && fordelIKryds(kryds, fe.par, fe.enlige)) ||
            fordelIHuller(bindingsvinkler, fe.par, fe.enlige);
    };

    /* Prikkernes placering i forhold til atomets centrum. Afstanden
       foelger en ellipse om symbolet, saa Br ikke faar prikker i bogstaverne. */
    NK.prikkerOmAtom = function (symbol, domaener) {
        var halv = NK.symbolHalvdel(symbol);
        var rx = halv.b + AFSTAND_TIL_SYMBOL, ry = halv.h + AFSTAND_TIL_SYMBOL;
        var prikker = [];
        domaener.forEach(function (d) {
            var c = Math.cos(d.vinkel), s = Math.sin(d.vinkel);
            var r = 1 / Math.sqrt((c / rx) * (c / rx) + (s / ry) * (s / ry));
            var x = c * r, y = s * r;
            if (d.antal === 2) {
                prikker.push({ x: x - s * PAR_AFSTAND, y: y + c * PAR_AFSTAND });
                prikker.push({ x: x + s * PAR_AFSTAND, y: y - c * PAR_AFSTAND });
            } else {
                prikker.push({ x: x, y: y });
            }
        });
        return prikker;
    };

    /* Bindingens elektronpar midt mellem atomerne. l: langs bindingen,
       p: på tværs af den. */
    NK.bindingsprikker = function (orden) {
        var kolonner = orden === 1 ? [0] : orden === 2 ? [-KOLONNE / 2, KOLONNE / 2] : [-KOLONNE, 0, KOLONNE];
        var prikker = [];
        kolonner.forEach(function (l) {
            prikker.push({ l: l, p: -PAR_AFSTAND }, { l: l, p: PAR_AFSTAND });
        });
        return prikker;
    };

    /* Retning til elektrontaelleren: midt i et hul mellem bindinger og
       frie elektroner. Alle huller på mindst 90° er plads nok; blandt dem
       vinder det, der ligger laengst fra bindingerne, og derefter nedad.
       Et frit atom har taelleren lige under sig. */
    function pladsTilTaeller(bindingsvinkler, domaener) {
        if (!bindingsvinkler.length) return KVART;
        var alle = bindingsvinkler.concat(domaener.map(function (d) { return d.vinkel; }))
            .map(function (v) { return ((v % HEL) + HEL) % HEL; })
            .sort(function (a, b) { return a - b; });
        var bedst = null;
        alle.forEach(function (v, i) {
            var naeste = i + 1 < alle.length ? alle[i + 1] : alle[0] + HEL;
            var midt = v + (naeste - v) / 2;
            var tilBinding = Math.min.apply(null, bindingsvinkler.map(function (b) { return vinkelForskel(midt, b); }));
            var score = Math.min(naeste - v, KVART) * 10000 + tilBinding * 10 - vinkelForskel(midt, KVART);
            if (!bedst || score > bedst.score) bedst = { score: score, midt: midt };
        });
        return bedst.midt;
    }

    function prik(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, PRIK_R, 0, HEL);
        ctx.fill();
    }

    /* ----- Hvor hver prik sidder ------------------------------------------
       Bindingernes elektronpar og hvert atoms frie elektroner. Bruges baade
       til tegningen og til at taelle med, saa de to aldrig er uenige. */
    NK.prikLayout = function (state) {
        var ud = { bindinger: [], atomer: {}, info: {} };
        state.bindinger.forEach(function (b, i) {
            var dx = b.t.x - b.s.x, dy = b.t.y - b.s.y;
            var len = Math.hypot(dx, dy) || 1;
            var ux = dx / len, uy = dy / len;
            var mx = (b.s.x + b.t.x) / 2, my = (b.s.y + b.t.y) / 2;
            ud.bindinger[i] = NK.bindingsprikker(b.orden).map(function (p) {
                return { x: mx + ux * p.l - uy * p.p, y: my + uy * p.l + ux * p.p };
            });
        });
        state.atomer.forEach(function (a) {
            var st = NK.atomStatus(state, a);
            var vinkler = [];
            state.bindinger.forEach(function (b) {
                if (b.s === a) vinkler.push(Math.atan2(b.t.y - a.y, b.t.x - a.x));
                else if (b.t === a) vinkler.push(Math.atan2(b.s.y - a.y, b.s.x - a.x));
            });
            var symbol = NK.ELEMENTER[a.z].s;
            var domaener = NK.elektronDomaener(a.z, vinkler, st.bindingssum, a.frie);
            ud.atomer[a.id] = NK.prikkerOmAtom(symbol, domaener).map(function (p) {
                return { x: a.x + p.x, y: a.y + p.y };
            });
            ud.info[a.id] = { st: st, vinkler: vinkler, domaener: domaener, symbol: symbol };
        });
        return ud;
    };

    /* Alle prikker, der taeller med hos atomet: dets egne frie elektroner
       og begge elektroner i hver af dets bindinger. Raekkefoelgen gaar med
       uret rundt om atomet fra toppen, saa en optaelling kan foelges. */
    NK.atometsPrikker = function (state, a, layout) {
        layout = layout || NK.prikLayout(state);
        var alle = layout.atomer[a.id].slice();
        state.bindinger.forEach(function (b, i) {
            if (b.s === a || b.t === a) alle = alle.concat(layout.bindinger[i]);
        });
        function vinkel(p) {
            var v = Math.atan2(p.y - a.y, p.x - a.x) + KVART;
            return ((v % HEL) + HEL) % HEL;
        }
        return alle.sort(function (p, q) { return vinkel(p) - vinkel(q); });
    };

    /* Samme ellipse om symbolet som prikkerne, bare laengere ude. */
    function etiketPunkt(a, info) {
        var retning = pladsTilTaeller(info.vinkler, info.domaener);
        var halv = NK.symbolHalvdel(info.symbol);
        var c = Math.cos(retning), sn = Math.sin(retning);
        var rx = halv.b + 44, ry = halv.h + 33;
        var r = 1 / Math.sqrt((c / rx) * (c / rx) + (sn / ry) * (sn / ry));
        return { x: a.x + c * r, y: a.y + sn * r };
    }

    var RING = { roed: "#e05446", groen: "#3fae72", gul: "#f2c53d", blaa: "#3d9ee0" };
    var ETIKET = { roed: "#f0918a", groen: "#7ee0a8", gul: "#f2c53d", hvid: "#f2f3f5" };

    function ring(ctx, a, farve, gloed) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + 4, 0, HEL);
        ctx.strokeStyle = farve;
        ctx.lineWidth = 3;
        if (gloed) { ctx.shadowColor = farve; ctx.shadowBlur = 16; }
        ctx.stroke();
        ctx.restore();
    }

    function etiket(ctx, tekst, p, farve) {
        ctx.save();
        ctx.font = "600 14px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#14141a";
        ctx.strokeText(tekst, p.x, p.y);
        ctx.fillStyle = farve;
        ctx.fillText(tekst, p.x, p.y);
        ctx.restore();
    }

    /* ----- Hovedlaerredet ------------------------------------------------
       vis styrer det, der ligger oven paa selve prikformlen:
         snap, hover, traek  atomer, der er ramt af musen (byggefanen)
         taeller             elektrontallet ved hvert atom (kun paa bestilling)
         stabilGroen         symbolet bliver groent, naar atomet har oktet
         ringe               { id: "roed" | "groen" | "gul" | "blaa" }
         etiketter           { id: { tekst, farve } } ved siden af atomet
         taelling            { id, n, faerdig }: de foerste n prikker om
                             atomet lyser op, og tallet staar ved siden af */
    NK.tegnSpil = function (ctx, state, vis) {
        vis = vis || {};
        var layout = NK.prikLayout(state);

        state.bindinger.forEach(function (b) {
            var dx = b.t.x - b.s.x, dy = b.t.y - b.s.y;
            var len = Math.hypot(dx, dy) || 1;
            var ux = dx / len, uy = dy / len;

            /* Er atomerne trukket langt fra hinanden, viser en svag streg,
               at bindingen stadig findes. */
            if (len > NK.BINDINGSLAENGDE * 1.35) {
                ctx.save();
                ctx.strokeStyle = "rgba(242, 197, 61, 0.25)";
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 5]);
                ctx.beginPath();
                ctx.moveTo(b.s.x + ux * 24, b.s.y + uy * 24);
                ctx.lineTo(b.t.x - ux * 24, b.t.y - uy * 24);
                ctx.stroke();
                ctx.restore();
            }
        });

        state.atomer.forEach(function (a) {
            var farve = vis.ringe && vis.ringe[a.id];
            if (a === vis.snap) {
                ring(ctx, a, RING.blaa, true);
            } else if (farve) {
                ring(ctx, a, RING[farve], farve !== "groen");
            } else if (a === vis.hover || a === vis.traek) {
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r + 4, 0, HEL);
                ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                ctx.fill();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });

        ctx.fillStyle = "#f2c53d";
        layout.bindinger.forEach(function (prikker) {
            prikker.forEach(function (p) { prik(ctx, p.x, p.y); });
        });

        state.atomer.forEach(function (a) {
            var info = layout.info[a.id];
            ctx.font = "700 " + FONT_PX + "px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = vis.stabilGroen && info.st.stabil ? "#7ee0a8" : "#f2f3f5";
            ctx.fillText(info.symbol, a.x, a.y + 1);

            ctx.fillStyle = "#f2c53d";
            layout.atomer[a.id].forEach(function (p) { prik(ctx, p.x, p.y); });
        });

        /* Optaellingen: de talte prikker lyser op én ad gangen. */
        var t = vis.taelling;
        var talt = t && state.atomer.filter(function (a) { return a.id === t.id; })[0];
        if (talt) {
            var prikker = NK.atometsPrikker(state, talt, layout);
            var n = Math.min(prikker.length, Math.floor(t.n));
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#9fd8ff";
            ctx.shadowBlur = 10;
            for (var i = 0; i < n; i++) {
                ctx.beginPath();
                ctx.arc(prikker[i].x, prikker[i].y, PRIK_R + 1.3, 0, HEL);
                ctx.fill();
            }
            ctx.restore();
        }

        state.atomer.forEach(function (a) {
            var info = layout.info[a.id];
            var tekst = null, farve = null;
            if (talt === a) {
                var st = info.st;
                tekst = Math.min(st.nu, Math.floor(t.n)) + " e" + NK.haevet("-");
                farve = !t.faerdig ? ETIKET.hvid : (st.stabil ? ETIKET.groen : ETIKET.roed);
            } else if (vis.etiketter && vis.etiketter[a.id]) {
                tekst = vis.etiketter[a.id].tekst;
                farve = ETIKET[vis.etiketter[a.id].farve] || ETIKET.hvid;
            } else if (vis.taeller) {
                tekst = info.st.nu + "/" + info.st.maal + " e" + NK.haevet("-");
                farve = info.st.stabil ? ETIKET.groen : ETIKET.roed;
            }
            if (tekst) etiket(ctx, tekst, etiketPunkt(a, info), farve);
        });

        var partikler = state.partikler || [];
        for (var k = partikler.length - 1; k >= 0; k--) {
            var p = partikler[k];
            p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.liv -= 0.02;
            ctx.globalAlpha = Math.max(0, p.liv);
            ctx.fillStyle = p.farve;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.stoerrelse, 0, HEL); ctx.fill();
            ctx.globalAlpha = 1;
            if (p.liv <= 0) partikler.splice(k, 1);
        }
    };

    /* ----- Stregformel-panelet: samme struktur som eleven bygger,
       tegnet efter molekylets rigtige bindingsvinkler ------------------ */
    var LINJE_ATOM_R = 17;
    var LINJE_BOND = 52;

    NK.tegnStregformel = function (ctx, w, h, opgave, geometri, state) {
        ctx.clearRect(0, 0, w, h);
        var cx = w / 2, cy = h / 2 - 10;

        var pos = [];
        if (geometri.type === "kaede") {
            var antal = opgave.atomer.length;
            opgave.atomer.forEach(function (z, i) {
                pos[i] = { x: cx + (i - (antal - 1) / 2) * LINJE_BOND, y: cy };
            });
        } else {
            pos[geometri.hub] = { x: cx, y: cy };
            Object.keys(geometri.vinkler).forEach(function (idxStr) {
                var rad = geometri.vinkler[idxStr] * Math.PI / 180;
                pos[+idxStr] = { x: cx + Math.cos(rad) * LINJE_BOND, y: cy + Math.sin(rad) * LINJE_BOND };
            });
        }

        /* Atomer uden bindinger endnu ligger loest i en raekke i stedet
           for paa deres "rigtige" plads. */
        var bindingssum = {};
        state.atomer.forEach(function (a) { bindingssum[a.id] = 0; });
        state.bindinger.forEach(function (b) { bindingssum[b.s.id] += b.orden; bindingssum[b.t.id] += b.orden; });

        var loese = state.atomer.filter(function (a) { return bindingssum[a.id] === 0; });
        loese.forEach(function (a, k) {
            pos[a.id] = { x: cx + (k - (loese.length - 1) / 2) * 46, y: cy + 62 };
        });

        ctx.strokeStyle = "#7e8590";
        ctx.lineWidth = 2;
        state.bindinger.forEach(function (b) {
            var p1 = pos[b.s.id], p2 = pos[b.t.id];
            var dx = p2.x - p1.x, dy = p2.y - p1.y;
            var len = Math.hypot(dx, dy) || 1;
            var ux = dx / len, uy = dy / len;
            var a1 = { x: p1.x + ux * LINJE_ATOM_R, y: p1.y + uy * LINJE_ATOM_R };
            var a2 = { x: p2.x - ux * LINJE_ATOM_R, y: p2.y - uy * LINJE_ATOM_R };
            var ox = -uy * 3, oy = ux * 3;
            var offsets = b.orden === 1 ? [0] : b.orden === 2 ? [-1, 1] : [-1.6, 0, 1.6];
            offsets.forEach(function (m) {
                ctx.beginPath();
                ctx.moveTo(a1.x + ox * m, a1.y + oy * m);
                ctx.lineTo(a2.x + ox * m, a2.y + oy * m);
                ctx.stroke();
            });
        });

        ctx.font = "bold 22px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#f2f3f5";
        state.atomer.forEach(function (a) {
            var p = pos[a.id];
            ctx.fillText(NK.ELEMENTER[a.z].s, p.x, p.y);
        });
    };
}());

/* =====================================================================
   navngivning.js - IUPAC-navne paa gymnasiets organiske stoffer

   NK.Navn.analyser(mol, ids) giver navnet paa et sammenhaengende molekyle
   og det, navnet bygger paa: hovedkaeden (eller ringen) i nummereringens
   raekkefoelge, sidegrupperne med lokanter, dobbelt- og tripelbindingerne,
   cis/trans og stofklassen. Det er den eneste autoritet for, hvad et
   molekyle hedder. Tegnebraettet, navnelaeseren og quizzerne i sc6.2
   bruger alle den samme funktion, saa det, der tegnes, og det, eleven
   skal ramme, aldrig kan komme i modstrid.

   Hvad der navngives:
     carbonhydrider: alkaner, alkener, alkyner og kombinationer
       (buta-1,3-dien, but-1-en-3-yn), én ring (cyclohexan,
       3-methylcyclohexen, methylbenzen)
     halogenforbindelser (fluor, chlor, brom, iod)
     de funktionelle grupper (25. sept. 2026):
       carboxylsyre  -syre          ethansyre, butandisyre, benzoesyre,
                                    2-hydroxypropan-1,2,3-tricarboxylsyre
       ester         alkyl + -oat   ethylethanoat, methylbenzoat
       amid          -amid          ethanamid, N-methylethanamid, urinstof
       aldehyd       -al            ethanal, benzaldehyd
       keton         -on            propanon, pentan-2-on, cyclohexanon
       alkohol       -ol            propan-2-ol, ethan-1,2-diol, phenol
       amin          alkyl + amin   ethylamin, dimethylamin, propan-2-amin
       ether         alkyl + ether  diethylether, methoxybenzen
       carboxylat-ion  -oat         ethanoat (CH₃COO⁻), butandioat, benzoat
         (den korresponderende base til en carboxylsyre; saa er alle
         syregrupperne paa molekylet uden H, og der er ingen andre ladninger)
     Den vigtigste gruppe giver endelsen (raekkefoelgen ovenfor); de andre
     staar foran: hydroxy, oxo, amino, methoxy, carboxy, formyl, acetyl,
     (acetyloxy), (methoxycarbonyl), carbamoyl, phenyl.
   Desuden faa smaa uorganiske molekyler og ioner efter formlen (vand,
   brom, hydrogenbromid, ammoniak, carbondioxid, hydroxid, oxonium,
   ammonium, chlorid), saa reaktionsskemaer paa
   tegnebraettet kan faa navn under alle stofferne.
   Hvad der ikke navngives: S, ringe med O eller N i ringen, flere ringe,
   dobbeltbindinger fra kaeden ud til en sidegruppe af C, og grupper
   uden for gymnasiet (nitril, anhydrid, syrechlorid, peroxid), og andre
   ioner end carboxylat-ionerne (grund "ion"). Saa er
   navnet null, og grund siger hvorfor.

   Reglerne er dem, gymnasiets boeger bruger (IUPAC 1979/1993), ikke 2013:
   hovedkaeden skal have flest mulige af den vigtigste gruppe, saa flest
   dobbelt- og tripelbindinger, saa vaere laengst, saa have flest
   dobbeltbindinger. Nummereringen giver de laveste lokanter til den
   vigtigste gruppe, saa til dobbelt- og tripelbindinger, saa til
   dobbeltbindinger, saa til sidegrupperne; ved lige kaeder vinder den med
   flest sidegrupper. Er der stadig lige, faar den sidegruppe, der naevnes
   foerst i alfabetet, det laveste nummer. Lokanter udelades, hvor der kun
   er én mulighed: propen, ethanol, propanon, butanon, chlorethansyre.

   Danske skrivemaader efter brugerens eget materiale (sept. 2026):
   ethylethanoat i ét ord, propanon og butanon uden tal, propan-2-ol,
   dimethylether og diethylether, ethylamin og phenylamin. Aminer og
   ethere med simple alkylgrupper faar det navn (alkylamin, dialkylether);
   ellers det systematiske (propan-2-amin, methoxybenzen).
   res.alternativer har de andre rigtige skrivemaader (ethanamin,
   butan-2-on), saa navnelaeseren kan godkende dem.

   cis/trans: kun den klassiske form, hvor hvert C-atom i dobbeltbindingen
   har ét H og én anden gruppe. Den afgoeres af tegningens koordinater.
   E/Z (b6.1) er ikke med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Mol = NK.Molekyle;

    var STAMME = ["", "meth", "eth", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec",
        "undec", "dodec", "tridec", "tetradec", "pentadec", "hexadec", "heptadec", "octadec", "nonadec", "icos"];
    var MULT = ["", "", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa", "nona", "deca"];
    var MULT_K = ["", "", "bis", "tris", "tetrakis", "pentakis", "hexakis", "heptakis", "octakis"];
    var HALO = { F: "fluor", Cl: "chlor", Br: "brom", I: "iod" };
    var KENDT = { C: true, H: true, O: true, N: true, F: true, Cl: true, Br: true, I: true };

    /* Den vigtigste gruppe (hovedgruppen) i IUPAC's raekkefoelge */
    var RANG = ["syre", "ester", "amid", "aldehyd", "keton", "alkohol", "amin"];
    /* Grupper, hvis C-atom er en del af kaeden og sidder for enden af den */
    var ENDE = { syre: true, ester: true, amid: true, aldehyd: true };

    function tal(a, b) { return a - b; }
    function erTal(x) { return typeof x === "number"; }

    /* Foerste forskel afgoer: [1,3] er lavere end [2,2] */
    function lexi(a, b) {
        for (var i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
        return a.length - b.length;
    }

    /* ----- Grafen, som navngivningen ser den ----------------------------------
       Kun de tunge atomer (alt andet end H). Tegnede H-atomer taeller med i
       atomets antal H, ligesom de H, der ikke er tegnet. */
    function graf(mol, ids) {
        var med = {};
        ids.forEach(function (id) { med[id] = true; });
        var G = { mol: mol, el: {}, nab: {}, h: {}, tunge: [], C: [], ukendt: false, pos: {}, iRing: {}, q: {}, ladet: [] };
        ids.forEach(function (id) {
            var a = mol.atom(id);
            if (a && a.q) G.ladet.push(id);
            if (!a || a.el === "H") return;
            if (a.q) G.q[id] = a.q;
            G.tunge.push(id);
            G.el[id] = a.el;
            G.pos[id] = { x: a.x, y: a.y };
            G.nab[id] = [];
            G.h[id] = mol.implicitH(id);
            if (a.el === "C") G.C.push(id);
            else if (!KENDT[a.el]) G.ukendt = true;
        });
        mol.bindinger.forEach(function (bd) {
            if (!med[bd.a] || !med[bd.b]) return;
            var ea = G.el[bd.a], eb = G.el[bd.b];
            if (ea && eb) {
                G.nab[bd.a].push({ n: bd.b, orden: bd.orden });
                G.nab[bd.b].push({ n: bd.a, orden: bd.orden });
            } else if (ea && !eb) {
                G.h[bd.a] += 1;
            } else if (eb && !ea) {
                G.h[bd.b] += 1;
            }
        });
        G.cNab = {};
        G.C.forEach(function (id) {
            G.cNab[id] = G.nab[id].filter(function (x) { return G.el[x.n] === "C"; }).map(function (x) { return x.n; });
        });
        G.orden = function (a, b) {
            var l = G.nab[a] || [];
            for (var i = 0; i < l.length; i++) if (l[i].n === b) return l[i].orden;
            return 0;
        };
        G.memo = {};
        return G;
    }

    /* ----- Ringene -------------------------------------------------------------
       Kredse i hele molekylet og i kulstofskelettet. Er der flere i hele
       molekylet, sidder der O eller N i en ring. Én kulstofring findes ved
       at pille enderne af igen og igen. */
    function komponenter(noder, nab) {
        var set = {}, k = 0;
        noder.forEach(function (id) {
            if (set[id]) return;
            k++;
            var ko = [id];
            set[id] = true;
            while (ko.length) {
                var x = ko.pop();
                nab[x].forEach(function (y) { if (!set[y]) { set[y] = true; ko.push(y); } });
            }
        });
        return k;
    }

    function ringInfo(G) {
        var hb = 0, cb = 0;
        G.tunge.forEach(function (id) { hb += G.nab[id].length; });
        G.C.forEach(function (id) { cb += G.cNab[id].length; });
        var alle = hb / 2 - G.tunge.length + 1;
        var kulstof = cb / 2 - G.C.length + komponenter(G.C, G.cNab);
        G.heteroring = alle > kulstof;
        G.antalRinge = kulstof;
        G.ringCyk = null;
        if (kulstof !== 1) return;
        var grad = {}, ko = [], vaek = {};
        G.C.forEach(function (id) { grad[id] = G.cNab[id].length; if (grad[id] <= 1) ko.push(id); });
        while (ko.length) {
            var id = ko.pop();
            if (vaek[id]) continue;
            vaek[id] = true;
            G.cNab[id].forEach(function (n) { if (!vaek[n] && --grad[n] <= 1) ko.push(n); });
        }
        var ringAtomer = G.C.filter(function (id) { return !vaek[id]; });
        var iRing = {};
        ringAtomer.forEach(function (id) { iRing[id] = true; });
        var cyk = [ringAtomer[0]], forrige = null, nu = ringAtomer[0];
        while (cyk.length < ringAtomer.length) {
            var naeste = G.cNab[nu].filter(function (n) { return iRing[n] && n !== forrige && cyk.indexOf(n) < 0; })[0];
            if (naeste === undefined) break;
            cyk.push(naeste);
            forrige = nu;
            nu = naeste;
        }
        var n = cyk.length;
        if (n !== ringAtomer.length || n < 3) return;
        G.ringCyk = cyk;
        G.iRing = iRing;
        var ord = cyk.map(function (x, i) { return G.orden(x, cyk[(i + 1) % n]); }).join("");
        G.ringAromat = n === 6 && (ord === "121212" || ord === "212121");
    }

    /* ----- De funktionelle grupper -----------------------------------------------
       G.gr[c] for hvert C-atom: { syre, ester, amid, aldehyd, keton } med
       gruppens atomer (oD er O i C=O), og listerne oh (O i OH) og amin (N).
       Et moenster, der ikke er gymnasiestof, saetter G.fejlGruppe. */
    function klassificer(G) {
        var gr = {}, rolle = {}, fejl = false, har = {};
        G.gr = gr;
        G.ethere = [];
        G.aminN = [];
        G.C.forEach(function (c) { gr[c] = { oh: [], amin: [] }; });

        /* C=O og det, der sidder paa samme C */
        G.C.forEach(function (c) {
            var nb = G.nab[c];
            var oD = nb.filter(function (x) { return G.el[x.n] === "O" && x.orden === 2; }).map(function (x) { return x.n; });
            var anden = nb.some(function (x) { return x.orden > 1 && G.el[x.n] !== "C" && !(G.el[x.n] === "O" && x.orden === 2); });
            if (anden) { fejl = true; return; }                     /* C=N og C≡N */
            if (!oD.length) return;
            var o = oD[0];
            if (oD.length > 1 || G.nab[o].length !== 1) { fejl = true; return; }
            rolle[o] = "oxo";
            var oS = nb.filter(function (x) { return G.el[x.n] === "O" && x.orden === 1; }).map(function (x) { return x.n; });
            var nS = nb.filter(function (x) { return G.el[x.n] === "N"; }).map(function (x) { return x.n; });
            var hal = nb.filter(function (x) { return HALO[G.el[x.n]]; });
            var cN = G.cNab[c];
            /* Urinstof: C(=O) med to NH2 og intet andet */
            if (nS.length === 2 && !cN.length && !oS.length) {
                if (nS.every(function (n) { return G.nab[n].length === 1; })) { G.urinstof = true; nS.forEach(function (n) { rolle[n] = "amid"; }); return; }
                fejl = true; return;
            }
            if (oS.length + nS.length + hal.length > 1 || hal.length) { fejl = true; return; }   /* carbonat, syrechlorid */
            if (oS.length === 1) {
                var oo = oS[0], andre = G.nab[oo].filter(function (x) { return x.n !== c; });
                if (!andre.length) {
                    /* O⁻ i stedet for OH: carboxylat-ionen */
                    var ion = G.q[oo] === -1;
                    gr[c].syre = { oD: o, oH: oo, ion: ion };
                    rolle[oo] = "syre";
                    har.syre = true;
                    if (ion) har.anion = true; else har.syreH = true;
                    return;
                }
                var r = andre[0].n;
                if (andre.length > 1 || andre[0].orden > 1 || G.el[r] !== "C") { fejl = true; return; }
                if (G.nab[r].some(function (x) { return G.el[x.n] === "O" && x.orden === 2; })) { fejl = true; return; }   /* anhydrid */
                gr[c].ester = { oD: o, oB: oo, r: r };
                rolle[oo] = "ester";
                har.ester = true;
                return;
            }
            if (nS.length === 1) {
                var nn = nS[0];
                if (G.nab[nn].some(function (x) { return x.orden > 1 || (x.n !== c && G.el[x.n] !== "C"); })) { fejl = true; return; }
                gr[c].amid = { oD: o, n: nn };
                rolle[nn] = "amid";
                har.amid = true;
                return;
            }
            if (cN.length <= 1) { gr[c].aldehyd = { oD: o }; har.aldehyd = true; }
            else { gr[c].keton = { oD: o }; har.keton = true; }
        });

        /* O: OH og ether */
        G.tunge.forEach(function (o) {
            if (G.el[o] !== "O" || rolle[o]) return;
            var nb = G.nab[o];
            if (nb.some(function (x) { return x.orden > 1 || G.el[x.n] !== "C"; })) { fejl = true; return; }
            if (nb.length === 1) {
                var c = nb[0].n;
                gr[c].oh.push(o);
                rolle[o] = "oh";
                if (G.iRing[c] && G.ringAromat) har.phenol = true; else har.oh = true;
                har.alkohol = true;
            } else if (nb.length === 2) {
                if (nb.some(function (x) { return gr[x.n].syre || gr[x.n].ester || gr[x.n].amid || gr[x.n].aldehyd || gr[x.n].keton; })) { fejl = true; return; }
                rolle[o] = "ether";
                G.ethere.push(o);
            } else fejl = true;
        });

        /* N: amin (amidets N er klaret ovenfor) */
        G.tunge.forEach(function (n) {
            if (G.el[n] !== "N" || rolle[n]) return;
            var nb = G.nab[n];
            if (nb.some(function (x) { return x.orden > 1 || G.el[x.n] !== "C"; })) { fejl = true; return; }
            if (nb.some(function (x) { var g = gr[x.n]; return g.syre || g.ester || g.aldehyd || g.keton; })) { fejl = true; return; }
            rolle[n] = "amin";
            G.aminN.push(n);
            nb.forEach(function (x) { gr[x.n].amin.push(n); });
            har.amin = true;
        });

        /* Halogen sidder paa C med en enkeltbinding */
        G.tunge.forEach(function (x) {
            if (!HALO[G.el[x]]) return;
            var nb = G.nab[x];
            if (nb.length !== 1 || nb[0].orden !== 1 || G.el[nb[0].n] !== "C") fejl = true;
            else har.halogen = true;
        });

        G.fejlGruppe = fejl;
        G.rolle = rolle;
        G.har = har;
    }

    /* ----- Stier gennem kulstofatomerne -------------------------------------------
       kn: naboliste for de C-atomer, der maa vaere med. Alle veje fra start
       ud til en ende, uden om forbudt. I et skelet uden ring er vejen
       mellem to ender entydig. */
    function kaedeNabo(G, tilladt) {
        var kn = {};
        G.C.forEach(function (id) { if (tilladt(id)) kn[id] = G.cNab[id].filter(tilladt); });
        return kn;
    }

    function stier(kn, start, forbudt) {
        var ud = [];
        (function dfs(id, forrige, sti) {
            var videre = kn[id].filter(function (n) { return n !== forrige && n !== forbudt; });
            if (!videre.length) { ud.push(sti.slice()); return; }
            videre.forEach(function (n) { sti.push(n); dfs(n, id, sti); sti.pop(); });
        })(start, null, [start]);
        return ud;
    }

    /* Kaeder i en sidegruppe gaar ikke ind i ringen og ikke gennem -COOH,
       -COOR og -CONH2: de bliver til carboxy, (methoxycarbonyl) og carbamoyl */
    function subNab(G) {
        if (!G.subKn) {
            G.subKn = kaedeNabo(G, function (id) {
                var g = G.gr[id];
                return !G.iRing[id] && !(g.syre || g.ester || g.amid);
            });
        }
        return G.subKn;
    }

    /* ----- En kaede eller ring med én nummerering ------------------------------------
       sti: atomernes id i nummereringens raekkefoelge (C1 foerst).
       fra: atomet, en sidegruppe sidder paa (skal ikke med), eller null.
       ring: sand, naar stien er en ring (bindingen fra sidste til foerste
       taeller med).
       ctx: { hoved, tilkoblet, brugt } for stamkaeden. hoved er den
       vigtigste gruppe; tilkoblet betyder, at -COOH (-CHO, -CONH2, -COOR)
       sidder paa kaeden eller ringen i stedet for at vaere en del af den
       (benzoesyre, propan-1,2,3-tricarboxylsyre). brugt: atomer, der
       allerede er regnet med (acylgruppens O). */
    function vurderSti(G, sti, fra, ring, aromat, ctx) {
        var paa = {}, i;
        sti.forEach(function (id, k) { paa[id] = k; });
        var dbl = [], tri = [];
        var bindinger = ring ? sti.length : sti.length - 1;
        if (!aromat) {
            for (i = 0; i < bindinger; i++) {
                var o = G.orden(sti[i], sti[(i + 1) % sti.length]);
                if (o === 2) dbl.push(i + 1);
                if (o === 3) tri.push(i + 1);
            }
        }
        var hoved = ctx && ctx.hoved, brugt = {}, princ = [], nAtomer = [], ester = [];
        if (ctx && ctx.brugt) Object.keys(ctx.brugt).forEach(function (k) { brugt[k] = true; });

        /* En endegruppe (-COOH, -CHO, -CONH2, -COOR) med C-atomet c */
        function endegruppe(c, lok) {
            var g = G.gr[c][hoved];
            princ.push(lok);
            brugt[g.oD] = true;
            if (hoved === "syre") brugt[g.oH] = true;
            if (hoved === "ester") { brugt[g.oB] = true; ester.push(g); }
            if (hoved === "amid") { brugt[g.n] = true; nAtomer.push({ n: g.n, fra: c }); }
        }
        if (hoved) {
            sti.forEach(function (id, k) {
                var g = G.gr[id], lok = k + 1;
                if (ENDE[hoved]) {
                    if (ctx.tilkoblet) {
                        G.cNab[id].forEach(function (c) {
                            if (paa[c] === undefined && c !== fra && !G.iRing[c] && G.gr[c][hoved]) { brugt[c] = true; endegruppe(c, lok); }
                        });
                    } else if (g[hoved]) endegruppe(id, lok);
                } else if (hoved === "keton") {
                    if (g.keton) { princ.push(lok); brugt[g.keton.oD] = true; }
                } else if (hoved === "alkohol") {
                    g.oh.forEach(function (oh) { princ.push(lok); brugt[oh] = true; });
                } else if (hoved === "amin") {
                    g.amin.forEach(function (nn) { princ.push(lok); brugt[nn] = true; nAtomer.push({ n: nn, fra: id }); });
                }
            });
        }

        var subs = [], fejl = false;
        function nySub(lok, s, rod, fraAtom) {
            subs.push({ lok: lok, navn: s.navn, noegle: s.noegle, kompleks: s.kompleks, rod: rod, fra: fraAtom, atomer: s.atomer });
        }
        /* Det, der sidder paa hovedgruppens N, faar lokanten N (N-methylethanamid) */
        var medN = 0;
        nAtomer.forEach(function (x) {
            var andre = G.nab[x.n].filter(function (y) { return y.n !== x.fra; });
            if (andre.length) medN++;
            andre.forEach(function (y) {
                var s = y.orden === 1 ? navnSub(G, y.n, x.n) : null;
                if (!s) { fejl = true; return; }
                nySub("N", s, y.n, x.n);
            });
        });
        /* To N i hovedgruppen og en gruppe paa det ene: N kan ikke skelnes (N') */
        if (medN > 1 || (medN && nAtomer.length > 1)) fejl = true;

        sti.forEach(function (id, k) {
            G.nab[id].forEach(function (x) {
                if (paa[x.n] !== undefined || x.n === fra || brugt[x.n]) return;
                if (x.orden > 1) {
                    if (G.el[x.n] === "O") { nySub(k + 1, { navn: "oxo", noegle: "oxo", kompleks: false, atomer: [x.n] }, x.n, id); return; }
                    fejl = true;
                    return;
                }
                var s = navnSub(G, x.n, id);
                if (!s) { fejl = true; return; }
                nySub(k + 1, s, x.n, id);
            });
        });
        princ.sort(tal);
        return { sti: sti, n: sti.length, dbl: dbl, tri: tri, mult: dbl.concat(tri).sort(tal), princ: princ,
            subs: subs, fejl: fejl, ester: ester, ring: !!ring, aromat: !!aromat };
    }

    function subLok(v) { return v.subs.filter(function (s) { return erTal(s.lok); }).map(function (s) { return s.lok; }).sort(tal); }

    /* Lokanterne i den raekkefoelge, sidegrupperne naevnes (alfabetisk) */
    function alfaLok(v) {
        return v.subs.filter(function (s) { return erTal(s.lok); }).sort(function (x, y) {
            if (x.noegle !== y.noegle) return x.noegle < y.noegle ? -1 : 1;
            return x.lok - y.lok;
        }).map(function (s) { return s.lok; });
    }

    /* Negativ, hvis a er den bedste kaede/nummerering (IUPAC 1979, C-13.11) */
    function bedre(a, b) {
        if (a.fejl !== b.fejl) return a.fejl ? 1 : -1;
        if (a.princ.length !== b.princ.length) return b.princ.length - a.princ.length;
        if (a.mult.length !== b.mult.length) return b.mult.length - a.mult.length;
        if (a.n !== b.n) return b.n - a.n;
        if (a.dbl.length !== b.dbl.length) return b.dbl.length - a.dbl.length;
        var c = lexi(a.princ, b.princ);
        if (c) return c;
        c = lexi(a.mult, b.mult);
        if (c) return c;
        c = lexi(a.dbl, b.dbl);
        if (c) return c;
        if (a.subs.length !== b.subs.length) return b.subs.length - a.subs.length;
        c = lexi(subLok(a), subLok(b));
        if (c) return c;
        return lexi(alfaLok(a), alfaLok(b));
    }

    /* ----- Stammen: butan, but-2-en, buta-1,3-dien, but-1-en-3-yn --------------------
       udenLok: ingen lokanter for dobbelt- og tripelbindingen (propen) */
    function stamDel(n, dbl, tri, ring, udenLok) {
        var s = STAMME[n];
        if (!s) return null;
        if (ring) s = "cyclo" + s;
        var antal = dbl.length + tri.length;
        if (!antal) return s + "an";
        if (udenLok && antal === 1) return s + (dbl.length ? "en" : "yn");
        var a = dbl.length > 1 || (!dbl.length && tri.length > 1);
        var t = s + (a ? "a" : "");
        if (dbl.length) t += "-" + dbl.join(",") + "-" + MULT[dbl.length] + "en";
        if (tri.length) t += "-" + tri.join(",") + "-" + MULT[tri.length] + "yn";
        return t;
    }

    /* Stammen til en sidegruppe eller et carbonhydrid: butyl, ethenyl, butan */
    function stam(n, dbl, tri, sub, ring) {
        var antal = dbl.length + tri.length;
        var udenLok = antal === 1 && (ring || (sub ? n <= 2 : n <= 3));
        var t = stamDel(n, dbl, tri, ring, udenLok);
        if (!t) return null;
        if (!sub) return t;
        return (antal ? t : t.slice(0, -2)) + "yl";
    }

    /* Navnet i parentes: (1-methylethyl), [4-(2-methylpropyl)phenyl] */
    function parentes(navn) {
        if (navn.indexOf("[") >= 0) return "{" + navn + "}";
        if (navn.indexOf("(") >= 0) return "[" + navn + "]";
        return "(" + navn + ")";
    }

    /* Forstavelserne: 3-ethyl-2,2-dimethyl, 2-brom-2-methyl, 4-(1-methylethyl),
       N,N-dimethyl. udenLok: tallene kan undvaeres (methylcyclohexan); N skrives altid */
    function praefikser(subs, udenLok) {
        var grupper = {}, liste = [];
        subs.forEach(function (s) {
            if (!grupper[s.navn]) { grupper[s.navn] = { s: s, lok: [] }; liste.push(grupper[s.navn]); }
            grupper[s.navn].lok.push(s.lok);
        });
        liste.sort(function (a, b) {
            if (a.s.noegle !== b.s.noegle) return a.s.noegle < b.s.noegle ? -1 : 1;
            return 0;
        });
        return liste.map(function (g) {
            var n = g.lok.length;
            var mult = n > 1 ? (g.s.kompleks ? MULT_K[n] : MULT[n]) : "";
            var navn = g.s.kompleks ? parentes(g.s.navn) : g.s.navn;
            var lok = g.lok.slice().sort(function (a, b) {
                if (erTal(a) !== erTal(b)) return erTal(a) ? 1 : -1;
                return erTal(a) ? a - b : 0;
            });
            var visLok = udenLok ? lok.filter(function (l) { return !erTal(l); }) : lok;
            return (visLok.length ? visLok.join(",") + "-" : "") + mult + navn;
        }).join("-");
    }

    /* En liste af grupper uden lokanter i alfabetisk raekkefoelge:
       dimethyl, ethylmethyl, bis(2-hydroxyethyl) */
    function gruppeListe(grp, altidParentes) {
        var set = {}, liste = [];
        grp.forEach(function (s) {
            if (!set[s.navn]) { set[s.navn] = { s: s, n: 0 }; liste.push(set[s.navn]); }
            set[s.navn].n++;
        });
        liste.sort(function (a, b) { return a.s.noegle < b.s.noegle ? -1 : (a.s.noegle > b.s.noegle ? 1 : 0); });
        return liste.map(function (g) {
            var k = g.s.kompleks || (g.n > 1 && /^di|^tri/.test(g.s.navn));
            return (g.n > 1 ? (k ? MULT_K[g.n] : MULT[g.n]) : "") + (k && (g.n > 1 || liste.length > 1 || altidParentes) ? parentes(g.s.navn) : g.s.navn);
        }).join("");
    }

    function lav(navn, kompleks) { return { navn: navn, noegle: navn.replace(/[^a-z]/g, ""), kompleks: !!kompleks }; }

    /* Alle tunge atomer i sidegruppen: fra rod og vaek fra fra */
    function delAtomer(G, rod, fra) {
        var set = {}, ud = [], ko = [rod];
        set[rod] = true;
        set[fra] = true;
        while (ko.length) {
            var x = ko.pop();
            ud.push(x);
            G.nab[x].forEach(function (y) { if (!set[y.n]) { set[y.n] = true; ko.push(y.n); } });
        }
        return ud;
    }

    /* methyl -> methoxy, 2-chlorethyl -> 2-chlorethoxy, pentyl -> pentyloxy */
    function oxyNavn(n) {
        if (/(meth|eth|prop|but|phen)yl$/.test(n)) return n.replace(/yl$/, "oxy");
        return n + "oxy";
    }

    /* ----- En sidegruppe ---------------------------------------------------------
       rod: det foerste atom i sidegruppen, fra: atomet, den sidder paa */
    function navnSub(G, rod, fra) {
        var noegle = rod + ">" + fra;
        if (G.memo[noegle] !== undefined) return G.memo[noegle];
        G.memo[noegle] = null;
        var el = G.el[rod], ud = null;
        if (HALO[el]) ud = lav(HALO[el], false);
        else if (el === "O") ud = oGruppe(G, rod, fra);
        else if (el === "N") ud = nGruppe(G, rod, fra);
        else if (el === "C") ud = cGruppe(G, rod, fra);
        if (ud) ud.atomer = delAtomer(G, rod, fra);
        G.memo[noegle] = ud;
        return ud;
    }

    /* hydroxy, methoxy, phenoxy, (acetyloxy) */
    function oGruppe(G, o, fra) {
        var andre = G.nab[o].filter(function (y) { return y.n !== fra; });
        if (!andre.length) return lav("hydroxy", false);
        if (andre.length > 1 || andre[0].orden > 1 || G.el[andre[0].n] !== "C") return null;
        var y = andre[0].n, gy = G.gr[y];
        if (gy.ester && gy.ester.oB === o) {
            var a = acylNavn(G, y, o);
            return a ? lav(a + "oxy", true) : null;
        }
        var r = navnSub(G, y, o);
        if (!r) return null;
        var t = oxyNavn(r.navn);
        return { navn: t, noegle: t.replace(/[^a-z]/g, ""), kompleks: r.kompleks };
    }

    /* amino, (methylamino), (dimethylamino), (acetylamino) */
    function nGruppe(G, nn, fra) {
        var andre = G.nab[nn].filter(function (y) { return y.n !== fra; });
        if (andre.some(function (y) { return y.orden > 1 || G.el[y.n] !== "C"; })) return null;
        if (!andre.length) return lav("amino", false);
        var acyl = andre.filter(function (y) { var g = G.gr[y.n]; return g.amid && g.amid.n === nn; });
        if (acyl.length) {
            if (andre.length > 1) return null;
            var a = acylNavn(G, acyl[0].n, nn);
            return a ? lav(a + "amino", true) : null;
        }
        var grp = andre.map(function (y) { return navnSub(G, y.n, nn); });
        if (grp.some(function (g) { return !g; })) return null;
        return lav(gruppeListe(grp) + "amino", true);
    }

    /* Carbonylgruppen set fra et andet atom: formyl, acetyl, propanoyl, benzoyl */
    function acylNavn(G, c, fra) {
        var g = G.gr[c];
        var oD = (g.keton || g.aldehyd || g.ester || g.amid || {}).oD;
        var cN = G.cNab[c].filter(function (x) { return x !== fra; });
        if (!cN.length) return "formyl";
        if (cN.length > 1) return null;
        var k = cN[0];
        if (G.iRing[k]) {
            var rs = ringGruppe(G, k, c);
            if (!rs) return null;
            if (/phenyl$/.test(rs.navn)) return rs.navn.replace(/phenyl$/, "benzoyl");
            return (rs.kompleks ? parentes(rs.navn) : rs.navn) + "carbonyl";
        }
        var kn = {}, sn = subNab(G);
        Object.keys(sn).forEach(function (x) { kn[x] = sn[x]; });
        kn[c] = G.cNab[c].filter(function (x) { return x !== fra && sn[x]; });
        var brugt = {};
        brugt[oD] = true;
        var bedst = null;
        stier(kn, c, fra).forEach(function (sti) {
            var v = vurderSti(G, sti, fra, false, false, { brugt: brugt });
            if (!bedst || bedre(v, bedst) < 0) bedst = v;
        });
        if (!bedst || bedst.fejl) return null;
        if (bedst.n === 2 && !bedst.subs.length && !bedst.mult.length) return "acetyl";
        var st = stamDel(bedst.n, bedst.dbl, bedst.tri, false, bedst.mult.length === 1 && bedst.n <= 3 && !bedst.subs.length);
        return st ? praefikser(bedst.subs, bedst.n <= 1) + st + "oyl" : null;
    }

    /* En ring som sidegruppe: phenyl, cyclohexyl, 4-methylphenyl */
    function ringGruppe(G, x, fra) {
        var cyk = G.ringCyk;
        if (!cyk) return null;
        var n = cyk.length, i0 = cyk.indexOf(x), bedst = null;
        [1, -1].forEach(function (ret) {
            var sti = [];
            for (var i = 0; i < n; i++) sti.push(cyk[((i0 + ret * i) % n + n) % n]);
            var v = vurderSti(G, sti, fra, true, G.ringAromat, null);
            if (!bedst || bedre(v, bedst) < 0) bedst = v;
        });
        if (!bedst || bedst.fejl) return null;
        var basis;
        if (G.ringAromat) basis = "phenyl";
        else if (!bedst.mult.length) basis = "cyclo" + STAMME[n] + "yl";
        else basis = stamDel(n, bedst.dbl, bedst.tri, true, false) + "-1-yl";
        var navn = praefikser(bedst.subs, false) + basis;
        return { navn: navn, noegle: navn.replace(/[^a-z]/g, ""), kompleks: bedst.subs.length > 0 || /\d/.test(navn) };
    }

    /* methyl, (1-methylethyl), carboxy, formyl, acetyl, (methoxycarbonyl) */
    function cGruppe(G, c, fra) {
        if (G.iRing[c]) return ringGruppe(G, c, fra);
        var g = G.gr[c];
        if (g.syre) return lav(g.syre.ion ? "carboxylato" : "carboxy", false);
        if (g.ester) {
            var r = navnSub(G, g.ester.r, g.ester.oB);
            return r ? lav(oxyNavn(r.navn) + "carbonyl", true) : null;
        }
        if (g.amid) {
            var nG = G.nab[g.amid.n].filter(function (y) { return y.n !== c; }).map(function (y) { return navnSub(G, y.n, g.amid.n); });
            if (nG.some(function (s) { return !s; })) return null;
            return nG.length ? lav(gruppeListe(nG) + "carbamoyl", true) : lav("carbamoyl", false);
        }
        if (g.aldehyd) return lav("formyl", false);
        if (g.keton) { var a = acylNavn(G, c, fra); return a ? lav(a, /[\d(\[]/.test(a)) : null; }
        var kn = subNab(G), bedst = null;
        stier(kn, c, fra).forEach(function (sti) {
            var v = vurderSti(G, sti, fra, false, false, null);
            if (!bedst || bedre(v, bedst) < 0) bedst = v;
        });
        var s = bedst && !bedst.fejl ? stam(bedst.n, bedst.dbl, bedst.tri, true, false) : null;
        if (!s) return null;
        var navn = praefikser(bedst.subs, bedst.n === 1) + s;
        /* En sidegruppe med egne sidegrupper eller lokanter skrives i parentes */
        return { navn: navn, noegle: navn.replace(/[^a-z]/g, ""), kompleks: bedst.subs.length > 0 || /\d/.test(navn) };
    }

    /* ----- cis/trans ----------------------------------------------------------------
       For hver dobbeltbinding i kaeden: har begge C-atomer ét H og én
       anden gruppe, afgoer tegningen, om grupperne er paa samme side af
       bindingen (cis) eller hver sin side (trans). */
    function stereoFor(G, sti, dbl) {
        var fund = [], note = null;
        /* Har atomet to forskellige grupper ud over dobbeltbindingen? */
        function forskellige(atom, andre) {
            var g = andre.map(function (x) { var s = navnSub(G, x.n, atom); return s ? s.navn : "?" + x.n; });
            for (var k = 0; k < G.h[atom]; k++) g.push("H");
            return g.length === 2 && g[0] !== g[1];
        }
        dbl.forEach(function (lok) {
            var A = sti[lok - 1], B = sti[lok];
            var nA = G.nab[A].filter(function (x) { return x.n !== B; });
            var nB = G.nab[B].filter(function (x) { return x.n !== A; });
            var klassisk = nA.length === 1 && G.h[A] === 1 && nB.length === 1 && G.h[B] === 1;
            if (!klassisk) {
                if (forskellige(A, nA) && forskellige(B, nB)) note = note || "ez";
                return;
            }
            var pa = G.pos[A], pb = G.pos[B], ga = G.pos[nA[0].n], gb = G.pos[nB[0].n];
            function kryds(p) { return (pb.x - pa.x) * (p.y - pa.y) - (pb.y - pa.y) * (p.x - pa.x); }
            var ka = kryds(ga), kb = kryds(gb);
            if (Math.abs(ka) < 1e-3 || Math.abs(kb) < 1e-3) { note = "lineaer"; fund.push({ lok: lok, stereo: null }); return; }
            fund.push({ lok: lok, stereo: (ka > 0) === (kb > 0) ? "cis" : "trans" });
        });
        return { liste: fund, note: note };
    }

    /* ----- Navnet paa stamkaeden eller ringen med endelse ------------------------------
       fuld: alle lokanter med (butan-2-on i stedet for butanon), til de
       andre rigtige skrivemaader */
    var ENDELSE = { syre: "syre", aldehyd: "al", amid: "amid", ester: "oat", keton: "on", alkohol: "ol", amin: "amin" };
    var TILKOBLET = { syre: "carboxylsyre", ester: "carboxylat", aldehyd: "carbaldehyd", amid: "carboxamid" };
    var BENZEN = { syre: "benzoesyre", ester: "benzoat", aldehyd: "benzaldehyd", amid: "benzamid", alkohol: "phenol" };

    function udenSufLok(v, ctx, fuld) {
        if (fuld || v.princ.length !== 1) return false;
        if (v.ring) return !(v.mult.length && !v.aromat);
        if (ctx.tilkoblet) return false;
        if (ctx.hoved === "keton") return v.n <= 2 || (v.n <= 4 && !v.subs.length && !v.mult.length);
        return v.n <= 2;
    }

    function udenPreLok(v, ctx, fuld) {
        if (fuld) return false;
        var hoved = ctx.hoved, ende = hoved && ENDE[hoved] && !ctx.tilkoblet;
        var antal = v.subs.filter(function (s) { return erTal(s.lok); }).length;
        var medN = antal < v.subs.length;
        if (v.ring) return !hoved && antal === 1 && (v.aromat || !v.mult.length);
        if (v.n === 1) return true;
        if (v.n === 2 && !hoved && antal === 1) return true;
        return v.n === 2 && !!ende && !medN;
    }

    function stamNavn(v, ctx, fuld, udenBenzen) {
        var hoved = ctx.hoved, n = v.n, np = v.princ.length;
        /* Carboxylat-ionen har esterens endelser: ethanoat, benzoat */
        var endelse = ctx.ion ? "ester" : hoved;
        var ende = !!(hoved && ENDE[hoved] && !ctx.tilkoblet);
        var antal = v.dbl.length + v.tri.length, udenLokMult;
        if (fuld) udenLokMult = false;
        else if (!hoved) udenLokMult = antal === 1 && (v.ring || n <= 3);
        else if (v.ring) udenLokMult = false;
        else udenLokMult = antal === 1 && (n <= 2 || (n === 3 && ende && !v.subs.length));
        var stamme = v.aromat ? "benzen" : stamDel(n, v.dbl, v.tri, v.ring, udenLokMult);
        if (!stamme) return null;
        var pre = praefikser(v.subs, udenPreLok(v, ctx, fuld));
        if (!hoved) return pre + stamme;
        var m = MULT[np] || "", lok = "-" + v.princ.join(",") + "-";
        if (v.aromat && np === 1 && BENZEN[hoved] && !udenBenzen && (ctx.tilkoblet || !ENDE[hoved])) return pre + BENZEN[endelse];
        if (ende) return pre + stamme + m + ENDELSE[endelse];
        var suf = ctx.tilkoblet && ENDE[hoved] ? TILKOBLET[endelse] : ENDELSE[endelse];
        return pre + stamme + (udenSufLok(v, ctx, fuld) ? "" : lok) + m + suf;
    }

    /* ----- Kaeden eller ringen, der bestemmer navnet ---------------------------------- */
    function bedsteKaede(G, ctx) {
        var kn = kaedeNabo(G, function (id) { return !G.iRing[id] && !(ctx.tilkoblet && G.gr[id].syre); });
        var bedst = null;
        Object.keys(kn).forEach(function (k) {
            var u = +k;
            if (kn[u].length > 1) return;
            stier(kn, u, null).forEach(function (sti) {
                var v = vurderSti(G, sti, null, false, false, ctx);
                if (!bedst || bedre(v, bedst) < 0) bedst = v;
            });
        });
        return bedst;
    }

    function bedsteRing(G, ctx) {
        var cyk = G.ringCyk, n = cyk.length, bedst = null;
        for (var s = 0; s < n; s++) {
            [1, -1].forEach(function (ret) {
                var sti = [];
                for (var i = 0; i < n; i++) sti.push(cyk[((s + ret * i) % n + n) % n]);
                var v = vurderSti(G, sti, null, true, G.ringAromat, ctx);
                if (!bedst || bedre(v, bedst) < 0) bedst = v;
            });
        }
        return bedst;
    }

    /* ----- Tegnekaeden: stamkaeden forlaenget ud gennem O og N ------------------------
       Til tegningen (layout.js): ethanol tegnes C-C-O, ethylethanoat
       C-C(=O)-O-C-C og diethylether C-C-O-C-C, som i bogen. */
    function tegneKaede(G, kaede) {
        var i = {};
        kaede.forEach(function (id) { i[id] = true; });
        function laengst(start, forbudt) {
            var bedst = [];
            (function dfs(id, sti) {
                var videre = G.nab[id].filter(function (x) {
                    return x.orden === 1 && !i[x.n] && !G.iRing[x.n] && x.n !== forbudt && sti.indexOf(x.n) < 0 && G.nab[x.n];
                });
                if (!videre.length) { if (sti.length > bedst.length) bedst = sti.slice(); return; }
                videre.forEach(function (x) { sti.push(x.n); dfs(x.n, sti); sti.pop(); });
            })(start, []);
            return bedst;
        }
        var bag = laengst(kaede[kaede.length - 1], null);
        var foran = laengst(kaede[0], kaede.length === 1 && bag.length ? bag[0] : null);
        return foran.reverse().concat(kaede, bag);
    }

    /* Den laengste vej gennem de tunge atomer (til tegningen af et molekyle
       uden navn og uden ring) */
    function laengsteVej(G) {
        function fjernest(start) {
            var afst = {}, ko = [start], forrige = {};
            afst[start] = 0;
            var sidst = start;
            while (ko.length) {
                var x = ko.shift();
                sidst = x;
                G.nab[x].forEach(function (y) { if (afst[y.n] === undefined) { afst[y.n] = afst[x] + 1; forrige[y.n] = x; ko.push(y.n); } });
            }
            var vej = [sidst];
            while (forrige[vej[0]] !== undefined) vej.unshift(forrige[vej[0]]);
            return vej;
        }
        var a = fjernest(G.tunge[0]);
        return fjernest(a[a.length - 1]);
    }

    /* ----- Stofklassen, som den staar i panelet ---------------------------------------- */
    function stofklasse(G, res) {
        var h = G.har || {}, l = [];
        if (G.urinstof) return "amid";
        if (h.anion) l.push("carboxylat-ion");
        else
        if (h.syre && h.amin && G.C.some(function (c) {
            return G.gr[c].syre && G.cNab[c].some(function (a) { return G.gr[a].amin.length; });
        })) return "aminosyre";
        if (h.syre && !h.anion) l.push("carboxylsyre");
        if (h.ester) l.push("ester");
        if (h.amid) l.push("amid");
        if (h.aldehyd) l.push("aldehyd");
        if (h.keton) l.push("keton");
        if (h.phenol) l.push("phenol");
        if (h.oh) l.push("alkohol");
        if (h.amin) l.push("amin");
        if (G.ethere && G.ethere.length) l.push("ether");
        if (l.length) return l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " og " + l[l.length - 1];
        if (h.halogen) return "halogenforbindelse";
        return { alkan: "alkan", alken: "alken", alkyn: "alkyn", aromat: "aromatisk", cykloalkan: "cycloalkan",
            cykloalken: "cycloalken", cykloalkyn: "cycloalkyn" }[res.klasse] || null;
    }

    /* ----- Aminer og ethere med simple grupper: ethylamin, diethylether --------------- */
    function simpel(s) { return s && !s.kompleks && !/[\d(\[]/.test(s.navn); }

    /* tvungen: ogsaa med sammensatte grupper, (1-methylethyl)amin, som en
       anden skrivemaade, navnelaeseren kan godkende */
    function aminNavn(G, tvungen) {
        if (G.aminN.length !== 1 || G.tunge.some(function (x) { return G.el[x] !== "C" && G.el[x] !== "N"; })) return null;
        var nn = G.aminN[0];
        var grp = G.nab[nn].map(function (y) { return navnSub(G, y.n, nn); });
        if (grp.some(function (s) { return !s; }) || (!tvungen && !grp.every(simpel))) return null;
        return gruppeListe(grp, tvungen) + "amin";
    }

    function etherNavn(G, tvungen) {
        if (G.ethere.length !== 1 || G.ringCyk) return null;
        if (G.tunge.some(function (x) { return G.el[x] !== "C" && x !== G.ethere[0]; })) return null;
        var o = G.ethere[0];
        var grp = G.nab[o].map(function (y) { return navnSub(G, y.n, o); });
        if (grp.some(function (s) { return !s; }) || (!tvungen && !grp.every(simpel))) return null;
        return gruppeListe(grp, tvungen) + "ether";
    }

    /* ----- Hele navnet ---------------------------------------------------------------- */
    function navngiv(G) {
        var hoved = null;
        for (var i = 0; i < RANG.length; i++) if (G.har[RANG[i]]) { hoved = RANG[i]; break; }
        if (G.urinstof) {
            if (G.tunge.length !== 4) return { navn: null, grund: "gruppe" };
            return { navn: "urinstof", navnUdenStereo: "urinstof", kaede: [], sub: [], dobbelt: [], tripel: [], ring: false,
                aromat: false, stereo: null, stereoNote: null, stereoMulig: false, hoved: "amid" };
        }
        /* Mere end to -COOH paa kaeder: propan-1,2,3-tricarboxylsyre */
        var tilk = hoved === "syre" && G.C.filter(function (c) { return G.gr[c].syre && !G.cNab[c].some(function (x) { return G.iRing[x]; }); }).length > 2;
        var harKaede = G.C.some(function (c) { return !G.iRing[c] && !(tilk && G.gr[c].syre); });
        var kv = harKaede ? bedsteKaede(G, { hoved: hoved, tilkoblet: tilk }) : null;
        var rv = G.ringCyk ? bedsteRing(G, { hoved: hoved, tilkoblet: true }) : null;
        var brugRing;
        if (!rv) brugRing = false;
        else if (!kv || kv.fejl) brugRing = true;
        else if (!hoved) brugRing = true;
        else brugRing = rv.princ.length >= kv.princ.length && rv.princ.length > 0 || !kv.princ.length;
        var v = brugRing ? rv : kv;
        if (!v || v.fejl || (hoved && !v.princ.length)) return { navn: null, grund: "kompleks" };
        var ctx = { hoved: hoved, tilkoblet: brugRing ? true : tilk, ion: hoved === "syre" && !!G.har.anion };

        var navn = stamNavn(v, ctx, false);
        if (!navn) return { navn: null, grund: "lang" };
        var alt = [stamNavn(v, ctx, true)];
        if (brugRing && v.aromat && v.princ.length === 1 && BENZEN[hoved]) alt.push(stamNavn(v, ctx, false, true), stamNavn(v, ctx, true, true));

        /* cis/trans paa kaeden */
        var stereo = null, note = null, stereoMulig = false;
        if (!brugRing) {
            var st = stereoFor(G, v.sti, v.dbl);
            var kendte = st.liste.filter(function (x) { return x.stereo; });
            note = st.note;
            stereoMulig = st.liste.length > 0;
            if (kendte.length === 1 && st.liste.length === 1) stereo = kendte[0].stereo;
            else if (kendte.length > 1) note = "flere";
        }
        var syreDel = (stereo ? stereo + "-" : "") + navn;

        /* Esteren: alkylgrupperne foran syredelen */
        if (hoved === "ester") {
            var alkyl = v.ester.map(function (g) { return navnSub(G, g.r, g.oB); });
            if (alkyl.some(function (a) { return !a; })) return { navn: null, grund: "kompleks" };
            /* En sammensat alkylgruppe uden tal i parentes, ellers kan navnet
               laeses paa to maader: (phenylmethyl)ethanoat, 3-methylbutylethanoat */
            var a0 = alkyl[0];
            var foran = alkyl.length === 1 ? (a0.kompleks && !/^\d/.test(a0.navn) ? parentes(a0.navn) : a0.navn) : gruppeListe(alkyl);
            var bind = function (del) { return foran + (/^([\d(\[{]|cis-|trans-)/.test(del) ? "-" : "") + del; };
            var udenSt = bind(navn);
            alt = alt.map(bind);
            navn = bind(syreDel);
            syreDel = navn;
            alt.push(udenSt);
        }
        var res = {
            navn: syreDel, navnUdenStereo: hoved === "ester" ? alt[alt.length - 1] : navn,
            kaede: v.sti, sub: v.subs, dobbelt: v.dbl, tripel: v.tri,
            ring: brugRing, aromat: !!(brugRing && v.aromat), stereo: stereo, stereoNote: note, stereoMulig: stereoMulig,
            hoved: hoved, alternativer: alt
        };
        /* Simple aminer og ethere faar alkylnavnet: ethylamin, diethylether */
        var rf = hoved === "amin" ? aminNavn(G) : (!hoved && G.ethere.length ? etherNavn(G) : null);
        if (rf) {
            res.alternativer.push(res.navnUdenStereo);
            res.navn = res.navnUdenStereo = rf;
            res.stereo = null;
            res.radikofunktionel = true;
        } else {
            var rfAlt = hoved === "amin" ? aminNavn(G, true) : (!hoved && G.ethere.length ? etherNavn(G, true) : null);
            if (rfAlt) res.alternativer.push(rfAlt);
        }
        if (!brugRing) res.tegnekaede = tegneKaede(G, v.sti);
        return res;
    }

    /* ----- Smaa uorganiske molekyler (tegnebraettets reaktionsskemaer) ---------------
       Kendes paa molekylformlen i Hill-orden: uden C staar grundstofferne
       alfabetisk, derfor ClH og BrH. */
    var UORGANISK = {
        H2: "hydrogen", O2: "oxygen", N2: "nitrogen", F2: "fluor", Cl2: "chlor", Br2: "brom", I2: "iod",
        H2O: "vand", H2O2: "hydrogenperoxid", FH: "hydrogenfluorid", ClH: "hydrogenchlorid",
        BrH: "hydrogenbromid", HI: "hydrogeniodid", H3N: "ammoniak", CO2: "carbondioxid",
        /* Ionerne har ladningen efter formlen. Som ethanoat uden "ion" */
        "HO-": "hydroxid", "H3O+": "oxonium", "H4N+": "ammonium",
        "F-": "fluorid", "Cl-": "chlorid", "Br-": "bromid", "I-": "iodid"
    };

    /* Ladningen som den staar efter formlen i noeglen: + og -, 2+ */
    function ladningsNoegle(q) {
        if (!q) return "";
        return (Math.abs(q) > 1 ? Math.abs(q) : "") + (q > 0 ? "+" : "-");
    }

    /* Ladningerne er i orden, naar de kun sidder paa carboxylat-ionernes O,
       og alle syregrupperne er uden H (ikke hydrogenbutandioat) */
    function ladningOK(G) {
        if (!G.ladet.length) return true;
        if (G.har.syreH) return false;
        return G.ladet.every(function (id) {
            return G.q[id] === -1 && G.rolle[id] === "syre";
        });
    }

    /* ----- Indgangen ------------------------------------------------------------------
       mol: et NK.Molekyle. ids: atomerne i ét sammenhaengende molekyle
       (uden ids: hele molekylet, som saa skal haenge sammen). */
    function analyser(mol, ids) {
        if (!ids) {
            var fr = mol.fragmenter();
            if (fr.length !== 1) return { navn: null, grund: fr.length ? "flere" : "tom" };
            ids = fr[0];
        }
        var G = graf(mol, ids);
        var res;
        if (!G.tunge.length) res = { navn: null, grund: "tom" };
        else if (!G.C.length) res = { navn: null, grund: "ingenC" };
        else if (G.ukendt) res = { navn: null, grund: "hetero" };
        else {
            ringInfo(G);
            if (G.heteroring) res = { navn: null, grund: "heteroring" };
            else if (G.antalRinge > 1) res = { navn: null, grund: "ringe" };
            else if (G.antalRinge === 1 && !G.ringCyk) res = { navn: null, grund: "kompleks" };
            else {
                klassificer(G);
                if (!ladningOK(G)) res = { navn: null, grund: "ion" };
                else res = G.fejlGruppe ? { navn: null, grund: "gruppe" } : navngiv(G);
            }
        }
        /* Klassen efter bindingerne mellem C-atomerne i hele molekylet */
        var d = 0, t = 0, halo = false;
        G.C.forEach(function (id) {
            G.nab[id].forEach(function (x) {
                if (G.el[x.n] === "C" && x.n > id) { if (x.orden === 2) d++; if (x.orden === 3) t++; }
                if (HALO[G.el[x.n]]) halo = true;
            });
        });
        res.antalC = G.C.length;
        res.antalDobbelt = d;
        res.antalTripel = t;
        res.halogen = halo;
        res.klasse = res.aromat || (G.ringCyk && G.ringAromat) ? "aromat" : (t ? "alkyn" : (d ? "alken" : "alkan"));
        if (G.ringCyk && !G.ringAromat) res.klasse = "cyklo" + res.klasse;
        var del = mol.del(ids);
        res.ladning = del.ladning();
        if (!res.navn && (res.grund === "ingenC" || res.grund === "hetero" || res.grund === "gruppe")) {
            var u = UORGANISK[Mol.formelAscii(del.optaelling()) + ladningsNoegle(res.ladning)];
            if (u) { res.navn = res.navnUdenStereo = u; res.grund = null; res.klasse = "uorganisk"; }
            else if (G.ladet.length) res.grund = "ion";
        }
        if (res.navn && res.klasse !== "uorganisk" && G.har) res.stofklasse = stofklasse(G, res);
        if (res.navnUdenStereo === undefined) res.navnUdenStereo = res.navn;
        res.alternativer = (res.alternativer || []).filter(function (a, i, l) {
            return a && l.indexOf(a) === i && a !== res.navn && a !== res.navnUdenStereo;
        });
        if (!res.tegnekaede && G.tunge.length && !G.ringCyk && !(G.antalRinge > 0)) res.tegnekaede = laengsteVej(G);
        return res;
    }

    /* Den gamle skrivemaade for en alken med én dobbeltbinding:
       2-methyl-2-buten i stedet for 2-methylbut-2-en. Bruges kun til at
       godkende et svar, der er skrevet saadan. */
    function gammelForm(res) {
        if (!res || !res.navn || res.hoved || res.radikofunktionel || res.ring || res.tripel.length || res.dobbelt.length !== 1 || res.kaede.length <= 3) return null;
        var pre = praefikser(res.sub, false);
        var t = pre + (pre ? "-" : "") + res.dobbelt[0] + "-" + STAMME[res.kaede.length] + "en";
        return (res.stereo ? res.stereo + "-" : "") + t;
    }

    /* Navnet paa kaeden alene (pentan, but-2-en), til hints */
    function kaedeNavn(res) {
        if (!res || !res.kaede) return "";
        return stam(res.kaede.length, res.dobbelt, res.tripel, false, res.ring) || "";
    }

    NK.Navn = {
        analyser: analyser,
        gammelForm: gammelForm,
        kaedeNavn: kaedeNavn,
        STAMME: STAMME,
        MULT: MULT,
        HALO: HALO
    };
}());

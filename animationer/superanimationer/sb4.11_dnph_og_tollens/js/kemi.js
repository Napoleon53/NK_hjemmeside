/* =====================================================================
   kemi.js - modellen: carbonylgruppen, de to test og reaktionerne

   Alt, eleven ser, regnes her ud af molekylet, som motoren bygger af
   navnet (../../molekylemotor/):
     * carbonylgruppen: et carbonatom med en dobbeltbinding til oxygen,
       som ellers kun er bundet til carbon og hydrogen. Det er gruppen i
       aldehyder og ketoner. I en carboxylsyre og en ester har
       carbonatomet ogsaa en binding til et andet oxygenatom, og der
       reagerer gruppen ikke med DNPH (bogens afsnit B4.3)
     * DNPH: positiv, naar der er en carbonylgruppe
     * Tollens' test: positiv, naar carbonylgruppens carbonatom ogsaa har
       et hydrogenatom (aldehydet kan oxideres videre)
     * bundfaldets farve: orange, naar carbonylgruppen sidder paa en
       benzenring, ellers gul (Basiskemi B: "gule eller orange")
     * fane 2: kondensationen med DNPH (atomerne og deres pladser foer og
       efter) og afstemningen af Tollens' reaktion i bogens trin
     * fane 3: flaskernes indhold giver testene og rutediagrammets svar
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    function el(mol, id) { return mol.atom(id).el; }

    /* ----- Stofferne ---------------------------------------------------------- */
    var cache = {};
    K.stof = function (navn) {
        if (!cache[navn]) {
            var mol = NK.NavnLaeser.laes(navn).mol;
            var res = NK.Navn.analyser(mol);
            cache[navn] = { navn: navn, mol: mol, klasse: res.stofklasse, motorNavn: res.navn };
        }
        return cache[navn];
    };

    /* Stofklassen, som eleven kender den (vanillin er ogsaa phenol og ether,
       men det, der tæller her, er aldehydet) */
    K.klasse = function (navn) {
        var k = K.stof(navn).klasse || "";
        var hoved = k.split(/,| og /)[0].trim();
        return D.KLASSER[hoved] ? hoved : k;
    };

    /* Carbonylgruppen i et aldehyd eller en keton: { c, o } eller null */
    K.carbonyl = function (mol) {
        var ud = null;
        mol.atomer.forEach(function (a) {
            if (ud || a.el !== "C") return;
            var o = null, andre = true;
            mol.naboer(a.id).forEach(function (n) {
                var e = el(mol, n), bd = mol.binding(a.id, n);
                if (e === "O" && bd.orden === 2) o = n;
                else if (e !== "C" && e !== "H") andre = false;
            });
            if (o !== null && andre) ud = { c: a.id, o: o };
        });
        return ud;
    };

    /* Et carbonatom med en dobbeltbinding til oxygen, ogsaa i en carboxylsyre
       eller ester. Bruges kun til at forklare et forkert svar */
    K.cDobbeltO = function (mol) {
        var ud = null;
        mol.atomer.forEach(function (a) {
            if (ud || a.el !== "C") return;
            mol.naboer(a.id).forEach(function (n) {
                if (ud === null && el(mol, n) === "O" && mol.binding(a.id, n).orden === 2) ud = { c: a.id, o: n };
            });
        });
        return ud;
    };

    /* Hydrogenatomer paa et atom: de tegnede og dem, der er regnet ud af valensen */
    K.hAntal = function (mol, id) {
        return mol.implicitH(id) + mol.naboer(id).filter(function (n) { return el(mol, n) === "H"; }).length;
    };

    K.dnph = function (mol) { return !!K.carbonyl(mol); };

    K.tollens = function (mol) {
        var c = K.carbonyl(mol);
        return !!c && K.hAntal(mol, c.c) >= 1;
    };

    /* Sidder atomet i en ring? (findes der en anden vej rundt til en nabo) */
    K.iRing = function (mol, id) {
        return mol.naboer(id).some(function (n) {
            var set = {}, koe = [n];
            set[n] = true;
            while (koe.length) {
                var x = koe.shift();
                var nb = mol.naboer(x);
                for (var i = 0; i < nb.length; i++) {
                    var y = nb[i];
                    if (x === n && y === id) continue;         /* ikke den direkte binding */
                    if (y === id) return true;
                    if (!set[y]) { set[y] = true; koe.push(y); }
                }
            }
            return false;
        });
    };

    /* Bundfaldets farve: orange, naar carbonylgruppen sidder paa en ring */
    K.farve = function (mol) {
        var c = K.carbonyl(mol);
        if (!c) return null;
        var ring = mol.naboer(c.c).some(function (n) { return el(mol, n) === "C" && K.iRing(mol, n); });
        return ring ? "orange" : "gul";
    };

    /* Resultatet af de to test for et rent stof */
    K.resultat = function (navn) {
        var mol = K.stof(navn).mol;
        return { dnph: K.dnph(mol), tollens: K.tollens(mol), farve: K.farve(mol), klasse: K.klasse(navn) };
    };

    /* Det rigtige svar paa kortet (indeks i D.SVAR) for en test */
    K.svarFor = function (navn, test) {
        var r = K.resultat(navn);
        if (test === "dnph") return r.dnph ? 0 : 2;
        return r.tollens ? 1 : 2;
    };

    /* Navnet, eleven ser */
    K.vist = function (s) { return s.vist || s.navn; };

    /* ----- Tegningen: zigzag med aldehydets H tegnet, som i bogens figur ----------
       Giver { mol, c, o, h } (h: id paa det tegnede H, eller null). Molekylet er
       en kopi, saa motorens eget bliver urørt */
    K.tegneMol = function (navn) {
        var mol = K.stof(navn).mol.kopi(), c = K.carbonyl(mol), h = null;
        if (c && mol.implicitH(c.c) === 1) {
            var a = mol.atom(c.c), v = NK.Layout.hRetninger(mol, c.c, 1)[0] * Math.PI / 180;
            var nh = mol.tilfoej("H", a.x + Math.cos(v), a.y + Math.sin(v));
            mol.bind(c.c, nh.id, 1);
            h = nh.id;
        }
        return { mol: mol, c: c ? c.c : null, o: c ? c.o : null, h: h, cDO: K.cDobbeltO(mol) };
    };

    /* ----- Fane 1: forklaringerne til forkerte svar ------------------------------ */
    K.testFejl = function (navn, vist, test, valgt) {
        var r = K.resultat(navn), V = D.stor(vist), kl = r.klasse;
        var valg = D.SVAR[valgt].id;
        if (test === "dnph") {
            if (valg === "spejl") return "Sølvspejlet hører til Tollens' test. DNPH giver et bundfald, når der er en carbonylgruppe.";
            if (valg === "ingen") return "Find C=O i " + vist + ". Carbonylgruppen i et aldehyd eller en keton reagerer med DNPH.";
            if (kl === "alkohol") return V + " har ingen carbonylgruppe, C=O. DNPH reagerer kun med aldehyder og ketoner.";
            if (kl === "carboxylsyre") return "I " + vist + " sidder C=O i en carboxylgruppe sammen med OH. DNPH reagerer kun med aldehyder og ketoner.";
            if (kl === "ester") return "I " + vist + " sidder C=O i en estergruppe ved siden af et O. DNPH reagerer kun med aldehyder og ketoner.";
            return "DNPH reagerer kun med carbonylgruppen i aldehyder og ketoner.";
        }
        if (valg === "bundfald") return "Bundfaldet hører til testen med DNPH. Tollens' test giver et sølvspejl eller ingen ændring.";
        if (valg === "ingen") return "Carbonylgruppens carbonatom har et H. Aldehydet kan oxideres, og Ag⁺ bliver til sølv.";
        if (kl === "keton") return "Carbonylgruppens carbonatom sidder mellem to carbonatomer og har intet H. Ketonen kan ikke oxideres videre.";
        if (kl === "alkohol") return V + " er ikke et aldehyd. Tollens' reagens er et mildt oxidationsmiddel, som kun oxiderer aldehyder.";
        if (kl === "carboxylsyre") return "Carbonatomet i carboxylgruppen har intet H. Syren er oxideret så langt, den kan.";
        if (kl === "ester") return "Carbonatomet i estergruppen har intet H, og " + vist + " er ikke et aldehyd.";
        return "Tollens' test viser kun aldehyder.";
    };

    /* Forklaringen, naar svaret er rigtigt */
    K.testForklaring = function (navn, vist, test) {
        var r = K.resultat(navn), V = D.stor(vist), kl = r.klasse;
        if (test === "dnph") {
            if (r.dnph) return V + " har en carbonylgruppe, C=O. DNPH reagerer med den og danner et " + (r.farve === "orange" ? "orange" : "gult") + " bundfald.";
            if (kl === "alkohol") return V + " har ingen carbonylgruppe. DNPH-opløsningen forbliver klar.";
            if (kl === "carboxylsyre") return "I " + vist + " sidder C=O i en carboxylgruppe sammen med OH. Carboxylgruppen reagerer ikke med DNPH.";
            if (kl === "ester") return "I " + vist + " sidder C=O i en estergruppe ved siden af et O. Estergruppen reagerer ikke med DNPH.";
            return V + " reagerer ikke med DNPH.";
        }
        if (r.tollens) return "Carbonylgruppens carbonatom har et H, så " + vist + " er et aldehyd. Aldehydet oxideres, og Ag⁺ bliver til et sølvspejl.";
        if (kl === "keton") return "Carbonylgruppens carbonatom har intet H, så " + vist + " er en keton. Ketonen kan ikke oxideres videre.";
        if (kl === "alkohol") return V + " er en alkohol og ikke et aldehyd. Tollens' reagens oxiderer kun aldehyder.";
        if (kl === "carboxylsyre") return "Carbonatomet i carboxylgruppen har intet H. " + V + " kan ikke oxideres videre.";
        if (kl === "ester") return "Carbonatomet i estergruppen har intet H. " + V + " giver intet sølvspejl.";
        return V + " giver intet sølvspejl.";
    };

    /* ----- Fane 2: kondensationen med DNPH ---------------------------------------
       Scenen er ét molekyle med alle atomerne i bindingslaengder. Carbonyl-
       forbindelsen drejes, saa C=O peger mod hoejre (C i (0, 0), O i (1, 0)), og
       DNPH staar til hoejre med NH₂-gruppen mod oxygen. Nitrogruppen tegnes
       som "NO₂"; i grafen er den et atom med én binding (grundstoffet I, som
       tegningen skriver om til NO₂).
       Efter reaktionen er C=O og de to N−H brudt, C=N er dannet, og oxygen og
       de to H er blevet til vand. Selvtesten tjekker, at atomerne passer. */
    var DNPH_START = 4;           /* x for NH₂-gruppens N foer reaktionen */
    var DNPH_SLUT = 1;            /* x for samme N efter reaktionen (der, hvor O stod) */
    var VAND = { x: 8.6, y: 0.2 };

    K.DNPH_ATOMER = [
        /* navn, grundstof, x, y (i forhold til NH₂-gruppens N) */
        ["Nb", "N", 0, 0], ["Hb1", "H", -1, 0], ["Hb2", "H", 0.5, 0.866],
        ["Na", "N", 0.5, -0.866], ["Ha", "H", 0, -1.732],
        ["C1", "C", 1.5, -0.866], ["C2", "C", 2, 0], ["C3", "C", 3, 0],
        ["C4", "C", 3.5, -0.866], ["C5", "C", 3, -1.732], ["C6", "C", 2, -1.732],
        ["No", "I", 1.5, -2.598], ["Np", "I", 4.5, -0.866]
    ];
    K.DNPH_BINDINGER = [
        ["Nb", "Hb1", 1], ["Nb", "Hb2", 1], ["Nb", "Na", 1], ["Na", "Ha", 1], ["Na", "C1", 1],
        ["C1", "C2", 2], ["C2", "C3", 1], ["C3", "C4", 2], ["C4", "C5", 1], ["C5", "C6", 2], ["C6", "C1", 1],
        ["C6", "No", 1], ["C4", "Np", 1]
    ];
    /* Nitrogruppen: NO₂ har N, 2 O og ingen H (til optaellingen) */
    K.NITRO = { N: 1, O: 2 };

    K.dnphScene = function (navn) {
        var t = K.tegneMol(navn), src = t.mol;
        var mol = new NK.Molekyle(), ny = {};
        /* Drej, saa C=O peger mod hoejre, og flyt C til (0, 0) */
        var c = src.atom(t.c), o = src.atom(t.o);
        var v = -Math.atan2(o.y - c.y, o.x - c.x), cs = Math.cos(v), sn = Math.sin(v);
        src.atomer.forEach(function (a) {
            var dx = a.x - c.x, dy = a.y - c.y;
            ny[a.id] = mol.tilfoej(a.el, dx * cs - dy * sn, dx * sn + dy * cs).id;
        });
        src.bindinger.forEach(function (bd) { mol.bind(ny[bd.a], ny[bd.b], bd.orden); });
        var id = { C: ny[t.c], O: ny[t.o], Hald: t.h !== null ? ny[t.h] : null }, dnph = [];
        K.DNPH_ATOMER.forEach(function (a) {
            var at = mol.tilfoej(a[1], DNPH_START + a[2], a[3]);
            id[a[0]] = at.id;
            dnph.push(at.id);
        });
        K.DNPH_BINDINGER.forEach(function (b) { mol.bind(id[b[0]], id[b[1]], b[2]); });
        var start = {}, slut = {};
        mol.atomer.forEach(function (a) { start[a.id] = { x: a.x, y: a.y }; slut[a.id] = { x: a.x, y: a.y }; });
        dnph.forEach(function (d) { slut[d] = { x: start[d].x - (DNPH_START - DNPH_SLUT), y: start[d].y }; });
        /* Vandet: O i midten og de to H skraat under, med vinklen fra vand */
        var vV = 52 * Math.PI / 180;
        slut[id.O] = { x: VAND.x, y: VAND.y };
        slut[id.Hb1] = { x: VAND.x - Math.sin(vV), y: VAND.y + Math.cos(vV) };
        slut[id.Hb2] = { x: VAND.x + Math.sin(vV), y: VAND.y + Math.cos(vV) };
        return {
            navn: navn, mol: mol, id: id, start: start, slut: slut, dnph: dnph,
            vand: [id.O, id.Hb1, id.Hb2],
            /* Bindingerne, der brydes, og dem, der dannes */
            brydes: [[id.C, id.O], [id.Nb, id.Hb1], [id.Nb, id.Hb2]],
            dannes: [[id.C, id.Nb, 2], [id.O, id.Hb1, 1], [id.O, id.Hb2, 1]],
            plus: { foer: { x: 2.5, y: 0 }, efter: { x: 7.25, y: 0.2 } },
            farve: K.farve(src)
        };
    };

    /* Topologien efter reaktionen (paa en kopi af scenens molekyle) */
    K.dnphEfter = function (sc) {
        var mol = sc.mol.kopi();
        sc.brydes.forEach(function (p) { var bd = mol.binding(p[0], p[1]); if (bd) mol.fjernBinding(bd); });
        sc.dannes.forEach(function (p) { mol.bind(p[0], p[1], p[2]); });
        mol.atomer.forEach(function (a) { var s = sc.slut[a.id]; a.x = s.x; a.y = s.y; });
        return mol;
    };

    /* Optaelling af grundstofferne i en del af et molekyle (med regnede H og
       nitrogrupperne skrevet ud) */
    K.taelDel = function (mol, ids) {
        var t = {}, set = {};
        (ids || mol.atomer.map(function (a) { return a.id; })).forEach(function (i) { set[i] = true; });
        function laeg(e, n) { t[e] = (t[e] || 0) + n; }
        mol.atomer.forEach(function (a) {
            if (!set[a.id]) return;
            if (a.el === "I") { laeg("N", K.NITRO.N); laeg("O", K.NITRO.O); return; }
            laeg(a.el, 1);
            var h = mol.implicitH(a.id);
            if (h) laeg("H", h);
        });
        return t;
    };

    /* Atomerne, der skal blive til vand: oxygen fra C=O og NH₂-gruppens to H */
    K.vandAtomer = function (sc) { return sc.vand.slice().sort(); };

    /* Forklaringen til et forkert valg af atomer (valgt: liste af id) */
    K.vandFejl = function (sc, valgt) {
        var id = sc.id, mol = sc.mol, ret = {};
        sc.vand.forEach(function (x) { ret[x] = true; });
        var o = valgt.filter(function (x) { return el(mol, x) === "O"; });
        var h = valgt.filter(function (x) { return el(mol, x) === "H"; });
        if (valgt.indexOf(id.Hald) >= 0 && id.Hald !== null)
            return "Hydrogenatomet på carbonatomet bliver siddende. Vandets to H kommer fra NH₂-gruppen i DNPH.";
        if (valgt.indexOf(id.Ha) >= 0)
            return "Hydrogenatomet på NH bliver siddende. Vandets to H kommer begge fra NH₂-gruppen for enden af DNPH.";
        if (valgt.some(function (x) { return el(mol, x) === "N"; }))
            return "Nitrogenatomerne bliver i molekylet. Vand er H₂O: ét oxygenatom og to hydrogenatomer.";
        if (!o.length) return "Vand er H₂O. Oxygenatomet kommer fra carbonylgruppen, C=O.";
        if (h.length !== 2 || o.length !== 1) return "Vand er H₂O: vælg ét oxygenatom og to hydrogenatomer.";
        return "Vælg oxygenatomet i C=O og de to H på NH₂-gruppen.";
    };

    /* ----- Fane 2: Tollens' reaktion ------------------------------------------------
       Aldehydet oxideres til carboxylat-ionen (carboxylsyren afgiver straks sin
       hydron i den basiske opløsning), og Ag⁺ reduceres til Ag. Afstemningen
       foelger bogens trin: oxidationstal, stigning og fald, ladning med OH⁻,
       hydrogen med H₂O og oxygen som tjek. */

    /* Oxidationstallet for et carbonatom: −1 for hver binding til H, +1 for hver
       binding til O (en dobbeltbinding +2), 0 til C */
    K.oxtal = function (mol, cId) {
        var t = -K.hAntal(mol, cId);
        mol.naboer(cId).forEach(function (n) {
            var e = el(mol, n);
            if (e === "O") t += mol.binding(cId, n).orden;
        });
        return t;
    };

    /* Bindingerne fra carbonatomet som tekst: "1 binding til H: −1, ..." */
    K.regnestykke = function (mol, cId) {
        var tH = K.hAntal(mol, cId), tO = 0, tC = 0;
        mol.naboer(cId).forEach(function (n) {
            var e = el(mol, n), o = mol.binding(cId, n).orden;
            if (e === "O") tO += o;
            if (e === "C") tC += o;
        });
        function b(n, hvad) { return (n === 1 ? "1 binding" : n + " bindinger") + " til " + hvad; }
        var dele = [];
        if (tH) dele.push(b(tH, "H") + ": " + D.fortegn(-tH));
        if (tO) dele.push(b(tO, "O") + ": " + D.fortegn(tO));
        if (tC) dele.push(b(tC, "C") + ": 0");
        return dele.join(", ");
    };

    /* Carboxylat-ionen, som aldehydet bliver til (navnet giver motoren) */
    K.carboxylat = function (navn) {
        var mol = K.stof(navn).mol.kopi(), c = K.carbonyl(mol);
        var o = mol.tilfoej("O", 0, 0);
        o.q = -1;
        mol.bind(c.c, o.id, 1);
        return NK.Navn.analyser(mol).navn;
    };

    function taelling(mol) {
        var t = { C: 0, H: 0, O: 0, q: 0 };
        mol.atomer.forEach(function (a) {
            t[a.el] = (t[a.el] || 0) + 1;
            t.H += mol.implicitH(a.id);
            t.q += a.q || 0;
        });
        return t;
    }
    K.taelling = taelling;

    function sfd(a, b) { return b ? sfd(b, a % b) : a; }

    K.tollensSkema = function (navn) {
        var ald = K.stof(navn), prodNavn = K.carboxylat(navn), prod = K.stof(prodNavn);
        /* Carboxylatgruppens carbonatom: det med to oxygenatomer */
        var cA = K.carbonyl(ald.mol).c, cP = null;
        prod.mol.atomer.forEach(function (a) {
            if (cP !== null || a.el !== "C") return;
            if (prod.mol.naboer(a.id).filter(function (n) { return el(prod.mol, n) === "O"; }).length === 2) cP = a.id;
        });
        var s = { aldehyd: navn, produkt: prodNavn, ald: ald, prod: prod, cA: cA, cP: cP };
        s.cFra = K.oxtal(ald.mol, cA);
        s.cTil = K.oxtal(prod.mol, cP);
        s.stigning = s.cTil - s.cFra;
        s.agFra = 1;
        s.agTil = 0;
        s.fald = s.agFra - s.agTil;
        var m = s.stigning * s.fald / sfd(s.stigning, s.fald);
        s.kAld = m / s.stigning;
        s.kAg = m / s.fald;
        var tA = taelling(ald.mol), tP = taelling(prod.mol);
        s.hAld = tA.H; s.hProd = tP.H; s.oAld = tA.O; s.oProd = tP.O; s.qProd = tP.q;
        /* Ladningen afstemmes med OH⁻ til venstre (basisk opløsning) */
        s.ladV0 = s.kAg * 1;
        s.ladH = s.kAld * tP.q;
        s.oh = s.ladV0 - s.ladH;
        /* Hydrogen afstemmes med H₂O til hoejre */
        s.hV = s.kAld * tA.H + s.oh;
        s.h2o = (s.hV - s.kAld * tP.H) / 2;
        /* Oxygen som tjek */
        s.oV = s.kAld * tA.O + s.oh;
        s.oH = s.kAld * tP.O + s.h2o;
        return s;
    };

    /* Er skemaet afstemt? Giver { atomer, ladning: [v, h], ok } */
    K.tollensTjek = function (s) {
        var t = {}, q = [0, 0];
        function laeg(side, n, tael) {
            Object.keys(tael).forEach(function (e) {
                if (e === "q") { q[side] += n * tael.q; return; }
                t[e] = (t[e] || 0) + (side === 0 ? 1 : -1) * n * tael[e];
            });
        }
        laeg(0, s.kAld, taelling(s.ald.mol));
        laeg(0, s.kAg, { Ag: 1, q: 1 });
        laeg(0, s.oh, { O: 1, H: 1, q: -1 });
        laeg(1, s.kAld, taelling(s.prod.mol));
        laeg(1, s.kAg, { Ag: 1 });
        laeg(1, s.h2o, { H: 2, O: 1 });
        var ok = q[0] === q[1] && Object.keys(t).every(function (e) { return t[e] === 0; });
        return { atomer: t, ladning: q, ok: ok };
    };

    /* Et forkert oxidationstal: hvad gik galt? */
    K.oxFejl = function (mol, cId, valgt) {
        var h = K.hAntal(mol, cId), o = 0, dobbelt = 0, c = 0;
        mol.naboer(cId).forEach(function (n) {
            var e = el(mol, n), or = mol.binding(cId, n).orden;
            if (e === "O") { o += or; if (or === 2) dobbelt++; }
            if (e === "C") c += or;
        });
        var rigtig = o - h;
        if (valgt === -rigtig && rigtig !== 0)
            return "Fortegnet er byttet om. En binding til O tæller +1, og en binding til H tæller −1.";
        if (dobbelt && valgt === rigtig - dobbelt)
            return "En dobbeltbinding til O tæller +2. Begge elektronpar trækkes over til oxygen.";
        if (c && (valgt === rigtig - c || valgt === rigtig + c))
            return "En binding til et andet carbonatom tæller 0.";
        return "Tæl bindingerne fra det markerede carbonatom én ad gangen: til H −1, til O +1 og til C 0.";
    };

    /* ----- Fane 3: flaskerne ---------------------------------------------------------
       Resultatet af en test for en flaske: "meget", "lidt" eller null. Farven
       kommer fra det stof, der giver bundfaldet */
    K.flaske = function (id) {
        for (var i = 0; i < D.FLASKER.length; i++) if (D.FLASKER[i].id === id) return D.FLASKER[i];
        return null;
    };

    K.flaskeResultat = function (id) {
        var f = K.flaske(id), ud = { dnph: null, tollens: null, farve: null };
        function op(gl, ny) { return gl === "meget" || ny === "meget" ? "meget" : (gl || ny); }
        f.indhold.forEach(function (x) {
            var r = K.resultat(x[0]);
            if (r.dnph) {
                ud.dnph = op(ud.dnph, x[1]);
                if (!ud.farve || x[1] === "meget") ud.farve = r.farve;
            }
            if (r.tollens) ud.tollens = op(ud.tollens, x[1]);
        });
        return ud;
    };

    /* Rutediagrammet: DNPH foerst, saa Tollens' test */
    K.rute = function (res) {
        if (!res.dnph) return "ingen";
        return res.tollens ? "aldehyd" : "keton";
    };

    /* Teksten under et glas paa fane 3 */
    K.dnphTekst = function (res) {
        if (!res.dnph) return "ingen ændring";
        return (res.dnph === "lidt" ? "lidt " : "") + (res.farve === "orange" ? "orange" : "gult") + " bundfald";
    };
    K.tollensTekst = function (res) { return res.tollens ? "sølvspejl" : "ingen ændring"; };

    NK.Kemi = K;
}());

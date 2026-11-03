/* =====================================================================
   kemi.js - modellen: oxidationstallet, oxidationen og produktet

   Alt, eleven ser, regnes her ud af molekylet:
     * oxidationstallet for et carbonatom: hver binding giver elektronparret
       til det mest elektronegative atom (D.EN). En binding til H giver
       derfor −1, til O +1 (dobbeltbinding +2) og til C 0. Det er bogens
       regel i afsnit B4.3, men den regnes af elektronegativiteten
     * oxidationen: carbonatomet mister et hydrogenatom. Har det en
       OH-gruppe, gaar OH-gruppens H ogsaa, og C−O bliver til C=O
       (alkohol til aldehyd eller keton). Har det C=O, kommer der et
       oxygenatom ind mellem C og H (aldehyd til carboxylsyre)
     * typen: antallet af andre carbonatomer paa carbonatomet med OH
     * produktet paa fane 2: samme oxidation paa motorens molekyle uden
       H-atomer, og motoren giver navnet

   Fane 1 bruger molekyler med alle H som rigtige atomer (stilen "alle").
   Fane 2 bruger motorens molekyler, hvor H er regnet ud af valensen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    function el(mol, id) { return mol.atom(id).el; }

    /* ----- Fane 1: et molekyle med alle atomer --------------------------------
       Giver { mol, id: navn -> motorens id, navn: motorens id -> navn, c } */
    K.byg = function (serie) {
        var mol = new NK.Molekyle(), id = {}, navn = {};
        serie.atomer.forEach(function (a) {
            var at = mol.tilfoej(a[1], a[2], a[3]);
            id[a[0]] = at.id;
            navn[at.id] = a[0];
        });
        serie.bindinger.forEach(function (b) { mol.bind(id[b[0]], id[b[1]], b[2]); });
        return { mol: mol, id: id, navn: navn, c: id[serie.c] };
    };

    /* Bindingerne fra et atom: hvem der faar elektronparret, og hvad det giver */
    K.bindingerFra = function (mol, cId) {
        var enC = D.EN[el(mol, cId)];
        return mol.bindingerTil(cId).map(function (bd) {
            var nabo = bd.a === cId ? bd.b : bd.a, e = el(mol, nabo), enN = D.EN[e];
            var tal = enN > enC ? bd.orden : (enN < enC ? -bd.orden : 0);
            return { bd: bd, nabo: nabo, el: e, orden: bd.orden, tal: tal, til: tal > 0 ? nabo : (tal < 0 ? cId : null) };
        });
    };

    K.oxtal = function (mol, cId) {
        return K.bindingerFra(mol, cId).reduce(function (s, b) { return s + b.tal; }, 0);
    };

    /* Optaellingen til hint og forklaring: antal bindinger til H, O og C */
    K.optael = function (mol, cId) {
        var t = { H: 0, O: 0, C: 0, dobbeltO: 0 };
        K.bindingerFra(mol, cId).forEach(function (b) {
            t[b.el] += b.orden;
            if (b.el === "O" && b.orden === 2) t.dobbeltO++;
        });
        return t;
    };

    K.hPaa = function (mol, id) {
        return mol.naboer(id).filter(function (n) { return el(mol, n) === "H"; });
    };

    /* OH-gruppens oxygenatom paa carbonatomet (enkeltbinding, og O har et H) */
    K.ohPaa = function (mol, cId) {
        var ud = null;
        mol.naboer(cId).forEach(function (n) {
            if (ud !== null || el(mol, n) !== "O") return;
            var bd = mol.binding(cId, n);
            if (bd.orden !== 1) return;
            var h = K.hPaa(mol, n);
            if (h.length) ud = { o: n, h: h[0] };
        });
        return ud;
    };

    K.dobbeltO = function (mol, cId) {
        var ud = null;
        mol.naboer(cId).forEach(function (n) {
            if (ud === null && el(mol, n) === "O" && mol.binding(cId, n).orden === 2) ud = n;
        });
        return ud;
    };

    /* Planen for en oxidation, naar oxidationsmidlet tager hId fra carbonatomet.
       Giver null, hvis carbonatomet ikke kan oxideres paa den maade.
         slags "alkohol":  hId og OH-gruppens H fjernes, C−O bliver C=O
         slags "aldehyd":  et nyt O kommer ind mellem C og H */
    K.plan = function (mol, cId, hId) {
        if (K.hPaa(mol, cId).indexOf(hId) < 0) return null;
        var oh = K.ohPaa(mol, cId);
        if (oh) return { slags: "alkohol", h: hId, oh: oh.h, o: oh.o };
        var dob = K.dobbeltO(mol, cId);
        if (dob !== null) {
            var c = mol.atom(cId), h = mol.atom(hId);
            var dx = h.x - c.x, dy = h.y - c.y, l = Math.hypot(dx, dy) || 1;
            dx /= l; dy /= l;
            return { slags: "aldehyd", h: hId, fra: { x: h.x, y: h.y },
                nytO: { x: c.x + dx, y: c.y + dy }, nytH: { x: c.x + dx * 2, y: c.y + dy * 2 } };
        }
        return null;
    };

    /* Udfoer planen paa molekylet. Giver id'et paa et nyt oxygenatom (eller null) */
    K.udfoer = function (mol, cId, plan) {
        if (plan.slags === "alkohol") {
            mol.fjernAtom(plan.h);
            mol.fjernAtom(plan.oh);
            mol.binding(cId, plan.o).orden = 2;
            return null;
        }
        var o = mol.tilfoej("O", plan.nytO.x, plan.nytO.y);
        mol.fjernBinding(mol.binding(cId, plan.h));
        var h = mol.atom(plan.h);
        h.x = plan.nytH.x;
        h.y = plan.nytH.y;
        mol.bind(cId, o.id, 1);
        mol.bind(o.id, plan.h, 1);
        return o.id;
    };

    /* Den plads, en serie kan komme til at fylde: startmolekylet og det H, der
       ender en binding laengere ude, naar et aldehyd bliver til en syre */
    K.graenser = function (b) {
        var mol = b.mol, c = mol.atom(b.c), g = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
        function med(x, y) { g.x0 = Math.min(g.x0, x); g.y0 = Math.min(g.y0, y); g.x1 = Math.max(g.x1, x); g.y1 = Math.max(g.y1, y); }
        mol.atomer.forEach(function (a) { med(a.x, a.y); });
        K.hPaa(mol, b.c).forEach(function (h) { var a = mol.atom(h); med(c.x + 2 * (a.x - c.x), c.y + 2 * (a.y - c.y)); });
        return g;
    };

    /* Molekylet uden H-atomer, saa motoren kan navngive det */
    K.tung = function (mol) {
        var ud = new NK.Molekyle(), ny = {};
        mol.atomer.forEach(function (a) {
            if (a.el === "H") return;
            ny[a.id] = ud.tilfoej(a.el, a.x, a.y).id;
        });
        mol.bindinger.forEach(function (bd) {
            if (ny[bd.a] !== undefined && ny[bd.b] !== undefined) ud.bind(ny[bd.a], ny[bd.b], bd.orden);
        });
        return ud;
    };

    /* Navn og stofklasse fra motoren */
    K.navn = function (mol) {
        var res = NK.Navn.analyser(K.tung(mol));
        return { navn: res.navn || "", klasse: res.stofklasse || "" };
    };

    /* ----- Fane 2: motorens molekyler (H regnet ud af valensen) ---------------- */

    /* Carbonatomet med OH-gruppen i et molekyle uden H-atomer */
    K.cMedOH = function (mol) {
        var ud = null;
        mol.atomer.forEach(function (a) {
            if (ud !== null || a.el !== "O" || mol.implicitH(a.id) !== 1) return;
            var nb = mol.naboer(a.id);
            if (nb.length === 1 && el(mol, nb[0]) === "C" && mol.binding(a.id, nb[0]).orden === 1) ud = { c: nb[0], o: a.id };
        });
        return ud;
    };

    K.cNaboer = function (mol, cId) {
        return mol.naboer(cId).filter(function (n) { return el(mol, n) === "C"; });
    };

    /* Typen af alkohol: antallet af andre carbonatomer (methanol er primaer) */
    K.type = function (mol, cId) {
        var n = K.cNaboer(mol, cId).length;
        return n <= 1 ? "primaer" : (n === 2 ? "sekundaer" : "tertiaer");
    };

    /* Alkoholen paa fane 2 */
    K.alkohol = function (navn) {
        var mol = NK.NavnLaeser.laes(navn).mol;
        var oh = K.cMedOH(mol);
        return { navn: navn, mol: mol, c: oh.c, o: oh.o, type: K.type(mol, oh.c), h: mol.implicitH(oh.c) };
    };

    /* Produktet: navnet paa det, alkoholen bliver til, eller null.
       mild: en primaer alkohol stopper ved aldehydet */
    K.produkt = function (alk, maade) {
        var mol = alk.mol.kopi();
        if (mol.implicitH(alk.c) < 1) return null;
        mol.binding(alk.c, alk.o).orden = 2;
        if (maade !== "mild" && mol.implicitH(alk.c) >= 1) {
            var o = mol.tilfoej("O", 0, 0);
            mol.bind(alk.c, o.id, 1);
        }
        return NK.Navn.analyser(mol).navn;
    };

    /* Et stof paa tavlen (et af svarene): molekylet, navnet og stofklassen */
    var cache = {};
    K.stof = function (navn) {
        if (!cache[navn]) {
            var mol = NK.NavnLaeser.laes(navn).mol;
            var res = NK.Navn.analyser(mol);
            cache[navn] = { navn: navn, mol: mol, klasse: res.stofklasse };
        }
        return cache[navn];
    };

    /* ----- Fane 3: forsoeget med permanganat ----------------------------------- */

    /* Et skema som tekst. mangler: vis "?" i stedet for antallet af OH⁻ */
    K.skemaDele = function (type) {
        var sk = D.FORSOEG.skemaer[type];
        function side(l) { return l.map(function (x) { return { n: x[0], stof: x[1] }; }); }
        return { venstre: side(sk.venstre), hoejre: side(sk.hoejre) };
    };

    /* Er skemaet afstemt? Giver { atomer: {..}, ladning: [v, h], ok } */
    K.afstemt = function (type) {
        var sk = D.FORSOEG.skemaer[type], S = D.FORSOEG.STOFFER, t = {}, q = [0, 0];
        [sk.venstre, sk.hoejre].forEach(function (l, i) {
            l.forEach(function (x) {
                var st = S[x[1]];
                Object.keys(st).forEach(function (e) {
                    if (e === "q") { q[i] += x[0] * st.q; return; }
                    t[e] = (t[e] || 0) + (i === 0 ? 1 : -1) * x[0] * st[e];
                });
            });
        });
        var ok = q[0] === q[1] && Object.keys(t).every(function (e) { return t[e] === 0; });
        return { atomer: t, ladning: q, ok: ok };
    };

    K.ohPrMnO4 = function (type) {
        if (type === "tertiaer") return 0;
        var sk = D.FORSOEG.skemaer[type], oh = 0, mn = 0;
        sk.hoejre.forEach(function (x) { if (x[1] === "OH⁻") oh = x[0]; });
        sk.venstre.forEach(function (x) { if (x[1] === "MnO₄⁻") mn = x[0]; });
        return oh / mn;
    };

    /* ----- Afstemningen trin for trin (bogens fem trin, C-bogens afsnit 8.4) -----
       Alt regnes af molekylerne: oxidationstallet for carbonatomet med den
       funktionelle gruppe, mangans oxidationstal, koefficienterne,
       ladningen, hydrogen og oxygen. Selvtesten tjekker, at resultatet er
       skemaerne i D.FORSOEG. */

    /* Oxidationstallet for et carbonatom i et molekyle uden H-atomer */
    K.oxtalTung = function (mol, cId) {
        var t = -mol.implicitH(cId);
        mol.naboer(cId).forEach(function (n) {
            var e = mol.atom(n).el;
            if (e === "O") t += mol.binding(cId, n).orden;
        });
        return t;
    };

    /* Carbonatomet med den funktionelle gruppe: med OH (alkoholen) eller C=O */
    K.cGruppe = function (mol) {
        var oh = K.cMedOH(mol);
        if (oh) return oh.c;
        var ud = null;
        mol.atomer.forEach(function (a) {
            if (ud !== null || a.el !== "C") return;
            mol.naboer(a.id).forEach(function (n) { if (mol.atom(n).el === "O" && mol.binding(a.id, n).orden === 2) ud = a.id; });
        });
        return ud;
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

    function sfd(a, b) { return b ? sfd(b, a % b) : a; }

    K.afstem = function (type) {
        var navne = { primaer: ["propan-1-ol", "propanoat"], sekundaer: ["propan-2-ol", "propanon"] }[type];
        var alk = K.stof(navne[0]), prod = K.stof(navne[1]);
        var cA = K.cGruppe(alk.mol), cP = K.cGruppe(prod.mol);
        var a = { type: type, alkohol: navne[0], produkt: navne[1], alk: alk, prod: prod, cA: cA, cP: cP };
        a.cFra = K.oxtalTung(alk.mol, cA);
        a.cTil = K.oxtalTung(prod.mol, cP);
        a.stigning = a.cTil - a.cFra;
        /* Mangan: MnO₄⁻ og MnO₂, oxygen er −II */
        a.mnFra = -1 + 2 * 4;
        a.mnTil = 0 + 2 * 2;
        a.fald = a.mnFra - a.mnTil;
        var m = a.stigning * a.fald / sfd(a.stigning, a.fald);
        a.kAlk = m / a.stigning;
        a.kMn = m / a.fald;
        a.samlet = m;
        var tA = taelling(alk.mol), tP = taelling(prod.mol);
        a.hAlk = tA.H; a.hProd = tP.H; a.oAlk = tA.O; a.oProd = tP.O; a.qProd = tP.q;
        /* Trin 3: ladningen afstemmes med OH⁻ til hoejre */
        a.ladV = -a.kMn;
        a.ladH = a.kAlk * tP.q;
        a.oh = a.ladH - a.ladV;
        /* Trin 4: hydrogen afstemmes med H₂O til hoejre */
        a.hV = a.kAlk * tA.H;
        a.hH = a.kAlk * tP.H + a.oh;
        a.h2o = (a.hV - a.hH) / 2;
        /* Trin 5: oxygen som tjek */
        a.oV = a.kAlk * tA.O + 4 * a.kMn;
        a.oH = a.kAlk * tP.O + 2 * a.kMn + a.oh + a.h2o;
        return a;
    };

    /* Bundfaldet af MnO₂ paa fane 3: lige saa meget, som skemaet siger, at
       alkoholen bruger MnO₄⁻ (4 for 3 propan-1-ol, 2 for 3 propan-2-ol). Giver
       en brøkdel af vaeskens hoejde */
    K.bundfald = function (type) {
        if (type === "tertiaer") return 0;
        var a = K.afstem(type);
        return 0.2 * a.kMn / a.kAlk;
    };

    /* Den fulde strukturformel med alle H til fane 3: motorens struktur90, og
       carbonatomet med OH-gruppen og dets hydrogenatomer */
    K.fuldStruktur = function (navn) {
        var tung = NK.NavnLaeser.laes(navn).mol, res = NK.Navn.analyser(tung);
        var mol = NK.Layout.struktur90(tung, res), c = null;
        mol.atomer.forEach(function (at) {
            if (c !== null || at.el !== "C") return;
            mol.naboer(at.id).forEach(function (n) {
                if (mol.atom(n).el === "O" && mol.binding(at.id, n).orden === 1 && K.hPaa(mol, n).length) c = at.id;
            });
        });
        return { mol: mol, c: c, h: K.hPaa(mol, c) };
    };

    /* pH efter forsoeget: al permanganaten reagerer, og OH⁻ kommer fra skemaet */
    K.forsoegPH = function (type) {
        var f = D.FORSOEG, n = f.nMnO4 * K.ohPrMnO4(type);
        if (n <= 0) return 7;
        return 14 + Math.log(n / f.volumen) / Math.LN10;
    };

    /* ----- Forklaringerne ------------------------------------------------------ */

    function bindinger(n, hvad) {
        return (n === 1 ? "1 binding" : n + " bindinger") + " til " + hvad;
    }

    /* Regnestykket som i bogens figur: "2 bindinger til H: −2, 1 binding til O: +1".
       En dobbeltbinding taeller som 2 bindinger */
    K.regnestykke = function (mol, cId) {
        var t = K.optael(mol, cId), dele = [];
        if (t.H) dele.push(bindinger(t.H, "H") + ": " + D.fortegn(-t.H));
        if (t.O) dele.push(bindinger(t.O, "O") + ": " + D.fortegn(t.O));
        if (t.C) dele.push(bindinger(t.C, "C") + ": 0");
        return dele.join(", ");
    };

    /* Et forkert oxidationstal: hvad gik galt? */
    K.oxFejl = function (mol, cId, valgt) {
        var t = K.optael(mol, cId), rigtig = t.O - t.H;
        if (valgt === -rigtig && rigtig !== 0)
            return "Fortegnet er byttet om. Oxygen trækker elektronerne til sig, så en binding til O tæller +1. Fra hydrogen får carbon elektronerne, så en binding til H tæller −1.";
        if (t.dobbeltO && valgt === rigtig - t.dobbeltO)
            return "En dobbeltbinding til O tæller +2. Begge elektronpar trækkes over til oxygen.";
        if (t.C && (valgt === rigtig - t.C || valgt === rigtig + t.C))
            return "En binding til et andet carbonatom tæller 0. De to carbonatomer trækker lige meget i elektronerne.";
        if (valgt === -t.H || valgt === t.O)
            return "Tæl alle fire bindinger fra det markerede carbonatom med, både dem til H og dem til O.";
        return "Tæl bindingerne fra det markerede carbonatom én ad gangen: til H −1, til O +1 og til C 0.";
    };

    NK.Kemi = K;
}());

/* =====================================================================
   kemi.js - esteren, dens to dele, navnet og forklaringerne

   Alt, der har med kemien at goere, og ingen tegning:
     K.stof(navn)          stoffet bygget af navnet (molekylemotoren)
     K.byg(syre, alkohol)  esteren: syrens OH og alkoholens H gaar af som
                           vand, og syrens carbonatom bindes til alkoholens
                           oxygenatom. Motoren navngiver den, og den tegnes
                           som i bogen: syredelen til venstre med C=O opad
     K.esterDele(mol)      estergruppen og de to dele: syredelen (med C=O)
                           og alkoholdelen (med det enkeltbundne O)
     K.alkyl, K.oat        navnets to dele: propan-1-ol -> propyl,
                           butansyre -> butanoat
     K.navnValg(opg)       tre navne at vaelge imellem (rigtigt, byttet om,
                           syrens navn uaendret eller syredelen foerst)
     K.syreValg, K.alkoholValg   de tre svar paa fane 2, Svaer
     K.kondScene(s, a)     fane 1: syren og alkoholen med OH-gruppernes H
                           tegnet, foer og efter kondensationen
     K.vandFejl, K.tegneFejl, K.navnFejl ...   forklaringerne til et
                           forkert svar, der siger, hvad eleven kan se

   Bindingslaengden er 1. y vokser nedad, som paa laerredet.
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

    K.antal = function (mol, e) {
        return mol.atomer.filter(function (a) { return a.el === e; }).length;
    };

    K.antalC = function (navn) { return K.antal(K.stof(navn).mol, "C"); };

    /* ----- Navnene ----------------------------------------------------------- */
    K.alkyl = function (alkohol) { return alkohol.replace(/an-1-ol$|anol$/, "yl"); };
    K.oat = function (syre) { return syre.replace(/ansyre$/, "anoat"); };
    K.navn = function (syre, alkohol) { return K.alkyl(alkohol) + K.oat(syre); };

    /* Lige kaeder ud fra antallet af carbonatomer */
    K.syreN = function (n) { return D.STAMMER[n - 1] + "ansyre"; };
    K.alkoholN = function (n) { return D.STAMMER[n - 1] + (n <= 2 ? "anol" : "an-1-ol"); };
    K.alkylN = function (n) { return D.STAMMER[n - 1] + "yl"; };
    K.oatN = function (n) { return D.STAMMER[n - 1] + "anoat"; };

    /* ----- Estergruppen i et molekyle ----------------------------------------------
       Et carbonatom med et dobbeltbundet O og et enkeltbundet O, der ogsaa er
       bundet til et carbonatom. Giver { c, oD, oB, r, syre, alkohol } eller
       null. syre og alkohol er listerne af atomer i hver del: syredelen er
       carbonatomet i C=O og alt paa den side (med oD), alkoholdelen er oB og
       alt paa den anden side. */
    K.esterDele = function (mol) {
        var fund = null;
        mol.atomer.forEach(function (a) {
            if (fund || a.el !== "C") return;
            var oD = null, oB = null, r = null;
            mol.bindingerTil(a.id).forEach(function (bd) {
                var n = bd.a === a.id ? bd.b : bd.a;
                if (el(mol, n) !== "O") return;
                if (bd.orden === 2) oD = n;
                else if (bd.orden === 1) {
                    var andre = mol.naboer(n).filter(function (x) { return x !== a.id && el(mol, x) === "C"; });
                    if (andre.length === 1) { oB = n; r = andre[0]; }
                }
            });
            if (oD !== null && oB !== null) fund = { c: a.id, oD: oD, oB: oB, r: r };
        });
        if (!fund) return null;
        function del(start, spaerret) {
            var set = {}, koe = [start];
            set[start] = true;
            set[spaerret] = true;
            while (koe.length) {
                var x = koe.shift();
                mol.naboer(x).forEach(function (n) { if (!set[n]) { set[n] = true; koe.push(n); } });
            }
            delete set[spaerret];
            return Object.keys(set).map(Number);
        }
        fund.syre = del(fund.c, fund.oB);
        fund.alkohol = del(fund.oB, fund.c);
        fund.cSyre = fund.syre.filter(function (id) { return el(mol, id) === "C"; }).length;
        fund.cAlkohol = fund.alkohol.filter(function (id) { return el(mol, id) === "C"; }).length;
        return fund;
    };

    /* Spejlvend, saa syredelen staar til venstre og C=O peger opad, som i bogen */
    K.normaliser = function (mol) {
        var d = K.esterDele(mol);
        if (!d) return mol;
        var c = mol.atom(d.c), oB = mol.atom(d.oB), oD = mol.atom(d.oD);
        var sx = oB.x < c.x ? -1 : 1;
        mol.atomer.forEach(function (a) { a.x *= sx; });
        if (d.cSyre === 1 && mol.naboer(d.c).length === 2) {
            /* Methanoat: motoren tegner =O som kaedens start. I bogen staar
               carbonatomet oeverst i zigzaggen med =O lodret op og H skraat
               ned til venstre (K.medH saetter H paa den frie plads) */
            if (c.y > oB.y) mol.atomer.forEach(function (a) { a.y = -a.y; });
            oD.x = c.x;
            oD.y = c.y - 1;
            return mol;
        }
        var sy = oD.y > c.y ? -1 : 1;
        mol.atomer.forEach(function (a) { a.y *= sy; });
        return mol;
    };

    /* ----- Esteren af en syre og en alkohol ------------------------------------------
       Grafen bygges som i reaktionen (syren uden sit OH-oxygen og hele
       alkoholen, bundet sammen), og motoren giver navnet. Tegningen er
       navnelaeserens, saa esteren ser ud som andre steder. */
    var esterCache = {};
    K.byg = function (syre, alkohol) {
        var noegle = syre + "|" + alkohol;
        if (esterCache[noegle]) return esterCache[noegle];
        var s = K.stof(syre).mol, a = K.stof(alkohol).mol;
        var cS = null, ohS = null, ohA = null;
        s.atomer.forEach(function (x) {
            if (x.el !== "O" || s.naboer(x.id).length !== 1) return;
            var c = s.naboer(x.id)[0];
            var bd = s.binding(x.id, c);
            if (bd && bd.orden === 1) { ohS = x.id; cS = c; }
        });
        a.atomer.forEach(function (x) {
            if (x.el === "O" && a.naboer(x.id).length === 1) ohA = x.id;
        });
        var mol = new NK.Molekyle(), ny = {}, nyA = {};
        s.atomer.forEach(function (x) { if (x.id !== ohS) ny[x.id] = mol.tilfoej(x.el, x.x, x.y).id; });
        s.bindinger.forEach(function (bd) { if (bd.a !== ohS && bd.b !== ohS) mol.bind(ny[bd.a], ny[bd.b], bd.orden); });
        a.atomer.forEach(function (x) { nyA[x.id] = mol.tilfoej(x.el, x.x + 10, x.y).id; });
        a.bindinger.forEach(function (bd) { mol.bind(nyA[bd.a], nyA[bd.b], bd.orden); });
        mol.bind(ny[cS], nyA[ohA], 1);
        var res = NK.Navn.analyser(mol);
        var tegnet = K.normaliser(K.stof(res.navn).mol.kopi());
        var ud = { syre: syre, alkohol: alkohol, navn: res.navn, mol: tegnet, dele: K.esterDele(tegnet) };
        esterCache[noegle] = ud;
        return ud;
    };

    /* Syren med COOH-gruppen til hoejre og C=O opad, alkoholen med OH-gruppen
       til venstre, som foer reaktionen i bogens figur b4-esterdannelse */
    K.normaliserSyre = function (mol) {
        var c = null, oH = null, oD = null;
        mol.atomer.forEach(function (a) {
            if (a.el !== "O" || mol.naboer(a.id).length !== 1) return;
            var n = mol.naboer(a.id)[0], bd = mol.binding(a.id, n);
            if (bd.orden === 2) { oD = a; c = mol.atom(n); } else oH = a;
        });
        if (!c || !oH || !oD) return mol;
        var sx = oH.x < c.x ? -1 : 1, sy = oD.y > c.y ? -1 : 1;
        mol.atomer.forEach(function (a) { a.x *= sx; a.y *= sy; });
        return mol;
    };

    K.normaliserAlkohol = function (mol) {
        var o = mol.atomer.filter(function (a) { return a.el === "O"; })[0];
        if (!o || !mol.naboer(o.id).length) return mol;
        var c = mol.atom(mol.naboer(o.id)[0]);
        if (o.x > c.x) mol.atomer.forEach(function (a) { a.x = -a.x; });
        return mol;
    };

    /* Til visning: carbonatomet i en methanoat- eller methansyregruppe faar
       sit H tegnet, som i bogen (H−C=O). Molekylet er en kopi */
    K.medH = function (mol) {
        mol = mol.kopi();
        mol.atomer.slice().forEach(function (a) {
            if (a.el !== "C" || mol.implicitH(a.id) !== 1) return;
            var dblO = mol.bindingerTil(a.id).some(function (bd) {
                var n = bd.a === a.id ? bd.b : bd.a;
                return bd.orden === 2 && el(mol, n) === "O";
            });
            if (!dblO) return;
            var v = NK.Layout.hRetninger(mol, a.id, 1)[0] * Math.PI / 180;
            var h = mol.tilfoej("H", a.x + Math.cos(v), a.y + Math.sin(v));
            mol.bind(a.id, h.id, 1);
        });
        return mol;
    };

    /* Esteren af navnet (fane 2, Svaer): tegnet som i bogen */
    K.esterAfNavn = function (navn) {
        var mol = K.normaliser(K.stof(navn).mol.kopi());
        return { navn: navn, mol: mol, dele: K.esterDele(mol) };
    };

    /* ----- Formlen ------------------------------------------------------------------ */
    K.optael = function (mol) {
        var t = mol.optaelling();
        return { C: t.C || 0, O: t.O || 0, H: t.H || 0 };
    };

    K.formelTekst = function (t) { return NK.Molekyle.formelTekst({ C: t.C, H: t.H, O: t.O }); };

    K.tal = function (n) { return D.TAL[n] !== undefined ? D.TAL[n] : String(n); };
    function cAtomer(n) { return K.tal(n) + " carbonatom" + (n === 1 ? "" : "er"); }
    K.cAtomer = cAtomer;

    /* ----- Navnet: tre svar ------------------------------------------------------------
       Typerne er de fejl, elever laver: syredelen og alkoholdelen byttet om,
       syrens navn uaendret (ethylethansyre) og syredelen foerst (ethanoatethyl,
       kun naar byttet om giver det samme navn). Raekkefoelgen er fast for
       hver ester, men ikke altid med det rigtige foerst. */
    function bland(liste, noegle) {
        var h = 0;
        for (var i = 0; i < noegle.length; i++) h = (h * 31 + noegle.charCodeAt(i)) % 9973;
        var ud = liste.slice();
        for (var j = ud.length - 1; j > 0; j--) {
            h = (h * 7 + 13) % 9973;
            var k = h % (j + 1), t = ud[j];
            ud[j] = ud[k];
            ud[k] = t;
        }
        return ud;
    }

    K.navnValg = function (opg) {
        var rigtig = K.navn(opg.syre, opg.alkohol);
        var liste;
        if (opg.navnValg) {
            liste = opg.navnValg.map(function (n, i) { return { t: n, type: i === 0 ? "rigtig" : (i === 1 ? "kaede" : "byttet") }; });
        } else {
            var nS = K.antalC(opg.syre), nA = K.antalC(opg.alkohol);
            liste = [{ t: rigtig, type: "rigtig" }];
            if (nS !== nA) liste.push({ t: K.alkylN(nS) + K.oatN(nA), type: "byttet" });
            else liste.push({ t: K.oat(opg.syre) + K.alkyl(opg.alkohol), type: "foerst" });
            liste.push({ t: K.alkyl(opg.alkohol) + opg.syre, type: "syre" });
        }
        return bland(liste, rigtig);
    };

    K.navnFejl = function (opg, valg) {
        var a = K.alkyl(opg.alkohol), o = K.oat(opg.syre);
        if (valg.type === "byttet") return "Navnet begynder med alkoholdelen. Alkoholen er " + opg.alkohol + ", så navnet begynder med " + a + ".";
        if (valg.type === "foerst") return "Alkoholdelen står først i navnet med endelsen -yl, og syredelen står sidst med -oat.";
        if (valg.type === "syre") return "Syren har mistet sin OH-gruppe. Syredelen får endelsen -oat: " + o + ".";
        if (valg.type === "kaede") return "Alkoholdelen er forgrenet. Den længste kæde fra oxygenatomet har fire carbonatomer og en methylgruppe.";
        return "Prøv et andet navn.";
    };

    K.navnForklaring = function (opg) {
        return D.stor(K.alkyl(opg.alkohol)) + " kommer fra " + opg.alkohol + ", og " + K.oat(opg.syre) +
            " kommer fra " + opg.syre + "." + (opg.om ? " " + opg.om : "");
    };

    K.navnHints = function (opg) {
        return ["Alkoholdelen står først med endelsen -yl. Syredelen står sidst med endelsen -oat.",
            "Alkoholen er " + opg.alkohol + ", og syren er " + opg.syre + "."];
    };

    /* ----- Fane 2, Svaer: syren og alkoholen ud fra esteren ------------------------------ */
    function valgAf(navne, rigtig) {
        var set = {}, ud = [];
        navne.forEach(function (n) { if (n && !set[n]) { set[n] = true; ud.push(n); } });
        return ud.map(function (n) { return { t: n, type: n === rigtig ? "rigtig" : "" }; });
    }

    K.syreValg = function (opg) {
        if (opg.syreValg) return opg.syreValg.map(function (n, i) { return { t: n, type: i === 0 ? "rigtig" : "" }; });
        var nS = K.antalC(opg.syre), nA = K.antalC(opg.alkohol);
        var navne = [opg.syre, K.syreN(nA === nS ? nS + 1 : nA), K.syreN(nS > 1 ? nS - 1 : nS + 2)];
        var ud = valgAf(navne, opg.syre);
        ud.forEach(function (v) {
            if (v.type) return;
            var n = K.antalC(v.t);
            v.type = n === nA ? "byttet" : (n === nS - 1 ? "uden" : "andet");
        });
        return ud.sort(function (a, b) { return K.antalC(a.t) - K.antalC(b.t); });
    };

    K.alkoholValg = function (opg) {
        if (opg.alkoholValg) {
            return opg.alkoholValg.map(function (n, i) { return { t: n, type: i === 0 ? "rigtig" : (i === 1 ? "kaede" : "byttet") }; });
        }
        var nS = K.antalC(opg.syre), nA = K.antalC(opg.alkohol);
        var navne = [opg.alkohol, K.alkoholN(nS === nA ? nA + 2 : nS), K.alkoholN(nA + 1)];
        var ud = valgAf(navne, opg.alkohol);
        ud.forEach(function (v) {
            if (v.type) return;
            var n = K.antalC(v.t);
            v.type = n === nS ? "byttet" : (n === nA + 1 ? "med" : "andet");
        });
        return ud.sort(function (a, b) { return K.antalC(a.t) - K.antalC(b.t); });
    };

    K.syreFejl = function (opg, valg) {
        var nS = K.antalC(opg.syre);
        if (valg.type === "byttet") return "Syredelen er den del, der har C=O. Alkoholdelen sidder på det enkeltbundne oxygenatom.";
        if (valg.type === "uden") return "Carbonatomet i C=O hører også til syredelen. Syredelen har " + cAtomer(nS) + ".";
        return "Tæl carbonatomerne i den del, der har C=O, også carbonatomet i C=O.";
    };

    K.alkoholFejl = function (opg, valg) {
        if (valg.type === "byttet") return "Alkoholdelen er kæden på det enkeltbundne oxygenatom, ikke den del med C=O.";
        if (valg.type === "med") return "Carbonatomet i C=O hører til syredelen. Alkoholdelen er kun kæden på oxygenatomet.";
        if (valg.type === "kaede") return "Alkoholdelen er forgrenet: den længste kæde har fire carbonatomer og en methylgruppe.";
        return "Tæl carbonatomerne i kæden på det enkeltbundne oxygenatom.";
    };

    K.syreForklaring = function (opg) {
        return "Syredelen har C=O og " + cAtomer(K.antalC(opg.syre)) + ". Med OH-gruppen tilbage er det " + opg.syre + ".";
    };

    K.alkoholForklaring = function (opg) {
        return "Alkoholdelen er kæden på oxygenatomet. Med H tilbage på oxygenatomet er det " + opg.alkohol + ".";
    };

    /* ----- Fane 2: elevens tegning -------------------------------------------------------
       null: tegningen er den rigtige ester. Ellers forklaringen, der siger,
       hvad der er galt. */
    K.tegneFejl = function (opg, mol) {
        if (mol.fragmenter().length !== 1) return "Alle atomer skal hænge sammen i ét molekyle. Vandet skal ikke tegnes.";
        var res = NK.Navn.analyser(mol);
        var rigtig = K.byg(opg.syre, opg.alkohol).navn;
        if (res && res.navn === rigtig) return null;
        var t = K.optael(mol), nS = K.antalC(opg.syre), nA = K.antalC(opg.alkohol), n = nS + nA;
        var d = K.esterDele(mol), navn = res && res.navn ? res.navn : null;
        if (!d) {
            if (res && res.stofklasse === "carboxylsyre")
                return "Tavlen kalder tegningen " + navn + ", en carboxylsyre. I esteren sidder alkoholdelen på oxygenatomet i stedet for H.";
            if (res && res.stofklasse === "alkohol")
                return "Tavlen kalder tegningen " + navn + ", en alkohol. Esteren har både C=O og et oxygenatom i kæden.";
            if (t.O < 2) return "En ester har to oxygenatomer: ét med en dobbeltbinding og ét i kæden. Tegningen har " + K.tal(t.O) + ".";
            if (t.O > 2) return "En ester har kun to oxygenatomer: ét med en dobbeltbinding og ét i kæden.";
            var dbl = mol.bindinger.some(function (bd) { return bd.orden === 2 && (el(mol, bd.a) === "O" || el(mol, bd.b) === "O"); });
            if (!dbl) return "Estergruppen har et oxygenatom med en dobbeltbinding. Vælg =O, og klik på et carbonatom.";
            return "C=O og oxygenatomet i kæden skal sidde på det samme carbonatom: −COO−.";
        }
        if (t.O > 2) return "En ester har kun to oxygenatomer: ét med en dobbeltbinding og ét i kæden.";
        if (t.C !== n) return "Tegningen har " + cAtomer(t.C) + ", men " + opg.syre + " og " + opg.alkohol + " har tilsammen " + cAtomer(n) + ".";
        if (d.cSyre === nA && d.cAlkohol === nS)
            return "Tegningen er " + navn + ". C=O skal sidde i syredelen fra " + opg.syre + ", som har " + cAtomer(nS) + ".";
        if (d.cSyre !== nS)
            return "Tegningen er " + navn + ". Syredelen skal have " + cAtomer(nS) + " som " + opg.syre + ", regnet med C i C=O.";
        return "Tegningen er " + (navn || "en anden ester") + ". Alkoholdelen skal have kæden fra " + opg.alkohol + ".";
    };

    K.tegneHints = function (opg) {
        var nS = K.antalC(opg.syre), nA = K.antalC(opg.alkohol);
        return [
            "Tegn syredelen først: " + cAtomer(nS) + " med =O på det sidste carbonatom.",
            "Sæt et O på samme carbonatom, og tegn alkoholens " + cAtomer(nA) + " videre fra oxygenatomet."
        ];
    };

    K.tegneForklaring = function (opg) {
        return "Syrens OH-gruppe og alkoholens H er gået af som vand. Den grønne del kommer fra " + opg.syre +
            ", og den orange del kommer fra " + opg.alkohol + ".";
    };

    /* ----- Fane 1: scenen med syren og alkoholen ------------------------------------------
       Udgangspunktet er esteren, som den tegnes i bogen. Foer reaktionen er
       syredelen trukket til venstre med sin OH-gruppe (oxygenatomet staar,
       hvor esterens oxygenatom kommer til at staa) og alkoholen til hoejre
       med sit H (der, hvor syrens carbonatom kommer til at staa). Efter
       reaktionen staar esteren som i bogen, og vandet staar til hoejre.
       Selvtesten tjekker, at atomerne passer foer og efter. */
    var AFSTAND = 3.4;            /* hvor langt syren og alkoholen staar fra hinanden foer reaktionen */

    K.kondScene = function (syre, alkohol) {
        var b = K.byg(syre, alkohol), src = b.mol, d = b.dele;
        var mol = new NK.Molekyle(), ny = {};
        src.atomer.forEach(function (a) { ny[a.id] = mol.tilfoej(a.el, a.x, a.y).id; });
        src.bindinger.forEach(function (bd) {
            var esterBinding = (bd.a === d.c && bd.b === d.oB) || (bd.b === d.c && bd.a === d.oB);
            if (!esterBinding) mol.bind(ny[bd.a], ny[bd.b], bd.orden);
        });
        var pc = src.atom(d.c), pob = src.atom(d.oB), pr = src.atom(d.r);
        var id = { C: ny[d.c], OD: ny[d.oD], OB: ny[d.oB], R: ny[d.r] };
        id.OS = mol.tilfoej("O", pob.x, pob.y).id;            /* syrens OH-oxygen */
        id.HS = mol.tilfoej("H", pr.x, pr.y).id;              /* syrens H */
        id.HA = mol.tilfoej("H", pc.x, pc.y).id;              /* alkoholens H */
        mol.bind(id.C, id.OS, 1);
        mol.bind(id.OS, id.HS, 1);
        mol.bind(id.OB, id.HA, 1);
        var syreIds = d.syre.map(function (x) { return ny[x]; }).concat([id.OS, id.HS]);
        var alkIds = d.alkohol.map(function (x) { return ny[x]; }).concat([id.HA]);
        var iSyre = {};
        syreIds.forEach(function (x) { iSyre[x] = true; });
        var start = {}, slut = {}, maxX = -Infinity, minX = Infinity, minY = Infinity, maxY = -Infinity;
        mol.atomer.forEach(function (a) {
            var dx = iSyre[a.id] ? -AFSTAND / 2 : AFSTAND / 2;
            start[a.id] = { x: a.x + dx, y: a.y };
            slut[a.id] = { x: a.x, y: a.y };
        });
        src.atomer.forEach(function (a) {
            maxX = Math.max(maxX, a.x); minX = Math.min(minX, a.x);
            minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y);
        });
        /* Vandet: O i midten og de to H skraat under, med vinklen fra vand */
        var midtY = (minY + maxY) / 2, vx = maxX + 2.3, vy = midtY - 0.3, vV = 52 * Math.PI / 180;
        slut[id.OS] = { x: vx, y: vy };
        slut[id.HS] = { x: vx + Math.sin(vV), y: vy + Math.cos(vV) };
        slut[id.HA] = { x: vx - Math.sin(vV), y: vy + Math.cos(vV) };
        /* Atomerne staar paa start, saa molekylet kan tegnes, foer der sker noget */
        mol.atomer.forEach(function (a) { a.x = start[a.id].x; a.y = start[a.id].y; });
        return {
            syre: syre, alkohol: alkohol, navn: b.navn, mol: mol, id: id, start: start, slut: slut,
            syreIds: syreIds, alkoholIds: alkIds, iSyre: iSyre,
            esterSyre: d.syre.map(function (x) { return ny[x]; }), esterAlkohol: d.alkohol.map(function (x) { return ny[x]; }),
            vand: [id.OS, id.HS, id.HA],
            brydes: [[id.C, id.OS], [id.OB, id.HA]],
            dannes: [[id.C, id.OB, 1], [id.OS, id.HA, 1]],
            plus: { foer: { x: pob.x, y: midtY }, efter: { x: maxX + 1.15, y: midtY } }
        };
    };

    /* Topologien efter reaktionen (paa en kopi af scenens molekyle) */
    K.kondEfter = function (sc) {
        var mol = sc.mol.kopi();
        sc.brydes.forEach(function (p) { var bd = mol.binding(p[0], p[1]); if (bd) mol.fjernBinding(bd); });
        sc.dannes.forEach(function (p) { mol.bind(p[0], p[1], p[2]); });
        mol.atomer.forEach(function (a) { var s = sc.slut[a.id]; a.x = s.x; a.y = s.y; });
        return mol;
    };

    /* Atomerne, der skal blive til vand: syrens OH-gruppe og alkoholens H */
    K.vandAtomer = function (sc) { return sc.vand.slice().sort(function (a, b) { return a - b; }); };

    K.vandFejl = function (sc, valgt) {
        var id = sc.id, mol = sc.mol;
        var o = valgt.filter(function (x) { return el(mol, x) === "O"; });
        var h = valgt.filter(function (x) { return el(mol, x) === "H"; });
        if (valgt.indexOf(id.OD) >= 0) return "Oxygenatomet med dobbeltbindingen bliver i esteren. Vandets oxygenatom kommer fra en OH-gruppe.";
        if (o.length > 1) return "Vand er H₂O. Det har kun ét oxygenatom.";
        if (!o.length) return "Vand er H₂O. Find også oxygenatomet, der går af sammen med de to hydrogenatomer.";
        if (valgt.indexOf(id.OB) >= 0) return "Det er syren, der afgiver hele OH-gruppen. Alkoholen afgiver kun sit H, og dens O binder sig til syren.";
        if (h.length !== 2) return "Vand er H₂O: vælg ét oxygenatom og to hydrogenatomer.";
        return "Vælg syrens OH-gruppe og hydrogenatomet på alkoholens OH-gruppe.";
    };

    K.vandHints = function () {
        return ["Vand er H₂O. Syren afgiver hele sin OH-gruppe.", "Alkoholen afgiver kun hydrogenatomet fra sin OH-gruppe."];
    };

    /* ----- Fane 3: ikonerne i luppen -------------------------------------------------------
       Molekylerne tegnes som zigzagformler. Baseformen er syren med O⁻ i
       stedet for OH. */
    var ikonCache = {};
    K.ikon = function (id) {
        if (ikonCache[id]) return ikonCache[id];
        var R = D.RENS, mol, farve = null;
        if (id === "ester") {
            mol = K.byg(R.syre, R.alkohol).mol;
            var d = K.esterDele(mol), iS = {};
            d.syre.forEach(function (x) { iS[x] = true; });
            farve = function (x) { return iS[x] ? "syre" : "alkohol"; };
        } else if (id === "alkohol") {
            mol = K.normaliser(K.stof(R.alkohol).mol.kopi());
            farve = function () { return "alkohol"; };
        } else if (id === "syre" || id === "base") {
            mol = K.stof(R.syre).mol.kopi();
            if (id === "base") {
                mol.atomer.forEach(function (a) {
                    if (a.el !== "O" || mol.naboer(a.id).length !== 1) return;
                    var bd = mol.binding(a.id, mol.naboer(a.id)[0]);
                    if (bd && bd.orden === 1) a.q = -1;
                });
            }
            farve = function () { return "syre"; };
        }
        ikonCache[id] = { mol: mol, farve: farve };
        return ikonCache[id];
    };

    NK.Kemi = K;
}());

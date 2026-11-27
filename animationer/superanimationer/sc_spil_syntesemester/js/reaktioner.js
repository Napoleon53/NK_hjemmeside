/* =====================================================================
   reaktioner.js - hvad sker der, naar et stof faar et reagenskort?

   Reaktionerne er regler paa molekylets graf, ikke en tabel over stoffer.
   Produkterne navngives af molekylemotoren (NK.Kemi.fraMol). Kortene og
   reglerne foelger syntesekortet i Kemibogen B4.7:

     br2      Br₂ og lys: substitution paa en alkan (alle stillinger)
     h2       H₂ og katalysator: addition til C=C (og C≡C bliver til C=C)
     hbr      HBr: addition til C=C (begge stillinger, hvis alkenen ikke
              er symmetrisk)
     vand     H₂O og syre: addition af vand til C=C, eller hydrolyse af
              en ester
     h2so4    konc. H₂SO₄ og varme: elimination af vand fra en alkohol
     base     staerk base og varme: elimination af HBr fra en halogenalkan
     mild     KMnO₄, destillér: primaer alkohol -> aldehyd,
              sekundaer -> keton, aldehyd -> carboxylsyre
     kraftig  KMnO₄ i overskud: primaer alkohol -> carboxylsyre,
              sekundaer -> keton, aldehyd -> carboxylsyre
     kond     H₂SO₄ og varme med en partner: carboxylsyre + alkohol ->
              ester, carboxylsyre + amin -> amid

   NK.Reaktion.anvend(stof, kort, partner) giver enten
     { ingen: true, grund }  eller
     { type, navn, om, valg: [{ produkter: [stof, ...], biprodukt }] }
   valg er de produkter, der kan dannes (fx 1- og 2-brompropan); i lag 3
   vaelger eleven, hvilket der arbejdes videre med.

   NK.Reaktion.forkerte(stof, kort, partner) giver forkerte produkter med
   en forklaring: de fejl, elever typisk laver (lag 2).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;

    function andet(bd, id) { return bd.a === id ? bd.b : bd.a; }
    function stort(t) { return NK.stortForbogstav(t); }
    function el(m, id) { return m.atom(id).el; }
    function erHalogen(e) { return e === "Br" || e === "Cl" || e === "I" || e === "F"; }

    /* ----- Grupperne paa grafen -------------------------------------------- */
    function ccBindinger(m, orden) {
        return m.bindinger.filter(function (bd) {
            return bd.orden === orden && el(m, bd.a) === "C" && el(m, bd.b) === "C";
        });
    }

    function halogener(m) {
        var ud = [];
        m.atomer.forEach(function (a) {
            if (!erHalogen(a.el) || m.grad(a.id) !== 1) return;
            var c = m.naboer(a.id)[0];
            if (el(m, c) === "C") ud.push({ x: a.id, c: c, el: a.el });
        });
        return ud;
    }

    /* Alkoholens OH: O med ét H paa et C uden C=O */
    function alkOH(m) {
        var ud = [];
        m.atomer.forEach(function (a) {
            if (a.el !== "O" || m.grad(a.id) !== 1 || m.implicitH(a.id) !== 1) return;
            var c = m.naboer(a.id)[0];
            if (el(m, c) !== "C") return;
            var co = m.bindingerTil(c).some(function (bd) { return bd.orden === 2 && el(m, andet(bd, c)) === "O"; });
            if (!co) ud.push({ o: a.id, c: c });
        });
        return ud;
    }

    /* C=O paa et C: { c, o } */
    function carbonylC(m) {
        var ud = [];
        m.bindinger.forEach(function (bd) {
            if (bd.orden !== 2) return;
            var a = el(m, bd.a), b = el(m, bd.b);
            if (a === "C" && b === "O") ud.push({ c: bd.a, o: bd.b });
            else if (a === "O" && b === "C") ud.push({ c: bd.b, o: bd.a });
        });
        return ud;
    }

    /* Carboxylgruppen: { c, oh } */
    function syreGruppe(m) {
        var ud = null;
        carbonylC(m).forEach(function (x) {
            if (ud) return;
            m.bindingerTil(x.c).forEach(function (bd) {
                var o = andet(bd, x.c);
                if (bd.orden === 1 && el(m, o) === "O" && m.grad(o) === 1 && m.implicitH(o) === 1) ud = { c: x.c, oh: o };
            });
        });
        return ud;
    }

    /* Estergruppen: { c, o, r } hvor o er det enkeltbundne O og r C'et paa den anden side */
    function esterGruppe(m) {
        var ud = null;
        carbonylC(m).forEach(function (x) {
            if (ud) return;
            m.bindingerTil(x.c).forEach(function (bd) {
                var o = andet(bd, x.c);
                if (bd.orden !== 1 || el(m, o) !== "O" || m.grad(o) !== 2) return;
                var r = m.naboer(o).filter(function (n) { return n !== x.c; })[0];
                if (r !== undefined && el(m, r) === "C") ud = { c: x.c, o: o, r: r };
            });
        });
        return ud;
    }

    /* Aminens N med mindst ét H, og som ikke sidder paa C=O */
    function aminN(m) {
        var ud = null;
        var co = {};
        carbonylC(m).forEach(function (x) { co[x.c] = true; });
        m.atomer.forEach(function (a) {
            if (ud !== null || a.el !== "N" || m.implicitH(a.id) < 1) return;
            if (m.naboer(a.id).some(function (n) { return co[n]; })) return;
            ud = a.id;
        });
        return ud;
    }

    /* ----- Hjaelpere ------------------------------------------------------- */
    function stof(m) { return K.fraMol(m); }

    /* Fjerner dubletter (samme navn) og stoffer, motoren ikke kan navngive */
    function unikke(liste) {
        var set = {}, ud = [];
        liste.forEach(function (s) {
            if (!s || set[s.navn]) return;
            set[s.navn] = true;
            ud.push(s);
        });
        return ud;
    }

    function ok(type, navn, om, produkter, biprodukt) {
        return {
            type: type, navn: navn, om: om,
            valg: produkter.map(function (p) {
                return { produkter: Array.isArray(p) ? p : [p], biprodukt: biprodukt || "" };
            })
        };
    }

    function ingen(grund) { return { ingen: true, grund: grund }; }

    function klasseTekst(s) {
        var k = D.KLASSER[s.klasse];
        var art = s.klasse === "aldehyd" || s.klasse === "amid" ? "et " : "en ";
        return k ? art + k.navn : "et andet stof";
    }

    /* Addition af to grupper (null = H) paa C=C-bindingen bd */
    function adder(s, bd, xA, xB) {
        var m = s.mol.kopi();
        var b = m.binding(bd.a, bd.b);
        b.orden = 1;
        if (xA) m.bind(bd.a, m.tilfoej(xA).id, 1);
        if (xB) m.bind(bd.b, m.tilfoej(xB).id, 1);
        return stof(m);
    }

    /* Elimination: fjerner atomet x paa c og laver C=C mellem c og hvert
       nabo-C med H. Giver de forskellige alkener. */
    function eliminer(s, x, c) {
        var ud = [];
        s.mol.naboer(c).forEach(function (n) {
            if (n === x || el(s.mol, n) !== "C" || s.mol.implicitH(n) < 1) return;
            var m = s.mol.kopi();
            m.fjernAtom(x);
            m.binding(c, n).orden = 2;
            ud.push(stof(m));
        });
        return unikke(ud);
    }

    /* Deler et molekyle med flere dele op i stoffer */
    function dele(m) {
        return m.fragmenter().map(function (ids) { return stof(m.del(ids)); });
    }

    /* ----- Kortene ------------------------------------------------------- */
    function br2(s) {
        if (s.klasse === "alkan") {
            var ud = [];
            s.mol.atomer.forEach(function (a) {
                if (a.el !== "C" || s.mol.implicitH(a.id) < 1) return;
                var m = s.mol.kopi();
                m.bind(a.id, m.tilfoej("Br").id, 1);
                ud.push(stof(m));
            });
            ud = unikke(ud);
            return ok("substitution", "Substitution", "Et H på alkanen bliver skiftet ud med et Br." +
                (ud.length > 1 ? " Br kan sidde på flere carbonatomer, så der dannes en blanding." : ""), ud, "HBr");
        }
        if (s.klasse === "alken" || s.klasse === "alkyn")
            return ingen("Dibrom adderer til " + (s.klasse === "alken" ? "dobbeltbindingen" : "tripelbindingen") + " i " + s.navn +
                ". Det er testen med bromvand, men produktet fører ikke videre på syntesekortet.");
        return ingen("Dibrom og lys giver kun en substitution på en alkan. " + stort(s.navn) + " er " + klasseTekst(s) + ".");
    }

    function h2(s) {
        if (s.klasse === "alken") {
            return ok("addition", "Addition af H₂", "To H sætter sig på de to carbonatomer i dobbeltbindingen.",
                [adder(s, ccBindinger(s.mol, 2)[0], null, null)]);
        }
        if (s.klasse === "alkyn") {
            var m = s.mol.kopi(), bd = ccBindinger(m, 3)[0];
            bd.orden = 2;
            return ok("addition", "Addition af H₂", "To H sætter sig på tripelbindingen, så den bliver til en dobbeltbinding.", [stof(m)]);
        }
        return ingen("Dihydrogen adderer kun til en dobbeltbinding eller tripelbinding mellem to carbonatomer. " +
            stort(s.navn) + " har ingen.");
    }

    function hbr(s) {
        if (s.klasse === "alken") {
            var bd = ccBindinger(s.mol, 2)[0];
            var ud = unikke([adder(s, bd, "Br", null), adder(s, bd, null, "Br")]);
            return ok("addition", "Addition af HBr", "H og Br sætter sig på de to carbonatomer i dobbeltbindingen." +
                (ud.length > 1 ? " Alkenen er ikke symmetrisk, så der dannes to produkter." : ""), ud);
        }
        if (s.klasse === "alkyn") return ingen("I spillet adderer HBr kun til en alken. " + stort(s.navn) + " er en alkyn.");
        return ingen("HBr adderer kun til en dobbeltbinding mellem to carbonatomer. " + stort(s.navn) + " har ingen.");
    }

    function vand(s) {
        if (s.klasse === "alken") {
            var bd = ccBindinger(s.mol, 2)[0];
            var ud = unikke([adder(s, bd, "O", null), adder(s, bd, null, "O")]);
            return ok("addition", "Addition af vand", "H og OH sætter sig på de to carbonatomer i dobbeltbindingen." +
                (ud.length > 1 ? " Alkenen er ikke symmetrisk, så der dannes to alkoholer." : ""), ud);
        }
        if (s.klasse === "ester") {
            var e = esterGruppe(s.mol);
            var m = s.mol.kopi();
            m.fjernBinding(m.binding(e.o, e.r));
            m.bind(e.r, m.tilfoej("O").id, 1);
            var dl = dele(m);
            var syre = dl.filter(function (x) { return x && x.klasse === "syre"; })[0];
            var alk = dl.filter(function (x) { return x && x.klasse === "alkohol"; })[0];
            if (!syre || !alk) return ingen("Esteren kan ikke spaltes her.");
            var r = ok("hydrolyse", "Hydrolyse", "Vand spalter esteren i carboxylsyren og alkoholen. Det er det modsatte af en kondensation.",
                [[syre, alk]]);
            r.begge = true;
            r.vandForan = true;
            return r;
        }
        if (s.klasse === "amid") return ingen("Et amid spaltes kun langsomt af vand. Det er ikke med i spillet.");
        if (s.klasse === "alkyn") return ingen("I spillet adderes vand kun til en alken. " + stort(s.navn) + " er en alkyn.");
        return ingen("Vand og syre adderer til en dobbeltbinding eller spalter en ester. " + stort(s.navn) + " er " + klasseTekst(s) + ".");
    }

    function h2so4(s) {
        if (s.klasse === "alkohol") {
            var oh = alkOH(s.mol)[0];
            var ud = eliminer(s, oh.o, oh.c);
            if (!ud.length) return ingen("Nabocarbonatomet har intet H" + (s.antalC === 1 ? ", for " + s.navn + " har kun ét carbonatom" : "") +
                ". Så kan der ikke dannes en dobbeltbinding.");
            return ok("elimination", "Elimination af vand", "OH og et H fra nabocarbonatomet fraspaltes som vand, og der dannes en dobbeltbinding." +
                (ud.length > 1 ? " Dobbeltbindingen kan komme to steder." : ""), ud, "H₂O");
        }
        if (s.klasse === "syre") return ingen("Svovlsyre og varme alene gør intet ved en carboxylsyre. Brug kortet Kondensation med en alkohol.");
        return ingen("Svovlsyre og varme fraspalter vand fra en alkohol. " + stort(s.navn) + " er " + klasseTekst(s) + ".");
    }

    function base(s) {
        if (s.klasse === "halogen") {
            var x = halogener(s.mol)[0];
            var ud = eliminer(s, x.x, x.c);
            if (!ud.length) return ingen("Nabocarbonatomet har intet H, så der kan ikke dannes en dobbeltbinding.");
            return ok("elimination", "Elimination af H" + x.el, x.el + " og et H fra nabocarbonatomet fraspaltes som H" + x.el +
                ", og der dannes en dobbeltbinding." + (ud.length > 1 ? " Dobbeltbindingen kan komme to steder." : ""), ud, "H" + x.el);
        }
        if (s.klasse === "ester") return ingen("Med stærk base bliver esteren forsæbet, og carboxylsyren kommer ud som en ion. Brug vand og syre i stedet.");
        if (s.klasse === "syre") return ingen("Basen neutraliserer carboxylsyren, så den bliver til en ion. Det fører ikke videre her.");
        return ingen("Stærk base og varme fraspalter HBr fra en halogenalkan. " + stort(s.navn) + " er " + klasseTekst(s) + ".");
    }

    function oxider(s, kraftig) {
        if (s.klasse === "alkohol") {
            var t = K.alkoholType(s);
            if (t === "tertiær") return ingen("Carbonatomet med OH-gruppen har intet H. En tertiær alkohol kan ikke oxideres.");
            var oh = alkOH(s.mol)[0];
            var m = s.mol.kopi();
            m.binding(oh.c, oh.o).orden = 2;
            if (t === "sekundær") {
                return ok("oxidation", "Oxidation", "En sekundær alkohol oxideres til en keton, som ikke kan oxideres videre.", [stof(m)]);
            }
            if (!kraftig) {
                return ok("oxidation", "Oxidation", "En primær alkohol oxideres til et aldehyd. Aldehydet destilleres fra, før det oxideres videre.", [stof(m)]);
            }
            m.bind(oh.c, m.tilfoej("O").id, 1);
            return ok("oxidation", "Oxidation", "Med overskud af KMnO₄ oxideres den primære alkohol over aldehydet helt til en carboxylsyre.", [stof(m)]);
        }
        if (s.klasse === "aldehyd") {
            var x = carbonylC(s.mol)[0];
            var m2 = s.mol.kopi();
            m2.bind(x.c, m2.tilfoej("O").id, 1);
            return ok("oxidation", "Oxidation", "Aldehydet oxideres til en carboxylsyre. Carbonatomet får et O mere.", [stof(m2)]);
        }
        if (s.klasse === "keton") return ingen("En keton kan ikke oxideres videre. Carbonatomet med C=O har intet H.");
        if (s.klasse === "syre") return ingen("En carboxylsyre kan ikke oxideres videre i spillet.");
        return ingen("I spillet oxiderer KMnO₄ kun alkoholer og aldehyder. " + stort(s.navn) + " er " + klasseTekst(s) + ".");
    }

    /* Kondensation: carboxylsyre + alkohol eller amin */
    function kond(s, p) {
        if (!p) return ingen("Kondensationen kræver to stoffer: en carboxylsyre og en alkohol eller en amin.");
        var syre = s.klasse === "syre" ? s : (p.klasse === "syre" ? p : null);
        var anden = syre === s ? p : s;
        if (!syre || (anden.klasse !== "alkohol" && anden.klasse !== "amin") || anden === syre) {
            return ingen("Kondensationen kræver en carboxylsyre og en alkohol eller en amin. " +
                stort(s.navn) + " og " + p.navn + " passer ikke sammen.");
        }
        var sg = syreGruppe(syre.mol);
        var m = new NK.Molekyle();
        var k1 = m.indsaet(syre.mol, 0, 0);
        var k2 = m.indsaet(anden.mol, 0, 0);
        m.fjernAtom(k1[sg.oh]);
        var mod;
        if (anden.klasse === "alkohol") mod = alkOH(anden.mol)[0].o;
        else mod = aminN(anden.mol);
        if (mod === null || mod === undefined) return ingen(stort(anden.navn) + " har intet H på N, så der kan ikke dannes et amid.");
        m.bind(k1[sg.c], k2[mod], 1);
        var pr = stof(m);
        if (!pr) return ingen("Stoffet kan ikke navngives.");
        return ok("kondensation", "Kondensation", anden.klasse === "alkohol" ?
            "Syrens OH og alkoholens H fraspaltes som vand, og der dannes en ester." :
            "Syrens OH og et H fra aminen fraspaltes som vand, og der dannes et amid.", [pr], "H₂O");
    }

    var KORT = {
        br2: br2, h2: h2, hbr: hbr, vand: vand, h2so4: h2so4, base: base,
        mild: function (s) { return oxider(s, false); },
        kraftig: function (s) { return oxider(s, true); },
        kond: kond
    };

    var cache = {};
    function anvend(s, kort, partner) {
        if (!s || !KORT[kort]) return ingen("Ukendt kort.");
        var noegle = kort + "|" + s.navn + "|" + (partner ? partner.navn : "");
        if (!cache[noegle]) {
            var r;
            try { r = KORT[kort](s, partner); } catch (e) { r = ingen("Reaktionen kunne ikke regnes ud."); r.fejl = String(e); }
            if (!r.ingen) {
                r.valg = r.valg.filter(function (v) { return v.produkter.every(Boolean); });
                if (!r.valg.length) r = ingen("Produktet kan ikke navngives i spillet.");
            }
            cache[noegle] = r;
        }
        return cache[noegle];
    }

    /* Alle produktnavne, et kort kan give */
    function produktNavne(r) {
        if (!r || r.ingen) return [];
        var ud = [];
        r.valg.forEach(function (v) { v.produkter.forEach(function (p) { ud.push(p.navn); }); });
        return ud;
    }

    /* ----- Forkerte produkter (lag 2) ----------------------------------------
       Hver med grund: hvorfor det ikke er rigtigt. Listen er ikke filtreret;
       lag 2 fjerner dem, der ogsaa er rigtige. */
    var LIGE_SYRE = { 1: "methansyre", 2: "ethansyre", 3: "propansyre", 4: "butansyre", 5: "pentansyre" };
    var LIGE_ALK = { 1: "methanol", 2: "ethanol", 3: "propan-1-ol", 4: "butan-1-ol", 5: "pentan-1-ol" };

    function ligeKaede(s) {
        if (s.klasse === "syre") return LIGE_SYRE[s.antalC] === s.navn;
        if (s.klasse === "alkohol") return LIGE_ALK[s.antalC] === s.navn;
        return false;
    }

    function esterAf(nSyre, nAlk) {
        var sm = new Array(nSyre).join("C") + "C(=O)O" + new Array(nAlk + 1).join("C");
        return K.fraMol(NK.Smiles.laes(sm));
    }

    function syreAf(n) { return K.fraMol(NK.Smiles.laes(new Array(n).join("C") + "C(=O)O")); }
    function alkAf(n) { return K.fraMol(NK.Smiles.laes(new Array(n + 1).join("C") + "O")); }
    function aldehydAf(n) { return K.fraMol(NK.Smiles.laes(new Array(n).join("C") + "C=O")); }

    /* De andre kortes produkter paa samme stof */
    function andreKort(s, kort, grundFn) {
        var ud = [];
        ["h2", "hbr", "vand", "h2so4", "base", "br2", "mild", "kraftig"].forEach(function (k) {
            if (k === kort) return;
            var r = anvend(s, k);
            if (r.ingen) return;
            r.valg.forEach(function (v) {
                if (v.produkter.length === 1) ud.push({ stof: v.produkter[0], grund: grundFn(k, r) });
            });
        });
        return ud;
    }

    function kortTitel(k) {
        var kort = D.KORT.filter(function (x) { return x.id === k; })[0];
        return kort ? kort.over + (kort.under ? " og " + kort.under : "") : k;
    }

    function forkerte(s, kort, partner) {
        var ud = [];
        var rigtig = anvend(s, kort, partner);
        function laeg(st, grund) { if (st) ud.push({ stof: st, grund: grund }); }
        function laegPar(a, b, grund) { if (a && b) ud.push({ par: [a, b], grund: grund }); }

        if (s.klasse === "alken" && (kort === "vand" || kort === "hbr" || kort === "h2")) {
            var bd = ccBindinger(s.mol, 2)[0];
            var X = kort === "vand" ? "O" : "Br";
            if (kort !== "h2") {
                /* Gruppen paa et carbonatom uden for dobbeltbindingen */
                s.mol.atomer.forEach(function (a) {
                    if (a.el !== "C" || a.id === bd.a || a.id === bd.b) return;
                    var m = s.mol.kopi();
                    m.binding(bd.a, bd.b).orden = 1;
                    m.bind(a.id, m.tilfoej(X).id, 1);
                    laeg(stof(m), (X === "O" ? "OH-gruppen" : "Br") + " sidder på et carbonatom, der ikke var med i dobbeltbindingen.");
                });
                laeg(adder(s, bd, X, X), kort === "vand" ?
                    "Vand giver kun én OH-gruppe: H på det ene carbonatom og OH på det andet." :
                    "HBr giver kun ét Br. To Br kommer fra en addition af dibrom.");
            }
            andreKort(s, kort, function (k, r) {
                return "Det er produktet med " + kortTitel(k) + " (" + r.navn.toLowerCase() + ").";
            }).forEach(function (x) { ud.push(x); });
            /* Dobbeltbindingen flyttet: ingen addition */
            if (kort === "h2") {
                s.mol.bindinger.forEach(function (b2) {
                    if (b2 === bd || el(s.mol, b2.a) !== "C" || el(s.mol, b2.b) !== "C") return;
                    var m = s.mol.kopi();
                    m.binding(bd.a, bd.b).orden = 1;
                    var nb = m.binding(b2.a, b2.b);
                    if (m.implicitH(b2.a) < 1 || m.implicitH(b2.b) < 1) return;
                    nb.orden = 2;
                    laeg(stof(m), "Ved additionen forsvinder dobbeltbindingen. Den flytter sig ikke.");
                });
            }
        }

        if (kort === "h2so4" || kort === "base") {
            var x = null, c = null;
            if (s.klasse === "alkohol") { var oh = alkOH(s.mol)[0]; x = oh.o; c = oh.c; }
            if (s.klasse === "halogen") { var hx = halogener(s.mol)[0]; x = hx.x; c = hx.c; }
            if (x !== null) {
                s.mol.bindinger.forEach(function (b2) {
                    if (b2.a === c || b2.b === c || b2.a === x || b2.b === x) return;
                    if (el(s.mol, b2.a) !== "C" || el(s.mol, b2.b) !== "C") return;
                    var m = s.mol.kopi();
                    m.fjernAtom(x);
                    if (m.implicitH(b2.a) < 1 || m.implicitH(b2.b) < 1) return;
                    m.binding(b2.a, b2.b).orden = 2;
                    laeg(stof(m), "Dobbeltbindingen dannes mellem carbonatomet, der havde " + (s.klasse === "alkohol" ? "OH-gruppen" : "Br") +
                        ", og et nabocarbonatom.");
                });
                var m0 = s.mol.kopi();
                m0.fjernAtom(x);
                laeg(stof(m0), "Der fraspaltes " + (s.klasse === "alkohol" ? "vand" : "HBr") + " fra to nabocarbonatomer, så der opstår en dobbeltbinding.");
                if (s.klasse === "alkohol") {
                    ["mild", "kraftig"].forEach(function (k) {
                        var r = anvend(s, k);
                        if (!r.ingen) laeg(r.valg[0].produkter[0], "Det er en oxidation med KMnO₄. Svovlsyre og varme fraspalter vand.");
                    });
                }
            }
        }

        if (kort === "br2" && s.klasse === "alkan") {
            /* To Br paa to nabocarbonatomer */
            s.mol.bindinger.forEach(function (b2) {
                if (el(s.mol, b2.a) !== "C" || el(s.mol, b2.b) !== "C") return;
                var m = s.mol.kopi();
                m.bind(b2.a, m.tilfoej("Br").id, 1);
                m.bind(b2.b, m.tilfoej("Br").id, 1);
                laeg(stof(m), "Ved en substitution bliver ét H skiftet ud med ét Br.");
                var m2 = s.mol.kopi();
                m2.binding(b2.a, b2.b).orden = 2;
                laeg(stof(m2), "Der dannes ingen dobbeltbinding ved en substitution. Et H bliver skiftet ud med et Br.");
            });
            var mo = s.mol.kopi();
            mo.bind(s.mol.atomer[0].id, mo.tilfoej("O").id, 1);
            laeg(stof(mo), "Dibrom og lys giver en halogenalkan. Br sætter sig i stedet for et H.");
        }

        if (kort === "mild" || kort === "kraftig") {
            var andenOx = kort === "mild" ? "kraftig" : "mild";
            var t = K.alkoholType(s);
            if (s.klasse === "alkohol") {
                var oh2 = alkOH(s.mol)[0];
                /* C=O paa et andet carbonatom end det med OH */
                s.mol.naboer(oh2.c).forEach(function (n) {
                    if (el(s.mol, n) !== "C" || s.mol.implicitH(n) < 2) return;
                    var m = s.mol.kopi();
                    m.fjernAtom(oh2.o);
                    m.bind(n, m.tilfoej("O").id, 2);
                    laeg(stof(m), t === "tertiær" ?
                        "C=O kan kun komme på carbonatomet med OH-gruppen, og det har intet H." :
                        "C=O kommer på det carbonatom, der havde OH-gruppen.");
                    if (t === "tertiær") {
                        var m3 = m.kopi();
                        m3.bind(n, m3.tilfoej("O").id, 1);
                        laeg(stof(m3), "Carbonatomet med OH-gruppen har intet H, så en tertiær alkohol kan ikke oxideres.");
                    }
                });
                var r2 = anvend(s, andenOx);
                if (!r2.ingen) laeg(r2.valg[0].produkter[0], kort === "mild" ?
                    "Det er produktet af en kraftig oxidation. Destillationen fjerner aldehydet, før det oxideres videre." :
                    "Med overskud af KMnO₄ oxideres aldehydet videre til en carboxylsyre.");
                var re = anvend(s, "h2so4");
                if (!re.ingen) laeg(re.valg[0].produkter[0], "Det er en elimination med svovlsyre. KMnO₄ giver en oxidation.");
                if (t === "sekundær") {
                    var m4 = s.mol.kopi();
                    m4.fjernAtom(oh2.o);
                    /* En carboxylsyre med samme kaede, hvis den kan laves for enden */
                    var ende = m4.atomer.filter(function (a) { return a.el === "C" && m4.implicitH(a.id) === 3; })[0];
                    if (ende) {
                        m4.bind(ende.id, m4.tilfoej("O").id, 2);
                        m4.bind(ende.id, m4.tilfoej("O").id, 1);
                        laeg(stof(m4), "En sekundær alkohol bliver til en keton. Den kan ikke oxideres videre.");
                    }
                }
                if (t !== "tertiær") ud.push({ ingen: true, grund: "En " + t + " alkohol har H på carbonatomet med OH-gruppen og kan oxideres." });
            }
            if (s.klasse === "aldehyd") {
                var x2 = carbonylC(s.mol)[0];
                var m5 = s.mol.kopi();
                m5.binding(x2.c, x2.o).orden = 1;
                laeg(stof(m5), "Det er en reduktion, det modsatte af en oxidation.");
                s.mol.naboer(x2.c).forEach(function (n) {
                    if (el(s.mol, n) !== "C" || s.mol.implicitH(n) < 2) return;
                    var m6 = s.mol.kopi();
                    m6.fjernAtom(x2.o);
                    m6.bind(n, m6.tilfoej("O").id, 2);
                    laeg(stof(m6), "C=O flytter sig ikke ved en oxidation.");
                });
                ud.push({ ingen: true, grund: "Aldehydet har et H på carbonatomet med C=O og kan oxideres til en carboxylsyre." });
            }
            if (s.klasse === "keton") {
                var x3 = carbonylC(s.mol)[0];
                var m7 = s.mol.kopi();
                m7.binding(x3.c, x3.o).orden = 1;
                laeg(stof(m7), "Det er en reduktion, det modsatte af en oxidation. Ketonen kan ikke oxideres.");
                var m8 = s.mol.kopi();
                m8.fjernAtom(x3.o);
                var ende2 = m8.atomer.filter(function (a) { return a.el === "C" && m8.implicitH(a.id) === 3; })[0];
                if (ende2) {
                    var m9 = m8.kopi();
                    m9.bind(ende2.id, m9.tilfoej("O").id, 2);
                    laeg(stof(m9), "C=O flytter sig ikke. En keton kan ikke oxideres videre.");
                    m8.bind(ende2.id, m8.tilfoej("O").id, 2);
                    m8.bind(ende2.id, m8.tilfoej("O").id, 1);
                    laeg(stof(m8), "En keton kan ikke oxideres videre uden at bryde en C−C-binding.");
                }
            }
        }

        if (kort === "kond" && partner) {
            var syre = s.klasse === "syre" ? s : partner, anden = syre === s ? partner : s;
            if (anden.klasse === "alkohol" && ligeKaede(syre) && ligeKaede(anden)) {
                laeg(esterAf(anden.antalC, syre.antalC), "Syrens og alkoholens dele er byttet om. Delen med C=O kommer fra carboxylsyren.");
                laeg(esterAf(syre.antalC, syre.antalC), "Delen efter O kommer fra alkoholen, " + anden.navn + ".");
                laeg(esterAf(anden.antalC, anden.antalC), "Delen med C=O kommer fra carboxylsyren, " + syre.navn + ".");
            }
            if (anden.klasse === "amin" && ligeKaede(syre)) {
                laeg(esterAf(syre.antalC, anden.antalC), "Med en amin bliver det et amid med N. En ester kommer fra en alkohol.");
            }
            ud.push({ ingen: true, grund: "En carboxylsyre og " + (anden.klasse === "amin" ? "en amin" : "en alkohol") + " kondenserer med svovlsyre og varme." });
        }

        if (kort === "vand" && s.klasse === "ester" && rigtig && !rigtig.ingen) {
            var pr = rigtig.valg[0].produkter;
            var sy = pr[0].klasse === "syre" ? pr[0] : pr[1], al = sy === pr[0] ? pr[1] : pr[0];
            if (ligeKaede(sy) && ligeKaede(al)) {
                laegPar(syreAf(al.antalC), alkAf(sy.antalC), "Delen med C=O bliver til carboxylsyren. Delen efter O bliver til alkoholen.");
                laegPar(aldehydAf(sy.antalC), al, "Syredelen får en OH-gruppe og bliver til en carboxylsyre, ikke et aldehyd.");
                laegPar(sy, aldehydAf(al.antalC), "Alkoholdelen får et H på O og bliver til en alkohol.");
            }
            ud.push({ ingen: true, grund: "Vand og syre spalter esteren. Det er en hydrolyse." });
        }

        return ud;
    }

    NK.Reaktion = {
        ENKELT: ["br2", "h2", "hbr", "vand", "h2so4", "base", "mild", "kraftig"],
        anvend: anvend,
        forkerte: forkerte,
        produktNavne: produktNavne,
        kortTitel: kortTitel,
        alkOH: alkOH,
        syreGruppe: syreGruppe
    };
}());

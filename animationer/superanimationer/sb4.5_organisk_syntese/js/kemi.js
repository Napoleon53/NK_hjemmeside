/* =====================================================================
   kemi.js - reglerne: hvad sker der, naar to stoffer kommer i kolben?

   Stofferne er molekyler fra molekylemotoren (NK.Smiles, NK.Navn).
   Produkterne bygges som grafer og navngives af motoren, saa reglerne
   gaelder for alle par, ikke kun dem, kunderne vil have:

     ester       en stof med COOH + et stof med OH (alkohol eller ringens
                 OH paa salicylsyre). Syrens OH og alkoholens H bliver til
                 vand, og C'et i COOH binder sig til alkoholens O.
                 Kraever svovlsyre (H⁺) som katalysator og varme.
     oxidation   en alkohol + kaliumpermanganat. Kraever varme.
                 Primaer: alkohol -> aldehyd -> carboxylsyre (tilbagesvaleren
                 holder aldehydet i kolben). Sekundaer: alkohol -> keton.
     paaskeaeg   ethanol + ethanol med H⁺ og varme: diethylether og vand.
                 Methansyre + permanganat: CO₂ og vand.

   NK.Kemi.stof(id)                 stoffet (ogsaa estere, der er lavet)
   NK.Kemi.reaktion(a, b, betingelser)  udfaldet (se nederst)
   NK.Kemi.rute(navn)               hvordan et stof laves (til hintene)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* ----- Molekylerne ---------------------------------------------------------- */
    function andet(bd, id) { return bd.a === id ? bd.b : bd.a; }

    function harCarbonyl(mol, c) {
        return mol.bindingerTil(c).some(function (bd) {
            return bd.orden === 2 && mol.atom(andet(bd, c)).el === "O";
        });
    }

    /* O-atomer med ét H og én binding til et C */
    function oh(mol) {
        var ud = [];
        mol.atomer.forEach(function (a) {
            if (a.el !== "O" || mol.grad(a.id) !== 1 || mol.implicitH(a.id) !== 1) return;
            var c = mol.naboer(a.id)[0];
            if (mol.atom(c).el !== "C") return;
            ud.push({ o: a.id, c: c, syre: harCarbonyl(mol, c) });
        });
        return ud;
    }

    /* COOH: syrens OH */
    function syreOH(mol) { return oh(mol).filter(function (x) { return x.syre; }); }

    /* Alkoholens (eller ringens) OH */
    function alkOH(mol) { return oh(mol).filter(function (x) { return !x.syre; }); }

    /* Sidder OH paa en ring (phenol)? Ringens C er bundet til to andre C,
       der hver har en dobbeltbinding i ringen (benzen tegnes skiftevis). */
    function erPhenol(mol, c) {
        return mol.bindingerTil(c).some(function (bd) {
            return bd.orden === 2 && mol.atom(andet(bd, c)).el === "C";
        });
    }

    /* Kopierer atomerne (undtagen dem i udelad) ind i maal; giver id-kortet */
    function kopierInd(maal, kilde, udelad) {
        var kort = {};
        kilde.atomer.forEach(function (a) {
            if (udelad && udelad[a.id]) return;
            var n = maal.tilfoej(a.el, a.x, a.y);
            if (a.q) n.q = a.q;
            kort[a.id] = n.id;
        });
        kilde.bindinger.forEach(function (bd) {
            if (kort[bd.a] && kort[bd.b]) maal.bind(kort[bd.a], kort[bd.b], bd.orden);
        });
        return kort;
    }

    function kopi(mol) {
        var m = new NK.Molekyle();
        kopierInd(m, mol, null);
        return m;
    }

    /* Esteren af syren (dens COOH) og alkoholen (dens OH) */
    function lavEster(syreMol, s, alkMol, a) {
        var m = new NK.Molekyle();
        var udelad = {};
        udelad[s.o] = true;
        var kS = kopierInd(m, syreMol, udelad);
        var kA = kopierInd(m, alkMol, null);
        m.bind(kS[s.c], kA[a.o], 1);
        return { mol: m, c: kS[s.c], o: kA[a.o] };
    }

    /* Oxidation, trin 1: OH-gruppens C faar en dobbeltbinding til O
       (aldehyd eller keton). null, hvis C'et ikke har noget H (tertiaer). */
    function oxTrin1(alkMol) {
        var a = alkOH(alkMol).filter(function (x) { return !erPhenol(alkMol, x.c); })[0];
        if (!a || alkMol.implicitH(a.c) < 1) return null;
        var m = kopi(alkMol);
        /* kopi beholder raekkefoelgen, saa id'erne passer stadig */
        var ids = alkMol.atomer.map(function (x) { return x.id; });
        var nyIds = m.atomer.map(function (x) { return x.id; });
        var o = nyIds[ids.indexOf(a.o)], c = nyIds[ids.indexOf(a.c)];
        m.binding(c, o).orden = 2;
        return { mol: m, c: c, o: o, keton: m.implicitH(c) === 0 };
    }

    /* Oxidation, trin 2: aldehydets C faar et O mere (carboxylsyre) */
    function oxTrin2(t1) {
        if (!t1 || t1.keton) return null;
        var m = kopi(t1.mol);
        var ids = t1.mol.atomer.map(function (x) { return x.id; });
        var nyIds = m.atomer.map(function (x) { return x.id; });
        var c = nyIds[ids.indexOf(t1.c)];
        var o = m.tilfoej("O", 0, 0);
        m.bind(c, o.id, 1);
        return { mol: m, c: c, o: o.id };
    }

    function analyser(mol) {
        var res = NK.Navn.analyser(mol);
        return res;
    }

    /* ----- Stofferne -------------------------------------------------------------- */
    var STOF = {};
    var EFTER_NAVN = {};

    function trivial(navn, res) {
        var d = D.DUFTE[navn];
        if (d && d.trivial) return d.trivial;
        if (NK.Trivialnavne && res) {
            try { return NK.Trivialnavne.vis(res) || ""; } catch (e) { return ""; }
        }
        return "";
    }

    function klasseAf(mol, res, data) {
        if (data && data.ox) return "ox";
        var k = res ? String(res.stofklasse || "") : "";
        if (/ester/.test(k)) return "ester";
        if (/carboxylsyre/.test(k)) return "syre";
        if (/keton/.test(k)) return "keton";
        if (/aldehyd/.test(k)) return "aldehyd";
        if (/ether/.test(k)) return "ether";
        if (/alkohol|phenol/.test(k)) return "alkohol";
        return "andet";
    }

    function registrer(s) {
        if (s.smiles) {
            s.mol = NK.Smiles.laes(s.smiles);
            s.res = analyser(s.mol);
            s.motornavn = s.motornavn || s.res.navn;
        } else {
            s.motornavn = s.motornavn || s.navn;
        }
        s.klasse = klasseAf(s.mol, s.res, s);
        var d = D.DUFTE[s.motornavn] || {};
        s.duft = d.duft || "";
        s.ikon = d.ikon || "";
        s.vaerdi = d.vaerdi || 0;
        s.medicin = !!d.medicin;
        s.trivial = s.trivial || trivial(s.motornavn, s.res);
        if (s.trivial === s.navn) s.trivial = "";
        STOF[s.id] = s;
        EFTER_NAVN[s.motornavn] = s;
        return s;
    }

    var klar = false;
    function start() {
        if (klar) return;
        klar = true;
        D.STOFFER.forEach(function (d) {
            var s = {};
            for (var k in d) if (Object.prototype.hasOwnProperty.call(d, k)) s[k] = d[k];
            registrer(s);
        });
    }

    /* Et lavet stof ud fra molekylet: findes det, bruges det; ellers
       oprettes en ny post med motorens navn */
    function stofAfMol(mol) {
        start();
        var res = analyser(mol);
        if (!res.navn) return null;
        if (EFTER_NAVN[res.navn]) return EFTER_NAVN[res.navn];
        return registrer({
            id: "p:" + res.navn,
            navn: res.navn,
            motornavn: res.navn,
            formel: mol.formel(),
            mol: mol,
            res: res,
            lavet: true
        });
    }

    function stof(id) {
        start();
        return STOF[id] || null;
    }

    function stofEfterNavn(navn) {
        start();
        return EFTER_NAVN[navn] || null;
    }

    /* Navnet til teksterne: methyl-2-hydroxybenzoat (methylsalicylat) */
    function fuldtNavn(s) {
        if (!s) return "";
        return s.navn + (s.trivial ? " (" + s.trivial + ")" : "");
    }

    /* ----- Reaktionen ---------------------------------------------------------------
       udfald:
         slags     "tom", "en", "ester", "oxidation", "co2", "ether" eller "ingen"
         mulig     kan de to stoffer reagere?
         mangler   ["hplus", "varme"]: det, der mangler. Saa sker der intet,
                   og blandingen bliver i kolben.
         produkt   det nye stof (eller null)
         mellem    aldehydet ved oxidation af en primaer alkohol
         tekst     hvad der skete, i én eller to saetninger
         morf      det, tavlen skal vise (js/morf.js)            */
    function fejl(slags, tekst, a, b) {
        return { slags: slags, mulig: false, mangler: [], produkt: null, tekst: tekst, a: a, b: b };
    }

    function reaktion(idA, idB, bet) {
        start();
        bet = bet || {};
        var A = idA ? stof(idA) : null, B = idB ? stof(idB) : null;
        if (!A && !B) return { slags: "tom", mulig: false, mangler: [], tekst: "" };
        if (!A || !B) return { slags: "en", mulig: false, mangler: [], tekst: "", a: A || B };

        /* Oxidationsmidlet */
        if (A.klasse === "ox" || B.klasse === "ox") {
            var ox = A.klasse === "ox" ? A : B, X = ox === A ? B : A;
            if (X.klasse === "ox") return fejl("ingen", "To portioner kaliumpermanganat og intet at oxidere.", A, B);
            return oxidation(X, ox, bet);
        }

        /* Esteren: et stof med COOH og et med OH */
        var muligheder = [];
        [[A, B], [B, A]].forEach(function (par) {
            var s = par[0], a = par[1];
            if (!s.mol || !a.mol) return;
            var so = syreOH(s.mol), ao = alkOH(a.mol);
            if (so.length && ao.length) muligheder.push({ syre: s, alk: a, so: so[0], ao: ao[0] });
        });
        if (A === B && muligheder.length) {
            if (A.id === "salicylsyre") return fejl("ingen", "I spillet reagerer salicylsyre ikke med sig selv.", A, B);
        }
        /* Helst en rigtig alkohol frem for ringens OH */
        muligheder.sort(function (x, y) {
            return (erPhenol(x.alk.mol, x.ao.c) ? 1 : 0) - (erPhenol(y.alk.mol, y.ao.c) ? 1 : 0);
        });
        if (muligheder.length) return ester(muligheder[0], bet, A, B);

        if (A.id === "ethanol" && B.id === "ethanol") return ether(A, bet);

        var tekst;
        if (A.klasse === "alkohol" && B.klasse === "alkohol") {
            tekst = "To alkoholer og ingen syre. En ester skal have en carboxylsyre og en alkohol.";
        } else if (A.klasse === "syre" && B.klasse === "syre") {
            tekst = "To syrer og ingen alkohol. En ester skal have en carboxylsyre og en alkohol.";
        } else if (A.klasse === "ester" || B.klasse === "ester") {
            var e = A.klasse === "ester" ? A : B;
            tekst = cap(e.navn) + " er en ester. Den er færdig og skal ikke bruges til mere.";
        } else {
            tekst = cap(A.navn) + " og " + B.navn + " reagerer ikke med hinanden.";
        }
        return fejl("ingen", tekst, A, B);
    }

    function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

    function ester(m, bet, A, B) {
        var mangler = [];
        if (!bet.hplus) mangler.push("hplus");
        if (!bet.varme) mangler.push("varme");
        var phenol = erPhenol(m.alk.mol, m.ao.c);
        var bygget = lavEster(m.syre.mol, m.so, m.alk.mol, m.ao);
        var produkt = stofAfMol(bygget.mol);
        var ud = {
            slags: "ester", mulig: !!produkt, mangler: mangler, produkt: produkt, a: A, b: B,
            syre: m.syre, alk: m.alk, phenol: phenol,
            morf: { type: "ester", syre: m.syre, alk: m.alk, so: m.so, ao: m.ao, produkt: produkt }
        };
        if (!produkt) {
            ud.tekst = "Det giver et stof, der ikke er med i spillet.";
            ud.slags = "ingen";
            return ud;
        }
        if (mangler.length === 2) {
            ud.tekst = "Blandingen står bare. Uden svovlsyre og varme går esterdannelsen alt for langsomt.";
        } else if (mangler[0] === "hplus") {
            ud.tekst = "Uden svovlsyre som katalysator går det alt for langsomt. Blandingen står stadig i kolben.";
        } else if (mangler[0] === "varme") {
            ud.tekst = "Ved stuetemperatur går det alt for langsomt. Blandingen står stadig i kolben.";
        } else if (phenol) {
            ud.tekst = "Syrens OH og H fra ringens OH blev til vand. Resten blev til " + fuldtNavn(produkt) + ".";
        } else {
            ud.tekst = "Syrens OH og alkoholens H blev til vand. Resten blev til " + fuldtNavn(produkt) + ".";
        }
        return ud;
    }

    function oxidation(X, ox, bet) {
        var mangler = bet.varme ? [] : ["varme"];
        var base = { a: X, b: ox, mangler: mangler };
        function med(o) { for (var k in base) if (!(k in o)) o[k] = base[k]; return o; }

        if (X.id === "methansyre") {
            return med({ slags: "co2", mulig: true, produkt: null,
                tekst: mangler.length ? "Ved stuetemperatur går det langsomt. Blandingen står stadig i kolben." :
                    "Methansyre blev oxideret helt til CO₂ og vand. Det er en dyr måde at lave sodavand på." });
        }
        var t1 = X.mol && X.klasse === "alkohol" ? oxTrin1(X.mol) : null;
        if (!t1) {
            var tekst;
            if (X.klasse === "syre") tekst = cap(X.navn) + " er allerede en carboxylsyre. C-atomet i COOH har intet H, så den kan ikke oxideres mere.";
            else if (X.klasse === "keton") tekst = cap(X.navn) + " er en keton. C-atomet med O har intet H, så den kan ikke oxideres mere.";
            else if (X.klasse === "ester") tekst = cap(X.navn) + " er en ester. Den bliver ikke oxideret her.";
            else tekst = cap(X.navn) + " bliver ikke oxideret her.";
            return fejl("ingen", tekst, X, ox);
        }
        var alkHer = alkOH(X.mol)[0];
        if (t1.keton) {
            var keton = stofAfMol(t1.mol);
            return med({ slags: "oxidation", mulig: true, produkt: keton, keton: true,
                morf: { type: "ox", alk: X, ao: alkHer, keton: true, produkt: keton },
                tekst: mangler.length ? "Ved stuetemperatur går oxidationen langsomt. Blandingen står stadig i kolben." :
                    cap(X.navn) + " blev til " + fuldtNavn(keton) + ", en keton. C-atomet med O har intet H tilbage, så den bliver ikke til en syre." });
        }
        var mellem = analyser(t1.mol);
        var syre = stofAfMol(oxTrin2(t1).mol);
        return med({ slags: "oxidation", mulig: true, produkt: syre, mellem: mellem.navn,
            morf: { type: "ox", alk: X, ao: alkHer, keton: false, produkt: syre, mellem: mellem.navn },
            tekst: mangler.length ? "Ved stuetemperatur går oxidationen langsomt. Blandingen står stadig i kolben." :
                cap(X.navn) + " blev først til " + mellem.navn + " og så til " + fuldtNavn(syre) + ". Tilbagesvaleren holdt aldehydet i kolben." });
    }

    function ether(A, bet) {
        var mangler = [];
        if (!bet.hplus) mangler.push("hplus");
        if (!bet.varme) mangler.push("varme");
        if (mangler.length) {
            return fejl("ingen", "To alkoholer og ingen syre. En ester skal have en carboxylsyre og en alkohol.", A, A);
        }
        return { slags: "ether", mulig: true, mangler: [], produkt: stof("diethylether"), a: A, b: A,
            tekst: "Du har lavet diethylether og vand. Det er en ether, ikke en ester. Den blev engang brugt til bedøvelse." };
    }

    /* ----- Ruterne (til hintene) -------------------------------------------------------
       rute(navn) -> { type: "ester", syre, alk, phenol } med syren og
       alkoholen, eller { type: "ox", alk } for en keton eller syre.
       Findes syren ikke paa hylden, staar det i .syreFra (den alkohol,
       den laves af). */
    var ruter = null;

    function syrerOgAlkoholer() {
        start();
        var hylde = D.STOFFER.filter(function (d) { return d.smiles; }).map(function (d) { return STOF[d.id]; });
        return hylde;
    }

    function byg() {
        ruter = {};
        var alle = syrerOgAlkoholer();
        alle.forEach(function (s) {
            if (!syreOH(s.mol).length) return;
            alle.forEach(function (a) {
                if (s === a || !alkOH(a.mol).length) return;
                var u = reaktion(s.id, a.id, { hplus: true, varme: true });
                if (u.slags !== "ester" || !u.produkt) return;
                if (u.syre !== s) return;
                var navn = u.produkt.motornavn;
                if (!ruter[navn]) ruter[navn] = { type: "ester", syre: s, alk: a, phenol: u.phenol };
            });
        });
        /* Syrer og ketoner fra oxidation */
        alle.forEach(function (a) {
            if (a.klasse !== "alkohol") return;
            var u = reaktion(a.id, "permanganat", { varme: true });
            if (u.slags === "oxidation" && u.produkt && !ruter[u.produkt.motornavn]) {
                ruter[u.produkt.motornavn] = { type: "ox", alk: a, keton: !!u.keton };
            }
        });
        /* Syrer, der ikke staar paa hylden: hvor kommer de fra? */
        Object.keys(ruter).forEach(function (navn) {
            var r = ruter[navn];
            if (r.type === "ester" && !r.syre.hylde) {
                var fra = ruter[r.syre.motornavn];
                if (fra && fra.type === "ox") r.syreFra = fra.alk;
            }
        });
    }

    function rute(navn) {
        if (!ruter) byg();
        return ruter[navn] || null;
    }

    /* Esterens navn delt i alkoholens del og syrens del, som en liste af
       { t: tekst, k: "alk" eller "syre" }:
       pentylethanoat -> pentyl | ethanoat; methyl-2-hydroxybenzoat ->
       methyl- | 2-hydroxybenzoat. Ved ringens OH (aspirin) staar syrens
       del i parentesen: 2- | (acetyloxy) | benzoesyre. */
    function navneDele(produkt, syre) {
        var n = produkt.navn;
        /* ethansyre -> ethanoat, men benzoesyre -> benzoat */
        var oat = /oesyre$/.test(syre.motornavn) ? syre.motornavn.replace(/esyre$/, "at") : syre.motornavn.replace(/syre$/, "oat");
        if (n.slice(-oat.length) === oat && n.length > oat.length) {
            return [{ t: n.slice(0, n.length - oat.length), k: "alk" }, { t: oat, k: "syre" }];
        }
        var m = /^(.*?)(\([a-z]+oxy\))(.*)$/.exec(n);
        if (m) return [{ t: m[1], k: "alk" }, { t: m[2], k: "syre" }, { t: m[3], k: "alk" }];
        return [{ t: n, k: "alk" }];
    }

    NK.Kemi = {
        start: start,
        stof: stof,
        stofEfterNavn: stofEfterNavn,
        stofAfMol: stofAfMol,
        fuldtNavn: fuldtNavn,
        reaktion: reaktion,
        rute: rute,
        navneDele: navneDele,
        cap: cap,
        /* til morf.js og selvtesten */
        syreOH: syreOH,
        alkOH: alkOH,
        erPhenol: erPhenol,
        kopierInd: kopierInd,
        lavEster: lavEster,
        oxTrin1: oxTrin1,
        oxTrin2: oxTrin2
    };
}());

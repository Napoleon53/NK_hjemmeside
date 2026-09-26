/* =====================================================================
   oploeselighed.js - molekylerne og reglen paa fane 5 (den gamle 6.5)

   Reglen fra den gamle 6.5: tael C-atomerne, og del med antallet af
   polaere grupper.
     under 4    de polaere grupper vejer tungest: polaert, oploeses i vand
     praecis 4  lige paa graensen: lidt i begge, begge svar taeller
     over 4     carbonkaeden vejer tungest: upolaert, oploeses i heptan
     ingen polaere grupper: upolaert, heptan
   Polaere grupper: OH, COOH (én gruppe, dens C taeller med som C-atom) og
   O i kaeden (ether).

   Molekylerne skrives som en lille SMILES-streng (C, O, grene i
   parentes, = for dobbeltbinding, cifre lukker en ring). Tegningen laves
   af NK.Layout.zigzag med kaeden, der staar i data (kaede: alle tunge
   atomer i hovedkaeden, i SMILES-raekkefoelgen). Navngivningen kender
   ikke O, saa navnene staar her.

   NK.Oploes.MOLEKYLER  alle molekylerne med svaerhed 1-3
   NK.Oploes.lav(d)     { navn, mol, c, grupper, svar, ... } ud fra en post
   NK.Oploes.bunke(sete)  15 molekyler: fem af hver svaerhed, de usete foerst
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* svar: "vand", "heptan" eller "begge". Staar her, saa selvtesten kan se,
       at reglen giver det samme som den gamle 6.5. kaede: indeks (0, 1, ...)
       paa de tunge atomer i SMILES-raekkefoelgen, der er hovedkaeden. */
    var MOLEKYLER = [
        /* ----- 1: de lette ----- */
        { navn: "ethanol", smiles: "CCO", kaede: [0, 1, 2], svar: "vand", sv: 1 },
        { navn: "octan", smiles: "CCCCCCCC", svar: "heptan", sv: 1 },
        { navn: "glycerol", smiles: "OCC(O)CO", kaede: [0, 1, 2, 4, 5], svar: "vand", sv: 1, note: "propan-1,2,3-triol" },
        { navn: "benzen", smiles: "c1ccccc1", ring: true, svar: "heptan", sv: 1 },
        { navn: "methansyre", smiles: "O=CO", kaede: [0, 1, 2], svar: "vand", sv: 1 },
        { navn: "ethansyre", smiles: "CC(=O)O", kaede: [0, 1, 3], svar: "vand", sv: 1, note: "eddikesyre" },
        { navn: "propan-2-ol", smiles: "CC(O)C", kaede: [0, 1, 3], svar: "vand", sv: 1 },
        { navn: "ethan-1,2-diol", smiles: "OCCO", kaede: [0, 1, 2, 3], svar: "vand", sv: 1, note: "i kølervæske" },
        { navn: "hexan", smiles: "CCCCCC", svar: "heptan", sv: 1 },
        { navn: "cyclohexan", smiles: "C1CCCCC1", ring: true, svar: "heptan", sv: 1 },

        /* ----- 2: middel ----- */
        { navn: "butan-1-ol", smiles: "CCCCO", kaede: [0, 1, 2, 3, 4], svar: "begge", sv: 2 },
        { navn: "hexan-1,6-diol", smiles: "OCCCCCCO", svar: "vand", sv: 2 },
        { navn: "pentan-1-ol", smiles: "CCCCCO", kaede: [0, 1, 2, 3, 4, 5], svar: "heptan", sv: 2 },
        { navn: "dipropylether", smiles: "CCCOCCC", kaede: [0, 1, 2, 3, 4, 5, 6], svar: "heptan", sv: 2 },
        { navn: "diethylether", smiles: "CCOCC", kaede: [0, 1, 2, 3, 4], svar: "begge", sv: 2 },
        { navn: "hexansyre", smiles: "CCCCCC(=O)O", kaede: [0, 1, 2, 3, 4, 5, 7], svar: "heptan", sv: 2 },
        { navn: "octadecansyre", smiles: "CCCCCCCCCCCCCCCCCC(=O)O", kaede: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19], svar: "heptan", sv: 2, note: "stearinsyre, en fedtsyre" },
        { navn: "hexan-1,2,3,4,5,6-hexol", smiles: "OCC(O)C(O)C(O)C(O)CO", kaede: [0, 1, 2, 4, 6, 8, 10, 11], svar: "vand", sv: 2, note: "sorbitol, sødemiddel" },
        { navn: "heptan-1,4,7-triol", smiles: "OCCCC(O)CCCO", kaede: [0, 1, 2, 3, 4, 6, 7, 8, 9], svar: "vand", sv: 2 },

        /* ----- 3: de svaere, hvor OH-grupperne snyder ----- */
        { navn: "octan-1,2,3-triol", smiles: "OCC(O)C(O)CCCCC", kaede: [0, 1, 2, 4, 6, 7, 8, 9, 10], svar: "vand", sv: 3 },
        { navn: "heptan-1,7-diol", smiles: "OCCCCCCCO", svar: "vand", sv: 3 },
        { navn: "nonan-1,5,9-triol", smiles: "OCCCCC(O)CCCCO", kaede: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11], svar: "vand", sv: 3 },
        { navn: "dodecan-1,6,12-triol", smiles: "OCCCCCC(O)CCCCCCO", kaede: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14], svar: "begge", sv: 3 },
        { navn: "nonan-4,6-diol", smiles: "CCCC(O)CC(O)CCC", kaede: [0, 1, 2, 3, 5, 6, 8, 9, 10], svar: "heptan", sv: 3 },
        { navn: "decan-4,5-diol", smiles: "CCCC(O)C(O)CCCCC", kaede: [0, 1, 2, 3, 5, 7, 8, 9, 10, 11], svar: "heptan", sv: 3 },
        { navn: "dodecan-1,7-diol", smiles: "OCCCCCCC(O)CCCCC", kaede: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13], svar: "heptan", sv: 3 },
        { navn: "tetradecan-5,10-diol", smiles: "CCCCC(O)CCCCC(O)CCCC", kaede: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15], svar: "heptan", sv: 3 }
    ];

    var BUNKE_PR_SV = 5;

    /* ----- SMILES til molekyle ---------------------------------------------------
       Smaa bogstaver (c) er en aromatisk ring: bindingerne i ringen bliver
       skiftevis dobbelt og enkelt, som bogen tegner benzen. */
    function smiles(s) {
        var m = new NK.Molekyle(), i = 0, forrige = null, orden = 1, stak = [], ringe = {}, tunge = [];
        var aromat = [];
        while (i < s.length) {
            var c = s[i];
            if (c === "(") { stak.push(forrige); i++; continue; }
            if (c === ")") { forrige = stak.pop(); i++; continue; }
            if (c === "=") { orden = 2; i++; continue; }
            if (/\d/.test(c)) {
                if (ringe[c]) { m.bind(ringe[c].id, forrige, Math.max(orden, ringe[c].orden)); delete ringe[c]; }
                else ringe[c] = { id: forrige, orden: orden };
                orden = 1; i++; continue;
            }
            var el = c.toUpperCase(), a = m.tilfoej(el, 0, 0);
            if (c === "c") aromat.push(a.id);
            tunge.push(a.id);
            if (forrige !== null) m.bind(forrige, a.id, orden);
            forrige = a.id;
            orden = 1;
            i++;
        }
        /* Benzen: ringens bindinger skiftevis dobbelt og enkelt */
        if (aromat.length === 6) {
            for (var k = 0; k < 6; k++) {
                var bd = m.binding(aromat[k], aromat[(k + 1) % 6]);
                if (bd) bd.orden = k % 2 === 0 ? 2 : 1;
            }
        }
        return { mol: m, tunge: tunge };
    }

    /* ----- De polaere grupper ------------------------------------------------------
       COOH: et C med et =O og et OH (C'et er med i gruppen). OH: et O med ét
       H og ét C. Ether: et O mellem to C. Hver gruppe er en liste af atom-id. */
    function grupper(mol) {
        var ud = [], brugt = {};
        mol.atomer.forEach(function (a) {
            if (a.el !== "C") return;
            var dO = null, sO = null;
            mol.bindingerTil(a.id).forEach(function (bd) {
                var n = bd.a === a.id ? bd.b : bd.a, b = mol.atom(n);
                if (b.el !== "O") return;
                if (bd.orden === 2 && mol.grad(n) === 1) dO = n;
                if (bd.orden === 1 && mol.implicitH(n) === 1) sO = n;
            });
            if (dO !== null && sO !== null) {
                ud.push({ slags: "COOH", atomer: [a.id, dO, sO] });
                brugt[dO] = brugt[sO] = true;
            }
        });
        mol.atomer.forEach(function (a) {
            if (a.el !== "O" || brugt[a.id]) return;
            var cNab = mol.naboer(a.id).filter(function (n) { return mol.atom(n).el === "C"; });
            if (mol.implicitH(a.id) === 1 && cNab.length === 1) ud.push({ slags: "OH", atomer: [a.id] });
            else if (cNab.length === 2) ud.push({ slags: "O", atomer: [a.id] });
        });
        return ud;
    }

    /* Svaret efter reglen. Heltal, saa 12/3 er praecis 4. */
    function svarEfterRegel(c, g) {
        if (!g) return "heptan";
        if (c < 4 * g) return "vand";
        if (c > 4 * g) return "heptan";
        return "begge";
    }

    /* Forholdet som tekst med dansk komma: 4,5 · 4 · ≈ 2,7 */
    function forholdTekst(c, g) {
        if (!g) return "";
        if (c % g === 0) return String(c / g);
        var x = c / g, en = Math.round(x * 10) / 10;
        var praecis = Math.abs(en - x) < 1e-9;
        return (praecis ? "" : "≈ ") + en.toFixed(1).replace(".", ",");
    }

    function lav(d) {
        var s = smiles(d.smiles), mol = s.mol;
        var kaede = d.kaede ? d.kaede.map(function (k) { return s.tunge[k]; }) : s.tunge.slice();
        NK.Layout.zigzag(mol, { kaede: kaede, ring: !!d.ring, dobbelt: [], tripel: [] });
        var gr = grupper(mol);
        var cIds = mol.atomer.filter(function (a) { return a.el === "C"; }).map(function (a) { return a.id; });
        var polaer = {};
        gr.forEach(function (x) { x.atomer.forEach(function (id) { polaer[id] = true; }); });
        return {
            navn: d.navn,
            note: d.note || "",
            sv: d.sv,
            mol: mol,
            formel: mol.formel(),
            c: cIds.length,
            cIds: cIds,
            grupper: gr,
            polaer: polaer,
            svar: svarEfterRegel(cIds.length, gr.length),
            forhold: forholdTekst(cIds.length, gr.length),
            data: d
        };
    }

    /* Fem af hver svaerhed, lette foerst, med baade vand og heptan i hver
       femmer og hoejst ét graensetilfaelde. Molekyler, eleven har set i et
       tidligere spil (sete), kommer kun med, naar der ikke er nok nye. */
    function bunke(sete) {
        sete = sete || {};
        var ud = [];
        [1, 2, 3].forEach(function (sv) {
            var alle = MOLEKYLER.filter(function (d) { return d.sv === sv; });
            var nye = NK.bland(alle.filter(function (d) { return !sete[d.navn]; }));
            var gamle = NK.bland(alle.filter(function (d) { return sete[d.navn]; }));
            var kandidater = nye.concat(gamle), valgt = [];
            var tael = { vand: 0, heptan: 0, begge: 0 };
            while (valgt.length < BUNKE_PR_SV && kandidater.length) {
                var bedst = 0, bedstPoint = Infinity;
                kandidater.forEach(function (d, k) {
                    var p = tael[d.svar] + (d.svar === "begge" && tael.begge ? 10 : 0) + (sete[d.navn] ? 3 : 0);
                    if (p < bedstPoint) { bedstPoint = p; bedst = k; }
                });
                var d = kandidater.splice(bedst, 1)[0];
                tael[d.svar]++;
                valgt.push(d);
            }
            NK.bland(valgt).forEach(function (x) { ud.push(lav(x)); });
        });
        return ud;
    }

    /* Den typiske fejl og en kort besked til den. hvor: det lag, eleven valgte. */
    function fejlBesked(m, hvor) {
        var g = m.grupper.length, c = m.c;
        var harSyre = m.grupper.some(function (x) { return x.slags === "COOH"; });
        if (!g) return "Ingen polære grupper. Kun C og H, så molekylet er upolært.";
        if (hvor === "vand") {
            if (harSyre) return "Syre betyder ikke vand. " + c + " C-atomer er for mange til én COOH-gruppe.";
            return (g === 1 ? "Der er en polær gruppe" : "Der er " + g + " polære grupper") + ", men carbonkæden vejer tungest.";
        }
        if (c >= 5) return "Kæden er lang, men " + (g === 1 ? "den polære gruppe" : "de " + g + " polære grupper") + " vejer tungest.";
        return (g === 1 ? "Den polære gruppe" : "De " + g + " polære grupper") + " vejer tungest. Kæden er kort.";
    }

    /* Regnestykket som HTML med rigtig broekstreg */
    function regnestykke(m) {
        var g = m.grupper.length;
        if (!g) {
            return '<div class="regn"><div class="regn-linje"><span>' + m.c + " C-atomer og 0 polære grupper</span></div>" +
                '<div class="regn-konkl heptan">Ingen polære grupper: upolært, opløses i heptan.</div></div>';
        }
        var gT = g === 1 ? "polær gruppe" : "polære grupper";
        var konkl, klasse = m.svar;
        var fTekst = m.forhold.replace("≈ ", "");
        if (m.svar === "vand") konkl = fTekst + " er under 4. De polære grupper vejer tungest: polært, opløses i vand.";
        else if (m.svar === "heptan") konkl = fTekst + " er over 4. Carbonkæden vejer tungest: upolært, opløses i heptan.";
        else konkl = "Præcis 4. Lige på grænsen: lidt i begge. Begge svar tæller.";
        return '<div class="regn"><div class="regn-linje"><span>Forhold</span><span>=</span>' +
            '<span class="broek"><span>' + m.c + " <small>C-atomer</small></span><span class=\"broek-streg\"></span><span>" + g + " <small>" + gT + "</small></span></span>" +
            "<span>=</span><b>" + m.forhold + "</b></div>" +
            '<div class="regn-konkl ' + klasse + '">' + konkl + "</div></div>";
    }

    NK.Oploes = {
        MOLEKYLER: MOLEKYLER,
        BUNKE_PR_SV: BUNKE_PR_SV,
        smiles: smiles,
        grupper: grupper,
        svarEfterRegel: svarEfterRegel,
        forholdTekst: forholdTekst,
        lav: lav,
        bunke: bunke,
        fejlBesked: fejlBesked,
        regnestykke: regnestykke
    };
}());

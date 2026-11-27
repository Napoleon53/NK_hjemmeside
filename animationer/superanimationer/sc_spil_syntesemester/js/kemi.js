/* =====================================================================
   kemi.js - stofferne, deres stofklasse og gruppe og tegningerne

   Hvert stof er et molekyle fra molekylemotoren: SMILES bliver til et
   molekyle (NK.Smiles), navngivningen finder navn og stofklasse
   (NK.Navn), og NK.Layout.zigzag laegger det ud som i bogen. Stoffer,
   reaktionerne laver, kommer ind gennem fraMol og navngives af motoren.

   Et stof er { navn, klasse, note, mol, res, formel, antalC }.
   klasse er en noegle i D.KLASSER (alkan, alken, ..., amid) eller
   "andet".

   NK.Kemi.stof(navn)          stoffet med navnet (fra data.js)
   NK.Kemi.fraMol(mol)         stoffet, et molekyle er (navngives)
   NK.Kemi.alle(klasse)        stofferne i en klasse (fra MOLEKYLER)
   NK.Kemi.alkoholType(stof)   "primær", "sekundær", "tertiær" eller ""
   NK.Kemi.gruppe(mol, klasse) { atomer: {id: true}, bindinger: [...] }
   NK.Kemi.svg(stof, valg)     tegningen som SVG-tekst
   NK.Kemi.navn(stof)          navnet med trivialnavnet i parentes
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var BLAEK = "#1d2433";
    /* Gruppen tegnes groen som i bogen (GROEN i bogens figurkode); alt andet
       er sort. Niels 27. nov. 2026: molekylerne maa ikke vaere farvekodet,
       og overstregningen af grupperne var ikke god. */
    var GROEN = "#2e9e4f";

    function andet(bd, id) { return bd.a === id ? bd.b : bd.a; }

    /* ----- Stofklassen ------------------------------------------------------ */
    function klasseAf(res) {
        var k = res ? String(res.stofklasse || "") : "";
        var MAP = {
            "alkan": "alkan", "alken": "alken", "alkyn": "alkyn", "halogenforbindelse": "halogen",
            "alkohol": "alkohol", "aldehyd": "aldehyd", "keton": "keton", "carboxylsyre": "syre",
            "ester": "ester", "amin": "amin", "amid": "amid"
        };
        return MAP[k] || "andet";
    }

    /* ----- Gruppen: det, der afgoer stofklassen -------------------------------- */
    function carbonyler(mol) {
        var ud = [];
        mol.bindinger.forEach(function (bd) {
            if (bd.orden !== 2) return;
            var a = mol.atom(bd.a), b = mol.atom(bd.b);
            var c = a.el === "C" && b.el === "O" ? a : (b.el === "C" && a.el === "O" ? b : null);
            if (!c) return;
            var o = c === a ? b : a;
            if (mol.grad(o.id) === 1) ud.push({ c: c.id, o: o.id, bd: bd });
        });
        return ud;
    }

    /* Enkeltbundne naboer af et bestemt grundstof paa et C */
    function enkelt(mol, c, el) {
        return mol.bindingerTil(c).filter(function (bd) {
            return bd.orden === 1 && mol.atom(andet(bd, c)).el === el;
        }).map(function (bd) {
            var x = andet(bd, c);
            return { x: x, bd: bd, andre: mol.bindingerTil(x).filter(function (y) { return y !== bd; }) };
        });
    }

    function gruppe(mol, klasse) {
        var atomer = {}, bindinger = [];
        function med(bd) {
            if (bindinger.indexOf(bd) < 0) bindinger.push(bd);
            atomer[bd.a] = true;
            atomer[bd.b] = true;
        }
        var co = carbonyler(mol);
        var erCO = {};
        co.forEach(function (x) { erCO[x.c] = true; });
        if (klasse === "alkan") {
            mol.bindinger.forEach(med);
        } else if (klasse === "alken" || klasse === "alkyn") {
            var orden = klasse === "alken" ? 2 : 3;
            mol.bindinger.forEach(function (bd) {
                if (bd.orden === orden && mol.atom(bd.a).el === "C" && mol.atom(bd.b).el === "C") med(bd);
            });
        } else if (klasse === "halogen") {
            mol.bindinger.forEach(function (bd) {
                var a = mol.atom(bd.a).el, b = mol.atom(bd.b).el;
                if ((a === "C" && /^(F|Cl|Br|I)$/.test(b)) || (b === "C" && /^(F|Cl|Br|I)$/.test(a))) med(bd);
            });
        } else if (klasse === "alkohol") {
            mol.atomer.forEach(function (a) {
                if (a.el !== "O" || mol.implicitH(a.id) !== 1 || mol.grad(a.id) !== 1) return;
                var bd = mol.bindingerTil(a.id)[0], c = andet(bd, a.id);
                if (mol.atom(c).el === "C" && !erCO[c]) med(bd);
            });
        } else if (klasse === "amin") {
            mol.atomer.forEach(function (a) {
                if (a.el !== "N") return;
                var vedCO = mol.naboer(a.id).some(function (n) { return erCO[n]; });
                if (!vedCO) mol.bindingerTil(a.id).forEach(med);
            });
        } else {
            co.forEach(function (x) {
                var os = enkelt(mol, x.c, "O"), ns = enkelt(mol, x.c, "N");
                var oh = os.filter(function (s) { return !s.andre.length && mol.implicitH(s.x) === 1; });
                var oc = os.filter(function (s) { return s.andre.length === 1 && mol.atom(andet(s.andre[0], s.x)).el === "C"; });
                var cNab = mol.naboer(x.c).filter(function (n) { return mol.atom(n).el === "C"; }).length;
                if (klasse === "syre" && oh.length && !oc.length) { med(x.bd); med(oh[0].bd); }
                else if (klasse === "ester" && oc.length) { med(x.bd); med(oc[0].bd); med(oc[0].andre[0]); }
                else if (klasse === "amid" && ns.length) { med(x.bd); med(ns[0].bd); ns[0].andre.forEach(med); }
                else if (klasse === "aldehyd" && !os.length && !ns.length && mol.implicitH(x.c) >= 1) med(x.bd);
                else if (klasse === "keton" && !os.length && !ns.length && cNab === 2) med(x.bd);
            });
        }
        return { atomer: atomer, bindinger: bindinger };
    }

    /* ----- Alkoholens type ------------------------------------------------------ */
    function ohC(mol) {
        var ud = null;
        mol.atomer.forEach(function (a) {
            if (ud || a.el !== "O" || mol.grad(a.id) !== 1 || mol.implicitH(a.id) !== 1) return;
            var c = mol.naboer(a.id)[0];
            if (mol.atom(c).el === "C") ud = c;
        });
        return ud;
    }

    function alkoholType(stof) {
        if (!stof || stof.klasse !== "alkohol") return "";
        var c = ohC(stof.mol);
        if (c === null) return "";
        var n = stof.mol.naboer(c).filter(function (x) { return stof.mol.atom(x).el === "C"; }).length;
        return n <= 1 ? "primær" : (n === 2 ? "sekundær" : "tertiær");
    }

    /* ----- Stofferne --------------------------------------------------------------- */
    var REG = {};        /* navn -> stof */
    var DATA = {};       /* navn -> [klasse, navn, smiles, note] */
    var klar = false;

    function antalC(mol) {
        return mol.atomer.filter(function (a) { return a.el === "C"; }).length;
    }

    function lavStof(mol, note) {
        var res = NK.Navn.analyser(mol);
        if (!res || !res.navn) return null;
        NK.Layout.zigzag(mol, res);
        return {
            navn: res.navn,
            klasse: klasseAf(res),
            note: note || "",
            mol: mol,
            res: res,
            formel: mol.formel(),
            antalC: antalC(mol)
        };
    }

    function start() {
        if (klar) return;
        klar = true;
        D.MOLEKYLER.concat(D.EKSTRA).forEach(function (d) { DATA[d[1]] = d; });
    }

    function stof(navn) {
        start();
        if (REG[navn]) return REG[navn];
        var d = DATA[navn];
        if (!d) return null;
        var s = lavStof(NK.Smiles.laes(d[2]), d[3]);
        if (!s) return null;
        REG[navn] = s;
        if (s.navn !== navn) REG[s.navn] = s;
        return s;
    }

    /* Et molekyle, en reaktion har lavet. Kendes navnet, bruges det stof
       (med trivialnavnet); ellers laves et nyt. */
    function fraMol(mol) {
        start();
        /* Uden koordinater afgoer tegningen ikke cis eller trans: en
           elimination giver en blanding, saa navnet er but-2-en */
        mol.atomer.forEach(function (a) { a.x = 0; a.y = 0; });
        var res = NK.Navn.analyser(mol);
        if (!res || !res.navn) return null;
        if (REG[res.navn]) return REG[res.navn];
        if (DATA[res.navn]) return stof(res.navn);
        var s = lavStof(mol, "");
        if (s) REG[s.navn] = s;
        return s;
    }

    function alle(klasse) {
        start();
        return D.MOLEKYLER.filter(function (d) { return d[0] === klasse; })
            .map(function (d) { return stof(d[1]); })
            .filter(Boolean);
    }

    function navn(s) {
        if (!s) return "";
        return s.navn + (s.note ? " (" + s.note + ")" : "");
    }

    function klasseNavn(k) {
        return D.KLASSER[k] ? D.KLASSER[k].navn : "stof";
    }

    /* ----- Farver ---------------------------------------------------------------- */
    function lys(hex, t) {
        var n = parseInt(hex.slice(1), 16);
        var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        r = Math.round(r + (255 - r) * t); g = Math.round(g + (255 - g) * t); b = Math.round(b + (255 - b) * t);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    /* ----- Tegningen som SVG ----------------------------------------------------
       valg:
         skala      pixels pr. binding (standard 34)
         fremhaev   en klasse: gruppens streger og bogstaver bliver groenne,
                    som i bogen (kun i forklaringerne efter et svar)
         blaek      stregernes farve
       SVG'en har viewBox og ingen fast stoerrelse; tegnI saetter den. */
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    function svg(s, v) {
        v = v || {};
        if (!s) return "";
        var skala = v.skala || 34;
        var mol = s.mol;
        /* En alkan har ingen funktionel gruppe, saa intet bliver groent */
        var gr = v.fremhaev && v.fremhaev !== "alkan" ? gruppe(mol, v.fremhaev) : null;
        var blaek = v.blaek || BLAEK;
        var g = NK.Struktur.geometri(mol, {
            skala: skala,
            stil: "zigzag",
            farve: blaek,
            skrift: Math.max(13, Math.round(skala * 0.46)),
            linje: Math.max(1.6, skala * 0.06),
            atomFarve: function (id) { return gr && gr.atomer[id] && mol.atom(id).el !== "C" ? GROEN : null; },
            bindingFarve: function (bd) { return gr && gr.bindinger.indexOf(bd) >= 0 ? GROEN : null; }
        });
        var pad = skala * 0.45;
        var x0 = g.x0 - pad, y0 = g.y0 - pad, b = g.x1 - g.x0 + 2 * pad, h = g.y1 - g.y0 + 2 * pad;
        /* Et enkelt atom (methan) har ingen bredde: giv det plads */
        if (b < skala * 1.6) { x0 -= (skala * 1.6 - b) / 2; b = skala * 1.6; }
        if (h < skala * 1.2) { y0 -= (skala * 1.2 - h) / 2; h = skala * 1.2; }
        var d = [];
        d.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [x0, y0, b, h].map(function (t) { return +t.toFixed(1); }).join(" ") +
            '" data-b="' + b.toFixed(1) + '" data-h="' + h.toFixed(1) + '" aria-hidden="true">');
        d.push('<g stroke-linecap="round">');
        g.linjer.forEach(function (l) {
            /* Gruppens streger lidt tykkere, saa den groenne farve kan ses */
            var bred = l.farve === GROEN ? l.b * 1.5 : l.b;
            d.push('<line x1="' + l.x1.toFixed(1) + '" y1="' + l.y1.toFixed(1) + '" x2="' + l.x2.toFixed(1) + '" y2="' + l.y2.toFixed(1) +
                '" stroke="' + l.farve + '" stroke-width="' + bred.toFixed(2) + '"/>');
        });
        d.push("</g>");
        g.tekster.forEach(function (t) {
            var m = /^600 ([\d.]+)px/.exec(t.font);
            var anker = t.juster === "left" ? "start" : (t.juster === "right" ? "end" : "middle");
            d.push('<text x="' + t.x.toFixed(1) + '" y="' + (t.y + t.h * 0.04).toFixed(1) + '" font-family="Segoe UI, Arial, sans-serif" font-weight="' +
                (t.farve === GROEN ? 700 : 600) + '" font-size="' + (m ? m[1] : 16) + '" fill="' + t.farve + '" text-anchor="' + anker +
                '" dominant-baseline="central">' + esc(t.t) + "</text>");
        });
        d.push("</svg>");
        return d.join("");
    }

    /* Saetter tegningen ind i et element, saa den fylder hoejst bredde x
       hoejde px uden at blive stoerre end skala tillader */
    function tegnI(el, s, v) {
        v = v || {};
        el.innerHTML = svg(s, v);
        var e = el.firstChild;
        if (!e || !e.getAttribute) return;
        var b = Number(e.getAttribute("data-b")), h = Number(e.getAttribute("data-h"));
        var k = Math.min(1, (v.maksB || 1e9) / b, (v.maksH || 1e9) / h);
        e.setAttribute("width", Math.round(b * k));
        e.setAttribute("height", Math.round(h * k));
    }

    NK.Kemi = {
        start: start,
        stof: stof,
        fraMol: fraMol,
        alle: alle,
        alkoholType: alkoholType,
        ohC: ohC,
        gruppe: gruppe,
        carbonyler: carbonyler,
        klasseAf: klasseAf,
        klasseNavn: klasseNavn,
        svg: svg,
        tegnI: tegnI,
        navn: navn,
        lys: lys,
        BLAEK: BLAEK,
        GROEN: GROEN
    };
}());

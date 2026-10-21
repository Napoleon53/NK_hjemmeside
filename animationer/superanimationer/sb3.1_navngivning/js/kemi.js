/* =====================================================================
   kemi.js - kemien bag opgaverne. Intet her tegner eller roerer siden.

   Molekylerne bygges af molekylemotoren (../../molekylemotor/) ud fra
   navnet, og motoren giver ogsaa hovedkaeden, numrene og sidegrupperne.
   Motoren er den eneste autoritet for, hvad et molekyle hedder. Denne
   fil laeser et navn i sine dele (som i afsnit B3.1: forled, stamme og
   endelse), sammenligner to molekyler og skriver hintene og
   forklaringerne.

     K.laesNavn(tekst)        navnet i dele: forled, stamme, endelse og numre
     K.dele(navn)             delene, som de staar paa kortet
     K.stof(o)                et stof fra D.STOFFER med molekyle, dele og tal
     K.sig(mol, res)          det, to molekyler sammenlignes paa: grupper,
                              kaede, numre og sidegrupper
     K.tegneHints(stof)       hintene paa fane 1 (Tegn molekylet)
     K.tegneFejl(stof, mol)   det, der er galt med elevens tegning
     K.skriveHints(stof)      hintene paa fane 2 (Skriv navnet), med det,
                              hvert hint viser i formlen
     K.tjekNavn(stof, tekst)  elevens navn paa fane 2: rigtigt, eller hvad
                              der er galt, og molekylet, navnet giver
     K.forklaring(stof)       forklaringen paa det groenne kort
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    var STAMMER = ["meth", "eth", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"];
    var MULT = { "": 1, di: 2, tri: 3, tetra: 4 };
    var MULT_ORD = ["", "", "di", "tri", "tetra"];

    K.klasse = function (id) {
        for (var i = 0; i < D.KLASSER.length; i++) if (D.KLASSER[i].id === id) return D.KLASSER[i];
        return null;
    };

    K.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* "ét carbonatom", "to carbonatomer" */
    K.antalC = function (n) { return D.TAL[n] + (n === 1 ? " carbonatom" : " carbonatomer"); };

    /* Endelsen, som den staar i en tekst: altid med bindestreg */
    K.medStreg = function (e) { return e.charAt(0) === "-" ? e : "-" + e; };

    /* "nummer 2", "nummer 2 og 3", "nummer 2, 2 og 4" */
    function nummer(loks) {
        if (loks.length === 1) return "nummer " + loks[0];
        var ens = loks.every(function (x) { return x === loks[0]; });
        if (ens) return "nummer " + loks[0];
        return "nummer " + loks.slice(0, -1).join(", ") + " og " + loks[loks.length - 1];
    }

    function tal(s) { return s ? s.split(",").filter(function (x) { return x !== ""; }).map(Number) : null; }

    K.grundform = function (t) {
        return String(t || "").toLowerCase().trim()
            .replace(/[‐-―−]/g, "-")
            .replace(/\s+/g, "")
            .replace(/\.$/, "");
    };

    /* ----- Navnet laest i sine dele ------------------------------------------------
       K.laesNavn("4-methylpentan-2-ol") giver
         { ok, raa, stereo, forledTekst: "4-methyl",
           forled: [{ loks: [4], mult: "", navn: "methyl" }],
           n: 5, cyclo: false, stammeTekst: "pentan",
           umaettet: null | { type: "en"|"yn", loks, mult, tekst: "-2-en" },
           endelse: null | { type: "ol"|"syre", loks, mult, tekst: "-2-ol" } }
       Kun navne paa C-niveau: carbonhydrider, halogenalkaner, alkoholer og
       carboxylsyrer. Kan navnet ikke laeses saadan, er ok falsk (det goer
       den gamle skrivemaade 2-propanol heller ikke). */
    var GRUPPE = /^(?:([\d,]+)-)?(di|tri|tetra)?(methyl|ethyl|propyl|butyl|chlor|brom|fluor|iod|hydroxy)/;

    K.laesNavn = function (tekst) {
        var s = K.grundform(tekst), m, rest, rod, slut = "";
        var ud = { ok: false, raa: s, stereo: null, forled: [], forledTekst: "", n: 0, cyclo: false,
            stammeTekst: "", umaettet: null, endelse: null };
        m = /^(cis|trans)-/.exec(s);
        if (m) { ud.stereo = m[1]; s = s.slice(m[0].length); }
        m = /(-([\d,]+)-|)(di|tri|tetra|)(ol|syre)$/.exec(s);
        if (m && m.index > 0) {
            ud.endelse = { type: m[4], loks: m[2] ? tal(m[2]) : null, mult: m[3], tekst: m[0] };
            rest = s.slice(0, m.index);
            if (!/an$/.test(rest)) return ud;
            rod = rest.slice(0, -2);
            slut = "an";
        } else {
            m = /(a?)(-([\d,]+)-|)(di|tri|)(en|yn)$/.exec(s);
            if (m && m.index > 0) {
                ud.umaettet = { type: m[5], loks: m[3] ? tal(m[3]) : null, mult: m[4], tekst: m[0].slice(m[1].length) };
                rod = s.slice(0, m.index);
                slut = m[1];
            } else if (/an$/.test(s) && s.length > 2) {
                rod = s.slice(0, -2);
                slut = "an";
            } else return ud;
        }
        /* Stammen staar sidst. Forleddet foran skal kunne laeses som grupper,
           saa bromethan er brom + ethan og ikke bro + methan */
        for (var i = 0; i < rod.length; i++) {
            m = /^(cyclo)?(meth|eth|prop|but|pent|hex|hept|oct|non|dec)$/.exec(rod.slice(i));
            if (!m) continue;
            var forled = laesForled(rod.slice(0, i));
            if (!forled) continue;
            ud.forledTekst = rod.slice(0, i);
            ud.forled = forled;
            ud.cyclo = !!m[1];
            ud.n = STAMMER.indexOf(m[2]) + 1;
            ud.stammeTekst = (m[1] || "") + m[2] + slut;
            ud.ok = true;
            return ud;
        }
        return ud;
    };

    /* "3-ethyl-2-methyl" -> [{ loks: [3], mult: "", navn: "ethyl" }, ...], eller null */
    function laesForled(p) {
        var ud = [];
        while (p) {
            var g = GRUPPE.exec(p);
            if (!g) return null;
            ud.push({ loks: g[1] ? tal(g[1]) : null, mult: g[2] || "", navn: g[3] });
            p = p.slice(g[0].length);
            if (p.charAt(0) === "-") {
                p = p.slice(1);
                if (!/^\d/.test(p)) return null;
            } else if (p && /^\d/.test(p)) return null;
        }
        return ud;
    }

    /* Navnets dele, som de staar paa kortet: [{ type, tekst }] */
    K.dele = function (navn) {
        var p = K.laesNavn(navn), ud = [];
        if (!p.ok) return [{ type: "stamme", tekst: navn }];
        if (p.forledTekst) ud.push({ type: "forled", tekst: p.forledTekst });
        ud.push({ type: "stamme", tekst: p.stammeTekst });
        var e = p.endelse || p.umaettet;
        if (e) ud.push({ type: "endelse", tekst: e.tekst });
        return ud;
    };

    /* ----- Det, to molekyler sammenlignes paa ------------------------------------------
       Grupperne taelles paa hele molekylet (en COOH-gruppe er C, =O og OH
       tilsammen, ikke en alkohol). Numrene er motorens: hovedkaeden i
       nummereringens raekkefoelge. */
    K.sig = function (mol, res) {
        var s = {
            navn: res && res.navnUdenStereo, nC: 0, n: res && res.kaede ? res.kaede.length : 0, ring: !!(res && res.ring),
            OH: 0, COOH: 0, CO: 0, dbl: 0, tri: 0, Cl: 0, Br: 0, andet: 0,
            lokOH: [], dobbelt: res && res.dobbelt ? res.dobbelt.slice() : [], tripel: res && res.tripel ? res.tripel.slice() : [],
            subs: [], gruppeAtomer: [], ohAtomer: [], coohAtomer: []
        };
        var kaede = res && res.kaede ? res.kaede : [], brugt = {};
        function el(id) { return mol.atom(id).el; }
        function orden(a, b) { var bd = mol.binding(a, b); return bd ? bd.orden : 0; }
        mol.atomer.forEach(function (a) {
            if (a.el === "C") s.nC++;
            else if (a.el === "Cl") s.Cl++;
            else if (a.el === "Br") s.Br++;
            else if (a.el !== "O" && a.el !== "H") s.andet++;
        });
        mol.bindinger.forEach(function (bd) {
            if (el(bd.a) !== "C" || el(bd.b) !== "C") return;
            if (bd.orden === 2) s.dbl++;
            if (bd.orden === 3) s.tri++;
        });
        mol.atomer.forEach(function (c) {
            if (c.el !== "C") return;
            var nb = mol.naboer(c.id);
            var dobO = nb.filter(function (x) { return el(x) === "O" && orden(c.id, x) === 2; });
            if (!dobO.length) return;
            var oh = nb.filter(function (x) { return el(x) === "O" && orden(c.id, x) === 1 && mol.naboer(x).length === 1 && !mol.atom(x).q; });
            brugt[dobO[0]] = true;
            if (oh.length) {
                brugt[oh[0]] = true;
                s.COOH++;
                s.coohAtomer.push(c.id, dobO[0], oh[0]);
            } else s.CO++;
        });
        mol.atomer.forEach(function (a) {
            if (a.el !== "O" || brugt[a.id]) return;
            var nb = mol.naboer(a.id);
            if (nb.length === 1 && orden(a.id, nb[0]) === 1 && !a.q) {
                s.OH++;
                s.ohAtomer.push(a.id, nb[0]);
                var i = kaede.indexOf(nb[0]);
                if (i >= 0) s.lokOH.push(i + 1);
            } else s.andet++;
        });
        s.lokOH.sort(function (x, y) { return x - y; });
        s.subs = (res && res.sub ? res.sub : []).map(function (x) { return { lok: x.lok, navn: x.navn, atomer: x.atomer || [] }; });
        return s;
    };

    /* Sidegrupperne som tekst, saa de kan sammenlignes: "2-methyl,3-methyl" */
    function subNoegle(subs, udenHydroxy) {
        return subs.filter(function (x) { return !udenHydroxy || x.navn !== "hydroxy"; })
            .map(function (x) { return x.lok + "-" + x.navn; }).sort().join(",");
    }

    /* ----- Et stof til fane 1 og 2 ---------------------------------------------------- */
    K.stof = function (o) {
        var laest = NK.NavnLaeser.laes(o.navn);
        var mol = laest.mol;
        if (o.vend) mol.atomer.forEach(function (a) { a.x = -a.x; });
        var res = NK.Navn.analyser(mol);
        var p = K.laesNavn(o.navn);
        return {
            o: o, id: o.navn, navn: o.navn, klasse: o.k, niv: o.niv, mol: mol, res: res,
            motorNavn: res.navnUdenStereo, p: p, dele: K.dele(o.navn),
            antal: mol.atomer.length, n: res.kaede.length, sig: K.sig(mol, res)
        };
    };

    /* ----- Opgavernes raekkefoelge ------------------------------------------------------
       Niveau for niveau (Let, Middel, Svaer). Inden for et niveau skiftes
       stofklasserne, saa de ikke kommer i klumper: alkan, alken, alkyn,
       halogenalkan, alkohol, carboxylsyre, alkan, ... */
    K.raekkefoelge = function (liste) {
        var klasser = D.KLASSER.map(function (k) { return k.id; }), ud = [];
        [1, 2, 3].forEach(function (niv) {
            var pr = klasser.map(function (k) { return liste.filter(function (o) { return o.niv === niv && o.k === k; }); });
            for (var r = 0, mere = true; mere; r++) {
                mere = false;
                pr.forEach(function (l) { if (l[r]) { ud.push(l[r]); mere = true; } });
            }
        });
        return ud.map(function (o, i) { return { id: o.navn, niv: o.niv, o: o, i: i }; });
    };

    /* ----- Ord om grupperne ------------------------------------------------------------- */
    var GRUPPENAVN = {
        methyl: ["en methylgruppe", "methylgrupper"], ethyl: ["en ethylgruppe", "ethylgrupper"],
        propyl: ["en propylgruppe", "propylgrupper"], butyl: ["en butylgruppe", "butylgrupper"],
        chlor: ["et chloratom", "chloratomer"], brom: ["et bromatom", "bromatomer"],
        fluor: ["et fluoratom", "fluoratomer"], iod: ["et iodatom", "iodatomer"],
        hydroxy: ["en OH-gruppe", "OH-grupper"]
    };
    var ALKYL_C = { methyl: 1, ethyl: 2, propyl: 3, butyl: 4 };

    function gruppeOrd(navn, antal) {
        var g = GRUPPENAVN[navn] || ["en " + navn + "gruppe", navn + "grupper"];
        return antal > 1 ? D.TAL[antal] + " " + g[1] : g[0];
    }

    /* "2,3-dimethyl" ud fra en gruppe i K.laesNavn */
    function forledDel(g) {
        return (g.loks ? g.loks.join(",") + "-" : "") + g.mult + g.navn;
    }

    function antalIGruppe(g) { return g.loks ? g.loks.length : MULT[g.mult] || 1; }

    /* Det, der skal have det laveste nummer: hovedgruppen, saa dobbelt- og
       tripelbindingen, saa sidegrupperne */
    function foerstOrd(p) {
        if (p.endelse) return p.endelse.type === "syre" ? "COOH-gruppen" : (p.endelse.mult ? "OH-grupperne" : "OH-gruppen");
        if (p.umaettet) return p.umaettet.type === "en" ? "dobbeltbindingen" : "tripelbindingen";
        var g = p.forled;
        if (g.length === 1) {
            var navn = g[0].navn, en = antalIGruppe(g[0]) === 1;
            if (ALKYL_C[navn]) return en ? "sidegruppen" : "sidegrupperne";
            if (navn === "hydroxy") return en ? "OH-gruppen" : "OH-grupperne";
            return navn + (en ? "atomet" : "atomerne");
        }
        return "sidegrupperne";
    }

    function stammeVist(p) { return p.stammeTekst; }

    /* "har ingen OH-gruppe", "har kun én OH-gruppe", "har kun to OH-grupper" */
    function harKun(antal, ental, flertal, intetkoen) {
        if (!antal) return "har ingen " + ental;
        if (antal === 1) return "har kun " + (intetkoen ? "ét " : "én ") + ental;
        return "har kun " + D.TAL[antal] + " " + flertal;
    }

    /* Hvor grupperne sidder: " på carbonatom nummer 2 og 3", " på carbonatom
       nummer 2" (2,2-dimethyl) eller ": to på carbonatom nummer 2 og én på
       nummer 4" (2,2,4-trimethyl) */
    function placering(loks, intetkoen) {
        if (!loks) return "";
        var t = {}, o = [];
        loks.forEach(function (l) { if (!t[l]) { t[l] = 0; o.push(l); } t[l]++; });
        if (o.length === 1 || o.every(function (l) { return t[l] === 1; })) return " på carbonatom " + nummer(o);
        return ": " + o.map(function (l, i) {
            return (t[l] === 1 ? (intetkoen ? "ét" : "én") : D.TAL[t[l]]) + " på " + (i === 0 ? "carbonatom " : "") + "nummer " + l;
        }).join(" og ");
    }

    /* Hvor der skal klikkes: "på carbonatom nummer 2 og 3", "to gange paa
       carbonatom nummer 2 og én gang på nummer 4", "tre gange på carbonatomet" */
    function klikTekst(g) {
        var antal = antalIGruppe(g);
        if (!g.loks) return antal > 1 ? D.TAL[antal] + " gange på carbonatomet" : "på carbonatomet";
        var t = {}, o = [];
        g.loks.forEach(function (l) { if (!t[l]) { t[l] = 0; o.push(l); } t[l]++; });
        if (o.every(function (l) { return t[l] === 1; })) return "på carbonatom " + nummer(o);
        return o.map(function (l, i) {
            return (t[l] === 1 ? "én gang" : D.TAL[t[l]] + " gange") + " på " + (i === 0 ? "carbonatom " : "") + "nummer " + l;
        }).join(" og ");
    }

    /* ----- Fane 1: hintene -------------------------------------------------------------- */
    K.tegneHints = function (stof) {
        var p = stof.p, h = [], n = p.n, e = p.endelse, u = p.umaettet;
        /* 1. Stammen */
        if (p.cyclo) h.push("Stammen " + p.stammeTekst + " er en ring med " + K.antalC(n) + ". Vælg Ring, og klik på tavlen.");
        else if (e && e.type === "syre" && n > 1) {
            h.push("Stammen " + p.stammeTekst + " er " + K.antalC(n) + " i træk. Carbonatomet i COOH er det sidste af dem.");
        } else if (n === 1) h.push("Stammen " + stammeVist(p) + " er ét carbonatom. Det står allerede på tavlen.");
        else h.push("Stammen " + stammeVist(p) + " er " + K.antalC(n) + " i træk. Tegn kæden først.");
        /* 2. Endelsen */
        if (e && e.type === "ol") {
            var flere = MULT[e.mult] > 1;
            var paa = e.loks ? " på carbonatom " + nummer(e.loks) : (p.cyclo ? " på ringen" : "");
            h.push("Endelsen " + K.medStreg(e.tekst) + " er " + (flere ? D.TAL[MULT[e.mult]] + " OH-grupper" : "en OH-gruppe") + paa +
                ". Vælg −OH, og klik på carbonatomet.");
        } else if (e && e.type === "syre") {
            if (e.mult === "di") h.push("Endelsen -disyre er en COOH-gruppe i hver ende af kæden. Vælg −COOH, og klik på begge ender.");
            else if (n === 1) h.push("Methansyre er kun COOH-gruppen. Vælg −COOH, og klik på carbonatomet, der står på tavlen.");
            else h.push("Endelsen -syre er en COOH-gruppe for enden af kæden. Vælg −COOH, og klik på carbonatomet for enden.");
        } else if (u) {
            var tri = u.type === "yn";
            h.push("Endelsen " + K.medStreg(u.tekst) + " er en " + (tri ? "tripelbinding" : "dobbeltbinding") +
                (u.loks ? " mellem carbonatom " + u.loks[0] + " og " + (u.loks[0] + 1) : "") +
                ". Vælg = Binding, og klik på " + (u.loks ? "den" : "en binding") + (tri ? " to gange." : "."));
        }
        /* 3. Forleddet: én gruppe ad gangen */
        p.forled.forEach(function (g) {
            var antal = antalIGruppe(g), d = forledDel(g), klik = klikTekst(g);
            if (ALKYL_C[g.navn]) {
                var c = ALKYL_C[g.navn];
                h.push("Forleddet " + d + " er " + gruppeOrd(g.navn, antal) + " med " + K.antalC(c) + (antal > 1 ? " hver" : "") +
                    ". Vælg Kæde, og klik " + klik + (c > 1 ? " og så på det nye carbonatom." : "."));
            } else if (g.navn === "hydroxy") {
                h.push("Forleddet " + d + " er en OH-gruppe. Vælg −OH, og klik " + klik + ".");
            } else {
                var sym = g.navn === "brom" ? "−Br" : "−Cl";
                h.push("Forleddet " + d + " er " + gruppeOrd(g.navn, antal) + ". Vælg " + sym + ", og klik " + klik + ".");
            }
        });
        return h;
    };

    /* ----- Fane 1: det, der er galt med tegningen ------------------------------------------
       Tjekkes, naar tegningen har mindst lige saa mange atomer som stoffet.
       Raekkefoelgen er navnets: grupperne (endelsen), kaeden (stammen), numrene
       og til sidst sidegrupperne (forleddet). */
    K.tegneFejl = function (stof, mol) {
        if (mol.fragmenter().length > 1) return "Tegningen skal være ét molekyle. Slet de løse atomer med højreklik, eller tryk Fortryd.";
        var res = NK.Navn.analyser(mol);
        if (!res || !res.navn) return "Den tegning kan ikke få et navn. Tryk Fortryd, eller ryd tavlen og tegn kæden først.";
        var X = K.sig(mol, res), T = stof.sig, p = stof.p, e = p.endelse, u = p.umaettet;
        var du = "Du har tegnet " + res.navnUdenStereo + ". ", stof1 = K.stor(stof.navn);
        /* 1. Grupperne */
        if (X.andet) return du + "Tegningen har atomer, som " + stof.navn + " ikke har. Tryk Fortryd.";
        if (T.COOH !== X.COOH) {
            if (T.COOH > X.COOH) {
                if (X.CO && X.OH) return du + "=O og −OH skal sidde på det samme carbonatom. Så er de én COOH-gruppe.";
                return du + (T.COOH > 1 ? "Endelsen -disyre er en COOH-gruppe i hver ende af kæden." : "Endelsen -syre er en COOH-gruppe for enden af kæden.");
            }
            return du + stof1 + " " + harKun(T.COOH, "COOH-gruppe", "COOH-grupper") + ".";
        }
        if (X.CO) return du + (T.COOH ? "=O skal sidde på det samme carbonatom som −OH." : stof1 + " har intet =O.");
        if (T.OH !== X.OH) {
            if (T.OH > X.OH) {
                if (e && e.type === "ol") return du + "Endelsen " + K.medStreg(e.tekst) + " er " + (T.OH > 1 ? D.TAL[T.OH] + " OH-grupper." : "en OH-gruppe.");
                return du + "Forleddet hydroxy er en OH-gruppe på kæden.";
            }
            if (T.COOH && !T.OH) return du + "OH skal sidde i COOH-gruppen sammen med =O, ikke for sig selv.";
            return du + stof1 + " " + harKun(T.OH, "OH-gruppe", "OH-grupper") + ".";
        }
        var halo = [["Br", "brom"], ["Cl", "chlor"]];
        for (var i = 0; i < halo.length; i++) {
            var sym = halo[i][0], ord = halo[i][1];
            if (T[sym] === X[sym]) continue;
            if (T[sym] > X[sym]) return du + "Forleddet " + ord + " betyder et " + ord + "atom" + (T[sym] > 1 ? ". Med " + MULT_ORD[T[sym]] + ord + " er der " + D.TAL[T[sym]] + "." : ".");
            return du + stof1 + (T[sym] ? " " + harKun(T[sym], ord + "atom", ord + "atomer", true) + "." : " har intet " + ord + "atom.");
        }
        if (T.ring !== X.ring) {
            if (T.ring) return du + "Cyclo betyder, at carbonatomerne sidder i en ring. Vælg Ring, og klik på tavlen.";
            return du + stof1 + " har ingen ring. Ryd tavlen, og tegn en kæde.";
        }
        if (T.tri !== X.tri) {
            if (T.tri > X.tri) {
                if (X.dbl > T.dbl) return du + "Klik på dobbeltbindingen igen. Så bliver den til en tripelbinding.";
                return du + "Endelsen " + K.medStreg(u.tekst) + " er en tripelbinding. Vælg = Binding, og klik to gange på bindingen.";
            }
            return du + stof1 + " har ingen tripelbinding. Klik på den, til den er enkelt" + (T.dbl ? " eller dobbelt." : ".");
        }
        if (T.dbl !== X.dbl) {
            if (T.dbl > X.dbl) return du + "Endelsen " + K.medStreg(u.tekst) + " er en dobbeltbinding. Vælg = Binding, og klik på bindingen.";
            return du + stof1 + " har ingen dobbeltbinding. Klik på den, til den er enkelt.";
        }
        /* 2. Kaeden */
        if (X.n !== T.n) {
            if (T.ring) return du + "Ringen skal have " + K.antalC(T.n) + ".";
            if (T.COOH && X.n === T.n + 1) return du + "Carbonatomet i COOH tæller med i stammen. " + K.stor(p.stammeTekst) + " er " + K.antalC(T.n) + " i alt.";
            return du + "Stammen " + stammeVist(p) + " er " + K.antalC(T.n) + " i den længste kæde. Din længste kæde har " + D.TAL[X.n] + ".";
        }
        /* 3. Numrene paa hovedgruppen og dobbelt- og tripelbindingen */
        if (e && e.type === "ol" && X.lokOH.join() !== T.lokOH.join()) {
            return du + "Tallet " + T.lokOH.join(",") + " betyder, at " + (T.OH > 1 ? "OH-grupperne sidder på carbonatom " : "OH-gruppen sidder på carbonatom ") + nummer(T.lokOH) + ".";
        }
        if (u && (X.dobbelt.join() !== T.dobbelt.join() || X.tripel.join() !== T.tripel.join())) {
            var lok = (u.type === "en" ? T.dobbelt : T.tripel)[0];
            return du + "Tallet " + lok + " betyder, at " + (u.type === "en" ? "dobbeltbindingen" : "tripelbindingen") + " begynder ved carbonatom nummer " + lok + ".";
        }
        /* 4. Sidegrupperne */
        if (subNoegle(X.subs) !== subNoegle(T.subs)) {
            if (!p.forled.length) return du + stof1 + " har intet forled. Så har kæden ingen sidegrupper.";
            var g = null;
            p.forled.forEach(function (gr) {
                var mine = T.subs.filter(function (x) { return x.navn === gr.navn; }).map(function (x) { return x.lok; }).sort().join();
                var dine = X.subs.filter(function (x) { return x.navn === gr.navn; }).map(function (x) { return x.lok; }).sort().join();
                if (!g && mine !== dine) g = gr;
            });
            if (!g) return du + "Der er en sidegruppe for meget. Forleddet " + p.forledTekst + " siger, hvilke der skal være.";
            var antal = antalIGruppe(g);
            return du + "Forleddet " + forledDel(g) + " betyder " + gruppeOrd(g.navn, antal) + placering(g.loks, !ALKYL_C[g.navn] && g.navn !== "hydroxy") + ".";
        }
        return du + "Sammenlign med navnet, del for del.";
    };

    /* ----- Fane 2: hintene -----------------------------------------------------------------
       Bogens fire trin (afsnit B3.1): kaeden, numrene, endelsen og forleddet.
       vis: det, hintet goer gult i formlen ("kaede", "gruppe", "side"), og
       numre: numrene kommer paa kaeden og bliver. */
    K.skriveHints = function (stof) {
        var p = stof.p, n = p.n, e = p.endelse, u = p.umaettet, h = [];
        var medTal = /\d/.test(stof.navn);
        /* 1. Stammen */
        var t;
        if (p.cyclo) t = "Carbonatomerne sidder i en ring med " + K.antalC(n) + ". Stammen er " + stammeVist(p) + ".";
        else if (e && e.type === "syre") t = "Den længste kæde er gul. Den har " + K.antalC(n) + " med carbonatomet i COOH. Stammen er " + p.stammeTekst + ".";
        else if (u) t = "Den længste kæde med " + (u.type === "en" ? "dobbeltbindingen" : "tripelbindingen") + " er gul. Den har " + K.antalC(n) + ". Stammen er " + p.stammeTekst + ".";
        else if (n === 1) t = "Der er kun ét carbonatom. Stammen er " + p.stammeTekst + ".";
        else t = "Den længste kæde er gul. Den har " + K.antalC(n) + ". Stammen er " + p.stammeTekst + ".";
        h.push({ tekst: t, vis: "kaede" });
        /* 2. Numrene */
        if (medTal && !p.cyclo) h.push({ tekst: "Numrene står på kæden. Nummer 1 er den ende, der giver " + foerstOrd(p) + " det laveste tal.", vis: null, numre: true });
        /* 3. Endelsen */
        if (e && e.type === "ol") {
            h.push({ tekst: e.loks ? (MULT[e.mult] > 1 ? "OH-grupperne sidder på carbonatom " : "OH-gruppen sidder på carbonatom ") + nummer(e.loks) + ". " +
                "Endelsen er " + K.medStreg(e.tekst) + "." : "OH-gruppen giver endelsen -ol. Der står intet tal, når den kun kan sidde ét sted.", vis: "gruppe" });
        } else if (e && e.type === "syre") {
            h.push({ tekst: "COOH-gruppen giver endelsen " + K.medStreg(e.tekst) + ". Den er altid nummer 1, så der står intet tal.", vis: "gruppe" });
        } else if (u) {
            var ord = u.type === "en" ? "Dobbeltbindingen" : "Tripelbindingen";
            h.push({ tekst: (u.loks ? ord + " begynder ved carbonatom nummer " + u.loks[0] + ". " : ord + " kan kun sidde ét sted. ") +
                "Endelsen er " + K.medStreg(u.tekst) + ".", vis: "gruppe" });
        }
        /* 4. Forleddet */
        if (p.forled.length) {
            var dele = p.forled.map(function (g) {
                var antal = antalIGruppe(g);
                return gruppeOrd(g.navn, antal) + placering(g.loks, !ALKYL_C[g.navn] && g.navn !== "hydroxy").replace("carbonatom ", "");
            });
            var tekst = (dele.length > 1 ? "Sidegrupperne står i alfabetisk rækkefølge: " : K.stor(dele[0]) + " giver ") + "forleddet " + p.forledTekst + ".";
            if (dele.length === 1 && p.forled[0].navn !== "hydroxy" && !ALKYL_C[p.forled[0].navn] && !p.forled[0].loks) tekst = K.stor(dele[0]) + " giver forleddet " + p.forledTekst + ".";
            h.push({ tekst: tekst, vis: "side" });
        }
        return h;
    };

    /* ----- Fane 2: elevens navn -------------------------------------------------------------
       Giver { tom } eller { ok, note, tekst, mol, navn, skrevet, same }:
         ok     navnet er rigtigt (ogsaa den gamle skrivemaade og et tal, der
                kan udelades, med en note)
         tekst  hvad der er galt (naar ok er falsk)
         mol    molekylet, navnet giver (tegnes til hoejre paa tavlen), eller null
         same   navnet giver det rigtige molekyle */
    K.tjekNavn = function (stof, raa) {
        var g = K.grundform(raa);
        if (!g) return { tom: true };
        var ud = { ok: false, note: "", tekst: "", mol: null, navn: null, skrevet: String(raa).trim(), same: false };
        /* Det, navnelaeseren ikke kan laese, men som er nemt at sige noget om */
        if (/\d[a-zæøå(]|[a-zæøå)]\d/.test(g)) { ud.tekst = "Sæt en bindestreg mellem tal og bogstaver, fx 2-methyl og butan-2-ol."; return ud; }
        if (/\d\.\d/.test(g)) { ud.tekst = "Numrene skrives med komma imellem, fx 2,3-dimethyl."; return ud; }
        if (/-\d[\d,]*-(di)?syre$/.test(g)) { ud.tekst = "I en carboxylsyre er carbonatomet i COOH altid nummer 1. Der står intet tal foran -syre."; return ud; }
        var r = NK.NavnLaeser.laes(raa);
        if (r.fejl) {
            var f = r.fejl;
            if (/^Det navn kan tegnebrættet ikke læse/.test(f)) f = "Det navn kan tavlen ikke læse. Tjek stavningen, tallene og bindestregerne.";
            ud.tekst = f;
            return ud;
        }
        ud.mol = r.mol;
        ud.navn = r.res.navnUdenStereo;
        var T = stof.res, note = r.note || "";
        ud.same = r.res.navnUdenStereo === T.navnUdenStereo;
        if (!ud.same) {
            ud.tekst = K.forskelSkriv(stof, r.mol, r.res, g);
            return ud;
        }
        if (r.trivial) { ud.tekst = K.stor(ud.skrevet) + " er stoffets trivialnavn. Skriv det systematiske navn."; return ud; }
        var stereo = /^(cis|trans)-/.exec(g);
        if (stereo && r.res.navn !== T.navn) {
            ud.tekst = "Formlen er tegnet som " + (T.stereo || "trans") + ", ikke " + stereo[1] + ". Du kan også skrive navnet uden cis og trans.";
            return ud;
        }
        var udenStereo = g.replace(/^(cis|trans)-/, "");
        if (udenStereo === T.navnUdenStereo) { ud.ok = true; return ud; }
        if (/^På dansk/.test(note)) { ud.tekst = "Det er det engelske navn. Skriv det med de danske endelser."; return ud; }
        if (/^Den nyere skrivemåde/.test(note)) { ud.ok = true; ud.note = "Den nyere skrivemåde er " + T.navnUdenStereo + "."; return ud; }
        if (/Kaldes også/.test(note)) { ud.ok = true; ud.note = "Det skrives normalt kortere: " + T.navnUdenStereo + "."; return ud; }
        ud.tekst = K.regelFejl(stof, g);
        return ud;
    };

    /* Navnet giver det rigtige molekyle, men det er ikke skrevet efter reglerne */
    K.regelFejl = function (stof, g) {
        var S = K.laesNavn(g), T = stof.p;
        var nok = "Navnet passer på formlen, men det er ikke skrevet efter reglerne. Brug hintet.";
        function ren(t) { return t.replace(/^(cis|trans)-/, "").replace(/[-,]/g, ""); }
        if (ren(g) === ren(stof.navn)) return "Næsten rigtigt. Tjek bindestregerne: der står kun bindestreg ved et tal.";
        if (!S.ok) return nok;
        if (S.n && S.n < T.n) return "Det er ikke den længste kæde. Find en længere; den må gerne knække ved en sidegruppe.";
        var Se = S.endelse || S.umaettet, Te = T.endelse || T.umaettet;
        if (Te && Se && !Te.loks && Se.loks) {
            if (T.endelse && T.endelse.type === "syre") return "I en carboxylsyre er carbonatomet i COOH altid nummer 1. Der står intet tal foran -syre.";
            return "Tallet foran endelsen skal ikke stå der. Gruppen kan kun sidde ét sted.";
        }
        if (Te && Se && Te.loks && !Se.loks) return "Tallet mangler foran endelsen. Det viser, hvor " + foerstOrd(T) + " sidder.";
        /* Ens sidegrupper skrives samlet */
        var set = {}, dobbelt = false;
        S.forled.forEach(function (x) { if (set[x.navn]) dobbelt = true; set[x.navn] = true; });
        if (dobbelt) return "Ens sidegrupper skrives samlet: to med di og tre med tri foran, og alle numrene foran med komma imellem.";
        var navne = S.forled.map(function (x) { return x.navn; });
        var sorteret = navne.slice().sort();
        if (navne.join() !== sorteret.join()) return "Sidegrupperne står i alfabetisk rækkefølge. Di og tri tæller ikke med.";
        if (S.n === T.n) {
            var n = T.n;
            var lok = function (p) {
                var l = [];
                var e = p.endelse || p.umaettet;
                if (e && e.loks) l = l.concat(e.loks);
                p.forled.forEach(function (x) { if (x.loks) l = l.concat(x.loks.map(function (q) { return x.navn + q; })); });
                return l;
            };
            var spejl = function (p) {
                var l = [];
                var e = p.endelse || p.umaettet;
                if (e && e.loks) {
                    if (p.umaettet && !p.endelse) l = l.concat(e.loks.map(function (q) { return n - q; }));
                    else l = l.concat(e.loks.map(function (q) { return n + 1 - q; }));
                }
                p.forled.forEach(function (x) { if (x.loks) l = l.concat(x.loks.map(function (q) { return x.navn + (n + 1 - q); })); });
                return l;
            };
            var a = lok(S).sort().join(), b = lok(T).sort().join(), c = spejl(S).sort().join();
            if (a !== b && c === b) return "Nummerér fra den anden ende af kæden. Så får " + foerstOrd(T) + " " + (/erne$/.test(foerstOrd(T)) ? "lavere tal." : "et lavere tal.");
            if (a !== b) return "Tjek numrene. Nummerér fra den ende, der giver " + foerstOrd(T) + " det laveste tal.";
        }
        return nok;
    };

    /* Elevens stamme er for kort. Har molekylet en sidegren, kan kaeden
       gaa gennem den; ellers er der bare talt for faa carbonatomer. */
    function laengereKaede(T) {
        var gren = T.subs.some(function (x) { return ALKYL_C[x.navn]; });
        return gren ? "Det er ikke den længste kæde. Find en længere; den må gerne knække ved en sidegruppe."
            : "Kæden er længere. Tæl hvert knæk og hver ende i zigzagformlen.";
    }

    /* Navnet giver et andet stof: hvad i formlen er laest forkert? */
    K.forskelSkriv = function (stof, mol, res, skrevet) {
        var X = K.sig(mol, res), T = stof.sig, p = stof.p;
        /* Det, eleven skrev: stammen og numrene, som de staar i navnet */
        var S = K.laesNavn(skrevet || ""), Se = S.ok ? (S.endelse || S.umaettet) : null, Te = p.endelse || p.umaettet;
        if (X.COOH !== T.COOH) {
            if (T.COOH > X.COOH) return "Molekylet har " + (T.COOH > 1 ? "to COOH-grupper" : "en COOH-gruppe") + ": =O og OH på samme carbonatom. Så ender navnet på " + (T.COOH > 1 ? "-disyre." : "-syre.");
            return "Molekylet " + harKun(T.COOH, "COOH-gruppe", "COOH-grupper") + ".";
        }
        if (X.OH !== T.OH) {
            if (T.OH > X.OH) {
                if (T.COOH) return "Molekylet har også en OH-gruppe på kæden. Den står som hydroxy foran stammen.";
                return "Molekylet har " + (T.OH > 1 ? D.TAL[T.OH] + " OH-grupper" : "en OH-gruppe") + " på kæden. Så ender navnet på " + (T.OH > 1 ? "-" + MULT_ORD[T.OH] + "ol." : "-ol.");
            }
            return "Molekylet " + harKun(T.OH, "OH-gruppe", "OH-grupper") + " på kæden." + (T.COOH ? " OH i COOH-gruppen tæller ikke med." : "");
        }
        var halo = [["Br", "brom"], ["Cl", "chlor"]];
        for (var i = 0; i < halo.length; i++) {
            var sym = halo[i][0], ord = halo[i][1];
            if (T[sym] === X[sym]) continue;
            if (!T[sym]) return "Molekylet har intet " + ord + "atom.";
            return "Molekylet har " + (T[sym] > 1 ? D.TAL[T[sym]] + " " + ord + "atomer. Så står der " + MULT_ORD[T[sym]] + ord + " foran." : "ét " + ord + "atom. Så står der " + ord + " foran.");
        }
        if (X.ring !== T.ring) return T.ring ? "Carbonatomerne sidder i en ring. Så begynder stammen med cyclo." : "Molekylet har ingen ring.";
        if (X.tri !== T.tri) {
            if (T.tri) return "Molekylet har en tripelbinding mellem to carbonatomer. Så ender navnet på -yn.";
            return T.dbl ? "Molekylet har en dobbeltbinding, ikke en tripelbinding. Så ender navnet på -en." : "Molekylet har ingen tripelbinding.";
        }
        if (X.dbl !== T.dbl) {
            if (T.dbl) return T.tri ? "Molekylet har ingen dobbeltbinding." : "Molekylet har en dobbeltbinding mellem to carbonatomer. Så ender navnet på -en.";
            return "Molekylet har ingen dobbeltbinding. Så ender stammen på -an.";
        }
        /* Stammen i elevens navn er kortere end den længste kaede (2-ethylbutan) */
        if (S.ok && S.n < T.n && !(T.COOH && S.n === T.n - 1) && !T.ring) return laengereKaede(T);
        if (X.n !== T.n) {
            if (T.COOH && X.n === T.n - 1) return "Husk carbonatomet i COOH. Det tæller med i stammen.";
            if (T.ring) return "Tæl carbonatomerne i ringen igen.";
            if (X.n < T.n) return laengereKaede(T);
            return "Den længste kæde har færre carbonatomer. Tæl hvert knæk og hver ende én gang.";
        }
        if (X.nC !== T.nC) return X.nC < T.nC ? "Molekylet har flere carbonatomer i sidegrupperne end dit navn." : "Molekylet har færre carbonatomer i sidegrupperne end dit navn.";
        var olForkert = p.endelse && p.endelse.type === "ol" && X.lokOH.join() !== T.lokOH.join();
        var tekstForkert = Se && Te && Se.loks && Te.loks && Se.loks.join() !== Te.loks.join();
        if (p.endelse && p.endelse.type === "ol" && (olForkert || tekstForkert)) return "Tæl igen, hvor OH-gruppen sidder. Nummerér fra den ende, der er nærmest den.";
        if (X.dobbelt.join() !== T.dobbelt.join() || X.tripel.join() !== T.tripel.join() || (p.umaettet && tekstForkert)) {
            return "Tæl igen, hvor " + (T.tri ? "tripelbindingen" : "dobbeltbindingen") + " begynder. Nummerér fra den ende, der er nærmest den.";
        }
        var Ts = T.subs.length, Xs = X.subs.length;
        if (Ts !== Xs) return Ts > Xs ? "Molekylet har flere sidegrupper end dit navn." : "Molekylet har færre sidegrupper end dit navn.";
        var navneT = T.subs.map(function (x) { return x.navn; }).sort().join(), navneX = X.subs.map(function (x) { return x.navn; }).sort().join();
        if (navneT !== navneX) return "Tæl carbonatomerne i sidegrupperne: ét er methyl, to er ethyl.";
        return "Sidegrupperne sidder et andet sted. Tjek numrene på dem.";
    };

    /* ----- Forklaringen paa det groenne kort ------------------------------------------------ */
    /* "sidegruppen", "bromatomerne", "OH-gruppen" */
    function forledEr(p) {
        var navne = p.forled.map(function (g) { return g.navn; });
        var flere = p.forled.length > 1 || antalIGruppe(p.forled[0]) > 1;
        if (p.forled.length > 1 && navne.some(function (x) { return x !== navne[0]; })) return "sidegrupperne";
        var g = p.forled[0];
        if (ALKYL_C[g.navn]) return flere ? "sidegrupperne" : "sidegruppen";
        if (g.navn === "hydroxy") return flere ? "OH-grupperne" : "OH-gruppen";
        return g.navn + (flere ? "atomerne" : "atomet");
    }

    K.forklaring = function (stof) {
        var p = stof.p, e = p.endelse, u = p.umaettet, dele = [];
        var stamme = p.cyclo ? "stammen " + p.stammeTekst + " er en ring med " + K.antalC(p.n)
            : "stammen " + stammeVist(p) + " er " + (p.n === 1 ? "ét carbonatom" : "kædens " + D.TAL[p.n] + " carbonatomer");
        dele.push(stamme);
        if (e && e.type === "ol") dele.push("endelsen " + K.medStreg(e.tekst) + " er " + (MULT[e.mult] > 1 ? "OH-grupperne" : "OH-gruppen") + (e.loks ? " på " + nummer(e.loks) : ""));
        else if (e) dele.push("endelsen " + K.medStreg(e.tekst) + " er " + (e.mult ? "COOH-grupperne" : "COOH-gruppen"));
        else if (u) dele.push("endelsen " + K.medStreg(u.tekst) + " er " + (u.type === "en" ? "dobbeltbindingen" : "tripelbindingen") + (u.loks ? " ved " + nummer(u.loks) : ""));
        if (p.forled.length) dele.push("forleddet " + p.forledTekst + " er " + forledEr(p));
        var t = K.stor(dele[0]);
        if (dele.length === 2) t += ", og " + dele[1];
        else if (dele.length === 3) t += ", " + dele[1] + ", og " + dele[2];
        return t + ".";
    };

    NK.Kemi = K;
}());

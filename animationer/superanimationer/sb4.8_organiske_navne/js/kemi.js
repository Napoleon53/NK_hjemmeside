/* =====================================================================
   kemi.js - kemien bag opgaverne. Intet her tegner eller roerer siden.

   Molekylerne bygges af molekylemotoren (../../molekylemotor/) ud fra
   navnet, og motoren giver ogsaa hovedkaeden, numrene og sidegrupperne.
   Denne fil finder de funktionelle grupper i et molekyle, deler navnet
   i dele og laver trinene, svarmulighederne, hintene og forklaringerne.

     K.grupper(mol)         de funktionelle grupper: [{ klasse, atomer, c }]
     K.stof(o)              et stof fra D.STOFFER med molekyle, kaede, dele
     K.trin(stof, aktive)   trinene paa fane 1 (Giv navnet)
     K.forklaring(stof)     forklaringen paa det groenne kort
     K.tegneHints(stof)     hintene paa fane 2 (Tegn molekylet)
     K.tegneFejl(stof, mol) det, der er galt med elevens tegning
     K.blandet(o)           et stof fra D.BLANDEDE (fane 3)
     K.gruppeFejl(g, valgt) forklaringen til en forkert stofklasse (fane 3)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    var KAEDEKLASSER = ["alkohol", "aldehyd", "keton", "carboxylsyre"];

    K.klasse = function (id) {
        for (var i = 0; i < D.KLASSER.length; i++) if (D.KLASSER[i].id === id) return D.KLASSER[i];
        return null;
    };

    K.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* "ét carbonatom", "to carbonatomer" */
    K.antalC = function (n) { return D.TAL[n] + (n === 1 ? " carbonatom" : " carbonatomer"); };

    /* Endelsen, som den staar paa en knap og i en tekst: altid med bindestreg */
    K.medStreg = function (e) { return e.charAt(0) === "-" ? e : "-" + e; };

    /* ----- De funktionelle grupper ----------------------------------------
       En gruppe er hele gruppen: en carboxylsyre er C, =O og OH tilsammen,
       ikke en keton og en alkohol. c er det carbonatom, gruppen sidder paa
       (for C=O-grupperne carbonatomet i gruppen). */
    K.grupper = function (mol) {
        var ud = [], brugt = {};
        function el(id) { return mol.atom(id).el; }
        function orden(a, b) { var bd = mol.binding(a, b); return bd ? bd.orden : 0; }

        mol.atomer.forEach(function (c) {
            if (c.el !== "C") return;
            var nb = mol.naboer(c.id);
            var dobO = nb.filter(function (x) { return el(x) === "O" && orden(c.id, x) === 2; });
            if (!dobO.length) return;
            var o2 = dobO[0];
            var enkO = nb.filter(function (x) { return el(x) === "O" && orden(c.id, x) === 1; });
            var kvael = nb.filter(function (x) { return el(x) === "N"; });
            var antalC = nb.filter(function (x) { return el(x) === "C"; }).length;
            brugt[o2] = true;
            if (enkO.length) {
                var o1 = enkO[0];
                brugt[o1] = true;
                var ester = mol.naboer(o1).length > 1;
                ud.push({ klasse: ester ? "ester" : "carboxylsyre", atomer: [c.id, o2, o1], c: c.id, o: o1 });
            } else if (kvael.length) {
                brugt[kvael[0]] = true;
                ud.push({ klasse: "amid", atomer: [c.id, o2, kvael[0]], c: c.id });
            } else {
                ud.push({ klasse: antalC <= 1 ? "aldehyd" : "keton", atomer: [c.id, o2], c: c.id });
            }
        });
        mol.atomer.forEach(function (a) {
            if (brugt[a.id]) return;
            var nb = mol.naboer(a.id);
            if (a.el === "O") {
                if (nb.length === 1 && orden(a.id, nb[0]) === 1) ud.push({ klasse: "alkohol", atomer: [a.id], c: nb[0] });
                else if (nb.length === 2) ud.push({ klasse: "ether", atomer: [a.id], c: nb[0] });
            } else if (a.el === "N") {
                ud.push({ klasse: "amin", atomer: [a.id], c: nb.length ? nb[0] : null });
            }
        });
        return ud;
    };

    /* ----- Et stof til fane 1 og 2 ------------------------------------------- */
    function tal(s) { var m = /(\d+)/.exec(s || ""); return m ? parseInt(m[1], 10) : null; }

    K.stof = function (o) {
        var laest = NK.NavnLaeser.laes(o.navn);
        var mol = laest.mol;
        if (o.vend) mol.atomer.forEach(function (a) { a.x = -a.x; });
        var res = NK.Navn.analyser(mol);
        var gr = K.grupper(mol);
        var s = {
            o: o, id: o.navn, navn: o.navn, klasse: o.k, niv: o.niv, mol: mol, res: res,
            motorNavn: res.navn, grupper: gr, gruppe: gr[0],
            antal: mol.atomer.length,
            antalC: mol.atomer.filter(function (a) { return a.el === "C"; }).length,
            kaede: res.kaede.slice(), n: res.kaede.length, sub: res.sub || []
        };
        var d = o.dele;
        if (o.k === "ester") {
            s.dele = [{ type: "alkohol", tekst: d[0] }, { type: "syre", tekst: d[1] }];
            s.syreC = D.OATER.indexOf(d[1]) + 1;
            s.alkylC = D.ALKYL.indexOf(d[0]) + 1;
            /* Syrens del: carbonatomet i C=O og kaeden paa dets anden side. Alkoholens
               del: det, der sidder paa det enkeltbundne oxygenatom. */
            var g = s.gruppe, alk = {}, syre = {};
            (function gaa(id, fra, maengde) {
                maengde[id] = true;
                mol.naboer(id).forEach(function (x) { if (x !== fra && !maengde[x] && mol.atom(x).el === "C") gaa(x, id, maengde); });
            }(mol.naboer(g.o).filter(function (x) { return x !== g.c; })[0], g.o, alk));
            (function gaa(id, maengde) {
                maengde[id] = true;
                mol.naboer(id).forEach(function (x) { if (!maengde[x] && mol.atom(x).el === "C") gaa(x, maengde); });
            }(g.c, syre));
            s.alkAtomer = alk;
            s.syreAtomer = syre;
        } else if (o.k === "amin") {
            s.dele = [{ type: "kaeder", tekst: d[0] }, { type: "endelse", tekst: d[1] }];
        } else {
            s.dele = [];
            if (d[0]) s.dele.push({ type: "forled", tekst: d[0] });
            s.dele.push({ type: "stamme", tekst: d[1] });
            s.dele.push({ type: "endelse", tekst: d[2] });
            s.forled = d[0];
            s.stamme = d[1];
            s.endelse = d[2];
            s.pos = tal(d[2]);                 /* gruppens nummer, hvis det staar i navnet */
            s.gpos = s.kaede.indexOf(s.gruppe.c) + 1;   /* gruppens nummer i kaeden */
            s.spos = d[0] ? tal(d[0]) : null;  /* sidegruppens nummer */
            s.medTal = /\d/.test(o.navn);
            /* Kaedens ender, der kan vaere nummer 1: motorens ende og, hvis numrene
               bliver de samme fra den anden side, ogsaa den anden */
            var n = s.n, andenOgsaa = (n + 1 - s.gpos === s.gpos) &&
                s.sub.every(function (x) { return n + 1 - x.lok === x.lok; });
            s.etter = {};
            s.etter[s.kaede[0]] = true;
            if (andenOgsaa) s.etter[s.kaede[n - 1]] = true;
        }
        return s;
    };

    /* Numrene langs kaeden, talt fra det carbonatom, eleven valgte som nummer 1 */
    K.lokanter = function (stof, fraId) {
        var k = stof.kaede.slice(), lok = {};
        if (fraId !== undefined && fraId === k[k.length - 1] && fraId !== k[0]) k.reverse();
        k.forEach(function (id, i) { lok[id] = i + 1; });
        return lok;
    };

    /* ----- Fane 1: trinene i et navn ---------------------------------------------
       Et trin: { slags: "valg" | "klik", del (den del af navnet, trinnet udfylder),
                  tekst, valg, rigtig, fejl(valgt), hint: [..], vis, om }
       vis: det, der faar sin farve i formlen, naar trinnet er klaret
            ("kaede", "numre", "gruppe", "side", "esterdele")
       om:  det i formlen, trinnets spoergsmaal handler om. Det er gult i
            formlen, mens trinnet staar paa kortet ("gruppe", "side",
            "alkohol", "syre", "kvaelstof", eller null: hele formlen)
       hintVis: det, et hint goer gult i formlen ("kaede", "etter") */
    var GRUPPEORD = { alkohol: "OH-gruppen", aldehyd: "C=O-gruppen", keton: "C=O-gruppen", carboxylsyre: "COOH-gruppen" };

    function klasseAfEndelse(e) {
        if (/syre$/.test(e)) return "carboxylsyre";
        if (/ol$/.test(e)) return "alkohol";
        if (/al$/.test(e)) return "aldehyd";
        if (/on$/.test(e)) return "keton";
        return null;
    }

    /* Endelsen for en stofklasse med samme nummer som stoffets egen endelse */
    function endelseFor(klasse, pos) {
        if (klasse === "alkohol") return pos ? "-" + pos + "-ol" : "ol";
        if (klasse === "keton") return pos ? "-" + pos + "-on" : "on";   /* pos er altid inde i kaeden, se endelseValg */
        if (klasse === "aldehyd") return "al";
        return "syre";
    }

    K.endelseValg = function (stof, aktive) {
        var egen = stof.klasse, pos = stof.pos, n = stof.n, liste = [];
        function med(e) { if (liste.indexOf(e) < 0) liste.push(e); }
        med(stof.endelse);
        /* Samme stofklasse med andre numre: talt fra den forkerte ende og naboen */
        /* En keton kan ikke have C=O paa en ende af kaeden: nummer 1 og n findes ikke */
        function findes(k, q) { return k !== "keton" || (q > 1 && q < n); }
        if (pos) {
            [n + 1 - pos, pos + 1, pos - 1].forEach(function (q) {
                if (q >= 1 && q <= n && q !== pos && findes(egen, q) && liste.length < 3) med(endelseFor(egen, q));
            });
        }
        function anden(k) {
            if (k === "keton" && pos && !findes(k, pos)) return n > 2 ? "-2-on" : "on";
            return endelseFor(k, pos);
        }
        /* De andre stofklasser, der er slaaet til */
        KAEDEKLASSER.forEach(function (k) {
            if (k !== egen && aktive.indexOf(k) >= 0) med(anden(k));
        });
        /* Altid mindst tre at vaelge imellem */
        KAEDEKLASSER.forEach(function (k) { if (liste.length < 3 && k !== egen) med(anden(k)); });
        liste.sort(function (a, b) {
            var ka = KAEDEKLASSER.indexOf(klasseAfEndelse(a)), kb = KAEDEKLASSER.indexOf(klasseAfEndelse(b));
            return ka !== kb ? ka - kb : (tal(a) || 0) - (tal(b) || 0);
        });
        return liste;
    };

    K.forledValg = function (stof) {
        var p = stof.spos, n = stof.n, navn = stof.forled.replace(/^\d+-/, ""), liste = [p];
        [n + 1 - p, p + 1, p - 1, p + 2, p - 2].forEach(function (q) {
            if (q >= 1 && q <= n && liste.indexOf(q) < 0 && liste.length < 3) liste.push(q);
        });
        liste.sort(function (a, b) { return a - b; });
        return liste.map(function (q) { return q + "-" + navn; });
    };

    function kaedeTrin(stof, aktive) {
        var k = stof.klasse, G = GRUPPEORD[k], n = stof.n, trin = [];
        var medC = k === "alkohol" ? "" : " Carbonatomet i " + (k === "carboxylsyre" ? "COOH" : "C=O") + " tæller med.";
        /* 1. Stammen */
        trin.push({
            slags: "valg", del: "stamme", vis: "kaede", om: null,
            tekst: k === "alkohol" ? "Tæl carbonatomerne i den længste kæde, som OH-gruppen sidder på. Hvad er stammen?"
                : "Tæl carbonatomerne i den længste kæde." + medC + " Hvad er stammen?",
            valg: D.STAMMER.slice(), rigtig: stof.stamme,
            fejl: function (v) {
                var m = D.STAMMER.indexOf(v) + 1;
                if (m === stof.antalC && stof.antalC !== n) return "Sidegruppen tæller ikke med i stammen. Tæl kun den længste kæde.";
                if (k !== "alkohol" && m === n - 1) return "Carbonatomet i " + (k === "carboxylsyre" ? "COOH" : "C=O") + " hører med til kæden. Tæl det med.";
                /* Enden med OH eller O talt med som et carbonatom */
                if (m === n + 1 && m !== stof.antalC) return "Et atom med bogstav er ikke et carbonatom. Tæl kun knæk og ender uden bogstaver.";
                return K.stor(v) + " er " + K.antalC(m) + ". Tæl hvert knæk og hver ende i den længste kæde.";
            },
            hint: ["Hvert knæk og hver ende i zigzagformlen er et carbonatom.",
                "Den længste kæde er gul i formlen. Tæl dens carbonatomer."],
            hintVis: [null, "kaede"]
        });
        /* 2. Nummereringen: kun naar der staar et tal i navnet */
        if (stof.medTal) {
            var fast = k === "aldehyd" || k === "carboxylsyre";
            trin.push({
                slags: "klik", del: null, vis: "numre",
                tekst: fast ? "Klik på carbonatom nummer 1 i formlen."
                    : "Klik på carbonatom nummer 1 i formlen. " + G + " skal have det laveste tal, den kan få.",
                ok: stof.etter,
                fejl: function (id) {
                    var a = stof.mol.atom(id), i = stof.kaede.indexOf(id);
                    if (a.el !== "C") return "Det er et " + (a.el === "O" ? "oxygenatom" : "nitrogenatom") + ". Kæden nummereres kun på carbonatomerne.";
                    if (i < 0) return "Det carbonatom er en sidegruppe. Nummer 1 er en ende af den længste kæde.";
                    if (i > 0 && i < n - 1) return "Nummer 1 er en af kædens to ender.";
                    if (k === "aldehyd") return "I et aldehyd er carbonatomet i C=O nummer 1.";
                    if (k === "carboxylsyre") return "I en carboxylsyre er carbonatomet i COOH nummer 1.";
                    if (n + 1 - stof.gpos === stof.gpos) return "Fra den ende får sidegruppen et højere tal. Prøv den anden ende.";
                    return "Fra den ende får " + G + " tallet " + (n + 1 - stof.gpos) + ". Fra den anden ende får den " + stof.gpos + ".";
                },
                hint: [k === "aldehyd" ? "I et aldehyd er carbonatomet i C=O altid nummer 1."
                    : (k === "carboxylsyre" ? "I en carboxylsyre er carbonatomet i COOH altid nummer 1."
                        : "Nummer 1 er en af kædens to ender. Vælg den ende, der er tættest på " + G + "."),
                    "Carbonatom nummer 1 har en gul ring i formlen."],
                hintVis: [null, "etter"]
            });
        }
        /* 3. Endelsen */
        var hvorTekst = stof.pos ? (k === "alkohol" ? " og nummeret på det carbonatom, OH-gruppen sidder på." : " og nummeret på carbonatomet i C=O.") : ".";
        trin.push({
            slags: "valg", del: "endelse", vis: "gruppe", om: "gruppe",
            tekst: "Vælg endelsen. Den viser stofklassen" + hvorTekst,
            valg: K.endelseValg(stof, aktive), rigtig: stof.endelse, somEndelse: true,
            fejl: function (v) {
                var kv = klasseAfEndelse(v), q = tal(v), kl = K.klasse(kv), egen = K.klasse(k);
                if (kv !== k) return "Endelsen " + K.medStreg(v).replace(/^-\d+-/, "-") + " hører til " + kl.ental + ". Molekylet har " + egen.har + ".";
                if (stof.pos && !q) return "Tallet mangler. Uden tal kan man ikke se, hvor " + G + " sidder.";
                if (q === n + 1 - stof.pos) return "Tallet " + q + " fås ved at tælle fra den forkerte ende. " + G + " sidder på nummer " + stof.pos + ".";
                return G + " sidder på carbonatom nummer " + stof.pos + ". Se numrene i formlen.";
            },
            hint: ["Alkoholer ender på -ol, aldehyder på -al, ketoner på -on og carboxylsyrer på -syre.",
                K.stor(K.klasse(k).har) + " er " + K.klasse(k).ental + "." + (stof.pos ? " " + G + " sidder på carbonatom nummer " + stof.pos + "." : "")],
            hintVis: [null, null]
        });
        /* 4. Forleddet: kun naar der er en sidegruppe */
        if (stof.forled) {
            trin.push({
                slags: "valg", del: "forled", vis: "side", om: "side",
                tekst: "Vælg forleddet. Det viser sidegruppen og nummeret på det carbonatom, den sidder på.",
                valg: K.forledValg(stof), rigtig: stof.forled,
                fejl: function (v) {
                    var q = tal(v);
                    if (q === n + 1 - stof.spos) return "Tallet " + q + " fås ved at tælle fra den forkerte ende. Sidegruppen sidder på nummer " + stof.spos + ".";
                    return "Sidegruppen sidder på carbonatom nummer " + stof.spos + ". Se numrene i formlen.";
                },
                hint: ["En sidegruppe med ét carbonatom hedder methyl. Tallet er det carbonatom, den sidder på.",
                    "Sidegruppen er gul i formlen. Den sidder på carbonatom nummer " + stof.spos + "."],
                hintVis: [null, null]
            });
        }
        return trin;
    }

    function esterTrin(stof) {
        var g = stof.gruppe, ok = {}, a = stof.alkylC, sy = stof.syreC;
        ok[g.c] = true;
        return [
            {
                slags: "klik", del: null, vis: "esterdele",
                tekst: "Klik på carbonatomet i estergruppen. Det har en dobbeltbinding til oxygen.",
                ok: ok,
                fejl: function (id) {
                    var at = stof.mol.atom(id);
                    if (at.el !== "C") return "Det er et oxygenatom. Klik på det carbonatom, der har dobbeltbindingen til oxygen.";
                    return "Det carbonatom har ingen dobbeltbinding til oxygen. Find C=O i formlen.";
                },
                hint: ["Estergruppen er −COO−: et carbonatom med =O og med et O i kæden.",
                    "Carbonatomet i estergruppen har en gul ring i formlen."],
                hintVis: [null, "etter"]
            },
            {
                slags: "valg", del: "alkohol", vis: "esterdele", om: "alkohol",
                tekst: "Den orange del sidder på det enkeltbundne oxygenatom og kommer fra alkoholen. Hvad hedder den?",
                valg: D.ALKYL.slice(), rigtig: stof.dele[0].tekst,
                fejl: function (v) {
                    var m = D.ALKYL.indexOf(v) + 1;
                    if (m === sy && m !== a) return "Det er syrens del, der har " + K.antalC(m) + ". Tæl kun carbonatomerne i den orange del.";
                    return K.stor(v) + " er " + K.antalC(m) + ". Tæl carbonatomerne i den orange del.";
                },
                hint: ["Ét carbonatom hedder methyl, to ethyl, tre propyl og fire butyl.",
                    "Den orange del har " + K.antalC(a) + "."],
                hintVis: [null, null]
            },
            {
                slags: "valg", del: "syre", vis: "esterdele", om: "syre",
                tekst: "Den grønne del har C=O og kommer fra syren. Carbonatomet i C=O tæller med. Hvad hedder den?",
                valg: D.OATER.slice(), rigtig: stof.dele[1].tekst,
                fejl: function (v) {
                    var m = D.OATER.indexOf(v) + 1;
                    if (m === a && m !== sy) return "Det er alkoholens del, der har " + K.antalC(m) + ". Tæl carbonatomerne i den grønne del.";
                    if (m === sy - 1) return "Carbonatomet i C=O hører med til syrens del. Tæl det med.";
                    return K.stor(v) + " er " + K.antalC(m) + ". Tæl carbonatomerne i den grønne del.";
                },
                hint: ["Syrens del hedder som syren, men ender på -oat: ethansyre giver ethanoat.",
                    "Den grønne del har " + K.antalC(sy) + ", når carbonatomet i C=O tælles med."],
                hintVis: [null, null]
            }
        ];
    }

    function aminTrin(stof) {
        var egen = stof.dele[0].tekst;
        return [{
            slags: "valg", del: "kaeder", vis: "gruppe", fyldOgsaa: "endelse", om: "kvaelstof",
            tekst: "Tæl carbonatomerne i hver kæde på nitrogenatomet. Hvad hedder kæderne?",
            valg: (stof.o.valg || [egen]).slice(), rigtig: egen,
            fejl: function (v) { return K.stor(v) + " er " + D.KAEDER[v] + ". Se på kæderne på nitrogenatomet igen."; },
            hint: ["Ét carbonatom hedder methyl, to ethyl, tre propyl og fire butyl. To ens kæder får di foran.",
                "Nitrogenatomet har " + D.KAEDER[egen] + "."],
            hintVis: [null, null]
        }];
    }

    K.trin = function (stof, aktive) {
        if (stof.klasse === "ester") return esterTrin(stof);
        if (stof.klasse === "amin") return aminTrin(stof);
        return kaedeTrin(stof, aktive || []);
    };

    /* ----- Forklaringen paa det groenne kort ---------------------------------------- */
    function endelseEr(stof) {
        var k = stof.klasse, paa = stof.pos ? " på nummer " + stof.pos : "";
        if (k === "alkohol") return "OH-gruppen" + paa;
        if (k === "aldehyd") return "C=O for enden af kæden";
        if (k === "keton") return stof.pos ? "C=O på nummer " + stof.pos : "C=O inde i kæden";
        return "COOH-gruppen";
    }

    K.forklaring = function (stof) {
        if (stof.klasse === "ester") {
            return K.stor(stof.dele[0].tekst) + " er alkoholens del med " + K.antalC(stof.alkylC) + ", og " +
                stof.dele[1].tekst + " er syrens del med " + K.antalC(stof.syreC) + ".";
        }
        if (stof.klasse === "amin") {
            return K.stor(stof.dele[0].tekst) + " er " + D.KAEDER[stof.dele[0].tekst] + " på nitrogenatomet, og endelsen -amin viser stofklassen.";
        }
        var n = stof.n, kaede = n === 1 ? "kædens ene carbonatom" : "kædens " + D.TAL[n] + " carbonatomer";
        var t = "Stammen " + stof.stamme + " er " + kaede;
        if (stof.forled) {
            return t + ", endelsen " + K.medStreg(stof.endelse) + " er " + endelseEr(stof) + ", og forleddet " + stof.forled +
                " er sidegruppen på nummer " + stof.spos + ".";
        }
        return t + ", og endelsen " + K.medStreg(stof.endelse) + " er " + endelseEr(stof) + ".";
    };

    /* ----- Fane 2: hintene og fejlen i en tegning ------------------------------------- */
    K.tegneHints = function (stof) {
        var k = stof.klasse, n = stof.n, h = [];
        if (k === "ester") {
            h.push("Tegn først syrens del: " + K.antalC(stof.syreC) + (stof.syreC > 1 ? " i træk" : "") + " med =O og −OH på det " + (stof.syreC > 1 ? "sidste" : "samme") + ".");
            h.push("Vælg Kæde, og klik på oxygenatomet i OH. Så vokser alkoholens del frem: " + K.antalC(stof.alkylC) + ".");
            return h;
        }
        if (k === "amin") {
            var d = stof.dele[0].tekst;
            h.push("Nitrogenatomet skal have " + D.KAEDER[d] + ". Tegn én kæde, og sæt −NH₂ på enden.");
            if (/^(di|tri|ethylmethyl)/.test(d)) h.push("Vælg Kæde, og klik på nitrogenatomet. Så vokser den næste kæde frem fra nitrogenatomet.");
            return h;
        }
        h.push(n === 1 ? "Stammen " + stof.stamme + " er ét carbonatom. Det står allerede på tavlen."
            : "Stammen " + stof.stamme + " er " + K.antalC(n) + " i træk. Tegn kæden først.");
        var paa = stof.pos ? " på carbonatom nummer " + stof.pos : "";
        if (k === "alkohol") h.push("Endelsen " + K.medStreg(stof.endelse) + " er en OH-gruppe" + paa + ". Vælg −OH, og klik på carbonatomet.");
        else if (k === "aldehyd") h.push("Endelsen -al er =O på et carbonatom for enden af kæden. Vælg =O, og klik på carbonatomet.");
        else if (k === "keton") h.push("Endelsen " + K.medStreg(stof.endelse) + " er =O" + (paa || " på et carbonatom inde i kæden") + ". Vælg =O, og klik på carbonatomet.");
        else h.push("Endelsen -syre er både =O og −OH på det samme carbonatom for enden af kæden.");
        if (stof.forled) h.push("Forleddet " + stof.forled + " er et ekstra carbonatom på nummer " + stof.spos + ". Vælg Kæde, og klik på carbonatomet.");
        return h;
    };

    /* Det, der er galt med tegningen. mol har lige saa mange atomer som stoffet. */
    K.tegneFejl = function (stof, mol) {
        if (mol.fragmenter().length > 1) return "Tegningen skal være ét molekyle. Tryk Ryd tavlen, og begynd forfra.";
        var res = NK.Navn.analyser(mol), k = stof.klasse, egen = K.klasse(k);
        if (!res || !res.navn) return "Den tegning kan ikke få et navn. Tryk Ryd tavlen, og tegn kæden først.";
        var du = "Du har tegnet " + res.navn + ". ";
        var gr = K.grupper(mol);
        if (!gr.length) return du + "Molekylet mangler " + egen.har + ".";
        if (gr.length !== 1 || gr[0].klasse !== k) {
            if (k === "ester") return du + "En ester har =O og et O i kæden på samme carbonatom.";
            if (k === "amin") return du + "En amin har et nitrogenatom med carbonkæder på.";
            return du + "Endelsen " + K.medStreg(stof.endelse).replace(/^-\d+-/, "-") + " betyder " + egen.har + ".";
        }
        if (k === "ester") return du + K.stor(stof.dele[0].tekst) + " er alkoholens del, og " + stof.dele[1].tekst + " er syrens del med C=O.";
        if (k === "amin") return du + "Nitrogenatomet skal have " + D.KAEDER[stof.dele[0].tekst] + ".";
        if (res.kaede.length !== stof.n) return du + "Stammen " + stof.stamme + " betyder " + K.antalC(stof.n) + " i den længste kæde.";
        var gpos = res.kaede.indexOf(gr[0].c) + 1;
        if (gpos !== stof.gpos && stof.pos) return du + "Tallet " + stof.pos + " betyder, at " + GRUPPEORD[k] + " sidder på carbonatom nummer " + stof.pos + ".";
        if (stof.forled) return du + "Forleddet " + stof.forled + " betyder et ekstra carbonatom på nummer " + stof.spos + ".";
        return du + "Kæden må ikke have sidegrupper: " + stof.navn + " har intet forled.";
    };

    /* ----- Fane 3: et stof med flere grupper -------------------------------------------- */
    K.blandet = function (o) {
        var laest = NK.NavnLaeser.laes(o.sys);
        var mol = laest.mol, res = NK.Navn.analyser(mol);
        var gr = K.grupper(mol), klasser = [];
        gr.forEach(function (g) { if (klasser.indexOf(g.klasse) < 0) klasser.push(g.klasse); });
        klasser.sort(function (a, b) {
            var ids = D.KLASSER.map(function (x) { return x.id; });
            return ids.indexOf(a) - ids.indexOf(b);
        });
        return { o: o, id: o.navn, navn: o.navn, sys: res.navn, niv: o.niv, info: o.info, mol: mol, res: res, grupper: gr, klasser: klasser };
    };

    /* "en alkohol og en carboxylsyre", "en alkohol", "en alkohol, en keton og en ester" */
    K.klasserTekst = function (klasser) {
        var ord = klasser.map(function (k) { return K.klasse(k).ental; });
        if (ord.length === 1) return ord[0];
        return ord.slice(0, -1).join(", ") + " og " + ord[ord.length - 1];
    };

    K.blandetForklaring = function (b) {
        var t;
        if (b.klasser.length === 1) {
            t = K.stor(b.navn) + " har " + D.TAL[b.grupper.length] + " " + (b.klasser[0] === "alkohol" ? "OH-grupper" : "ens grupper") + " og er " + K.klasse(b.klasser[0]).ental + ".";
        } else {
            t = K.stor(b.navn) + " er " + (b.klasser.length === 2 ? "både " : "") + K.klasserTekst(b.klasser) + ".";
        }
        if (b.sys !== b.navn) t += " Det systematiske navn er " + b.sys + ".";
        return t;
    };

    /* Forklaringen til en forkert stofklasse for gruppen g */
    K.gruppeFejl = function (b, g, valgt) {
        var mol = b.mol, rigtig = g.klasse, v = K.klasse(valgt);
        if (rigtig === "carboxylsyre" && (valgt === "keton" || valgt === "aldehyd" || valgt === "alkohol")) {
            return "C=O og OH sidder på det samme carbonatom. Sammen er de én gruppe, og den er ikke " + v.ental + ".";
        }
        if (rigtig === "ester" && (valgt === "keton" || valgt === "aldehyd" || valgt === "carboxylsyre")) {
            return valgt === "carboxylsyre" ? "Der sidder intet H på oxygenatomet. Oxygenatomet er bundet til carbon på begge sider."
                : "Carbonatomet med C=O har også et O i kæden. Sammen er de én gruppe.";
        }
        if (rigtig === "keton" && valgt === "aldehyd") return "C=O sidder inde i kæden med et carbonatom på hver side. I et aldehyd sidder C=O for enden.";
        if (rigtig === "aldehyd" && valgt === "keton") return "C=O sidder for enden af kæden. I en keton sidder C=O inde i kæden.";
        if (rigtig === "alkohol" && valgt === "carboxylsyre") return "OH-gruppens carbonatom har ingen dobbeltbinding til oxygen. Så er gruppen ikke en carboxylgruppe.";
        if (rigtig === "amin") return "Gruppen har et nitrogenatom. " + v.navn + " har " + v.har + ".";
        var har = mol.atom(g.atomer[g.atomer.length - 1]).el === "N" ? "et nitrogenatom" : K.klasse(rigtig).har;
        return K.stor(v.ental) + " har " + v.har + ". Den markerede gruppe har " + har + ".";
    };

    NK.Kemi = K;
}());

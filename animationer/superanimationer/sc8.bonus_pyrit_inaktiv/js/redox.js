/* =====================================================================
   redox.js - modellen: oxidationstal, klammerne og afstemningen

   Samme fremgangsmaade som i sc8.5 (klammer under skemaet), men
   bredere: et stof kan have flere maerkede atomer, en reaktion kan
   have flere end to klammer, en klamme kan ende i et stof, der ogsaa
   faar atomer andre steder fra (fri), og et stof kan foelge med uden
   at skifte (Fe²⁺ fra pyrit, ZnO).

     1. oxidationstallet over de atomer, der skifter
     2. klammen faar stigningen (↑) eller faldet (↓) for ét atom
     3. staar grundstoffet ikke lige mange gange paa begge sider af en
        klamme, saettes nu et tal foran (FeS₂ ⟶ 2 SO₄²⁻)
     4. gangetallene: gangetal · atomer paa klammen · aendring pr. atom
        skal give det samme for stigning og fald, mindste tal. Klammer
        fra samme stof faar samme gangetal.
     5. stoffer, der foelger med, faar deres tal ved at taelle atomer
     6. ladningen, H⁺, H-atomerne og vand. O er kontrollen til sidst.

   NK.Redox.reaktion(def) regner alt ud af en opgave i D.OPGAVER.
   Hjaelpeteksterne til elevens fejl bygges ogsaa her.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var FAST = { O: -2, H: 1 };
    var MINUS = "−";

    /* ----- Tal og romertal ------------------------------------------------ */
    function romer(n) {
        var tal = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]], s = "";
        tal.forEach(function (t) { while (n >= t[0]) { s += t[1]; n -= t[0]; } });
        return s;
    }

    /* +VI, −II, 0: saadan staar oxidationstallet over atomet og i svaret */
    function ox(n) {
        if (n === 0) return "0";
        return (n > 0 ? "+" : MINUS) + romer(Math.abs(n));
    }

    /* +9, −8, 0 */
    function lad(q) { return NK.fortegn(q); }

    /* (+2), (−2), 0: almindelige tal til mellemregningerne */
    function talP(q) { return q === 0 ? "0" : "(" + lad(q) + ")"; }

    var ROMER = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };

    /* Det, eleven skriver som oxidationstal: +VI, VI, +6, 6, −II, -2, 0.
       Tomt giver null, noget ulaeseligt NaN. */
    function laesOx(s) {
        var t = NK.ascii(s).replace(/\s+/g, "").toUpperCase();
        if (!t) return null;
        var fortegn = 1;
        if (t[0] === "+") t = t.slice(1);
        else if (t[0] === "-") { fortegn = -1; t = t.slice(1); }
        if (t === "0") return 0;
        if (Object.prototype.hasOwnProperty.call(ROMER, t)) return fortegn * ROMER[t];
        if (/^\d{1,2}$/.test(t)) return fortegn * parseInt(t, 10);
        return NaN;
    }

    /* Et helt tal med eller uden fortegn. Tomt giver null. */
    function laesTal(s) {
        var t = NK.ascii(s).replace(/\s+/g, "");
        if (!t) return null;
        if (!/^[+-]?\d{1,3}$/.test(t)) return NaN;
        return parseInt(t, 10);
    }

    /* ----- Et stof ------------------------------------------------------------
       dele er formlen, som den skrives: atomer, parenteser og prikken i
       FeO·Fe₂O₃. Hvert atom kender sit antal i hele formlen og sit
       oxidationstal. */
    var cache = {};

    function stof(f) {
        if (cache[f]) return cache[f];
        var to = f.split(" "), formel = to[0], q = 0;
        if (to[1]) {
            var m = /^(\d*)([+-])$/.exec(to[1]);
            q = (m[1] ? parseInt(m[1], 10) : 1) * (m[2] === "+" ? 1 : -1);
        }
        var dele = [], re = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)|(·)/g, x;
        while ((x = re.exec(formel))) {
            if (x[1]) dele.push({ t: "atom", s: x[1], n: x[2] ? parseInt(x[2], 10) : 1 });
            else if (x[3]) dele.push({ t: "aaben" });
            else if (x[4]) dele.push({ t: "luk", n: x[5] ? parseInt(x[5], 10) : 1 });
            else dele.push({ t: "prik" });
        }
        /* Antallet af hvert atom: tallet efter atomet gange tallet efter parentesen */
        var stak = [1];
        dele.forEach(function (d, i) {
            if (d.t === "aaben") {
                var dybde = 1, j = i;
                while (dybde && ++j < dele.length) {
                    if (dele[j].t === "aaben") dybde++;
                    if (dele[j].t === "luk") dybde--;
                }
                stak.push(stak[stak.length - 1] * (dele[j] ? dele[j].n : 1));
            } else if (d.t === "luk") stak.pop();
            else if (d.t === "atom") d.antal = d.n * stak[stak.length - 1];
        });
        var atomer = dele.filter(function (d) { return d.t === "atom"; });
        var el = {};
        atomer.forEach(function (a) { el[a.s] = (el[a.s] || 0) + a.antal; });
        var navne = Object.keys(el);

        /* Oxidationstallene */
        var saer = D.OX[formel] || {}, nr = {}, sum = 0, ukendt = null;
        if (navne.length === 1 && saer[navne[0]] === undefined) {
            atomer.forEach(function (a) { a.ox = q / el[a.s]; });
        } else {
            atomer.forEach(function (a) {
                var v = saer[a.s];
                nr[a.s] = (nr[a.s] || 0) + 1;
                if (v instanceof Array) v = v[nr[a.s] - 1];
                if (v === undefined && Object.prototype.hasOwnProperty.call(FAST, a.s)) v = FAST[a.s];
                if (v === undefined) { ukendt = a.s; return; }
                a.ox = v;
                sum += v * a.antal;
            });
            if (ukendt) atomer.forEach(function (a) { if (a.s === ukendt) a.ox = (q - sum) / el[ukendt]; });
        }
        var oxtal = {};
        atomer.forEach(function (a) { if (oxtal[a.s] === undefined) oxtal[a.s] = a.ox; });

        var tekst = dele.map(function (d) {
            if (d.t === "atom") return d.s + (d.n > 1 ? NK.saenket(d.n) : "");
            if (d.t === "aaben") return "(";
            if (d.t === "luk") return ")" + (d.n > 1 ? NK.saenket(d.n) : "");
            return "·";
        }).join("") + NK.ladningHaevet(q);

        cache[f] = {
            f: f, formel: formel, q: q, dele: dele, atomer: atomer, el: el, ox: oxtal,
            slags: navne.length > 1 ? "sammensat" : (q === 0 ? "grundstof" : "ion"),
            tekst: tekst
        };
        return cache[f];
    }

    var H_ION = stof("H +"), VAND = stof("H2O");

    function gcd(a, b) { return NK.gcd(a, b); }

    /* ----- En reaktion ----------------------------------------------------------- */
    function reaktion(def) {
        var led = [];
        def.v.forEach(function (f) { led.push({ st: stof(f), side: "v", nr: led.length }); });
        def.h.forEach(function (f) { led.push({ st: stof(f), side: "h", nr: led.length }); });

        /* Klammerne: fra et atom foer pilen til det samme grundstof efter */
        var K = (def.klammer || []).map(function (k, nr) {
            var A = led[k.fra].st, B = led[k.til].st, E = k.E;
            var nV = A.el[E], nH = B.el[E], g = gcd(nV, nH);
            var o = {
                nr: nr, E: E, v: k.fra, h: k.til, fra: A.ox[E], til: B.ox[E], fri: !!k.fri, nV: nV, nH: nH,
                pv: k.fri ? 1 : nH / g,      /* tallene fra forafstemningen */
                ph: k.fri ? 0 : nV / g
            };
            o.op = o.til > o.fra;
            o.type = o.op ? "ox" : "red";
            o.delta = Math.abs(o.til - o.fra);
            o.antal = o.pv * nV;             /* atomer paa klammen */
            o.tot = o.antal * o.delta;       /* stigningen eller faldet paa klammen */
            return o;
        });

        /* Klammer fra samme stof hoerer sammen og faar samme gangetal.
           Gangetallene: stigning i alt = fald i alt, mindste tal. */
        var grupper = [], iGruppe = {};
        K.forEach(function (k) {
            if (iGruppe[k.v] === undefined) { iGruppe[k.v] = grupper.length; grupper.push({ led: k.v, K: [], netto: 0, gange: 1 }); }
            var G = grupper[iGruppe[k.v]];
            G.K.push(k);
            G.netto += (k.op ? 1 : -1) * k.tot;
        });
        var op = grupper.filter(function (G) { return G.netto > 0; })[0];
        var ned = grupper.filter(function (G) { return G.netto < 0; })[0];
        if (op && ned) {
            var d = gcd(op.netto, -ned.netto);
            op.gange = -ned.netto / d;
            ned.gange = op.netto / d;
        }
        K.forEach(function (k) { k.gange = grupper[iGruppe[k.v]].gange; });

        /* Tallene foran: gangetallet gange tallet fra forafstemningen */
        var koef = led.map(function () { return 1; });
        K.forEach(function (k) {
            koef[k.v] = k.gange * k.pv;
            if (!k.fri) koef[k.h] = k.gange * k.ph;
        });
        /* Det, der foelger med: tael grundstoffet paa den anden side */
        var med = (def.med || []).map(function (m) {
            var side = led[m.led].side, n = 0;
            led.forEach(function (l, i) { if (l.side !== side) n += koef[i] * (l.st.el[m.E] || 0); });
            koef[m.led] = n / led[m.led].st.el[m.E];
            return { led: m.led, E: m.E, antal: n, koef: koef[m.led] };
        });

        /* De atomer, der faar et tal over sig: felt (eleven skriver) eller
           givet (staar med blyant). Raekkefoelgen er formlens. */
        var maerker = led.map(function () { return {}; });
        function maerk(liste, slags) {
            (liste || []).forEach(function (s) {
                var to = s.split(":");
                maerker[+to[0]][to[1]] = slags;
            });
        }
        K.forEach(function (k) { maerker[k.v][k.E] = "felt"; maerker[k.h][k.E] = "felt"; });
        maerk(def.ekstraOx, "felt");
        maerk(def.givet, "givet");

        var elektroner = 0;
        K.forEach(function (k) { if (k.op) elektroner += k.gange * k.tot; });

        var R = {
            def: def, id: def.id, miljoe: def.miljoe || null,
            led: led, K: K, grupper: grupper, koef: koef, med: med, maerker: maerker,
            elektroner: elektroner,
            forafstem: K.some(function (k) { return !k.fri && (k.pv > 1 || k.ph > 1); })
        };
        R.ionSt = H_ION;
        R.vandSt = VAND;

        R.ladning = ladninger(R, koef);
        var dq = R.ladning.v - R.ladning.h;
        R.ion = { side: null, antal: 0 };
        /* H⁺ paa den side, der har lavest ladning */
        if (R.miljoe === "surt" && dq) R.ion = { side: dq < 0 ? "v" : "h", antal: Math.abs(dq) };

        /* Vandet afstemmer H (hvert H₂O har 2 H), og O er kontrollen bagefter */
        R.foer = taelling(R, koef, R.ion, null);
        var dH = (R.foer.v.H || 0) - (R.foer.h.H || 0);
        R.vand = { side: null, antal: 0 };
        if (R.miljoe && dH) R.vand = { side: dH < 0 ? "v" : "h", antal: Math.abs(dH) / 2 };
        R.slut = taelling(R, koef, R.ion, R.vand);
        return R;
    }

    /* Ladningen paa hver side med koefficienterne k (og evt. H⁺) */
    function ladninger(R, k, ion) {
        var q = { v: 0, h: 0 };
        R.led.forEach(function (l, i) { q[l.side] += k[i] * l.st.q; });
        if (ion && ion.side) q[ion.side] += ion.antal * R.ionSt.q;
        return q;
    }

    /* Antal af hvert grundstof paa hver side */
    function taelling(R, k, ion, vand) {
        var t = { v: {}, h: {} };
        function laeg(side, st, n) {
            if (!n) return;
            Object.keys(st.el).forEach(function (s) { t[side][s] = (t[side][s] || 0) + n * st.el[s]; });
        }
        R.led.forEach(function (l, i) { laeg(l.side, l.st, k[i]); });
        if (ion && ion.side) laeg(ion.side, R.ionSt, ion.antal);
        if (vand && vand.side) laeg(vand.side, VAND, vand.antal);
        return t;
    }

    /* Det faerdige skema som led: { v: [{ f, n }], h: [...] } */
    function termer(R) {
        var s = { v: [], h: [] };
        R.led.forEach(function (l, i) { s[l.side].push({ f: l.st.f, n: R.koef[i] }); });
        if (R.ion.side) s[R.ion.side].push({ f: R.ionSt.f, n: R.ion.antal });
        if (R.vand.side) s[R.vand.side].push({ f: VAND.f, n: R.vand.antal });
        return s;
    }

    function ledTekst(liste) {
        return liste.map(function (x) { return (x.n === 1 ? "" : x.n + " ") + stof(x.f).tekst; }).join(" + ");
    }

    /* 2 FeS₂ + 7 O₂ + 2 H₂O ⟶ 2 Fe²⁺ + 4 SO₄²⁻ + 4 H⁺ */
    function termTekst(s) { return ledTekst(s.v) + " ⟶ " + ledTekst(s.h); }
    function skemaTekst(R) { return termTekst(termer(R)); }

    /* Et skema ganget igennem med n */
    function ganget(s, n) {
        function side(l) { return l.map(function (x) { return { f: x.f, n: x.n * n }; }); }
        return { v: side(s.v), h: side(s.h) };
    }

    /* Flere skemaer lagt sammen. Det, der staar paa begge sider, gaar ud.
       raekke: { v: [...], h: [...] } er den raekkefoelge, stofferne skal
       staa i (ellers som de kommer). */
    function sum(skemaer, raekke) {
        var antal = { v: {}, h: {} }, orden = { v: [], h: [] };
        skemaer.forEach(function (s) {
            ["v", "h"].forEach(function (side) {
                s[side].forEach(function (x) {
                    if (antal[side][x.f] === undefined) { antal[side][x.f] = 0; orden[side].push(x.f); }
                    antal[side][x.f] += x.n;
                });
            });
        });
        var ud = { v: [], h: [], vaek: [] };
        orden.v.forEach(function (f) {
            var fael = Math.min(antal.v[f], antal.h[f] || 0);
            if (!fael) return;
            antal.v[f] -= fael;
            antal.h[f] -= fael;
            ud.vaek.push({ f: f, n: fael });
        });
        ["v", "h"].forEach(function (side) {
            var liste = orden[side].filter(function (f) { return antal[side][f] > 0; });
            if (raekke && raekke[side]) {
                liste.sort(function (a, b) {
                    var ia = raekke[side].indexOf(a), ib = raekke[side].indexOf(b);
                    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
                });
            }
            ud[side] = liste.map(function (f) { return { f: f, n: antal[side][f] }; });
        });
        return ud;
    }

    /* ----- Hjaelp til oxidationstallene ------------------------------------------- */
    function andre(st, E) {
        return Object.keys(st.el).filter(function (s) { return s !== E; });
    }

    function sumTekst(st) {
        return st.q === 0 ? "0" : "ionens ladning, " + lad(st.q);
    }

    /* Opstillingen med almindelige tal: S + 4 · (−2) = −2 */
    function oxOpstilling(st, E) {
        var n = st.el[E], dele = [];
        var mig = (n > 1 ? n + " · " : "") + E, sat = false;
        Object.keys(st.el).forEach(function (s) {
            if (s === E) { dele.push(mig); sat = true; return; }
            dele.push((st.el[s] > 1 ? st.el[s] + " · " : "") + talP(st.ox[s]));
        });
        if (!sat) dele.push(mig);
        return dele.join(" + ") + " = " + lad(st.q);
    }

    /* Reglen for atomet E i stoffet: det foerste hint */
    function oxHint(st, E) {
        if (st.slags === "grundstof") return st.tekst + " står alene uden ladning. Et grundstof har oxidationstallet 0.";
        if (st.slags === "ion") return st.tekst + " er en ion af ét atom. Oxidationstallet er ionens ladning.";
        var regel = (D.REGEL[st.formel] || {})[E];
        if (regel) return regel;
        if (E === "O") return "O er −II i næsten alle forbindelser, også i " + st.tekst + ".";
        if (E === "H") return "H er +I, når det sidder sammen med ikke-metaller.";
        var kendte = andre(st, E).map(function (s) { return s + " " + ox(st.ox[s]); }).join(" og ");
        return "I " + st.tekst + " er " + kendte + ". Summen af oxidationstallene skal være " + sumTekst(st) + ".";
    }

    /* Det andet hint: regnestykket uden resultat */
    function oxHint2(st, E) {
        if (st.slags !== "sammensat") return oxHint(st, E);
        if (E === "O" || E === "H") return oxHint(st, E);
        return oxOpstilling(st, E) + ". Hvad skal " + E + " være?";
    }

    /* Svaret med regnestykket: S + 4 · (−2) = −2, så S er +VI */
    function oxBeregning(st, E) {
        if (st.slags === "grundstof") return st.tekst + " er et grundstof, så " + E + " er 0.";
        if (st.slags === "ion") return st.tekst + " er en ion af ét atom, så " + E + " er " + ox(st.ox[E]) + ".";
        if ((D.SVAR[st.formel] || {})[E]) return D.SVAR[st.formel][E];
        if ((E === "O" || E === "H") && !(D.OX[st.formel] || {})[E]) return E + " er " + ox(st.ox[E]) + " i " + st.tekst + ".";
        return oxOpstilling(st, E) + ", så " + E + " er " + ox(st.ox[E]) + ".";
    }

    /* Hvad gik galt, naar eleven skrev v over atomet E? rigtig kan gives
       med, naar formlen har flere af samme grundstof (magnetit). */
    function oxFejl(st, E, v, rigtig) {
        if (rigtig === undefined) rigtig = st.ox[E];
        if (v === null || isNaN(v)) return "Skriv et oxidationstal, fx +VI, −II eller 0.";
        var saer = D.FEJL[st.formel + "|" + E + "|" + v];
        if (saer) return saer;
        if (st.slags === "grundstof") return st.tekst + " er et grundstof. Oxidationstallet er 0.";
        if (st.slags === "ion") {
            if (v === -rigtig) return "Tjek fortegnet. " + st.tekst + " har ladningen " + lad(st.q) + ".";
            return st.tekst + " er en ion af ét atom. Oxidationstallet er ionens ladning.";
        }
        if (v === -rigtig) return "Tjek fortegnet. " + oxHint(st, E);
        var n = st.el[E], sumAndre = 0;
        andre(st, E).forEach(function (s) { sumAndre += st.ox[s] * st.el[s]; });
        if (st.q !== 0 && v * n === -sumAndre) return "Du har glemt ionens ladning. Summen skal være " + lad(st.q) + ", ikke 0.";
        if (n > 1 && v === st.q - sumAndre) return "Der er " + n + " " + E + " i " + st.tekst + ". Del summen mellem dem.";
        if (st.q !== 0 && v === st.q) return "Ladningen " + lad(st.q) + " gælder hele " + st.tekst + ", ikke kun " + E + ".";
        return oxHint(st, E);
    }

    /* ----- Hjaelp til klammerne: stigning og fald ------------------------------------ */
    /* "S går fra −I til +VI" */
    function gaarTekst(K) {
        return K.E + " går fra " + ox(K.fra) + " til " + ox(K.til);
    }

    /* Fejlen i en klamme: retning (true = op) og tallet n. Ved klammen
       staar stigningen eller faldet for ÉT atom, som man goer i Danmark
       (brugerens oenske 5. okt. 2026); antallet af atomer kommer foerst
       med ved gangetallene. Tom tekst = rigtigt. */
    function klammeFejl(K, op, n) {
        if (op === null) return "Klik på pilen ved " + K.E + ", så den peger op eller ned.";
        if (n === null || isNaN(n)) return "Skriv, hvor meget ét " + K.E + " stiger eller falder, i feltet ved pilen.";
        n = Math.abs(n);
        if (op !== K.op) {
            return gaarTekst(K) + ". Tallet bliver " + (K.op ? "større" : "mindre") + ", så pilen skal pege " + (K.op ? "op" : "ned") + ".";
        }
        if (n === K.delta) return "";
        if (K.nV > 1 && n === K.delta * K.nV) {
            return "Det er for " + K.nV + " " + K.E + " tilsammen. Ved klammen står kun, hvor meget ét " + K.E + " " + (K.op ? "stiger" : "falder") + ".";
        }
        if (n === Math.abs(K.fra) + Math.abs(K.til) && K.fra * K.til > 0) {
            return "Du har lagt tallene sammen. Hvor mange trin er der fra " + ox(K.fra) + " til " + ox(K.til) + "?";
        }
        if (n === Math.abs(K.til) || n === Math.abs(K.fra)) {
            return "Det er et oxidationstal. Skriv forskellen fra " + ox(K.fra) + " til " + ox(K.til) + ".";
        }
        return gaarTekst(K) + ". Tæl trinene.";
    }

    /* ----- Mellemregninger til ladning og H ------------------------------------------- */
    /* 2 · (+2) + 4 · (−2) */
    function ladBeregning(R, side) {
        var dele = [];
        R.led.forEach(function (l, i) {
            if (l.side === side) dele.push((R.koef[i] === 1 ? "" : R.koef[i] + " · ") + talP(l.st.q));
        });
        return dele.join(" + ");
    }

    /* 4 · 3 + 8 · 1 */
    function brintBeregning(R, side) {
        var dele = [];
        R.led.forEach(function (l, i) {
            var n = l.st.el.H || 0;
            if (l.side === side && n) dele.push((R.koef[i] === 1 ? "" : R.koef[i] + " · ") + n);
        });
        if (R.ion.side === side) dele.push(R.ion.antal + " · 1");
        return dele.join(" + ") || "0";
    }

    NK.Redox = {
        stof: stof,
        reaktion: reaktion,
        ladninger: ladninger,
        taelling: taelling,
        termer: termer,
        termTekst: termTekst,
        ledTekst: ledTekst,
        skemaTekst: skemaTekst,
        ganget: ganget,
        sum: sum,
        romer: romer,
        ox: ox,
        lad: lad,
        talP: talP,
        laesOx: laesOx,
        laesTal: laesTal,
        oxOpstilling: oxOpstilling,
        oxHint: oxHint,
        oxHint2: oxHint2,
        oxBeregning: oxBeregning,
        oxFejl: oxFejl,
        gaarTekst: gaarTekst,
        klammeFejl: klammeFejl,
        ladBeregning: ladBeregning,
        brintBeregning: brintBeregning,
        H_ION: H_ION,
        VAND: VAND
    };
}());

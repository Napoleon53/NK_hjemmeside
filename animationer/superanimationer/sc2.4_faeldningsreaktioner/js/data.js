/* =====================================================================
   data.js - ionerne, faeldningstabellen og opgaverne

   Alt, der har med kemien at goere, staar her. Resten af animationen
   regner ud fra disse tabeller: formler, reaktionsskemaer, hvilke par
   der falder ud, hvor mange ioner der er i glassene og de forkerte
   svarmuligheder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};
    NK.Data = D;

    /* ----- Ionerne ---------------------------------------------------- */
    /* navn:     den del, der bruges i saltets navn (sølvnitrat).
       variabel: metallet kan have flere ladninger. anden er den
                 ladning, eleverne typisk forveksler med.
       brud:     den ion, eleven faar, hvis en sammensat ion deles
                 forkert (SO₄²⁻ bliver til S²⁻). */
    D.IONER = [
        { id: "Na",  formel: "Na",  q: 1,  navn: "natrium" },
        { id: "K",   formel: "K",   q: 1,  navn: "kalium" },
        { id: "NH4", formel: "NH₄", q: 1,  navn: "ammonium", sammensat: true, brud: ["H", 1] },
        { id: "Mg",  formel: "Mg",  q: 2,  navn: "magnesium" },
        { id: "Ca",  formel: "Ca",  q: 2,  navn: "calcium" },
        { id: "Ba",  formel: "Ba",  q: 2,  navn: "barium" },
        { id: "Al",  formel: "Al",  q: 3,  navn: "aluminium" },
        { id: "Fe2", formel: "Fe",  q: 2,  navn: "jern(II)", grund: "jern", variabel: true, anden: 3 },
        { id: "Fe3", formel: "Fe",  q: 3,  navn: "jern(III)", grund: "jern", variabel: true, anden: 2 },
        { id: "Cu",  formel: "Cu",  q: 2,  navn: "kobber(II)", grund: "kobber", variabel: true, anden: 1 },
        { id: "Ag",  formel: "Ag",  q: 1,  navn: "sølv" },
        { id: "Pb",  formel: "Pb",  q: 2,  navn: "bly(II)", grund: "bly", variabel: true, anden: 4 },

        { id: "NO3", formel: "NO₃", q: -1, navn: "nitrat", sammensat: true, brud: ["O", -2] },
        { id: "Cl",  formel: "Cl",  q: -1, navn: "chlorid" },
        { id: "Br",  formel: "Br",  q: -1, navn: "bromid" },
        { id: "I",   formel: "I",   q: -1, navn: "iodid" },
        { id: "OH",  formel: "OH",  q: -1, navn: "hydroxid", sammensat: true, brud: ["O", -2] },
        { id: "SO4", formel: "SO₄", q: -2, navn: "sulfat", sammensat: true, brud: ["S", -2] },
        { id: "CO3", formel: "CO₃", q: -2, navn: "carbonat", sammensat: true, brud: ["O", -2] },
        { id: "PO4", formel: "PO₄", q: -3, navn: "phosphat", sammensat: true, brud: ["P", -3] }
    ];

    var efterId = {};
    D.IONER.forEach(function (ion) { efterId[ion.id] = ion; });
    D.ion = function (id) { return efterId[id] || null; };

    /* Raekkefoelgen i faeldningstabellen. */
    D.KAT_ORDEN = ["Na", "K", "NH4", "Mg", "Ca", "Ba", "Al", "Fe2", "Fe3", "Cu", "Ag", "Pb"];
    D.AN_ORDEN = ["NO3", "Cl", "Br", "I", "OH", "SO4", "CO3", "PO4"];

    /* Saenkede tal til almindelige: "PO₄" -> "PO4". */
    var CIFFER = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
    D.ascii = function (s) {
        return String(s).replace(/[₀-₉]/g, function (c) { return CIFFER[c]; });
    };

    /* SO₄²⁻ */
    D.ionTekst = function (ion) { return ion.formel + NK.ladningHaevet(ion.q); };

    /* Hvilke atomer er ionen lavet af? Laeses ud af formlen:
       "NH₄" -> [["N", 1], ["H", 4]] */
    D.sammensaetning = function (ion) {
        if (ion._atomer) return ion._atomer;
        var ud = [], re = /([A-Z][a-z]?)(\d*)/g, m, s = D.ascii(ion.formel);
        while ((m = re.exec(s))) ud.push([m[1], m[2] ? parseInt(m[2], 10) : 1]);
        ion._atomer = ud;
        return ud;
    };

    /* ----- Faeldningstabellen ------------------------------------------- */
    /* L = letopløseligt, T = tungtopløseligt, x = findes ikke (vises som
       ÷). Søjlerne følger AN_ORDEN: NO₃ Cl Br I OH SO₄ CO₃ PO₄.
       Graensen er 1 g pr. 100 mL vand ved 20 °C, som i sc2.1. Tallene
       for de saltene, der ligger taet paa graensen, staar i README. */
    var TABEL = {
        Na:  "LLLLLLLL",
        K:   "LLLLLLLL",
        NH4: "LLLLxLLL",
        Mg:  "LLLLTLTT",
        Ca:  "LLLLTTTT",
        Ba:  "LLLLLTTT",
        Al:  "LLLLTLxT",
        Fe2: "LLLLTLTT",
        Fe3: "LLLxTLxT",
        Cu:  "LLLxTLTT",
        Ag:  "LTTTxTTT",
        Pb:  "LTTTTTTT"
    };

    D.opl = function (katId, anId) {
        var r = TABEL[katId], i = D.AN_ORDEN.indexOf(anId);
        return r && i >= 0 ? r.charAt(i) : "x";
    };

    /* Parrene, der ikke findes. Teksten staar i tabellens infolinje. */
    D.FINDES_IKKE = {
        "NH4-OH": "Ammoniumhydroxid findes ikke. NH₄⁺ og OH⁻ giver ammoniak og vand. Det kan lugtes.",
        "Ag-OH":  "Sølvhydroxid findes ikke. Ag⁺ og OH⁻ giver brunt sølvoxid, Ag₂O.",
        "Al-CO3": "Aluminiumcarbonat findes ikke. Al³⁺ og CO₃²⁻ giver Al(OH)₃ og bobler af CO₂.",
        "Fe3-CO3": "Jern(III)carbonat findes ikke. Fe³⁺ og CO₃²⁻ giver rødbrunt Fe(OH)₃ og bobler af CO₂.",
        "Fe3-I":  "Jern(III)iodid findes ikke. Fe³⁺ og I⁻ reagerer til Fe²⁺ og I₂.",
        "Cu-I":   "Kobber(II)iodid findes ikke. Cu²⁺ og I⁻ reagerer til CuI og I₂."
    };

    /* Bundfaldenes farve: [r, g, b] og ordet. Alle andre er hvide. */
    var HVID = [[240, 240, 236], "hvidt"];
    var BUNDFALD = {
        "Ag-Br":  [[236, 230, 180], "lysegult"],
        "Ag-I":   [[240, 222, 110], "gult"],
        "Ag-CO3": [[238, 224, 168], "lysegult"],
        "Ag-PO4": [[240, 204, 62],  "gult"],
        "Pb-I":   [[250, 208, 40],  "gult"],
        "Fe2-OH": [[118, 150, 96],  "grønt"],
        "Fe2-CO3": [[196, 202, 184], "gråhvidt"],
        "Fe3-OH": [[150, 72, 30],   "rødbrunt"],
        "Fe3-PO4": [[236, 222, 168], "gulhvidt"],
        "Cu-OH":  [[100, 160, 225], "lyseblåt"],
        "Cu-CO3": [[104, 190, 172], "blågrønt"],
        "Cu-PO4": [[128, 192, 234], "lyseblåt"]
    };
    D.bundfald = function (katId, anId) {
        var b = BUNDFALD[katId + "-" + anId] || HVID;
        return { farve: b[0], ord: b[1] };
    };

    /* Farvede opløsninger. Alle andre ioner er farveløse. */
    D.OPL_FARVE = { Cu: [60, 140, 225], Fe3: [214, 150, 60], Fe2: [150, 200, 130] };

    /* ----- Salte ------------------------------------------------------- */
    /* Det mindste forhold, hvor plus og minus gaar lige op. */
    D.forhold = function (kat, an) {
        var a = kat.q, b = -an.q, g = NK.gcd(a, b);
        return { p: b / g, n: a / g };
    };

    /* Én ion med sit antal: Na₂, (SO₄)₃. Parentes kun om sammensatte. */
    D.formeldel = function (ion, antal) {
        if (antal === 1) return ion.formel;
        return ion.sammensat ? "(" + ion.formel + ")" + NK.saenket(antal) : ion.formel + NK.saenket(antal);
    };

    D.formel = function (kat, an, p, n) {
        return D.formeldel(kat, p) + D.formeldel(an, n);
    };

    var saltLager = {};
    D.salt = function (katId, anId) {
        var noegle = katId + "-" + anId;
        if (saltLager[noegle]) return saltLager[noegle];
        var kat = D.ion(katId), an = D.ion(anId), f = D.forhold(kat, an);
        var s = {
            noegle: noegle, kat: kat, an: an, p: f.p, n: f.n,
            formel: D.formel(kat, an, f.p, f.n),
            navn: kat.navn + an.navn
        };
        s.ascii = D.ascii(s.formel);
        saltLager[noegle] = s;
        return s;
    };

    /* Atomerne i x kationer og y anioner: {Ag: 3, P: 1, O: 4} */
    D.atomtal = function (kat, x, an, y) {
        var ud = {};
        function laeg(ion, antal) {
            D.sammensaetning(ion).forEach(function (a) { ud[a[0]] = (ud[a[0]] || 0) + a[1] * antal; });
        }
        laeg(kat, x);
        laeg(an, y);
        return ud;
    };

    /* ----- Opløsningerne paa hylden --------------------------------------- */
    /* Letopløselige salte, der findes som opløsning i et skolelaboratorium. */
    D.OPLOESNINGER = [
        "Ag-NO3", "Pb-NO3", "Ba-NO3", "Ca-NO3", "Cu-NO3", "Fe3-NO3", "Mg-NO3", "Al-NO3", "K-NO3", "Na-NO3", "NH4-NO3",
        "Na-Cl", "K-Cl", "NH4-Cl", "Ba-Cl", "Ca-Cl", "Mg-Cl", "Cu-Cl", "Fe3-Cl", "Fe2-Cl", "Al-Cl",
        "Na-Br", "K-Br", "K-I", "Na-I",
        "Na-OH", "K-OH", "Ba-OH",
        "Na-SO4", "K-SO4", "Mg-SO4", "Cu-SO4", "Fe2-SO4", "Al-SO4", "NH4-SO4",
        "Na-CO3", "K-CO3", "NH4-CO3",
        "Na-PO4", "K-PO4"
    ].map(function (k) { var d = k.split("-"); return D.salt(d[0], d[1]); });

    /* ----- Opgaverne ------------------------------------------------------ */
    /* Taellingen af ioner i glassene. Hoejst 20 i alt og 12 i hvert af
       de smaa glas, saa man kan se dem. */
    D.MAKS_IONER = 20;
    D.MAKS_GLAS = 12;

    function ionerI(s) { return s.p + s.n; }

    /* Det fulde saltskema i de mindste hele tal. Bruges til at fylde
       glassene med de rigtige maengder, ikke i opgaverne. */
    D.fuldtSkema = function (A, B) {
        var x0 = D.salt(A.kat.id, B.an.id), x1 = D.salt(B.kat.id, A.an.id);
        for (var sum = 2; sum <= 24; sum++) {
            for (var cA = 1; cA < sum; cA++) {
                var cB = sum - cA;
                if ((cA * A.p) % x0.p || (cB * B.p) % x1.p) continue;
                var c0 = cA * A.p / x0.p, c1 = cB * B.p / x1.p;
                if (cB * B.n === c0 * x0.n && cA * A.n === c1 * x1.n) return { cA: cA, cB: cB, c0: c0, c1: c1 };
            }
        }
        return null;
    };

    /* Hvor mange formelenheder staar der i hvert glas? */
    D.maengde = function (A, B, udfald) {
        var cA = 1, cB = 1;
        if (udfald !== "ingen") {
            var f = D.fuldtSkema(A, B);
            if (!f) return null;
            cA = f.cA; cB = f.cB;
        }
        var loft = udfald === "ingen" ? 16 : D.MAKS_IONER;
        var iA = cA * ionerI(A), iB = cB * ionerI(B), k = 1;
        while ((k + 1) * (iA + iB) <= loft && (k + 1) * iA <= D.MAKS_GLAS && (k + 1) * iB <= D.MAKS_GLAS) k++;
        return { nA: k * cA, nB: k * cB, ioner: k * (iA + iB), glasA: k * iA, glasB: k * iB };
    };

    function trinFor(s) {
        var m = Math.max(s.p, s.n);
        return m >= 3 ? 3 : m;
    }

    /* Alle par af opløsninger, hvor ionerne kan bytte partner. Et par
       med ÷ er ikke med: dér sker der noget andet end en fældning. */
    D.PAR = [];
    (function () {
        var L = D.OPLOESNINGER;
        for (var i = 0; i < L.length; i++) {
            for (var j = i + 1; j < L.length; j++) {
                var A = L[i], B = L[j];
                if (A.kat === B.kat || A.an === B.an) continue;
                var k0 = D.opl(A.kat.id, B.an.id), k1 = D.opl(B.kat.id, A.an.id);
                if (k0 === "x" || k1 === "x") continue;
                var t = (k0 === "T") + (k1 === "T");
                var udfald = t === 0 ? "ingen" : (t === 1 ? "en" : "begge");
                var m = D.maengde(A, B, udfald);
                if (!m || m.glasA > D.MAKS_GLAS || m.glasB > D.MAKS_GLAS || m.ioner > D.MAKS_IONER) continue;
                var tr = Math.max(trinFor(A), trinFor(B));
                if (udfald === "en") tr = Math.max(tr, trinFor(k0 === "T" ? D.salt(A.kat.id, B.an.id) : D.salt(B.kat.id, A.an.id)));
                D.PAR.push({ noegle: A.noegle + "+" + B.noegle, A: A, B: B, udfald: udfald, trin: tr });
            }
        }
    }());

    /* Laver en opgave ud af et par. Raekkefoelgen af de to opløsninger
       er tilfaeldig, saa det ikke altid er metalsaltet, der staar foerst. */
    D.lavOpgave = function (par, byt) {
        if (byt === undefined) byt = Math.random() < 0.5;
        var A = byt ? par.B : par.A, B = byt ? par.A : par.B;
        var nye = [D.salt(A.kat.id, B.an.id), D.salt(B.kat.id, A.an.id)];
        var o = {
            noegle: par.noegle, udfald: par.udfald, trin: par.trin, A: A, B: B,
            nye: nye.map(function (s) { return { salt: s, kode: D.opl(s.kat.id, s.an.id) }; }),
            maengde: D.maengde(A, B, par.udfald)
        };
        o.faeld = o.nye.filter(function (x) { return x.kode === "T"; }).map(function (x) { return x.salt; });
        o.bliver = o.nye.filter(function (x) { return x.kode === "L"; }).map(function (x) { return x.salt; });
        o.P = o.faeld.length === 1 ? o.faeld[0] : null;
        o.ioner = [A.kat, A.an, B.kat, B.an];
        o.tilskuere = o.P ? o.ioner.filter(function (i) { return i !== o.P.kat && i !== o.P.an; }) : [];
        return o;
    };

    /* Hvilken opløsning er en ion med i? */
    D.saltMed = function (o, ion) {
        return (o.A.kat === ion || o.A.an === ion) ? o.A : ((o.B.kat === ion || o.B.an === ion) ? o.B : null);
    };

    /* Er (kat, an) et af de par, der var sammen i flaskerne i forvejen? */
    D.gammeltPar = function (o, katId, anId) {
        return (o.A.kat.id === katId && o.A.an.id === anId) || (o.B.kat.id === katId && o.B.an.id === anId);
    };

    /* Er (kat, an) et af de nye par? Giver det nye par eller null. */
    D.nytPar = function (o, katId, anId) {
        for (var i = 0; i < o.nye.length; i++) {
            if (o.nye[i].salt.kat.id === katId && o.nye[i].salt.an.id === anId) return o.nye[i];
        }
        return null;
    };

    /* ----- Ionskemaet ------------------------------------------------------ */
    function led(tal, tekst) { return (tal > 1 ? tal + " " : "") + tekst; }

    /* 3 Ag⁺(aq) + PO₄³⁻(aq) → Ag₃PO₄(s) */
    D.ionskema = function (P) {
        return led(P.p, D.ionTekst(P.kat)) + "(aq) + " + led(P.n, D.ionTekst(P.an)) + "(aq) → " + P.formel + "(s)";
    };

    /* ----- Ladningsregnskabet i teksterne ------------------------------------ */
    function fortegn(v) { return (v > 0 ? "+" : "−") + Math.abs(v); }

    /* "2 · (+1) + 1 · (−3) = −1" */
    D.ladningsregnskab = function (kat, x, an, y) {
        return x + " · (" + fortegn(kat.q) + ") + " + y + " · (" + fortegn(an.q) + ") = " + (x * kat.q + y * an.q === 0 ? "0" : fortegn(x * kat.q + y * an.q));
    };

    D.ladningstjek = function (kat, an, x, y) {
        var sum = x * kat.q + y * an.q;
        if (sum === 0) {
            var g = NK.gcd(x, y);
            return "Ladningen går op, men " + x + " : " + y + " kan forkortes til " + (x / g) + " : " + (y / g)
                + ". Formlen viser det mindste forhold.";
        }
        return "Ladningen går ikke op: " + D.ladningsregnskab(kat, x, an, y) + ".";
    };

    /* Hvorfor er formlen, som den er? Bruges ved et rigtigt svar. */
    D.hvorforFormel = function (P) {
        var t = D.ladningsregnskab(P.kat, P.p, P.an, P.n) + ".";
        if (P.an.sammensat && P.n > 1) t += " Parentesen viser, at hele " + P.an.formel + " er med " + P.n + " gange.";
        else if (P.kat.sammensat && P.p > 1) t += " Parentesen viser, at hele " + P.kat.formel + " er med " + P.p + " gange.";
        return t;
    };

    /* ----- Formler med typiske fejl ------------------------------------------ */
    /* Hver variant: tekst (med saenkede tal), ascii og forklaringen paa
       fejlen. Listen er i den raekkefoelge, fejlene er mest vaerd at
       moede. Den bruges baade til svarmulighederne paa niveau 2 og til
       at genkende elevens egen formel paa niveau 3. */
    function udenParentes(kat, an, x, y) {
        return kat.formel + (x > 1 ? NK.saenket(x) : "") + an.formel + (y > 1 ? NK.saenket(y) : "");
    }

    function atomformel(kat, an, x, y) {
        var a = D.atomtal(kat, x, an, y), ud = "";
        Object.keys(a).forEach(function (s) { ud += s + (a[s] > 1 ? NK.saenket(a[s]) : ""); });
        return ud;
    }

    /* Parentes, hvor der ikke skal vaere en: om én sammensat ion,
       Ag₃(PO₄), eller om et enkelt atom, (Cl)₂. Giver de varianter,
       der er forskellige fra den rigtige formel. */
    function overflodigeParenteser(kat, an, x, y) {
        function ekstra(ion, n) { return "(" + ion.formel + ")" + (n > 1 ? NK.saenket(n) : ""); }
        var k = (x === 1 && kat.sammensat) || (x > 1 && !kat.sammensat) ? ekstra(kat, x) : null;
        var a = (y === 1 && an.sammensat) || (y > 1 && !an.sammensat) ? ekstra(an, y) : null;
        var ud = [];
        if (k) ud.push(k + D.formeldel(an, y));
        if (a) ud.push(D.formeldel(kat, x) + a);
        if (k && a) ud.push(k + a);
        return ud;
    }

    D.formelVarianter = function (P) {
        var kat = P.kat, an = P.an, x = P.p, y = P.n;
        var ud = [], brugt = {};
        brugt[P.ascii] = true;
        function laeg(tekst, forklaring, slags) {
            var a = D.ascii(tekst);
            if (brugt[a]) return;
            brugt[a] = true;
            ud.push({ tekst: tekst, ascii: a, forklaring: forklaring, slags: slags });
        }
        var grp = (an.sammensat && y > 1) ? an : ((kat.sammensat && x > 1) ? kat : null);
        var grpAntal = grp === an ? y : x;
        if (grp) {
            laeg(udenParentes(kat, an, x, y), "Brug parentes. Uden parentes smelter tallene sammen, og "
                + grp.formel + NK.saenket(grpAntal) + " ligner ét langt tal.", "parentes");
        }
        if (x !== y) laeg(D.formel(kat, an, y, x), "Tallene er byttet om. " + D.ladningstjek(kat, an, y, x), "byttet");
        if (kat.sammensat || an.sammensat) {
            laeg(atomformel(kat, an, x, y), "Atomerne er talt rigtigt, men så kan man ikke se ionerne. En sammensat ion skrives samlet.", "atomer");
        }
        if (x !== 1 || y !== 1) laeg(D.formel(kat, an, 1, 1), D.ladningstjek(kat, an, 1, 1), "ladning");
        laeg(D.formel(kat, an, 2 * x, 2 * y), D.ladningstjek(kat, an, 2 * x, 2 * y), "forkortes");
        laeg(D.formeldel(an, y) + D.formeldel(kat, x), "Den positive ion skrives først i formlen.", "omvendt");
        laeg(D.formel(kat, an, 1, kat.q), D.ladningstjek(kat, an, 1, kat.q), "ladning");
        laeg(D.formel(kat, an, -an.q, 1), D.ladningstjek(kat, an, -an.q, 1), "ladning");
        laeg(D.formel(kat, an, x + 1, y), D.ladningstjek(kat, an, x + 1, y), "ladning");
        laeg(D.formel(kat, an, x, y + 1), D.ladningstjek(kat, an, x, y + 1), "ladning");
        overflodigeParenteser(kat, an, x, y).forEach(function (t) {
            laeg(t, "Parentes bruges kun om en sammensat ion, når der er mere end én af den.", "parentes");
        });
        return ud;
    };

    /* Et stort katalog over formler, eleven kunne finde paa at skrive,
       med forklaringen paa hver. ascii -> forklaring. */
    D.formelKatalog = function (P) {
        if (P._katalog) return P._katalog;
        var kat = P.kat, an = P.an, kat2 = {};
        function laeg(tekst, forklaring) {
            var a = D.ascii(tekst);
            if (a !== P.ascii && !kat2[a]) kat2[a] = forklaring;
        }
        D.formelVarianter(P).forEach(function (v) { laeg(v.tekst, v.forklaring); });
        var x, y;
        for (x = 1; x <= 6; x++) for (y = 1; y <= 6; y++) laeg(D.formel(kat, an, x, y), D.ladningstjek(kat, an, x, y));
        for (x = 1; x <= 6; x++) for (y = 1; y <= 6; y++) {
            var sum = x * kat.q + y * an.q;
            laeg(udenParentes(kat, an, x, y), sum === 0 && x === P.p && y === P.n
                ? "Brug parentes. Uden parentes smelter tallene sammen."
                : "Brug parentes om en sammensat ion, når der er mere end én. " + D.ladningstjek(kat, an, x, y));
            laeg(D.formeldel(an, y) + D.formeldel(kat, x), "Den positive ion skrives først i formlen.");
            overflodigeParenteser(kat, an, x, y).forEach(function (t) {
                laeg(t, "Parentes bruges kun om en sammensat ion, når der er mere end én af den.");
            });
            laeg(atomformel(kat, an, x, y), "En sammensat ion skrives samlet, så man kan se ionerne i formlen.");
        }
        P._katalog = kat2;
        return kat2;
    };

    /* ----- Kemichaels praesentation ------------------------------------------ */
    /* Første gang en sværhedsgrad åbnes i en browser. Højst ca. 60 tegn pr.
       replik og ingen teori. Den linje, der står i PEG, siger han, mens
       han peger på det, den handler om. */
    D.INTRO = {
        tabel: [
            "To opløsninger. Blandes de, bytter ionerne partner.",
            "Slå de nye par op i tabellen til højre.",
            "Står der T, falder det ud. Jeg holder øje."
        ],
        vaelg: [
            "Samme opgave. Nu vælger du selv svarene.",
            "Fire trin. De står i panelet til højre.",
            "De forkerte svar har jeg rettet før. Mange gange."
        ],
        skriv: [
            "Samme opgave. Nu skriver du det hele selv.",
            "Skriv på tavlen. Tallene sætter sig selv.",
            "Rødpennen er klar. Den er altid klar."
        ]
    };
    D.INTRO_PEG = 1;

    /* ----- Forkerte ioner paa niveau 2 --------------------------------------- */
    function ladningsForklaring(ion, S) {
        if (ion.q < 0) return "Tjek ladningen. Ionerne står med deres ladning i kanten af fældningstabellen.";
        return "Tjek ladningen. I " + S.formel + " er der " + S.n + " " + D.ionTekst(S.an) + " for hver "
            + (S.p > 1 ? S.p + " " : "") + ion.formel + ", og saltet er neutralt.";
    }
    D.ladningsForklaring = ladningsForklaring;

    /* Fire forkerte ioner, én for hver rigtig, og hver af dem en fejl,
       elever faktisk laver: det lille tal regnet med til ionen (Cl₂⁻),
       forkert ladning (Ba⁺, Fe²⁺ i FeCl₃), en sammensat ion delt (S²⁻ fra
       SO₄²⁻) eller fortegnet byttet om. */
    D.ionAtrapper = function (o) {
        var rigtige = {}, ud = [], brugt = {};
        o.ioner.forEach(function (i) { rigtige[D.ionTekst(i)] = true; });
        [[o.A, o.A.kat, o.A.p], [o.A, o.A.an, o.A.n], [o.B, o.B.kat, o.B.p], [o.B, o.B.an, o.B.n]].forEach(function (x) {
            var S = x[0], ion = x[1], antal = x[2], kand = [];
            if (antal > 1) {
                kand.push([D.formeldel(ion, antal) + NK.ladningHaevet(ion.q),
                    "Det lille " + antal + "-tal i " + S.formel + " fortæller, hvor mange der er af ionen. Det er ikke en del af ionen."]);
            }
            if (ion.variabel) kand.push([ion.formel + NK.ladningHaevet(ion.anden), ladningsForklaring(ion, S)]);
            if (ion.brud) {
                kand.push([ion.brud[0] + NK.ladningHaevet(ion.brud[1]),
                    ion.formel + " er én samlet ion. Den går ikke i stykker, når saltet opløses."]);
            }
            var s = Math.abs(ion.q), q2 = (s === 1 ? 2 : s - 1) * (ion.q > 0 ? 1 : -1);
            kand.push([ion.formel + NK.ladningHaevet(q2), ladningsForklaring(ion, S)]);
            kand.push([ion.formel + NK.ladningHaevet(-ion.q), "Fortegnet er forkert. I et salt står den positive ion først og den negative sidst."]);
            for (var i = 0; i < kand.length; i++) {
                if (rigtige[kand[i][0]] || brugt[kand[i][0]]) continue;
                brugt[kand[i][0]] = true;
                ud.push({ tekst: kand[i][0], forklaring: kand[i][1] });
                break;
            }
        });
        return ud;
    };
}());

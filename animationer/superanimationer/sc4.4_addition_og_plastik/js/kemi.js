/* =====================================================================
   kemi.js - modellen: stofferne, additionen, bromvandet og kaeden

   Alt, der er kemi, staar her, adskilt fra tegningen.

   * K.STOF: de tre molekyler paa fane 1 som strukturformler. Stederne
     er i bindingslaengder (1 = afstanden mellem to carbonatomer) med
     y nedad. efter er atomernes pladser, naar dobbeltbindingen har
     aabnet sig, og plads er de to ledige pladser.
   * K.REAGENS: brom, hydrogen og vand, og de to dele, hvert molekyle
     deler sig i.
   * K.rig(stof, reagens): alle atomer og bindinger i en addition med
     start og slut, saa tegningen kan vise den som en bevaegelse.
   * K.VAESKE: de fem vaesker paa fane 2. reagerer siger, om stoffet
     laver en addition med brom.
   * K.brom(stof, m): hvor brommet er, naar glasset er rystet (m fra
     0 til 1): i vandet, i carbonhydridet eller brugt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    /* ----- Fane 1: molekylerne ------------------------------------------------- */
    K.STOF = {
        ethen: {
            navn: "ethen", formel: "C₂H₄", slags: "en alken", koen: "t",
            atomer: [["C", -0.5, 0], ["C", 0.5, 0], ["H", -1.1, -0.62], ["H", -1.1, 0.62], ["H", 1.1, -0.62], ["H", 1.1, 0.62]],
            bindinger: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
            dobbelt: [0, 1],
            efter: [null, null, [-1.45, 0], [-0.5, 0.95], [1.45, 0], [0.5, 0.95]],
            plads: [[-0.5, -0.95], [0.5, -0.95]],
            oh: 1
        },
        ethan: {
            navn: "ethan", formel: "C₂H₆", slags: "en alkan", koen: "n",
            atomer: [["C", -0.5, 0], ["C", 0.5, 0], ["H", -1.45, 0], ["H", -0.5, -0.95], ["H", -0.5, 0.95], ["H", 1.45, 0], ["H", 0.5, -0.95], ["H", 0.5, 0.95]],
            bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]],
            dobbelt: null
        },
        propen: {
            navn: "propen", formel: "C₃H₆", slags: "en alken", koen: "t",
            atomer: [["C", -1, 0], ["C", 0, 0], ["C", 1, 0], ["H", -1.95, 0], ["H", -1, -0.95], ["H", -1, 0.95], ["H", 0, 0.95], ["H", 1.6, -0.62], ["H", 1.6, 0.62]],
            bindinger: [[0, 1, 1], [1, 2, 2], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [2, 7, 1], [2, 8, 1]],
            dobbelt: [1, 2],
            efter: [null, null, null, null, null, null, null, [1.95, 0], [1, 0.95]],
            plads: [[0, -0.95], [1, -0.95]],
            /* vand: OH saetter sig paa det midterste carbonatom (hovedproduktet) */
            oh: 0
        }
    };

    /* dele: de to dele, molekylet deler sig i (numre i atomer). Den foerste
       i hver del er det atom, der binder sig til carbonatomet. */
    K.REAGENS = {
        Br2: { navn: "brom", formel: "Br₂", atomer: [["Br", -0.62, 0], ["Br", 0.62, 0]], bindinger: [[0, 1, 1]], dele: [[0], [1]], delNavn: "to bromatomer" },
        H2: { navn: "hydrogen", formel: "H₂", atomer: [["H", -0.45, 0], ["H", 0.45, 0]], bindinger: [[0, 1, 1]], dele: [[0], [1]], delNavn: "to hydrogenatomer" },
        H2O: { navn: "vand", formel: "H₂O", atomer: [["H", -0.78, 0.28], ["O", 0, -0.12], ["H", 0.78, 0.28]], bindinger: [[0, 1, 1], [1, 2, 1]], dele: [[0], [1, 2]], delNavn: "H og OH" }
    };

    K.REAGENSER = ["Br2", "H2", "H2O"];

    /* Produkterne. Formlerne skrives som i bogen (C₂H₅OH). */
    K.PRODUKT = {
        "ethen+Br2": { navn: "1,2-dibromethan", formel: "C₂H₄Br₂", slags: "en alkan med to bromatomer" },
        "ethen+H2": { navn: "ethan", formel: "C₂H₆", slags: "en alkan" },
        "ethen+H2O": { navn: "ethanol", formel: "C₂H₅OH", slags: "en alkohol" },
        "propen+Br2": { navn: "1,2-dibrompropan", formel: "C₃H₆Br₂", slags: "en alkan med to bromatomer" },
        "propen+H2": { navn: "propan", formel: "C₃H₈", slags: "en alkan" },
        "propen+H2O": { navn: "propan-2-ol", formel: "C₃H₇OH", slags: "en alkohol" }
    };

    K.Stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* Kan der ske en addition? Kun naar der er en dobbeltbinding. */
    K.kanAddere = function (stof) { return !!K.STOF[stof].dobbelt; };

    K.produkt = function (stof, reagens) {
        if (!K.kanAddere(stof)) return null;
        return K.PRODUKT[stof + "+" + reagens] || null;
    };

    K.skema = function (stof, reagens) {
        var p = K.produkt(stof, reagens);
        if (!p) return "";
        return K.STOF[stof].formel + " + " + K.REAGENS[reagens].formel + " → " + p.formel;
    };

    /* Atomerne i en formel: "C₂H₅OH" -> { C: 2, H: 6, O: 1 } */
    K.tael = function (formel) {
        var ud = {}, s = NK.ascii(formel), re = /([A-Z][a-z]?)(\d*)/g, m;
        while ((m = re.exec(s)) !== null) {
            if (!m[1]) continue;
            ud[m[1]] = (ud[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
        }
        return ud;
    };

    /* Atomerne i en tegnet struktur */
    K.taelAtomer = function (atomer) {
        var ud = {};
        atomer.forEach(function (a) { var el = a.el || a[0]; ud[el] = (ud[el] || 0) + 1; });
        return ud;
    };

    K.ens = function (a, b) {
        var n = {}, ok = true;
        Object.keys(a).forEach(function (k) { n[k] = true; });
        Object.keys(b).forEach(function (k) { n[k] = true; });
        Object.keys(n).forEach(function (k) { if ((a[k] || 0) !== (b[k] || 0)) ok = false; });
        return ok;
    };

    /* Antal bindinger fra hvert atom (en dobbeltbinding taeller for to) */
    K.valens = function (atomer, bindinger) {
        var v = atomer.map(function () { return 0; });
        bindinger.forEach(function (b) {
            var s = b.s1 !== undefined ? b.s1 : b[2];
            var i = b.a !== undefined ? b.a : b[0], j = b.b !== undefined ? b.b : b[1];
            v[i] += s; v[j] += s;
        });
        return v;
    };

    /* ----- Riggen: en addition som start og slut ---------------------------------
       atomer: { el, p0, p1, del }  del: "stof", "A" eller "B"
       bindinger: { a, b, s0, s1 }  styrken foer og efter (2 = dobbelt, 0 = ingen)
       Reagensets atomer har p0 = pladsen lige over dobbeltbindingen (svaevet)
       og p1 = pladsen i produktet. Uden reagens er det molekylet alene. */
    K.SVAEV = 1.72;      /* saa hoejt over carbonatomerne svaever reagenset */
    K.OH = 0.85;         /* afstanden fra O til H i OH */

    K.rig = function (stofId, reagensId) {
        var s = K.STOF[stofId], ud = { stof: stofId, reagens: reagensId || null, atomer: [], bindinger: [] };
        var add = !!(reagensId && s.dobbelt);
        s.atomer.forEach(function (a, i) {
            var p0 = [a[1], a[2]];
            var p1 = add && s.efter[i] ? s.efter[i].slice() : p0.slice();
            ud.atomer.push({ el: a[0], p0: p0, p1: p1, del: "stof" });
        });
        s.bindinger.forEach(function (b) {
            var dob = s.dobbelt && b[0] === s.dobbelt[0] && b[1] === s.dobbelt[1];
            ud.bindinger.push({ a: b[0], b: b[1], s0: b[2], s1: add && dob ? 1 : b[2], dobbelt: !!dob });
        });
        if (!add) return ud;

        var r = K.REAGENS[reagensId], n0 = ud.atomer.length;
        /* Hvilken del saetter sig paa hvilken plads. Vands OH foelger s.oh. */
        var pladsA = 0, pladsB = 1;
        if (reagensId === "H2O") { pladsB = s.oh; pladsA = 1 - s.oh; }
        var pladser = [s.plads[pladsA], s.plads[pladsB]];
        r.atomer.forEach(function (a, i) {
            var del = r.dele[0].indexOf(i) >= 0 ? 0 : 1;
            var anker = r.dele[del][0] === i;
            var pl = pladser[del];
            /* vandmolekylet vender, saa OH svaever over sit carbonatom */
            var p0, p1;
            if (anker) {
                p0 = [pl[0], pl[1] - (K.SVAEV - 0.95)];
                p1 = pl.slice();
            } else {
                /* H i OH: lige over O, saa det ikke stoeder paa nabocarbonatomets H */
                p0 = [pl[0], pl[1] - (K.SVAEV - 0.95) - K.OH];
                p1 = [pl[0], pl[1] - K.OH];
            }
            ud.atomer.push({ el: a[0], p0: p0, p1: p1, del: del === 0 ? "A" : "B", anker: anker });
        });
        r.bindinger.forEach(function (b) {
            var delA = r.dele[0].indexOf(b[0]) >= 0 ? 0 : 1, delB = r.dele[0].indexOf(b[1]) >= 0 ? 0 : 1;
            /* bindingen mellem de to dele brydes, bindingen inde i en del bliver */
            ud.bindinger.push({ a: n0 + b[0], b: n0 + b[1], s0: 1, s1: delA === delB ? 1 : 0, brydes: delA !== delB });
        });
        /* de to nye bindinger fra carbonatomerne */
        [0, 1].forEach(function (del) {
            var cNr = s.dobbelt[del === 0 ? pladsA : pladsB];
            ud.bindinger.push({ a: cNr, b: n0 + r.dele[del][0], s0: 0, s1: 1, ny: true });
        });
        ud.pladser = s.plads;
        return ud;
    };

    /* ----- Fane 2: de fem vaesker --------------------------------------------------
       Alle har seks carbonatomer, er farveloese og lettere end vand, saa de
       ligger oeverst. densitet er g/mL ved 20 °C. */
    K.VAESKE = {
        hexen: { navn: "hex-1-en", formel: "C₆H₁₂", dobbelt: 1, ring: false, reagerer: true, densitet: 0.67, produkt: "1,2-dibromhexan", pFormel: "C₆H₁₂Br₂" },
        hexan: { navn: "hexan", formel: "C₆H₁₄", dobbelt: 0, ring: false, reagerer: false, densitet: 0.66 },
        cyclohexen: { navn: "cyclohexen", formel: "C₆H₁₀", dobbelt: 1, ring: true, reagerer: true, densitet: 0.81, produkt: "1,2-dibromcyclohexan", pFormel: "C₆H₁₀Br₂" },
        cyclohexan: { navn: "cyclohexan", formel: "C₆H₁₂", dobbelt: 0, ring: true, reagerer: false, densitet: 0.78 },
        benzen: { navn: "benzen", formel: "C₆H₆", dobbelt: 3, ring: true, aromatisk: true, reagerer: false, densitet: 0.88 }
    };

    K.erMaettet = function (id) { return K.VAESKE[id].dobbelt === 0; };

    /* En alken laver en addition med brom. Benzen goer ikke, selv om den
       tegnes med dobbeltbindinger: ringen er saerlig stabil. */
    K.affarver = function (id) {
        var v = K.VAESKE[id];
        return v.dobbelt > 0 && !v.aromatisk;
    };

    /* Saa stor en del af brommet flytter op i carbonhydridet, naar glasset
       er rystet, og stoffet ikke reagerer. Tallet er valgt (brom er upolaert
       og oploeses langt bedst i carbonhydridet). */
    K.FORDELING = 0.9;

    /* Brommet i glasset, naar det er rystet m (0 = ikke rystet, 1 = faerdigt).
       Summen er altid 1. */
    K.brom = function (id, m) {
        m = NK.klamp(m, 0, 1);
        if (K.affarver(id)) return { vand: 1 - m, olie: 0, brugt: m };
        return { vand: 1 - K.FORDELING * m, olie: K.FORDELING * m, brugt: 0 };
    };

    /* Det, eleven ser, naar glasset er rystet */
    K.udfald = function (id) { return K.affarver(id) ? "forsvandt" : "flyttede"; };

    /* ----- Fane 3: kaeden -------------------------------------------------------------
       n ethenmolekyler giver en kaede med 2n C og 4n H. Intet bliver tilovers. */
    K.kaede = function (n) {
        return { led: n, C: 2 * n, H: 4 * n, dobbelt: 0, enkelt: n > 0 ? 2 * n - 1 : 0 };
    };

    K.kaedeFormel = function (n) {
        return "C" + NK.saenket(2 * n) + "H" + NK.saenket(4 * n);
    };

    /* Saa mange ethenmolekyler er der i den lange kaede, naar der zoomes ud.
       Bogen siger mange tusinde; tallet her er valgt. */
    K.LANG_KAEDE = 5000;
    K.MAX_LED = 8;        /* saa mange kan der vaere paa skaermen */

    NK.Kemi = K;
}());

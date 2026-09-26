/* =====================================================================
   data.js - reaktionerne, molekylerne, ordrerne, maalene, opgaverne og
   replikkerne

   Alt, der kan staa som data, staar her. Reaktionsskemaerne er de fire
   fra den gamle c4.4: dannelse af vand, ammoniaksyntesen og
   forbraendingen af methan og propan. Svarene regnes ud af
   koefficienterne; intet facit er skrevet i haanden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    D.NA_TEKST = "6,02 · 10²³";

    /* ----- Grundstofferne i molekylerne ------------------------------------
       Farverne er de sædvanlige for kuglemodeller (H hvid, C sort, N blaa,
       O roed). r er kuglens radius i molekylets egne enheder. */
    D.ATOM = {
        H: { r: 0.55, farve: "#eef0f3", kant: "#8c939e" },
        C: { r: 0.80, farve: "#4a4e57", kant: "#1d1f24" },
        N: { r: 0.78, farve: "#3d6fd8", kant: "#1f3f86" },
        O: { r: 0.75, farve: "#e0463b", kant: "#8a1e17" }
    };

    /* ----- Stofferne -------------------------------------------------------
       f: formlen med almindelige tal, navn, og atomerne som [grundstof, x, y]
       i tegneraekkefoelge (brintatomerne foerst, saa de ligger bagerst). */
    D.STOFFER = {
        H2:   { f: "H2", navn: "dihydrogen", atomer: [["H", -0.42, 0], ["H", 0.42, 0]] },
        O2:   { f: "O2", navn: "dioxygen", atomer: [["O", -0.6, 0], ["O", 0.6, 0]] },
        N2:   { f: "N2", navn: "dinitrogen", atomer: [["N", -0.6, 0], ["N", 0.6, 0]] },
        H2O:  { f: "H2O", navn: "vand", atomer: [["H", -0.74, 0.46], ["H", 0.74, 0.46], ["O", 0, -0.12]] },
        NH3:  { f: "NH3", navn: "ammoniak", atomer: [["H", -0.8, 0.36], ["H", 0.8, 0.36], ["N", 0, -0.18], ["H", 0, 0.66]] },
        CH4:  { f: "CH4", navn: "methan", atomer: [["H", -0.72, -0.64], ["H", 0.72, -0.64], ["H", -0.72, 0.64], ["H", 0.72, 0.64], ["C", 0, 0]] },
        CO2:  { f: "CO2", navn: "carbondioxid", atomer: [["O", -1.2, 0], ["O", 1.2, 0], ["C", 0, 0]] },
        C3H8: { f: "C3H8", navn: "propan", atomer: [
            ["H", -2.0, 0.0], ["H", -1.4, 1.1], ["H", -1.55, -0.62],
            ["H", -0.48, -1.12], ["H", 0.48, -1.12],
            ["H", 2.0, 0.0], ["H", 1.4, 1.1], ["H", 1.55, -0.62],
            ["C", -1.15, 0.28], ["C", 0, -0.28], ["C", 1.15, 0.28]] }
    };

    /* Posen med 1 mol faar sin egen farve pr. stof, saa CO₂ og H₂O kan skelnes */
    var POSEFARVE = { H2: "#cfd5dd", O2: "#e0463b", N2: "#3d6fd8", H2O: "#4aa3df", NH3: "#8e6fd8",
        CH4: "#6b707a", CO2: "#9aa0aa", C3H8: "#4a4e57" };

    Object.keys(D.STOFFER).forEach(function (id) {
        var st = D.STOFFER[id];
        st.id = id;
        st.formel = NK.formel(st.f);
        /* Atomerne i molekylet talt op, fx { H: 2, O: 1 } */
        st.antal = {};
        st.atomer.forEach(function (a) { st.antal[a[0]] = (st.antal[a[0]] || 0) + 1; });
        /* Den yderste kant, til kollisioner i kammeret */
        st.radius = 0;
        st.atomer.forEach(function (a) {
            st.radius = Math.max(st.radius, Math.sqrt(a[1] * a[1] + a[2] * a[2]) + D.ATOM[a[0]].r);
        });
        st.farve = POSEFARVE[id];
    });
    D.stof = function (id) { return D.STOFFER[id]; };

    /* ----- Reaktionerne ------------------------------------------------------
       led: [stof, koefficient] paa venstre og hoejre side. */
    var R = [
        { id: "vand", navn: "Dannelse af vand", kort: "Vand", venstre: [["H2", 2], ["O2", 1]], hoejre: [["H2O", 2]] },
        { id: "ammoniak", navn: "Ammoniaksyntesen", kort: "Ammoniak", venstre: [["N2", 1], ["H2", 3]], hoejre: [["NH3", 2]] },
        { id: "methan", navn: "Forbrænding af methan", kort: "Methan", venstre: [["CH4", 1], ["O2", 2]], hoejre: [["CO2", 1], ["H2O", 2]] },
        { id: "propan", navn: "Forbrænding af propan", kort: "Propan", venstre: [["C3H8", 1], ["O2", 5]], hoejre: [["CO2", 3], ["H2O", 4]] }
    ];
    D.REAKTIONER = R.map(function (r) {
        var led = [];
        r.venstre.forEach(function (x) { led.push({ s: x[0], k: x[1], side: 0 }); });
        r.hoejre.forEach(function (x) { led.push({ s: x[0], k: x[1], side: 1 }); });
        return { id: r.id, navn: r.navn, kort: r.kort, led: led,
            reaktanter: led.filter(function (l) { return l.side === 0; }),
            produkter: led.filter(function (l) { return l.side === 1; }) };
    });
    D.reaktion = function (id) {
        for (var i = 0; i < D.REAKTIONER.length; i++) if (D.REAKTIONER[i].id === id) return D.REAKTIONER[i];
        return null;
    };

    /* Skemaet som tekst: "2 H₂ + O₂ ⟶ 2 H₂O". En koefficient paa 1 skrives ikke. */
    D.skema = function (r) {
        function side(liste) {
            return liste.map(function (l) { return (l.k > 1 ? l.k + " " : "") + D.stof(l.s).formel; }).join(" + ");
        }
        return side(r.reaktanter) + " ⟶ " + side(r.produkter);
    };

    /* Forholdet mellem koefficienterne: "2 : 1 : 2" */
    D.forhold = function (r) {
        return r.led.map(function (l) { return l.k; }).join(" : ");
    };

    /* Er koefficienterne k (en liste i ledenes raekkefoelge) afstemt?
       Giver { ok, grundstof, v, h } med det foerste grundstof, der ikke passer. */
    D.afstemt = function (r, k) {
        var sum = [{}, {}];
        r.led.forEach(function (l, i) {
            var st = D.stof(l.s);
            Object.keys(st.antal).forEach(function (g) { sum[l.side][g] = (sum[l.side][g] || 0) + st.antal[g] * k[i]; });
        });
        var alle = Object.keys(sum[0]).concat(Object.keys(sum[1]));
        /* Raekkefoelgen, man normalt afstemmer i: C, N, H, O */
        var orden = ["C", "N", "H", "O"];
        alle.sort(function (a, b) { return orden.indexOf(a) - orden.indexOf(b); });
        for (var i = 0; i < alle.length; i++) {
            var g = alle[i];
            if ((sum[0][g] || 0) !== (sum[1][g] || 0)) return { ok: false, grundstof: g, v: sum[0][g] || 0, h: sum[1][g] || 0 };
        }
        return { ok: true };
    };

    /* ----- Fane 1: hotdogboden --------------------------------------------------
       Opskriften: 1 poelse + 1 broed + 2 agurkeskiver ⟶ 1 hotdog. */
    D.INGREDIENSER = [
        { id: "poelse", navn: "pølse", flertal: "pølser", bestemt: "pølserne", beholder: "gryde" },
        { id: "broed", navn: "brød", flertal: "brød", bestemt: "brødene", beholder: "kurv" },
        { id: "agurk", navn: "agurkeskive", flertal: "agurkeskiver", bestemt: "agurkeskiverne", beholder: "agurkglas" },
        { id: "bolle", navn: "bolle", flertal: "boller", bestemt: "bollerne", beholder: "kurv" },
        { id: "boef", navn: "bøf", flertal: "bøffer", bestemt: "bøfferne", beholder: "stegeplade" },
        { id: "ost", navn: "skive ost", flertal: "skiver ost", bestemt: "osteskiverne", beholder: "ostepakke" }
    ];
    D.ingrediens = function (id) {
        for (var i = 0; i < D.INGREDIENSER.length; i++) if (D.INGREDIENSER[i].id === id) return D.INGREDIENSER[i];
        return null;
    };

    /* De to opskrifter: [ingrediens, antal pr. stk.]. Hotdoggen har de lette
       tal, dobbeltburgeren de skaeve. */
    D.OPSKRIFTER = {
        hotdog: { id: "hotdog", navn: "hotdog", flertal: "hotdogs", led: [["poelse", 1], ["broed", 1], ["agurk", 2]] },
        burger: { id: "burger", navn: "dobbeltburger", flertal: "dobbeltburgere", led: [["bolle", 1], ["boef", 2], ["ost", 3]] }
    };

    D.stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* "3 pølser", "1 skive ost" */
    D.stk = function (id, n) {
        var ing = D.ingrediens(id);
        return n + " " + (n === 1 ? ing.navn : ing.flertal);
    };

    /* "2 hotdogs", "1 dobbeltburger" */
    D.produkt = function (ops, n) {
        return n + " " + (n === 1 ? ops.navn : ops.flertal);
    };

    /* "a", "a og b", "a, b og c" */
    D.liste = function (dele) {
        if (dele.length <= 1) return dele.join("");
        return dele.slice(0, -1).join(", ") + " og " + dele[dele.length - 1];
    };

    /* Hoejst saa mange af hver slags paa brættet. Alle ordrer holder sig under
       det, saa alt kan ses; der tegnes ingen bunker. */
    D.DISK_MAKS = 12;

    /* Ordrerne. slags "disk": eleven laegger paa brættet og ringer med klokken.
       "tal": eleven skriver, hvor meget der skal bruges til antal stk.
       "begr": det, der ligger (fyld), og eleven finder den begraensende
       ingrediens, antallet og overskuddet. tomt: beholdere, der er tomme. */
    var RAA = [
        { o: "hotdog", slags: "disk", antal: 2, bon: "2 hotdogs",
          tekst: "Bord 1 vil have 2 hotdogs. Læg det, der skal bruges, på brættet, og ring med klokken.",
          hint: "Opskriften hænger på væggen: 1 pølse, 1 brød og 2 agurkeskiver pr. hotdog.",
          efter: "2 pølser, 2 brød og 4 agurkeskiver. Det er opskriften 2 gange." },
        { o: "hotdog", slags: "disk", antal: 3, bon: "Så mange som muligt", fyld: { agurk: 6 }, tomt: ["agurk"],
          tekst: "Der er kun 6 agurkeskiver tilbage. Lav så mange hotdogs, som de rækker til.",
          hint: "Hver hotdog skal have 2 agurkeskiver. Hvor mange gange går 2 op i 6?",
          efter: "6 agurkeskiver rækker til 3 hotdogs. Så skal der 3 pølser og 3 brød til." },
        { o: "hotdog", slags: "tal", antal: 6, bon: "6 hotdogs",
          tekst: "Bord 3 vil have 6 hotdogs. Hvor meget skal du bruge af hver?",
          efter: "6 pølser, 6 brød og 12 agurkeskiver. Det er opskriften 6 gange." },
        { o: "hotdog", slags: "begr", bon: "Så mange som muligt", fyld: { poelse: 10, broed: 10, agurk: 10 },
          tekst: "Der ligger 10 af hver. Det, der slipper op først, er den begrænsende ingrediens. Det, der bliver tilbage, er i overskud." },
        { o: "hotdog", slags: "begr", bon: "Så mange som muligt", fyld: { poelse: 8, broed: 10, agurk: 12 },
          tekst: "Der ligger 8 pølser, 10 brød og 12 agurkeskiver." },
        { o: "hotdog", slags: "begr", bon: "Så mange som muligt", fyld: { poelse: 12, broed: 5, agurk: 12 },
          tekst: "Der ligger 12 pølser, 5 brød og 12 agurkeskiver." },
        { o: "burger", slags: "disk", antal: 2, bon: "2 dobbeltburgere",
          tekst: "Vognen sælger nu også dobbeltburgere. Opskriften står på skiltet. Bord 7 vil have 2.",
          hint: "1 bolle, 2 bøffer og 3 skiver ost pr. dobbeltburger.",
          efter: "2 boller, 4 bøffer og 6 skiver ost. Forholdet er stadig 1 : 2 : 3." },
        { o: "burger", slags: "tal", antal: 4, bon: "4 dobbeltburgere",
          tekst: "Bord 8 vil have 4 dobbeltburgere. Hvor meget skal du bruge af hver?",
          efter: "4 boller, 8 bøffer og 12 skiver ost. Det er opskriften 4 gange." },
        { o: "burger", slags: "begr", bon: "Så mange som muligt", fyld: { bolle: 5, boef: 8, ost: 9 },
          tekst: "Der ligger 5 boller, 8 bøffer og 9 skiver ost." },
        { o: "burger", slags: "begr", bon: "Så mange som muligt", fyld: { bolle: 6, boef: 7, ost: 12 },
          tekst: "Der ligger 6 boller, 7 bøffer og 12 skiver ost." }
    ];

    /* Det, der regnes ud: hvor langt hver ingrediens raekker, den
       begraensende, antallet, overskuddet og trinnene i panelet */
    D.ORDRER = RAA.map(function (r, i) {
        var o = {}, ops = D.OPSKRIFTER[r.o];
        Object.keys(r).forEach(function (n) { o[n] = r[n]; });
        o.nr = i;
        o.ops = ops;
        o.k = {};
        ops.led.forEach(function (l) { o.k[l[0]] = l[1]; });
        if (r.slags === "disk") o.P = r.antal;
        if (r.slags === "tal") {
            o.P = r.antal;
            o.trin = ops.led.map(function (l) { return { art: "antal", id: l[0], svar: r.antal * l[1] }; });
        }
        if (r.slags === "begr") {
            o.rakker = {};
            o.P = Infinity;
            ops.led.forEach(function (l) {
                o.rakker[l[0]] = Math.floor(r.fyld[l[0]] / l[1]);
                if (o.rakker[l[0]] < o.P) { o.P = o.rakker[l[0]]; o.begr = l[0]; }
            });
            o.over = {};
            ops.led.forEach(function (l) { o.over[l[0]] = r.fyld[l[0]] - o.P * l[1]; });
            o.trin = [{ art: "begr", svar: o.begr }, { art: "produkter", svar: o.P }].concat(
                ops.led.filter(function (l) { return o.over[l[0]] > 0; }).map(function (l) {
                    return { art: "overskud", id: l[0], svar: o.over[l[0]] };
                }));
            var B = D.ingrediens(o.begr), over = ops.led.filter(function (l) { return o.over[l[0]] > 0; })
                .map(function (l) { return D.stk(l[0], o.over[l[0]]); });
            o.efter = D.stort(B.bestemt) + " er begrænsende: " + D.stk(o.begr, r.fyld[o.begr]) + " rækker til " +
                D.produkt(ops, o.P) + ". " + D.liste(over) + " er i overskud.";
            if (o.over[o.begr] > 0) {
                o.efter += " " + D.stort(D.stk(o.begr, o.over[o.begr])) + " er ikke nok til en " + ops.navn + " mere.";
            }
        }
        return o;
    });

    /* De to grupper af ordrer i panelet */
    D.GRUPPER = [
        { navn: "Hotdogs", kort: "1 : 1 : 2, begrænsende og overskud", o: "hotdog", farve: "#d9731a" },
        { navn: "Dobbeltburgere", kort: "1 : 2 : 3, skævere tal", o: "burger", farve: "#3fae72" }
    ];

    /* ----- Fane 2: molekylerne ------------------------------------------------
       Fem maal. enhed "stk": hver figur er ét molekyle. enhed "mol": hver figur
       er 1 mol molekyler. krav: det, der skal dannes. Der maa intet blive
       tilbage. fyld: det, der ligger i kammeret fra start. */
    D.KAMMER_MAKS = 16;
    D.MAAL = [
        { r: "vand", enhed: "stk", krav: { H2O: 2 },
          tekst: "Lav 2 vandmolekyler. Intet må blive tilbage.",
          hint: "Opskriften står på skiltet: 2 H₂ og 1 O₂ giver 2 H₂O.",
          efter: "2 H₂ og 1 O₂ gav 2 H₂O. Alle atomerne blev brugt." },
        { r: "vand", enhed: "stk", krav: { H2O: 6 },
          tekst: "Lav 6 vandmolekyler uden rester.",
          hint: "6 H₂O er opskriften 3 gange. Så skal der 3 gange så meget af hvert stof.",
          efter: "6 H₂ og 3 O₂ gav 6 H₂O. Forholdet er stadig 2 : 1 : 2." },
        { r: "ammoniak", enhed: "stk", krav: { NH3: 4 }, fyld: { N2: 2 },
          tekst: "Der er 2 N₂ i kammeret. Tilsæt det H₂, der skal til.",
          hint: "Hvert N₂ skal bruge 3 H₂.",
          efter: "2 N₂ og 6 H₂ gav 4 NH₃. Forholdet er 1 : 3 : 2." },
        { r: "vand", enhed: "mol", krav: { H2O: 4 },
          tekst: "Nu er hver figur 1 mol molekyler. Lav 4 mol vand.",
          hint: "Opskriften gælder også i mol: 2 mol H₂ og 1 mol O₂ giver 2 mol H₂O.",
          efter: "4 mol H₂ og 2 mol O₂ gav 4 mol H₂O. Samme forhold som med molekylerne." },
        { r: "methan", enhed: "mol", krav: { CO2: 2, H2O: 4 },
          tekst: "Brænd 2 mol methan uden rester.",
          hint: "Hvert mol CH₄ skal bruge 2 mol O₂.",
          efter: "2 mol CH₄ og 4 mol O₂ gav 2 mol CO₂ og 4 mol H₂O." }
    ];

    /* ----- Fane 3: aekvivalente maengder ----------------------------------------
       En opgave er [niveau, reaktion, det kendte stof, stofmaengden som tekst].
       Svaerest-niveauet starter med at afstemme skemaet. Svarene faar lige
       saa mange betydende cifre som den kendte stofmaengde. */
    D.NIVEAUER = [
        { navn: "Let", kort: "hele tal, skemaet er afstemt", farve: "#3d9ee0" },
        { navn: "Middel", kort: "decimaltal og kendte produkter", farve: "#3fae72" },
        { navn: "Svær", kort: "afstem skemaet først", farve: "#e6892a", afstem: true }
    ];

    function cifre(tekst) {
        var s = tekst.replace(",", "").replace(/^0+/, "");
        return Math.max(1, s.length);
    }

    D.OPGAVER = [
        [0, "vand", "O2", "2,0"], [0, "ammoniak", "N2", "2,0"], [0, "vand", "H2", "6,0"], [0, "methan", "CH4", "3,0"],
        [1, "vand", "H2", "3,0"], [1, "ammoniak", "H2", "6,0"], [1, "methan", "CH4", "0,25"], [1, "ammoniak", "NH3", "5,0"],
        [2, "methan", "O2", "1,0"], [2, "propan", "O2", "10,0"], [2, "propan", "C3H8", "0,50"], [2, "propan", "H2O", "2,0"]
    ].map(function (x, i) {
        var r = D.reaktion(x[1]);
        var kendt = -1;
        r.led.forEach(function (l, j) { if (l.s === x[2] && kendt < 0) kendt = j; });
        var n = parseFloat(x[3].replace(",", "."));
        var bc = cifre(x[3]);
        var svar = r.led.map(function (l, j) {
            var v = n * l.k / r.led[kendt].k;
            return { v: v, tekst: j === kendt ? x[3] : NK.betydende(v, bc) };
        });
        return { nr: i, niveau: x[0], r: r, kendt: kendt, n: n, nTekst: x[3], svar: svar };
    });
    D.NIVEAUER.forEach(function (nv, n) {
        var i = 0;
        D.OPGAVER.forEach(function (o) { if (o.niveau === n) o.plads = i++; });
    });

    /* Hintet, naar skemaet skal afstemmes: hvor man begynder */
    D.AFSTEM_HINT = {
        vand: "Der er 2 O i O₂, så der skal 2 H₂O. Tæl så H.",
        ammoniak: "Der er 2 N i N₂, så der skal 2 NH₃. Tæl så H.",
        methan: "Der er 4 H i CH₄, så der skal 2 H₂O. Tæl så O på højre side.",
        propan: "Start med C: 3 C giver 3 CO₂. Så H: 8 H giver 4 H₂O. Til sidst O."
    };

    /* ----- Kemichael ----------------------------------------------------------
       Hoejst ca. 60 tegn pr. replik og ingen teori. */
    D.INTRO_HOTDOG = [
        "Pølsevognen. Opskriften hænger på væggen.",
        "Træk tingene hen på brættet, og ring med klokken.",
        "Kunderne tæller efter. Det gør jeg også."
    ];
    D.INTRO_MOLEKYLER = [
        "Samme slags opskrift, bare med molekyler.",
        "Træk dem ind i kammeret, og tryk Start.",
        "Atomer forsvinder ikke. Heller ikke her."
    ];
    D.INTRO_REGN = [
        "Tavlen. Én stofmængde er kendt.",
        "Skriv de andre under formlerne.",
        "Søjlerne viser, om forholdet holder."
    ];

    /* Paaskeaegget: en hotdog af lutter agurker */
    D.AEG_AGURK = "Kun agurker. Det er en salat, ikke en hotdog.";

    D.HOTDOG_FAERDIG = "Ti ordrer. Opskriften holder, også når noget slipper op.";
    D.MAAL_FAERDIG = "Molekyler eller mol. Opskriften er den samme.";
    D.NIVEAU_ROS = [
        "Let klaret. Koefficienterne gjorde arbejdet.",
        "Decimaltal og produkter. Godt regnet.",
        "Afstemt og regnet. Det er hele opgaven."
    ];
    D.OPGAVER_FAERDIG = "Tolv opgaver. Jeg skriver det i regnskabet.";

    NK.Data = D;
}());

/* =====================================================================
   data.js - stofferne, reaktionerne, opgaverne og linjerne i opgavekortet

   Alt, der kan staa som data, staar her. Molarmasserne regnes af
   atommasserne i hundrededele (heltal), saa 2 · 1,01 + 16,00 giver
   praecis 18,02. Svarene regnes af modellen; intet facit er skrevet i
   haanden. Opgaverne paa fane 2 er de fem fra den gamle c5.5 (kul,
   methan, Haber-Bosch og propan; magnesium og saltsyre er flyttet til
   fane 3) plus fotosyntesen, hvor produktet er kendt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele ---------------------------------------
       IUPAC 2021 rundet til to decimaler, som i sc5.1 (S 32,06). */
    D.ATOMMASSE = { H: 101, C: 1201, N: 1401, O: 1600, Mg: 2431, Al: 2698, S: 3206, Cl: 3545, Fe: 5585 };

    /* Formlen skilt ad: "Fe2O3" -> { Fe: 2, O: 3 } */
    D.atomer = function (f) {
        var ud = {}, m, re = /([A-Z][a-z]?)(\d*)/g;
        while ((m = re.exec(f)) !== null) {
            if (!m[1]) break;
            ud[m[1]] = (ud[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
        }
        return ud;
    };

    /* ----- Stofferne ------------------------------------------------------------
       f: formlen med almindelige tal. farve: posens og pulverets farve.
       slags: fast, vaeske eller gas. Farveloese gasser faar en lys, klar pose. */
    var S = {
        Fe:      { f: "Fe", navn: "jern", farve: "#6f737b", slags: "fast" },
        S:       { f: "S", navn: "svovl", farve: "#e3c93a", slags: "fast" },
        FeS:     { f: "FeS", navn: "jern(II)sulfid", farve: "#3e3d3b", slags: "fast" },
        Mg:      { f: "Mg", navn: "magnesium", farve: "#b4b9c1", slags: "fast" },
        MgO:     { f: "MgO", navn: "magnesiumoxid", farve: "#f1f1ec", slags: "fast" },
        Al:      { f: "Al", navn: "aluminium", farve: "#c9cdd4", slags: "fast" },
        Al2O3:   { f: "Al2O3", navn: "aluminiumoxid", farve: "#f3f2ee", slags: "fast" },
        Fe2O3:   { f: "Fe2O3", navn: "jern(III)oxid", farve: "#9a3b22", slags: "fast" },
        C:       { f: "C", navn: "carbon", farve: "#2e2f34", slags: "fast" },
        O2:      { f: "O2", navn: "dioxygen", farve: "#dfe8f0", slags: "gas" },
        CO2:     { f: "CO2", navn: "carbondioxid", farve: "#dfe8f0", slags: "gas" },
        H2O:     { f: "H2O", navn: "vand", farve: "#6fb3e6", slags: "vaeske" },
        CH4:     { f: "CH4", navn: "methan", farve: "#dfe8f0", slags: "gas" },
        N2:      { f: "N2", navn: "dinitrogen", farve: "#dfe8f0", slags: "gas" },
        H2:      { f: "H2", navn: "dihydrogen", farve: "#dfe8f0", slags: "gas" },
        NH3:     { f: "NH3", navn: "ammoniak", farve: "#dfe8f0", slags: "gas" },
        C3H8:    { f: "C3H8", navn: "propan", farve: "#dfe8f0", slags: "gas" },
        C6H12O6: { f: "C6H12O6", navn: "glucose", farve: "#f5f1e3", slags: "fast" },
        HCl:     { f: "HCl", navn: "hydrogenchlorid", farve: "#dfe8f0", slags: "gas" },
        MgCl2:   { f: "MgCl2", navn: "magnesiumchlorid", farve: "#eeede8", slags: "fast" },
        Cl2:     { f: "Cl2", navn: "dichlor", farve: "#cfd96a", slags: "gas" },
        AlCl3:   { f: "AlCl3", navn: "aluminiumchlorid", farve: "#efeee4", slags: "fast" }
    };

    Object.keys(S).forEach(function (id) {
        var st = S[id];
        st.id = id;
        st.formel = NK.formel(st.f);
        st.antal = D.atomer(st.f);
        /* Molarmassen i hundrededele og som tal */
        st.M = 0;
        Object.keys(st.antal).forEach(function (g) { st.M += D.ATOMMASSE[g] * st.antal[g]; });
        st.Mv = st.M / 100;
    });
    D.STOFFER = S;
    D.stof = function (id) { return S[id]; };

    /* Molarmassen som paen beregning: "(12,01 + 2 · 16,00) g/mol". Et enkelt
       grundstof uden tal skrives bare "55,85 g/mol". */
    D.molarLed = function (st) {
        var led = Object.keys(st.antal).map(function (g) {
            var a = st.antal[g], m = NK.komma(D.ATOMMASSE[g]);
            return a > 1 ? a + " · " + m : m;
        });
        if (led.length === 1 && st.antal[Object.keys(st.antal)[0]] === 1) return led[0] + " g/mol";
        return "(" + led.join(" + ") + ") g/mol";
    };

    /* ----- Reaktionerne -----------------------------------------------------------
       venstre og hoejre: [stof, koefficient]. */
    var R = [
        { id: "jernsulfid", navn: "Jern og svovl", venstre: [["Fe", 1], ["S", 1]], hoejre: [["FeS", 1]] },
        { id: "magnesiumoxid", navn: "Magnesium brænder", venstre: [["Mg", 2], ["O2", 1]], hoejre: [["MgO", 2]] },
        { id: "aluminiumoxid", navn: "Aluminium brænder", venstre: [["Al", 4], ["O2", 3]], hoejre: [["Al2O3", 2]] },
        { id: "jernoxid", navn: "Jern af jern(III)oxid", venstre: [["Fe2O3", 2], ["C", 3]], hoejre: [["Fe", 4], ["CO2", 3]] },
        { id: "kul", navn: "Kul brænder", venstre: [["C", 1], ["O2", 1]], hoejre: [["CO2", 1]] },
        { id: "ammoniak", navn: "Haber-Bosch", venstre: [["N2", 1], ["H2", 3]], hoejre: [["NH3", 2]] },
        { id: "methan", navn: "Methan brænder", venstre: [["CH4", 1], ["O2", 2]], hoejre: [["CO2", 1], ["H2O", 2]] },
        { id: "propan", navn: "Propan brænder", venstre: [["C3H8", 1], ["O2", 5]], hoejre: [["CO2", 3], ["H2O", 4]] },
        { id: "fotosyntese", navn: "Fotosyntese", venstre: [["CO2", 6], ["H2O", 6]], hoejre: [["C6H12O6", 1], ["O2", 6]] },
        { id: "saltsyre", navn: "Magnesium og saltsyre", venstre: [["Mg", 1], ["HCl", 2]], hoejre: [["MgCl2", 1], ["H2", 1]] },
        { id: "knaldgas", navn: "Knaldgas", venstre: [["H2", 2], ["O2", 1]], hoejre: [["H2O", 2]] },
        { id: "aluminiumchlorid", navn: "Aluminium og dichlor", venstre: [["Al", 2], ["Cl2", 3]], hoejre: [["AlCl3", 2]] }
    ];
    D.REAKTIONER = R.map(function (r) {
        var led = [];
        r.venstre.forEach(function (x) { led.push({ s: x[0], k: x[1], side: 0 }); });
        r.hoejre.forEach(function (x) { led.push({ s: x[0], k: x[1], side: 1 }); });
        return { id: r.id, navn: r.navn, led: led };
    });
    D.reaktion = function (id) {
        for (var i = 0; i < D.REAKTIONER.length; i++) if (D.REAKTIONER[i].id === id) return D.REAKTIONER[i];
        return null;
    };
    /* Ledets plads i reaktionen for et stof */
    D.plads = function (r, s) {
        for (var j = 0; j < r.led.length; j++) if (r.led[j].s === s) return j;
        return -1;
    };

    /* Skemaet som tekst: "4 Al + 3 O₂ ⟶ 2 Al₂O₃". En koefficient paa 1 skrives ikke. */
    D.skema = function (r) {
        var v = [], h = [];
        r.led.forEach(function (l) {
            (l.side === 0 ? v : h).push((l.k > 1 ? l.k + " " : "") + D.stof(l.s).formel);
        });
        return v.join(" + ") + " ⟶ " + h.join(" + ");
    };

    /* Er koefficienterne k afstemt? Giver det foerste grundstof, der ikke passer. */
    D.afstemt = function (r, k) {
        var sum = [{}, {}];
        r.led.forEach(function (l, i) {
            var st = D.stof(l.s);
            Object.keys(st.antal).forEach(function (g) { sum[l.side][g] = (sum[l.side][g] || 0) + st.antal[g] * k[i]; });
        });
        var alle = [];
        [0, 1].forEach(function (sd) { Object.keys(sum[sd]).forEach(function (g) { if (alle.indexOf(g) < 0) alle.push(g); }); });
        /* Raekkefoelgen, man normalt afstemmer i: metallerne, C, N, S, H og O til sidst */
        var orden = ["Mg", "Al", "Fe", "Cl", "C", "N", "S", "H", "O"];
        alle.sort(function (a, b) { return orden.indexOf(a) - orden.indexOf(b); });
        for (var i = 0; i < alle.length; i++) {
            var g = alle[i];
            if ((sum[0][g] || 0) !== (sum[1][g] || 0)) return { ok: false, grundstof: g, v: sum[0][g] || 0, h: sum[1][g] || 0 };
        }
        return { ok: true };
    };

    /* Hintet, naar skemaet skal afstemmes: hvor man begynder */
    D.AFSTEM_HINT = {
        ammoniak: "Der er 2 N i N₂, så der skal 2 NH₃. Tæl så H.",
        methan: "Der er 4 H i CH₄, så der skal 2 H₂O. Tæl så O på højre side.",
        propan: "Start med C: 3 C giver 3 CO₂. Så H: 8 H giver 4 H₂O. Til sidst O.",
        fotosyntese: "Der er 6 C i glucose, så der skal 6 CO₂. Tæl så H og til sidst O."
    };

    /* ----- Tal ------------------------------------------------------------------
       Masser og molarmasser med to decimaler, stofmaengder med tre betydende
       cifre (c5.10 ejer betydende cifre; et svar med flere cifre godkendes). */
    D.tekstMasse = function (g) { return NK.tal2(g); };
    D.tekstMolar = function (st) { return NK.komma(st.M); };
    D.tekstN = function (n) { return NK.betydende(n, 3); };

    /* ======================================================================
       FANE 1: VEJEN
       Et kendt stof paa vaegten til venstre, et soegt stof til hoejre. Det
       andet stof er i overskud. Kun faste stoffer, saa begge kan vejes.
       n: de stofmaengder, opgaven kan starte med. Masserne gaar op i hele
       hundrededele (tjekkes af selvtesten).
       ====================================================================== */
    D.VEJ = [
        { id: "jernsulfid", r: "jernsulfid", kendt: "Fe", soegt: "FeS", n: [1, 2, 3],
          tekst: "Jern varmes med rigeligt svovl. Hvor mange gram jern(II)sulfid dannes der af {m} g jern?" },
        { id: "magnesiumoxid", r: "magnesiumoxid", kendt: "Mg", soegt: "MgO", n: [1, 2, 3],
          tekst: "Magnesium brænder i luft. Hvor mange gram magnesiumoxid dannes der af {m} g magnesium?" },
        { id: "aluminiumoxid", r: "aluminiumoxid", kendt: "Al", soegt: "Al2O3", n: [2, 3, 4],
          tekst: "Aluminiumpulver brænder i luft. Hvor mange gram aluminiumoxid dannes der af {m} g aluminium?" },
        { id: "jernoxid", r: "jernoxid", kendt: "Fe2O3", soegt: "Fe", n: [0.5, 1, 1.5, 2],
          tekst: "Jern(III)oxid varmes med rigeligt kul. Hvor mange gram jern dannes der af {m} g jern(III)oxid?" }
    ];

    /* ======================================================================
       FANE 1 EFTER REGELSAETTET (runde T12, 27. nov. 2026)
       Tre opgaver i raekken oeverst i scenen. Hver opgave er en raekke trin,
       ét felt i skemaet ad gangen, og svaret gives i kortet:
         felt "nK"  stofmaengden af det kendte stof (massen og molarmassen)
         felt "nS"  stofmaengden af det soegte stof (koefficienterne)
         felt "mS"  massen af det soegte stof (stofmaengden og molarmassen)
         felt "reaktion"  et kort trin om den nye reaktion (REGELSAET 42)
       type "valg": tre svar, de forkerte er typiske fejl (REGELSAET 14).
       type "regn": tallet skrives i et felt i kortet; formler: formlen
       vaelges foerst blandt tre knapper (D.FORMLER).
       Teksterne til et felt staar i D.VEJ_TEKST; {K} og {S} er navnene, {Kf}
       og {Sf} formlerne, {m} og {mS} masserne, {MK} og {MS} molarmasserne,
       {nK} og {nS} stofmaengderne og {kK} og {kS} koefficienterne.
       ====================================================================== */
    function broek(op, ned) {
        return '<span class="broek"><span>' + op + "</span><span>" + ned + "</span></span>";
    }
    D.broek = broek;

    D.OPG_VEJ = [
        { id: "jern", navn: "Jern og svovl", vej: "jernsulfid", n: 2,
          trin: [
              { felt: "nK", type: "valg", tekst: "Jern varmes med rigeligt svovl.",
                svar: [{ t: "111,70 mol", nej: "Det er massen af jern i gram. Gram og mol er ikke det samme. Del massen med molarmassen." },
                       { t: "2,00 mol", ok: true },
                       { t: "6238 mol", nej: "Du har ganget massen med molarmassen. Stofmængden er massen delt med molarmassen." }],
                slut: "111,70 g jern er 2,00 mol. På vægten ligger nu to poser med 1 mol jern." },
              { felt: "nS", type: "valg",
                svar: [{ t: "3,15 mol", nej: "Molarmasserne skal ikke bruges her. Det er koefficienterne foran Fe og FeS i reaktionsskemaet, der siger, hvor mange mol der dannes." },
                       { t: "1,27 mol", nej: "Du har delt massen af jern med molarmassen af jern(II)sulfid. Gå i stedet fra mol jern til mol jern(II)sulfid med koefficienterne." },
                       { t: "2,00 mol", ok: true }] },
              { felt: "mS", type: "valg",
                svar: [{ t: "175,82 g", ok: true },
                       { t: "111,70 g", nej: "Det er massen af jern. Jern(II)sulfid vejer mere, for svovlen er også med i stoffet. Gang stofmængden med molarmassen af jern(II)sulfid." },
                       { t: "43,96 g", nej: "Du har delt molarmassen med stofmængden. Massen er stofmængden gange molarmassen." }] }
          ] },
        { id: "jern2", navn: "Mere jern", vej: "jernsulfid", n: 3,
          trin: [
              { felt: "nK", type: "regn", formler: "n" },
              { felt: "nS", type: "regn" },
              { felt: "mS", type: "regn", formler: "m" }
          ] },
        { id: "aluminium", navn: "Aluminium brænder", vej: "aluminiumoxid", n: 2,
          trin: [
              { felt: "reaktion", type: "valg", tekst: "Aluminium brænder i luft og bliver til aluminiumoxid.",
                svar: [{ t: "4 mol", nej: "Der står ikke det samme tal foran Al og Al₂O₃ i reaktionsskemaet. Se på koefficienterne." },
                       { t: "8 mol", nej: "Du har vendt forholdet om. Der står 4 foran Al og 2 foran Al₂O₃, så der dannes færre mol Al₂O₃, end der er Al." },
                       { t: "2 mol", ok: true }],
                slut: "Der står 4 foran Al og 2 foran Al₂O₃. 4 mol aluminium giver 2 mol aluminiumoxid, altså halvt så mange mol." },
              { felt: "nK", type: "regn" },
              { felt: "nS", type: "regn" },
              { felt: "mS", type: "regn" }
          ] }
    ];

    /* Teksterne til hvert felt. Et hint eller en afslutning med lige/ulige
       afhaenger af, om koefficienterne er ens. */
    D.VEJ_TEKST = {
        nK: { spm: "Hvor mange mol {K} er {m} g {K}?",
              hint: ["Stofmængden findes af massen og molarmassen. Begge står i skemaet under {Kf}.",
                     "Molarmassen {MK} g/mol er massen af 1 mol {K}.",
                     "Del massen {m} g med molarmassen {MK} g/mol."],
              slut: "{m} g {K} er {nK} mol." },
        nS: { spm: "Hvor mange mol {S} dannes der af {nK} mol {K}?",
              hint: ["Koefficienterne i reaktionsskemaet gælder stofmængder. Se på tallene foran {Kf} og {Sf}.",
                     { een: "Der står ingen tal foran {Kf} og {Sf}. Så er koefficienten 1, og 1 mol {K} giver 1 mol {S}.",
                       ellers: "{kK} mol {K} giver {kS} mol {S}." },
                     { lige: "Stofmængden af {S} er den samme som stofmængden af {K}.",
                       ulige: "Gang {nK} mol med {kS}, og del med {kK}." }],
              slut: { een: "Der står 1 foran både {Kf} og {Sf}, så {nK} mol {K} giver {nS} mol {S}.",
                      lige: "Koefficienten foran både {Kf} og {Sf} er {kK}, så {nK} mol {K} giver {nS} mol {S}.",
                      ulige: "Forholdet er {kS} : {kK}, så {nK} mol {K} giver {nS} mol {S}." } },
        mS: { spm: "Hvor mange gram er {nS} mol {S}?",
              hint: ["Massen findes af stofmængden og molarmassen af {Sf}. Begge står i skemaet.",
                     "Molarmassen {MS} g/mol er massen af 1 mol {S}.",
                     "Gang stofmængden {nS} mol med molarmassen {MS} g/mol."],
              slut: "{nS} mol {S} vejer {mS} g. Altså giver {m} g {K} {mS} g {S}." },
        reaktion: { spm: "Hvor mange mol {S} dannes der af {kK} mol {K}?",
              hint: ["Tallene foran formlerne i reaktionsskemaet gælder stofmængder.",
                     "Find tallene foran {Kf} og {Sf} i reaktionsskemaet."] }
    };

    /* Formlen foerst (brugeren 25. sept. 2026), valgt blandt tre knapper
       (REGELSAET 14). Broeker med vandret broekstreg (brugeren 24. nov. 2026:
       "aldrig '/' som division"). */
    D.FORMLER = {
        n: { tekst: "Vælg først formlen. Tallet skriver du bagefter.",
             svar: [{ h: "n = m · M", nej: "Massen skal deles med molarmassen, ikke ganges med den." },
                    { h: "n = " + broek("m", "M"), ok: true },
                    { h: "n = " + broek("M", "m"), nej: "Molarmassen er massen af 1 mol. Stofmængden er massen delt med molarmassen, ikke omvendt." }],
             godt: "Formlen er rigtig. Skriv tallet." },
        m: { tekst: "Vælg først formlen. Tallet skriver du bagefter.",
             svar: [{ h: "m = " + broek("n", "M"), nej: "Molarmassen er massen af 1 mol. Massen er stofmængden gange molarmassen." },
                    { h: "m = " + broek("M", "n"), nej: "Jo flere mol, jo større masse. Gang stofmængden med molarmassen." },
                    { h: "m = n · M", ok: true }],
             godt: "Formlen er rigtig. Skriv tallet." }
    };

    /* Den fri leg: alle fire reaktioner fra D.VEJ med nye tal */
    D.VEJ_FRI = {
        pause: "Vælg en reaktion i rækken foroven, og regn selv. Nye tal giver en ny masse.",
        alle: "Du har klaret alle tre opgaver. Vælg en reaktion i rækken foroven, og regn selv, eller gå videre til fanen Skemaet.",
        nye: "Nye tal →"
    };

    /* ======================================================================
       FANE 2: SKEMAET
       givet: stoffet med den kendte masse. spoerg: felterne i den
       raekkefoelge, de laases op i (som den gamle c5.5): "afstem", og
       [stof, raekke] med raekkerne "M", "n" og "m". massebevarelse: alle
       masser findes, og skaalvaegten viser summerne.
       ====================================================================== */
    D.SKEMA = [
        { id: "kul", r: "kul", givet: "C", n: [2, 3, 4, 5, 6, 8],
          tekst: "Kul brænder i rigeligt dioxygen. Du skal ikke regne på O₂. Hvor mange gram CO₂ dannes der af {m} g C?",
          spoerg: [["C", "M"], ["CO2", "M"], ["C", "n"], ["CO2", "n"], ["CO2", "m"]] },
        { id: "ammoniak", r: "ammoniak", givet: "N2", n: [0.5, 1, 1.5, 2], afstem: true,
          tekst: "Ammoniak laves af N₂ og rigeligt H₂. Afstem skemaet, og find massen af NH₃.",
          spoerg: ["afstem", ["N2", "M"], ["NH3", "M"], ["N2", "n"], ["NH3", "n"], ["NH3", "m"]] },
        { id: "methan", r: "methan", givet: "CH4", n: [1, 2, 3], afstem: true, massebevarelse: true,
          tekst: "Methan brænder fuldstændigt. Afstem skemaet, og udfyld alle felterne.",
          spoerg: ["afstem", ["CH4", "M"], ["O2", "M"], ["CO2", "M"], ["H2O", "M"],
                   ["CH4", "n"], ["O2", "n"], ["CO2", "n"], ["H2O", "n"], ["O2", "m"], ["CO2", "m"], ["H2O", "m"]] },
        { id: "propan", r: "propan", givet: "C3H8", n: [1, 2, 3], afstem: true, massebevarelse: true,
          tekst: "Flaskegas er propan. Afstem skemaet, og udfyld alle felterne.",
          spoerg: ["afstem", ["C3H8", "M"], ["O2", "M"], ["CO2", "M"], ["H2O", "M"],
                   ["C3H8", "n"], ["O2", "n"], ["CO2", "n"], ["H2O", "n"], ["O2", "m"], ["CO2", "m"], ["H2O", "m"]] },
        { id: "fotosyntese", r: "fotosyntese", givet: "C6H12O6", n: [0.5, 1, 1.5, 2], afstem: true,
          tekst: "En plante danner glucose. Afstem skemaet først. Hvor mange gram CO₂ skal planten optage for at danne {m} g glucose?",
          spoerg: ["afstem", ["C6H12O6", "M"], ["CO2", "M"], ["C6H12O6", "n"], ["CO2", "n"], ["CO2", "m"]] }
    ];

    /* ======================================================================
       FANE 3: BEGRAENSENDE MAENGDE
       a og b: de to reaktanter med kendt masse. p: produktet, der spoerges
       om. std: tallene foerste gang: det stof, der slipper op (L), hvor
       mange hele saet der reagerer, og hvor mange mol af det andet stof,
       der er til overs. "Nye tal" traekker nye inden for samme rammer.
       ====================================================================== */
    D.BEGR = [
        { id: "jernsulfid", r: "jernsulfid", a: "Fe", b: "S", p: "FeS", std: { L: "S", saet: 2, rest: 1 },
          tekst: "Jern og svovl varmes sammen. Hvor mange gram jern(II)sulfid dannes der af {a} g Fe og {b} g S?" },
        { id: "saltsyre", r: "saltsyre", a: "Mg", b: "HCl", p: "H2", std: { L: "HCl", saet: 1, rest: 0.5 },
          tekst: "Magnesium kommes i saltsyre. Hvor mange gram H₂ dannes der af {a} g Mg og {b} g HCl?" },
        { id: "knaldgas", r: "knaldgas", a: "H2", b: "O2", p: "H2O", std: { L: "H2", saet: 1, rest: 0.5 },
          tekst: "Knaldgas eksploderer. Hvor mange gram vand dannes der af {a} g H₂ og {b} g O₂?" },
        { id: "ammoniak", r: "ammoniak", a: "N2", b: "H2", p: "NH3", std: { L: "H2", saet: 1, rest: 0.5 },
          tekst: "Ammoniak laves af N₂ og H₂. Hvor mange gram NH₃ dannes der af {a} g N₂ og {b} g H₂?" },
        { id: "methan", r: "methan", a: "CH4", b: "O2", p: "CO2", std: { L: "O2", saet: 1, rest: 1 },
          tekst: "Methan brænder i en lukket beholder. Hvor mange gram CO₂ dannes der af {a} g CH₄ og {b} g O₂?" },
        { id: "aluminiumchlorid", r: "aluminiumchlorid", a: "Al", b: "Cl2", p: "AlCl3", std: { L: "Cl2", saet: 1, rest: 1 },
          tekst: "Aluminium reagerer med dichlor. Hvor mange gram aluminiumchlorid dannes der af {a} g Al og {b} g Cl₂?" }
    ];
    /* Hoejst saa mange poser af hvert stof paa bakken */
    D.BEGR_MAKS = 6;

    /* ======================================================================
       LINJEN I OPGAVEKORTET
       Kortet siger, hvor man er (INTRO), naeste skridt, fejl og ros
       (ROS, ROS_OPGAVE, FAERDIG). Hint og svar staar i samme linje, naar
       eleven beder om dem. Hoejst ca. 60 tegn pr. saetning, ingen teori.
       ====================================================================== */
    D.INTRO = {
        vej: "Fra gram til gram går vejen over mol.",
        skema: "Hele skemaet, som det skal stå i en rapport.",
        begr: "Det stof, der slipper op først, afgør, hvor meget der dannes."
    };

    D.FAERDIG = {
        vej: "Alle fire opgaver er løst. Gram, mol, mol, gram er hele vejen.",
        skema: "Alle fem opgaver er løst. Skemaet sidder.",
        begr: "Alle seks opgaver er løst. Noget slipper altid op først."
    };

    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst. Pænt skrevet."];

    NK.Data = D;
}());

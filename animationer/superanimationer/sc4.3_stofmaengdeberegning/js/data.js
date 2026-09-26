/* =====================================================================
   data.js - stofferne, runderne, opgaverne, spoergsmaalene og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   stofferne, de seks runder paa Formlen, de seks opgaver paa Vaegten,
   spoergsmaalene til Hurtigrunden og det, Kemichael siger. Enhederne og
   formlerne tjekkes i tjek.js; tegningen kender kun resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1, sc4.5 og sc5.1) ----------- */
    D.ATOMMASSE = { H: 101, C: 1201, N: 1401, O: 1600, Na: 2299, S: 3206, Cl: 3545, K: 3910, Ca: 4008, Cu: 6355 };

    /* Formlen skilt ad: "Na2CO3" -> { Na: 2, C: 1, O: 3 } */
    D.atomer = function (f) {
        var ud = {}, m, re = /([A-Z][a-z]?)(\d*)/g;
        while ((m = re.exec(f)) !== null) {
            if (!m[1]) break;
            ud[m[1]] = (ud[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
        }
        return ud;
    };

    /* ----- Stofferne ---------------------------------------------------------------
       Alle er faste stoffer, saa de kan staa i en krukke og vejes i en
       vejebaad. kendt: det navn, eleven kender stoffet under. */
    var S = {
        NaCl: { navn: "natriumchlorid", kendt: "køkkensalt", pulver: "#f4f5f7" },
        CaCO3: { navn: "calciumcarbonat", kendt: "kridt", pulver: "#efece4" },
        NaHCO3: { navn: "natriumhydrogencarbonat", kendt: "natron", pulver: "#f7f7f4" },
        CuSO4: { navn: "kobber(II)sulfat", kendt: "", pulver: "#3f8fd8" },
        C6H12O6: { navn: "glukose", kendt: "druesukker", pulver: "#fbf8ef" },
        NaOH: { navn: "natriumhydroxid", kendt: "", pulver: "#f7f7f7" },
        KCl: { navn: "kaliumchlorid", kendt: "", pulver: "#eef0f3" },
        Na2CO3: { navn: "natriumcarbonat", kendt: "soda", pulver: "#fbfbfb" },
        KNO3: { navn: "kaliumnitrat", kendt: "salpeter", pulver: "#f5f5f0" }
    };
    Object.keys(S).forEach(function (id) {
        var st = S[id];
        st.id = id;
        st.formel = NK.formel(id);
        st.antal = D.atomer(id);
        st.M = 0;                       /* i hundrededele */
        Object.keys(st.antal).forEach(function (g) { st.M += D.ATOMMASSE[g] * st.antal[g]; });
        st.Mv = st.M / 100;             /* i g/mol */
    });
    D.STOFFER = S;
    D.stof = function (id) { return S[id]; };

    /* ----- Symbolerne i formlen -------------------------------------------------
       enhed: potenserne af g, mol og L. N, V og c er lokkebrikker: de hoerer
       til andre formler, og eleverne blander dem sammen med n og m. */
    D.SYMBOL = {
        n: { navn: "stofmængde", enhed: { mol: 1 } },
        m: { navn: "masse", enhed: { g: 1 } },
        M: { navn: "molarmasse", enhed: { g: 1, mol: -1 } },
        N: { navn: "antal partikler", enhed: {} },
        V: { navn: "rumfang", enhed: { L: 1 } },
        c: { navn: "koncentration", enhed: { mol: 1, L: -1 } }
    };

    /* Enheden, som den skrives paa en brik og i et svar */
    D.ENHED_TEKST = { n: "mol", m: "g", M: "g/mol" };

    /* ----- Fane 1: Formlen ------------------------------------------------------
       ramme: "broek" (n = □ / □), "linje" (□ = □ □ □ med et regnetegn) eller
       "skriv" (felter i opgavekortet, ingen brikker).
       aabne: de dele, eleven udfylder: formel, navn, enhed. Resten staar.
       brikker: det, der ligger i bunken (hoejst otte).
       skygge: de blege bogstaver i formlen.
       hint og hint2 (trekanten) til knappen; efter: linjen med enhederne. */
    D.FORMEL = [
        { id: "skygge", titel: "Formlen", ramme: "broek", maal: "n", skygge: true,
          aabne: ["formel"], brikker: ["n", "m", "M"],
          tekst: "Byg formlen for stofmængden. Træk brikkerne hen på de blege bogstaver.",
          hint: "De blege bogstaver viser, hvor brikkerne skal hen. Lille m og stort M er to forskellige ting.",
          faerdig: "Stofmængden er massen delt med molarmassen." },
        { id: "navne", titel: "Navnene", ramme: "broek", maal: "n",
          aabne: ["formel", "navn"], brikker: ["n", "m", "M", "N", "stofmængde", "masse", "molarmasse", "antal partikler"],
          tekst: "Byg formlen igen, nu uden de blege bogstaver. Sæt navnene på i skemaet.",
          hint: "Svaret skal være i mol. Massen er i g, og molarmassen er i g/mol. Hvad skal deles med hvad?",
          faerdig: "Lille m er massen. Stort M er molarmassen, massen af 1 mol." },
        { id: "enheder", titel: "Enhederne", ramme: "broek", maal: "n",
          aabne: ["formel", "enhed"], brikker: ["n", "m", "M", "mol", "g", "g/mol", "mol/g", "g · mol"],
          tekst: "Byg formlen, og sæt enhederne på i skemaet.",
          hint: "Svaret skal være i mol. Massen er i g, og molarmassen er i g/mol. Hvad skal deles med hvad?",
          efter: "n",
          faerdig: "Gram går ud med gram. Tilbage er mol." },
        { id: "vend_m", titel: "Find massen", ramme: "linje", maal: "m",
          aabne: ["formel"], brikker: ["m", "n", "M", "·", "/"],
          tekst: "Isolér massen m i n = m / M.",
          hint: "Gang begge sider af n = m / M med M. Så står m alene.",
          trekant: true, efter: "m",
          faerdig: "Mol går ud med mol. Tilbage er gram." },
        { id: "vend_M", titel: "Find molarmassen", ramme: "linje", maal: "M",
          aabne: ["formel"], brikker: ["M", "m", "n", "·", "/"],
          tekst: "Isolér molarmassen M i n = m / M.",
          hint: "Gang begge sider af n = m / M med M, og del så begge sider med n.",
          trekant: true, efter: "M",
          faerdig: "Gram pr. mol. Enheden siger selv, hvad der skal deles med hvad." },
        { id: "hukommelse", titel: "Fra hukommelsen", ramme: "skriv", maal: "n",
          aabne: ["formel", "enhed"], efter: "n",
          tekst: "Ingen brikker. Skriv formlen og enhederne selv.",
          faerdig: "Den sidder. Uden brikker." }
    ];

    /* Brikkerne. slags: sym, navn, enhed eller op */
    D.BRIK = {
        "n": { slags: "sym" }, "m": { slags: "sym" }, "M": { slags: "sym" }, "N": { slags: "sym" },
        "stofmængde": { slags: "navn" }, "masse": { slags: "navn" }, "molarmasse": { slags: "navn" },
        "antal partikler": { slags: "navn" },
        "mol": { slags: "enhed" }, "g": { slags: "enhed" }, "g/mol": { slags: "enhed" },
        "mol/g": { slags: "enhed" }, "g · mol": { slags: "enhed" },
        "·": { slags: "op" }, "/": { slags: "op" }
    };

    /* Hintet, naar formlen er paa plads, men navnene eller enhederne mangler */
    D.HINT_DEL = {
        navn: "Lille m er massen, og stort M er molarmassen. Antallet af partikler er stort N.",
        enhed: "Massen er det, vægten viser. Molarmassen er massen af 1 mol: gram pr. mol."
    };

    /* Hintene i sidste runde, ét pr. felt */
    D.SKRIV = [
        { id: "formel", navn: "Formlen for stofmængden", pre: "n =", hint: "Svaret skal være i mol. Du kender massen i g og molarmassen i g/mol." },
        { id: "n", navn: "Enheden for stofmængden", pre: "n:", hint: "Stofmængden tæller portioner. Én portion er 1 …" },
        { id: "m", navn: "Enheden for massen", pre: "m:", hint: "Massen er det, vægten viser." },
        { id: "M", navn: "Enheden for molarmassen", pre: "M:", hint: "Molarmassen er massen af 1 mol. Gram pr. …" }
    ];

    /* ----- Fane 2: Vaegten ------------------------------------------------------
       trin: n (n = m / M), m (m = n · M) eller M (M = m / n).
       tal: de tal, opgaven starter med (foerste gang), og varianter, som
       Nye tal traekker blandt. I "Find molarmassen" er stoffet ukendt, og
       massen regnes af stofmaengden. I Mesteren er stof2 det andet stof. */
    D.VAEGT = [
        { id: "n1", titel: "Find stofmængden", stof: "NaCl", trin: ["n"],
          tekst: "Du har afvejet {m} g {navn} ({kendt}). Hvor mange mol er det?",
          tal: [{ m: 116.88 }, { m: 29.22 }, { m: 175.32 }, { m: 14.61 }] },
        { id: "n2", titel: "Stofmængden af kridt", stof: "CaCO3", trin: ["n"],
          tekst: "En elev har afvejet {m} g {navn} ({kendt}). Hvor mange mol er det?",
          tal: [{ m: 25.00 }, { m: 12.50 }, { m: 40.00 }, { m: 7.50 }] },
        { id: "m1", titel: "Find massen", stof: "NaHCO3", trin: ["m"],
          tekst: "Til et forsøg skal du bruge {n} mol {kendt}. Hvor mange gram skal du afveje?",
          tal: [{ n: 0.250 }, { n: 0.100 }, { n: 0.500 }, { n: 0.0500 }] },
        { id: "m2", titel: "Massen af kobbersulfat", stof: "CuSO4", trin: ["m"],
          tekst: "Du skal bruge {n} mol {navn}. Hvor mange gram skal du afveje?",
          tal: [{ n: 0.0500 }, { n: 0.200 }, { n: 0.125 }, { n: 0.0250 }] },
        { id: "M", titel: "Find molarmassen", stof: "?", trin: ["M"],
          tekst: "En krukke har mistet sin etiket. {m} g af pulveret er {n} mol. Find molarmassen.",
          tal: [{ ukendt: "KCl", n: 0.200 }, { ukendt: "NaOH", n: 0.250 }, { ukendt: "Na2CO3", n: 0.100 }, { ukendt: "KNO3", n: 0.0500 }] },
        { id: "mester", titel: "Mesteren", stof: "NaCl", stof2: "C6H12O6", trin: ["n", "m"],
          tekst: "Du har {m} g {navn}. Hvor mange gram glukose er den samme stofmængde?",
          tal: [{ m: 29.22 }, { m: 11.69 }, { m: 58.44 }, { m: 87.66 }] }
    ];

    /* Regnetrinene: navnet i raekken, venstresiden, enheden og hintene.
       Det foerste hint til formlen siger, hvad man kender, ikke formlen.
       hint2 er trekanten, naar formlen skal vendes. */
    D.TRIN = {
        n: { navn: "Stofmængden", venstre: "n", enhed: "mol", formel: "m / M",
             formelHint: "Du kender massen i g og molarmassen i g/mol. Svaret skal være i mol." },
        m: { navn: "Massen", venstre: "m", enhed: "g", formel: "n · M", vend: true,
             formelHint: "Du kender stofmængden og molarmassen. Skriv formlen for n, og isolér m." },
        M: { navn: "Molarmassen", venstre: "M", enhed: "g/mol", formel: "m / n", vend: true,
             formelHint: "Du kender massen og stofmængden. Skriv formlen for n, og isolér M." }
    };

    /* Trekanten: Kemichaels ord, naar den kommer frem */
    D.TREKANT = "Dæk det over, du vil finde. Det, der er tilbage, er formlen: ved siden af hinanden ganges, over hinanden deles.";

    /* ----- Fane 3: Hurtigrunden ---------------------------------------------------
       Faste spoergsmaal: svarene med det rigtige foerst (de blandes) og en
       forklaring til hvert forkert. forkl: det, linjen siger, naar svaret
       er rigtigt. slags bestemmer, hvor mange af hver en runde faar. */
    D.RUNDE = { formel: 3, enhed: 2, navn: 1, forkort: 2, tal: 4 };
    D.HURTIG_ANTAL = Object.keys(D.RUNDE).reduce(function (s, k) { return s + D.RUNDE[k]; }, 0);
    D.STRAF = 5;              /* sekunder oven i tiden for et forkert svar eller et hint */

    D.HURTIG = [
        { slags: "formel", spm: "n = ?", svar: ["m / M", "M / m", "m · M"],
          fejl: ["", "Vendt om. Enheden bliver (g/mol) / g = 1/mol.", "Ganget. Enheden bliver g · g/mol = g²/mol."],
          forkl: "n = m / M. Enheden: g / (g/mol) = mol." },
        { slags: "formel", spm: "m = ?", svar: ["n · M", "n / M", "M / n"],
          fejl: ["", "Delt. Enheden bliver mol / (g/mol) = mol²/g.", "Delt. Enheden bliver (g/mol) / mol = g/mol²."],
          forkl: "m = n · M. Enheden: mol · g/mol = g." },
        { slags: "formel", spm: "M = ?", svar: ["m / n", "n / m", "m · n"],
          fejl: ["", "Vendt om. Enheden bliver mol/g.", "Ganget. Enheden bliver g · mol."],
          forkl: "M = m / n. Enheden: g / mol = g/mol." },
        { slags: "formel", spm: "Du kender m og M. Hvilken formel giver n?", svar: ["n = m / M", "n = M / m", "n = m · M"],
          fejl: ["", "Vendt om. Massen står øverst.", "Ganget. Det giver g²/mol, ikke mol."],
          forkl: "n = m / M." },
        { slags: "enhed", spm: "Enheden for molarmasse, M?", svar: ["g/mol", "mol/g", "g · mol", "g"],
          fejl: ["", "Omvendt. Molarmassen er gram pr. mol.", "Molarmassen er gram pr. mol, ikke gange.", "Det er massen. Molarmassen er massen af 1 mol: g/mol."],
          forkl: "Molarmassen er massen af 1 mol: g/mol." },
        { slags: "enhed", spm: "Enheden for stofmængde, n?", svar: ["mol", "g", "g/mol"],
          fejl: ["", "Gram er massen. Stofmængden tæller portioner af 1 mol.", "Det er molarmassen."],
          forkl: "Stofmængden måles i mol." },
        { slags: "enhed", spm: "Enheden for masse, m?", svar: ["g", "mol", "g/mol"],
          fejl: ["", "Mol er stofmængden.", "Det er molarmassen, massen af 1 mol."],
          forkl: "Massen måles i gram." },
        { slags: "navn", spm: "Hvad står stort M for?", svar: ["molarmasse", "masse", "stofmængde", "antal partikler"],
          fejl: ["", "Massen er lille m.", "Stofmængden er n.", "Antallet er N."],
          forkl: "Stort M er molarmassen." },
        { slags: "navn", spm: "Hvad står lille n for?", svar: ["stofmængde", "antal partikler", "masse", "molarmasse"],
          fejl: ["", "Antallet er stort N.", "Massen er lille m.", "Molarmassen er stort M."],
          forkl: "Lille n er stofmængden." },
        { slags: "navn", spm: "Hvad står lille m for?", svar: ["masse", "molarmasse", "stofmængde"],
          fejl: ["", "Molarmassen er stort M.", "Stofmængden er n."],
          forkl: "Lille m er massen." },
        { slags: "forkort", spm: "g / (g/mol) = ?", svar: ["mol", "g²/mol", "1/mol", "g"],
          fejl: ["", "Du har ganget. At dele med g/mol er at gange med mol/g.", "Brøken er vendt om.", "Gram går ud med gram."],
          forkl: "g / (g/mol) = g · mol/g = mol." },
        { slags: "forkort", spm: "mol · g/mol = ?", svar: ["g", "mol", "g/mol", "mol²/g"],
          fejl: ["", "Mol går ud med mol.", "Mol går ud med mol. Tilbage er gram.", "Du har delt i stedet for at gange."],
          forkl: "mol · g/mol = g." },
        { slags: "forkort", spm: "g / mol = ?", svar: ["g/mol", "mol/g", "g · mol"],
          fejl: ["", "Omvendt. Gram står øverst.", "Der skal deles, ikke ganges."],
          forkl: "g / mol = g/mol: massen af 1 mol." }
    ];

    /* Tal til hovedregning: m i g, M i g/mol. Ingen par, hvor M = m, saa
       de forkerte svar aldrig er det samme som det rigtige. */
    D.HURTIG_TAL = [
        { m: 20, M: 40 }, { m: 36, M: 18 }, { m: 100, M: 50 }, { m: 10, M: 40 },
        { m: 60, M: 20 }, { m: 5, M: 10 }, { m: 80, M: 40 }, { m: 50, M: 100 },
        { m: 90, M: 30 }, { m: 12, M: 24 }
    ];

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros. Kemichael blander sig ikke: han siger kun noget ved
       Giv hint og Vis svaret, naar han sendes ud eller hentes, og naar der
       klikkes paa ham eller koppen. */
    D.INTRO = {
        formel: "Formlen for stofmængden bygges af brikker.",
        vaegt: "Vægten deler stoffet i portioner på 1 mol.",
        hurtig: "Tolv spørgsmål på tid. Fejl kommer igen."
    };
    D.FAERDIG = {
        formel: "Alle seks. Formlen sidder, også baglæns.",
        vaegt: "Alle seks. Formlen først, så tallet med enhed."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";

    D.KAFFE = [
        "Kold. Som altid.",
        "Én kop. Hvor mange mol, vil jeg ikke vide.",
        "Den er fra i morges. Tror jeg.",
        "Massen er den samme. Varmen er væk.",
        "Stadig kold. Men det er min."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Byg du.";

    /* Paaskeaegget: to klik paa mol-brikken */
    D.MULDVARP = "Forkert slags mol. På engelsk hedder begge en mole.";

    NK.Data = D;
}());

/* =====================================================================
   data.js - stofferne, opgaverne, spoergsmaalene og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   stofferne, de seks opgaver paa Formlen, de seks opgaver paa Vaegten,
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
       ramme: "broek" (n = □ / □), "linje" (m = □ □ □ med et regnetegn) eller
       "skriv" (felter i opgavekortet, ingen brikker). Det bogstav, der skal
       findes (maal), staar fast paa venstre side; kun i introduktionen er
       det en plads med et blegt bogstav (brugerens oenske 27. sept. 2026:
       en helt fri formel var for uklar).
       aabne: de dele, eleven udfylder: formel, navn, enhed. Resten staar.
       brikker: det, der ligger i bunken (hoejst otte).
       skygge: de blege bogstaver i formlen.
       tekst: linjen over tavlen. om: det, der staar i opgavekortet.
       hint og hint2 (trekanten) til knappen; efter: linjen med enhederne. */
    D.FORMEL = [
        { id: "skygge", titel: "Introduktion", ramme: "broek", maal: "n", skygge: true,
          aabne: ["formel"], brikker: ["n", "m", "M"],
          tekst: "Byg formlen for stofmængden n. Træk brikkerne hen på de blege bogstaver.",
          om: "De seks opgaver her skal hjælpe dig med at lære formlen udenad: først med meget hjælp, til sidst uden.",
          hint: "De blege bogstaver viser, hvor brikkerne skal hen. Lille m og stort M er to forskellige ting.",
          faerdig: "Stofmængden er massen delt med molarmassen." },
        { id: "navne", titel: "Navnene på n, m og M", ramme: "broek", maal: "n",
          aabne: ["formel", "navn"], brikker: ["m", "M", "stofmængde", "masse", "molarmasse", "antal partikler"],
          tekst: "Byg formlen for stofmængden n igen, og sæt navnene på i skemaet.",
          hint: "Svaret skal være i mol. Massen er i g, og molarmassen er i g/mol. Hvad skal stå øverst?",
          faerdig: "Lille m er massen. Stort M er molarmassen, massen af 1 mol." },
        { id: "enheder", titel: "Enhederne for n, m og M", ramme: "broek", maal: "n",
          aabne: ["formel", "enhed"], brikker: ["m", "M", "mol", "g", "g/mol", "mol/g", "g · mol"],
          tekst: "Byg formlen for stofmængden n, og sæt enhederne på i skemaet.",
          hint: "Svaret skal være i mol. Massen er i g, og molarmassen er i g/mol. Hvad skal stå øverst?",
          efter: "n",
          faerdig: "Gram går ud med gram. Tilbage er mol." },
        { id: "vend_m", titel: "Isolér massen m", ramme: "linje", maal: "m",
          aabne: ["formel"], brikker: ["n", "M", "·", "/"],
          tekst: "Isolér massen m i n = m / M. Byg højre side af m = … med brikkerne.",
          hint: "Gang begge sider af n = m / M med M. Så står m alene.",
          trekant: true, efter: "m",
          faerdig: "Mol går ud med mol. Tilbage er gram." },
        { id: "vend_M", titel: "Isolér molarmassen M", ramme: "linje", maal: "M",
          aabne: ["formel"], brikker: ["m", "n", "·", "/"],
          tekst: "Isolér molarmassen M i n = m / M. Byg højre side af M = … med brikkerne.",
          hint: "Gang begge sider af n = m / M med M, og del så begge sider med n.",
          trekant: true, efter: "M",
          faerdig: "Gram pr. mol. Enheden siger selv, hvad der skal deles med hvad." },
        { id: "hukommelse", titel: "Skriv formlen selv", ramme: "skriv", maal: "n",
          aabne: ["formel", "enhed"], efter: "n",
          tekst: "Ingen brikker denne gang. Skriv formlen og enhederne i felterne til højre.",
          om: "Rigtig udenadslære kommer først med mange timers træning. Det her er første skridt.",
          faerdig: "Uden brikker. Resten er træning." }
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

    /* Hintene i sidste opgave, ét pr. felt */
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

    /* Regnetrinene: navnet i raekken, venstresiden, enheden, formlen og
       hintene. Hvert trin har tre dele: formlen, mellemregningen (tallene
       med enheder sat ind, i en broek med to felter eller to felter med et
       gangetegn) og resultatet. Hintene er rettet mod opgaven og giver
       tit halvdelen af svaret (brugerens oenske 27. sept. 2026): formlens
       begyndelse, det foerste tal i mellemregningen, enheden i resultatet.
       I hintene er {a} og {b} de to tal med enhed, {a0} og {b0} de samme
       uden enhed, og {stof} navnet paa stoffet. hint2 er trekanten, naar
       formlen skal vendes.
       led: de to bogstaver i mellemregningen, op: broek eller gange. */
    D.TRIN = {
        n: { navn: "Stofmængden", venstre: "n", enhed: "mol", formel: "m / M", op: "/", led: ["m", "M"],
             formelHint: "Du kender massen og skal finde stofmængden. Formlen begynder sådan: n = m / …",
             indsaetHint: ["Øverst står massen fra opgaven: {a}. Nederst står molarmassen.",
                           "Nederst står molarmassen af {stof}. Den står på krukkens etiket."],
             talHint: "Tast {a0} : {b0} på lommeregneren. Gram går ud med gram, så svaret er i mol." },
        m: { navn: "Massen", venstre: "m", enhed: "g", formel: "n · M", op: "*", led: ["n", "M"], vend: true,
             formelHint: "Du kender stofmængden og skal finde massen. Formlen begynder sådan: m = n · …",
             indsaetHint: ["Først stofmængden: {a}. Den skal ganges med molarmassen.",
                           "Molarmassen af {stof} står på krukkens etiket."],
             talHint: "Tast {a0} · {b0} på lommeregneren. Mol går ud med mol, så svaret er i g." },
        M: { navn: "Molarmassen", venstre: "M", enhed: "g/mol", formel: "m / n", op: "/", led: ["m", "n"], vend: true,
             formelHint: "Du kender massen og stofmængden og skal finde molarmassen. Formlen begynder sådan: M = m / …",
             indsaetHint: ["Øverst står massen fra opgaven: {a}. Nederst står stofmængden.",
                           "Nederst står stofmængden fra opgaven."],
             talHint: "Tast {a0} : {b0} på lommeregneren. Svaret er gram pr. mol: g/mol." }
    };

    /* I Mesteren kommer stofmaengden i anden del fra foerste del. (Trin er
       de tre skridt i hvert regnestykke: formlen, tallene og resultatet.) */
    D.MESTER_HINT = "Brug stofmængden fra del 1: {a}. Den skal ganges med molarmassen af glukose.";

    /* De tre skridt i hvert regnestykke, som de staar i linjen over det */
    D.TRINBAR = ["Formlen", "Tallene ind", "Resultatet"];

    /* Trekanten: Kemichaels ord, naar den kommer frem */
    D.TREKANT = "Dæk det over, du vil finde. Det, der er tilbage, er formlen: ved siden af hinanden ganges, over hinanden deles.";

    /* ----- Fane 3: Hurtigrunden ---------------------------------------------------
       Faste spoergsmaal: svarene med det rigtige foerst (de blandes) og en
       forklaring til hvert forkert. forkl: det, linjen siger, naar svaret
       er rigtigt. slags bestemmer, hvor mange af hver en runde faar. */
    D.RUNDE = { formel: 3, enhed: 2, navn: 1, forkort: 2, tal: 4 };
    D.HURTIG_ANTAL = Object.keys(D.RUNDE).reduce(function (s, k) { return s + D.RUNDE[k]; }, 0);
    /* Sekunder oven i tiden. Tallet staar ikke i teksten, kun "tidsstraf"
       (brugerens oenske 27. sept. 2026: 10 s for et forkert svar). */
    D.STRAF = 10;             /* et forkert svar eller Vis svaret */
    D.STRAF_HINT = 5;         /* et hint */

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
       Giv hint og Vis svaret, en kort ros, naar en del er rigtig, naar
       han sendes ud eller hentes, og naar der klikkes paa ham eller koppen. */
    D.INTRO = {
        formel: "Formlen for stofmængden bygges af brikker.",
        vaegt: "Vægten deler stoffet i portioner på 1 mol.",
        hurtig: "Tolv spørgsmål på tid. Fejl kommer igen."
    };
    D.FAERDIG = {
        formel: "Alle seks. Træn videre på Vægten og i Hurtigrunden.",
        vaegt: "Alle seks. Formlen først, så tallet med enhed."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    /* En del er rigtig (brugerens oenske 29. sept. 2026: det skal vaere
       tydeligt, at man har skrevet den rigtige formel). Linjen i kortet
       siger DEL_OK foran naeste skridt, og Kemichael siger en kort ros
       (ROS_K), der selv gaar igen efter ROS_TID sekunder. enhed1 er én
       enhed skrevet i sidste opgave paa Formlen, indsaet mellemregningen
       og tal resultatet paa Vaegten. */
    D.DEL_OK = {
        formel: "Formlen er rigtig.", navn: "Navnene er rigtige.", enhed: "Enhederne er rigtige.",
        enhed1: "Enheden er rigtig.", indsaet: "Mellemregningen er rigtig.", tal: "Resultatet er rigtigt."
    };
    D.ROS_K = {
        formel: ["Rigtig formel. Godt.", "Flot. Formlen er rigtig.", "Rigtig formel. Den skal du bruge tit."],
        navn: ["Rigtige navne. Godt.", "Flot. Navnene er rigtige."],
        enhed: ["Rigtige enheder. Godt.", "Flot. Enhederne er rigtige."],
        enhed1: ["Rigtig enhed.", "Ja. Den enhed er rigtig."],
        indsaet: ["Rigtige tal på de rigtige pladser.", "Flot. Mellemregningen er rigtig."],
        tal: ["Rigtigt resultat, og med enhed. Godt.", "Flot. Resultatet er rigtigt."]
    };
    D.ROS_TID = 3.2;

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

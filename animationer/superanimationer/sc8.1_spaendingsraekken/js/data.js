/* =====================================================================
   data.js - tekster, maal, opgaver og replikker

   Alt, man kan rette i uden at roere koden: stængerne og glassene paa
   fane 1, maalene med spoergsmaalene, de tolv opgaver paa fane 3 og
   Kemichaels replikker. Beskederne til elevens fejl bygges her ud fra
   modellen i js/kemi.js, saa de passer til netop det par.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var D = {};

    /* ----- Fane 1: forsoeget ---------------------------------------------- */
    D.STAENGER = ["Mg", "Zn", "Fe", "Cu", "Ag"];
    D.GLAS = ["Mg", "Zn", "Fe", "Cu", "Ag", "H"];

    /* Sekunder i glasset, foer forsoeget staar i skemaet */
    D.SYNLIG = 1.5;

    /* Det, man ser, naar et metal saetter sig paa stangen */
    D.BELAEG = {
        Cu: "stangen bliver brun",
        Ag: "der vokser grå krystaller på stangen",
        Fe: "stangen bliver sort",
        Zn: "stangen bliver grå",
        Ni: "stangen bliver sort",
        Sn: "der vokser grå krystaller på stangen",
        Pb: "der vokser grå krystaller på stangen",
        Au: "stangen bliver brun",
        Mg: "stangen bliver grå",
        Al: "stangen bliver grå"
    };

    /* Farvede ioner: ubestemt og bestemt form */
    D.FARVE = { Cu: "blå", Ni: "grøn", Fe: "svagt grøn", Au: "gul" };
    D.FARVE_BEST = { Cu: "blå", Ni: "grønne", Fe: "svagt grønne", Au: "gule" };

    /* Det, der sker i glasset, som en saetning uden stort begyndelsesbogstav */
    D.iagttagelse = function (m, i) {
        if (!K.reagerer(m, i)) return "intet sker";
        var dele = [K.STOF[i].gas ? "der kommer bobler" : D.BELAEG[i]];
        if (D.FARVE[i] && D.FARVE[m]) dele.push("væsken går fra " + D.FARVE[i] + " til " + D.FARVE[m]);
        else if (D.FARVE[i]) dele.push("den " + D.FARVE_BEST[i] + " farve bliver svagere");
        else if (D.FARVE[m]) dele.push("væsken bliver " + D.FARVE[m]);
        return dele.join(", og ");
    };

    /* Maalene paa fane 1. Et maal med stang og glas er naaet, naar det
       par har vaeret i glasset i D.SYNLIG sekunder (ogsaa foer maalet
       kom frem). stang: null betyder en hvilken som helst stang.
       Efter maalet kommer spoergsmaalet om det, man saa. */
    D.MAAL = [
        {
            id: "zn-cu", stang: "Zn", glas: "Cu",
            tekst: "Sæt zinkstangen i glasset med Cu²⁺.",
            hint: "Tag fat i stangen med Zn, og slip den over det blå glas.",
            spm: "Hvad sætter sig på zinkstangen?",
            valg: ["Kobber", "Rust", "Zink, der har skiftet farve"],
            rigtig: 0,
            forkert: [null,
                "Rust kræver ilt og tager dage. Se i luppen, hvad der sætter sig.",
                "Zinken går i opløsning. Se i luppen, hvad der sætter sig i stedet."],
            spmHint: "Se i luppen, hvad Cu²⁺ bliver til, når de rammer stangen.",
            efter: "Kobberionerne optager elektroner fra zink og bliver til kobber på stangen."
        },
        {
            id: "cu-ag", stang: "Cu", glas: "Ag",
            tekst: "Sæt kobberstangen i glasset med Ag⁺.",
            hint: "Tag fat i stangen med Cu, og slip den over glasset med Ag⁺.",
            spm: "Væsken bliver blå. Hvor kommer farven fra?",
            valg: ["Kobberioner fra stangen", "Sølvnitrat bliver blåt, når det står", "Sølvet på stangen"],
            rigtig: 0,
            forkert: [null,
                "Glasset med Ag⁺ var klart, før stangen kom i. Se i luppen, hvad der forlader stangen.",
                "Sølvet sidder på stangen og er gråt. Se i luppen, hvad der forlader stangen."],
            spmHint: "Se i luppen, hvad kobberatomerne bliver til, når de forlader stangen.",
            efter: "Kobber afgiver elektroner og går i opløsning som Cu²⁺. Det er Cu²⁺, der er blå."
        },
        {
            id: "ag-cu", stang: "Ag", glas: "Cu",
            tekst: "Sæt sølvstangen i glasset med Cu²⁺.",
            hint: "Tag fat i stangen med Ag, og slip den over det blå glas.",
            spm: "Intet sker. Hvad gør kobberionerne i luppen?",
            valg: ["De støder ind i sølvet og svømmer videre", "De sætter sig på sølvet", "De tager elektroner fra sølvet"],
            rigtig: 0,
            forkert: [null,
                "Se efter i luppen. Der kommer intet kobber på stangen.",
                "Så ville de blive til kobber. Se efter i luppen."],
            spmHint: "Følg en af de blå ioner i luppen, når den rammer stangen.",
            efter: "Sølv afgiver ikke elektroner til kobberionerne. Det gjorde zink."
        },
        {
            id: "syre", stang: null, glas: "H",
            tekst: "Find en stang, der giver bobler i saltsyren (H⁺).",
            hint: "Prøv stængerne én ad gangen i glasset med H⁺. Ikke alle giver bobler.",
            spm: "Hvad er boblerne?",
            valg: ["Hydrogen, H₂", "Oxygen, O₂", "Vanddamp, fordi syren koger"],
            rigtig: 0,
            forkert: [null,
                "Der er ingen O₂ i luppen. Se, hvad H⁺ bliver til.",
                "Syren er ikke varm. Se i luppen, hvad H⁺ bliver til."],
            spmHint: "Se i luppen, hvad to H⁺ bliver til, når de har fået hver sin elektron.",
            efter: "H⁺ optager elektroner fra metallet. To H bliver til ét H₂-molekyle, og det er boblerne."
        },
        {
            id: "skema",
            tekst: "Prøv resten, så skemaet bliver fyldt ud.",
            hint: "De tomme felter i skemaet mangler. Hver stang skal i hvert glas, undtagen sit eget metal."
        }
    ];

    /* ----- Fane 2: raekken -------------------------------------------------- */
    D.RAEKKEN = ["Mg", "Zn", "Fe", "H", "Cu", "Ag"];

    D.RK_PROMPT = "Stil de seks på hylden i rækkefølge, fra uædel til ædel.";
    D.RK_HINT = "Et metal står til venstre for de metaller, hvis ioner det reagerer med. Tæl fluebenene i hver række i skemaet.";
    D.RK_FAERDIG = "Rigtigt. Øverst står rækken, som den står i bogen. Dine seks har deres pladser i den.";

    /* Beskeden, naar r staar til hoejre for l, men skulle staa til
       venstre for det. set: har eleven set forsoeget paa fane 1? */
    D.rkForkert = function (l, r, set) {
        var prov = set ? "" : " Prøv det på fane 1.";
        if (l === "H") {
            return K.Navn(r) + " står til højre for H. Men " + K.navn(r) + " giver bobler i saltsyren, så " +
                K.navn(r) + " skal stå til venstre for H." + prov;
        }
        if (r === "H") {
            return "H står til højre for " + K.navn(l) + ". Men " + K.navn(l) + " giver ingen bobler i saltsyren, så H skal stå til venstre for " +
                K.navn(l) + "." + prov;
        }
        return K.Navn(r) + " står til højre for " + K.navn(l) + ". Men " + K.navn(r) + " " + (set ? "reagerede" : "reagerer") + " med " +
            K.ionerne(l) + ", så " + K.navn(r) + " skal stå til venstre." + prov;
    };

    /* ----- Fane 3: forudsig --------------------------------------------------
       De foerste tolv opgaver, fra det lette til det svaere: [stang, oploesning].
       Bagefter kommer tilfaeldige par fra K.alleOpgaver(). */
    D.OPGAVER = [
        ["Ni", "Cu"], ["Pb", "Zn"], ["Zn", "Ag"], ["Cu", "H"],
        ["Mg", "H"], ["Au", "Ag"], ["Fe", "Sn"], ["Al", "Cu"],
        ["Sn", "Al"], ["Pb", "Ag"], ["Al", "H"], ["Cu", "Au"]
    ];

    D.opgaveTekst = function (m, i) {
        return K.Navn(m) + " i " + K.STOF[i].salt + ".";
    };

    D.FU_SPM = "Sker der noget?";
    D.FU_VALG = ["Ja, der sker en reaktion", "Nej, intet sker"];

    D.fuHint = function (m, i) {
        return "Find " + m + " og " + (i === "H" ? "H" : i) + " i rækken foroven. Står stangens metal til venstre for ionernes?";
    };

    /* Svaret paa forudsigelsen. rigtigt: gaettede eleven rigtigt? */
    D.fuSvar = function (m, i, rigtigt) {
        var ja = K.reagerer(m, i);
        var hvem = i === "H" ? "H" : K.navn(i);
        if (ja) {
            return (rigtigt ? "Rigtigt. " : "Der skete noget. ") + K.Navn(m) + " står til venstre for " + hvem + " i rækken, så " +
                K.navn(m) + " afgiver elektroner til " + K.ionerne(i) + ".";
        }
        return (rigtigt ? "Rigtigt. " : "Intet skete. ") + K.Navn(m) + " står til højre for " + hvem + " i rækken, så " +
            K.navn(m) + " kan ikke afgive elektroner til " + K.ionerne(i) + ".";
    };

    D.PRODUKT_SPM = "Hvad dannes? Klik på de to stoffer.";

    D.produktHint = function (r) {
        return "Metallet afgiver elektroner og bliver til en ion. " +
            (r.gas ? "H⁺ optager elektroner og bliver til hydrogen." : "Ionerne optager elektroner og bliver til metal.");
    };

    /* Et forkert stof. slags: "m" (stangen selv), "i" (ionen selv), "h" (H som atomer) */
    D.produktForkert = function (r, slags) {
        if (slags === "m") return r.m + "(s) er stangen, som den var. " + K.Navn(r.m) + " afgiver elektroner. Hvad bliver " + K.navn(r.m) + " så til?";
        if (slags === "i") return K.ion(r.i) + " var i glasset før. Ionerne optager elektroner. Hvad bliver de så til?";
        return "Hydrogen findes som molekyler med to atomer.";
    };

    D.KOEF_SPM = "Afstem. Skriv, hvor mange der er af hvert stof, også 1.";

    D.koefHint = function (r) {
        var t = K.Navn(r.m) + " afgiver " + r.a + " e⁻. Hver " + K.ion(r.i) + " optager " + r.b + " e⁻.";
        if (r.gas) t += " To H bliver til ét H₂.";
        return t + " Hvor mange af hver, før der er lige mange elektroner begge veje?";
    };

    function plus(q) { return q > 0 ? "+" + q : String(q); }

    D.koefBesked = function (r, svar) {
        switch (svar.kode) {
        case "tom":
            return "Skriv et tal i alle fire felter.";
        case "atomM":
            return "Der er " + svar.v + " " + r.m + " før pilen og " + svar.h + " efter.";
        case "atomI":
            if (r.gas) return "Der er " + svar.v + " H før pilen og " + svar.h + " efter. H₂ har to.";
            return "Der er " + svar.v + " " + r.i + " før pilen og " + svar.h + " efter.";
        case "ladning":
            return "Atomerne passer, men ladningen gør ikke: " + plus(svar.v) + " før pilen og " + plus(svar.h) +
                " efter. Der skal afgives lige så mange elektroner, som der optages.";
        case "forkort":
            return "Forholdet er rigtigt, men alle tal kan deles med " + svar.g + ". Brug de mindste hele tal.";
        default:
            return D.elektronTekst(r);
        }
    };

    /* "2 Al afgiver 6 e⁻, og 3 Cu²⁺ optager 6 e⁻." */
    D.elektronTekst = function (r) {
        return r.koef[0] + " " + r.m + " afgiver " + r.e + " e⁻, og " + r.koef[1] + " " + K.ion(r.i) + " optager " + r.e + " e⁻.";
    };

    /* ----- Kemichael ------------------------------------------------------------ */
    D.INTRO_FORSOEG = [
        "Forsøget. Fem metalstænger og seks glas med ioner.",
        "Træk en stang ned i et glas, og se i luppen.",
        "Stængerne er pudset. Det tog hele frikvarteret."
    ];
    D.INTRO_RAEKKEN = [
        "Rækken. Metallerne og hydrogen skal stå i rækkefølge.",
        "Træk dem op på hylden. Skemaet fra forsøget hjælper.",
        "Hydrogen er ikke et metal. Den står der alligevel."
    ];
    D.INTRO_FORUDSIG = [
        "Forudsig. Rækken hænger foroven, som i bogen.",
        "Svar i panelet. Så kommer stangen ned i glasset.",
        "Guldstangen er lånt. Den skal tilbage i morgen."
    ];

    D.ROS_FORSOEG = "Hele skemaet. Stængerne skal pudses igen.";
    D.ROS_RAEKKEN = "Rækken står. Så kan du spare stængerne.";
    D.ROS_FORUDSIG = "Tolv reaktioner. Guldet er stadig helt.";

    /* Paaskeaegget: en stang sluppet over hans kaffe */
    D.AEG_KAFFE = "Ikke i kaffen. Den er sur nok i forvejen.";

    NK.Data = D;
}());

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
        var dele = [K.STOF[i].gas ? "der kommer bobler, og stangen bliver tyndere" : D.BELAEG[i]];
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
                "Rust kræver dioxygen og tager dage. Se i luppen, hvad der sætter sig.",
                "Zinken går i opløsning. Se i luppen, hvad der sætter sig i stedet."],
            spmHint: "Se i luppen, hvad Cu²⁺-ionerne bliver til, når de rammer stangen.",
            efter: "Kobber(II)ionerne optager elektroner fra zink og bliver til kobber på stangen."
        },
        {
            id: "cu-ag", stang: "Cu", glas: "Ag",
            tekst: "Sæt kobberstangen i glasset med Ag⁺.",
            hint: "Tag fat i stangen med Cu, og slip den over glasset med Ag⁺.",
            spm: "Væsken i glasset med Ag⁺ bliver blå. Hvor kommer farven fra?",
            valg: ["Kobber(II)ioner fra stangen", "Sølv(I)nitrat bliver blåt med tiden", "Sølvet på stangen"],
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
            spm: "Der sker intet i glasset med Cu²⁺. Hvad gør kobber(II)ionerne i luppen?",
            valg: ["De støder ind i sølvet og svømmer videre", "De sætter sig på sølvet", "De tager elektroner fra sølvet"],
            rigtig: 0,
            forkert: [null,
                "Se efter i luppen. Der kommer intet kobber på stangen.",
                "Kobber(II)ionerne ville blive til kobber, hvis de tog elektroner. Se efter i luppen."],
            spmHint: "Følg en af de blå ioner i luppen, når den rammer stangen.",
            efter: "Kobber(II)ionerne optager elektroner fra zink, men ikke fra sølv."
        },
        {
            id: "syre", stang: null, glas: "H",
            tekst: "Find en stang, der giver bobler i saltsyren (H⁺).",
            hint: "Prøv stængerne én ad gangen i glasset med H⁺. Ikke alle giver bobler.",
            spm: "Hvad er boblerne i saltsyren?",
            valg: ["Dihydrogen, H₂", "Dioxygen, O₂", "Vanddamp, fordi syren koger"],
            rigtig: 0,
            forkert: [null,
                "Der er ingen O₂ i luppen. Se, hvad H⁺ bliver til.",
                "Syren er ikke varm. Se i luppen, hvad H⁺ bliver til."],
            spmHint: "Se i luppen, hvad to H⁺ bliver til, når de har fået hver sin elektron.",
            efter: "H⁺ optager elektroner fra metallet. To H bliver til ét H₂-molekyle, og det er boblerne."
        },
        {
            id: "skema",
            tekst: "Prøv alle stænger i alle glas, så skemaet bliver fyldt ud.",
            hint: "Hvert tomt felt i skemaet er et forsøg, der mangler. Hver stang skal i alle glas undtagen glasset med ioner af samme metal."
        }
    ];

    /* ----- Fane 2: raekken -------------------------------------------------- */
    D.RAEKKEN = ["Mg", "Zn", "Fe", "H", "Cu", "Ag"];

    D.RK_PROMPT = "Stil de seks kort på hylden i rækkefølge, fra uædel til ædel.";
    D.RK_HINT = "Et metal står til venstre for de metaller, hvis ioner det reagerer med. Tæl fluebenene i hver række i skemaet.";
    D.RK_FAERDIG = "Øverst i scenen står nu spændingsrækken med flere metaller. Dine seks stoffer har deres pladser i den.";

    /* Beskeden, naar r staar til hoejre for l, men skulle staa til
       venstre for det. set: har eleven set forsoeget paa fane 1? */
    D.rkForkert = function (l, r, set) {
        var prov = set ? "" : " Prøv forsøget på fane 1.";
        if (l === "H") {
            return K.Navn(r) + " står til højre for H. Men " + K.navn(r) + " giver bobler i saltsyren, så " +
                K.navn(r) + " skal stå til venstre for H." + prov;
        }
        if (r === "H") {
            return "H står til højre for " + K.navn(l) + ". Men " + K.navn(l) + " giver ingen bobler i saltsyren, så H skal stå til venstre for " +
                K.navn(l) + "." + prov;
        }
        return K.Navn(r) + " står til højre for " + K.navn(l) + ". Men " + K.navn(r) + " " + (set ? "reagerede" : "reagerer") + " med " +
            K.ionerne(l) + ", så " + K.navn(r) + " skal stå til venstre for " + K.navn(l) + "." + prov;
    };

    /* ----- Fane 3: forudsig --------------------------------------------------
       De foerste tolv opgaver, fra det lette til det svaere: [stang, oploesning].
       Bagefter kommer tilfaeldige par fra K.alleOpgaver(). */
    D.OPGAVER = [
        ["Fe", "Cu"], ["Pb", "Zn"], ["Zn", "Ag"], ["Cu", "H"],
        ["Mg", "H"], ["Au", "Ag"], ["Zn", "Pb"], ["Al", "Cu"],
        ["Fe", "Al"], ["Pb", "Ag"], ["Al", "H"], ["Cu", "Au"]
    ];

    D.opgaveTekst = function (m, i) {
        return K.Navn(m) + " i " + K.STOF[i].salt + ".";
    };

    D.FU_SPM = "Sker der noget?";
    D.FU_VALG = ["Ja, der sker en reaktion", "Nej, intet sker"];

    D.fuHint = function (m, i) {
        return "Find " + m + " og " + (i === "H" ? "H" : i) + " i rækken foroven. Står stangens metal til venstre for ionernes metal?";
    };

    /* Svaret paa forudsigelsen. rigtigt: gaettede eleven rigtigt? */
    D.fuSvar = function (m, i, rigtigt) {
        var ja = K.reagerer(m, i);
        var hvem = i === "H" ? "H" : K.navn(i);
        if (ja) {
            return (rigtigt ? "Rigtigt. " : "Der skete en reaktion. ") + K.Navn(m) + " står til venstre for " + hvem + " i rækken, så " +
                K.navn(m) + " afgiver elektroner til " + K.ionerne(i) + ".";
        }
        return (rigtigt ? "Rigtigt. " : "Der skete ingen reaktion. ") + K.Navn(m) + " står til højre for " + hvem + " i rækken, så " +
            K.navn(m) + " kan ikke afgive elektroner til " + K.ionerne(i) + ".";
    };

    D.PRODUKT_SPM = "Hvad dannes? Vælg de to stoffer.";

    D.produktHint = function (r) {
        return "Metallet afgiver elektroner og bliver til en ion. " +
            (r.gas ? "H⁺ optager elektroner og bliver til dihydrogen." : "Ionerne optager elektroner og bliver til metal.");
    };

    /* Et forkert stof. slags: "m" (stangen selv), "i" (ionen selv), "h" (H som atomer) */
    D.produktForkert = function (r, slags) {
        if (slags === "m") return r.m + "(s) er stangen, som den var. " + K.Navn(r.m) + " afgiver elektroner. Hvad bliver " + K.navn(r.m) + " så til?";
        if (slags === "i") return K.ion(r.i) + " var i glasset før. Ionerne optager elektroner. Hvad bliver de så til?";
        return "Gassen dihydrogen, H₂, består af molekyler med to atomer.";
    };

    D.KOEF_SPM = "Afstem reaktionen. Skriv, hvor mange der er af hvert stof, også 1.";

    D.koefHint = function (r) {
        var t = "Hvert " + K.navn(r.m) + "atom afgiver " + r.a + " e⁻. Hver " + K.ion(r.i) + " optager " + r.b + " e⁻.";
        if (r.gas) t += " To H bliver til ét H₂.";
        return t + " Hvor mange skal der være af hver, så der afgives lige så mange elektroner, som der optages?";
    };

    function plus(q) { return q > 0 ? "+" + q : String(q); }

    D.koefBesked = function (r, svar) {
        switch (svar.kode) {
        case "tom":
            return "Skriv et tal i alle fire felter.";
        case "atomM":
            return "Der er " + svar.v + " " + r.m + " før pilen og " + svar.h + " efter.";
        case "atomI":
            if (r.gas) return "Der er " + svar.v + " H før pilen og " + svar.h + " efter. Hvert H₂ har to H.";
            return "Der er " + svar.v + " " + r.i + " før pilen og " + svar.h + " efter.";
        case "ladning":
            return "Atomerne passer, men ladningen er " + plus(svar.v) + " før pilen og " + plus(svar.h) +
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

    /* ----- Kemichael ------------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (CSS-
       selectorer; felterne paa laerredet er de usynlige .anker fra
       rundvisningen). Ingen vittigheder i praesentationen. */
    D.INTRO_FORSOEG = [
        { tekst: "I denne fane undersøger du, hvilke metaller der reagerer med hvilke metalioner. Du trækker en metalstang ned i et af glassene og ser, om der sker en reaktion. Fem glas indeholder metalioner, og det sjette indeholder saltsyre. Skiltet under hvert glas viser, hvad glasset indeholder.",
          sel: ["#fs-anker-holder", "#fs-anker-glas"] },
        { tekst: "Luppen viser metalstangen og ionerne i opløsningen helt tæt på. Du vælger, hvilket glas luppen viser, ved at klikke på glasset.",
          sel: "#fs-anker-lup" },
        { tekst: "Kortet øverst i scenen fortæller, hvad du skal undersøge, og knappen Giv hint på kortet giver et hint. Hvert forsøg bliver skrevet ind i skemaet i panelet, hvor et flueben betyder, at der skete en reaktion.",
          sel: ["#fs-skort", "#fs-skemakort"] }
    ];
    D.INTRO_RAEKKEN = [
        { tekst: "I denne fane stiller du de fem metaller og hydrogen i rækkefølge, fra det mest uædle til det mest ædle. Rækkefølgen skal du finde ud fra dine egne forsøg i fane 1." },
        { tekst: "Du trækker kortene med de seks stoffer op på hylden, som har én plads til hvert kort. Det mest uædle stof skal stå længst til venstre.",
          sel: ["#rk-anker-kort", "#rk-anker-hylde"] },
        { tekst: "Skemaet viser resultaterne af dine forsøg fra fane 1. Rækkefølgen bliver tjekket, når alle seks kort står på hylden, og du trykker på Indsend svar. Knappen Giv hint på kortet øverst i scenen giver et hint.",
          sel: ["#rk-skemakort", "#rk-skort"] }
    ];
    D.INTRO_FORUDSIG = [
        { tekst: "I denne fane bruger du spændingsrækken til at forudsige, om der sker en reaktion, når en metalstang kommer ned i en opløsning. I spændingsrækken står de uædle metaller til venstre.",
          sel: "#fu-anker-raekke" },
        { tekst: "Du svarer ja eller nej på kortet øverst i scenen og trykker på Indsend svar, før metalstangen kommer ned i glasset. Bagefter kan du selv se, om du havde ret.",
          sel: ["#fu-skort", "#fu-anker-glas"] },
        { tekst: "Sker der en reaktion, vælger du på kortet de stoffer, der dannes, og afstemmer reaktionen i skemaet på kortet. Luppen viser imens, hvad der sker med elektronerne.",
          sel: ["#fu-skort", "#fu-anker-lup"] }
    ];

    /* Ros, foerste gang en hel fane er klaret. Det er de eneste gange,
       han kommer ind af sig selv (brugerens regel 4. nov. 2026). */
    D.ROS_FORSOEG = "Du har udført alle 25 forsøg. Skemaet er nu klar til fane 2, hvor du stiller metallerne i rækkefølge.";
    D.ROS_RAEKKEN = "Rækkefølgen er rigtig. Du har selv fundet spændingsrækken ud fra dine egne forsøg.";
    D.ROS_FORUDSIG = "Du har løst alle tolv opgaver og kan nu bruge spændingsrækken til at forudsige reaktioner.";

    /* Paaskeaegget: en stang sluppet over hans kaffe */
    D.AEG_KAFFE = "Metalstangen skal ikke ned i min kaffe. Kaffen er sur nok i forvejen.";

    NK.Data = D;
}());

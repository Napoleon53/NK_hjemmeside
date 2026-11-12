/* =====================================================================
   data.js - opgaverne, trinnene, teksterne og tallene

   Alt, der kan staa som data, staar her. Ordene er Kemibogens (afsnit
   B7.8 Proteiner): peptidbinding, kondensation, der fraspaltes vand,
   N-enden og C-enden, rækkefølgen skrives fra N-enden, primær,
   sekundær, tertiær og kvaternær struktur, α-helix, β-foldeblad,
   hydrogenbindinger, ionbindinger, londonbindinger, disulfidbro,
   denaturering og hydrolyse. Sidekaedernes pKₛ-vaerdier (asparaginsyre
   3,65 og lysin 10,53) er de samme som i sb7.7 Aminosyrer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Farverne er bogens (b7-peptidbinding, b7-proteinstruktur,
             b7-sidekaede-bindinger og b7-hbinding-kaeder) ---------------- */
    D.FARVE = {
        blaek: "#14201f",
        daempet: "#556766",
        groen: "#0f766e",        /* peptidbindingen, roeret og vandet */
        groenLys: "#d7eeea",
        roer: "#1f8f84",
        roerMoerk: "#0b5b54",
        roerLys: "#7fd1c4",
        orange: "#c2410c",       /* den anden kaede (kvaternaer struktur) og R */
        hbind: "#e0533f",        /* hydrogenbindingernes roede prikker */
        O: "#c0392b",
        N: "#1d4ed8",
        H: "#2b59c3",
        S: "#b58a00",
        nende: "#1d4ed8",
        cende: "#a93226",
        hydron: "#b45309"
    };

    /* =====================================================================
       Aminosyrerne. side: sidekaeden i formlen (fane 1), slags: hvordan
       den binder i den tertiaere struktur (fane 2 og 3).
       ===================================================================== */
    D.AMINOSYRER = {
        ala: { id: "ala", navn: "alanin", kort: "Ala", slags: "upolaer" },
        gly: { id: "gly", navn: "glycin", kort: "Gly", slags: "ingen" },
        ser: { id: "ser", navn: "serin", kort: "Ser", slags: "polaer" },
        cys: { id: "cys", navn: "cystein", kort: "Cys", slags: "svovl" },
        lys: { id: "lys", navn: "lysin", kort: "Lys", slags: "basisk", pks: 10.53 },
        val: { id: "val", navn: "valin", kort: "Val", slags: "upolaer" },
        asp: { id: "asp", navn: "asparaginsyre", kort: "Asp", slags: "sur", pks: 3.65 },
        leu: { id: "leu", navn: "leucin", kort: "Leu", slags: "upolaer" }
    };
    D.navn = function (id) { return D.AMINOSYRER[id].navn; };
    D.kort = function (id) { return D.AMINOSYRER[id].kort; };

    /* =====================================================================
       Fane 1: Peptidbindingen. Fire trin.
       ===================================================================== */
    D.OPSKRIFT = ["ala", "gly", "ser", "cys", "lys", "val", "asp", "cys"];
    D.BAKKE = ["lys", "cys", "asp", "val", "cys"];     /* perlerne paa bakken i trin 4 */
    D.vandFor = function (n) { return Math.max(0, n - 1); };   /* én binding og ét vandmolekyle pr. kondensation */

    D.PEPTID = [
        {
            id: "vand", slags: "vand", navn: "Kondensationen",
            tekst: "Carboxylgruppen i alanin reagerer med aminogruppen i glycin, og der fraspaltes vand. Klik på de tre atomer, der bliver til vand, og tryk Indsend svar.",
            hint: ["Et vandmolekyle består af ét O og to H. Carboxylgruppen i alanin afgiver sin OH-gruppe.",
                   "Klik på O og H i OH-gruppen i alanin og på et H i aminogruppen i glycin."],
            fejlCN: "Vand består af O og H. Klik kun på O- og H-atomer.",
            fejlAntal: "Et vandmolekyle har ét O og to H. Du har valgt {antal}.",
            fejlDobbelt: "Det dobbeltbundne O bliver siddende. Det er O i OH-gruppen, der fraspaltes.",
            fejlVendt: "Det er carboxylgruppen i alanin og aminogruppen i glycin, der reagerer. Du har valgt OH-gruppen i glycin og et H i aminogruppen i alanin.",
            fejlOH: "Carboxylgruppen i alanin afgiver sin OH-gruppe, og aminogruppen i glycin afgiver et H.",
            fejlAndet: "OH-gruppen i alanin og et H fra aminogruppen i glycin bliver til vand.",
            forkl: "OH-gruppen i alanin og et H fra glycin fraspaltes som vand. Carbonatomet i alanin binder sig til nitrogenatomet i glycin. Den nye binding er en peptidbinding."
        },
        {
            id: "ende", slags: "ende", navn: "N-enden og C-enden",
            tekst: "Et peptid skrives fra N-enden, enden med den frie aminogruppe. Træk serin hen til den ende af kæden, så tripeptidet hedder Ala-Gly-Ser, og tryk Indsend svar.",
            hint: ["Alanin står ved N-enden. Serin skal stå sidst i navnet.",
                   "Træk serin hen til C-enden til højre, ved glycin."],
            fejlN: "Ved N-enden giver serin tripeptidet Ser-Ala-Gly, for rækkefølgen skrives fra N-enden. Serin skal sidde i den anden ende.",
            fejlIntet: "Træk serin hen til en af enderne af kæden først.",
            forkl: "Serin binder sig til C-enden, og der fraspaltes et vandmolekyle mere. Alanin står ved N-enden og serin ved C-enden, så tripeptidet hedder Ala-Gly-Ser."
        },
        {
            id: "antal", slags: "spm", navn: "Vandet",
            tekst: "Ved dannelsen af Ala-Gly-Ser blev der fraspaltet to vandmolekyler. Hvor mange vandmolekyler fraspaltes i alt, når der dannes en kæde af 8 aminosyrer?",
            svar: ["7", "8", "9"], rigtig: 0,
            fejl: { 1: "Der fraspaltes ét vandmolekyle for hver peptidbinding. Tæl bindingerne mellem 8 aminosyrer.",
                    2: "Tre aminosyrer gav to vandmolekyler. Der fraspaltes ét vandmolekyle for hver peptidbinding." },
            hint: ["Der dannes én peptidbinding mellem to aminosyrer, og for hver binding fraspaltes ét vandmolekyle.",
                   "Mellem 8 aminosyrer på en række er der 7 peptidbindinger."],
            forkl: "En kæde af 8 aminosyrer har 7 peptidbindinger, og hver kondensation fraspalter ét vandmolekyle. Der fraspaltes 7 vandmolekyler."
        },
        {
            id: "kaede", slags: "byg", navn: "Byg kæden",
            tekst: "Generne bestemmer rækkefølgen af aminosyrer. Træk aminosyrerne fra bakken hen til C-enden i den rækkefølge, opskriften viser.",
            hint: ["Den næste aminosyre i opskriften er markeret med gult.",
                   "Træk perlen med det gule navn hen til C-enden af kæden til højre."],
            fejlForkert: "Opskriften har {rigtig} som den næste aminosyre, ikke {valgt}.",
            fejlEnde: "Kæden bygges videre i C-enden, så rækkefølgen passer med opskriften.",
            forkl: "Kæden har 8 aminosyrer og 7 peptidbindinger, og der er fraspaltet 7 vandmolekyler. Rækkefølgen af aminosyrer er proteinets primære struktur."
        }
    ];

    /* =====================================================================
       Fane 2: Foldningen. Fire trin.
       ===================================================================== */
    D.FOLD = [
        {
            id: "blad", slags: "hbind", navn: "Hydrogenbindinger",
            tekst: "To stykker peptidkæde ligger side om side. Tegn alle hydrogenbindingerne mellem de to kæder ved at trække fra et H til et O, og tryk Indsend svar.",
            hint: ["En hydrogenbinding går fra et H på et nitrogenatom til et O i den anden kæde.",
                   "Hvert H og hvert O har en partner lige over for sig i den anden kæde. Der er 6 hydrogenbindinger."],
            fejlSamme: "En hydrogenbinding går mellem et H og et O. To ens atomer danner ikke en hydrogenbinding.",
            fejlKaede: "Tegn hydrogenbindingerne mellem de to kæder.",
            fejlSkaev: "Et H danner en hydrogenbinding til O-atomet lige over for i den anden kæde. En skrå streg er fjernet.",
            fejlMangler: "Der mangler {antal}. Hvert H på et nitrogenatom har et O lige over for sig.",
            fejlIntet: "Træk fra et H til et O i den anden kæde først.",
            forkl: "H på nitrogenatomet i én peptidbinding danner en hydrogenbinding til O i en anden peptidbinding. Kæder, der ligger side om side på den måde, danner et β-foldeblad."
        },
        {
            id: "helix", slags: "helix", navn: "α-helix",
            traekTekst: "Et andet stykke af kæden kan sno sig som en spiral. Skub enden af kæden mod venstre, til kæden er snoet helt sammen.",
            traekHint: ["Træk i den gule ring for enden af kæden til højre.",
                        "Hold musen nede, og træk ringen helt hen til den stiplede streg til venstre."],
            tilbage: "Kæden retter sig ud igen. Skub den helt sammen, så hydrogenbindingerne kan dannes.",
            tekst: "Kæden er snoet til en α-helix. Hvad holder α-helixen sammen?",
            svar: ["Hydrogenbindinger mellem C=O og N−H", "Peptidbindinger mellem vindingerne", "Bindinger mellem sidekæderne"], rigtig: 0,
            fejl: { 1: "Peptidbindingerne holder aminosyrerne sammen i kæden. Mellem vindingerne er der kun de røde prikker.",
                    2: "Sidekæderne peger ud fra spiralen. Bindingerne mellem vindingerne går mellem grupperne i selve kæden." },
            hint: ["De røde prikker mellem vindingerne er samme slags binding som i β-foldebladet.",
                   "De røde prikker er hydrogenbindinger mellem C=O og N−H i peptidbindingerne."],
            forkl: "Hydrogenbindinger mellem C=O og N−H holder vindingerne sammen. α-helix og β-foldeblad er proteinets sekundære struktur."
        },
        {
            id: "tertiaer", slags: "tertiaer", navn: "Tertiær struktur",
            foldTekst: "Spiralen og foldebladet er dele af den samme kæde. Træk spiralen ned mod foldebladet, så sidekæderne mødes.",
            foldHint: ["Tag fat i spiralen øverst, og træk den nedad.",
                       "Slip spiralen, når den ligger lige over foldebladet. Sidekæderne skal mødes parvis."],
            tilbage: "Spiralen glider tilbage. Slip den lige over foldebladet, så sidekæderne mødes.",
            tekst: "Fire bindinger mellem sidekæderne holder kæden foldet. Klik på hver binding, vælg dens navn på kortet, og tryk Indsend svar.",
            navne: ["hydrogenbinding", "ionbinding", "londonbindinger", "disulfidbro"],
            hint: ["To ladede grupper danner en ionbinding, to OH-grupper danner en hydrogenbinding, og to svovlatomer danner en disulfidbro.",
                   "Mellem upolære grupper med kun C og H er der londonbindinger."],
            fejlIntet: "Giv alle fire bindinger et navn først.",
            fejlMangler: "Giv alle fire bindinger et navn. {antal} mangler.",
            fejl: {
                hbind: "Binding {nr} er mellem to OH-grupper fra serin uden ladning. Den er en hydrogenbinding.",
                ion: "Binding {nr} er mellem −NH₃⁺ og −COO⁻, som har hver sin ladning. Den er en ionbinding.",
                london: "Binding {nr} er mellem upolære grupper med kun C og H. Det er londonbindinger.",
                ss: "Binding {nr} er en elektronparbinding mellem to svovlatomer fra cystein. Den er en disulfidbro."
            },
            forkl: "Hydrogenbindinger, ionbindinger, londonbindinger og disulfidbroer mellem sidekæderne holder kæden foldet. Hele kædens foldning er den tertiære struktur."
        },
        {
            id: "kvaternaer", slags: "spm", navn: "Kvaternær struktur",
            tekst: "Hæmoglobin består af fire peptidkæder, som er bundet til hinanden. Hvilket niveau af strukturen beskriver, hvordan de fire kæder sidder sammen?",
            svar: ["Primær", "Sekundær", "Tertiær", "Kvaternær"], rigtig: 3,
            fejl: { 0: "Den primære struktur er rækkefølgen af aminosyrer i én kæde.",
                    1: "Den sekundære struktur er α-helix og β-foldeblad i én kæde.",
                    2: "Den tertiære struktur er foldningen af én kæde." },
            hint: ["De tre første niveauer handler om én kæde.",
                   "Placeringen af flere kæder i forhold til hinanden er det fjerde niveau."],
            forkl: "Kædernes placering i forhold til hinanden er den kvaternære struktur. Hæmoglobin transporterer dioxygen i blodet."
        }
    ];

    /* Bindingerne mellem sidekaederne i den tertiaere struktur (fane 2 og 3),
       fra venstre mod hoejre. oppe er sidekaeden i spiralen, nede i foldebladet. */
    D.KONTAKTER = [
        { id: "ss", navn: "disulfidbro", oppe: "cys", nede: "cys" },
        { id: "ion", navn: "ionbinding", oppe: "lys", nede: "asp" },
        { id: "london", navn: "londonbindinger", oppe: "val", nede: "ala" },
        { id: "hbind", navn: "hydrogenbinding", oppe: "ser", nede: "ser" }
    ];
    D.kontakt = function (id) {
        for (var i = 0; i < D.KONTAKTER.length; i++) if (D.KONTAKTER[i].id === id) return D.KONTAKTER[i];
        return null;
    };

    /* =====================================================================
       Fane 3: Denaturering og hydrolyse. Fire trin.
       ===================================================================== */
    D.T_START = 20;
    D.T_MAKS = 100;
    D.T_DENAT = 60;           /* æggehvidens proteiner denatureres fra ca. 60 °C */
    D.PH_START = 8;           /* frisk æggehvide har pH omkring 8 */
    D.PH_MIN = -1;
    D.PH_MAKS = 15;
    D.PH_SKRIDT = 0.1;
    D.FOLD_UD = 2.0;          /* sekunder om at folde sig ud */
    D.BRYD = 1.1;             /* sekunder, mens de svage bindinger brydes */

    /* Ionbindingen findes, saa laenge −COO⁻ og −NH₃⁺ begge er ladede */
    D.ionHel = function (ph) { return ph >= D.AMINOSYRER.asp.pks && ph <= D.AMINOSYRER.lys.pks; };

    D.DENAT = [
        {
            id: "varme", slags: "varme", navn: "Varme",
            forsoegTekst: "Glasset indeholder æggehvide, som består af vand og proteiner. Hæv temperaturen med skyderen, og se, hvad der sker med proteinet i luppen.",
            forsoegHint: ["Træk knappen på temperaturskyderen mod højre.",
                          "Hæv temperaturen til over 60 °C."],
            tekst: "Proteinet er denatureret. Hvilke bindinger er brudt? Vælg alle, der passer, og tryk Indsend svar.",
            svar: ["Hydrogenbindingerne", "Ionbindingen", "Peptidbindingerne", "Disulfidbroen"], rigtige: [0, 1],
            fejlMangler: "Der er brudt flere bindinger end dem, du har valgt. Se efter de røde prikker og + og − i proteinet.",
            fejl: { 2: "Kæden er hel, så peptidbindingerne er ikke brudt. De er stærke elektronparbindinger.",
                    3: "Den gule disulfidbro sidder der endnu. Den er en elektronparbinding." },
            hint: ["Se på proteinet før og efter. Hvilke bindinger er væk, og hvilke er der endnu?",
                   "De svage bindinger er brudt: hydrogenbindingerne, ionbindingen og londonbindingerne."],
            forkl: "Varmen bryder de svage bindinger, og proteinet mister sin form. Peptidbindingerne og disulfidbroen er elektronparbindinger og er hele. Æggehviden bliver hvid."
        },
        {
            id: "ph", slags: "ph", navn: "pH",
            forsoegTekst: "Et nyt glas æggehvide har pH 8. Sænk eller hæv pH med skyderen, og se, hvad der sker med ionbindingen i proteinet.",
            forsoegHint: ["Træk knappen på pH-skyderen langt mod venstre eller langt mod højre.",
                          "Prøv pH under 3 eller over 11."],
            lav: {
                tekst: "Ved lav pH forsvandt ionbindingen. Hvad skete der med asparaginsyre og lysin i ionbindingen?",
                svar: ["−COO⁻ optog en hydron", "−NH₃⁺ afgav en hydron", "Peptidbindingen blev spaltet"], rigtig: 0,
                fejl: { 1: "Ved lav pH er der mange oxoniumioner i opløsningen, så en gruppe optager en hydron. −NH₃⁺ har allerede optaget en hydron.",
                        2: "Kæden er hel. Se på grupperne med + og − i ionbindingen." },
                forkl: "Ved lav pH optager −COO⁻ i asparaginsyre en hydron og bliver til −COOH uden ladning. Ionbindingen forsvinder, og proteinet folder sig ud."
            },
            hoej: {
                tekst: "Ved høj pH forsvandt ionbindingen. Hvad skete der med asparaginsyre og lysin i ionbindingen?",
                svar: ["−COO⁻ optog en hydron", "−NH₃⁺ afgav en hydron", "Peptidbindingen blev spaltet"], rigtig: 1,
                fejl: { 0: "Ved høj pH er der mange hydroxidioner i opløsningen, så en gruppe afgiver en hydron. −COO⁻ har ingen hydron at afgive.",
                        2: "Kæden er hel. Se på grupperne med + og − i ionbindingen." },
                forkl: "Ved høj pH afgiver −NH₃⁺ i lysin en hydron og bliver til −NH₂ uden ladning. Ionbindingen forsvinder, og proteinet folder sig ud."
            },
            hint: ["Ionbindingen holdes af en positiv og en negativ gruppe. Se, hvilken af dem der mistede sin ladning.",
                   "Den orange kugle er en hydron. Se, om den kom til eller gik fra en gruppe."]
        },
        {
            id: "hydrolyse", slags: "hydrolyse", navn: "Hydrolyse",
            tekst: "Ved en hydrolyse spaltes en peptidbinding af vand. Klik på den binding, der brydes, og tryk Indsend svar.",
            hint: ["Peptidbindingen er bindingen mellem carbonatomet med =O og nitrogenatomet.",
                   "Klik på stregen mellem C og N i den grønne kasse."],
            fejlIntet: "Klik på en af bindingerne i formlen først.",
            fejl: {
                co: "Dobbeltbindingen til O brydes ikke. Vand spalter bindingen mellem C og N.",
                nh: "H bliver siddende på nitrogenatomet. Vand spalter bindingen mellem C og N.",
                nc: "Den binding er inde i aminosyren og brydes ikke. Find bindingen mellem to aminosyrer.",
                cc: "Den binding er inde i aminosyren og brydes ikke. Find bindingen mellem to aminosyrer.",
                cr: "Sidekæden bliver siddende. Find bindingen mellem to aminosyrer."
            },
            forkl: "Vand spalter bindingen mellem C og N. OH fra vandet bindes til carbonatomet, og H til nitrogenatomet. Spaltes alle peptidbindingerne, bliver proteinet til aminosyrer."
        },
        {
            id: "sorter", slags: "sorter", navn: "Denaturering eller hydrolyse",
            tekst: "Ved denaturering mister proteinet sin form, og ved hydrolyse spaltes kæden. Træk hvert eksempel hen i den rigtige kasse, og tryk Indsend svar.",
            kasser: ["Denaturering", "Hydrolyse"],
            brikker: [
                { id: "aeg", t: "Et æg koges", kasse: 0, fejl: "Når et æg koges, brydes de svage bindinger, men kæderne er hele. Det er en denaturering." },
                { id: "maelk", t: "Mælk bliver sur", kasse: 0, fejl: "Når mælk bliver sur, mister proteinerne deres samlede ladning og klumper sammen. Kæderne er hele." },
                { id: "sprit", t: "Håndsprit på huden", kasse: 0, fejl: "Ethanol svækker hydrogenbindingerne og de hydrofobe vekselvirkninger i bakteriernes proteiner. Kæderne er hele." },
                { id: "pepsin", t: "Pepsin i mavesækken", kasse: 1, fejl: "Pepsin er et enzym, som spalter peptidbindingerne. Det er en hydrolyse." },
                { id: "syre", t: "Kogning i stærk syre i timevis", kasse: 1, fejl: "Langvarig kogning med en stærk syre spalter peptidbindingerne. Det er en hydrolyse." }
            ],
            hint: ["Afgør for hvert eksempel, om kæden er hel bagefter, eller om den er spaltet.",
                   "Enzymer i fordøjelsen og langvarig kogning i stærk syre spalter kæden."],
            fejlIntet: "Træk alle fem eksempler hen i en kasse først.",
            fejlMangler: "Træk alle fem eksempler hen i en kasse. {antal} mangler.",
            forkl: "Ved denaturering brydes de svage bindinger, og kæden er hel. Ved hydrolyse spaltes peptidbindingerne, og kæden bliver til aminosyrer."
        }
    ];
    D.DENAT_FRI = "Ændr nu selv temperaturen og pH med skyderne. Knappen Nyt glas æggehvide i panelet giver et nyt glas.";

    /* ----- Smaa hjaelpere -------------------------------------------------------- */
    D.komma1 = function (v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ",").replace("-", "−"); };
    D.flet = function (s, v) {
        return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; });
    };
    D.antalTekst = function (n, en, flere) { return n + " " + (n === 1 ? en : flere); };

    /* Saenkede tegn som HTML (<sub>) */
    var SAENKET = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
                    "ₙ": "n", "ₛ": "s", "ᵢ": "i", "ₒ": "o" };
    D.sub = function (html) {
        return String(html).replace(/[₀-₉ₙₛᵢₒ]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET[c]; }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());

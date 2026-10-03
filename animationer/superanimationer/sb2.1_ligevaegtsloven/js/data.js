/* =====================================================================
   data.js - reaktionerne, tavlerne med en fejl og quizzen

   Kemien er data. En ny reaktion paa fane 1 er ét objekt i D.BROEK, og
   en ny tavle paa fane 2 er ét objekt i D.FEJL. Facit staar ikke her:
   det regnes af skemaet i js/broek.js (produkterne i taelleren,
   reaktanterne i naevneren, koefficienterne som eksponenter, og (s) og
   (l) er ikke med).

   Et stof skrives med almindelige tal og ladningen efter ^, fx "H2O",
   "CO3^2-" og "NH4^+". Tilstandsformen er "g", "aq", "l" eller "s".
   Et led i skemaet er [koefficient, stof, tilstandsform].

   Forklaringerne er HTML (K<sub>s</sub>), resten er almindelig tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Brikkerne, der er ens i alle opgaver ------------------------- */
    D.TEGN = ["·", "+", "−", "1"];
    D.EKS = [2, 3, 4];

    /* ----- Fane 1: Brøken ------------------------------------------------
       De ti reaktioner fra den gamle b2.1 i samme raekkefoelge og to nye
       (jernthiocyanat som nr. 9 og blyiodid som nr. 11). Stofferne er
       brikkerne i bakken: de rigtige og nogle, der ligner. */
    D.GRUPPER = [
        { id: "gas", titel: "Gasser" },
        { id: "vand", titel: "I vand" },
        { id: "fast", titel: "Med faste stoffer" }
    ];

    D.BROEK = [
        {
            id: "hi", gruppe: "gas", navn: "Hydrogeniodid",
            tekst: "Hydrogen og iod danner hydrogeniodid. Alle tre stoffer er gasser.",
            r: [[1, "H2", "g"], [1, "I2", "g"]],
            p: [[2, "HI", "g"]],
            stoffer: ["H2", "I2", "HI", "H", "I", "H2O"],
            forklaring: "Produktet står i tælleren og reaktanterne i nævneren. Koefficienten 2 foran HI bliver til eksponenten 2. En koefficient på 1 skrives ikke."
        },
        {
            id: "nh3", gruppe: "gas", navn: "Ammoniaksyntesen",
            tekst: "Haber-Bosch-processen, hvor ammoniak fremstilles af nitrogen og hydrogen.",
            r: [[1, "N2", "g"], [3, "H2", "g"]],
            p: [[2, "NH3", "g"]],
            stoffer: ["N2", "H2", "NH3", "NO", "O2", "N"],
            forklaring: "Hver koefficient bliver til en eksponent: 3H₂ giver [H₂]³, og 2NH₃ giver [NH₃]²."
        },
        {
            id: "n2o4", gruppe: "gas", navn: "Dinitrogentetraoxid",
            tekst: "Den farveløse gas N₂O₄ spaltes til den brune gas NO₂.",
            r: [[1, "N2O4", "g"]],
            p: [[2, "NO2", "g"]],
            stoffer: ["N2O4", "NO2", "NO", "N2O", "N2", "O2"],
            forklaring: "Der er kun ét stof på hver side, men koefficienten 2 skal med som eksponent: [NO₂]²."
        },
        {
            id: "so3", gruppe: "gas", navn: "Kontaktprocessen",
            tekst: "Et trin i fremstillingen af svovlsyre.",
            r: [[2, "SO2", "g"], [1, "O2", "g"]],
            p: [[2, "SO3", "g"]],
            stoffer: ["SO2", "O2", "SO3", "S", "SO", "H2SO4"],
            forklaring: "Både SO₂ og SO₃ har koefficienten 2 og får eksponenten 2. O₂ har koefficienten 1."
        },
        {
            id: "vandgas", gruppe: "gas", navn: "Vandgasskiftreaktionen",
            tekst: "Carbonmonooxid og vanddamp reagerer ved høj temperatur.",
            r: [[1, "CO", "g"], [1, "H2O", "g"]],
            p: [[1, "CO2", "g"], [1, "H2", "g"]],
            stoffer: ["CO", "H2O", "CO2", "H2", "O2", "CH4"],
            forklaring: "Her er vand en gas, H₂O(g), og dermed en almindelig reaktionsdeltager. Derfor er [H₂O] med i nævneren."
        },
        {
            id: "eddike", gruppe: "vand", navn: "Eddikesyre i vand", ksub: "s",
            tekst: "Eddikesyre afgiver en hydron til vand.",
            r: [[1, "CH3COOH", "aq"], [1, "H2O", "l"]],
            p: [[1, "CH3COO^-", "aq"], [1, "H3O^+", "aq"]],
            stoffer: ["CH3COOH", "H2O", "CH3COO^-", "H3O^+", "OH^-", "CH3COO"],
            forklaring: "Vand er opløsningsmiddel, H₂O(l). Koncentrationen af vand ændrer sig praktisk talt ikke, så [H₂O] er ikke med. Brøken er syrestyrkekonstanten K<sub>s</sub>."
        },
        {
            id: "ammoniak", gruppe: "vand", navn: "Ammoniak i vand", ksub: "b",
            tekst: "Ammoniak optager en hydron fra vand.",
            r: [[1, "NH3", "aq"], [1, "H2O", "l"]],
            p: [[1, "NH4^+", "aq"], [1, "OH^-", "aq"]],
            stoffer: ["NH3", "H2O", "NH4^+", "OH^-", "H3O^+", "NH2^-"],
            forklaring: "Basen står i nævneren og de to ioner i tælleren. [H₂O] er ikke med, fordi vand er opløsningsmiddel. Brøken er basestyrkekonstanten K<sub>b</sub>."
        },
        {
            id: "autoprotolyse", gruppe: "vand", navn: "Vands autoprotolyse", ksub: "v",
            tekst: "Vand reagerer med sig selv.",
            r: [[2, "H2O", "l"]],
            p: [[1, "H3O^+", "aq"], [1, "OH^-", "aq"]],
            stoffer: ["H2O", "H3O^+", "OH^-", "H^+", "O2", "H2"],
            forklaring: "Vandet er opløsningsmiddel, H₂O(l), og er ikke med, heller ikke med koefficienten 2. Nævneren bliver 1. Brøken er vands ionprodukt K<sub>v</sub>, som er 1,0 · 10⁻¹⁴ (mol/L)² ved 25 °C."
        },
        {
            id: "fescn", gruppe: "vand", navn: "Jernthiocyanat",
            tekst: "Jern(III)-ioner og thiocyanat-ioner danner en blodrød ion.",
            r: [[1, "Fe^3+", "aq"], [1, "SCN^-", "aq"]],
            p: [[1, "FeSCN^2+", "aq"]],
            stoffer: ["Fe^3+", "SCN^-", "FeSCN^2+", "Fe^2+", "Fe", "SCN"],
            forklaring: "Alle tre er opløste ioner (aq) og er med. Ingen koefficienter er større end 1, så der er ingen eksponenter."
        },
        {
            id: "kalk", gruppe: "fast", navn: "Kalk i vand",
            tekst: "Lidt kalk opløses i vand.",
            r: [[1, "CaCO3", "s"]],
            p: [[1, "Ca^2+", "aq"], [1, "CO3^2-", "aq"]],
            stoffer: ["CaCO3", "Ca^2+", "CO3^2-", "Ca", "CO2", "OH^-"],
            forklaring: "CaCO₃ er et fast stof (s). Koncentrationen ændrer sig ikke, så det er ikke med. Nævneren bliver 1, og brøken er opløselighedsproduktet."
        },
        {
            id: "pbi2", gruppe: "fast", navn: "Blyiodid i vand",
            tekst: "Det gule salt blyiodid opløses en smule i vand.",
            r: [[1, "PbI2", "s"]],
            p: [[1, "Pb^2+", "aq"], [2, "I^-", "aq"]],
            stoffer: ["PbI2", "Pb^2+", "I^-", "I2", "Pb", "I"],
            forklaring: "PbI₂ er et fast stof og er ikke med. Koefficienten 2 foran I⁻ bliver til eksponenten 2: [Pb²⁺]·[I⁻]²."
        },
        {
            id: "kalkbraending", gruppe: "fast", navn: "Kalkbrænding",
            tekst: "Kalk spaltes ved opvarmning til brændt kalk og carbondioxid.",
            r: [[1, "CaCO3", "s"]],
            p: [[1, "CaO", "s"], [1, "CO2", "g"]],
            stoffer: ["CaCO3", "CaO", "CO2", "Ca^2+", "O2", "CO"],
            forklaring: "Både CaCO₃(s) og CaO(s) er faste stoffer og er ikke med. Kun gassen er tilbage, så K = [CO₂]."
        }
    ];

    /* ----- Fane 2: Find fejlen ---------------------------------------------
       En elev har skrevet reaktionsbroeken paa tavlen. Hver tavle har én
       typisk fejl eller ingen. num og den er det, der staar paa tavlen,
       del for del; maal er de dele, der tæller som fejlen. */
    function L(s, e) { return { t: "led", s: s, e: e || 1 }; }
    function FAKTOR(n) { return { t: "faktor", v: n }; }
    function INDE(k, s) { return { t: "inde", s: s, k: k }; }
    var PRIK = { t: "tegn", v: "·" };
    var PLUS = { t: "tegn", v: "+" };

    D.FEJL = [
        {
            id: "pcl5", navn: "Phosphorpentachlorid", slags: "plus",
            r: [[1, "PCl5", "g"]], p: [[1, "PCl3", "g"], [1, "Cl2", "g"]],
            num: [L("PCl3"), PLUS, L("Cl2")], den: [L("PCl5")],
            maal: [["num", 1]], lys: null,
            hint: ["Se på tegnene mellem leddene.",
                "Leddene i en reaktionsbrøk ganges sammen.",
                "Fejlen er + mellem [PCl₃] og [Cl₂]. Klik på den."],
            forklaring: "Leddene ganges sammen, så der skal stå [PCl₃]·[Cl₂] i tælleren, ikke +."
        },
        {
            id: "hbr", navn: "Hydrogenbromid", slags: "faktor",
            r: [[1, "H2", "g"], [1, "Br2", "g"]], p: [[2, "HBr", "g"]],
            num: [FAKTOR(2), PRIK, L("HBr")], den: [L("H2"), PRIK, L("Br2")],
            maal: [["num", 0], ["num", 1], ["num", 2]], lys: "HBr",
            hint: ["Se på koefficienten foran HBr i skemaet. Hvordan er den skrevet i brøken?",
                "En koefficient bliver til en eksponent, ikke til et tal, der ganges på.",
                "Fejlen er 2 foran [HBr] i tælleren. Klik på den."],
            forklaring: "Koefficienten 2 bliver til eksponenten 2. Tælleren skal være [HBr]², ikke 2·[HBr]."
        },
        {
            id: "no2", navn: "Nitrogenoxider", slags: "eksponent",
            r: [[2, "NO", "g"], [1, "O2", "g"]], p: [[2, "NO2", "g"]],
            num: [L("NO2", 2)], den: [L("NO"), PRIK, L("O2")],
            maal: [["den", 0]], lys: "NO",
            hint: ["Sammenlign eksponenterne med tallene foran stofferne i skemaet.",
                "Der står 2 foran NO i skemaet.",
                "Fejlen er [NO] i nævneren. Den mangler eksponenten 2."],
            forklaring: "Koefficienten 2 foran NO bliver til eksponenten 2, så nævneren skal være [NO]²·[O₂]."
        },
        {
            id: "kontakt", navn: "Kontaktprocessen", slags: null,
            r: [[2, "SO2", "g"], [1, "O2", "g"]], p: [[2, "SO3", "g"]],
            num: [L("SO3", 2)], den: [L("SO2", 2), PRIK, L("O2")],
            maal: [], lys: null,
            hint: ["Tjek siderne: produkterne i tælleren og reaktanterne i nævneren.",
                "Tjek eksponenterne: 2 foran SO₂ og SO₃ og ingenting foran O₂.",
                "Siderne, eksponenterne og tegnene passer. Alle tre stoffer er gasser."],
            forklaring: "Der er ingen fejl. SO₃ står i tælleren, SO₂ og O₂ i nævneren, og koefficienterne er blevet til eksponenter."
        },
        {
            id: "no", navn: "Nitrogenmonooxid", slags: "byttet",
            r: [[1, "N2", "g"], [1, "O2", "g"]], p: [[2, "NO", "g"]],
            num: [L("N2"), PRIK, L("O2")], den: [L("NO", 2)],
            maal: [["num", 0], ["num", 2], ["den", 0]], lys: "NO",
            hint: ["Se på, hvilken side af pilen stofferne i tælleren står.",
                "N₂ og O₂ står før pilen. De er reaktanter, og reaktanterne står i nævneren.",
                "Tæller og nævner er byttet om. Klik på et af stofferne."],
            forklaring: "Tæller og nævner er byttet om. Produktet NO skal stå i tælleren: K = [NO]² / ([N₂]·[O₂]). Den viste brøk hører til den omvendte reaktion."
        },
        {
            id: "haber", navn: "Ammoniaksyntesen", slags: "inde",
            r: [[1, "N2", "g"], [3, "H2", "g"]], p: [[2, "NH3", "g"]],
            num: [L("NH3", 2)], den: [L("N2"), PRIK, INDE(3, "H2")],
            maal: [["den", 2]], lys: "H2",
            hint: ["Se på leddet med H₂ i nævneren.",
                "Koefficienten hører ikke inden i den kantede parentes. [3H₂] er ikke en koncentration af noget stof.",
                "Fejlen er [3H₂]. Klik på den."],
            forklaring: "Koefficienten bliver til en eksponent uden for parentesen: [H₂]³, ikke [3H₂]."
        },
        {
            id: "hf", navn: "Flussyre i vand", slags: "udeladt", ksub: "s",
            r: [[1, "HF", "aq"], [1, "H2O", "l"]], p: [[1, "F^-", "aq"], [1, "H3O^+", "aq"]],
            num: [L("F^-"), PRIK, L("H3O^+")], den: [L("HF"), PRIK, L("H2O")],
            maal: [["den", 2]], lys: "H2O",
            hint: ["Se på tilstandsformerne i skemaet.",
                "H₂O(l) er opløsningsmidlet. Koncentrationen af vand ændrer sig praktisk talt ikke.",
                "Fejlen er [H₂O] i nævneren. Klik på den."],
            forklaring: "Vand er opløsningsmiddel, H₂O(l), og er ikke med. Nævneren skal kun være [HF]."
        },
        {
            id: "ag2cro4", navn: "Sølvchromat i vand", slags: "udeladt",
            r: [[1, "Ag2CrO4", "s"]], p: [[2, "Ag^+", "aq"], [1, "CrO4^2-", "aq"]],
            num: [L("Ag^+", 2), PRIK, L("CrO4^2-")], den: [L("Ag2CrO4")],
            maal: [["den", 0]], lys: "Ag2CrO4",
            hint: ["Se på tilstandsformerne i skemaet.",
                "Ag₂CrO₄ er et fast stof (s). Koncentrationen af et fast stof ændrer sig ikke.",
                "Fejlen er [Ag₂CrO₄] i nævneren. Klik på den."],
            forklaring: "Et fast stof er ikke med. Nævneren bliver 1, så K = [Ag⁺]²·[CrO₄²⁻]."
        },
        {
            id: "methanol", navn: "Methanolsyntesen", slags: "eksponent",
            r: [[1, "CO", "g"], [2, "H2", "g"]], p: [[1, "CH3OH", "g"]],
            num: [L("CH3OH")], den: [L("CO"), PRIK, L("H2", 3)],
            maal: [["den", 2]], lys: "H2",
            hint: ["Sammenlign eksponenterne med tallene foran stofferne i skemaet.",
                "Der står 2 foran H₂ i skemaet.",
                "Fejlen er [H₂]³. Klik på den."],
            forklaring: "Koefficienten foran H₂ er 2, så leddet skal være [H₂]², ikke [H₂]³."
        },
        {
            id: "vandgas", navn: "Vandgasskiftreaktionen", slags: null,
            r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]],
            num: [L("CO2"), PRIK, L("H2")], den: [L("CO"), PRIK, L("H2O")],
            maal: [], lys: "H2O",
            hint: ["Tjek siderne: produkterne i tælleren og reaktanterne i nævneren.",
                "Ingen koefficienter er større end 1, så der er ingen eksponenter.",
                "Se på tilstandsformen efter H₂O. Vand er en gas her, H₂O(g)."],
            forklaring: "Der er ingen fejl. Vand er en gas her, H₂O(g), og ikke opløsningsmiddel. Derfor er [H₂O] med i nævneren."
        },
        {
            id: "boudouard", navn: "Kul og carbondioxid", slags: "udeladt",
            r: [[1, "C", "s"], [1, "CO2", "g"]], p: [[2, "CO", "g"]],
            num: [L("CO", 2)], den: [L("C"), PRIK, L("CO2")],
            maal: [["den", 0]], lys: "C",
            hint: ["Se på tilstandsformerne i skemaet.",
                "C er kul, et fast stof (s). Koncentrationen af et fast stof ændrer sig ikke.",
                "Fejlen er [C] i nævneren. Klik på den."],
            forklaring: "Kul er et fast stof og er ikke med. Nævneren skal kun være [CO₂], så K = [CO]² / [CO₂]."
        },
        {
            id: "autoprotolyse", navn: "Vands autoprotolyse", slags: "udeladt", ksub: "v",
            r: [[2, "H2O", "l"]], p: [[1, "H3O^+", "aq"], [1, "OH^-", "aq"]],
            num: [L("H3O^+"), PRIK, L("OH^-")], den: [L("H2O", 2)],
            maal: [["den", 0]], lys: "H2O",
            hint: ["Se på tilstandsformen efter H₂O i skemaet.",
                "H₂O(l) er opløsningsmidlet, også når der står 2 foran.",
                "Fejlen er [H₂O]² i nævneren. Klik på den."],
            forklaring: "Vand er opløsningsmiddel og er ikke med. Nævneren bliver 1, så K<sub>v</sub> = [H₃O⁺]·[OH⁻]."
        }
    ];

    /* ----- Quizzen: de fem spoergsmaal fra den gamle b2.1 ----------------
       Det rigtige svar staar foerst og blandes, naar quizzen vises. nej er
       en kort besked til hvert forkert svar. */
    D.QUIZ = [
        {
            q: "Hvad betyder [H₂] i en reaktionsbrøk?",
            svar: ["Koncentrationen af H₂ i mol/L", "Stofmængden af H₂ i mol", "Massen af H₂ i gram", "Antallet af H₂-molekyler"],
            nej: [null, "Stofmængden alene er ikke nok. Den deles med rumfanget.", "Massen bruges ikke i reaktionsbrøken.", "Antallet af molekyler bruges ikke i reaktionsbrøken."],
            hvorfor: "Kantede parenteser betyder koncentration, altså stofmængde pr. liter: mol/L."
        },
        {
            q: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g). Hvordan står hydrogen i reaktionsbrøken?",
            svar: ["[H₂]³", "3·[H₂]", "[H₂]", "[3H₂]"],
            nej: [null, "Koefficienten bliver ikke til et tal, der ganges på.", "Koefficienten 3 skal med.", "Koefficienten hører ikke inden i parentesen."],
            hvorfor: "Koefficienten 3 bliver til eksponenten 3, så leddet er [H₂]³."
        },
        {
            q: "Hvordan står et fast stof, fx CaCO₃(s), i reaktionsbrøken?",
            svar: ["Det er ikke med", "I nævneren som [CaCO₃]", "I tælleren som [CaCO₃]", "Med massen af det faste stof"],
            nej: [null, "Et fast stof er ikke med, heller ikke når det står før pilen.", "Et fast stof er ikke med, heller ikke når det står efter pilen.", "Massen bruges ikke i reaktionsbrøken."],
            hvorfor: "Et fast stof har samme koncentration hele tiden. Den er gemt i K, så stoffer med (s) er ikke med. Det samme gælder vand som opløsningsmiddel, H₂O(l). Er der ikke noget tilbage i nævneren, skriver man 1."
        },
        {
            q: "Hvad kan ændre værdien af ligevægtskonstanten K?",
            svar: ["En ændring af temperaturen", "Mere af en reaktant", "En katalysator", "En større beholder"],
            nej: [null, "Mere reaktant forskyder ligevægten, men K har samme værdi.", "En katalysator får ligevægten til at indstille sig hurtigere. K ændres ikke.", "En større beholder kan forskyde ligevægten, men K har samme værdi."],
            hvorfor: "K afhænger kun af temperaturen. De andre indgreb kan forskyde ligevægten, men K har samme værdi."
        },
        {
            q: "Hvilken enhed har ligevægtskonstanten K?",
            svar: ["Det afhænger af reaktionsbrøken", "Altid mol/L", "K har aldrig en enhed", "Altid (mol/L)²"],
            nej: [null, "Enheden afhænger af, hvor mange led der står over og under brøkstregen.", "K har kun ingen enhed, når der er lige mange led over og under brøkstregen.", "Enheden afhænger af, hvor mange led der står over og under brøkstregen."],
            hvorfor: "Enheden regnes af brøken. I H₂ + I₂ ⇌ 2HI er der lige mange led over og under brøkstregen, så enhederne går ud, og K har ingen enhed. I K<sub>v</sub> = [H₃O⁺]·[OH⁻] er nævneren 1, så enheden er (mol/L)²."
        }
    ];

    /* ----- Ros og afslutninger --------------------------------------------- */
    D.ROS_OPGAVE = ["Flot.", "Godt.", "Sådan.", "Rigtigt."];
    D.FAERDIG = {
        br: "Alle tolv reaktioner er skrevet. Prøv fanen Find fejlen.",
        ff: "Alle tolv tavler er rettet."
    };

    NK.Data = D;
}());

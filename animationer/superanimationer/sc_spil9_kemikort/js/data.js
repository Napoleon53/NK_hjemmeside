/* =====================================================================
   data.js - de indbyggede kortsaet

   Saettene staar i samme tekstformat, som laereren selv skriver sine i
   (js/tekstformat.js). Saa kan et indbygget saet aabnes i vinduet
   "Kort som tekst", rettes og gemmes som sit eget.

   Formatet (lodret streg her, tabulator i spillet, se nederst):
     Saet: navnet paa saettet
     Sider: forsidens overskrift | bagsidens overskrift
     forside | bagside

   Kilder til indholdet: Databogen (grundstoffernes navne og symboler),
   Basiskemi C (fagord, ionnavne, formler) og kompendierne i
   C:\NK_Undervisning\Kompendier. Molart rumfang, gaskonstanten og
   Avogadros tal foelger de tal, superanimationerne regner med
   (sc4.6: R = 0,0831 L·bar/(mol·K), Vm = ca. 24 L/mol ved stuetemperatur
   og 1 bar).

   Bagsiderne er skrevet til vendespillet: hver forklaring begynder med,
   hvad slags ting ordet er (formel, binding, molekylform, endelse), og
   har ét kendetegn, som ingen anden bagside i saettet har. Et overordnet
   ord (kovalent binding, intermolekylaer binding) staar som faellesnavn,
   saa det ikke kan forveksles med de ord, der hoerer under det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data = {};

    /* Saettet, der aabner, naar der ikke staar andet i linket. */
    D.STANDARD = "grundstoffer";

    D.INDBYGGEDE = [
        {
            noegle: "grundstoffer",
            emne: "C1",
            tekst: [
                "Sæt: C1 Grundstoffer: symbol og navn",
                "Sider: Symbol | Navn",
                "",
                "H | hydrogen",
                "He | helium",
                "Li | lithium",
                "Be | beryllium",
                "B | bor",
                "C | carbon",
                "N | nitrogen",
                "O | oxygen",
                "F | fluor",
                "Ne | neon",
                "Na | natrium",
                "Mg | magnesium",
                "Al | aluminium",
                "Si | silicium",
                "P | phosphor",
                "S | svovl",
                "Cl | chlor",
                "Ar | argon",
                "K | kalium",
                "Ca | calcium",
                "Cr | chrom",
                "Mn | mangan",
                "Fe | jern",
                "Cu | kobber",
                "Zn | zink",
                "Br | brom",
                "Ag | sølv",
                "I | iod",
                "Ba | barium",
                "Pt | platin",
                "Au | guld",
                "Hg | kviksølv",
                "Pb | bly"
            ].join("\n")
        },
        {
            noegle: "ioner",
            emne: "C2",
            tekst: [
                "Sæt: C2 Ioner: formel og navn",
                "Sider: Ion | Navn",
                "",
                "Na⁺ | natriumion",
                "K⁺ | kaliumion",
                "Mg²⁺ | magnesiumion",
                "Ca²⁺ | calciumion",
                "Ba²⁺ | bariumion",
                "Al³⁺ | aluminiumion",
                "Zn²⁺ | zinkion",
                "Ag⁺ | sølvion",
                "Fe²⁺ | jern(II)ion",
                "Fe³⁺ | jern(III)ion",
                "Cu²⁺ | kobber(II)ion",
                "Pb²⁺ | bly(II)ion",
                "NH₄⁺ | ammoniumion",
                "H₃O⁺ | oxoniumion",
                "F⁻ | fluoridion",
                "Cl⁻ | chloridion",
                "Br⁻ | bromidion",
                "I⁻ | iodidion",
                "O²⁻ | oxidion",
                "S²⁻ | sulfidion",
                "N³⁻ | nitridion",
                "OH⁻ | hydroxidion",
                "NO₃⁻ | nitration",
                "SO₄²⁻ | sulfation",
                "SO₃²⁻ | sulfition",
                "CO₃²⁻ | carbonation",
                "HCO₃⁻ | hydrogencarbonation",
                "PO₄³⁻ | phosphation",
                "CH₃COO⁻ | ethanoation (acetation)",
                "MnO₄⁻ | permanganation",
                "CrO₄²⁻ | chromation"
            ].join("\n")
        },
        {
            noegle: "molekyler",
            emne: "C3",
            tekst: [
                "Sæt: C3 Molekyler og bindinger: fagord",
                "Sider: Fagord | Forklaring",
                "",
                "valenselektroner | elektronerne i atomets yderste skal",
                "oktetreglen | atomer binder sig, så de får otte elektroner i yderste skal",
                "kovalent binding | elektronparbinding: to atomer deles om elektroner",
                "enkeltbinding | ét fælles elektronpar mellem to atomer",
                "dobbeltbinding | to fælles elektronpar mellem de samme to atomer",
                "tripelbinding | tre fælles elektronpar mellem de samme to atomer",
                "frit elektronpar | elektronpar på ét atom, som ikke indgår i en binding",
                "elektronprikformel | formel, hvor alle valenselektroner er tegnet som prikker",
                "strukturformel | formel, hvor hver binding er tegnet som en streg",
                "molekylformel | formel med antallet af hver slags atom, fx C₂H₆O",
                "elektronegativitet | tal for, hvor kraftigt et atom trækker i bindingens elektroner",
                "upolær binding | binding, hvor elektronparret er ligeligt delt",
                "polær binding | binding, hvor elektronparret er forskudt mod det ene atom",
                "polært molekyle | molekyle med en positiv og en negativ ende, fx H₂O",
                "upolært molekyle | molekyle uden positiv og negativ ende, fx CH₄",
                "lineær | molekylform med 180° mellem bindingerne, som i CO₂",
                "plan trekant | molekylform med 120° mellem bindingerne, som i CH₂O",
                "vinklet | molekylform: to bindinger og to frie elektronpar, som i H₂O",
                "pyramide | molekylform: tre bindinger og ét frit elektronpar, som i NH₃",
                "tetraeder | molekylform med 109,5° mellem bindingerne, som i CH₄",
                "intermolekylær binding | fællesnavn for de svage bindinger mellem molekyler",
                "hydrogenbinding | binding mellem H på N, O eller F og et frit elektronpar",
                "dipol-dipol-binding | tiltrækning mellem δ+ og δ− i to polære molekyler",
                "London-kræfter | tiltrækning mellem midlertidige dipoler, i alle stoffer",
                "hydrofil | vandelskende: om en polær gruppe som OH",
                "hydrofob | vandskyende: om en upolær del som en carbonkæde",
                "lignende opløser lignende | polære stoffer blandes med polære, upolære med upolære"
            ].join("\n")
        },
        {
            noegle: "beregninger",
            emne: "C4-C5",
            tekst: [
                "Sæt: C4 og C5 Formler, størrelser og enheder",
                "Sider: Størrelse eller formel | Betydning",
                "",
                "n | stofmængde, måles i mol",
                "m | masse, måles i g",
                "M | molarmasse, måles i g/mol",
                "V | rumfang, måles i L",
                "c | koncentration, måles i mol/L",
                "T | temperatur, måles i K",
                "p | tryk, måles i bar",
                "n = m / M | stofmængden ud fra masse og molarmasse",
                "m = n · M | massen ud fra stofmængde og molarmasse",
                "M = m / n | molarmassen ud fra masse og stofmængde",
                "c = n / V | koncentrationen ud fra stofmængde og rumfang",
                "n = c · V | stofmængden ud fra koncentration og rumfang",
                "V = n / c | rumfanget ud fra stofmængde og koncentration",
                "n = V / Vₘ | stofmængden af en gas ud fra gassens rumfang",
                "Vₘ | molart rumfang, ca. 24 L/mol ved stuetemperatur og 1 bar",
                "p · V = n · R · T | idealgasligningen",
                "R | gaskonstanten, 0,0831 L·bar/(mol·K)",
                "0 °C i kelvin | 273,15 K",
                "Avogadros konstant | 6,022 · 10²³ partikler pr. mol",
                "molarmassen af H₂O | 18,02 g/mol",
                "c(før) · V(før) = c(efter) · V(efter) | fortyndingsformlen",
                "masseprocent | stoffets masse i procent af hele blandingens masse",
                "formel koncentration | c(NaCl): stofmængden af det opløste salt pr. liter",
                "aktuel koncentration | [Na⁺]: den koncentration, ionen har i opløsningen",
                "betydende cifre | alle cifre fra det første, der ikke er 0: tre i 0,0250"
            ].join("\n")
        },
        {
            noegle: "organisk",
            emne: "C6",
            tekst: [
                "Sæt: C6 Organisk kemi: navne og grupper",
                "Sider: Navnedel eller gruppe | Betydning",
                "",
                "meth- | 1 carbonatom",
                "eth- | 2 carbonatomer",
                "prop- | 3 carbonatomer",
                "but- | 4 carbonatomer",
                "pent- | 5 carbonatomer",
                "hex- | 6 carbonatomer",
                "hept- | 7 carbonatomer",
                "oct- | 8 carbonatomer",
                "-an | endelsen på en alkan (kun C-C), fx propan",
                "-en | endelsen på en alken (C=C), fx propen",
                "-yn | endelsen på en alkyn (C≡C), fx propyn",
                "-ol | endelsen på en alkohol, fx propanol",
                "-al | endelsen på et aldehyd, fx propanal",
                "-on | endelsen på en keton, fx propanon",
                "-syre | endelsen på en carboxylsyre, fx propansyre",
                "OH-gruppe | hydroxygruppe, findes i alkoholer",
                "COOH-gruppe | carboxylgruppe, findes i carboxylsyrer",
                "CHO-gruppe | aldehydgruppe, findes i aldehyder",
                "C=O inde i kæden | ketogruppe, findes i ketoner",
                "COO-gruppe | estergruppe, findes i estre",
                "NH₂-gruppe | aminogruppe, findes i aminer",
                "O mellem to kæder | ethergruppe, findes i ethere",
                "CH₄ | methan",
                "C₃H₈ | propan",
                "CH₃CH₂OH | ethanol",
                "CH₃COOH | ethansyre (eddikesyre)",
                "carbonhydrid | stof, der kun består af carbon og hydrogen",
                "mættet | om en carbonkæde med kun enkeltbindinger",
                "umættet | om en carbonkæde med mindst én dobbelt- eller tripelbinding",
                "isomerer | stoffer med samme molekylformel, men forskellig opbygning",
                "zigzagformel | formel, hvor hvert knæk og hver ende er et carbonatom"
            ].join("\n")
        },
        {
            noegle: "syrebase-redox",
            emne: "C7-C8",
            tekst: [
                "Sæt: C7 og C8 Syre/base og redox: fagord",
                "Sider: Fagord | Forklaring",
                "",
                "hydron | ionen H⁺, et hydrogenatom uden sin elektron",
                "syre | stof, der kan afgive en hydron",
                "base | stof, der kan optage en hydron",
                "amfolyt | stof, der både kan være syre og base, fx H₂O",
                "korresponderende syre-basepar | syre og base med én H⁺ til forskel, fx HCl og Cl⁻",
                "stærk syre | syre, hvor alle molekyler afgiver H⁺ til vand, fx HCl",
                "svag syre | syre, hvor kun få molekyler afgiver H⁺ til vand, fx CH₃COOH",
                "pH | −log([H₃O⁺]), et mål for, hvor sur opløsningen er",
                "[H₃O⁺] ud fra pH | 10^(−pH) M",
                "sur opløsning | pH under 7 ved 25 °C",
                "neutral opløsning | pH = 7 ved 25 °C",
                "basisk opløsning | pH over 7 ved 25 °C",
                "titrering | metode til at finde en ukendt koncentration med en burette",
                "ækvivalenspunkt | punktet i en titrering, hvor alt stoffet netop har reageret",
                "indikator | farvestof, hvis farve afhænger af pH",
                "oxidation | afgivelse af elektroner, oxidationstallet stiger",
                "reduktion | optagelse af elektroner, oxidationstallet falder",
                "oxidationsmiddel | stoffet, der optager elektroner og selv bliver reduceret",
                "reduktionsmiddel | stoffet, der afgiver elektroner og selv bliver oxideret",
                "redoxreaktion | reaktion, hvor elektroner overføres fra ét stof til et andet",
                "oxidationstal | atomets ladning, hvis alle bindinger var ionbindinger",
                "oxidationstal i et grundstof | 0, fx i Fe, O₂ og Cl₂",
                "oxidationstal for H i forbindelser | +I",
                "oxidationstal for O i forbindelser | −II",
                "spændingsrækken | metallerne ordnet efter, hvor let de afgiver elektroner",
                "uædelt metal | står til venstre for hydrogen i spændingsrækken, fx Mg",
                "ædelt metal | står til højre for hydrogen i spændingsrækken, fx Ag"
            ].join("\n")
        }
    ];

    /* Saettene er skrevet med " | " herover, saa de er lette at laese i
       koden. I spillet staar de med tabulator som i Quizlet, saa et
       indbygget saet, der aabnes i vinduet, kan kopieres direkte. */
    D.INDBYGGEDE.forEach(function (s) {
        s.tekst = s.tekst.replace(/ \| /g, "\t");
    });
}());

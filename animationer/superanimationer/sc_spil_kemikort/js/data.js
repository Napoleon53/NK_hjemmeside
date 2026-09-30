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
   (sc4.6: R = 0,0831 L·bar/(mol·K), Vm = 24 L/mol ved 25 °C og 1 bar).
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
                "kovalent binding | et elektronpar, som to atomer deler",
                "valenselektroner | elektronerne i atomets yderste skal",
                "frit elektronpar | et valenselektronpar, der ikke er i en binding",
                "oktetreglen | atomet vil have otte elektroner i yderste skal",
                "dobbeltbinding | to elektronpar mellem de samme to atomer",
                "elektronprikformel | tegning med alle valenselektroner som prikker",
                "strukturformel | tegning, hvor hver binding er en streg",
                "molekylformel | antallet af hver slags atom, fx C₂H₆O",
                "elektronegativitet | et atoms evne til at trække i bindingens elektroner",
                "upolær binding | de to atomer trækker lige meget i elektronparret",
                "polær binding | det ene atom trækker mest, så bindingen får δ+ og δ−",
                "polært molekyle | molekylet har en positiv og en negativ ende",
                "lineær | to bindinger ud fra atomet, 180° imellem",
                "plan trekant | tre bindinger i samme plan, 120° imellem",
                "vinklet | to bindinger og frie elektronpar, som i vand",
                "tetraedrisk | fire bindinger, der peger mest muligt væk fra hinanden",
                "hydrogenbinding | H på O, N eller F trækkes mod et frit elektronpar",
                "dipol-dipol-binding | tiltrækning mellem polære molekyler",
                "London-binding | binding mellem midlertidige dipoler, findes i alle stoffer",
                "intermolekylær binding | binding mellem molekyler, ikke inde i dem",
                "hydrofil | vandvenlig, den polære del af et molekyle",
                "hydrofob | vandskyende, den upolære del af et molekyle",
                "lignende opløser lignende | polært opløser polært, upolært opløser upolært"
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
                "n = m / M | stofmængden af en afvejet masse",
                "m = n · M | massen af en kendt stofmængde",
                "M = m / n | molarmassen, når masse og stofmængde kendes",
                "c = n / V | koncentrationen af en opløsning",
                "n = c · V | stofmængden i et rumfang opløsning",
                "V = n / c | rumfanget, der rummer en bestemt stofmængde",
                "n = V / Vₘ | stofmængden af en gas",
                "Vₘ | molart rumfang, 24 L/mol ved 25 °C og 1 bar",
                "p · V = n · R · T | idealgasligningen",
                "R | gaskonstanten, 0,0831 L·bar/(mol·K)",
                "0 °C i kelvin | 273,15 K",
                "Avogadros tal | 6,022 · 10²³ partikler pr. mol",
                "1 mol | 6,022 · 10²³ partikler",
                "molarmassen af H₂O | 18,02 g/mol",
                "c(før) · V(før) = c(efter) · V(efter) | fortynding",
                "masseprocent | stoffets masse i procent af hele blandingen",
                "formel koncentration | koncentrationen af saltet, som det blev vejet af",
                "aktuel koncentration | koncentrationen af en ion i opløsningen",
                "betydende cifre | de cifre i et måletal, der siger noget om målingen"
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
                "-an | kun enkeltbindinger, en alkan",
                "-en | mindst én dobbeltbinding, en alken",
                "-yn | mindst én tripelbinding, en alkyn",
                "-ol | en alkohol",
                "-al | et aldehyd",
                "-on | en keton",
                "-syre | en carboxylsyre",
                "OH-gruppe | hydroxygruppe, gør stoffet til en alkohol",
                "COOH-gruppe | carboxygruppe, gør stoffet til en carboxylsyre",
                "CHO-gruppe | aldehydgruppe, sidder for enden af kæden",
                "C=O inde i kæden | ketogruppe, gør stoffet til en keton",
                "COO-gruppe | estergruppe, ester af en syre og en alkohol",
                "NH₂-gruppe | aminogruppe, gør stoffet til en amin",
                "O mellem to kæder | ethergruppe, gør stoffet til en ether",
                "CH₄ | methan",
                "C₄H₁₀ | butan",
                "CH₃CH₂OH | ethanol",
                "CH₃COOH | ethansyre (eddikesyre)",
                "mættet | kun enkeltbindinger mellem carbonatomerne",
                "umættet | mindst én dobbelt- eller tripelbinding",
                "isomere | samme molekylformel, forskellig struktur",
                "zigzagformel | knæk og ender er carbonatomer, H er underforstået"
            ].join("\n")
        },
        {
            noegle: "syrebase-redox",
            emne: "C7-C8",
            tekst: [
                "Sæt: C7 og C8 Syre/base og redox: fagord",
                "Sider: Fagord | Forklaring",
                "",
                "syre | et stof, der kan afgive en hydron, H⁺",
                "base | et stof, der kan optage en hydron, H⁺",
                "korresponderende syre-basepar | to stoffer, der er én H⁺ fra hinanden",
                "amfolyt | et stof, der både kan afgive og optage en hydron",
                "stærk syre | afgiver hydronen til alle vandmolekyler, den møder",
                "svag syre | kun en del af molekylerne afgiver hydronen",
                "pH | pH = −log([H₃O⁺])",
                "koncentrationen af oxoniumioner | [H₃O⁺] = 10^(−pH)",
                "neutral opløsning | pH = 7 ved 25 °C",
                "pH i en stærk syre | pH = −log(c(syre))",
                "titrering | der tilsættes base, til syren netop er brugt op",
                "ækvivalenspunkt | der, hvor syre og base er tilsat i forholdet fra skemaet",
                "indikator | et stof, der skifter farve ved et bestemt pH",
                "oxidation | afgivelse af elektroner",
                "reduktion | optagelse af elektroner",
                "oxidationsmiddel | optager elektroner og bliver selv reduceret",
                "reduktionsmiddel | afgiver elektroner og bliver selv oxideret",
                "redoxreaktion | elektroner flyttes fra det ene stof til det andet",
                "halvreaktion | den ene halvdel: afgivelsen eller optagelsen af elektroner",
                "oxidationstal | ladningen, atomet ville have, hvis bindingerne var ioniske",
                "oxidationstal i et grundstof | 0, fx i Fe, O₂ og Cl₂",
                "oxidationstal for H i forbindelser | +I",
                "oxidationstal for O i forbindelser | −II",
                "spændingsrækken | metallerne ordnet efter, hvor let de afgiver elektroner",
                "uædelt metal | afgiver let elektroner, fx magnesium",
                "ædelt metal | afgiver kun vanskeligt elektroner, fx sølv"
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

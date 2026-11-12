/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B7

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B7 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b7.qmd) den
   10. nov. 2026 med et lille script; sænkede tal er skrevet som tegn
   (CH₂OH, I₂, pKₛ), og kursiv er taget af. Galactose er ikke fagord
   længere (brugeren 10. nov. 2026).
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "B7";
    NK.ANTAL_FAGORD = 64;

    NK.FORKLARING = {
        /* B7.1 Monosaccharider */
        "næringsstof": "Stof i maden, der giver kroppen energi. Kulhydrater, fedt og proteiner er de tre slags.",
        "monosaccharid": "Sukkerstof af én enhed, som ikke kan spaltes til mindre sukkerstoffer. Glucose er et eksempel.",
        "disaccharid": "Sukkerstof af to enheder, der er bundet sammen, for eksempel maltose og lactose.",
        "fischerprojektion": "Hurtig måde at tegne et sukkerstof som åben kæde. Kæden står lodret med carbonatom 1 øverst, og OH-grupperne peger til højre eller venstre.",
        "glucose": "Druesukker. Det monosaccharid, blodet fører rundt til kroppens celler.",
        "fructose": "Frugtsukker. Monosaccharid i frugt og honning, som smager mere sødt end druesukker.",
        "aldose": "Monosaccharid med en aldehydgruppe, for eksempel glucose og galactose.",
        "ketose": "Monosaccharid med en ketongruppe, for eksempel fructose.",
        "D-form": "Stereoisomer, hvor OH på det nederste asymmetriske carbonatom peger til højre. Retningen aflæses i fischerprojektionen, og næsten alle sukkerstoffer i naturen har denne opbygning.",
        "L-form": "Stereoisomer, hvor OH på det nederste asymmetriske carbonatom peger til venstre. Retningen aflæses i fischerprojektionen. Kroppen kan ikke udnytte glucose med denne opbygning.",
        /* B7.2 Ringslutning */
        "ringslutning": "Reaktion, hvor kæden i et sukkerstof bøjer og lukker sig om sig selv. I glucose binder oxygenatomet på carbonatom 5 sig til carbonatom 1.",
        "haworthformel": "Tegning af et sukkerstof som en ring, set skråt fra siden. Den tykke kant vender ud mod læseren, og grupperne peger op eller ned.",
        "α-glucose": "Ringform af druesukker, hvor OH-gruppen på carbonatom 1 peger ned.",
        "β-glucose": "Ringform af druesukker, hvor OH-gruppen på carbonatom 1 peger op. Den peger til samme side som CH₂OH-gruppen.",
        /* B7.3 Disaccharider og polysaccharider */
        "glykosidbinding": "Gruppen C−O−C, der forbinder to sukkerenheder. Den dannes ved en kondensation, hvor to OH-grupper reagerer, og der fraspaltes vand.",
        "maltose": "Disaccharid af to glucoseenheder. Det dannes, når stivelse spaltes, for eksempel i korn, der spirer.",
        "lactose": "Sukkeret i mælk. Disaccharid af glucose og galactose, bundet sammen med en β-1,4-glykosidbinding.",
        "saccharose": "Det sukker, man køber i en pose. Består af glucose og fructose, og ingen af de to ringe kan åbne sig.",
        "polysaccharid": "Kæde af hundreder eller tusinder af sukkerenheder. Stivelse og cellulose er eksempler.",
        "stivelse": "Planternes lager af energi i korn, kartofler og ris. Blanding af to polysaccharider, som farves blåsort af diiod.",
        "amylose": "Den del af stivelse, der er en lang kæde uden forgreninger. Kæden snor sig som en spiral.",
        "amylopectin": "Den del af stivelse, hvor kæden forgrener sig med jævne mellemrum. I en forgrening går bindingen fra carbonatom 1 til carbonatom 6.",
        "glykogen": "Dyrs og menneskers lager af glucose i leveren og musklerne. Kæden har mange forgreninger, så glucosen hurtigt kan frigives.",
        "cellulose": "Stoffet i planternes cellevægge og i træ, papir og bomuld. Glucoseenhederne har β-bindinger, så kæderne er helt lige og danner stærke fibre.",
        "hydrolyse": "Reaktion, hvor vand spalter en binding, for eksempel i et disaccharid. Det modsatte af en kondensation.",
        /* B7.4 Fehlings test */
        "Fehlings væske": "Dybblå, basisk blanding med kobber(II)ioner, som tartrat holder opløst. Giver rødt bundfald med stoffer, der har en aldehydgruppe.",
        "Fehling I": "Blå opløsning af kobber(II)sulfat. Den ene af de to opløsninger, der blandes lige før testen for aldehydgrupper.",
        "Fehling II": "Opløsning af natriumhydroxid og saltet kaliumnatriumtartrat. Den gør blandingen basisk, og tartrat holder kobber(II)ionerne opløst.",
        "reducerende sukker": "Kulhydrat, der omdanner kobber(II)ioner til rødt kobber(I)oxid. Mindst én ring kan åbne sig, så der opstår en aldehydgruppe, som i glucose og maltose.",
        /* B7.5 Fedtstoffer */
        "glycerol": "Alkohol med tre OH-grupper, propan-1,2,3-triol. I et fedtstof er den bundet til tre fedtsyrer.",
        "fedtsyre": "Carboxylsyre med en lang carbonkæde uden forgreninger. De fleste har 16 eller 18 carbonatomer.",
        "triglycerid": "Et andet ord for et fedtstof. Ester med tre estergrupper, dannet af en alkohol med tre OH-grupper og tre fedtsyrer.",
        "mættet fedtsyre": "Carboxylsyre med en lang carbonkæde uden dobbeltbindinger mellem carbonatomer. Kæden er lige, så molekylerne kan pakkes tæt, og smeltepunktet bliver højt.",
        "umættet fedtsyre": "Carboxylsyre med en lang carbonkæde og én eller flere C=C-dobbeltbindinger. Cis-dobbeltbindinger giver et knæk i kæden og et lavt smeltepunkt.",
        "hærdning": "Addition af dihydrogen til dobbeltbindingerne i en olie, så den bliver et fast fedtstof. Sådan kan margarine fremstilles af planteolie.",
        "transfedtsyre": "Lang carboxylsyre med en dobbeltbinding, der ikke er cis, så kæden er næsten lige. Kan dannes, når kun en del af dobbeltbindingerne i en olie adderer dihydrogen.",
        /* B7.6 Iodtal og forsæbning */
        "iodtal": "Massen af I₂ i gram, som 100 g fedtstof kan addere. Jo højere værdien er, jo flere C=C-dobbeltbindinger har fedtstoffet.",
        "tilbagetitrering": "Metode, hvor der tilsættes et kendt overskud, og resten bagefter måles og trækkes fra. Den bruges til langsomme reaktioner.",
        "forsæbning": "Spaltning af en ester med en stærk base. Koges et fedtstof med kaliumhydroxid, dannes glycerol og saltene af de tre fedtsyrer.",
        "sæbe": "Saltene af fedtsyrer. Ionen har en upolær hale og et ladet hoved og kan derfor fordele fedt som små dråber i vand.",
        "forsæbningstal": "Milligram kaliumhydroxid, der forbruges ved spaltning af estergrupperne i 1 g fedtstof. Tallet er højt, når fedtsyrekæderne er korte.",
        "syretal": "Milligram kaliumhydroxid, der neutraliserer de frie fedtsyrer i 1 g fedtstof. Tallet stiger, når olien bliver harsk.",
        /* B7.7 Aminosyrer */
        "aminosyre": "Proteinernes byggesten. Molekyle med en −NH₂-gruppe og en carboxylgruppe på det samme carbonatom.",
        "sidekæde": "Den fjerde gruppe på det midterste carbonatom i en aminosyre. Den skrives R og gør de 20 aminosyrer forskellige.",
        "upolær sidekæde": "Gruppen R i en aminosyre, når den kun består af carbon og hydrogen. Den er hydrofob.",
        "polær sidekæde": "Gruppen R i en aminosyre, når den kan danne hydrogenbindinger. Den har for eksempel en OH-gruppe.",
        "sur sidekæde": "Gruppen R i en aminosyre, når den har en ekstra carboxylgruppe, som kan afgive en hydron.",
        "basisk sidekæde": "Gruppen R i en aminosyre, når den har en ekstra −NH₂-gruppe, som kan optage en hydron.",
        "essentiel aminosyre": "Byggesten til proteiner, som kroppen ikke selv kan danne, men skal tilføres med maden. Et voksent menneske skal have ni forskellige.",
        "amfoion": "Partikel med en positiv ladning i den ene ende og en negativ i den anden. Den samlede ladning er 0, og sådan findes en aminosyre i vand.",
        "fordelingsdiagram": "Graf, der viser andelen af molekylerne på hver form som funktion af pH. Hvor to kurver skærer hinanden, er pH lig med pKₛ.",
        "isoelektrisk punkt": "Den pH, hvor næsten alle molekyler af en aminosyre er amfoioner med samlet ladning 0. Ligger midt mellem de to pKₛ-værdier.",
        /* B7.8 Proteiner */
        "peptidbinding": "Forbinder to aminosyrer i en kæde. Carbon fra den enes carboxylgruppe er bundet til nitrogen fra den andens aminogruppe.",
        "dipeptid": "To aminosyrer, der er bundet sammen, for eksempel Ala-Gly.",
        "protein": "Én eller flere lange kæder af typisk 100 til 1000 aminosyrer, foldet til en bestemt form.",
        "primær struktur": "Rækkefølgen af aminosyrer i kæden. Den er bestemt af generne og ændres ikke ved denaturering.",
        "sekundær struktur": "De faste mønstre, en proteinkæde lægger sig i på grund af hydrogenbindinger i kæden. Hydrogenbindingerne går mellem C=O og N−H, og spiral og foldeblad er de to vigtigste mønstre.",
        "α-helix": "Mønster, hvor proteinkæden snor sig som en spiral. Hydrogenbindingerne går mellem vindingerne.",
        "β-foldeblad": "Mønster, hvor flere stykker af proteinkæden ligger side om side. De holdes sammen af hydrogenbindinger.",
        "tertiær struktur": "Den måde, hele kæden til sidst er foldet på, enten kugleformet eller som en fiber. Holdes sammen af bindinger mellem sidekæderne.",
        "hydrofob vekselvirkning": "Biokemiens navn for, at upolære sidekæder samler sig inde i proteinet, væk fra vandet. De holdes sammen af londonbindinger.",
        "disulfidbro": "Elektronparbinding mellem to svovlatomer, −S−S−, fra to sidekæder af cystein. Den stærkeste af bindingerne mellem sidekæder.",
        "kvaternær struktur": "Måden, flere peptidkæder er samlet på i ét protein. Hæmoglobin består af fire kæder.",
        "denaturering": "Proteinet folder sig ud og mister sin form, fordi de svage bindinger brydes. Peptidbindingerne brydes ikke. Et kogt æg er et eksempel."
    };

    /* Alle fagord fra listen sidder paa en figur */
    NK.UDELADT = [];

    /* Kondensation fra kapitel B4 (afsnit B4.5) staar igen i B7.3 over for
       hydrolyse (gentagelse er godt, brugeren 1. nov. 2026). Forklaringen er
       fra B4's fagordliste. */
    NK.TIDLIGERE = {
        "kondensation": "Reaktion, hvor to molekyler bindes sammen, og der fraspaltes et lille molekyle. Det er næsten altid vand."
    };
    Object.keys(NK.TIDLIGERE).forEach(function (o) { NK.FORKLARING[o] = NK.TIDLIGERE[o]; });

    /* Polysaccharid staar paa kortet med de tre slags kulhydrater i B7.1 og
       igen som overskrift over polysacchariderne i B7.3 */
    NK.GENTAGET = ["polysaccharid"];

    /* Fanerne i samme raekkefoelge som afsnittene. hash er de adresser, der
       aabner fanen direkte: index.html#b7.3 */
    NK.FANER = [
        { id: "mono",    nr: "B7.1", titel: "Monosaccharider", hash: ["mono", "monosaccharider", "b7.1"] },
        { id: "ring",    nr: "B7.2", titel: "Ringslutning",    hash: ["ring", "ringslutning", "b7.2"] },
        { id: "poly",    nr: "B7.3", titel: "Di- og poly",     hash: ["poly", "disaccharider", "polysaccharider", "b7.3"] },
        { id: "fehling", nr: "B7.4", titel: "Fehlings test",   hash: ["fehling", "fehlings-test", "b7.4"] },
        { id: "fedt",    nr: "B7.5", titel: "Fedtstoffer", hash: ["fedt", "fedtstoffer", "b7.5"] },
        { id: "iodtal",  nr: "B7.6", titel: "Iodtal",      hash: ["iodtal", "forsaebning", "iodtal-og-forsaebning", "b7.6"] },
        { id: "amino",   nr: "B7.7", titel: "Aminosyrer",  hash: ["amino", "aminosyrer", "b7.7"] },
        { id: "protein", nr: "B7.8", titel: "Proteiner",   hash: ["protein", "proteiner", "b7.8"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.mono = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

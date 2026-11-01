/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel 4

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 4 (NK_Undervisning/Kemibogen/fagord/kapitel-4.qmd) den
   1. nov. 2026; sænkede tal er skrevet som tegn (C₅H₁₂), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "4";
    NK.ANTAL_FAGORD = 43;

    NK.FORKLARING = {
        /* 4.1 Carbonhydrider og alkaner */
        "organisk kemi": "Læren om stoffer, der er bygget op omkring carbonatomer. Sukker, fedt, benzin og plastik er eksempler på stofferne.",
        "uorganisk": "Siges om stoffer uden bindinger mellem carbon og hydrogen. Vand, metaller og salte er eksempler, og carbondioxid og kalk regnes også med.",
        "carbonhydrid": "Stof, der kun består af C-atomer og H-atomer. Methan og butan er eksempler.",
        "alkan": "Carbonhydrid, hvor alle bindinger er enkeltbindinger. Navnet ender på -an, for eksempel methan og propan.",
        "molekylformel": "Tæller kun, hvor mange atomer der er af hver slags i et stof, for eksempel C₅H₁₂. Den viser ikke, hvordan atomerne sidder sammen.",
        "flygtig": "Siges om et stof, der fordamper let. Jo lavere kogepunkt stoffet har, jo lettere fordamper det, og benzin er et eksempel.",
        /* 4.2 Zigzagformler og navngivning */
        "zigzagformel": "Hurtig måde at tegne en carbonkæde på. Hver ende og hvert knæk på stregen er et carbonatom, og hydrogenatomerne tegnes ikke.",
        "uforgrenet": "Siges om en alkan, hvor alle carbonatomerne sidder i én lang kæde. Butan er et eksempel.",
        "forgrenet": "Siges om en alkan, hvor korte kæder sidder ude på siden af den lange kæde. 2-methylpropan er et eksempel.",
        "isomerer": "Stoffer med samme molekylformel, men forskellig strukturformel. Butan og 2-methylpropan er et eksempel.",
        "hovedkæde": "Den længste række af carbonatomer i et molekyle. Den giver den sidste del af navnet.",
        "sidegruppe": "Kort kæde, der sidder ude på den længste kæde i en alkan. Navnet ender på -yl, for eksempel methyl.",
        /* 4.3 Alkaners reaktioner */
        "forbrænding": "Reaktion, hvor et stof reagerer med dioxygen fra luften, og der bliver afgivet varme.",
        "fuldstændig": "Siges om en forbrænding, hvor der er dioxygen nok. Alt carbon bliver til carbondioxid, og alt hydrogen bliver til vand.",
        "afstemt": "Siges om et reaktionsskema med lige mange atomer af hver slags på begge sider af pilen. Det klares med koefficienter foran formlerne.",
        "ufuldstændig": "Siges om en forbrænding, hvor der er for lidt dioxygen. Der dannes også carbonmonoxid og sod, og soden gør flammen gul.",
        "carbonmonoxid": "Giftig gas med formlen CO, som hverken kan ses eller lugtes. Den dannes, når noget brænder med for lidt dioxygen, og kaldes også kulilte.",
        "substitution": "Reaktion, hvor et hydrogenatom i en alkan bliver skiftet ud med et chlor- eller bromatom. Den kræver lys.",
        /* 4.4 Alkener og addition */
        "alken": "Carbonhydrid med en dobbeltbinding mellem to carbonatomer. Navnet ender på -en, for eksempel ethen.",
        "alkyn": "Carbonhydrid med en tripelbinding mellem to carbonatomer. Navnet ender på -yn, for eksempel ethyn.",
        "mættet": "Siges om et carbonhydrid med kun enkeltbindinger mellem carbonatomerne. Det har det største antal hydrogenatomer, som carbonatomerne kan binde.",
        "umættet": "Siges om et carbonhydrid med en dobbeltbinding eller en tripelbinding. Det har færre hydrogenatomer end alkanen med samme antal carbonatomer.",
        "addition": "Reaktion, hvor en dobbeltbinding åbner sig, og to nye atomer sætter sig på. Der dannes kun ét stof.",
        "bromvand": "Gul væske, der bruges til at undersøge, om et stof har dobbeltbindinger. Farven forsvinder med det samme, når væsken rystes med en alken.",
        "polymerisation": "Reaktion, hvor mange tusinde små molekyler sætter sig sammen til én lang kæde. Sådan laves plastik af ethen.",
        "polymer": "Det lange molekyle, der dannes, når mange tusinde ethenmolekyler sætter sig sammen. Bæreposer og flasker er lavet af det.",
        "cycloalkan": "Carbonhydrid, hvor carbonatomerne sidder i en ring og kun er bundet med enkeltbindinger. Hvert carbonatom har to hydrogenatomer.",
        "aromatisk": "Siges om stoffer med en benzenring, som er en særlig stabil ring af seks carbonatomer.",
        /* 4.5 Alkoholer og carboxylsyrer */
        "funktionel gruppe": "Nogle få atomer i et organisk molekyle, som giver stoffet særlige egenskaber. −OH i ethanol er et eksempel.",
        "stofklasse": "Familie af organiske forbindelser med den samme funktionelle gruppe. Alkoholer er et eksempel.",
        "alkohol": "Organisk stof med en OH-gruppe, der sidder på et carbonatom. Navnet ender på -ol, for eksempel ethanol.",
        "hydroxygruppe": "Atomerne −OH, som sidder på et carbonatom i en alkohol. De gør den del af molekylet polær.",
        "carboxylsyre": "Organisk stof med gruppen −COOH. Det giver den sure smag i eddike, citroner og yoghurt.",
        "carboxylgruppe": "Atomerne −COOH, som sidder for enden af en organisk syre. C-atomet er bundet til et oxygenatom med dobbeltbinding og til OH.",
        /* 4.6 Fedtstoffer */
        "fedtsyre": "Carboxylsyre med en lang carbonkæde. De fleste i maden har 16 eller 18 carbonatomer.",
        "monoumættet": "Siges om en fedtsyre med én dobbeltbinding. Oliesyre er et eksempel.",
        "polyumættet": "Siges om en fedtsyre med mere end én dobbeltbinding. Linolsyre er et eksempel.",
        "fedtstof": "Stof bygget af ét molekyle glycerol og tre carboxylsyrer med lange kæder. Smør og olivenolie er eksempler.",
        "glycerol": "Alkohol med tre OH-grupper. Hver af dem kan binde en fedtsyre, så der dannes et fedtstof.",
        "triglycerid": "Andet navn for et fedtstof. Navnet fortæller, hvor mange fedtsyrer der sidder i molekylet.",
        "hydrolyse": "Spaltning af et fedtstof til glycerol og fedtsyrer. Den bruger vand og sker blandt andet i fordøjelsen.",
        "olie": "Fedtstof, der er flydende ved stuetemperatur. Det har mange umættede fedtsyrer med knæk på kæden.",
        "hærdning": "Metode, hvor dobbeltbindingerne i en planteolie reagerer med dihydrogen. Olien bliver til fast fedt, og sådan har man lavet margarine."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur */
    NK.UDELADT = [];

    /* Fagord, der med vilje staar paa mere end én figur: mættet i 4.4 ved
       alkanerne og igen i 4.6 ved stearinsyre (brugeren 1. nov. 2026: "lad
       bare eleven saette det paa igen") */
    NK.GENTAGET = ["mættet"];

    /* De seks faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#zigzag */
    NK.FANER = [
        { id: "alkan",   nr: "4.1", titel: "Alkaner",            hash: ["alkan", "alkaner", "carbonhydrider", "4.1"] },
        { id: "zigzag",  nr: "4.2", titel: "Zigzagformler",      hash: ["zigzag", "zigzagformler", "navngivning", "4.2"] },
        { id: "reak",    nr: "4.3", titel: "Reaktioner",         hash: ["reak", "reaktioner", "forbraending", "4.3"] },
        { id: "alken",   nr: "4.4", titel: "Alkener",            hash: ["alken", "alkener", "addition", "4.4"] },
        { id: "alkohol", nr: "4.5", titel: "Alkoholer og syrer", hash: ["alkohol", "alkoholer", "syrer", "4.5"] },
        { id: "fedt",    nr: "4.6", titel: "Fedtstoffer",        hash: ["fedt", "fedtstoffer", "4.6"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.zigzag = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

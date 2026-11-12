/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B8

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B8 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b8.qmd) den
   10. nov. 2026 med et lille script. Kursiv er taget af, K~F~ er skrevet
   KF og R~f~ Rf, fordi der ikke findes et saenket F og f.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "B8";
    NK.ANTAL_FAGORD = 38;

    NK.FORKLARING = {
        /* B8.1 Lægemidler og receptorer */
        "lægemiddel": "Stof, der bruges til at forebygge, lindre eller helbrede sygdom.",
        "virksomt stof": "Den del af en tablet, der virker mod sygdommen, for eksempel paracetamol i Panodil. Resten holder tabletten sammen.",
        "acetylsalicylsyre": "Det smertestillende stof i Aspirin og Magnyl. Molekylet har en benzenring med en carboxylgruppe og en estergruppe.",
        "paracetamol": "Det smertestillende stof i Panodil og Pinex. Molekylet har en hydroxygruppe på benzenringen og en amidgruppe.",
        "ibuprofen": "Det smertestillende stof i Ipren. Molekylet har en carboxylgruppe og en lang, upolær del.",
        "signalstof": "Lille molekyle, som en celle udskiller, og en anden celle opfanger. Adrenalin og dopamin er eksempler.",
        "receptor": "Protein, oftest i cellens membran, med en lomme, hvor netop ét signalstof passer ind.",
        "bindingslomme": "Det sted i en receptor, hvor signalstoffet eller lægemidlet bindes. Proteinet er foldet, så netop ét stof passer ind.",
        "agonist": "Stof, der ligner signalstoffet så meget, at det tænder receptoren og giver samme virkning. Morfin er et eksempel.",
        "antagonist": "Stof, der passer i receptorens lomme uden at tænde den. Det optager pladsen, så signalstoffet ikke kan bindes, og virkningen dæmpes.",
        /* B8.2 Kiralitet */
        "kiral": "Siges om et molekyle, der ikke kan bringes til at dække sit eget spejlbillede. To hænder er på samme måde spejlbilleder uden at være ens.",
        "kiralt center": "Carbonatom bundet til fire forskellige grupper. Det samme som et asymmetrisk carbonatom.",
        "spejlbilledformer": "De to udgaver af et molekyle med ét asymmetrisk carbonatom. De forholder sig til hinanden som højre og venstre hånd og kan virke forskelligt i kroppen.",
        "racemisk blanding": "Lige meget af de to spejlbilledformer af et stof. Det dannes normalt, når stoffet fremstilles i laboratoriet.",
        /* B8.3 Lægemidler som syrer og baser */
        "carboxylgruppe": "Atomerne −COOH i et molekyle. De gør et lægemiddel til en svag syre, for eksempel acetylsalicylsyre og ibuprofen.",
        "aminogruppe": "Atomerne −NH₂ i et molekyle. De gør et lægemiddel til en svag base, for eksempel adrenalin, amfetamin og morfin.",
        "hydrochlorid": "Salt, der dannes, når en amin reagerer med saltsyre. Saltet opløses let i vand, og derfor sælges mange lægemidler sådan.",
        /* B8.4 Log P og log D */
        "fordelingskonstant": "Koncentrationen af et stof i octan-1-ol divideret med koncentrationen i vand. Stoffet er rystet med de to væsker, og symbolet er KF.",
        "log P": "Mål for, hvor hydrofob den uladede form af et stof er. Ved værdien 2 er koncentrationen 100 gange så stor i octanol som i vand.",
        "fordelingsforhold": "Koncentrationen af uladet form i octanol divideret med den samlede koncentration i vand. Begge former medregnes i vandlaget, og symbolet er D.",
        "log D": "Viser, hvordan en syre eller base fordeler sig mellem octanol og vand ved en bestemt pH. Den ladede form medregnes.",
        /* B8.5 Fremstilling af acetylsalicylsyre */
        "ethansyreanhydrid": "Stoffet, der reagerer med salicylsyre og danner acetylsalicylsyre. To molekyler af syren i eddike, bundet sammen under fraspaltning af vand.",
        "filtrering": "Metode, der skiller et fast stof fra en væske. Krystallerne suges fri for væske på en tragt.",
        "råprodukt": "Krystallerne lige efter filtreringen, før de er renset. De indeholder stadig lidt salicylsyre.",
        "omkrystallisering": "Rensning af et fast stof, der opløses varmt og udfældes igen ved afkøling. Urenhederne bliver i opløsningen.",
        "separation": "Fælles navn for metoder, der skiller stoffer fra hinanden. Filtrering og chromatografi er eksempler, og hver metode udnytter en forskel i én egenskab.",
        "destillation": "Metode, der skiller væsker ad efter kogepunkt. Blandingen koges, og dampen køles til væske igen i en svaler.",
        "destillat": "Væsken, der drypper ud af svaleren. Den indeholder mest af det stof, der har det laveste kogepunkt.",
        /* B8.6 TLC */
        "chromatografi": "Fælles navn for metoder, der skiller en blanding ad ved at lade den vandre med en væske. Væsken løber hen over et fast stof.",
        "tyndtlagschromatografi": "Metode, hvor en væske suges op gennem kiselgel på en plade og skiller stofferne ad. Forkortes TLC.",
        "TLC": "Forkortelse for metoden, hvor pletter af prøver sættes på en plade med kiselgel. En væske fører dem med op ad pladen.",
        "stationær fase": "Laget på pladen, som stofferne bindes til. For det meste kiselgel, som er polær.",
        "mobil fase": "Væsken, der suges op gennem laget på pladen og fører stofferne med sig. Et organisk opløsningsmiddel eller en blanding af flere.",
        "løbevæske": "Et andet ord for den mobile fase. Den står i bunden af karret, og dens overflade skal være under startlinjen.",
        "væskefront": "Den øverste kant af den mobile fase på pladen. Her tegnes en streg, straks pladen tages op af karret.",
        "Rf-værdi": "Plettens afstand fra startlinjen divideret med væskefrontens afstand fra startlinjen. Et tal mellem 0 og 1 uden enhed.",
        /* B8.7 Hvor meget virksomt stof? */
        "salicylat": "Ion med en fri OH-gruppe på benzenringen. Den dannes, når det virksomme stof i Aspirin forsæbes, og giver et lilla kompleks med jern(III)ioner.",
        "kompleks": "Stof, hvor en metalion har bundet andre ioner eller molekyler til sig. Det lilla stof af jern(III) og salicylat er et eksempel."
    };

    /* Alle fagord fra listen sidder paa en figur */
    NK.UDELADT = [];

    /* Fagord fra tidligere kapitler, som eleven saetter paa igen (brugeren
       1. nov. 2026: "der maa gerne vaere lidt repeterende oevelser").
       Forklaringen er ordret fra det kapitels fagordliste. */
    NK.TIDLIGERE = {
        /* B3.4: det samme som kiralt center og spejlbilledformer (par i B8.2) */
        "asymmetrisk carbonatom": "C-atom bundet til fire forskellige grupper. Det mærkes med en stjerne, og molekylet findes i to former, der er hinandens spejlbilleder.",
        "spejlbilledisomerer": "To stoffer, der forholder sig til hinanden som en højre og en venstre hånd. Molekylerne kan ikke bringes til at dække hinanden.",
        /* B4.5: estergruppen i acetylsalicylsyre (B8.3) og syntesen (B8.5) */
        "estergruppe": "Atomerne −COO−, som binder syredelen og alkoholdelen sammen. De dannes ved en kondensation.",
        "kondensation": "Reaktion, hvor to molekyler bindes sammen, og der fraspaltes et lille molekyle. Det er næsten altid vand.",
        /* B4.5: trin 1 i maalingen (B8.7 henviser til B4.5) */
        "forsæbning": "Spaltning af en ester i stærkt basisk miljø. Syren bliver straks til sin baseform, så reaktionen forløber fuldstændig.",
        /* B5.2 og B5.4: maalingen i B8.7 */
        "absorbans": "Størrelse uden enhed med symbolet A. Jo mere lys opløsningen optager, jo større er den.",
        "standardkurve": "Graf over absorbansen af en række kendte opløsninger som funktion af koncentrationen. I det lineære område ligger punkterne på en ret linje."
    };
    Object.keys(NK.TIDLIGERE).forEach(function (o) { NK.FORKLARING[o] = NK.TIDLIGERE[o]; });

    /* Ingen fagord staar paa mere end én figur */
    NK.GENTAGET = [];

    /* De syv faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b8.3 */
    NK.FANER = [
        { id: "laegemidler", nr: "B8.1", titel: "Lægemidler",      hash: ["laegemidler", "receptorer", "b8.1"] },
        { id: "kiral",       nr: "B8.2", titel: "Kiralitet",       hash: ["kiral", "kiralitet", "b8.2"] },
        { id: "syrebase",    nr: "B8.3", titel: "Syre/base",       hash: ["syrebase", "syrer-og-baser", "b8.3"] },
        { id: "logd",        nr: "B8.4", titel: "Log P og D",      hash: ["logd", "logp", "log-p-og-log-d", "b8.4"] },
        { id: "syntese",     nr: "B8.5", titel: "Syntese",         hash: ["syntese", "acetylsalicylsyre", "b8.5"] },
        { id: "tlc",         nr: "B8.6", titel: "TLC",             hash: ["tlc", "b8.6"] },
        { id: "maaling",     nr: "B8.7", titel: "Måling",          hash: ["maaling", "virksomt-stof", "b8.7"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.laegemidler = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

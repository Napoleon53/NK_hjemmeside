/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B6

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B6 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b6.qmd) den
   10. nov. 2026 med et lille script. Hævede og sænkede tal er skrevet
   som tegn (H₃O⁺, 10⁻¹⁴), og kursiv er taget af. Symbolerne med et
   sænket bogstav er skrevet uden sænkning (Ks, pKs, Kb, pKb, Kv, cs),
   fordi der ikke findes et sænket b, og de skal se ens ud.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det).
       Kapitlet har seks afsnit fra 26. nov. 2026 (B6.1 og B6.2 lagt sammen
       til B6.1 Syrer, baser og pH; dagen før B6.3 og B6.4 til B6.2 Syre- og
       basestyrke). Fire af dem har fagord: B6.1, B6.2, B6.5 og B6.6. De seks
       figurer er blevet: to i B6.1 og to i B6.2, som i B2 og B8. */
    NK.KAPITEL = "B6";
    NK.ANTAL_FAGORD = 31;

    NK.FORKLARING = {
        /* B6.1 Syrer, baser og pH: syre-basereaktioner */
        "hydron": "Ionen H⁺, som kun består af en proton, fordi H-atomet har afgivet sin elektron. Syrer afgiver den, og baser optager den.",
        "syre": "Stof, der kan afgive en hydron, for eksempel HCl.",
        "base": "Stof, der kan optage en hydron, for eksempel NH₃.",
        "syre-basereaktion": "Overførsel af en hydron fra det stof, der afgiver den, til det stof, der optager den.",
        "korresponderende syre-basepar": "To partikler, der adskiller sig med præcis én hydron, for eksempel NH₄⁺ og NH₃. Den ene bliver til den anden ved at afgive en hydron.",
        "amfolyt": "Stof, der både kan afgive og optage en hydron. Vand er det vigtigste eksempel.",
        "monohydron": "Siges om en syre, der kun kan afgive én H⁺. Det gælder saltsyre, salpetersyre og ethansyre.",
        "polyhydron": "Siges om en syre, der kan afgive flere H⁺, én ad gangen. Svovlsyre og phosphorsyre er eksempler.",
        /* B6.1 Syrer, baser og pH: vands selvionisering og pH */
        "vands selvionisering": "To H₂O-molekyler reagerer med hinanden, så det ene afgiver en hydron til det andet. Der dannes en oxoniumion og en hydroxidion.",
        "vands ionprodukt": "Koncentrationen af oxoniumioner ganget med koncentrationen af hydroxidioner. Konstanten har symbolet Kv og er 1,0 · 10⁻¹⁴ M² ved 25 °C.",
        "pH": "Minus logaritmen til koncentrationen af oxoniumioner. Rent vand har værdien 7,00 ved 25 °C.",
        "pOH": "Minus logaritmen til koncentrationen af hydroxidioner. Summen af den og pH er 14,00 ved 25 °C.",
        /* B6.2 Syre- og basestyrke: syrestyrke */
        "syrestyrkekonstant": "Størrelsen Ks fra ligevægtsloven for et stof, der afgiver en hydron til vand. Jo større Ks er, jo længere ligger ligevægten mod højre.",
        "syrestyrkeeksponent": "Tallet pKs, som er minus logaritmen til Ks. Jo lavere det er, jo lettere afgiver stoffet sin hydron.",
        "stærk syre": "Har pKs under 0 og reagerer fuldstændigt med vand, så alle molekyler afgiver en hydron. Et eksempel er HCl.",
        "svag syre": "Har pKs mellem 4 og 10. Typisk har kun en lille del af molekylerne afgivet deres hydron, og reaktionen med vand er en ligevægt.",
        "middelstærk syre": "Har pKs mellem 0 og 4. Et eksempel er hydrogenfluorid, HF.",
        "formel koncentration": "Stofmængden pr. liter af en syre, hvis ingen molekyler havde reageret. Det er tallet på flasken, og symbolet er cs.",
        "aktuel koncentration": "Stofmængden pr. liter af de syremolekyler, der faktisk er i opløsningen ved ligevægt. Skrives [S].",
        "omdannelsesgrad": "Den brøkdel af en syre, der har afgivet sin hydron. Symbolet er α, og brøkdelen stiger, når opløsningen fortyndes.",
        /* B6.2 Syre- og basestyrke: basestyrke */
        "basestyrkekonstant": "Størrelsen Kb fra ligevægtsloven for et stof, der optager en hydron fra vand. Jo større Kb er, jo flere hydroxidioner dannes der.",
        "basestyrkeeksponent": "Tallet pKb, som er minus logaritmen til Kb. Summen af pKb og pKs for den korresponderende syre er 14,00.",
        "stærk base": "Har pKb under 0. Den vigtigste er hydroxidionen, OH⁻, som findes i natriumhydroxid og kaliumhydroxid.",
        /* B6.5 Puffersystemer */
        "puffersystem": "Opløsning med en svag syre og dens korresponderende base i omtrent lige store stofmængder. pH ændrer sig næsten ikke, når der tilsættes lidt syre eller base.",
        "pufferligningen": "Formel til at beregne pH, når der både er en svag syre og dens korresponderende base. pH er pKs plus logaritmen til forholdet mellem stofmængderne af base og syre.",
        /* B6.6 Titrering af en svag syre */
        "titrering": "Metode, hvor en opløsning med kendt koncentration tilsættes fra en burette. Tilsætningen stoppes, når stoffet i kolben netop har reageret fuldstændigt.",
        "ækvivalenspunkt": "Stedet på titrerkurven, hvor tilsat base og syren i kolben har samme stofmængde. Det ligger midt på det lodrette spring.",
        "titrerkurve": "Graf over pH som funktion af rumfanget af tilsat base. For en svag syre har den fire dele og et lodret spring.",
        "halvækvivalenspunkt": "Her er der tilsat halvdelen af den stofmængde base, der kræves for at omdanne al syren. pH er lig med syrens pKs.",
        "indikator": "Svag syre, hvor syreformen og baseformen har hver sin farve. Phenolphthalein og methylrødt er eksempler.",
        "omslagsområde": "Det pH-interval, hvor en indikator skifter farve. Ved en titrering skal det ligge inden for titrerkurvens lodrette spring."
    };

    /* Afsnittenes numre: B6.3 og B6.4 har ingen fagord */
    NK.AFSNIT = ["B6.1", "B6.1", "B6.2", "B6.2", "B6.5", "B6.6"];

    /* Alle fagord fra listen sidder paa en figur */
    NK.UDELADT = [];

    /* Ingen ord fra andre kapitler */
    NK.TIDLIGERE = {};

    /* Ord paa mere end én figur (gentagelse er godt, brugeren 1. nov. 2026):
       korresponderende syre-basepar staar igen i basestyrken (B6.2) ved NH₄⁺
       og NH₃, og syrestyrkeeksponent igen i B6.5 ved pKs i pufferligningen. */
    NK.GENTAGET = ["korresponderende syre-basepar", "syrestyrkeeksponent"];

    /* De seks faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b6.2 */
    NK.FANER = [
        { id: "reaktion",  nr: "B6.1", titel: "Syre-base",  hash: ["reaktion", "syre-basereaktioner", "syre-base", "b6.1"] },
        { id: "ph",        nr: "B6.1", titel: "pH",         hash: ["ph", "selvionisering", "vands-selvionisering"] },
        { id: "syre",      nr: "B6.2", titel: "Syrestyrke", hash: ["syre", "syrestyrke", "b6.2"] },
        { id: "base",      nr: "B6.2", titel: "Basestyrke", hash: ["base", "basestyrke"] },
        { id: "puffer",    nr: "B6.5", titel: "Puffere",    hash: ["puffer", "puffersystemer", "b6.5"] },
        { id: "titrering", nr: "B6.6", titel: "Titrering",  hash: ["titrering", "titrering-af-svag-syre", "b6.6"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.reaktion = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

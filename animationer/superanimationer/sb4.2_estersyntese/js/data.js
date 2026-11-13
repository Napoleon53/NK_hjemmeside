/* =====================================================================
   data.js - stofferne, opgaverne og de faste tekster

   Her kan man rette uden at roere koden:
     FARVE        syredelen (groen) og alkoholdelen (orange) som i bogens
                  figurer b4-esterdannelse og b4-esternavn
     KONDENSATION fane 1: de tre reaktioner, eleven ser
     OPGAVER      fane 2: ni opgaver. Med syre og alkohol tegner eleven
                  esteren. Med ester (Svaer) gaar opgaven baglaens: hvilken
                  syre og hvilken alkohol er esteren dannet af?
     RENS         fane 3: stofferne i skilletragten og spoergsmaalene

   Esterens navn staar IKKE her. Modellen (js/kemi.js) bygger esteren af
   syren og alkoholen, og molekylemotoren navngiver den. ester-feltet er
   facit, som selvtesten sammenligner med motoren. De forkerte svar til
   navnet laves af modellen ud fra de fejl, elever laver (byttet om,
   syrens navn uaendret, syredelen foerst).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    D.NIVEAUER = ["Let", "Middel", "Svær"];

    /* Bogens farver. blaek: paa det hvide whiteboard. lys: i panelet (moerkt) */
    D.FARVE = {
        syre: { blaek: "#0f766e", lys: "#5fc9b5", fyld: "rgba(15, 118, 110, 0.12)" },
        alkohol: { blaek: "#b45309", lys: "#f0a35a", fyld: "rgba(180, 83, 9, 0.12)" },
        blaek: "#1d2433"
    };

    /* Stammerne med antallet af carbonatomer (panelet paa fane 2 og navnene) */
    D.STAMMER = ["meth", "eth", "prop", "but", "pent", "hex", "hept", "oct"];

    /* ----- Fane 1: Kondensationen ---------------------------------------------
       Tre reaktioner. Den sidste er den samme som i den gamle animation og
       paa fane 3. om: en linje til forklaringen, naar navnet er fundet */
    D.KONDENSATION = [
        { syre: "ethansyre", alkohol: "ethanol", ester: "ethylethanoat",
          om: "Ethylethanoat bruges i neglelakfjerner og lim." },
        { syre: "butansyre", alkohol: "ethanol", ester: "ethylbutanoat",
          om: "Butansyre lugter af harsk smør, men ethylbutanoat dufter af ananas." },
        { syre: "butansyre", alkohol: "propan-1-ol", ester: "propylbutanoat",
          om: "Propylbutanoat renses på fanen Rens esteren." }
    ];

    /* ----- Fane 2: Forudsig esteren ---------------------------------------------
       Let: formlerne for syren og alkoholen staar paa tavlen. Middel: kun
       navnene. Svaer: esterens formel staar paa tavlen, og eleven finder
       syren, alkoholen og navnet (opgave B4.5.1 i bogen).
       syreValg, alkoholValg og navnValg: de tre svar, naar de ikke skal
       laves af modellen (den forgrenede alkohol) */
    D.OPGAVER = [
        { syre: "ethansyre", alkohol: "methanol", ester: "methylethanoat", niv: 1 },
        { syre: "propansyre", alkohol: "ethanol", ester: "ethylpropanoat", niv: 1 },
        { syre: "butansyre", alkohol: "methanol", ester: "methylbutanoat", niv: 1 },
        { syre: "ethansyre", alkohol: "propan-1-ol", ester: "propylethanoat", niv: 2 },
        { syre: "methansyre", alkohol: "ethanol", ester: "ethylmethanoat", niv: 2 },
        { syre: "ethansyre", alkohol: "pentan-1-ol", ester: "pentylethanoat", niv: 2,
          om: "Pentylethanoat dufter af pære." },
        { baglaens: true, syre: "propansyre", alkohol: "methanol", ester: "methylpropanoat", niv: 3 },
        { baglaens: true, syre: "methansyre", alkohol: "butan-1-ol", ester: "butylmethanoat", niv: 3 },
        { baglaens: true, syre: "ethansyre", alkohol: "3-methylbutan-1-ol", ester: "3-methylbutylethanoat", niv: 3,
          om: "3-Methylbutylethanoat dufter af banan.",
          alkoholValg: ["3-methylbutan-1-ol", "pentan-1-ol", "ethanol"],
          navnValg: ["3-methylbutylethanoat", "pentylethanoat", "ethyl-3-methylbutanoat"] }
    ];

    /* Vaerktoejerne oeverst paa tavlen (som paa tegnebraettet og i sb3.3) */
    D.VAERKTOEJ = [
        { id: "C", el: "C", tekst: "C", titel: "Carbon (tast C): træk fra et atom for at tegne en kæde, eller klik på et atom for at sætte et carbonatom på" },
        { id: "O", el: "O", tekst: "O", titel: "Oxygen (tast O): træk fra et carbonatom for at sætte et oxygenatom på, eller klik på et carbonatom for at gøre det til O" },
        { id: "gruppe:O", tekst: "=O", titel: "Klik på et carbonatom for at sætte et oxygenatom på med en dobbeltbinding" }
    ];

    /* Visningen paa tavlen: zigzag (som i bogen) eller alle atomer med H */
    D.STIL = [
        { id: "zigzag", tekst: "Zigzag", titel: "Zigzagformel som i bogen" },
        { id: "alle", tekst: "Alle atomer", titel: "Strukturformel med alle atomer, også H" }
    ];

    /* ----- Fane 3: Rens esteren --------------------------------------------------
       Blandingen fra kolben efter opvarmningen med tilbagesvaling, som i den
       gamle animation: butansyre og propan-1-ol i overskud med lidt
       koncentreret svovlsyre. antal: ikoner i luppen (et billede af
       forholdet, ikke stofmaengder). lag: hvor stoffet ender efter hver vask */
    D.RENS = {
        syre: "butansyre", alkohol: "propan-1-ol", ester: "propylbutanoat",
        stoffer: [
            { id: "ester", navn: "propylbutanoat", antal: 3 },
            { id: "alkohol", navn: "propan-1-ol", antal: 2 },
            { id: "syre", navn: "butansyre", antal: 2 },
            { id: "svovlsyre", navn: "svovlsyre", formel: "H₂SO₄", antal: 1 }
        ]
    };

    /* Trinene paa fane 3 (panelet). spm: spoergsmaalet paa kortet. svar:
       de svar, eleven vaelger imellem. rigtig: listen af rigtige svar (flere,
       naar flere passer). fejl: forklaringen til hvert forkert valg */
    D.RENS_TRIN = [
        { id: "vand", navn: "Vask med vand",
          spm: "Der tilsættes vand, og skilletragten rystes. Hvilke stoffer går over i vandfasen? Vælg alle, der passer.",
          svar: ["propylbutanoat", "propan-1-ol", "butansyre", "svovlsyre"], stof: ["ester", "alkohol", "syre", "svovlsyre"],
          rigtig: [1, 2, 3],
          fejl: {
              0: "Propylbutanoat har intet H på oxygen og kan ikke afgive hydrogenbindinger til vand.",
              mangler2: "Butansyre har en polær COOH-gruppe og en kort carbonkæde, så en del af butansyren går over i vandet.",
              mangler1: "Propan-1-ol har en OH-gruppe og en kort kæde og kan derfor blandes med vand.",
              mangler3: "Svovlsyre er en stærk syre, som danner ioner i vand."
          },
          hint: ["Stoffer med ioner eller en OH-gruppe på en kort kæde går over i vandet.", "Svovlsyren, det meste af alkoholen og noget af butansyren går over i vandet. Esteren bliver i det øverste lag."],
          rigtigTekst: "Svovlsyren, propan-1-ol og en del af butansyren går over i vandet. Esteren og resten af butansyren bliver i det øverste lag.",
          knap: "Ryst skilletragten →" },
        { id: "base", navn: "Vask med natriumcarbonat",
          spm: "Resten af butansyren er stadig i det øverste lag. Hvad sker der med butansyren, når der rystes med natriumcarbonatopløsning?",
          svar: ["Bliver til baseform i vandfasen", "Bliver til ester", "Bliver i det øverste lag"],
          rigtig: [0],
          fejl: {
              1: "I skilletragten er der hverken svovlsyre eller opvarmning. Carbonationen er en base.",
              2: "Carbonationen er en base. Den optager hydronen fra syrens COOH-gruppe."
          },
          hint: ["Carbonationen, CO₃²⁻, er en base. Hvad gør en base ved en syre?", "Baseformen af en carboxylsyre har en ladning. Ladede stoffer opløses i vand."],
          rigtigTekst: "Carbonationen optager hydronen fra butansyre. Baseformen, butanoat, har en ladning og opløses i vandfasen.",
          knap: "Tilsæt natriumcarbonat →" },
        { id: "gas", navn: "Det bruser",
          spm: "Det bruser i skilletragten. Hvilken gas dannes, når carbonationerne optager hydroner?",
          svar: ["Carbondioxid", "Dihydrogen", "Dioxygen"],
          rigtig: [0],
          fejl: {
              1: "Dihydrogen dannes, når en syre reagerer med et metal. Her er det carbonationen, der reagerer.",
              2: "Der er ingen oxidation her. Gassen kommer fra carbonationen, CO₃²⁻."
          },
          hint: ["Gassen kommer fra carbonationen, CO₃²⁻.", "CO₃²⁻ + 2 H⁺ giver vand og en gas med ét carbonatom."],
          rigtigTekst: "CO₃²⁻ + 2 H⁺ → CO₂ + H₂O. Gassen øger trykket, så skilletragten skal udluftes undervejs.",
          knap: "Tap vandfasen af →" },
        { id: "ester", navn: "Esteren",
          spm: "Nu er kun esteren tilbage i det øverste lag. Hvorfor ligger propylbutanoat øverst? Vælg alle, der passer.",
          svar: ["Den har intet H på oxygen", "Den har lavere densitet end vand", "Den har en ladning", "Den har en OH-gruppe"],
          rigtig: [0, 1],
          fejl: {
              2: "Esteren har ingen ladning. Den har kun en svagt polær estergruppe.",
              3: "Esteren har ingen OH-gruppe. Syrens OH-gruppe blev fraspaltet som vand, da esteren blev dannet.",
              mangler0: "Hvorfor blander esteren sig ikke med vandet? Se på oxygenatomerne i estergruppen.",
              mangler1: "Hvorfor ligger esteren øverst og ikke nederst? Det afgøres af densiteten."
          },
          hint: ["Der er to grunde: én til, at esteren ikke blander sig med vandet, og én til, at den ligger øverst.", "Esteren kan ikke afgive hydrogenbindinger til vand, og esterens densitet er lavere end vandets."],
          rigtigTekst: "Esteren kan ikke afgive hydrogenbindinger til vand, så de to væsker blander sig ikke. Esteren ligger øverst, fordi dens densitet er lavere end vandets." }
    ];

    D.FAERDIG = {
        k: "Alle tre reaktioner er set.",
        t: "Alle ni opgaver er løst.",
        s: "Esteren er ren."
    };

    D.TAL = ["ingen", "ét", "to", "tre", "fire", "fem", "seks", "syv", "otte"];
    D.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* Saenkede tal som HTML (<sub>), som er lettere at laese end tegnene ₀-₉ */
    var SAENKET = "₀₁₂₃₄₅₆₇₈₉";
    D.sub = function (html) {
        return String(html).replace(/[₀-₉]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET.indexOf(c); }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());

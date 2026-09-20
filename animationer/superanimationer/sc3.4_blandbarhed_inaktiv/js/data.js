/* =====================================================================
   data.js - de fem vaesker, blandingsskemaet, teorien og quizzen

   Alt, der kan slaas op i en tabel, staar her. Ingen af de to faner
   afgoer selv kemi: de spoerger D.par() og D.tilstand().

   Vaeskerne staar i raekkefoelge efter, hvor polaere de er: vand foerst,
   madolie sidst. Det er den raekkefoelge, skemaet paa fane 1 bruger, og
   den goer moensteret synligt: to vaesker, der staar ved siden af
   hinanden, blandes; to, der staar langt fra hinanden, goer ikke.

   Farverne er kun til at kende vaeskerne fra hinanden. I virkeligheden
   er de alle klare.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};
    NK.Data = D;

    /* ------------------------------------------------------------------
       VAESKERNE

       polaer   0 til 1, kun til tegningen: hvor stor en del af molekylet
                der er polaert. Blandbarheden slaas op i PAR, ikke her.
       taethed  g/mL ved 20 °C. Afgoer, hvilket lag der ligger oeverst.
       smp, kp  smelte- og kogepunkt i °C.
       mol      hvordan molekylet tegnes (js/molekyle.js).
       ------------------------------------------------------------------ */
    D.VAESKER = [
        {
            id: "vand", navn: "vand", formel: "H₂O", kort: "vand",
            farve: "#3d9ee0", polaer: 1.00, taethed: 1.00, smp: 0, kp: 100,
            kraft: "hydrogenbindinger",
            beskriv: "Et lille molekyle, der er polært hele vejen rundt.",
            mol: { type: "vand" }
        },
        {
            id: "ethanol", navn: "ethanol", formel: "C₂H₅OH", kort: "ethanol",
            farve: "#b06ad6", polaer: 0.62, taethed: 0.79, smp: -114, kp: 78,
            kraft: "hydrogenbindinger",
            beskriv: "En polær OH-gruppe og en kort upolær hale på to carbonatomer.",
            mol: { type: "kaede", c: 2, oh: true }
        },
        {
            id: "hexanol", navn: "hexan-1-ol", formel: "C₆H₁₃OH", kort: "hexanol",
            farve: "#46b58c", polaer: 0.28, taethed: 0.81, smp: -45, kp: 157,
            kraft: "hydrogenbindinger",
            beskriv: "Samme OH-gruppe som ethanol, men halen er tre gange så lang.",
            mol: { type: "kaede", c: 6, oh: true }
        },
        {
            id: "heptan", navn: "heptan", formel: "C₇H₁₆", kort: "heptan",
            farve: "#cfd6de", polaer: 0.02, taethed: 0.68, smp: -91, kp: 98,
            kraft: "London-kræfter",
            beskriv: "Kun carbon og hydrogen. Ingen polære grupper overhovedet.",
            mol: { type: "kaede", c: 7 }
        },
        {
            id: "olie", navn: "madolie", formel: "fedtstof", kort: "olie",
            farve: "#e0b53a", polaer: 0.05, taethed: 0.92, smp: -12, kp: 320,
            kraft: "London-kræfter",
            beskriv: "Tre lange, upolære haler på det samme molekyle. Meget stort.",
            mol: { type: "olie", skjulPolaer: true }
        }
    ];

    D.vaeske = function (id) {
        for (var i = 0; i < D.VAESKER.length; i++) {
            if (D.VAESKER[i].id === id) return D.VAESKER[i];
        }
        return null;
    };

    D.nr = function (id) {
        for (var i = 0; i < D.VAESKER.length; i++) {
            if (D.VAESKER[i].id === id) return i;
        }
        return -1;
    };

    /* ------------------------------------------------------------------
       BLANDINGSSKEMAET

       Hver post er ét par. blandbar afgoer, om der bliver ét eller to
       lag; hvorfor er den forklaring, der staar, naar forsoeget er gjort.

       Moensteret: jo mere af molekylet der ligner det andet stof, jo
       bedre blandes de. Ethanol er lille og har baade en polaer ende og
       en upolaer hale og kommer derfor laengst omkring. Vand er den
       kraesne, fordi hydrogenbindingerne mellem vandmolekylerne skal
       brydes, foer der er plads til noget andet.
       ------------------------------------------------------------------ */
    var PAR = {
        "vand+ethanol": {
            blandbar: true,
            hvorfor: "Ethanols OH-gruppe danner hydrogenbindinger til vandet, og halen er kort nok til, at vandet kan få plads til den."
        },
        "vand+hexanol": {
            blandbar: false,
            hvorfor: "Hexan-1-ol har den samme OH-gruppe som ethanol, men halen på seks carbonatomer er for lang. Vandmolekylerne holder hellere fast i hinanden."
        },
        "vand+heptan": {
            blandbar: false,
            hvorfor: "Heptan er upolær og kan hverken danne eller modtage hydrogenbindinger. Vandet lukker sig om sig selv og skubber heptanen ud."
        },
        "vand+olie": {
            blandbar: false,
            hvorfor: "Olie er store, upolære molekyler. De har intet at byde vandets hydrogenbindinger, og derfor bliver der to lag."
        },
        "ethanol+hexanol": {
            blandbar: true,
            hvorfor: "Begge har en OH-gruppe og en upolær hale. De ligner hinanden på begge punkter."
        },
        "ethanol+heptan": {
            blandbar: true,
            hvorfor: "Ethanols hale er upolær ligesom heptan, og molekylet er så lille, at OH-gruppen ikke trækker det fra hinanden igen."
        },
        "ethanol+olie": {
            blandbar: false,
            hvorfor: "Ethanols OH-grupper binder til hinanden, og oliens molekyler er både store og helt upolære. Den korte hale rækker ikke."
        },
        "hexanol+heptan": {
            blandbar: true,
            hvorfor: "Den lange hale på hexan-1-ol fylder mest og passer til heptan. Den ene OH-gruppe er for lidt til at holde dem adskilt."
        },
        "hexanol+olie": {
            blandbar: true,
            hvorfor: "Begge er lange, upolære kulbrintekæder med en enkelt polær gruppe eller ingen. London-kræfterne er ens."
        },
        "heptan+olie": {
            blandbar: true,
            hvorfor: "To upolære stoffer. Der er kun London-kræfter på begge sider, og de gør ingen forskel på, hvem de holder fast i."
        }
    };

    function noegle(a, b) {
        var ia = D.nr(a), ib = D.nr(b);
        return ia <= ib ? a + "+" + b : b + "+" + a;
    }

    /* Ét opslag i skemaet. Samme stof to gange er altid ét lag. */
    D.par = function (a, b) {
        if (a === b) {
            return { blandbar: true, hvorfor: "Det er det samme stof. Der er kun én slags molekyler." };
        }
        return PAR[noegle(a, b)] || { blandbar: true, hvorfor: "" };
    };

    /* Den af de to vaesker, der ligger oeverst, naar de ikke blandes.
       Det er den letteste - altsaa den med den mindste taethed. */
    D.oeverst = function (a, b) {
        var va = D.vaeske(a), vb = D.vaeske(b);
        return va.taethed <= vb.taethed ? va : vb;
    };

    /* ------------------------------------------------------------------
       FASER

       Under smeltepunktet er stoffet fast, over kogepunktet er det gas.
       Madolie er en blanding og har ikke ét skarpt smeltepunkt; den
       bliver grumset og stivner over et interval. Det er godt nok her.
       ------------------------------------------------------------------ */
    D.tilstand = function (v, temp) {
        if (temp < v.smp) return "fast";
        if (temp >= v.kp) return "gas";
        return "flydende";
    };

    D.TILSTANDSNAVN = { fast: "fast", flydende: "flydende", gas: "gas" };

    /* Hvor kraftigt stoffet fordamper fra overfladen ved en temperatur,
       0 til 1. Under kogepunktet er der stadig fordampning, og den
       tiltager, jo taettere man kommer paa. Over kogepunktet koger det.
       Det er ikke Clausius-Clapeyron, men det stiger paa samme maade og
       er nok til at vise pointen. */
    D.fordampning = function (v, temp) {
        if (temp >= v.kp) return 1;
        var afstand = (v.kp - temp) / Math.max(40, v.kp - v.smp);
        return NK.klamp(Math.exp(-3.2 * afstand), 0, 1) * 0.55;
    };

    /* ------------------------------------------------------------------
       TEORIEN - bag knappen, ikke paa siden
       ------------------------------------------------------------------ */
    D.TEORI = [
        {
            h: "Kræfterne mellem molekylerne",
            p: ["Inde i et molekyle holder de kovalente bindinger atomerne sammen. Mellem molekylerne er kræfterne meget svagere, og det er dem, der afgør, om stoffet er fast, flydende eller gas, og hvad det kan blandes med.",
                "<b>London-kræfter</b> findes mellem alle molekyler og vokser med molekylets størrelse. <b>Dipol-dipol</b> virker mellem polære molekyler. <b>Hydrogenbindinger</b> er de stærkeste og kræver, at hydrogen sidder på O, N eller F."]
        },
        {
            h: "Lige blander lige",
            p: ["To væsker blandes, når molekylerne i den ene kan erstatte molekylerne i den anden uden at miste noget. Polære stoffer blandes med polære, upolære med upolære.",
                "Det er ikke stoffernes tæthed, farve eller kogepunkt, der afgør det. Ethanol og vand har meget forskellig tæthed og blandes alligevel fuldstændigt."]
        },
        {
            h: "Halen tæller med",
            p: ["Ethanol og hexan-1-ol har den samme OH-gruppe, men ethanol blandes med vand, og hexan-1-ol gør ikke. Forskellen er halen: to carbonatomer mod seks.",
                "Jo større en del af molekylet der er upolær, jo mindre ligner det vand. Derfor kan det samme stof godt blandes med vand i den ene ende af en stofklasse og ikke i den anden."]
        },
        {
            h: "Hvem ligger øverst",
            p: ["Bliver der to lag, afgør <b>tætheden</b> rækkefølgen: det letteste lag ligger øverst. Olie ligger over vand, fordi olie er lettere end vand.",
                "Ethanol er lettere end olie og lægger sig derfor <i>over</i> olien. Det organiske lag er altså ikke altid det øverste."]
        },
        {
            h: "At ryste ændrer ingenting",
            p: ["En rystning river de to væsker i småbitte dråber, og blandingen bliver mælket. Det kaldes en emulsion.",
                "Polariteten er den samme bagefter, så dråberne finder sammen igen, og lagene kommer tilbage. Mælk og mayonnaise holder kun, fordi der er tilsat et stof, der har en polær og en upolær ende."]
        },
        {
            h: "Kogepunktet følger kræfterne",
            p: ["At koge er at rive molekylerne fri af hinanden. Jo stærkere kræfterne er mellem dem, jo mere energi skal der til, og jo højere er kogepunktet.",
                "Vand vejer mindre end ethanol og koger alligevel ved den højere temperatur, fordi hvert vandmolekyle kan danne flere hydrogenbindinger."]
        },
        {
            h: "Destillation",
            p: ["I en blanding af vand og ethanol koger ethanol først, fordi kogepunktet er lavere. Dampen føres væk og køles, og væsken, der kommer ud, er rigere på ethanol end den, man startede med.",
                "Det adskiller kun stoffer, hvis kogepunkterne er forskellige nok. Er de tæt på hinanden, kommer begge stoffer med over."]
        }
    ];

    /* ------------------------------------------------------------------
       QUIZZEN
       ------------------------------------------------------------------ */
    D.QUIZ = [
        {
            q: "Hvad afgør, om to væsker kan blandes?",
            svar: ["Hvor polære molekylerne er", "Væskernes tæthed", "Væskernes kogepunkt", "Molekylernes masse"],
            rigtig: 0,
            hvorfor: "Polariteten afgør blandbarheden. Tætheden afgør kun, hvilket lag der ligger øverst, hvis stofferne ikke kan blandes."
        },
        {
            q: "Vand og heptan hældes sammen. Hvad sker der?",
            svar: ["To lag med heptan øverst", "To lag med heptan nederst", "Ét lag", "Der dannes et nyt stof"],
            rigtig: 0,
            hvorfor: "Heptan er upolær og blandes ikke med vand. Heptan har tætheden 0,68 g/mL mod vandets 1,00 og ligger derfor øverst."
        },
        {
            q: "Ethanol blandes med vand. Hexan-1-ol gør ikke. Hvorfor?",
            svar: ["Hexan-1-ol har en længere upolær hale", "Hexan-1-ol har ingen OH-gruppe", "Hexan-1-ol er tungere end vand", "Hexan-1-ol koger ved en anden temperatur"],
            rigtig: 0,
            hvorfor: "Begge har en OH-gruppe. Halen på hexan-1-ol er seks carbonatomer lang og fylder for meget til, at vandet kan få plads til den."
        },
        {
            q: "Ethanol og madolie hældes sammen. Hvilket lag ligger øverst?",
            svar: ["Ethanol", "Olien", "De blandes til ét lag", "Det skifter hele tiden"],
            rigtig: 0,
            hvorfor: "De blandes ikke, og ethanol har tætheden 0,79 g/mL mod oliens 0,92. Ethanol ligger altså øverst. Det organiske lag er ikke altid det øverste."
        },
        {
            q: "Vand og olie rystes til en mælket emulsion. Hvad sker der bagefter?",
            svar: ["Det skiller sig ad igen", "Det bliver ved med at være blandet", "Olien opløses langsomt", "Vandet fordamper"],
            rigtig: 0,
            hvorfor: "Rystningen ændrer ikke polariteten. Dråberne finder sammen igen, og lagene kommer tilbage."
        },
        {
            q: "Vand koger ved 100 °C, ethanol ved 78 °C. Hvad skyldes forskellen?",
            svar: ["Vandmolekylerne holder hårdere fast i hinanden", "Vandmolekylerne er tungere", "Vand er et større molekyle", "Ethanol er en blanding"],
            rigtig: 0,
            hvorfor: "Ethanol vejer mere end vand (46 mod 18). Alligevel koger vand ved den højere temperatur, fordi hvert vandmolekyle kan danne flere hydrogenbindinger."
        },
        {
            q: "En blanding af vand og ethanol varmes op til 80 °C. Hvad kommer der først over i køleren?",
            svar: ["Mest ethanol", "Mest vand", "Lige meget af hver", "Ingen af delene"],
            rigtig: 0,
            hvorfor: "Ethanol koger ved 78 °C og vand ved 100 °C. Dampen ved 80 °C er derfor rig på ethanol. Det er princippet bag destillation."
        },
        {
            q: "Hvorfor kan man ikke vaske fedtet af hænderne med rent vand?",
            svar: ["Fedt er upolært og blandes ikke med vand", "Vand er for koldt", "Fedt er tungere end vand", "Fedt koger ved en høj temperatur"],
            rigtig: 0,
            hvorfor: "Sæbe virker, fordi sæbemolekylet har en polær ende, der vender mod vandet, og en upolær hale, der vender ind i fedtet."
        }
    ];
}());

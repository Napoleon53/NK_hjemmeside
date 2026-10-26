/* =====================================================================
   data.js - jagterne, isomererne og de faste tekster

   Her kan man rette uden at roere koden:
     JAGTER     de fem jagter: molekylformlen, isomererne og teksterne
     VAERKTOEJ  vaerktoejerne oeverst paa tavlen
     SLAGS      de tre slags strukturisomeri (svarene paa kortet)

   En jagt:
     id, formel   molekylformlen med almindelige tal (C4H10O). Antallet af
                  C og O laeses af den
     titel        kort navn (vises, naar musen holdes over flisen i panelet)
     niv          svaerhedsgraden: Let, Middel, Svaer eller Mester (flisen og kortet)
     tekst        opgaven paa kortet ved siden af den gule ramme med formlen
     kun          "alkohol": kun alkoholerne taeller (etherne afvises)
     dobbelt      sand: jagten har én dobbeltbinding (vaerktoejet = Binding);
                  cis og trans taeller som ét stof
     strategi     hint 1, saa laenge der mangler isomerer (bogens Hjaelp 1)
     kog          "raekke": eleven saetter alle i raekkefoelge efter
                  kogepunkt. "hoejest": eleven finder den med det hoejeste.
                  null: ingen kogepunkter; jagten slutter med slutTekst
     kogHint      to hint til kogepunkterne
     kogTekst     forklaringen paa det groenne kort. {navn} bliver til
                  stoffets kogepunkt (fx {pentan} -> 36 °C)
     isomerer     i den raekkefoelge, bogen finder dem (Hjaelp 1 og 2 til
                  opgave B3.3.6 og B3.3.8). navn er molekylemotorens navn;
                  selvtesten tjekker, at motoren tegner og navngiver det.
                  kp er kogepunktet i °C, mangler er hint 2, naar
                  stoffet er det foerste, der mangler, og form siger,
                  hvorfor stoffet er mere kugleformet end en isomer med
                  samme slags bindinger (forklaringen til en forkert
                  raekkefoelge)

   Kogepunkterne er tabelvaerdier ved 1 atm afrundet til hele grader.
   Dem, der ogsaa staar i sb4.4 Intermolekylaere bindinger, er de samme
   (CRC Handbook og NIST). Kilderne til resten staar i README.md.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    D.TAL = ["nul", "én", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti"];

    /* Stofklasserne paa hylden (overskriften over hver gruppe) */
    D.KLASSER = {
        alkan: { navn: "Alkaner", ental: "en alkan" },
        alken: { navn: "Alkener", ental: "en alken" },
        alkohol: { navn: "Alkoholer", ental: "en alkohol" },
        ether: { navn: "Ethere", ental: "en ether" }
    };

    D.JAGTER = [
        {
            id: "c5h12", formel: "C5H12", titel: "Alkaner", niv: "Let",
            tekst: "Molekylformlen passer til tre forskellige alkaner. Tegn dem én ad gangen, og tryk Indsend svar.",
            strategi: "Begynd med den lige kæde. Gør den ét carbonatom kortere, og sæt det sidste på som en sidegren.",
            kog: "raekke",
            kogHint: [
                "Alle tre er alkaner med kun londonbindinger. Se på formen: lang og lige eller kugleformet?",
                "Jo mere forgrenet molekylet er, jo mindre er kontaktfladen og jo lavere er kogepunktet."
            ],
            kogTekst: "Pentan {pentan}, 2-methylbutan {2-methylbutan} og 2,2-dimethylpropan {2,2-dimethylpropan}. Jo mere forgrenet, jo mindre kontaktflade og jo svagere londonbindinger.",
            isomerer: [
                { navn: "pentan", kp: 36, mangler: "Der mangler stoffet med den lige kæde: fem carbonatomer på en række." },
                { navn: "2-methylbutan", kp: 28, form: "forgrenet", mangler: "Der mangler et stof med fire carbonatomer i kæden og en methylgruppe på." },
                { navn: "2,2-dimethylpropan", kp: 10, form: "forgrenet to gange", mangler: "Der mangler et stof med tre carbonatomer i kæden og to methylgrupper på det midterste." }
            ]
        },
        {
            id: "c2h6o", formel: "C2H6O", titel: "Alkohol og ether", niv: "Let",
            tekst: "Molekylformlen passer til to stoffer: en alkohol og en ether. Tegn dem én ad gangen, og tryk Indsend svar.",
            strategi: "Oxygenatomet kan sidde for enden som en OH-gruppe eller midt i kæden mellem to carbonatomer.",
            kog: "raekke",
            kogHint: [
                "Hvilket af de to stoffer har et hydrogenatom på oxygen?",
                "Et stof med en OH-gruppe danner hydrogenbindinger, og de er stærkere end de andre bindinger."
            ],
            kogTekst: "Ethanol koger ved {ethanol} og dimethylether ved {dimethylether}. Ethanol har en OH-gruppe og danner hydrogenbindinger. Det kan dimethylether ikke.",
            isomerer: [
                { navn: "ethanol", kp: 78, mangler: "Der mangler en alkohol: to carbonatomer og en OH-gruppe for enden." },
                { navn: "dimethylether", kp: -25, mangler: "Der mangler en ether: oxygenatomet sidder mellem de to carbonatomer, C−O−C." }
            ]
        },
        {
            id: "c3h8o", formel: "C3H8O", titel: "Alkoholer og ether", niv: "Let",
            tekst: "Molekylformlen passer til tre stoffer: to alkoholer og en ether. Tegn dem én ad gangen, og tryk Indsend svar.",
            strategi: "Begynd med alkoholerne, og flyt OH-gruppen. Sæt så oxygenatomet ind midt i kæden.",
            kog: "raekke",
            kogHint: [
                "Hvilke af stofferne har en OH-gruppe og danner hydrogenbindinger? De koger højest.",
                "Har to stoffer de samme slags bindinger, koger det mest kugleformede molekyle lavest."
            ],
            kogTekst: "Propan-1-ol {propan-1-ol}, propan-2-ol {propan-2-ol} og ethylmethylether {ethylmethylether}. Kun alkoholerne danner hydrogenbindinger, og propan-2-ol er mere kugleformet.",
            isomerer: [
                { navn: "propan-1-ol", kp: 97, mangler: "Der mangler en alkohol med OH-gruppen for enden af en kæde med tre carbonatomer." },
                { navn: "propan-2-ol", kp: 82, form: "mere kugleformet",mangler: "Der mangler en alkohol med OH-gruppen på det midterste af tre carbonatomer." },
                { navn: "ethylmethylether", kp: 7, mangler: "Der mangler en ether: oxygenatomet sidder mellem ét og to carbonatomer, C−O−C−C." }
            ]
        },
        {
            id: "c4h10o", formel: "C4H10O", titel: "Alkoholer og ethere", niv: "Middel",
            tekst: "Molekylformlen passer til syv stoffer: fire alkoholer og tre ethere. Tegn én ad gangen, og tryk Indsend svar.",
            strategi: "Begynd med en lige kæde, og flyt OH-gruppen. Gør så kæden forgrenet. Til sidst etherne.",
            kog: "hoejest",
            kogHint: [
                "Kun alkoholerne danner hydrogenbindinger. Det højeste kogepunkt har en af dem.",
                "Blandt alkoholerne koger den højest, der har den lige kæde og OH-gruppen for enden."
            ],
            kogTekst: "Butan-1-ol koger ved {butan-1-ol}. Alkoholerne danner hydrogenbindinger, og butan-1-ol har den lige kæde med den største kontaktflade.",
            isomerer: [
                { navn: "butan-1-ol", kp: 118, mangler: "Der mangler en alkohol med fire carbonatomer på en række og OH-gruppen for enden." },
                { navn: "butan-2-ol", kp: 100, mangler: "Der mangler en alkohol med fire carbonatomer på en række og OH-gruppen på nr. 2." },
                { navn: "2-methylpropan-1-ol", kp: 108, mangler: "Der mangler en alkohol med en forgrenet kæde og OH-gruppen for enden." },
                { navn: "2-methylpropan-2-ol", kp: 82, mangler: "Der mangler en alkohol med OH-gruppen på det carbonatom, hvor kæden forgrener sig." },
                { navn: "diethylether", kp: 35, mangler: "Der mangler en ether med to carbonatomer på hver side af oxygenatomet." },
                { navn: "methylpropylether", kp: 39, mangler: "Der mangler en ether med ét carbonatom på den ene side og tre på række på den anden." },
                { navn: "2-methoxypropan", kp: 31, mangler: "Der mangler en ether, hvor O sidder på det midterste af tre carbonatomer og har et CH₃." }
            ]
        },
        {
            id: "c5h12o", formel: "C5H12O", titel: "Kun alkoholer", niv: "Middel", kun: "alkohol",
            tekst: "Molekylformlen passer til otte alkoholer. Tegn dem én ad gangen, og tryk Indsend svar. Etherne tæller ikke.",
            strategi: "Fem på række: flyt OH-gruppen. Så fire i kæden og en methylgruppe. Til sidst tre og to methylgrupper.",
            kog: "hoejest",
            kogHint: [
                "Alle otte er alkoholer og danner hydrogenbindinger. Se på formen af molekylerne.",
                "Den lige kæde med OH-gruppen for enden har den største kontaktflade."
            ],
            kogTekst: "Pentan-1-ol koger ved {pentan-1-ol}. Den lige kæde med OH-gruppen for enden har den største kontaktflade og de stærkeste londonbindinger.",
            isomerer: [
                { navn: "pentan-1-ol", kp: 138, mangler: "Der mangler en alkohol med fem carbonatomer på en række og OH-gruppen for enden." },
                { navn: "pentan-2-ol", kp: 119, mangler: "Der mangler en alkohol med fem carbonatomer på en række og OH-gruppen på nr. 2." },
                { navn: "pentan-3-ol", kp: 116, mangler: "Der mangler en alkohol med fem carbonatomer på en række og OH-gruppen på det midterste." },
                { navn: "3-methylbutan-1-ol", kp: 131, mangler: "Der mangler en alkohol med fire carbonatomer i kæden, OH på nr. 1 og en methylgruppe på nr. 3." },
                { navn: "2-methylbutan-1-ol", kp: 128, mangler: "Der mangler en alkohol med fire carbonatomer i kæden, OH på nr. 1 og en methylgruppe på nr. 2." },
                { navn: "2-methylbutan-2-ol", kp: 102, mangler: "Der mangler en alkohol, hvor methylgruppen og OH-gruppen sidder på samme carbonatom." },
                { navn: "3-methylbutan-2-ol", kp: 112, mangler: "Der mangler en alkohol med fire carbonatomer i kæden, OH på nr. 2 og en methylgruppe på nr. 3." },
                { navn: "2,2-dimethylpropan-1-ol", kp: 113, mangler: "Der mangler en alkohol med tre carbonatomer i kæden, to methylgrupper og OH-gruppen for enden." }
            ]
        },
        {
            id: "c6h14", formel: "C6H14", titel: "Fem alkaner", niv: "Svær",
            tekst: "Molekylformlen passer til fem alkaner. Pas på: mange af dem kan tegnes, så de ligner et andet stof.",
            strategi: "Seks på række. Så fem i kæden og en methylgruppe på nr. 2 eller 3. Så fire i kæden og to methylgrupper.",
            kog: "hoejest",
            kogHint: [
                "Alle fem er alkaner med kun londonbindinger. Se på formen af molekylerne.",
                "Den lige kæde har den største kontaktflade og de stærkeste londonbindinger."
            ],
            kogTekst: "Hexan koger ved {hexan}. Den lige kæde har den største kontaktflade. 2,2-dimethylbutan er mest kugleformet og koger ved {2,2-dimethylbutan}.",
            isomerer: [
                { navn: "hexan", kp: 69, mangler: "Der mangler stoffet med den lige kæde: seks carbonatomer på en række." },
                { navn: "2-methylpentan", kp: 60, mangler: "Der mangler et stof med fem carbonatomer i kæden og en methylgruppe på nr. 2." },
                { navn: "3-methylpentan", kp: 63, mangler: "Der mangler et stof med fem carbonatomer i kæden og en methylgruppe på det midterste." },
                { navn: "2,2-dimethylbutan", kp: 50, mangler: "Der mangler et stof med fire carbonatomer i kæden og to methylgrupper på samme C." },
                { navn: "2,3-dimethylbutan", kp: 58, mangler: "Der mangler et stof med fire carbonatomer i kæden og en methylgruppe på hvert af de to midterste." }
            ]
        },
        {
            id: "c5h10", formel: "C5H10", titel: "Alkener", niv: "Svær", dobbelt: true,
            tekst: "Molekylformlen passer til fem alkener uden ring. Tegn dem én ad gangen. Cis og trans tæller som ét stof her.",
            strategi: "Fem på række, og flyt dobbeltbindingen. Gør så kæden forgrenet, og flyt dobbeltbindingen igen.",
            kog: null,
            slutTekst: "Alle fem alkener er fundet. Dobbeltbindingen kan flytte sig, og kæden kan forgrene sig. Cis og trans kommer i B3.4.",
            isomerer: [
                { navn: "pent-1-en", mangler: "Der mangler en alken med fem carbonatomer på en række og dobbeltbindingen for enden." },
                { navn: "pent-2-en", mangler: "Der mangler en alken med fem carbonatomer på en række og dobbeltbindingen fra nr. 2." },
                { navn: "2-methylbut-1-en", mangler: "Der mangler en alken med fire i kæden, dobbeltbindingen for enden og CH₃ på nr. 2." },
                { navn: "3-methylbut-1-en", mangler: "Der mangler en alken med fire i kæden, dobbeltbindingen for enden og CH₃ på nr. 3." },
                { navn: "2-methylbut-2-en", mangler: "Der mangler en alken med fire i kæden, CH₃ på nr. 2 og dobbeltbindingen fra nr. 2." }
            ]
        },
        {
            id: "c5h12o-alle", formel: "C5H12O", titel: "Mesterjagten", niv: "Mester",
            tekst: "Mesterjagten: molekylformlen passer til fjorten stoffer, otte alkoholer og seks ethere. Find dem alle.",
            strategi: "Først de otte alkoholer. Del så de fem carbonatomer 1 + 4 og 2 + 3 om oxygenatomet, og forgren dem.",
            kog: "hoejest",
            kogHint: [
                "Kun alkoholerne danner hydrogenbindinger. Det højeste kogepunkt har en af dem.",
                "Blandt alkoholerne koger den højest, der har den lige kæde og OH-gruppen for enden."
            ],
            kogTekst: "Pentan-1-ol koger ved {pentan-1-ol}. Alkoholerne danner hydrogenbindinger, og pentan-1-ol har den lige kæde med den største kontaktflade.",
            isomerer: [
                { navn: "pentan-1-ol", kp: 138, mangler: "Der mangler en alkohol med fem carbonatomer på en række og OH-gruppen for enden." },
                { navn: "pentan-2-ol", kp: 119, mangler: "Der mangler en alkohol med fem carbonatomer på en række og OH-gruppen på nr. 2." },
                { navn: "pentan-3-ol", kp: 116, mangler: "Der mangler en alkohol med fem carbonatomer på en række og OH-gruppen på det midterste." },
                { navn: "3-methylbutan-1-ol", kp: 131, mangler: "Der mangler en alkohol med fire carbonatomer i kæden, OH på nr. 1 og en methylgruppe på nr. 3." },
                { navn: "2-methylbutan-1-ol", kp: 128, mangler: "Der mangler en alkohol med fire carbonatomer i kæden, OH på nr. 1 og en methylgruppe på nr. 2." },
                { navn: "2-methylbutan-2-ol", kp: 102, mangler: "Der mangler en alkohol, hvor methylgruppen og OH-gruppen sidder på samme carbonatom." },
                { navn: "3-methylbutan-2-ol", kp: 112, mangler: "Der mangler en alkohol med fire carbonatomer i kæden, OH på nr. 2 og en methylgruppe på nr. 3." },
                { navn: "2,2-dimethylpropan-1-ol", kp: 113, mangler: "Der mangler en alkohol med tre carbonatomer i kæden, to methylgrupper og OH-gruppen for enden." },
                { navn: "butylmethylether", kp: 70, mangler: "Der mangler en ether med ét carbonatom på den ene side af O og fire på række på den anden." },
                { navn: "ethylpropylether", kp: 63, mangler: "Der mangler en ether med to carbonatomer på den ene side af O og tre på række på den anden." },
                { navn: "1-methoxy-2-methylpropan", kp: 59, mangler: "Der mangler en ether: CH₃ på den ene side af O og en forgrenet gruppe, der sidder med CH₂ på O." },
                { navn: "2-methoxybutan", kp: 59, mangler: "Der mangler en ether: O sidder på nr. 2 i en kæde med fire carbonatomer og har et CH₃." },
                { navn: "2-methoxy-2-methylpropan", kp: 55, mangler: "Der mangler en ether: O sidder på et carbonatom med tre CH₃-grupper og har selv et CH₃." },
                { navn: "2-ethoxypropan", kp: 54, mangler: "Der mangler en ether: O sidder på det midterste af tre carbonatomer og har to C på den anden side." }
            ]
        }
    ];

    /* De tre slags strukturisomeri. Svarene paa kortet staar i denne raekkefoelge. */
    D.SLAGS = [
        { id: "kaede", t: "Kædeisomerer" },
        { id: "stilling", t: "Stillingsisomerer" },
        { id: "funktion", t: "Funktionsisomerer" }
    ];

    /* Hoejst saa mange spoergsmaal om hver slags isomeri i en jagt */
    D.SPM_PR_SLAGS = 2;

    /* Vaerktoejerne oeverst paa tavlen. ilt: kun i jagter med oxygen.
       dobbelt: kun i jagter med en dobbeltbinding */
    D.VAERKTOEJ = [
        { id: "tegn", tekst: "Kæde", titel: "Træk fra et atom, eller klik på et: kæden vokser med ét carbonatom" },
        { id: "binding", tekst: "= Binding", titel: "Klik på en binding mellem to carbonatomer: enkelt eller dobbelt", dobbelt: true },
        { id: "gruppe:OH", tekst: "−OH", titel: "Klik på et carbonatom for at sætte en OH-gruppe på", ilt: true },
        { id: "skiftO", tekst: "C → O", titel: "Klik på et carbonatom for at gøre det til et oxygenatom. Klik på O igen for at gøre det til C", ilt: true }
    ];

    /* Medaljen til sidst: stjerner ud af de fem jagter */
    D.MEDALJE = function (stjerner, ialt) {
        if (stjerner >= ialt) return { id: "guld", navn: "Guld", tekst: "Alle " + ialt + " jagter uden fejl og uden at se svaret." };
        if (stjerner >= Math.ceil(ialt * 2 / 3)) return { id: "soelv", navn: "Sølv", tekst: stjerner + " af " + ialt + " jagter uden fejl og uden at se svaret." };
        return { id: "bronze", navn: "Bronze", tekst: stjerner + " af " + ialt + " jagter uden fejl og uden at se svaret." };
    };

    /* ----- Hjaelpere ------------------------------------------------------ */
    D.jagt = function (id) {
        for (var i = 0; i < D.JAGTER.length; i++) if (D.JAGTER[i].id === id) return D.JAGTER[i];
        return null;
    };

    D.isomer = function (jagt, navn) {
        for (var i = 0; i < jagt.isomerer.length; i++) if (jagt.isomerer[i].navn === navn) return jagt.isomerer[i];
        return null;
    };

    /* Antallet af C og O i molekylformlen */
    D.antal = function (jagt) {
        var m = /^C(\d*)H(\d+)(O(\d*))?$/.exec(jagt.formel);
        return { C: m[1] ? +m[1] : 1, H: +m[2], O: m[3] ? (m[4] ? +m[4] : 1) : 0 };
    };

    D.formelVist = function (jagt) { return NK.formel(jagt.formel); };

    /* Saenkede tal som HTML (<sub>), som er lettere at laese end tegnene ₀-₉.
       D.sub skifter dem ud i en tekst, der allerede er HTML. */
    var SAENKET = "₀₁₂₃₄₅₆₇₈₉";
    D.sub = function (html) {
        return String(html).replace(/[₀-₉]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET.indexOf(c); }).join("") + "</sub>";
        });
    };
    D.formelHTML = function (jagt) { return jagt.formel.replace(/\d+/g, function (m) { return "<sub>" + m + "</sub>"; }); };

    /* Kogepunkterne bruges kun, naar jagten slutter med dem */
    D.harKog = function (jagt) { return !!jagt.kog; };

    /* Kogepunktet som tekst med minus og hele grader: −25 °C */
    D.kpTekst = function (kp) { return (kp < 0 ? "−" + (-kp) : String(kp)) + " °C"; };

    /* Forklaringen paa det groenne kort med kogepunkterne sat ind */
    D.kogTekst = function (jagt) {
        if (!jagt.kog) return jagt.slutTekst;
        return jagt.kogTekst.replace(/\{([^}]+)\}/g, function (m, navn) {
            var iso = D.isomer(jagt, navn);
            return iso ? D.kpTekst(iso.kp) : m;
        });
    };

    /* Et navn kan deles efter bindestreger og -yl, saa lange navne knaekker
       paa et paent sted paa hylden: 2,2-dimethyl|propan-1-ol */
    D.navnHTML = function (navn) {
        return NK.html(navn).replace(/(yl|oxy)(?=[a-z])/g, "$1<wbr>").replace(/-/g, "-<wbr>");
    };

    D.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    NK.Data = D;
}());

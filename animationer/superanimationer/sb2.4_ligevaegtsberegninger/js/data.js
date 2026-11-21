/* =====================================================================
   data.js - stofferne, de tre reaktioner i beholderen og de 13 opgaver

   Opgaverne er de samme som i den gamle b2.3 med de samme tal.
   Talvaerdierne er konstrueret, saa regningen bliver overskuelig; de
   er ikke maalt. Facit (x, ligevaegtskoncentrationerne, K og CAS'
   loesninger) staar ingen steder her: det regnes af skemaet i
   js/model.js. Selvtesten tjekker, at det giver den gamles facit.

   Et skema skrives som i sb2.1: r og p er lister af
   [koefficient, stof, tilstandsform].
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne ---------------------------------------------------------
       vis: saadan staar stoffet paa skaermen. alias: det, eleven maa skrive
       inden i [ ] (sammenlignes uden mellemrum og store bogstaver).
       atomer: tegningen i beholderen paa fane 1 (grundstof og plads i
       atomradier). */
    D.STOF = {
        NOCl:   { vis: "NOCl", alias: ["nocl"] },
        NO:     { vis: "NO", alias: ["no"] },
        Cl2:    { vis: "Cl₂", alias: ["cl2"], atomer: [["Cl", -0.55, 0], ["Cl", 0.55, 0]] },
        N2:     { vis: "N₂", alias: ["n2"] },
        H2:     { vis: "H₂", alias: ["h2"], atomer: [["H", -0.38, 0], ["H", 0.38, 0]] },
        NH3:    { vis: "NH₃", alias: ["nh3"] },
        CO:     { vis: "CO", alias: ["co"], atomer: [["C", -0.5, 0], ["O", 0.5, 0]] },
        H2O:    { vis: "H₂O", alias: ["h2o"], atomer: [["O", 0, 0], ["H", -0.62, 0.42], ["H", 0.62, 0.42]] },
        CO2:    { vis: "CO₂", alias: ["co2"], atomer: [["O", -0.95, 0], ["C", 0, 0], ["O", 0.95, 0]] },
        COCl2:  { vis: "COCl₂", alias: ["cocl2"] },
        SO3:    { vis: "SO₃", alias: ["so3"] },
        SO2:    { vis: "SO₂", alias: ["so2"], atomer: [["S", 0, 0.1], ["O", -0.85, -0.35], ["O", 0.85, -0.35]] },
        O2:     { vis: "O₂", alias: ["o2"] },
        SO2Cl2: { vis: "SO₂Cl₂", alias: ["so2cl2"], atomer: [["S", 0, 0], ["O", 0, -0.95], ["O", 0, 0.95], ["Cl", -1.0, 0], ["Cl", 1.0, 0]] },
        Br2:    { vis: "Br₂", alias: ["br2"], atomer: [["Br", -0.55, 0], ["Br", 0.55, 0]] },
        HBr:    { vis: "HBr", alias: ["hbr"], atomer: [["H", -0.62, 0], ["Br", 0.3, 0]] },
        I2:     { vis: "I₂", alias: ["i2"] },
        I:      { vis: "I", alias: ["i"] },
        nbutan:   { vis: "butan", alias: ["n-butan", "nbutan", "butan", "n-c4h10"] },
        isobutan: { vis: "2-methylpropan", alias: ["isobutan", "i-butan", "ibutan", "methylpropan", "2-methylpropan"] },
        cis:      { vis: "cis-but-2-en", alias: ["cis-2-buten", "cis-buten", "cisbuten", "cis2buten", "cis", "cis-but-2-en"] },
        trans:    { vis: "trans-but-2-en", alias: ["trans-2-buten", "trans-buten", "transbuten", "trans2buten", "trans", "trans-but-2-en"] }
    };

    /* Stoffernes daempede farver i beholderen, i taelleren og paa skemaets
       kolonneoverskrifter (runde 2, Niels 21. nov. 2026: "forvirrende med alle
       de farver ... farvekodes på det er rart for øjnene"). Hvert molekyle er
       tegnet i én farve; atomernes farver bruges ikke. Stofferne i samme
       reaktion har farver, der er lette at skelne. */
    D.FARVE = {
        SO2Cl2: "#7fa7c9", SO2: "#d9a066", Cl2: "#8fbf8a",
        H2: "#b7a4d6", Br2: "#c98f7a", HBr: "#d6c27a",
        CO: "#9aa9bb", H2O: "#78b8c2", CO2: "#d9a066"
    };

    /* Atomernes stoerrelse og plads i beholderen (farven bruges ikke laengere) */
    D.ATOM = {
        H:  { farve: "#eef1f4", kant: "#9aa3ad", r: 0.62 },
        C:  { farve: "#4b4f57", kant: "#25282d", r: 0.9 },
        O:  { farve: "#e4483a", kant: "#8f2219", r: 0.88 },
        S:  { farve: "#e8c337", kant: "#8d7414", r: 1.0 },
        Cl: { farve: "#43b65a", kant: "#1f6b2e", r: 0.95 },
        Br: { farve: "#9c3b2c", kant: "#561c13", r: 1.02 }
    };

    /* ----- Fane 1: de tre reaktioner i beholderen ------------------------------
       c0: startkoncentrationerne (M). enhed: hvor meget ét molekyle er.
       xStof og xOrd: x er den koncentration af xStof, der er xOrd. */
    D.RX = {
        a: { id: "a", navn: "Sulfurylchlorid spaltes", T: "375 °C", K: 0.0500,
             r: [[1, "SO2Cl2", "g"]], p: [[1, "SO2", "g"], [1, "Cl2", "g"]],
             c0: { SO2Cl2: 0.200, SO2: 0, Cl2: 0 }, enhed: 0.010, xStof: "SO2Cl2", xOrd: "spaltet" },
        b: { id: "b", navn: "Hydrogenbromid dannes", T: "500 K", K: 64.0,
             r: [[1, "H2", "g"], [1, "Br2", "g"]], p: [[2, "HBr", "g"]],
             c0: { H2: 0.200, Br2: 0.200, HBr: 0 }, enhed: 0.020, xStof: "H2", xOrd: "omsat" },
        c: { id: "c", navn: "Vandgasligevægten", T: "700 K", K: 5.44,
             r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]],
             c0: { CO: 0.200, H2O: 0.100, CO2: 0, H2: 0 }, enhed: 0.010, xStof: "CO", xOrd: "omsat" }
    };

    /* Maalene paa fane 1 (runde 2 og 3, Niels 21. nov. 2026). Hvert maal er en
       raekke trin, ét ad gangen (REGELSAET 11-16, 33, 35-42):
         valg:      et spoergsmaal med tre svar paa kortet. De forkerte er fejl,
                    elever faktisk laver, og har hver sin forklaring (nej).
                    broek: svaret vises som en broek (foer: det, der staar foran
                    broeken, ellers "Y = "). felt: det felt i skemaet paa tavlen,
                    trinnet udfylder ("aendr.SO2Cl2"). linje: den linje paa
                    tavlen, trinnet udfylder (indeks i tavle.linjer).
                    skjulLampe: maerket Y < K er skjult, mens kortet spoerger.
         handling:  kortet beder eleven om at goere noget med skyderen. Kortet
                    gaar selv videre 0,7 s efter, at eleven staar paa maalet
                    (x med tol, xMax: helt op, lige: Y = K). snap: x saettes
                    paa x bagefter.
         ligevaegt: find x, hvor Y = K. Lampen bliver groen af sig selv, naar
                    x staar stille paa ligevaegten (regel 39); Indsend svar
                    er reserve.
       vis (kun maal 1): det, der kommer frem i scenen, naar trinnet er loest
       ("y": boksen med Y, "yv": Y's vaerdi, "graf", "skyder").
       fremhaev: de dannede molekyler har en stille ring, mens kortet spoerger.
       Svarene staar i data med det rigtige foerst; kortet viser dem i en
       raekkefoelge, der skifter fra trin til trin.
       tavle: skemaets raekker paa tavlen (tal: ligevaegtsraekken viser tallene,
       der foelger skyderen) og linjerne under skemaet (lov: ligevaegtsloven med
       symboler; trin: linjen staar med "?", mens trinnet spoerger). Skemaet og
       udtrykkene har enheder (regel 40): "0,200 M − x".
       yBoks: boksen med Y og K staar over tavlen. Ingen andengradsligning paa
       denne fane: CAS' loesninger staar paa tavlen, og eleven vaelger.
       Tallene i teksterne tjekkes mod modellen i _selvtest.html. */
    var YX_A = '<span class="vbroek"><span>x · x</span><span>0,200 M − x</span></span>';
    var YX_C = '<span class="vbroek"><span>x · x</span><span>(0,200 M − x) · (0,100 M − x)</span></span>';
    D.MAAL = [
        { id: "a-lige", rx: "a", gruppe: "a", navn: "SO₂Cl₂: x ved ligevægt", yBoks: true, graf: true,
          slut: "Ved ligevægt er x ≈ 0,078 M, så [SO₂Cl₂] er faldet med 0,078 M, når Y = K.",
          trin: [
              { type: "valg", spm: "Hvilken brøk er reaktionsbrøken Y for spaltningen af SO₂Cl₂?",
                svar: [
                    { t: "Y = [SO₂] · [Cl₂] / [SO₂Cl₂]", broek: ["[SO₂] · [Cl₂]", "[SO₂Cl₂]"], ok: true },
                    { t: "Y = [SO₂Cl₂] / ([SO₂] · [Cl₂])", broek: ["[SO₂Cl₂]", "[SO₂] · [Cl₂]"], nej: "Den brøk er vendt om. Produkterne står i tælleren og reaktanten i nævneren." },
                    { t: "Y = ([SO₂] + [Cl₂]) / [SO₂Cl₂]", broek: ["[SO₂] + [Cl₂]", "[SO₂Cl₂]"], nej: "Koncentrationerne i tælleren ganges med hinanden. De lægges ikke sammen." }
                ],
                hint: ["Y bygges som ligevægtsloven, men med koncentrationerne lige nu.",
                    "Produkterne står i tælleren og reaktanten i nævneren. Koncentrationerne ganges.",
                    "Y = [SO₂] · [Cl₂] / [SO₂Cl₂]."],
                slut: "Y bygges som ligevægtsloven med koncentrationerne lige nu. Ved ligevægt er Y lig med K.",
                vis: ["y"] },
              { type: "valg", spm: "Hvor stor er Y fra start, hvor der kun er 0,200 M SO₂Cl₂?",
                svar: [
                    { t: "Y = 0 M", ok: true },
                    { t: "Y = 0,0500 M", nej: "0,0500 M er K, og Y er kun lig med K ved ligevægt. Fra start er [SO₂] = 0 M." },
                    { t: "Y = 0,200 M", nej: "0,200 M er [SO₂Cl₂], som står i nævneren. Tælleren er [SO₂] · [Cl₂]." }
                ],
                hint: ["Sæt startkoncentrationerne ind i Y.",
                    "Der er intet SO₂ og Cl₂ fra start, så tælleren er 0.",
                    "Y = 0 M · 0 M / 0,200 M = 0 M."],
                slut: "Tælleren er 0, fordi der intet SO₂ og Cl₂ er. Y = 0 M er mindre end K.",
                vis: ["yv"] },
              { type: "valg", spm: "Hvad sker der med Y, når mere SO₂Cl₂ bliver spaltet?",
                svar: [
                    { t: "Y bliver større", ok: true },
                    { t: "Y bliver mindre", nej: "Når SO₂Cl₂ spaltes, dannes der SO₂ og Cl₂. Tælleren vokser, og nævneren bliver mindre." },
                    { t: "Y er den samme", nej: "Koncentrationerne ændrer sig, når SO₂Cl₂ spaltes. Så ændrer Y sig også." }
                ],
                hint: ["Hvad sker der med [SO₂] og [Cl₂], når SO₂Cl₂ spaltes?",
                    "[SO₂] og [Cl₂] i tælleren vokser, og [SO₂Cl₂] i nævneren bliver mindre.",
                    "Y bliver større."],
                slut: "Tælleren vokser, og nævneren bliver mindre, så Y bliver større. Grafen viser det, og skyderen x styrer, hvor meget SO₂Cl₂ der er spaltet.",
                vis: ["graf", "skyder"] },
              { type: "handling", tekst: "Skyderen x er den koncentration af SO₂Cl₂, der er spaltet.",
                spm: "Træk x til 0,050 M.", x: 0.050, tol: 0.0025, snap: true,
                hint: ["Skyderen ligger under beholderen og grafen.", "Træk skyderens knap mod højre, til der står x = 0,050 M.", "x = 0,050 M."],
                efter: { type: "valg", fremhaev: true, skjulLampe: true,
                    tekst: "Ved x = 0,050 M er 5 SO₂Cl₂-molekyler spaltet til 5 SO₂ og 5 Cl₂.",
                    spm: "Er der ligevægt i beholderen, når x = 0,050 M?",
                    svar: [
                        { t: "Nej, Y er mindre end K", ok: true },
                        { t: "Ja, Y er lig med K", nej: "Y = 0,0167 M og K = 0,0500 M. Y er ikke lig med K endnu." },
                        { t: "Nej, Y er større end K", nej: "Y = 0,0167 M er mindre end K = 0,0500 M." }
                    ],
                    hint: ["Sammenlign Y og K i boksen over grafen.", "Y = 0,0167 M og K = 0,0500 M.", "Y er mindre end K, så der er ikke ligevægt endnu."],
                    slut: "Y er mindre end K, så der er ikke ligevægt. Der skal spaltes mere SO₂Cl₂, før Y når op på K." } },
              { type: "ligevaegt", spm: "Hvor stor er x, når reaktionsbrøken Y er lig med K?" }
          ] },
        { id: "a-udtryk", rx: "a", gruppe: "a", navn: "SO₂Cl₂: skemaet med x",
          slut: "Ved ligevægt er 0,0500 M = x · x / (0,200 M − x). Den ligning har x som den eneste ubekendte.",
          tavle: { raekker: ["start", "aendr", "lig"], linjer: [
              { navn: "Ligevægtsloven", lov: true },
              { navn: "Ved ligevægt er Y lig med K", html: "0,0500 M = " + YX_A, trin: 6 }] },
          trin: [
              { type: "valg", felt: "aendr.SO2Cl2", spm: "Hvad er ændringen i [SO₂Cl₂], når x er spaltet?",
                svar: [{ t: "−x", ok: true }, { t: "+x", nej: "SO₂Cl₂ forbruges, så [SO₂Cl₂] falder." },
                    { t: "−2x", nej: "Der står 1 foran SO₂Cl₂. x er netop den koncentration af SO₂Cl₂, der er spaltet." }],
                hint: ["SO₂Cl₂ står før pilen og forbruges.", "Det, der forsvinder, har minus.", "Ændringen er −x."],
                slut: "SO₂Cl₂ forbruges, så ændringen er −x." },
              { type: "valg", felt: "aendr.SO2", spm: "Hvad er ændringen i [SO₂], når x er spaltet?",
                svar: [{ t: "+x", ok: true }, { t: "−x", nej: "SO₂ dannes, så [SO₂] stiger." },
                    { t: "+2x", nej: "Der står 1 foran SO₂. Hvert SO₂Cl₂ giver ét SO₂." }],
                hint: ["SO₂ står efter pilen og dannes.", "Hvert spaltet SO₂Cl₂ giver ét SO₂.", "Ændringen er +x."],
                slut: "Hvert spaltet SO₂Cl₂ giver ét SO₂, så ændringen er +x." },
              { type: "valg", felt: "aendr.Cl2", spm: "Hvad er ændringen i [Cl₂], når x er spaltet?",
                svar: [{ t: "+x", ok: true }, { t: "−x", nej: "Cl₂ dannes, så [Cl₂] stiger." },
                    { t: "+2x", nej: "Der står 1 foran Cl₂. Hvert SO₂Cl₂ giver ét Cl₂." }],
                hint: ["Cl₂ står efter pilen og dannes.", "Hvert spaltet SO₂Cl₂ giver ét Cl₂.", "Ændringen er +x."],
                slut: "Cl₂ dannes som SO₂, så ændringen er også +x." },
              { type: "valg", felt: "lig.SO2Cl2", spm: "Hvad er [SO₂Cl₂] ved ligevægt?",
                svar: [{ t: "0,200 M − x", ok: true }, { t: "0,200 M + x", nej: "Ændringen er −x, så x trækkes fra." },
                    { t: "−x", nej: "Ligevægt er start plus ændring. Start er 0,200 M." }],
                hint: ["Ligevægt = start + ændring.", "Start er 0,200 M, og ændringen er −x.", "[SO₂Cl₂] = 0,200 M − x."],
                slut: "Ligevægt = start + ændring = 0,200 M − x." },
              { type: "valg", felt: "lig.SO2", spm: "Hvad er [SO₂] ved ligevægt?",
                svar: [{ t: "x", ok: true }, { t: "0,200 M + x", nej: "Fra start er der intet SO₂, så start er 0 M og ikke 0,200 M." },
                    { t: "0,200 M − x", nej: "0,200 M − x er [SO₂Cl₂]. For SO₂ er start 0 M, og ændringen er +x." }],
                hint: ["Ligevægt = start + ændring.", "Start er 0 M, og ændringen er +x.", "[SO₂] = 0 M + x = x."],
                slut: "Ligevægt = 0 M + x = x." },
              { type: "valg", felt: "lig.Cl2", spm: "Hvad er [Cl₂] ved ligevægt?",
                svar: [{ t: "x", ok: true }, { t: "0,200 M − x", nej: "0,200 M − x er [SO₂Cl₂]. For Cl₂ er start 0 M, og ændringen er +x." },
                    { t: "2x", nej: "Ændringen for Cl₂ er +x, ikke +2x." }],
                hint: ["Ligevægt = start + ændring.", "Start er 0 M, og ændringen er +x.", "[Cl₂] = 0 M + x = x."],
                slut: "Ligevægt = 0 M + x = x. Nu står hele skemaet med x." },
              { type: "valg", linje: 1, spm: "Ved ligevægt er Y lig med K. Hvilken ligning gælder ved ligevægt?",
                svar: [{ t: "0,0500 M = x · x / (0,200 M − x)", foer: "0,0500 M = ", broek: ["x · x", "0,200 M − x"], ok: true },
                    { t: "0,0500 M = x / (0,200 M − x)", foer: "0,0500 M = ", broek: ["x", "0,200 M − x"], nej: "Begge produkter står i tælleren: [SO₂] · [Cl₂] = x · x." },
                    { t: "0,0500 M = (0,200 M − x) / (x · x)", foer: "0,0500 M = ", broek: ["0,200 M − x", "x · x"], nej: "Den brøk er vendt om. Produkterne står i tælleren som i ligevægtsloven." }],
                hint: ["Brug ligevægtsloven på tavlen, og sæt K = 0,0500 M ind på venstre side.", "Sæt [SO₂] = x, [Cl₂] = x og [SO₂Cl₂] = 0,200 M − x ind.", "0,0500 M = x · x / (0,200 M − x)."],
                slut: "0,0500 M = x · x / (0,200 M − x). Ligningen har x som den eneste ubekendte." }
          ] },
        { id: "a-cas", rx: "a", gruppe: "a", navn: "SO₂Cl₂: hvilken løsning?", yBoks: true,
          slut: "x = −0,128 M kan ikke bruges, fordi [SO₂] så ville være −0,128 M. Kun x = 0,0781 M giver positive koncentrationer, og dér er Y lig med K.",
          tavle: { raekker: ["start", "aendr", "lig"], tal: true, linjer: [
              { navn: "Ligevægtsloven", lov: true },
              { navn: "Ved ligevægt er Y lig med K", html: "0,0500 M = " + YX_A },
              { navn: "CAS løser ligningen", html: "x = 0,0781 M eller x = −0,128 M" },
              { navn: "Den løsning, der kan bruges", html: "x = 0,0781 M. Med x = −0,128 M bliver [SO₂] negativ.", trin: 0 }] },
          rodOk: 0.0781, rodNej: -0.128,
          trin: [
              { type: "valg", linje: 3, spm: "CAS giver x = 0,0781 M og x = −0,128 M. Hvilken løsning kan bruges?",
                svar: [{ t: "x = 0,0781 M", ok: true },
                    { t: "x = −0,128 M", nej: "Med x = −0,128 M bliver [SO₂] = x negativ. En koncentration kan ikke være negativ." },
                    { t: "Begge", nej: "Sæt hver løsning ind i rækken Ligevægt. Med x = −0,128 M bliver [SO₂] negativ." }],
                hint: ["Sæt hver løsning ind i rækken Ligevægt på tavlen.", "En koncentration kan ikke være negativ.", "x = 0,0781 M kan bruges."],
                slut: "Kun x = 0,0781 M giver positive koncentrationer." },
              { type: "handling", spm: "Træk x, til Y er lig med K.", lige: true,
                hint: ["Skyderen ligger under beholderen.", "Løsningen er x = 0,0781 M.", "Træk knappen til x = 0,078 M."] }
          ] },
        { id: "b-aendr", rx: "b", gruppe: "b", navn: "HBr: koefficienten 2",
          slut: "Hver gang ét H₂ omsættes, forbruges ét Br₂, og der dannes 2 HBr. Koefficienterne bliver til tallene foran x.",
          tavle: { raekker: ["start", "aendr"], linjer: [{ navn: "Ligevægtsloven", lov: true }] },
          trin: [
              { type: "valg", spm: "Hvor mange HBr-molekyler dannes, når ét H₂-molekyle reagerer med ét Br₂-molekyle?",
                svar: [{ t: "2", ok: true }, { t: "1", nej: "Der står 2 foran HBr. Ét H₂ og ét Br₂ giver 2 HBr." },
                    { t: "4", nej: "Ét H₂ og ét Br₂ giver 2 HBr. Se tallene foran stofferne i reaktionsskemaet." }],
                hint: ["Se på reaktionsskemaet over kortet.", "Tallet foran HBr er koefficienten.", "Der dannes 2 HBr."],
                slut: "Koefficienten 2 foran HBr betyder, at ét H₂ og ét Br₂ giver 2 HBr." },
              { type: "handling", tekst: "Skyderen x er den koncentration af H₂, der er omsat.",
                spm: "Træk x til 0,040 M, og se på molekylerne.", x: 0.040, tol: 0.005, snap: true,
                hint: ["Skyderen ligger under beholderen.", "Træk knappen til x = 0,040 M.", "x = 0,040 M."] },
              { type: "valg", felt: "aendr.H2", spm: "Hvad er ændringen i [H₂], når x er omsat?",
                svar: [{ t: "−x", ok: true }, { t: "+x", nej: "H₂ forbruges, så [H₂] falder." },
                    { t: "−2x", nej: "Der står 1 foran H₂. x er netop den koncentration af H₂, der er omsat." }],
                hint: ["H₂ står før pilen og forbruges.", "x er den koncentration af H₂, der er omsat.", "Ændringen er −x."],
                slut: "H₂ forbruges, så ændringen er −x." },
              { type: "valg", felt: "aendr.Br2", spm: "Hvad er ændringen i [Br₂], når x er omsat?",
                svar: [{ t: "−x", ok: true }, { t: "−2x", nej: "Der står 1 foran Br₂. Ét Br₂ reagerer med hvert H₂." },
                    { t: "+x", nej: "Br₂ forbruges, så [Br₂] falder." }],
                hint: ["Br₂ står før pilen og forbruges.", "Ét Br₂ reagerer med hvert H₂.", "Ændringen er −x."],
                slut: "Ét Br₂ reagerer med hvert H₂, så ændringen er også −x." },
              { type: "valg", felt: "aendr.HBr", spm: "Hvad er ændringen i [HBr], når x er omsat?",
                svar: [{ t: "+2x", ok: true }, { t: "+x", nej: "Der står 2 foran HBr, så der dannes 2 HBr for hvert H₂." },
                    { t: "−2x", nej: "HBr dannes, så [HBr] stiger." }],
                hint: ["HBr står efter pilen og dannes.", "Der står 2 foran HBr.", "Ændringen er +2x."],
                slut: "Der dannes 2 HBr for hvert H₂, så ændringen er +2x." }
          ] },
        { id: "c-graense", rx: "c", gruppe: "c", navn: "CO + H₂O: hvor langt kan x komme?",
          slut: "H₂O er brugt op ved x = 0,100 M. x kan ikke blive større end den mindste startkoncentration af en reaktant.",
          tavle: { raekker: ["start", "aendr", "lig"], tal: true },
          trin: [
              { type: "valg", spm: "Hvilket stof bliver brugt op først, når der fra start er 0,200 M CO og 0,100 M H₂O?",
                svar: [{ t: "H₂O", ok: true }, { t: "CO", nej: "CO og H₂O forbruges lige hurtigt, men der er mindre H₂O fra start." },
                    { t: "CO₂", nej: "CO₂ dannes. Det bliver ikke brugt op." }],
                hint: ["CO og H₂O reagerer 1 til 1.", "Der er kun 0,100 M H₂O, men 0,200 M CO.", "H₂O bliver brugt op først."],
                slut: "CO og H₂O forbruges lige hurtigt, så det stof, der er mindst af, slipper op først." },
              { type: "handling", spm: "Træk x så langt op, som det kan komme.", xMax: true,
                hint: ["Skyderen ligger under beholderen.", "Træk knappen helt til højre.", "x kan højst blive 0,100 M."] }
          ] },
        { id: "c-cas", rx: "c", gruppe: "c", navn: "CO + H₂O: hvilken løsning?", yBoks: true,
          slut: "x = 0,280 M kan ikke bruges, fordi [H₂O] så ville være 0,100 M − 0,280 M = −0,180 M. En brugbar løsning ligger mellem 0 M og 0,100 M.",
          tavle: { raekker: ["start", "aendr", "lig"], tal: true, linjer: [
              { navn: "Ligevægtsloven", lov: true },
              { navn: "Ved ligevægt er Y lig med K", html: "5,44 = " + YX_C },
              { navn: "CAS løser ligningen", html: "x = 0,0875 M eller x = 0,280 M" },
              { navn: "Den løsning, der kan bruges", html: "x = 0,0875 M. Med x = 0,280 M bliver [H₂O] negativ.", trin: 0 }] },
          rodOk: 0.0875, rodNej: 0.280,
          trin: [
              { type: "valg", linje: 3, spm: "CAS giver x = 0,0875 M og x = 0,280 M. Hvilken løsning kan bruges?",
                svar: [{ t: "x = 0,0875 M", ok: true },
                    { t: "x = 0,280 M", nej: "Med x = 0,280 M bliver [H₂O] = 0,100 M − 0,280 M = −0,180 M. Der kan ikke omsættes mere H₂O, end der er." },
                    { t: "Begge", nej: "Begge er positive, men den ene giver en negativ koncentration i rækken Ligevægt." }],
                hint: ["x kan højst være 0,100 M, fordi der kun er 0,100 M H₂O.", "Sæt hver løsning ind i [H₂O] = 0,100 M − x.", "x = 0,0875 M kan bruges."],
                slut: "Kun x = 0,0875 M ligger mellem 0 M og 0,100 M." },
              { type: "handling", spm: "Træk x, til Y er lig med K.", lige: true,
                hint: ["Skyderen ligger under beholderen.", "Løsningen er x = 0,0875 M.", "Træk knappen til x = 0,087 M eller 0,088 M."] }
          ] }
    ];

    /* Gemte fremskridt fra foer runde 2 (otte maal): b-lige og b-cas findes
       ikke laengere og springes over. */
    D.GRUPPER_BH = [
        { id: "a", titel: "SO₂Cl₂ ⇌ SO₂ + Cl₂" },
        { id: "b", titel: "H₂ + Br₂ ⇌ 2HBr" },
        { id: "c", titel: "CO + H₂O ⇌ CO₂ + H₂" }
    ];

    /* ----- Fane 2: uden x (den gamles niveau 1) ----------------------------------
       type kc: K ud fra stofmaengderne n (mol) i rumfanget V (L).
       type ukendt: K og koncentrationerne kendt (kendt), undtagen ukendt. */
    D.UX = [
        { id: "nocl", gruppe: "kc", type: "kc", navn: "Nitrosylchlorid spaltes", T: "462 °C",
          r: [[2, "NOCl", "g"]], p: [[2, "NO", "g"], [1, "Cl2", "g"]],
          V: 2.00, n: { NOCl: 0.600, NO: 0.0800, Cl2: 0.0400 },
          tekst: "Nitrosylchlorid opvarmes til 462 °C i en lukket beholder på 2,00 L, indtil ligevægten har indstillet sig. Ved ligevægt er der 0,600 mol NOCl, 0,0800 mol NO og 0,0400 mol Cl₂.",
          spm: "Bestem ligevægtskonstanten K med enhed." },
        { id: "nh3", gruppe: "kc", type: "kc", navn: "Ammoniaksyntesen", T: "400 °C",
          r: [[1, "N2", "g"], [3, "H2", "g"]], p: [[2, "NH3", "g"]],
          V: 5.00, n: { N2: 0.500, H2: 1.50, NH3: 0.250 },
          tekst: "Dinitrogen og dihydrogen reagerer ved 400 °C i en lukket beholder på 5,00 L. Ved ligevægt er der 0,500 mol N₂, 1,50 mol H₂ og 0,250 mol NH₃.",
          spm: "Bestem ligevægtskonstanten K med enhed." },
        { id: "vg1", gruppe: "kc", type: "kc", navn: "Vandgasligevægten", T: "700 K",
          r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]],
          V: 10.0, n: { CO: 0.300, H2O: 0.300, CO2: 0.700, H2: 0.700 },
          tekst: "Carbonmonoxid og vanddamp reagerer ved 700 K i en lukket beholder på 10,0 L. Ved ligevægt er der 0,300 mol CO, 0,300 mol H₂O, 0,700 mol CO₂ og 0,700 mol H₂. Vandet er på gasform.",
          spm: "Bestem ligevægtskonstanten K med enhed." },
        { id: "fosgen", gruppe: "uk", type: "ukendt", navn: "Phosgen-ligevægten", T: "600 K",
          r: [[1, "CO", "g"], [1, "Cl2", "g"]], p: [[1, "COCl2", "g"]],
          K: 25.0, kendt: { CO: 0.120, COCl2: 0.450 }, ukendt: "Cl2",
          tekst: "Phosgen dannes af carbonmonoxid og dichlor i en lukket beholder. Ved 600 K er K = 25,0 M⁻¹. Ved ligevægt er [CO] = 0,120 M og [COCl₂] = 0,450 M.",
          spm: "Bestem ligevægtskoncentrationen af Cl₂." },
        { id: "so3", gruppe: "uk", type: "ukendt", navn: "Svovltrioxid spaltes", T: "900 K",
          r: [[2, "SO3", "g"]], p: [[2, "SO2", "g"], [1, "O2", "g"]],
          K: 4.00e-3, kendt: { SO3: 0.500, O2: 0.100 }, ukendt: "SO2",
          tekst: "Svovltrioxid spaltes i en lukket beholder. Ved 900 K er K = 4,00 · 10⁻³ M. Ved ligevægt er [SO₃] = 0,500 M og [O₂] = 0,100 M.",
          spm: "Bestem ligevægtskoncentrationen af SO₂." }
    ];

    D.GRUPPER_UX = [
        { id: "kc", titel: "K ud fra stofmængder" },
        { id: "uk", titel: "En ukendt koncentration" }
    ];

    /* ----- Fane 3: med x (den gamles niveau 2 og 3) ------------------------------
       c0: startkoncentrationerne (M); stoffer, der ikke staar, er 0. */
    D.MX = [
        { id: "butan", gruppe: "let", navn: "Isomerisering af butan", T: "25 °C", K: 2.50,
          r: [[1, "nbutan", "g"]], p: [[1, "isobutan", "g"]], c0: { nbutan: 0.600 },
          tekst: "Butan kan omdannes til 2-methylpropan. En lukket beholder fyldes med butan, så koncentrationen er 0,600 M. Ved 25 °C er K = 2,50." },
        { id: "buten", gruppe: "let", navn: "Cis-trans-isomerisering af but-2-en", T: "400 K", K: 4.00,
          r: [[1, "cis", "g"]], p: [[1, "trans", "g"]], c0: { cis: 0.500 },
          tekst: "cis-but-2-en kan omdannes til trans-but-2-en. En lukket beholder fyldes med cis-but-2-en, så koncentrationen er 0,500 M. Ved 400 K er K = 4,00." },
        { id: "so2cl2", gruppe: "mid", navn: "Sulfurylchlorid spaltes", T: "375 °C", K: 0.0500,
          r: [[1, "SO2Cl2", "g"]], p: [[1, "SO2", "g"], [1, "Cl2", "g"]], c0: { SO2Cl2: 0.200 },
          tekst: "Sulfurylchlorid spaltes til svovldioxid og dichlor. En lukket beholder fyldes med SO₂Cl₂, så koncentrationen er 0,200 M. Ved 375 °C er K = 0,0500 M." },
        { id: "cocl2", gruppe: "mid", navn: "Phosgen spaltes", T: "800 K", K: 0.0200,
          r: [[1, "COCl2", "g"]], p: [[1, "CO", "g"], [1, "Cl2", "g"]], c0: { COCl2: 0.500 },
          tekst: "Phosgen spaltes ved høj temperatur. En lukket beholder fyldes med COCl₂, så koncentrationen er 0,500 M. Ved 800 K er K = 0,0200 M." },
        { id: "iod", gruppe: "mid", navn: "Diiod spaltes til iodatomer", T: "1200 K", K: 0.0100,
          r: [[1, "I2", "g"]], p: [[2, "I", "g"]], c0: { I2: 0.400 },
          tekst: "Diiodmolekyler spaltes til frie iodatomer. En lukket beholder fyldes med I₂, så koncentrationen er 0,400 M. Ved 1200 K er K = 0,0100 M." },
        { id: "vg2", gruppe: "svaer", navn: "Vandgasligevægten", T: "700 K", K: 5.44,
          r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]], c0: { CO: 0.100, H2O: 0.100 },
          tekst: "En lukket beholder fyldes med CO og vanddamp, så begge koncentrationer er 0,100 M. Der er intet CO₂ og intet H₂ fra start. Ved 700 K er K = 5,44." },
        { id: "hbr", gruppe: "svaer", navn: "Dannelse af hydrogenbromid", T: "500 K", K: 64.0,
          r: [[1, "H2", "g"], [1, "Br2", "g"]], p: [[2, "HBr", "g"]], c0: { H2: 0.200, Br2: 0.200 },
          tekst: "En lukket beholder fyldes med H₂ og Br₂, så begge koncentrationer er 0,200 M. Der er intet HBr fra start. Ved 500 K er K = 64,0." },
        { id: "vg3", gruppe: "svaer", navn: "Vandgas med forskellig start", T: "700 K", K: 5.44,
          r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]], c0: { CO: 0.200, H2O: 0.100 },
          tekst: "En lukket beholder fyldes med 0,200 M CO og 0,100 M vanddamp. Der er intet CO₂ og intet H₂ fra start. Ved 700 K er K = 5,44." }
    ];

    D.GRUPPER_MX = [
        { id: "let", titel: "Let" },
        { id: "mid", titel: "Middel" },
        { id: "svaer", titel: "Svær" }
    ];

    /* Den gamle b2.3's facit, som selvtesten sammenligner med */
    D.GAMMEL = {
        nocl: { K: 3.5556e-4 }, nh3: { K: 0.92593 }, vg1: { K: 5.4444 },
        fosgen: { svar: 0.150 }, so3: { svar: 0.100 },
        butan: { x: 0.42857 }, buten: { x: 0.400 }, so2cl2: { x: 0.078078, x2: -0.128078 },
        cocl2: { x: 0.0904988, x2: -0.1104988 }, iod: { x: 0.0303975, x2: -0.0328975 },
        vg2: { x: 0.06999 }, hbr: { x: 0.160 }, vg3: { x: 0.0874927, x2: 0.2800749 }
    };

    /* Delene i en opgave paa fane 2 og 3, i den raekkefoelge de regnes */
    D.DELE = {
        kc: ["lov", "konc", "indsaet"],
        ukendt: ["lov", "indsaet", "cas", "svar"],
        x: ["lov", "defx", "skema", "ligning", "cas", "valg", "konc"]
    };

    D.DEL_NAVN = {
        lov: "Ligevægtsloven", konc: "Koncentrationerne", indsaet: "Indsæt", cas: "CAS",
        svar: "Svaret", defx: "Hvad er x?", skema: "Skemaet", ligning: "Ligningen", valg: "Løsningen"
    };

    /* Saetningen, der definerer x (fane 3). Den rigtige stoerrelse er
       koncentrationen; de andre er de fejl, elever laver. */
    D.X_STR = [
        { v: "konc", tekst: "den koncentration" },
        { v: "lig", tekst: "ligevægtskoncentrationen" },
        { v: "n", tekst: "den stofmængde" },
        { v: "broek", tekst: "den brøkdel" }
    ];
    D.X_ENH = [
        { v: "M", tekst: "M" },
        { v: "mol", tekst: "mol" },
        { v: "ingen", tekst: "ingen enhed" }
    ];

    D.ROS_OPGAVE = ["Flot.", "Godt.", "Sådan.", "Rigtigt."];
    D.FAERDIG = {
        bh: "Alle seks mål er nået. Opgaverne står på de to næste faner.",
        ux: "Alle fem opgaver er løst. Prøv fanen Med x.",
        mx: "Alle otte opgaver er løst."
    };

    NK.Data = D;
}());

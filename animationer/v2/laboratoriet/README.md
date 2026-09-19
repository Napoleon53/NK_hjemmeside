# Laboratoriet

Den fælles kode for superanimationerne om laboratorieforsøg. Det, der er ens
i forsøgene, ligger her, så en rettelse kun laves ét sted. Hvert forsøg har
stadig sin egen mappe med forløb, model, quizspørgsmål, Kemichael-scener og
det, der er særligt for netop det forsøg.

Bruges af sc1.3 Knaldgas, sc2.5 Fældning, sc2.6 Kobber og dibrom, sc2.7
Blyiodid, sc6.8 Substitution, sc6.9 Fedt i chips, sc8.6 Jern i ståluld og
sb2.4 Jernthiocyanat (kerne, rundvisning og grundstilark). Forsøgene ligger i
`../superlab/` og henter filer herfra med `../../laboratoriet/`, ligesom med
`kemichael/`.

## Prøvebordet

`proevebord/index.html` er et frit laboratoriebord uden opskrift, bygget på
genstandsmodellen nedenfor: flasker, dråbeflaske, pulverglas, spatel,
glasstav, termometer, reagensglas i stativ, bægerglas, varmeplade og
affaldsdunk. Alt kan tages op, sættes ned hvor som helst og bruges på alt
andet. Det er både en legeplads og testbænken for den fælles kode, og det er
kimen til et rum med flere stationer. `proevebord/_selvtest.html` kører hele
modellen igennem.

Selvtesterne prøver også med musen: `js/proeve.js` sender rigtige
pointer-hændelser til lærredet i scenens koordinater (det omvendte af
`tilBord`), så en prøve kan tage fat, bære, holde stille, slippe og klikke
som en elev, og tiden styres af prøven, så bordet ser musens fart.
Prøvebordets afsnit 12 og sb2.4's afsnit 17 gør det. `_vinduer.html` viser et
forsøg i to vinduesstørrelser ved siden af hinanden, til øjet.

## Filer

```
js/kerne.js          NK: hjælpefunktioner, kemisk notation, farver, positurer,
                     væskeniveau, lærred og tegnehjælpere
js/farvemodel.js     farven af en farvet opløsning, regnet på lys: stoffets farve
                     bliver et absorptionsspektrum, absorbanserne lægges sammen
                     bånd for bånd, og det tilbageværende lys bliver til sRGB
js/rundvisning.js    spotlight-rundvisningen bag hjælpeknappen
js/lyd.js            lydene med Web Audio, ingen lydfiler
js/sprites.js        indlæser SVG-sprites; mappen findes ud fra filens placering
js/koer.js           koreografier: små bevægelser af genstande (flyt, vent, kald)
js/stof.js           stoffer, opløsninger (µmol og mL), reaktioner (fuld, ligevægt,
                     bundfald, opløsning), redoxpar, pH, gas, varme og farven (farvemodel.js)
js/stoftabel.js      den fælles tabel: ioner, syrer, baser, indikatorer, gasser, pulvere,
                     metaller (Mg, Zn, Fe, Pb, Cu, Ag), bundfald (opløselighedstabellen:
                     chlorider, iodider, sulfater, carbonater, hydroxider, Ag₂O, AgSCN),
                     reaktioner og standardpotentialer
js/udstyr.js         kataloget over udstyr: sprite, anker, inderside, rumfang,
                     tud og egenskaber (holder, hælder, drypper, spatel, rører ...).
                     skaleret() giver en type i mindre målestok
js/beholder.js       det, en beholder kan: rumme, blande, hælde, lag, bundfald,
                     temperatur, kogning, overløb
js/tegning.js        baggrund, plakat, væske, bundfald, korn, etiketter, stav,
                     termometer, varmeplade, stråle, dråber, damp, pyt, markering
js/mikro.js          zoomboblen: én kugle pr. partikel med formlen på. Boblen fyldes
                     på plads, når man ser ned i en beholder, og fast stof vises
                     som gitter (Stof.gitter). Hvor meget der er af hvert stof,
                     giver Stof.partikelTal med en fast skala (partikelRef mM
                     giver partikler kugler), så et stof, der bliver mere af,
                     får flere kugler, også i et overskud af noget andet; et
                     opløst stof under 10⁻⁵ M vises ikke (vandets egne ioner
                     i rent vand), og tilskuerionerne kan skjules (se
                     »Tilskuerioner« nedenfor). Der er højst 20 kugler i
                     alt (Stof.PARTIKEL_LOFT); er der flere, skaleres alle
                     ned i samme forhold, og ingen slags forsvinder. Kuglernes og
                     skriftens størrelse er bobleIndhold i NK.BORD_VALG.
                     Formlen står uden kant i kuglen, mørk på lyse kugler og
                     hvid på mørke (som i sc6.8); en lang formel gør kuglen
                     større i stedet for skriften mindre. Når et tal ændrer
                     sig, fordi der sker en reaktion, SKER reaktionen også i
                     boblen — se »Reaktionerne i boblen« nedenfor
js/bord.js           bordet: genstande, greb og slip, møder afgjort af
                     egenskaber, stativ og varmeplade, uheld, tidens gang, tegning
js/rum.js            rummene: flere borde på ét lærred, pile og piletaster,
                     glidning, det man bærer kommer med, lugen, stinkskabet
js/side.js           den fælles skal om en side: tegneløkken, aflæsningen af
                     det valgte glas, zoomboblen, beskeden, lyd, intro,
                     rundvisning, tastatur, logbog, forløbskortet og Start forfra
js/vilkaar.js        en betingelse over bordets tilstand som data: stof,
                     rumfang, temperatur, pH, hvor glasset står, og hvor lyst
                     det er i forhold til et andet glas
js/forloeb.js        trin, udløsere og flag: betingelse → konsekvens, fyrer
                     én gang. Samme lag bærer en øvelses trin og en låst dør
js/journal.js        elevens egne iagttagelser og målinger: posterne, svarene,
                     øjebliksbilledet og bedømmelsen mod sandheden
js/quiz.js           quizzen som fælles ramme: spørgsmålene er data i forsøgets
                     tekst.js, og et vilkår åbner den
js/tegneserie.js     tegneserien som fælles ramme: hver rude er et udsnit af
                     tegnebordet, tegnet ud fra et gemt øjebliksbillede, plus
                     et lag ovenpå og en sidste rude med resultatskemaet
js/taleboble.js      taleboblen som eget lag: får munden og hovedet, finder selv
                     sin plads inden for scenen og uden om det, replikken handler
                     om, og holder skriften læsbar uanset zoom
css/grund.css        farver, toplinje, scene og panel, kort, forløb, quiz,
                     knapper, overlays, tegneserie og rundvisning
sprites/             generisk glasudstyr uden etiketter (etiketten tegnes i koden)
_geometri.html       udviklerværktøj: alt glasudstyr læst som omdrejnings-
                     legemer, så rumfang, lysvej, væskehøjde og
                     inddelingen holdes op mod hinanden og mod tegningen
_taleboble.html      udviklerværktøj: flyt munden med musen, og se boblen
                     vende, holde sig inden for kanten og undgå et rektangel
_vinduer.html        udviklerværktøj: et forsøg i to vinduesstørrelser side om side
js/proeve.js         udviklerværktøj: musen til selvtesterne (pointer-hændelser
                     i scenens koordinater, prøvens eget ur)
proevebord/          det frie bord: index.html, css/stil.css, js/stoffer.js
                     (stoffer, reaktioner, opstilling), js/laerer.js, js/tur.js,
                     js/app.js, _selvtest.html
proeverum/           tre rum med luge og stinkskab: js/plan.js (rummene),
                     js/app.js, js/tur.js, _selvtest.html
```

## Kemilogikken

Kemien ligger i lag, så et nyt stof koster én linje data, ikke nye regler:

| Lag | Hvor | Hvad |
|-----|------|------|
| 0 fysik | `beholder.js` + `farvemodel.js` | blanding, lag, fortynding, temperatur, kogning, overløb, farven af en opløsning |
| 1 egenskaber | `stof.js` + `stoftabel.js` | bundfald (opløselighedsprodukt), syre-base (Ka, autoprotolyse, pH, indikatorer), redox (standardpotentialer, reaktioner mellem par afledes), kompleksdannelse (K), reaktionsvarme ΔH, fortyndingsvarme |
| 2 navngivne reaktioner | `stoftabel.js` | reaktioner med betingelser, fx kobber i koncentreret salpetersyre |
| 3 hændelser | `bord.js` | bobler, farvede dampe, damp, "voldsom" (kogende sprøjt), som Kemichael reagerer på |

Ligevægtskonstanterne følger temperaturen efter van 't Hoff:
K(T) = K(20 °C)·exp(−ΔH/R·(1/T − 1/293,15)). En reaktion, der allerede har
et ΔH i stoftabellen, får det gratis, så Le Châteliers princip er fysik i
stedet for en regel pr. reaktion: en exoterm ligevægt flytter sig mod
venstre, når det bliver varmere. Det gælder også opløselighedsprodukter og
vandets autoprotolyse. Ved 20 °C er faktoren præcis 1, så intet ændrer sig
i et forsøg ved stuetemperatur; eksponenten begrænses til ±6.
`NK.Stof.vantHoff = false` slår det fra.

Alle stoffer og reaktioner står i `js/stoftabel.js`, som alle forsøg deler.
Et forsøg vælger kun, hvad der står på bordet (`NK.OPSTILLING`). Motoren
opfinder ikke kemi, den ikke kender: en blanding uden regel gør ingenting.
`proevebord/_kombinationer.html` blander alle par af bordets flasker og
pulvere og skriver, hvad der sker. Læs den igennem som kemiker, hver gang
et stof eller en regel ændres: "for lidt" er acceptabelt, "forkert" rettes
i stoftabellen. Sept. 2026: 232 kombinationer, 171 med reaktion; de stille er
rigtige (fx Cu + KI, NaCl + KI, Zn + NaOH).

Redox afledes af standardpotentialerne, når reduktionsmidlet er et fast
stof (metal i saltopløsning eller syre). Redox mellem ioner (Fe³⁺ + I⁻,
Cu²⁺ + I⁻) står som navngivne reaktioner, ligesom Fe³⁺ + CO₃²⁻.

## Farven af en opløsning

Farven regnes på lyset i `farvemodel.js`, ikke på de tre RGB-kanaler.
Stoffets `farve` i stoftabellen læses som et absorptionsspektrum over 16
bånd fra 400 til 700 nm: et rødt stof får næsten ingen absorbans i den
røde ende. Absorbanserne lægges sammen bånd for bånd, og det lys, der
slipper igennem, bliver til sRGB gennem D65 og CIE's farvematchnings-
funktioner. Derfor bliver en koncentreret rød opløsning mørkerød og ikke
sort, og blåt plus gult bliver grønt i stedet for gråt.

`k` er absorbansen ved spektrets top pr. mM pr. vejlængde. Et stof, der
ser for blegt eller for mørkt ud, rettes med `k`; en forkert kulør rettes
med `farve`. Begge dele er data i `stoftabel.js`, ikke kode.

## Glassenes geometri

Alt glasudstyr er et omdrejningslegeme: en silhuet drejet om sin egen
lodrette akse. Derfor er både rumfanget og lysvejen givet af den tegnede
inderside og ét tal — `NK.Udstyr.SKALA`, tegneenheder pr. cm. De står ikke
længere som frie tal, der kan komme til at modsige hinanden og tegningen:

```
rumfang   V = ∫ π(w/2)² dy / SKALA³
lysvej    w / SKALA, altså indersidens bredde i cm
```

`SKALA` er 10,7 og sat, så reagensglassets inderside bliver 1,6 cm bred som
et rigtigt 16 mm glas. Det er det udstyr, der er tegnet mest trofast, og alt
andet måles mod det. `mlPrAreal` udledes af indersiden og `maks`, så væsken
står præcis til kanten, når beholderen er fuld, og `vejlaengde` udledes af
bredden.

**Lysvejen dæmpes.** Den rene geometri giver et 600 mL bægerglas en vej på
5,6 reagensglas, og så står en almindelig skoleopløsning næsten sort i det.
Det er fysisk rigtigt — sådan ser den også ud i virkeligheden — men en
animation skal kunne aflæses. Vejen trykkes derfor sammen mod
reagensglassets med `LYSVEJ_DAEMPNING = 0,45`, valgt fordi den rammer de
håndsatte tal, bordene blev bygget med (bægerglas 2,0 og 3,0), næsten
præcist. Det er den eneste knap på farvedybden: skru på den ene og få hele
laboratoriet med.

Til en sammenligning med øjnene findes to mål i `js/vilkaar.js`:
`lysstyrke(gg)` er farven selv, og `lyshed(gg, retning)` er den, som den
ser ud lagt på **hvidt papir** — altså med gennemsigtigheden regnet med.
Forskellen betyder noget, når lysvejen er kort: en tynd væske er næsten
gennemsigtig, og så er det papiret, man ser. Derfor hviler en
sammenligning ovenfra på `lyshed`.

**Lysvejen ovenfra er en anden.** Ses der NED i et glas, går lyset gennem
væskens dybde og ikke gennem glassets bredde, og dybden afhænger af, hvor
meget der er i. `NK.Udstyr.vejOvenfra(type, V)` måler den på tegningen på
samme måde som stregerne: overfladen ved V mL er `NK.vaeskeNiveau` af
indersiden, bunden er indersidens laveste punkt, og dybden deles med
reagensglassets `REF_CM` = 1,6 cm, så tallet betyder det samme som
`vejlaengde`. `NK.Beholder.farve(gg, "ovenfra")` ser gennem den;
`B.lysvej(gg, retning)` giver vejen alene.

Her dæmpes der **ikke**. Dæmpningen trykker vejen mod 1, og det ville brække
det, vejen ovenfra er til for: fordobles rumfanget, halveres
koncentrationen, men dybden fordobles, så et farvestof, der bare bliver
fortyndet, står præcis lige så kraftigt ovenfra. Bliver blandingen alligevel
lysere, er der blevet færre farvede molekyler — og så har ligevægten flyttet
sig. En dæmpning ville ændre farven ved en ren fortynding, og så var prøven
ingenting værd. Fordi vejen måles på den tegnede inderside, følger den
formen af sig selv: i et glas med lodrette sider fordobles den med
rumfanget, i et glas med rundet bund en anelse mindre, og i kolben mere,
fordi den er bredest forneden. Tabellen »Lysvejen ovenfra« i
`_geometri.html` viser det for alt udstyr.

**To undtagelser.** `vindue: true` betyder, at den tegnede inderside kun er
et kig ind i beholderen og ikke hele dens rum: flasker, dråbeflasker,
sprøjteflasken og pulverglas har en etiket over det meste af sig, så deres
`maks` står stadig som et rigtigt tal. `rund: false` er det, der ikke er et
omdrejningslegeme (vejebåden er en rektangulær skål).

`_geometri.html` regner det hele ud og holder det op mod typerne. Læs den
igennem, hver gang en sprite eller et mål ændres.

**Væsken er et filter, ikke maling.** Det, man ser gennem et glas, er
baggrunden ganget med det lys, der slipper igennem. `Stof.gennem(o, l)`
giver netop det lys mod hvidt — farven på hvidt papir — og `Stof.farve`
giver kulør og dækning til at tegne med. Vandets egen svage blå tone
(`VAND`) viger, jo mere farve der er i glasset; ellers ville den trække
kuløren ud af enhver fortyndet opløsning og gøre den mat og grålig. En
fortynding skal gøre væsken **lysere i sin egen kulør**, ikke gråere. Det
er også `Stof.gennem`, `NK.Vilkaar.lyshed` måler, når to glas skal
sammenlignes på hvidt papir.

**Farven er dybest, hvor glasset er bredest.** Lysvejen følger indersidens
bredde, højde for højde: en konisk kolbe er godt dobbelt så bred forneden
som i gennemsnit, så lyset går dobbelt så langt gennem bunden, og bunden
står dobbelt så mørk. `T.vejVedY(gg, verden)` giver vejen i en højde og
`null`, hvis glasset er lige i siderne — så koster det ingenting for et
bægerglas. Det er den samme Lambert-Beer, der giver et bægerglas set
ovenfra sin dybde, bare vandret.

**Et uheld koster en tiendedel, ikke det hele.** Rystes et åbent glas for
voldsomt, skvulper `SKVULP` = 10 % af indholdet ud som en pyt på bordet.
Nok til et uheld og til at Kemichael kommer og tørrer op, men ikke nok til
at forsøget er tabt. Rystes der videre, sker det igen.

**Glas rammes, hvor der er glas.** Musen og slipmålet spørger `bord.inden`,
og for et omdrejningslegeme uden etiket over sig er svaret indersidens
silhuet plus glassets væg — ikke spritets rektangel. For et reagensglas og
et bægerglas er det næsten den samme kasse, men kolben er smal foroven, og
så snyder dens øverste hjørner ikke længere den, der sigter på den. En
flaske eller et pulverglas har etiket over det meste af sig, så deres
inderside kun er et kig ind i beholderen (`vindue: true`); de rammes som
før. Den stiplede ramme — den grønne, når noget kan slippes, og den gule,
når et hint peger — følger den samme silhuet (`T.markeringsForm`), så det,
man ser, er det, man kan ramme.

**Bægerglassene hedder nu `baegerLille` og `baegerStor`.** De hed
`baeger100` og `baeger250`, men de var tegnet som 225 og 694 mL. Da
tegningerne er gode, fulgte tallene i stedet: de er nu 250 og 600 mL, og
navnene siger ikke længere et rumfang, der kan blive forkert igen. Af samme
grund rummer reagensglasset 30 mL og kolben 200 mL.

**Inddelingen tegnes af koden.** Stregerne og rumfanget (»600 mL«) på
bægerglas, kolbe og måleglas står ikke i spritene. `NK.Udstyr.streger(t)`
lægger hver streg dér, hvor væsken står ved dens rumfang — med samme
`NK.vaeskeNiveau` som tegningen — og `T.tegnStreger` tegner dem oven på
glasset i glassets skala. Typens `streger` siger kun, hvor tæt de står
(`hver`, `smaa`), hvor langt op (`til`) og hvor tallene og påskriften står.
Påskriften er `maks`. Måleglasset er undtagelsen: det rummer 110 mL til
kanten, men står som 100 mL (`nominel`) med luft over den øverste streg,
som et rigtigt måleglas. `_geometri.html` holder stregerne op mod
indersiden og ser efter, at tal og påskrift ikke rammer hinanden, og
prøvebordets selvtest afsnit 9b prøver, at væsken står ved stregen.

## Faremærkning og Kemichaels advarsler

Faren er data på stoffet i `stoftabel.js` (`fare`): trin med en nedre
koncentration (`over` i mM, 0 for faste stoffer), piktogrammerne
(`maerker`: brandfarlig, oxiderende, aetsende, giftig, sundhedsfare, kronisk,
miljoe, forenklede GHS-tegn) og det, Kemichael siger første gang flasken
tages (`sig`). Et stof med et langt navn får et kort navn på kuglen i
zoomboblen (`kort`, fx PP for phenolphthalein), og boblen viser en legende. `NK.Stof.faremaerker(o)` giver mærkerne for en opløsning, så
etiketten følger indholdet: en fortyndet syre mister sit ætsende-mærke, og
affaldsdunken viser, hvad der er i den. Kemichael advarer gennem
`laererBaer` (`proevebord/js/laerer.js`), én gang pr. stof.

Kemichael taler ikke hele tiden (`laererOpdager`): uheld med farlige
kemikalier (ætsende, giftig, brandfarlig, oxiderende, kronisk) og knust glas
ser han altid; alt andet, også advarslerne, lader han passere i 60 % af
tilfældene. `laererAltid = true` slår tilfældet fra i selvtestene.

## Kemichael bag bordet: to planer

Et bord kan give ham et plan bag bordpladen med `bagBord: { y, skala }` i
`NK.BORD_VALG` (sb2.4 bruger det; prøvebordet og prøverummet gør ikke). Han
*bor* ikke der: han er ude af scenen det meste af tiden, præcis som før, og
kommer kun ind, når han har noget at sige. Reglen er **hænder foran, ord
bagved**.

* **Han tegnes i sit eget plan.** `skala` er planets faktor — bag bordet er
  han længere væk og tegnes mindre — og `y` er halsens højde. Hele figuren,
  også armen, hovedet, ansigtet og det, han bærer, følger faktoren.
* **Bordpladen klipper ham.** Han tegnes mellem væggen og alt på bordet
  (`tegnLaererBag` fra `bord.tegn`) og klippes ved bagkanten (`NK.Scene.BORD`),
  så pladen dækker hans underkrop. Derfor betyder hans størrelse mindre, og
  han kan ikke stille sig foran glassene. Et klik på ham gælder først, når
  intet på bordet ligger under musen (`laererBagBord` i `bord.hvad`).
* **Han standser, hvor der er plads.** Der står ingen fast koordinat i
  opstillingen. Et scenetrin `{ gaa: x, mod: m }` er stadig en gang uden
  `bagBord`; med den går han ind bag bordet, standser dér, hvor der er plads
  i netop dette rum (`laererPlads`), drejer hovedet og fører armen mod `m`
  (`pegVinkel`, `kigVinkel`). `mod` er et x eller et punkt `{ x, y, rekt }`.
  Pladsen regnes i øjeblikket og prissættes som taleboblens: den **hårde**
  pris afgør (zoomboblen, plakaten, hylderne, det der står på dem, og det han
  selv peger på — `laererOptagetAf`), den **bløde** skiller lige gode ad
  (afstanden til det, han taler om). Gennemsigtigt glas på bordpladen tæller
  ikke med; det kan man se igennem. Er intet helt frit, vælges det, der går
  mindst på kompromis — han skal et sted hen.
* **Hænderne foregår foran bordet.** Et trin med `foran: true` — oprydningen
  efter et uheld, kaffen, flasken der fyldes op igen, og baggrundslivet —
  sender ham om for den ende af bordet, der giver den korteste vej. Vejen går
  uden for scenen, så skiftet mellem planerne ikke ses. `K.UDE` sender ham ud
  som altid, og når han er ude, står planet på »bag bordet« igen, så næste
  replik kommer ind den rigtige vej.

Figuren slutter forneden ved gulvet, `NK.Scene.GULV` (bordets valg `gulv`,
standard scenens bund) — bag bordet ved bagkanten. Før fortsatte kitlen
1500 enheder ned, og i et højt lærred blev det til meget lange ben.
`kemichael.js` uden et gulv i scenen — de gamle animationer — tegner som før.
Prøvebordets selvtest afsnit 13 og sb2.4's afsnit 18 prøver begge dele.

## Quizzen

`js/quiz.js` (`NK.Quiz`). Alle otte gamle forsøg havde deres egen quiz, og de
var 70 % ens: ti spørgsmål med fire svar, blandet hver gang, ét forsøg pr.
spørgsmål, og en begrundelse bagefter — **også når svaret er rigtigt**, for
det er dér, der bliver lært noget. Maskineriet står nu ét sted.

Forsøget leverer to ting. Spørgsmålene står i dets `js/tekst.js` under nøglen
`quiz`, så al prosa stadig kan læses ét sted, og de er rene data:

```js
"quiz": {
    laast: "Låses op, når der er taget billede af glas 1 til 7.",
    klar:  "Billedet af glassene er taget.",
    spoergsmaal: [
        { sp: "…", valg: ["…", "…", "…", "…"], rigtig: 0, forklaring: "…" }
    ]
}
```

Et svar er enten en streng eller `{ tekst, farve }`; med farve vises en lille
farveprøve foran teksten, og `farve: null` betyder farveløs og vises ternet
(to af de gamle spørger om farver). `rigtig` er nummeret **før** blandingen.
Rammen regner ikke med, at der altid er fire svar.

Den anden ting er kravet, der åbner quizzen — et helt almindeligt vilkår
(`vilkaar.js`) i sidens valg:

```js
NK.Side.start({ … quiz: { krav: { journal: "billede", faerdig: true } } })
```

Kravet prøves, hver gang panelet opdateres, så quizzen åbner af sig selv i
samme øjeblik, eleven har gjort det, der skulle til — ikke fordi et eller
andet sted i forsøget husker at kalde `laasOp()`. Et vilkår må også være en
funktion, så den gamle sc1.3's »alle syv blandinger er prøvet« passer ind.
Uden krav er quizzen åben fra begyndelsen.

`side.js` bygger quizzen, hvis siden har kortet `#quiz-kort` og forsøget har
spørgsmål; en side uden kortet mister ingenting. Stilen (`.valg`,
`.valgknap`, `.farveprove`, `.quiz-score`) stod allerede i `css/grund.css`.
sb2.4's selvtest afsnit 19 prøver både rammen og forsøgets egne spørgsmål.

## Tegneserien

`js/tegneserie.js` (`NK.Tegneserie`). Alle tre gamle tegneserier (sc2.7,
sc6.8, sc8.6) var det samme mønster skrevet tre gange: **hver rude er et
udsnit af tegnebordet, tegnet med scenens egne tegnefunktioner ud fra en gemt
tilstand** — ikke en ny tegning — plus et lag ovenpå med pil, lup og
etiketter, og en sidste rude med resultatskemaet.

Reglen er journalens: ruden viser glasset, som det så ud, da eleven noterede
det, og ikke som det ser ud nu. Derfor tager rammen et **øjebliksbillede** —
`NK.Tegneserie.kopi(gg, p)`, en løsreven kopi, der kan tegnes for sig selv —
og journalen gemmer opskriften på indholdet (`Stof.opskrift`, det omvendte af
`Stof.lav`) sammen med hvert svar. Hælder eleven glasset ud bagefter, står
tegneserien stadig med det, han så.

En rude er data:

```js
{ tekst:   "…",
  udsnit:  { x: 300, y: 300, b: 420 },   /* i tegnebordets enheder */
  ting:    [ kopi1, kopi2 ],             /* gemt tilstand */
  tegn:    function (ctx) { … },         /* mere, i tegnebordsenheder */
  oven:    function (ctx, pt, maal) { … },/* laget ovenpå, i rudens pixels */
  froe:    3, fejl: true, ren: true, bred: true, dom: function (div) { … } }
```

`udsnit` er et vindue ind i tegnebordet; højden følger rudens forhold af sig
selv, så et udsnit aldrig kan blive forvrænget, og `NK.Tegneserie.omkring`
regner et udsnit ud, der lige rummer de ting, der er med. `pt(x, y)` i `oven`
omregner fra tegnebordets enheder til rudens pixels, så en pil kan pege fra
noget i scenen ud til en etiket ved siden af. En **bred** rude fylder hele
rækken og får et lærred, der er tre gange så bredt — det er der,
resultatskemaet og en række på syv glas står.

**Tilfældigheden er deterministisk.** Scenen bruger `Math.random` nogle
steder (dråber, skår, kugler i boblen). En tegneserie, der så forskellig ud
hver gang, den blev åbnet, ville være en anden slags dokument, så rammen
låner `Math.random`, mens en rude tegnes, og giver den et frø pr. rude.

Låsen er quizzens: `serie: { krav: … }` i sidens valg er et almindeligt
vilkår, og teksterne står i forsøgets `tekst.js` under nøglen `serie`.
Forsøget leverer `ruder: function (bord) { … }`, som kaldes ved hver åbning.
`side.js` bygger serien, hvis siden har `#serie-ruder`; en side uden den
mister ingenting. Tasten **G** åbner og lukker. Stilen (`.serie`, `.rude`,
`.rude.fejl`, `.rude.bred`, `.resultater`) står i `css/grund.css`.
sb2.4's selvtest afsnit 22 prøver både rammen og forsøgets egne ruder — også
at rammen ikke nævner ét eneste af forsøgets ord, og at en rude ser ens ud,
efter at bordet er ryddet.

## Taleboblen

Boblen er ikke en del af figuren; den er et lag for sig, `js/taleboble.js`
(`NK.Taleboble`). Figuren siger kun *hvad* der siges og oplyser, hvor munden
er, og hvor stort hovedet er (`hoved: { op, side, ned }`). Laget finder selv
pladsen: over hovedet, når der er plads; ellers til højre, til venstre eller
under. Det holder sig inden for scenen, lægger sig ikke over det, replikken
handler om (`undgaa`, et rektangel eller en liste — Kemichael giver det glas,
han peger på (`L.undgaa`), og zoomboblen på scenen (`bord.bobleRekt`)), og
halen ender ved hovedets kant i stedet for at gå hen over ansigtet. Er den foretrukne plads ikke fri, vælges den, der går mindst på
kompromis, og blandt lige gode den, hvor halen sidder mindst skævt.

**Skriften holder en mindste størrelse på skærmen** (`STIL.minSkaerm`,
14 px): er et bredt bord zoomet langt ud, vokser hele boblen med samme
faktor, så den ser ens ud og stadig kan læses. Det er svaret på, om boblen
skulle flyttes til DOM for læsbarhedens skyld — det skulle den ikke.

**Boblen er øverste lag.** Bordet kalder `tegnLaerer(ctx, tid,
{ udenBoble: true })` og derefter `tegnLaererBoble` til allersidst — efter
zoomboblen — så en replik aldrig kan havne under noget. En ældre animation
kalder `tegnLaerer(ctx, tid)` uden valg og får boblen med som før.

Al stil står ét sted (`NK.Taleboble.STIL`): skrift, polster, radius, hale,
farver. To personers bobler skal adskille sig ved en farve (`valg.stil`),
aldrig ved et nyt layout. `_taleboble.html` viser laget arbejde, og sb2.4's
selvtest afsnit 14 prøver placeringen som ren geometri.

Der er ingen kø og ingen prioritet i laget endnu. Med én taler ligger det i
figurens egne scener (`kemichael.js`, `proevebord/js/laerer.js`), hvor et
uheld går forud for en bemærkning, og en forløbsreplik, der afbrydes, lægges
tilbage forrest i køen og siges bagefter. Laget får køen, når der er en
taler mere.

## Genstandsmodellen

En genstand på bordet er `{ navn, type, p: { x, y, v }, hjem, kan, indhold, ... }`.
Typen kommer fra `udstyr.js`, og `kan` er dens egenskaber. Når noget slippes
over noget andet, afgør egenskaberne, hvad der sker (`NK.Bord.prototype.moede`):

| Slippes over ...   | Det, der bæres, kan ... | Der sker |
|--------------------|-------------------------|----------|
| en beholder        | hælde                   | det hældes i, og strålen blander det meste |
|                    | dryppe                  | en dråbe lander i et lag i toppen |
|                    | sprøjte                 | 10 mL vand |
|                    | bære en spatelspids     | det faste stof lander i bunden og opløses |
|                    | røre                    | glasstaven rører, laget blandes |
|                    | måle                    | termometeret sættes i og bliver siddende |
| et pulverglas      | være en spatel          | spatlen tager en spatelspids |
| affald eller vask  | rumme noget             | alt hældes ud |
| stativet           | være et reagensglas     | glasset sættes i nærmeste ledige hul |
| varmepladen        | rumme noget             | det stilles på pladen og varmes |
| vægten             | rumme noget             | det stilles på vægten, som viser massen (klik tarerer) |
| en beholder        | dyppe (podetråd)        | podetråden tager en dråbe med |
| brænderen          | bære en dråbe (podetråd)| flammeprøve: flammen får ionernes farve (`flamme` i stoftabellen) |
| ingenting          | alt                     | det sættes ned, hvor det slippes |

Måleudstyr: vægten (`vaegt`, med vejebåd til pulver), pH-meteret (`phmeter`,
sættes i glasset som termometeret), brænderen med trefod (`braender`, en
varmeplade med flamme) og podetråden (`podetraad`) til flammeprøver. Massen
regnes af glassets egen masse, vandet og stofferne (M i stoftabellen).

## Bordets størrelse og udstyr i mindre målestok

Hvert bord vælger selv sine mål i `NK.BORD_VALG` (`bredde`, `hoejde`, `bord`,
`bordDybde`, `lodret`, `gulv`, hylder, plakat, `bagBord`, `bobleR`), og
lærredet skalerer scenen, så den fylder vinduet.
Et smalt bord er altså zoomet ind: prøvebordet og prøverummet er 1620 enheder
brede, mens sb2.4 er 1120 og derfor står tættere på. Et nyt lille bord med
store, tydelige flasker koster kun de tre tal plus sin egen opstilling.

En genstand i opstillingen kan desuden få `skala` (0,25 til 1), så den samme
type kan stå i mindre målestok på et lille bord:

```js
{ navn: "stativ", type: "stativ", p: { x: 330, y: 350, v: 0 }, skala: 0.5 },
{ navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 1, nr: 1 }
```

* Kun tegnemålene skaleres (`NK.Udstyr.skaleret`): sprite, anker, inderside,
  tud, etiket, huller, plade og de øvrige felter i listerne øverst i
  `udstyr.js`. Nye mål i en type skal skrives ind i de lister, ellers følger
  de ikke med.
* Rumfang (`maks`), lysvej, masse og temperatur er uændrede, så kemien er den
  samme: et bægerglas i halv størrelse er stadig et 100 mL bægerglas, og
  væsken står lige så højt i det. Derfor ganges `mlPrAreal` med skala².
* Det, der står i eller på noget andet (glas i et stativ, bægerglas på en
  varmeplade), arver dets skala, så huller og plader passer.
* Et glas kan også have sin egen, mindre skala i et stativ i fuld størrelse
  (sb2.4's reagensglas er 2/3). Så er det for kort til at nå bunden fra
  hullet og synker ned, til indersidens bund står på stativets `bundY`; i
  et bad synker det til badets `bundY`, hvor et fuldt glas' bund står, så
  indholdet kommer ned i vandet (`synkTil` i `bord.js`). Et glas i fuld
  størrelse når bunden og står, som det altid har.
* Skala over 1 tillades ikke: sprites er tegnet i deres naturlige størrelse og
  bliver bløde, hvis de forstørres.
* Prøvebordets selvtest har et afsnit, der holder øje med, at rumfang,
  væskehøjde, arv og museramme følger med (afsnit 10).

Frihed frem for afvisning: rystes et åbent glas voldsomt, skvulper det ud;
løber et glas over, bliver der en pyt; sættes et reagensglas på bordet,
vælter det; slippes noget foran bordkanten, falder det på gulvet, og glas
knuses (`type.glas`); rystes et glas ekstremt voldsomt, knuses det i hånden.
Kemichael kommer og tørrer op eller fejer og henter et nyt
(`proevebord/js/laerer.js`, `NK.Bord.prototype.genopstil`).

**Der hældes kun, når eleven beder om det (F36):** et slip over glasset
giver én portion, og pilen ved flasken giver mere. At bære en flaske hen
over et glas eller holde den stille over det hælder ikke — før talte en
langsom bevægelse som at holde stille, og så hældte den i det glas, den
blev båret forbi. Maskineriet til hældning med hånden står der stadig og
kan slås til med `HAELD.medHaanden` i `bord.js`. Sådan virkede det: holdes
en flaske stille over et glas, vipper den efter
0,3 s og hælder, så længe den holdes der (`opdaterHaeldning`; farten pr. type
i `HAELD.fart`). Den grønne ramme holder, hvad den lover: mens flasken
vipper, føres tuden ind over glassets åbning og op over kanten (`foerTud`,
en hjælpende hånd), og der hældes kun, når strålen rammer. Man kan altså
ikke komme til at hælde ved siden af et glas med grøn ramme (før løb det ud
på bordet og gav et uheld). Står hånden stille, vælges det nærmeste glas
uden hysterese (`faldTilRo`), og stilles en flaske på en hylde, sigter den
ikke på glassene under hylden (`hyldeVed`). Dråbeflasken drypper,
sprøjteflasken sprøjter og vejebåden drysser på samme måde. Dråbeflasken sigtes med bunden: den vender om sin
midte og ikke om spidsen, så spidsen ender dér, hvor bunden var, og mens den
vender, glider den ind over åbningen; den drypper først, når spidsen peger
lige ned (`vendDrypper`, `draabeSigte`, `HAELD.vipDryp`). Når der hældes med
hånden, vælges glasset, så zoomboblen viser, hvad der sker i det. Et
hurtigt slip over glasset giver én portion: flaskens standardportion
(`haeldMl`), dog højst en femtedel af glasset (`portion`) — eller det,
glasset selv siger: `modtager` i mL på dets post i opstillingen (sb2.4's
reagensglas tager 4 mL pr. tryk, fordi de er tegnet mindre, men stadig
rummer 30 mL). Målet sigtes med
tuden, ikke med musen. Løber glasset over, stopper strømmen, til flasken
flyttes. Flaskerne er fyldt til 200 mL af 250, så der kan hældes i dem.

**Slipmålet vælges efter nærhed.** Alt, der vil tage imod det bårne
(`kanModtage`), er kandidater, og de scores efter afstanden fra det, man
sigter med, til det, man sigter efter: tuden mod åbningen, når der hældes;
foden mod det nærmeste ledige hul eller pladen, når noget stilles; ellers
musen mod genstanden (`sigteScore`, `sigteKandidater`, `maalVed`). Den
nærmeste vinder — før var det den øverst tegnede af dem, der overhovedet
blev ramt, i praksis det man sidst havde rørt, og to reagensglas ved siden
af hinanden fik derfor tit den forkerte stråle. Det valgte mål beholdes, til
et andet er tydeligt bedre (`SIGTE.hysterese`), så den grønne ramme ikke
flimrer. Træfzonerne står samlet i `SIGTE`; en flaskehals rammes inden for
16 enheder i stedet for 6, som var et par skærmpixels. Prøvebordets selvtest
afsnit 11 prøver det med to glas i naboglas-huller.

Der hældes ovenfra: en tud, der er under glassets kant (`SIGTE.tudNed`),
sigter ikke på glasset, og musen på et glas tæller kun ved åbningen
(`SIGTE.musNed`). Så kan en flaske, man sænker, til bunden rører bordet,
stilles foran et glas uden at hælde eller dryppe i det. Står det bårnes
fod på bordpladen (et bord med dybde), hælder musen slet ikke i et glas;
kun tuden sigter (`stiller` i `sigteKandidater`). Ellers ville en flaske,
der stilles foran et af sb2.4's lave reagensglas, hælde i det, fordi musen,
der holder flasken i toppen, er ved glassets åbning. Reagensglassets
nederste 24 enheder rammes ikke med musen (`traefBund` i `udstyr.js`), for
bunden står nede i stativet. sb2.4's selvtest afsnit 17 prøver det med
dråbeflasken og KSCN-flasken foran stativet.

**Tilskuerioner.** Med `tilskuere: true` i `NK.BORD_VALG` finder bordet
selv forsøgets tilskuerioner (`Stof.tilskuerioner`): reaktionerne køres på
papiret ud fra det, opstillingen har, og de ioner, der kun kommer fra et
salt, der opløses, og ikke tager del i nogen reaktion, er tilskuere (i sb2.4
K⁺ og NO₃⁻; NO₃⁻ er ikke tilskuer, hvis der er kobber og syre). En liste
kan også gives direkte. Har et glas mere end tre slags ioner, skjules
tilskuerionerne i zoomboblen og står for sig nederst i panelets tabel, når
fluebenet »Vis tilskuerioner« er sat; med én til tre ioner hører de altid
med (en flaske AgNO₃ har både Ag⁺ og NO₃⁻). Tabellen står med den største
koncentration først og fast stof til sidst, og det, der er for lidt af til
at ses, står der ikke.

Det, der lige er brugt, bliver hængende: flasken bliver i hældepositur
over glasset, dråbeflasken, sprøjteflasken og spatlen bliver i luften over
det, de blev brugt på (`svaev`, `svaevVed`). En gul ring med en pil ned ved
siden af gentager handlingen, når man klikker på den (en portion til, en
dråbe til, en spatelspids til), og med musen over den står der, hvad den
gør. Et klik på selve flasken gentager ikke, men siger, at det er pilen,
eller at flasken skal trækkes væk; efter den første dråbe siger beskeden
det også. Spatlen er særlig: en fuld spatel over pulverglasset har ingen
pil og kan ikke tage mere (den skal gives til et glas først), og pilen ved
en tom spatel over et glas sender den selv hen til pulverglasset, den sidst
tog fra, efter en spatelspids og tilbage til glasset med den (`hentOgGiv`,
bygget af de samme trin som `fyldSpatel` og `toemSpatel`). Resten
af bordet venter, til det trækkes væk; så går det hjem. Tages en vendt
flaske eller et væltet glas, rettes det op om det punkt, man greb i, så det
bliver under hånden. Der tegnes ingen hånd.

Fortyndingsvarmen (`dHfort`, `cRef` i stoftabellen) er en tilstandsfunktion
af koncentrationen, så syre i syre giver ingen varme, og syre hældt i små
portioner giver det samme som på én gang. Lige dele koncentreret svovlsyre
og vand koger stadig; det er rigtigt.

Klik viser, træk gør: et klik vælger det, der rummer noget, til aflæsning
og zoom, og handlinger sker kun ved at trække. Undtagelser er kontakten på
varmepladen og en dråbeflaske, der allerede hænger over et glas. Zoomboblen
tegnes i panelet (`NK.Bord.prototype.tegnBoble`), eller på scenen i
laboratoriets hjørne, når bordet er sat op med `boble: { x, y }` (sb2.4).
Boblen på scenen har en lup på kanten: et klik på den viser den stor midt
på scenen over en mørk flade, som luppen i sc6.8 (`aabnStorBoble`), og et
klik hvor som helst eller Esc lukker den (`lukStorBoble`). Indholdet
skaleres, så kugler og skrift er lige så skarpe, bare større.

Et nyt forsøg på modellen laver sin egen `js/stoffer.js` med stoffer,
reaktioner og opstilling (`NK.OPSTILLING`, `NK.BORD_VALG`) og en
`js/laerer.js` med sine egne scener. Forløbet skal kun genkende tilstanden
(`vedHaendelse`, `vedAendring`), aldrig spærre for handlinger.

## Rum

`js/rum.js` gør laboratoriet til flere rum på ét lærred (`NK.Rum`). Hvert rum
er et bord med sin egen opstilling og sine egne valg; kun det rum, man står
i, tegnes og tager imod musen, mens de andre går stille videre
(`opdaterStille`: varmeplader, reaktioner, termometre). Pilene i siderne og
piletasterne fører til naborummene, rummet glider ind, og det, man bærer,
kommer med (`tagUd`, `tagImod`). Alle rum har samme bredde og højde.

Lugen (udstyr `luge`, `{ type: "luge", til: "stinkskab", skilt: "..." }`) er et
gennemrækningsskab: glas stilles på hylden i den, og et klik på knappen
sender dem til lugen i det andet rum, med termometer og indhold.

Stinkskabet er et valg på rummet (`stinkskab: { x0, x1, top, aabning, rude }`,
`rude: false` tegner ingen rude foran udstyret):
kabinettet tegnes bag udstyret og ruden foran, udsugningen trækker dampe op,
og gas-hændelser får `iStinkskab`, så et forsøg kan skelne mellem farlige
dampe inde og ude. Mønster: `proeverum/` (forrum, kemikaliedepot, prøvebord,
stinkskab). Det, der svæver, har første prioritet for musen, og en flaske
er kun mål for hældning, når tuden står over halsen (inden for
`SIGTE.hals`); ellers sættes det bårne ned mellem flaskerne.
Superanimationerne bruger indtil videre ét rum; rummene er til det senere
spil.

## Sådan bruger et forsøg mappen

1. Stilark: grundstilen først, forsøgets eget stilark bagefter. Forsøgets
   `css/stil.css` har kun det, der er særligt for forsøget.
   ```html
   <link rel="stylesheet" href="../../laboratoriet/css/grund.css">
   <link rel="stylesheet" href="css/stil.css">
   ```
2. Kernen og farvemodellen indlæses først af alle scripts, rundvisningen lige
   før `app.js`:
   ```html
   <script src="../../laboratoriet/js/kerne.js"></script>
   <script src="../../laboratoriet/js/farvemodel.js"></script>
   ...
   <script src="../../laboratoriet/js/rundvisning.js"></script>
   <script src="js/tur.js"></script>
   <script src="js/app.js"></script>
   ```
3. Rundvisningens stop står i forsøgets `js/tur.js`:
   ```js
   NK.Rundvisning.tur([
       { sel: "#scene", titel: "Stinkskabet", tekst: "..." },
       ...
   ]);
   ```
4. Genstandsmodellen indlæses i denne rækkefølge (se `proevebord/index.html`):
   kerne, taleboble, farvemodel, lyd, sprites, stof, udstyr, kemichael, koer,
   beholder, tegning, mikro, bord, forsøgets stoffer og laerer, rundvisning,
   tur, app. Uden `taleboble.js` tegner `kemichael.js` boblen selv, som de
   ældre animationer gør.

## Regler

* En funktion i `kerne.js` og de øvrige moduler må ikke ændre betydning,
  uden at alle forsøg er tjekket. Ny funktionalitet lægges til; gammel fjernes
  kun, når intet forsøg bruger den.
* `grund.css` må kun have regler, der gælder alle forsøg. Et forsøg, der vil
  noget andet, overskriver i sin egen `stil.css`.
* Panelet er 430 px bredt (`--panel-bredde`).
* Sammensatte ioner i zoomboblen er én kugle med formlen på (NO₃⁻), ikke flere
  kugler. Ladning ±1 skrives som + og −, aldrig 1+ og 1−.
* Boblen fyldes på plads, første gang man ser ned i en beholder: partiklerne
  ligger fordelt i den. Der falder kun noget ned oppefra, når der rent faktisk
  bliver tilsat noget.
* Er der kun fast stof i beholderen, viser boblen stoffets gitter: et salt som
  iongitter med sit eget formelforhold, alt andet som ens byggesten, der ligger
  tæt. Forholdet kommer fra stoffets egen opløsningsreaktion i `stoftabel.js`
  (`Stof.gitter`), så et nyt salt får sit gitter uden ny kode.
* sc1.3 og sc2.5 er ældre og har et andet sidelayout. De bruger `kerne.js` og
  `rundvisning.js`, men har stadig hele deres eget stilark.

## Reaktionerne i boblen

Boblen afstemmer sig mod `Stof.partikelTal`, men den afstemmer ikke i
stilhed. **Når et tal ændrer sig, fordi der sker en reaktion, så sker
reaktionen også i boblen**: to partikler finder hinanden og bliver til én,
én går i stykker til to, et bundfald dannes og synker. Det er dét, eleven
skal se — ikke at kuglerne bare bliver flere eller færre.

**Der står ikke ét stofnavn i `mikro.js`** (ud over vandet i baggrunden), og
sb2.4's selvtest afsnit 23 holder den på det. Hvilke hændelser der kan ses,
læses af `Stof.REAKTIONER`, hvor hver reaktion allerede er data. Formen
følger af tallene og faserne:

| | |
|---|---|
| færre partikler ud end ind | **bind** |
| flere partikler ud end ind | **split** |
| et fast stof blandt produkterne | **fæld** — kuglen synker |
| et fast stof blandt udgangsstofferne | **opløs** |
| flere slags stof på begge sider | **omdan** — en redox er hverken en sammenlægning eller en deling |

Derfor virker det også for en reaktion, der fanger seks partikler på én
gang (permanganat og fem jern(II), som den gamle sc8.6 havde), uden at der
skal skrives noget nyt: alle udgangsstofferne mødes i midten, forbundet af
en stiplet streg, og produkterne springer ud med et glimt.

**Dynamisk ligevægt.** Står alle tal i mål, sker der stadig noget: en
ligevægt får med jævne mellemrum et skub den ene vej. Så er der ét kompleks
for meget, og afstemningen retter det ved at lade et andet gå i stykker.
Bind og split kommer altså lige ofte af sig selv — det er ikke en regel, der
er skrevet ind, men følgen af to ting: at boblen altid retter mod tallene,
og at den retter med en reaktion, når der findes en. Målt over et minut i
sb2.4's reference: 34 bind og 34 split. Efter et indgreb dominerer den ene
retning, til tallene passer igen (mere Fe³⁺: 9 bind mod 5 split).

**Valget mellem at reagere og at lade partikler komme og gå.** Er et stof
for få eller for mange, ser boblen først efter en reaktion, der kan lukke
hullet, og vælger den vej, der samlet bringer flest tal tættere på målet
(`gevinst`). Er den bedste vej spærret af et manglende udgangsstof, tager
boblen det skridt, der skaffer det — et kompleks går i stykker, så ionen
bliver fri, og så kan fældningen ses. Og imens må hverken det, der skal
bruges, eller det, der er skaffet, tone ud.

To ting holder den fra at gå i stå. Den venter kun på noget, der faktisk er
på vej (det står i målet, eller en anden reaktion kan danne det), og hvert
stof har en tålmodighed: går der mere end et par sekunder, uden at
reaktionen kan lade sig gøre, falder partiklen ned oppefra som før. Et
bundfald falder dog aldrig ned — det toner frem i bunden, hvor det i
forvejen ligger.

**K forstærkes ikke.** Den gamle sb2.4 hævede K i boblen, så der var
komplekser at se. Det gør den nye ikke: boblen viser de tal, panelets tabel
viser. Prisen er, at en lille forskydning kan forsvinde i afrundingen — ved
6 kugler pr. 3 mM går FeSCN²⁺ fra én kugle til én kugle, når glasset varmes,
selv om stofmængden falder til det halve. Hæves opløsningen, rammer et glas
med stamopløsning til gengæld loftet på 20 kugler, og så kan et indgreb
ikke længere ses som FLERE komplekser. Det er en grænse ved at tegne tyve
kugler i stedet for 10²⁰, ikke en fejl.

## Den fælles skal

Hvert forsøg havde før sin egen `app.js`, og to af dem var 92 % ens.
`js/side.js` er den ramme, de var ens om. Et forsøg starter sin side med

```js
NK.Side.start({
    navn: "sb24",                  /* nøgle til localStorage */
    opstilling: NK.OPSTILLING,
    valg: NK.BORD_VALG,
    tekster: NK.TEKST
});
```

eller, med flere rum, `NK.Side.start({ navn: "spillet", plan: NK.RUM_PLAN })`.
Panelet bygges af HTML, og `side.js` binder kun det, der faktisk findes på
siden, så et forsøg tager de kort med, det vil have (`#glas-kort`,
`#logbog-kort`, `#uheld-kort`, `#rumknapper`, `#intro`, `#forfraknap`,
`#lydknap`, `#hjaelpknap`). Reaktionsskemaet kan stå i toplinjen
(`<header class="top med-ligning">` med en `<p class="top-ligning">`), og
logbogen kan i stedet for et kort være noter, der foldes ud fra toplinjen:
knappen `#noterknap` og tasten N viser og skjuler `#noter` (i scenens
øverste højre hjørne), Esc lukker, og »Notér det valgte glas« skriver
aflæsningen ind med samme regler som tabellen og lader markøren stå efter
den (sb2.4 gør det). Krogene `vedAendring`, `vedBesked`,
`vedHaendelse`, `vedSkift`, `tast`, `panel` og `efterStart` er til det,
forsøget selv vil lave. `NK.Side.nu` er siden, så selvtesten kan pille ved
den.

Al prosa i et forsøg ligger i dets `js/tekst.js` som `{ id: tekst }`, og
`side.js` skriver den ind i elementerne ved start: en streng bliver til
indholdet, en liste til punkter. Det går to veje: en øvelsesvejledning kan
oversættes til den ene fil, og hele forsøgets sprog kan læses igennem ét
sted uden at åbne kode. Mønster: `../superlab/sb2.4_ligevaegt/`.

Prøvebordet og prøverummet har endnu deres egne `app.js`; de flyttes over
på `side.js`, når der ikke er andet i gang.

## Når noget går galt i en tegneramme

Den værste fejl i en animation er ikke en forkert farve, men en side, der
holder op med at svare. Tre spærrer holder den i live.

**Tegneløkken kan ikke dø.** `side.js` bestiller den næste ramme *først* og
tegner bagefter i en `try`. Før gjorde den det modsatte, og så kostede én
undtagelse et vilkårligt sted ikke én ramme, men resten af timen: DOM'en
svarede stadig, så knapperne kunne klikkes og gjorde, hvad de skulle — men
intet blev tegnet igen, og hele forsøget så låst ud, også Start forfra.
Fejlen skrives i konsollen den første gang, så den stadig kan findes.

**Hver ramme begynder fra en kendt transform.** En tegnefunktion, der kaster
midt i en `save()`, efterlader gemmestakken i ubalance, og så tegner den
næste ramme oven i den forrige. `NK.Laerred.friskTransform()` i starten af
`bord.tegn` gør, at en dårlig ramme ikke kan smitte af på den næste.

**Ingen scene kan blive hængende.** En af lærerens scener kan spærre bordet,
mens den kører. Går den i stå — et gå-trin, der aldrig når sit mål, fordi
det, han skulle hen til, er væk — slipper han bordet fri efter
`SCENE_MAKS` sekunder og går ud af sig selv. Og kan figuren ikke tegnes med
gyldige tal, stilles han tilbage til udgangspunktet i stedet for at kaste:
en gradient eller en bue med NaN i kaster, og det er netop en ramme, der
kaster. Eleven må aldrig kunne sidde fast bag en lærer, der ikke kan tale
færdig.

## Forløbet som data

Et trin er ikke en plads i en rækkefølge, men en betingelse over bordets
tilstand. `js/vilkaar.js` er sproget, betingelsen skrives i, og
`js/forloeb.js` er motoren, der prøver trinnene og udløserne, hver gang
noget ændrer sig — og fire gange i sekundet af sig selv, så et glas, der
står og bliver varmt i et bad, også tæller.

```js
{ id: "glas4", tekst: "Dryp AgNO₃ i glas 4.", hint: "...", peg: "ag",
  naar: { alle: [ { beholder: "glas7", V: { over: 2.5 } },
                  { beholder: "glas4", lysere: "glas7", mindst: 0.03 } ] } }
```

Tre regler bærer det. Et trin afgøres af, hvad der står på bordet, aldrig
af hvilken vej eleven kom — derfor tæller et trin længere fremme også, hvis
det bliver opfyldt først. Et trin, der én gang er gjort, bliver ved med at
være gjort, så forløbet aldrig springer tilbage. Og en udløser fyrer én
gang, husket på sit id.

Et trins `peg` siger, hvad hintet skal pege på. Det kan være en genstand på
bordet, som så markeres på scenen, eller et element i panelet, som blinker
kort. Et trin behøver ikke pege på noget.

**Et forsøg i flere dele** kan lade panelet følge den del, eleven står i:
sætter siden en `kun(trin)` på forløbet, springer `nuTrin()` de trin over,
der hører til en anden del. Det ændrer intet ved, hvornår et trin er gjort,
intet ved listen, og intet ved, hvornår forløbet er færdigt — kun hvilket
af de ugjorte trin der står øverst i panelet. Første kunde er sb2.4's to
dele (`../superlab/sb2.4_ligevaegt/js/app.js`).

Flagene er verdenstilstanden. De er med vilje det eneste, der gemmes:
`F.tilstand()` giver trin, udløsere og flag, og `F.saetTilstand()` spiller
dem tilbage. Bordene bygges op fra deres opstilling. Det er den beslutning,
der holder gemningen lille nok til at virke, når der bliver mange rum.

Det er det samme lag, spillet skal bruge. Et trin i en øvelse og en låst dør
i et escaperoom er den samme sætning — betingelse, konsekvens, fyrer én
gang — og kun konsekvensen er forskellig. Mønster: `../superlab/sb2.4_ligevaegt/js/forloeb.js`.

**En replik er også en konsekvens.** `{ sig: "…" }` i en udløsers `saa` (eller
et trins eget `sig`, som siges, når trinnet er gjort) går gennem `side.sig`
til bordets lærer: `laererReplik` i `proevebord/js/laerer.js` lader Kemichael
komme ind, sige linjerne og gå igen, uden at bordet låses. `sig` kan være
en liste af linjer (én boble ad gangen) og have `peg` (en genstand, han
stiller sig ved og markerer), `glimt` (et glimt af hans baggrund til sidst)
og `udtryk` (`toer`, `streng`, `mild`, `skeptisk`) med. Forløbet ved ikke,
hvem der taler; er der ingen lærer på siden, bliver linjen en besked, så
intet går tabt. Replikker venter på hinanden i køen i `laerer.js` og
kollapser ikke, og han overhører dem aldrig — det er forløbet, der har
besluttet, at han skal tale. Det er det første stykke af personlaget
(`../kemichael/_personlag/`), og det er skrevet som data af samme grund som
alt andet i forløbet: vilkår → replik.

## Journalen

Et forsøg er ikke færdigt, fordi motoren ved, hvad der skete. Det er
færdigt, når eleven har set det og skrevet det ned. `js/journal.js` er det
sted, det skrives ned, og den er adskilt fra, hvordan der spørges: posterne,
svarene og bedømmelsen ligger her, mens forsøget selv bestemmer, om det
spørges med knapper under et billede, med et felt til et tal eller noget
tredje.

En post kan være et valg (»mørkere«, »ens«, »lysere«) eller et tal (en
temperatur, en aflæsning fra en burette, med `tolerance`). Begge dele
bedømmes mod sandheden, som **regnes ud af verden i det øjeblik, eleven
svarer** — ikke af en facitliste skrevet i forvejen. Det er den samme regel
som for trinnene: spørg bordet, ikke opskriften. Et forsøg uden `facit` er en
ren notesbog, og det er også i orden.

`billede(id, bord)` gemmes sammen med svaret. Eleven noterede glasset, som
det så ud dengang, og det er det, resultatskemaet og tegneserien skal vise
bagefter — ikke hvordan glasset ser ud nu, efter at det er hældt ud. Svaret
og det, der blev svaret på, hører sammen.

Journalerne gemmes med forløbet, fordi de er en del af historien og ikke af
bordene. Et trin kan læse dem i samme sprog som alt andet:

```js
{ journal: "billede", faerdig: true }
{ journal: "billede", rigtige: { over: 4 } }
{ journal: "billede", post: "glas1", rigtig: true }
```

Mønster: `../superlab/sb2.4_ligevaegt/js/billede.js` og dets trin `billede`.

## Bade

Udstyret `bad` er et stort bægerglas, der står fast, og som man sætter
reagensglas ned i. Glasset i badet tager badets temperatur med en kort tau,
fordi vand mod glas leder meget bedre end luft. Pladsen afgøres af
geometrien (`badPladser`), ikke af en liste over, hvad der må stå i hvad, så
et forsøg kan stille et bad op uden ny kode.

Uden mere er et bad bare et bægerglas med vand, så et bad på en tændt
varmeplade bliver et vandbad af sig selv. Med `holdT` i opstillingen er
badet termostateret: `{ navn: "isbad", type: "bad", holdT: 2 }` holder 2 °C,
og et bad med `holdT` oven på en varmeplade følger termostaten, mens pladen
er tændt, og køler til stuetemperatur, når den slukkes. Det er derfor et
vandbad giver 80 °C i stedet for pladens 250.

## Næste skridt

* sb2.4 er lagt over på genstandsmodellen i `../superlab/sb2.4_ligevaegt/`. Bordet
  står, kemien er prøvet igennem, badene virker, forløbets ni trin kører,
  billedet af de syv glas noteres, og Kemichael siger forløbets
  bemærkninger. Del 2 om fortynding, quizzen og tegneserien mangler.
  Derefter sc6.8 og sc8.6.
* **Grafen.** Journalen kan notere en måling; den kan endnu ikke tegne den
  op. Titrerings- og kalibreringskurver dukker op i næsten enhver øvelse, så
  det er en fælles komponent, ikke noget hvert forsøg skal opfinde.
* **Øvelsestjekket:** en generisk validering, ethvert nyt forsøg køres
  igennem. Kimen står i `../superlab/sb2.4_ligevaegt/_selvtest.html` afsnit 10, som
  bruger `NK.Vilkaar.naevnte` til at opdage et trin, der peger på et glas
  eller et stof, der ikke findes.
* Rammerne i `quiz.js` og `tegneserie.js` er skrevet til otte forsøg, men
  kun prøvet af ét. Ved første konvertering viser det sig, hvad de mangler.
* **Mikroniveauet** kan vise bind, split, fæld, opløs og omdan. Fire former
  mere venter på deres første kunde: ligander, der sætter sig én ad gangen
  (sc2.6), bundfald pakket i hele formelenheder i et gitter med faste
  pladser (sc2.5, sc2.7), et faseskift ned gennem en grænseflade (sc6.8) og
  molekyler tegnet af atomer i stedet for kugler med formlen på (M10).
* **Til spillet:** låste passager i `rum.js`, som spørger forløbets flag,
  om man må gå videre. Vilkårs- og forløbslaget er der allerede.
* Et rum, hvor forsøgene er stationer, man kan gå imellem. Prøverummet er
  motoren; prøvebordet er den første station.

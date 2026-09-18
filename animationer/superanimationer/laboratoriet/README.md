# Laboratoriet

Den fælles kode for superanimationerne om laboratorieforsøg. Det, der er ens
i forsøgene, ligger her, så en rettelse kun laves ét sted. Hvert forsøg har
stadig sin egen mappe med forløb, model, quizspørgsmål, Kemichael-scener og
det, der er særligt for netop det forsøg.

Bruges af sc1.3 Knaldgas, sc2.5 Fældning, sc2.6 Kobber og dibrom, sc2.7
Blyiodid, sc6.8 Substitution, sc6.9 Fedt i chips, sc8.6 Jern i ståluld og
sb2.4 Jernthiocyanat (kerne, rundvisning og grundstilark). Forsøgene henter
filer herfra og skal derfor ligge ved siden af denne mappe, ligesom med
`kemichael/`.

## Prøvebordet

`proevebord/index.html` er et frit laboratoriebord uden opskrift, bygget på
genstandsmodellen nedenfor: flasker, dråbeflaske, pulverglas, spatel,
glasstav, termometer, reagensglas i stativ, bægerglas, varmeplade og
affaldsdunk. Alt kan tages op, sættes ned hvor som helst og bruges på alt
andet. Det er både en legeplads og testbænken for den fælles kode, og det er
kimen til et rum med flere stationer. `proevebord/_selvtest.html` kører hele
modellen igennem.

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
                     som gitter (Stof.gitter)
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
js/taleboble.js      taleboblen som eget lag: får munden og hovedet, finder selv
                     sin plads inden for scenen og uden om det, replikken handler
                     om, og holder skriften læsbar uanset zoom
css/grund.css        farver, toplinje, scene og panel, kort, forløb, quiz,
                     knapper, overlays, tegneserie og rundvisning
sprites/             generisk glasudstyr uden etiketter (etiketten tegnes i koden)
_geometri.html       udviklerværktøj: alt glasudstyr læst som omdrejnings-
                     legemer, så rumfang, lysvej og væskehøjde holdes op
                     mod hinanden og mod tegningen
_taleboble.html      udviklerværktøj: flyt munden med musen, og se boblen
                     vende, holde sig inden for kanten og undgå et rektangel
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

**To undtagelser.** `vindue: true` betyder, at den tegnede inderside kun er
et kig ind i beholderen og ikke hele dens rum: flasker, dråbeflasker,
sprøjteflasken og pulverglas har en etiket over det meste af sig, så deres
`maks` står stadig som et rigtigt tal. `rund: false` er det, der ikke er et
omdrejningslegeme (vejebåden er en rektangulær skål).

`_geometri.html` regner det hele ud og holder det op mod typerne. Læs den
igennem, hver gang en sprite eller et mål ændres.

**Bægerglassene hedder nu `baegerLille` og `baegerStor`.** De hed
`baeger100` og `baeger250`, men de var tegnet som 225 og 694 mL. Da
tegningerne er gode, fulgte tallene i stedet: de er nu 250 og 600 mL, og
navnene siger ikke længere et rumfang, der kan blive forkert igen. Af samme
grund rummer reagensglasset 30 mL og kolben 200 mL.

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

## Taleboblen

Boblen er ikke en del af figuren; den er et lag for sig, `js/taleboble.js`
(`NK.Taleboble`). Figuren siger kun *hvad* der siges og oplyser, hvor munden
er, og hvor stort hovedet er (`hoved: { op, side, ned }`). Laget finder selv
pladsen: over hovedet, når der er plads; ellers til højre, til venstre eller
under. Det holder sig inden for scenen, lægger sig ikke over det, replikken
handler om (`undgaa`, et rektangel — Kemichael giver det glas, han peger på,
`L.undgaa`), og halen ender ved hovedets kant i stedet for at gå hen over
ansigtet. Er den foretrukne plads ikke fri, vælges den, der går mindst på
kompromis, og blandt lige gode den, hvor halen sidder mindst skævt.

**Skriften holder en mindste størrelse på skærmen** (`STIL.minSkaerm`,
14 px): er et bredt bord zoomet langt ud, vokser hele boblen med samme
faktor, så den ser ens ud og stadig kan læses. Det er svaret på, om boblen
skulle flyttes til DOM for læsbarhedens skyld — det skulle den ikke.

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
hylder, plakat, `bobleR`), og lærredet skalerer scenen, så den fylder vinduet.
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

Hældning med hånden: holdes en flaske stille over et glas, vipper den efter
0,3 s og hælder, så længe den holdes der (`opdaterHaeldning`; farten pr. type
i `HAELD.fart`). Strålen lander, hvor tuden er, så ved siden af glasset hældes
der på bordet. Dråbeflasken drypper, sprøjteflasken sprøjter og vejebåden
drysser på samme måde. Et hurtigt slip over glasset giver én portion:
flaskens standardportion (`haeldMl`), dog højst en femtedel af glasset
(`portion`). Målet sigtes med tuden, ikke med musen. Løber glasset over,
stopper strømmen, til flasken flyttes. Flaskerne er fyldt til 200 mL af 250,
så der kan hældes i dem.

Det, der lige er brugt, bliver hængende: flasken bliver i hældepositur
over glasset, dråbeflasken, sprøjteflasken og spatlen bliver i luften over
det, de blev brugt på (`svaev`, `svaevVed`). En gul ring med en pil ved
siden af viser, at et klik gentager handlingen (en portion til, en dråbe
til, en spatelspids til). Resten af bordet venter, til det trækkes væk; så
går det hjem. Der tegnes ingen hånd.

Fortyndingsvarmen (`dHfort`, `cRef` i stoftabellen) er en tilstandsfunktion
af koncentrationen, så syre i syre giver ingen varme, og syre hældt i små
portioner giver det samme som på én gang. Lige dele koncentreret svovlsyre
og vand koger stadig; det er rigtigt.

Klik viser, træk gør: et klik vælger det, der rummer noget, til aflæsning
og zoom, og handlinger sker kun ved at trække. Undtagelser er kontakten på
varmepladen og en dråbeflaske, der allerede hænger over et glas. Zoomboblen
tegnes i panelet (`NK.Bord.prototype.tegnBoble`), så den ikke dækker bordet.

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
er kun mål for hældning, når tuden står lige over halsen; ellers sættes det
bårne ned mellem flaskerne.
Superanimationerne bruger indtil videre ét rum; rummene er til det senere
spil.

## Sådan bruger et forsøg mappen

1. Stilark: grundstilen først, forsøgets eget stilark bagefter. Forsøgets
   `css/stil.css` har kun det, der er særligt for forsøget.
   ```html
   <link rel="stylesheet" href="../laboratoriet/css/grund.css">
   <link rel="stylesheet" href="css/stil.css">
   ```
2. Kernen og farvemodellen indlæses først af alle scripts, rundvisningen lige
   før `app.js`:
   ```html
   <script src="../laboratoriet/js/kerne.js"></script>
   <script src="../laboratoriet/js/farvemodel.js"></script>
   ...
   <script src="../laboratoriet/js/rundvisning.js"></script>
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
`#lydknap`, `#hjaelpknap`). Krogene `vedAendring`, `vedBesked`,
`vedHaendelse`, `vedSkift`, `tast`, `panel` og `efterStart` er til det,
forsøget selv vil lave. `NK.Side.nu` er siden, så selvtesten kan pille ved
den.

Al prosa i et forsøg ligger i dets `js/tekst.js` som `{ id: tekst }`, og
`side.js` skriver den ind i elementerne ved start: en streng bliver til
indholdet, en liste til punkter. Det går to veje: en øvelsesvejledning kan
oversættes til den ene fil, og hele forsøgets sprog kan læses igennem ét
sted uden at åbne kode. Mønster: `../sb2.4_ligevaegt/`.

Prøvebordet og prøverummet har endnu deres egne `app.js`; de flyttes over
på `side.js`, når der ikke er andet i gang.

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

Flagene er verdenstilstanden. De er med vilje det eneste, der gemmes:
`F.tilstand()` giver trin, udløsere og flag, og `F.saetTilstand()` spiller
dem tilbage. Bordene bygges op fra deres opstilling. Det er den beslutning,
der holder gemningen lille nok til at virke, når der bliver mange rum.

Det er det samme lag, spillet skal bruge. Et trin i en øvelse og en låst dør
i et escaperoom er den samme sætning — betingelse, konsekvens, fyrer én
gang — og kun konsekvensen er forskellig. Mønster: `../sb2.4_ligevaegt/js/forloeb.js`.

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

Mønster: `../sb2.4_ligevaegt/js/billede.js` og dets trin `billede`.

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

* sb2.4 er lagt over på genstandsmodellen i `../sb2.4_ligevaegt/`. Bordet
  står, kemien er prøvet igennem, badene virker, forløbets ni trin kører,
  billedet af de syv glas noteres, og Kemichael siger forløbets
  bemærkninger. Del 2 om fortynding, quizzen og tegneserien mangler.
  Derefter sc6.8 og sc8.6.
* **Grafen.** Journalen kan notere en måling; den kan endnu ikke tegne den
  op. Titrerings- og kalibreringskurver dukker op i næsten enhver øvelse, så
  det er en fælles komponent, ikke noget hvert forsøg skal opfinde.
* **Lysvejen ovenfra.** Ses der ned i et glas, er vejen væskens dybde og
  ikke glassets bredde. Det er hele pointen i sb2.4's del 2 om fortynding:
  frugtfarven ser ens ud, fordi vejen ovenfra bliver længere i samme takt,
  som koncentrationen falder. Dybden er der allerede som `niveau`, og
  geometrien i `udstyr.js` giver resten.
* **Øvelsestjekket:** en generisk validering, ethvert nyt forsøg køres
  igennem. Kimen står i `../sb2.4_ligevaegt/_selvtest.html` afsnit 10, som
  bruger `NK.Vilkaar.naevnte` til at opdage et trin, der peger på et glas
  eller et stof, der ikke findes.
* Rammen for `quiz.js` og `tegneserie.js` samles, når to forsøg på
  genstandsmodellen har vist, hvad de er fælles om.
* **Til spillet:** låste passager i `rum.js`, som spørger forløbets flag,
  om man må gå videre. Vilkårs- og forløbslaget er der allerede.
* Et rum, hvor forsøgene er stationer, man kan gå imellem. Prøverummet er
  motoren; prøvebordet er den første station.

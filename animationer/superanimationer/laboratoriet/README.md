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
js/rundvisning.js    spotlight-rundvisningen bag hjælpeknappen
js/lyd.js            lydene med Web Audio, ingen lydfiler
js/sprites.js        indlæser SVG-sprites; mappen findes ud fra filens placering
js/koer.js           koreografier: små bevægelser af genstande (flyt, vent, kald)
js/stof.js           stoffer, opløsninger (µmol og mL), reaktioner (fuld, ligevægt,
                     bundfald, opløsning), redoxpar, pH, gas, varme og farven som lysfiltre
js/stoftabel.js      den fælles tabel: ioner, syrer, baser, indikatorer, gasser, pulvere,
                     metaller (Mg, Zn, Fe, Pb, Cu, Ag), bundfald (opløselighedstabellen:
                     chlorider, iodider, sulfater, carbonater, hydroxider, Ag₂O, AgSCN),
                     reaktioner og standardpotentialer
js/udstyr.js         kataloget over udstyr: sprite, anker, inderside, rumfang,
                     tud og egenskaber (holder, hælder, drypper, spatel, rører ...)
js/beholder.js       det, en beholder kan: rumme, blande, hælde, lag, bundfald,
                     temperatur, kogning, overløb
js/tegning.js        baggrund, plakat, væske, bundfald, korn, etiketter, stav,
                     termometer, varmeplade, stråle, dråber, damp, pyt, markering
js/mikro.js          zoomboblen: én kugle pr. partikel med formlen på
js/bord.js           bordet: genstande, greb og slip, møder afgjort af
                     egenskaber, stativ og varmeplade, uheld, tidens gang, tegning
js/rum.js            rummene: flere borde på ét lærred, pile og piletaster,
                     glidning, det man bærer kommer med, lugen, stinkskabet
css/grund.css        farver, toplinje, scene og panel, kort, forløb, quiz,
                     knapper, overlays, tegneserie og rundvisning
sprites/             generisk glasudstyr uden etiketter (etiketten tegnes i koden)
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
| 0 fysik | `beholder.js` | blanding, lag, fortynding, temperatur, kogning, overløb |
| 1 egenskaber | `stof.js` + `stoftabel.js` | bundfald (opløselighedsprodukt), syre-base (Ka, autoprotolyse, pH, indikatorer), redox (standardpotentialer, reaktioner mellem par afledes), kompleksdannelse (K), reaktionsvarme ΔH, fortyndingsvarme |
| 2 navngivne reaktioner | `stoftabel.js` | reaktioner med betingelser, fx kobber i koncentreret salpetersyre |
| 3 hændelser | `bord.js` | bobler, farvede dampe, damp, "voldsom" (kogende sprøjt), som Kemichael reagerer på |

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

Stinkskabet er et valg på rummet (`stinkskab: { x0, x1, top, aabning }`):
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
2. Kernen indlæses først af alle scripts, rundvisningen lige før `app.js`:
   ```html
   <script src="../laboratoriet/js/kerne.js"></script>
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
   kerne, lyd, sprites, stof, udstyr, kemichael, koer, beholder, tegning,
   mikro, bord, forsøgets stoffer og laerer, rundvisning, tur, app.

## Regler

* En funktion i `kerne.js` og de øvrige moduler må ikke ændre betydning,
  uden at alle forsøg er tjekket. Ny funktionalitet lægges til; gammel fjernes
  kun, når intet forsøg bruger den.
* `grund.css` må kun have regler, der gælder alle forsøg. Et forsøg, der vil
  noget andet, overskriver i sin egen `stil.css`.
* Panelet er 430 px bredt (`--panel-bredde`).
* Sammensatte ioner i zoomboblen er én kugle med formlen på (NO₃⁻), ikke flere
  kugler. Ladning ±1 skrives som + og −, aldrig 1+ og 1−.
* sc1.3 og sc2.5 er ældre og har et andet sidelayout. De bruger `kerne.js` og
  `rundvisning.js`, men har stadig hele deres eget stilark.

## Næste skridt

* sb2.4 lægges over på genstandsmodellen som første rigtige forsøg; derefter
  sc6.8 og sc8.6.
* Rammen for `quiz.js`, `tegneserie.js` og `app.js` samles.
* Et rum, hvor forsøgene er stationer, man kan gå imellem. Prøverummet er
  motoren; prøvebordet er den første station.

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
                     bundfald, opløsning) og farven som lysfiltre
js/udstyr.js         kataloget over udstyr: sprite, anker, inderside, rumfang,
                     tud og egenskaber (holder, hælder, drypper, spatel, rører ...)
js/beholder.js       det, en beholder kan: rumme, blande, hælde, lag, bundfald,
                     temperatur, kogning, overløb
js/tegning.js        baggrund, plakat, væske, bundfald, korn, etiketter, stav,
                     termometer, varmeplade, stråle, dråber, damp, pyt, markering
js/mikro.js          zoomboblen: én kugle pr. partikel med formlen på
js/bord.js           bordet: genstande, greb og slip, møder afgjort af
                     egenskaber, stativ og varmeplade, uheld, tidens gang, tegning
css/grund.css        farver, toplinje, scene og panel, kort, forløb, quiz,
                     knapper, overlays, tegneserie og rundvisning
sprites/             generisk glasudstyr uden etiketter (etiketten tegnes i koden)
proevebord/          det frie bord: index.html, css/stil.css, js/stoffer.js
                     (stoffer, reaktioner, opstilling), js/laerer.js, js/tur.js,
                     js/app.js, _selvtest.html
```

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
| ingenting          | alt                     | det sættes ned, hvor det slippes |

Frihed frem for afvisning: rystes et åbent glas voldsomt, skvulper det ud;
løber et glas over, bliver der en pyt; sættes et reagensglas på bordet,
vælter det. Kemichael kommer og tørrer op (`proevebord/js/laerer.js`).
Et klik er en genvej: udstyret bruges på den valgte beholder.

Et nyt forsøg på modellen laver sin egen `js/stoffer.js` med stoffer,
reaktioner og opstilling (`NK.OPSTILLING`, `NK.BORD_VALG`) og en
`js/laerer.js` med sine egne scener. Forløbet skal kun genkende tilstanden
(`vedHaendelse`, `vedAendring`), aldrig spærre for handlinger.

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
* Et rum, hvor forsøgene er stationer, man kan gå imellem. Prøvebordet er
  den første station.

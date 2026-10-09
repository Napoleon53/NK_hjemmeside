# sb4.5 Organisk syntese

Superanimation til Organisk B (`kemi-b-filer/samling_b4,5,6.html`, knap 5). Den afløser
`kemi-b-filer/Eb5_breakingbad.html` ("Sælg kemikalier", Syntese-Tycoon 2.1), som nu ligger
i `kemi-c-filer/arkiv/Eb5_breakingbad_oldversion.html`. Bygget 2. oktober 2026 på
brugerens bestilling: "lav sb4.5 om til en superanimation (og put den direkte på
hjemmesiden)".

Bygget om 9. oktober 2026 efter brugerens første test: "lav den lidt mere spændende i
designet. Butikken må gerne være lidt mere shop-agtig. Det hele skal foregå på en fane.
Det er fint med reaktionsskemaet, men det må gerne fylde lidt mindre (tavlen skal være
mindre), og lav plads til mere spændende spil-elementer". De to faner (Reaktoren uden
penge og Fabrikken) er nu ét spil. Claude valgte selv spil-elementerne (serien,
esterkortet, udstyret, dagens tilbud og titlerne efter det tjente).

## Bestillingen

1. **Pointen i én sætning.** En ester laves af en carboxylsyre og en alkohol, hvor syrens
   OH og alkoholens H bliver til vand, og mangler man syren, laver man den ved at oxidere
   en primær alkohol; esterens navn siger, hvilke to stoffer den er lavet af.
2. **Hvad den afløser, og hvad der er med.** Fra den gamle: lageret, butikken som et
   vindue oven på laboratoriet, penge, reaktoren med to pladser, svovlsyre (H⁺) som
   katalysator, varme, kaliumpermanganat til oxidation, missionerne, børsen med høj
   efterspørgsel hvert 30. sekund, duftene (pære, banan, ananas), aspirin og titlerne.
   Nyt: tavlen med strukturformler, ordrer, der kun giver navnet, kurven i butikken,
   serien, esterkortet og udstyret.
3. **Naboerne.** b5.2 (Estersyntese) ejer forsøget i laboratoriet, b5.3 (Oxidation af
   alkohol) ejer oxidationstallene, b5.1 ejer påvisningen af aldehyder, tegnebrættet ejer
   navngivningen af alt andet, og Organiske grupper ejer stofklasserne. Her er der ingen
   oxidationstal og ingen opstilling trin for trin.
4. **Loftet.** Én fane. Butikken fører 7 alkoholer, 3 syrer og kaliumpermanganat; fire
   syrer og propanon kan kun laves. Tre åbne ordrer (fire med reklameskiltet). Tre slags
   udstyr. Esterkortet har de 49 estere, reglerne giver, og tre særlige stoffer.
5. **Layoutet.** Toplinjen har kassen, titlen, serien og udstyret. Scenen: lageret med
   flasker og døren til butikken øverst, ordren på én linje, kolben med knapperne og
   tavlen (højst 600 × 390), statuslinjen nederst. Panelet: kunderne, børsen og det lille
   esterkort.

## Spillet

Eleven starter med 300 kr. som lærling. En kunde vil have ét stof og siger kun navnet,
hvad det skal bruges til, og prisen. Eleven køber de to stoffer i butikken, lægger dem i
kolben (klik eller træk), tænder for svovlsyre og varme og trykker Start. Tavlen viser
reaktionen med strukturformler: syrens atomer er orange, alkoholens blå og ilten fra
permanganaten lilla. Det, en kunde har bestilt, bliver leveret af sig selv; andet står på
lageret og kan leveres senere med knappen på ordren.

- **Kunderne.** De ti første ordrer kommer i fast rækkefølge: ethylethanoat
  (neglelakfjerner), propylethanoat (pære), pentylethanoat (banan), ethylmethanoat (rom),
  ethylbutanoat (ananas), propanon (acetone), pentylbutanoat (abrikos), pentylpentanoat
  (grønt æble), methyl-2-hydroxybenzoat (vintergrøn) og acetylsalicylsyre (aspirin). De
  fire første kan laves af det, butikken fører. Fra den femte skal syren eller ketonen
  laves ved oxidation. Derefter kommer der tilfældige ordrer.
- **Butikken** (`js/butik.js`, tasten B). Reoler med alkoholer, syrer, oxidationsmiddel og
  udstyr. Et klik lægger en portion i kurven, og Betal stiller varerne på lageret. Én
  vare er på tilbud (30 % ned, skifter hvert minut). Butansyre er udsolgt ("den lugter af
  opkast"), så ananas og abrikos kræver oxidation.
- **Serien.** Hver levering i træk giver 10 % oveni, højst 50 %. En blanding, der må
  hældes ud, bryder serien, og det gør Vis svaret også. Hint bryder den ikke.
- **Børsen.** Hvert 30. sekund er der høj efterspørgsel på én duft (+20 til +120 %).
- **Esterkortet** (`js/esterkort.js`, tasten E). 7 alkoholer gange 7 syrer og de tre
  særlige (acetylsalicylsyre, propanon, diethylether). Første gang et stof laves, giver
  det 50 kr. Kortet viser kun det, eleven har lavet; resten er spørgsmålstegn, så kortet
  ikke røber en ordre. Navnene står i alkoholens og syrens farve.
- **Titlerne** følger det, fabrikken har tjent i alt: lærling, laborant (1000 kr.),
  kemiker (2500 kr.) og fabrikschef (5000 kr.). En ny titel fejres med et skilt.
- **Udstyret.** Kundekort (250 kr., 20 % rabat på kemikalier), reklameskilt (400 kr.,
  kræver laborant, fire kunder ad gangen) og vandudskiller (600 kr., kræver kemiker,
  estere giver 25 % mere, fordi ligevægten forskydes, når vandet fjernes).
- **Banken.** Er kassen og lageret tomme, låner banken 200 kr.

Fabrikken huskes i browseren (`nk-sb4.5-fabrik2`). Forfra kræver to tryk. Alle tal står i
`FABRIK` i `js/data.js`.

## Reglerne (`js/kemi.js`)

Kemien er regler, ikke en opskriftsliste. Molekylerne kommer fra molekylemotoren
(`../../molekylemotor/`), og produkterne bygges som grafer og navngives af den:

- **Ester:** et stof med COOH og et stof med OH (alkohol eller ringens OH på salicylsyre).
  Kræver svovlsyre og varme. Mangler en af dem, sker der intet, og blandingen bliver i
  kolben, til eleven har rettet det.
- **Oxidation:** alkohol + kaliumpermanganat med varme. Primær: aldehyd og så carboxylsyre.
  Sekundær: keton. Syrer, ketoner og estere oxideres ikke.
- **Ingen reaktion** (to syrer, to alkoholer, syre + permanganat): blandingen hældes ud,
  og pengene er tabt.
- **Påskeæg:** ethanol + ethanol med svovlsyre og varme giver diethylether ("en ether, ikke
  en ester"). Methansyre + permanganat bliver til CO₂ og vand ("en dyr måde at lave
  sodavand på").

## Hjælpen

Ingen Kemichael (som `sc1.4_afstemning` og `sc_spil9_kemikort`). Statuslinjen nederst siger
næste skridt, hvad der gik galt, og har den ene knap: tre hint og så svaret. Hintene
bygges af den vej, reglerne finder (`NK.Kemi.rute`): navnets to dele, hvilke stoffer de
kommer fra, og om syren skal laves først. Hintene gælder den ordre, eleven har valgt i
panelet. Vis svaret skriver opskriften i linjen og bryder serien. Et klik på tavlen
springer animationen over.

## Filerne

```
index.html          siden: toplinjen, scenen, panelet, butikken, esterkortet og teorien
css/stil.css        grundlaget fra sc1.4 plus alt det, der er særligt for fabrikken
sprites/reaktor.svg kuglekøler, rundkolbe, vandbad og varmeplade (væsken tegnes i koden)
js/kerne.js         fælles hjælpere (som sc1.4)
js/data.js          stofferne, priserne, duftene, kunderne, ordrerne og spillets tal
js/kemi.js          reglerne, ruterne og navnets to dele
js/morf.js          tavlen: billederne af atomerne og bevægelsen mellem dem
js/reaktor.js       lagerets flasker, pladserne, kontakterne, kolben og Start
js/fane.js          statuslinjen og hinttrappen
js/fx.js            mønter, konfetti, tal, der stiger op, og skiltet ved en ny titel
js/esterkort.js     esterkortet, lille og stort
js/butik.js         butikken med reoler, kurv og ekspedient
js/fabrik.js        spillet: penge, ordrer, serie, børs, tilbud, udstyr og lån
js/rundvisning.js   rundvisningen på ? (som sc1.4)
js/app.js           overlays, taster og tegneløkken
_selvtest.html      udviklerværktøj
```

Ret i `js/data.js` for stoffer, priser, dufte, ordrer og spillets tal. Et nyt stof i butikken skal have en
SMILES-streng, motoren kan navngive; selvtesten tjekker navnet.

## Forenklinger

- Esterdannelsen er en ligevægt (K ≈ 4), men i spillet bliver én portion syre og én portion
  alkohol til én portion ester. Ligevægten står i teorien og hører til B2.
- Vandudskilleren giver flere penge, ikke flere portioner: én portion syre og én portion
  alkohol bliver stadig til én portion ester.
- Temperaturen er varme til eller fra. Den gamle havde temperaturvinduer pr. reaktion
  (fx 55 til 95 °C), som var opfundne.
- Aspirin laves her af salicylsyre og ethansyre. I fabrikken bruger man ethansyreanhydrid,
  fordi ringens OH reagerer langsomt med en syre; det står i teorien.
- Oxidationen af en primær alkohol går altid helt til syren (tilbagesvaling). Methanol
  bliver til methansyre; at methansyre kan oxideres videre til CO₂, er påskeægget.
- Kun ethanol + ethanol giver en ether. Andre par af alkoholer giver ingen reaktion.
- Salicylsyre reagerer ikke med sig selv i spillet.
- Duftene er lærebøgernes: methylethanoat lim, ethylethanoat neglelakfjerner, propylethanoat
  pære, pentylethanoat banan, octylethanoat appelsin, ethylmethanoat rom, methylbutanoat
  æble, ethylbutanoat ananas, pentylbutanoat abrikos, pentylpentanoat grønt æble,
  methylsalicylat vintergrøn. Den gamle kaldte ethylethanoat for pære.

## Selvtesten

`_selvtest.html` gennem en lokal server med rod i `animationer/` (molekylemotoren ligger
uden for mappen). 77 påstande: navnene fra motoren, alle 49 par af syre og alkohol (esteren
er syre + alkohol − H₂O atom for atom), oxidationen, de forkerte par, påskeæggene, første
ordre som en elev (butikken, kurven, klik og træk), de ti første ordrer med hintenes
opskrift og pengene krone for krone, serien, titlerne, børsen, tilbuddet, udstyret, lånet,
esterkortet, tavlen, layoutet og butikken fra 1100 × 650 til 1600 × 950, sproget og
skriftstørrelsen.

## Menulinjen

```html
<button class="tab-btn" data-emne="eb5" data-beskrivelse="…" onclick="visAnimation(this, '../superanimationer/sb4.5_organisk_syntese/index.html')" title="Organisk syntese"><span class="btn-num">5</span><span class="btn-text">Organisk syntese</span></button>
```

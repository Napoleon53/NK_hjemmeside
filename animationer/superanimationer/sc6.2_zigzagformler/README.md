# sc6.2 Zigzagformler

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter sine
egne filer, Kemichael fra `../../v2/kemichael/` og motoren til at tegne og
navngive molekyler fra `../../molekylemotor/`, som den deler med tegnebrættet
(`../tegnebraet/`).

Den samler tre gamle animationer fra `animationer/kemi-c-filer/`:
`c6.2_zigzag.html`, `c6.3_isomeri_alkaner.html` og `c6.4_byg_alkaner.html`.
De tre brugte den samme tegne- og navngivningskode, kopieret fra fil til fil.
Fane 4 er spillet fra `c6.5_spil_polaritet.html` (Molekylers opløselighed).
Nu er der én motor, og den er så stærk, at den også bærer tegnebrættet til
rapporter.

**Pointen i én sætning:** Zigzagformlen viser hele molekylet: ud fra den kan man
tælle atomerne, give molekylet navn og se, om to tegninger er det samme stof.

## Bestillingen

1. **Pointen:** som ovenfor.
2. **Afløser:** 6.2, 6.3 og 6.4. Alle seks øvelser fra de gamle er med (se
   nedenfor). Det gode fra de gamle: kæden bygges, mens man trækker; hovedkæden
   bliver grøn og sidegrupperne blå, når svaret er rigtigt; listen over løste og
   fundne molekyler med små tegninger.
3. **Naboer, der ikke røres:** c6.1 (kogepunkt), c6.6-c6.7
   (fedtstoffer og addition), b6.1 (E/Z-isomeri) og b6.2 (spejlbilledisomeri).
   Den simple cis/trans fra den gamle 6.4 er med; E/Z er ikke.
4. **Loftet:** fire faner. Opgaverne har højst 10 C (serier på ti), isomererne
   C₄ til C₇ (2, 3, 5 og 9). Opløselighed: 27 molekyler, 15 i hver bunke.
5. **Layout:** scene plus panel. Scenen er en tavle, man tegner på; opgaven og
   knapperne står i panelet.

Brugeren valgte fire faner og et tegnebræt, der også kan O, N, S og halogener
(24. september 2026). Den 25. september fik tegnebrættet sin egen side
(`../tegnebraet/`, brugerens valg): det er et værktøj til rapporter på både C og
B, ikke en øvelse, og det kan nu også navngive alkoholer, syrer, estre, aminer og
de andre stofklasser. Knappen **Tegnebræt ↗** i toppen åbner det i en ny fane.
Et gammelt link til `index.html#tegn` sendes derhen.

## Fire faner

Tasterne 1-4 følger rækkefølgen.

**1 Zigzag** (`#zigzag`), den gamle 6.2. To retninger:
*Strukturformel → zigzag*: strukturformlen med alle atomer hænger på et papir på
tavlen; eleven tegner zigzagformlen. *Zigzag → strukturformel*: eleven klikker på
hvert knæk og hver ende (C), klikker H på hvert C og skriver molekylformlen.

**2 Navne** (`#navne`), den gamle 6.4. *Byg ud fra navnet* eller *Giv navnet*,
for alkaner eller alkener. De sidste fem alkener har cis eller trans, og
tegningen skal vende rigtigt. (I den gamle kunne man kun bygge alkener, og kun
når de to andre faner var 10/10. Nu kan de også navngives, og intet er låst.)

**3 Isomerer** (`#isomerer`), den gamle 6.3. Find alle isomerer af C₄H₁₀,
C₅H₁₂, C₆H₁₄ og C₇H₁₆. Samme navn er samme stof, bare tegnet anderledes: dets
plads i listen ryster. Alle formler kan vælges (i den gamle var de låst).

Fane 1-3 har én knap i opgavekortet: Giv hint → Vis svaret → Næste molekyle.
Tegningen tjekkes af sig selv, når alle C-atomer er brugt. Kemichael tilbyder at
præsentere hver fane (Start præsentation / Nej tak) og roser, når en serie er
klaret.

Kæder tegnes ved at trække fra et atom, eller ved at klikke på enden: hvert klik
gør kæden ét C længere og fortsætter zigzaggen. Et startpunkt har en lille
animation, der viser en kæde, der trækkes ud. Enderne af en tegnet kæde har
ingen prik; kun det atom, musen er over eller trækker fra, bliver markeret.

**4 Opløselighed** (`#oploeselighed`), den gamle 6.5 (Polær eller upolær?).
Tilføjet 25. sept. 2026 efter brugerens ønske om at kunne skifte frem og tilbage
mellem zigzagformlerne og spillet. Pointen: tæl C-atomerne i zigzagformlen, og del
med antallet af polære grupper; under 4 opløses stoffet i vand, over 4 i heptan.

* **Scenen:** molekylet står på tavlen, og et bægerglas med heptan øverst og vand
  nederst står på bakken. Vandet har små V-formede vandmolekyler, heptanen små
  zigzagkæder. Eleven trækker molekylet ned i et lag (laget lyser op, mens det
  holdes) eller klikker på laget. Første gang viser en stiplet pil vejen.
* **Svaret:** rigtigt, og molekylet bliver i laget. Forkert, og det flytter selv
  over i det rigtige lag, og eleven mister et liv (fejl blokeres ikke, de har en
  konsekvens). Præcis 4 C pr. gruppe tæller begge veje; molekylet lægger sig i
  grænsen mellem lagene, drejet, så de polære grupper vender ned i vandet
  (butan-1-ol står lodret, dodecan-1,6,12-triol ligger fladt). Efter svaret er de
  polære grupper blå, carbonkæden brun, og C-atomerne har numre.
* **Panelet:** navnet (plus fx "sorbitol, sødemiddel"), point, tre liv og én knap:
  Giv hint (de polære grupper bliver blå, og reglen står i beskeden) → Vis svaret
  → Næste molekyle. Regnestykket står med brøkstreg: Forhold = 9 C-atomer / 2
  polære grupper = 4,5, og en besked til den typiske fejl ("Syre betyder ikke
  vand", "Der er 2 polære grupper, men carbonkæden vejer tungest").
  Skifteren Zigzag / Alle atomer tegner molekylet på den anden måde.
* **Bunken:** 15 molekyler, fem lette, fem middel og fem svære, med både vand og
  heptan i hver femmer og højst ét grænsetilfælde. Et nyt spil tager dem, man ikke
  har set, først. Prikkerne er grønne (rigtigt), gule (vist) og røde (forkert); et
  klik viser molekylet, regnestykket og det lag, eleven valgte. Point: 100, 70 med
  hint, 0 for et vist svar. Rekorden huskes (`nk-sc6.2-oploeselighed-rekord`).
  Hele bunken med højst tre viste svar giver stor konfetti og ros fra Kemichael.
  Fanen giver ikke et klistermærke.

Fra den gamle 6.5 er alle 17 molekyler med, med samme svar, samme regel (4 C pr.
gruppe, grænsen accepteret i begge), tre liv, 100 point og 30 for hintet, træk
nedad og regnestykket med brøkstreg. Nyt: bægerglasset med lagene i stedet for to
felter, at molekylet selv flytter ved et forkert svar, grænsen mellem lagene, de
10 nye molekyler (hexan, cyclohexan, ethan-1,2-diol, hexan-1,6-diol,
diethylether, hexansyre, octadecansyre, sorbitol, heptan-1,7-diol og
nonan-1,5,9-triol), sværhedsgraderne, Alle atomer og tegningerne fra motoren (den
gamle tegnede C-atomerne som prikker og havde et par skæve molekyler).

### Kemichaels skuffe og fejringen

Der er ti quizzer: to serier på Zigzag, fire på Navne og fire isomer-niveauer.
Hver giver et klistermærke fra Kemichaels skuffe
(`../../molekylemotor/js/klistermaerker.js`), som kan sættes på tegnebrættet og
kommer med i billedet: kaffekoppen, gloøjne, festhatten, Bunsen (kaktussen),
overskægget, stemplet "Godkendt af Michael", chipsposen, navneskiltet med "KE",
øjenbrynet fra 1994 og til sidst Kemichael selv (C₇H₁₆). En serie tæller, når
højst tre svar er vist; et isomer-niveau, når højst halvdelen er vist. Ellers
siger Kemichael, at skuffen kun åbner for dem, der selv svarer.

Et rigtigt svar giver en lille konfetti. En klaret quiz giver stor konfetti over
tavlen, Kemichael med en replik om klistermærket og et vindue med det og knappen
**Prøv den på tegnebrættet ↗**, der åbner tegnebrættet i en ny fane med
klistermærket klar (`../tegnebraet/index.html#klister=kaffekop`). Quizzen bliver
stående. Det, der er låst op, huskes i browseren under `nk-skuffe`, som begge
sider læser (indtil 25. sept. 2026 `nk-sc6.2-skuffe`; den gamle flyttes over).

Kaffekoppen står næsten gemt i scenens nederste højre hjørne og er den samme på
alle fire faner: har Kemichael hentet den, er den væk på dem alle, til siden
åbnes igen.

## Motoren

Molekylet, navngivningen, tegningen, tavlen og skuffen ligger i
`../../molekylemotor/` og deles med tegnebrættet. Læs `molekylemotor/README.md`,
før der rettes i dem, og kør begge selvtests bagefter. Navngivningen kan siden
25. sept. 2026 også de funktionelle grupper; quizzerne her bruger kun
carbonhydriderne, så det ændrer intet på fanerne.

## Filer

```
index.html            markup: fire faner, panelerne, teorien, rundvisningen
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, tekst, tal, laerred (samme som sc4.2)
js/opgaver.js         sværhedstrinnene (de gamle 6.2 og 6.4) og isomerlisterne
js/data.js            Kemichaels replikker, rosen, linjerne under scenen
js/tjek.js            tjek af formel, navn og tegning med beskeder til fejlene
js/opgavefane.js      det, fanerne har til fælles (mus, besked, tegning, konfetti,
                      vinduet med et nyt klistermærke)
js/sim_zigzag.js      fane 1
js/sim_navne.js       fane 2
js/sim_isomerer.js    fane 3
js/oploeselighed.js   fane 4: molekylerne, de polære grupper og reglen om 4 C
js/sim_oploeselighed.js  fane 4: spillet, bægerglasset og panelet
js/laerer.js          Kemichael på alle fire faner
js/praesentation.js   tilbuddet om præsentationen (ens i alle mapper)
js/rundvisning.js     rundvisningen bag ?
js/sprites.js         lageret til Kemichaels sprites (animationen har ingen egne)
js/app.js             faneskift, teori, tastatur, tegneløkken
_selvtest.html        udviklerværktøj, se nedenfor
```

## At rette i den

* **Sværhedsgraden** står i trinnene i `js/opgaver.js` (`ZIGZAG`, `ATOMER`,
  `ALKANER`, `ALKENER`): kædelængde, antal og størrelse af sidegrupper, og om
  dobbeltbindingen sidder for enden eller har cis/trans.
* **Replikker og linjen under scenen** står i `js/data.js`.
* **Beskederne ved fejl** står i `js/tjek.js`.
* **Navngivningen og tegningens udseende** står i motoren
  (`../../molekylemotor/js/navngivning.js` og `struktur.js`) og gælder også
  tegnebrættet.
* **Opløselighedens molekyler** står i `MOLEKYLER` i `js/oploeselighed.js` som en
  lille SMILES-streng med navn, sværhed (1-3), svar og hovedkæde. Selvtesten
  tjekker, at reglen giver det svar, der står. Point og liv står øverst i
  `js/sim_oploeselighed.js`, beskederne til fejlene i `fejlBesked`.

## Forenklinger

* Navngivning efter 1979/1993-reglerne, ikke 2013 (hvor den længste kæde vinder
  over dobbeltbindingen). Det er gymnasiebøgernes regler.
* Kun den klassiske cis/trans. E/Z hører til b6.1.
* Atommasserne er IUPAC 2021 med to decimaler, H 1,01, som i sc4.1. Ethanol er
  derfor 46,08 g/mol.
* På opgavefanerne kan et C kun have én dobbeltbinding, og kun enderne kan
  slettes (som i de gamle).
* Opløseligheden er den gamle 6.5's tommelfingerregel: C-atomer delt med polære
  grupper, grænsen ved 4. Virkeligheden er glidende (butan-1-ol opløses delvist,
  ca. 7 g pr. 100 mL, pentan-1-ol ca. 2 g), og derfor tæller præcis 4 begge veje.
  Polære grupper er OH, COOH (én gruppe; dens C tæller med blandt C-atomerne) og
  O i kæden (ether). Den gamle talte ikke etherens O; dipropylether får samme svar
  (6 C / 1 = 6, heptan), og diethylether (4 C / 1) bliver et grænsetilfælde, som
  passer med, at den opløses en del i vand. Amin- og carbonylgrupper er ikke med.
* Heptan står for det upolære opløsningsmiddel, som i c3.5. Lagene er vist med
  molekyler i en forstørret gengivelse; de små vand- og heptanmolekyler er pynt og
  flytter sig tilfældigt, men bliver i hvert sit lag.

## Selvtest

`_selvtest.html` kræver en lokal server med `animationer/` som rod (motoren
hentes fra `../../molekylemotor/`, Kemichael fra `../../v2/kemichael/`). Den
kontrollerer navngivningen af carbonhydrider (også alle isomerer af C₄ til C₉),
molekylformel og molarmasse, seks serier af hvert sværhedstrin, tjekkets beskeder
ved de typiske fejl, tavlens regler på quizfanerne, at alle fire faner kan
gennemføres, klistermærkerne (også at vinduet åbner tegnebrættet med det nye
klistermærke), opløselighedsspillet (reglen giver de 17 svar fra den gamle 6.5,
bunken er blandet rigtigt, point, liv, grænsetilfælde, træk og klik), sproget og
layoutet fra 520 × 380 til 1500 × 900. Slutlinjen skal være ALT OK
(25. september 2026: 105 påstande). Tegnebrættet og resten af motoren testes i
`../tegnebraet/_selvtest.html`.

## I menuen

Ja, fra 25. september 2026 som c6.2 i `animationer/kemi-c-filer/samling_c6.html`
(åbner på Zigzag). De gamle ligger i `kemi-c-filer/arkiv/` som
`c6.2_zigzag_oldversion.html`, `c6.3_isomeri_alkaner_oldversion.html`,
`c6.4_byg_alkaner_oldversion.html` og (fra 26. sept. 2026, fane 4)
`c6.5_spil_polaritet_oldversion.html`. Fane 4 har ingen egen knap.

26. sept. 2026 blev C6 omnummereret uden huller: 1 Alkaners kogepunkt, 2
Zigzagformler, 3 Tegnebræt, 4 Byg et fedtstof (`sc6.6_fedtstoffer`), 5
Umættet fedt?, 6 Substitution i benzin (`sc6.8`), 7 Fedt i chips (`sc6.9`).
Mappenavnene har beholdt de gamle numre.

# sb4.4 Intermolekylære bindinger

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.
Der er ingen Kemichael. Al tekst står på ét kort øverst midt i scenen, som i
`sc7.5_staerke_og_svage_syrer`, og intet svar tæller, før eleven trykker
Indsend svar (ombygget 24. oktober 2026, se nedenfor).

## Ombygningen 24. oktober 2026

Brugeren: "teksten står i højre hjørne, hvor læserens øjne ikke naturligt
falder. Teksten skal i stedet stå meget tydeligt øverst i midten, og man skal
sjældent kunne løse opgaver ved tilfældigt at klikke på slidere og knapper.
Der skal som minimum være et indsend svar." Om denne animation: "90 % af
eleverne løser opgaven ved bare uhæmmet at trække i slideren", og tælleren af
hydrogenbindinger oppe i hjørnet var "lidt underlig og indforstået".

* **Kortet øverst midt i scenen** (fra sc7.5): opgaven, spørgsmålet, svarene,
  hint, forklaringen til et forkert svar og knapperne. Statuslinjen nederst
  og opgavekortet i panelet er væk; panelet har kun listen (og grafen på
  fane 2). Kortets plads er sat af (`kortZone` i `js/fane.js`), så intet
  under det flytter sig.
* **Indsend svar.** Termometeret løser ingen opgave af sig selv. Et
  kogepunkt findes ved at stille termometeret på den temperatur, hvor
  stoffet begynder at koge (der kommer bobler), og trykke Indsend svar
  (±4 °C, `D.TOL`). Knappen viser temperaturen, der sendes ind, er grå,
  til termometeret er rørt, og banker, når der er noget at sende. Et svar
  på et spørgsmål vælges først og sendes så ind. Et forkert svar giver en
  rød forklaring på kortet (`D.tempFejl` siger, hvad eleven ser: ingen
  bobler, bobler eller kun damp).
* **Stjernen** kræver løst i første forsøg uden Vis svaret, så det ikke kan
  betale sig at gætte løs.
* **Låsen:** under et gæt og på det grønne kort kan termometeret og
  kontakten ikke bruges; kortet blinker i stedet.
* **Tælleren er væk.** I stedet forklarer en lille kasse ved luppen med en
  tegning, hvad en rød stiplet streg (hydrogenbinding fra H på O til O i et
  andet molekyle) og grå prikker (London-kraft mellem C-atomer) er. Et klik
  på et molekyle siger stadig, hvor mange bindinger netop det har.
* **Intet indforstået:** hver tekst nævner selv stofferne ("Ethanol og
  butan-1-ol har begge …", ikke "Begge har …"), og på fane 2 har det stof,
  kortet spørger om, en gul ring om luppen og glasset.

Den afløser `animationer/kemi-b-filer/b4.1_intermolekylaert_ethanol.html`
("Intermolekylært", knap 4 i `kemi-b-filer/samling_b4,5,6.html`). Brugeren
kaldte den sb4.1 efter filnavnet; mappen hedder sb4.4, fordi den er knap 4 i
B4-menuen, ligesom sb4.5 til sb4.7.

## Bestillingen (2. oktober 2026)

Brugeren: "lav sb.4.1 om til en superanimation". Brugeren valgte begge
anbefalinger: tre faner (Ethanol, Sammenlign, Rangér) og statuslinjen uden
Kemichael.

1. **Pointen:** En OH-gruppe giver hydrogenbindinger mellem molekylerne, og
   de holder så godt, at en alkohol koger langt højere end en alkan af samme
   størrelse.
2. **Afløser b4.1.** Med fra den gamle: den runde lup med ethanolmolekylerne
   som kugler (C mørkegrå, O rød, H hvid), hydrogenbindingerne som røde
   stiplede streger fra H til O, London-kræfterne som grå prikker mellem
   halerne, temperaturen man skruer på, signaturforklaringen og kontakten,
   der slår hydrogenbindingerne fra (i den gamle slog afkrydsningen faktisk
   kraften fra). Taget ud: Lav, Mellem og Høj (nu °C), kontakten for
   London-kræfterne (modellen har intet kogepunkt for ethanol uden dem) og
   farten, der kun voksede med temperaturen. Nyt: kogning ved 78 °C,
   glasset med ballon, fire mål, fane 2 med brugerens opgave om
   intermolekylære bindinger (kogepunkterne for alkaner og alkoholer) og
   fane 3.
3. **Naboerne:** `sc4.1_kogepunkt` ejer alkanernes kædelængde og form, når der
   kun er London-kræfter; her er alkanerne kun med som modstykke til
   alkoholerne. `sc3.3` ejer elektronegativitet og polaritet (δ+ og δ− bruges
   kun som mærker). `sc3.4`, `sc3.5` og `sc4.2` fane 4 ejer opløselighed og
   blandbarhed, som ikke er med. Dipol-dipol-bindinger (aldehyder, ketoner)
   er ikke med.
4. **Loftet:** tre faner og 16 stoffer (methan til hexan, 2-methylpropan,
   methanol til pentan-1-ol, propan-2-ol, 2-methylpropan-2-ol,
   ethan-1,2-diol og propan-1,2,3-triol). 22 molekyler i luppen på fane 1, 6
   til 12 i hver lup på fane 2. Hævet 24. oktober 2026 til 33 stoffer på
   brugerens ønske (fane 3): også heptan, octan, decan, forgrenede alkaner og
   alkoholer, hexan-1-ol, octan-1-ol, propan-1,2-diol, propan-1,3-diol og tre
   ethere.
5. **Layoutet:** scene plus panel. Luppen er stjernen på fane 1 og 2;
   kammeret med glasset er lille. Fane 3 er en tavle med kort.

## Fane 1: Ethanol

Til venstre forklaringen af stregerne i luppen og under den et
temperaturkammer med et reagensglas med ethanol og en ballon (sprites fra
sc4.1), i midten luppen, til højre termometeret, som eleven trækker i (−100
til 120 °C). Et klik på et molekyle viser δ+ og δ− og siger, hvor mange
bindinger det har.

Fire opgaver i fast rækkefølge. Hver begynder med en frisk prøve:

1. **Ethanols kogepunkt.** Find den temperatur, hvor ethanol begynder at
   koge, og send den ind. Over 78 °C river molekylerne sig løs ét ad gangen,
   bindingerne til dem springer synligt, der kommer bobler, og ballonen
   fyldes.
2. **Hvad brydes?** Ethanol varmes op af sig selv (70 til 84 °C), og eleven
   vælger alle de bindinger, der brydes: hydrogenbindingerne og
   London-kræfterne, ikke bindingen mellem O og H eller mellem C og C. 15
   kombinationer, så tilfældige klik sjældent rammer.
3. **Find H'et.** Eleven klikker på et atom (gul ring, ingen δ, så svaret
   ikke afsløres) og sender det ind. Et H på C giver forklaringen. Bagefter
   har H på O en rød kant (δ+) på alle tre faner.
4. **Uden hydrogenbindinger.** Gæt først (højere, lidt lavere, meget
   lavere), så kommer kontakten frem og pulserer. Uden hydrogenbindinger er
   ethanol damp ved stuetemperatur, og eleven finder det nye kogepunkt,
   −42 °C, ved at køle ned og sende det ind. Kontakten er der kun i denne
   opgave; i de andre er hydrogenbindingerne altid slået til.

## Fane 2: Sammenlign

Brugerens opgave med tabellerne som forsøg: to stoffer i hver sit glas og hver
sin lup, ét termometer (−100 til 220 °C). Eleven gætter på kortet, hvilket stof
der koger ved den højeste temperatur, finder så kogepunktet for hvert stof og
sender det ind (et kogepunkt, der er fundet i et andet par, skal ikke findes
igen), ser dem side om side på et grønt kort med dommen over gættet og svarer
til sidst på hvorfor. Tre par (brugeren 24. oktober 2026: "lav kun 3 opgaver
i fane 2, og sørg for at eleverne ledes over i fane 3 bagefter"):

| Par | Pointe |
|-----|--------|
| propan og ethanol | samme størrelse; OH-gruppen løfter kogepunktet 120 °C |
| ethanol og butan-1-ol | samme OH; den lange kæde giver flere London-kræfter |
| ethanol og ethan-1,2-diol | to OH-grupper giver flere hydrogenbindinger |

Formen og de store molekyler (propan-1-ol/propan-2-ol og hexan/pentan-1-ol)
er taget ud her; de øves i Rangér. Når alle tre par er løst, siger det
grønne kort, at Rangér venter, knappen hedder Videre til Rangér, og fanen
Rangér pulserer gult i toplinjen, til eleven åbner den (`NK.kaldFane` i
`js/app.js`; det samme sker fra Ethanol til Sammenlign).

Kogepunkterne kommer på grafen i panelet (kogepunkt mod molarmasse, alkaner
grå, alkoholer røde). Brugeren samme dag: "Gør grafen lidt mindre
forvirrende" (navnene lå oven i hinanden). Navnene placeres nu, så de aldrig
rammer hinanden, et punkt eller trappen (`grafBokse`, som selvtesten tjekker);
det aktuelle par har navnene i samme blå og orange som over lupperne, og
forskellen vises kun for det aktuelle par, når begge kogepunkter er fundet:
en stiplet trappe fra det laveste punkt op til det højeste med teksten
"120 °C højere". Når alle tre er løst, kan hele tabellen vises.

## Fane 3: Rangér

Tre til fem stoffer som kort på en tavle i tilfældig rækkefølge, alle tegnet i
samme målestok med molekylformlen (C₅H₁₂), så det ses, at isomerer har de samme
atomer. Eleven trækker dem fra det laveste kogepunkt til venstre til det højeste
til højre (eller klikker på to kort) og trykker Indsend svar på kortet øverst.
Er det forkert, bliver de to første kort, der står forkert, røde, og kortet
forklarer dem (`D.grund`, der selv nævner begge stoffer). Kogepunkterne vises
først, når rækkefølgen er rigtig, og kommer så på en akse under tavlen.

Udvidet 24. oktober 2026 (brugeren: "Opgaven med sæt i rækkefølge er vildt god!
Kan du ikke inddrage langt flere forskellige molekyler og niveauer, og måske
give en værdig afslutning, når man er færdig"): 30 opgaver i seks niveauer med
fem i hver. Kortet viser niveauets navn og én linje om, hvad niveauet handler
om (`D.RANGER_GRUPPER`).

| Niveau | Kort | Pointe |
|--------|------|--------|
| 1. Let: OH eller ej | 3 | én alkohol mellem alkaner af samme størrelse |
| 2. Kæden | 3 til 4 | samme slags, forskellig kæde, op til decan og octan-1-ol |
| 3. Kæden og OH | 4 | begge dele |
| 4. Formen | 3 til 4 | isomerer: jo mere forgrenet, jo lavere (`gren` 0, 1 eller 2) |
| 5. Flere OH og ethere | 3 til 4 | dioler og glycerol; en ether har O uden H og samme atomer som en alkohol |
| 6. Mester | 5 | det hele, og en meget lang alkan kan koge over en lille alkohol |

Hint 1 følger det første forkerte par (`D.HINT1`: OH, ether, kæde, form eller
lang kæde), hint 2 forklarer parret, og hint 3 siger, hvad der skal flyttes.
En opgave, der er løst i første forsøg uden Vis svaret, får en stjerne, og
stjernerne huskes i browseren. Når et niveau er klaret, siger det grønne kort
det, der er konfetti, og knappen går til næste niveau. Når alle 30 er klaret,
kommer sejrsskærmen "Mester i kogepunkter!" med regn af konfetti og en
medalje efter stjernerne (`D.MEDALJE`): guld med alle 30, sølv med mindst 20,
ellers bronze, og knappen Gå efter guld åbner den første opgave uden stjerne.
Sejren kommer igen, når den sidste stjerne er hentet.

Etherne sammenlignes kun med alkoholer, aldrig med alkaner: dér skulle
dipol-dipol-bindinger med, og dem ejer `sc3.3`. Selvtesten tjekker, at hvert
par i en opgave har en forklaring, og at to stoffer i samme opgave koger
mindst 5 °C fra hinanden.

## Hjælpen

Som sc7.5: kortets nederste række har hint, den røde forklaring til et
forkert svar (rækken ryster) og svaret på et klik i scenen. Den gule knap
giver ét hint ad gangen (tre trin) og til sidst svaret; Indsend svar står
ved siden af. Et løst svar står på det grønne kort med forklaringen og
knappen Næste opgave. Teorien ligger bag knappen Teori, rundvisningen bag
`?`.

Påskeægget: et klik på termometerets kugle. Det er et sprittermometer, og over
78 °C ville spritten i et rigtigt sprittermometer koge.

## Forenklinger

* **Tilstanden kommer fra tabellen, ikke fra bevægelsen** (som sc4.1). Over
  kogepunktet går molekylerne til dampen ét ad gangen, hurtigere jo varmere
  det er. Under kogepunktet er en lille del damp efter damptrykket (Troutons
  regel, 110 J/(mol·K) for stoffer med hydrogenbindinger), højst 12 %.
* **Bevægelsen er en lille fysik** med stive, flade molekyler. H på O
  trækkes mod O i et andet molekyle (hvert H én binding, hvert O højst to),
  C-atomer i to molekyler trækker svagt i hinanden. Én hydrogenbinding trækker
  ca. fem gange så hårdt som én London-kraft. Bindingerne, der tegnes og
  tælles, er dem, fysikken har dannet, men kogepunktet regner den ikke selv.
* **London-kræfterne tegnes mellem C-atomerne**, ikke mellem H-atomerne på
  overfladen, hvor de i virkeligheden er størst.
* **Uden hydrogenbindinger koger en alkohol som alkanen med samme form**, hvor
  OH er byttet ud med CH₃ (ethanol som propan, −42 °C). Ethanols dipol er ikke
  regnet med; dimethylether, der har den, koger ved −25 °C.
* **Molekylerne er flade**, og H-atomerne på et CH₂ ligger ved siden af
  hinanden i stedet for foran og bagved. H-atomer, der på den flade tegning
  ville ligge oven i hinanden (ved et forgrenet C), er skubbet lidt fra
  hinanden.
* **Kogepunkterne** er tabelværdier ved 1 atm, afrundet til hele grader, som i
  brugerens opgave (CRC og NIST). Butan er −0,5 °C. Ballonen holder trykket
  på 1 atm.

## Filer

```
index.html          toplinje, de tre faner, teori og rundvisning
css/stil.css        grundlaget fra sc1.4 og nederst signaturen, kontakten,
                    grafen og kortene. NB: decimaltal med PUNKTUM i CSS
sprites/            reagensglasset, temperaturkammeret og termometeret (fra sc4.1)
js/kerne.js         NK-navnerum, tekst og lærred (som sc1.4)
js/data.js          stofferne, målene, parrene, rangeringerne, D.forklar og teksterne
js/molekyler.js     molekylernes flade kuglemodeller ud fra skelettet ("CCO")
js/model.js         prøven i luppen: tilstanden, kræfterne og bindingerne
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, kammeret, glasset med ballon, termometeret,
                    luppen, molekylerne og kortene
js/termostat.js     temperaturen, som eleven trækker i (fra sc4.1)
js/fane.js          det fælles: listen, kortet øverst, Indsend svar, hint,
                    låsen, musen og termometeret
js/sim_ethanol.js   fane 1
js/sim_sammenlign.js fane 2
js/sim_ranger.js    fane 3
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og tegneløkken
_selvtest.html      udviklerværktøj, se nedenfor
```

Et nyt stof er én linje i `D.STOF` (skelettet som `smiles` med C og O). Et nyt
par på fane 2 er én post i `D.PAR`, en ny rangering én linje i `D.RANGER`;
selvtesten tjekker, at alle par i en rangering har en forklaring.
Fysikkens konstanter står øverst i `js/model.js`.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>↑</kbd> <kbd>↓</kbd>
temperaturen (med Skift ti grader) · <kbd>R</kbd> forfra · <kbd>H</kbd>
rundvisning · <kbd>T</kbd> teori · <kbd>Enter</kbd> indsend eller næste ·
<kbd>Esc</kbd> luk. Direkte links: `#ethanol`, `#sammenlign` og `#ranger`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som rod.
Den tjekker molekylernes atomer og molarmasser, kogepunkterne og
tommelfingerreglerne, at hvert brugt stof koger ved kogepunktet og fortætter
under det, at alkoholerne danner hydrogenbindinger og alkanerne ingen, at
ethanol uden hydrogenbindinger koger ved −42 °C, alle fire opgaver, alle tre
par (og at grafens navne ikke rammer noget) og alle 30 rangeringer (selv, med forkerte svar og med Vis svaret, niveauerne
og sejren med medaljen), at
termometeret alene aldrig løser en opgave, at intet bedømmes før Indsend svar,
at termometeret er låst under et gæt, at stjernen kræver første forsøg, at
hvert par i en rangering har en forklaring, sproget (også intet indforstået og
korte tekster) og layoutet fra 1100 × 700 til 1600 × 950, herunder at kortet
med det længste hint og den længste forklaring kan være på sin plads. Sidst
kørt 24. oktober 2026: ALT OK (85 påstande).

## Til menuen (først når brugeren siger til)

* `kemi-b-filer/samling_b4,5,6.html`, knap 4 (`data-emne="b4"`): onclick til
  `'../superanimationer/sb4.4_intermolekylaere_bindinger/index.html'`, titel og
  tekst "Intermolekylære bindinger", beskrivelse fx "Varm ethanol op, slå
  hydrogenbindingerne fra, og sammenlign alkoholer og alkaner."
* Den gamle flyttes med `git mv` til
  `kemi-c-filer/arkiv/b4.1_intermolekylaert_ethanol_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt_b.html`: `{ nr: 4, navn: 'Intermolekylært' }`
  bliver `'Intermolekylære bindinger'`.
* Kolonnen "I menuen" i `../README.md` rettes.

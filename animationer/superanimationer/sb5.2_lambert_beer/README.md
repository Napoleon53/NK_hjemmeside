# sb5.2 Lambert-Beers lov

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-b-filer/b9.3_lambert_beer_simulation.html`
(knap 3 i Spektroskopi, `samling_b9.html`), men er **ikke i menuen** endnu.
Den gamle står urørt i menuen, til brugeren siger til.

## Bestillingen (2. oktober 2026)

Brugeren: "Kan du lave b.9.3 om til en superanimation?" Bestillingen er
skrevet af Claude uden at spørge, som ved sb2.1.

1. **Pointen:** Hvert lag af opløsningen tager den samme brøkdel af lyset,
   så absorbansen er ligefrem proportional med koncentrationen og
   kuvettebredden, A = ε · l · c, og en standardkurve er en ret linje gennem
   (0, 0) med hældningen a = ε · l.
2. **Afløser b9.3.** Med fra den gamle: lampen, kuvetten og detektoren med
   fotoner, der bliver absorberet i kuvetten, strålen, der er svagere efter
   kuvetten, I₀ og I, T og A på detektoren, skyderne for c og l og knappen
   til langsomt lys, formlen med tallene sat ind og ε i lilla som stoffets
   konstant, at kuvetten bliver mørkere med c, enhederne (A har ingen),
   standardkurven med lidt støj og en linje gennem (0, 0), de tre opgaver
   (ε af hældningen, c af en ukendt prøve og massen i et rumfang) og teorien
   (A = ε · l · c, T = I / I₀, A = −log(T), standardkurven). Taget ud: point,
   boksen "Hvorfor skifter farven?" (b9.1 ejer farverne), knappen Generer ny
   opgave (afløst af Forfra og listen) og den opdigtede ε = 0,80 for
   kobber(II)sulfat i mg/L. Nyt: dybden, hvor fotonerne bliver absorberet,
   følger I(x), så de fleste absorberes tidligt; kurven "Lys tilbage" over
   strålen; molekylerne i kuvetten; de seks forudsigelser; kuvetten kan
   trækkes bredere; tre rigtige stoffer med tabelværdier for ε i mM; fane 2,
   hvor eleven selv måler standarderne, lægger linjen og aflæser prøven;
   fane 3 med formlen først og otte regnestykker; statuslinjen med
   hinttrappen.
3. **Naboerne:** b9.1 ejer spektre, bølgelængder og farver. b9.2 (Breezer)
   og b9.4 (nitrit) ejer forsøgene, og en anden session samler dem i
   `sb5.3_spektrofotometri` (µM, a = ε · l som her). b9.5 ejer
   eksamensopgaverne med Excel, enheden på ε i M⁻¹·cm⁻¹, det lineære område
   og fortynding. Her bruges kun mM, og intet fortyndes.
4. **Loftet:** tre faner. Fane 1 har 6 forudsigelser og 3 stoffer, én
   kuvette og 1 lampe og detektor. Fane 2 har 4 opgaver med 7 kuvetter
   (vand, 5 standarder og prøven) og ét papir. Fane 3 har 8 regnestykker
   med højst 3 trin.
5. **Layoutet:** scene plus panel. På fane 1 og 2 står spørgsmålet over
   scenen, og scenen er et lærred. På fane 3 står regnestykket med felterne
   på tavlen i scenen og formens form, bogstaverne og tallene i en bakke
   under den. Fra 6. nov. 2026 står opgaven, svarene og hjælpen på
   papirkortet øverst i scenen (se Papirkortet nedenfor); panelet har
   oplysningerne, skyderne eller målingerne og listen.

Kemichael er ikke med. Hjælpen står på papirkortet: Giv et hint › Næste
hint › Vis svaret, og knappen lyser stille op efter en fejl.

## Fane 1: Lyset

Lampen sender lys med én bølgelængde gennem kuvetten til detektoren.
Fotonerne er prikker. En foton, der når væsken, bliver absorberet med
sandsynligheden 1 − T, og dybden trækkes efter I(x) = I₀ · 10^(−ε·c·x), så
der er flest små ringe forrest i kuvetten. Kurven "Lys tilbage" over
strålen viser lyset gennem kuvetten med en prik for hver hele centimeter
(100 % › 51 % › 26 %). Displayet under detektoren viser T og A, og tavlen
under scenen viser A = ε · l · c med tallene sat ind.

Seks forudsigelser. Eleven gætter først ved at klikke på et af tre svar over
scenen; så stilles kuvetten tilbage til start, og eleven prøver det selv med
skyderne eller ved at trække i grebet på kuvettens højre side. Svaret
kommer, når skyderen slippes på målet (ikke mens den passerer det). Et
forkert gæt bliver gult ("Prøvet") med det, detektoren viste, og
forklaringen; et rigtigt gæt bliver grønt.

| Forudsigelse | Spørgsmålet | Svaret |
|--------------|-------------|--------|
| Vand i kuvetten | hvor meget lys med rent vand? | 100 %, blindprøven |
| Dobbelt koncentration: A | A = 0,490, c fordobles | 0,980 |
| Dobbelt koncentration: lyset | 32 %, c fordobles | 10 % (32 % af 32 %), ikke 16 % |
| Én centimeter mere | ca. 51 % gennem 1 cm, hvad gennem 2 cm? | 26 %, ikke 0 % |
| Halv koncentration, dobbelt vej | A = 0,980 | det samme |
| Absorbansen 1 | hvor meget lys ved A = 1? | 10 % |

Stofferne i panelet (permanganat, FeSCN²⁺ og [Fe(phen)₃]²⁺) er til frit spil;
forudsigelserne bruger permanganat.

**Påskeægget:** når en forudsigelse er slut, giver et klik på detektoren den
solbriller på. Alle målinger bliver 0,30 for høje, også for vand, og linjen
siger, at det er derfor, man nulstiller med en blindprøve.

## Fane 2: Standardkurven

Til venstre et spektrofotometer og en bakke med vand, fem standarder og
prøven. Et klik på en kuvette sætter den i spektrofotometret, og målingen
bliver et punkt på grafen til højre (med ca. 0,6 % støj). Eleven

1. måler vandet og standarderne,
2. trækker i den gule prik, så linjen gennem (0, 0) passer med punkterne
   (godtages inden for 3 % af den bedste linje gennem (0, 0)),
3. måler prøven, og en stiplet linje viser dens absorbans,
4. trækker den lodrette linje med trekanten hen, hvor prøvens absorbans
   rammer linjen (inden for 2 % af aksen).

Rækkefølgen er ikke låst, men linjen godtages først, når alle standarderne
er målt. Prøvens koncentration er ny, hver gang opgaven begynder forfra.
Tabellen i panelet fyldes undervejs.

| Opgave | Stof | Standarder |
|--------|------|------------|
| Permanganat i en prøve | MnO₄⁻, 525 nm | 0,10 til 0,50 mM |
| Jern(III) farvet rødt | FeSCN²⁺, 447 nm | 0,040 til 0,200 mM |
| Jern i en tablet | [Fe(phen)₃]²⁺, 510 nm | 0,010 til 0,050 mM |
| Et punkt, der ikke passer | MnO₄⁻, 525 nm | som opgave 1, men 0,30 mM har et fingeraftryk |

I opgave 4 giver fingeraftrykket 0,12 for meget, og punktet ligger over
linjen. Linjen godtages ikke, før kuvetten er tørret af med papiret (klik på
papiret og så på kuvetten, eller træk papiret derhen) og målt igen. Den
gamle måling står som et blegt kryds.

## Fane 3: Beregningen

Fra 21. nov. 2026 (se Regelsættet nedenfor) har hver del to trin: formlen
vælges med tre knapper på kortet (den rigtige og to typiske fejl, hver med
sin egen forklaring, `valg` i `D.TRIN`), og tallet skrives i et felt på
kortet med enheden efter feltet. Tavlen sætter tallene ind i formlen, så
snart formlen er fundet. Til venstre står måleopstillingen med opgavens tal
på etiketterne, til højre tavlen som et lyst papir. (Før: formens form,
bogstaverne og tallene i en bakke under en grøn tavle, tre skridt pr. del.)

| Opgave | Gruppe | Trin | Facit |
|--------|--------|------|-------|
| Find absorbansen | Let | A = ε · l · c | 0,735 |
| Find koncentrationen | Let | c = A / (ε · l) | 0,130 mM |
| Find ε af en standard | Let | ε = A / (l · c) | 11,1 mM⁻¹·cm⁻¹ |
| En kort kuvette | Middel | c, l = 0,500 cm | 0,120 mM |
| Find ε af hældningen | Middel | ε = a / l, l = 2,00 cm | 2,45 mM⁻¹·cm⁻¹ |
| En lang kuvette | Middel | c, l = 2,00 cm | 0,0450 mM |
| Fra hældning til prøve | Svær | ε = a / l, så c | 4,70 mM⁻¹·cm⁻¹ og 0,0800 mM |
| Massen af permanganat | Svær | c, n = c · V, m = n · M | 0,220 mM, 0,0550 mmol, 6,54 mg |

Formelknapperne har hver sin forklaring (`valg` i `D.TRIN`): ganget i stedet
for divideret, brøken vendt, l mangler. Beskederne til tallet (`js/regning.js`):
ganget i stedet for divideret, brøken vendt, kun divideret med ε, A / ε · l
uden parentes, m = n / M og afrunding undervejs. Enheden står efter feltet;
skriver eleven selv en enhed, læses den (c i M med omregning godtages).

Hint til formlen: hvad man kender › formlens begyndelse (c = A / …) › hele
formlen. Hint til tallet: tasterne (med parentesen) › enheden › resultatets
første cifre.

## Tallene og forenklingerne

* ε er tabelværdier: permanganat ca. 2,4·10³ M⁻¹·cm⁻¹ ved 525 nm (her 2,45,
  som i b9.5), FeSCN²⁺ 4,70·10³ M⁻¹·cm⁻¹ ved 447 nm og [Fe(phen)₃]²⁺
  1,11·10⁴ M⁻¹·cm⁻¹ ved 510 nm. Animationen regner i mM og mM⁻¹·cm⁻¹, så
  tallene er pæne uden potens. 1 mM⁻¹·cm⁻¹ = 1000 M⁻¹·cm⁻¹ står i teorien.
* Lyset har én bølgelængde, og opløsningen følger Lambert-Beers lov ved
  alle koncentrationer. Afvigelser ved høj absorbans (det lineære område)
  ejer b9.5. Over A = 3 viser displayet "> 3".
* Kuvettens farve er kun pynt: hver farvekanal svækkes efter stoffets tal og
  koncentrationen set gennem 1 cm (`Tg.vaeskeFarve`).
* Fotonerne er en model: hver prik er mange fotoner, og andelen, der slipper
  igennem, er T.
* Hvert molekyle tegnes ikke for sig; prikkerne i kuvetten følger c og l.
* Massen regnes med mM · L = mmol og mmol · g/mol = mg.

## Filer

```
index.html         toplinje, de tre faner, teori og rundvisning
css/stil.css       udseende (grundlaget er sb2.1; nederst valgkortene,
                   skyderne, måletabellen og regnestykket på tavlen). NB:
                   decimaltal med PUNKTUM i CSS
js/kerne.js        NK-navnerum, tal med dansk komma (som sb2.1)
js/lb.js           modellen: A, T, I(x), dybden for en absorberet foton,
                   den bedste linje gennem (0, 0), støjen og det, eleven
                   skriver (tal, potens og enhed)
js/data.js         stofferne, forudsigelserne, standardkurverne og
                   regnestykkerne
js/tegning.js      lampen, strålen, kuvetten, detektoren, displayet og tavlen
js/fane.js         det fælles: opgaverækken, papirkortet, Indsend svar og
                   hintknappen
js/regning.js      fane 3: facit, tjek af formel, tal og resultat, beskeder
                   og hint
js/sim_lys.js      fane 1
js/sim_kurve.js    fane 2
js/sim_regn.js     fane 3: kortet med formelknapperne og feltet, opstillingen
                   og papirtavlen
js/rundvisning.js  rundvisningen bag ?
js/app.js          faneskift, tastatur og løkken
_selvtest.html     udviklerværktøj, se nedenfor
```

En ny forudsigelse er ét objekt i `D.FORUD` (start, tre svar, mål, tre hint
og forklaringen). En ny standardkurve er ét objekt i `D.KURVE`. Et nyt
regnestykke er ét objekt i `D.REGN` med tallene som tekst og trinene fra
`D.TRIN`; facit regnes af tallene.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>Enter</kbd> Indsend svar eller Næste ·
<kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning · <kbd>T</kbd> teori ·
<kbd>Esc</kbd> luk. Direkte links: `#lys`, `#kurve`, `#regn` og `#teori`.

## Papirkortet (6. nov. 2026)

Alle tre faner har papirkortet øverst midt i scenen (`.scenekort` i en
`.kortzone` med fast højde, `body.papirkort`, `../faelles/papirkort.css` og
`papirkort.js`). Statuslinjen, opgavelinjen, valgkortene over lærredet og
Tjek-knapperne på tavlen er væk. `js/fane.js` er bygget efter sb9.1's.

- Lyset: gættet står på kortet (svar med den korte note). Under gættet er
  skyderne og kuvetten låst, og kortet blinker. Hinttrappen i gættet er
  bevaret. Bagefter skruer eleven og trykker Indsend svar; en skyder, der
  slippes ved målet, bedømmer ikke selv. Kortet bliver på forudsigelsen
  med det rigtige svar grønt og et forkert gæt rødt.
- Standardkurven: målingerne er klik i bakken (ingen Indsend). Linjen og
  den lodrette aflæsning bedømmes først ved Indsend svar. En linje, der
  passer, bliver på kortet med Næste.
- Beregningen: Indsend svar på kortet afløser Tjek på tavlen; Enter i et
  felt er Indsend svar. Formlen, tallene og hver del bliver på kortet med
  Næste. Spørgsmålet ("Beregn …") står på kortet, resten af opgaveteksten
  i panelet.
- Zonens højde: Lyset 270/252, Standardkurven 180/172, Beregningen
  168/166 px (almindelig/lav skærm). Selvtesten måler kortet med det
  længste hint, en lang fejl og forklaringen.

Molekylenavne: ingen at rette (ingen O₂, H₂, Cl₂ osv. i teksterne).

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen afvises på
file://). Den tjekker modellen (også at fotonerne absorberes efter I(x)),
at hver forudsigelse har ét rigtigt svar, som modellen giver, at alle seks
forudsigelser kan prøves med skyderne og ved at trække kuvetten, alle fire
standardkurver med klik og træk (også fingeraftrykket og papiret) og alle
otte regnestykker på tavlen, at Vis svaret fører gennem det hele, de
typiske fejl, hinttrappen, sproget og layoutet fra 1100 × 700 til
1600 × 950. Fra 6. nov. 2026 også papirkortet: kortet i scenen, Indsend
svar grå, at skydere og træk ikke bedømmer selv, låsen under gættet,
Næste, at kortet holder sig i zonen, og at alle opgaver kan løses med
hintknappen.
Sidst kørt: ALT OK (73 påstande), 6. november 2026. Se også Regelsættet
nedenfor: ALT OK (102 påstande), 21. november 2026.

## I menuen

I menuen fra 3. nov. 2026 som nr. 2 i `kemi-b-filer/samling_b9.html` (koden `b9.3`). Den gamle ligger i `kemi-c-filer/arkiv/b9.3_lambert_beer_simulation_oldversion.html`.

### Sådan kom den i menuen

Når brugeren siger til:

* `kemi-b-filer/samling_b9.html`, knap 3 `data-emne="b9.3"`, skal pege på
  `../superanimationer/sb5.2_lambert_beer/index.html`.
* Den gamle flyttes med `git mv` til
  `kemi-c-filer/arkiv/b9.3_lambert_beer_simulation_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt_b.html` tjekkes; knappen hedder stadig
  "Lambert-Beers Lov" og har nummer 3.
* Kolonnen "I menuen" i superanimationernes README rettes.

## Opgavelisten låser titlerne op i takt (21. nov. 2026)

Listerne på alle tre faner viser kun titlen på de løste opgaver og den, eleven er ved; de kommende står som et nummer med en grå streg og kan ikke klikkes, før de er nået (`aabenOpgave` i `js/fane.js`). Niveauerne Let, Middel og Svær på fane 3 står som før. Selvtesten: ALT OK (86 påstande).

## Regelsættet (21. nov. 2026, T4 i gennemgangen)

Gennemgået efter `../REGELSAET.md` (regel 1-31). Niels 21. nov. 2026: "øverste
række op til 8-10 opgaver, og derefter sidepanel", og om formelvælgeren på
Beregningen og teorien: "Jeg synes faktisk det er lidt voldsomt ... ret grimme
fede skrifttyper, som overvælder øjnene og skaber panik. Der kommer for meget på
en gang ... I forhold til teori-afsnit må der gerne stå mindre og med en mere
elegant skrifttype, og måske en henvisning, der fører læseren tilbage til
kemibogen." Planen fik hans ja ("dine planer er gode").

* **Intet panel** på de tre faner (6, 4 og 8 opgaver). Opgaverne står i en
  smal række øverst i scenen med nummer og tema (`tema` i `js/data.js`) og
  "↺ Start forfra" yderst til højre (`.opgaverad`, mønstret fra sc5.7). De
  kommende er låste, stiplede numre. På Beregningen står Let, Middel og Svær
  først og kan altid vælges; så står kun opgaverne på niveauet. Under 1200 px
  står kun numrene, og temaet står på kortets etiket. Koden er `bygListe`,
  `visListe`, `vaelgNiveau` og `aabenOpgave` i `js/fane.js`.
* **Kortets plads er fast** (regel 4): Lyset 258/244 px, Standardkurven
  180 px, Beregningen 256/244 px (almindelig/lav skærm). Selvtesten måler
  kortet i hvert skridt med det længste hint og en lang fejl (+10 px).
* **Lyset:** Betjeningen sidder på apparaterne: − og + ved kuvettens etiket
  ("Permanganat   0,20 mM") ændrer c i trin på `cKnap` (0,05 mM for
  permanganat), − og + ved l ændrer bredden 0,50 cm ad gangen (grebet på
  kuvetten virker stadig), Langsomt lys sidder under lampen, og stofferne står
  under detektoren, først når alle seks forudsigelser er prøvet. Forudsigelse 1
  er trinvis (`trin` i `D.FORUD[0]`): Trin 1 "Hvad sker der med noget af det
  grønne lys i kuvetten med permanganat?" giver kurven Lys tilbage, Trin 2 "Hvor
  meget af lyset når frem til detektoren gennem 0,20 mM permanganat?" giver T i
  displayet, og Trin 3 er gættet om vand. Bagefter kommer − og + frem med gul
  ramme og boblen "Klik: fortynd". A i displayet, tavlen og Langsomt lys kommer
  med forudsigelse 2, bredden med forudsigelse 4 (`fremme` i `js/sim_lys.js`).
  Det, der ikke er fremme, har en stiplet plads med navnet. Er forudsigelse 1
  løst før, er alt fremme fra start; Start forfra giver trinene igen.
  Klik-opfordringen (`opfordring`) står kun, når kortet beder om en handling, og
  kun ved den knap, der skal bruges; boblen står ved siden af knappen.
  Fotonerne er rolige: 40 % af den gamle fart, ingen glød om prikkerne og en
  svag ring, hvor en foton bliver absorberet. Tavlen er et lyst papir med
  Lexend. "Absorbansen 1" hedder nu "A = 1" med værktøjstippet "Hvor meget lys
  slipper igennem?".
* **Standardkurven:** Opgaven og trinet står på kortet ("Trin 2 af 4"), og
  aflæsningen spørger "Hvor stor er prøvens koncentration?". Tabellen Målingerne
  står på et lyst papir under bakken (`tegnTabel`).
* **Beregningen:** se Fane 3 ovenfor. Ingen "OPGAVENS TAL", "FORMENS FORM" eller
  "BOGSTAVERNE". Det, der spørges om, står som "?" med gul ramme på
  opstillingen og på tavlen og bliver grønt, når det er regnet. Niels' skærmbillede
  med ε i alle tre pladser kom af tre klik på ε (ét klik udfyldte ét felt);
  bakken er væk.
* **Skrift (regel 30):** Lexend på lærrederne (`Tg.SKRIFT`) med vægt 500-600,
  ingen versaler som overskrifter.
* **Teorien (regel 31):** kortere, på det lyse ark (`../faelles/teori.css`,
  klassen `teori-ark`) og med henvisningen "Læs mere i Kemibogen: B5.2
  Absorbans og Lambert-Beers lov".
* **Kortene er korte** (regel 5-6, koordinatorens gennemsyn samme dag): På
  Standardkurven står kun en kort indledning (`kort` i `D.KURVE`, fx "En
  opløsning af permanganat har en ukendt koncentration.") og trinets handling
  halvfedt på sin egen linje ("Træk i den gule prik, til linjen går gennem
  punkterne."); aflæsningen spørger "Hvor stor er prøvens koncentration?". Beskeden
  "Se på punkterne", der gentog fingeraftrykkets linje, er væk. På Lyset står
  gættet kun i linjen nederst ("Dit gæt"), og handlingen står halvfedt på sin
  egen linje under "Prøv det selv, og tryk så Indsend svar."
* Rundvisningen peger på rækken og knapperne i scenen.
* Tekstrettelserne står i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/ret/t4.json`
  (T4-1 til T4-10) og kan sættes tilbage med `ret.py tilbage`.

Selvtesten (`_selvtest.html`) er skrevet om for knapperne i scenen, trinene,
klik-opfordringen, formelknapperne, feltet, tavlen, rækken og teorien. Ingen
grænse er lempet (kortzonen måles stadig med 10 px luft); tjekket for
decimaltal springer kun afsnitsnumre som B5.2 over. Sidst kørt: ALT OK (102
påstande), 21. november 2026.

## Runde 2 (21. nov. 2026): samlet scene, pænere figurer, intet klikbart under spørgsmål

Niels så Lyset på en stor skærm (ca. 1950 px): "den er blevet.. grim.. Som om
vi ikke har fået gevinst ud af den ekstra plads. På min store skærm er
afstandene helt vildt store.. og lambert beers lov er opskrevet med semigrim
fed skrift nede i bunden.. Den er kommet i skammekroen. Figurene er ikke
særligt pæne... Man bliver udsat for en del spørgsmål .. det er ok... men jeg
synes ikke vi helt lever op til reglerne: 1) Hvis man kan slå spørgsmålet
sammen med beskrivelsen, så er det at foretrække 2) når der stilles spørgsmål
skal der ikke være objekter på skærmen der lægger op til at blive klikket på."
(Regel 5a, 19a og 32 i `../REGELSAET.md`.)

* **Samlet optikbænk (regel 32):** Lampe, stråle, kuvette og detektor har en
  største bredde på 1160 px og står i midten (`BAENK_MAKS` og `geo` i
  `js/sim_lys.js`); kurven Lys tilbage følger samme bredde lige over strålen.
  Alt står tæt under kortet, og på en stor skærm bliver kurven, kuvetten,
  lampen og detektoren større i stedet for længere fra hinanden. Kortets plads
  på Lyset er 238/226 px. Standardkurven (højst 1340 px, `ox` og `punkt` i
  `js/sim_kurve.js`) og Beregningen (`.regn-flade` højst 1340 px) står også
  samlet i midten.
* **Formlen ud af skammekroen:** Den brede, fede tavle nederst er væk.
  Regnestykket `A = ε · l · c` står på et lille lyst papir lige under
  detektorens display i Lexend 400-500 (`tegnFormel`), med ε i lilla og A i
  mørkegul, ingen fed skrift.
* **Figurer i "super figur"-stil** (`js/tegning.js`, bruges på alle tre faner):
  lampen er et lampehus med køleriller, linserør og en linse i lysets farve;
  kuvetten har glasvægge med tykkelse, tyk bund, kant foroven, matte sider,
  et svagt højlys og væske med menisk; detektoren har en frontplade med
  indgangsspalte og en rist; displayet er et LCD i en ramme. Blød skygge under
  apparaterne, rolige farver, ingen glimt.
* **Spørgsmål og beskrivelse slået sammen (5a):** Alle seks forudsigelser og
  trin 1-2 er ét spørgsmål uden indledning, fx "Hvad bliver A, når
  koncentrationen fordobles fra 0,20 mM til 0,40 mM?" (`ret/t4.json` T4-11 til
  T4-17). "Gæt først" står i kortets etiket på linje med spørgsmålet
  ("Forudsigelse 3 af 6 · Gæt først"), ikke som en linje for sig.
* **Intet klikbart under et spørgsmål (19a):** Under trin, gæt og Næste er
  scenen uden − og +, greb, Langsomt lys og stofvalg; etiketten "Permanganat
  0,20 mM" er ren tekst. Ved "Prøv det" kommer kun det frem, forudsigelsen skal
  bruge (`styrVis`): c-knapperne ved forudsigelse 1-3, bredden og grebet ved
  4, begge ved 5 og 6, Langsomt lys og (når alle seks er prøvet) stofferne i en
  række under lampen. På Standardkurven står den gule prik kun, når linjen skal
  lægges.
* Selvtesten: ny påstand for regel 19a (alle trin og gæt uden knapper, og kun
  det nødvendige ved Prøv det), layoutet testes også i 1920 × 1080 med
  bænken højst 1200 px og i midten, regnestykket ved displayet og
  Standardkurven samlet. Sidst kørt: ALT OK (103 påstande), 21. november 2026.

## Runde 3 (21. nov. 2026): pladsen på en stor skærm

Koordinatorens gennemsyn af runde 2 i 1920 × 1080 (regel 5a, 13 og 32):

* **Lyset:** Kurven og kuvetten vokser, til bænken fylder den lodrette plads
  (kurven op til 300 px, kuvetten op til 2,2 gange sin bredde ved 1 cm); kun det,
  der er tilbage, fordeles over og under. Ingen afstand er blevet større.
  Glasset over væsken i kuvetten er lyst (ikke en mørk kant).
* **Standardkurven:** Venstre spalte (spektrofotometret, bakken og Målingerne)
  fylder samme højde som grafen: den ekstra højde gør apparatet og kuvetterne
  større.
* **Beregningen:** Opstillingen er højst 620 px bred og står i midten af sin
  spalte, med lampe, kuvette og detektor i samme stil og størrelse som på
  Lyset. Tavlen har fra start en stiplet plads med navnet "Udregningen" og er
  mindst lige så høj som opstillingen, så de to står i balance side om side, og
  intet hopper, når linjerne kommer. Kortet er nu kun det halvfede spørgsmål og
  handlingen ("Vælg formlen for absorbansen."); tallene står på etiketterne i
  scenen. Kun Svær 2 (Massen) har en kort indledning ("En prøve på 250 mL
  indeholder permanganat.", `ind` i `D.REGN`). Kortets plads er 232/220 px.
  `ret/t4.json` T4-18.

Selvtesten: ALT OK (103 påstande), 21. november 2026.

## Runde 4 (21. nov. 2026): loven øverst, Prøv det går selv videre, ordet før symbolet

Niels: "I forhold til lambert beers lov er den blevet bedre. markant. Men jeg
synes nu stadig at figurene er lidt fjollet. Måske skal jeg lave sprites et
andet sted? Jeg synes stadig at Lambert beers lov er gemt væk. Skrifttypen er
bedre. Men kan den ikke komme op lige under kortet.. Så er det lidt nemmere, at
se den vigtighed. Når man har sat koncentrationen til 0,40 mM, så skal den bare
selv gå videre efter 1 sekund.. for at spare et klik. Måske skal der ikke stå
"A" så tidligt.. måske er det bedre med Absorbansen (A) oppe i kortet."
(Regel 33, 34 og 37 i `../REGELSAET.md`.)

* **Loven lige under kortet (regel 37):** "Lambert-Beers lov" med
  `A = ε · l · c = … = 0,490` står centreret øverst i scenen over kurven på et
  lyst papir, lidt større end før og uden fed (`tegnFormel` og `formY` i
  `js/sim_lys.js`). I forudsigelse 1 står en stiplet plads med navnet dér.
  Papiret ved detektoren er væk. På Beregningen står regnestykket allerede
  øverst på tavlen lige under kortet.
* **Prøv det går selv videre (regel 33):** Står kuvetten på målet, går kortet
  selv til svaret 1 sekund efter (`videreT` i `opdater`); går eleven væk fra
  målet inden da, afbrydes det. Indsend svar er der stadig som reserve. Kortet
  siger nu "Prøv det selv." over handlingen.
* **Ordet før symbolet (regel 34):** Forudsigelse 2 spørger "Hvad bliver
  absorbansen (A), når …?" og hedder "Dobbelt c: absorbansen" i rækken. I₀ og I
  ved strålen er væk (de bruges ikke i forudsigelserne), lampen viser "525 nm"
  uden λ, og målet under kuvetten viser "1,00 cm" uden l, til loven er kommet.
  T kommer i displayet sammen med rosen "transmittansen T" i trin 2, A med
  forudsigelse 2.
* `ret/t4.json` T4-19 til T4-21. Selvtesten har nye påstande for regel 33 (går
  videre efter 1 s, ikke før, og afbrydes) og 34, og layouttesten tjekker, at
  loven står øverst i midten. Sidst kørt: ALT OK (105 påstande).

## Billeder af apparaterne (når de kommer)

Niels overvejer at lave billeder af apparaterne et andet sted. Bestillingen står
i `SPRITES_BESTILLING.md`. Når filerne ligger i `billeder/`, skal koden bruge dem
sådan (ikke bygget endnu):

* `js/tegning.js` henter billederne én gang (`new Image()`), og `Tg.lampe`,
  `Tg.detektor` og `Tg.kuvette` tegner billedet med `drawImage` i samme kasse
  (x, y, b, h), som de tegner i nu. Er et billede ikke hentet (eller mangler),
  tegnes den nuværende figur, så intet går i stykker.
* Lampen tegnes, så linsen (50 % af billedets højde) står ved strålen; koden
  lægger lysets farve over linsen med en blød cirkel. Detektoren tegnes, så
  spalten (50 %) står ved strålen.
* Kuvetten tegnes i tre dele: venstre væg, midten gentaget i den bredde, `l`
  giver, og højre væg. Væsken (farve, menisk, molekyler) tegnes af koden
  først, og glasset lægges ovenpå, så væsken ses gennem det gennemsigtige
  indre. Strålen går i 58 % af højden som nu.
* Displayrammen lægges under detektoren, og tallene skrives i feltet som nu.
  Spektrofotometret på Standardkurven erstatter den mørke kasse i `tegnSpekt`,
  og kuvetten sættes i brønden.
* Hver figur får sin egen påstand i selvtesten: billedet er hentet, eller
  reserven tegnes.

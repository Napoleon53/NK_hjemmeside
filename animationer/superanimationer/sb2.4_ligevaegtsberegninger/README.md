# sb2.4 Ligevægtsberegninger (fanerne Mod ligevægt, Ved ligevægt, Fra start til ligevægt)

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.

Den afløser `animationer/kemi-b-filer/b2.3_ligevaegtsberegninger.html`, men er
**ikke i menuen** endnu. Den gamle står urørt i menuen, til brugeren siger til.

## Bestillingen (2. oktober 2026)

Brugeren: "animation b.2.3 er overordnet en fin animation, men jeg kunne stadig
godt tænke mig det som en superanimation, hvor der også er en pædagogisk fane,
som bidrager med at give forståelsen, udover de eksisterende træningsfaner, som
primært træner personer der allerede har forståelsen. Opgaverne kan overordnet
godt genbruges, men måske skal det være muligt, at man selv skal sætte tallene
ind i ligning i stedet for en multiplechoice for at maksimere det pædagogiske
udbytte. Der er også lidt for meget fokus på at man skal løse
2.gradsligningen matematisk, mens vi i dansk kemipensum ofte blot anvender
CAS-værktøjer (men det er fint, at man skal argumentere for at den ene løsning
forkastes, og det er godt at man tvinges til at forholde sig til hvad x er for
en størrelse inden den indføres)."

Bestillingen herunder er skrevet af Claude ud fra det, som ved sb2.1.

1. **Pointen:** x er den koncentration, der omsættes; skemaet gør
   ligevægtsloven til én ligning med x som eneste ubekendte; CAS løser den, og
   kun den løsning, der giver positive koncentrationer, kan bruges.
2. **Afløser b2.3.** Med fra den gamle: de 13 opgaver med de samme tal og
   facit (niveau 1 er fane 2, niveau 2 og 3 er fane 3), trinene i samme
   rækkefølge (ligevægtsloven, x defineres før brug, skemaet, ligningen,
   løsningen, koncentrationerne), at begge løsninger skal frem, og at den ene
   skal forkastes med en begrundelse, kontrollen med K<sub>c</sub> til sidst,
   kurven fra start til ligevægt, at tal kan skrives med komma, punktum og
   potenser, og 2 % tolerance. Taget ud: alle multiple choice-spørgsmål (nu
   skriver eleven selv), løsningsformlen for andengradsligningen med
   diskriminanten (nu CAS), kvadratrodsmetoden, point og stribe,
   partikelbaggrunden, boksen Hjælp (afløst af `?`) og søjlediagrammet for
   niveau 1. Nyt: fane 1 Beholderen, CAS-vinduet, skemaet og ligningen med
   elevens egne udtryk, prøv en løsning i skemaet, tekstboksen med hinttrappen
   og hele besvarelsen i panelet, når en opgave er løst.
3. **Naboerne:** sb2.1 ejer at skrive reaktionsbrøken (her skrives
   ligevægtsloven blot i to felter, og fejlene får sb2.1's beskeder), b2.2 ejer
   indgreb og Le Chatelier, b2.5 ejer Y mod K over tid, når ligevægten
   forstyrres, og b2.6 rumfanget. Fane 1 bruger Y som funktion af x, ikke af
   tiden.
4. **Loftet:** tre faner. Fane 1 har 3 reaktioner, 8 mål og højst 30 molekyler
   (1 molekyle = 0,010 eller 0,020 M). Fane 2 har 5 opgaver, fane 3 har 8.
5. **Layoutet:** scene plus panel som sb2.1. Papirkortet står øverst i
   scenen på alle tre faner (se "Papirkortet" nedenfor). Fane 1: beholderen og
   grafen på ét lærred, skyderen under, skemaet og Y nederst; panelet har
   reaktionen med K, listen og forfra. Fane 2 og 3: tavlen med delene; panelet
   har listen, forfra og bagefter hele besvarelsen med kurven.

Kemichael er ikke med. Hjælpen står på papirkortet: næste skridt, fejl og
hint (hinttrappen er som i `sc1.4_afstemning`).

## Papirkortet (6. nov. 2026)

Alle tre faner har ét lyst papirkort øverst i midten af scenen
(`body.papirkort`, `../faelles/papirkort.css` og `.js`). Kortet har
etiketten ("Mål 3 af 8", "Opgave 2 af 5"), opgavens tekst og det, eleven skal
gøre, i fed. Nederst står beskeden (næste skridt, fejl, hint), Giv et hint
(stille knap med gul kant) og Indsend svar (gråt, til der er noget at sende).
Tjek-knapperne på tavlen er væk; Indsend svar eller Enter sender den del ind,
eleven er ved. Skyderen bedømmer aldrig selv: på fane 1 sender Indsend svar
x ind. Et klik på en løsning, et stof i skemaet, Kan bruges, Forkast eller en
negativ koncentration vælger kun (blå ring), og Indsend svar bedømmer.
Knappen Løs ligningen med CAS er et værktøj og virker med det samme. Efter et
rigtigt svar bliver kortet på opgaven med svaret under og Næste, hvor Indsend
svar stod; et klik i scenen får kortet til at blinke. Forfra står i panelet.
Pladsen til kortet er `--kz` i `css/stil.css`: 196 px på fane 2 og 3 og
158 px på fane 1. Selvtesten måler kortet med alle hint og svar i 1440 × 860
og 1100 × 700. Opgaveteksten stod før i panelet; nu står den kun på kortet.

## Rettelser 9. oktober 2026

Brugeren efter brug: "Måske skal der først oplyses stofmængder, når man har
opskrevet ligevægtsloven korrekt. Når man har beregnet de aktuelle
koncentration før ligevægt (skriv gerne før ligevægt), så skal beregningerne
stå på sine egne linjer. Igen som før så undgå at lave en tekstlinje med hint
helt nederst i animationen. Byg hellere tekstboksen ind, så den er naturligt
mere synlig".

* **Tallene kommer efter ligevægtsloven.** Rækken Oplyst på tavlen (fane 2 og
  3) er skjult, mens ligevægtsloven skrives, og kommer frem med et gult glimt,
  når den er rigtig. Pladsen er sat af, så intet flytter sig, og tekstboksen
  siger, at tallene nu står under reaktionsskemaet. Det gælder alle tre
  opgavetyper, ikke kun stofmængderne. Opgaveteksten i panelet har stadig
  tallene (det er opgaven, som den ville stå på papir).
* **Beregningerne på egne linjer.** Koncentrationerne står med én beregning pr.
  linje og lighedstegnene under hinanden, formlen c = n / V øverst (fane 2),
  både mens eleven regner, og når delen er løst, og også i besvarelsen i
  panelet. Fane 3's koncentrationer med x sat ind står på samme måde.
  Etiketten er **Koncentrationerne ved ligevægt**, ikke "før ligevægt":
  opgaverne oplyser stofmængderne ved ligevægt (ellers ville brøken give Y og
  ikke K<sub>c</sub>). Claudes valg; brugeren er gjort opmærksom på det.
* **Ingen tekstlinje nederst.** Statuslinjen i bunden af scenen er væk.
  Tekstboksen (næste skridt, fejl, hint, ros og den gule knap) står på fane 1 i
  en kasse øverst sammen med målet, og på fane 2 og 3 øverst i den del af
  tavlen, eleven er ved, lige over felterne. Når en opgave er løst, står
  svaret og knappen Næste opgave i en grøn boks nederst på tavlen. På fane 1
  står forklaringen til målet (`slut` i `D.MAAL`) i den grønne boks i stedet
  for i panelet, og linjen under målet siger kun det, målet ikke selv siger.
  Giv et hint er fyldt gul, Vis svaret et omrids. Forfra står ved
  opgavelinjen (fane 2 og 3) og ved skyderen (fane 1).
* **Fundet undervejs:** med en bredere skrift end Segoe UI (Linux) var skemaet
  med fire stoffer på fane 1 for bredt, så sidste kolonne blev skåret af. Nu
  står tallet under udtrykket, når skemaet ikke kan være der (`tilpasSkema`).
  På en lav skærm må beholderen blive lavere (140 px), når CAS' løsninger
  fylder forneden, og kan det stadig ikke være der, kan fane 1 rulles.

## Fane 1: Beholderen

Molekylerne i en lukket beholder og en skyder for x. Skemaet under viser
Start, Ændring og Ligevægt som tal, der følger skyderen, og Y er
reaktionsbrøken regnet med rækken Ligevægt. Til højre er Y som funktion af x
med K som en gul linje. Man kan også trække på grafen.

| Mål | Reaktion | Hvad eleven gør |
|-----|----------|-----------------|
| 1 Find ligevægten | SO₂Cl₂ ⇌ SO₂ + Cl₂ | trækker x, til Y = K (x ≈ 0,078 M) |
| 2 Skriv koncentrationerne med x | | skriver Ændring og Ligevægt med x; tallet efter = følger skyderen |
| 3 To løsninger | | CAS løser Y = K; grafen zoomer ud, og det grå område er der, hvor en koncentration er negativ; eleven klikker på x = −0,128 |
| 4 Koefficienten 2 | H₂ + Br₂ ⇌ 2HBr | trækker lidt og skriver ændringerne (−x, −x, +2x) |
| 5 Find ligevægten | | x = 0,160 M |
| 6 To positive løsninger | | forkaster x = 0,267 > 0,200 |
| 7 Hvor langt kan x komme? | CO + H₂O ⇌ CO₂ + H₂ (0,200 og 0,100 M) | trækker x helt op og klikker på H₂O, der er brugt op |
| 8 Grænsen for x | | forkaster x = 0,280 > 0,100 |

Molekylerne er tal: antallet, der er omsat, er x / (1 molekyle) rundet af.
Påskeægget: et klik på låget tager det af, og gassen slipper ud.

## Fane 2: Uden x

Den gamles niveau 1. Kc ud fra stofmængder (NOCl, NH₃, vandgas):
ligevægtsloven › c = n / V (formlen først, så tallene, én beregning pr. linje)
› tallene ind i ligevægtsloven › resultatet og enheden. Rumfanget og
stofmængderne står først på tavlen, når ligevægtsloven er rigtig. En ukendt koncentration (phosgen,
SO₃): ligevægtsloven › Kc og de kendte tal ind, et bogstav for den ukendte ›
CAS › afgør, hvilken løsning der kan bruges (SO₃ giver ±0,100) › svaret.

## Fane 3: Med x

Den gamles niveau 2 og 3 i Let, Middel og Svær, ordnet efter, hvor svær
forkastelsen er: én løsning (butan, 2-buten), en negativ løsning (SO₂Cl₂,
phosgen, iod) og to positive (vandgas, HBr, vandgas med forskellig start).

1. **Ligevægtsloven** i to felter. Koncentrationerne kan klikkes ind.
2. **Hvad er x?** En sætning med fire bokse: den koncentration /
   ligevægtskoncentrationen / den stofmængde / den brøkdel, stoffet, omsættes /
   dannes og enheden. De forkerte valg er de fejl, elever laver.
3. **Skemaet** række for række: Start (tal), Ændring og Ligevægt (udtryk med x).
4. **Ligningen:** Kc's værdi = ligevægtsloven med et felt pr. koncentration;
   eksponenten står uden for parentesen. Udtrykkene i skemaet kan klikkes ind.
5. **CAS:** ligningen uden enheder, én knap, alle løsninger med ti cifre.
6. **Løsningen:** eleven klikker på en løsning, og rækken Ligevægt viser den
   sat ind med > 0 eller < 0. Kan bruges eller Forkast; et Forkast kræver et
   klik på den koncentration, der bliver negativ. Det er begrundelsen, og den
   står bagefter som "x = −0,128 M forkastes, fordi [SO₂] = −0,128 M < 0."
7. **Koncentrationerne** med x sat ind, én pr. linje, og kontrollen med Kc.

Udtrykkene tjekkes ved at regne dem ud for seks værdier af x, så 2x, 2·x og
x + x er det samme, og "0,200 M − x" og "0,2-x" er det samme.

## Beskederne

Hver typisk fejl får sin besked, fx: et produkt fra start, +x for en reaktant,
kun ændringen i rækken Ligevægt, startkoncentrationen i ligningen i stedet for
udtrykket, eksponenten både inde i og uden for parentesen, 2·[NO] i stedet for
[NO]², tæller og nævner byttet, c = V / n, stofmængden i stedet for
koncentrationen, 1/Kc, en glemt eksponent, en glemt parentes om nævneren,
forkert enhed med regnestykket (2) − (1 + 3) = −2, et tal for den ukendte
koncentration, [Cl₂] i CAS, x i stedet for 0,200 − x, et tal regnet med den
forkastede løsning.

Hintet er en trappe på tre trin (hvad man ser på › hvad der står › svaret),
og knappen viser til sidst svaret. Et stof, hintet handler om, lyser gult.
Beskederne og hintet står i tekstboksen ved det, eleven arbejder med, aldrig
nederst i scenen.

## Forenklinger

* Talværdierne er konstrueret (som i den gamle), så regningen bliver
  overskuelig.
* x knyttes til et stof med koefficienten 1. Et stof med koefficienten 2 som
  x afvises med en forklaring, ikke fordi det er forkert, men for at undgå
  ½x i skemaet.
* CAS er en model: den viser ligningen uden enheder og alle reelle løsninger
  med ti betydende cifre, som WordMat, Maple og TI-Nspire gør. Den kender ikke
  definitionsmængder; afgrænsningen er elevens arbejde.
* Fane 1 regner Y med de præcise koncentrationer, mens molekylerne er rundet
  af til hele molekyler.

## Filer

```
index.html          toplinje, de tre faner, teorien og rundvisningen
css/stil.css        udseende (grundlaget er sb2.1; nyt: beholderen, skemaet,
                    tavlens dele, CAS og løsningerne). NB: decimaltal med
                    PUNKTUM i CSS
js/kerne.js         NK-navnerum (som sb2.1) plus NK.tal og NK.casTal
js/data.js          stofferne, de tre reaktioner og otte mål på fane 1, de
                    13 opgaver og den gamles facit til selvtesten
js/model.js         ligevægtsloven, Kc's enhed, parseren til elevens udtryk,
                    pladserne a + b·x, polynomierne og CAS, dommen over
                    ligevægtsloven (efter sb2.1) og hinttrappen til den
js/fane.js          det fælles: listen, papirkortet, knapperne og skemaet
js/regn.js          fane 2 og 3: delene, felterne, tjek, hint og svar
js/sim_beholder.js  fane 1: molekylerne, grafen, skyderen og målene
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og løkken
_selvtest.html      udviklerværktøj, se nedenfor
```

En ny opgave på fane 3 er ét objekt i `D.MX` (skemaet, Kc, startkoncentrationerne
og teksten); skemaet, ligningen, CAS og facit regnes af modellen. Fane 2 er
`D.UX` (med `n` og `V` eller `kendt` og `ukendt`).

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>Enter</kbd> indsend svar eller næste ·
<kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning · <kbd>T</kbd> teori ·
<kbd>Esc</kbd> luk. Direkte links: `#beholderen`, `#udenx`, `#medx` og `#teori`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server (iframen afvises på
file://). Den tjekker, at modellen giver den gamle b2.3's facit for alle 13
opgaver og begge løsninger, at udtrykkene læses rigtigt, at ligevægtsloven
får den rigtige besked for hver typisk fejl, at alle 13 opgaver kan regnes
igennem med én typisk fejl i hver del, at alle kan løses med Vis svaret
alene, at alle otte mål på fane 1 kan nås, at molekylerne passer med x,
sproget og layoutet i 1100 × 700, 1440 × 860 og 1600 × 950 (skriften på
tavlen er mindst 16 px; er der ikke plads, rulles den del frem, eleven er ved).
Fra 9. oktober 2026 også: at opgavens tal er skjult, til ligevægtsloven er
rigtig, og kommer på den plads, der var sat af; at tekstboksen står øverst i
den del, eleven er ved, og i en boks nederst på tavlen, når opgaven er løst;
at hver beregning af en koncentration står på sin egen linje med
lighedstegnene under hinanden; at der ingen statuslinje er; og at fane 1 kan
være i scenen med et hint og med forklaringen i tekstboksen.
Fra 6. nov. 2026 (papirkortet): at kortet står i scenen og ikke i panelet,
at forfra står i panelet, at der ingen Tjek-knapper og ingen tekstboks er, at
Indsend svar er gråt uden svar, at skyderen og et klik på en løsning, et stof
eller Kan bruges kun vælger, at kortet bliver på opgaven med Næste, hvor
Indsend svar stod, og at kortet holder sig i kortZone.
Sidst kørt: ALT OK (641 påstande), 6. nov. 2026 (Linux, headless Chrome).

Molekylenavne (6. nov. 2026): "Diiod spaltes til iodatomer" og
"Diiodmolekyler" (stoffet I₂). Resten brugte allerede dihydrogen, dinitrogen
og dichlor; grundstofnavne i stofnavne (hydrogenbromid) og iodatomer bliver.

## I menuen

I menuen fra 3. nov. 2026 som nr. 4 i `kemi-b-filer/samling_b2.html` (koden `b2.3`). Den gamle ligger i `kemi-c-filer/arkiv/b2.3_ligevaegtsberegninger_oldversion.html`.

### Sådan kom den i menuen

Når brugeren siger til:

* `kemi-b-filer/samling_b2.html`, knap 3 `data-emne="b2.3"`, skal pege på
  `../superanimationer/sb2.4_ligevaegtsberegninger/index.html`, og
  `data-beskrivelse` kan blive: "Træk x i en lukket beholder, og se, hvorfor
  den ene løsning forkastes. Regn derefter Kc og ligevægtskoncentrationer med
  ligevægtsloven, skemaet og CAS."
* Den gamle flyttes med `git mv` til
  `kemi-c-filer/arkiv/b2.3_ligevaegtsberegninger_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt_b.html` er uændret: knappen hedder stadig
  "Ligevægtsberegninger" og har nummer 3.
* Kolonnen "I menuen" i superanimationernes README rettes.

## Opgavelisten låser titlerne op (21. nov. 2026)

Brugerens regel 21. nov. 2026: Listen viser kun titlen på de løste opgaver og den, eleven er ved. De kommende står som et nummer med en grå streg og kan ikke klikkes, før alle opgaver før dem er løst (Vis svaret tæller som løst). På Med x vælges niveauerne (Let, Middel, Svær) frit. Hvert niveaus første opgave er åben, og inden for niveauet låses titlerne op i rækkefølge.
Koden er `aabenOpgave`, `bygListe` og `visListe` i `js/fane.js`. Selvtesten prøver det og gav ALT OK (653 påstande). Fra 21. nov. 2026 (T3) står listen i rækken øverst i scenen, og de kommende er stiplede numre (se nedenfor).

## Regelsættet (21. nov. 2026, T3): trinvis start, intet panel, rolig skrift og kort teori

Niels 21. nov. 2026 sagde ja til forslaget til T3 (`REGELSAET.md` i
superanimationerne). Problemet var, at fane 1 viste seks ting på én gang
(beholderen, grafen, skyderen, skemaet, boksen med Y og K og et langt kort),
så kortet selv måtte sige "Y og K står nederst til højre".

* **Trinvis start på mål 1** (regel 11-16, mønster `sc5.7`): Fra start er
  kun beholderen fremme. Grafen, skyderen, skemaet og Y-boksen har en stiplet
  plads med navnet (`data-navn`, klassen `.stiplet`; grafen tegnes som en
  stiplet ramme på lærredet), så intet hopper, når de kommer frem. Kortet
  siger "Trin 1 af 4" og stiller tre spørgsmål med tre svar hver
  (`D.MAAL[0].trin` i `js/data.js`). Hvert forkert svar er en fejl, elever
  faktisk laver (brøken vendt om, plus i tælleren, Y = K fra start, Y lig med
  [SO₂Cl₂]), og har sin egen forklaring.
  1. **Hvilken brøk er reaktionsbrøken Y for SO₂Cl₂ ⇌ SO₂ + Cl₂?** (svarene
     er brøker på knapperne) Svaret: Y-boksen kommer frem.
  2. **Hvor stor er Y, før noget SO₂Cl₂ er spaltet?** Svaret: Grafen kommer frem.
  3. **Hvad sker der med Y, når mere SO₂Cl₂ bliver spaltet?** Svaret:
     Skyderen kommer frem med en gul ramme og boblen "Træk: x".
  4. Målet som før: **Hvor stor er x, når reaktionsbrøken Y er lig med K?**

  Hvert trin har en hinttrappe på tre trin og så Vis svaret. Et klik på et
  svar vælger kun, Indsend svar bedømmer. Efter et rigtigt svar bliver kortet
  på spørgsmålet med svaret grønt, forklaringen og Næste spørgsmål. Scenen er
  låst, mens kortet stiller et spørgsmål (et greb i scenen får kortet til at
  blinke). Skemaet bliver stiplet til mål 2. Er mål 1 nået før (gemt i
  browseren), er der ingen trin, og alt er fremme. Start forfra på mål 1
  giver trinene igen. Koden: `trinNu`, `fremme`, `visDele`, `dommTrin`,
  `trinOk` og `naesteTrin` i `js/sim_beholder.js`; kortets svarknapper og
  `trinBliv` i `js/fane.js`.
* **Intet panel** (regel 3, højst 10 opgaver): Alle tre faner har en smal
  række øverst i scenen med nummer og tema og "↺ Start forfra" til højre
  (`.opgaverad`, som `sc5.7`). Kommende opgaver er stiplede numre uden tema.
  På Med x står Let, Middel og Svær foran deres opgaver. Er rækken for bred,
  har kun den valgte opgave sit tema (`.kompakt`); under 1200 px står kun
  numrene, og temaet står på kortets etiket. Målene har fået sigende temaer
  ("SO₂Cl₂: x ved ligevægt", "HBr: koefficienten 2", "Vandgas: grænsen for
  x" og ikke to gange "Find ligevægten"). Panelets kort Reaktionen er afløst
  af en **etiket på beholderen** med reaktionen, temperaturen og K med store
  sorte bogstaver på et lyst mærkat (regel 22). Besvarelsen i panelet på fane
  2 og 3 er væk (tavlen viser den), og kurven fra start til ligevægt står
  sidst på tavlen, med y-titlen vandret over aksen.
* **Klik-opfordringer** (regel 19-21): kun når kortet beder om en handling.
  Skyderen har "Træk: x" på mål med skyderen, til eleven har trukket.
  Knappen Løs ligningen med CAS har "Klik: løs med CAS", til den er brugt.
* **Spørgsmålet på egen linje** (regel 6): kortet sætter nu teksten med
  `NK.Papir.tekst`, også på fane 1. Beskeden "Y og K står nederst til højre"
  er væk.
* **Skriften** (regel 30, Niels: "Jeg synes faktisk det er lidt voldsomt"):
  Tavlerne, skemaet, rækken og lærredet bruger Lexend med vægt 400-600 i
  stedet for fed Segoe UI. Ingen versaler: "OPLYST", "KLIK FOR AT SKRIVE",
  "KONCENTRATIONERNE VED LIGEVÆGT" og "VED LIGEVÆGT ER Y = K" står i
  almindelig skrift ("Klik for at skrive:"). Selvtesten tjekker, at intet
  synligt i scenerne har versaler.
* **Teorien** (regel 31, Niels: "der må gerne stå mindre og med en mere
  elegant skrifttype, og måske en henvisning, der fører læseren tilbage til
  kemibogen"): et lyst ark (`../faelles/teori.css`, klassen `teori-ark`) med
  ligevægtsloven, skemaet med x og ét eksempel. Afsnittene om enheden,
  kontrollen og grænsen for x er taget ud; de står i bogen. Sidst står "Læs
  mere i Kemibogen: B2.5 Ligevægtsberegninger" med link til kemibogen.dk.
* Kortets plads (`--kz`): 214 px på fane 1 (246 px på en skærm over 720 px,
  fordi trinenes brøker og et hint på to linjer når 240 px) og 236 px på fane
  2 og 3. Selvtesten måler nu kortets nederste kant fra scenens top, ikke kun
  kortets højde, fordi kortet står under rækken.
* Rundvisningen peger på rækken og nævner etiketten.

Selvtesten: ALT OK (723 påstande, før 653), 21. nov. 2026. Nye påstande:
trinene (etiket, spørgsmål på egen linje, tre svar, Indsend svar gråt, låst
scene, forkert svar rødt med egen forklaring, hinttrappen, rigtigt svar
bliver, det rigtige kommer frem, intet hopper), trin 4 med boblen, at boblen
forsvinder, skemaet til mål 2, Start forfra giver trinene igen, gemt mål 1
viser alt, rækken over kortet og ikke for bred, intet panel, kurven på
tavlen, teorien med link og ingen versaler.

## Runde 2 (21. nov. 2026): fane 1 bygget om

Niels efter runde 1: "Selve animationen er lidt grim.. Det er forvirrende med
alle de farver.. Der er så lidt plads i beholderen, at man bare bliver
forvirret. Måske skal beholderen være større, og de forskellige molekyler skal
måske farvekodes på det er rart for øjnene. Selve reaktionsskemaet er gemt ...
ved siden af en bevægende figur ... Kan du i stedet for første linje så ikke
bare skrive reaktionsskemaet med stort ... den vil nok bare lidt for meget med
en 2. gradsligning.. fordi man skal pludselig sætte en masse rækker ind på en
gang ... Grafen har fået lov til at få den centrale plads..selvom vi ikke
rigtig bruger den i bogen. og skyderen sidder lidt akavet adskilt fra
grafen." Og: "Måske skal grafen kunne foldes ind, når vi skal videre til
beregningen. og ved beregningen skal der kun komme en række eller endda felt
ad gangen... Måske skal x lige defineres lidt tydeligere inden man bliver
kastet ud i det." (REGELSAET 5a, 19a, 32-37.)

* **Kortets første linje er reaktionsskemaet med stort** (1,5 gange kortets
  skrift) med "K = 0,0500 M ved 375 °C" i almindelig skrift efter det, på
  alle mål. Etiketten på beholderen er væk. Koden: `d.rx` i `kortHTML` i
  `js/fane.js`, `.sk-rx` i `css/stil.css`.
* **Beholderen er hovedfiguren**: halvdelen af scenen (mindst 45 %), høj, og
  scenen er samlet i midten og højst 1500 px bred. Hvert stof har sin egen
  dæmpede farve (`D.FARVE` i `js/data.js`: SO₂Cl₂ blå, SO₂ orange, Cl₂ grøn,
  H₂ lilla, Br₂ terrakotta, HBr gul, CO grå, H₂O turkis, CO₂ orange).
  Molekylerne er tegnet i én farve med en blød skygge; atomfarverne bruges
  ikke. Under beholderen står antallet af hvert stof i stoffets farve og
  "1 molekyle = 0,01 M". Skemaets kolonneoverskrifter har de samme farver.
  Molekylerne bevæger sig langsommere (regel 26).
* **Grafen**: På mål 1 står den ved siden af beholderen og er mindre end
  før. Skyderen ligger under beholder og graf som én række, og dens skala
  flugter med grafens x-akse (x = 0 og x = 0,20 står lige under grafens 0
  og 0,20). Fra mål 2 er grafen foldet ind ("Vis grafen ▸" kan folde den ud
  under tavlen), skyderen sidder direkte under beholderen, og tavlen står
  til højre.
* **x defineres konkret** (regel 35): mål 1 har fem trin. Efter brøken, Y fra
  start og "hvad sker der med Y" kommer "Træk x til 0,050 M." (gul ramme og
  boble på skyderen) og så "Hvor mange SO₂Cl₂-molekyler er spaltet, når
  x = 0,050 M?" (5 / 10 / 50; de dannede molekyler har en stille ring). Til
  sidst målet: find x ved ligevægt.
* **Skemaet felt for felt** (regel 36): mål 2 har syv trin, ét felt ad gangen
  (ændringen for SO₂Cl₂, SO₂ og Cl₂ og derefter ligevægtsrækken) og til sidst
  Y udtrykt med x. Feltet, der spørges om, har "?" og gul ramme på tavlen;
  de kommende felter er tomme og stiplede. Svarene står på kortet (tre
  knapper), aldrig på tavlen. HBr-målet gør det samme for rækken Ændring
  (−x, −x, +2x) efter "Træk x til 0,040 M" og "Hvor mange HBr-molekyler
  dannes?".
* **Ingen andengradsligning på fanen**: "To løsninger"-målene er blevet til
  "CAS giver x = 0,0781 M og x = −0,128 M. Hvilken løsning kan bruges?"
  (og 0,0875 M / 0,280 M for CO + H₂O). Tavlen viser ligningen og CAS'
  løsninger. Bagefter trækker eleven x til ligevægten og ser, at Y = K.
* **Seks mål**: SO₂Cl₂: x ved ligevægt, SO₂Cl₂: skemaet med x, SO₂Cl₂:
  hvilken løsning?, HBr: koefficienten 2, CO + H₂O: hvor langt kan x komme?,
  CO + H₂O: hvilken løsning? HBr "Find ligevægten" og "To positive
  løsninger" er udgået. Gemte fremskridt med de gamle id'er springes over.
  "Hvor langt kan x komme?" spørger nu om stoffet på kortet i stedet for et
  klik i skemaet.
* **"Prøv det" går selv videre** (regel 33): når kortet beder eleven trække x
  til en værdi, går kortet videre 1 s efter, at x er nået. Handlinger har
  ingen Indsend svar.
* **Intet klikbart under spørgsmål** (regel 19a): mens kortet spørger, har
  skyderen ingen knap, og "Vis grafen" er usynlig (pladsen er der). Et greb
  i scenen får kortet til at blinke. Svarene står i skiftende rækkefølge.
* **Tavlen** er et lyst papir (regel 28-29), så høj som indholdet. Er der
  ikke plads, bliver skriften mindre (ned til 13 px), og det, kortet spørger
  om, rulles frem.
* Kortets plads (`--kz`) på fane 1: 230 px (262 px på en skærm over 720 px).

Koden: `js/sim_beholder.js` er skrevet om (trinene `trin`, `trinNu`,
`handlingFaerdig`, tavlen `bygTavle` og `feltTilstand`, layoutet `beregnLay`
og `tilpas`). Fane 2 og 3 er uændrede. Rundvisningen er rettet.

Selvtesten: ALT OK (920 påstande, før 723), 21. nov. 2026. Nye påstande:
seks mål, farverne, CAS' tal mod modellen, hvert trin (reaktionslinjen,
etiketten, tre svar, intet klikbart under spørgsmål, låst scene, felt med ?
og de næste stiplede, forkert svar med egen forklaring, handlinger går selv
videre efter 1 s), at beholderen ligger fast, grafen foldet ind og ud, gamle
gemte id'er, beholderen stor og scenen samlet i tre skærmstørrelser, og at
skyderen flugter med grafens x-akse.

## Runde 3 (21. nov. 2026): Y = ?, grøn lampe, enheder, K i ligningen, rolige overgange, fane 2 trinvis

Niels: "Ligevægtsberegneren er blevet meget pænere!" og: "Måske er beholderen
nu faktisk lidt for stor. Toppen af låget ser lidt skør ud (lidt for simpelt).
Men Y=0 skal først komme frem, når man har indtastet værdien. Det er hyggeligt
nok med at man skal trække den halvejs.. Men måske skal spørgsmålet være.. om
hvorvidt der er ligevægt.. og man skal svare nej.. fordi Y < K. Når man sætter
x så Y = K skal lampen bare blive grøn automatisk efter ca. ½-1 sekund. Ved
ÆNDRING skal der ikke stå 0,200 - x. Både fordi jeg savner enheden.. her skal
være en enhed herinde. og fordi andre bøger anser 0,200 M - x som det der skal
stå i ændringsspalten.. giv en anden svarmulighed.. såsom -2x (det vil mange
skrive!). ved ligevægt er Y = K .. og derfor skal sættes K ind i udtrykket og
ikke Y. Når man skal sætte ind, så kunne det være rart at man stadig har
adgang til ligevægtsloven. Desuden så synes jeg at reaktionsskemaet skal være
centreret og måske endnu større.. måske skal det ligge udenfor kortet - altså
over ... overgangen til opgave 4 er lidt kluntet.. både for Træk x sidder fast
på skyderen, men også fordi der ikke sker noget når jeg slipper den, der hvor
jeg tror den skal være. Opgaven kommer lidt ud af det blå ... i fane 2 bliver
man bombarderet med informationer.. og det er svært at læse hvad det er man
skal når man pludselig bliver bedt om at bestemme alle koncentrationer ved
ligevægt.. Der står bare 'c'.. så hvad er det for en koncentration?"
(REGELSAET 38-43.)

**Fane 1**

* **Beholderen** er lidt mindre (38-46 % af scenens bredde, før 42-52 %) og
  har et rigtigt **låg**: en metalplade med lidt dybde, en mørk pakning mod
  glasset, to klemmer med skruer ned over glaskanten og et greb i midten
  (`tegnLaag` i `js/sim_beholder.js`). Låget sidder på beholderen.
* **Reaktionsskemaet** står uden for kortet, centreret over det (31 px, Lexend
  500) med "K = 0,0500 M ved 375 °C" i mindre skrift efter (`#bh-rx`,
  `.rx-over`). Kortet begynder med etiketten og spørgsmålet.
* **Svaret står ikke i scenen før svaret** (regel 38): Y-boksen viser
  "Y = [SO₂]·[Cl₂]/[SO₂Cl₂] = ?" uden mærket Y < K, til trin 2 (Y fra start)
  er besvaret. Grafen kommer først frem efter trin 3 ("Hvad sker der med Y"),
  fordi kurven ellers viser svaret. Mens kortet spørger, om der er ligevægt,
  er mærket Y < K skjult (Y og K står der, så eleven kan sammenligne).
* **Trin 4 i mål 1** er nu "Træk x til 0,050 M." og så "Er der ligevægt i
  beholderen, når x = 0,050 M?" (Nej, Y er mindre end K / Ja, Y er lig med K /
  Nej, Y er større end K). Antal-molekyler-spørgsmålet er væk; tælleren og en
  stille ring om de dannede molekyler viser stadig, hvad x er.
* **Lampen bliver grøn af sig selv** (regel 39): Når x står stille på
  ligevægten i 0,7 s, bliver mærket grønt "Y = K", og målet er løst (Indsend
  svar er reserve). Det samme ved alle "Træk x til …"-handlinger: står x på
  målet i 0,7 s, går kortet videre, og x sættes på den hele værdi. Uret
  begynder forfra ved hver bevægelse. Boblen "Træk: x" forsvinder ved første
  træk. "Træk x til 0,050 M" godtager 0,048-0,052 M og HBr's 0,040 M
  0,035-0,045 M (et halvt molekyle), og ligevægten godtages, når Y er inden
  for 4 % af K, eller x er så tæt på, som skyderen kan komme.
* **Enheder** (regel 40): skemaet skriver "0,200 M", "0 M", "0,200 M − x",
  "x", og tallene, der følger skyderen, har M. Ændring-trinene har ingen
  svarmulighed med startkoncentrationen; fejlsvaret er fx −2x.
* **K i ligningen** (regel 41): mål 2's sidste trin er "Ved ligevægt er Y lig
  med K. Hvilken ligning gælder ved ligevægt?" med "0,0500 M = x · x /
  (0,200 M − x)" og to fejl. Ligevægtsloven med symboler står på tavlen i mål
  2, 3, 4 og 6.
* **Rolige overgange** (regel 42): Skifter reaktionen (mål 4 og 5), toner det
  nye reaktionsskema frem, og beholderen fyldes roligt ét molekyle ad gangen.
  Første trin er et spørgsmål om den nye reaktion: "Hvor mange HBr-molekyler
  dannes, når ét H₂-molekyle reagerer med ét Br₂-molekyle?" (2 / 1 / 4) og
  "Hvilket stof bliver brugt op først, når der fra start er 0,200 M CO og
  0,100 M H₂O?" (H₂O / CO / CO₂). Derefter handlingen. I mål 3 og 6 trækker
  eleven bagefter x, til Y = K.

**Fane 2 (Uden x)** er bygget om som trin med svar på kortet (`js/sim_ux.js`,
regel 5a, 36, 43). Reaktionsskemaet står over kortet, kortet stiller ét
spørgsmål ad gangen, og tavlen (lyst papir) har opgavens tal øverst ("Lukket
beholder på 2,00 L ved 462 °C. Ved ligevægt er der …. Opgaven er at finde K
med enhed.") og én linje pr. trin; linjen, der spørges om, har "?" og gul
ramme. Opgaverne med K: ligevægtsloven (tre brøker), koncentrationen af hvert
stof for sig ("Hvad er koncentrationen af NOCl ved ligevægt, [NOCl]?" med
feltet "[NOCl] = __ M" på kortet; tavlen viser "[NOCl] = n(NOCl) / V =
0,600 mol / 2,00 L = ?"), regnestykket med tallene sat ind (tre), K's tal
(felt) og K's enhed (tre). Opgaverne med en ukendt koncentration:
ligevægtsloven, ligningen med K og de kendte tal sat ind (tre) og den ukendte
koncentration (felt, CAS). Der står ingen steder "c" alene. Trinene laves af
opgavens data, så tallene passer med modellen. Fane 3 bruger stadig
`js/regn.js` og er ikke ændret (den havde ingen "c" alene).

Selvtesten: ALT OK (1083 påstande, før 920), 21. nov. 2026. Nye påstande:
reaktionsskemaet over kortet og centreret, Y = ? og skjult mærke før svaret,
grafen skjult under trin 3, mærket skjult under ligevægtsspørgsmålet,
enheder i skemaet og svarene, K-ligningen med ligevægtsloven på tavlen, lampen
grøn af sig selv efter 0,7 s (ikke efter 0,4 s), handlinger videre efter 0,7 s
og x sat på målet, den rolige overgang i mål 4 og 5, beholderen 38-46 %, og
fane 2 trin for trin (ét felt på kortet, intet på tavlen, én linje med ?,
intet "c" alene, forkerte tal giver fejl, Vis svaret).

## Runde 4 (21. nov. 2026): Vis grafen inden for scenen, hjælp til at ramme x, atomsymboler, nye fanenavne

Niels: "Man kan kun folde grafen ud, hvis man zoomer ud. Jeg synes også det er
lidt svært at ramme x med skyderen.. måske skal den blinke lidt hjælpende, hvis
man ikke rammer efter 10 sekunder eller sådan noget. Nu hvor beholderen er så
stor, så kunne man måske overveje om der var plads til at skrive
atomsymbolerne på molekylerne (som måske skal være lidt større). Desuden er
spørgsmålet om fanerne ikke skal have mere sigende navne."

* **"Vis grafen ▸"** står nu i højre side ud for skyderen (før nederst under
  tavlen) og er altid inden for scenen. Den er kun skjult, mens kortet stiller
  et åbent spørgsmål (regel 19a); efter et rigtigt svar, under handlinger og
  når målet er løst, kan den klikkes. Grafen foldes ud under tavlen og ind
  igen. Selvtesten tjekker det i 1100 × 760, 1400 × 860 og 1920 × 1080 (synlig,
  inden for scenen og øverst, så et klik rammer den).
* **Lettere at ramme x:** Skyderen går 0,001 M ad gangen, og den får fokus,
  når kortet beder eleven trække, så piletasterne virker. Har eleven trukket
  i 10 s uden at nå målet, kommer en lille gul streg på skyderens spor, dér
  hvor målet er (0,050 M, 0,040 M, helt op eller ligevægtens x). Den pulserer
  roligt tre gange og bliver stående svagt (regel 26). Hintet "Den gule streg
  på skyderen viser …" viser den med det samme (`visMaerke`, `efterHint`).
* **Atomsymboler:** Molekylerne er ca. 1,3 gange større (R mindst 14 px), og
  hvert atom har sit symbol (S, O, Cl, H, Br, C) inde i kuglen i 13,5-16 px,
  Lexend 500, mørk skrift. Hvert stof har stadig sin farve; atomerne har en
  lille nuance pr. grundstof (H lysest, Br og C mørkest). Molekylerne drejer
  ikke, så symbolerne står oprejst, og de skubbes blidt fra hinanden, når de
  mødes, og vælger pladser uden overlap fra start.
* **Fanerne hedder** "Mod ligevægt" (fane 1: x trækkes mod ligevægten), "Ved
  ligevægt" (fane 2: stofmængderne ved ligevægt er kendt) og "Fra start til
  ligevægt" (fane 3: fra startkoncentrationer med x og CAS). Adresserne
  `#mod-ligevaegt`, `#ved-ligevaegt` og `#fra-start` virker, og de gamle
  (`#beholderen`, `#udenx`, `#medx`) virker stadig. Kemibogens link (B2.5)
  peger på `index.html` uden adresse og virker uændret.

Selvtesten: ALT OK (1110 påstande, før 1083), 21. nov. 2026. Nye påstande:
hjælpestregen (ikke efter 5 s, efter 10 s på ligevægtens plads, pulserer tre
gange, væk når målet er nået, vises af hintet), fokus og trin på 0,001 M,
molekylernes størrelse og ingen drejning, få overlap, Vis grafen i tre
skærmstørrelser, fanenavnene og de nye og gamle adresser.

## Runde 5 (21. nov. 2026): skemaet som reaktionsskema, tal kun ved ligevægt, ingen rullebjælke, ét skift af reaktion

Niels: "I forhold til sælskemaerne.. så må der gerne være en pil i øverste
række.. og i nederste række.. så synes jeg ikke at den skal være udfyldt når
der ikke er ligevægt.. Det virker lidt underligt. Og desuden så må
skriftstørrelsen gerne være mindre i nederste række, så der ikke kommer en
scrollbar. Derudover så er det lidt forvirrende når der skifter
reaktionsblanding. Hjernen har lidt svært ved at omstille sig.. og jeg
overvejer om opgave 5-6 måske bør udelades eller slåes sammen med opgave 4."
(REGELSAET 48-51.)

* **Skemaets øverste række er reaktionsskemaet** (regel 48): + og ⇌ står i
  smalle kolonner mellem stofferne, og koefficienten står foran pillen
  ("H₂ + Br₂ ⇌ 2 HBr"). Kolonnerne er tomme i rækkerne under, så felterne står
  under hvert sit stof. Fane 3's skema har fået det samme (`skemaTabel` i
  `js/regn.js`).
* **Rækken Ligevægt får kun tal ved ligevægt** (regel 49): før står kun
  udtrykket ("0,200 M − x", "x"). Tallene ("= 0,122 M") kommer på deres egen
  linje i mindre skrift, når lampen er grøn, eller opgaven er løst med x på
  ligevægten. Pladsen er der hele tiden (usynlig), så tavlen ikke hopper.
* **Ingen rullebjælke** (regel 50), tjekket i 1100 × 760, 1400 × 860 og
  1920 × 1080 for alle mål på fane 1 og alle opgaver på fane 2 og 3, trin for
  trin og løst:
  * Fane 1 og 2: tavlens linjer har navnet til venstre og regnestykket til
    højre, tættere afstande, en lavere Y-boks, og skriften går ned til 14 px
    (navne og tal mindst ca. 12 px). Ligevægtsloven står kun, hvor der sættes
    ind (mål 2 og 4).
  * Fane 3: kurven fra start til ligevægt står ikke længere på tavlen; knappen
    "Vis kurven fra start til ligevægt ▸" i opgaverækken åbner den i et lille
    vindue. Er der ikke plads ved 16 px, bliver tavlen "tæt": mindre
    afstande, reaktionen og opgavens tal på én linje, og loven og definitionen
    af x samt ligningen og CAS to og to ved siden af hinanden. Skriften er
    stadig mindst 16 px.
* **Ét skift af reaktion** (regel 51): CO + H₂O er taget ud af fane 1. Fane 1
  har fem mål: SO₂Cl₂ (x ved ligevægt, skemaet med x, hvilken løsning), HBr
  (koefficienten 2) og et nyt **"HBr: hvilken løsning?"** (`b-loesning`):
  1. "Hvor stor kan x højst blive, når der fra start er 0,200 M H₂ og 0,200 M
     Br₂?" (0,200 M / 0,400 M / 0,100 M). Linjen "x kan højst blive" står på
     tavlen i det trin.
  2. "CAS giver x = 0,160 M og x = 0,267 M. Hvilken løsning kan bruges, når x
     højst kan blive 0,200 M?" Tavlen viser ligningen 64,0 = (2x)² / ((0,200 M
     − x) · (0,200 M − x)) og CAS' løsninger fra dette trin.
  3. "Træk x, til Y er lig med K." Lampen bliver grøn af sig selv, og først
     dér får rækken Ligevægt sine tal.
  Det nye mål hedder `b-loesning` og ikke `b-cas`, fordi gemte fremskridt med
  `b-cas` var runde 1's "To positive løsninger"; de og `c-graense` og `c-cas`
  springes over. Gruppen c er væk fra `D.GRUPPER_BH` og reaktionen c fra
  `D.RX`.
* Menuteksten i `kemi-b-filer/samling_b2.html` ("Træk x i en lukket beholder,
  og se, hvorfor den ene løsning forkastes. Regn derefter …") passer stadig
  (mål 3 og 5) og er ikke ændret.

Selvtesten: ALT OK (1105 påstande; før 1110, fordi der er ét mål færre at gå
igennem). Nye påstande: fem mål og ét skift af reaktion, CAS' tal for HBr mod
modellen (0,160 og 0,267), skemaets hoved med + og ⇌ og lige mange celler i
alle rækker, ingen tal i rækken Ligevægt før ligevægt og tallene bagefter,
ingen rullebjælke i tavlerne på alle tre faner i tre skærmstørrelser, knappen
Vis kurven på fane 3, og gemte c-graense og c-cas springes over.

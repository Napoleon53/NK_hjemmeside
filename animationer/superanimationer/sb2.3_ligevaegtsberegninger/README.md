# sb2.3 Ligevægtsberegninger

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
5. **Layoutet:** scene plus panel som sb2.1. Fane 1: målet og tekstboksen i en
   kasse øverst, beholderen og grafen på ét lærred, skyderen under, skemaet og
   Y nederst. Fane 2 og 3: opgavens handling over tavlen, tavlen med delene
   (tekstboksen står i den del, eleven er ved), panelet med opgaven, listen og
   bagefter hele besvarelsen.

Kemichael er ikke med. Hjælpen står i tekstboksen: næste skridt, fejl, hint og
ros, og den gule hintknap i samme boks (hinttrappen er som i
`sc1.4_afstemning`).

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
js/fane.js          det fælles: listen, tekstboksen, knappen og skemaet
js/regn.js          fane 2 og 3: delene, felterne, tjek, hint og svar;
                    flytter tekstboksen med den del, eleven er ved
js/sim_beholder.js  fane 1: molekylerne, grafen, skyderen og målene
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og løkken
_selvtest.html      udviklerværktøj, se nedenfor
```

En ny opgave på fane 3 er ét objekt i `D.MX` (skemaet, Kc, startkoncentrationerne
og teksten); skemaet, ligningen, CAS og facit regnes af modellen. Fane 2 er
`D.UX` (med `n` og `V` eller `kendt` og `ukendt`).

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>Enter</kbd> tjek ·
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
Sidst kørt: ALT OK (599 påstande), 9. oktober 2026 (Linux, headless Chrome).

## Til menuen

Når brugeren siger til:

* `kemi-b-filer/samling_b2.html`, knap 3 `data-emne="b2.3"`, skal pege på
  `../superanimationer/sb2.3_ligevaegtsberegninger/index.html`, og
  `data-beskrivelse` kan blive: "Træk x i en lukket beholder, og se, hvorfor
  den ene løsning forkastes. Regn derefter Kc og ligevægtskoncentrationer med
  ligevægtsloven, skemaet og CAS."
* Den gamle flyttes med `git mv` til
  `kemi-c-filer/arkiv/b2.3_ligevaegtsberegninger_oldversion.html`.
* `FEEDBACK_EMNER` i `samling_alt_b.html` er uændret: knappen hedder stadig
  "Ligevægtsberegninger" og har nummer 3.
* Kolonnen "I menuen" i superanimationernes README rettes.

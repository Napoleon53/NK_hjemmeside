# sc5.1 Koncentration

Superanimation om stofmængdekoncentration: c = n / V. Mere stof giver en
højere koncentration, mere vand en lavere, og ved fortynding er
stofmængden den samme; kun rumfanget skifter. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv.
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** koncentrationen er stofmængde pr. liter, c = n / V. Mere
   stof giver højere c, mere vand lavere, og tapper man ud, er c den samme.
   Ved fortynding er n den samme før og efter.
2. **Afløser** `kemi-c-filer/c5.1_animation_stofmængdekoncentration.html` og
   `kemi-c-filer/c5.2_opgaver_stofmængdekoncentration1.html` (brugerens valg
   25. sept. 2026: emne 5 bliver to superanimationer, sc5.1 og sc5.2). Med
   fra c5.1: karret med kobber(II)sulfat, knapperne til stof og vand, tallene
   n, V og c og brøken c = n / V med tallene, der følger karret. Med fra
   c5.2: opgavetyperne (find c, n, V, fra masse til koncentration, hvor
   meget der skal afvejes, fortynding), stofferne (NaCl, KCl, CuSO₄, KMnO₄,
   Na₂CO₃), molarmassen, omregningen fra mL til L, mikroskopet med ionerne
   (nu luppen) og nye tal. Ud: mættet opløsning som pointe (ejes af
   `sc2.1_salt_i_vand`; her ligger det overskydende stof bare på bunden),
   inddampningen (i stedet kan man tappe ud) og quizzen med svarmuligheder.
3. **Naboerne:** `sc4.1` ejer molarmassen, `sc4.2` m = n · M, `sc2.1`
   opløselighed og mættet opløsning. `sc5.2_formel_og_aktuel` (afløser
   c5.3 og c5.4) ejer ionerne i et salt og blandinger; her bruges kun
   CuSO₄ med forholdet 1 : 1 i lupperne.
   `c5.5` (Mohrtitreringen, nu `sc5.3_mohrtitrering`) røres ikke.
4. **Loftet:** 4 faner og 5 stoffer. Fane 1: 5 opgaver, ét kar, én krukke,
   to haner, højst 24 Cu²⁺ i luppen. Fane 2: 8 opgaver, højst 3 bægerglas på
   1 L og højst 40 prikker i et glas. Fane 3: 6 opgaver med 3 eller 4 sæt tal
   hver. Fane 4: 5 opgaver, 3 pipetter og 3 målekolber.
5. **Layoutet:** scene plus panel som `sc4.5`.

Ingen knapper til præsentationen (brugerens valg 25. sept. 2026).

9. okt. 2026 (brugerens valg): Kemichael ved katederet er taget helt ud
(han hører til i laboratoriet). Scenen har fået hans bånd, og hintknappen
er gul, så eleven altid kan finde hjælpen selv.

Brugerens tilbagemelding 29. sept. 2026 og valgene bagefter:

* Mere træning i forskellen på c og n, især enhederne M og mol, gerne som
  kreative quizzer med animationer og gerne i sin egen fane. Brugeren valgte
  "glas og lupper" frem for et sorteringsbånd og en enhedsdetektiv: fane 2,
  c eller n?
* Det skal være tydeligere, at der skal skrives en formel. Brugeren valgte
  "bogstaver i brøkfelter": eleven vælger formens skabelon og skriver så
  bogstaverne i felter.
* Mellemregningen skrives i felter med enheder, ikke kun resultatet (som
  sc4.3).
* Fortynding skrives med V_før og V_efter (sænket før og efter), ikke V₁ og V₂.

Brugerens tilbagemelding 3. okt. 2026 (fane 2):

* Forklaringen til et rigtigt svar kom samtidig med det næste spørgsmål og
  sluttede med "Vælg et svar i kortet." Nu bliver spørgsmålet og
  forklaringen stående, og knappen i kortet bliver til Næste spørgsmål.
* 0,50 M betyder "0,50 mol pr. liter vand" (brugerens ordlyd).
* Hælder man først og tænker bagefter, var tallene væk. Nu står tallene fra
  før under de nye i tabellen, og etiketten bliver på et tomt glas.

En elevs tilbagemelding 6. okt. 2026 (fane 1) og brugerens ja 9. okt. 2026:

* Eleven ønskede pile, der viser, hvor man skal gøre noget, fx når der skal
  vand i. Den lille pil fra før er afløst af gule skilte med, hvad et klik
  gør, og de bliver stående, til karret viser målet.
* Gættet i opgave 2 og 3 står på et gult kort midt i scenen som i `sc7.5`
  (brugerens regel: eleverne klikker, før de læser).

Brugerens tilbagemelding 9. okt. 2026 (senere samme dag, fane 1 og 2):

* Spørgsmålet stod ude i siden, der foregik for meget på skærmen, og
  eleverne kigger ikke af sig selv ud i siden. Nu står hele opgaven på ét
  kort øverst i scenen som i `sc7.5`: det, der skal gøres, spørgsmålet med
  svarene side om side, hint og fejl, forklaringen til det rigtige svar og
  knappen videre. Panelets opgavekort er væk på fane 1 og 2; panelet har kun
  tallene og opgavelisten. Teksten på væggen på fane 2 er væk (den er
  kortets første linje). Fane 3 og 4 er ikke rørt: dér står opgaven ved de
  felter, eleven skriver i.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Karret | trækker skefulde kobber(II)sulfat ned i karret, hælder vand i og tapper ud | c = n / V; mere vand giver det halve, udtapning ændrer intet |
| 2 | c eller n? | svarer på korte spørgsmål om bægerglas, hælder over, hælder sammen og hælder vand i | n er alt stoffet (prikkerne), c er stof pr. liter (luppen); mol og M er ikke det samme |
| 3 | Målekolben | regner i tre trin: formlen i felter, tallene med enheder og resultatet; vægten og kolben gør det, der er regnet | sådan laves en opløsning med en bestemt koncentration |
| 4 | Fortynding | gør en opløsning ti gange tyndere med pipette og målekolbe; regner fire fortyndinger | n er den samme, kun V skifter: c_før · V_før = c_efter · V_efter |

**Karret.** Et glaskar på 1 L med en tappehane forneden over en vask og en
vandhane over. En skefuld er 0,10 mol; den kan trækkes fra krukken ned i
karret, eller man kan klikke på krukken. Hanerne giver eller tapper 0,05 L
pr. tryk, og holder man musen nede, bliver de ved. Luppen viser altid lige
meget væske: én prik er 0,05 mol/L af hver ion, så antallet af Cu²⁺ i
luppen følger c. Panelet viser n, V og c = n / V med tallene. De fem
opgaver: gør den 0,40 M (mere stof), dobbelt så meget vand (gæt først),
tap halvdelen ud (gæt først), mere af den samme opløsning (både stof og
vand) og lav 0,60 L 0,50 M fra et tomt kar. I opgaverne med et gæt kan
hanerne først bruges, når eleven har gættet; forklaringen kommer, når karret
viser målet, og siger noget om netop det gæt. Hanen stopper selv, når karret
viser det rumfang, opgaven beder om. Er der kommet for meget i, siger linjen
Start forfra.

Opgaven står på kortet øverst i scenen (`#kar-skort`, `kortData` i
`js/sim_kar.js`, `visSceneKort` i `js/fane.js`, stilen nederst i
`css/stil.css`): mærket Opgave 1, opgavens sætning, og under en streg linjen
med første skridt og den gule knap. Efter en handling siger linjen, hvor
langt karret er fra målet. Når karret viser målet, bliver kortet grønt med
forklaringen og knappen Næste opgave, og den gule knap er væk. Hanen, karret
og luppen begynder under den plads, kortet har fået (`ZONE` i
`js/sim_kar.js`, `kortZone` i `js/fane.js`), så intet flytter sig, når
kortet skifter.

Gættet står samme sted som et stort gult kort: mærket Gæt først, opgavens
sætning, spørgsmålet med stor skrift og de tre svar som store knapper.
Spørgsmålet står kun dér. Imens er scenen dæmpet, hintknappen er kun et
omrids, og et klik i scenen får kortet til at blinke (`gaetBlink`). Når der
er gættet, står det, der skal gøres, på kortet med gættet under (Dit gæt:
koncentrationen bliver dobbelt så stor; `den` i `D.KAR` gør sætningen hel),
og gættet bliver grønt eller rødt, når karret har vist svaret.

Det, der skal bruges nu, har et gult skilt med, hvad et klik gør (Klik: en
skefuld, Hold nede: vand, Hold nede: tap ud; teksterne står i `D.SKILT`) og
en gul ring. Skiltene følger det, der mangler (`mangler` i `js/sim_kar.js`):
for lav koncentration giver skilt ved krukken, for høj ved vandhanen, og er
koncentrationen rigtig, men rumfanget for stort, ved den røde hane. I opgave
4 og 5 står der skilte ved både krukken og vandhanen fra start. Skiltene
bliver stående, til karret viser målet, og en skefuld, der er på vej ned,
tæller med, så skiltet ikke lokker til en for meget. Et klik på et skilt
tæller som et klik på tingen. Kan karret ikke reddes med stof, vand eller
hanen, er skiltene væk, og Start forfra lyser gult. Der er ingen skilte, mens
der gættes, og mens karret selv viser svaret.

**c eller n?** Otte opgaver med bægerglas på 1 L med kobber(II)sulfat. Hver
prik i et glas er 0,01 mol, så antallet af prikker er stofmængden. Over hvert
glas er en lup, der altid viser lige meget væske, så ionerne i den følger
koncentrationen. Under hvert glas står navnet og, når den er kendt,
stofmængden; panelet har en tabel med n, V og c for hvert glas, hvor det, der
skal findes, er et gult ?. Spørgsmålet står på kortet øverst i scenen
(`#glas-skort`, `kortData` i `js/sim_glas.js`): en indledning (det, der er i
glassene, eller det, der lige er hældt), spørgsmålet og svarene som knapper
side om side (blandet rækkefølge, uden bogstaver foran, for glassene hedder
A, B og C); handler de om et glas, kan man også klikke på glasset. Skal
eleven hælde først, står det på kortet, hvad der skal klikkes på. Et forkert
svar bliver rødt og forklaret i kortets nederste linje (mærket Ikke endnu),
og så prøver man igen (ingen stjerne). Et rigtigt svar får scenen til at
vise det: prikkerne tælles én ad gangen, tallet kommer i tabellen, etiketten
kommer på glasset, eller enhederne streges ud. Kortet bliver grønt med
svaret og forklaringen, og det næste spørgsmål kommer først, når eleven
trykker Næste spørgsmål på kortet (Enter gør det samme). Der står ingen
tekst på væggen og ingen linje nederst. Opgaverne:

1. Samme stofmængde: 0,20 mol i 0,40 L og i 0,80 L. Største n? (lige meget),
   største c? (A).
2. Etiketten: 0,30 mol i 0,60 L. Hvad står der på etiketten? (0,50 M, med
   0,50 mol og 0,30 M som lokkere), hvad betyder 0,50 M? (0,50 mol pr.
   liter vand)
3. Hæld halvdelen over: klik på glasset, så løftes det, hælder og kommer
   tilbage, og prikkerne falder ned i det andet glas. c og n i det nye glas.
4. To glas i ét: to glas med 0,50 M hældes i et tredje. c er den samme,
   n lægges sammen.
5. Tre glas: etiketterne viser c, rumfanget aflæses. Største c (C) er ikke
   største n (B); prikkerne kommer frem og tælles bagefter.
6. Vand i glasset: sprøjteflasken fylder op til 0,40 L. n er den samme, c
   halveres (0,25 mol er en lokker).
7. Enhederne: n = c · V, c = n / V og V = n / c med enheden som spørgsmål.
   Regnestykket står på kortet over spørgsmålet med et gult ? som enhed, og
   når svaret er rigtigt, streges enhederne ud under det (mol/L · L = mol).
8. To forskellige glas: 0,20 M · 0,40 L og 0,40 M · 0,10 L. Højest c, men
   ikke mest stof; B hældes i A, og c bliver 0,24 M (0,60 M og gennemsnittet
   0,30 M er lokkere).

Det, en handling ændrer, skjules, når handlingen begynder, så luppen og
bordkanten ikke viser svaret, mens der hældes. Det, tabellen viste lige før,
huskes (`huskFoer`): et tal, der er ændret eller skjult, får en lille linje
under sig ("før 0,10 mol"), et glas, der er hældt tomt, beholder sin
etiket, og et klik på det siger, hvad der var i det.

**Målekolben.** Seks opgaver: find c (n og V kendt), find n, find V (hvor
stor skal kolben være), fra masse til koncentration (molarmassen, n og c),
hvor meget der skal afvejes (KMnO₄) og fra koncentration til masse
(Na₂CO₃). Hvert trin er et regnestykke i tre linjer med lighedstegnene ud
for hinanden, og over det står de tre skridt (Formlen › Tallene ind ›
Resultatet), som i sc4.3:

    c(NaCl) = n / V                 formlen: vælg skabelonen (□/□ eller □ · □),
                                    skriv så et bogstav i hvert felt
            = 0,150 mol / 0,500 L   tallene med enheder i felter med brøkstreg
            = 0,300 M               resultatet med enhed

Skabelonen kan skiftes under felterne (Anden form). Molarmassen har kun
resultatet (med g/mol). Tavlen viser opgavens tal og regnestykket, efter
hvad der er skrevet, med rigtige brøkstreger. Scenen gør det, der er regnet: molarmassen kommer på krukken,
vægten vejer stoffet af, pulveret hældes i kolben, der fyldes op til
mærket, og kolben får en etiket. Skriver eleven en forkert masse, vejes den
af, og linjen siger, hvilken koncentration den ville give.

**Fortynding.** Flasken har 1,00 M kobber(II)sulfat. Første opgave gør
eleven selv: klik på en pipette (10, 25 eller 50 mL; den fyldes i flasken
og bliver stående), klik på en målekolbe (100, 250 eller 500 mL; pipetten
tømmes i den) og klik på sprøjteflasken (kolben fyldes op til mærket). Er
opløsningen ikke ti gange tyndere, siger linjen, hvor mange gange tyndere
den blev, og næste pipette tømmer kolberne. Flere portioner i samme kolbe
er tilladt. Resten regnes: koncentrationen efter (n = c₁ · V₁, c₂ = n / V₂),
hvor meget der skal pipetteres (n = c₂ · V₂, V₁ = n / c₁), hvor meget vand
der skal i et bægerglas (n, V_efter og V_vand = V_efter − V_før; den typiske
fejl er at svare V_efter) og fortyndingsformlen i ét trin
(c_efter = c_før · V_før / V_efter, skabelonen □ · □ over □). Før og efter
står med sænket skrift overalt (V_før), også på tavlen. To lupper viser
flasken (eller glasset før) og kolben (eller glasset nu).

**Formlen.** Skabelonen og bogstaverne bliver til et udtryk, der tjekkes ved
at regne det ud med faste prøvetal, hvor alle sammenhængene passer. Så er
c · V og V · c det samme. Før og efter kan skrives cfør, c før, c_før,
c(før) og c1. De typiske fejl (brøken vendt om, ganget i stedet for
divideret, V_før i stedet for V_efter, massen i stedet for stofmængden, det
bogstav, der skal findes, i formlen) har deres egen besked.

**Tallene og resultatet.** Hvert tal skrives med enhed. Et tal er rigtigt,
når det højst er 1 % fra facit (molarmassen 0,06 g/mol) og har en enhed af
den rigtige slags. Et rigtigt tal med den forkerte enhed får en besked om
enhederne, fx "Tallet er rigtigt, men koncentrationen måles i M (mol/L),
ikke i mol. Enhederne: mol / L = mol/L = M." Rumfang i en formel med M skal
sættes ind i liter; i fortyndingsformlen og ved vandet må de være i mL, bare
begge har samme enhed. Beskeden kender også fejlene brøken vendt om,
ganget i stedet for divideret, et glemt tal i formlen (Na₂CO₃), V_efter i
stedet for vandet, kommaet flyttet, lille m og "tæt på". Hintene giver
formlens begyndelse (c = n / …), det første tal og enhedsregningen.

**Hint og svar.** Den gule knap er hjælpen. På fane 1 og 2 sidder den på
kortet i scenen i samme række som linjen, på fane 3 og 4 i opgavekortet i
panelet: Giv hint skriver hintet i linjen ved knappen, og knappen bliver til
Vis svaret (kun et omrids, så den ikke frister), der skriver svaret og næste
skridt i samme linje. Efter et forkert svar lyser den gule knap stille op,
til linjen skifter igen. Der er ingen Kemichael og ingen knapper til
præsentationen.

Direkte links: `index.html#glas`, `index.html#kolbe` og `index.html#fortynd`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning ·
<kbd>R</kbd> start forfra eller nye tal · <kbd>Enter</kbd> tjek feltet eller
næste opgave · <kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de fire faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.5's, regnestykket sc4.3's). NB: decimaltal med PUNKTUM i CSS
sprites/            karret, vandhanen, målekolben, pipetten, bægerglasset og bægerglasset på 1 L (nye);
                    flasken (som sc7.2), sprøjteflasken (som sc7.4), krukken, vægten og vejebåden
                    (som sc4.5), spatlen og luppen (som sc2.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift (også V_før), hukommelse, lærred, tal (som sc4.5)
js/data.js          atommasserne, stofferne, de fire fanes opgaver og tal, regnetrinene og replikkerne
js/kemi.js          karret (c = n / V, udtapning, det, der ligger på bunden), facit og tal som tekst
js/tjek.js          formlen i felterne, tallene med enheder, resultatet, de typiske fejl, hintene
                    og de pæne beregninger (også med brøkstreger til tavlen)
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, karret, hanerne, vasken, krukken, skiltene, vægten, kolben,
                    pipetten, glassene (også hældende), prikkerne, flasken, spatlen og luppen med
                    ionerne, tekst med sænket før og efter, regnestykker med brøkstreger og
                    linjen med enhederne, der streges ud
js/fane.js          det, fanerne deler: opgavelisten, scenekortet på fane 1 og 2 (kortHTML, visSceneKort, kortZone),
                    den gule knap, linjen ved knappen (også hint og svar) og musen
js/regning.js       regnestykket i kortet (skabelon, bogstaver, tal med enheder, resultat) og tavlen på fane 3 og 4
js/sim_kar.js       fane 1 med kortet i scenen (kortData), gættet og skiltene
js/sim_glas.js      fane 2 med kortet i scenen (kortData, regnHTML)
js/sim_kolbe.js     fane 3
js/sim_fortynd.js   fane 4
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Atommasserne** står i `D.ATOMMASSE` i `js/data.js` i hundrededele; alle
molarmasser regnes af dem og formlen. **Stofferne** står i `D.STOFFER` med
navn, pulverets farve, opløsningens farve (null er farveløs) og ionerne i
luppen. **Opgaverne** står i `D.KAR`, `D.GLAS`, `D.KOLBE` og `D.FORTYND`. På
fane 1 er `start` n i mol og V i mL, `maal` det, karret skal vise, og `goer`
det, karret gør ved Vis svaret. `tekst` er opgaven på kortet og `linje`
første skridt; i en opgave med et gæt er `linje` kortets tekst, når der er
gættet. På fane 2 har hver opgave sine glas (V i mL
og n eller c), `kendt` (det, tabellen viser fra start), `etiket`, `prikker`
og spørgsmålene i `spm` med `svar` (det rigtige har `ok`), `hint`, `efter`,
`vis` (det, scenen viser bagefter), `foer` (en handling først: hæld, saml
eller vand) og `regn` (regnestykket i opgaven Enhederne); enhedslinjerne
står i `D.ENHEDSLINJE`. På fane 3 og 4 er `tal` de sæt tal, opgaven kan have
(det første bruges først; Nye tal trækker et andet), og V står altid i mL.
**Regnetrinene** (navn, venstreside, enhed, skabelon `op`, bogstaverne `led`,
reglen for rumfangets enhed og hintet til formlen) står i `D.TRIN`.
**Replikkerne** står i `D.INTRO`, `D.FAERDIG`, `D.ROS` og `D.ROS_OPGAVE`
(fane 1 og 2 bruger kun `D.FAERDIG`: kortet siger resten).

**Teksterne på kortet** (fane 1 og 2) skal kunne være på den plads, kortet
har fået: `ZONE` i `js/sim_kar.js` og `js/sim_glas.js` (højden i px på en
almindelig og på en lav skærm). Bliver en tekst længere, så kør selvtesten;
den måler kortet i alle opgavernes tilstande på fire skærme. Et tal og dets
enhed og et helt regnestykke deles ikke over to linjer (`fast` i
`js/fane.js`).

**Formlernes regler** (hvad trinnet finder, hvad man kender, de typiske
fejl) står i `F` i `js/tjek.js`, **talfejlene** i `kandidater`, og
**enhedsregningen** til beskederne i `ENHEDSREGNING`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at de fem
molarmasser passer med tabellen, at karret regner c = n / V rigtigt, at
facit og alle tal i mellemregningerne godkendes i alle opgaver med alle tal,
og at tallene giver resultatet, at beregningerne er pæne (også V_før i L og
mL), at formlerne i felterne og tallene med enheder genkendes med de typiske
fejl (mol i stedet for M, mL i stedet for L, to forskellige enheder,
brøken vendt om), at sproget holder reglerne (også ingen V₁ og V₂), at alle
fire faner kan gennemføres med musen og ved at skrive (også med forkerte
svar, hint, svar, en forkert masse og en forkert fortynding), at prikkerne i
glassene passer med stofmængden, også efter hældning, at svaret ikke vises,
mens der hældes, at hint og svar kun kommer fra den gule knap og står ved
den, at knappen lyser op efter en fejl, at opgaven på fane 1 og 2 står på
kortet i scenen og ikke i panelet (spørgsmålet, svarene side om side,
forklaringen og knappen videre), at gættet på fane 1 står på kortet og kun
dér, at et klik i scenen før gættet ikke gør noget ud over at få kortet til
at blinke, at skiltene følger det, der mangler, og kan klikkes, at linjen
ikke beder om Start forfra, mens der tappes ud, at layoutet holder fra
520 × 380 til 1500 × 900, uden at kortet dækker karret, hanen eller
lupperne, og at kortet aldrig er højere end sin plads på 1100 × 620,
1280 × 720, 1366 × 768 og 1500 × 900. Den kræver en
lokal server eller Chrome med `--allow-file-access-from-files` og lægger
elevens gemte fremskridt tilbage bagefter. Sidst kørt 9. oktober 2026:
ALT OK (172 påstande).

## Forenklinger

* Kobber(II)sulfat regnes som CuSO₄ (159,61 g/mol), og pulveret tegnes
  blåt. Vandfrit CuSO₄ er hvidt; det blå er pentahydratet.
* Opløseligheden af CuSO₄ er sat til 1,2 M (ca. 20 g pr. 100 g vand ved
  20 °C, regnet pr. liter opløsning). Over den ligger resten på bunden.
* Rumfanget af opløsningen er rumfanget af vandet. Stoffet fylder ikke.
* Luppen viser én prik for hver 0,05 mol/L af hver ion (højst 30), og
  mindst én, når der er noget. Den er et billede af tætheden, ikke et antal.
* På fane 2 er én prik i glasset 0,01 mol kobber(II)sulfat. Prikkerne er et
  tællemiddel for stofmængden; ionerne ses i luppen.
* Et glas, der hælder, har en vandret overflade, men rumfanget i det er kun
  et billede, mens det hælder.
* Atommasserne har to decimaler (som sc4.1), så M(KMnO₄) er 158,04 g/mol.
* Koncentrationer og stofmængder skrives med tre betydende cifre, masser
  og molarmasser med to decimaler. Et svar med flere cifre godkendes.
* Pipetten og målekolben er præcise. Der er ingen aflæsningsfejl.

## I menuen

I menuen fra 26. sept. 2026 som c5.1 i `kemi-c-filer/samling_c5.html`. De gamle
ligger i
`kemi-c-filer/arkiv/c5.1_animation_stofmængdekoncentration_oldversion.html` og
`kemi-c-filer/arkiv/c5.2_opgaver_stofmængdekoncentration1_oldversion.html`.

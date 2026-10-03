# sc5.1 Koncentration

Superanimation om stofmængdekoncentration: c = n / V. Mere stof giver en
højere koncentration, mere vand en lavere, og ved fortynding er
stofmængden den samme; kun rumfanget skifter. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`).
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
5. **Layoutet:** scene plus panel som `sc4.5`, med den rolige Kemichael ved
   katederet i et bånd nederst i scenen.

Brugerens valg (25. sept. 2026): den rolige Kemichael som i sc4.5. Han
blander sig ikke: han siger kun noget ved Giv hint og Vis svaret, tier, når
trinnet er løst, og kan sendes ud. Ingen knapper til præsentationen.

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

**c eller n?** Otte opgaver med bægerglas på 1 L med kobber(II)sulfat. Hver
prik i et glas er 0,01 mol, så antallet af prikker er stofmængden. Over hvert
glas er en lup, der altid viser lige meget væske, så ionerne i den følger
koncentrationen. Under hvert glas står navnet og, når den er kendt,
stofmængden; panelet har en tabel med n, V og c for hvert glas, hvor det, der
skal findes, er et gult ?. Spørgsmålene står i kortet med svarknapper
(blandet rækkefølge); handler de om et glas, kan man også klikke på glasset.
Et forkert svar bliver rødt og forklaret, og så prøver man igen (ingen
stjerne). Et rigtigt svar får scenen til at vise det: prikkerne tælles én ad
gangen, tallet kommer i tabellen, etiketten kommer på glasset, eller
enhederne streges ud. Forklaringen står i linjen, og spørgsmålet bliver
stående, til eleven trykker Næste spørgsmål (knappen i kortet; Enter gør
det samme). Opgaverne:

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
   Enhederne streges ud under regnestykket (mol/L · L = mol).
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

**Kemichael ved katederet.** Som i sc4.5: han sidder stille nederst til
venstre og siger kun noget ved Giv hint (til trinnet er løst) og Vis svaret
(til eleven skriver igen). Knappen Send Kemichael ud sender ham på
lærerværelset; så står hintene i opgavekortet. <kbd>K</kbd> får ham til at
sige, hvor man er.

Direkte links: `index.html#glas`, `index.html#kolbe` og `index.html#fortynd`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichael siger, hvor man er ·
<kbd>R</kbd> start forfra eller nye tal · <kbd>Enter</kbd> tjek feltet eller
næste opgave · <kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de fire faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.5's, regnestykket sc4.3's). NB: decimaltal med PUNKTUM i CSS
sprites/            karret, vandhanen, målekolben, pipetten, bægerglasset og bægerglasset på 1 L (nye);
                    flasken (som sc7.2), sprøjteflasken (som sc7.4), krukken, vægten, vejebåden og
                    katederet (som sc4.5), spatlen og luppen (som sc2.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift (også V_før), hukommelse, lærred, tal (som sc4.5)
js/data.js          atommasserne, stofferne, de fire fanes opgaver og tal, regnetrinene og replikkerne
js/kemi.js          karret (c = n / V, udtapning, det, der ligger på bunden), facit og tal som tekst
js/tjek.js          formlen i felterne, tallene med enheder, resultatet, de typiske fejl, hintene
                    og de pæne beregninger (også med brøkstreger til tavlen)
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, karret, hanerne, vasken, krukken, vægten, kolben,
                    pipetten, glassene (også hældende), prikkerne, flasken, spatlen og luppen med
                    ionerne, tekst med sænket før og efter, regnestykker med brøkstreger og
                    linjen med enhederne, der streges ud
js/laerer.js        Kemichael ved katederet (som sc4.5)
js/fane.js          det, fanerne deler: opgavelisten, knappen, linjen i kortet, Kemichael og musen
js/regning.js       regnestykket i kortet (skabelon, bogstaver, tal med enheder, resultat) og tavlen på fane 3 og 4
js/sim_kar.js       fane 1
js/sim_glas.js      fane 2
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
det, karret gør ved Vis svaret. På fane 2 har hver opgave sine glas (V i mL
og n eller c), `kendt` (det, tabellen viser fra start), `etiket`, `prikker`
og spørgsmålene i `spm` med `svar` (det rigtige har `ok`), `hint`, `efter`,
`vis` (det, scenen viser bagefter), `foer` (en handling først: hæld, saml
eller vand) og `regn` (regnestykket i opgaven Enhederne); enhedslinjerne
står i `D.ENHEDSLINJE`. På fane 3 og 4 er `tal` de sæt tal, opgaven kan have
(det første bruges først; Nye tal trækker et andet), og V står altid i mL.
**Regnetrinene** (navn, venstreside, enhed, skabelon `op`, bogstaverne `led`,
reglen for rumfangets enhed og hintet til formlen) står i `D.TRIN`.
**Replikkerne** står i `D.INTRO`, `D.FAERDIG`, `D.ROS`, `D.ROS_OPGAVE` og
`D.KAFFE`.

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
mens der hældes, at Kemichael kun taler ved hint og svar og kan sendes ud og
hentes, og at layoutet holder fra 520 × 380 til 1500 × 900. Den kræver en
lokal server eller Chrome med `--allow-file-access-from-files` og lægger
elevens gemte fremskridt tilbage bagefter. Sidst kørt 29. september 2026:
ALT OK (124 påstande).

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

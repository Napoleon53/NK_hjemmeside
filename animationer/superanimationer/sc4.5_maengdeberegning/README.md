# sc4.5 Mængdeberegning

Superanimation om mængdeberegningsskemaet: fra gram til gram går vejen
altid over mol, og kender man to masser, bestemmer det stof, der slipper op
først, hvor meget der dannes. Åbn `index.html`. Mappen henter kun filer inde
fra sig selv, bortset fra Kemichael (`../../v2/kemichael/kemichael.js`).
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** koefficienterne gælder stofmængder, ikke masser. Vejen fra
   gram til gram går derfor over mol (m → n → n → m), og ved to kendte
   masser bestemmer det stof, der slipper op først, resten.
2. **Afløser** `kemi-c-filer/c4.5_opgave_mængdeberegningsskema.html`. Med fra
   den gamle: skemaet med m, M og n under hver formel, de fem opgaver (kul,
   methan, Haber-Bosch, magnesium og saltsyre, propan) med nye tal hver gang
   og knappen Nye tal, afstemning først, felter der låses op ét ad gangen og
   en fri udgave (den gamle "øvet-tilstand"), valget af det begrænsende stof,
   massebevarelsen og mellemregningerne som pæne beregninger. Ud: konfettien.
   Mentorboksen er blevet til linjen i opgavekortet, og hintene giver
   Kemichael.
3. **Naboerne:** `c1.4` ejer afstemning, `sc4.1` molarmassen alene, `sc4.2`
   m = n · M og N, `c4.3` n = m / M alene og `sc4.4` forholdet i mol. Her
   bruges de sammen. `c4.10` ejer betydende cifre.
4. **Loftet:** 3 faner og 12 reaktioner. Fane 1: 4 opgaver, 2 vægte, højst
   4 poser pr. side. Fane 2: 5 opgaver, skålvægten i 2 af dem. Fane 3: 6
   opgaver, højst 6 poser af hvert stof.
5. **Layoutet:** scene plus panel som `sc4.1`, `sc4.2` og `sc4.4`. Tavlen med
   skemaet er stjernen; under den et bord, og nederst Kemichaels bånd.

Brugerens valg (25. sept. 2026): tre faner og den rolige Kemichael ved
katederet uden knapper til præsentationen. Efter første udgave samme dag:
han blander sig ikke, medmindre eleven trykker Giv hint, han tier, når
delopgaven er løst, og han kan sendes ud.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Vejen | udfylder tre felter: n af det kendte, n af det søgte og m af det søgte | pulver bliver til poser med 1 mol, poserne går gennem pilen i forholdet, og det nye stof vejes |
| 2 | Skemaet | afstemmer, regner molarmasserne og udfylder hele skemaet, trinvis eller frit | skemaet som i en rapport; massen er bevaret |
| 3 | Begrænsende mængde | regner to stofmængder, vælger hvem der slipper op først, og regner produktet | poserne reagerer i hele sæt, og resten ligger tilbage |

**Vejen.** Fire reaktioner med faste stoffer, så begge sider kan vejes: jern
og svovl, magnesium, aluminium og jern af jernoxid (forholdet 1 : 1, 2 : 2,
2 : 4 og 4 : 2). Det andet stof er i overskud og har en grå streg i skemaet.
Molarmasserne står i skemaet og på krukkerne. Når n af det kendte er rigtig,
bliver pulveret på vægten til poser med 1 mol. Når n af det søgte er rigtig,
går poserne ind i reaktionspilen, og det nye stofs poser kommer ud i
forholdet. Når massen er rigtig, kommer poserne på vægten til højre, og
displayet tæller op. Pilene på tavlen viser vejen: / M ned, forholdet på
tværs og · M op.

**Skemaet.** Kul (uden afstemning, O₂ regnes der ikke på), Haber-Bosch,
methan, propan og fotosyntesen (produktet er kendt, og CO₂ skal findes). Ved
methan og propan skal alle felter udfyldes, og en skålvægt står foran
tavlen: reaktanterne i venstre skål, produkterne i højre. Hver masse, der er
fundet, lægges i sin skål, og vægten står lige, når den sidste er fundet.
Summerne står på skiltene ved siden af og i beregningerne. Trinvis åbner ét
felt ad gangen (den gamles standard); Frit åbner dem alle (huskes i
browseren).

**Begrænsende mængde.** Jern og svovl, magnesium og saltsyre (den gamle
opgave 4), knaldgas, Haber-Bosch, methan i en lukket beholder og aluminium og
chlor. Masserne står på skilte på bordet. Når en stofmængde er rigtig, står
stoffet som poser. Så vælger eleven, hvem der slipper op først (knapperne i
opgavekortet eller et klik på poserne). Poserne reagerer i hele sæt; det,
der er til overs, får en orange ring, og det andet er "sluppet op".
Produktets poser kommer først ud af pilen, når eleven har regnet dets
stofmængde, så antallet af poser ikke afslører svaret. Et
forkert valg afvises ikke: reaktionen viser, hvad der slap op, og linjen i
opgavekortet forklarer ud fra fejlen (færrest mol, men koefficienterne er ikke brugt).
Begrundelsen står som pæn beregning: n(Mg)/1 og n(HCl)/2.

**Linjen i opgavekortet** siger, hvor man er, og næste skridt, fx "Fra gram
til gram går vejen over mol. Skriv stofmængden af Fe.", og bagefter fejlen
(rød), rosen (grøn) og hvad der skete. Et klik på en vægt eller en pose giver
et kort svar i samme linje, som forsvinder igen efter fire sekunder.

**Kemichael ved katederet.** Han sidder stille bag sit kateder nederst til
venstre med kaffen foran sig og blander sig ikke. Han siger kun noget, når
eleven trykker Giv hint (så står hintet i hans boble, til delopgaven er løst)
eller Vis svaret (så viser han beregningen, til eleven skriver igen). Boblen
står fast til højre for ham og kører ikke ind over scenen. Han blinker,
kigger op over brillerne, når han siger noget, og ser skeptisk ud ved svaret.
Figuren er den fælles fra `v2/kemichael` (`K.tegneserieFigur`), så han ser ud
som alle andre steder, men han går ikke ind og ud. Klik på ham giver et kort
svar fra de fælles prik-puljer, der forsvinder efter fire sekunder. Klik på
koppen: han drikker (armen henter koppen og løfter den til munden) og siger
noget om kaffen; første gang "Kold. Som altid." fra de fælles glimt.

**Send ham ud.** Knappen Send Kemichael ud nederst til højre i scenen: han
siger "Fint. Jeg er på lærerværelset." og forsvinder med kaffen, og på
katederet står en seddel. Hint og svar står så i opgavekortet i stedet.
Knappen (nu Hent Kemichael) eller et klik på sedlen henter ham igen. Valget
gælder alle tre faner og huskes i browseren.

Der er ingen knapper til præsentationen (Start præsentation / Nej tak).
Linjen i opgavekortet siger, hvor man er. <kbd>K</kbd> får Kemichael til at
sige det (og henter ham, hvis han er ude).

Direkte links: `index.html#skema` og `index.html#begr`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichael siger, hvor man er ·
<kbd>R</kbd> nye tal · <kbd>Enter</kbd> tjek feltet eller næste opgave ·
<kbd>Esc</kbd> luk.

### Det nye i forhold til den gamle animation

* **Vejen er en scene:** vægte, poser med 1 mol og reaktionspilen viser, hvad
  hvert tal i skemaet betyder.
* **Pilene i skemaet** viser, hvor hvert tal kommer fra.
* **Skålvægten** viser massebevarelsen i stedet for en sætning om den.
* **Det begrænsende stof** ses som poser, der reagerer i hele sæt, og et
  forkert valg har en konsekvens i stedet for "prøv igen".
* **Fejlbeskederne kender fejlene:** ganget i stedet for divideret, brøken
  vendt om, koefficienterne brugt på gram, koefficienten regnet med i
  molarmassen, tallet efter et grundstof glemt, massen skrevet af og kommaet.
* **Fotosyntesen** er ny: produktet er kendt, og en reaktant skal findes.
* **Magnesium og saltsyre** er flyttet til fane 3 sammen med fem andre.
* **Hjælpen er én knap:** Giv hint, så Vis svaret. En opgave, der er løst
  uden at se svaret, får en stjerne.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.4's). NB: decimaltal med PUNKTUM i CSS
sprites/            katederet (nyt), vægten, vejebåden og pulverglasset (som sc4.2),
                    skålvægten (som sc4.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.4)
js/data.js          atommasserne, stofferne, reaktionerne, opgaverne og replikkerne
js/tjek.js          tjek af molarmasser, stofmængder, masser og koefficienter; beskederne ved fejl
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, tavlen, krukken, vægten, pulveret, posen med 1 mol, pilene og skålvægten
js/skema.js         skemaet på tavlen: modellen for hver celle, felterne, pilene, hint og beregninger
js/laerer.js        Kemichael ved katederet, boblen og knappen, der sender ham ud
js/fane.js          det, fanerne deler: opgavelisten, knappen, tjekket, linjen i kortet og hintene
js/sim_vej.js       fane 1
js/sim_skema.js     fane 2
js/sim_begr.js      fane 3
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Atommasserne** står i `D.ATOMMASSE` i `js/data.js` i hundrededele; alle
molarmasser regnes af dem og formlen. **Stofferne** står i `D.STOFFER` med
navn, farve (pose og pulver) og tilstand. **Reaktionerne** står i `R`.
**Opgaverne** står i `D.VEJ`, `D.SKEMA` og `D.BEGR`: `n` er de stofmængder,
opgaven kan starte med (masserne skal gå op i hele hundrededele, og ved
skålvægten skal hver masse gøre det), `spoerg` er felterne i den rækkefølge,
de låses op. Fane 3 har `std`, tallene første gang, og "Nye tal" trækker
blandt dem, `muligeTal` i `sim_begr.js` giver (1 til 3 hele sæt, 0,5 til 2
mol til overs, højst `D.BEGR_MAKS` poser). **Hintet til afstemningen** står i
`D.AFSTEM_HINT`, **Kemichaels replikker** i `D.INTRO`, `D.FAERDIG`, `D.ROS`,
`D.ROS_OPGAVE` og `D.KAFFE`.

**Fejlbeskederne** står i `js/tjek.js`. Et tal godkendes, når det højst er
1 % fra facit (molarmassen 0,3 %).

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at skemaerne er
afstemt med de mindste hele tal, at de 22 molarmasser passer med tabellen,
at masserne går op i hele hundrededele, at massen er bevaret for alle tal,
at det begrænsende stof er det rigtige for alle tal og for 30 træk med nye
tal, at 18 typiske fejl giver den rigtige besked, at sproget holder
reglerne (også alle linjer, Kemichael siger undervejs), at alle tre faner
kan gennemføres ved at skrive i felterne (også frit og bagfra, med hint og
svar og med et forkert valg), at vægtene og skålvægten ender rigtigt, at
Kemichael kun taler ved hint og svar og tier igen, at han kan sendes ud og
hentes igen (også med sedlen), og at layoutet holder fra 520 × 380
til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files`. Den lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 25. september 2026: ALT OK (111 påstande).

## Forenklinger

* Atommasserne har to decimaler (som sc4.1), så M(CH₄) er 16,05 g/mol og
  ikke 16,04 som i den gamle. Til gengæld går massebevarelsen op på
  hundrededele.
* Masser og molarmasser skrives med to decimaler, stofmængder med tre
  betydende cifre. c4.10 ejer betydende cifre, så et svar med flere cifre
  godkendes.
* Posen med 1 mol er et billede af en portion, ikke en rigtig pose. En halv
  pose er 0,5 mol.
* I fane 1 er begge stoffer faste, så de kan vejes. Gasser og væsker står kun
  i skemaet og som poser.
* Hydrogenchlorid regnes som stoffet HCl, ikke som saltsyrens opløsning
  (som i den gamle).
* På skålvægten ligger masserne som poser med massen på; vægten tipper efter
  forskellen på de kendte masser (samme fysik som sc4.1).
* I fane 3 reagerer poserne i hele sæt på én gang. Der er ingen hastighed
  eller ligevægt.

## I menuen

I menuen fra 26. sept. 2026 som c4.5 i `kemi-c-filer/samling_c4.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c4.5_opgave_mængdeberegningsskema_oldversion.html`.

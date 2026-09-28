# sc4.3 Stofmængdeberegning

Superanimation om formlen n = m / M: stofmængden er massen delt med
molarmassen, og enhederne viser det, g / (g/mol) = mol. Den træner både at
huske formlen med navne og enheder og at regne med den. Åbn `index.html`.
Mappen henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js` og `../kemichael/superanimation.js`).
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** stofmængden er massen delt med molarmassen, n = m / M, og
   enhederne viser det: g / (g/mol) = mol.
2. **Afløser** `kemi-c-filer/c4.3_opgaver_masse_til_stofmængde.html`
   ("Stofmængdeberegning" i `samling_c4.html`). Brugeren skrev "5.3", men
   beskrev n = m / M, som er 4.3 (5.3 er aktuel og formel koncentration). Med
   fra den gamle: de seks opgaver (find n to gange, find m to gange, find M af
   et ukendt pulver og en mesteropgave), nye tal ved hver ny opgave, enhederne
   g, mol og g/mol og formeltrekanten (nu kun som hint). Ud: rullemenuen med
   enheder (eleven skriver selv enheden) og konfettien. Nyt: fanen Formlen,
   hvor formlen huskes, og Hurtigrunden (brugerens ønske 25. sept. 2026: ikke
   kun beregning, men også træning i at huske formlen og enhederne).
3. **Naboerne:** `sc4.1` ejer udregningen af M fra atommasserne (her står M
   på krukken), `sc4.2` ejer klumperne på 1 mol på vægten og N = n · N_A,
   `sc4.5` ejer skemaet og reaktionerne. Poserne med 1 mol er tegnet som i
   `sc4.5`, så eleven genkender dem.
4. **Loftet:** 3 faner. Formlen: 6 opgaver, højst 8 brikker. Vægten: 6
   opgaver med 4 sæt tal hver, 9 stoffer i alt. Hurtigrunden: 12 spørgsmål.
5. **Layoutet:** scene plus panel som `sc5.1`, med den rolige Kemichael ved
   katederet i et bånd nederst i scenen.

Brugerens valg (25. sept. 2026): de tre faner Formlen, Vægten og
Hurtigrunden; molarmassen står på krukkens etiket; formeltrekanten kommer
kun som det andet hint, når formlen skal vendes; den rolige Kemichael som i
sc4.5 (han taler kun ved Giv hint og Vis svaret og kan sendes ud).

Rettet efter brugerens test 27. sept. 2026: opgaveteksten på Formlen står
over tavlen (i kortet blev den overset), første opgave hedder Introduktion,
titlerne i listen siger, hvad opgaven går ud på, og listen fylder mindre.
Det bogstav, der skal findes, står fast på venstre side (en helt fri formel
var for uklar). Vægten tvinger mellemregningen igennem med rigtige
brøkstreger, og hintene er rettet mod opgaven og giver tit halvdelen af
svaret. Hurtigrunden siger "tidsstraf" uden tal.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Formlen | trækker brikker med n, m, M, navne, enheder og regnetegn op på en tavle; til sidst skrives det hele | n = m / M med navne og enheder, også vendt |
| 2 | Vægten | skriver formlen, mellemregningen i brøkfelter og resultatet med enhed; vægten og poserne med 1 mol gør det, der er regnet | n er antallet af portioner på M gram |
| 3 | Hurtigrunden | svarer på 12 korte spørgsmål på tid | formlen skal sidde uden at tænke over den |

**Formlen.** Over tavlen står opgavens tekst på én linje (to på en smal
skærm) med en gul streg foran. På tavlen er formlen (n = □ / □ eller
m = □ □ □) til venstre og et skema med n, m og M, deres navne og enheder til
højre. Brikkerne ligger i bunden af tavlen og trækkes op (eller: klik på en
brik og så på pladsen). Kortet har kun formålet i første og sidste opgave.
Stilladset forsvinder opgave for opgave:

1. Introduktion: blege bogstaver viser, hvor n, m og M skal hen. Kortet siger,
   at de seks opgaver skal hjælpe med at lære formlen udenad.
2. Navnene på n, m og M: n står fast til venstre, formlen uden blege
   bogstaver, navnene i skemaet og lokkebrikken antal partikler.
3. Enhederne for n, m og M: formlen og enhederne med lokkerne mol/g og g · mol.
   Når opgaven er løst, streges gram ud: g / (g/mol) = g · mol/g = mol.
4. Isolér massen m: m står fast, og højre side bygges med et regnetegn som
   brik (m = n · M og m = M · n er begge rigtige). Mol streges ud.
5. Isolér molarmassen M: M = m / n.
6. Skriv formlen selv: ingen brikker. Formlen og de tre enheder skrives i
   felter. Kortet siger, at rigtig udenadslære først kommer med mange timers
   træning.

En del (formlen, navnene, enhederne) tjekkes, når alle dens pladser er fyldt.
Formlen tjekkes som helhed og får en besked med enhederne: "Brøken er vendt
om. Enhederne giver (g/mol) / g = 1/mol, men stofmængden er i mol." Det, der
sidder rigtigt, låses; resten hopper tilbage. Mens en brik holdes, lyser de
pladser op, den kan komme på. I introduktionen viser en pil den første brik.

**Vægten.** De seks opgaver: find n af 116,88 g natriumchlorid, find n af
kridt (CaCO₃), find m af natron (NaHCO₃), find m af kobber(II)sulfat, find M
af et pulver uden etiket (KCl, NaOH, Na₂CO₃ eller KNO₃, etiketten kommer frem
til sidst) og Mesteren: hvor mange gram glukose er den samme stofmængde som
et antal gram natriumchlorid. Hvert trin er et regnestykke i kortet, der
vokser nedad med lighedstegnene ud for hinanden:

    n(NaCl) = m/M                     formlen, skrevet med bogstaver
            = 116,88 g/58,44 g/mol    mellemregningen: to felter i en brøk
            = 2,00 mol                resultatet med enhed

Formlen og brøkerne vises med rigtige brøkstreger, og mellemregningen har
et felt over og et under brøkstregen (eller to felter med et gangetegn ved
m = n · M, hvor tallene må byttes om). Hvert felt tjekkes for sig: tallet med
enhed, brøken vendt om, kommaet, hele brøken skrevet i ét felt, og i
Mesteren molarmassen af det forkerte stof. Tavlen i scenen viser opgavens tal
og det samme regnestykke, efterhånden som det skrives. Med en lang
venstreside i et smalt kort (m(C₆H₁₂O₆)) står venstresiden alene på første
linje, så de to felter kan stå ved siden af hinanden.

Hintene giver tit halvdelen: formlens begyndelse (n = m / …), det første tal i
mellemregningen (eller hvor det andet står), og i resultatet hvad der tastes
og hvilken enhed svaret får.
Modellen er posen med 1 mol: m ligger på vægten, én pose vejer M gram, og n
er antallet af poser. Når n er regnet, deles bunken i poser, og vægten
tæller ned. Når m er regnet, vejes m af og fylder de stiplede poser. Et
forkert tal får en konsekvens: forkerte poser i rødt og "Regn efter: 2,50 mol
· 100,09 g/mol = 250,23 g, men vægten viser 25,00 g", eller en forkert masse
på vægten og "Med 42,00 g får du 0,500 mol".

**Trekanten.** Når formlen skal vendes (m og M), er knappen i kortet Giv
hint, Vis trekanten og Vis svaret. Trekanten står ikke fremme ellers.

**Hurtigrunden.** 12 spørgsmål: 3 om formlen (n = ?, m = ?, M = ?), 2 om
enhederne, 1 om navnene, 2 om enheder, der går ud med hinanden, og 4 med
hovedregning (nemme tal). Eleven klikker eller taster 1 til 4. De forkerte
svar er de typiske fejl (vendt om, ganget, forkert enhed), og hver har sin
forklaring. Et forkert svar (og Vis svaret) giver 10 s tidsstraf, og
spørgsmålet kommer igen tre spørgsmål senere. Et hint koster 5 s. Teksten
siger kun "tidsstraf", ikke hvor meget (brugerens ønske 27. sept. 2026).
Den bedste tid huskes i browseren.

**Kemichael ved katederet.** Som i sc4.5 og sc5.1: han sidder stille nederst
til venstre og siger kun noget ved Giv hint (til trinnet er løst) og Vis
svaret. Knappen Send Kemichael ud sender ham på lærerværelset; så står
hintene i opgavekortet. <kbd>K</kbd> får ham til at sige, hvor man er.

**Påskeæg:** to hurtige klik på mol-brikken (opgave 3), eller "muldvarp" som
enhed i opgave 6, får en muldvarp op af bunken. På engelsk hedder begge en
mole.

Direkte links: `index.html#vaegt` og `index.html#hurtig`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner (i Hurtigrunden svarer
1 til 4, mens runden kører) · <kbd>T</kbd> teori · <kbd>H</kbd> rundvisning ·
<kbd>K</kbd> Kemichael siger, hvor man er · <kbd>R</kbd> runden forfra, nye
tal eller ny runde · <kbd>Enter</kbd> tjek feltet eller næste opgave ·
<kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (kopi af sc5.1 plus teoriens tabel). NB: decimaltal med PUNKTUM i CSS
sprites/            krukken, vægten, vejebåden og katederet (som sc4.5)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc5.1)
js/data.js          atommasserne, stofferne, opgaverne, regnetrinene med hint, spørgsmålene og replikkerne
js/tjek.js          enhederne (potenser af g, mol og L), formlerne, mellemregningens tal, tallene med enhed,
                    de typiske fejl og de pæne beregninger (også med brøkstreger)
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, tavlen, krukken, vægten, poserne, brikkerne, pladserne,
                    teksten over tavlen, regnestykker med brøkstreger, trekanten, linjen med enhederne og muldvarpen
js/laerer.js        Kemichael ved katederet (som sc4.5 og sc5.1)
js/fane.js          det, fanerne deler: opgavelisten, knappen med trekanten, linjen i kortet,
                    Kemichael og musen
js/regning.js       regnestykket i kortet (formel, mellemregning i brøkfelter, resultat) og tavlen på Vægten
js/sim_formel.js    fane 1
js/sim_vaegt.js     fane 2
js/sim_hurtig.js    fane 3
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Atommasserne** står i `D.ATOMMASSE` i `js/data.js` i hundrededele; alle
molarmasser regnes af dem og formlen. **Stofferne** står i `D.STOFFER`.
**Opgaverne** på Formlen står i `D.FORMEL`: `ramme` (brøk, linje eller
skriv), `aabne` (de dele, eleven udfylder), `brikker` (bunken, højst otte), `tekst` (linjen over tavlen), `om` (kortet),
`skygge`, `hint`, `trekant` og `efter` (linjen med enhederne). Beskederne til
forkerte navne og enheder står i `SimFormel.navnFejl` og `enhedFejl` i
`js/sim_formel.js`. **Opgaverne** på Vægten står i `D.VAEGT`; `tal` er de sæt
tal, en opgave kan have (det første bruges først; Nye tal trækker et andet).
**Regnetrinene** (navn, venstreside, enhed, formel, mellemregningens to led og de tre hint med {a}, {b} og {stof}) står i
`D.TRIN` og `D.MESTER_HINT`. **Hurtigrunden:** de faste spørgsmål står i `D.HURTIG` med det
rigtige svar først og en forklaring til hvert forkert; tallene til
hovedregning i `D.HURTIG_TAL`; hvor mange af hver slags i `D.RUNDE`; straffen
i `D.STRAF` og `D.STRAF_HINT`. **Replikkerne** står i `D.INTRO`, `D.FAERDIG`, `D.ROS`,
`D.ROS_OPGAVE`, `D.KAFFE` og `D.TREKANT`.

**Formlernes typiske fejl** står i `KENDTE` i `js/tjek.js`, **talfejlene** i
`kandidater`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at de ni
molarmasser passer med tabellen, at enhederne regnes rigtigt (m / M giver
mol, M / m giver 1/mol), at formlerne og tallene med enhed genkendes med de
typiske fejl, at facit i alle opgaver og alle tal godkendes, når det skrives
som i feltet, at beregningerne er pæne, at spørgsmålene i Hurtigrunden har
forskellige svar og det rigtige facit, at sproget holder reglerne, at alle
seks opgaver på Formlen kan løses med musen (træk og klik, med fejl, låste
brikker, hint, trekanten og muldvarpen), og at teksten står over tavlen, at mellemregningens felter genkender tallene med de typiske fejl, at alle seks opgaver på Vægten kan
løses ved at skrive, og at scenen gør det, der er regnet, at en hel
Hurtigrunde kan køres med en fejl, der kommer igen, at Kemichael kun taler
ved hint og svar og kan sendes ud, og at layoutet holder fra 520 × 380 til
1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files` og lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 27. september 2026: ALT OK (133 påstande).

## Forenklinger

* Atommasserne har to decimaler (som sc4.1), så M(glukose) er 180,18 g/mol
  (tabellens 180,16 regnes med H = 1,008).
* Vand og svovlsyre fra den gamle er skiftet ud med faste stoffer, så alt kan
  stå i en krukke og vejes i en vejebåd.
* Krukkens etiket viser kun formlen og molarmassen. Navnet står i opgaven.
* Massen af det ukendte pulver er regnet af stofmængden og rundet til to
  decimaler, så dets M kan afvige lidt fra tabellen (101,2 g/mol for KNO₃).
* Stofmængder skrives med tre betydende cifre, masser med to decimaler og
  molarmasser med fire betydende cifre. Et svar er rigtigt, når det højst er
  1 % fra facit.
* Posen er et billede af 1 mol. En del af en pose er en mindre pose med
  brøkdelen på.

## I menuen

I menuen fra 26. sept. 2026 som c4.3 i `kemi-c-filer/samling_c4.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c4.3_opgaver_masse_til_stofmængde_oldversion.html`.

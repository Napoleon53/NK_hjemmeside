# sc6.1 Alkaners kogepunkt

Superanimation om alkaners kogepunkt: jo mere molekylerne rører hinanden, jo
højere koger stoffet. Åbn `index.html`. Mappen henter kun filer inde fra sig
selv, bortset fra Kemichael (`../../v2/kemichael/kemichael.js`). Ingen `fetch`
og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** jo mere molekylerne rører hinanden, jo stærkere holder de
   sammen, og jo højere er kogepunktet. Lange kæder koger ved højere
   temperatur end korte, og forgrenede koger lavere end lige.
2. **Afløser** `kemi-c-filer/c6.1_alkaner_kogepunkt.html`, brugerens første
   animation. Med fra den gamle: temperaturen, man skruer på, mærkerne for
   smeltepunkt og kogepunkt, molekylerne som kæder af kugler, farverne efter
   tilstand (grå fast stof, orange væske, blå gas), metan, pentan,
   2,2-dimethylpropan og octan, blandingerne (nu spillet på fane 3),
   pauseknappen og knappen "Antænd damp" (nu en tændstik, der er et påskeæg).
3. **Naboerne:** `c6.2` ejer zigzagformler, `c6.3` at bygge og genkende
   isomerer, `c6.4` navngivning (de tre samles i `sc6.2_zigzagformler`) og
   `c3.4` polaritet og blandbarhed. Her bruges navnene og formlerne kun til at
   vise, hvilket stof der er tale om.
4. **Loftet:** 3 faner og 13 stoffer (metan til decan, icosan og to isomerer af
   pentan). Højst ca. 50 molekyler og 130 kugler i et zoomvindue.
5. **Layoutet:** scene plus panel, og mikroniveauet i centrum. Fane 1: et
   stort zoomvindue i midten, udstyret (en lille reol med glassene og et
   mindre kammer) i en smal kolonne til venstre og et højt termometer til
   højre, kurven i panelet. Fane 2: tre store zoomvinduer, glassene små i et
   lavt vandbad under dem, termometeret til højre. Fane 3: som fane 1, med
   forklaringen af stofferne øverst i venstre kolonne, svarene i panelet.

Brugerens første test (24. september 2026): udstyret fyldte for meget og
mikroniveauet for lidt. Layoutet blev lagt om, så zoomvinduerne fylder
mindst 30 % af scenen (selvtesten tjekker det).

Brugeren valgte de tre anbefalinger: tre faner, tændstikken som påskeæg og
stofferne metan til decan plus paraffin (icosan).

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Varm op | sætter en alkan i kammeret, skruer på temperaturen og ser den smelte, koge og fortætte; hvert kogepunkt kommer på en kurve | jo længere kæde, jo højere kogepunkt |
| 2 | Formen | gætter, hvilken af tre isomerer af C₅H₁₂ der koger først, varmer vandbadet op og svarer på hvorfor | samme atomer, men den kugleformede rører sine naboer mindst |
| 3 | Hvem koger først? | gætter, hvilket stof i en blanding der koger først; kammeret varmer op og viser det | kædelængden betyder mest, formen afgør det ved samme antal C |

**Varm op.** Elleve reagensglas med en ballon på står i en lille reol ved
stuetemperatur, så gasserne (C₁ til C₄) har fyldt deres ballon, væskerne står
i bunden, og icosan er fast. Et glas trækkes ned i temperaturkammeret (et klik
virker også). Termometeret er knappen: eleven trækker i håndtaget fra −200 til
360 °C, piletasterne flytter én grad. Kammeret rimer til, når det er koldt, og
varmelegemet gløder, når det er varmt. Zoomvinduet viser molekylerne i glasset:
fast stof i ordnede rækker, væske i bunden, gas, der farer rundt. Over
kogepunktet river molekylerne sig løs ét ad gangen, glasset bobler, og
ballonen fyldes (mere, jo varmere gassen er). Første gang et stof koger eller
fortætter, kommer kogepunktet på kurven i panelet, og termometeret får et
mærke (også for smeltepunktet). Fire mål: få pentan til at koge, find tre
andre kogepunkter, gæt decans kogepunkt ved at trække et ? på kurven og mål
det, og kog icosan. Knappen giver et hint og derefter svaret.

**Formen.** Pentan, 2-methylbutan og 2,2-dimethylpropan står i hver sit glas
i et lavt vandbad, hvert med sit store zoomvindue over sig og sin ballon i hver
sin farve. Varmt vand får små varmebølger over sig. Eleven gætter først (i
panelet eller ved at klikke på et glas) og varmer så vandbadet fra 0 til 50 °C
med termometeret. Ballonerne fyldes i rækkefølgen 9,5, 27,9 og 36,1 °C. Så
kommer spørgsmålet hvorfor. De forkerte svar er de typiske fejl: færre atomer,
lettere og "bindingerne inde i molekylet er svagest". Til sidst går knappen
videre til fane 3; <kbd>R</kbd> starter forsøget forfra.

Parrene er en valgfri boks bag knappen "Se, hvor molekylerne rører hinanden"
under kogepunkterne: to molekyler af hvert stof, lagt så tæt sammen, som de
kan, med gule prikker, hvor de rører hinanden (9, 5 og 3 steder). Brugeren
syntes, at "berøringer" midt i scenen var for indforstået (24. september
2026).

**Hvem koger først?** En blanding af to eller tre alkaner i kammeret,
molekylerne i hver sin farve. Eleven gætter i panelet eller ved at klikke på
et molekyle. Så varmer kammeret op til midt mellem de to laveste kogepunkter,
og det første stof koger væk og fylder ballonen. Tre niveauer: *Kædelængde*,
*Formen* (kun C₅H₁₂) og *Begge dele*, hvor en forgrenet med flere C-atomer
står mod en kortere lige kæde (butan mod 2,2-dimethylpropan). En runde er ni
blandinger, tre fra hvert niveau, fra 16. Forklaringen passer til fejlen
(`D.hvorfor`). Et svar, man har set, giver ikke point. Rekorden huskes.

**Tændstikken** (påskeæg, fane 1). En tændstik trukket op af æsken brænder.
Rører den en fuld ballon, brænder gassen: en ildkugle, ballonen er væk, og i
zoomvinduet bliver hvert molekyle til CO₂ og H₂O efter
CₙH₂ₙ₊₂ + O₂ → n CO₂ + (n + 1) H₂O. Kemichael kommer, siger noget tørt, sætter
et nyt glas med en ny ballon i og går. Det tæller i hans regnskab over uheld.
En tom ballon brænder ikke: "Ballonen er tom. Stoffet er lukket inde i
glasset."

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation
(reglen i `../README.md`): varm op tre replikker (han peger på reolen og
termometeret), formen tre, spillet to. Han går kun ved den store knap, to klik
på ham eller Esc. <kbd>K</kbd> viser præsentationen igen. Ellers roser han, når
de fire mål er nået ("Fire mål. Stearinlyset overlevede."), første gang
hvorfor er besvaret ("Det kogte du godt ned.", kun én gang pr. browser) og
når runden er slut. Kaffekoppen er det
fælles påskeæg.

Direkte links: `index.html#form` og `index.html#spil`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>↑</kbd> <kbd>↓</kbd> temperaturen (med Skift ti grader) · <kbd>P</kbd>
pause · <kbd>R</kbd> nyt glas, forfra eller ny runde · <kbd>Enter</kbd> næste
· <kbd>Esc</kbd> luk eller send Kemichael ud.

### Det nye i forhold til den gamle animation

* **Glas med ballon.** Den gamle viste kun partiklerne. Nu er der et glas i et
  kammer, og ballonen viser, at gassen fylder, når stoffet koger. Ballonen
  holder trykket på 1 atm, så kogepunktet er det normale kogepunkt.
* **Eleven finder kogepunkterne selv.** Mærkerne på termometeret og punkterne
  på kurven kommer først, når stoffet har kogt eller fortættet.
* **Molekylerne rører hinanden.** Kuglerne tiltrækker hinanden, hvor de
  næsten rører (gule prikker), og fast stof ligger i ordnede rækker. Den
  gamle lod kuglerne falde og hoppe uden tiltrækning.
* **Damp under kogepunktet.** Lige under kogepunktet er nogle molekyler damp
  over væsken, efter damptrykket. Den gamle havde alt eller intet.
* **Kurven, gættet og hverdagen.** Ti alkaner og icosan i stedet for fire, så
  kurven får nok punkter til at gætte på, og så der er gasser, væsker og et
  fast stof ved stuetemperatur.
* **Blandingerne er blevet et spil**, og "Antænd damp" er blevet en tændstik
  med rigtig forbrænding (den gamle lavede halvdelen til CO₂ og halvdelen til
  H₂O, satte temperaturen til "PLASMA / ILD" og viste en alert).
* **Smeltepunkt for 2,2-dimethylpropan.** Den gamle brugte −17 °C og et
  kogepunkt på 10 °C; tabellen siger −16,5 og 9,5 °C.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.2's). NB: decimaltal med PUNKTUM i CSS
sprites/            reagensglasset, temperaturkammeret, termometeret (langt og smalt),
                    tændstikæsken og vandbadet (langt og lavt)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred (som sc4.2)
js/data.js          stofferne, målene, spørgsmålet, blandingerne og replikkerne
js/model.js         formerne, det bedste par og proeven: tilstandene og fysikken
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, reolen, glasset med ballon, kammeret, termometeret,
                    vandbadet, zoomvinduet, parret, tændstikken og kurven
js/termostat.js     temperaturen, som eleven trækker i termometeret
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/sim_varm.js      fane 1
js/sim_form.js      fane 2
js/sim_spil.js      fane 3
js/laerer.js        Kemichael på alle tre faner
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Stofferne** står i `S` øverst i `js/data.js`: id, navn, formel, antal C,
smeltepunkt, kogepunkt og form. `ANTAL` er antallet af molekyler i glasset på
fane 1. **Målene** står i `D.MAAL`, **spørgsmålet** på fane 2 i `D.HVORFOR`
og **blandingerne** i `D.BLANDINGER` (stofferne og starttemperaturen, hvor de
alle er væsker; kammeret varmer op til midt mellem de to laveste
kogepunkter).

**Modellen** står i `js/model.js`. Farten, stofferne skifter tilstand med,
er `fart` (lige over kogepunktet koger det stille, 12 grader over på lidt over
et sekund). Tiltrækningen er `E_TIL`, gassens temperatur `KT_GAS`, væskens i
`kT`.

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at smelte- og
kogepunkterne passer med tabellen, at damptrykket er 1 atm ved kogepunktet, at
det bedste par rører mest for pentan og mindst for 2,2-dimethylpropan, at alle
elleve alkaner er gas, væske og fast stof ved de rigtige temperaturer (og
fryser på plads uden at overlappe), at alle 16 blandinger starter som væsker og
koger i den rigtige rækkefølge, at alle tre faner kan gennemføres (fane 1 også
med musen, med tændstikken og Kemichael), at sproget holder reglerne, og at
layoutet holder fra 520 × 380 til 1500 × 900. Den kræver en lokal server eller
Chrome med `--allow-file-access-from-files` og lægger elevens gemte
fremskridt tilbage bagefter. Sidst kørt 24. september 2026: ALT OK (87
påstande).

## Forenklinger

* **Hvert C-atom med sine H-atomer er én kugle**, og molekylerne er flade
  (2D). 2,2-dimethylpropan er tegnet som et kryds, der skal ligne en kugle.
  Berøringerne i parret er talt i den flade model; rækkefølgen er den samme
  som for de rigtige overflader.
* **Tilstanden kommer fra tabellen, ikke fra bevægelsen.** Over kogepunktet
  går molekylerne til gassen ét ad gangen, hurtigere jo varmere det er.
  Kuglernes bevægelse og tiltrækning er en lille fysik, der viser det, men
  den regner ikke selv kogepunktet ud.
* **Damptrykket** under kogepunktet regnes med Troutons regel
  (88 J/(mol·K)), og højst 12 % af molekylerne vises som damp. For pentan ved
  20 °C giver reglen 0,56 atm; målt er 0,57 atm.
* **Glasset med ballonen** holder trykket på 1 atm. Luften er ikke med:
  glasset indeholder kun stoffet.
* **Blandingerne koger, som om stofferne var hver for sig**: hvert stof koger
  ved sit eget kogepunkt, og dampen er rent det ene stof. I virkeligheden
  koger en blanding ved en temperatur imellem (Raoults lov), og dampen er kun
  beriget med det flygtigste. Rækkefølgen er den samme, og det er den, fane 3
  spørger om.
* **Temperaturen skiftes med det samme**, når termometeret trækkes. Der er
  ingen opvarmningskurve med et plateau under kogningen.
* **Gassens fart** følger √(T/M): tunge molekyler farer langsommere. Farten
  er skaleret, så den kan ses.
* Kammeret kan i modellen gå fra −200 til 360 °C. Et rigtigt kammer kan ikke
  begge dele.

## I menuen

I menuen fra 26. sept. 2026 som c6.1 i `kemi-c-filer/samling_c6.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c6.1_alkaner_kogepunkt_oldversion.html`.

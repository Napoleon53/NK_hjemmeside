# sb5.6 Byg figuren: fagord til kapitel B5

Ny 3. nov. 2026 (brugeren: "Du må gerne bygge B5 i byg figuren"). Bygget efter opskriften i
`../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt kapitel") som kopi af
`../sb2.9_byg_figuren` (B2). Nummeret 6 kommer efter de fem animationer i B5-menuen (B5's egne
animationer ligger i de gamle mapper `sb9.1`, `sb9.3` og `sb9.4`).

**I menuen:** B-panelets fane "byg" som B5 "Spektroskopi" (`?emne=b5.byg`), linjen under
'Byg figuren' i `FEEDBACK_EMNER` i `samling_alt_b.html` og `"b5"` i `BYG_FIGUREN` i
`NK_Undervisning/Kemibogen/stil/fagord.html` (flisen vises efter næste bygning af bogen).
Brugeren har ikke set den endnu.

## Bestillingen

1. **Pointen i én sætning.** Kapitel B5's fagord sat på figurer i B-bogens stil, så eleven ser,
   hvad ordet er, og figuren får farve, når ordet sidder rigtigt.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens lys-boelger, lys-spektrum,
   lys-absorption, farvecirkel, spektrofotometer, spektrum-roed, konjugering,
   lambert-koncentration, lambert-lysvej, lambert-formel, standardraekke, standardkurve og
   lineaert-omraade (`vaerktoej/lav_figurer.py`, `sf_b5_...`).
3. **Naboerne.** `sb9.1_absorptionsspektre`, `sb9.3_lambert_beer`, `sb9.4_spektrofotometri` og
   forsøgene i B5-menuen ejer at måle og regne. Her sættes kun ord på.
4. **Loftet.** Fire faner, én pr. afsnit, og alle 23 fagord. Blindprøve står to steder
   (`NK.GENTAGET`).
   - B5.1 Lys og farver: 6 fagord i tre lag.
   - B5.2 Absorptionsspektre: 9 fagord i tre lag.
   - B5.3 Lambert-Beers lov: 4 fagord i to lag.
   - B5.4 Standardkurven: 5 pladser (4 fagord og blindprøve igen) i to lag.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| B5.1 | blåt lys (450 nm) og rødt lys (650 nm) som bølger med λ fra top til top; det synlige lys som et bånd fra 400 til 700 nm mellem ultraviolet og infrarødt; hvidt lys fra en lampe gennem en rød opløsning til øjet (violet, blåt og grønt lys forsvinder i glasset); farvecirklen med det grønne lys mørkt og en pil over til lilla, og et bægerglas med permanganat | bølgelængde (begge dobbeltpile), synligt lys (det farvede bånd); hvidt lys (strålerne fra lampen), absorbere (strålerne, der forsvinder i glasset); farvecirkel (titel på rammen om ringen), komplementærfarver (pilen fra grøn til lilla) |
| B5.2 | spektrofotometeret med lampe, prisme, spalte, kuvette, detektor og displayet A = 0,520 ved 504 nm; et kort med en kuvette med rent vand, A = 0,000 og knappen nulstil; spektret for E129; kæder med 2, 5, 8 og 11 konjugerede dobbeltbindinger og stoffets farve; lycopen | spektrofotometer (titel på apparatet), kuvette, absorbans (displayet); blindprøve (titel på kortet), absorptionsspektrum (titel på grafen), absorptionsmaksimum (toppen og den stiplede linje til 504 nm); konjugerede dobbeltbindinger (overskrift over tallene 2, 5, 8 og 11), chromofor (de 11 konjugerede dobbeltbindinger i midten af lycopen), chromofor gruppe (én C=C i rækken) |
| B5.3 | tre kuvetter med permanganat (1, 2 og 3 · 10⁻⁴ M, A = 0,245, 0,490 og 0,735) og de tre punkter på en ret linje gennem (0, 0); samme opløsning i en smal og en bred kuvette (l = 1,00 og 2,00 cm, A = 0,490 og 0,980); kortet med A = ε · l · c og ε for permanganat | ligefrem proportional (den rette linje), lysvej (dobbeltpilene under kuvetterne); Lambert-Beers lov (titel på kortet med formlen), ekstinktionskoefficient (ε) |
| B5.4 | en målekolbe med 100 µM, "fortyndes med vand"; blindprøven og fem standarder af E129 i et stativ og prøven for sig, med koncentration og absorbans under; standardkurven med aflæsningen af prøven (13,0 µM); grafen, der bøjer af over 40 µM | stamopløsning (kolben), standardopløsning (klammen over de fem), blindprøve (kuvetten med 0 µM); standardkurve (titel på grafen), lineært område (den lyse flade op til 40 µM) |

## Valg og forenklinger

- **Chromofor gruppe** er nyt fagord 3. nov. 2026. Brugeren spurgte: "Er det rigtigt at kalde
  konj dobbeltbindinger for chromofore? jeg bruger normalt chromofore grupper om grupper der
  bidrager til farve-abs", og efter svaret (begge brugsmåder er rigtige: chromoforen er hele det
  konjugerede system, de chromofore grupper er byggestenene) "Jeg synes også at chromofor gruppe
  skal være et fagord". Bogens B5.2 har fået et afsnit om **chromofore grupper**, en linje i Kort
  sagt og fagordet på listen. I figuren peger pladsen på én C=C i lycopens chromofor, og den C=C
  bliver lilla, når ordet sidder.

- Ord, der ville afsløre en plads, står ikke i figuren: "kort/lang bølgelængde" ved bølgerne,
  "bølgelængde i nm" under båndet (der står kun nm), "bliver absorberet" ved glasset,
  "λmax = 504 nm / her absorberer farvestoffet mest" ved toppen, navneskiltet på kuvetten i
  apparatet, "Blindprøve" og "Standard 1" til "Standard 5" over kuvetterne, "det lineære
  område / punkterne ligger på linjen" og "Lambert-Beers lov" på den stiplede linje.
- Chromofor og konjugerede dobbeltbindinger må ikke kunne byttes. Konjugerede dobbeltbindinger
  er overskriften over tallene 2, 5, 8 og 11 som i bogens konjugering (tal kan ikke være en
  chromofor). Chromofor peger på en del af et rigtigt farvestof: lycopen fra tomater (C₄₀H₅₆,
  SMILES `CC(C)=CCCC(C)=CC=CC(C)=CC=CC(C)=CC=CC=C(C)C=CC=C(C)C=CC=C(C)CCC=C(C)C`) med de otte
  methylgrupper. Feltet dækker de 11 konjugerede dobbeltbindinger i midten; dobbeltbindingerne i
  enderne er ikke med, fordi to CH₂-grupper skiller dem fra rækken. Bogen nævner lycopen med 11
  konjugerede dobbeltbindinger.
- Farvecirkel er titel på en ramme om ringen alene, så den ikke står over glasset med
  permanganat. Tallene inde i ringen (bølgelængderne) er taget ud for at gøre den enklere.
- Kuvette og blindprøve er begge kuvetter, men blindprøve er titlen på et kort med rent vand,
  A = 0,000 og knappen nulstil, og kuvette peger på beholderen inde i apparatet.
- Grafen over A mod c i B5.3 står ikke i bogen; den er lavet som bogens standardkurve med de tre
  målinger fra lambert-koncentration. Titlerne "Smal kuvette" og "Bred kuvette" er afløst af
  "Samme opløsning i to kuvetter", og A står til højre for kuvetten.
- Målekolben med stamopløsningen står ikke i bogens standardraekke; den er bogens eksempel
  (100 µM fortyndes til standarderne). Ligningen A = 0,0260 µM⁻¹ · c er taget af standardkurven.
- B5.2 er den højeste figur (1100 × 766). Ved 1280 × 720 bliver den mindste skrift lille, men kan
  læses.
- Lagenes rækkefølge og figurernes indhold er Claudes valg.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de fælles filer (fra sb2.9, 3. nov. 2026) og skal
holdes ens i alle Byg figuren-mapperne. `kurver.js` er sb1.5's tegnehjælp, kopieret uændret
(graferne, kortene og udvidelsen med gule felter langs en linje, som B5 bruger til den rette
linje i B5.3 og pilen i farvecirklen). Kapitlets egne filer er `js/data.js` (forklaringerne fra
`Kemibogen/b/fagord/kapitel-b5.qmd`, lavet med et lille script, kursiv taget af, λ~max~ skrevet
λₘₐₓ), `js/b5.js` og `js/fig_farver.js`, `fig_spektre.js`, `fig_lambert.js` og
`fig_standard.js`.

`js/b5.js` er kapitlets egen tegnehjælp i bogens stil: lysets farver (`lysfarve`, `regnbue`),
kuvetter i let perspektiv, stråler, der gløder og bliver svagere i væsken (`straale`, `svind`,
`maaling`), lampen, øjet og permanganationerne, akserne og kurven til et absorptionsspektrum,
et bægerglas, en målekolbe (fra sc7.6's `lab.js`), kuvettestativet, zigzagkæder og tekstens
bredde målt i svg (som `B2.bredde`).

`_selvtest.html`: ALT OK (730) 3. nov. 2026 med chromofor gruppe. Skærmbilleder af hver fane i første lag, færdig og
i den svære udgave ved 1400 × 860 og 1280 × 720 er set igennem.

**Motoren rettet 3. nov. 2026:** med ni fagord i den svære udgave i B5.2 fyldte bakken tre
rækker, og kortet dækkede pladserne øverst i figuren. `tilpasFigur` i `motor.js` rykker nu
figuren ned under kortet i den svære udgave, når kortet er højere end `--kortzone`, og ikke op
igen, mens der arbejdes. Rettelsen er kopieret til alle Byg figuren-mapperne, og alle selvtests
er grønne.

## Ikke lavet

- Prøvet med en rigtig mus. Træk og klik er motorens og er de samme som i sb1.5.

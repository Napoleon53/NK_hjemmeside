# sb5.6 Byg figuren: fagord til kapitel B5

Ny 3. nov. 2026 (brugeren: "Du må gerne bygge B5 i byg figuren"). Bygget efter opskriften i
`../sc1.5_byg_figuren/README.md` ("Opskrift: Byg figuren til et nyt kapitel") som kopi af
`../sb2.9_byg_figuren` (B2). Nummeret 6 kommer efter de fem animationer i B5-menuen (B5's egne
animationer ligger i de gamle mapper `sb9.1`, `sb9.3` og `sb9.4`).

**Tre faner fra 10. nov. 2026:** bogens B5.1 til B5.3 blev til to afsnit, så kapitlet har tre
(B5.1 Lys og farver, B5.2 Absorbans og Lambert-Beers lov, B5.3 Standardkurven), og chromofor er ikke
fagord længere (Niels: "Jeg synes faktisk godt du kan sløjfe fagordet chromoforen"). Figuren følger
med: konjugeringen er flyttet til B5.1, de gamle faner B5.2 og B5.3 er én fane, og standardkurven
hedder B5.3. Beskrivelsen nedenfor er den nye; ændringerne står under "Tre faner" sidst.

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
3. **Naboerne.** `sb5.1_absorptionsspektre`, `sb5.2_lambert_beer`, `sb5.3_spektrofotometri` og
   forsøgene i B5-menuen ejer at måle og regne. Her sættes kun ord på.
4. **Loftet.** Tre faner, én pr. afsnit, og alle 22 fagord. Blindprøve står to steder
   (`NK.GENTAGET`).
   - B5.1 Lys og farver: 8 fagord i fire lag (2, 2, 2, 2).
   - B5.2 Absorbans og Lambert-Beers lov: 10 fagord i fire lag (3, 3, 2, 2).
   - B5.3 Standardkurven: 5 pladser (4 fagord og blindprøve igen) i to lag.
5. **Layoutet.** Som sc1.5: kortet øverst, figuren på et lyst ark, panelet til højre.

## Figurerne

| Fane | Figur | Pladser |
|:--|:--|:--|
| B5.1 | blåt lys (450 nm) og rødt lys (650 nm) som bølger med λ fra top til top; det synlige lys som et bånd fra 400 til 700 nm mellem ultraviolet og infrarødt; hvidt lys fra en lampe gennem en rød opløsning til øjet (violet, blåt og grønt lys forsvinder i glasset); farvecirklen med det grønne lys mørkt og en pil over til lilla og to linjer om permanganat; kæder med 2, 5, 8 og 11 konjugerede dobbeltbindinger og stoffets farve | bølgelængde (begge dobbeltpile), synligt lys (det farvede bånd); hvidt lys (strålerne fra lampen), absorbere (strålerne, der forsvinder i glasset); farvecirkel (titel på rammen om ringen), komplementærfarver (pilen fra grøn til lilla); konjugerede dobbeltbindinger (overskrift over tallene 2, 5, 8 og 11), chromofor gruppe (én C=C i kæden med 11) |
| B5.2 | spektrofotometeret med lampe, prisme, spalte, kuvette, detektor og displayet A = 0,520 ved 504 nm; et kort med en kuvette med rent vand, A = 0,000 og knappen nulstil; spektret for E129; de tre målinger af permanganat (1, 2 og 3 · 10⁻⁴ M) på en ret linje gennem (0, 0); samme opløsning i en smal og en bred kuvette (l = 1,00 og 2,00 cm, A = 0,490 og 0,980); kortet med A = ε · l · c og ε for permanganat | spektrofotometer (titel på apparatet), kuvette, absorbans (displayet); blindprøve (titel på kortet), absorptionsspektrum (titel på grafen), absorptionsmaksimum (toppen og den stiplede linje til 504 nm); ligefrem proportional (den rette linje), lysvej (dobbeltpilene under kuvetterne); Lambert-Beers lov (titel på kortet med formlen), ekstinktionskoefficient (ε) |
| B5.3 | en målekolbe med 100 µM, "fortyndes med vand"; blindprøven og fem standarder af E129 i et stativ og prøven for sig, med koncentration og absorbans under; standardkurven med aflæsningen af prøven (13,0 µM); grafen, der bøjer af over 40 µM | stamopløsning (kolben), standardopløsning (klammen over de fem), blindprøve (kuvetten med 0 µM); standardkurve (titel på grafen), lineært område (den lyse flade op til 40 µM) |

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
- (Til 10. nov. 2026, se "Tre faner" sidst: chromofor og lycopen er taget ud.) Chromofor og konjugerede dobbeltbindinger må ikke kunne byttes. Konjugerede dobbeltbindinger
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
- (Til 10. nov. 2026) B5.2 var den højeste figur (1100 × 766). Ved 1280 × 720 bliver den mindste skrift lille, men kan
  læses.
- Lagenes rækkefølge og figurernes indhold er Claudes valg.

## Filerne

`svg.js`, `motor.js`, `app.js` og stilarket er de fælles filer og skal holdes ens i alle Byg
figuren-mapperne. `kurver.js` er sb1.5's tegnehjælp, kopieret uændret
(graferne, kortene og udvidelsen med gule felter langs en linje, som B5 bruger til den rette
linje i B5.3 og pilen i farvecirklen). Kapitlets egne filer er `js/data.js` (forklaringerne fra
`Kemibogen/b/fagord/kapitel-b5.qmd`, lavet med et lille script, kursiv taget af, λ~max~ skrevet
λₘₐₓ), `js/b5.js` og `js/fig_farver.js` (B5.1), `fig_absorbans.js` (B5.2) og `fig_standard.js` (B5.3).
`fig_spektre.js` og `fig_lambert.js` er slettet 10. nov. 2026; deres tegninger står nu i
`fig_absorbans.js` og konjugeringen i `fig_farver.js`.

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

## Papirkortet (3. nov. 2026)

Kortet er det lyse papirkort (se Fælles krav i `../README.md`): `../faelles/papirkort.css`
er indlæst i `index.html` og selvtesten, og `<body class="papirkort">`. Kun
udseendet er ændret; motoren er den samme som i `sc1.5_byg_figuren`, som var prøven.

## Tre faner (10. nov. 2026)

Bogens B5.1 og B5.2 og B5.3 blev til B5.1 Lys og farver (med konjugeringen og de chromofore
grupper) og B5.2 Absorbans og Lambert-Beers lov, og B5.4 Standardkurven hedder B5.3. Fagordet
chromofor er taget ud af bogen. Figuren:

- **B5.1** har fire lag. Kæderne med 2, 5, 8 og 11 konjugerede dobbeltbindinger er flyttet hertil fra
  den gamle B5.2-figur og står ved siden af farvecirklen. Lycopen og pladsen chromofor er taget ud:
  lycopen var der for chromoforens skyld, og uden den bliver figuren ikke højere (1100 × 744 mod 730
  før). Chromofor gruppe peger på én C=C i kæden med 11 og bliver lilla, når ordet sidder;
  konjugerede dobbeltbindinger er stadig overskriften over tallene, så de to ikke kan byttes.
  Glasset med permanganat er afløst af to linjer ("permanganat absorberer grønt lys", "permanganat ser
  lilla ud") ved siden af ringen, så farvecirklen og kæderne kan stå i samme række. Pladserne er
  bredere end før, fordi "konjugerede dobbeltbindinger" nu er fanens længste ord (334 px på Linux),
  og bølgerne og båndet er rykket lidt ned.
- **B5.2** er én fane i fire lag, sat sammen af den gamle spektre-figur (uden kæderne og lycopen) og
  den gamle lambert-figur. De tre kuvetter med permanganat er taget ud; grafen med de tre målinger og
  den rette linje er tilbage, og aksen hedder c(permanganat). Figuren er 1100 × 818 (spektre var 766)
  og fylder samme bredde ved 1280 × 720 som den gamle B5.2-figur.
- **B5.3** er den gamle B5.4-fane. Samme aften fik den bogens nye målinger med b-led (0,143 til 0,663,
  linjen y = 0,0260x + 0,012 og prøven 0,350, som `STANDARDER` og `B5M_PROEVE` i bogens figurprogram);
  aflæsningen 13,0 µM er den samme.
- Hash: `#b5.1`, `#b5.2` og `#b5.3`; de gamle `#spektre`, `#lambert` og `#b5.4` virker stadig.
- `_selvtest.html`: ALT OK (716) 10. nov. 2026. Skærmbilleder af hver fane (lag 1, færdig og svær
  udgave) ved 1400 × 860 og 1280 × 720 er set igennem. Ikke prøvet med en rigtig mus.


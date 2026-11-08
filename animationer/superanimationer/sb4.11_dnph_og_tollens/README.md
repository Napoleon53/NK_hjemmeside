# sb4.11 DNPH og Tollens' test

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter
molekylemotoren fra `../../molekylemotor/` (molekylet, navngivningen,
navnelæseren, tegningen og tavlen) og virker også, når den åbnes direkte fra
harddisken. Der er ingen Kemichael: al tekst står på det lyse papirkort
øverst i scenen, hjælpen er den gule knap på kortet, og intet løses uden
**Indsend svar**.

Den afløser `animationer/kemi-b-filer/b5.1_eksperiment_dnph_tollens.html`
(B4 knap 3, koden `b5dnph`). Afsnittet i Kemibogen B er B4.3 Aldehyder og
ketoner, men `sb4.3` er optaget af Oxidation af alkoholer, og `sb4.4` til
`sb4.10` er også optaget. Derfor nummer 4.11.

**Pointen i én sætning:** DNPH reagerer med carbonylgruppen og giver bundfald
med både aldehyder og ketoner, og Tollens' test giver kun sølvspejl med
aldehyder, fordi kun aldehydets carbonatom i carbonylgruppen har et
hydrogenatom og kan oxideres videre.

## Bestillingen (7. november 2026)

Brugeren: "Kan du ikke lave DNPH og tollens animationen om til en
superanimation?" Den 3. november var DNPH/Tollens nævnt som en af de gamle
B4-animationer, der så slidte ud. Brugeren valgte tre faner (forslaget med
anbefalingen) frem for to: "Hvad viser testene?", "Reaktionerne" og
"Ukendte stoffer" efter journal 25.

1. **Pointen:** som ovenfor.
2. **Afløser b5.1.** Med fra den gamle: de seks stoffer (ethanal, propanon,
   benzaldehyd, ethansyre, vanillin og sprit), de to test, opvarmningen ved
   Tollens' test, reaktionsskemaerne med DNPH og Tollens' reagens og
   journalskemaet med DNPH, Tollens og stofklassen. Det gamle glas med
   orange bundfald og sølvspejl er tegnet om som bogens figur
   b4-dnph-tollens. Taget ud: "Rengør glas" og advarslen om det beskidte
   glas (det er laboratoriet, ikke begrebet), statuslinjen og beskederne
   nederst. Nyt: eleven forudsiger testene ud fra formlen, klikker selv på
   de atomer, der bliver til vand, afstemmer Tollens' reaktion i bogens trin
   og finder stofklassen i seks flasker ved at tænke over, hvad bundfaldet
   og sølvspejlet betyder (rutediagrammet fra bogen står i teorien).
3. **Naboerne:** `sb4.3_oxidation_af_alkoholer` ejer oxidationen af
   alkoholer og afstemningen med permanganat; her er det kun aldehydet, der
   oxideres af Ag⁺. `sb4.8_organiske_navne` ejer navnene; her giver motoren
   dem. `sb4.5_organisk_syntese` ejer syntesen og estere. Kondensationen er
   kendt fra estere (B4.5) og bliver kun navngivet her.
4. **Loftet:** tre faner. Fane 1: ti stoffer med to spørgsmål hver. Fane 2:
   tre opgaver (to med DNPH, én afstemning med Tollens' reagens). Fane 3: seks flasker,
   ét forsøg med én knap, seks spørgsmål om stofklassen og tre om stofferne.
5. **Layoutet:** scene plus panel som sb4.3. Scenen er papirkortet øverst og
   et whiteboard under det.

Stop-listen er overholdt: ingen flasker, man hælder med musen, intet
stativ, intet affaldsglas, ingen uheld og ingen oprydning. Dråberne kommer i
glassene af sig selv, når svaret er givet (fane 1) eller knappen Udfør
testene er trykket (fane 3).

## Fanerne

**1 Hvad viser testene?** (`js/sim_test.js`). Ti stoffer som zigzagformler
med aldehydets H tegnet, som i bogens figur b4-carbonyl. Hver opgave har to
spørgsmål: hvad sker der med DNPH, og hvad sker der i Tollens' test? De tre
svar er de samme ved begge test (Gult eller orange bundfald, Sølvspejl,
Ingen ændring), så eleven skal vide, hvilken test der giver hvad. Det glas,
kortet spørger om, har en gul ramme. Når svaret er rigtigt, kommer en
plastpipette med en dråbe af stoffet, og glasset viser resultatet: DNPH
bliver uklart, og bundfaldet samler sig i bunden; Tollens' glas står i et
vandbad, og sølvet sætter sig som et spejl. Carbonylgruppen bliver
grønblå, når DNPH er besvaret, og aldehydets H får en grønblå ring, når
Tollens' test er besvaret. Det første hint giver C=O en gul ring (også i
ethansyre og ethylethanoat, hvor C=O ikke er en carbonylgruppe i et aldehyd
eller en keton). Panelet har opgaverne (let, middel, svær) og tabellen Det
har du fundet med de fem stofklasser.

Stofferne: ethanal, propanon og ethanol (let); propanal, butanon, ethansyre
og benzaldehyd (middel); ethylethanoat, pentan-3-on og vanillin (svær).

**2 Reaktionerne** (`js/sim_reaktion.js`). Tre opgaver. Brugeren 7. nov.
2026: DNPH skal kun laves to gange, og der skal kun afstemmes én
redoxreaktion, for afstemningen er den samme for alle aldehyder. DNPH og
benzaldehyd og Tollens' reagens og benzaldehyd er derfor taget ud (og med
dem spørgsmålet om natriumhydroxid).

* *DNPH og ethanal og propanon:* stoffet står til venstre med
  C=O mod højre, og DNPH (2,4-dinitrophenylhydrazin) står til højre med
  NH₂-gruppen mod oxygen. Eleven klikker på de tre atomer, der bliver til
  vand (O fra C=O og de to H på NH₂), og trykker Indsend svar. Så trykker
  eleven på kortet, og reaktionen kører: vandet går af i en bue under DNPH,
  DNPH glider ind, og C=O bliver til C=N. Efter ethanal spørges der om
  navnet (kondensation), efter propanon om bindingen mellem C og N.
* *Tollens' reagens og ethanal:* skemaet står på tavlen med
  gule felter til koefficienterne. Eleven finder oxidationstallet for
  carbonylgruppens carbonatom før (+I) og efter (+III), antallet af Ag⁺
  (stigning 2, fald 1), OH⁻ (ladningen) og H₂O (hydrogen); oxygen er et
  tjek. Skemaet tegnes som afstemningsfigurerne i C-bogens afsnit 8.4
  (brugerens ønske 7. nov.): oxidationstal over atomerne, en orange pil fra
  carbonatom til carbonatom og en blå fra sølv til sølv, og "↑ 2" og
  "oxidation" (senere "1 ↑ 2 = 2") midt under reaktionspilen; grønblå
  koefficienter. Regnestykkerne står under hver sin side af skemaet:
  "Ladning venstre = 2 · (+1) = +2" under venstre side og "Ladning højre =
  −1" under højre. Når OH⁻ er fundet, bliver venstre side regnet om til
  "2 · (+1) + 3 · (−1) = −1". Det samme for H og til sidst O. Til sidst
  ammoniakkens opgave.

**3 Ukendte stoffer** (`js/sim_ukendt.js`). Brugerens journal 25
(Basiskemi B, Xperimentér 25, Dropbox/2025.2026/2y Ke): flaske A til F med
ethanal, propanon, benzaldehyd, ethansyre, vanillin og husholdningssprit
i tilfældig rækkefølge (vanillin afløser journalens mandelessens efter
brugerens ønske 7. nov. 2026). Udfør testene: én dråbe af hvert
stof i DNPH og i Tollens' reagens, Tollens' glas i et varmt vandbad.
Glassene og resultaterne bliver stående øverst på tavlen. Så én flaske ad
gangen: hvad viser de to test om stoffet? Eleven skal selv tænke over, hvad
bundfaldet og sølvspejlet betyder; hintene siger det og sætter en gul ramme
om det glas, de handler om. Rutediagrammet fra bogens figur b4-test-rute
står i teorien og ikke på tavlen (brugeren 7. nov. 2026: ellers bliver det
overvældende). Stofferne står i hele tavlens bredde nederst. Til sidst tre spørgsmål: hvilken flaske
er ethansyre, hvilken af de to flasker med en keton er husholdningssprit
(den med lidt bundfald), og hvilken af de tre flasker med et aldehyd er
ethanal (den med gult bundfald; benzaldehyd og vanillin har carbonylgruppen
på en benzenring og giver orange). Hint 2 til de to sidste spørgsmål sætter
gule rammer om DNPH-glassene. Kortets knap "Se, hvad flaskerne indeholder"
afslutter runden: navnene glider ind på stofklassernes plads under
flaskerne én ad gangen, bogstaverne kommer frem på stofkortene, og det
regner med konfetti. Slutkortet har ingen knap (brugeren 7. nov. 2026: at
kortets knap startede en ny runde, var et antiklimaks). En ny runde begynder
med Begynd forfra i panelet eller R, og antallet af løste runder bliver
stående.

## Filerne

```
index.html          siden, teorien og rundvisningen
css/stil.css        kopieret fra sb4.3; det nye står nederst under SB4.11
js/kerne.js         fælles hjælpere (som sb4.3)
js/data.js          stofferne, svarene, opgaverne på fane 2, flaskerne og
                    teksterne
js/kemi.js          modellen: carbonylgruppen, de to test, bundfaldets farve,
                    kondensationen med DNPH, afstemningen af Tollens'
                    reaktion, flaskernes resultater og forklaringerne
js/glas.js          reagensglassene: væsken, skyen, kornene, bundfaldet,
                    sølvspejlet, vandbadet og pipetten
js/fane.js          scenekortet, hjælpeknappen, Indsend svar, musen og
                    konfettien (fra sb4.3, med skjulHint og farvede bindinger)
js/sim_test.js      fane 1
js/sim_reaktion.js  fane 2
js/sim_ukendt.js    fane 3
js/rundvisning.js   rundvisningen (kun TURE er ny)
js/app.js           faneskift, tastatur og tegneløkken
sprites/            reagensglasset (tomt, DNPH, DNPH med bundfald, Tollens'
                    reagens, sølvspejl), plastpipetten og rutediagrammet
                    (kopi af bogens b4-test-rute.svg, til teorien)
_selvtest.html      selvtesten (kræver en lokal server, se nedenfor)
```

## Det, man kan rette i

* **Et nyt stof på fane 1:** en linje i `D.STOFFER` i `js/data.js` med
  IUPAC-navnet (og `vist`, hvis eleven skal se et andet navn). Modellen
  regner resultatet ud; selvtesten tjekker, at det passer med motorens
  stofklasse.
* **Fane 2:** `D.REAKTIONER` og de ekstra spørgsmål i `D.EKSTRA`. DNPH's
  atomer og bindinger står i `K.DNPH_ATOMER` og `K.DNPH_BINDINGER` i
  `js/kemi.js`.
* **Flaskerne på fane 3:** `D.FLASKER` med indholdet ("meget" eller "lidt").
* **Farverne i glassene:** `D.GLASFARVE`; forløbet i tid i
  `NK.Glas.tilstand` i `js/glas.js`.

## Forenklinger

* Tollens' test er positiv for alle aldehyder og ingen andre stoffer.
  Methansyre og methylmethanoat, som også giver sølvspejl, er ikke med.
* Bundfaldet er orange, når carbonylgruppen sidder på en benzenring, og ellers
  gult (Basiskemi B: "gule eller orange").
* Husholdningssprit er ethanol med under 1 % butanon og under 1 % propan-2-ol
  (sikkerhedsdatabladet for dansk husholdningssprit, fx Borup 93 %; Skats
  opskrift på fuldt denatureret sprit har 1 L butanon pr. hL ethanol).
  Modellen giver derfor lidt gult bundfald med DNPH og intet sølvspejl.
  Det er ikke afprøvet i brugerens forsøg.
* Vanillin står i flasken som rent stof (i skolen opløses det fx i ethanol,
  som ikke giver udslag i testene).
* Nitrogrupperne i DNPH tegnes som NO₂. I grafen er de et atom med én binding.
* Under kondensationen glider DNPH vandret ind, og C=N−N står i en vinkel på
  120 grader. Mekanismen (addition og elimination) er ikke vist.
* Sølvet sætter sig som et spejl; det gråsorte bundfald, som også kan komme,
  er nævnt i teorien, men ikke tegnet.

## Det, der var mine valg (ikke brugerens)

* De ti stoffer på fane 1, niveauerne og at de tre svar er ens ved begge
  test.
* At DNPH og Tollens' test spørges om for alle stoffer, også dem uden
  carbonylgruppe (journalen tester alle stoffer med begge).
* De ekstra spørgsmål på fane 2 (kondensation, C=N og ammoniak). Koefficienterne vælges på kortet, ikke i felter i skemaet.
* At husholdningssprit giver lidt bundfald (se Forenklinger), og spørgsmålet
  om ethanal på fane 3, der bygger på bundfaldets farve (bogen skriver kun
  "gult eller orange bundfald"; eleven skal selv se, at de to stoffer med en
  benzenring giver samme farve).
* "Flaske A" til "Flaske F" som i bogens opgave B4.3.11.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med mappen `animationer/`
som rod (motoren hentes fra `../../molekylemotor/`). Den tjekker modellen mod
bogen (de ti stoffer, 13 andre stoffer mod motorens stofklasse, bogens skema
for ethanal), at kondensationen har de samme atomer før og efter, at
Tollens' skema er afstemt, at flaskerne giver journalens resultater, at alle
tre faner kan gennemføres, at forkerte svar får den rigtige forklaring og
koster stjernen, at intet løses uden Indsend svar, at teksterne er korte og
uden tankestreger og ASCII-dansk, og at kortet aldrig dækker whiteboardet
fra 1100 × 620 til 1600 × 950.
7. nov. 2026: ALT OK (128).

## I menuen

Ikke i menuen endnu. Når brugeren siger til: knap nr. 3 "DNPH/Tollens" i
`kemi-b-filer/samling_b4,5,6.html` (koden `b5dnph`) peger på denne mappe,
`FEEDBACK_EMNER` følger med, og kolonnen "I menuen" i `../README.md` rettes.
Kemibogen B (B4.3, Prøv selv) linker direkte til den gamle
`kemi-b-filer/b5.1_eksperiment_dnph_tollens.html`, så den gamle flyttes
først til arkivet, når bogens link er rettet og bogen er bygget og lagt ud.

## Papirkortet (7. nov. 2026)

Kortet er det lyse papirkort fra start (se Fælles krav i `../README.md`):
`../faelles/papirkort.css` og `../faelles/papirkort.js` er indlæst, og
`<body class="papirkort">`. Efter et rigtigt svar bliver kortet på
spørgsmålet: svaret er grønt, forklaringen står under svarene, og Næste står,
hvor Indsend svar stod. Mens reaktionen med DNPH kører, har kortet kun en
kort tekst og ingen knapper (`skjulIndsend` og `skjulHint`). Kortets grønne
knap går altid fremad; Begynd forfra står i panelet.

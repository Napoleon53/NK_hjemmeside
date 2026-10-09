# sc6.4 Addition og plastik

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.
Der er ingen Kemichael, og der står ingen tekst nederst i scenen: al tekst
står på ét kort øverst midt i scenen, som i `sc7.5_staerke_og_svage_syrer`,
og den gule hintknap sidder på kortet.

Den er bygget fra bunden og afløser ingen gammel animation. Den er i menuen
som nr. 4 i `samling_c6.html` fra 9. oktober 2026. Den hører til afsnit 6.4 i
Kemibogen (Alkener og addition).

## Bestillingen (9. oktober 2026)

Brugeren fik samme dag seks forslag til animationer, Kemibogen til kemi C
mangler, og bestilte dette: "kan du lave en animation til kemibogen" med
forslaget sat ind:

> Fane 1: trækker brom, hydrogen eller vand hen til dobbeltbindingen i ethen
> og ser den åbne sig og give ét produkt. Fane 2: ryster et glas bromvand med
> et ukendt carbonhydrid og afgør, om det er mættet eller umættet. Fane 3:
> sætter ethenmolekyler sammen til en kæde af polyethen. Hvorfor: Emnet har
> kun "Umættet fedt?", som er af den gamle type, og polymerisation findes
> ikke i nogen animation. Ulempe: Den skal holdes fri af Byg et fedtstof
> (hærdning) og forsøget Substitution i benzin.

1. **Pointen:** En dobbeltbinding kan åbne sig, så hvert af de to
   carbonatomer får en ledig plads. Sætter to atomer sig på, er det en
   addition med ét produkt; sætter nabomolekyler sig på, bliver det til
   plastik.
2. **Afløser intet.** Udgangspunktet er Kemibogens afsnit 6.4 og dens tre
   figurer (addition af brom til ethen som strukturformler, testen med
   bromvand i reagensglas, og polyethen med ét felt for hvert
   ethenmolekyle) og opgaverne 6.4.5 til 6.4.7 og 6.4.mad.2.
3. **Naboerne:** `c6.7` "Umættet fedt?" (nr. 6 i menuen) ejer bromvand på
   fedtstoffer og at tælle dråber. `sc6.6_fedtstoffer` ejer fedtsyrer, knæk
   og hærdning; derfor er der ingen fedtstoffer her, og addition af
   hydrogen vises kun på ethen og propen. `v2/superlab/sc6.8_substitution`
   ejer bromvand og hexan i lys og mørke, HBr og substitutionens gang;
   derfor er der hverken lampe, folie eller pH-papir her, og substitution
   nævnes kun med én sætning i teorien. `sc6.2` ejer navne og zigzagformler,
   og tegnebrættet tegner molekyler.
4. **Loftet:** tre faner, 16 opgaver (6 + 5 + 5). Fane 1: tre molekyler
   (ethen, ethan, propen) og tre små molekyler (brom, hydrogen, vand). Fane
   2: fem glas og én lup med seks molekyler og fire brommolekyler. Fane 3:
   højst 8 ethenmolekyler i kæden og seks løse.
5. **Layoutet:** scene plus panel. Øverst i scenen kortet med al tekst,
   under det tingene.

Stop-listen er overholdt: der hældes ikke, glassene står klar med bromvand
og carbonhydrid i fra start i hver sin klods, og der er hverken affald,
uheld eller et forløb trin for trin. Et glas rystes med et klik eller ved at
tage fat i det.

### Mønsteret fulgte med undervejs

Mens animationen blev bygget, gav brugeren fire tilbagemeldinger på
`sc7.5_staerke_og_svage_syrer`, og de gælder også her:

* Opgaven, spørgsmålene og svarene står på ét kort øverst i scenen, ikke i
  panelet.
* Forklaringen til det rigtige svar og knappen Næste opgave står på det
  grønne kort.
* Intet er indforstået: hver tekst nævner selv det molekyle, det glas eller
  den kæde, den handler om, og det får en rolig gul ring i scenen (`om` i
  `js/data.js`).
* Al tekst er samlet over animationen: der er ingen statuslinje nederst.
  Hint, forklaringen til et forkert svar og hintknappen er kortets nederste
  række.

`js/fane.js` og grundlaget i `css/stil.css` er taget fra sc7.5. Ændres
mønsteret dér, hentes de to filer derfra igen. Det, der er rettet i
`fane.js` her, er nøglen til browserens hukommelse (`nk-sc6.4-`) og
tegningen på gætkortet (`figur`).

### Valg, brugeren ikke har taget stilling til

* **De fem væsker på fane 2** har alle seks carbonatomer: hex-1-en, hexan,
  cyclohexen, cyclohexan og benzen. Forslaget sagde kun "et ukendt
  carbonhydrid". Cyclohexan er med, fordi formlen C₆H₁₂ ligner en alkens,
  og benzen, fordi bogen siger, at benzen ikke affarver bromvand.
* **Ethan og propen på fane 1.** Forslaget nævnte kun ethen. Ethan viser,
  at intet kan sætte sig på uden en dobbeltbinding, og propen træner
  opgave 6.4.5 (læg atomerne sammen).
* **Zoom ud og fryseposen på fane 3**, og at brom ikke kan sætte sig på
  kæden (opgave 6.4.mad.2).
* **Fane 2 har ingen knap til et nyt glas.** Tasten R og et klik på
  opgaven i listen stiller et friskt glas frem.

## Fane 1: Addition (`#addition`)

Midt i scenen ligger et molekyle som strukturformel med grundstoffernes
bogstaver, som i bogens figur. På hylden nederst ligger de små molekyler.
Eleven trækker et af dem hen til dobbeltbindingen (et klik på det virker
også): det svæver hen over de to carbonatomer, dobbeltbindingen åbner sig,
to gule, stiplede cirkler viser de ledige pladser, og molekylets to dele
sætter sig på. Under produktet kommer navnet og reaktionsskemaet, og
panelet husker skemaerne. Seks opgaver:

1. **Brom på ethen.** Et gæt først (ét stof, to stoffer eller ingenting).
   Så trækkes brom hen til dobbeltbindingen.
2. **Fire bindinger.** To spørgsmål om 1,2-dibromethan: dobbeltbindingen er
   blevet til en enkeltbinding, og hvert carbonatom har stadig fire
   bindinger.
3. **Hydrogen.** Hydrogen kommer på hylden. Produktet er ethan: et umættet
   stof er blevet mættet.
4. **Vand.** Vand kommer på hylden. Det sætter sig på som H og OH og giver
   ethanol.
5. **Ethan.** Et gæt først. Brom svæver hen over ethan, ryster ("ingen
   ledig plads") og kommer tilbage til hylden.
6. **Propen.** Brom på propen, og formlen for produktet (C₃H₆Br₂).

Bruger eleven et andet molekyle end det, opgaven beder om, sker additionen
alligevel, og kortet siger, hvad produktet blev, og at Nyt molekyle lægger
et nyt klar. Et molekyle, der slippes på et produkt, kommer tilbage:
dobbeltbindingen er brugt.

## Fane 2: Bromvand (`#bromvand`)

Fem reagensglas med prop, A til E (`D.GLAS`). Nederst orange bromvand,
øverst et farveløst carbonhydrid. Et klik ryster glasset i halvandet
sekund; man kan også tage fat i det og ryste det med musen. Lagene blandes
og skiller igen. Med en alken er farven væk, ellers er den flyttet op i det
øverste lag.

* **Glas A, B og C** (hex-1-en, hexan, cyclohexen): eleven ryster, ser,
  svarer på, hvor brommet er blevet af, og afgør, om stoffet er mættet
  eller umættet. Så får glasset sit navn, og luppen over glassene viser det
  øverste lag: seks molekyler som zigzagformler eller ringe og fire
  brommolekyler, der sætter sig på dobbeltbindingerne eller bliver ved med
  at drive rundt.
* **Glas D og E** (cyclohexan og benzen) har fået deres etiket, og eleven
  gætter først med en tegning af ringen på kortet. Cyclohexan har samme
  formel som hex-1-en, men ingen dobbeltbinding. Benzen tegnes med tre
  dobbeltbindinger, men affarver ikke bromvand.

Det, eleven så, står alene på et grønt kort, før spørgsmålet kommer.
Panelet samler, hvad der skete i hvert glas.

## Fane 3: Plastik (`#plastik`)

1. **To ethenmolekyler.** Seks ethenmolekyler ligger i scenen. Eleven
   trækker et hen oven på et andet: dobbeltbindingerne åbner sig, og de to
   bliver til en kæde med en ledig plads i hver ende.
2. **Byg en kæde.** Flere sættes på i begge ender, til kæden er lavet af
   6. Hvert farvet felt kommer fra ét ethenmolekyle, som i bogens figur.
   Spørgsmålet: 12 C og 24 H.
3. **Zoom ud.** Kæden er nu et udsnit med prikker i enderne. Knappen Zoom
   ud viser en hel kæde som en lang, snoet streg med elevens stykke som en
   lille gul del, og en frysepose. Ordene polymer, polymerisation og
   polyethen.
4. **Fryseposen.** Et gæt først. Brom trækkes hen til kæden, ryster og
   kommer tilbage: der er kun enkeltbindinger.
5. **Udsnittet.** −CH₂−CH₂−, med de to typiske fejl som forkerte svar.

## Hjælpen

Kortet øverst har al tekst. Kortets nederste række viser hint (tre trin og
til sidst svaret), forklaringen til et forkert svar og svaret på et klik i
scenen, og dér sidder den gule hintknap. Det, der skal trækkes i eller
klikkes på, har en gul ring, der pulserer, og et lille gult skilt. Det, et
spørgsmål handler om, har en rolig gul ring. Et gæt står stort og gult, og
et klik på forsøget før gættet får kortet til at blinke. Teorien ligger bag
knappen Teori, rundvisningen bag `?`.

Påskeæg: tredje gang noget trækkes hen til ethan i opgave 5, og fjerde
klik på et glas, der er rystet.

## Modellen og forenklingerne

* **Additionen er tegnet som ét trin.** I virkeligheden går den over flere
  trin, hydrogen kræver en katalysator (fx nikkel), og vand kræver syre,
  varme og tryk. Intet af det er med; bogen har det heller ikke.
* **Atomerne går op.** `K.rig` bygger hver addition af alkenens og det
  lille molekyles atomer, og selvtesten tjekker, at produktet har præcis
  dem, og at hvert carbonatom har fire bindinger før og efter.
* **Vand på propen** giver propan-2-ol (OH på det midterste carbonatom),
  som er hovedproduktet. Reglen bag er ikke med, og ingen opgave spørger
  om det.
* **Bromvandet:** alt brom er brugt, når glasset med en alken er rystet
  færdigt (der er langt mere alken end brom), og produktet er
  dibromforbindelsen som i bogens skema. I virkeligheden dannes der også
  lidt bromhydrin i vandfasen.
* **Fordelingen** af brom mellem vand og carbonhydrid er valgt: 90 %
  flytter op (`K.FORDELING`). Brom opløses langt bedst i det upolære lag;
  tallet er ikke slået op.
* **Densiteterne** (hexan 0,66, hex-1-en 0,67, cyclohexan 0,78, cyclohexen
  0,81 og benzen 0,88 g/mL) er skrevet efter hukommelsen. De bruges kun
  til at vise, at alle fem væsker ligger øverst.
* **Lys er ikke med.** Et glas med en alkan blegner ikke, hvor længe det
  end står. Substitutionen i lys er `sc6.8_substitution`.
* **Benzen** bruges ikke i skolens laboratorium. Glasset er kun en model,
  og det siger et klik på det.
* **Kæden** har en ledig plads i hver ende, mens den bygges, og der er
  ingen starter eller katalysator. Kæden er lige; rigtig polyethen har
  også sidegrene.
* **5000 ethenmolekyler** i den lange kæde er valgt (`K.LANG_KAEDE`).
  Bogen siger mange tusinde. Elevens stykke fylder den rigtige brøkdel af
  stregen, dog mindst to punkter.

## Filer

```
index.html          toplinje, de tre faner, teori og rundvisning
css/stil.css        grundlaget fra sc7.5 (scenekortet, listen, den gule
                    hjælpeknap) og nederst det, der er særligt her.
                    NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, tekst og lærred (som sc7.5)
js/kemi.js          modellen: K.STOF, K.REAGENS, K.PRODUKT, K.rig (en
                    addition som start og slut), K.VAESKE, K.brom og
                    K.kaede
js/data.js          opgaverne på de tre faner, de fem glas og teksterne
js/sprites.js       indlæser sprites/ uden fetch
js/tegning.js       strukturformler (T.molekyle), ledige pladser,
                    zigzagformler og ringe (T.skelet, T.skeletSVG), den
                    rolige ring, det gule skilt
js/glas.js          et reagensglas med to lag, rystning og farver
js/lup.js           luppen på fane 2: molekylerne og brommolekylerne
js/fane.js          det fælles fra sc7.5: scenekortet, listen, opgavernes
                    dele, hintknappen, musen
js/sim_addition.js  fane 1
js/sim_bromvand.js  fane 2
js/sim_plastik.js   fane 3
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur og tegneløkken
sprites/            reagensglas.svg og frysepose.svg
_sprites.html       viser de to sprites alene
_selvtest.html      udviklerværktøj, se nedenfor
```

Et nyt molekyle på fane 1 er én post i `K.STOF` (atomernes pladser før og
efter, og de to ledige pladser) og produkterne i `K.PRODUKT`. En ny væske på
fane 2 er én linje i `K.VAESKE`, et bogstav i `D.GLAS` og en tegning i
`T.skeletGeo`. En opgave er én post i `D.A_MAAL`, `D.B_MAAL` eller
`D.P_MAAL`.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>R</kbd> forfra ·
<kbd>H</kbd> rundvisning · <kbd>T</kbd> teori · <kbd>Esc</kbd> luk. Direkte
links: `#addition`, `#bromvand` og `#plastik`.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker, at
atomerne går op i alle seks additioner, at hvert carbonatom har fire
bindinger før og efter, at kun alkenerne affarver bromvand, at brommet
aldrig forsvinder i regnskabet, at luppen viser det, modellen siger, alle
16 opgaver (selv med mus og klik, med forkerte svar og med Vis svaret), at
startbilledet på hver fane kun viser det, første trin har brug for, at der
ikke står tekst nederst i scenen, at intet er indforstået, sproget og
layoutet fra 1100 × 620 til 1600 × 950 (kortets højde i alle dele af alle
opgaver, også med hvert hint og hvert forkert svar). Sidst kørt 9. oktober
2026: ALT OK (148 påstande).

## Menuen

I menuen fra 9. oktober 2026 (brugerens valg: som nr. 4 efter Tegnebræt, som
i Kemibogen):

* `kemi-c-filer/samling_c6.html`: knap nr. 4 med titlen "Addition og
  plastik". Link-koden er `data-emne="c6.addition"`. De fire knapper efter
  den (Byg et fedtstof, Umættet fedt?, Substitution i benzin og Fedt i
  chips) rykkede til nr. 5 til 8, men beholdt deres koder c6.4 til c6.7, så
  links, der er delt før, stadig åbner den samme animation.
* `FEEDBACK_EMNER` i `samling_alt.html` under C6 har de otte navne med de
  nye numre.
* Rækken i `../README.md` og punktet om link-koderne under Fælles opbygning.
* Kemibogen: boksen Prøv selv i `kapitler/6-4-alkener.qmd` linker til
  animationen.
